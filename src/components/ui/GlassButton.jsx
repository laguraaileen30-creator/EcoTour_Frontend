import React from 'react';

export default function GlassButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const baseStyles = 'font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 border';
  
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 border-emerald-400/30 shadow-md hover:shadow-emerald-500/20',
    lime: 'bg-lime-400 hover:bg-lime-300 text-slate-950 border-lime-300/40 shadow-md hover:shadow-lime-400/20',
    secondary: 'bg-slate-900/80 hover:bg-slate-800 text-emerald-300 border-emerald-500/30',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/40',
    ghost: 'bg-transparent hover:bg-emerald-500/10 text-emerald-300 border-transparent',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-xs px-4 py-2.5',
    lg: 'text-sm px-5 py-3',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
