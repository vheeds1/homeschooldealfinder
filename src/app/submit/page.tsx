"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const dealFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000),
  dealType: z.enum([
    "PERCENT_OFF",
    "DOLLAR_OFF",
    "FREE_TRIAL",
    "PROMO_CODE",
    "MEMBERSHIP",
    "FREEBIE",
  ]),
  originalPrice: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : undefined))
    .pipe(z.number().positive("Must be a positive number").optional()),
  discountAmount: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : undefined))
    .pipe(z.number().positive("Must be a positive number").optional()),
  promoCode: z.string().max(100).optional(),
  dealUrl: z.string().url("Must be a valid URL"),
  categoryId: z.string().min(1, "Please select a category"),
  vendorId: z.string().min(1, "Please select a vendor"),
  expiresAt: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined)),
});

type FormData = z.input<typeof dealFormSchema>;

interface SelectOption {
  id: string;
  name: string;
  slug: string;
}

const DEAL_TYPES = [
  { value: "PERCENT_OFF", label: "Percentage Off" },
  { value: "DOLLAR_OFF", label: "Dollar Off" },
  { value: "FREE_TRIAL", label: "Free Trial" },
  { value: "PROMO_CODE", label: "Promo Code" },
  { value: "MEMBERSHIP", label: "Membership Deal" },
  { value: "FREEBIE", label: "Freebie" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function SubmitDealPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [vendors, setVendors] = useState<SelectOption[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    dealType: "PERCENT_OFF",
    originalPrice: "",
    discountAmount: "",
    promoCode: "",
    dealUrl: "",
    categoryId: "",
    vendorId: "",
    expiresAt: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchOptions() {
      try {
        const [catRes, vendorRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/vendors"),
        ]);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.data ?? []);
        }
        if (vendorRes.ok) {
          const vendorData = await vendorRes.json();
          setVendors(vendorData.data ?? []);
        }
      } catch {
        // Silently fail - user can still type IDs
      }
    }
    fetchOptions();
  }, []);

  function updateField(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitStatus("idle");

    const parsed = dealFormSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString();
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);

    try {
      const slug = slugify(parsed.data.title);
      const body = {
        ...parsed.data,
        slug,
      };

      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        setSubmitStatus("error");
        setErrorMessage(json.error ?? "Something went wrong");
        return;
      }

      setSubmitStatus("success");
      setTimeout(() => {
        router.push("/deals");
      }, 2000);
    } catch {
      setSubmitStatus("error");
      setErrorMessage("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitStatus === "success") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-lg border border-green-200 bg-green-50 p-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-12 w-12 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-green-800">
            Deal Submitted!
          </h2>
          <p className="mt-2 text-sm text-green-700">
            Your deal has been submitted for review. Our moderators will verify
            it shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-foreground">Submit a Deal</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Share a great homeschool deal with the community. Submitted deals are
        reviewed before publishing.
      </p>

      {submitStatus === "error" && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Deal Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g. 30% off Math-U-See Complete Set"
            className={cn(
              "w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50",
              errors.title ? "border-red-400" : "border-border"
            )}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={4}
            placeholder="Describe the deal, what's included, any restrictions..."
            className={cn(
              "w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50",
              errors.description ? "border-red-400" : "border-border"
            )}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Deal Type */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Deal Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.dealType}
            onChange={(e) => updateField("dealType", e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          >
            {DEAL_TYPES.map((dt) => (
              <option key={dt.value} value={dt.value}>
                {dt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Original Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.originalPrice}
              onChange={(e) => updateField("originalPrice", e.target.value)}
              placeholder="49.99"
              className={cn(
                "w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50",
                errors.originalPrice ? "border-red-400" : "border-border"
              )}
            />
            {errors.originalPrice && (
              <p className="mt-1 text-xs text-red-500">{errors.originalPrice}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Discount Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.discountAmount}
              onChange={(e) => updateField("discountAmount", e.target.value)}
              placeholder="15.00"
              className={cn(
                "w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50",
                errors.discountAmount ? "border-red-400" : "border-border"
              )}
            />
            {errors.discountAmount && (
              <p className="mt-1 text-xs text-red-500">
                {errors.discountAmount}
              </p>
            )}
          </div>
        </div>

        {/* Promo code */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Promo Code
          </label>
          <input
            type="text"
            value={formData.promoCode}
            onChange={(e) => updateField("promoCode", e.target.value)}
            placeholder="SAVE30"
            className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Deal URL */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Deal URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={formData.dealUrl}
            onChange={(e) => updateField("dealUrl", e.target.value)}
            placeholder="https://example.com/deal"
            className={cn(
              "w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50",
              errors.dealUrl ? "border-red-400" : "border-border"
            )}
          />
          {errors.dealUrl && (
            <p className="mt-1 text-xs text-red-500">{errors.dealUrl}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => updateField("categoryId", e.target.value)}
            className={cn(
              "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50",
              errors.categoryId ? "border-red-400" : "border-border"
            )}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>
          )}
        </div>

        {/* Vendor */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Vendor <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.vendorId}
            onChange={(e) => updateField("vendorId", e.target.value)}
            className={cn(
              "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50",
              errors.vendorId ? "border-red-400" : "border-border"
            )}
          >
            <option value="">Select a vendor</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          {errors.vendorId && (
            <p className="mt-1 text-xs text-red-500">{errors.vendorId}</p>
          )}
        </div>

        {/* Expiry date */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Expires At
          </label>
          <input
            type="datetime-local"
            value={formData.expiresAt}
            onChange={(e) => updateField("expiresAt", e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Submitting..." : "Submit Deal"}
        </Button>
      </form>
    </div>
  );
}
