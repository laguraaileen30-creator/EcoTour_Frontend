import React from 'react';
import { Clock, Download, Printer } from 'lucide-react';
import ClientNavbar from './components/ClientNavbar';
import ClientSidebar from './components/ClientSidebar';
import useBookings from './hooks/useBookings';

export default function BookingHistory() {
  const { bookings } = useBookings();

  const statusColors = {
    Pending: 'bg-amber-100 text-amber-800',
    Confirmed: 'bg-blue-100 text-blue-800',
    Completed: 'bg-emerald-100 text-emerald-800',
    Cancelled: 'bg-rose-100 text-rose-800',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ClientNavbar />
      <div className="flex">
        <ClientSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-6 h-6 text-emerald-600" />
                Booking History
              </h1>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
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
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50">
                        <td className="p-4 font-mono font-bold text-slate-900">{booking.bookingRef}</td>
                        <td className="p-4 text-slate-700">{booking.bookingDate}</td>
                        <td className="p-4 text-slate-700">{booking.serviceName}</td>
                        <td className="p-4 text-right font-mono font-bold text-emerald-700">
                          PHP {booking.totalPrice.toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColors[booking.status]}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {booking.status === 'Completed' && (
                            <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer">
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
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