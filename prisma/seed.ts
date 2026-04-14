import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const categories = [
    { name: "Curriculum & Textbooks", slug: "curriculum-textbooks", iconName: "book-open", displayOrder: 1 },
    { name: "Digital Tools & Apps", slug: "digital-tools-apps", iconName: "laptop", displayOrder: 2 },
    { name: "Subscription Boxes", slug: "subscription-boxes", iconName: "package", displayOrder: 3 },
    { name: "Science & STEM", slug: "science-stem", iconName: "flask", displayOrder: 4 },
    { name: "Online Courses", slug: "online-courses", iconName: "graduation-cap", displayOrder: 5 },
    { name: "Art Supplies", slug: "art-supplies", iconName: "palette", displayOrder: 6 },
    { name: "Travel & Experiences", slug: "travel-experiences", iconName: "map-pin", displayOrder: 7 },
    { name: "Printables & Downloads", slug: "printables-downloads", iconName: "download", displayOrder: 8 },
    { name: "Extracurriculars & Sports", slug: "extracurriculars-sports", iconName: "trophy", displayOrder: 9 },
    { name: "Events & Conferences", slug: "events-conferences", iconName: "calendar", displayOrder: 10 },
  ];

  console.log("Seeding categories...");
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log(`Created ${categories.length} categories`);

  const sampleVendor = await prisma.vendor.upsert({
    where: { slug: "sample-vendor" },
    update: {},
    create: {
      name: "Sample Vendor",
      slug: "sample-vendor",
      website: "https://example.com",
      isPartner: false,
    },
  });

  const curriculumCat = await prisma.category.findUnique({ where: { slug: "curriculum-textbooks" } });
  const stemCat = await prisma.category.findUnique({ where: { slug: "science-stem" } });
  const digitalCat = await prisma.category.findUnique({ where: { slug: "digital-tools-apps" } });
  const subBoxCat = await prisma.category.findUnique({ where: { slug: "subscription-boxes" } });
  const coursesCat = await prisma.category.findUnique({ where: { slug: "online-courses" } });

  if (!curriculumCat || !stemCat || !digitalCat || !subBoxCat || !coursesCat) {
    throw new Error("Categories not found after seeding");
  }

  const sampleDeals = [
    {
      title: "20% Off All Math Curriculum",
      slug: "20-off-math-curriculum",
      description: "Save 20% on all math textbooks and workbooks. Perfect for K-12 homeschool families.",
      dealType: "PERCENT_OFF" as const,
      originalPrice: 49.99,
      discountAmount: 20,
      dealUrl: "https://example.com/math-deal",
      categoryId: curriculumCat.id,
      vendorId: sampleVendor.id,
      status: "ACTIVE" as const,
      verifiedAt: new Date(),
    },
    {
      title: "Free STEM Kit Trial Box",
      slug: "free-stem-kit-trial",
      description: "Get your first STEM subscription box free. Includes hands-on science experiments for grades 3-8.",
      dealType: "FREE_TRIAL" as const,
      dealUrl: "https://example.com/stem-trial",
      categoryId: stemCat.id,
      vendorId: sampleVendor.id,
      status: "ACTIVE" as const,
      verifiedAt: new Date(),
    },
    {
      title: "$15 Off Annual Reading Platform",
      slug: "15-off-reading-platform",
      description: "Save $15 on a yearly subscription to an adaptive reading platform with thousands of books.",
      dealType: "DOLLAR_OFF" as const,
      originalPrice: 79.99,
      discountAmount: 15,
      dealUrl: "https://example.com/reading-deal",
      categoryId: digitalCat.id,
      vendorId: sampleVendor.id,
      status: "ACTIVE" as const,
      verifiedAt: new Date(),
    },
    {
      title: "Buy 3 Months Get 1 Free - History Box",
      slug: "history-box-deal",
      description: "Subscribe to a monthly history exploration box and get your 4th month free.",
      dealType: "MEMBERSHIP" as const,
      originalPrice: 34.99,
      dealUrl: "https://example.com/history-box",
      categoryId: subBoxCat.id,
      vendorId: sampleVendor.id,
      status: "ACTIVE" as const,
      verifiedAt: new Date(),
    },
    {
      title: "HOMESCHOOL25 - 25% Off Online Science Course",
      slug: "25-off-science-course",
      description: "Use code HOMESCHOOL25 for 25% off any online science course. Self-paced, video-based learning.",
      dealType: "PROMO_CODE" as const,
      promoCode: "HOMESCHOOL25",
      originalPrice: 149.99,
      discountAmount: 25,
      dealUrl: "https://example.com/science-course",
      categoryId: coursesCat.id,
      vendorId: sampleVendor.id,
      status: "FEATURED" as const,
      verifiedAt: new Date(),
    },
  ];

  console.log("Seeding sample deals...");
  for (const deal of sampleDeals) {
    await prisma.deal.upsert({
      where: { slug: deal.slug },
      update: deal,
      create: deal,
    });
  }
  console.log(`Created ${sampleDeals.length} sample deals`);

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
