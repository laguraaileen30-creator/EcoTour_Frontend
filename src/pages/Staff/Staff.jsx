import React from 'react';
import EcoTourLogo from '../../components/EcoTourLogo';
import {
  ShoppingCart, Home, RotateCcw, Coins, FileText, Search, User, Users, UserPlus,
  Printer, CalendarCheck, CreditCard, ClipboardList, Menu, Bell, ChevronDown,
  Wrench, Leaf, Phone, HelpCircle, BookOpen, Facebook, Instagram, MapPin, Mail
} from 'lucide-react';
import { useStaff } from './hooks/useStaff';
import StaffSidebar from './components/StaffSidebar';
import StaffHeader from './components/StaffHeader';
import ThemeToggle from '../../components/ThemeToggle';
import '../Client/Client.css';
import './Staff.css';

import POSTab from './tabs/POSTab';
import FacilitiesTab from './tabs/FacilitiesTab';
import ReturnsTab from './tabs/ReturnsTab';
import ServiceOrdersTab from './tabs/ServiceOrdersTab';
import ReceiptsTab from './tabs/ReceiptsTab';
import ProfileTab from './tabs/ProfileTab';
import DailySalesTab from './tabs/DailySalesTab';
import ServiceAvailabilityTab from './tabs/ServiceAvailabilityTab';
import InventoryTab from './tabs/InventoryTab';
import PendingBookingsTab from './tabs/PendingBookingsTab';
import { MailOutboxModal } from '../MailBox';
import { useState, useEffect } from 'react';
import { useEcoTour } from '../../context/EcoTourContext';
import { getPhilippineDateStr, getPhilippineFormattedDate } from '../../utils/phTime';
import {
  DashboardShell, GlassHero, Glance, KpiCard, Panel, Row, statusPill, QuickActions, EmptyState, useNow, phTime, greeting, peso,
} from '../../components/dashboard/Glass';
import { lastDays, bookingState, phDayKey } from '../../components/dashboard/metrics';
import { Hourglass, BedDouble, Wallet, Activity, Gauge, Zap } from 'lucide-react';
import heroDark from '../../assets/home2.png';
import heroLight from '../../assets/home1.png';

export const StaffDashboard = () => {
  const [showMailOutbox, setShowMailOutbox] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { activeStaff } = useStaff();
  const {
    resortBookings = [],
    receipts = [],
    walkIns = [],
    facilities = [],
    resortServices = [],
    refreshAllLiveData,
    getDailyTallySummary,
    theme
  } = useEcoTour();

  // Philippine Time standardized operating date (August 24, 2026 / 2026-08-24)
  const todayStr = getPhilippineDateStr();
  const todayFormatted = getPhilippineFormattedDate();

  // Real-time synchronization listener & auto-poll
  useEffect(() => {
    if (refreshAllLiveData) refreshAllLiveData();

    const interval = setInterval(() => {
      if (refreshAllLiveData) refreshAllLiveData();
    }, 3000);

    const handleSync = () => {
      if (refreshAllLiveData) refreshAllLiveData();
    };

    window.addEventListener('ecotour:sync', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener('ecotour:sync', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [refreshAllLiveData]);

  const isMatchingToday = (dateVal) => {
    if (!dateVal) return false;
    const s = String(dateVal).split('T')[0].trim();
    return s === todayStr;
  };

  // 1. Walk-Ins for Today
  const todayWalkIns = (walkIns || []).filter(w => isMatchingToday(w.transaction_date || w.operating_date || w.created_at || w.date));
  const todayPaidWalkIns = todayWalkIns.filter(w => w.payment_status === 'PAID' || w.status === 'Paid');

  // 2. Reservation Receipts for Today
  const todayReservationReceipts = (receipts || []).filter(r => {
    const isPaid = r.status === 'Paid' || (r.status || '').toLowerCase().includes('paid');
    const matchDate = isMatchingToday(r.date || r.created_at);
    const isRes = Boolean(r.bookingRef || r.booking_id || !r.walk_in_id);
    return matchDate && isPaid && isRes;
  });

  // 3. Cash Drawer Breakdowns
  const walkInCashToday = todayPaidWalkIns.reduce((s, w) => s + (parseFloat(w.total_amount || w.grandTotal || w.amount || 0)), 0);
  const reservationCashToday = todayReservationReceipts.reduce((s, r) => s + (parseFloat(r.grandTotal || r.amount || 0)), 0);
  const todayRevenue = walkInCashToday + reservationCashToday;

  // 4. Visitors count
  const walkInVisitors = todayPaidWalkIns.reduce((s, w) => s + (parseInt(w.guest_count || w.totalVisitors || 1, 10)), 0);
  const reservationVisitors = todayReservationReceipts.reduce((s, r) => s + (parseInt(r.totalVisitors || 1, 10)), 0);
  const todayVisitors = walkInVisitors + reservationVisitors;

  // 5. Pending Reservations
  const todayPendingBookings = (resortBookings || []).filter(b => {
    const s = (b.status || '').toLowerCase();
    const isPending = (s.includes('pending') || s.includes('waiting') || s.includes('counter')) && !s.includes('cancel') && !s.includes('void');
    return isPending;
  });

  // 6. Receipts Printed
  const todayReceiptsCount = todayPaidWalkIns.length + todayReservationReceipts.length;

  // Real-time facility occupancy computed from active bookings & walk-ins
  const allTodayActivities = [
    ...todayWalkIns.map(w => ({
      id: w.walk_in_id || `WI-${w.id}`,
      name: w.customer_name || w.touristName || w.lead_guest_name || 'Walk-In Guest',
      sub: `${w.time || 'Today'} • ${w.items?.map(i => i.name).join(', ') || 'Day Pass & Entrance'} (${w.guest_count || w.totalVisitors || 1} Pax)`,
      amt: parseFloat(w.total_amount || w.grandTotal || 0),
      status: w.walk_in_status === 'ACTIVE' ? 'In Resort' : 'Paid',
      badgeClass: w.walk_in_status === 'ACTIVE' ? 'confirmed' : 'confirmed',
      rawTime: new Date(w.created_at || w.paid_at || Date.now()).getTime(),
      isWalkIn: true
    })),
    ...(resortBookings || []).map(b => {
      const s = (b.status || '').toLowerCase();
      const isVoid = s.includes('cancel') || s.includes('void');
      const isPaid = s.includes('paid') || s.includes('using') || s.includes('complete');
      const isToday = isMatchingToday(b.reservationDate || b.bookingDate || b.created_at);
      return {
        id: b.bookingRef || b.bookingNumber || `BK-${b.id}`,
        name: b.clientName || b.fullName || b.touristName || 'Online Client',
        sub: `${b.reservationDate || b.bookingDate || todayStr} • ${b.specificType || b.serviceName || 'Day Pass'} (${b.numberOfGuests || b.totalVisitors || 1} Pax)`,
        amt: parseFloat(b.estimatedTotal || b.grandTotal || b.totalPrice || 0),
        status: isVoid ? 'Voided' : (isPaid ? 'Paid' : 'Pending'),
        badgeClass: isVoid ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40' : (isPaid ? 'confirmed' : 'pending'),
        rawTime: new Date(b.created_at || Date.now()).getTime(),
        isWalkIn: false,
        isToday
      };
    })
  ]
    // Only walk-ins and reservations for today's operating day
    .filter((x) => x.isWalkIn || x.isToday)
    .sort((a, b) => b.rawTime - a.rawTime).slice(0, 6);

  // ── Glass dashboard data ──
  const nowTick = useNow(30000);
  const weekDays = lastDays(7);
  const visitorWeek = weekDays.map((d) => (getDailyTallySummary ? getDailyTallySummary(d.key).totalVisitors : 0));
  const revenueWeek = weekDays.map((d) => (getDailyTallySummary ? getDailyTallySummary(d.key).totalCashRevenue : 0));
  const inResortNow = (resortBookings || []).filter((b) => bookingState(b.status) === 'in_resort').length
    + (walkIns || []).filter((w) => w.walk_in_status === 'ACTIVE').length;
  const visitsToday = (resortBookings || []).filter((b) => phDayKey(b.reservationDate || b.bookingDate) === todayStr && bookingState(b.status) !== 'cancelled').length;
  const OCC_EMOJI = { cottage: '🛖', rental: '🪑', safety: '🦺', entertainment: '🎤', 'water activity': '🛶', accommodation: '🛌', event: '🎉', food: '🍽️', parking: '🚗' };
  const liveOccupancy = (resortServices || [])
    .filter((sv) => sv.capacity_for_date !== undefined && !['entrance', 'package', 'promotion'].includes(String(sv.category).toLowerCase()) && sv.capacity_for_date > 0)
    .map((sv) => ({
      name: sv.service_name,
      emoji: OCC_EMOJI[String(sv.category).toLowerCase()] || '🌿',
      used: sv.booked_for_date || 0,
      total: sv.capacity_for_date,
      pct: Math.min(100, Math.round(((sv.booked_for_date || 0) / Math.max(1, sv.capacity_for_date)) * 100)),
    }))
    .sort((a, b) => b.pct - a.pct || b.used - a.used)
    .slice(0, 7);


  return (
    <div className="client-portal">
      <StaffSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="ct-main">
        <StaffHeader activeTab={activeTab} setActiveTab={setActiveTab} activeStaff={activeStaff} />

        <main className="ct-content">
          {activeTab === 'overview' && (
            <DashboardShell>
              <GlassHero
                image={theme === 'light' ? heroLight : heroDark}
                eyebrow={`Operating day ${todayFormatted} • ${phTime(nowTick)} PHT`}
                title={`${greeting(nowTick)},`}
                highlight={`${(activeStaff?.name || 'Staff').split(' ')[0]}!`}
                subtitle="Front gate & reservation desk — register walk-ins, accept payments and keep facilities moving."
                actions={(
                  <>
                    <button type="button" className="gd-btn gd-btn-primary" onClick={() => setActiveTab('pos')}><UserPlus size={15} /> New walk-in</button>
                    <button type="button" className="gd-btn gd-btn-ghost" onClick={() => setActiveTab('pending_bookings')}><CreditCard size={15} /> Accept payment</button>
                  </>
                )}
                aside={(
                  <>
                    <Glance icon={Hourglass} label="Awaiting payment" value={todayPendingBookings.length} tone="amber" />
                    <Glance icon={BedDouble} label="Guests in resort now" value={inResortNow} tone="sky" />
                    <Glance icon={CalendarCheck} label="Visits scheduled today" value={visitsToday} tone="emerald" />
                  </>
                )}
              />

              <div className="gd-kpis gd-anim">
                <KpiCard icon={Users} tone="emerald" label="Visitors today" value={`${todayVisitors} pax`} spark={visitorWeek} sub="Last 7 days" onClick={() => setActiveTab('pos')} />
                <KpiCard icon={Wallet} tone="teal" label="Cash collected today" value={peso(todayRevenue)} spark={revenueWeek} sub={`Gate ${peso(walkInCashToday)} • Counter ${peso(reservationCashToday)}`} onClick={() => setActiveTab('daily_reports')} />
                <KpiCard icon={Hourglass} tone="amber" label="Pending payments" value={todayPendingBookings.length} sub="Reservations to collect" onClick={() => setActiveTab('pending_bookings')} />
                <KpiCard icon={Printer} tone="sky" label="Receipts issued today" value={todayReceiptsCount} sub="Walk-ins + reservations" onClick={() => setActiveTab('receipts')} />
              </div>

              <div className="gd-grid">
                <div className="gd-col">
                  <Panel icon={Activity} title="Today's bookings & walk-ins" action={{ label: 'Service orders', onClick: () => setActiveTab('service_orders') }}>
                    {allTodayActivities.length === 0 ? (
                      <EmptyState icon={CalendarCheck} title="Nothing recorded yet today" text="Walk-ins from the POS and today's reservations appear here." action={<button type="button" className="gd-btn gd-btn-primary" onClick={() => setActiveTab('pos')}><UserPlus size={14} /> Register a walk-in</button>} />
                    ) : (
                      <div className="gd-list">
                        {allTodayActivities.map((b) => (
                          <Row key={b.id} title={b.name} sub={`${b.id} • ${b.sub}`} amount={peso(b.amt)} pill={statusPill(b.status === 'In Resort' ? 'Using Services' : b.status)} tone={b.isWalkIn ? 'teal' : 'emerald'} />
                        ))}
                      </div>
                    )}
                  </Panel>

                  <Panel icon={Gauge} title="Live facility occupancy (today)" action={{ label: 'Facility map', onClick: () => setActiveTab('availability') }}>
                    {liveOccupancy.length === 0 ? (
                      <EmptyState icon={Gauge} title="Availability loading" text="Live stock appears once the server responds." />
                    ) : liveOccupancy.map((o) => (
                      <div className="gd-meter" key={o.name}>
                        <span className="em">{o.emoji}</span>
                        <div>
                          <strong>{o.name}</strong>
                          <div className={`gd-progress ${o.pct >= 90 ? 'tone-rose' : o.pct >= 70 ? 'tone-amber' : 'tone-emerald'}`} style={{ marginTop: 6 }}><i style={{ width: `${o.pct}%` }} /></div>
                        </div>
                        <span className="num">{o.used}<small> / {o.total}</small></span>
                      </div>
                    ))}
                  </Panel>
                </div>

                <div className="gd-col">
                  <Panel icon={Zap} title="Quick actions">
                    <QuickActions items={[
                      { icon: UserPlus, label: 'New walk-in', sub: 'Register & charge at the gate', onClick: () => setActiveTab('pos'), tone: 'emerald' },
                      { icon: CreditCard, label: 'Accept payment', sub: 'Pending reservations', onClick: () => setActiveTab('pending_bookings'), tone: 'amber' },
                      { icon: CalendarCheck, label: 'Service orders', sub: 'Check-in, add services', onClick: () => setActiveTab('service_orders'), tone: 'sky' },
                      { icon: ClipboardList, label: 'Daily sales', sub: 'My cash tally', onClick: () => setActiveTab('daily_sales'), tone: 'violet' },
                    ]} />
                  </Panel>

                  <Panel icon={Wallet} title="Cash drawer (today)" action={{ label: 'Daily tally', onClick: () => setActiveTab('daily_sales') }}>
                    <div className="gd-stat-row"><span>Walk-in gate (POS)</span><strong>{peso(walkInCashToday, 2)}</strong></div>
                    <div className="gd-stat-row"><span>Reservation counter</span><strong>{peso(reservationCashToday, 2)}</strong></div>
                    <div className="gd-stat-row total"><span>Total cash</span><strong>{peso(todayRevenue, 2)}</strong></div>
                  </Panel>

                  <Panel icon={Leaf} title="Shift reminders">
                    <div className="gd-list">
                      <Row title="Review your daily sales tally" sub="Before handing over the drawer at the end of duty" tone="teal" />
                      <Row title="Assign cottages to paid bookings" sub="Service Orders → Assign facilities" tone="sky" />
                      <Row title="Clean as you go" sub="Inspect cottages after each checkout" tone="emerald" />
                    </div>
                  </Panel>
                </div>
              </div>
            </DashboardShell>
          )}

          {activeTab === 'inventory' && <InventoryTab />}
          {activeTab === 'pending_bookings' && <PendingBookingsTab setActiveTab={setActiveTab} />}

          {/* Existing functional tabs & sub-keys */}
          {(activeTab === 'pos' || activeTab === 'walkin_pos' || activeTab === 'pos_today' || activeTab === 'pos_history') && <POSTab />}
          {(activeTab === 'facilities' || activeTab.startsWith('facilities_')) && <FacilitiesTab />}
          {(activeTab === 'availability' || activeTab === 'live_facilities' || activeTab === 'cottages') && <ServiceAvailabilityTab />}
          {(activeTab === 'daily_sales' || activeTab === 'daily_reports') && <DailySalesTab />}
          {activeTab === 'returns' && <ReturnsTab />}
          {(activeTab === 'service_orders' || activeTab.startsWith('service_orders_') || activeTab === 'bookings') && <ServiceOrdersTab setActiveTab={setActiveTab} />}
          {(activeTab === 'receipts' || activeTab.startsWith('receipts_') || activeTab === 'receipts_menu') && <ReceiptsTab />}
          {(activeTab === 'staff_profile' || activeTab.startsWith('staff_profile_')) && <ProfileTab />}
          {(activeTab === 'notifications' || activeTab.startsWith('notifications_')) && <ProfileTab notificationsFilter={activeTab} />}
          {activeTab === 'settings' && (
            <div className="ct-card ct-pad">
              <div className="ct-card-head"><span>STAFF SETTINGS</span></div>
              <p className="ct-empty-text">Manage your staff terminal preferences, notification alerts, and quick actions.</p>
            </div>
          )}
        </main>

        <MailOutboxModal isOpen={showMailOutbox} onClose={() => setShowMailOutbox(false)} />

        <footer className="ct-footer">
          <div className="ct-footer-brand">
            <EcoTourLogo size={36} />
            <div><strong>EcoTourVista</strong><span>STAFF PORTAL</span></div>
          </div>
          <nav className="ct-footer-links">
            <button onClick={() => setActiveTab('overview')}>DASHBOARD</button>
            <button onClick={() => setActiveTab('pos')}>WALK-IN</button>
            <button onClick={() => setActiveTab('service_orders')}>RESERVATIONS</button>
            <button onClick={() => setActiveTab('daily_reports')}>REPORTS</button>
            <button>CONTACT</button>
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

export default StaffDashboard;