import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  LogOut,
  Search, 
  Bell, 
  ChevronDown, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Download, 
  Globe, 
  Send,
  User,
  Plus,
  Trash2,
  Edit2,
  Menu,
  X,
  Sparkles,
  Bot,
  NotebookText,
  Folder,
  ChevronRight,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CoreSettings, AppPage } from '../../types';
import { isSuperAdmin } from '../../shared/auth';
import logoImg from '../../utils/IMG-20260703-WA0446-removebg-preview.png';
import caLogoIcon from '../../utils/ca-logo-icon.png';
import AdminManagementTab from './AdminManagementTab';
import BooksTab from './BooksTab';
import {
  uploadDocument,
  ingestNote,
  waitForDocumentReady,
  createChatSession,
  sendGeneralMessage,
  sendSessionMessage,
  listChatSessions,
  getChatSession,
  deleteChatSession,
  getDocument,
  ChatSource,
  ChatSessionResponse,
  DocumentStatus,
} from '../../shared/documentApi';
import { listFolders, listNotes, Folder as FolderRecord, Note as NoteRecord } from '../../shared/notesApi';
import NotesPage from '../notes/NotesPage';

/** Google Drive's multi-color triangle mark — used on the "From Google Drive" attach option. */
const GoogleDriveIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47" />
    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
  </svg>
);

// Live labels for each processing stage — shown in the composer while a
// document uploads/processes, so the status feels real-time rather than a
// single opaque "Processing…" spinner.
const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  pending: 'Queued for processing…',
  extracting: 'Extracting text (OCR)…',
  chunking: 'Splitting into chunks…',
  embedding: 'Generating embeddings…',
  indexing: 'Indexing for search…',
  ready: 'Ready',
  failed: 'Failed',
};

interface HudDashboardProps {
  settings: CoreSettings;
  setSettings: React.Dispatch<React.SetStateAction<CoreSettings>>;
  onNavigate?: (page: AppPage) => void;
}

type TabType = 'dashboard' | 'assistant' | 'notes' | 'memory' | 'admin' | 'books';

const TAB_LABELS: Record<TabType, string> = {
  dashboard: 'Dashboard',
  assistant: 'Assistant',
  notes: 'Notes',
  memory: 'Memory Shield',
  admin: 'Admin Management',
  books: 'Books',
};

interface MemoryTopic {
  id: string;
  topic: string;
  retention: number;
  dueIn: number;
  reviewCount: number;
  lastReviewed: string;
}

/* ─── Medha AI types ─────────────────────────────────────────────────────── */
interface MedhaMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  streaming?: boolean;
  agentId?: string;
  sources?: ChatSource[];
  // Present only on the attachment-card placeholder message pushed by
  // handleAttachDocument — rendered as a small file card in the stream
  // instead of a normal bubble, live-updated as processing progresses.
  docCard?: { name: string; status: DocumentStatus };
}

interface MedhaAttachedDocument {
  id: string;
  name: string;
  sessionId: string;
}

interface MedhaNote {
  id: string;
  topic: string;
  text: string;
  savedAt: string;
}

interface MedhaFlashCard {
  term: string;
  def: string;
}

interface MedhaQuizOption {
  letter: string;
  text: string;
}

interface MedhaQuizQuestion {
  q: string;
  opts: MedhaQuizOption[];
  correct: string;
  expl: string;
}

interface MedhaToolBlock {
  type: 'cards' | 'quiz';
  data: MedhaFlashCard[] | MedhaQuizQuestion[];
}

/* ─── Medha AI constants ─────────────────────────────────────────────────── */
const MEDHA_AGENTS = [
  {
    id: 'tutor',
    name: 'Study Tutor',
    desc: 'Friendly explanations with analogies',
    placeholder: 'Ask anything you\'re studying…',
    system: 'You are Classmate AI, a warm encouraging tutor. Explain topics step by step with everyday analogies. Structure answers clearly. End with a short "Key takeaway:" line.',
  },
  {
    id: 'math',
    name: 'Math Solver',
    desc: 'Step-by-step problem solving',
    placeholder: 'Type a math problem to solve step by step…',
    system: 'You are a math tutor. Solve problems showing EVERY step of working clearly, one step per line, explaining WHY each step is taken. State the final answer clearly as **Answer:**',
  },
  {
    id: 'exam',
    name: 'Exam Coach',
    desc: 'Model answers with marking tips',
    placeholder: 'Paste an exam question or topic…',
    system: 'You are an exam coach. Give concise model answers using keywords examiners look for, then add a short "Marking tips:" list explaining what earns marks.',
  },
  {
    id: 'essay',
    name: 'Essay Helper',
    desc: 'Structure, clarity, and academic voice',
    placeholder: 'Paste your essay or describe the topic…',
    system: "You are an academic writing coach. Help plan essay structure, improve clarity and grammar, suggest stronger phrasing. Encourage the student's own voice.",
  },
];

const MEDHA_QUICK_PROMPTS = [
  { label: 'Explain a topic', sub: 'With analogies & examples', text: 'Explain photosynthesis in a simple way with an everyday analogy.' },
  { label: 'Solve step-by-step', sub: 'Show all working', text: 'Solve x² - 5x + 6 = 0 step by step and explain each step.' },
  { label: 'Exam model answer', sub: 'With marking tips', text: 'Give a model answer for: "Explain the causes of World War 1" with marking tips.' },
  { label: 'Memory trick', sub: 'Make it unforgettable', text: "Explain Newton's three laws of motion simply so I can remember them forever." },
];

/* ─── Relative time helper (for the chat history list) ──────────────────── */
function medhaTimeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/* ─── Medha markdown renderer ────────────────────────────────────────────── */
// Applies inline formatting (bold / italic / inline code) within a single line.
function medhaInline(line: string): string {
  return line
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:#f1f5f2;padding:1px 5px;border-radius:4px;font-size:13px">$1</code>');
}

type MedhaLine =
  | { kind: 'blank' }
  | { kind: 'heading'; level: number; content: string }
  | { kind: 'ordered'; num: string; content: string }
  | { kind: 'unordered'; content: string }
  | { kind: 'text'; raw: string };

function classifyMedhaLine(raw: string): MedhaLine {
  const trimmed = raw.trim();
  if (trimmed === '') return { kind: 'blank' };

  const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
  if (heading) return { kind: 'heading', level: heading[1].length, content: heading[2] };

  const ordered = trimmed.match(/^(\d+)\.\s+(.*)$/);
  if (ordered) return { kind: 'ordered', num: ordered[1], content: ordered[2] };

  const unordered = trimmed.match(/^[-*]\s+(.*)$/);
  if (unordered) return { kind: 'unordered', content: unordered[1] };

  return { kind: 'text', raw };
}

const MEDHA_HEADING_SIZES: Record<number, string> = { 1: '18px', 2: '16.5px', 3: '15px', 4: '14px', 5: '13.5px', 6: '13px' };

// Walks the text line-by-line (not blank-line-separated blocks) so a heading
// immediately followed by list items — with no blank line between them,
// which real AI output does constantly — still renders as a heading plus a
// list instead of falling through as raw "#### ..." / "* ..." text. Runs of
// the same line type (consecutive list items, consecutive plain-text lines)
// are grouped into one list/paragraph so wrapped sentences still read as
// continuous text instead of disconnected fragments.
function renderMedhaMarkdown(text: string): React.ReactNode {
  const rawLines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < rawLines.length) {
    const parsed = classifyMedhaLine(rawLines[i]);

    if (parsed.kind === 'blank') {
      i++;
      continue;
    }

    if (parsed.kind === 'heading') {
      nodes.push(
        <p key={key++} style={{ fontWeight: 700, fontSize: MEDHA_HEADING_SIZES[parsed.level] || '15px', marginTop: nodes.length > 0 ? '16px' : 0, marginBottom: '6px' }}
          dangerouslySetInnerHTML={{ __html: medhaInline(parsed.content) }} />
      );
      i++;
      continue;
    }

    if (parsed.kind === 'ordered') {
      const items: { num: string; content: string }[] = [];
      while (i < rawLines.length) {
        const p = classifyMedhaLine(rawLines[i]);
        if (p.kind !== 'ordered') break;
        items.push({ num: p.num, content: p.content });
        i++;
      }
      nodes.push(
        <div key={key++} style={{ marginBottom: '10px' }}>
          {items.map((it, li) => (
            <div key={li} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px' }}>
              <span style={{ color: '#12a06b', fontWeight: 700, flexShrink: 0, minWidth: '16px', fontSize: '13px' }}>{it.num}.</span>
              <span style={{ lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: medhaInline(it.content) }} />
            </div>
          ))}
        </div>
      );
      continue;
    }

    if (parsed.kind === 'unordered') {
      const items: string[] = [];
      while (i < rawLines.length) {
        const p = classifyMedhaLine(rawLines[i]);
        if (p.kind !== 'unordered') break;
        items.push(p.content);
        i++;
      }
      nodes.push(
        <div key={key++} style={{ marginBottom: '10px' }}>
          {items.map((content, li) => (
            <div key={li} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px' }}>
              <span style={{ color: '#12a06b', flexShrink: 0, marginTop: '3px' }}>▸</span>
              <span style={{ lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: medhaInline(content) }} />
            </div>
          ))}
        </div>
      );
      continue;
    }

    // Plain text — gather consecutive text lines into one flowing paragraph
    // (soft breaks preserved as <br/>) instead of separate mini-paragraphs.
    const textLines: string[] = [];
    while (i < rawLines.length) {
      const p = classifyMedhaLine(rawLines[i]);
      if (p.kind !== 'text') break;
      textLines.push(p.raw);
      i++;
    }
    nodes.push(
      <p key={key++} style={{ marginBottom: '10px', lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: textLines.map(medhaInline).join('<br/>') }} />
    );
  }

  return nodes;
}

/* ─── MedhaFlipCard sub-component ───────────────────────────────────────── */
function MedhaFlipCard({ term, def }: { term: string; def: string; key?: React.Key }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className={`medha-fcard${flipped ? ' flipped' : ''}`} onClick={() => setFlipped(f => !f)}>
      <div className="medha-fcard-in">
        <div className="medha-fface front">
          <span>{term}</span>
          <span style={{ fontSize: '10px', fontWeight: 500, opacity: .75, marginTop: '6px', textTransform: 'uppercase', letterSpacing: '.03em' }}>TAP TO FLIP</span>
        </div>
        <div className="medha-fface back">{def}</div>
      </div>
    </div>
  );
}

/* ─── MedhaQuizScore sub-component ──────────────────────────────────────── */
function MedhaQuizScore({ questions, answers }: { questions: MedhaQuizQuestion[]; answers: Record<number, string> }) {
  const answered = Object.keys(answers).length;
  if (answered < questions.length) return <span style={{ fontSize: '11px', color: '#93a1ab', marginLeft: 'auto' }}>{answered}/{questions.length} answered</span>;
  const correct = questions.filter((q, i) => answers[i] === q.correct).length;
  const pct = Math.round((correct / questions.length) * 100);
  return <span style={{ fontSize: '11.5px', fontWeight: 600, marginLeft: 'auto', color: pct >= 70 ? '#16a34a' : '#dc2626', background: pct >= 70 ? '#eaf7ef' : '#fdeeee', padding: '2px 9px', borderRadius: '100px', border: `1px solid ${pct >= 70 ? '#bfe6cc' : '#f1a9a9'}` }}>{correct}/{questions.length} correct · {pct}%</span>;
}


export default function HudDashboard({ settings, setSettings, onNavigate }: HudDashboardProps) {
  // A pending notes share link (see App.tsx's ?shared= handling) means the
  // student just followed a share link — jump straight to the Notes tab so
  // NotesPage's own effect can consume the token instead of landing on the
  // generic dashboard tab first.
  // Super admins get a different tab set (Dashboard, Assistant, Admin
  // Management, Books) — no personal Notes/Memory Shield, since those are a
  // student's own study data. Decided once from the JWT's role claim, which
  // doesn't change for the life of a session.
  const [isAdmin] = useState(() => isSuperAdmin());
  const [activeTab, setActiveTab] = useState<TabType>(() =>
    localStorage.getItem('pendingShareToken') ? 'notes' : 'dashboard'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('Eng (US)');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Memory Shield state
  const [memoryTopics, setMemoryTopics] = useState<MemoryTopic[]>([
    { id: '1', topic: 'Newton\'s Laws of Motion', retention: 72, dueIn: -1, reviewCount: 3, lastReviewed: 'Yesterday' },
    { id: '2', topic: 'Photosynthesis Process', retention: 45, dueIn: 0, reviewCount: 1, lastReviewed: '3 days ago' },
    { id: '3', topic: 'Quadratic Equations', retention: 88, dueIn: 4, reviewCount: 6, lastReviewed: 'Today' },
    { id: '4', topic: 'World War I Causes', retention: 33, dueIn: -2, reviewCount: 1, lastReviewed: '5 days ago' },
  ]);
  const [memoryReviewing, setMemoryReviewing] = useState<string | null>(null);

  const overdueCount = memoryTopics.filter(t => t.dueIn <= 0).length;

  const handleMemoryReview = (id: string) => {
    setMemoryTopics(prev => prev.map(t =>
      t.id === id ? { ...t, retention: Math.min(100, t.retention + 12), dueIn: 3, reviewCount: t.reviewCount + 1, lastReviewed: 'Just now' } : t
    ));
    setMemoryReviewing(null);
    triggerToast('✅ Topic reviewed! Retention boosted.');
  };

  const handleAddMemoryTopic = (topic: string) => {
    const existing = memoryTopics.find(t => t.topic.toLowerCase().includes(topic.toLowerCase().slice(0, 15)));
    if (!existing) {
      setMemoryTopics(prev => [{ id: Date.now().toString(), topic, retention: 60, dueIn: 1, reviewCount: 0, lastReviewed: 'Just now' }, ...prev]);
    }
  };

  const [assistantMessages, setAssistantMessages] = useState<MedhaMessage[]>([]);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantTyping, setAssistantTyping] = useState(false);
  const [assistantAgentId, setAssistantAgentId] = useState('tutor');
  const [assistantAgentMenuOpen, setAssistantAgentMenuOpen] = useState(false);
  const [assistantNotes, setAssistantNotes] = useState<MedhaNote[]>([]);
  const [assistantNotesOpen, setAssistantNotesOpen] = useState(false);
  const [assistantSavedIds, setAssistantSavedIds] = useState<Set<string>>(new Set());
  const [assistantCopiedIds, setAssistantCopiedIds] = useState<Set<string>>(new Set());
  const [assistantToolBlocks, setAssistantToolBlocks] = useState<Record<string, MedhaToolBlock>>({});
  const [assistantQuizAnswers, setAssistantQuizAnswers] = useState<Record<string, Record<number, string>>>({});
  const [attachedDocument, setAttachedDocument] = useState<MedhaAttachedDocument | null>(null);
  const [documentUploading, setDocumentUploading] = useState(false);
  // "Attach from Notes" picker — lets a student browse their Notes folder
  // tree (same Drive-style navigation as the Notes tab) and pick an
  // already-uploaded note instead of only a fresh local file.
  // Single "Attach" button opens a small menu to choose the source: device,
  // Notes, or Google Drive (Drive isn't wired up yet — shows a toast).
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [notePickerOpen, setNotePickerOpen] = useState(false);
  const [pickerPath, setPickerPath] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'Notes' }]);
  const [pickerFolders, setPickerFolders] = useState<FolderRecord[]>([]);
  const [pickerNotes, setPickerNotes] = useState<NoteRecord[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  // Claude-style chat history — sessions are persisted server-side (auto-titled
  // from the first message) and fetched here so past conversations survive reloads.
  const [chatSessions, setChatSessions] = useState<ChatSessionResponse[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const assistantBottomRef = useRef<HTMLDivElement>(null);
  const assistantInputRef = useRef<HTMLTextAreaElement>(null);
  const assistantFileInputRef = useRef<HTMLInputElement>(null);
  const assistantSessionIds = useRef<Record<string, string>>({});
  const assistantAgent = MEDHA_AGENTS.find(a => a.id === assistantAgentId) ?? MEDHA_AGENTS[0];

  useEffect(() => { assistantBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [assistantMessages, assistantToolBlocks]);

  // Load the user's chat history once on mount, Claude-style — sessions are
  // stored server-side (chat_sessions table) so they survive page reloads.
  const loadChatSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const sessions = await listChatSessions();
      setChatSessions(sessions);
    } catch {
      // Non-fatal — history panel just shows empty/stale until next load.
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => { loadChatSessions(); }, [loadChatSessions]);

  // Load the current picker folder's subfolders + notes — re-runs whenever
  // the picker opens or the student drills into/back out of a subfolder.
  useEffect(() => {
    if (!notePickerOpen) return;
    const currentFolderId = pickerPath[pickerPath.length - 1].id;
    setPickerLoading(true);
    Promise.all([
      listFolders(currentFolderId),
      currentFolderId ? listNotes(currentFolderId) : Promise.resolve([] as NoteRecord[]),
    ])
      .then(([{ folders }, notes]) => {
        setPickerFolders(folders);
        setPickerNotes(notes.filter(n => n.status === 'ready'));
      })
      .catch(() => {
        setPickerFolders([]);
        setPickerNotes([]);
      })
      .finally(() => setPickerLoading(false));
  }, [notePickerOpen, pickerPath]);

  const openPickerFolder = (folder: FolderRecord) => {
    setPickerPath(prev => [...prev, { id: folder.id, name: folder.name }]);
  };

  const goToPickerBreadcrumb = (index: number) => {
    setPickerPath(prev => prev.slice(0, index + 1));
  };

  const handleNewChat = () => {
    assistantSessionIds.current = {};
    setAttachedDocument(null);
    setAssistantMessages([]);
    setAssistantToolBlocks({});
    setAssistantQuizAnswers({});
    setActiveSessionId(null);
    setHistoryOpen(false);
  };

  const handleSelectSession = async (session: ChatSessionResponse) => {
    setHistoryOpen(false);
    try {
      const full = await getChatSession(session.id);
      const messages: MedhaMessage[] = full.messages.map(m => ({
        id: m.id,
        role: m.role,
        text: m.content,
      }));
      setAssistantMessages(messages);
      setAssistantToolBlocks({});
      setAssistantQuizAnswers({});
      setActiveSessionId(full.id);

      if (full.session_type === 'document' && full.document_id) {
        let name = 'Attached document';
        try {
          const doc = await getDocument(full.document_id);
          name = doc.original_filename;
        } catch {
          // Keep the generic fallback name if the document lookup fails.
        }
        setAttachedDocument({ id: full.document_id, name, sessionId: full.id });
      } else {
        setAttachedDocument(null);
        assistantSessionIds.current[assistantAgentId] = full.id;
      }
    } catch {
      triggerToast('Could not load that conversation.');
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteChatSession(sessionId);
      setChatSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) handleNewChat();
    } catch {
      triggerToast('Could not delete that conversation.');
    }
  };

  // Handle textarea height auto-adjust
  useEffect(() => {
    const el = assistantInputRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 280) + 'px';
    }
  }, [assistantInput]);

  // Reveals a full response progressively so replies still feel "live" even
  // though the Document AI service returns the whole answer in one shot.
  const revealAssistantText = async (aiId: string, full: string) => {
    if (!full) {
      setAssistantMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: '', streaming: false } : m));
      return;
    }
    const step = Math.max(3, Math.round(full.length / 70));
    for (let i = step; i < full.length; i += step) {
      setAssistantMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: full.slice(0, i), streaming: true } : m));
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    setAssistantMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: full, streaming: false } : m));
  };

  const handleSendMedhaMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || assistantTyping) return;
    const userMsg: MedhaMessage = { id: Date.now().toString(), role: 'user', text: trimmed };
    setAssistantMessages(prev => [...prev, userMsg]);
    setAssistantInput('');
    setAssistantTyping(true);
    const aiId = (Date.now() + 1).toString();
    setAssistantMessages(prev => [...prev, { id: aiId, role: 'assistant', text: '', streaming: true, agentId: assistantAgentId }]);
    try {
      if (attachedDocument) {
        const res = await sendSessionMessage(attachedDocument.sessionId, trimmed);
        setActiveSessionId(res.session_id);
        await revealAssistantText(aiId, res.answer);
        if (res.sources?.length) {
          setAssistantMessages(prev => prev.map(m => m.id === aiId ? { ...m, sources: res.sources } : m));
        }
      } else {
        const existingSessionId = assistantSessionIds.current[assistantAgentId] ?? null;
        // Prime the persona only on the first turn of a session — the backend
        // keeps prior turns, so later messages don't need it repeated.
        const question = existingSessionId
          ? trimmed
          : `${assistantAgent.system}\n\n---\n\nStudent's message: ${trimmed}`;
        const res = await sendGeneralMessage(question, existingSessionId);
        assistantSessionIds.current[assistantAgentId] = res.session_id;
        setActiveSessionId(res.session_id);
        await revealAssistantText(aiId, res.answer);
      }
      // Auto-track topic in Memory Shield
      const topicLine = trimmed.split(' ').slice(0, 6).join(' ');
      handleAddMemoryTopic(topicLine);
      // Refresh the history list so the (auto-titled) session shows up / bubbles to the top
      loadChatSessions();
    } catch (err: any) {
      const text = err?.response?.status === 401
        ? '⚠️ Your session has expired. Please sign in again.'
        : '⚠️ Error connecting to the AI service. Please try again.';
      setAssistantMessages(prev => prev.map(m => m.id === aiId ? { ...m, text, streaming: false } : m));
    } finally { setAssistantTyping(false); }
  }, [assistantTyping, assistantAgent, assistantAgentId, attachedDocument, loadChatSessions]);

  /**
   * Shared tail end of attaching a document — whether it came from a fresh
   * local upload or an existing note: poll until processing finishes, open
   * a chat session against it, and drop a confirmation message.
   */
  const finalizeDocumentAttachment = async (
    docId: string,
    updateCard: (status: DocumentStatus) => void
  ) => {
    const ready = await waitForDocumentReady(docId, { onStatus: (d) => updateCard(d.status) });
    if (ready.status === 'failed') {
      throw new Error(ready.error_message || 'Document processing failed.');
    }
    const session = await createChatSession(ready.id);
    setAttachedDocument({ id: ready.id, name: ready.original_filename, sessionId: session.id });
    setActiveSessionId(session.id);
    setAssistantMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: `📄 **${ready.original_filename}** is ready. Ask me anything about it.`,
    }]);
    loadChatSessions();
  };

  const handleAttachDocument = async (file: File) => {
    setDocumentUploading(true);
    // Attachment card lives in the message stream (not the composer) — pushed
    // once up front, then live-updated in place as processing progresses.
    const cardId = Date.now().toString();
    setAssistantMessages(prev => [...prev, { id: cardId, role: 'user', text: '', docCard: { name: file.name, status: 'pending' } }]);

    const updateCard = (status: DocumentStatus) => {
      setAssistantMessages(prev => prev.map(m => m.id === cardId ? { ...m, docCard: { name: file.name, status } } : m));
    };

    try {
      const doc = await uploadDocument(file);
      updateCard(doc.status);
      await finalizeDocumentAttachment(doc.id, updateCard);
    } catch (err: any) {
      updateCard('failed');
      const reason = err?.message ? `\n\n${err.message}` : '';
      setAssistantMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: `⚠️ Could not process that document.${reason}`,
      }]);
    } finally {
      setDocumentUploading(false);
    }
  };

  /** Same flow as handleAttachDocument, but for a note already sitting in the Notes tab. */
  const handleAttachNote = async (note: NoteRecord) => {
    setNotePickerOpen(false);
    setDocumentUploading(true);
    const cardId = Date.now().toString();
    setAssistantMessages(prev => [...prev, { id: cardId, role: 'user', text: '', docCard: { name: note.original_filename, status: 'pending' } }]);

    const updateCard = (status: DocumentStatus) => {
      setAssistantMessages(prev => prev.map(m => m.id === cardId ? { ...m, docCard: { name: note.original_filename, status } } : m));
    };

    try {
      const doc = await ingestNote(note.id);
      updateCard(doc.status);
      await finalizeDocumentAttachment(doc.id, updateCard);
    } catch (err: any) {
      updateCard('failed');
      const reason = err?.response?.data?.message || err?.message;
      setAssistantMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: `⚠️ Could not attach that note.${reason ? `\n\n${reason}` : ''}`,
      }]);
    } finally {
      setDocumentUploading(false);
    }
  };

  const handleDetachDocument = () => setAttachedDocument(null);

  const handleAssistantSave = (msg: MedhaMessage) => {
    if (assistantSavedIds.has(msg.id)) return;
    const topic = msg.text.split('\n')[0].slice(0, 60).replace(/^#+\s*/, '') || 'Note';
    setAssistantNotes(prev => [{ id: msg.id, topic, text: msg.text, savedAt: new Date().toLocaleTimeString() }, ...prev]);
    setAssistantSavedIds(prev => new Set([...prev, msg.id]));
  };

  const handleAssistantCopy = async (msg: MedhaMessage) => {
    await navigator.clipboard.writeText(msg.text);
    setAssistantCopiedIds(prev => new Set([...prev, msg.id]));
    setTimeout(() => setAssistantCopiedIds(prev => { const n = new Set(prev); n.delete(msg.id); return n; }), 2000);
  };

  const handleAssistantFlashcards = async (msg: MedhaMessage) => {
    if (assistantToolBlocks[msg.id]) { setAssistantToolBlocks(prev => { const n = { ...prev }; delete n[msg.id]; return n; }); return; }
    setAssistantTyping(true);
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || '' });
      const res = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: [{ role: 'user', parts: [{ text: `Extract 4-6 key flashcard pairs. Return ONLY valid JSON: [{"term":"...","def":"..."}]\n\n${msg.text}` }] }] });
      const raw = res.text?.match(/\[[\s\S]*\]/)?.[0] ?? '[]';
      setAssistantToolBlocks(prev => ({ ...prev, [msg.id]: { type: 'cards', data: JSON.parse(raw) } }));
    } catch { /* ignore */ } finally { setAssistantTyping(false); }
  };

  const handleAssistantQuiz = async (msg: MedhaMessage) => {
    if (assistantToolBlocks[msg.id]) { setAssistantToolBlocks(prev => { const n = { ...prev }; delete n[msg.id]; return n; }); return; }
    setAssistantTyping(true);
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || '' });
      const res = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: [{ role: 'user', parts: [{ text: `Create 3 MCQ quiz questions. Return ONLY valid JSON: [{"q":"...","opts":[{"letter":"A","text":"..."},...],"correct":"A","expl":"..."}]\n\n${msg.text}` }] }] });
      const raw = res.text?.match(/\[[\s\S]*\]/)?.[0] ?? '[]';
      setAssistantToolBlocks(prev => ({ ...prev, [msg.id]: { type: 'quiz', data: JSON.parse(raw) } }));
    } catch { /* ignore */ } finally { setAssistantTyping(false); }
  };

  // Mock state for the Dashboard tab's "Top Products" overview table
  const [products, setProducts] = useState([
    { id: '1', name: 'Cybernetic Neural Bridge', category: 'Hardware', price: '$249', stock: 18, sales: 85 },
    { id: '2', name: 'Quantum Data Decoder V3', category: 'Software', price: '$129', stock: 45, sales: 120 },
    { id: '3', name: 'Holographic Study Assistant', category: 'AI Tools', price: '$49', stock: 92, sales: 340 },
    { id: '4', name: 'Synapse Accelerator Pod', category: 'Hardware', price: '$599', stock: 8, sales: 32 },
  ]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendAssistantMessage = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMedhaMessage(assistantInput);
  };

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    if (onNavigate) {
      onNavigate(isAdmin ? 'admin-login' : 'home');
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-slate-50 text-slate-800 flex font-sans pt-0 overflow-hidden">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-24 right-6 z-[999] bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-3 rounded-xl border border-emerald-400/20 shadow-lg shadow-emerald-500/10 font-medium flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile sidebar backdrop ── */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden"
        />
      )}

      {/* ── Sidebar (White/Grey Theme with Emerald Accents) ── */}
      <aside
        className={`fixed lg:sticky top-0 left-0 w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 h-screen z-50 shadow-sm transition-transform duration-300 ease-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3 px-2 py-1 border-b border-slate-100 pb-4">
            <img
              src={logoImg}
              alt="Classmate AI"
              className="h-10 w-auto object-contain"
            />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'assistant', label: 'AI Assistant', icon: Sparkles },
              ...(isAdmin ? [{ id: 'admin', label: 'Admin Management', icon: ShieldCheck }] : []),
              { id: 'books', label: isAdmin ? 'Book Management' : 'Books', icon: BookOpen },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as TabType); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium relative group cursor-pointer"
                  style={{
                    backgroundColor: isActive ? '#10b981' : 'transparent',
                    color: isActive ? '#ffffff' : '#64748b',
                    boxShadow: isActive ? '0 4px 12px rgba(16,185,129,0.2)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#f1f5f9';
                      e.currentTarget.style.color = '#0f172a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#64748b';
                    }
                  }}
                >
                  <Icon 
                    className="w-4 h-4 transition-transform group-hover:scale-110" 
                    style={{ color: isActive ? '#ffffff' : '#94a3b8' }} 
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active-indicator" 
                      className="absolute right-2 w-1.5 h-6 rounded-full bg-white"
                    />
                  )}
                </button>
              );
            })}

            {/* ── Notes + Memory Shield: student-only, hidden for super_admin ── */}
            {!isAdmin && (
            <>
            <button
              onClick={() => { setActiveTab('notes'); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium relative group cursor-pointer"
              style={{
                backgroundColor: activeTab === 'notes' ? '#10b981' : 'transparent',
                color: activeTab === 'notes' ? '#ffffff' : '#64748b',
                boxShadow: activeTab === 'notes' ? '0 4px 12px rgba(16,185,129,0.2)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'notes') { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'notes') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }
              }}
            >
              <NotebookText
                className="w-4 h-4 transition-transform group-hover:scale-110"
                style={{ color: activeTab === 'notes' ? '#ffffff' : '#94a3b8' }}
              />
              <span>Notes</span>
              {activeTab === 'notes' && (
                <motion.div layoutId="sidebar-active-indicator" className="absolute right-2 w-1.5 h-6 rounded-full bg-white" />
              )}
            </button>

            {/* ── Memory Shield ── */}
            <button
              onClick={() => { setActiveTab('memory'); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium relative group cursor-pointer"
              style={{
                backgroundColor: activeTab === 'memory' ? '#10b981' : 'transparent',
                color: activeTab === 'memory' ? '#ffffff' : '#64748b',
                boxShadow: activeTab === 'memory' ? '0 4px 12px rgba(16,185,129,0.2)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'memory') { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'memory') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }
              }}
            >
              {/* Shield icon */}
              <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" style={{ color: activeTab === 'memory' ? '#ffffff' : '#94a3b8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l8 3v6c0 5-3.4 8.6-8 11-4.6-2.4-8-6-8-11V5l8-3z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <span>Memory Shield</span>
              {overdueCount > 0 && (
                <span style={{ marginLeft: 'auto', minWidth: '18px', height: '18px', padding: '0 5px', background: activeTab === 'memory' ? 'rgba(255,255,255,.3)' : '#dc2626', color: '#fff', fontSize: '10px', fontWeight: 700, borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {overdueCount}
                </span>
              )}
              {activeTab === 'memory' && (
                <motion.div layoutId="sidebar-active-indicator" className="absolute right-2 w-1.5 h-6 rounded-full bg-white" />
              )}
            </button>
            </>
            )}
          </nav>
        </div>

        {/* Sidebar Footer / Sign Out */}
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer group"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Workspace Content ── */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 w-full">
        
        {/* Top Control Bar */}
        <header className="border-b border-slate-200 bg-white px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-sm gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-display font-extrabold text-lg sm:text-2xl tracking-tight text-slate-800 flex items-center gap-2 truncate">
              {TAB_LABELS[activeTab]}
            </h1>
            <span className="h-6 w-px bg-slate-200 hidden md:block" />
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search metrics, reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-1.5 text-xs w-64 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Language Selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <span>🇺🇸</span>
                <span>{language}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-xl bg-white border border-slate-200 shadow-xl p-1 z-50">
                  {['Eng (US)', 'Español', 'Français'].map(lang => (
                    <button 
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setLangDropdownOpen(false);
                        triggerToast(`Language switched to ${lang}`);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button 
              onClick={() => triggerToast('No new notifications')}
              className="relative p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-700 hover:border-emerald-500/30 transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-50 rounded-full" />
            </button>

            {/* User Account Info */}
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 text-left border border-slate-200 hover:border-emerald-500/30 bg-slate-50 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700 text-xs">
                  M
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-slate-700 leading-none">Musliq</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-0.5">Admin</p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-xl p-1 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-semibold text-slate-800">Musliq Malik</p>
                    <p className="text-[10px] text-slate-400">musliq@classmate.ai</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab content area */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* ── TAB: DASHBOARD ── */}
              {activeTab === 'dashboard' && (
                <>
                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* Today's Sales Card */}
                    <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="font-display font-semibold text-lg text-slate-800">Today's Sales</h3>
                          <p className="text-xs text-slate-400">Sales Summary</p>
                        </div>
                        <button 
                          onClick={() => triggerToast('Sales exported successfully!')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-500/30 hover:bg-slate-50 text-xs text-slate-600 hover:text-slate-800 transition-all cursor-pointer font-medium"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { title: '$1k', label: 'Total Sales', change: '+8% from yesterday', color: 'rose', val: 8 },
                          { title: '300', label: 'Total Order', change: '+5% from yesterday', color: 'amber', val: 5 },
                          { title: '5', label: 'Product Sold', change: '+1.2% from yesterday', color: 'emerald', val: 1.2 },
                          { title: '8', label: 'New Customers', change: '0.5% from yesterday', color: 'purple', val: 0.5 },
                        ].map((stat, idx) => {
                          const borderColors = {
                            rose: 'border-rose-100 bg-rose-50/50 text-rose-700 hover:bg-rose-50',
                            amber: 'border-amber-100 bg-amber-50/50 text-amber-700 hover:bg-amber-50',
                            emerald: 'border-emerald-100 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50',
                            purple: 'border-purple-100 bg-purple-50/50 text-purple-700 hover:bg-purple-50'
                          };
                          const textColors = {
                            rose: 'text-rose-500',
                            amber: 'text-amber-500',
                            emerald: 'text-emerald-500',
                            purple: 'text-purple-500'
                          };
                          return (
                            <div 
                              key={idx}
                              className={`p-4 rounded-xl border transition-all duration-300 flex flex-col gap-1.5 ${borderColors[stat.color as keyof typeof borderColors]}`}
                            >
                              <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center border border-slate-100">
                                <span className={`text-xs font-bold ${textColors[stat.color as keyof typeof textColors]}`}>{stat.label[0]}</span>
                              </div>
                              <span className="font-display font-bold text-2xl text-slate-800 mt-1">{stat.title}</span>
                              <div>
                                <p className="text-xs font-medium text-slate-600">{stat.label}</p>
                                <p className="text-[9px] text-slate-400 mt-0.5">{stat.change}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Visitor Insights (Line Chart Card) */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-display font-semibold text-base text-slate-800">Visitor Insights</h3>
                          <p className="text-xs text-slate-400">Total traffic tracking</p>
                        </div>
                      </div>

                      {/* Custom SVG Line Chart */}
                      <div className="w-full h-36 relative">
                        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                          {/* Grid Lines */}
                          <line x1="0" y1="10" x2="100" y2="10" stroke="#f1f5f9" strokeWidth="0.5" />
                          <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="0.5" />
                          <line x1="0" y1="30" x2="100" y2="30" stroke="#f1f5f9" strokeWidth="0.5" />

                          {/* Loyal Customers - purple */}
                          <path d="M 0 35 Q 20 10, 40 25 T 80 15 T 100 20" fill="none" stroke="#8b5cf6" strokeWidth="1.2" strokeLinecap="round" />
                          
                          {/* New Customers - red/rose */}
                          <path d="M 0 30 Q 30 5, 60 20 T 100 10" fill="none" stroke="#ec4899" strokeWidth="1.2" strokeLinecap="round" />

                          {/* Unique Customers - green */}
                          <path d="M 0 25 Q 25 35, 50 15 T 100 22" fill="none" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                      </div>

                      {/* Legend */}
                      <div className="flex justify-between items-center gap-2 mt-4 text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#8b5cf6]" /> Loyal</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ec4899]" /> New</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10b981]" /> Unique</span>
                      </div>
                    </div>
                  </div>

                  {/* Second Charts Row Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Total Revenue (Bar Chart) */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                      <div className="mb-4">
                        <h3 className="font-display font-semibold text-base text-slate-800">Total Revenue</h3>
                        <p className="text-xs text-slate-400">Online vs Offline sales</p>
                      </div>

                      {/* Bar graph */}
                      <div className="w-full h-36 flex items-end gap-3 px-2">
                        {[
                          { day: 'Mon', on: 65, off: 40 },
                          { day: 'Tue', on: 80, off: 55 },
                          { day: 'Wed', on: 45, off: 85 },
                          { day: 'Thu', on: 70, off: 60 },
                          { day: 'Fri', on: 90, off: 75 },
                          { day: 'Sat', on: 50, off: 35 },
                          { day: 'Sun', on: 85, off: 65 },
                        ].map((data, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                            <div className="flex gap-1 w-full items-end justify-center h-28">
                              <div style={{ height: `${data.on}%` }} className="w-1.5 bg-emerald rounded-t-sm" />
                              <div style={{ height: `${data.off}%` }} className="w-1.5 bg-slate-300 rounded-t-sm" />
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono mt-1">{data.day}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-center gap-4 mt-4 text-[10px] font-mono text-slate-500">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald rounded-sm" /> Online</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-300 rounded-sm" /> Offline</span>
                      </div>
                    </div>

                    {/* Customer Satisfaction */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                      <div className="mb-4">
                        <h3 className="font-display font-semibold text-base text-slate-800">Customer Satisfaction</h3>
                        <p className="text-xs text-slate-400">User experience metrics</p>
                      </div>

                      {/* Area Curve SVG */}
                      <div className="w-full h-36 relative">
                        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="emeraldFade" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                            </linearGradient>
                          </defs>
                          <path d="M 0 35 Q 20 15, 40 28 T 80 18 T 100 25 L 100 40 L 0 40 Z" fill="url(#emeraldFade)" />
                          <path d="M 0 35 Q 20 15, 40 28 T 80 18 T 100 25" fill="none" stroke="#10b981" strokeWidth="1.2" />

                          <path d="M 0 30 Q 30 18, 60 32 T 100 15" fill="none" stroke="#64748b" strokeWidth="0.8" strokeDasharray="1.5" />
                        </svg>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-4 border-t border-slate-100 pt-3">
                        <div className="text-center">
                          <p className="text-slate-400">Last Month</p>
                          <p className="font-semibold text-emerald-600">$3,004</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400">This Month</p>
                          <p className="font-semibold text-slate-850">$4,504</p>
                        </div>
                      </div>
                    </div>

                    {/* Target vs Reality */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                      <div className="mb-4">
                        <h3 className="font-display font-semibold text-base text-slate-800">Target vs Reality</h3>
                        <p className="text-xs text-slate-400">Comparative goals analysis</p>
                      </div>

                      {/* Vertical bars comparison */}
                      <div className="w-full h-36 flex items-end gap-2 px-1">
                        {[
                          { month: 'Jan', target: 50, reality: 40 },
                          { month: 'Feb', target: 60, reality: 55 },
                          { month: 'Mar', target: 80, reality: 65 },
                          { month: 'Apr', target: 70, reality: 72 },
                          { month: 'May', target: 85, reality: 80 },
                          { month: 'Jun', target: 90, reality: 82 },
                          { month: 'Jul', target: 95, reality: 92 },
                        ].map((m, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                            <div className="relative w-full h-24 flex items-end justify-center">
                              {/* Stacked or side bars */}
                              <div style={{ height: `${m.target}%` }} className="absolute bottom-0 w-2.5 bg-emerald-100 rounded-md" />
                              <div style={{ height: `${m.reality}%` }} className="absolute bottom-0 w-2.5 bg-emerald rounded-md shadow-sm" />
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono mt-1">{m.month}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-4 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-emerald-100 rounded-sm" />
                          <div>
                            <p className="text-[9px] text-slate-400">Reality Sales</p>
                            <p className="font-bold text-slate-700 text-xs">8,823</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-emerald rounded-sm" />
                          <div>
                            <p className="text-[9px] text-slate-400">Target Sales</p>
                            <p className="font-bold text-slate-700 text-xs">12,122</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row - Top Products & Sales Map */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Top Products Table */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                      <h3 className="font-display font-semibold text-base text-slate-800 mb-4">Top Products</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                          <thead className="text-[10px] text-slate-400 uppercase font-semibold border-b border-slate-100">
                            <tr>
                              <th className="py-2.5">Name</th>
                              <th className="py-2.5">Category</th>
                              <th className="py-2.5">Price</th>
                              <th className="py-2.5 text-right">Sales</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {products.slice(0, 3).map((prod) => (
                              <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 font-medium text-slate-800">{prod.name}</td>
                                <td className="py-3 text-slate-400">{prod.category}</td>
                                <td className="py-3 font-mono text-emerald-600">{prod.price}</td>
                                <td className="py-3 text-right font-mono font-semibold text-slate-700">{prod.sales}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Sales Mapping by Country */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                      <div className="mb-4">
                        <h3 className="font-display font-semibold text-base text-slate-800">Sales Mapping by Country</h3>
                        <p className="text-xs text-slate-400">Global market penetration</p>
                      </div>

                      <div className="space-y-3.5">
                        {[
                          { country: 'United States', flag: '🇺🇸', percent: 64, val: '$14.2k' },
                          { country: 'Germany', flag: '🇩🇪', percent: 45, val: '$8.4k' },
                          { country: 'Japan', flag: '🇯🇵', percent: 38, val: '$6.1k' },
                        ].map((c, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-medium text-slate-700 flex items-center gap-1.5"><span>{c.flag}</span>{c.country}</span>
                              <span className="font-mono text-slate-400">{c.val}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div style={{ width: `${c.percent}%` }} className="h-full bg-emerald rounded-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── TAB: NOTES ── */}
              {activeTab === 'notes' && <NotesPage />}

              {/* ── TAB: ADMIN MANAGEMENT (super_admin only) ── */}
              {activeTab === 'admin' && isAdmin && <AdminManagementTab />}

              {/* ── TAB: BOOKS (all users; add/edit/delete/publish only for super_admin) ── */}
              {activeTab === 'books' && <BooksTab isAdmin={isAdmin} />}

              {/* ── TAB: AI ASSISTANT (Medha Design) ── */}
              {activeTab === 'assistant' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', minHeight: '520px', fontFamily: "'Inter', system-ui, sans-serif", position: 'relative', maxWidth: '100%', overflowX: 'hidden' }}>
                  <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Inter:wght@400;500;600&display=swap');
                    .medha-chat * { box-sizing: border-box; }
                    @keyframes medha-rise { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
                    @keyframes medha-pulse { 0%,100%{transform:scale(.8);opacity:.5} 50%{transform:scale(1.15);opacity:1} }
                    @keyframes medha-breathe { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(.6);opacity:.5} }
                    @keyframes medha-shimmer { to{background-position:-200% 0} }
                    @keyframes medha-ping { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(2.2);opacity:0} }
                    .medha-rise { animation: medha-rise .3s cubic-bezier(.2,.7,.2,1); }
                    .medha-pulse-orb { width:10px;height:10px;border-radius:50%;background:linear-gradient(140deg,#12a06b,#2fc98c);animation:medha-pulse 1.2s ease-in-out infinite; }
                    .medha-shimmer { background:linear-gradient(90deg,#93a1ab 25%,#51606c 50%,#93a1ab 75%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:medha-shimmer 1.6s linear infinite; }
                    .medha-fcard { perspective:900px;height:110px;cursor:pointer; }
                    .medha-fcard-in { position:relative;width:100%;height:100%;transition:transform .55s cubic-bezier(.3,.8,.3,1);transform-style:preserve-3d; }
                    .medha-fcard.flipped .medha-fcard-in { transform:rotateY(180deg); }
                    .medha-fface { position:absolute;inset:0;backface-visibility:hidden;border-radius:12px;padding:12px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;font-size:12.5px;line-height:1.4; }
                    .medha-fface.front { background:linear-gradient(150deg,#12a06b,#2fc98c);color:#fff;font-weight:600; }
                    .medha-fface.back { background:#fff;border:1.5px solid #2fc98c;color:#12202e;transform:rotateY(180deg);font-size:12px; }
                    .medha-qopt { text-align:left;font-family:inherit;font-size:13px;line-height:1.4;border:1px solid #e8eeea;background:#fcfdfc;padding:8px 12px;border-radius:10px;cursor:pointer;transition:all .13s;display:flex;align-items:center;gap:8px;width:100%;margin-bottom:6px; }
                    .medha-qopt:hover:not(:disabled) { border-color:#b9e3d0;background:#e9f7f1; }
                    .medha-qopt:disabled { cursor:default; }
                    .medha-qopt.correct { border-color:#86d8a5;background:#eaf7ef; }
                    .medha-qopt.wrong { border-color:#f1a9a9;background:#fdeeee; }
                    .medha-sbtn { display:inline-flex;align-items:center;gap:6px;border:1px solid #e8eeea;background:#fff;font-family:inherit;font-size:12px;font-weight:600;color:#51606c;padding:5px 11px;border-radius:100px;cursor:pointer;transition:all .14s;box-shadow:0 1px 2px rgba(20,22,35,.05); }
                    .medha-sbtn:hover:not(:disabled) { border-color:#b9e3d0;color:#12a06b;background:#e9f7f1; }
                    .medha-sbtn.saved { color:#16a34a;background:#eaf7ef;border-color:#bfe6cc; }
                    .medha-sbtn.copied { color:#16a34a; }
                    .medha-sbtn:disabled { opacity:.5;cursor:wait; }
                    .medha-agent-item:hover { background:#f1f5f2; }
                    .medha-attach-item:hover { background:#f7faf8; }
                    .medha-hitem:hover { border-color:#b9e3d0 !important; box-shadow:0 2px 8px rgba(18,160,107,.08); }
                    .medha-hdelete { opacity:0; transition:opacity .14s,color .14s; }
                    .medha-hitem:hover .medha-hdelete { opacity:1; }
                    .medha-hdelete:hover { color:#dc2626 !important; }
                    .medha-quickgrid { display:grid; grid-template-columns:repeat(2, 1fr); gap:11px; text-align:left; }
                    @media (max-width: 560px) { .medha-quickgrid { grid-template-columns:1fr; } }
                    @media (max-width: 560px) { .medha-badges-row { gap:6px; } }
                  `}</style>

                  {/* ── Header ── */}
                  <div className="medha-chat" style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 20px', background:'rgba(252,253,252,.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid #e8eeea', flexShrink:0, borderRadius:'16px 16px 0 0', border:'1px solid #e8eeea', borderBottomLeftRadius:0, borderBottomRightRadius:0 }}>
                    {assistantTyping && (
                      <span className="medha-shimmer" style={{ fontSize:'13.5px', fontWeight:600, letterSpacing:'.01em' }}>Thinking…</span>
                    )}
                    <div style={{ flex:1 }} />
                    {/* History btn */}
                    <button onClick={() => { setHistoryOpen(true); loadChatSessions(); }} style={{ display:'flex', alignItems:'center', gap:'5px', border:'1px solid #e8eeea', background:'#fff', color:'#51606c', fontSize:'12px', fontWeight:500, padding:'5px 11px', borderRadius:'100px', cursor:'pointer' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>
                      History
                    </button>
                    {/* Notes btn */}
                    <button onClick={() => setAssistantNotesOpen(true)} style={{ display:'flex', alignItems:'center', gap:'5px', position:'relative', border:'1px solid #e8eeea', background:'#fff', color:'#51606c', fontSize:'12px', fontWeight:500, padding:'5px 11px', borderRadius:'100px', cursor:'pointer' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h13l3 3v13H4z"/><path d="M8 15h8M8 18h5"/></svg>
                      Notes
                      {assistantNotes.length > 0 && <span style={{ position:'absolute', top:'-6px', right:'-6px', minWidth:'16px', height:'16px', padding:'0 3px', background:'#12a06b', color:'#fff', fontSize:'9.5px', fontWeight:700, borderRadius:'100px', display:'flex', alignItems:'center', justifyContent:'center' }}>{assistantNotes.length}</span>}
                    </button>
                    {/* New chat */}
                    <button onClick={handleNewChat} style={{ width:'30px', height:'30px', border:'none', background:'#f1f5f2', borderRadius:'9px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#93a1ab' }} title="New chat">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 2.6-6.4L3 3v5h5"/></svg>
                    </button>
                  </div>

                  {/* ── Stream ── */}
                  <div className="medha-chat" style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'18px 20px 10px', display:'flex', flexDirection:'column', gap:'6px', background:'#fcfdfc', borderLeft:'1px solid #e8eeea', borderRight:'1px solid #e8eeea' }}>

                    {/* Welcome Screen */}
                    {assistantMessages.length === 0 && (
                      <div className="medha-rise" style={{ maxWidth: '680px', width: '100%', boxSizing: 'border-box', margin: 'auto', textAlign: 'center', padding: 'clamp(20px, 6vw, 40px) clamp(12px, 4vw, 20px)', position: 'relative' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '0 auto 24px', maxWidth: '100%', boxSizing: 'border-box', fontSize: 'clamp(9.5px, 2.6vw, 11.5px)', fontWeight: 600, letterSpacing: '.1em', color: '#51606c', background: '#fff', border: '1px solid #e8eeea', padding: '9px 16px', borderRadius: '100px', boxShadow: '0 1px 2px rgba(20,22,35,.05)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#12a06b', flexShrink: 0 }}><path d="M12 2l1.9 4.9L19 8l-4.1 2.1L12 15l-2.9-4.9L5 8l5.1-1.1L12 2zm6 11l1 2.6L22 17l-2.9 1.1L18 21l-1.1-2.9L14 17l2.9-1.1L18 13z"/></svg>
                          <span>MEDHA — THE POWER OF INTELLECT</span>
                        </div>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(23px, 6.5vw, 32px)', fontWeight: 600, letterSpacing: '-.01em', marginBottom: '12px', lineHeight: 1.18, color: '#12202e' }}>
                          Padho Smart. <span style={{ display: 'block', color: '#12a06b', fontStyle: 'italic' }}>Jeeto Har Exam.</span>
                        </h1>
                        <p style={{ color: '#51606c', fontSize: '15px', lineHeight: 1.6, marginBottom: '14px' }}>
                          Medha doesn't just answer — it remembers what you learned and brings it back for review right before your brain forgets it. Study once, remember for months.
                        </p>
                        <div className="medha-badges-row" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#51606c', background: '#fff', border: '1px solid #e8eeea', padding: '7px 13px', borderRadius: '100px', boxShadow: '0 1px 2px rgba(20,22,35,.05)' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#12a06b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 3v6c0 5-3.4 8.6-8 11-4.6-2.4-8-6-8-11V5l8-3z"/><path d="M9 12l2 2 4-4"/></svg>
                            Beats the forgetting curve
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#51606c', background: '#fff', border: '1px solid #e8eeea', padding: '7px 13px', borderRadius: '100px', boxShadow: '0 1px 2px rgba(20,22,35,.05)' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#12a06b" strokeWidth="2" strokeLinecap="round"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M8 6V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/></svg>
                            Auto flashcards
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#51606c', background: '#fff', border: '1px solid #e8eeea', padding: '7px 13px', borderRadius: '100px', boxShadow: '0 1px 2px rgba(20,22,35,.05)' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#12a06b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.2 2.4c-.7.2-.7 1-.7 1.6M12 17h.01"/></svg>
                            Instant quizzes
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#51606c', background: '#fff', border: '1px solid #e8eeea', padding: '7px 13px', borderRadius: '100px', boxShadow: '0 1px 2px rgba(20,22,35,.05)' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#12a06b" strokeWidth="2" strokeLinecap="round"><path d="M4 4h13l3 3v13H4z"/><path d="M8 15h8M8 18h5"/></svg>
                            Study notes
                          </span>
                        </div>
                        <div className="medha-quickgrid">
                          {MEDHA_QUICK_PROMPTS.map(q => (
                            <button key={q.label} onClick={() => handleSendMedhaMessage(q.text)}
                              style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', border: '1px solid #e8eeea', background: '#fff', padding: '15px 16px', borderRadius: '16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13.5px', lineHeight: 1.45, transition: 'all .16s', boxShadow: '0 1px 2px rgba(20,22,35,.05)', outline: 'none' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = '#b9e3d0'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(18,160,107,.10)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8eeea'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(20,22,35,.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#e9f7f1', color: '#12a06b', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 9L12 4 2 9l10 5 10-5z"/></svg>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ fontWeight: 550, color: '#12202e', display: 'block' }}>{q.label}</span>
                                <span style={{ color: '#93a1ab', fontSize: '12.5px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.sub}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    

                    <div style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
                    {assistantMessages.map(msg => (
                      <div key={msg.id} className="medha-rise">
                        {msg.docCard ? (
                          <div style={{ display:'flex', justifyContent:'flex-end', padding:'6px 0' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'#fff', border:'1px solid #e8eeea', borderRadius:'14px', padding:'10px 14px', boxShadow:'0 1px 3px rgba(20,22,35,.05)', maxWidth:'82%' }}>
                              <div style={{ width:'34px', height:'34px', borderRadius:'8px', background:'#fdeeee', color:'#dc2626', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h13l3 3v13H4z"/><path d="M8 15h8M8 18h5"/></svg>
                              </div>
                              <div style={{ minWidth:0 }}>
                                <p style={{ fontSize:'12.5px', fontWeight:600, color:'#12202e', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'220px' }}>{msg.docCard.name}</p>
                                <p style={{ fontSize:'11px', margin:'2px 0 0', fontWeight:500, color: msg.docCard.status === 'failed' ? '#dc2626' : msg.docCard.status === 'ready' ? '#12a06b' : '#93a1ab' }}>
                                  {DOCUMENT_STATUS_LABELS[msg.docCard.status]}
                                </p>
                              </div>
                              {msg.docCard.status !== 'ready' && msg.docCard.status !== 'failed' && <div className="medha-pulse-orb" style={{ flexShrink:0 }} />}
                              {msg.docCard.status === 'ready' && attachedDocument?.name === msg.docCard.name && (
                                <button onClick={handleDetachDocument} title="Detach document" style={{ border:'none', background:'none', cursor:'pointer', color:'#93a1ab', padding:'2px', display:'flex', flexShrink:0 }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                </button>
                              )}
                            </div>
                          </div>
                        ) : msg.role === 'user' ? (
                          <div style={{ display:'flex', justifyContent:'flex-end', padding:'6px 0' }}>
                            <div style={{ background:'#f2f6f3', border:'1px solid #e8eeea', padding:'10px 16px', borderRadius:'18px', fontSize:'14.5px', lineHeight:1.6, maxWidth:'82%', whiteSpace:'pre-wrap', wordBreak:'break-word', color:'#12202e' }}>{msg.text}</div>
                          </div>
                        ) : (
                          <div style={{ padding:'6px 0 12px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'9px' }}>
                              <div style={{ width:'26px', height:'26px', borderRadius:'9px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                                <img src={caLogoIcon} alt="" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
                              </div>
                              <span style={{ fontSize:'13px', fontWeight:600, color:'#12202e' }}>Medha</span>
                            </div>
                            <div style={{ fontSize:'15px', lineHeight:1.75, color:'#12202e' }}>
                              {msg.streaming && msg.text === '' ? (
                                <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#93a1ab', fontSize:'13.5px' }}>
                                  <div className="medha-pulse-orb" />
                                  <span className="medha-shimmer">Thinking…</span>
                                </div>
                              ) : (
                                <>
                                  {renderMedhaMarkdown(msg.text)}
                                  {msg.streaming && <span style={{ display:'inline-block', width:'6px', height:'17px', background:'#12a06b', marginLeft:'3px', borderRadius:'2px', animation:'medha-pulse 1s ease-in-out infinite', verticalAlign:'bottom' }} />}
                                </>
                              )}
                            </div>
                            {!msg.streaming && msg.sources && msg.sources.length > 0 && (
                              <div style={{ marginTop:'10px', display:'flex', flexDirection:'column', gap:'6px' }}>
                                <span style={{ fontSize:'10.5px', fontWeight:600, color:'#93a1ab', textTransform:'uppercase', letterSpacing:'.05em' }}>Sources</span>
                                {msg.sources.map((src, si) => (
                                  <div key={si} style={{ display:'flex', gap:'8px', alignItems:'flex-start', border:'1px solid #e8eeea', background:'#fcfdfc', borderRadius:'10px', padding:'8px 10px' }}>
                                    <span style={{ fontSize:'10.5px', fontWeight:700, color:'#12a06b', flexShrink:0, background:'#e9f7f1', borderRadius:'6px', padding:'1px 6px' }}>#{src.chunk_index}</span>
                                    <span style={{ fontSize:'12px', color:'#51606c', lineHeight:1.5 }}>{src.text}</span>
                                    <span style={{ fontSize:'10px', color:'#93a1ab', marginLeft:'auto', flexShrink:0 }}>{Math.round(src.score * 100)}%</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {!msg.streaming && msg.text && (
                              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'12px' }}>
                                <button className={`medha-sbtn${assistantSavedIds.has(msg.id) ? ' saved' : ''}`} onClick={() => handleAssistantSave(msg)}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h13l3 3v13H4z"/></svg>
                                  {assistantSavedIds.has(msg.id) ? 'Saved ✓' : 'Save to Notes'}
                                </button>
                                <button className={`medha-sbtn${assistantCopiedIds.has(msg.id) ? ' copied' : ''}`} onClick={() => handleAssistantCopy(msg)}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
                                  {assistantCopiedIds.has(msg.id) ? 'Copied ✓' : 'Copy'}
                                </button>
                                <button className="medha-sbtn" onClick={() => handleAssistantFlashcards(msg)} disabled={assistantTyping}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M8 6V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/></svg>
                                  Flashcards
                                </button>
                                <button className="medha-sbtn" onClick={() => handleAssistantQuiz(msg)} disabled={assistantTyping}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.2 2.4c-.7.2-.7 1-.7 1.6M12 17h.01"/></svg>
                                  Quiz Me
                                </button>
                              </div>
                            )}
                            {/* Flashcards tool block */}
                            {assistantToolBlocks[msg.id]?.type === 'cards' && (
                              <div className="medha-rise" style={{ marginTop:'14px', border:'1px solid #e8eeea', borderRadius:'16px', background:'#fff', overflow:'hidden' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 14px', borderBottom:'1px solid #f1f5f2' }}>
                                  <div style={{ width:'24px', height:'24px', borderRadius:'8px', background:'#e9f7f1', color:'#12a06b', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="6" width="13" height="12" rx="2"/></svg>
                                  </div>
                                  <span style={{ fontSize:'13px', fontWeight:600 }}>Flashcards</span>
                                  <span style={{ fontSize:'11px', color:'#93a1ab', marginLeft:'auto' }}>Click to flip</span>
                                </div>
                                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'10px', padding:'12px' }}>
                                  {(assistantToolBlocks[msg.id].data as MedhaFlashCard[]).map((card, ci) => (
                                    <MedhaFlipCard key={ci} term={card.term} def={card.def} />
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Quiz tool block */}
                            {assistantToolBlocks[msg.id]?.type === 'quiz' && (
                              <div className="medha-rise" style={{ marginTop:'14px', border:'1px solid #e8eeea', borderRadius:'16px', background:'#fff', overflow:'hidden' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 14px', borderBottom:'1px solid #f1f5f2' }}>
                                  <div style={{ width:'24px', height:'24px', borderRadius:'8px', background:'#e9f7f1', color:'#12a06b', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.2 2.4c-.7.2-.7 1-.7 1.6M12 17h.01"/></svg>
                                  </div>
                                  <span style={{ fontSize:'13px', fontWeight:600 }}>Quick Quiz</span>
                                  <MedhaQuizScore questions={assistantToolBlocks[msg.id].data as MedhaQuizQuestion[]} answers={assistantQuizAnswers[msg.id] ?? {}} />
                                </div>
                                <div style={{ padding:'14px' }}>
                                  {(assistantToolBlocks[msg.id].data as MedhaQuizQuestion[]).map((q, qi) => {
                                    const ans = assistantQuizAnswers[msg.id]?.[qi];
                                    return (
                                      <div key={qi} style={{ marginBottom:'16px' }}>
                                        <p style={{ fontSize:'13.5px', fontWeight:600, marginBottom:'8px', lineHeight:1.5 }}><span style={{ color:'#12a06b', marginRight:'4px' }}>Q{qi+1}.</span>{q.q}</p>
                                        {q.opts.map(opt => {
                                          const chosen = ans === opt.letter;
                                          const correct = opt.letter === q.correct;
                                          const revealed = !!ans;
                                          return (
                                            <button key={opt.letter}
                                              className={`medha-qopt${revealed ? (correct ? ' correct' : chosen ? ' wrong' : '') : ''}`}
                                              disabled={revealed}
                                              onClick={() => setAssistantQuizAnswers(prev => ({ ...prev, [msg.id]: { ...(prev[msg.id] ?? {}), [qi]: opt.letter } }))}>
                                              <span style={{ width:'20px', height:'20px', borderRadius:'6px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background: revealed && correct ? '#16a34a' : revealed && chosen ? '#dc2626' : '#f1f5f2', border:`1px solid ${revealed && correct ? '#16a34a' : revealed && chosen ? '#dc2626' : '#e8eeea'}`, fontSize:'10px', fontWeight:700, color: revealed && (correct || chosen) ? '#fff' : '#93a1ab' }}>{opt.letter}</span>
                                              {opt.text}
                                            </button>
                                          );
                                        })}
                                        {ans && <p style={{ fontSize:'12px', color:'#51606c', background:'#fcf3e5', border:'1px solid #f3dfc0', borderRadius:'8px', padding:'7px 10px', marginTop:'4px', lineHeight:1.5 }}>{q.expl}</p>}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    </div>
                    <div ref={assistantBottomRef} />
                  </div>

                  {/* ── Composer ── */}
                  {/* sticky + bottom:0 pins it to the bottom of the nearest
                      scrolling ancestor (the <main> page shell), so it stays
                      visible even if that container scrolls — not just the
                      bottom of this flex column. */}
                  <div className="medha-chat" style={{ padding:'10px 16px 14px', background:'#fcfdfc', borderLeft:'1px solid #e8eeea', borderRight:'1px solid #e8eeea', borderBottom:'1px solid #e8eeea', borderRadius:'0 0 16px 16px', position:'sticky', bottom:0, zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', width:'100%' }}>
                    <div style={{ position:'absolute', left:0, right:0, top:'-28px', height:'28px', background:'linear-gradient(to top,#fcfdfc,transparent)', pointerEvents:'none' }} />
                    {/* Centered Composer Container */}
                    <div style={{ width: '100%', maxWidth: '640px', position: 'relative' }}>
                    {/* Agent selector menu */}
                    <AnimatePresence>
                      {assistantAgentMenuOpen && (
                        <motion.div initial={{ opacity:0, y:8, scale:.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:.97 }} transition={{ duration:.15 }}
                          style={{ position:'absolute', bottom:'calc(100% + 8px)', left:'16px', right:'16px', background:'#fff', border:'1px solid #e8eeea', borderRadius:'16px', boxShadow:'0 16px 48px -10px rgba(20,22,35,.20)', padding:'6px', zIndex:50 }}>
                          <p style={{ fontSize:'10.5px', fontWeight:600, color:'#93a1ab', textTransform:'uppercase', letterSpacing:'.05em', padding:'6px 10px 5px' }}>Choose an agent</p>
                          {MEDHA_AGENTS.map(a => (
                            <button key={a.id}
                              className="medha-agent-item"
                              onClick={() => {
                                // Each agent has its own backend session (keyed by
                                // agent id) — switching personas should start a
                                // visibly clean conversation to match, instead of
                                // appending the new agent's replies after the old
                                // agent's messages as if it were one continuous thread.
                                if (a.id !== assistantAgentId) {
                                  delete assistantSessionIds.current[a.id];
                                  setAssistantMessages([]);
                                  setAssistantToolBlocks({});
                                  setAssistantQuizAnswers({});
                                  setActiveSessionId(null);
                                }
                                setAssistantAgentId(a.id);
                                setAssistantAgentMenuOpen(false);
                              }}
                              style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'9px 10px', border:'none', borderRadius:'11px', background: assistantAgentId === a.id ? '#e9f7f1' : 'transparent', cursor:'pointer', textAlign:'left', fontFamily:'inherit', transition:'background .12s' }}>
                              <div style={{ width:'34px', height:'34px', borderRadius:'10px', background: assistantAgentId === a.id ? '#12a06b' : '#f1f5f2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={assistantAgentId === a.id ? '#fff' : '#93a1ab'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 9L12 4 2 9l10 5 10-5z"/></svg>
                              </div>
                              <div style={{ flex:1 }}>
                                <p style={{ fontSize:'13.5px', fontWeight:600, color:'#12202e', margin:0 }}>{a.name}</p>
                                <p style={{ fontSize:'12px', color:'#93a1ab', margin:'1px 0 0' }}>{a.desc}</p>
                              </div>
                              {assistantAgentId === a.id && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#12a06b" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {/* Attach-source menu (device / Notes / Google Drive) — anchored to this
                        outer wrapper, not the composer card below, since that card has
                        overflow:hidden for its rounded corners and would clip this dropdown. */}
                    <AnimatePresence>
                      {attachMenuOpen && (
                        <>
                          <div onClick={() => setAttachMenuOpen(false)} style={{ position:'fixed', inset:0, zIndex:40 }} />
                          <motion.div
                            initial={{ opacity:0, y:8, scale:.96 }}
                            animate={{ opacity:1, y:0, scale:1 }}
                            exit={{ opacity:0, y:8, scale:.96 }}
                            transition={{ duration:.15, ease:'easeOut' }}
                            style={{ position:'absolute', bottom:'calc(100% + 8px)', left:'14px', width:'234px', background:'#fff', border:'1px solid #e8eeea', borderRadius:'16px', boxShadow:'0 16px 48px -10px rgba(20,22,35,.20)', padding:'6px', zIndex:50 }}
                          >
                            <p style={{ fontSize:'10.5px', fontWeight:600, color:'#93a1ab', textTransform:'uppercase', letterSpacing:'.05em', padding:'6px 10px 5px', margin:0 }}>Attach a document</p>
                            <button
                              onClick={() => { setAttachMenuOpen(false); assistantFileInputRef.current?.click(); }}
                              className="medha-attach-item"
                              style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'9px 10px', border:'none', borderRadius:'11px', background:'transparent', cursor:'pointer', textAlign:'left', fontFamily:'inherit', transition:'background .12s' }}
                            >
                              <div style={{ width:'30px', height:'30px', borderRadius:'9px', background:'#f1f5f2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#51606c' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                              </div>
                              <span style={{ fontSize:'13px', fontWeight:600, color:'#12202e' }}>From your device</span>
                            </button>
                            <button
                              onClick={() => { setAttachMenuOpen(false); setPickerPath([{ id: null, name: 'Notes' }]); setNotePickerOpen(true); }}
                              className="medha-attach-item"
                              style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'9px 10px', border:'none', borderRadius:'11px', background:'transparent', cursor:'pointer', textAlign:'left', fontFamily:'inherit', transition:'background .12s' }}
                            >
                              <div style={{ width:'30px', height:'30px', borderRadius:'9px', background:'#eef8f2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#12a06b' }}>
                                <NotebookText size={14} />
                              </div>
                              <span style={{ fontSize:'13px', fontWeight:600, color:'#12202e' }}>From Notes</span>
                            </button>
                            <button
                              onClick={() => { setAttachMenuOpen(false); triggerToast('🔗 Google Drive isn\'t connected yet — coming soon!'); }}
                              className="medha-attach-item"
                              style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'9px 10px', border:'none', borderRadius:'11px', background:'transparent', cursor:'pointer', textAlign:'left', fontFamily:'inherit', transition:'background .12s' }}
                            >
                              <div style={{ width:'30px', height:'30px', borderRadius:'9px', background:'#f1f5f2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                <GoogleDriveIcon size={14} />
                              </div>
                              <span style={{ fontSize:'13px', fontWeight:600, color:'#12202e', flex:1 }}>Google Drive</span>
                              <span style={{ fontSize:'9px', fontWeight:700, color:'#93a1ab', background:'#f1f5f2', padding:'2px 6px', borderRadius:'100px', letterSpacing:'.03em' }}>SOON</span>
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                    <input
                      ref={assistantFileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      style={{ display:'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleAttachDocument(f); e.target.value = ''; }}
                    />
                    <div style={{ background:'#fff', border:'1.5px solid #12a06b', borderRadius:'22px', boxShadow:'0 10px 34px rgba(20,22,35,.06)', transition:'border-color .2s, box-shadow .2s', display:'flex', flexDirection:'column', overflow:'hidden' }}>
                      <textarea
                        ref={assistantInputRef}
                        value={assistantInput}
                        onChange={e => setAssistantInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMedhaMessage(assistantInput); } }}
                        disabled={assistantTyping || documentUploading}
                        placeholder={attachedDocument ? `Ask about ${attachedDocument.name}…` : assistantAgent.placeholder}
                        rows={1}
                        style={{ display:'block', width:'100%', border:'none', outline:'none', resize:'none', fontFamily:'inherit', fontSize:'15px', lineHeight:1.6, color:'#12202e', background:'transparent', padding:'16px 20px 8px', maxHeight:'280px', overflowY:'auto' }}
                      />
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px 12px 14px', gap:'8px', borderTop:'1px solid #f1f5f2', background:'#fff' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                          <button onClick={() => setAttachMenuOpen(o => !o)} disabled={documentUploading}
                            title="Attach a document"
                            style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'32px', height:'32px', border:'none', background: attachMenuOpen ? '#e9f7f1' : '#f1f5f2', borderRadius:'100px', cursor: documentUploading ? 'wait' : 'pointer', opacity: documentUploading ? .5 : 1, color: attachMenuOpen ? '#12a06b' : '#51606c', transition:'background .15s, color .15s' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                          </button>
                          {!attachedDocument && (
                            <button onClick={() => setAssistantAgentMenuOpen(m => !m)}
                              title="Choose an agent"
                              style={{ display:'inline-flex', alignItems:'center', gap:'7px', border:'none', background:'#f1f5f2', padding:'7px 14px', borderRadius:'100px', cursor:'pointer', fontFamily:'inherit', fontSize:'12.5px', fontWeight:550, color:'#12202e' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#12a06b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 9L12 4 2 9l10 5 10-5zM6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5"/></svg>
                              <span>{assistantAgent.name}</span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#93a1ab" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => handleSendMedhaMessage(assistantInput)}
                          disabled={assistantTyping || documentUploading || !assistantInput.trim()}
                          style={{ width:'36px', height:'36px', flexShrink:0, border:'none', borderRadius:'50%', background: (!assistantTyping && !documentUploading && assistantInput.trim()) ? '#12a06b' : '#e8eeea', display:'flex', alignItems:'center', justifyContent:'center', cursor: (!assistantTyping && !documentUploading && assistantInput.trim()) ? 'pointer' : 'not-allowed', opacity: (!assistantTyping && !documentUploading && assistantInput.trim()) ? 1 : .5, transition:'all .15s' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                        </button>
                      </div>
                    </div>
                    <p style={{ textAlign:'center', fontSize:'10.5px', color:'#93a1ab', marginTop:'7px', fontFamily:'inherit' }}>
                      <kbd style={{ fontFamily:'inherit', background:'#fff', border:'1px solid #e8eeea', borderRadius:'4px', padding:'1px 4px', fontSize:'9.5px' }}>Enter</kbd> to send · <kbd style={{ fontFamily:'inherit', background:'#fff', border:'1px solid #e8eeea', borderRadius:'4px', padding:'1px 4px', fontSize:'9.5px' }}>Shift</kbd>+<kbd style={{ fontFamily:'inherit', background:'#fff', border:'1px solid #e8eeea', borderRadius:'4px', padding:'1px 4px', fontSize:'9.5px' }}>Enter</kbd> for newline
                    </p>
                    </div>
                  </div>

                  {/* ── Attach-from-Notes picker overlay ── */}
                  <AnimatePresence>
                  {notePickerOpen && (
                    <motion.div
                      initial={{ opacity:0 }}
                      animate={{ opacity:1 }}
                      exit={{ opacity:0 }}
                      transition={{ duration:.18, ease:'easeOut' }}
                      onClick={() => setNotePickerOpen(false)}
                      style={{ position:'fixed', inset:0, background:'rgba(18,32,46,.30)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}
                    >
                      <motion.div
                        initial={{ opacity:0, y:16, scale:.96 }}
                        animate={{ opacity:1, y:0, scale:1 }}
                        exit={{ opacity:0, y:16, scale:.96 }}
                        transition={{ duration:.18, ease:'easeOut' }}
                        onClick={e => e.stopPropagation()}
                        style={{ width:'min(640px, 94vw)', maxHeight:'80vh', background:'#fff', borderRadius:'20px', boxShadow:'0 24px 70px rgba(20,22,35,.24)', display:'flex', flexDirection:'column', overflow:'hidden' }}
                      >
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 18px 10px', borderBottom:'1px solid #e8eeea' }}>
                          <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:600, fontSize:'15px', color:'#12202e', margin:0 }}>Attach from Notes</p>
                          <button onClick={() => setNotePickerOpen(false)} style={{ border:'none', background:'transparent', cursor:'pointer', color:'#93a1ab', display:'flex' }}>
                            <X size={16} />
                          </button>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'4px', padding:'10px 18px', flexWrap:'wrap' }}>
                          {pickerPath.map((crumb, i) => {
                            const isLast = i === pickerPath.length - 1;
                            return (
                              <React.Fragment key={crumb.id ?? 'root'}>
                                {i > 0 && <span style={{ color:'#c7d1cd', fontSize:'12.5px' }}>/</span>}
                                <button
                                  onClick={() => goToPickerBreadcrumb(i)}
                                  disabled={isLast}
                                  style={{ border:'none', background:'transparent', cursor: isLast ? 'default' : 'pointer', padding:0, fontFamily:'inherit', fontSize:'12.5px', fontWeight: isLast ? 700 : 500, color: isLast ? '#12202e' : '#93a1ab' }}
                                >
                                  {crumb.name}
                                </button>
                              </React.Fragment>
                            );
                          })}
                        </div>
                        <div style={{ overflowY:'auto', padding:'8px', flex:1 }}>
                          {pickerLoading ? (
                            <p style={{ textAlign:'center', color:'#93a1ab', fontSize:'13px', padding:'28px 0', margin:0 }}>Loading…</p>
                          ) : pickerFolders.length === 0 && pickerNotes.length === 0 ? (
                            <p style={{ textAlign:'center', color:'#93a1ab', fontSize:'13px', padding:'28px 12px', margin:0 }}>
                              This folder is empty.
                            </p>
                          ) : (
                            <>
                              {pickerFolders.map(folder => (
                                <button
                                  key={folder.id}
                                  onClick={() => openPickerFolder(folder)}
                                  style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'10px 12px', border:'none', borderRadius:'12px', background:'transparent', cursor:'pointer', textAlign:'left', fontFamily:'inherit' }}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#f7faf8'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                  <div style={{ width:'32px', height:'32px', borderRadius:'9px', background:'#eef8f2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#12a06b' }}>
                                    <Folder size={15} />
                                  </div>
                                  <p style={{ fontSize:'13px', fontWeight:600, color:'#12202e', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1, minWidth:0 }}>
                                    {folder.name}
                                  </p>
                                  <ChevronRight size={14} color="#93a1ab" style={{ flexShrink:0 }} />
                                </button>
                              ))}
                              {pickerNotes.map(note => (
                                <button
                                  key={note.id}
                                  onClick={() => handleAttachNote(note)}
                                  style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'10px 12px', border:'none', borderRadius:'12px', background:'transparent', cursor:'pointer', textAlign:'left', fontFamily:'inherit' }}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#f7faf8'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                  <div style={{ width:'32px', height:'32px', borderRadius:'9px', background:'#f1f5f2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#51606c' }}>
                                    <NotebookText size={15} />
                                  </div>
                                  <p style={{ fontSize:'13px', fontWeight:600, color:'#12202e', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1, minWidth:0 }}>
                                    {note.original_filename}
                                  </p>
                                </button>
                              ))}
                            </>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                  </AnimatePresence>

                  {/* ── History panel overlay ── */}
                  {historyOpen && (
                    <>
                      <div onClick={() => setHistoryOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(18,32,46,.30)', zIndex:300 }} />
                      <aside className="medha-chat" style={{ position:'fixed', top:0, right:0, bottom:0, width:'min(380px, 92vw)', background:'#fff', zIndex:301, boxShadow:'-14px 0 50px rgba(20,22,35,.16)', display:'flex', flexDirection:'column' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'16px 18px', borderBottom:'1px solid #e8eeea' }}>
                          <div style={{ width:'30px', height:'30px', borderRadius:'9px', background:'#e9f7f1', color:'#12a06b', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>
                          </div>
                          <div>
                            <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:600, fontSize:'15px', color:'#12202e', margin:0 }}>Chat History</p>
                            <p style={{ fontSize:'11.5px', color:'#93a1ab', margin:0 }}>{chatSessions.length === 0 ? 'No conversations yet' : `${chatSessions.length} conversation${chatSessions.length !== 1 ? 's' : ''}`}</p>
                          </div>
                          <button onClick={() => setHistoryOpen(false)} style={{ marginLeft:'auto', width:'28px', height:'28px', border:'none', background:'#f1f5f2', borderRadius:'8px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#93a1ab' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                          </button>
                        </div>
                        <div style={{ padding:'12px 16px 0' }}>
                          <button onClick={handleNewChat}
                            style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', border:'none', background:'#12a06b', color:'#fff', fontFamily:'inherit', fontSize:'13.5px', fontWeight:600, padding:'11px', borderRadius:'12px', cursor:'pointer', boxShadow:'0 3px 10px rgba(18,160,107,.35)' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                            New chat
                          </button>
                        </div>
                        <div style={{ flex:1, overflowY:'auto', padding:'14px 16px', display:'flex', flexDirection:'column', gap:'8px' }}>
                          {sessionsLoading && chatSessions.length === 0 ? (
                            <div style={{ margin:'auto', textAlign:'center', color:'#93a1ab', fontSize:'13px' }}>Loading…</div>
                          ) : chatSessions.length === 0 ? (
                            <div style={{ margin:'auto', textAlign:'center', color:'#93a1ab', fontSize:'13px', lineHeight:1.6 }}>
                              <p>No conversations yet.<br/>Start chatting and it'll show up here.</p>
                            </div>
                          ) : chatSessions.map(s => (
                            <div key={s.id} onClick={() => handleSelectSession(s)}
                              className="medha-hitem"
                              style={{
                                display:'flex', alignItems:'flex-start', gap:'10px', border:'1px solid', borderColor: s.id === activeSessionId ? '#b9e3d0' : '#e8eeea',
                                background: s.id === activeSessionId ? '#e9f7f1' : '#fcfdfc', borderRadius:'12px', padding:'11px 12px', cursor:'pointer', transition:'all .14s',
                              }}>
                              <div style={{ width:'26px', height:'26px', borderRadius:'8px', background: s.session_type === 'document' ? '#fff4e0' : '#eef2ff', color: s.session_type === 'document' ? '#c17b0a' : '#4f5fd1', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'1px' }}>
                                {s.session_type === 'document' ? (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h13l3 3v13H4z"/></svg>
                                ) : (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 1 1 6-14.5l2.5-1v3.5a8.4 8.4 0 0 1 0 3.5z"/></svg>
                                )}
                              </div>
                              <div style={{ flex:1, minWidth:0 }}>
                                <p style={{ fontSize:'13px', fontWeight:600, color:'#12202e', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.title || 'New conversation'}</p>
                                <p style={{ fontSize:'11px', color:'#93a1ab', margin:'2px 0 0' }}>{medhaTimeAgo(s.updated_at)}</p>
                              </div>
                              <button onClick={(e) => handleDeleteSession(s.id, e)} className="medha-hdelete"
                                style={{ border:'none', background:'none', cursor:'pointer', color:'#93a1ab', padding:'2px', display:'flex', flexShrink:0 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </aside>
                    </>
                  )}

                  {/* ── Notes panel overlay ── */}
                  {assistantNotesOpen && (
                    <>
                      <div onClick={() => setAssistantNotesOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(18,32,46,.30)', zIndex:300 }} />
                      <aside className="medha-chat" style={{ position:'fixed', top:0, right:0, bottom:0, width:'min(380px, 92vw)', background:'#fff', zIndex:301, boxShadow:'-14px 0 50px rgba(20,22,35,.16)', display:'flex', flexDirection:'column' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'16px 18px', borderBottom:'1px solid #e8eeea' }}>
                          <div style={{ width:'30px', height:'30px', borderRadius:'9px', background:'#e9f7f1', color:'#12a06b', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h13l3 3v13H4z"/><path d="M8 15h8M8 18h5"/></svg>
                          </div>
                          <div>
                            <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:600, fontSize:'15px', color:'#12202e', margin:0 }}>Study Notes</p>
                            <p style={{ fontSize:'11.5px', color:'#93a1ab', margin:0 }}>{assistantNotes.length === 0 ? 'Nothing saved yet' : `${assistantNotes.length} note${assistantNotes.length !== 1 ? 's' : ''}`}</p>
                          </div>
                          <button onClick={() => setAssistantNotesOpen(false)} style={{ marginLeft:'auto', width:'28px', height:'28px', border:'none', background:'#f1f5f2', borderRadius:'8px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#93a1ab' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                          </button>
                        </div>
                        <div style={{ flex:1, overflowY:'auto', padding:'14px 16px', display:'flex', flexDirection:'column', gap:'10px' }}>
                          {assistantNotes.length === 0 ? (
                            <div style={{ margin:'auto', textAlign:'center', color:'#93a1ab', fontSize:'13px', lineHeight:1.6 }}>
                              <p>No notes saved yet.<br/>Click <strong>"Save to Notes"</strong> on any AI response.</p>
                            </div>
                          ) : assistantNotes.map(n => (
                            <div key={n.id} style={{ border:'1px solid #e8eeea', borderRadius:'12px', padding:'11px 13px', background:'#fcfdfc' }}>
                              <div style={{ display:'flex', alignItems:'center', marginBottom:'4px' }}>
                                <span style={{ fontSize:'10.5px', fontWeight:600, color:'#12a06b', textTransform:'uppercase', letterSpacing:'.04em', flex:1 }}>{n.topic}</span>
                                <button onClick={() => setAssistantNotes(prev => prev.filter(x => x.id !== n.id))} style={{ border:'none', background:'none', cursor:'pointer', color:'#93a1ab', padding:'2px', display:'flex' }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
                                </button>
                              </div>
                              <p style={{ fontSize:'12.5px', lineHeight:1.55, color:'#51606c', display:'-webkit-box', WebkitLineClamp:5, WebkitBoxOrient:'vertical', overflow:'hidden', margin:0 }}>{n.text}</p>
                            </div>
                          ))}
                        </div>
                        <div style={{ padding:'12px 16px 16px', borderTop:'1px solid #e8eeea' }}>
                          <button onClick={() => {
                            const txt = assistantNotes.map(n => `=== ${n.topic} ===\n${n.text}\n`).join('\n');
                            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt])); a.download='classmate-notes.txt'; a.click();
                          }} disabled={assistantNotes.length === 0}
                            style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', border:'none', background: assistantNotes.length > 0 ? '#12a06b' : '#e8eeea', color: assistantNotes.length > 0 ? '#fff' : '#93a1ab', fontFamily:'inherit', fontSize:'13.5px', fontWeight:600, padding:'11px', borderRadius:'12px', cursor: assistantNotes.length > 0 ? 'pointer' : 'not-allowed', boxShadow: assistantNotes.length > 0 ? '0 3px 10px rgba(18,160,107,.35)' : 'none' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16"/></svg>
                            Download notes (.txt)
                          </button>
                        </div>
                      </aside>
                    </>
                  )}
                </div>
              )}

              {/* ── TAB: MEMORY SHIELD ── */}
              {activeTab === 'memory' && (
                <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                  {/* Header */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(140deg,#12a06b,#2fc98c)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(18,160,107,.28)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 3v6c0 5-3.4 8.6-8 11-4.6-2.4-8-6-8-11V5l8-3z"/><path d="M9 12l2 2 4-4"/></svg>
                      </div>
                      <div>
                        <h2 style={{ fontWeight: 700, fontSize: '20px', color: '#12202e', margin: 0 }}>Memory Shield</h2>
                        <p style={{ fontSize: '13px', color: '#51606c', margin: 0 }}>Spaced-repetition tracker — never forget what you learned</p>
                      </div>
                      {overdueCount > 0 && <span style={{ marginLeft: 'auto', padding: '4px 12px', background: '#fdeeee', color: '#dc2626', border: '1px solid #f1a9a9', borderRadius: '100px', fontSize: '12px', fontWeight: 700 }}>{overdueCount} overdue</span>}
                    </div>
                  </div>

                  {/* Info card */}
                  <div style={{ display: 'flex', gap: '10px', background: '#fcf3e5', border: '1px solid #f3dfc0', borderRadius: '14px', padding: '13px 15px', fontSize: '13px', lineHeight: 1.55, color: '#51606c', marginBottom: '20px' }}>
                    <svg width="16" height="16" style={{ color: '#d97706', flexShrink: 0, marginTop: '1px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 2.4-1.2 4-2.5 5.5-.8 1-1.5 2-1.5 3.5h-6c0-1.5-.7-2.5-1.5-3.5C6.2 13 5 11.4 5 9a7 7 0 0 1 7-7zM9 21h6"/></svg>
                    <span><strong style={{ color: '#12202e' }}>Did you know?</strong> Your brain forgets 70% of new learning within 24 hours. Memory Shield brings topics back right before your brain forgets them — so one review does the work of ten.</span>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                    {[
                      { label: 'Topics tracked', value: memoryTopics.length, color: '#12a06b', bg: '#e9f7f1', border: '#c6ebda' },
                      { label: 'Due for review', value: memoryTopics.filter(t => t.dueIn <= 0).length, color: '#dc2626', bg: '#fdeeee', border: '#f1a9a9' },
                      { label: 'Avg retention', value: Math.round(memoryTopics.reduce((s, t) => s + t.retention, 0) / (memoryTopics.length || 1)) + '%', color: '#d97706', bg: '#fcf3e5', border: '#f3dfc0' },
                    ].map(s => (
                      <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
                        <p style={{ fontSize: '22px', fontWeight: 700, color: s.color, margin: '0 0 4px' }}>{s.value}</p>
                        <p style={{ fontSize: '11.5px', color: '#51606c', margin: 0 }}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Topic list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {memoryTopics.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 16px', color: '#93a1ab' }}>
                        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: .45, marginBottom: '10px' }}><path d="M12 2l8 3v6c0 5-3.4 8.6-8 11-4.6-2.4-8-6-8-11V5l8-3z"/></svg>
                        <p style={{ fontSize: '13.5px', lineHeight: 1.6 }}>No topics tracked yet.<br/>Ask the AI Assistant to explain something and it will appear here automatically.</p>
                      </div>
                    ) : memoryTopics.map(topic => {
                      const isOverdue = topic.dueIn < 0;
                      const isSoon   = topic.dueIn === 0;
                      const isOk     = topic.dueIn > 0;
                      const dueLabel = isOverdue ? `${Math.abs(topic.dueIn)}d overdue` : isSoon ? 'Due today' : `In ${topic.dueIn}d`;
                      const dueBg    = isOverdue ? '#fdeeee' : isSoon ? '#fcf3e5' : '#eaf7ef';
                      const dueClr   = isOverdue ? '#dc2626' : isSoon ? '#d97706' : '#16a34a';
                      const dueBdr   = isOverdue ? '#f1a9a9' : isSoon ? '#f3dfc0' : '#bfe6cc';
                      const retClr   = topic.retention >= 70 ? '#12a06b' : topic.retention >= 40 ? '#d97706' : '#dc2626';

                      return (
                        <div key={topic.id} style={{ border: '1px solid #e8eeea', borderRadius: '16px', padding: '14px 16px', background: '#fff', boxShadow: '0 1px 3px rgba(20,22,35,.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#12202e', flex: 1, margin: 0 }}>{topic.topic}</p>
                            <span style={{ padding: '3px 10px', background: dueBg, color: dueClr, border: `1px solid ${dueBdr}`, borderRadius: '100px', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>{dueLabel}</span>
                            {topic.retention < 50 && <span style={{ padding: '3px 9px', background: '#fdeeee', color: '#dc2626', border: '1px solid #f1a9a9', borderRadius: '100px', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>Weak</span>}
                          </div>

                          {/* Retention bar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <div style={{ flex: 1, height: '7px', borderRadius: '100px', background: '#f1f5f2', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${topic.retention}%`, borderRadius: '100px', background: `linear-gradient(90deg, ${retClr}, ${retClr}cc)`, transition: 'width .5s ease' }} />
                            </div>
                            <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#93a1ab', width: '80px', textAlign: 'right' }}>{topic.retention}% retained</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#93a1ab' }}>
                            <span>Reviewed {topic.reviewCount}× · Last: {topic.lastReviewed}</span>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                              {memoryReviewing === topic.id ? (
                                <>
                                  <button onClick={() => handleMemoryReview(topic.id)} style={{ padding: '5px 12px', border: '1px solid #bfe6cc', background: '#eaf7ef', color: '#12a06b', borderRadius: '100px', cursor: 'pointer', fontSize: '11.5px', fontWeight: 700 }}>✓ Got it!</button>
                                  <button onClick={() => setMemoryReviewing(null)} style={{ padding: '5px 10px', border: '1px solid #f1a9a9', background: '#fdeeee', color: '#dc2626', borderRadius: '100px', cursor: 'pointer', fontSize: '11.5px', fontWeight: 700 }}>✕ Still learning</button>
                                </>
                              ) : (
                                <button onClick={() => setMemoryReviewing(topic.id)} style={{ padding: '5px 13px', border: '1px solid #e8eeea', background: '#fff', color: '#12a06b', borderRadius: '100px', cursor: 'pointer', fontSize: '11.5px', fontWeight: 600, boxShadow: '0 1px 3px rgba(20,22,35,.05)' }}>Quick review</button>
                              )}
                              <button onClick={() => setMemoryTopics(prev => prev.filter(t => t.id !== topic.id))} style={{ padding: '5px 8px', border: '1px solid #e8eeea', background: '#fff', color: '#93a1ab', borderRadius: '100px', cursor: 'pointer', fontSize: '11.5px' }}>✕</button>
                            </div>
                          </div>

                          {/* Review confirmation panel */}
                          {memoryReviewing === topic.id && (
                            <div style={{ marginTop: '10px', background: '#f1f5f2', borderRadius: '10px', padding: '10px 12px', fontSize: '12.5px', color: '#51606c', lineHeight: 1.5 }}>
                              <strong style={{ color: '#12202e' }}>Quick recall check:</strong> Can you explain <em>"{topic.topic}"</em> in your own words right now? Click <strong>"Got it!"</strong> if yes, or <strong>"Still learning"</strong> if you need more practice.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add topic manually */}
                  <div style={{ marginTop: '20px', border: '1px dashed #c6ebda', borderRadius: '14px', padding: '14px 16px', background: '#e9f7f1' }}>
                    <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#12a06b', marginBottom: '8px' }}>+ Track a new topic</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        id="mem-topic-input"
                        type="text"
                        placeholder="e.g. Pythagoras theorem, Cell division…"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) { handleAddMemoryTopic(val); (e.target as HTMLInputElement).value = ''; }
                          }
                        }}
                        style={{ flex: 1, border: '1px solid #b9e3d0', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', background: '#fff', color: '#12202e' }}
                      />
                      <button
                        onClick={() => {
                          const el = document.getElementById('mem-topic-input') as HTMLInputElement;
                          if (el?.value.trim()) { handleAddMemoryTopic(el.value.trim()); el.value = ''; }
                        }}
                        style={{ padding: '8px 16px', background: '#12a06b', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                      >Add</button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
