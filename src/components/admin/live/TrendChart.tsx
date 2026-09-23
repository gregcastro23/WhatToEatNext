"use client";

/**
 * Single-series line chart for change over time (e.g. lint debt per commit).
 *
 * 2px line, 8px end/hover markers with a 2px surface ring, crosshair +
 * tooltip on hover with a hit target the full width of each step, and a
 * visually hidden table. The y-axis spans min→max of the data (labelled),
 * because the question is "which way is it moving", not "how big is it".
 *
 * @file src/components/admin/live/TrendChart.tsx
 */

import React, { useState } from "react";
import { SERIES_1 } from "@/components/admin/live/charts";

export interface TrendPoint {
  key: string;
  label: string;
  value: number;
  detail?: string;
}

interface TrendChartProps {
  points: TrendPoint[];
  format: (n: number) => string;
  ariaLabel: string;
  height?: number;
}

const W = 600;
const PAD_X = 8;
const PAD_Y = 12;

function project(points: TrendPoint[], height: number): Array<{ x: number; y: number }> {
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const span = Math.max(1, Math.max(...values) - min);
  const step = points.length > 1 ? (W - PAD_X * 2) / (points.length - 1) : 0;
  return points.map((p, i) => ({
    x: PAD_X + i * step,
    y: PAD_Y + (1 - (p.value - min) / span) * (height - PAD_Y * 2),
  }));
}

function Tooltip({ point, leftPct }: { point: TrendPoint; leftPct: number }): React.JSX.Element {
  return (
    <div
      className="pointer-events-none absolute -top-10 z-10 max-w-[260px] -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white shadow"
      style={{ left: `${Math.min(88, Math.max(12, leftPct))}%` }}
    >
      <div className="font-semibold">{point.label}</div>
      {point.detail && <div className="truncate text-gray-300">{point.detail}</div>}
    </div>
  );
}

function HitTargets(props: { count: number; height: number; onHover: (i: number | null) => void }): React.JSX.Element {
  const { count, height, onHover } = props;
  const slot = count > 1 ? (W - PAD_X * 2) / (count - 1) : W;
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <rect
          key={i}
          x={PAD_X + i * slot - slot / 2}
          y={0}
          width={slot}
          height={height}
          fill="transparent"
          onMouseEnter={(): void => onHover(i)}
          onMouseLeave={(): void => onHover(null)}
        />
      ))}
    </g>
  );
}

export function TrendChart({ points, format, ariaLabel, height = 160 }: TrendChartProps): React.JSX.Element {
  const [hover, setHover] = useState<number | null>(null);
  if (points.length === 0) return <p className="text-xs text-gray-500">No points to plot yet.</p>;
  const xy = project(points, height);
  const active = hover === null ? xy.at(-1) : xy[hover];
  const activePoint = hover === null ? points.at(-1) : points[hover];
  const values = points.map((p) => p.value);
  return (
    <figure aria-label={ariaLabel} className="relative m-0">
      <div className="flex justify-between text-[10px] font-mono text-gray-400">
        <span>max {format(Math.max(...values))}</span>
        <span>min {format(Math.min(...values))}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label={ariaLabel}>
        <line x1={0} x2={W} y1={height - 1} y2={height - 1} stroke="#d1d5db" strokeWidth={1} />
        <polyline points={xy.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={SERIES_1} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null && active && <line x1={active.x} x2={active.x} y1={0} y2={height} stroke="#9ca3af" strokeDasharray="3 3" />}
        {active && <circle cx={active.x} cy={active.y} r={4} fill={SERIES_1} stroke="#ffffff" strokeWidth={2} />}
        <HitTargets count={points.length} height={height} onHover={setHover} />
      </svg>
      {hover !== null && activePoint && active && (
        <Tooltip point={{ ...activePoint, label: `${activePoint.label} · ${format(activePoint.value)}` }} leftPct={(active.x / W) * 100} />
      )}
      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <tbody>
          {points.map((p) => (
            <tr key={p.key}>
              <th scope="row">{p.label}</th>
              <td>{format(p.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
