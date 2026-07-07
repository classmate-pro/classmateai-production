import { useState } from 'react';
import { CreditCard, Check, Sparkles } from 'lucide-react';
import { CoreSettings } from '../../types';
import { getBgColorClass, getTextColorClass } from '../../utils/themeClasses';

interface PricingPageProps {
  color: CoreSettings['color'];
}

type Plan = 'cadet' | 'commander' | 'overlord';

export default function PricingPage({ color }: PricingPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('cadet');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = () => {
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setIsSubscribed(true);
    }, 1500);
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 pt-28 md:pt-32 pointer-events-none overflow-y-auto">
      <div className="w-full max-w-3xl glass-panel-deep p-6 md:p-8 rounded-3xl border border-white/10 shadow-3xl relative overflow-hidden pointer-events-auto my-4">
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${getBgColorClass(color)}`} />

        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${getTextColorClass(color)}`}>
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-xl uppercase tracking-wider text-white">
              Upgrade Subnet Tiers
            </h1>
            <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
              Max core frequencies &amp; features
            </p>
          </div>
        </div>

        {isSubscribed ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-7 h-7 animate-pulse" />
            </div>
            <h2 className="font-display font-semibold text-white text-lg">Subnet Tier Upgraded</h2>
            <p className="font-mono text-xs text-slate-300 max-w-[340px]">
              Core speed multiplier capacities unlocked. High-performance resonance loops authorized.
            </p>
            <button
              type="button"
              onClick={() => setIsSubscribed(false)}
              className="mt-2 py-2 px-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-mono text-slate-300 transition-all cursor-pointer"
            >
              Re-calibrate Subnet
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {([
                { id: 'cadet' as Plan, tag: 'Base Tier', name: 'Space Cadet', desc: 'Core access at basic system speeds.', price: '0 CR' },
                { id: 'commander' as Plan, tag: 'Warp Speed', name: 'Nova Commander', desc: 'Enhanced speed matrices & quantum mode.', price: '29 CR', recommended: true },
                { id: 'overlord' as Plan, tag: 'Cosmological', name: 'Elite Overlord', desc: 'Zero speed bounds, unlimited particle synctasks.', price: '99 CR' },
              ]).map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[160px] relative ${
                    selectedPlan === plan.id
                      ? 'border-cyan-400 bg-white/10 shadow-lg shadow-cyan-500/5'
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-2 right-3 px-1.5 py-0.5 bg-indigo-500 rounded-full text-[7px] font-mono font-bold tracking-wider uppercase text-white shadow">
                      Recommended
                    </div>
                  )}
                  <div>
                    <span className="font-mono text-[8px] text-slate-400 uppercase tracking-widest">{plan.tag}</span>
                    <h3 className="font-display font-medium text-sm text-white uppercase mt-0.5">{plan.name}</h3>
                    <p className="font-mono text-[9px] text-slate-400 mt-2">{plan.desc}</p>
                  </div>
                  <div className="mt-3">
                    <span className="font-mono text-lg font-bold text-white">{plan.price}</span>
                    <span className="font-mono text-[9px] text-slate-400"> / Cycle</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col gap-2.5">
              <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest">Subnet Provisioning Features</span>
              <div className="flex flex-col gap-1.5 font-mono text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Full-spectrum core warp speed limits: up to {selectedPlan === 'cadet' ? '2.5x' : selectedPlan === 'commander' ? '5.0x' : '10.0x'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Particle system array limits: {selectedPlan === 'cadet' ? '500' : selectedPlan === 'commander' ? '1500' : '4000'} nodes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Quantum Mode &amp; Neural Glitch vectors access</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubscribe}
              disabled={isSubscribing}
              className="py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-widest active:scale-[0.98] cursor-pointer text-white flex items-center justify-center gap-2 border border-white/10 bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-600/35 disabled:opacity-70"
            >
              {isSubscribing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Initiating Upgrade...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Authorize {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Tier</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
