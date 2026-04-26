"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Vendor {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

export interface DealFormValues {
  id?: string;
  title: string;
  description: string;
  dealType: string;
  originalPrice: string;
  discountAmount: string;
  promoCode: string;
  dealUrl: string;
  affiliateUrl: string;
  imageUrl: string;
  vendorId: string;
  categoryId: string;
  status: string;
  expiresAt: string;
}

interface Props {
  mode: "create" | "edit";
  initial: DealFormValues;
  vendors: Vendor[];
  categories: Category[];
}

const DEAL_TYPES = [
  { value: "PERCENT_OFF", label: "% Off" },
  { value: "DOLLAR_OFF", label: "$ Off" },
  { value: "FREE_TRIAL", label: "Free Trial" },
  { value: "PROMO_CODE", label: "Promo Code" },
  { value: "MEMBERSHIP", label: "Membership" },
  { value: "FREEBIE", label: "Freebie" },
];

const STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "FEATURED", label: "Featured" },
  { value: "UNVERIFIED", label: "Unverified" },
  { value: "EXPIRED", label: "Expired" },
];

export default function DealForm({ mode, initial, vendors, categories }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<DealFormValues>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function update<K extends keyof DealFormValues>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    const payload: Record<string, unknown> = {
      title: values.title,
      description: values.description,
      dealType: values.dealType,
      promoCode: values.promoCode || null,
      dealUrl: values.dealUrl,
      affiliateUrl: values.affiliateUrl || null,
      imageUrl: values.imageUrl || null,
      vendorId: values.vendorId,
      categoryId: values.categoryId,
      status: values.status,
      originalPrice: values.originalPrice ? parseFloat(values.originalPrice) : null,
      discountAmount: values.discountAmount ? parseFloat(values.discountAmount) : null,
      expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
    };

    try {
      const url =
        mode === "create"
          ? "/api/admin/deals"
          : `/api/admin/deals/${initial.id}`;
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

      setSuccess(mode === "create" ? "Deal created!" : "Deal updated!");
      if (mode === "create") {
        router.push(`/admin/deals/${data.data.id}/edit`);
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
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          required
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="20% off all math curriculum"
        />
      </div>

      <div className="adm-form-row">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          required
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Two-sentence description of the deal."
        />
      </div>

      <div className="adm-form-row two">
        <div className="adm-form-row">
          <label htmlFor="vendorId">Vendor *</label>
          <select
            id="vendorId"
            required
            value={values.vendorId}
            onChange={(e) => update("vendorId", e.target.value)}
          >
            <option value="">Select vendor…</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <span className="hint">
            <Link
              href="/admin/vendors/new"
              style={{ color: "var(--primary)" }}
              target="_blank"
            >
              + Create new vendor
            </Link>
          </span>
        </div>
        <div className="adm-form-row">
          <label htmlFor="categoryId">Category *</label>
          <select
            id="categoryId"
            required
            value={values.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="adm-form-row two">
        <div className="adm-form-row">
          <label htmlFor="dealType">Deal Type *</label>
          <select
            id="dealType"
            required
            value={values.dealType}
            onChange={(e) => update("dealType", e.target.value)}
          >
            {DEAL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="adm-form-row">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={values.status}
            onChange={(e) => update("status", e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="adm-form-row two">
        <div className="adm-form-row">
          <label htmlFor="originalPrice">Original Price</label>
          <input
            id="originalPrice"
            type="number"
            step="0.01"
            min="0"
            value={values.originalPrice}
            onChange={(e) => update("originalPrice", e.target.value)}
            placeholder="49.99"
          />
        </div>
        <div className="adm-form-row">
          <label htmlFor="discountAmount">Discount Amount</label>
          <input
            id="discountAmount"
            type="number"
            step="0.01"
            min="0"
            value={values.discountAmount}
            onChange={(e) => update("discountAmount", e.target.value)}
            placeholder="20 (for 20% off or $20 off)"
          />
          <span className="hint">
            Percentage if Deal Type is &ldquo;% Off&rdquo;, dollar amount if &ldquo;$ Off&rdquo;.
          </span>
        </div>
      </div>

      <div className="adm-form-row two">
        <div className="adm-form-row">
          <label htmlFor="promoCode">Promo Code</label>
          <input
            id="promoCode"
            type="text"
            value={values.promoCode}
            onChange={(e) => update("promoCode", e.target.value)}
            placeholder="HOMESCHOOL25"
          />
        </div>
        <div className="adm-form-row">
          <label htmlFor="expiresAt">Expires</label>
          <input
            id="expiresAt"
            type="date"
            value={values.expiresAt}
            onChange={(e) => update("expiresAt", e.target.value)}
          />
        </div>
      </div>

      <div className="adm-form-row">
        <label htmlFor="dealUrl">Deal URL *</label>
        <input
          id="dealUrl"
          type="url"
          required
          value={values.dealUrl}
          onChange={(e) => update("dealUrl", e.target.value)}
          placeholder="https://vendor.com/sale"
        />
      </div>

      <div className="adm-form-row">
        <label htmlFor="affiliateUrl">Affiliate URL</label>
        <input
          id="affiliateUrl"
          type="url"
          value={values.affiliateUrl}
          onChange={(e) => update("affiliateUrl", e.target.value)}
          placeholder="https://affiliate.network/track/..."
        />
        <span className="hint">
          Used as the &ldquo;Get Deal&rdquo; link if set. Falls back to Deal URL.
        </span>
      </div>

      <div className="adm-form-row">
        <label htmlFor="imageUrl">Image URL</label>
        <input
          id="imageUrl"
          type="url"
          value={values.imageUrl}
          onChange={(e) => update("imageUrl", e.target.value)}
          placeholder="https://images.unsplash.com/..."
        />
      </div>

      <div className="actions">
        <Link href="/admin/deals" className="adm-btn ghost">
          Cancel
        </Link>
        <button type="submit" className="adm-btn" disabled={submitting}>
          {submitting
            ? "Saving…"
            : mode === "create"
              ? "Create Deal"
              : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
