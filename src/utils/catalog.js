// Shared helpers for the database-driven service / package / deal catalog.
export const API_ORIGIN = 'http://localhost:5000';
export const API_BASE = `${API_ORIGIN}/api/v1`;

export const authHeaders = (extra = {}) => {
  let token = null;
  try { token = localStorage.getItem('token'); } catch (e) { /* storage unavailable */ }
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
};

export const apiJson = async (path, { method = 'GET', body, auth = false } = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: auth ? authHeaders(body !== undefined ? { 'Content-Type': 'application/json' } : {}) : (body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    const err = new Error(data.message || `Request failed (HTTP ${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

// All bundled service / package images live in src/assets/images/services
const SERVICE_IMAGES = import.meta.glob('../assets/images/services/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' });
const IMAGES_BY_FILE = Object.fromEntries(
  Object.entries(SERVICE_IMAGES).map(([path, url]) => [decodeURIComponent(path.split('/').pop()).toLowerCase(), url])
);

export const bundledImage = (fileName) => IMAGES_BY_FILE[String(fileName || '').toLowerCase()] || null;

// Resolve an image_url stored in the database to something the browser can load
export const resolveImage = (url, fallback = 'cottage.png') => {
  if (!url) return bundledImage(fallback);
  const u = String(url);
  if (u.startsWith('data:') || u.startsWith('blob:') || /^https?:\/\//.test(u)) return u;
  if (u.startsWith('/uploads/')) return `${API_ORIGIN}${u}`;
  const file = decodeURIComponent(u.split('/').pop());
  return bundledImage(file) || (u.startsWith('/assets/') ? u : bundledImage(fallback));
};

// ── Availability statuses (same labels on every screen) ──
export const STATUS_META = {
  AVAILABLE: { label: 'Available', color: '#22c55e', bg: 'rgba(34,197,94,0.14)', border: 'rgba(34,197,94,0.45)' },
  LOW_STOCK: { label: 'Low Stock', color: '#f59e0b', bg: 'rgba(245,158,11,0.14)', border: 'rgba(245,158,11,0.45)' },
  ALMOST_FULL: { label: 'Almost Full', color: '#f59e0b', bg: 'rgba(245,158,11,0.14)', border: 'rgba(245,158,11,0.45)' },
  FULLY_BOOKED: { label: 'Fully Booked', color: '#ef4444', bg: 'rgba(239,68,68,0.14)', border: 'rgba(239,68,68,0.45)' },
  OUT_OF_STOCK: { label: 'Out of Stock', color: '#f43f5e', bg: 'rgba(244,63,94,0.14)', border: 'rgba(244,63,94,0.45)' },
  UNAVAILABLE: { label: 'Unavailable', color: '#94a3b8', bg: 'rgba(148,163,184,0.16)', border: 'rgba(148,163,184,0.45)' },
  MAINTENANCE: { label: 'Maintenance', color: '#a78bfa', bg: 'rgba(167,139,250,0.14)', border: 'rgba(167,139,250,0.45)' },
  INACTIVE: { label: 'Inactive', color: '#64748b', bg: 'rgba(100,116,139,0.16)', border: 'rgba(100,116,139,0.45)' },
};

export const BOOKABLE_STATUSES = ['AVAILABLE', 'LOW_STOCK', 'ALMOST_FULL'];
export const isBookable = (status) => !status || BOOKABLE_STATUSES.includes(status);

export const statusMessage = (status, name, date) => {
  const when = date ? ` for ${date}` : '';
  switch (status) {
    case 'FULLY_BOOKED': return `Sorry! ${name} is already fully booked${when}. Please select another service or another date.`;
    case 'OUT_OF_STOCK': return `${name} is out of stock and cannot be reserved right now.`;
    case 'MAINTENANCE': return `${name} is under maintenance${when}.`;
    case 'UNAVAILABLE':
    case 'INACTIVE': return `${name} is currently unavailable.`;
    default: return '';
  }
};

export const PRICE_UNITS = [
  { value: 'head', label: 'Per Person' },
  { value: 'day', label: 'Per Day' },
  { value: 'night', label: 'Per Night' },
  { value: 'hour', label: 'Per Hour' },
  { value: 'item', label: 'Per Item' },
  { value: 'vehicle', label: 'Per Vehicle' },
  { value: 'event', label: 'Per Event' },
  { value: 'fixed', label: 'Fixed Price' },
];

export const unitLabel = (unit) => {
  const u = PRICE_UNITS.find((p) => p.value === unit);
  if (u) return u.value === 'fixed' ? '' : `/ ${u.label.replace('Per ', '').toLowerCase()}`;
  return unit ? `/ ${unit}` : '';
};

export const peso = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { maximumFractionDigits: 2 })}`;
