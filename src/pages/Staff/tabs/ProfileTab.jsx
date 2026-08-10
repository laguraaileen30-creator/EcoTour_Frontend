import React, { useState } from 'react';
import {
  User, Lock, Key, Calendar, Clock, Edit, ShieldCheck, Eye, EyeOff,
  HelpCircle, AlertCircle, BookOpen, Check, Camera
} from 'lucide-react';

import { useEcoTour } from '../../../context/EcoTourContext';

export default function StaffProfileTab() {
  const { currentUser } = useEcoTour() || {};
  const userName = currentUser?.name || `${currentUser?.fname || ''} ${currentUser?.lname || ''}`.trim() || 'Staff User';
  const userEmail = currentUser?.email || 'staff@ecotour.com';
  const userCode = currentUser?.user_number || currentUser?.id || 'ETV-2024-001';

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setMsg('Please fill out all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg('New passwords do not match!');
      return;
    }
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      setMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMsg(''), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-white">
      
      {/* PAGE HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage your personal information, account settings, and security.
          </p>
        </div>
      </div>

      {/* HEADER BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* MAIN PROFILE CARD */}
        <div className="lg:col-span-2 rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-6 flex items-center gap-5 shadow-xl">
          <div className="relative shrink-0">
            <img
              src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80"}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/30 shadow-md"
            />
            <button className="absolute bottom-0 right-0 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full cursor-pointer shadow-md transition-all">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-white truncate">{userName}</h3>
              <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold rounded-full">
                Staff Member
              </span>
            </div>
            <p className="text-xs text-slate-400">{currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'Staff Member'}</p>
            <p className="text-xs text-slate-300 font-mono">{userEmail}</p>
            <p className="text-[11px] text-slate-400 font-mono pt-1">ID Number: {userCode}</p>
          </div>
        </div>

        {/* MEMBER SINCE CARD */}
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-6 flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Member Since</span>
            <p className="text-lg font-bold text-white mt-0.5">May 15, 2024</p>
            <span className="text-xs text-slate-400">1 year, 0 months</span>
          </div>
        </div>

        {/* LAST LOGIN CARD */}
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-6 flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Last Login</span>
            <p className="text-lg font-bold text-white mt-0.5">May 25, 2024</p>
            <span className="text-xs text-slate-400">08:45 AM</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: PERSONAL INFORMATION */}
      <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-6 space-y-5 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">PERSONAL INFORMATION</h3>
          </div>
          <button className="px-4 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <Edit className="w-3.5 h-3.5" /> Edit Information
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* FIELDS GRID (2 COLS) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Full Name</span>
              <p className="text-white font-bold text-sm mt-0.5">Juan Dela Cruz</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Email Address</span>
              <p className="text-white font-mono text-sm mt-0.5">juandelacruz@ecotourvista.com</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Date of Birth</span>
              <p className="text-white font-medium text-sm mt-0.5">March 15, 1990</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Civil Status</span>
              <p className="text-white font-medium text-sm mt-0.5">Single</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Gender</span>
              <p className="text-white font-medium text-sm mt-0.5">Male</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Nationality</span>
              <p className="text-white font-medium text-sm mt-0.5">Filipino</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Contact Number</span>
              <p className="text-white font-mono font-medium text-sm mt-0.5">+63 912 345 6789</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Role / Position</span>
              <p className="text-white font-medium text-sm mt-0.5">Super Administrator</p>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-400 block text-[11px]">Address</span>
              <p className="text-white font-medium text-sm mt-0.5">
                123 Cold Spring Road, Brgy. Matutinao, Bansalan, Davao del Sur, Philippines
              </p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Department</span>
              <p className="text-white font-medium text-sm mt-0.5">Administration</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Emergency Contact</span>
              <p className="text-white font-medium text-xs mt-0.5">Maria Dela Cruz (Sister)</p>
              <p className="text-emerald-400 font-mono text-xs">+63 917 654 3210</p>
            </div>
          </div>

          {/* RESORT SCENIC PHOTO */}
          <div className="rounded-xl overflow-hidden border border-emerald-500/20 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=80"
              alt="Duangon Cold Spring"
              className="w-full h-64 object-cover"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: ACCOUNT INFORMATION */}
      <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-6 space-y-5 shadow-xl">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">ACCOUNT INFORMATION</h3>
          </div>
          <button className="px-4 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <Edit className="w-3.5 h-3.5" /> Edit Account
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* FIELDS GRID */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Username</span>
              <p className="text-white font-mono font-bold text-sm mt-0.5">juandelacruz</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Account Type</span>
              <p className="text-white font-medium text-sm mt-0.5">Staff Account</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Email Address</span>
              <p className="text-white font-mono text-sm mt-0.5">juandelacruz@ecotourvista.com</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Employee ID</span>
              <p className="text-emerald-400 font-mono font-bold text-sm mt-0.5">ETV-2024-001</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Role</span>
              <p className="text-white font-medium text-sm mt-0.5">Super Administrator</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Department</span>
              <p className="text-white font-medium text-sm mt-0.5">Administration</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Status</span>
              <span className="px-3 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold rounded-full inline-block mt-0.5">
                Active
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Permissions</span>
              <p className="text-white font-bold text-sm mt-0.5">All Access</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Last Login</span>
              <p className="text-slate-300 text-xs mt-0.5">May 25, 2024 08:45 AM</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Login Device</span>
              <p className="text-slate-300 text-xs mt-0.5">Windows 11 • Chrome</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Member Since</span>
              <p className="text-slate-300 text-xs mt-0.5">May 15, 2024 10:30 AM</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Login IP Address</span>
              <p className="text-slate-300 font-mono text-xs mt-0.5">192.168.1.25</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Two-Factor Authentication</span>
              <span className="px-3 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold rounded-full inline-block mt-0.5">
                Enabled
              </span>
            </div>
          </div>

          {/* SECURITY EMBLEM BADGE */}
          <div className="rounded-2xl bg-[#04150e] border border-emerald-800/40 p-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h4 className="text-sm font-bold text-white">Your account is secure</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              We're protecting your account and personal information.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: CHANGE PASSWORD */}
      <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-6 space-y-5 shadow-xl">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <Key className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">CHANGE PASSWORD</h3>
        </div>

        {msg && (
          <div className="p-3 bg-emerald-950/90 border border-emerald-700/60 rounded-xl text-emerald-200 text-xs font-semibold">
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PASSWORD INPUTS */}
          <form onSubmit={handleUpdatePassword} className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full bg-[#04150e] border border-emerald-800/60 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full bg-[#04150e] border border-emerald-800/60 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full bg-[#04150e] border border-emerald-800/60 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer shadow-lg shadow-emerald-950/60"
              >
                Update Password
              </button>
            </div>
          </form>

          {/* PASSWORD REQUIREMENTS CHECKLIST */}
          <div className="rounded-xl bg-[#04150e] border border-emerald-900/40 p-5 space-y-3 text-xs">
            <h4 className="font-bold text-emerald-400">Password Requirements</h4>
            <div className="space-y-2 text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>At least 8 characters long</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Include uppercase and lowercase letters</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Include at least one number</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Include at least one special character</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEED ASSISTANCE FOOTER BAR */}
      <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
        <div>
          <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">NEED ASSISTANCE?</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            We're here to help you manage your account and security settings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-[#04150e] border border-emerald-900/30 flex items-center gap-3 hover:border-emerald-500/40 cursor-pointer transition-all">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">Contact Admin</h5>
              <p className="text-[10px] text-slate-400">Get quick support</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#04150e] border border-emerald-900/30 flex items-center gap-3 hover:border-emerald-500/40 cursor-pointer transition-all">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">Report Issue</h5>
              <p className="text-[10px] text-slate-400">Report account issues</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#04150e] border border-emerald-900/30 flex items-center gap-3 hover:border-emerald-500/40 cursor-pointer transition-all">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">User Guide</h5>
              <p className="text-[10px] text-slate-400">Learn how it works</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}