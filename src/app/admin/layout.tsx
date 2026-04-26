import { requireAdmin } from "@/lib/admin-auth";
import AdminNav from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="hsdf-section" style={{ paddingTop: 32, paddingBottom: 80 }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 32,
            fontWeight: 600,
            color: "var(--ink)",
            margin: 0,
            letterSpacing: "-0.015em",
          }}
        >
          Admin
        </h1>
        <p
          style={{
            color: "var(--ink-3)",
            fontSize: 14,
            marginTop: 4,
            margin: 0,
          }}
        >
          Manage deals, vendors, and submissions for HomeschoolDealFinder.
        </p>
      </div>

      <AdminNav />

      <div style={{ marginTop: 24 }}>{children}</div>
    </div>
  );
}
