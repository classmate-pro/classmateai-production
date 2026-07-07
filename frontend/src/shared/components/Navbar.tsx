import { useState } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppPage } from '../../types';
import logo from '../../utils/IMG-20260703-WA0446-removebg-preview.png';
import AppsSidebar from './AppsSidebar';

interface NavbarProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
}

function AppsLauncherButton({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label="Open Classmate AI applications"
      aria-expanded={open}
      className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all cursor-pointer ${
        open
          ? 'border-emerald-200 bg-emerald-50 shadow-sm'
          : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
      }`}
    >
      <span className="grid grid-cols-3 gap-[3.5px]">
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className={`h-[4px] w-[4px] rounded-full transition-colors ${
              open ? 'bg-emerald-600' : 'bg-slate-500'
            }`}
          />
        ))}
      </span>
    </button>
  );
}

export default function Navbar({ activePage, onNavigate }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);

  const items = [
    { id: 'features', label: 'Features' },
    { id: 'how-it-works', label: 'How it Works' },
    { id: 'mission', label: 'Mission' },
    { id: 'team', label: 'Team' },
  ];

  const scrollToSection = (target: string) => {
    if (activePage !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigate = (target: string) => {
    if (['login', 'register', 'home'].includes(target)) {
      onNavigate(target as AppPage);
      if (target === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      scrollToSection(target);
    }
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] pointer-events-auto bg-white/80 backdrop-blur-xl border-b border-[#F2F2F2]">
        <div className="w-full px-6 lg:px-10">
          <div className="flex justify-between items-center h-20">

            {/* Logo */}
            <div className="flex shrink-0 items-center cursor-pointer ml-6" onClick={() => handleNavigate('home')}>
              <img
                src={logo}
                alt="Classmate AI"
                className="h-10 sm:h-11 md:h-12 w-auto max-h-[3rem] object-contain"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.id)}
                  className="text-[12px] font-semibold text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer uppercase tracking-[1px]"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right actions */}
            <div className="hidden md:flex items-center space-x-5">
              <button
                onClick={() => handleNavigate('login')}
                className="text-[13px] font-semibold text-slate-800 hover:text-teal-700 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNavigate('register')}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-800 to-emerald-500 hover:from-teal-900 hover:to-emerald-600 text-white px-4 py-2 rounded-full text-[13px] font-bold transition-all shadow-lg shadow-emerald-500/30"
              >
                <Sparkles className="w-4 h-4" />
                Get Started Free
              </button>

              <AppsLauncherButton open={appsOpen} onClick={() => setAppsOpen(true)} />
            </div>

            {/* Mobile: apps launcher + menu */}
            <div className="md:hidden flex items-center gap-2">
              <AppsLauncherButton open={appsOpen} onClick={() => setAppsOpen(true)} />
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-slate-600 hover:text-slate-900 p-1"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-[#EDE7DD] overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-2">
                {items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavigate(item.id)}
                    className="block w-full text-left px-3 py-2 text-sm font-bold text-slate-700 hover:text-teal-700 hover:bg-slate-50 rounded-md uppercase tracking-widest"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                  <button
                    onClick={() => handleNavigate('login')}
                    className="w-full px-3 py-2 text-center text-base font-medium text-slate-800 border border-slate-200 rounded-lg"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNavigate('register')}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-center text-base font-bold text-white bg-gradient-to-r from-teal-800 to-emerald-500 rounded-lg"
                  >
                    <Sparkles className="w-4 h-4" />
                    Get Started Free
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AppsSidebar
        open={appsOpen}
        onClose={() => setAppsOpen(false)}
        onNavigate={onNavigate}
        onScrollTo={scrollToSection}
      />
    </>
  );
}
