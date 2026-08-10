import React, { useState } from 'react';
import {
  User, Edit, Shield, Key, Bell, Camera, Calendar, MapPin, Mail, Phone,
  Globe, CheckCircle, Lock, RefreshCw, Eye
} from 'lucide-react';

export default function ProfileTab() {
  const [profile, setProfile] = useState({
    name: 'Maria Santos',
    email: 'admin@ecotourvista.ph',
    phone: '0917 123 4567',
    gender: 'Female',
    dob: 'May 12, 1990',
    address: 'Poblacion, Zamora, Bilar, Bohol, Philippines',
    nationality: 'Filipino',
    language: 'English',
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPasswordMsg('Please fill out all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('New passwords do not match!');
      return;
    }

    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      setPasswordMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(''), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-white">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              View and manage your personal information and account settings
            </p>
          </div>
        </div>

        <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all border border-emerald-400/40 self-start sm:self-auto">
          <Edit className="w-4 h-4" /> Edit Profile
        </button>
      </div>

      {/* TOP SECTION: PROFILE BANNER & PERSONAL INFO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AVATAR CARD */}
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-6 flex flex-col items-center justify-center text-center shadow-xl relative">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80"
              alt="Admin"
              className="w-28 h-28 rounded-full object-cover border-4 border-emerald-500/30 shadow-lg"
            />
            <button className="absolute bottom-0 right-0 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full cursor-pointer shadow-md transition-all">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-white mt-4">{profile.name}</h3>
          <span className="px-3 py-1 bg-emerald-950 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-800 mt-1">
            Super Administrator
          </span>
          <p className="text-xs text-slate-400 mt-2">Joined January 15, 2024</p>
        </div>

        {/* PERSONAL INFORMATION CARD */}
        <div className="lg:col-span-2 rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <User className="w-4 h-4 text-emerald-400" />
            <h4 className="text-base font-bold text-white">Personal Information</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#04150e]">
              <User className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Full Name</span>
                <strong className="text-white text-xs">{profile.name}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#04150e]">
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                <strong className="text-white text-xs">{profile.dob}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#04150e]">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Email Address</span>
                <strong className="text-white text-xs">{profile.email}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#04150e]">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Address</span>
                <strong className="text-white text-xs truncate">{profile.address}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#04150e]">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Phone Number</span>
                <strong className="text-white text-xs">{profile.phone}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#04150e]">
              <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Nationality</span>
                <strong className="text-white text-xs">{profile.nationality}</strong>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5 KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">ACCOUNT ROLE</span>
            <p className="text-xs font-bold text-white mt-0.5">Super Administrator</p>
            <span className="text-[10px] text-slate-400 font-semibold">Full System Access</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">TOTAL LOGINS</span>
            <p className="text-base font-bold text-white mt-0.5">256</p>
            <span className="text-[10px] text-slate-400 font-semibold">Last login: 25 mins ago</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">ACCOUNT STATUS</span>
            <p className="text-sm font-bold text-emerald-400 mt-0.5">Active</p>
            <span className="text-[10px] text-slate-400 font-semibold">Account is in good standing</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">PERMISSIONS</span>
            <p className="text-base font-bold text-white mt-0.5">28</p>
            <span className="text-[10px] text-slate-400 font-semibold">System Permissions</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">SECURITY SCORE</span>
            <p className="text-base font-bold text-white mt-0.5">95%</p>
            <span className="text-[10px] text-emerald-400 font-semibold">Strong Security</span>
          </div>
        </div>
      </div>

      {/* BOTTOM 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: RECENT ACTIVITY & SECURITY SETTINGS */}
        <div className="space-y-6">
          
          {/* RECENT ACTIVITY CARD */}
          <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h4 className="font-bold text-white text-base">Recent Activity</h4>
              <button className="text-xs text-slate-300 border border-white/10 rounded-lg px-3 py-1 hover:bg-white/5 cursor-pointer">View All</button>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Login to the system', desc: 'Successful login from Chrome on Windows', time: '25 mins ago' },
                { title: 'Updated user role', desc: 'Changed role of user John Dela Cruz', time: '1 hour ago' },
                { title: 'Approved reservation', desc: 'Reservation RES-2024-0342 has been approved', time: '2 hours ago' },
                { title: 'New walk-in transaction', desc: 'Walk-in transaction TRX-2024-0157 recorded', time: '3 hours ago' },
              ].map((act, i) => (
                <div key={i} className="flex justify-between items-start p-3 rounded-xl bg-[#04150e] border border-emerald-900/30">
                  <div>
                    <h5 className="text-xs font-bold text-white">{act.title}</h5>
                    <p className="text-[11px] text-slate-400">{act.desc}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SECURITY SETTINGS CARD */}
          <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
            <div className="border-b border-white/5 pb-3">
              <h4 className="font-bold text-white text-base">Security Settings</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-[#04150e]">
                <div>
                  <h5 className="font-bold text-white">Two-Factor Authentication</h5>
                  <p className="text-[11px] text-slate-400">Add an extra layer of security to your account</p>
                </div>
                <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-bold rounded-full">Enabled ✓</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-[#04150e]">
                <div>
                  <h5 className="font-bold text-white">Login Alerts</h5>
                  <p className="text-[11px] text-slate-400">Get notified of new login to your account</p>
                </div>
                <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-bold rounded-full">Enabled ✓</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-[#04150e]">
                <div>
                  <h5 className="font-bold text-white">Active Sessions</h5>
                  <p className="text-[11px] text-slate-400">Manage your active login sessions</p>
                </div>
                <button className="px-3 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-semibold rounded-lg cursor-pointer">Manage</button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACCOUNT PREFERENCES & CHANGE PASSWORD */}
        <div className="space-y-6">
          
          {/* ACCOUNT PREFERENCES */}
          <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
            <div className="border-b border-white/5 pb-3">
              <h4 className="font-bold text-white text-base">Account Preferences</h4>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#04150e]">
                <div>
                  <h5 className="text-xs font-bold text-white">Email Notifications</h5>
                  <p className="text-[11px] text-slate-400">Receive email notifications for important updates</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-500 cursor-pointer" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#04150e]">
                <div>
                  <h5 className="text-xs font-bold text-white">SMS Notifications</h5>
                  <p className="text-[11px] text-slate-400">Receive SMS notifications for urgent alerts</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-500 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* CHANGE PASSWORD */}
          <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-4 shadow-xl">
            <div className="border-b border-white/5 pb-3">
              <h4 className="font-bold text-white text-base">Change Password</h4>
              <p className="text-xs text-slate-400">Update your password regularly to keep your account secure.</p>
            </div>

            {passwordMsg && (
              <div className="p-3 bg-emerald-950/90 border border-emerald-700/60 rounded-xl text-emerald-200 text-xs font-semibold">
                {passwordMsg}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-[#04150e] border border-emerald-800/60 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-[#04150e] border border-emerald-800/60 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-[#04150e] border border-emerald-800/60 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-400"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60"
              >
                {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} Update Password
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
