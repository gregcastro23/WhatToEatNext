"use client";

/**
 * Cuisine Preview Component
 * Shows a preview of cuisine recommendations with nested recipes and sauces
 * Uses real API data from /api/cuisines/recommend
 */

import React, { useState, useEffect } from "react";

interface NestedRecipe {
  recipe_id: string;
  name: string;
  description: string;
  prep_time?: string;
  cook_time?: string;
  servings?: number;
  difficulty?: string;
  ingredients: Array<{
    name: string;
    amount?: string;
    unit?: string;
    notes?: string;
  }>;
  instructions: string[];
  meal_type: string;
  seasonal_fit: string;
}

interface SauceRecommendation {
  sauce_name: string;
  description: string;
  key_ingredients?: string[];
  compatibility_score: number;
  reason: string;
}

interface CuisineRecommendation {
  cuisine_id: string;
  name: string;
  description: string;
  elemental_properties: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  nested_recipes: NestedRecipe[];
  recommended_sauces: SauceRecommendation[];
  seasonal_context: string;
  astrological_score: number;
  compatibility_reason: string;
}

export default function CuisinePreview() {
  const [cuisines, setCuisines] = useState<CuisineRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCuisine, setExpandedCuisine] = useState<string | null>(null);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [showElemental, setShowElemental] = useState(false);

  useEffect(() => {
    fetch("/api/cuisines/recommend")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch cuisine recommendations");
        return res.json();
      })
      .then((data) => {
        setCuisines(data.cuisine_recommendations || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load cuisine recommendations");
        setLoading(false);
      });
  }, []);

  const toggleCuisine = (cuisineId: string) => {
    setExpandedCuisine(expandedCuisine === cuisineId ? null : cuisineId);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mb-4" />
        <p className="text-lg font-medium text-gray-700">
          Analyzing cosmic culinary influences...
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Calculating astrological cuisine compatibility
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center py-12 bg-red-50 rounded-lg border border-red-200">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-lg font-medium text-red-800 mb-2">
          Unable to load cuisine recommendations
        </p>
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cuisines.slice(0, 5).map((cuisine) => (
        <div
          key={cuisine.cuisine_id}
          className="border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white"
        >
          <div
            className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-5 cursor-pointer hover:from-purple-100 hover:via-indigo-100 hover:to-blue-100 transition-all duration-300"
            onClick={() => toggleCuisine(cuisine.cuisine_id)}
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {cuisine.name}
                  </h3>
                  <div
                    className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"
                    title="Active recommendation"
                  />
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  {cuisine.description}
                </p>
                {cuisine.seasonal_context && (
                  <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                    <span>✨</span>
                    <span>{cuisine.seasonal_context}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 ml-4">
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-full text-base font-bold shadow-lg">
                    {(cuisine.astrological_score * 100).toFixed(0)}%
                  </div>
                  <span className="text-xs text-gray-500 mt-1">match</span>
                </div>
                <div className="text-3xl text-gray-400 font-light">
                  {expandedCuisine === cuisine.cuisine_id ? "−" : "+"}
                </div>
              </div>
            </div>
          </div>

          {expandedCuisine === cuisine.cuisine_id && (
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
              {/* Nested Recipes - PRIMARY FOCUS */}
              {cuisine.nested_recipes && cuisine.nested_recipes.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-xl">
                    <span className="text-3xl">🍲</span>
                    <span>
                      Featured Recipes ({cuisine.nested_recipes.length})
                    </span>
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {cuisine.nested_recipes.map((recipe) => (
                      <div
                        key={recipe.recipe_id}
                        className="bg-white border-2 border-purple-100 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                      >
                        <div
                          className="p-4 cursor-pointer hover:bg-purple-50 transition-colors"
                          onClick={() =>
                            setExpandedRecipe(
                              expandedRecipe === recipe.recipe_id
                                ? null
                                : recipe.recipe_id,
                            )
                          }
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="font-bold text-gray-900 text-lg mb-1 flex items-center gap-2">
                                {recipe.name}
                                <span className="text-xl">
                                  {expandedRecipe === recipe.recipe_id
                                    ? "−"
                                    : "+"}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 line-clamp-2">
                                {recipe.description}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                              {recipe.seasonal_fit}
                            </span>
                            {recipe.meal_type && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                {recipe.meal_type}
                              </span>
                            )}
                            {recipe.difficulty && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                                {recipe.difficulty}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-4 mt-3 text-sm text-gray-700 font-medium">
                            {recipe.prep_time && (
                              <div className="flex items-center gap-1">
                                <span>⏱️</span>
                                <span>{recipe.prep_time}</span>
                              </div>
                            )}
                            {recipe.cook_time && (
                              <div className="flex items-center gap-1">
                                <span>🔥</span>
                                <span>{recipe.cook_time}</span>
                              </div>
                            )}
                            {recipe.servings && (
                              <div className="flex items-center gap-1">
                                <span>👥</span>
                                <span>{recipe.servings} servings</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expanded Recipe Details */}
                        {expandedRecipe === recipe.recipe_id && (
                          <div className="border-t border-purple-100 p-4 bg-gradient-to-br from-purple-50 to-white">
                            {/* Ingredients */}
                            <div className="mb-4">
                              <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-1">
                                <span>🥘</span>
                                <span>
                                  Ingredients ({recipe.ingredients.length})
                                </span>
                              </h5>
                              <div className="grid grid-cols-1 gap-1">
                                {recipe.ingredients.map((ing, idx) => (
                                  <div
                                    key={idx}
                                    className="text-sm text-gray-700 pl-4"
                                  >
                                    •{" "}
                                    {ing.amount && ing.unit
                                      ? `${ing.amount} ${ing.unit}`
                                      : ""}{" "}
                                    {ing.name}
                                    {ing.notes && (
                                      <span className="text-gray-500 italic">
                                        {" "}
                                        ({ing.notes})
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Cooking Instructions */}
                            {recipe.instructions &&
                              recipe.instructions.length > 0 && (
                                <div className="mb-4">
                                  <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-1">
                                    <span>📝</span>
                                    <span>Cooking Instructions</span>
                                  </h5>
                                  <ol className="list-decimal list-inside space-y-2">
                                    {recipe.instructions.map((step, idx) => (
                                      <li
                                        key={idx}
                                        className="text-sm text-gray-700 pl-2"
                                      >
                                        {step}
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nested Sauces */}
              {cuisine.recommended_sauces &&
                cuisine.recommended_sauces.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-lg">
                      <span className="text-2xl">🥫</span>
                      <span>Complementary Sauces</span>
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {cuisine.recommended_sauces.map((sauce, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-indigo-100 rounded-lg p-3 hover:shadow-md transition-all"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-bold text-indigo-900">
                              {sauce.sauce_name}
                            </div>
                            <span className="bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-full text-xs font-bold">
                              {(sauce.compatibility_score * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {sauce.description}
                          </p>
                          {sauce.key_ingredients &&
                            sauce.key_ingredients.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {sauce.key_ingredients.map((ing, i) => (
                                  <span
                                    key={i}
                                    className="text-xs bg-orange-50 text-orange-800 px-2 py-0.5 rounded-full"
                                  >
                                    {ing}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Compatibility Reason */}
              {cuisine.compatibility_reason && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-blue-900">
                    <span className="font-bold text-blue-800">
                      🌟 Why recommended:
                    </span>{" "}
                    {cuisine.compatibility_reason}
                  </p>
                </div>
              )}

              {/* Elemental Properties - Collapsible, De-emphasized */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowElemental(!showElemental)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <span className="text-lg">⚗️</span>
                  <span>
                    {showElemental ? "Hide" : "Show"} Elemental Balance
                  </span>
                  <span className="text-lg">{showElemental ? "−" : "+"}</span>
                </button>
                {showElemental && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(cuisine.elemental_properties).map(
                      ([element, value]) => (
                        <div
                          key={element}
                          className="bg-gray-50 p-2 rounded-lg border border-gray-100"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-700">
                              {element}
                            </span>
                            <span className="text-sm">
                              {element === "Fire"
                                ? "🔥"
                                : element === "Water"
                                  ? "💧"
                                  : element === "Earth"
                                    ? "🌍"
                                    : "💨"}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                element === "Fire"
                                  ? "bg-gradient-to-r from-red-400 to-orange-500"
                                  : element === "Water"
                                    ? "bg-gradient-to-r from-blue-400 to-cyan-500"
                                    : element === "Earth"
                                      ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                      : "bg-gradient-to-r from-purple-400 to-indigo-500"
                              }`}
                              style={{ width: `${value * 100}%` }}
                            />
                          </div>
                          <div className="text-right mt-0.5">
                            <span className="text-xs font-semibold text-gray-500">
                              {(value * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {cuisines.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-dashed border-purple-200">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">
            No cuisine recommendations available
          </p>
          <p className="text-sm text-gray-500">
            The stars are still aligning... Please check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
