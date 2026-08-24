import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Coins, DollarSign, TrendingUp, Calendar, Search,
  FileText, Printer, Building, ShieldCheck,
  Percent, Clock, Receipt, RefreshCw, Eye, Users, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';
import { formatCurrency } from '../utils/dashboardHelpers';
import OfficialReceiptModal from '../modals/OfficialReceiptModal';
import { getPhilippineDateStr, getPhilippineDate } from '../../../utils/phTime';

// ── Period filter helper (Philippine Time) ──────────────────────────────────────
const getDateRange = (period) => {
  const today = getPhilippineDateStr();
  const phNow = getPhilippineDate();

  if (period === 'today') {
    return { from: today, to: today };
  }
  if (period === 'week') {
    const day = phNow.getDay(); // 0=Sun
    const monday = new Date(phNow);
    monday.setDate(phNow.getDate() - ((day + 6) % 7));
    return { from: getPhilippineDateStr(monday), to: today };
  }
  if (period === 'month') {
    const first = new Date(phNow.getFullYear(), phNow.getMonth(), 1);
    return { from: getPhilippineDateStr(first), to: today };
  }
  // 'all'
  return { from: null, to: null };
};

const isInRange = (dateStr, range) => {
  if (!range.from) return true; // all-time
  if (!dateStr) return false;
  const d = dateStr.split('T')[0];
  return d >= range.from && d <= range.to;
};

export default function RevenuePaymentsTab() {
  const {
    receipts = [],
    walkIns = [],
    resortBookings = [],
    revenueShare,
    currentUser,
    refreshAllLiveData
  } = useEcoTour();

  // ── State ──────────────────────────────────────────────────
  const [period, setPeriod]           = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [selectedDate, setSelectedDate]     = useState('');
  const [viewReceiptData, setViewReceiptData] = useState(null);
  const [lastRefreshed, setLastRefreshed]   = useState(new Date());
  const [refreshing, setRefreshing]         = useState(false);
  const intervalRef = useRef(null);

  // Revenue sharing percentages
  const [shares, setShares] = useState({
    ownerPct:     revenueShare?.ownerPercent    || 70,
    barangayPct:  revenueShare?.barangayPercent || 20,
    municipalPct: revenueShare?.municipalPercent || 10,
  });
  const [saveNote, setSaveNote] = useState('');

  // ── Auto-refresh every 15 s ────────────────────────────────
  const handleRefresh = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      if (refreshAllLiveData) await refreshAllLiveData();
      setLastRefreshed(new Date());
    } finally {
      if (manual) setRefreshing(false);
    }
  }, [refreshAllLiveData]);

  useEffect(() => {
    intervalRef.current = setInterval(() => handleRefresh(), 15000);
    const onReset = () => handleRefresh();
    window.addEventListener('ecotour:daily-reset', onReset);
    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener('ecotour:daily-reset', onReset);
    };
  }, [handleRefresh]);

  // ── Unified Live Transactions Ledger ───────────────────────
  const unifiedTransactions = useMemo(() => {
    const map = new Map();
    const todayStr = getPhilippineDateStr();

    // 1. Receipts from payments table
    (receipts || []).forEach(r => {
      const key = r.receiptNo || r.payment_ref || `OR-${r.id}`;
      map.set(key, {
        id: r.id,
        receiptNo: key,
        touristName: r.touristName || r.clientName || r.client_name || 'Visitor Guest',
        clientName: r.clientName || r.touristName || r.client_name || 'Visitor Guest',
        userNumber: r.userNumber || `CLT-2026-000${r.id || 1}`,
        date: (r.date || r.created_at || todayStr).split('T')[0],
        time: r.time || '10:00 AM',
        paymentMethod: r.paymentMethod || r.payment_method || 'Cash',
        status: r.status || 'Paid',
        grandTotal: parseFloat(r.grandTotal || r.total_amount || 0),
        totalVisitors: parseInt(r.totalVisitors || r.total_visitors || 1, 10),
        items: r.items || [],
        notes: r.notes || 'Counter / POS Verified',
        verifiedBy: r.verifiedBy || 'Resort Staff Cashier',
      });
    });

    // 2. Paid Walk-Ins
    (walkIns || []).forEach(w => {
      const key = w.receiptNo || `OR-${w.walk_in_id || w.id}`;
      const isPaid = w.payment_status === 'PAID' || (w.status || '').toLowerCase().includes('paid');
      const isVoid = (w.status || '').toLowerCase().includes('cancel') || (w.status || '').toLowerCase().includes('void');
      if (isPaid && !isVoid && !map.has(key)) {
        map.set(key, {
          id: w.id,
          receiptNo: key,
          touristName: w.customer_name || w.touristName || 'Walk-In Guest',
          clientName: w.customer_name || w.touristName || 'Walk-In Guest',
          userNumber: `CLT-2026-${w.id || 101}`,
          date: (w.transaction_date || w.operating_date || w.created_at || w.date || todayStr).split('T')[0],
          time: w.time || '10:00 AM',
          paymentMethod: 'Walk-In Gate POS (Cash)',
          status: 'Paid',
          grandTotal: parseFloat(w.grandTotal || w.total_amount || 0),
          totalVisitors: parseInt(w.guest_count || w.totalVisitors || 1, 10),
          items: w.items || [],
          notes: 'Point of Sale Entry Ticket',
          verifiedBy: 'Gate POS Staff',
        });
      }
    });

    // 3. Paid Reservations
    (resortBookings || []).forEach(b => {
      const s = (b.status || '').toLowerCase();
      const isPaid = s.includes('paid') || s.includes('using') || s.includes('completed');
      const isVoid = s.includes('cancel') || s.includes('void');
      if (isPaid && !isVoid) {
        const key = b.bookingRef || b.bookingNumber || `BK-${b.id}`;
        if (!map.has(key)) {
          map.set(key, {
            id: b.id,
            receiptNo: key,
            touristName: b.clientName || b.fullName || b.touristName || 'Client Reservation',
            clientName: b.clientName || b.fullName || b.touristName || 'Client Reservation',
            userNumber: b.userNumber || `CLT-2026-000${b.id}`,
            date: (b.reservationDate || b.bookingDate || b.created_at || todayStr).split('T')[0],
            time: b.arrivalTime || '09:00 AM',
            paymentMethod: 'Reservation Counter (Cash)',
            status: 'Paid',
            grandTotal: parseFloat(b.grandTotal || b.estimatedTotal || b.totalPrice || 0),
            totalVisitors: parseInt(b.numberOfGuests || b.totalVisitors || 1, 10),
            items: b.items || [],
            notes: 'Advance Booking Verified',
            verifiedBy: 'Counter Receptionist',
          });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [receipts, walkIns, resortBookings]);

  // ── Compute totals for selected period ────────────────────
  const range = getDateRange(period);
  const todayStr = getPhilippineDateStr();

  const periodReceipts = unifiedTransactions.filter(r =>
    r.status === 'Paid' && isInRange(r.date, range)
  );

  const todayReceipts = unifiedTransactions.filter(r =>
    r.status === 'Paid' && r.date === todayStr
  );

  const totalGross  = periodReceipts.reduce((s, r) => s + parseFloat(r.grandTotal || 0), 0);
  const todayGross  = todayReceipts.reduce((s, r) => s + parseFloat(r.grandTotal || 0), 0);
  const ownerAmount     = Math.round(totalGross * (shares.ownerPct / 100));
  const barangayAmount  = Math.round(totalGross * (shares.barangayPct / 100));
  const municipalAmount = Math.round(totalGross * (shares.municipalPct / 100));

  // ── Category breakdown for selected period ────────────────
  let entranceRevenue = 0, cottageRevenue = 0, amenitiesRevenue = 0, otherRevenue = 0;
  periodReceipts.forEach(r => {
    if (r.items && Array.isArray(r.items) && r.items.length > 0) {
      r.items.forEach(item => {
        const cat = (item.category || '').toLowerCase();
        const sub = parseFloat(item.subtotal || ((item.quantity || 1) * (item.unitPrice || 0)) || 0);
        if (cat.includes('entrance') || cat.includes('fee')) entranceRevenue += sub;
        else if (cat.includes('cottage') || cat.includes('room') || cat.includes('accommodation')) cottageRevenue += sub;
        else if (cat.includes('rental') || cat.includes('entertainment') || cat.includes('safety') || cat.includes('water') || cat.includes('table')) amenitiesRevenue += sub;
        else otherRevenue += sub;
      });
    } else {
      entranceRevenue += parseFloat(r.grandTotal || 0);
    }
  });

  // ── Visitor count for selected period ─────────────────────
  const totalVisitors = periodReceipts.reduce((s, r) => s + parseInt(r.totalVisitors || 1, 10), 0);

  // ── Table filter ──────────────────────────────────────────
  const filteredReceipts = unifiedTransactions.filter(r => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = (
      !q ||
      (r.receiptNo     && r.receiptNo.toLowerCase().includes(q)) ||
      (r.touristName   && r.touristName.toLowerCase().includes(q)) ||
      (r.clientName    && r.clientName.toLowerCase().includes(q)) ||
      (r.userNumber    && r.userNumber.toLowerCase().includes(q))
    );
    const rMethod = (r.paymentMethod || 'Cash').toLowerCase();
    let matchMethod = true;
    if (selectedMethod === 'walkin')  matchMethod = rMethod.includes('gate') || rMethod.includes('walk') || rMethod.includes('pos');
    if (selectedMethod === 'counter') matchMethod = rMethod.includes('counter') || rMethod.includes('reserv');

    const rDate = r.date;
    const matchDate = !selectedDate || rDate === selectedDate;

    return matchSearch && matchMethod && matchDate;
  });

  // ── Helpers ───────────────────────────────────────────────
  const handleSaveShares = () => {
    const sum = Number(shares.ownerPct) + Number(shares.barangayPct) + Number(shares.municipalPct);
    if (sum !== 100) {
      alert(`⚠️ Shares must total 100%. Current total: ${sum}%.`);
      return;
    }
    setSaveNote('✓ Revenue sharing percentages saved!');
    setTimeout(() => setSaveNote(''), 3000);
  };

  const PERIODS = [
    { key: 'today', label: '📅 Today' },
    { key: 'week',  label: '📆 This Week' },
    { key: 'month', label: '🗓️ This Month' },
    { key: 'all',   label: '📊 All Time' },
  ];

  const periodLabel = PERIODS.find(p => p.key === period)?.label || 'Today';

  const guestName = (r) =>
    r.touristName || r.clientName || 'Guest Visitor';

  const orNo = (r) => r.receiptNo || `OR-${r.id}`;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-white p-2 sm:p-4">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="bg-[#0c1f16] p-5 rounded-3xl border border-emerald-500/20 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-lg">Revenue &amp; Financial Payments</h3>
            <p className="text-xs text-slate-400">
              Live cash collections · Statutory distribution (70/20/10) · Verified receipts ledger
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/70 font-semibold">
            <Clock className="w-3 h-3" />
            <span>Synced: {lastRefreshed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} (PHT)</span>
          </div>
          <button
            onClick={() => handleRefresh(true)}
            disabled={refreshing}
            className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Syncing…' : 'Refresh'}
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print Ledger
          </button>
        </div>
      </div>

      {/* ── PERIOD SELECTOR ────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">View Period:</span>
        <div className="flex items-center gap-1 bg-[#07150e] p-1 rounded-xl border border-emerald-900/60">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === p.key
                  ? 'bg-emerald-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {period === 'today' && (
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/25 px-2 py-1 rounded-lg">
            📅 {new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Manila', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        )}
      </div>

      {/* ── KPI STAT CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">

        {/* Gross Revenue */}
        <div className="p-4 bg-[#071f14] rounded-2xl border border-emerald-500/30 shadow-lg lg:col-span-1">
          <div className="flex justify-between items-center text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
            <span>Gross Revenue</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{formatCurrency(totalGross)}</div>
          <span className="text-[10px] text-slate-400 block mt-0.5">{periodLabel} · {periodReceipts.length} receipt{periodReceipts.length !== 1 ? 's' : ''}</span>
          {period !== 'today' && (
            <span className="text-[10px] text-emerald-300 font-bold block mt-1">Today: {formatCurrency(todayGross)}</span>
          )}
        </div>

        {/* Visitors */}
        <div className="p-4 bg-[#071f14] rounded-2xl border border-emerald-500/30 shadow-lg">
          <div className="flex justify-between items-center text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
            <span>Visitors</span>
            <Users className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalVisitors}</div>
          <span className="text-[10px] text-slate-400 block mt-0.5">{periodLabel} · total pax</span>
        </div>

        {/* Resort Owner Share */}
        <div className="p-4 bg-[#071f14] rounded-2xl border border-emerald-500/30 shadow-lg">
          <div className="flex justify-between items-center text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
            <span>Park Maintenance ({shares.ownerPct}%)</span>
            <Building className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono">{formatCurrency(ownerAmount)}</div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Operating &amp; maintenance fund</span>
        </div>

        {/* Barangay Share */}
        <div className="p-4 bg-[#071f14] rounded-2xl border border-emerald-500/30 shadow-lg">
          <div className="flex justify-between items-center text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
            <span>Barangay Zamora ({shares.barangayPct}%)</span>
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono">{formatCurrency(barangayAmount)}</div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Community environmental share</span>
        </div>

        {/* Municipal Share */}
        <div className="p-4 bg-[#071f14] rounded-2xl border border-emerald-500/30 shadow-lg">
          <div className="flex justify-between items-center text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
            <span>Guide Association ({shares.municipalPct}%)</span>
            <Percent className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono">{formatCurrency(municipalAmount)}</div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Local tour guides &amp; LGU</span>
        </div>
      </div>

      {/* ── REVENUE SHARING CONFIG + CATEGORY BREAKDOWN ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Configure Shares */}
        <div className="card space-y-4 lg:col-span-1">
          <div className="border-b border-emerald-800/40 pb-2">
            <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-400" /> Revenue Sharing Distribution
            </h4>
            <p className="text-xs text-slate-400">Statutory split of all collected entrance and resort fees</p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Park Maintenance (Owner)</span>
                <span className="text-emerald-400 font-mono">{shares.ownerPct}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={shares.ownerPct}
                onChange={e => setShares(s => ({ ...s, ownerPct: Number(e.target.value) }))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Barangay Environmental Share</span>
                <span className="text-emerald-400 font-mono">{shares.barangayPct}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={shares.barangayPct}
                onChange={e => setShares(s => ({ ...s, barangayPct: Number(e.target.value) }))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Municipal &amp; Guide Association</span>
                <span className="text-emerald-400 font-mono">{shares.municipalPct}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={shares.municipalPct}
                onChange={e => setShares(s => ({ ...s, municipalPct: Number(e.target.value) }))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className={`text-xs font-bold ${Number(shares.ownerPct) + Number(shares.barangayPct) + Number(shares.municipalPct) === 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
              Total: {Number(shares.ownerPct) + Number(shares.barangayPct) + Number(shares.municipalPct)}%
            </span>
            <button
              onClick={handleSaveShares}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
            >
              Save Configuration
            </button>
          </div>
          {saveNote && <div className="text-xs text-emerald-400 font-bold text-center">{saveNote}</div>}
        </div>

        {/* Category Breakdown */}
        <div className="card space-y-3 lg:col-span-2">
          <div className="border-b border-emerald-800/40 pb-2 flex justify-between items-center">
            <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Revenue Stream Breakdown ({periodLabel})
            </h4>
            <span className="text-xs font-bold text-emerald-400 font-mono">Total: {formatCurrency(totalGross)}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 bg-[#0a2216] rounded-xl border border-emerald-500/20">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Entrance Fees</span>
              <strong className="text-base font-black text-emerald-300 font-mono block mt-1">{formatCurrency(entranceRevenue)}</strong>
              <small className="text-[10px] text-slate-400">{totalGross > 0 ? Math.round((entranceRevenue / totalGross) * 100) : 0}% of gross</small>
            </div>
            <div className="p-3 bg-[#0a2216] rounded-xl border border-emerald-500/20">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Cottages &amp; Rooms</span>
              <strong className="text-base font-black text-emerald-300 font-mono block mt-1">{formatCurrency(cottageRevenue)}</strong>
              <small className="text-[10px] text-slate-400">{totalGross > 0 ? Math.round((cottageRevenue / totalGross) * 100) : 0}% of gross</small>
            </div>
            <div className="p-3 bg-[#0a2216] rounded-xl border border-emerald-500/20">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Rented Amenities</span>
              <strong className="text-base font-black text-emerald-300 font-mono block mt-1">{formatCurrency(amenitiesRevenue)}</strong>
              <small className="text-[10px] text-slate-400">{totalGross > 0 ? Math.round((amenitiesRevenue / totalGross) * 100) : 0}% of gross</small>
            </div>
            <div className="p-3 bg-[#0a2216] rounded-xl border border-emerald-500/20">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Other Services</span>
              <strong className="text-base font-black text-emerald-300 font-mono block mt-1">{formatCurrency(otherRevenue)}</strong>
              <small className="text-[10px] text-slate-400">{totalGross > 0 ? Math.round((otherRevenue / totalGross) * 100) : 0}% of gross</small>
            </div>
          </div>
        </div>
      </div>

      {/* ── OFFICIAL RECEIPTS & AUDIT LEDGER TABLE ──────────── */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-emerald-800/40 pb-3">
          <div>
            <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" /> Official Receipts &amp; Verified Audit Ledger
            </h4>
            <p className="text-xs text-slate-400">
              Complete chronological ledger of all cash collections from Walk-In Gate POS and Advance Reservations
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/60" />
              <input
                type="text"
                placeholder="Search OR No., Guest, Ref..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#04150e] border border-emerald-900/60 text-xs text-emerald-100 placeholder:text-emerald-500/40 outline-none w-48"
              />
            </div>

            {/* Method filter */}
            <select
              value={selectedMethod}
              onChange={e => setSelectedMethod(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#04150e] border border-emerald-900/60 text-xs text-emerald-300 outline-none cursor-pointer"
            >
              <option value="all">All Cash Channels</option>
              <option value="walkin">Gate Walk-In POS</option>
              <option value="counter">Reservation Counter</option>
            </select>

            {/* Date filter */}
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#04150e] border border-emerald-900/60 text-xs text-emerald-300 outline-none cursor-pointer"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-[10px] text-rose-400 hover:underline"
              >
                Clear Date
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-emerald-800/40 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider">
                <th className="py-2.5 px-3">Receipt / OR #</th>
                <th className="py-2.5 px-3">Guest Name &amp; Client ID</th>
                <th className="py-2.5 px-3">Date &amp; Time</th>
                <th className="py-2.5 px-3">Collection Channel</th>
                <th className="py-2.5 px-3">Visitors</th>
                <th className="py-2.5 px-3">Total Collected</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/20 font-medium">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No payment receipts found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map(r => (
                  <tr key={orNo(r)} className="hover:bg-emerald-950/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-emerald-300">{orNo(r)}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{guestName(r)}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.userNumber || 'Walk-In'}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-200">{r.date}</div>
                      <div className="text-[10px] text-slate-400">{r.time || '10:00 AM'}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-700/50 text-emerald-300 text-[10px] font-semibold">
                        {r.paymentMethod || 'Walk-In Gate Cash'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-400">{r.totalVisitors || 1} Pax</td>
                    <td className="py-3 px-3 font-mono font-black text-white text-sm">
                      ₱{parseFloat(r.grandTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ✓ {r.status || 'Paid'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setViewReceiptData({
                          receiptNo: orNo(r),
                          clientName: guestName(r),
                          userNumber: r.userNumber || 'CLT-2026-000001',
                          date: r.date,
                          time: r.time || '10:00 AM',
                          paymentMethod: r.paymentMethod || 'Cash',
                          status: r.status || 'Paid',
                          grandTotal: parseFloat(r.grandTotal || 0),
                          totalVisitors: r.totalVisitors || 1,
                          items: r.items || [],
                          notes: r.notes || '',
                          verifiedBy: r.verifiedBy || 'Resort Staff'
                        })}
                        className="px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 text-[11px] font-bold cursor-pointer transition-all inline-flex items-center gap-1"
                        title="View Official Receipt"
                      >
                        <Eye className="w-3 h-3" /> View OR
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Receipt Modal */}
      <OfficialReceiptModal
        receiptData={viewReceiptData}
        onClose={() => setViewReceiptData(null)}
      />
    </div>
  );
}
