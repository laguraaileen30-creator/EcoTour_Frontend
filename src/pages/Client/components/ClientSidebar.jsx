import React, { useState } from 'react';
import EcoTourLogo from '../../../components/EcoTourLogo';
import { useNavigate } from 'react-router-dom';
import LogoutModal from '../../../components/LogoutModal';
import { useEcoTour } from '../../../context/EcoTourContext';
import {
  Home, CalendarDays, History, UserRound, Layers,
  LogOut
} from 'lucide-react';

const CLIENT_NAV = [
  { key: 'overview', label: 'Dashboard', icon: Home },
  { key: 'services', label: 'Services & Facilities', icon: Layers },
  { key: 'my_reservations', label: 'My Reservations', icon: CalendarDays },
  { key: 'history', label: 'Bookings History', icon: History },

  { key: 'profile', label: 'My Profile, Support & Notifications', icon: UserRound, badge: 3 },
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
          <EcoTourLogo size={56} />
          <h1>EcoTourVista</h1>
          <span>CLIENT PORTAL</span>
        </div>

        {/* NAVIGATION ITEMS */}
        <nav className="etv-nav">
          {CLIENT_NAV.map((item) => {
            const IconComp = item.icon;
            const isParentActive = activeTab === item.key || (item.key === 'profile' && (String(activeTab).startsWith('notifications') || activeTab === 'support'));

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
                      {badgeCount || item.badge}
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
        userName={currentUser?.name || `${currentUser?.fname || ''} ${currentUser?.lname || ''}`.trim() || 'Client Guest'}
        userRole="Resort Visitor Account"
        userAvatar={currentUser?.avatarUrl}
      />
    </>
  );
}