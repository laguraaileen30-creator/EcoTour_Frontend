import React, { useState } from 'react';
import { Activity, MapPin, Package } from 'lucide-react';
import AvailabilityOverview from '../../../components/AvailabilityOverview';
import FacilityMap from '../../../components/FacilityMap';
import PackageAvailabilityList from '../../../components/PackageAvailabilityList';

// Staff: read-only real-time availability — services, all packages, and the numbered facility map
export default function ServiceAvailabilityTab() {
  const [view, setView] = useState('services');
  return (
    <div className="space-y-5 p-2 sm:p-4 max-w-[1600px] mx-auto" style={{ color: 'var(--text)' }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-extrabold">Service Availability</h2>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Live from the database. Only Admin can change services, prices and stock.</p>
        </div>
        <div className="flex gap-1.5">
          {[['services', 'Services', Activity], ['packages', 'Packages', Package], ['map', 'Facility Map', MapPin]].map(([k, label, Icon]) => (
            <button key={k} onClick={() => setView(k)} className="px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              style={{ background: view === k ? 'var(--accent)' : 'transparent', color: view === k ? '#04170e' : 'var(--muted)', border: '1px solid var(--line)' }}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>
      {view === 'services' && <AvailabilityOverview />}
      {view === 'packages' && <PackageAvailabilityList />}
      {view === 'map' && <FacilityMap />}
    </div>
  );
}
