// Single source of the EcoTourVista emblem artwork (used by <EcoTourLogo/> and by public/favicon.svg).
// Rounded Bohol hills with tree lines, a cold-spring waterfall with mist feeding a rippling pool,
// a glowing morning sun and a leaf, framed in a gradient ring.

export const LOGO_PALETTES = {
  light: {
    ringFrom: '#047857', ringTo: '#0f766e', ringInner: '#34d399',
    bgInner: '#f7fef9', bgOuter: '#d1fae5',
    sunFrom: '#fef3c7', sunTo: '#f59e0b', sunGlow: '#fcd34d',
    hill1Top: '#a7f3d0', hill1Bot: '#6ee7b7',
    hill2Top: '#4ade80', hill2Bot: '#16a34a',
    hill3Top: '#10b981', hill3Bot: '#047857',
    trees: '#065f46',
    waterTop: '#e0f2fe', waterBot: '#0ea5e9', ripple: '#0369a1', mist: '#ffffff',
    leafFrom: '#34d399', leafTo: '#065f46', vein: '#ecfdf5',
    shadow: 'rgba(6,95,70,0.28)',
  },
  dark: {
    ringFrom: '#86efac', ringTo: '#2dd4bf', ringInner: '#10b981',
    bgInner: '#0f4a33', bgOuter: '#03160e',
    sunFrom: '#fffbeb', sunTo: '#fbbf24', sunGlow: '#fde68a',
    hill1Top: '#1f7a4d', hill1Bot: '#14532d',
    hill2Top: '#22a05a', hill2Bot: '#166534',
    hill3Top: '#34d399', hill3Bot: '#15803d',
    trees: '#052e16',
    waterTop: '#f0f9ff', waterBot: '#38bdf8', ripple: '#bae6fd', mist: '#e0f2fe',
    leafFrom: '#bbf7d0', leafTo: '#22c55e', vein: '#052e16',
    shadow: 'rgba(74,222,128,0.4)',
  },
};

// Returns the inner SVG markup (everything inside <svg viewBox="0 0 64 64">). `uid` keeps gradient ids unique per instance.
export const logoArt = (c, uid = 'etv') => {
  const id = (n) => `${n}-${uid}`;
  const lg = (n, x2, y2, stops) => `<linearGradient id="${id(n)}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, col, op = 1]) => `<stop offset="${o}" stop-color="${col}" stop-opacity="${op}"/>`).join('')}</linearGradient>`;
  const rg = (n, cx, cy, r, stops) => `<radialGradient id="${id(n)}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, col, op = 1]) => `<stop offset="${o}" stop-color="${col}" stop-opacity="${op}"/>`).join('')}</radialGradient>`;
  // small two-tier pine trees along the ridges
  const f = (n) => Math.round(n * 100) / 100;
  const tree = (x, y, s) =>
    `<path d="M${f(x)} ${f(y - 4 * s)} L${f(x + 1.3 * s)} ${f(y - 2 * s)} L${f(x + 0.7 * s)} ${f(y - 2 * s)} L${f(x + 1.7 * s)} ${f(y - 0.4 * s)} L${f(x + 0.25 * s)} ${f(y - 0.4 * s)} L${f(x + 0.25 * s)} ${f(y + 0.5 * s)} L${f(x - 0.25 * s)} ${f(y + 0.5 * s)} L${f(x - 0.25 * s)} ${f(y - 0.4 * s)} L${f(x - 1.7 * s)} ${f(y - 0.4 * s)} L${f(x - 0.7 * s)} ${f(y - 2 * s)} L${f(x - 1.3 * s)} ${f(y - 2 * s)} Z"/>`;

  return `
<defs>
  ${lg('ring', 1, 1, [[0, c.ringFrom], [1, c.ringTo]])}
  ${rg('bg', 0.5, 0.32, 0.75, [[0, c.bgInner], [1, c.bgOuter]])}
  ${rg('sun', 0.4, 0.38, 0.62, [[0, c.sunFrom], [1, c.sunTo]])}
  ${rg('glow', 0.5, 0.5, 0.5, [[0, c.sunGlow, 0.55], [1, c.sunGlow, 0]])}
  ${lg('h1', 0, 1, [[0, c.hill1Top], [1, c.hill1Bot]])}
  ${lg('h2', 0, 1, [[0, c.hill2Top], [1, c.hill2Bot]])}
  ${lg('h3', 0, 1, [[0, c.hill3Top], [1, c.hill3Bot]])}
  ${lg('fall', 0, 1, [[0, c.waterTop, 0.95], [1, c.waterBot, 0.9]])}
  ${lg('pool', 0, 1, [[0, c.waterBot], [1, c.ripple]])}
  ${lg('leaf', 1, 1, [[0, c.leafFrom], [1, c.leafTo]])}
  <clipPath id="${id('clip')}"><circle cx="32" cy="32" r="27.2"/></clipPath>
</defs>

<circle cx="32" cy="32" r="30.4" fill="url(#${id('bg')})"/>

<g clip-path="url(#${id('clip')})">
  <circle cx="41.5" cy="19.5" r="11" fill="url(#${id('glow')})"/>
  <circle cx="41.5" cy="19.5" r="5.4" fill="url(#${id('sun')})"/>

  <path d="M1 39 C6 31.5 11.5 31 16.5 36.5 C20.5 29.5 27.5 28.6 32 35.5 C36 29.4 43.5 29 48 35.5 C52.5 30.5 59 30.8 66 38 L66 66 L1 66 Z" fill="url(#${id('h1')})"/>
  <g fill="${c.trees}" opacity="0.55">${tree(9.5, 34.6, 0.8)}${tree(12, 33.8, 1)}${tree(24.8, 31.6, 0.9)}${tree(27.4, 31.2, 1.1)}${tree(44.2, 32, 1)}${tree(46.6, 32.8, 0.8)}${tree(56.5, 33.8, 0.9)}</g>

  <path d="M-3 46 C4 36 14 34.5 21.5 41.5 L24 43 L24 66 L-3 66 Z" fill="url(#${id('h2')})"/>
  <path d="M29.5 43.2 L32 41.5 C38 35.5 51 34.8 67 44 L67 66 L29.5 66 Z" fill="url(#${id('h3')})"/>
  <g fill="${c.trees}" opacity="0.6">${tree(7, 40.4, 1)}${tree(10, 39.2, 1.2)}${tree(14.5, 38.6, 0.9)}${tree(40, 38.2, 1.1)}${tree(43, 37.6, 1.3)}${tree(52, 38.4, 1)}</g>

  <path d="M24.2 41.8 C25.4 41 27.9 41 29.3 41.8 C29.2 45 29.9 48.5 31.2 51.2 L22.3 51.2 C23.7 48.5 24.4 45 24.2 41.8 Z" fill="url(#${id('fall')})"/>
  <path d="M25.6 42.6 C25.9 45.5 25.4 48.5 24.3 50.6 M27.3 42.4 C27.4 45.4 27.6 48.3 28.4 50.7 M28.5 42.6 C28.6 45 29.2 47.6 30 49.8" stroke="#ffffff" stroke-width="0.55" stroke-linecap="round" fill="none" opacity="0.75"/>

  <path d="M2 52.4 C12 49.6 21 50.6 32 50.6 C43 50.6 52 49.6 62 52.4 L62 66 L2 66 Z" fill="url(#${id('pool')})"/>
  <ellipse cx="26.8" cy="51.4" rx="6.8" ry="1.9" fill="${c.mist}" opacity="0.75"/>
  <ellipse cx="26.8" cy="50.6" rx="3.6" ry="1.4" fill="${c.mist}" opacity="0.6"/>
  <path d="M11 55.6 q3.5 -1.5 7 0 t7 0 t7 0 t7 0 t7 0 t7 0" stroke="${c.mist}" stroke-width="0.9" fill="none" stroke-linecap="round" opacity="0.7"/>
  <path d="M16 59.2 q3.5 -1.3 7 0 t7 0 t7 0 t7 0 t7 0" stroke="${c.mist}" stroke-width="0.75" fill="none" stroke-linecap="round" opacity="0.45"/>
  <path d="M36 53.4 L44 53.4" stroke="${c.sunFrom}" stroke-width="0.8" stroke-linecap="round" opacity="0.55"/>
</g>

<circle cx="32" cy="32" r="30.4" fill="none" stroke="url(#${id('ring')})" stroke-width="2.2"/>
<circle cx="32" cy="32" r="27.6" fill="none" stroke="${c.ringInner}" stroke-width="0.5" opacity="0.6"/>

<g transform="translate(48.5 45.5) rotate(-38)">
  <path d="M0 -9.5 C6.4 -5.4 6.4 5.4 0 9.5 C-6.4 5.4 -6.4 -5.4 0 -9.5 Z" fill="url(#${id('leaf')})" stroke="${c.vein}" stroke-width="0.7"/>
  <path d="M0 -7.8 L0 8.4" stroke="${c.vein}" stroke-width="0.7" stroke-linecap="round"/>
  <path d="M0 -3.4 L2.9 -5.6 M0 0 L-2.9 -2.2 M0 3.4 L2.7 1.4 M0 -0.2 L2.6 -2.1 M0 3.2 L-2.5 1.3" stroke="${c.vein}" stroke-width="0.45" stroke-linecap="round"/>
</g>`;
};

export const logoSvg = (mode = 'dark', size = 64) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">${logoArt(LOGO_PALETTES[mode], mode)}</svg>`;
