import React, { useState } from 'react';
import { Package, Wrench, ShieldCheck, AlertCircle, Plus, Search, CheckCircle, RefreshCw } from 'lucide-react';

const INITIAL_INVENTORY = [
  { id: 'INV-001', item_name: 'Adult Flotation Life Vest', category: 'Safety Gear', in_stock: 50, in_use: 31, condition: 'Good', status: 'Available' },
  { id: 'INV-002', item_name: 'Child Flotation Life Vest', category: 'Safety Gear', in_stock: 25, in_use: 12, condition: 'Good', status: 'Available' },
  { id: 'INV-003', item_name: 'Heavy Duty Videoke Speaker System', category: 'Entertainment', in_stock: 4, in_use: 3, condition: 'Fair', status: 'Available' },
  { id: 'INV-004', item_name: 'Single & Tandem Kayak Boats', category: 'Water Equipment', in_stock: 5, in_use: 3, condition: 'Good', status: 'Available' },
  { id: 'INV-005', item_name: 'Monoblock Plastic Chairs Set', category: 'Furniture', in_stock: 160, in_use: 96, condition: 'Good', status: 'Available' },
  { id: 'INV-006', item_name: 'Foldable Picnic Outdoor Tables', category: 'Furniture', in_stock: 40, in_use: 24, condition: 'Good', status: 'Available' },
  { id: 'INV-007', item_name: 'Waterproof Camping Tents (4-Pax)', category: 'Camping', in_stock: 12, in_use: 4, condition: 'Good', status: 'Available' },
  { id: 'INV-008', item_name: 'Emergency First Aid Medical Kit', category: 'Medical', in_stock: 5, in_use: 0, condition: 'Excellent', status: 'Available' },
  { id: 'INV-009', item_name: 'Heavy Duty Power Generator (10kVA)', category: 'Utilities', in_stock: 2, in_use: 1, condition: 'Good', status: 'Available' },
  { id: 'INV-010', item_name: 'Stainless Barbecue Grill Units', category: 'Cooking', in_stock: 15, in_use: 8, condition: 'Good', status: 'Available' },
];

export default function InventoryTab() {
  const [items, setItems] = useState(INITIAL_INVENTORY);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = ['All', 'Safety Gear', 'Furniture', 'Water Equipment', 'Entertainment', 'Camping', 'Utilities'];

  const filteredItems = items.filter((item) => {
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesSearch = item.item_name.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 text-white max-w-[1600px] mx-auto p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#0c1f16] p-5 rounded-2xl border border-emerald-500/20 shadow-xl gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-lg">Resort Tools & Equipment Inventory</h3>
            <p className="text-xs text-slate-400">Track equipment quantity, active rental stock, and operational condition</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[#0c1f16] p-4 rounded-2xl border border-emerald-500/20 shadow-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory items..."
            className="w-full pl-9 pr-4 py-2 bg-black/30 border border-emerald-900/60 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                filterCategory === cat ? 'bg-emerald-600 text-white shadow-md' : 'bg-black/30 text-slate-400 hover:text-white border border-emerald-900/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#0c1f16] border border-emerald-500/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 border-b border-emerald-900/60 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3.5">Item Code</th>
                <th className="p-3.5">Equipment Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Total In Stock</th>
                <th className="p-3.5">Currently In Use</th>
                <th className="p-3.5">Condition</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/40 font-medium">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-all">
                  <td className="p-3.5 font-mono text-emerald-400 font-bold">{item.id}</td>
                  <td className="p-3.5 font-bold text-white">{item.item_name}</td>
                  <td className="p-3.5 text-slate-400">{item.category}</td>
                  <td className="p-3.5 font-bold text-slate-200">{item.in_stock} Units</td>
                  <td className="p-3.5 font-bold text-emerald-300">{item.in_use} In Use</td>
                  <td className="p-3.5">
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded text-[10px] font-bold">
                      {item.condition}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
