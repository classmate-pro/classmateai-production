// ─── Landing Module: Final CTA Section ──────────────────────────────────────
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { AppPage } from '../../../types';

interface FinalCTASectionProps {
  onNavigate: (page: AppPage) => void;
}

export default function FinalCTASection({ onNavigate }: FinalCTASectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto text-center py-10 md:py-14"
    >
      <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4">
        Ready to Reclaim Your Time?
      </h2>
      <p className="font-sans text-sm sm:text-base text-slate-400 mb-8 max-w-md mx-auto px-2">
        Join millions of students who stopped surviving and started thriving.
      </p>
      <div className="flex flex-col xs:flex-row items-center justify-center gap-4">
        <motion.button
          type="button"
          onClick={() => onNavigate('register')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="w-full xs:w-auto inline-flex items-center justify-center gap-2 px-7 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-mono text-xs sm:text-sm font-bold uppercase tracking-widest text-white bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/30 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Get Started — It&apos;s Free
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="font-mono text-[10px] sm:text-[11px] text-slate-400 hover:text-cyan-400 uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
        >
          Already a member? Sign In <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.section>
  );
}
