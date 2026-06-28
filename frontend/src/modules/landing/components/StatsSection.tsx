// ─── Landing Module: Stats Section ──────────────────────────────────────────
import { motion } from 'motion/react';

const STATS = [
  { value: '2.4M+', label: 'Students Worldwide' },
  { value: '12hrs', label: 'Saved Per Week' },
  { value: '190+', label: 'Countries Connected' },
  { value: '98%',  label: 'Satisfaction Rate' },
];

export default function StatsSection() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto mb-14 md:mb-20"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="text-center p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm hover:border-cyan-500/20 transition-colors"
          >
            <div className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-cyan-400 glow-cyan">
              {stat.value}
            </div>
            <div className="font-mono text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider mt-1">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
