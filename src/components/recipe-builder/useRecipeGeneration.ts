"use client";

/**
 * The Recipe Builder page's generation state: the suggestions on show, which
 * path produced them (builder or quick synthesis), the in-flight flag, and the
 * last failure's message. Both paths go through `requestRecommendations`, so
 * they share the retry and the status → message mapping.
 *
 * @file src/components/recipe-builder/useRecipeGeneration.ts
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import {
  currentDayOfWeek,
  openFailureRemedy,
  requestRecommendations,
  toRequestAstroState,
  toUserContext,
  type GenerationRequest,
} from "@/lib/recipe-builder/generateRecommendations";
import type { MealType } from "@/types/menuPlanner";
import { saveRecipeToStore } from "@/utils/generatedRecipeStore";
import { createLogger } from "@/utils/logger";
import type {
  AstrologicalState,
  RecommendedMeal,
  UserPersonalizationContext,
} from "@/utils/menuPlanner/recommendationBridge";

const logger = createLogger("RecipeBuilder");

export type GenerationSource = "builder" | "quick";

/** Drops repeats whose names differ only by an enhancement/copy suffix, case, or punctuation. */
export function deduplicateRecipes(recipes: readonly RecommendedMeal[]): RecommendedMeal[] {
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

/** Quick synthesis: one meal type, no builder constraints, a wider pool for the carousel. */
function quickRequest(
  mealType: MealType,
  astroState: AstrologicalState,
  userContext: UserPersonalizationContext | undefined,
): GenerationRequest {
  return {
    dayOfWeek: currentDayOfWeek(),
    astroState,
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
}

export interface RecipeGeneration {
  isGenerating: boolean;
  suggestions: RecommendedMeal[];
  carouselIndex: number;
  setCarouselIndex: (index: number) => void;
  hasGenerated: boolean;
  lastGeneratedFrom: GenerationSource | null;
  generationError: string | null;
  setGenerationError: (message: string | null) => void;
  quickGenerate: (mealType: MealType) => Promise<void>;
  onBuilderGenerated: (results: RecommendedMeal[]) => void;
  onGeneratingChange: (isGenerating: boolean) => void;
  clear: () => void;
}

interface GenerationResults {
  suggestions: RecommendedMeal[];
  carouselIndex: number;
  setCarouselIndex: (index: number) => void;
  lastGeneratedFrom: GenerationSource | null;
  show: (results: RecommendedMeal[], source: GenerationSource) => void;
  clearResults: () => void;
}

/** The suggestions on show and where they came from; each new set is deduplicated and starts at card 1. */
function useGenerationResults(): GenerationResults {
  const [suggestions, setSuggestions] = useState<RecommendedMeal[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [lastGeneratedFrom, setLastGeneratedFrom] = useState<GenerationSource | null>(null);

  // Generated recipes resolve at /generated-recipe/[id] from this store.
  useEffect(() => {
    for (const rec of suggestions) if (rec.recipe.id) saveRecipeToStore(rec.recipe);
  }, [suggestions]);

  const show = useCallback((results: RecommendedMeal[], source: GenerationSource): void => {
    const deduped = deduplicateRecipes(results);
    setSuggestions(deduped);
    setCarouselIndex(0);
    setLastGeneratedFrom(source);
    logger.info(`Showing ${deduped.length} unique recipe suggestions`);
  }, []);

  const clearResults = useCallback((): void => {
    setSuggestions([]);
    setLastGeneratedFrom(null);
    setCarouselIndex(0);
  }, []);

  return { suggestions, carouselIndex, setCarouselIndex, lastGeneratedFrom, show, clearResults };
}

export function useRecipeGeneration(): RecipeGeneration {
  const astro = useAstrologicalState();
  const { currentUser } = useUser();
  const { show, clearResults, ...results } = useGenerationResults();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const astroState = useMemo(() => toRequestAstroState(astro), [astro]);
  const userContext = useMemo(() => toUserContext(currentUser), [currentUser]);

  const quickGenerate = useCallback(
    async (mealType: MealType): Promise<void> => {
      setIsGenerating(true);
      setGenerationError(null);
      const outcome = await requestRecommendations(quickRequest(mealType, astroState, userContext));
      if (!outcome.ok) {
        openFailureRemedy(outcome);
        setGenerationError(outcome.message);
      }
      show(outcome.ok ? outcome.recommendations : [], "quick");
      setIsGenerating(false);
    },
    [astroState, userContext, show],
  );

  const onGeneratingChange = useCallback((value: boolean): void => {
    if (value) setGenerationError(null);
    setIsGenerating(value);
  }, []);
  const onBuilderGenerated = useCallback((found: RecommendedMeal[]) => show(found, "builder"), [show]);
  const clear = useCallback((): void => {
    clearResults();
    setGenerationError(null);
  }, [clearResults]);

  return {
    ...results,
    isGenerating,
    hasGenerated: results.lastGeneratedFrom !== null,
    generationError,
    setGenerationError,
    quickGenerate,
    onBuilderGenerated,
    onGeneratingChange,
    clear,
  };
}
