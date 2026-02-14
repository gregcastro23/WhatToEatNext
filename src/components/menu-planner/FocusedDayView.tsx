"use client";

/**
 * Focused Day View Component
 * Displays a single day at a time with suggestion carousel for recipe selection
 *
 * @file src/components/menu-planner/FocusedDayView.tsx
 * @created 2026-02-01
 */

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  type TouchEvent as ReactTouchEvent,
} from "react";
import type {
  MealSlot as MealSlotType,
  MealType,
  DayOfWeek,
} from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";
import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";
import {
  getDayName,
  getPlanetaryDayCharacteristics,
  formatDateForDisplay,
} from "@/types/menuPlanner";
import { useMenuPlanner } from "@/contexts/MenuPlannerContext";
import { UnifiedRecipeService } from "@/services/UnifiedRecipeService";
import { searchRecipes, type ScoredRecipe } from "@/utils/recipeSearchEngine";
import { createLogger } from "@/utils/logger";
import { RecipeNutritionQuickView } from "@/components/nutrition/RecipeNutritionQuickView";
import Link from "next/link";

const logger = createLogger("FocusedDayView");

interface FocusedDayViewProps {
  dayOfWeek: DayOfWeek;
  date: Date;
  meals: MealSlotType[];
  onClose: () => void;
  onDayChange: (direction: "prev" | "next") => void;
}

interface MealSuggestion {
  recipe: ScoredRecipe;
  score: number;
  reasons: string[];
}

/**
 * Suggestion Carousel Component
 * Allows swiping through recipe suggestions with mobile touch support
 */
function SuggestionCarousel({
  suggestions,
  currentIndex,
  onIndexChange,
  onSelect,
  isLoading,
}: {
  suggestions: MealSuggestion[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onSelect: (recipe: ScoredRecipe) => void;
  isLoading: boolean;
}) {
  // Touch handling state for swipe gestures
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50; // Minimum distance for a swipe to register

  const handlePrev = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < suggestions.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  // Touch event handlers for swipe navigation
  const onTouchStart = (e: ReactTouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const onTouchMove = (e: ReactTouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left = go to next
      handleNext();
    } else if (isRightSwipe) {
      // Swipe right = go to previous
      handlePrev();
    }

    // Reset touch positions
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-2">✨</div>
          <p className="text-gray-600">Finding perfect suggestions...</p>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl">
        <div className="text-center text-gray-500">
          <p>No suggestions available</p>
          <p className="text-sm mt-1">
            Try generating suggestions or search manually
          </p>
        </div>
      </div>
    );
  }

  const current = suggestions[currentIndex];
  if (!current) return null;

  return (
    <div
      className="relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all ${
          currentIndex === 0
            ? "opacity-30 cursor-not-allowed"
            : "hover:bg-gray-100 hover:scale-110"
        }`}
      >
        ←
      </button>

      <button
        onClick={handleNext}
        disabled={currentIndex === suggestions.length - 1}
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all ${
          currentIndex === suggestions.length - 1
            ? "opacity-30 cursor-not-allowed"
            : "hover:bg-gray-100 hover:scale-110"
        }`}
      >
        →
      </button>

      {/* Recipe Card */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6 mx-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="text-xl font-bold text-gray-800">
              {current.recipe.name}
            </h4>
            {current.recipe.cuisine && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-sm rounded">
                {current.recipe.cuisine}
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {Math.round(current.score * 100)}% match
            </div>
          </div>
        </div>

        {/* Description */}
        {current.recipe.description && (
          <p className="text-gray-600 mb-4 line-clamp-2">
            {current.recipe.description}
          </p>
        )}

        {/* Quick Info */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          {current.recipe.prepTime && (
            <span className="flex items-center gap-1 text-gray-600">
              <span>⏱️</span>
              {current.recipe.prepTime}
            </span>
          )}
          {current.recipe.servingSize && (
            <span className="flex items-center gap-1 text-gray-600">
              <span>🍽️</span>
              {current.recipe.servingSize} servings
            </span>
          )}
          {current.recipe.difficulty != null && (
            <span className="flex items-center gap-1 text-gray-600">
              <span>📊</span>
              {String(current.recipe.difficulty)}
            </span>
          )}
        </div>

        {/* Nutrition Quick View */}
        <div className="mb-4">
          <RecipeNutritionQuickView
            recipe={current.recipe}
            servings={2}
            compact={false}
          />
        </div>

        {/* Ingredients Preview */}
        {current.recipe.ingredients &&
          current.recipe.ingredients.length > 0 && (
            <div className="mb-4">
              <h5 className="font-semibold text-gray-700 mb-2">
                Key Ingredients:
              </h5>
              <div className="flex flex-wrap gap-2">
                {current.recipe.ingredients.slice(0, 6).map((ing, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                  >
                    {ing.name}
                  </span>
                ))}
                {current.recipe.ingredients.length > 6 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 text-sm rounded">
                    +{current.recipe.ingredients.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}

        {/* Why this recipe */}
        {current.reasons.length > 0 && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg">
            <h5 className="font-semibold text-purple-700 mb-1 text-sm">
              Why this recipe?
            </h5>
            <ul className="text-sm text-purple-600 space-y-0.5">
              {current.reasons.slice(0, 3).map((reason, idx) => (
                <li key={idx} className="flex items-center gap-1">
                  <span>✓</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recipe Link */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <Link
            href={`/recipes/${current.recipe.id || encodeURIComponent(current.recipe.name)}`}
            className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1"
          >
            📖 View Full Recipe
          </Link>

          <button
            onClick={() => onSelect(current.recipe as MonicaOptimizedRecipe)}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Select This Recipe
          </button>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {suggestions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onIndexChange(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex
                ? "bg-purple-500 w-4"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="text-center text-sm text-gray-500 mt-2">
        {currentIndex + 1} of {suggestions.length} suggestions
      </div>

      {/* Mobile swipe hint */}
      <div className="text-center text-xs text-gray-400 mt-1 md:hidden">
        Swipe left or right to browse
      </div>
    </div>
  );
}

/**
 * Locked Recipe Display Component
 */
function LockedRecipeCard({
  mealSlot,
  onUnlock,
  onViewDetails,
}: {
  mealSlot: MealSlotType;
  onUnlock: () => void;
  onViewDetails: () => void;
}) {
  const recipe = mealSlot.recipe!;

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-green-400 p-6 relative">
      {/* Locked Badge */}
      <div className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
        <span>🔒</span>
        Locked
      </div>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-xl font-bold text-gray-800">{recipe.name}</h4>
          {recipe.cuisine && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-sm rounded">
              {recipe.cuisine}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Servings: {mealSlot.servings}</span>
        </div>
      </div>

      {recipe.description && (
        <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
      )}

      {/* Quick Info */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        {recipe.prepTime && (
          <span className="flex items-center gap-1 text-gray-600">
            <span>⏱️</span>
            {recipe.prepTime}
          </span>
        )}
        {recipe.nutrition?.calories && (
          <span className="flex items-center gap-1 text-gray-600">
            <span>🔥</span>
            {recipe.nutrition.calories * mealSlot.servings} cal total
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <Link
          href={`/recipes/${recipe.id || encodeURIComponent(recipe.name)}`}
          className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1"
        >
          📖 View Full Recipe
        </Link>

        <div className="flex gap-2">
          <button
            onClick={onViewDetails}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
          >
            Details
          </button>
          <button
            onClick={onUnlock}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-all flex items-center gap-1"
          >
            <span>🔓</span>
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Meal Slot in Focused View
 */
function FocusedMealSlot({
  mealSlot,
  isLocked,
  onLock,
  onUnlock,
  onSelectRecipe,
  onRemoveRecipe,
  suggestions,
  isLoadingSuggestions,
  onGenerateSuggestions,
}: {
  mealSlot: MealSlotType;
  isLocked: boolean;
  onLock: () => void;
  onUnlock: () => void;
  onSelectRecipe: (recipe: ScoredRecipe) => void | Promise<void>;
  onRemoveRecipe: () => void | Promise<void>;
  suggestions: MealSuggestion[];
  isLoadingSuggestions: boolean;
  onGenerateSuggestions: () => void | Promise<void>;
}) {
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const hasRecipe = !!mealSlot.recipe;

  const mealTypeIcons: Record<MealType, string> = {
    breakfast: "🌅",
    lunch: "☀️",
    dinner: "🌙",
    snack: "🍎",
  };

  const mealTypeColors: Record<
    MealType,
    { bg: string; border: string; text: string }
  > = {
    breakfast: {
      bg: "bg-orange-50",
      border: "border-orange-300",
      text: "text-orange-700",
    },
    lunch: {
      bg: "bg-blue-50",
      border: "border-blue-300",
      text: "text-blue-700",
    },
    dinner: {
      bg: "bg-purple-50",
      border: "border-purple-300",
      text: "text-purple-700",
    },
    snack: {
      bg: "bg-green-50",
      border: "border-green-300",
      text: "text-green-700",
    },
  };

  const colors = mealTypeColors[mealSlot.mealType];

  return (
    <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} p-4`}>
      {/* Meal Type Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{mealTypeIcons[mealSlot.mealType]}</span>
          <h3 className={`text-lg font-bold capitalize ${colors.text}`}>
            {mealSlot.mealType}
          </h3>
        </div>

        {hasRecipe && !isLocked && (
          <div className="flex gap-2">
            <button
              onClick={onLock}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-all flex items-center gap-1"
            >
              <span>🔒</span>
              Lock In
            </button>
            <button
              onClick={onRemoveRecipe}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {hasRecipe && isLocked ? (
        <LockedRecipeCard
          mealSlot={mealSlot}
          onUnlock={onUnlock}
          onViewDetails={() => {}}
        />
      ) : hasRecipe ? (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-800">
              {mealSlot.recipe!.name}
            </h4>
            <span className="text-sm text-gray-500">
              Servings: {mealSlot.servings}
            </span>
          </div>
          {mealSlot.recipe!.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {mealSlot.recipe!.description}
            </p>
          )}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <RecipeNutritionQuickView
              recipe={mealSlot.recipe!}
              servings={mealSlot.servings}
              compact
            />
          </div>
        </div>
      ) : (
        <div>
          {/* Generate Suggestions Button */}
          {suggestions.length === 0 && !isLoadingSuggestions && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                No recipe selected for this meal
              </p>
              <button
                onClick={onGenerateSuggestions}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                ✨ Generate Suggestions
              </button>
            </div>
          )}

          {/* Suggestion Carousel */}
          {(suggestions.length > 0 || isLoadingSuggestions) && (
            <SuggestionCarousel
              suggestions={suggestions}
              currentIndex={suggestionIndex}
              onIndexChange={setSuggestionIndex}
              onSelect={onSelectRecipe}
              isLoading={isLoadingSuggestions}
            />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Main Focused Day View Component
 */
export default function FocusedDayView({
  dayOfWeek,
  date,
  meals,
  onClose,
  onDayChange,
}: FocusedDayViewProps) {
  const { addMealToSlot, removeMealFromSlot, lockMeal, unlockMeal } =
    useMenuPlanner();
  const [suggestions, setSuggestions] = useState<
    Record<MealType, MealSuggestion[]>
  >({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });
  const [loadingMealType, setLoadingMealType] = useState<MealType | null>(null);

  const characteristics = getPlanetaryDayCharacteristics(dayOfWeek);

  // Generate suggestions for a specific meal type
  const generateSuggestions = useCallback(
    async (mealType: MealType) => {
      setLoadingMealType(mealType);

      try {
        const service = UnifiedRecipeService.getInstance();
        const allRecipes =
          (await service.getAllRecipes()) as unknown as Recipe[];

        // Search for recipes matching this meal type and day
        const results = searchRecipes(allRecipes, {
          mealType: [mealType],
          planetaryDay: dayOfWeek,
          limit: 10,
        });

        // Map to suggestions with reasons
        const mealSuggestions: MealSuggestion[] = results.map((recipe) => ({
          recipe,
          score: recipe.searchScore / 100,
          reasons: generateReasons(recipe, mealType, dayOfWeek),
        }));

        setSuggestions((prev) => ({
          ...prev,
          [mealType]: mealSuggestions,
        }));

        logger.info(
          `Generated ${mealSuggestions.length} suggestions for ${mealType}`,
        );
      } catch (err) {
        logger.error(`Failed to generate suggestions for ${mealType}:`, err);
      } finally {
        setLoadingMealType(null);
      }
    },
    [dayOfWeek],
  );

  // Generate reasons for why a recipe was suggested
  const generateReasons = (
    recipe: ScoredRecipe,
    mealType: MealType,
    day: DayOfWeek,
  ): string[] => {
    const reasons: string[] = [];

    // Meal type alignment
    if (recipe.mealType) {
      const types = Array.isArray(recipe.mealType)
        ? recipe.mealType
        : [recipe.mealType];
      if (types.map((t) => t.toLowerCase()).includes(mealType)) {
        reasons.push(`Perfect for ${mealType}`);
      }
    }

    // Planetary alignment
    const planet = characteristics.planet;
    if (recipe.elementalProperties) {
      if (planet === "Sun" && recipe.elementalProperties.Fire > 0.3) {
        reasons.push("Fire-aligned for Sun's day");
      }
      if (planet === "Moon" && recipe.elementalProperties.Water > 0.3) {
        reasons.push("Water-aligned for Moon's day");
      }
    }

    // Nutritional reasons
    if (recipe.nutrition) {
      if (
        mealType === "breakfast" &&
        recipe.nutrition.calories &&
        recipe.nutrition.calories < 400
      ) {
        reasons.push("Light and energizing start");
      }
      if (recipe.nutrition.protein && recipe.nutrition.protein > 20) {
        reasons.push("High protein content");
      }
      if (recipe.nutrition.fiber && recipe.nutrition.fiber > 5) {
        reasons.push("Good fiber content");
      }
    }

    // Cuisine variety
    if (recipe.cuisine) {
      reasons.push(`${recipe.cuisine} cuisine`);
    }

    // Prep time
    if (recipe.prepTime) {
      reasons.push(`Ready in ${recipe.prepTime}`);
    }

    return reasons.slice(0, 4);
  };

  // Handle recipe selection
  const handleSelectRecipe = async (
    mealType: MealType,
    recipe: ScoredRecipe,
  ) => {
    // Cast recipe to MonicaOptimizedRecipe, asserting that Monica properties will be available or handled downstream
    await addMealToSlot(dayOfWeek, mealType, recipe as MonicaOptimizedRecipe, 2);
  };

  // Handle locking/unlocking - uses context for persistence
  const handleLock = (mealSlotId: string) => {
    lockMeal(mealSlotId);
  };

  const handleUnlock = (mealSlotId: string) => {
    unlockMeal(mealSlotId);
  };

  // Count locked meals for display
  const lockedMealCount = useMemo(() => {
    return meals.filter((m) => m.isLocked).length;
  }, [meals]);

  // Sort meals by type
  const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
  const sortedMeals = mealTypes
    .map((type) => meals.find((m) => m.mealType === type))
    .filter((m): m is MealSlotType => !!m);

  // Planetary symbols
  const planetSymbols: Record<string, string> = {
    Sun: "☉",
    Moon: "☽",
    Mars: "♂",
    Mercury: "☿",
    Jupiter: "♃",
    Venus: "♀",
    Saturn: "♄",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Previous Day Button */}
              <button
                onClick={() => onDayChange("prev")}
                className="w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all"
              >
                ←
              </button>

              <div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {planetSymbols[characteristics.planet]}
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {getDayName(dayOfWeek)}
                    </h2>
                    <p className="text-purple-200">
                      {formatDateForDisplay(date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Day Button */}
              <button
                onClick={() => onDayChange("next")}
                className="w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all"
              >
                →
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all text-xl"
            >
              ×
            </button>
          </div>

          {/* Planetary Guidance */}
          <div className="mt-4 p-3 bg-white bg-opacity-10 rounded-lg">
            <p className="text-sm">
              <span className="font-semibold">
                {characteristics.planet} Day:
              </span>{" "}
              {characteristics.mealGuidance}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {sortedMeals.map((mealSlot) => (
            <FocusedMealSlot
              key={mealSlot.id}
              mealSlot={mealSlot}
              isLocked={mealSlot.isLocked ?? false}
              onLock={() => handleLock(mealSlot.id)}
              onUnlock={() => handleUnlock(mealSlot.id)}
              onSelectRecipe={(recipe) =>
                handleSelectRecipe(mealSlot.mealType, recipe)
              }
              onRemoveRecipe={() => removeMealFromSlot(mealSlot.id)}
              suggestions={suggestions[mealSlot.mealType]}
              isLoadingSuggestions={loadingMealType === mealSlot.mealType}
              onGenerateSuggestions={() =>
                generateSuggestions(mealSlot.mealType)
              }
            />
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-white flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {lockedMealCount > 0 && (
              <span className="flex items-center gap-1">
                <span>🔒</span>
                {lockedMealCount} meal{lockedMealCount !== 1 ? "s" : ""} locked
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
