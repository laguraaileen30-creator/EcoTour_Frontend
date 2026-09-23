import React, { useId, useMemo } from 'react';
import { useEcoTour } from '../context/EcoTourContext';
import { LOGO_PALETTES, logoArt } from './ecoTourLogoArt';

/**
 * EcoTourVista emblem — adapts to light / dark mode automatically.
 * Props: size (px), variant ('auto' | 'light' | 'dark'), showGlow.
 * width/height are still accepted for backwards compatibility (the emblem is square).
 */
export default function EcoTourLogo({ size, width, height, variant = 'auto', showGlow = true, className = '', title = 'EcoTourVista' }) {
  const eco = useEcoTour() || {};
  const mode = variant === 'auto' ? (eco.theme === 'light' ? 'light' : 'dark') : variant;
  const palette = LOGO_PALETTES[mode];
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const px = size || Math.max(width || 0, height || 0) || 40;
  // Static, trusted artwork (no user input) — rendered from the shared source used by the favicon too
  const markup = useMemo(() => `<title>${title}</title>${logoArt(palette, `${mode}${uid}`)}`, [palette, mode, uid, title]);

  return (
    <svg
      viewBox="0 0 64 64"
      width={px}
      height={px}
      className={className}
      role="img"
      aria-label={`${title} logo`}
      style={showGlow ? { filter: `drop-shadow(0 2px 6px ${palette.shadow})`, flexShrink: 0 } : { flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
