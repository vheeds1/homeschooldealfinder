import Link from "next/link";
import BrandMark from "./BrandMark";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <>
      {/* Newsletter section above footer */}
      <section className="hsdf-newsletter">
        <div>
          <h2>Never miss a deal.</h2>
          <p>
            One email each Sunday with hand-picked deals, expiration alerts, and
            a homeschool budget tip.
          </p>
          <div className="hsdf-newsletter-perks">
            <div className="hsdf-newsletter-perk">
              Top deals before they expire
            </div>
            <div className="hsdf-newsletter-perk">
              No daily blasts — Sunday only
            </div>
            <div className="hsdf-newsletter-perk">Unsubscribe anytime</div>
          </div>
        </div>
        <div className="hsdf-newsletter-form">
          <NewsletterForm />
          <p className="hsdf-newsletter-fine">
            12,400+ homeschool families · Free · Privacy first
          </p>
        </div>
      </section>

      <footer className="hsdf-footer" role="contentinfo">
        <div className="hsdf-footer-inner">
          <div>
            <Link
              href="/"
              className="hsdf-logo"
              style={{ marginBottom: 16, display: "inline-flex" }}
            >
              <BrandMark size={32} />
              <span
                className="hsdf-logo-mark"
                style={{ color: "white" }}
              >
                Homeschool
                <span style={{ color: "var(--accent)" }}>DealFinder</span>
              </span>
            </Link>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
                lineHeight: 1.6,
                maxWidth: 360,
                margin: "16px 0 0",
              }}
            >
              Curating the best homeschool deals so you spend less time hunting
              for discounts and more time learning together.
            </p>
          </div>

          <div className="hsdf-footer-col">
            <h4>Browse</h4>
            <ul>
              <li>
                <Link href="/deals">Today&apos;s deals</Link>
              </li>
              <li>
                <Link href="/categories">All categories</Link>
              </li>
              <li>
                <Link href="/deals?sort=expiring_soon">Ending soon</Link>
              </li>
              <li>
                <Link href="/submit">Submit a deal</Link>
              </li>
            </ul>
          </div>

          <div className="hsdf-footer-col">
            <h4>Help</h4>
            <ul>
              <li>
                <Link href="/about">How it works</Link>
              </li>
              <li>
                <Link href="/contact">Contact us</Link>
              </li>
              <li>
                <Link href="/account">My account</Link>
              </li>
              <li>
                <Link href="/login">Sign in</Link>
              </li>
            </ul>
          </div>

          <div className="hsdf-footer-col">
            <h4>Site</h4>
            <ul>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/affiliate-disclosure">Affiliate disclosure</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/terms">Terms</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="hsdf-footer-bottom">
          <span>© {new Date().getFullYear()} Homeschool Deal Finder</span>
          <span className="disclosure">
            Affiliate disclosure: We may earn a commission when you purchase
            through links on our site, at no extra cost to you.
          </span>
        </div>
      </footer>
    </>
  );
}
