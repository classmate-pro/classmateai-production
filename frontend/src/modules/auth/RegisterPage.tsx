// ─── Auth Module: Register Page ──────────────────────────────────────────────
import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { AppPage } from '../../types';
import AuthLayout from './components/AuthLayout';
import api from '../../shared/api';

interface RegisterPageProps {
  onNavigate: (page: AppPage) => void;
}

interface FormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function getStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: s, label: 'Weak',   color: 'bg-red-400' };
  if (s <= 3) return { score: s, label: 'Good',   color: 'bg-amber-400' };
  return        { score: s, label: 'Strong', color: 'bg-emerald-400' };
}

export default function RegisterPage({ onNavigate }: RegisterPageProps) {
  const [form, setForm] = useState<FormState>({
    fullName: '', email: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (field: keyof FormState, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const strength = getStrength(form.password);

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
      const response = await api.post('/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: 'student',
      });
      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        onNavigate('dashboard');
      } else {
        setError(response.data.message || 'Registration failed.');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || e.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-white rounded-full pl-12 pr-5 py-3.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/70 transition-all shadow-sm';

  return (
    <AuthLayout
      onNavigate={onNavigate}
      title="Create Account"
      subtitle="Join Classmate AI for free"
      icon={null}
      headline="Join"
      headlineHighlight="Classmate AI"
      description="Create your account and unlock personalized AI tutoring, smart scheduling, and 24/7 study support."
      bullets={[]}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 border border-red-300/30 text-white"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}

        {/* Full Name */}
        <div className="relative">
          <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            autoComplete="name"
            value={form.fullName}
            onChange={e => set('fullName', e.target.value)}
            placeholder="Enter Full Name"
            className={inputCls}
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="Enter Email Address"
            className={inputCls}
          />
        </div>

        {/* Password */}
        <div>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder="Enter Password"
              className={`${inputCls} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {form.password.length > 0 && (
            <div className="flex items-center gap-2 mt-2 px-1">
              <div className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${strength.color}`}
                  animate={{ width: `${(strength.score / 5) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wide">
                {strength.label}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={e => set('confirmPassword', e.target.value)}
            placeholder="Confirm Password"
            className={`${inputCls} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(v => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {form.confirmPassword.length > 0 && (
            <span className={`absolute right-11 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
              form.password === form.confirmPassword ? 'bg-emerald-400' : 'bg-red-400'
            }`} />
          )}
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          className="mt-1 w-full py-3.5 rounded-full text-sm font-bold text-white flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 shadow-lg disabled:opacity-60 transition-all"
        >
          {loading
            ? <div className="w-4 h-4 border-2 border-emerald-400/40 border-t-emerald-600 rounded-full animate-spin" />
            : 'Create Account'
          }
        </motion.button>

        {/* Login link */}
        <p className="text-center text-[13px] text-white/60">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="text-white font-bold hover:text-emerald-100 transition-colors underline underline-offset-2"
          >
            Sign in here
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
