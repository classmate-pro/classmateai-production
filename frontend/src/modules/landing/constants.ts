import { Brain, Calendar, BookOpen, Users, BarChart3 } from 'lucide-react';

export const AI_QUOTES = [
  {
    text: 'Your mind was built for discovery — not drowning in busywork. Let Nexus AI carry the load so you can learn what truly matters.',
    author: 'Nexus AI Mentor',
  },
  {
    text: 'Students across 190+ countries save 12+ hours every week. Less stress. More sleep. Better grades. That future starts now.',
    author: 'Global Impact Engine',
  },
  {
    text: 'Every assignment, deadline, and study session — orchestrated by intelligence that understands you. Work smarter, not harder.',
    author: 'Synapse Learning Core',
  },
  {
    text: 'You are not alone in this journey. Millions of students worldwide trust Nexus to turn chaos into clarity.',
    author: 'Hyperion Academy Network',
  },
  {
    text: 'The world needs your ideas, not your exhaustion. Automate the repetitive. Amplify the extraordinary.',
    author: 'Quantum Cadet Protocol',
  },
];

export const SERVICES = [
  {
    icon: Brain,
    title: 'AI Assignment Assistant',
    desc: 'Auto-summarize readings, draft outlines, and organize submissions — cut homework time by up to 60%.',
    color: 'cyan',
  },
  {
    icon: Calendar,
    title: 'Smart Study Scheduler',
    desc: 'AI builds balanced timetables around your classes, exams, and life — no more burnout cycles.',
    color: 'purple',
  },
  {
    icon: BookOpen,
    title: '24/7 AI Tutor',
    desc: 'Instant explanations in any subject, any language. Ask questions at 2 AM and get real answers.',
    color: 'pink',
  },
  {
    icon: Users,
    title: 'Global Collaboration',
    desc: 'Connect with study groups worldwide, share notes, and co-edit projects in real time.',
    color: 'green',
  },
  {
    icon: BarChart3,
    title: 'Workload Analytics',
    desc: 'Track stress levels, predict crunch weeks, and get AI recommendations to stay ahead.',
    color: 'cyan',
  },
];

export const STATS = [
  { value: '2.4M+', label: 'Students Worldwide' },
  { value: '12hrs', label: 'Saved Per Week' },
  { value: '190+', label: 'Countries Connected' },
  { value: '98%', label: 'Satisfaction Rate' },
];

export const colorMap: Record<string, string> = {
  cyan:   'text-cyber-cyan border-cyber-cyan/30 shadow-cyan-500/10',
  purple: 'text-cyber-purple border-cyber-purple/30 shadow-purple-500/10',
  pink:   'text-cyber-pink border-cyber-pink/30 shadow-pink-500/10',
  amber:  'text-cyber-amber border-cyber-amber/30 shadow-amber-500/10',
  green:  'text-cyber-green border-cyber-green/30 shadow-green-500/10',
};

export const iconBgMap: Record<string, string> = {
  cyan:   'bg-cyan-500/10',
  purple: 'bg-purple-500/10',
  pink:   'bg-pink-500/10',
  amber:  'bg-amber-500/10',
  green:  'bg-green-500/10',
};
