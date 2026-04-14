import { prisma } from "@/lib/prisma";
import { DealStatus, DealType, Prisma } from "@/generated/prisma";
import DealsClient from "./DealsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Deals | HomeschoolDealsFinder",
  description:
    "Browse the latest homeschool curriculum discounts, STEM kit sales, subscription box deals, and more.",
};

const PAGE_SIZE = 12;

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const categoryParam = params.category;
  const selectedCategories = Array.isArray(categoryParam)
    ? categoryParam
    : categoryParam
      ? [categoryParam]
      : [];

  const dealTypeParam = params.dealType;
  const selectedDealTypes = Array.isArray(dealTypeParam)
    ? dealTypeParam
    : dealTypeParam
      ? [dealTypeParam]
      : [];

  const sort =
    typeof params.sort === "string" &&
    ["newest", "expiring_soon", "most_upvoted"].includes(params.sort)
      ? params.sort
      : "newest";

  const page = Math.max(1, Number(params.page) || 1);

  // Build where clause
  const where: Prisma.DealWhereInput = {
    status: { in: [DealStatus.ACTIVE, DealStatus.FEATURED] },
  };

  if (selectedCategories.length > 0) {
    where.category = { slug: { in: selectedCategories } };
  }

  if (selectedDealTypes.length > 0) {
    where.dealType = {
      in: selectedDealTypes.filter((dt) =>
        Object.values(DealType).includes(dt as DealType)
      ) as DealType[],
    };
  }

  const orderBy: Prisma.DealOrderByWithRelationInput =
    sort === "expiring_soon"
      ? { expiresAt: "asc" }
      : sort === "most_upvoted"
        ? { upvoteCount: "desc" }
        : { createdAt: "desc" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let deals: any[] = [];
  let total = 0;
  let categories: { id: string; name: string; slug: string }[] = [];

  try {
    [deals, total, categories] = await Promise.all([
      prisma.deal.findMany({
        where,
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          vendor: { select: { id: true, name: true, slug: true, logoUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.deal.count({ where }),
      prisma.category.findMany({
        orderBy: { displayOrder: "asc" },
        select: { id: true, name: true, slug: true },
      }),
    ]);
  } catch {
    // Database not available — render with empty data
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">All Deals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} deal{total !== 1 ? "s" : ""} found
        </p>
      </div>

      <DealsClient
        deals={JSON.parse(JSON.stringify(deals))}
        categories={categories}
        totalPages={totalPages}
        currentPage={page}
        currentSort={sort}
        selectedCategories={selectedCategories}
        selectedDealTypes={selectedDealTypes}
      />
    </div>
  );
}
