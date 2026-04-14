"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface UpvoteButtonProps {
  dealId: string;
  initialCount: number;
  className?: string;
}

export default function UpvoteButton({
  dealId,
  initialCount,
  className,
}: UpvoteButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [hasVoted, setHasVoted] = useState(false);

  const handleUpvote = async () => {
    const newVoted = !hasVoted;
    setHasVoted(newVoted);
    setCount((prev) => (newVoted ? prev + 1 : prev - 1));

    try {
      await fetch(`/api/deals/${dealId}/upvote`, {
        method: newVoted ? "POST" : "DELETE",
      });
    } catch {
      // Revert on error
      setHasVoted(!newVoted);
      setCount((prev) => (newVoted ? prev - 1 : prev + 1));
    }
  };

  return (
    <button
      onClick={handleUpvote}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
        hasVoted
          ? "border-[#2E5EA6] bg-[#2E5EA6]/10 text-[#2E5EA6]"
          : "border-gray-200 bg-white text-gray-500 hover:border-[#2E5EA6] hover:text-[#2E5EA6]",
        className
      )}
      aria-label={`Upvote deal, current count ${count}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path
          fillRule="evenodd"
          d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
          clipRule="evenodd"
        />
      </svg>
      <span>{count}</span>
    </button>
  );
}
