import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HomeschoolDealFinder",
    short_name: "DealFinder",
    description:
      "Discover the best deals on homeschool curriculum, STEM kits, books, and more.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#2E5EA6",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
