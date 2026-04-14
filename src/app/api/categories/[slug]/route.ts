import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DealStatus } from "@/generated/prisma";
import { jsonOk, jsonError } from "@/lib/api-helpers";
import type { NextRequest } from "next/server";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ── GET /api/categories/[slug] ─────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/categories/[slug]">,
) {
  const { slug } = await ctx.params;

  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      iconName: true,
      displayOrder: true,
      dealCount: true,
    },
  });

  if (!category) return jsonError("Category not found", 404);

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const { page, limit } = parsed.data;

  const where = {
    categoryId: category.id,
    status: { in: [DealStatus.ACTIVE, DealStatus.FEATURED] as DealStatus[] },
  };

  const [deals, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        vendor: { select: { id: true, name: true, slug: true, logoUrl: true } },
      },
    }),
    prisma.deal.count({ where }),
  ]);

  return jsonOk(
    { ...category, deals },
    { page, limit, total, totalPages: Math.ceil(total / limit) },
  );
}
