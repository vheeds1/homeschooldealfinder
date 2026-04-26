"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Deal {
  id: string;
  title: string;
  slug: string;
  description: string;
  dealType: string;
  dealUrl: string;
  createdAt: string;
  vendor: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string };
  submitter: { id: string; email: string; displayName: string | null } | null;
}

export default function SubmissionsTable({ initial }: { initial: Deal[] }) {
  const router = useRouter();
  const [deals, setDeals] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function action(dealId: string, status: "ACTIVE" | "EXPIRED") {
    setBusyId(dealId);
    try {
      const res = await fetch(`/api/admin/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setDeals((prev) => prev.filter((d) => d.id !== dealId));
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <table className="adm-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Vendor</th>
          <th>Category</th>
          <th>Submitted by</th>
          <th>Date</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {deals.map((deal) => (
          <tr key={deal.id} style={{ opacity: busyId === deal.id ? 0.5 : 1 }}>
            <td className="title">
              <Link
                href={`/deals/${deal.slug}`}
                target="_blank"
                style={{ color: "var(--ink)", textDecoration: "none" }}
              >
                {deal.title}
              </Link>
              <div style={{ fontSize: 12, color: "var(--ink-4)", fontWeight: 400, marginTop: 2 }}>
                <a
                  href={deal.dealUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--primary)" }}
                >
                  View source →
                </a>
              </div>
            </td>
            <td>{deal.vendor.name}</td>
            <td>{deal.category.name}</td>
            <td>
              {deal.submitter?.displayName ?? deal.submitter?.email ?? "—"}
            </td>
            <td>
              {new Date(deal.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
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
                className="adm-btn success"
                disabled={busyId === deal.id}
                onClick={() => action(deal.id, "ACTIVE")}
              >
                Approve
              </button>
              <button
                type="button"
                className="adm-btn danger"
                disabled={busyId === deal.id}
                onClick={() => action(deal.id, "EXPIRED")}
              >
                Reject
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
