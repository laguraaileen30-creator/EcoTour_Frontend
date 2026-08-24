import React, { useState, useRef } from 'react';
import { useEcoTour } from '../../context/EcoTourContext';
import ClientSidebar from './components/ClientSidebar';
import ClientHeader from './components/ClientHeader';
import './Client.css';
import ClientServicesTab from './tabs/ClientServicesTab';
import ActivityLogsTab from './tabs/ActivityLogsTab';
import NotificationsTab from './tabs/NotificationsTab';
import ClientReceiptsTab from './tabs/ReceiptsTab';
import ClientProfileTab from './tabs/ProfileTab';
import ClientBookingsTab from './tabs/ClientBookingsTab';
import ClientHistoryTab from './tabs/ClientHistoryTab';
import ClientPaymentsTab from './tabs/ClientPaymentsTab';

import {
  Calendar, Coins, CheckCircle2, Package, Sparkles, Megaphone,
  ArrowRight, MapPin, Phone, HelpCircle, ShieldCheck,
  Facebook, Instagram, CalendarDays, Users, ChevronLeft, ChevronRight, Trees, Plus,
  CreditCard, Clock, Receipt, Compass
} from 'lucide-react';

const DESTINATIONS = [
  { name: 'Duangon Cold Spring Resort', km: 0, fee: 100, rating: 4.9, img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=60' },
  { name: 'Man-Made Forest', km: 12, fee: 30, rating: 4.7, img: 'https://images.unsplash.com/photo-1441973849788-66e93e6e1c12?w=400&q=60' },
  { name: 'Bohol Tarsier Conservation Area', km: 15, fee: 60, rating: 4.8, img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=60' },
  { name: 'Guwaon Cave', km: 18, fee: 20, rating: 4.6, img: 'https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?w=400&q=60' },
  { name: 'Butterfly Garden', km: 22, fee: 50, rating: 4.5, img: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&q=60' },
  { name: 'Pangas Falls', km: 28, fee: 20, rating: 4.6, img: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&q=60' },
];

export const ClientDashboard = () => {
  const {
    currentUser,
    reservations = [],
    announcements = [],
    galleryItems = [],
    logout,
  } = useEcoTour();

  const [activeTab, setActiveTab] = useState('overview');
  const galRef = useRef(null);

  const scroll = (ref, dir) => {
    if (ref && ref.current) {
      ref.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  const clientEmail = (currentUser?.email || '').toLowerCase().trim();
  const clientName = (
    `${currentUser?.fname || ''} ${currentUser?.lname || ''}`.trim() ||
    currentUser?.name ||
    ''
  ).toLowerCase().trim();
  const clientUserNum = String(
    currentUser?.user_number || currentUser?.userNumber || currentUser?.assignedId || ''
  ).toLowerCase().trim();
  const clientUserId = String(currentUser?.id || currentUser?.user_id || '').toLowerCase().trim();

  const clientReservations = (reservations || []).filter((r) => {
    if (!currentUser) return true;
    const rEmail = (r.email || r.clientEmail || r.touristEmail || '').toLowerCase().trim();
    const rName = (r.clientName || r.fullName || r.touristName || '').toLowerCase().trim();
    const rUserNum = (r.userNumber || r.client_id || r.client_number || '').toLowerCase().trim();
    const rUserId = String(r.userId || r.user_id || '').toLowerCase().trim();
    const matchesEmail = Boolean(clientEmail && rEmail && (rEmail === clientEmail || rEmail.includes(clientEmail) || clientEmail.includes(rEmail)));
    const matchesName = Boolean(clientName && rName && (rName.includes(clientName) || clientName.includes(rName)));
    const matchesUserNum = Boolean(clientUserNum && rUserNum && (rUserNum === clientUserNum || rUserNum.includes(clientUserNum)));
    const matchesId = Boolean(clientUserId && rUserId && clientUserId === rUserId);
    return matchesEmail || matchesName || matchesUserNum || matchesId || !clientEmail || clientEmail.includes('client');
  });

  const upcomingReservations = clientReservations.filter((r) => {
    const st = (r.status || '').toLowerCase();
    return st.includes('pending') || st.includes('paid') || st.includes('approved') || st.includes('confirmed') || st.includes('using');
  });

  const nextReservation = upcomingReservations[0];
  const totalBookingsCount = clientReservations.length;
  const totalSpent = clientReservations
    .filter((r) => {
      const st = (r.status || '').toLowerCase();
      return st.includes('paid') || st.includes('approved') || st.includes('completed');
    })
    .reduce((s, r) => s + parseFloat(r.estimatedTotal || r.grandTotal || r.totalPrice || 0), 0);
  const loyaltyPoints = Math.floor(totalSpent / 20);

  const displayGallery = galleryItems.length > 0 ? galleryItems : [
    { id: 1, title: 'Crystal Cold Spring', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
    { id: 2, title: 'Lush Forest Pool', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80' },
    { id: 3, title: 'Native Open Cottages', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80' },
    { id: 4, title: 'River Kayak Stream', image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=600&q=80' },
  ];

  return (
    <div className="client-portal">
      <ClientSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} badgeCount={announcements?.length || 0} />
      <div className="ct-main">
        <ClientHeader activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} destinations={DESTINATIONS} />
        <main className="ct-content overflow-y-auto p-4 sm:p-6 space-y-6">

          {activeTab === 'overview' && (
            <>
              {/* HERO BANNER */}
              <section className="ct-hero">
                <p className="hi">Welcome back,</p>
                <p className="name">
                  {currentUser?.name || `${currentUser?.fname || ''} ${currentUser?.lname || ''}`.trim() || 'Client Guest'} 🌿
                </p>
                <h2>DUANGON COLD SPRING<br /><span>RESORT PARADISE</span></h2>
                <p className="sub">Your next adventure is waiting in Bilar, Bohol.<br />Cash payments are accepted on-site at the resort entrance.</p>
                
                <div className="mt-4 flex flex-wrap gap-3">
                  <button 
                    onClick={() => setActiveTab('my_reservations')}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
                  >
                    <Plus size={16} /> Book New Reservation
                  </button>
                  <button 
                    onClick={() => setActiveTab('services')}
                    className="px-5 py-2.5 bg-black/40 hover:bg-black/60 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Compass size={16} /> Explore Services &amp; Cottages
                  </button>
                </div>
              </section>

              {/* TOP GRID: UPCOMING TRIP & STATS */}
              <section className="ct-top-grid">
                <div className="ct-card">
                  <div className="ct-card-head" style={{ padding: '18px 20px 0' }}>
                    <span>UPCOMING RESERVATION</span>
                    <button className="ct-link" onClick={() => setActiveTab('my_reservations')}>View All</button>
                  </div>
                  {nextReservation ? (
                    <div className="ct-res-body">
                      <img src="https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&q=60" alt="resort" />
                      <div className="ct-res-info">
                        <h4>Duangon Cold Spring Resort</h4>
                        <p><Calendar size={14} /> {nextReservation.reservationDate || nextReservation.bookingDate} &bull; {nextReservation.arrivalTime || nextReservation.timeSlot || '09:00 AM'}</p>
                        <p><Package size={14} /> {nextReservation.specificType || nextReservation.serviceName || nextReservation.packageName || 'Resort Day Pass'}{' '}<span className="ct-badge confirmed">{nextReservation.status}</span></p>
                        <p><Users size={14} /> {nextReservation.numberOfGuests || nextReservation.totalVisitors || 1} Visitors</p>
                        <small>Reservation Reference</small>
                        <strong className="ct-code">{nextReservation.bookingRef || nextReservation.bookingNumber}</strong>
                      </div>
                      <div className="ct-res-side">
                        <small>STATUS</small>
                        <span className="ok"><CheckCircle2 size={15} style={{ display: 'inline', marginRight: 5 }} />{nextReservation.status}</span>
                        <small>ESTIMATED TOTAL</small>
                        <strong className="font-mono">&#8369;{parseFloat(nextReservation.estimatedTotal || nextReservation.totalPrice || nextReservation.grandTotal || 0).toLocaleString()}.00</strong>
                        <button className="ct-btn" onClick={() => setActiveTab('my_reservations')}>View Details <ArrowRight size={14} /></button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                        <CalendarDays size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">No active upcoming reservations</h4>
                        <p className="text-xs text-slate-400 mt-1">Plan your visit to Duangon Cold Spring. Reserve cottages, tables, and life vests easily.</p>
                      </div>
                      <button 
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition-all inline-flex items-center gap-1.5"
                        onClick={() => setActiveTab('my_reservations')}
                      >
                        <Plus size={14} /> Reserve a Visit Now &rarr;
                      </button>
                    </div>
                  )}
                </div>

                <div className="ct-stats">
                  <div className="ct-card ct-stat" onClick={() => setActiveTab('my_reservations')}>
                    <div className="top"><span className="ico"><CalendarDays size={17} /></span><small>Total Bookings</small></div>
                    <strong>{totalBookingsCount}</strong>
                    <button className="ct-link">View all bookings</button>
                  </div>
                  <div className="ct-card ct-stat" onClick={() => setActiveTab('payments')}>
                    <div className="top"><span className="ico"><Coins size={17} /></span><small>Total Spent</small></div>
                    <strong className="font-mono">&#8369;{totalSpent.toLocaleString()}.00</strong>
                    <button className="ct-link">View payment history</button>
                  </div>
                  <div className="ct-card ct-stat" onClick={() => setActiveTab('services')}>
                    <div className="top"><span className="ico"><Sparkles size={17} /></span><small>Loyalty Points</small></div>
                    <strong>{loyaltyPoints} pts</strong>
                    <button className="ct-link">View reward perks</button>
                  </div>
                  <div className="ct-card ct-stat" onClick={() => setActiveTab('profile')}>
                    <div className="top"><span className="ico"><ShieldCheck size={17} /></span><small>Account Status</small></div>
                    <strong className="text-emerald-400">Verified</strong>
                    <button className="ct-link">My Profile &amp; Settings</button>
                  </div>
                </div>
              </section>

              {/* MID GRID: GALLERY & ANNOUNCEMENTS */}
              <section className="ct-mid-grid">
                <div className="ct-card ct-pad">
                  <div className="ct-card-head">
                    <span>RESORT GALLERY</span>
                    <button className="ct-link" onClick={() => setActiveTab('services')}>Explore Services</button>
                  </div>
                  <div className="ct-gal-row" ref={galRef}>
                    {displayGallery.slice(0, 8).map((g) => (
                      <div className="ct-gal-item" key={g.id}><img src={g.imageUrl || g.image} alt={g.title} /></div>
                    ))}
                  </div>
                  <div className="ct-arrows" style={{ justifyContent: 'center', marginTop: 8, display: 'flex', gap: '8px' }}>
                    <button onClick={() => scroll(galRef, -1)} aria-label="Previous"><ChevronLeft size={16} /></button>
                    <button onClick={() => scroll(galRef, 1)} aria-label="Next"><ChevronRight size={16} /></button>
                  </div>
                </div>
                <div className="ct-card ct-pad">
                  <div className="ct-card-head">
                    <span>MANAGEMENT ANNOUNCEMENTS</span>
                    <button className="ct-link" onClick={() => setActiveTab('notifications')}>View All</button>
                  </div>
                  {(announcements || []).slice(0, 3).map((a) => (
                    <div className="ct-event" key={a.id || a.announcement_id}>
                      <span className="ct-help-icon"><Megaphone size={16} /></span>
                      <div className="info"><h5>{a.title}</h5><p>{a.description || a.content || a.message}</p></div>
                      <small style={{ color: 'var(--muted)' }}>{a.date || 'Today'}</small>
                    </div>
                  ))}
                  {(!announcements || announcements.length === 0) && (
                    <p className="ct-empty-text" style={{ padding: '20px' }}>No announcements at this time.</p>
                  )}
                </div>
              </section>

              {/* HELP & CONTACT SECTION */}
              <section className="ct-card ct-help">
                <div><h4>NEED HELP?</h4><p>We are here to make your stay amazing and hassle-free.</p></div>
                <button className="ct-help-item" onClick={() => setActiveTab('support')}><span className="ct-help-icon"><Phone size={18} /></span><div><strong>Contact Staff</strong><small>Get in touch</small></div></button>
                <button className="ct-help-item" onClick={() => setActiveTab('support')}><span className="ct-help-icon"><HelpCircle size={18} /></span><div><strong>FAQs</strong><small>Find answers</small></div></button>
                <button className="ct-help-item" onClick={() => setActiveTab('support')}><span className="ct-help-icon"><MapPin size={18} /></span><div><strong>Directions</strong><small>How to get here</small></div></button>
                <button className="ct-help-item" onClick={() => setActiveTab('support')}><span className="ct-help-icon"><ShieldCheck size={18} /></span><div><strong>Emergency</strong><small>24/7 Support</small></div></button>
              </section>
            </>
          )}

          {activeTab === 'services' && (<ClientServicesTab onNavigateBook={() => setActiveTab('my_reservations')} />)}
          {(activeTab === 'my_reservations' || activeTab === 'book') && (
            <ClientBookingsTab
              onNavigateBook={() => setActiveTab('services')}
              onNavigateHistory={() => setActiveTab('history')}
            />
          )}
          {activeTab === 'history' && (
            <ClientHistoryTab
              onNavigateBook={() => setActiveTab('services')}
            />
          )}
          {(activeTab === 'payments' || activeTab.startsWith('payments_')) && (<ClientPaymentsTab />)}
          {(activeTab === 'receipts' || activeTab.startsWith('receipts')) && (<ClientReceiptsTab />)}
          {(activeTab === 'profile' || activeTab.startsWith('profile')) && (<ClientProfileTab />)}
          {(activeTab === 'notifications' || activeTab.startsWith('notifications')) && (<NotificationsTab />)}
          {(activeTab === 'activity_logs' || activeTab.startsWith('activity_logs')) && (<ActivityLogsTab />)}

          {activeTab === 'support' && (
            <div className="space-y-6">
              <div className="ct-card ct-pad">
                <div className="ct-card-head"><span>SUPPORT &amp; ASSISTANCE CENTER</span></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-center space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><Phone size={20} /></div>
                    <strong className="block text-white text-sm">Resort Front Desk</strong>
                    <p className="text-xs text-slate-400 font-mono">(038) 501-8920 / +63 917 889 1234</p>
                    <small className="text-[10px] text-emerald-300 block">Available 07:00 AM - 07:00 PM</small>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-center space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><HelpCircle size={20} /></div>
                    <strong className="block text-white text-sm">Email Support</strong>
                    <p className="text-xs text-slate-400 font-mono">support@ecotourvista.ph</p>
                    <small className="text-[10px] text-emerald-300 block">Typical response: Under 2 hours</small>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-center space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><MapPin size={20} /></div>
                    <strong className="block text-white text-sm">Resort Address</strong>
                    <p className="text-xs text-slate-400">Duangon, Zamora, Bilar, Bohol, Philippines</p>
                    <small className="text-[10px] text-emerald-300 block">Open daily including holidays</small>
                  </div>
                </div>
              </div>
              <div className="ct-card ct-pad">
                <div className="ct-card-head"><span>FREQUENTLY ASKED QUESTIONS</span></div>
                <div className="space-y-3 mt-4">
                  <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-1">
                    <strong className="text-emerald-300 font-bold block text-sm">How do I pay for my reservation?</strong>
                    <p className="text-slate-300 text-xs">All reservations are settled on-site via 100% Cash at the Entrance Cashier Counter upon arrival.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-1">
                    <strong className="text-emerald-300 font-bold block text-sm">Can I cancel or reschedule my booking?</strong>
                    <p className="text-slate-300 text-xs">Yes! Navigate to My Reservations tab and click Cancel Booking at any time prior to arrival.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-1">
                    <strong className="text-emerald-300 font-bold block text-sm">Are outside food and drinks permitted?</strong>
                    <p className="text-slate-300 text-xs">Yes, you may bring food to your open cottages and kubo rooms without corkage fees.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        <footer className="ct-footer">
          <div className="ct-footer-brand">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400"><Trees size={22} /></div>
            <div><strong>EcoTourVista</strong><span>CLIENT PORTAL</span></div>
          </div>
          <nav className="ct-footer-links">
            <button onClick={() => setActiveTab('overview')}>HOME</button>
            <button onClick={() => setActiveTab('services')}>SERVICES &amp; FACILITIES</button>
            <button onClick={() => setActiveTab('my_reservations')}>MY BOOKINGS</button>
            <button onClick={() => setActiveTab('support')}>CONTACT</button>
          </nav>
          <div className="ct-footer-social">
            <button aria-label="Facebook"><Facebook size={15} /></button>
            <button aria-label="Instagram"><Instagram size={15} /></button>
            <button aria-label="Location"><MapPin size={15} /></button>
          </div>
        </footer>
        <p className="ct-copy">&copy; 2026 EcoTourVista. All rights reserved.</p>
      </div>
    </div>
  );
};

export default ClientDashboard;