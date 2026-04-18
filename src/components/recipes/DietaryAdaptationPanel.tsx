"use client";

import React, { useMemo } from "react";
import type { Recipe } from "@/types/recipe";
import {
  adaptRecipe,
  isAlreadyCompatible,
  needsAdaptation,
  type AdaptationResult,
  type DietaryMode,
} from "@/utils/dietaryAdaptation";

const MODES: Array<{ key: DietaryMode; label: string; icon: string }> = [
  { key: "vegan", label: "Vegan", icon: "\u{1F33F}" },
  { key: "vegetarian", label: "Vegetarian", icon: "\u{1F957}" },
  { key: "gluten-free", label: "Gluten-Free", icon: "\u{1F33E}" },
  { key: "dairy-free", label: "Dairy-Free", icon: "\u{1F95B}" },
  { key: "keto", label: "Keto", icon: "\u{1F951}" },
  { key: "low-carb", label: "Low-Carb", icon: "\u{1F366}" },
];

interface Props {
  recipe: Recipe;
  activeMode: DietaryMode | null;
  onModeChange: (mode: DietaryMode | null) => void;
}

function formatDelta(n: number, unit = "", digits = 0): string {
  if (n === 0) return `0${unit}`;
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}${unit}`;
}

export function DietaryAdaptationPanel({ recipe, activeMode, onModeChange }: Props) {
  const adaptation: AdaptationResult | null = useMemo(() => {
    if (!activeMode) return null;
    return adaptRecipe(recipe, activeMode);
  }, [recipe, activeMode]);

  return (
    <div className="glass-card-premium rounded-2xl border border-white/8 p-5 md:p-6">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-300 flex items-center gap-2">
            <span className="not-italic text-xl">{"\u{1F504}"}</span>
            Adapt This Recipe
          </h2>
          <p className="text-xs text-white/60 mt-1">
            One-click swap-outs. Original is never overwritten.
          </p>
        </div>
        {activeMode && (
          <button
            type="button"
            onClick={() => onModeChange(null)}
            className="text-xs text-amber-300 hover:text-amber-200 underline decoration-dotted underline-offset-4"
          >
            Reset to original
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {MODES.map(({ key, label, icon }) => {
          const compatible = isAlreadyCompatible(recipe, key);
          const wouldSwap = !compatible && needsAdaptation(recipe, key);
          const isActive = activeMode === key;
          const disabled = compatible;

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onModeChange(isActive ? null : key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1.5 ${
                disabled
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 cursor-default"
                  : isActive
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-200"
                    : wouldSwap
                      ? "bg-white/5 border-white/10 text-white/80 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-200"
                      : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
              }`}
              title={
                disabled
                  ? `Already ${label.toLowerCase()}-compatible`
                  : wouldSwap
                    ? `Adapt to ${label.toLowerCase()}`
                    : `No swap rules triggered for ${label.toLowerCase()}`
              }
            >
              <span className="not-italic">{icon}</span>
              {label}
              {disabled && <span className="ml-0.5 text-emerald-300">&#x2713;</span>}
            </button>
          );
        })}
      </div>

      {adaptation && (
        <AdaptationBanner adaptation={adaptation} />
      )}
    </div>
  );
}

function AdaptationBanner({ adaptation }: { adaptation: AdaptationResult }) {
  const { mode, swaps, nutritionalDelta, elementalDelta, compatible } = adaptation;

  if (compatible) {
    return (
      <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300">
        Recipe is already {mode}-compatible. No swaps needed.
      </div>
    );
  }

  if (swaps.length === 0) {
    return (
      <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white/60">
        No ingredients matched {mode} swap rules. Review the full ingredient list for manual adjustments.
      </div>
    );
  }

  const nutritionChips: Array<{ label: string; value: string; cls: string }> = [];
  if (nutritionalDelta.calories != null && nutritionalDelta.calories !== 0) {
    nutritionChips.push({
      label: "cal",
      value: formatDelta(nutritionalDelta.calories),
      cls: nutritionalDelta.calories < 0 ? "text-emerald-300" : "text-orange-300",
    });
  }
  if (nutritionalDelta.protein != null && nutritionalDelta.protein !== 0) {
    nutritionChips.push({ label: "protein", value: formatDelta(nutritionalDelta.protein, "g"), cls: "text-sky-300" });
  }
  if (nutritionalDelta.carbs != null && nutritionalDelta.carbs !== 0) {
    nutritionChips.push({ label: "carbs", value: formatDelta(nutritionalDelta.carbs, "g"), cls: "text-amber-300" });
  }
  if (nutritionalDelta.fat != null && nutritionalDelta.fat !== 0) {
    nutritionChips.push({ label: "fat", value: formatDelta(nutritionalDelta.fat, "g"), cls: "text-rose-300" });
  }

  const elementalChips: Array<{ el: string; value: string; cls: string }> = [];
  (["Fire", "Water", "Earth", "Air"] as const).forEach((el) => {
    const v = elementalDelta[el];
    if (Math.abs(v) >= 0.005) {
      elementalChips.push({
        el,
        value: formatDelta(v, "", 2),
        cls: el === "Fire" ? "text-red-300" : el === "Water" ? "text-blue-300" : el === "Earth" ? "text-amber-300" : "text-sky-300",
      });
    }
  });

  return (
    <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="text-amber-200 font-semibold">
          Adapted for {mode} &middot; {swaps.length} swap{swaps.length === 1 ? "" : "s"}
        </span>
        {nutritionChips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {nutritionChips.map((c) => (
              <span key={c.label} className={`text-xs ${c.cls}`}>
                {c.value} {c.label}
              </span>
            ))}
          </div>
        )}
        {elementalChips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {elementalChips.map((c) => (
              <span key={c.el} className={`text-xs ${c.cls}`}>
                {c.el} {c.value}
              </span>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-white/50 mt-1.5 italic">
        Deltas are estimates. ESMS/planetary scores reflect the original recipe.
      </p>
    </div>
  );
}
