import type { JSX } from "react";

export interface SensoryAxis {
  label: string;
  value: number; // 0..1
}

export interface SensoryRadarProps {
  axes: SensoryAxis[];
  size?: number;
}

export function SensoryRadar({ axes, size = 260 }: SensoryRadarProps): JSX.Element {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 28;
  const n = axes.length || 1;

  const pointAt = (i: number, v: number) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r * v, cy + Math.sin(a) * r * v] as const;
  };

  const polygon = `${axes
    .map((ax, i) => pointAt(i, Math.max(0, Math.min(1, ax.value))))
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`)
    .join(" ")  } Z`;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", overflow: "visible" }}
      aria-label="Sensory profile radar"
    >
      {/* concentric grid */}
      {[0.25, 0.5, 0.75, 1].map((g) => {
        const pts = axes
          .map((_, i) => pointAt(i, g))
          .map(([x, y]) => `${x},${y}`)
          .join(" ");
        return (
          <polygon
            key={g}
            points={pts}
            fill="none"
            stroke="var(--line)"
            strokeWidth={0.6}
            strokeDasharray={g === 1 ? "none" : "2 4"}
          />
        );
      })}

      {/* spokes + labels */}
      {axes.map((ax, i) => {
        const [ex, ey] = pointAt(i, 1);
        const [lx, ly] = pointAt(i, 1.18);
        return (
          <g key={ax.label}>
            <line
              x1={cx}
              y1={cy}
              x2={ex}
              y2={ey}
              stroke="var(--line)"
              strokeWidth={0.6}
            />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fontFamily="var(--f-mono)"
              fill="var(--fg-mute)"
              letterSpacing="0.14em"
              style={{ textTransform: "uppercase" }}
            >
              {ax.label}
            </text>
          </g>
        );
      })}

      <path d={polygon} fill="var(--accent)" opacity={0.18} />
      <path d={polygon} fill="none" stroke="var(--accent)" strokeWidth={1.4} />

      {axes.map((ax, i) => {
        const [px, py] = pointAt(i, Math.max(0, Math.min(1, ax.value)));
        return (
          <circle
            key={`pt-${ax.label}`}
            cx={px}
            cy={py}
            r={2.5}
            fill="var(--accent)"
            stroke="var(--bg)"
            strokeWidth={1}
          />
        );
      })}
    </svg>
  );
}

export default SensoryRadar;
