import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import AdminDealQueue from "./AdminDealQueue";

export default async function AdminPage() {
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
      select: { role: true },
    });
  } catch {
    dbUser = null;
  }

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/");
  }

  let unverifiedDeals: Awaited<ReturnType<typeof prisma.deal.findMany>> = [];
  try {
    unverifiedDeals = await prisma.deal.findMany({
      where: { status: "UNVERIFIED" },
      orderBy: { createdAt: "asc" },
      include: {
        vendor: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        submitter: { select: { id: true, email: true, displayName: true } },
      },
    });
  } catch {
    // DB unavailable for deals query — continue with empty array
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-foreground">Deal Moderation</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {unverifiedDeals.length} deal{unverifiedDeals.length !== 1 ? "s" : ""}{" "}
        awaiting review
      </p>

      <div className="mt-6">
        <AdminDealQueue deals={JSON.parse(JSON.stringify(unverifiedDeals))} />
      </div>
    </div>
  );
}
