import { cn } from "@/lib/utils";

interface DiscountBadgeProps {
  dealType: "PERCENT_OFF" | "DOLLAR_OFF" | "FREE_TRIAL" | "PROMO_CODE" | "MEMBERSHIP" | "FREEBIE";
  discountAmount?: number | null;
  className?: string;
}

export default function DiscountBadge({
  dealType,
  discountAmount,
  className,
}: DiscountBadgeProps) {
  let label: string;
  let colorClass: string;

  switch (dealType) {
    case "PERCENT_OFF":
      label = `${discountAmount ?? 0}% OFF`;
      colorClass = "bg-red-600 text-white";
      break;
    case "DOLLAR_OFF":
      label = `$${discountAmount ?? 0} OFF`;
      colorClass = "bg-orange-600 text-white";
      break;
    case "FREE_TRIAL":
      label = "FREE TRIAL";
      colorClass = "bg-[#1A7A5E] text-white";
      break;
    case "FREEBIE":
      label = "FREE";
      colorClass = "bg-[#1A7A5E] text-white";
      break;
    case "PROMO_CODE":
      label = "PROMO CODE";
      colorClass = "bg-[#2E5EA6] text-white";
      break;
    case "MEMBERSHIP":
      label = "MEMBERSHIP";
      colorClass = "bg-purple-600 text-white";
      break;
    default:
      label = "DEAL";
      colorClass = "bg-gray-600 text-white";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wide",
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}
