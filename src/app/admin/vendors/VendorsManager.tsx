"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface Vendor {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  isPartner: boolean;
  affiliateNetwork: string | null;
  _count: { deals: number };
}

export default function VendorsManager({
  initial,
  initialQuery,
}: {
  initial: Vendor[];
  initialQuery: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  const [vendors, setVendors] = useState(initial);
  const [search, setSearch] = useState(initialQuery);
  const [busyId, setBusyId] = useState<string | null>(null);

  function applySearch() {
    const next = new URLSearchParams(sp.toString());
    if (search) next.set("q", search);
    else next.delete("q");
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  async function deleteVendor(id: string, name: string, dealCount: number) {
    if (dealCount > 0) {
      alert(
        `Can't delete "${name}" — it still has ${dealCount} deal${dealCount !== 1 ? "s" : ""}. Reassign or delete those deals first.`
      );
      return;
    }
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, { method: "DELETE" });
      if (res.ok) {
        setVendors((prev) => prev.filter((v) => v.id !== id));
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to delete vendor.");
      }
    } finally {
      setBusyId(null);
    }
  }

  async function togglePartner(vendor: Vendor) {
    setBusyId(vendor.id);
    try {
      const res = await fetch(`/api/admin/vendors/${vendor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPartner: !vendor.isPartner }),
      });
      if (res.ok) {
        setVendors((prev) =>
          prev.map((v) =>
            v.id === vendor.id ? { ...v, isPartner: !v.isPartner } : v
          )
        );
        router.refresh();
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
          placeholder="Search vendors…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applySearch()}
        />
        <div className="right">
          <Link href="/admin/vendors/new" className="adm-btn">
            + Add Vendor
          </Link>
        </div>
      </div>

      <div style={{ fontSize: 12, color: "var(--ink-4)", marginBottom: 8 }}>
        {vendors.length} vendor{vendors.length !== 1 ? "s" : ""}
      </div>

      {vendors.length === 0 ? (
        <div className="adm-empty">
          <h3>No vendors yet</h3>
          <p>Add your first vendor to start tracking partnerships.</p>
          <Link
            href="/admin/vendors/new"
            className="adm-btn"
            style={{ marginTop: 16, display: "inline-flex" }}
          >
            + Add Vendor
          </Link>
        </div>
      ) : (
        <table className="adm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Network</th>
              <th>Deals</th>
              <th>Partner</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id} style={{ opacity: busyId === v.id ? 0.5 : 1 }}>
                <td className="title">
                  {v.website ? (
                    <a
                      href={v.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--ink)", textDecoration: "none" }}
                    >
                      {v.name}
                    </a>
                  ) : (
                    v.name
                  )}
                  <div style={{ fontSize: 12, color: "var(--ink-4)", fontWeight: 400, marginTop: 2 }}>
                    /{v.slug}
                  </div>
                </td>
                <td>{v.affiliateNetwork ?? "—"}</td>
                <td>{v._count.deals}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => togglePartner(v)}
                    disabled={busyId === v.id}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <span
                      className={`adm-badge ${v.isPartner ? "partner" : "expired"}`}
                    >
                      {v.isPartner ? "Partner" : "—"}
                    </span>
                  </button>
                </td>
                <td className="actions">
                  <Link
                    href={`/admin/vendors/${v.id}/edit`}
                    className="adm-btn ghost"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="adm-btn danger"
                    disabled={busyId === v.id}
                    onClick={() => deleteVendor(v.id, v.name, v._count.deals)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
