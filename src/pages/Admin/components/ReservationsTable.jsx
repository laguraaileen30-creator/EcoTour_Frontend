import React, { useState } from 'react';
import {
  DollarSign, Calendar, CheckCircle2, UserCheck, FileText, Search,
  Filter, RefreshCw, Clock, Sparkles, Check, Eye, X, Ticket, Package
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { formatCurrency } from '../utils/dashboardHelpers';
import PaymentModal from '../modals/PaymentModal';
import OfficialReceiptModal from '../modals/OfficialReceiptModal';
import VerticalReservationTimeline, { getStageIndex } from '../../../components/VerticalReservationTimeline';

export default function ReservationsTable({ defaultFilter = 'all' }) {
  const {
    resortBookings = [],
    receipts = [],
    updateResortBookingStatus,
    checkInBookingGuest,
    checkOutBookingGuest,
    refreshAllLiveData
  } = useDashboard();

  const [payBooking, setPayBooking] = useState(null);
  const [viewReceiptData, setViewReceiptData] = useState(null);
  const [selectedTimelineBooking, setSelectedTimelineBooking] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState(defaultFilter);

  React.useEffect(() => {
    if (defaultFilter) {
      setStatusFilter(defaultFilter);
    }
  }, [defaultFilter]);

  // Live Online Reservations
  const allAdminReservations = resortBookings || [];

  const isVoidedOrCancelled = (status) => {
    const s = String(status || '').toLowerCase();
    return s.includes('cancel') || s.includes('void') || s.includes('reject');
  };

  // Calculate live counters for the 4 canonical stages + voided
  const pendingCount = allAdminReservations.filter(b => getStageIndex(b.status) === 0).length;
  const paidCount = allAdminReservations.filter(b => getStageIndex(b.status) === 1).length;
  const usingServicesCount = allAdminReservations.filter(b => getStageIndex(b.status) === 2).length;
  const completedCount = allAdminReservations.filter(b => getStageIndex(b.status) === 3).length;
  const voidedCount = allAdminReservations.filter(b => isVoidedOrCancelled(b.status)).length;

  // Filter live database bookings
  const filteredBookings = allAdminReservations.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    const clientName = (b.clientName || b.fullName || b.touristName || '').toLowerCase();
    const bookingRef = (b.bookingRef || b.bookingNumber || '').toLowerCase();
    const clientEmail = (b.clientEmail || b.email || '').toLowerCase();
    const userNumber = (b.userNumber || b.client_id || '').toLowerCase();
    const serviceName = (b.specificType || b.serviceName || b.packageName || '').toLowerCase();

    const matchesSearch = (
      !q ||
      clientName.includes(q) ||
      bookingRef.includes(q) ||
      clientEmail.includes(q) ||
      userNumber.includes(q) ||
      serviceName.includes(q)
    );

    const bDate = b.bookingDate || b.reservationDate || '';
    const matchesDate = !selectedDate || bDate === selectedDate;

    const stageIdx = getStageIndex(b.status);
    const isVoid = isVoidedOrCancelled(b.status);
    let matchesStatus = true;
    if (statusFilter === 'pending') {
      matchesStatus = (stageIdx === 0);
    } else if (statusFilter === 'paid') {
      matchesStatus = (stageIdx === 1);
    } else if (statusFilter === 'using') {
      matchesStatus = (stageIdx === 2);
    } else if (statusFilter === 'completed') {
      matchesStatus = (stageIdx === 3);
    } else if (statusFilter === 'voided') {
      matchesStatus = isVoid;
    } else {
      matchesStatus = true; // 'all'
    }

    return matchesSearch && matchesDate && matchesStatus;
  });

  const databaseDates = Array.from(new Set(allAdminReservations.map(b => b.bookingDate || b.reservationDate).filter(Boolean))).sort();

  const getStatusBadge = (status) => {
    if (isVoidedOrCancelled(status)) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase flex items-center justify-center gap-1">
          <X className="w-3 h-3" /> Voided / Cancelled
        </span>
      );
    }
    const stageIdx = getStageIndex(status);
    if (stageIdx === 3) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase flex items-center justify-center gap-1">
          <Check className="w-3 h-3" /> 04 — Completed
        </span>
      );
    }
    if (stageIdx === 2) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/40 uppercase flex items-center justify-center gap-1 animate-pulse">
          <Sparkles className="w-3 h-3" /> 03 — Using Services
        </span>
      );
    }
    if (stageIdx === 1) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase flex items-center justify-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> 02 — Paid
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase flex items-center justify-center gap-1">
        <Clock className="w-3 h-3 animate-pulse" /> 01 — Pending
      </span>
    );
  };

  return (
    <div className="space-y-4">
      
      <div className="card space-y-4">
        
        {/* HEADER & STAGE FILTER BREAKDOWN */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-emerald-800/40 pb-4 gap-4">
          <div>
            <h3 className="font-bold text-emerald-300 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" /> Duangon Resort Reservations & Booking History
            </h3>
            <p className="text-xs text-emerald-200/70">
              Real-time monitoring across stages: Pending Payment → Paid → Using Services → Completed → Voided
            </p>
          </div>

          {/* STAGE BREAKDOWN PILLS */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#04150e] p-1.5 rounded-2xl border border-emerald-900/60 shadow-inner">
            {[
              { key: 'all', label: 'All', count: allAdminReservations.length },
              { key: 'pending', label: '01 Pending', count: pendingCount },
              { key: 'paid', label: '02 Paid', count: paidCount },
              { key: 'using', label: '03 Using Services', count: usingServicesCount },
              { key: 'completed', label: '04 Completed', count: completedCount },
              { key: 'voided', label: 'Voided ✕', count: voidedCount },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === f.key
                    ? (f.key === 'voided' ? 'bg-rose-600 text-white font-black shadow-lg ring-2 ring-rose-400/40' : 'bg-emerald-500 text-slate-950 font-black shadow-lg ring-2 ring-emerald-400/40')
                    : (f.key === 'voided' ? 'bg-rose-950/40 text-rose-300 hover:text-white hover:bg-rose-950 border border-rose-800/40' : 'bg-[#07241a] text-slate-300 hover:text-white hover:bg-emerald-950 border border-emerald-800/40')
                }`}
              >
                <span>{f.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                  statusFilter === f.key ? 'bg-slate-950 text-emerald-300' : 'bg-emerald-950 text-emerald-400'
                }`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH, DATE FILTER & VIEW MODE BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#04150e] p-3 rounded-xl border border-emerald-900/40">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client name, email, user #, or BK ref..."
              className="w-full bg-[#07241a] border border-emerald-800/60 pl-8 pr-3 py-1.5 rounded-lg text-xs text-white placeholder:text-emerald-500/50 outline-none focus:border-emerald-400"
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-400/60" />
          </div>

          {/* Date History Picker */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="font-semibold text-emerald-300">Filter Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#07241a] border border-emerald-800/60 text-emerald-100 text-xs rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-[10px] text-emerald-400 hover:text-emerald-200 underline cursor-pointer"
              >
                Clear Date
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/60'
              }`}
            >
              📋 List View ({filteredBookings.length})
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/60'
              }`}
            >
              📅 Calendar & Date History
            </button>
          </div>

        </div>

        {/* VIEW CONTENT: CALENDAR MODE */}
        {viewMode === 'calendar' && (
          <div className="p-4 bg-[#04150e] rounded-xl border border-emerald-900/40 space-y-4">
            <div className="flex justify-between items-center border-b border-emerald-800/40 pb-2">
              <h4 className="font-bold text-emerald-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" /> Database Booking History Calendar Dates
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                {databaseDates.length} Registered Date(s) Found in DB
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedDate('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  selectedDate === ''
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#07241a] text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60'
                }`}
              >
                📅 All Dates ({resortBookings.length} bookings)
              </button>
              {databaseDates.map((dStr) => {
                const countForDate = resortBookings.filter(b => (b.bookingDate || b.reservationDate) === dStr).length;
                return (
                  <button
                    key={dStr}
                    onClick={() => setSelectedDate(dStr)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      selectedDate === dStr
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-[#07241a] text-emerald-200 border border-emerald-800/60 hover:bg-emerald-900/60'
                    }`}
                  >
                    📅 {dStr} ({countForDate} booking{countForDate > 1 ? 's' : ''})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* BOOKINGS TABLE LIST */}
        <div className="overflow-x-auto rounded-xl border border-emerald-800/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-emerald-950/80 text-emerald-300 border-b border-emerald-800/40 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Booking Ref</th>
                <th className="p-3">Client Name</th>
                <th className="p-3">Reserved Services</th>
                <th className="p-3">Booking Date</th>
                <th className="p-3 text-right">Total (₱)</th>
                <th className="p-3 text-center">Real-Time Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/30 text-emerald-100 font-medium">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400 font-semibold">
                    {selectedDate 
                      ? `No registered reservations found in the database for date: ${selectedDate}`
                      : 'No resort reservations found matching current filter.'}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const clientDisp = b.clientName || b.fullName || b.touristName || 'Guest';
                  const serviceDisp = b.specificType || b.serviceName || b.packageName || 'Resort Day Pass';
                  const priceVal = parseFloat(b.totalPrice || b.grandTotal || b.estimatedTotal || 0);
                  const dateDisp = b.bookingDate || b.reservationDate || 'Today';

                  return (
                    <tr key={b.id || b.bookingRef} className="hover:bg-emerald-950/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-emerald-400">{b.bookingRef || b.bookingNumber || `BK-${b.id}`}</td>
                      <td className="p-3 font-bold text-emerald-100">
                        {clientDisp}
                        <span className="block text-[10px] font-mono text-slate-400 font-normal">{b.userNumber || 'CLT-2026-901'}</span>
                      </td>
                      <td className="p-3 text-emerald-300 max-w-xs truncate">{serviceDisp}</td>
                      <td className="p-3 font-mono text-slate-300">{dateDisp}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(priceVal)}</td>
                      <td className="p-3 text-center">
                        {getStatusBadge(b.status)}
                      </td>
                      <td className="p-3 text-center space-x-1.5 flex items-center justify-center">
                        <button
                          onClick={() => setSelectedTimelineBooking(b)}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] rounded-lg cursor-pointer shadow flex items-center gap-1 uppercase"
                          title="View Real-time Timeline Tracker"
                        >
                          <Eye className="w-3 h-3" /> Track Timeline
                        </button>

                        <button
                          onClick={() => setViewReceiptData(b)}
                          className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 font-bold text-[10px] rounded-lg cursor-pointer inline-flex items-center gap-1"
                          title="View Official Receipt"
                        >
                          <FileText className="w-3 h-3" /> Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL TIMELINE & RESERVATION DETAILS MODAL */}
      {selectedTimelineBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#071f14] border-2 border-emerald-500/40 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl my-8 text-white relative">
            <button
              onClick={() => setSelectedTimelineBooking(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-emerald-900/40 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* MODAL HEADER */}
            <div className="flex items-center gap-3 border-b border-emerald-900/60 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">
                  Reservation #{selectedTimelineBooking.bookingRef || selectedTimelineBooking.bookingNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  Client: <strong className="text-emerald-300">{selectedTimelineBooking.clientName || selectedTimelineBooking.fullName || 'Guest'}</strong> • ID: <span className="font-mono text-emerald-400">{selectedTimelineBooking.userNumber || 'CLT-2026-901'}</span>
                </p>
              </div>
            </div>

            {/* TWO COLUMN: SUMMARY & SERVICES LEFT | VERTICAL TIMELINE RIGHT */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-6 space-y-4">
                <div className="bg-black/40 p-4 rounded-2xl border border-emerald-900/60 space-y-2 text-xs">
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">
                    Reserved Services Breakdown:
                  </span>

                  {Array.isArray(selectedTimelineBooking.items) && selectedTimelineBooking.items.length > 0 ? (
                    <ul className="divide-y divide-white/5 text-xs space-y-1">
                      {selectedTimelineBooking.items.map((it, idx) => (
                        <li key={idx} className="pt-1.5 flex justify-between items-center text-slate-200">
                          <span>{it.name || it.serviceName} {it.quantity > 1 ? `(x${it.quantity})` : ''}</span>
                          <strong className="font-mono text-emerald-300">
                            ₱{(parseFloat(it.unitPrice || it.price || 0) * (it.quantity || 1)).toLocaleString()}.00
                          </strong>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-300 py-1">
                      {selectedTimelineBooking.specificType || selectedTimelineBooking.serviceName || 'Duangon Day Pass Entrance & Cottage'}
                    </p>
                  )}

                  <div className="pt-3 border-t border-emerald-900/80 flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-300">Total Amount:</span>
                    <strong className="text-emerald-400 font-mono text-base font-black">
                      ₱{parseFloat(selectedTimelineBooking.estimatedTotal || selectedTimelineBooking.grandTotal || selectedTimelineBooking.totalPrice || 0).toLocaleString()}.00
                    </strong>
                  </div>
                </div>

                <div className="bg-black/30 p-3.5 rounded-2xl border border-emerald-900/40 space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-slate-400">Target Date:</span><span className="font-mono text-white">{selectedTimelineBooking.reservationDate || selectedTimelineBooking.bookingDate}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Arrival Time:</span><span className="text-white">{selectedTimelineBooking.arrivalTime || selectedTimelineBooking.timeSlot || '09:00 AM'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Total Guests:</span><span className="text-white">{selectedTimelineBooking.numberOfGuests || selectedTimelineBooking.totalVisitors || 1} Pax</span></div>
                </div>
              </div>

              <div className="md:col-span-6">
                <VerticalReservationTimeline
                  currentStatus={selectedTimelineBooking.status}
                  reservation={selectedTimelineBooking}
                  userRole="admin"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <PaymentModal booking={payBooking} onClose={() => setPayBooking(null)} />
      <OfficialReceiptModal receiptData={viewReceiptData} onClose={() => setViewReceiptData(null)} />
    </div>
  );
}