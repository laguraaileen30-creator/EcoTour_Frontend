import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, RefreshCw, RotateCw, Image as ImageIcon, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import AddServiceModal from '../modals/AddServiceModal';
import { useEcoTour } from '../../../context/EcoTourContext';
import { getStageIndex } from '../../../components/VerticalReservationTimeline';

export default function ServicesTable() {
  const { resortServices, resortBookings, reservations, showAlert, showConfirm } = useEcoTour();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editService, setEditService] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});

  // Active bookings in Stage 03 (Using Services)
  const allBookings = resortBookings?.length ? resortBookings : (reservations || []);
  const inServiceBookings = allBookings.filter(b => getStageIndex(b.status) === 2);

  const getInUseForService = (serviceName, serviceCode) => {
    const sName = (serviceName || '').toLowerCase().trim();
    let count = 0;

    inServiceBookings.forEach(b => {
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
    });

    return count;
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/services');
      const data = await res.json();
      if (data.success && Array.isArray(data.services) && data.services.length > 0) {
        setServices(data.services);
      } else {
        setServices(resortServices || []);
      }
    } catch (err) {
      setServices(resortServices || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [resortServices, resortBookings, reservations]);

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDelete = async (service) => {
    const confirmed = await showConfirm({
      title: 'Delete Service',
      message: `Are you sure you want to delete ${service.service_name}?`,
      details: 'This will remove the service from available catalog.',
      type: 'danger',
      confirmText: 'YES, Delete'
    });
    if (!confirmed) return;

    try {
      const sId = service.service_id || service.id;
      const res = await fetch(`http://localhost:5000/api/v1/services/${sId}`, { method: 'DELETE' });
      if (res.ok) {
        showAlert({
          title: 'Service Deleted',
          message: `${service.service_name} deleted successfully`,
          type: 'success'
        });
        fetchServices();
      }
    } catch (err) {
      showAlert({
        title: 'Error',
        message: 'Failed to delete service',
        type: 'danger'
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#071911] p-5 rounded-2xl border border-emerald-500/20 shadow-xl gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-400" /> Duangon Resort Services &amp; Facilities
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 animate-pulse">
              Live In-Use Synced
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive 3D Cards — Live status updates to <strong>In Use</strong> when clients start using services.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={fetchServices} 
            className="p-2.5 text-slate-300 hover:text-emerald-400 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer border border-white/10 transition-all"
            title="Refresh catalogue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setEditService(null); setModalOpen(true); }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 shadow-lg transition-all border border-emerald-400/30"
          >
            <Plus className="w-4 h-4" /> Add New Service
          </button>
        </div>
      </div>

      {/* 3D Flip Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((srv) => {
          const srvId = srv.service_id || srv.id || srv.service_code;
          const isFlipped = !!flippedCards[srvId];
          const totalCap = parseInt(srv.total_capacity || 10, 10);
          const inUseCount = getInUseForService(srv.service_name || srv.name, srv.service_code);
          const availQty = Math.max(0, totalCap - inUseCount);
          const isFullyOccupied = availQty === 0 && inUseCount > 0;
          const isInUse = inUseCount > 0;
          const occPct = Math.round((inUseCount / totalCap) * 100);
          const defaultImg = '/src/assets/images/services/cottage.png';

          return (
            <div 
              key={srvId} 
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
                    src={srv.image_url || defaultImg}
                    alt={srv.service_name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { e.target.src = defaultImg; }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020a06] via-[#020a06]/40 to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                    <span className="bg-slate-950/80 backdrop-blur-md text-emerald-400 font-mono text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-500/40 shadow-md">
                      {srv.service_code}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-md ${
                      isFullyOccupied
                        ? 'bg-rose-500/90 text-white border border-rose-300/40'
                        : isInUse
                        ? 'bg-sky-500/90 text-white border border-sky-300/40 animate-pulse'
                        : 'bg-emerald-500/90 text-white border border-emerald-300/40'
                    }`}>
                      {isFullyOccupied ? 'Occupied (In Use)' : isInUse ? `⚡ In Use (${inUseCount})` : 'Available'}
                    </span>
                  </div>

                  {/* Bottom Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10 space-y-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
                        {srv.category}
                      </span>
                      <h3 className="font-extrabold text-white text-base mt-1 line-clamp-1 drop-shadow-md">
                        {srv.service_name}
                      </h3>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <div>
                        <span className="text-[10px] text-slate-300 font-medium block">Rate:</span>
                        <div className="font-extrabold text-emerald-400 text-sm">
                          ₱{parseFloat(srv.price).toLocaleString()} <span className="text-[10px] font-normal text-slate-300">/ {srv.unit}</span>
                        </div>
                      </div>

                      {/* Flip Button */}
                      <button
                        onClick={() => toggleFlip(srvId)}
                        className="bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-lg border border-emerald-400/40 transition-all hover:scale-105"
                      >
                        <RotateCw className="w-3.5 h-3.5" /> View 
                      </button>
                    </div>
                  </div>
                </div>

                {/* BACK SIDE (Detailed Information & Management Actions) */}
                <div className="absolute inset-0 h-full w-full rounded-2xl p-5 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#05180f] border border-emerald-500/30 text-white flex flex-col justify-between shadow-2xl">
                  {/* Header */}
                  <div>
                    <div className="flex justify-between items-start pb-2 border-b border-emerald-900/60">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">{srv.category}</span>
                        <h4 className="font-extrabold text-white text-base line-clamp-1">{srv.service_name}</h4>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-300 bg-black/40 px-2 py-0.5 rounded border border-emerald-800/60">
                        {srv.service_code}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="mt-3 space-y-1">
                      <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Description:</span>
                      <p className="text-xs text-slate-200 leading-relaxed line-clamp-3 bg-black/30 p-2.5 rounded-xl border border-white/5">
                        {srv.description || "No detailed description provided for this service."}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="space-y-2 my-1 py-1.5 border-y border-emerald-900/60">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                        <span className="text-[10px] text-slate-400 block font-medium">Rate / Unit</span>
                        <span className="font-extrabold text-emerald-400 text-xs">₱{parseFloat(srv.price).toLocaleString()} / {srv.unit}</span>
                      </div>
                      <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                        <span className="text-[10px] text-slate-400 block font-medium">Total Capacity</span>
                        <span className="font-bold text-slate-200 text-xs">{totalCap} Total Units</span>
                        <span className="text-[10px] font-extrabold text-emerald-300 block mt-0.5">
                          {availQty} Vacant / {inUseCount} In Use
                        </span>
                      </div>
                    </div>

                    {/* Live Availability / Occupancy Bar */}
                    <div className="space-y-1 bg-black/40 p-2 rounded-xl border border-emerald-900/40">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400 font-medium">Live Status:</span>
                        <span className={`font-extrabold ${isInUse ? 'text-sky-300' : 'text-emerald-300'}`}>
                          {isInUse ? `${inUseCount} in use (${occPct}%)` : '100% Vacant'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, occPct)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions & Flip Back */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => toggleFlip(srvId)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 border border-slate-700 transition-all"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> Front Image
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => { setEditService(srv); setModalOpen(true); }}
                        className="p-2 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-xl cursor-pointer border border-emerald-500/40 transition-all" 
                        title="Edit Service"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(srv)} 
                        className="p-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl cursor-pointer border border-rose-800/60 transition-all" 
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AddServiceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        serviceToEdit={editService}
        onSave={() => fetchServices()}
      />
    </div>
  );
}