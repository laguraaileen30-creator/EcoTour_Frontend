import React, { useState, useEffect } from 'react';
import { Trees, RefreshCw, RotateCw, Image as ImageIcon } from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';

export default function FacilitiesTab() {
  const { facilities: contextFacilities } = useEcoTour();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});

  const fetchLiveFacilities = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/services');
      const data = await res.json();
      if (data.success && Array.isArray(data.services) && data.services.length > 0) {
        const mapped = data.services.map((s, idx) => {
          const totalCap = s.total_capacity || 10;
          const availQty = s.available_qty !== undefined ? parseInt(s.available_qty, 10) : (s.available_quantity !== undefined ? parseInt(s.available_quantity, 10) : totalCap);
          const rentedQty = Math.max(0, totalCap - availQty);

          return {
            id: s.service_id || idx,
            service_code: s.service_code || `DSVC-00${idx + 1}`,
            name: s.service_name,
            category: s.category || 'General',
            price: parseFloat(s.price || 0),
            available_qty: availQty,
            rentedQuantity: rentedQty,
            totalQuantity: totalCap,
            status: s.status || 'Available',
            unit: s.unit || 'unit',
            description: s.description || 'Full resort amenity available for visitors and booking.',
            img: s.image_url || '/src/assets/images/services/cottage.png',
          };
        });
        setFacilities(mapped);
      } else {
        setFacilities(contextFacilities);
      }
    } catch (e) {
      setFacilities(contextFacilities);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveFacilities();
  }, [contextFacilities]);

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6 text-white max-w-[1600px] mx-auto p-2 sm:p-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#071911] p-5 rounded-2xl border border-emerald-500/20 shadow-xl gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Trees className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
              Duangon Resort Services & Facilities Status
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive 3D Cards — Flip to view full details, capacity, pricing, and occupancy rates.
            </p>
          </div>
        </div>
        <button 
          onClick={fetchLiveFacilities}
          className="p-2.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 rounded-xl cursor-pointer border border-emerald-500/30 transition-all flex items-center gap-2 text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* 3D Flip Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map((fac) => {
          const facId = fac.id || fac.service_code;
          const isFlipped = !!flippedCards[facId];
          const occPct = Math.round((fac.rentedQuantity / (fac.totalQuantity || 1)) * 100);
          const defaultImg = '/src/assets/images/services/cottage.png';

          return (
            <div 
              key={facId} 
              className="h-80 w-full [perspective:1000px]"
            >
              <div 
                className={`relative h-full w-full rounded-2xl transition-all duration-700 [transform-style:preserve-3d] shadow-xl ${
                  isFlipped ? '[transform:rotateY(180deg)]' : ''
                }`}
              >
                {/* FRONT SIDE (Image & Quick Overview) */}
                <div className="absolute inset-0 h-full w-full rounded-2xl overflow-hidden [backface-visibility:hidden] border border-emerald-500/20 bg-slate-900 group">
                  <img
                    src={fac.img || defaultImg}
                    alt={fac.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { e.target.src = defaultImg; }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020a06] via-[#020a06]/40 to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                    <span className="bg-slate-950/80 backdrop-blur-md text-emerald-400 font-mono text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-500/40 shadow-md">
                      {fac.service_code}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-md ${
                      fac.status === 'Available' ? 'bg-emerald-500/90 text-white border border-emerald-300/40' : 'bg-rose-500/90 text-white border border-rose-300/40'
                    }`}>
                      {fac.status}
                    </span>
                  </div>

                  {/* Bottom Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10 space-y-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
                        {fac.category}
                      </span>
                      <h3 className="font-extrabold text-white text-base mt-1 line-clamp-1 drop-shadow-md">
                        {fac.name}
                      </h3>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <div>
                        <span className="text-[10px] text-slate-300 font-medium block">Rate:</span>
                        <div className="font-extrabold text-emerald-400 text-sm">
                          ₱{fac.price.toLocaleString()} <span className="text-[10px] font-normal text-slate-300">/ {fac.unit}</span>
                        </div>
                      </div>

                      {/* Flip Button */}
                      <button
                        onClick={() => toggleFlip(facId)}
                        className="bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-lg border border-emerald-400/40 transition-all hover:scale-105"
                      >
                        <RotateCw className="w-3.5 h-3.5" /> View Info 3D
                      </button>
                    </div>
                  </div>
                </div>

                {/* BACK SIDE (Detailed Information & Occupancy) */}
                <div className="absolute inset-0 h-full w-full rounded-2xl p-5 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#05180f] border border-emerald-500/30 text-white flex flex-col justify-between shadow-2xl">
                  {/* Header */}
                  <div>
                    <div className="flex justify-between items-start pb-2 border-b border-emerald-900/60">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">{fac.category}</span>
                        <h4 className="font-extrabold text-white text-base line-clamp-1">{fac.name}</h4>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-300 bg-black/40 px-2 py-0.5 rounded border border-emerald-800/60">
                        {fac.service_code}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="mt-3 space-y-1">
                      <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Facility Information:</span>
                      <p className="text-xs text-slate-200 leading-relaxed line-clamp-3 bg-black/30 p-2.5 rounded-xl border border-white/5">
                        {fac.description || "Detailed facility information for resort staff and visitors."}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Grid: Capacity & Availability below Capacity */}
                  <div className="space-y-2 my-2 py-2 border-y border-emerald-900/60">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                        <span className="text-[10px] text-slate-400 block font-medium">Rate / Unit</span>
                        <span className="font-extrabold text-emerald-400 text-xs">₱{fac.price.toLocaleString()} / {fac.unit}</span>
                      </div>
                      <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                        <span className="text-[10px] text-slate-400 block font-medium">Total Capacity</span>
                        <span className="font-bold text-slate-200 text-xs">{fac.totalQuantity} Total Units</span>
                        <span className="text-[10px] font-extrabold text-emerald-300 block mt-0.5">
                          {Math.max(0, fac.totalQuantity - fac.rentedQuantity)} Available
                        </span>
                      </div>
                    </div>

                    {/* Occupancy / Availability Progress Bar */}
                    <div className="space-y-1 bg-black/40 p-2 rounded-xl border border-emerald-900/40">
                      <div className="flex justify-between text-[10px] text-slate-300 font-medium">
                        <span>Availability Status:</span>
                        <span className="font-extrabold text-emerald-300">
                          {Math.max(0, fac.totalQuantity - fac.rentedQuantity)} Available / {fac.rentedQuantity} Rented
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, 100 - occPct))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Flip Back */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => toggleFlip(facId)}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> Front Image
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