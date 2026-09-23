import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useEcoTour } from '../context/EcoTourContext';
import { apiJson, peso, unitLabel } from '../utils/catalog';
import { getPhilippineDateStr, getPhilippineFormattedDate } from '../utils/phTime';
import StatusBadge from './StatusBadge';

// Real-time availability summary for a date: counts per status, low-stock warnings and a per-service table.
// Used on the Admin dashboard (compact) and as the Staff "Service Availability" page (full).
export default function AvailabilityOverview({ compact = false, onViewService }) {
  const { theme } = useEcoTour();
  const isLight = theme === 'light';
  const [date, setDate] = useState(getPhilippineDateStr());
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [dealSummary, setDealSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, p, d] = await Promise.all([
        apiJson(`/services?all=1&date=${date}`),
        apiJson(`/packages?all=1&date=${date}`),
        apiJson('/deals').catch(() => null),
      ]);
      setServices(s.services.filter((x) => !x.deleted_at));
      setPackages(p.data);
      setDealSummary(d?.summary || null);
    } catch (e) {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [date]);
  useEffect(() => {
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [date]);

  const count = (st) => services.filter((s) => s.availability_status === st).length;
  const lowStock = services.filter((s) => s.availability_status === 'LOW_STOCK' || s.availability_status === 'FULLY_BOOKED');
  const activePkgs = packages.filter((p) => p.status === 'Active');
  const card = { background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.3)', border: '1px solid var(--line)' };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-extrabold text-base">Service Availability — {date === getPhilippineDateStr() ? `Today, ${getPhilippineFormattedDate()}` : date}</h3>
        <div className="flex gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl px-3 py-1.5 text-xs font-mono outline-none" style={{ ...card, color: 'var(--text)' }} />
          <button onClick={load} className="px-3 rounded-xl cursor-pointer" style={{ border: '1px solid var(--line)' }}><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          ['Total Services', services.length, null],
          ['Available', count('AVAILABLE'), 'AVAILABLE'],
          ['Low Stock', count('LOW_STOCK'), 'LOW_STOCK'],
          ['Fully Booked', count('FULLY_BOOKED'), 'FULLY_BOOKED'],
          ['Out of Stock', count('OUT_OF_STOCK'), 'OUT_OF_STOCK'],
          ['Unavailable', count('UNAVAILABLE') + count('MAINTENANCE') + count('INACTIVE'), 'UNAVAILABLE'],
        ].map(([label, n, st]) => (
          <div key={label} className="p-3 rounded-2xl" style={card}>
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{label}</div>
            <div className="text-2xl font-black">{n}</div>
            {st && <StatusBadge status={st} size="xs" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="p-3 rounded-2xl text-xs" style={card}>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Packages</div>
          Active: <strong>{activePkgs.length}</strong> • Available: <strong className="text-emerald-400">{activePkgs.filter((p) => ['AVAILABLE', 'LOW_STOCK'].includes(p.availability_status)).length}</strong> • Unavailable: <strong className="text-rose-400">{activePkgs.filter((p) => !['AVAILABLE', 'LOW_STOCK'].includes(p.availability_status)).length}</strong>
        </div>
        {dealSummary && (
          <div className="p-3 rounded-2xl text-xs" style={card}>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Deals</div>
            Active: <strong className="text-emerald-400">{dealSummary.active}</strong> • Scheduled: <strong className="text-sky-400">{dealSummary.scheduled}</strong> • Expired: <strong>{dealSummary.expired}</strong>
          </div>
        )}
      </div>

      {lowStock.length > 0 && (
        <div className="p-3 rounded-2xl space-y-1.5" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.45)' }}>
          <strong className="text-xs flex items-center gap-1 text-amber-400"><AlertTriangle className="w-4 h-4" /> LOW STOCK / FULLY BOOKED — {date}</strong>
          {lowStock.map((s) => (
            <div key={s.service_id} className="text-xs flex items-center justify-between gap-2">
              <span>{s.service_name} has {s.available_for_date === 0 ? 'no' : `only ${s.available_for_date}`} remaining slot{s.available_for_date === 1 ? '' : 's'} ({s.booked_for_date}/{s.capacity_for_date} booked)</span>
              {onViewService && <button onClick={() => onViewService(s)} className="text-[11px] font-bold underline cursor-pointer" style={{ color: 'var(--accent)' }}>View Service</button>}
            </div>
          ))}
        </div>
      )}

      {!compact && (
        <div className="rounded-2xl overflow-x-auto border" style={{ borderColor: 'var(--line)' }}>
          <table className="w-full text-xs">
            <thead className="uppercase text-[10px] font-mono" style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.35)', color: 'var(--muted)' }}>
              <tr>{['Service', 'Price', 'Capacity', 'Booked', 'Remaining', 'Status'].map((h) => <th key={h} className="p-3 text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.service_id} style={{ borderTop: '1px solid var(--line)' }}>
                  <td className="p-3 font-bold">{s.service_name}<div className="text-[10px] font-normal" style={{ color: 'var(--muted)' }}>{s.category}</div></td>
                  <td className="p-3 font-mono">{peso(s.price)} <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{unitLabel(s.unit)}</span></td>
                  <td className="p-3 font-mono">{s.capacity_for_date}</td>
                  <td className="p-3 font-mono">{s.booked_for_date}</td>
                  <td className="p-3 font-mono font-bold">{s.available_for_date}</td>
                  <td className="p-3"><StatusBadge status={s.availability_status} size="xs" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
