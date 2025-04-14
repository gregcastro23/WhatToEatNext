import React, { useState, useEffect, useMemo } from 'react';
import Recipe from './Recipe';
import { cuisines } from '@/data/cuisines';
import { findBestMatches } from '@/utils/recipeMatching';
import type { ElementalProperties, LunarPhaseWithSpaces, ZodiacSign } from '@/types/alchemy';
import type { Recipe as RecipeType } from '@/types/recipe';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { SpoonacularService } from '@/services/SpoonacularService';
import { AlchemicalEngineBase as AlchemicalEngine } from '@/lib/alchemicalEngine';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import RecipeCard from './RecipeCard';
import { useAlchemicalRecommendations } from '@/hooks/useAlchemicalRecommendations';
import { ElementalItem } from '@/calculations/alchemicalTransformation';
import { AlchemicalTransformationService, OptimizedRecipeResult } from '@/services/AlchemicalTransformationService';
import { normalizeLunarPhase } from '@/utils/lunarPhaseUtils';
import { convertToLunarPhase } from '@/utils/lunarUtils';
import { getTimeFactors } from '@/types/time';
import PlanetaryTimeDisplay from '../PlanetaryTimeDisplay';

// Define the Dish interface locally
interface Dish {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  timeToMake: string;
  mealType?: string | string[];
  season?: string | string[];
  ingredients?: Array<string | { name: string; amount: number; unit: string; category?: string }>;
  instructions?: string[];
  elementalProperties?: ElementalProperties;
  numberOfServings?: number;
  [key: string]: any;
}

// Define interface for cuisine data structure
interface CuisineData {
  name: string;
  description: string;
  dishes: {
    [key: string]: { // mealType like breakfast, lunch, dinner
      [key: string]: Dish[]; // season like summer, winter, all
    };
  };
  elementalProperties: ElementalProperties;
  [key: string]: any;
}

interface RecipeRecommendationsProps {
  filters: {
    servingSize: string;
    dietaryPreference: string;
    cookingTime: string;
  };
}

const RecipeRecommendations: React.FC<RecipeRecommendationsProps> = ({
  filters,
}) => {
  const [recipes, setRecipes] = useState<RecipeType[]>([]);
  const { state, planetaryPositions, isDaytime } = useAlchemical();
  const elementalState = state.elementalPreference;
  const [isLoading, setIsLoading] = useState(true);
  const [optimizedRecipes, setOptimizedRecipes] = useState<OptimizedRecipeResult[]>([]);
  
  // Get current time factors for displaying planetary day and hour information
  const timeFactors = useMemo(() => getTimeFactors(), []);
  
  // Convert cuisine data to ElementalItem format for the hook
  const cuisineItems = Object.entries(cuisines as Record<string, CuisineData>).map(([key, cuisine]) => ({
    id: key,
    name: cuisine.name || key,
    elementalProperties: cuisine.elementalProperties || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    }
  })) as ElementalItem[];
  
  // Transform the planetaryPositions into the format expected by useAlchemicalRecommendations
  const simplifiedPlanetaryPositions = useMemo(() => {
    const positions: Record<string, number> = {
      Sun: 0,
      Moon: 0,
      Mercury: 0,
      Venus: 0,
      Mars: 0,
      Jupiter: 0,
      Saturn: 0,
      Uranus: 0,
      Neptune: 0,
      Pluto: 0
    };
    
    // Extract degrees from the planetary positions
    Object.entries(planetaryPositions).forEach(([planet, data]) => {
      positions[planet] = data.exactLongitude || data.degree || 0;
    });
    
    return positions;
  }, [planetaryPositions]);

  // Use the enhanced alchemical recommendations hook
  const { 
    recommendations,
    transformedCuisines,
    energeticProfile,
    loading: alchemicalLoading 
  } = useAlchemicalRecommendations({
    ingredients: [], // We don't need ingredients for this use case
    cookingMethods: [], // We don't need cooking methods for this use case
    cuisines: cuisineItems,
    planetPositions: simplifiedPlanetaryPositions,
    isDaytime,
    count: 10, // Get more cuisine recommendations
    currentZodiac: (state.astrologicalState?.zodiacSign as ZodiacSign) || undefined,
    lunarPhase: state.lunarPhase 
      ? normalizeLunarPhase(state.lunarPhase) as LunarPhaseWithSpaces || undefined 
      : undefined,
    // Optional: pass tarot effects if available in your state
    tarotElementBoosts: state.astrologicalState?.tarotElementBoosts || undefined,
    tarotPlanetaryBoosts: state.astrologicalState?.tarotPlanetaryBoosts || undefined,
    aspects: state.astrologicalState?.aspects || []
  });
  
  // Create an instance of the AlchemicalTransformationService
  const alchemicalService = new AlchemicalTransformationService(
    [], // No ingredients needed for recipe optimization
    [], // No cooking methods needed for recipe optimization
    cuisineItems // Pass cuisine items
  );
  
  // Set the service's properties with current astrological state
  useEffect(() => {
    alchemicalService.setPlanetaryPositions(simplifiedPlanetaryPositions);
    alchemicalService.setDaytime(isDaytime);
    alchemicalService.setCurrentZodiac(state.astrologicalState?.zodiacSign as ZodiacSign);
    alchemicalService.setLunarPhase(state.lunarPhase ? normalizeLunarPhase(state.lunarPhase) as LunarPhaseWithSpaces : null);
    alchemicalService.setTarotElementBoosts(state.astrologicalState?.tarotElementBoosts || {});
    alchemicalService.setTarotPlanetaryBoosts(state.astrologicalState?.tarotPlanetaryBoosts || {});
    alchemicalService.setAspects(state.astrologicalState?.aspects || []);
  }, [
    planetaryPositions, 
    isDaytime, 
    state.astrologicalState?.zodiacSign, 
    state.lunarPhase, 
    state.astrologicalState?.tarotElementBoosts, 
    state.astrologicalState?.tarotPlanetaryBoosts, 
    state.astrologicalState?.aspects
  ]);

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      
      try {
        const spoonacularRecipes = await SpoonacularService.searchRecipes({
          diet: filters.dietaryPreference,
          maxReadyTime: parseInt(filters.cookingTime) || undefined,
        });

        // Process and set recipes
        setRecipes(spoonacularRecipes);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [filters]);

  // Get all recipes with proper type casting
  const allRecipes = Object.entries(cuisines as Record<string, CuisineData>).flatMap(([_cuisineKey, cuisine]) =>
    Object.entries(cuisine.dishes).flatMap(([mealType, mealTypeData]) =>
      Object.entries(mealTypeData as Record<string, Dish[]>).flatMap(([season, recipes]) =>
        (recipes as Dish[]).map((recipe: Dish) => ({
          ...recipe,
          mealType,
          season
        }))
      )
    )
  );

  // Apply filters based on user preferences
  const filteredRecipes = allRecipes.filter(recipe => {
    if (filters.cookingTime !== 'all' && 
        parseInt(recipe.timeToMake) > parseInt(filters.cookingTime)) {
      return false;
    }
    // Add other filters
    return true;
  });

  // Use the AlchemicalTransformationService to get optimized recipes
  useEffect(() => {
    if (!alchemicalLoading && filteredRecipes.length > 0) {
      try {
        // Get optimized recipes using our enhanced service with proper type casting
        const optimized = alchemicalService.getOptimizedRecipes(
          filteredRecipes.map(recipe => ({
            ...recipe,
            ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.map(i => typeof i === 'string' ? {
              name: i,
              amount: 1,
              unit: 'unit',
              category: 'general'
            } : i) : [],
            instructions: recipe.instructions || [],
            numberOfServings: recipe.numberOfServings || 4,
            elementalProperties: recipe.elementalProperties || {
              Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
            }
          })) as unknown as RecipeType[],
          6
        );
        setOptimizedRecipes(optimized);
      } catch (error) {
        console.error("Error optimizing recipes:", error);
      }
    }
  }, [alchemicalLoading, filteredRecipes, alchemicalService]);

  // Display loading state when either process is loading
  if (isLoading || alchemicalLoading) {
    return <div className="text-center py-8">Loading recommendations...</div>;
  }

  const getElementalDisplay = (elements: ElementalProperties) => {
    return Object.entries(elements)
      .filter(([_key, value]) => value > 0)
      .sort(([_keyA, a], [_keyB, b]) => b - a)
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Current Elemental State */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-medium mb-2">Current Elemental State</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {Object.entries(elementalState).map(([element, value]) => (
            <div key={element} className="flex items-center">
              <span className="mr-2">
                {element === 'Fire' && '🔥'}
                {element === 'Water' && '💧'}
                {element === 'Air' && '💨'}
                {element === 'Earth' && '🌍'}
              </span>
              <span>{element}: {Math.round((value as number) * 100)}%</span>
            </div>
          ))}
        </div>
        
        {/* Display current planetary influences */}
        <PlanetaryTimeDisplay className="mt-4" />
        
        {/* Display dominant influences if available */}
        {energeticProfile && (
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Dominant Influences</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                {energeticProfile.dominantElement}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {energeticProfile.dominantProperty}
              </span>
              {state.astrologicalState?.zodiacSign && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                  {state.astrologicalState.zodiacSign}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Recommended Cuisines */}
        {recommendations && recommendations.topCuisines.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Recommended Cuisines</h3>
            <div className="flex flex-wrap gap-2">
              {recommendations.topCuisines.map(cuisine => (
                <span 
                  key={cuisine.id} 
                  className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                >
                  {cuisine.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recipe Recommendations */}
      <div>
        <h3 className="text-lg font-medium mb-3">Recommended Recipes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {optimizedRecipes.map(({ recipe, compatibility, dominantElement }) => (
            <RecipeCard 
              key={`${recipe.cuisine}-${recipe.name}`}
              recipe={{
                ...recipe,
                // Ensure season is always a string array
                season: Array.isArray(recipe.season) ? recipe.season : recipe.season ? [recipe.season] : [],
                // Ensure mealType is always a string array
                mealType: Array.isArray(recipe.mealType) ? recipe.mealType : recipe.mealType ? [recipe.mealType] : []
              }}
              viewMode="grid"
              elementalHighlight={dominantElement}
              matchPercentage={compatibility * 100}
            />
          ))}
        </div>
      </div>

      {optimizedRecipes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No recipes match your current criteria. Try adjusting the elemental state or filters.
        </div>
      )}
    </div>
  );
};

export default RecipeRecommendations;