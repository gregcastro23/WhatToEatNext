"use client";

/**
 * Generate Recipe Button
 *
 * Gathers user selections from RecipeBuilderContext and planetary data,
 * then generates multiple recipe suggestions via the full recommendation
 * pipeline (planetary alignment + natal-chart personalization when signed in).
 * Results are returned via onGenerated callback for the carousel display.
 *
 * @file src/components/recipe-builder/GenerateRecipeButton.tsx
 */

import { Sparkles, Loader2, Coins, Flame } from "lucide-react";
import React, { useCallback, useState, useEffect } from "react";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import { useUser } from "@/contexts/UserContext";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import type { MealType, DayOfWeek } from "@/types/menuPlanner";
import { createLogger } from "@/utils/logger";
import {
  type RecommendedMeal,
  type AstrologicalState,
  type UserPersonalizationContext,
} from "@/utils/menuPlanner/recommendationBridge";

const logger = createLogger("GenerateRecipeButton");

const SYNTHESIS_STEPS = [
  "Consulting celestial transits...",
  "Balancing elemental crucibles...",
  "Harmonizing flavor signatures...",
  "Synthesizing cosmic recipes...",
];

interface GenerateRecipeButtonProps {
  onGenerated: (results: RecommendedMeal[]) => void;
  onGeneratingChange: (isGenerating: boolean) => void;
  onError?: (message: string) => void;
  isGenerating: boolean;
  className?: string;
}

export default function GenerateRecipeButton({
  onGenerated,
  onGeneratingChange,
  onError,
  isGenerating,
  className = "",
}: GenerateRecipeButtonProps) {
  const builder = useRecipeBuilder();
  const astroHook = useAstrologicalState();
  const { currentUser } = useUser();
  const [synthesisStepIndex, setSynthesisStepIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setSynthesisStepIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setSynthesisStepIndex((prev) => (prev + 1) % SYNTHESIS_STEPS.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [isGenerating]);

  const hasAnySelection =
    builder.mealType !== null ||
    builder.totalItems > 0 ||
    builder.flavors.length > 0 ||
    builder.dietaryPreferences.length > 0 ||
    builder.allergies.length > 0;
  const canGenerate = hasAnySelection;

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || isGenerating) return;

    onGeneratingChange(true);

    try {
      // Current day of week for planetary characteristics
      const dayOfWeek = new Date().getDay() as DayOfWeek;

      // Build astrological state from the hook
      const astroState: AstrologicalState = {
        currentZodiac: astroHook.currentZodiac ?? "aries",
        lunarPhase: astroHook.lunarPhase || "full",
        activePlanets: astroHook.activePlanets || [],
        domElements: astroHook.domElements || {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25,
        },
        ...(astroHook.currentPlanetaryHour
          ? { currentPlanetaryHour: astroHook.currentPlanetaryHour }
          : {}),
      };

      // Determine meal types from builder selection (or use all if none selected)
      const mealTypes: MealType[] = builder.mealType
        ? [builder.mealType.toLowerCase() as MealType]
        : ["breakfast", "lunch", "dinner", "snack"];

      // Build user personalization context if natal chart is available
      let userContext: UserPersonalizationContext | undefined;
      if (currentUser?.natalChart) {
        userContext = {
          natalChart: currentUser.natalChart,
          prioritizeHarmony: true,
          ...(currentUser.stats ? { stats: currentUser.stats } : {}),
        };
        logger.info(
          "Applying natal chart personalization for recipe generation",
        );
      }

      logger.info("Generating recipes with full recommendation pipeline", {
        mealTypes,
        ingredients: builder.selectedIngredients.map((i) => i.name),
        cuisines: builder.selectedCuisines,
        cookingMethods: builder.selectedCookingMethods,
        personalized: !!userContext,
      });

      const payload = {
        dayOfWeek,
        astroState,
        options: {
          mealTypes,
          dietaryRestrictions: [
            ...builder.dietaryPreferences,
            ...builder.allergies,
          ],
          preferredCuisines: builder.selectedCuisines,
          excludeIngredients: builder.allergies,
          maxPrepTimeMinutes: builder.maxPrepTimeMinutes,
          requiredIngredients: builder.selectedIngredients.map((i) => i.name),
          preferredCookingMethods: builder.selectedCookingMethods,
          flavorPreferences: builder.flavors,
          useCurrentPlanetary: true,
          // Generate more results for the carousel (each meal type generates multiple)
          maxRecipesPerMeal: builder.mealType ? 8 : 4,
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
          onError?.(
            "Insufficient tokens. Each generation costs 5 Spirit + 5 Essence.",
          );
          onGenerated([]);
          return;
        }
        if (res.status === 401) {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("open-signin-modal"));
          }
          onError?.("Please sign in to generate recipes.");
          onGenerated([]);
          return;
        }
        if (res.status === 504) {
          onError?.("Generation timed out. Please retry.");
          onGenerated([]);
          return;
        }
        throw new Error(data?.message ?? "Generation failed");
      }

      const recommendations = (data.recommendations ?? []) as RecommendedMeal[];

      logger.info(`Generated ${recommendations.length} recipe suggestions`);
      onGenerated(recommendations);
    } catch (err) {
      logger.error("Recipe generation failed:", err);
      onError?.("Could not generate recipes right now. Please try again.");
      onGenerated([]);
    } finally {
      onGeneratingChange(false);
    }
  }, [
    canGenerate,
    isGenerating,
    builder,
    astroHook,
    currentUser,
    onGenerated,
    onGeneratingChange,
    onError,
  ]);

  return (
    <div className={`space-y-3 ${className}`}>
      <button
        onClick={() => {
          void handleGenerate();
        }}
        disabled={!canGenerate || isGenerating}
        className={`
          relative w-full py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-300 overflow-hidden
          ${
            canGenerate && !isGenerating
              ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 text-white shadow-[0_0_28px_rgba(168,85,247,0.35)] hover:shadow-[0_0_38px_rgba(168,85,247,0.55)] hover:scale-[1.01] active:scale-[0.99] border border-white/20 group"
              : "bg-white/5 border border-white/10 text-muted-foreground/60 cursor-not-allowed"
          }
        `}
      >
        {/* Subtle animated gradient sweep overlay when active */}
        {canGenerate && !isGenerating && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"
            aria-hidden
          />
        )}

        {isGenerating ? (
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-amber-300" />
            <span className="font-mono tracking-wide text-amber-200">
              {SYNTHESIS_STEPS[synthesisStepIndex]}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2.5">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span className="tracking-wide">Generate Recipes</span>
            {currentUser?.natalChart && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-mono text-amber-200">
                <Flame className="h-2.5 w-2.5 text-amber-400" />
                Personalized
              </span>
            )}
          </div>
        )}
      </button>

      {/* Helper & Token status row */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Coins className="h-3 w-3 text-amber-400/70" />
          <span>Cost: 5 Spirit · 5 Essence</span>
        </div>

        {currentUser?.natalChart && canGenerate && !isGenerating && (
          <span className="text-purple-300 flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-amber-300" />
            Natal resonance active
          </span>
        )}

        {!canGenerate && (
          <span className="text-muted-foreground/70">
            Select ingredients or preferences to begin
          </span>
        )}
      </div>
    </div>
  );
}
