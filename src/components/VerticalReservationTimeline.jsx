import React from 'react';
import { Check, Clock, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import './VerticalReservationTimeline.css';

export const TIMELINE_STAGES = [
  {
    step: '01',
    key: 'pending_payment',
    label: 'PENDING PAYMENT',
    sublabel: 'Reservation submitted by client',
    desc: 'Waiting for cash payment verification at resort entrance counter.',
  },
  {
    step: '02',
    key: 'paid',
    label: 'PAID',
    sublabel: 'Staff confirmed payment',
    desc: 'Payment recorded and official receipt issued.',
  },
  {
    step: '03',
    key: 'using_services',
    label: 'USING SERVICES',
    sublabel: 'Currently using reserved resort services',
    desc: 'Client checked in and actively enjoying cottages, pool & amenities.',
  },
  {
    step: '04',
    key: 'completed',
    label: 'COMPLETED',
    sublabel: 'Stay & services finished',
    desc: 'Client stay completed. Thank you for visiting EcoTourVista!',
  },
];

export const getStageIndex = (statusStr) => {
  const s = (statusStr || '').toLowerCase().trim();
  
  // 0. If it is cancelled / voided / void / rejected, it is not in active 0..3 progression
  if (s.includes('cancel') || s.includes('void') || s.includes('reject')) {
    return -1;
  }
  
  // 1. If it contains pending / waiting / unpaid, it is ALWAYS Stage 0 (Pending Payment)
  if (s.includes('pending') || s.includes('waiting') || s.includes('unpaid')) {
    return 0;
  }
  
  // 2. If it is completed / finished / checked-out, it is Stage 3 (Completed)
  if (s.includes('completed') || s.includes('finished') || s.includes('checked-out') || s.includes('checked out') || s.includes('done') || s.includes('vacated')) {
    return 3;
  }
  
  // 3. If it is actively using services / checked in / ongoing, it is Stage 2 (Using Services)
  if (s.includes('using') || s.includes('active') || s.includes('checked-in') || s.includes('checked in') || s.includes('check-in') || s.includes('check in') || s.includes('ongoing') || s.includes('in-service')) {
    return 2;
  }
  
  // 4. If it is paid / approved / confirmed / verified, it is Stage 1 (Paid)
  if (s.includes('paid') || s.includes('approved') || s.includes('confirmed') || s.includes('verified') || s.includes('settled')) {
    return 1;
  }
  
  // Default to Stage 0
  return 0;
};

export default function VerticalReservationTimeline({
  currentStatus = 'Pending Payment',
  reservation = null,
  onActionClick = null,
  userRole = 'client', // 'client' | 'staff' | 'admin'
  compact = false,
}) {
  const activeStageIdx = getStageIndex(currentStatus);
  const isVoidedOrCancelled = activeStageIdx === -1 || (currentStatus || '').toLowerCase().includes('cancel') || (currentStatus || '').toLowerCase().includes('void');

  if (isVoidedOrCancelled) {
    return (
      <div className={`etv-vertical-timeline-container ${compact ? 'compact' : ''}`}>
        {/* HEADER BADGE */}
        <div className="etv-timeline-header">
          <div className="flex items-center gap-2">
            <span className="etv-timeline-tag" style={{ background: '#4c0519', color: '#fda4af', borderColor: '#9f1239' }}>RESERVATION VOIDED</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <span className="text-[11px] font-mono font-bold text-rose-400">
            Status: Voided / Cancelled ✕
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs space-y-2 mt-3">
          <div className="flex items-center gap-2 font-bold text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>This reservation has been voided & cancelled</span>
          </div>
          <p className="text-[11px] text-rose-200/80">
            This reservation is officially marked as Voided/Cancelled in the database. No further stage progression or payment collection is permitted. All reserved amenities and capacities have been released.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`etv-vertical-timeline-container ${compact ? 'compact' : ''}`}>
      {/* HEADER BADGE */}
      <div className="etv-timeline-header">
        <div className="flex items-center gap-2">
          <span className="etv-timeline-tag">REAL-TIME STATUS TRACKER</span>
          <span className="etv-timeline-live-dot" />
        </div>
        <span className="text-[11px] font-mono font-bold text-emerald-400">
          Stage {activeStageIdx + 1} of 4: {TIMELINE_STAGES[activeStageIdx].label}
        </span>
      </div>

      {/* VERTICAL TIMELINE LIST */}
      <div className="etv-vertical-timeline">
        {TIMELINE_STAGES.map((stage, idx) => {
          const isDone = idx < activeStageIdx;
          const isCurrent = idx === activeStageIdx;
          const isFuture = idx > activeStageIdx;

          return (
            <div
              key={stage.key}
              className={`etv-timeline-node ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''} ${isFuture ? 'future' : ''}`}
            >
              {/* VERTICAL CONNECTING LINE */}
              {idx < TIMELINE_STAGES.length - 1 && (
                <div className={`etv-timeline-line ${idx < activeStageIdx ? 'filled' : ''}`} />
              )}

              {/* NODE CIRCLE */}
              <div className="etv-timeline-circle-wrapper">
                <div className="etv-timeline-circle">
                  {isDone ? (
                    <Check className="w-4 h-4 text-emerald-950 stroke-[3]" />
                  ) : isCurrent ? (
                    <span className="font-mono font-black text-xs text-white">{stage.step}</span>
                  ) : (
                    <span className="font-mono font-bold text-[11px] text-slate-500">{stage.step}</span>
                  )}
                </div>
                {isCurrent && <span className="etv-timeline-pulse" />}
              </div>

              {/* STAGE CONTENT */}
              <div className="etv-timeline-content">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <strong className="etv-timeline-stage-title font-mono">{stage.step} — {stage.label}</strong>
                    {isDone && (
                      <span className="etv-badge-done">
                        <Check className="w-3 h-3 inline mr-0.5" /> Done
                      </span>
                    )}
                    {isCurrent && (
                      <span className="etv-badge-current animate-pulse">
                        <Sparkles className="w-3 h-3 inline mr-0.5" /> Active Now
                      </span>
                    )}
                  </div>

                  {/* Contextual Timestamp / Tag */}
                  {isCurrent && reservation && (
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-700/60 shrink-0">
                      {reservation.arrivalTime || reservation.timeSlot || '09:00 AM'}
                    </span>
                  )}
                </div>

                <p className="etv-timeline-sublabel">{stage.sublabel}</p>
                <p className="etv-timeline-desc">
                  {idx === 1 && isDone && reservation?.grandTotal
                    ? `Payment confirmed: ₱${parseFloat(reservation.grandTotal || reservation.totalPrice || 0).toLocaleString()}.00`
                    : stage.desc}
                </p>

                {/* INTERACTIVE ACTIONS (Staff & Client only — Admin is strictly View-Only Monitoring) */}
                {isCurrent && onActionClick && userRole !== 'admin' && (
                  <div className="mt-3 pt-2 border-t border-emerald-500/20 flex items-center gap-2">
                    {/* Stage 01: Confirm Payment (Staff only) */}
                    {idx === 0 && userRole === 'staff' && (
                      <button
                        onClick={() => onActionClick('confirm_payment', reservation)}
                        className="etv-timeline-action-btn pay"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Payment & Issue Receipt
                      </button>
                    )}

                    {/* Stage 02: Start Service / Check-In (Client and Staff only) */}
                    {idx === 1 && (userRole === 'client' || userRole === 'staff') && (
                      <button
                        onClick={() => onActionClick('start_service', reservation)}
                        className="etv-timeline-action-btn start"
                        title="Begin using your reserved cottage, swimming area, and services"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> {userRole === 'client' ? 'Start Service / Check In Now 🌿' : 'Start Service / Check-In Guest'}
                      </button>
                    )}

                    {/* Stage 03: Mark Completed Stay (Client and Staff only) */}
                    {idx === 2 && (userRole === 'client' || userRole === 'staff') && (
                      <button
                        onClick={() => onActionClick('mark_completed', reservation)}
                        className="etv-timeline-action-btn complete"
                      >
                        <Check className="w-3.5 h-3.5" /> {userRole === 'client' ? 'Finish My Stay' : 'Mark as Completed Stay'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* COMPLETED CELEBRATORY BANNER (If stage is completed) */}
      {activeStageIdx === 3 && (
        <div className="etv-timeline-completed-banner">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0">
              🌿
            </span>
            <div>
              <strong className="text-xs text-white block font-bold">Your stay has been completed!</strong>
              <p className="text-[11px] text-emerald-200/80">
                Thank you for visiting EcoTourVista. We look forward to welcoming you back!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
