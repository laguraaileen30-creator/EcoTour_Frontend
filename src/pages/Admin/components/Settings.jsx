import React, { useState } from 'react';
import EcoTourLogo from '../../../components/EcoTourLogo';
import {
  Settings as SettingsIcon, Save, Globe, Monitor, Cloud, Users, Code,
  Shield, Mail, Database, Wrench, CheckCircle, AlertTriangle, ChevronRight, RefreshCw
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  // Form State
  const [form, setForm] = useState({
    systemName: 'EcoTourVista',
    systemTitle: 'Eco-Tourism Management System',
    tagline: 'Experience Nature, Create Memories',
    contactEmail: 'info@ecotourvista.ph',
    contactPhone: '0917 123 4567',
    address: 'Duangon Cold Spring, Zamora, Bilar, Bohol, Philippines',
    timeZone: '(GMT+08:00) Asia/Manila',
    dateFormat: 'May 25, 2024',
    timeFormat: '12 Hour (AM/PM)',
    currency: 'PHP (Philippine Peso)',
    itemsPerPage: '10',
    defaultLanguage: 'English',
    themeColor: '#1D8954',
    maintenanceMode: false,
    allowRegistration: true,
    enableNotifications: true,
    enableAnalytics: true,
    defaultReservationStatus: 'Pending',
    defaultWalkInStatus: 'Completed',
    defaultPaymentMethod: 'Cash',
    receiptPrefix: 'EV-',
    sessionTimeout: '30',
    maxFileSize: '10',
    autoBackup: true,
    enableAuditLogs: true,
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAll = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedMessage('All settings saved successfully!');
      setTimeout(() => setSavedMessage(''), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-[1600px] mx-auto text-white">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              System Settings
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Manage system configuration, preferences, and security settings
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all border border-emerald-400/40 self-start sm:self-auto"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save All Changes
        </button>
      </div>

      {savedMessage && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" /> {savedMessage}
        </div>
      )}

      {/* 5 TOP STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* SITE INFORMATION */}
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">SITE INFORMATION</span>
            <p className="text-sm font-bold text-white mt-0.5">Configured</p>
            <span className="text-[10px] text-emerald-400 font-semibold">100% Complete</span>
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">SYSTEM STATUS</span>
            <p className="text-sm font-bold text-white mt-0.5">Online</p>
            <span className="text-[10px] text-emerald-400 font-semibold">All Systems Operational</span>
          </div>
        </div>

        {/* LAST BACKUP */}
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">LAST BACKUP</span>
            <p className="text-sm font-bold text-white mt-0.5">May 25, 2024</p>
            <span className="text-[10px] text-slate-400 font-semibold">10:30 PM</span>
          </div>
        </div>

        {/* ACTIVE USERS */}
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">ACTIVE USERS</span>
            <p className="text-sm font-bold text-white mt-0.5">18</p>
            <span className="text-[10px] text-slate-400 font-semibold">Currently Online</span>
          </div>
        </div>

        {/* SYSTEM VERSION */}
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">SYSTEM VERSION</span>
            <p className="text-sm font-bold text-white mt-0.5">v2.4.1</p>
            <span className="text-[10px] text-slate-400 font-semibold">Latest Version</span>
          </div>
        </div>
      </div>

      {/* FILTER PILLS NAVBAR */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'general', label: 'General Settings' },
          { id: 'security', label: 'Security Settings' },
          { id: 'email', label: 'Email Settings' },
          { id: 'backup', label: 'Backup & Restore' },
          { id: 'maintenance', label: 'System Maintenance' },
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
        
        {/* LEFT COLUMN (2 SPANS): SETTINGS FORMS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* GENERAL SETTINGS CARD */}
          <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-6 space-y-5 shadow-xl">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" /> General Settings
              </h3>
              <p className="text-xs text-slate-400">Basic information about the system</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">System Name</label>
                <input
                  type="text"
                  value={form.systemName}
                  onChange={(e) => handleChange('systemName', e.target.value)}
                  className="w-full bg-[#04150e] border border-emerald-800/60 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">System Title</label>
                <input
                  type="text"
                  value={form.systemTitle}
                  onChange={(e) => handleChange('systemTitle', e.target.value)}
                  className="w-full bg-[#04150e] border border-emerald-800/60 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full bg-[#04150e] border border-emerald-800/60 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  className="w-full bg-[#04150e] border border-emerald-800/60 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={form.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  className="w-full bg-[#04150e] border border-emerald-800/60 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full bg-[#04150e] border border-emerald-800/60 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Time Zone</label>
                <select
                  value={form.timeZone}
                  onChange={(e) => handleChange('timeZone', e.target.value)}
                  className="w-full bg-[#04150e] border border-emerald-800/60 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="(GMT+08:00) Asia/Manila">(GMT+08:00) Asia/Manila</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date Format</label>
                <select
                  value={form.dateFormat}
                  onChange={(e) => handleChange('dateFormat', e.target.value)}
                  className="w-full bg-[#04150e] border border-emerald-800/60 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="May 25, 2024">May 25, 2024</option>
                  <option value="YYYY-MM-DD">2024-05-25</option>
                  <option value="DD/MM/YYYY">25/05/2024</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Time Format</label>
                <select
                  value={form.timeFormat}
                  onChange={(e) => handleChange('timeFormat', e.target.value)}
                  className="w-full bg-[#04150e] border border-emerald-800/60 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="12 Hour (AM/PM)">12 Hour (AM/PM)</option>
                  <option value="24 Hour">24 Hour</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={handleSaveAll} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all cursor-pointer">
                Save Changes
              </button>
            </div>
          </div>

          {/* SITE SETTINGS CARD */}
          <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-6 space-y-5 shadow-xl">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" /> Site Settings
              </h3>
              <p className="text-xs text-slate-400">Configure site appearance and behavior</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Site Logo</label>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#04150e] border border-emerald-800/60 rounded-xl">
                    <EcoTourLogo size={44} />
                  </div>
                  <div className="space-x-2">
                    <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer">Change Logo</button>
                    <button className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-semibold border border-rose-800/60 cursor-pointer">Remove</button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Items Per Page</label>
                <select
                  value={form.itemsPerPage}
                  onChange={(e) => handleChange('itemsPerPage', e.target.value)}
                  className="w-full bg-[#04150e] border border-emerald-800/60 rounded-xl px-3.5 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>

            {/* TOGGLES */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#04150e] border border-emerald-900/30">
                <div>
                  <h5 className="text-xs font-bold text-white">Maintenance Mode</h5>
                  <p className="text-[11px] text-slate-400">Put the site in maintenance mode</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.maintenanceMode}
                  onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#04150e] border border-emerald-900/30">
                <div>
                  <h5 className="text-xs font-bold text-white">Allow User Registration</h5>
                  <p className="text-[11px] text-slate-400">Allow new users to register</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.allowRegistration}
                  onChange={(e) => handleChange('allowRegistration', e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={handleSaveAll} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all cursor-pointer">
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1 SPAN): QUICK SETTINGS & SYSTEM INFO */}
        <div className="space-y-6">
          
          {/* QUICK SETTINGS */}
          <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-white pb-2 border-b border-white/5">Quick Settings</h3>
            
            {[
              { title: 'Site Information', sub: 'Manage site details', icon: Globe },
              { title: 'System Security', sub: 'Configure security options', icon: Shield },
              { title: 'Email Configuration', sub: 'Set up email preferences', icon: Mail },
              { title: 'Backup Settings', sub: 'Configure backup options', icon: Database },
              { title: 'System Maintenance', sub: 'Maintenance and updates', icon: Wrench },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">{item.title}</h5>
                      <p className="text-[10px] text-slate-400">{item.sub}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              );
            })}
          </div>

          {/* SYSTEM INFORMATION */}
          <div className="rounded-2xl border border-emerald-500/15 bg-[#0c1f16] p-5 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-white pb-2 border-b border-white/5">System Information</h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Server Status</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Online</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">PHP Version</span>
                <span className="text-white font-mono">8.2.12</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Database Version</span>
                <span className="text-white font-mono">MySQL 8.0.33</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Server Time</span>
                <span className="text-white">May 25, 2024 11:15 AM</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Uptime</span>
                <span className="text-white">15 days, 7 hours</span>
              </div>

              {/* PROGRESS BARS */}
              <div className="pt-2 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Memory Usage</span>
                  <span className="text-white font-bold">45%</span>
                </div>
                <div className="w-full bg-[#04150e] h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[45%]" />
                </div>
              </div>

              <div className="pt-1 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Disk Usage</span>
                  <span className="text-white font-bold">52%</span>
                </div>
                <div className="w-full bg-[#04150e] h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[52%]" />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}