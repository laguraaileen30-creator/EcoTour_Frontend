import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, Home, Utensils, Droplets, ShieldCheck, Ticket, X, CheckCircle2, Sparkles, Camera, Copy, Check } from 'lucide-react';
import { useEcoTour } from '../context/EcoTourContext';

export default function ReservationModal({ isOpen, onClose }) {
  const { resortServices, createResortBooking, parkConfig } = useEcoTour();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [arrivalTime, setArrivalTime] = useState('09:00 AM');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedCottageId, setSelectedCottageId] = useState('');
  const [selectedAddons, setSelectedAddons] = useState({}); // { [serviceId]: qty }
  const [paymentMethod, setPaymentMethod] = useState('Cash on Arrival');
  const [submittedBooking, setSubmittedBooking] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Filter cottage options from resortServices
  const cottages = (resortServices || []).filter(
    s => (s.category || '').toLowerCase() === 'cottage' || (s.service_name || s.name || '').toLowerCase().includes('cottage')
  );

  // Filter add-on services
  const addons = (resortServices || []).filter(
    s => (s.category || '').toLowerCase() !== 'entrance' && (s.category || '').toLowerCase() !== 'cottage'
  );

  const selectedCottageObj = cottages.find(c => String(c.service_id || c.id) === String(selectedCottageId));

  // Price calculations
  const adultPrice = 100 * adults;
  const childPrice = 40 * children;
  const envFee = (parkConfig?.environmentalFeePerHead || 30) * (adults + children);
  const cottagePrice = selectedCottageObj ? parseFloat(selectedCottageObj.price || 0) : 0;

  let addonsPrice = 0;
  Object.entries(selectedAddons).forEach(([id, qty]) => {
    const s = addons.find(a => String(a.service_id || a.id) === String(id));
    if (s && qty > 0) {
      addonsPrice += parseFloat(s.price || 0) * qty;
    }
  });

  const grandTotal = adultPrice + childPrice + envFee + cottagePrice + addonsPrice;

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

    const items = [];
    if (adults > 0) items.push({ category: 'Entrance', name: 'Adult Entrance Ticket', quantity: adults, unitPrice: 100 });
    if (children > 0) items.push({ category: 'Entrance', name: 'Child Entrance Ticket', quantity: children, unitPrice: 40 });
    if (envFee > 0) items.push({ category: 'Entrance', name: 'Barangay Environmental Fee', quantity: adults + children, unitPrice: 30 });
    if (selectedCottageObj) items.push({ category: 'Cottage', name: selectedCottageObj.service_name || selectedCottageObj.name, quantity: 1, unitPrice: parseFloat(selectedCottageObj.price || 0) });
    
    Object.entries(selectedAddons).forEach(([id, qty]) => {
      const s = addons.find(a => String(a.service_id || a.id) === String(id));
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
      totalVisitors: adults + children,
      quantity: adults + children,
      totalPrice: grandTotal,
      grandTotal,
      status: 'Pending',
      paymentMethod,
      items,
    };

    const newRes = createResortBooking(bookingData);

    // Try posting to backend server API if online
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
    setSelectedCottageId('');
    setSelectedAddons({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#05180f] border border-emerald-500/40 rounded-3xl max-w-2xl w-full p-5 sm:p-7 text-white space-y-6 shadow-2xl relative my-auto">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 bg-black/40 hover:bg-black/60 rounded-full text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {submittedBooking ? (
          /* SUCCESS CONFIRMATION STATE */
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[3px] text-emerald-400">RESERVATION SUBMITTED & STORED</span>
              <h3 className="text-2xl font-extrabold text-white mt-1">Booking Confirmation</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                Thank you, <strong className="text-white">{submittedBooking.clientName}</strong>! Your reservation is stored in the database and visible to our Staff & Admin team.
              </p>
            </div>

            {/* SCREENSHOT & BOOKING REF PROMINENT ALERT BANNER */}
            <div className="bg-gradient-to-r from-amber-500/20 via-emerald-950 to-amber-500/20 p-4 rounded-2xl border-2 border-amber-400/60 shadow-2xl max-w-md mx-auto text-left space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-2.5 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
                <Camera className="w-5 h-5 text-amber-400 animate-bounce" />
                <span>IMPORTANT: TAKE A SCREENSHOT OF THIS BOOKING ID</span>
              </div>
              <p className="text-[11px] text-amber-100/90 leading-relaxed font-medium">
                Please screenshot or copy your <strong>Booking Reference ID</strong> below. Show this screenshot to resort staff at the gate or counter for fast track entry and instant booking lookup!
              </p>
              
              <div className="bg-black/60 p-3 rounded-xl border border-amber-400/40 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Booking Reference ID</span>
                  <strong className="font-mono text-emerald-300 text-lg tracking-wider">{submittedBooking.bookingRef}</strong>
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

            <div className="bg-black/40 p-4 rounded-2xl border border-emerald-900/60 max-w-md mx-auto text-xs space-y-2 font-medium text-left">
              <div className="flex justify-between border-b border-emerald-900/40 pb-2">
                <span className="text-slate-400">Visit Date:</span>
                <strong className="text-white">{submittedBooking.bookingDate} ({submittedBooking.arrivalTime})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Visitors:</span>
                <span>{submittedBooking.totalVisitors} Guests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reserved Services:</span>
                <span className="text-emerald-300 font-bold">{submittedBooking.serviceName}</span>
              </div>
              <div className="flex justify-between border-t border-emerald-900/40 pt-2 text-sm font-extrabold">
                <span className="text-slate-300">Grand Total:</span>
                <span className="font-mono text-emerald-400">₱{submittedBooking.totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleClose}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-xl transition-all"
              >
                Done / Back to Resort Portal
              </button>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="border-b border-emerald-900/60 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-xl text-white">Book Online Reservation</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Reserve cottages, entrance passes, and resort add-on facilities at Duangon Cold Spring Resort.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Santos"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-black/40 border border-emerald-900/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-emerald-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="client@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-emerald-900/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-emerald-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Contact Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="0917-123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black/40 border border-emerald-900/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-emerald-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Target Visit Date *</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-black/40 border border-emerald-900/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-emerald-400 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* PAX BREAKDOWN & COTTAGE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-black/30 p-3 rounded-xl border border-emerald-900/40 space-y-2">
                <span className="text-[11px] font-bold text-emerald-400 block">Guest Pax Breakdown:</span>
                <div className="flex items-center justify-between text-xs">
                  <span>Adults (₱100)</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="w-6 h-6 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-xs cursor-pointer">-</button>
                    <span className="font-mono font-bold">{adults}</span>
                    <button type="button" onClick={() => setAdults(adults + 1)} className="w-6 h-6 rounded bg-emerald-600 text-white font-bold text-xs cursor-pointer">+</button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Children (₱40)</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="w-6 h-6 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-xs cursor-pointer">-</button>
                    <span className="font-mono font-bold">{children}</span>
                    <button type="button" onClick={() => setChildren(children + 1)} className="w-6 h-6 rounded bg-emerald-600 text-white font-bold text-xs cursor-pointer">+</button>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 p-3 rounded-xl border border-emerald-900/40 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-400 block">Select Cottage Rental:</span>
                <select
                  value={selectedCottageId}
                  onChange={(e) => setSelectedCottageId(e.target.value)}
                  className="w-full bg-black/60 border border-emerald-900/60 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-400 font-medium"
                >
                  <option value="">No Cottage (Walk-In Swim Access Only)</option>
                  {cottages.map(c => (
                    <option key={c.service_id || c.id} value={c.service_id || c.id}>
                      {c.service_name || c.name} — ₱{c.price?.toLocaleString()} / {c.unit || 'day'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ADD-ON SERVICES LIST */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-emerald-400 block">Resort Add-on Amenities & Facilities:</span>
              <div className="max-h-36 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pr-1">
                {addons.map(addon => {
                  const id = addon.service_id || addon.id;
                  const qty = selectedAddons[id] || 0;
                  return (
                    <div key={id} className="p-2.5 rounded-xl border border-emerald-900/40 bg-black/30 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white leading-tight">{addon.service_name || addon.name}</div>
                        <div className="text-[10px] font-mono text-emerald-400 font-bold">₱{addon.price?.toLocaleString()} / {addon.unit}</div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-lg border border-emerald-900/60">
                        <button type="button" onClick={() => handleAddonToggle(id, -1)} disabled={qty <= 0} className="w-5 h-5 rounded bg-emerald-950 text-emerald-300 disabled:opacity-30 text-xs font-bold cursor-pointer">-</button>
                        <span className="font-mono font-bold text-white min-w-[14px] text-center">{qty}</span>
                        <button type="button" onClick={() => handleAddonToggle(id, 1)} className="w-5 h-5 rounded bg-emerald-600 text-white text-xs font-bold cursor-pointer">+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TOTAL & SUBMIT */}
            <div className="pt-3 border-t border-emerald-900/60 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-left">
                <span className="text-[11px] font-bold text-slate-400 block">Estimated Total:</span>
                <span className="font-mono font-black text-2xl text-emerald-400">₱{grandTotal.toLocaleString()}</span>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-xl transition-all border border-emerald-400"
              >
                Submit Reservation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
