import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';

export default function PendingClients() {
  const { userAccounts, approveUserAccount, rejectUserAccount } = useDashboard();
  const pending = userAccounts.filter((u) => u.status === 'pending');
  if (pending.length === 0) return (
    <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-xs font-bold text-slate-500">
      No pending account approvals. 🎉
    </div>
  );
  return (
    <div className="space-y-3">
      {pending.map((acc) => (
        <div key={acc.id} className="bg-white p-4 rounded-2xl border border-amber-200 flex justify-between items-center shadow-xs">
          <div>
            <p className="font-bold text-slate-900 text-sm">{acc.name}</p>
            <p className="text-xs text-slate-500">{acc.email} • {acc.phone}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => approveUserAccount(acc.id)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Approve</button>
            <button onClick={() => rejectUserAccount(acc.id)} className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}