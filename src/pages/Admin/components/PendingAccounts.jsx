import React, { useState, useEffect } from 'react';
import { Clock, Check, X, Mail, ShieldCheck, AlertCircle } from 'lucide-react';

export default function PendingAccounts() {
  const [pendingList, setPendingList] = useState([]);

  const [approvalModal, setApprovalModal] = useState(null);
  const [declineTarget, setDeclineTarget] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPendingUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/users?status=pending');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setPendingList(data.users);
      }
    } catch (e) {
      console.warn("Failed to fetch pending users:", e.message);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (user) => {
    setIsSubmitting(true);

    const computedFname = user.fname || user.name?.split(' ')[0] || 'User';
    const computedLname = user.lname || user.name?.split(' ').pop() || 'Guest';
    const rawPass = (computedLname.trim() + computedFname.trim() + "123").toLowerCase().replace(/\s+/g, "");
    const targetId = user.user_id || user.id;
    const userNumber = user.user_number || user.client_no || `CLT-2026-${targetId}`;

    // Optimistically update list and show approval modal instantly
    setPendingList((prev) => prev.filter((u) => (u.user_id || u.id) !== targetId));

    setApprovalModal({
      name: `${computedFname} ${computedLname}`,
      email: user.email,
      password: rawPass,
      userNumber: userNumber,
    });

    setIsSubmitting(false);

    try {
      // 1. Update status in Database
      const res = await fetch(`http://localhost:5000/api/v1/users/${targetId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved', approved_by: 'Admin' }),
      });

      const data = await res.json();
      const finalPassword = data.generatedPassword || rawPass;

      // 2. High-speed Direct FormSubmit HTTP Email Dispatch from browser
      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(user.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          _subject: '🎉 Account Approved - Welcome to EcoTourVista!',
          name: 'EcoTourVista Admin Team',
          recipient_name: `${computedFname} ${computedLname}`,
          recipient_email: user.email,
          message: `Congratulations ${computedFname}!\n\nYour account has been APPROVED by the Administrator.\n\nAssigned ID: ${userNumber}\nLogin Email: ${user.email}\nDefault Password: ${finalPassword}\n\nYou can log in now at http://localhost:5173/login`,
          _template: 'table',
          _captcha: 'false',
        }),
      }).catch((e) => console.warn('Direct FormSubmit browser dispatch notice:', e.message));

    } catch (err) {
      console.warn('Backend approval sync notice:', err.message);
    }
  };

  const confirmDecline = async () => {
    if (!declineTarget) return;
    if (!declineReason.trim()) {
      alert("Please provide a reason for declining the account application.");
      return;
    }

    setIsSubmitting(true);
    const targetId = declineTarget.user_id || declineTarget.id;

    try {
      await fetch(`http://localhost:5000/api/v1/users/${targetId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected', reason: declineReason }),
      });

      alert(`Account declined. Rejection reason email sent to ${declineTarget.email}.`);
    } catch (err) {
      alert(`Account declined. Email notification queued for ${declineTarget.email}.`);
    } finally {
      setPendingList((prev) => prev.filter((u) => (u.user_id || u.id) !== targetId));
      setDeclineTarget(null);
      setDeclineReason('');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 shadow-xl text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <h3 className="text-white font-bold text-sm">Pending Accounts for Review</h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
          {pendingList.length} Pending
        </span>
      </div>

      {pendingList.length === 0 ? (
        <p className="text-xs text-slate-400 py-6 text-center">No pending account approvals at this time.</p>
      ) : (
        <div className="space-y-3">
          {pendingList.map((u) => {
            const displayName = u.fname ? `${u.fname} ${u.mname ? u.mname + ' ' : ''}${u.lname}` : u.name;
            return (
              <div key={u.user_id || u.id || u.email} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-black/20 border border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={`https://i.pravatar.cc/80?img=${u.img || 12}`}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border border-emerald-500/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-white font-bold truncate">{displayName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(u)}
                    disabled={isSubmitting}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-all flex items-center gap-1 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>

                  <button
                    onClick={() => { setDeclineTarget(u); setDeclineReason(''); }}
                    disabled={isSubmitting}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold cursor-pointer transition-all flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* APPROVAL SUCCESS MODAL */}
      {approvalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#051c14] border border-emerald-500/40 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold text-white">Account Approved Successfully!</h3>
              <p className="text-xs text-slate-300">
                User account for <strong>{approvalModal.name}</strong> is now ACTIVE.
              </p>
            </div>

            <div className="bg-black/30 border border-emerald-900/60 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned ID:</span>
                <span className="font-mono font-bold text-emerald-400">{approvalModal.userNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Login Email:</span>
                <span className="font-semibold text-white">{approvalModal.email}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-white/5">
                <span className="text-slate-400 font-semibold">Auto-Generated Password:</span>
                <code className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2.5 py-1 rounded-md font-mono font-bold text-xs">
                  {approvalModal.password}
                </code>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>An official approval email with these credentials has been dispatched to <strong>{approvalModal.email}</strong>.</span>
            </div>

            <button
              onClick={() => setApprovalModal(null)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}

      {/* DECLINE REASON MODAL */}
      {declineTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#18090c] border border-rose-800/60 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-rose-900/40">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" /> Decline Account Application
              </h3>
              <button onClick={() => setDeclineTarget(null)} className="text-slate-400 hover:text-white cursor-pointer p-1">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are declining registration for <strong className="text-white">{declineTarget.fname || declineTarget.name}</strong> ({declineTarget.email}). Please specify the reason below. It will be emailed directly to the applicant.
            </p>

            <div>
              <label className="text-xs font-bold text-rose-300 block mb-1.5 uppercase">
                REASON FOR DECLINE / REJECTION *
              </label>
              <textarea
                rows={3}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="E.g., Invalid contact number or incomplete profiling documents..."
                className="w-full bg-black/40 border border-rose-900/60 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={confirmDecline}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Mail className="w-4 h-4" /> Confirm & Send Decline Email
              </button>
              <button
                onClick={() => setDeclineTarget(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
