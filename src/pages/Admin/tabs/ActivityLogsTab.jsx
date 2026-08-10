import React, { useState } from 'react';
import {
  ClipboardList, Download, Activity, User, Edit3, Trash2, ShieldAlert,
  Search, Filter, ChevronLeft, ChevronRight, TrendingUp, TrendingDown
} from 'lucide-react';

const LOG_ITEMS = [
  { id: 1, date: 'May 25, 2024 10:30 AM', name: 'Maria Santos', avatar: 1, role: 'Admin', action: 'Login', actionType: 'login', module: 'Authentication', desc: 'User logged in to the system', ip: '192.168.1.101' },
  { id: 2, date: 'May 25, 2024 10:15 AM', name: 'John Dela Cruz', avatar: 12, role: 'Staff', action: 'Update', actionType: 'update', module: 'Reservations', desc: 'Updated reservation RES-2024-0342', ip: '192.168.1.102' },
  { id: 3, date: 'May 25, 2024 10:10 AM', name: 'Karen Lopez', avatar: 45, role: 'Staff', action: 'Create', actionType: 'create', module: 'Walk-in', desc: 'New walk-in transaction TRX-2024-0157', ip: '192.168.1.102' },
  { id: 4, date: 'May 25, 2024 09:58 AM', name: 'Mark Villanueva', avatar: 53, role: 'Admin', action: 'Update', actionType: 'update', module: 'Pricing', desc: 'Updated entrance fee (Local)', ip: '192.168.1.101' },
  { id: 5, date: 'May 25, 2024 09:45 AM', name: 'Anna Reyes', avatar: 32, role: 'Staff', action: 'Delete', actionType: 'delete', module: 'Services', desc: 'Deleted service Old Videoke Rental', ip: '192.168.1.105' },
  { id: 6, date: 'May 25, 2024 09:30 AM', name: 'Pedro Garcia', avatar: 15, role: 'Staff', action: 'Login', actionType: 'login', module: 'Authentication', desc: 'User logged in to the system', ip: '192.168.1.103' },
  { id: 7, date: 'May 25, 2024 09:20 AM', name: 'Sofia Martinez', avatar: 24, role: 'Staff', action: 'Update', actionType: 'update', module: 'User Management', desc: 'Updated user role (USR-0005)', ip: '192.168.1.103' },
  { id: 8, date: 'May 25, 2024 09:05 AM', name: 'Luis Cruz', avatar: 67, role: 'Admin', action: 'Update', actionType: 'update', module: 'Cottages', desc: 'Updated cottage availability', ip: '192.168.1.101' },
  { id: 9, date: 'May 25, 2024 08:50 AM', name: 'Emily Johnson', avatar: 41, role: 'Admin', action: 'Delete', actionType: 'delete', module: 'Walk-in', desc: 'Deleted walk-in TRX-2024-0155', ip: '192.168.1.101' },
  { id: 10, date: 'May 25, 2024 08:30 AM', name: 'System', avatar: 99, role: 'System', action: 'Alert', actionType: 'alert', module: 'Security', desc: 'Failed login attempt (3 times)', ip: '192.168.1.200' },
];

export default function ActivityLogsTab() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = LOG_ITEMS.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.module.toLowerCase().includes(q);
    if (activeTab === 'logins') return matchesSearch && item.actionType === 'login';
    if (activeTab === 'data') return matchesSearch && item.actionType === 'update';
    if (activeTab === 'deletions') return matchesSearch && item.actionType === 'delete';
    if (activeTab === 'security') return matchesSearch && item.actionType === 'alert';
    return matchesSearch;
  });

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-white">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Activity Logs
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Monitor all system activities and user actions
            </p>
          </div>
        </div>

        <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all border border-emerald-400/40 self-start sm:self-auto">
          <Download className="w-4 h-4" /> Export Logs
        </button>
      </div>

      {/* 5 TOP STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">TOTAL ACTIVITIES</span>
            <p className="text-xl font-bold text-white mt-0.5">1,245</p>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5"><TrendingUp className="w-3 h-3" /> 15.6% vs last week</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">USER LOGINS</span>
            <p className="text-xl font-bold text-white mt-0.5">256</p>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5"><TrendingUp className="w-3 h-3" /> 12.3% vs last week</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">DATA CHANGES</span>
            <p className="text-xl font-bold text-white mt-0.5">342</p>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5"><TrendingUp className="w-3 h-3" /> 18.7% vs last week</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">DELETIONS</span>
            <p className="text-xl font-bold text-white mt-0.5">45</p>
            <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-1 mt-0.5"><TrendingDown className="w-3 h-3" /> 10.2% vs last week</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">SECURITY EVENTS</span>
            <p className="text-xl font-bold text-white mt-0.5">12</p>
            <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-1 mt-0.5"><TrendingDown className="w-3 h-3" /> 7.7% vs last week</span>
          </div>
        </div>
      </div>

      {/* MAIN LOGS TABLE CARD */}
      <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 sm:p-6 space-y-5 shadow-xl">
        
        {/* TABS */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'logins', label: 'Logins' },
            { id: 'data', label: 'Data Changes' },
            { id: 'deletions', label: 'Deletions' },
            { id: 'security', label: 'Security' },
            { id: 'system', label: 'System' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                activeTab === tab.id
                  ? 'bg-[#22c55e] text-white shadow-md shadow-emerald-950/60'
                  : 'bg-[#092217]/80 text-emerald-200/80 hover:bg-emerald-900/40 border border-emerald-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>Show</span>
            <select className="bg-[#092217] border border-emerald-800/60 text-emerald-100 text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search activities..."
                className="w-full bg-[#092217] border border-emerald-800/60 pl-4 pr-9 py-1.5 rounded-full text-xs text-emerald-100 placeholder:text-emerald-500/50 outline-none focus:border-emerald-400 transition-all"
              />
              <Search className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400/70 pointer-events-none" />
            </div>

            <button className="p-2 bg-[#092217] border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40 rounded-full cursor-pointer transition-all shrink-0">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-xl border border-emerald-900/40 bg-[#04150e]/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#061d13] text-emerald-400 border-b border-emerald-900/40 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">DATE & TIME</th>
                <th className="p-3.5">USER</th>
                <th className="p-3.5">ROLE</th>
                <th className="p-3.5">ACTION</th>
                <th className="p-3.5">MODULE</th>
                <th className="p-3.5">DESCRIPTION</th>
                <th className="p-3.5">IP ADDRESS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/30 text-slate-200 font-medium">
              {filteredLogs.map((item) => (
                <tr key={item.id} className="hover:bg-emerald-950/40 transition-colors">
                  <td className="p-3.5 text-slate-300 whitespace-nowrap">{item.date}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      {item.role === 'System' ? (
                        <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">S</div>
                      ) : (
                        <img src={`https://i.pravatar.cc/80?img=${item.avatar}`} alt="" className="w-7 h-7 rounded-full object-cover border border-emerald-500/30" />
                      )}
                      <span className="font-bold text-white">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.role === 'Admin' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                      item.role === 'Staff' ? 'bg-sky-950 text-sky-400 border border-sky-800' :
                      'bg-slate-900 text-slate-400 border border-slate-700'
                    }`}>
                      {item.role}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.actionType === 'login' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      item.actionType === 'create' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      item.actionType === 'update' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      item.actionType === 'delete' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                      'bg-sky-950 text-sky-400 border border-sky-800'
                    }`}>
                      {item.action}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300">{item.module}</td>
                  <td className="p-3.5 text-slate-300 truncate max-w-xs">{item.desc}</td>
                  <td className="p-3.5 font-mono text-slate-400 text-[11px]">{item.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-xs text-slate-400">
          <div>Showing 1 to 10 of 1,245 entries</div>
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 rounded-lg bg-[#092217] border border-emerald-800/50 text-emerald-300"><ChevronLeft className="w-4 h-4" /></button>
            <button className="px-3 py-1 rounded-md font-bold bg-[#22c55e] text-white">1</button>
            <button className="px-3 py-1 rounded-md font-bold bg-[#092217] text-emerald-300">2</button>
            <button className="px-3 py-1 rounded-md font-bold bg-[#092217] text-emerald-300">3</button>
            <span className="px-1 text-slate-500">...</span>
            <button className="px-3 py-1 rounded-md font-bold bg-[#092217] text-emerald-300">125</button>
            <button className="p-1.5 rounded-lg bg-[#092217] border border-emerald-800/50 text-emerald-300"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

      </div>

      {/* BOTTOM 3-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ACTIVITY OVERVIEW DONUT CHART */}
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h4 className="font-bold text-white text-base">Activity Overview</h4>
            <button className="text-xs text-slate-300 border border-white/10 rounded-lg px-3 py-1 hover:bg-white/5 cursor-pointer">This Week</button>
          </div>

          <div className="flex flex-col items-center justify-center my-auto py-2">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#4ade80" strokeWidth="14" strokeDasharray="49 190" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#38bdf8" strokeWidth="14" strokeDasharray="65 174" strokeDashoffset="-49" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#a855f7" strokeWidth="14" strokeDasharray="57 182" strokeDashoffset="-114" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f87171" strokeWidth="14" strokeDasharray="9 230" strokeDashoffset="-171" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#fbbf24" strokeWidth="14" strokeDasharray="3 236" strokeDashoffset="-180" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-white">1,245</span>
                <span className="text-[10px] text-slate-400 font-semibold">Total Activities</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mt-4 w-full">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" /><span className="text-slate-300">Logins: 256 (20.6%)</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" /><span className="text-slate-300">Data: 342 (27.5%)</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" /><span className="text-slate-300">Creations: 298 (24%)</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#f87171]" /><span className="text-slate-300">Deletions: 45 (3.6%)</span></div>
            </div>
          </div>
        </div>

        {/* TOP ACTIVE USERS */}
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h4 className="font-bold text-white text-base">Top Active Users</h4>
            <button className="text-xs text-slate-300 border border-white/10 rounded-lg px-3 py-1 hover:bg-white/5 cursor-pointer">This Week</button>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Maria Santos', role: 'Admin', count: 128, img: 1 },
              { name: 'John Dela Cruz', role: 'Staff', count: 115, img: 12 },
              { name: 'Karen Lopez', role: 'Staff', count: 98, img: 45 },
              { name: 'Mark Villanueva', role: 'Admin', count: 85, img: 53 },
              { name: 'Anna Reyes', role: 'Staff', count: 76, img: 32 },
            ].map((u, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#04150e] border border-emerald-900/30">
                <div className="flex items-center gap-3">
                  <img src={`https://i.pravatar.cc/80?img=${u.img}`} alt="" className="w-8 h-8 rounded-full object-cover border border-emerald-500/30" />
                  <div>
                    <h5 className="text-xs font-bold text-white">{u.name}</h5>
                    <span className="text-[10px] text-emerald-400 font-semibold">{u.role}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-white block">{u.count}</span>
                  <span className="text-[9px] text-slate-400">activities</span>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full py-2 bg-[#092217] hover:bg-emerald-900/40 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-800/40 cursor-pointer">
            View All Users
          </button>
        </div>

        {/* RECENT SECURITY EVENTS */}
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h4 className="font-bold text-white text-base">Recent Security Events</h4>
            <button className="text-xs text-slate-300 border border-white/10 rounded-lg px-3 py-1 hover:bg-white/5 cursor-pointer">View All</button>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Failed login attempt', ip: '192.168.1.200', time: '10:20 AM', alert: true },
              { title: 'Unauthorized access attempt', ip: '192.168.1.201', time: '09:15 AM', alert: true },
              { title: 'Password change', ip: 'by Maria Santos', time: '08:45 AM', alert: false },
              { title: 'New admin login', ip: 'Maria Santos', time: '08:30 AM', alert: false },
              { title: 'Session timeout', ip: 'User: Pedro Garcia', time: '08:20 AM', alert: false },
            ].map((ev, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#04150e] border border-emerald-900/30">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${ev.alert ? 'bg-rose-500/20 text-rose-400 border border-rose-800' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-800'}`}>
                    {ev.alert ? '⚠️' : '✓'}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{ev.title}</h5>
                    <p className="text-[10px] text-slate-400">{ev.ip}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500">{ev.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
