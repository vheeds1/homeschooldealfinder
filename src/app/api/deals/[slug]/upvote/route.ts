import { prisma } from "@/lib/prisma";
import {
  getAuthUser,
  jsonOk,
  jsonError,
  jsonUnauthorized,
  rateLimit,
} from "@/lib/api-helpers";
import type { NextRequest } from "next/server";

// ── POST /api/deals/[slug]/upvote (toggle) ────────────────────────────────

export async function POST(
  _request: NextRequest,
  ctx: RouteContext<"/api/deals/[slug]/upvote">,
) {
  const user = await getAuthUser();
  if (!user) return jsonUnauthorized();

  const rl = rateLimit(`upvote:${user.id}`, 30, 60_000);
  if (!rl.ok) {
    return jsonError("Too many requests. Try again later.", 429);
  }

  const { slug: dealId } = await ctx.params;

  // Verify deal exists
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    select: { id: true },
  });
  if (!deal) return jsonError("Deal not found", 404);

  // Check for existing upvote
  const existing = await prisma.upvote.findUnique({
    where: { userId_dealId: { userId: user.id, dealId } },
  });

  if (existing) {
    // Remove upvote
    await prisma.$transaction([
      prisma.upvote.delete({ where: { id: existing.id } }),
      prisma.deal.update({
        where: { id: dealId },
        data: { upvoteCount: { decrement: 1 } },
      }),
    ]);

    return jsonOk({ upvoted: false });
  }

  // Add upvote
  await prisma.$transaction([
    prisma.upvote.create({ data: { userId: user.id, dealId } }),
    prisma.deal.update({
      where: { id: dealId },
      data: { upvoteCount: { increment: 1 } },
    }),
  ]);

  return jsonOk({ upvoted: true });
}
