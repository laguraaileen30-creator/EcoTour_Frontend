import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import '../../styles/glass-dashboard.css';

// Shared building blocks for the glass dashboards (Admin / Staff / Client)

export function DashboardShell({ children }) {
  return (
    <div className="gd">
      <div className="gd-ambient" aria-hidden="true"><span /><span /><span /></div>
      {children}
    </div>
  );
}

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export const phDate = (d) => d.toLocaleDateString('en-US', { timeZone: 'Asia/Manila', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
export const phTime = (d) => d.toLocaleTimeString('en-US', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit' });
export const greeting = (d) => {
  const h = Number(d.toLocaleString('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', hour12: false }));
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};
export const peso = (n, dp = 0) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: dp, maximumFractionDigits: dp || 2 })}`;

export function GlassHero({ image, eyebrow, title, highlight, subtitle, actions, aside }) {
  return (
    <section className="gd-glass gd-hero gd-anim" style={image ? { backgroundImage: `url(${image})` } : undefined}>
      <div>
        {eyebrow && <span className="gd-eyebrow"><span className="dot" />{eyebrow}</span>}
        <h1>{title} {highlight && <span className="hl">{highlight}</span>}</h1>
        {subtitle && <p className="sub">{subtitle}</p>}
        {actions && <div className="gd-hero-actions">{actions}</div>}
      </div>
      {aside && <div className="gd-hero-aside">{aside}</div>}
    </section>
  );
}

export function Glance({ icon: Icon, label, value, tone = 'emerald' }) {
  return (
    <div className={`gd-glass gd-glance tone-${tone}`}>
      <span className="ic gd-chip"><Icon size={18} /></span>
      <div><small>{label}</small><strong>{value}</strong></div>
    </div>
  );
}

export function Sparkline({ data = [], tone = 'emerald', height = 34 }) {
  if (!data.length) return null;
  const w = 120;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => [(i / Math.max(1, data.length - 1)) * w, height - (v / max) * (height - 6) - 3]);
  const line = pts.map((p) => p.join(',')).join(' ');
  const id = `spark-${tone}`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className={`tone-${tone}`} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--tone-color)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--tone-color)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M0,${height} L${line.replace(/ /g, ' L')} L${w},${height} Z`} fill={`url(#${id})`} />
      <polyline points={line} fill="none" stroke="var(--tone-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function KpiCard({ icon: Icon, label, value, sub, tone = 'emerald', onClick, progress, spark, badge }) {
  return (
    <div className={`gd-glass gd-kpi tone-${tone} ${onClick ? 'clickable' : ''}`} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}>
      <div className="gd-kpi-top">
        <span className="gd-kpi-label">{label}</span>
        <span className="gd-chip"><Icon size={19} /></span>
      </div>
      <div className="gd-kpi-value">{value}</div>
      {typeof progress === 'number' && <div className="gd-progress"><i style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} /></div>}
      {spark && <Sparkline data={spark} tone={tone} />}
      {(sub || badge) && (
        <div className="gd-kpi-sub">
          <span>{sub}</span>
          {badge}
          {onClick && !badge && <ArrowRight size={14} />}
        </div>
      )}
    </div>
  );
}

export function Panel({ icon: Icon, title, action, children, className = '' }) {
  return (
    <section className={`gd-glass gd-panel gd-anim ${className}`}>
      {(title || action) && (
        <div className="gd-panel-head">
          <div className="gd-panel-title">{Icon && <span className="ic"><Icon size={15} /></span>}{title}</div>
          {action && <button type="button" className="gd-link" onClick={action.onClick}>{action.label} <ArrowRight size={13} /></button>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Row({ initial, tone, title, sub, amount, pill }) {
  return (
    <div className="gd-row">
      <span className={`gd-avatar ${tone ? `tone-${tone}` : ''}`}>{(initial || title || '?').charAt(0).toUpperCase()}</span>
      <div className="gd-row-main"><strong>{title}</strong>{sub && <small>{sub}</small>}</div>
      {(amount !== undefined || pill) && (
        <div className="gd-row-end">
          {amount !== undefined && <span className="gd-amount">{amount}</span>}
          {pill}
        </div>
      )}
    </div>
  );
}

export const statusPill = (status) => {
  const s = String(status || 'Pending').toLowerCase();
  const cls = s.includes('cancel') || s.includes('void') || s.includes('reject') ? 'bad'
    : s.includes('using') || s.includes('check') || s.includes('active') || s.includes('in resort') ? 'info'
      : s.includes('paid') || s.includes('complete') || s.includes('confirm') || s.includes('approved') ? 'ok'
        : 'warn';
  return <span className={`gd-pill ${cls}`}>{status || 'Pending'}</span>;
};

export function QuickActions({ items }) {
  return (
    <div className="gd-actions">
      {items.map(({ icon: Icon, label, sub, onClick, tone = 'emerald' }) => (
        <button key={label} type="button" className={`gd-action tone-${tone}`} onClick={onClick}>
          <span className="gd-chip"><Icon size={17} /></span>
          <strong>{label}</strong>
          {sub && <small>{sub}</small>}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action, tone = 'emerald' }) {
  return (
    <div className={`gd-empty tone-${tone}`}>
      <span className="gd-chip"><Icon size={22} /></span>
      <strong>{title}</strong>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function WeekBars({ data = [], labels = [], todayIndex = -1, tone = 'emerald', format = (v) => v }) {
  const max = Math.max(...data, 1);
  return (
    <div className={`gd-bars tone-${tone}`}>
      {data.map((v, i) => (
        <div className="gd-bar" key={labels[i] || i} title={`${labels[i]}: ${format(v)}`}>
          <b>{v > 0 ? format(v) : ''}</b>
          <i className={i === todayIndex ? 'today' : ''} style={{ height: `${Math.max(3, (v / max) * 100)}%` }} />
          <span>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export function Donut({ segments, size = 150, thickness = 20, center, sub }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--g-soft)" strokeWidth={thickness} />
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {segments.map((s, i) => {
            const dash = (s.value / total) * C;
            const off = -acc;
            acc += dash;
            return s.value > 0 ? (
              <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
                strokeDasharray={`${Math.max(0, dash - 2)} ${C}`} strokeDashoffset={off} strokeLinecap="round" />
            ) : null;
          })}
        </g>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <strong style={{ fontSize: 16, fontWeight: 900 }}>{center}</strong>
        {sub && <span className="gd-muted" style={{ fontSize: 10.5, fontWeight: 700 }}>{sub}</span>}
      </div>
    </div>
  );
}
