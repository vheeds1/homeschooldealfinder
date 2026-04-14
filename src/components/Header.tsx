"use client";

import { useState } from "react";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/deals", label: "Deals" },
  { href: "/categories", label: "Categories" },
  { href: "/vendors", label: "Vendors" },
  { href: "/submit", label: "Submit a Deal" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-7 w-7 text-[#2E5EA6]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
          <span className="text-lg font-bold text-gray-900">
            HomeschoolDeals<span className="text-[#2E5EA6]">Finder</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right side */}
        <div className="hidden items-center gap-3 lg:flex">
          <SearchBar className="w-64" />
          <Link
            href="/sign-in"
            className="rounded-lg bg-[#2E5EA6] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1E4A8A]"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-gray-200 transition-all duration-200 lg:hidden",
          mobileMenuOpen ? "max-h-96" : "max-h-0 border-t-0"
        )}
      >
        <div className="space-y-1 px-4 py-3">
          <SearchBar className="mb-3" />
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/sign-in"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-2 block rounded-lg bg-[#2E5EA6] px-3 py-2 text-center text-base font-semibold text-white hover:bg-[#1E4A8A]"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
