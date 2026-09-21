import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import LogoutModal from '../../../components/LogoutModal';
import ThemeToggle from '../../../components/ThemeToggle';
import { useEcoTour } from '../../../context/EcoTourContext';
import {
  LayoutDashboard, Users, Calendar, Footprints, Trees, Tag, Coins,
  BarChart3, MapPin, Bell, ClipboardList, Settings, User, LogOut, ChevronDown, ChevronRight
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
    key: 'clients',
    label: 'Client Management',
    icon: User,
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

  },
  {
    key: 'walkin',
    label: 'Walk-In Visitors (POS)',
    icon: Footprints,

  },
  {
    key: 'services',
    label: 'Services & Facilities',
    icon: Trees,

  },
  {
    key: 'payments',
    label: 'Payments History',
    icon: Coins,

  },
  {
    key: 'reports',
    label: 'Reports & Analytics',
    icon: BarChart3,
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