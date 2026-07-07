import { UserPlus, CloudLightning, Wand2, Trophy } from 'lucide-react';
import { LandingStaggerGrid, LandingStaggerItem } from './LandingReveal';

const STEPS = [
  {
    num: '01',
    title: 'Sign up in seconds',
    desc: 'Create your account with email or Google. Tell us your subjects, exams, and goals.',
    icon: UserPlus,
  },
  {
    num: '02',
    title: 'Sync your syllabus',
    desc: 'Upload notes, PDFs, or connect Google Classroom. Classmate AI learns your curriculum instantly.',
    icon: CloudLightning,
  },
  {
    num: '03',
    title: 'Let AI plan your week',
    desc: 'Get a personalized study schedule with breaks, revision cycles, and priority tasks.',
    icon: Wand2,
  },
  {
    num: '04',
    title: 'Learn, ace, repeat',
    desc: 'Practice with adaptive quizzes, chat with your AI tutor, and watch your grades climb.',
    icon: Trophy,
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="landing-section-pad relative overflow-hidden z-10">
      <div className="landing-container relative z-10">

        {/* Header */}
        <div className="text-center mb-24">
          <div className="landing-eyebrow mb-10">
            <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
            How it works
          </div>

          <h2 className="landing-section-title mb-8">
            From chaos to clarity <br className="hidden md:block" />
            <span className="text-emerald-500">in 4 steps</span>
          </h2>

          <p className="landing-section-desc max-w-2xl mx-auto">
            Set it up once. Let Classmate AI carry the mental load, every single day.
          </p>
        </div>

        {/* Timeline Steps */}
        <div className="relative">
          <LandingStaggerGrid className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {STEPS.map((step, idx) => (
              <LandingStaggerItem key={idx} className="flex flex-col items-center md:items-start group relative">
                
                {/* Connecting Line to next step */}
                {idx !== STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-[31px] left-[32px] w-[calc(100%+2rem)] h-[2px] bg-emerald-200 z-0" />
                )}
                
                {/* Node & Icon Container */}
                <div className="relative mb-8 flex flex-col items-center md:items-start w-full">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:border-emerald-200 z-10 relative">
                    <step.icon className="w-6 h-6 text-slate-800 group-hover:text-emerald-600 transition-colors" strokeWidth={2.5} />
                  </div>
                  {/* Step Number Badge */}
                  <div className="absolute -top-3 -right-2 md:left-12 md:-top-3 w-8 h-8 bg-black text-white rounded flex items-center justify-center text-[11px] font-extrabold tracking-widest z-20 shadow-md">
                    {step.num}
                  </div>
                </div>

                {/* Text Content */}
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-extrabold text-[#0A0A0A] mb-3 tracking-tight">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{step.desc}</p>
                </div>
              </LandingStaggerItem>
            ))}
          </LandingStaggerGrid>
        </div>
        
      </div>
    </section>
  );
}
