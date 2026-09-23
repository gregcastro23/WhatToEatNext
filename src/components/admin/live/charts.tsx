"use client";

/**
 * Small, dependency-free charts for the live admin pages.
 *
 * Mark specs (dataviz method): columns ≤24px wide with a 4px rounded data end
 * and a square baseline, 2px surface gaps, recessive axes, a per-mark hover
 * tooltip whose hit target is the whole column slot, and a visually hidden
 * table so every value is also available as text. Single-series charts carry
 * no legend — the panel title names the series. Sequential colour is one hue,
 * light → dark.
 *
 * @file src/components/admin/live/charts.tsx
 */

import React, { useState } from "react";

/** Categorical slot 1 (light surface) of the validated reference palette. */
export const SERIES_1 = "#2a78d6";

export interface Column {
  key: string;
  label: string;
  value: number;
  /** Extra tooltip text, e.g. which jobs make up the column. */
  detail?: string;
}

interface ColumnChartProps {
  columns: Column[];
  format: (n: number) => string;
  ariaLabel: string;
  height?: number;
}

function ColumnSlot(props: {
  column: Column;
  max: number;
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
}): React.JSX.Element {
  const { column, max, active, onEnter, onLeave } = props;
  const pct = max > 0 ? (column.value / max) * 100 : 0;
  return (
    <button
      type="button"
      aria-label={`${column.label}: ${column.value}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      className="flex-1 h-full flex items-end justify-center min-w-0 focus:outline-none"
    >
      <span
        className="block w-full rounded-t-[4px] transition-opacity"
        style={{ height: `${pct}%`, maxWidth: 24, background: SERIES_1, opacity: active ? 1 : 0.85 }}
      />
    </button>
  );
}

function AxisLabels({ columns }: { columns: Column[] }): React.JSX.Element {
  const [first] = columns;
  const last = columns.at(-1);
  const mid = columns[Math.floor(columns.length / 2)];
  return (
    <div className="flex justify-between mt-1 text-[10px] font-mono text-gray-400">
      <span>{first?.label ?? ""}</span>
      <span>{columns.length > 4 ? (mid?.label ?? "") : ""}</span>
      <span>{last?.label ?? ""}</span>
    </div>
  );
}

function HiddenTable({ columns, format, caption }: { columns: Column[]; format: (n: number) => string; caption: string }): React.JSX.Element {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <tbody>
        {columns.map((c) => (
          <tr key={c.key}>
            <th scope="row">{c.label}</th>
            <td>
              {format(c.value)}
              {c.detail ? ` — ${c.detail}` : ""}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Centre the tooltip over its column, but keep edge columns' tooltips inside the panel. */
function tooltipShift(index: number, count: number): string {
  const fraction = (index + 0.5) / count;
  if (fraction < 0.15) return "-translate-x-[10%]";
  return fraction > 0.85 ? "-translate-x-[90%]" : "-translate-x-1/2";
}

export function ColumnChart({ columns, format, ariaLabel, height = 140 }: ColumnChartProps): React.JSX.Element {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(0, ...columns.map((c) => c.value));
  const hovered = hover === null ? undefined : columns[hover];
  return (
    <figure aria-label={ariaLabel} className="m-0">
      <div className="relative" style={{ height }}>
        <span className="absolute -top-1 left-0 text-[10px] font-mono text-gray-400">{format(max)}</span>
        <div className="absolute inset-x-0 top-3 border-t border-dashed border-gray-200" aria-hidden="true" />
        <div className="absolute inset-x-0 top-3 bottom-0 flex items-end gap-[2px] border-b border-gray-300">
          {columns.map((c, i) => (
            <ColumnSlot
              key={c.key}
              column={c}
              max={max}
              active={hover === i}
              onEnter={(): void => setHover(i)}
              onLeave={(): void => setHover(null)}
            />
          ))}
        </div>
        {hovered && hover !== null && (
          <div
            className={`pointer-events-none absolute -top-8 z-10 ${tooltipShift(hover, columns.length)} whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white shadow`}
            style={{ left: `${((hover + 0.5) / columns.length) * 100}%` }}
          >
            <span className="text-gray-300">{hovered.label}</span> · <span className="font-semibold">{format(hovered.value)}</span>
            {hovered.detail && <span className="text-gray-300"> · {hovered.detail}</span>}
          </div>
        )}
      </div>
      <AxisLabels columns={columns} />
      <HiddenTable columns={columns} format={format} caption={ariaLabel} />
    </figure>
  );
}

export interface BarRow {
  label: string;
  value: number;
  hint?: string;
}

/** Ranked horizontal bars: label on the bar, value in text ink on the right. */
export function BarList({ rows, format, empty }: { rows: BarRow[]; format: (n: number) => string; empty: string }): React.JSX.Element {
  if (rows.length === 0) return <p className="text-xs text-gray-500 py-2">{empty}</p>;
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-1">
      {rows.map((r) => (
        <li key={r.label} className="flex items-center gap-3 text-xs" title={r.hint ?? r.label}>
          <div className="relative flex-1 min-w-0 h-6 rounded bg-gray-50">
            <div
              className="absolute inset-y-0 left-0 rounded"
              style={{ width: `${(r.value / max) * 100}%`, background: "rgba(42,120,214,0.16)" }}
            />
            <span className="relative block truncate px-2 leading-6 text-gray-800">{r.label}</span>
          </div>
          <span className="w-16 text-right font-mono text-gray-700">{format(r.value)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Single-hue sequential fill: 0 → near-white, 1 → full series colour. */
export function sequentialFill(fraction: number): string {
  const pct = Math.round(Math.min(1, Math.max(0, fraction)) * 88 + 6);
  return `color-mix(in srgb, ${SERIES_1} ${pct}%, #ffffff)`;
}
