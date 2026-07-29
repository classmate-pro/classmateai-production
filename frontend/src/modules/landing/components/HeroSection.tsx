import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { AppPage } from '../../../types';

interface HeroSectionProps {
  onNavigate: (page: AppPage) => void;
}

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="landing-container flex min-h-[78vh] flex-col items-center justify-center text-center pt-[120px] pb-4"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="landing-eyebrow"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Your Smart Learning Partner
        </motion.div>

        {/* Heading — 40px gap below badge */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="landing-hero-title mt-10 max-w-4xl"
        >
          Reduce Your Workload.<br />
          <span className="text-emerald-500">Amplify Your Potential.</span>
        </motion.h1>

        {/* Paragraph — 40px gap below heading */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="landing-lead mt-10 max-w-2xl"
        >
          Classmate AI is the smart learning partner built for every student —
          automating assignments, scheduling study time, and giving you back the hours
          you need to actually learn, rest, and grow.
        </motion.p>

        {/* Buttons — 45px gap below paragraph */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-[45px] flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => onNavigate('register')}
            className="landing-btn landing-btn-primary w-full sm:w-auto"
          >
            Get Started Free
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="landing-btn landing-btn-secondary w-full sm:w-auto"
          >
            Sign In <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
