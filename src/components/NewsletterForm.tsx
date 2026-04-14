"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface NewsletterFormProps {
  className?: string;
}

export default function NewsletterForm({ className }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("You're subscribed! Check your inbox for a welcome email.");
        setEmail("");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2E5EA6] focus:outline-none focus:ring-2 focus:ring-[#2E5EA6]/20"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-[#2E5EA6] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1E4A8A] disabled:opacity-50"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </div>
      {message && (
        <p
          className={cn(
            "text-sm",
            status === "success" ? "text-[#1A7A5E]" : "text-red-600"
          )}
        >
          {message}
        </p>
      )}
    </form>
  );
}
