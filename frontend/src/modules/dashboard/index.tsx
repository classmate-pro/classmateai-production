import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Trophy, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  MessageSquare, 
  Settings as SettingsIcon, 
  LogOut, 
  Search, 
  Bell, 
  ChevronDown, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Download, 
  Globe, 
  Send,
  User,
  Plus,
  Trash2,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CoreSettings, AppPage } from '../../types';

interface HudDashboardProps {
  settings: CoreSettings;
  setSettings: React.Dispatch<React.SetStateAction<CoreSettings>>;
  onNavigate?: (page: AppPage) => void;
}

type TabType = 'dashboard' | 'leaderboard' | 'order' | 'products' | 'reports' | 'messages' | 'settings';

export default function HudDashboard({ settings, setSettings, onNavigate }: HudDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('Eng (US)');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mock states for interactive elements
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Alex', text: 'Hey, did you check the new quantum learning modules?', time: '10:32 AM', isSelf: false },
    { id: 2, sender: 'You', text: 'Yeah, completed the cybernetics quiz yesterday!', time: '10:33 AM', isSelf: true },
    { id: 3, sender: 'Alex', text: 'Awesome! Let\'s pair up for the next lab assignment.', time: '10:35 AM', isSelf: false },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const [products, setProducts] = useState([
    { id: '1', name: 'Cybernetic Neural Bridge', category: 'Hardware', price: '$249', stock: 18, sales: 85 },
    { id: '2', name: 'Quantum Data Decoder V3', category: 'Software', price: '$129', stock: 45, sales: 120 },
    { id: '3', name: 'Holographic Study Assistant', category: 'AI Tools', price: '$49', stock: 92, sales: 340 },
    { id: '4', name: 'Synapse Accelerator Pod', category: 'Hardware', price: '$599', stock: 8, sales: 32 },
  ]);

  const [orders, setOrders] = useState([
    { id: '#ORD-9021', customer: 'Sarah Jenkins', date: '2026-07-02', status: 'Completed', amount: '$249.00' },
    { id: '#ORD-8942', customer: 'Marcus Vance', date: '2026-07-01', status: 'Processing', amount: '$129.00' },
    { id: '#ORD-8819', customer: 'Elena Rostova', date: '2026-06-30', status: 'Completed', amount: '$98.00' },
    { id: '#ORD-8711', customer: 'David Kim', date: '2026-06-29', status: 'Failed', amount: '$599.00' },
  ]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages([
      ...messages,
      { id: Date.now(), sender: 'You', text: newMessage, time: 'Just Now', isSelf: true }
    ]);
    setNewMessage('');
    // Auto simulated reply
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'Alex', text: 'System diagnostics look stable. Let\'s schedule it!', time: 'Just Now', isSelf: false }
      ]);
    }, 1500);
  };

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#030712]/95 backdrop-blur-md text-slate-100 flex font-sans pt-0 overflow-hidden">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-24 right-6 z-[999] bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-4 py-3 rounded-xl border border-cyan-400/30 shadow-lg shadow-cyan-500/20 font-medium flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col justify-between shrink-0 h-screen sticky top-0 z-40">
        <div className="p-4 flex flex-col gap-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/20">
              <span className="font-bold text-lg text-white">N</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-200 to-cyan-200 bg-clip-text text-transparent">Nexus Hub</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold font-mono">Workspace</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
              { id: 'order', label: 'Orders', icon: ShoppingCart },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'reports', label: 'Sales Report', icon: BarChart3 },
              { id: 'messages', label: 'Messages', icon: MessageSquare },
              { id: 'settings', label: 'Settings', icon: SettingsIcon },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium relative group cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-600/90 to-cyan-500/90 text-white shadow-lg shadow-indigo-600/15 border border-white/10' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active-indicator" 
                      className="absolute right-2 w-1.5 h-6 rounded-full bg-cyan-300"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / Sign Out */}
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer group"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Workspace Content ── */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-950/20">
        
        {/* Top Control Bar */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-md px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="font-display font-extrabold text-2xl tracking-tight capitalize text-white flex items-center gap-2">
              {activeTab === 'reports' ? 'Sales Report' : activeTab}
            </h1>
            <span className="h-6 w-px bg-white/15 hidden md:block" />
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search metrics, reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-1.5 text-xs w-64 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all text-slate-200 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <span>🇺🇸</span>
                <span>{language}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-xl bg-slate-900 border border-white/10 shadow-2xl p-1 z-50">
                  {['Eng (US)', 'Español', 'Français'].map(lang => (
                    <button 
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setLangDropdownOpen(false);
                        triggerToast(`Language switched to ${lang}`);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button 
              onClick={() => triggerToast('No new notifications')}
              className="relative p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-cyan-500/30 transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
            </button>

            {/* User Account Info */}
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 text-left border border-white/10 hover:border-cyan-500/30 bg-white/5 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-400/25 flex items-center justify-center font-bold text-indigo-400 text-xs">
                  M
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-white leading-none">Musliq</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-0.5">Admin</p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-white/10 shadow-2xl p-1 z-50">
                  <div className="px-3 py-2 border-b border-white/5 mb-1">
                    <p className="text-xs font-semibold text-white">Musliq Malik</p>
                    <p className="text-[10px] text-slate-500">musliq@classmate.ai</p>
                  </div>
                  <button 
                    onClick={() => { setActiveTab('settings'); setProfileDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <SettingsIcon className="w-3.5 h-3.5" /> Account Settings
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab content area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* ── TAB: DASHBOARD ── */}
              {activeTab === 'dashboard' && (
                <>
                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* Today's Sales Card */}
                    <div className="xl:col-span-2 bg-[#0d1224]/85 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="font-display font-semibold text-lg text-white">Today's Sales</h3>
                          <p className="text-xs text-slate-400">Sales Summary</p>
                        </div>
                        <button 
                          onClick={() => triggerToast('Sales exported successfully!')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-cyan-500/30 hover:bg-white/5 text-xs text-slate-300 hover:text-white transition-all cursor-pointer font-medium"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { title: '$1k', label: 'Total Sales', change: '+8% from yesterday', color: 'rose', val: 8 },
                          { title: '300', label: 'Total Order', change: '+5% from yesterday', color: 'amber', val: 5 },
                          { title: '5', label: 'Product Sold', change: '+1.2% from yesterday', color: 'emerald', val: 1.2 },
                          { title: '8', label: 'New Customers', change: '0.5% from yesterday', color: 'purple', val: 0.5 },
                        ].map((stat, idx) => {
                          const borderColors = {
                            rose: 'border-rose-500/20 bg-rose-500/[0.04] text-rose-400 hover:bg-rose-500/[0.07]',
                            amber: 'border-amber-500/20 bg-amber-500/[0.04] text-amber-400 hover:bg-amber-500/[0.07]',
                            emerald: 'border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-400 hover:bg-emerald-500/[0.07]',
                            purple: 'border-purple-500/20 bg-purple-500/[0.04] text-purple-400 hover:bg-purple-500/[0.07]'
                          };
                          const textColors = {
                            rose: 'text-rose-400',
                            amber: 'text-amber-400',
                            emerald: 'text-emerald-400',
                            purple: 'text-purple-400'
                          };
                          return (
                            <div 
                              key={idx}
                              className={`p-4 rounded-xl border transition-all duration-300 flex flex-col gap-1.5 ${borderColors[stat.color as keyof typeof borderColors]}`}
                            >
                              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                                <span className={`text-xs font-bold ${textColors[stat.color as keyof typeof textColors]}`}>{stat.label[0]}</span>
                              </div>
                              <span className="font-display font-bold text-2xl text-white mt-1">{stat.title}</span>
                              <div>
                                <p className="text-xs font-medium text-slate-300">{stat.label}</p>
                                <p className="text-[9px] text-slate-500 mt-0.5">{stat.change}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Visitor Insights (Line Chart Card) */}
                    <div className="bg-[#0d1224]/85 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-display font-semibold text-base text-white">Visitor Insights</h3>
                          <p className="text-xs text-slate-400">Total traffic tracking</p>
                        </div>
                      </div>

                      {/* Custom SVG Line Chart */}
                      <div className="w-full h-36 relative">
                        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#9d00ff" stopOpacity="0.25"/>
                              <stop offset="100%" stopColor="#9d00ff" stopOpacity="0"/>
                            </linearGradient>
                            <linearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.25"/>
                              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0"/>
                            </linearGradient>
                          </defs>
                          {/* Grid Lines */}
                          <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
                          <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
                          <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />

                          {/* Loyal Customers - purple */}
                          <path d="M 0 35 Q 20 10, 40 25 T 80 15 T 100 20" fill="none" stroke="#9d00ff" strokeWidth="1" strokeLinecap="round" />
                          
                          {/* New Customers - red/rose */}
                          <path d="M 0 30 Q 30 5, 60 20 T 100 10" fill="none" stroke="#ff007f" strokeWidth="1" strokeLinecap="round" />

                          {/* Unique Customers - green */}
                          <path d="M 0 25 Q 25 35, 50 15 T 100 22" fill="none" stroke="#39ff14" strokeWidth="1" strokeLinecap="round" />
                        </svg>
                      </div>

                      {/* Legend */}
                      <div className="flex justify-between items-center gap-2 mt-4 text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#9d00ff]" /> Loyal</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ff007f]" /> New</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#39ff14]" /> Unique</span>
                      </div>
                    </div>
                  </div>

                  {/* Second Charts Row Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Total Revenue (Bar Chart) */}
                    <div className="bg-[#0d1224]/85 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
                      <div className="mb-4">
                        <h3 className="font-display font-semibold text-base text-white">Total Revenue</h3>
                        <p className="text-xs text-slate-400">Online vs Offline sales</p>
                      </div>

                      {/* Bar graph */}
                      <div className="w-full h-36 flex items-end gap-3 px-2">
                        {[
                          { day: 'Mon', on: 65, off: 40 },
                          { day: 'Tue', on: 80, off: 55 },
                          { day: 'Wed', on: 45, off: 85 },
                          { day: 'Thu', on: 70, off: 60 },
                          { day: 'Fri', on: 90, off: 75 },
                          { day: 'Sat', on: 50, off: 35 },
                          { day: 'Sun', on: 85, off: 65 },
                        ].map((data, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                            <div className="flex gap-1 w-full items-end justify-center h-28">
                              <div style={{ height: `${data.on}%` }} className="w-1.5 bg-cyan-400 rounded-t-sm" />
                              <div style={{ height: `${data.off}%` }} className="w-1.5 bg-indigo-500 rounded-t-sm" />
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono mt-1">{data.day}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-center gap-4 mt-4 text-[10px] font-mono text-slate-400">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-cyan-400 rounded-sm" /> Online</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-indigo-500 rounded-sm" /> Offline</span>
                      </div>
                    </div>

                    {/* Customer Satisfaction */}
                    <div className="bg-[#0d1224]/85 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
                      <div className="mb-4">
                        <h3 className="font-display font-semibold text-base text-white">Customer Satisfaction</h3>
                        <p className="text-xs text-slate-400">User experience metrics</p>
                      </div>

                      {/* Area Curve SVG */}
                      <div className="w-full h-36 relative">
                        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                          <path d="M 0 35 Q 20 15, 40 28 T 80 18 T 100 25 L 100 40 L 0 40 Z" fill="url(#cyanGlow)" />
                          <path d="M 0 35 Q 20 15, 40 28 T 80 18 T 100 25" fill="none" stroke="#00f0ff" strokeWidth="1" />

                          <path d="M 0 30 Q 30 18, 60 32 T 100 15 L 100 40 L 0 40 Z" fill="none" />
                          <path d="M 0 30 Q 30 18, 60 32 T 100 15" fill="none" stroke="#39ff14" strokeWidth="0.8" strokeDasharray="1.5" />
                        </svg>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-4 border-t border-white/5 pt-3">
                        <div className="text-center">
                          <p className="text-slate-500">Last Month</p>
                          <p className="font-semibold text-emerald-400">$3,004</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-500">This Month</p>
                          <p className="font-semibold text-cyan-400">$4,504</p>
                        </div>
                      </div>
                    </div>

                    {/* Target vs Reality */}
                    <div className="bg-[#0d1224]/85 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
                      <div className="mb-4">
                        <h3 className="font-display font-semibold text-base text-white">Target vs Reality</h3>
                        <p className="text-xs text-slate-400">Comparative goals analysis</p>
                      </div>

                      {/* Vertical bars comparison */}
                      <div className="w-full h-36 flex items-end gap-2 px-1">
                        {[
                          { month: 'Jan', target: 50, reality: 40 },
                          { month: 'Feb', target: 60, reality: 55 },
                          { month: 'Mar', target: 80, reality: 65 },
                          { month: 'Apr', target: 70, reality: 72 },
                          { month: 'May', target: 85, reality: 80 },
                          { month: 'Jun', target: 90, reality: 82 },
                          { month: 'Jul', target: 95, reality: 92 },
                        ].map((m, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                            <div className="relative w-full h-24 flex items-end justify-center">
                              {/* Stacked or side bars */}
                              <div style={{ height: `${m.target}%` }} className="absolute bottom-0 w-2.5 bg-amber-500/20 rounded-md" />
                              <div style={{ height: `${m.reality}%` }} className="absolute bottom-0 w-2.5 bg-amber-400 rounded-md shadow-md shadow-amber-400/20" />
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono mt-1">{m.month}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-4 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-sm" />
                          <div>
                            <p className="text-[9px] text-slate-500">Reality Sales</p>
                            <p className="font-bold text-white text-xs">8,823</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-amber-400 rounded-sm" />
                          <div>
                            <p className="text-[9px] text-slate-500">Target Sales</p>
                            <p className="font-bold text-white text-xs">12,122</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row - Top Products & Sales Map */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Top Products Table */}
                    <div className="bg-[#0d1224]/85 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                      <h3 className="font-display font-semibold text-base text-white mb-4">Top Products</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                          <thead className="text-[10px] text-slate-500 uppercase font-semibold border-b border-white/5">
                            <tr>
                              <th className="py-2.5">Name</th>
                              <th className="py-2.5">Category</th>
                              <th className="py-2.5">Price</th>
                              <th className="py-2.5 text-right">Sales</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {products.slice(0, 3).map((prod) => (
                              <tr key={prod.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-3 font-medium text-white">{prod.name}</td>
                                <td className="py-3 text-slate-400">{prod.category}</td>
                                <td className="py-3 font-mono text-cyan-400">{prod.price}</td>
                                <td className="py-3 text-right font-mono font-semibold text-white">{prod.sales}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Sales Mapping by Country */}
                    <div className="bg-[#0d1224]/85 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
                      <div className="mb-4">
                        <h3 className="font-display font-semibold text-base text-white">Sales Mapping by Country</h3>
                        <p className="text-xs text-slate-400">Global market penetration</p>
                      </div>

                      <div className="space-y-3.5">
                        {[
                          { country: 'United States', flag: '🇺🇸', percent: 64, val: '$14.2k' },
                          { country: 'Germany', flag: '🇩🇪', percent: 45, val: '$8.4k' },
                          { country: 'Japan', flag: '🇯🇵', percent: 38, val: '$6.1k' },
                        ].map((c, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-medium text-white flex items-center gap-1.5"><span>{c.flag}</span>{c.country}</span>
                              <span className="font-mono text-slate-400">{c.val}</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div style={{ width: `${c.percent}%` }} className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── TAB: LEADERBOARD ── */}
              {activeTab === 'leaderboard' && (
                <div className="bg-[#0d1224]/85 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-display font-semibold text-lg text-white">Leaderboard</h3>
                      <p className="text-xs text-slate-400">Top performance metrics by users</p>
                    </div>
                    <Trophy className="w-6 h-6 text-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="text-[10px] text-slate-500 uppercase font-semibold border-b border-white/5">
                        <tr>
                          <th className="py-3 px-4">Rank</th>
                          <th className="py-3 px-4">User</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Performance Rating</th>
                          <th className="py-3 px-4 text-right">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {[
                          { rank: '🥇 1', name: 'Alex Johnson', role: 'Premium Student', rating: 98, points: '42,900' },
                          { rank: '🥈 2', name: 'Elena Rostova', role: 'Academic Lead', rating: 95, points: '39,120' },
                          { rank: '🥉 3', name: 'Musliq Malik', role: 'Administrator', rating: 92, points: '36,400' },
                          { rank: '4', name: 'David Kim', role: 'Vanguard User', rating: 88, points: '31,200' },
                          { rank: '5', name: 'Sarah Jenkins', role: 'Member', rating: 85, points: '29,450' },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 px-4 font-mono font-bold">{row.rank}</td>
                            <td className="py-4 px-4 font-medium text-white">{row.name}</td>
                            <td className="py-4 px-4 text-slate-400">{row.role}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div style={{ width: `${row.rating}%` }} className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500" />
                                </div>
                                <span className="font-mono text-cyan-400">{row.rating}%</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right font-mono font-semibold text-white">{row.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── TAB: ORDERS ── */}
              {activeTab === 'order' && (
                <div className="bg-[#0d1224]/85 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-display font-semibold text-lg text-white">Orders Log</h3>
                      <p className="text-xs text-slate-400">Manage transaction histories</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="text-[10px] text-slate-500 uppercase font-semibold border-b border-white/5">
                        <tr>
                          <th className="py-3 px-4">Order ID</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {orders.map((o) => (
                          <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 px-4 font-mono text-cyan-400 font-medium">{o.id}</td>
                            <td className="py-4 px-4 font-semibold text-white">{o.customer}</td>
                            <td className="py-4 px-4 font-mono text-slate-400">{o.date}</td>
                            <td className="py-4 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider ${
                                o.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                o.status === 'Processing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right font-mono font-bold text-white">{o.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── TAB: PRODUCTS ── */}
              {activeTab === 'products' && (
                <div className="bg-[#0d1224]/85 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-display font-semibold text-lg text-white">Product Catalog</h3>
                      <p className="text-xs text-slate-400">Inventory management system</p>
                    </div>
                    <button 
                      onClick={() => triggerToast('Product creation is disabled for this prototype')}
                      className="flex items-center gap-1 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold hover:opacity-95 shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Product</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {products.map((p) => (
                      <div key={p.id} className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/25 transition-all">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] text-slate-500 font-semibold font-mono uppercase bg-white/5 px-2 py-0.5 rounded">{p.category}</span>
                            <span className="font-mono text-xs font-bold text-cyan-400">{p.price}</span>
                          </div>
                          <h4 className="font-display font-bold text-sm text-white">{p.name}</h4>
                        </div>

                        <div className="space-y-3 mt-5">
                          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                            <span>Stock: <strong className="text-white">{p.stock}</strong></span>
                            <span>Sales: <strong className="text-white">{p.sales}</strong></span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => triggerToast(`Editing ${p.name}`)}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/25 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button 
                              onClick={() => {
                                setProducts(products.filter(item => item.id !== p.id));
                                triggerToast(`${p.name} deleted`);
                              }}
                              className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TAB: REPORTS ── */}
              {activeTab === 'reports' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Detailed Performance Charts */}
                  <div className="bg-[#0d1224]/85 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6">
                    <div>
                      <h3 className="font-display font-semibold text-lg text-white">Interactive Annual Breakdown</h3>
                      <p className="text-xs text-slate-400">Total volume compared across 2026</p>
                    </div>

                    <div className="w-full h-56 relative">
                      <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                        <path d="M 0 38 Q 20 8, 40 22 T 80 12 T 100 20 L 100 40 L 0 40 Z" fill="url(#cyanGlow)" />
                        <path d="M 0 38 Q 20 8, 40 22 T 80 12 T 100 20" fill="none" stroke="#00f0ff" strokeWidth="1.2" />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-[#0d1224]/85 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-5">
                    <div>
                      <h3 className="font-display font-semibold text-lg text-white">Monthly Progress Indices</h3>
                      <p className="text-xs text-slate-400">Detailed metric goals</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { title: 'Goal Realization', rate: '86%', desc: 'Product milestones reached', progress: 86, color: 'from-cyan-500 to-indigo-500' },
                        { title: 'User Growth', rate: '14%', desc: 'Net active users vs last month', progress: 14, color: 'from-pink-500 to-purple-500' },
                        { title: 'Customer Retention Rate', rate: '92%', desc: 'Long-term user subscription base', progress: 92, color: 'from-emerald-500 to-teal-500' },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-white">{item.title}</p>
                              <p className="text-[10px] text-slate-500">{item.desc}</p>
                            </div>
                            <span className="font-mono font-bold text-white">{item.rate}</span>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div style={{ width: `${item.progress}%` }} className={`h-full bg-gradient-to-r ${item.color} rounded-full`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: MESSAGES ── */}
              {activeTab === 'messages' && (
                <div className="bg-[#0d1224]/85 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row gap-6 h-[500px]">
                  
                  {/* Contacts Column */}
                  <div className="w-full md:w-64 flex flex-col border-r border-white/5 md:pr-6 gap-4">
                    <h4 className="font-display font-bold text-sm text-slate-300">Active Contacts</h4>
                    <div className="flex flex-col gap-1 overflow-y-auto">
                      {[
                        { name: 'Alex Johnson', role: 'Premium Student', active: true },
                        { name: 'Dr. V. Aris', role: 'Instructor', active: false },
                        { name: 'Elena Rostova', role: 'Vanguard User', active: false },
                      ].map((c, idx) => (
                        <button 
                          key={idx}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${c.active ? 'bg-white/5 border border-white/10' : 'hover:bg-white/5'}`}
                        >
                          <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center font-bold text-cyan-400 text-xs shrink-0">
                            {c.name[0]}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-semibold text-white truncate">{c.name}</p>
                            <p className="text-[9px] text-slate-500 truncate">{c.role}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chat Window */}
                  <div className="flex-1 flex flex-col justify-between h-full bg-black/20 border border-white/5 rounded-2xl p-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/35 flex items-center justify-center font-bold text-cyan-300 text-xs">
                        A
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Alex Johnson</p>
                        <p className="text-[9px] text-slate-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Online</p>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4 space-y-4 font-sans text-xs">
                      {messages.map((m) => (
                        <div key={m.id} className={`flex flex-col max-w-[80%] ${m.isSelf ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                          <div className={`p-3 rounded-2xl ${m.isSelf ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/5 text-slate-200 rounded-tl-none border border-white/5'}`}>
                            <p className="leading-relaxed">{m.text}</p>
                          </div>
                          <span className="text-[9px] text-slate-500 mt-1 font-mono">{m.time}</span>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-white/5">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-cyan-500/50"
                      />
                      <button 
                        type="submit" 
                        className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-95 text-white p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ── TAB: SETTINGS ── */}
              {activeTab === 'settings' && (
                <div className="bg-[#0d1224]/85 border border-white/10 rounded-2xl p-6 backdrop-blur-md max-w-2xl">
                  <h3 className="font-display font-semibold text-lg text-white mb-6 border-b border-white/5 pb-3">Account Settings</h3>
                  
                  <form onSubmit={(e) => { e.preventDefault(); triggerToast('Settings saved successfully!'); }} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-slate-400 font-medium">Username</label>
                        <input 
                          type="text" 
                          defaultValue="Musliq"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/50" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-slate-400 font-medium">Email Address</label>
                        <input 
                          type="email" 
                          defaultValue="musliq@classmate.ai"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/50" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-slate-400 font-medium">Role Access Level</label>
                      <input 
                        type="text" 
                        value="System Administrator" 
                        disabled
                        className="w-full bg-white/[0.02] border border-white/5 text-slate-500 rounded-xl px-3.5 py-2.5 cursor-not-allowed font-medium" 
                      />
                    </div>

                    <div className="space-y-2.5 pt-4">
                      <h4 className="font-bold text-slate-300">Preferences</h4>
                      <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <div>
                          <p className="font-semibold text-white">Enable Audio Triggers</p>
                          <p className="text-[10px] text-slate-500">Play ambient cybernetic notification sounds</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={settings.soundEnabled}
                          onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                          className="w-4 h-4 rounded accent-cyan-500" 
                        />
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <div>
                          <p className="font-semibold text-white">Animated Cybernetic Canvas</p>
                          <p className="text-[10px] text-slate-500">Render Three.js dynamic background geometries</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={settings.autoRotate}
                          onChange={(e) => setSettings(prev => ({ ...prev, autoRotate: e.target.checked }))}
                          className="w-4 h-4 rounded accent-cyan-500" 
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <button 
                        type="submit"
                        className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-95 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                      >
                        Save Configuration
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
