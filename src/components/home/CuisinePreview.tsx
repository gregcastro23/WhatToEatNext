'use client';

/**
 * Cuisine Preview Component
 * Shows a preview of cuisine recommendations with nested recipes and sauces
 * Click to expand for full details
 */

import React, { useState, useEffect } from 'react';

interface CuisineRecommendation {
  cuisine_name: string;
  compatibility_score: number;
  description: string;
  recipes?: Array<{
    name: string;
    description: string;
    prep_time?: string;
  }>;
  sauces?: Array<{
    sauce_name: string;
    compatibility_score: number;
  }>;
}

export default function CuisinePreview() {
  const [cuisines, setCuisines] = useState<CuisineRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCuisine, setExpandedCuisine] = useState<string | null>(null);

  useEffect(() => {
    // Fetch cuisine recommendations
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

  const toggleCuisine = (cuisineName: string) => {
    setExpandedCuisine(expandedCuisine === cuisineName ? null : cuisineName);
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
      {cuisines.slice(0, 5).map((cuisine, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
          <div
            className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleCuisine(cuisine.cuisine_name)}
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{cuisine.cuisine_name}</h3>
                <p className="text-sm text-gray-600">{cuisine.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {(cuisine.compatibility_score * 100).toFixed(0)}%
                </div>
                <div className="text-2xl text-gray-400">
                  {expandedCuisine === cuisine.cuisine_name ? '−' : '+'}
                </div>
              </div>
            </div>
          </div>

          {expandedCuisine === cuisine.cuisine_name && (
            <div className="p-4 bg-white border-t border-gray-200">
              {/* Nested Recipes */}
              {cuisine.recipes && cuisine.recipes.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">🍲 Featured Recipes</h4>
                  <div className="space-y-2">
                    {cuisine.recipes.slice(0, 3).map((recipe, idx) => (
                      <div key={idx} className="bg-purple-50 p-3 rounded-lg">
                        <div className="font-medium text-gray-900">{recipe.name}</div>
                        <div className="text-sm text-gray-600">{recipe.description}</div>
                        {recipe.prep_time && (
                          <div className="text-xs text-gray-500 mt-1">⏱️ {recipe.prep_time}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nested Sauces */}
              {cuisine.sauces && cuisine.sauces.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">🥫 Complementary Sauces</h4>
                  <div className="flex flex-wrap gap-2">
                    {cuisine.sauces.slice(0, 5).map((sauce, idx) => (
                      <div
                        key={idx}
                        className="bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full text-sm"
                      >
                        {sauce.sauce_name} ({(sauce.compatibility_score * 100).toFixed(0)}%)
                      </div>
                    ))}
                  </div>
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
