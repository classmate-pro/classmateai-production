import { useState, type FormEvent } from 'react';
import { MessageSquare, Send, Check } from 'lucide-react';
import { CoreSettings } from '../../types';
import { getBgColorClass, getTextColorClass } from '../../utils/themeClasses';

interface ContactPageProps {
  color: CoreSettings['color'];
}

export default function ContactPage({ color }: ContactPageProps) {
  const [contactName, setContactName] = useState('');
  const [contactSubject, setContactSubject] = useState('administration');
  const [contactMessage, setContactMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactMessage) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setMessageSuccess(true);
    }, 1500);
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 pt-28 md:pt-32 pointer-events-none">
      <div className="w-full max-w-lg glass-panel-deep p-6 md:p-8 rounded-3xl border border-white/10 shadow-3xl relative overflow-hidden pointer-events-auto">
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${getBgColorClass(color)}`} />

        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${getTextColorClass(color)}`}>
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-xl uppercase tracking-wider text-white">
              Contact Us
            </h1>
            <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
              Holographic Priority Signal Relay
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {messageSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Check className="w-7 h-7 animate-pulse" />
              </div>
              <h2 className="font-display font-medium text-white text-lg">Transmission Sent</h2>
              <p className="font-mono text-xs text-slate-400 max-w-[325px]">
                Message beamed to command frequencies successfully. A reply signal will return shortly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMessageSuccess(false);
                  setContactName('');
                  setContactMessage('');
                }}
                className="mt-2 py-2 px-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-mono text-slate-300 transition-all cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] text-slate-300 uppercase tracking-wider">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Cadet Sarah Connor"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] text-slate-300 uppercase tracking-wider">
                  Department
                </label>
                <select
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                >
                  <option value="administration">Academy Command Administration</option>
                  <option value="research">Reactor Core Research Lab</option>
                  <option value="defense">Cosmic Defence Grid Station</option>
                  <option value="propulsion">Superlight Speed Propulsion Labs</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] text-slate-300 uppercase tracking-wider">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Beam system diagnostic suggestions or academic inquiries..."
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="mt-2 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-widest active:scale-[0.98] cursor-pointer text-white flex items-center justify-center gap-2 border border-white/10 bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-600/35 disabled:opacity-70"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Charging Signal Coils...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-cyan-300" />
                    <span>Send Transmission</span>
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
