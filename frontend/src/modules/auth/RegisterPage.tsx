// ─── Auth Module: Register Page ──────────────────────────────────────────────
import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Eye, EyeOff, Check, AlertCircle, GraduationCap, BookOpen } from 'lucide-react';
import { AppPage, RegisterFormData } from '../../types';
import AuthLayout from './components/AuthLayout';
import SocialAuthButtons from './components/SocialAuthButtons';

import api from '../../shared/api';

interface RegisterPageProps {
  onNavigate: (page: AppPage) => void;
}

/** Lightweight password strength scorer */
function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: 'Weak',   color: 'bg-red-500' };
  if (score <= 3) return { score, label: 'Good',  color: 'bg-amber-400' };
  return            { score, label: 'Strong', color: 'bg-emerald-500' };
}

export default function RegisterPage({ onNavigate }: RegisterPageProps) {
  const [form, setForm] = useState<RegisterFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword]  = useState(false);
  const [showConfirm,  setShowConfirm]   = useState(false);
  const [loading, setLoading]  = useState(false);
  const [success, setSuccess]  = useState(false);
  const [errors,  setErrors]   = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [serverError, setServerError] = useState('');

  const set = <K extends keyof RegisterFormData>(field: K, value: RegisterFormData[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.fullName.trim())              e.fullName = 'Full name is required.';
    if (!form.email.includes('@'))          e.email    = 'Enter a valid email address.';
    if (form.password.length < 8)          e.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword)
                                            e.confirmPassword = 'Passwords do not match.';
    if (!form.agreeTerms)                   e.agreeTerms = 'You must accept the terms.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await api.post('/register', {
        name: form.fullName,
        email: form.email,
        password: form.password,
      });

      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        setSuccess(true);
        setTimeout(() => {
          onNavigate('dashboard');
        }, 1200);
      } else {
        setServerError(response.data.message || 'Registration failed.');
      }
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || err.message || 'An error occurred during registration.'
      );
    } finally {
      setLoading(false);
    }
  };


  const strength = getPasswordStrength(form.password);

  // ── Input helper ──────────────────────────────────────────────────────────
  const inputCls = (field: keyof RegisterFormData) =>
    `w-full bg-white border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-all shadow-sm ${
      errors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500'
    }`;

  const ErrorMsg = ({ field }: { field: keyof RegisterFormData }) =>
    errors[field] ? (
      <p className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 mt-1.5">
        <AlertCircle className="w-3 h-3 shrink-0" /> {errors[field]}
      </p>
    ) : null;

  return (
    <AuthLayout
      onNavigate={onNavigate}
      title="Create Account"
      subtitle="Fill in your details to get started — it only takes a minute to unlock your AI study partner."
      icon={<UserPlus className="w-6 h-6 text-emerald-600" />}
      headline="Join"
      headlineHighlight="Classmate AI"
      description="Create your account and unlock personalized AI tutoring, smart scheduling, and 24/7 study support built for every student."
      bullets={[
        'Chat with a 24/7 AI tutor in any subject',
        'Personalized study plans tailored to your goals',
        'Automated assignments, notes, and progress tracking',
        'Join a global community of driven students',
      ]}
    >
      {success ? (
        // ── Success state ─────────────────────────────────────────────────
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center py-8 gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-teal-600 border-2 border-white flex items-center justify-center">
              <GraduationCap className="w-3 h-3 text-white" />
            </span>
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-xl tracking-tight">Welcome, {form.fullName.split(' ')[0]}!</h2>
            <p className="text-sm font-medium text-slate-500 mt-2 max-w-xs leading-relaxed">
              Your Classmate AI account has been created. Redirecting you to your new dashboard...
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('login')}
            className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-800 to-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            Go to Dashboard
          </motion.button>
        </motion.div>
      ) : (
        // ── Registration form ─────────────────────────────────────────────
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Server Error */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{serverError}</span>
            </motion.div>
          )}

          {/* Role toggle */}
          <div className="flex gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200">
            {(['student', 'educator'] as const).map(role => (
              <button
                key={role}
                type="button"
                onClick={() => set('role', role)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  form.role === role
                    ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
              >
                {role === 'student' ? <GraduationCap className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                {role}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full name */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Full Name
              </label>
              <input
                type="text"
                autoComplete="name"
                value={form.fullName}
                onChange={e => set('fullName', e.target.value)}
                placeholder="Jane Doe"
                className={inputCls('fullName')}
              />
              <ErrorMsg field="fullName" />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="jane@example.com"
                className={inputCls('email')}
              />
              <ErrorMsg field="email" />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="Min. 8 characters"
                className={`${inputCls('password')} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Strength bar */}
            {form.password.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${strength.color}`}
                    animate={{ width: `${(strength.score / 5) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  strength.score <= 1 ? 'text-red-500' : strength.score <= 3 ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {strength.label}
                </span>
              </div>
            )}
            <ErrorMsg field="password" />
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={e => set('confirmPassword', e.target.value)}
                placeholder="Re-enter password"
                className={`${inputCls('confirmPassword')} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {/* Match indicator */}
              {form.confirmPassword.length > 0 && (
                <div className={`absolute right-10 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                  form.password === form.confirmPassword ? 'bg-emerald-500' : 'bg-red-500'
                }`} />
              )}
            </div>
            <ErrorMsg field="confirmPassword" />
          </div>

          {/* Terms */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer group select-none mt-2">
              <div
                onClick={() => set('agreeTerms', !form.agreeTerms)}
                className={`mt-0.5 w-5 h-5 rounded-[6px] border flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-sm ${
                  form.agreeTerms
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'bg-white border-slate-200 group-hover:border-emerald-300'
                }`}
              >
                {form.agreeTerms && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-sm font-medium text-slate-600 leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-emerald-600 hover:text-emerald-700 transition-colors font-semibold">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-emerald-600 hover:text-emerald-700 transition-colors font-semibold">Privacy Policy</a>
              </span>
            </label>
            <ErrorMsg field="agreeTerms" />
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="mt-2 py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-teal-800 to-emerald-500 shadow-lg shadow-emerald-500/20 disabled:opacity-60 cursor-pointer transition-opacity"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Free Account
              </>
            )}
          </motion.button>

          {/* Social */}
          <SocialAuthButtons label="Sign up" onNavigate={onNavigate} />

          {/* Login link */}
          <p className="text-center text-sm font-medium text-slate-500 mt-2">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer font-bold"
            >
              Sign in here
            </button>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
