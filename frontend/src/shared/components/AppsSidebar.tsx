import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Sparkles, CalendarClock, MessageSquare, BookOpenCheck,
  Users, BarChart3, Tag, Mail, Search, X, ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppPage } from '../../types';

interface Product {
  label: string;
  icon: LucideIcon;
  target: string;
  page?: AppPage;
  description?: string;
  iconBg: string;
  iconColor: string;
}

interface ProductCategory {
  title: string;
  products: Product[];
}

const FEATURED: Product = {
  label: 'Assignment Assistant',
  icon: Sparkles,
  target: 'features',
  description: 'Auto-summarize readings, draft outlines, and cut homework time by up to 60%.',
  iconBg: 'bg-violet-500',
  iconColor: 'text-white',
};

const PROMOS = [
  {
    title: '24/7 AI Tutor',
    text: 'Instant explanations in any subject, any time.',
    cta: 'Learn more',
    accent: 'bg-violet-50 border-violet-100',
    target: 'features',
  },
  {
    title: 'Get Started Free',
    text: 'Save 12+ hours every week with Classmate AI.',
    cta: 'Sign up',
    accent: 'bg-emerald-50 border-emerald-100',
    page: 'register' as AppPage,
  },
];

const CATEGORIES: ProductCategory[] = [
  {
    title: 'Learning Tools',
    products: [
      { label: 'Assignment Assistant', icon: Sparkles, target: 'features', iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
      { label: 'Smart Scheduler', icon: CalendarClock, target: 'features', iconBg: 'bg-sky-50', iconColor: 'text-sky-600' },
      { label: '24/7 AI Tutor', icon: MessageSquare, target: 'features', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    ],
  },
  {
    title: 'Research & Collaboration',
    products: [
      { label: 'Research Hub', icon: BookOpenCheck, target: 'features', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
      { label: 'Collaboration', icon: Users, target: 'features', iconBg: 'bg-rose-50', iconColor: 'text-rose-600' },
    ],
  },
  {
    title: 'Insights & Platform',
    products: [
      { label: 'Analytics', icon: BarChart3, target: 'features', iconBg: 'bg-teal-50', iconColor: 'text-teal-600' },
      { label: 'Pricing', icon: Tag, target: 'pricing', page: 'pricing', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
      { label: 'Contact', icon: Mail, target: 'contact', page: 'contact', iconBg: 'bg-slate-100', iconColor: 'text-slate-600' },
    ],
  },
];

interface AppsSidebarProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (page: AppPage) => void;
  onScrollTo: (target: string) => void;
}

function AppRow({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-transparent bg-white px-3 py-3 text-left transition-all hover:border-slate-200 hover:shadow-sm"
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${product.iconBg}`}>
        <product.icon className={`h-[18px] w-[18px] ${product.iconColor}`} strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1 text-[14px] font-medium leading-snug text-slate-800">
        {product.label}
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:text-emerald-500 group-hover:translate-x-0.5" />
    </button>
  );
}

export default function AppsSidebar({
  open,
  onClose,
  onNavigate,
  onScrollTo,
}: AppsSidebarProps) {
  const [query, setQuery] = useState('');
  const [promoIndex, setPromoIndex] = useState(0);

  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && handleClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open, handleClose]);

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => {
      setPromoIndex((i) => (i + 1) % PROMOS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.map((cat) => ({
      ...cat,
      products: cat.products.filter((p) => p.label.toLowerCase().includes(q)),
    })).filter((cat) => cat.products.length > 0);
  }, [query]);

  const handleProduct = (product: Product) => {
    handleClose();
    if (product.page) onNavigate(product.page);
    else onScrollTo(product.target);
  };

  const handlePromo = (promo: (typeof PROMOS)[number]) => {
    handleClose();
    if (promo.page) onNavigate(promo.page);
    else onScrollTo(promo.target);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[120] bg-slate-900/25"
            onClick={handleClose}
            aria-hidden="true"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 36, stiffness: 340 }}
            className="fixed top-20 right-0 bottom-0 z-[130] flex w-full max-w-[380px] flex-col border-l border-slate-200 bg-white shadow-[-8px_0_32px_rgba(15,23,42,0.1)]"
            role="dialog"
            aria-modal="true"
            aria-label="Classmate AI applications"
          >
            {/* Header — text only, no logo */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <div>
                <h2 className="text-[15px] font-bold text-slate-900">Applications</h2>
                <p className="text-[11px] text-slate-500">Classmate AI Suite</p>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            {/* Search */}
            <div className="shrink-0 px-5 py-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search applications"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-[14px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    aria-label="Clear"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="apps-sidebar-scroll flex-1 overflow-y-auto px-5 pb-5">
              {!query && (
                <>
                  {/* Featured */}
                  <section className="mb-5">
                    <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Featured App
                    </p>
                    <button
                      onClick={() => handleProduct(FEATURED)}
                      className="group flex w-full items-start gap-3.5 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-left transition-all hover:border-emerald-200 hover:bg-white hover:shadow-sm"
                    >
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${FEATURED.iconBg}`}>
                        <FEATURED.icon className={`h-5 w-5 ${FEATURED.iconColor}`} strokeWidth={2} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-bold text-slate-900">{FEATURED.label}</span>
                        <span className="mt-1 block text-[12px] leading-relaxed text-slate-500">
                          {FEATURED.description}
                        </span>
                        <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
                          Try now
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </span>
                    </button>
                  </section>

                  {/* Promo */}
                  <section className="mb-5">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={promoIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`rounded-xl border px-4 py-3 ${PROMOS[promoIndex].accent}`}
                      >
                        <p className="text-[13px] font-bold text-slate-800">{PROMOS[promoIndex].title}</p>
                        <p className="mt-0.5 text-[12px] text-slate-600">{PROMOS[promoIndex].text}</p>
                        <button
                          onClick={() => handlePromo(PROMOS[promoIndex])}
                          className="mt-1.5 text-[12px] font-semibold text-emerald-700"
                        >
                          {PROMOS[promoIndex].cta} →
                        </button>
                      </motion.div>
                    </AnimatePresence>
                    <div className="mt-2 flex justify-center gap-1">
                      {PROMOS.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPromoIndex(i)}
                          aria-label={`Slide ${i + 1}`}
                          className={`rounded-full transition-all ${
                            i === promoIndex ? 'h-1 w-4 bg-emerald-500' : 'h-1 w-1 bg-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </section>

                  <div className="mb-4 border-t border-slate-100" />
                </>
              )}

              {/* Apps — single column list (no truncation) */}
              <section>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {query ? 'Results' : 'All Apps'}
                </p>

                {filtered.length === 0 ? (
                  <p className="py-10 text-center text-sm text-slate-400">No apps found</p>
                ) : (
                  filtered.map((category) => (
                    <div key={category.title} className="mb-5">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                        {category.title}
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {category.products.map((product) => (
                          <AppRow
                            key={product.label}
                            product={product}
                            onClick={() => handleProduct(product)}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </section>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-slate-100 px-5 py-3.5">
              <button
                onClick={() => { handleClose(); onNavigate('register'); }}
                className="w-full rounded-lg bg-gradient-to-r from-teal-800 to-emerald-500 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-95"
              >
                Get Started Free
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
