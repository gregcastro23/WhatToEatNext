'use client';

import React, { useEffect, useState } from 'react';
import type { NatalChart } from '@/types/natalChart';

interface UserPreferences {
  dietaryRestrictions: string[];
  preferredCuisines: string[];
  dislikedIngredients: string[];
  spicePreference: 'mild' | 'medium' | 'hot';
  complexity: 'simple' | 'moderate' | 'complex';
}

interface PersonalizedRecommendationsProps {
  email: string;
  natalChart?: NatalChart;
  preferences: UserPreferences;
}

interface RecommendationData {
  chartComparison: {
    overallHarmony: number;
    elementalHarmony: number;
    alchemicalAlignment: number;
    planetaryResonance: number;
    calculatedAt: string;
    insights: {
      favorableElements: string[];
      challengingElements: string[];
      harmonicPlanets: string[];
      recommendations: string[];
    };
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

const ELEMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Fire: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  Water: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Earth: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  Air: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

export const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  email,
  natalChart,
  preferences,
}) => {
  const [personalData, setPersonalData] = useState<RecommendationData | null>(null);
  const [cuisines, setCuisines] = useState<CuisineRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCuisine, setExpandedCuisine] = useState<string | null>(null);

  useEffect(() => {
    if (!natalChart || !email) {
      setIsLoading(false);
      return;
    }

    async function loadRecommendations() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch personalized recommendations and cuisine data in parallel
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
            // Filter by user preferences if set
            let filtered = cuisineResult.recommendations as CuisineRecommendation[];
            if (preferences.preferredCuisines.length > 0) {
              // Boost preferred cuisines to top, but keep others
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
          <p className="text-gray-600 text-sm">Calculating your personalized recommendations...</p>
        </div>
      </div>
    );
  }

  if (!natalChart) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-600">Complete your birth chart to see personalized recommendations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Harmony Overview */}
      {personalData?.chartComparison && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Current Cosmic Harmony</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <HarmonyScore
              label="Overall"
              value={personalData.chartComparison.overallHarmony}
              color="purple"
            />
            <HarmonyScore
              label="Elemental"
              value={personalData.chartComparison.elementalHarmony}
              color="orange"
            />
            <HarmonyScore
              label="Alchemical"
              value={personalData.chartComparison.alchemicalAlignment}
              color="blue"
            />
            <HarmonyScore
              label="Planetary"
              value={personalData.chartComparison.planetaryResonance}
              color="green"
            />
          </div>

          {/* Favorable elements */}
          {personalData.recommendations.favorableElements.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Favorable Elements Right Now</p>
              <div className="flex flex-wrap gap-2">
                {personalData.recommendations.favorableElements.map((el) => {
                  const colors = ELEMENT_COLORS[el] || ELEMENT_COLORS.Fire;
                  return (
                    <span
                      key={el}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
                    >
                      {el}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Insights */}
          {personalData.recommendations.insights.length > 0 && (
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm font-medium text-purple-800 mb-2">Cosmic Insights</p>
              <ul className="space-y-1">
                {personalData.recommendations.insights.slice(0, 4).map((insight, idx) => (
                  <li key={idx} className="text-sm text-purple-700 flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">&#x2022;</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Suggested Cooking Methods */}
      {personalData?.recommendations.suggestedCookingMethods && personalData.recommendations.suggestedCookingMethods.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Recommended Cooking Methods</h3>
          <p className="text-xs text-gray-500 mb-4">Based on your harmonic planetary alignments</p>
          <div className="flex flex-wrap gap-2">
            {personalData.recommendations.suggestedCookingMethods.map((method) => (
              <span
                key={method}
                className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-200"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cuisine Recommendations */}
      {cuisines.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-1">Cuisine Recommendations</h3>
          <p className="text-xs text-gray-500 mb-4">
            Cuisines aligned with the current moment and your natal chart
          </p>
          <div className="space-y-3">
            {cuisines.slice(0, 8).map((cuisine) => {
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
                      {/* Element badges */}
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
                      {/* Flavor profile */}
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

                      {/* Recipes */}
                      {cuisine.nested_recipes && cuisine.nested_recipes.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-2">
                            Suggested Recipes ({cuisine.nested_recipes.length})
                          </p>
                          <div className="grid gap-2">
                            {cuisine.nested_recipes.slice(0, 4).map((recipe) => (
                              <div
                                key={recipe.recipe_id}
                                className="p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm text-gray-800">
                                    {recipe.name}
                                  </span>
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
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {recipe.description}
                                  </p>
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

      {/* Suggested Cuisines from chart comparison */}
      {personalData?.recommendations.suggestedCuisines && personalData.recommendations.suggestedCuisines.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Cuisine Styles for You</h3>
          <p className="text-xs text-gray-500 mb-4">Matched to your favorable elements and planetary harmony</p>
          <div className="flex flex-wrap gap-2">
            {personalData.recommendations.suggestedCuisines.map((cuisine) => (
              <span
                key={cuisine}
                className="px-4 py-2 bg-gradient-to-r from-purple-50 to-orange-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-200"
              >
                {cuisine}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Harmony Score Widget ───────────────────────────────────────────── */

function HarmonyScore({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'purple' | 'orange' | 'blue' | 'green';
}) {
  const pct = Math.round((value ?? 0) * 100);
  const colorMap = {
    purple: { ring: 'text-purple-500', bg: 'bg-purple-50', text: 'text-purple-700' },
    orange: { ring: 'text-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' },
    blue: { ring: 'text-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
    green: { ring: 'text-green-500', bg: 'bg-green-50', text: 'text-green-700' },
  };
  const c = colorMap[color];

  return (
    <div className={`${c.bg} rounded-lg p-3 text-center`}>
      <div className={`text-2xl font-bold ${c.text}`}>{pct}%</div>
      <div className="text-xs font-medium text-gray-600 mt-1">{label}</div>
    </div>
  );
}
