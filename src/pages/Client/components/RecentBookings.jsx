import React from 'react';
import { Clock } from 'lucide-react';
import useBookings from '../../hooks/useBookings';

export default function RecentBookings() {
  const { bookings } = useBookings();
  const recent = bookings.slice(0, 5);

  const statusColors = {
    Pending: 'bg-amber-100 text-amber-800',
    Confirmed: 'bg-blue-100 text-blue-800',
    Completed: 'bg-emerald-100 text-emerald-800',
    Cancelled: 'bg-rose-100 text-rose-800',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          Recent Bookings
        </h3>
        <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-3 font-bold text-slate-700 uppercase text-[10px]">Ref #</th>
              <th className="text-left p-3 font-bold text-slate-700 uppercase text-[10px]">Service</th>
              <th className="text-left p-3 font-bold text-slate-700 uppercase text-[10px]">Date</th>
              <th className="text-right p-3 font-bold text-slate-700 uppercase text-[10px]">Amount</th>
              <th className="text-center p-3 font-bold text-slate-700 uppercase text-[10px]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recent.map((booking) => (
              <tr key={booking.id} className="hover:bg-slate-50">
                <td className="p-3 font-mono font-bold text-slate-900">{booking.bookingRef}</td>
                <td className="p-3 text-slate-700">{booking.serviceName}</td>
                <td className="p-3 text-slate-600">{booking.bookingDate}</td>
                <td className="p-3 text-right font-mono font-bold text-emerald-700">
                  PHP {booking.totalPrice.toLocaleString()}
                </td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColors[booking.status]}`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}