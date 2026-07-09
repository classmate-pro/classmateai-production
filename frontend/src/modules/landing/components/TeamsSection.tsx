import { Linkedin, ArrowRight, Users } from 'lucide-react';
import LandingReveal from './LandingReveal';
import { TEAM_MEMBERS, type TeamMember } from '../teamData';

interface TeamsSectionProps {
  onViewMember: (slug: string) => void;
}

function Portrait({ initials, name, avatar }: { initials: string; name: string; avatar?: string }) {
  return (
    <div
      className="relative mx-auto w-72 h-72 md:w-[420px] md:h-[420px] overflow-hidden rounded-full bg-stone-200 shadow-xl border-4 border-white transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-emerald-200 group-hover:scale-[1.03]"
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
          <div className="absolute inset-0 bg-gradient-to-br from-stone-300/60 via-stone-200/40 to-stone-400/60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="select-none text-8xl font-extralight tracking-tight text-stone-400/60">
              {initials}
            </span>
          </div>
        </>
      )}
      {/* Subtle overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/10 to-transparent" />
    </div>
  );
}

interface FounderCardProps {
  member: TeamMember;
  reverse: boolean;
  onViewMember: (slug: string) => void;
  index: number;
}

function FounderCard({ member, reverse, onViewMember, index }: FounderCardProps) {
  const imageBlock = (
    <div className="flex-none flex items-center justify-center w-full lg:w-[420px]">
      <div className="relative group">
        <Portrait initials={member.initials} name={member.name} avatar={member.avatar} />
        {/* LinkedIn badge over the image */}
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${member.name} on LinkedIn`}
          className="absolute bottom-5 right-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-800 to-emerald-500 text-white shadow-md shadow-emerald-500/30 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/50"
        >
          <Linkedin className="h-5 w-5 fill-current" strokeWidth={0} />
        </a>
      </div>
    </div>
  );

  const textBlock = (
    <div className="flex-1 min-w-0 flex flex-col justify-center py-6 lg:py-0">
      {/* Eyebrow */}
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-500">
        {member.label}
      </p>
      
      {/* Name */}
      <h3 className="mt-3 text-[30px] font-extrabold uppercase leading-[1.05] tracking-tight text-slate-900 sm:text-[36px]">
        {member.name}
      </h3>

      {/* Role */}
      <p className="mt-1.5 text-[12px] font-bold uppercase tracking-[0.16em] text-stone-400">
        {member.role}
      </p>

      {/* Tagline */}
      <p className="mt-5 text-[15px] font-semibold leading-snug text-slate-700 italic max-w-sm">
        "{member.tagline}"
      </p>

      {/* Divider */}
      <div className="my-6 h-px w-16 bg-stone-200" />

      {/* Bio paragraphs */}
      <div className="space-y-4 max-w-md">
        {member.bio.map((paragraph, i) => (
          <p key={i} className="text-[14px] leading-[1.78] text-slate-500">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Know More */}
      <button
        id={`know-more-${member.slug}`}
        onClick={() => onViewMember(member.slug)}
        className="group mt-8 inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-[13px] font-semibold text-emerald-700 transition-all hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-500/20"
      >
        Know More
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );

  return (
    <LandingReveal delay={index * 0.08}>
      <article
        className="group/card flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:gap-24 lg:items-center rounded-2xl p-6 lg:p-8 transition-all duration-500 hover:bg-emerald-50/40 hover:shadow-xl hover:shadow-emerald-100 hover:-translate-y-1"
      >
        <div className={reverse ? 'lg:order-2' : 'lg:order-1'}>{imageBlock}</div>
        <div className={reverse ? 'lg:order-1' : 'lg:order-2'}>{textBlock}</div>
      </article>
    </LandingReveal>
  );
}

const FOUNDERS = TEAM_MEMBERS.filter(
  (m) => m.slug === 'pravin-sarule' || m.slug === 'rutuja-dalal',
);

export default function TeamsSection({ onViewMember }: TeamsSectionProps) {
  return (
    <section id="team" className="landing-section-pad relative z-10">
      <div className="landing-container">
        <LandingReveal>
          <div className="mb-14 md:mb-20">
            <div className="landing-eyebrow mb-10">
              <Users className="h-3.5 w-3.5 text-emerald-600" />
              Core Team
            </div>
            <h2 className="landing-section-title">
              The People Behind <br />
              <span className="text-emerald-500">Your Smart Partner.</span>
            </h2>
          </div>
        </LandingReveal>

        <div className="space-y-20 md:space-y-28">
          {FOUNDERS.map((member, idx) => (
            <FounderCard
              key={member.slug}
              member={member}
              reverse={idx % 2 !== 0}
              onViewMember={onViewMember}
              index={idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
