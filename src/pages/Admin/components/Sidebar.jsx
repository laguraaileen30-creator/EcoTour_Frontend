import React, { useState } from 'react';
import EcoTourLogo from '../../../components/EcoTourLogo';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import LogoutModal from '../../../components/LogoutModal';
import ThemeToggle from '../../../components/ThemeToggle';
import { useEcoTour } from '../../../context/EcoTourContext';
import {
  LayoutDashboard, Users, Calendar, Footprints, Trees, Tag, Coins,
  BarChart3, Settings, LogOut, ChevronDown, ChevronRight
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
    label: 'Services, Packages & Deals',
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
    // My Profile + Notifications + Activity Logs + System Settings (tabs inside the page)
    key: 'profile',
    label: 'Profile, Notifications & Settings',
    icon: Settings,
    matches: ['profile', 'announcement', 'activity_logs', 'settings'],
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
          <EcoTourLogo size={56} />
          <h1>EcoTourVista</h1>
          <span>ADMIN PANEL</span>
        </div>

        {/* NAVIGATION ITEMS */}
        <nav className="etv-nav">
          {MENU_ITEMS.map((item) => {
            const IconComp = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus[item.key];
            const isParentActive = activeTab === item.key || (item.matches && item.matches.includes(activeTab)) || (item.children && item.children.some(c => c.key === activeTab));

            return (
              <div key={item.key} className="w-full">
                <button
                  className={`etv-nav-btn ${isParentActive ? 'active' : ''}`}
                  onClick={() => handleNavClick(item)}
                >
                  <IconComp size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {hasChildren && (
                    <span className="etv-chevron">
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  )}
                </button>

              </div>
            );
          })}
          <hr className="etv-divider my-3" />
          <button
            onClick={() => setShowLogoutModal(true)}
            className="etv-logout w-full py-2.5 px-3.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2.5 cursor-pointer group"
          >
            <LogOut size={16} className="etv-logout-icon group-hover:-translate-x-0.5 transition-transform" />
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