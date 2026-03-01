'use client';

import React, { useEffect, useState } from 'react';
import type { NatalChart } from '@/types/natalChart';

interface RecommendationsPanelProps {
  email: string;
  natalChart: NatalChart;
  preferences: UserPreferences;
}

interface UserPreferences {
  dietaryRestrictions: string[];
  preferredCuisines: string[];
  dislikedIngredients: string[];
  spicePreference: 'mild' | 'medium' | 'hot';
  complexity: 'simple' | 'moderate' | 'complex';
}

interface CuisineRecommendation {
  cuisine_id: string;
  name: string;
  description: string;
  elemental_properties: Record<string, number>;
  alchemical_properties: Record<string, number>;
  flavor_profile: Record<string, number>;
  nested_recipes: Array<{
    recipe_id: string;
    name: string;
    description: string;
    prep_time: string;
    cook_time: string;
    difficulty: string;
    meal_type: string;
  }>;
}

interface PersonalizedData {
  chartComparison: {
    overallHarmony: number;
    elementalHarmony: number;
    alchemicalAlignment: number;
    planetaryResonance: number;
  };
  recommendations: {
    favorableElements: string[];
    challengingElements: string[];
    harmonicPlanets: string[];
    insights: string[];
    suggestedCuisines: string[];
    suggestedCookingMethods: string[];
  };
}

type SubTab = 'cuisines' | 'methods' | 'ingredients';

const ELEMENT_COLORS: Record<string, { bg: string; text: string }> = {
  Fire: { bg: 'bg-red-50', text: 'text-red-700' },
  Water: { bg: 'bg-blue-50', text: 'text-blue-700' },
  Earth: { bg: 'bg-green-50', text: 'text-green-700' },
  Air: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
};

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  email,
  natalChart,
  preferences,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('cuisines');
  const [personalData, setPersonalData] = useState<PersonalizedData | null>(null);
  const [cuisines, setCuisines] = useState<CuisineRecommendation[]>([]);
  const [expandedCuisine, setExpandedCuisine] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!natalChart || !email) {
      setIsLoading(false);
      return;
    }

    async function loadRecommendations() {
      setIsLoading(true);
      setError(null);

      try {
        const [personalRes, cuisineRes] = await Promise.all([
          fetch('/api/personalized-recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, includeChartAnalysis: true }),
          }),
          fetch('/api/cuisines/recommend'),
        ]);

        if (personalRes.ok) {
          const personalResult = await personalRes.json();
          if (personalResult.success && personalResult.data) {
            setPersonalData(personalResult.data);
          }
        }

        if (cuisineRes.ok) {
          const cuisineResult = await cuisineRes.json();
          if (cuisineResult.recommendations) {
            let filtered = cuisineResult.recommendations as CuisineRecommendation[];
            if (preferences.preferredCuisines.length > 0) {
              filtered = [
                ...filtered.filter((c) =>
                  preferences.preferredCuisines.some(
                    (p) => c.name.toLowerCase().includes(p.toLowerCase())
                  )
                ),
                ...filtered.filter((c) =>
                  !preferences.preferredCuisines.some(
                    (p) => c.name.toLowerCase().includes(p.toLowerCase())
                  )
                ),
              ];
            }
            setCuisines(filtered);
          }
        }
      } catch (err) {
        console.error('Failed to load recommendations:', err);
        setError('Unable to load recommendations. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    loadRecommendations();
  }, [email, natalChart, preferences.preferredCuisines]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
          <p className="text-gray-600 text-sm">Loading personalized recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Sub-tab navigation */}
      <div className="bg-white rounded-xl shadow-sm p-1.5 flex gap-1">
        {([
          { key: 'cuisines' as SubTab, label: 'Cuisines', icon: '\uD83C\uDF5D' },
          { key: 'methods' as SubTab, label: 'Cooking Methods', icon: '\uD83D\uDD25' },
          { key: 'ingredients' as SubTab, label: 'Ingredients', icon: '\uD83E\uDD6C' },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeSubTab === tab.key
                ? 'bg-gradient-to-r from-purple-600 to-orange-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cuisine recommendations */}
      {activeSubTab === 'cuisines' && (
        <div className="space-y-4">
          {/* Personalized cuisine tags */}
          {personalData?.recommendations.suggestedCuisines && personalData.recommendations.suggestedCuisines.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-800 mb-2">Matched to Your Chart</h3>
              <p className="text-xs text-gray-500 mb-3">Cuisine styles aligned with your favorable elements and planetary harmony</p>
              <div className="flex flex-wrap gap-2">
                {personalData.recommendations.suggestedCuisines.map((cuisine) => (
                  <span
                    key={cuisine}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-orange-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-200"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full cuisine list */}
          {cuisines.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-800 mb-1">Cuisine Recommendations</h3>
              <p className="text-xs text-gray-500 mb-4">
                Based on current planetary positions and your natal alignment
              </p>
              <div className="space-y-2">
                {cuisines.slice(0, 10).map((cuisine) => {
                  const isExpanded = expandedCuisine === cuisine.cuisine_id;
                  return (
                    <div
                      key={cuisine.cuisine_id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedCuisine(isExpanded ? null : cuisine.cuisine_id)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                      >
                        <div>
                          <span className="font-semibold text-gray-800">{cuisine.name}</span>
                          {cuisine.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{cuisine.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="hidden sm:flex gap-1">
                            {Object.entries(cuisine.elemental_properties || {})
                              .sort(([, a], [, b]) => (b as number) - (a as number))
                              .slice(0, 2)
                              .map(([el]) => {
                                const colors = ELEMENT_COLORS[el] || ELEMENT_COLORS.Fire;
                                return (
                                  <span
                                    key={el}
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}
                                  >
                                    {el}
                                  </span>
                                );
                              })}
                          </div>
                          <span className="text-gray-400 text-sm">{isExpanded ? '\u25B2' : '\u25BC'}</span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-gray-100">
                          {cuisine.flavor_profile && (
                            <div className="mt-3 mb-4">
                              <p className="text-xs font-medium text-gray-600 mb-2">Flavor Profile</p>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(cuisine.flavor_profile)
                                  .filter(([, v]) => (v as number) > 0)
                                  .sort(([, a], [, b]) => (b as number) - (a as number))
                                  .map(([flavor, value]) => (
                                    <span
                                      key={flavor}
                                      className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                                    >
                                      {flavor}: {typeof value === 'number' ? (value * 100).toFixed(0) : value}%
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}

                          {cuisine.nested_recipes && cuisine.nested_recipes.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-2">
                                Suggested Recipes ({cuisine.nested_recipes.length})
                              </p>
                              <div className="grid gap-2">
                                {cuisine.nested_recipes.slice(0, 4).map((recipe) => (
                                  <div key={recipe.recipe_id} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-sm text-gray-800">{recipe.name}</span>
                                      <div className="flex gap-2 text-xs text-gray-500">
                                        {recipe.difficulty && (
                                          <span className="px-2 py-0.5 bg-white rounded border border-gray-200">
                                            {recipe.difficulty}
                                          </span>
                                        )}
                                        {recipe.meal_type && (
                                          <span className="px-2 py-0.5 bg-white rounded border border-gray-200">
                                            {recipe.meal_type}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {recipe.description && (
                                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{recipe.description}</p>
                                    )}
                                    <div className="flex gap-3 mt-1 text-xs text-gray-400">
                                      {recipe.prep_time && <span>Prep: {recipe.prep_time}</span>}
                                      {recipe.cook_time && <span>Cook: {recipe.cook_time}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cooking Methods Sub-tab */}
      {activeSubTab === 'methods' && (
        <div className="space-y-4">
          {personalData?.recommendations.suggestedCookingMethods && personalData.recommendations.suggestedCookingMethods.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-800 mb-2">Recommended for You</h3>
              <p className="text-xs text-gray-500 mb-3">Based on your harmonic planetary alignments</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {personalData.recommendations.suggestedCookingMethods.map((method) => (
                  <div
                    key={method}
                    className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200"
                  >
                    <span className="text-sm font-semibold text-orange-800">{method}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-800 mb-2">Explore All Cooking Methods</h3>
            <p className="text-xs text-gray-500 mb-3">
              Visit the full cooking methods page for detailed alchemical analysis
            </p>
            <a
              href="/cooking-methods"
              className="inline-flex px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-orange-700 transition-all"
            >
              View Cooking Methods
            </a>
          </div>
        </div>
      )}

      {/* Ingredients Sub-tab */}
      {activeSubTab === 'ingredients' && (
        <div className="space-y-4">
          {personalData?.recommendations.favorableElements && personalData.recommendations.favorableElements.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-800 mb-2">Ingredient Guidance</h3>
              <p className="text-xs text-gray-500 mb-3">
                Focus on ingredients with these elemental qualities for optimal cosmic harmony
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {personalData.recommendations.favorableElements.map((el) => {
                  const colors = ELEMENT_COLORS[el] || ELEMENT_COLORS.Fire;
                  const examples = getElementIngredientExamples(el);
                  return (
                    <div key={el} className={`p-4 ${colors.bg} rounded-lg border ${ELEMENT_COLORS[el]?.text === 'text-red-700' ? 'border-red-200' : ELEMENT_COLORS[el]?.text === 'text-blue-700' ? 'border-blue-200' : ELEMENT_COLORS[el]?.text === 'text-green-700' ? 'border-green-200' : 'border-yellow-200'}`}>
                      <h4 className={`font-semibold text-sm ${colors.text} mb-1`}>{el} Ingredients</h4>
                      <p className="text-xs text-gray-600">{examples}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-800 mb-2">Full Ingredient Explorer</h3>
            <p className="text-xs text-gray-500 mb-3">
              Browse all ingredients with real-time compatibility scoring on the home page
            </p>
            <a
              href="/#ingredients"
              className="inline-flex px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-orange-700 transition-all"
            >
              Explore Ingredients
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

function getElementIngredientExamples(element: string): string {
  const examples: Record<string, string> = {
    Fire: 'Chili peppers, ginger, garlic, cinnamon, black pepper, cumin, mustard seeds',
    Water: 'Cucumber, melon, seafood, coconut, lettuce, celery, zucchini',
    Earth: 'Root vegetables, potatoes, mushrooms, whole grains, nuts, legumes',
    Air: 'Leafy greens, herbs, citrus, sprouts, light grains, mint, basil',
  };
  return examples[element] || '';
}
