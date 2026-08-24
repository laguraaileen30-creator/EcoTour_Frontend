import React, { useState, useEffect } from 'react';
import {
  CalendarDays, Calendar, Clock, Package, Users, DollarSign,
  CheckCircle2, XCircle, AlertCircle, QrCode, ArrowRight, RefreshCw, Filter, Camera,
  Plus, Minus, Ticket, Utensils, Music, Droplets, ShieldCheck, Home, Sparkles, Coffee, Car, Search, X, Check, FileText, History
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';
import VerticalReservationTimeline, { getStageIndex } from '../../../components/VerticalReservationTimeline';
import { getPhilippineDateStr, getPhilippineFormattedDate } from '../../../utils/phTime';

const COTTAGE_OPTIONS = [
  { id: 'COT-NONE', code: 'COT-NONE', name: 'No Cottage (Walk-In Only)', price: 0 },
  { id: 'COT-01', code: 'DSVC-002', name: 'Standard Open Cottage', price: 600 },
  { id: 'COT-02', code: 'DSVC-012', name: 'Large Family Covered Cottage', price: 1000 },
  { id: 'COT-03', code: 'DSVC-013', name: 'Executive Umbrella Shade', price: 400 },
];

const RESORT_SERVICES_CATALOG = [
  { id: 'ADD-01', code: 'TBL-01', category: 'Rental', name: 'Resort Table & Chairs Set', price: 250, unit: 'day', icon: Utensils },
  { id: 'ADD-02', code: 'VST-01', category: 'Safety', name: 'Life Vest / Safety Gear', price: 50, unit: 'head', icon: ShieldCheck },
  { id: 'ADD-03', code: 'ENT-01', category: 'Entertainment', name: 'Videoke Karaoke System', price: 500, unit: 'day', icon: Music },
  { id: 'ADD-04', code: 'WAT-01', category: 'Water Activity', name: 'Kayak / Floating Pad Rental', price: 300, unit: 'hour', icon: Droplets },
  { id: 'ADD-05', code: 'TNT-01', category: 'Accommodation', name: 'Camping Pitch & Tent', price: 450, unit: 'night', icon: Home },
  { id: 'ADD-06', code: 'RM-01', category: 'Accommodation', name: 'Aircon Kubo Guest Room', price: 1500, unit: 'night', icon: Home },
  { id: 'ADD-07', code: 'PVL-01', category: 'Event', name: 'Private Event Pavilion', price: 3500, unit: 'event', icon: Sparkles },
  { id: 'ADD-08', code: 'BFT-01', category: 'Food', name: 'Buffet & Catering Station', price: 450, unit: 'head', icon: Coffee },
  { id: 'ADD-09', code: 'PRK-01', category: 'Parking', name: 'Secured Resort Parking Slot', price: 50, unit: 'vehicle', icon: Car },
];

export default function ClientBookingsTab({ onNavigateBook, onNavigateHistory }) {
  const {
    currentUser,
    reservations = [],
    addReservation,
    cancelReservationBooking,
    updateResortBookingStatus,
    refreshAllLiveData,
    theme
  } = useEcoTour();

  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState(null);
  const isLight = theme === 'light';

  // Form State
  const clientName = `${currentUser?.fname || ''} ${currentUser?.lname || ''}`.trim() || currentUser?.name || 'Client Visitor';
  const clientEmail = currentUser?.email || 'client@ecotourvista.com';
  const clientPhone = currentUser?.contact_no || currentUser?.phone || '0917-123-4567';

  const generateUserNumber = () => currentUser?.user_number || `CLT-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  const [visitDate, setVisitDate] = useState(getPhilippineDateStr());
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [students, setStudents] = useState(0);
  const [seniors, setSeniors] = useState(0);
  const [selectedCottage, setSelectedCottage] = useState(COTTAGE_OPTIONS[1]);
  const [addonCart, setAddonCart] = useState({});

  const totalVisitors = adults + children + students + seniors;

  // Addon Quantity handler
  const handleAddonQty = (serviceId, delta) => {
    setAddonCart((prev) => {
      const current = prev[serviceId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      }
      return { ...prev, [serviceId]: next };
    });
  };

  // Grand Total Calculation
  const entranceTotal = (adults * 100) + (children * 40) + (students * 70) + (seniors * 80);
  const cottageTotal = selectedCottage?.price || 0;
  const addonTotal = Object.entries(addonCart).reduce((sum, [sId, qty]) => {
    const sObj = RESORT_SERVICES_CATALOG.find((s) => s.id === sId);
    return sum + (sObj ? sObj.price * qty : 0);
  }, 0);

  const grandTotal = entranceTotal + cottageTotal + addonTotal;

  // Submit Booking Request
  const handleSubmitBooking = (e) => {
    e.preventDefault();
    if (totalVisitors <= 0) return alert('Please select at least 1 visitor count.');

    const newBookingRef = `REF-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    // Build items list
    const items = [
      { name: `Adult Entrance (${adults}x)`, price: adults * 100, quantity: adults, unitPrice: 100, category: 'Entrance' },
      ...(children > 0 ? [{ name: `Child Entrance (${children}x)`, price: children * 40, quantity: children, unitPrice: 40, category: 'Entrance' }] : []),
      ...(students > 0 ? [{ name: `Student Entrance (${students}x)`, price: students * 70, quantity: students, unitPrice: 70, category: 'Entrance' }] : []),
      ...(seniors > 0 ? [{ name: `Senior/PWD Entrance (${seniors}x)`, price: seniors * 80, quantity: seniors, unitPrice: 80, category: 'Entrance' }] : []),
      ...(selectedCottage.price > 0 ? [{ name: selectedCottage.name, price: cottageTotal, quantity: 1, unitPrice: cottageTotal, category: 'Cottage' }] : []),
      ...Object.entries(addonCart).map(([sId, qty]) => {
        const sObj = RESORT_SERVICES_CATALOG.find((s) => s.id === sId);
        return { name: `${sObj.name} (${qty}x)`, price: sObj.price * qty, quantity: qty, unitPrice: sObj.price, category: sObj.category };
      })
    ];

    const bookingPayload = {
      bookingRef: newBookingRef,
      bookingNumber: newBookingRef,
      clientName,
      fullName: clientName,
      touristName: clientName,
      clientEmail,
      email: clientEmail,
      touristEmail: clientEmail,
      contactNumber: clientPhone,
      clientPhone,
      userNumber: generateUserNumber(),
      userId: currentUser?.user_id || currentUser?.id || null,
      bookingDate: visitDate,
      reservationDate: visitDate,
      arrivalTime: '09:00 AM',
      timeSlot: '09:00 AM',
      numberOfGuests: totalVisitors,
      totalVisitors,
      quantity: totalVisitors,
      paxBreakdown: { adults, children, students, seniors },
      serviceName: selectedCottage.id !== 'COT-NONE' ? selectedCottage.name : 'Duangon Walk-In Day Pass',
      packageName: selectedCottage.id !== 'COT-NONE' ? selectedCottage.name : 'Duangon Walk-In Day Pass',
      specificType: selectedCottage.id !== 'COT-NONE' ? selectedCottage.name : 'Duangon Walk-In Day Pass',
      selectedCottage,
      addonCart,
      items,
      totalPrice: grandTotal,
      grandTotal: grandTotal,
      estimatedTotal: grandTotal,
      status: 'Pending',
      paymentMethod: 'Cash',
      createdAt: new Date().toISOString()
    };

    if (addReservation) {
      addReservation(bookingPayload);
    }

    setSubmittedBooking(bookingPayload);
    setShowBookingModal(false);
  };

  const myReservations = (reservations || []).filter((r) => {
    if (!currentUser) return true;
    const rEmail = (r.email || r.clientEmail || r.touristEmail || '').toLowerCase().trim();
    const rName = (r.clientName || r.fullName || r.touristName || '').toLowerCase().trim();
    const rUserNum = (r.userNumber || r.client_id || r.client_number || '').toLowerCase().trim();
    const rUserId = String(r.userId || r.user_id || '').toLowerCase().trim();

    const cUserNum = String(currentUser?.user_number || currentUser?.userNumber || currentUser?.assignedId || '').toLowerCase().trim();
    const cEmail = (currentUser?.email || '').toLowerCase().trim();
    const cName = (`${currentUser?.fname || ''} ${currentUser?.lname || ''}`.trim() || currentUser?.name || currentUser?.fullName || '').toLowerCase().trim();
    const cId = String(currentUser?.id || currentUser?.user_id || '').toLowerCase().trim();

    const matchesEmail = Boolean(cEmail && rEmail && (rEmail === cEmail || rEmail.includes(cEmail) || cEmail.includes(rEmail)));
    const matchesName = Boolean(cName && rName && (rName.includes(cName) || cName.includes(rName)));
    const matchesUserNum = Boolean(cUserNum && rUserNum && (rUserNum === cUserNum || rUserNum.includes(cUserNum)));
    const matchesId = Boolean(cId && rUserId && cId === rUserId);

    return matchesEmail || matchesName || matchesUserNum || matchesId || !cEmail || cEmail.includes('client');
  });

  // Ensure submitted booking is in list if not yet fetched
  const allReservationsList = submittedBooking && !myReservations.some(r => (r.bookingRef || r.bookingNumber || r.id) === (submittedBooking.bookingRef || submittedBooking.id))
    ? [submittedBooking, ...myReservations]
    : myReservations;

  // Split Active vs Completed
  const completedCount = allReservationsList.filter(r => getStageIndex(r.status) === 3).length;

  // Active bookings are Pending (0), Paid (1), Using Services (2)
  const isVoidedOrCancelled = (st) => {
    const s = String(st || '').toLowerCase();
    return s.includes('cancel') || s.includes('void') || s.includes('reject');
  };

  const activeBookings = allReservationsList.filter(r => {
    const idx = getStageIndex(r.status);
    return idx >= 0 && idx < 3 && !isVoidedOrCancelled(r.status);
  });
  const pendingCount = allReservationsList.filter(r => getStageIndex(r.status) === 0 && !isVoidedOrCancelled(r.status)).length;
  const paidCount = allReservationsList.filter(r => getStageIndex(r.status) === 1).length;
  const usingCount = allReservationsList.filter(r => getStageIndex(r.status) === 2).length;
  const cancelledCount = allReservationsList.filter(r => isVoidedOrCancelled(r.status)).length;

  const filteredReservations = allReservationsList.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || (
      (r.bookingRef && r.bookingRef.toLowerCase().includes(q)) ||
      (r.bookingNumber && r.bookingNumber.toLowerCase().includes(q)) ||
      (r.serviceName && r.serviceName.toLowerCase().includes(q)) ||
      (r.specificType && r.specificType.toLowerCase().includes(q)) ||
      (r.reservationDate && r.reservationDate.toLowerCase().includes(q)) ||
      (r.bookingDate && r.bookingDate.toLowerCase().includes(q))
    );

    if (!matchesQuery) return false;

    const isCancelled = isVoidedOrCancelled(r.status);
    const stageIdx = getStageIndex(r.status);

    if (statusFilter === 'All') return !isCancelled && stageIdx < 3 && stageIdx >= 0;
    if (statusFilter === 'Pending') return stageIdx === 0 && !isCancelled;
    if (statusFilter === 'Paid') return stageIdx === 1;
    if (statusFilter === 'Using') return stageIdx === 2;
    if (statusFilter === 'Cancelled') return isCancelled;

    return true;
  });

  const handleCancel = (bookingRefOrId) => {
    if (window.confirm(`Are you sure you want to cancel reservation ${bookingRefOrId}?`)) {
      if (cancelReservationBooking) {
        cancelReservationBooking(bookingRefOrId);
      }
    }
  };

  const handleTimelineAction = (actionType, booking) => {
    const ref = booking.bookingRef || booking.bookingNumber || booking.id;
    if (actionType === 'start_service') {
      if (window.confirm(`🌿 Start using your reserved services now for booking ${ref}? Enjoy your stay at Duangon Cold Spring Resort!`)) {
        if (updateResortBookingStatus) {
          updateResortBookingStatus(ref, 'Using Services');
        }
      }
    } else if (actionType === 'mark_completed') {
      if (window.confirm(`Conclude and finish your stay for booking ${ref}? This will archive your trip into Booking History.`)) {
        if (updateResortBookingStatus) {
          updateResortBookingStatus(ref, 'Completed');
        }
      }
    }
  };

  const getStatusBadge = (status) => {
    if (isVoidedOrCancelled(status)) {
      return (
        <span
          className="px-3 py-1 text-[10px] font-extrabold rounded-full inline-flex items-center gap-1 uppercase shadow-sm"
          style={{
            background: 'rgba(239,68,68,0.15)',
            color: '#f87171',
            border: '1px solid rgba(239,68,68,0.4)',
          }}
        >
          <XCircle className="w-3.5 h-3.5" /> CANCELLED / VOIDED
        </span>
      );
    }
    const stageIdx = getStageIndex(status);
    if (stageIdx === 3) {
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
    }
    if (stageIdx === 2) {
      return (
        <span
          className="px-3 py-1 text-[10px] font-extrabold rounded-full inline-flex items-center gap-1 uppercase shadow-sm animate-pulse"
          style={{
            background: 'rgba(56,189,248,0.15)',
            color: '#38bdf8',
            border: '1px solid rgba(56,189,248,0.4)',
          }}
        >
          <Sparkles className="w-3.5 h-3.5" /> 03 — USING SERVICES
        </span>
      );
    }
    if (stageIdx === 1) {
      return (
        <span
          className="px-3 py-1 text-[10px] font-extrabold rounded-full inline-flex items-center gap-1 uppercase shadow-sm"
          style={{
            background: 'rgba(74,222,128,0.15)',
            color: 'var(--accent)',
            border: '1px solid rgba(74,222,128,0.4)',
          }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> 02 — PAID ✓
        </span>
      );
    }
    return (
      <span
        className="px-3 py-1 text-[10px] font-extrabold rounded-full inline-flex items-center gap-1 uppercase shadow-sm"
        style={{
          background: 'rgba(251,191,36,0.15)',
          color: '#fbbf24',
          border: '1px solid rgba(251,191,36,0.4)',
        }}
      >
        <Clock className="w-3.5 h-3.5 animate-pulse" /> 01 — PENDING PAYMENT
      </span>
    );
  };

  return (
    <div className="space-y-6 p-2 sm:p-4 max-w-[1600px] mx-auto" style={{ color: 'var(--text)' }}>

      {/* HEADER BANNER */}
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
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
              My Active Reservations
            </h2>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
              Track your ongoing reservations in real time: Pending Payment → Paid → Using Services.
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
            title="Refresh live database records"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>

          {onNavigateHistory && completedCount > 0 && (
            <button
              onClick={onNavigateHistory}
              className="px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 text-xs font-bold transition-all"
              style={{
                background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.3)',
                border: '1px solid var(--line)',
                color: 'var(--accent)',
              }}
            >
              <History className="w-4 h-4" /> View History ({completedCount})
            </button>
          )}

          <button
            onClick={() => setShowBookingModal(true)}
            className="px-5 py-2.5 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all uppercase tracking-wider"
            style={{
              background: 'var(--accent)',
              boxShadow: '0 4px 14px rgba(74,222,128,0.3)',
            }}
          >
            <Plus className="w-4 h-4" /> Book New Reservation
          </button>
        </div>
      </div>

      {/* COMPLETED TRIPS NOTIFICATION BANNER (IF ANY) */}
      {completedCount > 0 && onNavigateHistory && (
        <div
          className="p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
          style={{
            background: isLight ? 'rgba(74,222,128,0.08)' : 'rgba(6,50,25,0.5)',
            borderColor: 'rgba(74,222,128,0.3)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              🌿
            </span>
            <div>
              <strong className="text-xs block" style={{ color: 'var(--text)' }}>
                You have {completedCount} completed resort visit{completedCount > 1 ? 's' : ''} in your records!
              </strong>
              <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                Completed stays are safely archived with itemized billing and official receipts in your Booking History.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateHistory}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 self-end sm:self-auto shrink-0"
            style={{
              background: 'var(--accent)',
              color: isLight ? '#fff' : '#04170e',
            }}
          >
            <History className="w-3.5 h-3.5" /> Open Booking History &rarr;
          </button>
        </div>
      )}

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--muted)' }}>ACTIVE RESERVATIONS</span>
            <div className="text-xl font-extrabold mt-0.5" style={{ color: 'var(--text)' }}>{activeBookings.length} In Progress</div>
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
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--muted)' }}>AWAITING PAYMENT</span>
            <div className="text-xl font-extrabold mt-0.5" style={{ color: '#fbbf24' }}>{pendingCount} Pending Cash</div>
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
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--muted)' }}>VERIFIED / IN-SERVICE</span>
            <div className="text-xl font-extrabold mt-0.5" style={{ color: '#38bdf8' }}>{paidCount + usingCount} Active</div>
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
            { key: 'All', label: 'All Active', count: activeBookings.length },
            { key: 'Pending', label: '01 Pending', count: pendingCount },
            { key: 'Paid', label: '02 Paid', count: paidCount },
            { key: 'Using', label: '03 Using Services', count: usingCount },
            { key: 'Cancelled', label: 'Cancelled', count: cancelledCount },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              style={
                statusFilter === f.key
                  ? {
                      background: 'var(--accent)',
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
                  statusFilter === f.key
                    ? { background: isLight ? 'rgba(0,0,0,0.2)' : '#020f08', color: '#fff' }
                    : { background: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(74,222,128,0.1)', color: 'var(--accent)' }
                }
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
          <input
            type="text"
            placeholder="Search booking ref, service, date..."
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
      </div>

      {/* RECENT SUBMITTED BOOKING BANNER */}
      {submittedBooking && (
        <div
          className="p-5 rounded-2xl border-2 space-y-3 shadow-2xl"
          style={{
            background: isLight ? 'rgba(74,222,128,0.08)' : '#072418',
            borderColor: 'var(--accent)',
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0" style={{ color: 'var(--accent)' }} />
              <div>
                <h3 className="font-extrabold text-base" style={{ color: 'var(--text)' }}>
                  Reservation Submitted Successfully!
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  Your reference code is <strong className="font-mono text-sm px-2 py-0.5 rounded border" style={{ color: 'var(--accent)', background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.4)', borderColor: 'var(--line)' }}>{submittedBooking.bookingRef}</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSubmittedBooking(null)}
              className="p-1 rounded-full cursor-pointer"
              style={{ color: 'var(--muted)' }}
            >
              ✕
            </button>
          </div>

          <div
            className="p-3.5 rounded-xl text-xs space-y-1"
            style={{
              background: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)',
              border: '1px solid var(--line)',
            }}
          >
            <strong className="block" style={{ color: 'var(--accent)' }}>📌 NEXT STEP — PAY AT RESORT CASHIER:</strong>
            <p style={{ color: 'var(--text)' }}>
              Please present your Booking Reference Code <strong>({submittedBooking.bookingRef})</strong> to Staff at the Duangon Entrance Gate Cashier. Pay <strong>₱{submittedBooking.estimatedTotal.toLocaleString()}.00</strong> cash to receive your official receipt and verified check-in!
            </p>
          </div>
        </div>
      )}

      {/* CLIENT ACTIVE BOOKINGS LIST */}
      {filteredReservations.length === 0 ? (
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
            <Calendar className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>No Active Reservations Found</h3>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {statusFilter !== 'All' ? `No bookings currently match the "${statusFilter}" status filter.` : 'Select your entrance tickets, cottage rentals, and resort add-ons to create your first reservation.'}
            </p>
          </div>
          <button
            onClick={() => setShowBookingModal(true)}
            className="mt-4 px-6 py-2.5 text-slate-950 font-black text-xs rounded-xl shadow-lg inline-flex items-center gap-2 cursor-pointer transition-all uppercase tracking-wider"
            style={{
              background: 'var(--accent)',
            }}
          >
            <span>Create Self-Service Booking Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredReservations.map((res) => {
            const grandTotal = parseFloat(res.estimatedTotal || res.grandTotal || res.totalPrice || 0);
            const isCancelled = String(res.status || '').toLowerCase().includes('cancel');

            return (
              <div
                key={res.id || res.bookingRef || res.bookingNumber}
                className="rounded-3xl border-2 p-5 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden transition-all"
                style={{
                  background: isLight ? 'var(--bg-1)' : '#071f14',
                  borderColor: 'var(--line)',
                  color: 'var(--text)',
                }}
              >
                {/* CARD HEADER */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
                      style={{
                        background: 'rgba(74,222,128,0.12)',
                        border: '1px solid rgba(74,222,128,0.3)',
                        color: 'var(--accent)',
                      }}
                    >
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-extrabold tracking-wider" style={{ color: 'var(--accent)' }}>
                          RESERVATION #{res.bookingRef || res.bookingNumber || `BK-${res.id}`}
                        </span>
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded"
                          style={{
                            background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.4)',
                            color: 'var(--accent)',
                            border: '1px solid var(--line)',
                          }}
                        >
                          {res.userNumber || 'CLT-2026-CLIENT'}
                        </span>
                      </div>
                      <h3 className="text-lg font-black mt-0.5" style={{ color: 'var(--text)' }}>
                        {res.specificType || res.serviceName || res.packageName || 'Duangon Cold Spring Resort Reservation'}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(res.status)}
                  </div>
                </div>

                {/* TWO-COLUMN GRID: LEFT SUMMARY & SERVICES | RIGHT VERTICAL TIMELINE */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                  {/* LEFT: RESERVATION DETAILS & ITEMIZED SERVICES (6 COLS) */}
                  <div className="lg:col-span-6 space-y-4">
                    {/* DETAILS GRID */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      <div
                        className="p-3 rounded-2xl space-y-1"
                        style={{
                          background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.3)',
                          border: '1px solid var(--line)',
                        }}
                      >
                        <span className="text-[10px] uppercase font-bold flex items-center gap-1" style={{ color: 'var(--muted)' }}>
                          <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Visit Date
                        </span>
                        <div className="font-mono font-bold text-xs" style={{ color: 'var(--text)' }}>
                          {res.reservationDate || res.bookingDate}
                        </div>
                        <div className="text-[10px] font-mono" style={{ color: 'var(--accent)' }}>
                          {res.arrivalTime || res.timeSlot || '09:00 AM'}
                        </div>
                      </div>

                      <div
                        className="p-3 rounded-2xl space-y-1"
                        style={{
                          background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.3)',
                          border: '1px solid var(--line)',
                        }}
                      >
                        <span className="text-[10px] uppercase font-bold flex items-center gap-1" style={{ color: 'var(--muted)' }}>
                          <Users className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Visitors
                        </span>
                        <div className="font-bold text-xs" style={{ color: 'var(--text)' }}>
                          {res.numberOfGuests || res.totalVisitors || 1} Guests
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--muted)' }}>All Ages Included</div>
                      </div>

                      <div
                        className="p-3 rounded-2xl space-y-1 col-span-2 sm:col-span-1"
                        style={{
                          background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.3)',
                          border: '1px solid var(--line)',
                        }}
                      >
                        <span className="text-[10px] uppercase font-bold flex items-center gap-1" style={{ color: 'var(--muted)' }}>
                          <DollarSign className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Total Bill
                        </span>
                        <div className="font-black text-sm font-mono" style={{ color: 'var(--accent)' }}>
                          ₱{grandTotal.toLocaleString()}.00
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--muted)' }}>Cash at Counter</div>
                      </div>
                    </div>

                    {/* ITEMIZED SERVICES BREAKDOWN */}
                    <div
                      className="p-4 rounded-2xl space-y-2 text-xs"
                      style={{
                        background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.4)',
                        border: '1px solid var(--line)',
                      }}
                    >
                      <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid var(--line)' }}>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                          Reserved Services Breakdown:
                        </span>
                        <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--muted)' }}>
                          Itemized Bill
                        </span>
                      </div>

                      {Array.isArray(res.items) && res.items.length > 0 ? (
                        <ul className="divide-y divide-white/5 text-[11px] space-y-1">
                          {res.items.map((it, idx) => (
                            <li key={idx} className="pt-1.5 flex justify-between items-center" style={{ color: 'var(--text)' }}>
                              <span>{it.name || it.serviceName} {it.quantity > 1 ? `(x${it.quantity})` : ''}</span>
                              <strong className="font-mono" style={{ color: 'var(--accent)' }}>
                                ₱{(parseFloat(it.unitPrice || it.price || 0) * (it.quantity || 1)).toLocaleString()}.00
                              </strong>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] py-1" style={{ color: 'var(--text)' }}>
                          {res.specificType || res.serviceName || 'Duangon Day Pass Entrance & Open Cottage'}
                        </p>
                      )}

                      <div className="pt-2 flex justify-between items-center text-xs font-bold" style={{ borderTop: '1px solid var(--line)' }}>
                        <span style={{ color: 'var(--muted)' }}>Total Amount:</span>
                        <strong className="text-sm font-mono font-black" style={{ color: 'var(--accent)' }}>
                          ₱{grandTotal.toLocaleString()}.00
                        </strong>
                      </div>
                    </div>

                    {/* ACTION FOOTER */}
                    {!isCancelled && (
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                        <div
                          className="flex items-center gap-2 text-[11px] px-3 py-2 rounded-xl"
                          style={{
                            background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--line)',
                            color: 'var(--text)',
                          }}
                        >
                          <QrCode className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
                          <span>Show Code <strong className="font-mono" style={{ color: 'var(--accent)' }}>{res.bookingRef || res.bookingNumber}</strong> at counter.</span>
                        </div>

                        {getStageIndex(res.status) === 0 && (
                          <button
                            onClick={() => handleCancel(res.bookingRef || res.bookingNumber || res.id)}
                            className="px-3.5 py-2 text-rose-300 text-xs font-bold rounded-xl cursor-pointer transition-all"
                            style={{
                              background: 'rgba(239,68,68,0.15)',
                              border: '1px solid rgba(239,68,68,0.4)',
                            }}
                          >
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* RIGHT: VERTICAL REAL-TIME RESERVATION STATUS TIMELINE (6 COLS) */}
                  <div className="lg:col-span-6">
                    <VerticalReservationTimeline
                      currentStatus={res.status}
                      reservation={res}
                      userRole="client"
                      onActionClick={handleTimelineAction}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SELF-SERVICE BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl my-8 relative border-2"
            style={{
              background: isLight ? 'var(--bg-1)' : '#071f14',
              borderColor: 'var(--line)',
              color: 'var(--text)',
            }}
          >
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full cursor-pointer transition-all"
              style={{ color: 'var(--muted)' }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* MODAL HEADER */}
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
                  Select Tickets, Cottage &amp; Resort Services
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  Pre-select services online, then present your Reference Code at the cashier to pay cash and get your official receipt!
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-6 text-xs">

              {/* SECTION 1: TOURIST INFO & TICKETS */}
              <div className="space-y-3">
                <h4 className="font-extrabold uppercase tracking-wider text-xs flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
                  <Users className="w-4 h-4" /> 1. Tourist Registration &amp; Entrance Tickets
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: 'var(--muted)' }}>Client ID Number</label>
                    <input
                      type="text"
                      readOnly
                      value={generateUserNumber()}
                      className="w-full rounded-xl px-3 py-2 font-mono font-bold outline-none cursor-not-allowed"
                      style={{
                        background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.4)',
                        border: '1px solid var(--line)',
                        color: 'var(--accent)',
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: 'var(--muted)' }}>Full Name</label>
                    <input
                      type="text"
                      readOnly
                      value={clientName}
                      className="w-full rounded-xl px-3 py-2 font-bold outline-none cursor-not-allowed"
                      style={{
                        background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.4)',
                        border: '1px solid var(--line)',
                        color: 'var(--text)',
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: 'var(--muted)' }}>Target Visit Date *</label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      required
                      className="w-full rounded-xl px-3 py-2 outline-none font-mono"
                      style={{
                        background: isLight ? 'rgba(255,255,255,0.8)' : '#04150e',
                        border: '1px solid var(--line)',
                        color: 'var(--text)',
                      }}
                    />
                  </div>
                </div>

                {/* GUEST PAX COUNTERS */}
                <div
                  className="p-4 rounded-2xl space-y-3"
                  style={{
                    background: isLight ? 'var(--panel)' : '#04150e',
                    border: '1px solid var(--line)',
                  }}
                >
                  <span className="text-[11px] font-extrabold uppercase tracking-wider block" style={{ color: 'var(--text)' }}>
                    Guest Pax Breakdown (Entrance Tickets):
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div
                      className="p-2.5 rounded-xl flex justify-between items-center"
                      style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.3)', border: '1px solid var(--line)' }}
                    >
                      <div><strong className="block" style={{ color: 'var(--text)' }}>Adults</strong><span className="text-[10px] font-mono" style={{ color: 'var(--accent)' }}>₱100/head</span></div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="w-6 h-6 rounded-lg font-bold flex items-center justify-center cursor-pointer"
                          style={{ background: 'var(--accent)', color: isLight ? '#fff' : '#04170e' }}
                        >-</button>
                        <span className="font-bold w-4 text-center" style={{ color: 'var(--text)' }}>{adults}</span>
                        <button
                          type="button"
                          onClick={() => setAdults(adults + 1)}
                          className="w-6 h-6 rounded-lg font-bold flex items-center justify-center cursor-pointer"
                          style={{ background: 'var(--accent)', color: isLight ? '#fff' : '#04170e' }}
                        >+</button>
                      </div>
                    </div>

                    <div
                      className="p-2.5 rounded-xl flex justify-between items-center"
                      style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.3)', border: '1px solid var(--line)' }}
                    >
                      <div><strong className="block" style={{ color: 'var(--text)' }}>Children</strong><span className="text-[10px] font-mono" style={{ color: 'var(--accent)' }}>₱40/head</span></div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="w-6 h-6 rounded-lg font-bold flex items-center justify-center cursor-pointer"
                          style={{ background: 'var(--accent)', color: isLight ? '#fff' : '#04170e' }}
                        >-</button>
                        <span className="font-bold w-4 text-center" style={{ color: 'var(--text)' }}>{children}</span>
                        <button
                          type="button"
                          onClick={() => setChildren(children + 1)}
                          className="w-6 h-6 rounded-lg font-bold flex items-center justify-center cursor-pointer"
                          style={{ background: 'var(--accent)', color: isLight ? '#fff' : '#04170e' }}
                        >+</button>
                      </div>
                    </div>

                    <div
                      className="p-2.5 rounded-xl flex justify-between items-center"
                      style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.3)', border: '1px solid var(--line)' }}
                    >
                      <div><strong className="block" style={{ color: 'var(--text)' }}>Students</strong><span className="text-[10px] font-mono" style={{ color: 'var(--accent)' }}>₱70/head</span></div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setStudents(Math.max(0, students - 1))}
                          className="w-6 h-6 rounded-lg font-bold flex items-center justify-center cursor-pointer"
                          style={{ background: 'var(--accent)', color: isLight ? '#fff' : '#04170e' }}
                        >-</button>
                        <span className="font-bold w-4 text-center" style={{ color: 'var(--text)' }}>{students}</span>
                        <button
                          type="button"
                          onClick={() => setStudents(students + 1)}
                          className="w-6 h-6 rounded-lg font-bold flex items-center justify-center cursor-pointer"
                          style={{ background: 'var(--accent)', color: isLight ? '#fff' : '#04170e' }}
                        >+</button>
                      </div>
                    </div>

                    <div
                      className="p-2.5 rounded-xl flex justify-between items-center"
                      style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.3)', border: '1px solid var(--line)' }}
                    >
                      <div><strong className="block" style={{ color: 'var(--text)' }}>Seniors</strong><span className="text-[10px] font-mono" style={{ color: 'var(--accent)' }}>₱80/head</span></div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSeniors(Math.max(0, seniors - 1))}
                          className="w-6 h-6 rounded-lg font-bold flex items-center justify-center cursor-pointer"
                          style={{ background: 'var(--accent)', color: isLight ? '#fff' : '#04170e' }}
                        >-</button>
                        <span className="font-bold w-4 text-center" style={{ color: 'var(--text)' }}>{seniors}</span>
                        <button
                          type="button"
                          onClick={() => setSeniors(seniors + 1)}
                          className="w-6 h-6 rounded-lg font-bold flex items-center justify-center cursor-pointer"
                          style={{ background: 'var(--accent)', color: isLight ? '#fff' : '#04170e' }}
                        >+</button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <span style={{ color: 'var(--muted)' }}>Total Visitors: <strong style={{ color: 'var(--text)' }}>{totalVisitors} Guests</strong></span>
                    <span className="font-bold" style={{ color: 'var(--accent)' }}>• Duangon Cold Spring Day Pass Entrance</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: COTTAGE RENTAL SELECTION */}
              <div className="space-y-3">
                <h4 className="font-extrabold uppercase tracking-wider text-xs flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
                  <Home className="w-4 h-4" /> 2. Cottage Rental Selection
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COTTAGE_OPTIONS.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCottage(c)}
                      className="p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center"
                      style={
                        selectedCottage?.id === c.id
                          ? {
                              background: isLight ? 'rgba(74,222,128,0.15)' : 'rgba(6,60,30,0.8)',
                              borderColor: 'var(--accent)',
                              boxShadow: '0 0 10px rgba(74,222,128,0.2)',
                            }
                          : {
                              background: isLight ? 'var(--panel)' : '#04150e',
                              borderColor: 'var(--line)',
                            }
                      }
                    >
                      <div>
                        <strong className="block text-xs" style={{ color: 'var(--text)' }}>{c.name}</strong>
                        <span className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>{c.code}</span>
                      </div>
                      <strong className="font-mono text-xs" style={{ color: 'var(--accent)' }}>
                        {c.price === 0 ? 'Free' : `₱${c.price}/day`}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: RESORT ADD-ON SERVICES */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold uppercase tracking-wider text-xs flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
                    <Sparkles className="w-4 h-4" /> 3. Resort Services &amp; Facilities Add-Ons
                  </h4>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>{RESORT_SERVICES_CATALOG.length} Items Available</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {RESORT_SERVICES_CATALOG.map((s) => {
                    const IconComp = s.icon;
                    const qty = addonCart[s.id] || 0;
                    return (
                      <div
                        key={s.id}
                        className="p-3 rounded-xl border flex items-center justify-between"
                        style={{
                          background: isLight ? 'var(--panel)' : '#04150e',
                          borderColor: 'var(--line)',
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(74,222,128,0.15)', color: 'var(--accent)' }}
                          >
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-bold text-xs leading-tight" style={{ color: 'var(--text)' }}>{s.name}</h5>
                            <span className="text-[10px] font-mono" style={{ color: 'var(--accent)' }}>₱{s.price} / {s.unit}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAddonQty(s.id, -1)}
                            className="w-5 h-5 rounded font-bold flex items-center justify-center cursor-pointer"
                            style={{ background: 'var(--accent)', color: isLight ? '#fff' : '#04170e' }}
                          >-</button>
                          <span className="font-bold text-xs w-4 text-center" style={{ color: 'var(--text)' }}>{qty}</span>
                          <button
                            type="button"
                            onClick={() => handleAddonQty(s.id, 1)}
                            className="w-5 h-5 rounded font-bold flex items-center justify-center cursor-pointer"
                            style={{ background: 'var(--accent)', color: isLight ? '#fff' : '#04170e' }}
                          >+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ORDER SUMMARY & GRAND TOTAL */}
              <div
                className="p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-center gap-4"
                style={{
                  background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.4)',
                  borderColor: 'var(--line)',
                }}
              >
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--muted)' }}>Computed Grand Total:</span>
                  <div className="text-2xl font-black font-mono" style={{ color: 'var(--accent)' }}>
                    ₱{grandTotal.toLocaleString()}.00
                  </div>
                  <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                    Includes Entrance (₱{entranceTotal}), Cottage (₱{cottageTotal}), Add-ons (₱{addonTotal})
                  </span>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
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
                    type="submit"
                    className="flex-1 sm:flex-none px-6 py-2.5 text-slate-950 font-black rounded-xl text-xs shadow-lg cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                    style={{
                      background: 'var(--accent)',
                    }}
                  >
                    <Check className="w-4 h-4" /> Submit &amp; Get Reference Code
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
