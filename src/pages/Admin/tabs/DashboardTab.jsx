import React, { useState, useEffect } from 'react';

function AreaChart({ data = [380, 460, 640, 980, 1245, 930, 1210], days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }) {
  const W = 560, H = 220, max = Math.max(...data, 1500), hi = 4;
  const pts = data.map((v, i) => [i * (W / (data.length - 1 || 1)), H - (v / max) * (H - 20) - 5]);
  const line = pts.map(p => p.join(',')).join(' ');
  const area = `M0,${H} L${pts.map(p => p.join(',')).join(' L')} L${W},${H} Z`;
  return (
    <div>
      <div className="chart-body">
        <div className="y-axis"><span>1.5K</span><span>1.2K</span><span>900</span><span>600</span><span>300</span><span>0</span></div>
        <div className="chart-plot">
          <svg className="area-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a3e635" stopOpacity=".4" />
                <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[.2, .4, .6, .8].map(t => <line key={t} className="grid-line" x1="0" x2={W} y1={H * t} y2={H * t} />)}
            <path d={area} fill="url(#areaFill)" />
            <polyline className="area-line" points={line} />
            {pts.map((p, i) => <circle key={i} className={i === hi ? 'dot hi' : 'dot'} cx={p[0]} cy={p[1]} r={i === hi ? 5 : 3.5} />)}
          </svg>
          {pts[hi] && <div className="chart-tip" style={{ left: `${(hi / (data.length - 1 || 1)) * 100}%`, top: `${(pts[hi][1] / H) * 100}%` }}>{data[hi]}</div>}
        </div>
      </div>
      <div className="x-labels">{days.map(d => <span key={d}>{d}</span>)}</div>
    </div>
  );
}

function BarChart({ data = [21000, 34000, 42000, 51000, 53420, 52000, 60000], days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }) {
  const max = Math.max(...data, 75000), hi = 4;
  return (
    <div>
      <div className="chart-body">
        <div className="y-axis"><span>₱75K</span><span>₱60K</span><span>₱45K</span><span>₱30K</span><span>₱15K</span><span>₱0</span></div>
        <div className="bar-plot">
          {data.map((v, i) => (
            <div className="bar-col" key={i}>
              {i === hi && <div className="chart-tip" style={{ left: '50%', bottom: `${(v / max) * 100}%`, marginBottom: 10 }}>₱{v.toLocaleString()}</div>}
              <div className={`bar ${i === hi ? 'hi' : ''}`} style={{ height: `${(v / max) * 100}%` }} />
            </div>
          ))}
        </div>
      </div>
      <div className="x-labels">{days.map(d => <span key={d}>{d}</span>)}</div>
    </div>
  );
}

function Donut({ segments, size = 190, thickness = 26, title, sub }) {
  const r = (size - thickness) / 2, C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="donut" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {segments.map((s, i) => {
            const dash = (s.value / 100) * C, off = -acc; acc += dash;
            return <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color}
              strokeWidth={thickness} strokeDasharray={`${dash - 2} ${C - dash + 2}`} strokeDashoffset={off} />;
          })}
        </g>
      </svg>
      {title && <div className="donut-center"><strong>{title}</strong><span>{sub}</span></div>}
    </div>
  );
}

export default function DashboardTab() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/v1/dashboard/summary')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDashboardData(data);
        }
      })
      .catch(err => console.error("Error fetching dashboard summary", err))
      .finally(() => setLoading(false));
  }, []);

  const summary = dashboardData?.summary || {
    total_visitors: 1245,
    visitors_trend: "+12.5%",
    revenue_today: 53420,
    revenue_trend: "+18.7%",
    active_bookings: 67,
    bookings_trend: "+8.3%",
    capacity: { current_visitors: 204, max_capacity: 300, percentage: 68 }
  };

  const revenueSharing = dashboardData?.revenue_sharing || {
    gross_revenue: 53420,
    park_share: 37394,
    park_pct: 70,
    barangay_share: 10684,
    barangay_pct: 20,
    guide_share: 5342,
    guide_pct: 10,
  };

  const services = dashboardData?.service_utilization || [
    { service_code: 'DSVC-002', service_name: 'Standard Open Cottage', price: 600, unit: 'day', total_capacity: 10, available_qty: 4, used_count: 6, image_url: '/src/assets/images/services/cottage.png' },
    { service_code: 'DSVC-003', service_name: 'Resort Table & Chairs Set', price: 250, unit: 'day', total_capacity: 15, available_qty: 5, used_count: 10, image_url: '/src/assets/images/services/table.png' },
    { service_code: 'DSVC-005', service_name: 'Videoke Karaoke System', price: 500, unit: 'day', total_capacity: 4, available_qty: 1, used_count: 3, image_url: '/src/assets/images/services/videoke.png' },
    { service_code: 'DSVC-004', service_name: 'Life Vest / Safety Gear', price: 50, unit: 'head', total_capacity: 30, available_qty: 12, used_count: 18, image_url: '/src/assets/images/services/lifevest.png' },
    { service_code: 'DSVC-006', service_name: 'Kayak / Floating Pad Rental', price: 300, unit: 'hour', total_capacity: 5, available_qty: 2, used_count: 3, image_url: '/src/assets/images/services/floating.png' },
  ];

  const recentBookings = dashboardData?.recent_bookings && dashboardData.recent_bookings.length > 0
    ? dashboardData.recent_bookings
    : [
        { id: 1, client_name: 'Maria Santos', arrival_time: '10:30 AM', pax: 5, status: 'Confirmed', booking_number: 'BK-001' },
        { id: 2, client_name: 'Juan Dela Cruz', arrival_time: '11:15 AM', pax: 8, status: 'Pending', booking_number: 'BK-002' },
        { id: 3, client_name: 'Alex Reyes', arrival_time: '01:45 PM', pax: 4, status: 'Confirmed', booking_number: 'BK-003' },
        { id: 4, client_name: 'Karen Lopez', arrival_time: '02:30 PM', pax: 6, status: 'Cancelled', booking_number: 'BK-004' },
      ];

  return (
    <>
      {/* DUANGON HERO SECTION */}
      <section className="hero">
        <p className="hero-welcome">Welcome Back, Admin! 👋</p>
        <h2>ESCAPE. RELAX.<br /><span>REFRESH.</span></h2>
        <div className="hero-divider"><i />🌿<i /></div>
        <p>Here's what's happening with<br /><strong>Duangon Cold Spring (Bilar, Bohol)</strong> today.</p>
      </section>

      {/* STATS / KPI CARDS */}
      <section className="stats-grid">
        <div className="card stat-card">
          <div className="stat-head"><div className="stat-icon">👥</div><span className="stat-label">Total Visitors</span></div>
          <div className="stat-value">{summary.total_visitors.toLocaleString()}</div>
          <div className="stat-up">↑ {summary.visitors_trend}</div><div className="stat-muted">vs yesterday</div>
        </div>
        <div className="card stat-card">
          <div className="stat-head"><div className="stat-icon">💰</div><span className="stat-label">Revenue Today</span></div>
          <div className="stat-value">₱{summary.revenue_today.toLocaleString()}</div>
          <div className="stat-up">↑ {summary.revenue_trend}</div><div className="stat-muted">vs yesterday</div>
        </div>
        <div className="card stat-card">
          <div className="stat-head"><div className="stat-icon">📅</div><span className="stat-label">Active Bookings</span></div>
          <div className="stat-value">{summary.active_bookings}</div>
          <div className="stat-up">↑ {summary.bookings_trend}</div><div className="stat-muted">vs yesterday</div>
        </div>
        <div className="card stat-card">
          <div className="stat-head"><div className="stat-icon">📊</div><span className="stat-label">Total Capacity</span></div>
          <div className="stat-value">{summary.capacity.percentage}%</div>
          <div className="stat-up" style={{ color: 'var(--text)', fontWeight: 700 }}>{summary.capacity.current_visitors} / {summary.capacity.max_capacity}</div>
          <div className="stat-muted">visitors today</div>
        </div>
      </section>

      {/* CHARTS */}
      <section className="grid-2">
        <div className="card">
          <div className="card-head"><span className="card-title">Visitors Overview</span>
            <select className="select"><option>This Week</option><option>This Month</option></select></div>
          <AreaChart data={dashboardData?.charts?.visitors} days={dashboardData?.charts?.days} />
        </div>
        <div className="card">
          <div className="card-head"><span className="card-title">Revenue Overview</span>
            <select className="select"><option>This Week</option><option>This Month</option></select></div>
          <BarChart data={dashboardData?.charts?.revenue} days={dashboardData?.charts?.days} />
        </div>
      </section>

      {/* LISTS: RECENT BOOKINGS & DUANGON SERVICE UTILIZATION */}
      <section className="grid-2">
        <div className="card">
          <div className="card-head"><span className="card-title">Recent Bookings</span><button className="link">View All</button></div>
          {recentBookings.map((b, idx) => (
            <div className="booking-row" key={b.id || idx}>
              <div className="avatar font-bold bg-emerald-800 text-white flex items-center justify-center rounded-full text-xs" style={{ width: 36, height: 36 }}>
                {b.client_name ? b.client_name.charAt(0) : 'U'}
              </div>
              <div className="b-info">
                <div className="b-name">{b.client_name}</div>
                <div className="b-date">{b.booking_number || 'BK-2026'} • {b.arrival_time || '10:00 AM'}</div>
              </div>
              <span className="b-pax">{b.pax || 1} pax</span>
              <span className={`badge ${(b.status || 'pending').toLowerCase()}`}>{b.status}</span>
            </div>
          ))}
        </div>

        {/* DUANGON SERVICE UTILIZATION (REPLACES TOP DESTINATIONS) */}
        <div className="card">
          <div className="card-head">
            <span className="card-title">Duangon Service Utilization</span>
            <button className="link">Manage Services</button>
          </div>
          <div className="space-y-3 mt-2">
            {services.slice(0, 5).map(s => {
              const utilPct = Math.round((s.used_count / (s.total_capacity || 1)) * 100);
              return (
                <div className="dest-row" key={s.service_code}>
                  <img
                    src={s.image_url || '/src/assets/images/services/cottage.png'}
                    alt={s.service_name}
                    className="w-10 h-10 rounded-xl object-cover border border-emerald-800"
                    onError={(e) => { e.target.src = '/src/assets/images/services/cottage.png'; }}
                  />
                  <div className="dest-info">
                    <div className="dest-name flex justify-between">
                      <span>{s.service_name}</span>
                      <small className="text-emerald-400 font-semibold">₱{s.price}/{s.unit}</small>
                    </div>
                    <div className="progress mt-1">
                      <div className="progress-fill" style={{ width: `${utilPct}%` }} />
                    </div>
                  </div>
                  <div className="dest-num">
                    <strong>{s.used_count} / {s.total_capacity}</strong>
                    <span>in use ({utilPct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BOTTOM: REVENUE SUMMARY & REVENUE SHARING */}
      <section className="grid-bottom">
        <div className="card">
          <div className="card-head"><span className="card-title">Revenue Summary & Distribution</span></div>
          <div className="rev-grid">
            <div>
              <div className="legend-item"><span className="legend-dot" style={{ background: '#a3e635' }} /><div><small>Park Share ({revenueSharing.park_pct}%)</small><strong>₱{parseFloat(revenueSharing.park_share).toLocaleString()}</strong></div></div>
              <div className="legend-item"><span className="legend-dot" style={{ background: '#4d9e50' }} /><div><small>Barangay Share ({revenueSharing.barangay_pct}%)</small><strong>₱{parseFloat(revenueSharing.barangay_share).toLocaleString()}</strong></div></div>
              <div className="legend-item"><span className="legend-dot" style={{ background: '#2dd4bf' }} /><div><small>Guide Association ({revenueSharing.guide_pct}%)</small><strong>₱{parseFloat(revenueSharing.guide_share).toLocaleString()}</strong></div></div>
            </div>
            <Donut title={`₱${parseFloat(revenueSharing.gross_revenue).toLocaleString()}`} sub="Gross Revenue" segments={[
              { value: revenueSharing.park_pct, color: '#a3e635' },
              { value: revenueSharing.barangay_pct, color: '#4d9e50' },
              { value: revenueSharing.guide_pct, color: '#2dd4bf' }
            ]} />
            <div>
              <div className="rev-box"><small>This Week</small><div className="rev-box-row"><strong>₱289,420</strong><em>↑ 15.3%</em></div></div>
              <div className="rev-box"><small>This Month</small><div className="rev-box-row"><strong>₱1,245,680</strong><em>↑ 20.1%</em></div></div>
              <div className="rev-box"><small>This Year</small><div className="rev-box-row"><strong>₱14,856,230</strong><em>↑ 18.6%</em></div></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}