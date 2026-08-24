import React, { useState, useMemo } from 'react';
import {
  Receipt, TrendingUp, TrendingDown, Coins, Wallet, FileText,
  Search, Filter, ChevronLeft, ChevronRight, User, HelpCircle, BookOpen, Printer,
  Eye, CheckCircle2, XCircle, RefreshCw, Sparkles, Download, Calendar, DollarSign
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';
import { getPhilippineDateStr, getPhilippineFormattedDate, getPhilippineTimeStr } from '../../../utils/phTime';
import OfficialReceiptModal from '../../Admin/modals/OfficialReceiptModal';

export default function ReceiptsTab() {
  const { receipts = [], walkIns = [], refreshAllLiveData, currentUser } = useEcoTour();
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'search' | 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceiptForView, setSelectedReceiptForView] = useState(null);
  const [filterDate, setFilterDate] = useState('');

  const todayStr = getPhilippineDateStr();
  const todayFormatted = getPhilippineFormattedDate();

  // Combine live receipts with walk-in records ensuring 100% complete real data
  const allRealReceipts = useMemo(() => {
    const map = new Map();

    // 1. Process database and context receipts
    (receipts || []).forEach((r) => {
      const key = r.receiptNo || r.payment_ref || `OR-${r.id}`;
      map.set(key, {
        id: r.id,
        receiptNo: key,
        clientName: r.clientName || r.client_name || r.touristName || r.fullName || 'Walk-In Guest',
        pax: r.totalVisitors || r.guest_count || r.pax || 1,
        desc: r.items?.map(i => `${i.name} (${i.quantity || 1}x)`).join(', ') || r.serviceName || r.description || 'Day Pass & Resort Services',
        items: r.items || [],
        grandTotal: parseFloat(r.grandTotal || r.total_amount || r.amount || 0),
        cashReceived: parseFloat(r.cashReceived || r.cash_received || r.grandTotal || r.total_amount || 0),
        change: parseFloat(r.change || r.change_amount || 0),
        paymentMethod: r.paymentMethod || r.payment_method || 'Cash',
        status: (r.status || 'Paid').toLowerCase().includes('cancel') || (r.status || '').toLowerCase().includes('void') ? 'Cancelled' : 'Paid',
        time: r.time || (r.created_at ? new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:00 AM'),
        date: (r.date || r.created_at || todayStr).split('T')[0],
        staffName: r.staffName || r.staff_name || currentUser?.name || 'Duty Cashier'
      });
    });

    // 2. Merge any walk-in transactions that might not be in receipts list yet
    (walkIns || []).forEach((w) => {
      const key = w.receiptNo || `OR-${w.walk_in_id || w.id}`;
      if (!map.has(key)) {
        map.set(key, {
          id: w.id,
          receiptNo: key,
          clientName: w.customer_name || w.touristName || 'Walk-In Guest',
          pax: w.guest_count || w.totalVisitors || 1,
          desc: w.items?.map(i => `${i.name} (${i.quantity || 1}x)`).join(', ') || 'Day Pass & Resort Services',
          items: w.items || [],
          grandTotal: parseFloat(w.grandTotal || w.total_amount || 0),
          cashReceived: parseFloat(w.amount_received || w.grandTotal || 0),
          change: parseFloat(w.change_amount || 0),
          paymentMethod: 'Cash',
          status: w.walk_in_status === 'COMPLETED' ? 'Completed' : (w.payment_status === 'PAID' ? 'Paid' : 'Active'),
          time: w.time || '10:00 AM',
          date: (w.transaction_date || w.operating_date || todayStr).split('T')[0],
          staffName: w.created_by || w.paid_by || currentUser?.name || 'Staff Cashier'
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.date + ' ' + (b.time || '')) - new Date(a.date + ' ' + (a.time || '')));
  }, [receipts, walkIns, todayStr, currentUser]);

  // Today's receipts
  const todayReceipts = allRealReceipts.filter(r => r.date === todayStr);
  const paidTodayReceipts = todayReceipts.filter(r => r.status !== 'Cancelled');
  const cancelledTodayReceipts = todayReceipts.filter(r => r.status === 'Cancelled');

  const todaySales = paidTodayReceipts.reduce((sum, r) => sum + r.grandTotal, 0);
  const avgReceiptToday = paidTodayReceipts.length > 0 ? (todaySales / paidTodayReceipts.length) : 0;

  // Filtered receipts list based on active tab and search query
  const displayedReceipts = useMemo(() => {
    let list = allRealReceipts;

    if (activeTab === 'today') {
      list = todayReceipts;
    } else if (activeTab === 'history') {
      if (filterDate) {
        list = list.filter(r => r.date === filterDate);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(r =>
        r.receiptNo.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        r.desc.toLowerCase().includes(q) ||
        (r.staffName && r.staffName.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allRealReceipts, activeTab, todayReceipts, searchQuery, filterDate]);

  // Real Top Services breakdown from receipts
  const topServices = useMemo(() => {
    const counts = {};
    allRealReceipts.forEach(r => {
      if (r.items && r.items.length > 0) {
        r.items.forEach(it => {
          const name = it.name || 'Day Pass';
          const lineTotal = (it.quantity || 1) * (it.unitPrice || 0);
          counts[name] = (counts[name] || 0) + lineTotal;
        });
      } else if (r.desc) {
        counts[r.desc] = (counts[r.desc] || 0) + r.grandTotal;
      }
    });

    const entries = Object.entries(counts).map(([name, total]) => ({ name, total }));
    entries.sort((a, b) => b.total - a.total);
    return entries.slice(0, 5);
  }, [allRealReceipts]);

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-white">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#071911] p-5 rounded-2xl border border-emerald-500/20 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-[3px] block">LIVE BILLING &amp; SETTLEMENTS</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Official Receipts Terminal
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Operating Date: <strong className="text-emerald-300">{todayFormatted} ({todayStr})</strong> • Live records from front desk POS &amp; reservations.
            </p>
          </div>
        </div>

        <button
          onClick={() => { if (refreshAllLiveData) refreshAllLiveData(); }}
          className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-bold px-4 py-2 rounded-xl border border-emerald-700/50 flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-emerald-400" /> Refresh Live Receipts
        </button>
      </div>

      {/* FILTER PILLS NAVBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'today', label: `Today's Receipts (${todayReceipts.length})` },
            { id: 'search', label: 'Search Receipts' },
            { id: 'history', label: `All History (${allRealReceipts.length})` },
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

        {activeTab === 'history' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Filter Date:</span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-[#04150e] border border-emerald-700/60 rounded-lg px-2.5 py-1 text-xs text-emerald-200 outline-none"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="text-xs text-rose-400 hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4 TOP REAL-TIME STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">TODAY'S RECEIPTS</span>
            <div className="text-2xl font-extrabold text-white mt-0.5">{todayReceipts.length}</div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> {paidTodayReceipts.length} Valid Official Receipts
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-mono font-extrabold text-base">
            ₱
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">TOTAL SALES (TODAY)</span>
            <div className="text-xl font-extrabold text-emerald-400 mt-0.5 font-mono">
              ₱{todaySales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1 mt-0.5">
              100% Cash Collections
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">AVERAGE RECEIPT</span>
            <div className="text-xl font-extrabold text-white mt-0.5 font-mono">
              ₱{avgReceiptToday.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
              Per Transaction Average
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">CANCELLED / VOIDED</span>
            <div className="text-2xl font-extrabold text-white mt-0.5">{cancelledTodayReceipts.length}</div>
            <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-1 mt-0.5">
              Released &amp; Inactive
            </span>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Receipt No (e.g. OR-2026...), Tourist Name, Service Availed, or Staff..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0c1f16] border border-emerald-500/20 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-400/50 shadow-inner transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* MIDDLE GRID: LIVE RECEIPTS TABLE & TOP SERVICES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LIVE RECEIPTS TABLE (2 SPANS) */}
        <div className="lg:col-span-2 rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {activeTab === 'today' ? "TODAY'S OFFICIAL RECEIPTS" : activeTab === 'history' ? 'ALL RECORDED RECEIPTS' : 'SEARCH RESULTS'}
            </h4>
            <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
              {displayedReceipts.length} Receipts
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-emerald-900/40 bg-[#04150e]/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#061d13] text-emerald-400 border-b border-emerald-900/40 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">RECEIPT NO.</th>
                  <th className="p-3">VISITOR / CUSTOMER</th>
                  <th className="p-3">SERVICES AVAILED</th>
                  <th className="p-3">AMOUNT</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3">TIME / DATE</th>
                  <th className="p-3 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/30 text-slate-200 font-medium">
                {displayedReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs text-slate-400">
                      No receipts found for the selected view. Register a new walk-in at POS or confirm a reservation payment to issue receipts.
                    </td>
                  </tr>
                ) : (
                  displayedReceipts.map((r) => (
                    <tr key={r.receiptNo || r.id} className="hover:bg-emerald-950/40 transition-colors">
                      <td className="p-3 font-mono text-emerald-400 font-bold">{r.receiptNo}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-700/50 flex items-center justify-center font-bold text-xs text-emerald-400 shrink-0 font-mono">
                            {(r.clientName || 'G')[0]}
                          </div>
                          <div>
                            <strong className="text-white text-xs block">{r.clientName}</strong>
                            <span className="text-[10px] text-slate-400">{r.pax} Guests</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-300 max-w-[220px] truncate" title={r.desc}>
                        {r.desc}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-400 text-sm">
                        ₱{r.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                          r.status === 'Cancelled'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-400 text-[11px]">
                        <div>{r.time}</div>
                        <div className="text-[9px] text-slate-500">{r.date}</div>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedReceiptForView(r)}
                          className="px-3 py-1 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer border border-emerald-400/40 shadow-sm transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" /> View / Print
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TOP SERVICES BY SALES & REAL-TIME CASH SUMMARY */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-3 shadow-xl text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider border-b border-white/5 pb-3">
              TOP SERVICES (BY ACTUAL SALES)
            </h4>
            {topServices.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No sales recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {topServices.map((svc, i) => (
                  <div key={i} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-slate-300 truncate max-w-[160px]">{svc.name}</span>
                    <strong className="text-emerald-400 font-mono">
                      ₱{svc.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-3 shadow-xl text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider border-b border-white/5 pb-3">
              CASH DRAWER TALLY (TODAY)
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-slate-300 py-1">
                <span>Total Recorded Today:</span>
                <strong className="font-mono text-white">{todayReceipts.length} Receipts</strong>
              </div>
              <div className="flex justify-between text-slate-300 py-1">
                <span>Paid Receipts Count:</span>
                <strong className="font-mono text-emerald-400">{paidTodayReceipts.length}</strong>
              </div>
              <div className="flex justify-between text-slate-300 py-1">
                <span>Voided Receipts:</span>
                <strong className="font-mono text-rose-400">{cancelledTodayReceipts.length}</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10 text-sm">
                <span className="font-bold text-white">Net Cash Collected:</span>
                <strong className="font-mono font-bold text-emerald-400 text-base">
                  ₱{todaySales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OFFICIAL RECEIPT MODAL VIEWER */}
      {selectedReceiptForView && (
        <OfficialReceiptModal
          receiptData={selectedReceiptForView}
          onClose={() => setSelectedReceiptForView(null)}
        />
      )}

    </div>
  );
}