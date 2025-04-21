import React, { useState, useEffect, useMemo } from 'react';
import Recipe from './Recipe';
import { cuisines } from '../../data/cuisines';
import { findBestMatches } from '../../utils/fixedRecipeMatching';
import type { ElementalProperties, LunarPhaseWithSpaces, ZodiacSign } from '../../types/alchemy';
import type { Recipe as RecipeType } from '../../types/recipe';
import { useAlchemical } from '../../contexts/AlchemicalContext/hooks';
import { SpoonacularService } from '../../services/SpoonacularService';
import { AlchemicalEngineBase as AlchemicalEngine } from '../../lib/alchemicalEngine';
import { ElementalCalculator } from '../../services/ElementalCalculator';
import RecipeCard from './RecipeCard';
import { useAlchemicalRecommendations } from '../../hooks/useAlchemicalRecommendations';
import { ElementalItem } from '../../calculations/alchemicalTransformation';
import { AlchemicalTransformationService, OptimizedRecipeResult } from '../../services/AlchemicalTransformationService';
import { normalizeLunarPhase } from '../../utils/lunarPhaseUtils';
import { convertToLunarPhase } from '../../utils/lunarUtils';
import { getTimeFactors } from '../../types/time';
import PlanetaryTimeDisplay from '../PlanetaryTimeDisplay';
import { convertToCardIngredient } from './RecipeGrid';

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
  [key: string]: unknown;
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
  [key: string]: unknown;
}

interface RecipeRecommendationsProps {
  filters: {
    servingSize: string;
    dietaryPreference: string;
    cookingTime: string;
  };
  selectedCuisine?: string;
}

const RecipeRecommendations: React.FC<RecipeRecommendationsProps> = ({
  filters,
  selectedCuisine,
}) => {
  const [recipes, setRecipes] = useState<RecipeType[]>([]);
  const { state, planetaryPositions, isDaytime } = useAlchemical();
  const elementalState = state.elementalPreference;
  const [isLoading, setIsLoading] = useState(true);
  const [optimizedRecipes, setOptimizedRecipes] = useState<OptimizedRecipeResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Get current time factors for displaying planetary day and hour information
  const timeFactors = useMemo(() => getTimeFactors(), []);
  
  // Convert cuisine data to ElementalItem format for the hook
  const cuisineItems = useMemo(() => Object.entries(cuisines as Record<string, CuisineData>).map(([key, cuisine]) => ({
    id: key,
    name: cuisine.name || key,
    elementalProperties: cuisine.elementalProperties || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    }
  })) as ElementalItem[], []);
  
  // Transform the planetaryPositions into the format expected by useAlchemicalRecommendations
  const simplifiedPlanetaryPositions = useMemo(() => {
    const positions: Record<string, number> = {
      sun: 0,
      Moon: 0,
      mercury: 0,
      venus: 0,
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
    currentZodiac: (state.astrologicalState?.sunSign as ZodiacSign) || undefined,
    lunarPhase: state.lunarPhase 
      ? normalizeLunarPhase(state.lunarPhase) as LunarPhaseWithSpaces || undefined 
      : undefined,
    // Optional: pass tarot effects if available in your state
    tarotElementBoosts: state.astrologicalState?.tarotElementBoosts || undefined,
    tarotPlanetaryBoosts: state.astrologicalState?.tarotPlanetaryBoosts || undefined,
    aspects: (state.astrologicalState?.aspects || []) as any
  });
  
  // Create an instance of the AlchemicalTransformationService
  const alchemicalService = useMemo(() => new AlchemicalTransformationService(
    [], // No ingredients needed for recipe optimization
    [], // No cooking methods needed for recipe optimization
    cuisineItems // Pass cuisine items
  ), [cuisineItems]);
  
  // Set the service's properties with current astrological state
  useEffect(() => {
    if (alchemicalService) {
      try {
        alchemicalService.setPlanetaryPositions(simplifiedPlanetaryPositions);
        alchemicalService.setDaytime(isDaytime);
        alchemicalService.setCurrentZodiac(state.astrologicalState?.sunSign as ZodiacSign);
        alchemicalService.setLunarPhase(state.lunarPhase ? normalizeLunarPhase(state.lunarPhase) as LunarPhaseWithSpaces : null);
        
        // Only set these if they exist to avoid null or undefined errors
        if (state.astrologicalState?.tarotElementBoosts) {
          alchemicalService.setTarotElementBoosts(state.astrologicalState.tarotElementBoosts);
        }
        if (state.astrologicalState?.tarotPlanetaryBoosts) {
          alchemicalService.setTarotPlanetaryBoosts(state.astrologicalState.tarotPlanetaryBoosts);
        }
        if (state.astrologicalState?.aspects) {
          alchemicalService.setAspects(state.astrologicalState.aspects as any);
        }
      } catch (err) {
        console.error("Error setting astrological state in service:", err);
        setError("Failed to configure astrological service");
      }
    }
  }, [
    alchemicalService,
    simplifiedPlanetaryPositions, 
    isDaytime, 
    state.astrologicalState?.sunSign, 
    state.lunarPhase, 
    state.astrologicalState?.tarotElementBoosts, 
    state.astrologicalState?.tarotPlanetaryBoosts, 
    state.astrologicalState?.aspects
  ]);

  useEffect(() => {
    fetchRecipes();
  }, [filters]);

  // Define the async function outside the useEffect
  const fetchRecipes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const spoonacularRecipes = await SpoonacularService.searchRecipes({
        diet: filters.dietaryPreference,
        maxReadyTime: parseInt(filters.cookingTime) || undefined,
      });

      // Process and set recipes
      setRecipes(spoonacularRecipes as any);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setError('Failed to load recipes from external service');
    } finally {
      setIsLoading(false);
    }
  };

  // Get all recipes with proper type casting
  const allRecipes = useMemo(() => {
    try {
      return Object.entries(cuisines as Record<string, CuisineData>).flatMap(([_cuisineKey, cuisine]) =>
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
    } catch (error) {
      console.error('Error processing cuisine data:', error);
      setError('Failed to process cuisine data');
      return [];
    }
  }, []);

  // Apply filters based on user preferences
  const filteredRecipes = useMemo(() => {
    if (!allRecipes || allRecipes.length === 0) return [];
    
    return allRecipes.filter(recipe => {
      // Filter by selected cuisine if provided
      if (selectedCuisine && 
          recipe.cuisine?.toLowerCase() !== selectedCuisine.toLowerCase() && 
          (recipe as any).regionalCuisine?.toLowerCase() !== selectedCuisine.toLowerCase()) {
        return false;
      }
      
      // Skip recipes with undefined timeToMake
      if (!recipe.timeToMake) return true;
      
      if (filters.cookingTime !== 'all' && 
          parseInt(recipe.timeToMake) > parseInt(filters.cookingTime)) {
        return false;
      }
      
      // Add filter for serving size if needed
      if (filters.servingSize && filters.servingSize !== 'all') {
        const requiredServings = parseInt(filters.servingSize);
        if (requiredServings && recipe.numberOfServings && recipe.numberOfServings < requiredServings) {
          return false;
        }
      }
      
      // Add dietary preference filter if needed
      if (filters.dietaryPreference && filters.dietaryPreference !== 'all') {
        // For simplicity, just check if the recipe name or description contains the preference
        const preference = filters.dietaryPreference.toLowerCase();
        const matchesDiet = 
          recipe.name.toLowerCase().includes(preference) || 
          (recipe.description && recipe.description.toLowerCase().includes(preference));
        
        if (!matchesDiet) return false;
      }
      
      return true;
    });
  }, [allRecipes, filters, selectedCuisine]);

  // Use the AlchemicalTransformationService to get optimized recipes
  useEffect(() => {
    if (!alchemicalLoading && filteredRecipes.length > 0 && alchemicalService) {
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
        setError(null);
      } catch (err) {
        console.error("Error optimizing recipes:", err);
        setError("Failed to optimize recipes");
      }
    }
  }, [alchemicalLoading, filteredRecipes, alchemicalService]);

  // Display loading state when either process is loading
  if (isLoading || alchemicalLoading) {
    return <div className="text-center py-8">Loading recommendations...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}. Please try again later.
      </div>
    );
  }

  const getElementalDisplay = (elements: ElementalProperties) => {
    return Object.entries(elements)
      .filter(([_key, value]) => value > 0)
      .sort(([_keyA, a], [_keyB, b]) => b - a)
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Only show Current Elemental State when not in cuisine-specific view */}
      {!selectedCuisine && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium mb-2">Current Elemental State</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(elementalState).map(([element, value]) => (
              <div key={element} className="flex items-center">
                <span className="mr-2">
                  {element === 'Fire' && '🔥'}
                  {element === 'Water' && '💧'}
                  {element === 'Earth' && '🪨'}
                  {element === 'Air' && '💨'}
                </span>
                <span className="font-medium">{element}:</span>
                <div className="ml-2 bg-gray-200 rounded-full h-2 w-full">
                  <div 
                    className={`rounded-full h-2 ${
                      element === 'Fire' ? 'bg-red-500' :
                      element === 'Water' ? 'bg-blue-500' :
                      element === 'Earth' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`}
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
                <span className="ml-2">{Math.round(value * 100)}%</span>
              </div>
            ))}
          </div>
          
          {/* Planetary Day and Hour */}
          <div className="mt-4">
            <p className="text-sm font-medium mb-1">Planetary Influences:</p>
            <PlanetaryTimeDisplay />
          </div>
          
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
                {state.astrologicalState?.sunSign && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                    {state.astrologicalState.sunSign}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Recommended Cuisines */}
          {recommendations && recommendations.topCuisines && recommendations.topCuisines.length > 0 && (
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
      )}

      {/* Recipe Recommendations - Always shown */}
      <div>
        {!selectedCuisine && <h3 className="text-lg font-medium mb-3">Recommended Recipes</h3>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {optimizedRecipes.map(({ recipe, compatibility, dominantElement }) => (
            <RecipeCard 
              key={`${recipe.cuisine}-${recipe.name}`}
              recipe={{
                ...recipe,
                // Ensure season is always a string array
                season: Array.isArray(recipe.season) ? recipe.season : recipe.season ? [recipe.season] : [],
                // Ensure mealType is always a string array
                mealType: Array.isArray(recipe.mealType) ? recipe.mealType : recipe.mealType ? [recipe.mealType] : [],
                // Convert ingredients to the format expected by RecipeCard
                ingredients: recipe.ingredients ? recipe.ingredients.map(convertToCardIngredient) : []
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