import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';

export default function AddTouristSpotModal({ isOpen, onClose }) {
  const { addFacility } = useDashboard();
  const [category, setCategory] = useState('Cottage');
  const [name, setName] = useState('');
  const [price, setPrice] = useState(600);
  const [qty, setQty] = useState(1);
  if (!isOpen) return null;

  const submit = (e) => {
    e.preventDefault();
    addFacility({ category, name, price, totalQuantity: qty, status: 'Available' });
    setName(''); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white p-6 rounded-2xl max-w-md w-full space-y-3 shadow-2xl">
        <div className="flex justify-between items-center"><h3 className="font-bold text-slate-900">Add Facility</h3><button type="button" onClick={onClose} className="text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button></div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs">
          {['Cottage', 'Parking', 'Rental', 'Entrance'].map((c) => <option key={c}>{c}</option>)}
        </select>
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Facility Name" className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs" />
        <div className="grid grid-cols-2 gap-3">
          <input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-mono" />
          <input type="number" value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 1)} className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-mono" />
        </div>
        <button type="submit" className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer">Add Facility</button>
      </form>
    </div>
  );
}