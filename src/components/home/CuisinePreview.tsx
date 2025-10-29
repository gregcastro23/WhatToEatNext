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
  const [expandedCuisine, setExpandedCuisine] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/cuisines/recommend')
      .then(res => res.json())
      .then(data => {
        setCuisines(data.cuisine_recommendations || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const toggleCuisine = (cuisineId: string) => {
    setExpandedCuisine(expandedCuisine === cuisineId ? null : cuisineId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cuisines.slice(0, 5).map((cuisine) => (
        <div key={cuisine.cuisine_id} className="border border-gray-200 rounded-lg overflow-hidden">
          <div
            className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleCuisine(cuisine.cuisine_id)}
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{cuisine.name}</h3>
                <p className="text-sm text-gray-600">{cuisine.description}</p>
                {cuisine.seasonal_context && (
                  <p className="text-xs text-purple-600 mt-1">✨ {cuisine.seasonal_context}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {(cuisine.astrological_score * 100).toFixed(0)}%
                </div>
                <div className="text-2xl text-gray-400">
                  {expandedCuisine === cuisine.cuisine_id ? '−' : '+'}
                </div>
              </div>
            </div>
          </div>

          {expandedCuisine === cuisine.cuisine_id && (
            <div className="p-4 bg-white border-t border-gray-200">
              {/* Elemental Properties */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">⚗️ Elemental Balance</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(cuisine.elemental_properties).map(([element, value]) => (
                    <div key={element} className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600 w-12">{element}</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            element === 'Fire' ? 'bg-red-500' :
                            element === 'Water' ? 'bg-blue-500' :
                            element === 'Earth' ? 'bg-green-500' :
                            'bg-purple-500'
                          }`}
                          style={{ width: `${value * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{(value * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nested Recipes */}
              {cuisine.nested_recipes && cuisine.nested_recipes.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">🍲 Featured Recipes</h4>
                  <div className="space-y-2">
                    {cuisine.nested_recipes.slice(0, 3).map((recipe) => (
                      <div key={recipe.recipe_id} className="bg-purple-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{recipe.name}</div>
                            <div className="text-sm text-gray-600">{recipe.description}</div>
                          </div>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {recipe.seasonal_fit}
                          </span>
                        </div>
                        <div className="flex gap-3 mt-2 text-xs text-gray-500">
                          {recipe.prep_time && <span>⏱️ {recipe.prep_time} prep</span>}
                          {recipe.cook_time && <span>🔥 {recipe.cook_time} cook</span>}
                          {recipe.meal_type && <span>🍽️ {recipe.meal_type}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nested Sauces */}
              {cuisine.recommended_sauces && cuisine.recommended_sauces.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">🥫 Complementary Sauces</h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {cuisine.recommended_sauces.slice(0, 5).map((sauce, idx) => (
                      <div
                        key={idx}
                        className="bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full text-sm"
                        title={sauce.reason}
                      >
                        {sauce.sauce_name} ({(sauce.compatibility_score * 100).toFixed(0)}%)
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compatibility Reason */}
              {cuisine.compatibility_reason && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Why recommended:</span> {cuisine.compatibility_reason}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {cuisines.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No cuisine recommendations available at this time.
        </div>
      )}
    </div>
  );
}
