import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, Eye, Edit3, Copy, PackageX, PackageCheck, Wrench, Ban, Trash2, Search, X, Star } from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';
import { apiJson, resolveImage, peso, unitLabel, PRICE_UNITS } from '../../../utils/catalog';
import { getPhilippineDateStr } from '../../../utils/phTime';
import StatusBadge from '../../../components/StatusBadge';
import ServiceDetailsModal from '../../../components/ServiceDetailsModal';
import ImageUploader from './ImageUploader';

const CATEGORIES = ['Entrance', 'Cottage', 'Accommodation', 'Rental', 'Safety', 'Entertainment', 'Water Activity', 'Event', 'Food', 'Parking', 'Facility', 'Equipment', 'Activity'];

const EMPTY = {
  service_name: '', short_description: '', description: '', category: 'Cottage', image_url: null, gallery: [],
  price: '', unit: 'day', total_capacity: 1, capacity_persons: '', minimum_quantity: 1,
  status: 'Active', manual_status: '', is_featured: false, show_on_landing: true, is_assignable: false,
  terms: '', inclusions: '', exclusions: '',
};

const Field = ({ label, children, className = '' }) => <label className={`text-xs font-bold space-y-1 block ${className}`}><span>{label}</span>{children}</label>;

const toForm = (s) => ({
  ...EMPTY,
  ...s,
  price: s.price ?? '',
  capacity_persons: s.capacity_persons ?? '',
  manual_status: s.manual_status || '',
  inclusions: (s.inclusions || []).join('\n'),
  exclusions: (s.exclusions || []).join('\n'),
  gallery: s.gallery || [],
  terms: s.terms || '',
});

export default function ServicesManager() {
  const { showAlert, showConfirm, theme, refreshAllLiveData } = useEcoTour();
  const isLight = theme === 'light';
  const [date, setDate] = useState(getPhilippineDateStr());
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // form object
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const d = await apiJson(`/services?all=1&date=${date}`);
      setServices(d.services);
    } catch (e) {
      showAlert({ title: 'Could not load services', message: e.message, type: 'danger' });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [date]);

  const afterChange = async () => { await load(); refreshAllLiveData && refreshAllLiveData(); };
  const fail = (e) => showAlert({ title: 'Action failed', message: e.status === 401 || e.status === 403 ? 'Admin login required. Please log in again as Admin.' : e.message, type: 'danger' });

  const patchStatus = async (s, body, okMsg) => {
    try {
      await apiJson(`/services/${s.service_id}/status`, { method: 'PATCH', auth: true, body });
      await afterChange();
      if (okMsg) showAlert({ title: 'Updated', message: okMsg, type: 'success' });
    } catch (e) { fail(e); }
  };

  const markOutOfStock = async (s) => {
    let upcoming = [];
    try { upcoming = (await apiJson(`/services/${s.service_id}/upcoming`, { auth: true })).data; } catch (e) { /* warning is best effort */ }
    const ok = await showConfirm({
      title: 'Mark Service as Out of Stock?',
      message: `${s.service_name} will no longer be available for new reservations. Existing reservations will remain unchanged.`,
      details: upcoming.length ? `⚠ ${upcoming.length} upcoming confirmed reservation(s) use this service:\n${upcoming.slice(0, 6).map((u) => `${u.bookingRef} — ${u.clientName} (${u.date}) ×${u.quantity}`).join('\n')}` : undefined,
      type: 'danger',
      confirmText: 'Confirm',
    });
    if (ok) patchStatus(s, { manual_status: 'OUT_OF_STOCK' }, `${s.service_name} is now OUT OF STOCK everywhere.`);
  };

  const remove = async (s) => {
    const ok = await showConfirm({
      title: 'Delete Service?',
      message: `${s.service_name} will be archived (soft delete). It disappears from booking and the landing page, while existing reservations and reports keep their history.`,
      type: 'danger',
      confirmText: 'Delete',
    });
    if (!ok) return;
    try { await apiJson(`/services/${s.service_id}`, { method: 'DELETE', auth: true }); await afterChange(); } catch (e) { fail(e); }
  };

  const save = async () => {
    const f = editing;
    if (!f.service_name.trim()) return showAlert({ title: 'Title required', message: 'Please enter a service title.', type: 'warning' });
    if (!(parseFloat(f.price) >= 0)) return showAlert({ title: 'Price required', message: 'Please enter a valid price.', type: 'warning' });
    setSaving(true);
    const body = {
      ...f,
      price: parseFloat(f.price),
      total_capacity: parseInt(f.total_capacity, 10) || 0,
      capacity_persons: f.capacity_persons === '' ? null : parseInt(f.capacity_persons, 10),
      minimum_quantity: parseInt(f.minimum_quantity, 10) || 1,
      manual_status: f.manual_status || null,
    };
    try {
      if (f.service_id) await apiJson(`/services/${f.service_id}`, { method: 'PUT', auth: true, body });
      else await apiJson('/services', { method: 'POST', auth: true, body });
      setEditing(null);
      await afterChange();
      showAlert({ title: 'Saved', message: `${f.service_name} saved. It is now reflected on the landing page, client, staff and admin screens.`, type: 'success' });
    } catch (e) { fail(e); } finally { setSaving(false); }
  };

  const filtered = services.filter((s) => {
    const q = query.toLowerCase();
    return !q || [s.service_name, s.category, s.service_code].some((v) => String(v || '').toLowerCase().includes(q));
  });

  const input = { background: isLight ? '#fff' : 'rgba(0,0,0,0.4)', border: '1px solid var(--line)', color: 'var(--text)' };
  const set = (k) => (e) => setEditing((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-3">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search services…" className="w-full rounded-xl pl-9 pr-3 py-2 text-sm outline-none" style={input} />
          </div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl px-3 py-2 text-sm font-mono outline-none" style={input} title="Availability date" />
          <button onClick={load} className="px-3 rounded-xl cursor-pointer" style={{ border: '1px solid var(--line)' }} title="Refresh"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} className="px-4 py-2 rounded-xl text-sm font-extrabold inline-flex items-center gap-1.5 cursor-pointer" style={{ background: 'var(--accent)', color: '#04170e' }}><Plus className="w-4 h-4" /> Add Service</button>
      </div>

      <div className="rounded-2xl overflow-x-auto border" style={{ borderColor: 'var(--line)' }}>
        <table className="w-full text-xs text-left">
          <thead className="uppercase text-[10px] font-mono" style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.35)', color: 'var(--muted)' }}>
            <tr>
              {['Image', 'Service', 'Category', 'Price', 'Capacity', 'Booked', 'Available', 'Status', 'Landing', 'Actions'].map((h) => <th key={h} className={`p-3 ${['Price', 'Capacity', 'Booked', 'Available'].includes(h) ? 'text-right' : ''}`}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const out = s.manual_status === 'OUT_OF_STOCK';
              const inactive = s.status === 'Inactive';
              return (
                <tr key={s.service_id} style={{ borderTop: '1px solid var(--line)', opacity: inactive ? 0.6 : 1 }}>
                  <td className="p-2"><img src={resolveImage(s.image_url)} alt="" className="w-14 h-10 rounded-lg object-cover" /></td>
                  <td className="p-3">
                    <strong className="flex items-center gap-1">{s.is_featured && <Star className="w-3 h-3 text-amber-400" />}{s.service_name}</strong>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>{s.service_code}{s.is_assignable ? ' • numbered units' : ''}</span>
                  </td>
                  <td className="p-3">{s.category}</td>
                  <td className="p-3 text-right font-mono">{peso(s.price)} <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{unitLabel(s.unit)}</span></td>
                  <td className="p-3 text-right font-mono">{s.capacity_for_date}</td>
                  <td className="p-3 text-right font-mono">{s.booked_for_date}</td>
                  <td className="p-3 text-right font-mono font-bold">{s.available_for_date}</td>
                  <td className="p-3"><StatusBadge status={s.availability_status} size="xs" /></td>
                  <td className="p-3">
                    <button onClick={() => patchStatus(s, { show_on_landing: !s.show_on_landing })} className="px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer" style={{ background: s.show_on_landing ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.15)', color: s.show_on_landing ? '#22c55e' : '#94a3b8' }}>{s.show_on_landing ? 'YES' : 'NO'}</button>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1 flex-wrap">
                      {[
                        [Eye, 'View', () => setViewing(s)],
                        [Edit3, 'Edit', () => setEditing(toForm(s))],
                        [Copy, 'Duplicate', () => setEditing({ ...toForm(s), service_id: undefined, service_code: undefined, service_name: `${s.service_name} (Copy)` })],
                        out || s.manual_status
                          ? [PackageCheck, 'Mark Available', () => patchStatus(s, { manual_status: null }, `${s.service_name} is available again.`)]
                          : [PackageX, 'Mark Out of Stock', () => markOutOfStock(s)],
                        [Wrench, 'Maintenance', () => patchStatus(s, { manual_status: 'MAINTENANCE' }, `${s.service_name} set to MAINTENANCE.`)],
                        [Ban, inactive ? 'Enable' : 'Disable', () => patchStatus(s, { status: inactive ? 'Active' : 'Inactive' })],
                        [Trash2, 'Delete', () => remove(s)],
                      ].map(([Icon, label, fn]) => (
                        <button key={label} onClick={fn} title={label} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer" style={{ border: '1px solid var(--line)', color: label === 'Delete' ? '#f43f5e' : label === 'Mark Out of Stock' ? '#fb7185' : 'var(--text)' }}><Icon className="w-3.5 h-3.5" /></button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && filtered.length === 0 && <tr><td colSpan={10} className="p-6 text-center" style={{ color: 'var(--muted)' }}>No services found.</td></tr>}
          </tbody>
        </table>
      </div>

      <ServiceDetailsModal isOpen={!!viewing} service={viewing} onClose={() => setViewing(null)} />

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="rounded-3xl w-full max-w-4xl p-6 space-y-4 border-2 my-auto" style={{ background: isLight ? 'var(--bg-1)' : '#071f14', borderColor: 'var(--line)', color: 'var(--text)' }}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-extrabold">{editing.service_id ? `Edit ${editing.service_name}` : 'Add Service'}</h3>
              <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer" style={{ border: '1px solid var(--line)' }}><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto pr-1">
              <Field label="Service Title *"><input value={editing.service_name} onChange={set('service_name')} className="w-full rounded-xl px-3 py-2 outline-none" style={input} /></Field>
              <Field label="Service Category">
                <input list="svc-categories" value={editing.category} onChange={set('category')} className="w-full rounded-xl px-3 py-2 outline-none" style={input} />
                <datalist id="svc-categories">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
              </Field>
              <Field label="Short Description" className="md:col-span-2"><input maxLength={255} value={editing.short_description || ''} onChange={set('short_description')} className="w-full rounded-xl px-3 py-2 outline-none" style={input} /></Field>
              <Field label="Full Description" className="md:col-span-2"><textarea rows={3} value={editing.description || ''} onChange={set('description')} className="w-full rounded-xl px-3 py-2 outline-none" style={input} /></Field>
              <Field label="Price (₱) *"><input type="number" min="0" step="0.01" value={editing.price} onChange={set('price')} className="w-full rounded-xl px-3 py-2 outline-none font-mono" style={input} /></Field>
              <Field label="Price Unit">
                <select value={editing.unit} onChange={set('unit')} className="w-full rounded-xl px-3 py-2 outline-none" style={input}>
                  {PRICE_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                  {!PRICE_UNITS.some((u) => u.value === editing.unit) && <option value={editing.unit}>{editing.unit}</option>}
                </select>
              </Field>
              <Field label="Available Quantity (per day)"><input type="number" min="0" value={editing.total_capacity} onChange={set('total_capacity')} className="w-full rounded-xl px-3 py-2 outline-none font-mono" style={input} /></Field>
              <Field label="Maximum Capacity (persons)"><input type="number" min="0" value={editing.capacity_persons} onChange={set('capacity_persons')} className="w-full rounded-xl px-3 py-2 outline-none font-mono" style={input} /></Field>
              <Field label="Minimum Quantity"><input type="number" min="1" value={editing.minimum_quantity} onChange={set('minimum_quantity')} className="w-full rounded-xl px-3 py-2 outline-none font-mono" style={input} /></Field>
              <Field label="Service Status">
                <select value={editing.manual_status || (editing.status === 'Inactive' ? 'INACTIVE' : '')} onChange={(e) => {
                  const v = e.target.value;
                  setEditing((p) => ({ ...p, status: v === 'INACTIVE' ? 'Inactive' : 'Active', manual_status: v === 'INACTIVE' ? '' : v }));
                }} className="w-full rounded-xl px-3 py-2 outline-none" style={input}>
                  <option value="">Automatic (Available / Low Stock / Fully Booked)</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="INACTIVE">Inactive (hidden)</option>
                </select>
              </Field>
              <div className="md:col-span-2 flex flex-wrap gap-4 text-xs font-bold">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!editing.is_featured} onChange={set('is_featured')} /> Featured Service</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!editing.show_on_landing} onChange={set('show_on_landing')} /> Display on Landing Page</label>
                <label className="flex items-center gap-2 cursor-pointer" title="Each unit gets a number (Cottage 01, 02 …) that staff assign to reservations"><input type="checkbox" checked={!!editing.is_assignable} onChange={set('is_assignable')} /> Numbered physical units (assignable)</label>
              </div>
              <Field label="Inclusions (one per line)"><textarea rows={3} value={editing.inclusions} onChange={set('inclusions')} className="w-full rounded-xl px-3 py-2 outline-none" style={input} /></Field>
              <Field label="Exclusions (one per line)"><textarea rows={3} value={editing.exclusions} onChange={set('exclusions')} className="w-full rounded-xl px-3 py-2 outline-none" style={input} /></Field>
              <Field label="Terms / Notes" className="md:col-span-2"><textarea rows={2} value={editing.terms} onChange={set('terms')} className="w-full rounded-xl px-3 py-2 outline-none" style={input} /></Field>
              <div className="md:col-span-2 p-3 rounded-2xl" style={{ border: '1px solid var(--line)' }}>
                <ImageUploader
                  mainImage={editing.image_url}
                  gallery={editing.gallery}
                  onChange={({ image_url, gallery }) => setEditing((p) => ({ ...p, image_url, gallery }))}
                  onError={(m) => showAlert({ title: 'Upload failed', message: m, type: 'danger' })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2" style={{ borderTop: '1px solid var(--line)' }}>
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer" style={{ border: '1px solid var(--line)' }}>Cancel</button>
              <button disabled={saving} onClick={save} className="px-5 py-2 rounded-xl text-xs font-extrabold cursor-pointer disabled:opacity-50" style={{ background: 'var(--accent)', color: '#04170e' }}>{saving ? 'Saving…' : 'Save Service'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
