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
  avatar?: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    slug: 'pravin-sarule',
    name: 'Pravin Sarule',
    role: 'Founder & CEO',
    label: 'Founder',
    tagline: 'Empowering students across the globe with intelligent, adaptive learning systems.',
    initials: 'PS',
    linkedin: 'https://linkedin.com/in/pravin-sarule-749138213',
    avatar: '/pravin.jpg',
    bio: [
      'Pravin is the Founder and CEO of Classmate AI. An AI Engineer at heart, he built the platform to solve a challenge close to home: helping students cut through academic administrative stress and redirect their energy toward real, deep learning.',
      'Driven by a vision to democratize cutting-edge AI for education in India and worldwide, Pravin leads the technology and product vision. He is committed to building intelligent systems that are accessible, intuitive, and serve as true catalysts for student success.',
    ],
    journey: [
      { period: '2018–22', title: 'B.E. Computer Science & Engineering', description: 'Graduated with a focus on machine learning and software architectures.' },
      { period: '2022–23', title: 'AI Developer', description: 'Built and optimized deep learning models and custom NLP pipelines.' },
      { period: '2023–24', title: 'AI Systems Architect', description: 'Designed scalable agentic workflows and intelligent scheduling systems.' },
      { period: '2024', title: 'Founded Classmate AI', description: 'Launched the smart learning assistant to automate study planning and tutoring.' },
      { period: '2024–Now', title: 'Scaling Globally', description: 'Empowering thousands of students daily with personalized, AI-driven learning companion.' },
    ],
  },
  {
    slug: 'rutuja-dalal',
    name: 'Rutuja Dalal',
    role: 'Co-Founder',
    label: 'Co-Founder',
    tagline: 'Turning ambitious AI ideas into real products that transform how students learn.',
    initials: 'RD',
    linkedin: 'https://www.linkedin.com/in/rutuja-dalal-292514234',
    avatar: '/rutuja.png',
    bio: [
      'Rutuja is the Co-Founder of Classmate AI. A passionate AI engineer and product builder, she co-created the platform to ensure that every student — regardless of background — has access to a smart, intelligent learning partner.',
      'With deep roots in the Indian education ecosystem, Rutuja brings a ground-level understanding of student challenges. She drives the product and AI experience at Classmate AI, building systems that feel intuitive, empowering, and genuinely useful.',
    ],
    journey: [
      { period: '2018–22', title: 'B.E. Computer Science & Engineering', description: 'Graduated with a focus on AI, data engineering, and full-stack development.' },
      { period: '2022–23', title: 'AI Engineer', description: 'Developed intelligent automation pipelines and conversational AI systems.' },
      { period: '2023–24', title: 'AI Product Designer', description: 'Designed and shipped AI-driven user experiences for educational platforms.' },
      { period: '2024', title: 'Co-Founded Classmate AI', description: 'Co-built the smart learning assistant to empower students with AI-powered tools.' },
      { period: '2024–Now', title: 'Growing the Vision', description: 'Driving product innovation and AI research to expand student impact globally.' },
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
