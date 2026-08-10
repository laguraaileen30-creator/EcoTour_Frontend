import React, { useState } from 'react';
import {
  BarChart3, Download, Users, Calendar, ShoppingCart, DollarSign, CreditCard,
  TrendingUp, TrendingDown, ChevronRight, CheckCircle, Calculator, Ticket, Home, Star, Eye
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';

export default function ReportsTab() {
  const { receipts, getDailyTallySummary } = useEcoTour();
  const [activeTab, setActiveTab] = useState('daily_ledger');
  const [selectedInspectDate, setSelectedInspectDate] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const allDates = Array.from(new Set([
    todayStr,
    '2026-08-06',
    '2026-08-05',
    ...(receipts || []).map(r => r.date).filter(Boolean)
  ])).sort((a, b) => new Date(b) - new Date(a));

  // Compute daily tallies for all dates to find peak day
  const dailyTallies = allDates.map(d => getDailyTallySummary(d));
  let topSalesDay = todayStr;
  let topRevenue = 0;
  dailyTallies.forEach(t => {
    if (t.totalCashRevenue > topRevenue) {
      topRevenue = t.totalCashRevenue;
      topSalesDay = t.date;
    }
  });

  const inspectedTally = selectedInspectDate ? getDailyTallySummary(selectedInspectDate) : null;

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-white">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Admin Reports & Historical Daily Sales Ledger
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Everyday sales computations, peak revenue tracing, entrance pax tallies, and cottage rental history.
            </p>
          </div>
        </div>

        <button className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 shadow-lg transition-all border border-emerald-400 uppercase tracking-wider self-start sm:self-auto">
          <Download className="w-4 h-4" /> Export All Reports
        </button>
      </div>

      {/* 5 TOP STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">TOTAL VISITORS</span>
            <p className="text-xl font-bold text-white mt-0.5">
              {dailyTallies.reduce((sum, t) => sum + t.totalVisitors, 0)} Pax
            </p>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5"><TrendingUp className="w-3 h-3" /> Historical Total</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">DATES RECORDED</span>
            <p className="text-xl font-bold text-white mt-0.5">{allDates.length} Days</p>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5"><TrendingUp className="w-3 h-3" /> Active Ledger</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">ENTRANCE TALLY</span>
            <p className="text-xl font-bold text-white mt-0.5">₱{dailyTallies.reduce((sum, t) => sum + t.entranceRevenue, 0).toLocaleString()}</p>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5"><TrendingUp className="w-3 h-3" /> All Entrance Fees</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">SERVICES TALLY</span>
            <p className="text-xl font-bold text-emerald-300 mt-0.5">₱{dailyTallies.reduce((sum, t) => sum + t.serviceRevenue, 0).toLocaleString()}</p>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5"><TrendingUp className="w-3 h-3" /> Cottages & Services</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/40 p-4 flex items-center gap-3 shadow-lg text-amber-300">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block">PEAK REVENUE DAY 🏆</span>
            <p className="text-sm font-extrabold text-amber-200 mt-0.5">{topSalesDay}</p>
            <span className="text-[10px] font-mono font-bold text-amber-400 block mt-0.5">₱{topRevenue.toLocaleString()} Revenue</span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'daily_ledger', label: '📅 Everyday Sales Ledger & Computations' },
          { id: 'visitors', label: 'Visitor Reports' },
          { id: 'reservations', label: 'Reservation Reports' },
          { id: 'sales', label: 'Sales Reports' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-slate-950 shadow-md border border-emerald-300'
                : 'bg-[#0c1f16] text-slate-300 hover:bg-emerald-900/30 border border-emerald-500/15'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION: EVERYDAY SALES LEDGER & COMPUTATIONS */}
      {activeTab === 'daily_ledger' && (
        <div className="space-y-6">
          <div className="bg-[#0c1f16] border border-emerald-500/20 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-emerald-900/60">
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-400" /> Everyday Cash Computations & History Log
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click on any date to inspect full entrance computations, itemized cottage rentals, and cashier tallies.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                {dailyTallies.length} Dates Recorded
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/40 border-b border-emerald-900/60 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-center">Total Visitors</th>
                    <th className="p-3 text-right">Entrance Cash (₱)</th>
                    <th className="p-3 text-right">Services & Cottages Cash (₱)</th>
                    <th className="p-3 text-right">Grand Total Cash (₱)</th>
                    <th className="p-3 text-center">Day Performance</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/40 font-medium">
                  {dailyTallies.map((t) => {
                    const isTopDay = t.date === topSalesDay && topRevenue > 0;
                    return (
                      <tr key={t.date} className="hover:bg-white/5 transition-all">
                        <td className="p-3 font-mono font-bold text-white flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-emerald-400" />
                          {t.date} {t.date === todayStr ? '(Today)' : ''}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-200">{t.totalVisitors} Pax</td>
                        <td className="p-3 text-right font-mono text-emerald-300 font-bold">₱{t.entranceRevenue.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono text-emerald-300 font-bold">₱{t.serviceRevenue.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-black text-emerald-400 text-sm">
                          ₱{t.totalCashRevenue.toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          {isTopDay ? (
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase inline-flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400" /> Peak Sales Day 🏆
                            </span>
                          ) : (
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                              Regular Day
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setSelectedInspectDate(selectedInspectDate === t.date ? null : t.date)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-[10px] rounded-lg cursor-pointer inline-flex items-center gap-1 border border-emerald-400/40"
                          >
                            <Eye className="w-3 h-3" /> Inspect Computation
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* INSPECTION MODAL / PANEL */}
          {inspectedTally && (
            <div className="bg-[#05180f] border-2 border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-300">
              <div className="flex justify-between items-center pb-3 border-b border-emerald-900/60">
                <div>
                  <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block">ADMIN COMPUTATION BREAKDOWN</span>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-emerald-400" /> Daily Tally Summary for {inspectedTally.date}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedInspectDate(null)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                {/* Entrance Computation */}
                <div className="bg-black/40 p-4 rounded-xl border border-emerald-900/60 space-y-2">
                  <h4 className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px]">🎟️ Entrance Fees & Pax Computation</h4>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Adult Entrance (₱100/head):</span>
                    <strong className="font-mono text-emerald-300">{inspectedTally.adultPax} pax = ₱{(inspectedTally.adultPax * 100).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Child Entrance (₱40/head):</span>
                    <strong className="font-mono text-emerald-300">{inspectedTally.childPax} pax = ₱{(inspectedTally.childPax * 40).toLocaleString()}</strong>
                  </div>
                  {inspectedTally.seniorPax > 0 && (
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span>Senior / PWD Entrance (₱80/head):</span>
                      <strong className="font-mono text-emerald-300">{inspectedTally.seniorPax} pax = ₱{(inspectedTally.seniorPax * 80).toLocaleString()}</strong>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Barangay Environmental Fee (₱30/head):</span>
                    <strong className="font-mono text-emerald-300">{inspectedTally.totalVisitors} pax = ₱{(inspectedTally.totalVisitors * 30).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between pt-2 text-sm font-extrabold text-white">
                    <span>Subtotal Entrance Cash:</span>
                    <span className="font-mono text-emerald-400">₱{inspectedTally.entranceRevenue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Services Computation */}
                <div className="bg-black/40 p-4 rounded-xl border border-emerald-900/60 space-y-2">
                  <h4 className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px]">🏡 Cottage & Services Itemized Tally</h4>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {Object.keys(inspectedTally.itemCounts).length > 0 ? (
                      Object.entries(inspectedTally.itemCounts).map(([name, count]) => (
                        <div key={name} className="flex justify-between py-1 border-b border-white/5">
                          <span>{name}</span>
                          <strong className="font-mono text-emerald-300">{count} units rented</strong>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 py-2">No add-on services rented on this date.</p>
                    )}
                  </div>
                  <div className="flex justify-between pt-2 text-sm font-extrabold text-white">
                    <span>Subtotal Services & Facilities Cash:</span>
                    <span className="font-mono text-emerald-400">₱{inspectedTally.serviceRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Formula & Grand Total */}
              <div className="bg-emerald-950 p-4 rounded-xl border border-emerald-500/40 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-300 font-bold uppercase block">GRAND TOTAL CASH CALCULATION FORMULA:</span>
                  <span className="text-sm font-extrabold text-white">
                    Entrance (₱{inspectedTally.entranceRevenue.toLocaleString()}) + Services (₱{inspectedTally.serviceRevenue.toLocaleString()})
                  </span>
                </div>
                <div className="text-right font-mono font-black text-xl text-emerald-400">
                  ₱{inspectedTally.totalCashRevenue.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 1: VISITOR REPORTS */}
      {activeTab === 'visitors' && (
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-6 space-y-5 shadow-xl">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" /> Visitor Reports
              </h3>
              <p className="text-xs text-slate-400">Overview of visitor statistics and trends</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
            <div className="bg-black/30 p-4 rounded-xl border border-emerald-900/40">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Historical Visitors</span>
              <strong className="text-xl text-white font-extrabold">{dailyTallies.reduce((sum, t) => sum + t.totalVisitors, 0)} Pax</strong>
            </div>
            <div className="bg-black/30 p-4 rounded-xl border border-emerald-900/40">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Peak Visitor Count Date</span>
              <strong className="text-xl text-emerald-400 font-extrabold">{topSalesDay}</strong>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: RESERVATION REPORTS */}
      <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-6 space-y-5 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" /> Reservation Reports
            </h3>
            <p className="text-xs text-slate-400">Reservation status and statistics</p>
          </div>
          <button className="text-xs text-slate-300 border border-white/10 rounded-lg px-3 py-1 hover:bg-white/5 cursor-pointer">This Month</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* RESERVATIONS BY STATUS */}
          <div className="p-4 rounded-xl bg-[#04150e] border border-emerald-900/30 space-y-3">
            <h4 className="text-xs font-bold text-slate-300">Reservations by Status</h4>
            <div className="space-y-1 text-xs pt-2">
              <div className="flex justify-between"><span className="text-emerald-400 font-bold">Approved</span><span>185 (54.1%)</span></div>
              <div className="flex justify-between"><span className="text-amber-400 font-bold">Pending</span><span>42 (12.3%)</span></div>
              <div className="flex justify-between"><span className="text-sky-400 font-bold">Completed</span><span>98 (28.7%)</span></div>
              <div className="flex justify-between"><span className="text-rose-400 font-bold">Cancelled</span><span>17 (5.0%)</span></div>
            </div>
          </div>

          {/* RESERVATIONS TREND BAR CHART */}
          <div className="p-4 rounded-xl bg-[#04150e] border border-emerald-900/30 space-y-3">
            <h4 className="text-xs font-bold text-slate-300">Reservations Trend</h4>
            <div className="h-36 flex items-end justify-between gap-2 pt-4 px-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-emerald-500 rounded-t-sm" style={{ height: `${(i + 3) * 12}px` }} />
                  <span className="text-[9px] text-slate-400">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TOP RESERVED SERVICES */}
          <div className="p-4 rounded-xl bg-[#04150e] border border-emerald-900/30 space-y-2 text-xs">
            <h4 className="text-xs font-bold text-slate-300 mb-2">Top Reserved Services</h4>
            <div className="flex justify-between py-1 border-b border-white/5"><span>Cottage (Small)</span><strong className="text-white">72</strong></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span>Kubo (Large)</span><strong className="text-white">45</strong></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span>Table (6 Seater)</span><strong className="text-white">38</strong></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span>Life Vest Rental</span><strong className="text-white">36</strong></div>
          </div>
        </div>
      </div>

    </div>
  );
}