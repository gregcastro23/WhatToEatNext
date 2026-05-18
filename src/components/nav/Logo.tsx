import Link from "next/link";
import type { JSX } from "react";

export interface LogoProps {
  size?: number;
  href?: string;
}

export function Logo({ size = 22, href = "/" }: LogoProps): JSX.Element {
  const inner = (
    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        style={{ color: "var(--fg)" }}
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3 L12 21 M3 12 L21 12" opacity="0.35" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span className="t-display" style={{ fontSize: 18, color: "var(--fg)" }}>
          alchm
        </span>
        <span
          className="t-mono"
          style={{ fontSize: 8, letterSpacing: "0.3em", color: "var(--fg-mute)" }}
        >
          KITCHEN
        </span>
      </span>
    </span>
  );
  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      {inner}
    </Link>
  );
}

export default Logo;
