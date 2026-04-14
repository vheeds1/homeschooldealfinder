"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FeaturedDealRevealProps {
  promoCode: string;
}

export default function FeaturedDealReveal({
  promoCode,
}: FeaturedDealRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  };

  if (!revealed) {
    return (
      <button
        onClick={handleReveal}
        className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-[#1A7A5E] bg-[#1A7A5E]/5 px-5 py-2.5 text-sm font-semibold text-[#1A7A5E] transition-colors hover:bg-[#1A7A5E]/10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path d="M8 16.25a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75zM3 8a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 8zm3-3.75A.75.75 0 016.75 3.5h6.5a.75.75 0 010 1.5h-6.5A.75.75 0 016 4.25z" />
        </svg>
        Reveal Promo Code
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <code className="rounded-lg border-2 border-[#1A7A5E] bg-[#1A7A5E]/5 px-4 py-2 text-lg font-bold tracking-widest text-[#1A7A5E]">
        {promoCode}
      </code>
      <button
        onClick={handleCopy}
        className={cn(
          "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          copied
            ? "bg-[#1A7A5E] text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
