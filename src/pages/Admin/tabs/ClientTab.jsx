import React from 'react';
import PendingClients from '../components/PendingClients';

export default function ClientTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Pending Client Approvals</h2>
      <PendingClients />
    </div>
  );
}