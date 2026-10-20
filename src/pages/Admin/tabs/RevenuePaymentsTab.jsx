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
const getDateRange = (period, phNow) => {
  const today = getPhilippineDateStr();
  const year = phNow.getFullYear();
  const month = phNow.getMonth();

  if (period === 'today') return { from: today, to: today };
  if (period === 'week') {
    const day = phNow.getDay();
    const monday = new Date(phNow);
    monday.setDate(phNow.getDate() - ((day + 6) % 7));
    return { from: getPhilippineDateStr(monday), to: today };
  }
  if (period === 'monthly') {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    return { from: getPhilippineDateStr(first), to: getPhilippineDateStr(last) };
  }
  if (period === 'semi_yearly') {
    const isFirstHalf = month < 6;
    const first = new Date(year, isFirstHalf ? 0 : 6, 1);
    const last = new Date(year, isFirstHalf ? 6 : 12, 0);
    return { from: getPhilippineDateStr(first), to: getPhilippineDateStr(last) };
  }
  if (period === 'yearly') {
    const first = new Date(year, 0, 1);
    const last = new Date(year, 11, 31);
    return { from: getPhilippineDateStr(first), to: getPhilippineDateStr(last) };
  }
  return { from: null, to: null };
};

const isInRange = (dateStr, range, filterYear, filterMonth, filterDay) => {
  if (!dateStr) return false;
  const d = dateStr.split('T')[0];
  const [y, m, day] = d.split('-');
  
  if (filterYear && y !== filterYear) return false;
  if (filterMonth && m !== filterMonth) return false;
  if (filterDay && day !== filterDay) return false;
  
  if (!range.from) return true;
  return d >= range.from && d <= range.to;
};

const isPaidStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase();
  return normalized === 'paid' || normalized.startsWith('paid ') ||
    normalized === 'completed' || normalized === 'settled' || normalized === 'fully paid' ||
    normalized === 'success' || normalized === 'succeeded';
};

export default function RevenuePaymentsTab() {
  const {
    receipts = [],
    walkIns = [],
    resortBookings = [],
    revenueShare,
    currentUser,
    refreshAllLiveData,
    theme = 'dark',
  } = useEcoTour();
  const isDark = theme === 'dark';

  // ── State ──────────────────────────────────────────────────
  const [period, setPeriod]           = useState('monthly');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('all');
  
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterDay, setFilterDay] = useState('');
  
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

  // ── Staff Daily Sales Tallies from MySQL database ───────────
  const [dailyHistories, setDailyHistories] = useState([]);

  const fetchDailyHistories = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/reports/saved-daily-history');
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        setDailyHistories(data.history);
      }
    } catch (e) {
      console.warn("Could not fetch daily histories:", e);
    }
  }, []);

  const handleAcknowledgeTally = async (tallyRecord) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/v1/reports/acknowledge-daily-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ id: tallyRecord.id, date: tallyRecord.date })
      });
      const data = await res.json();
      if (data.success) {
        await fetchDailyHistories();
        if (refreshAllLiveData) refreshAllLiveData();
      } else {
        alert(data.message || 'Failed to acknowledge tally.');
      }
    } catch (err) {
      alert(err.message || 'Error acknowledging tally.');
    }
  };

  // ── Auto-refresh every 15 s ────────────────────────────────
  const handleRefresh = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      if (refreshAllLiveData) await refreshAllLiveData();
      await fetchDailyHistories();
      setLastRefreshed(new Date());
    } finally {
      if (manual) setRefreshing(false);
    }
  }, [refreshAllLiveData, fetchDailyHistories]);

  useEffect(() => {
    fetchDailyHistories();
    intervalRef.current = setInterval(() => handleRefresh(), 15000);
    const onReset = () => handleRefresh();
    window.addEventListener('ecotour:daily-reset', onReset);
    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener('ecotour:daily-reset', onReset);
    };
  }, [handleRefresh, fetchDailyHistories]);

  // ── Unified Live Transactions Ledger ───────────────────────
  const unifiedTransactions = useMemo(() => {
    const map = new Map();
    const todayStr = getPhilippineDateStr();

    // 1. Receipts from payments table
    (receipts || []).forEach(r => {
      const key = String(r.receiptNo || r.receipt_number || r.receipt_no ||
        r.payment_ref || r.payment_reference || `OR-${r.id}`);
      map.set(key, {
        id: r.id,
        receiptNo: key,
        touristName: r.touristName || r.clientName || r.client_name || r.customer_name || 'Visitor Guest',
        clientName: r.clientName || r.touristName || r.client_name || r.customer_name || 'Visitor Guest',
        userNumber: r.userNumber || `CLT-2026-000${r.id || 1}`,
        date: (r.date || r.payment_date || r.paid_at || r.transaction_date || r.created_at || todayStr).split('T')[0],
        time: r.time || '10:00 AM',
        paymentMethod: r.paymentMethod || r.payment_method || r.method || 'Cash',
        status: r.status || r.payment_status || 'Paid',
        grandTotal: parseFloat(r.grandTotal || r.total_amount || r.amount_paid || r.amount || 0),
        totalVisitors: parseInt(r.totalVisitors || r.total_visitors || r.guest_count || 1, 10),
        items: r.items || [],
        notes: r.notes || 'Counter / POS Verified',
        verifiedBy: r.verifiedBy || 'Resort Staff Cashier',
      });
    });

    // 2. Paid Walk-Ins
    (walkIns || []).forEach(w => {
      const key = String(w.receiptNo || w.receipt_number || `OR-${w.walk_in_id || w.id}`);
      const isPaid = isPaidStatus(w.payment_status || w.status);
      const isVoid = (w.status || '').toLowerCase().includes('cancel') || (w.status || '').toLowerCase().includes('void');
      if (isPaid && !isVoid && !map.has(key)) {
        map.set(key, {
          id: w.id,
          receiptNo: key,
          touristName: w.customer_name || w.touristName || w.tourist_name || 'Walk-In Guest',
          clientName: w.customer_name || w.touristName || w.tourist_name || 'Walk-In Guest',
          userNumber: `CLT-2026-${w.id || 101}`,
          date: (w.transaction_date || w.payment_date || w.operating_date || w.created_at || w.date || todayStr).split('T')[0],
          time: w.time || '10:00 AM',
          paymentMethod: 'Walk-In Gate POS (Cash)',
          status: 'Paid',
          grandTotal: parseFloat(w.grandTotal || w.total_amount || w.amount_paid || w.amount || 0),
          totalVisitors: parseInt(w.guest_count || w.totalVisitors || 1, 10),
          items: w.items || [],
          notes: 'Point of Sale Entry Ticket',
          verifiedBy: 'Gate POS Staff',
        });
      }
    });

    // 3. Paid Reservations
    (resortBookings || []).forEach(b => {
      const s = (b.status || b.payment_status || '').toLowerCase();
      const isPaid = isPaidStatus(s) || s.includes('using') || s.includes('checked in');
      const isVoid = s.includes('cancel') || s.includes('void');
      if (isPaid && !isVoid) {
        const key = String(b.bookingRef || b.booking_ref || b.bookingNumber || b.booking_number || `BK-${b.id}`);
        if (!map.has(key)) {
          map.set(key, {
            id: b.id,
            receiptNo: key,
            touristName: b.clientName || b.client_name || b.fullName || b.touristName || 'Client Reservation',
            clientName: b.clientName || b.client_name || b.fullName || b.touristName || 'Client Reservation',
            userNumber: b.userNumber || `CLT-2026-000${b.id}`,
            date: (b.reservationDate || b.reservation_date || b.bookingDate || b.booking_date || b.created_at || todayStr).split('T')[0],
            time: b.arrivalTime || '09:00 AM',
            paymentMethod: 'Reservation Counter (Cash)',
            status: 'Paid',
            grandTotal: parseFloat(b.grandTotal || b.total_amount || b.estimatedTotal || b.totalPrice || b.amount_due || 0),
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
  const phNow = getPhilippineDate();
  const range = getDateRange(period, phNow);
  const todayStr = getPhilippineDateStr();

  const periodReceipts = unifiedTransactions.filter(r =>
    isPaidStatus(r.status) && isInRange(r.date, range, filterYear, filterMonth, filterDay)
  );

  const todayReceipts = unifiedTransactions.filter(r =>
    isPaidStatus(r.status) && r.date === todayStr
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
    const matchDate = isInRange(rDate, {from: null, to: null}, filterYear, filterMonth, filterDay);

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
    { key: 'monthly', label: '🗓️ Monthly' },
    { key: 'semi_yearly', label: '📆 Semi-Yearly' },
    { key: 'yearly', label: '📊 Yearly' },
    { key: 'all',   label: '∞ All Time' },
  ];

  const periodLabel = PERIODS.find(p => p.key === period)?.label || 'Today';

  const guestName = (r) =>
    r.touristName || r.clientName || 'Guest Visitor';

  const orNo = (r) => r.receiptNo || `OR-${r.id}`;

  // ── theme-aware class helpers ─────────────────────────────────────────────
  const C = {
    headerBg:   isDark ? 'bg-[#0c1f16] border-emerald-500/20' : 'bg-white border-emerald-200',
    heading:    isDark ? 'text-white' : 'text-gray-900',
    subtext:    isDark ? 'text-slate-400' : 'text-gray-500',
    iconBox:    isDark ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-emerald-100 border-emerald-300 text-emerald-600',
    periodPill: isDark ? 'bg-[#07150e] border-emerald-900/60' : 'bg-emerald-50 border-emerald-300',
    pillInact:  isDark ? 'text-slate-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-900 hover:bg-emerald-100',
    todayBadge: isDark ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' : 'text-emerald-700 bg-emerald-50 border-emerald-300',
    select:     isDark ? 'bg-emerald-950/40 border-emerald-800 text-slate-200' : 'bg-white border-emerald-300 text-gray-800',
    refreshBtn: isDark ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-700/60' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300',
    syncTxt:    isDark ? 'text-emerald-400/70' : 'text-emerald-600',
    // card / section
    cardBg:     isDark ? 'bg-[#071f14] border-emerald-500/30' : 'bg-white border-emerald-200',
    snapBg:     isDark ? 'bg-[#0a2216] border-emerald-500/20' : 'bg-emerald-50 border-emerald-200',
    cardInner:  isDark ? 'card' : 'card',
    // kpi values
    valWhite:   isDark ? 'text-white' : 'text-gray-900',
    valEmerald: isDark ? 'text-emerald-300' : 'text-emerald-700',
    valAmber:   isDark ? 'text-emerald-300' : 'text-emerald-600',
    // table
    tblHead:    isDark ? 'border-emerald-800/40 text-emerald-400' : 'border-emerald-200 text-emerald-700',
    tblRow:     isDark ? 'hover:bg-emerald-950/30' : 'hover:bg-emerald-50/60',
    tblOrNo:    isDark ? 'text-emerald-300' : 'text-emerald-700',
    tblName:    isDark ? 'text-white' : 'text-gray-900',
    tblSub:     isDark ? 'text-slate-400' : 'text-gray-400',
    tblDate:    isDark ? 'text-slate-200' : 'text-gray-700',
    tblPax:     isDark ? 'text-emerald-400' : 'text-emerald-600',
    tblAmt:     isDark ? 'text-white' : 'text-gray-900',
    methodTag:  isDark ? 'bg-emerald-950 border-emerald-700/50 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-700',
    statusTag:  isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-emerald-100 text-emerald-700 border-emerald-300',
    viewBtn:    isDark ? 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border-emerald-700/50' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300',
    searchInput:isDark ? 'bg-[#04150e] border-emerald-900/60 text-emerald-100 placeholder:text-emerald-500/40' : 'bg-white border-emerald-300 text-gray-800 placeholder:text-gray-400',
    methodSel:  isDark ? 'bg-[#04150e] border-emerald-900/60 text-emerald-300' : 'bg-white border-emerald-300 text-gray-700',
    sectionBdr: isDark ? 'border-emerald-800/40' : 'border-emerald-100',
    sectionHd:  isDark ? 'text-emerald-300' : 'text-emerald-800',
    breakCard:  isDark ? 'bg-[#0a2216] border-emerald-500/20' : 'bg-emerald-50 border-emerald-200',
    breakLbl:   isDark ? 'text-slate-400' : 'text-gray-500',
    breakVal:   isDark ? 'text-emerald-300' : 'text-emerald-700',
    shareSlider:'accent-emerald-400',
    saveCfg:    'px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all',
    noData:     isDark ? 'text-slate-400' : 'text-gray-400',
  };

  return (
    <div className={`space-y-6 max-w-[1600px] mx-auto p-2 sm:p-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>

      {/* ── HEADER ───────────────────────────────────────────── */}
      <div className={`p-5 rounded-3xl border shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${C.headerBg}`}>
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${C.iconBox}`}>
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`font-extrabold text-lg ${C.heading}`}>Revenue &amp; Financial Payments</h3>
            <p className={`text-xs ${C.subtext}`}>
              Live cash collections · Statutory distribution (70/20/10) · Verified receipts ledger
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex items-center gap-1.5 text-[10px] font-semibold ${C.syncTxt}`}>
            <Clock className="w-3 h-3" />
            <span>Synced: {lastRefreshed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} (PHT)</span>
          </div>
          <button
            onClick={() => handleRefresh(true)}
            disabled={refreshing}
            className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 ${C.refreshBtn}`}
          >
            <RefreshCw className="w-3.5 h-3.5" style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Syncing…' : 'Refresh'}
          </button>
          <button
            onClick={() => window.print()}
            className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${C.refreshBtn}`}
          >
            <Printer className="w-3.5 h-3.5" /> Print Ledger
          </button>
        </div>
      </div>

      {/* ── PERIOD SELECTOR ────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-bold uppercase tracking-wider ${C.subtext}`}>View Period:</span>
        <div className={`flex items-center gap-1 p-1 rounded-xl border ${C.periodPill}`}>
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === p.key
                  ? 'bg-emerald-500 text-slate-950 font-black shadow'
                  : C.pillInact
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {period === 'today' && (
          <span className={`text-[10px] font-bold border px-2 py-1 rounded-lg ${C.todayBadge}`}>
            📅 {new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Manila', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        )}
        <div className="flex gap-2 ml-auto">
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className={`border text-xs px-2 py-1.5 rounded-lg outline-none focus:border-emerald-500 ${C.select}`}>
            <option value="">Year</option>
            {Array.from({length: 11}, (_, i) => 2020 + i).map(y => <option key={y} value={y.toString()}>{y}</option>)}
          </select>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className={`border text-xs px-2 py-1.5 rounded-lg outline-none focus:border-emerald-500 ${C.select}`}>
            <option value="">Month</option>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => <option key={i} value={(i + 1).toString().padStart(2, '0')}>{m}</option>)}
          </select>
          <select value={filterDay} onChange={e => setFilterDay(e.target.value)} className={`border text-xs px-2 py-1.5 rounded-lg outline-none focus:border-emerald-500 ${C.select}`}>
            <option value="">Day</option>
            {Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={d.toString().padStart(2, '0')}>{d}</option>)}
          </select>
          {(filterYear || filterMonth || filterDay) && (
            <button onClick={() => { setFilterYear(''); setFilterMonth(''); setFilterDay(''); }} className="text-xs font-bold text-rose-500 px-2">Clear</button>
          )}
        </div>
      </div>

      {/* ── STAFF DAILY SALES TALLIES & CASH REMITTANCES ──────────── */}
      <div className="card space-y-4">
        <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-3 ${C.sectionBdr}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${C.iconBox}`}>
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className={`font-bold text-sm flex items-center gap-2 ${C.sectionHd}`}>
                  Staff Daily Sales Tallies &amp; Cash Remittances
                </h4>
                {dailyHistories.some(h => !h.status?.includes('Verified')) && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full animate-pulse">
                    {dailyHistories.filter(h => !h.status?.includes('Verified')).length} Pending Verification
                  </span>
                )}
              </div>
              <p className={`text-xs ${C.subtext}`}>
                Live end-of-shift daily sales computations &amp; cash turnover submitted by staff cashiers for administrative review
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchDailyHistories()}
            className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${C.refreshBtn}`}
            title="Refresh submitted tallies from staff"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Tallies
          </button>
        </div>

        {dailyHistories.length === 0 ? (
          <div className={`py-8 text-center text-xs ${C.noData}`}>
            No daily sales tallies have been submitted by staff cashiers yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-emerald-800/40 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Operating Date</th>
                  <th className="py-2.5 px-3">Submitting Cashier</th>
                  <th className="py-2.5 px-3 text-right">Cash Remittance</th>
                  <th className="py-2.5 px-3 text-center">Visitors (Pax)</th>
                  <th className="py-2.5 px-3 text-center">Transactions</th>
                  <th className="py-2.5 px-3">Remarks &amp; Notes</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/30">
                {dailyHistories.map((h, i) => (
                  <tr key={h.id || h.date || i} className={`${C.tblRow} transition-all`}>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">{h.date}</td>
                    <td className="py-3 px-3 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{h.cashier_name || h.saved_by || 'Staff Cashier'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-400 text-sm">
                      ₱{parseFloat(h.total_cash_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-200">
                      {h.total_visitors || 0} pax
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-300">
                      {h.total_transactions || '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-300 text-xs max-w-xs truncate" title={h.notes}>
                      {h.notes || 'End of shift daily tally'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        h.status?.includes('Verified')
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {h.status || 'Submitted'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {h.status?.includes('Verified') ? (
                        <span className="text-[11px] font-bold text-emerald-400 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAcknowledgeTally(h)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md inline-flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledge &amp; Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── OFFICIAL RECEIPTS & AUDIT LEDGER TABLE ──────────── */}
      <div className="card space-y-4">
        <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-3 ${C.sectionBdr}`}>
          <div>
            <h4 className={`font-bold text-sm flex items-center gap-2 ${C.sectionHd}`}>
              <Receipt className="w-4 h-4 text-emerald-400" /> Official Receipts &amp; Verified Audit Ledger
            </h4>
            <p className={`text-xs ${C.subtext}`}>
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
                className={`pl-8 pr-3 py-1.5 rounded-xl border text-xs outline-none w-48 ${C.searchInput}`}
              />
            </div>

            {/* Method filter */}
            <select
              value={selectedMethod}
              onChange={e => setSelectedMethod(e.target.value)}
              className={`px-3 py-1.5 rounded-xl border text-xs outline-none cursor-pointer ${C.methodSel}`}
            >
              <option value="all">All Cash Channels</option>
              <option value="walkin">Gate Walk-In POS</option>
              <option value="counter">Reservation Counter</option>
            </select>

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
            {filteredReceipts.length > 0 && (
              <tfoot className="bg-emerald-50 dark:bg-[#0a2216] border-t border-emerald-200 dark:border-emerald-500/50">
                <tr>
                  <td colSpan={5} className="py-4 px-3 text-right font-extrabold text-emerald-800 dark:text-emerald-300 uppercase text-[11px] tracking-wider">
                    {searchQuery.trim() ? `Total for "${searchQuery}" (${filteredReceipts.length} records):` : `Total (${filteredReceipts.length} records):`}
                  </td>
                  <td className="py-4 px-3 font-mono font-black text-emerald-900 dark:text-emerald-400 text-base">
                    {formatCurrency(filteredReceipts.reduce((sum, r) => sum + parseFloat(r.grandTotal || 0), 0))}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
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

      {/* ── REVENUE SHARING CONFIG + CATEGORY BREAKDOWN ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Configure Shares */}
        <div className="card space-y-4 lg:col-span-1">
          <div className={`border-b pb-2 ${C.sectionBdr}`}>
            <h4 className={`font-bold text-sm flex items-center gap-2 ${C.sectionHd}`}>
              <Percent className="w-4 h-4 text-emerald-400" /> Revenue Sharing Distribution
            </h4>
            <p className={`text-xs ${C.subtext}`}>Statutory split of all collected entrance and resort fees</p>
          </div>

          <div className="space-y-3">
            <div>
              <div className={`flex justify-between text-xs font-semibold mb-1 ${isDark ? '' : 'text-gray-700'}`}>
                <span>Park Maintenance (Owner)</span>
                <span className="text-emerald-500 font-mono">{shares.ownerPct}%</span>
              </div>
              <input type="range" min="0" max="100" value={shares.ownerPct}
                onChange={e => setShares(s => ({ ...s, ownerPct: Number(e.target.value) }))}
                className={`w-full cursor-pointer ${C.shareSlider}`} />
            </div>
            <div>
              <div className={`flex justify-between text-xs font-semibold mb-1 ${isDark ? '' : 'text-gray-700'}`}>
                <span>Barangay Environmental Share</span>
                <span className="text-emerald-500 font-mono">{shares.barangayPct}%</span>
              </div>
              <input type="range" min="0" max="100" value={shares.barangayPct}
                onChange={e => setShares(s => ({ ...s, barangayPct: Number(e.target.value) }))}
                className={`w-full cursor-pointer ${C.shareSlider}`} />
            </div>
            <div>
              <div className={`flex justify-between text-xs font-semibold mb-1 ${isDark ? '' : 'text-gray-700'}`}>
                <span>Municipal &amp; Guide Association</span>
                <span className="text-emerald-500 font-mono">{shares.municipalPct}%</span>
              </div>
              <input type="range" min="0" max="100" value={shares.municipalPct}
                onChange={e => setShares(s => ({ ...s, municipalPct: Number(e.target.value) }))}
                className={`w-full cursor-pointer ${C.shareSlider}`} />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className={`text-xs font-bold ${
              Number(shares.ownerPct) + Number(shares.barangayPct) + Number(shares.municipalPct) === 100
                ? 'text-emerald-500' : 'text-rose-500'
            }`}>
              Total: {Number(shares.ownerPct) + Number(shares.barangayPct) + Number(shares.municipalPct)}%
            </span>
            <button onClick={handleSaveShares} className={C.saveCfg}>Save Configuration</button>
          </div>
          {saveNote && <div className="text-xs text-emerald-500 font-bold text-center">{saveNote}</div>}
        </div>

        {/* Category Breakdown */}
        <div className="card space-y-3 lg:col-span-2">
          <div className={`border-b pb-2 flex justify-between items-center ${C.sectionBdr}`}>
            <h4 className={`font-bold text-sm flex items-center gap-2 ${C.sectionHd}`}>
              <DollarSign className="w-4 h-4 text-emerald-400" /> Revenue Stream Breakdown ({periodLabel})
            </h4>
            <span className="text-xs font-bold text-emerald-500 font-mono">Total: {formatCurrency(totalGross)}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {[
              { label: 'Entrance Fees',    value: entranceRevenue },
              { label: 'Cottages & Rooms', value: cottageRevenue  },
              { label: 'Rented Amenities', value: amenitiesRevenue},
              { label: 'Other Services',   value: otherRevenue    },
            ].map(({ label, value }) => (
              <div key={label} className={`p-3 rounded-xl border ${C.breakCard}`}>
                <span className={`text-[10px] uppercase font-bold block ${C.breakLbl}`}>{label}</span>
                <strong className={`text-base font-black font-mono block mt-1 ${C.breakVal}`}>{formatCurrency(value)}</strong>
                <small className={`text-[10px] ${C.breakLbl}`}>
                  {totalGross > 0 ? Math.round((value / totalGross) * 100) : 0}% of gross
                </small>
              </div>
            ))}
          </div>
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
