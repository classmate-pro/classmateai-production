import { useState, useEffect } from 'react';
import { AppPage, CoreSettings } from './types';

// ── Shared UI ────────────────────────────────────────────────────────────────
import Navbar from './shared/components/Navbar';
import ChatBot from './shared/components/ChatBot';

// ── Canvas Module ────────────────────────────────────────────────────────────
import { NetworkBackground } from './modules/canvas';

// ── Feature Modules ──────────────────────────────────────────────────────────
import LandingModule  from './modules/landing';
import TeamMemberPage from './modules/landing/TeamMemberPage';
import LoginPage      from './modules/auth/LoginPage';
import RegisterPage   from './modules/auth/RegisterPage';
import PricingPage    from './modules/pricing';
import ContactPage    from './modules/contact';
import HudDashboard   from './modules/dashboard';

// ── Hooks & Utils ────────────────────────────────────────────────────────────
import { usePointerParallax } from './hooks/usePointerParallax';

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>('home');
  const [teamMemberSlug, setTeamMemberSlug] = useState<string | null>(null);
  const { parallaxRef } = usePointerParallax();

  const [settings, setSettings] = useState<CoreSettings>({
    color: 'cyan',
    geometry: 'torusKnot',
    mode: 'ORBIT',
    speedMultiplier: 1.5,
    particleCount: 1800,
    noiseIntensity: 0.5,
    autoRotate: true,
    wireframe: true,
    soundEnabled: false,
  });

  // Check for auto-login on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setActivePage('dashboard');
    }
  }, []);

  const isScrollable =
    activePage === 'home' ||
    activePage === 'login' ||
    activePage === 'register' ||
    activePage === 'team-member';

  const handleNavigate = (page: AppPage) => {
    setActivePage(page);
    if (page !== 'team-member') setTeamMemberSlug(null);
  };

  const handleViewTeamMember = (slug: string) => {
    setTeamMemberSlug(slug);
    setActivePage('team-member');
    window.scrollTo({ top: 0 });
  };

  return (
    <div
      className={`relative w-full text-slate-900 font-sans ${
        isScrollable ? 'min-h-screen' : 'h-screen overflow-hidden'
      } ${activePage === 'home' ? 'bg-[#F0EBE1]' : 'bg-white'}`}
    >
      {activePage !== 'home' && activePage !== 'login' && activePage !== 'register' && activePage !== 'team-member' && <NetworkBackground />}

      {activePage !== 'dashboard' && (
        <Navbar activePage={activePage} onNavigate={handleNavigate} />
      )}

      {/* ── Landing ── */}
      {activePage === 'home' && (
        <LandingModule onNavigate={handleNavigate} onViewTeamMember={handleViewTeamMember} />
      )}

      {/* ── Team member detail ── */}
      {activePage === 'team-member' && teamMemberSlug && (
        <TeamMemberPage slug={teamMemberSlug} onNavigate={handleNavigate} />
      )}

      {/* ── Auth ── */}
      {activePage === 'login'    && <LoginPage    onNavigate={handleNavigate} />}
      {activePage === 'register' && <RegisterPage onNavigate={handleNavigate} />}
      {activePage === 'dashboard' && <HudDashboard settings={settings} setSettings={setSettings} onNavigate={handleNavigate} />}

      {/* ── Core pages (now modules) ── */}
      {activePage === 'pricing' && <PricingPage color={settings.color} />}
      {activePage === 'contact' && <ContactPage color={settings.color} />}



      {/* AI Chatbot */}
      <ChatBot />
    </div>
  );
}
