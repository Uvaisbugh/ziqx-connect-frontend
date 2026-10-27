'use client';

import Link from 'next/link';
import { Button } from '@ziqx/react-comps';
import { ziqxUi } from '@/lib/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#f8f7f4] text-[#1a1a18] px-4 text-center">
      <h1 className="text-2xl font-extrabold">Page not found</h1>
      <p className="text-sm text-[#8f8f8e]">That route does not exist in Ziqx Connect.</p>
      <Link href="/inbox" className="mt-2">
        <Button bgColor={ziqxUi.green} fgColor={ziqxUi.greenFg}>
          Back to inbox
        </Button>
      </Link>
    </div>
  );
}
