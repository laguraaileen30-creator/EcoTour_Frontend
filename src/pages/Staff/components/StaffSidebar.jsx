import React, { useState } from 'react';
import EcoTourLogo from '../../../components/EcoTourLogo';
import { useNavigate } from 'react-router-dom';
import LogoutModal from '../../../components/LogoutModal';
import { useEcoTour } from '../../../context/EcoTourContext';
import {
  LayoutDashboard, Calendar, Footprints, Ticket, Trees, Coins,
  User, LogOut, ChevronDown, ChevronRight
} from 'lucide-react';

const STAFF_MENU_ITEMS = [
  { key: 'overview', label: 'Staff Dashboard', icon: LayoutDashboard },
  { key: 'walkin_pos', label: 'Walk-In Order Terminal (POS)', icon: Footprints },
  { key: 'pending_bookings', label: 'Pending Client Bookings', icon: Ticket },

  { key: 'service_orders', label: 'Service Orders & Reservations', icon: Calendar },
  { key: 'availability', label: 'Service Availability & Facility Map', icon: Trees },
  { key: 'daily_sales', label: 'My Daily Sales Tally', icon: Coins },
  { key: 'staff_profile', label: 'My Profile, Attendance & Notifications', icon: User },
];

export default function StaffSidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const { currentUser, logout } = useEcoTour();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [openMenus, setOpenMenus] = useState({
    service_orders: true,
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
          <EcoTourLogo size={56} />
          <h1>EcoTourVista</h1>
          <span>STAFF PORTAL</span>
        </div>

        {/* NAVIGATION ITEMS */}
        <nav className="etv-nav">
          {STAFF_MENU_ITEMS.map((item) => {
            const IconComp = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus[item.key];
            const isParentActive = activeTab === item.key || (item.key === 'staff_profile' && String(activeTab).startsWith('notifications')) || (item.children && item.children.some((c) => c.key === activeTab));

            return (
              <div key={item.key} className="w-full">
                <button
                  className={`etv-nav-btn ${isParentActive ? 'active' : ''}`}
                  onClick={() => handleNavClick(item)}
                >
                  <IconComp size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="etv-nav-pill text-[10px] font-black px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {hasChildren && (
                    <span className="etv-chevron">
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  )}
                </button>

                {/* SUB-MENU DROPDOWN */}
                {hasChildren && isOpen && (
                  <div className="etv-sub pl-4 pr-1 py-1 space-y-1 ml-4 my-1">
                    {item.children.map((sub) => {
                      const isSubActive = activeTab === sub.key;
                      return (
                        <button
                          key={sub.key}
                          onClick={() => setActiveTab(sub.key)}
                          className={`etv-sub-btn w-full text-left py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${isSubActive ? 'active' : ''}`}
                        >
                          <span className="etv-sub-dot w-1.5 h-1.5 rounded-full" />
                          <span className="truncate">{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
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
        userName={currentUser?.name || 'Staff Member'}
        userRole="Staff Cashier & Operations"
        userAvatar={currentUser?.avatarUrl}
      />
    </>
  );
}