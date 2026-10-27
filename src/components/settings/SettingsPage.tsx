'use client';

import React, { useState } from 'react';
import { Button, Input, Select } from '@ziqx/react-comps';
import {
  UserRound,
  UsersRound,
  Bell,
  ContactRound,
  CheckCircle2,
  RefreshCw,
  Plus,
  Lock,
  ChevronDown,
  X,
  UserPlus,
  MessageSquareText,
} from 'lucide-react';
import { TEAM_MEMBERS } from '@/data/mockData';
import { ziqxUi } from '@/lib/ui';
import { TeamMember } from '@/types';

export type WhatsAppAccountView = {
  connected: boolean;
  demo?: boolean;
  displayPhone?: string;
  verifiedName?: string;
  qualityRating?: string;
  error?: string;
};

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, disabled, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    } ${checked ? 'bg-[#0b5c46]' : 'bg-[#d1d0cb]'}`}
  >
    <div
      className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform duration-200 ${
        checked ? 'translate-x-4' : 'translate-x-0'
      }`}
    />
  </button>
);

export const SettingsPage: React.FC<{
  whatsappAccount?: WhatsAppAccountView;
}> = ({ whatsappAccount }) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'contacts' | 'team' | 'notifications'>('profile');
  const [team, setTeam] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Invite modal form state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteTitle, setInviteTitle] = useState('');
  const [inviteAccess, setInviteAccess] = useState<'Admin' | 'Manager' | 'Agent'>('Agent');

  // Google Contacts sync state
  const [isConnected, setIsConnected] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [syncDirection, setSyncDirection] = useState<'google-to-crm' | 'two-way' | 'crm-to-google'>('two-way');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedText, setLastSyncedText] = useState('Today, 09:40');

  // Fields needed toggles state
  const [fieldsState, setFieldsState] = useState({
    email: false,
    address: false,
    notes: false,
  });

  // Notifications state matching the 7 rows
  const [notifications, setNotifications] = useState({
    newMessage: { inApp: true, email: false },
    leadAssigned: { inApp: true, email: true },
    followUpDue: { inApp: true, email: true },
    templateStatus: { inApp: true, email: true },
    whatsappIssues: { inApp: true, email: true },
    dailySummary: { inApp: false, email: true },
    quietHours: false,
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: 'Jabir MDN',
    jobTitle: 'Sales Lead',
    workEmail: 'jabir@ziqx.cc',
    phone: '+91 98470 55012',
    timeZone: 'Asia/Kolkata (IST, UTC+5:30)',
    language: 'English',
  });

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncedText('Just now');
    }, 1000);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const initials = inviteName
      .trim()
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const colors = [
      { bg: '#e4eefb', text: '#1e60b5' },
      { bg: '#fbe5ec', text: '#ba2755' },
      { bg: '#ddf3e5', text: '#0b5c46' },
      { bg: '#fcefd6', text: '#b46b02' },
    ];
    const picked = colors[team.length % colors.length];

    const newMember: TeamMember = {
      id: `tm_${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      title: inviteTitle.trim() || 'Sales Executive',
      access: inviteAccess,
      status: 'Active',
      initials,
      avatarBg: picked.bg,
      avatarColor: picked.text,
    };

    setTeam([...team, newMember]);
    setInviteName('');
    setInviteEmail('');
    setInviteTitle('');
    setInviteAccess('Agent');
    setIsInviteOpen(false);
  };

  const handleAccessChange = (id: string, newAccess: 'Admin' | 'Manager' | 'Agent') => {
    setTeam((prev) =>
      prev.map((m) => (m.id === id ? { ...m, access: newAccess } : m))
    );
  };

  const subNavItems = [
    {
      id: 'profile' as const,
      label: 'Profile',
      sub: 'Name, email, preferences',
      icon: UserRound,
    },
    {
      id: 'contacts' as const,
      label: 'Contacts',
      sub: 'Sync, fields, labels',
      icon: ContactRound,
    },
    {
      id: 'team' as const,
      label: 'Team members',
      sub: 'Access and invitations',
      icon: UsersRound,
    },
    {
      id: 'notifications' as const,
      label: 'Notifications',
      sub: 'Alerts and quiet hours',
      icon: Bell,
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Top Header */}
      <div className="pb-4 px-1">
        <h1 className="text-2xl font-extrabold text-[#1a1a18] tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-[#8f8f8e] mt-0.5">
          Your profile, contacts, team and notifications.
        </p>
      </div>

      {whatsappAccount && (
        <div
          className={`mb-4 px-4 py-3 rounded-2xl border flex items-start gap-3 ${
            whatsappAccount.connected
              ? 'bg-[#eaf8ef] border-[#ddf3e5]'
              : 'bg-[#fee2e2] border-[#fecaca]'
          }`}
        >
          <div
            className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${
              whatsappAccount.connected
                ? 'bg-[#0b5c46] text-white'
                : 'bg-[#b91c1c] text-white'
            }`}
          >
            <MessageSquareText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#1a1a18]">
              {whatsappAccount.connected
                ? whatsappAccount.demo
                  ? 'WhatsApp demo mode'
                  : 'WhatsApp Cloud API connected'
                : 'WhatsApp disconnected'}
            </p>
            {whatsappAccount.connected ? (
              <p className="text-xs text-[#5b5b5a] mt-0.5">
                {whatsappAccount.verifiedName || 'Business number'}
                {whatsappAccount.displayPhone
                  ? ` · ${whatsappAccount.displayPhone}`
                  : ''}
                {whatsappAccount.qualityRating
                  ? ` · Quality ${whatsappAccount.qualityRating}`
                  : ''}
                {whatsappAccount.demo ? ' · UI testing only, no Meta calls' : ''}
              </p>
            ) : (
              <p className="text-xs text-[#b91c1c] mt-0.5">
                {whatsappAccount.error ||
                  'Set Meta credentials in .env.local to connect.'}
              </p>
            )}
            <p className="text-[11px] text-[#8f8f8e] mt-1">
              {whatsappAccount.demo
                ? 'Demo mode is on. Add Meta credentials or set WHATSAPP_DEMO_MODE=false for live Graph API.'
                : "Meta webhook callback: {origin}/api/whatsapp/webhook (HTTPS, subscribe to messages)."}
            </p>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="curve-scroll flex-1 flex flex-col lg:flex-row gap-5 items-start overflow-y-auto pr-1 pb-4 min-h-0">
        {/* Left: Standalone Sub-Navigation Card */}
        <div className="w-full lg:w-56 shrink-0 bg-white rounded-3xl border border-[#efede8] p-2 shadow-sm flex flex-row lg:flex-col gap-1 flex-wrap lg:flex-nowrap">
          {subNavItems.map((item) => {
            const isActive = activeSubTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSubTab(item.id)}
                className={`flex-1 min-w-[calc(50%-0.25rem)] lg:min-w-0 lg:w-full flex items-center gap-3 p-2.5 rounded-2xl transition-colors text-left ${
                  isActive
                    ? 'bg-[#f0eeea]'
                    : 'hover:bg-[#faf9f7]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#1a1a18] text-white shadow-xs'
                      : 'border border-[#e5e5e0] text-[#5b5b5a] bg-white'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs text-[#1a1a18] leading-tight">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-[#8f8f8e] truncate mt-0.5 hidden sm:block">
                    {item.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Content Area */}
        <div className="flex-1 w-full min-w-0">
          {/* ========================================================= */}
          {/* 1. PROFILE SUBSECTION */}
          {/* ========================================================= */}
          {activeSubTab === 'profile' && (
            <div className="bg-white rounded-3xl border border-[#efede8] p-4 sm:p-7 shadow-sm">
              <div>
                <h2 className="text-base font-bold text-[#1a1a18]">Profile</h2>
                <p className="text-xs text-[#8f8f8e] mt-0.5">
                  Your details as teammates see them in Ziqx Connect.
                </p>
              </div>

              {/* Profile Avatar & Info Header */}
              <div className="mt-6 mb-7 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#f5c61b] flex items-center justify-center text-black font-extrabold text-base shrink-0 shadow-xs">
                  JM
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1a1a18]">Jabir MDN</h3>
                  <p className="text-xs text-[#8f8f8e] mt-0.5">Sales Lead · Admin</p>
                </div>
              </div>

              {/* Form: Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Input
                  label="Full name *"
                  type="text"
                  value={profileForm.fullName}
                  bgColor={ziqxUi.surface}
                  fgColor={ziqxUi.dark}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, fullName: e.target.value })
                  }
                />

                <Input
                  label="Job title"
                  type="text"
                  value={profileForm.jobTitle}
                  bgColor={ziqxUi.surface}
                  fgColor={ziqxUi.dark}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, jobTitle: e.target.value })
                  }
                />

                <Input
                  label="Work email *"
                  type="email"
                  value={profileForm.workEmail}
                  bgColor={ziqxUi.surface}
                  fgColor={ziqxUi.dark}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, workEmail: e.target.value })
                  }
                />

                <Input
                  label="Phone"
                  type="text"
                  value={profileForm.phone}
                  bgColor={ziqxUi.surface}
                  fgColor={ziqxUi.dark}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                />

                <Select
                  label="Time zone"
                  value={profileForm.timeZone}
                  onValueChange={(timeZone) =>
                    setProfileForm({ ...profileForm, timeZone })
                  }
                  options={[
                    {
                      value: 'Asia/Kolkata (IST, UTC+5:30)',
                      label: 'Asia/Kolkata (IST, UTC+5:30)',
                    },
                    {
                      value: 'Asia/Dubai (GST, UTC+4:00)',
                      label: 'Asia/Dubai (GST, UTC+4:00)',
                    },
                    {
                      value: 'Europe/London (BST, UTC+1:00)',
                      label: 'Europe/London (BST, UTC+1:00)',
                    },
                    {
                      value: 'America/New_York (EDT, UTC-4:00)',
                      label: 'America/New_York (EDT, UTC-4:00)',
                    },
                  ]}
                />

                <Select
                  label="Language"
                  value={profileForm.language}
                  onValueChange={(language) =>
                    setProfileForm({ ...profileForm, language })
                  }
                  options={[
                    { value: 'English', label: 'English' },
                    { value: 'Arabic', label: 'Arabic' },
                    { value: 'Hindi', label: 'Hindi' },
                    { value: 'Malayalam', label: 'Malayalam' },
                  ]}
                />
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. CONTACTS SUBSECTION (Two stacked cards) */}
          {/* ========================================================= */}
          {activeSubTab === 'contacts' && (
            <div className="flex flex-col gap-5">
              {/* Card 1: Google Contacts sync */}
              <div className="bg-white rounded-3xl border border-[#efede8] p-4 sm:p-7 shadow-sm">
                <div>
                  <h2 className="text-base font-bold text-[#1a1a18]">
                    Google Contacts sync
                  </h2>
                  <p className="text-xs text-[#8f8f8e] mt-0.5">
                    Keep your saved contacts in step with your Google account.
                  </p>
                </div>

                {/* Connection Status Banner */}
                {isConnected ? (
                  <div className="mt-5 p-3.5 rounded-2xl bg-[#ddf3e5]/50 border border-[#bce8cc] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckCircle2 className="w-5 h-5 text-[#0b5c46] shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#0b5c46]">
                          Connected to Google Contacts
                        </h4>
                        <p className="text-[11px] text-[#0b5c46]/80 mt-0.5 truncate">
                          jabir@ziqx.cc · Last synced {lastSyncedText}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsConnected(false)}
                        className="text-xs font-semibold text-[#b91c1c] hover:underline cursor-pointer"
                      >
                        Disconnect
                      </button>
                      <button
                        type="button"
                        onClick={handleSyncNow}
                        disabled={isSyncing}
                        className="border border-[#0b5c46] text-[#0b5c46] hover:bg-[#0b5c46]/10 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`}
                        />
                        <span>Sync now</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 p-3.5 rounded-2xl bg-[#faf9f7] border border-[#efede8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#5b5b5a]">
                        Google Contacts disconnected
                      </h4>
                      <p className="text-[11px] text-[#8f8f8e] mt-0.5">
                        Connect your account to sync contacts automatically.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsConnected(true)}
                      className="bg-[#0b5c46] text-white hover:bg-[#084836] px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                      Connect
                    </button>
                  </div>
                )}

                {/* Automatic sync row */}
                <div className="mt-6 pt-5 border-t border-[#f0eeea] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-[#1a1a18]">
                      Automatic sync
                    </h4>
                    <p className="text-xs text-[#8f8f8e] mt-0.5">
                      Run in the background without opening this page.
                    </p>
                  </div>
                  <ToggleSwitch
                    label="Automatic sync"
                    checked={autoSync}
                    onChange={setAutoSync}
                  />
                </div>

                {/* Sync direction row */}
                <div className="mt-5 pt-5 border-t border-[#f0eeea] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-[#1a1a18]">
                      Sync direction
                    </h4>
                    <p className="text-xs text-[#8f8f8e] mt-0.5">
                      Changes on either side are copied to the other.
                    </p>
                  </div>

                  <div className="bg-[#f0eeea] p-1 rounded-xl flex items-center text-xs flex-wrap gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSyncDirection('google-to-crm')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        syncDirection === 'google-to-crm'
                          ? 'bg-white text-[#1a1a18] font-bold shadow-xs'
                          : 'text-[#5b5b5a] font-medium hover:text-[#1a1a18]'
                      }`}
                    >
                      Google → CRM
                    </button>
                    <button
                      type="button"
                      onClick={() => setSyncDirection('two-way')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        syncDirection === 'two-way'
                          ? 'bg-white text-[#1a1a18] font-bold shadow-xs'
                          : 'text-[#5b5b5a] font-medium hover:text-[#1a1a18]'
                      }`}
                    >
                      Two-way
                    </button>
                    <button
                      type="button"
                      onClick={() => setSyncDirection('crm-to-google')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        syncDirection === 'crm-to-google'
                          ? 'bg-white text-[#1a1a18] font-bold shadow-xs'
                          : 'text-[#5b5b5a] font-medium hover:text-[#1a1a18]'
                      }`}
                    >
                      CRM → Google
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Fields needed */}
              <div className="bg-white rounded-3xl border border-[#efede8] p-4 sm:p-7 shadow-sm">
                <div>
                  <h2 className="text-base font-bold text-[#1a1a18]">
                    Fields needed
                  </h2>
                  <p className="text-xs text-[#8f8f8e] mt-0.5">
                    Choose what must be filled in when saving or importing a contact.
                  </p>
                </div>

                <div className="divide-y divide-[#f0eeea] mt-5">
                  {/* Row 1: Name */}
                  <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 first:pt-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-[#1a1a18]">
                        Name
                      </h4>
                      <p className="text-xs text-[#8f8f8e] mt-0.5">
                        Shown across the inbox, templates and contact list.
                      </p>
                    </div>
                    <span className="bg-[#f4f3ef] text-[#5b5b5a] text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5 select-none self-start sm:self-auto shrink-0">
                      <Lock className="w-3 h-3 text-[#5b5b5a]" />
                      <span>Always required</span>
                    </span>
                  </div>

                  {/* Row 2: Phone number */}
                  <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-[#1a1a18]">
                        Phone number
                      </h4>
                      <p className="text-xs text-[#8f8f8e] mt-0.5">
                        Needed to send WhatsApp messages.
                      </p>
                    </div>
                    <span className="bg-[#f4f3ef] text-[#5b5b5a] text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5 select-none self-start sm:self-auto shrink-0">
                      <Lock className="w-3 h-3 text-[#5b5b5a]" />
                      <span>Always required</span>
                    </span>
                  </div>

                  {/* Row 3: Email */}
                  <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-[#1a1a18]">
                        Email
                      </h4>
                      <p className="text-xs text-[#8f8f8e] mt-0.5">
                        For proposals and Google Contacts matching.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <span className="text-xs text-[#8f8f8e]">Optional</span>
                      <ToggleSwitch
                        label="Email required"
                        checked={fieldsState.email}
                        onChange={(c) =>
                          setFieldsState({ ...fieldsState, email: c })
                        }
                      />
                    </div>
                  </div>

                  {/* Row 4: Address */}
                  <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-[#1a1a18]">
                        Address
                      </h4>
                      <p className="text-xs text-[#8f8f8e] mt-0.5">
                        Street, city and PIN code.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <span className="text-xs text-[#8f8f8e]">Optional</span>
                      <ToggleSwitch
                        label="Address required"
                        checked={fieldsState.address}
                        onChange={(c) =>
                          setFieldsState({ ...fieldsState, address: c })
                        }
                      />
                    </div>
                  </div>

                  {/* Row 5: Notes */}
                  <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 last:pb-1">
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-[#1a1a18]">
                        Notes
                      </h4>
                      <p className="text-xs text-[#8f8f8e] mt-0.5">
                        A short note about the enquiry.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <span className="text-xs text-[#8f8f8e]">Optional</span>
                      <ToggleSwitch
                        label="Notes required"
                        checked={fieldsState.notes}
                        onChange={(c) =>
                          setFieldsState({ ...fieldsState, notes: c })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. TEAM MEMBERS SUBSECTION */}
          {/* ========================================================= */}
          {activeSubTab === 'team' && (
            <div className="bg-white rounded-3xl border border-[#efede8] p-4 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-[#1a1a18]">
                    Team members
                  </h2>
                  <p className="text-xs text-[#8f8f8e] mt-0.5">
                    {team.length} people in this workspace
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsInviteOpen(true)}
                  className="bg-[#0b5c46] hover:bg-[#084836] text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite member</span>
                </button>
              </div>

              {/* Members Table */}
              <div className="curve-scroll overflow-x-auto -mx-1 px-1">
                <table className="w-full text-left text-xs border-collapse min-w-[36rem]">
                  <thead>
                    <tr className="text-[#8f8f8e] text-[11px] font-medium border-b border-[#f0eeea]">
                      <th className="pb-3 font-medium">Member</th>
                      <th className="pb-3 font-medium">Title</th>
                      <th className="pb-3 font-medium">Access</th>
                      <th className="pb-3 font-medium text-right pr-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eeea]">
                    {team.map((member) => (
                      <tr key={member.id} className="hover:bg-[#faf9f7] transition-colors">
                        {/* Member Name, Email, Avatar */}
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs"
                              style={{
                                backgroundColor: member.avatarBg,
                                color: member.avatarColor || '#1a1a18',
                              }}
                            >
                              {member.initials}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-xs text-[#1a1a18]">
                                {member.name}
                              </span>
                              <span className="text-[11px] text-[#8f8f8e]">
                                {member.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Title */}
                        <td className="py-3.5 px-2 text-xs text-[#5b5b5a]">
                          {member.title}
                        </td>

                        {/* Access dropdown */}
                        <td className="py-3.5 px-2">
                          <div className="relative inline-block w-28">
                            <select
                              value={member.access}
                              onChange={(e) =>
                                handleAccessChange(
                                  member.id,
                                  e.target.value as 'Admin' | 'Manager' | 'Agent'
                                )
                              }
                              className="w-full appearance-none bg-white border border-[#e5e5e0] rounded-lg px-2.5 py-1 text-xs text-[#1a1a18] pr-6 focus:outline-none focus:border-[#0b5c46] cursor-pointer"
                            >
                              <option value="Admin">Admin</option>
                              <option value="Manager">Manager</option>
                              <option value="Agent">Agent</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-[#8f8f8e] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </td>

                        {/* Status badge */}
                        <td className="py-3.5 text-right pr-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#ddf3e5] text-[#0b5c46]">
                            {member.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Explanatory note */}
              <p className="text-[11px] text-[#8f8f8e] mt-8 pt-4">
                Admins manage settings and the WhatsApp connection. Managers see every agent's leads. Agents see only leads assigned to them.
              </p>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. NOTIFICATIONS SUBSECTION */}
          {/* ========================================================= */}
          {activeSubTab === 'notifications' && (
            <div className="bg-white rounded-3xl border border-[#efede8] p-4 sm:p-7 shadow-sm">
              <div className="mb-4">
                <h2 className="text-base font-bold text-[#1a1a18]">
                  Notifications
                </h2>
                <p className="text-xs text-[#8f8f8e] mt-0.5">
                  Choose how you hear about activity. These apply to your account only.
                </p>
              </div>

              {/* Table of Notification Settings */}
              <div className="curve-scroll overflow-x-auto -mx-1 px-1">
                <table className="w-full text-left text-xs border-collapse min-w-[36rem]">
                  <thead>
                    <tr className="text-[#8f8f8e] text-[11px] font-medium border-b border-[#f0eeea]">
                      <th className="pb-3 font-medium">Event</th>
                      <th className="pb-3 font-medium text-center w-16">In-app</th>
                      <th className="pb-3 font-medium text-center w-16">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eeea]">
                    {/* Row 1: New message from a lead (In-app ON, Email OFF) */}
                    <tr className="hover:bg-[#faf9f7] transition-colors">
                      <td className="py-3.5 pr-4">
                        <h4 className="text-xs font-semibold text-[#1a1a18]">
                          New message from a lead
                        </h4>
                        <p className="text-xs text-[#8f8f8e] mt-0.5">
                          When a contact replies on WhatsApp
                        </p>
                      </td>
                      <td className="py-3.5 text-center">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            label="New message from a lead in-app"
                            checked={notifications.newMessage.inApp}
                            onChange={(c) =>
                              setNotifications({
                                ...notifications,
                                newMessage: { ...notifications.newMessage, inApp: c },
                              })
                            }
                          />
                        </div>
                      </td>
                      <td className="py-3.5 text-center">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            label="New message from a lead email"
                            checked={notifications.newMessage.email}
                            onChange={(c) =>
                              setNotifications({
                                ...notifications,
                                newMessage: { ...notifications.newMessage, email: c },
                              })
                            }
                          />
                        </div>
                      </td>
                    </tr>

                    {/* Row 2: Lead assigned to me (In-app ON, Email ON) */}
                    <tr className="hover:bg-[#faf9f7] transition-colors">
                      <td className="py-3.5 pr-4">
                        <h4 className="text-xs font-semibold text-[#1a1a18]">
                          Lead assigned to me
                        </h4>
                        <p className="text-xs text-[#8f8f8e] mt-0.5">
                          When someone assigns you a lead
                        </p>
                      </td>
                      <td className="py-3.5 text-center">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            label="Lead assigned to me in-app"
                            checked={notifications.leadAssigned.inApp}
                            onChange={(c) =>
                              setNotifications({
                                ...notifications,
                                leadAssigned: { ...notifications.leadAssigned, inApp: c },
                              })
                            }
                          />
                        </div>
                      </td>
                      <td className="py-3.5 text-center">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            label="Lead assigned to me email"
                            checked={notifications.leadAssigned.email}
                            onChange={(c) =>
                              setNotifications({
                                ...notifications,
                                leadAssigned: { ...notifications.leadAssigned, email: c },
                              })
                            }
                          />
                        </div>
                      </td>
                    </tr>

                    {/* Row 3: Follow-up due (In-app ON, Email ON) */}
                    <tr className="hover:bg-[#faf9f7] transition-colors">
                      <td className="py-3.5 pr-4">
                        <h4 className="text-xs font-semibold text-[#1a1a18]">
                          Follow-up due
                        </h4>
                        <p className="text-xs text-[#8f8f8e] mt-0.5">
                          At the scheduled time, and when overdue
                        </p>
                      </td>
                      <td className="py-3.5 text-center">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            label="Follow-up due in-app"
                            checked={notifications.followUpDue.inApp}
                            onChange={(c) =>
                              setNotifications({
                                ...notifications,
                                followUpDue: { ...notifications.followUpDue, inApp: c },
                              })
                            }
                          />
                        </div>
                      </td>
                      <td className="py-3.5 text-center">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            label="Follow-up due email"
                            checked={notifications.followUpDue.email}
                            onChange={(c) =>
                              setNotifications({
                                ...notifications,
                                followUpDue: { ...notifications.followUpDue, email: c },
                              })
                            }
                          />
                        </div>
                      </td>
                    </tr>

                    {/* Row 4: Template status changes (In-app ON, Email ON) */}
                    <tr className="hover:bg-[#faf9f7] transition-colors">
                      <td className="py-3.5 pr-4">
                        <h4 className="text-xs font-semibold text-[#1a1a18]">
                          Template status changes
                        </h4>
                        <p className="text-xs text-[#8f8f8e] mt-0.5">
                          Approved, rejected or paused by Meta
                        </p>
                      </td>
                      <td className="py-3.5 text-center">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            label="Template status changes in-app"
                            checked={notifications.templateStatus.inApp}
                            onChange={(c) =>
                              setNotifications({
                                ...notifications,
                                templateStatus: { ...notifications.templateStatus, inApp: c },
                              })
                            }
                          />
                        </div>
                      </td>
                      <td className="py-3.5 text-center">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            label="Template status changes email"
                            checked={notifications.templateStatus.email}
                            onChange={(c) =>
                              setNotifications({
                                ...notifications,
                                templateStatus: { ...notifications.templateStatus, email: c },
                              })
                            }
                          />
                        </div>
                      </td>
                    </tr>

                    {/* Row 5: WhatsApp connection issues (In-app ON, Email ON) */}
                    <tr className="hover:bg-[#faf9f7] transition-colors">
                      <td className="py-3.5 pr-4">
                        <h4 className="text-xs font-semibold text-[#1a1a18]">
                          WhatsApp connection issues
                        </h4>
                        <p className="text-xs text-[#8f8f8e] mt-0.5">
                          Disconnects and webhook delays
                        </p>
                      </td>
                      <td className="py-3.5 text-center">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            label="WhatsApp connection issues in-app"
                            checked={notifications.whatsappIssues.inApp}
                            onChange={(c) =>
                              setNotifications({
                                ...notifications,
                                whatsappIssues: { ...notifications.whatsappIssues, inApp: c },
                              })
                            }
                          />
                        </div>
                      </td>
                      <td className="py-3.5 text-center">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            label="WhatsApp connection issues email"
                            checked={notifications.whatsappIssues.email}
                            onChange={(c) =>
                              setNotifications({
                                ...notifications,
                                whatsappIssues: { ...notifications.whatsappIssues, email: c },
                              })
                            }
                          />
                        </div>
                      </td>
                    </tr>

                    {/* Row 6: Daily summary (In-app OFF, Email ON) */}
                    <tr className="hover:bg-[#faf9f7] transition-colors">
                      <td className="py-3.5 pr-4">
                        <h4 className="text-xs font-semibold text-[#1a1a18]">
                          Daily summary
                        </h4>
                        <p className="text-xs text-[#8f8f8e] mt-0.5">
                          A morning digest of leads and follow-ups
                        </p>
                      </td>
                      <td className="py-3.5 text-center">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            label="Daily summary in-app"
                            checked={notifications.dailySummary.inApp}
                            onChange={(c) =>
                              setNotifications({
                                ...notifications,
                                dailySummary: { ...notifications.dailySummary, inApp: c },
                              })
                            }
                          />
                        </div>
                      </td>
                      <td className="py-3.5 text-center">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            label="Daily summary email"
                            checked={notifications.dailySummary.email}
                            onChange={(c) =>
                              setNotifications({
                                ...notifications,
                                dailySummary: { ...notifications.dailySummary, email: c },
                              })
                            }
                          />
                        </div>
                      </td>
                    </tr>

                    {/* Row 7: Quiet hours (Single OFF toggle aligned right) */}
                    <tr className="hover:bg-[#faf9f7] transition-colors">
                      <td className="py-3.5 pr-4" colSpan={2}>
                        <h4 className="text-xs font-semibold text-[#1a1a18]">
                          Quiet hours
                        </h4>
                        <p className="text-xs text-[#8f8f8e] mt-0.5">
                          Mute email and in-app alerts overnight. Overdue follow-ups still show on the dashboard.
                        </p>
                      </td>
                      <td className="py-3.5 text-center">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            label="Quiet hours"
                            checked={notifications.quietHours}
                            onChange={(c) =>
                              setNotifications({ ...notifications, quietHours: c })
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-member-title"
            className="bg-white rounded-3xl border border-[#efede8] p-4 sm:p-6 max-w-md w-full max-h-[min(90dvh,640px)] overflow-y-auto shadow-modal animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#f0eeea] gap-2">
              <div className="min-w-0">
                <h3 id="invite-member-title" className="text-base font-bold text-[#1a1a18]">
                  Invite Team Member
                </h3>
                <p className="text-xs text-[#8f8f8e] mt-0.5">
                  Send an invitation to join your workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8f8f8e] hover:text-[#1a1a18] hover:bg-[#efede8] transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-[#5b5b5a] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full border border-[#e5e5e0] rounded-xl px-3.5 py-2 text-xs text-[#1a1a18] outline-none focus:border-[#0b5c46]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5b5b5a] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="rahul@ziqx.cc"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full border border-[#e5e5e0] rounded-xl px-3.5 py-2 text-xs text-[#1a1a18] outline-none focus:border-[#0b5c46]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5b5b5a] mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sales Executive"
                  value={inviteTitle}
                  onChange={(e) => setInviteTitle(e.target.value)}
                  className="w-full border border-[#e5e5e0] rounded-xl px-3.5 py-2 text-xs text-[#1a1a18] outline-none focus:border-[#0b5c46]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5b5b5a] mb-1">
                  Access Role
                </label>
                <select
                  value={inviteAccess}
                  onChange={(e) =>
                    setInviteAccess(e.target.value as 'Admin' | 'Manager' | 'Agent')
                  }
                  className="w-full border border-[#e5e5e0] rounded-xl px-3.5 py-2 text-xs text-[#1a1a18] outline-none focus:border-[#0b5c46] bg-white cursor-pointer"
                >
                  <option value="Agent">Agent (Can only see assigned leads)</option>
                  <option value="Manager">Manager (Can see all leads)</option>
                  <option value="Admin">Admin (Full settings & connection access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 flex-wrap pt-3 border-t border-[#f0eeea]">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5b5b5a] hover:bg-[#faf9f7] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0b5c46] hover:bg-[#084836] text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
