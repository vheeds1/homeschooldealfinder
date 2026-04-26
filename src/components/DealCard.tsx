import Link from "next/link";
import Icon, { CAT_ICONS } from "./Icon";

export interface DealCardDeal {
  id: string;
  title: string;
  slug: string;
  description: string;
  dealType:
    | "PERCENT_OFF"
    | "DOLLAR_OFF"
    | "FREE_TRIAL"
    | "PROMO_CODE"
    | "MEMBERSHIP"
    | "FREEBIE";
  originalPrice: number | null;
  discountAmount: number | null;
  promoCode: string | null;
  dealUrl: string;
  imageUrl: string | null;
  status: string;
  expiresAt: string | Date | null;
  upvoteCount: number;
  createdAt: string | Date;
  vendor: { id: string; name: string; slug: string; logoUrl: string | null };
  category: { id: string; name: string; slug: string };
}

interface DealCardProps {
  deal: DealCardDeal;
}

function getDaysLeft(expiresAt: Date | string | null): number | null {
  if (!expiresAt) return null;
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDiscount(deal: DealCardDeal): string {
  switch (deal.dealType) {
    case "PERCENT_OFF":
      return deal.discountAmount ? `${deal.discountAmount}% OFF` : "% OFF";
    case "DOLLAR_OFF":
      return deal.discountAmount ? `$${deal.discountAmount} OFF` : "$ OFF";
    case "FREE_TRIAL":
      return "FREE TRIAL";
    case "PROMO_CODE":
      return "PROMO CODE";
    case "MEMBERSHIP":
      return "MEMBER DEAL";
    case "FREEBIE":
      return "FREE";
    default:
      return "DEAL";
  }
}

export default function DealCard({ deal }: DealCardProps) {
  const daysLeft = getDaysLeft(deal.expiresAt);
  const urgent = daysLeft !== null && daysLeft <= 3;
  const isHot = deal.status === "FEATURED" || urgent;
  const iconName = CAT_ICONS[deal.category.slug] || "diamond";

  const priceNow =
    deal.dealType === "DOLLAR_OFF" && deal.originalPrice && deal.discountAmount
      ? `$${(deal.originalPrice - deal.discountAmount).toFixed(2)}`
      : deal.dealType === "PERCENT_OFF" &&
          deal.originalPrice &&
          deal.discountAmount
        ? `$${(deal.originalPrice * (1 - deal.discountAmount / 100)).toFixed(2)}`
        : deal.dealType === "FREE_TRIAL" || deal.dealType === "FREEBIE"
          ? "Free"
          : null;

  const priceWas = deal.originalPrice ? `$${deal.originalPrice.toFixed(2)}` : null;

  return (
    <Link href={`/deals/${deal.slug}`} className="hsdf-deal-card">
      <div className="hsdf-deal-img">
        <div className="hsdf-deal-img-icon">
          <Icon name={iconName} size={42} stroke={1.6} />
        </div>
        <div className={"hsdf-deal-discount" + (isHot ? " hot" : "")}>
          {formatDiscount(deal)}
        </div>
      </div>
      <div className="hsdf-deal-body">
        <div className="hsdf-deal-brand">{deal.vendor.name}</div>
        <h3 className="hsdf-deal-title">{deal.title}</h3>
        <div className="hsdf-deal-meta">
          <span className="hsdf-tag gray">{deal.category.name}</span>
          {isHot && <span className="hsdf-tag warn">🔥 Hot</span>}
        </div>
        <div className="hsdf-deal-bottom">
          <div className="hsdf-deal-price">
            {priceNow && <span className="now">{priceNow}</span>}
            {priceNow && priceWas && <span className="was">{priceWas}</span>}
            {!priceNow && priceWas && <span className="now">{priceWas}</span>}
          </div>
          {daysLeft !== null && (
            <span
              className={"hsdf-deal-countdown" + (urgent ? " urgent" : "")}
            >
              <Icon name="clock" size={11} stroke={2} />
              {daysLeft === 0 ? "ends today" : `${daysLeft}d left`}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
