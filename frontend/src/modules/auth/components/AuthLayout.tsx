// ─── Auth Module: Shared Layout Wrapper ─────────────────────────────────────
import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { AppPage } from '../../../types';

interface AuthLayoutProps {
  children: ReactNode;
  onNavigate: (page: AppPage) => void;
  /** Title shown at the top of the card */
  title: string;
  /** Short subtitle / description */
  subtitle: string;
  /** Icon element to show beside the title */
  icon: ReactNode;
  /** Right-side decorative accent colour class (border top) */
  accentClass?: string;
}

export default function AuthLayout({
  children,
  onNavigate,
  title,
  subtitle,
  icon,
  accentClass = 'bg-gradient-to-r from-indigo-600 to-cyan-500',
}: AuthLayoutProps) {
  return (
    <div className="relative z-20 flex items-center justify-center w-full min-h-screen p-4 py-24 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md my-auto"
      >
        {/* Card */}
        <div className="relative glass-panel-deep rounded-3xl border border-white/10 shadow-2xl shadow-black/60 overflow-hidden">
          {/* Top accent stripe */}
          <div className={`h-1 w-full ${accentClass}`} />

          <div className="p-6 sm:p-8">
            {/* Logo link */}
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="flex items-center mb-6 cursor-pointer"
              aria-label="Back to home"
            >
              <img
                src="/logo.png"
                alt="Nexus Student"
                style={{
                  height: '32px',
                  width: 'auto',
                  maxWidth: '130px',
                  objectFit: 'contain',
                  objectPosition: 'left center',
                  mixBlendMode: 'lighten',
                  filter: 'drop-shadow(0 0 5px rgba(0,240,255,0.3))',
                  userSelect: 'none',
                }}
              />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-cyan-400 shrink-0">
                {icon}
              </div>
              <div>
                <h1 className="font-display font-bold text-lg sm:text-xl text-white tracking-tight">
                  {title}
                </h1>
                <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                  {subtitle}
                </p>
              </div>
            </div>

            {/* Page content */}
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
