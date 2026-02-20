"use client";

/**
 * Unified Recipe Builder Page
 * Combines the Recipe Builder (ingredient search, preferences) and Recipe Generator
 * (planetary alignment, quick generate, personalization) into a single cohesive interface.
 *
 * Layout:
 *   - Top: Header with Quick Generate controls and planetary status
 *   - Middle: Ingredient Search, Smart Suggestions, Preferences
 *   - Bottom: Generated Recipe Cards (deduplicated)
 *
 * @file src/app/recipe-builder/page.tsx
 */

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import RecipeBuilderPanel from "@/components/recipe-builder/RecipeBuilderPanel";
import type { ElementalProperties } from "@/types/recipe";
import type { MealType, DayOfWeek } from "@/types/menuPlanner";
import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";
import { saveRecipeToStore } from "@/utils/generatedRecipeStore";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import {
  generateDayRecommendations,
  type RecommendedMeal,
  type AstrologicalState,
} from "@/utils/menuPlanner/recommendationBridge";
import { getPlanetaryDayCharacteristics } from "@/utils/planetaryDayRecommendations";
import { createLogger } from "@/utils/logger";

const logger = createLogger("RecipeBuilder");

// ===== Deduplication utility =====

function deduplicateRecipes<T extends { recipe: { name: string } }>(
  recipes: T[],
): T[] {
  const seen = new Set<string>();
  return recipes.filter((r) => {
    const normalized = r.recipe.name
      .toLowerCase()
      .replace(/\s*\(monica enhanced\)\s*/gi, "")
      .replace(/\s*[-_]?\s*(copy|duplicate)\s*\d*\s*$/gi, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

// ===== Element icon helper =====

const getElementIcon = (element: string) => {
  switch (element) {
    case "Fire":
      return "🔥";
    case "Water":
      return "💧";
    case "Earth":
      return "🌍";
    case "Air":
      return "💨";
    default:
      return "⚡";
  }
};

// ===== Quick Generate Section =====

interface QuickGenerateProps {
  onGenerate: (mealType: MealType) => void;
  isGenerating: boolean;
  planetaryInfo: ReturnType<typeof getPlanetaryDayCharacteristics>;
  lunarPhase: string;
}

function QuickGenerateBar({
  onGenerate,
  isGenerating,
  planetaryInfo,
  lunarPhase,
}: QuickGenerateProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Planetary Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {getElementIcon(planetaryInfo.element)}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {planetaryInfo.planet} Day
              </p>
              <p className="text-xs text-gray-500">
                {planetaryInfo.element} Energy
              </p>
            </div>
          </div>

          {lunarPhase && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 rounded-lg">
              <span className="text-xs">🌙</span>
              <span className="text-xs text-purple-700 font-medium">
                {lunarPhase}
              </span>
            </div>
          )}
        </div>

        {/* Quick Generate Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden sm:inline">
            Quick Generate:
          </span>
          {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map(
            (meal) => (
              <button
                key={meal}
                onClick={() => onGenerate(meal)}
                disabled={isGenerating}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200 hover:from-amber-100 hover:to-orange-100 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed capitalize"
              >
                {meal}
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Recipe Results Section =====

interface RecipeResultsProps {
  recipes: RecommendedMeal[];
  isGenerating: boolean;
  hasGenerated: boolean;
  showNutrition: boolean;
  onClear: () => void;
}

function RecipeResults({
  recipes,
  isGenerating,
  hasGenerated,
  showNutrition,
  onClear,
}: RecipeResultsProps) {
  if (isGenerating) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="inline-flex items-center gap-2 text-amber-600">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="font-medium">
            Generating cosmically-aligned recipes...
          </span>
        </div>
      </div>
    );
  }

  if (!hasGenerated) return null;

  if (recipes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-gray-600 mb-3">
          No recipes found matching your criteria.
        </p>
        <button
          onClick={onClear}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
        >
          Clear & Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-800">
            Generated Recipes
          </h3>
          <p className="text-xs text-gray-500">
            {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-gray-500 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
        >
          Clear Results
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {recipes.map((rec, idx) => {
          const nutrition = (rec.recipe as MonicaOptimizedRecipe).nutrition;

          return (
            <div
              key={rec.recipe.id || idx}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 truncate">
                    {rec.recipe.name}
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {rec.recipe.cuisine && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs capitalize">
                        {rec.recipe.cuisine}
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs capitalize">
                      {rec.mealType}
                    </span>
                    {rec.recipe.prepTime && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {rec.recipe.prepTime}
                      </span>
                    )}
                  </div>
                  {rec.recipe.description && (
                    <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">
                      {rec.recipe.description}
                    </p>
                  )}
                </div>

                {/* Scores */}
                <div className="flex flex-col items-end gap-1.5 ml-4 shrink-0">
                  <div className="text-center" title="Overall Score">
                    <div className="text-xl font-bold text-amber-600">
                      {Math.round(rec.score * 100)}
                    </div>
                    <div className="text-xs text-gray-400">Score</div>
                  </div>
                  <div className="flex gap-1.5">
                    <div
                      className="text-center px-1.5 py-0.5 bg-indigo-50 rounded"
                      title="Day Alignment"
                    >
                      <div className="text-xs font-semibold text-indigo-600">
                        {Math.round(rec.dayAlignment * 100)}%
                      </div>
                      <div className="text-[10px] text-indigo-400">Day</div>
                    </div>
                    <div
                      className="text-center px-1.5 py-0.5 bg-purple-50 rounded"
                      title="Planetary Alignment"
                    >
                      <div className="text-xs font-semibold text-purple-600">
                        {Math.round(rec.planetaryAlignment * 100)}%
                      </div>
                      <div className="text-[10px] text-purple-400">Planet</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nutrition */}
              {showNutrition && nutrition && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex flex-wrap gap-3 text-xs">
                    {nutrition.calories !== undefined && (
                      <span>
                        <span className="font-medium">{nutrition.calories}</span>{" "}
                        <span className="text-gray-400">kcal</span>
                      </span>
                    )}
                    {nutrition.protein !== undefined && (
                      <span>
                        <span className="font-medium">{nutrition.protein}g</span>{" "}
                        <span className="text-gray-400">protein</span>
                      </span>
                    )}
                    {nutrition.carbs !== undefined && (
                      <span>
                        <span className="font-medium">{nutrition.carbs}g</span>{" "}
                        <span className="text-gray-400">carbs</span>
                      </span>
                    )}
                    {nutrition.fat !== undefined && (
                      <span>
                        <span className="font-medium">{nutrition.fat}g</span>{" "}
                        <span className="text-gray-400">fat</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Reasons */}
              {rec.reasons.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <ul className="text-xs text-gray-500 space-y-0.5">
                    {rec.reasons.slice(0, 3).map((reason, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <span className="text-green-500">&#x2713;</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Elemental Display */}
              {rec.recipe.elementalProperties && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    {(
                      Object.entries(rec.recipe.elementalProperties) as [
                        string,
                        number,
                      ][]
                    )
                      .filter(([key]) =>
                        ["Fire", "Water", "Earth", "Air"].includes(key),
                      )
                      .map(([element, value]) => (
                        <div
                          key={element}
                          className="flex items-center gap-1"
                        >
                          <span className="text-xs">
                            {getElementIcon(element)}
                          </span>
                          <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                element === "Fire"
                                  ? "bg-red-500"
                                  : element === "Water"
                                    ? "bg-blue-500"
                                    : element === "Earth"
                                      ? "bg-green-600"
                                      : "bg-cyan-400"
                              }`}
                              style={{
                                width: `${(value as number) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {Math.round((value as number) * 100)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* View Full Recipe link */}
              {rec.recipe.id && (
                <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end">
                  <Link
                    href={`/generated-recipe/${rec.recipe.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors text-xs font-medium"
                  >
                    View Full Recipe →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== Main Page =====

export default function RecipeBuilderPage() {
  const astroState = useAstrologicalState();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<RecommendedMeal[]>(
    [],
  );
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showNutrition, setShowNutrition] = useState(true);

  // Current day
  const currentDay = useMemo(() => new Date().getDay() as DayOfWeek, []);

  // Planetary day characteristics
  const planetaryDayInfo = useMemo(
    () => getPlanetaryDayCharacteristics(currentDay),
    [currentDay],
  );

  // Convert hook data to AstrologicalState
  const convertedAstroState: AstrologicalState = useMemo(
    () => ({
      currentZodiac: astroState.currentZodiac || "aries",
      lunarPhase: astroState.lunarPhase || "full",
      activePlanets: astroState.activePlanets || [],
      domElements: astroState.domElements || {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      },
      currentPlanetaryHour: astroState.currentPlanetaryHour || undefined,
    }),
    [astroState],
  );

  // Quick Generate handler
  const handleQuickGenerate = useCallback(
    async (mealType: MealType) => {
      setIsGenerating(true);
      setHasGenerated(true);

      try {
        const recommendations = await generateDayRecommendations(
          currentDay,
          convertedAstroState,
          {
            mealTypes: [mealType],
            dietaryRestrictions: [],
            useCurrentPlanetary: true,
            maxRecipesPerMeal: 15,
            preferredCuisines: [],
            excludeIngredients: [],
          },
        );

        // Deduplicate before setting state
        const deduplicated = deduplicateRecipes(recommendations);
        setGeneratedRecipes(deduplicated);

        // Persist Monica-optimized recipes so the full-recipe page can read them
        deduplicated.forEach((rec) => {
          const monicaRecipe = rec.recipe as MonicaOptimizedRecipe;
          if (monicaRecipe?.id) {
            saveRecipeToStore(monicaRecipe);
          }
        });

        logger.info(
          `Quick generated ${deduplicated.length} recipes for ${mealType}`,
        );
      } catch (err) {
        logger.error("Quick generate failed:", err);
        setGeneratedRecipes([]);
      } finally {
        setIsGenerating(false);
      }
    },
    [currentDay, convertedAstroState],
  );

  const handleClearResults = useCallback(() => {
    setGeneratedRecipes([]);
    setHasGenerated(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-orange-50">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
              Recipe Builder
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Search ingredients, generate recipes, and discover cosmic pairings
            </p>
          </div>
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm text-gray-600"
          >
            &#x2190; Home
          </Link>
        </div>

        {/* Quick Generate Bar */}
        <QuickGenerateBar
          onGenerate={handleQuickGenerate}
          isGenerating={isGenerating}
          planetaryInfo={planetaryDayInfo}
          lunarPhase={astroState.lunarPhase || ""}
        />

        {/* Main Builder Panel (search, preferences, queue, generate button) */}
        <RecipeBuilderPanel />

        {/* Recipe Results */}
        <RecipeResults
          recipes={generatedRecipes}
          isGenerating={isGenerating}
          hasGenerated={hasGenerated}
          showNutrition={showNutrition}
          onClear={handleClearResults}
        />
      </div>
    </div>
  );
}
