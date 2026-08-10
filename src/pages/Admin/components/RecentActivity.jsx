import React from 'react';
import { useDashboard } from '../hooks/useDashboard';

export default function RecentActivity() {
  const { auditLogs = [] } = useDashboard();
  const safeLogs = auditLogs || [];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
      <h4 className="font-bold text-slate-800 text-sm">Recent Activity</h4>
      <div className="space-y-2">
        {safeLogs.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No recent system activity logs.</p>
        ) : (
          safeLogs.map((log) => (
            <div key={log.id || Math.random()} className="flex justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-800">{log.action} — <span className="text-slate-500 font-normal">{log.details}</span></span>
              <span className="text-slate-400 font-mono text-[10px]">{log.timestamp}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}