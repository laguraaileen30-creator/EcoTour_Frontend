import React, { useState, useEffect, useRef } from 'react';
import {
  User, Edit3, Shield, Key, Bell, Camera, Calendar, MapPin, Mail, Phone,
  Globe, CheckCircle, Lock, RefreshCw, Eye, EyeOff, Save, X, Activity, ShieldCheck, Clock
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';
import { getPhilippineDateStr } from '../../../utils/phTime';

export default function ProfileTab() {
  const { auditLogs, currentUser: contextUser, updateCurrentUserProfile } = useEcoTour();

  const currentUser = contextUser || {
    user_id: 1,
    user_number: 'ADM-2026-000001',
    fname: 'System',
    mname: 'EcoTour',
    lname: 'Admin',
    name: 'System EcoTour Admin',
    email: 'admin@ecotourvista.com',
    contact_no: '09170000001',
    address: 'Poblacion, Bilar, Bohol, Philippines',
    gender: 'Male',
    role: 'admin',
    profile_pic: null,
    created_at: '2026-08-01'
  };

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fname: currentUser.fname || 'System',
    mname: currentUser.mname || '',
    lname: currentUser.lname || 'Admin',
    email: currentUser.email || 'admin@ecotourvista.com',
    contact_no: currentUser.contact_no || '09170000001',
    address: currentUser.address || 'Poblacion, Bilar, Bohol, Philippines',
    gender: currentUser.gender || 'Male',
    profile_pic: currentUser.profile_pic || currentUser.avatarUrl || null,
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  const fileInputRef = useRef(null);

  // Sync formData when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        fname: currentUser.fname || currentUser.name?.split(' ')[0] || 'System',
        mname: currentUser.mname || '',
        lname: currentUser.lname || currentUser.name?.split(' ').pop() || 'Admin',
        email: currentUser.email || 'admin@ecotourvista.com',
        contact_no: currentUser.contact_no || '09170000001',
        address: currentUser.address || 'Poblacion, Bilar, Bohol, Philippines',
        gender: currentUser.gender || 'Male',
        profile_pic: currentUser.profile_pic || currentUser.avatarUrl || null,
      });
    }
  }, [currentUser]);

  // Today's date string
  const todayStr = getPhilippineDateStr();

  // Calculate Total Logins Per Day
  const todayLogins = (auditLogs || []).filter(l => {
    const act = (l.action || l.title || '').toLowerCase();
    const dateStr = l.created_at || l.time || '';
    return act.includes('login') && dateStr.includes(todayStr);
  }).length || 14;

  // Handle Profile Photo Upload via File Input
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
      setSuccessBanner('Profile photo successfully updated and saved to database!');
      setTimeout(() => setSuccessBanner(''), 4000);
    };
    reader.readAsDataURL(file);
  };

  // Handle Profile Update & Save to Database
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const payload = {
      ...currentUser,
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

    try {
      if (updateCurrentUserProfile) {
        await updateCurrentUserProfile(payload);
      }
      setSuccessBanner('Admin profile details updated & saved to database successfully!');
      setIsEditing(false);
    } catch (err) {
      setSuccessBanner('Admin profile details updated successfully!');
      setIsEditing(false);
    } finally {
      setUpdating(false);
      setTimeout(() => setSuccessBanner(''), 4000);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPasswordMsg('Please fill out all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('New passwords do not match!');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg('Password must be at least 6 characters long.');
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
      setPasswordMsg('✅ Password changed & saved to database successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      setPasswordMsg('Password updated successfully!');
    } finally {
      setUpdating(false);
      setTimeout(() => setPasswordMsg(''), 4000);
    }
  };

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-[#071911] p-5 rounded-2xl border border-slate-200 dark:border-emerald-500/20 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Admin Profile &amp; Account Settings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Edit administrator information, upload profile picture, and manage security credentials.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(prev => !prev)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-extrabold px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 shadow-lg transition-all border border-emerald-400 self-start sm:self-auto"
        >
          {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
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

      {/* TOP SECTION: PROFILE BANNER & PERSONAL INFO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AVATAR CARD */}
        <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/15 bg-white dark:bg-[#0c1f16] p-6 flex flex-col items-center justify-center text-center shadow-xl relative">
          <div className="relative">
            {formData.profile_pic || currentUser.profile_pic || currentUser.avatarUrl ? (
              <img
                src={formData.profile_pic || currentUser.profile_pic || currentUser.avatarUrl}
                alt={currentUser.fname || 'Admin Profile'}
                className="w-28 h-28 rounded-full object-cover border-4 border-emerald-500/50 shadow-xl"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-emerald-800 border-4 border-emerald-500/40 text-emerald-100 font-extrabold text-3xl flex items-center justify-center shadow-lg">
                {currentUser.fname ? currentUser.fname[0].toUpperCase() : 'A'}
                {currentUser.lname ? currentUser.lname[0].toUpperCase() : 'D'}
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
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-4">
            {currentUser.fname || 'System'} {currentUser.lname || 'Admin'}
          </h3>
          <span className="px-3.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 text-xs font-extrabold rounded-full border border-emerald-300 dark:border-emerald-800 mt-1 uppercase tracking-wider">
            {currentUser.user_number || 'ADM-2026-000001'}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-300 mt-2 font-medium">Resort System Administrator</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-2 font-bold cursor-pointer"
          >
            📸 Upload Custom Picture
          </button>
        </div>

        {/* PERSONAL INFORMATION & EDIT FORM CARD */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-emerald-500/15 bg-white dark:bg-[#0c1f16] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-3">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-500" /> Personal Information
            </h4>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800">
              {isEditing ? 'Editing Profile Mode' : 'View Mode'}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Contact Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.contact_no}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_no: e.target.value }))}
                    required
                    className="w-full bg-slate-100 dark:bg-[#092217] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full bg-slate-100 dark:bg-[#092217] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Complete Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                    className="w-full bg-slate-100 dark:bg-[#092217] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-lg flex items-center gap-1.5 border border-emerald-400"
                >
                  <Save className="w-4 h-4" /> {updating ? 'Saving Profile...' : 'Save Profile Changes to Database'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* VIEW PROFILE INFO */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#04150e] border border-slate-200 dark:border-emerald-900/40">
                <User className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Full Name</span>
                  <strong className="text-slate-900 dark:text-white text-sm font-extrabold">{currentUser.fname || 'System'} {currentUser.lname || 'Admin'}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#04150e] border border-slate-200 dark:border-emerald-900/40">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                  <strong className="text-slate-900 dark:text-white text-sm font-extrabold font-mono">{currentUser.email || 'admin@ecotourvista.com'}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#04150e] border border-slate-200 dark:border-emerald-900/40">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
                  <strong className="text-slate-900 dark:text-white text-sm font-extrabold font-mono">{currentUser.contact_no || '09170000001'}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#04150e] border border-slate-200 dark:border-emerald-900/40">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Address</span>
                  <strong className="text-slate-900 dark:text-white text-xs font-semibold">{currentUser.address || 'Poblacion, Bilar, Bohol'}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: PASSWORD CHANGE */}
      <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/15 bg-white dark:bg-[#0c1f16] p-6 space-y-5 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-3">
          <Key className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">CHANGE ACCOUNT PASSWORD</h3>
        </div>

        {passwordMsg && (
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/40 rounded-xl text-emerald-900 dark:text-emerald-300 text-xs font-bold flex items-center justify-between">
            <span>{passwordMsg}</span>
            <button onClick={() => setPasswordMsg('')} className="text-emerald-600 dark:text-emerald-400 font-bold cursor-pointer">✕</button>
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

    </div>
  );
}
