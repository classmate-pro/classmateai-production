// ─── Auth Module: Shared Layout Wrapper ─────────────────────────────────────
import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Check, Star } from 'lucide-react';
import { AppPage } from '../../../types';

interface AuthLayoutProps {
  children: ReactNode;
  onNavigate: (page: AppPage) => void;
  title: string;
  subtitle: string;
  icon?: ReactNode;
  headline: string;
  headlineHighlight: string;
  description: string;
  bullets: string[];
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  icon,
  headline,
  headlineHighlight,
  description,
  bullets,
}: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen w-full"
      style={{ background: 'linear-gradient(180deg, #FCFBF8 0%, #F8F5EF 100%)' }}
    >
      <div className="landing-container grid lg:grid-cols-2 gap-12 lg:gap-20 pt-28 lg:pt-32 pb-16 lg:pb-20 items-start">

        {/* Left: Branding */}
        <div className="hidden lg:flex flex-col lg:pt-4">
          <span className="landing-eyebrow self-start mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Classmate AI
          </span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.05] text-slate-900"
          >
            {headline}<br />
            <span className="text-emerald-500">{headlineHighlight}</span>
          </motion.h1>

          <p className="mt-8 text-base text-slate-600 max-w-md leading-relaxed">
            {description}
          </p>

          <ul className="mt-10 space-y-4">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={3} />
                </span>
                <span className="text-[15px] font-medium text-slate-700">{b}</span>
              </li>
            ))}
          </ul>

          {/* Trust strip */}
          <div className="mt-12 flex items-center gap-6 border-t border-slate-200/70 pt-8">
            <div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Loved by 2.4M+ students</p>
            </div>
            <div className="h-9 w-px bg-slate-200" />
            <div>
              <p className="text-lg font-extrabold text-slate-900 leading-none">190+</p>
              <p className="text-xs text-slate-500 mt-1.5">Countries worldwide</p>
            </div>
          </div>

          <p className="mt-auto pt-16 text-xs text-slate-400">
            © 2026 Classmate AI. classmateai.com
          </p>
        </div>

        {/* Right: Form card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full max-w-md mx-auto lg:mx-0 lg:ml-auto"
        >
          {/* Soft glow behind card */}
          <div
            className="absolute -inset-6 -z-10 rounded-[40px] blur-2xl opacity-60 pointer-events-none"
            style={{ background: 'radial-gradient(60% 60% at 50% 0%, rgba(16,185,129,0.10), rgba(16,185,129,0) 70%)' }}
          />

          <div className="bg-white rounded-3xl border border-slate-200/70 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.18)] p-8 sm:p-10">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                {icon} {title}
              </h2>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed max-w-sm">
                {subtitle}
              </p>
            </div>

            {/* Page content */}
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
