import React, { useState } from 'react';
import {
  CreditCard, DollarSign, Receipt, CheckCircle2, ShieldCheck,
  Plus, ArrowUpRight, Wallet, QrCode, Clock, Info, MapPin, Store, AlertTriangle
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';
import { getPhilippineDateStr } from '../../../utils/phTime';

export default function ClientPaymentsTab() {
  const { resortBookings, reservations, currentUser, receipts } = useEcoTour();
  const [activeSubTab, setActiveSubTab] = useState('policy');

  const allBookings = (resortBookings || []).length ? (resortBookings || []) : (reservations || []);

  const clientEmail = (currentUser?.email || '').toLowerCase().trim();
  const clientName = (`${currentUser?.fname || ''} ${currentUser?.lname || ''}`.trim() || currentUser?.name || '').toLowerCase().trim();
  const clientUserNum = String(currentUser?.user_number || currentUser?.userNumber || currentUser?.assignedId || '').toLowerCase().trim();

  const clientReservations = allBookings.filter((r) => {
    if (!currentUser) return true;
    const rEmail = (r.email || r.clientEmail || r.touristEmail || '').toLowerCase().trim();
    const rName = (r.clientName || r.fullName || r.touristName || '').toLowerCase().trim();
    const rUserNum = (r.userNumber || r.client_id || '').toLowerCase().trim();

    return (
      (clientEmail && rEmail === clientEmail) ||
      (clientName && (rName.includes(clientName) || clientName.includes(rName))) ||
      (clientUserNum && rUserNum === clientUserNum) ||
      !clientEmail ||
      clientEmail.includes('client')
    );
  });

  const walkInTransactions = clientReservations.map((r, i) => ({
    id: `BILL-${202600 + i}`,
    date: r.reservationDate || r.date || r.bookingDate || getPhilippineDateStr(),
    service: r.specificType || r.serviceName || r.service || 'Duangon Entrance & Cottage Booking',
    amount: r.estimatedTotal || r.totalPrice || r.grandTotal || r.total || 600,
    status: (r.status || '').toLowerCase().includes('paid') || (r.status || '').toLowerCase().includes('approved') || (r.status || '').toLowerCase().includes('completed') || (r.status || '').toLowerCase().includes('using')
      ? 'Paid (Verified)'
      : 'Pending (Pay at Counter)',
    method: r.paymentMethod || 'Walk-In Cash Payment',
    refNo: r.bookingRef || r.bookingNumber || `REF-${Math.floor(10000 + Math.random() * 90000)}`,
  }));

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-white">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-emerald-900/40 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Payments & On-Site Billing
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Official Resort Policy: All payments are settled via Walk-In Cash at the Entrance Cashier Counter.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[
            { key: 'policy', label: 'Walk-In Payment Policy' },
            { key: 'history', label: 'Walk-In Billing Ledger' },
            { key: 'cashier', label: 'Resort Cashier Info' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === tab.key
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* MANDATORY POLICY BANNER */}
      <div className="p-4 rounded-2xl bg-amber-950/80 border-2 border-amber-500/50 text-amber-200 text-xs font-bold flex items-start gap-3 shadow-xl">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-amber-300 uppercase block tracking-wider text-[11px]">
            Notice: No Online Payments Accepted
          </span>
          <p className="mt-0.5 text-amber-100 font-medium">
            Duangon Cold Spring Resort enforces an <strong>On-Site Walk-In Cash Payment System</strong>. Online reservations guarantee your entry slot and reserved cottages, but all fees (entrance fees, environmental fees, cottage rentals) are paid strictly in cash at the Resort Cashier Counter upon check-in.
          </p>
        </div>
      </div>

      {/* SUB-TAB 1: WALK-IN PAYMENT POLICY */}
      {activeSubTab === 'policy' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="etv-payments-card md:col-span-2 rounded-2xl border border-emerald-500/20 bg-[#071f14] p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-400" /> Walk-In Cash Payment Workflow
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-900/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">1</span>
                <div>
                  <h4 className="font-extrabold text-white">Book Online Reservation</h4>
                  <p className="text-slate-400 mt-0.5">Submit your date, visitor counts, and cottage selection online. No payment or credit card is required during booking.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-900/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">2</span>
                <div>
                  <h4 className="font-extrabold text-white">Arrive at Resort Entrance Counter</h4>
                  <p className="text-slate-400 mt-0.5">Present your Reservation Code or Name to the Cashier Staff at the Duangon Main Entrance POS Counter.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-900/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">3</span>
                <div>
                  <h4 className="font-extrabold text-white">Pay Cash & Receive BIR Official Receipt</h4>
                  <p className="text-slate-400 mt-0.5">Settle your total cash bill at the counter. You will receive an Official Printed BIR Receipt (`OR-2026-XXXXXX`) and entrance wristbands.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SIDE CARD: FEES SUMMARY */}
          <div className="etv-payments-card rounded-2xl border border-emerald-500/20 bg-[#071f14] p-5 space-y-3 shadow-xl text-xs">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-xs border-b border-emerald-900/60 pb-2">
              Resort Fee Schedule (Cash)
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>Adult Entrance Fee:</span>
                <strong className="font-mono text-emerald-400">₱100.00 / head</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>Child Entrance Fee:</span>
                <strong className="font-mono text-emerald-400">₱40.00 / head</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>Senior / PWD Discount:</span>
                <strong className="font-mono text-emerald-400">₱80.00 / head</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>Standard Cottage:</span>
                <strong className="font-mono text-emerald-400">₱600.00 / day</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>Large Family Cottage:</span>
                <strong className="font-mono text-emerald-400">₱1,000.00 / day</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: WALK-IN BILLING LEDGER */}
      {activeSubTab === 'history' && (
        <div className="etv-payments-card rounded-2xl border border-emerald-500/20 bg-[#071f14] p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" /> Walk-In Reservation Billing Ledger
          </h3>

          {walkInTransactions.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No walk-in reservation billing records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#04150e] border-b border-emerald-800/40 text-slate-400 uppercase text-[10px] font-mono">
                  <tr>
                    <th className="p-3 text-left">Bill ID</th>
                    <th className="p-3 text-left">Booking Date</th>
                    <th className="p-3 text-left">Service Item</th>
                    <th className="p-3 text-left">Payment Method</th>
                    <th className="p-3 text-right">Estimated Cash Total</th>
                    <th className="p-3 text-center">Billing Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/20 font-medium">
                  {walkInTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-emerald-950/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-emerald-400">{tx.id}</td>
                      <td className="p-3 text-slate-300 font-mono">{tx.date}</td>
                      <td className="p-3 text-white font-bold">{tx.service}</td>
                      <td className="p-3 text-slate-300 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Walk-In Cash at Counter
                      </td>
                      <td className="p-3 text-right font-mono font-black text-emerald-400 text-sm">
                        ₱{tx.amount.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          tx.status.includes('Paid')
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                            : 'bg-amber-950 text-amber-300 border border-amber-700/60'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: RESORT CASHIER COUNTER INFO */}
      {activeSubTab === 'cashier' && (
        <div className="etv-payments-card rounded-2xl border border-emerald-500/20 bg-[#071f14] p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" /> Duangon Resort Cashier & Entrance Counter
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-black/40 border border-emerald-900/60 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Cashier Counter Hours</span>
              <p className="text-sm font-extrabold text-white">7:00 AM - 6:00 PM (Monday - Sunday)</p>
              <p className="text-slate-400">Cashier staff are available continuously throughout resort operating hours.</p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-emerald-900/60 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Accepted Payment Media</span>
              <p className="text-sm font-extrabold text-emerald-400">Philippine Peso (PHP) Cash Only</p>
              <p className="text-slate-400">Please prepare exact cash or Philippine Peso bills upon arrival at the gate.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
