// ─── Landing Module: Hero Section ───────────────────────────────────────────
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Sparkles, ArrowRight, ChevronRight, Bot } from 'lucide-react';
import { AppPage } from '../../../types';

interface HeroSectionProps {
  onNavigate: (page: AppPage) => void;
}

const AI_QUOTES = [
  {
    text: 'Your mind was built for discovery — not drowning in busywork. Let Nexus AI carry the load so you can learn what truly matters.',
    author: 'Nexus AI Mentor',
  },
  {
    text: 'Students across 190+ countries save 12+ hours every week. Less stress. More sleep. Better grades. That future starts now.',
    author: 'Global Impact Engine',
  },
  {
    text: 'Every assignment, deadline, and study session — orchestrated by intelligence that understands you. Work smarter, not harder.',
    author: 'Synapse Learning Core',
  },
  {
    text: 'You are not alone in this journey. Millions of students worldwide trust Nexus to turn chaos into clarity.',
    author: 'Hyperion Academy Network',
  },
  {
    text: 'The world needs your ideas, not your exhaustion. Automate the repetitive. Amplify the extraordinary.',
    author: 'Quantum Cadet Protocol',
  },
];

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setQuoteIndex(i => (i + 1) % AI_QUOTES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const q = AI_QUOTES[quoteIndex];

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="pt-28 xs:pt-32 md:pt-36 pb-12 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto text-center"
    >
      {/* Trust badge */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="inline-flex items-center gap-2 px-3 xs:px-4 py-1.5 rounded-full bg-white/5 border border-cyan-500/20 font-mono text-[9px] xs:text-[10px] sm:text-xs text-cyan-400 uppercase tracking-widest mb-5 md:mb-6 animate-pulse-glow"
      >
        <Globe className="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0" />
        Trusted by students in 190+ countries
      </motion.div>

      {/* Headline */}
      <h1 className="font-display font-bold tracking-tight leading-[1.1] mb-5 md:mb-6"
        style={{ fontSize: 'clamp(2rem, 8vw, 4.5rem)' }}>
        <motion.span
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }} className="block text-white"
        >
          Reduce Your Workload.
        </motion.span>
        <motion.span
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45 }} className="block gradient-text-animate italic mt-1"
        >
          Amplify Your Potential.
        </motion.span>
      </h1>

      {/* Sub-headline */}
      <motion.p
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.6 }}
        className="font-sans text-sm sm:text-base md:text-lg text-slate-300 max-w-xl md:max-w-2xl mx-auto leading-relaxed mb-8 md:mb-10 px-2"
      >
        Nexus Student is the AI-powered platform built for every student on Earth —
        automating assignments, scheduling study time, and giving you back the hours
        you need to actually learn, rest, and grow.
      </motion.p>

      {/* AI Quote ticker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.6 }}
        className="max-w-xs xs:max-w-sm sm:max-w-xl md:max-w-3xl mx-auto mb-8 md:mb-10"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="font-mono text-[9px] xs:text-[10px] text-cyan-400 uppercase tracking-widest">AI Motivation Stream</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
        </div>
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={quoteIndex}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45 }}
            className="font-display text-sm sm:text-base md:text-xl text-white/90 leading-relaxed italic px-2"
          >
            &ldquo;{q.text}&rdquo;
          </motion.blockquote>
        </AnimatePresence>
        <motion.p
          key={`a-${quoteIndex}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-mono text-[9px] xs:text-[10px] text-slate-500 mt-3 uppercase tracking-wider"
        >
          — {q.author}
        </motion.p>
        <div className="flex justify-center gap-1.5 mt-4">
          {AI_QUOTES.map((_, i) => (
            <button key={i} type="button" onClick={() => setQuoteIndex(i)}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${i === quoteIndex ? 'w-6 bg-cyan-400' : 'w-2 bg-white/25 hover:bg-white/45'}`}
              aria-label={`Quote ${i + 1}`} />
          ))}
        </div>
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.5 }}
        className="flex flex-col xs:flex-row items-center justify-center gap-3 xs:gap-4"
      >
        <motion.button
          type="button" onClick={() => onNavigate('register')}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          className="w-full xs:w-auto group relative px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl font-mono text-xs sm:text-sm font-bold uppercase tracking-widest text-white overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-cyan-500 to-indigo-600 bg-[length:200%_100%] animate-gradient-shift" />
          <span className="relative flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Get Started Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </motion.button>

        <button type="button" onClick={() => onNavigate('login')}
          className="font-mono text-[10px] sm:text-[11px] text-slate-400 hover:text-cyan-400 uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
        >
          Sign In <ChevronRight className="w-3 h-3" />
        </button>
      </motion.div>
    </motion.section>
  );
}
