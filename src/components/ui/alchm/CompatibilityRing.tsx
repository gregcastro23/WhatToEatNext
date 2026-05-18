import type { JSX } from "react";

export interface CompatibilityRingProps {
  value?: number;
  size?: number;
  label?: string;
}

export function CompatibilityRing({
  value = 0.87,
  size = 80,
  label = "MATCH",
}: CompatibilityRingProps): JSX.Element {
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
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="t-num" style={{ fontSize: size * 0.28, color: "var(--fg)" }}>
          {Math.round(value * 100)}
        </div>
        <div className="t-tag" style={{ fontSize: 8 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export default CompatibilityRing;
