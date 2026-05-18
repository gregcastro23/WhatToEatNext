import type { JSX } from "react";

export interface ElementalValues {
  fire: number;
  water: number;
  earth: number;
  air: number;
}

export interface ElementalMeterProps {
  values?: ElementalValues;
  compact?: boolean;
  layout?: "bars" | "radial";
}

interface ElementRow {
  id: keyof ElementalValues;
  label: string;
  v: number;
  color: string;
}

const buildRows = (values: ElementalValues): ElementRow[] => [
  { id: "fire", label: "FIRE", v: values.fire, color: "var(--el-fire)" },
  { id: "water", label: "WATER", v: values.water, color: "var(--el-water)" },
  { id: "earth", label: "EARTH", v: values.earth, color: "var(--el-earth)" },
  { id: "air", label: "AIR", v: values.air, color: "var(--el-air)" },
];

export function ElementalMeter({
  values = { fire: 0.62, water: 0.28, earth: 0.71, air: 0.45 },
  compact = false,
  layout = "bars",
}: ElementalMeterProps): JSX.Element {
  const els = buildRows(values);

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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={`el-dot el-${el.id}`} />
              <span className="t-label" style={{ color: "var(--fg-dim)" }}>
                {el.label}
              </span>
            </div>
            <span
              className="t-num"
              style={{ fontSize: compact ? 11 : 13, color: "var(--fg)" }}
            >
              {(el.v * 100).toFixed(1)}
              <span style={{ color: "var(--fg-mute)" }}>%</span>
            </span>
          </div>
          <div
            style={{
              position: "relative",
              height: compact ? 4 : 6,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
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

export default ElementalMeter;
