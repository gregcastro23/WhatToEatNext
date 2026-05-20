"use client";

/**
 * atoms.tsx — visual atoms shared across the dashboard.
 * Ported verbatim from the design handoff's atoms.jsx, retyped
 * for TypeScript / React 19 strictness.
 */

import React from "react";

// ============================================================
// GLYPH — abstract alchemical/scientific marks
// ============================================================
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

interface GlyphProps {
  name: GlyphName;
  size?: number;
  stroke?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Glyph({
  name,
  size = 24,
  stroke = 1.2,
  className = "",
  style = {},
}: GlyphProps) {
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
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          className={className}
          style={style}
        >
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

// ============================================================
// ELEMENTAL METER — fire / water / earth / air bars or radial
// ============================================================
interface ElementalMeterProps {
  values?: { fire: number; water: number; earth: number; air: number };
  compact?: boolean;
  layout?: "bars" | "radial";
}

export function ElementalMeter({
  values = { fire: 0.62, water: 0.28, earth: 0.71, air: 0.45 },
  compact = false,
  layout = "bars",
}: ElementalMeterProps) {
  const els = [
    { id: "fire", label: "FIRE", v: values.fire, color: "var(--el-fire)" },
    { id: "water", label: "WATER", v: values.water, color: "var(--el-water)" },
    { id: "earth", label: "EARTH", v: values.earth, color: "var(--el-earth)" },
    { id: "air", label: "AIR", v: values.air, color: "var(--el-air)" },
  ];

  if (layout === "radial") {
    const size = compact ? 100 : 140;
    const c = size / 2;
    return (
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size}>
          {[0, 1, 2, 3].map((i) => {
            const angle = (i / 4) * 2 * Math.PI - Math.PI / 2;
            return (
              <line
                key={i}
                x1={c}
                y1={c}
                x2={c + Math.cos(angle) * c * 0.85}
                y2={c + Math.sin(angle) * c * 0.85}
                stroke="rgba(255,255,255,0.08)"
              />
            );
          })}
          {[0.25, 0.5, 0.75, 1].map((r) => (
            <circle
              key={r}
              cx={c}
              cy={c}
              r={c * 0.85 * r}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
            />
          ))}
          <polygon
            points={els
              .map((el, i) => {
                const angle = (i / 4) * 2 * Math.PI - Math.PI / 2;
                const r = c * 0.85 * el.v;
                return `${c + Math.cos(angle) * r},${c + Math.sin(angle) * r}`;
              })
              .join(" ")}
            fill="color-mix(in oklch, var(--accent), transparent 75%)"
            stroke="var(--accent)"
            strokeWidth="1"
          />
          {els.map((el, i) => {
            const angle = (i / 4) * 2 * Math.PI - Math.PI / 2;
            const r = c * 0.85 * el.v;
            return (
              <circle
                key={el.id}
                cx={c + Math.cos(angle) * r}
                cy={c + Math.sin(angle) * r}
                r={2.5}
                fill={el.color}
              />
            );
          })}
        </svg>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 8 : 12, width: "100%" }}>
      {els.map((el) => (
        <div key={el.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={`el-dot el-${el.id}`} />
              <span className="t-label" style={{ color: "var(--fg-dim)" }}>{el.label}</span>
            </div>
            <span className="t-num" style={{ fontSize: compact ? 11 : 13, color: "var(--fg)" }}>
              {(el.v * 100).toFixed(1)}
              <span style={{ color: "var(--fg-mute)" }}>%</span>
            </span>
          </div>
          <div style={{ position: "relative", height: compact ? 4 : 6, background: "rgba(255,255,255,0.05)", borderRadius: 999, overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${el.v * 100}%`,
                background: `linear-gradient(90deg, ${el.color}, color-mix(in oklch, ${el.color}, transparent 30%))`,
                boxShadow: `0 0 12px ${el.color}`,
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// COMPATIBILITY RING — circular score
// ============================================================
interface CompatibilityRingProps {
  value?: number;
  size?: number;
  label?: string;
}

export function CompatibilityRing({ value = 0.87, size = 80, label = "MATCH" }: CompatibilityRingProps) {
  const r = size / 2 - 6;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - value)}
          transform={`rotate(-90 ${c} ${c})`}
          style={{ filter: `drop-shadow(0 0 6px color-mix(in oklch, var(--accent), transparent 50%))` }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div className="t-num" style={{ fontSize: size * 0.28, color: "var(--fg)" }}>{Math.round(value * 100)}</div>
        <div className="t-tag" style={{ fontSize: 8 }}>{label}</div>
      </div>
    </div>
  );
}

// ============================================================
// SPARKLINE
// ============================================================
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  filled?: boolean;
}

export function Sparkline({ data, width = 140, height = 32, color = "var(--accent)", filled = true }: SparklineProps) {
  if (data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as [number, number];
  });
  const path = points.map((p, i) => (i === 0 ? `M${p[0]} ${p[1]}` : `L${p[0]} ${p[1]}`)).join(" ");
  const fill = filled ? `${path} L${width} ${height} L0 ${height} Z` : null;
  return (
    <svg width={width} height={height}>
      {fill && <path d={fill} fill={color} opacity="0.12" />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      {points.map((p, i) => {
        if (i !== points.length - 1) return null;
        return <circle key={i} cx={p[0]} cy={p[1]} r="2" fill={color} />;
      })}
    </svg>
  );
}

// ============================================================
// LIVE TIMECODE — ticks every second; client-only
// ============================================================
export function LiveTimecode({ format = "JD" }: { format?: "JD" | "UTC" }) {
  const [t, setT] = React.useState<Date | null>(null);
  React.useEffect(() => {
    setT(new Date());
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!t) return <span className="t-mono">{format === "JD" ? "JD —" : "— UTC"}</span>;
  if (format === "JD") {
    const jd = t.getTime() / 86400000 + 2440587.5;
    return <span className="t-mono">JD {jd.toFixed(5)}</span>;
  }
  return <span className="t-mono">{t.toISOString().split("T")[1].slice(0, 8)} UTC</span>;
}

// ============================================================
// SCAN LINE OVERLAY
// ============================================================
export function ScanLine() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        borderRadius: "inherit",
      }}
    >
      <div
        data-motion
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 2,
          background: "linear-gradient(90deg, transparent, color-mix(in oklch, var(--accent), transparent 40%), transparent)",
          animation: "scanLine 6s linear infinite",
          opacity: 0.5,
        }}
      />
    </div>
  );
}
