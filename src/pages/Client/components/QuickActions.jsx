import React from 'react';
import { Calendar, MapPin, Package, User } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    { label: 'Book Now', icon: Calendar, color: 'emerald', desc: 'Reserve services' },
    { label: 'Tourist Spots', icon: MapPin, color: 'blue', desc: 'Explore locations' },
    { label: 'Services', icon: Package, color: 'amber', desc: 'View catalog' },
    { label: 'My Profile', icon: User, color: 'purple', desc: 'Edit details' },
  ];

  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    amber: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
    purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              className={`${colorMap[action.color]} p-4 rounded-xl text-xs font-bold transition-all cursor-pointer space-y-2`}
            >
              <Icon className="w-5 h-5 mx-auto" />
              <p>{action.label}</p>
              <p className="text-[10px] font-normal opacity-70">{action.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}