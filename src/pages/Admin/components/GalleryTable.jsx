import React from 'react';
import { Image, Upload } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';

export default function GalleryTable() {
  const { galleryItems } = useDashboard();
  return (
    <div className="space-y-4">
      <button onClick={() => alert('Upload feature (mock)')} className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer flex items-center gap-2"><Upload className="w-4 h-4" /> Upload Image</button>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {galleryItems.map((g) => (
          <div key={g.id} className="h-36 bg-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-500 border border-slate-300">
            <Image className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs font-bold">{g.title}</span>
            <span className="text-[10px]">{g.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}