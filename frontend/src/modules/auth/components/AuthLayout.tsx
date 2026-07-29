// ─── Auth Module: Shared Layout Wrapper ─────────────────────────────────────
import { ReactNode } from 'react';
import { motion } from 'motion/react';
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
  headline,
  headlineHighlight,
  description,
}: AuthLayoutProps) {
  return (
    <div className="h-screen w-full overflow-hidden relative bg-white flex">

      {/* ══ LEFT PANEL — white ══ */}
      <div className="hidden lg:flex w-[38%] flex-col justify-center px-16 bg-white z-10">
        <h2 className="text-[32px] font-extrabold uppercase leading-tight text-emerald-500">
          {headline} {headlineHighlight}!
        </h2>
        <p className="mt-4 text-[15px] text-slate-500 leading-relaxed max-w-[260px]">
          {description}
        </p>
      </div>

      {/* ══ WAVE DIVIDER — positioned between panels ══ */}
      <div className="hidden lg:block absolute left-[35%] top-0 h-full w-[80px] z-20 pointer-events-none">
        <svg
          viewBox="0 0 80 900"
          preserveAspectRatio="none"
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 80,0 
               C 80,0 20,100 50,225 
               C 80,350 10,425 40,500 
               C 70,575 10,650 50,775 
               C 70,838 80,900 80,900 
               L 80,0 Z"
            fill="#059669"
          />
        </svg>
      </div>

      {/* ══ RIGHT PANEL — emerald gradient ══ */}
      <div
        className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #065f46 0%, #059669 40%, #10b981 100%)',
        }}
      >
        {/* Scattered decorative icons (dots pattern like screenshot) */}
        {[
          { top: '8%',  left: '12%', size: 38 },
          { top: '18%', left: '72%', size: 30 },
          { top: '55%', left: '8%',  size: 44 },
          { top: '70%', left: '65%', size: 36 },
          { top: '82%', left: '30%', size: 32 },
          { top: '40%', left: '85%', size: 28 },
          { top: '90%', left: '80%', size: 40 },
        ].map((pos, i) => (
          <svg
            key={i}
            className="absolute opacity-10"
            style={{ top: pos.top, left: pos.left, width: pos.size, height: pos.size }}
            viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"
          >
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ))}

        {/* Form card — no background box, just centered */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-[360px] px-2"
        >
          {/* Title */}
          <div className="text-center mb-7">
            <h2 className="text-[26px] font-extrabold text-white uppercase tracking-[0.15em]">
              {title}
            </h2>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
              {subtitle}
            </p>
          </div>

          {/* Form fields */}
          {children}
        </motion.div>
      </div>
    </div>
  );
}
