import React from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit2 } from 'lucide-react';
import ClientNavbar from './components/ClientNavbar';
import ClientSidebar from './components/ClientSidebar';

export default function Profile() {
  const user = {
    firstName: 'Juan',
    middleName: 'Santos',
    lastName: 'Dela Cruz',
    email: 'juan.delacruz@email.com',
    phone: '0917-123-4567',
    address: '123 Main Street, Cebu City',
    gender: 'Male',
    birthday: '1990-05-15',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ClientNavbar />
      <div className="flex">
        <ClientSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-xs rounded-full flex items-center justify-center">
                    <User className="w-10 h-10" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black">{user.firstName} {user.lastName}</h1>
                    <p className="text-emerald-100 text-sm mt-1">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{user.firstName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Middle Name</label>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{user.middleName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{user.lastName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Gender</label>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{user.gender}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </label>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Phone
                    </label>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{user.phone}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Birthday
                    </label>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{user.birthday}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Address
                    </label>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{user.address}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2">
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}