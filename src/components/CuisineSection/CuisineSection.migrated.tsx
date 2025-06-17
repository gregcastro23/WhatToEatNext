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

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useServices } from '@/hooks/useServices';
import Link from 'next/link';
import type { Recipe } from '@/types/recipe';
// TODO: Fix CSS module import - was: import from "./CuisineSection.module.css.ts"
import { logger } from '@/utils/logger';

// Define SauceInfo interface
interface SauceInfo {
  id: string;
  name: string;
  description?: string;
  base?: string;
  keyIngredients?: string[];
  culinaryUses?: string[];
  variants?: string[];
  elementalProperties?: { [key: string]: number };
  astrologicalInfluences?: string[];
  seasonality?: string;
  preparationNotes?: string;
  technicalTips?: string;
}

interface CuisineSectionProps {
  cuisine: string;
  recipes?: Recipe[];
  elementalState: { Fire: number;
    Water: number;
    Earth: number;
    Air: number;
    season: string;
    timeOfDay: string;
  };
}

/**
 * CuisineSection Component - Migrated Version
 * 
 * This component displays information about a specific cuisine, including:
 * - Related recipes
 * - Traditional sauces
 * - Regional variations
 * 
 * It has been migrated from context-based data access to service-based architecture.
 */
export function CuisineSectionMigrated({
  cuisine,
  recipes = [],
  elementalState
}: CuisineSectionProps) {
  // Replace direct imports with services
  const {
    isLoading: servicesLoading,
    error: servicesError,
    recipeService
  } = useServices();

  // Component state
  const [viewAllRecipes, setViewAllRecipes] = useState<boolean>(false);
  const [traditionalSauces, setTraditionalSauces] = useState<SauceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [cuisineRecipesFromService, setCuisineRecipesFromService] = useState<Recipe[]>([]);

  // Load cuisine data
  useEffect(() => {
    if (servicesLoading || !recipeService) {
      return;
    }

    const loadCuisineData = async () => {
      try {
        setIsLoading(true);
        
        // Get recipes for this cuisine using the recipe service
        if (cuisine) {
          const response = await recipeService.getRecipesByCuisine({
            cuisine,
            limit: 20,
            offset: 0
          });
          
          if (response.success && response.data) {
            setCuisineRecipesFromService(response.data);
          } else {
            setCuisineRecipesFromService([]);
          }
        }
        
        // For now, we'll leave traditional sauces empty since cuisineService doesn't exist
        setTraditionalSauces([]);
        
        setError(null);
      } catch (err) {
        logger.error('Error loading cuisine data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load cuisine data'));
        setTraditionalSauces([]);
        setCuisineRecipesFromService([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (cuisine) {
      loadCuisineData();
    }
  }, [servicesLoading, recipeService, cuisine]);

  // Filter recipes for the current cuisine, prioritizing match scores
  const cuisineRecipes = useMemo(() => {
    // Combine provided recipes with recipes from service
    const allRecipes = [...(recipes || []), ...cuisineRecipesFromService];
    
    if (allRecipes.length === 0) {
      return [];
    }
    
    // Filter and sort recipes
    return allRecipes
      .filter(recipe => {
        if (!recipe) return false;
        
        // Apply surgical type casting with variable extraction
        const cuisineStringMatch = cuisine as any;
        const cuisineLowerMatch = cuisineStringMatch?.toLowerCase?.();
        
        // Direct cuisine match
        if (recipe.cuisine?.toLowerCase() === cuisineLowerMatch) return true;
        
        // Regional cuisine match
        if ((recipe.regionalCuisine as any)?.toLowerCase?.() === cuisineLowerMatch) return true;
        
        // High match score
        return (recipe.matchScore || 0) > 0.75;
      })
      .sort((a, b) => {
        // First sort by match score
        const scoreA = a.matchScore || 0;
        const scoreB = b.matchScore || 0;
        
        if (scoreB !== scoreA) return scoreB - scoreA;
        
        // If match scores are equal, prioritize direct cuisine matches
        // Apply surgical type casting with variable extraction
        const cuisineStringSort = cuisine as any;
        const cuisineLowerSort = (cuisineStringSort as any)?.toLowerCase?.();
        
        const directMatchA = a.cuisine?.toLowerCase() === cuisineLowerSort;
        const directMatchB = b.cuisine?.toLowerCase() === cuisineLowerSort;
        
        if (directMatchA && !directMatchB) return -1;
        if (!directMatchA && directMatchB) return 1;
        
        // Default to alphabetical ordering
        return (a.name || '').localeCompare(b.name || '');
      })
      .slice(0, viewAllRecipes ? undefined : 4);
  }, [recipes, cuisineRecipesFromService, cuisine, viewAllRecipes]);

  // Check for regional variations to add information about cuisine relationships
  const isRegionalVariant = (cuisineRecipes || []).some(r => (r.regionalCuisine as any)?.toLowerCase?.() === (cuisine as any)?.toLowerCase?.());
  const parentCuisineName = isRegionalVariant ? cuisineRecipes.find(r => (r.regionalCuisine as any)?.toLowerCase?.() === (cuisine as any)?.toLowerCase?.())?.cuisine : null;
  
  // Check if this is a parent cuisine with regional variants shown
  const hasRegionalVariants = (cuisineRecipes || []).some(r => r.regionalCuisine && r.cuisine?.toLowerCase() === cuisine?.toLowerCase());
  const regionalVariantNames = [... new Set(cuisineRecipes
    .filter(r => r.regionalCuisine && r.cuisine?.toLowerCase() === cuisine?.toLowerCase())
    .map(r => r.regionalCuisine))] as string[];

  const renderSeasonalInfo = (recipe: Recipe) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {recipe.currentSeason && (
        <span className="text-sm px-2 py-1 bg-green-50 text-green-700 rounded">
          {Array.isArray(recipe.currentSeason) ? recipe.currentSeason?.join(', ') : (recipe.currentSeason as string)}
        </span>
      )}
      {recipe.mealType && (
        <span className="text-sm px-2 py-1 bg-blue-50 text-blue-700 rounded">
          {Array.isArray(recipe.mealType) ? recipe.mealType?.join(', ') : recipe.mealType}
        </span>
      )}
      {recipe.timeToMake && (
        <span className="text-sm px-2 py-1 bg-purple-50 text-purple-700 rounded">
          {recipe.timeToMake} {typeof recipe.timeToMake === 'number' ? 'min' : ''}
        </span>
      )}
    </div>
  );

  // Function to get match score CSS class based on the score
  const getMatchScoreClass = (score: number) => {
    // More dynamic classification with smoother transitions and more differentiation
    if (score >= 0.95) return 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold shadow-md';
    if (score >= 0.90) return 'bg-gradient-to-r from-green-500 to-green-400 text-white font-bold shadow-sm';
    if (score >= 0.85) return 'bg-gradient-to-r from-green-400 to-green-300 text-green-900 font-bold shadow-sm';
    if (score >= 0.80) return 'bg-green-200 text-green-800 font-semibold';
    if (score >= 0.75) return 'bg-green-100 text-green-700 font-medium';
    if (score >= 0.70) return 'bg-yellow-100 text-yellow-700';
    if (score >= 0.65) return 'bg-yellow-50 text-yellow-600';
    return 'bg-gray-100 text-gray-600';
  };
  
  // Function to render a score badge with stars for high scores
  const renderScoreBadge = (score: number, hasDualMatch: boolean = false) => {
    // Apply a small multiplier to emphasize differences in scores
    const enhancedScore = Math.min(100, Math.round(score * 110));
    let stars = '';
    let tooltipText = 'Match score based on cuisine, season, and elemental balance';
    
    if (score >= 0.95) {
      stars = '★★★';
      tooltipText = 'Perfect match: Highly recommended for your preferences';
    } else if (score >= 0.88) {
      stars = '★★';
      tooltipText = 'Excellent match for your preferences';
    } else if (score >= 0.80) {
      stars = '★';
      tooltipText = 'Very good match for your preferences';
    }
    
    if (hasDualMatch) {
      tooltipText = `${tooltipText} (Matches multiple criteria)`;
    }
    
    return (
      <span 
        className={`text-sm ${getMatchScoreClass(score)} px-2 py-1 rounded flex items-center gap-1 transition-all duration-300 hover:scale-105`}
        title={tooltipText}
      >
        {hasDualMatch && <span className="h-2 w-2 bg-yellow-400 rounded-full"></span>}
        <span>{enhancedScore}% match</span>
        {stars && <span className="ml-1">{stars}</span>}
      </span>
    );
  };

  // Render a sauce card
  const renderSauceCard = (sauce: SauceInfo, index: number) => {
    if (!sauce || !sauce.id) {
      return null;
    }
    
    // Create a URL-friendly sauce ID
    const sauceUrlId = sauce.id?.toLowerCase()?.replace(/ /g, '-').replace(/[^\w-]/g, '');
    const sauceUrl = `/sauces/${cuisine?.toLowerCase() || 'unknown'}/${sauceUrlId}`;
    
    return (
      <Link 
        key={`${sauce.id}-${index}`}
        href={sauceUrl}
        className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{sauce.name || 'Unnamed sauce'}</h3>
          {sauce.base && (
            <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded">
              {sauce.base} base
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{sauce.description || 'No description available'}</p>
        
        {/* Seasonal info if available */}
        {sauce.seasonality && (
          <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded mr-2">
            {sauce.seasonality}
          </span>
        )}
      </Link>
    );
  };

  // Render a recipe card
  const renderRecipeCard = (recipe: Recipe, index: number) => {
    if (!recipe || !recipe.name) {
      return null;
    }
    
    // Create URL-friendly recipe ID
    const recipeId = recipe.name?.toLowerCase()?.replace(/ /g, '-').replace(/[^\w-]/g, '');
    
    return (
      <Link 
        key={`${recipe.name}-${index}`}
        href={`/recipes/${recipeId}`}
        className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{recipe.name}</h3>
          {recipe.matchScore !== undefined && (
            renderScoreBadge(recipe.matchScore as any, !!recipe.dualMatch)
          )}
        </div>
        
        {/* Show regional cuisine if different from main cuisine */}
        {recipe.regionalCuisine && recipe.regionalCuisine !== recipe.cuisine && (
          <div className="text-xs text-gray-500 mb-2">
            Regional style: <span className="font-medium">{recipe.regionalCuisine as string}</span>
          </div>
        )}
        
        <p className="text-sm text-gray-600 mb-3">{recipe.description || 'No description available'}</p>
        
        {renderSeasonalInfo(recipe)}
      </Link>
    );
  };

  // Handle loading state
  if (servicesLoading || isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold capitalize mb-4">
          {cuisine.replace('_', ' ')} Cuisine
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle error state
  if (servicesError || error) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold capitalize mb-4">
          {cuisine.replace('_', ' ')} Cuisine
        </h2>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p>Error loading cuisine data: {(servicesError || error)?.message}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No recipes state
  if ((cuisineRecipes || []).length === 0) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold capitalize">
            {cuisine.replace('_', ' ')} Cuisine
          </h2>
          <span className="text-sm text-gray-600">
            No recipes available
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
          <p>No recipes available for this cuisine at the moment</p>
          <p className="mt-2 text-sm">Please try another cuisine or check back later</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Main content with recipes and sauces
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold capitalize">
          {cuisine.replace('_', ' ')} Cuisine
        </h2>
        
        {/* Display number of recipes */}
        {(cuisineRecipes || []).length > 0 && (
          <span className="text-sm text-gray-600">
            {(cuisineRecipes || []).length} recipe{(cuisineRecipes || []).length !== 1 ? 's' : ''} available
          </span>
        )}
      </div>

      {/* Regional variant info */}
      {isRegionalVariant && parentCuisineName && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-blue-800">
          <p>
            <span className="font-medium">{cuisine}</span> is a regional variant of{' '}
            <Link href={`/cuisines/${parentCuisineName?.toLowerCase()}`} className="underline hover:text-blue-600">
              {parentCuisineName} cuisine
            </Link>
          </p>
        </div>
      )}

      {/* Parent cuisine with regional variants */}
      {hasRegionalVariants && (regionalVariantNames || []).length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-blue-800">
          <p className="mb-2">
            <span className="font-medium">{cuisine}</span> has regional variants including:
          </p>
          <ul className="flex flex-wrap gap-2">
            {(regionalVariantNames || []).map((variant, index) => (
              <li key={index}>
                <Link 
                  href={`/cuisines/${variant?.toLowerCase()}`} 
                  className="px-3 py-1 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                >
                  {variant}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recipe Grid */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-semibold">Recipes</h3>
          {(cuisineRecipes || []).length > 4 && (
            <button 
              onClick={() => setViewAllRecipes(!viewAllRecipes)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {viewAllRecipes ? 'Show less' : 'View all'}
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(cuisineRecipes || []).map((recipe, index) => renderRecipeCard(recipe, index))}
        </div>
      </div>

      {/* Traditional Sauces Section */}
      {(traditionalSauces || []).length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-3">Traditional Sauces</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(traditionalSauces || []).map((sauce, index) => renderSauceCard(sauce, index))}
          </div>
        </div>
      )}
    </div>
  );
} 