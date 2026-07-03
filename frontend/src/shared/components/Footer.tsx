import { motion } from 'motion/react';
import {
  Globe,
  Twitter,
  Github,
  Linkedin,
  Youtube,
  Mail,
  ArrowRight,
  Zap,
  Shield,
  BookOpen,
  Users,
  HeadphonesIcon,
} from 'lucide-react';
import { AppPage } from '../../types';

interface FooterProps {
  onNavigate: (page: AppPage) => void;
}

const FOOTER_LINKS = [
  {
    heading: 'Platform',
    links: [
      { label: 'AI Assignment Assistant', page: null },
      { label: 'Smart Scheduler', page: null },
      { label: '24/7 AI Tutor', page: null },
      { label: 'Research Hub', page: null },
      { label: 'Workload Analytics', page: null },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Nexus', page: null },
      { label: 'Our Mission', page: null },
      { label: 'Careers', page: null },
      { label: 'Press Kit', page: null },
      { label: 'Blog', page: null },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Documentation', page: null },
      { label: 'API Reference', page: null },
      { label: 'Student Guides', page: null },
      { label: 'Community Forum', page: null },
      { label: 'Status Page', page: null },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help Center', page: null },
      { label: 'Contact Us', page: 'contact' as AppPage },
      { label: 'Pricing', page: 'pricing' as AppPage },
      { label: 'Privacy Policy', page: null },
      { label: 'Terms of Service', page: null },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Github, label: 'GitHub', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Youtube, label: 'YouTube', href: '#' },
];

const BADGES = [
  { icon: Shield, label: 'SOC 2 Certified' },
  { icon: Globe, label: 'GDPR Compliant' },
  { icon: Zap, label: '99.9% Uptime' },
  { icon: Users, label: '2.4M+ Students' },
];

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="relative mt-0 border-t border-white/[0.06] overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05050f]/80 to-[#020617] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(0,240,255,0.04),transparent)] pointer-events-none" />

      {/* Newsletter strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative border-b border-white/[0.06]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-10 flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="font-display font-semibold text-white text-base">Stay in the loop</p>
              <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                Weekly AI study tips &amp; platform updates — no spam, unsubscribe anytime.
              </p>
            </div>
          </div>
          <form
            onSubmit={e => e.preventDefault()}
            className="flex w-full md:w-auto gap-2 mt-1"
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 md:w-64 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition-all"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-lg shadow-indigo-500/20"
            >
              Subscribe <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </form>
        </div>
      </motion.div>

      {/* Main footer grid */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12">

          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            {/* Logo */}
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="flex items-start mb-5 cursor-pointer"
            >
              <img
                src="/logo.png"
                alt="Nexus Student"
                style={{
                  height: '36px',
                  width: 'auto',
                  maxWidth: '140px',
                  objectFit: 'contain',
                  objectPosition: 'left center',
                  mixBlendMode: 'lighten',
                  filter: 'drop-shadow(0 0 5px rgba(0,240,255,0.28))',
                  userSelect: 'none',
                }}
              />
            </button>

            <p className="font-sans text-sm text-slate-400 leading-relaxed mb-6">
              The AI-powered student platform trusted by 2.4M+ learners across 190+ countries.
              Smarter studying starts here.
            </p>

            {/* Social icons */}
            <div className="flex gap-2.5">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Link columns */}
          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {FOOTER_LINKS.map((col, colIdx) => (
              <motion.div
                key={col.heading}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: colIdx * 0.07, duration: 0.5 }}
              >
                <h4 className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-4">
                  {col.heading}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map(({ label, page }) => (
                    <li key={label}>
                      {page ? (
                        <button
                          type="button"
                          onClick={() => onNavigate(page)}
                          className="font-sans text-sm text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer text-left hover:translate-x-0.5 inline-block transition-transform"
                        >
                          {label}
                        </button>
                      ) : (
                        <a
                          href="#"
                          className="font-sans text-sm text-slate-400 hover:text-white transition-colors duration-200 hover:translate-x-0.5 inline-block transition-transform"
                        >
                          {label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-wrap gap-2 sm:gap-3 mt-10 md:mt-12 pt-6 md:pt-8 border-t border-white/[0.05]"
        >
          {BADGES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.07] text-slate-500"
            >
              <Icon className="w-3.5 h-3.5 text-cyan-500/70" />
              <span className="font-mono text-[10px] uppercase tracking-wider">{label}</span>
            </div>
          ))}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.07] text-slate-500 sm:ml-auto">
            <BookOpen className="w-3.5 h-3.5 text-cyan-500/70" />
            <span className="font-mono text-[10px] uppercase tracking-wider">Student First</span>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6"
        >
          <p className="font-mono text-[10px] text-slate-600 text-center sm:text-left">
            © {new Date().getFullYear()} Nexus Student, Inc. — All rights reserved.
            Built with 💙 for every student on Earth.
          </p>
          <div className="flex items-center gap-1.5">
            <HeadphonesIcon className="w-3.5 h-3.5 text-cyan-500/50" />
            <span className="font-mono text-[10px] text-slate-600">
              24/7 Support:{' '}
              <a href="mailto:help@nexusstudent.ai" className="text-cyan-500/60 hover:text-cyan-400 transition-colors">
                help@nexusstudent.ai
              </a>
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
