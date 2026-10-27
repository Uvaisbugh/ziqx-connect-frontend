'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { InboxRefresh } from './InboxRefresh';

export function AppShell({
  children,
  inboxBadgeCount,
}: {
  children: React.ReactNode;
  inboxBadgeCount: number;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeLabel = pathname.startsWith('/inbox')
    ? 'inbox'
    : pathname.startsWith('/templates')
      ? 'templates'
      : pathname.startsWith('/settings')
        ? 'settings'
        : 'contacts';

  return (
    <div className="h-screen w-screen bg-[#f8f7f4] p-3 sm:p-4 md:p-5 flex flex-col md:flex-row gap-4 md:gap-7 overflow-hidden text-[#1a1a18]">
      <InboxRefresh />

      <div className="md:hidden flex items-center justify-between pb-2 border-b border-[#e5e5e0]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-xl bg-white border border-[#e5e5e0] flex items-center justify-center text-[#1a1a18]"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <span className="font-extrabold text-base tracking-tight">
            ziqx connects
          </span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#1a1a18] text-white capitalize">
          {activeLabel}
        </span>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/40 backdrop-blur-xs flex">
          <div className="w-64 bg-white h-full p-4 flex flex-col justify-between shadow-modal">
            <Sidebar
              inboxBadgeCount={inboxBadgeCount}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      <div className="hidden md:flex shrink-0 h-full">
        <Sidebar inboxBadgeCount={inboxBadgeCount} />
      </div>

      <main className="flex-1 h-full overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
