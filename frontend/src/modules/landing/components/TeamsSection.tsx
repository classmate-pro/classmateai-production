import { Linkedin, ArrowRight, Users } from 'lucide-react';
import LandingReveal, { LandingStaggerGrid, LandingStaggerItem } from './LandingReveal';
import { TEAM_MEMBERS } from '../teamData';

interface TeamsSectionProps {
  onViewMember: (slug: string) => void;
}

function Portrait({ initials, name }: { initials: string; name: string }) {
  return (
    <div
      className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100 grayscale"
      role="img"
      aria-label={`Portrait of ${name}`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-stone-200/40 to-stone-300/60" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="select-none text-4xl font-extralight tracking-tight text-stone-400/80">
          {initials}
        </span>
      </div>
    </div>
  );
}

export default function TeamsSection({ onViewMember }: TeamsSectionProps) {
  return (
    <section id="team" className="landing-section-pad relative z-10">
      <div className="landing-container">
        <LandingReveal>
          <div className="mb-12 md:mb-14">
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

        <LandingStaggerGrid className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
          {TEAM_MEMBERS.map((member) => (
            <LandingStaggerItem key={member.slug}>
              <article className="flex h-full flex-col">
                <Portrait initials={member.initials} name={member.name} />

                <a
                  href={member.linkedin}
                  aria-label={`${member.name} on LinkedIn`}
                  className="mt-3 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-800 to-emerald-500 text-white shadow-sm shadow-emerald-500/20 transition-opacity hover:opacity-90"
                >
                  <Linkedin className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
                </a>

                <h3 className="mt-3 text-[13px] font-bold uppercase leading-snug tracking-tight text-slate-900 sm:text-sm">
                  {member.name}
                </h3>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400 leading-snug">
                  {member.role}
                </p>

                <button
                  onClick={() => onViewMember(member.slug)}
                  className="group mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
                >
                  Know More
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </article>
            </LandingStaggerItem>
          ))}
        </LandingStaggerGrid>
      </div>
    </section>
  );
}
