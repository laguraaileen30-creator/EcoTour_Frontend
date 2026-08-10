import React, { useState, useRef } from 'react';
import { useEcoTour } from '../../context/EcoTourContext';
import ClientSidebar from './components/ClientSidebar';
import ThemeToggle from '../../components/ThemeToggle';
import './Client.css';
import ClientServicesTab from './tabs/ClientServicesTab';
import ActivityLogsTab from './tabs/ActivityLogsTab';
import NotificationsTab from './tabs/NotificationsTab';
import ClientReceiptsTab from './tabs/ReceiptsTab';
import ClientProfileTab from './tabs/ProfileTab';
import ClientBookingsTab from './tabs/ClientBookingsTab';
import ClientPaymentsTab from './tabs/ClientPaymentsTab';

import {
  Calendar, Coins, CheckCircle2, BookmarkPlus, Package, Search, X,
  ShoppingBag, QrCode, Lock, User, Menu, Bell, ChevronDown, ChevronRight,
  Heart, Star, ArrowRight, MapPin, Phone, HelpCircle, ShieldCheck,
  Facebook, Instagram, CalendarDays, Users, Sparkles, Megaphone
} from 'lucide-react';

const DESTINATIONS = [
  { name: 'Man-Made Forest', km: 12, fee: 30, rating: 4.7, img: 'https://images.unsplash.com/photo-1441973849788-66e93e6e1c12?w=400&q=60' },
  { name: 'Bohol Tarsier Conservation Area', km: 15, fee: 60, rating: 4.8, img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=60' },
  { name: 'Guwaon Cave', km: 18, fee: 20, rating: 4.6, img: 'https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?w=400&q=60' },
  { name: 'Butterfly Garden', km: 22, fee: 50, rating: 4.5, img: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&q=60' },
  { name: 'Pangas Falls', km: 28, fee: 20, rating: 4.6, img: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&q=60' },
];

const EVENTS = [
  { m: 'MAY', d: 30, title: 'Summer Festival 2024', place: 'Duangon, Zamora, Bohol', desc: 'Join us for exciting activities and cultural celebration!', img: DESTINATIONS[0].img },
  { m: 'JUN', d: 15, title: 'Eco Adventure Camp', place: 'Bilar, Bohol', desc: 'A fun outdoor activity for the whole family and nature lovers.', img: DESTINATIONS[4].img },
];

export const ClientDashboard = () => {
  const {
    currentUser, reservations, addReservation, cancelReservationBooking, receipts,
    announcements, galleryItems, logout, parkConfig, resortServices, resortBookings,
    createResortBooking, updateResortBookingStatus, getServiceAvailabilityForDate,
  } = useEcoTour();

  const [activeTab, setActiveTab] = useState('overview');
  const destRef = useRef(null);
  const galRef = useRef(null);
  const scroll = (ref, dir) => ref.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });

  /* ==== keep ALL your existing state / handlers here (service booking state,
     booking form state, profile form state, handleBookingSubmit,
     handleProfileSubmit, loyalty calculations, completenessChecks, etc.) ==== */

  const clientEmail = currentUser?.email?.toLowerCase();
  const clientReservations = reservations.filter(
    (r) => (r.email && r.email.toLowerCase() === clientEmail) || clientEmail === 'client@gmail.com'
  );
  const upcomingReservations = clientReservations.filter((r) => r.status === 'Approved' || r.status === 'Pending');
  const nextReservation = upcomingReservations[0];
  const totalBookingsCount = clientReservations.length;
  const totalSpent = clientReservations
    .filter((r) => r.status === 'Approved' || r.status === 'Completed')
    .reduce((s, r) => s + r.estimatedTotal, 0);
  const loyaltyPoints = Math.floor(totalSpent / 20);

  return (
    <div className="client-portal">
      <ClientSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} badgeCount={announcements.length} />

      <div className="ct-main">
        <header className="ct-header border-b border-emerald-900/40 bg-[#051810]/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button className="ct-icon-btn shrink-0"><Menu size={18} /></button>
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/60" />
              <input
                type="text"
                placeholder="Search destinations, reservations, receipts..."
                className="w-full bg-[#04150e]/90 border border-emerald-800/60 rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-slate-400 outline-none focus:border-emerald-400 transition-all"
              />
            </div>
          </div>

          <div className="ct-header-right flex items-center gap-4">
            <ThemeToggle size="sm" />
            <button className="ct-icon-btn relative" onClick={() => setActiveTab('notifications')}>
              <Bell size={18} />
              <em className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center not-italic">3</em>
            </button>
            <div className="ct-user flex items-center gap-2.5">
              <img src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'} alt="avatar" className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500/40" />
              <div>
                <strong className="text-xs text-white block font-bold">{currentUser?.name || `${currentUser?.fname || ''} ${currentUser?.lname || ''}`.trim() || 'Client User'}</strong>
                <small className="text-[10px] text-slate-400 flex items-center gap-1">Explorer <ChevronDown size={12} /></small>
              </div>
            </div>
          </div>
        </header>

        <main className="ct-content bg-[#05130c] text-white overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ============ OVERVIEW (matches mockup) ============ */}
          {activeTab === 'overview' && (
            <>
              <section className="ct-hero">
                <p className="hi">Welcome back,</p>
                <p className="name">{currentUser?.name || `${currentUser?.fname || ''} ${currentUser?.lname || ''}`.trim() || 'Client Guest'} 🌿</p>
                <h2>DISCOVER BILAR'S<br /><span>HIDDEN PARADISE</span></h2>
                <p className="sub">Your next adventure is waiting.<br />Escape. Relax. Refresh.</p>
              </section>

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
                        <h4>Duangon Cold Spring</h4>
                        <p><Calendar size={14} /> {nextReservation.reservationDate || nextReservation.bookingDate} • {nextReservation.arrivalTime || nextReservation.timeSlot || '09:00 AM'}</p>
                        <p><Package size={14} /> {nextReservation.specificType || nextReservation.serviceName || nextReservation.packageName || 'Resort Day Pass'} <span className="ct-badge confirmed">{nextReservation.status}</span></p>
                        <p><Users size={14} /> {nextReservation.numberOfGuests || nextReservation.totalVisitors || 1} Visitors</p>
                        <small>Reservation Code</small>
                        <strong className="ct-code">{nextReservation.bookingRef}</strong>
                      </div>
                      <div className="ct-res-side">
                        <small>STATUS</small>
                        <span className="ok"><CheckCircle2 size={15} style={{ display: 'inline', marginRight: 5 }} />{nextReservation.status}</span>
                        <small>TOTAL AMOUNT</small>
                        <strong>₱{parseFloat(nextReservation.estimatedTotal || nextReservation.totalPrice || nextReservation.grandTotal || 0).toLocaleString()}.00</strong>
                        <button className="ct-btn" onClick={() => setActiveTab('my_reservations')}>View Details <ArrowRight size={14} /></button>
                      </div>
                    </div>
                  ) : (
                    <p className="ct-empty-text" style={{ padding: '30px' }}>
                      No upcoming trips. <button className="ct-link" onClick={() => setActiveTab('my_reservations')}>Book your first visit →</button>
                    </p>
                  )}
                </div>

                <div className="ct-stats">
                  <div className="ct-card ct-stat"><div className="top"><span className="ico"><CalendarDays size={17} /></span><small>Total Bookings</small></div><strong>{totalBookingsCount}</strong><button className="ct-link" onClick={() => setActiveTab('my_reservations')}>View all bookings</button></div>
                  <div className="ct-card ct-stat"><div className="top"><span className="ico"><Coins size={17} /></span><small>Total Spent</small></div><strong>₱{totalSpent.toLocaleString()}.00</strong><button className="ct-link" onClick={() => setActiveTab('payments')}>View payment history</button></div>
                  <div className="ct-card ct-stat"><div className="top"><span className="ico"><Heart size={17} /></span><small>Favorite Places</small></div><strong>{DESTINATIONS.length}</strong><button className="ct-link" onClick={() => setActiveTab('favorites')}>View your favorites</button></div>
                  <div className="ct-card ct-stat"><div className="top"><span className="ico"><Sparkles size={17} /></span><small>Loyalty Points</small></div><strong>{loyaltyPoints} pts</strong><button className="ct-link">View rewards</button></div>
                </div>
              </section>

              <section className="ct-card ct-pad">
                <div className="ct-card-head">
                  <span>NEARBY DESTINATIONS</span>
                  <div className="ct-arrows">
                    <button onClick={() => scroll(destRef, -1)}>←</button>
                    <button onClick={() => scroll(destRef, 1)}>→</button>
                  </div>
                </div>
                <div className="ct-dest-row" ref={destRef}>
                  {DESTINATIONS.map((d) => (
                    <div className="ct-dest-card" key={d.name}>
                      <div className="ct-dest-img"><span className="ct-km">{d.km} km</span><img src={d.img} alt={d.name} /></div>
                      <h4>{d.name}</h4>
                      <small>Entrance: ₱{d.fee}.00</small>
                      <div className="ct-stars">
                        {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={12} fill={i <= Math.round(d.rating) ? '#fbbf24' : 'none'} />)}
                        <span>{d.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="ct-mid-grid">
                <div className="ct-card ct-pad">
                  <div className="ct-card-head"><span>GALLERY</span><button className="ct-link">View All</button></div>
                  <div className="ct-gal-row" ref={galRef}>
                    {galleryItems.slice(0, 8).map((g) => (
                      <div className="ct-gal-item" key={g.id}><img src={g.imageUrl} alt={g.title} /></div>
                    ))}
                  </div>
                  <div className="ct-arrows" style={{ justifyContent: 'center', marginTop: 8 }}>
                    <button onClick={() => scroll(galRef, -1)}>←</button>
                    <button onClick={() => scroll(galRef, 1)}>→</button>
                  </div>
                </div>

                <div className="ct-card ct-pad">
                  <div className="ct-card-head"><span>UPCOMING EVENTS</span><button className="ct-link">View All</button></div>
                  {EVENTS.map((e) => (
                    <div className="ct-event" key={e.title}>
                      <div className="ct-date"><small>{e.m}</small><strong>{e.d}</strong></div>
                      <div className="info"><h5>{e.title}</h5><p className="place">{e.place}</p><p>{e.desc}</p></div>
                      <img src={e.img} alt={e.title} />
                    </div>
                  ))}
                </div>
              </section>

              <section className="ct-card ct-help">
                <div><h4>NEED HELP?</h4><p>We're here to make your stay amazing and hassle-free.</p></div>
                <button className="ct-help-item"><span className="ct-help-icon"><Phone size={18} /></span><div><strong>Contact Staff</strong><small>Get in touch</small></div></button>
                <button className="ct-help-item"><span className="ct-help-icon"><HelpCircle size={18} /></span><div><strong>FAQs</strong><small>Find answers</small></div></button>
                <button className="ct-help-item"><span className="ct-help-icon"><MapPin size={18} /></span><div><strong>Directions</strong><small>How to get here</small></div></button>
                <button className="ct-help-item"><span className="ct-help-icon"><ShieldCheck size={18} /></span><div><strong>Emergency</strong><small>24/7 Support</small></div></button>
              </section>
            </>
          )}

          {/* ============ SMALL NEW TABS ============ */}
          {activeTab === 'notifications' && (
            <div className="ct-card ct-pad">
              <div className="ct-card-head"><span>NOTIFICATIONS</span></div>
              {announcements.map((a) => (
                <div className="ct-event" key={a.id}>
                  <span className="ct-help-icon"><Bell size={16} /></span>
                  <div className="info"><h5>{a.title}</h5><p>{a.content}</p></div>
                  <small style={{ color: 'var(--muted)' }}>{a.date}</small>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="ct-card ct-pad">
              <div className="ct-card-head"><span>FAVORITE PLACES</span></div>
              <div className="ct-fav-grid">
                {DESTINATIONS.map((d) => (
                  <div className="ct-dest-card" key={d.name}>
                    <div className="ct-dest-img"><span className="ct-km">❤</span><img src={d.img} alt={d.name} /></div>
                    <h4>{d.name}</h4><small>Entrance: ₱{d.fee}.00</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="ct-card ct-pad">
              <div className="ct-card-head"><span>TRAVEL GUIDE — BILAR, BOHOL</span></div>
              <div className="ct-fav-grid">
                {DESTINATIONS.map((d) => (
                  <div className="ct-dest-card" key={d.name}>
                    <div className="ct-dest-img"><span className="ct-km">{d.km} km</span><img src={d.img} alt={d.name} /></div>
                    <h4>{d.name}</h4><small>Entrance: ₱{d.fee}.00 • ★ {d.rating}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="ct-card ct-help">
              <div><h4>SUPPORT CENTER</h4><p>Contact the resort team anytime.</p></div>
              <button className="ct-help-item"><span className="ct-help-icon"><Phone size={18} /></span><div><strong>(038) 123-4567</strong><small>Call front desk</small></div></button>
              <button className="ct-help-item"><span className="ct-help-icon"><HelpCircle size={18} /></span><div><strong>help@ecotourvista.ph</strong><small>Email us</small></div></button>
              <button className="ct-help-item"><span className="ct-help-icon"><ShieldCheck size={18} /></span><div><strong>Emergency</strong><small>24/7 Support</small></div></button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="ct-card ct-pad">
              <div className="ct-card-head"><span>BOOKINGS HISTORY</span></div>
              {clientReservations.filter((r) => r.status === 'Completed' || r.status === 'Cancelled').length === 0 ? (
                <p className="ct-empty-text">No past bookings yet.</p>
              ) : (
                clientReservations.filter((r) => r.status === 'Completed' || r.status === 'Cancelled').map((r) => (
                  <div className="ct-hist-row" key={r.id}>
                    <div><strong>{r.specificType}</strong><small>{r.reservationDate} • {r.arrivalTime} • {r.numberOfGuests} pax</small></div>
                    <span className={`ct-badge ${r.status.toLowerCase()}`}>{r.status}</span>
                    <strong>₱{r.estimatedTotal.toLocaleString()}</strong>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Client Portal Tab Views */}
          {activeTab === 'services' && <ClientServicesTab onNavigateBook={(srv) => setActiveTab('my_reservations')} />}
          {(activeTab === 'my_reservations' || activeTab === 'book') && <ClientBookingsTab onNavigateBook={() => setActiveTab('services')} />}
          {(activeTab === 'payments' || activeTab.startsWith('payments_')) && <ClientPaymentsTab />}
          {(activeTab === 'activity_logs' || activeTab.startsWith('activity_logs')) && <ActivityLogsTab />}
          {(activeTab === 'notifications' || activeTab.startsWith('notifications')) && <NotificationsTab />}
          {(activeTab === 'receipts' || activeTab.startsWith('receipts')) && <ClientReceiptsTab />}
          {(activeTab === 'profile' || activeTab.startsWith('profile')) && <ClientProfileTab />}
          {activeTab === 'settings' && (
            <div className="ct-card ct-pad">
              <div className="ct-card-head"><span>ACCOUNT SETTINGS</span></div>
              <p className="ct-empty-text">Manage security preferences, notifications, and profile privacy options.</p>
            </div>
          )}

        </main>

        {/* FOOTER */}
        <footer className="ct-footer">
          <div className="ct-footer-brand">
            <svg viewBox="0 0 64 40" width="38">
              <path d="M8 26 L22 8 L32 20 L40 10 L56 26" stroke="#eafff2" strokeWidth="3" fill="none" strokeLinejoin="round" />
              <path d="M6 31 q6 -4 12 0 t12 0 t12 0 t12 0" stroke="#4ade80" strokeWidth="2.5" fill="none" />
              <path d="M10 36 q6 -4 12 0 t12 0 t12 0" stroke="#2dd4bf" strokeWidth="2.5" fill="none" />
            </svg>
            <div><strong>EcoTourVista</strong><span>CLIENT PORTAL</span></div>
          </div>
          <nav className="ct-footer-links">
            <button onClick={() => setActiveTab('overview')}>HOME</button>
            <button onClick={() => setActiveTab('services')}>SERVICES & FACILITIES</button>
            <button onClick={() => setActiveTab('my_reservations')}>MY BOOKINGS</button>
            <button onClick={() => setActiveTab('support')}>CONTACT</button>
          </nav>
          <div className="ct-footer-social">
            <button><Facebook size={15} /></button>
            <button><Instagram size={15} /></button>
            <button><MapPin size={15} /></button>
          </div>
        </footer>
        <p className="ct-copy">© 2024 EcoTourVista. All rights reserved.</p>
      </div>
    </div>
  );
};

export default ClientDashboard;