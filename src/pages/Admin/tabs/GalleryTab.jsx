import React from 'react';
import GalleryTable from '../components/GalleryTable';

export default function GalleryTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-100">Resort Gallery</h2>
      <GalleryTable />
    </div>
  );
}
