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
      title="Uplink Authorization"
      subtitle="Secure access · Standard protocol"
      icon={<LogIn className="w-5 h-5" />}
    >
      {success ? (
        // ── Success state ──
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center py-6 gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-xl">Access Granted</h2>
            <p className="font-mono text-xs text-slate-400 mt-1 max-w-xs">
              Secure channel established. Welcome back, Cadet.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setSuccess(false); setForm({ email: '', password: '', remember: false }); }}
            className="mt-2 px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-mono text-xs">{error}</span>
            </motion.div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
              Email Address
            </label>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="cadet@hyperion.academy"
              className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20 focus:bg-white/[0.08] transition-all"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                Password
              </label>
              <button
                type="button"
                className="font-mono text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
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
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 pr-11 font-mono text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20 focus:bg-white/[0.08] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-2.5 cursor-pointer group select-none">
            <div
              onClick={() => set('remember', !form.remember)}
              className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
                form.remember
                  ? 'bg-cyan-500 border-cyan-500'
                  : 'bg-white/[0.05] border-white/20 group-hover:border-white/40'
              }`}
            >
              {form.remember && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
              Remember this device
            </span>
          </label>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="mt-1 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-widest text-white flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/30 disabled:opacity-60 cursor-pointer transition-opacity"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In to Nexus
              </>
            )}
          </motion.button>

          {/* Social */}
          <SocialAuthButtons label="Sign in" onNavigate={onNavigate} />

          {/* Register link */}
          <p className="text-center font-mono text-[11px] text-slate-500 mt-1">
            No account yet?{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer font-semibold"
            >
              Create one free
            </button>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
