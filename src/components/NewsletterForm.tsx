"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("You're subscribed! Check your inbox.");
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
    <>
      <form onSubmit={handleSubmit} className="hsdf-newsletter-input">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          aria-label="Email address"
        />
        <button type="submit" disabled={status === "loading"}>
          {status === "loading"
            ? "..."
            : status === "success"
              ? "✓ Subscribed"
              : "Get the list"}
        </button>
      </form>
      {message && status === "error" && (
        <p
          style={{
            fontSize: 12,
            color: "#fca5a5",
            margin: 0,
          }}
        >
          {message}
        </p>
      )}
    </>
  );
}
