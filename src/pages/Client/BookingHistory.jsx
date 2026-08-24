import React from 'react';
import { Clock, Download, Printer, CheckCircle2, Sparkles, XCircle, Calendar } from 'lucide-react';
import ClientNavbar from './components/ClientNavbar';
import ClientSidebar from './components/ClientSidebar';
import useBookings from './hooks/useBookings';
import { getStageIndex } from '../../../components/VerticalReservationTimeline';

export default function BookingHistory() {
  const { bookings } = useBookings();

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('cancel')) {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800">Cancelled</span>;
    }
    const idx = getStageIndex(status);
    if (idx === 3) return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">04 — Completed</span>;
    if (idx === 2) return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sky-100 text-sky-800">03 — In Service</span>;
    if (idx === 1) return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">02 — Paid</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">01 — Pending</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <ClientNavbar />
      <div className="flex">
        <ClientSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-6 h-6 text-emerald-600" />
                Client Booking History
              </h1>
              <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                {bookings.length} Total Bookings
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-4 font-bold text-slate-700 uppercase text-[10px]">Reservation ID</th>
                      <th className="text-left p-4 font-bold text-slate-700 uppercase text-[10px]">Visit Date</th>
                      <th className="text-left p-4 font-bold text-slate-700 uppercase text-[10px]">Services</th>
                      <th className="text-right p-4 font-bold text-slate-700 uppercase text-[10px]">Total Amount</th>
                      <th className="text-center p-4 font-bold text-slate-700 uppercase text-[10px]">Status</th>
                      <th className="text-center p-4 font-bold text-slate-700 uppercase text-[10px]">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          No booking history found.
                        </td>
                      </tr>
                    ) : (
                      bookings.map((booking) => {
                        const total = parseFloat(booking.estimatedTotal || booking.grandTotal || booking.totalPrice || 0);
                        const ref = booking.bookingRef || booking.bookingNumber || `BK-${booking.id}`;
                        const date = booking.reservationDate || booking.bookingDate || 'N/A';
                        const svc = booking.specificType || booking.serviceName || booking.packageName || 'Resort Service';

                        return (
                          <tr key={booking.id || ref} className="hover:bg-slate-50">
                            <td className="p-4 font-mono font-bold text-emerald-700">{ref}</td>
                            <td className="p-4 text-slate-700">{date}</td>
                            <td className="p-4 text-slate-700 font-medium">{svc}</td>
                            <td className="p-4 text-right font-mono font-bold text-slate-900">
                              ₱{total.toLocaleString()}.00
                            </td>
                            <td className="p-4 text-center">
                              {getStatusBadge(booking.status)}
                            </td>
                            <td className="p-4 text-center">
                              {getStageIndex(booking.status) >= 1 && (
                                <button
                                  onClick={() => window.print()}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer inline-flex items-center gap-1"
                                  title="Print Official Receipt"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}