import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  getAuthUser,
  isAdmin,
  jsonOk,
  jsonError,
  jsonUnauthorized,
  jsonForbidden,
} from "@/lib/api-helpers";
import { uniqueVendorSlug } from "@/lib/slugify";
import type { NextRequest } from "next/server";

const updateVendorSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    website: z.string().url().nullable().optional(),
    logoUrl: z.string().url().nullable().optional(),
    description: z.string().trim().nullable().optional(),
    affiliateNetwork: z.string().trim().nullable().optional(),
    affiliateSignupUrl: z.string().url().nullable().optional(),
    commissionRate: z.string().trim().nullable().optional(),
    isPartner: z.boolean().optional(),
  })
  .strict();

// ── GET /api/admin/vendors/[id] ────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/vendors/[id]">,
) {
  const user = await getAuthUser();
  if (!user) return jsonUnauthorized();
  if (!isAdmin(user)) return jsonForbidden();

  const { id } = await ctx.params;

  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      _count: { select: { deals: true } },
    },
  });

  if (!vendor) return jsonError("Vendor not found", 404);
  return jsonOk(vendor);
}

// ── PATCH /api/admin/vendors/[id] ──────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/vendors/[id]">,
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

  const parsed = updateVendorSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const existing = await prisma.vendor.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return jsonError("Vendor not found", 404);

  const input = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (input.name !== undefined) {
    updateData.name = input.name;
    updateData.slug = await uniqueVendorSlug(input.name, id);
  }
  if (input.website !== undefined) updateData.website = input.website;
  if (input.logoUrl !== undefined) updateData.logoUrl = input.logoUrl;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.affiliateNetwork !== undefined)
    updateData.affiliateNetwork = input.affiliateNetwork;
  if (input.affiliateSignupUrl !== undefined)
    updateData.affiliateSignupUrl = input.affiliateSignupUrl;
  if (input.commissionRate !== undefined)
    updateData.commissionRate = input.commissionRate;
  if (input.isPartner !== undefined) updateData.isPartner = input.isPartner;

  const vendor = await prisma.vendor.update({
    where: { id },
    data: updateData,
    include: {
      _count: { select: { deals: true } },
    },
  });

  return jsonOk(vendor);
}

// ── DELETE /api/admin/vendors/[id] ─────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/vendors/[id]">,
) {
  const user = await getAuthUser();
  if (!user) return jsonUnauthorized();
  if (!isAdmin(user)) return jsonForbidden();

  const { id } = await ctx.params;

  const existing = await prisma.vendor.findUnique({
    where: { id },
    select: { id: true, _count: { select: { deals: true } } },
  });
  if (!existing) return jsonError("Vendor not found", 404);

  if (existing._count.deals > 0) {
    return jsonError(
      "Cannot delete vendor with active deals — reassign or delete those deals first.",
    );
  }

  await prisma.vendor.delete({ where: { id } });

  return jsonOk({ deleted: true });
}
