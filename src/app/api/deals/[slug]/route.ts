import { prisma } from "@/lib/prisma";
import { DealStatus } from "@/generated/prisma";
import { jsonOk, jsonError } from "@/lib/api-helpers";
import type { NextRequest } from "next/server";

// ── GET /api/deals/[slug] ──────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/deals/[slug]">,
) {
  const { slug } = await ctx.params;

  const deal = await prisma.deal.findUnique({
    where: { slug },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          slug: true,
          website: true,
          logoUrl: true,
          isPartner: true,
        },
      },
      category: {
        select: { id: true, name: true, slug: true, iconName: true },
      },
    },
  });

  if (!deal) return jsonError("Deal not found", 404);

  // Only return active/featured deals publicly
  if (deal.status !== DealStatus.ACTIVE && deal.status !== DealStatus.FEATURED) {
    return jsonError("Deal not found", 404);
  }

  // Increment view count (fire-and-forget)
  prisma.deal
    .update({ where: { id: deal.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  return jsonOk(deal);
}
