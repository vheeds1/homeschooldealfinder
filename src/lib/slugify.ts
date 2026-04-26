import { prisma } from "@/lib/prisma";

/**
 * Convert a string into a URL-safe slug.
 * Lowercases, replaces non-alphanumerics with hyphens, collapses
 * consecutive hyphens, and trims leading/trailing hyphens.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Resolve a slug for a deal that is unique against existing deals.
 * Appends `-2`, `-3`, … until a free slug is found.
 *
 * @param title       the source title
 * @param excludeId   optional deal id to exclude from the uniqueness check
 *                    (used when updating an existing deal)
 */
export async function uniqueDealSlug(
  title: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(title) || "deal";
  let candidate = base;
  let suffix = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.deal.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

/**
 * Resolve a slug for a vendor that is unique against existing vendors.
 */
export async function uniqueVendorSlug(
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(name) || "vendor";
  let candidate = base;
  let suffix = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.vendor.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}
