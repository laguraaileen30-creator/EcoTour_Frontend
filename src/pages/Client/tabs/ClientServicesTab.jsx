import React, { useState } from 'react';
import { Search, Filter, RotateCw, CheckCircle, ArrowRight, ShieldCheck, Sparkles, Image as ImageIcon, Tag, Users, AlertCircle } from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';
import { getStageIndex } from '../../../components/VerticalReservationTimeline';

import cottageImg from '../../../assets/images/services/cottage.png';
import tableImg from '../../../assets/images/services/table.png';
import videokeImg from '../../../assets/images/services/videoke.png';
import roomImg from '../../../assets/images/services/room.png';
import waterImg from '../../../assets/images/services/swimming.png';
import lifevestImg from '../../../assets/images/services/lifevest.png';
import parkingImg from '../../../assets/images/services/parking.png';
import tentImg from '../../../assets/images/services/tent.png';
import eventImg from '../../../assets/images/services/event.png';
import buffetImg from '../../../assets/images/services/buffet.png';
import floatingImg from '../../../assets/images/services/floating.png';

const resolveClientServiceImage = (name = '', category = '', fallback = cottageImg) => {
  const n = (name || '').toLowerCase();
  const c = (category || '').toLowerCase();
  if (n.includes('spring') || n.includes('swim') || n.includes('entrance')) return waterImg;
  if (n.includes('table') || c.includes('table')) return tableImg;
  if (n.includes('vest') || c.includes('safety')) return lifevestImg;
  if (n.includes('videoke') || n.includes('karaoke') || c.includes('entertainment')) return videokeImg;
  if (n.includes('kayak') || n.includes('floating') || c.includes('water')) return floatingImg;
  if (n.includes('tent') || n.includes('camping')) return tentImg;
  if (n.includes('room') || n.includes('kubo') || n.includes('accommodat')) return roomImg;
  if (n.includes('pavilion') || n.includes('event')) return eventImg;
  if (n.includes('buffet') || n.includes('catering')) return buffetImg;
  if (n.includes('parking') || n.includes('vehicle')) return parkingImg;
  return fallback;
};

const ALL_SERVICES_CATALOG = [
  {
    service_id: 'SRV-01',
    service_code: 'COT-01',
    service_name: 'Standard Open Cottage',
    category: 'Cottages',
    price: 600,
    unit: 'day',
    total_capacity: 11,
    status: 'Active',
    image_url: cottageImg,
    description: 'Spacious traditional bamboo cottage shaded under tropical mahogany trees right beside the crystal clear cold spring water pool.',
  },
  {
    service_id: 'SRV-02',
    service_code: 'COT-02',
    service_name: 'Large Family Covered Cottage',
    category: 'Cottages',
    price: 1000,
    unit: 'day',
    total_capacity: 6,
    status: 'Active',
    image_url: cottageImg,
    description: 'Heavy-duty steel roofed mega cottage built for big family reunions and corporate team outings with private benches and grill.',
  },
  {
    service_id: 'SRV-03',
    service_code: 'TBL-01',
    service_name: 'Outdoor Table & Chairs Set',
    category: 'Tables',
    price: 250,
    unit: 'day',
    total_capacity: 40,
    status: 'Active',
    image_url: tableImg,
    description: 'Flexible heavy-duty resort table set with 4 comfortable chairs placed right under leafy shaded spring grounds.',
  },
  {
    service_id: 'SRV-04',
    service_code: 'RM-01',
    service_name: 'Aircon Kubo Guest Room',
    category: 'Accommodations',
    price: 1500,
    unit: 'day',
    total_capacity: 6,
    status: 'Active',
    image_url: roomImg,
    description: 'Cozy air-conditioned traditional bamboo cottage room featuring plush mattress bedding, private bathroom, and balcony.',
  },
  {
    service_id: 'SRV-05',
    service_code: 'WAT-01',
    service_name: 'Single & Double Kayak Boat',
    category: 'Water Activities',
    price: 300,
    unit: 'hour',
    total_capacity: 5,
    status: 'Active',
    image_url: waterImg,
    description: 'Explore the serene spring river waters on high-grade ocean kayaks with free paddles and life safety vests.',
  },
  {
    service_id: 'SRV-06',
    service_code: 'ENT-01',
    service_name: 'Videoke Sound System',
    category: 'Entertainment',
    price: 500,
    unit: 'day',
    total_capacity: 4,
    status: 'Active',
    image_url: videokeImg,
    description: 'High-powered sound system with dual wireless microphones and thousands of updated OPM & international hits.',
  },
  {
    service_id: 'SRV-07',
    service_code: 'TNT-01',
    service_name: 'Overnight Camping Tent Pitch',
    category: 'Accommodations',
    price: 450,
    unit: 'night',
    total_capacity: 8,
    status: 'Active',
    image_url: tentImg,
    description: 'Pitch your tent on green spring lawns under starry night skies. Includes campsite access, lighting, and security.',
  },
  {
    service_id: 'SRV-08',
    service_code: 'VST-01',
    service_name: 'Safety Life Vest Flotation Gear',
    category: 'Safety',
    price: 50,
    unit: 'day',
    total_capacity: 50,
    status: 'Active',
    image_url: lifevestImg,
    description: 'USCG-approved high buoyancy life vests suitable for kids, adults, and non-swimmers enjoying deep spring pools.',
  },
  {
    service_id: 'SRV-09',
    service_code: 'PRK-01',
    service_name: 'Secure Vehicle Parking Pass',
    category: 'Parking',
    price: 50,
    unit: 'day',
    total_capacity: 35,
    status: 'Active',
    image_url: parkingImg,
    description: 'Spacious gated parking area with CCTV surveillance and security guards stationed full-time.',
  },
];

export default function ClientServicesTab({ onNavigateBook }) {
  const { resortServices, resortBookings, reservations, walkIns = [], theme, refreshAllLiveData } = useEcoTour();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [flippedCards, setFlippedCards] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isLight = theme === 'light';

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (refreshAllLiveData) await refreshAllLiveData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // Active bookings and walk-ins
  const allBookings = resortBookings?.length ? resortBookings : (reservations || []);
  const inServiceBookings = allBookings.filter(b => {
    const status = (b.status || '').toLowerCase();
    const isConcluded = status.includes('completed') || status.includes('cancel') || status.includes('void') || status.includes('checkout') || status.includes('checked out') || status.includes('done');
    const isPaidOrInService = status.includes('paid') || status.includes('using') || status.includes('in resort') || status.includes('checked in') || status.includes('active') || status.includes('confirmed');
    return isPaidOrInService && !isConcluded;
  });

  const getInUseForService = (serviceName, serviceCode) => {
    const sName = (serviceName || '').toLowerCase().trim();
    let count = 0;

    // 1. Check in-service / active reservations
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

    // 2. Check active walk-ins
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

  const servicesList = resortServices && resortServices.length > 0 ? resortServices : ALL_SERVICES_CATALOG;
  const categories = ['All', 'Cottages', 'Accommodations', 'Water Activities', 'Tables', 'Entertainment', 'Safety', 'Parking'];

  const filteredServices = servicesList.filter((s) => {
    const sName = s.service_name || s.name || '';
    const sDesc = s.description || '';
    const sCat = s.category || '';
    const matchesSearch = sName.toLowerCase().includes(searchQuery.toLowerCase()) || sDesc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || sCat.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-2 sm:p-4" style={{ color: 'var(--text)' }}>
      {/* HEADER BANNER */}
      <div
        className="etv-services-header p-5 rounded-2xl border shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        style={{
          background: isLight ? 'var(--panel)' : '#071911',
          borderColor: 'var(--line)',
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-lg flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <Tag className="w-5 h-5 text-emerald-400" /> Duangon Resort Services &amp; Facilities
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40 animate-pulse">
              ⚡ Real-Time In-Use Synced
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            Live availability tracker — see which cottages &amp; amenities are currently <strong>In Use</strong> or ready for your visit.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div
            className="px-4 py-2 rounded-xl border flex items-center gap-2 shrink-0"
            style={{
              background: isLight ? 'rgba(74,222,128,0.1)' : 'rgba(3,30,15,0.8)',
              borderColor: 'var(--line)',
            }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent)' }}>
              {inServiceBookings.length} Active Checked-In Guests
            </span>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
            style={{
              background: isLight ? 'var(--panel)' : 'rgba(6,60,30,0.8)',
              borderColor: 'var(--line)',
              color: 'var(--accent)',
            }}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> {isRefreshing ? 'Refreshing...' : 'Refresh Live Feed'}
          </button>

          <button
            onClick={onNavigateBook}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer uppercase transition-all"
          >
            <Sparkles className="w-4 h-4" /> Book Now
          </button>
        </div>
      </div>

      {/* SEARCH & CATEGORY FILTERS */}
      <div
        className="etv-services-filter flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border shadow-xl"
        style={{
          background: isLight ? 'var(--panel)' : '#0c1f16',
          borderColor: 'var(--line)',
        }}
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
          <input
            type="text"
            placeholder="Search by facility name, code, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl pl-10 pr-4 py-2 text-xs outline-none transition-all font-medium"
            style={{
              background: isLight ? 'rgba(255,255,255,0.8)' : '#04150e',
              border: '1px solid var(--line)',
              color: 'var(--text)',
            }}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer"
              style={
                selectedCategory === cat
                  ? { background: 'var(--accent)', color: isLight ? '#fff' : '#04170e', fontWeight: 800 }
                  : {
                      background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(6,50,25,0.6)',
                      color: 'var(--muted)',
                      border: '1px solid var(--line)',
                    }
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3D FLIP CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((srv) => {
          const srvId = srv.service_id || srv.id || srv.service_code || Math.random();
          const isFlipped = !!flippedCards[srvId];
          const srvName = srv.service_name || srv.name || 'Resort Service';
          const srvCode = srv.service_code || `SRV-${srvId}`;
          const priceVal = parseFloat(srv.price || 0);
          const totalCap = parseInt(srv.total_capacity || srv.capacity || 10, 10);
          const inUseCount = getInUseForService(srvName, srvCode);
          const availQty = Math.max(0, totalCap - inUseCount);
          const isFullyOccupied = availQty === 0 && inUseCount > 0;
          const isInUse = inUseCount > 0;
          const occPct = Math.round((inUseCount / totalCap) * 100);
          const defaultImg = (srv.image_url && srv.image_url.startsWith('http')) ? srv.image_url : resolveClientServiceImage(srvName, srv.category || '');

          return (
            <div key={srvId} className="h-96 w-full [perspective:1000px]">
              <div
                className={`relative h-full w-full rounded-2xl transition-all duration-700 [transform-style:preserve-3d] shadow-xl ${
                  isFlipped ? '[transform:rotateY(180deg)]' : ''
                }`}
              >
                {/* FRONT SIDE (Image & Quick Overview) */}
                <div
                  className="etv-services-card-front absolute inset-0 h-full w-full rounded-2xl overflow-hidden [backface-visibility:hidden] border group flex flex-col justify-between"
                  style={{
                    background: isLight ? 'var(--panel)' : '#071f14',
                    borderColor: isFullyOccupied ? 'rgba(244,63,94,0.4)' : isInUse ? 'rgba(56,189,248,0.4)' : 'rgba(74,222,128,0.3)',
                  }}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={defaultImg}
                      alt={srvName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => { e.target.src = cottageImg; }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020a06] via-[#020a06]/40 to-black/30" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                      <span className="bg-slate-950/80 backdrop-blur-md text-emerald-400 font-mono text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-500/40 shadow-md">
                        {srvCode}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-md ${
                          isFullyOccupied
                            ? 'bg-rose-500/90 text-white border border-rose-300/40'
                            : isInUse
                            ? 'bg-sky-500/90 text-white border border-sky-300/40 animate-pulse'
                            : 'bg-emerald-500/90 text-white border border-emerald-300/40'
                        }`}
                      >
                        {isFullyOccupied ? 'Fully Occupied' : isInUse ? `⚡ In Use (${inUseCount})` : 'Available'}
                      </span>
                    </div>

                    {/* Category Overlay */}
                    <div className="absolute bottom-3 left-3 z-10">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-700/50">
                        {srv.category || 'Facility'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div
                    className="p-4 space-y-3 flex-1 flex flex-col justify-between"
                    style={{
                      background: isLight ? 'var(--bg-1)' : 'rgba(6,24,15,0.95)',
                      color: 'var(--text)',
                    }}
                  >
                    <div>
                      <h4 className="font-extrabold text-base line-clamp-1 transition-colors" style={{ color: 'var(--text)' }}>
                        {srvName}
                      </h4>
                      <div className="flex justify-between items-center text-xs mt-1">
                        <span style={{ color: 'var(--muted)' }}>Total Capacity: <strong style={{ color: 'var(--text)' }}>{totalCap} units</strong></span>
                        <span className="font-bold font-mono text-xs" style={{ color: isInUse ? '#38bdf8' : 'var(--accent)' }}>
                          {availQty} Vacant
                        </span>
                      </div>
                    </div>

                    {/* Bottom Pricing & Flip CTA */}
                    <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
                      <div>
                        <span className="text-[10px] block" style={{ color: 'var(--muted)' }}>Rate / Booking:</span>
                        <div className="font-black text-sm" style={{ color: 'var(--accent)' }}>
                          ₱{priceVal.toLocaleString()} <span className="text-[10px] font-normal" style={{ color: 'var(--muted)' }}>/ {srv.unit || 'day'}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleFlip(srvId)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer flex items-center gap-1 shadow-lg transition-all"
                      >
                        <RotateCw className="w-3.5 h-3.5" /> Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* BACK SIDE (Detailed Breakdown, Occupancy Progress & Book Now) */}
                <div
                  className="etv-services-card-back absolute inset-0 h-full w-full rounded-2xl p-5 [backface-visibility:hidden] [transform:rotateY(180deg)] border flex flex-col justify-between shadow-2xl"
                  style={{
                    background: isLight ? 'var(--bg-1)' : '#05180f',
                    borderColor: 'var(--line)',
                    color: 'var(--text)',
                  }}
                >
                  {/* Back Header */}
                  <div>
                    <div className="flex justify-between items-start pb-2" style={{ borderBottom: '1px solid var(--line)' }}>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">{srv.category || 'Facility'}</span>
                        <h4 className="font-extrabold text-base line-clamp-1" style={{ color: 'var(--text)' }}>{srvName}</h4>
                      </div>
                      <span
                        className="font-mono text-[10px] px-2 py-0.5 rounded"
                        style={{
                          color: 'var(--accent)',
                          background: isLight ? 'rgba(74,222,128,0.1)' : 'rgba(0,0,0,0.4)',
                          border: '1px solid var(--line)',
                        }}
                      >
                        {srvCode}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="mt-3 space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--muted)' }}>
                        Service Highlights:
                      </span>
                      <p
                        className="text-xs leading-relaxed line-clamp-3 p-2.5 rounded-xl"
                        style={{
                          background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.3)',
                          border: '1px solid var(--line)',
                          color: 'var(--text)',
                          opacity: 0.9,
                        }}
                      >
                        {srv.description || 'Enjoy premium resort grounds, shaded pools, and refreshing spring water amenities.'}
                      </p>
                    </div>
                  </div>

                  {/* Real-time Occupancy & Live Capacity Breakdown */}
                  <div className="space-y-2 my-2 py-2" style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg" style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.3)', border: '1px solid var(--line)' }}>
                        <span className="text-[10px] block font-medium" style={{ color: 'var(--muted)' }}>Rental Rate</span>
                        <span className="font-extrabold text-xs" style={{ color: 'var(--accent)' }}>₱{priceVal.toLocaleString()} / {srv.unit || 'day'}</span>
                      </div>
                      <div className="p-2 rounded-lg" style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.3)', border: '1px solid var(--line)' }}>
                        <span className="text-[10px] block font-medium" style={{ color: 'var(--muted)' }}>Live Status</span>
                        <span className="font-bold text-xs" style={{ color: isInUse ? '#38bdf8' : 'var(--accent)' }}>
                          {availQty} Free • {inUseCount} In Use
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 p-2 rounded-xl" style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.4)', border: '1px solid var(--line)' }}>
                      <div className="flex justify-between text-[10px]">
                        <span style={{ color: 'var(--muted)' }}>Real-Time Availability:</span>
                        <strong style={{ color: isFullyOccupied ? '#fb7185' : isInUse ? '#38bdf8' : 'var(--accent)' }}>
                          {availQty} of {totalCap} Available
                        </strong>
                      </div>
                      <div
                        className="h-1.5 w-full rounded-full overflow-hidden border"
                        style={{
                          background: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.6)',
                          borderColor: 'var(--line)',
                        }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.max(0, 100 - occPct))}%`,
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

                  {/* Actions & Flip Back */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => toggleFlip(srvId)}
                      className="px-3 py-2 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 transition-all"
                      style={{
                        background: isLight ? 'var(--panel)' : '#1e293b',
                        color: 'var(--text)',
                        border: '1px solid var(--line)',
                      }}
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> Front View
                    </button>

                    <button
                      onClick={onNavigateBook}
                      className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1 cursor-pointer uppercase transition-all"
                    >
                      <span>Book Online</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
