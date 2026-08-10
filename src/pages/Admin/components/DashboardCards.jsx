import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { formatCurrency, todayStr, calculateShares } from '../utils/dashboardHelpers';

export default function DashboardCards() {
  const { receipts, facilities, staffList, revenueShare, currentOccupancy } = useDashboard();
  const today = todayStr();
  
  const todayIncome = receipts
    .filter((r) => r.date === today && r.status === 'Paid')
    .reduce((s, r) => s + (r.grandTotal || 0), 0);
    
  const shares = calculateShares(todayIncome, revenueShare);
  const avail = facilities.filter((f) => f.status === 'Available').length;
  
  const present = staffList.filter((s) => 
    s.attendanceHistory && s.attendanceHistory.some((a) => a.date === today)
  ).length;

  const cards = [
    { label: "Today's Visitors", value: `${currentOccupancy} pax` },
    { label: "Today's Income", value: formatCurrency(todayIncome), cls: 'text-emerald-700' },
    { label: 'Owner Share (70%)', value: formatCurrency(shares.owner), cls: 'text-emerald-900' },
    { label: 'Facilities Available', value: avail, cls: 'text-emerald-600' },
    { label: 'Staff Present', value: `${present} / ${staffList.length}` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((c, i) => (
        <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase">{c.label}</span>
          <div className={`text-xl font-extrabold mt-1 ${c.cls || 'text-slate-900'}`}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}