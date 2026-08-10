import React from 'react';
import { Home, Users, Tent, Droplets, Utensils } from 'lucide-react';
import ClientNavbar from './components/ClientNavbar';
import ClientSidebar from './components/ClientSidebar';

export default function Bookings() {
  const services = [
    { name: 'Cottage Rental', icon: Home, price: 600, desc: 'Native cottage for 10 pax' },
    { name: 'Table Booking', icon: Utensils, price: 200, desc: 'Dining table for 6 pax' },
    { name: 'Room Booking', icon: Users, price: 1500, desc: 'Air-conditioned room' },
    { name: 'Swimming Pool', icon: Droplets, price: 100, desc: 'Pool access per head' },
    { name: 'Tent Rental', icon: Tent, price: 400, desc: 'Camping tent for 4 pax' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <ClientNavbar />
      <div className="flex">
        <ClientSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-black text-slate-900 mb-6">Book Services</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service, idx) => {
                const Icon = service.icon;
                return (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-emerald-700" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{service.name}</h3>
                    <p className="text-xs text-slate-600 mb-4">{service.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-emerald-700">
                        PHP {service.price.toLocaleString()}
                      </span>
                      <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer">
                        Book Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}