import React from 'react';
import { STATUS_META } from '../utils/catalog';

// One availability badge for every screen: ● AVAILABLE / LOW STOCK / FULLY BOOKED / OUT OF STOCK / ...
export default function StatusBadge({ status, size = 'sm', suffix = null, className = '' }) {
  const meta = STATUS_META[status] || STATUS_META.AVAILABLE;
  const pad = size === 'xs' ? 'px-1.5 py-0.5 text-[9px]' : size === 'md' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-extrabold uppercase tracking-wider whitespace-nowrap ${pad} ${className}`}
      style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.label}
      {suffix !== null && suffix !== undefined && <span className="font-mono normal-case tracking-normal opacity-90">· {suffix}</span>}
    </span>
  );
}
