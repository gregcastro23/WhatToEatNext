"use client";

/**
 * WeekSummaryStrip — compact bottom telemetry strip.
 *
 * Provides at-a-glance weekly stats:
 *  - Planned meal count & progress
 *  - Elemental balance mini-bar (Fire, Water, Earth, Air)
 *  - Grocery budget vs estimated cost
 *  - Action button to open the full Nutrition Dashboard
 *
 * Replaces the heavy 12-column WeeklyInsights block and CircuitMetricsPanel.
 *
 * @file src/components/menu-planner/shell/WeekSummaryStrip.tsx
 */

import { BarChart3, ChevronRight } from "lucide-react";
import React from "react";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import type { ElementalProperties } from "@/types/recipe";
import { usePlannerUI } from "./PlannerUIContext";
import type { ElementName } from "../redesign/elementUtils";

const ELEMENTS: Array<{ key: ElementName; bar: string; label: string }> = [
  { key: "Fire", bar: "bg-fire-spirit", label: "Fire" },
  { key: "Water", bar: "bg-water-essence", label: "Water" },
  { key: "Earth", bar: "bg-earth-matter", label: "Earth" },
  { key: "Air", bar: "bg-air-substance", label: "Air" },
];

function balanceVerdict(
  dist: ElementalProperties | null | undefined,
  totalMeals: number,
): string {
  if (!dist || totalMeals === 0) return "Add meals for balance";
  const entries = ELEMENTS.map((e) => ({ key: e.key, v: dist[e.key] ?? 0 }));
  const max = entries.reduce((a, b) => (b.v > a.v ? b : a));
  const min = entries.reduce((a, b) => (b.v < a.v ? b : a));
  if (max.v - min.v <= 0.14) return "Balanced";
  return `${max.key}-rich`;
}

export default function WeekSummaryStrip(): React.ReactElement {
  const { currentMenu, weeklyStats, weeklyBudget, estimatedWeeklyCost } = useMenuPlanner();
  const { openModal, state } = usePlannerUI();

  const visibleSlots = currentMenu?.meals.filter((meal) => state.showSnacks || meal.mealType !== "snack") ?? [];
  const totalPlanned = visibleSlots.filter((meal) => meal.recipe).length;
  const totalSlots = visibleSlots.length;

  const dist = weeklyStats?.elementalDistribution ?? null;
  const verdict = balanceVerdict(dist, totalPlanned);

  const cost = Math.round(estimatedWeeklyCost ?? 0);
  const hasBudget = typeof weeklyBudget === "number" && weeklyBudget > 0;

  return (
    <div className="alchm-panel rounded-2xl border border-muted bg-surface-container-low/70 px-4 py-3 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
      {/* Planned Meals Count */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-active-violet font-bold text-sm">
          {totalPlanned}/{totalSlots}
        </span>
        <span className="text-on-surface-variant uppercase text-[10px] tracking-wider">
          Meals Planned
        </span>
      </div>

      {/* Elemental Balance Mini-Meter */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center justify-between text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
            <span>Elemental</span>
            <span className="text-primary font-semibold ml-2">{verdict}</span>
          </div>
          <div className="flex w-32 h-1.5 rounded-full overflow-hidden bg-surface-container-high">
            {ELEMENTS.map((e) => {
              const pct =
                dist && totalPlanned > 0
                  ? Math.max(2, Math.round((dist[e.key] ?? 0) * 100))
                  : 25;
              return (
                <div
                  key={e.key}
                  className={`${e.bar} h-full ${dist && totalPlanned > 0 ? "" : "opacity-30"}`}
                  style={{ width: `${pct}%` }}
                  title={`${e.label}: ${pct}%`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Budget / Cost Snapshot */}
      <div className="flex items-center gap-2">
        <span className="text-on-surface-variant uppercase text-[10px] tracking-wider">
          Est. Cost:
        </span>
        <span className="text-primary font-bold">
          ${cost}
          {hasBudget && (
            <span className="text-on-surface-variant/70 font-normal"> / ${weeklyBudget}</span>
          )}
        </span>
      </div>

      {/* Opener to Nutrition Dashboard */}
      <button
        type="button"
        onClick={() => openModal("nutrition")}
        aria-label="Nutrition Dashboard"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-muted bg-surface-container-high text-primary hover:border-active-violet hover:text-active-violet transition-colors text-xs font-semibold cursor-pointer"
      >
        <BarChart3 className="h-3.5 w-3.5" />
        <span>Nutrition Dashboard</span>
        <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}
