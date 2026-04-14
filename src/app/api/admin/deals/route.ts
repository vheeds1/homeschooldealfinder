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

const querySchema = z.object({
  status: z.nativeEnum(DealStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
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

  const { status, page, limit } = parsed.data;
  const where = status ? { status } : {};

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
