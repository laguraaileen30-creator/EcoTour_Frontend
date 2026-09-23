import React from 'react';
import { peso } from '../utils/catalog';

const BOOKING_TYPE_LABEL = {
  PACKAGE_ONLY: 'Package Only',
  PACKAGE_WITH_TICKETS: 'Package + Tickets',
  PACKAGE_WITH_ADDONS: 'Package + Add-ons',
  PACKAGE_WITH_TICKETS_AND_ADDONS: 'Package + Tickets + Add-ons',
  TICKETS_ONLY: 'Tickets Only',
  TICKETS_WITH_ADDONS: 'Tickets + Add-ons',
  ADDONS_ONLY: 'Services Only',
};

// Older bookings have no item_type — infer it from the line name
const typeOf = (it, packageName) => {
  if (it.itemType) return it.itemType;
  const n = String(it.name || it.serviceName || '').toLowerCase();
  if ((it.category || '').toLowerCase() === 'package' || (packageName && n === String(packageName).toLowerCase())) return 'PACKAGE';
  if (n.includes('environmental fee')) return 'FEE';
  if (n.includes('entrance')) return 'TICKET';
  return 'ADDON';
};

// PACKAGE / TICKETS / ADD-ONS summary of exactly what the client purchased
export default function BookingBreakdown({ booking, compact = false }) {
  const items = Array.isArray(booking?.items) ? booking.items : [];
  const groups = { PACKAGE: [], TICKET: [], ADDON: [] };
  items.forEach((it) => {
    const t = typeOf(it, booking.packageName);
    (t === 'FEE' ? groups.TICKET : groups[t] || groups.ADDON).push(it);
  });
  const total = parseFloat(booking?.estimatedTotal || booking?.grandTotal || booking?.totalPrice || 0);
  const line = (it, i) => {
    const qty = parseInt(it.quantity || 1, 10);
    const unit = parseFloat(it.unitPrice ?? it.price ?? 0);
    return (
      <div key={i} className="flex justify-between gap-2">
        <span>{it.name || it.serviceName}{qty > 1 ? ` × ${qty}` : ''}</span>
        <strong className="font-mono" style={{ color: 'var(--accent)' }}>{peso(it.subtotal ?? unit * qty)}</strong>
      </div>
    );
  };

  return (
    <div className={`space-y-2 ${compact ? 'text-[11px]' : 'text-xs'}`} style={{ color: 'var(--text)' }}>
      {booking?.bookingType && (
        <div className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
          Booking Type: <span style={{ color: 'var(--accent)' }}>{BOOKING_TYPE_LABEL[booking.bookingType] || booking.bookingType}</span>
        </div>
      )}
      {[['PACKAGE', 'Package'], ['TICKET', 'Entrance Tickets'], ['ADDON', 'Add-ons']].map(([k, label]) => (
        <div key={k}>
          <span className="text-[10px] font-extrabold uppercase tracking-wider block" style={{ color: 'var(--muted)' }}>{label}</span>
          {groups[k].length === 0 ? <div style={{ color: 'var(--muted)' }}>None</div> : groups[k].map(line)}
        </div>
      ))}
      {Array.isArray(booking?.assignedFacilities) && booking.assignedFacilities.length > 0 && (
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider block" style={{ color: 'var(--muted)' }}>Assigned Facilities</span>
          <div style={{ color: '#38bdf8' }}>📍 {booking.assignedFacilities.map((f) => f.facilityName).join(', ')}</div>
        </div>
      )}
      <div className="flex justify-between pt-2 font-black text-sm" style={{ borderTop: '1px solid var(--line)' }}>
        <span>TOTAL</span><span className="font-mono" style={{ color: 'var(--accent)' }}>{peso(total)}</span>
      </div>
    </div>
  );
}
