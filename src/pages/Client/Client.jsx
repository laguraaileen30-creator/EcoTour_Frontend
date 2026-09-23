import React, { useState, useRef } from 'react';
import EcoTourLogo from '../../components/EcoTourLogo';
import { useEcoTour } from '../../context/EcoTourContext';
import ClientSidebar from './components/ClientSidebar';
import ClientHeader from './components/ClientHeader';
import './Client.css';
import ClientServicesTab from './tabs/ClientServicesTab';
import ClientProfileTab from './tabs/ProfileTab';
import ClientBookingsTab from './tabs/ClientBookingsTab';
import ClientHistoryTab from './tabs/ClientHistoryTab';
import {
  DashboardShell, GlassHero, Glance, KpiCard, Panel, Row, statusPill, QuickActions, EmptyState, useNow, phDate, greeting, peso,
} from '../../components/dashboard/Glass';
import { resolveImage } from '../../utils/catalog';
import { Camera } from 'lucide-react';
import heroDark from '../../assets/home2.png';
import heroLight from '../../assets/home1.png';
import resortPhoto from '../../assets/spring.png';

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
    catalogPackages = [],
    theme,
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
    return matchesEmail || matchesName || matchesUserNum || matchesId;
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

  const nowTick = useNow(60000);
  const firstName = currentUser?.fname || (currentUser?.name || '').split(' ')[0] || 'Guest';
  const featuredPackages = [...(catalogPackages || [])]
    .filter((pk) => pk.status !== 'Inactive')
    .sort((a, b) => (b.is_featured - a.is_featured) || (b.package_type === 'UNLIMITED') - (a.package_type === 'UNLIMITED'))
    .slice(0, 3);

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
            <DashboardShell>
              <GlassHero
                image={theme === 'light' ? heroLight : heroDark}
                eyebrow={`${phDate(nowTick)} • Duangon Cold Spring, Bilar, Bohol`}
                title={`${greeting(nowTick)},`}
                highlight={`${firstName}! 🌿`}
                subtitle={nextReservation
                  ? `Your next visit is on ${nextReservation.reservationDate || nextReservation.bookingDate}. Show your booking reference at the entrance — payment is in cash on arrival.`
                  : 'Plan your next cold-spring escape. Pick a package, add extras if you like, and pay in cash when you arrive.'}
                actions={(
                  <>
                    <button type="button" className="gd-btn gd-btn-primary" onClick={() => setActiveTab('my_reservations')}><Plus size={15} /> Book a package</button>
                    <button type="button" className="gd-btn gd-btn-ghost" onClick={() => setActiveTab('services')}><Compass size={15} /> Explore services</button>
                  </>
                )}
                aside={(
                  <>
                    <Glance icon={CalendarDays} label="Next visit" value={nextReservation ? (nextReservation.reservationDate || nextReservation.bookingDate) : 'Not booked'} tone="emerald" />
                    <Glance icon={Sparkles} label="Loyalty points" value={`${loyaltyPoints} pts`} tone="amber" />
                    <Glance icon={ShieldCheck} label="Account" value="Verified" tone="sky" />
                  </>
                )}
              />

              <div className="gd-kpis gd-anim">
                <KpiCard icon={CalendarDays} tone="emerald" label="Total bookings" value={totalBookingsCount} sub="All reservations" onClick={() => setActiveTab('my_reservations')} />
                <KpiCard icon={Clock} tone="sky" label="Upcoming visits" value={upcomingReservations.length} sub={upcomingReservations.length ? 'Ready for your trip' : 'Nothing scheduled yet'} onClick={() => setActiveTab('my_reservations')} />
                <KpiCard icon={Coins} tone="teal" label="Total spent" value={peso(totalSpent)} sub="Paid & completed stays" onClick={() => setActiveTab('history')} />
                <KpiCard icon={Sparkles} tone="amber" label="Loyalty points" value={loyaltyPoints} progress={(loyaltyPoints % 500) / 5} sub={`${500 - (loyaltyPoints % 500)} pts to next reward`} />
              </div>

              <div className="gd-grid">
                <div className="gd-col">
                  <Panel icon={CalendarDays} title="Your upcoming visit" action={{ label: 'My reservations', onClick: () => setActiveTab('my_reservations') }}>
                    {nextReservation ? (
                      <div className="gd-trip">
                        <img src={resortPhoto} alt="Duangon Cold Spring" />
                        <div>
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <strong style={{ fontSize: 16, fontWeight: 900 }}>{nextReservation.packageName || nextReservation.serviceName || 'Resort Day Pass'}</strong>
                              <div className="gd-muted" style={{ fontSize: 12, marginTop: 2 }}>Reference <b className="font-mono">{nextReservation.bookingRef || nextReservation.bookingNumber}</b></div>
                            </div>
                            {statusPill(nextReservation.status)}
                          </div>
                          <div className="gd-trip-meta">
                            <div><small>Visit date</small><strong>{nextReservation.reservationDate || nextReservation.bookingDate}</strong></div>
                            <div><small>Arrival</small><strong>{nextReservation.arrivalTime || nextReservation.timeSlot || '09:00 AM'}</strong></div>
                            <div><small>Guests</small><strong>{nextReservation.numberOfGuests || nextReservation.totalVisitors || 1} pax</strong></div>
                            <div><small>Total (cash)</small><strong>{peso(nextReservation.estimatedTotal || nextReservation.grandTotal || nextReservation.totalPrice || 0)}</strong></div>
                          </div>
                          <div className="gd-muted" style={{ fontSize: 12, marginTop: 10 }}>
                            {Array.isArray(nextReservation.assignedFacilities) && nextReservation.assignedFacilities.length
                              ? <>📍 Assigned: <b>{nextReservation.assignedFacilities.map((f) => f.facilityName).join(', ')}</b></>
                              : 'Your cottage number will be assigned by the resort staff.'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <EmptyState icon={CalendarDays} title="No upcoming visit yet" text="Choose a package — tickets and add-ons are optional — and reserve your date in a few steps."
                        action={<button type="button" className="gd-btn gd-btn-primary" onClick={() => setActiveTab('my_reservations')}><Plus size={14} /> Book a package</button>} />
                    )}
                  </Panel>

                  <Panel icon={Package} title="Recommended packages" action={{ label: 'All services', onClick: () => setActiveTab('services') }}>
                    {featuredPackages.length === 0 ? (
                      <EmptyState icon={Package} title="Packages are loading" />
                    ) : (
                      <div className="gd-cards">
                        {featuredPackages.map((pk) => (
                          <div key={pk.id} className="gd-glass gd-pcard" onClick={() => setActiveTab('my_reservations')} role="button" tabIndex={0}>
                            <img src={resolveImage(pk.image_url, 'family gateway deal.png')} alt={pk.package_name} />
                            <div className="body">
                              <div className="flex items-center justify-between gap-2">
                                <strong>{pk.package_type === 'UNLIMITED' ? '♾️ ' : ''}{pk.package_name}</strong>
                                {pk.badge && <span className="gd-pill warn">{pk.badge}</span>}
                              </div>
                              <span className="price">{peso(pk.final_price)}{pk.discount_amount > 0 && <s>{peso(pk.regular_value)}</s>}</span>
                              <span className="gd-muted" style={{ fontSize: 11 }}>{pk.items?.length || 0} services • up to {pk.included_guests} guests</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Panel>
                </div>

                <div className="gd-col">
                  <Panel icon={Megaphone} title="Resort announcements" action={{ label: 'All notifications', onClick: () => setActiveTab('notifications') }}>
                    {(announcements || []).length === 0 ? (
                      <EmptyState icon={Megaphone} title="No announcements right now" />
                    ) : (
                      <div className="gd-list">
                        {(announcements || []).slice(0, 4).map((a) => (
                          <Row key={a.id || a.announcement_id} title={a.title} sub={a.description || a.content || a.message} tone="sky" />
                        ))}
                      </div>
                    )}
                  </Panel>

                  <Panel icon={HelpCircle} title="Need help?">
                    <QuickActions items={[
                      { icon: Phone, label: 'Contact staff', sub: 'Front desk & email', onClick: () => setActiveTab('support'), tone: 'emerald' },
                      { icon: HelpCircle, label: 'FAQs', sub: 'Payments, cancellations', onClick: () => setActiveTab('support'), tone: 'sky' },
                      { icon: MapPin, label: 'Directions', sub: 'Duangon, Bilar, Bohol', onClick: () => setActiveTab('support'), tone: 'amber' },
                      { icon: Receipt, label: 'Booking history', sub: 'Receipts & past stays', onClick: () => setActiveTab('history'), tone: 'violet' },
                    ]} />
                  </Panel>
                </div>
              </div>

              <Panel icon={Camera} title="Resort gallery" action={{ label: 'Explore services', onClick: () => setActiveTab('services') }}>
                <div className="gd-gallery">
                  {displayGallery.slice(0, 8).map((g) => (
                    <figure key={g.id}>
                      <img src={g.imageUrl || g.image} alt={g.title} loading="lazy" />
                      <figcaption>{g.title}</figcaption>
                    </figure>
                  ))}
                </div>
              </Panel>
            </DashboardShell>
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
          {(activeTab === 'profile' || activeTab.startsWith('profile')) && (<ClientProfileTab />)}
          {(activeTab === 'notifications' || activeTab.startsWith('notifications')) && (<ClientProfileTab focusSection="notifications" />)}

          {activeTab === 'support' && (<ClientProfileTab focusSection="support" />)}

        </main>

        <footer className="ct-footer">
          <div className="ct-footer-brand">
            <EcoTourLogo size={36} />
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