"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/deals", label: "Deals" },
  { href: "/admin/vendors", label: "Vendors" },
  { href: "/admin/submissions", label: "Submissions" },
];

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav
      aria-label="Admin sections"
      style={{
        borderBottom: "1px solid var(--line)",
        display: "flex",
        gap: 4,
        overflowX: "auto",
      }}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.href, tab.exact);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              padding: "12px 18px",
              fontSize: 14,
              fontWeight: 600,
              color: active ? "var(--primary)" : "var(--ink-3)",
              textDecoration: "none",
              borderBottom: active
                ? "2px solid var(--primary)"
                : "2px solid transparent",
              marginBottom: -1,
              whiteSpace: "nowrap",
              transition: "color 0.15s",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
