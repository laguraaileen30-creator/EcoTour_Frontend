import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutModal from '../../../components/LogoutModal';
import { useEcoTour } from '../../../context/EcoTourContext';
import {
  LayoutDashboard, Calendar, Footprints, Ticket, Trees, Coins,
  BarChart3, Bell, User, LogOut, ChevronDown, ChevronRight
} from 'lucide-react';

const STAFF_MENU_ITEMS = [
  { key: 'overview', label: 'Staff Dashboard', icon: LayoutDashboard },
  { key: 'walkin_pos', label: 'Walk-In Order Terminal (POS)', icon: Footprints },
  { key: 'pending_bookings', label: 'Pending Client Bookings', icon: Ticket },

  { key: 'service_orders', label: 'Service Orders & Reservations', icon: Calendar },
  { key: 'availability', label: 'Live Facilities & Cottages', icon: Trees },
  { key: 'daily_sales', label: 'My Daily Sales Tally', icon: Coins },
  { key: 'cash_closing', label: 'Shift Cash Closing', icon: BarChart3 },
  { key: 'visitor_logs', label: 'Tourist Visitor Logbook', icon: Ticket },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'staff_profile', label: 'My Profile & Attendance', icon: User },
];

export default function StaffSidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const { currentUser, logout } = useEcoTour();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [openMenus, setOpenMenus] = useState({
    service_orders: true,
    visitor_logs: false,
    notifications: false,
    staff_profile: false
  });

  const confirmLogout = () => {
    if (logout) logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate('/login');
  };

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNavClick = (item) => {
    if (item.children) {
      toggleMenu(item.key);
    }
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
          <span>STAFF PORTAL</span>
        </div>

        {/* NAVIGATION ITEMS */}
        <nav className="etv-nav">
          {STAFF_MENU_ITEMS.map((item) => {
            const IconComp = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus[item.key];
            const isParentActive = activeTab === item.key || (item.children && item.children.some((c) => c.key === activeTab));

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
                      {item.badge}
                    </span>
                  )}
                  {hasChildren && (
                    <span className="text-emerald-400/60">
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  )}
                </button>

                {/* SUB-MENU DROPDOWN */}
                {hasChildren && isOpen && (
                  <div className="pl-4 pr-1 py-1 space-y-1 border-l border-emerald-800/40 ml-4 my-1">
                    {item.children.map((sub) => {
                      const isSubActive = activeTab === sub.key;
                      return (
                        <button
                          key={sub.key}
                          onClick={() => setActiveTab(sub.key)}
                          className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${isSubActive
                            ? 'text-emerald-300 bg-emerald-950/90 border border-emerald-500/30'
                            : 'text-emerald-200/60 hover:text-emerald-100 hover:bg-emerald-900/20'
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-emerald-400' : 'bg-emerald-800/60'}`} />
                          <span className="truncate">{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
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
        userName={currentUser?.name || 'Staff Member'}
        userRole="Staff Cashier & Operations"
        userAvatar={currentUser?.avatarUrl}
      />
    </>
  );
}