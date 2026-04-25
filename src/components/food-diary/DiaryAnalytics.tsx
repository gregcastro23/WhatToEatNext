"use client";

/**
 * DiaryAnalytics
 *
 * Advanced analytics views for the food diary — weekly macro trend line,
 * stacked elemental-balance-over-time, and a goal compliance heatmap.
 *
 * Consumes `WeeklyFoodDiarySummary` directly; no extra fetching.
 *
 * @file src/components/food-diary/DiaryAnalytics.tsx
 */

import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  DailyFoodDiarySummary,
  WeeklyFoodDiarySummary,
} from "@/types/foodDiary";
import type { NutritionalSummary } from "@/types/nutrition";

interface AnalyticsProps {
  weeklySummary: WeeklyFoodDiarySummary | null;
}

type DayRow = {
  label: string; // e.g. "Mon"
  dateLabel: string; // e.g. "Mar 6"
  day: DailyFoodDiarySummary;
};

const DAY_SHORT: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

/**
 * Normalize daily summaries into the row shape chart components expect.
 */
function buildDayRows(summary: WeeklyFoodDiarySummary): DayRow[] {
  return summary.dailySummaries.map((day) => {
    const d = new Date(day.date);
    return {
      label: DAY_SHORT[d.getDay()] ?? "",
      dateLabel: d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      day,
    };
  });
}

// ---------------------------------------------------------------------
// Weekly macro trend line chart
// ---------------------------------------------------------------------

function WeeklyTrendChart({ rows }: { rows: DayRow[] }) {
  const data = useMemo(
    () =>
      rows.map((r) => ({
        day: r.label,
        Calories: Math.round(r.day.totalNutrition?.calories ?? 0),
        Protein: Math.round(r.day.totalNutrition?.protein ?? 0),
        Fiber: Math.round(r.day.totalNutrition?.fiber ?? 0),
      })),
    [rows],
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-baseline justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">
          Macro Trends (Last 7 Days)
        </h4>
        <span className="text-[10px] text-gray-400">Cal · Protein (g) · Fiber (g)</span>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
              iconType="plainline"
            />
            <Line
              type="monotone"
              dataKey="Calories"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Protein"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Fiber"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Elemental balance stacked area over the week
// ---------------------------------------------------------------------

function ElementalTrendChart({ rows }: { rows: DayRow[] }) {
  const data = useMemo(
    () =>
      rows.map((r) => {
        const b = r.day.elementalBalance;
        const total = (b?.Fire ?? 0) + (b?.Water ?? 0) + (b?.Earth ?? 0) + (b?.Air ?? 0);
        // Normalize to percentages so bars stack predictably
        const scale = total === 0 ? 0 : 100 / total;
        return {
          day: r.label,
          Fire: Math.round((b?.Fire ?? 0) * scale * 10) / 10,
          Water: Math.round((b?.Water ?? 0) * scale * 10) / 10,
          Earth: Math.round((b?.Earth ?? 0) * scale * 10) / 10,
          Air: Math.round((b?.Air ?? 0) * scale * 10) / 10,
        };
      }),
    [rows],
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-baseline justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">
          Elemental Balance Over Time
        </h4>
        <span className="text-[10px] text-gray-400">% of daily elemental load</span>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              width={40}
              unit="%"
            />
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number) => `${value}%`}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
            <Area
              type="monotone"
              dataKey="Fire"
              stackId="1"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.75}
            />
            <Area
              type="monotone"
              dataKey="Water"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.75}
            />
            <Area
              type="monotone"
              dataKey="Earth"
              stackId="1"
              stroke="#84cc16"
              fill="#84cc16"
              fillOpacity={0.75}
            />
            <Area
              type="monotone"
              dataKey="Air"
              stackId="1"
              stroke="#a855f7"
              fill="#a855f7"
              fillOpacity={0.75}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Goal compliance heatmap (days × nutrients)
// ---------------------------------------------------------------------

type HeatNutrient = keyof Pick<
  NutritionalSummary,
  "calories" | "protein" | "carbs" | "fat" | "fiber"
>;
const HEATMAP_NUTRIENTS: Array<{ key: HeatNutrient; label: string }> = [
  { key: "calories", label: "Cal" },
  { key: "protein", label: "Protein" },
  { key: "carbs", label: "Carbs" },
  { key: "fat", label: "Fat" },
  { key: "fiber", label: "Fiber" },
];

/**
 * Map a 0-100+ compliance percentage into a Tailwind background class.
 * Green scale for on-target, amber for under, red for very under.
 */
function complianceColor(pct: number): string {
  if (pct >= 90 && pct <= 115) return "bg-emerald-500";
  if (pct >= 75 && pct < 90) return "bg-emerald-300";
  if (pct >= 50 && pct < 75) return "bg-amber-300";
  if (pct > 115 && pct <= 135) return "bg-amber-300";
  if (pct > 135) return "bg-red-400";
  if (pct > 0) return "bg-red-200";
  return "bg-gray-100";
}

function complianceText(pct: number): string {
  if (pct >= 90 && pct <= 115) return "text-white";
  if (pct >= 75) return "text-emerald-900";
  if (pct > 0) return "text-amber-900";
  return "text-gray-400";
}

function ComplianceHeatmap({ rows }: { rows: DayRow[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">
          Goal Compliance Heatmap
        </h4>
        <span className="text-[10px] text-gray-400">% of daily target</span>
      </div>

      <div
        className="grid gap-1 items-center"
        style={{
          gridTemplateColumns: `64px repeat(${rows.length}, minmax(0, 1fr))`,
        }}
      >
        {/* Header row: day labels */}
        <div />
        {rows.map((r, i) => (
          <div
            key={`h-${i}`}
            className="text-center text-[10px] font-medium text-gray-500"
            title={r.dateLabel}
          >
            {r.label}
          </div>
        ))}

        {/* Body rows */}
        {HEATMAP_NUTRIENTS.map(({ key, label }) => (
          <React.Fragment key={key}>
            <div className="text-[11px] font-medium text-gray-700 pr-2 truncate">
              {label}
            </div>
            {rows.map((r, i) => {
              const actual = r.day.totalNutrition?.[key] ?? 0;
              const target = r.day.nutritionGoals?.[key] ?? 0;
              const pct = target > 0 ? Math.round((actual / target) * 100) : 0;
              const hasEntry = r.day.entries.length > 0;
              return (
                <div
                  key={`c-${key}-${i}`}
                  className={`aspect-square rounded flex items-center justify-center text-[10px] font-semibold ${complianceColor(
                    hasEntry ? pct : 0,
                  )} ${complianceText(hasEntry ? pct : 0)}`}
                  title={
                    hasEntry
                      ? `${label} · ${Math.round(actual)} / ${target} (${pct}%)`
                      : "No entries logged"
                  }
                >
                  {hasEntry ? pct : "—"}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 mt-3 text-[10px] text-gray-500">
        <span>Under</span>
        <div className="flex gap-0.5">
          <span className="w-3 h-3 rounded-sm bg-red-200" />
          <span className="w-3 h-3 rounded-sm bg-amber-300" />
          <span className="w-3 h-3 rounded-sm bg-emerald-300" />
          <span className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span className="w-3 h-3 rounded-sm bg-amber-300" />
          <span className="w-3 h-3 rounded-sm bg-red-400" />
        </div>
        <span>Over</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Composite export
// ---------------------------------------------------------------------

export default function DiaryAnalytics({ weeklySummary }: AnalyticsProps) {
  if (!weeklySummary || weeklySummary.totalEntries === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Not enough data for trends yet.</p>
        <p className="text-xs text-gray-400 mt-1">
          Log a few days of meals to unlock analytics.
        </p>
      </div>
    );
  }

  const rows = buildDayRows(weeklySummary);

  return (
    <div className="space-y-4">
      <WeeklyTrendChart rows={rows} />
      <ElementalTrendChart rows={rows} />
      <ComplianceHeatmap rows={rows} />
    </div>
  );
}
