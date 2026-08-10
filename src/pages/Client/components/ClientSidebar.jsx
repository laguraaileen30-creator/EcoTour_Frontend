import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutModal from '../../../components/LogoutModal';
import { useEcoTour } from '../../../context/EcoTourContext';
import {
  Home, CalendarDays, History, CreditCard, Receipt, UserRound, Layers,
  Bell, ClipboardList, Headphones, Settings, LogOut, ChevronDown,
  ChevronRight, ArrowRight, Sun, Moon
} from 'lucide-react';

const CLIENT_NAV = [
  { key: 'overview', label: 'Dashboard', icon: Home },
  { key: 'services', label: 'Services & Facilities', icon: Layers },
  { key: 'my_reservations', label: 'My Reservations', icon: CalendarDays },
  { key: 'history', label: 'Bookings History', icon: History },
  {
    key: 'payments',
    label: 'Payments',
    icon: CreditCard,
    children: [
      { key: 'payments', label: 'Payment History' },
      { key: 'payments_pay', label: 'Pay Reservation' },
      { key: 'payments_methods', label: 'Payment Methods' },
    ],
  },
  {
    key: 'receipts',
    label: 'Receipts',
    icon: Receipt,
    children: [
      { key: 'receipts', label: "My Receipts" },
      { key: 'receipts_history', label: 'Receipt History' },
    ],
  },
  {
    key: 'profile',
    label: 'My Profile',
    icon: UserRound,
    children: [
      { key: 'profile', label: 'Personal Information' },
      { key: 'profile_account', label: 'Account Information' },
      { key: 'profile_password', label: 'Change Password' },
    ],
  },
  { key: 'notifications', label: 'Notifications', icon: Bell, badge: 3 },
  { key: 'activity_logs', label: 'Activity Logs', icon: ClipboardList },
  { key: 'support', label: 'Support', icon: Headphones },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function ClientSidebar({ activeTab, setActiveTab, onLogout }) {
  const navigate = useNavigate();
  const { currentUser, logout, theme, toggleTheme } = useEcoTour();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [openMenus, setOpenMenus] = useState({ payments: false, receipts: false, guide: true, profile: false });

  const confirmLogout = () => {
    if (onLogout) onLogout();
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
      <aside className="w-64 bg-[#051810] border-r border-emerald-900/40 flex flex-col h-screen shrink-0 overflow-hidden text-white">

        {/* LOGO BRAND */}
        <div className="p-5 text-center border-b border-emerald-900/30">
          <svg viewBox="0 0 64 40" width="48" className="mx-auto">
            <path d="M8 26 L22 8 L32 20 L40 10 L56 26" stroke="#eafff2" strokeWidth="3" fill="none" strokeLinejoin="round" />
            <path d="M6 31 q6 -4 12 0 t12 0 t12 0 t12 0" stroke="#4ade80" strokeWidth="2.5" fill="none" />
            <path d="M10 36 q6 -4 12 0 t12 0 t12 0" stroke="#2dd4bf" strokeWidth="2.5" fill="none" />
          </svg>
          <h1 className="font-serif text-xl font-bold tracking-tight text-white mt-1">EcoTourVista</h1>
          <span className="text-[9px] tracking-[4px] text-emerald-400 font-bold uppercase block">CLIENT PORTAL</span>
        </div>

        {/* NAV ITEMS */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          {CLIENT_NAV.map((item) => {
            const IconComp = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus[item.key];
            const isParentActive = activeTab === item.key || (item.children && item.children.some((c) => c.key === activeTab));

            return (
              <div key={item.key} className="w-full">
                <button
                  className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2.5 ${isParentActive
                      ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 shadow-sm'
                      : 'text-emerald-200/70 hover:text-white hover:bg-emerald-900/30'
                    }`}
                  onClick={() => handleNavClick(item)}
                >
                  <IconComp size={16} />
                  <span className="flex-1 truncate">{item.label}</span>
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
                          className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-2 ${isSubActive
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

          {/* THEME TOGGLE BUTTON (LIGHT/DARK MODE) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full mb-2 py-2.5 px-3.5 rounded-xl text-xs font-extrabold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 transition-all flex items-center justify-between cursor-pointer shadow-md group"
            title="Toggle Light/Dark Theme Mode"
          >
            <div className="flex items-center gap-2.5">
              {theme === "light" ? <Moon size={16} className="text-emerald-400" /> : <Sun size={16} className="text-amber-300" />}
              <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200">
              {theme === "light" ? "LIGHT" : "DARK"}
            </span>
          </button>

          <hr className="border-emerald-900/40 my-3" />
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-extrabold text-rose-300 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/30 hover:border-rose-500/60 transition-all flex items-center gap-2.5 cursor-pointer shadow-md group"
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
        userName={currentUser?.name || 'Client Guest'}
        userRole="Resort Visitor Account"
        userAvatar={currentUser?.avatarUrl}
      />
    </>
  );
}