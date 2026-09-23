import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, Eye, Edit3, Copy, Ban, Trash2, X, Star, PackageX, PackageCheck } from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';
import { apiJson, resolveImage, peso } from '../../../utils/catalog';
import { getPhilippineDateStr } from '../../../utils/phTime';
import StatusBadge from '../../../components/StatusBadge';
import ServiceDetailsModal from '../../../components/ServiceDetailsModal';
import ImageUploader from './ImageUploader';

const Field = ({ label, children, className = '' }) => <label className={`text-xs font-bold space-y-1 block ${className}`}><span>{label}</span>{children}</label>;

const EMPTY = {
  package_name: '', description: '', image_url: null, regular_value: '', discount_type: 'Percentage', discount_percent: 0,
  promo_price: '', valid_from: '', valid_until: '', included_guests: 5, badge: '', package_type: 'STANDARD',
  status: 'Active', manual_status: '', is_featured: false, show_on_landing: true, items: {},
};

const toDateInput = (v) => (v ? String(v).slice(0, 10) : '');

export default function PackagesManager() {
  const { showAlert, showConfirm, theme, refreshAllLiveData } = useEcoTour();
  const isLight = theme === 'light';
  const [date, setDate] = useState(getPhilippineDateStr());
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([apiJson(`/packages?all=1&date=${date}`), apiJson('/services')]);
      setPackages(p.data);
      setServices(s.services);
    } catch (e) {
      showAlert({ title: 'Could not load packages', message: e.message, type: 'danger' });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [date]);

  const fail = (e) => showAlert({ title: 'Action failed', message: e.status === 401 || e.status === 403 ? 'Admin login required. Please log in again as Admin.' : e.message, type: 'danger' });
  const afterChange = async () => { await load(); refreshAllLiveData && refreshAllLiveData(); };

  const patch = async (p, body) => {
    try { await apiJson(`/packages/${p.id}/status`, { method: 'PATCH', auth: true, body }); await afterChange(); } catch (e) { fail(e); }
  };

  const toForm = (p) => ({
    ...EMPTY,
    ...p,
    regular_value: p.regular_value,
    promo_price: p.base_promo_price ?? p.promo_price,
    valid_from: toDateInput(p.valid_from),
    valid_until: toDateInput(p.valid_until),
    manual_status: p.manual_status || '',
    badge: p.badge || '',
    items: Object.fromEntries((p.items || []).map((i) => [i.service_id, i.quantity])),
  });

  // Keep final price in sync with original price + discount
  const recalc = (f) => {
    const reg = parseFloat(f.regular_value) || 0;
    const d = parseFloat(f.discount_percent) || 0;
    const final = f.discount_type === 'Fixed' ? Math.max(0, reg - d) : Math.round(reg * (1 - d / 100));
    return { ...f, promo_price: reg ? final : f.promo_price };
  };
  const set = (k, recompute = false) => (e) => setEditing((p) => {
    const next = { ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value };
    return recompute ? recalc(next) : next;
  });

  const save = async () => {
    const f = editing;
    if (!f.package_name.trim()) return showAlert({ title: 'Name required', message: 'Please enter a package name.', type: 'warning' });
    if (!(parseFloat(f.regular_value) >= 0)) return showAlert({ title: 'Price required', message: 'Please enter the original price.', type: 'warning' });
    const items = Object.entries(f.items).filter(([, q]) => q > 0).map(([service_id, quantity]) => ({ service_id: Number(service_id), quantity: Number(quantity) }));
    if (items.length === 0) return showAlert({ title: 'Included services required', message: 'Select at least one included service.', type: 'warning' });
    setSaving(true);
    const body = {
      ...f,
      regular_value: parseFloat(f.regular_value),
      promo_price: parseFloat(f.promo_price) || parseFloat(f.regular_value),
      discount_percent: parseFloat(f.discount_percent) || 0,
      included_guests: parseInt(f.included_guests, 10) || 1,
      valid_from: f.valid_from || null,
      valid_until: f.valid_until || null,
      manual_status: f.manual_status || null,
      items,
    };
    try {
      if (f.id) await apiJson(`/packages/${f.id}`, { method: 'PUT', auth: true, body });
      else await apiJson('/packages', { method: 'POST', auth: true, body });
      setEditing(null);
      await afterChange();
      showAlert({ title: 'Package saved', message: `${f.package_name} is saved and visible everywhere it is enabled.`, type: 'success' });
    } catch (e) { fail(e); } finally { setSaving(false); }
  };

  const remove = async (p) => {
    const ok = await showConfirm({ title: 'Delete Package?', message: `${p.package_name} will be archived. Existing reservations keep their package.`, type: 'danger', confirmText: 'Delete' });
    if (!ok) return;
    try { await apiJson(`/packages/${p.id}`, { method: 'DELETE', auth: true }); await afterChange(); } catch (e) { fail(e); }
  };

  const input = { background: isLight ? '#fff' : 'rgba(0,0,0,0.4)', border: '1px solid var(--line)', color: 'var(--text)' };

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-3 flex-wrap">
        <div className="flex gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl px-3 py-2 text-sm font-mono outline-none" style={input} title="Availability date" />
          <button onClick={load} className="px-3 rounded-xl cursor-pointer" style={{ border: '1px solid var(--line)' }}><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} className="px-4 py-2 rounded-xl text-sm font-extrabold inline-flex items-center gap-1.5 cursor-pointer" style={{ background: 'var(--accent)', color: '#04170e' }}><Plus className="w-4 h-4" /> Add Package</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {packages.map((p) => {
          const inactive = p.status === 'Inactive';
          return (
            <div key={p.id} className="rounded-2xl overflow-hidden border flex flex-col" style={{ borderColor: p.package_type === 'UNLIMITED' ? 'rgba(251,191,36,0.6)' : 'var(--line)', opacity: inactive ? 0.6 : 1 }}>
              <div className="h-28 relative">
                <img src={resolveImage(p.image_url, 'family gateway deal.png')} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 flex gap-1">
                  <StatusBadge status={inactive ? 'INACTIVE' : p.availability_status} size="xs" />
                  {p.badge && <span className="px-2 py-0.5 rounded-full text-[9px] font-black text-white bg-rose-600">{p.badge}</span>}
                </div>
              </div>
              <div className="p-3 space-y-1.5 flex-1 flex flex-col text-xs">
                <strong className="text-sm flex items-center gap-1">{p.is_featured && <Star className="w-3.5 h-3.5 text-amber-400" />}{p.package_name}</strong>
                <div className="font-mono"><span className="font-black" style={{ color: 'var(--accent)' }}>{peso(p.final_price)}</span>{p.discount_amount > 0 && <span className="line-through ml-2" style={{ color: 'var(--muted)' }}>{peso(p.regular_value)}</span>}</div>
                <div style={{ color: 'var(--muted)' }}>{p.items.length} services • {p.included_guests} guests • {p.package_type}{p.show_on_landing ? ' • on landing' : ''}</div>
                {p.unavailable_services?.length > 0 && <div className="text-rose-400 text-[11px]">Reason: {p.unavailable_services.map((u) => `${u.serviceName} — ${u.status.replace('_', ' ')}`).join(', ')}</div>}
                <div className="flex gap-1 flex-wrap mt-auto pt-2">
                  {[
                    [Eye, 'View', () => setViewing(p)],
                    [Edit3, 'Edit', () => setEditing(toForm(p))],
                    [Copy, 'Duplicate', () => setEditing({ ...toForm(p), id: undefined, package_code: undefined, package_name: `${p.package_name} (Copy)` })],
                    p.manual_status ? [PackageCheck, 'Mark Available', () => patch(p, { manual_status: null })] : [PackageX, 'Mark Out of Stock', () => patch(p, { manual_status: 'OUT_OF_STOCK' })],
                    [Ban, inactive ? 'Enable' : 'Disable', () => patch(p, { status: inactive ? 'Active' : 'Inactive' })],
                    [Star, p.show_on_landing ? 'Hide from landing' : 'Show on landing', () => patch(p, { show_on_landing: !p.show_on_landing })],
                    [Trash2, 'Delete', () => remove(p)],
                  ].map(([Icon, label, fn]) => (
                    <button key={label} onClick={fn} title={label} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer" style={{ border: '1px solid var(--line)', color: label === 'Delete' ? '#f43f5e' : 'var(--text)' }}><Icon className="w-3.5 h-3.5" /></button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ServiceDetailsModal isOpen={!!viewing} service={viewing} onClose={() => setViewing(null)} />

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="rounded-3xl w-full max-w-5xl p-6 space-y-4 border-2 my-auto" style={{ background: isLight ? 'var(--bg-1)' : '#071f14', borderColor: 'var(--line)', color: 'var(--text)' }}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-extrabold">{editing.id ? `Edit ${editing.package_name}` : 'Create Package'}</h3>
              <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer" style={{ border: '1px solid var(--line)' }}><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-3">
                <Field label="Package Name *"><input value={editing.package_name} onChange={set('package_name')} className="w-full rounded-xl px-3 py-2 outline-none" style={input} /></Field>
                <Field label="Description"><textarea rows={3} value={editing.description || ''} onChange={set('description')} className="w-full rounded-xl px-3 py-2 outline-none" style={input} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Original Price (₱) *"><input type="number" min="0" value={editing.regular_value} onChange={set('regular_value', true)} className="w-full rounded-xl px-3 py-2 outline-none font-mono" style={input} /></Field>
                  <Field label="Discount Type">
                    <select value={editing.discount_type} onChange={set('discount_type', true)} className="w-full rounded-xl px-3 py-2 outline-none" style={input}>
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Fixed">Fixed Amount (₱)</option>
                    </select>
                  </Field>
                  <Field label={editing.discount_type === 'Fixed' ? 'Discount (₱)' : 'Discount (%)'}><input type="number" min="0" value={editing.discount_percent} onChange={set('discount_percent', true)} className="w-full rounded-xl px-3 py-2 outline-none font-mono" style={input} /></Field>
                  <Field label="Package Price (₱)"><input type="number" min="0" value={editing.promo_price} onChange={set('promo_price')} className="w-full rounded-xl px-3 py-2 outline-none font-mono" style={input} /></Field>
                  <Field label="Start Date"><input type="date" value={editing.valid_from} onChange={set('valid_from')} className="w-full rounded-xl px-3 py-2 outline-none" style={input} /></Field>
                  <Field label="End Date"><input type="date" value={editing.valid_until} onChange={set('valid_until')} className="w-full rounded-xl px-3 py-2 outline-none" style={input} /></Field>
                  <Field label="Maximum Guests"><input type="number" min="1" value={editing.included_guests} onChange={set('included_guests')} className="w-full rounded-xl px-3 py-2 outline-none font-mono" style={input} /></Field>
                  <Field label="Badge"><input value={editing.badge} onChange={set('badge')} placeholder="e.g. 16% OFF" className="w-full rounded-xl px-3 py-2 outline-none" style={input} /></Field>
                  <Field label="Package Type">
                    <select value={editing.package_type} onChange={set('package_type')} className="w-full rounded-xl px-3 py-2 outline-none" style={input}>
                      <option value="STANDARD">Standard</option>
                      <option value="UNLIMITED">Unlimited (all-access)</option>
                    </select>
                  </Field>
                  <Field label="Availability">
                    <select value={editing.manual_status || (editing.status === 'Inactive' ? 'INACTIVE' : '')} onChange={(e) => {
                      const v = e.target.value;
                      setEditing((p) => ({ ...p, status: v === 'INACTIVE' ? 'Inactive' : 'Active', manual_status: v === 'INACTIVE' ? '' : v }));
                    }} className="w-full rounded-xl px-3 py-2 outline-none" style={input}>
                      <option value="">Automatic (from included services)</option>
                      <option value="OUT_OF_STOCK">Out of Stock</option>
                      <option value="UNAVAILABLE">Unavailable</option>
                      <option value="INACTIVE">Inactive (hidden)</option>
                    </select>
                  </Field>
                </div>
                <div className="flex gap-4 text-xs font-bold">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!editing.is_featured} onChange={set('is_featured')} /> Featured</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!editing.show_on_landing} onChange={set('show_on_landing')} /> Display on Landing Page</label>
                </div>
                <div className="p-3 rounded-2xl" style={{ border: '1px solid var(--line)' }}>
                  <ImageUploader allowGallery={false} mainImage={editing.image_url} onChange={({ image_url }) => setEditing((p) => ({ ...p, image_url }))} onError={(m) => showAlert({ title: 'Upload failed', message: m, type: 'danger' })} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Included Services &amp; Quantities</span>
                  <button type="button" onClick={() => setEditing((p) => ({ ...p, items: Object.fromEntries(services.map((s) => [s.service_id, p.items[s.service_id] || (String(s.category).toLowerCase() === 'entrance' ? (parseInt(p.included_guests, 10) || 1) : 1)])) }))} className="text-[11px] font-bold underline cursor-pointer">Include all services</button>
                </div>
                <div className="space-y-1.5 max-h-[58vh] overflow-y-auto pr-1">
                  {services.map((s) => {
                    const qty = editing.items[s.service_id] || 0;
                    return (
                      <div key={s.service_id} className="flex items-center gap-2 p-2 rounded-xl text-xs" style={{ border: `1px solid ${qty > 0 ? 'var(--accent)' : 'var(--line)'}` }}>
                        <input type="checkbox" checked={qty > 0} onChange={(e) => setEditing((p) => ({ ...p, items: { ...p.items, [s.service_id]: e.target.checked ? 1 : 0 } }))} />
                        <span className="flex-1">{s.service_name} <span className="font-mono" style={{ color: 'var(--muted)' }}>({peso(s.price)})</span></span>
                        <input type="number" min="0" value={qty} onChange={(e) => setEditing((p) => ({ ...p, items: { ...p.items, [s.service_id]: Math.max(0, parseInt(e.target.value, 10) || 0) } }))} className="w-16 rounded-lg px-2 py-1 font-mono outline-none" style={input} />
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                  Regular value of selected services: {peso(services.reduce((sum, s) => sum + (editing.items[s.service_id] || 0) * parseFloat(s.price || 0), 0))}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2" style={{ borderTop: '1px solid var(--line)' }}>
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer" style={{ border: '1px solid var(--line)' }}>Cancel</button>
              <button disabled={saving} onClick={save} className="px-5 py-2 rounded-xl text-xs font-extrabold cursor-pointer disabled:opacity-50" style={{ background: 'var(--accent)', color: '#04170e' }}>{saving ? 'Saving…' : 'Save Package'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
