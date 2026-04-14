import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  curriculum: "bg-blue-100 text-blue-800",
  "stem-kits": "bg-green-100 text-green-800",
  "subscription-boxes": "bg-purple-100 text-purple-800",
  books: "bg-amber-100 text-amber-800",
  software: "bg-cyan-100 text-cyan-800",
  "art-supplies": "bg-pink-100 text-pink-800",
  "test-prep": "bg-red-100 text-red-800",
  "online-courses": "bg-indigo-100 text-indigo-800",
  games: "bg-orange-100 text-orange-800",
  supplies: "bg-teal-100 text-teal-800",
};

interface CategoryBadgeProps {
  name: string;
  slug: string;
  className?: string;
}

export default function CategoryBadge({
  name,
  slug,
  className,
}: CategoryBadgeProps) {
  const colorClass = categoryColors[slug] ?? "bg-gray-100 text-gray-800";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClass,
        className
      )}
    >
      {name}
    </span>
  );
}
