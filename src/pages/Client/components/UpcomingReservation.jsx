import React from 'react';
import { Calendar, Users, Home, CreditCard, MapPin } from 'lucide-react';
import useBookings from '../../hooks/useBookings';

export default function UpcomingReservation() {
  const { bookings } = useBookings();
  const upcoming = bookings.find((b) => b.status === 'Confirmed' || b.status === 'Pending');

  if (!upcoming) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-600">No upcoming reservations</p>
        <p className="text-xs text-slate-500 mt-1">Book your next adventure today!</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-emerald-200 mb-1">UPCOMING RESERVATION</p>
          <h3 className="text-xl font-black">{upcoming.serviceName}</h3>
        </div>
        <span className="px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-[10px] font-bold uppercase">
          {upcoming.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-emerald-200">Date</p>
            <p className="text-sm font-bold">{upcoming.bookingDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-emerald-200">Guests</p>
            <p className="text-sm font-bold">{upcoming.quantity} pax</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-emerald-200">Time Slot</p>
            <p className="text-sm font-bold">{upcoming.timeSlot || 'Morning'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-emerald-200">Total</p>
            <p className="text-sm font-bold">PHP {upcoming.totalPrice.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}