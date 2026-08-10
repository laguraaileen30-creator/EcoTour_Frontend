import React from 'react';
import { MapPin, Star } from 'lucide-react';

export default function TouristSpots() {
  const spots = [
    { name: 'Duangon Cold Spring', rating: 4.8, image: '🏞️', desc: 'Crystal clear natural spring' },
    { name: 'Rajah Sikatuna', rating: 4.6, image: '🌳', desc: 'Protected national park' },
    { name: 'Logarita Spring', rating: 4.7, image: '💧', desc: 'Refreshing mountain water' },
    { name: 'Dagas-das Falls', rating: 4.9, image: '🌊', desc: 'Majestic waterfall' },
    { name: 'Chocolate Hills', rating: 5.0, image: '⛰️', desc: 'Iconic geological wonder' },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          Popular Tourist Spots
        </h3>
        <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer">
          View All
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {spots.map((spot, idx) => (
          <div key={idx} className="bg-slate-50 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer border border-slate-200">
            <div className="text-4xl mb-3">{spot.image}</div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">{spot.name}</h4>
            <p className="text-[10px] text-slate-500 mb-2">{spot.desc}</p>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-bold text-slate-700">{spot.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}