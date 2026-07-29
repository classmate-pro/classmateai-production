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

const SYSTEM_PROMPT = `You are Classmate AI, an advanced but friendly AI study assistant. You help students with:
- Academic questions across all subjects (math, science, literature, history, etc.)
- Study planning and time management
- Assignment help and explanations
- Research guidance
- Mental health and study stress tips

Your personality:
- Speak in a helpful, warm, and encouraging tone.
- Be concise and clear — students are busy.
- Use bullet points and structure when explaining complex topics.
- Always be encouraging and positive about the student's potential.

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
      text: 'Hello! I\'m Classmate AI, your personal study companion. Ask me anything — subjects, study plans, assignments, or just how to survive finals week! 🚀',
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
          { role: 'model', parts: [{ text: 'Understood. Classmate AI ready.' }] },
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
            ? { ...m, text: '⚠️ Connection disrupted. Please check your API key or try again.', streaming: false }
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
      text: 'Session cleared! What can I help you with today?',
    }]);
  };

  const formatText = (text: string) => {
    // Simple markdown-like rendering
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-slate-900">{line.slice(2, -2)}</p>;
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <div key={i} className="flex gap-2 items-start">
            <span className="text-emerald-500 mt-0.5 shrink-0">▸</span>
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
              className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl cursor-pointer bg-gradient-to-r from-teal-700 to-emerald-500"
              aria-label="Open AI Chat"
            >
              <Bot className="w-6 h-6 text-white" />
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-emerald-400" />
              {/* Unread badge */}
              {unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
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
              className="absolute bottom-0 right-0 flex flex-col overflow-hidden rounded-2xl border border-slate-200 shadow-2xl bg-white"
              style={{
                width: 'min(380px, 92vw)',
                height: minimized ? 'auto' : 'min(560px, 85vh)',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
              }}
            >
              {/* ── Header ── */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-700 to-emerald-500 flex items-center justify-center shadow-sm">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 text-sm leading-none">Classmate AI</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {loading ? (
                      <span className="animate-pulse text-emerald-500">Typing...</span>
                    ) : 'Online'}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleReset}
                    className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title="Reset conversation"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setMinimized(m => !m)}
                    className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title={minimized ? 'Expand' : 'Minimize'}
                  >
                    {minimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
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
                    className="flex flex-col flex-1 min-h-0 bg-white"
                  >
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0" style={{ scrollbarWidth: 'thin' }}>
                      {messages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          {/* Avatar */}
                          {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-700 to-emerald-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                          )}

                          {/* Bubble */}
                          <div
                            className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-gradient-to-br from-teal-700 to-emerald-500 text-white rounded-tr-sm shadow-sm'
                                : 'bg-slate-100 border border-slate-200 text-slate-700 rounded-tl-sm'
                            }`}
                          >
                            <div className="space-y-0.5 text-[13px]">
                              {formatText(msg.text)}
                            </div>
                            {/* Streaming cursor */}
                            {msg.streaming && (
                              <span className="inline-block w-1.5 h-4 bg-emerald-500 ml-1 animate-pulse rounded-sm align-bottom" />
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Typing indicator */}
                      {loading && messages[messages.length - 1]?.text === '' && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-700 to-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                            {[0, 1, 2].map(i => (
                              <span
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-emerald-500"
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
                      <div className="px-4 pb-3 flex flex-wrap gap-2">
                        {QUICK_PROMPTS.map(q => (
                          <button
                            key={q.label}
                            onClick={() => sendMessage(q.text)}
                            className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer uppercase tracking-wider"
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Input area */}
                    <div className="px-4 pb-4 pt-3 border-t border-slate-100 shrink-0 bg-white">
                      <div className="flex gap-2 items-end">
                        <textarea
                          ref={inputRef}
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={loading}
                          placeholder="Ask Classmate AI anything…"
                          rows={1}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:bg-white focus:ring-1 focus:ring-emerald-400 transition-all resize-none leading-relaxed disabled:opacity-50"
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
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                          style={{
                            background: !loading && input.trim()
                              ? 'linear-gradient(135deg, #0f766e, #10b981)'
                              : '#f1f5f9',
                          }}
                        >
                          <Send className={`w-4 h-4 ${!loading && input.trim() ? 'text-white' : 'text-slate-400'}`} />
                        </motion.button>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 text-center mt-3 uppercase tracking-wider">
                        <Zap className="w-3 h-3 inline mr-1 text-amber-400" />
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
