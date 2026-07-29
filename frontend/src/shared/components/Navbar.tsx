import { useState } from 'react';
import { Sparkles, Menu, X } from 'lucide-react';
import { AppPage } from '../../types';
import logo from '../../utils/IMG-20260703-WA0446-removebg-preview.png';
import AppsSidebar from './AppsSidebar';

interface NavbarProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
}

function AppsLauncherButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open Classmate AI applications"
      aria-expanded={open}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: open ? 'rgba(15, 23, 42, 0.08)' : 'rgba(15, 23, 42, 0.04)',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!open) e.currentTarget.style.background = 'rgba(15, 23, 42, 0.08)';
      }}
      onMouseLeave={(e) => {
        if (!open) e.currentTarget.style.background = 'rgba(15, 23, 42, 0.04)';
      }}
    >
      <span style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px' }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: '#475569',
            }}
          />
        ))}
      </span>
    </button>
  );
}

export default function Navbar({ activePage, onNavigate }: NavbarProps) {
  const [appsOpen, setAppsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const items = [
    { id: 'features',     label: 'Features'     },
    { id: 'how-it-works', label: 'How it Works' },
    { id: 'mission',      label: 'Mission'       },
    { id: 'team',         label: 'Team'          },
    { id: 'blog',         label: 'Blog'          },
  ];

  const scrollToSection = (target: string) => {
    setMobileMenuOpen(false);
    if (target === 'blog') {
      onNavigate('blog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
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
    setMobileMenuOpen(false);
    if (['login', 'register', 'home', 'blog'].includes(target)) {
      onNavigate(target as AppPage);
      if (target === 'home' || target === 'blog') window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      scrollToSection(target);
    }
  };

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          pointerEvents: 'auto',
          background: 'rgba(255, 255, 255, 0.95)',
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo Left */}
          <div
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}
            onClick={() => handleNavigate('home')}
          >
            <img
              src={logo}
              alt="Classmate AI logo"
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          {/* Center Links (Hidden on Mobile) */}
          <div
            className="hidden lg:flex"
            style={{
              alignItems: 'center',
              gap: '32px',
            }}
          >
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#000000')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Actions (Hidden/Adaptive on Mobile) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-6">
              {/* Sign In text link */}
              <button
                onClick={() => handleNavigate('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#000000')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
              >
                Sign In
              </button>

              {/* Get Started Free Button */}
              <button
                onClick={() => handleNavigate('register')}
                style={{
                  padding: '9px 20px',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                }}
              >
                <Sparkles style={{ width: '13px', height: '13px' }} />
                Get Started Free
              </button>
            </div>

            {/* Apps Launcher Button (Google App grid icon) */}
            <AppsLauncherButton open={appsOpen} onClick={() => setAppsOpen(true)} />

            {/* Mobile Hamburger toggle */}
            <button
              className="flex lg:hidden p-2 rounded-full hover:bg-stone-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 32px',
            gap: '24px',
          }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              style={{
                textAlign: 'left',
                background: 'none',
                border: 'none',
                color: '#1e293b',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '12px 0',
                borderBottom: '1px solid #f1f5f9',
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}

          {/* Mobile-only Auth buttons */}
          <div className="flex flex-col gap-4 mt-8 sm:hidden">
            <button
              onClick={() => handleNavigate('login')}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '999px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#1e293b',
                fontWeight: 700,
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => handleNavigate('register')}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '999px',
                border: 'none',
                background: 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                cursor: 'pointer',
              }}
            >
              Get Started Free
            </button>
          </div>
        </div>
      )}

      <AppsSidebar
        open={appsOpen}
        onClose={() => setAppsOpen(false)}
        onNavigate={onNavigate}
        onScrollTo={scrollToSection}
      />
    </>
  );
}
