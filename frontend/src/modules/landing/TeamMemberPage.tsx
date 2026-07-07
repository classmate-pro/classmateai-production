import { ArrowLeft, Linkedin } from 'lucide-react';
import { AppPage } from '../../types';
import { getTeamMember, type JourneyStep } from './teamData';

interface TeamMemberPageProps {
  slug: string;
  onNavigate: (page: AppPage) => void;
}

function JourneyTimeline({ steps }: { steps: JourneyStep[] }) {
  return (
    <div className="relative pl-7">
      <div className="absolute left-[5px] top-2 bottom-2 w-px bg-stone-200" aria-hidden="true" />
      <ul className="space-y-8">
        {steps.map((step) => (
          <li key={step.period + step.title} className="relative">
            <span
              className="absolute -left-7 top-1.5 h-2.5 w-2.5 border-2 border-amber-600 bg-white"
              aria-hidden="true"
            />
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone-400">
              {step.period}
            </p>
            <p className="mt-1 text-[15px] font-bold text-slate-900">{step.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{step.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Portrait({ initials, name }: { initials: string; name: string }) {
  return (
    <div
      className="relative aspect-[4/5] w-full max-w-[340px] overflow-hidden bg-stone-100 grayscale"
      role="img"
      aria-label={`Portrait of ${name}`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-stone-200/40 to-stone-300/60" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="select-none text-[72px] font-extralight tracking-tight text-stone-400/80">
          {initials}
        </span>
      </div>
    </div>
  );
}

export default function TeamMemberPage({ slug, onNavigate }: TeamMemberPageProps) {
  const member = getTeamMember(slug);

  if (!member) {
    return (
      <div className="min-h-screen bg-white pt-28 px-6">
        <div className="landing-container py-16 text-center">
          <p className="text-slate-500">Team member not found.</p>
          <button
            onClick={() => onNavigate('home')}
            className="mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  const goBack = () => {
    onNavigate('home');
    setTimeout(() => {
      document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="landing-container px-6 pt-28 pb-20 md:pt-32">
        <button
          onClick={goBack}
          className="mb-10 inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 transition-colors hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Team
        </button>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-stone-400">
              {member.label}
            </p>
            <h1 className="mt-3 text-[28px] font-extrabold uppercase leading-[1.05] tracking-tight text-slate-900 sm:text-[34px] lg:text-[38px]">
              {member.name}
            </h1>
            <p className="mt-2 text-[12px] font-bold uppercase tracking-[0.14em] text-stone-400">
              {member.role}
            </p>

            <div className="mt-8 lg:mt-10">
              <Portrait initials={member.initials} name={member.name} />
            </div>

            <a
              href={member.linkedin}
              aria-label={`${member.name} on LinkedIn`}
              className="mt-4 inline-flex h-8 w-8 items-center justify-center bg-[#E87722] text-white transition-opacity hover:opacity-90"
            >
              <Linkedin className="h-4 w-4 fill-current" strokeWidth={0} />
            </a>

            <div className="mt-8 max-w-lg space-y-5">
              {member.bio.map((paragraph, i) => (
                <p key={i} className="text-[14px] leading-[1.75] text-slate-600 sm:text-[15px]">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="lg:pt-14">
            <p className="mb-8 text-[11px] font-bold uppercase tracking-[0.22em] text-stone-400">
              Journey
            </p>
            <JourneyTimeline steps={member.journey} />
          </div>
        </div>
      </div>
    </div>
  );
}
