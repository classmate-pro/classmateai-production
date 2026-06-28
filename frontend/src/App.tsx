import { useState } from 'react';
import { AppPage, CoreSettings } from './types';
import ThreeCanvas from './components/ThreeCanvas';
import Navbar from './components/Navbar';
import ParallaxBackground from './components/ParallaxBackground';
import MathParticles from './components/MathParticles';
import ChatBot from './components/ChatBot';
import { usePointerParallax } from './hooks/usePointerParallax';

// ── Modules ──────────────────────────────────────────────────────────────────
import LandingModule  from './modules/landing';
import LoginPage      from './modules/auth/LoginPage';
import RegisterPage   from './modules/auth/RegisterPage';

// ── Legacy pages (still in use) ───────────────────────────────────────────────
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>('home');
  // Refs only — no 60fps re-renders from pointer tracking
  const { parallaxRef } = usePointerParallax();

  const [settings] = useState<CoreSettings>({
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

  const isScrollable = activePage === 'home';

  return (
    <div
      className={`relative w-full bg-[#020617] text-white font-sans ${
        isScrollable ? 'min-h-screen' : 'h-screen overflow-hidden'
      }`}
    >
      {/* These components read from parallaxRef in their own RAF loops — no prop drilling of live values */}
      <ParallaxBackground parallaxRef={parallaxRef} />
      <MathParticles />
      <ThreeCanvas settings={settings} parallaxRef={parallaxRef} />

      <Navbar activePage={activePage} onNavigate={setActivePage} />

      {/* ── Landing ── */}
      {activePage === 'home' && (
        <LandingModule onNavigate={setActivePage} />
      )}

      {/* ── Auth ── */}
      {activePage === 'login'    && <LoginPage    onNavigate={setActivePage} />}
      {activePage === 'register' && <RegisterPage onNavigate={setActivePage} />}

      {/* ── Other pages ── */}
      {activePage === 'pricing' && <PricingPage color={settings.color} />}
      {activePage === 'contact' && <ContactPage color={settings.color} />}

      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none moving-scanline z-50 mix-blend-screen opacity-65" />

      {/* ── AI Chatbot — floating on all pages ── */}
      <ChatBot />
    </div>
  );
}
