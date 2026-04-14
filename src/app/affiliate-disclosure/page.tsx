import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description:
    "Learn how HomeschoolDealFinder earns revenue through affiliate partnerships and how it affects you.",
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">
        Affiliate Disclosure
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </p>

      <div className="mt-8 space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            How We Earn Revenue
          </h2>
          <p className="mt-2">
            HomeschoolDealFinder is a free resource for homeschool families.
            To keep this site running and continue curating deals, we
            participate in affiliate programs with many of the vendors and
            retailers featured on our site.
          </p>
          <p className="mt-2">
            This means that when you click on certain links on our site and
            make a purchase, we may receive a small commission from the
            retailer. This comes at <strong>no additional cost to you</strong> — the
            price you pay is the same whether you use our link or go directly
            to the vendor.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            What This Means for You
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-6">
            <li>
              <strong>No extra cost:</strong> You will never pay more by using
              a link from HomeschoolDealFinder. Our affiliate partnerships do
              not increase the price of any product or service.
            </li>
            <li>
              <strong>Honest recommendations:</strong> We only feature deals
              and products that we believe provide genuine value to homeschool
              families. Affiliate relationships do not influence which deals
              we share or how we present them.
            </li>
            <li>
              <strong>Transparency:</strong> Links that may earn us a
              commission are affiliate links. We believe in full transparency
              with our community.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            Affiliate Programs We Participate In
          </h2>
          <p className="mt-2">
            We participate in various affiliate programs including, but not
            limited to: Amazon Associates, ShareASale, Impact, CJ Affiliate,
            and direct partnerships with individual homeschool curriculum and
            educational product vendors.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            FTC Compliance
          </h2>
          <p className="mt-2">
            In accordance with the Federal Trade Commission (FTC) guidelines,
            we disclose that HomeschoolDealFinder has financial relationships
            with some of the merchants and vendors mentioned on this website.
            HomeschoolDealFinder may be compensated if consumers choose to
            use the links provided and make purchases from the associated
            merchants.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            Questions?
          </h2>
          <p className="mt-2">
            If you have any questions about our affiliate relationships or
            this disclosure, please don&apos;t hesitate to reach out to us at{" "}
            <a
              href="mailto:hello@homeschooldealfinder.com"
              className="text-[#2E5EA6] underline hover:text-[#1E4A8A]"
            >
              hello@homeschooldealfinder.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
