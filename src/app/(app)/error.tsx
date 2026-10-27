'use client';

import { Button } from '@ziqx/react-comps';
import { ziqxUi } from '@/lib/ui';

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center gap-3 text-center px-6">
      <h2 className="text-lg font-bold text-[#1a1a18]">Something went wrong</h2>
      <p className="text-sm text-[#8f8f8e]">
        Try again. Connection details stay on the server.
      </p>
      <Button
        type="button"
        onClick={reset}
        bgColor={ziqxUi.green}
        fgColor={ziqxUi.greenFg}
      >
        Try again
      </Button>
    </div>
  );
}
