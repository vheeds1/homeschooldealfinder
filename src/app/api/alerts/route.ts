import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  getAuthUser,
  jsonOk,
  jsonError,
  jsonUnauthorized,
  rateLimit,
} from "@/lib/api-helpers";

const createAlertSchema = z
  .object({
    categoryId: z.string().cuid().optional(),
    vendorId: z.string().cuid().optional(),
    keyword: z.string().min(2).max(100).optional(),
    emailEnabled: z.boolean().default(true),
  })
  .refine(
    (data) => data.categoryId || data.vendorId || data.keyword,
    "At least one of categoryId, vendorId, or keyword is required",
  );

// ── POST /api/alerts ───────────────────────────────────────────────────────

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return jsonUnauthorized();

  const rl = rateLimit(`alert:${user.id}`, 10, 60_000);
  if (!rl.ok) {
    return jsonError("Too many requests. Try again later.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body");
  }

  const parsed = createAlertSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const { categoryId, vendorId, keyword, emailEnabled } = parsed.data;

  // Verify referenced entities exist
  if (categoryId) {
    const exists = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!exists) return jsonError("Category not found", 404);
  }

  if (vendorId) {
    const exists = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true },
    });
    if (!exists) return jsonError("Vendor not found", 404);
  }

  const alert = await prisma.dealAlert.create({
    data: {
      userId: user.id,
      categoryId: categoryId ?? null,
      vendorId: vendorId ?? null,
      keyword: keyword ?? null,
      emailEnabled,
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      vendor: { select: { id: true, name: true, slug: true } },
    },
  });

  return Response.json(
    { data: alert, error: null, meta: null },
    { status: 201 },
  );
}
