import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DealForm from "../DealForm";

export const dynamic = "force-dynamic";

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

export default async function NewDealPage() {
  const { vendors, categories } = await getOptions();

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
          New Deal
        </h2>
      </div>

      <DealForm
        mode="create"
        vendors={vendors}
        categories={categories}
        initial={{
          title: "",
          description: "",
          dealType: "PERCENT_OFF",
          originalPrice: "",
          discountAmount: "",
          promoCode: "",
          dealUrl: "",
          affiliateUrl: "",
          imageUrl: "",
          vendorId: "",
          categoryId: "",
          status: "ACTIVE",
          expiresAt: "",
        }}
      />
    </>
  );
}
