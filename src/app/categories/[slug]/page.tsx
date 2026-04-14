import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { DealStatus } from "@/generated/prisma";
import DealCard from "@/components/DealCard";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      select: { name: true, description: true },
    });

    if (!category) return { title: "Category Not Found | HomeschoolDealsFinder" };

    return {
      title: `${category.name} Deals | HomeschoolDealsFinder`,
      description:
        category.description ??
        `Browse the best ${category.name} deals for homeschool families.`,
    };
  } catch {
    return { title: "Category | HomeschoolDealsFinder" };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  let category;
  try {
    category = await prisma.category.findUnique({
      where: { slug },
    });
  } catch {
    category = null;
  }

  if (!category) notFound();

  let deals: Awaited<ReturnType<typeof prisma.deal.findMany>> = [];
  try {
    deals = await prisma.deal.findMany({
      where: {
        categoryId: category.id,
        status: { in: [DealStatus.ACTIVE, DealStatus.FEATURED] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        vendor: { select: { id: true, name: true, slug: true, logoUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  } catch {
    // DB unavailable for deals query — continue with empty array
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/deals" className="hover:text-foreground">
          Deals
        </Link>
        <span>/</span>
        <span className="text-foreground">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          {category.iconName && (
            <span className="text-3xl">{category.iconName}</span>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {category.description}
              </p>
            )}
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {deals.length} deal{deals.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Deals grid */}
      {deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <p className="text-sm text-muted-foreground">
            No active deals in this category right now.
          </p>
          <Link
            href="/deals"
            className="mt-2 text-sm text-primary hover:underline"
          >
            Browse all deals
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={JSON.parse(JSON.stringify(deal))} />
          ))}
        </div>
      )}
    </div>
  );
}
