import React from 'react';

export default function GlassCard({ children, className = '', hover = true, ...props }) {
  return (
    <div
      className={`card ${hover ? 'hover:border-emerald-400/40 hover:-translate-y-0.5' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
