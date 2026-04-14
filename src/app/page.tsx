import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DealCard, { type DealCardDeal } from "@/components/DealCard";
import SearchBar from "@/components/SearchBar";
import NewsletterForm from "@/components/NewsletterForm";
import FeaturedDealReveal from "@/components/FeaturedDealReveal";

// ---------- data fetching ----------

async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      take: 10,
    });
  } catch {
    return [];
  }
}

async function getFeaturedDeal() {
  try {
    return await prisma.deal.findFirst({
      where: { status: "FEATURED" },
      include: { vendor: true, category: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return null;
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

async function getExpiringSoonDeals() {
  try {
    const now = new Date();
    const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return await prisma.deal.findMany({
      where: {
        status: { in: ["ACTIVE", "FEATURED"] },
        expiresAt: { gte: now, lte: inSevenDays },
      },
      include: { vendor: true, category: true },
      orderBy: { expiresAt: "asc" },
      take: 6,
    });
  } catch {
    return [];
  }
}

async function getDealCount() {
  try {
    return await prisma.deal.count({
      where: { status: { in: ["ACTIVE", "FEATURED"] } },
    });
  } catch {
    return 0;
  }
}

async function getVendorCount() {
  try {
    return await prisma.vendor.count();
  } catch {
    return 0;
  }
}

// ---------- category icon map ----------

const categoryIcons: Record<string, React.ReactNode> = {
  curriculum: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  "stem-kits": (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
  "subscription-boxes": (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18" />
    </svg>
  ),
  books: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  software: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
    </svg>
  ),
  "art-supplies": (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
    </svg>
  ),
  "test-prep": (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  ),
  "online-courses": (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
    </svg>
  ),
  games: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.491 48.491 0 01-4.163-.3c-1.23-.152-2.38.791-2.38 2.033v0c0 .98.62 1.874 1.507 2.349 1.078.578 2.22.965 3.408 1.136a.64.64 0 01.56.64v.068a.64.64 0 01-.56.635 13.693 13.693 0 01-3.408 1.136A2.526 2.526 0 003 15.555v0c0 1.242 1.15 2.185 2.38 2.033a48.554 48.554 0 014.163-.3.64.64 0 01.657.642v0c0 .355-.186.676-.401.959a1.818 1.818 0 00-.349 1.003c0 1.035 1.007 1.875 2.25 1.875s2.25-.84 2.25-1.875c0-.369-.128-.713-.349-1.003a1.579 1.579 0 01-.401-.96v0a.64.64 0 01.658-.642 48.49 48.49 0 014.163.3c1.229.152 2.38-.791 2.38-2.033v0a2.526 2.526 0 00-1.507-2.349 13.693 13.693 0 01-3.408-1.136.64.64 0 01-.56-.635v-.068a.64.64 0 01.56-.64c1.188-.171 2.33-.558 3.408-1.136A2.526 2.526 0 0021 8.555v0c0-1.242-1.15-2.185-2.38-2.033a48.517 48.517 0 01-4.163.3.64.64 0 01-.657-.643v0z" />
    </svg>
  ),
  supplies: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
};

function getCategoryIcon(slug: string): React.ReactNode {
  return (
    categoryIcons[slug] ?? (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    )
  );
}

// ---------- page ----------

export default async function HomePage() {
  const [categories, featuredDeal, newestDeals, expiringSoon, dealCount, vendorCount] =
    await Promise.all([
      getCategories(),
      getFeaturedDeal(),
      getNewestDeals(),
      getExpiringSoonDeals(),
      getDealCount(),
      getVendorCount(),
    ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2E5EA6] to-[#1A7A5E] py-16 sm:py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0di0xaDEwdi0xSDM2di0xaDExdi0xSDM2di0xaDEydi0xSDM2di0xaDEzdi0xSDM2di0xaDE0di0xSDM2di0xaDE1di0xSDM2di0xaDE2di0xSDM2di0xaDE3di0xSDM2Vi05aDE4VjdIMzZWNmgxNVY1SDM2VjRoMTRWM0gzNlYyaDEzVjFIMzZ2LTFoLTF2MUgyNHYxaDExdjFIMjN2MWgxMnYxSDIydjFoMTN2MUgyMXYxaDE0djFIMjB2MWgxNXYxSDE5djFoMTZ2MUgxOHYxaDE3djFIMzZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Save Big on Homeschool Essentials
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
            Discover verified deals on curriculum, STEM kits, books, and
            more — curated by homeschool parents like you.
          </p>

          <div className="mx-auto mt-8 max-w-lg">
            <SearchBar
              placeholder="Search deals, curriculum, vendors..."
              className="[&_input]:border-white/20 [&_input]:bg-white/10 [&_input]:text-white [&_input]:placeholder:text-white/60 [&_input:focus]:border-white/40 [&_input:focus]:ring-white/20"
            />
          </div>

          <div className="mx-auto mt-8 flex max-w-lg flex-wrap justify-center gap-4">
            <div className="rounded-lg bg-white/10 px-5 py-3 text-center backdrop-blur">
              <p className="text-2xl font-bold text-white">{dealCount || "500+"}</p>
              <p className="text-sm text-blue-100">Active Deals</p>
            </div>
            <div className="rounded-lg bg-white/10 px-5 py-3 text-center backdrop-blur">
              <p className="text-2xl font-bold text-white">{vendorCount || "200+"}</p>
              <p className="text-sm text-blue-100">Vendors</p>
            </div>
            <div className="rounded-lg bg-white/10 px-5 py-3 text-center backdrop-blur">
              <p className="text-2xl font-bold text-white">{categories.length || "10"}</p>
              <p className="text-sm text-blue-100">Categories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Deal Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Browse by Category
          </h2>
          <p className="mt-2 text-gray-500">
            Find the best deals across all homeschool resources
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {(categories.length > 0
            ? categories
            : [
                { id: "1", name: "Curriculum", slug: "curriculum", dealCount: 0 },
                { id: "2", name: "STEM Kits", slug: "stem-kits", dealCount: 0 },
                { id: "3", name: "Subscription Boxes", slug: "subscription-boxes", dealCount: 0 },
                { id: "4", name: "Books", slug: "books", dealCount: 0 },
                { id: "5", name: "Software & Apps", slug: "software", dealCount: 0 },
                { id: "6", name: "Art Supplies", slug: "art-supplies", dealCount: 0 },
                { id: "7", name: "Test Prep", slug: "test-prep", dealCount: 0 },
                { id: "8", name: "Online Courses", slug: "online-courses", dealCount: 0 },
                { id: "9", name: "Games & Puzzles", slug: "games", dealCount: 0 },
                { id: "10", name: "Supplies", slug: "supplies", dealCount: 0 },
              ]
          ).map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 text-center transition-all hover:border-[#2E5EA6]/30 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2E5EA6]/10 text-[#2E5EA6] transition-colors group-hover:bg-[#2E5EA6] group-hover:text-white">
                {getCategoryIcon(cat.slug)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                <p className="text-xs text-gray-500">
                  {cat.dealCount} {cat.dealCount === 1 ? "deal" : "deals"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Deal */}
      {featuredDeal && (
        <section className="bg-gradient-to-r from-amber-50 to-orange-50 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center gap-2">
              <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
                FEATURED DEAL
              </span>
              <div className="h-px flex-1 bg-amber-200" />
            </div>
            <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8 lg:flex lg:items-center lg:gap-8">
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#2E5EA6]/10 px-3 py-1 text-xs font-medium text-[#2E5EA6]">
                    {featuredDeal.vendor.name}
                  </span>
                  <span className="rounded-full bg-[#1A7A5E]/10 px-3 py-1 text-xs font-medium text-[#1A7A5E]">
                    {featuredDeal.category.name}
                  </span>
                </div>
                <h3 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                  {featuredDeal.title}
                </h3>
                <p className="mb-4 text-gray-600">{featuredDeal.description}</p>

                {featuredDeal.promoCode && (
                  <FeaturedDealReveal promoCode={featuredDeal.promoCode} />
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <a
                    href={featuredDeal.dealUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg bg-[#2E5EA6] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1E4A8A]"
                  >
                    Get This Deal
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="ml-2 h-4 w-4">
                      <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <Link
                    href={`/deals/${featuredDeal.slug}`}
                    className="text-sm font-medium text-[#2E5EA6] hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center lg:mt-0">
                <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2E5EA6] to-[#1A7A5E] text-white">
                  {featuredDeal.dealType === "PERCENT_OFF" && (
                    <div className="text-center">
                      <p className="text-3xl font-extrabold">{featuredDeal.discountAmount}%</p>
                      <p className="text-sm font-semibold">OFF</p>
                    </div>
                  )}
                  {featuredDeal.dealType === "DOLLAR_OFF" && (
                    <div className="text-center">
                      <p className="text-3xl font-extrabold">${featuredDeal.discountAmount}</p>
                      <p className="text-sm font-semibold">OFF</p>
                    </div>
                  )}
                  {featuredDeal.dealType === "FREEBIE" && (
                    <p className="text-3xl font-extrabold">FREE</p>
                  )}
                  {featuredDeal.dealType === "FREE_TRIAL" && (
                    <div className="text-center">
                      <p className="text-2xl font-extrabold">FREE</p>
                      <p className="text-sm font-semibold">TRIAL</p>
                    </div>
                  )}
                  {!["PERCENT_OFF", "DOLLAR_OFF", "FREEBIE", "FREE_TRIAL"].includes(featuredDeal.dealType) && (
                    <p className="text-2xl font-extrabold">DEAL</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Newest Deals */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Newest Deals
            </h2>
            <p className="mt-1 text-gray-500">Fresh deals just added</p>
          </div>
          <Link
            href="/deals"
            className="text-sm font-semibold text-[#2E5EA6] hover:underline"
          >
            View All Deals &rarr;
          </Link>
        </div>

        {newestDeals.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {newestDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal as unknown as DealCardDeal}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-500">
              No deals yet. Check back soon or{" "}
              <Link
                href="/submit"
                className="font-medium text-[#2E5EA6] hover:underline"
              >
                submit a deal
              </Link>
              !
            </p>
          </div>
        )}
      </section>

      {/* Expiring Soon */}
      {expiringSoon.length > 0 && (
        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  Expiring Soon
                </h2>
                <p className="mt-1 text-gray-500">
                  Grab these before they&apos;re gone
                </p>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
              {expiringSoon.map((deal) => (
                <div key={deal.id} className="w-72 shrink-0">
                  <DealCard deal={deal as unknown as DealCardDeal} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-br from-[#2E5EA6] to-[#1A7A5E] p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Never Miss a Homeschool Deal
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-blue-100">
            Join thousands of homeschool families getting the best deals
            delivered to their inbox every week.
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
