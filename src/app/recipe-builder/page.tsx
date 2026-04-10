"use client";

/**
 * Recipe Builder Page
 * Combines the Recipe Builder (ingredient search, preferences) and the
 * planetary recommendation pipeline into a single cohesive interface.
 *
 * Features:
 *  - Quick Generate bar (breakfast / lunch / dinner / snack)
 *  - Full builder panel (ingredients, cuisines, cooking methods, dietary)
 *  - Swipeable recipe carousel powered by planetary + natal-chart alignment
 *  - Personalized suggestions when the user is signed in
 *
 * @file src/app/recipe-builder/page.tsx
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import GenerateRecipeButton from "@/components/recipe-builder/GenerateRecipeButton";
import { useUser } from "@/contexts/UserContext";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import type { MealType, DayOfWeek } from "@/types/menuPlanner";
import { saveRecipeToStore } from "@/utils/generatedRecipeStore";
import { createLogger } from "@/utils/logger";
import {
  type RecommendedMeal,
  type AstrologicalState,
  type UserPersonalizationContext,
} from "@/utils/menuPlanner/recommendationBridge";
import { getPlanetaryDayCharacteristics } from "@/utils/planetaryDayRecommendations";

const RecipeBuilderPanel = dynamic(
  () => import("@/components/recipe-builder/RecipeBuilderPanel"),
);
const RecipeSuggestionCarousel = dynamic(
  () => import("@/components/recipe-builder/RecipeSuggestionCarousel"),
);

const logger = createLogger("RecipeBuilder");

// ===== Deduplication =====

function deduplicateRecipes(recipes: RecommendedMeal[]): RecommendedMeal[] {
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
    case "Fire": return "🔥";
    case "Water": return "💧";
    case "Earth": return "🌍";
    case "Air": return "💨";
    default: return "⚡";
  }
};

// ===== Quick Generate Bar =====

interface QuickGenerateProps {
  onGenerate: (mealType: MealType) => void;
  isGenerating: boolean;
  planetaryInfo: ReturnType<typeof getPlanetaryDayCharacteristics>;
  lunarPhase: string;
  isPersonalized: boolean;
}

function QuickGenerateBar({
  onGenerate,
  isGenerating,
  planetaryInfo,
  lunarPhase,
  isPersonalized,
}: QuickGenerateProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Planetary Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getElementIcon(planetaryInfo.element)}</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {planetaryInfo.planet} Day
              </p>
              <p className="text-xs text-gray-500">{planetaryInfo.element} Energy</p>
            </div>
          </div>

          {lunarPhase && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 rounded-lg">
              <span className="text-xs">🌙</span>
              <span className="text-xs text-purple-700 font-medium">{lunarPhase}</span>
            </div>
          )}

          {isPersonalized && (
            <div className="flex items-center gap-1 px-2 py-1 bg-indigo-50 rounded-lg">
              <span className="text-xs">✨</span>
              <span className="text-xs text-indigo-700 font-medium">Chart active</span>
            </div>
          )}
        </div>

        {/* Quick Generate Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden sm:inline">Quick Generate:</span>
          {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((meal) => (
            <button
              key={meal}
              onClick={() => onGenerate(meal)}
              disabled={isGenerating}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200 hover:from-amber-100 hover:to-orange-100 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed capitalize"
            >
              {meal}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== Main Page =====

export default function RecipeBuilderPage() {
  const astroState = useAstrologicalState();
  const { currentUser } = useUser();

  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<RecommendedMeal[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [lastGeneratedFrom, setLastGeneratedFrom] = useState<"builder" | "quick" | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Current day for planetary characteristics
  const currentDay = useMemo(() => new Date().getDay() as DayOfWeek, []);
  const planetaryDayInfo = useMemo(() => getPlanetaryDayCharacteristics(currentDay), [currentDay]);

  // Is the user signed in with a natal chart?
  const isPersonalized = !!currentUser?.natalChart;

  // AstrologicalState for generateDayRecommendations
  const convertedAstroState: AstrologicalState = useMemo(
    () => ({
      currentZodiac: astroState.currentZodiac || "aries",
      lunarPhase: astroState.lunarPhase || "full",
      activePlanets: astroState.activePlanets || [],
      domElements: astroState.domElements || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      currentPlanetaryHour: astroState.currentPlanetaryHour || undefined,
    }),
    [astroState],
  );

  // User personalization context (if signed in)
  const userContext: UserPersonalizationContext | undefined = useMemo(() => {
    if (!currentUser?.natalChart) return undefined;
    return {
      natalChart: currentUser.natalChart,
      prioritizeHarmony: true,
      stats: currentUser.stats,
    };
  }, [currentUser]);

  // Persist recipes to store whenever suggestions change
  useEffect(() => {
    suggestions.forEach((rec) => {
      if (rec.recipe?.id) saveRecipeToStore(rec.recipe);
    });
  }, [suggestions]);

  // Reset carousel index when new suggestions arrive
  const handleSuggestionsUpdate = useCallback((newSuggestions: RecommendedMeal[]) => {
    const deduped = deduplicateRecipes(newSuggestions);
    setSuggestions(deduped);
    setCarouselIndex(0);
    setHasGenerated(true);
    logger.info(`Showing ${deduped.length} unique recipe suggestions`);
  }, []);

  // ---- Quick Generate ----
  const handleQuickGenerate = useCallback(
    async (mealType: MealType) => {
      setIsGenerating(true);
      setLastGeneratedFrom("quick");
      setGenerationError(null);
      try {
        const payload = {
          dayOfWeek: currentDay,
          astroState: convertedAstroState,
          options: {
            mealTypes: [mealType],
            dietaryRestrictions: [],
            preferredCuisines: [],
            excludeIngredients: [],
            useCurrentPlanetary: true,
            maxRecipesPerMeal: 10,
            userContext,
          },
        };

        let res = await fetch("/api/recommendations/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        let data = await res.json();

        // One free retry for timeout within server-issued 5-minute window.
        if (!res.ok && res.status === 504 && data?.retry?.token) {
          res = await fetch("/api/recommendations/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              ...payload,
              retryToken: data.retry.token,
            }),
          });
          data = await res.json();
        }

        if (!res.ok || !data?.success) {
          if (res.status === 402) {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("open-token-shop"));
            }
            setGenerationError("Insufficient tokens. Each generation costs 5 Spirit + 5 Essence.");
            handleSuggestionsUpdate([]);
            return;
          }
          if (res.status === 401) {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("open-signin-modal"));
            }
            setGenerationError("Please sign in to generate recipes.");
            handleSuggestionsUpdate([]);
            return;
          }
          if (res.status === 504) {
            setGenerationError("Generation timed out. Please retry.");
            handleSuggestionsUpdate([]);
            return;
          }
          throw new Error(data?.message || "Quick generate failed");
        }

        const recommendations = (data.recommendations || []) as RecommendedMeal[];
        handleSuggestionsUpdate(recommendations);
      } catch (err) {
        logger.error("Quick generate failed:", err as any);
        setGenerationError("Quick generate failed. Please try again in a moment.");
        handleSuggestionsUpdate([]);
      } finally {
        setIsGenerating(false);
      }
    },
    [currentDay, convertedAstroState, userContext, handleSuggestionsUpdate],
  );

  // ---- Builder Generate (from GenerateRecipeButton) ----
  const handleBuilderGenerated = useCallback(
    (results: RecommendedMeal[]) => {
      setLastGeneratedFrom("builder");
      handleSuggestionsUpdate(results);
    },
    [handleSuggestionsUpdate],
  );

  const handleGeneratingChange = useCallback((val: boolean) => {
    if (val) setGenerationError(null);
    setIsGenerating(val);
  }, []);

  const handleClear = useCallback(() => {
    setSuggestions([]);
    setHasGenerated(false);
    setLastGeneratedFrom(null);
    setCarouselIndex(0);
    setGenerationError(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-orange-50">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {!isPersonalized && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-3">
              <div className="text-2xl">✨</div>
              <p className="text-sm text-amber-800 font-medium">
                Unlock <span className="font-bold">Natal Chart Integration</span> for deeper alchemical alignment scores and personalized cosmic recipes.
              </p>
            </div>
            <button 
              onClick={() => window.dispatchEvent(new Event('open-signin-modal'))}
              className="whitespace-nowrap px-4 py-2 bg-white text-orange-700 text-xs font-bold rounded-lg border border-orange-200 shadow-sm hover:bg-orange-50 transition-all"
            >
              Connect Your Chart
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
              Recipe Builder
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isPersonalized
                ? "Personalized recipes aligned with your birth chart & the cosmos"
                : "Cosmically-aligned recipes based on planetary positions"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/recipe-generator"
              className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-sm text-purple-700 font-medium border border-purple-200"
            >
              Recipe Generator
            </Link>
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm text-gray-600"
            >
              Home
            </Link>
          </div>
        </div>

        {/* Quick Generate Bar */}
        <QuickGenerateBar
          onGenerate={(mealType) => {
            void handleQuickGenerate(mealType);
          }}
          isGenerating={isGenerating}
          planetaryInfo={planetaryDayInfo}
          lunarPhase={astroState.lunarPhase || ""}
          isPersonalized={isPersonalized}
        />

        {/* Main Builder Panel */}
        <RecipeBuilderPanel />

        {/* Generate Button (from builder selections) */}
        <GenerateRecipeButton
          onGenerated={handleBuilderGenerated}
          onGeneratingChange={handleGeneratingChange}
          onError={setGenerationError}
          isGenerating={isGenerating}
        />

        {generationError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{generationError}</p>
          </div>
        )}

        {/* Recipe Carousel / Results */}
        {hasGenerated && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800">
                  {suggestions.length > 0
                    ? `${suggestions.length} Recipe${suggestions.length !== 1 ? "s" : ""} Found`
                    : "No Recipes Found"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {lastGeneratedFrom === "quick"
                    ? `Via quick generate · ${isPersonalized ? "personalized" : "planetary"} alignment`
                    : `Via builder preferences · ${isPersonalized ? "personalized" : "planetary"} alignment`}
                </p>
              </div>
              <button
                onClick={handleClear}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50"
              >
                Clear
              </button>
            </div>

            <div className="p-6">
              <RecipeSuggestionCarousel
                suggestions={suggestions}
                currentIndex={carouselIndex}
                onIndexChange={setCarouselIndex}
                isLoading={isGenerating}
                isPersonalized={isPersonalized}
                onSaveToQueue={(meal) => {
                  logger.info(`Queued recipe: ${meal.recipe.name}`);
                }}
              />
            </div>
          </div>
        )}

        {/* Loading state before first generation */}
        {isGenerating && !hasGenerated && (
          <div className="bg-white rounded-2xl shadow-md p-8">
            <RecipeSuggestionCarousel
              suggestions={[]}
              currentIndex={0}
              onIndexChange={() => {}}
              isLoading
            />
          </div>
        )}

        {/* Sign-in nudge for personalization */}
        {!isPersonalized && !hasGenerated && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔮</span>
              <div>
                <p className="text-sm font-semibold text-purple-800">
                  Unlock Personalized Recipes
                </p>
                <p className="text-xs text-purple-600 mt-0.5">
                  Sign in and add your birth chart to get recipes perfectly aligned
                  with your cosmic constitution.
                </p>
                <Link
                  href="/profile"
                  className="inline-block mt-2 px-3 py-1 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition-colors"
                >
                  Set up your chart →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
