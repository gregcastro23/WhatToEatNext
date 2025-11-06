'use client';

/**
 * Cuisine Preview Component
 * Shows a preview of cuisine recommendations with nested recipes and sauces
 * Uses real API data from /api/cuisines/recommend
 */

import React, { useState, useEffect } from 'react';

interface NestedRecipe {
  recipe_id: string;
  name: string;
  description: string;
  prep_time?: string;
  cook_time?: string;
  meal_type: string;
  seasonal_fit: string;
}

interface SauceRecommendation {
  sauce_name: string;
  description: string;
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

  useEffect(() => {
    fetch('/api/cuisines/recommend')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch cuisine recommendations');
        return res.json();
      })
      .then(data => {
        setCuisines(data.cuisine_recommendations || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load cuisine recommendations');
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
        <p className="text-lg font-medium text-gray-700">Analyzing cosmic culinary influences...</p>
        <p className="text-sm text-gray-500 mt-2">Calculating astrological cuisine compatibility</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center py-12 bg-red-50 rounded-lg border border-red-200">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-lg font-medium text-red-800 mb-2">Unable to load cuisine recommendations</p>
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
                  <h3 className="text-xl font-bold text-gray-900">{cuisine.name}</h3>
                  <div className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Active recommendation" />
                </div>
                <p className="text-sm text-gray-700 mb-2">{cuisine.description}</p>
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
                  {expandedCuisine === cuisine.cuisine_id ? '−' : '+'}
                </div>
              </div>
            </div>
          </div>

          {expandedCuisine === cuisine.cuisine_id && (
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
              {/* Elemental Properties */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">⚗️</span>
                  <span>Elemental Balance</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(cuisine.elemental_properties).map(([element, value]) => (
                    <div key={element} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-800">{element}</span>
                        <span className={`text-2xl ${
                          element === 'Fire' ? '🔥' :
                          element === 'Water' ? '💧' :
                          element === 'Earth' ? '🌍' :
                          '💨'
                        }`}>{
                          element === 'Fire' ? '🔥' :
                          element === 'Water' ? '💧' :
                          element === 'Earth' ? '🌍' :
                          '💨'
                        }</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            element === 'Fire' ? 'bg-gradient-to-r from-red-400 to-orange-500' :
                            element === 'Water' ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                            element === 'Earth' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                            'bg-gradient-to-r from-purple-400 to-indigo-500'
                          }`}
                          style={{ width: `${value * 100}%` }}
                        />
                      </div>
                      <div className="text-right mt-1">
                        <span className="text-xs font-semibold text-gray-600">{(value * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nested Recipes */}
              {cuisine.nested_recipes && cuisine.nested_recipes.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🍲</span>
                    <span>Featured Recipes</span>
                  </h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cuisine.nested_recipes.slice(0, 3).map((recipe) => (
                      <div key={recipe.recipe_id} className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 mb-1">{recipe.name}</div>
                            <div className="text-xs text-gray-600 line-clamp-2">{recipe.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                            {recipe.seasonal_fit}
                          </span>
                          {recipe.meal_type && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                              {recipe.meal_type}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-3 mt-2 text-xs text-gray-600 font-medium">
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
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nested Sauces */}
              {cuisine.recommended_sauces && cuisine.recommended_sauces.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🥫</span>
                    <span>Complementary Sauces</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cuisine.recommended_sauces.slice(0, 5).map((sauce, idx) => (
                      <div
                        key={idx}
                        className="group relative bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-900 px-4 py-2 rounded-full text-sm font-medium border border-indigo-200 transition-all cursor-help"
                        title={sauce.reason}
                      >
                        <div className="flex items-center gap-2">
                          <span>{sauce.sauce_name}</span>
                          <span className="bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded-full text-xs font-bold">
                            {(sauce.compatibility_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compatibility Reason */}
              {cuisine.compatibility_reason && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-blue-900">
                    <span className="font-bold text-blue-800">🌟 Why recommended:</span> {cuisine.compatibility_reason}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {cuisines.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-dashed border-purple-200">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">No cuisine recommendations available</p>
          <p className="text-sm text-gray-500">The stars are still aligning... Please check back soon.</p>
        </div>
      )}
    </div>
  );
}
