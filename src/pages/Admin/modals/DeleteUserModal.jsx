import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';

export default function DeleteUserModal({ user, onClose }) {
  const { rejectUserAccount } = useDashboard();
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl text-center">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="font-bold text-slate-900">Remove {user.name}?</h3>
        <p className="text-xs text-slate-500">This will revoke their client access permanently.</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
          <button onClick={() => { rejectUserAccount(user.id); onClose(); }} className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl cursor-pointer">Delete</button>
        </div>
      </div>
    </div>
  );
}