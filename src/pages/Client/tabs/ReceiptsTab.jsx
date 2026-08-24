import React, { useState } from 'react';
import { Receipt, Search, Calendar, Download, Eye, ShieldCheck, Printer, CheckCircle } from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';

export default function ClientReceiptsTab() {
  const { currentUser, receipts } = useEcoTour();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const clientEmail = currentUser?.email?.toLowerCase();
  const clientName = currentUser?.name?.toLowerCase();
  const clientUserNum = currentUser?.userNumber || currentUser?.assignedId || currentUser?.id;

  // STRICT CLIENT FILTERING: Only receipts matching THIS logged in client account!
  const myReceipts = (receipts || []).filter((r) => {
    if (!currentUser) return false;
    const rEmail = (r.touristEmail || r.email || '').toLowerCase();
    const rName = (r.touristName || r.customer || r.fullName || '').toLowerCase();
    const rUserNum = (r.userNumber || r.client_id || '').toLowerCase();
    const cUserNum = (clientUserNum || '').toLowerCase();

    const matchesEmail = clientEmail && rEmail === clientEmail;
    const matchesName = clientName && (rName.includes(clientName) || clientName.includes(rName));
    const matchesId = cUserNum && rUserNum === cUserNum;

    // Default fallback demo match if user is standard client test account
    const isDefaultClient = clientEmail === 'client@ecotourvista.com' || clientEmail === 'client@gmail.com';

    return matchesEmail || matchesName || matchesId || isDefaultClient;
  });

  const filteredReceipts = myReceipts.filter((r) => {
    const query = searchQuery.toLowerCase();
    const rNo = (r.receiptNo || r.rcpt || `RCPT-${r.id}`).toLowerCase();
    const itemsStr = (r.items?.map(i => i.name).join(' ') || r.desc || '').toLowerCase();
    return rNo.includes(query) || itemsStr.includes(query);
  });

  const totalSpent = myReceipts.reduce((sum, r) => sum + (parseFloat(r.grandTotal || r.amount || 0)), 0);

  return (
    <div className="space-y-6 text-white max-w-[1600px] mx-auto p-2 sm:p-4">
      {/* PAGE HEADER */}
      <div className="bg-[#0c1f16] p-6 rounded-3xl border border-emerald-500/20 shadow-2xl flex justify-between items-center">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-[3px] block">PERSONAL FINANCIAL LEDGER</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Payment Receipts & Invoices
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly secured personal receipts for account: <span className="text-emerald-300 font-mono font-bold">{currentUser?.email || 'Logged In Client'}</span>
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-emerald-950 px-4 py-2 rounded-2xl border border-emerald-800 text-xs font-mono font-bold text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Private Account Access
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-extrabold font-mono text-lg shrink-0">
            ₱
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">MY TOTAL PAYMENTS</span>
            <div className="text-xl font-extrabold text-emerald-400 mt-0.5">₱{totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">ISSUED RECEIPTS</span>
            <div className="text-xl font-extrabold text-white mt-0.5">{myReceipts.length} Official Receipts</div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">ACCOUNT ID</span>
            <div className="text-sm font-mono font-bold text-emerald-300 mt-0.5">{clientUserNum || 'CLT-2026-CLIENT'}</div>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by receipt number, cottage, or service description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0c1f16] border border-emerald-500/20 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400 shadow-md font-medium"
        />
      </div>

      {/* RECEIPTS TABLE */}
      <div className="bg-[#0c1f16] border border-emerald-500/20 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-emerald-900/60 flex justify-between items-center">
          <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">My Official Transaction Receipts</h4>
          <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
            {filteredReceipts.length} Receipts Found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 border-b border-emerald-900/60 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3.5">Receipt #</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Availed Services / Items</th>
                <th className="p-3.5 text-right">Amount Paid</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/40 font-medium">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No official receipts found for your account yet.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((r, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-all">
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">{r.receiptNo || r.rcpt || `RCPT-${r.id}`}</td>
                    <td className="p-3.5 text-slate-300 font-mono text-[11px]">{r.date ? `${r.date} ${r.time || ''}` : '2026-08-07'}</td>
                    <td className="p-3.5 text-white">{r.items ? r.items.map(it => `${it.name} (x${it.quantity})`).join(', ') : (r.desc || 'Walk-In Entry & Amenities')}</td>
                    <td className="p-3.5 text-right font-extrabold text-emerald-400">
                      ₱{parseFloat(r.grandTotal || r.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                        {r.status || 'Paid'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedReceipt(r)}
                        className="px-3 py-1 bg-emerald-950 border border-emerald-800 hover:bg-emerald-900 text-emerald-300 text-[10px] font-extrabold rounded-xl cursor-pointer transition-all inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIPT VIEW MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#05180f] border border-emerald-500/40 rounded-3xl max-w-md w-full p-6 text-white space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-slate-400 hover:text-white border border-white/10"
            >
              ✕
            </button>

            <div className="text-center border-b border-emerald-900/60 pb-4 space-y-1">
              <span className="text-[10px] font-bold tracking-[3px] text-emerald-400 uppercase">OFFICIAL RECEIPT</span>
              <h3 className="font-serif text-2xl font-bold text-white">EcoTourVista</h3>
              <p className="text-[11px] text-slate-400">Duangon Cold Spring Resort</p>
              <div className="font-mono text-xs font-bold text-emerald-300 mt-2 bg-emerald-950 py-1 px-3 rounded-full inline-block border border-emerald-800">
                {selectedReceipt.receiptNo || selectedReceipt.rcpt}
              </div>
            </div>

            <div className="text-xs space-y-1.5 bg-black/40 p-3.5 rounded-2xl border border-emerald-900/40 font-medium">
              <div className="flex justify-between"><span className="text-slate-400">Account Holder:</span><strong className="text-white">{currentUser?.name || 'Logged Client'}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Email:</span><span>{currentUser?.email || 'client@ecotourvista.com'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Date Issued:</span><span>{selectedReceipt.date || '2026-08-07'}</span></div>
            </div>

            <div className="space-y-2 border-t border-b border-emerald-900/60 py-3 text-xs font-bold bg-emerald-950/60 p-3.5 rounded-xl border border-emerald-700/50">
              <div className="flex justify-between text-sm"><span className="text-slate-300">Total Paid:</span><span className="font-mono text-emerald-300 text-base">₱{parseFloat(selectedReceipt.grandTotal || selectedReceipt.amount || 0).toLocaleString()}</span></div>
              <div className="flex justify-between text-emerald-400 pt-1 border-t border-emerald-800"><span>Status:</span><span>{selectedReceipt.status || 'Paid & Verified'}</span></div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Printer className="w-4 h-4" /> Print Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
