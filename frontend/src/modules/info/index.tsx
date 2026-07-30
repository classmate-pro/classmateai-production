// ─── Info Module: company & legal pages ──────────────────────────────────────
// One config-driven component renders every informational page linked from the
// footer — About Us, Our Mission, Careers, Help Center, Privacy, Terms and
// Cookies — all using the landing design system (landing-* utility classes)
// so the whole site keeps a single visual theme.
import { useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles, Target, Heart, Globe2, Rocket, GraduationCap, ShieldCheck,
  HelpCircle, Briefcase, FileText, Cookie, Lock, Zap, ArrowRight, ArrowLeft,
  type LucideIcon,
} from 'lucide-react';
import { AppPage } from '../../types';
import Footer from '../../shared/components/Footer';
import LandingReveal, { LandingStaggerGrid, LandingStaggerItem } from '../landing/components/LandingReveal';

export type InfoPageId = 'about' | 'our-mission' | 'careers' | 'help' | 'privacy' | 'terms' | 'cookies';

export const INFO_PAGE_IDS: InfoPageId[] = ['about', 'our-mission', 'careers', 'help', 'privacy', 'terms', 'cookies'];

export function isInfoPage(page: AppPage): page is InfoPageId {
  return (INFO_PAGE_IDS as string[]).includes(page);
}

/* ── Content types ─────────────────────────────────────────────────────────── */
interface InfoCard { icon: LucideIcon; title: string; desc: string }
interface InfoFaq { q: string; a: string }
interface InfoRole { title: string; type: string; location: string; desc: string }

interface InfoSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  cards?: InfoCard[];
  faqs?: InfoFaq[];
  roles?: InfoRole[];
}

interface InfoContent {
  eyebrow: string;
  eyebrowIcon: LucideIcon;
  title: string;
  titleHighlight: string;
  lead: string;
  updated?: string;
  sections: InfoSection[];
  cta?: { text: string; label: string; page: AppPage };
}

/* ── Page content ──────────────────────────────────────────────────────────── */
const INFO_CONTENT: Record<InfoPageId, InfoContent> = {
  about: {
    eyebrow: 'About Us',
    eyebrowIcon: Sparkles,
    title: 'The Story Behind',
    titleHighlight: 'Classmate AI.',
    lead: 'We are a team of engineers, educators, and dreamers building the smart learning partner every student deserves — one that carries the busywork so learners can focus on actually learning.',
    sections: [
      {
        heading: 'Why we exist',
        paragraphs: [
          'Classmate AI started with a simple observation: students everywhere spend more time managing school than learning from it. Deadlines, submissions, scheduling, formatting, note-keeping — the administrative weight of education quietly steals the hours that should go to curiosity, rest, and growth.',
          'We built Classmate AI to take that weight off. Our platform automates assignments workflows, plans balanced study schedules, and answers questions instantly in any subject — so students in Mumbai, Lagos, São Paulo, or Tokyo get back the one resource they can never buy more of: time.',
        ],
      },
      {
        heading: 'What we value',
        cards: [
          { icon: GraduationCap, title: 'Students first', desc: 'Every feature starts with a real student problem — never technology looking for a use case.' },
          { icon: Globe2, title: 'Access for all', desc: 'A free tier, 40+ languages, and offline support — because talent is everywhere, opportunity is not.' },
          { icon: ShieldCheck, title: 'Privacy by default', desc: 'Your academic data belongs to you. It is encrypted, never sold, and always under your control.' },
          { icon: Zap, title: 'Relentless simplicity', desc: 'AI should feel effortless. If a feature needs a manual, it goes back to the drawing board.' },
        ],
      },
      {
        heading: 'Where we are today',
        paragraphs: [
          'Founded in 2024, Classmate AI now supports students across 190+ countries, saving learners an average of 12+ hours every week. We are a small, focused team — and we are just getting started.',
        ],
      },
    ],
    cta: { text: 'Want to learn with us?', label: 'Get Started Free', page: 'register' },
  },

  'our-mission': {
    eyebrow: 'Our Mission',
    eyebrowIcon: Target,
    title: 'Learning Without',
    titleHighlight: 'Limits.',
    lead: 'Our mission is to give every student on Earth an intelligent, adaptive learning companion — regardless of language, curriculum, bandwidth, or budget.',
    sections: [
      {
        heading: 'The problem we are solving',
        paragraphs: [
          'Academic pressure is a global epidemic. Students sacrifice sleep, health, and genuine curiosity just to keep up with the mechanics of school. The tools that could help are usually built for well-funded institutions, in one language, for one kind of learner.',
          'We believe the most powerful AI ever created should serve the people who need it most: students. Not as a shortcut around learning — but as a partner that removes the noise so deep learning can happen.',
        ],
      },
      {
        heading: 'How we get there',
        cards: [
          { icon: Globe2, title: 'Every language', desc: 'Native AI understanding in 40+ languages, with more added every quarter.' },
          { icon: GraduationCap, title: 'Every curriculum', desc: 'From CBSE to IB to national systems worldwide — Classmate AI adapts to how you are taught.' },
          { icon: Heart, title: 'Every budget', desc: 'A genuinely useful free tier, forever, for students who need it most.' },
          { icon: Rocket, title: 'Every device', desc: 'Phone, tablet, or shared computer — full functionality even on low bandwidth.' },
        ],
      },
      {
        heading: 'Our promise',
        bullets: [
          'We will never sell student data. Period.',
          'We will keep a free tier for as long as Classmate AI exists.',
          'We will build for the student with the least resources first — everyone benefits.',
          'We will amplify learning, never replace it.',
        ],
      },
    ],
    cta: { text: 'Join the mission as a learner.', label: 'Create Free Account', page: 'register' },
  },

  careers: {
    eyebrow: 'Careers',
    eyebrowIcon: Briefcase,
    title: 'Build the Future of',
    titleHighlight: 'Learning.',
    lead: 'We are a small team with an outsized mission. If you want your work to reach millions of students — and you like hard problems in AI, product, and education — we would love to meet you.',
    sections: [
      {
        heading: 'Life at Classmate AI',
        cards: [
          { icon: Rocket, title: 'High ownership', desc: 'Small team, big surface area. You will ship things that matter in your first week.' },
          { icon: Globe2, title: 'Remote-first', desc: 'Work from anywhere. We collaborate async and meet where the work is.' },
          { icon: GraduationCap, title: 'Learning budget', desc: 'Courses, books, and conferences — we invest in your growth, always.' },
          { icon: Heart, title: 'Mission-driven', desc: 'Every metric we chase ends in a student getting their time back.' },
        ],
      },
      {
        heading: 'Open roles',
        roles: [
          { title: 'AI Engineer', type: 'Full-time', location: 'Remote', desc: 'Build and optimize the LLM pipelines, agentic workflows, and evaluation systems behind our AI tutor.' },
          { title: 'Full-Stack Engineer', type: 'Full-time', location: 'Remote', desc: 'Own features end-to-end across our React frontend and Node services — from idea to production.' },
          { title: 'Product Designer', type: 'Full-time', location: 'Remote', desc: 'Design intuitive, accessible experiences for students juggling school, work, and life.' },
          { title: 'Community & Support Lead', type: 'Full-time', location: 'Remote', desc: 'Be the voice of our students — run the help center, gather feedback, and shape the roadmap.' },
        ],
      },
      {
        heading: 'Do not see your role?',
        paragraphs: [
          'We are always excited to meet exceptional people. Send your resume and a short note about what you would build at Classmate AI to hello@classmateai.com — we read every application.',
        ],
      },
    ],
  },

  help: {
    eyebrow: 'Help Center',
    eyebrowIcon: HelpCircle,
    title: 'How Can We',
    titleHighlight: 'Help?',
    lead: 'Quick answers to the questions we hear most. Cannot find what you need? Our team replies to every message — usually within a day.',
    sections: [
      {
        heading: 'Frequently asked questions',
        faqs: [
          { q: 'Is Classmate AI really free?', a: 'Yes. Our free tier includes the AI tutor, study scheduler, and notes tools with generous limits. Paid plans add higher usage limits and advanced features — see the Pricing page for details.' },
          { q: 'How do I create an account?', a: 'Click "Get Started Free" on the home page, then sign up with your email or continue with Google. You will be learning within sixty seconds.' },
          { q: 'Which languages does the AI tutor support?', a: 'Classmate AI understands and explains concepts in 40+ languages, including English, Hindi, Tamil, Telugu, Bengali, Marathi, Spanish, French, Arabic, Chinese, and Japanese.' },
          { q: 'Is my academic data private?', a: 'Absolutely. Your data is encrypted in transit and at rest, is never sold, and can be deleted on request. Read the full details in our Privacy Policy.' },
          { q: 'Can I use Classmate AI on my phone?', a: 'Yes — the entire platform is fully responsive and works on any modern browser across Android, iOS, tablets, and desktops.' },
          { q: 'I forgot my password. What do I do?', a: 'On the sign-in page, click "Forgot password?" and follow the instructions sent to your registered email.' },
          { q: 'How do I report a bug or suggest a feature?', a: 'We would love to hear from you! Reach us through the Contact page or email hello@classmateai.com.' },
        ],
      },
    ],
    cta: { text: 'Still stuck? We are here for you.', label: 'Contact Support', page: 'contact' },
  },

  privacy: {
    eyebrow: 'Legal',
    eyebrowIcon: Lock,
    title: 'Privacy',
    titleHighlight: 'Policy.',
    lead: 'Your trust matters more to us than any metric. This policy explains what we collect, why we collect it, and the control you always keep over your data.',
    updated: 'Last updated: July 2026',
    sections: [
      {
        heading: '1. Information we collect',
        paragraphs: [
          'Account information: your name, email address, and password (stored as a secure hash) when you register, or your basic Google profile if you sign in with Google.',
          'Learning content: notes, documents, questions, and study materials you upload or create, used solely to provide the service to you.',
          'Usage data: basic analytics such as feature usage and device type, used to improve the product.',
        ],
      },
      {
        heading: '2. How we use your information',
        bullets: [
          'To provide, personalize, and improve Classmate AI features.',
          'To keep your account secure and prevent abuse.',
          'To communicate essential service updates (never marketing spam).',
          'To understand aggregate usage so we can improve the product.',
        ],
      },
      {
        heading: '3. What we never do',
        bullets: [
          'We never sell your personal data to anyone.',
          'We never use your private study materials to advertise to you.',
          'We never share your data with third parties except processors essential to running the service, bound by strict agreements.',
        ],
      },
      {
        heading: '4. Data security',
        paragraphs: [
          'All data is encrypted in transit (TLS) and at rest. Access inside our team is limited, logged, and audited. Passwords are stored using industry-standard one-way hashing.',
        ],
      },
      {
        heading: '5. Your rights',
        paragraphs: [
          'You may access, correct, export, or permanently delete your data at any time. Email hello@classmateai.com and we will action your request promptly.',
        ],
      },
      {
        heading: '6. Contact',
        paragraphs: [
          'Questions about this policy? Reach our privacy team at hello@classmateai.com.',
        ],
      },
    ],
  },

  terms: {
    eyebrow: 'Legal',
    eyebrowIcon: FileText,
    title: 'Terms of',
    titleHighlight: 'Service.',
    lead: 'The short version: use Classmate AI to learn, be kind to the platform and other users, and we will always be straight with you. The details follow.',
    updated: 'Last updated: July 2026',
    sections: [
      {
        heading: '1. Acceptance of terms',
        paragraphs: [
          'By creating an account or using Classmate AI, you agree to these Terms of Service and our Privacy Policy. If you are under the age of majority in your region, you confirm you have permission from a parent or guardian.',
        ],
      },
      {
        heading: '2. Your account',
        bullets: [
          'You are responsible for keeping your login credentials secure.',
          'Provide accurate information and keep it up to date.',
          'One person per account — accounts may not be shared or transferred.',
        ],
      },
      {
        heading: '3. Acceptable use',
        bullets: [
          'Use Classmate AI as a learning companion, not to violate your institution’s academic integrity policies.',
          'Do not attempt to abuse, overload, reverse-engineer, or disrupt the service.',
          'Do not upload content that is unlawful, harmful, or infringes the rights of others.',
        ],
      },
      {
        heading: '4. Your content',
        paragraphs: [
          'You retain full ownership of the notes, documents, and materials you create or upload. You grant us only the limited license needed to store and process that content to provide the service to you.',
        ],
      },
      {
        heading: '5. Service availability',
        paragraphs: [
          'We work hard to keep Classmate AI available around the clock, but the service is provided "as is" without warranties of uninterrupted availability. We may update or modify features as the product evolves.',
        ],
      },
      {
        heading: '6. Termination',
        paragraphs: [
          'You may delete your account at any time. We may suspend accounts that violate these terms, and where reasonable we will warn you first.',
        ],
      },
      {
        heading: '7. Contact',
        paragraphs: [
          'Questions about these terms? Email hello@classmateai.com.',
        ],
      },
    ],
  },

  cookies: {
    eyebrow: 'Legal',
    eyebrowIcon: Cookie,
    title: 'Cookie',
    titleHighlight: 'Policy.',
    lead: 'We keep cookies to the minimum needed to sign you in and make the product work. Here is exactly what we store in your browser and why.',
    updated: 'Last updated: July 2026',
    sections: [
      {
        heading: '1. What are cookies?',
        paragraphs: [
          'Cookies and similar browser storage (such as localStorage) are small pieces of data a website saves on your device so it can remember you between visits.',
        ],
      },
      {
        heading: '2. What we store',
        bullets: [
          'Authentication tokens — keep you signed in securely between visits. Essential.',
          'Preferences — remember settings like your theme and language. Functional.',
          'Anonymous analytics — help us understand which features matter so we can improve them. Optional.',
        ],
      },
      {
        heading: '3. What we do not do',
        bullets: [
          'No third-party advertising cookies.',
          'No cross-site tracking of your browsing.',
          'No selling of any browsing or usage data.',
        ],
      },
      {
        heading: '4. Managing cookies',
        paragraphs: [
          'You can clear or block cookies in your browser settings at any time. Note that blocking essential storage will sign you out and some features may stop working.',
        ],
      },
      {
        heading: '5. Contact',
        paragraphs: [
          'Questions about cookies? Email hello@classmateai.com.',
        ],
      },
    ],
  },
};

/* ── Section renderer ──────────────────────────────────────────────────────── */
function Section({ section }: { section: InfoSection }) {
  return (
    <section className="mb-12 md:mb-16">
      {section.heading && (
        <h2 className="text-[22px] md:text-[28px] font-bold text-slate-900 mb-5">{section.heading}</h2>
      )}

      {section.paragraphs?.map((p, i) => (
        <p key={i} className="text-[15px] md:text-base text-slate-600 leading-relaxed mb-4 max-w-3xl">{p}</p>
      ))}

      {section.bullets && (
        <ul className="space-y-3 max-w-3xl">
          {section.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px] md:text-base text-slate-600 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
              {b}
            </li>
          ))}
        </ul>
      )}

      {section.cards && (
        <LandingStaggerGrid className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
          {section.cards.map((card, i) => (
            <LandingStaggerItem key={i} className="landing-card group">
              <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                <card.icon className="w-4 h-4 text-slate-600 group-hover:text-emerald-600 transition-colors" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{card.title}</h3>
              <p className="text-[14px] text-slate-500 leading-relaxed">{card.desc}</p>
            </LandingStaggerItem>
          ))}
        </LandingStaggerGrid>
      )}

      {section.faqs && (
        <LandingStaggerGrid className="space-y-4 max-w-3xl">
          {section.faqs.map((faq, i) => (
            <LandingStaggerItem key={i}>
              <details className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden group transition-shadow hover:shadow-md">
                <summary className="flex items-center justify-between gap-4 px-6 py-5 font-bold text-slate-900 text-[15px] md:text-base list-none [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <ArrowRight className="w-4 h-4 shrink-0 text-emerald-500 transition-transform group-open:rotate-90" />
                </summary>
                <p className="px-6 pb-5 text-[14px] md:text-[15px] text-slate-600 leading-relaxed">{faq.a}</p>
              </details>
            </LandingStaggerItem>
          ))}
        </LandingStaggerGrid>
      )}

      {section.roles && (
        <LandingStaggerGrid className="space-y-5">
          {section.roles.map((role, i) => (
            <LandingStaggerItem key={i} className="landing-card flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900">{role.title}</h3>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 mt-1">
                  {role.type} · {role.location}
                </p>
                <p className="text-[14px] text-slate-500 leading-relaxed mt-2">{role.desc}</p>
              </div>
              <a
                href={`mailto:hello@classmateai.com?subject=${encodeURIComponent(`Application: ${role.title}`)}`}
                className="inline-flex items-center justify-center gap-2 self-start sm:self-center shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-[13px] font-semibold text-emerald-700 transition-all hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
              >
                Apply <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </LandingStaggerItem>
          ))}
        </LandingStaggerGrid>
      )}
    </section>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────────── */
interface InfoPageProps {
  page: InfoPageId;
  onNavigate: (page: AppPage) => void;
}

export default function InfoPage({ page, onNavigate }: InfoPageProps) {
  const content = INFO_CONTENT[page];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const EyebrowIcon = content.eyebrowIcon;

  return (
    <div className="landing-page min-h-dvh bg-white flex flex-col relative z-10">
      {/* key={page} re-mounts the content when switching pages so the entrance
          animation plays again (e.g. jumping Privacy → Terms via the footer) */}
      <main key={page} className="flex-1">
        {/* ── Back button ── */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="landing-container pt-24 md:pt-28"
        >
          <button
            onClick={() => onNavigate('home')}
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-500 shadow-sm transition-all hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Home
          </button>
        </motion.div>

        {/* ── Page header ── */}
        <div className="landing-container pt-8 md:pt-10 pb-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="landing-eyebrow mb-8"
          >
            <EyebrowIcon className="w-3.5 h-3.5 text-emerald-600" />
            {content.eyebrow}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="landing-section-title mb-6"
          >
            {content.title} <span className="text-emerald-500">{content.titleHighlight}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="landing-lead max-w-2xl mx-auto"
          >
            {content.lead}
          </motion.p>
          {content.updated && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.34 }}
              className="mt-4 text-[11px] font-bold uppercase tracking-widest text-slate-400"
            >
              {content.updated}
            </motion.p>
          )}
        </div>

        {/* ── Sections — revealed as they scroll into view ── */}
        <div className="landing-container pt-12 md:pt-16 pb-8 text-left">
          {content.sections.map((section, i) => (
            <LandingReveal key={i} delay={i === 0 ? 0.1 : 0} y={32}>
              <Section section={section} />
            </LandingReveal>
          ))}

          {/* ── CTA ── */}
          {content.cta && (
            <LandingReveal y={32}>
              <div className="text-center rounded-[24px] bg-emerald-50/60 border border-emerald-100 px-6 py-12 md:py-16 mb-16">
                <p className="landing-section-desc mb-8">{content.cta.text}</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onNavigate(content.cta!.page)}
                  className="landing-btn landing-btn-primary"
                >
                  {content.cta.label} <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </LandingReveal>
          )}
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
