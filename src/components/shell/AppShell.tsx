'use client';

import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div className="h-dvh w-full min-w-0 bg-[#f8f7f4] p-3 sm:p-4 lg:p-5 flex flex-col lg:flex-row gap-4 lg:gap-7 overflow-hidden text-[#1a1a18]">
      <InboxRefresh />

      <div className="lg:hidden flex items-center justify-between pb-2 border-b border-[#e5e5e0] pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-xl bg-white border border-[#e5e5e0] flex items-center justify-center text-[#1a1a18] shrink-0"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <span className="font-extrabold text-base tracking-tight truncate">
            ziqx connects
          </span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#1a1a18] text-white capitalize shrink-0">
          {activeLabel}
        </span>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/40 backdrop-blur-xs flex pb-[env(safe-area-inset-bottom)]">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="w-[min(100%,18rem)] max-w-full bg-white h-full p-4 flex flex-col justify-between shadow-modal"
          >
            <Sidebar
              inboxBadgeCount={inboxBadgeCount}
              onNavigate={() => setMobileMenuOpen(false)}
              className="w-full border-0 rounded-none h-full"
            />
          </div>
          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}

      <div className="hidden lg:flex shrink-0 h-full min-h-0">
        <Sidebar inboxBadgeCount={inboxBadgeCount} />
      </div>

      <main className="flex-1 min-w-0 min-h-0 overflow-hidden flex flex-col pb-[env(safe-area-inset-bottom)]">
        {children}
      </main>
    </div>
  );
}
