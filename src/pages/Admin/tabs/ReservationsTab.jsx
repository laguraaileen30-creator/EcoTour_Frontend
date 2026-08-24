import React from 'react';
import ReservationsTable from '../components/ReservationsTable';
import { useDashboard } from '../hooks/useDashboard';

export default function ReservationsTab({ initialFilter }) {
  const { activeTab } = useDashboard() || {};
  
  let computedFilter = initialFilter;
  if (!computedFilter && activeTab) {
    if (activeTab === 'reservations_pending') computedFilter = 'pending';
    else if (activeTab === 'reservations_approved' || activeTab === 'reservations_paid') computedFilter = 'paid';
    else if (activeTab === 'reservations_completed') computedFilter = 'completed';
    else if (activeTab === 'reservations_using') computedFilter = 'using';
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Online Reservations & Bookings</h2>
      <ReservationsTable defaultFilter={computedFilter || 'all'} />
    </div>
  );
}