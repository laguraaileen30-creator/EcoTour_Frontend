import React, { useState } from 'react';
import {
  History, CheckCircle2, Calendar, DollarSign, Package,
  Search, Printer, Download, Eye, ArrowRight, Sparkles,
  Users, RefreshCw, X, Receipt, Clock, Filter, Layers, QrCode, XCircle, AlertCircle
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';
import { getStageIndex } from '../../../components/VerticalReservationTimeline';
import { getPhilippineDateStr } from '../../../utils/phTime';

export default function ClientHistoryTab({ onNavigateBook }) {
  const { currentUser, reservations = [], receipts = [], theme, refreshAllLiveData } = useEcoTour();
  const [searchQuery, setSearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState('All'); // 'All' | 'Completed' | 'Voided'
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState(null);
  const isLight = theme === 'light';

  const clientEmail = (currentUser?.email || '').toLowerCase().trim();
  const clientName = (`${currentUser?.fname || ''} ${currentUser?.lname || ''}`.trim() || currentUser?.name || '').toLowerCase().trim();
  const clientUserNum = String(currentUser?.user_number || currentUser?.userNumber || currentUser?.assignedId || '').toLowerCase().trim();
  const clientUserId = String(currentUser?.id || currentUser?.user_id || '').toLowerCase().trim();

  // Match client's completed & voided/cancelled history records from database
  const myHistoryBookings = (reservations || []).filter((r) => {
    if (!currentUser) return false;
    const rEmail = (r.email || r.clientEmail || r.touristEmail || '').toLowerCase().trim();
    const rName = (r.clientName || r.fullName || r.touristName || '').toLowerCase().trim();
    const rUserNum = (r.userNumber || r.client_id || r.client_number || '').toLowerCase().trim();
    const rUserId = String(r.userId || r.user_id || '').toLowerCase().trim();

    const matchesEmail = Boolean(clientEmail && rEmail && (rEmail === clientEmail || rEmail.includes(clientEmail) || clientEmail.includes(rEmail)));
    const matchesName = Boolean(clientName && rName && (rName.includes(clientName) || clientName.includes(rName)));
    const matchesUserNum = Boolean(clientUserNum && rUserNum && (rUserNum === clientUserNum || rUserNum.includes(clientUserNum)));
    const matchesId = Boolean(clientUserId && rUserId && clientUserId === rUserId);

    const matchesClient = matchesEmail || matchesName || matchesUserNum || matchesId || !clientEmail || clientEmail.includes('client');
    if (!matchesClient) return false;

    // Concluded / Historical status: Completed, Finished, Voided, or Cancelled
    const stageIdx = getStageIndex(r.status);
    const s = String(r.status || '').toLowerCase();
    const isCompleted = stageIdx === 3 || s.includes('completed') || s.includes('finished') || s.includes('checked out');
    const isVoidedOrCancelled = s.includes('void') || s.includes('cancel');

    return isCompleted || isVoidedOrCancelled;
  });

  const completedList = myHistoryBookings.filter(b => {
    const s = String(b.status || '').toLowerCase();
    return (getStageIndex(b.status) === 3 || s.includes('completed') || s.includes('finished')) && !s.includes('void') && !s.includes('cancel');
  });

  const voidedList = myHistoryBookings.filter(b => {
    const s = String(b.status || '').toLowerCase();
    return s.includes('void') || s.includes('cancel');
  });

  const filteredHistory = myHistoryBookings.filter((b) => {
    const s = String(b.status || '').toLowerCase();
    const isCompleted = (getStageIndex(b.status) === 3 || s.includes('completed') || s.includes('finished')) && !s.includes('void') && !s.includes('cancel');
    const isVoided = s.includes('void') || s.includes('cancel');

    if (historyFilter === 'Completed' && !isCompleted) return false;
    if (historyFilter === 'Voided' && !isVoided) return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const ref = (b.bookingRef || b.bookingNumber || `BK-${b.id}`).toLowerCase();
    const svc = (b.specificType || b.serviceName || b.packageName || '').toLowerCase();
    const date = (b.reservationDate || b.bookingDate || '').toLowerCase();
    return ref.includes(q) || svc.includes(q) || date.includes(q) || s.includes(q);
  });

  const totalSpent = completedList.reduce(
    (sum, b) => sum + parseFloat(b.estimatedTotal || b.grandTotal || b.totalPrice || 0),
    0
  );
  const totalGuests = completedList.reduce(
    (sum, b) => sum + parseInt(b.numberOfGuests || b.totalVisitors || 1, 10),
    0
  );
  const loyaltyPointsEarned = Math.floor(totalSpent / 20);

  const openReceiptModal = (booking) => {
    const ref = booking.bookingRef || booking.bookingNumber || `BK-${booking.id}`;
    const matched = (receipts || []).find(r => r.bookingRef === ref || r.booking_id === booking.id || r.receiptNo === ref);

    const receiptObj = matched || {
      receiptNo: `OR-2026-${String(booking.id || 100).padStart(6, '0')}`,
      date: booking.reservationDate || booking.bookingDate || getPhilippineDateStr(),
      time: booking.arrivalTime || booking.timeSlot || '09:00 AM',
      touristName: booking.clientName || booking.fullName || currentUser?.name || 'Client Guest',
      userNumber: booking.userNumber || currentUser?.user_number || 'CLT-2026-CLIENT',
      bookingRef: ref,
      items: booking.items || [{ name: booking.specificType || booking.serviceName || 'Duangon Day Pass', quantity: booking.numberOfGuests || 1, unitPrice: parseFloat(booking.totalPrice || 0) }],
      grandTotal: parseFloat(booking.estimatedTotal || booking.grandTotal || booking.totalPrice || 0),
      cashReceived: parseFloat(booking.estimatedTotal || booking.grandTotal || booking.totalPrice || 0),
      change: 0,
      staffName: 'Duangon Gate Cashier'
    };

    setSelectedReceiptForPrint(receiptObj);
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('void')) {
      return (
        <span
          className="px-3 py-1 text-[10px] font-extrabold rounded-full inline-flex items-center gap-1 uppercase shadow-sm"
          style={{
            background: 'rgba(244,63,94,0.15)',
            color: '#fb7185',
            border: '1px solid rgba(244,63,94,0.4)',
          }}
        >
          <XCircle className="w-3.5 h-3.5" /> VOIDED ✕
        </span>
      );
    }
    if (s.includes('cancel')) {
      return (
        <span
          className="px-3 py-1 text-[10px] font-extrabold rounded-full inline-flex items-center gap-1 uppercase shadow-sm"
          style={{
            background: 'rgba(239,68,68,0.15)',
            color: '#f87171',
            border: '1px solid rgba(239,68,68,0.4)',
          }}
        >
          <XCircle className="w-3.5 h-3.5" /> CANCELLED ✕
        </span>
      );
    }
    return (
      <span
        className="px-3 py-1 text-[10px] font-extrabold rounded-full inline-flex items-center gap-1 uppercase shadow-sm"
        style={{
          background: 'rgba(74,222,128,0.15)',
          color: 'var(--accent)',
          border: '1px solid rgba(74,222,128,0.4)',
        }}
      >
        <CheckCircle2 className="w-3.5 h-3.5" /> 04 — COMPLETED ✓
      </span>
    );
  };

  return (
    <div className="space-y-6 p-2 sm:p-4 max-w-[1600px] mx-auto" style={{ color: 'var(--text)' }}>

      {/* HEADER */}
      <div
        className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-5 border-b"
        style={{ borderColor: 'var(--line)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(74,222,128,0.12)',
              border: '1px solid rgba(74,222,128,0.3)',
              color: 'var(--accent)',
            }}
          >
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
              Client Booking History
            </h2>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
              Complete record of all your concluded stays, completed resort visits, and voided/cancelled entries.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => refreshAllLiveData && refreshAllLiveData()}
            className="px-3.5 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 text-xs font-bold transition-all"
            style={{
              background: isLight ? 'var(--panel)' : 'rgba(6,60,30,0.8)',
              border: '1px solid var(--line)',
              color: 'var(--accent)',
            }}
            title="Refresh database records"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>

          <button
            onClick={onNavigateBook}
            className="px-5 py-2.5 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all uppercase tracking-wider"
            style={{
              background: 'var(--accent)',
              boxShadow: '0 4px 14px rgba(74,222,128,0.3)',
            }}
          >
            <Sparkles className="w-4 h-4" /> Book New Visit
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="rounded-2xl p-4 flex items-center gap-3.5 shadow-lg border"
          style={{
            background: isLight ? 'var(--panel)' : '#0c1f16',
            borderColor: 'var(--line)',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(74,222,128,0.12)', color: 'var(--accent)' }}
          >
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--muted)' }}>COMPLETED VISITS</span>
            <div className="text-xl font-extrabold mt-0.5" style={{ color: 'var(--accent)' }}>
              {completedList.length} Completed Stays
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl p-4 flex items-center gap-3.5 shadow-lg border"
          style={{
            background: isLight ? 'var(--panel)' : '#0c1f16',
            borderColor: 'var(--line)',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(244,63,94,0.12)', color: '#fb7185' }}
          >
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--muted)' }}>VOIDED / CANCELLED</span>
            <div className="text-xl font-extrabold mt-0.5" style={{ color: '#fb7185' }}>
              {voidedList.length} Voided Entries
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl p-4 flex items-center gap-3.5 shadow-lg border"
          style={{
            background: isLight ? 'var(--panel)' : '#0c1f16',
            borderColor: 'var(--line)',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8' }}
          >
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--muted)' }}>TOTAL SETTLED</span>
            <div className="text-xl font-extrabold mt-0.5" style={{ color: '#38bdf8' }}>
              ₱{totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl p-4 flex items-center gap-3.5 shadow-lg border"
          style={{
            background: isLight ? 'var(--panel)' : '#0c1f16',
            borderColor: 'var(--line)',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--muted)' }}>LOYALTY POINTS</span>
            <div className="text-xl font-extrabold mt-0.5" style={{ color: '#fbbf24' }}>
              {loyaltyPointsEarned} Points
            </div>
          </div>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div
        className="rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 border"
        style={{
          background: isLight ? 'var(--panel)' : '#0c1f16',
          borderColor: 'var(--line)',
        }}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { key: 'All', label: 'All History', count: myHistoryBookings.length },
            { key: 'Completed', label: '04 Completed ✓', count: completedList.length },
            { key: 'Voided', label: 'Voided / Cancelled ✕', count: voidedList.length },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setHistoryFilter(f.key)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              style={
                historyFilter === f.key
                  ? {
                      background: f.key === 'Voided' ? '#e11d48' : 'var(--accent)',
                      color: isLight ? '#fff' : '#04170e',
                      boxShadow: '0 2px 8px rgba(74,222,128,0.3)',
                    }
                  : {
                      background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.3)',
                      color: 'var(--muted)',
                      border: '1px solid var(--line)',
                    }
              }
            >
              <span>{f.label}</span>
              <span
                className="px-1.5 py-0.2 rounded-full text-[10px] font-mono"
                style={
                  historyFilter === f.key
                    ? { background: isLight ? 'rgba(0,0,0,0.2)' : '#020f08', color: '#fff' }
                    : { background: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(74,222,128,0.1)', color: 'var(--accent)' }
                }
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Search reference, cottage, date, voided..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl pl-9 pr-4 py-2 text-xs outline-none transition-all"
              style={{
                background: isLight ? 'rgba(255,255,255,0.8)' : '#04150e',
                border: '1px solid var(--line)',
                color: 'var(--text)',
              }}
            />
          </div>

          <div className="flex items-center bg-black/20 p-1 rounded-xl border shrink-0" style={{ borderColor: 'var(--line)' }}>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* COMPLETED & VOIDED TRIPS LIST */}
      {filteredHistory.length === 0 ? (
        <div
          className="rounded-3xl border p-12 text-center space-y-4 shadow-xl"
          style={{
            background: isLight ? 'var(--panel)' : '#071d13',
            borderColor: 'var(--line)',
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ background: 'rgba(74,222,128,0.1)', color: 'var(--accent)', border: '1px solid var(--line)' }}
          >
            <History className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>No Booking History Records Found</h3>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {historyFilter !== 'All' ? `No bookings match the "${historyFilter}" category.` : 'Concluded stays, completed visits, and voided/cancelled entries will appear here automatically.'}
            </p>
          </div>
          <button
            onClick={onNavigateBook}
            className="mt-4 px-6 py-2.5 text-slate-950 font-black text-xs rounded-xl shadow-lg inline-flex items-center gap-2 cursor-pointer transition-all uppercase tracking-wider"
            style={{ background: 'var(--accent)' }}
          >
            <span>Explore Services &amp; Cottages</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredHistory.map((item) => {
            const grandTotal = parseFloat(item.estimatedTotal || item.grandTotal || item.totalPrice || 0);
            const ref = item.bookingRef || item.bookingNumber || `BK-${item.id}`;
            const visitDate = item.reservationDate || item.bookingDate || '2026-08-15';
            const s = String(item.status || '').toLowerCase();
            const isVoidedOrCancelled = s.includes('void') || s.includes('cancel');

            return (
              <div
                key={item.id || ref}
                className="rounded-3xl border-2 p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden transition-all"
                style={{
                  background: isLight ? 'var(--bg-1)' : '#071f14',
                  borderColor: isVoidedOrCancelled ? 'rgba(244,63,94,0.3)' : 'rgba(74,222,128,0.3)',
                  color: 'var(--text)',
                }}
              >
                {/* CARD HEADER */}
                <div className="flex justify-between items-start pb-3 border-b" style={{ borderColor: 'var(--line)' }}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs" style={{ color: isVoidedOrCancelled ? '#fb7185' : 'var(--accent)' }}>
                        {ref}
                      </span>
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded"
                        style={{
                          background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.4)',
                          color: 'var(--muted)',
                          border: '1px solid var(--line)',
                        }}
                      >
                        {item.userNumber || 'CLT-2026-CLIENT'}
                      </span>
                    </div>
                    <h3 className="text-base font-black mt-1" style={{ color: 'var(--text)' }}>
                      {item.specificType || item.serviceName || item.packageName || 'Duangon Resort Visit'}
                    </h3>
                  </div>

                  <div>
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                {/* DETAILS ROW */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div
                    className="p-2.5 rounded-xl space-y-0.5"
                    style={{ background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.3)', border: '1px solid var(--line)' }}
                  >
                    <span className="text-[10px] block font-bold" style={{ color: 'var(--muted)' }}>VISIT DATE</span>
                    <strong className="font-mono text-xs block" style={{ color: 'var(--text)' }}>{visitDate}</strong>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--accent)' }}>{item.arrivalTime || '09:00 AM'}</span>
                  </div>

                  <div
                    className="p-2.5 rounded-xl space-y-0.5"
                    style={{ background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.3)', border: '1px solid var(--line)' }}
                  >
                    <span className="text-[10px] block font-bold" style={{ color: 'var(--muted)' }}>VISITORS</span>
                    <strong className="text-xs block" style={{ color: 'var(--text)' }}>{item.numberOfGuests || item.totalVisitors || 1} Guests</strong>
                    <span className="text-[10px]" style={{ color: 'var(--muted)' }}>All Ages</span>
                  </div>

                  <div
                    className="p-2.5 rounded-xl space-y-0.5"
                    style={{ background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.3)', border: '1px solid var(--line)' }}
                  >
                    <span className="text-[10px] block font-bold" style={{ color: 'var(--muted)' }}>{isVoidedOrCancelled ? 'BILLED AMOUNT' : 'AMOUNT PAID'}</span>
                    <strong className="font-mono text-xs block" style={{ color: isVoidedOrCancelled ? 'var(--muted)' : 'var(--accent)' }}>
                      ₱{grandTotal.toLocaleString()}.00
                    </strong>
                    <span className="text-[10px]" style={{ color: isVoidedOrCancelled ? '#fb7185' : 'var(--muted)' }}>
                      {isVoidedOrCancelled ? 'No Payment Charged' : 'Cash at Gate'}
                    </span>
                  </div>
                </div>

                {/* VOIDED NOTICE OR SERVICES BREAKDOWN */}
                {isVoidedOrCancelled ? (
                  <div
                    className="p-3 rounded-xl space-y-1 text-xs border"
                    style={{
                      background: 'rgba(244,63,94,0.08)',
                      borderColor: 'rgba(244,63,94,0.25)',
                    }}
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Voided Reservation Record:
                    </span>
                    <p className="text-[11px] text-slate-300">
                      This reservation was voided/cancelled by Staff to prevent double payment or duplicate booking.
                    </p>
                  </div>
                ) : (
                  <div
                    className="p-3 rounded-xl space-y-1 text-xs"
                    style={{
                      background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.4)',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block" style={{ color: 'var(--accent)' }}>
                      Availed Services:
                    </span>
                    {Array.isArray(item.items) && item.items.length > 0 ? (
                      <ul className="divide-y divide-white/5 text-[11px] space-y-1">
                        {item.items.map((it, idx) => (
                          <li key={idx} className="pt-1 flex justify-between items-center" style={{ color: 'var(--text)' }}>
                            <span>{it.name || it.serviceName} {it.quantity > 1 ? `(x${it.quantity})` : ''}</span>
                            <strong className="font-mono" style={{ color: 'var(--accent)' }}>
                              ₱{(parseFloat(it.unitPrice || it.price || 0) * (it.quantity || 1)).toLocaleString()}.00
                            </strong>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px]" style={{ color: 'var(--text)' }}>
                        {item.specificType || item.serviceName || 'Duangon Cold Spring Entrance & Cottage Pass'}
                      </p>
                    )}
                  </div>
                )}

                {/* FOOTER ACTIONS */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>
                    {isVoidedOrCancelled ? 'Archived Void Entry' : 'Concluded Stay Record'}
                  </span>

                  <div className="flex items-center gap-2">
                    {!isVoidedOrCancelled && (
                      <button
                        onClick={() => openReceiptModal(item)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                        style={{
                          background: isLight ? 'var(--panel)' : 'rgba(6,50,25,0.7)',
                          border: '1px solid var(--line)',
                          color: 'var(--accent)',
                        }}
                        title="View & Print Official Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" /> View Receipt
                      </button>
                    )}

                    <button
                      onClick={onNavigateBook}
                      className="px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1"
                      style={{
                        background: 'var(--accent)',
                        color: isLight ? '#fff' : '#04170e',
                      }}
                      title="Book a new reservation"
                    >
                      Book Again
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LEDGER VIEW */
        <div
          className="rounded-2xl overflow-hidden shadow-xl border"
          style={{
            background: isLight ? 'var(--panel)' : '#0c1f16',
            borderColor: 'var(--line)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className="uppercase font-mono text-[10px]"
                style={{
                  background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.4)',
                  borderBottom: '1px solid var(--line)',
                  color: 'var(--muted)',
                }}
              >
                <tr>
                  <th className="p-3.5">Reservation ID</th>
                  <th className="p-3.5">Visit Date</th>
                  <th className="p-3.5">Services / Details</th>
                  <th className="p-3.5 text-center">Visitors</th>
                  <th className="p-3.5 text-right">Amount</th>
                  <th className="p-3.5 text-center">Historical Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y font-medium" style={{ borderColor: 'var(--line)' }}>
                {filteredHistory.map((item) => {
                  const grandTotal = parseFloat(item.estimatedTotal || item.grandTotal || item.totalPrice || 0);
                  const ref = item.bookingRef || item.bookingNumber || `BK-${item.id}`;
                  const visitDate = item.reservationDate || item.bookingDate || '2026-08-15';
                  const s = String(item.status || '').toLowerCase();
                  const isVoidedOrCancelled = s.includes('void') || s.includes('cancel');

                  return (
                    <tr key={item.id || ref} className="transition-all" style={{ borderBottom: '1px solid var(--line)' }}>
                      <td className="p-3.5 font-mono font-bold" style={{ color: isVoidedOrCancelled ? '#fb7185' : 'var(--accent)' }}>{ref}</td>
                      <td className="p-3.5 font-mono" style={{ color: 'var(--text)' }}>{visitDate}</td>
                      <td className="p-3.5 max-w-xs truncate" style={{ color: 'var(--text)' }}>
                        {item.specificType || item.serviceName || item.packageName || 'Duangon Resort Visit'}
                      </td>
                      <td className="p-3.5 text-center" style={{ color: 'var(--text)' }}>
                        {item.numberOfGuests || item.totalVisitors || 1} Pax
                      </td>
                      <td className="p-3.5 text-right font-bold font-mono text-sm" style={{ color: isVoidedOrCancelled ? 'var(--muted)' : 'var(--accent)' }}>
                        ₱{grandTotal.toLocaleString()}.00
                      </td>
                      <td className="p-3.5 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {!isVoidedOrCancelled && (
                          <button
                            onClick={() => openReceiptModal(item)}
                            className="p-1.5 rounded-lg cursor-pointer transition-all inline-flex items-center gap-1 text-xs font-bold"
                            style={{
                              background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(74,222,128,0.12)',
                              color: 'var(--accent)',
                              border: '1px solid var(--line)',
                            }}
                            title="Print Official Receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OFFICIAL RECEIPT MODAL */}
      {selectedReceiptForPrint && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl relative font-mono">
            <div className="text-center border-b border-dashed border-slate-300 pb-4">
              <span className="text-xs font-bold text-emerald-700 block">DUANGON COLD SPRING RESORT</span>
              <h3 className="text-lg font-black tracking-tight">OFFICIAL RECEIPT</h3>
              <p className="text-[10px] text-slate-500">Zamora, Bilar, Bohol • TIN: 402-198-334</p>
              <div className="mt-2 text-xs font-bold text-emerald-800 bg-emerald-50 py-1 rounded">
                Receipt #{selectedReceiptForPrint.receiptNo}
              </div>
            </div>

            <div className="text-xs space-y-1 text-slate-600 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between"><span>Date/Time:</span><strong>{selectedReceiptForPrint.date} {selectedReceiptForPrint.time}</strong></div>
              <div className="flex justify-between"><span>Tourist:</span><strong>{selectedReceiptForPrint.touristName}</strong></div>
              <div className="flex justify-between"><span>User ID:</span><strong>{selectedReceiptForPrint.userNumber}</strong></div>
              <div className="flex justify-between"><span>Booking Ref:</span><strong>{selectedReceiptForPrint.bookingRef}</strong></div>
              <div className="flex justify-between"><span>Cashier:</span><strong>{selectedReceiptForPrint.staffName}</strong></div>
              <div className="flex justify-between"><span>Status:</span><strong className="text-emerald-700">PAID &amp; COMPLETED ✓</strong></div>
            </div>

            <div className="space-y-1.5 text-xs border-b border-dashed border-slate-300 pb-3">
              {Array.isArray(selectedReceiptForPrint.items) && selectedReceiptForPrint.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.name || it.serviceName} x{it.quantity || 1}</span>
                  <strong>₱{(parseFloat(it.unitPrice || it.price || 0) * (it.quantity || 1)).toLocaleString()}.00</strong>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-xs pt-1">
              <div className="flex justify-between text-base font-black text-slate-900">
                <span>TOTAL PAID:</span>
                <span>₱{selectedReceiptForPrint.grandTotal.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Method:</span>
                <span>Walk-In Cash (Gate Verified)</span>
              </div>
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-400">
              <p>Thank you for visiting Duangon Cold Spring! 🌿</p>
              <p>Completed visit record archived in your booking history.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              <button
                onClick={() => setSelectedReceiptForPrint(null)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
