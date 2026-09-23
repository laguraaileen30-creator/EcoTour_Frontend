import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Package, Calendar, Ticket, Sparkles, User, ClipboardCheck, Check, ChevronLeft, ChevronRight, Plus, Minus, RefreshCw, AlertTriangle, Infinity as InfinityIcon } from 'lucide-react';
import { useEcoTour } from '../context/EcoTourContext';
import { getPhilippineDateStr } from '../utils/phTime';
import { API_BASE, resolveImage, isBookable, peso, unitLabel, statusMessage } from '../utils/catalog';
import StatusBadge from './StatusBadge';

const STEPS = [
  { key: 'package', label: 'Package', icon: Package },
  { key: 'date', label: 'Date', icon: Calendar },
  { key: 'tickets', label: 'Tickets', icon: Ticket, optional: true },
  { key: 'addons', label: 'Add-ons', icon: Sparkles, optional: true },
  { key: 'details', label: 'Details', icon: User },
  { key: 'review', label: 'Review', icon: ClipboardCheck },
];

const TICKETS = [
  { key: 'adults', label: 'Adult' },
  { key: 'children', label: 'Child' },
  { key: 'students', label: 'Student' },
  { key: 'seniors', label: 'Senior / PWD' },
];

const NO_PACKAGE = 'none';

// Package-first booking: Package → Date → Tickets (optional) → Add-ons (optional) → Details → Review → Checkout.
// Prices, availability and the final total always come from the server.
export default function BookingWizard({ preselectedPackageId = null, preselectedServiceId = null, contact = {}, userId = null, onSubmitted }) {
  const { showAlert, theme, createResortBooking } = useEcoTour();
  const isLight = theme === 'light';
  const today = getPhilippineDateStr();

  const [step, setStep] = useState(preselectedPackageId ? 1 : 0);
  const [bookingDate, setBookingDate] = useState(today);
  const [packageId, setPackageId] = useState(preselectedPackageId ? String(preselectedPackageId) : (preselectedServiceId ? NO_PACKAGE : ''));
  const [tickets, setTickets] = useState({ adults: 0, children: 0, students: 0, seniors: 0 });
  const [addons, setAddons] = useState(preselectedServiceId ? { [preselectedServiceId]: 1 } : {});
  const [fullName, setFullName] = useState(contact.name || '');
  const [email, setEmail] = useState(contact.email || '');
  const [phone, setPhone] = useState(contact.phone || '');
  const [arrivalTime, setArrivalTime] = useState('09:00 AM');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Arrival');

  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [pricing, setPricing] = useState({ tickets: { adults: 100, children: 40, students: 70, seniors: 80 }, environmentalFeePerHead: 30 });
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [suggestedDate, setSuggestedDate] = useState(null);
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);

  // Live catalog for the selected date
  useEffect(() => {
    let alive = true;
    setLoadingCatalog(true);
    (async () => {
      try {
        const [pk, sv] = await Promise.all([
          fetch(`${API_BASE}/packages?date=${bookingDate}`).then((r) => r.json()),
          fetch(`${API_BASE}/services?date=${bookingDate}`).then((r) => r.json()),
        ]);
        if (!alive) return;
        if (pk.success) setPackages(pk.data);
        if (sv.success) setServices(sv.services.filter((s) => String(s.category).toLowerCase() !== 'entrance'));
      } catch (e) {
        if (alive) showAlert({ title: 'Server Offline', message: 'Could not load live packages and availability. Please try again shortly.', type: 'danger' });
      } finally {
        if (alive) setLoadingCatalog(false);
      }
    })();
    return () => { alive = false; };
  }, [bookingDate]);

  useEffect(() => {
    fetch(`${API_BASE}/reservations/pricing`).then((r) => r.json()).then((d) => d.success && setPricing(d.data)).catch(() => {});
  }, []);

  const selectedPackage = packages.find((p) => String(p.id) === String(packageId)) || null;
  const includedQty = (serviceId) => selectedPackage?.items?.find((i) => String(i.service_id) === String(serviceId))?.quantity || 0;
  const ticketCount = Object.values(tickets).reduce((a, b) => a + b, 0);
  const addonList = useMemo(() => Object.entries(addons).filter(([, q]) => q > 0).map(([serviceId, quantity]) => ({ serviceId, quantity })), [addons]);

  // When the date changes: package unavailable → popup + next available date; drop add-ons that became unavailable
  const lastWarned = useRef('');
  useEffect(() => {
    if (loadingCatalog) return;
    if (selectedPackage && !isBookable(selectedPackage.availability_status)) {
      const key = `${selectedPackage.id}-${bookingDate}`;
      if (lastWarned.current !== key) {
        lastWarned.current = key;
        const reasons = (selectedPackage.unavailable_services || []).map((u) => `${u.serviceName} — ${u.status.replace('_', ' ')}`).join('\n');
        showAlert({
          title: 'Package Unavailable',
          message: `${selectedPackage.package_name} cannot be booked for ${bookingDate} because one or more included services are unavailable.`,
          details: reasons ? `Reason:\n${reasons}` : undefined,
          type: 'warning',
        });
        findNextDate(selectedPackage.id);
      }
    } else {
      setSuggestedDate(null);
    }
    const dropped = [];
    setAddons((prev) => {
      const next = { ...prev };
      Object.entries(prev).forEach(([id, qty]) => {
        const s = services.find((x) => String(x.service_id) === String(id));
        if (!s) return;
        if (!isBookable(s.availability_status) || s.available_for_date <= 0) { delete next[id]; dropped.push(s.service_name); }
        else if (qty > s.available_for_date) next[id] = s.available_for_date;
      });
      return next;
    });
    if (dropped.length) {
      showAlert({ title: 'Service Fully Booked', message: `Removed for ${bookingDate}: ${dropped.join(', ')}.`, details: 'Please select another service or another date.', type: 'warning' });
    }
  }, [loadingCatalog, bookingDate, packageId]);

  const findNextDate = async (pkgId) => {
    try {
      const res = await fetch(`${API_BASE}/availability/calendar?packageId=${pkgId}&from=${bookingDate}&days=30`).then((r) => r.json());
      const next = res.success ? res.data.find((d) => d.date !== bookingDate && isBookable(d.status)) : null;
      setSuggestedDate(next ? next.date : null);
    } catch (e) { setSuggestedDate(null); }
  };

  // Server quote for the review step
  useEffect(() => {
    if (STEPS[step].key !== 'review') return undefined;
    let alive = true;
    setQuoting(true);
    fetch(`${API_BASE}/reservations/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingDate, packageId: packageId && packageId !== NO_PACKAGE ? packageId : null, tickets, addons: addonList }),
    })
      .then((r) => r.json())
      .then((d) => alive && setQuote(d.success ? d.data : { error: d.message }))
      .catch(() => alive && setQuote({ error: 'Could not reach the server.' }))
      .finally(() => alive && setQuoting(false));
    return () => { alive = false; };
  }, [step, bookingDate, packageId, JSON.stringify(tickets), JSON.stringify(addonList)]);

  const setAddonQty = (svc, delta) => {
    if (!isBookable(svc.availability_status)) {
      showAlert({ title: 'Service Unavailable', message: statusMessage(svc.availability_status, svc.service_name, bookingDate), type: 'warning' });
      return;
    }
    setAddons((prev) => {
      const next = Math.max(0, Math.min(svc.available_for_date, (prev[svc.service_id] || 0) + delta));
      if (delta > 0 && (prev[svc.service_id] || 0) >= svc.available_for_date) {
        showAlert({ title: 'Limit Reached', message: `Only ${svc.available_for_date} × ${svc.service_name} available for ${bookingDate}.`, type: 'info' });
      }
      const copy = { ...prev };
      if (next === 0) delete copy[svc.service_id]; else copy[svc.service_id] = next;
      return copy;
    });
  };

  const canContinue = () => {
    const key = STEPS[step].key;
    if (key === 'package') return !!packageId && (packageId === NO_PACKAGE || !!selectedPackage);
    if (key === 'date') return bookingDate >= today && (!selectedPackage || isBookable(selectedPackage.availability_status)) && !loadingCatalog;
    if (key === 'addons' && packageId === NO_PACKAGE) return ticketCount > 0 || addonList.length > 0;
    if (key === 'details') return fullName.trim() && /\S+@\S+\.\S+/.test(email.trim());
    return true;
  };

  const next = () => {
    const key = STEPS[step].key;
    if (!canContinue()) {
      if (key === 'package') return showAlert({ title: 'Select a Package', message: 'Choose a package to continue (or "No package — tickets & services only").', type: 'info' });
      if (key === 'date' && bookingDate < today) return showAlert({ title: 'Invalid Date', message: 'Please choose today or a future date.', type: 'warning' });
      if (key === 'date') return showAlert({ title: 'Package Unavailable', message: `${selectedPackage?.package_name} is not available on ${bookingDate}. Please choose another date.`, type: 'warning' });
      if (key === 'addons') return showAlert({ title: 'Nothing Selected', message: 'Without a package, please add at least one ticket or service.', type: 'info' });
      if (key === 'details') return showAlert({ title: 'Details Required', message: 'Please enter your full name and a valid email address.', type: 'warning' });
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const handleCheckout = async () => {
    if (submitLock.current || !quote || quote.error) return;
    if (quote.availability?.unavailable?.length) {
      return showAlert({ title: 'Reservation Unavailable', message: quote.availability.message, details: 'Please select another service or date.', type: 'warning' });
    }
    submitLock.current = true;
    setSubmitting(true);
    const bookingRef = `REF-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      const body = {
        bookingRef,
        userId,
        fullName: fullName.trim(),
        clientName: fullName.trim(),
        email: email.trim(),
        clientEmail: email.trim(),
        contactNumber: phone,
        bookingDate,
        reservationDate: bookingDate,
        arrivalTime,
        paymentMethod,
        status: 'Pending',
        packageId: packageId && packageId !== NO_PACKAGE ? packageId : null,
        packageName: selectedPackage?.package_name,
        serviceName: selectedPackage?.package_name || (addonList.length ? 'Resort Services' : 'Resort Entrance'),
        tickets,
        addons: addonList,
        totalPrice: quote.total,
      };
      const res = await fetch(`${API_BASE}/reservations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await res.json();
      if (!res.ok || !result.success) {
        if (result.code === 'FULLY_BOOKED') {
          await showAlert({
            title: 'Reservation Unavailable',
            message: 'Sorry, this was just fully booked by another reservation.',
            details: `${result.message}\nPlease select another service or date.`,
            type: 'warning',
          });
          setStep(1);
          return;
        }
        throw new Error(result.message || 'Reservation could not be submitted');
      }
      const saved = createResortBooking ? createResortBooking({ ...result.data, items: result.data.items }, { skipServerSync: true }) : result.data;
      onSubmitted && onSubmitted({ ...saved, ...result.data });
    } catch (err) {
      showAlert({ title: 'Reservation Error', message: err.message || 'Please try again.', type: 'danger' });
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  const card = { background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.3)', border: '1px solid var(--line)' };
  const stepKey = STEPS[step].key;

  const Stepper = ({ value, onDec, onInc, disabledInc }) => (
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={onDec} disabled={value <= 0} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer disabled:opacity-30" style={{ border: '1px solid var(--line)' }}><Minus className="w-3.5 h-3.5" /></button>
      <span className="font-mono font-extrabold text-sm w-6 text-center">{value}</span>
      <button type="button" onClick={onInc} disabled={disabledInc} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer text-white disabled:opacity-30" style={{ background: '#16a34a' }}><Plus className="w-3.5 h-3.5" /></button>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* PROGRESS */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          const done = i < step;
          return (
            <button key={s.key} type="button" onClick={() => i < step && setStep(i)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer"
              style={{ background: active ? 'var(--accent)' : done ? 'rgba(74,222,128,0.12)' : 'transparent', color: active ? '#04170e' : done ? 'var(--accent)' : 'var(--muted)', border: '1px solid var(--line)' }}>
              {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              <span>{i + 1}. {s.label}{s.optional ? ' (optional)' : ''}</span>
            </button>
          );
        })}
      </div>

      {/* STEP 1 — PACKAGE */}
      {stepKey === 'package' && (
        <div className="space-y-3">
          <h4 className="font-extrabold text-base">Choose Your Package</h4>
          {loadingCatalog && packages.length === 0 ? (
            <p className="text-xs py-6 text-center" style={{ color: 'var(--muted)' }}><RefreshCw className="w-4 h-4 animate-spin inline mr-1" /> Loading packages…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[52vh] overflow-y-auto pr-1">
              {packages.map((p) => {
                const selected = String(packageId) === String(p.id);
                const unlimited = p.package_type === 'UNLIMITED';
                return (
                  <button key={p.id} type="button" onClick={() => setPackageId(String(p.id))} className="text-left rounded-2xl overflow-hidden transition-all cursor-pointer"
                    style={{ border: `2px solid ${selected ? 'var(--accent)' : unlimited ? 'rgba(251,191,36,0.6)' : 'var(--line)'}`, background: selected ? 'rgba(74,222,128,0.08)' : card.background }}>
                    <div className="relative h-28">
                      <img src={resolveImage(p.image_url, 'family gateway deal.png')} alt={p.package_name} className="w-full h-full object-cover" />
                      {p.badge && <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black text-white" style={{ background: unlimited ? '#d97706' : '#e11d48' }}>{p.badge}</span>}
                      {selected && <span className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)', color: '#04170e' }}><Check className="w-4 h-4" /></span>}
                    </div>
                    <div className="p-3 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <strong className="text-sm leading-tight flex items-center gap-1">{unlimited && <InfinityIcon className="w-4 h-4 text-amber-400" />}{p.package_name}</strong>
                        <StatusBadge status={p.availability_status} size="xs" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono font-black text-base" style={{ color: 'var(--accent)' }}>{peso(p.final_price)}</span>
                        {p.discount_amount > 0 && <span className="font-mono text-[11px] line-through" style={{ color: 'var(--muted)' }}>{peso(p.regular_value)}</span>}
                      </div>
                      <p className="text-[11px] line-clamp-2" style={{ color: 'var(--muted)' }}>{p.description}</p>
                      <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{unlimited ? 'Includes ALL services' : `${p.items.length} services`} • up to {p.included_guests} guests</p>
                    </div>
                  </button>
                );
              })}
              <button type="button" onClick={() => setPackageId(NO_PACKAGE)} className="text-left rounded-2xl p-4 cursor-pointer" style={{ border: `2px dashed ${packageId === NO_PACKAGE ? 'var(--accent)' : 'var(--line)'}` }}>
                <strong className="text-sm block">No package — tickets &amp; services only</strong>
                <span className="text-[11px]" style={{ color: 'var(--muted)' }}>Pick entrance tickets and individual services instead.</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2 — DATE */}
      {stepKey === 'date' && (
        <div className="space-y-3">
          <h4 className="font-extrabold text-base">Select Your Visit Date</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs font-bold space-y-1">
              <span>Target Visit Date</span>
              <input type="date" min={today} value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full rounded-xl px-3 py-2.5 font-mono outline-none" style={{ background: isLight ? '#fff' : 'rgba(0,0,0,0.4)', border: '1px solid var(--line)', color: 'var(--text)' }} />
            </label>
            <label className="text-xs font-bold space-y-1">
              <span>Arrival Time</span>
              <select value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} className="w-full rounded-xl px-3 py-2.5 outline-none" style={{ background: isLight ? '#fff' : 'rgba(0,0,0,0.4)', border: '1px solid var(--line)', color: 'var(--text)' }}>
                {['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
          </div>

          {selectedPackage && (
            <div className="p-4 rounded-2xl space-y-2" style={card}>
              <div className="flex justify-between items-center flex-wrap gap-2">
                <strong className="text-sm">{selectedPackage.package_name} — {bookingDate}</strong>
                {loadingCatalog ? <span className="text-[11px]" style={{ color: 'var(--muted)' }}>Checking…</span> : <StatusBadge status={selectedPackage.availability_status} />}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                {selectedPackage.items.map((it) => {
                  const svc = services.find((s) => s.service_id === it.service_id);
                  const blocked = (selectedPackage.unavailable_services || []).some((u) => u.serviceId === it.service_id);
                  return (
                    <div key={it.service_id} className="flex items-center justify-between gap-2">
                      <span>{blocked ? '✕' : '✓'} {it.service_name} ×{it.quantity}</span>
                      <StatusBadge status={blocked ? ((selectedPackage.unavailable_services.find((u) => u.serviceId === it.service_id) || {}).status || 'FULLY_BOOKED') : (svc?.availability_status || 'AVAILABLE')} size="xs" />
                    </div>
                  );
                })}
              </div>
              {!isBookable(selectedPackage.availability_status) && !loadingCatalog && (
                <div className="p-3 rounded-xl text-xs space-y-1.5" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)' }}>
                  <strong className="flex items-center gap-1 text-rose-400"><AlertTriangle className="w-4 h-4" /> PACKAGE UNAVAILABLE for {bookingDate}</strong>
                  {suggestedDate ? (
                    <button type="button" onClick={() => setBookingDate(suggestedDate)} className="px-3 py-1.5 rounded-lg font-bold cursor-pointer text-white" style={{ background: '#16a34a' }}>Use next available date: {suggestedDate}</button>
                  ) : <span style={{ color: 'var(--muted)' }}>Please pick another date.</span>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP 3 — TICKETS (OPTIONAL) */}
      {stepKey === 'tickets' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-extrabold text-base">Entrance Tickets <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>— Optional</span></h4>
            <button type="button" onClick={() => { setTickets({ adults: 0, children: 0, students: 0, seniors: 0 }); setStep(step + 1); }} className="text-xs font-bold underline cursor-pointer" style={{ color: 'var(--muted)' }}>Skip</button>
          </div>
          {selectedPackage && <p className="text-xs" style={{ color: 'var(--muted)' }}>Your package already covers up to {selectedPackage.included_guests} guests. Add tickets only for extra guests.</p>}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TICKETS.map((t) => (
              <div key={t.key} className="p-3 rounded-2xl text-center space-y-1.5" style={card}>
                <strong className="text-xs block">{t.label}</strong>
                <span className="text-[11px] font-mono block" style={{ color: 'var(--accent)' }}>{peso(pricing.tickets[t.key])}</span>
                <div className="flex justify-center"><Stepper value={tickets[t.key]} onDec={() => setTickets((p) => ({ ...p, [t.key]: Math.max(0, p[t.key] - 1) }))} onInc={() => setTickets((p) => ({ ...p, [t.key]: p[t.key] + 1 }))} /></div>
              </div>
            ))}
          </div>
          <p className="text-[11px]" style={{ color: 'var(--muted)' }}>{ticketCount === 0 ? 'No tickets selected.' : `${ticketCount} ticket(s) + ${peso(pricing.environmentalFeePerHead)}/head Barangay Environmental Fee.`}</p>
        </div>
      )}

      {/* STEP 4 — ADD-ONS (OPTIONAL) */}
      {stepKey === 'addons' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-extrabold text-base">Optional Add-ons <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>— {bookingDate}</span></h4>
            {packageId !== NO_PACKAGE && <button type="button" onClick={() => { setAddons({}); setStep(step + 1); }} className="text-xs font-bold underline cursor-pointer" style={{ color: 'var(--muted)' }}>Skip</button>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto pr-1">
            {services.map((s) => {
              const qty = addons[s.service_id] || 0;
              const inc = includedQty(s.service_id);
              const bookable = isBookable(s.availability_status) && s.available_for_date > 0;
              return (
                <div key={s.service_id} className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ ...card, borderColor: qty > 0 ? 'var(--accent)' : 'var(--line)', opacity: bookable ? 1 : 0.55 }}>
                  <img src={resolveImage(s.image_url)} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate">{inc > 0 && qty > 0 ? 'Extra ' : ''}{s.service_name}</div>
                    <div className="text-[10px] font-mono" style={{ color: 'var(--accent)' }}>{peso(s.price)} {unitLabel(s.unit)}</div>
                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                      <StatusBadge status={s.availability_status} size="xs" suffix={bookable ? `${s.available_for_date} left` : null} />
                      {inc > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>INCLUDED IN PACKAGE ×{inc}</span>}
                    </div>
                  </div>
                  {bookable ? (
                    <Stepper value={qty} onDec={() => setAddonQty(s, -1)} onInc={() => setAddonQty(s, 1)} disabledInc={qty >= s.available_for_date} />
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ border: '1px solid var(--line)', color: 'var(--muted)' }}>Unavailable</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[11px]" style={{ color: 'var(--muted)' }}>{addonList.length === 0 ? 'No add-ons selected.' : `${addonList.length} add-on(s) selected. Items marked "Included" are already in your package — quantities you add here are extra.`}</p>
        </div>
      )}

      {/* STEP 5 — DETAILS */}
      {stepKey === 'details' && (
        <div className="space-y-3">
          <h4 className="font-extrabold text-base">Your Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['Full Name *', fullName, (v) => setFullName(v.replace(/[^a-zA-Z\s'.-]/g, '')), 'text', 'Juan Dela Cruz'],
              ['Email Address *', email, (v) => setEmail(v.toLowerCase()), 'email', 'you@example.com'],
              ['Contact Number', phone, (v) => setPhone(v.replace(/[^\d+]/g, '')), 'tel', '09171234567'],
            ].map(([label, value, set, type, ph]) => (
              <label key={label} className="text-xs font-bold space-y-1">
                <span>{label}</span>
                <input type={type} value={value} placeholder={ph} onChange={(e) => set(e.target.value)} className="w-full rounded-xl px-3 py-2.5 outline-none" style={{ background: isLight ? '#fff' : 'rgba(0,0,0,0.4)', border: '1px solid var(--line)', color: 'var(--text)' }} />
              </label>
            ))}
            <label className="text-xs font-bold space-y-1">
              <span>Payment Method</span>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full rounded-xl px-3 py-2.5 outline-none" style={{ background: isLight ? '#fff' : 'rgba(0,0,0,0.4)', border: '1px solid var(--line)', color: 'var(--text)' }}>
                <option>Cash on Arrival</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {/* STEP 6 — REVIEW & CHECKOUT */}
      {stepKey === 'review' && (
        <div className="space-y-3">
          <h4 className="font-extrabold text-base">Booking Summary</h4>
          <div className="p-4 rounded-2xl space-y-3 text-xs" style={card}>
            {quoting && <p style={{ color: 'var(--muted)' }}><RefreshCw className="w-3.5 h-3.5 animate-spin inline mr-1" /> Calculating your total on the server…</p>}
            {quote?.error && <p className="text-rose-400">{quote.error}</p>}
            {quote && !quote.error && (
              <>
                {[
                  ['PACKAGE', quote.lines.filter((l) => l.itemType === 'PACKAGE')],
                  ['ENTRANCE TICKETS', quote.lines.filter((l) => l.itemType === 'TICKET' || l.itemType === 'FEE')],
                  ['OPTIONAL ADD-ONS', quote.lines.filter((l) => l.itemType === 'ADDON')],
                ].map(([title, lines]) => (
                  <div key={title}>
                    <span className="text-[10px] font-extrabold tracking-wider" style={{ color: 'var(--accent)' }}>{title}</span>
                    {lines.length === 0 ? <div style={{ color: 'var(--muted)' }}>None</div> : lines.map((l, i) => (
                      <div key={i} className="flex justify-between"><span>{l.name}{l.quantity > 1 ? ` × ${l.quantity}` : ''}</span><strong className="font-mono">{peso(l.subtotal)}</strong></div>
                    ))}
                  </div>
                ))}
                {quote.discount > 0 && <div className="flex justify-between text-emerald-400"><span>You save{quote.appliedDeal ? ` (${quote.appliedDeal.name})` : ''}</span><span className="font-mono">-{peso(quote.discount)}</span></div>}
                <div className="flex justify-between items-center pt-2 text-base font-black" style={{ borderTop: '1px solid var(--line)' }}>
                  <span>TOTAL</span><span className="font-mono" style={{ color: 'var(--accent)' }}>{peso(quote.total)}</span>
                </div>
                {quote.reservationFee > 0 && (
                  <div className="p-3 rounded-xl space-y-1.5" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.45)' }}>
                    <div className="flex justify-between font-extrabold"><span>Reservation fee ({quote.reservationFeePct}% downpayment)</span><span className="font-mono">{peso(quote.reservationFee)}</span></div>
                    <div className="flex justify-between" style={{ color: 'var(--muted)' }}><span>Balance on arrival</span><span className="font-mono">{peso(quote.total - quote.reservationFee)}</span></div>
                    <p style={{ color: 'var(--text)' }}>
                      Pay the reservation fee in <b>cash at the resort counter</b>. The resort will email <b>{email || 'your account email'}</b> to confirm — you then have <b>24 hours</b> to continue or cancel, otherwise the booking is voided automatically.
                    </p>
                  </div>
                )}
                <div className="text-[11px] space-y-0.5" style={{ color: 'var(--muted)' }}>
                  <div>{fullName} • {email}{phone ? ` • ${phone}` : ''}</div>
                  <div>Visit: <strong>{bookingDate}</strong> at {arrivalTime} • {paymentMethod}</div>
                </div>
                {quote.availability?.unavailable?.length > 0 && (
                  <div className="p-3 rounded-xl text-rose-300" style={{ background: 'rgba(239,68,68,0.12)' }}>⚠ {quote.availability.message}</div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* NAV */}
      <div className="flex justify-between gap-3 pt-2" style={{ borderTop: '1px solid var(--line)' }}>
        <button type="button" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))} className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-30" style={{ border: '1px solid var(--line)' }}>
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        {stepKey !== 'review' ? (
          <button type="button" onClick={next} className="px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer" style={{ background: 'var(--accent)', color: '#04170e', opacity: canContinue() ? 1 : 0.5 }}>
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" onClick={handleCheckout} disabled={submitting || quoting || !quote || !!quote.error || quote.availability?.unavailable?.length > 0} className="px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-40" style={{ background: 'var(--accent)', color: '#04170e' }}>
            {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Checkout
          </button>
        )}
      </div>
    </div>
  );
}
