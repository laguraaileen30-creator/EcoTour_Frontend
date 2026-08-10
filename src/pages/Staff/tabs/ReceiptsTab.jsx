import React, { useState } from 'react';
import {
  Receipt, Plus, TrendingUp, TrendingDown, Coins, Wallet, FileText,
  Search, Filter, ChevronLeft, ChevronRight, User, HelpCircle, BookOpen, Printer
} from 'lucide-react';

const RECEIPTS_LIST = [
  { id: 1, rcpt: 'RCPT-0001', name: 'Maria Santos', pax: '4 Adults', desc: 'Entrance & Swimming', amount: '₱320.00', method: 'Cash', status: 'Paid', time: '08:45 AM', img: 1 },
  { id: 2, rcpt: 'RCPT-0002', name: 'John Dela Cruz', pax: '2 Adults, 1 Child', desc: 'Cottage Rental', amount: '₱500.00', method: 'GCash', status: 'Paid', time: '08:45 AM', img: 12 },
  { id: 3, rcpt: 'RCPT-0003', name: 'Alex Reyes', pax: '5 Adults', desc: 'Table Rental', amount: '₱100.00', method: 'Cash', status: 'Paid', time: '09:45 AM', img: 15 },
  { id: 4, rcpt: 'RCPT-0004', name: 'Karen Lopez', pax: '2 Adults, 2 Children', desc: 'Life Vests (4)', amount: '₱200.00', method: 'Card', status: 'Paid', time: '10:20 AM', img: 45 },
  { id: 5, rcpt: 'RCPT-0005', name: 'Mark Villanueva', pax: '3 Adults', desc: 'Videoke Rental', amount: '₱300.00', method: 'Cash', status: 'Paid', time: '11:05 AM', img: 53 },
  { id: 6, rcpt: 'RCPT-0006', name: 'Paolo Mendoza', pax: '2 Adults, 1 Child', desc: 'Entrance & Swimming', amount: '₱230.00', method: 'GCash', status: 'Paid', time: '11:30 AM', img: 24 },
  { id: 7, rcpt: 'RCPT-0007', name: 'Elizabeth Tan', pax: '5 Adults', desc: 'Rooms / Kubo', amount: '₱1,000.00', method: 'Card', status: 'Paid', time: '01:15 PM', img: 32 },
  { id: 8, rcpt: 'RCPT-0008', name: 'Michael Lim', pax: '4 Adults', desc: 'Parking (Car)', amount: '₱50.00', method: 'Cash', status: 'Paid', time: '01:40 PM', img: 41 },
];

export default function ReceiptsTab() {
  const [activeTab, setActiveTab] = useState('today');

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-white">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Receipts
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              View, search, and manage printed receipts.
            </p>
          </div>
        </div>

        <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all border border-emerald-400/40 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> New Receipt
        </button>
      </div>

      {/* FILTER PILLS NAVBAR */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'today', label: "Today's Receipts" },
          { id: 'search', label: 'Search Receipt' },
          { id: 'history', label: 'Receipt History' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
              activeTab === tab.id
                ? 'bg-[#22c55e] text-white shadow-md shadow-emerald-950/60'
                : 'bg-[#0c1f16] text-slate-300 hover:bg-emerald-900/30 border border-emerald-500/15'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4 TOP STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">TODAY'S RECEIPTS</span>
            <div className="text-2xl font-extrabold text-white mt-0.5">96</div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5"><TrendingUp className="w-3 h-3" /> 18.6% vs yesterday</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">TOTAL SALES (TODAY)</span>
            <div className="text-xl font-extrabold text-white mt-0.5">₱45,680.00</div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5"><TrendingUp className="w-3 h-3" /> 21.4% vs yesterday</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">AVERAGE RECEIPT</span>
            <div className="text-xl font-extrabold text-white mt-0.5">₱476.67</div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5"><TrendingUp className="w-3 h-3" /> 5.7% vs yesterday</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">CANCELLED RECEIPTS</span>
            <div className="text-2xl font-extrabold text-white mt-0.5">2</div>
            <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-1 mt-0.5"><TrendingDown className="w-3 h-3" /> 33.3% vs yesterday</span>
          </div>
        </div>
      </div>

      {/* TOP GRID: RECEIPTS OVERVIEW & PAYMENT METHODS SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RECEIPTS OVERVIEW (2 SPANS) */}
        <div className="lg:col-span-2 rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">RECEIPTS OVERVIEW</h4>
            <select className="bg-[#092217] border border-emerald-800/60 text-emerald-100 text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer">
              <option>Today</option>
            </select>
          </div>

          <div className="h-44 w-full relative pt-4">
            <svg viewBox="0 0 400 120" className="w-full h-full">
              <path d="M10 100 L50 85 L100 60 L150 75 L200 30 L250 55 L300 40 L350 65 L390 45" fill="none" stroke="#4ade80" strokeWidth="3" />
              <circle cx="200" cy="30" r="4" fill="#4ade80" />
            </svg>
            <div className="absolute top-4 left-[48%] p-1.5 bg-emerald-950 border border-emerald-500/40 rounded text-center text-[10px] font-bold text-white">
              24 Receipts
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 pt-2 border-t border-white/5 font-mono">
              <span>6 AM</span><span>9 AM</span><span>12 PM</span><span>3 PM</span><span>6 PM</span><span>9 PM</span>
            </div>
          </div>
        </div>

        {/* PAYMENT METHODS & SUMMARY */}
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <h4 className="font-bold text-white text-sm uppercase tracking-wider border-b border-white/5 pb-3">PAYMENT METHODS</h4>
          <div className="flex flex-col items-center justify-center my-auto">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="#4ade80" strokeWidth="8" strokeDasharray="49.6 50.4" strokeDashoffset="0" />
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="#38bdf8" strokeWidth="8" strokeDasharray="33.9 66.1" strokeDashoffset="-49.6" />
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="#c084fc" strokeWidth="8" strokeDasharray="10.9 89.1" strokeDashoffset="-83.5" />
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="#fbbf24" strokeWidth="8" strokeDasharray="5.6 94.4" strokeDashoffset="-94.4" />
              </svg>
            </div>
            <div className="space-y-1 text-xs w-full mt-3">
              <div className="flex items-center justify-between"><span className="text-slate-300">Total Receipts</span><strong className="text-white font-mono">96</strong></div>
              <div className="flex items-center justify-between"><span className="text-slate-300">Total Sales</span><strong className="text-white font-mono">₱45,680.00</strong></div>
              <div className="flex items-center justify-between"><span className="text-slate-300">Cancelled Receipts</span><strong className="text-rose-400 font-mono">2</strong></div>
              <div className="flex items-center justify-between pt-1 border-t border-white/5"><span className="text-emerald-400 font-bold">Net Sales</span><strong className="text-emerald-400 font-mono font-bold">₱45,680.00</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE GRID: TODAY'S RECEIPTS TABLE & TOP SERVICES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TODAY'S RECEIPTS TABLE (2 SPANS) */}
        <div className="lg:col-span-2 rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">TODAY'S RECEIPTS</h4>
            <button className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer">View All</button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-emerald-900/40 bg-[#04150e]/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#061d13] text-emerald-400 border-b border-emerald-900/40 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">RECEIPT NO.</th>
                  <th className="p-3">VISITOR / CUSTOMER</th>
                  <th className="p-3">DESCRIPTION</th>
                  <th className="p-3">AMOUNT</th>
                  <th className="p-3">METHOD</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3">TIME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/30 text-slate-200 font-medium">
                {RECEIPTS_LIST.map((r) => (
                  <tr key={r.id} className="hover:bg-emerald-950/40">
                    <td className="p-3 font-mono text-emerald-400 font-bold">{r.rcpt}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img src={`https://i.pravatar.cc/80?img=${r.img}`} alt="" className="w-7 h-7 rounded-full object-cover border border-emerald-500/30" />
                        <div>
                          <strong className="text-white text-xs block">{r.name}</strong>
                          <span className="text-[10px] text-slate-400">{r.pax}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-300">{r.desc}</td>
                    <td className="p-3 font-mono font-bold text-white">{r.amount}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold rounded-full">
                        {r.method}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold rounded-full">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-400 text-[11px]">{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TOP SERVICES BY SALES & RECENTLY CANCELLED */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-3 shadow-xl text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider border-b border-white/5 pb-3">TOP SERVICES (BY SALES)</h4>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-white/5"><span>Entrance & Swimming</span><strong className="text-white font-mono">₱18,230.00</strong></div>
              <div className="flex justify-between py-1 border-b border-white/5"><span>Cottage Rental</span><strong className="text-white font-mono">₱12,500.00</strong></div>
              <div className="flex justify-between py-1 border-b border-white/5"><span>Rooms / Kubo</span><strong className="text-white font-mono">₱6,000.00</strong></div>
              <div className="flex justify-between py-1 border-b border-white/5"><span>Life Vests</span><strong className="text-white font-mono">₱4,000.00</strong></div>
              <div className="flex justify-between py-1 border-b border-white/5"><span>Table Rental</span><strong className="text-white font-mono">₱2,950.00</strong></div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-3 shadow-xl text-xs">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">RECENTLY CANCELLED</h4>
              <button className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer">View All</button>
            </div>
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-[#04150e] border border-emerald-900/30 flex justify-between items-center">
                <div>
                  <h5 className="font-mono text-emerald-400 font-bold">RCPT-0091</h5>
                  <p className="text-[10px] text-slate-400">Maria Santos • Entrance Fee</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-rose-400 font-bold block">₱100.00</span>
                  <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 text-[9px] font-bold rounded-full">Cancelled</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#04150e] border border-emerald-900/30 flex justify-between items-center">
                <div>
                  <h5 className="font-mono text-emerald-400 font-bold">RCPT-0090</h5>
                  <p className="text-[10px] text-slate-400">John Dela Cruz • Table Rental</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-rose-400 font-bold block">₱200.00</span>
                  <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 text-[9px] font-bold rounded-full">Cancelled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: RECENT RECEIPTS PREVIEW CARDS */}
      <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h4 className="font-bold text-white text-base">RECENT RECEIPTS PREVIEW</h4>
          <button className="text-xs text-slate-300 border border-white/10 rounded-lg px-3 py-1 hover:bg-white/5 cursor-pointer">View All</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { rcpt: 'RCPT-0001', amt: '₱320.00' },
            { rcpt: 'RCPT-0002', amt: '₱500.00' },
            { rcpt: 'RCPT-0003', amt: '₱100.00' },
            { rcpt: 'RCPT-0004', amt: '₱200.00' },
            { rcpt: 'RCPT-0005', amt: '₱300.00' },
          ].map((card, i) => (
            <div key={i} className="rounded-xl border border-emerald-800/40 bg-[#04150e] p-3 text-center space-y-2">
              <div className="border border-dashed border-emerald-700/50 bg-white text-slate-900 rounded p-3 text-[9px] font-mono text-left leading-tight space-y-1 shadow-sm">
                <div className="text-center font-bold border-b border-slate-300 pb-1">EcoTourVista</div>
                <div>Receipt: {card.rcpt}</div>
                <div>Date: May 25, 2024</div>
                <div className="border-t border-slate-300 pt-1 font-bold">TOTAL: {card.amt}</div>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-emerald-400">{card.rcpt}</span>
                <span className="text-white font-bold">{card.amt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEED ASSISTANCE FOOTER BAR */}
      <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
        <div>
          <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">NEED ASSISTANCE?</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            We're here to help you with receipt inquiries and printing issues.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-[#04150e] border border-emerald-900/30 flex items-center gap-3 hover:border-emerald-500/40 cursor-pointer transition-all">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">Contact Admin</h5>
              <p className="text-[10px] text-slate-400">Get quick support</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#04150e] border border-emerald-900/30 flex items-center gap-3 hover:border-emerald-500/40 cursor-pointer transition-all">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">Report Issue</h5>
              <p className="text-[10px] text-slate-400">Report receipt problems</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#04150e] border border-emerald-900/30 flex items-center gap-3 hover:border-emerald-500/40 cursor-pointer transition-all">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">User Guide</h5>
              <p className="text-[10px] text-slate-400">Learn how it works</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}