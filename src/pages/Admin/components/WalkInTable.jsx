import React, { useState } from 'react';
import { Search, UserCheck, Receipt } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { formatCurrency } from '../utils/dashboardHelpers';
import VisitorSearchModal from '../modals/VisitorSearchModal';

export default function WalkInTable() {
  const { tourists } = useDashboard();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="card space-y-4">
      <div className="flex justify-between items-center border-b border-emerald-800/40 pb-3">
        <div>
          <h3 className="font-bold text-emerald-300 text-base flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" /> Walk-In Visitors & Cash POS Logs
          </h3>
          <p className="text-xs text-emerald-200/70">Real-time counter entries, walk-in guest logs, and official cash receipts</p>
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer flex items-center gap-2 shadow-xs transition-all"
        >
          <Search className="w-4 h-4" /> Search Visitor Profile
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-emerald-800/40">
        <table className="w-full text-left text-xs">
          <thead className="bg-emerald-950/80 text-emerald-300 border-b border-emerald-800/40 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-3">Guest Name</th>
              <th className="p-3">Visitor Category</th>
              <th className="p-3 text-center">Group Pax</th>
              <th className="p-3 text-right">Total Paid (₱)</th>
              <th className="p-3">Timestamp</th>
              <th className="p-3 font-mono">Receipt OR#</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-900/30 text-emerald-100 font-medium">
            {tourists.map((t) => (
              <tr key={t.id} className="hover:bg-emerald-950/30 transition-colors">
                <td className="p-3 font-bold text-emerald-100">{t.fullName}</td>
                <td className="p-3 text-emerald-300">{t.visitorType} ({t.nationality})</td>
                <td className="p-3 text-center font-bold text-emerald-400">{t.totalVisitors} pax</td>
                <td className="p-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(t.totalSpent)}</td>
                <td className="p-3 text-emerald-200/80">{t.date} • {t.timeIn}</td>
                <td className="p-3 font-mono text-emerald-300 flex items-center gap-1">
                  <Receipt className="w-3.5 h-3.5 text-emerald-400" /> {t.receiptId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <VisitorSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}