import React, { useState } from 'react';
import {
  CalendarDays, Calendar, Clock, Package, Users, DollarSign,
  CheckCircle2, XCircle, AlertCircle, QrCode, ArrowRight, RefreshCw, Filter, Camera
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';

export default function ClientBookingsTab({ onNavigateBook }) {
  const { currentUser, reservations, cancelReservationBooking } = useEcoTour();
  const [statusFilter, setStatusFilter] = useState('All');

  const clientEmail = currentUser?.email?.toLowerCase();
  const clientName = (currentUser?.name || currentUser?.fullName || '').toLowerCase();

  const myReservations = (reservations || []).filter((r) => {
    if (!clientEmail && !clientName) return true;
    const rEmail = (r.email || r.clientEmail || r.touristEmail || '').toLowerCase();
    const rName = (r.clientName || r.fullName || r.touristName || '').toLowerCase();
    return (
      (clientEmail && rEmail === clientEmail) ||
      (clientName && (rName.includes(clientName) || clientName.includes(rName))) ||
      clientEmail === 'client@gmail.com'
    );
  });

  const filteredReservations = myReservations.filter((r) => {
    if (statusFilter === 'All') return true;
    return r.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  const handleCancel = (bookingRef) => {
    if (window.confirm(`Are you sure you want to cancel reservation ${bookingRef}?`)) {
      if (cancelReservationBooking) {
        cancelReservationBooking(bookingRef);
      }
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'Pending').toLowerCase();
    if (s === 'approved' || s === 'confirmed') {
      return (
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold rounded-full flex items-center gap-1 uppercase">
          <CheckCircle2 className="w-3 h-3" /> Approved
        </span>
      );
    }
    if (s === 'pending') {
      return (
        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold rounded-full flex items-center gap-1 uppercase">
          <Clock className="w-3 h-3" /> Pending Approval
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-extrabold rounded-full flex items-center gap-1 uppercase">
          <XCircle className="w-3 h-3" /> Cancelled
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-slate-500/20 text-slate-300 border border-slate-500/40 text-[10px] font-extrabold rounded-full uppercase">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-white">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-emerald-900/40 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Reservations
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              View, manage, and track your active, upcoming, and past resort bookings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Approved', 'Pending', 'Cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === f
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900/60'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* RESERVATIONS LIST */}
      {filteredReservations.length === 0 ? (
        <div className="rounded-3xl border border-emerald-800/40 bg-[#071d13] p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">No Reservations Found</h3>
            <p className="text-xs text-slate-400">
              You haven't booked any resort activities or cottages yet, or no bookings match the selected filter.
            </p>
          </div>
          <button
            onClick={onNavigateBook}
            className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/60 inline-flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>Explore Destinations & Book Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReservations.map((res) => (
            <div
              key={res.id || res.bookingRef}
              className="rounded-2xl border border-emerald-500/20 bg-[#071f14] p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider">
                      REF: {res.bookingRef}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {res.specificType || 'Duangon Resort Package'}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(res.status)}
                </div>
              </div>

              {/* SCREENSHOT REMINDER BANNER FOR STAFF TRACKING */}
              <div className="bg-amber-950/40 border border-amber-500/40 p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Camera className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Screenshot Reminder: Keep your Booking ID <strong className="font-mono text-emerald-300">{res.bookingRef}</strong> ready for resort staff</span>
                </div>
                <span className="text-[10px] text-amber-200/80 bg-amber-900/60 px-2 py-0.5 rounded-md border border-amber-700/50 whitespace-nowrap">
                  Show at entrance
                </span>
              </div>

              {/* DETAILS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-black/20 p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Visit Date
                  </span>
                  <div className="font-bold text-slate-100">{res.reservationDate}</div>
                  <div className="text-[11px] text-slate-400">{res.arrivalTime}</div>
                </div>

                <div className="bg-black/20 p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-400" /> Visitors Count
                  </span>
                  <div className="font-bold text-slate-100">{res.numberOfGuests} Visitors</div>
                  <div className="text-[11px] text-slate-400">Adults & Children</div>
                </div>

                <div className="bg-black/20 p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Total Amount
                  </span>
                  <div className="font-extrabold text-emerald-400 text-sm">
                    ₱{res.estimatedTotal ? res.estimatedTotal.toLocaleString() : '0'}.00
                  </div>
                  <div className="text-[11px] text-emerald-300/80">Payable at counter / online</div>
                </div>

                <div className="bg-black/20 p-3 rounded-xl border border-white/5 flex items-center justify-center gap-2 text-center">
                  <QrCode className="w-8 h-8 text-emerald-400 shrink-0" />
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 font-bold block">FAST ENTRY</span>
                    <span className="text-[10px] text-emerald-300 font-semibold">Show QR on Arrival</span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              {res.status?.toLowerCase() !== 'cancelled' && (
                <div className="flex justify-end items-center gap-3 border-t border-white/5 pt-3">
                  <button
                    onClick={() => handleCancel(res.bookingRef)}
                    className="px-4 py-2 bg-rose-950/60 border border-rose-700/50 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl cursor-pointer transition-all"
                  >
                    Cancel Reservation
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
