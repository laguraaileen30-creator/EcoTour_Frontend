import { useState } from 'react';
import { useEcoTour } from '../../../context/EcoTourContext';

export const useStaff = () => {
  const [activeTab, setActiveTab] = useState('pos');
  const ecoTour = useEcoTour();

  const activeStaff = (ecoTour && ecoTour.currentUser?.role === 'staff')
    ? ecoTour.currentUser
    : (ecoTour && ecoTour.currentUser ? ecoTour.currentUser : { name: 'Staff Member', role: 'Staff', tasks: [] });

  const pricingList = [
    { id: 1, category: 'Entrance', name: 'Local Adult', price: 100, unit: 'per head' },
    { id: 2, category: 'Entrance', name: 'Student', price: 70, unit: 'per head' },
    { id: 3, category: 'Entrance', name: 'Child', price: 40, unit: 'per head' },
    { id: 4, category: 'Rental', name: 'Life Vest', price: 50, unit: 'per pc' },
  ];

  const reprintReceipt = (id, reason) => {
    alert(`Reprinting Receipt ID #${id}. Reason: ${reason || 'Customer Request'}`);
  };

  const triggerPrintModal = (data) => {
    alert(`🖨️ Printing: ${data.title}\nReceipt No: ${data.receipt?.receiptNo || 'N/A'}`);
  };

  return {
    activeStaff,
    activeTab,
    setActiveTab,
    pricingList,
    facilities: ecoTour.facilities,
    receipts: ecoTour.receipts,
    resortBookings: ecoTour.resortBookings,
    parkConfig: ecoTour.parkConfig,
    revenueShare: ecoTour.revenueShare,
    processPOSTransaction: ecoTour.processPOSTransaction,
    returnFacilityItem: ecoTour.returnFacilityItem,
    reprintReceipt,
    submitCashClosing: ecoTour.submitCashClosing,
    triggerPrintModal,
    updateResortBookingStatus: ecoTour.updateResortBookingStatus,
    updateStaff: ecoTour.updateStaff
  };
};