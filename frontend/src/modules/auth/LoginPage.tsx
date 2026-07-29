// ─── Auth Module: Login Page ─────────────────────────────────────────────────
import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { AppPage } from '../../types';
import AuthLayout from './components/AuthLayout';
import api from '../../shared/api';

interface LoginPageProps {
  onNavigate: (page: AppPage) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const response = await api.post('/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        onNavigate('dashboard');
      } else {
        setError(response.data.message || 'Login failed.');
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
      title="Sign In"
      subtitle="To access the portal"
      icon={null}
      headline="Welcome"
      headlineHighlight="Back"
      description="Sign in to continue learning faster, stressing less, and achieving more with your personalized AI study partner."
      bullets={[]}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

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

        {/* Email / Username */}
        <div className="relative">
          <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter User Name Here"
            className={inputCls}
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
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

        {/* Login button */}
        <motion.button
          id="login-submit"
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          className="w-full py-3.5 rounded-full text-sm font-bold text-white flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 shadow-lg disabled:opacity-60 transition-all"
        >
          {loading
            ? <div className="w-4 h-4 border-2 border-emerald-400/40 border-t-emerald-600 rounded-full animate-spin" />
            : 'Login'
          }
        </motion.button>

        {/* Forgot password */}
        <p className="text-center -mt-2">
          <button
            type="button"
            className="text-[13px] text-white/70 hover:text-white underline underline-offset-2 transition-colors"
          >
            Forgot Password?
          </button>
        </p>

        {/* Register link */}
        <p className="text-center text-[13px] text-white/60 border-t border-white/10 pt-4">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="text-white font-bold hover:text-emerald-100 transition-colors underline underline-offset-2"
          >
            Create one free
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
