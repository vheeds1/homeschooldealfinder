type IconName =
  | "search"
  | "heart"
  | "heart-fill"
  | "bell"
  | "clock"
  | "arrow"
  | "close"
  | "copy"
  | "book"
  | "flask"
  | "box"
  | "laptop"
  | "pencil"
  | "palette"
  | "globe"
  | "calculator"
  | "package"
  | "diamond"
  | "menu";

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
}

export default function Icon({ name, size = 16, stroke = 1.8, className }: IconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (name) {
    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case "heart":
      return (
        <svg {...props}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case "heart-fill":
      return (
        <svg {...props} fill="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case "bell":
      return (
        <svg {...props}>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...props}>
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      );
    case "close":
      return (
        <svg {...props}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      );
    case "copy":
      return (
        <svg {...props}>
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      );
    case "book":
      return (
        <svg {...props}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case "flask":
      return (
        <svg {...props}>
          <path d="M9 3h6v5l5 9a2 2 0 0 1-2 3H6a2 2 0 0 1-2-3l5-9z" />
          <path d="M9 3v5" />
          <path d="M15 3v5" />
        </svg>
      );
    case "box":
      return (
        <svg {...props}>
          <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
          <path d="M3.27 8 12 13l8.73-5" />
          <path d="M12 22V13" />
        </svg>
      );
    case "laptop":
      return (
        <svg {...props}>
          <rect x="2" y="4" width="20" height="13" rx="2" />
          <path d="M2 20h20" />
        </svg>
      );
    case "pencil":
      return (
        <svg {...props}>
          <path d="M12 19l7-7 3 3-7 7H12v-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18z" />
          <path d="M2 2l7.586 7.586" />
        </svg>
      );
    case "palette":
      return (
        <svg {...props}>
          <circle cx="13.5" cy="6.5" r="1.5" />
          <circle cx="17.5" cy="10.5" r="1.5" />
          <circle cx="8.5" cy="7.5" r="1.5" />
          <circle cx="6.5" cy="12.5" r="1.5" />
          <path d="M12 22a10 10 0 1 1 10-10c0 4-3 4-3 6s2 4-1 4z" />
        </svg>
      );
    case "globe":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" />
        </svg>
      );
    case "calculator":
      return (
        <svg {...props}>
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 6h8" />
          <path d="M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
        </svg>
      );
    case "package":
      return (
        <svg {...props}>
          <path d="M16 16v6M16 22 12 19l-4 3M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0L18 19" />
          <path d="M3.3 7 12 12l8.7-5" />
        </svg>
      );
    case "diamond":
      return (
        <svg {...props}>
          <path d="M12 2 2 12l10 10 10-10z" />
        </svg>
      );
    case "menu":
      return (
        <svg {...props}>
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      );
    default:
      return null;
  }
}

export const CAT_ICONS: Record<string, IconName> = {
  "curriculum-textbooks": "book",
  "digital-tools-apps": "laptop",
  "subscription-boxes": "box",
  "science-stem": "flask",
  "online-courses": "globe",
  "art-supplies": "palette",
  "travel-experiences": "globe",
  "printables-downloads": "pencil",
  "extracurriculars-sports": "diamond",
  "events-conferences": "calculator",
};
