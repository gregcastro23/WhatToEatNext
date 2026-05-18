import type { CSSProperties, JSX } from "react";

export type GlyphName =
  | "orbital"
  | "atom"
  | "flask"
  | "mortar"
  | "spiral"
  | "ring"
  | "diamond"
  | "triangle-up"
  | "triangle-down"
  | "triangle-up-bar"
  | "triangle-down-bar"
  | "crosshair"
  | "wave"
  | "search"
  | "bookmark"
  | "arrow"
  | "chevron"
  | "plus"
  | "minus"
  | "x"
  | "check"
  | "google"
  | "settings";

export interface GlyphProps {
  name: GlyphName;
  size?: number;
  stroke?: number;
  className?: string;
  style?: CSSProperties;
}

export function Glyph({
  name,
  size = 24,
  stroke = 1.2,
  className,
  style,
}: GlyphProps): JSX.Element {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    style,
  };

  switch (name) {
    case "orbital":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="12" rx="10" ry="4" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        </svg>
      );
    case "atom":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2.2" fill="currentColor" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(45 12 12)" />
        </svg>
      );
    case "flask":
      return (
        <svg {...common}>
          <path d="M9 3h6M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21.5h11.6a2 2 0 0 0 1.7-3L14 9V3" />
          <path d="M7 16h10" opacity="0.6" />
        </svg>
      );
    case "mortar":
      return (
        <svg {...common}>
          <path d="M4 10h16l-2 7a3 3 0 0 1-3 2.4H9a3 3 0 0 1-3-2.4L4 10z" />
          <path d="M14 4l3 4M14 4l-1 4" />
        </svg>
      );
    case "spiral":
      return (
        <svg {...common}>
          <path d="M12 12a4 4 0 1 1 8 0 8 8 0 1 1-16 0 12 12 0 1 1 24 0" />
        </svg>
      );
    case "ring":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    case "diamond":
      return (
        <svg {...common}>
          <path d="M12 2L22 12L12 22L2 12Z" />
          <path d="M2 12h20M12 2v20" opacity="0.4" />
        </svg>
      );
    case "triangle-up":
      return (
        <svg {...common}>
          <path d="M12 3 L22 20 H2 Z" />
        </svg>
      );
    case "triangle-down":
      return (
        <svg {...common}>
          <path d="M12 21 L2 4 H22 Z" />
        </svg>
      );
    case "triangle-up-bar":
      return (
        <svg {...common}>
          <path d="M12 5 L22 20 H2 Z" />
          <path d="M6 14h12" />
        </svg>
      );
    case "triangle-down-bar":
      return (
        <svg {...common}>
          <path d="M12 19 L2 4 H22 Z" />
          <path d="M6 10h12" />
        </svg>
      );
    case "crosshair":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="6" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      );
    case "wave":
      return (
        <svg {...common}>
          <path d="M2 12c2 0 2-4 5-4s3 8 5 8 3-8 5-8 3 4 5 4" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
      );
    case "bookmark":
      return (
        <svg {...common}>
          <path d="M6 3h12v18l-6-4-6 4V3z" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 4v16M4 12h16" />
        </svg>
      );
    case "minus":
      return (
        <svg {...common}>
          <path d="M4 12h16" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M5 5l14 14M19 5L5 19" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M4 12l5 5 11-12" />
        </svg>
      );
    case "google":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
          <path
            fill="#EA4335"
            d="M12 11v3.2h5.4c-.2 1.4-1.7 4-5.4 4-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.5 2.5 12 2.5c-5.2 0-9.5 4.3-9.5 9.5s4.3 9.5 9.5 9.5c5.5 0 9.1-3.8 9.1-9.2 0-.6 0-1-.1-1.3H12z"
          />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.3-1.3L13.7 3h-3.4l-.6 2.4a7 7 0 0 0-2.3 1.3l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .9.1 1.3l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.3 1.3l.6 2.4h3.4l.6-2.4a7 7 0 0 0 2.3-1.3l2.3.9 2-3.4-2-1.5c.1-.4.1-.9.1-1.3z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

export default Glyph;
