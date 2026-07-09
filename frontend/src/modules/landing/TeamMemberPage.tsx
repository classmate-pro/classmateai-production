import { ArrowLeft, Linkedin } from 'lucide-react';
import { AppPage } from '../../types';
import { getTeamMember, type JourneyStep } from './teamData';

interface TeamMemberPageProps {
  slug: string;
  onNavigate: (page: AppPage) => void;
}

/* ── Timeline ─────────────────────────────────────────────────────────────── */
function JourneyTimeline({ steps }: { steps: JourneyStep[] }) {
  return (
    <div className="relative pl-6">
      {/* Vertical rule */}
      <div
        className="absolute left-[4px] top-2 bottom-2 w-px bg-stone-200"
        aria-hidden="true"
      />
      <ul className="space-y-4">
        {steps.map((step) => (
          <li key={step.period + step.title} className="relative">
            {/* Dot marker */}
            <span
              className="absolute -left-6 top-1.5 h-2 w-2 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">
              {step.period}
            </p>
            <p className="text-[13px] font-bold text-slate-800 leading-snug">
              {step.title}
            </p>
            <p className="text-[12px] leading-relaxed text-slate-400">
              {step.description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Portrait ─────────────────────────────────────────────────────────────── */
function Portrait({ initials, name, avatar }: { initials: string; name: string; avatar?: string }) {
  return (
    <div
      className="relative mx-auto overflow-hidden rounded-full bg-stone-100 shadow-lg border-4 border-white ring-2 ring-emerald-100"
      style={{ width: '320px', height: '320px', minWidth: '320px', minHeight: '320px' }}
      role="img"
      aria-label={`Portrait of ${name}`}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className={`absolute inset-0 h-full w-full object-cover ${
            avatar.includes('pravin') ? 'object-center scale-[1.28]' : 'object-center scale-[1.32]'
          }`}
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-stone-200 via-stone-100 to-stone-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="select-none text-[60px] font-extralight tracking-tight text-stone-400/60">
              {initials}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function TeamMemberPage({ slug, onNavigate }: TeamMemberPageProps) {
  const member = getTeamMember(slug);

  const goBack = () => {
    onNavigate('home');
    setTimeout(() => {
      document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  if (!member) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">Team member not found.</p>
          <button
            onClick={() => onNavigate('home')}
            className="mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-500"
          >
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white overflow-hidden flex flex-col">
      {/* ── Top bar ── */}
      <div className="px-8 pt-20 pb-3 border-b border-stone-100">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 text-[12px] font-semibold text-slate-400 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Team
        </button>
      </div>

      {/* ── Content grid ── */}
      <div className="flex-1 overflow-hidden px-8 py-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 h-full lg:items-center">

          {/* Left: portrait */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <Portrait initials={member.initials} name={member.name} avatar={member.avatar} />
              {/* LinkedIn badge */}
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} on LinkedIn`}
                className="absolute bottom-2 right-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-700 to-emerald-500 text-white shadow-md transition-all hover:scale-105 hover:opacity-90"
              >
                <Linkedin className="h-4 w-4 fill-current" strokeWidth={0} />
              </a>
            </div>
            {/* Name & Role below image on mobile */}
            <div className="text-center lg:hidden">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">{member.label}</p>
              <h1 className="mt-1 text-[24px] font-extrabold uppercase tracking-tight text-slate-900">{member.name}</h1>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">{member.role}</p>
            </div>
          </div>

          {/* Right: info + journey */}
          <div className="flex flex-col justify-center overflow-hidden">
            {/* Eyebrow */}
            <p className="hidden lg:block text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-500">
              {member.label}
            </p>

            {/* Name */}
            <h1 className="hidden lg:block mt-2 text-[28px] font-extrabold uppercase leading-[1.05] tracking-tight text-slate-900 lg:text-[34px]">
              {member.name}
            </h1>

            {/* Role */}
            <p className="hidden lg:block mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
              {member.role}
            </p>

            {/* Tagline */}
            <p className="mt-4 text-[13px] italic font-medium leading-relaxed text-slate-500 border-l-2 border-emerald-400 pl-3">
              "{member.tagline}"
            </p>

            {/* Divider */}
            <div className="my-4 h-px bg-stone-100" />

            {/* Journey label */}
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-stone-400">
              Journey
            </p>

            {/* Timeline */}
            <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
              <JourneyTimeline steps={member.journey} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
