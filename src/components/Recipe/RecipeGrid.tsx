// src/components/recipe/RecipeGrid.tsx

import { useState, useEffect } from 'react';
import { RecipeCard } from './RecipeCard';
import { getCurrentSeason } from '@/data/seasons';
import { ZodiacSign, getElementalAffinity } from '@/types/zodiac';
import { getElementalColor } from '@/utils/elemental';
import { getCachedCelestialPositions } from '@/services/astrologyApi';
import type { ScoredRecipe } from '@/types/recipe';

interface RecipeGridProps {
  recipes: ScoredRecipe[];
  selectedCuisine: string | null;
  mealType: string;
}

const formatCelestialDegree = (degree: number, minutes: number): string => {
  const formattedDegree = degree.toString().padStart(2, '0');
  const formattedMinutes = minutes ? `°${minutes.toString().padStart(2, '0')}'` : '°';
  return `${formattedDegree}${formattedMinutes}`;
};

export const RecipeGrid: React.FC<RecipeGridProps> = ({ 
  recipes, 
  selectedCuisine, 
  mealType 
}) => {
  const [celestialData, setCelestialData] = useState<AstrologicalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getMealTimeTitle = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'Morning';
    if (hour >= 11 && hour < 16) return 'Afternoon';
    if (hour >= 16 && hour < 22) return 'Evening';
    return 'Late Night';
  };

  useEffect(() => {
    async function fetchAstrologicalData() {
      try {
        setLoading(true);
        const data = await getCachedCelestialPositions();
        setCelestialData(data);
      } catch (err) {
        setError('Unable to load astrological data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAstrologicalData();
  }, []);

  const currentSeason = getCurrentSeason();

  const filteredRecipes = recipes
    .filter(recipe => {
      const cuisineMatch = !selectedCuisine || recipe.cuisine === selectedCuisine;
      const mealTypeMatch = !mealType || (recipe.mealType && recipe.mealType.includes(mealType));
      const seasonMatch = recipe.season ? 
        (recipe.season.includes(currentSeason) || recipe.season.includes('all')) : 
        true;
      return cuisineMatch && mealTypeMatch && seasonMatch;
    })
    .slice(0, 6); // Keep the limit if you want it

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Enhanced Header Section */}
      <div className="mb-8">
        <div className="text-center bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 shadow-sm">
          {/* Time of Day */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {getMealTimeTitle()} Recipes
          </h1>
          
          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center space-x-8 text-lg mb-4">
              <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : celestialData && (
            <>
              {/* Celestial Information */}
              <div className="flex justify-center space-x-12 text-lg mb-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-500 text-2xl mr-2">☉</span>
                    <span className="font-medium">Sun in</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`${getElementalColor(getElementalAffinity(celestialData.sunSign.sign), 'text')} font-semibold text-xl`}>
                      {celestialData.sunSign.sign}
                    </span>
                    <span className="text-gray-600 mt-1">
                      {formatCelestialDegree(celestialData.sunSign.degree, celestialData.sunSign.minutes)}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="flex items-center mb-2">
                    <span className="text-blue-500 text-2xl mr-2">☽</span>
                    <span className="font-medium">Moon in</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`${getElementalColor(getElementalAffinity(celestialData.moonSign.sign), 'text')} font-semibold text-xl`}>
                      {celestialData.moonSign.sign}
                    </span>
                    <span className="text-gray-600 mt-1">
                      {formatCelestialDegree(celestialData.moonSign.degree, celestialData.moonSign.minutes)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Last Updated Time */}
              <div className="text-sm text-gray-600 mt-4">
                Last Updated: {new Date(celestialData.timestamp).toLocaleTimeString()}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-auto">
        {filteredRecipes.map((recipe, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <RecipeCard recipe={recipe} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeGrid;