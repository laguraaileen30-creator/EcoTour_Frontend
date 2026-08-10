import React, { useState } from 'react';
import { FileText, Search, CheckCircle, Clock } from 'lucide-react';
import { useStaff } from '../hooks/useStaff';

export default function ServiceOrdersTab() {
  const { resortBookings, updateResortBookingStatus } = useStaff();
  const [searchQuery, setSearchQuery] = useState('');

  const bookingsList = resortBookings || [];

  const filteredBookings = bookingsList.filter((b) => {
    const query = searchQuery.toLowerCase();
    return (
      (b.clientName && b.clientName.toLowerCase().includes(query)) ||
      (b.userNumber && b.userNumber.toLowerCase().includes(query)) ||
      (b.bookingRef && b.bookingRef.toLowerCase().includes(query)) ||
      (b.serviceName && b.serviceName.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6 text-white max-w-[1600px] mx-auto p-2 sm:p-4">
      {/* Header */}
      <div className="bg-[#0c1f16] p-5 rounded-2xl border border-emerald-500/20 shadow-xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-lg">Client Service Orders & Bookings</h3>
            <p className="text-xs text-slate-400">View and confirm client orders, walk-in services, and user ID assignments</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
          {filteredBookings.length} Total Orders
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by client name, Client ID / User #, or booking ref..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0c1f16] border border-emerald-500/20 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400 shadow-md font-medium"
        />
      </div>

      {/* Bookings Table */}
      <div className="bg-[#0c1f16] border border-emerald-500/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 border-b border-emerald-900/60 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3.5">Booking Ref</th>
                <th className="p-3.5">Client ID / User #</th>
                <th className="p-3.5">Client Name</th>
                <th className="p-3.5">Availed Services</th>
                <th className="p-3.5 text-right">Total Price</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/40 font-medium">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-white/5 transition-all">
                  <td className="p-3.5 font-mono text-emerald-400 font-bold">{b.bookingRef || `REF-${b.id}`}</td>
                  <td className="p-3.5 font-mono text-emerald-300 font-bold">{b.userNumber || b.client_id || 'CLT-2026-901'}</td>
                  <td className="p-3.5 font-bold text-white">{b.clientName || b.fullName || 'Walk-In Client'}</td>
                  <td className="p-3.5 text-slate-300 max-w-xs truncate">{b.serviceName || b.packageName || 'Resort Amenities'}</td>
                  <td className="p-3.5 text-right font-extrabold text-emerald-400">
                    ₱{parseFloat(b.totalPrice || b.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      (b.status || 'Approved').toLowerCase() === 'confirmed' || (b.status || '').toLowerCase() === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {b.status || 'Approved'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    {(b.status || '').toLowerCase() === 'pending' && (
                      <button
                        onClick={() => updateResortBookingStatus(b.id || b.bookingRef, 'Approved')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all shadow"
                      >
                        Approve
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
  );
}