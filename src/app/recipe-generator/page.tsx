"use client";

/**
 * Recipe Generator Page
 * Interactive recipe generation with planetary alignment, user chart personalization,
 * and nutritional tracking
 *
 * @file src/app/recipe-generator/page.tsx
 * @created 2026-02-01
 * @updated 2026-02-03 - Added user chart personalization and nutritional integration
 */

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import type { Recipe, ElementalProperties } from "@/types/recipe";
import type { MealType, DayOfWeek } from "@/types/menuPlanner";
import type { NatalChart, ChartComparison } from "@/types/natalChart";
import { UnifiedRecipeService } from "@/services/UnifiedRecipeService";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import { useUser } from "@/contexts/UserContext";
import { ChartComparisonService } from "@/services/ChartComparisonService";
import { PersonalizedRecommendationService } from "@/services/PersonalizedRecommendationService";
import {
  generateDayRecommendations,
  type RecommendedMeal,
  type AstrologicalState,
} from "@/utils/menuPlanner/recommendationBridge";
import { getPlanetaryDayCharacteristics } from "@/utils/planetaryDayRecommendations";
import { createLogger } from "@/utils/logger";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const logger = createLogger("RecipeGenerator");

// Tab types - added "personal" tab
type TabId = "filters" | "preferences" | "planetary" | "personal" | "results";

// Filter state interface
interface GeneratorFilters {
  mealTypes: MealType[];
  cuisines: string[];
  dietaryRestrictions: string[];
  excludedIngredients: string[];
  maxPrepTime: number | null;
  skillLevel: "any" | "beginner" | "intermediate" | "advanced";
}

// Planetary preferences
interface PlanetaryPreferences {
  useCurrentPlanetary: boolean;
  selectedDay: DayOfWeek | "current";
  elementalFocus: keyof ElementalProperties | "balanced";
}

// Personalization preferences
interface PersonalizationPreferences {
  useNatalChart: boolean;
  prioritizeHarmony: boolean;
  showNutrition: boolean;
}

// Extended recipe with personalization data
interface PersonalizedRecipeMeal extends RecommendedMeal {
  personalizedScore?: number;
  personalizationBoost?: number;
  chartHarmony?: number;
  nutritionSummary?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
}

// Available cuisines from the codebase
const CUISINE_OPTIONS = [
  "Italian",
  "Mexican",
  "Japanese",
  "Chinese",
  "Indian",
  "Thai",
  "Mediterranean",
  "French",
  "American",
  "Middle-Eastern",
  "Korean",
  "Vietnamese",
  "Greek",
  "Spanish",
];

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Low-Carb",
  "Keto",
  "Paleo",
];

const DAY_NAMES: Record<DayOfWeek, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

// Element icons helper
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

/**
 * Get planetary info for a given day
 */
function getPlanetaryInfo(day: DayOfWeek) {
  return getPlanetaryDayCharacteristics(day);
}

/**
 * Extract nutrition summary from recipe
 */
function extractNutritionSummary(recipe: Recipe) {
  const nutrition = recipe.nutrition;
  if (!nutrition) return undefined;

  return {
    calories: nutrition.calories,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fat: nutrition.fat,
    fiber: nutrition.fiber,
  };
}

/**
 * Recipe Generator Content Component
 */
function RecipeGeneratorContent() {
  const astroState = useAstrologicalState();
  const { currentUser } = useUser();

  const [activeTab, setActiveTab] = useState<TabId>("filters");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<
    PersonalizedRecipeMeal[]
  >([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  // User chart data
  const [chartComparison, setChartComparison] =
    useState<ChartComparison | null>(null);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<GeneratorFilters>({
    mealTypes: ["dinner"],
    cuisines: [],
    dietaryRestrictions: [],
    excludedIngredients: [],
    maxPrepTime: null,
    skillLevel: "any",
  });

  // Planetary preferences
  const [planetaryPrefs, setPlanetaryPrefs] = useState<PlanetaryPreferences>({
    useCurrentPlanetary: true,
    selectedDay: "current",
    elementalFocus: "balanced",
  });

  // Personalization preferences
  const [personalPrefs, setPersonalPrefs] =
    useState<PersonalizationPreferences>({
      useNatalChart: true,
      prioritizeHarmony: true,
      showNutrition: true,
    });

  // Get user's natal chart
  const natalChart: NatalChart | null = useMemo(() => {
    return currentUser?.natalChart || null;
  }, [currentUser?.natalChart]);

  // Load all recipes on mount
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const service = UnifiedRecipeService.getInstance();
        const recipes = (await service.getAllRecipes()) as unknown as Recipe[];
        setAllRecipes(recipes);
        logger.info(`Loaded ${recipes.length} recipes`);
      } catch (err) {
        logger.error("Failed to load recipes:", err);
      }
    };
    loadRecipes();
  }, []);

  // Load chart comparison when natal chart is available
  useEffect(() => {
    const loadChartComparison = async () => {
      if (!natalChart) {
        setChartComparison(null);
        return;
      }

      setIsLoadingChart(true);
      setChartError(null);

      try {
        const chartService = ChartComparisonService.getInstance();
        const comparison = await chartService.compareCharts(natalChart);
        setChartComparison(comparison);
        logger.info("Chart comparison loaded", {
          harmony: comparison.overallHarmony,
        });
      } catch (err) {
        logger.error("Failed to load chart comparison:", err);
        setChartError("Could not calculate chart comparison");
      } finally {
        setIsLoadingChart(false);
      }
    };

    loadChartComparison();
  }, [natalChart]);

  // Current day of week
  const currentDay = useMemo(() => new Date().getDay() as DayOfWeek, []);

  // Selected day for planetary calculations
  const selectedDay = useMemo(
    () =>
      planetaryPrefs.selectedDay === "current"
        ? currentDay
        : planetaryPrefs.selectedDay,
    [planetaryPrefs.selectedDay, currentDay]
  );

  // Planetary day characteristics
  const planetaryDayInfo = useMemo(
    () => getPlanetaryInfo(selectedDay),
    [selectedDay]
  );

  // Convert hook data to AstrologicalState for recommendation bridge
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
    [astroState]
  );

  // Generate recipes based on filters with personalization
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setHasGenerated(true);

    try {
      // Use the recommendation bridge to generate recipes
      const recommendations = await generateDayRecommendations(
        selectedDay,
        convertedAstroState,
        {
          mealTypes:
            filters.mealTypes.length > 0 ? filters.mealTypes : ["dinner"],
          dietaryRestrictions: filters.dietaryRestrictions.map((d) =>
            d.toLowerCase()
          ),
          useCurrentPlanetary: planetaryPrefs.useCurrentPlanetary,
          maxRecipesPerMeal: 15,
          preferredCuisines: filters.cuisines,
          excludeIngredients: filters.excludedIngredients,
        }
      );

      // Apply additional filtering (prep time, skill level)
      let filtered = recommendations;

      if (filters.maxPrepTime) {
        filtered = filtered.filter((rec) => {
          const prepTime =
            typeof rec.recipe.prepTime === "string"
              ? parseInt(rec.recipe.prepTime.match(/\d+/)?.[0] || "999", 10)
              : rec.recipe.prepTime || 0;
          return prepTime <= (filters.maxPrepTime || 999);
        });
      }

      // Apply personalization if natal chart is available
      let personalizedResults: PersonalizedRecipeMeal[] = filtered.map(
        (rec) => ({
          ...rec,
          nutritionSummary: extractNutritionSummary(rec.recipe),
        })
      );

      if (
        personalPrefs.useNatalChart &&
        natalChart &&
        chartComparison
      ) {
        try {
          const personalizationService =
            PersonalizedRecommendationService.getInstance();

          // Convert recipes to recommendable items
          const items = filtered.map((rec) => ({
            id: rec.recipe.id,
            name: rec.recipe.name,
            elementalProperties: rec.recipe.elementalProperties || {
              Fire: 0.25,
              Water: 0.25,
              Earth: 0.25,
              Air: 0.25,
            },
            alchemicalProperties: (rec.recipe as any).alchemicalProperties || {
              Spirit: 0,
              Essence: 0,
              Matter: 0,
              Substance: 0,
            },
            baseScore: rec.score,
          }));

          const personalized = await personalizationService.scoreItems(items, {
            natalChart,
            chartComparison,
            includeReasons: true,
          });

          // Merge personalization data back into results
          personalizedResults = filtered.map((rec) => {
            const personalData = personalized.find((p) => p.id === rec.recipe.id);
            return {
              ...rec,
              personalizedScore: personalData?.personalizedScore || rec.score,
              personalizationBoost: personalData?.personalizationBoost || 1,
              chartHarmony: chartComparison.overallHarmony,
              nutritionSummary: extractNutritionSummary(rec.recipe),
              reasons: [
                ...rec.reasons,
                ...(personalData?.reasons || []).slice(0, 2),
              ],
            };
          });

          // Sort by personalized score if prioritizing harmony
          if (personalPrefs.prioritizeHarmony) {
            personalizedResults.sort(
              (a, b) =>
                (b.personalizedScore || b.score) -
                (a.personalizedScore || a.score)
            );
          }
        } catch (err) {
          logger.error("Personalization failed, using base scores:", err);
        }
      } else {
        // Sort by planetary alignment score
        personalizedResults.sort(
          (a, b) => b.planetaryAlignment - a.planetaryAlignment
        );
      }

      setGeneratedRecipes(personalizedResults);
      setActiveTab("results");

      logger.info(`Generated ${personalizedResults.length} recipe recommendations`);
    } catch (err) {
      logger.error("Failed to generate recipes:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [
    selectedDay,
    convertedAstroState,
    filters,
    planetaryPrefs.useCurrentPlanetary,
    personalPrefs.useNatalChart,
    personalPrefs.prioritizeHarmony,
    natalChart,
    chartComparison,
  ]);

  // Toggle meal type
  const toggleMealType = (mealType: MealType) => {
    setFilters((prev) => ({
      ...prev,
      mealTypes: prev.mealTypes.includes(mealType)
        ? prev.mealTypes.filter((m) => m !== mealType)
        : [...prev.mealTypes, mealType],
    }));
  };

  // Toggle cuisine
  const toggleCuisine = (cuisine: string) => {
    setFilters((prev) => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter((c) => c !== cuisine)
        : [...prev.cuisines, cuisine],
    }));
  };

  // Toggle dietary restriction
  const toggleDietary = (dietary: string) => {
    setFilters((prev) => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(dietary)
        ? prev.dietaryRestrictions.filter((d) => d !== dietary)
        : [...prev.dietaryRestrictions, dietary],
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      mealTypes: ["dinner"],
      cuisines: [],
      dietaryRestrictions: [],
      excludedIngredients: [],
      maxPrepTime: null,
      skillLevel: "any",
    });
    setPlanetaryPrefs({
      useCurrentPlanetary: true,
      selectedDay: "current",
      elementalFocus: "balanced",
    });
    setPersonalPrefs({
      useNatalChart: true,
      prioritizeHarmony: true,
      showNutrition: true,
    });
    setGeneratedRecipes([]);
    setHasGenerated(false);
  };

  // Tab definitions - added personal tab
  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: "filters", label: "Filters", icon: "🔍" },
    { id: "preferences", label: "Preferences", icon: "⚙️" },
    { id: "planetary", label: "Planetary", icon: "🌟" },
    { id: "personal", label: "Personal", icon: "👤" },
    { id: "results", label: "Results", icon: "📋" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-purple-50 via-pink-50 to-blue-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Recipe Generator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Generate recipes aligned with planetary energies
                {natalChart && " and your birth chart"}
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Status Bar */}
          <div className="bg-white rounded-xl shadow-md p-4 mt-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Planetary Day */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {getElementIcon(planetaryDayInfo.element)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {planetaryDayInfo.planet} Day
                  </p>
                  <p className="text-xs text-gray-500">
                    {planetaryDayInfo.element} Element
                  </p>
                </div>
              </div>

              {/* Lunar Phase */}
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-lg">
                <span className="text-sm">🌙</span>
                <span className="text-sm text-purple-700">
                  {astroState.lunarPhase || "Waxing"}
                </span>
              </div>

              {/* Planetary Hour */}
              {astroState.currentPlanetaryHour && (
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-lg">
                  <span className="text-sm">⏰</span>
                  <span className="text-sm text-amber-700">
                    {astroState.currentPlanetaryHour} Hour
                  </span>
                </div>
              )}

              {/* Chart Harmony (if available) */}
              {chartComparison && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-lg">
                  <span className="text-sm">✨</span>
                  <span className="text-sm text-green-700">
                    {Math.round(chartComparison.overallHarmony * 100)}% Harmony
                  </span>
                </div>
              )}

              {/* Recipe Count */}
              <div className="ml-auto">
                <span className="text-xs text-gray-500">
                  {allRecipes.length} recipes available
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[80px] px-4 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? "text-amber-700 border-b-2 border-amber-600 bg-amber-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.id === "results" && generatedRecipes.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-amber-600 text-white rounded-full">
                    {generatedRecipes.length}
                  </span>
                )}
                {tab.id === "personal" && natalChart && (
                  <span className="ml-1 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Filters Tab */}
            {activeTab === "filters" && (
              <div className="space-y-6">
                {/* Meal Types */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Meal Type
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(
                      ["breakfast", "lunch", "dinner", "snack"] as MealType[]
                    ).map((mealType) => (
                      <button
                        key={mealType}
                        onClick={() => toggleMealType(mealType)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          filters.mealTypes.includes(mealType)
                            ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cuisines */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Cuisine Preferences
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {CUISINE_OPTIONS.map((cuisine) => (
                      <button
                        key={cuisine}
                        onClick={() => toggleCuisine(cuisine)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          filters.cuisines.includes(cuisine)
                            ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {cuisine}
                      </button>
                    ))}
                  </div>
                  {filters.cuisines.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      No preference - all cuisines will be included
                    </p>
                  )}
                </div>

                {/* Dietary Restrictions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Dietary Restrictions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map((dietary) => (
                      <button
                        key={dietary}
                        onClick={() => toggleDietary(dietary)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          filters.dietaryRestrictions.includes(dietary)
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {dietary}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div className="space-y-6">
                {/* Max Prep Time */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Maximum Prep Time
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: null, label: "Any" },
                      { value: 15, label: "15 min" },
                      { value: 30, label: "30 min" },
                      { value: 45, label: "45 min" },
                      { value: 60, label: "1 hour" },
                      { value: 90, label: "1.5 hours" },
                    ].map((option) => (
                      <button
                        key={option.label}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            maxPrepTime: option.value,
                          }))
                        }
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          filters.maxPrepTime === option.value
                            ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skill Level */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Skill Level
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { value: "any", label: "Any Level" },
                        { value: "beginner", label: "Beginner" },
                        { value: "intermediate", label: "Intermediate" },
                        { value: "advanced", label: "Advanced" },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            skillLevel: option.value,
                          }))
                        }
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          filters.skillLevel === option.value
                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Excluded Ingredients */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Exclude Ingredients
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type ingredient and press Enter..."
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const input = e.target as HTMLInputElement;
                          const value = input.value.trim();
                          if (
                            value &&
                            !filters.excludedIngredients.includes(value)
                          ) {
                            setFilters((prev) => ({
                              ...prev,
                              excludedIngredients: [
                                ...prev.excludedIngredients,
                                value,
                              ],
                            }));
                            input.value = "";
                          }
                        }
                      }}
                    />
                  </div>
                  {filters.excludedIngredients.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {filters.excludedIngredients.map((ing) => (
                        <span
                          key={ing}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm"
                        >
                          {ing}
                          <button
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                excludedIngredients:
                                  prev.excludedIngredients.filter(
                                    (i) => i !== ing
                                  ),
                              }))
                            }
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Show Nutrition Toggle */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={personalPrefs.showNutrition}
                      onChange={(e) =>
                        setPersonalPrefs((prev) => ({
                          ...prev,
                          showNutrition: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <p className="font-medium text-gray-800">
                        Show Nutritional Information
                      </p>
                      <p className="text-sm text-gray-500">
                        Display calories, protein, carbs for each recipe
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Planetary Tab */}
            {activeTab === "planetary" && (
              <div className="space-y-6">
                {/* Use Current Planetary */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={planetaryPrefs.useCurrentPlanetary}
                      onChange={(e) =>
                        setPlanetaryPrefs((prev) => ({
                          ...prev,
                          useCurrentPlanetary: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <p className="font-medium text-gray-800">
                        Use Current Planetary Alignment
                      </p>
                      <p className="text-sm text-gray-500">
                        Consider real-time planetary positions for
                        recommendations
                      </p>
                    </div>
                  </label>
                </div>

                {/* Day Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Planetary Day
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() =>
                        setPlanetaryPrefs((prev) => ({
                          ...prev,
                          selectedDay: "current",
                        }))
                      }
                      className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                        planetaryPrefs.selectedDay === "current"
                          ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Today ({DAY_NAMES[currentDay]})
                    </button>
                    {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => {
                      const info = getPlanetaryInfo(day);
                      return (
                        <button
                          key={day}
                          onClick={() =>
                            setPlanetaryPrefs((prev) => ({
                              ...prev,
                              selectedDay: day,
                            }))
                          }
                          className={`px-4 py-3 rounded-lg font-medium text-sm transition-all flex flex-col items-center ${
                            planetaryPrefs.selectedDay === day
                              ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <span>{DAY_NAMES[day]}</span>
                          <span className="text-xs opacity-75">
                            {info.planet}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Elemental Focus */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Elemental Focus
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { value: "balanced", label: "Balanced", icon: "⚖️" },
                        { value: "Fire", label: "Fire", icon: "🔥" },
                        { value: "Water", label: "Water", icon: "💧" },
                        { value: "Earth", label: "Earth", icon: "🌍" },
                        { value: "Air", label: "Air", icon: "💨" },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setPlanetaryPrefs((prev) => ({
                            ...prev,
                            elementalFocus: option.value,
                          }))
                        }
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                          planetaryPrefs.elementalFocus === option.value
                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Planetary Day Info Panel */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                  <h4 className="font-bold text-indigo-800 mb-4 text-lg">
                    {planetaryDayInfo.planet} Day Characteristics
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-indigo-700 mb-2">
                        Recommended Cuisines
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {planetaryDayInfo.recommendedCuisines.map((cuisine) => (
                          <span
                            key={cuisine}
                            className="px-2 py-0.5 bg-white text-indigo-600 rounded text-xs"
                          >
                            {cuisine}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-indigo-700 mb-2">
                        Recommended Cooking Methods
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {planetaryDayInfo.cookingMethods
                          .slice(0, 5)
                          .map((method) => (
                            <span
                              key={method}
                              className="px-2 py-0.5 bg-white text-purple-600 rounded text-xs"
                            >
                              {method}
                            </span>
                          ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-indigo-700 mb-2">
                        Element & Energy
                      </p>
                      <p className="text-sm text-indigo-600">
                        {planetaryDayInfo.element} -{" "}
                        {planetaryDayInfo.characteristics}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-indigo-700 mb-2">
                        Nutritional Emphasis
                      </p>
                      <p className="text-sm text-indigo-600 capitalize">
                        {planetaryDayInfo.nutritionalEmphasis}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Tab (NEW) */}
            {activeTab === "personal" && (
              <div className="space-y-6">
                {!natalChart ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-5xl mb-4">🌟</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Unlock Personalized Recommendations
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Complete your profile with birth data to get recipes
                      aligned with your personal cosmic blueprint.
                    </p>
                    <Link
                      href="/onboarding"
                      className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Complete Your Profile
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Chart Status */}
                    {isLoadingChart ? (
                      <div className="text-center py-8">
                        <LoadingSpinner size="lg" message="Calculating cosmic alignment..." />
                      </div>
                    ) : chartError ? (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {chartError}
                      </div>
                    ) : chartComparison ? (
                      <>
                        {/* Harmony Overview */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-green-800 text-lg">
                              Your Cosmic Harmony
                            </h4>
                            <div className="text-3xl font-bold text-green-600">
                              {Math.round(chartComparison.overallHarmony * 100)}%
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-white rounded-lg">
                              <div className="text-lg font-semibold text-blue-600">
                                {Math.round(chartComparison.elementalHarmony * 100)}%
                              </div>
                              <div className="text-xs text-gray-500">Elemental</div>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg">
                              <div className="text-lg font-semibold text-purple-600">
                                {Math.round(chartComparison.alchemicalAlignment * 100)}%
                              </div>
                              <div className="text-xs text-gray-500">Alchemical</div>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg">
                              <div className="text-lg font-semibold text-amber-600">
                                {Math.round(chartComparison.planetaryResonance * 100)}%
                              </div>
                              <div className="text-xs text-gray-500">Planetary</div>
                            </div>
                          </div>

                          {/* Insights */}
                          {chartComparison.insights && (
                            <div className="space-y-3">
                              {/* Favorable Elements */}
                              <div>
                                <p className="text-sm font-medium text-green-700 mb-1">
                                  Favorable Elements Today
                                </p>
                                <div className="flex gap-2">
                                  {chartComparison.insights.favorableElements.map(
                                    (el) => (
                                      <span
                                        key={el}
                                        className="px-3 py-1 bg-white text-green-700 rounded-lg text-sm flex items-center gap-1"
                                      >
                                        {getElementIcon(el)} {el}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>

                              {/* Harmonic Planets */}
                              {chartComparison.insights.harmonicPlanets &&
                                chartComparison.insights.harmonicPlanets.length >
                                  0 && (
                                  <div>
                                    <p className="text-sm font-medium text-green-700 mb-1">
                                      Harmonic Planets
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {chartComparison.insights.harmonicPlanets.map(
                                        (planet) => (
                                          <span
                                            key={planet}
                                            className="px-2 py-0.5 bg-white text-purple-600 rounded text-xs"
                                          >
                                            {planet}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}
                        </div>

                        {/* Personalization Settings */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-800">
                            Personalization Settings
                          </h3>

                          <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg">
                            <input
                              type="checkbox"
                              checked={personalPrefs.useNatalChart}
                              onChange={(e) =>
                                setPersonalPrefs((prev) => ({
                                  ...prev,
                                  useNatalChart: e.target.checked,
                                }))
                              }
                              className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <div>
                              <p className="font-medium text-gray-800">
                                Use My Birth Chart
                              </p>
                              <p className="text-sm text-gray-500">
                                Personalize recipes based on your natal chart
                              </p>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg">
                            <input
                              type="checkbox"
                              checked={personalPrefs.prioritizeHarmony}
                              onChange={(e) =>
                                setPersonalPrefs((prev) => ({
                                  ...prev,
                                  prioritizeHarmony: e.target.checked,
                                }))
                              }
                              className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <div>
                              <p className="font-medium text-gray-800">
                                Prioritize Chart Harmony
                              </p>
                              <p className="text-sm text-gray-500">
                                Sort results by how well they match your chart
                              </p>
                            </div>
                          </label>
                        </div>

                        {/* Recommended Based on Chart */}
                        {chartComparison.insights?.recommendations &&
                          chartComparison.insights.recommendations.length > 0 && (
                            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                              <h4 className="font-semibold text-purple-800 mb-2">
                                Cosmic Insights
                              </h4>
                              <ul className="space-y-1">
                                {chartComparison.insights.recommendations
                                  .slice(0, 3)
                                  .map((rec, i) => (
                                    <li
                                      key={i}
                                      className="text-sm text-purple-700 flex items-start gap-2"
                                    >
                                      <span className="text-purple-400">✦</span>
                                      {rec}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}
                      </>
                    ) : null}
                  </>
                )}
              </div>
            )}

            {/* Results Tab */}
            {activeTab === "results" && (
              <div>
                {!hasGenerated ? (
                  <div className="text-center py-12">
                    <p className="text-lg text-gray-600 mb-4">
                      Configure your preferences and generate recipes
                    </p>
                    <button
                      onClick={handleGenerate}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Generate Recipes
                    </button>
                  </div>
                ) : generatedRecipes.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-lg text-gray-600 mb-4">
                      No recipes found matching your criteria
                    </p>
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          Found {generatedRecipes.length} recipes
                        </p>
                        {natalChart && personalPrefs.useNatalChart && (
                          <p className="text-xs text-purple-600">
                            ✨ Personalized for your birth chart
                          </p>
                        )}
                      </div>
                      <button
                        onClick={resetFilters}
                        className="text-sm text-amber-600 hover:text-amber-700"
                      >
                        Clear Results
                      </button>
                    </div>

                    {generatedRecipes.map((rec, idx) => (
                      <div
                        key={rec.recipe.id || idx}
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-800">
                              {rec.recipe.name}
                            </h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {rec.recipe.cuisine && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                  {rec.recipe.cuisine}
                                </span>
                              )}
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                                {rec.mealType}
                              </span>
                              {rec.recipe.prepTime && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                  {rec.recipe.prepTime}
                                </span>
                              )}
                              {rec.personalizationBoost &&
                                rec.personalizationBoost > 1.05 && (
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                    ✨ +
                                    {Math.round(
                                      (rec.personalizationBoost - 1) * 100
                                    )}
                                    % personal match
                                  </span>
                                )}
                            </div>
                            {rec.recipe.description && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {rec.recipe.description}
                              </p>
                            )}
                          </div>

                          {/* Scores */}
                          <div className="flex flex-col items-end gap-2 ml-4">
                            <div className="text-center" title="Overall Score">
                              <div className="text-2xl font-bold text-amber-600">
                                {Math.round(
                                  (rec.personalizedScore || rec.score) * 100
                                )}
                              </div>
                              <div className="text-xs text-gray-500">Score</div>
                            </div>
                            <div className="flex gap-2">
                              <div
                                className="text-center px-2 py-1 bg-indigo-50 rounded"
                                title="Day Alignment"
                              >
                                <div className="text-sm font-semibold text-indigo-600">
                                  {Math.round(rec.dayAlignment * 100)}%
                                </div>
                                <div className="text-xs text-indigo-400">
                                  Day
                                </div>
                              </div>
                              <div
                                className="text-center px-2 py-1 bg-purple-50 rounded"
                                title="Planetary Alignment"
                              >
                                <div className="text-sm font-semibold text-purple-600">
                                  {Math.round(rec.planetaryAlignment * 100)}%
                                </div>
                                <div className="text-xs text-purple-400">
                                  Planetary
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Nutrition Summary */}
                        {personalPrefs.showNutrition && rec.nutritionSummary && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex flex-wrap gap-4 text-xs">
                              {rec.nutritionSummary.calories !== undefined && (
                                <div className="flex items-center gap-1">
                                  <span className="text-orange-500">🔥</span>
                                  <span className="font-medium">
                                    {rec.nutritionSummary.calories}
                                  </span>
                                  <span className="text-gray-400">kcal</span>
                                </div>
                              )}
                              {rec.nutritionSummary.protein !== undefined && (
                                <div className="flex items-center gap-1">
                                  <span className="text-red-500">💪</span>
                                  <span className="font-medium">
                                    {rec.nutritionSummary.protein}g
                                  </span>
                                  <span className="text-gray-400">protein</span>
                                </div>
                              )}
                              {rec.nutritionSummary.carbs !== undefined && (
                                <div className="flex items-center gap-1">
                                  <span className="text-amber-500">🌾</span>
                                  <span className="font-medium">
                                    {rec.nutritionSummary.carbs}g
                                  </span>
                                  <span className="text-gray-400">carbs</span>
                                </div>
                              )}
                              {rec.nutritionSummary.fat !== undefined && (
                                <div className="flex items-center gap-1">
                                  <span className="text-yellow-500">🧈</span>
                                  <span className="font-medium">
                                    {rec.nutritionSummary.fat}g
                                  </span>
                                  <span className="text-gray-400">fat</span>
                                </div>
                              )}
                              {rec.nutritionSummary.fiber !== undefined && (
                                <div className="flex items-center gap-1">
                                  <span className="text-green-500">🥬</span>
                                  <span className="font-medium">
                                    {rec.nutritionSummary.fiber}g
                                  </span>
                                  <span className="text-gray-400">fiber</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Reasons */}
                        {rec.reasons.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">
                              Why this recipe:
                            </p>
                            <ul className="text-xs text-gray-600 space-y-0.5">
                              {rec.reasons.slice(0, 4).map((reason, i) => (
                                <li
                                  key={i}
                                  className="flex items-center gap-1"
                                >
                                  <span className="text-green-500">✓</span>
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Elemental Display */}
                        {rec.recipe.elementalProperties && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-4">
                              {(
                                Object.entries(
                                  rec.recipe.elementalProperties
                                ) as [keyof ElementalProperties, number][]
                              )
                                .filter(([key]) =>
                                  ["Fire", "Water", "Earth", "Air"].includes(
                                    key as string
                                  )
                                )
                                .map(([element, value]) => (
                                  <div
                                    key={element}
                                    className="flex items-center gap-1"
                                  >
                                    <span className="text-xs">
                                      {getElementIcon(element as string)}
                                    </span>
                                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
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
                                    <span className="text-xs text-gray-500">
                                      {Math.round((value as number) * 100)}%
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Reset All
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner size="sm" />
                  Generating...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Generate Recipes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Recipes are generated based on planetary alignments, elemental
            harmony
            {natalChart && ", your birth chart,"}
            {" "}and nutritional content
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Page Export
 */
export default function RecipeGeneratorPage() {
  return <RecipeGeneratorContent />;
}
