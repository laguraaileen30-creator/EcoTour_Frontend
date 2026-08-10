import React, { useState } from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';

export default function ClientNavbar() {
  const { currentUser } = useEcoTour() || {};
  const [searchQuery, setSearchQuery] = useState('');
  const userName = currentUser?.name || `${currentUser?.fname || ''} ${currentUser?.lname || ''}`.trim() || 'Client';

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-lg">
          E
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">EcoTourVista</h1>
          <p className="text-[10px] text-slate-500 font-semibold">Cold Spring Resort</p>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services, spots, bookings..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-slate-100 rounded-xl cursor-pointer">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
            <User className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-slate-900">{userName}</p>
            <p className="text-[10px] text-slate-500">{currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'Client'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}