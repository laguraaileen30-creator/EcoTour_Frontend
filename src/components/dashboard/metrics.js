// Date helpers for dashboard charts (resort runs on Asia/Manila time)
export const phDayKey = (value) => {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
};

// The last `n` days (oldest first) as { key: 'YYYY-MM-DD', label: 'Mon' }
export const lastDays = (n = 7) => {
  const out = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    out.push({
      key: phDayKey(d),
      label: d.toLocaleDateString('en-US', { timeZone: 'Asia/Manila', weekday: 'short' }),
    });
  }
  return out;
};

// Sum valueFn(item) per day for the given days
export const seriesByDay = (days, items, dateFn, valueFn = () => 1) => {
  const map = new Map(days.map((d) => [d.key, 0]));
  (items || []).forEach((it) => {
    const key = phDayKey(dateFn(it));
    if (map.has(key)) map.set(key, map.get(key) + (Number(valueFn(it)) || 0));
  });
  return days.map((d) => map.get(d.key));
};

export const bookingState = (status) => {
  const s = String(status || '').toLowerCase();
  if (s.includes('cancel') || s.includes('void') || s.includes('reject')) return 'cancelled';
  if (s.includes('complete') || s.includes('checked out') || s.includes('done')) return 'completed';
  if (s.includes('using') || s.includes('checked in') || s.includes('active') || s.includes('in resort')) return 'in_resort';
  if (s.includes('paid') || s.includes('confirm') || s.includes('approved')) return 'paid';
  return 'pending';
};
