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

const ELEMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Fire: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  Water: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Earth: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  Air: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '\u2609', Moon: '\u263D', Mercury: '\u263F', Venus: '\u2640',
  Mars: '\u2642', Jupiter: '\u2643', Saturn: '\u2644', Uranus: '\u2645',
  Neptune: '\u2646', Pluto: '\u2647',
};

// Cooking method details for inline display
const COOKING_METHOD_DETAILS: Record<string, { element: string; description: string; bestFor: string }> = {
  'Grilling': { element: 'Fire', description: 'Direct high heat transforms proteins and caramelizes surfaces', bestFor: 'Meats, vegetables, fruits' },
  'Roasting': { element: 'Fire', description: 'Dry heat surrounds food, developing deep flavors through Maillard reaction', bestFor: 'Root vegetables, poultry, nuts' },
  'Baking': { element: 'Fire', description: 'Sustained dry heat for gentle transformation of dough and batter', bestFor: 'Breads, pastries, casseroles' },
  'Steaming': { element: 'Water', description: 'Gentle water vapor preserves nutrients and delicate textures', bestFor: 'Fish, dumplings, vegetables' },
  'Poaching': { element: 'Water', description: 'Submersion in gently simmering liquid for tender results', bestFor: 'Eggs, fish, fruit' },
  'Simmering': { element: 'Water', description: 'Low and slow liquid cooking extracts and melds flavors over time', bestFor: 'Soups, sauces, stews' },
  'Quick-frying': { element: 'Air', description: 'Rapid high-heat cooking preserves crispness and freshness', bestFor: 'Thin cuts, aromatics, greens' },
  'Stir-frying': { element: 'Air', description: 'Constant motion in high heat for speed and texture retention', bestFor: 'Vegetables, noodles, thinly sliced proteins' },
  'Flash cooking': { element: 'Air', description: 'Ultra-brief high heat to barely cook while preserving raw qualities', bestFor: 'Tuna, scallops, tender greens' },
  'Saut\u00E9ing': { element: 'Earth', description: 'Pan cooking in fat with precise control for golden finishes', bestFor: 'Mushrooms, onions, chicken' },
  'Glazing': { element: 'Earth', description: 'Coating with reduced liquid for glossy, flavorful surfaces', bestFor: 'Carrots, ham, pastries' },
  'Caramelizing': { element: 'Earth', description: 'Controlled sugar transformation for complex sweet-bitter flavors', bestFor: 'Onions, sugar, cr\u00E8me br\u00FBl\u00E9e' },
  'High-heat searing': { element: 'Fire', description: 'Intense direct heat creates a flavorful crust rapidly', bestFor: 'Steaks, tuna, scallops' },
  'Charring': { element: 'Fire', description: 'Controlled burning for smoky, complex bitter notes', bestFor: 'Peppers, corn, citrus' },
  'Broiling': { element: 'Fire', description: 'Overhead radiant heat for quick browning and finishing', bestFor: 'Fish fillets, gratins, melting cheese' },
  'Slow-roasting': { element: 'Earth', description: 'Extended low heat for maximum tenderness and deep flavor development', bestFor: 'Pork shoulder, brisket, whole poultry' },
  'Braising': { element: 'Earth', description: 'Searing then slow-cooking in liquid breaks down tough fibers', bestFor: 'Short ribs, lamb shanks, root vegetables' },
  'Abundance cooking': { element: 'Earth', description: 'Generous, communal-scale preparation for sharing', bestFor: 'Stews, paella, feasts' },
  'Fermentation': { element: 'Earth', description: 'Time and microbial activity create complex, living foods', bestFor: 'Kimchi, sourdough, miso, yogurt' },
  'Preservation': { element: 'Earth', description: 'Salt, acid, smoke, or dehydration extends food life and deepens flavor', bestFor: 'Pickles, jerky, confit' },
  'Traditional methods': { element: 'Earth', description: 'Ancestral techniques passed through generations', bestFor: 'Bread-making, curing, smoking' },
  'Molecular gastronomy': { element: 'Air', description: 'Scientific techniques to transform texture and form', bestFor: 'Foams, spherification, gels' },
  'Innovative techniques': { element: 'Air', description: 'Modern approaches pushing culinary boundaries', bestFor: 'Dehydration, sous vide, liquid nitrogen' },
  'Experimental': { element: 'Air', description: 'Creative exploration beyond conventional methods', bestFor: 'Fusion dishes, novel textures, new flavor combos' },
  'Infusion': { element: 'Water', description: 'Extracting essence through steeping in liquid', bestFor: 'Teas, oils, broths, cocktails' },
  'Sous vide': { element: 'Water', description: 'Precise temperature water bath for perfect doneness edge-to-edge', bestFor: 'Steak, salmon, eggs, vegetables' },
  'Delicate steaming': { element: 'Water', description: 'Ultra-gentle steam for the most fragile ingredients', bestFor: 'Custards, delicate fish, dim sum' },
  'Transformation techniques': { element: 'Fire', description: 'Deep alchemical change through intense heat or process', bestFor: 'Confit, reduction, stock-making' },
  'Deep frying': { element: 'Fire', description: 'Full submersion in hot oil for crispy, sealed exterior', bestFor: 'Tempura, donuts, fried chicken' },
  'Reduction': { element: 'Fire', description: 'Evaporating liquid to concentrate and intensify flavors', bestFor: 'Sauces, glazes, demi-glace' },
};

// Ingredient recommendations by element
const ELEMENT_INGREDIENT_DATA: Record<string, Array<{ name: string; affinity: string }>> = {
  Fire: [
    { name: 'Chili peppers', affinity: 'Strong heat, activates metabolism' },
    { name: 'Ginger', affinity: 'Warming root, aids digestion' },
    { name: 'Garlic', affinity: 'Pungent fire, immune support' },
    { name: 'Cinnamon', affinity: 'Sweet warmth, blood sugar balance' },
    { name: 'Black pepper', affinity: 'Sharp heat, enhances absorption' },
    { name: 'Cumin', affinity: 'Earthy warmth, digestive aid' },
    { name: 'Mustard seeds', affinity: 'Intense bite, circulatory stimulant' },
    { name: 'Turmeric', affinity: 'Golden fire, anti-inflammatory' },
  ],
  Water: [
    { name: 'Cucumber', affinity: 'Cooling hydration, purifying' },
    { name: 'Melon', affinity: 'Sweet fluidity, refreshing' },
    { name: 'Seafood', affinity: 'Ocean essence, omega-rich' },
    { name: 'Coconut', affinity: 'Tropical moisture, nourishing fats' },
    { name: 'Lettuce', affinity: 'Gentle hydration, calming' },
    { name: 'Celery', affinity: 'Mineral-rich water, cleansing' },
    { name: 'Zucchini', affinity: 'Mild fluidity, versatile' },
    { name: 'Seaweed', affinity: 'Deep ocean minerals, umami' },
  ],
  Earth: [
    { name: 'Root vegetables', affinity: 'Grounding energy, sustained fuel' },
    { name: 'Potatoes', affinity: 'Stabilizing starch, comfort' },
    { name: 'Mushrooms', affinity: 'Umami depth, forest wisdom' },
    { name: 'Whole grains', affinity: 'Sustained energy, fiber-rich' },
    { name: 'Nuts', affinity: 'Dense nutrition, healthy fats' },
    { name: 'Legumes', affinity: 'Plant protein, grounding' },
    { name: 'Beets', affinity: 'Earth blood, iron-rich' },
    { name: 'Sweet potatoes', affinity: 'Nourishing warmth, beta-carotene' },
  ],
  Air: [
    { name: 'Leafy greens', affinity: 'Light vitality, chlorophyll' },
    { name: 'Fresh herbs', affinity: 'Aromatic lift, volatile oils' },
    { name: 'Citrus', affinity: 'Bright acidity, vitamin C' },
    { name: 'Sprouts', affinity: 'New life energy, enzymes' },
    { name: 'Light grains', affinity: 'Airy texture, quick energy' },
    { name: 'Mint', affinity: 'Cooling breath, refreshing' },
    { name: 'Basil', affinity: 'Aromatic sweetness, uplifting' },
    { name: 'Fennel', affinity: 'Licorice lightness, digestive' },
  ],
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

  // Derive natal chart info for inline display
  const dominantElement = natalChart.dominantElement || 'Fire';
  const elementalBalance = natalChart.elementalBalance || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  const sortedElements = Object.entries(elementalBalance)
    .sort(([, a], [, b]) => (b as number) - (a as number));
  const alchemical = natalChart.alchemicalProperties || { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };

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

      {/* Natal chart context bar */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">Your Chart:</span>
            <div className="flex gap-1.5">
              {sortedElements.map(([el, val]) => {
                const colors = ELEMENT_COLORS[el] || ELEMENT_COLORS.Fire;
                return (
                  <span
                    key={el}
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${colors.bg} ${colors.text}`}
                  >
                    {el} {Math.round((val as number) * 100)}%
                  </span>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>ESMS: S{alchemical.Spirit} E{alchemical.Essence} M{alchemical.Matter} Su{alchemical.Substance}</span>
          </div>
        </div>
      </div>

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

      {/* Cooking Methods Sub-tab — inline recommendations */}
      {activeSubTab === 'methods' && (
        <div className="space-y-4">
          {/* Personalized methods from chart comparison */}
          {personalData?.recommendations.suggestedCookingMethods && personalData.recommendations.suggestedCookingMethods.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-800 mb-2">Recommended for Your Chart</h3>
              <p className="text-xs text-gray-500 mb-3">
                Based on your harmonic planets ({personalData.recommendations.harmonicPlanets.map(p => `${PLANET_SYMBOLS[p] || ''} ${p}`).join(', ')})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {personalData.recommendations.suggestedCookingMethods.map((method) => {
                  const detail = COOKING_METHOD_DETAILS[method];
                  const elColors = detail ? ELEMENT_COLORS[detail.element] || ELEMENT_COLORS.Fire : ELEMENT_COLORS.Fire;
                  return (
                    <div
                      key={method}
                      className={`p-4 rounded-lg border ${elColors.bg} ${elColors.border}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-semibold ${elColors.text}`}>{method}</span>
                        {detail && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${elColors.bg} ${elColors.text} font-medium`}>
                            {detail.element}
                          </span>
                        )}
                      </div>
                      {detail && (
                        <>
                          <p className="text-xs text-gray-600 mt-1">{detail.description}</p>
                          <p className="text-xs text-gray-500 mt-1.5">
                            <span className="font-medium">Try with:</span> {detail.bestFor}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Methods by dominant element */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-800 mb-2">
              Methods for {dominantElement}-Dominant Charts
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Cooking techniques that resonate with your elemental nature
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(COOKING_METHOD_DETAILS)
                .filter(([, d]) => d.element === dominantElement)
                .slice(0, 6)
                .map(([method, detail]) => {
                  const elColors = ELEMENT_COLORS[detail.element] || ELEMENT_COLORS.Fire;
                  return (
                    <div
                      key={method}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <span className={`text-sm font-semibold ${elColors.text}`}>{method}</span>
                      <p className="text-xs text-gray-600 mt-1">{detail.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="font-medium">Best for:</span> {detail.bestFor}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Complementary element methods */}
          {sortedElements.length > 1 && sortedElements[1][0] !== dominantElement && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-800 mb-2">
                Complementary: {sortedElements[1][0]} Methods
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Your secondary element ({Math.round((sortedElements[1][1] as number) * 100)}%) suggests these techniques too
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(COOKING_METHOD_DETAILS)
                  .filter(([, d]) => d.element === sortedElements[1][0])
                  .slice(0, 4)
                  .map(([method, detail]) => {
                    const elColors = ELEMENT_COLORS[detail.element] || ELEMENT_COLORS.Fire;
                    return (
                      <div
                        key={method}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <span className={`text-sm font-semibold ${elColors.text}`}>{method}</span>
                        <p className="text-xs text-gray-600 mt-1">{detail.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">Best for:</span> {detail.bestFor}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ingredients Sub-tab — inline recommendations */}
      {activeSubTab === 'ingredients' && (
        <div className="space-y-4">
          {/* Chart insights */}
          {personalData?.recommendations.insights && personalData.recommendations.insights.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-800 mb-2">Chart Insights</h3>
              <ul className="space-y-1.5">
                {personalData.recommendations.insights.slice(0, 4).map((insight, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">{'\u2022'}</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Primary element ingredients */}
          {personalData?.recommendations.favorableElements && personalData.recommendations.favorableElements.length > 0 ? (
            personalData.recommendations.favorableElements.map((el) => {
              const colors = ELEMENT_COLORS[el] || ELEMENT_COLORS.Fire;
              const ingredients = ELEMENT_INGREDIENT_DATA[el] || [];
              return (
                <div key={el} className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-base font-bold ${colors.text}`}>{el} Ingredients</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} font-medium`}>
                      Favorable
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Ingredients aligned with your chart&apos;s favorable {el} energy
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ingredients.map((ing) => (
                      <div key={ing.name} className={`p-3 ${colors.bg} rounded-lg border ${colors.border}`}>
                        <span className={`text-sm font-semibold ${colors.text}`}>{ing.name}</span>
                        <p className="text-xs text-gray-600 mt-0.5">{ing.affinity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            /* Fallback: show ingredients for dominant element from natal chart */
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`text-base font-bold ${(ELEMENT_COLORS[dominantElement] || ELEMENT_COLORS.Fire).text}`}>
                  {dominantElement} Ingredients
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${(ELEMENT_COLORS[dominantElement] || ELEMENT_COLORS.Fire).bg} ${(ELEMENT_COLORS[dominantElement] || ELEMENT_COLORS.Fire).text} font-medium`}>
                  Dominant
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Ingredients that resonate with your dominant {dominantElement} energy
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(ELEMENT_INGREDIENT_DATA[dominantElement] || []).map((ing) => {
                  const colors = ELEMENT_COLORS[dominantElement] || ELEMENT_COLORS.Fire;
                  return (
                    <div key={ing.name} className={`p-3 ${colors.bg} rounded-lg border ${colors.border}`}>
                      <span className={`text-sm font-semibold ${colors.text}`}>{ing.name}</span>
                      <p className="text-xs text-gray-600 mt-0.5">{ing.affinity}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ESMS alignment section */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-800 mb-2">Alchemical Profile</h3>
            <p className="text-xs text-gray-500 mb-3">
              Your ESMS values influence which ingredients feel most nourishing
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['Spirit', 'Essence', 'Matter', 'Substance'] as const).map((prop) => {
                const val = (alchemical as Record<string, number>)[prop] || 0;
                const maxVal = Math.max(...Object.values(alchemical as Record<string, number>).map(Number)) || 1;
                const pct = Math.round((val / maxVal) * 100);
                return (
                  <div key={prop} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
                    <div className="text-xs text-gray-500 font-medium uppercase">{prop}</div>
                    <div className="text-lg font-bold text-gray-800 mt-1">{val}</div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-orange-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
