import React from 'react';
import {
  MapPin, Calendar, Clock, Phone, Navigation, Heart, Star, ChevronLeft, ChevronRight,
  ArrowRight, Car, Compass, HelpCircle, Check, Trash2, Shield, AlertTriangle
} from 'lucide-react';

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80',
];

const ACTIVITIES = [
  { name: 'Swimming', desc: 'Enjoy the refreshing and cold spring water.', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80' },
  { name: 'Picnic', desc: 'Perfect spot for family picnics and gatherings.', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80' },
  { name: 'Nature Walk', desc: 'Explore the lush trails and scenic surroundings.', img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80' },
  { name: 'Photography', desc: 'Capture the beauty of nature and waterfalls.', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80' },
];

const NEARBY = [
  { name: 'Bohol Tarsier Conservation Area', dist: '18 km', fee: '₱50.00', rating: '4.8', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80' },
  { name: 'Hinagdanan Cave', dist: '18 km', fee: '₱50.00', rating: '4.6', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80' },
  { name: 'Man-Made Forest', dist: '22 km', fee: '₱30.00', rating: '4.7', img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80' },
  { name: 'Pangas Falls', dist: '28 km', fee: '₱20.00', rating: '4.6', img: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&q=80' },
  { name: 'Loboc River Cruise', dist: '30 km', fee: '₱550.00', rating: '4.5', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80' },
];

export default function TravelGuideTab({ onBook }) {
  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-white">
      
      {/* PAGE HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider block">Welcome back,</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            TRAVEL GUIDE 🌿
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Explore Duangon Cold Spring and discover the beauty of Bilar, Bohol.
          </p>
        </div>
      </div>

      {/* TOP SECTION: DUANGON COLD SPRING HERO & SIDEBAR INFO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DUANGON COLD SPRING MAIN CARD (2 SPANS) */}
        <div className="lg:col-span-2 rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-6 space-y-4 shadow-xl">
          <div className="rounded-xl overflow-hidden relative border border-emerald-500/20 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1000&q=80"
              alt="Duangon Cold Spring"
              className="w-full h-72 object-cover"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">DUANGON COLD SPRING</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Duangon, Zamora, Bilar, Bohol
                </p>
              </div>
              <button
                onClick={onBook}
                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-950/60"
              >
                Learn More <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              A hidden paradise with crystal-clear spring waters surrounded by lush greenery. Perfect for relaxation, picnics, and nature adventures.
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-xs">
              <div className="flex items-center gap-2 p-2 px-3 rounded-lg bg-[#04150e] border border-emerald-900/40">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <div>
                  <strong className="text-white block text-xs">200m</strong>
                  <span className="text-[10px] text-slate-400">from road</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 px-3 rounded-lg bg-[#04150e] border border-emerald-900/40">
                <Clock className="w-4 h-4 text-emerald-400" />
                <div>
                  <strong className="text-white block text-xs">15-20 mins</strong>
                  <span className="text-[10px] text-slate-400">travel time</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 px-3 rounded-lg bg-[#04150e] border border-emerald-900/40">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <div>
                  <strong className="text-white block text-xs">All Year</strong>
                  <span className="text-[10px] text-slate-400">best to visit</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: QUICK INFO & PLAN YOUR VISIT */}
        <div className="space-y-6">
          
          {/* QUICK INFO */}
          <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider border-b border-white/5 pb-3">QUICK INFO</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Location</span>
                  <strong className="text-white text-xs">Duangon, Zamora, Bilar, Bohol</strong>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Entrance Fee</span>
                  <strong className="text-emerald-400 text-xs font-mono">₱30.00 / person</strong>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Operating Hours</span>
                  <strong className="text-white text-xs">7:00 AM - 5:00 PM Daily</strong>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Contact</span>
                  <strong className="text-white font-mono text-xs">+63 912 345 6789</strong>
                </div>
              </div>
            </div>

            <button className="w-full py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl cursor-pointer transition-all text-center">
              📍 View on Map
            </button>
          </div>

          {/* PLAN YOUR VISIT */}
          <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider border-b border-white/5 pb-3">PLAN YOUR VISIT</h4>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">Best Time to Visit</span>
                <p className="text-white">March - May (Dry Season)</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] font-bold">What to Bring</span>
                <p className="text-slate-300">Swimwear, Extra clothes, Towel, Aqua shoes</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] font-bold">Reminders</span>
                <ul className="text-slate-300 list-disc list-inside space-y-1 text-[11px] mt-1">
                  <li>Keep the area clean</li>
                  <li>No littering</li>
                  <li>Respect nature and wildlife</li>
                  <li>Follow staff instructions</li>
                </ul>
              </div>
            </div>

            <button
              onClick={onBook}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Book Your Adventure <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* GALLERY */}
      <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h4 className="font-bold text-white text-base">GALLERY</h4>
          <button className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer">View All</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {GALLERY_IMAGES.map((img, i) => (
            <img key={i} src={img} alt="" className="w-full h-32 rounded-xl object-cover border border-emerald-800/40 hover:border-emerald-400 transition-all cursor-pointer" />
          ))}
        </div>
      </div>

      {/* ACTIVITIES */}
      <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h4 className="font-bold text-white text-base">ACTIVITIES</h4>
          <button className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer">View All</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ACTIVITIES.map((act, i) => (
            <div key={i} className="rounded-xl border border-emerald-900/40 bg-[#04150e] overflow-hidden space-y-2 pb-3">
              <img src={act.img} alt={act.name} className="w-full h-32 object-cover" />
              <div className="px-3 space-y-1">
                <h5 className="font-bold text-white text-xs">{act.name}</h5>
                <p className="text-[11px] text-slate-400">{act.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEARBY DESTINATIONS */}
      <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h4 className="font-bold text-white text-base">NEARBY DESTINATIONS</h4>
          <button className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer">View All</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {NEARBY.map((d, i) => (
            <div key={i} className="rounded-xl border border-emerald-900/40 bg-[#04150e] overflow-hidden flex flex-col justify-between relative">
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30">
                {d.dist}
              </span>
              <img src={d.img} alt={d.name} className="w-full h-28 object-cover" />
              <div className="p-3 space-y-1">
                <h5 className="font-bold text-white text-xs truncate">{d.name}</h5>
                <p className="text-[10px] text-slate-400">Entrance: <span className="text-emerald-400 font-mono font-bold">{d.fee}</span></p>
                <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                  ★ {d.rating}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VISITOR GUIDELINES */}
      <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
        <h4 className="font-bold text-white text-base border-b border-white/5 pb-3">VISITOR GUIDELINES</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-center">
          <div className="p-4 rounded-xl bg-[#04150e] border border-emerald-900/40 space-y-1.5">
            <Trash2 className="w-6 h-6 text-emerald-400 mx-auto" />
            <h5 className="font-bold text-white text-xs">Keep it Clean</h5>
            <p className="text-[10px] text-slate-400">Please dispose of trash properly.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#04150e] border border-emerald-900/40 space-y-1.5">
            <AlertTriangle className="w-6 h-6 text-emerald-400 mx-auto" />
            <h5 className="font-bold text-white text-xs">No Littering</h5>
            <p className="text-[10px] text-slate-400">Help preserve the beauty of nature.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#04150e] border border-emerald-900/40 space-y-1.5">
            <Compass className="w-6 h-6 text-emerald-400 mx-auto" />
            <h5 className="font-bold text-white text-xs">Respect Nature</h5>
            <p className="text-[10px] text-slate-400">Do not damage plants or disturb animals.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#04150e] border border-emerald-900/40 space-y-1.5">
            <Shield className="w-6 h-6 text-emerald-400 mx-auto" />
            <h5 className="font-bold text-white text-xs">Be Responsible</h5>
            <p className="text-[10px] text-slate-400">Swim safely and watch your belongings.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#04150e] border border-emerald-900/40 space-y-1.5">
            <Check className="w-6 h-6 text-emerald-400 mx-auto" />
            <h5 className="font-bold text-white text-xs">Follow Rules</h5>
            <p className="text-[10px] text-slate-400">Obey all signage and staff instructions.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
