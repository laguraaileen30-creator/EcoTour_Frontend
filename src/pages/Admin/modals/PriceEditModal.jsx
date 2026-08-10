import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';

export default function PriceEditModal({ isOpen, onClose, priceItemToEdit }) {
  const { addPriceItem, updatePriceItem } = useDashboard();
  const [category, setCategory] = useState('Entrance');
  const [name, setName] = useState('');
  const [price, setPrice] = useState(100);
  const [unit, setUnit] = useState('per head');
  useEffect(() => {
    if (isOpen) {
      setCategory(priceItemToEdit?.category || 'Entrance');
      setName(priceItemToEdit?.name || '');
      setPrice(priceItemToEdit?.price || 100);
      setUnit(priceItemToEdit?.unit || 'per head');
    }
  }, [isOpen, priceItemToEdit]);
  if (!isOpen) return null;

  const submit = (e) => {
    e.preventDefault();
    const data = { category, name, price, unit };
    priceItemToEdit ? updatePriceItem(priceItemToEdit.id, data) : addPriceItem(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white p-6 rounded-2xl max-w-md w-full space-y-3 shadow-2xl">
        <div className="flex justify-between items-center"><h3 className="font-bold text-slate-900">{priceItemToEdit ? 'Edit Price' : 'Add Price Item'}</h3><button type="button" onClick={onClose} className="text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button></div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs">
          {['Entrance', 'Cottage', 'Rental', 'Parking', 'Service'].map((c) => <option key={c}>{c}</option>)}
        </select>
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Item Name" className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs" />
        <div className="grid grid-cols-2 gap-3">
          <input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-mono" />
          <input value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs" />
        </div>
        <button type="submit" className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer">Save Price</button>
      </form>
    </div>
  );
}