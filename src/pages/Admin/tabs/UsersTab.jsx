import React, { useState, useEffect } from 'react';
import { UserPlus, Users, UserRound, Briefcase, Clock } from 'lucide-react';
import UserTable from '../components/UserTable';
import AddUserModal from '../modals/AddUserModal';
import StatCard from '../components/StatCard';
import PendingAccounts from '../components/PendingAccounts';
import RoleDistribution from '../components/RoleDistribution';
import { API_BASE, authHeaders } from '../../../utils/catalog';

export default function UsersTab() {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userStats, setUserStats] = useState({
    all: 0,
    clients: 0,
    staff: 0,
    pending: 0
  });

  const fetchUserStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok || !data.success || !Array.isArray(data.users)) {
        throw new Error(data.message || `Failed to load user statistics (HTTP ${res.status})`);
      }
      if (Array.isArray(data.users)) {
        const allUsers = data.users;
        setUserStats({
          all: allUsers.length,
          clients: allUsers.filter(u => (u.role || '').toLowerCase() === 'client').length,
          staff: allUsers.filter(u => (u.role || '').toLowerCase() === 'staff').length,
          pending: allUsers.filter(u => (u.status || '').toLowerCase() === 'pending').length
        });
      }
    } catch (e) {
      console.warn('Failed to fetch user stats:', e.message);
      setUserStats({ all: 0, clients: 0, staff: 0, pending: 0 });
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [refreshKey]);

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              User Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Manage all user accounts in the system
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all border border-emerald-400/40 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Add New User
        </button>
      </div>

      {/* Stats Grid - Dynamic Database Counts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="ALL USERS" value={String(userStats.all)} trend="12.5%" trendUp={true} icon={<Users className="w-5 h-5" />} />
        <StatCard title="CLIENT ACCOUNTS" value={String(userStats.clients)} trend="8.3%" trendUp={true} icon={<UserRound className="w-5 h-5" />} />
        <StatCard title="STAFF ACCOUNTS" value={String(userStats.staff)} trend="5.7%" trendUp={true} icon={<Briefcase className="w-5 h-5" />} />
        <StatCard title="PENDING ACCOUNTS" value={String(userStats.pending)} trend="3.2%" trendUp={false} icon={<Clock className="w-5 h-5" />} />
      </div>

      {/* Table (tabs, search, pagination live inside UserTable) */}
      <UserTable key={refreshKey} onOpenAddUser={() => setOpen(true)} />

      {/* Bottom widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PendingAccounts />
        <RoleDistribution />
      </div>

      <AddUserModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onUserCreated={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}