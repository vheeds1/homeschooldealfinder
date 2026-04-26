import { prisma } from "@/lib/prisma";
import { DealStatus } from "@/generated/prisma";
import {
  getAuthUser,
  isAdmin,
  jsonOk,
  jsonUnauthorized,
  jsonForbidden,
} from "@/lib/api-helpers";

// ── GET /api/admin/stats ───────────────────────────────────────────────────

export async function GET() {
  const user = await getAuthUser();
  if (!user) return jsonUnauthorized();
  if (!isAdmin(user)) return jsonForbidden();

  const [
    totalDeals,
    activeDeals,
    featuredDeals,
    unverifiedDeals,
    expiredDeals,
    totalVendors,
    partnerVendors,
    totalUsers,
    totalSubscribers,
    recentSubmissions,
  ] = await Promise.all([
    prisma.deal.count(),
    prisma.deal.count({ where: { status: DealStatus.ACTIVE } }),
    prisma.deal.count({ where: { status: DealStatus.FEATURED } }),
    prisma.deal.count({ where: { status: DealStatus.UNVERIFIED } }),
    prisma.deal.count({ where: { status: DealStatus.EXPIRED } }),
    prisma.vendor.count(),
    prisma.vendor.count({ where: { isPartner: true } }),
    prisma.user.count(),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    prisma.deal.findMany({
      where: { status: DealStatus.UNVERIFIED },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        vendor: { select: { id: true, name: true, slug: true } },
        submitter: { select: { id: true, email: true, displayName: true } },
      },
    }),
  ]);

  return jsonOk({
    totalDeals,
    activeDeals,
    featuredDeals,
    unverifiedDeals,
    expiredDeals,
    totalVendors,
    partnerVendors,
    totalUsers,
    totalSubscribers,
    recentSubmissions,
  });
}
