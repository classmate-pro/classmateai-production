import { useState, useEffect } from 'react';
import { AppPage, CoreSettings } from './types';

// ── Shared UI ────────────────────────────────────────────────────────────────
import Navbar from './shared/components/Navbar';
import ChatBot from './shared/components/ChatBot';

// ── Canvas Module ────────────────────────────────────────────────────────────
import { ThreeCanvas, ParallaxBackground, MathParticles } from './modules/canvas';

// ── Feature Modules ──────────────────────────────────────────────────────────
import LandingModule  from './modules/landing';
import LoginPage      from './modules/auth/LoginPage';
import RegisterPage   from './modules/auth/RegisterPage';
import PricingPage    from './modules/pricing';
import ContactPage    from './modules/contact';
import HudDashboard   from './modules/dashboard';

// ── Hooks & Utils ────────────────────────────────────────────────────────────
import { usePointerParallax } from './hooks/usePointerParallax';

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>('home');
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

  const isScrollable = activePage === 'home';

  return (
    <div
      className={`relative w-full bg-[#020617] text-white font-sans ${
        isScrollable ? 'min-h-screen' : 'h-screen overflow-hidden'
      }`}
    >
      <ParallaxBackground parallaxRef={parallaxRef} />
      <MathParticles />
      <ThreeCanvas settings={settings} parallaxRef={parallaxRef} />

      {activePage !== 'dashboard' && (
        <Navbar activePage={activePage} onNavigate={setActivePage} />
      )}

      {/* ── Landing ── */}
      {activePage === 'home' && (
        <LandingModule onNavigate={setActivePage} />
      )}

      {/* ── Auth ── */}
      {activePage === 'login'    && <LoginPage    onNavigate={setActivePage} />}
      {activePage === 'register' && <RegisterPage onNavigate={setActivePage} />}
      {activePage === 'dashboard' && <HudDashboard settings={settings} setSettings={setSettings} onNavigate={setActivePage} />}

      {/* ── Core pages (now modules) ── */}
      {activePage === 'pricing' && <PricingPage color={settings.color} />}
      {activePage === 'contact' && <ContactPage color={settings.color} />}

      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none moving-scanline z-50 mix-blend-screen opacity-65" />

      {/* AI Chatbot */}
      <ChatBot />
    </div>
  );
}
