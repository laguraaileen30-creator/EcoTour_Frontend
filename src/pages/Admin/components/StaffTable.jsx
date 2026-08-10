import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { formatCurrency, todayStr } from '../utils/dashboardHelpers';
import { UserCheck, Clock, DollarSign, UserCog } from 'lucide-react';

export default function StaffTable() {
  const { staffList, clockInStaff, clockOutStaff, toggleStaffStatus, paySalary } = useDashboard();
  const today = todayStr();

  return (
    <div className="card space-y-4">
      <div className="flex justify-between items-center border-b border-emerald-800/40 pb-3">
        <div>
          <h3 className="font-bold text-emerald-300 text-base flex items-center gap-2">
            <UserCog className="w-5 h-5 text-emerald-400" /> Resort Staff Roster & Attendance Tracking
          </h3>
          <p className="text-xs text-emerald-200/70">Clock-in, attendance logs, and staff salary management</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-emerald-800/40">
        <table className="w-full text-left text-xs">
          <thead className="bg-emerald-950/80 text-emerald-300 border-b border-emerald-800/40 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-3">Staff Name</th>
              <th className="p-3">Position</th>
              <th className="p-3 text-right">Daily Salary</th>
              <th className="p-3 text-center">Duty Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-900/30 text-emerald-100 font-medium">
            {staffList.map((s) => {
              const att = s.attendanceHistory ? s.attendanceHistory.find((a) => a.date === today) : null;
              return (
                <tr key={s.id} className="hover:bg-emerald-950/30 transition-colors">
                  <td className="p-3 font-bold text-emerald-100">{s.name}</td>
                  <td className="p-3 text-emerald-300 font-semibold">{s.position}</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(s.dailySalary)}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                      att ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {att ? <UserCheck className="w-3 h-3 text-emerald-400" /> : <Clock className="w-3 h-3" />}
                      {att ? `Clocked In (${att.timeIn})` : 'Off Duty'}
                    </span>
                  </td>
                  <td className="p-3 text-center space-x-1.5">
                    {att ? (
                      <button onClick={() => clockOutStaff(s.id)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1 rounded-lg text-[10px] cursor-pointer">Clock Out</button>
                    ) : (
                      <button onClick={() => clockInStaff(s.id)} className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-1 rounded-lg text-[10px] cursor-pointer">Clock In</button>
                    )}
                    <button onClick={() => paySalary(s)} className="bg-emerald-900/60 border border-emerald-500/40 hover:bg-emerald-800/80 text-emerald-300 font-bold px-3 py-1 rounded-lg text-[10px] cursor-pointer flex-inline items-center gap-1">
                      <DollarSign className="w-3 h-3 inline" /> Pay Salary
                    </button>
                    <button onClick={() => toggleStaffStatus(s.id)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2.5 py-1 rounded-lg text-[10px] cursor-pointer">Toggle</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}