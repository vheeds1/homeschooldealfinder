export default function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <span
      className="hsdf-logo-icon"
      style={{
        width: size,
        height: size,
        borderRadius: size <= 32 ? 8 : 14,
        background: "linear-gradient(135deg, #1e57b8, #2a8f76)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 32 32"
        fill="none"
      >
        <path
          d="M5 14L16 5L27 14V25C27 25.5523 26.5523 26 26 26H6C5.44772 26 5 25.5523 5 25V14Z"
          stroke="white"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path d="M11 16.5L15.5 12L21 12V17.5L16.5 22L11 16.5Z" fill="white" />
      </svg>
    </span>
  );
}
