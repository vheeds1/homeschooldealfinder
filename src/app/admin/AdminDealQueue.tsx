"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Deal {
  id: string;
  title: string;
  slug: string;
  description: string;
  dealType: string;
  dealUrl: string;
  originalPrice: number | null;
  discountAmount: number | null;
  promoCode: string | null;
  createdAt: string;
  vendor: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string };
  submitter: { id: string; email: string; displayName: string | null } | null;
}

interface AdminDealQueueProps {
  deals: Deal[];
}

export default function AdminDealQueue({ deals: initialDeals }: AdminDealQueueProps) {
  const router = useRouter();
  const [deals, setDeals] = useState(initialDeals);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAction(dealId: string, action: "approve" | "reject") {
    setLoadingId(dealId);

    try {
      const status = action === "approve" ? "ACTIVE" : "EXPIRED";
      const res = await fetch(`/api/admin/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setDeals((prev) => prev.filter((d) => d.id !== dealId));
        router.refresh();
      }
    } catch {
      // Silently fail - the deal stays in the list
    } finally {
      setLoadingId(null);
    }
  }

  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-muted-foreground/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="mt-3 text-sm font-medium text-muted-foreground">
          All caught up! No deals to review.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Deal
            </th>
            <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
              Category
            </th>
            <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
              Submitted By
            </th>
            <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
              Date
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {deals.map((deal) => (
            <tr
              key={deal.id}
              className={cn(
                "transition-opacity",
                loadingId === deal.id && "opacity-50"
              )}
            >
              <td className="px-4 py-3">
                <Link
                  href={`/deals/${deal.slug}`}
                  className="font-medium text-foreground hover:text-primary"
                  target="_blank"
                >
                  {deal.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {deal.vendor.name} &middot; {deal.dealType.replace("_", " ")}
                </p>
                {deal.dealUrl && (
                  <a
                    href={deal.dealUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    View source
                  </a>
                )}
              </td>
              <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                {deal.category.name}
              </td>
              <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                {deal.submitter?.displayName ?? deal.submitter?.email ?? "Unknown"}
              </td>
              <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                {new Date(deal.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    disabled={loadingId === deal.id}
                    onClick={() => handleAction(deal.id, "approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={loadingId === deal.id}
                    onClick={() => handleAction(deal.id, "reject")}
                  >
                    Reject
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
