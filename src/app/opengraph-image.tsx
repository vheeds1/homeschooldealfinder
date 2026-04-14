import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2E5EA6 0%, #1A7A5E 100%)",
        }}
      >
        {/* Book icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="1.5"
          width="120"
          height="120"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>

        {/* Title */}
        <div
          style={{
            marginTop: 40,
            fontSize: 64,
            fontWeight: 700,
            color: "white",
            letterSpacing: "-0.02em",
          }}
        >
          HomeschoolDealFinder
        </div>

        {/* Subtitle */}
        <div
          style={{
            marginTop: 16,
            fontSize: 32,
            fontWeight: 400,
            color: "rgba(255, 255, 255, 0.85)",
          }}
        >
          Save Big on Homeschool Essentials
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
