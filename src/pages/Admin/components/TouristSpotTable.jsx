import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { formatCurrency } from '../utils/dashboardHelpers';
import AddTouristSpotModal from '../modals/AddTouristSpotModal';
import PriceEditModal from '../modals/PriceEditModal';

export default function TouristSpotTable() {
  const { facilities, pricingList, deletePriceItem } = useDashboard();
  const [spotOpen, setSpotOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [priceEdit, setPriceEdit] = useState(null);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Pricing Setup</h3>
          <button onClick={() => { setPriceEdit(null); setPriceOpen(true); }} className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Price</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {pricingList.map((pr) => (
            <div key={pr.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase">{pr.category}</span>
                <h4 className="font-bold text-slate-800 text-sm">{pr.name}</h4>
                <div className="text-xs font-mono font-bold">{formatCurrency(pr.price)} / {pr.unit}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setPriceEdit(pr); setPriceOpen(true); }} className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => deletePriceItem(pr.id)} className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Facilities & Inventory</h3>
          <button onClick={() => setSpotOpen(true)} className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Facility</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {facilities.map((f) => (
            <div key={f.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">{f.category}</span>
              <h4 className="font-bold text-slate-800 text-sm">{f.name}</h4>
              <div className="text-xs text-slate-600 flex justify-between pt-2 border-t border-slate-200 mt-2">
                <span>{f.totalQuantity} units</span>
                <span className="font-mono font-bold text-emerald-800">{formatCurrency(f.price)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddTouristSpotModal isOpen={spotOpen} onClose={() => setSpotOpen(false)} />
      <PriceEditModal isOpen={priceOpen} onClose={() => setPriceOpen(false)} priceItemToEdit={priceEdit} />
    </div>
  );
}