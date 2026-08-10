import React from 'react';
import ServicesTable from '../components/ServicesTable';

export default function ServicesTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Resort Services Catalog</h2>
      <ServicesTable />
    </div>
  );
}