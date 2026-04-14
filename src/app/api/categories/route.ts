import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api-helpers";

// ── GET /api/categories ────────────────────────────────────────────────────

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      iconName: true,
      displayOrder: true,
      dealCount: true,
    },
  });

  return jsonOk(categories);
}
