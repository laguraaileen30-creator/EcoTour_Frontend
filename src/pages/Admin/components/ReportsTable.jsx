import React from 'react';
import { Printer, Download, FileSpreadsheet } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { formatCurrency, exportToCSV } from '../utils/dashboardHelpers';

export default function ReportsTable() {
  const { userAccounts, triggerPrintModal } = useDashboard();
  const clients = userAccounts.filter((u) => u.status === 'approved');

  const handleCSV = () => exportToCSV(
    clients.map((c) => ({ Name: c.name, Username: c.username, Email: c.email, Contact: c.phone || '', TotalSpent: c.totalSpent || 0 })),
    ['Name', 'Username', 'Email', 'Contact', 'TotalSpent'],
    'Duangon_Client_Report.csv'
  );

  return (
    <div className="card space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-emerald-800/40 pb-3">
        <div>
          <h3 className="font-bold text-emerald-300 text-base flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Duangon Operational & Financial Reports
          </h3>
          <p className="text-xs text-emerald-200/70">Export official revenue, visitor volume, and client profiling reports</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shadow-md transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => triggerPrintModal({ type: 'custom_report', title: 'Duangon Cold Spring Official Report' })}
            className="px-4 py-2 bg-slate-900 border border-emerald-500/30 hover:bg-slate-800 text-emerald-300 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" /> Print Report
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-emerald-800/40">
        <table className="w-full text-left text-xs">
          <thead className="bg-emerald-950/80 text-emerald-300 border-b border-emerald-800/40 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-3">Client Name</th>
              <th className="p-3">Email Address</th>
              <th className="p-3">Gender</th>
              <th className="p-3 text-center">Profile Status</th>
              <th className="p-3 text-right">Total Revenue Contribution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-900/30 text-emerald-100 font-medium">
            {clients.map((c) => (
              <tr key={c.id} className="hover:bg-emerald-950/30 transition-colors">
                <td className="p-3 font-bold text-emerald-100">{c.name}</td>
                <td className="p-3 text-emerald-300">{c.email}</td>
                <td className="p-3 text-emerald-200/80">{c.gender || 'N/A'}</td>
                <td className="p-3 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    c.profileCompleted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {c.profileCompleted ? 'Complete' : 'Pending Verification'}
                  </span>
                </td>
                <td className="p-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(c.totalSpent || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}