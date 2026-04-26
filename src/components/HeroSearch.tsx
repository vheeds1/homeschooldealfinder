"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";

export default function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const onSearch = () => {
    if (query.trim()) {
      router.push(`/deals?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/deals");
    }
  };

  return (
    <div className="hsdf-hero-search">
      <Icon name="search" size={16} />
      <input
        placeholder="Search deals, curriculum, vendors…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        aria-label="Search deals"
      />
      <button type="button" onClick={onSearch}>
        Search <Icon name="arrow" size={14} stroke={2.2} />
      </button>
    </div>
  );
}
