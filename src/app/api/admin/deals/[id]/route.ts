import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DealStatus } from "@/generated/prisma";
import {
  getAuthUser,
  isAdmin,
  jsonOk,
  jsonError,
  jsonUnauthorized,
  jsonForbidden,
} from "@/lib/api-helpers";
import type { NextRequest } from "next/server";

const updateDealSchema = z.object({
  status: z.nativeEnum(DealStatus),
});

// ── PATCH /api/admin/deals/[id] ────────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/deals/[id]">,
) {
  const user = await getAuthUser();
  if (!user) return jsonUnauthorized();
  if (!isAdmin(user)) return jsonForbidden();

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = updateDealSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const existing = await prisma.deal.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return jsonError("Deal not found", 404);

  const updateData: Record<string, unknown> = {
    status: parsed.data.status,
  };

  // Set verifiedAt when moving to ACTIVE or FEATURED
  if (
    parsed.data.status === DealStatus.ACTIVE ||
    parsed.data.status === DealStatus.FEATURED
  ) {
    updateData.verifiedAt = new Date();
  }

  const deal = await prisma.deal.update({
    where: { id },
    data: updateData,
    include: {
      vendor: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  return jsonOk(deal);
}
