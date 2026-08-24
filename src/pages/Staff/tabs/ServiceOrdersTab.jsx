import React, { useState } from 'react';
import {
  FileText, Search, CheckCircle2, Clock, XCircle, ArrowRight,
  Ticket, DollarSign, Printer, Coins, X, Check, Sparkles, Eye, UserCheck, RefreshCw
} from 'lucide-react';
import { useStaff } from '../hooks/useStaff';
import { useEcoTour } from '../../../context/EcoTourContext';
import VerticalReservationTimeline, { getStageIndex } from '../../../components/VerticalReservationTimeline';
import { getPhilippineDateStr, getPhilippineTimeStr } from '../../../utils/phTime';

export default function ServiceOrdersTab() {
  const { resortBookings, updateResortBookingStatus, setActiveTab } = useStaff();
  const { receipts, processPOSTransaction, currentUser, theme, refreshAllLiveData, cancelReservationBooking } = useEcoTour();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
  const [cashReceivedInput, setCashReceivedInput] = useState('');
  const [issuedReceipt, setIssuedReceipt] = useState(null);
  const [selectedTimelineBooking, setSelectedTimelineBooking] = useState(null);
  const [stageFilter, setStageFilter] = useState('all');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const isLight = theme === 'light';

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
    const matchesSearch = (
      (b.clientName && b.clientName.toLowerCase().includes(query)) ||
      (b.fullName && b.fullName.toLowerCase().includes(query)) ||
      (b.userNumber && b.userNumber.toLowerCase().includes(query)) ||
      (b.bookingRef && b.bookingRef.toLowerCase().includes(query)) ||
      (b.bookingNumber && b.bookingNumber.toLowerCase().includes(query)) ||
      (b.serviceName && b.serviceName.toLowerCase().includes(query)) ||
      (b.specificType && b.specificType.toLowerCase().includes(query))
    );

    const stageIdx = getStageIndex(b.status);
    const isVoid = isVoidedOrCancelled(b.status);
    let matchesStage = true;
    if (stageFilter === 'pending') matchesStage = stageIdx === 0;
    else if (stageFilter === 'paid') matchesStage = stageIdx === 1;
    else if (stageFilter === 'using') matchesStage = stageIdx === 2;
    else if (stageFilter === 'completed') matchesStage = stageIdx === 3;
    else if (stageFilter === 'voided') matchesStage = isVoid;

    return matchesSearch && matchesStage;
  });

  const openPaymentModal = (booking) => {
    setSelectedBookingForPayment(booking);
    const grandTotal = parseFloat(booking.estimatedTotal || booking.grandTotal || booking.totalPrice || 0);
    setCashReceivedInput(grandTotal ? String(grandTotal) : '');
  };

  const handleCancelBooking = async (booking) => {
    const refCode = booking.bookingRef || booking.bookingNumber || `BK-${booking.id}`;
    const name = booking.clientName || booking.fullName || 'Client Guest';
    if (!window.confirm(`Are you sure you want to CANCEL & VOID reservation ${refCode} for ${name}?\n\nThis will mark the reservation as Voided/Cancelled in the database and release all reserved slots.`)) return;

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
    if (!selectedBookingForPayment || isSubmittingPayment) return;

    const grandTotal = parseFloat(selectedBookingForPayment.estimatedTotal || selectedBookingForPayment.grandTotal || selectedBookingForPayment.totalPrice || 0);
    const cashReceivedNum = parseFloat(cashReceivedInput) || 0;

    if (cashReceivedNum < grandTotal) {
      alert(`⚠️ Cash received (₱${cashReceivedNum}) is less than total amount due (₱${grandTotal}). Please collect the full amount.`);
      return;
    }

    try {
      setIsSubmittingPayment(true);

      const refCode = selectedBookingForPayment.bookingRef || selectedBookingForPayment.bookingNumber || `BK-${selectedBookingForPayment.id}`;
      const userNum = selectedBookingForPayment.userNumber || selectedBookingForPayment.client_id || `CLT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const items = Array.isArray(selectedBookingForPayment.items) && selectedBookingForPayment.items.length > 0
        ? selectedBookingForPayment.items
        : [{
            name: selectedBookingForPayment.specificType || selectedBookingForPayment.serviceName || 'Duangon Day Pass & Reservation',
            quantity: selectedBookingForPayment.numberOfGuests || selectedBookingForPayment.totalVisitors || 1,
            unitPrice: grandTotal,
            category: 'Cottage'
          }];

      const receiptData = {
        booking_id: selectedBookingForPayment.id,
        userNumber: userNum,
        bookingRef: refCode,
        touristName: selectedBookingForPayment.clientName || selectedBookingForPayment.fullName || selectedBookingForPayment.touristName || 'Client Visitor',
        touristEmail: selectedBookingForPayment.clientEmail || selectedBookingForPayment.email || selectedBookingForPayment.touristEmail || 'client@ecotourvista.com',
        touristContact: selectedBookingForPayment.clientPhone || selectedBookingForPayment.contactNumber || '',
        items,
        grandTotal,
        cashReceived: cashReceivedNum,
        date: selectedBookingForPayment.reservationDate || selectedBookingForPayment.bookingDate || getPhilippineDateStr()
      };

      if (processPOSTransaction) {
        processPOSTransaction(receiptData);
      }

      if (updateResortBookingStatus) {
        await updateResortBookingStatus(selectedBookingForPayment.id || refCode, 'Paid');
      }

      const createdReceipt = {
        receiptNo: `OR-${getPhilippineDateStr().replace(/-/g,'')}-${Math.floor(100 + Math.random() * 900)}`,
        date: getPhilippineDateStr(),
        time: getPhilippineTimeStr(),
        touristName: receiptData.touristName,
        userNumber: userNum,
        bookingRef: refCode,
        items,
        grandTotal,
        cashReceived: cashReceivedNum,
        change: Math.max(0, cashReceivedNum - grandTotal),
        staffName: currentUser?.name || 'Staff Cashier'
      };

      setIssuedReceipt(createdReceipt);
      if (selectedTimelineBooking && (selectedTimelineBooking.id === selectedBookingForPayment.id || selectedTimelineBooking.bookingRef === refCode)) {
        setSelectedTimelineBooking(prev => prev ? { ...prev, status: 'Paid' } : null);
      }
      setSelectedBookingForPayment(null);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleTimelineAction = (actionType, booking) => {
    const targetId = booking.id || booking.bookingRef || booking.bookingNumber;
    if (actionType === 'confirm_payment') {
      openPaymentModal(booking);
    } else if (actionType === 'start_service') {
      if (!window.confirm(`Start service & check in ${booking.clientName || 'guest'} for ${booking.bookingRef || targetId}?`)) return;
      updateResortBookingStatus(targetId, 'Using Services');
      setSelectedTimelineBooking(prev => prev ? { ...prev, status: 'Using Services' } : null);
    } else if (actionType === 'mark_completed') {
      if (!window.confirm(`Mark stay as COMPLETED for ${booking.clientName || 'guest'} (${booking.bookingRef || targetId})? This will vacate rented cottages/amenities.`)) return;
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
            <h3 className="font-extrabold text-lg" style={{ color: 'var(--text)' }}>Real-Time Client Bookings &amp; Service Status</h3>
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

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
        <input
          type="text"
          placeholder="Search by client name, Client ID / User #, or booking ref (e.g. BK-2026-XXXX)..."
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
                <th className="p-3.5">Availed Services / Cottage</th>
                <th className="p-3.5 text-right">Total Amount</th>
                <th className="p-3.5 text-center">Live Status</th>
                <th className="p-3.5 text-right">Stage Progression Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y font-medium" style={{ borderColor: 'var(--line)' }}>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs" style={{ color: 'var(--muted)' }}>
                    No client reservations found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const stageIdx = getStageIndex(b.status);
                  const isVoid = isVoidedOrCancelled(b.status);
                  const refCode = b.bookingRef || b.bookingNumber || `REF-${b.id}`;

                  return (
                    <tr
                      key={b.id || refCode}
                      className="transition-all"
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
                      <td className="p-3.5 max-w-xs truncate" style={{ color: 'var(--text)' }}>
                        {b.specificType || b.serviceName || b.packageName || 'Resort Amenities'}
                        <span className="block text-[10px] font-mono" style={{ color: 'var(--muted)' }}>
                          Date: {b.reservationDate || b.bookingDate}
                        </span>
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
                        )}

                        {/* STAGE 04: COMPLETED */}
                        {stageIdx === 3 && (
                          <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--accent)' }}>
                            ✓ Completed Stay
                          </span>
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
                    Reserved Services Breakdown:
                  </span>

                  {Array.isArray(selectedTimelineBooking.items) && selectedTimelineBooking.items.length > 0 ? (
                    <ul className="divide-y divide-white/5 text-xs space-y-1">
                      {selectedTimelineBooking.items.map((it, idx) => (
                        <li key={idx} className="pt-1.5 flex justify-between items-center" style={{ color: 'var(--text)' }}>
                          <span>{it.name || it.serviceName} {it.quantity > 1 ? `(x${it.quantity})` : ''}</span>
                          <strong className="font-mono" style={{ color: 'var(--accent)' }}>
                            ₱{(parseFloat(it.unitPrice || it.price || 0) * (it.quantity || 1)).toLocaleString()}.00
                          </strong>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs py-1" style={{ color: 'var(--text)' }}>
                      {selectedTimelineBooking.specificType || selectedTimelineBooking.serviceName || 'Duangon Day Pass Entrance & Cottage'}
                    </p>
                  )}

                  <div className="pt-3 flex justify-between items-center text-sm font-bold" style={{ borderTop: '1px solid var(--line)' }}>
                    <span style={{ color: 'var(--muted)' }}>Total Amount:</span>
                    <strong className="font-mono text-base font-black" style={{ color: 'var(--accent)' }}>
                      ₱{parseFloat(selectedTimelineBooking.estimatedTotal || selectedTimelineBooking.grandTotal || selectedTimelineBooking.totalPrice || 0).toLocaleString()}.00
                    </strong>
                  </div>
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
                <span className="font-bold" style={{ color: 'var(--accent)' }}>TOTAL AMOUNT DUE:</span>
                <strong className="text-base font-mono font-black" style={{ color: 'var(--accent)' }}>
                  ₱{parseFloat(selectedBookingForPayment.estimatedTotal || selectedBookingForPayment.grandTotal || selectedBookingForPayment.totalPrice || 0).toLocaleString()}.00
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
                  parseFloat(selectedBookingForPayment.estimatedTotal || selectedBookingForPayment.grandTotal || 0),
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
              const due = parseFloat(selectedBookingForPayment.estimatedTotal || selectedBookingForPayment.grandTotal || selectedBookingForPayment.totalPrice || 0);
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