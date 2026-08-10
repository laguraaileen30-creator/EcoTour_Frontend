import React, { useState } from 'react';
import { Search, Filter, RotateCw, CheckCircle, ArrowRight, ShieldCheck, Sparkles, Image as ImageIcon, Tag } from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';

import cottageImg from '../../../assets/images/services/cottage.png';
import tableImg from '../../../assets/images/services/table.png';
import videokeImg from '../../../assets/images/services/videoke.png';
import roomImg from '../../../assets/images/services/room.png';
import waterImg from '../../../assets/images/services/swimming.png';
import lifevestImg from '../../../assets/images/services/lifevest.png';
import parkingImg from '../../../assets/images/services/parking.png';
import tentImg from '../../../assets/images/services/tent.png';

const ALL_SERVICES_CATALOG = [
  {
    service_id: 'SRV-01',
    service_code: 'COT-01',
    service_name: 'Standard Open Cottage',
    category: 'Cottages',
    price: 600,
    unit: 'day',
    total_capacity: 10,
    available_quantity: 8,
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
    total_capacity: 5,
    available_quantity: 4,
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
    total_capacity: 20,
    available_quantity: 16,
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
    available_quantity: 3,
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
    total_capacity: 10,
    available_quantity: 7,
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
    available_quantity: 2,
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
    total_capacity: 15,
    available_quantity: 11,
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
    available_quantity: 42,
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
    available_quantity: 28,
    status: 'Active',
    image_url: parkingImg,
    description: 'Spacious gated parking area with CCTV surveillance and security guards stationed full-time.',
  },
];

export default function ClientServicesTab({ onNavigateBook }) {
  const { resortServices } = useEcoTour();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [flippedCards, setFlippedCards] = useState({});

  const servicesList = resortServices && resortServices.length > 0 ? resortServices : ALL_SERVICES_CATALOG;
  const categories = ['All', 'Cottages', 'Accommodations', 'Water Activities', 'Tables', 'Entertainment', 'Safety', 'Parking'];

  const filteredServices = servicesList.filter((s) => {
    const sName = s.service_name || s.name || '';
    const sDesc = s.description || '';
    const sCat = s.category || '';
    const matchesSearch = sName.toLowerCase().includes(searchQuery.toLowerCase()) || sDesc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || sCat.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 text-white max-w-[1600px] mx-auto p-2 sm:p-4">
      {/* HEADER BANNER */}
      <div className="bg-[#071911] p-5 rounded-2xl border border-emerald-500/20 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-400" /> Duangon Resort Services & Facilities
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive 3D Cards — Flip to view full details, total capacity, live availability below capacity, and pricing.
          </p>
        </div>
        <div className="bg-emerald-950/80 px-4 py-2 rounded-xl border border-emerald-800 flex items-center gap-2 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-emerald-300">{filteredServices.length} Services Catalogued</span>
        </div>
      </div>

      {/* SEARCH & CATEGORY FILTERS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0c1f16] p-4 rounded-2xl border border-emerald-500/15 shadow-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by service name, code, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-emerald-900/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-emerald-950/60 text-slate-300 hover:text-white border border-emerald-900/60'
              }`}
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
          const availQty = srv.available_qty !== undefined ? parseInt(srv.available_qty, 10) : (srv.available_quantity !== undefined ? parseInt(srv.available_quantity, 10) : totalCap);
          const inUseQty = Math.max(0, totalCap - availQty);
          const availPct = Math.round((availQty / totalCap) * 100);
          const defaultImg = srv.image_url || srv.image || srv.img || cottageImg;

          return (
            <div key={srvId} className="h-96 w-full [perspective:1000px]">
              <div
                className={`relative h-full w-full rounded-2xl transition-all duration-700 [transform-style:preserve-3d] shadow-xl ${
                  isFlipped ? '[transform:rotateY(180deg)]' : ''
                }`}
              >
                {/* FRONT SIDE (Image & Quick Overview) */}
                <div className="absolute inset-0 h-full w-full rounded-2xl overflow-hidden [backface-visibility:hidden] border border-emerald-500/20 bg-slate-900 group flex flex-col justify-between">
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
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-md bg-emerald-500/90 text-white border border-emerald-300/40">
                        {srv.status || 'Active'}
                      </span>
                    </div>

                    {/* Category Overlay */}
                    <div className="absolute bottom-3 left-3 z-10">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-700/50">
                        {srv.category || 'Facility'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Content Overlay */}
                  <div className="p-4 bg-gradient-to-b from-[#0c1f16] to-[#05180f] flex-1 flex flex-col justify-between border-t border-emerald-900/60">
                    <div>
                      <h3 className="font-extrabold text-white text-base line-clamp-1 group-hover:text-emerald-400 transition-colors">
                        {srvName}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{srv.description}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <div>
                        <span className="text-[10px] text-slate-300 font-medium block">Rate / Unit:</span>
                        <div className="font-extrabold text-emerald-400 text-sm">
                          ₱{priceVal.toLocaleString()} <span className="text-[10px] font-normal text-slate-300">/ {srv.unit || 'day'}</span>
                        </div>
                      </div>

                      {/* Flip Button */}
                      <button
                        onClick={() => toggleFlip(srvId)}
                        className="bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-lg border border-emerald-400/40 transition-all hover:scale-105"
                      >
                        <RotateCw className="w-3.5 h-3.5" /> View Info 3D
                      </button>
                    </div>
                  </div>
                </div>

                {/* BACK SIDE (Detailed Information & Capacity/Availability) */}
                <div className="absolute inset-0 h-full w-full rounded-2xl p-5 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#05180f] border border-emerald-500/30 text-white flex flex-col justify-between shadow-2xl">
                  {/* Header */}
                  <div>
                    <div className="flex justify-between items-start pb-2 border-b border-emerald-900/60">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">{srv.category}</span>
                        <h4 className="font-extrabold text-white text-base line-clamp-1">{srvName}</h4>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-300 bg-black/40 px-2 py-0.5 rounded border border-emerald-800/60">
                        {srvCode}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="mt-2.5 space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Description:</span>
                      <p className="text-xs text-slate-200 leading-relaxed line-clamp-3 bg-black/30 p-2.5 rounded-xl border border-white/5 font-medium">
                        {srv.description || "No detailed description provided for this service."}
                      </p>
                    </div>
                  </div>

                  {/* METADATA GRID: CAPACITY & AVAILABILITY BELOW TOTAL CAPACITY */}
                  <div className="space-y-2 my-2 py-2 border-y border-emerald-900/60">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-400 block font-medium">Rate / Unit</span>
                        <span className="font-extrabold text-emerald-400 text-xs">₱{priceVal.toLocaleString()} / {srv.unit || 'day'}</span>
                      </div>
                      <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-400 block font-medium">Total Capacity</span>
                        <span className="font-bold text-slate-200 text-xs">{totalCap} Total Units</span>
                        <span className="text-[10px] font-extrabold text-emerald-300 block mt-0.5">
                          {availQty} Units Available
                        </span>
                      </div>
                    </div>

                    {/* LIVE OCCUPANCY / AVAILABILITY PROGRESS BAR */}
                    <div className="space-y-1 bg-black/40 p-2.5 rounded-xl border border-emerald-900/40">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400 font-medium">Availability Status:</span>
                        <span className="font-extrabold text-emerald-300">
                          {availQty} Available / {inUseQty} Rented ({availPct}% Free)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(availPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS: FLIP BACK & BOOK NOW */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => toggleFlip(srvId)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 border border-slate-700 transition-all"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> Front Image
                    </button>

                    <button
                      onClick={() => { if (onNavigateBook) onNavigateBook(srv); }}
                      className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-lg transition-all border border-emerald-300/40 uppercase tracking-wider"
                    >
                      Book Now <ArrowRight className="w-3.5 h-3.5" />
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
