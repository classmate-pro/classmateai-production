import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { AppPage } from '../../../types';

interface FinalCTASectionProps {
  onNavigate: (page: AppPage) => void;
}

export default function FinalCTASection({ onNavigate }: FinalCTASectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="landing-container text-center landing-section-pad relative z-10"
    >
      <div className="bg-[#ebdcc0]/30 rounded-[24px] p-6 sm:p-10 md:p-16 border border-[#ebdcc0] relative flex flex-col items-center">

        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.2em] text-emerald-600 uppercase mb-4">
            Get Started
          </p>
          <h2 className="landing-section-title mb-6">
            Ready to Reclaim Your Time?
          </h2>
          <p className="landing-section-desc mb-10">
            Join millions of students who stopped surviving and started thriving.
          </p>

          <div className="flex flex-col items-center justify-center gap-4">
            <motion.button
              type="button"
              onClick={() => onNavigate('register')}
              className="landing-btn landing-btn-primary"
            >
              Get Started Free
            </motion.button>
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer mt-2"
            >
              Already a member? Sign In
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
