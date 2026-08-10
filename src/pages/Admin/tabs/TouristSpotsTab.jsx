import React from 'react';
import { MapPin, Plus, Edit, Image, FileText, Trees, Phone, Mail, Globe, ExternalLink, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const NEARBY_DESTINATIONS = [
  { name: 'Man-Made Forest', location: 'Bilar, Bohol', dist: '12.4 km', img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80' },
  { name: 'Bohol Tarsier Conservation Area', location: 'Corella, Bohol', dist: '15.8 km', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80' },
  { name: 'Chocolate Hills', location: 'Carmen, Bohol', dist: '17.2 km', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80' },
  { name: 'Loboc River Cruise', location: 'Loboc, Bohol', dist: '32.6 km', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80' },
  { name: 'Hinagdanan Cave', location: 'Dauis, Bohol', dist: '28.9 km', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },
];

const SERVICES = [
  { title: 'Entrance Fee (Local)', desc: 'Entrance fee for local visitors', price: '₱30.00', status: 'Active' },
  { title: 'Entrance Fee (Foreign)', desc: 'Entrance fee for foreign visitors', price: '₱100.00', status: 'Active' },
  { title: 'Cottage (Small)', desc: 'Good for 10-15 persons', price: '₱500.00', status: 'Active' },
  { title: 'Cottage (Large)', desc: 'Good for 20-25 persons', price: '₱1,000.00', status: 'Active' },
  { title: 'Table (6 Seater)', desc: 'Wooden table good for 6 persons', price: '₱150.00', status: 'Active' },
];

export default function TouristSpotsTab() {
  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-white">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tourist Information
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Manage tourist information, services, gallery, and nearby destinations
            </p>
          </div>
        </div>

        <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all border border-emerald-400/40 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add New Content
        </button>
      </div>

      {/* 4 TOP STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">INFORMATION PAGES</span>
            <p className="text-xl font-bold text-white mt-0.5">4</p>
            <span className="text-[10px] text-emerald-400 font-semibold">↑ 100% vs last month</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Image className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">GALLERY IMAGES</span>
            <p className="text-xl font-bold text-white mt-0.5">48</p>
            <span className="text-[10px] text-emerald-400 font-semibold">↑ 20% vs last month</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Trees className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">SERVICES LISTED</span>
            <p className="text-xl font-bold text-white mt-0.5">15</p>
            <span className="text-[10px] text-emerald-400 font-semibold">↑ 7.1% vs last month</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">DESTINATIONS</span>
            <p className="text-xl font-bold text-white mt-0.5">10</p>
            <span className="text-[10px] text-emerald-400 font-semibold">↑ 11.1% vs last month</span>
          </div>
        </div>
      </div>

      {/* DUANGON COLD SPRING MAIN CARD */}
      <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trees className="w-5 h-5 text-emerald-400" /> Duangon Cold Spring
          </h3>
          <button className="px-3.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <Edit className="w-3.5 h-3.5" /> Edit Information
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* RESORT PHOTO & GALLERY PREVIEWS */}
          <div className="space-y-3">
            <img
              src="https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80"
              alt="Duangon Cold Spring"
              className="w-full h-56 rounded-xl object-cover border border-emerald-500/20 shadow-md"
            />
            <div className="grid grid-cols-4 gap-2">
              <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200&q=80" alt="" className="w-full h-14 rounded-lg object-cover border border-emerald-800" />
              <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=80" alt="" className="w-full h-14 rounded-lg object-cover border border-emerald-800" />
              <img src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&q=80" alt="" className="w-full h-14 rounded-lg object-cover border border-emerald-800" />
              <div className="w-full h-14 rounded-lg bg-[#04150e] border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold text-xs cursor-pointer">+44</div>
            </div>
          </div>

          {/* DETAILS COL 1 */}
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Title</span>
              <p className="text-white font-bold text-sm">Duangon Cold Spring</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Location</span>
              <p className="text-white">Zamora, Bilar, Bohol</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Description</span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Duangon Cold Spring is a beautiful natural spring known for its crystal-clear cold water, refreshing pools, and relaxing environment surrounded by lush greenery.
              </p>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Operating Hours</span>
              <p className="text-white font-semibold">8:00 AM - 5:00 PM (Daily)</p>
            </div>
          </div>

          {/* DETAILS COL 2 */}
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Contact Number</span>
              <p className="text-white">0917 123 4567</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Email</span>
              <p className="text-white">info@duangoncoldspring.ph</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Google Maps Link</span>
              <a href="https://maps.app.goo.gl/duangoncoldspring" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1">
                https://maps.app.goo.gl/duangoncoldspring <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Status</span>
              <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full font-bold text-[10px] inline-block mt-0.5">Active</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Last Updated</span>
              <p className="text-slate-300">May 25, 2024 10:30 AM</p>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-GRID: SERVICES INFORMATION & GALLERY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SERVICES INFORMATION */}
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <Trees className="w-4 h-4 text-emerald-400" /> Services Information
            </h4>
            <button className="text-xs text-slate-300 border border-white/10 rounded-lg px-3 py-1 hover:bg-white/5 cursor-pointer">Manage Services</button>
          </div>

          <div className="space-y-3">
            {SERVICES.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#04150e] border border-emerald-900/30">
                <div>
                  <h5 className="text-xs font-bold text-white">{s.title}</h5>
                  <p className="text-[11px] text-slate-400">{s.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-emerald-300 font-bold text-xs">{s.price}</span>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] rounded-full font-bold">Active</span>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full py-2 bg-[#092217] hover:bg-emerald-900/40 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-800/40 cursor-pointer text-center">
            View all services →
          </button>
        </div>

        {/* GALLERY GRID */}
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <Image className="w-4 h-4 text-emerald-400" /> Gallery
            </h4>
            <button className="text-xs text-slate-300 border border-white/10 rounded-lg px-3 py-1 hover:bg-white/5 cursor-pointer">Manage Gallery</button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <img src="https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=300&q=80" alt="" className="w-full h-24 rounded-lg object-cover border border-emerald-800" />
            <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=300&q=80" alt="" className="w-full h-24 rounded-lg object-cover border border-emerald-800" />
            <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&q=80" alt="" className="w-full h-24 rounded-lg object-cover border border-emerald-800" />
            <img src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&q=80" alt="" className="w-full h-24 rounded-lg object-cover border border-emerald-800" />
            <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&q=80" alt="" className="w-full h-24 rounded-lg object-cover border border-emerald-800" />
            <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80" alt="" className="w-full h-24 rounded-lg object-cover border border-emerald-800" />
          </div>

          <button className="w-full py-2 bg-[#092217] hover:bg-emerald-900/40 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-800/40 cursor-pointer text-center">
            View all images →
          </button>
        </div>

      </div>

      {/* NEARBY DESTINATIONS */}
      <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h4 className="font-bold text-white text-base">Nearby Destinations</h4>
          <button className="text-xs text-slate-300 border border-white/10 rounded-lg px-3 py-1 hover:bg-white/5 cursor-pointer">Manage Destinations</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {NEARBY_DESTINATIONS.map((d, i) => (
            <div key={i} className="rounded-xl border border-emerald-900/40 bg-[#04150e] overflow-hidden flex flex-col justify-between">
              <img src={d.img} alt={d.name} className="w-full h-28 object-cover" />
              <div className="p-3 space-y-1">
                <h5 className="font-bold text-white text-xs truncate">{d.name}</h5>
                <p className="text-[10px] text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-400" /> {d.location}</p>
                <span className="text-[10px] text-emerald-400 font-semibold block">📍 {d.dist}</span>
                <button className="w-full mt-2 py-1.5 bg-[#092217] hover:bg-emerald-900/40 text-emerald-300 text-[11px] font-semibold rounded-lg border border-emerald-800/40 cursor-pointer">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}