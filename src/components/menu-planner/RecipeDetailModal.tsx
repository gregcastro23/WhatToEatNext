"use client";

/**
 * Recipe Detail Modal
 * Full recipe view with serving scaling, tabbed content, and user notes
 *
 * @file src/components/menu-planner/RecipeDetailModal.tsx
 * @created 2026-01-28 (Session 7)
 */

import React, { useState, useMemo } from "react";
import type { Recipe, RecipeIngredient } from "@/types/recipe";
import { useRecipeCollections } from "@/hooks/useRecipeCollections";

interface RecipeDetailModalProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
  onAddToMeal?: (recipe: Recipe) => void;
}

type TabId = "overview" | "nutrition" | "notes";

/**
 * Format a quantity with fractions for display
 */
function formatQuantity(amount: number): string {
  if (amount === 0) return "";
  const whole = Math.floor(amount);
  const frac = amount - whole;

  const fractions: Record<string, string> = {
    "0.25": "\u00BC",
    "0.33": "\u2153",
    "0.5": "\u00BD",
    "0.67": "\u2154",
    "0.75": "\u00BE",
  };

  const fracKey = frac.toFixed(2);
  const fracStr = fractions[fracKey] || (frac > 0 ? frac.toFixed(1) : "");

  if (whole === 0) return fracStr || amount.toFixed(1);
  if (!fracStr) return whole.toString();
  return `${whole}${fracStr}`;
}

/**
 * Scale ingredient amounts based on serving multiplier
 */
function scaleIngredient(
  ingredient: RecipeIngredient,
  multiplier: number,
): RecipeIngredient {
  return {
    ...ingredient,
    amount: Math.round(ingredient.amount * multiplier * 100) / 100,
  };
}

/**
 * Parse time string to minutes for display
 */
function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const hourMatch = timeStr.match(/(\d+)\s*h/i);
  const minMatch = timeStr.match(/(\d+)\s*m/i);
  let total = 0;
  if (hourMatch) total += parseInt(hourMatch[1]) * 60;
  if (minMatch) total += parseInt(minMatch[1]);
  if (total === 0) {
    const num = parseInt(timeStr);
    if (!isNaN(num)) total = num;
  }
  return total > 0 ? total : null;
}

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function RecipeDetailModal({
  recipe,
  isOpen,
  onClose,
  onAddToMeal,
}: RecipeDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [noteText, setNoteText] = useState("");

  const {
    isFavorite,
    toggleFavorite,
    getRecipeNote,
    setRecipeNote,
    getRecipeRating,
    setRecipeRating,
    markViewed,
  } = useRecipeCollections();

  // Mark as viewed on open
  React.useEffect(() => {
    if (isOpen) {
      markViewed(recipe.id);
      setNoteText(getRecipeNote(recipe.id));
      setServingMultiplier(1);
    }
  }, [isOpen, recipe.id, markViewed, getRecipeNote]);

  const baseServings = recipe.servingSize || recipe.numberOfServings || 4;
  const scaledServings = Math.round(baseServings * servingMultiplier);

  const scaledIngredients = useMemo(
    () =>
      recipe.ingredients.map((ing) => scaleIngredient(ing, servingMultiplier)),
    [recipe.ingredients, servingMultiplier],
  );

  const prepMins = parseTimeToMinutes(recipe.prepTime);
  const cookMins = parseTimeToMinutes(recipe.cookTime);
  const totalMins =
    parseTimeToMinutes(recipe.totalTime) ||
    (prepMins || 0) + (cookMins || 0) || null;

  const rating = getRecipeRating(recipe.id);

  const handleSaveNote = () => {
    setRecipeNote(recipe.id, noteText);
  };

  const SERVING_PRESETS = [0.5, 1, 1.5, 2, 3, 4];

  if (!isOpen) return null;

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "nutrition", label: "Nutrition" },
    { id: "notes", label: "My Notes" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-800 truncate">
                  {recipe.name}
                </h2>
                <button
                  onClick={() => toggleFavorite(recipe.id)}
                  className="text-2xl flex-shrink-0"
                  title={
                    isFavorite(recipe.id)
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  {isFavorite(recipe.id) ? "\u2605" : "\u2606"}
                </button>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                {recipe.cuisine && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                    {recipe.cuisine}
                  </span>
                )}
                {totalMins && (
                  <span className="flex items-center gap-1">
                    <span>&#9201;</span>
                    {formatMinutes(totalMins)}
                  </span>
                )}
                {recipe.nutrition?.calories && (
                  <span className="flex items-center gap-1">
                    <span>&#128293;</span>
                    {Math.round(
                      recipe.nutrition.calories * servingMultiplier,
                    )}{" "}
                    cal
                  </span>
                )}
              </div>

              {/* Dietary badges */}
              <div className="flex flex-wrap gap-1 mt-2">
                {recipe.isVegetarian && (
                  <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                    Vegetarian
                  </span>
                )}
                {recipe.isVegan && (
                  <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                    Vegan
                  </span>
                )}
                {recipe.isGlutenFree && (
                  <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                    GF
                  </span>
                )}
                {recipe.isDairyFree && (
                  <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                    DF
                  </span>
                )}
              </div>

              {/* Star rating */}
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRecipeRating(recipe.id, star)}
                    className={`text-lg ${star <= rating ? "text-amber-400" : "text-gray-300"}`}
                  >
                    &#9733;
                  </button>
                ))}
                {rating > 0 && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({rating}/5)
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl leading-none ml-4"
            >
              &#215;
            </button>
          </div>

          {/* Time breakdown */}
          {(prepMins || cookMins) && (
            <div className="flex gap-4 mt-3 text-xs text-gray-600">
              {prepMins && (
                <span>
                  <strong>Prep:</strong> {formatMinutes(prepMins)}
                </span>
              )}
              {cookMins && (
                <span>
                  <strong>Cook:</strong> {formatMinutes(cookMins)}
                </span>
              )}
              {totalMins && (
                <span>
                  <strong>Total:</strong> {formatMinutes(totalMins)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Serving Adjuster */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Servings:</span>
          <div className="flex gap-1">
            {SERVING_PRESETS.map((mult) => (
              <button
                key={mult}
                onClick={() => setServingMultiplier(mult)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  servingMultiplier === mult
                    ? "bg-amber-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {Math.round(baseServings * mult)}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-500">
            (Base: {baseServings} servings)
          </span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-amber-700 border-b-2 border-amber-600 bg-amber-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ingredients */}
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-3">
                  Ingredients
                  {servingMultiplier !== 1 && (
                    <span className="text-sm font-normal text-amber-600 ml-2">
                      (scaled to {scaledServings} servings)
                    </span>
                  )}
                </h3>
                <ul className="space-y-2">
                  {scaledIngredients.map((ing, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-500 mt-0.5 flex-shrink-0">
                        &#8226;
                      </span>
                      <span>
                        <strong>
                          {formatQuantity(ing.amount)} {ing.unit}
                        </strong>{" "}
                        {ing.name}
                        {ing.preparation && (
                          <span className="text-gray-500">
                            , {ing.preparation}
                          </span>
                        )}
                        {ing.optional && (
                          <span className="text-gray-400 italic">
                            {" "}
                            (optional)
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Substitutions */}
                {recipe.substitutions && recipe.substitutions.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-sm text-yellow-800 mb-2">
                      Substitutions
                    </h4>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      {recipe.substitutions.map((sub, idx) => (
                        <li key={idx}>
                          <strong>{sub.original}</strong> →{" "}
                          {sub.alternatives.join(", ")}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-3">
                  Instructions
                </h3>
                <ol className="space-y-3">
                  {recipe.instructions.map((step, idx) => (
                    <li key={idx} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>

                {/* Tips */}
                {recipe.tips && recipe.tips.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-sm text-blue-800 mb-2">
                      Tips
                    </h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      {recipe.tips.map((tip, idx) => (
                        <li key={idx}>&#8226; {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Equipment */}
                {recipe.equipmentNeeded &&
                  recipe.equipmentNeeded.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-1">
                        Equipment Needed
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {recipe.equipmentNeeded.map((eq, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {activeTab === "nutrition" && (
            <div>
              {recipe.nutrition ? (
                <div className="space-y-6">
                  {/* Macro summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Calories",
                        value: recipe.nutrition.calories,
                        unit: "kcal",
                        color: "bg-red-50 text-red-700 border-red-200",
                      },
                      {
                        label: "Protein",
                        value:
                          recipe.nutrition.protein ||
                          recipe.nutrition.macronutrients?.protein,
                        unit: "g",
                        color: "bg-blue-50 text-blue-700 border-blue-200",
                      },
                      {
                        label: "Carbs",
                        value:
                          recipe.nutrition.carbs ||
                          recipe.nutrition.macronutrients?.carbs,
                        unit: "g",
                        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
                      },
                      {
                        label: "Fat",
                        value:
                          recipe.nutrition.fat ||
                          recipe.nutrition.macronutrients?.fat,
                        unit: "g",
                        color: "bg-green-50 text-green-700 border-green-200",
                      },
                    ].map(
                      (macro) =>
                        macro.value != null && (
                          <div
                            key={macro.label}
                            className={`p-4 rounded-lg border-2 text-center ${macro.color}`}
                          >
                            <div className="text-2xl font-bold">
                              {Math.round(
                                (macro.value as number) * servingMultiplier,
                              )}
                            </div>
                            <div className="text-xs font-medium">
                              {macro.label} ({macro.unit})
                            </div>
                          </div>
                        ),
                    )}
                  </div>

                  {recipe.nutrition.fiber != null && (
                    <div className="text-sm text-gray-600">
                      Fiber:{" "}
                      {Math.round(
                        recipe.nutrition.fiber * servingMultiplier,
                      )}
                      g per serving
                    </div>
                  )}

                  {/* Vitamins & Minerals */}
                  {recipe.nutrition.vitamins &&
                    recipe.nutrition.vitamins.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">
                          Vitamins
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {recipe.nutrition.vitamins.map((v, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs"
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {recipe.nutrition.minerals &&
                    recipe.nutrition.minerals.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">
                          Minerals
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {recipe.nutrition.minerals.map((m, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded text-xs"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  <p className="text-xs text-gray-400">
                    Values shown per {scaledServings} serving
                    {scaledServings !== 1 ? "s" : ""}
                    {servingMultiplier !== 1 && " (scaled)"}
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <p className="text-lg mb-2">
                    No nutrition data available for this recipe.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-800">
                Personal Notes
              </h3>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add your personal notes, modifications, tips..."
                className="w-full h-40 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none text-sm resize-y"
              />
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
              >
                Save Note
              </button>

              {/* Chef notes from recipe */}
              {recipe.chefNotes && recipe.chefNotes.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">
                    Chef&apos;s Notes
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {recipe.chefNotes.map((note, idx) => (
                      <li key={idx}>&#8226; {note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.variations && recipe.variations.length > 0 && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-700 mb-2">
                    Variations
                  </h4>
                  <ul className="text-sm text-purple-600 space-y-1">
                    {recipe.variations.map((v, idx) => (
                      <li key={idx}>&#8226; {v}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {recipe.description && (
              <span className="line-clamp-1">{recipe.description}</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
            {onAddToMeal && (
              <button
                onClick={() => onAddToMeal(recipe)}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg transition-all font-medium"
              >
                Add to Meal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
