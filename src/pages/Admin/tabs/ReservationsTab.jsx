import React from 'react';
import ReservationsTable from '../components/ReservationsTable';

export default function ReservationsTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Online Reservations & Bookings</h2>
      <ReservationsTable />
    </div>
  );
}