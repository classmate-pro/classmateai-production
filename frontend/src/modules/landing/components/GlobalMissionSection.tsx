import { Globe, Languages, GraduationCap, Wifi, Heart } from 'lucide-react';

const FEATURES = [
  { title: 'Multi-language AI', desc: 'Support for 40+ languages', icon: Languages },
  { title: 'Any curriculum', desc: 'Works with every grading system', icon: GraduationCap },
  { title: 'Offline mode', desc: 'For low-bandwidth regions', icon: Wifi },
  { title: 'Free tier', desc: 'For students who need it most', icon: Heart },
];

const LANGUAGES = [
  'English', 'हिंदी', 'தமிழ்', 'తెలుగు', 'বাংলা', 'मराठी', 'ગુજરાતી',
  'ಕನ್ನಡ', 'മലയാളം', 'Español', 'Français', 'Deutsch', '中文',
  '日本語', 'العربية', 'Português'
];

export default function GlobalMissionSection() {
  return (
    <section id="mission" className="landing-section-pad relative overflow-hidden z-10">
      <div className="landing-container">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Column: Text & Features */}
          <div>
            <div className="landing-eyebrow mb-10">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              Global reach
            </div>

            <h2 className="landing-section-title mb-8">
              Built for Every Student, <br />
              <span className="text-emerald-500">Everywhere.</span>
            </h2>

            <p className="landing-section-desc max-w-xl mb-12">
              Whether you're in Mumbai, Lagos, São Paulo, or Tokyo — Classmate AI speaks your language,
              understands your curriculum, and adapts to your timezone. No student should sacrifice their
              mental health to keep up with academic pressure.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {FEATURES.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 transition-colors">
                    <feature.icon className="w-5 h-5 text-slate-800 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#0A0A0A] tracking-tight">{feature.title}</h4>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Language Card */}
          <div className="relative">
            <div className="bg-white border border-slate-200 shadow-2xl rounded-[32px] p-10 relative z-10 overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
              
              <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center shadow-md">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#0A0A0A] leading-tight tracking-tight">40+ Languages</h3>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Native AI understanding</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase tracking-[0.2em]">Live</div>
              </div>

              <div className="flex flex-wrap gap-3 mb-12">
                {LANGUAGES.map((lang, idx) => (
                  <span key={idx} className="px-4 py-2 rounded border border-slate-200 bg-slate-50 text-[13px] font-bold text-slate-700 shadow-sm hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all cursor-default">
                    {lang}
                  </span>
                ))}
                <span className="px-4 py-2 rounded bg-black text-white text-[13px] font-bold shadow-sm">
                  +24 more
                </span>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-100 text-center">
                <div>
                  <p className="text-4xl font-extrabold text-[#0A0A0A] tracking-tight">190+</p>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-[0.2em] mt-2">Countries</p>
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-[#0A0A0A] tracking-tight">2.4M</p>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-[0.2em] mt-2">Students</p>
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-emerald-500 tracking-tight">24/7</p>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-[0.2em] mt-2">Support</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
