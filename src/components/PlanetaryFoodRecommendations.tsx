'use client';

import { usePlanetaryKinetics } from '@/hooks/usePlanetaryKinetics';
import { useMemo } from 'react';

interface PlanetaryFoodRecommendationsProps {
  location?: { lat: number; lon: number },
  cuisinePreferences?: string[],
  className?: string;
}

interface PlanetaryFoodMapping {
  planet: string,
  elements: string[],
  cuisines: string[],
  ingredients: string[],
  cookingMethods: string[];
}

const PLANETARY_FOOD_MAPPINGS: PlanetaryFoodMapping[] = [
  {
    planet: 'Sun',
    elements: ['Fire', 'Spirit'],
    cuisines: ['Italian', 'Indian', 'Mexican'],
    ingredients: ['citrus', 'saffron', 'gold foods', 'honey', 'sunflower seeds', 'orange vegetables'],
    cookingMethods: ['grilling', 'roasting', 'flambé']
  },
  {
    planet: 'Moon',
    elements: ['Water', 'Essence'],
    cuisines: ['Japanese', 'Thai', 'French'],
    ingredients: ['dairy', 'melons', 'cucumbers', 'seafood', 'white foods', 'coconut'],
    cookingMethods: ['steaming', 'poaching', 'braising']
  },
  {
    planet: 'Mercury',
    elements: ['Air', 'Spirit'],
    cuisines: ['Chinese', 'Vietnamese', 'Greek'],
    ingredients: ['herbs', 'nuts', 'beans', 'green vegetables', 'mint', 'fennel'],
    cookingMethods: ['stir-frying', 'quick sauté', 'raw preparations']
  },
  {
    planet: 'Venus',
    elements: ['Earth', 'Water'],
    cuisines: ['French', 'Italian', 'Middle-Eastern'],
    ingredients: ['fruits', 'sweets', 'vanilla', 'rose', 'berries', 'chocolate'],
    cookingMethods: ['baking', 'caramelizing', 'slow-cooking']
  },
  {
    planet: 'Mars',
    elements: ['Fire', 'Matter'],
    cuisines: ['Mexican', 'Indian', 'Korean'],
    ingredients: ['chilies', 'ginger', 'garlic', 'red meat', 'spices', 'red vegetables'],
    cookingMethods: ['grilling', 'smoking', 'high-heat wok']
  },
  {
    planet: 'Jupiter',
    elements: ['Fire', 'Air'],
    cuisines: ['Mediterranean', 'Indian', 'American'],
    ingredients: ['grains', 'nuts', 'sage', 'maple', 'liver', 'purple foods'],
    cookingMethods: ['roasting', 'baking', 'fermenting']
  },
  {
    planet: 'Saturn',
    elements: ['Earth', 'Matter'],
    cuisines: ['German', 'Russian', 'Ethiopian'],
    ingredients: ['root vegetables', 'aged cheeses', 'preserved foods', 'black foods', 'sesame'],
    cookingMethods: ['slow-roasting', 'preserving', 'aging']
  }
];

export default function PlanetaryFoodRecommendations({
  location = { lat: 40.7128, lon: -74.0060 },
  cuisinePreferences = [];
  className = ''
}: PlanetaryFoodRecommendationsProps) {
  const {
    kinetics,
    currentPowerLevel,
    dominantElement,
    temporalRecommendations,
    elementalRecommendations,
    aspectPhase
  } = usePlanetaryKinetics({
    location,
    updateInterval: 300000,
    enableAutoUpdate: true
});

  const currentPlanetaryRecommendations = useMemo(() => {
    if (!kinetics?.data?.base?.power) return null;

    const currentHour = new Date().getHours();
    const currentHourData = kinetics.data.base.power.find(p => p.hour === currentHour);
    if (!currentHourData) return null;

    const planetName = currentHourData.planetary;
    const mapping = PLANETARY_FOOD_MAPPINGS.find(m => m.planet === planetName);

    if (!mapping) return null;

    // Filter by cuisine preferences if provided
    let recommendedCuisines = mapping.cuisines;
    if (cuisinePreferences.length > 0) {
      const preferred = mapping.cuisines.filter(c =>
        cuisinePreferences.some(pref => c.toLowerCase().includes(pref.toLowerCase()))
      );
      if (preferred.length > 0) {
        recommendedCuisines = preferred;
      }
    }

    // Enhance recommendations based on power level
    const enhancedIngredients = currentPowerLevel > 0.7
      ? [...mapping.ingredients, 'premium ingredients', 'exotic spices']
      : mapping.ingredients;

    return {
      planet: planetName,
      power: currentHourData.power,
      cuisines: recommendedCuisines,
      ingredients: enhancedIngredients,
      cookingMethods: mapping.cookingMethods,
      elements: mapping.elements
    };
  }, [kinetics, currentPowerLevel, cuisinePreferences]);

  const getRecommendationStrength = (): string => {
    if (currentPowerLevel >= 0.8) return 'Highly Recommended';
    if (currentPowerLevel >= 0.6) return 'Recommended';
    if (currentPowerLevel >= 0.4) return 'Suggested';
    return 'Consider';
  };

  const getAspectRecommendation = (): string => {
    switch (aspectPhase) {
      case 'applying': return 'Building flavors - add complexity';
      case 'exact': return 'Peak harmony - balance is key';
      case 'separating': return 'Simplifying - focus on essentials';
      default:
        return 'Follow your intuition';
    }
  };

  if (!currentPlanetaryRecommendations) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <h2 className="text-xl font-semibold mb-4">Planetary Food Guidance</h2>
        <div className="text-gray-500">Loading celestial recommendations...</div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Planetary Food Guidance</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          currentPowerLevel >= 0.7 ? 'bg-green-100 text-green-700' :
          currentPowerLevel >= 0.5 ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {getRecommendationStrength()}
        </span>
      </div>

      {/* Current Planetary Influence */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">
            Hour of {currentPlanetaryRecommendations.planet}
          </h3>
          <span className="text-sm text-gray-600">
            Power: {(currentPlanetaryRecommendations.power * 100).toFixed(0)}%
          </span>
        </div>
        <p className="text-sm text-gray-600 italic">{getAspectRecommendation()}</p>
      </div>

      {/* Recommended Cuisines */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-700">Aligned Cuisines</h3>
        <div className="flex flex-wrap gap-2">
          {currentPlanetaryRecommendations.cuisines.map(cuisine => (
            <span
              key={cuisine}
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
            >
              {cuisine}
            </span>
          ))}
        </div>
      </div>

      {/* Cooking Methods */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-700">Optimal Cooking Methods</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {currentPlanetaryRecommendations.cookingMethods.map(method => (
            <div
              key={method}
              className="px-3 py-2 bg-gray-50 rounded text-sm text-center"
            >
              {method}
            </div>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-700">Harmonious Ingredients</h3>
        <div className="flex flex-wrap gap-2">
          {currentPlanetaryRecommendations.ingredients.slice(0, 8).map(ingredient => (
            <span
              key={ingredient}
              className="px-2 py-1 bg-green-50 text-green-700 rounded text-sm"
            >
              {ingredient}
            </span>
          ))}
        </div>
      </div>

      {/* Elemental Balance */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-700">Elemental Focus</h3>
        <div className="flex gap-3">
          {currentPlanetaryRecommendations.elements.map(element => (
            <div
              key={element}
              className={`px-3 py-1 rounded text-sm font-medium ${
                element === dominantElement
                  ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-300'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {element}
            </div>
          ))}
        </div>
      </div>

      {/* Temporal Recommendations */}
      {temporalRecommendations && (
        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-3 text-gray-700">Timing Insights</h3>
          <div className="space-y-2">
            {temporalRecommendations.optimalMealTimes && (
              <div className="text-sm">
                <span className="text-gray-600">Best meal times: </span>
                <span className="font-medium">
                  {temporalRecommendations.optimalMealTimes.slice(0, 3).map(time =>
                    new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  ).join(', ')}
                </span>
              </div>
            )}
            {temporalRecommendations.energyPhase && (
              <div className="text-sm">
                <span className="text-gray-600">Energy phase: </span>
                <span className="font-medium">{temporalRecommendations.energyPhase}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Elemental Recommendations */}
      {elementalRecommendations && elementalRecommendations.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h3 className="font-semibold mb-3 text-gray-700">Elemental Suggestions</h3>
          <div className="text-sm text-gray-600 space-y-1">
            {elementalRecommendations.slice(0, 3).map((rec, idx) => (
              <div key={idx}>• {rec}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
