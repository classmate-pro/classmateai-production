// ─── Auth Module: Login Page ─────────────────────────────────────────────────
import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { LogIn, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { AppPage, LoginFormData } from '../../types';
import AuthLayout from './components/AuthLayout';
import SocialAuthButtons from './components/SocialAuthButtons';
import api from '../../shared/api';

interface LoginPageProps {
  onNavigate: (page: AppPage) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [form, setForm] = useState<LoginFormData>({
    email: '',
    password: '',
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof LoginFormData, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/login', {
        email: form.email,
        password: form.password,
      });

      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        setSuccess(true);
        setTimeout(() => {
          onNavigate('dashboard');
        }, 1000);
      } else {
        setError(response.data.message || 'Login failed.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'An error occurred during authentication.'
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <AuthLayout
      onNavigate={onNavigate}
      title="Sign In"
      subtitle="Welcome back! Please enter your details to pick up right where you left off."
      icon={<LogIn className="w-6 h-6 text-emerald-600" />}
      headline="Welcome"
      headlineHighlight="Back"
      description="Sign in to continue learning faster, stressing less, and achieving more with your personalized AI study partner."
      bullets={[
        'Resume your personalized study plan',
        'Chat with your 24/7 AI tutor',
        'Track assignments and progress',
        'Sync seamlessly across all your devices',
      ]}
    >
      {success ? (
        // ── Success state ──
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center py-8 gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-xl tracking-tight">Access Granted</h2>
            <p className="text-sm font-medium text-slate-500 mt-2 max-w-xs">
              Welcome back! Redirecting you to your dashboard...
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setSuccess(false); setForm({ email: '', password: '', remember: false }); }}
            className="mt-4 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Email Address
            </label>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="you@example.com"
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Password
              </label>
              <button
                type="button"
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-3 cursor-pointer group select-none">
            <div
              onClick={() => set('remember', !form.remember)}
              className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                form.remember
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'bg-white border-slate-200 group-hover:border-emerald-300'
              }`}
            >
              {form.remember && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            <span className="text-sm font-medium text-slate-600">
              Remember this device
            </span>
          </label>

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
                Authenticating...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </motion.button>

          {/* Social */}
          <SocialAuthButtons label="Sign in" onNavigate={onNavigate} />

          {/* Register link */}
          <p className="text-center text-sm font-medium text-slate-500 mt-2">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer font-bold"
            >
              Create one for free
            </button>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
