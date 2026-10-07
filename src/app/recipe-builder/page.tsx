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
const CosmicAlignmentPreview = dynamic(
  () => import("@/components/recipe-builder/CosmicAlignmentPreview"),
  { ssr: false },
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
  planetaryHour?: string | null;
  lunarPhase: string;
  isPersonalized: boolean;
}

const DEFAULT_ELEMENT_STYLE = {
  badge: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  text: "text-orange-400",
  glow: "shadow-[0_0_15px_rgba(249,115,22,0.15)]",
};

const ELEMENT_STYLES: Record<string, { badge: string; text: string; glow: string }> = {
  Fire: {
    badge: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    text: "text-orange-400",
    glow: "shadow-[0_0_15px_rgba(249,115,22,0.15)]",
  },
  Water: {
    badge: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    text: "text-sky-400",
    glow: "shadow-[0_0_15px_rgba(56,189,248,0.15)]",
  },
  Earth: {
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    text: "text-emerald-400",
    glow: "shadow-[0_0_15px_rgba(52,211,153,0.15)]",
  },
  Air: {
    badge: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
    text: "text-indigo-400",
    glow: "shadow-[0_0_15px_rgba(129,140,248,0.15)]",
  },
};

function QuickGenerateBar({
  onGenerate,
  isGenerating,
  planetaryInfo,
  planetaryHour,
  lunarPhase,
  isPersonalized,
}: QuickGenerateProps) {
  const style = ELEMENT_STYLES[planetaryInfo.element] ?? DEFAULT_ELEMENT_STYLE;

  return (
    <div className={`glass-card-premium rounded-2xl p-4 sm:p-5 border border-white/10 ${style.glow} transition-all`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Celestial Telemetry Strip */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border ${style.badge}`}
              aria-hidden
            >
              {getElementIcon(planetaryInfo.element)}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white tracking-wide">
                  {planetaryInfo.planet} Day
                </p>
                {planetaryHour && (
                  <span className="t-mono text-[10px] text-white/50 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10">
                    {planetaryHour}
                  </span>
                )}
              </div>
              <p className={`text-xs font-medium ${style.text}`}>
                {planetaryInfo.element} Element Energy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lunarPhase && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/40 border border-purple-500/25 rounded-lg text-purple-200">
                <span className="text-xs" aria-hidden>🌙</span>
                <span className="t-mono text-[11px] font-medium capitalize">{lunarPhase}</span>
              </div>
            )}

            {isPersonalized ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/40 border border-amber-500/25 rounded-lg text-amber-200">
                <span className="text-xs" aria-hidden>✨</span>
                <span className="t-mono text-[11px] font-medium">Chart Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] border border-white/10 rounded-lg text-white/60">
                <span className="text-xs" aria-hidden>🔮</span>
                <span className="t-mono text-[11px]">Sky Baseline</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Synthesis Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
          <span className="t-label text-[10px] text-white/50 tracking-wider hidden sm:inline mr-1">
            Quick Synthesis:
          </span>
          {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((meal) => (
            <button
              key={meal}
              type="button"
              onClick={() => onGenerate(meal)}
              disabled={isGenerating}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all bg-white/[0.05] hover:bg-white/[0.12] active:scale-95 text-white/90 hover:text-white border border-white/15 hover:border-amber-400/40 hover:shadow-[0_0_12px_rgba(251,191,36,0.2)] disabled:opacity-40 disabled:cursor-not-allowed capitalize cursor-pointer flex items-center gap-1.5"
              title={`Synthesize a ${meal} using live celestial alignments (5 Spirit · 5 Essence)`}
            >
              <span>{meal}</span>
              <span className="text-[10px] opacity-60">✨</span>
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
      ...(astroState.currentPlanetaryHour ? { currentPlanetaryHour: astroState.currentPlanetaryHour } : {}),
    }),
    [astroState],
  );

  // User personalization context (if signed in)
  const userContext: UserPersonalizationContext | undefined = useMemo(() => {
    if (!currentUser?.natalChart) return undefined;
    return {
      natalChart: currentUser.natalChart,
      prioritizeHarmony: true,
      ...(currentUser.stats ? { stats: currentUser.stats } : {}),
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
        logger.error("Quick generate failed:", err);
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
    <div className="relative text-[#f2edff] py-6 sm:py-10">
      <div className="mx-auto max-w-4xl px-4 space-y-7">
        {/* Natal Chart Setup Banner (if not connected) */}
        {!isPersonalized && (
          <div className="p-4 sm:p-5 glass-card-premium rounded-2xl border border-amber-500/30 bg-gradient-to-r from-purple-950/40 via-amber-950/20 to-purple-950/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-3.5">
              <span className="text-2xl" aria-hidden>✨</span>
              <div>
                <p className="text-sm font-semibold text-amber-200">
                  Harmonize with Your Celestial Blueprint
                </p>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  Connect your Natal Chart to unlock personalized alchemical resonance scores and custom transits.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-signin-modal"))}
              className="whitespace-nowrap px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 text-xs font-bold rounded-xl shadow-md hover:from-amber-400 hover:to-orange-400 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              Connect Natal Chart
            </button>
          </div>
        )}

        {/* Hero Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="t-tag px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300">
                Crucible &bull; Alchemical Synthesis
              </span>
            </div>
            <h1 className="t-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-amber-100 to-orange-200">
              Recipe Builder
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-xl">
              {isPersonalized
                ? "Formulate bespoke recipes dynamically aligned with your natal chart and planetary transits."
                : "Synthesize cosmically-aligned recipes from live planetary harmonics and kitchen ingredients."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/cosmic-recipe"
              className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 text-xs font-medium border border-purple-500/25 transition-all hover:shadow-[0_0_12px_rgba(168,85,247,0.2)]"
            >
              Cosmic Recipe
            </Link>
            <Link
              href="/recipes"
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white text-xs font-medium border border-white/10 transition-all"
            >
              All Recipes
            </Link>
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs transition-all"
            >
              Home
            </Link>
          </div>
        </div>

        {/* Quick Synthesis Bar */}
        <QuickGenerateBar
          onGenerate={(mealType) => {
            void handleQuickGenerate(mealType);
          }}
          isGenerating={isGenerating}
          planetaryInfo={planetaryDayInfo}
          planetaryHour={astroState.currentPlanetaryHour}
          lunarPhase={astroState.lunarPhase || ""}
          isPersonalized={isPersonalized}
        />

        {/* Main Builder Panel */}
        <RecipeBuilderPanel />

        {/* Cosmic Alignment Preview (live-indexed grounding) */}
        <CosmicAlignmentPreview />

        {/* Generate Button (from builder selections) */}
        <GenerateRecipeButton
          onGenerated={handleBuilderGenerated}
          onGeneratingChange={handleGeneratingChange}
          onError={setGenerationError}
          isGenerating={isGenerating}
        />

        {generationError && (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-red-200 text-xs flex items-center gap-2">
            <span aria-hidden>⚠️</span>
            <span>{generationError}</span>
          </div>
        )}

        {/* Recipe Carousel / Results */}
        {hasGenerated && (
          <div className="glass-card-premium rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="t-display text-xl font-medium text-white">
                  {suggestions.length > 0
                    ? `${suggestions.length} Alchemical Formulation${suggestions.length !== 1 ? "s" : ""} Synthesized`
                    : "No Recipes Synthesized"}
                </h3>
                <p className="t-mono text-[11px] text-white/50 mt-0.5">
                  {lastGeneratedFrom === "quick"
                    ? `Quick synthesis · ${isPersonalized ? "natal chart" : "planetary"} resonance`
                    : `Crucible parameters · ${isPersonalized ? "natal chart" : "planetary"} resonance`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-white/40 hover:text-red-400 hover:bg-red-950/30 transition-colors px-3 py-1.5 rounded-lg border border-transparent hover:border-red-500/20 cursor-pointer"
              >
                Clear Results
              </button>
            </div>

            <div className="p-4 sm:p-6">
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
          <div className="glass-card-premium rounded-3xl border border-white/10 p-8 shadow-2xl">
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
          <div className="glass-card-premium rounded-2xl border border-purple-500/25 bg-gradient-to-r from-purple-950/40 via-indigo-950/20 to-purple-950/40 p-5 shadow-lg">
            <div className="flex items-start gap-4">
              <span className="text-3xl" aria-hidden>🔮</span>
              <div>
                <p className="text-sm font-semibold text-purple-200">
                  Elevate to Natal Alchemical Precision
                </p>
                <p className="text-xs text-purple-300/80 mt-1 max-w-xl leading-relaxed">
                  Sign in and add your birth chart data. The crucible factors your natal sun, moon, and rising alignments into every ingredient pairing and planetary hour recommendation.
                </p>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium shadow-md transition-all hover:scale-[1.02]"
                >
                  <span>Configure Natal Profile</span>
                  <span aria-hidden>&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
