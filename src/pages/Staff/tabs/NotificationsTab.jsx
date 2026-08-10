import React, { useState, useEffect } from 'react';
import {
  Bell, Calendar, RefreshCw, Coins, Settings as SettingsIcon, Filter, CheckCircle2,
  ChevronLeft, ChevronRight, UserPlus, Shield, User, HelpCircle, BookOpen
} from 'lucide-react';

const NOTIFS = [
  { id: 1, type: 'new', title: 'New Reservation Received', desc: 'Maria Santos reserved Entrance & Swimming on May 26, 2024 at 10:00 AM.', badge: 'New', badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-800', time: '2 mins ago', icon: Calendar },
  { id: 2, type: 'updates', title: 'Reservation Update', desc: 'John Dela Cruz updated the booking for Cottage Rental on May 25, 2024.', badge: 'Update', badgeColor: 'bg-sky-950 text-sky-400 border-sky-800', time: '15 mins ago', icon: RefreshCw },
  { id: 3, type: 'payments', title: 'Payment Received', desc: 'Payment of ₱2,500.00 for Cottage Rental (RCPT-0091) has been received.', badge: 'Payment', badgeColor: 'bg-amber-950 text-amber-400 border-amber-800', time: '25 mins ago', icon: Coins },
  { id: 4, type: 'payments', title: 'Payment Pending', desc: 'Payment of ₱1,000.00 for Rooms / Kubo (RCPT-0092) is still pending.', badge: 'Payment', badgeColor: 'bg-amber-950 text-amber-400 border-amber-800', time: '1 hour ago', icon: Coins },
  { id: 5, type: 'new', title: 'Reservation Confirmed', desc: 'Reservation for Table Rental on May 26, 2024 has been confirmed.', badge: 'Confirmed', badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-800', time: '2 hours ago', icon: CheckCircle2 },
  { id: 6, type: 'updates', title: 'Reservation Cancelled', desc: 'Reservation for Parking (Car) on May 25, 2024 has been cancelled.', badge: 'Cancelled', badgeColor: 'bg-rose-950 text-rose-400 border-rose-800', time: '3 hours ago', icon: Calendar },
  { id: 7, type: 'system', title: 'System Maintenance', desc: 'Scheduled system maintenance on May 27, 2024 from 12:00 AM to 2:00 AM.', badge: 'System', badgeColor: 'bg-purple-950 text-purple-400 border-purple-800', time: '5 hours ago', icon: SettingsIcon },
  { id: 8, type: 'new', title: 'New Walk-in Visitor', desc: 'Alex Reyes walked in with 5 adults for Entrance & Swimming.', badge: 'New', badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-800', time: '6 hours ago', icon: UserPlus },
];

export default function NotificationsTab({ activeTab: externalTab }) {
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (externalTab === 'notifications_updates') setActiveTab('updates');
    else if (externalTab === 'notifications_payments') setActiveTab('payments');
    else if (externalTab === 'notifications_system') setActiveTab('system');
    else if (externalTab === 'notifications_new') setActiveTab('new');
    else setActiveTab('all');
  }, [externalTab]);

  const filteredNotifs = NOTIFS.filter((n) => {
    if (activeTab === 'all') return true;
    return n.type === activeTab;
  });

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-white">
      
      {/* PAGE HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Notifications
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Stay updated with the latest reservations, payments, and system notifications.
          </p>
        </div>
      </div>

      {/* 4 TOP STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab('new')}
          className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg justify-between cursor-pointer hover:border-emerald-500/40 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">NEW RESERVATIONS</span>
              <p className="text-2xl font-bold text-white mt-0.5">3</p>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-bold">View →</span>
        </div>

        <div 
          onClick={() => setActiveTab('updates')}
          className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg justify-between cursor-pointer hover:border-emerald-500/40 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-500/15 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">RESERVATION UPDATES</span>
              <p className="text-2xl font-bold text-white mt-0.5">2</p>
            </div>
          </div>
          <span className="text-xs text-sky-400 font-bold">View →</span>
        </div>

        <div 
          onClick={() => setActiveTab('payments')}
          className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg justify-between cursor-pointer hover:border-emerald-500/40 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">PAYMENT NOTIFICATIONS</span>
              <p className="text-2xl font-bold text-white mt-0.5">2</p>
            </div>
          </div>
          <span className="text-xs text-amber-400 font-bold">View →</span>
        </div>

        <div 
          onClick={() => setActiveTab('system')}
          className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg justify-between cursor-pointer hover:border-emerald-500/40 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/15 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">SYSTEM ALERTS</span>
              <p className="text-2xl font-bold text-white mt-0.5">1</p>
            </div>
          </div>
          <span className="text-xs text-purple-400 font-bold">View →</span>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
        
        {/* TABS HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-emerald-900/40">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Notifications' },
              { id: 'new', label: 'New Reservations' },
              { id: 'updates', label: 'Reservation Updates' },
              { id: 'payments', label: 'Payment Notifications' },
              { id: 'system', label: 'System Notifications' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#22c55e] text-white shadow-md shadow-emerald-950/60'
                    : 'bg-[#092217]/80 text-emerald-200/80 hover:bg-emerald-900/40 border border-emerald-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* NOTIFICATIONS LIST */}
        <div className="space-y-3">
          {filteredNotifs.length > 0 ? (
            filteredNotifs.map((n) => {
              const IconComponent = n.icon;
              return (
                <div key={n.id} className="flex items-center justify-between p-4 rounded-xl bg-[#04150e] border border-emerald-900/40 hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">{n.title}</h5>
                      <p className="text-[11px] text-slate-300 mt-0.5">{n.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`px-3 py-1 border text-[10px] font-bold rounded-full ${n.badgeColor}`}>
                      {n.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              No notifications found in this category.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
