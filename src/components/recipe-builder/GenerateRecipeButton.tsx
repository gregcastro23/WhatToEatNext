"use client";

/**
 * Generate Recipe Button
 * Gathers user selections from RecipeBuilderContext and planetary data from AlchemicalContext,
 * then triggers recipe generation via the UnifiedRecipeBuildingSystem.
 *
 * @file src/components/recipe-builder/GenerateRecipeButton.tsx
 */

import React, { useState, useCallback } from "react";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import type {
  RecipeBuildingCriteria,
  RecipeGenerationResult,
} from "@/data/unified/recipeBuilding";
import { UnifiedRecipeBuildingSystem } from "@/data/unified/recipeBuilding";
import { createLogger } from "@/utils/logger";

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
  const [isExpanded, setIsExpanded] = useState(false);

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

      // Strip "(Monica Enhanced)" from recipe name if present
      const cleanedResult = {
        ...generationResult,
        recipe: {
          ...generationResult.recipe,
          name: generationResult.recipe.name
            .replace(/\s*\(Monica Enhanced\)\s*/gi, "")
            .trim(),
        },
      };

      setResult(cleanedResult);
      setIsExpanded(false);
      onGenerated?.(cleanedResult);

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

      {/* Result preview — click to expand */}
      {result && (
        <div className="mt-4 rounded-xl border-2 border-green-200 bg-green-50 overflow-hidden">
          {/* Header row — always visible, click to toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            className="w-full text-left p-4 hover:bg-green-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-green-900 text-base">{result.recipe.name}</h4>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-200 text-green-800 font-medium">
                  {Math.round(result.confidence * 100)}% match
                </span>
                <span className="text-green-600 text-sm">{isExpanded ? "▲" : "▼"}</span>
              </div>
            </div>

            {result.recipe.description && (
              <p className="text-sm text-green-800 mt-1">{result.recipe.description}</p>
            )}

            {/* Metadata chips */}
            <div className="flex flex-wrap gap-2 text-xs mt-2">
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

            {!isExpanded && (
              <p className="text-xs text-green-500 mt-2">Click to view full recipe ↓</p>
            )}
          </button>

          {/* Expanded detail view */}
          {isExpanded && (
            <div className="border-t border-green-200 p-4 space-y-4">
              {/* Elemental property bars */}
              {result.recipe.elementalProperties && (
                <div>
                  <div className="text-xs font-semibold text-green-800 mb-2 uppercase tracking-wide">
                    Elemental Profile
                  </div>
                  {(["Fire", "Water", "Earth", "Air"] as const).map((el) => {
                    const val = result.recipe.elementalProperties?.[el] ?? 0;
                    const pct = Math.round(val * 100);
                    const colors: Record<string, string> = {
                      Fire: "bg-orange-400",
                      Water: "bg-blue-400",
                      Earth: "bg-amber-700",
                      Air: "bg-sky-300",
                    };
                    const icons: Record<string, string> = {
                      Fire: "🔥", Water: "💧", Earth: "🌍", Air: "💨",
                    };
                    return (
                      <div key={el} className="flex items-center gap-2 mb-1">
                        <span className="text-xs w-14 text-green-700 font-medium">
                          {icons[el]} {el}
                        </span>
                        <div className="flex-1 bg-green-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${colors[el]} transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-green-600 w-8 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Monica / Alchemical scores */}
              {(result.recipe as any).alchemicalProperties && (
                <div>
                  <div className="text-xs font-semibold text-green-800 mb-2 uppercase tracking-wide">
                    Alchemical Scores
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {(result.recipe as any).alchemicalProperties.monicaConstant != null && (
                      <span className="px-2 py-1 rounded bg-purple-50 border border-purple-200 text-purple-700">
                        Monica: {Number((result.recipe as any).alchemicalProperties.monicaConstant).toFixed(3)}
                      </span>
                    )}
                    {(result.recipe as any).alchemicalProperties.totalKalchm != null && (
                      <span className="px-2 py-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-700">
                        Kalchm: {Number((result.recipe as any).alchemicalProperties.totalKalchm).toFixed(2)}
                      </span>
                    )}
                    {(result.recipe as any).alchemicalProperties.alchemicalClassification && (
                      <span className="px-2 py-1 rounded bg-green-100 border border-green-300 text-green-700">
                        {(result.recipe as any).alchemicalProperties.alchemicalClassification}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Full ingredient list */}
              {result.recipe.ingredients && result.recipe.ingredients.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-green-800 mb-2 uppercase tracking-wide">
                    Ingredients ({result.recipe.ingredients.length})
                  </div>
                  <ul className="text-sm text-green-900 space-y-1">
                    {result.recipe.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-green-400 mt-0.5">•</span>
                        <span>
                          {ing.amount} {ing.unit} <strong>{ing.name}</strong>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Step-by-step instructions */}
              {result.recipe.instructions && result.recipe.instructions.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-green-800 mb-2 uppercase tracking-wide">
                    Instructions
                  </div>
                  <ol className="text-sm text-green-900 space-y-2">
                    {result.recipe.instructions.map((step, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-green-200 text-green-800 text-xs font-bold flex items-center justify-center mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Alternatives */}
              {result.alternatives && result.alternatives.length > 0 && (
                <div className="text-xs text-green-600 pt-1 border-t border-green-100">
                  +{result.alternatives.length} alternative recipe{result.alternatives.length !== 1 ? "s" : ""} available
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-2 border-t border-green-200">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2 px-3 rounded-lg text-xs font-medium bg-white border border-green-300 text-green-700 hover:bg-green-50 transition-colors"
                >
                  Print Recipe
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const text = [
                      result.recipe.name,
                      "",
                      "INGREDIENTS:",
                      ...(result.recipe.ingredients?.map((i) => `• ${i.amount} ${i.unit} ${i.name}`) ?? []),
                      "",
                      "INSTRUCTIONS:",
                      ...(result.recipe.instructions?.map((s, i) => `${i + 1}. ${s}`) ?? []),
                    ].join("\n");
                    navigator.clipboard?.writeText(text).catch(() => {});
                  }}
                  className="flex-1 py-2 px-3 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
