import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DealStatus, DealType } from "@/generated/prisma";
import {
  getAuthUser,
  isAdmin,
  jsonOk,
  jsonError,
  jsonUnauthorized,
  jsonForbidden,
} from "@/lib/api-helpers";
import { uniqueDealSlug } from "@/lib/slugify";
import type { NextRequest } from "next/server";

const updateDealSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    dealType: z.nativeEnum(DealType).optional(),
    originalPrice: z.number().nonnegative().nullable().optional(),
    discountAmount: z.number().nonnegative().nullable().optional(),
    promoCode: z.string().trim().nullable().optional(),
    dealUrl: z.string().url().optional(),
    affiliateUrl: z.string().url().nullable().optional(),
    imageUrl: z.string().url().nullable().optional(),
    vendorId: z.string().min(1).optional(),
    categoryId: z.string().min(1).optional(),
    status: z.nativeEnum(DealStatus).optional(),
    expiresAt: z.string().datetime().nullable().optional(),
  })
  .strict();

// ── GET /api/admin/deals/[id] ──────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/deals/[id]">,
) {
  const user = await getAuthUser();
  if (!user) return jsonUnauthorized();
  if (!isAdmin(user)) return jsonForbidden();

  const { id } = await ctx.params;

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      vendor: true,
      category: true,
      submitter: { select: { id: true, email: true, displayName: true } },
    },
  });

  if (!deal) return jsonError("Deal not found", 404);
  return jsonOk(deal);
}

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

  const input = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) {
    updateData.title = input.title;
    updateData.slug = await uniqueDealSlug(input.title, id);
  }
  if (input.description !== undefined) updateData.description = input.description;
  if (input.dealType !== undefined) updateData.dealType = input.dealType;
  if (input.originalPrice !== undefined) updateData.originalPrice = input.originalPrice;
  if (input.discountAmount !== undefined) updateData.discountAmount = input.discountAmount;
  if (input.promoCode !== undefined) updateData.promoCode = input.promoCode;
  if (input.dealUrl !== undefined) updateData.dealUrl = input.dealUrl;
  if (input.affiliateUrl !== undefined) updateData.affiliateUrl = input.affiliateUrl;
  if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
  if (input.vendorId !== undefined) updateData.vendorId = input.vendorId;
  if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;
  if (input.expiresAt !== undefined) {
    updateData.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
  }
  if (input.status !== undefined) {
    updateData.status = input.status;
    if (
      input.status === DealStatus.ACTIVE ||
      input.status === DealStatus.FEATURED
    ) {
      updateData.verifiedAt = new Date();
    }
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

// ── DELETE /api/admin/deals/[id] ───────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/deals/[id]">,
) {
  const user = await getAuthUser();
  if (!user) return jsonUnauthorized();
  if (!isAdmin(user)) return jsonForbidden();

  const { id } = await ctx.params;

  const existing = await prisma.deal.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return jsonError("Deal not found", 404);

  // Upvotes cascade-delete via the schema's `onDelete: Cascade`.
  await prisma.deal.delete({ where: { id } });

  return jsonOk({ deleted: true });
}
