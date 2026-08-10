import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import LogoutModal from '../../../components/LogoutModal';
import { useEcoTour } from '../../../context/EcoTourContext';
import {
  LayoutDashboard, Users, Calendar, Footprints, Trees, Tag, Coins,
  BarChart3, MapPin, Bell, ClipboardList, Settings, User, LogOut, ChevronDown, ChevronRight, Sun, Moon
} from 'lucide-react';

const PesoIcon = () => <span className="font-extrabold text-sm text-emerald-400 font-mono inline-block w-4 text-center">₱</span>;

const MENU_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    key: 'users',
    label: 'User Management',
    icon: Users,
  },
  {
    key: 'staff',
    label: 'Staff Management',
    icon: User,
  },
  {
    key: 'reservations',
    label: 'Resort Reservations',
    icon: Calendar,
    children: [
      { key: 'reservations', label: 'All Bookings' },
      { key: 'reservations_pending', label: 'Pending Bookings' },
      { key: 'reservations_approved', label: 'Approved Bookings' },
      { key: 'reservations_completed', label: 'Completed Bookings' },
      { key: 'reservations_cancelled', label: 'Cancelled Bookings' },
    ],
  },
  {
    key: 'walkin',
    label: 'Walk-In Visitors (POS)',
    icon: Footprints,
    children: [
      { key: 'walkin', label: 'Order Terminal (POS)' },
      { key: 'walkin_history', label: 'Walk-In History' },
    ],
  },
  {
    key: 'services',
    label: 'Services & Facilities',
    icon: Trees,
    children: [
      { key: 'services', label: 'All Services Catalog' },
      { key: 'services_cottages', label: 'Cottages Management' },
      { key: 'services_tables', label: 'Tables & Seating' },
      { key: 'services_rooms', label: 'Guest Rooms' },
      { key: 'services_parking', label: 'Parking Slots' },
    ],
  },
  {
    key: 'pricing',
    label: 'Pricing Setup',
    icon: Tag,
  },
  {
    key: 'payments',
    label: 'Revenue & Payments',
    icon: Coins,
    children: [
      { key: 'payments', label: 'Payment Ledger' },
      { key: 'payments_commission', label: 'Revenue Share (Barangay/LGU)' },
    ],
  },
  {
    key: 'reports',
    label: 'Reports & Analytics',
    icon: BarChart3,
  },
  {
    key: 'spots',
    label: 'Tourist Information',
    icon: MapPin,
    children: [
      { key: 'spots', label: 'Duangon Cold Spring' },
      { key: 'services', label: 'Services Information' },
      { key: 'gallery', label: 'Gallery' },
      { key: 'spots_nearby', label: 'Nearby Destinations' },
    ],
  },
  {
    key: 'announcement',
    label: 'Notifications',
    icon: Bell,
  },
  {
    key: 'activity_logs',
    label: 'Activity Logs',
    icon: ClipboardList,
  },
  {
    key: 'settings',
    label: 'System Settings',
    icon: Settings,
  },
  {
    key: 'profile',
    label: 'My Profile',
    icon: User,
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { activeTab, setActiveTab } = useDashboard();
  const { currentUser, logout, theme, toggleTheme } = useEcoTour();
  const [openMenus, setOpenMenus] = useState({ users: true, reservations: false, services: false });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = () => {
    if (logout) logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/login");
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
          <span>ADMIN PANEL</span>
        </div>

        {/* NAVIGATION ITEMS */}
        <nav className="etv-nav">
          {MENU_ITEMS.map((item) => {
            const IconComp = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus[item.key];
            const isParentActive = activeTab === item.key || (item.children && item.children.some(c => c.key === activeTab));

            return (
              <div key={item.key} className="w-full">
                <button
                  className={`etv-nav-btn ${isParentActive ? 'active' : ''}`}
                  onClick={() => handleNavClick(item)}
                >
                  <IconComp size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {hasChildren && (
                    <span className="text-emerald-400/60">
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  )}
                </button>
            
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
        userName={currentUser?.name || 'Administrator'}
        userRole="Resort System Administrator"
        userAvatar={currentUser?.avatarUrl}
      />
    </>
  );
}