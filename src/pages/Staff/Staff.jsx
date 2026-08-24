import React from 'react';
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
import CashClosingTab from './tabs/CashClosingTab';
import ServiceOrdersTab from './tabs/ServiceOrdersTab';
import ReceiptsTab from './tabs/ReceiptsTab';
import ProfileTab from './tabs/ProfileTab';
import DailySalesTab from './tabs/DailySalesTab';
import AvailabilityTab from './tabs/AvailabilityTab';
import NotificationsTab from './tabs/NotificationsTab';
import InventoryTab from './tabs/InventoryTab';
import PendingBookingsTab from './tabs/PendingBookingsTab';
import { MailOutboxModal } from '../MailBox';
import { useState, useEffect } from 'react';
import { useEcoTour } from '../../context/EcoTourContext';
import { getPhilippineDateStr, getPhilippineFormattedDate } from '../../utils/phTime';

const VISITS = [0, 0, 0, 0, 0, 0, 0, 0, 0];
const WALKINS = [
  { name: 'Alex Reyes', img: 12, time: '08:15 AM', pax: '5 Adults • Entrance & Pool', amt: 500 },
  { name: 'Maria Santos', img: 32, time: '09:30 AM', pax: '3 Adults, 2 Kids • Open Cottage', amt: 900 },
  { name: 'Juan Dela Cruz', img: 68, time: '10:45 AM', pax: '4 Adults • Table Set & Videoke', amt: 750 },
  { name: 'Elena Rodriguez', img: 45, time: '11:20 AM', pax: '6 Adults • Aircon Kubo Room', amt: 1500 },
  { name: 'Mark Bautista', img: 55, time: '01:10 PM', pax: '2 Adults • Kayak & Floating Pad', amt: 600 },
];
const DESTS = [
  { name: 'Duangon Cold Spring', v: 54, e: '⛲' },
  { name: 'Man-Made Forest', v: 32, e: '🌲' },
  { name: 'Pangas Falls', v: 21, e: '💦' },
  { name: 'Bohol Tarsier Conservation Area', v: 17, e: '🐒' },
];

function VisitorChart() {
  const W = 560, H = 190, max = 80, hi = 8;
  const pts = VISITS.map((v, i) => [i * (W / (VISITS.length - 1)), H - (v / max) * (H - 20) - 5]);
  const area = `M0,${H} L${pts.map((p) => p.join(',')).join(' L')} L${W},${H} Z`;
  return (
    <div>
      <div className="st-chart-body">
        <div className="st-y"><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span></div>
        <div className="st-plot">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="stFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a3e635" stopOpacity=".4" />
                <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[.25, .5, .75].map((t) => <line key={t} className="st-grid" x1="0" x2={W} y1={H * t} y2={H * t} />)}
            <path d={area} fill="url(#stFill)" />
            <polyline className="st-line" points={pts.map((p) => p.join(',')).join(' ')} />
            {pts.map((p, i) => <circle key={i} className={i === hi ? 'st-dot hi' : 'st-dot'} cx={p[0]} cy={p[1]} r={i === hi ? 4.5 : 3} />)}
          </svg>
          <div className="st-tip" style={{ left: `${(hi / (VISITS.length - 1)) * 100}%`, top: `${(pts[hi][1] / H) * 100}%` }}>45 Visitors</div>
        </div>
      </div>
      <div className="st-x"><span>6 AM</span><span>9 AM</span><span>12 PM</span><span>3 PM</span><span>6 PM</span></div>
    </div>
  );
}


function BreakdownDonut() {
  const seg = [{ v: 62, c: '#a3e635' }, { v: 25, c: '#2dd4bf' }, { v: 13, c: '#4d9e50' }];
  const size = 170, th = 30, r = (size - th) / 2, C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="st-donut-wrap">
      <svg width={size} height={size}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {seg.map((s, i) => {
            const dash = (s.v / 100) * C, off = -acc; acc += dash;
            return <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.c} strokeWidth={th} strokeDasharray={`${dash - 2} ${C - dash + 2}`} strokeDashoffset={off} />;
          })}
        </g>
      </svg>
      <div className="st-legend">
        <div className="row"><span className="dot" style={{ background: '#a3e635' }} />Adults<strong>78</strong><small>(62%)</small></div>
        <div className="row"><span className="dot" style={{ background: '#2dd4bf' }} />Children<strong>32</strong><small>(25%)</small></div>
        <div className="row"><span className="dot" style={{ background: '#4d9e50' }} />Seniors<strong>14</strong><small>(13%)</small></div>
      </div>
    </div>
  );
}

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
    refreshAllLiveData
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
  const getOccupancy = (keyword, fallbackTotal = 10) => {
    let inUse = 0;
    let total = fallbackTotal;

    const sItem = (resortServices || []).find(s => (s.service_name || s.name || '').toLowerCase().includes(keyword.toLowerCase()));
    if (sItem) {
      total = parseInt(sItem.total_capacity || sItem.totalQuantity || fallbackTotal, 10);
    }

    // Check active paid / in-service reservations
    (resortBookings || []).forEach(b => {
      const s = (b.status || '').toLowerCase();
      const isConcluded = s.includes('completed') || s.includes('cancel') || s.includes('void') || s.includes('checked out');
      const isPaidOrActive = s.includes('paid') || s.includes('using') || s.includes('in resort') || s.includes('checked in') || s.includes('confirmed');
      if (isPaidOrActive && !isConcluded) {
        if (Array.isArray(b.items) && b.items.length > 0) {
          b.items.forEach(it => {
            if ((it.name || '').toLowerCase().includes(keyword.toLowerCase())) {
              inUse += parseInt(it.quantity || 1, 10);
            }
          });
        } else if ((b.specificType || b.serviceName || '').toLowerCase().includes(keyword.toLowerCase())) {
          inUse += 1;
        }
      }
    });

    // Check active walk-ins
    (walkIns || []).forEach(w => {
      const isWalkInActive = (w.walk_in_status === 'ACTIVE' || w.payment_status === 'PAID') && w.walk_in_status !== 'COMPLETED';
      if (isWalkInActive && Array.isArray(w.items)) {
        w.items.forEach(it => {
          if ((it.name || '').toLowerCase().includes(keyword.toLowerCase())) {
            inUse += parseInt(it.quantity || 1, 10);
          }
        });
      }
    });

    return { occupied: inUse, total };
  };

  const cottageOp = getOccupancy('cottage', 10);
  const tableOp = getOccupancy('table', 15);
  const vestOp = getOccupancy('vest', 30);
  const videokeOp = getOccupancy('videoke', 4);
  const kayakOp = getOccupancy('kayak', 5);
  const roomOp = getOccupancy('room', 4);

  // Unified Real-Time Combined Transactions (Newest First)
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
  ].sort((a, b) => b.rawTime - a.rawTime).slice(0, 6);

  const QUICK = [
    { label: 'New Walk-in', sub: 'Register new walk-in visitor', icon: UserPlus, tab: 'pos' },
    { label: 'Print Receipt', sub: 'Generate and print receipt', icon: Printer, tab: 'receipts' },
    { label: 'Check Reservation', sub: 'View and manage reservations', icon: CalendarCheck, tab: 'service_orders' },
    { label: 'Process Payment', sub: 'Record visitor payment', icon: CreditCard, tab: 'cash_closing' },
    { label: 'Daily Report', sub: 'View and submit daily report', icon: ClipboardList, tab: 'daily_reports' },
    { label: 'Visitor Logs', sub: 'View visitor activity logs', icon: Users, tab: 'visitor_logs' },
  ];

  return (
    <div className="client-portal">
      <StaffSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="ct-main">
        <StaffHeader activeTab={activeTab} setActiveTab={setActiveTab} activeStaff={activeStaff} />

        <main className="ct-content">
          {activeTab === 'overview' && (
            <>
              <section className="ct-hero">
                <p className="hi">Welcome back,</p>
                <h2 style={{ fontSize: 34 }}>Good Day, <span>{activeStaff?.name || 'Staff Member'}!</span> 🌿</h2>
                <p className="sub">Operating Date: <strong>{todayFormatted} ({todayStr})</strong> • Philippine Time (PHT)<br />Live terminal synced with resort front gate POS.</p>
              </section>

              <section className="st-stats">
                <div className="ct-card ct-stat">
                  <div className="top"><span className="ico"><Users size={17} /></span><small>TODAY'S VISITORS</small></div>
                  <strong>{todayVisitors} Pax</strong>
                  <button className="ct-link" onClick={() => setActiveTab('pos')}>Live count for today</button>
                </div>

                <div className="ct-card ct-stat">
                  <div className="top"><span className="ico font-extrabold text-emerald-400 font-mono text-base">₱</span><small>TODAY'S REVENUE</small></div>
                  <strong className="font-mono text-emerald-400">₱{todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                  <button className="ct-link" onClick={() => setActiveTab('daily_reports')}>100% Cash Collections</button>
                </div>

                <div className="ct-card ct-stat">
                  <div className="top"><span className="ico"><CalendarCheck size={17} /></span><small>PENDING RESERVATIONS</small></div>
                  <strong>{todayPendingBookings.length}</strong>
                  <button className="ct-link" onClick={() => setActiveTab('service_orders')}>View today's bookings</button>
                </div>

                <div className="ct-card ct-stat">
                  <div className="top"><span className="ico"><Printer size={17} /></span><small>RECEIPTS PRINTED</small></div>
                  <strong>{todayReceiptsCount}</strong>
                  <button className="ct-link" onClick={() => setActiveTab('receipts')}>View today's receipts</button>
                </div>
              </section>

              <section className="ct-mid-grid">
                <div className="ct-card ct-pad">
                  <div className="ct-card-head"><span>TODAY'S VISITOR OVERVIEW ({todayStr})</span><button className="ct-link" onClick={() => setActiveTab('pos')}>Register New</button></div>
                  <div className="p-4 text-center space-y-2">
                    <div className="text-3xl font-black text-emerald-400 font-mono">{todayVisitors} Visitors Registered Today</div>
                    <p className="text-xs text-slate-400">Visitor count automatically resets to 0 at the start of each operating day (12:00 AM Midnight).</p>
                  </div>
                </div>
                <div className="ct-card ct-pad">
                  <div className="ct-card-head"><span>TODAY'S CASH DRAWER</span></div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between text-xs"><span className="text-slate-400">Total Cash Collected:</span><strong className="text-emerald-400 font-mono text-base">₱{todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-400">Walk-In Gate POS:</span><strong className="font-mono text-white">₱{walkInCashToday.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-400">Reservation Counter:</span><strong className="font-mono text-white">₱{reservationCashToday.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
                  </div>
                </div>
              </section>

              <section className="ct-mid-grid">
                <div className="ct-card ct-pad">
                  <div className="ct-card-head"><span>RECENT CLIENT BOOKINGS & WALK-INS (TODAY)</span><button className="ct-link" onClick={() => setActiveTab('service_orders')}>View All</button></div>
                  {allTodayActivities.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">No bookings recorded for today yet. Use POS to register walk-ins.</div>
                  ) : (
                    allTodayActivities.map((b) => (
                      <div className="st-visitor" key={b.id}>
                        <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-700/50 flex items-center justify-center font-bold text-xs text-emerald-400 shrink-0 font-mono">
                          {(b.name || 'G')[0]}
                        </div>
                        <div className="info">
                          <strong>{b.name}</strong>
                          <small>{b.sub}</small>
                        </div>
                        <span className="amt font-mono text-emerald-400">₱{b.amt.toLocaleString()}</span>
                        <span className={`ct-badge ${b.badgeClass}`}>
                          {b.status}
                        </span>
                      </div>
                    ))
                  )}
                  <button className="st-new-btn" onClick={() => setActiveTab('pos')}>+ New Walk-in Visitor (POS)</button>
                </div>

                <div className="ct-card ct-pad">
                  <div className="ct-card-head"><span>QUICK ACTIONS</span></div>
                  <div className="st-quick-grid">
                    {QUICK.map((q) => (
                      <button className="st-quick" key={q.label} onClick={() => setActiveTab(q.tab)}>
                        <span className="ico"><q.icon size={20} /></span>
                        <strong>{q.label}</strong><small>{q.sub}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="st-bottom">
                <div className="ct-card ct-pad">
                  <div className="ct-card-head"><span>PAYMENT SUMMARY (TODAY)</span></div>
                  <div className="st-pay-row"><span>Walk-In Gate Cash</span><strong className="font-mono">₱{walkInCashToday.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
                  <div className="st-pay-row"><span>Reservation Counter Cash</span><strong className="font-mono">₱{reservationCashToday.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
                  <div className="st-pay-row total"><span>Total Cash Revenue</span><strong className="font-mono text-emerald-400">₱{todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
                </div>

                <div className="ct-card ct-pad">
                  <div className="ct-card-head"><span>DUANGON LIVE OPERATIONS TODAY</span><button className="ct-link" onClick={() => setActiveTab('facilities')}>View Facilities</button></div>
                  {[
                    { name: 'Cottages Occupied', occ: cottageOp.occupied, total: cottageOp.total, icon: '🛖' },
                    { name: 'Resort Tables Rented', occ: tableOp.occupied, total: tableOp.total, icon: '🪑' },
                    { name: 'Life Vests In Use', occ: vestOp.occupied, total: vestOp.total, icon: '🦺' },
                    { name: 'Videoke Units Active', occ: videokeOp.occupied, total: videokeOp.total, icon: '🎤' },
                    { name: 'Kayaks / Floating Pads', occ: kayakOp.occupied, total: kayakOp.total, icon: '🛶' },
                    { name: 'Aircon Rooms Booked', occ: roomOp.occupied, total: roomOp.total, icon: '🛌' },
                  ].map((op) => (
                    <div className="st-dest" key={op.name}>
                      <span className="thumb">{op.icon}</span>
                      <div className="info">
                        <div className="name font-bold">{op.name}</div>
                        <div className="st-bar"><i style={{ width: `${Math.min(100, (op.occ / Math.max(1, op.total)) * 100)}%` }} /></div>
                      </div>
                      <div className="num font-mono"><strong>{op.occ}</strong><small>/ {op.total} total</small></div>
                    </div>
                  ))}
                </div>

                <div className="ct-card ct-pad">
                  <div className="ct-card-head"><span>RESORT REMINDERS</span></div>
                  <div className="st-rem"><span className="ico green"><Users size={16} /></span><div><h5>Daily Cash Tally</h5><p>Submit shift closing report at the end of each duty.</p><small>Today</small></div></div>
                  <div className="st-rem"><span className="ico green"><Leaf size={16} /></span><div><h5>Clean as You Go</h5><p>Please inspect and maintain cottages after visitor checkout.</p><small>Today</small></div></div>
                </div>
              </section>

              <section className="ct-card ct-help">
                <div><h4>NEED ASSISTANCE?</h4><p>We're here to help you provide the best experience for our visitors.</p></div>
                <button className="ct-help-item"><span className="ct-help-icon"><User size={18} /></span><div><strong>Contact Admin</strong><small>Get quick support</small></div></button>
                <button className="ct-help-item"><span className="ct-help-icon"><HelpCircle size={18} /></span><div><strong>Report Issue</strong><small>Report system issues</small></div></button>
                <button className="ct-help-item"><span className="ct-help-icon"><BookOpen size={18} /></span><div><strong>User Guide</strong><small>Learn how it works</small></div></button>
              </section>
            </>
          )}

          {/* Real-time Tourist Visitor Logbook */}
          {(activeTab === 'visitor_logs' || activeTab.startsWith('visitor_logs_')) && (
            <div className="ct-card ct-pad space-y-4">
              <div className="ct-card-head flex justify-between items-center pb-2 border-b border-emerald-900/40">
                <span className="font-extrabold text-white text-base">DUANGON TOURIST VISITOR LOGBOOK ({todayStr})</span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-800">
                  {todayWalkIns.length} Walk-Ins • {todayVisitors} Total Pax Today
                </span>
              </div>
              <div className="space-y-3">
                {todayWalkIns.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No visitor check-ins recorded for today yet. Use Walk-In POS to register new guests.
                  </div>
                ) : (
                  todayWalkIns.map((w, index) => (
                    <div className="st-visitor flex items-center justify-between p-3 rounded-xl bg-black/20 border border-emerald-900/40" key={w.walk_in_id || w.id || index}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center font-bold text-xs text-emerald-300 font-mono">
                          {(w.lead_guest_name || 'G')[0]}
                        </div>
                        <div className="info">
                          <strong className="text-white text-sm block">{w.lead_guest_name}</strong>
                          <small className="text-slate-400 text-xs">
                            {w.time || 'Today'} • {w.guest_count || 1} Pax • {w.cottage_name || w.facility_name || 'Day Pass & Entrance'}
                          </small>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-emerald-400 text-xs font-mono">₱{(parseFloat(w.total_amount || w.grandTotal) || 0).toLocaleString()}</span>
                        <span className={`ct-badge confirmed ${w.walk_in_status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-300 border border-slate-700'} px-2.5 py-0.5 rounded-full text-[10px] font-bold`}>
                          {w.walk_in_status === 'ACTIVE' ? 'In Resort' : 'Completed'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          {activeTab === 'inventory' && <InventoryTab />}
          {activeTab === 'pending_bookings' && <PendingBookingsTab setActiveTab={setActiveTab} />}

          {/* Existing functional tabs & sub-keys */}
          {(activeTab === 'pos' || activeTab === 'walkin_pos' || activeTab === 'pos_today' || activeTab === 'pos_history') && <POSTab />}
          {(activeTab === 'facilities' || activeTab.startsWith('facilities_')) && <FacilitiesTab />}
          {(activeTab === 'availability' || activeTab === 'live_facilities' || activeTab === 'cottages') && <AvailabilityTab />}
          {(activeTab === 'daily_sales' || activeTab === 'daily_reports') && <DailySalesTab />}
          {activeTab === 'returns' && <ReturnsTab />}
          {(activeTab === 'cash_closing' || activeTab.startsWith('cash_closing_')) && <CashClosingTab />}
          {(activeTab === 'service_orders' || activeTab.startsWith('service_orders_') || activeTab === 'bookings') && <ServiceOrdersTab />}
          {(activeTab === 'receipts' || activeTab.startsWith('receipts_') || activeTab === 'receipts_menu') && <ReceiptsTab />}
          {(activeTab === 'notifications' || activeTab.startsWith('notifications_')) && <NotificationsTab activeTab={activeTab} />}
          {(activeTab === 'staff_profile' || activeTab.startsWith('staff_profile_')) && <ProfileTab />}
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
            <svg viewBox="0 0 64 40" width="38">
              <path d="M8 26 L22 8 L32 20 L40 10 L56 26" stroke="#eafff2" strokeWidth="3" fill="none" strokeLinejoin="round" />
              <path d="M6 31 q6 -4 12 0 t12 0 t12 0 t12 0" stroke="#4ade80" strokeWidth="2.5" fill="none" />
              <path d="M10 36 q6 -4 12 0 t12 0 t12 0" stroke="#2dd4bf" strokeWidth="2.5" fill="none" />
            </svg>
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