import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DealCard, { type DealCardDeal } from "@/components/DealCard";
import HeroSearch from "@/components/HeroSearch";
import CommunityVoices from "@/components/CommunityVoices";
import Squiggle from "@/components/Squiggle";
import Icon, { CAT_ICONS } from "@/components/Icon";

// ---------- data fetching ----------

async function getCategories() {
  try {
    const cats = await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      take: 10,
    });
    return cats;
  } catch {
    return [];
  }
}

async function getHotDeals() {
  try {
    return await prisma.deal.findMany({
      where: { status: "FEATURED" },
      include: { vendor: true, category: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
  } catch {
    return [];
  }
}

async function getNewestDeals() {
  try {
    return await prisma.deal.findMany({
      where: { status: { in: ["ACTIVE", "FEATURED"] } },
      include: { vendor: true, category: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
  } catch {
    return [];
  }
}

async function getCounts() {
  try {
    const [dealCount, vendorCount] = await Promise.all([
      prisma.deal.count({ where: { status: { in: ["ACTIVE", "FEATURED"] } } }),
      prisma.vendor.count(),
    ]);
    return { dealCount, vendorCount };
  } catch {
    return { dealCount: 0, vendorCount: 0 };
  }
}

// ---------- fallback categories ----------

const FALLBACK_CATEGORIES = [
  { id: "1", name: "Curriculum & Textbooks", slug: "curriculum-textbooks", dealCount: 0 },
  { id: "2", name: "Digital Tools & Apps", slug: "digital-tools-apps", dealCount: 0 },
  { id: "3", name: "Subscription Boxes", slug: "subscription-boxes", dealCount: 0 },
  { id: "4", name: "Science & STEM", slug: "science-stem", dealCount: 0 },
  { id: "5", name: "Online Courses", slug: "online-courses", dealCount: 0 },
  { id: "6", name: "Art Supplies", slug: "art-supplies", dealCount: 0 },
  { id: "7", name: "Travel & Experiences", slug: "travel-experiences", dealCount: 0 },
  { id: "8", name: "Printables & Downloads", slug: "printables-downloads", dealCount: 0 },
  { id: "9", name: "Extracurriculars & Sports", slug: "extracurriculars-sports", dealCount: 0 },
  { id: "10", name: "Events & Conferences", slug: "events-conferences", dealCount: 0 },
];

// ---------- page ----------

export default async function HomePage() {
  const [categories, hotDeals, newestDeals, counts] = await Promise.all([
    getCategories(),
    getHotDeals(),
    getNewestDeals(),
    getCounts(),
  ]);

  const displayCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES;
  const displayDealCount = counts.dealCount || 500;
  const displayVendorCount = counts.vendorCount || 200;

  return (
    <>
      {/* HERO */}
      <section className="hsdf-hero">
        <div className="hsdf-hero-inner">
          <span className="hsdf-hero-eyebrow">
            <span className="dot"></span>
            Verified daily by homeschool parents
          </span>
          <h1>
            Save big on <span className="grad">homeschool essentials</span>
          </h1>
          <p className="hsdf-hero-tag">
            Curated deals on curriculum, STEM kits, books, and more — every code
            tested before it lands here.
          </p>

          <HeroSearch />

          <div className="hsdf-hero-stats">
            <div className="hsdf-hero-stat">
              <div className="num">{displayDealCount}+</div>
              <div className="lbl">Active Deals</div>
            </div>
            <div className="hsdf-hero-stat">
              <div className="num">{displayVendorCount}+</div>
              <div className="lbl">Vendors</div>
            </div>
            <div className="hsdf-hero-stat">
              <div className="num">{displayCategories.length}</div>
              <div className="lbl">Categories</div>
            </div>
          </div>
        </div>
      </section>

      {/* BROWSE BY CATEGORY */}
      <section className="hsdf-section">
        <div className="hsdf-section-head">
          <h2>
            Browse by Category
            <Squiggle />
          </h2>
          <p>Find the best deals across all homeschool resources</p>
        </div>
        <div className="hsdf-catgrid">
          {displayCategories.map((cat) => {
            const iconName = CAT_ICONS[cat.slug] || "diamond";
            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="hsdf-catcard"
              >
                <div className="icon-circle">
                  <Icon name={iconName} size={22} stroke={1.8} />
                </div>
                <span className="name">{cat.name}</span>
                <span className="count">{cat.dealCount} deals</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* HOT DEALS RIGHT NOW */}
      {hotDeals.length > 0 && (
        <section className="hsdf-section" style={{ paddingTop: 0 }}>
          <div className="hsdf-section-head left">
            <div>
              <h2>Hot Deals Right Now</h2>
              <p>Ending soon — grab them before they&apos;re gone.</p>
            </div>
            <div className="right">
              <Link href="/deals">See all {displayDealCount} →</Link>
            </div>
          </div>
          <div className="hsdf-grid">
            {hotDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal as unknown as DealCardDeal} />
            ))}
          </div>
        </section>
      )}

      {/* COMMUNITY VOICES */}
      <CommunityVoices />

      {/* NEW THIS WEEK */}
      <section className="hsdf-section" style={{ paddingTop: 0 }}>
        <div className="hsdf-section-head left">
          <div>
            <h2>New This Week</h2>
            <p>Fresh deals added daily by our curation team.</p>
          </div>
          <div className="right">
            <Link href="/deals">Browse all →</Link>
          </div>
        </div>
        {newestDeals.length > 0 ? (
          <div className="hsdf-grid">
            {newestDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal as unknown as DealCardDeal} />
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              border: "1px dashed var(--line)",
              borderRadius: 16,
              background: "var(--paper)",
              color: "var(--ink-3)",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "var(--ink)" }}>
              No deals yet
            </div>
            <div style={{ fontSize: 14 }}>
              Check back soon or{" "}
              <Link href="/submit" style={{ color: "var(--primary)", fontWeight: 600 }}>
                submit a deal
              </Link>
              !
            </div>
          </div>
        )}
      </section>
    </>
  );
}
