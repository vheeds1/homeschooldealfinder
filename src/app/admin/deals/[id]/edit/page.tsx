import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DealForm from "../../DealForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getDeal(id: string) {
  try {
    return await prisma.deal.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

async function getOptions() {
  try {
    const [vendors, categories] = await Promise.all([
      prisma.vendor.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      prisma.category.findMany({
        orderBy: { displayOrder: "asc" },
        select: { id: true, name: true },
      }),
    ]);
    return { vendors, categories };
  } catch {
    return { vendors: [], categories: [] };
  }
}

function dateInputValue(d: Date | string | null): string {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default async function EditDealPage({ params }: PageProps) {
  const { id } = await params;
  const [deal, options] = await Promise.all([getDeal(id), getOptions()]);

  if (!deal) notFound();

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Link
          href="/admin/deals"
          style={{ color: "var(--ink-3)", fontSize: 13, textDecoration: "none" }}
        >
          ← Back to deals
        </Link>
        <h2
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 24,
            fontWeight: 600,
            color: "var(--ink)",
            margin: "8px 0 0",
          }}
        >
          Edit Deal
        </h2>
        <p style={{ fontSize: 13, color: "var(--ink-4)", margin: "4px 0 0" }}>
          /{deal.slug}
        </p>
      </div>

      <DealForm
        mode="edit"
        vendors={options.vendors}
        categories={options.categories}
        initial={{
          id: deal.id,
          title: deal.title,
          description: deal.description,
          dealType: deal.dealType,
          originalPrice: deal.originalPrice?.toString() ?? "",
          discountAmount: deal.discountAmount?.toString() ?? "",
          promoCode: deal.promoCode ?? "",
          dealUrl: deal.dealUrl,
          affiliateUrl: deal.affiliateUrl ?? "",
          imageUrl: deal.imageUrl ?? "",
          vendorId: deal.vendorId,
          categoryId: deal.categoryId,
          status: deal.status,
          expiresAt: dateInputValue(deal.expiresAt),
        }}
      />
    </>
  );
}
