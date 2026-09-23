import React, { useState } from 'react';
import { Trees, Package, Tag, MapPin, Activity } from 'lucide-react';
import ServicesManager from '../catalog/ServicesManager';
import PackagesManager from '../catalog/PackagesManager';
import DealsManager from '../catalog/DealsManager';
import FacilityMap from '../../../components/FacilityMap';
import AvailabilityOverview from '../../../components/AvailabilityOverview';

const SECTIONS = [
  { key: 'services', label: 'Service Management', icon: Trees },
  { key: 'packages', label: 'Packages', icon: Package },
  { key: 'deals', label: 'Deals', icon: Tag },
  { key: 'units', label: 'Facility Units', icon: MapPin },
  { key: 'availability', label: 'Availability', icon: Activity },
];

// Admin: single place to manage everything clients, staff and the landing page see
export default function CatalogManagementTab({ initialSection = 'services' }) {
  const [section, setSection] = useState(initialSection);
  return (
    <div className="space-y-5 p-2 sm:p-4" style={{ color: 'var(--text)' }}>
      <div>
        <h2 className="text-xl font-extrabold">Services, Packages &amp; Deals</h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
          Changes here are saved to the database and appear instantly on the landing page, client portal, staff screens and reports.
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SECTIONS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setSection(key)} className="px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            style={{ background: section === key ? 'var(--accent)' : 'transparent', color: section === key ? '#04170e' : 'var(--muted)', border: '1px solid var(--line)' }}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>
      {section === 'services' && <ServicesManager />}
      {section === 'packages' && <PackagesManager />}
      {section === 'deals' && <DealsManager />}
      {section === 'units' && <FacilityMap canManage />}
      {section === 'availability' && <AvailabilityOverview />}
    </div>
  );
}
