// ─── Landing Module: Main Page ───────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { AppPage } from '../../types';
import Footer from '../../shared/components/Footer';
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import HowItWorksSection from './components/HowItWorksSection';
import GlobalMissionSection from './components/GlobalMissionSection';
import TeamsSection from './components/TeamsSection';
import FinalCTASection from './components/FinalCTASection';
import LandingBackground from './components/LandingBackground';
import LandingReveal from './components/LandingReveal';

interface LandingModuleProps {
  onNavigate: (page: AppPage) => void;
  onViewTeamMember: (slug: string) => void;
}

export default function LandingModule({ onNavigate, onViewTeamMember }: LandingModuleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setShowTop(el.scrollTop > el.clientHeight * 0.5);
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () =>
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div
      ref={scrollRef}
      className="landing-page absolute inset-0 z-10 overflow-y-auto overflow-x-hidden pointer-events-none bg-transparent"
    >
      <LandingBackground scrollRef={scrollRef} />
      <div className="min-h-full pointer-events-auto relative z-10">
        <HeroSection onNavigate={onNavigate} />

        {/* Soft blurred divider line after the hero */}
        <div className="landing-container" aria-hidden="true">
          <div
            className="mx-auto h-px w-full max-w-5xl"
            style={{
              background:
                'linear-gradient(to right, rgba(15,23,42,0) 0%, rgba(15,23,42,0.14) 50%, rgba(15,23,42,0) 100%)',
              filter: 'blur(0.5px)',
            }}
          />
        </div>

        <div className="landing-section">
          <LandingReveal>
            <ServicesSection />
          </LandingReveal>
        </div>

        <div className="landing-section">
          <LandingReveal delay={0.05}>
            <HowItWorksSection />
          </LandingReveal>
        </div>

        <div className="landing-section">
          <LandingReveal delay={0.05}>
            <GlobalMissionSection />
          </LandingReveal>
        </div>

        <div className="landing-section">
          <LandingReveal delay={0.05}>
            <TeamsSection onViewMember={onViewTeamMember} />
          </LandingReveal>
        </div>

        <div className="landing-section">
          <LandingReveal delay={0.05}>
            <FinalCTASection onNavigate={onNavigate} />
          </LandingReveal>
        </div>

        <div className="landing-section">
          <LandingReveal delay={0.05}>
            <Footer onNavigate={onNavigate} />
          </LandingReveal>
        </div>
      </div>

      {/* Back-to-top: jumps to the first section */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.94 }}
            className="pointer-events-auto fixed bottom-28 right-6 z-[90] flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-800 to-emerald-500 text-white shadow-lg shadow-emerald-500/30 cursor-pointer"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
