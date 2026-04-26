import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import VendorForm from "../../VendorForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getVendor(id: string) {
  try {
    return await prisma.vendor.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

export default async function EditVendorPage({ params }: PageProps) {
  const { id } = await params;
  const vendor = await getVendor(id);
  if (!vendor) notFound();

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Link
          href="/admin/vendors"
          style={{ color: "var(--ink-3)", fontSize: 13, textDecoration: "none" }}
        >
          ← Back to vendors
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
          Edit Vendor
        </h2>
        <p style={{ fontSize: 13, color: "var(--ink-4)", margin: "4px 0 0" }}>
          /{vendor.slug}
        </p>
      </div>

      <VendorForm
        mode="edit"
        initial={{
          id: vendor.id,
          name: vendor.name,
          website: vendor.website ?? "",
          logoUrl: vendor.logoUrl ?? "",
          description: vendor.description ?? "",
          affiliateNetwork: vendor.affiliateNetwork ?? "",
          affiliateSignupUrl: vendor.affiliateSignupUrl ?? "",
          commissionRate: vendor.commissionRate ?? "",
          isPartner: vendor.isPartner,
        }}
      />
    </>
  );
}
