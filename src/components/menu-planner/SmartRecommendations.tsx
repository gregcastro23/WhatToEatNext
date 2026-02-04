"use client";

/**
 * SmartRecommendations Component
 * Intelligent recipe recommendations based on nutritional gaps
 *
 * Analyzes current menu nutrition and suggests recipes to fill gaps
 * in calories, protein, fiber, elemental balance, and variety.
 *
 * @file src/components/menu-planner/SmartRecommendations.tsx
 * @created 2026-01-29
 */

import React, { useMemo, useState, useCallback } from "react";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import type { Recipe } from "@/types/recipe";
import type { MealType, DayOfWeek, NutritionalGoals } from "@/types/menuPlanner";

// ============================================================================
// Types
// ============================================================================

interface SmartRecommendationsProps {
  availableRecipes: Recipe[];
  onSelectRecipe?: (recipe: Recipe, day: DayOfWeek, mealType: MealType) => void;
  goals?: ExtendedNutritionalGoals;
  maxRecommendations?: number;
  className?: string;
}

interface RecommendationReason {
  type: "nutrition" | "elemental" | "variety" | "seasonal" | "planetary";
  description: string;
  priority: number;
}

interface ScoredRecipe {
  recipe: Recipe;
  score: number;
  reasons: RecommendationReason[];
  suggestedDay?: DayOfWeek;
  suggestedMealType?: MealType;
}

interface NutritionGaps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface ElementalGaps {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

// ============================================================================
// Extended Goals Interface (internal)
// ============================================================================

interface ExtendedNutritionalGoals extends NutritionalGoals {
  weeklyCalories?: number;
  weeklyProtein?: number;
  weeklyCarbs?: number;
  weeklyFat?: number;
  weeklyFiber?: number;
}

// ============================================================================
// Default Goals
// ============================================================================

const DEFAULT_GOALS: ExtendedNutritionalGoals = {
  dailyCalories: 2000,
  dailyProtein: 50,
  dailyCarbs: 250,
  dailyFat: 65,
  dailyFiber: 28,
  weeklyCalories: 14000,
  weeklyProtein: 350,
  weeklyCarbs: 1750,
  weeklyFat: 455,
  weeklyFiber: 196,
};

// ============================================================================
// Utility Functions
// ============================================================================

function calculateNutritionGaps(
  currentTotals: NutritionGaps,
  goals: ExtendedNutritionalGoals
): NutritionGaps {
  const weeklyCalories = goals.weeklyCalories ?? (goals.dailyCalories ?? 2000) * 7;
  const weeklyProtein = goals.weeklyProtein ?? (goals.dailyProtein ?? 50) * 7;
  const weeklyCarbs = goals.weeklyCarbs ?? (goals.dailyCarbs ?? 250) * 7;
  const weeklyFat = goals.weeklyFat ?? (goals.dailyFat ?? 65) * 7;
  const weeklyFiber = goals.weeklyFiber ?? (goals.dailyFiber ?? 28) * 7;

  return {
    calories: Math.max(0, weeklyCalories - currentTotals.calories),
    protein: Math.max(0, weeklyProtein - currentTotals.protein),
    carbs: Math.max(0, weeklyCarbs - currentTotals.carbs),
    fat: Math.max(0, weeklyFat - currentTotals.fat),
    fiber: Math.max(0, weeklyFiber - currentTotals.fiber),
  };
}

function calculateElementalGaps(
  currentBalance: ElementalGaps,
  targetBalance: ElementalGaps = { Fire: 7, Water: 7, Earth: 7, Air: 7 }
): ElementalGaps {
  return {
    Fire: Math.max(0, targetBalance.Fire - currentBalance.Fire),
    Water: Math.max(0, targetBalance.Water - currentBalance.Water),
    Earth: Math.max(0, targetBalance.Earth - currentBalance.Earth),
    Air: Math.max(0, targetBalance.Air - currentBalance.Air),
  };
}

function getDominantElement(elementals: { Fire: number; Water: number; Earth: number; Air: number }): string {
  return Object.entries(elementals).reduce(
    (max, [key, value]) => (value > max[1] ? [key, value] : max),
    ["Fire", 0]
  )[0] as string;
}

function getWeakestElement(elementals: { Fire: number; Water: number; Earth: number; Air: number }): string {
  return Object.entries(elementals).reduce(
    (min, [key, value]) => (value < min[1] ? [key, value] : min),
    ["Fire", Infinity]
  )[0] as string;
}

// ============================================================================
// Scoring Functions
// ============================================================================

function scoreRecipeForNutrition(
  recipe: Recipe,
  gaps: NutritionGaps
): { score: number; reasons: RecommendationReason[] } {
  const reasons: RecommendationReason[] = [];
  let score = 0;

  const nutrition = recipe.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const proteinVal = nutrition.protein ?? 0;
  const fiberVal = nutrition.fiber ?? 0;
  const calorieVal = nutrition.calories ?? 0;

  // Protein gap scoring (high priority)
  if (gaps.protein > 30 && proteinVal >= 20) {
    score += 30;
    reasons.push({
      type: "nutrition",
      description: `High protein (${proteinVal}g) helps meet your protein goal`,
      priority: 1,
    });
  } else if (gaps.protein > 15 && proteinVal >= 10) {
    score += 15;
    reasons.push({
      type: "nutrition",
      description: `Good protein source (${proteinVal}g)`,
      priority: 2,
    });
  }

  // Fiber gap scoring
  if (gaps.fiber > 20 && fiberVal >= 5) {
    score += 25;
    reasons.push({
      type: "nutrition",
      description: `High fiber (${fiberVal}g) helps meet your fiber goal`,
      priority: 1,
    });
  }

  // Calorie balance scoring
  const dailyCalorieGap = gaps.calories / 7;
  if (dailyCalorieGap > 500 && calorieVal >= 400) {
    score += 20;
    reasons.push({
      type: "nutrition",
      description: `Substantial meal (${calorieVal} kcal) helps meet calorie goals`,
      priority: 2,
    });
  } else if (dailyCalorieGap < 200 && calorieVal < 300) {
    score += 15;
    reasons.push({
      type: "nutrition",
      description: `Light option (${calorieVal} kcal) fits remaining allowance`,
      priority: 2,
    });
  }

  return { score, reasons };
}

function scoreRecipeForElementalBalance(
  recipe: Recipe,
  gaps: ElementalGaps
): { score: number; reasons: RecommendationReason[] } {
  const reasons: RecommendationReason[] = [];
  let score = 0;

  const elementals = recipe.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  const dominantElement = getDominantElement(elementals);
  const weakestNeededElement = getWeakestElement({
    Fire: -gaps.Fire,
    Water: -gaps.Water,
    Earth: -gaps.Earth,
    Air: -gaps.Air,
  });

  // If recipe's dominant element matches what we need most
  if (dominantElement === weakestNeededElement && (gaps as any)[dominantElement] > 1) {
    score += 25;
    reasons.push({
      type: "elemental",
      description: `Strong ${dominantElement} element helps balance your week`,
      priority: 1,
    });
  }

  // Check for well-balanced recipes
  const isBalanced = Object.values(elementals).every((v) => v >= 0.15 && v <= 0.35);
  if (isBalanced) {
    score += 10;
    reasons.push({
      type: "elemental",
      description: "Well-balanced elemental properties",
      priority: 3,
    });
  }

  return { score, reasons };
}

function scoreRecipeForVariety(
  recipe: Recipe,
  existingCuisines: Set<string>,
  existingRecipeIds: Set<string>
): { score: number; reasons: RecommendationReason[] } {
  const reasons: RecommendationReason[] = [];
  let score = 0;

  // Avoid duplicate recipes
  if (existingRecipeIds.has(recipe.id)) {
    score -= 50; // Strong penalty for duplicates
  }

  // Reward cuisine variety
  const cuisine = recipe.cuisine?.toLowerCase() || "";
  if (cuisine && !existingCuisines.has(cuisine)) {
    score += 20;
    reasons.push({
      type: "variety",
      description: `Adds ${recipe.cuisine} cuisine variety to your week`,
      priority: 2,
    });
  }

  return { score, reasons };
}

function scoreRecipeForSeason(
  recipe: Recipe,
  currentSeason: string
): { score: number; reasons: RecommendationReason[] } {
  const reasons: RecommendationReason[] = [];
  let score = 0;

  const seasons = (recipe.season as string[]) || ["all"];

  if (seasons.includes(currentSeason) || seasons.includes("all")) {
    score += 15;
    reasons.push({
      type: "seasonal",
      description: `Perfect for ${currentSeason} season`,
      priority: 3,
    });
  }

  return { score, reasons };
}

// ============================================================================
// Main Scoring Function
// ============================================================================

function scoreRecipe(
  recipe: Recipe,
  nutritionGaps: NutritionGaps,
  elementalGaps: ElementalGaps,
  existingCuisines: Set<string>,
  existingRecipeIds: Set<string>,
  currentSeason: string,
  emptySlots: Array<{ day: DayOfWeek; mealType: MealType }>
): ScoredRecipe {
  const allReasons: RecommendationReason[] = [];
  let totalScore = 0;

  // Score for nutrition
  const nutritionScore = scoreRecipeForNutrition(recipe, nutritionGaps);
  totalScore += nutritionScore.score;
  allReasons.push(...nutritionScore.reasons);

  // Score for elemental balance
  const elementalScore = scoreRecipeForElementalBalance(recipe, elementalGaps);
  totalScore += elementalScore.score;
  allReasons.push(...elementalScore.reasons);

  // Score for variety
  const varietyScore = scoreRecipeForVariety(recipe, existingCuisines, existingRecipeIds);
  totalScore += varietyScore.score;
  allReasons.push(...varietyScore.reasons);

  // Score for seasonality
  const seasonScore = scoreRecipeForSeason(recipe, currentSeason);
  totalScore += seasonScore.score;
  allReasons.push(...seasonScore.reasons);

  // Sort reasons by priority
  allReasons.sort((a, b) => a.priority - b.priority);

  // Find suggested slot based on meal type
  let suggestedDay: DayOfWeek | undefined;
  let suggestedMealType: MealType | undefined;

  const recipeMealTypes = (recipe.mealType as string[]) || ["lunch", "dinner"];

  for (const slot of emptySlots) {
    if (recipeMealTypes.includes(slot.mealType)) {
      suggestedDay = slot.day;
      suggestedMealType = slot.mealType;
      break;
    }
  }

  // Fallback to any empty slot
  if (!suggestedDay && emptySlots.length > 0) {
    suggestedDay = emptySlots[0].day;
    suggestedMealType = emptySlots[0].mealType;
  }

  return {
    recipe,
    score: totalScore,
    reasons: allReasons.slice(0, 3), // Top 3 reasons
    suggestedDay,
    suggestedMealType,
  };
}

// ============================================================================
// Helper Components
// ============================================================================

function RecommendationCard({
  scoredRecipe,
  onSelect,
}: {
  scoredRecipe: ScoredRecipe;
  onSelect?: (recipe: Recipe, day: DayOfWeek, mealType: MealType) => void;
}) {
  const { recipe, reasons, suggestedDay, suggestedMealType } = scoredRecipe;

  const handleSelect = useCallback(() => {
    if (onSelect && suggestedDay !== undefined && suggestedMealType) {
      onSelect(recipe, suggestedDay, suggestedMealType);
    }
  }, [onSelect, recipe, suggestedDay, suggestedMealType]);

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-800 truncate">
            {recipe.name}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {recipe.cuisine} {recipe.nutrition?.calories && `| ${recipe.nutrition.calories} kcal`}
          </p>
        </div>
        {suggestedDay !== undefined && suggestedMealType && (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full shrink-0">
            {dayNames[suggestedDay]} {suggestedMealType}
          </span>
        )}
      </div>

      {/* Reasons */}
      <div className="mt-3 space-y-1.5">
        {reasons.map((reason, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs">
            <span className={`shrink-0 ${
              reason.type === "nutrition" ? "text-purple-500" :
              reason.type === "elemental" ? "text-blue-500" :
              reason.type === "variety" ? "text-green-500" :
              reason.type === "seasonal" ? "text-orange-500" :
              "text-pink-500"
            }`}>
              {reason.type === "nutrition" ? "🍎" :
               reason.type === "elemental" ? "🔮" :
               reason.type === "variety" ? "🌈" :
               reason.type === "seasonal" ? "📅" :
               "🌟"}
            </span>
            <span className="text-gray-600">{reason.description}</span>
          </div>
        ))}
      </div>

      {/* Action */}
      {onSelect && suggestedDay !== undefined && suggestedMealType && (
        <button
          onClick={handleSelect}
          className="mt-3 w-full py-2 text-xs font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          Add to {dayNames[suggestedDay]} {suggestedMealType}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function SmartRecommendations({
  availableRecipes,
  onSelectRecipe,
  goals = DEFAULT_GOALS,
  maxRecommendations = 6,
  className = "",
}: SmartRecommendationsProps) {
  const { currentMenu } = useMenuPlanner();
  const [activeFilter, setActiveFilter] = useState<"all" | "nutrition" | "elemental" | "variety">("all");

  // Calculate current menu state
  const menuAnalysis = useMemo(() => {
    const nutritionTotals: NutritionGaps = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    const elementalTotals: ElementalGaps = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    const existingCuisines = new Set<string>();
    const existingRecipeIds = new Set<string>();
    const emptySlots: Array<{ day: DayOfWeek; mealType: MealType }> = [];

    if (!currentMenu) {
      // Return empty slots for all meal types if no menu
      const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
      for (let day = 0; day < 7; day++) {
        for (const mealType of mealTypes) {
          emptySlots.push({ day: day as DayOfWeek, mealType });
        }
      }
      return { nutritionTotals, elementalTotals, existingCuisines, existingRecipeIds, emptySlots };
    }

    for (const meal of currentMenu.meals) {
      if (meal.recipe) {
        const servings = meal.servings || 1;

        // Aggregate nutrition
        if (meal.recipe.nutrition) {
          nutritionTotals.calories += (meal.recipe.nutrition.calories || 0) * servings;
          nutritionTotals.protein += (meal.recipe.nutrition.protein || 0) * servings;
          nutritionTotals.carbs += (meal.recipe.nutrition.carbs || 0) * servings;
          nutritionTotals.fat += (meal.recipe.nutrition.fat || 0) * servings;
          nutritionTotals.fiber += (meal.recipe.nutrition.fiber || 0) * servings;
        }

        // Aggregate elementals
        if (meal.recipe.elementalProperties) {
          elementalTotals.Fire += (meal.recipe.elementalProperties.Fire || 0) * servings;
          elementalTotals.Water += (meal.recipe.elementalProperties.Water || 0) * servings;
          elementalTotals.Earth += (meal.recipe.elementalProperties.Earth || 0) * servings;
          elementalTotals.Air += (meal.recipe.elementalProperties.Air || 0) * servings;
        }

        // Track variety
        if (meal.recipe.cuisine) {
          existingCuisines.add(meal.recipe.cuisine.toLowerCase());
        }
        existingRecipeIds.add(meal.recipe.id);
      } else {
        // Track empty slots
        emptySlots.push({ day: meal.dayOfWeek, mealType: meal.mealType });
      }
    }

    return { nutritionTotals, elementalTotals, existingCuisines, existingRecipeIds, emptySlots };
  }, [currentMenu]);

  // Calculate gaps
  const nutritionGaps = useMemo(
    () => calculateNutritionGaps(menuAnalysis.nutritionTotals, goals),
    [menuAnalysis.nutritionTotals, goals]
  );

  const elementalGaps = useMemo(
    () => calculateElementalGaps(menuAnalysis.elementalTotals),
    [menuAnalysis.elementalTotals]
  );

  // Determine current season
  const currentSeason = useMemo(() => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "autumn";
    return "winter";
  }, []);

  // Score and rank recipes
  const recommendations = useMemo(() => {
    const scored = availableRecipes.map((recipe) =>
      scoreRecipe(
        recipe,
        nutritionGaps,
        elementalGaps,
        menuAnalysis.existingCuisines,
        menuAnalysis.existingRecipeIds,
        currentSeason,
        menuAnalysis.emptySlots
      )
    );

    // Filter based on active filter
    let filtered = scored;
    if (activeFilter !== "all") {
      filtered = scored.filter((sr) =>
        sr.reasons.some((r) => r.type === activeFilter)
      );
    }

    // Sort by score and take top recommendations
    return filtered
      .sort((a, b) => b.score - a.score)
      .filter((sr) => sr.score > 0)
      .slice(0, maxRecommendations);
  }, [
    availableRecipes,
    nutritionGaps,
    elementalGaps,
    menuAnalysis,
    currentSeason,
    activeFilter,
    maxRecommendations,
  ]);

  // Gap summary
  const gapSummary = useMemo(() => {
    const gaps: string[] = [];
    const weeklyProtein = goals.weeklyProtein ?? (goals.dailyProtein ?? 50) * 7;
    const weeklyFiber = goals.weeklyFiber ?? (goals.dailyFiber ?? 28) * 7;
    const weeklyCalories = goals.weeklyCalories ?? (goals.dailyCalories ?? 2000) * 7;

    if (nutritionGaps.protein > weeklyProtein * 0.3) {
      gaps.push(`${Math.round(nutritionGaps.protein)}g protein`);
    }
    if (nutritionGaps.fiber > weeklyFiber * 0.3) {
      gaps.push(`${Math.round(nutritionGaps.fiber)}g fiber`);
    }
    if (nutritionGaps.calories > weeklyCalories * 0.3) {
      gaps.push(`${Math.round(nutritionGaps.calories)} kcal`);
    }

    const weakElement = getWeakestElement({
      Fire: -elementalGaps.Fire,
      Water: -elementalGaps.Water,
      Earth: -elementalGaps.Earth,
      Air: -elementalGaps.Air,
    });
    if ((elementalGaps as any)[weakElement] > 2) {
      gaps.push(`${weakElement} element`);
    }

    return gaps;
  }, [nutritionGaps, elementalGaps, goals]);

  return (
    <div className={`bg-gray-50 rounded-xl p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Smart Recommendations</h3>
          {gapSummary.length > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">
              Need more: {gapSummary.slice(0, 3).join(", ")}
            </p>
          )}
        </div>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
          {recommendations.length} suggestions
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {(["all", "nutrition", "elemental", "variety"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors shrink-0 ${
              activeFilter === filter
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {filter === "all" ? "All" :
             filter === "nutrition" ? "🍎 Nutrition" :
             filter === "elemental" ? "🔮 Elemental" :
             "🌈 Variety"}
          </button>
        ))}
      </div>

      {/* Recommendations grid */}
      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((scoredRecipe) => (
            <RecommendationCard
              key={scoredRecipe.recipe.id}
              scoredRecipe={scoredRecipe}
              onSelect={onSelectRecipe}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No recommendations available</p>
          <p className="text-xs mt-1">Add some recipes to get personalized suggestions</p>
        </div>
      )}

      {/* Empty slots notice */}
      {menuAnalysis.emptySlots.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-700">
            <span className="font-medium">{menuAnalysis.emptySlots.length} empty meal slots</span>
            {" "}remaining this week. Add recipes to complete your meal plan!
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Quick Suggestion Bar (compact version)
// ============================================================================

interface QuickSuggestionBarProps {
  availableRecipes: Recipe[];
  onSelectRecipe?: (recipe: Recipe) => void;
  maxSuggestions?: number;
  className?: string;
}

export function QuickSuggestionBar({
  availableRecipes,
  onSelectRecipe,
  maxSuggestions = 4,
  className = "",
}: QuickSuggestionBarProps) {
  const { currentMenu } = useMenuPlanner();

  // Get quick recommendations based on gaps
  const suggestions = useMemo(() => {
    if (!currentMenu || availableRecipes.length === 0) return [];

    // Quick scoring based on missing nutrition
    const existingIds = new Set(
      currentMenu.meals.filter((m) => m.recipe).map((m) => m.recipe!.id)
    );

    return availableRecipes
      .filter((r) => !existingIds.has(r.id))
      .slice(0, maxSuggestions);
  }, [currentMenu, availableRecipes, maxSuggestions]);

  if (suggestions.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 overflow-x-auto py-2 ${className}`}>
      <span className="text-xs text-gray-500 shrink-0">Quick add:</span>
      {suggestions.map((recipe) => (
        <button
          key={recipe.id}
          onClick={() => onSelectRecipe?.(recipe)}
          className="shrink-0 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-full hover:bg-purple-50 hover:border-purple-300 transition-colors"
        >
          {recipe.name}
        </button>
      ))}
    </div>
  );
}
