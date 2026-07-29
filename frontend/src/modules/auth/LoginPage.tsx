// ─── Auth Module: Login Page ─────────────────────────────────────────────────
import React, { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2, Key } from 'lucide-react';
import { AppPage } from '../../types';
import AuthLayout from './components/AuthLayout';
import SocialAuthButtons from './components/SocialAuthButtons';
import api from '../../shared/api';
import { persistUserRole } from '../../shared/auth';

interface LoginPageProps {
  onNavigate: (page: AppPage) => void;
}

const LOGIN_FEATURES = [
  { icon: '⚡', title: 'Instant AI Answers',   desc: 'Get explanations for any topic in seconds.' },
  { icon: '🎯', title: 'Personalized Learning', desc: 'Adapts to your pace, style and curriculum.' },
  { icon: '🔒', title: 'Secure & Private',      desc: 'Your academic data is always encrypted.' },
];

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [email,    setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [otpCode,  setOtpCode]  = useState('');
  const [showPw,   setShowPw]  = useState(false);
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState('');
  const [success,  setSuccess] = useState(false);
  const [focused,  setFocused] = useState<string | null>(null);
  
  // State for OTP step
  const [otpRequired, setOtpRequired] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otpRequired) {
      if (!otpCode || otpCode.trim().length !== 6) {
        setError('Please enter a valid 6-digit verification code.');
        return;
      }
      setLoading(true);
      try {
        const res = await api.post('/verify-otp', { email, otpCode });
        if (res.data.success) {
          localStorage.setItem('accessToken', res.data.accessToken);
          persistUserRole(res.data.accessToken);
          if (res.data.refreshToken) {
            localStorage.setItem('refreshToken', res.data.refreshToken);
          }
          setSuccess(true);
          setTimeout(() => onNavigate('dashboard'), 700);
        } else {
          setError(res.data.message || 'Verification failed.');
        }
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        setError(e.response?.data?.message || e.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!email || !password) { setError('Please fill in all fields.'); return; }
      setLoading(true);
      try {
        const res = await api.post('/login', { email, password });
        if (res.data.success) {
          if (res.data.otpRequired) {
            setOtpRequired(true);
            setSuccess(false);
          } else {
            localStorage.setItem('accessToken', res.data.accessToken);
            if (res.data.refreshToken) {
              localStorage.setItem('refreshToken', res.data.refreshToken);
            }
            setSuccess(true);
            setTimeout(() => onNavigate('dashboard'), 700);
          }
        } else {
          setError(res.data.message || 'Login failed.');
        }
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        setError(e.response?.data?.message || e.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Clean dark-on-white inputs — max readability on the white card
  const inputBase: React.CSSProperties = {
    width: '100%',
    borderRadius: '10px',
    padding: '11px 12px 11px 40px',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const getInput = (field: string): React.CSSProperties => ({
    ...inputBase,
    background: focused === field ? '#f0fdf4' : '#f8fafc',
    border: focused === field
      ? '1.5px solid #059669'
      : '1.5px solid #e2e8f0',
    boxShadow: focused === field ? '0 0 0 3px rgba(5,150,105,0.10)' : 'none',
  });

  return (
    <AuthLayout
      onNavigate={onNavigate}
      title={otpRequired ? "Verify Identity" : "Welcome Back"}
      subtitle={otpRequired ? "Enter the verification code sent to your email" : "Sign in to your account"}
      icon={null}
      headline={otpRequired ? "Verification" : "Welcome"}
      headlineHighlight={otpRequired ? "Code!" : "Back!"}
      description={otpRequired ? "We sent a 6-digit OTP code to your registered email to ensure your account security. Please verify to continue." : "Continue your learning journey. Your AI study partner is ready."}
      bullets={[]}
      features={LOGIN_FEATURES}
      mode="login"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

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
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div key="ok"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-emerald-700"
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              Signed in! Redirecting…
            </motion.div>
          )}
        </AnimatePresence>

        {!otpRequired ? (
          <>
            {/* ── Email ── */}
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: focused === 'email' ? '#059669' : '#94a3b8' }}
              />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="Email address"
                style={getInput('email')}
              />
            </div>

            {/* ── Password ── */}
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: focused === 'password' ? '#059669' : '#94a3b8' }}
              />
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="Password"
                style={{ ...getInput('password'), paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* ── Forgot ── */}
            <div className="flex justify-end -mt-1">
              <button type="button" className="text-[12px] text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                Forgot password?
              </button>
            </div>
          </>
        ) : (
          <>
            {/* ── OTP Code ── */}
            <div className="relative">
              <Key
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: focused === 'otp' ? '#059669' : '#94a3b8' }}
              />
              <input
                id="login-otp"
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                onFocus={() => setFocused('otp')}
                onBlur={() => setFocused(null)}
                placeholder="Enter 6-Digit OTP"
                style={{ ...getInput('otp'), letterSpacing: otpCode ? '4px' : 'normal', fontWeight: otpCode ? 'bold' : 'normal' }}
              />
            </div>
            
            <div className="flex justify-between items-center -mt-1">
              <button
                type="button"
                onClick={() => setOtpRequired(false)}
                className="text-[12px] text-slate-500 hover:text-slate-700 font-semibold transition-colors"
              >
                ← Back to Login
              </button>
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  setError('');
                  try {
                    await api.post('/login', { email, password });
                    setSuccess(false);
                    setError('A new verification code has been sent!');
                  } catch (err: unknown) {
                    const e = err as { response?: { data?: { message?: string } }; message?: string };
                    setError(e.response?.data?.message || e.message || 'Failed to resend code.');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="text-[12px] text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                Resend Code
              </button>
            </div>
          </>
        )}

        {/* ── Submit ── */}
        <motion.button
          id="login-submit"
          type="submit"
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
            ? <><CheckCircle2 className="w-4 h-4" /> Signed in!</>
            : otpRequired
            ? <>Verify & Login <ArrowRight className="w-4 h-4" /></>
            : <>Sign In <ArrowRight className="w-4 h-4" /></>
          }
        </motion.button>

        {/* ── Google OAuth ── */}
        {!otpRequired && <SocialAuthButtons label="Sign in" onNavigate={onNavigate} />}

        {/* ── Register link ── */}
        <p className="text-center text-[13px] text-slate-500 pt-1">
          Don't have an account?{' '}
          <button type="button" onClick={() => onNavigate('register')}
            className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
            Create one free →
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
