import React, { useState } from 'react';
import { Coins, Printer, Ticket, Home, Calculator, CheckCircle2 } from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';

export default function CashClosingTab() {
  const { receipts, currentUser, submitCashClosing, getDailyTallySummary } = useEcoTour();
  const today = new Date().toISOString().split('T')[0];

  const tally = getDailyTallySummary ? getDailyTallySummary(today) : {
    totalCashRevenue: 0,
    totalTransactions: 0,
    totalVisitors: 0,
    entranceRevenue: 0,
    serviceRevenue: 0,
    receipts: []
  };

  const [openingCashInput, setOpeningCashInput] = useState(2000);
  const [actualCashInput, setActualCashInput] = useState(openingCashInput + tally.totalCashRevenue);

  const expectedCashOnHand = openingCashInput + tally.totalCashRevenue;
  const cashDiscrepancy = actualCashInput - expectedCashOnHand;

  return (
    <div className="max-w-4xl mx-auto bg-[#0c1f16] text-white p-6 rounded-2xl border border-emerald-500/20 shadow-xl space-y-6">
      <div className="flex justify-between items-center pb-3 border-b border-emerald-900/60">
        <div>
          <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-emerald-400" /> End-Of-Shift Cash Closing & Shift Tally
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Verify cashier physical cash drawer against today's entrance and services computations
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-300 bg-black/40 px-3 py-1 rounded-full border border-emerald-800">
          {today}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-black/40 border border-emerald-900/50 p-4 rounded-xl text-xs font-medium">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Cashier</span>
          <span className="font-extrabold text-emerald-400 text-sm">{currentUser?.name || 'Staff Cashier'}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Entrance Cash</span>
          <span className="font-mono font-extrabold text-white text-sm">₱{tally.entranceRevenue.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Services & Cottages Cash</span>
          <span className="font-mono font-extrabold text-emerald-300 text-sm">₱{tally.serviceRevenue.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Grand Total Gross Cash</span>
          <span className="font-mono font-extrabold text-emerald-400 text-sm">₱{tally.totalCashRevenue.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-4 border-t border-emerald-900/60 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Starting Drawer Cash (Opening Float):</label>
            <input 
              type="number" 
              value={openingCashInput} 
              onChange={(e) => setOpeningCashInput(parseFloat(e.target.value) || 0)} 
              className="w-full bg-black/60 border border-emerald-900 rounded-xl px-4 py-2.5 font-mono text-emerald-300 text-sm outline-none focus:border-emerald-400" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Actual Physical Cash Counted in Drawer:</label>
            <input 
              type="number" 
              value={actualCashInput} 
              onChange={(e) => setActualCashInput(parseFloat(e.target.value) || 0)} 
              className="w-full bg-black/60 border border-emerald-500/50 rounded-xl px-4 py-2.5 font-mono font-black text-emerald-400 text-base outline-none focus:border-emerald-400" 
            />
          </div>
        </div>

        <div className={`p-4 rounded-xl text-xs font-bold flex justify-between items-center border ${
          cashDiscrepancy === 0
            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
            : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
        }`}>
          <span>Cash Drawer Discrepancy (Over / Short):</span>
          <span className="font-mono text-base font-extrabold">₱{cashDiscrepancy.toLocaleString()}</span>
        </div>

        <button 
          onClick={() => {
            if (submitCashClosing) submitCashClosing({ totalCashCollected: tally.totalCashRevenue, actualCashInput });
            else alert(`Shift Closing Submitted successfully! Total Cash: ₱${tally.totalCashRevenue.toLocaleString()}`);
          }} 
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all border border-emerald-400 uppercase tracking-wider"
        >
          <CheckCircle2 className="w-5 h-5" /> Submit Daily Shift Tally & Close Drawer
        </button>
      </div>
    </div>
  );
}   