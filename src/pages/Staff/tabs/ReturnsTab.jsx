import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useStaff } from '../hooks/useStaff';

export default function ReturnsTab() {
  const { facilities, returnFacilityItem } = useStaff();
  const rentedItems = facilities.filter((f) => f.rentedQuantity > 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <h3 className="font-bold text-lg text-slate-800">Rental Equipment Return Desk</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rentedItems.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed">All rental items are currently in inventory.</div>
        ) : rentedItems.map((item) => (
          <div key={item.id} className="p-4 bg-slate-50 rounded-xl border flex justify-between items-center">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
              <p className="text-xs text-slate-600">Currently Rented: <span className="font-bold text-rose-600">{item.rentedQuantity}</span></p>
            </div>
            <button onClick={() => returnFacilityItem(item.id, 1)} className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" /> Return 1
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}