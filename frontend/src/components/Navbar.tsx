import { useState } from 'react';
import { LogIn, CreditCard, MessageSquare, Home, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppPage } from '../types';

interface NavbarProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
}

const navItems: { page: AppPage; label: string; icon: typeof LogIn }[] = [
  { page: 'home',    label: 'Home',       icon: Home },
  { page: 'login',   label: 'Login',      icon: LogIn },
  { page: 'pricing', label: 'Pricing',    icon: CreditCard },
  { page: 'contact', label: 'Contact Us', icon: MessageSquare },
];

export default function Navbar({ activePage, onNavigate }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (page: AppPage) => {
    onNavigate(page);
    setMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] pointer-events-auto">
      <div className="mx-3 xs:mx-4 md:mx-6 mt-3 xs:mt-4">

        {/* ── Main bar ── */}
        <div className="flex items-center justify-between bg-white/[0.07] backdrop-blur-xl px-3 py-2 md:px-5 md:py-2.5 rounded-2xl border border-white/12 shadow-2xl shadow-black/40">

          <button
            type="button"
            onClick={() => handleNavigate('home')}
            className="flex items-center cursor-pointer shrink-0"
            aria-label="Go to homepage"
          >
            <img
              src="/logo.png"
              alt="Nexus Student"
              style={{
                height: '64px',
                width: 'auto',
                maxWidth: '240px',
                objectFit: 'contain',
                objectPosition: 'left center',
                mixBlendMode: 'lighten',
                filter: 'drop-shadow(0 0 5px rgba(0,240,255,0.28))',
                userSelect: 'none',
              }}
            />
          </button>

          {/* Desktop nav pills */}
          <div className="hidden sm:flex items-center gap-1 bg-black/30 p-1 rounded-full border border-white/10 font-mono text-[10px] md:text-[11px] uppercase tracking-wider">
            {navItems.map(({ page, label, icon: Icon }) => (
              <button
                key={page}
                type="button"
                onClick={() => handleNavigate(page)}
                className={`flex items-center gap-1.5 px-2.5 md:px-3 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  activePage === page
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold shadow-lg shadow-indigo-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" />
                <span className="hidden md:inline">{label}</span>
                <span className="md:hidden">{label === 'Contact Us' ? 'Contact' : label}</span>
              </button>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(o => !o)}
            className="sm:hidden w-9 h-9 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* ── Mobile dropdown ── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden mt-2 bg-white/[0.09] backdrop-blur-xl rounded-2xl border border-white/15 shadow-2xl shadow-black/40 overflow-hidden"
            >
              {navItems.map(({ page, label, icon: Icon }) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => handleNavigate(page)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    activePage === page
                      ? 'bg-gradient-to-r from-indigo-600/60 to-cyan-500/40 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </nav>
  );
}
