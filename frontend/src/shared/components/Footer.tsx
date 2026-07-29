import logo from '../../utils/IMG-20260703-WA0446-removebg-preview.png';
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

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer style={{ background: '#F0EBE1', position: 'relative', zIndex: 10, paddingTop: '80px', paddingBottom: '40px', overflow: 'hidden', borderTop: '1px solid rgba(15, 23, 42, 0.08)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px', marginBottom: '64px' }}>
          
          {/* Brand Column (Description only, short logo removed) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.7', margin: 0, fontWeight: 500 }}>
              The AI-powered student platform trusted by 2.4M+ learners — helping students learn, scale, and connect with real-world outcomes.
            </p>
          </div>

          {/* Links Columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h4 style={{ fontSize: '11px', fontWeights: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1e293b', margin: 0 }}>
                {col.heading}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {col.links.map(({ label, page }) => (
                  <li key={label}>
                    {page ? (
                      <button
                        onClick={() => onNavigate(page)}
                        style={{ background: 'none', border: 'none', padding: 0, fontSize: '13px', color: '#475569', cursor: 'pointer', textAlign: 'left', transition: 'color 0.2s', fontWeight: 500 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
                      >
                        {label}
                      </button>
                    ) : (
                      <a
                        href="#"
                        style={{ textDecoration: 'none', fontSize: '13px', color: '#475569', transition: 'color 0.2s', display: 'inline-block', fontWeight: 500 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
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

        {/* Giant footer logo aligned with bottom edge */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', userSelect: 'none', pointerEvents: 'none', marginTop: '40px', overflow: 'hidden' }}>
          <img 
            src={logo} 
            alt="" 
            style={{ 
              width: '100%', 
              maxWidth: '1200px', 
              height: 'auto', 
              objectFit: 'contain',
              opacity: '1.0',
            }} 
          />
        </div>

        {/* Bottom Bar Info (Shown below the logo) */}
        <div style={{ borderTop: '1px solid rgba(15, 23, 42, 0.12)', paddingTop: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>
            © {new Date().getFullYear()} Classmate AI, Inc. · hello@classmateai.com
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['Privacy', 'Terms', 'Cookies'].map((item) => (
              <a key={item} href="#" style={{ fontSize: '12px', color: '#475569', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500 }}
                 onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
                 onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
