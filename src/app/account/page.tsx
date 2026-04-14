import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  FEATURED: "bg-amber-100 text-amber-800",
  UNVERIFIED: "bg-yellow-100 text-yellow-800",
  EXPIRED: "bg-gray-100 text-gray-600",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let dbUser;
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        submittedDeals: {
          orderBy: { createdAt: "desc" },
          include: {
            category: { select: { name: true, slug: true } },
            vendor: { select: { name: true, slug: true } },
          },
        },
        upvotes: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            deal: {
              select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                vendor: { select: { name: true } },
              },
            },
          },
        },
        dealAlerts: {
          include: {
            category: { select: { name: true } },
            vendor: { select: { name: true } },
          },
        },
      },
    });
  } catch {
    dbUser = null;
  }

  if (!dbUser) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* User info */}
      <div className="mb-8 flex items-center gap-4">
        {dbUser.avatarUrl ? (
          <img
            src={dbUser.avatarUrl}
            alt={dbUser.displayName ?? "User"}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {(dbUser.displayName ?? dbUser.email)[0].toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {dbUser.displayName ?? "User"}
          </h1>
          <p className="text-sm text-muted-foreground">{dbUser.email}</p>
          <p className="text-xs text-muted-foreground">
            Member since{" "}
            {new Date(dbUser.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Submitted deals */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Submitted Deals
          </h2>
          <Link
            href="/submit"
            className="text-sm text-primary hover:underline"
          >
            Submit a deal
          </Link>
        </div>

        {dbUser.submittedDeals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-8 text-center">
            <p className="text-sm text-muted-foreground">
              You haven&apos;t submitted any deals yet.
            </p>
            <Link
              href="/submit"
              className="mt-1 inline-block text-sm text-primary hover:underline"
            >
              Submit your first deal
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Deal
                  </th>
                  <th className="hidden px-4 py-2 text-left font-medium text-muted-foreground sm:table-cell">
                    Category
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="hidden px-4 py-2 text-left font-medium text-muted-foreground sm:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dbUser.submittedDeals.map((deal) => (
                  <tr key={deal.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/deals/${deal.slug}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {deal.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {deal.vendor.name}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {deal.category.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          statusColors[deal.status] ?? "bg-gray-100 text-gray-600"
                        )}
                      >
                        {deal.status}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                      {new Date(deal.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Upvoted deals */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Upvoted Deals
        </h2>

        {dbUser.upvotes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-8 text-center">
            <p className="text-sm text-muted-foreground">
              You haven&apos;t upvoted any deals yet.
            </p>
            <Link
              href="/deals"
              className="mt-1 inline-block text-sm text-primary hover:underline"
            >
              Browse deals
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {dbUser.upvotes.map((upvote) => (
              <div
                key={upvote.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <Link
                    href={`/deals/${upvote.deal.slug}`}
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    {upvote.deal.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {upvote.deal.vendor.name}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    statusColors[upvote.deal.status] ?? "bg-gray-100 text-gray-600"
                  )}
                >
                  {upvote.deal.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Deal alerts */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Deal Alerts
        </h2>

        {dbUser.dealAlerts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No deal alerts configured.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Set up alerts to get notified about deals in your favorite
              categories.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {dbUser.dealAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      alert.emailEnabled ? "bg-green-500" : "bg-gray-400"
                    )}
                  />
                  <div>
                    {alert.category && (
                      <span className="text-sm text-foreground">
                        Category: {alert.category.name}
                      </span>
                    )}
                    {alert.vendor && (
                      <span className="text-sm text-foreground">
                        Vendor: {alert.vendor.name}
                      </span>
                    )}
                    {alert.keyword && (
                      <span className="text-sm text-foreground">
                        Keyword: &quot;{alert.keyword}&quot;
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {alert.emailEnabled ? "Email on" : "Email off"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
