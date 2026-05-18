import type { JSX } from "react";

export interface SeasonalityChartProps {
  /** 12 monthly values 0-1 (Jan..Dec) */
  yields: number[];
  /** Optional 0-11 index of the active month for marker */
  activeMonth?: number;
  width?: number;
  height?: number;
}

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function SeasonalityChart({
  yields,
  activeMonth,
  width = 520,
  height = 120,
}: SeasonalityChartProps): JSX.Element {
  const data = yields.length === 12 ? yields : Array.from({ length: 12 }, () => 0);
  const pad = { l: 24, r: 12, t: 12, b: 22 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const xAt = (i: number) => pad.l + (i / 11) * innerW;
  const yAt = (v: number) => pad.t + (1 - Math.max(0, Math.min(1, v))) * innerH;

  const linePath = data
    .map((v, i) => `${i === 0 ? "M" : "L"}${xAt(i)} ${yAt(v)}`)
    .join(" ");
  const areaPath = `${linePath} L${xAt(11)} ${pad.t + innerH} L${xAt(0)} ${pad.t + innerH} Z`;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block", overflow: "visible" }}
      aria-label="12-month seasonality yield curve"
    >
      {/* horizontal rules */}
      {[0, 0.5, 1].map((g) => (
        <line
          key={g}
          x1={pad.l}
          x2={pad.l + innerW}
          y1={yAt(g)}
          y2={yAt(g)}
          stroke="var(--line)"
          strokeDasharray={g === 0 || g === 1 ? "none" : "2 4"}
          strokeWidth={0.75}
        />
      ))}

      <path d={areaPath} fill="var(--accent)" opacity={0.1} />
      <path
        d={linePath}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {data.map((v, i) => (
        <circle
          key={i}
          cx={xAt(i)}
          cy={yAt(v)}
          r={i === activeMonth ? 3.5 : 2}
          fill={i === activeMonth ? "var(--accent)" : "var(--bg)"}
          stroke="var(--accent)"
          strokeWidth={1.2}
        />
      ))}

      {MONTHS.map((m, i) => (
        <text
          key={i}
          x={xAt(i)}
          y={height - 6}
          textAnchor="middle"
          fontSize={9}
          fontFamily="var(--f-mono)"
          fill={i === activeMonth ? "var(--accent)" : "var(--fg-mute)"}
          letterSpacing="0.14em"
        >
          {m}
        </text>
      ))}

      <text
        x={pad.l - 6}
        y={yAt(1) + 3}
        textAnchor="end"
        fontSize={8}
        fontFamily="var(--f-mono)"
        fill="var(--fg-faint)"
      >
        1.0
      </text>
      <text
        x={pad.l - 6}
        y={yAt(0) + 3}
        textAnchor="end"
        fontSize={8}
        fontFamily="var(--f-mono)"
        fill="var(--fg-faint)"
      >
        0.0
      </text>
    </svg>
  );
}

export default SeasonalityChart;
