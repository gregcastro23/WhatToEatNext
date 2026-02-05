"use client";

/**
 * SmartRecommendations
 * Suggests recipes to fill nutritional gaps detected in the weekly menu.
 * Collapsible panel that appears when deficiencies are detected.
 */

import React, { useState, useMemo } from "react";
import type { Recipe } from "@/types/recipe";
import type {
  WeeklyNutritionResult,
  NutritionalSummary,
} from "@/types/nutrition";
import { formatNutrientName } from "@/utils/nutritionAggregation";
import { RecipeNutritionQuickView } from "./RecipeNutritionQuickView";

interface SmartRecommendationsProps {
  availableRecipes: Recipe[];
  onAddToMenu?: (recipe: Recipe) => void;
  maxRecommendations?: number;
}

interface RecommendationCard {
  recipe: Recipe;
  reason: string;
  complianceImprovement: number;
  nutrientBoosts: Array<{ nutrient: string; amount: number; fillPct: number }>;
}

export function SmartRecommendations({
  availableRecipes,
  onAddToMenu,
  maxRecommendations = 5,
}: SmartRecommendationsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const recommendations = useMemo(() => {
    // Placeholder for new recommendation logic
    return [];
  }, [availableRecipes, maxRecommendations]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <h3 className="text-sm font-bold text-green-800">
            Fill the Gap ({recommendations.length} suggestions)
          </h3>
        </div>
        <span className="text-xs text-green-600">{isExpanded ? "▲" : "▼"}</span>
      </button>

      {/* Recommendations */}
      {isExpanded && (
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div
              key={rec.recipe.id}
              className="bg-white rounded-lg border border-green-100 p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-800 truncate">
                    {rec.recipe.name}
                  </h4>
                  <p className="text-xs text-green-700">{rec.reason}</p>
                </div>
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  +{rec.complianceImprovement} pts
                </span>
              </div>

              {/* Nutrient boosts */}
              <div className="space-y-1 mb-2">
                {rec.nutrientBoosts.map((boost) => (
                  <div key={boost.nutrient} className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-20 shrink-0 truncate">
                      {boost.nutrient}
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-400 rounded-full"
                        style={{ width: `${Math.min(100, boost.fillPct)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-gray-500 w-8 text-right">
                      {boost.fillPct}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick nutrition view */}
              <RecipeNutritionQuickView recipe={rec.recipe} compact />

              {/* Add to menu button */}
              {onAddToMenu && (
                <button
                  onClick={() => onAddToMenu(rec.recipe)}
                  className="mt-2 w-full text-xs font-medium py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  + Add to Menu
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
