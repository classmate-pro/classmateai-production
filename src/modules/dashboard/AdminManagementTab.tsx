// ─── Dashboard Tab: Admin Management ──────────────────────────────────────────
// User directory + role/status controls for the super_admin dashboard tab.
// Styled to match the rest of HudDashboard's light theme (white cards on
// slate-50), unlike the old standalone dark admin page this replaced.
import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserCheck, UserX, TrendingUp, Search, RefreshCw } from 'lucide-react';
import { AdminUser, AdminStats, UserRole } from '../../types';
import { fetchUsers, fetchStats, updateUserRole, updateUserStatus } from '../../shared/adminApi';

const ROLE_OPTIONS: UserRole[] = ['user', 'educator', 'super_admin'];

export default function AdminManagementTab() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const load = useCallback(async (searchTerm: string) => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetchStats(),
        fetchUsers({ search: searchTerm, limit: 50 }),
      ]);
      setStats(statsRes);
      setUsers(usersRes.users);
    } catch {
      setError('Could not load admin data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load('');
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => load(search), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleRoleChange = async (user: AdminUser, role: string) => {
    if (role === user.role) return;
    setBusyId(user.id);
    try {
      const updated = await updateUserRole(user.id, role);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      triggerToast(`${user.email} is now ${role.replace('_', ' ')}.`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      triggerToast(e.response?.data?.message || 'Could not update role.');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    setBusyId(user.id);
    try {
      const updated = await updateUserStatus(user.id, !user.is_active);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      triggerToast(`${user.email} ${updated.is_active ? 'activated' : 'deactivated'}.`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      triggerToast(e.response?.data?.message || 'Could not update status.');
    } finally {
      setBusyId(null);
    }
  };

  const statCards = stats
    ? [
        { label: 'Total Users', value: stats.total, icon: Users, tint: '#0ea5e9' },
        { label: 'Active', value: stats.active, icon: UserCheck, tint: '#10b981' },
        { label: 'Inactive', value: stats.inactive, icon: UserX, tint: '#f97316' },
        { label: 'New (7 days)', value: stats.newLast7Days, icon: TrendingUp, tint: '#a855f7' },
      ]
    : [];

  return (
    <div className="relative">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50 bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg text-[13px]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-slate-500 font-medium">{card.label}</span>
                <Icon className="w-4 h-4" style={{ color: card.tint }} />
              </div>
              <p className="text-2xl font-display font-bold text-slate-800">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-100 flex-wrap">
          <h2 className="font-display font-semibold text-base text-slate-800">Users</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email…"
                className="pl-8 pr-3 py-1.5 text-[12.5px] bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 w-56"
              />
            </div>
            <button
              onClick={() => load(search)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && <p className="p-4 text-[13px] text-rose-600">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Email</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Last login</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/70">
                  <td className="px-4 py-3 text-slate-800 font-medium">{user.full_name}</td>
                  <td className="px-4 py-3 text-slate-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      disabled={busyId === user.id}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-[12px] text-slate-700 outline-none disabled:opacity-50 cursor-pointer"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        user.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      disabled={busyId === user.id}
                      onClick={() => handleToggleActive(user)}
                      className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer ${
                        user.is_active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
