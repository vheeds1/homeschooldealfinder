import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { DealStatus } from "@/generated/prisma";
import DealCard from "@/components/DealCard";

interface VendorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: VendorPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { slug },
      select: { name: true, description: true },
    });

    if (!vendor) return { title: "Vendor Not Found | HomeschoolDealFinder" };

    return {
      title: `${vendor.name} Deals | HomeschoolDealFinder`,
      description:
        vendor.description ??
        `Browse all active deals from ${vendor.name} for homeschool families.`,
    };
  } catch {
    return { title: "Vendor | HomeschoolDealFinder" };
  }
}

export default async function VendorPage({ params }: VendorPageProps) {
  const { slug } = await params;

  let vendor;
  try {
    vendor = await prisma.vendor.findUnique({
      where: { slug },
    });
  } catch {
    vendor = null;
  }

  if (!vendor) notFound();

  let deals: Awaited<ReturnType<typeof prisma.deal.findMany>> = [];
  try {
    deals = await prisma.deal.findMany({
      where: {
        vendorId: vendor.id,
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
        <span className="text-foreground">{vendor.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
          {vendor.logoUrl ? (
            <img
              src={vendor.logoUrl}
              alt={vendor.name}
              className="h-12 w-12 rounded object-contain"
            />
          ) : (
            <span className="text-xl font-bold text-muted-foreground">
              {vendor.name[0]}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{vendor.name}</h1>
          {vendor.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {vendor.description}
            </p>
          )}
          {vendor.website && (
            <a
              href={vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Visit website
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {deals.length} active deal{deals.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Deals grid */}
      {deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <p className="text-sm text-muted-foreground">
            No active deals from this vendor right now.
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
