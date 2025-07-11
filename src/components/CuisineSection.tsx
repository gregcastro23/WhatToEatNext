import React from 'react';
import type { Recipe } from '@/types/recipe';
// TODO: Fix CSS module import - was: import from "./CuisineSection.module.css.ts"
import { getRelatedCuisines, getRecipesForCuisineMatch } from '../data/cuisineFlavorProfiles';
import { getBestRecipeMatches } from '../data/recipes';
import Link from 'next/link';
import cuisinesMap from '../data/cuisines';

// Import cuisinesMap to access sauce data

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

export const CuisineSection: React.FC<CuisineSectionProps> = ({
  cuisine,
  recipes = [],
  elementalState
}) => {
  const [viewAllRecipes, setViewAllRecipes] = React.useState<boolean>(false);
  const [traditionalSauces, setTraditionalSauces] = React.useState<SauceInfo[]>([]);

  // Load sauce data from cuisine
  React.useEffect(() => {
    const loadSauces = () => {
      try {
        // Find cuisine by name (case insensitive)
        const cuisineKey = Object.keys(cuisinesMap)?.find(
          key => key?.toLowerCase() === cuisine?.toLowerCase()
        );
        
        if (cuisineKey && cuisinesMap[cuisineKey]?.traditionalSauces) {
          // Convert traditional sauces object to array
          const saucesArray = Object.entries(cuisinesMap[cuisineKey].traditionalSauces || {}).map(([id, sauce]) => ({
              id,
              ...(sauce as any || {})
            })
          );
          setTraditionalSauces(saucesArray);
        } else {
          setTraditionalSauces([]);
        }
      } catch (error) {
        setTraditionalSauces([]);
      }
    };
    
    if (cuisine) {
      loadSauces();
    }
  }, [cuisine]);

  // Filter recipes for the current cuisine, prioritizing match scores
  const cuisineRecipes = React.useMemo(() => {
    let matchedRecipes: Recipe[] = [];
    
    if (!Array.isArray(recipes) || (recipes || []).length === 0) {
      // If no recipes provided, try to find some using the cuisine name directly
      try {
        // First try using getRecipesForCuisineMatch
        const matchedCuisineRecipes = getRecipesForCuisineMatch(
          cuisine || '', 
          [], // Pass empty array to trigger service use
          8
        );
        
        // Check if it's an array (not a Promise) and has length
        if (Array.isArray(matchedCuisineRecipes) && matchedCuisineRecipes.length > 0) {
          return matchedCuisineRecipes;
        }
        
        // If no recipes from getRecipesForCuisineMatch, try getBestRecipeMatches
        // Note: getBestRecipeMatches returns a Promise, but we can't await in useMemo
        // So we'll skip this for now and use the fallback logic below
        matchedRecipes = [];
      } catch (error) {
        // Error handled silently
      }
      
      // If we have found recipes, return them
      if ((matchedRecipes || []).length > 0) {
        return matchedRecipes;
      }
    }
    
    // If recipes are provided, filter and sort them
    return recipes
      .filter(recipe => {
        if (!recipe) return false;
        
        // Match main cuisine
        if (recipe.cuisine?.toLowerCase() === cuisine?.toLowerCase()) return true;
        
        // Match regional cuisine if specified
        // Apply surgical type casting with variable extraction
        const cuisineLower = String(cuisine || '').toLowerCase();
        
        if (String(recipe.regionalCuisine || '').toLowerCase() === cuisineLower) return true;
        
        // Try to match related cuisines
        try {
          const relatedCuisines = getRelatedCuisines(cuisine || '');
          if ((relatedCuisines || []).some(rc => {
            // Apply surgical type casting with variable extraction
            const rcLower = String(rc || '').toLowerCase();
            return (
              recipe.cuisine?.toLowerCase() === rcLower ||
              String(recipe.regionalCuisine || '').toLowerCase() === rcLower
            );
          })) {
            return true;
          }
        } catch (error) {
          // If getRelatedCuisines fails, just continue with basic matching
        }
        
        // If no match but has high match score, include it
        return (Number(recipe.matchScore) || 0) > 0.75;
      })
      .sort((a, b) => {
        // First sort by match score
        // Apply Pattern KK-1: Explicit Type Assertion for arithmetic operations  
        const scoreA = Number(a.matchScore) || 0;
        const scoreB = Number(b.matchScore) || 0;
        
        if (scoreB !== scoreA) return scoreB - scoreA;
        
        // If match scores are equal, prioritize direct cuisine matches
        // Apply surgical type casting with variable extraction
        const cuisineStringForSort = cuisine as unknown;
        const cuisineLowerForSort = String(cuisineStringForSort || '').toLowerCase();
        
        const directMatchA = a.cuisine?.toLowerCase() === cuisineLowerForSort;
        const directMatchB = b.cuisine?.toLowerCase() === cuisineLowerForSort;
        
        if (directMatchA && !directMatchB) return -1;
        if (!directMatchA && directMatchB) return 1;
        
        // Default to alphabetical ordering
        return (a.name || '').localeCompare(b.name || '');
      })
      .slice(0, viewAllRecipes ? undefined : 4);
  }, [recipes, cuisine, elementalState, viewAllRecipes]);

  if (!Array.isArray(cuisineRecipes) || cuisineRecipes.length === 0) {
    // Special case for African and American cuisines
    // Use safe type casting for string methods
    const cuisineString = cuisine as string;
    const isSpecialCase = cuisineString?.toLowerCase() === 'african' || cuisineString?.toLowerCase() === 'american';
    if (isSpecialCase) {
      // Last-ditch effort to find recipes for these problematic cuisines
      try {
        // Try direct access with different capitalizations
        const importedCuisine = cuisinesMap[cuisine] || 
                              cuisinesMap[cuisine?.toLowerCase()] || 
                              cuisinesMap[cuisine?.charAt(0)?.toUpperCase() + cuisine?.slice(1)?.toLowerCase()];
                              
        if (importedCuisine && importedCuisine.dishes) {
          const specialRecipes = [];
          
          // Try to extract some recipes directly
          Object.entries(importedCuisine.dishes || {}).forEach(([mealType, seasonalDishes]) => {
            const dishesData = seasonalDishes as { all?: unknown[] };
            if (seasonalDishes && dishesData.all && Array.isArray(dishesData.all)) {
              specialRecipes?.push(...dishesData.all.slice(0, 4));
            }
          });
          
          if ((specialRecipes || []).length > 0) {
            // Format recipes for display
            return (
              <div className="mb-8">
                <h2 className="text-2xl font-bold capitalize mb-4">{cuisine.replace('_', ' ')} Cuisine</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(specialRecipes || []).map((recipe, i) => (
                    <div key={i} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-medium">{recipe.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{recipe.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
        }
      } catch (error) {
        // Error handled silently
      }
    }
  }

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
  const renderScoreBadge = (score: number, hasDualMatch = false) => {
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

  // Check for regional variations to add information about cuisine relationships
  const isRegionalVariant = Array.isArray(cuisineRecipes) && cuisineRecipes.some(r => {
    // Apply surgical type casting with variable extraction
    const recipeData = r as unknown;
    const cuisineStringForRegional = cuisine as any;
    const cuisineLowerForRegional = cuisineStringForRegional?.toLowerCase?.();
    
    return (recipeData as any)?.regionalCuisine?.toLowerCase() === cuisineLowerForRegional;
  });
  const parentCuisineName = isRegionalVariant && Array.isArray(cuisineRecipes) ? (() => {
    const foundRecipe = cuisineRecipes.find(r => {
      const recipeData = r as unknown;
      return (recipeData as any)?.regionalCuisine?.toLowerCase() === cuisine?.toLowerCase();
    });
    const foundRecipeData = foundRecipe as unknown;
    return (foundRecipeData as any)?.cuisine;
  })() : null;
  
  // Check if this is a parent cuisine with regional variants shown
  const hasRegionalVariants = Array.isArray(cuisineRecipes) && cuisineRecipes.some(r => {
    const recipeData = r as unknown;
    return (recipeData as any)?.regionalCuisine && (recipeData as any)?.cuisine?.toLowerCase() === cuisine?.toLowerCase();
  });
  const regionalVariantNames = [...new Set(Array.isArray(cuisineRecipes) ? cuisineRecipes
    .filter(r => {
      const recipeData = r as unknown;
      return (recipeData as any)?.regionalCuisine && (recipeData as any)?.cuisine?.toLowerCase() === cuisine?.toLowerCase();
    })
    .map(r => {
      const recipeData = r as unknown;
      return (recipeData as any)?.regionalCuisine;
    }) : [])] as string[];

  // Render a sauce card
  const renderSauceCard = (sauce: SauceInfo, index: number) => {
    if (!sauce || !sauce.id) {
      return null;
    }
    
    // Create a URL-friendly sauce ID
    const cuisineKey = Object.keys(cuisinesMap)?.find(
      key => key?.toLowerCase() === cuisine?.toLowerCase()
    );
    
    const sauceUrlId = sauce.id?.toLowerCase()?.replace(/ /g, '-').replace(/[^\w-]/g, '');
    const sauceUrl = `/sauces/${cuisineKey?.toLowerCase() || 'unknown'}/${sauceUrlId}`;
    
    return (
      <Link 
        key={`${sauce.id}-${index}`}
        href={sauceUrl}
        className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
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
        className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{recipe.name}</h3>
          {recipe.matchScore !== undefined && (
            renderScoreBadge((recipe.matchScore as any) || 0, !!recipe.dualMatch)
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