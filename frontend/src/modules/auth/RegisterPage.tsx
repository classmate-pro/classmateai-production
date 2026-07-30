// ─── Auth Module: Register Page ──────────────────────────────────────────────
import React, { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import { AppPage } from '../../types';
import AuthLayout from './components/AuthLayout';
import SocialAuthButtons from './components/SocialAuthButtons';
import api from '../../shared/api';
import { persistUserRole } from '../../shared/auth';

interface RegisterPageProps {
  onNavigate: (page: AppPage) => void;
}

interface FormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const REGISTER_FEATURES = [
  { icon: '🚀', title: 'Get Started in 60s',  desc: 'Create your account and dive in immediately.' },
  { icon: '🤖', title: 'AI Tutor Ready',       desc: 'Your personal tutor activates the moment you join.' },
  { icon: '📈', title: 'Track Your Growth',    desc: 'See measurable improvement from day one.' },
];

function getStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8)           s++;
  if (pw.length >= 12)          s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { label: 'Weak',   color: '#ef4444', barColor: '#fca5a5', w: '25%' };
  if (s <= 3) return { label: 'Fair',   color: '#f59e0b', barColor: '#fcd34d', w: '60%' };
  return        { label: 'Strong', color: '#059669', barColor: '#6ee7b7', w: '100%' };
}

export default function RegisterPage({ onNavigate }: RegisterPageProps) {
  const [form, setForm] = useState<FormState>({
    fullName: '', email: '', password: '', confirmPassword: '',
  });
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);
  const [focused,  setFocused]  = useState<string | null>(null);

  const set = (field: keyof FormState, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const strength = getStrength(form.password);
  const passwordsMatch    = form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const passwordsMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.'); return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    setLoading(true);
    try {
      const res = await api.post('/register', {
        name: form.fullName,   // backend validateRegister expects `name`
        email: form.email,
        password: form.password,
      });
      if (res.data.success) {
        localStorage.setItem('accessToken', res.data.accessToken);
        persistUserRole(res.data.accessToken);
        if (res.data.refreshToken) {
          localStorage.setItem('refreshToken', res.data.refreshToken);
        }
        setSuccess(true);
        setTimeout(() => onNavigate('dashboard'), 700);
      } else {
        setError(res.data.message || 'Registration failed.');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || e.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };


  // Base style for all inputs on the white card
  // 16px font size: anything smaller triggers iOS Safari's auto-zoom on focus
  const inputBase: React.CSSProperties = {
    width: '100%',
    borderRadius: '10px',
    padding: '11px 12px 11px 40px',
    fontSize: '16px',
    color: '#0f172a',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const getInput = (
    field: string,
    extra: React.CSSProperties = {}
  ): React.CSSProperties => {
    let borderColor = focused === field ? '#059669' : '#e2e8f0';
    if (field === 'confirm' && passwordsMismatch) borderColor = '#ef4444';
    if (field === 'confirm' && passwordsMatch)    borderColor = '#059669';

    return {
      ...inputBase,
      background: focused === field ? '#f0fdf4' : '#f8fafc',
      border: `1.5px solid ${borderColor}`,
      boxShadow: focused === field ? '0 0 0 3px rgba(5,150,105,0.10)' : 'none',
      ...extra,
    };
  };

  const iconColor = (field: string) =>
    focused === field ? '#059669' : '#94a3b8';

  return (
    <AuthLayout
      onNavigate={onNavigate}
      title="Create Account"
      subtitle="Join 10,000+ students · Free forever"
      icon={null}
      headline="Join"
      headlineHighlight="Classmate AI"
      description="Your AI-powered study partner is ready to help you learn smarter and achieve more."
      bullets={[]}
      features={REGISTER_FEATURES}
      mode="register"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>

        {/* ── Banners ── */}
        <AnimatePresence>
          {error && (
            <motion.div key="err"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-red-700"
              style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" /> {error}
            </motion.div>
          )}
          {success && (
            <motion.div key="ok"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-emerald-700"
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" /> Account created! Redirecting…
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Full Name ── */}
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: iconColor('name') }} />
          <input
            type="text" autoComplete="name"
            value={form.fullName}
            onChange={e => set('fullName', e.target.value)}
            onFocus={() => setFocused('name')}
            onBlur={() => setFocused(null)}
            placeholder="Full name"
            style={getInput('name')}
          />
        </div>

        {/* ── Email ── */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: iconColor('email') }} />
          <input
            type="email" autoComplete="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
            placeholder="Email address"
            style={getInput('email')}
          />
        </div>

        {/* ── Password + Strength ── */}
        <div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: iconColor('password') }} />
            <input
              type={showPw ? 'text' : 'password'} autoComplete="new-password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              placeholder="Create password"
              style={getInput('password', { paddingRight: '44px' })}
            />
            <button type="button" tabIndex={-1}
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength bar */}
          <AnimatePresence>
            {form.password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 mt-2 px-0.5">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      animate={{ width: strength.w }}
                      transition={{ duration: 0.35 }}
                      style={{ background: strength.barColor }}
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Confirm Password ── */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: iconColor('confirm') }} />
          <input
            type={showConfirm ? 'text' : 'password'} autoComplete="new-password"
            value={form.confirmPassword}
            onChange={e => set('confirmPassword', e.target.value)}
            onFocus={() => setFocused('confirm')}
            onBlur={() => setFocused(null)}
            placeholder="Confirm password"
            style={getInput('confirm', { paddingRight: '76px' })}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {form.confirmPassword.length > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                className={`w-2 h-2 rounded-full ${passwordsMatch ? 'bg-emerald-500' : 'bg-red-400'}`} />
            )}
            <button type="button" tabIndex={-1}
              onClick={() => setShowConfirm(v => !v)}
              className="text-slate-400 hover:text-slate-600 transition-colors">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── Terms ── */}
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            By creating an account you agree to our{' '}
            <span className="text-emerald-600 hover:text-emerald-700 cursor-pointer font-semibold">Terms</span>{' '}and{' '}
            <span className="text-emerald-600 hover:text-emerald-700 cursor-pointer font-semibold">Privacy Policy</span>.
          </p>
        </div>

        {/* ── Submit ── */}
        <motion.button
          id="register-submit" type="submit"
          disabled={loading || success}
          whileHover={{ scale: loading || success ? 1 : 1.02 }}
          whileTap={{ scale: loading || success ? 1 : 0.97 }}
          className="relative w-full py-3.5 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2 overflow-hidden transition-all disabled:opacity-70"
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            boxShadow: '0 4px 20px rgba(5,150,105,0.40)',
          }}
        >
          <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-400 pointer-events-none"
            style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)' }} />
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : success
            ? <><CheckCircle2 className="w-4 h-4" /> Account Created!</>
            : <>Create Free Account <ArrowRight className="w-4 h-4" /></>
          }
        </motion.button>

        {/* ── Google OAuth ── */}
        <SocialAuthButtons label="Sign up" onNavigate={onNavigate} />

        {/* ── Login link ── */}
        <p className="text-center text-[13px] text-slate-500 pt-1">
          Already have an account?{' '}
          <button type="button" onClick={() => onNavigate('login')}
            className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
            Sign in here →
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
