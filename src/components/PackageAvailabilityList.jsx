import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search, Users, ChevronDown, ChevronUp, Infinity as InfinityIcon } from 'lucide-react';
import { useEcoTour } from '../context/EcoTourContext';
import { apiJson, resolveImage, peso, isBookable } from '../utils/catalog';
import { getPhilippineDateStr } from '../utils/phTime';
import StatusBadge from './StatusBadge';

// Read-only list of every package with its availability for a date:
// price, guests, validity, included services and the live stock of each included service.
export default function PackageAvailabilityList() {
  const { theme } = useEcoTour();
  const isLight = theme === 'light';
  const [date, setDate] = useState(getPhilippineDateStr());
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState({});

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [p, s] = await Promise.all([apiJson(`/packages?all=1&date=${date}`), apiJson(`/services?all=1&date=${date}`)]);
      setPackages(p.data);
      setServices(s.services);
    } catch (e) {
      setError(e.message || 'Could not load packages');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [date]);
  useEffect(() => {
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [date]);

  const serviceById = useMemo(() => new Map(services.map((s) => [s.service_id, s])), [services]);
  const statusOf = (p) => (p.status === 'Inactive' ? 'INACTIVE' : p.availability_status);
  const counts = {
    all: packages.length,
    available: packages.filter((p) => isBookable(statusOf(p))).length,
    unavailable: packages.filter((p) => !isBookable(statusOf(p))).length,
  };
  const shown = packages.filter((p) => {
    const q = query.toLowerCase();
    const matchQ = !q || [p.package_name, p.description, ...p.items.map((i) => i.service_name)].some((v) => String(v || '').toLowerCase().includes(q));
    const ok = isBookable(statusOf(p));
    return matchQ && (filter === 'all' || (filter === 'available' ? ok : !ok));
  });

  const card = { background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.3)', border: '1px solid var(--line)' };
  const input = { background: isLight ? '#fff' : 'rgba(0,0,0,0.4)', border: '1px solid var(--line)', color: 'var(--text)' };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-extrabold text-base">All Packages — {date === getPhilippineDateStr() ? 'Today' : date}</h3>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search package or service…" className="rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none w-56" style={input} />
          </div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl px-3 py-1.5 text-xs font-mono outline-none" style={input} />
          <button onClick={load} className="px-3 rounded-xl cursor-pointer" style={{ border: '1px solid var(--line)' }} title="Refresh"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {[['all', 'All'], ['available', 'Available'], ['unavailable', 'Unavailable']].map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
            style={{ background: filter === k ? 'var(--accent)' : 'transparent', color: filter === k ? '#04170e' : 'var(--muted)', border: '1px solid var(--line)' }}>
            {label} ({counts[k]})
          </button>
        ))}
      </div>

      {error && <div className="p-3 rounded-xl text-xs text-rose-400" style={{ border: '1px solid rgba(244,63,94,0.4)' }}>{error}</div>}
      {!loading && !error && shown.length === 0 && <p className="text-sm text-center py-8" style={{ color: 'var(--muted)' }}>No packages match.</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {shown.map((p) => {
          const st = statusOf(p);
          const unlimited = p.package_type === 'UNLIMITED';
          const open = !!expanded[p.id];
          const items = open ? p.items : p.items.slice(0, 6);
          const blocked = new Map((p.unavailable_services || []).map((u) => [u.serviceId, u]));
          return (
            <div key={p.id} className="rounded-2xl overflow-hidden flex flex-col" style={{ ...card, borderColor: unlimited ? 'rgba(251,191,36,0.55)' : 'var(--line)', opacity: p.status === 'Inactive' ? 0.65 : 1 }}>
              <div className="flex gap-3 p-3">
                <img src={resolveImage(p.image_url, 'family gateway deal.png')} alt="" className="w-24 h-20 rounded-xl object-cover shrink-0" />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <strong className="text-sm leading-tight flex items-center gap-1">{unlimited && <InfinityIcon className="w-4 h-4 text-amber-400 shrink-0" />}{p.package_name}</strong>
                    <StatusBadge status={st} size="xs" />
                  </div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-mono font-black" style={{ color: 'var(--accent)' }}>{peso(p.final_price)}</span>
                    {p.discount_amount > 0 && <span className="font-mono text-[11px] line-through" style={{ color: 'var(--muted)' }}>{peso(p.regular_value)}</span>}
                    {p.badge && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white" style={{ background: unlimited ? '#d97706' : '#e11d48' }}>{p.badge}</span>}
                  </div>
                  <div className="text-[11px] flex items-center gap-2 flex-wrap" style={{ color: 'var(--muted)' }}>
                    <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> {p.included_guests} guests</span>
                    <span>• {p.items.length} services</span>
                    {p.active_deal && <span className="text-emerald-400">• Deal: {p.active_deal.name}</span>}
                    {(p.valid_from || p.valid_until) && <span>• Valid {p.valid_from ? String(p.valid_from).slice(0, 10) : '…'} – {p.valid_until ? String(p.valid_until).slice(0, 10) : '…'}</span>}
                  </div>
                </div>
              </div>

              {blocked.size > 0 && (
                <div className="mx-3 mb-2 p-2 rounded-lg text-[11px] text-rose-300" style={{ background: 'rgba(239,68,68,0.1)' }}>
                  Unavailable because: {[...blocked.values()].map((u) => `${u.serviceName} — ${String(u.status).replace('_', ' ')}`).join(', ')}
                </div>
              )}

              <div className="px-3 pb-3 flex-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{unlimited ? 'All services included' : 'Included services'}</span>
                <div className="mt-1 divide-y" style={{ borderColor: 'var(--line)' }}>
                  {items.map((it) => {
                    const svc = serviceById.get(it.service_id);
                    const b = blocked.get(it.service_id);
                    const itemStatus = b ? b.status : (svc?.availability_status || 'AVAILABLE');
                    return (
                      <div key={it.service_id} className="flex items-center justify-between gap-2 py-1 text-xs" style={{ borderColor: 'var(--line)' }}>
                        <span className="truncate">{b ? '✕' : '✓'} {it.service_name}{it.quantity > 1 ? ` × ${it.quantity}` : ''}</span>
                        <span className="flex items-center gap-2 shrink-0">
                          {svc && <span className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{svc.available_for_date}/{svc.capacity_for_date} left</span>}
                          <StatusBadge status={itemStatus} size="xs" />
                        </span>
                      </div>
                    );
                  })}
                </div>
                {p.items.length > 6 && (
                  <button onClick={() => setExpanded((e) => ({ ...e, [p.id]: !open }))} className="mt-1 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer" style={{ color: 'var(--accent)' }}>
                    {open ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show all {p.items.length} services</>}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
