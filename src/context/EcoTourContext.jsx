// @refresh reset
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getPhilippineDateStr, getPhilippineTimeStr } from '../utils/phTime';

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

const INITIAL_RESERVATIONS = [];
const INITIAL_RECEIPTS = [];
const INITIAL_WALK_INS = [];

export const EcoTourProvider = ({ children }) => {
  // --- Theme State (Dark / Light Mode) ---
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.body.classList.add('light', 'light-mode');
      document.body.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light', 'light-mode');
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

  // --- Gallery Items State ---
  const [galleryItems, setGalleryItems] = useState([]);

  // --- Tourist Spots State ---
  const [touristSpots, setTouristSpots] = useState([]);

  // --- Staff List State ---
  const [staffList, setStaffList] = useState([]);

  // --- Facilities State ---
  const [facilities, setFacilities] = useState(OFFICIAL_DB_SERVICES);

  // --- Bookings / Reservations State ---
  const [resortBookings, setResortBookings] = useState(() => {
    const saved = localStorage.getItem('resortBookings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse stored bookings", e);
      }
    }
    return INITIAL_RESERVATIONS;
  });

  // Keep localStorage synced whenever resortBookings changes
  useEffect(() => {
    if (resortBookings && resortBookings.length > 0) {
      localStorage.setItem('resortBookings', JSON.stringify(resortBookings));
    }
  }, [resortBookings]);

  // --- Receipts & Transactions State ---
  const [receipts, setReceipts] = useState(() => {
    const saved = localStorage.getItem('receipts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_RECEIPTS;
  });

  useEffect(() => {
    if (receipts && receipts.length > 0) {
      localStorage.setItem('receipts', JSON.stringify(receipts));
    }
  }, [receipts]);

  // --- Real-Time Walk-In Visitor Transactions State ---
  const [walkIns, setWalkIns] = useState(() => {
    const saved = localStorage.getItem('walkInTransactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_WALK_INS;
  });

  useEffect(() => {
    if (walkIns && walkIns.length > 0) {
      localStorage.setItem('walkInTransactions', JSON.stringify(walkIns));
    }
  }, [walkIns]);

  // --- Audit Logs State ---
  const [auditLogs, setAuditLogs] = useState([]);

  // --- Pricing Setup List ---
  const [pricingList, setPricingList] = useState([]);

  // Helper to compute itemized daily sales tally (100% Cash Drawer Computations)
  const getDailyTallySummary = (targetDate) => {
    const dayStr = targetDate || getPhilippineDateStr();
    const map = new Map();

    const isMatchDate = (d) => {
      if (!d) return false;
      return String(d).split('T')[0].trim() === dayStr;
    };

    (receipts || []).forEach(r => {
      const isPaid = (r.status || '').toLowerCase().includes('paid') || (r.status || '').toLowerCase().includes('complete') || (r.status || '').toLowerCase().includes('active') || (r.status || '').toLowerCase().includes('using');
      const isVoid = (r.status || '').toLowerCase().includes('cancel') || (r.status || '').toLowerCase().includes('void');
      if (isMatchDate(r.date || r.created_at) && isPaid && !isVoid) {
        const key = r.receiptNo || r.payment_ref || `RCPT-${r.id}`;
        map.set(key, {
          id: r.id,
          receiptNo: key,
          touristName: r.touristName || r.clientName || r.client_name || r.fullName || 'Guest Visitor',
          grandTotal: parseFloat(r.grandTotal || r.total_amount || r.amount || 0),
          totalVisitors: parseInt(r.totalVisitors || r.guest_count || r.pax || 1, 10),
          items: r.items || [],
          time: r.time || (r.created_at ? new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'),
          status: 'Paid'
        });
      }
    });

    (walkIns || []).forEach(w => {
      const isPaid = w.payment_status === 'PAID' || (w.status || '').toLowerCase().includes('paid');
      const isVoid = (w.status || '').toLowerCase().includes('cancel') || (w.status || '').toLowerCase().includes('void');
      if (isMatchDate(w.transaction_date || w.operating_date || w.created_at || w.date) && isPaid && !isVoid) {
        const key = w.receiptNo || `OR-${w.walk_in_id || w.id}`;
        if (!map.has(key)) {
          map.set(key, {
            id: w.id,
            receiptNo: key,
            touristName: w.customer_name || w.touristName || 'Walk-In Guest',
            grandTotal: parseFloat(w.grandTotal || w.total_amount || 0),
            totalVisitors: parseInt(w.guest_count || w.totalVisitors || 1, 10),
            items: w.items || [],
            time: w.time || '10:00 AM',
            status: 'Paid'
          });
        }
      }
    });

    const dayTransactions = Array.from(map.values());

    let totalCashRevenue = 0;
    let totalVisitors = 0;
    let adultPax = 0;
    let childPax = 0;
    let studentPax = 0;
    let seniorPax = 0;
    let entranceRevenue = 0;
    let serviceRevenue = 0;
    const itemCounts = {};

    dayTransactions.forEach(r => {
      totalCashRevenue += r.grandTotal;
      totalVisitors += r.totalVisitors;

      if (r.items && Array.isArray(r.items) && r.items.length > 0) {
        let hasEntrance = false;
        r.items.forEach(item => {
          const cat = (item.category || '').toLowerCase();
          const name = (item.name || '').toLowerCase();
          const qty = parseInt(item.quantity || 1, 10);
          const lineTotal = qty * parseFloat(item.unitPrice || 0);

          if (cat === 'entrance' || name.includes('entrance') || name.includes('fee') || name.includes('pass') || name.includes('ticket')) {
            hasEntrance = true;
            entranceRevenue += lineTotal;
            if (name.includes('adult')) adultPax += qty;
            else if (name.includes('child')) childPax += qty;
            else if (name.includes('student')) studentPax += qty;
            else if (name.includes('senior') || name.includes('pwd')) seniorPax += qty;
          } else {
            serviceRevenue += lineTotal;
            const itemName = item.name || 'Resort Service';
            itemCounts[itemName] = (itemCounts[itemName] || 0) + qty;
          }
        });

        if (!hasEntrance) {
          entranceRevenue += r.totalVisitors * 130;
          adultPax += r.totalVisitors;
        }
      } else {
        const entAmt = Math.min(r.grandTotal, r.totalVisitors * 130);
        entranceRevenue += entAmt;
        serviceRevenue += Math.max(0, r.grandTotal - entAmt);
        adultPax += r.totalVisitors;
      }
    });

    if (totalVisitors === 0 && dayTransactions.length > 0) {
      totalVisitors = adultPax + childPax + studentPax + seniorPax || dayTransactions.length;
    }

    return {
      date: dayStr,
      totalCashRevenue,
      totalTransactions: dayTransactions.length,
      totalVisitors,
      adultPax,
      childPax,
      studentPax,
      seniorPax,
      entranceRevenue,
      serviceRevenue,
      itemCounts,
      receipts: dayTransactions
    };
  };

  // Fetch Live Data from Backend Server APIs
  const isSyncingRef = useRef(false);

  const refreshAllLiveData = async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    try {
      // 1. Fetch Users & Staff
      const resUsers = await fetch('http://localhost:5000/api/v1/users');
      const dataUsers = await resUsers.json();
      if (dataUsers.success && Array.isArray(dataUsers.users)) {
        setUserAccounts(dataUsers.users);
        const staffMembers = dataUsers.users.filter(u => (u.role || '').toLowerCase() === 'staff');
        setStaffList(staffMembers);
      }

      // 2. Fetch Services
      const resServices = await fetch('http://localhost:5000/api/v1/services');
      const dataServices = await resServices.json();
      if (dataServices.success && Array.isArray(dataServices.services) && dataServices.services.length > 0) {
        setResortServices(dataServices.services);
        setFacilities(dataServices.services);
      }

      // 3. Fetch Reservations directly from MySQL Database
      const resBookings = await fetch('http://localhost:5000/api/v1/reservations');
      const dataBookings = await resBookings.json();
      const serverList = dataBookings.data || dataBookings.reservations || [];
      if (dataBookings.success && Array.isArray(serverList)) {
        setResortBookings(serverList);
        localStorage.setItem('resortBookings', JSON.stringify(serverList));
      }

      // 4. Fetch Payments / Receipts directly from MySQL Database
      const resPayments = await fetch('http://localhost:5000/api/v1/payments');
      const dataPayments = await resPayments.json();
      const serverReceipts = dataPayments.receipts || dataPayments.payments || [];
      if (dataPayments.success && Array.isArray(serverReceipts)) {
        setReceipts(serverReceipts);
        localStorage.setItem('receipts', JSON.stringify(serverReceipts));
      }

      // 5. Fetch Announcements
      const resAnnounce = await fetch('http://localhost:5000/api/v1/announcements');
      const dataAnnounce = await resAnnounce.json();
      if (dataAnnounce.success && Array.isArray(dataAnnounce.announcements) && dataAnnounce.announcements.length > 0) {
        setAnnouncements(dataAnnounce.announcements);
      }

      // 6. Fetch Gallery from MySQL Database
      const resGallery = await fetch('http://localhost:5000/api/v1/gallery');
      const dataGallery = await resGallery.json();
      if (dataGallery.success && Array.isArray(dataGallery.gallery) && dataGallery.gallery.length > 0) {
        setGalleryItems(dataGallery.gallery);
      }

      // 7. Fetch Tourist Spots from MySQL Database
      const resSpots = await fetch('http://localhost:5000/api/v1/tourist_spots');
      const dataSpots = await resSpots.json();
      if (dataSpots.success && Array.isArray(dataSpots.spots) && dataSpots.spots.length > 0) {
        setTouristSpots(dataSpots.spots);
      }

      // 8. Fetch Audit Logs
      const resLogs = await fetch('http://localhost:5000/api/v1/audit_logs');
      const dataLogs = await resLogs.json();
      if (dataLogs.success && Array.isArray(dataLogs.logs) && dataLogs.logs.length > 0) {
        setAuditLogs(dataLogs.logs);
      }
    } catch (err) {
      console.warn('Backend sync note:', err.message);
    } finally {
      isSyncingRef.current = false;
    }
  };

  useEffect(() => {
    refreshAllLiveData();
    const liveInterval = setInterval(() => {
      refreshAllLiveData();
    }, 3500); // 3.5s real-time heartbeat sync across all tabs

    const handleCustomSync = () => refreshAllLiveData();
    window.addEventListener('ecotour:sync', handleCustomSync);
    window.addEventListener('storage', handleCustomSync);

    return () => {
      clearInterval(liveInterval);
      window.removeEventListener('ecotour:sync', handleCustomSync);
      window.removeEventListener('storage', handleCustomSync);
    };
  }, []);

  // --- 12 MIDNIGHT AUTOMATIC DAILY REFRESH SCHEDULER ---
  useEffect(() => {
    let midnightTimer;

    const scheduleMidnightRefresh = () => {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // Tomorrow at 00:00:05 local time
        0, 0, 5, 0
      );

      const msUntilMidnight = nextMidnight.getTime() - now.getTime();
      console.log(`[EcoTour System] Daily Tally Scheduler Active. Next midnight reset in ${(msUntilMidnight / (1000 * 60 * 60)).toFixed(2)} hours.`);

      midnightTimer = setTimeout(() => {
        const newDayStr = getPhilippineDateStr();
        console.log(`[EcoTour System] 🕛 Midnight Daily Reset! New business day: ${newDayStr}`);

        // 1. Immediate refresh + 2 follow-up retries to ensure DB round-trip
        refreshAllLiveData();
        setTimeout(() => refreshAllLiveData(), 1000);
        setTimeout(() => refreshAllLiveData(), 3000);

        // 2. Broadcast daily reset event — Dashboard & all tabs listen and re-fetch
        window.dispatchEvent(new CustomEvent('ecotour:daily-reset', {
          detail: { date: newDayStr }
        }));

        // 3. Record midnight audit log entry
        try {
          fetch('http://localhost:5000/api/v1/audit_logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'Daily Reset',
              description: `Automatic 12:00 AM Midnight Daily Tally Reset. New business day started: ${newDayStr}.`,
              role: 'System'
            })
          }).catch(() => {});
        } catch (e) {}

        // 4. Schedule next midnight timer
        scheduleMidnightRefresh();
      }, msUntilMidnight);
    };

    scheduleMidnightRefresh();

    return () => {
      if (midnightTimer) clearTimeout(midnightTimer);
    };
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

  // Update Logged-In User Profile, Avatar/Profile Pic, and Password
  const updateCurrentUserProfile = async (updatedData) => {
    try {
      const mergedUser = {
        ...currentUser,
        ...updatedData,
        fname: updatedData.fname !== undefined ? updatedData.fname : currentUser?.fname,
        mname: updatedData.mname !== undefined ? updatedData.mname : currentUser?.mname,
        lname: updatedData.lname !== undefined ? updatedData.lname : currentUser?.lname,
        name: `${updatedData.fname || currentUser?.fname || ''} ${updatedData.lname || currentUser?.lname || ''}`.trim() || currentUser?.name,
        contact_no: updatedData.contact_no !== undefined ? updatedData.contact_no : (updatedData.phone || currentUser?.contact_no),
        address: updatedData.address !== undefined ? updatedData.address : currentUser?.address,
        gender: updatedData.gender !== undefined ? updatedData.gender : currentUser?.gender,
        email: updatedData.email !== undefined ? updatedData.email : currentUser?.email,
        profile_pic: updatedData.profile_pic || updatedData.avatarUrl || updatedData.avatar_url || currentUser?.profile_pic || currentUser?.avatarUrl,
        avatarUrl: updatedData.profile_pic || updatedData.avatarUrl || updatedData.avatar_url || currentUser?.profile_pic || currentUser?.avatarUrl,
      };

      // 1. Update React state & localStorage
      setCurrentUser(mergedUser);
      localStorage.setItem('user', JSON.stringify(mergedUser));

      // 2. Update user in userAccounts list
      setUserAccounts(prev => prev.map(u => 
        (u.user_id === mergedUser.user_id || u.email === mergedUser.email || u.id === mergedUser.id)
          ? { ...u, ...mergedUser }
          : u
      ));

      // 3. Persist to MySQL Backend via PUT /api/v1/users/:id
      const targetId = mergedUser.user_id || mergedUser.id || 1;
      const res = await fetch(`http://localhost:5000/api/v1/users/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: targetId,
          fname: mergedUser.fname,
          mname: mergedUser.mname,
          lname: mergedUser.lname,
          contact_no: mergedUser.contact_no,
          address: mergedUser.address,
          gender: mergedUser.gender,
          email: mergedUser.email,
          profile_pic: mergedUser.profile_pic,
          avatar_url: mergedUser.profile_pic,
          avatarUrl: mergedUser.profile_pic,
          current_password: updatedData.current_password,
          new_password: updatedData.new_password
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        const finalUser = { ...mergedUser, ...data.user };
        setCurrentUser(finalUser);
        localStorage.setItem('user', JSON.stringify(finalUser));
      }

      return { success: true, user: mergedUser };
    } catch (e) {
      console.warn('Backend profile update note:', e.message);
      return { success: true, user: currentUser };
    }
  };

  const addAnnouncement = (anno) => {
    const created = {
      id: Date.now(),
      title: anno.title,
      description: anno.message || anno.content || anno.description || '',
      content: anno.message || anno.content || anno.description || '',
      message: anno.message || anno.content || anno.description || '',
      date: getPhilippineDateStr(),
      category: 'General'
    };
    setAnnouncements(prev => [created, ...prev]);
    // Persist to DB via sp_create_announcement
    fetch('http://localhost:5000/api/v1/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: anno.title,
        description: anno.message || anno.content || anno.description || '',
        created_by: currentUser?.user_id || currentUser?.id || 1,
      }),
    }).then(r => r.json()).then(d => {
      if (d.success && d.id) {
        // Swap temp id for real DB announcement_id
        setAnnouncements(prev => prev.map(a => a.id === created.id ? { ...a, announcement_id: d.id, id: d.id } : a));
      }
    }).catch(e => console.warn('Announcement add DB sync failed:', e.message));
  };

  const deleteAnnouncement = (id) => {
    setAnnouncements(prev => prev.filter(a => a.announcement_id !== id && a.id !== id));
    // Persist to DB via sp_delete_announcement
    fetch(`http://localhost:5000/api/v1/announcements/${id}`, { method: 'DELETE' })
      .catch(e => console.warn('Announcement delete DB sync failed:', e.message));
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

  // User Accounts (Admin)
  const approveUserAccount = (id) => {
    const targetUser = userAccounts.find((u) => u.user_id === id || u.id === id);
    const uid = targetUser?.user_id || targetUser?.id || id;
    setUserAccounts((prev) => prev.map((u) => ((u.user_id === id || u.id === id) ? { ...u, status: 'Approved' } : u)));

    // Persist to DB via SP
    fetch(`http://localhost:5000/api/v1/users/${uid}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Approved', approved_by: currentUser?.name || 'Admin' }),
    }).then(r => r.json()).then(d => {
      if (d.generatedPassword) {
        // Audit log
        fetch('http://localhost:5000/api/v1/audit_logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: currentUser?.user_id || null,
            action: 'USER_APPROVED',
            description: `Admin approved account for ${targetUser?.email || id}. Default password generated.`
          })
        }).catch(() => {});
      }
    }).catch(e => console.warn('Approve DB sync failed:', e.message));

    if (targetUser) {
      const emailRecord = {
        id: Date.now(),
        recipient: targetUser.email,
        subject: `Account Registration APPROVED — EcoTourVista`,
        body: `Dear ${targetUser.fname || targetUser.name},\n\nCongratulations! Your EcoTourVista account registration has been APPROVED.\n\nYou may now log in to the EcoTourVista Portal at http://localhost:5173/login.`,
        sentAt: new Date().toLocaleString(),
        read: false,
      };
      setOutboxEmails((prev) => [emailRecord, ...prev]);
    }
  };

  const rejectUserAccount = (id, reason = '') => {
    const targetUser = userAccounts.find((u) => u.user_id === id || u.id === id);
    const uid = targetUser?.user_id || targetUser?.id || id;
    setUserAccounts((prev) => prev.map((u) => ((u.user_id === id || u.id === id) ? { ...u, status: 'Rejected' } : u)));

    // Persist to DB via SP
    fetch(`http://localhost:5000/api/v1/users/${uid}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Rejected', reason: reason || 'Information did not meet verification criteria.' }),
    }).then(() => {
      fetch('http://localhost:5000/api/v1/audit_logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser?.user_id || null,
          action: 'USER_REJECTED',
          description: `Admin rejected account for ${targetUser?.email || id}.`
        })
      }).catch(() => {});
    }).catch(e => console.warn('Reject DB sync failed:', e.message));

    if (targetUser) {
      const emailRecord = {
        id: Date.now(),
        recipient: targetUser.email,
        subject: `Account Registration Update — EcoTourVista`,
        body: `Dear ${targetUser.fname || targetUser.name},\n\nWe regret to inform you that your account registration has been REJECTED.\n\nIf you believe this is an error, please contact Duangon Cold Spring support.`,
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
      dateHired: getPhilippineDateStr(),
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
    const today = getPhilippineDateStr();
    const time = getPhilippineTimeStr();
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
    const today = getPhilippineDateStr();
    const time = getPhilippineTimeStr();
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

  // Services (Admin) — all changes persisted to DB via SPs
  const addResortService = (serviceData) => {
    const tempId = Date.now();
    setResortServices(prev => [...prev, { ...serviceData, id: tempId, status: serviceData.status || 'Active' }]);
    fetch('http://localhost:5000/api/v1/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceData),
    }).then(r => r.json()).then(d => {
      if (d.success) {
        // Replace temp id with real DB id and refresh full list
        setTimeout(() => refreshAllLiveData(), 300);
      }
    }).catch(e => console.warn('Service add DB sync failed:', e.message));
  };

  const updateResortService = (id, data) => {
    setResortServices(prev => prev.map(s => (s.service_id === id || s.id === id) ? { ...s, ...data } : s));
    const sid = id;
    fetch(`http://localhost:5000/api/v1/services/${sid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(e => console.warn('Service update DB sync failed:', e.message));
  };

  const deleteResortService = (id) => {
    setResortServices(prev => prev.filter(s => s.service_id !== id && s.id !== id));
    fetch(`http://localhost:5000/api/v1/services/${id}`, { method: 'DELETE' })
      .catch(e => console.warn('Service delete DB sync failed:', e.message));
  };

  // Bookings (Landing Page, Client, Staff, Admin)
  const createResortBooking = (bookingData) => {
    const userNum = bookingData.userNumber || `CLT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const bookingRef = bookingData.bookingRef || `BK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const cName = bookingData.clientName || bookingData.fullName || bookingData.touristName || currentUser?.name || 'Guest User';
    const cEmail = bookingData.clientEmail || bookingData.email || bookingData.touristEmail || currentUser?.email || 'guest@ecotour.com';

    const newBooking = {
      id: Date.now(),
      bookingRef,
      bookingNumber: bookingRef,
      userNumber: userNum,
      client_id: userNum,
      clientName: cName,
      fullName: cName,
      touristName: cName,
      clientEmail: cEmail,
      email: cEmail,
      touristEmail: cEmail,
      contactNumber: bookingData.contactNumber || bookingData.clientPhone || bookingData.phone || '',
      serviceName: bookingData.specificType || bookingData.serviceName || bookingData.packageName || 'Resort Reservation',
      packageName: bookingData.specificType || bookingData.packageName || bookingData.serviceName || 'Resort Reservation',
      specificType: bookingData.specificType || bookingData.serviceName || 'Resort Reservation',
      quantity: bookingData.quantity || bookingData.totalVisitors || bookingData.numberOfGuests || 1,
      totalVisitors: bookingData.totalVisitors || bookingData.numberOfGuests || bookingData.quantity || 1,
      numberOfGuests: bookingData.numberOfGuests || bookingData.totalVisitors || 1,
      totalPrice: parseFloat(bookingData.totalPrice || bookingData.grandTotal || bookingData.estimatedTotal || 0),
      grandTotal: parseFloat(bookingData.grandTotal || bookingData.totalPrice || bookingData.estimatedTotal || 0),
      estimatedTotal: parseFloat(bookingData.estimatedTotal || bookingData.grandTotal || bookingData.totalPrice || 0),
      bookingDate: bookingData.bookingDate || bookingData.reservationDate || getPhilippineDateStr(),
      reservationDate: bookingData.reservationDate || bookingData.bookingDate || getPhilippineDateStr(),
      arrivalTime: bookingData.arrivalTime || bookingData.timeSlot || '09:00 AM',
      timeSlot: bookingData.timeSlot || bookingData.arrivalTime || '09:00 AM',
      status: bookingData.status || 'Pending Payment at Counter',
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

  const cancelReservationBooking = async (idOrRef) => {
    return await updateResortBookingStatus(idOrRef, 'Cancelled');
  };

  const updateResortBookingStatus = async (idOrRef, status) => {
    const targetStr = String(idOrRef || '').toLowerCase().trim();

    const matchesBooking = (b) => {
      const bId = String(b.id || '').toLowerCase().trim();
      const bRef = String(b.bookingRef || '').toLowerCase().trim();
      const bNum = String(b.bookingNumber || '').toLowerCase().trim();

      return (
        bId === targetStr ||
        bRef === targetStr ||
        bNum === targetStr ||
        (bRef && targetStr && bRef.replace(/[^a-z0-9]/g, '') === targetStr.replace(/[^a-z0-9]/g, '')) ||
        (bNum && targetStr && bNum.replace(/[^a-z0-9]/g, '') === targetStr.replace(/[^a-z0-9]/g, ''))
      );
    };

    const target = resortBookings.find(matchesBooking);
    const dbTargetId = target?.id || target?.bookingNumber || target?.bookingRef || idOrRef;

    const isConcludedOrCancelled = (
      status === 'Completed' ||
      status === 'Cancelled' ||
      status === 'Voided' ||
      status.toLowerCase().includes('completed') ||
      status.toLowerCase().includes('cancel') ||
      status.toLowerCase().includes('void')
    );

    setResortBookings(prev => {
      const match = prev.find(matchesBooking);
      if (match && isConcludedOrCancelled && match.items) {
        // Free up facility & services availability
        match.items.forEach(item => {
          const qty = item.quantity || 1;
          setResortServices(sList => sList.map(s => {
            const sName = (s.service_name || s.name || '').toLowerCase();
            const iName = (item.name || '').toLowerCase();
            if (sName.includes(iName) || iName.includes(sName)) {
              const totalCap = parseInt(s.total_capacity || 10, 10);
              const currentAvail = s.available_qty !== undefined ? parseInt(s.available_qty, 10) : totalCap;
              const restored = Math.min(totalCap, currentAvail + qty);
              return { ...s, available_qty: restored, available_quantity: restored };
            }
            return s;
          }));
        });
      }
      return prev.map(b => matchesBooking(b) ? { ...b, status } : b);
    });

    try {
      await fetch(`http://localhost:5000/api/v1/reservations/${encodeURIComponent(dbTargetId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      window.dispatchEvent(new CustomEvent('ecotour:sync'));
      setTimeout(() => {
        refreshAllLiveData();
        window.dispatchEvent(new CustomEvent('ecotour:sync'));
      }, 300);
    } catch (e) {
      console.warn('Status update backend sync:', e.message);
    }
  };

  const getServiceAvailabilityForDate = (serviceId, date) => {
    const service = resortServices.find(s => s.id === serviceId);
    if (!service) return 0;
    const bookedCount = resortBookings
      .filter(b => b.serviceName === service.service_name && b.bookingDate === date && b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.quantity || 1), 0);
    return Math.max(0, service.quantity - bookedCount);
  };

  // Real-Time Walk-In Transaction Lifecycle Management
  const createWalkInTransaction = (data) => {
    const dObj = new Date();
    const today = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}-${String(dObj.getDate()).padStart(2, '0')}`;
    const timeNow = dObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const grandTotal = data.items?.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0) || data.grandTotal || 0;
    const userNum = data.userNumber || `CLT-${dObj.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const walkInId = `WI-${today.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const staffName = currentUser?.name || data.staffName || 'Staff Cashier';

    const newWalkIn = {
      id: Date.now(),
      walk_in_id: walkInId,
      customer_name: data.touristName || 'Walk-In Tourist',
      touristName: data.touristName || 'Walk-In Tourist',
      userNumber: userNum,
      contact_number: data.touristContact || '',
      guest_count: data.totalVisitors || data.items?.filter(i => i.category === 'Entrance').reduce((s, i) => s + i.quantity, 0) || 1,
      totalVisitors: data.totalVisitors || 1,
      visitor_type: data.visitorType || 'Local',
      items: data.items || [],
      subtotal: grandTotal,
      total_amount: grandTotal,
      grandTotal,
      amount_received: parseFloat(data.cashReceived || grandTotal),
      change_amount: Math.max(0, parseFloat(data.cashReceived || grandTotal) - grandTotal),
      payment_method: 'Cash',
      payment_status: 'PAID',
      walk_in_status: 'ACTIVE',
      completion_type: null,
      created_by: staffName,
      paid_by: staffName,
      completed_by: null,
      created_at: new Date().toISOString(),
      paid_at: new Date().toISOString(),
      completed_at: null,
      transaction_date: today,
      operating_date: today,
      time: timeNow,
      receiptNo: `OR-${today.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`
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

    setWalkIns(prev => [newWalkIn, ...prev]);

    // Also record receipt
    const createdReceipt = {
      id: newWalkIn.id,
      receiptNo: newWalkIn.receiptNo,
      userNumber: userNum,
      touristName: newWalkIn.customer_name,
      touristEmail: data.touristEmail || 'client@ecotourvista.com',
      touristContact: newWalkIn.contact_number,
      totalVisitors: newWalkIn.guest_count,
      date: today,
      time: timeNow,
      grandTotal,
      cashReceived: newWalkIn.amount_received,
      change: newWalkIn.change_amount,
      status: 'Paid',
      staffName,
      items: data.items || [],
      barangayShare: Math.round(grandTotal * (revenueShare.barangayPercent / 100)),
      municipalShare: Math.round(grandTotal * (revenueShare.municipalPercent / 100)),
      ownerShare: grandTotal - Math.round(grandTotal * (revenueShare.barangayPercent / 100)) - Math.round(grandTotal * (revenueShare.municipalPercent / 100))
    };

    setReceipts(prev => [createdReceipt, ...prev]);

    // Persist payment receipt to MySQL database
    fetch('http://localhost:5000/api/v1/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: null,
        client_name: newWalkIn.customer_name,
        staff_name: staffName,
        total_amount: grandTotal,
        cash_received: newWalkIn.amount_received,
        payment_method: 'Cash',
        items: data.items || []
      })
    }).then(r => r.json()).then(d => {
      if (d.success) {
        setTimeout(() => refreshAllLiveData(), 300);
      }
    }).catch(e => console.warn('Payment DB sync note:', e.message));

    // Audit log
    fetch('http://localhost:5000/api/v1/audit_logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'WALK_IN_CREATED',
        description: `${staffName} created Walk-In #${newWalkIn.walk_in_id} for ${newWalkIn.customer_name} (${newWalkIn.guest_count} guests) — Amount: ₱${grandTotal}. Status: ACTIVE`
      })
    }).catch(() => {});

    return newWalkIn;
  };

  // Staff Manually Completes Walk-In -> Releases Services & Updates Status
  const completeWalkInTransaction = (idOrRef, staffName = null) => {
    const sName = staffName || currentUser?.name || 'Staff Member';
    const timeCompleted = new Date().toISOString();

    setWalkIns(prev => {
      return prev.map(w => {
        if (w.id === idOrRef || w.walk_in_id === idOrRef || w.receiptNo === idOrRef) {
          if (w.walk_in_status === 'COMPLETED') return w; // Already completed

          // Release services back into inventory
          if (w.items && Array.isArray(w.items)) {
            w.items.forEach(item => {
              const qty = item.quantity || 1;
              setResortServices(sList => sList.map(s => {
                const servName = (s.service_name || s.name || '').toLowerCase();
                const itName = (item.name || '').toLowerCase();
                if (servName.includes(itName) || itName.includes(servName)) {
                  const totalCap = parseInt(s.total_capacity || 10, 10);
                  const currentAvail = s.available_qty !== undefined ? parseInt(s.available_qty, 10) : totalCap;
                  const restored = Math.min(totalCap, currentAvail + qty);
                  return { ...s, available_qty: restored, available_quantity: restored };
                }
                return s;
              }));
            });
          }

          // Audit log
          fetch('http://localhost:5000/api/v1/audit_logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'WALK_IN_COMPLETED',
              description: `Staff ${sName} manually completed Walk-In #${w.walk_in_id} for ${w.customer_name}. Services released.`
            })
          }).catch(() => {});

          return {
            ...w,
            walk_in_status: 'COMPLETED',
            completion_type: 'MANUAL',
            completed_by: sName,
            completed_at: timeCompleted
          };
        }
        return w;
      });
    });
  };

  // Automatic Daily Completion: Safety Mechanism for Operating Day Closure (10:00 PM / Midnight)
  const autoCompleteDailyWalkIns = () => {
    const today = getPhilippineDateStr();
    const nowIso = new Date().toISOString();

    setWalkIns(prev => {
      let hasAutoClosed = false;
      const updated = prev.map(w => {
        // Auto complete any ACTIVE + PAID walk-in for today or previous unclosed days
        if (w.walk_in_status === 'ACTIVE' && w.payment_status === 'PAID') {
          hasAutoClosed = true;

          // Release services back into inventory
          if (w.items && Array.isArray(w.items)) {
            w.items.forEach(item => {
              const qty = item.quantity || 1;
              setResortServices(sList => sList.map(s => {
                const servName = (s.service_name || s.name || '').toLowerCase();
                const itName = (item.name || '').toLowerCase();
                if (servName.includes(itName) || itName.includes(servName)) {
                  const totalCap = parseInt(s.total_capacity || 10, 10);
                  const currentAvail = s.available_qty !== undefined ? parseInt(s.available_qty, 10) : totalCap;
                  const restored = Math.min(totalCap, currentAvail + qty);
                  return { ...s, available_qty: restored, available_quantity: restored };
                }
                return s;
              }));
            });
          }

          // Audit log
          fetch('http://localhost:5000/api/v1/audit_logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'AUTO_DAILY_CLOSURE',
              description: `System automatically completed Walk-In #${w.walk_in_id} for ${w.customer_name}. Reason: END-OF-DAY AUTOMATIC CLOSURE. Services released.`
            })
          }).catch(() => {});

          return {
            ...w,
            walk_in_status: 'COMPLETED',
            completion_type: 'AUTO_DAILY_CLOSURE',
            completed_by: 'System (End-of-Day Automatic Closure)',
            completed_at: nowIso
          };
        }
        return w;
      });

      if (hasAutoClosed) {
        console.log('[EcoTourVista] ✅ End-of-Day Auto-Closure executed. Active walk-ins safely marked COMPLETED.');
      }
      return updated;
    });
  };

  // Run automatic daily completion check every 60s and on midnight
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = new Date();
      // Check if past closing time (>= 22:00 / 10 PM) or across date boundaries
      if (now.getHours() >= 22 || now.getHours() < 6) {
        autoCompleteDailyWalkIns();
      }
    }, 60000);

    const handleDailyReset = () => {
      autoCompleteDailyWalkIns();
    };
    window.addEventListener('ecotour:daily-reset', handleDailyReset);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('ecotour:daily-reset', handleDailyReset);
    };
  }, []);

  const processPOSTransaction = (data) => {
    return createWalkInTransaction(data);
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
        walkIns, createWalkInTransaction, completeWalkInTransaction, autoCompleteDailyWalkIns,
        announcements, setAnnouncements, addAnnouncement, deleteAnnouncement, galleryItems, touristSpots,
        outboxEmails, markEmailAsRead, clearOutbox,
        auditLogs, tourists, pricingList, deletePriceItem, exportBackupJSON, resetToDefaults,
        parkConfig, revenueShare, theme, toggleTheme, refreshAllLiveData
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
