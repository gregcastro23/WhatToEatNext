import Link from 'next/link';
import React from 'react';

import { getRelatedCuisines, getRecipesForCuisineMatch } from '@/data/cuisineFlavorProfiles';
import cuisinesMap from '@/data/cuisines';
import { getBestRecipeMatches } from '@/data/recipes';
import type { Ingredient, UnifiedIngredient } from '@/types/ingredient';
import type { Recipe } from '@/types/recipe';

import styles from './CuisineSection.module.css';


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
  elementalProperties?: Record<string, number>;
  astrologicalInfluences?: string[];
  seasonality?: string;
  preparationNotes?: string;
  technicalTips?: string;
}

interface CuisineSectionProps {
  cuisine: string;
  recipes?: Recipe[];
  elementalState: {
    Fire: number;
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
        const cuisineKey = Object.keys(cuisinesMap).find(
          key => key.toLowerCase() === cuisine?.toLowerCase()
        );
        
        if (cuisineKey && cuisinesMap[cuisineKey]) {
          const cuisineData = cuisinesMap[cuisineKey] as Record<string, unknown>;
          const saucesData = cuisineData?.traditionalSauces;
          
          if (saucesData) {
            // Convert traditional sauces object to array
            const saucesArray = Object.entries(saucesData).map(
              ([id, sauce]) => ({
                id,
                ...(sauce as Record<string, unknown> || {})
              })
            );
            setTraditionalSauces(saucesArray as SauceInfo[]);
          } else {
            setTraditionalSauces([]);
          }
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
    
    if (!Array.isArray(recipes) || recipes.length === 0) {
      // If no recipes provided, try to find some using the cuisine name directly
      try {
        // First try using getRecipesForCuisineMatch - handle potential async
        const matchedCuisineRecipes = getRecipesForCuisineMatch(
          cuisine || '', 
          [], // Pass empty array to trigger service use
          8
        );
        
        // If it's a Promise, we can't handle it in useMemo - skip to next approach
        if (matchedCuisineRecipes && 
            !('then' in (matchedCuisineRecipes as object)) && 
            Array.isArray(matchedCuisineRecipes) && 
            matchedCuisineRecipes.length > 0) {
          return matchedCuisineRecipes as Recipe[];
        }
        
        // If no recipes from getRecipesForCuisineMatch, getBestRecipeMatches returns a Promise
        // We can't handle Promises in useMemo, so return empty array and handle async separately
        // TODO: Consider using useEffect for async recipe loading
        matchedRecipes = [];
      } catch (error) {
        // Error handled silently
      }
      
      // If we have found recipes, return them
      if (matchedRecipes.length > 0) {
        return matchedRecipes;
      }
    }
    
    // If recipes are provided, filter and sort them
    return recipes
      .filter(recipe => {
        if (!recipe) return false;
        
        const recipeData = recipe as Record<string, unknown>;
        
        // Match main cuisine
        if (String(recipeData?.cuisine || '').toLowerCase() === cuisine?.toLowerCase()) return true;
        
        // Match regional cuisine if specified
        if (String(recipeData?.regionalCuisine || '').toLowerCase() === cuisine?.toLowerCase()) return true;
        
        // Try to match related cuisines
        try {
          const relatedCuisines = getRelatedCuisines(cuisine || '');
          if (relatedCuisines.some(rc => 
            String(recipeData?.cuisine || '').toLowerCase() === rc?.toLowerCase() ||
            String(recipeData?.regionalCuisine || '').toLowerCase() === rc?.toLowerCase()
          )) {
            return true;
          }
        } catch (error) {
          // If getRelatedCuisines fails, just continue with basic matching
        }
        
        // If no match but has high match score, include it
        return (Number(recipeData?.matchScore) || 0) > 0.75;
      })
      .sort((a, b) => {
        const recipeA = a as Record<string, unknown>;
        const recipeB = b as Record<string, unknown>;
        
        // First sort by match score
        const scoreA = Number(recipeA?.matchScore) || 0;
        const scoreB = Number(recipeB?.matchScore) || 0;
        
        if (scoreB !== scoreA) return scoreB - scoreA;
        
        // If match scores are equal, prioritize direct cuisine matches
        const directMatchA = String(recipeA?.cuisine || '').toLowerCase() === cuisine?.toLowerCase();
        const directMatchB = String(recipeB?.cuisine || '').toLowerCase() === cuisine?.toLowerCase();
        
        if (directMatchA && !directMatchB) return -1;
        if (!directMatchA && directMatchB) return 1;
        
        // Default to alphabetical ordering
        return String(recipeA?.name || '').localeCompare(String(recipeB?.name || ''));
      })
      .slice(0, viewAllRecipes ? undefined : 4);
  }, [recipes, cuisine, elementalState, viewAllRecipes]);

  if (!cuisineRecipes.length) {
    // Special case for African and American cuisines
    const isSpecialCase = cuisine?.toLowerCase() === 'african' || cuisine?.toLowerCase() === 'american';
    if (isSpecialCase) {
      // Last-ditch effort to find recipes for these problematic cuisines
      try {
        // Try direct access with different capitalizations
        const importedCuisine = cuisinesMap[cuisine] || 
                              cuisinesMap[cuisine?.toLowerCase()] || 
                              cuisinesMap[cuisine?.charAt(0)?.toUpperCase() + cuisine?.slice(1)?.toLowerCase()];
                              
        if (importedCuisine) {
          const cuisineData = importedCuisine as Record<string, unknown>;
          
          if (cuisineData?.dishes) {
            const specialRecipes = [];
            
            // Try to extract some recipes directly
            Object.entries(cuisineData.dishes).forEach(([_mealType, seasonalDishes]) => {
              const dishesData = seasonalDishes as Record<string, unknown>;
              if (dishesData && dishesData.all && Array.isArray(dishesData.all)) {
                specialRecipes.push(...dishesData.all.slice(0, 4));
              }
            });
            
            if (specialRecipes.length > 0) {
              // Format recipes for display
              return (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold capitalize mb-4">{cuisine.replace('_', ' ')} Cuisine</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {specialRecipes.map((recipe, i) => {
                      const recipeData = recipe as Record<string, unknown>;
                      return (
                        <div key={i} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <h3 className="text-lg font-medium">{String(recipeData?.name || 'Unnamed Recipe')}</h3>
                          <p className="text-gray-600 text-sm mt-1">{String(recipeData?.description || 'No description available')}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          }
        }
      } catch (error) {
        // Error handled silently
      }
    }
    
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold capitalize mb-4">{cuisine?.replace('_', ' ')} Cuisine</h2>
        <p className="text-gray-600">No recipes available for this cuisine at the moment.</p>
      </div>
    );
  }

  const renderSeasonalInfo = (recipe: Recipe) => {
    const recipeData = recipe as Record<string, unknown>;
    
    return (
      <div className="text-xs text-gray-500 flex flex-wrap gap-2 mt-2">
        {Boolean(recipeData?.season) && (
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {String(recipeData.season)}
          </span>
        )}
        {Boolean(recipeData?.mealType) && (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {String(recipeData.mealType)}
          </span>
        )}
        {Boolean(recipeData?.difficulty) && (
          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
            {String(recipeData.difficulty)}
          </span>
        )}
      </div>
    );
  };

  const getMatchScoreClass = (score: number) => {
    if (score >= 0.9) return 'bg-green-500 text-white';
    if (score >= 0.8) return 'bg-green-400 text-white';
    if (score >= 0.7) return 'bg-yellow-400 text-black';
    if (score >= 0.6) return 'bg-orange-400 text-white';
    return 'bg-red-400 text-white';
  };

  const renderScoreBadge = (score: number, hasDualMatch: boolean = false) => {
    if (!score || score === 0) return null;
    
    return (
      <div className="flex items-center gap-1">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreClass(score)}`}>
          {Math.round(score * 100)}%
        </span>
        {hasDualMatch && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500 text-white">
            Dual Match
          </span>
        )}
      </div>
    );
  };

  const renderSauceCard = (sauce: SauceInfo, index: number) => {
    const sauceData = sauce as unknown as Record<string, unknown>;
    
    return (
      <div key={index} className="bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-lg text-gray-900">{String(sauceData?.name || 'Traditional Sauce')}</h4>
          {Boolean(sauceData?.elementalProperties) && (
            <div className="flex gap-1">
              {Object.entries(sauceData.elementalProperties).map(([element, value]) => (
                <span 
                  key={element}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    element === 'Fire' ? 'bg-red-100 text-red-700' :
                    element === 'Water' ? 'bg-blue-100 text-blue-700' :
                    element === 'Earth' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}
                >
                  {element}: {String(value || 0)}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {Boolean(sauceData?.description) && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{String(sauceData.description)}</p>
        )}
        
        <div className="space-y-2 text-sm">
          {Boolean(sauceData?.base) && (
            <div><span className="font-medium text-gray-700">Base:</span> {String(sauceData.base)}</div>
          )}
          
          {Boolean(sauceData?.keyIngredients && Array.isArray(sauceData.keyIngredients) && sauceData.keyIngredients.length > 0) && (
            <div>
              <span className="font-medium text-gray-700">Key Ingredients:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(sauceData.keyIngredients as string[]).slice(0, 4).map((ingredient: string, i: number) => (
                  <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {ingredient}
                  </span>
                ))}
                {(sauceData.keyIngredients as string[]).length > 4 && (
                  <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs">
                    +{(sauceData.keyIngredients as string[]).length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRecipeCard = (recipe: Recipe, index: number) => {
    const recipeData = recipe as Record<string, unknown>;
    const hasDualMatch = String(recipeData?.cuisine || '').toLowerCase() === cuisine?.toLowerCase() && 
                        String(recipeData?.regionalCuisine || '').toLowerCase() === cuisine?.toLowerCase();
    
    return (
      <div key={String(recipeData?.id || index)} className="bg-white rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
              {String(recipeData?.name || 'Unnamed Recipe')}
            </h3>
            {renderScoreBadge(Number(recipeData?.matchScore) || 0, hasDualMatch)}
          </div>
          
          {Boolean(recipeData?.description) && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">{String(recipeData.description)}</p>
          )}
          
          <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
            {recipeData?.cookingTime && (
              <span className="flex items-center gap-1">
                ⏱️ {String(recipeData.cookingTime)}
              </span>
            )}
            {Boolean(recipeData?.difficulty) && (
              <span className="flex items-center gap-1">
                📊 {String(recipeData.difficulty)}
              </span>
            )}
            {recipeData?.servings && (
              <span className="flex items-center gap-1">
                👥 {String(recipeData.servings)}
              </span>
            )}
          </div>
          
          {renderSeasonalInfo(recipe)}
          
          {recipeData?.ingredients && Array.isArray(recipeData.ingredients) && recipeData.ingredients.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-700">Key Ingredients:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(recipeData.ingredients as unknown[]).slice(0, 3).map((ingredient: Ingredient | UnifiedIngredient, i: number) => (
                  <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                    {String((ingredient as unknown as Record<string, unknown>)?.name || ingredient)}
                  </span>
                ))}
                {(recipeData.ingredients as unknown[]).length > 3 && (
                  <span className="bg-gray-200 text-gray-500 px-2 py-1 rounded text-xs">
                    +{(recipeData.ingredients as unknown[]).length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
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