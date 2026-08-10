import React from 'react';
import WalkInTable from '../components/WalkInTable';

export default function WalkInTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Walk-in Tourist Registry</h2>
      <WalkInTable />
    </div>
  );
}