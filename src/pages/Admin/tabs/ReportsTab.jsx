import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  AreaChart, Area, ComposedChart, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import {
  DollarSign, Activity, FileText, Users,
  BarChart3, PieChart as PieIcon, Printer, RefreshCw, Search, Clock,
  User, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';
import { apiJson } from '../../../utils/catalog';
import { getPhilippineDateStr } from '../../../utils/phTime';
import './ReportsTab.css';

// ─────────────── helpers ───────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return 'G';
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const isPaidStatus = (s) => {
  const v = String(s || '').trim().toLowerCase();
  return v === 'paid' || v.startsWith('paid ') || v === 'completed' ||
    v === 'settled' || v === 'fully paid' || v === 'success' ||
    v === 'succeeded' || v.includes('checked in') || v.includes('using');
};

const isCancelledStatus = (s) => /cancel|void|reject|expire/i.test(String(s || ''));

const asAmount = (...vals) => {
  const v = vals.find(x => x !== undefined && x !== null && x !== '');
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const recordTokens = (r) =>
  [r.receiptNo, r.receipt_no, r.receipt_number, r.payment_ref,
    r.payment_reference, r.bookingRef, r.booking_ref,
    r.bookingNumber, r.booking_number, r.booking_id, r.reservation_id]
    .filter(x => x !== undefined && x !== null && x !== '')
    .map(x => String(x).trim().toLowerCase());

// Safe category resolver that handles arrays, JSON strings, or fallback text
const resolveCategory = (record) => {
  try {
    let items = record?.items;
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch {
        items = [];
      }
    }
    if (Array.isArray(items) && items.some(it => /cottage|room|kubo/i.test(it?.name || ''))) {
      return 'Accommodation';
    }
    const label = `${record?.serviceName || ''} ${record?.packageName || ''} ${record?.specificType || ''} ${record?.category || ''}`;
    if (/cottage|room|kubo/i.test(label)) {
      return 'Accommodation';
    }
  } catch (err) {
    console.warn('resolveCategory fallback:', err);
  }
  return 'Resort Services';
};

const fmt = (val) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Sub-Tab definitions
const SUB_TABS = [
  { key: 'graphical',    label: 'Graphical Reports',        icon: BarChart3 },
  { key: 'ledger',       label: 'Transaction Ledger',       icon: FileText },
];

// Timeframe period filters
const PERIODS = [
  { key: 'today',       label: 'Today',        icon: '📅' },
  { key: 'weekly',      label: 'This Week',    icon: '📆' },
  { key: 'monthly',     label: 'Monthly',      icon: '📊' },
  { key: 'semi-yearly', label: 'Semi-Yearly',  icon: '📈' },
  { key: 'yearly',      label: 'Yearly',       icon: '🌐' },
];

const CATEGORY_COLORS = ['#22c55e', '#38bdf8', '#fbbf24', '#a855f7', '#f43f5e', '#14b8a6'];

export default function ReportsTab() {
  const { resortBookings = [], receipts = [], walkIns = [], userAccounts = [], theme = 'dark', refreshAllLiveData } = useEcoTour();
  const isDark = theme === 'dark';

  const todayStr     = getPhilippineDateStr();
  const currentYear  = todayStr.slice(0, 4);
  const currentMonth = todayStr.slice(5, 7);

  // Active Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState('graphical');

  // Timeframe filter state
  const [period,       setPeriod]       = useState('monthly');
  const [filterYear,   setFilterYear]   = useState(currentYear);
  const [filterMonth,  setFilterMonth]  = useState(currentMonth);
  const [filterHalf,   setFilterHalf]   = useState('1'); // '1' = Jan-Jun, '2' = Jul-Dec
  const [refreshing,   setRefreshing]   = useState(false);

  // Damages & Inspections from Server
  const [damages,      setDamages]      = useState([]);
  const [inspections,  setInspections]  = useState([]);
  const [damageError,  setDamageError]  = useState('');

  // Search & Pagination in Ledger
  const [ledgerSearch, setLedgerSearch] = useState('');

  // ── Load damages & inspections ──────────────────────────────────────────
  const fetchAuxData = async () => {
    try {
      const d = await apiJson('/damages', { auth: true });
      setDamages(d.reports || d.data?.reports || (Array.isArray(d.data) ? d.data : []));
    } catch (e) {
      setDamageError(e.message || 'Unable to load damage reports.');
    }

    try {
      const ins = await apiJson('/inspections', { auth: true });
      setInspections(ins.inspections || ins.data?.inspections || (Array.isArray(ins.data) ? ins.data : []));
    } catch (e) {
      console.warn('Inspections auxiliary note:', e.message);
    }
  };

  useEffect(() => {
    fetchAuxData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (refreshAllLiveData) await refreshAllLiveData();
    await fetchAuxData();
    setRefreshing(false);
  };

  // ── Lookup map for user accounts (to match client names, fname, mname, lname) ──
  const userMap = useMemo(() => {
    const map = new Map();
    userAccounts.forEach(u => {
      const uid = u.user_id || u.id;
      if (uid) map.set(String(uid), u);
      if (u.user_number) map.set(String(u.user_number).toLowerCase(), u);
      if (u.email) map.set(String(u.email).toLowerCase(), u);
      const fullName = `${u.fname || ''} ${u.mname || ''} ${u.lname || ''}`.trim().toLowerCase();
      if (fullName) map.set(fullName, u);
      const shortName = `${u.fname || ''} ${u.lname || ''}`.trim().toLowerCase();
      if (shortName) map.set(shortName, u);
      const revName = `${u.lname || ''} ${u.fname || ''}`.trim().toLowerCase();
      if (revName) map.set(revName, u);
    });
    return map;
  }, [userAccounts]);

  const enrichClientDetails = (r, defaultClient = 'Guest') => {
    const uid = r.user_id || r.userId || r.client_id;
    let u = uid ? userMap.get(String(uid)) : null;
    if (!u && (r.userNumber || r.user_number)) {
      u = userMap.get(String(r.userNumber || r.user_number).toLowerCase());
    }
    if (!u && (r.clientEmail || r.email || r.touristEmail)) {
      u = userMap.get(String(r.clientEmail || r.email || r.touristEmail).toLowerCase());
    }
    const rawClient = String(
      r.clientName || r.client_name || r.fullName || r.touristName ||
      r.tourist_name || r.customer_name || defaultClient
    ).trim();

    if (!u && rawClient && rawClient.toLowerCase() !== 'guest' && rawClient.toLowerCase() !== 'walk-in') {
      u = userMap.get(rawClient.toLowerCase());
    }

    let fname = u?.fname || r.fname || r.first_name || '';
    let mname = u?.mname || r.mname || r.middle_name || '';
    let lname = u?.lname || r.lname || r.last_name || '';

    if (!fname && !lname && rawClient) {
      const parts = rawClient.split(/\s+/);
      if (parts.length === 1) {
        fname = parts[0];
      } else if (parts.length === 2) {
        fname = parts[0];
        lname = parts[1];
      } else {
        fname = parts[0];
        mname = parts.slice(1, -1).join(' ');
        lname = parts[parts.length - 1];
      }
    }

    const clientDisplayName = u
      ? `${u.fname || ''} ${u.mname ? u.mname + ' ' : ''}${u.lname || ''}`.trim()
      : rawClient;

    const userNumber = u?.user_number || r.userNumber || r.user_number || '';
    const email = u?.email || r.clientEmail || r.email || r.touristEmail || '';
    const accountId = u?.user_id || u?.id || (userNumber ? String(userNumber).toLowerCase() : clientDisplayName.toLowerCase());

    return {
      client: clientDisplayName,
      fname,
      mname,
      lname,
      userNumber,
      email,
      accountId
    };
  };

  // ── Date filter boundaries ──────────────────────────────────────────────
  const dateFilter = useMemo(() => {
    switch (period) {
      case 'today':
        return { year: currentYear, month: currentMonth, day: todayStr.slice(8, 10), half: null };
      case 'weekly': {
        const now = new Date(todayStr);
        const dayOfWeek = now.getDay();
        const start = new Date(now);
        start.setDate(now.getDate() - dayOfWeek);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
      }
      case 'monthly':
        return { year: filterYear, month: filterMonth, day: null, half: null };
      case 'semi-yearly':
        return { year: filterYear, month: null, day: null, half: filterHalf };
      case 'yearly':
        return { year: filterYear, month: null, day: null, half: null };
      default:
        return { year: filterYear, month: null, day: null, half: null };
    }
  }, [period, filterYear, filterMonth, filterHalf, currentYear, currentMonth, todayStr]);

  // ── Flatten all transactions with category classification ───────────────
  const allTransactions = useMemo(() => {
    const txs = [];
    const paymentTokens = new Set();
    const paidAmountByToken = new Map();
    const bookingTokens = new Set();

    receipts.forEach(r => {
      const bookingRef = r.bookingRef || r.booking_ref || r.bookingNumber || r.booking_number || '';
      const receiptNo = r.receiptNo || r.receipt_no || r.receipt_number || r.payment_ref || `RC-${r.id}`;
      const displayKey = bookingRef || receiptNo;
      const date = (r.date || r.payment_date || r.paid_at || r.transaction_date || r.created_at || '').split('T')[0];
      if (!date) return;
      const tokens = recordTokens(r);
      tokens.forEach(t => paymentTokens.add(t));
      if (isPaidStatus(r.status || r.payment_status || 'Paid')) {
        const amt = asAmount(r.grandTotal, r.total_amount, r.amount_paid, r.amount);
        tokens.forEach(t => paidAmountByToken.set(t, (paidAmountByToken.get(t) || 0) + amt));
      }

      const clientInfo = enrichClientDetails(r, 'Guest');
      const category = resolveCategory(r);
      const status = r.status || r.payment_status || 'Paid';
      const amount = asAmount(r.grandTotal, r.total_amount, r.amount_paid, r.amount);
      const visitors = asAmount(r.totalVisitors, r.total_visitors, r.guest_count, 1);

      txs.push({
        id: `RC-${r.id || receiptNo}`,
        date,
        booking: displayKey,
        bookingRef,
        receiptNo,
        client: clientInfo.client,
        fname: clientInfo.fname,
        mname: clientInfo.mname,
        lname: clientInfo.lname,
        userNumber: clientInfo.userNumber,
        email: clientInfo.email,
        accountId: clientInfo.accountId,
        type: 'Payment',
        category,
        amount,
        visitors,
        status,
        source: 'receipt',
        searchTokens: [
          displayKey,
          bookingRef,
          receiptNo,
          clientInfo.client,
          clientInfo.fname,
          clientInfo.mname,
          clientInfo.lname,
          clientInfo.userNumber,
          clientInfo.email,
          'Payment',
          category,
          status
        ].filter(Boolean).map(x => String(x).toLowerCase()).join(' ')
      });
    });

    resortBookings.forEach(b => recordTokens(b).forEach(t => bookingTokens.add(t)));

    walkIns.forEach(w => {
      const key = w.receiptNo || w.receipt_number || w.bookingRef || `WI-${w.walk_in_id || w.id}`;
      const date = (w.transaction_date || w.payment_date || w.operating_date || w.created_at || w.date || '').split('T')[0];
      if (!date || recordTokens(w).some(t => paymentTokens.has(t)) || recordTokens(w).some(t => bookingTokens.has(t))) return;

      const clientInfo = enrichClientDetails(w, 'Walk-In');
      const amount = asAmount(w.total_amount, w.grandTotal, w.amount_paid, w.amount);
      const visitors = asAmount(w.guest_count, w.totalVisitors, w.total_visitors, 1);
      const status = w.payment_status || w.status || 'Pending';

      txs.push({
        id: `WI-${w.id || w.walk_in_id}`,
        date,
        booking: key,
        bookingRef: w.bookingRef || '',
        receiptNo: w.receiptNo || w.receipt_number || '',
        client: clientInfo.client,
        fname: clientInfo.fname,
        mname: clientInfo.mname,
        lname: clientInfo.lname,
        userNumber: clientInfo.userNumber,
        email: clientInfo.email,
        accountId: clientInfo.accountId,
        type: 'Walk-In',
        category: 'Walk-In Entry',
        amount,
        visitors,
        status,
        source: 'walkin',
        searchTokens: [
          key,
          w.bookingRef,
          w.receiptNo,
          clientInfo.client,
          clientInfo.fname,
          clientInfo.mname,
          clientInfo.lname,
          clientInfo.userNumber,
          clientInfo.email,
          'Walk-In',
          'Walk-In Entry',
          status
        ].filter(Boolean).map(x => String(x).toLowerCase()).join(' ')
      });
    });

    resortBookings.forEach(b => {
      const reference = b.bookingNumber || b.booking_number || b.bookingRef || `BK-${b.id}`;
      const tokens = recordTokens(b);
      const linkedToReceipt = tokens.some(t => paymentTokens.has(t));
      const linkedPayment = Math.max(0, ...tokens.map(t => paidAmountByToken.get(t) || 0));
      if (linkedToReceipt && isPaidStatus(b.status)) return;
      const date = (b.reservationDate || b.bookingDate || b.booking_date || b.created_at || '').split('T')[0];
      if (!date) return;
      const total = asAmount(b.total_amount, b.grandTotal, b.estimatedTotal, b.totalPrice, b.amount_due);
      const remaining = Math.max(0, total - linkedPayment);
      const status = isPaidStatus(b.status) || (total > 0 && remaining === 0) ? 'Paid' : (b.status || 'Pending');

      const isCottage = /cottage|room|kubo|accommodat/i.test(b.specificType || b.serviceName || b.packageName || '');
      const category = isCottage ? 'Accommodation' : 'Resort Services';
      const clientInfo = enrichClientDetails(b, 'Guest');
      const visitors = linkedToReceipt ? 0 : asAmount(b.numberOfGuests, b.totalVisitors, b.total_visitors, 1);

      txs.push({
        id: `BK-${b.id || reference}`,
        date,
        booking: reference,
        bookingRef: reference,
        receiptNo: '',
        client: clientInfo.client,
        fname: clientInfo.fname,
        mname: clientInfo.mname,
        lname: clientInfo.lname,
        userNumber: clientInfo.userNumber,
        email: clientInfo.email,
        accountId: clientInfo.accountId,
        type: 'Reservation',
        category,
        amount: remaining,
        visitors,
        status,
        source: 'booking',
        searchTokens: [
          reference,
          clientInfo.client,
          clientInfo.fname,
          clientInfo.mname,
          clientInfo.lname,
          clientInfo.userNumber,
          clientInfo.email,
          'Reservation',
          category,
          status
        ].filter(Boolean).map(x => String(x).toLowerCase()).join(' ')
      });
    });

    damages.forEach(d => {
      const date = (d.created_at || d.reported_at || d.date || '').split('T')[0];
      if (!date) return;
      const key = d.booking_number || d.bookingRef || `DMG-${d.id}`;
      const clientInfo = enrichClientDetails(d, 'Client');
      const amount = asAmount(d.final_fee, d.recommended_fee);
      const status = d.status || 'Pending';

      txs.push({
        id: `DMG-${d.id}`,
        date,
        booking: key,
        bookingRef: key,
        receiptNo: '',
        client: clientInfo.client,
        fname: clientInfo.fname,
        mname: clientInfo.mname,
        lname: clientInfo.lname,
        userNumber: clientInfo.userNumber,
        email: clientInfo.email,
        accountId: clientInfo.accountId,
        type: 'Damage Fee',
        category: 'Damage Recovery',
        amount,
        visitors: 0,
        status,
        source: 'damage',
        searchTokens: [
          key,
          clientInfo.client,
          clientInfo.fname,
          clientInfo.mname,
          clientInfo.lname,
          clientInfo.userNumber,
          clientInfo.email,
          'Damage Fee',
          'Damage Recovery',
          status
        ].filter(Boolean).map(x => String(x).toLowerCase()).join(' ')
      });
    });

    return txs.sort((a, b) => b.date.localeCompare(a.date));
  }, [resortBookings, walkIns, receipts, damages, userMap]);

  // ── Filtered Transactions based on current period ────────────────────────
  const filteredTxs = useMemo(() => {
    return allTransactions.filter(t => {
      const [y, m, d] = String(t.date || '').split('-');
      if (dateFilter.start && dateFilter.end) {
        return t.date >= dateFilter.start && t.date <= dateFilter.end;
      }
      if (dateFilter.year && y !== dateFilter.year) return false;
      if (dateFilter.month && m !== dateFilter.month) return false;
      if (dateFilter.day && d !== dateFilter.day) return false;
      if (dateFilter.half) {
        const mn = parseInt(m, 10);
        if (dateFilter.half === '1' && (mn < 1 || mn > 6)) return false;
        if (dateFilter.half === '2' && (mn < 7 || mn > 12)) return false;
      }
      return true;
    });
  }, [allTransactions, dateFilter]);

  // ── Core KPI & Statistical Calculations ─────────────────────────────────
  const stats = useMemo(() => {
    let paidAmount = 0, pendingPayments = 0, damageFees = 0, totalVisitors = 0;
    let completedCount = 0, cancelledCount = 0, totalTracked = 0;
    let singleDayMax = { date: '', amount: 0 };
    const dayTotals = new Map();

    let walkInRevenue = 0, onlineRevenue = 0;
    const paxBuckets = { solo: 0, couple: 0, family: 0, group: 0 };

    filteredTxs.forEach(t => {
      totalTracked += 1;
      const isPaid = isPaidStatus(t.status);
      const isCancelled = isCancelledStatus(t.status);

      if (isCancelled) cancelledCount += 1;
      else if (isPaid) completedCount += 1;

      if (t.source !== 'damage' && !isCancelled) {
        totalVisitors += t.visitors || 0;
        const pax = t.visitors || 1;
        if (pax === 1) paxBuckets.solo += 1;
        else if (pax === 2) paxBuckets.couple += 1;
        else if (pax <= 5) paxBuckets.family += 1;
        else paxBuckets.group += 1;
      }

      if (t.source === 'damage') {
        if (String(t.status).toLowerCase() === 'approved') damageFees += t.amount;
      } else {
        if (isPaid) {
          paidAmount += t.amount;
          if (t.source === 'walkin') walkInRevenue += t.amount;
          else onlineRevenue += t.amount;

          // Track single day records
          const curr = (dayTotals.get(t.date) || 0) + t.amount;
          dayTotals.set(t.date, curr);
          if (curr > singleDayMax.amount) {
            singleDayMax = { date: t.date, amount: curr };
          }
        } else if (!isCancelled) {
          pendingPayments += t.amount;
        }
      }
    });

    const totalBookings = resortBookings.filter(b => {
      const date = (b.reservationDate || b.bookingDate || b.booking_date || b.created_at || '').split('T')[0];
      if (!date || isCancelledStatus(b.status)) return false;
      if (dateFilter.start && dateFilter.end) {
        return date >= dateFilter.start && date <= dateFilter.end;
      }
      const [y, m, d] = date.split('-');
      if (dateFilter.year && y !== dateFilter.year) return false;
      if (dateFilter.month && m !== dateFilter.month) return false;
      if (dateFilter.day && d !== dateFilter.day) return false;
      if (dateFilter.half) {
        const mn = parseInt(m, 10);
        if (dateFilter.half === '1' && (mn < 1 || mn > 6)) return false;
        if (dateFilter.half === '2' && (mn < 7 || mn > 12)) return false;
      }
      return true;
    }).length;

    // Advanced Statistical Metrics
    const arpb = totalBookings > 0 ? paidAmount / totalBookings : (completedCount > 0 ? paidAmount / completedCount : 0);
    const arpu = totalVisitors > 0 ? paidAmount / totalVisitors : 0;
    const completionRate = totalTracked > 0 ? (completedCount / totalTracked) * 100 : 100;
    const cancellationRate = totalTracked > 0 ? (cancelledCount / totalTracked) * 100 : 0;
    const walkInRatio = (walkInRevenue + onlineRevenue) > 0 ? (walkInRevenue / (walkInRevenue + onlineRevenue)) * 100 : 0;

    return {
      totalBookings,
      paidAmount,
      pendingPayments,
      damageFees,
      totalVisitors,
      arpb,
      arpu,
      completionRate,
      cancellationRate,
      singleDayMax,
      walkInRevenue,
      onlineRevenue,
      walkInRatio,
      paxBuckets
    };
  }, [filteredTxs, resortBookings, dateFilter]);

  // ── Dual-Axis Time Series Chart Data (Revenue & Visitors) ────────────────
  const timeSeriesChartData = useMemo(() => {
    if (period === 'today') {
      const hourly = Array.from({ length: 24 }, (_, i) => ({
        name: `${i.toString().padStart(2, '0')}:00`,
        revenue: 0,
        visitors: 0
      }));
      let hasTimestamps = false;

      receipts.forEach(r => {
        const dt = (r.date || r.payment_date || r.paid_at || r.created_at || '');
        const dateOnly = dt.split('T')[0];
        if (dateOnly !== todayStr) return;
        if (!isPaidStatus(r.status || r.payment_status || 'Paid')) return;
        const timePart = dt.includes('T') ? dt.split('T')[1] : '';
        const hour = timePart ? parseInt(timePart.slice(0, 2), 10) : -1;
        const amt = asAmount(r.grandTotal, r.total_amount, r.amount_paid, r.amount);
        const pax = asAmount(r.totalVisitors, r.total_visitors, r.guest_count, 1);
        if (hour >= 0 && hour < 24) {
          hourly[hour].revenue += amt;
          hourly[hour].visitors += pax;
          hasTimestamps = true;
        }
      });

      if (!hasTimestamps) {
        const currentHour = new Date().getHours();
        filteredTxs.forEach(t => {
          if (t.source !== 'damage' && isPaidStatus(t.status)) {
            hourly[currentHour].revenue += t.amount;
            hourly[currentHour].visitors += t.visitors;
          }
        });
      }

      return hourly.slice(0, Math.min(24, new Date().getHours() + 3));
    }

    if (period === 'weekly') {
      const startBase = dateFilter.start ? new Date(`${dateFilter.start}T00:00:00`) : new Date();
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startBase);
        d.setDate(startBase.getDate() + i);
        const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return { name: `${DAY_NAMES[d.getDay()]} (${dStr.slice(5)})`, dateStr: dStr, revenue: 0, visitors: 0 };
      });

      filteredTxs.forEach(t => {
        if (t.source !== 'damage' && isPaidStatus(t.status)) {
          const match = days.find(day => day.dateStr === t.date);
          if (match) {
            match.revenue += t.amount;
            match.visitors += t.visitors || 0;
          }
        }
      });
      return days;
    }

    if (period === 'monthly') {
      const yr = parseInt(filterYear, 10) || parseInt(currentYear, 10) || new Date().getFullYear();
      const mo = parseInt(filterMonth, 10) || parseInt(currentMonth, 10) || (new Date().getMonth() + 1);
      const daysInMonth = Math.max(28, Math.min(31, new Date(yr, mo, 0).getDate() || 30));
      const data = Array.from({ length: daysInMonth }, (_, i) => ({
        name: `${mo}/${i + 1}`,
        revenue: 0,
        visitors: 0
      }));
      filteredTxs.forEach(t => {
        if (t.source !== 'damage' && isPaidStatus(t.status)) {
          const parts = String(t.date || '').split('-');
          const day = parseInt(parts[2], 10);
          if (day >= 1 && day <= daysInMonth) {
            data[day - 1].revenue += t.amount;
            data[day - 1].visitors += t.visitors || 0;
          }
        }
      });
      return data;
    }

    if (period === 'semi-yearly') {
      const startMonth = filterHalf === '1' ? 0 : 6;
      return Array.from({ length: 6 }, (_, i) => {
        const mIdx = startMonth + i;
        const mStr = (mIdx + 1).toString().padStart(2, '0');
        let revenue = 0, visitors = 0;
        allTransactions.forEach(t => {
          const [y, m] = String(t.date || '').split('-');
          if (dateFilter.year && y !== dateFilter.year) return;
          if (m === mStr && t.source !== 'damage' && isPaidStatus(t.status)) {
            revenue += t.amount;
            visitors += t.visitors || 0;
          }
        });
        return { name: MONTH_NAMES[mIdx], revenue, visitors };
      });
    }

    // Yearly
    const data = MONTH_NAMES.map(name => ({ name, revenue: 0, visitors: 0 }));
    filteredTxs.forEach(t => {
      if (t.source !== 'damage' && isPaidStatus(t.status)) {
        const parts = String(t.date || '').split('-');
        const m = parseInt(parts[1], 10);
        if (m >= 1 && m <= 12) {
          data[m - 1].revenue += t.amount;
          data[m - 1].visitors += t.visitors || 0;
        }
      }
    });
    return data;
  }, [period, filteredTxs, filterYear, filterMonth, filterHalf, receipts, todayStr, allTransactions, dateFilter]);

  // ── Category Distribution (Pie / Donut Chart) ───────────────────────────
  const categoryChartData = useMemo(() => {
    const map = new Map();
    filteredTxs.forEach(t => {
      if (isPaidStatus(t.status) || (t.source === 'damage' && String(t.status).toLowerCase() === 'approved')) {
        const cat = t.category || (t.source === 'damage' ? 'Damage Recovery' : 'General Services');
        map.set(cat, (map.get(cat) || 0) + t.amount);
      }
    });

    const entries = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    if (entries.length === 0) {
      return [{ name: 'No Data', value: 1 }];
    }
    return entries.sort((a, b) => b.value - a.value);
  }, [filteredTxs]);

  // ── Filtered Ledger Records with Multi-Token Client Search ──────────────
  const ledgerRecords = useMemo(() => {
    const q = ledgerSearch.toLowerCase().trim();
    // When no search query is typed, use filteredTxs (which respects the current period)
    if (!q) return filteredTxs;

    // When searching by client name, first/middle/last name, or booking ref,
    // search across ALL transactions so the user gets the complete account history!
    const queryTokens = q.split(/\s+/).filter(Boolean);
    return allTransactions.filter(t => {
      const target = (t.searchTokens || `${t.booking} ${t.client} ${t.type} ${t.status}`).toLowerCase();
      return queryTokens.every(tok => target.includes(tok));
    });
  }, [allTransactions, filteredTxs, ledgerSearch]);

  // ── Compute Cumulative Account Totals for the Transaction Ledger ──────────
  const ledgerTotals = useMemo(() => {
    let totalAmount = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    let totalVisitors = 0;
    const clientAccountsMap = new Map();

    ledgerRecords.forEach(t => {
      const amt = Number(t.amount) || 0;
      totalAmount += amt;

      const isPaid = isPaidStatus(t.status) || String(t.status).toLowerCase() === 'approved';
      const isCancelled = isCancelledStatus(t.status);

      if (isPaid) {
        paidAmount += amt;
      } else if (!isCancelled) {
        pendingAmount += amt;
      }

      if (t.source !== 'damage' && !isCancelled) {
        totalVisitors += Number(t.visitors) || 0;
      }

      const accKey = String(t.accountId || t.client || 'guest').trim().toLowerCase();
      if (!clientAccountsMap.has(accKey)) {
        clientAccountsMap.set(accKey, {
          client: t.client,
          userNumber: t.userNumber,
          email: t.email,
          recordsCount: 0,
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
        });
      }
      const acc = clientAccountsMap.get(accKey);
      acc.recordsCount += 1;
      acc.totalAmount += amt;
      if (isPaid) acc.paidAmount += amt;
      else if (!isCancelled) acc.pendingAmount += amt;
    });

    const uniqueAccounts = Array.from(clientAccountsMap.values());
    const isSingleAccount = uniqueAccounts.length === 1 && ledgerRecords.length > 0;
    const primaryAccount = isSingleAccount ? uniqueAccounts[0] : null;

    return {
      totalAmount,
      paidAmount,
      pendingAmount,
      totalVisitors,
      uniqueAccountsCount: uniqueAccounts.length,
      isSingleAccount,
      primaryAccount,
      recordsCount: ledgerRecords.length,
    };
  }, [ledgerRecords]);

  const yearOptions = Array.from({ length: 11 }, (_, i) => (2020 + i).toString());

  return (
    <div className="reports-tab-container">
      <div className="reports-card">
        {/* --- HEADER --- */}
        <div className="reports-header">
          <div className="reports-title-group">
            <div className="reports-icon-chip">
              <BarChart3 size={24} />
            </div>
            <div className="reports-title-text">
              <h2>
                Reports &amp; Analytics
                <span className="reports-period-chip" style={{ fontSize: 11, background: 'rgba(74,222,128,0.12)', color: '#4ade80' }}>
                  Live Data
                </span>
              </h2>
              <p>Graphical revenue trends, visitor volume distribution, and complete transaction ledger.</p>
            </div>
          </div>

          <div className="reports-header-actions">
            <button className="reports-btn reports-btn-ghost" onClick={() => window.print()} title="Print or save as PDF">
              <Printer size={15} /> Print Summary
            </button>
            <button className="reports-btn reports-btn-primary" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Syncing…' : 'Refresh Metrics'}
            </button>
          </div>
        </div>

        {/* --- MAIN MODULE NAVIGATION PILLS --- */}
        <div className="reports-nav-pills">
          {SUB_TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                className={`reports-nav-btn ${activeSubTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveSubTab(tab.key)}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* --- PERIOD & DATE FILTER TOOLBAR --- */}
        <div className="reports-filter-bar">
          <div className="reports-period-buttons">
            {PERIODS.map(p => (
              <button
                key={p.key}
                className={`reports-period-chip ${period === p.key ? 'active' : ''}`}
                onClick={() => setPeriod(p.key)}
              >
                <span>{p.icon}</span> <span>{p.label}</span>
              </button>
            ))}
          </div>

          <div className="reports-date-selectors">
            {period === 'today' && (
              <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>
                Today: {todayStr}
              </span>
            )}

            {(period === 'monthly' || period === 'semi-yearly' || period === 'yearly') && (
              <select
                value={filterYear}
                onChange={e => setFilterYear(e.target.value)}
                className="reports-select"
              >
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            )}

            {period === 'monthly' && (
              <select
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
                className="reports-select"
              >
                {MONTH_NAMES.map((m, i) => (
                  <option key={i} value={(i + 1).toString().padStart(2, '0')}>{m}</option>
                ))}
              </select>
            )}

            {period === 'semi-yearly' && (
              <select
                value={filterHalf}
                onChange={e => setFilterHalf(e.target.value)}
                className="reports-select"
              >
                <option value="1">1st Half (Jan – Jun)</option>
                <option value="2">2nd Half (Jul – Dec)</option>
              </select>
            )}
          </div>
        </div>

        {/* --- TOP SUMMARY KPIS --- */}
        <div className="reports-kpis-grid">
          <div className="reports-kpi-card">
            <div className="reports-kpi-top">
              <span className="reports-kpi-label">Realized Revenue</span>
              <div className="reports-kpi-icon" style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>
                <DollarSign size={18} />
              </div>
            </div>
            <div className="reports-kpi-val" style={{ color: '#4ade80' }}>
              {fmt(stats.paidAmount)}
            </div>
            <div className="reports-kpi-sub">
              <span>Settled cashflow</span>
            </div>
          </div>

          <div className="reports-kpi-card">
            <div className="reports-kpi-top">
              <span className="reports-kpi-label">Total Visitors</span>
              <div className="reports-kpi-icon" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>
                <Users size={18} />
              </div>
            </div>
            <div className="reports-kpi-val" style={{ color: '#38bdf8' }}>
              {stats.totalVisitors.toLocaleString()}
            </div>
            <div className="reports-kpi-sub">
              <span>Guests recorded</span>
            </div>
          </div>

          <div className="reports-kpi-card">
            <div className="reports-kpi-top">
              <span className="reports-kpi-label">Avg / Visitor (ARPU)</span>
              <div className="reports-kpi-icon" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                <Activity size={18} />
              </div>
            </div>
            <div className="reports-kpi-val" style={{ color: '#fbbf24' }}>
              {fmt(stats.arpu)}
            </div>
            <div className="reports-kpi-sub">
              <span>Per-guest spend</span>
            </div>
          </div>

          <div className="reports-kpi-card">
            <div className="reports-kpi-top">
              <span className="reports-kpi-label">Pipeline Receivables</span>
              <div className="reports-kpi-icon" style={{ background: 'rgba(244,63,94,0.15)', color: '#fb7185' }}>
                <Clock size={18} />
              </div>
            </div>
            <div className="reports-kpi-val" style={{ color: '#fb7185' }}>
              {fmt(stats.pendingPayments)}
            </div>
            <div className="reports-kpi-sub">
              <span>Uncollected balances</span>
            </div>
          </div>
        </div>

        {/* ====================================================================
            SUB-TAB 1: GRAPHICAL REPORTS
            ==================================================================== */}
        {activeSubTab === 'graphical' && (
          <div className="reports-charts-grid">
            {/* 1. Dual-Axis Revenue & Visitor Footfall Composed Chart */}
            <div className="reports-chart-panel">
              <div className="reports-panel-head">
                <span className="reports-panel-title">
                  <BarChart3 size={18} /> Revenue Flow &amp; Visitor Volume
                </span>
                <span style={{ fontSize: 11, color: '#9fbfad' }}>
                  {period.toUpperCase()} TIMELINE
                </span>
              </div>

              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <ComposedChart data={timeSeriesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#064e3b' : '#d1fae5'} vertical={false} />
                    <XAxis dataKey="name" stroke={isDark ? '#34d399' : '#059669'} tick={{ fontSize: 11 }} />
                    <YAxis
                      yAxisId="left"
                      stroke={isDark ? '#34d399' : '#059669'}
                      tickFormatter={v => `₱${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                      tick={{ fontSize: 11 }}
                      width={60}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#38bdf8"
                      tick={{ fontSize: 11 }}
                      width={36}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#022c22' : '#ffffff',
                        borderColor: '#059669',
                        borderRadius: 12,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                      }}
                      formatter={(val, name) => [name === 'revenue' ? fmt(val) : `${val} visitors`, name === 'revenue' ? 'Revenue' : 'Visitors']}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" name="Revenue (₱)" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={45} />
                    <Line yAxisId="right" type="monotone" dataKey="visitors" name="Visitors" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Category Revenue Breakdown Donut Chart */}
            <div className="reports-chart-panel">
              <div className="reports-panel-head">
                <span className="reports-panel-title">
                  <PieIcon size={18} /> Revenue by Stream Category
                </span>
                <span style={{ fontSize: 11, color: '#9fbfad' }}>DISTRIBUTION</span>
              </div>

              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#022c22' : '#ffffff',
                        borderColor: '#059669',
                        borderRadius: 12
                      }}
                      formatter={(v) => [fmt(v), 'Share']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {categoryChartData.map((cat, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9fbfad' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                      {cat.name}
                    </span>
                    <strong style={{ fontWeight: 700 }}>{fmt(cat.value)}</strong>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ====================================================================
            SUB-TAB 2: TRANSACTIONS AUDIT LEDGER
            ==================================================================== */}
        {activeSubTab === 'ledger' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ position: 'relative', minWidth: 320, flex: 1, maxWidth: 540 }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4ade80' }} />
                <input
                  type="text"
                  placeholder="Search Booking / Ref, Client name, First, Middle, Last Name..."
                  value={ledgerSearch}
                  onChange={e => setLedgerSearch(e.target.value)}
                  className="reports-select"
                  style={{ width: '100%', paddingLeft: 34, paddingRight: ledgerSearch ? 36 : 12 }}
                />
                {ledgerSearch && (
                  <button
                    type="button"
                    onClick={() => setLedgerSearch('')}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#9fbfad',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {ledgerSearch && (
                  <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 700 }}>
                    Filter: "{ledgerSearch}"
                  </span>
                )}
                <span style={{ fontSize: 12, color: '#9fbfad' }}>
                  Showing {Math.min(ledgerRecords.length, 100)} of {ledgerRecords.length} records
                </span>
              </div>
            </div>

            <div className="reports-table-wrap">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Booking / Ref</th>
                    <th>Client</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerRecords.slice(0, 100).map((t, i) => (
                    <tr key={t.id || i}>
                      <td>{t.date}</td>
                      <td style={{ fontFamily: 'monospace', color: '#86efac', fontWeight: 700 }}>
                        {t.booking}
                        {t.receiptNo && t.receiptNo !== t.booking && (
                          <div style={{ fontSize: 10, color: '#9fbfad', fontWeight: 500, fontFamily: 'sans-serif' }}>
                            OR: {t.receiptNo}
                          </div>
                        )}
                      </td>
                      <td>
                        <div
                          className="client-avatar-chip"
                          onClick={() => setLedgerSearch(t.client)}
                          title={`Click to isolate ${t.client}'s account`}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="client-avatar-circle">
                            {getInitials(t.client)}
                          </div>
                          <div>
                            <strong style={{ fontWeight: 700, color: '#ecfdf5', display: 'block' }}>
                              {t.client}
                            </strong>
                            {t.userNumber && (
                              <span style={{ fontSize: 10, color: '#9fbfad' }}>
                                {t.userNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ color: '#9fbfad' }}>{t.type}</td>
                      <td>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.06)' }}>
                          {t.category}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#4ade80' }}>
                        {fmt(t.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 999,
                          textTransform: 'uppercase',
                          background: isPaidStatus(t.status) || t.status === 'Approved' ? 'rgba(74,222,128,0.15)' : isCancelledStatus(t.status) ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)',
                          color: isPaidStatus(t.status) || t.status === 'Approved' ? '#4ade80' : isCancelledStatus(t.status) ? '#fb7185' : '#fbbf24'
                        }}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {ledgerRecords.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 48, color: '#9fbfad' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <Search size={28} style={{ opacity: 0.5, color: '#4ade80' }} />
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#ecfdf5' }}>
                            No transactions found matching "{ledgerSearch}"
                          </span>
                          <span style={{ fontSize: 12 }}>
                            Try searching by client first name, last name, middle name, or booking reference number.
                          </span>
                          <button
                            type="button"
                            className="reports-clear-btn"
                            style={{ marginTop: 8 }}
                            onClick={() => setLedgerSearch('')}
                          >
                            Clear Search Filter
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>

                {ledgerRecords.length > 0 && (
                  <tfoot>
                    <tr className="reports-table-total-row">
                      <td colSpan={2} style={{ textAlign: 'left', fontWeight: 800 }}>
                        {ledgerTotals.isSingleAccount
                          ? `TOTAL FOR ACCOUNT (${ledgerTotals.primaryAccount?.client}):`
                          : `GRAND TOTAL (${ledgerTotals.recordsCount} records):`}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {ledgerTotals.isSingleAccount
                          ? ledgerTotals.primaryAccount?.client
                          : `${ledgerTotals.uniqueAccountsCount} Client Accounts`}
                      </td>
                      <td colSpan={2} style={{ textAlign: 'right', color: '#9fbfad', fontSize: 12 }}>
                        Paid: <strong style={{ color: '#4ade80' }}>{fmt(ledgerTotals.paidAmount)}</strong>
                        {ledgerTotals.pendingAmount > 0 && (
                          <span style={{ marginLeft: 8 }}>
                            • Pending: <strong style={{ color: '#fbbf24' }}>{fmt(ledgerTotals.pendingAmount)}</strong>
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 900, color: '#4ade80', fontSize: 14 }}>
                        {fmt(ledgerTotals.totalAmount)}
                      </td>
                      <td style={{ textAlign: 'center', fontSize: 11 }}>
                        {ledgerTotals.pendingAmount === 0 ? (
                          <span style={{ color: '#4ade80', fontWeight: 800 }}>FULLY SETTLED</span>
                        ) : (
                          <span style={{ color: '#fbbf24', fontWeight: 800 }}>
                            {fmt(ledgerTotals.pendingAmount)} DUE
                          </span>
                        )}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* --- AFTER ALL BELOW: CUMULATIVE ACCOUNT TOTALS SUMMARY CARD --- */}
            <div className="reports-ledger-summary-card">
              <div className="reports-ledger-summary-header">
                <div className="reports-ledger-summary-title">
                  <div className="client-avatar-chip">
                    <div className="client-avatar-circle" style={{ width: 44, height: 44, fontSize: 16 }}>
                      {ledgerTotals.isSingleAccount
                        ? getInitials(ledgerTotals.primaryAccount?.client)
                        : <Users size={20} />}
                    </div>
                  </div>
                  <div>
                    <h4>
                      {ledgerTotals.isSingleAccount ? (
                        <>
                          Account Summary: <span style={{ color: '#4ade80' }}>{ledgerTotals.primaryAccount?.client}</span>
                        </>
                      ) : (
                        <>Consolidated Ledger Summary</>
                      )}
                      <span style={{
                        fontSize: 11,
                        padding: '3px 10px',
                        borderRadius: 999,
                        background: ledgerTotals.isSingleAccount ? 'rgba(74, 222, 128, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                        color: ledgerTotals.isSingleAccount ? '#4ade80' : '#38bdf8',
                        fontWeight: 800
                      }}>
                        {ledgerTotals.isSingleAccount
                          ? 'Single Account View'
                          : `${ledgerTotals.uniqueAccountsCount} Accounts Consolidated`}
                      </span>
                    </h4>
                    <p>
                      {ledgerTotals.isSingleAccount ? (
                        <>
                          {ledgerTotals.primaryAccount?.userNumber && (
                            <>Account No: <strong style={{ color: '#ecfdf5' }}>{ledgerTotals.primaryAccount.userNumber}</strong> • </>
                          )}
                          {ledgerTotals.primaryAccount?.email && (
                            <>{ledgerTotals.primaryAccount.email} • </>
                          )}
                          Showing all recorded transactions and cumulative balance for this account ({ledgerTotals.recordsCount} {ledgerTotals.recordsCount === 1 ? 'transaction' : 'transactions'})
                        </>
                      ) : (
                        <>
                          Aggregated balance and totals across {ledgerTotals.recordsCount} transactions ({ledgerTotals.uniqueAccountsCount} client accounts)
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {ledgerSearch && (
                  <button
                    type="button"
                    className="reports-clear-btn"
                    onClick={() => setLedgerSearch('')}
                    title="Reset search to view all transactions"
                  >
                    <X size={13} /> Clear Search ({ledgerSearch})
                  </button>
                )}
              </div>

              <div className="reports-ledger-summary-metrics">
                <div className="reports-ledger-metric-item">
                  <span className="label">
                    {ledgerTotals.isSingleAccount ? 'Total Account Bill / Volume' : 'Total Transaction Value'}
                  </span>
                  <span className="val" style={{ color: '#4ade80' }}>
                    {fmt(ledgerTotals.totalAmount)}
                  </span>
                  <span className="sub">
                    {ledgerTotals.isSingleAccount
                      ? `Cumulative sum across all ${ledgerTotals.recordsCount} records`
                      : `Total volume of ${ledgerTotals.recordsCount} transaction items`}
                  </span>
                </div>

                <div className="reports-ledger-metric-item">
                  <span className="label">Total Settled / Paid</span>
                  <span className="val" style={{ color: '#38bdf8' }}>
                    {fmt(ledgerTotals.paidAmount)}
                  </span>
                  <span className="sub">
                    <CheckCircle2 size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
                    Completed and verified payments
                  </span>
                </div>

                <div className="reports-ledger-metric-item">
                  <span className="label">Pending / Remaining Balance</span>
                  <span className="val" style={{ color: ledgerTotals.pendingAmount > 0 ? '#fbbf24' : '#9fbfad' }}>
                    {fmt(ledgerTotals.pendingAmount)}
                  </span>
                  <span className="sub">
                    {ledgerTotals.pendingAmount > 0 ? (
                      <>
                        <AlertCircle size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1, color: '#fbbf24' }} />
                        Outstanding balance to collect
                      </>
                    ) : (
                      'Zero remaining balance (Fully paid)'
                    )}
                  </span>
                </div>

                <div className="reports-ledger-metric-item">
                  <span className="label">Total Guests / Footfall</span>
                  <span className="val" style={{ color: '#ecfdf5' }}>
                    {ledgerTotals.totalVisitors}{' '}
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#9fbfad' }}>
                      guests
                    </span>
                  </span>
                  <span className="sub">
                    {ledgerTotals.isSingleAccount
                      ? (ledgerTotals.pendingAmount === 0 ? 'Account is completely settled' : 'Unpaid balance pending checkout')
                      : `Tracked visitors across ${ledgerTotals.recordsCount} records`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}