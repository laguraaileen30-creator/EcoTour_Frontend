import React, { useState } from 'react';
import {
  CreditCard, DollarSign, Receipt, CheckCircle2, ShieldCheck,
  Plus, ArrowUpRight, Wallet, QrCode, Clock
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';

const DEFAULT_PAYMENT_METHODS = [
  { id: 'm1', type: 'GCash / E-Wallet', details: '0917****567', isDefault: true, icon: Wallet },
  { id: 'm2', type: 'Credit / Debit Card', details: 'Visa ending in 4242', isDefault: false, icon: CreditCard },
  { id: 'm3', type: 'Pay at Counter', details: 'Cash on Arrival', isDefault: false, icon: DollarSign },
];

export default function ClientPaymentsTab() {
  const { currentUser, reservations, receipts } = useEcoTour();
  const [activeSubTab, setActiveSubTab] = useState('history');

  const clientEmail = currentUser?.email?.toLowerCase();
  const clientReservations = reservations.filter(
    (r) => (r.email && r.email.toLowerCase() === clientEmail) || clientEmail === 'client@gmail.com'
  );

  const paidTransactions = clientReservations.map((r, i) => ({
    id: `TXN-${1000 + i}`,
    date: r.reservationDate || 'May 25, 2024',
    service: r.specificType || 'Duangon Entrance & Cottage',
    amount: r.estimatedTotal || 600,
    status: r.status === 'Approved' ? 'Paid' : r.status,
    method: 'GCash / E-Wallet',
    refNo: r.bookingRef || `REF-${Math.floor(10000 + Math.random() * 90000)}`,
  }));

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-white">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-emerald-900/40 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Payments & Billing
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Manage payment history, pay for pending reservations, and saved payment methods.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[
            { key: 'history', label: 'Payment History' },
            { key: 'pay', label: 'Pay Reservation' },
            { key: 'methods', label: 'Payment Methods' },
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

      {/* SUB-TAB 1: PAYMENT HISTORY */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-500/20 bg-[#071f14] p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" /> Transaction History
            </h3>

            {paidTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No payment history found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#04150e] border-b border-emerald-800/40 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3 text-left">Transaction ID</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Service Description</th>
                      <th className="p-3 text-left">Payment Method</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/20">
                    {paidTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-emerald-950/40 transition-colors">
                        <td className="p-3 font-mono font-bold text-emerald-400">{tx.id}</td>
                        <td className="p-3 text-slate-300">{tx.date}</td>
                        <td className="p-3 font-semibold text-white">{tx.service}</td>
                        <td className="p-3 text-slate-300">{tx.method}</td>
                        <td className="p-3 text-right font-extrabold text-emerald-400">
                          ₱{tx.amount.toLocaleString()}.00
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
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
        </div>
      )}

      {/* SUB-TAB 2: PAY RESERVATION */}
      {activeSubTab === 'pay' && (
        <div className="rounded-2xl border border-emerald-500/20 bg-[#071f14] p-6 shadow-xl space-y-6 max-w-2xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Pay Pending Reservation
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">SELECT RESERVATION *</label>
              <select className="w-full bg-[#04150e] border border-emerald-800/60 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-400">
                {clientReservations.map((r) => (
                  <option key={r.bookingRef} value={r.bookingRef}>
                    {r.bookingRef} — {r.specificType} (₱{r.estimatedTotal})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">SELECT PAYMENT METHOD *</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="border border-emerald-500 bg-emerald-950/60 p-3 rounded-xl cursor-pointer text-center space-y-1">
                  <Wallet className="w-6 h-6 text-emerald-400 mx-auto" />
                  <span className="text-xs font-bold text-white block">GCash / Maya</span>
                </div>
                <div className="border border-emerald-800/60 bg-[#04150e] p-3 rounded-xl cursor-pointer text-center space-y-1 hover:border-emerald-500">
                  <CreditCard className="w-6 h-6 text-slate-400 mx-auto" />
                  <span className="text-xs font-bold text-white block">Credit Card</span>
                </div>
                <div className="border border-emerald-800/60 bg-[#04150e] p-3 rounded-xl cursor-pointer text-center space-y-1 hover:border-emerald-500">
                  <DollarSign className="w-6 h-6 text-slate-400 mx-auto" />
                  <span className="text-xs font-bold text-white block">Pay at Entrance</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => alert('Payment portal successfully connected! Reference generated.')}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/60 cursor-pointer transition-all uppercase tracking-wider"
            >
              PROCEED TO SECURE PAYMENT
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PAYMENT METHODS */}
      {activeSubTab === 'methods' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DEFAULT_PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  className="rounded-2xl border border-emerald-500/20 bg-[#071f14] p-5 space-y-3 relative shadow-lg"
                >
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    {method.isDefault && (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold rounded-full uppercase">
                        Default
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{method.type}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{method.details}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
