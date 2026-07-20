"use client";

/**
 * WeeklyInsights — the single insights rail for the redesigned planner.
 * Modules (in order): weekly elemental balance meter (the signature metric),
 * budget vs. estimated cost, and variety / missing-meals with smart
 * suggestion chips. All values come from live MenuPlanner state; nothing is
 * fabricated — modules degrade to honest empty copy when there's no data yet.
 *
 * @file src/components/menu-planner/redesign/WeeklyInsights.tsx
 */

import { useMemo } from "react";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import type { ElementName } from "./elementUtils";

const ELEMENTS: Array<{ key: ElementName; bar: string; label: string }> = [
  { key: "Fire", bar: "bg-fire-spirit", label: "Fire" },
  { key: "Water", bar: "bg-water-essence", label: "Water" },
  { key: "Earth", bar: "bg-earth-matter", label: "Earth" },
  { key: "Air", bar: "bg-air-substance", label: "Air" },
];

function balanceVerdict(
  dist: Record<ElementName, number> | null,
  totalMeals: number,
): string {
  if (!dist || totalMeals === 0) return "Plan meals to see balance";
  const entries = ELEMENTS.map((e) => ({ key: e.key, v: dist[e.key] ?? 0 }));
  const max = entries.reduce((a, b) => (b.v > a.v ? b : a));
  const min = entries.reduce((a, b) => (b.v < a.v ? b : a));
  // Even distribution ≈ 0.25 each. Flag if the spread is wide.
  if (max.v - min.v <= 0.14) return "Balanced week";
  return `A little ${max.key.toLowerCase()}-heavy`;
}

export default function WeeklyInsights() {
  const {
    weeklyStats,
    weeklyBudget,
    estimatedWeeklyCost,
    getSuggestions,
  } = useMenuPlanner();

  const dist =
    (weeklyStats?.elementalDistribution as Record<ElementName, number> | null) ??
    null;
  const totalMeals = weeklyStats?.totalMeals ?? 0;
  const totalRecipes = weeklyStats?.totalRecipes ?? 0;
  const emptySlots = weeklyStats?.missingMeals?.length ?? 0;

  const verdict = balanceVerdict(dist, totalMeals);

  const suggestions = useMemo(
    () => getSuggestions().slice(0, 2),
    [getSuggestions],
  );

  const cost = Math.round(estimatedWeeklyCost ?? 0);
  const hasBudget = typeof weeklyBudget === "number" && weeklyBudget > 0;
  const budgetPct = hasBudget
    ? Math.min(100, Math.round((cost / (weeklyBudget)) * 100))
    : 0;

  return (
    <section className="alchm-panel rounded-xl p-4 space-y-5">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">
        Week Insights
      </h3>

      {/* Elemental balance — the signature metric */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
            Elemental Balance
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
            {verdict}
          </span>
        </div>
        <div className="flex w-full h-1.5 rounded-full overflow-hidden bg-surface-container-high">
          {ELEMENTS.map((e) => {
            const pct =
              dist && totalMeals > 0
                ? Math.max(2, Math.round((dist[e.key] ?? 0) * 100))
                : 25;
            return (
              <div
                key={e.key}
                className={`${e.bar} h-full ${dist && totalMeals > 0 ? "" : "opacity-30"}`}
                style={{ width: `${pct}%` }}
                title={`${e.label}: ${dist ? Math.round((dist[e.key] ?? 0) * 100) : 0}%`}
              />
            );
          })}
        </div>
      </div>

      {/* Budget */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
            Budget
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
            {hasBudget
              ? `$${cost} / $${Math.round(weeklyBudget)} this week`
              : `$${cost} est. this week`}
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
          <div
            className={`h-full ${budgetPct > 100 || (hasBudget && cost > (weeklyBudget)) ? "bg-error" : "bg-gold-accent"}`}
            style={{ width: `${hasBudget ? budgetPct : cost > 0 ? 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Variety & suggestions */}
      <div className="pt-1 border-t border-on-surface/5">
        <p className="font-mono text-[10px] uppercase tracking-wide text-on-surface-variant/70 text-center mb-3">
          {emptySlots} slot{emptySlots === 1 ? "" : "s"} empty ·{" "}
          {totalRecipes} recipe{totalRecipes === 1 ? "" : "s"} planned
        </p>
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((s, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full border border-active-violet/20 bg-active-violet/5 text-active-violet font-mono text-[10px] uppercase tracking-wide flex items-center gap-1"
                title={s.reason}
              >
                <span className="text-[9px]">✦</span>
                <span className="max-w-[10rem] truncate">{s.reason}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
