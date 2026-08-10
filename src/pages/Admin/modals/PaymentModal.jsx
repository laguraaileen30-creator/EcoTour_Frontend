import React, { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { formatCurrency } from '../utils/dashboardHelpers';

export default function PaymentModal({ booking, onClose }) {
  const { collectBookingCashPayment } = useDashboard();
  const [tendered, setTendered] = useState(0);
  useEffect(() => { if (booking) setTendered(booking.totalPrice); }, [booking]);
  if (!booking) return null;
  const change = tendered - booking.totalPrice;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
        <div className="flex justify-between items-center"><h3 className="font-bold text-slate-900">Collect Cash — {booking.bookingRef}</h3><button onClick={onClose} className="text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button></div>
        <div className="p-3 bg-emerald-50 rounded-xl flex justify-between text-sm font-bold text-emerald-900"><span>Amount Due:</span><span className="font-mono">{formatCurrency(booking.totalPrice)}</span></div>
        <input type="number" value={tendered} onChange={(e) => setTendered(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-mono" />
        <div className={`text-xs font-bold ${change >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>Change: {formatCurrency(Math.max(0, change))}{change < 0 && ' (insufficient)'}</div>
        <button disabled={change < 0} onClick={() => { collectBookingCashPayment(booking.id); onClose(); }} className="w-full py-2 bg-amber-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Confirm Payment</button>
      </div>
    </div>
  );
}