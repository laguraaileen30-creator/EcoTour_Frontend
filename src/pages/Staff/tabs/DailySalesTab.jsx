import React, { useState } from 'react';
import {
  Coins, CreditCard, TrendingUp, Users, Calendar, Wallet, CheckCircle2,
  Ticket, Home, Utensils, Droplets, ShieldCheck, Calculator, Star, Sparkles
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';

export default function DailySalesTab() {
  const { receipts, getDailyTallySummary } = useEcoTour();
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Available unique dates from receipts
  const availableDates = Array.from(new Set([
    todayStr,
    '2026-08-06',
    '2026-08-05',
    ...(receipts || []).map(r => r.date).filter(Boolean)
  ])).sort((a, b) => new Date(b) - new Date(a));

  const tally = getDailyTallySummary ? getDailyTallySummary(selectedDate) : {
    totalCashRevenue: 0,
    totalTransactions: 0,
    totalVisitors: 0,
    adultPax: 0,
    childPax: 0,
    seniorPax: 0,
    entranceRevenue: 0,
    serviceRevenue: 0,
    itemCounts: {},
    receipts: []
  };

  // Determine peak sales date among all dates
  let peakDate = todayStr;
  let maxRev = 0;
  availableDates.forEach(d => {
    const dTally = getDailyTallySummary(d);
    if (dTally.totalCashRevenue > maxRev) {
      maxRev = dTally.totalCashRevenue;
      peakDate = d;
    }
  });

  const isPeakDay = selectedDate === peakDate && maxRev > 0;

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-white">
      
      {/* PAGE HEADER & DATE SELECTOR */}
      <div className="bg-[#0c1f16] p-5 rounded-2xl border border-emerald-500/20 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold font-mono text-2xl select-none shadow-md">
            ₱
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-[3px] block">CASHIER DAILY TALLY</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Everyday Sales Computation & Daily Tally
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Itemized cash breakdown of entrance fees, visitor counts, cottages, and resort service rentals.
            </p>
          </div>
        </div>

        {/* Date Switcher */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-black/60 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl px-4 py-2.5 outline-none cursor-pointer font-extrabold focus:border-emerald-400 transition-all"
          >
            {availableDates.map(d => (
              <option key={d} value={d}>
                {d === todayStr ? `Today (${d})` : d} {d === peakDate ? '🏆 Peak Sales Day' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 TOP TALLY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-[#0c1f16] p-4.5 flex items-center gap-3.5 shadow-xl">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 font-extrabold font-mono text-xl select-none">
            ₱
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">TOTAL CASH SALES ({selectedDate})</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">₱{tally.totalCashRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1 mt-0.5">
              100% Physical Cash Collections
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#0c1f16] p-4.5 flex items-center gap-3.5 shadow-xl">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">ENTRANCE CASH TALLY</span>
            <div className="text-xl font-black text-white mt-0.5">₱{tally.entranceRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <span className="text-[10px] text-emerald-300 font-bold mt-0.5 block">
              {tally.totalVisitors} Total Visitors Today
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#0c1f16] p-4.5 flex items-center gap-3.5 shadow-xl">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">SERVICES & FACILITIES TALLY</span>
            <div className="text-xl font-black text-emerald-300 mt-0.5">₱{tally.serviceRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <span className="text-[10px] text-slate-300 font-semibold mt-0.5 block">
              {Object.values(tally.itemCounts).reduce((a, b) => a + b, 0)} Items Rented
            </span>
          </div>
        </div>

        <div className={`rounded-2xl border p-4.5 flex items-center gap-3.5 shadow-xl ${
          isPeakDay ? 'bg-amber-950/80 border-amber-500/50 text-amber-300' : 'bg-[#0c1f16] border-emerald-500/20 text-emerald-400'
        }`}>
          <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${
            isPeakDay ? 'bg-amber-500/20 border-amber-400 text-amber-400' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
          }`}>
            {isPeakDay ? <Star className="w-5 h-5 fill-amber-400" /> : <Calculator className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase block">
              {isPeakDay ? 'HIGHEST SALES DAY 🏆' : 'DAILY ORDERS TALLY'}
            </span>
            <div className="text-xl font-black mt-0.5">
              {isPeakDay ? 'Peak Revenue' : `${tally.totalTransactions} Receipts`}
            </div>
            <span className="text-[10px] font-semibold block mt-0.5">
              {isPeakDay ? `Top performer: ₱${maxRev.toLocaleString()}` : `${tally.receipts.length} Cash Receipts Processed`}
            </span>
          </div>
        </div>
      </div>

      {/* EVERYDAY COMPUTATIONS SUMMARY BOX */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COMPUTATION BOX 1: ENTRANCE FEES & VISITOR PAX COMPUTATION */}
        <div className="bg-[#0c1f16] border border-emerald-500/20 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-emerald-900/60">
            <h3 className="font-extrabold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-2">
              <Ticket className="w-4 h-4" /> 1. Entrance Fees & Visitor Pax Computation
            </h3>
            <span className="text-[10px] font-mono font-bold text-emerald-300 bg-black/40 px-2.5 py-0.5 rounded border border-emerald-800">
              {tally.totalVisitors} Pax Total
            </span>
          </div>

          <div className="space-y-2 text-xs font-medium">
            <div className="flex justify-between bg-black/30 p-2.5 rounded-xl border border-emerald-900/40">
              <span className="text-slate-300">Adult Entrance Tickets (₱100 / head):</span>
              <strong className="font-mono text-emerald-300">{tally.adultPax} pax = ₱{(tally.adultPax * 100).toLocaleString()}</strong>
            </div>
            <div className="flex justify-between bg-black/30 p-2.5 rounded-xl border border-emerald-900/40">
              <span className="text-slate-300">Child Entrance Tickets (₱40 / head):</span>
              <strong className="font-mono text-emerald-300">{tally.childPax} pax = ₱{(tally.childPax * 40).toLocaleString()}</strong>
            </div>
            {tally.seniorPax > 0 && (
              <div className="flex justify-between bg-black/30 p-2.5 rounded-xl border border-emerald-900/40">
                <span className="text-slate-300">Senior / PWD Tickets (₱80 / head):</span>
                <strong className="font-mono text-emerald-300">{tally.seniorPax} pax = ₱{(tally.seniorPax * 80).toLocaleString()}</strong>
              </div>
            )}
            <div className="flex justify-between bg-black/30 p-2.5 rounded-xl border border-emerald-900/40">
              <span className="text-slate-300">Barangay Environmental Fee (₱30 / head):</span>
              <strong className="font-mono text-emerald-300">{tally.totalVisitors} pax = ₱{(tally.totalVisitors * 30).toLocaleString()}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-900/60 flex justify-between items-center text-sm font-extrabold bg-emerald-950/70 p-3 rounded-xl border border-emerald-700/50">
            <span className="text-slate-200">Subtotal Entrance Cash:</span>
            <span className="font-mono text-emerald-300 text-base">₱{tally.entranceRevenue.toLocaleString()}</span>
          </div>
        </div>

        {/* COMPUTATION BOX 2: COTTAGES & RESORT SERVICES ITEMIZATION */}
        <div className="bg-[#0c1f16] border border-emerald-500/20 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-emerald-900/60">
            <h3 className="font-extrabold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-2">
              <Home className="w-4 h-4" /> 2. Cottage & Resort Services Itemized Tally
            </h3>
            <span className="text-[10px] font-mono font-bold text-emerald-300 bg-black/40 px-2.5 py-0.5 rounded border border-emerald-800">
              {Object.keys(tally.itemCounts).length} Service Items Rented
            </span>
          </div>

          <div className="space-y-2 text-xs font-medium max-h-48 overflow-y-auto pr-1">
            {Object.keys(tally.itemCounts).length > 0 ? (
              Object.entries(tally.itemCounts).map(([itemName, count]) => (
                <div key={itemName} className="flex justify-between bg-black/30 p-2.5 rounded-xl border border-emerald-900/40">
                  <span className="text-slate-200">{itemName}</span>
                  <strong className="font-mono text-emerald-300">{count} units rented</strong>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-slate-500">No add-on services rented on this date</div>
            )}
          </div>

          <div className="pt-2 border-t border-emerald-900/60 flex justify-between items-center text-sm font-extrabold bg-emerald-950/70 p-3 rounded-xl border border-emerald-700/50">
            <span className="text-slate-200">Subtotal Services & Facilities Cash:</span>
            <span className="font-mono text-emerald-300 text-base">₱{tally.serviceRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* GRAND TOTAL CASH FORMULA COMPUTATION BANNER */}
      <div className="bg-emerald-950 p-5 rounded-2xl border-2 border-emerald-500/50 shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">DAILY REVENUE COMPUTATION FORMULA</span>
            <h4 className="font-extrabold text-white text-base">
              Entrance Cash (₱{tally.entranceRevenue.toLocaleString()}) + Services Cash (₱{tally.serviceRevenue.toLocaleString()})
            </h4>
          </div>
        </div>

        <div className="text-right bg-black/60 px-5 py-2.5 rounded-xl border border-emerald-500/40">
          <span className="text-[10px] text-slate-300 font-bold block uppercase">Grand Total Cash Collected ({selectedDate}):</span>
          <span className="font-mono font-black text-2xl text-emerald-400">₱{tally.totalCashRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* TODAY'S TRANSACTIONS TABLE */}
      <div className="bg-[#0c1f16] border border-emerald-500/20 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-emerald-900/60">
          <div>
            <h3 className="font-extrabold text-white text-base">Cash Receipts Ledger ({selectedDate})</h3>
            <p className="text-xs text-slate-400">Detailed list of cash payments processed on {selectedDate}</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800/60">
            {tally.receipts.length} Cash Transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 border-b border-emerald-900/60 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3">Receipt #</th>
                <th className="p-3">Time</th>
                <th className="p-3">Visitor / Client</th>
                <th className="p-3">Items & Services Availed</th>
                <th className="p-3 text-right">Cash Amount</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/40 font-medium">
              {tally.receipts.map((tx, idx) => (
                <tr key={tx.id || idx} className="hover:bg-white/5 transition-all">
                  <td className="p-3 font-mono text-emerald-400 font-bold">{tx.receiptNo || tx.id || `RCPT-00${idx + 1}`}</td>
                  <td className="p-3 text-slate-300">{tx.time || '10:00 AM'}</td>
                  <td className="p-3 font-bold text-white">{tx.touristName || tx.visitor || 'Walk-In Guest'}</td>
                  <td className="p-3 text-slate-300">
                    {Array.isArray(tx.items)
                      ? tx.items.map(i => `${i.name} (x${i.quantity})`).join(', ')
                      : (tx.items || 'Entrance & Amenities')}
                  </td>
                  <td className="p-3 text-right font-extrabold text-emerald-400">
                    ₱{parseFloat(tx.grandTotal || tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-center">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                      {tx.status || 'Paid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

