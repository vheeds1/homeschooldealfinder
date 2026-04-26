import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import {
  getAuthUser,
  isAdmin,
  jsonOk,
  jsonError,
  jsonUnauthorized,
  jsonForbidden,
} from "@/lib/api-helpers";
import { uniqueVendorSlug } from "@/lib/slugify";

const querySchema = z.object({
  q: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const createVendorSchema = z.object({
  name: z.string().trim().min(1),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  description: z.string().trim().optional(),
  affiliateNetwork: z.string().trim().optional(),
  affiliateSignupUrl: z.string().url().optional(),
  commissionRate: z.string().trim().optional(),
  isPartner: z.boolean().default(false),
});

// ── GET /api/admin/vendors ─────────────────────────────────────────────────

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return jsonUnauthorized();
  if (!isAdmin(user)) return jsonForbidden();

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const { q, page, limit } = parsed.data;

  const where: Prisma.VendorWhereInput = {};
  if (q) where.name = { contains: q, mode: "insensitive" };

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { deals: true } },
      },
    }),
    prisma.vendor.count({ where }),
  ]);

  return jsonOk(vendors, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

// ── POST /api/admin/vendors ────────────────────────────────────────────────

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

  const parsed = createVendorSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const data = parsed.data;
  const slug = await uniqueVendorSlug(data.name);

  const vendor = await prisma.vendor.create({
    data: {
      name: data.name,
      slug,
      website: data.website,
      logoUrl: data.logoUrl,
      description: data.description,
      affiliateNetwork: data.affiliateNetwork,
      affiliateSignupUrl: data.affiliateSignupUrl,
      commissionRate: data.commissionRate,
      isPartner: data.isPartner,
    },
    include: {
      _count: { select: { deals: true } },
    },
  });

  return Response.json(
    { data: vendor, error: null, meta: null },
    { status: 201 },
  );
}
