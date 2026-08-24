import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList, Download, Activity, User, Edit3, Trash2, ShieldAlert,
  Search, Filter, ChevronLeft, ChevronRight, TrendingUp, RefreshCw,
  Eye, CheckCircle2, AlertTriangle, Key, Calendar, ShieldCheck, Clock,
  ArrowUpRight, FileText, Info, X
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';

export default function ActivityLogsTab() {
  const { auditLogs: contextLogs, currentUser, theme } = useEcoTour();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [lastSyncedTime, setLastSyncedTime] = useState(new Date());

  const fetchAuditLogs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/audit_logs');
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        const formatted = data.logs.map((l, index) => {
          const actLower = (l.action || '').toLowerCase();
          const descLower = (l.description || '').toLowerCase();

          let actionType = 'update';
          if (actLower.includes('delete') || actLower.includes('remove') || descLower.includes('cancelled') || descLower.includes('rejected')) {
            actionType = 'delete';
          } else if (actLower.includes('login') || actLower.includes('auth') || actLower.includes('sign in')) {
            actionType = 'login';
          } else if (actLower.includes('create') || actLower.includes('add') || actLower.includes('register') || descLower.includes('created') || descLower.includes('approved')) {
            actionType = 'create';
          } else if (actLower.includes('alert') || actLower.includes('security') || actLower.includes('reset') || actLower.includes('closure') || descLower.includes('auto')) {
            actionType = 'security';
          }

          let moduleName = 'System';
          if (descLower.includes('profile') || descLower.includes('password') || descLower.includes('user') || actLower.includes('user')) {
            moduleName = 'Profile & Users';
          } else if (descLower.includes('booking') || descLower.includes('reservation') || actLower.includes('booking')) {
            moduleName = 'Reservations';
          } else if (descLower.includes('walk-in') || descLower.includes('pos') || descLower.includes('payment') || descLower.includes('receipt')) {
            moduleName = 'Walk-In & POS';
          } else if (descLower.includes('service') || descLower.includes('cottage') || descLower.includes('facility')) {
            moduleName = 'Services & Resort';
          } else if (descLower.includes('announcement')) {
            moduleName = 'Announcements';
          }

          const userName = l.fname 
            ? `${l.fname} ${l.lname || ''}`.trim() 
            : (l.name || l.email || (l.user_id ? `User #${l.user_id}` : 'System Terminal'));

          const userRole = l.role 
            ? (l.role.charAt(0).toUpperCase() + l.role.slice(1)) 
            : (descLower.includes('admin') ? 'Admin' : (descLower.includes('staff') ? 'Staff' : (descLower.includes('client') ? 'Client' : 'System')));

          return {
            id: l.log_id || l.id || `LOG-${Date.now()}-${index}`,
            date: l.created_at ? new Date(l.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Just now',
            rawDate: l.created_at || new Date().toISOString(),
            name: userName,
            avatar: ((l.log_id || index + 1) % 70) + 1,
            role: userRole,
            action: l.action || 'ACTIVITY_EXECUTION',
            actionType,
            module: moduleName,
            desc: l.description || l.action || 'System action executed',
            ip: l.ip_address || '127.0.0.1 (Local Portal)'
          };
        });

        // Sort descending by rawDate/id
        formatted.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
        setLogs(formatted);
        setLastSyncedTime(new Date());
      } else if (contextLogs && contextLogs.length > 0) {
        setLogs(contextLogs);
      }
    } catch (err) {
      if (contextLogs && contextLogs.length > 0) {
        setLogs(contextLogs);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial Fetch & Real-Time Sync Interval
  useEffect(() => {
    fetchAuditLogs();

    // Auto poll every 6s for real-time history
    const interval = setInterval(() => {
      fetchAuditLogs(true);
    }, 6000);

    // Event listener for immediate sync across tabs/components
    const handleSync = () => fetchAuditLogs(true);
    window.addEventListener('ecotour:sync', handleSync);
    window.addEventListener('ecotour:daily-reset', handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener('ecotour:sync', handleSync);
      window.removeEventListener('ecotour:daily-reset', handleSync);
    };
  }, []);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return logs.filter((item) => {
      const matchesSearch = (
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.module.toLowerCase().includes(q) ||
        item.action.toLowerCase().includes(q)
      );

      let matchesTab = true;
      if (activeTab === 'logins') matchesTab = item.actionType === 'login';
      else if (activeTab === 'data') matchesTab = item.actionType === 'update' || item.actionType === 'create';
      else if (activeTab === 'deletions') matchesTab = item.actionType === 'delete';
      else if (activeTab === 'security') matchesTab = item.actionType === 'security';
      else if (activeTab === 'walkin') matchesTab = item.module === 'Walk-In & POS';

      let matchesRole = true;
      if (selectedRole !== 'all') {
        matchesRole = item.role.toLowerCase() === selectedRole.toLowerCase();
      }

      return matchesSearch && matchesTab && matchesRole;
    });
  }, [logs, searchQuery, activeTab, selectedRole]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedLogs = filteredLogs.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const loginCount = logs.filter(l => l.actionType === 'login').length;
  const updateCount = logs.filter(l => l.actionType === 'update' || l.actionType === 'create').length;
  const deleteCount = logs.filter(l => l.actionType === 'delete').length;
  const securityCount = logs.filter(l => l.actionType === 'security').length;

  const handleExportCSV = () => {
    const header = "Log ID,Date & Time,User Name,Role,Action Event,Module,Description,IP Address\n";
    const body = filteredLogs.map(l => 
      `"${l.id}","${l.date}","${l.name}","${l.role}","${l.action}","${l.module}","${l.desc.replace(/"/g, '""')}","${l.ip}"`
    ).join("\n");
    
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EcoTourVista_Activity_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* ── PAGE HEADER ── */}
      <div className="bg-white dark:bg-[#071911] p-5 rounded-2xl border border-slate-200 dark:border-emerald-500/20 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Real-Time Website Activity &amp; Audit Logs
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live Sync (6s)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Immutable audit history of visitor registrations, staff POS walk-in collections, profile changes, and admin actions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <button
            onClick={() => fetchAuditLogs(false)}
            title="Refresh logs from MySQL database"
            className="p-2.5 bg-slate-100 dark:bg-[#0c1f16] border border-slate-300 dark:border-emerald-800/60 text-slate-700 dark:text-emerald-300 hover:bg-slate-200 dark:hover:bg-emerald-900/40 rounded-xl cursor-pointer shadow transition-all flex items-center gap-1 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button 
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-950/20 transition-all border border-emerald-400"
          >
            <Download className="w-4 h-4" /> Export CSV Audit Logs
          </button>
        </div>
      </div>

      {/* ── 5 STAT CARDS (LIVE COMPUTED) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/15 bg-white dark:bg-[#0c1f16] p-4 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">TOTAL LOGS</span>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{logs.length}</p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Live DB Audit
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/15 bg-white dark:bg-[#0c1f16] p-4 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/15 border border-sky-300 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">USER LOGINS</span>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{loginCount}</p>
            <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">Authentication</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/15 bg-white dark:bg-[#0c1f16] p-4 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">DATA CHANGES</span>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{updateCount}</p>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">DB Modifications</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/15 bg-white dark:bg-[#0c1f16] p-4 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/15 border border-rose-300 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">DELETIONS / CANCEL</span>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{deleteCount}</p>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">Cancellations</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200 dark:border-emerald-500/15 bg-white dark:bg-[#0c1f16] p-4 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/15 border border-purple-300 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">SYSTEM SECURITY</span>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{securityCount}</p>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">Daily Closures</span>
          </div>
        </div>
      </div>

      {/* ── MAIN LOGS TABLE CARD ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/15 bg-white dark:bg-[#0c1f16] p-4 sm:p-6 space-y-5 shadow-xl">
        
        {/* CATEGORY TABS */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: `All Activities (${logs.length})` },
            { id: 'logins', label: `Logins & Auth (${loginCount})` },
            { id: 'data', label: `Modifications (${updateCount})` },
            { id: 'walkin', label: `Walk-In & POS Operations` },
            { id: 'security', label: `Security & Auto-Closure (${securityCount})` },
            { id: 'deletions', label: `Deletions (${deleteCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-[#092217]/80 text-slate-600 dark:text-emerald-200/80 hover:bg-slate-200 dark:hover:bg-emerald-900/40 border border-slate-300 dark:border-emerald-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SEARCH, ROLE FILTER & PAGE SIZE */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300 w-full sm:w-auto">
            <span>Show</span>
            <select 
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-slate-100 dark:bg-[#092217] border border-slate-300 dark:border-emerald-800/60 text-slate-800 dark:text-emerald-100 text-xs rounded-xl px-3 py-1.5 outline-none cursor-pointer font-bold"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>entries</span>

            <span className="mx-2 text-slate-400">|</span>

            <span>Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => { setSelectedRole(e.target.value); setCurrentPage(1); }}
              className="bg-slate-100 dark:bg-[#092217] border border-slate-300 dark:border-emerald-800/60 text-slate-800 dark:text-emerald-100 text-xs rounded-xl px-3 py-1.5 outline-none cursor-pointer font-bold"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="client">Client</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by user, action, module, or keyword…"
              className="w-full bg-slate-100 dark:bg-[#092217] border border-slate-300 dark:border-emerald-800/60 pl-9 pr-4 py-2 rounded-xl text-xs text-slate-900 dark:text-emerald-100 placeholder:text-slate-400 dark:placeholder:text-emerald-500/50 outline-none focus:border-emerald-500 font-medium"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/70 pointer-events-none" />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50/50 dark:bg-[#04150e]/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-[#061d13] text-slate-700 dark:text-emerald-400 border-b border-slate-200 dark:border-emerald-900/40 font-extrabold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">DATE &amp; TIME</th>
                <th className="p-3.5">USER / ACTOR</th>
                <th className="p-3.5 text-center">ROLE</th>
                <th className="p-3.5">ACTION</th>
                <th className="p-3.5">MODULE</th>
                <th className="p-3.5">DESCRIPTION &amp; DETAILS</th>
                <th className="p-3.5">IP ADDRESS</th>
                <th className="p-3.5 text-center">VIEW</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-emerald-900/30 text-slate-800 dark:text-slate-200 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 dark:text-slate-400 font-semibold">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" />
                    Fetching real-time activity audit logs from database…
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 dark:text-slate-400 font-semibold">
                    No activity logs found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-100/80 dark:hover:bg-emerald-950/40 transition-colors"
                  >
                    <td className="p-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap font-mono text-[11px]">
                      {item.date}
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={`https://i.pravatar.cc/80?img=${item.avatar}`} 
                          alt="" 
                          className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-emerald-500/30 shrink-0" 
                        />
                        <span className="font-bold text-slate-900 dark:text-white truncate max-w-[140px]">{item.name}</span>
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase inline-block ${
                        item.role === 'Admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800' :
                        item.role === 'Staff' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800' :
                        item.role === 'Client' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                        'bg-slate-200 text-slate-800 dark:bg-slate-900 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                      }`}>
                        {item.role}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block ${
                        item.actionType === 'login' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800' :
                        item.actionType === 'create' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                        item.actionType === 'update' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800' :
                        item.actionType === 'delete' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                      }`}>
                        {item.action}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-700 dark:text-slate-300 font-semibold">{item.module}</td>
                    
                    <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-sm">
                      <span className="line-clamp-2">{item.desc}</span>
                    </td>

                    <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                      {item.ip}
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => setSelectedLog(item)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-emerald-950 rounded-lg text-slate-600 dark:text-emerald-400 cursor-pointer transition-colors"
                        title="View Full Log Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing {filteredLogs.length > 0 ? (safeCurrentPage - 1) * pageSize + 1 : 0} to {Math.min(safeCurrentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} entries
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#092217] border border-slate-300 dark:border-emerald-800/50 text-slate-700 dark:text-emerald-300 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3.5 py-1.5 rounded-xl font-bold bg-emerald-600 text-white shadow">
              Page {safeCurrentPage} of {totalPages}
            </span>
            <button 
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#092217] border border-slate-300 dark:border-emerald-800/50 text-slate-700 dark:text-emerald-300 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* ── LOG DETAILS MODAL ── */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#0c1f16] border border-slate-200 dark:border-emerald-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-emerald-900/60 pb-3">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-500" />
                <h3 className="font-black text-base">Activity Log Details</h3>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Timestamp:</span>
                <span className="font-mono font-bold">{selectedLog.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Actor / User:</span>
                <span className="font-bold">{selectedLog.name} ({selectedLog.role})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Action Type:</span>
                <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Affected Module:</span>
                <span className="font-bold">{selectedLog.module}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">IP Address:</span>
                <span className="font-mono">{selectedLog.ip}</span>
              </div>
              <div className="py-2">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Full Description:</span>
                <div className="p-3 bg-slate-100 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-emerald-900/60 font-medium leading-relaxed">
                  {selectedLog.desc}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
