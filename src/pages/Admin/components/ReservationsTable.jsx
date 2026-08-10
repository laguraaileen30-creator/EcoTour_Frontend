import React, { useState } from 'react';
import { DollarSign, Calendar, CheckCircle2, UserCheck } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { formatCurrency } from '../utils/dashboardHelpers';
import PaymentModal from '../modals/PaymentModal';

export default function ReservationsTable() {
  const { resortBookings, updateResortBookingStatus, checkInBookingGuest, checkOutBookingGuest } = useDashboard();
  const [payBooking, setPayBooking] = useState(null);

  return (
    <div className="card space-y-4">
      <div className="flex justify-between items-center border-b border-emerald-800/40 pb-3">
        <div>
          <h3 className="font-bold text-emerald-300 text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" /> Duangon Resort Reservations & Bookings
          </h3>
          <p className="text-xs text-emerald-200/70">Review online bookings, collect payments, and manage guest check-ins</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-emerald-800/40">
        <table className="w-full text-left text-xs">
          <thead className="bg-emerald-950/80 text-emerald-300 border-b border-emerald-800/40 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-3">Booking Ref</th>
              <th className="p-3">Client Name</th>
              <th className="p-3">Reserved Service</th>
              <th className="p-3 text-right">Total (₱)</th>
              <th className="p-3">Arrival Slot</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-900/30 text-emerald-100 font-medium">
            {resortBookings.map((b) => {
              const statusStr = b.status || 'Pending';
              const statusLower = statusStr.toLowerCase();
              const clientDisp = b.clientName || b.fullName || b.touristName || 'Guest';
              const serviceDisp = b.serviceName || b.packageName || 'Resort Day Pass';
              const priceVal = parseFloat(b.totalPrice || b.grandTotal || 0);
              const timeDisp = b.timeSlot || b.arrivalTime || '09:00 AM';

              return (
                <tr key={b.id || b.bookingRef} className="hover:bg-emerald-950/30 transition-colors">
                  <td className="p-3 font-mono font-bold text-emerald-400">{b.bookingRef}</td>
                  <td className="p-3 font-bold text-emerald-100">{clientDisp}</td>
                  <td className="p-3 text-emerald-300">{serviceDisp}</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(priceVal)}</td>
                  <td className="p-3 text-emerald-200/80">{timeDisp}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      statusLower === 'confirmed' || statusLower === 'approved' || statusLower === 'checked in' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                      statusLower === 'paid' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' :
                      statusLower === 'cancelled' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {statusStr}
                    </span>
                  </td>
                  <td className="p-3 text-center space-x-1.5">
                    {(statusLower === 'pending' || statusLower === 'submitted') && (
                      <button onClick={() => updateResortBookingStatus(b.id || b.bookingRef, 'Approved')} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-lg cursor-pointer">
                        Approve
                      </button>
                    )}
                    {(statusLower === 'confirmed' || statusLower === 'approved') && (
                      <button onClick={() => setPayBooking(b)} className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded-lg cursor-pointer inline-flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Collect Cash
                      </button>
                    )}
                    {(statusLower === 'paid' || statusLower === 'confirmed' || statusLower === 'approved') && (
                      <button onClick={() => checkInBookingGuest(b.id || b.bookingRef)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-lg cursor-pointer inline-flex items-center gap-1">
                        <UserCheck className="w-3 h-3" /> Check In
                      </button>
                    )}
                    {statusLower === 'checked in' && (
                      <button onClick={() => checkOutBookingGuest(b.id || b.bookingRef)} className="px-3 py-1 bg-teal-700 hover:bg-teal-600 text-white font-bold text-[10px] rounded-lg cursor-pointer">
                        Check Out
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaymentModal booking={payBooking} onClose={() => setPayBooking(null)} />
    </div>
  );
}