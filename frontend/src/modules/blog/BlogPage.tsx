import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Tag, ArrowRight, Search, BookOpen, Sparkles, User } from 'lucide-react';
import { AppPage } from '../../types';

interface BlogPageProps {
  onNavigate: (page: AppPage) => void;
}

interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  featured?: boolean;
  color: string;
  emoji: string;
}

const ARTICLES: Article[] = [
  {
    id: 1,
    slug: 'ai-study-techniques-2026',
    title: 'Top 10 AI-Powered Study Techniques That Actually Work in 2026',
    excerpt: 'Discover how modern AI tools are reshaping how students prepare for exams — from adaptive flashcards to personalized revision schedules that fit your brain\'s natural rhythm.',
    category: 'Study Tips',
    author: 'Pravin Sarule',
    date: 'July 8, 2026',
    readTime: '6 min read',
    featured: true,
    color: 'from-emerald-500 to-teal-600',
    emoji: '🧠',
  },
  {
    id: 2,
    slug: 'beat-exam-stress',
    title: 'How to Beat Exam Stress Before It Beats You',
    excerpt: 'Stress before exams is universal — but it doesn\'t have to be paralyzing. Learn the science-backed techniques that top performers use to stay calm, focused, and sharp.',
    category: 'Mental Wellness',
    author: 'Rutuja Dalal',
    date: 'July 6, 2026',
    readTime: '5 min read',
    color: 'from-violet-500 to-purple-600',
    emoji: '🧘',
  },
  {
    id: 3,
    slug: 'pomodoro-ai-scheduling',
    title: 'Pomodoro + AI: The Perfect Study Schedule Formula',
    excerpt: 'The Pomodoro technique is great — but pairing it with AI-generated study plans takes productivity to a completely new level. Here\'s how to set it up in minutes.',
    category: 'Productivity',
    author: 'Pravin Sarule',
    date: 'July 4, 2026',
    readTime: '4 min read',
    color: 'from-orange-400 to-rose-500',
    emoji: '⏱️',
  },
  {
    id: 4,
    slug: 'note-taking-with-ai',
    title: 'Smart Note-Taking: Let AI Summarize Your Lectures',
    excerpt: 'Spending hours rewriting your lecture notes? There\'s a smarter way. Discover how AI-powered note summarization can save you 2+ hours every single day.',
    category: 'Tools & Tech',
    author: 'Rutuja Dalal',
    date: 'July 2, 2026',
    readTime: '7 min read',
    color: 'from-cyan-500 to-blue-600',
    emoji: '📝',
  },
  {
    id: 5,
    slug: 'indian-students-ai-education',
    title: 'AI Education in India: Why the Future is Happening Now',
    excerpt: 'From tier-2 cities to top engineering colleges, Indian students are embracing AI tools at record rates. We explore what this shift means for the next generation.',
    category: 'Education Trends',
    author: 'Pravin Sarule',
    date: 'June 30, 2026',
    readTime: '8 min read',
    color: 'from-amber-500 to-orange-600',
    emoji: '🇮🇳',
  },
  {
    id: 6,
    slug: 'assignment-planning-hacks',
    title: '5 Assignment Planning Hacks Every Student Needs to Know',
    excerpt: 'Last-minute assignments are stressful and costly. These five planning strategies — backed by behavioral science and AI scheduling — will help you never miss a deadline.',
    category: 'Productivity',
    author: 'Rutuja Dalal',
    date: 'June 28, 2026',
    readTime: '5 min read',
    color: 'from-green-500 to-emerald-600',
    emoji: '📋',
  },
  {
    id: 7,
    slug: 'spaced-repetition-guide',
    title: 'Spaced Repetition: The Only Flashcard Method You\'ll Ever Need',
    excerpt: 'Forget cramming. Spaced repetition uses scientifically proven memory curves to help you remember anything — forever. Here\'s the complete beginner\'s guide.',
    category: 'Study Tips',
    author: 'Pravin Sarule',
    date: 'June 25, 2026',
    readTime: '6 min read',
    color: 'from-pink-500 to-rose-600',
    emoji: '🔁',
  },
  {
    id: 8,
    slug: 'group-study-vs-solo',
    title: 'Group Study vs. Solo Study: What Does Science Say?',
    excerpt: 'Should you study alone or with friends? The answer depends on what you\'re trying to learn. We break down the research and give you a framework to decide.',
    category: 'Study Tips',
    author: 'Rutuja Dalal',
    date: 'June 22, 2026',
    readTime: '5 min read',
    color: 'from-indigo-500 to-blue-600',
    emoji: '👥',
  },
];

const CATEGORIES = ['All', 'Study Tips', 'Productivity', 'Mental Wellness', 'Tools & Tech', 'Education Trends'];

export default function BlogPage({ onNavigate }: BlogPageProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = ARTICLES.filter(a => {
    const matchCat = activeCategory === 'All' || a.category === activeCategory;
    const matchSearch = !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = ARTICLES.find(a => a.featured);
  const rest = filtered.filter(a => !a.featured || activeCategory !== 'All' || searchQuery);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero header ── */}
      <div className="pt-24 pb-14 px-6 text-center" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-widest mb-5">
            <Sparkles className="w-3 h-3" /> Classmate AI Blog
          </span>
          <h1 className="text-[40px] sm:text-[52px] font-extrabold tracking-tight leading-[1.05] text-slate-900">
            Learn Smarter.<br />
            <span className="text-emerald-500">Every Single Day.</span>
          </h1>
          <p className="mt-5 text-[16px] text-slate-500 max-w-xl mx-auto leading-relaxed">
            Tips, techniques, and insights to help students study better, stress less, and achieve more with AI.
          </p>

          {/* Search */}
          <div className="mt-8 max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-11 pr-5 py-3.5 rounded-full border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 shadow-sm transition-all"
            />
          </div>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-24">

        {/* ── Category filters ── */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-wide transition-all ${
                activeCategory === cat
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                  : 'bg-stone-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Featured Article ── */}
        {featured && activeCategory === 'All' && !searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 group"
          >
            <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${featured.color} p-8 sm:p-12 flex flex-col lg:flex-row items-center gap-8 shadow-xl shadow-emerald-100 transition-transform duration-300 hover:-translate-y-1`}>
              {/* Featured text side */}
              <div className="flex-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-4">
                  <Sparkles className="w-3 h-3" /> Featured
                </span>
                <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> {featured.category}
                </p>
                <h2 className="text-[26px] sm:text-[32px] font-extrabold text-white leading-[1.1] tracking-tight max-w-lg">
                  {featured.title}
                </h2>
                <p className="mt-4 text-white/75 text-[14px] leading-relaxed max-w-lg">
                  {featured.excerpt}
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-white/70 text-[12px]">
                    <User className="w-3.5 h-3.5" /> {featured.author}
                  </div>
                  <div className="flex items-center gap-2 text-white/70 text-[12px]">
                    <Clock className="w-3.5 h-3.5" /> {featured.readTime}
                  </div>
                </div>
                <button className="mt-6 inline-flex items-center gap-2 bg-white text-emerald-700 font-bold text-[13px] px-5 py-2.5 rounded-full hover:bg-emerald-50 transition-all shadow-sm">
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Emoji illustration */}
              <div className="text-[100px] sm:text-[120px] select-none opacity-90 flex-none">
                {featured.emoji}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Article grid ── */}
        {rest.length === 0 && filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No articles found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(searchQuery || activeCategory !== 'All' ? filtered : rest).map((article, idx) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="group bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-xl hover:shadow-emerald-50 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Card color band */}
                <div className={`h-2 bg-gradient-to-r ${article.color}`} />

                <div className="p-6 flex flex-col flex-1">
                  {/* Category + emoji */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {article.category}
                    </span>
                    <span className="text-2xl">{article.emoji}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[16px] font-extrabold text-slate-900 leading-snug tracking-tight group-hover:text-emerald-600 transition-colors">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="mt-3 text-[13px] text-slate-500 leading-relaxed flex-1">
                    {article.excerpt}
                  </p>

                  {/* Footer */}
                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" /> {article.author}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {article.readTime} · {article.date}
                      </span>
                    </div>
                    <button className="inline-flex items-center gap-1 text-[12px] font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                      Read <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* ── Newsletter CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-10 text-center shadow-xl shadow-emerald-100"
        >
          <h3 className="text-[26px] font-extrabold text-white tracking-tight">
            Get New Articles in Your Inbox
          </h3>
          <p className="mt-2 text-white/75 text-[14px] max-w-sm mx-auto">
            Weekly tips on studying smarter, managing stress, and making the most of AI tools.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button className="px-5 py-3 rounded-full bg-white text-emerald-700 text-sm font-bold hover:bg-emerald-50 transition-all shadow-sm">
              Subscribe
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
