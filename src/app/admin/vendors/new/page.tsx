import Link from "next/link";
import VendorForm from "../VendorForm";

export default function NewVendorPage() {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Link
          href="/admin/vendors"
          style={{ color: "var(--ink-3)", fontSize: 13, textDecoration: "none" }}
        >
          ← Back to vendors
        </Link>
        <h2
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 24,
            fontWeight: 600,
            color: "var(--ink)",
            margin: "8px 0 0",
          }}
        >
          New Vendor
        </h2>
      </div>

      <VendorForm
        mode="create"
        initial={{
          name: "",
          website: "",
          logoUrl: "",
          description: "",
          affiliateNetwork: "",
          affiliateSignupUrl: "",
          commissionRate: "",
          isPartner: false,
        }}
      />
    </>
  );
}
