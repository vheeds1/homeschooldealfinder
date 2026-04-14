"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import DealCard, { type DealCardDeal } from "@/components/DealCard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface DealsClientProps {
  deals: DealCardDeal[];
  categories: Category[];
  totalPages: number;
  currentPage: number;
  currentSort: string;
  selectedCategories: string[];
  selectedDealTypes: string[];
}

const DEAL_TYPES = [
  { value: "PERCENT_OFF", label: "% Off" },
  { value: "DOLLAR_OFF", label: "$ Off" },
  { value: "FREE_TRIAL", label: "Free Trial" },
  { value: "PROMO_CODE", label: "Promo Code" },
  { value: "MEMBERSHIP", label: "Membership" },
  { value: "FREEBIE", label: "Freebie" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "expiring_soon", label: "Expiring Soon" },
  { value: "most_upvoted", label: "Most Upvoted" },
];

export default function DealsClient({
  deals,
  categories,
  totalPages,
  currentPage,
  currentSort,
  selectedCategories,
  selectedDealTypes,
}: DealsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const buildUrl = useCallback(
    (updates: Record<string, string | string[] | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || (Array.isArray(value) && value.length === 0)) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.delete(key);
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }

      return `/deals?${params.toString()}`;
    },
    [searchParams]
  );

  function navigate(url: string) {
    startTransition(() => {
      router.push(url);
    });
  }

  function toggleCategory(slug: string) {
    const next = selectedCategories.includes(slug)
      ? selectedCategories.filter((c) => c !== slug)
      : [...selectedCategories, slug];
    navigate(buildUrl({ category: next, page: "1" }));
  }

  function toggleDealType(value: string) {
    const next = selectedDealTypes.includes(value)
      ? selectedDealTypes.filter((d) => d !== value)
      : [...selectedDealTypes, value];
    navigate(buildUrl({ dealType: next, page: "1" }));
  }

  function setSort(sort: string) {
    navigate(buildUrl({ sort, page: "1" }));
  }

  function setPage(page: number) {
    navigate(buildUrl({ page: String(page) }));
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Sidebar filters */}
      <aside className="w-full shrink-0 lg:w-60">
        <div className="sticky top-4 space-y-6 rounded-lg border border-border bg-card p-4">
          {/* Categories */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">Categories</h3>
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => toggleCategory(cat.slug)}
                    className="rounded border-border"
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          {/* Deal Types */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">Deal Type</h3>
            <div className="space-y-1.5">
              {DEAL_TYPES.map((dt) => (
                <label
                  key={dt.value}
                  className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <input
                    type="checkbox"
                    checked={selectedDealTypes.includes(dt.value)}
                    onChange={() => toggleDealType(dt.value)}
                    className="rounded border-border"
                  />
                  {dt.label}
                </label>
              ))}
            </div>
          </div>

          {(selectedCategories.length > 0 || selectedDealTypes.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/deals")}
              className="w-full"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={cn("flex-1", isPending && "opacity-60 transition-opacity")}>
        {/* Sort bar */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                currentSort === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Deals grid */}
        {deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <p className="text-sm text-muted-foreground">No deals found matching your filters.</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/deals")}
              className="mt-2"
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let page: number;
                if (totalPages <= 7) {
                  page = i + 1;
                } else if (currentPage <= 4) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  page = totalPages - 6 + i;
                } else {
                  page = currentPage - 3 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setPage(page)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded text-xs font-medium transition-colors",
                      page === currentPage
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
