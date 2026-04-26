"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const onSearch = () => {
    if (query.trim()) {
      router.push(`/deals?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isAdmin = session?.user?.role === "ADMIN";
  const isAuthed = status === "authenticated";

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
            {isAdmin && (
              <Link
                href="/admin"
                className={isActive("/admin") ? "active" : ""}
                style={{ color: "var(--accent)" }}
              >
                Admin
              </Link>
            )}
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

          {isAuthed ? (
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="hsdf-signin"
                style={{
                  background: isAdmin ? "var(--accent)" : "var(--primary)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                {isAdmin ? "Admin" : "Account"}
                <span style={{ fontSize: 10, opacity: 0.8 }}>▾</span>
              </button>
              {userMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    background: "var(--paper)",
                    border: "1px solid var(--line)",
                    borderRadius: 10,
                    padding: 6,
                    minWidth: 200,
                    boxShadow: "var(--shadow-lg)",
                    zIndex: 60,
                  }}
                >
                  <div
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid var(--line-soft)",
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--ink-3)",
                      }}
                    >
                      Signed in as
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "var(--ink)",
                        fontWeight: 600,
                        wordBreak: "break-all",
                      }}
                    >
                      {session?.user?.email}
                    </div>
                    {isAdmin && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--accent)",
                          marginTop: 4,
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}
                      >
                        Admin
                      </div>
                    )}
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setUserMenuOpen(false)}
                    style={menuItemStyle}
                  >
                    My Account
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      style={menuItemStyle}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    style={{
                      ...menuItemStyle,
                      width: "100%",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      borderTop: "1px solid var(--line-soft)",
                      marginTop: 4,
                      paddingTop: 10,
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="hsdf-signin" aria-label="Sign in">
              Sign In
            </Link>
          )}
        </div>
      </header>
    </>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: "block",
  padding: "8px 12px",
  fontSize: 14,
  color: "var(--ink-2)",
  textDecoration: "none",
  borderRadius: 6,
  fontWeight: 500,
};
