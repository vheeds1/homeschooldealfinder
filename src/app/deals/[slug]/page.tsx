import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { DealStatus } from "@/generated/prisma";
import DealCard from "@/components/DealCard";
import CategoryBadge from "@/components/CategoryBadge";
import { Button } from "@/components/ui/button";
import PromoCodeCopy from "./PromoCodeCopy";
import ExpiryCountdown from "./ExpiryCountdown";

const dealTypeLabels: Record<string, string> = {
  PERCENT_OFF: "% Off",
  DOLLAR_OFF: "$ Off",
  FREE_TRIAL: "Free Trial",
  PROMO_CODE: "Promo Code",
  MEMBERSHIP: "Membership",
  FREEBIE: "Freebie",
};

interface DealDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: DealDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const deal = await prisma.deal.findUnique({
      where: { slug },
      select: {
        title: true,
        description: true,
        vendor: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    if (!deal) return { title: "Deal Not Found | HomeschoolDealFinder" };

    return {
      title: `${deal.title} | HomeschoolDealFinder`,
      description: deal.description.slice(0, 160),
      openGraph: {
        title: deal.title,
        description: deal.description.slice(0, 160),
        type: "website",
      },
    };
  } catch {
    return { title: "Deal | HomeschoolDealFinder" };
  }
}

export default async function DealDetailPage({ params }: DealDetailPageProps) {
  const { slug } = await params;

  let deal;
  try {
    deal = await prisma.deal.findUnique({
      where: { slug },
      include: {
        vendor: true,
        category: true,
      },
    });
  } catch {
    // DB unavailable — render fallback below
    deal = null;
  }

  if (!deal) notFound();

  let vendorDeals: Awaited<ReturnType<typeof prisma.deal.findMany>> = [];
  let categoryDeals: Awaited<ReturnType<typeof prisma.deal.findMany>> = [];

  try {
    // Fetch related deals in parallel
    [vendorDeals, categoryDeals] = await Promise.all([
      prisma.deal.findMany({
        where: {
          vendorId: deal.vendorId,
          id: { not: deal.id },
          status: { in: [DealStatus.ACTIVE, DealStatus.FEATURED] },
        },
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          vendor: { select: { id: true, name: true, slug: true, logoUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.deal.findMany({
        where: {
          categoryId: deal.categoryId,
          id: { not: deal.id },
          status: { in: [DealStatus.ACTIVE, DealStatus.FEATURED] },
        },
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          vendor: { select: { id: true, name: true, slug: true, logoUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
    ]);
  } catch {
    // DB unavailable for related deals — continue with empty arrays
  }

  const affiliateOrDealUrl = deal.affiliateUrl || deal.dealUrl;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/deals" className="hover:text-foreground">
          Deals
        </Link>
        <span>/</span>
        <Link
          href={`/categories/${deal.category.slug}`}
          className="hover:text-foreground"
        >
          {deal.category.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{deal.title}</span>
      </nav>

      {/* Main content */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Vendor logo */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
            {deal.vendor.logoUrl ? (
              <img
                src={deal.vendor.logoUrl}
                alt={deal.vendor.name}
                className="h-16 w-16 rounded object-contain"
              />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                {deal.vendor.name[0]}
              </span>
            )}
          </div>

          <div className="flex-1">
            {/* Status / type badges */}
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <CategoryBadge
                name={deal.category.name}
                slug={deal.category.slug}
              />
              <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {dealTypeLabels[deal.dealType] ?? deal.dealType}
              </span>
              {deal.status === "FEATURED" && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                  Featured
                </span>
              )}
            </div>

            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              {deal.title}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              by{" "}
              <Link
                href={`/vendors/${deal.vendor.slug}`}
                className="font-medium text-foreground hover:underline"
              >
                {deal.vendor.name}
              </Link>
            </p>

            {/* Price info */}
            {deal.originalPrice != null && (
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-lg text-muted-foreground line-through">
                  ${deal.originalPrice.toFixed(2)}
                </span>
                {deal.discountAmount != null && (
                  <span className="text-2xl font-bold text-green-600">
                    ${(deal.originalPrice - deal.discountAmount).toFixed(2)}
                  </span>
                )}
                {deal.discountAmount != null && (
                  <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    Save ${deal.discountAmount.toFixed(2)}
                  </span>
                )}
              </div>
            )}

            {/* Expiry */}
            {deal.expiresAt && (
              <div className="mt-3">
                <ExpiryCountdown
                  expiresAt={deal.expiresAt.toISOString()}
                />
              </div>
            )}

            {/* Promo code */}
            {deal.promoCode && (
              <div className="mt-4">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Promo Code
                </p>
                <PromoCodeCopy code={deal.promoCode} />
              </div>
            )}

            {/* Get Deal button */}
            <div className="mt-6">
              <a href={affiliateOrDealUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Deal
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8 border-t border-border pt-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            About This Deal
          </h2>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            {deal.description.split("\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 flex items-center gap-6 border-t border-border pt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {deal.upvoteCount} upvotes
          </span>
          <span>{deal.viewCount} views</span>
          <span>
            Added{" "}
            {new Date(deal.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* More from Vendor */}
      {vendorDeals.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              More from {deal.vendor.name}
            </h2>
            <Link
              href={`/vendors/${deal.vendor.slug}`}
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vendorDeals.map((d) => (
              <DealCard key={d.id} deal={JSON.parse(JSON.stringify(d))} />
            ))}
          </div>
        </section>
      )}

      {/* More in Category */}
      {categoryDeals.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              More in {deal.category.name}
            </h2>
            <Link
              href={`/categories/${deal.category.slug}`}
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryDeals.map((d) => (
              <DealCard key={d.id} deal={JSON.parse(JSON.stringify(d))} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
