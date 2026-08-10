import React from 'react';
import { LogOut, X, Check, Leaf } from 'lucide-react';
import homeBg from '../assets/home.png';
import lightBg from '../assets/light.png';
import { useEcoTour } from '../context/EcoTourContext';

export default function LogoutModal({ isOpen, onClose, onConfirm, userName, userRole, userAvatar }) {
  const { theme } = useEcoTour();
  if (!isOpen) return null;

  const currentBg = theme === "light" ? lightBg : homeBg;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden animate-in fade-in duration-300">
      
      {/* 1. DYNAMIC BACKGROUND IMAGE */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
        style={{
          backgroundImage: `url(${currentBg})`,
          filter: theme === "light" ? 'blur(8px) brightness(0.95)' : 'blur(8px) brightness(0.4)',
          transform: 'scale(1.08)',
          opacity: theme === "light" ? 0.3 : 1
        }}
      />

      {/* 2. OVERLAY BACKDROP SHADOW */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 z-[1] transition-opacity ${theme === "light" ? "bg-[#FAF0E3]/70 backdrop-blur-sm" : "bg-[#0a1f16]/60 backdrop-blur-sm"}`} 
      />

      {/* 3. GLASSMORPHISM AUTH-CARD MODAL CONTAINER */}
      <div className={`relative z-10 w-full max-w-md backdrop-blur-[20px] rounded-3xl p-6 sm:p-8 text-center space-y-6 overflow-hidden transition-all ${
        theme === "light" 
          ? "bg-[#F5E4D0] border border-[#B9825B]/30 text-[#29251F] shadow-[0_25px_50px_rgba(185,130,91,0.2)]" 
          : "bg-[#0d2118]/80 border border-[#87a987]/40 text-white shadow-[0_25px_50px_rgba(0,0,0,0.6)]"
      }`}>
        
        {/* LIGHT REFLECTION ACCENT BARS */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-400 shadow-sm" />
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* CLOSE X BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 transition-all cursor-pointer shadow-md"
          title="Close Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ECO LEAF & LOGOUT ICON BADGE */}
        <div className="relative w-20 h-20 rounded-3xl bg-emerald-950/60 border border-[#87a987]/40 backdrop-blur-md text-rose-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-950/80 group">
          <div className="absolute inset-0 rounded-3xl bg-rose-500/10 animate-ping" />
          <LogOut className="w-10 h-10 text-rose-400 stroke-[2.5] relative z-10 transition-transform group-hover:scale-110" />
        </div>

        {/* QUESTION TITLE & SUBTITLE */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-[#87a987] text-[10px] font-extrabold uppercase tracking-[3px] bg-emerald-950/80 py-1 px-3.5 rounded-full border border-[#87a987]/30 w-fit mx-auto backdrop-blur-md shadow-sm">
            <Leaf className="w-3 h-3 text-emerald-400" /> LOGOUT CONFIRMATION
          </div>
          
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug drop-shadow-md">
            Are you sure you want to logout?
          </h3>
          
          <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-xs mx-auto drop-shadow-sm">
            Your active session will be ended safely and you will return to the secure login page.
          </p>
        </div>

        {/* USER PROFILE GLASS CARD */}
        <div className="bg-white/5 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl flex items-center gap-3 text-left shadow-inner">
          <img
            src={userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400/60 shrink-0 shadow-md"
          />
          <div className="flex-1 min-w-0">
            <strong className="text-xs text-white font-extrabold block truncate drop-shadow-sm">
              {userName || 'Active User Account'}
            </strong>
            <span className="text-[10px] text-[#87a987] font-bold uppercase tracking-wider block truncate">
              {userRole || 'Logged In Session'}
            </span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_10px_#34d399]" />
        </div>

        {/* YES / NO GLASSMORPHISM ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-3.5 pt-1">
          {/* NO BUTTON */}
          <button
            onClick={onClose}
            className="py-3 px-4 bg-white/10 hover:bg-white/20 text-slate-200 font-extrabold text-xs rounded-2xl border border-white/20 backdrop-blur-md shadow-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4 text-slate-300" /> NO (Stay)
          </button>
          
          {/* YES BUTTON */}
          <button
            onClick={onConfirm}
            className="py-3 px-4 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs rounded-2xl border border-rose-400/50 backdrop-blur-md shadow-xl shadow-rose-950/90 transition-all cursor-pointer active:scale-95 uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 text-white" /> YES (Logout)
          </button>
        </div>

      </div>
    </div>
  );
}
