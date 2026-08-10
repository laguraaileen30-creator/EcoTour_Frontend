import React from 'react';

export default function GlassBadge({ status = 'approved', children, className = '' }) {
  const norm = String(status).toLowerCase();
  
  const styles = {
    approved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    confirmed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    paid: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    pending: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    rejected: 'bg-red-500/20 text-red-300 border-red-500/40',
    suspended: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${
        styles[norm] || 'bg-slate-800 text-slate-300 border-slate-700'
      } ${className}`}
    >
      {children || status}
    </span>
  );
}
