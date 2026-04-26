import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://homeschooldealfinder.com";

export const viewport: Viewport = {
  themeColor: "#2E5EA6",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "HomeschoolDealFinder - Save Big on Homeschool Essentials",
    template: "%s | HomeschoolDealFinder",
  },
  description:
    "Discover the best deals on homeschool curriculum, STEM kits, books, software, and more. Curated by homeschool parents for homeschool families.",
  keywords: [
    "homeschool deals",
    "homeschool discounts",
    "curriculum deals",
    "homeschool savings",
    "STEM kits deals",
    "homeschool coupons",
    "subscription box deals",
    "online course discounts",
    "homeschool resources",
    "homeschool families",
  ],
  authors: [{ name: "HomeschoolDealFinder" }],
  creator: "HomeschoolDealFinder",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "HomeschoolDealFinder",
    title: "HomeschoolDealFinder - Save Big on Homeschool Essentials",
    description:
      "Discover the best deals on homeschool curriculum, STEM kits, books, and more. Curated by homeschool parents for homeschool families.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HomeschoolDealFinder - Save Big on Homeschool Essentials",
    description:
      "Discover the best deals on homeschool curriculum, STEM kits, books, and more.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

// JSON-LD structured data for the website
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "HomeschoolDealFinder",
  url: siteUrl,
  description:
    "Discover the best deals on homeschool curriculum, STEM kits, books, software, and more.",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/deals?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body style={{ display: "flex", minHeight: "100%", flexDirection: "column" }}>
        <Providers>
          <Header />
          <main style={{ flex: 1 }} id="main-content">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
