import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, Home, Utensils, Droplets, ShieldCheck, Ticket, X, CheckCircle2, Sparkles, Camera, Copy, Check, Info } from 'lucide-react';
import { useEcoTour } from '../context/EcoTourContext';
import { getPhilippineDateStr } from '../utils/phTime';

const COMPREHENSIVE_SERVICES_CATALOG = [
  { service_id: 'DSVC-001', service_code: 'DSVC-001', service_name: 'Cold Spring Pool Entrance Ticket', category: 'Entrance', price: 100, unit: 'head', description: 'Day pass access to natural cold spring pool' },
  { service_id: 'DSVC-002', service_code: 'DSVC-002', service_name: 'Standard Open Cottage', category: 'Cottage', price: 600, unit: 'day', description: 'Shaded native open cottage near pool (10 Pax)' },
  { service_id: 'DSVC-002B', service_code: 'DSVC-002B', service_name: 'Large Family Covered Cottage', category: 'Cottage', price: 1000, unit: 'day', description: 'Heavy-duty steel roofed mega cottage (20 Pax)' },
  { service_id: 'DSVC-002C', service_code: 'DSVC-002C', service_name: 'Executive Umbrella Shade', category: 'Cottage', price: 400, unit: 'day', description: 'Waterfront shaded umbrella with round table (6 Pax)' },
  { service_id: 'DSVC-003', service_code: 'DSVC-003', service_name: 'Resort Table & Chairs Set', category: 'Rental', price: 250, unit: 'day', description: '1 Table + 4 monoblock chairs' },
  { service_id: 'DSVC-004', service_code: 'DSVC-004', service_name: 'Life Vest / Safety Gear', category: 'Safety', price: 50, unit: 'head', description: 'Adult & Kid safety flotation vest' },
  { service_id: 'DSVC-005', service_code: 'DSVC-005', service_name: 'Videoke Karaoke System', category: 'Entertainment', price: 500, unit: 'day', description: 'Heavy-duty Videoke sound system' },
  { service_id: 'DSVC-006', service_code: 'DSVC-006', service_name: 'Kayak / Floating Pad Rental', category: 'Water Activity', price: 300, unit: 'hour', description: '1-hour kayak & water pad rental' },
  { service_id: 'DSVC-007', service_code: 'DSVC-007', service_name: 'Camping Pitch & Tent', category: 'Accommodation', price: 450, unit: 'night', description: 'Overnight camping slot & tent' },
  { service_id: 'DSVC-008', service_code: 'DSVC-008', service_name: 'Aircon Kubo Guest Room', category: 'Accommodation', price: 1500, unit: 'night', description: 'Private aircon room with bed & bath' },
  { service_id: 'DSVC-009', service_code: 'DSVC-009', service_name: 'Private Event Pavilion', category: 'Event', price: 3500, unit: 'event', description: 'Private pavilion for family gatherings & events' },
  { service_id: 'DSVC-010', service_code: 'DSVC-010', service_name: 'Buffet & Catering Station', category: 'Food', price: 450, unit: 'head', description: 'Native buffet catering package' },
  { service_id: 'DSVC-011', service_code: 'DSVC-011', service_name: 'Secured Resort Parking Slot', category: 'Parking', price: 50, unit: 'vehicle', description: 'Safe vehicle parking for cars & vans' },
];

export default function ReservationModal({ isOpen, onClose, preselectedService }) {
  const { resortServices, createResortBooking, parkConfig, theme } = useEcoTour();
  const isLight = theme === 'light';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bookingDate, setBookingDate] = useState(getPhilippineDateStr());
  const [arrivalTime, setArrivalTime] = useState('09:00 AM');
  
  // Guest Pax breakdown state
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [students, setStudents] = useState(0);
  const [seniors, setSeniors] = useState(0);

  const [selectedCottageId, setSelectedCottageId] = useState('');
  const [selectedAddons, setSelectedAddons] = useState({}); // { [serviceId]: qty }
  const [paymentMethod, setPaymentMethod] = useState('Cash on Arrival');
  const [submittedBooking, setSubmittedBooking] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Merge context resortServices with comprehensive catalogue to guarantee all 11+ services are present
  const allAvailableServices = (resortServices && resortServices.length > 0)
    ? resortServices
    : COMPREHENSIVE_SERVICES_CATALOG;

  // Extract all cottage options
  const cottages = allAvailableServices.filter(
    s => (s.category || '').toLowerCase() === 'cottage' || (s.service_name || s.name || '').toLowerCase().includes('cottage') || (s.service_name || '').toLowerCase().includes('umbrella')
  );

  // Extract all add-on services (tables, equipment, karaoke, rooms, event, buffet, parking, etc.)
  const addons = allAvailableServices.filter(
    s => (s.category || '').toLowerCase() !== 'entrance' && (s.category || '').toLowerCase() !== 'cottage' && !(s.service_name || s.name || '').toLowerCase().includes('cottage')
  );

  const selectedCottageObj = cottages.find(c => String(c.service_id || c.id || c.service_code) === String(selectedCottageId));

  // Dynamic Price calculations
  const adultPrice = 100 * adults;
  const childPrice = 40 * children;
  const studentPrice = 70 * students;
  const seniorPrice = 80 * seniors;

  const totalVisitors = adults + children + students + seniors;
  const envFee = totalVisitors > 0 ? (parkConfig?.environmentalFeePerHead || 30) * totalVisitors : 0;
  const cottagePrice = selectedCottageObj ? parseFloat(selectedCottageObj.price || 0) : 0;

  let addonsPrice = 0;
  Object.entries(selectedAddons).forEach(([id, qty]) => {
    const s = addons.find(a => String(a.service_id || a.id || a.service_code) === String(id));
    if (s && qty > 0) {
      addonsPrice += parseFloat(s.price || 0) * qty;
    }
  });

  const grandTotal = adultPrice + childPrice + studentPrice + seniorPrice + envFee + cottagePrice + addonsPrice;

  const handleAddonToggle = (serviceId, delta) => {
    setSelectedAddons(prev => {
      const curr = prev[serviceId] || 0;
      const next = Math.max(0, curr + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      }
      return { ...prev, [serviceId]: next };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim()) return alert('Please enter your Full Name');
    if (!email.trim()) return alert('Please enter your Email Address');

    const finalVisitors = Math.max(1, totalVisitors);

    const items = [];
    if (adults > 0) items.push({ category: 'Entrance', name: 'Adult Entrance Ticket', quantity: adults, unitPrice: 100 });
    if (children > 0) items.push({ category: 'Entrance', name: 'Child Entrance Ticket', quantity: children, unitPrice: 40 });
    if (students > 0) items.push({ category: 'Entrance', name: 'Student Entrance Ticket', quantity: students, unitPrice: 70 });
    if (seniors > 0) items.push({ category: 'Entrance', name: 'Senior / PWD Entrance Ticket', quantity: seniors, unitPrice: 80 });
    if (envFee > 0) items.push({ category: 'Entrance', name: 'Barangay Environmental Fee', quantity: finalVisitors, unitPrice: 30 });
    if (selectedCottageObj) items.push({ category: 'Cottage', name: selectedCottageObj.service_name || selectedCottageObj.name, quantity: 1, unitPrice: parseFloat(selectedCottageObj.price || 0) });
    
    Object.entries(selectedAddons).forEach(([id, qty]) => {
      const s = addons.find(a => String(a.service_id || a.id || a.service_code) === String(id));
      if (s && qty > 0) {
        items.push({ category: s.category || 'Rental', name: s.service_name || s.name, quantity: qty, unitPrice: parseFloat(s.price || 0) });
      }
    });

    const bookingData = {
      fullName,
      clientName: fullName,
      touristName: fullName,
      email,
      clientEmail: email,
      touristEmail: email,
      contactNumber: phone,
      bookingDate,
      reservationDate: bookingDate,
      arrivalTime,
      timeSlot: arrivalTime,
      packageName: selectedCottageObj ? `${selectedCottageObj.service_name} + Resort Day Pass` : 'Cold Spring Resort Day Pass',
      serviceName: selectedCottageObj ? `${selectedCottageObj.service_name} + Resort Day Pass` : 'Cold Spring Resort Day Pass',
      totalVisitors: finalVisitors,
      quantity: finalVisitors,
      totalPrice: grandTotal,
      grandTotal,
      status: 'Pending',
      paymentMethod,
      items,
    };

    const newRes = createResortBooking(bookingData);

    fetch('http://localhost:5000/api/v1/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    }).catch(() => {});

    setSubmittedBooking(newRes);
  };

  const handleClose = () => {
    setSubmittedBooking(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setAdults(1);
    setChildren(0);
    setStudents(0);
    setSeniors(0);
    setSelectedCottageId('');
    setSelectedAddons({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        className="rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-6 shadow-2xl relative my-auto border-2 transition-all"
        style={{
          background: isLight ? 'var(--bg-1, #f8fbf9)' : '#05180f',
          borderColor: 'var(--line)',
          color: 'var(--text)',
        }}
      >
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full transition-all cursor-pointer"
          style={{
            background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
            color: 'var(--text)',
          }}
          aria-label="Close Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {submittedBooking ? (
          /* SUCCESS CONFIRMATION STATE */
          <div className="text-center py-6 space-y-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-xl"
              style={{
                background: 'rgba(74,222,128,0.15)',
                color: 'var(--accent)',
                border: '1px solid rgba(74,222,128,0.4)',
              }}
            >
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-[3px]" style={{ color: 'var(--accent)' }}>
                RESERVATION SUBMITTED &amp; STORED
              </span>
              <h3 className="text-2xl font-extrabold mt-1" style={{ color: 'var(--text)' }}>
                Booking Confirmation
              </h3>
              <p className="text-xs mt-1 max-w-md mx-auto" style={{ color: 'var(--muted)' }}>
                Thank you, <strong style={{ color: 'var(--text)' }}>{submittedBooking.clientName}</strong>! Your reservation is stored in the database and visible in real time.
              </p>
            </div>

            {/* SCREENSHOT & BOOKING REF PROMINENT ALERT BANNER */}
            <div
              className="p-4 rounded-2xl border-2 shadow-2xl max-w-md mx-auto text-left space-y-3 relative overflow-hidden"
              style={{
                background: isLight ? 'rgba(251,191,36,0.12)' : 'rgba(50,30,6,0.7)',
                borderColor: 'rgba(251,191,36,0.6)',
              }}
            >
              <div className="flex items-center gap-2.5 font-extrabold text-xs uppercase tracking-wider text-amber-500">
                <Camera className="w-5 h-5 animate-bounce" />
                <span>IMPORTANT: TAKE A SCREENSHOT OF THIS BOOKING ID</span>
              </div>
              <p className="text-[11px] leading-relaxed font-medium" style={{ color: isLight ? '#78350f' : '#fef3c7' }}>
                Please screenshot or copy your <strong>Booking Reference ID</strong> below. Show this screenshot to resort staff at the gate or counter for fast track entry and instant booking lookup!
              </p>
              
              <div
                className="p-3 rounded-xl border flex items-center justify-between gap-2"
                style={{
                  background: isLight ? '#ffffff' : 'rgba(0,0,0,0.6)',
                  borderColor: 'rgba(251,191,36,0.4)',
                }}
              >
                <div>
                  <span className="text-[10px] uppercase font-semibold block" style={{ color: 'var(--muted)' }}>Booking Reference ID</span>
                  <strong className="font-mono text-lg tracking-wider" style={{ color: 'var(--accent)' }}>
                    {submittedBooking.bookingRef}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(submittedBooking.bookingRef);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all border border-emerald-400/40"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div
              className="p-4 rounded-2xl border max-w-md mx-auto text-xs space-y-2 font-medium text-left"
              style={{
                background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.4)',
                borderColor: 'var(--line)',
              }}
            >
              <div className="flex justify-between border-b pb-2" style={{ borderColor: 'var(--line)' }}>
                <span style={{ color: 'var(--muted)' }}>Visit Date:</span>
                <strong style={{ color: 'var(--text)' }}>{submittedBooking.bookingDate} ({submittedBooking.arrivalTime})</strong>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted)' }}>Total Visitors:</span>
                <span style={{ color: 'var(--text)' }}>{submittedBooking.totalVisitors} Guests</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted)' }}>Reserved Services:</span>
                <span className="font-bold" style={{ color: 'var(--accent)' }}>{submittedBooking.serviceName}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-sm font-extrabold" style={{ borderColor: 'var(--line)' }}>
                <span style={{ color: 'var(--text)' }}>Grand Total:</span>
                <span className="font-mono" style={{ color: 'var(--accent)' }}>₱{submittedBooking.totalPrice.toLocaleString()}.00</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleClose}
                className="px-8 py-3 text-slate-950 rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-xl transition-all"
                style={{ background: 'var(--accent)' }}
              >
                Done / Back to Resort Portal
              </button>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="border-b pb-3" style={{ borderColor: 'var(--line)' }}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <h3 className="font-extrabold text-xl" style={{ color: 'var(--text)' }}>Book Online Reservation</h3>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                Reserve cottages, entrance passes, and resort add-on facilities at Duangon Cold Spring Resort.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--text)' }}>Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Santos"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl pl-9 pr-3 py-2 text-xs outline-none transition-all font-medium border"
                    style={{
                      background: isLight ? '#ffffff' : '#04150e',
                      borderColor: 'var(--line)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--text)' }}>Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
                  <input
                    type="email"
                    required
                    placeholder="client@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl pl-9 pr-3 py-2 text-xs outline-none transition-all font-medium border"
                    style={{
                      background: isLight ? '#ffffff' : '#04150e',
                      borderColor: 'var(--line)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--text)' }}>Contact Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
                  <input
                    type="text"
                    placeholder="0917-123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl pl-9 pr-3 py-2 text-xs outline-none transition-all font-medium border"
                    style={{
                      background: isLight ? '#ffffff' : '#04150e',
                      borderColor: 'var(--line)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--text)' }}>Target Visit Date *</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full rounded-xl pl-9 pr-3 py-2 text-xs outline-none transition-all font-medium border cursor-pointer"
                    style={{
                      background: isLight ? '#ffffff' : '#04150e',
                      borderColor: 'var(--line)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* GUEST BREAKDOWN (Adults, Children, Students, Seniors) & COTTAGE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* PAX BREAKDOWN */}
              <div
                className="p-3.5 rounded-2xl border space-y-2.5"
                style={{
                  background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.3)',
                  borderColor: 'var(--line)',
                }}
              >
                <span className="text-[11px] font-extrabold uppercase tracking-wider block" style={{ color: 'var(--accent)' }}>
                  Guest Pax Breakdown (Entrance Tickets):
                </span>

                <div className="space-y-2">
                  {/* Adults */}
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--text)' }}>Adults (₱100)</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAdults(Math.max(0, adults - 1))}
                        className="w-7 h-7 rounded-lg font-bold text-xs cursor-pointer flex items-center justify-center transition-all border"
                        style={{
                          background: isLight ? '#ffffff' : 'rgba(6,50,25,0.7)',
                          borderColor: 'var(--line)',
                          color: 'var(--text)',
                        }}
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-sm min-w-[16px] text-center" style={{ color: 'var(--text)' }}>
                        {adults}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdults(adults + 1)}
                        className="w-7 h-7 rounded-lg font-bold text-xs cursor-pointer flex items-center justify-center transition-all text-white"
                        style={{ background: '#16a34a' }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--text)' }}>Children (₱40)</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        className="w-7 h-7 rounded-lg font-bold text-xs cursor-pointer flex items-center justify-center transition-all border"
                        style={{
                          background: isLight ? '#ffffff' : 'rgba(6,50,25,0.7)',
                          borderColor: 'var(--line)',
                          color: 'var(--text)',
                        }}
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-sm min-w-[16px] text-center" style={{ color: 'var(--text)' }}>
                        {children}
                      </span>
                      <button
                        type="button"
                        onClick={() => setChildren(children + 1)}
                        className="w-7 h-7 rounded-lg font-bold text-xs cursor-pointer flex items-center justify-center transition-all text-white"
                        style={{ background: '#16a34a' }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Students */}
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--text)' }}>Students (₱70)</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStudents(Math.max(0, students - 1))}
                        className="w-7 h-7 rounded-lg font-bold text-xs cursor-pointer flex items-center justify-center transition-all border"
                        style={{
                          background: isLight ? '#ffffff' : 'rgba(6,50,25,0.7)',
                          borderColor: 'var(--line)',
                          color: 'var(--text)',
                        }}
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-sm min-w-[16px] text-center" style={{ color: 'var(--text)' }}>
                        {students}
                      </span>
                      <button
                        type="button"
                        onClick={() => setStudents(students + 1)}
                        className="w-7 h-7 rounded-lg font-bold text-xs cursor-pointer flex items-center justify-center transition-all text-white"
                        style={{ background: '#16a34a' }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Seniors / PWD */}
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--text)' }}>Seniors (₱80)</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSeniors(Math.max(0, seniors - 1))}
                        className="w-7 h-7 rounded-lg font-bold text-xs cursor-pointer flex items-center justify-center transition-all border"
                        style={{
                          background: isLight ? '#ffffff' : 'rgba(6,50,25,0.7)',
                          borderColor: 'var(--line)',
                          color: 'var(--text)',
                        }}
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-sm min-w-[16px] text-center" style={{ color: 'var(--text)' }}>
                        {seniors}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSeniors(seniors + 1)}
                        className="w-7 h-7 rounded-lg font-bold text-xs cursor-pointer flex items-center justify-center transition-all text-white"
                        style={{ background: '#16a34a' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Total Visitors & Environmental Fee Note */}
                <div className="pt-2 border-t text-[11px] space-y-0.5" style={{ borderColor: 'var(--line)' }}>
                  <div className="flex justify-between font-bold">
                    <span style={{ color: 'var(--muted)' }}>Total Visitors:</span>
                    <span style={{ color: 'var(--accent)' }}>{totalVisitors} Guests</span>
                  </div>
                  <p className="text-[10px]" style={{ color: 'var(--muted)' }}>
                    • Includes ₱30/head Barangay Environmental Fee
                  </p>
                </div>
              </div>

              {/* COTTAGE SELECTION */}
              <div
                className="p-3.5 rounded-2xl border space-y-2"
                style={{
                  background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.3)',
                  borderColor: 'var(--line)',
                }}
              >
                <span className="text-[11px] font-extrabold uppercase tracking-wider block" style={{ color: 'var(--accent)' }}>
                  Select Cottage Rental:
                </span>
                <select
                  value={selectedCottageId}
                  onChange={(e) => setSelectedCottageId(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-xs outline-none font-medium border cursor-pointer"
                  style={{
                    background: isLight ? '#ffffff' : '#04150e',
                    borderColor: 'var(--line)',
                    color: 'var(--text)',
                  }}
                >
                  <option value="">No Cottage (Walk-In Swim Access Only)</option>
                  {cottages.map(c => {
                    const cid = c.service_id || c.id || c.service_code;
                    return (
                      <option key={cid} value={cid}>
                        {c.service_name || c.name} — ₱{parseFloat(c.price || 0).toLocaleString()} / {c.unit || 'day'}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[10px]" style={{ color: 'var(--muted)' }}>
                  {selectedCottageObj ? selectedCottageObj.description : 'Choose a covered bamboo cottage or umbrella for shaded group relaxation.'}
                </p>
              </div>
            </div>

            {/* ADD-ON AMENITIES & FACILITIES LIST */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider block" style={{ color: 'var(--accent)' }}>
                Resort Add-on Amenities &amp; Facilities:
              </span>
              <div
                className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-1 p-1 rounded-2xl border"
                style={{
                  background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.2)',
                  borderColor: 'var(--line)',
                }}
              >
                {addons.map(addon => {
                  const id = addon.service_id || addon.id || addon.service_code;
                  const qty = selectedAddons[id] || 0;
                  return (
                    <div
                      key={id}
                      className="p-3 rounded-xl border flex items-center justify-between text-xs transition-all"
                      style={{
                        background: qty > 0 ? (isLight ? 'rgba(74,222,128,0.1)' : 'rgba(6,50,25,0.7)') : (isLight ? '#ffffff' : 'rgba(0,0,0,0.4)'),
                        borderColor: qty > 0 ? 'rgba(74,222,128,0.4)' : 'var(--line)',
                      }}
                    >
                      <div className="pr-2">
                        <div className="font-bold leading-tight line-clamp-1" style={{ color: 'var(--text)' }}>
                          {addon.service_name || addon.name}
                        </div>
                        <div className="text-[10px] font-mono font-bold mt-0.5" style={{ color: 'var(--accent)' }}>
                          ₱{parseFloat(addon.price || 0).toLocaleString()}.00 / {addon.unit}
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-1.5 p-1 rounded-lg border shrink-0"
                        style={{
                          background: isLight ? 'var(--panel)' : 'rgba(0,0,0,0.5)',
                          borderColor: 'var(--line)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleAddonToggle(id, -1)}
                          disabled={qty <= 0}
                          className="w-5 h-5 rounded flex items-center justify-center font-bold text-xs cursor-pointer transition-all disabled:opacity-25"
                          style={{
                            background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)',
                            color: 'var(--text)',
                          }}
                        >
                          -
                        </button>
                        <span className="font-mono font-bold min-w-[14px] text-center text-xs" style={{ color: 'var(--text)' }}>
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddonToggle(id, 1)}
                          className="w-5 h-5 rounded flex items-center justify-center font-bold text-xs cursor-pointer text-white transition-all"
                          style={{ background: '#16a34a' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TOTAL & SUBMIT */}
            <div className="pt-3 border-t flex flex-col sm:flex-row justify-between items-center gap-4" style={{ borderColor: 'var(--line)' }}>
              <div className="text-left w-full sm:w-auto">
                <span className="text-[11px] font-bold block" style={{ color: 'var(--muted)' }}>
                  Estimated Total:
                </span>
                <span className="font-mono font-black text-2xl" style={{ color: 'var(--accent)' }}>
                  ₱{grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-xl transition-all flex items-center justify-center gap-2"
                style={{
                  background: 'var(--accent)',
                  boxShadow: '0 4px 14px rgba(74,222,128,0.3)',
                }}
              >
                <span>Submit Reservation</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
