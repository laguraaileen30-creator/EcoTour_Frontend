import React, { useState, useEffect } from 'react';
import { Trees, RefreshCw, RotateCw, Image as ImageIcon, Users, Sparkles, CheckCircle2, AlertCircle, Search, X } from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';
import { getStageIndex } from '../../../components/VerticalReservationTimeline';

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
  const n = name.toLowerCase();
  const c = category.toLowerCase();
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

export default function FacilitiesTab() {
  const { facilities: contextFacilities, resortServices, resortBookings, reservations, walkIns = [], theme } = useEcoTour();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const isLight = theme === 'light';

  // Active bookings & walk-ins
  const allBookings = resortBookings?.length ? resortBookings : (reservations || []);

  // Helper to calculate active occupancy and in-use guests
  const getInUseForFacility = (serviceName, serviceCode) => {
    const sName = (serviceName || '').toLowerCase().trim();
    const sCode = (serviceCode || '').toLowerCase().trim();
    let count = 0;
    const activeGuests = [];

    // 1. In-service / Active Reservations
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
        const ref = b.bookingRef || b.bookingNumber || `BK-${b.id}`;
        const guestName = b.clientName || b.fullName || b.touristName || 'Guest';

        if (Array.isArray(b.items) && b.items.length > 0) {
          b.items.forEach(it => {
            const itName = (it.name || it.serviceName || '').toLowerCase();
            if (itName.includes(sName) || sName.includes(itName)) {
              const qty = parseInt(it.quantity || 1, 10);
              count += qty;
              activeGuests.push({ ref, guestName, qty, time: b.arrivalTime || '09:00 AM' });
            }
          });
        } else {
          const bSvc = (b.specificType || b.serviceName || b.packageName || '').toLowerCase();
          if (bSvc.includes(sName) || sName.includes(bSvc)) {
            count += 1;
            activeGuests.push({ ref, guestName, qty: 1, time: b.arrivalTime || '09:00 AM' });
          }
        }
      }
    });

    // 2. Active Walk-Ins
    (walkIns || []).forEach(w => {
      const isConcluded = w.walk_in_status === 'COMPLETED' || (w.status || '').toLowerCase().includes('completed') || (w.payment_status || '').toLowerCase().includes('cancel');
      const isWalkInActive = (w.walk_in_status === 'ACTIVE' || w.payment_status === 'PAID') && !isConcluded;

      if (isWalkInActive && Array.isArray(w.items) && w.items.length > 0) {
        const ref = w.receiptNo || w.walk_in_id || `WI-${w.id}`;
        const guestName = w.customer_name || w.touristName || 'Walk-In Guest';

        w.items.forEach(it => {
          const itName = (it.name || it.serviceName || '').toLowerCase();
          if (itName.includes(sName) || sName.includes(itName)) {
            const qty = parseInt(it.quantity || 1, 10);
            count += qty;
            activeGuests.push({ ref, guestName, qty, time: w.time || '10:00 AM' });
          }
        });
      }
    });

    return { count, activeGuests };
  };

  const fetchLiveFacilities = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/services');
      const data = await res.json();
      const rawServices = (data.success && Array.isArray(data.services) && data.services.length > 0)
        ? data.services
        : (resortServices?.length ? resortServices : contextFacilities || []);

      const mapped = rawServices.map((s, idx) => {
        const totalCap = parseInt(s.total_capacity || 10, 10);
        const name = s.service_name || s.name;
        const code = s.service_code || `DSVC-00${idx + 1}`;
        const { count: inUseCount, activeGuests } = getInUseForFacility(name, code);
        const availQty = Math.max(0, totalCap - inUseCount);

        let liveStatus = 'Available';
        if (availQty === 0 && inUseCount > 0) {
          liveStatus = 'Fully Occupied (In Use)';
        } else if (inUseCount > 0) {
          liveStatus = `In Use (${inUseCount} active)`;
        }

        return {
          id: s.service_id || s.id || idx,
          service_code: code,
          name,
          category: s.category || 'General',
          price: parseFloat(s.price || 0),
          available_qty: availQty,
          rentedQuantity: inUseCount,
          inUseCount,
          activeGuests,
          totalQuantity: totalCap,
          status: liveStatus,
          unit: s.unit || 'unit',
          description: s.description || 'Full resort amenity available for visitors and booking.',
          img: s.image_url && s.image_url.startsWith('http') ? s.image_url : resolveFacilityImage(name, s.category || ''),
        };
      });

      setFacilities(mapped);
    } catch (e) {
      // Fallback calculation using contextFacilities
      const mapped = (contextFacilities || []).map((s, idx) => {
        const totalCap = parseInt(s.totalQuantity || s.total_capacity || 10, 10);
        const name = s.name || s.service_name;
        const code = s.service_code || `DSVC-00${idx + 1}`;
        const { count: inUseCount, activeGuests } = getInUseForFacility(name, code);
        const availQty = Math.max(0, totalCap - inUseCount);

        return {
          ...s,
          available_qty: availQty,
          rentedQuantity: inUseCount,
          inUseCount,
          activeGuests,
          totalQuantity: totalCap,
          status: inUseCount >= totalCap ? 'Occupied' : inUseCount > 0 ? `In Use (${inUseCount})` : 'Available',
          img: s.image_url && s.image_url.startsWith('http') ? s.image_url : resolveFacilityImage(name, s.category || ''),
        };
      });
      setFacilities(mapped);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveFacilities();
  }, [contextFacilities, resortServices, resortBookings, reservations, walkIns]);

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const categories = [
    'All',
    'Cottages',
    'Accommodations',
    'Water Activities',
    'Tables',
    'Entertainment',
    'Safety & Parking',
    'Dining & Events'
  ];

  const filteredFacilities = facilities.filter((fac) => {
    const cat = (fac.category || '').toLowerCase();
    const matchesCategory =
      selectedCategory === 'All' ||
      cat.includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === 'Accommodations' && (cat.includes('room') || cat.includes('tent') || cat.includes('kubo') || cat.includes('camp') || cat.includes('accommodation'))) ||
      (selectedCategory === 'Water Activities' && (cat.includes('water') || cat.includes('kayak') || cat.includes('swim') || cat.includes('pool') || cat.includes('entrance'))) ||
      (selectedCategory === 'Safety & Parking' && (cat.includes('safety') || cat.includes('park') || cat.includes('vest'))) ||
      (selectedCategory === 'Dining & Events' && (cat.includes('food') || cat.includes('buffet') || cat.includes('event') || cat.includes('cater')));

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch =
      (fac.name || '').toLowerCase().includes(q) ||
      (fac.service_code || '').toLowerCase().includes(q) ||
      (fac.category || '').toLowerCase().includes(q) ||
      (fac.description || '').toLowerCase().includes(q) ||
      (fac.status || '').toLowerCase().includes(q) ||
      (fac.inUseCount > 0 && ('in use occupied active').includes(q)) ||
      (fac.available_qty > 0 && ('available free vacant').includes(q));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-2 sm:p-4" style={{ color: 'var(--text)' }}>
      {/* Header Banner */}
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-2xl border gap-4"
        style={{
          background: isLight ? 'var(--panel)' : '#071911',
          borderColor: 'var(--line)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(74,222,128,0.12)',
              border: '1px solid rgba(74,222,128,0.3)',
              color: 'var(--accent)',
            }}
          >
            <Trees className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg flex items-center gap-2" style={{ color: 'var(--text)' }}>
              Duangon Resort Services &amp; Facilities Status
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              Live occupancy tracker — automatically highlights cottages &amp; facilities when clients start using services.
            </p>
          </div>
        </div>
        <button
          onClick={async () => {
            if (refreshAllLiveData) await refreshAllLiveData();
            fetchLiveFacilities();
          }}
          className="p-2.5 rounded-xl cursor-pointer flex items-center gap-2 text-xs font-bold transition-all"
          style={{
            background: isLight ? 'var(--panel)' : 'rgba(6,60,30,0.8)',
            border: '1px solid rgba(74,222,128,0.3)',
            color: 'var(--accent)',
          }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
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

      {/* 3D Flip Cards Grid */}
      {filteredFacilities.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((fac) => {
          const facId = fac.id || fac.service_code;
          const isFlipped = !!flippedCards[facId];
          const isInUse = fac.inUseCount > 0;
          const isFullyOccupied = fac.available_qty === 0 && fac.inUseCount > 0;
          const occPct = Math.round((fac.rentedQuantity / (fac.totalQuantity || 1)) * 100);
          const defaultImg = cottageImg;

          return (
            <div
              key={facId}
              className="h-80 w-full"
              style={{ perspective: '1000px' }}
            >
              <div
                className="relative h-full w-full rounded-2xl shadow-xl"
                style={{
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.7s ease',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* FRONT SIDE (Image & Quick Overview) */}
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
                    src={fac.img || defaultImg}
                    alt={fac.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { e.target.src = defaultImg; }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(2,10,6,0.92) 0%, rgba(2,10,6,0.45) 50%, rgba(0,0,0,0.2) 100%)' }} />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                    <span
                      className="font-mono text-[11px] font-bold px-3 py-1 rounded-full border shadow-md"
                      style={{
                        background: 'rgba(2,5,3,0.82)',
                        backdropFilter: 'blur(8px)',
                        color: 'var(--accent)',
                        borderColor: 'rgba(74,222,128,0.4)',
                      }}
                    >
                      {fac.service_code}
                    </span>

                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-md"
                      style={{
                        background: isFullyOccupied
                          ? 'rgba(239,68,68,0.9)'
                          : isInUse
                          ? 'rgba(2,132,199,0.9)'
                          : 'rgba(34,197,94,0.9)',
                        color: '#fff',
                        border: isFullyOccupied
                          ? '1px solid rgba(248,113,113,0.5)'
                          : isInUse
                          ? '1px solid rgba(56,189,248,0.5)'
                          : '1px solid rgba(134,239,172,0.4)',
                      }}
                    >
                      {isFullyOccupied ? 'Fully Occupied' : isInUse ? `⚡ In Use (${fac.inUseCount})` : 'Available'}
                    </span>
                  </div>

                  {/* Bottom Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10 space-y-2">
                    <div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{
                          color: 'var(--accent)',
                          background: 'rgba(3,20,10,0.8)',
                          border: '1px solid rgba(74,222,128,0.4)',
                        }}
                      >
                        {fac.category}
                      </span>
                      <h3 className="font-extrabold text-white text-base mt-1 line-clamp-1 drop-shadow-md">
                        {fac.name}
                      </h3>
                    </div>

                    <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                      <div>
                        <span className="text-[10px] font-medium block" style={{ color: 'rgba(200,225,210,0.85)' }}>Rate:</span>
                        <div className="font-extrabold text-sm" style={{ color: 'var(--accent)' }}>
                          ₱{fac.price.toLocaleString()} <span className="text-[10px] font-normal" style={{ color: 'rgba(200,225,210,0.85)' }}>/ {fac.unit}</span>
                        </div>
                      </div>

                      {/* Flip Button */}
                      <button
                        onClick={() => toggleFlip(facId)}
                        className="font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-lg transition-all hover:scale-105"
                        style={{
                          background: 'rgba(22,163,74,0.9)',
                          color: '#fff',
                          border: '1px solid rgba(134,239,172,0.4)',
                        }}
                      >
                        <RotateCw className="w-3.5 h-3.5" /> View
                      </button>
                    </div>
                  </div>
                </div>

                {/* BACK SIDE (Detailed Information & Occupancy) */}
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
                  {/* Header */}
                  <div>
                    <div
                      className="flex justify-between items-start pb-2"
                      style={{ borderBottom: '1px solid var(--line)' }}
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>{fac.category}</span>
                        <h4 className="font-extrabold text-base line-clamp-1" style={{ color: 'var(--text)' }}>{fac.name}</h4>
                      </div>
                      <span
                        className="font-mono text-[10px] px-2 py-0.5 rounded"
                        style={{
                          color: 'var(--accent)',
                          background: isLight ? 'rgba(74,222,128,0.1)' : 'rgba(0,0,0,0.4)',
                          border: '1px solid var(--line)',
                        }}
                      >
                        {fac.service_code}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="mt-2.5 space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--muted)' }}>Facility Information:</span>
                      <p
                        className="text-xs leading-relaxed line-clamp-2 p-2 rounded-xl"
                        style={{
                          color: 'var(--text)',
                          background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.3)',
                          border: '1px solid var(--line)',
                          opacity: 0.9,
                        }}
                      >
                        {fac.description || 'Detailed facility information for resort staff and visitors.'}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div
                    className="space-y-2 my-1 py-1.5"
                    style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}
                  >
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div
                        className="p-2 rounded-lg"
                        style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.3)', border: '1px solid var(--line)' }}
                      >
                        <span className="text-[10px] block font-medium" style={{ color: 'var(--muted)' }}>Rate / Unit</span>
                        <span className="font-extrabold text-xs" style={{ color: 'var(--accent)' }}>₱{fac.price.toLocaleString()} / {fac.unit}</span>
                      </div>
                      <div
                        className="p-2 rounded-lg"
                        style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.3)', border: '1px solid var(--line)' }}
                      >
                        <span className="text-[10px] block font-medium" style={{ color: 'var(--muted)' }}>Total Units</span>
                        <span className="font-bold text-xs" style={{ color: 'var(--text)' }}>{fac.totalQuantity} Units</span>
                        <span className="text-[10px] font-extrabold block mt-0.5" style={{ color: isInUse ? '#38bdf8' : 'var(--accent)' }}>
                          {fac.available_qty} Vacant / {fac.inUseCount} In Use
                        </span>
                      </div>
                    </div>

                    {/* Occupancy / Availability Progress Bar */}
                    <div
                      className="space-y-1 p-2 rounded-xl"
                      style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.4)', border: '1px solid var(--line)' }}
                    >
                      <div className="flex justify-between text-[10px] font-medium" style={{ color: 'var(--muted)' }}>
                        <span>Live Status:</span>
                        <span className="font-extrabold" style={{ color: isFullyOccupied ? '#fb7185' : isInUse ? '#38bdf8' : 'var(--accent)' }}>
                          {fac.inUseCount > 0 ? `${fac.inUseCount} In Use (${occPct}%)` : 'Vacant (100% Free)'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.6)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, occPct)}%`,
                            background: isFullyOccupied
                              ? 'linear-gradient(to right, #f43f5e, #fb7185)'
                              : isInUse
                              ? 'linear-gradient(to right, #0284c7, #38bdf8)'
                              : 'linear-gradient(to right, #10b981, #2dd4bf)',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Flip Back */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => toggleFlip(facId)}
                      className="w-full py-2 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                      style={{
                        background: isLight ? 'var(--panel)' : '#1e293b',
                        color: 'var(--text)',
                        border: '1px solid var(--line)',
                      }}
                    >
                      <ImageIcon className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Front Image
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}