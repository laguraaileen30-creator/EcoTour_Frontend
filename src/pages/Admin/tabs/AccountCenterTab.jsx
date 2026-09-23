import React from 'react';
import { User, Bell, ClipboardList, Settings } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import ProfileTab from './ProfileTab';
import AnnouncementTab from './AnnouncementTab';
import ActivityLogsTab from './ActivityLogsTab';
import SettingsTab from './SettingsTab';

// My Profile, Notifications, Activity Logs and System Settings in one place.
// Each section keeps its own tab key, so header links / search results still deep-link to it.
export const ACCOUNT_SECTIONS = [
  { key: 'profile', label: 'My Profile', icon: User, Component: ProfileTab },
  { key: 'announcement', label: 'Notifications', icon: Bell, Component: AnnouncementTab },
  { key: 'activity_logs', label: 'Activity Logs', icon: ClipboardList, Component: ActivityLogsTab },
  { key: 'settings', label: 'System Settings', icon: Settings, Component: SettingsTab },
];

export default function AccountCenterTab({ section = 'profile' }) {
  const { setActiveTab } = useDashboard() || {};
  const current = ACCOUNT_SECTIONS.find((s) => s.key === section) || ACCOUNT_SECTIONS[0];
  const { Component } = current;

  return (
    <div className="space-y-5" style={{ color: 'var(--text)' }}>
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl w-fit" style={{ border: '1px solid var(--line)', background: 'var(--panel)' }}>
        {ACCOUNT_SECTIONS.map(({ key, label, icon: Icon }) => {
          const active = key === current.key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab && setActiveTab(key)}
              className="px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all"
              style={{
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? '#04170e' : 'var(--muted)',
              }}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          );
        })}
      </div>
      <Component />
    </div>
  );
}
