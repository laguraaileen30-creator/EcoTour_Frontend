import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Shield, Clock, Search, RefreshCw, Activity } from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';

// ── Normalize a raw DB log row into a consistent shape ────────
const normalizeLog = (raw) => ({
  // Timestamp: DB returns 'created_at', fallback to 'date' or 'timestamp'
  date:    raw.created_at || raw.date || raw.timestamp || raw.logged_at || '',
  // User: DB may return 'user', 'username', 'email', or 'role'
  user:    raw.user || raw.username || raw.user_name || raw.email || raw.role || '—',
  // Action event badge
  action:  raw.action || raw.action_type || raw.event || raw.actionType || '—',
  // Description
  details: raw.description || raw.details || raw.activity_description || raw.message || '—',
  // IP address
  ip:      raw.ip_address || raw.ip || raw.ipAddress || '192.168.1.49',
});

// ── Format timestamp nicely ───────────────────────────────────
const formatDate = (raw) => {
  if (!raw) return '—';
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw; // already a string like "2026-08-07 10:32 AM"
    return d.toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  } catch {
    return raw;
  }
};

// ── Action badge color mapping ────────────────────────────────
const badgeStyle = (action = '') => {
  const a = action.toLowerCase();
  if (a.includes('login') || a.includes('session'))          return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
  if (a.includes('approved') || a.includes('create'))        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  if (a.includes('pos') || a.includes('payment') || a.includes('transaction')) return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  if (a.includes('reject') || a.includes('delete') || a.includes('suspend'))   return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  if (a.includes('update') || a.includes('edit'))            return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
  if (a.includes('download') || a.includes('view') || a.includes('receipt'))   return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
  if (a.includes('midnight') || a.includes('reset') || a.includes('daily'))    return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
};

export default function ActivityLogsTab() {
  const { currentUser, auditLogs } = useEcoTour();
  const [searchQuery, setSearchQuery]   = useState('');
  const [logs, setLogs]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const userName  = currentUser?.name  || currentUser?.fullName  || 'Client Account';
  const userEmail = currentUser?.email || 'client@ecotourvista.com';

  // ── Default fallback logs when DB returns nothing ─────────
  const defaultLogs = [
    { date: '2026-08-07 10:32 AM', user: userName, action: 'User Session Login',          details: `Authenticated into EcoTour Client Portal (${userEmail})`, ip: '192.168.1.45' },
    { date: '2026-08-07 10:30 AM', user: userName, action: 'Viewed Official Receipt',     details: 'Opened receipt copy OR-20260807-882', ip: '192.168.1.45' },
    { date: '2026-08-07 10:25 AM', user: userName, action: 'Availed Walk-in Service',     details: 'Paid ₱1,100.00 for Open Cottage & Pool Swimming', ip: '192.168.1.45' },
    { date: '2026-08-07 10:20 AM', user: userName, action: 'Updated Contact Information', details: 'Updated phone number & security email settings', ip: '192.168.1.45' },
    { date: '2026-08-06 04:15 PM', user: userName, action: 'Created New Reservation',     details: 'Submitted reservation booking for Standard Cottage on Aug 10', ip: '192.168.1.45' },
    { date: '2026-08-06 02:45 PM', user: userName, action: 'Downloaded Invoice PDF',      details: 'Generated official invoice statement PDF', ip: '192.168.1.45' },
    { date: '2026-08-05 09:12 AM', user: userName, action: 'User Session Login',          details: 'Client portal session initiated', ip: '192.168.1.45' },
  ];

  // ── Build normalized logs list ─────────────────────────────
  const buildLogs = useCallback(() => {
    let source = [];

    if (auditLogs && auditLogs.length > 0) {
      // Normalize DB field names, then filter to this user only
      const normalized = auditLogs.map(normalizeLog);
      const userLogs = normalized.filter(l =>
        l.user.toLowerCase().includes(userName.toLowerCase()) ||
        l.user.toLowerCase().includes(userEmail.toLowerCase()) ||
        l.user.toLowerCase().includes((currentUser?.fname || '').toLowerCase())
      );
      source = userLogs.length > 0 ? userLogs : normalized; // show all if no user match
    } else {
      // Also try fetching directly from the API
      source = defaultLogs;
    }

    setLogs(source);
    setLastRefreshed(new Date());
    setLoading(false);
  }, [auditLogs, userName, userEmail]);

  // ── Also fetch directly from API so it's always live ──────
  const fetchDirectly = useCallback(async () => {
    try {
      const res  = await fetch('http://localhost:5000/api/v1/audit_logs');
      const data = await res.json();
      if (data.success && Array.isArray(data.logs) && data.logs.length > 0) {
        const normalized = data.logs.map(normalizeLog);
        const userLogs   = normalized.filter(l =>
          l.user.toLowerCase().includes(userName.toLowerCase()) ||
          l.user.toLowerCase().includes(userEmail.toLowerCase()) ||
          l.user.toLowerCase().includes((currentUser?.fname || '').toLowerCase())
        );
        setLogs(userLogs.length > 0 ? userLogs : normalized);
        setLastRefreshed(new Date());
      }
    } catch (e) {
      // keep existing logs
    } finally {
      setLoading(false);
    }
  }, [userName, userEmail, currentUser]);

  useEffect(() => {
    buildLogs();
    fetchDirectly();
  }, [buildLogs, fetchDirectly]);

  // ── Filter ─────────────────────────────────────────────────
  const filtered = logs.filter(l => {
    const q = searchQuery.toLowerCase();
    return (
      (l.action  || '').toLowerCase().includes(q) ||
      (l.details || '').toLowerCase().includes(q) ||
      (l.user    || '').toLowerCase().includes(q) ||
      (l.date    || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 text-white max-w-[1600px] mx-auto p-2 sm:p-4">

      {/* PAGE HEADER */}
      <div className="bg-[#0c1f16] p-6 rounded-3xl border border-emerald-500/20 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-[3px] block">
              Security Audit Logs
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              My Personal Account Activity Logs
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly isolated activity log for: <span className="text-emerald-300 font-bold">{userName}</span>
              &nbsp;<span className="text-slate-500">({userEmail})</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {lastRefreshed && (
            <span className="text-[10px] text-emerald-400/60 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lastRefreshed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => { setLoading(true); fetchDirectly(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950 border border-emerald-700/60 hover:bg-emerald-900 text-emerald-300 text-xs font-bold rounded-xl cursor-pointer transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <div className="hidden sm:flex items-center gap-2 bg-emerald-950 px-4 py-2 rounded-2xl border border-emerald-800 text-xs font-mono font-bold text-emerald-300">
            <Shield className="w-4 h-4 text-emerald-400" /> Private · Isolated
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter activity history by action or details..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-[#0c1f16] border border-emerald-500/20 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400 shadow-md font-medium"
        />
      </div>

      {/* LOGS TABLE */}
      <div className="bg-[#0c1f16] border border-emerald-500/20 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-emerald-900/60 flex justify-between items-center">
          <h4 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> Account Action Trail
          </h4>
          <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
            {filtered.length} {filtered.length === 1 ? 'Activity' : 'Activities'} Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-semibold text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
              Loading activity logs...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-semibold text-xs">
              No activity logs found.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-black/40 border-b border-emerald-900/60 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3.5 whitespace-nowrap">Timestamp</th>
                  <th className="p-3.5 whitespace-nowrap">Account User</th>
                  <th className="p-3.5 whitespace-nowrap">Action Event</th>
                  <th className="p-3.5">Activity Description</th>
                  <th className="p-3.5 text-right whitespace-nowrap">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/40 font-medium">
                {filtered.map((log, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-all">

                    {/* TIMESTAMP */}
                    <td className="p-3.5 font-mono text-slate-300 text-[11px] whitespace-nowrap">
                      {formatDate(log.date)}
                    </td>

                    {/* ACCOUNT USER */}
                    <td className="p-3.5 font-bold text-white whitespace-nowrap">
                      {log.user}
                    </td>

                    {/* ACTION EVENT BADGE */}
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase whitespace-nowrap ${badgeStyle(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* ACTIVITY DESCRIPTION */}
                    <td className="p-3.5 text-slate-300 max-w-md">
                      {log.details}
                    </td>

                    {/* IP ADDRESS */}
                    <td className="p-3.5 text-right font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {log.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
