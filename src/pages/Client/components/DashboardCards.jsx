import React from 'react';
import { Calendar, Coins, CheckCircle2, Clock } from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';

export default function DashboardCards() {
  const { resortBookings, currentUser } = useEcoTour();

  const userBookings = resortBookings.filter(b => 
    b.clientEmail?.toLowerCase() === currentUser?.email?.toLowerCase() ||
    b.clientName?.toLowerCase() === currentUser?.name?.toLowerCase()
  );

  const activeBookings = userBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
  const totalSpent = userBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const pendingApprovals = userBookings.filter(b => b.status === 'pending').length;

  const cards = [
    { title: 'Active Reservations', value: activeBookings, icon: Calendar, color: 'bg-emerald-500', label: 'Cottages & Services' },
    { title: 'Total Investment', value: `₱ ${totalSpent.toLocaleString()}`, icon: Coins, color: 'bg-blue-500', label: 'Resort Experiences' },
    { title: 'Pending Approval', value: pendingApprovals, icon: Clock, color: 'bg-amber-500', label: 'Awaiting Staff Review' },
    { title: 'Account Status', value: currentUser?.status === 'approved' ? 'Approved' : 'Pending', icon: CheckCircle2, color: 'bg-teal-500', label: 'Verified EcoTour Member' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">{c.title}</p>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">{c.value}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{c.label}</p>
            </div>
            <div className={`p-3 rounded-xl text-white ${c.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}