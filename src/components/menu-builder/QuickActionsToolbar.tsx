"use client";

/**
 * Quick Actions Toolbar for Menu Builder
 * Provides one-click actions for generating and optimizing weekly menus
 * Now with user chart personalization support
 *
 * @file src/components/menu-builder/QuickActionsToolbar.tsx
 * @created 2026-01-28
 * @updated 2026-02-03 - Added personalization status display
 */

import Link from "next/link";
import React, { useState } from "react";
import { getServerRecipes } from "@/actions/recipes";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import { useUser } from "@/contexts/UserContext";
import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";
import type { DayOfWeek, MealType } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";
import { createLogger } from "@/utils/logger";
import { isSuitableForMealType } from "@/utils/menuPlanner/mealTypeMatching";

const logger = createLogger("QuickActionsToolbar");

/**
 * Score a recipe for nutritional gap-filling potential
 */
function calculateNutritionScore(recipe: Recipe): number {
  let score = 0;
  const nutrition = recipe.nutrition;
  if (!nutrition) return 50; // neutral score if no nutrition data

  if (nutrition.protein && nutrition.protein > 15) score += 20;
  if (nutrition.fiber && nutrition.fiber > 5) score += 15;
  if (
    nutrition.calories &&
    nutrition.calories > 200 &&
    nutrition.calories < 800
  )
    score += 15;

  return Math.min(100, score + 50);
}

export default function QuickActionsToolbar() {
  const {
    currentMenu,
    addMealToSlot,
    clearWeek,
    generateMealsForDay,
    weeklyBudget,
    setWeeklyBudget,
    estimatedWeeklyCost,
    costConfidence,
    costBreakdown,
    budgetPerMeal,
  } = useMenuPlanner();

  // Get user context for personalization status
  const { currentUser } = useUser();
  const hasNatalChart = !!currentUser?.natalChart;

  const [isGenerating, setIsGenerating] = useState(false);
  const [isBalancing, setIsBalancing] = useState(false);
  const [isDiversifying, setIsDiversifying] = useState(false);
  const [currentGeneratingDay, setCurrentGeneratingDay] =
    useState<DayOfWeek | null>(null);
  const [budgetInputVisible, setBudgetInputVisible] = useState(!!weeklyBudget);
  const [budgetInputValue, setBudgetInputValue] = useState(
    weeklyBudget?.toString() ?? "",
  );

  React.useEffect(() => {
    if (weeklyBudget !== null && weeklyBudget !== undefined) {
      setBudgetInputValue(weeklyBudget.toString());
      setBudgetInputVisible(true);
    }
  }, [weeklyBudget]);

  /**
   * Get the next day that needs meals generated
   */
  const getNextEmptyDay = (): DayOfWeek | null => {
    if (!currentMenu) return null;

    for (let day = 0; day < 7; day++) {
      const dayMeals = currentMenu.meals.filter(
        (m) => m.dayOfWeek === day && m.recipe,
      );
      // If day has fewer than 3 main meals (breakfast, lunch, dinner), it needs generation
      if (dayMeals.length < 3) {
        return day as DayOfWeek;
      }
    }
    return null; // All days are filled
  };

  const nextEmptyDay = getNextEmptyDay();
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  /**
   * Generate Day - fills empty meal slots for the next day that needs it
   * Uses user's natal chart for personalized recommendations if available
   */
  const handleGenerateDay = async () => {
    if (!currentMenu || nextEmptyDay === null) return;
    setIsGenerating(true);
    setCurrentGeneratingDay(nextEmptyDay);

    try {
      logger.info(`Generating meals for ${dayNames[nextEmptyDay]}`, {
        personalized: hasNatalChart,
      });

      // Generate meals for the next empty day with personalization
      await generateMealsForDay(nextEmptyDay, {
        mealTypes: ["breakfast", "lunch", "dinner"],
        useCurrentPlanetary: true,
        usePersonalization: hasNatalChart,
      });

      // If generateMealsForDay didn't fill slots, try UnifiedRecipeService fallback
      const dayMeals = currentMenu.meals.filter(
        (m) => m.dayOfWeek === nextEmptyDay && m.recipe,
      );
      if (dayMeals.length === 0) {
        await fillDayWithRecipeService(nextEmptyDay);
      }

      logger.info(`Generated meals for ${dayNames[nextEmptyDay]}`);
    } catch (err) {
      logger.error(`Failed to generate day ${nextEmptyDay}:`, err);
    } finally {
      setIsGenerating(false);
      setCurrentGeneratingDay(null);
    }
  };

  /**
   * Fallback: fill a single day using UnifiedRecipeService
   */
  const fillDayWithRecipeService = async (day: DayOfWeek) => {
    if (!currentMenu) return;

    try {
      const allRecipes = (await getServerRecipes()) as unknown as Recipe[];

      if (!allRecipes || allRecipes.length === 0) {
        logger.info("No recipes available from UnifiedRecipeService");
        return;
      }

      const usedRecipeIds = new Set(
        currentMenu.meals.filter((m) => m.recipe).map((m) => m.recipe!.id),
      );
      const mealTypes: MealType[] = ["breakfast", "lunch", "dinner"];

      for (const mealType of mealTypes) {
        // Check if slot already has a recipe
        const existingSlot = currentMenu.meals.find(
          (m) => m.dayOfWeek === day && m.mealType === mealType && m.recipe,
        );
        if (existingSlot) continue;

        // Find suitable recipe not yet used
        const suitable = allRecipes.filter(
          (r) => !usedRecipeIds.has(r.id) && isSuitableForMealType(r, mealType),
        );

        // If no meal-type-specific match, use any unused recipe
        const candidates =
          suitable.length > 0
            ? suitable
            : allRecipes.filter((r) => !usedRecipeIds.has(r.id));

        if (candidates.length > 0) {
          // Sort by nutrition score
          const scored = candidates
            .map((r) => ({ recipe: r, score: calculateNutritionScore(r) }))
            .sort((a, b) => b.score - a.score);

          const best = scored[0].recipe;
          await addMealToSlot(day, mealType, best as MonicaOptimizedRecipe);
          usedRecipeIds.add(best.id);
        }
      }
    } catch (err) {
      logger.error("Failed to fill day with recipe service:", err);
    }
  };

  /**
   * Fallback: fill slots using UnifiedRecipeService
   */
  const _fillWithRecipeService = async () => {
    if (!currentMenu) return;

    try {
      const allRecipes = (await getServerRecipes()) as unknown as Recipe[];

      if (!allRecipes || allRecipes.length === 0) {
        logger.info("No recipes available from UnifiedRecipeService");
        return;
      }

      const usedRecipeIds = new Set<string>();
      const mealTypes: MealType[] = ["breakfast", "lunch", "dinner"];

      for (let day = 0; day < 7; day++) {
        for (const mealType of mealTypes) {
          // Check if slot already has a recipe
          const existingSlot = currentMenu.meals.find(
            (m) => m.dayOfWeek === day && m.mealType === mealType && m.recipe,
          );
          if (existingSlot) continue;

          // Find suitable recipe not yet used
          const suitable = allRecipes.filter(
            (r) =>
              !usedRecipeIds.has(r.id) && isSuitableForMealType(r, mealType),
          );

          // If no meal-type-specific match, use any unused recipe
          const candidates =
            suitable.length > 0
              ? suitable
              : allRecipes.filter((r) => !usedRecipeIds.has(r.id));

          if (candidates.length > 0) {
            // Sort by nutrition score
            const scored = candidates
              .map((r) => ({ recipe: r, score: calculateNutritionScore(r) }))
              .sort((a, b) => b.score - a.score);

            const best = scored[0].recipe;
            await addMealToSlot(
              day as DayOfWeek,
              mealType,
              best as MonicaOptimizedRecipe,
            );
            usedRecipeIds.add(best.id);
          }
        }
      }
    } catch (err) {
      logger.error("Failed to fill with recipe service:", err);
    }
  };

  /**
   * Balance Nutrition - swap low-scoring recipes with better alternatives
   */
  const handleBalanceNutrition = async () => {
    if (!currentMenu) return;
    setIsBalancing(true);

    try {
      const allRecipes = (await getServerRecipes()) as unknown as Recipe[];

      if (!allRecipes || allRecipes.length === 0) {
        logger.info("No recipes available for balancing");
        setIsBalancing(false);
        return;
      }

      // Find meals with lowest nutrition scores
      const filledMeals = currentMenu.meals
        .filter((m) => m.recipe)
        .map((m) => ({
          slot: m,
          score: calculateNutritionScore(m.recipe! as any),
        }))
        .sort((a, b) => a.score - b.score);

      // Replace bottom 3-5 with higher scoring alternatives
      const usedIds = new Set(
        currentMenu.meals.filter((m) => m.recipe).map((m) => m.recipe!.id),
      );

      const swapCount = Math.min(5, Math.floor(filledMeals.length / 2));

      for (let i = 0; i < swapCount; i++) {
        const meal = filledMeals[i];
        if (!meal) break;

        const betterRecipes = allRecipes
          .filter(
            (r) =>
              !usedIds.has(r.id) &&
              isSuitableForMealType(r, meal.slot.mealType) &&
              calculateNutritionScore(r) > meal.score,
          )
          .sort(
            (a, b) => calculateNutritionScore(b) - calculateNutritionScore(a),
          );

        if (betterRecipes.length > 0) {
          const replacement = betterRecipes[0];
          usedIds.delete(meal.slot.recipe!.id);
          usedIds.add(replacement.id);
          await addMealToSlot(
            meal.slot.dayOfWeek,
            meal.slot.mealType,
            replacement as MonicaOptimizedRecipe,
          );
        }
      }

      logger.info(`Balanced nutrition - swapped up to ${swapCount} recipes`);
    } catch (err) {
      logger.error("Failed to balance nutrition:", err);
    } finally {
      setIsBalancing(false);
    }
  };

  /**
   * Maximize Variety - replace repeated ingredients with diverse alternatives
   */
  const handleMaximizeVariety = async () => {
    if (!currentMenu) return;
    setIsDiversifying(true);

    try {
      const allRecipes = (await getServerRecipes()) as unknown as Recipe[];

      if (!allRecipes || allRecipes.length === 0) {
        setIsDiversifying(false);
        return;
      }

      // Count ingredient frequency
      const ingredientCounts = new Map<string, number>();
      const recipeIngredients = new Map<string, Set<string>>();

      currentMenu.meals
        .filter((m) => m.recipe)
        .forEach((m) => {
          const recipeIngs = new Set<string>();
          (m.recipe!.ingredients || []).forEach((ing) => {
            const name = (typeof ing === 'string' ? ing : (ing as any).name ?? '').toLowerCase();
            ingredientCounts.set(name, (ingredientCounts.get(name) || 0) + 1);
            recipeIngs.add(name);
          });
          recipeIngredients.set(m.recipe!.id, recipeIngs);
        });

      // Find meals using the most repeated ingredients
      const filledMeals = currentMenu.meals
        .filter((m) => m.recipe)
        .map((m) => {
          const ings = recipeIngredients.get(m.recipe!.id) || new Set();
          const repetitionScore = Array.from(ings).reduce(
            (sum, ing) => sum + (ingredientCounts.get(ing) || 0),
            0,
          );
          return { slot: m, repetitionScore };
        })
        .sort((a, b) => b.repetitionScore - a.repetitionScore);

      const usedIds = new Set(
        currentMenu.meals.filter((m) => m.recipe).map((m) => m.recipe!.id),
      );

      // Replace top 3 most repetitive recipes
      const swapCount = Math.min(3, Math.floor(filledMeals.length / 3));

      for (let i = 0; i < swapCount; i++) {
        const meal = filledMeals[i];
        if (!meal) break;

        // Find recipes with ingredients not currently in the menu
        const currentIngs = new Set(ingredientCounts.keys());
        const diverseRecipes = allRecipes
          .filter((r) => !usedIds.has(r.id))
          .map((r) => {
            const recipeIngs = (r.ingredients || []).map((ing) =>
              ing.name.toLowerCase(),
            );
            const newIngCount = recipeIngs.filter(
              (ing) => !currentIngs.has(ing),
            ).length;
            return { recipe: r, newIngCount };
          })
          .sort((a, b) => b.newIngCount - a.newIngCount);

        if (diverseRecipes.length > 0 && diverseRecipes[0].newIngCount > 0) {
          const replacement = diverseRecipes[0].recipe;
          usedIds.delete(meal.slot.recipe!.id);
          usedIds.add(replacement.id);
          await addMealToSlot(
            meal.slot.dayOfWeek,
            meal.slot.mealType,
            replacement as MonicaOptimizedRecipe,
          );
        }
      }

      logger.info(`Diversified menu - swapped up to ${swapCount} recipes`);
    } catch (err) {
      logger.error("Failed to maximize variety:", err);
    } finally {
      setIsDiversifying(false);
    }
  };

  const totalMeals = currentMenu?.meals.filter((m) => m.recipe).length || 0;

  const isAnyLoading = isGenerating || isBalancing || isDiversifying;
  const loadingMessage = isGenerating
    ? currentGeneratingDay !== null
      ? hasNatalChart
        ? `Generating personalized ${dayNames[currentGeneratingDay]}...`
        : `Generating ${dayNames[currentGeneratingDay]}...`
      : hasNatalChart
        ? "Generating personalized day..."
        : "Generating day..."
    : isBalancing
      ? "Balancing nutrition..."
      : isDiversifying
        ? "Diversifying recipes..."
        : "";

  // Determine button text based on state
  const getGenerateButtonText = () => {
    if (isGenerating && currentGeneratingDay !== null) {
      return hasNatalChart
        ? `Generating personalized ${dayNames[currentGeneratingDay]}...`
        : `Generating ${dayNames[currentGeneratingDay]}...`;
    }
    if (nextEmptyDay === null) {
      return "Week Complete!";
    }
    return hasNatalChart
      ? `Generate ${dayNames[nextEmptyDay]} (Personalized)`
      : `Generate ${dayNames[nextEmptyDay]}`;
  };

  return (
    <>
      {/* Loading Overlay */}
      {isAnyLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl animate-fade-in">
            <LoadingSpinner size="lg" message={loadingMessage} />
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">
              Quick Actions
            </span>
            {totalMeals > 0 && (
              <span className="text-xs text-gray-500">
                ({totalMeals}/21 meals planned)
              </span>
            )}
          </div>

          {/* Personalization Status */}
          {hasNatalChart ? (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 rounded-lg">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span className="text-xs text-purple-700 font-medium">
                Personalized for you
              </span>
            </div>
          ) : (
            <Link
              href="/onboarding"
              className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-xs text-gray-600">
                Add birth data for personalized recipes
              </span>
            </Link>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => { void handleGenerateDay(); }}
            disabled={isGenerating || nextEmptyDay === null}
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg disabled:opacity-50 transition-all font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              hasNatalChart
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:ring-purple-500"
                : "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 focus:ring-amber-500"
            }`}
            title={
              nextEmptyDay !== null
                ? hasNatalChart
                  ? `Generate personalized meals for ${dayNames[nextEmptyDay]}`
                  : `Generate meals for ${dayNames[nextEmptyDay]}`
                : "All days have meals"
            }
          >
            <span>{hasNatalChart ? "🌟" : "✨"}</span>
            {getGenerateButtonText()}
          </button>

          <button
            onClick={() => { void handleBalanceNutrition(); }}
            disabled={isBalancing || totalMeals < 3}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all font-medium text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            title={
              totalMeals < 3
                ? "Add at least 3 meals first"
                : "Swap recipes to fix nutritional gaps"
            }
          >
            <span>⚖️</span>
            {isBalancing ? "Balancing..." : "Balance Nutrition"}
          </button>

          <button
            onClick={() => { void handleMaximizeVariety(); }}
            disabled={isDiversifying || totalMeals < 3}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 transition-all font-medium text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            title={
              totalMeals < 3
                ? "Add at least 3 meals first"
                : "Replace repetitive recipes"
            }
          >
            <span>🌈</span>
            {isDiversifying ? "Diversifying..." : "Maximize Variety"}
          </button>

          <button
            onClick={() => {
              // eslint-disable-next-line no-alert
              if (window.confirm("Clear entire week? This cannot be undone.")) {
                void clearWeek();
              }
            }}
            disabled={totalMeals === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-all font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <span>🗑️</span>
            Clear Week
          </button>

          {/* Budget Toggle */}
          <button
            onClick={() => setBudgetInputVisible(!budgetInputVisible)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              weeklyBudget
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 focus:ring-emerald-500"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400"
            }`}
            title="Set a weekly grocery budget"
          >
            <span>💰</span>
            {weeklyBudget ? `$${weeklyBudget}/wk` : "Set Budget"}
          </button>
        </div>

        {/* Budget Control Panel */}
        {budgetInputVisible && (
          <div className="mt-3 p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <label htmlFor="budget-input" className="text-sm font-semibold text-emerald-800">
                  Weekly Budget
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-emerald-600 font-medium">$</span>
                  <input
                    id="budget-input"
                    type="number"
                    min="20"
                    max="500"
                    step="5"
                    value={budgetInputValue}
                    onChange={(e) => setBudgetInputValue(e.target.value)}
                    onBlur={() => {
                      const val = parseFloat(budgetInputValue);
                      if (!isNaN(val) && val >= 20) {
                        setWeeklyBudget(val);
                      } else if (budgetInputValue === "" || budgetInputValue === "0") {
                        setWeeklyBudget(null);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = parseFloat(budgetInputValue);
                        if (!isNaN(val) && val >= 20) setWeeklyBudget(val);
                      }
                    }}
                    className="w-20 px-2 py-1 text-sm rounded-md border border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white text-gray-800"
                    placeholder="100"
                  />
                </div>
                {weeklyBudget && (
                  <button
                    onClick={() => {
                      setWeeklyBudget(null);
                      setBudgetInputValue("");
                    }}
                    className="text-xs text-emerald-600 hover:text-emerald-800 underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              {weeklyBudget && totalMeals > 0 && (
                <div className="flex items-center gap-4 text-sm divide-x divide-gray-100">
                  <div 
                    className="flex flex-col items-end px-3 group relative cursor-help"
                    title={`Cost Breakdown:\n${costBreakdown.map(b => `${b.ingredient}: $${b.estimatedCost.toFixed(2)} (${b.confidence})`).join('\n')}`}
                  >
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${
                        costConfidence === 'high' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                        costConfidence === 'medium' ? 'bg-amber-500' : 'bg-red-400'
                      }`} />
                      <span className="text-[10px] uppercase tracking-tighter text-gray-400 font-bold">
                        {costConfidence === 'high' ? 'Live Match' : 'Estimated'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500">Est. Cost</span>
                      <span className="font-semibold text-gray-900 drop-shadow-sm">
                        ${estimatedWeeklyCost.toFixed(2)}
                      </span>
                    </div>

                    {/* Tooltip Popup (Hidden by default, shown on group-hover) */}
                    <div className="absolute top-10 right-0 z-50 w-72 p-3 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                      <h4 className="text-xs font-bold text-gray-800 mb-2 border-b pb-1">Grocery Breakdown ({costBreakdown.length} items)</h4>
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {costBreakdown.slice(0, 15).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-600 truncate max-w-[180px]">{item.ingredient}</span>
                            <span className="font-mono text-gray-800">${item.estimatedCost.toFixed(2)}</span>
                          </div>
                        ))}
                        {costBreakdown.length > 15 && (
                          <div className="text-[9px] text-gray-400 text-center pt-1 italic">
                            + {costBreakdown.length - 15} more items...
                          </div>
                        )}
                      </div>
                      <div className="mt-2 pt-2 border-t flex justify-between items-center">
                        <span className="text-[10px] text-gray-400">Confidence: {costConfidence.toUpperCase()}</span>
                        <span className="text-[10px] font-bold text-emerald-600">${estimatedWeeklyCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500">Remaining</span>
                    <span
                      className={`font-semibold ${
                        weeklyBudget - estimatedWeeklyCost >= 0
                          ? "text-emerald-700"
                          : "text-red-600"
                      }`}
                    >
                      ${(weeklyBudget - estimatedWeeklyCost).toFixed(2)}
                    </span>
                  </div>
                  {budgetPerMeal && (
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500">Per Meal</span>
                      <span className="font-semibold text-gray-700">
                        ${budgetPerMeal.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Budget progress bar */}
            {weeklyBudget && totalMeals > 0 && (
              <div className="mt-2">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      estimatedWeeklyCost / weeklyBudget > 1
                        ? "bg-red-500"
                        : estimatedWeeklyCost / weeklyBudget > 0.8
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{
                      width: `${Math.min(100, (estimatedWeeklyCost / weeklyBudget) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-gray-400">$0</span>
                  <span className="text-[10px] text-gray-400">
                    ${weeklyBudget}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
// Dummy comment to force re-compile
