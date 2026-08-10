import React, { createContext, useContext, useState, useEffect } from 'react';

const EcoTourContext = createContext(null);

const OFFICIAL_DB_SERVICES = [
  { service_id: 1, service_code: 'DSVC-001', service_name: 'Cold Spring Pool Entrance Ticket', category: 'Entrance', description: 'Day pass access to natural cold spring pool & resort grounds', price: 100, unit: 'head', total_capacity: 300, available_qty: 300, available_quantity: 300, image_url: '/src/assets/images/services/swimming.png', status: 'Active' },
  { service_id: 2, service_code: 'DSVC-002', service_name: 'Standard Open Cottage', category: 'Cottage', description: 'Shaded native open cottage near natural pool area', price: 600, unit: 'day', total_capacity: 10, available_qty: 10, available_quantity: 10, image_url: '/src/assets/images/services/cottage.png', status: 'Active' },
  { service_id: 3, service_code: 'DSVC-003', service_name: 'Resort Table & Chairs Set', category: 'Rental', description: '1 Durable outdoor table + 4 monoblock chairs', price: 250, unit: 'day', total_capacity: 15, available_qty: 15, available_quantity: 15, image_url: '/src/assets/images/services/table.png', status: 'Active' },
  { service_id: 4, service_code: 'DSVC-004', service_name: 'Life Vest / Safety Gear', category: 'Safety', description: 'Adult & Kid safety flotation vest for swimming and kayak activities', price: 50, unit: 'head', total_capacity: 30, available_qty: 30, available_quantity: 30, image_url: '/src/assets/images/services/lifevest.png', status: 'Active' },
  { service_id: 5, service_code: 'DSVC-005', service_name: 'Videoke Karaoke System', category: 'Entertainment', description: 'Heavy-duty Videoke sound system for family gatherings', price: 500, unit: 'day', total_capacity: 4, available_qty: 4, available_quantity: 4, image_url: '/src/assets/images/services/videoke.png', status: 'Active' },
  { service_id: 6, service_code: 'DSVC-006', service_name: 'Kayak / Floating Pad Rental', category: 'Water Activity', description: '1-hour kayak & water pad rental on the river stream', price: 300, unit: 'hour', total_capacity: 5, available_qty: 5, available_quantity: 5, image_url: '/src/assets/images/services/floating.png', status: 'Active' },
  { service_id: 7, service_code: 'DSVC-007', service_name: 'Camping Pitch & Tent', category: 'Accommodation', description: 'Overnight camping pitch slot & waterproof tent', price: 450, unit: 'night', total_capacity: 8, available_qty: 8, available_quantity: 8, image_url: '/src/assets/images/services/tent.png', status: 'Active' },
  { service_id: 8, service_code: 'DSVC-008', service_name: 'Aircon Kubo Guest Room', category: 'Accommodation', description: 'Private aircon native kubo with comfortable bed & bathroom', price: 1500, unit: 'night', total_capacity: 4, available_qty: 4, available_quantity: 4, image_url: '/src/assets/images/services/room.png', status: 'Active' },
  { service_id: 9, service_code: 'DSVC-009', service_name: 'Private Event Pavilion', category: 'Event', description: 'Private pavilion for celebrations, reunions and events', price: 3500, unit: 'event', total_capacity: 2, available_qty: 2, available_quantity: 2, image_url: '/src/assets/images/services/event.png', status: 'Active' },
  { service_id: 10, service_code: 'DSVC-010', service_name: 'Buffet & Catering Station', category: 'Food', description: 'Native buffet catering package for groups', price: 450, unit: 'head', total_capacity: 50, available_qty: 50, available_quantity: 50, image_url: '/src/assets/images/services/buffet.png', status: 'Active' },
  { service_id: 11, service_code: 'DSVC-011', service_name: 'Secured Resort Parking Slot', category: 'Parking', description: 'Safe vehicle parking for cars & vans', price: 50, unit: 'vehicle', total_capacity: 40, available_qty: 40, available_quantity: 40, image_url: '/src/assets/images/services/parking.png', status: 'Active' },
];

const INITIAL_RESERVATIONS = [
  {
    id: 1,
    bookingRef: 'BK-2026-891',
    userNumber: 'CLT-2026-100234',
    client_id: 'CLT-2026-100234',
    clientName: 'Maria Santos',
    fullName: 'Maria Santos',
    touristName: 'Maria Santos',
    clientEmail: 'maria.santos@gmail.com',
    email: 'maria.santos@gmail.com',
    touristEmail: 'maria.santos@gmail.com',
    contactNumber: '0917-889-1234',
    serviceName: 'Standard Open Cottage & Swimming Access',
    packageName: 'Standard Open Cottage & Swimming Access',
    quantity: 4,
    totalVisitors: 4,
    totalPrice: 1000,
    grandTotal: 1000,
    bookingDate: '2026-08-10',
    reservationDate: '2026-08-10',
    arrivalTime: '09:00 AM',
    timeSlot: '09:00 AM - 05:00 PM',
    status: 'Approved',
    paymentMethod: 'GCash'
  },
  {
    id: 2,
    bookingRef: 'BK-2026-892',
    userNumber: 'CLT-2026-551290',
    client_id: 'CLT-2026-551290',
    clientName: 'Juan Dela Cruz',
    fullName: 'Juan Dela Cruz',
    touristName: 'Juan Dela Cruz',
    clientEmail: 'juan.delacruz@gmail.com',
    email: 'juan.delacruz@gmail.com',
    touristEmail: 'juan.delacruz@gmail.com',
    contactNumber: '0918-555-6789',
    serviceName: 'Aircon Kubo Guest Room & Videoke',
    packageName: 'Aircon Kubo Guest Room & Videoke',
    quantity: 6,
    totalVisitors: 6,
    totalPrice: 2000,
    grandTotal: 2000,
    bookingDate: '2026-08-12',
    reservationDate: '2026-08-12',
    arrivalTime: '10:00 AM',
    timeSlot: '10:00 AM - 06:00 PM',
    status: 'Pending',
    paymentMethod: 'Cash'
  },
  {
    id: 3,
    bookingRef: 'BK-2026-893',
    userNumber: 'CLT-2026-339102',
    client_id: 'CLT-2026-339102',
    clientName: 'Aileen Lagura',
    fullName: 'Aileen Lagura',
    touristName: 'Aileen Lagura',
    clientEmail: 'client@gmail.com',
    email: 'client@gmail.com',
    touristEmail: 'client@gmail.com',
    contactNumber: '0922-333-4455',
    serviceName: 'Private Event Pavilion Package',
    packageName: 'Private Event Pavilion Package',
    quantity: 15,
    totalVisitors: 15,
    totalPrice: 4500,
    grandTotal: 4500,
    bookingDate: '2026-08-15',
    reservationDate: '2026-08-15',
    arrivalTime: '08:00 AM',
    timeSlot: '08:00 AM - 08:00 PM',
    status: 'Approved',
    paymentMethod: 'Online Bank Transfer'
  }
];

const INITIAL_RECEIPTS = [
  // Today's cash receipts (2026-08-07)
  {
    id: 'RCPT-0091',
    receiptNo: 'OR-20260807-101',
    date: '2026-08-07',
    time: '08:15 AM',
    touristName: 'Maria Santos',
    userNumber: 'CLT-2026-100234',
    items: [
      { category: 'Entrance', name: 'Adult Entrance Ticket', quantity: 2, unitPrice: 100 },
      { category: 'Entrance', name: 'Child Entrance Ticket', quantity: 1, unitPrice: 40 },
      { category: 'Entrance', name: 'Barangay Environmental Fee', quantity: 3, unitPrice: 30 },
      { category: 'Cottage', name: 'Standard Open Cottage', quantity: 1, unitPrice: 600 },
    ],
    totalVisitors: 3,
    grandTotal: 930,
    amount: 930,
    cashReceived: 1000,
    change: 70,
    status: 'Paid',
    paymentMethod: 'Cash',
    method: 'Cash',
    staffName: 'Maria Staff'
  },
  {
    id: 'RCPT-0092',
    receiptNo: 'OR-20260807-102',
    date: '2026-08-07',
    time: '09:30 AM',
    touristName: 'Juan Dela Cruz',
    userNumber: 'CLT-2026-551290',
    items: [
      { category: 'Entrance', name: 'Adult Entrance Ticket', quantity: 4, unitPrice: 100 },
      { category: 'Entrance', name: 'Barangay Environmental Fee', quantity: 4, unitPrice: 30 },
      { category: 'Rental', name: 'Resort Table & Chairs Set', quantity: 1, unitPrice: 250 },
      { category: 'Entertainment', name: 'Videoke Karaoke System', quantity: 1, unitPrice: 500 },
    ],
    totalVisitors: 4,
    grandTotal: 1270,
    amount: 1270,
    cashReceived: 1500,
    change: 230,
    status: 'Paid',
    paymentMethod: 'Cash',
    method: 'Cash',
    staffName: 'Maria Staff'
  },
  {
    id: 'RCPT-0093',
    receiptNo: 'OR-20260807-103',
    date: '2026-08-07',
    time: '11:15 AM',
    touristName: 'Elena Rodriguez',
    userNumber: 'CLT-2026-881923',
    items: [
      { category: 'Entrance', name: 'Adult Entrance Ticket', quantity: 5, unitPrice: 100 },
      { category: 'Entrance', name: 'Senior / PWD Entrance Ticket', quantity: 2, unitPrice: 80 },
      { category: 'Entrance', name: 'Barangay Environmental Fee', quantity: 7, unitPrice: 30 },
      { category: 'Accommodation', name: 'Aircon Kubo Guest Room', quantity: 1, unitPrice: 1500 },
      { category: 'Safety', name: 'Life Vest / Safety Gear', quantity: 4, unitPrice: 50 },
    ],
    totalVisitors: 7,
    grandTotal: 2570,
    amount: 2570,
    cashReceived: 3000,
    change: 430,
    status: 'Paid',
    paymentMethod: 'Cash',
    method: 'Cash',
    staffName: 'Maria Staff'
  },
  // Yesterday's receipts (2026-08-06) - Peak Grossing Day!
  {
    id: 'RCPT-0080',
    receiptNo: 'OR-20260806-050',
    date: '2026-08-06',
    time: '09:00 AM',
    touristName: 'Bohol Tour Group',
    userNumber: 'CLT-2026-992100',
    items: [
      { category: 'Entrance', name: 'Adult Entrance Ticket', quantity: 25, unitPrice: 100 },
      { category: 'Entrance', name: 'Barangay Environmental Fee', quantity: 25, unitPrice: 30 },
      { category: 'Event', name: 'Private Event Pavilion', quantity: 1, unitPrice: 3500 },
      { category: 'Food', name: 'Buffet & Catering Station', quantity: 25, unitPrice: 450 },
    ],
    totalVisitors: 25,
    grandTotal: 18000,
    amount: 18000,
    cashReceived: 18000,
    change: 0,
    status: 'Paid',
    paymentMethod: 'Cash',
    method: 'Cash',
    staffName: 'Maria Staff'
  },
  {
    id: 'RCPT-0081',
    receiptNo: 'OR-20260806-051',
    date: '2026-08-06',
    time: '01:30 PM',
    touristName: 'Family Reunion Group',
    userNumber: 'CLT-2026-992101',
    items: [
      { category: 'Entrance', name: 'Adult Entrance Ticket', quantity: 12, unitPrice: 100 },
      { category: 'Entrance', name: 'Child Entrance Ticket', quantity: 6, unitPrice: 40 },
      { category: 'Entrance', name: 'Barangay Environmental Fee', quantity: 18, unitPrice: 30 },
      { category: 'Cottage', name: 'Standard Open Cottage', quantity: 2, unitPrice: 600 },
      { category: 'Entertainment', name: 'Videoke Karaoke System', quantity: 1, unitPrice: 500 },
    ],
    totalVisitors: 18,
    grandTotal: 3680,
    amount: 3680,
    cashReceived: 4000,
    change: 320,
    status: 'Paid',
    paymentMethod: 'Cash',
    method: 'Cash',
    staffName: 'Maria Staff'
  },
  // Aug 5 receipts (2026-08-05)
  {
    id: 'RCPT-0070',
    receiptNo: 'OR-20260805-020',
    date: '2026-08-05',
    time: '10:00 AM',
    touristName: 'Mark Bautista',
    userNumber: 'CLT-2026-773412',
    items: [
      { category: 'Entrance', name: 'Adult Entrance Ticket', quantity: 4, unitPrice: 100 },
      { category: 'Entrance', name: 'Barangay Environmental Fee', quantity: 4, unitPrice: 30 },
      { category: 'Water Activity', name: 'Kayak / Floating Pad Rental', quantity: 2, unitPrice: 300 },
      { category: 'Safety', name: 'Life Vest / Safety Gear', quantity: 4, unitPrice: 50 },
    ],
    totalVisitors: 4,
    grandTotal: 1320,
    amount: 1320,
    cashReceived: 1500,
    change: 180,
    status: 'Paid',
    paymentMethod: 'Cash',
    method: 'Cash',
    staffName: 'Maria Staff'
  }
];

export const EcoTourProvider = ({ children }) => {
  // --- Theme State (Dark / Light Mode) ---
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // --- Current User State ---
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    return null;
  });

  // Keep localStorage synced when currentUser changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // --- Users / Clients State ---
  const [userAccounts, setUserAccounts] = useState([]);

  // --- Resort Services State ---
  const [resortServices, setResortServices] = useState(OFFICIAL_DB_SERVICES);

  // --- Staff List State ---
  const [staffList, setStaffList] = useState([]);

  // --- Facilities State ---
  const [facilities, setFacilities] = useState(OFFICIAL_DB_SERVICES);

  // --- Bookings / Reservations State ---
  const [resortBookings, setResortBookings] = useState(INITIAL_RESERVATIONS);

  // Fetch real database bookings from backend server on mount
  useEffect(() => {
    const fetchBackendReservations = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/v1/reservations');
        const result = await res.json();
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          setResortBookings(prev => {
            const serverRefs = new Set(result.data.map(b => b.bookingRef || b.bookingNumber));
            const localOnly = prev.filter(b => !serverRefs.has(b.bookingRef) && !serverRefs.has(b.bookingNumber));
            return [...result.data, ...localOnly];
          });
        }
      } catch (err) {
        console.warn('Backend reservations fetch error (using local state):', err.message);
      }
    };
    fetchBackendReservations();
  }, []);

  // --- Receipts & Transactions State ---
  const [receipts, setReceipts] = useState(INITIAL_RECEIPTS);

  // --- Audit Logs State ---
  const [auditLogs, setAuditLogs] = useState([]);

  // --- Pricing Setup List ---
  const [pricingList, setPricingList] = useState([]);

  // Helper to compute itemized daily sales tally (100% Cash Drawer Computations)
  const getDailyTallySummary = (targetDate) => {
    const dayStr = targetDate || new Date().toISOString().split('T')[0];
    const dayReceipts = receipts.filter(r => (r.date === dayStr || r.date === dayStr.split('T')[0]) && r.status === 'Paid');

    let totalCashRevenue = 0;
    let totalVisitors = 0;
    let adultPax = 0;
    let childPax = 0;
    let studentPax = 0;
    let seniorPax = 0;
    let entranceRevenue = 0;
    let serviceRevenue = 0;

    const itemCounts = {};

    dayReceipts.forEach(r => {
      const gTotal = parseFloat(r.grandTotal || r.amount || 0);
      totalCashRevenue += gTotal;
      totalVisitors += parseInt(r.totalVisitors || 0, 10);

      (r.items || []).forEach(item => {
        const cat = (item.category || '').toLowerCase();
        const name = (item.name || '').toLowerCase();
        const qty = parseInt(item.quantity || 1, 10);
        const lineTotal = qty * parseFloat(item.unitPrice || 0);

        if (cat === 'entrance') {
          entranceRevenue += lineTotal;
          if (name.includes('adult')) adultPax += qty;
          else if (name.includes('child')) childPax += qty;
          else if (name.includes('student')) studentPax += qty;
          else if (name.includes('senior') || name.includes('pwd')) seniorPax += qty;
        } else {
          serviceRevenue += lineTotal;
          const itemName = item.name || 'Other Service';
          itemCounts[itemName] = (itemCounts[itemName] || 0) + qty;
        }
      });
    });

    if (totalVisitors === 0 && dayReceipts.length > 0) {
      totalVisitors = adultPax + childPax + studentPax + seniorPax || 1;
    }

    return {
      date: dayStr,
      totalCashRevenue,
      totalTransactions: dayReceipts.length,
      totalVisitors,
      adultPax,
      childPax,
      studentPax,
      seniorPax,
      entranceRevenue,
      serviceRevenue,
      itemCounts,
      receipts: dayReceipts
    };
  };

  // Fetch Live Data from Backend Server APIs
  useEffect(() => {
    // 1. Fetch Users
    fetch('http://localhost:5000/api/v1/users')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.users)) {
          setUserAccounts(data.users);
        }
      })
      .catch(() => {});

    // 2. Fetch Services
    fetch('http://localhost:5000/api/v1/services')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.services)) {
          setResortServices(data.services);
        }
      })
      .catch(() => {});

    // 3. Fetch Reservations
    fetch('http://localhost:5000/api/v1/reservations')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.reservations) && data.reservations.length > 0) {
          setResortBookings(data.reservations);
        }
      })
      .catch(() => {});

    // 4. Fetch Payments / Receipts
    fetch('http://localhost:5000/api/v1/payments')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.payments) && data.payments.length > 0) {
          setReceipts(data.payments);
        }
      })
      .catch(() => {});
  }, []);

  const deletePriceItem = (id) => {
    setPricingList(prev => prev.filter(p => p.id !== id));
  };

  // Deriving Walk-In Tourists list from receipts
  const tourists = receipts.map(r => ({
    id: r.id,
    fullName: r.touristName || 'Walk-In Guest',
    visitorType: 'Local',
    nationality: 'Filipino',
    totalVisitors: r.totalVisitors || 1,
    totalSpent: r.grandTotal || 0,
    date: r.date,
    timeIn: r.time || '10:00 AM',
    receiptId: r.receiptNo
  }));

  // --- Announcements Actions ---
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'Spring Cleaning & Maintenance Schedule', date: '2026-08-01', category: 'Maintenance', content: 'Our main cold spring pool will undergo routine water filtration on August 10.', message: 'Our main cold spring pool will undergo routine water filtration on August 10.' },
    { id: 2, title: 'New VIP Cottages Available for Booking', date: '2026-07-25', category: 'Feature', content: 'Constructed VIP covered cottages with power sockets!', message: 'Constructed VIP covered cottages with power sockets!' }
  ]);

  const addAnnouncement = (anno) => {
    const created = {
      id: Date.now(),
      title: anno.title,
      content: anno.message || anno.content || '',
      message: anno.message || anno.content || '',
      date: new Date().toISOString().split('T')[0],
      category: 'General'
    };
    setAnnouncements(prev => [created, ...prev]);
  };

  const deleteAnnouncement = (id) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  // --- Backup & Utilities ---
  const exportBackupJSON = () => {
    return JSON.stringify({ userAccounts, resortServices, staffList, resortBookings, receipts, pricingList }, null, 2);
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to perform a factory reset? This will reset local storage data.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const checkInBookingGuest = (id) => {
    updateResortBookingStatus(id, 'Checked In');
  };

  const checkOutBookingGuest = (id) => {
    updateResortBookingStatus(id, 'Checked Out');
  };

  const [galleryItems] = useState([
    { id: 1, title: 'Crystal Cold Waters', category: 'Spring Pool', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
    { id: 2, title: 'Lush Forest Canopy', category: 'Nature', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80' },
  ]);

  // --- Outbox Emails State ---
  const [outboxEmails, setOutboxEmails] = useState([
    { id: 1, recipient: 'client@ecotour.com', subject: 'Booking Confirmation #BK-2026-001', body: 'Dear Maria Clara, your cottage reservation has been successfully confirmed!', sentAt: '2026-08-03 09:15 AM', read: false }
  ]);

  // Park Configuration & Revenue Share
  const parkConfig = { environmentalFeePerHead: 30, defaultOpeningCash: 2000, maxOccupancy: 300 };
  const revenueShare = { ownerPercent: 70, barangayPercent: 20, municipalPercent: 10 };

  // --- Action Handlers ---

  // Auth / User actions
  const login = (userData) => {
    setCurrentUser(userData);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const updateCurrentUserProfile = (updatedFields) => {
    setCurrentUser(prev => ({ ...prev, ...updatedFields }));
  };

  // User Accounts (Admin)
  const approveUserAccount = (id) => {
    const targetUser = userAccounts.find((u) => u.id === id);
    setUserAccounts((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'approved' } : u)));

    if (targetUser) {
      const emailRecord = {
        id: Date.now(),
        recipient: targetUser.email,
        subject: `Account Registration APPROVED — EcoTourVista`,
        body: `Dear ${targetUser.name},\n\nCongratulations! Your EcoTourVista account registration has been APPROVED by the Administrator.\n\nAccount Login Credentials:\n• Email: ${targetUser.email}\n• Password: ${targetUser.rawPassword || targetUser.password || 'EcoTour2026!'}\n• Role: ${targetUser.role || 'Client'}\n• Status: APPROVED\n\nYou may now log in to the EcoTourVista Portal at http://localhost:5173/login.`,
        sentAt: new Date().toLocaleString(),
        read: false,
      };
      setOutboxEmails((prev) => [emailRecord, ...prev]);
    }
  };

  const rejectUserAccount = (id) => {
    const targetUser = userAccounts.find((u) => u.id === id);
    setUserAccounts((prev) => prev.filter((u) => u.id !== id));

    if (targetUser) {
      const emailRecord = {
        id: Date.now(),
        recipient: targetUser.email,
        subject: `Account Registration Update — EcoTourVista`,
        body: `Dear ${targetUser.name},\n\nWe regret to inform you that your account registration request for EcoTourVista has been REJECTED by the Administrator.\n\nIf you believe this is an error, please contact Duangon Cold Spring support.`,
        sentAt: new Date().toLocaleString(),
        read: false,
      };
      setOutboxEmails((prev) => [emailRecord, ...prev]);
    }
  };

  // Staff Management
  const addStaff = (staffData) => {
    const newStaff = {
      ...staffData,
      id: Date.now(),
      status: 'active',
      dateHired: new Date().toISOString().split('T')[0],
      attendanceHistory: []
    };
    setStaffList(prev => [...prev, newStaff]);
  };

  const updateStaff = (id, data) => {
    setStaffList(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteStaff = (id) => {
    setStaffList(prev => prev.filter(s => s.id !== id));
  };

  const clockInStaff = (id) => {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setStaffList(prev => prev.map(s => {
      if (s.id === id) {
        const history = s.attendanceHistory || [];
        const existing = history.find(a => a.date === today);
        if (existing) return s;
        return { ...s, attendanceHistory: [...history, { date: today, timeIn: time }] };
      }
      return s;
    }));
  };

  const clockOutStaff = (id) => {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setStaffList(prev => prev.map(s => {
      if (s.id === id) {
        const history = (s.attendanceHistory || []).map(a => a.date === today ? { ...a, timeOut: time } : a);
        return { ...s, attendanceHistory: history };
      }
      return s;
    }));
  };

  const toggleStaffStatus = (id) => {
    setStaffList(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
  };

  const paySalary = (staff) => {
    alert(`💰 Salary Payment Processed for ${staff.name}\nAmount: PHP ${staff.dailySalary || 800}\nReceipt SAL-${Date.now()} generated.`);
  };

  // Services (Admin)
  const addResortService = (serviceData) => {
    setResortServices(prev => [...prev, { ...serviceData, id: Date.now(), status: 'available' }]);
  };

  const updateResortService = (id, data) => {
    setResortServices(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteResortService = (id) => {
    setResortServices(prev => prev.filter(s => s.id !== id));
  };

  // Bookings (Landing Page, Client, Staff, Admin)
  const createResortBooking = (bookingData) => {
    const userNum = bookingData.userNumber || `CLT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const bookingRef = bookingData.bookingRef || `BK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBooking = {
      id: Date.now(),
      bookingRef,
      bookingNumber: bookingRef,
      userNumber: userNum,
      client_id: userNum,
      clientName: currentUser?.name || bookingData.clientName || bookingData.fullName || bookingData.touristName || 'Guest User',
      fullName: currentUser?.name || bookingData.fullName || bookingData.clientName || bookingData.touristName || 'Guest User',
      touristName: currentUser?.name || bookingData.touristName || bookingData.clientName || bookingData.fullName || 'Guest User',
      clientEmail: currentUser?.email || bookingData.clientEmail || bookingData.email || bookingData.touristEmail || 'guest@ecotour.com',
      email: currentUser?.email || bookingData.email || bookingData.clientEmail || bookingData.touristEmail || 'guest@ecotour.com',
      touristEmail: currentUser?.email || bookingData.touristEmail || bookingData.email || bookingData.clientEmail || 'guest@ecotour.com',
      contactNumber: bookingData.contactNumber || bookingData.phone || '',
      serviceName: bookingData.serviceName || bookingData.packageName || 'Resort Reservation',
      packageName: bookingData.packageName || bookingData.serviceName || 'Resort Reservation',
      quantity: bookingData.quantity || bookingData.totalVisitors || 1,
      totalVisitors: bookingData.totalVisitors || bookingData.quantity || 1,
      totalPrice: parseFloat(bookingData.totalPrice || bookingData.grandTotal || 0),
      grandTotal: parseFloat(bookingData.grandTotal || bookingData.totalPrice || 0),
      bookingDate: bookingData.bookingDate || bookingData.reservationDate || new Date().toISOString().split('T')[0],
      reservationDate: bookingData.reservationDate || bookingData.bookingDate || new Date().toISOString().split('T')[0],
      arrivalTime: bookingData.arrivalTime || bookingData.timeSlot || '09:00 AM',
      timeSlot: bookingData.timeSlot || bookingData.arrivalTime || '09:00 AM',
      status: bookingData.status || 'Pending',
      paymentMethod: bookingData.paymentMethod || 'Cash',
      items: bookingData.items || []
    };
    setResortBookings(prev => [newBooking, ...prev]);

    // Save to server database
    fetch('http://localhost:5000/api/v1/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBooking),
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.success && resData.data) {
          setResortBookings(prev => prev.map(b => b.bookingRef === bookingRef ? { ...b, id: resData.data.id } : b));
        }
      })
      .catch(err => console.warn('Saved locally, server offline:', err.message));

    // Send confirmation email to outbox
    setOutboxEmails(prev => [
      {
        id: Date.now(),
        recipient: newBooking.clientEmail,
        subject: `Booking Submitted (${newBooking.bookingRef})`,
        body: `Hello ${newBooking.clientName}, your booking for ${newBooking.serviceName} on ${newBooking.bookingDate} has been received and is pending confirmation.`,
        sentAt: new Date().toLocaleString(),
        read: false
      },
      ...prev
    ]);

    return newBooking;
  };

  const addReservation = createResortBooking;

  const cancelReservationBooking = (idOrRef) => {
    setResortBookings(prev => prev.map(b => (b.id === idOrRef || b.bookingRef === idOrRef) ? { ...b, status: 'Cancelled' } : b));
    fetch(`http://localhost:5000/api/v1/reservations/${idOrRef}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Cancelled' }),
    }).catch(() => {});
  };

  const updateResortBookingStatus = (idOrRef, status) => {
    setResortBookings(prev => prev.map(b => (b.id === idOrRef || b.bookingRef === idOrRef) ? { ...b, status } : b));
    fetch(`http://localhost:5000/api/v1/reservations/${idOrRef}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  };

  const getServiceAvailabilityForDate = (serviceId, date) => {
    const service = resortServices.find(s => s.id === serviceId);
    if (!service) return 0;
    const bookedCount = resortBookings
      .filter(b => b.serviceName === service.service_name && b.bookingDate === date && b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.quantity || 1), 0);
    return Math.max(0, service.quantity - bookedCount);
  };

  // Staff POS & Transactions
  const processPOSTransaction = (data) => {
    const grandTotal = data.items?.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0) || data.grandTotal || 0;
    const barangayShare = Math.round(grandTotal * (revenueShare.barangayPercent / 100));
    const municipalShare = Math.round(grandTotal * (revenueShare.municipalPercent / 100));
    const ownerShare = grandTotal - barangayShare - municipalShare;
    const userNum = data.userNumber || `CLT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const createdReceipt = {
      id: Date.now(),
      receiptNo: `OR-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100 + Math.random() * 900)}`,
      userNumber: userNum,
      touristName: data.touristName || 'Walk-In Tourist',
      touristEmail: data.touristEmail || 'client@ecotourvista.com',
      touristContact: data.touristContact || '',
      totalVisitors: data.items?.filter(i => i.category === 'Entrance').reduce((s, i) => s + i.quantity, 0) || 1,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      grandTotal,
      cashReceived: data.cashReceived || grandTotal,
      change: Math.max(0, (data.cashReceived || grandTotal) - grandTotal),
      status: 'Paid',
      staffName: currentUser?.name || 'Staff Cashier',
      items: data.items || [],
      barangayShare,
      municipalShare,
      ownerShare
    };

    // Save matching reservation record for Client Portal visibility
    const createdReservation = {
      id: Date.now(),
      bookingRef: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
      userNumber: userNum,
      fullName: data.touristName || 'Walk-In Tourist',
      email: data.touristEmail || 'client@ecotourvista.com',
      contactNumber: data.touristContact || '',
      packageName: data.items?.map(i => `${i.name} (x${i.quantity})`).join(', ') || 'Walk-In Availed Services',
      items: data.items || [],
      totalPrice: grandTotal,
      status: 'Approved',
      bookingDate: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    // Update real-time availability for availed services & facilities
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach(item => {
        const qty = item.quantity || 1;
        setFacilities(prev => prev.map(f => {
          const fName = (f.name || '').toLowerCase();
          const iName = (item.name || '').toLowerCase();
          if (fName.includes(iName) || iName.includes(fName)) {
            const newRented = (f.rentedQuantity || 0) + qty;
            return {
              ...f,
              rentedQuantity: newRented,
              status: newRented >= (f.totalQuantity || 10) ? 'Fully Booked' : 'Available'
            };
          }
          return f;
        }));

        setResortServices(prev => prev.map(s => {
          const sName = (s.service_name || s.name || '').toLowerCase();
          const iName = (item.name || '').toLowerCase();
          if (sName.includes(iName) || iName.includes(sName)) {
            const totalCap = parseInt(s.total_capacity || 10, 10);
            const currentAvail = s.available_qty !== undefined ? parseInt(s.available_qty, 10) : (s.available_quantity !== undefined ? parseInt(s.available_quantity, 10) : totalCap);
            const updatedAvail = Math.max(0, currentAvail - qty);
            return {
              ...s,
              available_qty: updatedAvail,
              available_quantity: updatedAvail
            };
          }
          return s;
        }));
      });
    }

    setReceipts(prev => [createdReceipt, ...prev]);
    setReservations(prev => [createdReservation, ...prev]);
    setResortBookings(prev => [createdReservation, ...prev]);

    return createdReceipt;
  };

  const returnFacilityItem = (id, qty = 1) => {
    setFacilities(prev => prev.map(f => {
      if (f.id === id) {
        const newRented = Math.max(0, (f.rentedQuantity || 0) - qty);
        return {
          ...f,
          rentedQuantity: newRented,
          status: newRented >= (f.totalQuantity || 10) ? 'Fully Booked' : 'Available'
        };
      }
      return f;
    }));

    setResortServices(prev => prev.map(s => {
      if (s.service_id === id || s.id === id) {
        const totalCap = parseInt(s.total_capacity || 10, 10);
        const currentAvail = s.available_qty !== undefined ? parseInt(s.available_qty, 10) : (s.available_quantity !== undefined ? parseInt(s.available_quantity, 10) : totalCap);
        const updatedAvail = Math.min(totalCap, currentAvail + qty);
        return {
          ...s,
          available_qty: updatedAvail,
          available_quantity: updatedAvail
        };
      }
      return s;
    }));
  };

  const submitCashClosing = (data) => {
    alert(`Shift Report Submitted by ${currentUser?.name || 'Staff'}! Total collected: PHP ${data.totalCashCollected || 0}`);
  };

  // Mailbox / Outbox Actions
  const markEmailAsRead = (id) => {
    setOutboxEmails(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
  };

  const clearOutbox = () => {
    setOutboxEmails([]);
  };

  return (
    <EcoTourContext.Provider
      value={{
        currentUser, setCurrentUser, login, logout, updateCurrentUserProfile,
        userAccounts, approveUserAccount, rejectUserAccount,
        resortServices, addResortService, updateResortService, deleteResortService,
        staffList, addStaff, updateStaff, deleteStaff, clockInStaff, clockOutStaff, toggleStaffStatus, paySalary,
        facilities, setFacilities, returnFacilityItem,
        resortBookings, reservations: resortBookings, createResortBooking, addReservation, cancelReservationBooking, updateResortBookingStatus, checkInBookingGuest, checkOutBookingGuest, getServiceAvailabilityForDate,
        receipts, processPOSTransaction, submitCashClosing, getDailyTallySummary,
        announcements, setAnnouncements, addAnnouncement, deleteAnnouncement, galleryItems,
        outboxEmails, markEmailAsRead, clearOutbox,
        auditLogs, tourists, pricingList, deletePriceItem, exportBackupJSON, resetToDefaults,
        parkConfig, revenueShare, theme, toggleTheme
      }}
    >
      {children}
    </EcoTourContext.Provider>
  );
};

export const useEcoTour = () => {
  const context = useContext(EcoTourContext);
  if (!context) {
    throw new Error('useEcoTour must be used within an EcoTourProvider');
  }
  return context;
};

export default EcoTourContext;
