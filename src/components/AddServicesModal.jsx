import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Plus, Minus, Coins, RefreshCw, Printer, Ticket, Sparkles, CheckCircle2 } from 'lucide-react';
import { useEcoTour } from '../context/EcoTourContext';
import { API_BASE, resolveImage, isBookable, peso, unitLabel } from '../utils/catalog';
import StatusBadge from './StatusBadge';

const TICKETS = [
  { key: 'adults', label: 'Adult' },
  { key: 'children', label: 'Child' },
  { key: 'students', label: 'Student' },
  { key: 'seniors', label: 'Senior / PWD' },
];

// Staff: add services (and optional extra tickets) to a PAID / IN-SERVICE booking.
// What the client already paid is never charged again — the server prices and charges only the new items.
export default function AddServicesModal({ booking, onClose, onDone }) {
  const { addServicesToPaidBooking, currentUser, showAlert, theme, catalogPackages } = useEcoTour();
  const isLight = theme === 'light';
  const bookingDate = booking.reservationDate || booking.bookingDate;
  const alreadyPaid = parseFloat(booking.estimatedTotal || booking.grandTotal || booking.totalPrice || 0);

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState({ adults: 0, children: 0, students: 0, seniors: 0 });
  const [addons, setAddons] = useState({}); // { service_id: qty }
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [cash, setCash] = useState('');
  const [saving, setSaving] = useState(false);
  const lockRef = useRef(false);
  const requestIdRef = useRef(`ADDON-${booking.bookingRef || booking.id}-${Date.now()}`);

  const pkg = (catalogPackages || []).find((p) => String(p.id) === String(booking.packageId));
  const includedQty = (serviceId) => pkg?.items?.find((i) => String(i.service_id) === String(serviceId))?.quantity || 0;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/services?date=${encodeURIComponent(bookingDate)}`);
        const data = await res.json();
        if (alive && data.success) {
          setServices(data.services.filter((s) => String(s.category).toLowerCase() !== 'entrance'));
        }
      } catch (e) {
        if (alive) showAlert({ title: 'Server Offline', message: 'Could not load live services. Please make sure the server is running.', type: 'danger' });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [bookingDate]);

  const ticketCount = Object.values(tickets).reduce((a, b) => a + b, 0);
  const addonList = useMemo(() => Object.entries(addons).filter(([, q]) => q > 0).map(([serviceId, quantity]) => ({ serviceId, quantity })), [addons]);
  const hasSelection = ticketCount > 0 || addonList.length > 0;

  // Server quote: exact amount + availability for the booking date
  useEffect(() => {
    if (!hasSelection) { setQuote(null); return undefined; }
    const t = setTimeout(async () => {
      setQuoting(true);
      try {
        const res = await fetch(`${API_BASE}/reservations/quote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingDate, tickets, addons: addonList }),
        });
        const data = await res.json();
        setQuote(data.success ? data.data : { error: data.message });
      } catch (e) {
        setQuote({ error: 'Could not reach the server.' });
      } finally {
        setQuoting(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [JSON.stringify(tickets), JSON.stringify(addonList), bookingDate]);

  const amountDue = quote && !quote.error ? quote.total : 0;
  const unavailable = quote?.availability?.unavailable || [];
  const cashNum = parseFloat(cash) || 0;
  const canPay = hasSelection && quote && !quote.error && unavailable.length === 0 && cashNum >= amountDue && !saving && !quoting;

  const setAddonQty = (svc, delta) => {
    setAddons((prev) => {
      const next = Math.max(0, Math.min(svc.available_for_date, (prev[svc.service_id] || 0) + delta));
      const copy = { ...prev };
      if (next === 0) delete copy[svc.service_id]; else copy[svc.service_id] = next;
      return copy;
    });
  };

  const handleConfirm = async (print = false) => {
    if (!canPay || lockRef.current) return;
    lockRef.current = true;
    setSaving(true);
    try {
      const newItems = quote.lines
        .filter((l) => l.itemType !== 'FEE')
        .map((l) => ({ name: l.name.replace(/^Extra /, ''), quantity: l.quantity, unitPrice: l.unitPrice, serviceId: l.serviceId }));
      const { receipt, addonAmount } = await addServicesToPaidBooking({
        booking,
        newItems,
        cashReceived: cashNum,
        staffName: currentUser?.name,
        requestId: requestIdRef.current,
      });
      if (print) window.print();
      await showAlert({
        title: 'Add-on Services Paid',
        message: `${peso(addonAmount)} collected for the added services on ${booking.bookingRef} (${receipt.receiptNo}).`,
        details: `Previously paid ${peso(alreadyPaid)} was NOT charged again. Change: ${peso(receipt.change)}. New booking total: ${peso(alreadyPaid + addonAmount)}.`,
        type: 'success',
      });
      onDone && onDone(receipt);
      onClose();
    } catch (err) {
      if (err.duplicate) {
        await showAlert({ title: 'Already Recorded', message: 'This add-on payment was already saved. The client was not charged again.', type: 'info' });
        onClose();
      } else {
        showAlert({ title: 'Add-on Payment Failed', message: err.message || 'Unknown error', details: 'Nothing was charged.', type: 'danger' });
      }
    } finally {
      lockRef.current = false;
      setSaving(false);
    }
  };

  const panel = { background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.35)', border: '1px solid var(--line)' };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="rounded-3xl w-full max-w-5xl p-5 sm:p-6 space-y-5 shadow-2xl border-2 my-auto" style={{ background: isLight ? 'var(--bg-1)' : '#071f14', borderColor: 'var(--line)', color: 'var(--text)' }}>
        <div className="flex justify-between items-start gap-3 pb-3" style={{ borderBottom: '1px solid var(--line)' }}>
          <div>
            <h3 className="text-lg font-extrabold flex items-center gap-2"><Plus className="w-5 h-5" style={{ color: 'var(--accent)' }} /> Add Services — {booking.bookingRef || booking.bookingNumber}</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              {booking.clientName || booking.fullName} • Visit date <strong className="font-mono">{bookingDate}</strong> • Already paid <strong style={{ color: 'var(--accent)' }}>{peso(alreadyPaid)}</strong> (not charged again)
            </p>
            {pkg && <p className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>Package: <strong>{pkg.package_name}</strong> — included services are marked; any extra quantity is charged as an add-on.</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer" style={{ background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)' }} aria-label="Close"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 space-y-4">
            {/* OPTIONAL EXTRA TICKETS */}
            <div className="p-4 rounded-2xl space-y-2" style={panel}>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--accent)' }}><Ticket className="w-3.5 h-3.5" /> Extra Entrance Tickets <span className="font-medium normal-case" style={{ color: 'var(--muted)' }}>(optional)</span></span>
                {ticketCount > 0 && <button type="button" className="text-[10px] underline cursor-pointer" style={{ color: 'var(--muted)' }} onClick={() => setTickets({ adults: 0, children: 0, students: 0, seniors: 0 })}>Clear</button>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TICKETS.map((t) => (
                  <div key={t.key} className="rounded-xl p-2 text-center" style={{ border: '1px solid var(--line)' }}>
                    <span className="text-[11px] font-bold block">{t.label}</span>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <button type="button" onClick={() => setTickets((p) => ({ ...p, [t.key]: Math.max(0, p[t.key] - 1) }))} className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer" style={{ border: '1px solid var(--line)' }}><Minus className="w-3 h-3" /></button>
                      <span className="font-mono font-extrabold text-sm w-5">{tickets[t.key]}</span>
                      <button type="button" onClick={() => setTickets((p) => ({ ...p, [t.key]: p[t.key] + 1 }))} className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer text-white" style={{ background: '#16a34a' }}><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ADD-ON SERVICES FOR THE BOOKING DATE */}
            <div className="p-4 rounded-2xl space-y-2" style={panel}>
              <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--accent)' }}><Sparkles className="w-3.5 h-3.5" /> Add-on Services for {bookingDate}</span>
              {loading ? (
                <div className="py-6 text-center text-xs" style={{ color: 'var(--muted)' }}><RefreshCw className="w-4 h-4 animate-spin inline mr-1" /> Loading live availability…</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[46vh] overflow-y-auto pr-1">
                  {services.map((s) => {
                    const qty = addons[s.service_id] || 0;
                    const bookable = isBookable(s.availability_status) && s.available_for_date > 0;
                    const inc = includedQty(s.service_id);
                    return (
                      <div key={s.service_id} className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ border: `1px solid ${qty > 0 ? 'var(--accent)' : 'var(--line)'}`, opacity: bookable ? 1 : 0.55 }}>
                        <img src={resolveImage(s.image_url)} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate">{s.service_name}</div>
                          <div className="text-[10px] font-mono" style={{ color: 'var(--accent)' }}>{peso(s.price)} {unitLabel(s.unit)}</div>
                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            <StatusBadge status={s.availability_status} size="xs" suffix={`${s.available_for_date} left`} />
                            {inc > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>INCLUDED ×{inc}</span>}
                          </div>
                        </div>
                        {bookable ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <button type="button" disabled={qty <= 0} onClick={() => setAddonQty(s, -1)} className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer disabled:opacity-30" style={{ border: '1px solid var(--line)' }}><Minus className="w-3 h-3" /></button>
                            <span className="font-mono font-extrabold text-xs w-4 text-center">{qty}</span>
                            <button type="button" disabled={qty >= s.available_for_date} onClick={() => setAddonQty(s, 1)} className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer text-white disabled:opacity-30" style={{ background: '#16a34a' }}><Plus className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold shrink-0" style={{ color: 'var(--muted)' }}>Unavailable</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SUMMARY & PAYMENT */}
          <div className="lg:col-span-5 space-y-3">
            <div className="p-4 rounded-2xl space-y-2 text-xs" style={panel}>
              <span className="text-[11px] font-extrabold uppercase tracking-wider block" style={{ color: 'var(--accent)' }}>New Charges (server-calculated)</span>
              {!hasSelection && <p style={{ color: 'var(--muted)' }}>No new services selected yet.</p>}
              {quoting && <p style={{ color: 'var(--muted)' }}><RefreshCw className="w-3 h-3 animate-spin inline mr-1" /> Calculating…</p>}
              {quote?.error && <p className="text-rose-400">{quote.error}</p>}
              {quote && !quote.error && quote.lines.map((l, i) => (
                <div key={i} className="flex justify-between"><span>{l.name} ×{l.quantity}</span><strong className="font-mono">{peso(l.subtotal)}</strong></div>
              ))}
              {unavailable.length > 0 && (
                <div className="p-2 rounded-lg text-rose-300" style={{ background: 'rgba(239,68,68,0.12)' }}>⚠ {quote.availability.message}</div>
              )}
              <div className="pt-2 flex justify-between text-[11px]" style={{ borderTop: '1px solid var(--line)', color: 'var(--muted)' }}><span>Already paid (not re-charged)</span><span className="font-mono">{peso(alreadyPaid)}</span></div>
              <div className="flex justify-between items-center text-sm font-black"><span>AMOUNT DUE NOW</span><span className="font-mono text-lg" style={{ color: 'var(--accent)' }}>{peso(amountDue)}</span></div>
            </div>

            <div className="p-4 rounded-2xl space-y-2" style={panel}>
              <label className="text-xs font-bold block">Cash Received (₱)</label>
              <input type="number" min="0" value={cash} onChange={(e) => setCash(e.target.value)} placeholder={amountDue ? String(amountDue) : '0'} className="w-full rounded-xl px-3 py-2.5 font-mono font-bold text-base outline-none" style={{ background: isLight ? '#fff' : 'rgba(0,0,0,0.5)', border: '2px solid var(--line)', color: 'var(--text)' }} />
              <div className="flex gap-1.5">
                {[amountDue, Math.ceil(amountDue / 500) * 500, Math.ceil(amountDue / 1000) * 1000].filter((v, i, a) => v > 0 && a.indexOf(v) === i).map((v) => (
                  <button key={v} type="button" onClick={() => setCash(String(v))} className="flex-1 py-1 rounded-lg text-[11px] font-mono font-bold cursor-pointer" style={{ border: '1px solid var(--line)', color: 'var(--accent)' }}>{peso(v)}</button>
                ))}
              </div>
              {amountDue > 0 && (
                <div className="flex justify-between text-xs font-bold pt-1">
                  <span>{cashNum >= amountDue ? 'Change' : 'Still needed'}</span>
                  <span className="font-mono" style={{ color: cashNum >= amountDue ? 'var(--accent)' : '#fbbf24' }}>{peso(Math.abs(cashNum - amountDue))}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" disabled={!canPay} onClick={() => handleConfirm(false)} className="py-3 rounded-xl text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: '#16a34a' }}>
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />} Collect &amp; Save
              </button>
              <button type="button" disabled={!canPay} onClick={() => handleConfirm(true)} className="py-3 rounded-xl text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: '#166534' }}>
                <Printer className="w-4 h-4" /> Collect &amp; Print
              </button>
            </div>
            <p className="text-[10px] text-center flex items-center justify-center gap-1" style={{ color: 'var(--muted)' }}><CheckCircle2 className="w-3 h-3" /> Only the new services are charged. The booking keeps its current status.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
