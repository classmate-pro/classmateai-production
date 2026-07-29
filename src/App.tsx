import { useState, useEffect } from 'react';
import { AppPage, CoreSettings } from './types';
import { SESSION_EXPIRED_EVENT } from './shared/sessionExpired';
import { persistUserRole, isSuperAdmin, wasSuperAdminSession } from './shared/auth';

// ── Shared UI ────────────────────────────────────────────────────────────────
import Navbar from './shared/components/Navbar';
import ChatBot from './shared/components/ChatBot';

// ── Canvas Module ────────────────────────────────────────────────────────────
import { NetworkBackground } from './modules/canvas';

// ── Feature Modules ──────────────────────────────────────────────────────────
import LandingModule  from './modules/landing';
import TeamMemberPage from './modules/landing/TeamMemberPage';
import LoginPage      from './modules/auth/LoginPage';
import RegisterPage   from './modules/auth/RegisterPage';
import PricingPage    from './modules/pricing';
import ContactPage    from './modules/contact';
import HudDashboard   from './modules/dashboard';
import BlogPage       from './modules/blog/BlogPage';
import AdminLoginPage from './modules/admin/AdminLoginPage';

// ── Hooks & Utils ────────────────────────────────────────────────────────────
import { usePointerParallax } from './hooks/usePointerParallax';

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>('home');
  const [teamMemberSlug, setTeamMemberSlug] = useState<string | null>(null);
  const { parallaxRef } = usePointerParallax();

  const [settings, setSettings] = useState<CoreSettings>({
    color: 'cyan',
    geometry: 'torusKnot',
    mode: 'ORBIT',
    speedMultiplier: 1.5,
    particleCount: 1800,
    noiseIntensity: 0.5,
    autoRotate: true,
    wireframe: true,
    soundEnabled: false,
  });

  // ── Handle Google OAuth redirect: ?token=<access>&refreshToken=<refresh> ────
  // The backend redirects here after successful Google OAuth.
  // Extract both tokens, persist them, clean the URL, then navigate to dashboard.
  useEffect(() => {
    // ── Super Admin entry point: reached only via the /admin URL directly ──
    // (there is no link to it anywhere in the regular UI). Super admins land
    // on the same HudDashboard as everyone else — it renders a different tab
    // set once it sees role === 'super_admin' in the access token.
    if (window.location.pathname.startsWith('/admin')) {
      setActivePage(isSuperAdmin() ? 'dashboard' : 'admin-login');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const oauthToken        = params.get('token');
    const oauthRefreshToken = params.get('refreshToken');
    // A notes share link (see notesApi.ts shareFolder/shareNote) looks like
    // "<origin>/?shared=<token>". Stash the token for NotesPage to consume —
    // it needs an authenticated API call to resolve, which can't happen here.
    const sharedToken = params.get('shared');

    if (sharedToken) {
      localStorage.setItem('pendingShareToken', sharedToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (oauthToken) {
      // 1. Persist both tokens
      localStorage.setItem('accessToken', oauthToken);
      persistUserRole(oauthToken);
      if (oauthRefreshToken) {
        localStorage.setItem('refreshToken', oauthRefreshToken);
      }
      // 2. Clean URL — removes ?token=...&refreshToken=... without page reload
      window.history.replaceState({}, document.title, window.location.pathname);
      // 3. Go to dashboard
      setActivePage('dashboard');
      return;
    }

    // Fallback: if already logged in, go straight to dashboard — this is also
    // the path a share link takes when the student is already signed in.
    const existingToken = localStorage.getItem('accessToken');
    if (existingToken) {
      setActivePage('dashboard');
    } else if (sharedToken) {
      // Not logged in yet: send them to log in first. pendingShareToken stays
      // in localStorage and NotesPage picks it up once they land on the
      // dashboard's Notes tab (see the initial activeTab lazy-init there).
      setActivePage('login');
    }
  }, []);

  // ── Auto-logout on expired session ──────────────────────────────────────────
  // api.ts / documentApi.ts emit this once a 401 -> refresh attempt also fails
  // (tokens are already cleared by then) — kick the user back to login instead
  // of leaving them stuck on a dashboard where every request just keeps failing.
  useEffect(() => {
    // Bounce back to the admin login (not the student one) if the expired
    // session belonged to a super admin — the access token is already gone
    // by the time this fires, so this checks the persisted role breadcrumb.
    const handleSessionExpired = () => setActivePage(wasSuperAdminSession() ? 'admin-login' : 'login');
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);



  const isScrollable =
    activePage === 'home' ||
    activePage === 'login' ||
    activePage === 'register' ||
    activePage === 'team-member' ||
    activePage === 'blog';

  const handleNavigate = (page: AppPage) => {
    setActivePage(page);
    if (page !== 'team-member') setTeamMemberSlug(null);
  };

  const handleViewTeamMember = (slug: string) => {
    setTeamMemberSlug(slug);
    setActivePage('team-member');
    window.scrollTo({ top: 0 });
  };

  const isAuthPage = activePage === 'login' || activePage === 'register' || activePage === 'admin-login';

  return (
    <div
      className={`relative w-full font-sans ${
        isAuthPage
          ? 'h-screen overflow-hidden'
          : isScrollable ? 'min-h-screen text-slate-900 bg-white' : 'h-screen overflow-hidden text-slate-900 bg-white'
      }`}
    >
      {!isAuthPage && activePage !== 'home' && activePage !== 'team-member' && activePage !== 'blog' && <NetworkBackground />}

      {/* Navbar: hide on auth pages AND dashboard */}
      {!isAuthPage && activePage !== 'dashboard' && (
        <Navbar activePage={activePage} onNavigate={handleNavigate} />
      )}

      {/* ── Landing ── */}
      {activePage === 'home' && (
        <LandingModule onNavigate={handleNavigate} onViewTeamMember={handleViewTeamMember} />
      )}

      {/* ── Team member detail ── */}
      {activePage === 'team-member' && teamMemberSlug && (
        <TeamMemberPage slug={teamMemberSlug} onNavigate={handleNavigate} />
      )}

      {/* ── Auth ── */}
      {activePage === 'login'    && <LoginPage    onNavigate={handleNavigate} />}
      {activePage === 'register' && <RegisterPage onNavigate={handleNavigate} />}
      {activePage === 'dashboard' && <HudDashboard settings={settings} setSettings={setSettings} onNavigate={handleNavigate} />}

      {/* ── Super Admin login (its dashboard is the same HudDashboard above,
             it just renders a different tab set for role === 'super_admin') ── */}
      {activePage === 'admin-login' && <AdminLoginPage onNavigate={handleNavigate} />}

      {/* ── Core pages (now modules) ── */}
      {activePage === 'pricing' && <PricingPage color={settings.color} />}
      {activePage === 'contact' && <ContactPage color={settings.color} />}
      {activePage === 'blog' && <BlogPage onNavigate={handleNavigate} />}


      {/* AI Chatbot — hidden on auth pages */}
      {!isAuthPage && <ChatBot />}
    </div>
  );
}
