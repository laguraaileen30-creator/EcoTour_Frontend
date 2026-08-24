import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Calendar, UserPlus, Coins, Megaphone, Ticket } from 'lucide-react';
import { useEcoTour } from '../context/EcoTourContext';

export default function NotificationBell({ onNavigateTab, userRole = 'client' }) {
  const { currentUser } = useEcoTour();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userId = currentUser?.user_id || currentUser?.id || 0;
  const role = (currentUser?.role || userRole || 'client').toLowerCase();

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/notifications?user_id=${userId}&role=${role}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.warn('Notifications fetch error:', e.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, [userId, role]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleMarkAsRead = async (id, type) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await fetch(`http://localhost:5000/api/v1/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role })
      });
    } catch (e) {}

    let targetTab = null;
    if (type === 'booking') {
      targetTab = role === 'admin' ? 'reservations' : role === 'staff' ? 'service_orders' : 'my_reservations';
    } else if (type === 'registration') {
      targetTab = 'users';
    } else if (type === 'payment') {
      targetTab = role === 'admin' ? 'payments' : role === 'staff' ? 'daily_sales' : 'receipts';
    } else if (type === 'announcement') {
      targetTab = role === 'admin' ? 'announcement' : 'notifications';
    }

    if (targetTab && onNavigateTab) {
      onNavigateTab(targetTab);
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    setUnreadCount(0);

    try {
      await fetch('http://localhost:5000/api/v1/notifications/read-all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role })
      });
    } catch (e) {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'booking': return <Ticket size={14} className="text-emerald-400" />;
      case 'registration': return <UserPlus size={14} className="text-blue-400" />;
      case 'payment': return <Coins size={14} className="text-amber-400" />;
      default: return <Megaphone size={14} className="text-lime-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BELL BUTTON */}
      <button 
        className="icon-btn relative cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View Notifications"
        title="View Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <em className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center not-italic animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </em>
        )}
      </button>

      {/* DROPDOWN POPUP */}
      {isOpen && (
        <div className="search-dropdown-results absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl z-50 p-3 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20 mb-2">
            <strong className="text-xs uppercase font-extrabold text-emerald-400 tracking-wider">
              Notifications ({unreadCount} unread)
            </strong>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead} 
                className="text-[11px] text-emerald-300 hover:text-emerald-100 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
            {notifications.length === 0 ? (
              <p className="text-center text-xs opacity-60 py-6">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id, n.type)}
                  className={`search-result-item p-2.5 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                    n.is_read ? 'opacity-60' : 'font-semibold border-emerald-500/40 bg-emerald-950/40'
                  }`}
                >
                  <span className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-500/30 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate font-bold text-white">{n.title}</p>
                    <p className="text-[11px] opacity-80 line-clamp-2 leading-tight mt-0.5">{n.message}</p>
                    <small className="text-[9px] opacity-60 block mt-1">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.created_at).toLocaleDateString()}
                    </small>
                  </div>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
