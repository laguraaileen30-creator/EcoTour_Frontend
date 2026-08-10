import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function StatCard({ title, value, trend, trendUp, icon }) {
  return (
    <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 flex items-start gap-4 shadow-lg shadow-emerald-950/40">
      <div className="w-11 h-11 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-widest text-slate-300 uppercase">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        <p className={`text-[11px] mt-1 flex items-center gap-1 ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {trend} <span className="text-slate-500">vs last month</span>
        </p>
      </div>
    </div>
  );
}