import React, { useState } from 'react';
import {
  Bell, Megaphone, Trash2, Send, Mail, ShieldAlert, Sparkles, Filter, CheckCircle2, AlertTriangle, Users, Flame, Clock, Radio
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';

export default function AnnouncementTable() {
  const { announcements, addAnnouncement, deleteAnnouncement, outboxEmails } = useDashboard();
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Users');
  const [priority, setPriority] = useState('Normal');
  const [activeFilter, setActiveFilter] = useState('all');

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    
    addAnnouncement({
      title,
      message,
      targetAudience,
      priority,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    });

    setTitle('');
    setMessage('');
    setPriority('Normal');
  };

  // Filter announcements
  const filteredAnnouncements = announcements.filter((a) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'clients') return (a.targetAudience || 'All Users').includes('Client') || (a.targetAudience || 'All Users').includes('All');
    if (activeFilter === 'staff') return (a.targetAudience || 'All Users').includes('Staff') || (a.targetAudience || 'All Users').includes('All');
    if (activeFilter === 'urgent') return (a.priority || '').toLowerCase().includes('urgent');
    return true;
  });

  return (
    <div className="space-y-6 text-white">
      
      {/* HEADER BANNER */}
      <div className="bg-[#071911] p-5 sm:p-6 rounded-2xl border border-emerald-500/20 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold shrink-0 shadow-lg">
            <Bell className="w-6 h-6 animate-pulse text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">ADMIN CONTROL CENTER</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-ping" /> Live Broadcasting
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
              Notifications & System Announcements Hub
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Publish announcements to Client Portal, dispatch staff alerts, and view system outbox logs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-stretch sm:self-auto">
          <div className="bg-emerald-950/80 px-4 py-2 rounded-xl border border-emerald-800 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-emerald-300">{announcements.length} Active Broadcasts</span>
          </div>
          <div className="bg-emerald-950/80 px-4 py-2 rounded-xl border border-emerald-800 flex items-center gap-2">
            <Mail className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-mono font-bold text-teal-300">{outboxEmails?.length || 0} Outbox Emails</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CREATE ANNOUNCEMENT FORM */}
        <div className="lg:col-span-1 bg-[#0c1f16] p-5 rounded-2xl border border-emerald-500/20 shadow-xl space-y-4 h-fit">
          <div className="flex items-center gap-2.5 pb-3 border-b border-emerald-900/60">
            <Megaphone className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-extrabold text-white text-sm">Create New Announcement</h3>
              <p className="text-[11px] text-slate-400">Publish notice to portal dashboards</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1">
                Announcement Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Summer Festival 2026 Promo"
                className="w-full bg-black/40 border border-emerald-900/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1">
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full bg-black/40 border border-emerald-900/60 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-emerald-400 font-bold"
                >
                  <option value="All Users">All Users</option>
                  <option value="Clients Only">Clients Portal Only</option>
                  <option value="Staff Only">Staff Members Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-black/40 border border-emerald-900/60 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-emerald-400 font-bold"
                >
                  <option value="Normal">Normal</option>
                  <option value="Important">Important Notice ⚠️</option>
                  <option value="Urgent">Urgent Broadcast 🔥</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1">
                Message Body *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write clear detailed message for resort guests or staff..."
                rows={4}
                className="w-full bg-black/40 border border-emerald-900/60 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400 font-medium resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-lg transition-all border border-emerald-300 uppercase tracking-wider"
            >
              <Send className="w-4 h-4" /> Broadcast Announcement
            </button>
          </form>
        </div>

        {/* BROADCASTS & NOTIFICATIONS FEED */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* FILTER TABS */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0c1f16] p-3 rounded-2xl border border-emerald-500/15 shadow-xl">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {[
                { id: 'all', label: 'All Notifications' },
                { id: 'clients', label: 'Client Broadcasts' },
                { id: 'staff', label: 'Staff System Alerts' },
                { id: 'urgent', label: 'Urgent 🔥' },
                { id: 'outbox', label: 'Outbox Emails' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    activeFilter === tab.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-emerald-950/60 text-slate-300 hover:text-white border border-emerald-900/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <span className="text-[10px] font-mono text-emerald-400 font-bold px-2.5 py-1 bg-black/40 rounded-lg border border-emerald-900">
              {activeFilter === 'outbox' ? `${outboxEmails?.length || 0} Emails` : `${filteredAnnouncements.length} Items`}
            </span>
          </div>

          {/* OUTBOX EMAILS VIEW */}
          {activeFilter === 'outbox' ? (
            <div className="space-y-3">
              {outboxEmails && outboxEmails.length > 0 ? (
                outboxEmails.map((email) => (
                  <div key={email.id} className="bg-[#0c1f16] border border-emerald-500/20 rounded-2xl p-4.5 shadow-xl space-y-2 hover:border-emerald-500/40 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400 block">SYSTEM DISPATCH EMAIL</span>
                          <h4 className="font-extrabold text-white text-xs">{email.subject}</h4>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                        {email.sentAt}
                      </span>
                    </div>

                    <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-xs text-slate-300 whitespace-pre-wrap font-mono">
                      <span className="text-slate-400 block text-[10px] font-sans font-bold mb-1">To: {email.recipient}</span>
                      {email.body}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#0c1f16] border border-emerald-500/20 rounded-2xl p-10 text-center text-slate-400 space-y-2">
                  <Mail className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold">No dispatched system outbox emails found.</p>
                </div>
              )}
            </div>
          ) : (
            /* ANNOUNCEMENTS CARDS LIST */
            <div className="space-y-3">
              {filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map((a) => {
                  const priorityLower = (a.priority || 'normal').toLowerCase();
                  const isUrgent = priorityLower.includes('urgent');
                  const isImportant = priorityLower.includes('important');

                  return (
                    <div
                      key={a.id}
                      className={`bg-[#0c1f16] border rounded-2xl p-4.5 shadow-xl space-y-3 transition-all hover:scale-[1.005] ${
                        isUrgent
                          ? 'border-rose-500/40 bg-rose-950/20'
                          : isImportant
                          ? 'border-amber-500/40 bg-amber-950/20'
                          : 'border-emerald-500/20'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                            isUrgent
                              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                              : isImportant
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          }`}>
                            {isUrgent ? <Flame className="w-5 h-5" /> : isImportant ? <AlertTriangle className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                                isUrgent
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : isImportant
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              }`}>
                                {a.priority || 'Normal'}
                              </span>

                              <span className="bg-black/40 text-slate-300 px-2 py-0.5 rounded-full text-[9px] font-bold border border-white/10 flex items-center gap-1">
                                <Users className="w-3 h-3 text-emerald-400" /> {a.targetAudience || 'All Users'}
                              </span>
                            </div>

                            <h4 className="font-extrabold text-white text-sm mt-1">{a.title}</h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" /> {a.date || 'Just now'}
                          </span>

                          <button
                            onClick={() => deleteAnnouncement(a.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/30 cursor-pointer"
                            title="Delete Announcement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5 font-medium">
                        {a.message || a.content}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="bg-[#0c1f16] border border-emerald-500/20 rounded-2xl p-10 text-center text-slate-400 space-y-2">
                  <Bell className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold">No announcements found for this filter category.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}