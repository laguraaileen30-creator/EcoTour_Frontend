import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Users, Wallet, CalendarCheck, Gauge, RefreshCw, FileText, Clock3, BedDouble, Hourglass,
  BarChart3, TrendingUp, PieChart, Trophy, Activity, Package, Tag, UserCog, FileBarChart,
} from 'lucide-react';
import OfficialReceiptModal from '../modals/OfficialReceiptModal';
import { useEcoTour } from '../../../context/EcoTourContext';
import { getPhilippineDateStr } from '../../../utils/phTime';
import AvailabilityOverview from '../../../components/AvailabilityOverview';
import { useDashboard } from '../hooks/useDashboard';
import {
  DashboardShell, GlassHero, Glance, KpiCard, Panel, Row, statusPill, QuickActions,
  WeekBars, Donut, EmptyState, useNow, phDate, phTime, greeting, peso,
} from '../../../components/dashboard/Glass';
import { lastDays, seriesByDay, bookingState, phDayKey } from '../../../components/dashboard/metrics';
import heroDark from '../../../assets/home2.png';
import heroLight from '../../../assets/home1.png';

const STATE_META = {
  pending: { label: 'Pending payment', color: '#f59e0b' },
  paid: { label: 'Paid', color: '#22c55e' },
  in_resort: { label: 'In resort', color: '#0ea5e9' },
  completed: { label: 'Completed', color: '#14b8a6' },
  cancelled: { label: 'Cancelled', color: '#f43f5e' },
};

export default function DashboardTab() {
  const { setActiveTab } = useDashboard() || {};
  const {
    resortBookings = [], reservations = [], receipts = [], walkIns = [],
    getDailyTallySummary, refreshAllLiveData, theme, currentUser,
  } = useEcoTour();
  const now = useNow(30000);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState(new Date());
  const [viewReceiptData, setViewReceiptData] = useState(null);
  const [shares, setShares] = useState({ park: 70, barangay: 20, guide: 10 });
  const [maxCapacity, setMaxCapacity] = useState(300);
  const go = (tab) => setActiveTab && setActiveTab(tab);
  const todayStr = getPhilippineDateStr();

  // Revenue-sharing percentages and daily capacity come from System Settings
  useEffect(() => {
    fetch('http://localhost:5000/api/v1/settings')
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings || {};
        setShares({
          park: parseFloat(s.park_share_pct) || 70,
          barangay: parseFloat(s.barangay_share_pct) || 20,
          guide: parseFloat(s.guide_share_pct) || 10,
        });
        setMaxCapacity(parseInt(s.max_daily_capacity, 10) || 300);
      })
      .catch(() => {});
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try { if (refreshAllLiveData) await refreshAllLiveData(); } finally {
      setRefreshing(false);
      setLastSynced(new Date());
    }
  }, [refreshAllLiveData]);

  const bookings = resortBookings.length ? resortBookings : reservations;
  const days = useMemo(() => lastDays(7), [todayStr]);
  const daily = useMemo(() => days.map((d) => (getDailyTallySummary ? getDailyTallySummary(d.key) : { totalVisitors: 0, totalCashRevenue: 0 })), [days, getDailyTallySummary, receipts, walkIns]);
  const visitorSeries = daily.map((d) => d.totalVisitors || 0);
  const revenueSeries = daily.map((d) => d.totalCashRevenue || 0);
  const today = daily[daily.length - 1] || { totalVisitors: 0, totalCashRevenue: 0 };
  const weekRevenue = revenueSeries.reduce((a, b) => a + b, 0);

  const states = useMemo(() => {
    const c = { pending: 0, paid: 0, in_resort: 0, completed: 0, cancelled: 0 };
    bookings.forEach((b) => { c[bookingState(b.status)] += 1; });
    return c;
  }, [bookings]);
  const activeBookings = states.pending + states.paid + states.in_resort;
  const bookingSeries = seriesByDay(days, bookings, (b) => b.createdAt || b.created_at || b.bookingDate);
  const checkInsToday = bookings.filter((b) => phDayKey(b.reservationDate || b.bookingDate) === todayStr && bookingState(b.status) !== 'cancelled').length;
  const capacityPct = Math.min(100, Math.round((today.totalVisitors / Math.max(1, maxCapacity)) * 100));

  const recentBookings = useMemo(() => [...bookings]
    .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))
    .slice(0, 6), [bookings]);

  // Most booked packages & services over the last 30 days (from booking lines)
  const topItems = useMemo(() => {
    const since = Date.now() - 30 * 86400000;
    const map = new Map();
    bookings.forEach((b) => {
      if (bookingState(b.status) === 'cancelled') return;
      const t = new Date(b.createdAt || b.created_at || b.bookingDate || 0).getTime();
      if (t && t < since) return;
      (b.items || []).forEach((it) => {
        const type = it.itemType || '';
        const name = it.name || it.serviceName;
        if (!name || type === 'FEE' || type === 'TICKET' || /entrance|environmental/i.test(name)) return;
        const key = name.replace(/^Extra /, '');
        const cur = map.get(key) || { name: key, count: 0, revenue: 0, isPackage: type === 'PACKAGE' };
        cur.count += parseInt(it.quantity || 1, 10);
        cur.revenue += parseFloat(it.subtotal ?? (parseFloat(it.unitPrice || 0) * parseInt(it.quantity || 1, 10))) || 0;
        map.set(key, cur);
      });
    });
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  }, [bookings]);
  const topMax = Math.max(1, ...topItems.map((t) => t.count));

  const shareTotal = shares.park + shares.barangay + shares.guide || 100;
  const parkShare = Math.round(weekRevenue * (shares.park / shareTotal));
  const barangayShare = Math.round(weekRevenue * (shares.barangay / shareTotal));
  const guideShare = weekRevenue - parkShare - barangayShare;

  const adminName = currentUser?.fname || currentUser?.name?.split(' ')[0] || 'Administrator';

  return (
    <DashboardShell>
      <GlassHero
        image={theme === 'light' ? heroLight : heroDark}
        eyebrow={`${phDate(now)} • ${phTime(now)} PHT`}
        title={`${greeting(now)},`}
        highlight={`${adminName}!`}
        subtitle="Here is today's live overview of Duangon Cold Spring — bookings, guests, cash and facility availability, all from the database."
        actions={(
          <>
            <button type="button" className="gd-btn gd-btn-primary" onClick={() => go('reservations')}><CalendarCheck size={15} /> Manage reservations</button>
            <button type="button" className="gd-btn gd-btn-ghost" onClick={refresh} disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> {refreshing ? 'Syncing…' : `Synced ${phTime(lastSynced)}`}
            </button>
          </>
        )}
        aside={(
          <>
            <Glance icon={Hourglass} label="Awaiting payment" value={states.pending} tone="amber" />
            <Glance icon={BedDouble} label="Guests in resort now" value={states.in_resort} tone="sky" />
            <Glance icon={Clock3} label="Visits scheduled today" value={checkInsToday} tone="emerald" />
          </>
        )}
      />

      <div className="gd-kpis gd-anim">
        <KpiCard icon={Users} tone="emerald" label="Visitors today" value={today.totalVisitors.toLocaleString()} spark={visitorSeries} sub="Last 7 days" onClick={() => go('reports')} />
        <KpiCard icon={Wallet} tone="teal" label="Revenue today" value={peso(today.totalCashRevenue)} spark={revenueSeries} sub={`${peso(weekRevenue)} this week`} onClick={() => go('payments')} />
        <KpiCard icon={CalendarCheck} tone="amber" label="Active bookings" value={activeBookings} spark={bookingSeries} sub={`${states.pending} pending • ${states.paid + states.in_resort} paid`} onClick={() => go('reservations')} />
        <KpiCard icon={Gauge} tone="sky" label="Capacity used" value={`${capacityPct}%`} progress={capacityPct} sub={`${today.totalVisitors} of ${maxCapacity} daily guests`} />
      </div>

      <div className="gd-grid-even">
        <Panel icon={BarChart3} title="Visitors — last 7 days" action={{ label: 'Reports', onClick: () => go('reports') }}>
          <WeekBars data={visitorSeries} labels={days.map((d) => d.label)} todayIndex={days.length - 1} tone="emerald" />
        </Panel>
        <Panel icon={TrendingUp} title="Cash revenue — last 7 days" action={{ label: 'Payments', onClick: () => go('payments') }}>
          <WeekBars data={revenueSeries} labels={days.map((d) => d.label)} todayIndex={days.length - 1} tone="teal" format={(v) => (v >= 1000 ? `₱${(v / 1000).toFixed(1)}k` : `₱${v}`)} />
        </Panel>
      </div>

      <div className="gd-grid">
        <div className="gd-col">
          <Panel icon={Activity} title="Recent reservations & walk-ins" action={{ label: 'View all', onClick: () => go('reservations') }}>
            {recentBookings.length === 0 ? (
              <EmptyState icon={CalendarCheck} title="No reservations yet" text="New online reservations and walk-ins appear here in real time." />
            ) : (
              <div className="gd-list">
                {recentBookings.map((b) => {
                  const name = b.clientName || b.fullName || b.touristName || 'Guest';
                  const total = parseFloat(b.estimatedTotal || b.grandTotal || b.totalPrice || 0);
                  return (
                    <div key={b.id || b.bookingRef} className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <Row
                          title={name}
                          sub={`${b.bookingRef || b.bookingNumber || ''} • ${b.reservationDate || b.bookingDate || ''} • ${b.packageName || b.serviceName || 'Resort visit'}`}
                          amount={peso(total)}
                          pill={statusPill(b.status)}
                        />
                      </div>
                      <button
                        type="button"
                        className="gd-btn gd-btn-ghost"
                        style={{ padding: 9 }}
                        title="View receipt"
                        onClick={() => setViewReceiptData({
                          receiptNo: b.bookingRef || b.bookingNumber,
                          clientName: name,
                          userNumber: b.userNumber,
                          date: b.reservationDate || b.bookingDate,
                          time: b.arrivalTime || b.timeSlot,
                          paymentMethod: b.paymentMethod || 'Cash',
                          status: b.status,
                          grandTotal: total,
                          totalVisitors: b.totalVisitors || b.numberOfGuests || 1,
                        })}
                      >
                        <FileText size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel icon={Gauge} title="Service availability" action={{ label: 'Manage', onClick: () => go('services') }}>
            <AvailabilityOverview compact onViewService={() => go('services')} />
          </Panel>
        </div>

        <div className="gd-col">
          <Panel icon={PieChart} title="Reservation status mix">
            <div className="gd-donut-wrap">
              <Donut
                center={bookings.length}
                sub="reservations"
                segments={Object.entries(STATE_META).map(([k, m]) => ({ value: states[k], color: m.color }))}
              />
              <div className="gd-legend">
                {Object.entries(STATE_META).map(([k, m]) => (
                  <div className="gd-legend-row" key={k}><span><i style={{ background: m.color }} />{m.label}</span><strong>{states[k]}</strong></div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel icon={Trophy} title="Top packages & services (30 days)">
            {topItems.length === 0 ? (
              <EmptyState icon={Package} title="No bookings in the last 30 days" />
            ) : topItems.map((t, i) => (
              <div className="gd-meter" key={t.name}>
                <span className="em">{['🥇', '🥈', '🥉', '🏅', '🏅'][i]}</span>
                <div>
                  <strong>{t.name}</strong>
                  <div className="gd-progress tone-emerald" style={{ marginTop: 6 }}><i style={{ width: `${(t.count / topMax) * 100}%` }} /></div>
                </div>
                <span className="num">{t.count}<small> booked</small></span>
              </div>
            ))}
          </Panel>

          <Panel icon={Wallet} title="Revenue sharing (this week)">
            <div className="gd-donut-wrap">
              <Donut
                size={120}
                thickness={16}
                center={weekRevenue >= 1000 ? `₱${(weekRevenue / 1000).toFixed(1)}k` : peso(weekRevenue)}
                sub="collected"
                segments={[{ value: shares.park, color: '#22c55e' }, { value: shares.barangay, color: '#0ea5e9' }, { value: shares.guide, color: '#f59e0b' }]}
              />
              <div className="gd-legend">
                <div className="gd-legend-row"><span><i style={{ background: '#22c55e' }} />Park ({shares.park}%)</span><strong>{peso(parkShare)}</strong></div>
                <div className="gd-legend-row"><span><i style={{ background: '#0ea5e9' }} />Barangay ({shares.barangay}%)</span><strong>{peso(barangayShare)}</strong></div>
                <div className="gd-legend-row"><span><i style={{ background: '#f59e0b' }} />Guides / LGU ({shares.guide}%)</span><strong>{peso(guideShare)}</strong></div>
              </div>
            </div>
          </Panel>

          <Panel icon={UserCog} title="Quick actions">
            <QuickActions items={[
              { icon: Package, label: 'Packages & services', sub: 'Prices, stock, units', onClick: () => go('services'), tone: 'emerald' },
              { icon: Users, label: 'User management', sub: 'Clients & staff', onClick: () => go('users'), tone: 'sky' },
              { icon: Tag, label: 'Deals', sub: 'Promos & discounts', onClick: () => go('services'), tone: 'amber' },
              { icon: FileBarChart, label: 'Reports', sub: 'Sales & analytics', onClick: () => go('reports'), tone: 'violet' },
            ]} />
          </Panel>
        </div>
      </div>

      <OfficialReceiptModal receiptData={viewReceiptData} onClose={() => setViewReceiptData(null)} />
    </DashboardShell>
  );
}
