"use client";

/**
 * Generate Recipe Button
 * Gathers user selections from RecipeBuilderContext and planetary data from AlchemicalContext,
 * then triggers recipe generation via the UnifiedRecipeBuildingSystem.
 *
 * @file src/components/recipe-builder/GenerateRecipeButton.tsx
 */

import React, { useState, useCallback } from "react";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import { createLogger } from "@/utils/logger";
import type {
  RecipeBuildingCriteria,
  RecipeGenerationResult,
} from "@/data/unified/recipeBuilding";
import { UnifiedRecipeBuildingSystem } from "@/data/unified/recipeBuilding";

const logger = createLogger("GenerateRecipeButton");

interface GenerateRecipeButtonProps {
  onGenerated?: (result: RecipeGenerationResult) => void;
  className?: string;
}

export default function GenerateRecipeButton({
  onGenerated,
  className = "",
}: GenerateRecipeButtonProps) {
  const builder = useRecipeBuilder();
  const { state: alchemicalState, planetaryPositions } = useAlchemical();
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<RecipeGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = builder.totalItems > 0 || builder.mealType;

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Build criteria from user selections + planetary data
      const criteria: RecipeBuildingCriteria = {
        mealType: builder.mealType ? [builder.mealType] : undefined,
        dietaryRestrictions: builder.dietaryPreferences.length > 0
          ? builder.dietaryPreferences
          : undefined,
        allergens: builder.allergies.length > 0
          ? builder.allergies
          : undefined,
        requiredIngredients: builder.selectedIngredients.length > 0
          ? builder.selectedIngredients.map((i) => i.name)
          : undefined,
        cookingMethods: builder.selectedCookingMethods.length > 0
          ? builder.selectedCookingMethods
          : undefined,
        cuisine: builder.selectedCuisines.length > 0
          ? builder.selectedCuisines[0]
          : undefined,
        lunarPhase: alchemicalState?.lunarPhase as any,
        currentZodiacSignType: alchemicalState?.zodiacEnergy as any,
      };

      logger.info("Generating recipe with criteria:", criteria as any);

      // Use the UnifiedRecipeBuildingSystem
      const system = new UnifiedRecipeBuildingSystem();
      const generationResult = system.generateMonicaOptimizedRecipe(criteria);

      setResult(generationResult);
      onGenerated?.(generationResult);

      logger.info(
        `Recipe generated: "${generationResult.recipe.name}" with confidence ${generationResult.confidence}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate recipe";
      setError(message);
      logger.error("Recipe generation failed:", err as any);
    } finally {
      setIsGenerating(false);
    }
  }, [canGenerate, isGenerating, builder, alchemicalState, onGenerated]);

  return (
    <div className={className}>
      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        className={`
          w-full py-3 px-6 rounded-xl font-bold text-sm transition-all
          ${canGenerate && !isGenerating
            ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white hover:from-purple-700 hover:to-orange-600 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating...
          </span>
        ) : (
          "Generate Recipe"
        )}
      </button>

      {/* Help text */}
      {!canGenerate && (
        <p className="text-xs text-gray-400 text-center mt-2">
          Add at least one ingredient, cuisine, or cooking method to generate
        </p>
      )}

      {/* Error display */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Result preview */}
      {result && (
        <div className="mt-4 p-4 rounded-xl border-2 border-green-200 bg-green-50">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-bold text-green-900">{result.recipe.name}</h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-200 text-green-800 font-medium">
              {Math.round(result.confidence * 100)}% match
            </span>
          </div>

          {result.recipe.description && (
            <p className="text-sm text-green-800 mb-3">
              {result.recipe.description}
            </p>
          )}

          {/* Generation metadata */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700">
              Criteria: {result.generationMetadata.criteriaMatched}/{result.generationMetadata.totalCriteria}
            </span>
            {result.generationMetadata.monicaOptimization > 0 && (
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                Monica: {Math.round(result.generationMetadata.monicaOptimization * 100)}%
              </span>
            )}
            {result.generationMetadata.seasonalAlignment > 0 && (
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                Seasonal: {Math.round(result.generationMetadata.seasonalAlignment * 100)}%
              </span>
            )}
          </div>

          {/* Ingredients preview */}
          {result.recipe.ingredients && result.recipe.ingredients.length > 0 && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="text-xs font-medium text-green-700 mb-1">Ingredients:</div>
              <ul className="text-xs text-green-800 space-y-0.5">
                {result.recipe.ingredients.slice(0, 8).map((ing, idx) => (
                  <li key={idx}>
                    {ing.amount} {ing.unit} {ing.name}
                  </li>
                ))}
                {result.recipe.ingredients.length > 8 && (
                  <li className="text-green-500">
                    +{result.recipe.ingredients.length - 8} more...
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Alternatives count */}
          {result.alternatives && result.alternatives.length > 0 && (
            <div className="mt-2 text-xs text-green-600">
              +{result.alternatives.length} alternative recipe{result.alternatives.length !== 1 ? "s" : ""} available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
