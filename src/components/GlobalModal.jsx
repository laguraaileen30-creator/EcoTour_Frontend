import React from 'react';
import { Check, X, AlertTriangle, AlertCircle, Info, CheckCircle2, Leaf, Sparkles } from 'lucide-react';
import homeBg from '../assets/home.png';
import lightBg from '../assets/light.png';

export default function GlobalModal({ modalState, onClose, onConfirm }) {
  if (!modalState || !modalState.isOpen) return null;

  const {
    title = 'Notification',
    message = '',
    details = '',
    type = 'info', // 'info' | 'success' | 'warning' | 'danger' | 'confirm'
    isConfirm = false,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    theme = 'dark'
  } = modalState;

  const isLight = theme === 'light';
  const currentBg = isLight ? lightBg : homeBg;

  // Icon and badge styling based on type
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle2,
          colorClass: 'text-emerald-400',
          bgClass: 'bg-emerald-500/15 border-emerald-500/30',
          badgeText: 'SUCCESSFUL',
          btnGradient: 'from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400/50'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          colorClass: 'text-amber-400',
          bgClass: 'bg-amber-500/15 border-amber-500/30',
          badgeText: 'ATTENTION REQUIRED',
          btnGradient: 'from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white border-amber-400/50'
        };
      case 'danger':
      case 'error':
        return {
          icon: AlertCircle,
          colorClass: 'text-rose-400',
          bgClass: 'bg-rose-500/15 border-rose-500/30',
          badgeText: 'WARNING / ACTION REQUIRED',
          btnGradient: 'from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white border-rose-400/50'
        };
      default:
        return {
          icon: Info,
          colorClass: 'text-emerald-400',
          bgClass: 'bg-emerald-500/15 border-emerald-500/30',
          badgeText: 'ECOTOUR NOTIFICATION',
          btnGradient: 'from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400/50'
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-hidden animate-in fade-in duration-300">
      {/* 1. DYNAMIC BACKGROUND IMAGE */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
        style={{
          backgroundImage: `url(${currentBg})`,
          filter: isLight ? 'blur(8px) brightness(0.95)' : 'blur(8px) brightness(0.4)',
          transform: 'scale(1.08)',
          opacity: isLight ? 0.3 : 1
        }}
      />

      {/* 2. OVERLAY BACKDROP SHADOW */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 z-[1] transition-opacity cursor-pointer ${
          isLight ? 'bg-[#FAF0E3]/70 backdrop-blur-sm' : 'bg-[#0a1f16]/75 backdrop-blur-sm'
        }`} 
      />

      {/* 3. GLASSMORPHISM CONTAINER BOX (matching LogoutModal) */}
      <div className={`relative z-10 w-full max-w-md backdrop-blur-[20px] rounded-3xl p-6 sm:p-8 text-center space-y-5 overflow-hidden transition-all ${
        isLight 
          ? 'bg-[#F5E4D0] border border-[#B9825B]/30 text-[#29251F] shadow-[0_25px_50px_rgba(185,130,91,0.2)]' 
          : 'bg-[#0d2118]/90 border border-[#87a987]/40 text-white shadow-[0_25px_50px_rgba(0,0,0,0.7)]'
      }`}>
        
        {/* LIGHT REFLECTION ACCENT BARS */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-400 shadow-sm" />
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* CLOSE X BUTTON */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full border transition-all cursor-pointer shadow-md ${
            isLight
              ? 'text-[#5A4A3A] hover:text-[#29251F] bg-[#B9825B]/10 hover:bg-[#B9825B]/20 border-[#B9825B]/30'
              : 'text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border-white/20'
          }`}
          title="Close Dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ICON BADGE CONTAINER */}
        <div className={`relative w-20 h-20 rounded-3xl border backdrop-blur-md flex items-center justify-center mx-auto shadow-2xl ${
          isLight
            ? 'bg-[#EBD2B9] border-[#B9825B]/40 shadow-[#B9825B]/20'
            : 'bg-emerald-950/70 border-[#87a987]/40 shadow-emerald-950/80'
        }`}>
          <IconComponent className={`w-10 h-10 stroke-[2.2] relative z-10 transition-transform ${config.colorClass}`} />
        </div>

        {/* BADGE TAG */}
        <div className="space-y-2">
          <div className={`flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[2.5px] py-1 px-3.5 rounded-full border w-fit mx-auto backdrop-blur-md shadow-sm ${
            isLight
              ? 'bg-[#E5CDB4] border-[#B9825B]/30 text-[#6B4B32]'
              : 'bg-emerald-950/80 border-[#87a987]/30 text-[#87a987]'
          }`}>
            <Leaf className="w-3 h-3 text-emerald-500" />
            {config.badgeText}
          </div>
          
          <h3 className={`text-xl font-black tracking-tight leading-snug drop-shadow-sm ${
            isLight ? 'text-[#29251F]' : 'text-white'
          }`}>
            {title}
          </h3>
          
          {message && (
            <p className={`text-xs font-medium leading-relaxed max-w-sm mx-auto ${
              isLight ? 'text-[#4A3D31]' : 'text-slate-200'
            }`}>
              {message}
            </p>
          )}

          {details && (
            <div className={`text-[11px] p-3 rounded-2xl border text-left font-mono font-medium mt-2 break-words ${
              isLight
                ? 'bg-white/60 border-[#B9825B]/20 text-[#5A4A3A]'
                : 'bg-black/40 border-emerald-900/60 text-slate-300'
            }`}>
              {details}
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        {isConfirm ? (
          <div className="grid grid-cols-2 gap-3.5 pt-2">
            <button
              onClick={onClose}
              className={`py-3 px-4 font-extrabold text-xs rounded-2xl border backdrop-blur-md shadow transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 ${
                isLight
                  ? 'bg-white/50 hover:bg-white/80 text-[#4A3D31] border-[#B9825B]/30'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'
              }`}
            >
              <X className="w-4 h-4" /> {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`py-3 px-4 bg-gradient-to-r ${config.btnGradient} font-black text-xs rounded-2xl border backdrop-blur-md shadow-xl transition-all cursor-pointer active:scale-95 uppercase tracking-wider flex items-center justify-center gap-1.5`}
            >
              <Check className="w-4 h-4" /> {confirmText}
            </button>
          </div>
        ) : (
          <div className="pt-2">
            <button
              onClick={onClose}
              className={`w-full py-3.5 px-4 bg-gradient-to-r ${config.btnGradient} font-black text-xs rounded-2xl border backdrop-blur-md shadow-xl transition-all cursor-pointer active:scale-95 uppercase tracking-wider flex items-center justify-center gap-2`}
            >
              <Check className="w-4 h-4" /> OK (Got It)
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
