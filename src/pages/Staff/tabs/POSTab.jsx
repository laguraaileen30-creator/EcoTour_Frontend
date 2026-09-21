import React, { useState } from 'react';
import {
  User, Phone, Mail, Home, Utensils, Droplets, ShieldCheck, Ticket, Printer,
  CheckCircle2, Plus, Minus, X, Coins, Calculator, RefreshCw, FileText, Eye, Save, Edit3,
  Car, Coffee, Sparkles, Music, Trees, Search
} from 'lucide-react';
import { useStaff } from '../hooks/useStaff';
import { useEcoTour } from '../../../context/EcoTourContext';

// Helper to determine icon based on service category and name
const getServiceIcon = (category, serviceName) => {
  const cat = (category || '').toLowerCase();
  const name = (serviceName || '').toLowerCase();

  if (cat.includes('table') || cat.includes('rental') || name.includes('table')) return Utensils;
  if (cat.includes('entertainment') || name.includes('videoke') || name.includes('karaoke')) return Music;
  if (cat.includes('water') || name.includes('kayak') || name.includes('floating')) return Droplets;
  if (cat.includes('safety') || name.includes('vest')) return ShieldCheck;
  if (cat.includes('accommodat') || name.includes('kubo') || name.includes('room') || name.includes('tent') || name.includes('camping')) return Home;
  if (cat.includes('event') || name.includes('pavilion')) return Sparkles;
  if (cat.includes('food') || name.includes('buffet') || name.includes('catering')) return Coffee;
  if (cat.includes('parking') || name.includes('vehicle')) return Car;
  return Trees;
};

export default function POSTab() {
  const { parkConfig, activeStaff } = useStaff();
  const {
    resortServices,
    resortBookings,
    reservations,
    updateResortBookingStatus,
    walkIns = [],
    createWalkInTransaction,
    payWalkInTransaction,
    voidWalkInTransaction,
    completeWalkInTransaction,
    autoCompleteDailyWalkIns,
    showAlert,
    showConfirm,
    theme
  } = useEcoTour();
  const isLight = theme === 'light';

  // Maps booking status string to a stage index (0=pending,1=confirmed,2=in-service,3=done)
  const getStageIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('using') || s.includes('in service') || s.includes('checked in') || s.includes('active')) return 2;
    if (s.includes('paid') || s.includes('completed') || s.includes('done')) return 3;
    if (s.includes('confirmed') || s.includes('approved')) return 1;
    return 0;
  };

  const generateUserNumber = () => `CLT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const [userNumber, setUserNumber] = useState(generateUserNumber());
  const [touristName, setTouristName] = useState('');
  const [touristContact, setTouristContact] = useState('');
  const [touristEmail, setTouristEmail] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [students, setStudents] = useState(0);
  const [seniors, setSeniors] = useState(0);

  const [selectedCottage, setSelectedCottage] = useState(null);
  const [addonCart, setAddonCart] = useState({}); // { [serviceKey]: qty }
  const [cashReceived, setCashReceived] = useState('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [loadedBookingRef, setLoadedBookingRef] = useState(null);

  // Receipt Preview state
  const [previewReceipt, setPreviewReceipt] = useState(null);
  // Modal for paying a previously saved pending walk-in order
  const [selectedPendingWalkInForPayment, setSelectedPendingWalkInForPayment] = useState(null);
  const [pendingPayCashInput, setPendingPayCashInput] = useState('');
  const [walkInFilterTab, setWalkInFilterTab] = useState('all'); // 'all' | 'active' | 'pending' | 'completed' | 'voided'

  const totalVisitors = adults + children + students + seniors;

  // Active bookings and walk-ins currently using facilities & services
  const allBookings = (resortBookings || []).length ? (resortBookings || []) : (reservations || []);

  const getInUseCount = (serviceName, serviceCode) => {
    const sName = (serviceName || '').toLowerCase().trim();
    const sCode = (serviceCode || '').toLowerCase().trim();
    let count = 0;

    // 1. Check in-service / active reservations (deduct while in use, restore when Completed / Cancelled / Voided)
    allBookings.forEach(b => {
      const status = (b.status || '').toLowerCase();
      const isConcluded = status.includes('completed') || status.includes('cancel') || status.includes('void') || status.includes('checkout') || status.includes('checked out') || status.includes('done');
      const isPaidOrInService = (
        status.includes('paid') ||
        status.includes('using') ||
        status.includes('in resort') ||
        status.includes('checked in') ||
        status.includes('active') ||
        status.includes('confirmed')
      );

      if (isPaidOrInService && !isConcluded) {
        if (Array.isArray(b.items) && b.items.length > 0) {
          b.items.forEach(it => {
            const itName = (it.name || it.serviceName || '').toLowerCase();
            if (itName.includes(sName) || sName.includes(itName)) {
              count += parseInt(it.quantity || 1, 10);
            }
          });
        } else {
          const bSvc = (b.specificType || b.serviceName || b.packageName || '').toLowerCase();
          if (bSvc.includes(sName) || sName.includes(bSvc)) {
            count += 1;
          }
        }
      }
    });

    // 2. Check active walk-in transactions (deduct while ACTIVE/PAID, restore when COMPLETED)
    (walkIns || []).forEach(w => {
      const isConcluded = w.walk_in_status === 'COMPLETED' || (w.status || '').toLowerCase().includes('completed') || (w.payment_status || '').toLowerCase().includes('cancel');
      const isWalkInActive = (w.walk_in_status === 'ACTIVE' || w.payment_status === 'PAID') && !isConcluded;

      if (isWalkInActive && Array.isArray(w.items) && w.items.length > 0) {
        w.items.forEach(it => {
          const itName = (it.name || it.serviceName || '').toLowerCase();
          if (itName.includes(sName) || sName.includes(itName)) {
            count += parseInt(it.quantity || 1, 10);
          }
        });
      }
    });

    return count;
  };

  const RAW_COTTAGES = [
    { id: 'COT-NONE', service_code: 'COT-NONE', name: 'No Cottage (Walk-In Only)', service_name: 'No Cottage (Walk-In Only)', price: 0, total_capacity: 999 },
    { id: 'COT-01', service_code: 'DSVC-002', name: 'Standard Open Cottage', service_name: 'Standard Open Cottage', price: 600, category: 'Cottage', total_capacity: 10 },
    { id: 'COT-02', service_code: 'DSVC-003', name: 'Large Family Covered Cottage', service_name: 'Large Family Covered Cottage', price: 1000, category: 'Cottage', total_capacity: 6 },
    { id: 'COT-03', service_code: 'DSVC-004', name: 'Executive Umbrella Shade', service_name: 'Executive Umbrella Shade', price: 400, category: 'Cottage', total_capacity: 15 },
  ];

  const COTTAGE_OPTIONS = RAW_COTTAGES.map(c => {
    if (c.id === 'COT-NONE') return { ...c, available_qty: 999, inUse: 0 };
    const inUse = getInUseCount(c.name, c.service_code);
    const available = Math.max(0, (c.total_capacity || 10) - inUse);
    return {
      ...c,
      inUse,
      available_qty: available,
    };
  });

  const RAW_ADDONS = [
    { service_id: 'DSVC-005', service_code: 'DSVC-005', name: 'Resort Table & Chairs Set', service_name: 'Resort Table & Chairs Set', category: 'Rental', price: 250, unit: 'day', total_capacity: 15 },
    { service_id: 'DSVC-006', service_code: 'DSVC-006', name: 'Life Vest / Safety Gear', service_name: 'Life Vest / Safety Gear', category: 'Safety', price: 50, unit: 'head', total_capacity: 30 },
    { service_id: 'DSVC-007', service_code: 'DSVC-007', name: 'Videoke Karaoke System', service_name: 'Videoke Karaoke System', category: 'Entertainment', price: 500, unit: 'day', total_capacity: 4 },
    { service_id: 'DSVC-008', service_code: 'DSVC-008', name: 'Kayak / Floating Pad Rental', service_name: 'Kayak / Floating Pad Rental', category: 'Water Activity', price: 300, unit: 'hour', total_capacity: 5 },
    { service_id: 'DSVC-009', service_code: 'DSVC-009', name: 'Camping Pitch & Tent', service_name: 'Camping Pitch & Tent', category: 'Accommodation', price: 450, unit: 'night', total_capacity: 8 },
    { service_id: 'DSVC-010', service_code: 'DSVC-010', name: 'Aircon Kubo Guest Room', service_name: 'Aircon Kubo Guest Room', category: 'Accommodation', price: 1500, unit: 'night', total_capacity: 4 },
    { service_id: 'DSVC-011', service_code: 'DSVC-011', name: 'Private Event Pavilion', service_name: 'Private Event Pavilion', category: 'Event', price: 3500, unit: 'event', total_capacity: 2 },
    { service_id: 'DSVC-012', service_code: 'DSVC-012', name: 'Buffet & Catering Station', service_name: 'Buffet & Catering Station', category: 'Food', price: 450, unit: 'head', total_capacity: 50 },
    { service_id: 'DSVC-013', service_code: 'DSVC-013', name: 'Secured Resort Parking Slot', service_name: 'Secured Resort Parking Slot', category: 'Parking', price: 50, unit: 'vehicle', total_capacity: 40 },
  ];

  const mergedAddons = (resortServices && resortServices.length > 0)
    ? resortServices.filter(s => {
        const cat = (s.category || '').toLowerCase();
        const name = (s.service_name || s.name || '').toLowerCase();
        return cat !== 'entrance' && cat !== 'cottage' && !name.includes('entrance ticket') && !name.includes('open cottage');
      })
    : RAW_ADDONS;

  const AMENITY_ADDONS = (mergedAddons.length >= 9 ? mergedAddons : RAW_ADDONS).map(a => {
    const name = a.service_name || a.name;
    const code = a.service_code || a.service_id || a.id;
    const totalCap = parseInt(a.total_capacity || a.totalQuantity || 10, 10);
    const inUse = getInUseCount(name, code);
    const available = Math.max(0, totalCap - inUse);
    return {
      ...a,
      name,
      service_name: name,
      service_code: code,
      inUse,
      available_qty: available,
      total_capacity: totalCap,
    };
  }).sort((a, b) => {
    const rankA = a.category === 'Package' ? 0 : (a.category === 'Promotion' ? 1 : 2);
    const rankB = b.category === 'Package' ? 0 : (b.category === 'Promotion' ? 1 : 2);
    return rankA - rankB;
  });

  // Filtered Cottage Options & Addon Services based on Search Query
  const filteredCottageOptions = COTTAGE_OPTIONS.filter((c) => {
    if (!serviceSearchQuery.trim()) return true;
    if (c.id === 'COT-NONE') return true;
    const q = serviceSearchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.service_code || '').toLowerCase().includes(q)
    );
  });

  const filteredAmenityAddons = AMENITY_ADDONS.filter((s) => {
    if (!serviceSearchQuery.trim()) return true;
    const q = serviceSearchQuery.toLowerCase();
    return (
      (s.service_name || s.name || '').toLowerCase().includes(q) ||
      (s.category || '').toLowerCase().includes(q) ||
      (s.service_code || '').toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q)
    );
  });

  const handleAddonQty = (addonKey, delta, maxAvailable = 99) => {
    setAddonCart((prev) => {
      const current = prev[addonKey] || 0;
      const next = Math.min(maxAvailable, Math.max(0, current + delta));
      if (next === 0) {
        const copy = { ...prev };
        delete copy[addonKey];
        return copy;
      }
      return { ...prev, [addonKey]: next };
    });
  };

  const buildCartItems = () => {
    const items = [];
    if (adults > 0) items.push({ category: 'Entrance', name: 'Adult Entrance Ticket', quantity: adults, unitPrice: 100 });
    if (children > 0) items.push({ category: 'Entrance', name: 'Child Entrance Ticket', quantity: children, unitPrice: 40 });
    if (students > 0) items.push({ category: 'Entrance', name: 'Student Entrance Ticket', quantity: students, unitPrice: 70 });
    if (seniors > 0) items.push({ category: 'Entrance', name: 'Senior / PWD Entrance Ticket', quantity: seniors, unitPrice: 80 });

    if (totalVisitors > 0) {
      items.push({
        category: 'Entrance',
        name: 'Barangay Environmental Fee',
        quantity: totalVisitors,
        unitPrice: parkConfig?.environmentalFeePerHead || 30,
      });
    }

    if (selectedCottage && selectedCottage.id !== 'COT-NONE' && selectedCottage.service_code !== 'COT-NONE') {
      items.push({
        service_id: selectedCottage.service_id,
        service_code: selectedCottage.service_code,
        category: selectedCottage.category || 'Cottage',
        name: selectedCottage.name || selectedCottage.service_name,
        quantity: 1,
        unitPrice: selectedCottage.price,
      });
    }

    Object.entries(addonCart).forEach(([addonKey, qty]) => {
      const addonObj = AMENITY_ADDONS.find((a) => String(a.service_id || a.id || a.service_code) === String(addonKey));
      if (addonObj && qty > 0) {
        items.push({
          service_id: addonObj.service_id,
          service_code: addonObj.service_code,
          category: addonObj.category || 'Rental',
          name: addonObj.service_name || addonObj.name,
          quantity: qty,
          unitPrice: parseFloat(addonObj.price || 0),
        });
      }
    });

    return items;
  };

  const currentCartItems = buildCartItems();
  const grandTotal = currentCartItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const parsedCash = parseFloat(cashReceived) || 0;
  const changeAmount = Math.max(0, parsedCash - grandTotal);
  const isCashSufficient = parsedCash >= grandTotal && grandTotal > 0;

  const handlePayNow = async (explicitCash = null) => {
    if (!touristName.trim()) {
      return showAlert({
        title: 'Missing Tourist Name',
        message: 'Please enter Tourist / Client Full Name before proceeding.',
        type: 'warning'
      });
    }
    if (totalVisitors <= 0) {
      return showAlert({
        title: 'Missing Visitor Count',
        message: 'Please enter at least 1 visitor count.',
        type: 'warning'
      });
    }
    if (currentCartItems.length === 0) {
      return showAlert({
        title: 'Empty Order',
        message: 'Please select services, tickets, or cottage to calculate the total.',
        type: 'warning'
      });
    }

    // Determine cash to use: explicit cash > parsedCash > fallback to exact grandTotal
    let effectiveCash = explicitCash !== null ? parseFloat(explicitCash) : parsedCash;
    if (effectiveCash === 0 || isNaN(effectiveCash)) {
      effectiveCash = grandTotal;
      setCashReceived(String(grandTotal));
    }

    if (effectiveCash < grandTotal) {
      return showAlert({
        title: 'Insufficient Cash Given',
        message: `Total amount due is ₱${grandTotal.toLocaleString()}. Cash given: ₱${effectiveCash.toLocaleString()}.`,
        details: `Need ₱${(grandTotal - effectiveCash).toLocaleString()} more, or click "Hold / Store as Pending" if client is not paying yet.`,
        type: 'warning'
      });
    }

    const dObj = new Date();
    const localDate = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}-${String(dObj.getDate()).padStart(2, '0')}`;
    const draftReceipt = {
      receiptNo: `OR-${localDate.replace(/-/g,'')}-${Math.floor(100 + Math.random() * 900)}`,
      userNumber: userNumber.trim() || generateUserNumber(),
      touristName: touristName.trim(),
      touristContact: touristContact.trim(),
      touristEmail: touristEmail.trim(),
      date: localDate,
      time: dObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: currentCartItems,
      grandTotal,
      cashReceived: effectiveCash,
      change: Math.max(0, effectiveCash - grandTotal),
      staffName: activeStaff?.name || 'Staff Member',
    };

    setPreviewReceipt(draftReceipt);
  };

  const handlePreviewReceipt = () => handlePayNow();

  // Option 1: Store order as Pending (Unpaid) so client has the option to void or pay later
  const handleSaveAsPending = async () => {
    if (!touristName.trim()) {
      return showAlert({
        title: 'Missing Tourist Name',
        message: 'Please enter Tourist / Client Full Name before saving as pending.',
        type: 'warning'
      });
    }
    if (totalVisitors <= 0) {
      return showAlert({
        title: 'Missing Visitor Count',
        message: 'Please enter at least 1 visitor count.',
        type: 'warning'
      });
    }
    if (currentCartItems.length === 0) {
      return showAlert({
        title: 'Empty Order',
        message: 'Please select services, tickets, or cottage to create an order.',
        type: 'warning'
      });
    }

    const createdWalkIn = createWalkInTransaction({
      userNumber: userNumber.trim() || generateUserNumber(),
      touristName: touristName.trim(),
      touristContact: touristContact.trim(),
      touristEmail: touristEmail.trim(),
      totalVisitors,
      items: currentCartItems,
      grandTotal,
      staffName: activeStaff?.name || 'Staff Member',
      visitorType: 'Local',
      isPending: true,
      payment_status: 'PENDING',
      walk_in_status: 'PENDING'
    });

    await showAlert({
      title: 'Stored in Pending Client Bookings',
      message: `Walk-In Order #${createdWalkIn.walk_in_id} for ${createdWalkIn.customer_name} has been stored in Pending Client Bookings!`,
      details: `Total Amount Due: ₱${grandTotal.toLocaleString()}. It is now visible in the "Pending Bookings" tab. Once payment is confirmed, it will automatically advance to Service Orders.`,
      type: 'info'
    });

    resetForm();
  };

  // Option 2: Finalize and Save Paid Walk-In Transaction
  const handleSaveTransaction = async (shouldPrint = false) => {
    if (!previewReceipt) return;

    const createdWalkIn = createWalkInTransaction({
      userNumber: previewReceipt.userNumber,
      touristName: previewReceipt.touristName,
      touristContact: previewReceipt.touristContact,
      touristEmail: previewReceipt.touristEmail,
      items: previewReceipt.items,
      cashReceived: previewReceipt.cashReceived,
      grandTotal: previewReceipt.grandTotal,
      staffName: activeStaff?.name || previewReceipt.staffName,
      visitorType: 'Local',
      isPending: false,
      payment_status: 'PAID',
      walk_in_status: 'ACTIVE'
    });

    // Also update any matching pending client reservation to Paid
    if (updateResortBookingStatus && reservations) {
      const matchingRes = reservations.find(r => 
        (r.clientName && r.clientName.toLowerCase() === previewReceipt.touristName.toLowerCase()) ||
        (r.userNumber && r.userNumber === previewReceipt.userNumber) ||
        (r.email && r.email.toLowerCase() === previewReceipt.touristEmail.toLowerCase()) ||
        (loadedBookingRef && r.bookingRef === loadedBookingRef)
      );
      if (matchingRes) {
        updateResortBookingStatus(matchingRes.bookingRef || matchingRes.id, 'Paid (Cash - Gate Verified)');
      }
    }

    if (shouldPrint) {
      window.print();
    }

    resetForm();

    await showAlert({
      title: 'Payment Confirmed & Saved',
      message: `Walk-In #${createdWalkIn.walk_in_id} (${createdWalkIn.receiptNo}) successfully paid!`,
      details: 'Client booking is now active in "Service Orders" under Paid, ready for Check-In & using services.',
      type: 'success'
    });
  };

  // Open Pay Modal for a stored Pending Walk-In
  const handleOpenPayPendingModal = (walkIn) => {
    setSelectedPendingWalkInForPayment(walkIn);
    setPendingPayCashInput(String(walkIn.grandTotal || walkIn.total_amount || 0));
  };

  // Confirm payment for a stored Pending Walk-In
  const handleConfirmPayPendingWalkIn = async (shouldPrint = false) => {
    if (!selectedPendingWalkInForPayment) return;
    const w = selectedPendingWalkInForPayment;
    const grandTotal = parseFloat(w.grandTotal || w.total_amount || 0);
    const cashRec = parseFloat(pendingPayCashInput) || 0;

    if (cashRec < grandTotal) {
      return showAlert({
        title: 'Insufficient Cash',
        message: `Cash given (₱${cashRec.toLocaleString()}) is less than total due (₱${grandTotal.toLocaleString()}).`,
        details: `Please collect full amount of ₱${grandTotal.toLocaleString()}.`,
        type: 'warning'
      });
    }

    const { walkIn: updatedW, receipt } = payWalkInTransaction(w.id || w.walk_in_id, cashRec, activeStaff?.name);

    setSelectedPendingWalkInForPayment(null);
    setPendingPayCashInput('');

    if (shouldPrint) {
      window.print();
    }

    // Open Official Receipt Preview for this completed payment!
    if (receipt) {
      setPreviewReceipt(receipt);
    }

    await showAlert({
      title: 'Payment Recorded Successfully',
      message: `Walk-In Order #${w.walk_in_id} for ${w.customer_name} is now PAID!`,
      details: `Total: ₱${grandTotal.toLocaleString()} • Cash Received: ₱${cashRec.toLocaleString()} • Change: ₱${Math.max(0, cashRec - grandTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}. This booking has advanced to Service Orders ready for Check-In!`,
      type: 'success'
    });
  };

  // Void a Walk-In (Pending or Active) so client does not continue purchase
  const handleVoidWalkIn = async (walkIn) => {
    const isPending = walkIn.walk_in_status === 'PENDING';
    const confirmed = await showConfirm({
      title: isPending ? 'Void Pending Walk-In Order' : 'Void Walk-In Transaction',
      message: `Are you sure you want to VOID order #${walkIn.walk_in_id} for ${walkIn.customer_name || walkIn.touristName}?`,
      details: isPending 
        ? 'The client will not continue the purchase. This order will be officially voided with no charge.' 
        : 'This walk-in will be cancelled and any occupied cottages/services will be released back to available inventory.',
      type: 'danger',
      confirmText: 'YES, Void Order',
      cancelText: 'Keep Order'
    });

    if (!confirmed) return;

    voidWalkInTransaction(walkIn.id || walkIn.walk_in_id, activeStaff?.name, 'Client opted not to continue purchase');

    await showAlert({
      title: 'Walk-In Order Voided',
      message: `Order #${walkIn.walk_in_id} has been voided. Purchase was not completed.`,
      type: 'info'
    });
  };

  const resetForm = () => {
    setUserNumber(generateUserNumber());
    setTouristName('');
    setTouristContact('');
    setTouristEmail('');
    setAdults(1);
    setChildren(0);
    setStudents(0);
    setSeniors(0);
    setSelectedCottage(null);
    setAddonCart({});
    setCashReceived('');
    setServiceSearchQuery('');
    setPreviewReceipt(null);
  };

  // Active and Pending Client Bookings (for Add-ons / Payments)
  const pendingClientBookings = (reservations || []).concat(resortBookings || []).filter(r => {
    const s = (r.status || '').toLowerCase();
    return !s.includes('void') && !s.includes('cancel') && !s.includes('completed') && !s.includes('checkout') && !s.includes('done');
  }).reduce((unique, r) => {
    if (!unique.find(u => (u.bookingRef || u.id) === (r.bookingRef || r.id))) unique.push(r);
    return unique;
  }, []);

  const handleLoadPendingBooking = (bookingRef) => {
    if (!bookingRef) return;
    const found = pendingClientBookings.find(r => r.bookingRef === bookingRef || r.id === bookingRef || String(r.id) === String(bookingRef));
    if (!found) return;

    setUserNumber(found.userNumber || found.client_no || generateUserNumber());
    setTouristName(found.clientName || found.fullName || found.touristName || found.name || '');
    setTouristContact(found.clientPhone || found.contactNumber || found.touristContact || found.contact_no || '0917-123-4567');
    setTouristEmail(found.clientEmail || found.email || found.touristEmail || '');

    // 1. Parse Pax Breakdown
    if (found.paxBreakdown) {
      setAdults(found.paxBreakdown.adults || 1);
      setChildren(found.paxBreakdown.children || 0);
      setStudents(found.paxBreakdown.students || 0);
      setSeniors(found.paxBreakdown.seniors || 0);
    } else if (Array.isArray(found.items) && found.items.length > 0) {
      let a = 0, c = 0, st = 0, sn = 0;
      found.items.forEach(it => {
        const n = (it.name || it.serviceName || '').toLowerCase();
        const qty = parseInt(it.quantity || 1, 10);
        if (n.includes('adult')) a += qty;
        else if (n.includes('child')) c += qty;
        else if (n.includes('student')) st += qty;
        else if (n.includes('senior') || n.includes('pwd')) sn += qty;
      });
      setAdults(a || found.totalVisitors || found.numberOfGuests || 1);
      setChildren(c);
      setStudents(st);
      setSeniors(sn);
    } else if (found.numberOfGuests || found.totalVisitors) {
      setAdults(found.numberOfGuests || found.totalVisitors || 1);
      setChildren(0);
      setStudents(0);
      setSeniors(0);
    }

    // 2. Parse Cottage Selection
    if (found.selectedCottage) {
      setSelectedCottage(found.selectedCottage);
    } else if (Array.isArray(found.items) && found.items.length > 0) {
      const cottageItem = found.items.find(it => {
        const n = (it.name || it.serviceName || '').toLowerCase();
        return n.includes('cottage') || n.includes('shade') || n.includes('kubo');
      });
      if (cottageItem) {
        const cName = cottageItem.name || cottageItem.serviceName;
        const matchingOpt = COTTAGE_OPTIONS.find(c => c.name.toLowerCase() === cName.toLowerCase() || cName.toLowerCase().includes(c.name.toLowerCase()));
        if (matchingOpt) {
          setSelectedCottage(matchingOpt);
        } else {
          setSelectedCottage({ id: 'COT-CUSTOM', service_code: 'COT-CUSTOM', name: cName, price: cottageItem.unitPrice || cottageItem.price || 0 });
        }
      } else {
        setSelectedCottage(COTTAGE_OPTIONS[0]); // No Cottage
      }
    }

    // 3. Parse Addon Cart
    if (found.addonCart && Object.keys(found.addonCart).length > 0) {
      setAddonCart(found.addonCart);
    } else if (Array.isArray(found.items) && found.items.length > 0) {
      const newCart = {};
      found.items.forEach(it => {
        const n = (it.name || it.serviceName || '').toLowerCase();
        if (!n.includes('entrance') && !n.includes('cottage') && !n.includes('shade')) {
          const matchedAddon = AMENITY_ADDONS.find(a => 
            (a.service_name || a.name || '').toLowerCase() === n ||
            n.includes((a.service_name || a.name || '').toLowerCase())
          );
          if (matchedAddon) {
            newCart[matchedAddon.id || matchedAddon.service_id] = parseInt(it.quantity || 1, 10);
          }
        }
      });
      setAddonCart(newCart);
    }

    setLoadedBookingRef(found.bookingRef || found.id);

    showAlert({
      title: 'Pending Booking Loaded',
      message: `Loaded pending booking (${found.bookingRef}) for ${found.clientName || found.touristName || 'Client'}!`,
      details: `Visitors: ${found.totalVisitors || found.numberOfGuests || 1} • Services restored to cart. Proceed with cash payment or hold order.`,
      type: 'info'
    });
  };

  const dNow = new Date();
  const todayStr = `${dNow.getFullYear()}-${String(dNow.getMonth() + 1).padStart(2, '0')}-${String(dNow.getDate()).padStart(2, '0')}`;
  const todayWalkIns = walkIns.filter(w => (w.transaction_date === todayStr || w.operating_date === todayStr || (w.date && String(w.date).startsWith(todayStr))));
  const activeWalkIns = todayWalkIns.filter(w => w.walk_in_status === 'ACTIVE');
  const completedTodayWalkIns = todayWalkIns.filter(w => w.walk_in_status === 'COMPLETED');
  const totalPaidWalkIns = todayWalkIns.filter(w => w.payment_status === 'PAID');

  return (
    <div className="space-y-6 text-white max-w-[1600px] mx-auto p-2 sm:p-4">
      {/* HEADER BANNER & PENDING BOOKINGS QUICK LOADER */}
      <div className="bg-[#071911] p-5 rounded-2xl border border-emerald-500/20 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Walk-in Visitors Point of Sale (POS)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Register walk-in tourists, select entrance tickets & resort services/facilities, calculate totals, record cash, and issue official receipts.
            </p>
          </div>
        </div>

        {/* CLIENT BOOKINGS LOADER DROPDOWN */}
        {pendingClientBookings.length > 0 && (
          <div className="bg-emerald-950/90 p-3 rounded-xl border border-emerald-500/40 space-y-1 w-full sm:w-80 shrink-0">
            <label className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider block">
              📥 Load Client Profile (For Add-ons / Payment):
            </label>
            <select
              onChange={(e) => handleLoadPendingBooking(e.target.value)}
              className="w-full bg-[#04150e] border border-emerald-700/60 rounded-lg px-2.5 py-1.5 text-xs text-emerald-200 outline-none cursor-pointer font-medium"
            >
              <option value="">-- Select Active Client --</option>
              {pendingClientBookings.map((b) => (
                <option key={b.bookingRef || b.id} value={b.bookingRef || b.id}>
                  {b.bookingRef} - {b.clientName || b.touristName || 'Client'} (₱{(b.estimatedTotal || 0).toLocaleString()})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TODAY'S WALK-IN OPERATIONAL STATUS KPIS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0c1f16] p-4 rounded-xl border border-emerald-500/20 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's Walk-Ins</span>
          <p className="text-2xl font-black text-white mt-1">{todayWalkIns.length} Groups</p>
          <span className="text-[10px] text-emerald-400 font-medium">{todayWalkIns.reduce((s, w) => s + (w.guest_count || 1), 0)} Total Pax</span>
        </div>

        <div className="bg-[#0c1f16] p-4 rounded-xl border border-emerald-500/20 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paid Transactions</span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">₱{todayWalkIns.reduce((s, w) => s + (w.total_amount || 0), 0).toLocaleString()}</p>
          <span className="text-[10px] text-emerald-300 font-medium">{totalPaidWalkIns.length} Settled in Cash</span>
        </div>

        <div className="bg-[#0c1f16] p-4 rounded-xl border border-emerald-500/30 shadow-md relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Active / Using Services</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <p className="text-2xl font-black text-emerald-300 mt-1">{activeWalkIns.length} Active</p>
          <span className="text-[10px] text-emerald-400/90 font-medium">Occupying Cottages &amp; Facilities</span>
        </div>

        <div className="bg-[#0c1f16] p-4 rounded-xl border border-emerald-500/20 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Visits</span>
          <p className="text-2xl font-black text-slate-200 mt-1">{completedTodayWalkIns.length} Finished</p>
          <span className="text-[10px] text-slate-400 font-medium">Services Released back to Available</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: REGISTRATION & SERVICE SELECTION (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: TOURIST REGISTRATION */}
          <div className="bg-[#0c1f16] p-5 rounded-2xl border border-emerald-500/20 shadow-xl space-y-4">
            <h3 className="font-extrabold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-emerald-900/60 pb-3">
              <User className="w-4 h-4" /> 1. Tourist / Client Registration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Client ID / User Number *</label>
                <div className="relative flex items-center gap-1">
                  <div className="relative flex-1">
                    <Ticket className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                    <input
                      type="text"
                      placeholder="CLT-2026-XXXX"
                      value={userNumber}
                      onChange={(e) => setUserNumber(e.target.value)}
                      className="w-full bg-black/40 border border-emerald-900/60 rounded-xl pl-9 pr-2 py-2 text-xs text-emerald-300 font-mono font-bold outline-none focus:border-emerald-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setUserNumber(generateUserNumber())}
                    title="Auto-Generate Client ID"
                    className="p-2 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-xl hover:bg-emerald-900 transition-all shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Juan Dela Cruz"
                    value={touristName}
                    onChange={(e) => setTouristName(e.target.value.replace(/[^a-zA-Z\s'-]/g, ""))}
                    className="w-full bg-black/40 border border-emerald-900/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Contact Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="0917-123-4567"
                    value={touristContact}
                    onChange={(e) => setTouristContact(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-black/40 border border-emerald-900/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Email (Optional)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="client@gmail.com"
                    value={touristEmail}
                    onChange={(e) => setTouristEmail(e.target.value.toLowerCase())}
                    className="w-full bg-black/40 border border-emerald-900/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* VISITOR PAX COUNTERS */}
            <div>
              <span className="text-[11px] font-semibold text-slate-300 block mb-2">Guest Pax Breakdown (Entrance Tickets):</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/30 p-3.5 rounded-xl border border-emerald-900/40">
                {[
                  ['Adults (₱100)', adults, setAdults],
                  ['Children (₱40)', children, setChildren],
                  ['Students (₱70)', students, setStudents],
                  ['Seniors (₱80)', seniors, setSeniors],
                ].map(([label, val, setVal]) => (
                  <div key={label} className="text-center space-y-1.5 bg-[#071d13] p-2.5 rounded-xl border border-emerald-800/40">
                    <span className="text-[11px] font-bold text-slate-300 block">{label}</span>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setVal(Math.max(0, val - 1))}
                        className="w-7 h-7 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 font-extrabold cursor-pointer transition-all flex items-center justify-center text-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-extrabold text-sm text-emerald-300 min-w-[20px] font-mono">{val}</span>
                      <button
                        onClick={() => setVal(val + 1)}
                        className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold cursor-pointer transition-all flex items-center justify-center text-xs shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-emerald-400/80 mt-2 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Total Visitors: <strong className="text-white">{totalVisitors} Guests</strong> • Includes ₱30/head Barangay Environmental Fee
              </div>
            </div>
          </div>

          {/* STEP 2: COTTAGE & RESORT SERVICES/FACILITIES SELECTION */}
          <div className="bg-[#0c1f16] p-5 rounded-2xl border border-emerald-500/20 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-900/60 pb-3">
              <h3 className="font-extrabold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-2">
                <Home className="w-4 h-4" /> 2. Cottage & Resort Add-on Services & Facilities
              </h3>

              {/* SEARCH BAR FOR QUICK SELECTION */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                <input
                  type="text"
                  placeholder="Search cottage/service..."
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                  className="w-full bg-black/50 border border-emerald-900/80 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400 font-medium"
                />
                {serviceSearchQuery && (
                  <button
                    onClick={() => setServiceSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Cottage Options */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-300 block">Select Cottage Rental:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredCottageOptions.map((c) => {
                  const isSelected = selectedCottage?.id === c.id || (c.id === 'COT-NONE' && !selectedCottage);
                  const isFull = c.available_qty === 0 && c.id !== 'COT-NONE';

                  return (
                    <button
                      key={c.id}
                      disabled={isFull}
                      onClick={() => !isFull && setSelectedCottage(c.id === 'COT-NONE' ? null : c)}
                      className={`p-3 rounded-xl border text-left transition-all flex justify-between items-center ${
                        isFull
                          ? 'opacity-40 bg-rose-950/30 border-rose-900/40 cursor-not-allowed'
                          : isSelected
                          ? 'bg-emerald-600/90 text-white border-emerald-400 shadow-md font-bold cursor-pointer'
                          : 'bg-black/30 border-emerald-900/60 text-slate-300 hover:bg-emerald-950/60 cursor-pointer'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-xs font-bold block truncate">{c.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {c.service_code && c.service_code !== 'COT-NONE' && (
                            <span className="text-[9px] font-mono text-emerald-400 font-bold">{c.service_code}</span>
                          )}
                          {c.id !== 'COT-NONE' && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                              c.available_qty === 0
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : c.available_qty <= 3
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}>
                              {c.available_qty === 0 ? '🚫 0 left (Full)' : `${c.available_qty} left`}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-mono font-extrabold text-emerald-300 shrink-0">
                        {c.price > 0 ? `₱${c.price.toLocaleString()}${c.unit ? `/${c.unit}` : ''}` : 'Free'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Resort Services / Facilities */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-semibold text-slate-300 block">
                  Resort Services & Facilities Catalog ({filteredAmenityAddons.length} Available):
                </span>
                {serviceSearchQuery && (
                  <span className="text-[10px] text-emerald-400 font-medium">
                    Filtered by "{serviceSearchQuery}"
                  </span>
                )}
              </div>

              {filteredAmenityAddons.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredAmenityAddons.map((addon) => {
                    const key = addon.service_id || addon.id || addon.service_code;
                    const IconComp = getServiceIcon(addon.category, addon.service_name || addon.name);
                    const qty = addonCart[key] || 0;
                    const price = parseFloat(addon.price || addon.unitPrice || 0);
                    const availQty = addon.available_qty !== undefined ? parseInt(addon.available_qty, 10) : 10;

                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                          qty > 0 ? 'bg-emerald-950/90 border-emerald-500/60 shadow-md' : 'bg-black/30 border-emerald-900/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0">
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block truncate">
                              {addon.category || 'Service'}
                            </span>
                            <h4 className="text-xs font-bold text-white leading-tight truncate">
                              {addon.service_name || addon.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-[10px] font-mono text-emerald-300 font-extrabold">
                                ₱{price.toLocaleString()}
                              </span>
                              <span className="text-[9px] text-slate-400 font-normal">
                                / {addon.unit || 'unit'}
                              </span>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono ${
                                availQty === 0
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : availQty <= 3
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              }`}>
                                {availQty === 0 ? '🚫 0 left' : `${availQty} left`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-emerald-900/60 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAddonQty(key, -1, availQty)}
                            disabled={qty <= 0}
                            className="w-6 h-6 rounded bg-emerald-950 hover:bg-emerald-900 disabled:opacity-30 text-emerald-300 font-bold flex items-center justify-center cursor-pointer text-xs"
                          >
                            -
                          </button>
                          <span className="font-mono font-extrabold text-xs text-white min-w-[16px] text-center">{qty}</span>
                          <button
                            type="button"
                            onClick={() => handleAddonQty(key, 1, availQty)}
                            disabled={qty >= availQty || availQty === 0}
                            className="w-6 h-6 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white font-bold flex items-center justify-center cursor-pointer text-xs shadow"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center bg-black/20 rounded-xl border border-emerald-900/40 text-slate-400 text-xs">
                  No resort services found matching "{serviceSearchQuery}". Try another search term.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: POS ORDER TERMINAL & CHECKOUT (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="bg-[#0c1f16] p-5 rounded-2xl border border-emerald-500/30 shadow-2xl sticky top-24 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-emerald-900/60">
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" /> Official Order Terminal
              </h3>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800">
                Live POS
              </span>
            </div>

            {/* ITEMIZED CART LIST */}
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1 divide-y divide-emerald-900/40">
              {currentCartItems.length > 0 ? (
                currentCartItems.map((item, idx) => (
                  <div key={idx} className="pt-2 text-xs flex justify-between items-center">
                    <span className="text-slate-200 font-medium">
                      {item.name} <small className="text-slate-400 font-normal">({item.quantity}x)</small>
                    </span>
                    <span className="font-mono font-extrabold text-emerald-400">
                      ₱{(item.quantity * item.unitPrice).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs font-medium">
                  Select visitor count & services to calculate total
                </div>
              )}
            </div>

            {/* GRAND TOTAL & CASH INPUT */}
            <div className="space-y-3 pt-3 border-t border-emerald-900/60">
              <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-emerald-500/30">
                <span className="text-xs font-bold text-slate-300">Grand Total:</span>
                <span className="font-mono font-black text-2xl text-emerald-400">
                  ₱{grandTotal.toLocaleString()}
                </span>
              </div>

              {/* CASH GIVEN WITH QUICK CASH CHIPS */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-semibold text-slate-300">Cash Received (₱):</label>
                  {grandTotal > 0 && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCashReceived(String(grandTotal))}
                        className="text-[10px] bg-emerald-950 hover:bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/60 font-mono font-bold cursor-pointer transition-all shadow-sm"
                        title="Set cash to exact grand total"
                      >
                        Exact
                      </button>
                      <button
                        type="button"
                        onClick={() => setCashReceived(String(Math.ceil(grandTotal / 500) * 500 || 500))}
                        className="text-[10px] bg-black/40 hover:bg-black/60 text-slate-300 px-1.5 py-0.5 rounded border border-white/10 font-mono cursor-pointer transition-all"
                      >
                        ₱{(Math.ceil(grandTotal / 500) * 500 || 500).toLocaleString()}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCashReceived(String(Math.ceil(grandTotal / 1000) * 1000 || 1000))}
                        className="text-[10px] bg-black/40 hover:bg-black/60 text-slate-300 px-1.5 py-0.5 rounded border border-white/10 font-mono cursor-pointer transition-all"
                      >
                        ₱{(Math.ceil(grandTotal / 1000) * 1000 || 1000).toLocaleString()}
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-mono font-extrabold text-sm select-none">₱</span>
                  <input
                    type="number"
                    placeholder={`Enter cash or click "Pay Now" for exact ₱${grandTotal.toLocaleString()}`}
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="w-full bg-black/50 border border-emerald-500/40 rounded-xl pl-9 pr-4 py-2.5 font-mono font-extrabold text-base text-white outline-none focus:border-emerald-400 transition-all placeholder:text-slate-600 placeholder:text-xs"
                  />
                </div>
              </div>

              {/* CHANGE DUE READOUT */}
              <div className={`p-3 rounded-xl border flex justify-between items-center text-xs ${
                parsedCash >= grandTotal && grandTotal > 0
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
                  : 'bg-black/30 border-white/10 text-slate-300'
              }`}>
                <span className="font-bold">
                  {parsedCash >= grandTotal && grandTotal > 0 ? 'Change Due:' : 'Status:'}
                </span>
                <span className="font-mono font-extrabold text-sm">
                  {parsedCash >= grandTotal && grandTotal > 0
                    ? `₱ ${changeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
                    : grandTotal > 0 && parsedCash > 0 ? `Need ₱ ${(grandTotal - parsedCash).toLocaleString()} more` : `Total Due: ₱ ${grandTotal.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* ACTION DECISION BUTTONS: PAY NOW OR STORE AS PENDING */}
            <div className="space-y-2.5 pt-1">
              {/* BUTTON 1: PAY NOW & ISSUE OFFICIAL RECEIPT */}
              <button
                type="button"
                onClick={() => handlePayNow()}
                disabled={currentCartItems.length === 0 || !touristName.trim()}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xl border border-emerald-400"
                title="Pay now with entered cash or exact amount and view official receipt"
              >
                <Coins className="w-4 h-4" /> Pay Now &amp; Issue Receipt
              </button>

              {/* BUTTON 2: STORE AS PENDING (UNPAID) */}
              <button
                type="button"
                onClick={handleSaveAsPending}
                disabled={currentCartItems.length === 0 || !touristName.trim()}
                className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Save order as Pending / Unpaid without collecting cash now. Client can void or pay at any time."
              >
                <Save className="w-4 h-4 text-amber-400" /> Hold / Store as Pending (Unpaid Order)
              </button>

              <p className="text-[10px] text-slate-400 text-center leading-tight">
                💡 <em>Click &quot;Pay Now&quot; to pay with entered cash (or exact total). Client not paying yet? Click &quot;Hold / Store as Pending&quot; to void or pay later.</em>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OFFICIAL DIGITAL RECEIPT PREVIEW MODAL */}
      {previewReceipt && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#05180f] border border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 text-white space-y-5 shadow-2xl relative">
            <button
              onClick={() => setPreviewReceipt(null)}
              className="absolute top-4 right-4 p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-slate-400 hover:text-white border border-white/10"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>

            {/* PREVIEW BADGE */}
            <div className="flex justify-center">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5 text-amber-400" /> Receipt Preview Mode
              </span>
            </div>

            {/* RECEIPT HEADER */}
            <div className="text-center border-b border-emerald-900/60 pb-4 space-y-1">
              <span className="text-[10px] font-bold tracking-[3px] text-emerald-400 uppercase">OFFICIAL RECEIPT PREVIEW</span>
              <h3 className="font-serif text-2xl font-bold text-white">EcoTourVista</h3>
              <p className="text-[11px] text-slate-400">Duangon Cold Spring Resort Portal</p>
              <div className="font-mono text-xs font-bold text-emerald-300 mt-2 bg-emerald-950 py-1 px-3 rounded-full inline-block border border-emerald-800">
                {previewReceipt.receiptNo}
              </div>
            </div>

            {/* RECEIPT METADATA */}
            <div className="text-xs space-y-1.5 bg-black/40 p-3.5 rounded-2xl border border-emerald-900/40 font-medium">
              <div className="flex justify-between"><span className="text-slate-400">Date & Time:</span><span>{previewReceipt.date} {previewReceipt.time}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Client ID / User #:</span><strong className="text-emerald-300 font-mono">{previewReceipt.userNumber}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Client Name:</span><strong className="text-white">{previewReceipt.touristName}</strong></div>
              {previewReceipt.touristContact && <div className="flex justify-between"><span className="text-slate-400">Contact:</span><span>{previewReceipt.touristContact}</span></div>}
              <div className="flex justify-between"><span className="text-slate-400">Staff Cashier:</span><span>{previewReceipt.staffName}</span></div>
            </div>

            {/* ITEMS LIST */}
            <div className="space-y-2 border-t border-b border-emerald-900/60 py-3 max-h-48 overflow-y-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Availed Services & Items Breakdown:</span>
              {previewReceipt.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs font-medium py-0.5 border-b border-white/5 last:border-0">
                  <span className="text-slate-200">{item.name} x{item.quantity}</span>
                  <span className="font-mono font-bold text-emerald-400">₱{(item.quantity * item.unitPrice).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* PAYMENT SUMMARY */}
            <div className="space-y-2 text-xs font-bold bg-emerald-950/70 p-4 rounded-2xl border border-emerald-700/60 shadow-inner">
              <div className="flex justify-between text-sm"><span className="text-slate-300">Grand Total Amount:</span><span className="font-mono text-emerald-300 text-lg">₱{previewReceipt.grandTotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-slate-300"><span>Cash Received:</span><span className="font-mono">₱{previewReceipt.cashReceived.toLocaleString()}</span></div>
              <div className="flex justify-between text-emerald-400 pt-1.5 border-t border-emerald-800/80"><span>Change Returned:</span><span className="font-mono text-base">₱{previewReceipt.change.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
            </div>

            {/* ACTION DECISION BUTTONS */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleSaveTransaction(false)}
                  className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all border border-emerald-400 uppercase tracking-wider"
                >
                  <CheckCircle2 className="w-4 h-4" /> Pay Now &amp; Confirm
                </button>
                <button
                  onClick={() => handleSaveTransaction(true)}
                  className="py-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all border border-emerald-600 uppercase tracking-wider"
                >
                  <Printer className="w-4 h-4" /> Pay Now &amp; Print
                </button>
              </div>

              <button
                onClick={() => setPreviewReceipt(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 transition-all"
              >
                <Edit3 className="w-4 h-4 text-amber-400" /> Edit Order Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REAL-TIME WALK-IN VISITORS & ORDERS (ACTIVE, PENDING & HISTORY) ── */}
      <div className="bg-[#0c1f16] p-5 rounded-2xl border border-emerald-500/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-emerald-900/60 pb-3">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              🟢 Real-Time Walk-In Visitors &amp; Order Terminal Management
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage paid active guests, pending unpaid walk-in orders, and completed transactions. Pending orders can be <strong>paid &amp; receipted</strong> or <strong>voided</strong> if the client chooses not to continue purchase.
            </p>
          </div>

          {/* FILTER PILLS */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-emerald-900/60 text-xs">
            {[
              { key: 'all', label: 'All Walk-Ins', count: todayWalkIns.length },
              { key: 'active', label: '🟢 Active (Paid)', count: activeWalkIns.length },
              { key: 'pending', label: '⏳ Pending (Unpaid)', count: todayWalkIns.filter(w => w.walk_in_status === 'PENDING').length },
              { key: 'completed', label: '✓ Completed', count: completedTodayWalkIns.length },
              { key: 'voided', label: '✕ Voided', count: todayWalkIns.filter(w => w.walk_in_status === 'VOIDED').length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setWalkInFilterTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  walkInFilterTab === tab.key
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  walkInFilterTab === tab.key ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {todayWalkIns.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-medium">
            No walk-in transactions recorded for today yet. Use the POS form above to register walk-in tourists.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/40 text-slate-400 uppercase font-mono text-[10px] border-b border-emerald-900/60">
                <tr>
                  <th className="p-3">Walk-In ID</th>
                  <th className="p-3">Tourist / Client</th>
                  <th className="p-3 text-center">Guests</th>
                  <th className="p-3">Availed Cottages &amp; Services</th>
                  <th className="p-3 text-right">Amount / Paid</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Staff / Time</th>
                  <th className="p-3 text-center">Order Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/40 font-medium">
                {todayWalkIns
                  .filter(w => {
                    if (walkInFilterTab === 'active') return w.walk_in_status === 'ACTIVE';
                    if (walkInFilterTab === 'pending') return w.walk_in_status === 'PENDING';
                    if (walkInFilterTab === 'completed') return w.walk_in_status === 'COMPLETED';
                    if (walkInFilterTab === 'voided') return w.walk_in_status === 'VOIDED';
                    return true;
                  })
                  .map(w => {
                    const isActive = w.walk_in_status === 'ACTIVE';
                    const isPending = w.walk_in_status === 'PENDING';
                    const isVoided = w.walk_in_status === 'VOIDED';
                    const isCompleted = w.walk_in_status === 'COMPLETED';
                    const isAutoClosed = w.completion_type === 'AUTO_DAILY_CLOSURE';

                    return (
                      <tr key={w.id || w.walk_in_id} className="hover:bg-white/5 transition-all">
                        <td className="p-3 font-mono font-bold text-emerald-400">
                          {w.walk_in_id || `WI-${w.id}`}
                        </td>
                        <td className="p-3 font-extrabold text-white">
                          <div>{w.customer_name || w.touristName}</div>
                          <span className="text-[10px] font-mono text-slate-400">{w.userNumber}</span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-200">
                          {w.guest_count || w.totalVisitors || 1} Pax
                        </td>
                        <td className="p-3 text-slate-300">
                          <div className="space-y-0.5 max-w-xs">
                            {w.items?.map((item, idx) => (
                              <div key={idx} className="text-[11px] text-emerald-300/90 font-medium">
                                • {item.name} <span className="font-bold text-white">(x{item.quantity})</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono font-black text-emerald-400">
                          <div>₱{parseFloat(w.total_amount || w.grandTotal || 0).toLocaleString()}</div>
                          {isPending && (
                            <span className="text-[9px] font-bold uppercase text-amber-400 block">UNPAID</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {isPending && (
                            <span className="bg-amber-950/80 text-amber-300 border border-amber-500/60 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 shadow-sm">
                              ⏳ PENDING PAYMENT
                            </span>
                          )}
                          {isActive && (
                            <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> ACTIVE (IN USE)
                            </span>
                          )}
                          {isVoided && (
                            <span className="bg-rose-950/80 text-rose-300 border border-rose-500/50 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 shadow-sm">
                              ✕ VOIDED / CANCELLED
                            </span>
                          )}
                          {isCompleted && (
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                              isAutoClosed
                                ? 'bg-amber-950/70 text-amber-300 border border-amber-600/50'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              {isAutoClosed ? 'AUTO-COMPLETED' : 'COMPLETED'}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">
                          <div>{w.created_by || 'Staff'}</div>
                          <span className="font-mono text-[10px] text-slate-500">{w.time || 'Today'}</span>
                        </td>
                        <td className="p-3 text-center">
                          {/* ACTIONS FOR PENDING UNPAID ORDERS */}
                          {isPending && (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenPayPendingModal(w)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl cursor-pointer shadow transition-all uppercase tracking-wider flex items-center gap-1"
                                title="Collect cash, preview official receipt and mark as paid"
                              >
                                <Coins className="w-3.5 h-3.5" /> Pay Now
                              </button>
                              <button
                                onClick={() => handleVoidWalkIn(w)}
                                className="px-2.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700/60 font-bold text-xs rounded-xl cursor-pointer shadow transition-all flex items-center gap-1"
                                title="Void this pending order if client decided not to continue purchase"
                              >
                                <X className="w-3.5 h-3.5 text-rose-400" /> Void
                              </button>
                            </div>
                          )}

                          {/* ACTIONS FOR ACTIVE PAID ORDERS */}
                          {isActive && (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={async () => {
                                  const confirmed = await showConfirm({
                                    title: 'Complete Walk-In Stay',
                                    message: `Complete Walk-In #${w.walk_in_id} for ${w.customer_name}?`,
                                    details: 'This will vacate rented cottages and release all services back into available inventory.',
                                    type: 'success',
                                    confirmText: 'YES, Complete Stay'
                                  });
                                  if (confirmed) {
                                    completeWalkInTransaction(w.id || w.walk_in_id, activeStaff?.name);
                                    showAlert({
                                      title: 'Walk-In Completed',
                                      message: `Walk-In #${w.walk_in_id} marked Completed. Facilities released.`,
                                      type: 'success'
                                    });
                                  }
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                              </button>
                              <button
                                onClick={() => handleVoidWalkIn(w)}
                                className="px-2 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 font-bold text-xs rounded-xl cursor-pointer transition-all"
                                title="Void transaction"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {/* FOR VOIDED OR COMPLETED */}
                          {(isVoided || isCompleted) && (
                            <span className="text-[11px] text-slate-500 font-medium">
                              {w.completed_by ? `By ${w.completed_by}` : (isVoided ? 'Voided' : 'Closed')}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL: PAY PENDING WALK-IN ORDER ── */}
      {selectedPendingWalkInForPayment && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#05180f] border border-emerald-500/40 rounded-3xl max-w-md w-full p-6 text-white space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedPendingWalkInForPayment(null)}
              className="absolute top-4 right-4 p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-slate-400 hover:text-white border border-white/10"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center border-b border-emerald-900/60 pb-3 space-y-1">
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">COLLECT PAYMENT FOR PENDING ORDER</span>
              <h3 className="text-xl font-bold text-white">Order #{selectedPendingWalkInForPayment.walk_in_id}</h3>
              <p className="text-xs text-slate-400">
                Client: <strong className="text-emerald-300">{selectedPendingWalkInForPayment.customer_name}</strong> • Guests: {selectedPendingWalkInForPayment.guest_count} Pax
              </p>
            </div>

            {/* ORDER ITEMS SUMMARY */}
            <div className="bg-black/40 p-3.5 rounded-2xl border border-emerald-900/60 text-xs space-y-1.5 max-h-36 overflow-y-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Items in this order:</span>
              {selectedPendingWalkInForPayment.items?.map((it, idx) => (
                <div key={idx} className="flex justify-between text-slate-200">
                  <span>{it.name} (x{it.quantity})</span>
                  <span className="font-mono text-emerald-400">₱{(it.quantity * it.unitPrice).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* AMOUNT DUE & CASH GIVEN */}
            <div className="space-y-3 bg-emerald-950/70 p-4 rounded-2xl border border-emerald-700/60">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-300">Total Amount Due:</span>
                <span className="font-mono text-2xl text-emerald-300 font-black">
                  ₱{parseFloat(selectedPendingWalkInForPayment.total_amount || selectedPendingWalkInForPayment.grandTotal || 0).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Cash Received (₱):</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-mono font-extrabold text-sm select-none">₱</span>
                  <input
                    type="number"
                    value={pendingPayCashInput}
                    onChange={(e) => setPendingPayCashInput(e.target.value)}
                    className="w-full bg-black/60 border border-emerald-500/50 rounded-xl pl-9 pr-4 py-2.5 font-mono font-extrabold text-base text-white outline-none focus:border-emerald-400"
                    placeholder="Enter cash given"
                  />
                </div>
              </div>

              {/* CHANGE CALCULATION */}
              {(() => {
                const total = parseFloat(selectedPendingWalkInForPayment.total_amount || selectedPendingWalkInForPayment.grandTotal || 0);
                const cash = parseFloat(pendingPayCashInput) || 0;
                const change = cash - total;
                return (
                  <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-emerald-800/60">
                    <span className="text-slate-300">Change Return:</span>
                    <span className={`font-mono text-base ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {change >= 0 ? `₱ ${change.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `Need ₱ ${Math.abs(change).toLocaleString()} more`}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* CONFIRM PAYMENT BUTTONS */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleConfirmPayPendingWalkIn(false)}
                disabled={(parseFloat(pendingPayCashInput) || 0) < parseFloat(selectedPendingWalkInForPayment.total_amount || selectedPendingWalkInForPayment.grandTotal || 0)}
                className="py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all uppercase tracking-wider"
              >
                <Coins className="w-4 h-4" /> Pay Now &amp; Confirm
              </button>
              <button
                type="button"
                onClick={() => handleConfirmPayPendingWalkIn(true)}
                disabled={(parseFloat(pendingPayCashInput) || 0) < parseFloat(selectedPendingWalkInForPayment.total_amount || selectedPendingWalkInForPayment.grandTotal || 0)}
                className="py-3 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all uppercase tracking-wider"
              >
                <Printer className="w-4 h-4" /> Pay Now &amp; Print
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}