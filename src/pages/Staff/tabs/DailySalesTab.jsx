import React, { useState, useEffect, useMemo } from 'react';
import {
  Coins, CreditCard, TrendingUp, Users, Calendar, Wallet, CheckCircle2,
  Ticket, Home, Utensils, Droplets, ShieldCheck, Calculator, Star, Sparkles,
  Printer, RefreshCw, Layers, Send, X, Clock, FileText, Check
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';
import { getPhilippineDateStr, getPhilippineFormattedDate } from '../../../utils/phTime';

export default function DailySalesTab() {
  const { receipts = [], walkIns = [], currentUser, showAlert, getDailyTallySummary, refreshAllLiveData, theme } = useEcoTour();
  const isLight = theme === 'light';
  const todayStr = getPhilippineDateStr();
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Saved / submitted daily histories from backend MySQL
  const [savedHistories, setSavedHistories] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionNote, setSubmissionNote] = useState('');
  const [shiftName, setShiftName] = useState('Full Day Shift');
  const [cashTurnoverInput, setCashTurnoverInput] = useState('');

  const fetchSavedHistories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/reports/saved-daily-history');
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        const map = {};
        data.history.forEach(h => {
          map[h.date] = h;
        });
        setSavedHistories(map);
      }
    } catch (e) {
      console.warn('Saved daily history note:', e.message);
    }
  };

  useEffect(() => {
    fetchSavedHistories();
  }, []);

  // Collect all real unique dates that have transactions
  const availableDates = useMemo(() => {
    const dates = new Set([todayStr]);
    (receipts || []).forEach(r => {
      if (r.date) dates.add(String(r.date).split('T')[0]);
      if (r.created_at) dates.add(String(r.created_at).split('T')[0]);
    });
    (walkIns || []).forEach(w => {
      if (w.transaction_date) dates.add(String(w.transaction_date).split('T')[0]);
      if (w.operating_date) dates.add(String(w.operating_date).split('T')[0]);
      if (w.created_at) dates.add(String(w.created_at).split('T')[0]);
    });
    return Array.from(dates).filter(Boolean).sort((a, b) => new Date(b) - new Date(a));
  }, [receipts, walkIns, todayStr]);

  const tally = useMemo(() => {
    if (!getDailyTallySummary) {
      return {
        totalCashRevenue: 0,
        totalTransactions: 0,
        totalVisitors: 0,
        adultPax: 0,
        childPax: 0,
        studentPax: 0,
        seniorPax: 0,
        entranceRevenue: 0,
        serviceRevenue: 0,
        itemCounts: {},
        receipts: []
      };
    }
    return getDailyTallySummary(selectedDate);
  }, [getDailyTallySummary, selectedDate, receipts, walkIns]);

  // Determine peak sales date among all available dates
  const { peakDate, maxRev } = useMemo(() => {
    let peak = todayStr;
    let max = 0;
    if (getDailyTallySummary) {
      availableDates.forEach(d => {
        const dTally = getDailyTallySummary(d);
        if (dTally.totalCashRevenue > max) {
          max = dTally.totalCashRevenue;
          peak = d;
        }
      });
    }
    return { peakDate: peak, maxRev: max };
  }, [availableDates, getDailyTallySummary, todayStr, receipts, walkIns]);

  const isPeakDay = selectedDate === peakDate && maxRev > 0;
  const currentSubmission = savedHistories[selectedDate];

  const handlePrintTally = () => {
    window.print();
  };

  const handleOpenSubmitModal = () => {
    setCashTurnoverInput(String(tally.totalCashRevenue || 0));
    setSubmissionNote('');
    setShowSubmitModal(true);
  };

  const handleSubmitTally = async () => {
    setIsSubmitting(true);
    try {
      const cashier = currentUser?.name || `${currentUser?.fname || ''} ${currentUser?.lname || ''}`.trim() || 'Staff Cashier';
      const actualRemitted = parseFloat(cashTurnoverInput) || tally.totalCashRevenue || 0;

      const payload = {
        date: selectedDate,
        total_visitors: tally.totalVisitors || 0,
        entrance_revenue: tally.entranceRevenue || 0,
        service_revenue: tally.serviceRevenue || 0,
        total_cash_revenue: actualRemitted,
        park_share: Math.round(actualRemitted * 0.70),
        barangay_share: Math.round(actualRemitted * 0.20),
        municipal_share: Math.round(actualRemitted * 0.10),
        cashier_name: cashier,
        saved_by: cashier,
        notes: submissionNote.trim() ? `[${shiftName}] ${submissionNote.trim()}` : `[${shiftName}] Cash drawer count verified and remitted to Admin.`,
        status: 'Submitted to Admin',
        total_transactions: tally.totalTransactions || tally.receipts?.length || 0,
      };

      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/v1/reports/save-daily-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setShowSubmitModal(false);
        await fetchSavedHistories();
        if (refreshAllLiveData) refreshAllLiveData();
        window.dispatchEvent(new CustomEvent('ecotour:daily-reset'));

        if (showAlert) {
          showAlert({
            title: 'Daily Tally Submitted to Admin!',
            message: `Tally for ${selectedDate} (₱${actualRemitted.toLocaleString('en-US', { minimumFractionDigits: 2 })}) has been transmitted to Admin for review & reconciliation.`,
            type: 'success'
          });
        } else {
          alert('Daily tally submitted to Admin successfully!');
        }
      } else {
        throw new Error(data.message || 'Failed to submit tally.');
      }
    } catch (err) {
      alert(err.message || 'Error transmitting daily tally to Admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-white print:p-0 print:text-black">
      
      {/* PAGE HEADER & DATE SELECTOR */}
      <div className="bg-[#0c1f16] p-5 rounded-2xl border border-emerald-500/20 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold font-mono text-2xl select-none shadow-md">
            ₱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-[3px] block">CASHIER DAILY TALLY TERMINAL</span>
              {currentSubmission && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  currentSubmission.status?.includes('Verified')
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  ✓ {currentSubmission.status}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Everyday Sales Computation &amp; Daily Tally
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Itemized cash breakdown of entrance fees, visitor counts, cottages, and resort service rentals.
            </p>
          </div>
        </div>

        {/* Date Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => { if (refreshAllLiveData) refreshAllLiveData(); fetchSavedHistories(); }}
            className="p-2.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/50 rounded-xl text-emerald-300 transition-all cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrintTally}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/50 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-md"
            title="Print Shift Tally Report"
          >
            <Printer className="w-4 h-4" /> Print
          </button>

          <button
            onClick={handleOpenSubmitModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/50 rounded-xl text-white text-xs font-extrabold transition-all cursor-pointer shadow-lg active:scale-95"
            title="Submit this tally & cash turnover directly to Admin"
          >
            <Send className="w-4 h-4" />
            {currentSubmission ? 'Update / Re-submit Tally' : 'Submit Tally to Admin'}
          </button>

          <div className="flex items-center gap-2 bg-black/60 border border-emerald-500/40 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-emerald-300 text-xs font-extrabold outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* PRINT-ONLY HEADER */}
      <div className="hidden print:block text-center border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold text-slate-900">ECOTOUR VISTA RESORT</h1>
        <p className="text-sm text-slate-600">Daily Cash Sales &amp; Visitor Tally Audit Report</p>
        <p className="text-xs font-mono font-bold text-slate-800 mt-1">Operating Date: {selectedDate}</p>
      </div>

      {/* 4 TOP TALLY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-[#0c1f16] p-4.5 flex items-center gap-3.5 shadow-xl print:bg-white print:border-slate-300 print:text-black">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 font-extrabold font-mono text-xl select-none">
            ₱
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block print:text-slate-600">
              TOTAL CASH SALES ({selectedDate})
            </span>
            <div className="text-xl font-black text-emerald-400 mt-0.5 print:text-emerald-700 font-mono">
              ₱{tally.totalCashRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1 mt-0.5 print:text-slate-600">
              100% Cash Collections
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#0c1f16] p-4.5 flex items-center gap-3.5 shadow-xl print:bg-white print:border-slate-300 print:text-black">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block print:text-slate-600">
              ENTRANCE CASH TALLY
            </span>
            <div className="text-xl font-black text-white mt-0.5 print:text-black font-mono">
              ₱{tally.entranceRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-emerald-300 font-bold mt-0.5 block print:text-slate-600">
              {tally.totalVisitors} Total Visitors ({tally.adultPax} Adult, {tally.childPax} Child)
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#0c1f16] p-4.5 flex items-center gap-3.5 shadow-xl print:bg-white print:border-slate-300 print:text-black">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block print:text-slate-600">
              SERVICES &amp; FACILITIES TALLY
            </span>
            <div className="text-xl font-black text-emerald-300 mt-0.5 print:text-emerald-700 font-mono">
              ₱{tally.serviceRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-300 font-semibold mt-0.5 block print:text-slate-600">
              {Object.values(tally.itemCounts).reduce((a, b) => a + b, 0)} Items / Units Rented
            </span>
          </div>
        </div>

        <div className={`rounded-2xl border p-4.5 flex items-center gap-3.5 shadow-xl print:bg-white print:border-slate-300 print:text-black ${
          isPeakDay ? 'bg-amber-950/80 border-amber-500/50 text-amber-300' : 'bg-[#0c1f16] border-emerald-500/20 text-emerald-400'
        }`}>
          <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${
            isPeakDay ? 'bg-amber-500/20 border-amber-400 text-amber-400' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
          }`}>
            {isPeakDay ? <Star className="w-5 h-5 fill-amber-400" /> : <Calculator className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase block print:text-slate-600">
              {isPeakDay ? 'HIGHEST SALES DAY 🏆' : 'DAILY TRANSACTIONS TALLY'}
            </span>
            <div className="text-xl font-black mt-0.5 print:text-black font-mono">
              {isPeakDay ? `Peak ₱${maxRev.toLocaleString()}` : `${tally.totalTransactions} Receipts`}
            </div>
            <span className="text-[10px] font-semibold block mt-0.5 print:text-slate-600">
              {tally.receipts.length} Official Cash Collections
            </span>
          </div>
        </div>
      </div>

      {/* EVERYDAY COMPUTATIONS SUMMARY BOX */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COMPUTATION BOX 1: ENTRANCE FEES & VISITOR PAX COMPUTATION */}
        <div className="bg-[#0c1f16] border border-emerald-500/20 rounded-2xl p-5 shadow-xl space-y-4 print:bg-white print:border-slate-300 print:text-black">
          <div className="flex justify-between items-center pb-3 border-b border-emerald-900/60 print:border-slate-300">
            <h3 className="font-extrabold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-2 print:text-slate-900">
              <Ticket className="w-4 h-4 text-emerald-400" /> 1. Entrance Fees &amp; Visitor Pax Computation
            </h3>
            <span className="text-[10px] font-mono font-bold text-emerald-300 bg-black/40 px-2.5 py-0.5 rounded border border-emerald-800 print:bg-slate-100 print:text-slate-800 print:border-slate-300">
              {tally.totalVisitors} Pax Total
            </span>
          </div>

          <div className="space-y-2 text-xs font-medium">
            <div className="flex justify-between bg-black/30 p-2.5 rounded-xl border border-emerald-900/40 print:bg-slate-50 print:border-slate-200">
              <span className="text-slate-300 print:text-slate-700">Adult Entrance Tickets (₱100 / head):</span>
              <strong className="font-mono text-emerald-300 print:text-slate-900">{tally.adultPax} pax = ₱{(tally.adultPax * 100).toLocaleString()}</strong>
            </div>
            <div className="flex justify-between bg-black/30 p-2.5 rounded-xl border border-emerald-900/40 print:bg-slate-50 print:border-slate-200">
              <span className="text-slate-300 print:text-slate-700">Child Entrance Tickets (₱40 / head):</span>
              <strong className="font-mono text-emerald-300 print:text-slate-900">{tally.childPax} pax = ₱{(tally.childPax * 40).toLocaleString()}</strong>
            </div>
            {tally.seniorPax > 0 && (
              <div className="flex justify-between bg-black/30 p-2.5 rounded-xl border border-emerald-900/40 print:bg-slate-50 print:border-slate-200">
                <span className="text-slate-300 print:text-slate-700">Senior / PWD Tickets (₱80 / head):</span>
                <strong className="font-mono text-emerald-300 print:text-slate-900">{tally.seniorPax} pax = ₱{(tally.seniorPax * 80).toLocaleString()}</strong>
              </div>
            )}
            <div className="flex justify-between bg-black/30 p-2.5 rounded-xl border border-emerald-900/40 print:bg-slate-50 print:border-slate-200">
              <span className="text-slate-300 print:text-slate-700">Barangay Environmental Fee (₱30 / head):</span>
              <strong className="font-mono text-emerald-300 print:text-slate-900">{tally.totalVisitors} pax = ₱{(tally.totalVisitors * 30).toLocaleString()}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-900/60 flex justify-between items-center text-sm font-extrabold bg-emerald-950/70 p-3 rounded-xl border border-emerald-700/50 print:bg-slate-100 print:border-slate-300">
            <span className="text-slate-200 print:text-slate-800">Subtotal Entrance Cash:</span>
            <span className="font-mono text-emerald-300 text-base print:text-emerald-800 font-bold">
              ₱{tally.entranceRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* COMPUTATION BOX 2: COTTAGES & RESORT SERVICES ITEMIZATION */}
        <div className="bg-[#0c1f16] border border-emerald-500/20 rounded-2xl p-5 shadow-xl space-y-4 print:bg-white print:border-slate-300 print:text-black">
          <div className="flex justify-between items-center pb-3 border-b border-emerald-900/60 print:border-slate-300">
            <h3 className="font-extrabold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-2 print:text-slate-900">
              <Home className="w-4 h-4 text-emerald-400" /> 2. Cottage &amp; Resort Services Itemized Tally
            </h3>
            <span className="text-[10px] font-mono font-bold text-emerald-300 bg-black/40 px-2.5 py-0.5 rounded border border-emerald-800 print:bg-slate-100 print:text-slate-800 print:border-slate-300">
              {Object.keys(tally.itemCounts).length} Service Items Rented
            </span>
          </div>

          <div className="space-y-2 text-xs font-medium max-h-48 overflow-y-auto pr-1">
            {Object.keys(tally.itemCounts).length > 0 ? (
              Object.entries(tally.itemCounts).map(([itemName, count]) => (
                <div key={itemName} className="flex justify-between bg-black/30 p-2.5 rounded-xl border border-emerald-900/40 print:bg-slate-50 print:border-slate-200">
                  <span className="text-slate-200 print:text-slate-700">{itemName}</span>
                  <strong className="font-mono text-emerald-300 print:text-slate-900">{count} units rented</strong>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-slate-500">No add-on services rented on this date</div>
            )}
          </div>

          <div className="pt-2 border-t border-emerald-900/60 flex justify-between items-center text-sm font-extrabold bg-emerald-950/70 p-3 rounded-xl border border-emerald-700/50 print:bg-slate-100 print:border-slate-300">
            <span className="text-slate-200 print:text-slate-800">Subtotal Services &amp; Facilities Cash:</span>
            <span className="font-mono text-emerald-300 text-base print:text-emerald-800 font-bold">
              ₱{tally.serviceRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* GRAND TOTAL CASH FORMULA COMPUTATION BANNER */}
      <div className="bg-emerald-950 p-5 rounded-2xl border-2 border-emerald-500/50 shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-4 print:bg-slate-100 print:border-slate-400 print:text-black">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold print:hidden">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block print:text-slate-700">
              DAILY REVENUE COMPUTATION FORMULA
            </span>
            <h4 className="font-extrabold text-white text-sm sm:text-base print:text-black">
              Entrance Cash (₱{tally.entranceRevenue.toLocaleString()}) + Services Cash (₱{tally.serviceRevenue.toLocaleString()})
            </h4>
          </div>
        </div>

        <div className="text-right bg-black/60 px-5 py-2.5 rounded-xl border border-emerald-500/40 print:bg-white print:border-slate-300">
          <span className="text-[10px] text-slate-300 font-bold block uppercase print:text-slate-600">
            Grand Total Cash Collected ({selectedDate}):
          </span>
          <span className="font-mono font-black text-2xl text-emerald-400 print:text-emerald-800">
            ₱{tally.totalCashRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="bg-[#0c1f16] border border-emerald-500/20 rounded-2xl p-5 shadow-xl space-y-4 print:bg-white print:border-slate-300 print:text-black">
        <div className="flex justify-between items-center pb-3 border-b border-emerald-900/60 print:border-slate-300">
          <div>
            <h3 className="font-extrabold text-white text-base print:text-black">Cash Receipts Ledger ({selectedDate})</h3>
            <p className="text-xs text-slate-400 print:text-slate-600">Detailed list of cash payments processed on {selectedDate}</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800/60 print:bg-slate-100 print:text-slate-800 print:border-slate-300">
            {tally.receipts.length} Cash Transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 border-b border-emerald-900/60 text-slate-400 uppercase font-mono text-[10px] print:bg-slate-100 print:text-slate-800">
              <tr>
                <th className="p-3">Receipt #</th>
                <th className="p-3">Time</th>
                <th className="p-3">Visitor / Client</th>
                <th className="p-3">Items &amp; Services Availed</th>
                <th className="p-3 text-right">Cash Amount</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/40 font-medium print:divide-slate-200">
              {tally.receipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-slate-400 print:text-slate-500">
                    No cash transactions recorded for {selectedDate}.
                  </td>
                </tr>
              ) : (
                tally.receipts.map((tx, idx) => (
                  <tr key={tx.receiptNo || tx.id || idx} className="hover:bg-white/5 transition-all print:hover:bg-transparent">
                    <td className="p-3 font-mono text-emerald-400 font-bold print:text-slate-900">{tx.receiptNo || `RCPT-${idx + 1}`}</td>
                    <td className="p-3 text-slate-300 print:text-slate-600 font-mono">{tx.time || '10:00 AM'}</td>
                    <td className="p-3 font-bold text-white print:text-black">{tx.touristName || 'Walk-In Guest'}</td>
                    <td className="p-3 text-slate-300 print:text-slate-600 max-w-[280px] truncate">
                      {Array.isArray(tx.items) && tx.items.length > 0
                        ? tx.items.map(i => `${i.name} (x${i.quantity || 1})`).join(', ')
                        : 'Day Pass & Resort Services'}
                    </td>
                    <td className="p-3 text-right font-extrabold text-emerald-400 font-mono print:text-emerald-800">
                      ₱{parseFloat(tx.grandTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase print:text-black print:border-slate-300">
                        {tx.status || 'Paid'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: SUBMIT DAILY SALES TALLY TO ADMIN */}
      {showSubmitModal && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn ${
          isLight ? 'bg-slate-900/60' : 'bg-black/80'
        }`}>
          <div
            className={`daily-tally-modal rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 transition-all ${
              isLight
                ? 'bg-white text-slate-900 border border-emerald-200/90 shadow-2xl shadow-emerald-950/10'
                : 'bg-[#071810] text-white border border-emerald-500/40 shadow-2xl'
            }`}
            style={{
              backgroundColor: isLight ? '#ffffff' : '#071810',
              color: isLight ? '#0f172a' : '#ffffff',
            }}
          >
            {/* Modal Header */}
            <div className={`flex justify-between items-center pb-3 border-b ${
              isLight ? 'border-emerald-100' : 'border-emerald-900/60'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-xl shrink-0 ${
                  isLight
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                }`}>
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    className="font-extrabold text-base tracking-tight"
                    style={{ color: isLight ? '#064e3b' : '#ffffff' }}
                  >
                    Submit Daily Tally to Admin
                  </h3>
                  <p
                    className="text-[11px]"
                    style={{ color: isLight ? '#475569' : '#94a3b8' }}
                  >
                    Official cash drawer turnover &amp; shift reconciliation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLight
                    ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shift & Remittance Details Summary (4 Dynamic Cards) */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div
                className={`p-3 rounded-xl border transition-colors ${
                  isLight
                    ? 'bg-emerald-50/70 border-emerald-200/80 shadow-xs'
                    : 'bg-black/40 border-emerald-900/50'
                }`}
                style={{
                  backgroundColor: isLight ? '#f0fdf4' : 'rgba(0, 0, 0, 0.45)',
                  borderColor: isLight ? '#bbf7d0' : 'rgba(6, 78, 59, 0.5)',
                }}
              >
                <span
                  className="text-[10px] font-bold block uppercase tracking-wider"
                  style={{ color: isLight ? '#047857' : '#94a3b8' }}
                >
                  Operating Date
                </span>
                <span
                  className="font-mono font-extrabold text-sm block mt-0.5"
                  style={{ color: isLight ? '#065f46' : '#6ee7b7' }}
                >
                  {selectedDate}
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border transition-colors ${
                  isLight
                    ? 'bg-emerald-50/70 border-emerald-200/80 shadow-xs'
                    : 'bg-black/40 border-emerald-900/50'
                }`}
                style={{
                  backgroundColor: isLight ? '#f0fdf4' : 'rgba(0, 0, 0, 0.45)',
                  borderColor: isLight ? '#bbf7d0' : 'rgba(6, 78, 59, 0.5)',
                }}
              >
                <span
                  className="text-[10px] font-bold block uppercase tracking-wider"
                  style={{ color: isLight ? '#047857' : '#94a3b8' }}
                >
                  Submitting Cashier
                </span>
                <span
                  className="font-bold text-sm truncate block mt-0.5"
                  style={{ color: isLight ? '#0f172a' : '#ffffff' }}
                >
                  {currentUser?.name || `${currentUser?.fname || ''} ${currentUser?.lname || ''}`.trim() || 'Staff Cashier'}
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border transition-colors ${
                  isLight
                    ? 'bg-emerald-50/70 border-emerald-200/80 shadow-xs'
                    : 'bg-black/40 border-emerald-900/50'
                }`}
                style={{
                  backgroundColor: isLight ? '#f0fdf4' : 'rgba(0, 0, 0, 0.45)',
                  borderColor: isLight ? '#bbf7d0' : 'rgba(6, 78, 59, 0.5)',
                }}
              >
                <span
                  className="text-[10px] font-bold block uppercase tracking-wider"
                  style={{ color: isLight ? '#047857' : '#94a3b8' }}
                >
                  Entrance Cash
                </span>
                <span
                  className="font-mono font-bold text-sm block mt-0.5"
                  style={{ color: isLight ? '#0f172a' : '#ffffff' }}
                >
                  ₱{tally.entranceRevenue.toLocaleString()}{' '}
                  <span className={`text-[11px] font-normal ${isLight ? 'text-slate-500' : 'text-slate-300'}`}>
                    ({tally.totalVisitors} pax)
                  </span>
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border transition-colors ${
                  isLight
                    ? 'bg-emerald-50/70 border-emerald-200/80 shadow-xs'
                    : 'bg-black/40 border-emerald-900/50'
                }`}
                style={{
                  backgroundColor: isLight ? '#f0fdf4' : 'rgba(0, 0, 0, 0.45)',
                  borderColor: isLight ? '#bbf7d0' : 'rgba(6, 78, 59, 0.5)',
                }}
              >
                <span
                  className="text-[10px] font-bold block uppercase tracking-wider"
                  style={{ color: isLight ? '#047857' : '#94a3b8' }}
                >
                  Services Cash
                </span>
                <span
                  className="font-mono font-bold text-sm block mt-0.5"
                  style={{ color: isLight ? '#0f172a' : '#ffffff' }}
                >
                  ₱{tally.serviceRevenue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Shift & Remittance Inputs */}
            <div className="space-y-3.5">
              <div>
                <label
                  className="text-xs font-bold block mb-1"
                  style={{ color: isLight ? '#334155' : '#cbd5e1' }}
                >
                  Cashier Shift
                </label>
                <select
                  value={shiftName}
                  onChange={(e) => setShiftName(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs outline-none transition-all ${
                    isLight
                      ? 'bg-white border border-slate-300 text-slate-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 shadow-xs'
                      : 'bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 focus:border-emerald-400'
                  }`}
                  style={{
                    backgroundColor: isLight ? '#ffffff' : undefined,
                    color: isLight ? '#0f172a' : undefined,
                  }}
                >
                  <option value="Full Day Shift">Full Day Shift</option>
                  <option value="Morning Shift (8AM - 4PM)">Morning Shift (8AM - 4PM)</option>
                  <option value="Evening Shift (4PM - 10PM)">Evening Shift (4PM - 10PM)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label
                    className="text-xs font-bold"
                    style={{ color: isLight ? '#334155' : '#cbd5e1' }}
                  >
                    Actual Cash Turnover / Remittance (₱)
                  </label>
                  <span
                    className="text-[10px] font-bold font-mono"
                    style={{ color: isLight ? '#047857' : '#34d399' }}
                  >
                    System Computed: ₱{tally.totalCashRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="relative">
                  <span
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold select-none text-base"
                    style={{ color: isLight ? '#059669' : '#34d399' }}
                  >
                    ₱
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={cashTurnoverInput}
                    onChange={(e) => setCashTurnoverInput(e.target.value)}
                    className={`w-full rounded-xl pl-8 pr-4 py-2 font-mono font-extrabold text-base outline-none transition-all ${
                      isLight
                        ? 'bg-white border border-slate-300 text-emerald-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 shadow-xs'
                        : 'bg-black/60 border border-emerald-500/50 text-emerald-300 focus:border-emerald-400'
                    }`}
                    style={{
                      backgroundColor: isLight ? '#ffffff' : undefined,
                      color: isLight ? '#047857' : undefined,
                    }}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label
                  className="text-xs font-bold block mb-1"
                  style={{ color: isLight ? '#334155' : '#cbd5e1' }}
                >
                  Cashier Turnover Remarks &amp; Notes
                </label>
                <textarea
                  value={submissionNote}
                  onChange={(e) => setSubmissionNote(e.target.value)}
                  placeholder="e.g. End-of-day physical cash counted and balanced with system tally. Ready for turnover."
                  className={`w-full rounded-xl p-3 text-xs outline-none min-h-[70px] resize-none transition-all ${
                    isLight
                      ? 'bg-white border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 shadow-xs'
                      : 'bg-black/50 border border-emerald-900/60 text-slate-200 placeholder:text-slate-500 focus:border-emerald-400'
                  }`}
                  style={{
                    backgroundColor: isLight ? '#ffffff' : undefined,
                    color: isLight ? '#0f172a' : undefined,
                  }}
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className={`pt-2 flex justify-end gap-2.5 border-t ${
              isLight ? 'border-emerald-100' : 'border-emerald-900/60'
            }`}>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-2xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitTally}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 rounded-xl text-xs font-extrabold text-white shadow-lg shadow-emerald-900/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Transmitting to Admin…' : 'Confirm & Submit to Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
