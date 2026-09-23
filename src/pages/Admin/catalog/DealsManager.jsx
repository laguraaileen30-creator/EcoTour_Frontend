import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, Edit3, Ban, Trash2, X, Star, Copy } from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';
import { apiJson, resolveImage, peso } from '../../../utils/catalog';
import ImageUploader from './ImageUploader';

const Field = ({ label, children, className = '' }) => <label className={`text-xs font-bold space-y-1 block ${className}`}><span>{label}</span>{children}</label>;

const STATE_COLORS = { ACTIVE: '#22c55e', SCHEDULED: '#38bdf8', EXPIRED: '#94a3b8', INACTIVE: '#64748b' };

const toLocalInput = (v) => {
  if (!v) return '';
  const d = new Date(v);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const EMPTY = {
  promo_name: '', description: '', image_url: null, discount_type: 'Percentage', discount_value: 10,
  original_price: '', discounted_price: '', start_at: '', end_at: '', usage_limit: '', priority: 5,
  status: 'Active', is_featured: false, show_on_landing: true, package_ids: [], service_ids: [],
};

export default function DealsManager() {
  const { showAlert, showConfirm, theme, refreshAllLiveData } = useEcoTour();
  const isLight = theme === 'light';
  const [deals, setDeals] = useState([]);
  const [summary, setSummary] = useState({});
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [d, p, s] = await Promise.all([apiJson('/deals'), apiJson('/packages?all=1'), apiJson('/services')]);
      setDeals(d.data);
      setSummary(d.summary || {});
      setPackages(p.data);
      setServices(s.services);
    } catch (e) {
      showAlert({ title: 'Could not load deals', message: e.message, type: 'danger' });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const fail = (e) => showAlert({ title: 'Action failed', message: e.status === 401 || e.status === 403 ? 'Admin login required. Please log in again as Admin.' : e.message, type: 'danger' });
  const afterChange = async () => { await load(); refreshAllLiveData && refreshAllLiveData(); };
  const set = (k) => (e) => setEditing((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const toggleId = (k, id) => setEditing((p) => ({ ...p, [k]: p[k].includes(id) ? p[k].filter((x) => x !== id) : [...p[k], id] }));

  const computed = (() => {
    if (!editing) return null;
    const o = parseFloat(editing.original_price);
    const v = parseFloat(editing.discount_value) || 0;
    if (!o) return null;
    if (editing.discount_type === 'Percentage') return Math.round(o * (1 - v / 100));
    if (editing.discount_type === 'Fixed') return Math.max(0, o - v);
    if (editing.discount_type === 'Special Price') return v;
    return null;
  })();

  const save = async () => {
    const f = editing;
    if (!f.promo_name.trim() || !f.start_at || !f.end_at) return showAlert({ title: 'Missing details', message: 'Deal title, start date and end date are required.', type: 'warning' });
    setSaving(true);
    const body = {
      ...f,
      discount_value: parseFloat(f.discount_value) || 0,
      original_price: f.original_price === '' ? null : parseFloat(f.original_price),
      discounted_price: f.discounted_price === '' ? (computed ?? null) : parseFloat(f.discounted_price),
      usage_limit: f.usage_limit === '' ? null : parseInt(f.usage_limit, 10),
      // DATETIME columns hold resort-local (Asia/Manila) wall-clock time
      start_at: `${f.start_at.replace('T', ' ')}:00`,
      end_at: `${f.end_at.replace('T', ' ')}:00`,
    };
    try {
      if (f.id) await apiJson(`/deals/${f.id}`, { method: 'PUT', auth: true, body });
      else await apiJson('/deals', { method: 'POST', auth: true, body });
      setEditing(null);
      await afterChange();
    } catch (e) { fail(e); } finally { setSaving(false); }
  };

  const toForm = (d) => ({
    ...EMPTY,
    ...d,
    original_price: d.original_price ?? '',
    discounted_price: d.discounted_price ?? '',
    usage_limit: d.usage_limit ?? '',
    start_at: toLocalInput(d.start_at),
    end_at: toLocalInput(d.end_at),
    package_ids: d.packages.map((p) => p.package_id),
    service_ids: d.services.map((s) => s.service_id),
  });

  const input = { background: isLight ? '#fff' : 'rgba(0,0,0,0.4)', border: '1px solid var(--line)', color: 'var(--text)' };

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-3 flex-wrap items-center">
        <div className="flex gap-2 text-xs font-bold flex-wrap">
          {['active', 'scheduled', 'expired', 'inactive'].map((k) => (
            <span key={k} className="px-3 py-1.5 rounded-xl" style={{ border: '1px solid var(--line)', color: STATE_COLORS[k.toUpperCase()] }}>{k.toUpperCase()}: {summary[k] || 0}</span>
          ))}
          <button onClick={load} className="px-3 rounded-xl cursor-pointer" style={{ border: '1px solid var(--line)' }}><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} className="px-4 py-2 rounded-xl text-sm font-extrabold inline-flex items-center gap-1.5 cursor-pointer" style={{ background: 'var(--accent)', color: '#04170e' }}><Plus className="w-4 h-4" /> Add Deal</button>
      </div>

      <div className="rounded-2xl overflow-x-auto border" style={{ borderColor: 'var(--line)' }}>
        <table className="w-full text-xs text-left">
          <thead className="uppercase text-[10px] font-mono" style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.35)', color: 'var(--muted)' }}>
            <tr>{['Image', 'Deal', 'Discount', 'Applies to', 'Period', 'Usage', 'State', 'Landing', 'Actions'].map((h) => <th key={h} className="p-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {deals.map((d) => (
              <tr key={d.id} style={{ borderTop: '1px solid var(--line)' }}>
                <td className="p-2"><img src={resolveImage(d.image_url, 'flash deal.png')} alt="" className="w-14 h-10 rounded-lg object-cover" /></td>
                <td className="p-3"><strong className="flex items-center gap-1">{d.is_featured && <Star className="w-3 h-3 text-amber-400" />}{d.promo_name}</strong><span className="text-[10px]" style={{ color: 'var(--muted)' }}>{d.promo_code}</span></td>
                <td className="p-3 font-mono">
                  {d.discount_type === 'Percentage' ? `${d.discount_value}% off` : d.discount_type === 'Fixed' ? `${peso(d.discount_value)} off` : d.discount_type === 'Special Price' ? `Special ${peso(d.discount_value)}` : 'Bundle'}
                  {d.original_price ? <div className="text-[10px]" style={{ color: 'var(--muted)' }}>{peso(d.original_price)} → {peso(d.discounted_price)}</div> : null}
                </td>
                <td className="p-3 max-w-[200px]">{[...d.packages.map((p) => p.package_name), ...d.services.map((s) => s.service_name)].join(', ') || '—'}</td>
                <td className="p-3 text-[11px] whitespace-nowrap">{new Date(d.start_at).toLocaleDateString()} – {new Date(d.end_at).toLocaleDateString()}</td>
                <td className="p-3 font-mono">{d.used_count}{d.usage_limit ? ` / ${d.usage_limit}` : ''}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold" style={{ color: STATE_COLORS[d.state], border: `1px solid ${STATE_COLORS[d.state]}` }}>{d.state}</span></td>
                <td className="p-3">
                  <button onClick={async () => { try { await apiJson(`/deals/${d.id}/status`, { method: 'PATCH', auth: true, body: { show_on_landing: !d.show_on_landing } }); afterChange(); } catch (e) { fail(e); } }} className="px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer" style={{ background: d.show_on_landing ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.15)', color: d.show_on_landing ? '#22c55e' : '#94a3b8' }}>{d.show_on_landing ? 'YES' : 'NO'}</button>
                </td>
                <td className="p-2">
                  <div className="flex gap-1">
                    {[
                      [Edit3, 'Edit', () => setEditing(toForm(d))],
                      [Copy, 'Duplicate', () => setEditing({ ...toForm(d), id: undefined, promo_code: undefined, promo_name: `${d.promo_name} (Copy)` })],
                      [Ban, d.status === 'Active' ? 'Disable' : 'Enable', async () => { try { await apiJson(`/deals/${d.id}/status`, { method: 'PATCH', auth: true, body: { status: d.status === 'Active' ? 'Inactive' : 'Active' } }); afterChange(); } catch (e) { fail(e); } }],
                      [Trash2, 'Delete', async () => {
                        if (!(await showConfirm({ title: 'Delete Deal?', message: `${d.promo_name} will be archived.`, type: 'danger', confirmText: 'Delete' }))) return;
                        try { await apiJson(`/deals/${d.id}`, { method: 'DELETE', auth: true }); afterChange(); } catch (e) { fail(e); }
                      }],
                    ].map(([Icon, label, fn]) => (
                      <button key={label} onClick={fn} title={label} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer" style={{ border: '1px solid var(--line)', color: label === 'Delete' ? '#f43f5e' : 'var(--text)' }}><Icon className="w-3.5 h-3.5" /></button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && deals.length === 0 && <tr><td colSpan={9} className="p-6 text-center" style={{ color: 'var(--muted)' }}>No deals yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="rounded-3xl w-full max-w-4xl p-6 space-y-4 border-2 my-auto" style={{ background: isLight ? 'var(--bg-1)' : '#071f14', borderColor: 'var(--line)', color: 'var(--text)' }}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-extrabold">{editing.id ? `Edit ${editing.promo_name}` : 'Create Deal'}</h3>
              <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer" style={{ border: '1px solid var(--line)' }}><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-3">
                <Field label="Deal Title *"><input value={editing.promo_name} onChange={set('promo_name')} className="w-full rounded-xl px-3 py-2 outline-none" style={input} /></Field>
                <Field label="Description"><textarea rows={2} value={editing.description || ''} onChange={set('description')} className="w-full rounded-xl px-3 py-2 outline-none" style={input} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Discount Type">
                    <select value={editing.discount_type} onChange={set('discount_type')} className="w-full rounded-xl px-3 py-2 outline-none" style={input}>
                      <option value="Percentage">Percentage Discount</option>
                      <option value="Fixed">Fixed Amount Discount</option>
                      <option value="Special Price">Special Price</option>
                      <option value="Bundle">Bundle Deal</option>
                    </select>
                  </Field>
                  <Field label={editing.discount_type === 'Percentage' ? 'Discount (%)' : editing.discount_type === 'Special Price' ? 'Special Price (₱)' : 'Discount (₱)'}><input type="number" min="0" value={editing.discount_value} onChange={set('discount_value')} className="w-full rounded-xl px-3 py-2 outline-none font-mono" style={input} /></Field>
                  <Field label="Original Price (₱)"><input type="number" min="0" value={editing.original_price} onChange={set('original_price')} className="w-full rounded-xl px-3 py-2 outline-none font-mono" style={input} /></Field>
                  <Field label="Discounted Price (₱)"><input type="number" min="0" value={editing.discounted_price} placeholder={computed !== null ? String(computed) : ''} onChange={set('discounted_price')} className="w-full rounded-xl px-3 py-2 outline-none font-mono" style={input} /></Field>
                  <Field label="Start *"><input type="datetime-local" value={editing.start_at} onChange={set('start_at')} className="w-full rounded-xl px-3 py-2 outline-none" style={input} /></Field>
                  <Field label="End *"><input type="datetime-local" value={editing.end_at} onChange={set('end_at')} className="w-full rounded-xl px-3 py-2 outline-none" style={input} /></Field>
                  <Field label="Maximum Usage"><input type="number" min="0" value={editing.usage_limit} placeholder="Unlimited" onChange={set('usage_limit')} className="w-full rounded-xl px-3 py-2 outline-none font-mono" style={input} /></Field>
                  <Field label="Status">
                    <select value={editing.status} onChange={set('status')} className="w-full rounded-xl px-3 py-2 outline-none" style={input}><option>Active</option><option>Inactive</option></select>
                  </Field>
                </div>
                <div className="flex gap-4 text-xs font-bold">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!editing.is_featured} onChange={set('is_featured')} /> Featured</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!editing.show_on_landing} onChange={set('show_on_landing')} /> Landing Page Visibility</label>
                </div>
                <div className="p-3 rounded-2xl" style={{ border: '1px solid var(--line)' }}>
                  <ImageUploader allowGallery={false} mainImage={editing.image_url} onChange={({ image_url }) => setEditing((p) => ({ ...p, image_url }))} onError={(m) => showAlert({ title: 'Upload failed', message: m, type: 'danger' })} />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider block mb-1" style={{ color: 'var(--accent)' }}>Applicable Packages</span>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {packages.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 text-xs p-1.5 rounded-lg cursor-pointer" style={{ border: '1px solid var(--line)' }}>
                        <input type="checkbox" checked={editing.package_ids.includes(p.id)} onChange={() => toggleId('package_ids', p.id)} /> {p.package_name} <span className="font-mono ml-auto" style={{ color: 'var(--muted)' }}>{peso(p.regular_value)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider block mb-1" style={{ color: 'var(--accent)' }}>Applicable Services</span>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {services.map((s) => (
                      <label key={s.service_id} className="flex items-center gap-2 text-xs p-1.5 rounded-lg cursor-pointer" style={{ border: '1px solid var(--line)' }}>
                        <input type="checkbox" checked={editing.service_ids.includes(s.service_id)} onChange={() => toggleId('service_ids', s.service_id)} /> {s.service_name} <span className="font-mono ml-auto" style={{ color: 'var(--muted)' }}>{peso(s.price)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="text-[11px]" style={{ color: 'var(--muted)' }}>While the deal is running, the discount is applied by the server to the selected packages and services at checkout.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2" style={{ borderTop: '1px solid var(--line)' }}>
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer" style={{ border: '1px solid var(--line)' }}>Cancel</button>
              <button disabled={saving} onClick={save} className="px-5 py-2 rounded-xl text-xs font-extrabold cursor-pointer disabled:opacity-50" style={{ background: 'var(--accent)', color: '#04170e' }}>{saving ? 'Saving…' : 'Save Deal'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
