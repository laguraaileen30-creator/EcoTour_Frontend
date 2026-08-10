import React, { useState, useEffect } from 'react';
import {
  Package, Calendar, CheckCircle2, Clock, RefreshCw,
  Home, Users, Droplets, Utensils, Trees, Search, ShieldCheck, Plus, Minus
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';

const DEFAULT_UNITS = [
  { id: 'DSVC-001', name: 'Cold Spring Pool Entrance Ticket', category: 'Entrance', capacity: '300 Pax', price: 100, available: 176, total: 300, icon: Users },
  { id: 'DSVC-002', name: 'Standard Open Cottage', category: 'Cottages', capacity: '10 Pax', price: 600, available: 10, total: 11, icon: Home },
  { id: 'DSVC-003', name: 'Resort Table & Chairs Set', category: 'Tables', capacity: '4 Pax', price: 250, available: 16, total: 40, icon: Utensils },
  { id: 'DSVC-004', name: 'Life Vest / Safety Gear', category: 'Equipment', capacity: '1 Pax', price: 50, available: 19, total: 50, icon: ShieldCheck },
  { id: 'DSVC-005', name: 'Videoke Karaoke System', category: 'Equipment', capacity: '20 Pax', price: 500, available: 1, total: 4, icon: Droplets },
  { id: 'DSVC-006', name: 'Kayak / Floating Pad Rental', category: 'Equipment', capacity: '2 Pax', price: 300, available: 2, total: 5, icon: Droplets },
  { id: 'DSVC-007', name: 'Aircon Kubo Guest Room', category: 'Rooms', capacity: '6 Pax', price: 1500, available: 4, total: 6, icon: Home },
  { id: 'DSVC-008', name: 'Camping Pitch & Tent', category: 'Rooms', capacity: '4 Pax', price: 450, available: 4, total: 8, icon: Trees },
];

export default function AvailabilityTab() {
  const { resortServices } = useEcoTour();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [units, setUnits] = useState(DEFAULT_UNITS);

  // Sync live backend resortServices if available
  useEffect(() => {
    if (resortServices && resortServices.length > 0) {
      const mapped = resortServices.map((s, idx) => {
        const total = s.total_capacity || 10;
        const avail = typeof s.available_qty === 'number' ? s.available_qty : (typeof s.available_quantity === 'number' ? s.available_quantity : total);
        return {
          id: s.service_code || `DSVC-00${idx + 1}`,
          name: s.service_name,
          category: s.category || 'Cottages',
          capacity: s.total_capacity ? `${s.total_capacity} Pax` : 'N/A',
          price: typeof s.price === 'number' ? s.price : parseFloat(s.price || 0),
          available: avail,
          total: total,
          icon: s.category === 'Equipment' ? ShieldCheck : s.category === 'Tables' ? Utensils : Home,
        };
      });
      setUnits(mapped);
    }
  }, [resortServices]);

  // Handle Customer Avail / Book (-1 available unit)
  const handleAvailUnit = (unitId) => {
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id === unitId) {
          const newAvail = Math.max(0, u.available - 1);
          return { ...u, available: newAvail };
        }
        return u;
      })
    );
  };

  // Handle Release / Return (+1 available unit)
  const handleReleaseUnit = (unitId) => {
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id === unitId) {
          const newAvail = Math.min(u.total, u.available + 1);
          return { ...u, available: newAvail };
        }
        return u;
      })
    );
  };

  const categories = ['All', 'Cottages', 'Rooms', 'Tables', 'Equipment', 'Entrance'];

  const filteredUnits = units.filter((unit) => {
    const matchesCategory = selectedCategory === 'All' || unit.category === selectedCategory;
    const matchesSearch = unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          unit.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const availableCount = units.reduce((acc, u) => acc + (u.available > 0 ? 1 : 0), 0);
  const occupiedCount = units.reduce((acc, u) => acc + (u.total - u.available), 0);

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-white">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-emerald-900/40 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Real-Time Facility Availability
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Accurate live capacity tracking — updates automatically in real-time when customers avail services.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#092217] border border-emerald-800/60 text-emerald-100 text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none cursor-pointer focus:border-emerald-400 transition-all font-semibold"
            />
          </div>
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-2.5 bg-emerald-950/80 border border-emerald-700/50 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Today
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-[#0c1f16] p-4.5 flex items-center gap-4 shadow-lg">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">AVAILABLE SERVICE TYPES</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">{availableCount} Active Types</div>
            <span className="text-[10px] text-slate-400 font-semibold">Ready for customer booking</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-[#0c1f16] p-4.5 flex items-center gap-4 shadow-lg">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">UNITS IN USE / AVAILED</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-0.5">{occupiedCount} Units</div>
            <span className="text-[10px] text-slate-400 font-semibold">Active customer rentals</span>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-500/20 bg-[#0c1f16] p-4.5 flex items-center gap-4 shadow-lg">
          <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">DATE TRACKED</span>
            <div className="text-sm font-extrabold text-sky-300 mt-0.5">{selectedDate}</div>
            <span className="text-[10px] text-slate-400 font-semibold">Duangon Operations</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#0c1f16] p-4.5 flex items-center gap-4 shadow-lg">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">PARK CAPACITY</span>
            <div className="text-2xl font-extrabold text-white mt-0.5">Real-time Stock</div>
            <div className="w-28 bg-emerald-950 h-1.5 rounded-full mt-1 overflow-hidden border border-emerald-800">
              <div className="bg-emerald-400 h-full w-[70%]" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="rounded-2xl border border-emerald-500/20 bg-[#061c13] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/60" />
          <input
            type="text"
            placeholder="Search unit or cottage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#04150e] border border-emerald-800/60 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-400 transition-all"
          />
        </div>
      </div>

      {/* RESOURCE AVAILABILITY CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUnits.map((unit) => {
          const IconComponent = unit.icon || Home;
          const isAvailable = unit.available > 0;
          const occPct = Math.round(((unit.total - unit.available) / unit.total) * 100);

          return (
            <div
              key={unit.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all hover:scale-[1.01] ${
                isAvailable
                  ? 'border-emerald-500/30 bg-[#072217] shadow-lg shadow-emerald-950/40'
                  : 'border-rose-500/30 bg-[#1c0a0e]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-800/60">
                    {unit.id}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      isAvailable
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {isAvailable ? 'Available' : 'Fully Booked'}
                  </span>
                </div>

                <div className="flex items-start gap-3 pt-1">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">{unit.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{unit.category} • Capacity: {unit.capacity}</p>
                  </div>
                </div>
              </div>

              {/* REAL-TIME AVAILABILITY BADGE (Format: 10 / 11 Available) */}
              <div className="bg-black/40 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold">Live Availability:</span>
                <span className="font-mono font-extrabold text-sm text-emerald-300 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-700/60">
                  {unit.available} / {unit.total} Available
                </span>
              </div>

              {/* Occupancy Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Occupancy</span>
                  <span className="font-bold text-slate-200">{unit.total - unit.available} in use ({occPct}%)</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(occPct, 100)}%` }} />
                </div>
              </div>

              {/* Action Controls: Avail (-1) / Release (+1) */}
              <div className="border-t border-white/10 pt-3 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Rate:</span>
                  <span className="font-extrabold text-emerald-400 text-xs">₱{unit.price.toLocaleString()}.00</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleReleaseUnit(unit.id)}
                    disabled={unit.available >= unit.total}
                    className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl cursor-pointer border border-slate-700 transition-all"
                    title="Release / Return Unit (+1)"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleAvailUnit(unit.id)}
                    disabled={unit.available <= 0}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer flex items-center gap-1 shadow-md transition-all border border-emerald-400/40"
                  >
                    <Minus className="w-3.5 h-3.5" /> Avail (-1)
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
