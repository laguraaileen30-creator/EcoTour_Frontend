import React from 'react';
import './Dashboard.css';
import { DashboardProvider, useDashboard } from './hooks/useDashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardTab from './tabs/DashboardTab';
import ClientTab from './tabs/ClientTab';
import UsersTab from './tabs/UsersTab';
import StaffTab from './tabs/StaffTab';
import ReservationsTab from './tabs/ReservationsTab';
import WalkInTab from './tabs/WalkInTab';
import ServicesTab from './tabs/ServicesTab';
import TouristSpotsTab from './tabs/TouristSpotsTab';
import ReportsTab from './tabs/ReportsTab';
import GalleryTab from './tabs/GalleryTab';
import AnnouncementTab from './tabs/AnnouncementTab';
import SettingsTab from './tabs/SettingsTab';
import ProfileTab from './tabs/ProfileTab';
import ActivityLogsTab from './tabs/ActivityLogsTab';
import AvailabilityTab from '../Staff/tabs/AvailabilityTab';

const TabRouter = () => {
  const { activeTab } = useDashboard();
  switch (activeTab) {
    case 'availability':
      return <AvailabilityTab />;
    case 'clients':
      return <ClientTab />;
    case 'users':
    case 'users_clients':
    case 'users_staff':
    case 'users_pending':
      return <UsersTab />;
    case 'staff':
      return <StaffTab />;
    case 'reservations':
    case 'reservations_pending':
    case 'reservations_approved':
    case 'reservations_completed':
    case 'reservations_cancelled':
      return <ReservationsTab />;
    case 'walkin':
    case 'walkin_new':
    case 'walkin_history':
      return <WalkInTab />;
    case 'services':
    case 'services_cottages':
    case 'services_tables':
    case 'services_chairs':
    case 'services_vests':
    case 'services_videoke':
    case 'services_rooms':
    case 'services_parking':
    case 'services_other':
      return <ServicesTab />;
    case 'pricing':
    case 'pricing_rentals':
    case 'pricing_services':
    case 'pricing_history':
      return <ServicesTab />;
    case 'spots':
    case 'spots_nearby':
      return <TouristSpotsTab />;
    case 'reports':
    case 'reports_reservations':
    case 'reports_sales':
    case 'reports_revenue':
    case 'reports_staff':
    case 'reports_financial':
      return <ReportsTab />;
    case 'gallery':
      return <GalleryTab />;
    case 'announcement':
      return <AnnouncementTab />;
    case 'activity_logs':
      return <ActivityLogsTab />;
    case 'settings':
    case 'payments':
    case 'payments_daily':
    case 'payments_commission':
      return <SettingsTab />;
    case 'profile':
      return <ProfileTab />;
    default:
      return <DashboardTab />;
  }
};

const Footer = () => (
  <footer className="etv-footer">
    <div className="footer-brand">
      <svg viewBox="0 0 64 40" width="40">
        <path d="M8 26 L22 8 L32 20 L40 10 L56 26" stroke="#eafff2" strokeWidth="3" fill="none" strokeLinejoin="round" />
        <path d="M6 31 q6 -4 12 0 t12 0 t12 0 t12 0" stroke="#4ade80" strokeWidth="2.5" fill="none" />
        <path d="M10 36 q6 -4 12 0 t12 0 t12 0" stroke="#2dd4bf" strokeWidth="2.5" fill="none" />
      </svg>
      <div><strong>EcoTourVista</strong><span>ADMIN PANEL</span></div>
    </div>
    <p>© 2024 EcoTourVista. All rights reserved.</p>
    <div className="footer-social">
      <button aria-label="Facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></button>
      <button aria-label="Instagram"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" /></button>
      <button aria-label="Location"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></button>
    </div>
  </footer>
);

export default function Dashboard() {
  return (
    <DashboardProvider>
      <div className="etv-app">
        <Sidebar />
        <div className="etv-main">
          <Header />
          <main className="etv-content">
            <TabRouter />
          </main>
          <Footer />
        </div>
      </div>
    </DashboardProvider>
  );
}