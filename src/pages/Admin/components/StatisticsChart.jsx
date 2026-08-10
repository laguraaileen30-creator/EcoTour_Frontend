import React from 'react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const data = [
  { day: 'Mon', sales: 12400, barangay: 2480, owner: 8680 },
  { day: 'Tue', sales: 15100, barangay: 3020, owner: 10570 },
  { day: 'Wed', sales: 9800, barangay: 1960, owner: 6860 },
  { day: 'Thu', sales: 18450, barangay: 3690, owner: 12915 },
];

export default function StatisticsChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h4 className="font-bold text-slate-800 text-sm mb-3">Weekly Gross Sales Trend</h4>
        <div className="h-64">
          <ResponsiveContainer>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" style={{ fontSize: 11 }} />
              <YAxis style={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="sales" stroke="#059669" fill="#d1fae5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h4 className="font-bold text-slate-800 text-sm mb-3">Revenue Share Breakdown</h4>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" style={{ fontSize: 11 }} />
              <YAxis style={{ fontSize: 11 }} />
              <Tooltip />
              <Legend style={{ fontSize: 11 }} />
              <Bar dataKey="owner" fill="#059669" name="Owner" />
              <Bar dataKey="barangay" fill="#d97706" name="Barangay" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}