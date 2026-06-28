import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Brain,
  Calendar,
  BookOpen,
  Users,
  BarChart3,
  Zap,
  Globe,
  ArrowRight,
  Bot,
  ChevronRight,
} from 'lucide-react';
import { AppPage } from '../types';
import Footer from '../components/Footer';

interface LandingPageProps {
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

const SERVICES = [
  {
    icon: Brain,
    title: 'AI Assignment Assistant',
    desc: 'Auto-summarize readings, draft outlines, and organize submissions — cut homework time by up to 60%.',
    color: 'cyan',
  },
  {
    icon: Calendar,
    title: 'Smart Study Scheduler',
    desc: 'AI builds balanced timetables around your classes, exams, and life — no more burnout cycles.',
    color: 'purple',
  },
  {
    icon: BookOpen,
    title: '24/7 AI Tutor',
    desc: 'Instant explanations in any subject, any language. Ask questions at 2 AM and get real answers.',
    color: 'pink',
  },
  {
    icon: Zap,
    title: 'Research & Citation Hub',
    desc: 'Find credible sources, generate bibliographies, and validate facts in seconds — not hours.',
    color: 'amber',
  },
  {
    icon: Users,
    title: 'Global Collaboration',
    desc: 'Connect with study groups worldwide, share notes, and co-edit projects in real time.',
    color: 'green',
  },
  {
    icon: BarChart3,
    title: 'Workload Analytics',
    desc: 'Track stress levels, predict crunch weeks, and get AI recommendations to stay ahead.',
    color: 'cyan',
  },
];

const STATS = [
  { value: '2.4M+', label: 'Students Worldwide' },
  { value: '12hrs', label: 'Saved Per Week' },
  { value: '190+', label: 'Countries Connected' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const colorMap: Record<string, string> = {
  cyan:   'text-cyber-cyan border-cyber-cyan/30 shadow-cyan-500/10',
  purple: 'text-cyber-purple border-cyber-purple/30 shadow-purple-500/10',
  pink:   'text-cyber-pink border-cyber-pink/30 shadow-pink-500/10',
  amber:  'text-cyber-amber border-cyber-amber/30 shadow-amber-500/10',
  green:  'text-cyber-green border-cyber-green/30 shadow-green-500/10',
};

const iconBgMap: Record<string, string> = {
  cyan:   'bg-cyan-500/10',
  purple: 'bg-purple-500/10',
  pink:   'bg-pink-500/10',
  amber:  'bg-amber-500/10',
  green:  'bg-green-500/10',
};

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % AI_QUOTES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentQuote = AI_QUOTES[quoteIndex];

  return (
    <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden pointer-events-none">
      <div className="min-h-full pointer-events-auto">

        {/* ── Hero ── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="pt-28 xs:pt-32 md:pt-36 pb-12 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 xs:px-4 py-1.5 rounded-full bg-white/5 border border-cyan-500/20 font-mono text-[9px] xs:text-[10px] sm:text-xs text-cyan-400 uppercase tracking-widest mb-5 md:mb-6 animate-pulse-glow"
          >
            <Globe className="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0" />
            <span>Trusted by students in 190+ countries</span>
          </motion.div>

          {/* Headline */}
          <h1 className="font-display font-bold tracking-tight leading-[1.1] mb-5 md:mb-6
            text-[clamp(2rem,8vw,4.5rem)]">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="block text-white"
            >
              Reduce Your Workload.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="block gradient-text-animate italic mt-1"
            >
              Amplify Your Potential.
            </motion.span>
          </h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="font-sans text-sm sm:text-base md:text-lg text-slate-300 max-w-xl md:max-w-2xl mx-auto leading-relaxed mb-8 md:mb-10 px-2"
          >
            Nexus Student is the AI-powered platform built for every student on Earth —
            automating assignments, scheduling study time, and giving you back the hours
            you need to actually learn, rest, and grow.
          </motion.p>

          {/* AI Quote ticker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            className="max-w-xs xs:max-w-sm sm:max-w-xl md:max-w-3xl mx-auto mb-8 md:mb-10"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-mono text-[9px] xs:text-[10px] text-cyan-400 uppercase tracking-widest">
                AI Motivation Stream
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            </div>

            <AnimatePresence mode="wait">
              <motion.blockquote
                key={quoteIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45 }}
                className="font-display text-sm sm:text-base md:text-xl text-white/90 leading-relaxed italic px-2"
              >
                &ldquo;{currentQuote.text}&rdquo;
              </motion.blockquote>
            </AnimatePresence>

            <motion.p
              key={`author-${quoteIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-mono text-[9px] xs:text-[10px] text-slate-500 mt-3 uppercase tracking-wider"
            >
              — {currentQuote.author}
            </motion.p>

            {/* Dots */}
            <div className="flex justify-center gap-1.5 mt-4">
              {AI_QUOTES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setQuoteIndex(i)}
                  className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                    i === quoteIndex ? 'w-6 bg-cyan-400' : 'w-2 bg-white/25 hover:bg-white/45'
                  }`}
                  aria-label={`Quote ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            className="flex flex-col xs:flex-row items-center justify-center gap-3 xs:gap-4"
          >
            <motion.button
              type="button"
              onClick={() => onNavigate('login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="w-full xs:w-auto group relative px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl font-mono text-xs sm:text-sm font-bold uppercase tracking-widest text-white overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-cyan-500 to-indigo-600 bg-[length:200%_100%] animate-gradient-shift" />
              <span className="relative flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>

            <button
              type="button"
              onClick={() => onNavigate('pricing')}
              className="font-mono text-[10px] sm:text-[11px] text-slate-400 hover:text-cyan-400 uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
            >
              View Plans <ChevronRight className="w-3 h-3" />
            </button>
          </motion.div>
        </motion.section>

        {/* ── Stats ── */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto mb-14 md:mb-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/8 backdrop-blur-sm hover:border-cyan-500/20 transition-colors"
              >
                <div className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-cyan-400 glow-cyan">
                  {stat.value}
                </div>
                <div className="font-mono text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Services ── */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto mb-14 md:mb-20"
        >
          <div className="text-center mb-8 md:mb-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-xl sm:text-2xl md:text-4xl font-bold text-white mb-3"
            >
              Services That{' '}
              <span className="text-cyan-400 italic">Lighten Your Load</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="font-sans text-slate-400 max-w-xl mx-auto text-sm md:text-base px-2"
            >
              Everything a student needs — from first lecture to final exam — powered by AI
              that works while you sleep.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {SERVICES.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className={`group p-5 sm:p-6 rounded-2xl bg-white/[0.03] border backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${colorMap[service.color]}`}
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${iconBgMap[service.color]} border border-white/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shrink-0`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colorMap[service.color].split(' ')[0]}`} />
                  </div>
                  <h3 className="font-display font-semibold text-white text-base sm:text-lg mb-2">
                    {service.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {service.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ── Global Mission ── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto mb-14 md:mb-20"
        >
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-900/60 to-cyan-900/30" />
            <div className="absolute inset-0 border border-white/10 rounded-2xl sm:rounded-3xl" />
            <div className="relative p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 w-full">
                <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4">
                  Built for Every Student, Everywhere
                </h2>
                <p className="font-sans text-sm sm:text-base text-slate-300 leading-relaxed mb-4">
                  Whether you&apos;re in Mumbai, Lagos, São Paulo, or Tokyo — Nexus speaks your
                  language, understands your curriculum, and adapts to your timezone. We believe
                  no student should sacrifice their mental health to keep up with academic pressure.
                </p>
                <ul className="space-y-2 font-mono text-[11px] sm:text-xs text-slate-400">
                  {[
                    'Multi-language AI support for 40+ languages',
                    'Works with any university grading system',
                    'Offline mode for low-bandwidth regions',
                    'Free tier for students who need it most',
                  ].map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Globe spinner — hidden on xs, shown md+ */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                className="hidden sm:flex w-32 h-32 md:w-48 md:h-48 rounded-full border border-cyan-500/20 items-center justify-center relative shrink-0"
              >
                <div className="absolute inset-2 rounded-full border border-dashed border-white/10" />
                <Globe className="w-12 h-12 md:w-20 md:h-20 text-cyan-400/80" />
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ── Final CTA ── */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto text-center py-10 md:py-14"
        >
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Reclaim Your Time?
          </h2>
          <p className="font-sans text-sm sm:text-base text-slate-400 mb-8 max-w-md mx-auto px-2">
            Join millions of students who stopped surviving and started thriving.
          </p>
          <motion.button
            type="button"
            onClick={() => onNavigate('login')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-7 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-mono text-xs sm:text-sm font-bold uppercase tracking-widest text-white bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/30 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Get Started — It&apos;s Free
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.section>

        {/* ── Footer ── */}
        <Footer onNavigate={onNavigate} />
      </div>
    </div>
  );
}
