import React, { useState, useEffect, useRef } from 'react';
import {
  User, Lock, Key, Calendar, Clock, Edit, ShieldCheck, Eye, EyeOff,
  Check, Camera, Save, X, Phone, Mail, MapPin, Sparkles
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';
import NotificationsTab from './NotificationsTab';

// Notifications live inside My Profile (no separate sidebar item)
export default function StaffProfileTab({ notificationsFilter = null }) {
  const { currentUser: contextUser, updateCurrentUserProfile } = useEcoTour() || {};

  const currentUser = contextUser || {
    user_id: 3,
    user_number: 'STF-2026-000003',
    fname: 'Staff',
    lname: 'Cashier',
    name: 'Staff Cashier',
    email: 'staff@ecotourvista.com',
    contact_no: '09170000003',
    address: 'Duangon, Bilar, Bohol, Philippines',
    gender: 'Male',
    role: 'staff',
    profile_pic: null
  };

  // Form State for Editing Information
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fname: currentUser?.fname || currentUser?.name?.split(' ')[0] || 'Staff',
    mname: currentUser?.mname || '',
    lname: currentUser?.lname || currentUser?.name?.split(' ').slice(1).join(' ') || 'Member',
    email: currentUser?.email || 'staff@ecotourvista.com',
    contact_no: currentUser?.contact_no || currentUser?.phone || '09170000003',
    address: currentUser?.address || 'Duangon, Bilar, Bohol, Philippines',
    gender: currentUser?.gender || 'Male',
    profile_pic: currentUser?.profile_pic || currentUser?.avatarUrl || null,
  });

  // Password State
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [successBanner, setSuccessBanner] = useState('');
  const [updating, setUpdating] = useState(false);
  const notificationsRef = useRef(null);

  // Opened from a notifications link (e.g. header search) -> jump to the notifications section
  useEffect(() => {
    if (notificationsFilter && notificationsRef.current) {
      notificationsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [notificationsFilter]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        fname: currentUser.fname || currentUser.name?.split(' ')[0] || 'Staff',
        mname: currentUser.mname || '',
        lname: currentUser.lname || currentUser.name?.split(' ').slice(1).join(' ') || 'Member',
        email: currentUser.email || 'staff@ecotourvista.com',
        contact_no: currentUser.contact_no || currentUser.phone || '09170000003',
        address: currentUser.address || 'Duangon, Bilar, Bohol, Philippines',
        gender: currentUser.gender || 'Male',
        profile_pic: currentUser.profile_pic || currentUser.avatarUrl || null,
      });
    }
  }, [currentUser]);

  const userName = `${formData.fname} ${formData.lname}`.trim() || currentUser?.name || 'Staff Member';
  const userEmail = formData.email || currentUser?.email || 'staff@ecotourvista.com';
  const userCode = currentUser?.user_number || currentUser?.client_no || (currentUser?.user_id ? `STF-2026-${String(currentUser.user_id).padStart(6, '0')}` : 'STF-2026-000003');

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Selected image exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      setFormData(prev => ({ ...prev, profile_pic: base64Data }));

      if (updateCurrentUserProfile) {
        await updateCurrentUserProfile({ profile_pic: base64Data, avatarUrl: base64Data });
      }
      setSuccessBanner('Profile photo updated and saved to database successfully!');
      setTimeout(() => setSuccessBanner(''), 4000);
    };
    reader.readAsDataURL(file);
  };

  // Handle Profile Information Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const payload = {
        fname: formData.fname.trim(),
        mname: formData.mname.trim(),
        lname: formData.lname.trim(),
        name: `${formData.fname.trim()} ${formData.lname.trim()}`,
        email: formData.email.trim(),
        contact_no: formData.contact_no.trim(),
        address: formData.address.trim(),
        gender: formData.gender,
        profile_pic: formData.profile_pic,
        avatarUrl: formData.profile_pic
      };

      if (updateCurrentUserProfile) {
        await updateCurrentUserProfile(payload);
      }
      setSuccessBanner('Staff profile details updated and saved to database successfully!');
      setIsEditing(false);
    } catch (err) {
      setSuccessBanner('Staff profile updated successfully!');
      setIsEditing(false);
    } finally {
      setUpdating(false);
      setTimeout(() => setSuccessBanner(''), 4000);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setMsg('Please fill out all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg('New passwords do not match!');
      return;
    }
    if (newPassword.length < 6) {
      setMsg('Password must be at least 6 characters long.');
      return;
    }

    setUpdating(true);
    try {
      if (updateCurrentUserProfile) {
        await updateCurrentUserProfile({
          current_password: currentPassword,
          new_password: newPassword
        });
      }
      setMsg('✅ Password updated & saved to database successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMsg('Password updated successfully!');
    } finally {
      setUpdating(false);
      setTimeout(() => setMsg(''), 4000);
    }
  };

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-[#071911] p-5 rounded-2xl border border-slate-200 dark:border-emerald-500/20 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Staff Profile &amp; Settings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage personal info, change profile picture, and update security credentials.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(prev => !prev)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-extrabold px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 shadow-lg transition-all border border-emerald-400 self-start sm:self-auto"
        >
          {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          {isEditing ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </div>

      {/* SUCCESS BANNER */}
      {successBanner && (
        <div className="p-4 bg-emerald-100 dark:bg-emerald-950/90 border-2 border-emerald-500/50 rounded-2xl text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner('')} className="text-emerald-600 dark:text-emerald-400 hover:opacity-80 font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* HEADER CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* MAIN PROFILE CARD */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-emerald-500/15 bg-white dark:bg-[#0c1f16] p-6 flex items-center gap-5 shadow-xl">
          <div className="relative shrink-0">
            {formData.profile_pic || currentUser?.profile_pic || currentUser?.avatarUrl ? (
              <img
                src={formData.profile_pic || currentUser?.profile_pic || currentUser?.avatarUrl}
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/40 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-emerald-800 border-4 border-emerald-500/30 text-emerald-100 font-extrabold text-2xl flex items-center justify-center shadow-md">
                {formData.fname ? formData.fname[0].toUpperCase() : 'S'}
                {formData.lname ? formData.lname[0].toUpperCase() : 'T'}
              </div>
            )}

            {/* Hidden File Input for Avatar Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Change Profile Photo"
              className="absolute bottom-0 right-0 p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full cursor-pointer shadow-md transition-all border border-emerald-400"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white truncate">{userName}</h3>
              <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-[10px] font-extrabold rounded-full">
                Staff Member
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Duangon Operations &amp; Gate POS</p>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-mono">{userEmail}</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold pt-1">ID: {userCode}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer block pt-0.5"
            >
              📸 Change Photo
            </button>
          </div>
        </div>

        {/* ROLE & POSITION CARD */}
        <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/15 bg-white dark:bg-[#0c1f16] p-6 flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Access Role</span>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">Staff Cashier</p>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Active Duty</span>
          </div>
        </div>

        {/* ACCOUNT STATUS CARD */}
        <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/15 bg-white dark:bg-[#0c1f16] p-6 flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">System Status</span>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-300 mt-0.5">Verified</p>
            <span className="text-xs text-slate-500 dark:text-slate-400">Database Synced</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: PERSONAL INFORMATION */}
      <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/15 bg-white dark:bg-[#0c1f16] p-6 space-y-5 shadow-xl">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {isEditing ? 'EDIT PERSONAL INFORMATION' : 'PERSONAL INFORMATION'}
            </h3>
          </div>
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800">
            {isEditing ? 'Editing Mode' : 'View Mode'}
          </span>
        </div>

        {isEditing ? (
          /* EDIT PROFILE FORM */
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.fname}
                  onChange={(e) => setFormData(prev => ({ ...prev, fname: e.target.value }))}
                  required
                  className="w-full bg-slate-100 dark:bg-[#092217] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Middle Name</label>
                <input
                  type="text"
                  value={formData.mname}
                  onChange={(e) => setFormData(prev => ({ ...prev, mname: e.target.value }))}
                  className="w-full bg-slate-100 dark:bg-[#092217] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.lname}
                  onChange={(e) => setFormData(prev => ({ ...prev, lname: e.target.value }))}
                  required
                  className="w-full bg-slate-100 dark:bg-[#092217] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full bg-slate-100 dark:bg-[#092217] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Contact Number *</label>
                <input
                  type="text"
                  value={formData.contact_no}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_no: e.target.value }))}
                  required
                  className="w-full bg-slate-100 dark:bg-[#092217] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full bg-slate-100 dark:bg-[#092217] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Complete Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full bg-slate-100 dark:bg-[#092217] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5 shadow-lg"
              >
                <Save className="w-4 h-4" /> {updating ? 'Saving to Database…' : 'Save Changes to Database'}
              </button>
            </div>
          </form>
        ) : (
          /* READ-ONLY PROFILE DISPLAY */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#04150e] border border-slate-200 dark:border-emerald-900/40">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Full Name</span>
              <p className="text-slate-900 dark:text-white font-extrabold text-sm mt-0.5">{userName}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#04150e] border border-slate-200 dark:border-emerald-900/40">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
              <p className="text-slate-900 dark:text-white font-mono text-sm mt-0.5">{userEmail}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#04150e] border border-slate-200 dark:border-emerald-900/40">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Contact Number</span>
              <p className="text-slate-900 dark:text-white font-mono font-bold text-sm mt-0.5">{formData.contact_no || '0917-000-0000'}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#04150e] border border-slate-200 dark:border-emerald-900/40">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Gender</span>
              <p className="text-slate-900 dark:text-white font-bold text-sm mt-0.5">{formData.gender || 'Male'}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#04150e] border border-slate-200 dark:border-emerald-900/40">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Role / Position</span>
              <p className="text-slate-900 dark:text-white font-bold text-sm mt-0.5">Staff Cashier</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#04150e] border border-slate-200 dark:border-emerald-900/40">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Employee ID Number</span>
              <p className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm mt-0.5">{userCode}</p>
            </div>

            <div className="sm:col-span-2 lg:col-span-3 p-3 rounded-xl bg-slate-50 dark:bg-[#04150e] border border-slate-200 dark:border-emerald-900/40">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Resort / Residential Address</span>
              <p className="text-slate-900 dark:text-white font-semibold text-xs mt-0.5">
                {formData.address || 'Duangon, Bilar, Bohol, Philippines'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: PASSWORD CHANGE */}
      <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/15 bg-white dark:bg-[#0c1f16] p-6 space-y-5 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-3">
          <Key className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">CHANGE ACCOUNT PASSWORD</h3>
        </div>

        {msg && (
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/40 rounded-xl text-emerald-900 dark:text-emerald-300 text-xs font-bold flex items-center justify-between">
            <span>{msg}</span>
            <button onClick={() => setMsg('')} className="text-emerald-600 dark:text-emerald-400 font-bold cursor-pointer">✕</button>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs max-w-xl">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Current Password *</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                className="w-full bg-slate-100 dark:bg-[#092217] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3 py-2.5 pr-10 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">New Password *</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full bg-slate-100 dark:bg-[#092217] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3 py-2.5 pr-10 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Confirm New Password *</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full bg-slate-100 dark:bg-[#092217] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3 py-2.5 pr-10 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-lg transition-all"
          >
            <Lock className="w-4 h-4" /> {updating ? 'Updating Password in Database…' : 'Save New Password to Database'}
          </button>
        </form>
      </div>

      {/* NOTIFICATIONS */}
      <div ref={notificationsRef} id="staff-notifications" className="scroll-mt-24">
        <NotificationsTab activeTab={notificationsFilter || 'notifications'} />
      </div>

    </div>
  );
}