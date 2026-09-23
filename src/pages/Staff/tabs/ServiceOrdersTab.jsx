import React, { useState, useRef } from 'react';
import {
  FileText, Search, CheckCircle2, Clock, XCircle, ArrowRight,
  Ticket, DollarSign, Printer, Coins, X, Check, Sparkles, Eye, UserCheck, RefreshCw, Calendar, Plus
} from 'lucide-react';
import { useStaff } from '../hooks/useStaff';
import { useEcoTour } from '../../../context/EcoTourContext';
import VerticalReservationTimeline, { getStageIndex } from '../../../components/VerticalReservationTimeline';
import { getPhilippineDateStr, getPhilippineTimeStr, getPhilippineFormattedDate } from '../../../utils/phTime';
import AddServicesModal from '../../../components/AddServicesModal';
import BookingBreakdown from '../../../components/BookingBreakdown';
import { apiJson } from '../../../utils/catalog';
import FacilityAssignmentModal from '../../../components/FacilityAssignmentModal';

export default function ServiceOrdersTab() {
  const { resortBookings, updateResortBookingStatus } = useStaff();
  const { receipts, processPOSTransaction, currentUser, theme, refreshAllLiveData, cancelReservationBooking, showAlert, showConfirm } = useEcoTour();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
  const [cashReceivedInput, setCashReceivedInput] = useState('');
  const [issuedReceipt, setIssuedReceipt] = useState(null);
  const [selectedTimelineBooking, setSelectedTimelineBooking] = useState(null);
  const [stageFilter, setStageFilter] = useState('all');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const paymentLockRef = useRef(false);
  const [addServicesBooking, setAddServicesBooking] = useState(null);
  const [assignBooking, setAssignBooking] = useState(null);
  const isLight = theme === 'light';

  const todayStr = getPhilippineDateStr();
  const formattedToday = getPhilippineFormattedDate();
  const [dateFilterMode, setDateFilterMode] = useState('today'); // 'today' | 'all' | 'custom'
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const bookingsList = resortBookings || [];

  const isVoidedOrCancelled = (status) => {
    const s = String(status || '').toLowerCase();
    return s.includes('cancel') || s.includes('void') || s.includes('reject');
  };

  const pendingCount = bookingsList.filter(b => getStageIndex(b.status) === 0).length;
  const paidCount = bookingsList.filter(b => getStageIndex(b.status) === 1).length;
  const usingCount = bookingsList.filter(b => getStageIndex(b.status) === 2).length;
  const completedCount = bookingsList.filter(b => getStageIndex(b.status) === 3).length;
  const voidedCount = bookingsList.filter(b => isVoidedOrCancelled(b.status)).length;

  const filteredBookings = bookingsList.filter((b) => {
    const query = searchQuery.toLowerCase();
    const bDate = (b.reservationDate || b.bookingDate || '').trim();

    let matchesDate = true;
    if (dateFilterMode === 'today') {
      matchesDate = bDate === todayStr || !bDate;
    } else if (dateFilterMode === 'custom') {
      matchesDate = bDate === selectedDate;
    }

    const matchesSearch = (
      (b.clientName && b.clientName.toLowerCase().includes(query)) ||
      (b.fullName && b.fullName.toLowerCase().includes(query)) ||
      (b.userNumber && b.userNumber.toLowerCase().includes(query)) ||
      (b.bookingRef && b.bookingRef.toLowerCase().includes(query)) ||
      (b.bookingNumber && b.bookingNumber.toLowerCase().includes(query)) ||
      (b.serviceName && b.serviceName.toLowerCase().includes(query)) ||
      (b.specificType && b.specificType.toLowerCase().includes(query)) ||
      bDate.toLowerCase().includes(query)
    );

    const stageIdx = getStageIndex(b.status);
    const isVoid = isVoidedOrCancelled(b.status);
    let matchesStage = true;
    if (stageFilter === 'pending') matchesStage = stageIdx === 0;
    else if (stageFilter === 'paid') matchesStage = stageIdx === 1;
    else if (stageFilter === 'using') matchesStage = stageIdx === 2;
    else if (stageFilter === 'completed') matchesStage = stageIdx === 3;
    else if (stageFilter === 'voided') matchesStage = isVoid;

    return matchesDate && matchesSearch && matchesStage;
  });

  // What is still owed (total minus reservation fee / earlier payments)
  const balanceOf = (b) => {
    const total = parseFloat(b.estimatedTotal || b.grandTotal || b.totalPrice || 0);
    return b.balanceDue !== undefined ? parseFloat(b.balanceDue) : Math.max(0, total - parseFloat(b.amountPaid || 0));
  };

  const openPaymentModal = (booking) => {
    setSelectedBookingForPayment(booking);
    const due = balanceOf(booking);
    setCashReceivedInput(due ? String(due) : '');
  };

  const handleCancelBooking = async (booking) => {
    const refCode = booking.bookingRef || booking.bookingNumber || `BK-${booking.id}`;
    const name = booking.clientName || booking.fullName || 'Client Guest';
    const confirmed = await showConfirm({
      title: 'Cancel Reservation',
      message: `Are you sure you want to CANCEL & VOID reservation ${refCode} for ${name}?`,
      details: 'This will mark the reservation as Voided/Cancelled in the database and release all reserved slots.',
      type: 'danger',
      confirmText: 'YES, Cancel & Void'
    });
    if (!confirmed) return;

    if (cancelReservationBooking) {
      await cancelReservationBooking(booking.id || refCode);
    } else if (updateResortBookingStatus) {
      await updateResortBookingStatus(booking.id || refCode, 'Cancelled');
    }

    if (selectedTimelineBooking && (selectedTimelineBooking.id === booking.id || selectedTimelineBooking.bookingRef === refCode)) {
      setSelectedTimelineBooking(null);
    }
    if (refreshAllLiveData) {
      refreshAllLiveData();
    }
  };

  const handleConfirmCashPayment = async () => {
    if (!selectedBookingForPayment || paymentLockRef.current) return;
    // Block paying a booking that is no longer pending (prevents double payment)
    const liveBooking = bookingsList.find(b => (b.id && b.id === selectedBookingForPayment.id) || (b.bookingRef && b.bookingRef === selectedBookingForPayment.bookingRef));
    if (liveBooking && getStageIndex(liveBooking.status) !== 0) {
      setSelectedBookingForPayment(null);
      return showAlert({ title: 'Already Paid', message: 'This booking has already been paid. The client was not charged again.', type: 'info' });
    }
    const totalDue = balanceOf(selectedBookingForPayment);
    const cashRec = parseFloat(cashReceivedInput) || 0;

    if (cashRec < totalDue) {
      return showAlert({
        title: 'Insufficient Cash',
        message: `Please collect at least ₱${totalDue.toLocaleString()} (entered: ₱${cashRec.toLocaleString()}).`,
        type: 'warning'
      });
    }

    paymentLockRef.current = true;
    setIsSubmittingPayment(true);
    try {
      const refCode = selectedBookingForPayment.bookingRef || selectedBookingForPayment.bookingNumber || `BK-${selectedBookingForPayment.id}`;
      const changeAmt = Math.max(0, cashRec - totalDue);

      // Saved on the server (payments + revenue shares); marks the booking Paid when nothing is left owing
      const res = await apiJson(`/reservations/${encodeURIComponent(selectedBookingForPayment.id || refCode)}/payments`, {
        method: 'POST',
        auth: true,
        body: { kind: 'BALANCE', cash_received: cashRec, staff_name: currentUser?.name || 'Staff Member' },
      });
      const paid = res.data;
      const paymentRecord = {
        items: [{ name: parseFloat(selectedBookingForPayment.amountPaid || 0) > 0 ? 'Balance payment' : (selectedBookingForPayment.packageName || selectedBookingForPayment.serviceName || 'Resort Reservation'), quantity: 1, price: paid.amount, unitPrice: paid.amount }],
      };

      const receipt = {
        receiptNo: paid.receiptNo,
        booking_id: selectedBookingForPayment.id,
        userNumber: selectedBookingForPayment.userNumber || 'CLT-2026-901',
        touristName: selectedBookingForPayment.clientName || selectedBookingForPayment.fullName || 'Guest',
        touristContact: selectedBookingForPayment.contactNumber || '',
        touristEmail: selectedBookingForPayment.clientEmail || '',
        date: getPhilippineDateStr(),
        time: getPhilippineTimeStr(),
        grandTotal: paid.amount,
        cashReceived: paid.cashReceived,
        change: paid.change,
        staffName: currentUser?.name || 'Staff Member',
        items: paymentRecord.items
      };
      setIssuedReceipt(receipt);

      if (selectedTimelineBooking && (selectedTimelineBooking.id === selectedBookingForPayment.id || selectedTimelineBooking.bookingRef === refCode)) {
        setSelectedTimelineBooking(prev => prev ? { ...prev, status: 'Paid' } : null);
      }

      setSelectedBookingForPayment(null);
      setCashReceivedInput('');
      if (refreshAllLiveData) {
        refreshAllLiveData();
      }
    } catch (err) {
      console.error('Payment confirmation error:', err);
      showAlert({
        title: 'Payment Error',
        message: 'Could not complete payment: ' + (err.message || 'Unknown error'),
        type: 'danger'
      });
    } finally {
      paymentLockRef.current = false;
      setIsSubmittingPayment(false);
    }
  };

  const handleTimelineAction = async (actionType, booking) => {
    const targetId = booking.bookingRef || booking.bookingNumber || booking.id;
    if (actionType === 'confirm_payment') {
      openPaymentModal(booking);
    } else if (actionType === 'start_service') {
      const confirmed = await showConfirm({
        title: 'Check-In & Start Service',
        message: `Confirm Check-In and Start Services for ${booking.clientName || 'guest'} (${booking.bookingRef || targetId})?`,
        details: 'The guest is physically at the resort and is now actively using availed services.',
        type: 'complete',
        confirmText: 'YES, Check-In Guest'
      });
      if (!confirmed) return;
      updateResortBookingStatus(targetId, 'Using Services');
      setSelectedTimelineBooking(prev => prev ? { ...prev, status: 'Using Services' } : null);
    } else if (actionType === 'mark_completed') {
      const confirmed = await showConfirm({
        title: 'Complete Stay',
        message: `Mark stay as COMPLETED for ${booking.clientName || 'guest'} (${booking.bookingRef || targetId})?`,
        details: 'This will vacate rented cottages and release all amenities back to available inventory.',
        type: 'complete',
        confirmText: 'YES, Complete Stay'
      });
      if (!confirmed) return;
      updateResortBookingStatus(targetId, 'Completed');
      setSelectedTimelineBooking(prev => prev ? { ...prev, status: 'Completed' } : null);
    }
  };

  const getStatusBadge = (status) => {
    if (isVoidedOrCancelled(status)) {
      return (
        <span
          className="px-3 py-1 text-[10px] font-extrabold rounded-full inline-flex items-center justify-center gap-1 uppercase shadow-sm"
          style={{
            background: 'rgba(239,68,68,0.15)',
            color: '#fb7185',
            border: '1px solid rgba(239,68,68,0.4)',
          }}
        >
          <XCircle className="w-3.5 h-3.5" /> Voided / Cancelled
        </span>
      );
    }
    const stageIdx = getStageIndex(status);
    if (stageIdx === 3) {
      return (
        <span
          className="px-3 py-1 text-[10px] font-extrabold rounded-full inline-flex items-center justify-center gap-1 uppercase shadow-sm"
          style={{
            background: 'rgba(74,222,128,0.15)',
            color: 'var(--accent)',
            border: '1px solid rgba(74,222,128,0.4)',
          }}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" /> 04 — Completed
        </span>
      );
    }
    if (stageIdx === 2) {
      return (
        <span
          className="px-3 py-1 text-[10px] font-extrabold rounded-full inline-flex items-center justify-center gap-1 uppercase shadow-sm"
          style={{
            background: 'rgba(56,189,248,0.15)',
            color: '#38bdf8',
            border: '1px solid rgba(56,189,248,0.4)',
          }}
        >
          <Sparkles className="w-3.5 h-3.5" /> 03 — Using Services
        </span>
      );
    }
    if (stageIdx === 1) {
      return (
        <span
          className="px-3 py-1 text-[10px] font-extrabold rounded-full inline-flex items-center justify-center gap-1 uppercase shadow-sm"
          style={{
            background: 'rgba(74,222,128,0.15)',
            color: 'var(--accent)',
            border: '1px solid rgba(74,222,128,0.4)',
          }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> 02 — Paid
        </span>
      );
    }
    return (
      <span
        className="px-3 py-1 text-[10px] font-extrabold rounded-full inline-flex items-center justify-center gap-1 uppercase shadow-sm"
        style={{
          background: 'rgba(251,191,36,0.15)',
          color: '#fbbf24',
          border: '1px solid rgba(251,191,36,0.4)',
        }}
      >
        <Clock className="w-3.5 h-3.5 animate-pulse" /> 01 — Pending
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-2 sm:p-4" style={{ color: 'var(--text)' }}>
      {/* Header */}
      <div
        className="p-5 rounded-3xl border shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all"
        style={{
          background: isLight ? 'var(--panel)' : '#0c1f16',
          borderColor: 'var(--line)',
        }}
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
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-lg" style={{ color: 'var(--text)' }}>Real-Time Client Bookings &amp; Service Status</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1.5 shadow-sm">
                <Calendar className="w-3.5 h-3.5" /> Operating Date: {formattedToday}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              Manage client progression across the 4 stages: Pending Payment → Paid → Using Services → Completed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Refresh Button */}
          <button
            onClick={() => refreshAllLiveData && refreshAllLiveData()}
            className="p-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 text-xs font-bold transition-all"
            style={{
              background: isLight ? 'rgba(74,222,128,0.1)' : 'rgba(6,60,30,0.8)',
              border: '1px solid var(--line)',
              color: 'var(--accent)',
            }}
            title="Refresh database records"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>

          {/* Stage Filter Buttons */}
          <div
            className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl"
            style={{
              background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.4)',
              border: '1px solid var(--line)',
            }}
          >
            {[
              { key: 'all', label: 'All', count: bookingsList.length },
              { key: 'pending', label: '01 Pending', count: pendingCount },
              { key: 'paid', label: '02 Paid', count: paidCount },
              { key: 'using', label: '03 Using Services', count: usingCount },
              { key: 'completed', label: '04 Completed', count: completedCount },
              { key: 'voided', label: 'Voided / Cancelled ✕', count: voidedCount },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setStageFilter(f.key)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                style={
                  stageFilter === f.key
                    ? {
                        background: f.key === 'voided' ? '#e11d48' : 'var(--accent)',
                        color: isLight ? '#fff' : '#04170e',
                        boxShadow: f.key === 'voided' ? '0 2px 8px rgba(225,29,72,0.4)' : '0 2px 8px rgba(74,222,128,0.3)',
                      }
                    : {
                        background: 'transparent',
                        color: 'var(--muted)',
                      }
                }
              >
                <span>{f.label}</span>
                <span
                  className="px-1.5 py-0.2 rounded-full text-[10px] font-mono"
                  style={
                    stageFilter === f.key
                      ? {
                          background: isLight ? 'rgba(0,0,0,0.2)' : '#020f08',
                          color: '#fff',
                        }
                      : {
                          background: isLight ? 'rgba(0,0,0,0.08)' : (f.key === 'voided' ? 'rgba(244,63,94,0.15)' : 'rgba(74,222,128,0.12)'),
                          color: f.key === 'voided' ? '#fb7185' : 'var(--accent)',
                        }
                  }
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Date Filter & Search Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Date Filter Switcher */}
        <div
          className="flex items-center gap-1.5 p-1.5 rounded-2xl border text-xs shadow-sm flex-wrap"
          style={{
            background: isLight ? 'var(--panel)' : '#0c1f16',
            borderColor: 'var(--line)',
          }}
        >
          <span className="text-[11px] font-bold text-slate-400 pl-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Date:
          </span>

          <button
            type="button"
            onClick={() => setDateFilterMode('today')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1.5 text-xs ${
              dateFilterMode === 'today'
                ? 'bg-emerald-600 text-white shadow-md border border-emerald-400'
                : 'text-slate-400 hover:text-white bg-black/20'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            <span>Today ({todayStr})</span>
          </button>

          <button
            type="button"
            onClick={() => setDateFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1.5 text-xs ${
              dateFilterMode === 'all'
                ? 'bg-emerald-600 text-white shadow-md border border-emerald-400'
                : 'text-slate-400 hover:text-white bg-black/20'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>All Dates</span>
          </button>

          <div className="flex items-center gap-1.5 pl-1.5 border-l border-white/10">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setDateFilterMode('custom');
              }}
              className="px-2.5 py-1 rounded-xl text-xs font-mono bg-black/50 border border-emerald-500/40 text-white outline-none cursor-pointer focus:border-emerald-400"
              title="Pick a specific visit date"
            />
            {dateFilterMode === 'custom' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Custom
              </span>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
          <input
            type="text"
            placeholder="Search by client name, Client ID / User #, booking ref, or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl pl-10 pr-4 py-3 text-xs outline-none shadow-md font-medium transition-all"
            style={{
              background: isLight ? 'var(--panel)' : '#0c1f16',
              border: '1px solid var(--line)',
              color: 'var(--text)',
            }}
          />
        </div>
      </div>

      {/* Bookings Table */}
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
                <th className="p-3.5">Booking Ref</th>
                <th className="p-3.5">Client ID / Name</th>
                <th className="p-3.5">📅 Visit Date &amp; Time</th>
                <th className="p-3.5">Availed Services / Cottage</th>
                <th className="p-3.5 text-right">Total Amount</th>
                <th className="p-3.5 text-center">Live Status</th>
                <th className="p-3.5 text-right">Stage Progression Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y font-medium" style={{ borderColor: 'var(--line)' }}>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs" style={{ color: 'var(--muted)' }}>
                    No client reservations found matching {dateFilterMode === 'today' ? `today (${todayStr})` : 'filter criteria'}. Click "All Dates" to view bookings from other dates.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const stageIdx = getStageIndex(b.status);
                  const isVoid = isVoidedOrCancelled(b.status);
                  const refCode = b.bookingRef || b.bookingNumber || `REF-${b.id}`;
                  const bookingDateVal = b.reservationDate || b.bookingDate || todayStr;
                  const isTodayBooking = bookingDateVal === todayStr;

                  return (
                    <tr
                      key={b.id || refCode}
                      className="transition-all hover:bg-white/[0.02]"
                      style={{
                        borderBottom: '1px solid var(--line)',
                      }}
                    >
                      <td className="p-3.5 font-mono font-bold" style={{ color: isVoid ? '#fb7185' : 'var(--accent)' }}>{refCode}</td>
                      <td className="p-3.5">
                        <strong className="block text-xs font-bold" style={{ color: 'var(--text)' }}>
                          {b.clientName || b.fullName || b.touristName || 'Client Guest'}
                        </strong>
                        <span className="text-[10px] font-mono" style={{ color: 'var(--accent)' }}>
                          {b.userNumber || b.client_id || 'CLT-2026-901'}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-xs" style={{ color: 'var(--text)' }}>
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{bookingDateVal}</span>
                          {isTodayBooking && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono mt-0.5 flex items-center gap-1" style={{ color: 'var(--muted)' }}>
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{b.arrivalTime || b.timeSlot || '09:00 AM'}</span>
                        </div>
                      </td>
                      <td className="p-3.5 max-w-xs" style={{ color: 'var(--text)' }}>
                        <div className="font-bold text-xs">
                          {b.specificType || b.serviceName || b.packageName || 'Resort Amenities'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {b.totalVisitors || b.numberOfGuests || b.quantity || 1} Guests • {b.items?.length || 1} Service(s)
                        </div>
                        {Array.isArray(b.assignedFacilities) && b.assignedFacilities.length > 0 && (
                          <div className="text-[10px] font-bold mt-0.5" style={{ color: '#38bdf8' }}>
                            📍 {b.assignedFacilities.map(f => f.facilityName).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-extrabold text-sm" style={{ color: isVoid ? 'var(--muted)' : 'var(--accent)' }}>
                        ₱{parseFloat(b.estimatedTotal || b.grandTotal || b.totalPrice || b.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 text-center">
                        {getStatusBadge(b.status)}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {/* VOIDED / CANCELLED BADGE */}
                        {isVoid && (
                          <span
                            className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-xl inline-flex items-center gap-1"
                            style={{
                              background: 'rgba(239,68,68,0.12)',
                              color: '#fb7185',
                              border: '1px solid rgba(239,68,68,0.3)',
                            }}
                          >
                            <XCircle className="w-3 h-3" /> Voided Entry
                          </span>
                        )}

                        {/* STAGE 01: PENDING PAYMENT -> VOID / CANCEL & CONFIRM PAYMENT */}
                        {stageIdx === 0 && !isVoid && (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleCancelBooking(b)}
                              className="px-2.5 py-1.5 text-rose-300 hover:text-white text-[10px] font-bold rounded-xl cursor-pointer transition-all inline-flex items-center gap-1"
                              style={{
                                background: 'rgba(239,68,68,0.15)',
                                border: '1px solid rgba(239,68,68,0.4)',
                              }}
                              title="Cancel / Void duplicate or unconfirmed reservation to prevent double payment"
                            >
                              <XCircle className="w-3 h-3" /> Void
                            </button>
                            <button
                              onClick={() => openPaymentModal(b)}
                              className="px-3 py-1.5 text-white text-[10px] font-extrabold rounded-xl cursor-pointer transition-all shadow inline-flex items-center gap-1"
                              style={{
                                background: '#16a34a',
                                border: '1px solid rgba(134,239,172,0.4)',
                              }}
                            >
                              <Coins className="w-3 h-3" /> Confirm Payment
                            </button>
                          </div>
                        )}

                        {/* STAGE 02 / 03: ADD SERVICES (only the new services are charged) */}
                        {(stageIdx === 1 || stageIdx === 2) && (
                          <button
                            onClick={() => setAddServicesBooking(b)}
                            className="px-3 py-1.5 text-white text-[10px] font-extrabold rounded-xl cursor-pointer transition-all shadow inline-flex items-center gap-1 mr-1.5"
                            style={{
                              background: '#eab308',
                              border: '1px solid rgba(234,179,8,0.4)',
                            }}
                            title="Add more services — only the newly added services are charged"
                          >
                            <Plus className="w-3 h-3" /> Add Services
                          </button>
                        )}

                        {/* STAGE 02: PAID -> START SERVICE */}
                        {stageIdx === 1 && (
                          <button
                            onClick={() => handleTimelineAction('start_service', b)}
                            className="px-3 py-1.5 text-white text-[10px] font-extrabold rounded-xl cursor-pointer transition-all shadow inline-flex items-center gap-1"
                            style={{
                              background: '#0284c7',
                              border: '1px solid rgba(56,189,248,0.4)',
                            }}
                          >
                            <Sparkles className="w-3 h-3" /> Start Service / Check-In
                          </button>
                        )}

                        {/* STAGE 03: USING SERVICES -> COMPLETE STAY */}
                        {stageIdx === 2 && (
                          <div className="inline-flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleTimelineAction('mark_completed', b)}
                              className="px-3 py-1.5 text-white text-[10px] font-extrabold rounded-xl cursor-pointer transition-all shadow inline-flex items-center gap-1"
                              style={{
                                background: '#16a34a',
                                border: '1px solid rgba(134,239,172,0.4)',
                              }}
                            >
                              <Check className="w-3 h-3" /> Mark as Completed
                            </button>
                          </div>
                        )}

                        {/* STAGE 04: COMPLETED */}
                        {stageIdx === 3 && (
                          <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--accent)' }}>
                            ✓ Completed Stay
                          </span>
                        )}

                        {/* ASSIGN NUMBERED FACILITIES (Cottage 05, Videoke 02, ...) */}
                        {!isVoid && stageIdx !== 3 && (
                          <button
                            onClick={() => setAssignBooking(b)}
                            className="px-2.5 py-1.5 text-[10px] font-bold rounded-xl cursor-pointer inline-flex items-center gap-1 transition-all mr-1.5"
                            style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.4)', color: '#38bdf8' }}
                            title="Assign cottage / facility numbers"
                          >
                            <Ticket className="w-3 h-3" /> {Array.isArray(b.assignedFacilities) && b.assignedFacilities.length ? 'Units' : 'Assign'}
                          </button>
                        )}

                        {/* VIEW TIMELINE MODAL BUTTON */}
                        <button
                          onClick={() => setSelectedTimelineBooking(b)}
                          className="px-2.5 py-1.5 text-[10px] font-bold rounded-xl cursor-pointer inline-flex items-center gap-1 transition-all"
                          style={{
                            background: isLight ? 'var(--panel)' : 'rgba(6,50,25,0.7)',
                            border: '1px solid var(--line)',
                            color: 'var(--accent)',
                          }}
                          title="View Real-Time Timeline Tracker"
                        >
                          <Eye className="w-3 h-3" /> Timeline
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl my-8 relative border-2"
            style={{
              background: isLight ? 'var(--bg-1)' : '#071f14',
              borderColor: 'var(--line)',
              color: 'var(--text)',
            }}
          >
            <button
              onClick={() => setSelectedTimelineBooking(null)}
              className="absolute top-5 right-5 p-2 rounded-full cursor-pointer transition-all"
              style={{ color: 'var(--muted)' }}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'rgba(74,222,128,0.12)',
                  border: '1px solid rgba(74,222,128,0.3)',
                  color: 'var(--accent)',
                }}
              >
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold" style={{ color: 'var(--text)' }}>
                  Reservation #{selectedTimelineBooking.bookingRef || selectedTimelineBooking.bookingNumber}
                </h3>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Client: <strong style={{ color: 'var(--accent)' }}>{selectedTimelineBooking.clientName || selectedTimelineBooking.fullName || 'Guest'}</strong> • ID: <span className="font-mono" style={{ color: 'var(--accent)' }}>{selectedTimelineBooking.userNumber || 'CLT-2026-901'}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-6 space-y-4">
                <div
                  className="p-4 rounded-2xl space-y-2 text-xs"
                  style={{
                    background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.4)',
                    border: '1px solid var(--line)',
                  }}
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block" style={{ color: 'var(--accent)' }}>
                    What the client purchased:
                  </span>
                  <BookingBreakdown booking={selectedTimelineBooking} />
                </div>

                <div
                  className="p-3.5 rounded-2xl space-y-1 text-xs"
                  style={{
                    background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--line)',
                  }}
                >
                  <div className="flex justify-between"><span style={{ color: 'var(--muted)' }}>Target Date:</span><span className="font-mono" style={{ color: 'var(--text)' }}>{selectedTimelineBooking.reservationDate || selectedTimelineBooking.bookingDate}</span></div>
                  <div className="flex justify-between"><span style={{ color: 'var(--muted)' }}>Arrival Time:</span><span style={{ color: 'var(--text)' }}>{selectedTimelineBooking.arrivalTime || selectedTimelineBooking.timeSlot || '09:00 AM'}</span></div>
                  <div className="flex justify-between"><span style={{ color: 'var(--muted)' }}>Total Guests:</span><span style={{ color: 'var(--text)' }}>{selectedTimelineBooking.numberOfGuests || selectedTimelineBooking.totalVisitors || 1} Pax</span></div>
                </div>
              </div>

              <div className="md:col-span-6">
                <VerticalReservationTimeline
                  currentStatus={selectedTimelineBooking.status}
                  reservation={selectedTimelineBooking}
                  userRole="staff"
                  onActionClick={handleTimelineAction}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CASH PAYMENT & CHANGE MODAL */}
      {selectedBookingForPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl border-2"
            style={{
              background: isLight ? 'var(--bg-1)' : '#071f14',
              borderColor: 'var(--line)',
              color: 'var(--text)',
            }}
          >
            <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid var(--line)' }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(74,222,128,0.15)',
                    border: '1px solid rgba(74,222,128,0.3)',
                    color: 'var(--accent)',
                  }}
                >
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold" style={{ color: 'var(--text)' }}>Accept Cash &amp; Issue Receipt</h3>
                  <p className="text-[11px] font-mono" style={{ color: 'var(--muted)' }}>
                    Ref: {selectedBookingForPayment.bookingRef || selectedBookingForPayment.bookingNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBookingForPayment(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                style={{ background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)', color: 'var(--text)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              className="p-3.5 rounded-2xl space-y-2"
              style={{
                background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.4)',
                border: '1px solid var(--line)',
              }}
            >
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--muted)' }}>Client Name:</span>
                <strong style={{ color: 'var(--text)' }}>{selectedBookingForPayment.clientName || selectedBookingForPayment.fullName || 'Guest'}</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--muted)' }}>Target Date:</span>
                <span className="font-mono" style={{ color: 'var(--text)' }}>{selectedBookingForPayment.reservationDate || selectedBookingForPayment.bookingDate}</span>
              </div>
              <div className="flex justify-between text-xs pt-2" style={{ borderTop: '1px solid var(--line)' }}>
                <span className="font-bold" style={{ color: 'var(--accent)' }}>{parseFloat(selectedBookingForPayment.amountPaid || 0) > 0 ? 'BALANCE DUE:' : 'TOTAL AMOUNT DUE:'}</span>
                <strong className="text-base font-mono font-black" style={{ color: 'var(--accent)' }}>
                  ₱{balanceOf(selectedBookingForPayment).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold block" style={{ color: 'var(--text)' }}>Cash Received from Client (₱):</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-sm" style={{ color: 'var(--accent)' }}>₱</span>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={cashReceivedInput}
                  onChange={(e) => setCashReceivedInput(e.target.value)}
                  className="w-full rounded-2xl pl-8 pr-4 py-3 text-lg font-mono font-bold outline-none"
                  style={{
                    background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)',
                    border: '2px solid var(--line)',
                    color: 'var(--text)',
                  }}
                />
              </div>

              <div className="flex gap-2 pt-1">
                {[
                  balanceOf(selectedBookingForPayment),
                  500,
                  1000,
                  2000
                ].filter(val => val > 0).map((val, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCashReceivedInput(String(val))}
                    className="flex-1 py-1.5 rounded-xl text-[11px] font-mono font-bold cursor-pointer transition-all"
                    style={{
                      background: isLight ? 'var(--panel)' : 'rgba(6,50,25,0.7)',
                      border: '1px solid var(--line)',
                      color: 'var(--accent)',
                    }}
                  >
                    ₱{val}
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              const due = balanceOf(selectedBookingForPayment);
              const cash = parseFloat(cashReceivedInput) || 0;
              const change = cash - due;

              return (
                <div
                  className="p-4 rounded-2xl border flex justify-between items-center"
                  style={{
                    background: change >= 0
                      ? (isLight ? 'rgba(74,222,128,0.1)' : 'rgba(6,60,30,0.6)')
                      : (isLight ? 'rgba(251,191,36,0.1)' : 'rgba(50,30,6,0.6)'),
                    borderColor: change >= 0 ? 'rgba(74,222,128,0.4)' : 'rgba(251,191,36,0.4)',
                  }}
                >
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block" style={{ color: 'var(--muted)' }}>
                      {change >= 0 ? 'CHANGE TO RETURN TO CLIENT:' : 'REMAINING AMOUNT DUE:'}
                    </span>
                    <strong className="text-xl font-black font-mono" style={{ color: change >= 0 ? 'var(--accent)' : '#fbbf24' }}>
                      ₱{Math.abs(change).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                  {change >= 0 ? (
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                      style={{
                        background: 'rgba(74,222,128,0.15)',
                        color: 'var(--accent)',
                        border: '1px solid rgba(74,222,128,0.4)',
                      }}
                    >
                      <Check className="w-3.5 h-3.5" /> Full Payment
                    </span>
                  ) : (
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: 'rgba(251,191,36,0.15)',
                        color: '#fbbf24',
                        border: '1px solid rgba(251,191,36,0.4)',
                      }}
                    >
                      Pending ₱{Math.abs(change)}
                    </span>
                  )}
                </div>
              );
            })()}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBookingForPayment(null)}
                className="flex-1 py-3 font-bold text-xs rounded-2xl cursor-pointer transition-all"
                style={{
                  background: isLight ? 'var(--panel)' : '#1e293b',
                  color: 'var(--text)',
                  border: '1px solid var(--line)',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingPayment}
                onClick={handleConfirmCashPayment}
                className="flex-2 py-3 text-white font-black text-xs rounded-2xl shadow-xl cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider transition-all disabled:opacity-50"
                style={{
                  background: '#16a34a',
                  border: '1px solid rgba(134,239,172,0.4)',
                }}
              >
                {isSubmittingPayment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing Payment...
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" /> Confirm &amp; Issue Receipt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {addServicesBooking && (
        <AddServicesModal
          booking={addServicesBooking}
          onClose={() => setAddServicesBooking(null)}
          onDone={() => refreshAllLiveData && refreshAllLiveData()}
        />
      )}

      {assignBooking && (
        <FacilityAssignmentModal
          booking={assignBooking}
          onClose={() => setAssignBooking(null)}
          onChanged={() => refreshAllLiveData && refreshAllLiveData()}
        />
      )}

      {/* RECEIPT PREVIEW POPUP */}
      {issuedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl relative font-mono">
            <div className="text-center border-b border-dashed border-slate-300 pb-4">
              <span className="text-xs font-bold text-emerald-700 block">DUANGON COLD SPRING RESORT</span>
              <h3 className="text-lg font-black tracking-tight">OFFICIAL RECEIPT</h3>
              <p className="text-[10px] text-slate-500">Zamora, Bilar, Bohol • TIN: 402-198-334</p>
              <div className="mt-2 text-xs font-bold text-emerald-800 bg-emerald-50 py-1 rounded">
                Receipt #{issuedReceipt.receiptNo}
              </div>
            </div>

            <div className="text-xs space-y-1 text-slate-600 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between"><span>Date/Time:</span><strong>{issuedReceipt.date} {issuedReceipt.time}</strong></div>
              <div className="flex justify-between"><span>Tourist:</span><strong>{issuedReceipt.touristName}</strong></div>
              <div className="flex justify-between"><span>User ID:</span><strong>{issuedReceipt.userNumber}</strong></div>
              <div className="flex justify-between"><span>Booking Ref:</span><strong>{issuedReceipt.bookingRef}</strong></div>
              <div className="flex justify-between"><span>Cashier:</span><strong>{issuedReceipt.staffName}</strong></div>
            </div>

            <div className="space-y-1.5 text-xs border-b border-dashed border-slate-300 pb-3">
              {issuedReceipt.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.name || it.serviceName} x{it.quantity || 1}</span>
                  <strong>₱{(parseFloat(it.unitPrice || it.price || 0) * (it.quantity || 1)).toLocaleString()}.00</strong>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-xs pt-1">
              <div className="flex justify-between text-base font-black text-slate-900">
                <span>TOTAL PAID:</span>
                <span>₱{issuedReceipt.grandTotal.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cash Received:</span>
                <span>₱{issuedReceipt.cashReceived.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Change Returned:</span>
                <span>₱{issuedReceipt.change.toLocaleString()}.00</span>
              </div>
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-400">
              <p>Thank you for visiting Duangon Cold Spring! 🌿</p>
              <p>Transaction finished and recorded successfully.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button
                onClick={() => setIssuedReceipt(null)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Finish Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}