import React, { useState } from 'react';
import { ClipboardList, Shield, Clock, Search, Filter } from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';

export default function ActivityLogsTab() {
  const { currentUser, auditLogs } = useEcoTour();
  const [searchQuery, setSearchQuery] = useState('');

  const userName = currentUser?.name || currentUser?.fullName || 'Client Account';
  const userEmail = currentUser?.email || 'client@ecotourvista.com';

  const defaultUserLogs = [
    { date: '2026-08-07 10:32 AM', user: userName, action: 'User Session Login', actionType: 'login', details: `Successfully authenticated into EcoTour Client Portal (${userEmail})`, ip: '192.168.1.45' },
    { date: '2026-08-07 10:30 AM', user: userName, action: 'Viewed Official Receipt', actionType: 'view', details: 'Opened receipt copy OR-20260807-882', ip: '192.168.1.45' },
    { date: '2026-08-07 10:25 AM', user: userName, action: 'Availed Walk-in Service', actionType: 'payment', details: 'Paid ₱1,100.00 for Open Cottage & Pool Swimming', ip: '192.168.1.45' },
    { date: '2026-08-07 10:20 AM', user: userName, action: 'Updated Contact Information', actionType: 'update', details: 'Updated phone number & security email settings', ip: '192.168.1.45' },
    { date: '2026-08-06 04:15 PM', user: userName, action: 'Created New Reservation', actionType: 'create', details: 'Submitted reservation booking for Standard Cottage on Aug 10', ip: '192.168.1.45' },
    { date: '2026-08-06 02:45 PM', user: userName, action: 'Downloaded Invoice PDF', actionType: 'download', details: 'Generated official invoice statement PDF', ip: '192.168.1.45' },
    { date: '2026-08-05 09:12 AM', user: userName, action: 'User Session Login', actionType: 'login', details: 'Client portal session initiated', ip: '192.168.1.45' },
  ];

  const logsList = auditLogs && auditLogs.length > 0
    ? auditLogs.filter(l => (l.user || '').toLowerCase() === userName.toLowerCase() || (l.email || '').toLowerCase() === userEmail.toLowerCase())
    : defaultUserLogs;

  const filteredLogs = logsList.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (l.action || '').toLowerCase().includes(q) || (l.details || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 text-white max-w-[1600px] mx-auto p-2 sm:p-4">
      {/* PAGE HEADER */}
      <div className="bg-[#0c1f16] p-6 rounded-3xl border border-emerald-500/20 shadow-2xl flex justify-between items-center">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-[3px] block">SECURITY AUDIT LOGS</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Personal Account Activity Logs
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly isolated activity log history for: <span className="text-emerald-300 font-bold">{userName}</span> ({userEmail})
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-emerald-950 px-4 py-2 rounded-2xl border border-emerald-800 text-xs font-mono font-bold text-emerald-300">
          <Shield className="w-4 h-4 text-emerald-400" /> Private Account Isolated
        </div>
      </div>

      {/* SEARCH INPUT */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter activity history by action or details..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0c1f16] border border-emerald-500/20 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400 shadow-md font-medium"
        />
      </div>

      {/* LOGS TABLE */}
      <div className="bg-[#0c1f16] border border-emerald-500/20 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-emerald-900/60 flex justify-between items-center">
          <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Account Action Trail</h4>
          <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
            {filteredLogs.length} Activities Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 border-b border-emerald-900/60 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Account User</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Activity Description</th>
                <th className="p-3.5 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/40 font-medium">
              {filteredLogs.map((log, i) => (
                <tr key={i} className="hover:bg-white/5 transition-all">
                  <td className="p-3.5 font-mono text-slate-400 text-[11px] whitespace-nowrap">{log.date}</td>
                  <td className="p-3.5 font-bold text-white">{log.user}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300 max-w-md">{log.details}</td>
                  <td className="p-3.5 text-right font-mono text-slate-400 text-[11px]">{log.ip || '192.168.1.45'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
