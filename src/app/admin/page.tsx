import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
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
      prisma.deal.count({ where: { status: "ACTIVE" } }),
      prisma.deal.count({ where: { status: "FEATURED" } }),
      prisma.deal.count({ where: { status: "UNVERIFIED" } }),
      prisma.deal.count({ where: { status: "EXPIRED" } }),
      prisma.vendor.count(),
      prisma.vendor.count({ where: { isPartner: true } }),
      prisma.user.count(),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
      prisma.deal.findMany({
        where: { status: "UNVERIFIED" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          vendor: { select: { name: true } },
          submitter: { select: { email: true, displayName: true } },
        },
      }),
    ]);

    return {
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
    };
  } catch {
    return null;
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  if (!stats) {
    return (
      <div className="adm-empty">
        <h3>Database unavailable</h3>
        <p>Could not load admin stats.</p>
      </div>
    );
  }

  return (
    <>
      <div className="adm-statgrid">
        <div className="adm-stat">
          <div className="lbl">Total Deals</div>
          <div className="num">{stats.totalDeals}</div>
        </div>
        <div className="adm-stat success">
          <div className="lbl">Active</div>
          <div className="num">{stats.activeDeals}</div>
        </div>
        <div className="adm-stat accent">
          <div className="lbl">Featured</div>
          <div className="num">{stats.featuredDeals}</div>
        </div>
        <div className="adm-stat warn">
          <div className="lbl">Pending Review</div>
          <div className="num">{stats.unverifiedDeals}</div>
          {stats.unverifiedDeals > 0 && (
            <div className="sub">
              <Link
                href="/admin/submissions"
                style={{ color: "var(--warn)", textDecoration: "underline" }}
              >
                Review now →
              </Link>
            </div>
          )}
        </div>
        <div className="adm-stat">
          <div className="lbl">Expired</div>
          <div className="num">{stats.expiredDeals}</div>
        </div>
        <div className="adm-stat">
          <div className="lbl">Vendors</div>
          <div className="num">{stats.totalVendors}</div>
          <div className="sub">
            {stats.partnerVendors} partner
            {stats.partnerVendors !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="adm-stat">
          <div className="lbl">Users</div>
          <div className="num">{stats.totalUsers}</div>
        </div>
        <div className="adm-stat">
          <div className="lbl">Subscribers</div>
          <div className="num">{stats.totalSubscribers}</div>
        </div>
      </div>

      {/* Quick actions */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 32,
        }}
      >
        <Link href="/admin/deals/new" className="adm-btn">
          + Add New Deal
        </Link>
        <Link href="/admin/vendors/new" className="adm-btn ghost">
          + Add Vendor
        </Link>
        <Link href="/admin/deals" className="adm-btn ghost">
          Manage Deals
        </Link>
      </div>

      {/* Recent submissions */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h2
            style={{
              fontFamily: "Fraunces, Georgia, serif",
              fontSize: 22,
              fontWeight: 600,
              color: "var(--ink)",
              margin: 0,
            }}
          >
            Recent Submissions
          </h2>
          <Link
            href="/admin/submissions"
            style={{ color: "var(--primary)", fontSize: 13, fontWeight: 600 }}
          >
            View all →
          </Link>
        </div>

        {stats.recentSubmissions.length === 0 ? (
          <div className="adm-empty">
            <h3>No pending submissions</h3>
            <p>You&apos;re all caught up — new user submissions will show here.</p>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Vendor</th>
                <th>Submitted by</th>
                <th>When</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {stats.recentSubmissions.map((deal) => (
                <tr key={deal.id}>
                  <td className="title">{deal.title}</td>
                  <td>{deal.vendor?.name ?? "—"}</td>
                  <td>
                    {deal.submitter?.displayName ??
                      deal.submitter?.email ??
                      "—"}
                  </td>
                  <td>
                    {new Date(deal.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="actions">
                    <Link
                      href={`/admin/deals/${deal.id}/edit`}
                      className="adm-btn ghost"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
