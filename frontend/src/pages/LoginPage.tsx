import { useState, type FormEvent } from 'react';
import { LogIn, Check, Star } from 'lucide-react';
import { CoreSettings } from '../types';
import { getBgColorClass, getTextColorClass } from '../utils/themeClasses';

interface LoginPageProps {
  color: CoreSettings['color'];
}

export default function LoginPage({ color }: LoginPageProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      setLoginSuccess(true);
    }, 1500);
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 pt-28 md:pt-32 pointer-events-none">
      <div className="w-full max-w-md glass-panel-deep p-6 md:p-8 rounded-3xl border border-white/10 shadow-3xl relative overflow-hidden pointer-events-auto">
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${getBgColorClass(color)}`} />

        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${getTextColorClass(color)}`}>
            <LogIn className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-xl uppercase tracking-wider text-white">
              Uplink Authorization
            </h1>
            <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
              Standard Protocol: Secure Access
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {loginSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Check className="w-7 h-7 animate-pulse" />
              </div>
              <h2 className="font-display font-medium text-white text-lg">Credentials Verified</h2>
              <p className="font-mono text-xs text-slate-400 max-w-[320px]">
                Secure channel verified. Executive access granted to student matrices.
              </p>
              <button
                type="button"
                onClick={() => {
                  setLoginSuccess(false);
                  setLoginEmail('');
                  setLoginPassword('');
                }}
                className="mt-2 py-2 px-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-mono text-slate-300 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] text-slate-300 uppercase tracking-wider">
                  Secure Access Email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="cadet@hyperion.academy"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] text-slate-300 uppercase tracking-wider">
                  Access Passkey
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                />
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                <Star className={`w-3.5 h-3.5 ${getTextColorClass(color)}`} />
                <span>Security level: Subnet executive protocols active</span>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="mt-2 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-widest active:scale-[0.98] cursor-pointer text-white flex items-center justify-center gap-2 border border-white/10 bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-600/35 disabled:opacity-70"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Decrypting Channels...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Commence Secure Uplink</span>
                  </>
                )}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
