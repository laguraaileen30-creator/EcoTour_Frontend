import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Plus, Wrench, CheckCircle2, Trash2, Pencil } from 'lucide-react';
import { useEcoTour } from '../context/EcoTourContext';
import { apiJson } from '../utils/catalog';
import { getPhilippineDateStr } from '../utils/phTime';

const STATE = {
  AVAILABLE: { label: 'Free', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  RESERVED: { label: 'Reserved', color: '#f59e0b', bg: 'rgba(245,158,11,0.14)' },
  OCCUPIED: { label: 'Occupied', color: '#ef4444', bg: 'rgba(239,68,68,0.14)' },
  MAINTENANCE: { label: 'Maintenance', color: '#a78bfa', bg: 'rgba(167,139,250,0.14)' },
};

// Numbered facility units per date (Cottage 01, Videoke 02 …). Admin can manage units; staff view only.
export default function FacilityMap({ canManage = false }) {
  const { showAlert, showConfirm, showPrompt, theme } = useEcoTour();
  const isLight = theme === 'light';
  const [date, setDate] = useState(getPhilippineDateStr());
  const [units, setUnits] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUnit, setNewUnit] = useState({ serviceId: '', count: 1, resourceName: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [u, s] = await Promise.all([apiJson(`/availability/facilities?date=${date}`, { auth: true }), apiJson('/services?all=1')]);
      setUnits(u.data);
      setServices(s.services);
    } catch (e) {
      showAlert({ title: 'Could not load facilities', message: e.status === 401 ? 'Please log in again.' : e.message, type: 'danger' });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [date]);

  const groups = useMemo(() => {
    const g = new Map();
    units.forEach((u) => {
      if (!g.has(u.serviceName)) g.set(u.serviceName, []);
      g.get(u.serviceName).push(u);
    });
    return Array.from(g.entries());
  }, [units]);

  const act = async (fn) => { try { await fn(); await load(); } catch (e) { showAlert({ title: 'Action failed', message: e.message, type: 'danger' }); } };

  const rename = async (u) => {
    const name = showPrompt ? await showPrompt({ title: 'Rename unit', message: 'New unit name', defaultValue: u.resourceName }) : window.prompt('New unit name', u.resourceName);
    if (name && name.trim() && name !== u.resourceName) act(() => apiJson(`/availability/facilities/${u.id}`, { method: 'PUT', auth: true, body: { resourceName: name.trim() } }));
  };

  const input = { background: isLight ? '#fff' : 'rgba(0,0,0,0.4)', border: '1px solid var(--line)', color: 'var(--text)' };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 items-center flex-wrap">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl px-3 py-2 text-sm font-mono outline-none" style={input} />
          <button onClick={load} className="px-3 py-2 rounded-xl cursor-pointer" style={{ border: '1px solid var(--line)' }}><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
          {Object.entries(STATE).map(([k, v]) => (
            <span key={k} className="px-2 py-1 rounded-lg text-[10px] font-bold" style={{ background: v.bg, color: v.color }}>● {v.label}: {units.filter((u) => u.state === k).length}</span>
          ))}
        </div>
        {canManage && (
          <div className="flex gap-2 items-center flex-wrap text-xs">
            <select value={newUnit.serviceId} onChange={(e) => setNewUnit((p) => ({ ...p, serviceId: e.target.value }))} className="rounded-xl px-2 py-2 outline-none" style={input}>
              <option value="">Service…</option>
              {services.filter((s) => String(s.category).toLowerCase() !== 'entrance').map((s) => <option key={s.service_id} value={s.service_id}>{s.service_name}</option>)}
            </select>
            <input value={newUnit.resourceName} onChange={(e) => setNewUnit((p) => ({ ...p, resourceName: e.target.value }))} placeholder="Name prefix (e.g. Cottage)" className="rounded-xl px-2 py-2 w-40 outline-none" style={input} />
            <input type="number" min="1" max="100" value={newUnit.count} onChange={(e) => setNewUnit((p) => ({ ...p, count: e.target.value }))} className="rounded-xl px-2 py-2 w-16 font-mono outline-none" style={input} />
            <button disabled={!newUnit.serviceId} onClick={() => act(async () => { await apiJson('/availability/facilities', { method: 'POST', auth: true, body: newUnit }); setNewUnit({ serviceId: '', count: 1, resourceName: '' }); })} className="px-3 py-2 rounded-xl font-extrabold inline-flex items-center gap-1 cursor-pointer disabled:opacity-40" style={{ background: 'var(--accent)', color: '#04170e' }}><Plus className="w-3.5 h-3.5" /> Add Units</button>
          </div>
        )}
      </div>

      {groups.length === 0 && !loading && <p className="text-sm text-center py-8" style={{ color: 'var(--muted)' }}>No numbered facility units yet.</p>}

      {groups.map(([serviceName, list]) => (
        <div key={serviceName} className="p-4 rounded-2xl space-y-2" style={{ border: '1px solid var(--line)', background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.25)' }}>
          <div className="flex justify-between text-xs font-bold">
            <span>{serviceName}</span>
            <span style={{ color: 'var(--muted)' }}>{list.filter((u) => u.state === 'AVAILABLE').length} free / {list.length}</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2">
            {list.map((u) => {
              const st = STATE[u.state];
              return (
                <div key={u.id} className="p-2 rounded-xl text-center relative group" style={{ background: st.bg, border: `1px solid ${st.color}55` }} title={u.bookingRef ? `${u.bookingRef} — ${u.clientName}` : u.blockReason || st.label}>
                  <div className="text-[11px] font-extrabold truncate">{u.resourceName}</div>
                  <div className="text-[9px] font-bold" style={{ color: st.color }}>{st.label}</div>
                  {u.bookingRef && <div className="text-[9px] truncate" style={{ color: 'var(--muted)' }}>{u.clientName || u.bookingRef}</div>}
                  {canManage && (
                    <div className="flex justify-center gap-1 mt-1">
                      <button onClick={() => rename(u)} title="Rename" className="cursor-pointer opacity-70 hover:opacity-100"><Pencil className="w-3 h-3" /></button>
                      {u.unitStatus === 'Available'
                        ? <button onClick={() => act(() => apiJson(`/availability/facilities/${u.id}`, { method: 'PUT', auth: true, body: { status: 'Maintenance' } }))} title="Set maintenance" className="cursor-pointer opacity-70 hover:opacity-100"><Wrench className="w-3 h-3" /></button>
                        : <button onClick={() => act(() => apiJson(`/availability/facilities/${u.id}`, { method: 'PUT', auth: true, body: { status: 'Available' } }))} title="Set available" className="cursor-pointer opacity-70 hover:opacity-100"><CheckCircle2 className="w-3 h-3" /></button>}
                      <button onClick={async () => { if (await showConfirm({ title: 'Remove unit?', message: `Remove ${u.resourceName}? Units with upcoming reservations cannot be removed.`, type: 'danger', confirmText: 'Remove' })) act(() => apiJson(`/availability/facilities/${u.id}`, { method: 'DELETE', auth: true })); }} title="Remove" className="cursor-pointer text-rose-400 opacity-70 hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
