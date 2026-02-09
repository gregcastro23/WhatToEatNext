"use client";

/**
 * RecipeNutritionQuickView
 * At-a-glance nutrition display for recipe cards showing calories, macros, and key micronutrients.
 */

import React from "react";
import type { Recipe } from "@/types/recipe";

interface RecipeNutritionQuickViewProps {
  recipe: Recipe;
  servings?: number;
  showServingInfo?: boolean;
  onShowDetails?: () => void;
  compact?: boolean;
}

/** Thresholds for "good source" badges */
const GOOD_SOURCE_THRESHOLDS: Record<
  string,
  { min: number; label: string; icon: string }
> = {
  fiber: { min: 5, label: "Fiber", icon: "🌾" },
  vitaminC: { min: 15, label: "Vit C", icon: "🍊" },
  calcium: { min: 130, label: "Calcium", icon: "🦴" },
  iron: { min: 2, label: "Iron", icon: "🔩" },
  protein: { min: 20, label: "Protein", icon: "💪" },
};

function extractNutritionValues(recipe: Recipe, servings: number) {
  const n = recipe.nutrition;
  if (!n) return null;

  const calories = (n.calories ?? 0) * servings;
  const protein = (n.protein ?? 0) * servings;
  const carbs = (n.carbs ?? 0) * servings;
  const fat = (n.fat ?? 0) * servings;
  const fiber = (n.fiber ?? 0) * servings;

  const microValues: Record<string, number> = {};
    microValues.vitaminC = (n.vitaminC ?? 0) * servings;
    microValues.calcium = (n.calcium ?? 0) * servings;
    microValues.iron = (n.iron ?? 0) * servings;
  microValues.fiber = fiber;
  microValues.protein = protein;

  return { calories, protein, carbs, fat, fiber, microValues };
}

function getGoodSourceBadges(
  microValues: Record<string, number>,
): Array<{ label: string; icon: string }> {
  const badges: Array<{ label: string; icon: string }> = [];
  for (const [key, threshold] of Object.entries(GOOD_SOURCE_THRESHOLDS)) {
    const val = microValues[key] ?? 0;
    if (val >= threshold.min) {
      badges.push({ label: threshold.label, icon: threshold.icon });
    }
  }
  return badges;
}

export function RecipeNutritionQuickView({
  recipe,
  servings = 1,
  showServingInfo = false,
  onShowDetails,
  compact = false,
}: RecipeNutritionQuickViewProps) {
  const data = extractNutritionValues(recipe, servings);

  if (!data || data.calories === 0) {
    return (
      <div className="text-xs text-gray-400 italic">No nutrition data</div>
    );
  }

  const badges = getGoodSourceBadges(data.microValues);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-medium bg-amber-100 text-amber-800">
          {Math.round(data.calories)} cal
        </span>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono bg-red-50 text-red-700">
          P:{Math.round(data.protein)}g
        </span>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono bg-blue-50 text-blue-700">
          C:{Math.round(data.carbs)}g
        </span>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono bg-yellow-50 text-yellow-700">
          F:{Math.round(data.fat)}g
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {showServingInfo && servings > 1 && (
        <p className="text-xs text-gray-500">{servings} servings</p>
      )}

      {/* Calories + Macros */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          {Math.round(data.calories)} cal
        </span>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono bg-red-50 text-red-700">
          P:{Math.round(data.protein)}g
        </span>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono bg-blue-50 text-blue-700">
          C:{Math.round(data.carbs)}g
        </span>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono bg-yellow-50 text-yellow-700">
          F:{Math.round(data.fat)}g
        </span>
      </div>

      {/* Good Source Badges */}
      {badges.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {badges.map((b) => (
            <span
              key={b.label}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200"
              title={`Good source of ${b.label}`}
            >
              {b.icon} {b.label}
            </span>
          ))}
        </div>
      )}

      {/* Show Details button */}
      {onShowDetails && (
        <button
          onClick={onShowDetails}
          className="text-xs text-amber-700 hover:text-amber-900 hover:underline transition-colors"
        >
          Nutrition details →
        </button>
      )}
    </div>
  );
}
