import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEcoTour } from '../context/EcoTourContext';

export default function ThemeToggle({
  className = '',
  size = 'md',
  theme: customTheme,
  onToggle: customToggle,
}) {
  const context = useEcoTour() || {};
  const theme = customTheme || context.theme || 'dark';
  const toggleTheme = customToggle || context.toggleTheme || (() => {});
  const isLight = theme === 'light';

  // Config dimensions for size variants
  const config = {
    sm: { trackWidth: 62, trackHeight: 32, thumbSize: 24, translateX: 30, iconSize: 14 },
    md: { trackWidth: 74, trackHeight: 38, thumbSize: 30, translateX: 36, iconSize: 17 },
    lg: { trackWidth: 86, trackHeight: 44, thumbSize: 36, translateX: 42, iconSize: 20 },
  }[size] || { trackWidth: 74, trackHeight: 38, thumbSize: 30, translateX: 36, iconSize: 17 };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 select-none shadow-inner group ${
        isLight
          ? 'bg-[#e3e5e8] border border-gray-300/80 hover:bg-[#dadcdf]'
          : 'bg-[#1e293b]/90 border border-gray-700/60 hover:bg-[#334155]'
      } ${className}`}
      style={{
        width: `${config.trackWidth}px`,
        height: `${config.trackHeight}px`,
      }}
      aria-label="Toggle Light/Dark Theme Mode"
      title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {/* Sliding White Thumb */}
      <motion.div
        className="absolute top-1 left-1 rounded-full bg-white shadow-md flex items-center justify-center pointer-events-none z-10"
        style={{
          width: `${config.thumbSize}px`,
          height: `${config.thumbSize}px`,
        }}
        animate={{
          x: isLight ? 0 : config.translateX,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 32,
        }}
      >
        {/* Icon inside the active white thumb */}
        {isLight ? (
          <Sun size={config.iconSize} className="text-gray-800 font-bold stroke-[2.5]" />
        ) : (
          <Moon size={config.iconSize} className="text-gray-900 font-bold stroke-[2.5]" />
        )}
      </motion.div>

      {/* Track Sun Icon (Left) */}
      <div className="flex-1 flex items-center justify-center z-0">
        <Sun
          size={config.iconSize}
          className={`transition-all duration-200 ${
            isLight ? 'opacity-0' : 'text-gray-400 opacity-70 group-hover:opacity-100'
          }`}
        />
      </div>

      {/* Track Moon Icon (Right) */}
      <div className="flex-1 flex items-center justify-center z-0">
        <Moon
          size={config.iconSize}
          className={`transition-all duration-200 ${
            !isLight ? 'opacity-0' : 'text-gray-500 opacity-70 group-hover:opacity-100'
          }`}
        />
      </div>
    </button>
  );
}
