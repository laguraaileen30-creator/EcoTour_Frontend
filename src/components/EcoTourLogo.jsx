import React from 'react';

export default function EcoTourLogo({ width = 64, height = 40, className = "" }) {
  return (
    <svg 
      viewBox="0 0 64 40" 
      width={width} 
      height={height} 
      className={className} 
      aria-label="EcoTourVista Logo"
    >
      <path 
        d="M8 26 L22 8 L32 20 L40 10 L56 26" 
        stroke="#eafff2" 
        strokeWidth="3" 
        fill="none" 
        strokeLinejoin="round" 
      />
      <path 
        d="M6 31 q6 -4 12 0 t12 0 t12 0 t12 0" 
        stroke="#4ade80" 
        strokeWidth="2.5" 
        fill="none" 
      />
      <path 
        d="M10 36 q6 -4 12 0 t12 0 t12 0" 
        stroke="#2dd4bf" 
        strokeWidth="2.5" 
        fill="none" 
      />
    </svg>
  );
}
