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
  if (score <= 3) return { score, label: 'Medium',  color: 'bg-amber-400' };
  return            { score, label: 'Strong', color: 'bg-emerald-400' };
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
    `w-full bg-white/[0.05] border rounded-xl px-4 py-3 font-mono text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-all ${
      errors[field]
        ? 'border-red-500/50 focus:border-red-400/60 focus:ring-red-400/20'
        : 'border-white/10 focus:border-cyan-400/60 focus:ring-cyan-400/20 focus:bg-white/[0.08]'
    }`;

  const ErrorMsg = ({ field }: { field: keyof RegisterFormData }) =>
    errors[field] ? (
      <p className="flex items-center gap-1.5 font-mono text-[10px] text-red-400 mt-1">
        <AlertCircle className="w-3 h-3 shrink-0" /> {errors[field]}
      </p>
    ) : null;

  return (
    <AuthLayout
      onNavigate={onNavigate}
      title="Enlist in Nexus"
      subtitle="Create your free student account"
      icon={<UserPlus className="w-5 h-5" />}
      accentClass="bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500"
    >
      {success ? (
        // ── Success state ─────────────────────────────────────────────────
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center py-6 gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 border-2 border-[#020617] flex items-center justify-center">
              <GraduationCap className="w-2.5 h-2.5 text-white" />
            </span>
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-xl">Account Created!</h2>
            <p className="font-mono text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Welcome aboard, {form.fullName.split(' ')[0]}. Your Nexus cadet account is ready.
              Check your email for a verification link.
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('login')}
            className="mt-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-mono font-bold uppercase tracking-widest cursor-pointer shadow-lg shadow-indigo-500/25"
          >
            Sign In Now
          </motion.button>
        </motion.div>
      ) : (
        // ── Registration form ─────────────────────────────────────────────
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Server Error */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-mono text-xs">{serverError}</span>
            </motion.div>
          )}

          {/* Role toggle */}
          <div className="flex gap-2 p-1 rounded-xl bg-black/30 border border-white/10">
            {(['student', 'educator'] as const).map(role => (
              <button
                key={role}
                type="button"
                onClick={() => set('role', role)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                  form.role === role
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold shadow shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {role === 'student' ? <GraduationCap className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                {role}
              </button>
            ))}
          </div>

          {/* Full name */}
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
              Full Name
            </label>
            <input
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={e => set('fullName', e.target.value)}
              placeholder="Alex Quantum"
              className={inputCls('fullName')}
            />
            <ErrorMsg field="fullName" />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
              Email Address
            </label>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="cadet@hyperion.academy"
              className={inputCls('email')}
            />
            <ErrorMsg field="email" />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Strength bar */}
            {form.password.length > 0 && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${strength.color}`}
                    animate={{ width: `${(strength.score / 5) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className={`font-mono text-[9px] uppercase tracking-wider ${
                  strength.score <= 1 ? 'text-red-400' : strength.score <= 3 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {strength.label}
                </span>
              </div>
            )}
            <ErrorMsg field="password" />
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {/* Match indicator */}
              {form.confirmPassword.length > 0 && (
                <div className={`absolute right-10 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                  form.password === form.confirmPassword ? 'bg-emerald-400' : 'bg-red-400'
                }`} />
              )}
            </div>
            <ErrorMsg field="confirmPassword" />
          </div>

          {/* Terms */}
          <div>
            <label className="flex items-start gap-2.5 cursor-pointer group select-none">
              <div
                onClick={() => set('agreeTerms', !form.agreeTerms)}
                className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                  form.agreeTerms
                    ? 'bg-cyan-500 border-cyan-500'
                    : 'bg-white/[0.05] border-white/20 group-hover:border-white/40'
                }`}
              >
                {form.agreeTerms && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <span className="font-mono text-[10px] text-slate-400 leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Privacy Policy</a>
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
            className="mt-1 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-widest text-white flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 shadow-lg shadow-indigo-500/30 disabled:opacity-60 cursor-pointer transition-opacity"
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
          <p className="text-center font-mono text-[11px] text-slate-500 mt-1">
            Already a cadet?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer font-semibold"
            >
              Sign in here
            </button>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
