import React, { useState } from 'react';
import {
  Bell, CheckCircle2, Calendar, Info, Megaphone, ShieldCheck, Clock,
  X, ExternalLink, ChevronRight, Eye, ChevronDown, ChevronUp
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';

// How many notifications to show before "See all notifications"
const PREVIEW_COUNT = 5;

// ── Format timestamp ──────────────────────────────────────────
const formatTime = (raw) => {
  if (!raw) return 'Today';
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return raw; }
};

export default function NotificationsTab() {
  const { announcements, currentUser, reservations } = useEcoTour() || {};
  const [filterType, setFilterType]     = useState('All');
  const [markedReadMap, setMarkedReadMap] = useState({});
  const [selectedNotif, setSelectedNotif] = useState(null); // ← full-message modal
  const [showAll, setShowAll] = useState(false);

  const clientEmail = currentUser?.email?.toLowerCase() || '';
  const clientReservations = (reservations || []).filter(
    (r) => r.email && r.email.toLowerCase() === clientEmail
  );

  // ── Build combined notifications list ─────────────────────
  const combinedNotifs = [
    ...(announcements || []).map((a, idx) => ({
      id:      `anc-${a.id || idx}`,
      title:   a.title || 'Resort Admin Announcement',
      desc:    a.content || a.message || 'Important update from resort management.',
      time:    a.date || a.created_at || 'Today',
      author:  a.author || a.posted_by || 'Admin & Staff Management',
      type:    'Announcement',
      icon:    Megaphone,
      color:   'text-emerald-400',
      badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-700/60',
      accentBorder: 'border-l-emerald-400',
    })),
    ...clientReservations.map((r, idx) => ({
      id:      `res-${r.id || idx}`,
      title:   `Reservation ${r.status || 'Updated'}`,
      desc:    `Your reservation for ${r.specificType || 'Duangon Cold Spring'} on ${r.reservationDate || 'an upcoming date'} is now ${r.status || 'Pending'}. Please arrive on time and present this notification at the Entrance POS cashier for payment processing.`,
      time:    r.reservationDate || 'Recent',
      author:  'System Notification',
      type:    'Booking',
      icon:    r.status === 'Approved' ? CheckCircle2 : Clock,
      color:   r.status === 'Approved' ? 'text-emerald-400' : 'text-amber-400',
      badgeBg: r.status === 'Approved'
        ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
        : 'bg-amber-950 text-amber-300 border-amber-700/60',
      accentBorder: r.status === 'Approved' ? 'border-l-emerald-400' : 'border-l-amber-400',
    })),
    {
      id:      'sys-01',
      title:   'Mandatory Walk-In Payment Policy',
      desc:    'All reservations and walk-ins are settled strictly in CASH upon arrival at the Duangon Cold Spring Entrance POS Cashier Counter. Online reservations guarantee your spot, but payment is made in cash before occupancy. Please prepare physical cash when checking in.',
      time:    'Official Policy',
      author:  'Admin Office',
      type:    'Policy',
      icon:    Info,
      color:   'text-sky-400',
      badgeBg: 'bg-sky-950 text-sky-300 border-sky-700/60',
      accentBorder: 'border-l-sky-400',
    },
  ];

  const filteredNotifs = combinedNotifs.filter((n) => {
    if (filterType === 'All')           return true;
    if (filterType === 'Announcements') return n.type === 'Announcement';
    if (filterType === 'Bookings')      return n.type === 'Booking';
    return true;
  });

  const visibleNotifs = showAll ? filteredNotifs : filteredNotifs.slice(0, PREVIEW_COUNT);
  const hiddenCount = filteredNotifs.length - visibleNotifs.length;

  const unreadCount = combinedNotifs.filter(n => !markedReadMap[n.id]).length;

  const markAllRead = () => {
    const map = {};
    combinedNotifs.forEach(n => { map[n.id] = true; });
    setMarkedReadMap(map);
  };

  const markOneRead = (id) => setMarkedReadMap(prev => ({ ...prev, [id]: true }));

  const openNotif = (n) => {
    setSelectedNotif(n);
    markOneRead(n.id);
  };

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-white">

      {/* PAGE HEADER */}
      <div className="flex items-center gap-3">
        <div className="relative w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <div>
          <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider block">
            Unified Management Broadcasts
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Notifications &amp; Announcements 🌿
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Click any notification to read the full message.
          </p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'All Notifications', value: combinedNotifs.length,      icon: Bell,        extra: 'Synced Live' },
          { label: 'Admin/Staff Posts', value: (announcements||[]).length,  icon: Megaphone,   extra: 'Broadcasts' },
          { label: 'Booking Alerts',    value: clientReservations.length,   icon: Calendar,    extra: 'My Bookings' },
          { label: 'Unread',            value: unreadCount,                 icon: ShieldCheck, extra: unreadCount > 0 ? 'Action Required' : 'All Read ✓', valueColor: unreadCount > 0 ? 'text-rose-400' : 'text-emerald-400' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3.5 shadow-lg justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{card.label}</span>
                  <p className={`text-2xl font-black mt-0.5 ${card.valueColor || 'text-white'}`}>{card.value}</p>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-bold text-right">{card.extra}</span>
            </div>
          );
        })}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* NOTIFICATIONS LIST */}
        <div className="lg:col-span-2 rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/5 pb-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-emerald-400" /> Notification Center
            </h4>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={markAllRead}
                className="text-emerald-400 font-bold hover:text-emerald-300 underline cursor-pointer transition-colors"
              >
                Mark all read
              </button>
              <select
                value={filterType}
                onChange={e => { setFilterType(e.target.value); setShowAll(false); }}
                className="bg-[#092217] border border-emerald-800/60 text-emerald-100 text-xs rounded-xl px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Announcements">Admin &amp; Staff Posts</option>
                <option value="Bookings">Booking Status Updates</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredNotifs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No notifications or broadcasts available at this time.
              </p>
            ) : (
              visibleNotifs.map((n) => {
                const IconComp = n.icon;
                const isRead  = markedReadMap[n.id];
                // Truncate desc to 120 chars for preview
                const preview = n.desc.length > 120 ? n.desc.slice(0, 120) + '…' : n.desc;

                return (
                  <button
                    key={n.id}
                    onClick={() => openNotif(n)}
                    className={`w-full text-left flex items-start justify-between p-4 rounded-xl border
                      border-l-4 transition-all cursor-pointer group
                      ${isRead
                        ? 'bg-[#04150e]/50 border-emerald-900/20 opacity-75 hover:opacity-100'
                        : 'bg-[#04150e] border-emerald-900/40 hover:border-emerald-500/50 hover:bg-[#061f13]'
                      } ${n.accentBorder || 'border-l-emerald-400'}`}
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 ${n.color}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="text-xs font-extrabold text-white">{n.title}</h5>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${n.badgeBg}`}>
                            {n.type}
                          </span>
                          {!isRead && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold border border-rose-500/30">
                              NEW
                            </span>
                          )}
                        </div>
                        {/* Preview text — truncated */}
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{preview}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-emerald-400 font-bold">Posted by: {n.author}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{formatTime(n.time)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right arrow — click indicator */}
                    <div className="flex flex-col items-center gap-2 ml-3 shrink-0">
                      {!isRead && <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />}
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors mt-1" />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* SEE ALL / SHOW LESS */}
          {filteredNotifs.length > PREVIEW_COUNT && (
            <button
              onClick={() => setShowAll(v => !v)}
              className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            >
              {showAll
                ? <><ChevronUp className="w-4 h-4" /> Show fewer notifications</>
                : <><ChevronDown className="w-4 h-4" /> See all notifications ({hiddenCount} more)</>}
            </button>
          )}
        </div>

        {/* RIGHT SIDEBAR INFO */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider border-b border-white/5 pb-3">
              Management Broadcast Channel
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#04150e] border border-emerald-900/40 space-y-1">
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block">
                  Unified Staff Broadcast
                </span>
                <p className="text-slate-300">
                  Announcements created by Admin or Staff in the management portal are automatically published to all client dashboards simultaneously.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#04150e] border border-emerald-900/40 space-y-1">
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block">
                  Real-Time Booking Status Sync
                </span>
                <p className="text-slate-300">
                  When staff approve or confirm your reservation, your notification feed automatically updates in real-time.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#04150e] border border-emerald-900/40 space-y-1">
                <span className="text-[10px] text-sky-400 font-extrabold uppercase tracking-wider block flex items-center gap-1">
                  <Eye className="w-3 h-3" /> How to Read Full Message
                </span>
                <p className="text-slate-300">
                  Click on any notification card to open the full message in a pop-up details panel.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── FULL MESSAGE MODAL ──────────────────────────────── */}
      {selectedNotif && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedNotif(null)}
        >
          <div
            className="bg-[#051c14] border border-emerald-700/50 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
            style={{ animation: 'fadeInUp 0.2s ease' }}
          >
            {/* Modal header */}
            <div className={`p-5 border-b border-emerald-900/60 border-l-4 ${selectedNotif.accentBorder || 'border-l-emerald-400'} flex items-start justify-between gap-3`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 ${selectedNotif.color}`}>
                  {React.createElement(selectedNotif.icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-extrabold text-white text-sm">{selectedNotif.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${selectedNotif.badgeBg}`}>
                      {selectedNotif.type}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {formatTime(selectedNotif.time)} &nbsp;·&nbsp; Posted by: <span className="text-emerald-400 font-bold">{selectedNotif.author}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotif(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body — full message */}
            <div className="p-5 space-y-4">
              <div className="bg-[#04150e] border border-emerald-900/50 rounded-xl p-4">
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {selectedNotif.desc}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>EcoTourVista · Duangon Cold Spring Resort</span>
                <span className="font-mono">{formatTime(selectedNotif.time)}</span>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-5 pb-5">
              <button
                onClick={() => setSelectedNotif(null)}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-lg"
              >
                Close Notification
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
