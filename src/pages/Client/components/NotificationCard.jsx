import React from 'react';
import { Bell, CheckCircle, CreditCard, Megaphone } from 'lucide-react';

export default function NotificationCard() {
  const notifications = [
    { icon: CheckCircle, text: 'Reservation Approved', time: '2 hours ago', color: 'emerald' },
    { icon: CreditCard, text: 'Payment Received', time: '1 day ago', color: 'blue' },
    { icon: Megaphone, text: 'New Announcement', time: '3 days ago', color: 'amber' },
  ];

  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-600" />
          Notifications
        </h3>
        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold">
          3 New
        </span>
      </div>

      <div className="space-y-3">
        {notifications.map((notif, idx) => {
          const Icon = notif.icon;
          return (
            <div key={idx} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-all">
              <div className={`w-9 h-9 ${colorMap[notif.color]} rounded-lg flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-900">{notif.text}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{notif.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}