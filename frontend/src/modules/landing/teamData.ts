export interface JourneyStep {
  period: string;
  title: string;
  description: string;
}

export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  label: string;
  tagline: string;
  bio: string[];
  initials: string;
  linkedin: string;
  journey: JourneyStep[];
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    slug: 'alex-rivera',
    name: 'Alex Rivera',
    role: 'Founder & CEO',
    label: 'Founder',
    tagline: 'Building Classmate AI to give every student their time back.',
    initials: 'AR',
    linkedin: '#',
    bio: [
      'Alex started Classmate AI after watching students — including his own younger siblings — spend more time managing deadlines than actually learning. He saw an opportunity to build technology that gives time back instead of taking it away.',
      'Before Classmate AI, Alex spent years building AI products at scale and working closely with educators to understand what students truly need. Today, he leads a team united by one belief: every student deserves a smart partner that reduces workload and amplifies potential.',
    ],
    journey: [
      { period: '2016', title: 'B.S. Computer Science', description: 'Graduated with focus on machine learning and human-computer interaction.' },
      { period: '2017–20', title: 'Software Engineer, Ed-Tech', description: 'Built adaptive learning tools used by 200K+ students across North America.' },
      { period: '2021–23', title: 'ML Lead, AI Platform', description: 'Scaled NLP systems for document understanding and intelligent scheduling.' },
      { period: '2023', title: 'Founded Classmate AI', description: 'Launched the smart learning partner to automate assignments and study planning.' },
      { period: '2024–Now', title: '2.4M+ Students Worldwide', description: 'Growing a global platform helping students save 12+ hours every week.' },
    ],
  },
  {
    slug: 'arjun-mehta',
    name: 'Arjun Mehta',
    role: 'Co-Founder & CTO',
    label: 'Co-Founder',
    tagline: 'Architecting AI systems for personalized learning at global scale.',
    initials: 'AM',
    linkedin: '#',
    bio: [
      'Arjun co-founded Classmate AI to solve the engineering challenges behind truly personalized education. He believes great AI should feel invisible — quietly handling the busywork so students can focus on understanding.',
      'Previously, he led backend and ML infrastructure teams at high-growth startups, designing systems that processed millions of documents daily. At Classmate AI, he oversees the entire technical stack from model training to real-time tutoring interfaces.',
    ],
    journey: [
      { period: '2015', title: 'B.Tech, IIT Delhi', description: 'Specialized in distributed systems and artificial intelligence.' },
      { period: '2016–19', title: 'Backend Engineer, FinTech', description: 'Built low-latency data pipelines serving 1M+ daily transactions.' },
      { period: '2019–22', title: 'Staff Engineer, AI Startup', description: 'Led a team of 12 building document intelligence APIs.' },
      { period: '2023', title: 'Co-Founded Classmate AI', description: 'Designed the core AI architecture powering assignment and tutor features.' },
      { period: '2024–Now', title: 'Scaling Global Infrastructure', description: 'Expanding platform reliability across 190+ countries.' },
    ],
  },
  {
    slug: 'priya-sharma',
    name: 'Priya Sharma',
    role: 'Head of AI Research',
    label: 'Research Lead',
    tagline: 'Turning cutting-edge models into tutors that understand how students learn.',
    initials: 'PS',
    linkedin: '#',
    bio: [
      'Priya bridges the gap between academic AI research and products students actually use. Her work focuses on making large language models safer, more accurate, and genuinely helpful for learners at every level.',
      'She holds a Ph.D. in Natural Language Processing and has published on adaptive tutoring systems and multilingual education. At Classmate AI, she leads research into personalized explanation strategies and stress-aware study recommendations.',
    ],
    journey: [
      { period: '2014', title: 'B.S. Mathematics & CS', description: 'Graduated summa cum laude with honors thesis on neural language models.' },
      { period: '2014–19', title: 'Ph.D., NLP Research', description: 'Researched conversational agents for STEM education at Stanford.' },
      { period: '2019–22', title: 'Research Scientist, Big Tech', description: 'Shipped production LLM features used by 50M+ users.' },
      { period: '2023', title: 'Joined Classmate AI', description: 'Built the research lab behind the 24/7 AI Tutor product.' },
      { period: '2024–Now', title: 'Multilingual Tutoring', description: 'Leading initiatives to support 40+ languages for global students.' },
    ],
  },
  {
    slug: 'daniel-okonkwo',
    name: 'Daniel Okonkwo',
    role: 'Head of Product',
    label: 'Product Lead',
    tagline: 'Designing experiences that make complex coursework feel simple.',
    initials: 'DO',
    linkedin: '#',
    bio: [
      'Daniel shapes how students experience Classmate AI every day. He combines deep user research with rapid prototyping to ensure every feature reduces friction rather than adding it.',
      'Before joining Classmate AI, he led product design at two ed-tech companies and taught UX workshops at universities. He is passionate about accessibility and designing for students who juggle work, family, and school simultaneously.',
    ],
    journey: [
      { period: '2013', title: 'B.A. Design & Psychology', description: 'Studied cognitive science and human-centered design at RISD.' },
      { period: '2014–18', title: 'Product Designer, Ed-Tech', description: 'Redesigned course dashboards used by 500K+ university students.' },
      { period: '2018–22', title: 'Senior PM, Learning Platform', description: 'Launched mobile study tools with 4.8★ average rating.' },
      { period: '2023', title: 'Head of Product, Classmate AI', description: 'Owns end-to-end product vision for the student experience.' },
      { period: '2024–Now', title: 'Student-First Design', description: 'Driving accessibility and mobile-first workflows for all users.' },
    ],
  },
];

export function getTeamMember(slug: string): TeamMember | undefined {
  return TEAM_MEMBERS.find((m) => m.slug === slug);
}
