import Link from "next/link";
import { cn } from "@/lib/utils";
import CategoryBadge from "./CategoryBadge";
import DiscountBadge from "./DiscountBadge";
import UpvoteButton from "./UpvoteButton";

export interface DealCardDeal {
  id: string;
  title: string;
  slug: string;
  description: string;
  dealType: "PERCENT_OFF" | "DOLLAR_OFF" | "FREE_TRIAL" | "PROMO_CODE" | "MEMBERSHIP" | "FREEBIE";
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
  className?: string;
}

function getTimeRemaining(expiresAt: Date | string): string | null {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();

  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 7) return null;
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

export default function DealCard({ deal, className }: DealCardProps) {
  const timeRemaining = deal.expiresAt
    ? getTimeRemaining(deal.expiresAt)
    : null;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      {deal.status === "FEATURED" && (
        <span className="absolute -top-2 right-3 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">
          Featured
        </span>
      )}

      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <DiscountBadge
            dealType={deal.dealType}
            discountAmount={deal.discountAmount}
          />
          <CategoryBadge name={deal.category.name} slug={deal.category.slug} />
        </div>
        {timeRemaining && (
          <span
            className={cn(
              "shrink-0 text-xs font-medium",
              timeRemaining === "Expired" ? "text-red-500" : "text-orange-600"
            )}
          >
            {timeRemaining}
          </span>
        )}
      </div>

      <Link href={`/deals/${deal.slug}`} className="mb-1 block">
        <h3 className="line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-[#2E5EA6]">
          {deal.title}
        </h3>
      </Link>

      <p className="mb-1 line-clamp-2 text-sm text-gray-500">
        {deal.description}
      </p>

      <p className="mb-4 text-sm text-gray-500">
        by{" "}
        <Link
          href={`/vendors/${deal.vendor.slug}`}
          className="font-medium text-gray-600 hover:text-[#2E5EA6]"
        >
          {deal.vendor.name}
        </Link>
      </p>

      <div className="mt-auto flex items-center justify-between pt-2">
        <UpvoteButton dealId={deal.id} initialCount={deal.upvoteCount} />
        <a
          href={deal.dealUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-[#2E5EA6] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1E4A8A]"
        >
          Get Deal
        </a>
      </div>
    </div>
  );
}
