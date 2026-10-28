'use client';

import { useEffect, useState } from 'react';
import { formatCountdown } from '@/lib/prayer';

export function Countdown({ targetMs }: { targetMs: number | null }) {
  const [remaining, setRemaining] = useState(targetMs);

  useEffect(() => {
    setRemaining(targetMs);
    if (targetMs == null) return;

    const started = Date.now();
    const initial = targetMs;
    const id = window.setInterval(() => {
      setRemaining(Math.max(0, initial - (Date.now() - started)));
    }, 1000);

    return () => window.clearInterval(id);
  }, [targetMs]);

  if (remaining == null) {
    return <span className="font-display text-4xl tracking-tight text-ink-muted">—</span>;
  }

  return (
    <span className="font-display text-4xl tracking-tight text-teal-deep tabular-nums sm:text-5xl">
      {formatCountdown(remaining)}
    </span>
  );
}
