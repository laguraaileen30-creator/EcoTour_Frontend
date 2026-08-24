import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';

export default function EditUserModal({ user, onClose }) {
  const { updateUserAccount } = useDashboard();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  useEffect(() => { if (user) { setPhone(user.phone || ''); setAddress(user.address || ''); } }, [user]);
  if (!user) return null;

  const save = () => { updateUserAccount(user.id, { phone, address }); onClose(); };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-3 shadow-2xl">
        <div className="flex justify-between items-center"><h3 className="font-bold text-slate-900">Edit: {user.name}</h3><button onClick={onClose} className="text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button></div>
        <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="Phone" className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs" />
        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs" />
        <button onClick={save} className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer">Save Changes</button>
      </div>
    </div>
  );
}