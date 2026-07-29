import { useEffect, useRef } from 'react';
import {
  Sparkles, Calendar, MessageSquare, BookOpen,
  Users, BarChart3, Tag, Mail, ShieldAlert,
  type LucideIcon
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AppPage } from '../../types';

interface Product {
  label: string;
  icon: LucideIcon;
  target: string;
  page?: AppPage;
  color: string;
  bg: string;
}

const PRODUCTS: Product[] = [
  { label: 'Account', icon: Users, target: 'profile', color: '#1a73e8', bg: '#e8f0fe' },
  { label: 'Tutor', icon: MessageSquare, target: 'features', color: '#ea4335', bg: '#fce8e6' },
  { label: 'Schedule', icon: Calendar, target: 'features', color: '#f9ab00', bg: '#fef7e0' },
  { label: 'Assistant', icon: Sparkles, target: 'features', color: '#188038', bg: '#e6f4ea' },
  { label: 'Research', icon: BookOpen, target: 'features', color: '#00acc1', bg: '#e4f7f9' },
  { label: 'Analytics', icon: BarChart3, target: 'features', color: '#ab47bc', bg: '#f3e5f5' },
  { label: 'Pricing', icon: Tag, target: 'pricing', page: 'pricing' as AppPage, color: '#ff7043', bg: '#fbe9e7' },
  { label: 'Contact', icon: Mail, target: 'contact', page: 'contact' as AppPage, color: '#5c6bc0', bg: '#e8eaf6' },
  { label: 'Support', icon: ShieldAlert, target: 'help', color: '#78909c', bg: '#eceff1' },
];

interface AppsSidebarProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (page: AppPage) => void;
  onScrollTo: (target: string) => void;
}

export default function AppsSidebar({
  open,
  onClose,
  onNavigate,
  onScrollTo,
}: AppsSidebarProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open, onClose]);

  const handleProductClick = (product: Product) => {
    onClose();
    if (product.page) {
      onNavigate(product.page);
    } else {
      onScrollTo(product.target);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: '70px',
            right: '40px',
            zIndex: 1000,
            width: '320px',
            background: '#ffffff',
            borderRadius: '28px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 10px 30px 0 rgba(0,0,0,0.15)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            padding: '16px',
            overflow: 'hidden',
          }}
        >
          {/* Scrollable grid area */}
          <div
            style={{
              maxHeight: '440px',
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              paddingRight: '4px',
            }}
            className="apps-sidebar-scroll"
          >
            {PRODUCTS.map((prod) => (
              <button
                key={prod.label}
                onClick={() => handleProductClick(prod)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '12px 4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  outline: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(60, 64, 67, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Icon Circle */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: prod.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <prod.icon style={{ width: '22px', height: '22px', color: prod.color }} />
                </div>
                {/* Label */}
                <span
                  style={{
                    fontSize: '12px',
                    color: '#3c4043',
                    textAlign: 'center',
                    fontWeight: 500,
                    width: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {prod.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
