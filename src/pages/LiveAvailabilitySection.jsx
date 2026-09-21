import React, { useState } from 'react';
import {
  Sparkles, ShieldCheck, Users, Calendar, ArrowRight,
  Droplets, Utensils, Home, CheckCircle2, AlertCircle, Clock, RotateCw
} from 'lucide-react';
import { useEcoTour } from '../context/EcoTourContext';
import { getStageIndex } from '../components/VerticalReservationTimeline';

import cottageImg from '../assets/images/services/cottage.png';
import tableImg from '../assets/images/services/table.png';
import videokeImg from '../assets/images/services/videoke.png';
import roomImg from '../assets/images/services/room.png';
import waterImg from '../assets/images/services/swimming.png';
import lifevestImg from '../assets/images/services/lifevest.png';
import parkingImg from '../assets/images/services/parking.png';
import tentImg from '../assets/images/services/tent.png';
import eventImg from '../assets/images/services/event.png';
import buffetImg from '../assets/images/services/buffet.png';
import floatingImg from '../assets/images/services/floating.png';

const resolveLandingImage = (name = '', category = '', fallback = cottageImg) => {
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

const FALLBACK_SERVICES = [
  {
    service_id: 'SRV-01',
    service_code: 'COT-01',
    service_name: 'Standard Open Cottage',
    category: 'Cottages',
    price: 600,
    unit: 'day',
    total_capacity: 11,
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
    image_url: lifevestImg,
    description: 'USCG-approved high buoyancy life vests suitable for kids, adults, and non-swimmers enjoying deep spring pools.',
  },
];

export default function LiveAvailabilitySection({ onOpenBooking }) {
  const { resortServices, resortBookings, reservations, walkIns = [], theme } = useEcoTour();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const isLight = theme === 'light';

  // Active bookings and walk-ins
  const allBookings = resortBookings?.length ? resortBookings : (reservations || []);

  const getInUseForService = (serviceName, serviceCode) => {
    const sName = (serviceName || '').toLowerCase().trim();
    const sCode = (serviceCode || '').toLowerCase().trim();
    let count = 0;

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

      // If client completed their stay, items are returned! DO NOT count as in use!
      if (!isPaidOrInService || isConcluded) {
        return;
      }

      if (Array.isArray(b.items) && b.items.length > 0) {
        b.items.forEach(it => {
          const itName = (it.name || it.serviceName || '').toLowerCase();
          const itCode = (it.service_code || '').toLowerCase();
          if (itName.includes(sName) || sName.includes(itName) || (sCode && itCode === sCode)) {
            count += parseInt(it.quantity || 1, 10);
          }
        });
      } else {
        const bSvc = (b.specificType || b.serviceName || b.packageName || '').toLowerCase();
        if (bSvc.includes(sName) || sName.includes(bSvc)) {
          count += parseInt(b.quantity || b.totalVisitors || 1, 10);
        }
      }
    });

    // 2. Active Walk-Ins (avoiding double-counting with allBookings)
    (walkIns || []).forEach(w => {
      const wIdStr = String(w.id || '').toLowerCase();
      const wWalkInId = String(w.walk_in_id || '').toLowerCase();
      const wBookingRef = String(w.bookingRef || '').toLowerCase();
      const wReceiptNo = String(w.receiptNo || '').toLowerCase();

      // If already recorded and tracked in allBookings, skip to avoid double-counting
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
        w.items.forEach(it => {
          const itName = (it.name || it.serviceName || '').toLowerCase();
          const itCode = (it.service_code || '').toLowerCase();
          if (itName.includes(sName) || sName.includes(itName) || (sCode && itCode === sCode)) {
            count += parseInt(it.quantity || 1, 10);
          }
        });
      }
    });

    return count;
  };

  const rawServices = resortServices && resortServices.length > 0 ? resortServices : FALLBACK_SERVICES;
  const categories = ['All', 'Cottages', 'Accommodations', 'Water Activities', 'Tables', 'Entertainment'];

  const filteredServices = rawServices.filter(s => {
    if (selectedCategory === 'All') return true;
    const sCat = (s.category || '').toLowerCase();
    return sCat.includes(selectedCategory.toLowerCase());
  });

  const totalOccupiedUnits = rawServices.reduce((sum, s) => {
    const name = s.service_name || s.name;
    const code = s.service_code;
    return sum + getInUseForService(name, code);
  }, 0);

  return (
    <section id="services" className="py-20 px-4 sm:px-6 relative overflow-hidden" style={{ background: isLight ? 'var(--bg-1, #f4fbf7)' : '#020e07', color: 'var(--text)' }}>
      {/* Decorative Glow Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">

        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Real-Time Facility &amp; Cottage Availability</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
            Live Resort Amenities &amp; Status
          </h2>

          <p className="text-sm sm:text-base" style={{ color: 'var(--muted)' }}>
            Track live cottage vacancies, guest rooms, and activity equipment in real time. When guests check in, availability updates automatically.
          </p>

          {/* REAL-TIME STATS PILLS */}
          <div className="flex items-center justify-center gap-4 pt-2 flex-wrap">
            <div className="px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2" style={{ background: isLight ? 'var(--panel)' : 'rgba(6,40,25,0.7)', border: '1px solid var(--line)' }}>
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
              <span style={{ color: 'var(--text)' }}>{totalOccupiedUnits} Units Currently In Use</span>
            </div>

            <div className="px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2" style={{ background: isLight ? 'var(--panel)' : 'rgba(6,40,25,0.7)', border: '1px solid var(--line)' }}>
              <Users className="w-4 h-4 text-emerald-400" />
              <span style={{ color: 'var(--text)' }}>{totalActiveGuests} Active Checked-In Guests</span>
            </div>
          </div>
        </div>

        {/* CATEGORY SELECTOR */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              style={
                selectedCategory === cat
                  ? {
                      background: 'var(--accent, #10b981)',
                      color: isLight ? '#fff' : '#04170e',
                      boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                      fontWeight: 800,
                    }
                  : {
                      background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
                      color: 'var(--muted)',
                      border: '1px solid var(--line)',
                    }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredServices.map((srv) => {
            const srvName = srv.service_name || srv.name;
            const srvCode = srv.service_code || `COT-${srv.service_id || '01'}`;
            const totalCap = parseInt(srv.total_capacity || 10, 10);
            const inUseCount = getInUseForService(srvName, srvCode);
            const availQty = Math.max(0, totalCap - inUseCount);
            const isFullyOccupied = availQty === 0 && inUseCount > 0;
            const isInUse = inUseCount > 0;
            const occPct = Math.round((inUseCount / totalCap) * 100);
            const defaultImg = (srv.image_url && srv.image_url.startsWith('http')) ? srv.image_url : resolveLandingImage(srvName, srv.category || '');
            const price = parseFloat(srv.price || 0);

            return (
              <div
                key={srv.service_id || srvCode}
                className="rounded-3xl border overflow-hidden flex flex-col justify-between shadow-2xl transition-all hover:scale-[1.02] duration-300 group"
                style={{
                  background: isLight ? 'var(--bg-1, #fff)' : '#071f14',
                  borderColor: isFullyOccupied ? 'rgba(244,63,94,0.4)' : isInUse ? 'rgba(56,189,248,0.4)' : 'rgba(74,222,128,0.25)',
                }}
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={defaultImg}
                    alt={srvName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { e.target.src = cottageImg; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020e07] via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                    <span className="bg-slate-950/85 backdrop-blur-md text-emerald-400 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/40">
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

                  {/* Category Pill */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-700/50">
                      {srv.category || 'Resort Facility'}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-base line-clamp-1 group-hover:text-emerald-400 transition-colors" style={{ color: 'var(--text)' }}>
                      {srvName}
                    </h3>
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--muted)' }}>
                      {srv.description || 'Enjoy fresh mountain spring waters and leafy tropical foliage.'}
                    </p>
                  </div>

                  {/* Real-time Occupancy Bar */}
                  <div className="p-3 rounded-2xl space-y-1.5" style={{ background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.3)', border: '1px solid var(--line)' }}>
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span style={{ color: 'var(--muted)' }}>Live Vacancy:</span>
                      <strong style={{ color: isFullyOccupied ? '#fb7185' : isInUse ? '#38bdf8' : 'var(--accent)' }}>
                        {availQty} of {totalCap} Available
                      </strong>
                    </div>

                    <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.5)' }}>
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

                  {/* Pricing and Book Action */}
                  <div className="pt-2 flex items-center justify-between border-t" style={{ borderColor: 'var(--line)' }}>
                    <div>
                      <span className="text-[10px] block" style={{ color: 'var(--muted)' }}>Starting from:</span>
                      <strong className="text-base font-black font-mono" style={{ color: 'var(--accent)' }}>
                        ₱{price.toLocaleString()} <span className="text-[10px] font-normal" style={{ color: 'var(--muted)' }}>/ {srv.unit || 'day'}</span>
                      </strong>
                    </div>

                    <button
                      onClick={() => onOpenBooking && onOpenBooking(srv)}
                      className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1 cursor-pointer uppercase tracking-wider transition-all"
                    >
                      <span>Book</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
