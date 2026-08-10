import React, { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Camera, Edit, Award, ShieldCheck, CheckCircle2,
  Key, Eye, EyeOff, Lock
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';

export default function ClientProfileTab() {
  const { currentUser } = useEcoTour() || {};
  const [activeTab, setActiveTab] = useState('personal');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const userName = currentUser?.name || `${currentUser?.fname || ''} ${currentUser?.lname || ''}`.trim() || 'Client User';
  const userEmail = currentUser?.email || 'client@ecotour.com';
  const userPhone = currentUser?.contact_no || currentUser?.phone || '+63 9XX XXX XXXX';
  const userAddress = currentUser?.address || 'Bilar, Bohol';

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-white">
      
      {/* PAGE HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <User className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider block">Welcome back,</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            MY PROFILE 🌿
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage your personal information and account settings.
          </p>
        </div>
      </div>

      {/* TOP ROW: PROFILE BANNER CARD */}
      <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <img
              src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80"}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/30 shadow-md"
            />
            <button className="absolute bottom-0 right-0 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full cursor-pointer shadow-md transition-all">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-white">{userName}</h3>
              <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold rounded-full">
                Explorer
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono">{userEmail}</p>
            <p className="text-xs text-slate-400">{userPhone}</p>
            <p className="text-[11px] text-slate-400">{userAddress}</p>
          </div>
        </div>

        {/* LOYALTY POINTS CARD */}
        <div className="p-4 rounded-xl bg-[#04150e] border border-emerald-800/40 flex items-center gap-4 shrink-0">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Loyalty Points</span>
            <strong className="text-xl font-bold text-white block">320 pts</strong>
            <button className="text-emerald-400 text-[11px] font-bold hover:underline cursor-pointer">View Rewards →</button>
          </div>
        </div>
      </div>

      {/* FILTER PILLS */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'personal', label: 'Personal Information' },
          { id: 'account', label: 'Account Information' },
          { id: 'password', label: 'Change Password' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
              activeTab === tab.id
                ? 'bg-[#22c55e] text-white shadow-md shadow-emerald-950/60'
                : 'bg-[#0c1f16] text-slate-300 hover:bg-emerald-900/30 border border-emerald-500/15'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: FORMS (2 SPANS) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PERSONAL INFORMATION */}
          {activeTab === 'personal' && (
            <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-6 space-y-5 shadow-xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div>
                  <h4 className="font-bold text-white text-base uppercase tracking-wider">PERSONAL INFORMATION</h4>
                  <p className="text-xs text-slate-400">Update your personal details.</p>
                </div>
                <button className="px-4 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                  <Edit className="w-3.5 h-3.5" /> Edit Information
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-[#04150e]">
                  <span className="text-slate-400 block text-[10px]">Full Name</span>
                  <strong className="text-white text-xs">{userName}</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#04150e]">
                  <span className="text-slate-400 block text-[10px]">Email Address</span>
                  <strong className="text-white text-xs font-mono">{userEmail}</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#04150e]">
                  <span className="text-slate-400 block text-[10px]">Phone Number</span>
                  <strong className="text-white text-xs font-mono">{userPhone}</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#04150e]">
                  <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                  <strong className="text-white text-xs">{currentUser?.birthdate || currentUser?.birthday || 'N/A'}</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#04150e]">
                  <span className="text-slate-400 block text-[10px]">Gender</span>
                  <strong className="text-white text-xs">{currentUser?.gender || 'N/A'}</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#04150e]">
                  <span className="text-slate-400 block text-[10px]">Address</span>
                  <strong className="text-white text-xs">{userAddress}</strong>
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNT INFORMATION */}
          {activeTab === 'account' && (
            <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-6 space-y-5 shadow-xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div>
                  <h4 className="font-bold text-white text-base uppercase tracking-wider">ACCOUNT INFORMATION</h4>
                  <p className="text-xs text-slate-400">Manage your account settings and preferences.</p>
                </div>
                <button className="px-4 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                  <Edit className="w-3.5 h-3.5" /> Edit Information
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-[#04150e]">
                  <span className="text-slate-400 block text-[10px]">Username</span>
                  <strong className="text-white text-xs font-mono">{currentUser?.username || userEmail.split('@')[0]}</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#04150e] flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email Address</span>
                    <strong className="text-white text-xs font-mono">{userEmail}</strong>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#04150e]">
                  <span className="text-slate-400 block text-[10px]">Account Status</span>
                  <strong className="text-emerald-400 font-bold text-xs">Active</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#04150e]">
                  <span className="text-slate-400 block text-[10px]">Two-Factor Authentication</span>
                  <strong className="text-emerald-400 font-bold text-xs">Enabled</strong>
                </div>
              </div>
            </div>
          )}

          {/* CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-6 space-y-4 shadow-xl">
              <div className="border-b border-white/5 pb-3">
                <h4 className="font-bold text-white text-base uppercase tracking-wider">CHANGE PASSWORD</h4>
                <p className="text-xs text-slate-400">Update your password regularly to keep your account secure.</p>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                  <input type="password" placeholder="Enter current password" className="w-full bg-[#04150e] border border-emerald-800/60 rounded-xl px-3.5 py-2 text-xs text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                  <input type="password" placeholder="Enter new password" className="w-full bg-[#04150e] border border-emerald-800/60 rounded-xl px-3.5 py-2 text-xs text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                  <input type="password" placeholder="Confirm new password" className="w-full bg-[#04150e] border border-emerald-800/60 rounded-xl px-3.5 py-2 text-xs text-white outline-none" />
                </div>
                <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer">
                  Update Password
                </button>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PROFILE SUMMARY & QUICK ACTIONS */}
        <div className="space-y-6">
          
          {/* PROFILE SUMMARY */}
          <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider border-b border-white/5 pb-3">PROFILE SUMMARY</h4>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h5 className="font-bold text-white text-sm">Explorer</h5>
              <p className="text-xs text-slate-400">You're doing great!</p>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-white/5">
              <div className="flex justify-between"><span className="text-slate-400">Total Reservations</span><strong className="text-white">12</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Places Visited</span><strong className="text-white">8</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Loyalty Points</span><strong className="text-emerald-400 font-bold">320 pts</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Member Since</span><strong className="text-white">May 15, 2024</strong></div>
            </div>

            <button className="w-full py-2 bg-[#04150e] hover:bg-emerald-900/40 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-800/40 cursor-pointer">
              View My Activity →
            </button>
          </div>

          {/* QUICK ACTIONS */}
          <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-3 shadow-xl text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider border-b border-white/5 pb-3">QUICK ACTIONS</h4>
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-[#04150e] flex items-center gap-3 cursor-pointer hover:border-emerald-500/40">
                <Edit className="w-4 h-4 text-emerald-400" />
                <div><h5 className="font-bold text-white text-xs">Update Personal Information</h5><p className="text-[10px] text-slate-400">Edit your personal details</p></div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#04150e] flex items-center gap-3 cursor-pointer hover:border-emerald-500/40">
                <Lock className="w-4 h-4 text-emerald-400" />
                <div><h5 className="font-bold text-white text-xs">Change Password</h5><p className="text-[10px] text-slate-400">Update your password</p></div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
