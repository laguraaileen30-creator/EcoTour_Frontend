import React, { useEffect, useState } from 'react';
import { X, Check, Users, ShieldCheck, Minus, Calendar, Infinity as InfinityIcon } from 'lucide-react';
import { useEcoTour } from '../context/EcoTourContext';
import { API_BASE, resolveImage, peso, unitLabel, isBookable, statusMessage } from '../utils/catalog';
import { getPhilippineDateStr } from '../utils/phTime';
import StatusBadge from './StatusBadge';

// Details for a service OR a package: gallery, inclusions / exclusions, terms, live status and available dates.
export default function ServiceDetailsModal({ isOpen, onClose, service, onBookNow }) {
  const { theme, showAlert } = useEcoTour();
  const isLight = theme === 'light';
  const [activeImage, setActiveImage] = useState(0);
  const [calendar, setCalendar] = useState([]);

  const isPackage = !!service && (!!service.package_name || service.category === 'Package');
  const packageId = isPackage ? (service.package_id || service.id) : null;
  const serviceId = !isPackage && service ? service.service_id : null;

  useEffect(() => {
    if (!isOpen || !service) return;
    setActiveImage(0);
    const from = getPhilippineDateStr();
    const q = isPackage ? `packageId=${packageId}` : `serviceId=${serviceId}`;
    fetch(`${API_BASE}/availability/calendar?${q}&from=${from}&days=14`)
      .then((r) => r.json())
      .then((d) => setCalendar(d.success ? d.data : []))
      .catch(() => setCalendar([]));
  }, [isOpen, packageId, serviceId]);

  if (!isOpen || !service) return null;

  const title = isPackage ? service.package_name || service.service_name : (service.service_name || service.name);
  const images = [service.image_url, ...(Array.isArray(service.gallery) ? service.gallery : [])].filter(Boolean).map((u) => resolveImage(u));
  const description = service.description || service.short_description || 'Enjoy this service at Duangon Cold Spring Resort.';
  const items = isPackage ? (service.items || []) : [];
  const status = service.availability_status || 'AVAILABLE';
  const price = isPackage ? (service.final_price ?? service.price) : service.price;
  const original = isPackage ? (service.regular_value ?? service.original_price) : null;
  const unlimited = service.package_type === 'UNLIMITED';

  const reserve = () => {
    if (!isBookable(status) && !isPackage) {
      showAlert({ title: 'Service Unavailable', message: statusMessage(status, title, 'today') || 'This service cannot be reserved right now.', details: 'You can still choose another date in the booking form if one is available.', type: 'warning' });
    }
    onBookNow && onBookNow(service);
    onClose();
  };

  const List = ({ title: t, values, icon }) => (values && values.length > 0 ? (
    <div>
      <h4 className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--muted)' }}>{t}</h4>
      <ul className="space-y-1">{values.map((v, i) => <li key={i} className="flex items-start gap-2 text-sm">{icon}<span>{v}</span></li>)}</ul>
    </div>
  ) : null);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="rounded-3xl max-w-xl w-full shadow-2xl relative my-8 overflow-hidden transition-all border" style={{ background: isLight ? 'var(--bg-1, #ffffff)' : '#071f14', borderColor: unlimited ? 'rgba(251,191,36,0.6)' : 'var(--line)', color: 'var(--text)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-md" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }} aria-label="Close"><X className="w-5 h-5" /></button>

        <div className="h-60 w-full relative bg-black/50">
          <img src={images[activeImage] || resolveImage(null)} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {service.badge && <span className="px-2 py-0.5 rounded-full text-[10px] font-black text-white" style={{ background: unlimited ? '#d97706' : '#e11d48' }}>{service.badge}</span>}
              <StatusBadge status={status} />
            </div>
            <h2 className="text-2xl font-black text-white drop-shadow-md flex items-center gap-2">{unlimited && <InfinityIcon className="w-6 h-6 text-amber-400" />}{title}</h2>
          </div>
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 px-5 pt-3 overflow-x-auto">
            {images.map((img, i) => (
              <button key={i} type="button" onClick={() => setActiveImage(i)} className="w-14 h-14 rounded-lg overflow-hidden shrink-0 cursor-pointer" style={{ border: `2px solid ${i === activeImage ? 'var(--accent)' : 'transparent'}` }}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-5 space-y-4 max-h-[55vh] overflow-y-auto">
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div>
              <span className="font-mono font-black text-2xl" style={{ color: 'var(--accent)' }}>{peso(price)}</span>
              <span className="text-xs ml-1" style={{ color: 'var(--muted)' }}>{isPackage ? '/ package' : unitLabel(service.unit)}</span>
              {original > price && <span className="font-mono text-xs line-through ml-2" style={{ color: 'var(--muted)' }}>{peso(original)}</span>}
            </div>
            <div className="text-xs flex items-center gap-1" style={{ color: 'var(--muted)' }}>
              <Users className="w-4 h-4" />
              {isPackage ? `Good for ${service.included_guests} guests` : service.capacity_persons ? `Capacity: ${service.capacity_persons} persons` : `${service.available_for_date ?? service.available_qty ?? '—'} available today`}
            </div>
          </div>

          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{description}</p>

          {isPackage && items.length > 0 && (
            <List title={unlimited ? 'Unlimited access — all included services' : 'Package inclusions'} values={items.map((it) => `${it.service_name || it.serviceName || it.name}${it.quantity > 1 ? ` ×${it.quantity}` : ''}`)} icon={<Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />} />
          )}
          <List title="Included" values={service.inclusions} icon={<Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />} />
          <List title="Not included" values={service.exclusions} icon={<Minus className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />} />
          {service.terms && (
            <div className="text-xs p-3 rounded-xl flex gap-2" style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)' }}>
              <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} /><span>{service.terms}</span>
            </div>
          )}
          {unlimited && (
            <p className="text-[11px]" style={{ color: 'var(--muted)' }}>“Unlimited” means every listed service is included in your stay — subject to facility availability, capacity and operating limits for your date.</p>
          )}

          {calendar.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1" style={{ color: 'var(--muted)' }}><Calendar className="w-3.5 h-3.5" /> Next 14 days</h4>
              <div className="grid grid-cols-7 gap-1">
                {calendar.map((d) => {
                  const ok = isBookable(d.status);
                  const dt = new Date(`${d.date}T00:00:00`);
                  return (
                    <div key={d.date} className="rounded-lg p-1 text-center" title={`${d.date}: ${d.status}${d.available !== undefined ? ` (${d.available} left)` : ''}${d.unavailable?.length ? ` — ${d.unavailable.join(', ')}` : ''}`}
                      style={{ background: ok ? (d.status === 'LOW_STOCK' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.12)') : 'rgba(239,68,68,0.15)' }}>
                      <div className="text-[9px]" style={{ color: 'var(--muted)' }}>{dt.toLocaleDateString('en-PH', { weekday: 'short' })}</div>
                      <div className="text-xs font-bold">{dt.getDate()}</div>
                      <div className="text-[8px] font-bold" style={{ color: ok ? (d.status === 'LOW_STOCK' ? '#f59e0b' : '#22c55e') : '#ef4444' }}>{ok ? (d.available !== undefined ? `${d.available} left` : 'Open') : 'Full'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {onBookNow && (
            <button onClick={reserve} className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest cursor-pointer transition-all hover:scale-[1.01]" style={{ background: 'var(--accent)', color: '#04170e' }}>
              {isPackage ? 'Book This Package' : 'Reserve Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
