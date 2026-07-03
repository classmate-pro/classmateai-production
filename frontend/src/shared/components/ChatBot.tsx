import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Bot, X, Send, Minimize2, Maximize2, Zap, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  streaming?: boolean;
}

const SYSTEM_PROMPT = `You are NEXUS-AI, an advanced AI assistant for Nexus Student — a futuristic sci-fi student productivity platform set in the year 2056. You help students with:
- Academic questions across all subjects (math, science, literature, history, etc.)
- Study planning and time management
- Assignment help and explanations
- Research guidance
- Mental health and study stress tips
- Platform features and navigation

Your personality:
- Speak in a helpful, slightly futuristic tone (not over the top — professional but with occasional sci-fi flair)
- Be concise and clear — students are busy
- Use bullet points and structure when explaining complex topics
- Occasionally reference the "Nexus platform", "Synapse modules", or the current star date (2056) for flavor
- Always be encouraging and positive about the student's potential

Keep responses focused and helpful. Never break character.`;

const QUICK_PROMPTS = [
  { label: 'Study Plan', text: 'Help me create a study plan for my upcoming exams' },
  { label: 'Explain Concept', text: 'Explain a complex concept in simple terms' },
  { label: 'Assignment Help', text: 'I need help structuring my assignment' },
  { label: 'Reduce Stress', text: 'I\'m feeling overwhelmed. How do I manage study stress?' },
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'NEXUS-AI online. Star date 2056.06.23 // Synapse uplink stable.\n\nHello, Cadet! I\'m your AI study companion. Ask me anything — subjects, study plans, assignments, or just how to survive finals week. 🚀',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatHistoryRef = useRef<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, minimized]);

  // Track unread
  useEffect(() => {
    if (!open && messages.length > 1) {
      setUnread(prev => prev + 1);
    }
  }, [messages]);

  const clearUnread = () => setUnread(0);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', text: '', streaming: true }]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

      // Build chat history for context
      chatHistoryRef.current.push({ role: 'user', parts: [{ text: text.trim() }] });

      const response = await ai.models.generateContentStream({
        model: 'gemini-2.0-flash',
        contents: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: 'Understood. NEXUS-AI ready.' }] },
          ...chatHistoryRef.current,
        ],
      });

      let fullText = '';
      for await (const chunk of response) {
        const chunkText = chunk.text ?? '';
        fullText += chunkText;
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId ? { ...m, text: fullText, streaming: true } : m
          )
        );
      }

      // Mark streaming done
      setMessages(prev =>
        prev.map(m => (m.id === assistantId ? { ...m, streaming: false } : m))
      );

      chatHistoryRef.current.push({ role: 'model', parts: [{ text: fullText }] });
    } catch (err) {
      console.error('Gemini error:', err);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, text: '⚠️ Synapse link disrupted. Please check your API key or try again.', streaming: false }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    chatHistoryRef.current = [];
    setMessages([{
      id: 'welcome-reset',
      role: 'assistant',
      text: 'Session cleared. NEXUS-AI re-initialized. What can I help you with, Cadet?',
    }]);
  };

  const formatText = (text: string) => {
    // Simple markdown-like rendering
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-white">{line.slice(2, -2)}</p>;
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <div key={i} className="flex gap-2 items-start">
            <span className="text-cyan-400 mt-0.5 shrink-0">▸</span>
            <span>{line.slice(2)}</span>
          </div>
        );
      }
      if (line === '') return <div key={i} className="h-1.5" />;
      return <p key={i}>{line}</p>;
    });
  };

  return (
    <>
      {/* ── Floating toggle button ── */}
      <div className="fixed bottom-5 right-5 z-[200]">
        <AnimatePresence>
          {!open && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setOpen(true); clearUnread(); }}
              className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #00f0ff)',
                boxShadow: '0 0 30px rgba(0,240,255,0.4), 0 8px 32px rgba(0,0,0,0.5)',
              }}
              aria-label="Open AI Chat"
            >
              <Bot className="w-6 h-6 text-white" />
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-cyan-400" />
              {/* Unread badge */}
              {unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#020617]">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Chat window ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute bottom-0 right-0 flex flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
              style={{
                width: 'min(380px, 92vw)',
                height: minimized ? 'auto' : 'min(560px, 85vh)',
                background: 'rgba(5, 5, 18, 0.96)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 60px rgba(0,240,255,0.1), 0 24px 64px rgba(0,0,0,0.7)',
              }}
            >
              {/* ── Header ── */}
              <div
                className="flex items-center gap-3 px-4 py-3 border-b border-white/10 shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.35), rgba(0,240,255,0.12))' }}
              >
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#050512]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-white text-sm leading-none">NEXUS-AI</div>
                  <div className="font-mono text-[9px] text-cyan-400/80 uppercase tracking-widest mt-0.5">
                    {loading ? (
                      <span className="animate-pulse">Thinking...</span>
                    ) : 'Synapse Uplink Stable'}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleReset}
                    className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Reset conversation"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setMinimized(m => !m)}
                    className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={minimized ? 'Expand' : 'Minimize'}
                  >
                    {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ── Body (collapsed when minimized) ── */}
              <AnimatePresence>
                {!minimized && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col flex-1 min-h-0"
                  >
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0" style={{ scrollbarWidth: 'thin' }}>
                      {messages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          {/* Avatar */}
                          {msg.role === 'assistant' && (
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                          )}

                          {/* Bubble */}
                          <div
                            className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed font-sans ${
                              msg.role === 'user'
                                ? 'bg-gradient-to-br from-indigo-600 to-cyan-600 text-white rounded-tr-sm'
                                : 'bg-white/[0.06] border border-white/[0.08] text-slate-200 rounded-tl-sm'
                            }`}
                          >
                            <div className="space-y-0.5 text-[13px]">
                              {formatText(msg.text)}
                            </div>
                            {/* Streaming cursor */}
                            {msg.streaming && (
                              <span className="inline-block w-1.5 h-4 bg-cyan-400 ml-1 animate-pulse rounded-sm align-bottom" />
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Typing indicator */}
                      {loading && messages[messages.length - 1]?.text === '' && (
                        <div className="flex gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                            {[0, 1, 2].map(i => (
                              <span
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                                style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div ref={bottomRef} />
                    </div>

                    {/* Quick prompts */}
                    {messages.length <= 1 && (
                      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                        {QUICK_PROMPTS.map(q => (
                          <button
                            key={q.label}
                            onClick={() => sendMessage(q.text)}
                            className="text-[10px] font-mono px-2.5 py-1 rounded-full border border-cyan-500/25 text-cyan-400/80 hover:text-cyan-300 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all cursor-pointer uppercase tracking-wide"
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Input area */}
                    <div className="px-3 pb-3 pt-2 border-t border-white/[0.07] shrink-0">
                      <div className="flex gap-2 items-end">
                        <textarea
                          ref={inputRef}
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={loading}
                          placeholder="Ask NEXUS-AI anything…"
                          rows={1}
                          className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-600 font-sans focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all resize-none leading-relaxed disabled:opacity-50"
                          style={{ maxHeight: '100px' }}
                          onInput={e => {
                            const el = e.currentTarget;
                            el.style.height = 'auto';
                            el.style.height = Math.min(el.scrollHeight, 100) + 'px';
                          }}
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => sendMessage(input)}
                          disabled={loading || !input.trim()}
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg"
                          style={{
                            background: !loading && input.trim()
                              ? 'linear-gradient(135deg, #4f46e5, #00f0ff)'
                              : 'rgba(255,255,255,0.07)',
                          }}
                        >
                          <Send className="w-4 h-4 text-white" />
                        </motion.button>
                      </div>
                      <p className="font-mono text-[8px] text-slate-600 text-center mt-2 uppercase tracking-wider">
                        <Zap className="w-2.5 h-2.5 inline mr-1 text-cyan-500/50" />
                        Powered by Gemini AI · Press Enter to send
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
