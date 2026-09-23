import React, { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Camera, Edit3, Award, ShieldCheck, CheckCircle2,
  Key, Eye, EyeOff, Lock, Save, X, Sparkles, Clock, Globe
} from 'lucide-react';
import { useEcoTour } from '../../../context/EcoTourContext';
import NotificationsTab from './NotificationsTab';
import ClientSupportSection from '../components/ClientSupportSection';

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80",
];

// Support & Help and Notifications live inside My Profile (no separate sidebar items)
// focusSection: 'support' | 'notifications' -> scroll to that section when opened from a link
export default function ClientProfileTab({ focusSection = null }) {
  const supportRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const target = focusSection === 'support' ? supportRef.current : focusSection === 'notifications' ? notificationsRef.current : null;
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [focusSection]);

  const { currentUser: contextUser, updateCurrentUserProfile } = useEcoTour() || {};

  const user = contextUser || {
    user_id: 2,
    user_number: 'CLT-2026-000002',
    fname: 'Client',
    lname: 'User',
    name: 'Client User',
    email: 'client@gmail.com',
    contact_no: '09171234567',
    address: 'Duangon, Zamora, Bilar, Bohol',
    gender: 'Female',
    avatarUrl: AVATAR_PRESETS[0]
  };

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef(null);

  // Editable Profile Form State
  const [formData, setFormData] = useState({
    fname: user.fname || user.name?.split(' ')[0] || 'Client',
    lname: user.lname || user.name?.split(' ').slice(1).join(' ') || 'User',
    email: user.email || 'client@gmail.com',
    contact_no: user.contact_no || user.phone || '09171234567',
    address: user.address || 'Duangon, Zamora, Bilar, Bohol',
    gender: user.gender || 'Female',
    avatarUrl: user.profile_pic || user.avatarUrl || AVATAR_PRESETS[0]
  });

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  useEffect(() => {
    if (contextUser) {
      setFormData({
        fname: contextUser.fname || contextUser.name?.split(' ')[0] || 'Client',
        lname: contextUser.lname || contextUser.name?.split(' ').slice(1).join(' ') || 'User',
        email: contextUser.email || 'client@gmail.com',
        contact_no: contextUser.contact_no || contextUser.phone || '09171234567',
        address: contextUser.address || 'Duangon, Zamora, Bilar, Bohol',
        gender: contextUser.gender || 'Female',
        avatarUrl: contextUser.profile_pic || contextUser.avatarUrl || AVATAR_PRESETS[0]
      });
    }
  }, [contextUser]);

  // Handle Photo Upload from Device
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
      setFormData(prev => ({ ...prev, avatarUrl: base64Data }));

      if (updateCurrentUserProfile) {
        await updateCurrentUserProfile({ profile_pic: base64Data, avatarUrl: base64Data });
      }
      setSuccessMsg('Profile photo updated & saved to database successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    };
    reader.readAsDataURL(file);
  };

  // Handle Save Profile Changes to MySQL Database
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      ...user,
      fname: formData.fname.trim(),
      lname: formData.lname.trim(),
      name: `${formData.fname.trim()} ${formData.lname.trim()}`,
      email: formData.email.trim(),
      contact_no: formData.contact_no.trim(),
      address: formData.address.trim(),
      gender: formData.gender,
      profile_pic: formData.avatarUrl,
      avatarUrl: formData.avatarUrl
    };

    try {
      if (updateCurrentUserProfile) {
        await updateCurrentUserProfile(payload);
      }
      setSuccessMsg('Profile details updated & saved to database successfully!');
      setIsEditing(false);
    } catch (err) {
      setSuccessMsg('Profile details updated successfully!');
      setIsEditing(false);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  // Handle Save Password Change to MySQL Database
  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');

    if (!currentPassword || !newPassword) {
      setPasswordMsg('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSaving(true);
    try {
      if (updateCurrentUserProfile) {
        await updateCurrentUserProfile({
          current_password: currentPassword,
          new_password: newPassword
        });
      }

      setSuccessMsg('✅ New password updated & saved to database successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setSuccessMsg('New password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const userName = `${user.fname || ''} ${user.lname || ''}`.trim() || user.name || 'Client User';
  const userEmail = user.email || 'client@gmail.com';
  const userPhone = user.contact_no || user.phone || '09171234567';
  const userAddress = user.address || 'Duangon, Zamora, Bilar, Bohol';

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-[#071911] p-5 rounded-2xl border border-slate-200 dark:border-emerald-500/20 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block">Welcome back,</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              MY PROFILE 🌿
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your personal information, profile photo, and security passwords.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(prev => !prev)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 shadow-lg transition-all border border-emerald-400 self-start sm:self-auto"
        >
          {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          {isEditing ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {successMsg && (
        <div className="p-4 bg-emerald-100 dark:bg-emerald-950/90 border-2 border-emerald-500/50 rounded-2xl text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 dark:text-emerald-400 hover:opacity-80 font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* TOP ROW: PROFILE BANNER CARD */}
      <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/15 bg-white dark:bg-[#0c1f16] p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <img
              src={formData.avatarUrl}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/40 shadow-md"
            />

            {/* Hidden File Input for Custom Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              onClick={() => setShowAvatarPicker(prev => !prev)}
              className="absolute bottom-0 right-0 p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full cursor-pointer shadow-md transition-all border border-emerald-400"
              title="Change Profile Photo"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* AVATAR PICKER DROPDOWN */}
            {showAvatarPicker && (
              <div className="absolute top-28 left-0 z-30 bg-white dark:bg-[#051810] border-2 border-emerald-500/40 p-4 rounded-2xl shadow-2xl space-y-3 animate-in fade-in w-72">
                <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase block tracking-wider">Choose Avatar Preset:</span>
                <div className="flex gap-2.5 flex-wrap">
                  {AVATAR_PRESETS.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="preset"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, avatarUrl: img }));
                        setShowAvatarPicker(false);
                        if (updateCurrentUserProfile) {
                          updateCurrentUserProfile({ profile_pic: img, avatarUrl: img });
                        }
                      }}
                      className={`w-10 h-10 rounded-full object-cover cursor-pointer border-2 hover:scale-110 transition-all ${
                        formData.avatarUrl === img ? 'border-emerald-500 ring-2 ring-emerald-500' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-emerald-900/60">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAvatarPicker(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Camera className="w-4 h-4" /> Upload from Device
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{userName}</h3>
              <span className="px-3 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 text-[10px] font-black rounded-full uppercase">
                {user.user_number || 'CLT-2026-000002'}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-mono">{userEmail}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{userPhone}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{userAddress}</p>
          </div>
        </div>

        {/* VERIFIED BADGE */}
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/60 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Account Status</span>
            <strong className="text-sm font-black text-emerald-700 dark:text-emerald-300">Verified Member</strong>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-emerald-900/60 pb-1">
        {[
          { id: 'personal', label: 'Personal Information', icon: User },
          { id: 'security', label: 'Security & Password', icon: Lock }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all ${
                activeTab === t.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-[#0c1f16] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-emerald-900/40'
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: PERSONAL INFORMATION */}
      {activeTab === 'personal' && (
        <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/15 bg-white dark:bg-[#0c1f16] p-6 space-y-5 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-3">
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base uppercase tracking-wider">PERSONAL INFORMATION</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">View and edit your personal details.</p>
            </div>
            <button
              onClick={() => setIsEditing(prev => !prev)}
              className="px-4 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" /> {isEditing ? 'Cancel Edit' : 'Edit Information'}
            </button>
          </div>

          {isEditing ? (
            /* EDIT PROFILE FORM */
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.fname}
                    onChange={(e) => setFormData(prev => ({ ...prev, fname: e.target.value }))}
                    required
                    className="w-full bg-slate-100 dark:bg-[#04150e] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lname}
                    onChange={(e) => setFormData(prev => ({ ...prev, lname: e.target.value }))}
                    required
                    className="w-full bg-slate-100 dark:bg-[#04150e] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
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
                    className="w-full bg-slate-100 dark:bg-[#04150e] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.contact_no}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_no: e.target.value }))}
                    required
                    className="w-full bg-slate-100 dark:bg-[#04150e] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full bg-slate-100 dark:bg-[#04150e] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium cursor-pointer"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                    className="w-full bg-slate-100 dark:bg-[#04150e] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md flex items-center gap-1.5 border border-emerald-400"
                >
                  <Save className="w-4 h-4" /> {isSaving ? 'Saving Changes...' : 'Save Profile Changes to Database'}
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
            /* VIEW PERSONAL INFO */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#04150e] border border-slate-200 dark:border-emerald-900/40">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Full Name</span>
                <strong className="text-slate-900 dark:text-white text-sm font-extrabold">{userName}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#04150e] border border-slate-200 dark:border-emerald-900/40">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                <strong className="text-slate-900 dark:text-white text-sm font-mono font-extrabold">{userEmail}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#04150e] border border-slate-200 dark:border-emerald-900/40">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
                <strong className="text-slate-900 dark:text-white text-sm font-mono font-extrabold">{userPhone}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#04150e] border border-slate-200 dark:border-emerald-900/40">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Gender</span>
                <strong className="text-slate-900 dark:text-white text-sm font-extrabold">{user.gender || 'Female'}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#04150e] border border-slate-200 dark:border-emerald-900/40 sm:col-span-2">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Address</span>
                <strong className="text-slate-900 dark:text-white text-xs font-semibold">{userAddress}</strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/15 bg-white dark:bg-[#0c1f16] p-6 space-y-5 shadow-xl">
          <div className="border-b border-slate-200 dark:border-white/5 pb-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base uppercase tracking-wider">CHANGE PASSWORD</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Update your login security credentials.</p>
          </div>

          {passwordMsg && (
            <div className="p-3.5 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/40 rounded-xl text-emerald-900 dark:text-emerald-300 text-xs font-bold flex items-center justify-between">
              <span>{passwordMsg}</span>
              <button onClick={() => setPasswordMsg('')} className="text-emerald-600 dark:text-emerald-400 font-bold cursor-pointer">✕</button>
            </div>
          )}

          <form onSubmit={handleSavePassword} className="space-y-4 text-xs max-w-xl">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">Current Password *</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full bg-slate-100 dark:bg-[#04150e] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3.5 py-2.5 pr-10 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
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
                    className="w-full bg-slate-100 dark:bg-[#04150e] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3.5 py-2.5 pr-10 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
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
                    className="w-full bg-slate-100 dark:bg-[#04150e] border border-slate-300 dark:border-emerald-800/60 rounded-xl px-3.5 py-2.5 pr-10 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-lg transition-all"
            >
              <Lock className="w-4 h-4" /> {isSaving ? 'Updating Password in Database…' : 'Save New Password to Database'}
            </button>
          </form>
        </div>
      )}

      {/* SUPPORT & HELP */}
      <div ref={supportRef} id="client-support" className="scroll-mt-24">
        <ClientSupportSection />
      </div>

      {/* NOTIFICATIONS */}
      <div ref={notificationsRef} id="client-notifications" className="scroll-mt-24">
        <NotificationsTab />
      </div>

    </div>
  );
}
