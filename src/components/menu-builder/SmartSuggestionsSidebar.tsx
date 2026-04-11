"use client";

/**
 * Smart Suggestions Sidebar
 * Provides real-time nutritional alerts, variety tips, planetary timing,
 * and progress tracking as users build their weekly menu.
 *
 * @file src/components/menu-builder/SmartSuggestionsSidebar.tsx
 * @created 2026-01-28
 * @updated 2026-03-11 — improved visuals, grouping, and UX
 */

import React, { useMemo, useState } from "react";
import type { WeeklyMenu } from "@/types/menuPlanner";
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
      (m.recipe!.ingredients || []).map((ing) =>
        (typeof ing === "string" ? ing : (ing as any).name ?? "").toLowerCase(),
      ),
    );
}

/** Count how often each recipe appears */
function countRecipeFrequency(
  weekPlan: WeeklyMenu | null,
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
      .map((m) => m.recipe!.cuisine!.toLowerCase()),
  );
  return cuisines.size;
}

const CATEGORY_META: Record<
  Suggestion["type"],
  { label: string; emoji: string; bg: string; border: string; text: string }
> = {
  progress: {
    label: "Progress",
    emoji: "📅",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
  },
  nutritional: {
    label: "Nutrition",
    emoji: "🥗",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
  },
  variety: {
    label: "Variety",
    emoji: "🌈",
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-700",
  },
  planetary: {
    label: "Planetary",
    emoji: "✨",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
  },
};

const SEVERITY_ACCENT: Record<
  Suggestion["severity"],
  { dot: string; badge: string }
> = {
  info: { dot: "bg-blue-400", badge: "bg-blue-100 text-blue-700" },
  warning: { dot: "bg-amber-400", badge: "bg-amber-100 text-amber-700" },
  critical: { dot: "bg-red-500", badge: "bg-red-100 text-red-700" },
};

export default function SmartSuggestionsSidebar({
  weekPlan,
  weeklyNutrition,
  onApplySuggestion,
  isCollapsed = false,
  onToggleCollapse,
}: SmartSuggestionsSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<
    Set<Suggestion["type"]>
  >(new Set(["progress", "nutritional", "variety", "planetary"]));

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
    } else if (plannedMeals < 7) {
      result.push({
        id: "early-week",
        type: "progress",
        severity: "info",
        icon: "🌱",
        title: "Just Getting Started",
        message: `${plannedMeals}/21 meals planned. Try generating suggestions for the remaining slots.`,
      });
    } else if (plannedMeals < 21) {
      result.push({
        id: "incomplete-week",
        type: "progress",
        severity: "info",
        icon: "📅",
        title: "Week in Progress",
        message: `${plannedMeals}/21 meals planned — ${21 - plannedMeals} left to go!`,
      });
    } else {
      result.push({
        id: "full-week",
        type: "progress",
        severity: "info",
        icon: "🏆",
        title: "Full Week Planned!",
        message: "All 21 meals are set. Check nutrition balance and variety.",
      });
    }

    // --- NUTRITIONAL ---
    if (weeklyNutrition) {
      const totals = weeklyNutrition.weeklyTotals;
      const goals = weeklyNutrition.weeklyGoals;

      if (goals.protein > 0) {
        const proteinPct = goals.protein > 0 ? totals.protein / goals.protein : 0;
        if (proteinPct < 0.7) {
          result.push({
            id: "protein-deficiency",
            type: "nutritional",
            severity: proteinPct < 0.5 ? "critical" : "warning",
            icon: "🥩",
            title: "Protein Gap",
            message: `Only ${Math.round(proteinPct * 100)}% of weekly protein target. Add lean meats, legumes, or dairy.`,
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
            message: `${Math.round(fiberGap)}g fiber short. Add whole grains, legumes, or vegetables.`,
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
          title: "Calorie Surplus",
          message: `${Math.round(((totals.calories - goals.calories) / goals.calories) * 100)}% above target. Consider lighter options for some days.`,
        });
      }

      if (goals.calories > 0 && totals.calories < goals.calories * 0.7 && plannedMeals >= 7) {
        result.push({
          id: "calorie-deficit",
          type: "nutritional",
          severity: "warning",
          icon: "🔋",
          title: "Low Energy Week",
          message: `Calories only ${Math.round((totals.calories / goals.calories) * 100)}% of target. Add more nutrient-dense meals.`,
        });
      }

      const compliance = weeklyNutrition.weeklyCompliance;
      if (compliance && plannedMeals >= 14 && compliance.overall >= 0.9) {
        result.push({
          id: "excellent-compliance",
          type: "progress",
          severity: "info",
          icon: "✨",
          title: "Excellent Balance!",
          message: `${Math.round(compliance.overall * 100)}% nutritional compliance — outstanding week!`,
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
          title: "Limited Ingredients",
          message: `${uniqueCount} unique ingredients used. Aim for 30+ for nutritional diversity.`,
          actionable: true,
        });
      } else if (uniqueCount >= 30) {
        result.push({
          id: "great-variety",
          type: "variety",
          severity: "info",
          icon: "🎨",
          title: "Great Variety!",
          message: `${uniqueCount} unique ingredients — excellent diversity for gut health.`,
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
          message: `${repeated} recipe${repeated > 1 ? "s" : ""} appear more than once this week.`,
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
          message: `Only ${cuisineCount} cuisine type${cuisineCount > 1 ? "s" : ""} this week. Mix in different regional flavors.`,
        });
      } else if (cuisineCount >= 5) {
        result.push({
          id: "great-cuisines",
          type: "variety",
          severity: "info",
          icon: "🗺️",
          title: "Global Explorer",
          message: `${cuisineCount} different cuisines this week — keep it up!`,
        });
      }
    }

    // --- PLANETARY ---
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();

    const planetaryRulers: Record<
      number,
      { planet: string; emoji: string; suggestion: string; mealTip: string }
    > = {
      0: {
        planet: "Sun",
        emoji: "☀️",
        suggestion: "Energizing, bold-flavored meals shine today",
        mealTip: "Citrus, golden spices & vibrant colors align with solar energy",
      },
      1: {
        planet: "Moon",
        emoji: "🌙",
        suggestion: "Comfort foods and soups are favored",
        mealTip: "Creamy textures, broths, and cooling foods support lunar flow",
      },
      2: {
        planet: "Mars",
        emoji: "🔴",
        suggestion: "Spicy, protein-rich dishes are ideal",
        mealTip: "Chili, red meats, and iron-rich foods resonate with Mars",
      },
      3: {
        planet: "Mercury",
        emoji: "🝉",
        suggestion: "Complex, varied dishes stimulate the mind",
        mealTip: "Mix textures and flavors; try something new today",
      },
      4: {
        planet: "Jupiter",
        emoji: "♃",
        suggestion: "Abundant, celebratory meals are auspicious",
        mealTip: "Generous portions, herbs, and festive preparations suit Jupiter",
      },
      5: {
        planet: "Venus",
        emoji: "💜",
        suggestion: "Indulgent, beautiful presentations please",
        mealTip: "Flowers, sweets, and aesthetically plated dishes honor Venus",
      },
      6: {
        planet: "Saturn",
        emoji: "♄",
        suggestion: "Grounding, traditional dishes provide structure",
        mealTip: "Root vegetables, ferments, and slow-cooked meals align with Saturn",
      },
    };

    const today = planetaryRulers[dayOfWeek];
    if (today) {
      result.push({
        id: "planetary-day",
        type: "planetary",
        severity: "info",
        icon: today.emoji,
        title: `${today.planet} Day`,
        message: today.suggestion,
      });
      result.push({
        id: "planetary-meal-tip",
        type: "planetary",
        severity: "info",
        icon: "🍽️",
        title: "Meal Alchemy Tip",
        message: today.mealTip,
      });
    }

    // Time-of-day meal guidance
    const mealWindows: Array<{ start: number; end: number; label: string; tip: string; icon: string }> = [
      { start: 5, end: 11, label: "Breakfast Time", icon: "🌅", tip: "Light, high-fiber start — fruits, whole grains, eggs." },
      { start: 11, end: 15, label: "Lunch Time", icon: "☀️", tip: "Your biggest meal. Prioritize protein and complex carbs." },
      { start: 15, end: 18, label: "Snack Time", icon: "🍎", tip: "Avoid sugar spikes — nuts, seeds, or a small fruit." },
      { start: 18, end: 22, label: "Dinner Time", icon: "🌙", tip: "Go lighter — lean proteins, steamed veggies, less starch." },
    ];
    const activeMealWindow = mealWindows.find((w) => hour >= w.start && hour < w.end);
    if (activeMealWindow) {
      result.push({
        id: "meal-timing-tip",
        type: "planetary",
        severity: "info",
        icon: activeMealWindow.icon,
        title: activeMealWindow.label,
        message: activeMealWindow.tip,
      });
    }

    return result;
  }, [weekPlan, weeklyNutrition]);

  // Group by type
  const grouped = useMemo(() => {
    const groups: Partial<Record<Suggestion["type"], Suggestion[]>> = {};
    for (const s of suggestions) {
      if (!groups[s.type]) groups[s.type] = [];
      groups[s.type]!.push(s);
    }
    return groups;
  }, [suggestions]);

  const categoryOrder: Array<Suggestion["type"]> = [
    "progress",
    "nutritional",
    "variety",
    "planetary",
  ];

  const criticalCount = suggestions.filter((s) => s.severity === "critical").length;
  const warningCount = suggestions.filter((s) => s.severity === "warning").length;

  const toggleCategory = (type: Suggestion["type"]) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 shadow-md transition-all duration-300 flex flex-col overflow-hidden ${
        isCollapsed ? "w-12" : "w-full"
      }`}
    >
      {/* Collapse Toggle (desktop sidebar mode) */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="absolute -left-10 top-4 bg-white border border-gray-200 rounded-l-lg p-2 shadow-sm hover:bg-gray-50 z-10 focus:outline-none focus:ring-2 focus:ring-amber-500"
          aria-label={isCollapsed ? "Expand suggestions" : "Collapse suggestions"}
        >
          {isCollapsed ? "◀" : "▶"}
        </button>
      )}

      {!isCollapsed && (
        <>
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">
                  ✨ Smart Suggestions
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {suggestions.length} active tip{suggestions.length !== 1 ? "s" : ""}
                </p>
              </div>
              {/* Alert badges */}
              <div className="flex gap-1.5">
                {criticalCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                    {criticalCount} critical
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                    {warningCount} warnings
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {suggestions.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <span className="text-4xl mb-3 block">🌟</span>
                <p className="text-sm font-medium text-gray-500">All looks great!</p>
                <p className="text-xs text-gray-400 mt-1">No suggestions right now.</p>
              </div>
            ) : (
              categoryOrder.map((catType) => {
                const items = grouped[catType];
                if (!items || items.length === 0) return null;
                const meta = CATEGORY_META[catType];
                const isExpanded = expandedCategories.has(catType);

                return (
                  <div key={catType}>
                    {/* Category header */}
                    <button
                      className={`w-full flex items-center justify-between px-4 py-2 ${meta.bg} hover:brightness-95 transition-all`}
                      onClick={() => toggleCategory(catType)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{meta.emoji}</span>
                        <span className={`text-xs font-bold uppercase tracking-wide ${meta.text}`}>
                          {meta.label}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${meta.bg} ${meta.border} border ${meta.text}`}>
                          {items.length}
                        </span>
                      </div>
                      <span className={`text-xs ${meta.text}`}>
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </button>

                    {/* Suggestion cards */}
                    {isExpanded && (
                      <div className="px-3 py-2 space-y-2 bg-white">
                        {items.map((suggestion: Suggestion) => (
                          <SuggestionCard
                            key={suggestion.id}
                            suggestion={suggestion}
                            onApply={
                              onApplySuggestion as
                                | ((s: ApplicableSuggestion) => void)
                                | undefined
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
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
  onApply: _onApply,
}: {
  suggestion: Suggestion;
  onApply?: (s: ApplicableSuggestion) => void;
}) {
  const accent = SEVERITY_ACCENT[suggestion.severity];

  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">
      {/* Severity dot + icon */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <span className="text-xl leading-none">{suggestion.icon}</span>
        <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-xs text-gray-800 leading-tight">
            {suggestion.title}
          </h4>
          {suggestion.severity !== "info" && (
            <span className={`flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${accent.badge}`}>
              {suggestion.severity}
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
          {suggestion.message}
        </p>

        {suggestion.autoApply && (
          <button
            onClick={suggestion.autoApply}
            className="mt-1.5 text-[10px] px-2.5 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            Fix This →
          </button>
        )}
      </div>
    </div>
  );
}
