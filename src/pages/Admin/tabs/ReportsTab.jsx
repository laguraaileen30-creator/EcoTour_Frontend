import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Calendar, AlertCircle, DollarSign, Activity, FileText, Users } from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';
import { apiJson } from '../../../utils/catalog';
import { getPhilippineDateStr } from '../../../utils/phTime';

const isPaidStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase();
  return normalized === 'paid' || normalized.startsWith('paid ') ||
    normalized === 'completed' || normalized === 'settled' || normalized === 'fully paid' ||
    normalized === 'success' || normalized === 'succeeded' ||
    normalized.includes('checked in') || normalized.includes('using');
};

const isCancelledStatus = (status) => /cancel|void|reject|expire/i.test(String(status || ''));
const asAmount = (...values) => {
  const amount = values.find(value => value !== undefined && value !== null && value !== '');
  const parsed = Number(amount);
  return Number.isFinite(parsed) ? parsed : 0;
};

const recordTokens = (record) => [
  record.receiptNo, record.receipt_no, record.receipt_number,
  record.payment_ref, record.payment_reference,
  record.bookingRef, record.booking_ref, record.bookingNumber, record.booking_number,
  record.booking_id, record.reservation_id
].filter(value => value !== undefined && value !== null && value !== '')
  .map(value => String(value).trim().toLowerCase());

export default function ReportsTab() {
  const { resortBookings = [], receipts = [], walkIns = [] } = useEcoTour();

  const [filterYear, setFilterYear] = useState(getPhilippineDateStr().slice(0, 4));
  const [filterMonth, setFilterMonth] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [damages, setDamages] = useState([]);
  const [damageError, setDamageError] = useState('');

  useEffect(() => {
    let active = true;
    const fetchDamages = async () => {
      try {
        const data = await apiJson('/damages', { auth: true });
        if (active) setDamages(data.reports || data.data?.reports || (Array.isArray(data.data) ? data.data : []));
      } catch (err) {
        if (active) setDamageError(err.message || 'Unable to load damage reports.');
      }
    };
    fetchDamages();
    return () => { active = false; };
  }, []);

  // Payment records are the source of collected revenue. Bookings and walk-ins fill
  // in unpaid balances or payments that have not yet produced a receipt record.
  const allTransactions = useMemo(() => {
    const txs = [];
    const paymentTokens = new Set();
    const paidAmountByToken = new Map();
    const bookingTokens = new Set();

    receipts.forEach(r => {
      const key = r.receiptNo || r.receipt_no || r.receipt_number ||
        r.payment_ref || r.payment_reference || `RC-${r.id}`;
      const date = (r.date || r.payment_date || r.paid_at || r.transaction_date || r.created_at || '').split('T')[0];
      if (!date) return;
      const tokens = recordTokens(r);
      tokens.forEach(token => paymentTokens.add(token));
      if (isPaidStatus(r.status || r.payment_status || 'Paid')) {
        const amount = asAmount(r.grandTotal, r.total_amount, r.amount_paid, r.amount);
        tokens.forEach(token => paidAmountByToken.set(token, (paidAmountByToken.get(token) || 0) + amount));
      }
      txs.push({
        id: `RC-${r.id || key}`,
        date,
        booking: key,
        client: r.clientName || r.client_name || r.touristName || r.tourist_name || r.customer_name || 'Guest',
        type: 'Payment',
        amount: asAmount(r.grandTotal, r.total_amount, r.amount_paid, r.amount),
        visitors: asAmount(r.totalVisitors, r.total_visitors, r.guest_count, 1),
        status: r.status || r.payment_status || 'Paid',
        source: 'receipt'
      });
    });

    resortBookings.forEach(b => recordTokens(b).forEach(token => bookingTokens.add(token)));

    walkIns.forEach(w => {
      const key = w.receiptNo || w.receipt_number || `WI-${w.walk_in_id || w.id}`;
      const date = (w.transaction_date || w.payment_date || w.operating_date || w.created_at || w.date || '').split('T')[0];
      const linkedToReceipt = recordTokens(w).some(token => paymentTokens.has(token));
      const linkedBooking = recordTokens(w).some(token => bookingTokens.has(token));
      if (!date || linkedToReceipt || linkedBooking) return;
      txs.push({
        id: `WI-${w.id || w.walk_in_id}`,
        date,
        booking: key,
        client: w.customer_name || w.touristName || w.tourist_name || 'Walk-In',
        type: 'Walk-In',
        amount: asAmount(w.total_amount, w.grandTotal, w.amount_paid, w.amount),
        visitors: asAmount(w.guest_count, w.totalVisitors, w.total_visitors, 1),
        status: w.payment_status || w.status || 'Pending',
        source: 'walkin'
      });
    });

    resortBookings.forEach(b => {
      const reference = b.bookingNumber || b.booking_number || b.bookingRef || b.booking_ref || `BK-${b.id}`;
      const tokens = recordTokens(b);
      const linkedToReceipt = tokens.some(token => paymentTokens.has(token));
      const linkedPayment = Math.max(0, ...tokens.map(token => paidAmountByToken.get(token) || 0));
      if (linkedToReceipt && isPaidStatus(b.status)) return;
      const date = (b.reservationDate || b.bookingDate || b.booking_date || b.created_at || '').split('T')[0];
      if (!date) return;
      const bookingTotal = asAmount(b.total_amount, b.grandTotal, b.estimatedTotal, b.totalPrice, b.amount_due);
      const remaining = Math.max(0, bookingTotal - linkedPayment);
      const status = isPaidStatus(b.status) || (bookingTotal > 0 && remaining === 0) ? 'Paid' : (b.status || 'Pending');
      txs.push({
        id: `BK-${b.id || reference}`,
        date,
        booking: reference,
        client: b.clientName || b.client_name || b.fullName || b.touristName || 'Guest',
        type: 'Reservation',
        amount: remaining,
        visitors: linkedToReceipt ? 0 : asAmount(b.numberOfGuests, b.totalVisitors, b.total_visitors, 1),
        status,
        source: 'booking'
      });
    });

    damages.forEach(d => {
      const dateStr = (d.created_at || d.reported_at || d.date || '').split('T')[0];
      if (!dateStr) return;
      txs.push({
        id: `DMG-${d.id}`,
        date: dateStr,
        booking: d.booking_number || d.booking_ref || `DMG-${d.id}`,
        client: d.client_name || d.customer_name || 'Client',
        type: 'Damage Fee',
        amount: asAmount(d.final_fee, d.recommended_fee),
        visitors: 0,
        status: d.status || 'Pending',
        source: 'damage'
      });
    });

    return txs.sort((a, b) => b.date.localeCompare(a.date));
  }, [resortBookings, walkIns, receipts, damages]);

  // Filter transactions based on selected date
  const filteredTxs = useMemo(() => {
    return allTransactions.filter(t => {
      const [y, m, d] = t.date.split('-');
      if (filterYear && y !== filterYear) return false;
      if (filterMonth && m !== filterMonth) return false;
      if (filterDate && d !== filterDate) return false;
      return true;
    });
  }, [allTransactions, filterYear, filterMonth, filterDate]);

  // Compute Summary Cards
  const stats = useMemo(() => {
    let paidAmount = 0;
    let pendingPayments = 0;
    let damageFees = 0;
    let totalVisitors = 0;

    filteredTxs.forEach(t => {
      if (t.source !== 'damage' && !isCancelledStatus(t.status)) totalVisitors += t.visitors || 0;

      if (t.source === 'damage') {
        if (String(t.status).toLowerCase() === 'approved') {
          damageFees += t.amount;
        }
      } else {
        if (isPaidStatus(t.status)) {
          paidAmount += t.amount;
        } else if (!isCancelledStatus(t.status)) {
          pendingPayments += t.amount;
        }
      }
    });

    const totalBookings = resortBookings.filter(b => {
      const date = (b.reservationDate || b.bookingDate || b.booking_date || b.created_at || '').split('T')[0];
      const [year, month, day] = date.split('-');
      return date && !isCancelledStatus(b.status) &&
        (!filterYear || year === filterYear) &&
        (!filterMonth || month === filterMonth) &&
        (!filterDate || day === filterDate);
    }).length;

    return { totalBookings, paidAmount, pendingPayments, damageFees, totalVisitors };
  }, [filteredTxs, resortBookings, filterYear, filterMonth, filterDate]);

  // Compute Graph Data
  const chartData = useMemo(() => {
    if (filterMonth) {
      // Daily breakdown for the selected month
      const daysInMonth = filterYear ? new Date(parseInt(filterYear), parseInt(filterMonth), 0).getDate() : 31;
      const data = Array.from({ length: daysInMonth }, (_, i) => {
        const dayStr = (i + 1).toString().padStart(2, '0');
        return {
          name: `${filterMonth}/${dayStr}`,
          revenue: 0
        };
      });

      filteredTxs.forEach(t => {
        const isPaid = t.source !== 'damage' && isPaidStatus(t.status);
        if (isPaid) {
          const d = parseInt(t.date.split('-')[2], 10);
          if (d >= 1 && d <= daysInMonth) {
            data[d - 1].revenue += t.amount;
          }
        }
      });
      return data;
    } else {
      // Monthly breakdown for the selected year
      const data = [
        { name: 'Jan', revenue: 0 }, { name: 'Feb', revenue: 0 }, { name: 'Mar', revenue: 0 },
        { name: 'Apr', revenue: 0 }, { name: 'May', revenue: 0 }, { name: 'Jun', revenue: 0 },
        { name: 'Jul', revenue: 0 }, { name: 'Aug', revenue: 0 }, { name: 'Sep', revenue: 0 },
        { name: 'Oct', revenue: 0 }, { name: 'Nov', revenue: 0 }, { name: 'Dec', revenue: 0 }
      ];

      filteredTxs.forEach(t => {
        const isPaid = t.source !== 'damage' && isPaidStatus(t.status);
        if (isPaid) {
          const m = parseInt(t.date.split('-')[1], 10);
          if (m >= 1 && m <= 12) {
            data[m - 1].revenue += t.amount;
          }
        }
      });
      return data;
    }
  }, [filteredTxs, filterYear, filterMonth]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto text-white p-2 sm:p-4">
      {/* HEADER & FILTERS */}
      <div className="bg-[#0c1f16] p-5 rounded-3xl border border-emerald-500/20 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-extrabold text-white text-lg">Admin Reports & Analytics</h3>
          <p className="text-xs text-slate-400">Actual database records and analytics</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="flex flex-col">
            <label className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Year</label>
            <select 
              value={filterYear} 
              onChange={e => setFilterYear(e.target.value)} 
              className="bg-emerald-950/40 border border-emerald-800 text-slate-200 text-sm px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
            >
              <option value="">All Years</option>
              {Array.from({length: 11}, (_, i) => 2020 + i).map(y => <option key={y} value={y.toString()}>{y}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Month</label>
            <select 
              value={filterMonth} 
              onChange={e => {
                setFilterMonth(e.target.value);
                if (!e.target.value) setFilterDate('');
              }} 
              className="bg-emerald-950/40 border border-emerald-800 text-slate-200 text-sm px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
            >
              <option value="">All Months</option>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                <option key={i} value={(i + 1).toString().padStart(2, '0')}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Date</label>
            <select 
              value={filterDate} 
              onChange={e => setFilterDate(e.target.value)} 
              disabled={!filterMonth}
              className="bg-emerald-950/40 border border-emerald-800 text-slate-200 text-sm px-3 py-2 rounded-lg outline-none focus:border-emerald-500 disabled:opacity-50"
            >
              <option value="">All Dates</option>
              {Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={d.toString().padStart(2, '0')}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      {damageError && (
        <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">
          Damage reports could not be loaded: {damageError}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-5 bg-[#071f14] rounded-2xl border border-emerald-500/30 shadow-lg">
          <div className="flex justify-between items-center text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
            <span>Total Bookings</span>
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-white">{stats.totalBookings}</div>
        </div>

        <div className="p-5 bg-[#071f14] rounded-2xl border border-emerald-500/30 shadow-lg">
          <div className="flex justify-between items-center text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
            <span>Collected Revenue</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-300">{formatCurrency(stats.paidAmount)}</div>
        </div>

        <div className="p-5 bg-[#071f14] rounded-2xl border border-emerald-500/30 shadow-lg">
          <div className="flex justify-between items-center text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
            <span>Visitors</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-white">{stats.totalVisitors}</div>
        </div>

        <div className="p-5 bg-[#071f14] rounded-2xl border border-emerald-500/30 shadow-lg">
          <div className="flex justify-between items-center text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-2">
            <span>Pending Payments</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-rose-300">{formatCurrency(stats.pendingPayments)}</div>
        </div>

        <div className="p-5 bg-[#071f14] rounded-2xl border border-emerald-500/30 shadow-lg">
          <div className="flex justify-between items-center text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-2">
            <span>Approved Damage Fees</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-300">{formatCurrency(stats.damageFees)}</div>
          <p className="mt-1 text-[10px] text-slate-400">Assessed fees; not counted as collected revenue</p>
        </div>
      </div>

      {/* GRAPH */}
      <div className="bg-[#071f14] p-5 rounded-2xl border border-emerald-500/30 shadow-lg">
        <h4 className="text-emerald-400 font-bold mb-4 uppercase tracking-wide text-sm flex items-center gap-2">
          <Activity className="w-4 h-4" />
          {filterMonth ? 'Daily Revenue' : 'Monthly Revenue'} 
          {filterYear && ` (${filterYear})`}
        </h4>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
              <XAxis dataKey="name" stroke="#34d399" tick={{fill: '#34d399', fontSize: 12}} />
              <YAxis stroke="#34d399" tick={{fill: '#34d399', fontSize: 12}} tickFormatter={(value) => `₱${value}`} />
              <Tooltip 
                cursor={{fill: '#064e3b', opacity: 0.4}} 
                contentStyle={{backgroundColor: '#022c22', borderColor: '#059669', color: '#fff', borderRadius: 8}}
                itemStyle={{color: '#34d399', fontWeight: 'bold'}}
                formatter={(value) => formatCurrency(value)}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <div className="bg-[#071f14] p-5 rounded-2xl border border-emerald-500/30 shadow-lg">
        <h4 className="text-emerald-400 font-bold mb-4 uppercase tracking-wide text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Recent Transactions
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-emerald-800/50">
                <th className="py-3 px-4 text-emerald-500 font-bold">Date</th>
                <th className="py-3 px-4 text-emerald-500 font-bold">Booking / Ref</th>
                <th className="py-3 px-4 text-emerald-500 font-bold">Client</th>
                <th className="py-3 px-4 text-emerald-500 font-bold">Type</th>
                <th className="py-3 px-4 text-emerald-500 font-bold text-right">Amount</th>
                <th className="py-3 px-4 text-emerald-500 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxs.slice(0, 50).map((t, idx) => (
                <tr key={idx} className="border-b border-emerald-900/30 hover:bg-emerald-900/20 transition-colors">
                  <td className="py-3 px-4 text-slate-300">{t.date}</td>
                  <td className="py-3 px-4 text-emerald-400 font-mono">{t.booking}</td>
                  <td className="py-3 px-4 text-slate-200">{t.client}</td>
                  <td className="py-3 px-4 text-slate-400">{t.type}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-300">{formatCurrency(t.amount)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      String(t.status).toLowerCase().includes('paid') || t.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                      String(t.status).toLowerCase().includes('cancel') || t.status === 'Rejected' ? 'bg-rose-500/20 text-rose-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredTxs.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-emerald-600">No transactions found for the selected period.</td>
                </tr>
              )}
            </tbody>
          </table>
          {filteredTxs.length > 50 && (
            <div className="text-center py-4 text-xs text-emerald-600">Showing 50 most recent records.</div>
          )}
        </div>
      </div>

    </div>
  );
}