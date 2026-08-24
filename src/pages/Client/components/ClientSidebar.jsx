import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutModal from '../../../components/LogoutModal';
import { useEcoTour } from '../../../context/EcoTourContext';
import {
  Home, CalendarDays, History, CreditCard, Receipt, UserRound, Layers,
  Bell, ClipboardList, Headphones, LogOut
} from 'lucide-react';

const CLIENT_NAV = [
  { key: 'overview', label: 'Dashboard', icon: Home },
  { key: 'services', label: 'Services & Facilities', icon: Layers },
  { key: 'my_reservations', label: 'My Reservations', icon: CalendarDays },
  { key: 'history', label: 'Bookings History', icon: History },
  { key: 'payments', label: 'Payments & Billing', icon: CreditCard },
  { key: 'receipts', label: 'My Receipts', icon: Receipt },

  { key: 'notifications', label: 'Notifications', icon: Bell, badge: 3 },
  { key: 'activity_logs', label: 'Activity Logs', icon: ClipboardList },
  { key: 'support', label: 'Support & Help', icon: Headphones },
  { key: 'profile', label: 'My Profile', icon: UserRound },
];

export default function ClientSidebar({ activeTab, setActiveTab, onLogout, badgeCount }) {
  const navigate = useNavigate();
  const { currentUser, logout } = useEcoTour();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = () => {
    if (onLogout) onLogout();
    if (logout) logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate('/login');
  };

  const handleNavClick = (item) => {
    setActiveTab(item.key);
  };

  return (
    <>
      <aside className="etv-sidebar">
        {/* BRAND LOGO */}
        <div className="etv-brand">
          <svg viewBox="0 0 64 40" width="64">
            <path d="M8 26 L22 8 L32 20 L40 10 L56 26" stroke="#eafff2" strokeWidth="3" fill="none" strokeLinejoin="round" />
            <path d="M6 31 q6 -4 12 0 t12 0 t12 0 t12 0" stroke="#4ade80" strokeWidth="2.5" fill="none" />
            <path d="M10 36 q6 -4 12 0 t12 0 t12 0" stroke="#2dd4bf" strokeWidth="2.5" fill="none" />
          </svg>
          <h1>EcoTourVista</h1>
          <span>CLIENT PORTAL</span>
        </div>

        {/* NAVIGATION ITEMS */}
        <nav className="etv-nav">
          {CLIENT_NAV.map((item) => {
            const IconComp = item.icon;
            const isParentActive = activeTab === item.key;

            return (
              <div key={item.key} className="w-full">
                <button
                  className={`etv-nav-btn ${isParentActive ? 'active' : ''}`}
                  onClick={() => handleNavClick(item)}
                >
                  <IconComp size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {badgeCount || item.badge}
                    </span>
                  )}
                </button>
              </div>
            );
          })}

          <hr className="border-emerald-900/40 my-3" />
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full py-2.5 px-3.5 rounded-xl text-xs font-extrabold text-rose-300 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/30 hover:border-rose-500/60 transition-all flex items-center gap-2.5 cursor-pointer shadow-md group"
          >
            <LogOut size={16} className="text-rose-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        userName={currentUser?.name || `${currentUser?.fname || ''} ${currentUser?.lname || ''}`.trim() || 'Client Guest'}
        userRole="Resort Visitor Account"
        userAvatar={currentUser?.avatarUrl}
      />
    </>
  );
}