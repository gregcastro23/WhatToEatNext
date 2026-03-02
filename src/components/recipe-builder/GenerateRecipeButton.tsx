"use client";

/**
 * Generate Recipe Button
 * Gathers user selections from RecipeBuilderContext and planetary data,
 * then generates multiple recipe suggestions via the full recommendation
 * pipeline (planetary alignment + natal-chart personalization when signed in).
 * Results are returned via onGenerated callback for the carousel display.
 *
 * @file src/components/recipe-builder/GenerateRecipeButton.tsx
 */

import React, { useCallback } from "react";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import { useUser } from "@/contexts/UserContext";
import { createLogger } from "@/utils/logger";
import {
  generateDayRecommendations,
  type RecommendedMeal,
  type AstrologicalState,
  type UserPersonalizationContext,
} from "@/utils/menuPlanner/recommendationBridge";
import type { MealType, DayOfWeek } from "@/types/menuPlanner";

const logger = createLogger("GenerateRecipeButton");

interface GenerateRecipeButtonProps {
  onGenerated: (results: RecommendedMeal[]) => void;
  onGeneratingChange: (isGenerating: boolean) => void;
  isGenerating: boolean;
  className?: string;
}

export default function GenerateRecipeButton({
  onGenerated,
  onGeneratingChange,
  isGenerating,
  className = "",
}: GenerateRecipeButtonProps) {
  const builder = useRecipeBuilder();
  const astroHook = useAstrologicalState();
  const { currentUser } = useUser();

  const canGenerate = builder.totalItems > 0 || builder.mealType !== null;

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || isGenerating) return;

    onGeneratingChange(true);

    try {
      // Current day of week for planetary characteristics
      const dayOfWeek = new Date().getDay() as DayOfWeek;

      // Build astrological state from the hook
      const astroState: AstrologicalState = {
        currentZodiac: astroHook.currentZodiac || "aries",
        lunarPhase: astroHook.lunarPhase || "full",
        activePlanets: astroHook.activePlanets || [],
        domElements: astroHook.domElements || {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25,
        },
        currentPlanetaryHour: astroHook.currentPlanetaryHour || undefined,
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
          stats: currentUser.stats,
        };
        logger.info("Applying natal chart personalization for recipe generation");
      }

      logger.info("Generating recipes with full recommendation pipeline", {
        mealTypes,
        ingredients: builder.selectedIngredients.map((i) => i.name),
        cuisines: builder.selectedCuisines,
        cookingMethods: builder.selectedCookingMethods,
        personalized: !!userContext,
      });

      const recommendations = await generateDayRecommendations(
        dayOfWeek,
        astroState,
        {
          mealTypes,
          dietaryRestrictions: [
            ...builder.dietaryPreferences,
            ...builder.allergies,
          ],
          preferredCuisines: builder.selectedCuisines,
          excludeIngredients: [],
          requiredIngredients: builder.selectedIngredients.map((i) => i.name),
          preferredCookingMethods: builder.selectedCookingMethods,
          flavorPreferences: builder.flavors,
          useCurrentPlanetary: true,
          // Generate more results for the carousel (each meal type generates multiple)
          maxRecipesPerMeal: builder.mealType ? 8 : 4,
          userContext,
        },
      );

      logger.info(`Generated ${recommendations.length} recipe suggestions`);
      onGenerated(recommendations);
    } catch (err) {
      logger.error("Recipe generation failed:", err as any);
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
  ]);

  return (
    <div className={className}>
      <button
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        className={`
          w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all
          ${
            canGenerate && !isGenerating
              ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white hover:from-purple-700 hover:to-orange-600 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Consulting the cosmos...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            ✨ Generate Recipes
            {currentUser?.natalChart && (
              <span className="text-xs opacity-80 font-normal">(personalized)</span>
            )}
          </span>
        )}
      </button>

      {!canGenerate && (
        <p className="text-xs text-gray-400 text-center mt-2">
          Add at least one ingredient, cuisine, cooking method, or meal type to generate
        </p>
      )}

      {currentUser?.natalChart && canGenerate && !isGenerating && (
        <p className="text-xs text-center mt-2 text-purple-500">
          ✨ Your birth chart will personalize these recommendations
        </p>
      )}
    </div>
  );
}
