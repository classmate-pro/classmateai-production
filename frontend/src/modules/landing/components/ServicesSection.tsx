import { Sparkles, CalendarClock, MessageSquare, Users, BarChart3, ArrowRight } from 'lucide-react';
import { LandingStaggerGrid, LandingStaggerItem } from './LandingReveal';

const SERVICES = [
  {
    title: 'AI Assignment Assistant',
    desc: 'Auto-summarize readings, draft outlines, and organize submissions — cut homework time by up to 60%.',
    icon: Sparkles,
    highlight: true,
  },
  {
    title: 'Smart Study Scheduler',
    desc: 'AI builds balanced timetables around your classes, exams, and life — no more burnout cycles.',
    icon: CalendarClock,
    highlight: false,
  },
  {
    title: '24/7 AI Tutor',
    desc: 'Instant explanations in any subject, any language. Ask questions at 2 AM and get real answers.',
    icon: MessageSquare,
    highlight: false,
  },
  {
    title: 'Global Collaboration',
    desc: 'Connect with study groups worldwide, share notes, and co-edit projects in real time.',
    icon: Users,
    highlight: true,
  },
  {
    title: 'Workload Analytics',
    desc: 'Track stress levels, predict crunch weeks, and get AI recommendations to stay ahead.',
    icon: BarChart3,
    highlight: false,
  },
];

export default function ServicesSection() {
  return (
    <section id="features" className="landing-section-pad relative z-10">
      <div className="landing-container text-center">

        {/* Header */}
        <div className="landing-eyebrow mb-10">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Everything you need
        </div>

        <h2 className="landing-section-title mb-8">
          Services That <br className="hidden md:block" />
          <span className="text-emerald-500">Lighten Your Load</span>
        </h2>

        <p className="landing-section-desc max-w-2xl mx-auto mb-20">
          Everything a student needs — from first lecture to final exam — powered by AI that works while you sleep.
        </p>

        {/* Grid */}
        <LandingStaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {SERVICES.map((service, idx) => (
            <LandingStaggerItem
              key={idx}
              className="landing-card group flex flex-col relative overflow-hidden"
            >
              {service.highlight && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110" />
              )}
              
              <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                <service.icon className="w-4 h-4 text-slate-600 group-hover:text-emerald-600 transition-colors" strokeWidth={2} />
              </div>
              
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
              <p className="text-[15px] text-slate-500 leading-relaxed mb-6 flex-grow">{service.desc}</p>
              
              <div className="mt-auto pt-4 border-t border-slate-100/50 flex items-center justify-between">
                <button className="text-[13px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-600 transition-colors flex items-center gap-1.5 cursor-pointer">
                  Learn more <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </LandingStaggerItem>
          ))}
        </LandingStaggerGrid>
        
      </div>
    </section>
  );
}
