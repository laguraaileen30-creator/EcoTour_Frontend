import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, X, Calendar, Trees, Coins, Megaphone, Receipt, Ticket } from 'lucide-react';
import ThemeToggle from '../../../components/ThemeToggle';
import NotificationBell from '../../../components/NotificationBell';
import { useEcoTour } from '../../../context/EcoTourContext';

export default function StaffHeader({ activeTab, setActiveTab, activeStaff }) {
  const { resortBookings = [], receipts = [], resortServices = [], facilities = [], announcements = [] } = useEcoTour();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const query = searchQuery.trim().toLowerCase();

  const matchingBookings = query ? resortBookings.filter(b =>
    (b.clientName || b.fullName || b.touristName || '').toLowerCase().includes(query) ||
    (b.bookingRef || b.bookingNumber || b.id || '').toString().toLowerCase().includes(query) ||
    (b.serviceName || b.packageName || '').toLowerCase().includes(query) ||
    (b.contactNumber || b.clientPhone || '').toLowerCase().includes(query)
  ).slice(0, 3) : [];

  const matchingReceipts = query ? receipts.filter(r =>
    (r.receiptNo || r.payment_ref || r.id || '').toString().toLowerCase().includes(query) ||
    (r.touristName || r.client_name || r.clientName || '').toLowerCase().includes(query)
  ).slice(0, 3) : [];

  const matchingFacilities = query ? (facilities.length > 0 ? facilities : resortServices).filter(f =>
    (f.name || f.service_name || '').toLowerCase().includes(query) ||
    (f.category || '').toLowerCase().includes(query)
  ).slice(0, 3) : [];

  const matchingAnnouncements = query ? announcements.filter(a =>
    (a.title || '').toLowerCase().includes(query) ||
    (a.description || a.message || a.content || '').toLowerCase().includes(query)
  ).slice(0, 3) : [];

  const hasResults = query.length > 0 && (
    matchingBookings.length > 0 ||
    matchingReceipts.length > 0 ||
    matchingFacilities.length > 0 ||
    matchingAnnouncements.length > 0
  );

  const handleResultClick = (targetTab) => {
    if (setActiveTab) setActiveTab(targetTab);
    setIsFocused(false);
    setSearchQuery('');
  };

  return (
    <header className="ct-header px-6 py-3 flex items-center justify-between relative z-40">
      {/* SEARCH BAR CONTAINER */}
      <div className="relative flex-1 max-w-xl z-50" ref={dropdownRef}>
        <div className="etv-search w-full flex items-center gap-2.5 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-950/20 transition-all focus-within:border-emerald-500 focus-within:bg-emerald-950/40">
          <Search size={16} className="text-emerald-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsFocused(true);
            }}
            onFocus={() => setIsFocused(true)}
            placeholder="Search visitor bookings, receipts, facilities, alerts..."
            className="w-full bg-transparent border-none outline-none text-xs text-emerald-100 placeholder:text-emerald-400/60"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setIsFocused(false); }}
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
                      <Ticket size={12} /> Bookings & Orders ({matchingBookings.length})
                    </span>
                    <div className="space-y-1">
                      {matchingBookings.map((b) => (
                        <div
                          key={b.id || b.bookingRef}
                          onClick={() => handleResultClick('service_orders')}
                          className="search-result-item p-2 rounded-xl border cursor-pointer flex items-center justify-between transition-all"
                        >
                          <div>
                            <strong className="text-xs block font-bold">{b.clientName || b.fullName || b.touristName || 'Guest'}</strong>
                            <small className="text-[10px] opacity-80">{b.bookingRef || b.bookingNumber || 'BK-CODE'} • {b.serviceName || b.packageName || 'Pass'}</small>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">{b.status || 'Active'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {matchingReceipts.length > 0 && (
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider flex items-center gap-1 mb-1.5 px-1">
                      <Receipt size={12} /> Sales & Receipts ({matchingReceipts.length})
                    </span>
                    <div className="space-y-1">
                      {matchingReceipts.map((r) => (
                        <div
                          key={r.id || r.receiptNo}
                          onClick={() => handleResultClick('daily_sales')}
                          className="search-result-item p-2 rounded-xl border cursor-pointer flex items-center justify-between transition-all"
                        >
                          <div>
                            <strong className="text-xs block font-bold">{r.receiptNo || r.payment_ref}</strong>
                            <small className="text-[10px] opacity-80">{r.touristName || r.client_name || 'Walk-In'} • {r.date || 'Today'}</small>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">₱{r.grandTotal || r.total_amount || 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {matchingFacilities.length > 0 && (
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider flex items-center gap-1 mb-1.5 px-1">
                      <Trees size={12} /> Facilities & Services ({matchingFacilities.length})
                    </span>
                    <div className="space-y-1">
                      {matchingFacilities.map((f) => (
                        <div
                          key={f.id || f.service_code || f.name}
                          onClick={() => handleResultClick('availability')}
                          className="search-result-item p-2 rounded-xl border cursor-pointer flex items-center justify-between transition-all"
                        >
                          <div>
                            <strong className="text-xs block font-bold">{f.name || f.service_name}</strong>
                            <small className="text-[10px] opacity-80">{f.category || 'Facility'} • ₱{f.price || f.fee || 0}</small>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">{f.status || 'Available'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {matchingAnnouncements.length > 0 && (
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider flex items-center gap-1 mb-1.5 px-1">
                      <Megaphone size={12} /> Alerts ({matchingAnnouncements.length})
                    </span>
                    <div className="space-y-1">
                      {matchingAnnouncements.map((a) => (
                        <div
                          key={a.id || a.announcement_id || a.title}
                          onClick={() => handleResultClick('notifications')}
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

      <div className="ct-header-right flex items-center gap-4">
        <ThemeToggle size="sm" />
        
        <NotificationBell onNavigateTab={setActiveTab} userRole="staff" />

        <div 
          className="ct-user flex items-center gap-2.5 cursor-pointer"
          onClick={() => setActiveTab && setActiveTab('staff_profile')}
          title="My Profile & Attendance"
        >
          <img 
            src={activeStaff?.profile_pic || activeStaff?.avatarUrl || 'https://i.pravatar.cc/80?img=33'} 
            alt="staff avatar" 
            className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500/40"
          />
          <div>
            <strong className="text-xs block font-bold">{activeStaff?.name || `${activeStaff?.fname || ''} ${activeStaff?.lname || ''}`.trim() || 'Staff Member'}</strong>
            <small className="text-[10px] flex items-center gap-1 opacity-80">{activeStaff?.role || 'Staff Member'} <ChevronDown size={12} /></small>
          </div>
        </div>
      </div>
    </header>
  );
}
