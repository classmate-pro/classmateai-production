import { motion } from 'motion/react';
import logo from '../../utils/IMG-20260703-WA0446-removebg-preview.png';
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
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us', page: null },
      { label: 'Our Mission', page: null },
      { label: 'Careers', page: null },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help Center', page: null },
      { label: 'Contact Us', page: 'contact' as AppPage },
      { label: 'Pricing', page: 'pricing' as AppPage },
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
    <footer className="relative bg-[#F0EBE1] z-10 pt-14 pb-6">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-10 lg:gap-8">

          {/* Brand column */}
          <div className="lg:col-span-3 flex flex-col items-start">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="flex items-center cursor-pointer mb-5"
            >
              <img src={logo} alt="Classmate AI" className="w-32 md:w-36 h-auto object-contain" />
            </button>

            <p className="text-[13px] text-slate-600 leading-[1.7] max-w-sm font-medium">
              The AI-powered student platform trusted by 2.4M+ learners — helping students learn, scale, and connect with real-world outcomes.
            </p>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {FOOTER_LINKS.map((col) => (
              <div key={col.heading}>
                <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-800 mb-4">
                  {col.heading}
                </h4>
                <ul className="space-y-3">
                  {col.links.map(({ label, page }) => (
                    <li key={label}>
                      {page ? (
                        <button
                          type="button"
                          onClick={() => onNavigate(page)}
                          className="text-[13px] text-slate-600 font-medium hover:text-slate-900 transition-colors duration-200 cursor-pointer text-left inline-block"
                        >
                          {label}
                        </button>
                      ) : (
                        <a
                          href="#"
                          className="text-[13px] text-slate-600 font-medium hover:text-slate-900 transition-colors duration-200 inline-block"
                        >
                          {label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-300/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-slate-400 text-center md:text-left">
            © {new Date().getFullYear()} Classmate AI, Inc. · hello@classmateai.com
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-6">
            {['Privacy', 'Terms', 'Cookies'].map((item) => (
              <a key={item} href="#" className="text-[12px] text-slate-600 hover:text-slate-900 transition-colors font-medium">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
