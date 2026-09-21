import React, { useState, useEffect } from 'react';
import {
  Package, Calendar, CheckCircle2, Clock, RefreshCw,
  Home, Users, Droplets, Utensils, Trees, Search, ShieldCheck, Plus, Minus, Sparkles, User, AlertCircle, RotateCw, Image as ImageIcon, X, Info
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';
import { getStageIndex } from '../../../components/VerticalReservationTimeline';
import ServiceDetailsModal from '../../../components/ServiceDetailsModal';

import swimmingImg from '../../../assets/images/services/swimming.png';
import cottageImg from '../../../assets/images/services/cottage.png';
import tableImg from '../../../assets/images/services/table.png';
import vestImg from '../../../assets/images/services/lifevest.png';
import videokeImg from '../../../assets/images/services/videoke.png';
import floatingImg from '../../../assets/images/services/floating.png';
import tentImg from '../../../assets/images/services/tent.png';
import roomImg from '../../../assets/images/services/room.png';
import eventImg from '../../../assets/images/services/event.png';
import buffetImg from '../../../assets/images/services/buffet.png';
import parkingImg from '../../../assets/images/services/parking.png';

const resolveFacilityImage = (name = '', category = '', fallback = cottageImg) => {
  const n = (name || '').toLowerCase();
  const c = (category || '').toLowerCase();
  if (n.includes('spring') || n.includes('swim') || n.includes('entrance')) return swimmingImg;
  if (n.includes('table') || c.includes('table')) return tableImg;
  if (n.includes('vest') || c.includes('safety')) return vestImg;
  if (n.includes('videoke') || n.includes('karaoke') || c.includes('entertainment')) return videokeImg;
  if (n.includes('kayak') || n.includes('floating') || c.includes('water')) return floatingImg;
  if (n.includes('tent') || n.includes('camping')) return tentImg;
  if (n.includes('room') || n.includes('kubo') || n.includes('accommodat')) return roomImg;
  if (n.includes('pavilion') || n.includes('event')) return eventImg;
  if (n.includes('buffet') || n.includes('catering')) return buffetImg;
  if (n.includes('parking') || n.includes('vehicle')) return parkingImg;
  return fallback;
};

const DEFAULT_UNITS = [
  { id: 'DSVC-001', name: 'Cold Spring Pool Entrance Ticket', category: 'Entrance', capacity: '300 Pax', price: 100, total: 300, icon: Users, description: 'Day pass access to natural cold spring pool', img: swimmingImg },
  { id: 'DSVC-002', name: 'Standard Open Cottage', category: 'Cottages', capacity: '10 Pax', price: 600, total: 10, icon: Home, description: 'Shaded native open cottage near pool', img: cottageImg },
  { id: 'DSVC-003', name: 'Large Family Covered Cottage', category: 'Cottages', capacity: '20 Pax', price: 1000, total: 6, icon: Home, description: 'Heavy-duty steel roofed mega cottage', img: cottageImg },
  { id: 'DSVC-004', name: 'Executive Umbrella Shade', category: 'Cottages', capacity: '6 Pax', price: 400, total: 15, icon: Home, description: 'Waterfront shaded umbrella with round table', img: tableImg },
  { id: 'DSVC-005', name: 'Resort Table & Chairs Set', category: 'Tables', capacity: '4 Pax', price: 250, total: 15, icon: Utensils, description: '1 Table + 4 monoblock chairs', img: tableImg },
  { id: 'DSVC-006', name: 'Life Vest / Safety Gear', category: 'Safety & Parking', capacity: '1 Pax', price: 50, total: 30, icon: ShieldCheck, description: 'Adult & Kid safety flotation vest', img: vestImg },
  { id: 'DSVC-007', name: 'Videoke Karaoke System', category: 'Entertainment', capacity: '20 Pax', price: 500, total: 4, icon: Droplets, description: 'Heavy-duty Videoke sound system', img: videokeImg },
  { id: 'DSVC-008', name: 'Kayak / Floating Pad Rental', category: 'Water Activities', capacity: '2 Pax', price: 300, total: 5, icon: Droplets, description: '1-hour kayak & water pad rental', img: floatingImg },
  { id: 'DSVC-009', name: 'Camping Pitch & Tent', category: 'Accommodations', capacity: '4 Pax', price: 450, total: 8, icon: Trees, description: 'Overnight camping slot & tent', img: tentImg },
  { id: 'DSVC-010', name: 'Aircon Kubo Guest Room', category: 'Accommodations', capacity: '6 Pax', price: 1500, total: 4, icon: Home, description: 'Private aircon room with bed & bath', img: roomImg },
  { id: 'DSVC-011', name: 'Private Event Pavilion', category: 'Dining & Events', capacity: '50 Pax', price: 3500, total: 2, icon: Home, description: 'Family gatherings & private events', img: eventImg },
  { id: 'DSVC-012', name: 'Buffet & Catering Station', category: 'Dining & Events', capacity: '50 Pax', price: 450, total: 50, icon: Utensils, description: 'Native buffet catering package', img: buffetImg },
  { id: 'DSVC-013', name: 'Secured Resort Parking Slot', category: 'Safety & Parking', capacity: '1 Vehicle', price: 50, total: 40, icon: ShieldCheck, description: 'Safe vehicle parking for cars & vans', img: parkingImg },
];

export default function AvailabilityTab() {
  const { resortServices, resortBookings, reservations, walkIns = [], theme, refreshAllLiveData } = useEcoTour();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('tracker'); // 'tracker' | 'gallery'
  const [flippedCards, setFlippedCards] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalService, setModalService] = useState(null);
  const isLight = theme === 'light';

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (refreshAllLiveData) await refreshAllLiveData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // Active bookings & walk-ins
  const allBookings = resortBookings?.length ? resortBookings : (reservations || []);
  const inServiceBookings = allBookings.filter(b => {
    const status = (b.status || '').toLowerCase();
    const isConcluded = status.includes('completed') || status.includes('cancel') || status.includes('void') || status.includes('checkout') || status.includes('checked out') || status.includes('done');
    const isPaidOrInService = status.includes('paid') || status.includes('using') || status.includes('in resort') || status.includes('checked in') || status.includes('active') || status.includes('confirmed');
    return isPaidOrInService && !isConcluded;
  });

  // Helper to calculate active occupancy and list in-use guests
  const getInUseForService = (serviceName, serviceCode) => {
    const sName = (serviceName || '').toLowerCase().trim();
    const sCode = (serviceCode || '').toLowerCase().trim();
    let count = 0;
    const activeGuests = [];
    const trackedKeys = new Set();

    // 1. In-service / Active Reservations
    allBookings.forEach(b => {
      const status = (b.status || '').toLowerCase();
      const isConcluded = (
        status.includes('completed') ||
        status.includes('cancel') ||
        status.includes('void') ||
        status.includes('checkout') ||
        status.includes('checked out') ||
        status.includes('done')
      );
      const isPaidOrInService = (
        status.includes('paid') ||
        status.includes('using') ||
        status.includes('in resort') ||
        status.includes('checked in') ||
        status.includes('active') ||
        status.includes('confirmed')
      );

      // Track references to prevent duplicate counting
      if (b.walk_in_id) trackedKeys.add(String(b.walk_in_id).toLowerCase());
      if (b.bookingRef) trackedKeys.add(String(b.bookingRef).toLowerCase());
      if (b.bookingNumber) trackedKeys.add(String(b.bookingNumber).toLowerCase());
      if (b.id) trackedKeys.add(String(b.id).toLowerCase());

      // If client completed stay or cancelled, items are returned! DO NOT count as in-use!
      if (!isPaidOrInService || isConcluded) {
        return;
      }

      const ref = b.bookingRef || b.bookingNumber || `BK-${b.id}`;
      const guestName = b.clientName || b.fullName || b.touristName || 'Guest';

      if (Array.isArray(b.items) && b.items.length > 0) {
        b.items.forEach(it => {
          const itName = (it.name || it.serviceName || '').toLowerCase();
          const itCode = (it.service_code || '').toLowerCase();
          if (itName.includes(sName) || sName.includes(itName) || (sCode && itCode === sCode)) {
            const qty = parseInt(it.quantity || 1, 10);
            count += qty;
            activeGuests.push({ ref, guestName, qty, time: b.arrivalTime || '09:00 AM' });
          }
        });
      } else {
        const bSvc = (b.specificType || b.serviceName || b.packageName || '').toLowerCase();
        if (bSvc.includes(sName) || sName.includes(bSvc)) {
          const qty = parseInt(b.quantity || b.totalVisitors || 1, 10);
          count += qty;
          activeGuests.push({ ref, guestName, qty, time: b.arrivalTime || '09:00 AM' });
        }
      }
    });

    // 2. Active Walk-Ins (avoiding double-counting with allBookings)
    (walkIns || []).forEach(w => {
      const wIdStr = String(w.id || '').toLowerCase();
      const wWalkInId = String(w.walk_in_id || '').toLowerCase();
      const wBookingRef = String(w.bookingRef || '').toLowerCase();
      const wReceiptNo = String(w.receiptNo || '').toLowerCase();

      // If already recorded in allBookings, skip to avoid double counting
      if (
        (wWalkInId && trackedKeys.has(wWalkInId)) ||
        (wBookingRef && trackedKeys.has(wBookingRef)) ||
        (wReceiptNo && trackedKeys.has(wReceiptNo)) ||
        (wIdStr && trackedKeys.has(wIdStr))
      ) {
        return;
      }

      const isConcluded = (
        w.walk_in_status === 'COMPLETED' ||
        w.walk_in_status === 'VOIDED' ||
        (w.status || '').toLowerCase().includes('completed') ||
        (w.status || '').toLowerCase().includes('cancel') ||
        (w.status || '').toLowerCase().includes('void') ||
        (w.payment_status || '').toLowerCase().includes('cancel') ||
        (w.payment_status || '').toLowerCase().includes('void')
      );
      const isWalkInActive = (w.walk_in_status === 'ACTIVE' || w.payment_status === 'PAID') && !isConcluded;

      // If completed or voided, services are returned! DO NOT count as in use!
      if (isWalkInActive && Array.isArray(w.items) && w.items.length > 0) {
        const ref = w.receiptNo || w.walk_in_id || `WI-${w.id}`;
        const guestName = w.customer_name || w.touristName || 'Walk-In Guest';

        w.items.forEach(it => {
          const itName = (it.name || it.serviceName || '').toLowerCase();
          const itCode = (it.service_code || '').toLowerCase();
          if (itName.includes(sName) || sName.includes(itName) || (sCode && itCode === sCode)) {
            const qty = parseInt(it.quantity || 1, 10);
            count += qty;
            activeGuests.push({ ref, guestName, qty, time: w.time || '10:00 AM' });
          }
        });
      }
    });

    return { count, activeGuests };
  };

  // Build live units combining catalog + in-service usage
  const baseCatalog = (resortServices && resortServices.length > 0)
    ? resortServices.map((s, idx) => ({
        id: s.service_code || `DSVC-00${idx + 1}`,
        name: s.service_name || s.name,
        category: s.category || 'Cottages',
        capacity: s.total_capacity ? `${s.total_capacity} Pax` : '10 Pax',
        price: typeof s.price === 'number' ? s.price : parseFloat(s.price || 0),
        total: parseInt(s.total_capacity || 10, 10),
        unit: s.unit || 'day',
        description: s.description || 'Full resort amenity available for visitors and booking.',
        img: s.image_url ? s.image_url : resolveFacilityImage(s.service_name || s.name, s.category || ''),
        icon: (s.category || '').toLowerCase().includes('safety') ? ShieldCheck : (s.category || '').toLowerCase().includes('table') ? Utensils : (s.category || '').toLowerCase().includes('water') ? Droplets : Home,
      }))
    : DEFAULT_UNITS;

  const liveUnits = baseCatalog.map(u => {
    const { count: inUseCount, activeGuests } = getInUseForService(u.name, u.id);
    const available = Math.max(0, u.total - inUseCount);
    return {
      ...u,
      inUseCount,
      activeGuests,
      available,
    };
  });

  const categories = [
    'All',
    'Cottages',
    'Accommodations',
    'Water Activities',
    'Tables',
    'Entertainment',
    'Safety & Parking',
    'Dining & Events',
    'Entrance'
  ];

  const filteredUnits = liveUnits.filter((unit) => {
    const cat = (unit.category || '').toLowerCase();
    const matchesCategory =
      selectedCategory === 'All' ||
      cat.includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === 'Accommodations' && (cat.includes('room') || cat.includes('tent') || cat.includes('kubo') || cat.includes('camp') || cat.includes('accommodation'))) ||
      (selectedCategory === 'Water Activities' && (cat.includes('water') || cat.includes('kayak') || cat.includes('swim') || cat.includes('pool'))) ||
      (selectedCategory === 'Safety & Parking' && (cat.includes('safety') || cat.includes('park') || cat.includes('vest'))) ||
      (selectedCategory === 'Dining & Events' && (cat.includes('food') || cat.includes('buffet') || cat.includes('event') || cat.includes('cater')));

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch =
      (unit.name || '').toLowerCase().includes(q) ||
      (unit.id || '').toLowerCase().includes(q) ||
      (unit.category || '').toLowerCase().includes(q) ||
      (unit.capacity || '').toLowerCase().includes(q) ||
      (unit.description || '').toLowerCase().includes(q) ||
      (unit.status || '').toLowerCase().includes(q) ||
      (unit.inUseCount > 0 && ('in use occupied active').includes(q)) ||
      (unit.available > 0 && ('available free vacant').includes(q));

    return matchesCategory && matchesSearch;
  });

  const totalInUseUnits = liveUnits.reduce((acc, u) => acc + u.inUseCount, 0);
  const availableTypesCount = liveUnits.filter(u => u.available > 0).length;
  const fullyOccupiedCount = liveUnits.filter(u => u.available === 0 && u.inUseCount > 0).length;

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const panelBg = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.3)';

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto" style={{ color: 'var(--text)' }}>

      {/* HEADER */}
      <div
        className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-5"
        style={{ borderBottom: '1px solid var(--line)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(74,222,128,0.1)',
              border: '1px solid rgba(74,222,128,0.3)',
              color: 'var(--accent)',
            }}
          >
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
                Real-Time Facility &amp; Cottage Availability
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold animate-pulse" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)' }}>
                ⚡ Auto-Sync with Active Clients
              </span>
            </div>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
              2. Cottage &amp; Resort Add-on Services &amp; Facilities — live automatic occupancy updates when guests start using services.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl border" style={{ background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.4)', borderColor: 'var(--line)' }}>
            <button
              onClick={() => setViewMode('tracker')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'tracker' ? 'bg-[#22c55e] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              ⚡ Live Tracker
            </button>
            <button
              onClick={() => setViewMode('gallery')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'gallery' ? 'bg-[#22c55e] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              🛖 3D Visual Cards
            </button>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all border disabled:opacity-50"
            style={{
              background: isLight ? 'var(--panel)' : 'rgba(6,60,30,0.8)',
              borderColor: 'var(--line)',
              color: 'var(--accent)',
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> {isRefreshing ? 'Refreshing...' : 'Refresh Live Feed'}
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Types */}
        <div
          className="rounded-2xl p-4 flex items-center gap-4 shadow-lg border"
          style={{ borderColor: 'rgba(74,222,128,0.22)', background: isLight ? 'var(--panel)' : '#0c1f16' }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(74,222,128,0.14)', border: '1px solid rgba(74,222,128,0.3)', color: 'var(--accent)' }}
          >
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase block" style={{ color: 'var(--muted)' }}>AVAILABLE SERVICE TYPES</span>
            <div className="text-2xl font-extrabold mt-0.5" style={{ color: 'var(--accent)' }}>{availableTypesCount} Types Free</div>
            <span className="text-[10px] font-semibold" style={{ color: 'var(--muted)' }}>Vacant units ready for clients</span>
          </div>
        </div>

        {/* Currently in use / occupied */}
        <div
          className="rounded-2xl p-4 flex items-center gap-4 shadow-lg border"
          style={{ borderColor: 'rgba(56,189,248,0.3)', background: isLight ? 'var(--panel)' : '#0c1f16' }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(56,189,248,0.14)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8' }}
          >
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase block" style={{ color: 'var(--muted)' }}>CURRENTLY IN USE (ACTIVE)</span>
            <div className="text-2xl font-extrabold mt-0.5" style={{ color: '#38bdf8' }}>{totalInUseUnits} Units Occupied</div>
            <span className="text-[10px] font-semibold" style={{ color: 'var(--muted)' }}>{inServiceBookings.length} Active Checked-In Guests</span>
          </div>
        </div>

        {/* Fully Occupied Facilities */}
        <div
          className="rounded-2xl p-4 flex items-center gap-4 shadow-lg border"
          style={{ borderColor: 'rgba(244,63,94,0.22)', background: isLight ? 'var(--panel)' : '#0c1f16' }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(244,63,94,0.14)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185' }}
          >
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase block" style={{ color: 'var(--muted)' }}>FULLY OCCUPIED TYPES</span>
            <div className="text-2xl font-extrabold mt-0.5" style={{ color: '#fb7185' }}>{fullyOccupiedCount} At Max Capacity</div>
            <span className="text-[10px] font-semibold" style={{ color: 'var(--muted)' }}>Zero vacant units remaining</span>
          </div>
        </div>

        {/* Active Guest Check-in Count */}
        <div
          className="rounded-2xl p-4 flex items-center gap-4 shadow-lg border"
          style={{ borderColor: 'var(--line)', background: isLight ? 'var(--panel)' : '#0c1f16' }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(74,222,128,0.12)', color: 'var(--accent)' }}
          >
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase block" style={{ color: 'var(--muted)' }}>ACTIVE CLIENT STAYS</span>
            <div className="text-2xl font-extrabold mt-0.5" style={{ color: 'var(--text)' }}>{inServiceBookings.length} Guests</div>
            <span className="text-[10px] font-semibold" style={{ color: 'var(--muted)' }}>Enjoying resort grounds now</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div
        className="rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border"
        style={{
          borderColor: 'var(--line)',
          background: isLight ? 'var(--panel)' : '#061c13',
        }}
      >
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              style={
                selectedCategory === cat
                  ? { background: 'var(--accent)', color: isLight ? '#fff' : '#0a2010', boxShadow: '0 2px 12px rgba(74,222,128,0.2)' }
                  : {
                      background: isLight ? 'rgba(74,222,128,0.08)' : 'rgba(6,50,25,0.6)',
                      color: 'var(--accent)',
                      border: '1px solid var(--line)',
                    }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--accent)', opacity: 0.6 }} />
          <input
            type="text"
            placeholder="Search any service, cottage, or amenity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl pl-9 pr-8 py-2 text-xs outline-none transition-all"
            style={{
              background: isLight ? 'rgba(255,255,255,0.7)' : '#04150e',
              border: '1px solid var(--line)',
              color: 'var(--text)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs cursor-pointer p-0.5 rounded-full"
              style={{ color: 'var(--muted)' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* RESOURCE AVAILABILITY CARDS GRID */}
      {filteredUnits.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center border space-y-2"
          style={{
            background: isLight ? 'var(--panel)' : '#071f16',
            borderColor: 'var(--line)',
          }}
        >
          <Search className="w-8 h-8 mx-auto" style={{ color: 'var(--accent)', opacity: 0.6 }} />
          <h4 className="font-bold text-sm" style={{ color: 'var(--text)' }}>No resort services or cottages found</h4>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            No results matching query "<strong>{searchQuery}</strong>". Try clearing your search or choosing "All" category.
          </p>
        </div>
      ) : viewMode === 'gallery' ? (
        /* 3D VISUAL GALLERY MODE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((fac) => {
            const facId = fac.id;
            const isFlipped = !!flippedCards[facId];
            const isInUse = fac.inUseCount > 0;
            const isFullyOccupied = fac.available === 0 && fac.inUseCount > 0;
            const occPct = Math.round((fac.inUseCount / (fac.total || 1)) * 100);
            const defaultImg = fac.img || '/src/assets/images/services/cottage.png';

            return (
              <div key={facId} className="h-80 w-full" style={{ perspective: '1000px' }}>
                <div
                  className="relative h-full w-full rounded-2xl shadow-xl"
                  style={{
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.7s ease',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* FRONT */}
                  <div
                    className="absolute inset-0 h-full w-full rounded-2xl overflow-hidden group"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      border: '1px solid var(--line)',
                      background: isLight ? 'var(--panel)' : '#0f1f17',
                    }}
                  >
                    <img
                      src={defaultImg}
                      alt={fac.name}
                      onClick={() => setModalService(fac)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                      onError={(e) => { e.target.src = '/src/assets/images/services/cottage.png'; }}
                    />
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(2,10,6,0.92) 0%, rgba(2,10,6,0.45) 50%, rgba(0,0,0,0.2) 100%)' }} />

                    <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10 pointer-events-none">
                      <span className="font-mono text-[11px] font-bold px-3 py-1 rounded-full border shadow-md" style={{ background: 'rgba(2,5,3,0.82)', color: 'var(--accent)', borderColor: 'rgba(74,222,128,0.4)' }}>
                        {fac.id}
                      </span>
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-md"
                        style={{
                          background: isFullyOccupied ? 'rgba(239,68,68,0.9)' : isInUse ? 'rgba(2,132,199,0.9)' : 'rgba(34,197,94,0.9)',
                          color: '#fff',
                        }}
                      >
                        {isFullyOccupied ? 'Fully Occupied' : isInUse ? `⚡ In Use (${fac.inUseCount})` : 'Available'}
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10 space-y-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ color: 'var(--accent)', background: 'rgba(3,20,10,0.8)', border: '1px solid rgba(74,222,128,0.4)' }}>
                          {fac.category}
                        </span>
                        <h3 className="font-extrabold text-white text-base mt-1 line-clamp-1 drop-shadow-md">
                          {fac.name}
                        </h3>
                      </div>
                      <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                        <div>
                          <span className="text-[10px] font-medium block" style={{ color: 'rgba(200,225,210,0.85)' }}>Live Vacancy:</span>
                          <div className="font-extrabold text-sm" style={{ color: 'var(--accent)' }}>
                            {fac.available} / {fac.total} Vacant
                          </div>
                        </div>
                        <button
                          onClick={() => toggleFlip(facId)}
                          className="font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-lg transition-all"
                          style={{ background: 'rgba(22,163,74,0.9)', color: '#fff' }}
                        >
                          <RotateCw className="w-3.5 h-3.5" /> Details
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* BACK */}
                  <div
                    className="absolute inset-0 h-full w-full rounded-2xl p-5 flex flex-col justify-between shadow-2xl"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      background: isLight ? 'var(--bg-1)' : '#05180f',
                      border: '1px solid var(--line)',
                      color: 'var(--text)',
                    }}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--accent)' }}>{fac.category}</span>
                          <h3 className="text-base font-extrabold leading-tight mt-0.5">{fac.name}</h3>
                        </div>
                        <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded" style={{ background: 'var(--panel)', color: 'var(--accent)', border: '1px solid var(--line)' }}>
                          {fac.id}
                        </span>
                      </div>
                      <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--muted)' }}>{fac.description}</p>
                    </div>

                    <div className="p-3 rounded-xl border space-y-1.5" style={{ background: panelBg, borderColor: 'var(--line)' }}>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--muted)' }}>Rate:</span>
                        <strong style={{ color: 'var(--accent)' }}>₱{fac.price.toLocaleString()} / {fac.unit || 'day'}</strong>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--muted)' }}>Live Occupancy:</span>
                        <strong style={{ color: isInUse ? '#38bdf8' : 'var(--accent)' }}>{fac.inUseCount} in use ({occPct}%)</strong>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--muted)' }}>Vacant Units:</span>
                        <strong style={{ color: fac.available > 0 ? 'var(--accent)' : '#fb7185' }}>{fac.available} of {fac.total} available</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleFlip(facId)}
                      className="w-full py-2 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                      style={{ background: isLight ? 'var(--panel)' : '#1e293b', color: 'var(--text)', border: '1px solid var(--line)' }}
                    >
                      <ImageIcon className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Flip to Image
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIVE TRACKER MODE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUnits.map((unit) => {
            const IconComponent = unit.icon || Home;
            const isFullyOccupied = unit.available === 0 && unit.inUseCount > 0;
            const isInUse = unit.inUseCount > 0;
            const occPct = Math.round((unit.inUseCount / unit.total) * 100);

            return (
              <div
                key={unit.id}
                className="rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all hover:scale-[1.01] border-2 shadow-xl"
                style={{
                  borderColor: isFullyOccupied
                    ? 'rgba(244,63,94,0.5)'
                    : isInUse
                    ? 'rgba(56,189,248,0.4)'
                    : 'rgba(74,222,128,0.3)',
                  background: isLight
                    ? (isFullyOccupied ? 'rgba(244,63,94,0.06)' : isInUse ? 'rgba(56,189,248,0.06)' : 'rgba(74,222,128,0.06)')
                    : (isFullyOccupied ? '#1f090e' : isInUse ? '#071f24' : '#072217'),
                  color: 'var(--text)',
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-md"
                      style={{
                        color: isInUse ? '#38bdf8' : 'var(--accent)',
                        background: isLight ? 'rgba(0,0,0,0.05)' : '#052e1a',
                        border: '1px solid var(--line)',
                      }}
                    >
                      {unit.id}
                    </span>

                    {isFullyOccupied ? (
                      <span
                        className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1"
                        style={{ background: 'rgba(244,63,94,0.15)', color: '#fb7185', border: '1px solid rgba(244,63,94,0.4)' }}
                      >
                        🚫 FULLY OCCUPIED (IN USE)
                      </span>
                    ) : isInUse ? (
                      <span
                        className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 animate-pulse"
                        style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)' }}
                      >
                        ⚡ IN USE ({unit.inUseCount} OCCUPIED)
                      </span>
                    ) : (
                      <span
                        className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1"
                        style={{ background: 'rgba(74,222,128,0.15)', color: 'var(--accent)', border: '1px solid rgba(74,222,128,0.4)' }}
                      >
                        ✓ AVAILABLE
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-3 pt-1 relative">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setModalService(unit)}
                      style={{
                        background: isLight ? 'rgba(74,222,128,0.1)' : '#052e1a',
                        border: '1px solid var(--line)',
                        color: isInUse ? '#38bdf8' : 'var(--accent)',
                      }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold leading-snug flex items-center gap-2" style={{ color: 'var(--text)' }}>
                        {unit.name}
                        <button
                          type="button"
                          onClick={() => setModalService(unit)}
                          className="text-emerald-500 hover:bg-emerald-500/10 p-1 rounded-full transition-colors"
                          title="View Details"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </h4>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>{unit.category} • Capacity: {unit.capacity}</p>
                    </div>
                  </div>
                </div>

                {/* REAL-TIME AVAILABILITY BADGE */}
                <div
                  className="p-3 rounded-xl flex items-center justify-between border"
                  style={{ background: panelBg, borderColor: isInUse ? 'rgba(56,189,248,0.3)' : 'rgba(74,222,128,0.3)' }}
                >
                  <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Live Availability:</span>
                  <span
                    className="font-mono font-extrabold text-sm px-2.5 py-1 rounded-lg"
                    style={{
                      color: isFullyOccupied ? '#fb7185' : isInUse ? '#38bdf8' : 'var(--accent)',
                      background: isLight ? 'rgba(0,0,0,0.05)' : '#052e1a',
                      border: '1px solid var(--line)',
                    }}
                  >
                    {unit.available} / {unit.total} Vacant
                  </span>
                </div>

                {/* ACTIVE OCCUPANTS LIST (IF CURRENTLY BEING USED) */}
                {unit.activeGuests.length > 0 && (
                  <div
                    className="p-3 rounded-xl space-y-1.5 text-xs border"
                    style={{
                      background: isLight ? 'rgba(56,189,248,0.08)' : 'rgba(7,40,50,0.5)',
                      borderColor: 'rgba(56,189,248,0.3)',
                    }}
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Active Guests Using this Facility ({unit.activeGuests.length}):
                    </span>
                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                      {unit.activeGuests.map((g, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px]" style={{ color: 'var(--text)' }}>
                          <span className="truncate max-w-[170px]">👤 {g.guestName}</span>
                          <span className="font-mono font-bold text-sky-300">
                            {g.ref} {g.qty > 1 ? `(x${g.qty})` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Occupancy Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]" style={{ color: 'var(--muted)' }}>
                    <span>Real-time Occupancy</span>
                    <strong style={{ color: isFullyOccupied ? '#fb7185' : isInUse ? '#38bdf8' : 'var(--text)' }}>
                      {unit.inUseCount} in use ({occPct}%)
                    </strong>
                  </div>
                  <div
                    className="h-2 w-full rounded-full overflow-hidden"
                    style={{ background: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.4)', border: '1px solid var(--line)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(occPct, 100)}%`,
                        background: isFullyOccupied
                          ? 'linear-gradient(to right, #f43f5e, #fb7185)'
                          : isInUse
                          ? 'linear-gradient(to right, #0284c7, #38bdf8)'
                          : 'linear-gradient(to right, #10b981, #2dd4bf)',
                      }}
                    />
                  </div>
                </div>

                {/* Footer rate */}
                <div
                  className="pt-2 flex items-center justify-between text-xs"
                  style={{ borderTop: '1px solid var(--line)' }}
                >
                  <span style={{ color: 'var(--muted)' }}>Standard Rate:</span>
                  <span className="font-extrabold font-mono" style={{ color: 'var(--accent)' }}>
                    ₱{unit.price.toLocaleString()}.00
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ServiceDetailsModal 
        isOpen={!!modalService}
        onClose={() => setModalService(null)}
        service={modalService}
      />
    </div>
  );
}
