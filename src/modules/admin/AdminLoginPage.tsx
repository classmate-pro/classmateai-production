// ─── Admin Module: Super Admin Login ──────────────────────────────────────────
// Deliberately separate from the student LoginPage: no marketing copy, no
// Google sign-in, no register link — this is a restricted, role-gated door.
// Reached only via the /admin URL (see App.tsx's pathname check); there is no
// visible link to it anywhere in the regular UI.
import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Key } from 'lucide-react';
import { AppPage } from '../../types';
import api from '../../shared/api';
import { persistUserRole } from '../../shared/auth';

interface AdminLoginPageProps {
  onNavigate: (page: AppPage) => void;
}

export default function AdminLoginPage({ onNavigate }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);

  const extractError = (err: unknown, fallback: string) => {
    const e = err as { response?: { data?: { message?: string } }; message?: string };
    return e.response?.data?.message || e.message || fallback;
  };

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
          onNavigate('dashboard');
        } else {
          setError(res.data.message || 'Verification failed.');
        }
      } catch (err: unknown) {
        setError(extractError(err, 'An error occurred.'));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/admin/login', { email, password });
      if (res.data.success && res.data.otpRequired) {
        setOtpRequired(true);
      } else {
        setError(res.data.message || 'Login failed.');
      }
    } catch (err: unknown) {
      setError(extractError(err, 'Invalid credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-lg pl-10 pr-3 py-2.5 text-[14px] bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-colors';

  return (
    <div className="w-full h-screen flex items-center justify-center bg-slate-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/40"
      >
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-lg font-bold text-white">Super Admin</h1>
          <p className="text-[13px] text-slate-400 text-center">
            {otpRequired ? 'Enter the verification code sent to your email' : 'Restricted access — authorized personnel only'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <AnimatePresence>
            {error && (
              <motion.div
                key="err"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[12.5px] font-medium text-red-300 bg-red-500/10 border border-red-500/30"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {!otpRequired ? (
            <>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Admin email"
                  className={inputClass}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </>
          ) : (
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code"
                className={`${inputClass} tracking-widest`}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-[14px] font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              <>
                {otpRequired ? 'Verify & Continue' : 'Sign In'} <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {otpRequired && (
            <button
              type="button"
              onClick={() => {
                setOtpRequired(false);
                setOtpCode('');
              }}
              className="text-[12px] text-slate-500 hover:text-slate-300 text-center"
            >
              ← Back
            </button>
          )}
        </form>

        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="mt-6 w-full text-center text-[12px] text-slate-600 hover:text-slate-400 transition-colors"
        >
          ← Back to site
        </button>
      </motion.div>
    </div>
  );
}
