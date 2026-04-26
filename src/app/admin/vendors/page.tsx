import { prisma } from "@/lib/prisma";
import VendorsManager from "./VendorsManager";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

async function getVendors(q?: string) {
  try {
    return await prisma.vendor.findMany({
      where: q
        ? {
            name: { contains: q, mode: "insensitive" },
          }
        : undefined,
      orderBy: { name: "asc" },
      include: {
        _count: { select: { deals: true } },
      },
    });
  } catch {
    return [];
  }
}

export default async function AdminVendorsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const vendors = await getVendors(sp.q);

  return (
    <VendorsManager
      initial={JSON.parse(JSON.stringify(vendors))}
      initialQuery={sp.q ?? ""}
    />
  );
}
