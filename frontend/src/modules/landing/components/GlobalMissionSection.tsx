// ─── Landing Module: Global Mission Section ──────────────────────────────────
import { motion } from 'motion/react';
import { Globe } from 'lucide-react';

export default function GlobalMissionSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto mb-14 md:mb-20"
    >
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-900/60 to-cyan-900/30" />
        <div className="absolute inset-0 border border-white/10 rounded-2xl sm:rounded-3xl" />

        <div className="relative p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 w-full">
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4">
              Built for Every Student, Everywhere
            </h2>
            <p className="font-sans text-sm sm:text-base text-slate-300 leading-relaxed mb-4">
              Whether you&apos;re in Mumbai, Lagos, São Paulo, or Tokyo — Nexus speaks your
              language, understands your curriculum, and adapts to your timezone. We believe
              no student should sacrifice their mental health to keep up with academic pressure.
            </p>
            <ul className="space-y-2 font-mono text-[11px] sm:text-xs text-slate-400">
              {[
                'Multi-language AI support for 40+ languages',
                'Works with any university grading system',
                'Offline mode for low-bandwidth regions',
                'Free tier for students who need it most',
              ].map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Globe spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="hidden sm:flex w-32 h-32 md:w-48 md:h-48 rounded-full border border-cyan-500/20 items-center justify-center relative shrink-0"
          >
            <div className="absolute inset-2 rounded-full border border-dashed border-white/10" />
            <Globe className="w-12 h-12 md:w-20 md:h-20 text-cyan-400/80" />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
