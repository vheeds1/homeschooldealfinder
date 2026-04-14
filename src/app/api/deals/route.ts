import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DealStatus, DealType, Prisma } from "@/generated/prisma";
import {
  getAuthUser,
  jsonOk,
  jsonError,
  jsonUnauthorized,
  rateLimit,
} from "@/lib/api-helpers";

// ── Query schemas ──────────────────────────────────────────────────────────

const listQuerySchema = z.object({
  category: z.string().optional(),
  vendor: z.string().optional(),
  dealType: z.nativeEnum(DealType).optional(),
  status: z.nativeEnum(DealStatus).optional(),
  sort: z
    .enum(["newest", "expiring_soon", "most_upvoted"])
    .default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const createDealSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  description: z.string().min(10).max(5000),
  dealType: z.nativeEnum(DealType),
  originalPrice: z.number().positive().optional(),
  discountAmount: z.number().positive().optional(),
  promoCode: z.string().max(100).optional(),
  dealUrl: z.string().url(),
  affiliateUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  vendorId: z.string().cuid(),
  categoryId: z.string().cuid(),
  expiresAt: z.coerce.date().optional(),
});

// ── GET /api/deals ─────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = listQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const { category, vendor, dealType, status, sort, page, limit } = parsed.data;

  const where: Prisma.DealWhereInput = {};
  if (category) where.category = { slug: category };
  if (vendor) where.vendor = { slug: vendor };
  if (dealType) where.dealType = dealType;
  if (status) {
    where.status = status;
  } else {
    // Default to only active/featured deals for public listing
    where.status = { in: [DealStatus.ACTIVE, DealStatus.FEATURED] };
  }

  const orderBy: Prisma.DealOrderByWithRelationInput =
    sort === "expiring_soon"
      ? { expiresAt: "asc" }
      : sort === "most_upvoted"
        ? { upvoteCount: "desc" }
        : { createdAt: "desc" };

  const [deals, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        vendor: { select: { id: true, name: true, slug: true, logoUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.deal.count({ where }),
  ]);

  return jsonOk(deals, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

// ── POST /api/deals ────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return jsonUnauthorized();

  const rl = rateLimit(`create-deal:${user.id}`, 10, 60_000);
  if (!rl.ok) {
    return jsonError("Too many requests. Try again later.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = createDealSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const { vendorId, categoryId, ...rest } = parsed.data;

  // Verify vendor and category exist
  const [vendorExists, categoryExists] = await Promise.all([
    prisma.vendor.findUnique({ where: { id: vendorId }, select: { id: true } }),
    prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }),
  ]);

  if (!vendorExists) return jsonError("Vendor not found", 404);
  if (!categoryExists) return jsonError("Category not found", 404);

  const deal = await prisma.deal.create({
    data: {
      ...rest,
      vendorId,
      categoryId,
      submittedBy: user.id,
      status: DealStatus.UNVERIFIED,
    },
    include: {
      vendor: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  return Response.json(
    { data: deal, error: null, meta: null },
    { status: 201 },
  );
}
