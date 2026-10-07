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

import { Coins, Flame, Loader2, Sparkles } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useRecipeBuilder, type RecipeBuilderState } from "@/contexts/RecipeBuilderContext";
import { useUser } from "@/contexts/UserContext";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import {
  currentDayOfWeek,
  GENERATION_COST_COPY,
  openFailureRemedy,
  requestRecommendations,
  toRequestAstroState,
  toUserContext,
  type GenerationRequest,
} from "@/lib/recipe-builder/generateRecommendations";
import type { MealType } from "@/types/menuPlanner";
import { createLogger } from "@/utils/logger";
import type {
  AstrologicalState,
  RecommendedMeal,
  UserPersonalizationContext,
} from "@/utils/menuPlanner/recommendationBridge";
import { FOCUS_RING } from "./focusRing";

const logger = createLogger("GenerateRecipeButton");

export const SYNTHESIS_STEPS: readonly string[] = [
  "Consulting celestial transits...",
  "Balancing elemental crucibles...",
  "Harmonizing flavor signatures...",
  "Synthesizing cosmic recipes...",
];

export const SYNTHESIS_STEP_MS = 1800;

const ALL_MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

function hasAnySelection(builder: RecipeBuilderState & { totalItems: number }): boolean {
  return (
    builder.mealType !== null ||
    builder.totalItems > 0 ||
    builder.flavors.length > 0 ||
    builder.dietaryPreferences.length > 0 ||
    builder.allergies.length > 0
  );
}

function buildBuilderRequest(
  builder: RecipeBuilderState,
  astroState: AstrologicalState,
  userContext: UserPersonalizationContext | undefined,
): GenerationRequest {
  const mealType = builder.mealType?.toLowerCase();
  const chosenMeal = ALL_MEAL_TYPES.find((meal) => meal === mealType);
  return {
    dayOfWeek: currentDayOfWeek(),
    astroState,
    options: {
      mealTypes: chosenMeal ? [chosenMeal] : ALL_MEAL_TYPES,
      dietaryRestrictions: [...builder.dietaryPreferences, ...builder.allergies],
      preferredCuisines: builder.selectedCuisines,
      excludeIngredients: builder.allergies,
      maxPrepTimeMinutes: builder.maxPrepTimeMinutes,
      requiredIngredients: builder.selectedIngredients.map((i) => i.name),
      preferredCookingMethods: builder.selectedCookingMethods,
      flavorPreferences: builder.flavors,
      useCurrentPlanetary: true,
      // More results for the carousel when a single meal type is targeted.
      maxRecipesPerMeal: chosenMeal ? 8 : 4,
      userContext,
    },
  };
}

/** Cycles the synthesis copy while generating; back to the first step when idle. */
export function useSynthesisPhrase(isGenerating: boolean): string {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setStep(0);
      return undefined;
    }
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % SYNTHESIS_STEPS.length);
    }, SYNTHESIS_STEP_MS);
    return (): void => clearInterval(timer);
  }, [isGenerating]);

  return SYNTHESIS_STEPS[step] ?? "";
}

interface GenerateRecipeButtonProps {
  onGenerated: (results: RecommendedMeal[]) => void;
  onGeneratingChange: (isGenerating: boolean) => void;
  onError?: (message: string) => void;
  isGenerating: boolean;
  className?: string;
}

function ButtonContent({
  isGenerating,
  phrase,
  isPersonalized,
}: {
  isGenerating: boolean;
  phrase: string;
  isPersonalized: boolean;
}): React.JSX.Element {
  if (isGenerating) {
    return (
      <span className="flex items-center justify-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-amber-300" aria-hidden />
        <span className="font-mono tracking-wide text-amber-200">{phrase}</span>
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center gap-2.5">
      <Sparkles className="h-4 w-4 text-amber-300" aria-hidden />
      <span className="tracking-wide">Generate Recipes</span>
      {isPersonalized && (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-mono text-amber-200">
          <Flame className="h-2.5 w-2.5 text-amber-400" aria-hidden />
          Personalized
        </span>
      )}
    </span>
  );
}

function StatusRow({
  canGenerate,
  isGenerating,
  isPersonalized,
}: {
  canGenerate: boolean;
  isGenerating: boolean;
  isPersonalized: boolean;
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] font-mono">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Coins className="h-3 w-3 text-amber-400/70" aria-hidden />
        <span>Cost: {GENERATION_COST_COPY}</span>
      </div>
      {isPersonalized && canGenerate && !isGenerating && (
        <span className="text-purple-300 flex items-center gap-1">
          <Sparkles className="h-2.5 w-2.5 text-amber-300" aria-hidden />
          Natal resonance active
        </span>
      )}
      {!canGenerate && (
        <span className="text-muted-foreground/70">Select ingredients or preferences to begin</span>
      )}
    </div>
  );
}

const ACTIVE_STYLE =
  "bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 text-white shadow-[0_0_28px_rgba(168,85,247,0.35)] hover:shadow-[0_0_38px_rgba(168,85,247,0.55)] hover:scale-[1.01] active:scale-[0.99] border border-white/20 group";
const INERT_STYLE = "bg-white/5 border border-white/10 text-muted-foreground/60 cursor-not-allowed";

/** Runs one builder generation; a no-op while one is in flight or nothing is selected. */
function useBuilderGeneration({
  onGenerated,
  onGeneratingChange,
  onError,
  isGenerating,
}: Omit<GenerateRecipeButtonProps, "className">): { canGenerate: boolean; generate: () => Promise<void> } {
  const builder = useRecipeBuilder();
  const astro = useAstrologicalState();
  const { currentUser } = useUser();
  const canGenerate = hasAnySelection(builder);

  const generate = useCallback(async (): Promise<void> => {
    if (!canGenerate || isGenerating) return;
    onGeneratingChange(true);
    try {
      const userContext = toUserContext(currentUser);
      const request = buildBuilderRequest(builder, toRequestAstroState(astro), userContext);
      logger.info("Generating recipes with full recommendation pipeline", {
        mealTypes: request.options.mealTypes,
        ingredients: request.options.requiredIngredients,
        cuisines: builder.selectedCuisines,
        cookingMethods: builder.selectedCookingMethods,
        personalized: Boolean(userContext),
      });
      const outcome = await requestRecommendations(request);
      if (outcome.ok) {
        logger.info(`Generated ${outcome.recommendations.length} recipe suggestions`);
        onGenerated(outcome.recommendations);
        return;
      }
      openFailureRemedy(outcome);
      onError?.(outcome.message);
      onGenerated([]);
    } finally {
      onGeneratingChange(false);
    }
  }, [canGenerate, isGenerating, builder, astro, currentUser, onGenerated, onGeneratingChange, onError]);

  return { canGenerate, generate };
}

export default function GenerateRecipeButton({
  className = "",
  ...handlers
}: GenerateRecipeButtonProps): React.JSX.Element {
  const { isGenerating } = handlers;
  const { currentUser } = useUser();
  const { canGenerate, generate } = useBuilderGeneration(handlers);
  const phrase = useSynthesisPhrase(isGenerating);
  const isPersonalized = Boolean(currentUser?.natalChart);
  const isActive = canGenerate && !isGenerating;

  return (
    <div className={`space-y-3 ${className}`}>
      <button
        type="button"
        onClick={() => {
          generate().catch((err: unknown) => logger.error("Recipe generation failed:", err));
        }}
        disabled={!isActive}
        aria-busy={isGenerating}
        className={`relative w-full py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-300 overflow-hidden ${FOCUS_RING} ${
          isActive ? ACTIVE_STYLE : INERT_STYLE
        }`}
      >
        {/* Subtle animated gradient sweep overlay when active */}
        {isActive && (
          <span
            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"
            aria-hidden
          />
        )}
        <ButtonContent isGenerating={isGenerating} phrase={phrase} isPersonalized={isPersonalized} />
      </button>
      <p role="status" aria-live="polite" className="sr-only">
        {isGenerating ? phrase : ""}
      </p>
      <StatusRow canGenerate={canGenerate} isGenerating={isGenerating} isPersonalized={isPersonalized} />
    </div>
  );
}
