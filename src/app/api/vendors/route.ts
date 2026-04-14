import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError } from "@/lib/api-helpers";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  partner: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

// ── GET /api/vendors ───────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const { page, limit, partner } = parsed.data;

  const where = partner !== undefined ? { isPartner: partner } : {};

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        website: true,
        logoUrl: true,
        description: true,
        isPartner: true,
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
