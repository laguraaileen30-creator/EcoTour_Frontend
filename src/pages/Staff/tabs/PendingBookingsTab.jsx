import React, { useState } from 'react';
import {
  Ticket, Search, CheckCircle2, Clock, XCircle, DollarSign,
  ArrowRight, User, Phone, Mail, Calendar, Home, Sparkles, ShieldCheck, Printer, RefreshCw, X, Coins, Check, AlertTriangle
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';
import { getPhilippineDateStr, getPhilippineTimeStr } from '../../../utils/phTime';
import FacilityAssignmentModal from '../../../components/FacilityAssignmentModal';
import BookingBreakdown from '../../../components/BookingBreakdown';
import ReservationPaymentStatus from '../../../components/ReservationPaymentStatus';
import { apiJson } from '../../../utils/catalog';

export default function PendingBookingsTab({ setActiveTab, onSelectBookingForPOS }) {
  const {
    resortBookings,
    updateResortBookingStatus,
    cancelReservationBooking,
    refreshAllLiveData,
    processPOSTransaction,
    currentUser,
    theme,
    showAlert,
    showConfirm
  } = useEcoTour();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
  const [cashReceivedInput, setCashReceivedInput] = useState('');
  const [issuedReceipt, setIssuedReceipt] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [assignmentBooking, setAssignmentBooking] = useState(null);
  const isLight = theme === 'light';

  // Real-time pending client bookings from database
  const pendingBookings = (resortBookings || []).filter((b) => {
    const s = (b.status || 'Pending').toLowerCase();
    return (s.includes('pending') || s.includes('counter')) && !s.includes('cancel') && !s.includes('void') && !s.includes('reject');
  });

  // Check for possible duplicates (same client name/email and visit date)
  const isPossibleDuplicate = (booking) => {
    const bName = (booking.clientName || booking.fullName || '').toLowerCase().trim();
    const bEmail = (booking.clientEmail || booking.email || '').toLowerCase().trim();
    const bDate = (booking.reservationDate || booking.bookingDate || '').trim();
    const bRef = booking.bookingRef || booking.bookingNumber || String(booking.id);

    return pendingBookings.some((other) => {
      const oRef = other.bookingRef || other.bookingNumber || String(other.id);
      if (oRef === bRef) return false;
      const oName = (other.clientName || other.fullName || '').toLowerCase().trim();
      const oEmail = (other.clientEmail || other.email || '').toLowerCase().trim();
      const oDate = (other.reservationDate || other.bookingDate || '').trim();

      const samePerson = (bEmail && oEmail && bEmail === oEmail) || (bName && oName && bName === oName);
      const sameDate = bDate && oDate && bDate === oDate;
      return samePerson && sameDate;
    });
  };

  // Filtered by search query
  const filteredBookings = pendingBookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      (b.clientName && b.clientName.toLowerCase().includes(q)) ||
      (b.fullName && b.fullName.toLowerCase().includes(q)) ||
      (b.userNumber && b.userNumber.toLowerCase().includes(q)) ||
      (b.bookingRef && b.bookingRef.toLowerCase().includes(q)) ||
      (b.bookingNumber && b.bookingNumber.toLowerCase().includes(q)) ||
      (b.clientEmail && b.clientEmail.toLowerCase().includes(q)) ||
      (b.contactNumber && b.contactNumber.toLowerCase().includes(q)) ||
      (b.specificType && b.specificType.toLowerCase().includes(q))
    );
  });

  const [paymentKind, setPaymentKind] = useState('BALANCE');
  const [emailingId, setEmailingId] = useState(null);

  const balanceOf = (b) => {
    const total = parseFloat(b.estimatedTotal || b.grandTotal || b.totalPrice || 0);
    return b.balanceDue !== undefined ? parseFloat(b.balanceDue) : Math.max(0, total - parseFloat(b.amountPaid || 0));
  };
  const feeOutstanding = (b) => (b.feeStatus === 'UNPAID' ? Math.min(balanceOf(b), parseFloat(b.reservationFee || 0)) : 0);
  const paymentDue = selectedBookingForPayment
    ? (paymentKind === 'FEE' ? feeOutstanding(selectedBookingForPayment) : balanceOf(selectedBookingForPayment))
    : 0;

  // kind: 'FEE' = reservation fee (downpayment) only, 'BALANCE' = everything still owed
  const openPaymentModal = (booking, kind = 'BALANCE') => {
    setSelectedBookingForPayment(booking);
    setPaymentKind(kind);
    const due = kind === 'FEE' ? feeOutstanding(booking) : balanceOf(booking);
    setCashReceivedInput(due ? String(due) : '');
  };

  // Email the client (account email) asking them to continue or cancel within 24 hours
  const handleRequestConfirmation = async (booking) => {
    if (emailingId) return;
    const resend = booking.confirmationStatus === 'AWAITING_CLIENT';
    const ok = await showConfirm({
      title: resend ? 'Resend confirmation email?' : 'Email client to confirm?',
      message: `${booking.clientName || 'The client'} will be asked to continue or cancel ${booking.bookingRef || booking.bookingNumber}. They have 24 hours to answer; with no answer the booking is voided automatically.`,
      details: resend ? 'Resending starts a new 24-hour window.' : undefined,
      type: 'info',
      confirmText: resend ? 'Resend email' : 'Send email',
    });
    if (!ok) return;
    setEmailingId(booking.id || booking.bookingRef);
    try {
      const res = await apiJson(`/reservations/${encodeURIComponent(booking.id || booking.bookingRef)}/request-confirmation`, { method: 'POST', auth: true });
      const d = res.data || {};
      const deadline = `Deadline: ${new Date(d.deadline).toLocaleString('en-US', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' })} (PHT)`;
      const needsActivation = /activat/i.test(d.notice || '');
      showAlert({
        title: d.delivered ? 'Confirmation email sent' : needsActivation ? 'Client must activate FormSubmit first' : 'Email not delivered yet',
        message: d.delivered
          ? `Sent via ${d.channel === 'smtp' ? 'Gmail' : 'FormSubmit'} to ${d.email}. The client has 24 hours to continue or cancel.`
          : needsActivation
            ? `FormSubmit sent ${d.email} a one-time "Activate Form" email. Ask the client to click it, then press "Resend 24h email".`
            : `The email to ${d.email} could not be delivered. The 24-hour window has still started.`,
        details: [deadline, d.notice ? `FormSubmit: ${d.notice}` : null, d.previewUrl ? `Preview copy: ${d.previewUrl}` : null].filter(Boolean).join('\n'),
        type: d.delivered ? 'success' : 'warning',
      });
      if (refreshAllLiveData) refreshAllLiveData();
    } catch (e) {
      showAlert({ title: 'Could not send email', message: e.message, type: 'danger' });
    } finally {
      setEmailingId(null);
    }
  };

  const handleConfirmCashPayment = async () => {
    if (!selectedBookingForPayment || isProcessingPayment) return;
    const b = selectedBookingForPayment;
    const cashReceivedNum = parseFloat(cashReceivedInput) || 0;
    if (cashReceivedNum < paymentDue) {
      showAlert({ title: 'Insufficient Payment', message: `Cash received (₱${cashReceivedNum.toLocaleString()}) is less than the amount due (₱${paymentDue.toLocaleString()}).`, type: 'warning' });
      return;
    }
    try {
      setIsProcessingPayment(true);
      // Saved on the server (payments + revenue shares); the server computes the amount due
      const res = await apiJson(`/reservations/${encodeURIComponent(b.id || b.bookingRef)}/payments`, {
        method: 'POST',
        auth: true,
        body: { kind: paymentKind, cash_received: cashReceivedNum, staff_name: currentUser?.name || 'Staff Cashier' },
      });
      const d = res.data;
      setIssuedReceipt({
        receiptNo: d.receiptNo,
        date: getPhilippineDateStr(),
        time: getPhilippineTimeStr(),
        touristName: b.clientName || b.fullName || b.touristName || 'Client Visitor',
        userNumber: b.userNumber,
        bookingRef: b.bookingRef || b.bookingNumber,
        items: [{ name: d.kind === 'FEE' ? 'Reservation fee (downpayment)' : (d.balanceDue > 0 ? 'Partial payment' : 'Balance payment'), quantity: 1, unitPrice: d.amount, price: d.amount }],
        grandTotal: d.amount,
        cashReceived: d.cashReceived,
        change: d.change,
        staffName: currentUser?.name || 'Staff Cashier',
      });
      setSelectedBookingForPayment(null);
      if (refreshAllLiveData) refreshAllLiveData();
    } catch (e) {
      showAlert({ title: 'Payment not recorded', message: e.message, type: 'danger' });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    const refCode = booking.bookingRef || booking.bookingNumber || `BK-${booking.id}`;
    const name = booking.clientName || booking.fullName || 'Client Guest';
    const isDup = isPossibleDuplicate(booking);

    const confirmed = await showConfirm({
      title: isDup ? 'Cancel Duplicate Booking' : 'Cancel Reservation',
      message: isDup
        ? `Cancel & void duplicate reservation ${refCode} for ${name}?`
        : `Are you sure you want to cancel / void reservation ${refCode} for ${name}?`,
      details: isDup
        ? 'Duplicate booking detected. This will prevent double payment and remove the duplicate entry.'
        : 'This action will cancel the reservation in the database and release all reserved slots.',
      type: 'danger',
      confirmText: 'YES, Cancel & Void'
    });

    if (!confirmed) return;

    if (cancelReservationBooking) {
      await cancelReservationBooking(booking.id || refCode);
    } else if (updateResortBookingStatus) {
      await updateResortBookingStatus(booking.id || refCode, 'Cancelled');
    }

    if (refreshAllLiveData) {
      refreshAllLiveData();
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-2 sm:p-4" style={{ color: 'var(--text)' }}>
      
      {/* HEADER BANNER */}
      <div
        className="p-6 rounded-3xl border shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden"
        style={{
          background: isLight ? 'var(--panel)' : '#071f14',
          borderColor: 'var(--line)',
        }}
      >
        <div className="flex items-center gap-4 relative z-10">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: 'rgba(74,222,128,0.12)',
              border: '1px solid rgba(74,222,128,0.3)',
              color: 'var(--accent)',
            }}
          >
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-[3px] block" style={{ color: 'var(--accent)' }}>
                LIVE CLIENT BOOKINGS TERMINAL
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold animate-pulse" style={{ background: 'rgba(74,222,128,0.15)', color: 'var(--accent)' }}>
                Real-Time Database Feed
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5" style={{ color: 'var(--text)' }}>
              Pending Self-Service Client Bookings
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              Online reservations route here in real time. Confirm cash payment at the cashier gate or void duplicate/cancelled bookings to prevent double payment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => refreshAllLiveData && refreshAllLiveData()}
            className="px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow text-xs font-bold"
            style={{
              background: isLight ? 'rgba(74,222,128,0.1)' : 'rgba(6,60,30,0.8)',
              border: '1px solid var(--line)',
              color: 'var(--accent)',
            }}
          >
            <RefreshCw className="w-4 h-4" /> Refresh Live Sync
          </button>
          
          <div
            className="px-4 py-2 rounded-2xl font-black text-sm font-mono shadow-lg border"
            style={{
              background: 'var(--accent)',
              color: isLight ? '#fff' : '#04170e',
              borderColor: 'rgba(74,222,128,0.5)',
            }}
          >
            {pendingBookings.length} Pending Requests
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
        <input
          type="text"
          placeholder="Search by Client Name, Client ID (CLT-2026-XXXX), Reference Code (REF-2026-XXXX), or Email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl pl-10 pr-4 py-3 text-xs outline-none shadow-md font-medium"
          style={{
            background: isLight ? 'var(--panel)' : '#071f14',
            border: '1px solid var(--line)',
            color: 'var(--text)',
          }}
        />
      </div>

      {/* PENDING BOOKINGS CARDS GRID */}
      {filteredBookings.length === 0 ? (
        <div
          className="border rounded-3xl p-12 text-center space-y-3 shadow-xl"
          style={{
            background: isLight ? 'var(--panel)' : '#071f14',
            borderColor: 'var(--line)',
          }}
        >
          <Clock className="w-12 h-12 mx-auto animate-pulse" style={{ color: 'var(--accent)' }} />
          <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>No Pending Client Self-Bookings</h3>
          <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--muted)' }}>
            All self-service client reservations have been processed, paid, or archived. New client reservations will automatically populate here in real time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredBookings.map((b) => {
            const grandTotal = parseFloat(b.estimatedTotal || b.grandTotal || b.totalPrice || 0);
            const refCode = b.bookingRef || b.bookingNumber || `REF-${b.id}`;
            const dupDetected = isPossibleDuplicate(b);

            return (
              <div
                key={b.id || refCode}
                className="border-2 rounded-3xl p-5 space-y-4 shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all"
                style={{
                  background: isLight ? 'var(--bg-1)' : '#071f14',
                  borderColor: dupDetected ? '#f59e0b' : 'var(--line)',
                  color: 'var(--text)',
                }}
              >
                <div className="space-y-3">
                  {/* CARD HEADER */}
                  <div className="flex justify-between items-start pb-3" style={{ borderBottom: '1px solid var(--line)' }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold tracking-wider block" style={{ color: 'var(--accent)' }}>
                          BOOKING REF: {refCode}
                        </span>
                        {dupDetected && (
                          <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase inline-flex items-center gap-1 shadow-sm"
                            style={{
                              background: 'rgba(245,158,11,0.2)',
                              color: '#fbbf24',
                              border: '1px solid rgba(245,158,11,0.5)',
                            }}
                          >
                            <AlertTriangle className="w-2.5 h-2.5" /> Possible Duplicate
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-extrabold mt-0.5" style={{ color: 'var(--text)' }}>
                        {b.clientName || b.fullName || b.touristName || 'Client Visitor'}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] font-mono mt-0.5" style={{ color: 'var(--muted)' }}>
                        <span className="font-bold" style={{ color: 'var(--accent)' }}>ID: {b.userNumber || b.client_id || 'CLT-2026-901'}</span>
                        <span>•</span>
                        <span>{b.clientPhone || b.contactNumber || '0917-123-4567'}</span>
                      </div>
                    </div>

                    <span
                      className="px-3 py-1 text-[10px] font-extrabold rounded-full flex items-center gap-1 uppercase shrink-0"
                      style={{
                        background: 'rgba(251,191,36,0.15)',
                        color: '#fbbf24',
                        border: '1px solid rgba(251,191,36,0.4)',
                      }}
                    >
                      <Clock className="w-3 h-3 animate-pulse" /> Pending Cash
                    </span>
                  </div>

                  {/* VISIT & COTTAGE DETAILS */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div
                      className="p-2.5 rounded-xl"
                      style={{ background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.3)', border: '1px solid var(--line)' }}
                    >
                      <span className="text-[10px] uppercase font-bold block" style={{ color: 'var(--muted)' }}>Target Visit Date</span>
                      <strong className="font-mono" style={{ color: 'var(--text)' }}>{b.reservationDate || b.bookingDate}</strong>
                      <span className="block text-[10px]" style={{ color: 'var(--muted)' }}>{b.arrivalTime || '09:00 AM'}</span>
                    </div>

                    <div
                      className="p-2.5 rounded-xl"
                      style={{ background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.3)', border: '1px solid var(--line)' }}
                    >
                      <span className="text-[10px] uppercase font-bold block" style={{ color: 'var(--muted)' }}>Cottage / Accommodation</span>
                      <strong className="text-xs truncate block" style={{ color: 'var(--accent)' }}>{b.specificType || b.serviceName || 'Standard Cottage'}</strong>
                      <span className="block text-[10px]" style={{ color: 'var(--muted)' }}>{b.numberOfGuests || b.totalVisitors || 1} Guests Total</span>
                    </div>
                  </div>

                  {/* ITEMIZED ITEMS BREAKDOWN */}
                  <div
                    className="p-3 rounded-2xl space-y-2 text-xs"
                    style={{ background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.4)', border: '1px solid var(--line)' }}
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block" style={{ color: 'var(--accent)' }}>
                      Client Selected Items Breakdown:
                    </span>

                    {Array.isArray(b.items) && b.items.length > 0 ? (
                      <ul className="divide-y divide-white/5 text-[11px]">
                        {b.items.map((it, idx) => (
                          <li key={idx} className="py-1 flex justify-between items-center" style={{ color: 'var(--text)' }}>
                            <span>{it.name || it.serviceName}</span>
                            <strong className="font-mono" style={{ color: 'var(--accent)' }}>
                              ₱{parseFloat(it.price || it.unitPrice || 0) * (it.quantity || 1)}
                            </strong>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] italic" style={{ color: 'var(--muted)' }}>
                        {b.specificType || b.serviceName || 'Duangon Day Pass Entrance & Cottage'}
                      </p>
                    )}
                  </div>

                  <div className="p-3 rounded-2xl border" style={{ borderColor: 'var(--line)' }}>
                    <BookingBreakdown booking={b} compact />
                  </div>

                  <ReservationPaymentStatus booking={b} role="staff" compact />

                  <div
                    className="p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    style={{ background: isLight ? 'rgba(59,130,246,0.06)' : 'rgba(30,64,175,0.12)', borderColor: 'rgba(59,130,246,0.35)' }}
                  >
                    <div>
                      <span className="text-[10px] uppercase font-extrabold block text-blue-500">Facility Assignment</span>
                      <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                        {Array.isArray(b.assignedFacilities) && b.assignedFacilities.length > 0
                          ? <>Assigned: <strong style={{ color: '#60a5fa' }}>{b.assignedFacilities.map(f => f.facilityName).join(', ')}</strong></>
                          : 'Not yet assigned — pick the actual cottage / unit numbers for this date.'}
                      </span>
                    </div>
                    <button
                      onClick={() => setAssignmentBooking(b)}
                      className="px-3 py-2 rounded-xl text-[11px] font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      style={{ background: 'rgba(59,130,246,0.18)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.45)' }}
                    >
                      <Home className="w-3.5 h-3.5" /> Assign Facilities
                    </button>
                  </div>
                </div>

                {/* CARD FOOTER & ACTION BUTTONS */}
                <div className="pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3" style={{ borderTop: '1px solid var(--line)' }}>
                  <div>
                    <span className="text-[10px] uppercase font-bold block" style={{ color: 'var(--muted)' }}>Balance Due:</span>
                    <div className="text-xl font-black font-mono" style={{ color: 'var(--accent)' }}>
                      ₱{balanceOf(b).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </div>
                    {feeOutstanding(b) > 0 && (
                      <span className="text-[10px] font-bold" style={{ color: '#f59e0b' }}>Reservation fee due: ₱{feeOutstanding(b).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
                    {/* Client online bookings only — walk-ins (fee NOT_REQUIRED) skip the 24-hour confirmation */}
                    {b.feeStatus && b.feeStatus !== 'NOT_REQUIRED' && b.confirmationStatus !== 'CONFIRMED' && (
                      <button
                        onClick={() => handleRequestConfirmation(b)}
                        disabled={!!emailingId}
                        className="px-3 py-2 text-[11px] font-bold rounded-xl cursor-pointer transition-all inline-flex items-center gap-1 disabled:opacity-50"
                        style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.45)', color: '#f59e0b' }}
                        title="Email the client (account email) to continue or cancel within 24 hours"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {emailingId === (b.id || b.bookingRef) ? 'Sending…' : b.confirmationStatus === 'AWAITING_CLIENT' ? 'Resend 24h email' : 'Email client to confirm'}
                      </button>
                    )}
                    {feeOutstanding(b) > 0 && (
                      <button
                        onClick={() => openPaymentModal(b, 'FEE')}
                        className="px-3 py-2 text-[11px] font-extrabold rounded-xl cursor-pointer transition-all inline-flex items-center gap-1"
                        style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.45)', color: 'var(--accent)' }}
                        title="Collect the reservation fee (downpayment) in cash"
                      >
                        <Coins className="w-3.5 h-3.5" /> Record reservation fee
                      </button>
                    )}
                    <button
                      onClick={() => handleCancelBooking(b)}
                      className="px-3 py-2 text-rose-300 hover:text-white text-[11px] font-bold rounded-xl cursor-pointer transition-all inline-flex items-center gap-1"
                      style={{
                        background: 'rgba(239,68,68,0.15)',
                        border: '1px solid rgba(239,68,68,0.4)',
                      }}
                      title="Cancel booking to prevent double payment or void duplicate submissions"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {dupDetected ? 'Cancel Duplicate' : 'Void / Cancel'}
                    </button>

                    <button
                      onClick={() => openPaymentModal(b, 'BALANCE')}
                      className="flex-1 sm:flex-none px-4 py-2 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 uppercase"
                      style={{
                        background: 'var(--accent)',
                      }}
                    >
                      <Coins className="w-4 h-4" /> {feeOutstanding(b) > 0 ? 'Accept Full Payment' : 'Accept Balance'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {assignmentBooking && (
        <FacilityAssignmentModal
          booking={assignmentBooking}
          onClose={() => setAssignmentBooking(null)}
          onChanged={() => refreshAllLiveData && refreshAllLiveData()}
        />
      )}

      {/* CASH PAYMENT & CHANGE MODAL */}
      {selectedBookingForPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="border-2 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl"
            style={{
              background: isLight ? 'var(--bg-1)' : '#071f14',
              borderColor: 'var(--line)',
              color: 'var(--text)',
            }}
          >
            {/* Modal Header */}
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
                className="p-1 rounded-full cursor-pointer"
                style={{ color: 'var(--muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bill Summary */}
            <div
              className="p-4 rounded-2xl space-y-2 text-xs"
              style={{ background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.3)', border: '1px solid var(--line)' }}
            >
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted)' }}>Guest Name:</span>
                <strong style={{ color: 'var(--text)' }}>{selectedBookingForPayment.clientName || selectedBookingForPayment.fullName || 'Guest'}</strong>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted)' }}>Reserved Service:</span>
                <strong style={{ color: 'var(--accent)' }}>{selectedBookingForPayment.specificType || selectedBookingForPayment.serviceName}</strong>
              </div>
              <div className="flex justify-between text-sm font-black pt-2" style={{ borderTop: '1px solid var(--line)' }}>
                <span style={{ color: 'var(--text)' }}>{paymentKind === 'FEE' ? 'Reservation Fee Due:' : 'Amount Due Now:'}</span>
                <span className="font-mono text-base" style={{ color: 'var(--accent)' }}>
                  ₱{paymentDue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Cash Input */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase" style={{ color: 'var(--muted)' }}>
                Cash Tendered / Received (₱)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={cashReceivedInput}
                onChange={(e) => setCashReceivedInput(e.target.value)}
                placeholder="Enter exact or higher cash amount..."
                className="w-full rounded-xl px-4 py-3 text-lg font-mono font-bold outline-none"
                style={{
                  background: isLight ? 'rgba(255,255,255,0.9)' : '#04150e',
                  border: '1px solid var(--line)',
                  color: 'var(--text)',
                }}
              />
            </div>

            {/* Change Calculator */}
            {parseFloat(cashReceivedInput) > 0 && (
              <div
                className="p-3 rounded-xl flex justify-between items-center text-xs font-mono font-bold"
                style={{
                  background: isLight ? 'rgba(74,222,128,0.1)' : 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--line)',
                }}
              >
                <span style={{ color: 'var(--muted)' }}>Change to Return:</span>
                <span className="text-sm" style={{ color: 'var(--accent)' }}>
                  ₱{Math.max(0, (parseFloat(cashReceivedInput) || 0) - paymentDue).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBookingForPayment(null)}
                className="px-4 py-2.5 font-bold rounded-xl text-xs cursor-pointer transition-all"
                style={{
                  background: isLight ? 'rgba(0,0,0,0.06)' : '#1e293b',
                  color: 'var(--text)',
                  border: '1px solid var(--line)',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleConfirmCashPayment}
                className="flex-1 py-2.5 text-slate-950 font-black rounded-xl text-xs shadow-lg cursor-pointer transition-all uppercase flex items-center justify-center gap-2 disabled:opacity-50"
                style={{
                  background: 'var(--accent)',
                }}
              >
                {isProcessingPayment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing Payment...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Confirm Cash &amp; Print Receipt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ISSUED OFFICIAL RECEIPT MODAL */}
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
              <div className="flex justify-between"><span>Status:</span><strong className="text-emerald-700">PAID (VERIFIED) ✓</strong></div>
            </div>

            <div className="space-y-1.5 text-xs border-b border-dashed border-slate-300 pb-3">
              {Array.isArray(issuedReceipt.items) && issuedReceipt.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.name || it.serviceName} x{it.quantity || 1}</span>
                  <strong>₱{(parseFloat(it.unitPrice || it.price || 0) * (it.quantity || 1)).toLocaleString()}.00</strong>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-xs pt-1">
              <div className="flex justify-between text-base font-black text-slate-900">
                <span>TOTAL AMOUNT:</span>
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
              <p>Valid official receipt for entrance and resort facilities.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              <button
                onClick={() => setIssuedReceipt(null)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
