import React from 'react';

const data = [
  { label: 'Client', count: 186, pct: 72.7, color: '#4ade80' },
  { label: 'Staff', count: 48, pct: 18.8, color: '#60a5fa' },
  { label: 'Admin', count: 8, pct: 3.1, color: '#c084fc' },
  { label: 'Inactive', count: 14, pct: 5.3, color: '#64748b' },
];

export default function RoleDistribution() {
  const R = 15.9155; // circumference = 100
  let start = 0;

  return (
    <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold">User Role Distribution</h3>
        <button className="text-xs text-slate-300 border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/5 cursor-pointer">View Report</button>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-44 h-44 shrink-0">
          <svg viewBox="0 0 42 42" className="w-full h-full">
            {data.map((s) => {
              const el = (
                <circle
                  key={s.label}
                  cx="21" cy="21" r={R} fill="none"
                  stroke={s.color} strokeWidth="9"
                  strokeDasharray={`${s.pct} ${100 - s.pct}`}
                  transform={`rotate(${start * 3.6 - 90} 21 21)`}
                />
              );
              start += s.pct;
              return el;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">256</span>
            <span className="text-xs text-slate-400">Total Users</span>
          </div>
        </div>
        <div className="flex-1 w-full divide-y divide-white/5">
          {data.map((s) => (
            <div key={s.label} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-sm text-slate-300">{s.label}</span>
              </div>
              <span className="text-sm text-slate-400">{s.count} ({s.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
