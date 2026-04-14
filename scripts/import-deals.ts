import * as fs from "fs";
import * as path from "path";
import { PrismaClient, DealType, DealStatus } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

interface DealRow {
  id: string;
  title: string;
  vendor_name: string;
  category: string;
  deal_type: string;
  original_price: string;
  discount_amount: string;
  deal_url: string;
  promo_code: string;
  expiry_date: string;
  description: string;
  affiliate_link: string;
  verified_date: string;
}

function parseCSV(content: string): DealRow[] {
  const lines = content.trim().split("\n");
  const headers = lines[0].split("|").map((h) => h.trim());
  const rows: DealRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split("|").map((v) => v.trim());
    if (values.length !== headers.length) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx];
    });
    rows.push(row as unknown as DealRow);
  }

  return rows;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function mapDealType(type: string): DealType {
  const map: Record<string, DealType> = {
    percent_off: "PERCENT_OFF",
    dollar_off: "DOLLAR_OFF",
    free_trial: "FREE_TRIAL",
    promo_code: "PROMO_CODE",
    membership: "MEMBERSHIP",
    freebie: "FREEBIE",
  };
  return map[type.toLowerCase()] || "PROMO_CODE";
}

function mapCategory(category: string): string {
  const map: Record<string, string> = {
    "curriculum & textbooks": "curriculum-textbooks",
    "digital tools & platforms": "digital-tools-apps",
    "digital tools & apps": "digital-tools-apps",
    "subscription boxes": "subscription-boxes",
    "science & stem supplies": "science-stem",
    "science & stem": "science-stem",
    "online courses": "online-courses",
    "art & supplies": "art-supplies",
    "art supplies": "art-supplies",
    "travel & experiences": "travel-experiences",
    "printables & downloads": "printables-downloads",
    "extracurriculars & sports": "extracurriculars-sports",
    "events & conferences": "events-conferences",
  };
  return map[category.toLowerCase()] || slugify(category);
}

function determineDealStatus(expiryDate: string): DealStatus {
  if (!expiryDate || expiryDate.trim() === "") return "UNVERIFIED";
  const expiry = new Date(expiryDate);
  if (isNaN(expiry.getTime())) return "UNVERIFIED";
  return expiry > new Date() ? "ACTIVE" : "EXPIRED";
}

async function main() {
  const csvPath = path.resolve(__dirname, "../../_cowork/content/launch-deals.csv");

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at: ${csvPath}`);
    console.log("Make sure the Cowork deal inventory (CW-6) has been completed first.");
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(content);

  console.log(`Found ${rows.length} deals in CSV`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      // Find or create vendor
      const vendorSlug = slugify(row.vendor_name);
      const vendor = await prisma.vendor.upsert({
        where: { slug: vendorSlug },
        update: {},
        create: {
          name: row.vendor_name,
          slug: vendorSlug,
          isPartner: false,
        },
      });

      // Find category
      const categorySlug = mapCategory(row.category);
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });

      if (!category) {
        console.warn(`  Skipping "${row.title}" — category "${row.category}" (slug: ${categorySlug}) not found`);
        skipped++;
        continue;
      }

      // Create deal
      const dealSlug = slugify(row.title);
      const status = determineDealStatus(row.expiry_date);

      await prisma.deal.upsert({
        where: { slug: dealSlug },
        update: {},
        create: {
          title: row.title,
          slug: dealSlug,
          description: row.description || "",
          dealType: mapDealType(row.deal_type),
          originalPrice: row.original_price ? parseFloat(row.original_price) : null,
          discountAmount: row.discount_amount ? parseFloat(row.discount_amount) : null,
          promoCode: row.promo_code || null,
          dealUrl: row.deal_url,
          affiliateUrl: row.affiliate_link || null,
          vendorId: vendor.id,
          categoryId: category.id,
          status,
          expiresAt: row.expiry_date ? new Date(row.expiry_date) : null,
          verifiedAt: row.verified_date ? new Date(row.verified_date) : new Date(),
        },
      });

      imported++;
      console.log(`  Imported ${imported}/${rows.length}: ${row.title}`);
    } catch (err) {
      errors++;
      console.error(`  Error importing "${row.title}":`, err);
    }
  }

  console.log("\n--- Import Summary ---");
  console.log(`Total in CSV: ${rows.length}`);
  console.log(`Imported:      ${imported}`);
  console.log(`Skipped:       ${skipped}`);
  console.log(`Errors:        ${errors}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
