import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, X, Calendar, User, Trees, Shield, Coins, Megaphone } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import ThemeToggle from '../../../components/ThemeToggle';
import NotificationBell from '../../../components/NotificationBell';

export default function Header() {
  const { 
    activeTab, setActiveTab, 
    searchQuery, setSearchQuery, 
    resortBookings = [], userAccounts = [], 
    resortServices = [], staffList = [],
    receipts = [], announcements = []
  } = useDashboard();

  const [isFocused, setIsFocused] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const dropdownRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const query = (searchQuery || '').trim().toLowerCase();

  // Filter matching items dynamically
  const matchingBookings = query ? resortBookings.filter(b => 
    (b.clientName || b.client_name || b.fullName || b.touristName || '').toLowerCase().includes(query) ||
    (b.bookingRef || b.bookingNumber || b.booking_number || b.id || '').toString().toLowerCase().includes(query) ||
    (b.serviceName || b.packageName || '').toLowerCase().includes(query)
  ).slice(0, 3) : [];

  const matchingUsers = query ? userAccounts.filter(u =>
    (u.name || u.fname || u.lname || u.username || '').toLowerCase().includes(query) ||
    (u.email || '').toLowerCase().includes(query) ||
    (u.user_number || u.client_no || '').toLowerCase().includes(query)
  ).slice(0, 3) : [];

  const matchingServices = query ? resortServices.filter(s =>
    (s.service_name || s.serviceName || s.name || '').toLowerCase().includes(query) ||
    (s.service_code || '').toLowerCase().includes(query) ||
    (s.category || '').toLowerCase().includes(query)
  ).slice(0, 3) : [];

  const matchingStaff = query ? staffList.filter(st =>
    (st.name || st.fname || st.lname || '').toLowerCase().includes(query) ||
    (st.role || st.position || '').toLowerCase().includes(query) ||
    (st.email || '').toLowerCase().includes(query)
  ).slice(0, 3) : [];

  const matchingReceipts = query ? receipts.filter(r =>
    (r.receiptNo || r.payment_ref || r.id || '').toString().toLowerCase().includes(query) ||
    (r.touristName || r.client_name || r.clientName || '').toLowerCase().includes(query)
  ).slice(0, 3) : [];

  const matchingAnnouncements = query ? announcements.filter(a =>
    (a.title || '').toLowerCase().includes(query) ||
    (a.description || a.message || a.content || '').toLowerCase().includes(query)
  ).slice(0, 3) : [];

  const hasResults = query.length > 0 && (
    matchingBookings.length > 0 || 
    matchingUsers.length > 0 || 
    matchingServices.length > 0 || 
    matchingStaff.length > 0 ||
    matchingReceipts.length > 0 ||
    matchingAnnouncements.length > 0
  );

  const handleResultClick = (targetTab) => {
    if (setActiveTab) setActiveTab(targetTab);
    setIsFocused(false);
  };

  return (
    <header className="etv-header relative z-40">
      {/* SEARCH BAR CONTAINER */}
      <div className="relative flex-1 max-w-[460px] z-50" ref={dropdownRef}>
        <div className="etv-search w-full flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-emerald-500/20 bg-emerald-950/20 transition-all focus-within:border-emerald-500 focus-within:bg-emerald-950/40">
          <Search size={16} className="text-emerald-400 shrink-0" />
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => {
              if (setSearchQuery) setSearchQuery(e.target.value);
              setIsFocused(true);
            }}
            onFocus={() => setIsFocused(true)}
            placeholder="Search reservations, users, services, staff, receipts..."
            className="w-full bg-transparent border-none outline-none text-xs text-emerald-100 placeholder:text-emerald-400/60"
          />
          {searchQuery && (
            <button 
              onClick={() => { if (setSearchQuery) setSearchQuery(''); setIsFocused(false); }}
              className="text-emerald-400/70 hover:text-emerald-300 transition-colors p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* LIVE SEARCH RESULTS DROPDOWN */}
        {isFocused && query.length > 0 && (
          <div className="search-dropdown-results absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl overflow-hidden z-50 p-3 space-y-3 max-h-[380px] overflow-y-auto">
            {hasResults ? (
              <>
                {matchingBookings.length > 0 && (
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider flex items-center gap-1 mb-1.5 px-1">
                      <Calendar size={12} /> Reservations ({matchingBookings.length})
                    </span>
                    <div className="space-y-1">
                      {matchingBookings.map((b) => (
                        <div
                          key={b.id || b.bookingRef}
                          onClick={() => handleResultClick('reservations')}
                          className="search-result-item p-2 rounded-xl border cursor-pointer flex items-center justify-between transition-all"
                        >
                          <div>
                            <strong className="text-xs block font-bold">{b.clientName || b.fullName || b.touristName || 'Guest'}</strong>
                            <small className="text-[10px] opacity-80">{b.bookingRef || b.bookingNumber || 'BK-CODE'} • {b.serviceName || b.packageName || 'Service'}</small>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">{b.status || 'Confirmed'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {matchingUsers.length > 0 && (
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider flex items-center gap-1 mb-1.5 px-1">
                      <User size={12} /> Registered Users ({matchingUsers.length})
                    </span>
                    <div className="space-y-1">
                      {matchingUsers.map((u) => (
                        <div
                          key={u.id || u.user_id || u.email}
                          onClick={() => handleResultClick('users')}
                          className="search-result-item p-2 rounded-xl border cursor-pointer flex items-center justify-between transition-all"
                        >
                          <div>
                            <strong className="text-xs block font-bold">{u.name || `${u.fname || ''} ${u.lname || ''}`.trim() || 'User'}</strong>
                            <small className="text-[10px] opacity-80">{u.email} {u.user_number ? `• ${u.user_number}` : ''}</small>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">{u.role || 'Client'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {matchingServices.length > 0 && (
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider flex items-center gap-1 mb-1.5 px-1">
                      <Trees size={12} /> Services & Facilities ({matchingServices.length})
                    </span>
                    <div className="space-y-1">
                      {matchingServices.map((s) => (
                        <div
                          key={s.service_code || s.service_id || s.name}
                          onClick={() => handleResultClick('services')}
                          className="search-result-item p-2 rounded-xl border cursor-pointer flex items-center justify-between transition-all"
                        >
                          <div>
                            <strong className="text-xs block font-bold">{s.service_name || s.name}</strong>
                            <small className="text-[10px] opacity-80">{s.category || 'Rental'} • ₱{s.price}/{s.unit || 'unit'}</small>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">{s.status || 'Active'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {matchingStaff.length > 0 && (
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider flex items-center gap-1 mb-1.5 px-1">
                      <Shield size={12} /> Staff Members ({matchingStaff.length})
                    </span>
                    <div className="space-y-1">
                      {matchingStaff.map((st) => (
                        <div
                          key={st.id || st.user_id || st.name}
                          onClick={() => handleResultClick('staff')}
                          className="search-result-item p-2 rounded-xl border cursor-pointer flex items-center justify-between transition-all"
                        >
                          <div>
                            <strong className="text-xs block font-bold">{st.name || `${st.fname || ''} ${st.lname || ''}`.trim() || 'Staff'}</strong>
                            <small className="text-[10px] opacity-80">{st.role || 'Staff Member'} • {st.email || 'ecotour staff'}</small>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">Active</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {matchingReceipts.length > 0 && (
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider flex items-center gap-1 mb-1.5 px-1">
                      <Coins size={12} /> Official Receipts ({matchingReceipts.length})
                    </span>
                    <div className="space-y-1">
                      {matchingReceipts.map((r) => (
                        <div
                          key={r.id || r.receiptNo}
                          onClick={() => handleResultClick('payments')}
                          className="search-result-item p-2 rounded-xl border cursor-pointer flex items-center justify-between transition-all"
                        >
                          <div>
                            <strong className="text-xs block font-bold">{r.receiptNo || r.payment_ref}</strong>
                            <small className="text-[10px] opacity-80">{r.touristName || r.client_name || 'Guest'} • {r.date || 'Today'}</small>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">₱{r.grandTotal || r.total_amount || 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {matchingAnnouncements.length > 0 && (
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider flex items-center gap-1 mb-1.5 px-1">
                      <Megaphone size={12} /> Announcements ({matchingAnnouncements.length})
                    </span>
                    <div className="space-y-1">
                      {matchingAnnouncements.map((a) => (
                        <div
                          key={a.id || a.announcement_id || a.title}
                          onClick={() => handleResultClick('announcement')}
                          className="search-result-item p-2 rounded-xl border cursor-pointer flex items-center justify-between transition-all"
                        >
                          <div>
                            <strong className="text-xs block font-bold">{a.title}</strong>
                            <small className="text-[10px] opacity-80 truncate block max-w-[280px]">{a.description || a.message || a.content}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center text-xs opacity-70">
                No matching results found for "<span className="text-emerald-400 font-bold">{searchQuery}</span>"
              </div>
            )}
          </div>
        )}
      </div>

      <div className="etv-header-right">
        <ThemeToggle size="sm" />

        <NotificationBell onNavigateTab={setActiveTab} userRole="admin" />

        <div className="etv-admin cursor-pointer" onClick={() => setActiveTab && setActiveTab('profile')}>
          <img src={user.profile_pic || user.avatarUrl || 'https://i.pravatar.cc/80?img=68'} alt="Admin Avatar" className="object-cover" />
          <div>
            <strong className="flex items-center gap-1">
              {user.name || `${user.fname || 'Admin'} ${user.lname || ''}`.trim() || 'Admin'} 
              <ChevronDown size={13} className="opacity-70" />
            </strong>
            <small>Super Administrator</small>
          </div>
        </div>
      </div>
    </header>
  );
}