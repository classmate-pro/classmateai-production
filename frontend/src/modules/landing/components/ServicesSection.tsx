// ─── Landing Module: Services Section ───────────────────────────────────────
import { motion } from 'motion/react';
import { Brain, Calendar, BookOpen, Zap, Users, BarChart3 } from 'lucide-react';

const SERVICES = [
  { icon: Brain,    title: 'AI Assignment Assistant', color: 'cyan',
    desc: 'Auto-summarize readings, draft outlines, and organize submissions — cut homework time by up to 60%.' },
  { icon: Calendar, title: 'Smart Study Scheduler',   color: 'purple',
    desc: 'AI builds balanced timetables around your classes, exams, and life — no more burnout cycles.' },
  { icon: BookOpen, title: '24/7 AI Tutor',           color: 'pink',
    desc: 'Instant explanations in any subject, any language. Ask questions at 2 AM and get real answers.' },
  { icon: Zap,      title: 'Research & Citation Hub', color: 'amber',
    desc: 'Find credible sources, generate bibliographies, and validate facts in seconds — not hours.' },
  { icon: Users,    title: 'Global Collaboration',    color: 'green',
    desc: 'Connect with study groups worldwide, share notes, and co-edit projects in real time.' },
  { icon: BarChart3,title: 'Workload Analytics',      color: 'cyan',
    desc: 'Track stress levels, predict crunch weeks, and get AI recommendations to stay ahead.' },
];

const colorMap: Record<string, string> = {
  cyan:   'text-cyber-cyan border-cyber-cyan/30',
  purple: 'text-cyber-purple border-cyber-purple/30',
  pink:   'text-cyber-pink border-cyber-pink/30',
  amber:  'text-cyber-amber border-cyber-amber/30',
  green:  'text-cyber-green border-cyber-green/30',
};

const iconBgMap: Record<string, string> = {
  cyan:   'bg-cyan-500/10',
  purple: 'bg-purple-500/10',
  pink:   'bg-pink-500/10',
  amber:  'bg-amber-500/10',
  green:  'bg-green-500/10',
};

export default function ServicesSection() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto mb-14 md:mb-20"
    >
      {/* Heading */}
      <div className="text-center mb-8 md:mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-display text-xl sm:text-2xl md:text-4xl font-bold text-white mb-3"
        >
          Services That{' '}
          <span className="text-cyan-400 italic">Lighten Your Load</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="font-sans text-slate-400 max-w-xl mx-auto text-sm md:text-base px-2"
        >
          Everything a student needs — from first lecture to final exam — powered by AI
          that works while you sleep.
        </motion.p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {SERVICES.map((service, i) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`group p-5 sm:p-6 rounded-2xl bg-white/[0.03] border backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${colorMap[service.color]}`}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${iconBgMap[service.color]} border border-white/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shrink-0`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colorMap[service.color].split(' ')[0]}`} />
              </div>
              <h3 className="font-display font-semibold text-white text-base sm:text-lg mb-2">
                {service.title}
              </h3>
              <p className="font-sans text-xs sm:text-sm text-slate-400 leading-relaxed">
                {service.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
