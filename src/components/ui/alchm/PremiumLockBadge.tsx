import type { JSX } from "react";

export function PremiumLockBadge(): JSX.Element {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 7px",
        background: "color-mix(in oklch, var(--accent), transparent 82%)",
        border: "1px solid color-mix(in oklch, var(--accent), transparent 55%)",
        borderRadius: 999,
        fontFamily: "var(--f-mono)",
        fontSize: 9,
        color: "var(--accent)",
        letterSpacing: "0.14em",
        fontWeight: 600,
      }}
    >
      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
        <rect x="1.5" y="4" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="0.8" />
        <path d="M3 4V3a1.5 1.5 0 013 0v1" stroke="currentColor" strokeWidth="0.8" fill="none" />
      </svg>
      PREMIUM
    </span>
  );
}

export default PremiumLockBadge;
