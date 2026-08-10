import React from 'react';
import {
  ShoppingCart, Home, RotateCcw, Coins, FileText, Search, User, Users, UserPlus,
  Printer, CalendarCheck, CreditCard, ClipboardList, Menu, Bell, ChevronDown,
  Wrench, Leaf, Phone, HelpCircle, BookOpen, Facebook, Instagram, MapPin, Mail
} from 'lucide-react';
import { useStaff } from './hooks/useStaff';
import StaffSidebar from './components/StaffSidebar';
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
import { MailOutboxModal } from '../MailBox';
import { useState } from 'react';

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
  const { activeTab, setActiveTab, activeStaff, resortBookings } = useStaff();

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
        <header className="ct-header">
          <button className="ct-icon-btn"><Menu size={18} /></button>
          <div className="ct-header-right">
            <button className="ct-icon-btn"><Bell size={18} /><em>3</em></button>
            <div className="ct-user">
              <img src={activeStaff?.avatarUrl || 'https://i.pravatar.cc/80?img=33'} alt="staff" />
              <div><strong>{activeStaff?.name || `${activeStaff?.fname || ''} ${activeStaff?.lname || ''}`.trim() || 'Staff Member'}</strong><small>Staff Member <ChevronDown size={12} /></small></div>
            </div>
          </div>
        </header>

        <main className="ct-content">
          {activeTab === 'overview' && (
            <>
              <section className="ct-hero">
                <p className="hi">Welcome back,</p>
                <h2 style={{ fontSize: 34 }}>Good Morning, <span>Staff!</span> 🌿</h2>
                <p className="sub">Let's make today another amazing day<br />for our visitors.</p>
              </section>

              <section className="st-stats">
                <div className="ct-card ct-stat"><div className="top"><span className="ico"><Users size={17} /></span><small>TODAY'S VISITORS</small></div><strong>124</strong><button className="ct-link">↑ 18.6% vs yesterday</button></div>
                <div className="ct-card ct-stat"><div className="top"><span className="ico font-extrabold text-emerald-400 font-mono text-base">₱</span><small>TODAY'S REVENUE</small></div><strong>₱25,680.00</strong><button className="ct-link">↑ 21.4% vs yesterday</button></div>
                <div className="ct-card ct-stat"><div className="top"><span className="ico"><CalendarCheck size={17} /></span><small>PENDING RESERVATIONS</small></div><strong>{resortBookings?.length || 8}</strong><button className="ct-link" onClick={() => setActiveTab('service_orders')}>View all reservations</button></div>
                <div className="ct-card ct-stat"><div className="top"><span className="ico"><Printer size={17} /></span><small>RECEIPTS PRINTED</small></div><strong>96</strong><button className="ct-link" onClick={() => setActiveTab('receipts')}>View all receipts</button></div>
              </section>

              <section className="ct-mid-grid">
                <div className="ct-card ct-pad">
                  <div className="ct-card-head"><span>TODAY'S VISITOR OVERVIEW</span><select className="ct-promo-btn" style={{ width: 'auto' }}><option>Today</option><option>This Week</option></select></div>
                  <VisitorChart />
                </div>
                <div className="ct-card ct-pad">
                  <div className="ct-card-head"><span>VISITOR BREAKDOWN</span></div>
                  <BreakdownDonut />
                </div>
              </section>

              <section className="ct-mid-grid">
                <div className="ct-card ct-pad">
                  <div className="ct-card-head"><span>RECENT WALK-IN VISITORS</span><button className="ct-link">View All</button></div>
                  {WALKINS.map((w) => (
                    <div className="st-visitor" key={w.name}>
                      <img src={`https://i.pravatar.cc/80?img=${w.img}`} alt={w.name} />
                      <div className="info"><strong>{w.name}</strong><small>{w.time} • {w.pax}</small></div>
                      <span className="amt">₱{w.amt}.00</span>
                      <span className="ct-badge confirmed">Paid</span>
                    </div>
                  ))}
                  <button className="st-new-btn" onClick={() => setActiveTab('pos')}>+ New Walk-in Visitor</button>
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
                  <div className="st-pay-row"><span>Cash Payments</span><strong>₱23,680.00</strong></div>
                  <div className="st-pay-row"><span>Card Payments</span><strong>₱2,000.00</strong></div>
                  <div className="st-pay-row total"><span>Total Revenue</span><strong>₱25,680.00</strong></div>
                </div>

                <div className="ct-card ct-pad">
                  <div className="ct-card-head"><span>DUANGON OPERATIONS TODAY</span><button className="ct-link" onClick={() => setActiveTab('facilities')}>View Facilities</button></div>
                  {[
                    { name: 'Cottages Occupied', occ: 18, total: 30, icon: '🛖' },
                    { name: 'Resort Tables Rented', occ: 24, total: 40, icon: '🪑' },
                    { name: 'Life Vests In Use', occ: 31, total: 50, icon: '🦺' },
                    { name: 'Videoke Units Active', occ: 3, total: 4, icon: '🎤' },
                    { name: 'Kayaks / Floating Pads', occ: 3, total: 5, icon: '🛶' },
                    { name: 'Aircon Rooms Booked', occ: 2, total: 6, icon: '🛌' },
                  ].map((op) => (
                    <div className="st-dest" key={op.name}>
                      <span className="thumb">{op.icon}</span>
                      <div className="info">
                        <div className="name font-bold">{op.name}</div>
                        <div className="st-bar"><i style={{ width: `${(op.occ / op.total) * 100}%` }} /></div>
                      </div>
                      <div className="num"><strong>{op.occ}</strong><small>/ {op.total} total</small></div>
                    </div>
                  ))}
                </div>

                <div className="ct-card ct-pad">
                  <div className="ct-card-head"><span>REMINDERS & ANNOUNCEMENTS</span><button className="ct-link">View All</button></div>
                  <div className="st-rem"><span className="ico purple"><Wrench size={16} /></span><div><h5>System Maintenance</h5><p>The system will be updated on May 27, 2024 at 12:00 AM.</p><small>May 25, 2024</small></div></div>
                  <div className="st-rem"><span className="ico green"><Users size={16} /></span><div><h5>Staff Meeting</h5><p>Meeting at the admin office on May 26, 2024 at 2:00 PM.</p><small>May 24, 2024</small></div></div>
                  <div className="st-rem"><span className="ico green"><Leaf size={16} /></span><div><h5>Clean as You Go</h5><p>Please maintain cleanliness in all areas of the resort.</p><small>May 24, 2024</small></div></div>
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

          {/* small new tabs */}
          {(activeTab === 'visitor_logs' || activeTab.startsWith('visitor_logs_')) && (
            <div className="ct-card ct-pad space-y-4">
              <div className="ct-card-head flex justify-between items-center pb-2 border-b border-emerald-900/40">
                <span className="font-extrabold text-white text-base">DUANGON VISITOR LOGS & HISTORY</span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-800">
                  {WALKINS.length} Checked-in Guests
                </span>
              </div>
              <div className="space-y-3">
                {WALKINS.map((w) => (
                  <div className="st-visitor flex items-center justify-between p-3 rounded-xl bg-black/20 border border-emerald-900/40" key={w.name}>
                    <div className="flex items-center gap-3">
                      <img src={`https://i.pravatar.cc/80?img=${w.img}`} alt={w.name} className="w-10 h-10 rounded-full border border-emerald-500/40" />
                      <div className="info">
                        <strong className="text-white text-sm block">{w.name}</strong>
                        <small className="text-slate-400 text-xs">{w.time} • {w.pax}</small>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-emerald-400 text-xs">₱{w.amt}.00</span>
                      <span className="ct-badge confirmed bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Checked In</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'inventory' && <InventoryTab />}

          {/* Existing functional tabs & sub-keys */}
          {(activeTab === 'pos' || activeTab === 'pos_today' || activeTab === 'pos_history') && <POSTab />}
          {(activeTab === 'facilities' || activeTab.startsWith('facilities_')) && <FacilitiesTab />}
          {activeTab === 'availability' && <AvailabilityTab />}
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