import React, { useState } from 'react';
import {
  Bell, CheckCircle2, Calendar, DollarSign, Receipt, Info, Tag, MessageSquare, AlertTriangle,
  ChevronLeft, ChevronRight, Filter, User, HelpCircle, BookOpen
} from 'lucide-react';

const CLIENT_NOTIFS = [
  { id: 1, title: 'Reservation Confirmed', desc: 'Your reservation for Duangon Cold Spring on May 25, 2024 has been confirmed.', time: '10:30 AM May 25, 2024', unread: true, icon: Calendar, color: 'text-emerald-400' },
  { id: 2, title: 'Payment Received', desc: 'We have received your payment of ₱3,600.00 for your reservation.', time: '10:32 AM May 25, 2024', unread: true, icon: DollarSign, color: 'text-emerald-400' },
  { id: 3, title: 'Receipt Available', desc: 'Your receipt for the payment on May 25, 2024 is now available for download.', time: '10:33 AM May 25, 2024', unread: true, icon: Receipt, color: 'text-emerald-400' },
  { id: 4, title: 'Upcoming Trip Reminder', desc: "Don't forget! Your trip to Duangon Cold Spring is tomorrow. We hope you have a great adventure!", time: 'Yesterday May 24, 2024', unread: true, icon: Bell, color: 'text-amber-400' },
  { id: 5, title: 'Promo: Summer Escape', desc: 'Get 15% off on your next adventure! Promo valid until June 15, 2024.', time: 'May 20, 2024 9:00 AM', unread: false, icon: Tag, color: 'text-rose-400' },
  { id: 6, title: 'New Destination Added', desc: 'Pangas Falls is now available in our travel guide. Check it out!', time: 'May 18, 2024 3:45 PM', unread: false, icon: Info, color: 'text-sky-400' },
  { id: 7, title: 'Maintenance Notice', desc: 'Our booking system will undergo scheduled maintenance on May 30, 2024 from 12:00 AM to 2:00 AM.', time: 'May 17, 2024 11:20 AM', unread: false, icon: AlertTriangle, color: 'text-amber-400' },
  { id: 8, title: 'Survey Invitation', desc: 'We value your feedback! Take our quick survey and help us improve your experience.', time: 'May 15, 2024 2:15 PM', unread: false, icon: MessageSquare, color: 'text-purple-400' },
];

export default function NotificationsTab() {
  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-white">
      
      {/* PAGE HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider block">Welcome back,</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            NOTIFICATIONS 🌿
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Stay updated with the latest announcements, reminders, and important information.
          </p>
        </div>
      </div>

      {/* 4 TOP STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">All Notifications</span>
              <p className="text-2xl font-bold text-white mt-0.5">24</p>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer">View all →</span>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Unread</span>
              <p className="text-2xl font-bold text-emerald-400 mt-0.5">3</p>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer">View unread →</span>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Announcements</span>
              <p className="text-2xl font-bold text-white mt-0.5">6</p>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer">View all →</span>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Reminders</span>
              <p className="text-2xl font-bold text-white mt-0.5">8</p>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer">View all →</span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* NOTIFICATIONS LIST (2 SPANS) */}
        <div className="lg:col-span-2 rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">ALL NOTIFICATIONS</h4>
            <div className="flex items-center gap-3 text-xs">
              <button className="text-emerald-400 font-bold hover:underline cursor-pointer">Mark all as read</button>
              <select className="bg-[#092217] border border-emerald-800/60 text-emerald-100 text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer">
                <option>All Types</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {CLIENT_NOTIFS.map((n) => {
              const IconComp = n.icon;
              return (
                <div key={n.id} className="flex items-center justify-between p-3.5 rounded-xl bg-[#04150e] border border-emerald-900/30 hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 ${n.color}`}>
                      <IconComp className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">{n.title}</h5>
                      <p className="text-[11px] text-slate-300 mt-0.5">{n.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                    {n.unread && <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-xs text-slate-400">
            <div>Showing 1 to 8 of 24 notifications</div>
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 rounded-lg bg-[#092217] border border-emerald-800/50 text-emerald-300"><ChevronLeft className="w-4 h-4" /></button>
              <button className="px-3 py-1 rounded-md font-bold bg-[#22c55e] text-white">1</button>
              <button className="px-3 py-1 rounded-md font-bold bg-[#092217] text-emerald-300">2</button>
              <button className="px-3 py-1 rounded-md font-bold bg-[#092217] text-emerald-300">3</button>
              <button className="p-1.5 rounded-lg bg-[#092217] border border-emerald-800/50 text-emerald-300"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: NOTIFICATION SUMMARY & PREFERENCES */}
        <div className="space-y-6">
          
          {/* NOTIFICATION SUMMARY */}
          <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl flex flex-col justify-between">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider border-b border-white/5 pb-3">NOTIFICATION SUMMARY</h4>
            <div className="flex flex-col items-center justify-center my-auto">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                  <circle cx="21" cy="21" r="15.9" fill="none" stroke="#4ade80" strokeWidth="8" strokeDasharray="12 88" strokeDashoffset="0" />
                  <circle cx="21" cy="21" r="15.9" fill="none" stroke="#fbbf24" strokeWidth="8" strokeDasharray="25 75" strokeDashoffset="-12" />
                  <circle cx="21" cy="21" r="15.9" fill="none" stroke="#38bdf8" strokeWidth="8" strokeDasharray="33 67" strokeDashoffset="-37" />
                  <circle cx="21" cy="21" r="15.9" fill="none" stroke="#94a3b8" strokeWidth="8" strokeDasharray="30 70" strokeDashoffset="-70" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold text-white">24</span>
                  <span className="text-[10px] text-slate-400">Total</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs w-full mt-4">
                <div className="flex justify-between"><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" /><span className="text-slate-300">Unread</span></div><span className="font-bold text-white">3 (12%)</span></div>
                <div className="flex justify-between"><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" /><span className="text-slate-300">Announcements</span></div><span className="font-bold text-white">6 (25%)</span></div>
                <div className="flex justify-between"><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" /><span className="text-slate-300">Reminders</span></div><span className="font-bold text-white">8 (33%)</span></div>
                <div className="flex justify-between"><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8]" /><span className="text-slate-300">Others</span></div><span className="font-bold text-white">7 (30%)</span></div>
              </div>
            </div>

            <button className="w-full py-2 bg-[#04150e] hover:bg-emerald-900/40 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-800/40 cursor-pointer">
              View All Notifications →
            </button>
          </div>

          {/* PREFERENCES */}
          <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-3 shadow-xl text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider border-b border-white/5 pb-3">PREFERENCES</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#04150e]">
                <div>
                  <h5 className="font-bold text-white text-xs">Email Notifications</h5>
                  <p className="text-[10px] text-slate-400">Enabled</p>
                </div>
                <span className="text-emerald-400 font-bold">›</span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#04150e]">
                <div>
                  <h5 className="font-bold text-white text-xs">SMS Notifications</h5>
                  <p className="text-[10px] text-slate-400">Enabled</p>
                </div>
                <span className="text-emerald-400 font-bold">›</span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#04150e]">
                <div>
                  <h5 className="font-bold text-white text-xs">Push Notifications</h5>
                  <p className="text-[10px] text-slate-400">Enabled</p>
                </div>
                <span className="text-emerald-400 font-bold">›</span>
              </div>
            </div>

            <button className="w-full py-2 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl cursor-pointer">
              Manage Preferences →
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
