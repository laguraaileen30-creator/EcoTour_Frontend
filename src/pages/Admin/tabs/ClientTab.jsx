import React, { useState, useEffect } from 'react';
import { UserPlus, UserRound, Users, CheckCircle2, Clock, ShieldCheck, Search, Filter } from 'lucide-react';
import UserTable from '../components/UserTable';
import AddUserModal from '../modals/AddUserModal';
import StatCard from '../components/StatCard';
import PendingAccounts from '../components/PendingAccounts';

export default function ClientTab() {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [clientStats, setClientStats] = useState({
    total: 6,
    approved: 5,
    pending: 1,
    activeToday: 4
  });

  const fetchClientStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/users?role=client');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        const clients = data.users;
        setClientStats({
          total: clients.length,
          approved: clients.filter(u => (u.status || '').toLowerCase() === 'approved').length,
          pending: clients.filter(u => (u.status || '').toLowerCase() === 'pending').length,
          activeToday: Math.max(1, clients.filter(u => (u.status || '').toLowerCase() === 'approved').length)
        });
      }
    } catch (e) {
      console.warn('Failed to fetch client stats:', e.message);
    }
  };

  useEffect(() => {
    fetchClientStats();
  }, [refreshKey]);

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <UserRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Client & Visitor Directory
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Manage client registrations, online accounts, bookings history & member status
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all border border-emerald-400/40 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Add New Client
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="TOTAL CLIENTS" value={String(clientStats.total)} trend="Active" trendUp={true} icon={<UserRound className="w-5 h-5" />} />
        <StatCard title="APPROVED ACCOUNTS" value={String(clientStats.approved)} trend="Verified" trendUp={true} icon={<CheckCircle2 className="w-5 h-5" />} />
        <StatCard title="PENDING APPROVAL" value={String(clientStats.pending)} trend="Action Req." trendUp={false} icon={<Clock className="w-5 h-5" />} />
        <StatCard title="ACTIVE VISITORS TODAY" value={String(clientStats.activeToday)} trend="Resort Pax" trendUp={true} icon={<Users className="w-5 h-5" />} />
      </div>

      {/* Client Table with direct tab filtering */}
      <UserTable key={refreshKey} onOpenAddUser={() => setOpen(true)} />

      {/* Pending Account Review Section */}
      <div className="mt-4">
        <PendingAccounts />
      </div>

      {/* Add Client Registration Modal */}
      <AddUserModal
        isOpen={open}
        onClose={() => setOpen(false)}
        defaultRole="client"
        onUserCreated={() => setRefreshKey(k => k + 1)}
      />
    </div>
  );
}