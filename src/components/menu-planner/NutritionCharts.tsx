"use client";

/**
 * The three small charts of the planner's Nutrition Dashboard, drawn on the
 * alchm dark surface. Their values come from the chart generators in
 * `src/utils/menuPlanner/nutritionalCalculator.ts`; nothing here computes one.
 *
 * @file src/components/menu-planner/NutritionCharts.tsx
 */

import React from "react";

export interface ChartDatum {
  label: string;
  value: number;
  /** The value as shown, when it carries a mark ("≥1311 kcal", "—"). */
  display?: string;
  color?: string;
}

/** active-violet, for a datum without a colour of its own. */
const FALLBACK_COLOR = "#B85AF0";
const PIE_RADIUS = 30;
const PIE_CIRCUMFERENCE = 2 * Math.PI * PIE_RADIUS;

interface PieSlice {
  datum: ChartDatum;
  length: number;
  start: number;
}

function pieSlices(data: readonly ChartDatum[]): PieSlice[] {
  const total = data.reduce((sum, datum) => sum + datum.value, 0);
  const slices: PieSlice[] = [];
  let start = 0;
  for (const datum of data) {
    const length = total > 0 ? (datum.value / total) * PIE_CIRCUMFERENCE : 0;
    slices.push({ datum, length, start });
    start += length;
  }
  return slices;
}

/** A donut of shares, with a legend giving each share in percent. */
export function PieChart({
  data,
  label,
}: {
  data: readonly ChartDatum[];
  label: string;
}): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <svg viewBox="0 0 100 100" className="w-40 h-40 -rotate-90" role="img" aria-label={label}>
        {pieSlices(data).map(({ datum, length, start }) => (
          <circle
            key={datum.label}
            cx="50"
            cy="50"
            r={PIE_RADIUS}
            fill="transparent"
            stroke={datum.color ?? FALLBACK_COLOR}
            strokeWidth="30"
            strokeDasharray={`${length} ${PIE_CIRCUMFERENCE}`}
            strokeDashoffset={-start}
          />
        ))}
      </svg>
      <ul className="space-y-2">
        {data.map((datum) => (
          <li key={datum.label} className="flex items-center gap-2 text-sm text-on-surface">
            <span
              aria-hidden="true"
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: datum.color ?? FALLBACK_COLOR }}
            />
            {datum.label}: <span className="font-mono">{datum.value.toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Horizontal bars scaled to the largest value; each row prints its value. */
export function BarChart({
  data,
  unit = "",
}: {
  data: readonly ChartDatum[];
  unit?: string;
}): React.JSX.Element {
  const max = Math.max(0, ...data.map((datum) => datum.value));
  return (
    <div className="space-y-3">
      {data.map((datum) => (
        <div key={datum.label} className="space-y-1">
          <div className="flex justify-between gap-2 text-sm">
            <span className="text-on-surface">{datum.label}</span>
            <span className="font-mono text-on-surface-variant text-right">
              {datum.display ?? `${Math.round(datum.value)}${unit}`}
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${max > 0 ? (datum.value / max) * 100 : 0}%`,
                backgroundColor: datum.color ?? FALLBACK_COLOR,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Room outside the 80-unit radius for the axis labels ("Water" is ~34 wide).
const RADAR_SIZE = 240;
const RADAR_CENTER = RADAR_SIZE / 2;
const RADAR_RADIUS = 80;
const RADAR_LEVELS = 5;

interface Point {
  x: number;
  y: number;
}

/** The point at `distance` from the centre along axis `index` of `count`. */
function radarPoint(index: number, count: number, distance: number): Point {
  const angle = (index * 2 * Math.PI) / count - Math.PI / 2;
  return {
    x: RADAR_CENTER + distance * Math.cos(angle),
    y: RADAR_CENTER + distance * Math.sin(angle),
  };
}

function polygonPath(points: readonly Point[]): string {
  return `${points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")} Z`;
}

function RadarGrid({ count }: { count: number }): React.JSX.Element {
  const axes = Array.from({ length: count }, (_, i) => i);
  return (
    <g className="stroke-on-surface-variant/25" fill="none" strokeWidth="1">
      {Array.from({ length: RADAR_LEVELS }, (_, level) => (
        <path
          key={level}
          d={polygonPath(
            axes.map((i) => radarPoint(i, count, ((level + 1) / RADAR_LEVELS) * RADAR_RADIUS)),
          )}
        />
      ))}
      {axes.map((i) => {
        const end = radarPoint(i, count, RADAR_RADIUS);
        return <line key={i} x1={RADAR_CENTER} y1={RADAR_CENTER} x2={end.x} y2={end.y} />;
      })}
    </g>
  );
}

/** One axis per datum; a datum's value (0–1) is its distance from the centre. */
export function RadarChart({
  data,
  label,
}: {
  data: readonly ChartDatum[];
  label: string;
}): React.JSX.Element {
  const points = data.map((datum, i) => radarPoint(i, data.length, datum.value * RADAR_RADIUS));
  return (
    <div className="flex justify-center">
      <svg
        width={RADAR_SIZE}
        height={RADAR_SIZE}
        viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
        role="img"
        aria-label={label}
      >
        <RadarGrid count={data.length} />
        <path d={polygonPath(points)} fill="rgba(184, 90, 240, 0.3)" stroke={FALLBACK_COLOR} strokeWidth="2" />
        {data.map((datum, i) => {
          const point = points[i] ?? radarPoint(i, data.length, 0);
          const labelAt = radarPoint(i, data.length, RADAR_RADIUS + 12);
          const fill = datum.color ?? FALLBACK_COLOR;
          return (
            <g key={datum.label}>
              <circle cx={point.x} cy={point.y} r="4" fill={fill} />
              <text x={labelAt.x} y={labelAt.y} textAnchor="middle" dominantBaseline="middle" className="text-xs font-medium" fill={fill}>
                {datum.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
