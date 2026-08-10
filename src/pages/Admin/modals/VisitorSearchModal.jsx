import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { formatCurrency } from '../utils/dashboardHelpers';

export default function VisitorSearchModal({ isOpen, onClose }) {
  const { tourists } = useDashboard();
  const [query, setQuery] = useState('');
  if (!isOpen) return null;
  const results = tourists.filter((t) => t.fullName.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl">
        <div className="flex justify-between items-center"><h3 className="font-bold text-slate-900">Visitor Search</h3><button onClick={onClose} className="text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button></div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name..." className="w-full pl-9 bg-slate-50 border p-2.5 rounded-xl text-xs" />
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {results.length === 0 && <p className="text-xs text-slate-400 text-center py-6">No visitors found.</p>}
          {results.map((t) => (
            <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between text-xs">
              <div><span className="font-bold text-slate-900">{t.fullName}</span><span className="text-slate-500"> • {t.date}</span></div>
              <span className="font-mono font-bold text-emerald-800">{formatCurrency(t.totalSpent)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}