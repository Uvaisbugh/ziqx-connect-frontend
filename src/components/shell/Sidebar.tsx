'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Inbox,
  ContactRound,
  FileText,
  Settings,
  ChevronUp,
  MessageSquareText,
  LogOut,
  User,
  CheckCircle2,
} from 'lucide-react';

export type TabType = 'inbox' | 'contacts' | 'templates' | 'settings';

interface SidebarProps {
  inboxBadgeCount: number;
  onNavigate?: () => void;
  className?: string;
}

const navItems: {
  id: TabType;
  href: string;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'inbox',
    href: '/inbox',
    label: 'Inbox',
    icon: <Inbox className="size-5" strokeWidth={2} />,
  },
  {
    id: 'contacts',
    href: '/contacts',
    label: 'Contacts',
    icon: <ContactRound className="size-5" strokeWidth={2} />,
  },
  {
    id: 'templates',
    href: '/templates',
    label: 'Message Templates',
    icon: <FileText className="size-5" strokeWidth={2} />,
  },
  {
    id: 'settings',
    href: '/settings',
    label: 'Settings',
    icon: <Settings className="size-5" strokeWidth={2} />,
  },
];

function activeTabFromPath(pathname: string): TabType {
  if (pathname.startsWith('/inbox')) return 'inbox';
  if (pathname.startsWith('/templates')) return 'templates';
  if (pathname.startsWith('/settings')) return 'settings';
  return 'contacts';
}

export const Sidebar: React.FC<SidebarProps> = ({
  inboxBadgeCount,
  onNavigate,
  className = '',
}) => {
  const pathname = usePathname();
  const activeTab = activeTabFromPath(pathname);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <aside
      className={`w-[248px] shrink-0 h-full bg-white rounded-[24px] border border-[#eeece7] pl-[14px] pr-4 pt-[18px] pb-3 flex flex-col select-none ${className}`}
    >
      <div className="flex items-start gap-[10px] h-[70px] pl-2 pt-1.5 shrink-0">
        <div className="size-[42px] rounded-xl bg-[#1a1a18] flex items-center justify-center text-white shrink-0">
          <MessageSquareText className="size-[22px]" strokeWidth={2} />
        </div>
        <div className="flex flex-col gap-[3px]">
          <span className="text-[15px] font-medium leading-[15px] tracking-[-0.15px] text-[#1a1a18]">
            ziqx
          </span>
          <span className="text-[23px] font-extrabold leading-[23px] tracking-[-0.69px] text-[#1a1a18]">
            connect
          </span>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const badge =
            item.id === 'inbox' && inboxBadgeCount > 0
              ? inboxBadgeCount
              : undefined;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => onNavigate?.()}
              className={`w-full h-11 flex items-center justify-between pl-3.5 pr-3 rounded-xl text-[15px] font-semibold tracking-[-0.075px] transition-colors ${
                isActive
                  ? 'bg-[#1a1a18] text-white'
                  : 'text-[#2e2e2b] hover:bg-[#f4f3ef]'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className={isActive ? 'text-white' : 'text-[#2e2e2b]'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </span>

              {badge !== undefined && (
                <span
                  className={`min-w-[21px] h-[21px] px-1 rounded-full text-[11.5px] font-bold flex items-center justify-center shrink-0 ${
                    isActive
                      ? 'bg-white text-[#1a1a18]'
                      : 'bg-[#1a1a18] text-white'
                  }`}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="relative border-t border-[#eeece7] pt-3 shrink-0">
        {profileOpen && (
          <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-[#efede8] rounded-2xl p-2 shadow-modal animate-in fade-in slide-in-from-bottom-2 z-50">
            <div className="px-3 py-2 border-b border-[#f0eeea] mb-1">
              <p className="text-xs font-bold text-[#1a1a18]">Jabir MDN</p>
              <p className="text-[11px] text-[#8f8f8e]">jabir@ziqx.cc</p>
            </div>
            <Link
              href="/settings"
              onClick={() => {
                setProfileOpen(false);
                onNavigate?.();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#5b5b5a] hover:bg-[#f4f3ef] rounded-lg transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile Settings</span>
            </Link>
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
          type="button"
          aria-expanded={profileOpen}
          aria-haspopup="true"
          onClick={() => setProfileOpen(!profileOpen)}
          className="w-full h-[54px] rounded-[14px] pl-2 pr-1 flex items-center gap-[10px] hover:bg-[#faf9f7] transition-colors text-left"
        >
          <div className="size-[38px] rounded-full bg-[#e5e4df] shrink-0" />
          <div className="flex flex-col overflow-hidden flex-1 min-w-0">
            <span className="text-[14.5px] font-semibold leading-[18px] text-[#1a1a18] truncate">
              Jabir MDN
            </span>
            <span className="text-[12px] leading-[15px] text-[#7a7974] truncate">
              Sales Lead · Admin
            </span>
          </div>
          <ChevronUp
            className={`size-[18px] text-[#7a7974] transition-transform duration-200 shrink-0 ${
              profileOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
    </aside>
  );
};
