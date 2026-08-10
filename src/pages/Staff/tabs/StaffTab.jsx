import React, { useState } from 'react';
import {
  Users, UserCheck, Clock, Calendar, Search, Filter, Eye, Printer,
  UserPlus, CalendarCheck, CreditCard, ClipboardList, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, ChevronRight as ArrowRight
} from 'lucide-react';

const VISITORS_DATA = [
  { id: 1, name: 'Maria Santos', phone: '0917 123 4567', type: 'Local', cat: 'Adult', pax: 4, services: ['Entrance', 'Cottage'], time: '08:15 AM', status: 'Checked-in', img: 1 },
  { id: 2, name: 'John Dela Cruz', phone: '0921 987 6543', type: 'Local', cat: 'Adult', pax: 2, services: ['Entrance', 'Life Vest'], time: '09:05 AM', status: 'Checked-in', img: 12 },
  { id: 3, name: 'Alex Reyes', phone: '0933 456 7890', type: 'Local', cat: 'Child', pax: 3, services: ['Entrance'], time: '09:45 AM', status: 'Checked-in', img: 15 },
  { id: 4, name: 'Karen Lopez', phone: '0917 654 3210', type: 'Local', cat: 'Adult', pax: 5, services: ['Entrance', 'Cottage'], time: '10:20 AM', status: 'Checked-in', img: 45 },
  { id: 5, name: 'Mark Villanueva', phone: '0908 765 4321', type: 'Local', cat: 'Adult', pax: 2, services: ['Entrance', 'Table'], time: '11:00 AM', status: 'Checked-in', img: 53 },
  { id: 6, name: 'Ana Reyes', phone: '0912 345 6789', type: 'Foreign', cat: 'Adult', pax: 2, services: ['Entrance', 'Life Vest'], time: '11:30 AM', status: 'Checked-in', img: 32 },
  { id: 7, name: 'Pedro Cruz', phone: '0920 111 2222', type: 'Local', cat: 'Adult', pax: 6, services: ['Entrance', 'Cottage', 'Videoke'], time: '12:10 PM', status: 'Checked-in', img: 67 },
  { id: 8, name: 'Erika Mae Lopez', phone: '0916 234 5678', type: 'Local', cat: 'Adult', pax: 4, services: ['Entrance', 'Room / Kubo'], time: '01:00 PM', status: 'Checked-in', img: 41 },
];

export default function VisitorManagementTab() {
  const [activeTab, setActiveTab] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-white">
      
      {/* PAGE HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Visitor Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Monitor and manage all visitors in the resort.
          </p>
          <p className="text-[11px] text-emerald-400/80 font-medium mt-1">
            Home &gt; Visitor Management &gt; Today's Visitors
          </p>
        </div>
      </div>

      {/* 4 TOP STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-11 h-11 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">TODAY'S VISITORS</span>
            <div className="text-2xl font-extrabold text-white mt-0.5">128</div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5"><TrendingUp className="w-3 h-3" /> 12.5% vs yesterday</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-11 h-11 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">CHECKED-IN VISITORS</span>
            <div className="text-2xl font-extrabold text-white mt-0.5">96</div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5"><TrendingUp className="w-3 h-3" /> 9.3% vs yesterday</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-11 h-11 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">CURRENT VISITORS</span>
            <div className="text-2xl font-extrabold text-white mt-0.5">184</div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5"><TrendingUp className="w-3 h-3" /> 15.7% vs yesterday</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-11 h-11 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">TOTAL THIS MONTH</span>
            <div className="text-2xl font-extrabold text-white mt-0.5">2,856</div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5"><TrendingUp className="w-3 h-3" /> 18.4% vs last month</span>
          </div>
        </div>
      </div>

      {/* MAIN DATA TABLE CARD */}
      <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 sm:p-6 space-y-5 shadow-xl">
        
        {/* TABS */}
        <div className="flex flex-wrap gap-2.5 border-b border-white/5 pb-3">
          {[
            { id: 'today', label: "Today's Visitors" },
            { id: 'checkedin', label: 'Checked-in Visitors' },
            { id: 'current', label: 'Current Visitors' },
            { id: 'history', label: 'Visitor History' },
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
        <div className="flex flex-col lg:flex-row justify-between items-center gap-3 pt-1">
          <div className="relative flex-1 w-full lg:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search visitor name, contact no., or transaction ID..."
              className="w-full bg-[#092217] border border-emerald-800/60 pl-4 pr-9 py-2 rounded-full text-xs text-emerald-100 placeholder:text-emerald-500/50 outline-none focus:border-emerald-400"
            />
            <Search className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400/70 pointer-events-none" />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <select className="bg-[#092217] border border-emerald-800/60 text-emerald-100 text-xs rounded-lg px-3 py-2 outline-none cursor-pointer">
              <option>May 27, 2025</option>
            </select>
            <select className="bg-[#092217] border border-emerald-800/60 text-emerald-100 text-xs rounded-lg px-3 py-2 outline-none cursor-pointer">
              <option>All Visitor Types</option>
            </select>
            <select className="bg-[#092217] border border-emerald-800/60 text-emerald-100 text-xs rounded-lg px-3 py-2 outline-none cursor-pointer">
              <option>All Services</option>
            </select>
            <button className="p-2 bg-[#092217] border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40 rounded-lg cursor-pointer flex items-center gap-1.5 text-xs font-semibold">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-xl border border-emerald-900/40 bg-[#04150e]/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#061d13] text-emerald-400 border-b border-emerald-900/40 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">#</th>
                <th className="p-3.5">Visitor Details</th>
                <th className="p-3.5">Type / Category</th>
                <th className="p-3.5">No. of Pax</th>
                <th className="p-3.5">Services</th>
                <th className="p-3.5">Check-in Time</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/30 text-slate-200 font-medium">
              {VISITORS_DATA.map((v) => (
                <tr key={v.id} className="hover:bg-emerald-950/40 transition-colors">
                  <td className="p-3.5 text-slate-400 font-bold">{v.id}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img src={`https://i.pravatar.cc/80?img=${v.img}`} alt="" className="w-8 h-8 rounded-full object-cover border border-emerald-500/30 shrink-0" />
                      <div>
                        <h5 className="font-bold text-white text-xs">{v.name}</h5>
                        <p className="text-[11px] text-slate-400 font-mono">{v.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-300">{v.type} <span className="block text-[10px] text-slate-400">{v.cat}</span></td>
                  <td className="p-3.5 font-bold text-white">{v.pax}</td>
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1">
                      {v.services.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 rounded text-[10px] font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-300 font-mono">{v.time}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-[10px] font-bold">
                      {v.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="w-8 h-8 rounded-full border border-emerald-800/50 bg-[#092217] text-emerald-300 hover:border-emerald-400 flex items-center justify-center cursor-pointer transition-all">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-8 h-8 rounded-full border border-emerald-800/50 bg-[#092217] text-emerald-300 hover:border-emerald-400 flex items-center justify-center cursor-pointer transition-all">
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-xs text-slate-400">
          <div>Showing 1 to 8 of 128 visitors</div>
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 rounded-lg bg-[#092217] border border-emerald-800/50 text-emerald-300"><ChevronLeft className="w-4 h-4" /></button>
            <button className="px-3 py-1 rounded-md font-bold bg-[#22c55e] text-white">1</button>
            <button className="px-3 py-1 rounded-md font-bold bg-[#092217] text-emerald-300">2</button>
            <button className="px-3 py-1 rounded-md font-bold bg-[#092217] text-emerald-300">3</button>
            <span className="px-1 text-slate-500">...</span>
            <button className="px-3 py-1 rounded-md font-bold bg-[#092217] text-emerald-300">16</button>
            <button className="p-1.5 rounded-lg bg-[#092217] border border-emerald-800/50 text-emerald-300"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* BOTTOM 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* VISITOR TYPE BREAKDOWN (TODAY) */}
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <h4 className="font-bold text-white text-base border-b border-white/5 pb-3">VISITOR TYPE BREAKDOWN (TODAY)</h4>
          <div className="flex flex-col sm:flex-row items-center gap-6 my-auto">
            <div className="relative w-44 h-44 shrink-0">
              <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="#4ade80" strokeWidth="8" strokeDasharray="60.9 39.1" strokeDashoffset="0" />
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="#38bdf8" strokeWidth="8" strokeDasharray="28.1 71.9" strokeDashoffset="-60.9" />
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="#fbbf24" strokeWidth="8" strokeDasharray="9.4 90.6" strokeDashoffset="-89" />
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="#c084fc" strokeWidth="8" strokeDasharray="1.6 98.4" strokeDashoffset="-98.4" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-white">128</span>
                <span className="text-[10px] text-slate-400 font-semibold">Total Visitors</span>
              </div>
            </div>
            <div className="space-y-2 text-xs flex-1">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" /><span className="text-slate-300">Local Adults</span></div><span className="font-bold text-white">78 (60.9%)</span></div>
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" /><span className="text-slate-300">Local Children</span></div><span className="font-bold text-white">36 (28.1%)</span></div>
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" /><span className="text-slate-300">Foreign Adults</span></div><span className="font-bold text-white">12 (9.4%)</span></div>
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#c084fc]" /><span className="text-slate-300">Foreign Children</span></div><span className="font-bold text-white">2 (1.6%)</span></div>
            </div>
          </div>
        </div>

        {/* TOP SERVICES (TODAY) */}
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <h4 className="font-bold text-white text-base border-b border-white/5 pb-3">TOP SERVICES (TODAY)</h4>
          <div className="space-y-3">
            {[
              { name: 'Entrance Fee', count: '128 visitors', pct: '100%' },
              { name: 'Cottage Rental', count: '48 visitors', pct: '37.5%' },
              { name: 'Life Vest Rental', count: '40 visitors', pct: '31.2%' },
              { name: 'Table Rental', count: '22 visitors', pct: '17.1%' },
              { name: 'Room / Kubo', count: '16 visitors', pct: '12.5%' },
            ].map((serv, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>{serv.name}</span>
                  <span className="text-emerald-400">{serv.count}</span>
                </div>
                <div className="w-full bg-[#04150e] h-2 rounded-full overflow-hidden border border-emerald-900/40">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: serv.pct }} />
                </div>
              </div>
            ))}
          </div>
          <button className="text-emerald-400 text-xs font-bold flex items-center justify-end gap-1 hover:underline cursor-pointer pt-2">
            View all services report <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* QUICK ACTIONS FOOTER BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#04150e] border border-emerald-900/30 flex items-center gap-3 hover:border-emerald-500/40 cursor-pointer transition-all">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-white">Add Walk-in Visitor</h5>
            <p className="text-[10px] text-slate-400">Register a new walk-in visitor</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#04150e] border border-emerald-900/30 flex items-center gap-3 hover:border-emerald-500/40 cursor-pointer transition-all">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-white">Check-in Reservation</h5>
            <p className="text-[10px] text-slate-400">Check-in reserved visitor</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#04150e] border border-emerald-900/30 flex items-center gap-3 hover:border-emerald-500/40 cursor-pointer transition-all">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-white">Print Receipt</h5>
            <p className="text-[10px] text-slate-400">Generate visitor receipt</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#04150e] border border-emerald-900/30 flex items-center gap-3 hover:border-emerald-500/40 cursor-pointer transition-all">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-white">Daily Report</h5>
            <p className="text-[10px] text-slate-400">View today's visitor report</p>
          </div>
        </div>
      </div>

    </div>
  );
}