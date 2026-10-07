"use client";

/**
 * The score breakdown under a recipe dossier: day alignment, planetary
 * alignment, the natal-chart boost (when personalized), and the recipe's
 * Monica constant (when it carries one).
 *
 * @file src/components/recipe-builder/carousel/ScoreTelemetry.tsx
 */

import React from "react";
import type { RecommendedMeal } from "@/utils/menuPlanner/recommendationBridge";

type StatTone = "indigo" | "purple" | "pink" | "amber";

const STAT_TONE: Record<StatTone, { box: string; value: string }> = {
  indigo: { box: "border-indigo-500/20 bg-indigo-500/10", value: "text-indigo-300" },
  purple: { box: "border-purple-500/20 bg-purple-500/10", value: "text-purple-300" },
  pink: { box: "border-pink-500/20 bg-pink-500/10", value: "text-pink-300" },
  amber: { box: "border-amber-500/20 bg-amber-500/10", value: "text-amber-300" },
};

function Stat({ value, label, tone }: { value: string; label: string; tone: StatTone }): React.JSX.Element {
  return (
    <div className={`px-2.5 py-1 rounded-xl border text-center font-mono ${STAT_TONE[tone].box}`}>
      <div className={`text-xs font-semibold ${STAT_TONE[tone].value}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

const asPercent = (fraction: number): string => `${Math.round(fraction * 100)}%`;

/** A multiplier (1.12) → its signed change ("+12%"). */
export function formatBoost(multiplier: number): string {
  const change = Math.round((multiplier - 1) * 100);
  return change > 0 ? `+${change}%` : `${change}%`;
}

export default function ScoreTelemetry({ meal }: { meal: RecommendedMeal }): React.JSX.Element {
  const monica = meal.recipe.alchemicalProperties?.monicaConstant;
  return (
    <div className="px-5 pb-3 flex flex-wrap gap-2">
      <Stat value={asPercent(meal.dayAlignment)} label="Day align" tone="indigo" />
      <Stat value={asPercent(meal.planetaryAlignment)} label="Planetary" tone="purple" />
      {meal.personalizationBoost !== undefined && (
        <Stat value={formatBoost(meal.personalizationBoost)} label="Chart boost" tone="pink" />
      )}
      {typeof monica === "number" && Number.isFinite(monica) && (
        <Stat value={monica.toFixed(2)} label="Monica" tone="amber" />
      )}
    </div>
  );
}
