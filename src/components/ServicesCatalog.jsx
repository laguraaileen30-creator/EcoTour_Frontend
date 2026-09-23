import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, RefreshCw } from 'lucide-react';
import { useEcoTour } from '../context/EcoTourContext';
import { API_BASE, resolveImage, peso, unitLabel, isBookable, statusMessage } from '../utils/catalog';
import { getPhilippineDateStr } from '../utils/phTime';
import StatusBadge from './StatusBadge';
import ServiceDetailsModal from './ServiceDetailsModal';

// Database-driven service cards. compact = landing page teaser (services shown as optional add-ons);
// full = All Services page with search, category filters and a date picker for real availability.
export default function ServicesCatalog({ compact = false, onReserve }) {
  const { theme, showAlert } = useEcoTour();
  const isLight = theme === 'light';
  const [date, setDate] = useState(getPhilippineDateStr());
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`${API_BASE}/services?landing=1&date=${date}`)
      .then((r) => r.json())
      .then((d) => alive && d.success && setServices(d.services.map((s) => ({ ...s, image_url: resolveImage(s.image_url) }))))
      .catch(() => alive && setServices([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [date]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(services.map((s) => s.category)))], [services]);
  const filtered = services.filter((s) => {
    const q = query.toLowerCase();
    const matchQ = !q || [s.service_name, s.short_description, s.description, s.category].some((v) => String(v || '').toLowerCase().includes(q));
    return matchQ && (category === 'All' || s.category === category);
  });
  const shown = compact ? filtered.filter((s) => String(s.category).toLowerCase() !== 'entrance').slice(0, 8) : filtered;

  const reserve = (s) => {
    if (!isBookable(s.availability_status)) {
      showAlert({ title: s.availability_status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Service Fully Booked', message: statusMessage(s.availability_status, s.service_name, date), type: 'warning' });
      return;
    }
    onReserve && onReserve(s);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">{compact ? 'Optional Add-on Services' : 'All Services'}</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {compact ? 'Extra services you can add to a package when you book from your client account.' : 'Live availability from the resort. Pick a date to see what is open.'}
          </p>
        </div>
        {compact ? (
          <Link to="/services" className="text-sm font-bold underline" style={{ color: 'var(--accent)' }}>View all services →</Link>
        ) : (
          <label className="flex items-center gap-2 text-xs font-bold">
            <Calendar className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <input type="date" min={getPhilippineDateStr()} value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl px-3 py-2 font-mono outline-none" style={{ background: isLight ? '#fff' : 'rgba(0,0,0,0.4)', border: '1px solid var(--line)', color: 'var(--text)' }} />
          </label>
        )}
      </div>

      {!compact && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search services…" className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none" style={{ background: isLight ? '#fff' : 'rgba(0,0,0,0.4)', border: '1px solid var(--line)', color: 'var(--text)' }} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer" style={{ background: category === c ? 'var(--accent)' : 'transparent', color: category === c ? '#04170e' : 'var(--muted)', border: '1px solid var(--line)' }}>{c}</button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-sm" style={{ color: 'var(--muted)' }}><RefreshCw className="w-4 h-4 animate-spin inline mr-1" /> Loading services…</div>
      ) : shown.length === 0 ? (
        <div className="py-10 text-center text-sm" style={{ color: 'var(--muted)' }}>No services found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {shown.map((s) => (
            <div key={s.service_id} className="rounded-2xl overflow-hidden flex flex-col border" style={{ background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.04)', borderColor: s.is_featured ? 'rgba(74,222,128,0.5)' : 'var(--line)' }}>
              <div className="h-36 relative">
                <img src={s.image_url} alt={s.service_name} className="w-full h-full object-cover" style={{ filter: isBookable(s.availability_status) ? 'none' : 'grayscale(0.7)' }} />
                <div className="absolute top-2 left-2"><StatusBadge status={s.availability_status} size="xs" /></div>
                {s.is_featured && <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black text-white bg-emerald-600">FEATURED</span>}
              </div>
              <div className="p-4 flex flex-col flex-1 gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>{s.category}</span>
                <strong className="text-sm leading-tight">{s.service_name}</strong>
                <p className="text-xs line-clamp-2" style={{ color: 'var(--muted)' }}>{s.short_description || s.description}</p>
                <div className="text-sm font-mono font-black mt-auto" style={{ color: 'var(--accent)' }}>{peso(s.price)} <span className="text-[10px] font-normal" style={{ color: 'var(--muted)' }}>{unitLabel(s.unit)}</span></div>
                <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                  {s.capacity_persons ? `Capacity: ${s.capacity_persons} persons • ` : ''}{s.available_for_date}/{s.capacity_for_date} available {compact ? 'today' : `on ${date}`}
                </div>
                <div className={`grid ${onReserve ? 'grid-cols-2' : 'grid-cols-1'} gap-2 pt-1`}>
                  <button type="button" onClick={() => setDetails(s)} className="py-2 rounded-xl text-[11px] font-bold cursor-pointer" style={{ border: '1px solid var(--line)' }}>View Details</button>
                  {onReserve && <button type="button" onClick={() => reserve(s)} disabled={!isBookable(s.availability_status)} className="py-2 rounded-xl text-[11px] font-extrabold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: 'var(--accent)', color: '#04170e' }}>
                    {isBookable(s.availability_status) ? 'Reserve' : 'Unavailable'}
                  </button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ServiceDetailsModal isOpen={!!details} service={details} onClose={() => setDetails(null)} onBookNow={onReserve ? (s) => reserve(s) : undefined} />
    </div>
  );
}
