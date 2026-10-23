import React, { useState } from 'react';
import {
  Inbox,
  ContactRound,
  FileText,
  Settings,
  ChevronUp,
  MessageSquareText,
  LogOut,
  User,
  Shield,
  CheckCircle2,
} from 'lucide-react';

export type TabType = 'inbox' | 'contacts' | 'templates' | 'settings';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  inboxBadgeCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  inboxBadgeCount,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'inbox',
      label: 'Inbox',
      icon: <Inbox className="w-4 h-4 stroke-[2]" />,
      badge: inboxBadgeCount,
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: <ContactRound className="w-4 h-4 stroke-[2]" />,
    },
    {
      id: 'templates',
      label: 'Message Templates',
      icon: <FileText className="w-4 h-4 stroke-[2]" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4 stroke-[2]" />,
    },
  ];

  return (
    <aside className="w-56 md:w-60 shrink-0 h-full bg-white rounded-3xl border border-[#efede8] p-4 flex flex-col justify-between shadow-sm select-none">
      <div className="flex flex-col gap-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 px-1 pt-1">
          <div className="w-9 h-9 rounded-xl bg-[#1a1a18] flex items-center justify-center text-white shadow-xs shrink-0">
            <MessageSquareText className="w-4 h-4 stroke-[2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-[#5b5b5a] leading-tight">
              ziqx
            </span>
            <span className="text-base font-extrabold text-[#1a1a18] tracking-tight leading-tight">
              connect
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#1a1a18] text-white shadow-xs'
                    : 'text-[#5b5b5a] hover:text-[#1a1a18] hover:bg-[#f4f3ef]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-[#5b5b5a]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[#0b5c46] text-white'
                        : 'bg-[#0b5c46] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile section */}
      <div className="relative pt-4">
        {profileOpen && (
          <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-[#efede8] rounded-2xl p-2 shadow-modal animate-in fade-in slide-in-from-bottom-2 z-50">
            <div className="px-3 py-2 border-b border-[#f0eeea] mb-1">
              <p className="text-xs font-bold text-[#1a1a18]">Jabir MDN</p>
              <p className="text-[11px] text-[#8f8f8e]">jabir@ziqx.cc</p>
            </div>
            <button
              onClick={() => {
                setActiveTab('settings');
                setProfileOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#5b5b5a] hover:bg-[#f4f3ef] rounded-lg transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile Settings</span>
            </button>
            <div className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#0b5c46]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>WhatsApp Connected</span>
            </div>
            <div className="border-t border-[#f0eeea] my-1" />
            <button
              onClick={() => setProfileOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#ba2755] hover:bg-[#fbe5ec]/50 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="w-full rounded-2xl p-2 flex items-center justify-between hover:bg-[#faf9f7] transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#d8d6d0] shrink-0" />
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-[#1a1a18] truncate leading-tight">
                Jabir MDN
              </span>
              <span className="text-[10px] text-[#8f8f8e] truncate">
                Sales Lead · Admin
              </span>
            </div>
          </div>
          <ChevronUp
            className={`w-4 h-4 text-[#8f8f8e] transition-transform duration-200 shrink-0 ${
              profileOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
    </aside>
  );
};
