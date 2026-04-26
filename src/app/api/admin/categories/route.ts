import { prisma } from "@/lib/prisma";
import {
  getAuthUser,
  isAdmin,
  jsonOk,
  jsonUnauthorized,
  jsonForbidden,
} from "@/lib/api-helpers";

// ── GET /api/admin/categories ──────────────────────────────────────────────

export async function GET() {
  const user = await getAuthUser();
  if (!user) return jsonUnauthorized();
  if (!isAdmin(user)) return jsonForbidden();

  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      _count: { select: { deals: true } },
    },
  });

  return jsonOk(categories);
}
