/**
 * Philippine Time (PHT, UTC+8 / Asia/Manila) Date & Time Utility
 * Ensures consistent, real-time Philippine calendar date (e.g. August 24, 2026 / 2026-08-24)
 * across Admin, Staff, and Client portals.
 */

export const getPhilippineDate = (baseDate = new Date()) => {
  const d = new Date(baseDate);
  // Get date according to Asia/Manila timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(d);
  const map = {};
  parts.forEach(p => { map[p.type] = p.value; });
  
  return new Date(
    parseInt(map.year, 10),
    parseInt(map.month, 10) - 1,
    parseInt(map.day, 10),
    parseInt(map.hour || 0, 10),
    parseInt(map.minute || 0, 10),
    parseInt(map.second || 0, 10)
  );
};

export const getPhilippineDateStr = (baseDate = new Date()) => {
  const d = new Date(baseDate);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(d);
  const map = {};
  parts.forEach(p => { map[p.type] = p.value; });
  return `${map.year}-${map.month}-${map.day}`;
};

export const getPhilippineTimeStr = (baseDate = new Date()) => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(new Date(baseDate));
};

export const getPhilippineFormattedDate = (baseDate = new Date()) => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(baseDate));
};

export const isSamePhilippineDate = (dateA, dateB = getPhilippineDateStr()) => {
  if (!dateA) return false;
  const strA = String(dateA).split('T')[0].trim();
  const strB = String(dateB).split('T')[0].trim();
  return strA === strB;
};
