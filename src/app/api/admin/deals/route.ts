import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DealStatus, DealType, Prisma } from "@/generated/prisma";
import {
  getAuthUser,
  isAdmin,
  jsonOk,
  jsonError,
  jsonUnauthorized,
  jsonForbidden,
} from "@/lib/api-helpers";
import { uniqueDealSlug } from "@/lib/slugify";

const querySchema = z.object({
  status: z.nativeEnum(DealStatus).optional(),
  q: z.string().trim().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  vendorId: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

const createDealSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  dealType: z.nativeEnum(DealType),
  originalPrice: z.number().nonnegative().optional(),
  discountAmount: z.number().nonnegative().optional(),
  promoCode: z.string().trim().optional(),
  dealUrl: z.string().url(),
  affiliateUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  vendorId: z.string().min(1),
  categoryId: z.string().min(1),
  status: z.nativeEnum(DealStatus).default(DealStatus.UNVERIFIED),
  expiresAt: z.string().datetime().optional(),
});

// ── GET /api/admin/deals ───────────────────────────────────────────────────

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return jsonUnauthorized();
  if (!isAdmin(user)) return jsonForbidden();

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const { status, q, categoryId, vendorId, page, limit } = parsed.data;

  const where: Prisma.DealWhereInput = {};
  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;
  if (vendorId) where.vendorId = vendorId;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { vendor: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [deals, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        vendor: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        submitter: { select: { id: true, email: true, displayName: true } },
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

// ── POST /api/admin/deals ──────────────────────────────────────────────────

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return jsonUnauthorized();
  if (!isAdmin(user)) return jsonForbidden();

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

  const data = parsed.data;
  const slug = await uniqueDealSlug(data.title);

  const isVerified =
    data.status === DealStatus.ACTIVE || data.status === DealStatus.FEATURED;

  const deal = await prisma.deal.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      dealType: data.dealType,
      originalPrice: data.originalPrice,
      discountAmount: data.discountAmount,
      promoCode: data.promoCode,
      dealUrl: data.dealUrl,
      affiliateUrl: data.affiliateUrl,
      imageUrl: data.imageUrl,
      vendorId: data.vendorId,
      categoryId: data.categoryId,
      status: data.status,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      verifiedAt: isVerified ? new Date() : undefined,
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
