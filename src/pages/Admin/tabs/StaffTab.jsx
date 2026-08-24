import React, { useState } from 'react';
import { UserPlus, UserCog, UserCheck, Clock, DollarSign } from 'lucide-react';
import StaffTable from '../components/StaffTable';
import AddUserModal from '../modals/AddUserModal';
import StatCard from '../components/StatCard';

export default function StaffTab() {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [staffStats, setStaffStats] = useState({
    total: 4,
    onDuty: 2,
    offDuty: 2,
    dailyPayroll: 3100
  });

  const handleUpdateStats = (members) => {
    if (Array.isArray(members)) {
      const onDuty = members.filter(s => s.clockedIn).length;
      const totalPayroll = members.reduce((sum, s) => sum + (Number(s.dailySalary) || 0), 0);
      setStaffStats({
        total: members.length,
        onDuty,
        offDuty: Math.max(0, members.length - onDuty),
        dailyPayroll: totalPayroll
      });
    }
  };

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <UserCog className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Staff & Attendance Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Manage resort staff accounts, duty shifts, attendance tracking & official salary payslips
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all border border-emerald-400/40 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Add New Staff
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="TOTAL STAFF MEMBERS" value={String(staffStats.total)} trend="100%" trendUp={true} icon={<UserCog className="w-5 h-5" />} />
        <StatCard title="ON DUTY TODAY" value={String(staffStats.onDuty)} trend="Active" trendUp={true} icon={<UserCheck className="w-5 h-5" />} />
        <StatCard title="OFF DUTY" value={String(staffStats.offDuty)} trend="Standby" trendUp={false} icon={<Clock className="w-5 h-5" />} />
        <StatCard title="DAILY PAYROLL TALLY" value={`₱${staffStats.dailyPayroll.toLocaleString('en-US')}`} trend="Budget" trendUp={true} icon={<DollarSign className="w-5 h-5" />} />
      </div>

      {/* Staff Roster & Attendance Table */}
      <StaffTable key={refreshKey} onRefreshStats={handleUpdateStats} />

      {/* Add Staff Registration Modal */}
      <AddUserModal
        isOpen={open}
        onClose={() => setOpen(false)}
        defaultRole="staff"
        onUserCreated={() => setRefreshKey(k => k + 1)}
      />
    </div>
  );
}