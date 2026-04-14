import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://homeschooldealfinder.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/deals`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/submit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  try {
    const [deals, categories, vendors] = await Promise.all([
      prisma.deal.findMany({
        where: { status: { in: ["ACTIVE", "FEATURED"] } },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 1000,
      }),
      prisma.category.findMany({
        select: { slug: true },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.vendor.findMany({
        select: { slug: true },
        where: { deals: { some: { status: { in: ["ACTIVE", "FEATURED"] } } } },
      }),
    ]);

    const dealPages: MetadataRoute.Sitemap = deals.map((deal) => ({
      url: `${baseUrl}/deals/${deal.slug}`,
      lastModified: deal.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${baseUrl}/categories/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    const vendorPages: MetadataRoute.Sitemap = vendors.map((vendor) => ({
      url: `${baseUrl}/vendors/${vendor.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...categoryPages, ...dealPages, ...vendorPages];
  } catch {
    return staticPages;
  }
}
