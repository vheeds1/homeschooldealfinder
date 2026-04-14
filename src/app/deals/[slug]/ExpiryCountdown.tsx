"use client";

import { useEffect, useState } from "react";

interface ExpiryCountdownProps {
  expiresAt: string;
}

function computeRemaining(target: number) {
  const diff = target - Date.now();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

export default function ExpiryCountdown({ expiresAt }: ExpiryCountdownProps) {
  const target = new Date(expiresAt).getTime();
  const [remaining, setRemaining] = useState(() => computeRemaining(target));

  useEffect(() => {
    const interval = setInterval(() => {
      const next = computeRemaining(target);
      setRemaining(next);
      if (!next) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [target]);

  if (!remaining) {
    return (
      <span className="text-sm font-medium text-red-600">
        This deal has expired
      </span>
    );
  }

  const isUrgent = remaining.days === 0 && remaining.hours < 24;

  return (
    <div className="flex items-center gap-1 text-sm">
      <span className={isUrgent ? "font-semibold text-red-600" : "text-muted-foreground"}>
        Expires in:
      </span>
      <div className="flex items-center gap-1 font-mono text-sm font-medium">
        {remaining.days > 0 && (
          <span className="rounded bg-muted px-1.5 py-0.5">{remaining.days}d</span>
        )}
        <span className="rounded bg-muted px-1.5 py-0.5">
          {String(remaining.hours).padStart(2, "0")}h
        </span>
        <span className="rounded bg-muted px-1.5 py-0.5">
          {String(remaining.minutes).padStart(2, "0")}m
        </span>
        <span className="rounded bg-muted px-1.5 py-0.5">
          {String(remaining.seconds).padStart(2, "0")}s
        </span>
      </div>
    </div>
  );
}
