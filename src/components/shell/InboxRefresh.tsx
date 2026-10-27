'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function InboxRefresh() {
  const router = useRouter();

  useEffect(() => {
    const id = window.setInterval(() => {
      router.refresh();
    }, 4000);
    return () => window.clearInterval(id);
  }, [router]);

  return null;
}
