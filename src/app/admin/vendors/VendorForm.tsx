"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface VendorFormValues {
  id?: string;
  name: string;
  website: string;
  logoUrl: string;
  description: string;
  affiliateNetwork: string;
  affiliateSignupUrl: string;
  commissionRate: string;
  isPartner: boolean;
}

interface Props {
  mode: "create" | "edit";
  initial: VendorFormValues;
}

export default function VendorForm({ mode, initial }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<VendorFormValues>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function update<K extends keyof VendorFormValues>(
    key: K,
    value: VendorFormValues[K]
  ) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    const payload = {
      name: values.name,
      website: values.website || null,
      logoUrl: values.logoUrl || null,
      description: values.description || null,
      affiliateNetwork: values.affiliateNetwork || null,
      affiliateSignupUrl: values.affiliateSignupUrl || null,
      commissionRate: values.commissionRate || null,
      isPartner: values.isPartner,
    };

    try {
      const url =
        mode === "create"
          ? "/api/admin/vendors"
          : `/api/admin/vendors/${initial.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setSuccess(mode === "create" ? "Vendor created!" : "Vendor updated!");
      if (mode === "create") {
        router.push(`/admin/vendors/${data.data.id}/edit`);
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="adm-form" onSubmit={handleSubmit}>
      {error && <div className="err">{error}</div>}
      {success && <div className="ok">{success}</div>}

      <div className="adm-form-row">
        <label htmlFor="name">Vendor Name *</label>
        <input
          id="name"
          type="text"
          required
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Sonlight Curriculum"
        />
      </div>

      <div className="adm-form-row two">
        <div className="adm-form-row">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            type="url"
            value={values.website}
            onChange={(e) => update("website", e.target.value)}
            placeholder="https://vendor.com"
          />
        </div>
        <div className="adm-form-row">
          <label htmlFor="logoUrl">Logo URL</label>
          <input
            id="logoUrl"
            type="url"
            value={values.logoUrl}
            onChange={(e) => update("logoUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="adm-form-row">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Brief description of the vendor."
        />
      </div>

      <div className="adm-form-row two">
        <div className="adm-form-row">
          <label htmlFor="affiliateNetwork">Affiliate Network</label>
          <input
            id="affiliateNetwork"
            type="text"
            value={values.affiliateNetwork}
            onChange={(e) => update("affiliateNetwork", e.target.value)}
            placeholder="ShareASale / Impact / Amazon / Direct"
          />
        </div>
        <div className="adm-form-row">
          <label htmlFor="commissionRate">Commission Rate</label>
          <input
            id="commissionRate"
            type="text"
            value={values.commissionRate}
            onChange={(e) => update("commissionRate", e.target.value)}
            placeholder="10% / $5 / Verify"
          />
        </div>
      </div>

      <div className="adm-form-row">
        <label htmlFor="affiliateSignupUrl">Affiliate Signup URL</label>
        <input
          id="affiliateSignupUrl"
          type="url"
          value={values.affiliateSignupUrl}
          onChange={(e) => update("affiliateSignupUrl", e.target.value)}
          placeholder="https://vendor.com/affiliates"
        />
      </div>

      <div className="adm-form-row">
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            fontSize: 14,
            color: "var(--ink)",
            fontWeight: 500,
          }}
        >
          <input
            type="checkbox"
            checked={values.isPartner}
            onChange={(e) => update("isPartner", e.target.checked)}
            style={{ width: "auto", padding: 0 }}
          />
          Mark as official partner
        </label>
      </div>

      <div className="actions">
        <Link href="/admin/vendors" className="adm-btn ghost">
          Cancel
        </Link>
        <button type="submit" className="adm-btn" disabled={submitting}>
          {submitting
            ? "Saving…"
            : mode === "create"
              ? "Create Vendor"
              : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
