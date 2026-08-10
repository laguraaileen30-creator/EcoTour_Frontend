import React from 'react';

export default function GlassInput({
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-semibold text-emerald-300/90 tracking-wide uppercase">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-slate-900/90 border border-emerald-500/30 text-emerald-100 text-xs rounded-xl px-3.5 py-2.5 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 outline-none transition-all placeholder:text-emerald-300/40 ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-red-400 font-medium">{error}</p>}
    </div>
  );
}
