// @refresh reset
import { createContext, useContext, useState } from 'react';
import { useEcoTour } from '../../../context/EcoTourContext';

const DashboardContext = createContext(null);

const useDashboardState = () => {
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) return tabParam;
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts[0] === 'admin' && pathParts[1] && pathParts[1] !== 'dashboard') {
        return pathParts[1];
      }
    } catch {}
    return 'dashboard';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const ecoTour = useEcoTour();

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    staffList: ecoTour.staffList,
    addStaff: ecoTour.addStaff,
    updateStaff: ecoTour.updateStaff,
    deleteStaff: ecoTour.deleteStaff,
    clockInStaff: ecoTour.clockInStaff,
    clockOutStaff: ecoTour.clockOutStaff,
    toggleStaffStatus: ecoTour.toggleStaffStatus,
    paySalary: ecoTour.paySalary,
    resortServices: ecoTour.resortServices,
    addResortService: ecoTour.addResortService,
    updateResortService: ecoTour.updateResortService,
    deleteResortService: ecoTour.deleteResortService,
    userAccounts: ecoTour.userAccounts,
    approveUserAccount: ecoTour.approveUserAccount,
    rejectUserAccount: ecoTour.rejectUserAccount,
    receipts: ecoTour.receipts,
    facilities: ecoTour.facilities,
    revenueShare: ecoTour.revenueShare,
    resortBookings: ecoTour.resortBookings,
    updateResortBookingStatus: ecoTour.updateResortBookingStatus,
    checkInBookingGuest: ecoTour.checkInBookingGuest,
    checkOutBookingGuest: ecoTour.checkOutBookingGuest,
    outboxEmails: ecoTour.outboxEmails,
    announcements: ecoTour.announcements,
    addAnnouncement: ecoTour.addAnnouncement,
    deleteAnnouncement: ecoTour.deleteAnnouncement,
    galleryItems: ecoTour.galleryItems,
    auditLogs: ecoTour.auditLogs || [],
    tourists: ecoTour.tourists || [],
    pricingList: ecoTour.pricingList || [],
    deletePriceItem: ecoTour.deletePriceItem,
    exportBackupJSON: ecoTour.exportBackupJSON,
    resetToDefaults: ecoTour.resetToDefaults,
    currentOccupancy: 45,
    triggerPrintModal: (data) => alert(`🖨️ Admin Print Triggered: ${data.title || 'Document'}`),
    generateSalaryReceipt: (data) => ({ ...data, receiptNo: `SAL-${Date.now()}` }),
  };
};

export const DashboardProvider = ({ children }) => {
  const value = useDashboardState();
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
