import React, { useState, useEffect } from 'react';

export default function RoleDistribution() {
  const [distribution, setDistribution] = useState([
    { label: 'Client', count: 6, pct: 54.5, color: '#4ade80' },
    { label: 'Staff', count: 3, pct: 27.3, color: '#60a5fa' },
    { label: 'Admin', count: 2, pct: 18.2, color: '#c084fc' },
  ]);
  const [totalCount, setTotalCount] = useState(11);

  const fetchDistribution = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        const users = data.users;
        const total = users.length || 1;
        setTotalCount(users.length);

        const clients = users.filter(u => (u.role || '').toLowerCase() === 'client').length;
        const staff = users.filter(u => (u.role || '').toLowerCase() === 'staff').length;
        const admin = users.filter(u => (u.role || '').toLowerCase() === 'admin').length;
        const inactive = users.filter(u => (u.status || '').toLowerCase() === 'suspended' || (u.status || '').toLowerCase() === 'rejected').length;

        const computed = [
          { label: 'Client', count: clients, pct: Math.round((clients / total) * 1000) / 10, color: '#4ade80' },
          { label: 'Staff', count: staff, pct: Math.round((staff / total) * 1000) / 10, color: '#60a5fa' },
          { label: 'Admin', count: admin, pct: Math.round((admin / total) * 1000) / 10, color: '#c084fc' },
        ];

        if (inactive > 0) {
          computed.push({ label: 'Inactive/Rejected', count: inactive, pct: Math.round((inactive / total) * 1000) / 10, color: '#64748b' });
        }

        setDistribution(computed);
      }
    } catch (e) {
      console.warn('RoleDistribution fetch error:', e.message);
    }
  };

  useEffect(() => {
    fetchDistribution();
  }, []);

  const R = 15.9155; // circumference = 100
  let start = 0;

  return (
    <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold">User Role Distribution</h3>
        <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">Live DB Sync</span>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-44 h-44 shrink-0">
          <svg viewBox="0 0 42 42" className="w-full h-full">
            {distribution.map((s) => {
              const el = (
                <circle
                  key={s.label}
                  cx="21" cy="21" r={R} fill="none"
                  stroke={s.color} strokeWidth="9"
                  strokeDasharray={`${s.pct} ${Math.max(0, 100 - s.pct)}`}
                  transform={`rotate(${start * 3.6 - 90} 21 21)`}
                />
              );
              start += s.pct;
              return el;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{totalCount}</span>
            <span className="text-xs text-slate-400">Total Users</span>
          </div>
        </div>
        <div className="flex-1 w-full divide-y divide-white/5">
          {distribution.map((s) => (
            <div key={s.label} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-sm text-slate-300">{s.label}</span>
              </div>
              <span className="text-sm text-slate-400 font-bold">{s.count} ({s.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
