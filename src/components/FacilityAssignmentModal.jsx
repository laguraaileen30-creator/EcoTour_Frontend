import React, { useCallback, useEffect, useState } from 'react';
import { X, RefreshCw, MapPin, Check, Undo2 } from 'lucide-react';
import { useEcoTour } from '../context/EcoTourContext';
import { apiJson } from '../utils/catalog';

const STATE_STYLE = {
  AVAILABLE: { label: 'Available', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  RESERVED: { label: 'Reserved', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  OCCUPIED: { label: 'Occupied', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  MAINTENANCE: { label: 'Maintenance', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
};

// Staff assigns actual numbered units (Cottage 05, Videoke 02, ...) to a reservation for its visit date.
// The server blocks a unit that another reservation already holds for that date.
export default function FacilityAssignmentModal({ booking, onClose, onChanged }) {
  const { showAlert, theme } = useEcoTour();
  const isLight = theme === 'light';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyUnit, setBusyUnit] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiJson(`/availability/requirements/${encodeURIComponent(booking.id || booking.bookingRef)}`, { auth: true });
      setData(res.data);
    } catch (err) {
      showAlert({ title: 'Could not load facilities', message: err.status === 401 ? 'Your session expired. Please log in again.' : err.message, type: 'danger' });
      onClose();
    } finally {
      setLoading(false);
    }
  }, [booking.id, booking.bookingRef]);

  useEffect(() => { load(); }, [load]);

  const assign = async (unit) => {
    if (busyUnit) return;
    setBusyUnit(unit.id);
    try {
      await apiJson('/availability/assign', { method: 'POST', auth: true, body: { bookingId: data.bookingId, resourceId: unit.id } });
      await load();
      onChanged && onChanged();
    } catch (err) {
      showAlert({ title: 'Assignment Conflict', message: err.message, type: 'warning' });
      await load();
    } finally {
      setBusyUnit(null);
    }
  };

  const release = async (assignmentId) => {
    if (busyUnit) return;
    setBusyUnit(`r-${assignmentId}`);
    try {
      await apiJson(`/availability/assign/${assignmentId}`, { method: 'DELETE', auth: true });
      await load();
      onChanged && onChanged();
    } catch (err) {
      showAlert({ title: 'Could not release', message: err.message, type: 'danger' });
    } finally {
      setBusyUnit(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="rounded-3xl w-full max-w-4xl p-5 sm:p-6 space-y-4 shadow-2xl border-2 my-auto" style={{ background: isLight ? 'var(--bg-1)' : '#071f14', borderColor: 'var(--line)', color: 'var(--text)' }}>
        <div className="flex justify-between items-start gap-3 pb-3" style={{ borderBottom: '1px solid var(--line)' }}>
          <div>
            <h3 className="text-lg font-extrabold flex items-center gap-2"><MapPin className="w-5 h-5" style={{ color: 'var(--accent)' }} /> Assign Facilities — {booking.bookingRef || booking.bookingNumber}</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              {booking.clientName || booking.fullName} • {data?.date || booking.reservationDate || booking.bookingDate}
              {data && <> • Status: <strong style={{ color: 'var(--accent)' }}>{data.assignmentStatus}</strong></>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer" style={{ border: '1px solid var(--line)' }} title="Refresh"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer" style={{ background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)' }} aria-label="Close"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {loading && !data ? (
          <div className="py-10 text-center text-xs" style={{ color: 'var(--muted)' }}>Loading requirements…</div>
        ) : data && data.requirements.length === 0 ? (
          <div className="py-10 text-center text-sm" style={{ color: 'var(--muted)' }}>This reservation has no numbered facilities to assign (tickets and quantity-based items only).</div>
        ) : (
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {data?.requirements.map((req) => {
              const done = req.assigned.length >= req.required;
              return (
                <div key={req.serviceId} className="p-4 rounded-2xl space-y-3" style={{ border: '1px solid var(--line)', background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.3)' }}>
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <strong className="text-sm">{req.serviceName}</strong>
                      <span className="text-xs ml-2" style={{ color: 'var(--muted)' }}>Required ×{req.required} • Assigned {req.assigned.length}/{req.required}</span>
                    </div>
                    {done && <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}><Check className="w-3 h-3" /> Complete</span>}
                  </div>

                  {req.assigned.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {req.assigned.map((a) => (
                        <span key={a.assignmentId} className="px-2.5 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)' }}>
                          📍 {a.resourceName} <span className="text-[9px] opacity-80">{a.status}</span>
                          <button type="button" disabled={!!busyUnit} onClick={() => release(a.assignmentId)} className="cursor-pointer hover:text-white disabled:opacity-40" title="Release this unit"><Undo2 className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {req.candidates.map((u) => {
                      const st = STATE_STYLE[u.state] || STATE_STYLE.AVAILABLE;
                      const mine = String(u.bookingId) === String(data.bookingId);
                      const canAssign = u.state === 'AVAILABLE' && !done;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          disabled={!canAssign || !!busyUnit}
                          onClick={() => assign(u)}
                          className="p-2.5 rounded-xl text-left transition-all cursor-pointer disabled:cursor-not-allowed"
                          style={{ background: st.bg, border: `1px solid ${mine ? '#38bdf8' : st.color}55`, opacity: canAssign || mine ? 1 : 0.6 }}
                          title={u.state === 'AVAILABLE' ? `Assign ${u.resourceName}` : u.bookingRef ? `${st.label}: ${u.bookingRef} (${u.clientName})` : st.label}
                        >
                          <div className="text-xs font-extrabold">{u.resourceName}</div>
                          <div className="text-[10px] font-bold" style={{ color: mine ? '#38bdf8' : st.color }}>
                            {busyUnit === u.id ? 'Assigning…' : mine ? 'This booking' : st.label}
                          </div>
                          {!mine && u.bookingRef && <div className="text-[9px] truncate" style={{ color: 'var(--muted)' }}>{u.bookingRef}</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
