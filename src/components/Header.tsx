"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import BrandMark from "./BrandMark";
import Icon from "./Icon";

const navLinks = [
  { href: "/", label: "Deals" },
  { href: "/categories", label: "Categories" },
  { href: "/deals", label: "Browse" },
  { href: "/submit", label: "Submit a Deal" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const onSearch = () => {
    if (query.trim()) {
      router.push(`/deals?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[#5b9bff] focus:px-4 focus:py-2 focus:text-white focus:outline-none"
      >
        Skip to main content
      </a>
      <header className="hsdf-header" role="banner">
        <div className="hsdf-header-inner">
          <Link href="/" className="hsdf-logo">
            <BrandMark size={32} />
            <span className="hsdf-logo-mark">
              Homeschool<span className="accent">DealFinder</span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hsdf-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={isActive(link.href) ? "active" : ""}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hsdf-header-search">
            <Icon name="search" size={14} />
            <input
              placeholder="Search deals, vendors, categories…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              aria-label="Search deals"
            />
          </div>

          <Link
            href="/login"
            className="hsdf-signin"
            aria-label="Sign in"
          >
            Sign In
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="hsdf-icon-btn lg:hidden"
            style={{ display: "none" }}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            <Icon name="menu" size={18} />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            style={{
              borderTop: "1px solid var(--line)",
              padding: "12px 20px",
              background: "var(--paper)",
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "10px 0",
                  color: "var(--ink-2)",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
