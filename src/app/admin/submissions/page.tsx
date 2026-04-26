import { prisma } from "@/lib/prisma";
import SubmissionsTable from "./SubmissionsTable";

export const dynamic = "force-dynamic";

async function getUnverifiedDeals() {
  try {
    return await prisma.deal.findMany({
      where: { status: "UNVERIFIED" },
      orderBy: { createdAt: "asc" },
      include: {
        vendor: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        submitter: { select: { id: true, email: true, displayName: true } },
      },
    });
  } catch {
    return [];
  }
}

export default async function SubmissionsPage() {
  const deals = await getUnverifiedDeals();

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <h2
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 22,
            fontWeight: 600,
            color: "var(--ink)",
            margin: 0,
          }}
        >
          Submissions
        </h2>
        <p
          style={{ fontSize: 13, color: "var(--ink-3)", margin: "4px 0 0" }}
        >
          {deals.length} deal{deals.length !== 1 ? "s" : ""} awaiting review
        </p>
      </div>

      {deals.length === 0 ? (
        <div className="adm-empty">
          <h3>All caught up!</h3>
          <p>No deals awaiting review. New user submissions will appear here.</p>
        </div>
      ) : (
        <SubmissionsTable initial={JSON.parse(JSON.stringify(deals))} />
      )}
    </>
  );
}
