import { useState, useCallback } from "react";
import type { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import type { MealType, DayOfWeek } from "@/types/menuPlanner";
import { createLogger } from "@/utils/logger";
import {
  generateDayRecommendations,
  type RecommendedMeal,
  type AstrologicalState,
  type UserPersonalizationContext,
} from "@/utils/menuPlanner/recommendationBridge";
import { deduplicateRecipes, mergePreferenceList } from "./recipeHelpers";
import type { TasteGraphSnapshot } from "./types";

const logger = createLogger("useGenerateRecipeExecution");

type DayOptions = Parameters<typeof generateDayRecommendations>[2];

function buildOptions(
  mealTypes: MealType[],
  builder: ReturnType<typeof useRecipeBuilder>,
  tasteGraph: TasteGraphSnapshot | null,
  userContext: UserPersonalizationContext | undefined,
): DayOptions {
  const cuisines = (tasteGraph?.cuisines ?? []).map((c) => c.name);
  const methods = (tasteGraph?.cookingMethods ?? []).map((m) => m.name);
  return {
    mealTypes,
    dietaryRestrictions: [...builder.dietaryPreferences, ...builder.allergies],
    preferredCuisines: mergePreferenceList(builder.selectedCuisines, cuisines),
    excludeIngredients: tasteGraph?.dislikedIngredients,
    requiredIngredients: builder.selectedIngredients.map((i) => i.name),
    preferredCookingMethods: mergePreferenceList(builder.selectedCookingMethods, methods),
    flavorPreferences: builder.flavors,
    favoriteIngredients: tasteGraph?.favoriteIngredients,
    dislikedIngredients: tasteGraph?.dislikedIngredients,
    complexityPreference: tasteGraph?.complexityPreference,
    useCurrentPlanetary: true,
    maxRecipesPerMeal: 8,
    userContext,
  };
}

export function useGenerateRecipeExecution(
  builder: ReturnType<typeof useRecipeBuilder>,
  tasteGraph: TasteGraphSnapshot | null,
  userContext: UserPersonalizationContext | undefined,
  convertedAstroState: AstrologicalState,
  currentDay: DayOfWeek,
): {
  isGenerating: boolean;
  hasGenerated: boolean;
  suggestions: RecommendedMeal[];
  generateRecipes: (mealTypes: MealType[]) => Promise<void>;
} {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<RecommendedMeal[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateRecipes = useCallback(
    async (mealTypes: MealType[]): Promise<void> => {
      setIsGenerating(true);
      try {
        const options = buildOptions(mealTypes, builder, tasteGraph, userContext);
        const recommendations = await generateDayRecommendations(currentDay, convertedAstroState, options);
        const deduped = deduplicateRecipes(recommendations);
        setSuggestions(deduped);
        setHasGenerated(true);
      } catch (err: unknown) {
        logger.error("Recipe generation failed:", err);
        setSuggestions([]);
        setHasGenerated(true);
      } finally {
        setIsGenerating(false);
      }
    },
    [currentDay, convertedAstroState, builder, tasteGraph, userContext],
  );

  return { isGenerating, hasGenerated, suggestions, generateRecipes };
}
