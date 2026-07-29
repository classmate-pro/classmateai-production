// ─── Auth Module: Shared Layout Wrapper ─────────────────────────────────────
// Standalone auth pages — no Navbar, no ChatBot. Full-screen, fully responsive.
import { ReactNode, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { AppPage } from '../../../types';
import logoImg from '../../../utils/IMG-20260703-WA0446-removebg-preview.png';

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
  features?: { icon: string; title: string; desc: string }[];
  mode?: 'login' | 'register';
}

// Floating dots for the right emerald panel
function FloatingDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const dots = Array.from({ length: 35 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      a: Math.random() * 0.20 + 0.06,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${d.a})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

const DEFAULT_FEATURES = [
  { icon: '🧠', title: 'AI-Powered Tutoring', desc: 'Get personalized help 24/7.' },
  { icon: '📅', title: 'Smart Scheduling',    desc: 'Auto-plan sessions around your timetable.' },
  { icon: '📊', title: 'Progress Analytics',  desc: 'Track every milestone with insights.' },
];

export default function AuthLayout({
  children,
  onNavigate,
  title,
  subtitle,
  headline,
  headlineHighlight,
  description,
  features = DEFAULT_FEATURES,
}: AuthLayoutProps) {
  return (
    <div
      className="w-full min-h-screen flex flex-col lg:flex-row"
      style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ══════════════════════════════════════════════════════
          LEFT PANEL — Clean white, brand info (desktop only)
         ══════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] min-h-screen bg-white px-10 xl:px-16 py-10 border-r border-slate-100 relative overflow-hidden">

        {/* Dot grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.04,
            backgroundImage: 'radial-gradient(circle, #059669 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Bottom-right glow */}
        <div className="absolute bottom-[-120px] right-[-120px] w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />

        {/* Logo */}
        <motion.button
          onClick={() => onNavigate('home')}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 w-fit group z-10 relative"
        >
          <img
            src={logoImg}
            alt="Classmate AI"
            className="h-12 w-auto object-contain"
          />
        </motion.button>

        {/* Main copy */}
        <motion.div
          className="flex-1 flex flex-col justify-center py-10 z-10 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-500 mb-3">
            Your AI Study Partner
          </span>
          <h1 className="text-[36px] xl:text-[42px] font-black text-slate-900 leading-[1.1] mb-4">
            {headline}{' '}
            <span style={{
              background: 'linear-gradient(90deg, #059669, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {headlineHighlight}
            </span>
          </h1>
          <p className="text-[14px] xl:text-[15px] text-slate-500 leading-relaxed max-w-[300px]">
            {description}
          </p>

          {/* Features */}
          <ul className="mt-8 space-y-3.5">
            {features.map((f, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.10), rgba(16,185,129,0.06))', border: '1px solid rgba(16,185,129,0.18)' }}>
                  {f.icon}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-800 leading-tight">{f.title}</p>
                  <p className="text-[11px] text-slate-400 leading-snug">{f.desc}</p>
                </div>
              </motion.li>
            ))}
          </ul>

          {/* Social proof */}
          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              {['#f97316', '#8b5cf6', '#06b6d4', '#ec4899'].map((c, i) => (
                <div key={i}
                  className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-black"
                  style={{ background: c }}>
                  {['A', 'S', 'R', 'K'][i]}
                </div>
              ))}
            </div>
            <p className="text-[12px] text-slate-500">
              <span className="font-bold text-slate-800">10,000+</span> students trust us
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-[11px] text-slate-400 z-10 relative">
          © 2025 Classmate AI · All rights reserved
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════
          RIGHT PANEL — Bright emerald, solid white card
          Lighter & brighter so all text is clearly visible
         ══════════════════════════════════════════════════════ */}
      <div
        className="flex-1 flex flex-col min-h-screen relative overflow-hidden"
        style={{
          /* Bright, saturated emerald — NOT dark */
          background: 'linear-gradient(145deg, #059669 0%, #10b981 50%, #34d399 100%)',
        }}
      >
        {/* Floating dots */}
        <FloatingDots />

        {/* Wave divider on left edge (desktop) */}
        <div className="absolute left-0 top-0 h-full w-[55px] pointer-events-none hidden lg:block">
          <svg viewBox="0 0 55 900" preserveAspectRatio="none" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 55,0 C 55,0 8,110 30,240 C 52,370 4,450 28,545 C 52,640 4,715 30,840 C 44,880 55,900 55,900 L 55,0 Z"
              fill="white"
            />
          </svg>
        </div>

        {/* Light orbs for depth */}
        <div className="absolute top-[-40px] right-[-40px] w-[280px] h-[280px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 65%)' }} />
        <div className="absolute bottom-[-60px] left-[20%] w-[220px] h-[220px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 65%)' }} />

        {/* Content area */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 sm:px-6 py-10">

          {/* Mobile logo */}
          <div className="lg:hidden w-full max-w-[520px] mb-6">
            <motion.button
              onClick={() => onNavigate('home')}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 group"
            >
              <img
                src={logoImg}
                alt="Classmate AI"
                className="h-10 w-auto object-contain"
              />
            </motion.button>
          </div>

          {/* ── SOLID WHITE form card ─────────────────────────────
              Solid white background = maximum text readability
             ───────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[520px] bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
            style={{
              boxShadow: '0 20px 60px rgba(5,150,105,0.25), 0 4px 16px rgba(0,0,0,0.12)',
            }}
          >
            {/* Emerald top accent bar */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #059669, #10b981, #34d399)' }} />

            <div className="p-6 sm:p-8">
              {/* Card header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3 text-xl"
                  style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.12), rgba(16,185,129,0.08))', border: '1px solid rgba(16,185,129,0.25)' }}>
                  🎓
                </div>
                <h2 className="text-[22px] sm:text-[24px] font-black text-slate-900 tracking-tight">{title}</h2>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.20em] text-slate-400">
                  {subtitle}
                </p>
              </div>

              {/* Form slots */}
              {children}
            </div>
          </motion.div>

          {/* Footer note */}
          <p className="mt-5 text-[12px] text-white/70 text-center pb-4 font-medium">
            🔒 256-bit SSL encryption · Your data is safe
          </p>
        </div>
      </div>
    </div>
  );
}
