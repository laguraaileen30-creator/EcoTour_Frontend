import React, { useEffect, useRef, useState } from 'react';
import { Clock3, CheckCircle2, XCircle, Mail, Wallet, AlertTriangle } from 'lucide-react';
import { useEcoTour } from '../context/EcoTourContext';
import { apiJson, peso } from '../utils/catalog';

const remaining = (deadline) => {
  const ms = new Date(deadline).getTime() - Date.now();
  if (!(ms > 0)) return null;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${String(m).padStart(2, '0')}m`;
};

const CONF_META = {
  AWAITING_CLIENT: { label: 'Waiting for client answer', color: '#f59e0b', icon: Clock3 },
  CONFIRMED: { label: 'Client confirmed — continue', color: '#22c55e', icon: CheckCircle2 },
  DECLINED: { label: 'Client cancelled (voided)', color: '#f43f5e', icon: XCircle },
  EXPIRED: { label: 'No answer in 24h — auto-voided', color: '#f43f5e', icon: AlertTriangle },
};

// Reservation fee (downpayment) + 24-hour confirmation status.
// role="client": shows Continue / Cancel while the resort is waiting for an answer.
export default function ReservationPaymentStatus({ booking, role = 'client', onChanged, compact = false }) {
  const { showAlert, showConfirm } = useEcoTour();
  const [, setTick] = useState(0);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);

  const conf = booking.confirmationStatus;
  const awaiting = conf === 'AWAITING_CLIENT';
  useEffect(() => {
    if (!awaiting) return undefined;
    const t = setInterval(() => setTick((x) => x + 1), 30000);
    return () => clearInterval(t);
  }, [awaiting]);

  const total = parseFloat(booking.estimatedTotal || booking.grandTotal || booking.totalPrice || 0);
  const fee = parseFloat(booking.reservationFee || 0);
  const paid = parseFloat(booking.amountPaid || 0);
  const balance = booking.balanceDue !== undefined ? parseFloat(booking.balanceDue) : Math.max(0, total - paid);
  const feePaid = booking.feeStatus === 'PAID' || booking.feeStatus === 'NOT_REQUIRED';
  const left = awaiting && booking.confirmationDeadline ? remaining(booking.confirmationDeadline) : null;
  const meta = CONF_META[conf];

  if (!fee && !conf && booking.feeStatus !== 'UNPAID') return null;

  const decide = async (action) => {
    if (lock.current) return;
    if (action === 'cancel') {
      const ok = await showConfirm({
        title: 'Cancel this reservation?',
        message: `Reservation ${booking.bookingRef || booking.bookingNumber} will be voided and the cottages released.`,
        type: 'danger',
        confirmText: 'Yes, cancel it',
      });
      if (!ok) return;
    }
    lock.current = true;
    setBusy(true);
    try {
      const res = await apiJson(`/reservations/${encodeURIComponent(booking.id || booking.bookingRef)}/decision`, { method: 'POST', auth: true, body: { action } });
      showAlert({ title: action === 'continue' ? 'Reservation confirmed' : 'Reservation cancelled', message: res.message, type: action === 'continue' ? 'success' : 'info' });
      onChanged && onChanged();
    } catch (e) {
      showAlert({ title: 'Could not save your answer', message: e.message, type: 'warning' });
      onChanged && onChanged();
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl p-3.5 space-y-2.5 text-xs" style={{ border: `1px solid ${awaiting ? 'rgba(245,158,11,0.55)' : 'var(--line)'}`, background: awaiting ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.05)' }}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="font-extrabold uppercase tracking-wider text-[10px] flex items-center gap-1.5" style={{ color: 'var(--accent)' }}><Wallet className="w-3.5 h-3.5" /> Reservation fee & payment</span>
        {meta && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1" style={{ color: meta.color, border: `1px solid ${meta.color}66`, background: `${meta.color}1a` }}>
            <meta.icon className="w-3 h-3" /> {meta.label}{left ? ` • ${left} left` : ''}
          </span>
        )}
      </div>

      <div className={`grid ${compact ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'} gap-2`}>
        {[
          ['Reservation fee', peso(fee), feePaid ? 'Paid' : 'Unpaid', feePaid ? '#22c55e' : '#f59e0b'],
          ['Paid so far', peso(paid), null],
          ['Balance due', peso(balance), balance > 0 ? 'On arrival' : 'Settled', balance > 0 ? 'var(--muted)' : '#22c55e'],
          ...(!compact ? [['Booking total', peso(total), null]] : []),
        ].map(([label, value, note, color]) => (
          <div key={label} className="rounded-xl p-2" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{label}</div>
            <div className="font-mono font-extrabold text-sm" style={{ color: 'var(--text)' }}>{value}</div>
            {note && <div className="text-[9px] font-bold" style={{ color }}>{note}</div>}
          </div>
        ))}
      </div>

      {role === 'client' && booking.feeStatus === 'UNPAID' && !['DECLINED', 'EXPIRED'].includes(conf) && (
        <p style={{ color: 'var(--text)' }}>
          💵 Pay the <b>{peso(fee)}</b> reservation fee in <b>cash at the resort counter</b> to secure this booking. The resort will email
          <b> your account email</b> to confirm — you then have <b>24 hours</b> to continue or cancel, otherwise it is voided automatically.
        </p>
      )}

      {role === 'client' && awaiting && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="flex items-center gap-1 font-bold" style={{ color: '#f59e0b' }}><Mail className="w-3.5 h-3.5" /> The resort is asking: will you continue?</span>
          <button type="button" disabled={busy} onClick={() => decide('continue')} className="px-3 py-1.5 rounded-lg font-extrabold text-white cursor-pointer disabled:opacity-50" style={{ background: '#059669' }}>✓ Continue</button>
          <button type="button" disabled={busy} onClick={() => decide('cancel')} className="px-3 py-1.5 rounded-lg font-extrabold cursor-pointer disabled:opacity-50" style={{ color: '#e11d48', border: '1px solid rgba(225,29,72,0.5)' }}>✕ Cancel reservation</button>
        </div>
      )}

      {role === 'staff' && booking.confirmationSentAt && (
        <p style={{ color: 'var(--muted)' }}>
          Confirmation emailed {new Date(booking.confirmationSentAt).toLocaleString('en-US', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' })}
          {booking.confirmationDeadline ? ` • deadline ${new Date(booking.confirmationDeadline).toLocaleString('en-US', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' })}` : ''}
        </p>
      )}
    </div>
  );
}
