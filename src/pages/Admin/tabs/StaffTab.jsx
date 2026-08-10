import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import StaffTable from '../components/StaffTable';
import AddUserModal from '../modals/AddUserModal';

export default function StaffTab() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-900">Staff & Attendance</h2>
        <button onClick={() => setOpen(true)} className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1.5"><UserPlus className="w-4 h-4" /> Add Staff</button>
      </div>
      <StaffTable />
      <AddUserModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}