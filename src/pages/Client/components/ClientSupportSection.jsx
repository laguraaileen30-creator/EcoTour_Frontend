import React from 'react';
import { Phone, HelpCircle, MapPin, Headphones } from 'lucide-react';

const CONTACTS = [
  { icon: Phone, title: 'Resort Front Desk', value: '(038) 501-8920 / +63 917 889 1234', note: 'Available 07:00 AM - 07:00 PM', mono: true },
  { icon: HelpCircle, title: 'Email Support', value: 'support@ecotourvista.ph', note: 'Typical response: Under 2 hours', mono: true },
  { icon: MapPin, title: 'Resort Address', value: 'Duangon, Zamora, Bilar, Bohol, Philippines', note: 'Open daily including holidays' },
];

const FAQS = [
  { q: 'How do I pay for my reservation?', a: 'All reservations are settled on-site via 100% Cash at the Entrance Cashier Counter upon arrival.' },
  { q: 'Can I cancel or reschedule my booking?', a: 'Yes! Navigate to My Reservations tab and click Cancel Booking at any time prior to arrival.' },
  { q: 'Are outside food and drinks permitted?', a: 'Yes, you may bring food to your open cottages and kubo rooms without corkage fees.' },
];

// Support & Help — shown inside My Profile
export default function ClientSupportSection() {
  return (
    <div className="space-y-6">
      <div className="ct-card ct-pad">
        <div className="ct-card-head"><span className="flex items-center gap-2"><Headphones size={16} /> SUPPORT &amp; ASSISTANCE CENTER</span></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {CONTACTS.map(({ icon: Icon, title, value, note, mono }) => (
            <div key={title} className="p-4 rounded-2xl text-center space-y-2" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid var(--line)' }}>
              <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.16)', color: 'var(--accent)' }}><Icon size={20} /></div>
              <strong className="block text-sm" style={{ color: 'var(--text)' }}>{title}</strong>
              <p className={`text-xs ${mono ? 'font-mono' : ''}`} style={{ color: 'var(--muted)' }}>{value}</p>
              <small className="text-[10px] block font-semibold" style={{ color: 'var(--accent)' }}>{note}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="ct-card ct-pad">
        <div className="ct-card-head"><span>FREQUENTLY ASKED QUESTIONS</span></div>
        <div className="space-y-3 mt-4">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="p-3 rounded-xl space-y-1" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid var(--line)' }}>
              <strong className="font-bold block text-sm" style={{ color: 'var(--accent)' }}>{q}</strong>
              <p className="text-xs" style={{ color: 'var(--text)' }}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
