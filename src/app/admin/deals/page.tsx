import { prisma } from "@/lib/prisma";
import { type Prisma } from "@/generated/prisma";
import DealsManager from "./DealsManager";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    categoryId?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 25;

async function getData(params: {
  q?: string;
  status?: string;
  categoryId?: string;
  page: number;
}) {
  try {
    const where: Prisma.DealWhereInput = {};
    if (params.status) {
      where.status = params.status as Prisma.DealWhereInput["status"];
    }
    if (params.categoryId) where.categoryId = params.categoryId;
    if (params.q) {
      where.OR = [
        { title: { contains: params.q, mode: "insensitive" } },
        { vendor: { name: { contains: params.q, mode: "insensitive" } } },
      ];
    }

    const [deals, total, categories] = await Promise.all([
      prisma.deal.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          vendor: { select: { id: true, name: true, slug: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.deal.count({ where }),
      prisma.category.findMany({
        orderBy: { displayOrder: "asc" },
        select: { id: true, name: true, slug: true },
      }),
    ]);

    return { deals, total, categories };
  } catch {
    return { deals: [], total: 0, categories: [] };
  }
}

export default async function AdminDealsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const { deals, total, categories } = await getData({
    q: sp.q,
    status: sp.status,
    categoryId: sp.categoryId,
    page,
  });

  return (
    <DealsManager
      initialDeals={JSON.parse(JSON.stringify(deals))}
      categories={categories}
      total={total}
      pageSize={PAGE_SIZE}
      currentPage={page}
      currentFilters={{
        q: sp.q ?? "",
        status: sp.status ?? "",
        categoryId: sp.categoryId ?? "",
      }}
    />
  );
}
