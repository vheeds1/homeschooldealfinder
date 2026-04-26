"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface Deal {
  id: string;
  title: string;
  slug: string;
  status: string;
  dealType: string;
  originalPrice: number | null;
  discountAmount: number | null;
  expiresAt: string | null;
  upvoteCount: number;
  viewCount: number;
  createdAt: string;
  vendor: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  initialDeals: Deal[];
  categories: Category[];
  total: number;
  pageSize: number;
  currentPage: number;
  currentFilters: {
    q: string;
    status: string;
    categoryId: string;
  };
}

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "FEATURED", label: "Featured" },
  { value: "UNVERIFIED", label: "Unverified" },
  { value: "EXPIRED", label: "Expired" },
];

export default function DealsManager({
  initialDeals,
  categories,
  total,
  pageSize,
  currentPage,
  currentFilters,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  const [deals, setDeals] = useState(initialDeals);
  const [search, setSearch] = useState(currentFilters.q);
  const [busyId, setBusyId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function applyFilters(updates: Partial<typeof currentFilters>) {
    const next = new URLSearchParams(sp.toString());
    const merged = { ...currentFilters, ...updates };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    next.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`);
    });
  }

  function goToPage(p: number) {
    const next = new URLSearchParams(sp.toString());
    next.set("page", String(p));
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  async function setStatus(id: string, status: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/deals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setDeals((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status } : d))
        );
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  }

  async function deleteDeal(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/deals/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeals((prev) => prev.filter((d) => d.id !== id));
        router.refresh();
      } else {
        alert("Failed to delete deal.");
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="adm-toolbar">
        <input
          type="search"
          placeholder="Search by title or vendor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") applyFilters({ q: search });
          }}
        />
        <select
          value={currentFilters.status}
          onChange={(e) => applyFilters({ status: e.target.value })}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={currentFilters.categoryId}
          onChange={(e) => applyFilters({ categoryId: e.target.value })}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="right">
          <Link href="/admin/deals/new" className="adm-btn">
            + Add Deal
          </Link>
        </div>
      </div>

      <div
        style={{
          fontSize: 12,
          color: "var(--ink-4)",
          marginBottom: 8,
        }}
      >
        Showing {deals.length} of {total} deals
      </div>

      {deals.length === 0 ? (
        <div className="adm-empty">
          <h3>No deals found</h3>
          <p>Try adjusting your filters or add a new deal.</p>
          <Link
            href="/admin/deals/new"
            className="adm-btn"
            style={{ marginTop: 16, display: "inline-flex" }}
          >
            + Add Deal
          </Link>
        </div>
      ) : (
        <>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Vendor</th>
                <th>Category</th>
                <th>Status</th>
                <th>Discount</th>
                <th>Expires</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr
                  key={deal.id}
                  style={{ opacity: busyId === deal.id ? 0.5 : 1 }}
                >
                  <td className="title">
                    <Link
                      href={`/deals/${deal.slug}`}
                      target="_blank"
                      style={{ color: "var(--ink)", textDecoration: "none" }}
                    >
                      {deal.title}
                    </Link>
                  </td>
                  <td>{deal.vendor.name}</td>
                  <td>{deal.category.name}</td>
                  <td>
                    <select
                      value={deal.status}
                      onChange={(e) => setStatus(deal.id, e.target.value)}
                      disabled={busyId === deal.id}
                      style={{
                        background: "var(--bg)",
                        border: "1px solid var(--line)",
                        borderRadius: 6,
                        padding: "4px 8px",
                        color: "var(--ink)",
                        fontSize: 12,
                        fontFamily: "inherit",
                      }}
                      aria-label="Deal status"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="FEATURED">Featured</option>
                      <option value="UNVERIFIED">Unverified</option>
                      <option value="EXPIRED">Expired</option>
                    </select>
                  </td>
                  <td>
                    {deal.dealType === "PERCENT_OFF" && deal.discountAmount
                      ? `${deal.discountAmount}%`
                      : deal.dealType === "DOLLAR_OFF" && deal.discountAmount
                        ? `$${deal.discountAmount}`
                        : deal.dealType === "FREE_TRIAL"
                          ? "Free trial"
                          : deal.dealType === "FREEBIE"
                            ? "Free"
                            : deal.dealType === "PROMO_CODE"
                              ? "Code"
                              : "—"}
                  </td>
                  <td>
                    {deal.expiresAt
                      ? new Date(deal.expiresAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="actions">
                    <Link
                      href={`/admin/deals/${deal.id}/edit`}
                      className="adm-btn ghost"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="adm-btn danger"
                      disabled={busyId === deal.id}
                      onClick={() => deleteDeal(deal.id, deal.title)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 20,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <button
                type="button"
                className="adm-btn ghost"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                ← Prev
              </button>
              <span style={{ fontSize: 13, color: "var(--ink-3)", padding: "0 12px" }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="adm-btn ghost"
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
