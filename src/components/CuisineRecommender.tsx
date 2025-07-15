'use client';

// Phase 10: Calculation Type Interfaces
interface CalculationData {
  value: number;
  weight?: number;
  score?: number;
}

interface ScoredItem {
  score: number;
  [key: string]: unknown;
}

interface ElementalData {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  [key: string]: unknown;
}

interface CuisineData {
  id: string;
  name: string;
  zodiacInfluences?: string[];
  planetaryDignities?: Record<string, unknown>;
  elementalState?: ElementalData;
  elementalProperties?: ElementalData;
  modality?: string;
  gregsEnergy?: number;
  [key: string]: unknown;
}

interface NutrientData {
  nutrient?: { name?: string };
  nutrientName?: string;
  name?: string;
  vitaminCount?: number;
  data?: unknown;
  [key: string]: unknown;
}

interface MatchingResult {
  score: number;
  elements: ElementalData;
  recipe?: unknown;
  [key: string]: unknown;
}

import React, { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';
import {
  Flame,
  Droplets,
  Wind,
  Mountain,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  List,
  Search,
  Sparkles,
  Star,
  Moon
} from 'lucide-react';
import { cuisines as allCuisinesData } from '@/data/cuisines';
import { 
  getCuisineRecommendations,
  generateTopSauceRecommendations,
  calculateElementalMatch,
  getMatchScoreClass,
  renderScoreBadge,
  calculateElementalProfileFromZodiac,
  calculateElementalContributionsFromPlanets,
} from '@/utils/cuisineRecommender';
import styles from './CuisineRecommender.module.css';
import {
  Element,
  ElementalProperties,
  ZodiacSign,
  LunarPhase,
  AlchemicalItem,
  PlanetaryPositionsType
} from '@/types/alchemy';
import { 
  CompleteCuisineType,
  Cuisine,
  CulinaryProfile
} from '@/types/culinary';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import {
  useIngredientMapping,
  useElementalState,
  useAstroTarotElementalState
} from '@/hooks';
import { transformCuisines, sortByAlchemicalCompatibility } from '@/utils/alchemicalTransformationUtils';
import { cuisineFlavorProfiles } from '@/data/cuisineFlavorProfiles';
import { getAllRecipes } from '@/data/recipes';
import { Sauce, allSauces } from '@/data/sauces';
import { Recipe } from '@/types/recipe';

// Using Cuisine interface from @/types/culinary instead of local definition

interface CuisineStyles {
  container: string;
  title: string;
  cuisineList: string;
  cuisineCard: string;
  cuisineName: string;
  description: string;
  alchemicalProperties: string;
  subtitle: string;
  propertyList: string;
  property: string;
  propertyName: string;
  propertyValue: string;
  astrologicalInfluences: string;
  influenceList: string;
  influence: string;
  loading: string;
  error: string;
}

// Add this helper function near the top of the file, outside any components
const getSafeScore = (score: unknown): number => {
  // Convert to number if needed, default to 0.5 if NaN or undefined
  const numScore = typeof score === 'number' ? score : parseFloat(score as Record<string, unknown>);
  return !isNaN(numScore) ? numScore : 0.5;
};

// Add this helper function just before the CuisineRecommender component definition
// Helper function to ensure consistent recipe structure
function buildCompleteRecipe(recipe: Recipe, cuisineName: string): any {
  const defaultElementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  const cuisineProfile = Object.values(cuisineFlavorProfiles).find(c => c.name?.toLowerCase() === cuisineName?.toLowerCase());
  const matchScore = typeof recipe.matchScore === 'number' ? recipe.matchScore : 0.85;
  
  return {
    id: recipe.id || `recipe-${Math.random().toString(36).substring(2, 9)}`,
    name: recipe.name || `${cuisineName} Recipe`,
    description: recipe.description || `A traditional recipe from ${cuisineName} cuisine.`,
    cuisine: recipe.cuisine || cuisineName,
    matchPercentage: recipe.matchPercentage || Math.round(matchScore * 100),
    matchScore,
    elementalProperties: recipe.elementalProperties || cuisineProfile?.elementalAlignment || defaultElementalProperties,
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
    instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
    cookTime: String(recipe.cookTime || "30 minutes"),
    prepTime: String(recipe.prepTime || "15 minutes"),
    servingSize: typeof recipe.servingSize === 'number' ? recipe.servingSize : 4,
    difficulty: String(recipe.difficulty || "Medium"),
    ...recipe
  };
}

// Add this function before the component export
function calculateLocalElementalMatch(
  recipeElements: ElementalProperties,
  userElements: ElementalProperties
): number {
  // Calculate similarity based on elemental profiles
  let matchSum = 0;
  let totalWeight = 0;
  
  // Get dominant elements
  const recipeDominant = Object.entries(recipeElements)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([element]) => element);
    
  const userDominant = Object.entries(userElements)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([element]) => element);
  
  // Calculate base match score (weighted sum of similarity)
  for (const element of ['Fire', 'Water', 'Earth', 'Air'] as Array<keyof ElementalProperties>) {
    const recipeValue = recipeElements[element] || 0;
    const userValue = userElements[element] || 0;
    const weight = recipeDominant.includes(element as string) ? 1.5 : 1;
    
    matchSum += (1 - Math.abs(recipeValue - userValue)) * weight;
    totalWeight += weight;
  }
  
  // Calculate dominant element match bonus
  const dominantMatches = recipeDominant.filter(element => userDominant.includes(element)).length;
  const dominantBonus = dominantMatches * 0.1; // Add up to 0.2 bonus for matching dominant elements
  
  // Calculate final score
  const baseScore = matchSum / totalWeight;
  const finalScore = baseScore + dominantBonus;
  
  // Ensure score is between 0 and 1
  return Math.min(1, Math.max(0, finalScore));
}

// Add this type definition if it's missing
type ExpandedState = {
  [key: string | number]: boolean;
};

export default function CuisineRecommender() {
  const alchemicalContext = useAlchemical();
  const { isDaytime = true, planetaryPositions = {}, state } = alchemicalContext ?? {};
  const { astrologicalState = { zodiacSign: 'aries', lunarPhase: 'new moon' } } = state ?? {};
  const { zodiacSign: currentZodiac, lunarPhase } = astrologicalState;
  const elementalState = (state as Record<string, unknown>)?.elementalState;

  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [cuisineRecommendations, setCuisineRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStep, setLoadingStep] = useState<string>('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [matchingRecipes, setMatchingRecipes] = useState<any[]>([]);
  const [sauceRecommendations, setSauceRecommendations] = useState<any[]>([]);
  const [allRecipesData, setAllRecipesData] = useState<Recipe[]>([]);
  
  const [expandedRecipes, setExpandedRecipes] = useState<ExpandedState>({});
  const [expandedSauces, setExpandedSauces] = useState<ExpandedState>({});
  const [showCuisineDetails, setShowCuisineDetails] = useState<boolean>(false);
  const [showAllRecipes, setShowAllRecipes] = useState<boolean>(false);
  const [showAllSauces, setShowAllSauces] = useState<boolean>(false);

  const [currentMomentElementalProfile, setCurrentMomentElementalProfile] = useState<ElementalProperties>(
    elementalState || calculateElementalProfileFromZodiac(currentZodiac as ZodiacSign)
  );

  useEffect(() => {
    const astroState = state?.astrologicalState;
    if (astroState?.elementalState) {
      setCurrentMomentElementalProfile(astroState.elementalState as ElementalProperties);
    } else if (currentZodiac) {
      setCurrentMomentElementalProfile(calculateElementalProfileFromZodiac(currentZodiac as ZodiacSign));
    }
  }, [state?.astrologicalState, currentZodiac]);

  const loadCuisineData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      setLoadingStep('Getting astrological state...');
      const astroState = {
        zodiacSign: currentZodiac as ZodiacSign,
        lunarPhase: lunarPhase as LunarPhase,
        planetaryPositions,
      };

      setLoadingStep('Generating cuisine recommendations...');
      const recommendations = getCuisineRecommendations(
        currentMomentElementalProfile,
        astroState,
        { count: 12, includeRegional: true }
      );
      
      setLoadingStep('Loading recipe data...');
      const recipes = await getAllRecipes();
      setAllRecipesData(recipes);
      
      setLoadingStep('Matching recipes to cuisines...');
      const cuisinesWithRecipes = recommendations.map(cuisine => {
        const matching = recipes.filter(recipe => 
          recipe.cuisine && recipe.cuisine.toLowerCase() === cuisine.name.toLowerCase()
        );
        return {
          ...cuisine,
          recipes: matching.map(r => buildCompleteRecipe(r, cuisine.name))
        };
      });
      setCuisineRecommendations(cuisinesWithRecipes);

      setLoadingStep('Harmonizing sauces...');
      const topSauces = generateTopSauceRecommendations(
        currentMomentElementalProfile,
        6,
        astroState
      );
      setSauceRecommendations(topSauces);

      setLoadingStep('Complete!');
      setLoading(false);
    } catch (err) {
      logger.error('Error loading cuisine data:', err);
      setError('Failed to load cuisine recommendations.');
      setLoading(false);
    }
  }, [currentMomentElementalProfile, currentZodiac, lunarPhase, planetaryPositions]);

  useEffect(() => {
    loadCuisineData();
  }, [loadCuisineData]);

  const handleCuisineSelect = (cuisineId: string) => {
    if (selectedCuisine === cuisineId) {
      setShowCuisineDetails(!showCuisineDetails);
      return;
    }
    setSelectedCuisine(cuisineId);
    setShowCuisineDetails(true);
    setExpandedRecipes({});
    setExpandedSauces({});

    const selectedData = cuisineRecommendations.find(c => c.id === cuisineId);
    if (selectedData?.recipes?.length > 0) {
      setMatchingRecipes(selectedData.recipes);
    } else {
      setMatchingRecipes([]);
    }
  };

  const toggleExpansion = (
    index: number | string, 
    type: 'recipe' | 'sauce'
  ) => {
    const stateSetter = type === 'recipe' ? setExpandedRecipes : setExpandedSauces;
    stateSetter(prev => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center space-y-3 bg-white rounded-lg shadow">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-lg font-medium">Loading cuisine recommendations...</p>
        <p className="text-sm text-gray-500">{loadingStep}</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-500 rounded">{error}</div>;
  }

  const selectedCuisineData = cuisineRecommendations.find(c => c.id === selectedCuisine);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-medium mb-3">Celestial Cuisine Guide</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {cuisineRecommendations.map(cuisine => (
          <div
            key={cuisine.id}
            className={`rounded border p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedCuisine === cuisine.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => handleCuisineSelect(cuisine.id)}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-sm">{cuisine.name}</h3>
              <span className={`text-xs px-2 py-1 rounded ${getMatchScoreClass(cuisine.score)}`}>
                {cuisine.matchPercentage}%
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-2 line-clamp-2" title={cuisine.description}>
              {cuisine.description}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Sparkles size={14} className="text-yellow-500" />
              <span>{cuisine.reasoning?.[0]}</span>
            </div>
            {cuisine.reasoning?.[1] && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                {cuisine.reasoning[1].includes('Favorable') ? <Star size={14} className="text-green-500" /> : <Moon size={14} className="text-blue-500" />}
                <span>{cuisine.reasoning[1]}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-lg font-medium mb-3">Celestial Sauce Harmonizer</h3>
        <p className="text-sm text-gray-600 mb-4">
          Discover sauces that complement the current moment's alchemical alignment.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sauceRecommendations.map((sauce, index) => (
            <div key={`${sauce.id}-${index}`} className="p-3 border rounded bg-white">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-medium text-sm leading-tight mr-1">{sauce.name}</h5>
                <span className={`text-xs px-1.5 py-0.5 rounded ${getMatchScoreClass(sauce.score)}`}>
                  {sauce.matchPercentage}%
                </span>
              </div>
              <p className="text-xs leading-relaxed text-gray-600 line-clamp-2" title={sauce.description}>
                {sauce.description}
              </p>
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                {sauce.reasoning?.map((reason, i) => <p key={i}>{reason}</p>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCuisineData && showCuisineDetails && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">{selectedCuisineData.name} Cuisine</h3>
            <span className={`text-xs px-2 py-1 rounded ${getMatchScoreClass(selectedCuisineData.score)}`}>
              {selectedCuisineData.matchPercentage}% match
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{selectedCuisineData.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded border">
              <h4 className="text-sm font-medium mb-2">Elemental Properties</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selectedCuisineData.elementalProperties || {}).map(([element, value]) => (
                  <div key={element} className="flex items-center justify-between">
                    <span className="text-sm">{element}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full bg-blue-500`} style={{ width: `${Math.round(Number(value) * 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded border">
              <h4 className="text-sm font-medium mb-2">Recommendation Reasoning</h4>
              <ul className="list-disc pl-4 text-sm text-gray-600">
                {selectedCuisineData.reasoning?.map((reason, i) => <li key={i}>{reason}</li>)}
              </ul>
            </div>
          </div>
          
          {matchingRecipes.length > 0 ? (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Recipes ({matchingRecipes.length} available)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {matchingRecipes.slice(0, showAllRecipes ? undefined : 6).map((recipe, index) => (
                  <div key={`${recipe.id}-${index}`} className="border rounded p-3 bg-white cursor-pointer" onClick={() => toggleExpansion(index, 'recipe')}>
                    <h5 className="font-medium text-sm">{recipe.name}</h5>
                    {expandedRecipes[index] && (
                      <div className="mt-2 border-t pt-2 text-xs">
                        <p>{recipe.description}</p>
                        <h6 className="font-semibold mt-2">Ingredients:</h6>
                        <ul className="list-disc pl-4">
                          {recipe.ingredients.map((ing, i) => <li key={i}>{typeof ing === 'string' ? ing : `${ing.amount} ${ing.unit} ${ing.name}`}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {matchingRecipes.length > 6 && (
                <button
                  className="text-xs text-blue-500 mt-2 hover:underline flex items-center"
                  onClick={() => setShowAllRecipes(!showAllRecipes)}
                >
                  {showAllRecipes ? (
                    <><ChevronUp size={12} className="mr-1" />Show Less</>
                  ) : (
                    <><ChevronDown size={12} className="mr-1" />Show All Recipes ({matchingRecipes.length})</>
                  )}
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-4">No specific recipes found for {selectedCuisineData.name}.</p>
          )}
        </div>
      )}
    </div>
  );
}
