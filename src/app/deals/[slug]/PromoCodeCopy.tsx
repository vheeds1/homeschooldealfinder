"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface PromoCodeCopyProps {
  code: string;
}

export default function PromoCodeCopy({ code }: PromoCodeCopyProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <code className="rounded border border-dashed border-border bg-muted px-3 py-1.5 font-mono text-sm font-semibold tracking-wider">
        {code}
      </code>
      <button
        onClick={handleCopy}
        className={cn(
          "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          copied
            ? "bg-green-100 text-green-700"
            : "bg-primary/10 text-primary hover:bg-primary/20"
        )}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
