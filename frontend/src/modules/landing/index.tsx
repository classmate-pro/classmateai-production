// ─── Landing Module: Main Page ───────────────────────────────────────────────
import { AppPage } from '../../types';
import Footer from '../../components/Footer';
import HeroSection from './components/HeroSection';
import StatsSection from './components/StatsSection';
import ServicesSection from './components/ServicesSection';
import GlobalMissionSection from './components/GlobalMissionSection';
import FinalCTASection from './components/FinalCTASection';

interface LandingModuleProps {
  onNavigate: (page: AppPage) => void;
}

/**
 * LandingModule
 * Assembles all landing page sections into a single scrollable page.
 * Each section is its own isolated component inside /modules/landing/components/.
 */
export default function LandingModule({ onNavigate }: LandingModuleProps) {
  return (
    <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden pointer-events-none">
      <div className="min-h-full pointer-events-auto">

        {/* ① Hero — no content-visibility (above fold) */}
        <HeroSection onNavigate={onNavigate} />

        {/* ② below-fold sections get content-visibility:auto — browser skips offscreen paint */}
        <div className="landing-section">
          <StatsSection />
        </div>

        <div className="landing-section">
          <ServicesSection />
        </div>

        <div className="landing-section">
          <GlobalMissionSection />
        </div>

        <div className="landing-section">
          <FinalCTASection onNavigate={onNavigate} />
        </div>

        <div className="landing-section">
          <Footer onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
