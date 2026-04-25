"use client";

/**
 * ElementalBalanceWheel
 *
 * Real-time visualization of the four-element balance (Fire, Water, Earth,
 * Air) across the food logged on a given day. Renders an SVG donut whose
 * slice arcs reflect each element's share, plus per-element badges that
 * surface deficits and excesses relative to a 25% balanced baseline.
 *
 * Drop-in: pass `balance` from `DailyFoodDiarySummary.elementalBalance`.
 *
 * @file src/components/food-diary/ElementalBalanceWheel.tsx
 */

import React, { useMemo } from "react";
import type { ElementalProperties } from "@/types/alchemy";

type ElementKey = "Fire" | "Water" | "Earth" | "Air";

interface ElementalBalanceWheelProps {
  balance: ElementalProperties | null | undefined;
  /** When true, render a compact inline variant */
  compact?: boolean;
}

const ELEMENT_STYLE: Record<
  ElementKey,
  { color: string; bg: string; badge: string; icon: string; label: string }
> = {
  Fire: {
    color: "#ef4444",
    bg: "bg-red-50",
    badge: "bg-red-100 text-red-700",
    icon: "🔥",
    label: "Fire",
  },
  Water: {
    color: "#3b82f6",
    bg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    icon: "💧",
    label: "Water",
  },
  Earth: {
    color: "#84cc16",
    bg: "bg-lime-50",
    badge: "bg-lime-100 text-lime-700",
    icon: "🌿",
    label: "Earth",
  },
  Air: {
    color: "#a855f7",
    bg: "bg-violet-50",
    badge: "bg-violet-100 text-violet-700",
    icon: "🌬️",
    label: "Air",
  },
};

const ELEMENTS: ElementKey[] = ["Fire", "Water", "Earth", "Air"];

/**
 * SVG donut arc helper: builds a `d` attribute for a ring segment.
 */
function buildArc(
  startAngle: number,
  endAngle: number,
  outerR: number,
  innerR: number,
  cx: number,
  cy: number,
): string {
  const polarToCartesian = (angle: number, r: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const p1 = polarToCartesian(startAngle, outerR);
  const p2 = polarToCartesian(endAngle, outerR);
  const p3 = polarToCartesian(endAngle, innerR);
  const p4 = polarToCartesian(startAngle, innerR);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${p1.x} ${p1.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
}

export default function ElementalBalanceWheel({
  balance,
  compact,
}: ElementalBalanceWheelProps) {
  const { shares, total, dominant, missing } = useMemo(() => {
    const raw: Record<ElementKey, number> = {
      Fire: balance?.Fire ?? 0,
      Water: balance?.Water ?? 0,
      Earth: balance?.Earth ?? 0,
      Air: balance?.Air ?? 0,
    };
    const sum = raw.Fire + raw.Water + raw.Earth + raw.Air;
    const s: Record<ElementKey, number> =
      sum === 0
        ? { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
        : {
            Fire: raw.Fire / sum,
            Water: raw.Water / sum,
            Earth: raw.Earth / sum,
            Air: raw.Air / sum,
          };

    const entries = (Object.entries(s) as Array<[ElementKey, number]>);
    const dom = entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    const miss = entries.reduce((a, b) => (a[1] < b[1] ? a : b))[0];

    return { shares: s, total: sum, dominant: dom, missing: miss };
  }, [balance]);

  const hasData = total > 0;
  const size = compact ? 96 : 160;
  const outerR = size / 2 - 6;
  const innerR = outerR - (compact ? 18 : 26);
  const cx = size / 2;
  const cy = size / 2;

  // Build arc data
  const arcs = useMemo(() => {
    let angle = 0;
    return ELEMENTS.map((el) => {
      const share = shares[el];
      const start = angle;
      const end = angle + share * 360;
      angle = end;
      return { el, start, end, share };
    });
  }, [shares]);

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="text-sm font-medium text-gray-700">
            Elemental Balance
          </h4>
          {!compact && (
            <p className="text-xs text-gray-500 mt-0.5">
              {hasData
                ? `Today's meal energies`
                : `Log a meal to see your balance`}
            </p>
          )}
        </div>
        {hasData && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ELEMENT_STYLE[dominant].badge}`}
            title="Dominant element today"
          >
            {ELEMENT_STYLE[dominant].icon} {dominant} lead
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Donut */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="flex-shrink-0"
          aria-label="Elemental balance donut chart"
          role="img"
        >
          {/* Background ring */}
          <circle
            cx={cx}
            cy={cy}
            r={(outerR + innerR) / 2}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={outerR - innerR}
          />
          {/* Arcs (only if we have data) */}
          {hasData &&
            arcs.map(({ el, start, end, share }) =>
              share > 0 ? (
                <path
                  key={el}
                  d={buildArc(start, end, outerR, innerR, cx, cy)}
                  fill={ELEMENT_STYLE[el].color}
                  opacity={0.85}
                />
              ) : null,
            )}
          {/* Center label */}
          <text
            x={cx}
            y={cy - (compact ? 0 : 4)}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-700"
            fontSize={compact ? 10 : 12}
            fontWeight={600}
          >
            {hasData ? `${Math.round(shares[dominant] * 100)}%` : "—"}
          </text>
          {!compact && hasData && (
            <text
              x={cx}
              y={cy + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-400"
              fontSize={10}
            >
              {dominant}
            </text>
          )}
        </svg>

        {/* Legend */}
        <div className="flex-1 grid grid-cols-2 gap-2">
          {ELEMENTS.map((el) => {
            const share = shares[el];
            const pct = Math.round(share * 100);
            const deficit = 0.25 - share;
            const highlight =
              hasData && (share > 0.5 || share < 0.1)
                ? el === dominant
                  ? "dominant"
                  : el === missing
                    ? "missing"
                    : undefined
                : undefined;
            return (
              <div
                key={el}
                className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                  highlight === "dominant"
                    ? ELEMENT_STYLE[el].bg + " ring-1 ring-inset ring-red-200/60"
                    : highlight === "missing"
                      ? "bg-gray-50 ring-1 ring-inset ring-gray-200"
                      : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: ELEMENT_STYLE[el].color }}
                  />
                  <span className="text-xs font-medium text-gray-700">
                    {ELEMENT_STYLE[el].icon} {el}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-gray-800">
                    {hasData ? `${pct}%` : "—"}
                  </span>
                  {hasData && deficit > 0.1 && (
                    <span
                      className="text-[10px] text-gray-400"
                      title={`${Math.round(deficit * 100)}% below balanced`}
                    >
                      ↓
                    </span>
                  )}
                  {hasData && share > 0.45 && (
                    <span
                      className="text-[10px] text-gray-400"
                      title={`${Math.round(share * 100) - 25}% above balanced`}
                    >
                      ↑
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {hasData && !compact && (
        <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
          <span>
            Balanced target: <span className="text-gray-700 font-medium">25% each</span>
          </span>
          <span>
            {shares[dominant] > 0.5
              ? `Consider adding more ${missing}.`
              : shares[missing] < 0.1
                ? `${missing} is running low today.`
                : `Nicely balanced.`}
          </span>
        </div>
      )}
    </div>
  );
}
