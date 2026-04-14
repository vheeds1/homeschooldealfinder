import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DealStatus } from "@/generated/prisma";
import { jsonOk, jsonError } from "@/lib/api-helpers";
import type { NextRequest } from "next/server";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ── GET /api/vendors/[slug] ────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/vendors/[slug]">,
) {
  const { slug } = await ctx.params;

  const vendor = await prisma.vendor.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      website: true,
      logoUrl: true,
      description: true,
      isPartner: true,
    },
  });

  if (!vendor) return jsonError("Vendor not found", 404);

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const { page, limit } = parsed.data;

  const where = {
    vendorId: vendor.id,
    status: { in: [DealStatus.ACTIVE, DealStatus.FEATURED] as DealStatus[] },
  };

  const [deals, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.deal.count({ where }),
  ]);

  return jsonOk(
    { ...vendor, deals },
    { page, limit, total, totalPages: Math.ceil(total / limit) },
  );
}
