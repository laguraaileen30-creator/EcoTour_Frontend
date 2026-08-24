import React, { useState, useEffect, useCallback } from 'react';
import {
  Package, RefreshCw, AlertTriangle, Bell, CheckCircle2, Clock,
  Home, Users, Droplets, Utensils, Trees, ShieldCheck, Sparkles,
  Search, Tag, RotateCw, Image as ImageIcon, Wifi, WifiOff
} from 'lucide-react';
import ServicesTable from '../components/ServicesTable';
import { useEcoTour } from '../../../context/EcoTourContext';
import { getStageIndex } from '../../../components/VerticalReservationTimeline';

// ─── Default catalog (fallback if DB is empty) ─────────────────────────────
const DEFAULT_UNITS = [
  { id: 'DSVC-001', name: 'Cold Spring Pool Entrance Ticket', category: 'Entrance', capacity: '300 Pax', price: 100, total: 300, icon: Users, description: 'Day pass access to natural cold spring pool' },
  { id: 'DSVC-002', name: 'Standard Open Cottage', category: 'Cottages', capacity: '10 Pax', price: 600, total: 10, icon: Home, description: 'Shaded native open cottage near pool' },
  { id: 'DSVC-003', name: 'Large Family Covered Cottage', category: 'Cottages', capacity: '20 Pax', price: 1000, total: 6, icon: Home, description: 'Heavy-duty steel roofed mega cottage' },
  { id: 'DSVC-004', name: 'Executive Umbrella Shade', category: 'Cottages', capacity: '6 Pax', price: 400, total: 15, icon: Home, description: 'Waterfront shaded umbrella with round table' },
  { id: 'DSVC-005', name: 'Resort Table & Chairs Set', category: 'Tables', capacity: '4 Pax', price: 250, total: 15, icon: Utensils, description: '1 Table + 4 monoblock chairs' },
  { id: 'DSVC-006', name: 'Life Vest / Safety Gear', category: 'Safety & Parking', capacity: '1 Pax', price: 50, total: 30, icon: ShieldCheck, description: 'Adult & Kid safety flotation vest' },
  { id: 'DSVC-007', name: 'Videoke Karaoke System', category: 'Entertainment', capacity: '20 Pax', price: 500, total: 4, icon: Droplets, description: 'Heavy-duty Videoke sound system' },
  { id: 'DSVC-008', name: 'Kayak / Floating Pad Rental', category: 'Water Activities', capacity: '2 Pax', price: 300, total: 5, icon: Droplets, description: '1-hour kayak & water pad rental' },
  { id: 'DSVC-009', name: 'Camping Pitch & Tent', category: 'Accommodations', capacity: '4 Pax', price: 450, total: 8, icon: Trees, description: 'Overnight camping slot & tent' },
  { id: 'DSVC-010', name: 'Aircon Kubo Guest Room', category: 'Accommodations', capacity: '6 Pax', price: 1500, total: 4, icon: Home, description: 'Private aircon room with bed & bath' },
  { id: 'DSVC-011', name: 'Private Event Pavilion', category: 'Dining & Events', capacity: '50 Pax', price: 3500, total: 2, icon: Sparkles, description: 'Family gatherings & private events' },
  { id: 'DSVC-012', name: 'Buffet & Catering Station', category: 'Dining & Events', capacity: '50 Pax', price: 450, total: 50, icon: Utensils, description: 'Native buffet catering package' },
  { id: 'DSVC-013', name: 'Secured Resort Parking Slot', category: 'Safety & Parking', capacity: '1 Vehicle', price: 50, total: 40, icon: ShieldCheck, description: 'Safe vehicle parking for cars & vans' },
];

const CATEGORIES = ['All', 'Cottages', 'Accommodations', 'Water Activities', 'Tables', 'Entertainment', 'Safety & Parking', 'Dining & Events', 'Entrance'];

// ─── Live Availability Panel ────────────────────────────────────────────────
function LiveAvailabilityPanel() {
  const { resortServices, resortBookings, reservations, walkIns = [], refreshAllLiveData, theme } = useEcoTour();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('tracker'); // 'tracker' | 'gallery'
  const [flippedCards, setFlippedCards] = useState({});
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefreshOn, setAutoRefreshOn] = useState(true);
  const [tick, setTick] = useState(0);
  const isLight = theme === 'light';

  // ── Auto-refresh every 30 seconds ──────────────────────────────────────
  useEffect(() => {
    if (!autoRefreshOn) return;
    const id = setInterval(() => {
      setTick(t => t + 1);
      setLastRefresh(new Date());
      if (refreshAllLiveData) refreshAllLiveData();
    }, 30000);
    return () => clearInterval(id);
  }, [autoRefreshOn, refreshAllLiveData]);

  const handleManualRefresh = () => {
    setTick(t => t + 1);
    setLastRefresh(new Date());
    if (refreshAllLiveData) refreshAllLiveData();
  };

  // ── Compute in-service bookings ─────────────────────────────────────────
  const allBookings = (resortBookings?.length ? resortBookings : (reservations || []));

  const getInUseForService = useCallback((serviceName, serviceCode) => {
    const sName = (serviceName || '').toLowerCase().trim();
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
              activeGuests.push({ ref, guestName, qty, time: b.arrivalTime || '' });
            }
          });
        } else {
          const bSvc = (b.specificType || b.serviceName || b.packageName || '').toLowerCase();
          if (bSvc.includes(sName) || sName.includes(bSvc)) {
            count += 1;
            activeGuests.push({ ref, guestName, qty: 1, time: b.arrivalTime || '' });
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
  }, [allBookings, walkIns]);

  // ── Build live unit list ────────────────────────────────────────────────
  const baseCatalog = (resortServices && resortServices.length > 0)
    ? resortServices.map((s, idx) => ({
      id: s.service_code || `DSVC-00${idx + 1}`,
      name: s.service_name || s.name,
      category: s.category || 'Cottages',
      capacity: s.total_capacity ? `${s.total_capacity} Pax` : '10 Pax',
      price: typeof s.price === 'number' ? s.price : parseFloat(s.price || 0),
      total: parseInt(s.total_capacity || 10, 10),
      unit: s.unit || 'day',
      description: s.description || '',
      img: s.image_url || '',
      icon: (s.category || '').toLowerCase().includes('safety') ? ShieldCheck
        : (s.category || '').toLowerCase().includes('table') ? Utensils
          : (s.category || '').toLowerCase().includes('water') ? Droplets : Home,
    }))
    : DEFAULT_UNITS;

  const liveUnits = baseCatalog.map(u => {
    const { count: inUseCount, activeGuests } = getInUseForService(u.name, u.id);
    return { ...u, inUseCount, activeGuests, available: Math.max(0, u.total - inUseCount) };
  });

  // ── Stats ───────────────────────────────────────────────────────────────
  const totalInUse = liveUnits.reduce((s, u) => s + u.inUseCount, 0);
  const availCount = liveUnits.filter(u => u.available > 0).length;
  const fullyOccupied = liveUnits.filter(u => u.available === 0 && u.inUseCount > 0);

  // ── Filter ──────────────────────────────────────────────────────────────
  const filtered = liveUnits.filter(u => {
    const cat = (u.category || '').toLowerCase();
    const matchCat = selectedCategory === 'All'
      || cat.includes(selectedCategory.toLowerCase())
      || (selectedCategory === 'Accommodations' && (cat.includes('room') || cat.includes('tent') || cat.includes('kubo') || cat.includes('camp')))
      || (selectedCategory === 'Water Activities' && (cat.includes('water') || cat.includes('kayak')))
      || (selectedCategory === 'Safety & Parking' && (cat.includes('safety') || cat.includes('park') || cat.includes('vest')))
      || (selectedCategory === 'Dining & Events' && (cat.includes('food') || cat.includes('buffet') || cat.includes('event')));
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchCat;
    return matchCat && (
      (u.name || '').toLowerCase().includes(q) ||
      (u.category || '').toLowerCase().includes(q) ||
      (u.id || '').toLowerCase().includes(q)
    );
  });

  const toggleFlip = id => setFlippedCards(p => ({ ...p, [id]: !p[id] }));

  const card = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.35)';

  return (
    <div className="space-y-5" style={{ color: 'var(--text)' }}>

      {/* ── FULLY OCCUPIED ALERT BANNER ──────────────────────────────────── */}
      {fullyOccupied.length > 0 && (
        <div className="rounded-2xl border border-rose-500/50 bg-rose-950/60 p-4 shadow-xl animate-pulse-slow">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-rose-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-rose-300 text-sm">⚠️ Capacity Alert — Fully Occupied!</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/30 text-rose-200 border border-rose-500/40">
                  {fullyOccupied.length} Service{fullyOccupied.length > 1 ? 's' : ''} Maxed Out
                </span>
              </div>
              <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">
                The following facilities are <strong>fully booked for today</strong>. Inform clients of unavailability and suggest alternatives to save time:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {fullyOccupied.map(u => (
                  <span key={u.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-900/80 text-rose-200 border border-rose-500/50 shadow-md">
                    <AlertTriangle className="w-3 h-3" />
                    {u.name}
                    <span className="text-rose-400 font-mono">{u.inUseCount}/{u.total} used</span>
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-rose-400/70 mt-2">
                💡 <strong>Action:</strong> Redirect to available alternatives · Update clients in queue · Enable waitlist notifications.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: 'var(--accent)' }}>
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
                Real-Time Facility &amp; Cottage Availability
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold animate-pulse" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)' }}>
                ⚡ Auto-Sync with Active Clients
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              Cottage &amp; Resort Add-on Services &amp; Facilities — live automatic occupancy updates when guests start using services.
              {' '}<span className="text-emerald-400 font-medium">Last refresh: {lastRefresh.toLocaleTimeString()}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl border" style={{ background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.4)', borderColor: 'var(--line)' }}>
            <button onClick={() => setViewMode('tracker')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'tracker' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
              ⚡ Live Tracker
            </button>
            <button onClick={() => setViewMode('gallery')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'gallery' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
              🛖 3D Visual Cards
            </button>
          </div>

          {/* Manual Refresh */}
          <button
            onClick={handleManualRefresh}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all border"
            style={{ background: 'rgba(74,222,128,0.08)', borderColor: 'rgba(74,222,128,0.3)', color: 'var(--accent)' }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Live Feed
          </button>
        </div>
      </div>

      {/* ── SUMMARY STAT CARDS ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Services', value: liveUnits.length, color: '#86efac', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)' },
          { label: 'Currently In Use', value: totalInUse, color: '#38bdf8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.2)' },
          { label: 'Types Available', value: availCount, color: '#4ade80', bg: 'rgba(74,222,128,0.06)', border: 'rgba(74,222,128,0.2)' },
          { label: 'Fully Occupied', value: fullyOccupied.length, color: fullyOccupied.length > 0 ? '#f87171' : '#86efac', bg: fullyOccupied.length > 0 ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.06)', border: fullyOccupied.length > 0 ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.2)' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 border" style={{ background: s.bg, borderColor: s.border }}>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{s.label}</p>
            <p className="text-2xl font-extrabold mt-1" style={{ color: s.color }}>{s.value}</p>
            {s.label === 'Fully Occupied' && s.value > 0 && (
              <span className="text-[10px] text-rose-300 font-bold flex items-center gap-1 mt-0.5"><AlertTriangle className="w-3 h-3" /> Alert sent</span>
            )}
          </div>
        ))}
      </div>

      {/* ── SEARCH + CATEGORY FILTER ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search services, categories…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none border"
            style={{ background: card, borderColor: 'var(--line)', color: 'var(--text)' }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${selectedCategory === cat ? 'bg-emerald-500 text-white border-emerald-400 shadow-md' : 'border-transparent text-slate-400 hover:text-emerald-300'}`}
              style={selectedCategory !== cat ? { background: card } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── LIVE TRACKER VIEW ────────────────────────────────────────────── */}
      {viewMode === 'tracker' && (
        <div className="space-y-2">
          {filtered.map(u => {
            const occPct = u.total > 0 ? Math.round((u.inUseCount / u.total) * 100) : 0;
            const isFullyOccupied = u.available === 0 && u.inUseCount > 0;
            const isInUse = u.inUseCount > 0;
            const IconComp = u.icon || Package;
            return (
              <div
                key={u.id}
                className="rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center gap-4 transition-all"
                style={{
                  background: isFullyOccupied ? 'rgba(248,113,113,0.06)' : isInUse ? 'rgba(56,189,248,0.05)' : card,
                  borderColor: isFullyOccupied ? 'rgba(248,113,113,0.35)' : isInUse ? 'rgba(56,189,248,0.25)' : 'var(--line)',
                }}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: 'var(--accent)' }}>
                  <IconComp className="w-5 h-5" />
                </div>

                {/* Name + category */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>{u.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(74,222,128,0.1)', color: 'var(--accent)', border: '1px solid rgba(74,222,128,0.2)' }}>{u.category}</span>
                    {isFullyOccupied && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> FULLY OCCUPIED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>
                    {u.id} · ₱{u.price?.toLocaleString()} / {u.unit || 'day'} · Capacity: {u.capacity}
                  </p>
                  {/* Occupancy bar */}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, occPct)}%`,
                          background: isFullyOccupied ? 'linear-gradient(90deg,#f87171,#ef4444)' : isInUse ? 'linear-gradient(90deg,#38bdf8,#0ea5e9)' : 'linear-gradient(90deg,#4ade80,#22c55e)',
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-bold whitespace-nowrap" style={{ color: isFullyOccupied ? '#f87171' : isInUse ? '#38bdf8' : 'var(--accent)' }}>
                      {occPct}%
                    </span>
                  </div>
                </div>

                {/* Count badges */}
                <div className="flex items-center gap-3 shrink-0 text-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--muted)' }}>In Use</p>
                    <p className="text-lg font-extrabold" style={{ color: isInUse ? '#38bdf8' : 'var(--muted)' }}>{u.inUseCount}</p>
                  </div>
                  <div className="w-px h-8" style={{ background: 'var(--line)' }} />
                  <div>
                    <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--muted)' }}>Available</p>
                    <p className="text-lg font-extrabold" style={{ color: isFullyOccupied ? '#f87171' : 'var(--accent)' }}>{u.available}</p>
                  </div>
                  <div className="w-px h-8" style={{ background: 'var(--line)' }} />
                  <div>
                    <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--muted)' }}>Total</p>
                    <p className="text-lg font-extrabold" style={{ color: 'var(--text)' }}>{u.total}</p>
                  </div>
                </div>

                {/* Status badge */}
                <div className="shrink-0">
                  <span className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider ${isFullyOccupied ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    isInUse ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' :
                      'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}>
                    {isFullyOccupied ? '🔴 Occupied' : isInUse ? '🔵 In Use' : '🟢 Free'}
                  </span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12" style={{ color: 'var(--muted)' }}>
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No services match your filter.</p>
            </div>
          )}
        </div>
      )}

      {/* ── 3D VISUAL CARDS VIEW ─────────────────────────────────────────── */}
      {viewMode === 'gallery' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(u => {
            const isFlipped = !!flippedCards[u.id];
            const occPct = u.total > 0 ? Math.round((u.inUseCount / u.total) * 100) : 0;
            const isFullyOccupied = u.available === 0 && u.inUseCount > 0;
            const isInUse = u.inUseCount > 0;
            const IconComp = u.icon || Package;
            const defaultImg = '/src/assets/images/services/cottage.png';
            return (
              <div key={u.id} className="h-80 w-full [perspective:1000px]">
                <div className={`relative h-full w-full rounded-2xl transition-all duration-700 [transform-style:preserve-3d] shadow-xl ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>

                  {/* FRONT */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden [backface-visibility:hidden] border border-emerald-500/20 bg-slate-900 group">
                    {u.img ? (
                      <img src={u.img} alt={u.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onError={e => { e.target.src = defaultImg; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0c2718, #051a0e)' }}>
                        <IconComp className="w-16 h-16 opacity-20" style={{ color: 'var(--accent)' }} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020a06] via-[#020a06]/40 to-black/20" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                      <span className="bg-slate-950/80 backdrop-blur-md text-emerald-400 font-mono text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-500/40">{u.id}</span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase backdrop-blur-md ${isFullyOccupied ? 'bg-rose-500/90 text-white border border-rose-300/40 animate-pulse' : isInUse ? 'bg-sky-500/90 text-white border border-sky-300/40' : 'bg-emerald-500/90 text-white border border-emerald-300/40'}`}>
                        {isFullyOccupied ? '🔴 Fully Occupied' : isInUse ? `⚡ In Use (${u.inUseCount})` : '🟢 Available'}
                      </span>
                    </div>

                    {/* Bottom overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10 space-y-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">{u.category}</span>
                        <h3 className="font-extrabold text-white text-base mt-1 line-clamp-1">{u.name}</h3>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-white/10">
                        <div>
                          <span className="text-[10px] text-slate-300 block">Rate</span>
                          <span className="font-extrabold text-emerald-400 text-sm">₱{u.price?.toLocaleString()} <span className="text-[10px] font-normal text-slate-300">/ {u.unit || 'day'}</span></span>
                        </div>
                        <button onClick={() => toggleFlip(u.id)} className="bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-lg border border-emerald-400/40 transition-all hover:scale-105">
                          <RotateCw className="w-3.5 h-3.5" /> Details
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* BACK */}
                  <div className="absolute inset-0 rounded-2xl p-5 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#05180f] border border-emerald-500/30 text-white flex flex-col justify-between shadow-2xl">
                    <div>
                      <div className="flex justify-between items-start pb-2 border-b border-emerald-900/60">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">{u.category}</span>
                          <h4 className="font-extrabold text-white text-base line-clamp-1">{u.name}</h4>
                        </div>
                        <span className="font-mono text-[10px] text-emerald-300 bg-black/40 px-2 py-0.5 rounded border border-emerald-800/60">{u.id}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-3 leading-relaxed line-clamp-3 bg-black/30 p-2.5 rounded-xl border border-white/5">
                        {u.description || 'Full resort amenity available for visitors and booking.'}
                      </p>
                    </div>

                    <div className="space-y-2 py-2 border-y border-emerald-900/60">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                          <span className="text-[10px] text-slate-400 block">Rate / Unit</span>
                          <span className="font-extrabold text-emerald-400">₱{u.price?.toLocaleString()} / {u.unit || 'day'}</span>
                        </div>
                        <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                          <span className="text-[10px] text-slate-400 block">Occupancy</span>
                          <span className="font-bold text-slate-200">{u.inUseCount} In Use / {u.available} Free</span>
                        </div>
                      </div>
                      <div className="bg-black/40 p-2 rounded-xl border border-emerald-900/40 space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">Live occupancy</span>
                          <span className={`font-extrabold ${isFullyOccupied ? 'text-rose-300' : isInUse ? 'text-sky-300' : 'text-emerald-300'}`}>{occPct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, occPct)}%`, background: isFullyOccupied ? 'linear-gradient(90deg,#f87171,#ef4444)' : 'linear-gradient(90deg,#38bdf8,#4ade80)' }} />
                        </div>
                      </div>
                      {isFullyOccupied && (
                        <div className="flex items-center gap-1.5 bg-rose-950/80 p-2 rounded-lg border border-rose-500/40">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                          <span className="text-[10px] text-rose-200 font-bold">Fully occupied — inform waiting clients of alternatives.</span>
                        </div>
                      )}
                    </div>

                    <button onClick={() => toggleFlip(u.id)} className="w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700 transition-all">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> Back to Card
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12" style={{ color: 'var(--muted)' }}>
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No services match your filter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main ServicesTab ────────────────────────────────────────────────────────
export default function ServicesTab() {
  return (
    <div className="space-y-10 p-2 sm:p-6 max-w-[1600px] mx-auto">

      {/* SECTION 1 — Live Availability Monitor */}
      <LiveAvailabilityPanel />

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold" style={{ background: 'rgba(74,222,128,0.08)', borderColor: 'rgba(74,222,128,0.25)', color: 'var(--accent)' }}>
          <Tag className="w-4 h-4" />
          Services Catalog Management
        </div>
        <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
      </div>

      {/* SECTION 2 — Admin Service Management (Add / Edit / Delete) */}
      <ServicesTable />

    </div>
  );
}