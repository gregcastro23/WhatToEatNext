"use client";

/**
 * Smart Suggestions Sidebar
 * Provides real-time nutritional alerts, variety tips, planetary timing,
 * and progress tracking as users build their weekly menu.
 *
 * @file src/components/menu-builder/SmartSuggestionsSidebar.tsx
 * @created 2026-01-28
 */

import React, { useMemo, useState } from "react";
import type { WeeklyMenu, MealSlot } from "@/types/menuPlanner";
import type { WeeklyNutritionResult } from "@/types/nutrition";
import type { Recipe } from "@/types/recipe";

/** A single suggestion generated from current menu state */
export interface Suggestion {
  id: string;
  type: "nutritional" | "variety" | "planetary" | "progress";
  severity: "info" | "warning" | "critical";
  icon: string;
  title: string;
  message: string;
  actionable?: boolean;
  recipes?: Recipe[];
  autoApply?: () => void;
}

export interface ApplicableSuggestion {
  suggestion: Suggestion;
  recipe?: Recipe;
}

interface SmartSuggestionsSidebarProps {
  weekPlan: WeeklyMenu | null;
  weeklyNutrition: WeeklyNutritionResult | null;
  onApplySuggestion?: (suggestion: ApplicableSuggestion) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

/** Count meals that have a recipe assigned */
function countPlannedMeals(weekPlan: WeeklyMenu | null): number {
  if (!weekPlan) return 0;
  return weekPlan.meals.filter((m) => m.recipe).length;
}

/** Extract all ingredient names from the week plan */
function extractAllIngredients(weekPlan: WeeklyMenu | null): string[] {
  if (!weekPlan) return [];
  return weekPlan.meals
    .filter((m) => m.recipe)
    .flatMap((m) =>
      (m.recipe!.ingredients || []).map((ing) => ing.name.toLowerCase())
    );
}

/** Count how often each recipe appears */
function countRecipeFrequency(
  weekPlan: WeeklyMenu | null
): Record<string, number> {
  if (!weekPlan) return {};
  const counts: Record<string, number> = {};
  weekPlan.meals
    .filter((m) => m.recipe)
    .forEach((m) => {
      const id = m.recipe!.id;
      counts[id] = (counts[id] || 0) + 1;
    });
  return counts;
}

/** Count unique cuisines used */
function countUniqueCuisines(weekPlan: WeeklyMenu | null): number {
  if (!weekPlan) return 0;
  const cuisines = new Set(
    weekPlan.meals
      .filter((m) => m.recipe?.cuisine)
      .map((m) => m.recipe!.cuisine!.toLowerCase())
  );
  return cuisines.size;
}

export default function SmartSuggestionsSidebar({
  weekPlan,
  weeklyNutrition,
  onApplySuggestion,
  isCollapsed = false,
  onToggleCollapse,
}: SmartSuggestionsSidebarProps) {
  const suggestions = useMemo(() => {
    const result: Suggestion[] = [];
    const plannedMeals = countPlannedMeals(weekPlan);

    // --- PROGRESS ---
    if (plannedMeals === 0) {
      result.push({
        id: "empty-week",
        type: "progress",
        severity: "info",
        icon: "🎯",
        title: "Get Started",
        message:
          'Click "Generate Full Week" or drag a recipe to any meal slot to begin planning.',
      });
    } else if (plannedMeals < 21) {
      result.push({
        id: "incomplete-week",
        type: "progress",
        severity: "info",
        icon: "📅",
        title: "Week in Progress",
        message: `${plannedMeals}/21 meals planned. Keep going!`,
      });
    }

    // --- NUTRITIONAL ---
    if (weeklyNutrition) {
      const totals = weeklyNutrition.weeklyTotals;
      const goals = weeklyNutrition.weeklyGoals;

      if (goals.protein > 0) {
        const proteinGap = goals.protein - totals.protein;
        if (proteinGap > 50) {
          result.push({
            id: "protein-deficiency",
            type: "nutritional",
            severity: "warning",
            icon: "🥩",
            title: "Protein Gap",
            message: `You're ${Math.round(proteinGap)}g short of your weekly protein goal. Add protein-rich meals.`,
            actionable: true,
          });
        }
      }

      if (goals.fiber > 0) {
        const fiberGap = goals.fiber - totals.fiber;
        if (fiberGap > 20) {
          result.push({
            id: "fiber-deficiency",
            type: "nutritional",
            severity: "warning",
            icon: "🌾",
            title: "Low Fiber",
            message: `Add ${Math.round(fiberGap)}g more fiber. Try whole grains, legumes, or vegetables.`,
            actionable: true,
          });
        }
      }

      if (goals.calories > 0 && totals.calories > goals.calories * 1.15) {
        result.push({
          id: "calorie-excess",
          type: "nutritional",
          severity: "warning",
          icon: "⚡",
          title: "High Calorie Week",
          message: `${Math.round(totals.calories)} cal planned vs ${Math.round(goals.calories)} target. Consider lighter options.`,
        });
      }

      // Compliance check
      const compliance = weeklyNutrition.weeklyCompliance;
      if (compliance && plannedMeals >= 14 && compliance.overall >= 0.9) {
        result.push({
          id: "excellent-compliance",
          type: "progress",
          severity: "info",
          icon: "✨",
          title: "Excellent Week!",
          message: `${Math.round(compliance.overall * 100)}% nutritional compliance. Great balance!`,
        });
      }
    }

    // --- VARIETY ---
    if (weekPlan && plannedMeals >= 5) {
      const ingredients = extractAllIngredients(weekPlan);
      const uniqueCount = new Set(ingredients).size;

      if (uniqueCount < 20 && uniqueCount > 0) {
        result.push({
          id: "low-variety",
          type: "variety",
          severity: "info",
          icon: "🌈",
          title: "Limited Variety",
          message: `${uniqueCount} unique ingredients. Aim for 30+ for nutritional diversity.`,
          actionable: true,
        });
      }

      const recipeCounts = countRecipeFrequency(weekPlan);
      const repeated = Object.values(recipeCounts).filter((c) => c > 1).length;
      if (repeated > 0) {
        result.push({
          id: "repeated-recipes",
          type: "variety",
          severity: "info",
          icon: "🔁",
          title: "Repeated Recipes",
          message: `${repeated} recipe(s) appear more than once. Consider diversifying.`,
        });
      }

      const cuisineCount = countUniqueCuisines(weekPlan);
      if (cuisineCount > 0 && cuisineCount < 3 && plannedMeals >= 7) {
        result.push({
          id: "low-cuisine-variety",
          type: "variety",
          severity: "info",
          icon: "🌍",
          title: "Explore Cuisines",
          message: `Only ${cuisineCount} cuisine type(s). Try mixing in different regional flavors.`,
        });
      }
    }

    // --- PLANETARY ---
    const now = new Date();
    const dayOfWeek = now.getDay();
    const planetaryRulers: Record<number, { planet: string; suggestion: string }> = {
      0: { planet: "Sun", suggestion: "Energizing, bold-flavored meals shine today" },
      1: { planet: "Moon", suggestion: "Comfort foods and soups are favored" },
      2: { planet: "Mars", suggestion: "Spicy, protein-rich dishes are ideal" },
      3: { planet: "Mercury", suggestion: "Complex, varied dishes stimulate the mind" },
      4: { planet: "Jupiter", suggestion: "Abundant, celebratory meals are auspicious" },
      5: { planet: "Venus", suggestion: "Indulgent, beautiful presentations please" },
      6: { planet: "Saturn", suggestion: "Grounding, traditional dishes provide structure" },
    };

    const today = planetaryRulers[dayOfWeek];
    if (today) {
      result.push({
        id: "planetary-day",
        type: "planetary",
        severity: "info",
        icon: "⭐",
        title: `${today.planet} Day`,
        message: today.suggestion,
      });
    }

    return result;
  }, [weekPlan, weeklyNutrition]);

  return (
    <div
      className={`bg-white border-l border-gray-200 shadow-lg transition-all duration-300 flex flex-col h-full ${
        isCollapsed ? "w-12" : "w-80"
      }`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -left-10 top-4 bg-white border border-gray-200 rounded-l-lg p-2 shadow-sm hover:bg-gray-50 z-10 focus:outline-none focus:ring-2 focus:ring-amber-500"
        aria-label={isCollapsed ? "Expand suggestions" : "Collapse suggestions"}
      >
        {isCollapsed ? "◀" : "▶"}
      </button>

      {!isCollapsed && (
        <>
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-amber-100 flex-shrink-0">
            <h3 className="font-semibold text-gray-800">Smart Suggestions</h3>
            <p className="text-xs text-gray-600 mt-1">
              {suggestions.length} active tip{suggestions.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Suggestions List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {suggestions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <span className="text-4xl mb-2 block">✓</span>
                <p className="text-sm">No suggestions right now</p>
              </div>
            ) : (
              suggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onApply={onApplySuggestion as ((s: ApplicableSuggestion) => void) | undefined}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** Individual suggestion card */
function SuggestionCard({
  suggestion,
  onApply,
}: {
  suggestion: Suggestion;
  onApply?: (s: ApplicableSuggestion) => void;
}) {
  const severityColors = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    critical: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <div
      className={`p-3 rounded-lg border ${severityColors[suggestion.severity]} animate-fade-in`}
    >
      <div className="flex items-start gap-2">
        <span className="text-2xl flex-shrink-0">{suggestion.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{suggestion.title}</h4>
          <p className="text-xs mt-1 opacity-90">{suggestion.message}</p>

          {suggestion.autoApply && (
            <button
              onClick={suggestion.autoApply}
              className="mt-2 text-xs px-3 py-1 bg-white bg-opacity-70 rounded-full hover:bg-opacity-100 transition-all font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Fix This
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
