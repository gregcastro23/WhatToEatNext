import React from 'react';
import type { Recipe, RecipeIngredient } from '@/types/recipe';
import styles from './CuisineSection.module.css';
import { getDetailedFlavorProfile } from '@/utils/flavorProfiles';
import { getRecipesForCuisineMatch, getRelatedCuisines } from '@/data/cuisineFlavorProfiles';
import { getBestRecipeMatches } from '@/data/recipes';
import Link from 'next/link';
import { LocalRecipeService } from '@/services/LocalRecipeService';

// Import cuisinesMap to access sauce data
import cuisinesMap from '@/data/cuisines';

// Define Cuisine interface locally instead of importing it
interface Cuisine {
  id: string;
  name: string;
  description?: string;
  alchemicalProperties?: Record<string, number>;
  astrologicalInfluences?: string[];
}

// Define SauceInfo interface
interface SauceInfo {
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
  const [traditionalSauces, setTraditionalSauces] = React.useState<any[]>([]);

  // Load sauce data from cuisine
  React.useEffect(() => {
    const loadSauces = () => {
      try {
        // Find cuisine by name (case insensitive)
        const cuisineKey = Object.keys(cuisinesMap).find(
          key => key.toLowerCase() === cuisine?.toLowerCase()
        );
        
        if (cuisineKey && cuisinesMap[cuisineKey]?.traditionalSauces) {
          // Convert traditional sauces object to array
          const saucesArray = Object.entries(cuisinesMap[cuisineKey].traditionalSauces || {}).map(
            ([id, sauce]) => ({
              id,
              ...(sauce || {})
            })
          );
          setTraditionalSauces(saucesArray);
        } else {
          console.info(`No traditional sauces found for cuisine: ${cuisine}`);
          setTraditionalSauces([]);
        }
      } catch (error) {
        console.error('Error loading sauces:', error);
        setTraditionalSauces([]);
      }
    };
    
    if (cuisine) {
      loadSauces();
    }
  }, [cuisine]);

  // Filter recipes for the current cuisine, prioritizing match scores
  const cuisineRecipes = React.useMemo(() => {
    console.log(`Trying to get recipes for cuisine: ${cuisine}`, { 
      recipesArray: recipes,
      recipesLength: recipes?.length,
      elementalState
    });
    
    let matchedRecipes: Recipe[] = [];
    
    if (!Array.isArray(recipes) || recipes.length === 0) {
      // If no recipes provided, try to find some using the cuisine name directly
      try {
        console.log("No recipes passed as props, trying to find some with getRecipesForCuisineMatch");
        
        // First try using getRecipesForCuisineMatch which now has direct LocalRecipeService integration
        const matchedCuisineRecipes = getRecipesForCuisineMatch(
          cuisine || '', 
          [], // Pass empty array to trigger LocalRecipeService use
          8
        );
        
        console.log(`getRecipesForCuisineMatch returned ${matchedCuisineRecipes.length} recipes for ${cuisine}`);
        
        if (matchedCuisineRecipes.length > 0) {
          return matchedCuisineRecipes;
        }
        
        // If no recipes from getRecipesForCuisineMatch, try getBestRecipeMatches
        console.log("Trying getBestRecipeMatches as fallback");
        matchedRecipes = getBestRecipeMatches({
          cuisine: cuisine || '',
          season: (elementalState?.season as any) || 'all',
          mealType: elementalState?.timeOfDay || 'all'
        }, 8);
        
        console.log(`getBestRecipeMatches returned ${matchedRecipes.length} recipes:`, matchedRecipes);
      } catch (error) {
        console.error('Error finding recipes for cuisine:', error);
      }
      
      // If still no recipes, try LocalRecipeService directly
      if (matchedRecipes.length === 0) {
        console.log("Trying LocalRecipeService directly as last resort");
        
        try {
          const { LocalRecipeService } = require('../../services/LocalRecipeService');
          const localRecipes = LocalRecipeService.getRecipesByCuisine(cuisine || '');
          console.log(`LocalRecipeService returned ${localRecipes.length} recipes`);
          
          // If we have local recipes, use them
          if (localRecipes.length > 0) {
            return localRecipes.map(recipe => ({
              ...recipe,
              matchScore: 0.8, // Default high score for local recipes
              matchPercentage: 80
            }));
          }
        } catch (error) {
          console.error('Error accessing LocalRecipeService directly:', error);
        }
      } else {
        return matchedRecipes;
      }
    }
      // If recipes are provided, filter and sort them
      console.log("Filtering passed recipes:", recipes.length);
      return recipes
        .filter(recipe => {
          if (!recipe) return false;
          
          // Match main cuisine
          if (recipe.cuisine?.toLowerCase() === cuisine?.toLowerCase()) return true;
          
          // Match regional cuisine if specified
          if (recipe.regionalCuisine?.toLowerCase() === cuisine?.toLowerCase()) return true;
          
          // Try to match related cuisines
          try {
            const relatedCuisines = getRelatedCuisines(cuisine || '');
            if (relatedCuisines.some(rc => 
              recipe.cuisine?.toLowerCase() === rc?.toLowerCase() ||
              recipe.regionalCuisine?.toLowerCase() === rc?.toLowerCase()
            )) {
              return true;
            }
          } catch (error) {
            // If getRelatedCuisines fails, just continue with basic matching
          }
          
          // If no match but has high match score, include it
          return (recipe.matchScore || 0) > 0.75;
        })
        .sort((a, b) => {
          // First sort by match score
          const scoreA = a.matchScore || 0;
          const scoreB = b.matchScore || 0;
          
          if (scoreB !== scoreA) return scoreB - scoreA;
          
          // If match scores are equal, prioritize direct cuisine matches
          const directMatchA = a.cuisine?.toLowerCase() === cuisine?.toLowerCase();
          const directMatchB = b.cuisine?.toLowerCase() === cuisine?.toLowerCase();
          
          if (directMatchA && !directMatchB) return -1;
          if (!directMatchA && directMatchB) return 1;
          
          // Default to alphabetical ordering
          return (a.name || '').localeCompare(b.name || '');
        })
        .slice(0, viewAllRecipes ? undefined : 4);
    }
    
    // If we still have no recipes, create fallback message
    console.log(`No recipes found for cuisine ${cuisine} after all attempts`);
    return [];
  }, [recipes, cuisine, elementalState, viewAllRecipes]);

  if (!cuisineRecipes.length) {
    console.log(`No recipes found for cuisine ${cuisine}`);
    
    // Special case for African and American cuisines
    const isSpecialCase = cuisine?.toLowerCase() === 'african' || cuisine?.toLowerCase() === 'american';
    if (isSpecialCase) {
      console.log(`Special case for ${cuisine}, trying direct import...`);
      // Last-ditch effort to find recipes for these problematic cuisines
      try {
        // Try direct access with different capitalizations
        const importedCuisine = cuisinesMap[cuisine] || 
                              cuisinesMap[cuisine?.toLowerCase()] || 
                              cuisinesMap[cuisine?.charAt(0)?.toUpperCase() + cuisine?.slice(1)?.toLowerCase()];
                              
        if (importedCuisine && importedCuisine.dishes) {
          console.log(`Found cuisine via direct access: ${cuisine}`);
          const specialRecipes = [];
          
          // Try to extract some recipes directly
          Object.entries(importedCuisine.dishes).forEach(([mealType, seasonalDishes]) => {
            if (seasonalDishes && seasonalDishes.all && Array.isArray(seasonalDishes.all)) {
              console.log(`Found ${seasonalDishes.all.length} recipes for ${mealType}`);
              specialRecipes.push(...seasonalDishes.all.slice(0, 4));
            }
          });
          
          if (specialRecipes.length > 0) {
            console.log(`Found ${specialRecipes.length} special case recipes for ${cuisine}`);
            // Format recipes for display
            return (
              <div className="mb-8">
                <h2 className="text-2xl font-bold capitalize mb-4">{cuisine.replace('_', ' ')} Cuisine</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specialRecipes.map((recipe, i) => (
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
        console.error(`Error finding special case recipes for ${cuisine}:`, error);
      }
    }
  }

  const renderSeasonalInfo = (recipe: Recipe) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {recipe.season && (
        <span className="text-sm px-2 py-1 bg-green-50 text-green-700 rounded">
          {Array.isArray(recipe.season) ? recipe.season.join(', ') : recipe.season}
        </span>
      )}
      {recipe.mealType && (
        <span className="text-sm px-2 py-1 bg-blue-50 text-blue-700 rounded">
          {Array.isArray(recipe.mealType) ? recipe.mealType.join(', ') : recipe.mealType}
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

  // Check for regional variations to add information about cuisine relationships
  const isRegionalVariant = cuisineRecipes.some(r => r.regionalCuisine?.toLowerCase() === cuisine.toLowerCase());
  const parentCuisineName = isRegionalVariant ? cuisineRecipes.find(r => r.regionalCuisine?.toLowerCase() === cuisine.toLowerCase())?.cuisine : null;
  
  // Check if this is a parent cuisine with regional variants shown
  const hasRegionalVariants = cuisineRecipes.some(r => r.regionalCuisine && r.cuisine?.toLowerCase() === cuisine.toLowerCase());
  const regionalVariantNames = [... new Set(cuisineRecipes
    .filter(r => r.regionalCuisine && r.cuisine?.toLowerCase() === cuisine.toLowerCase())
    .map(r => r.regionalCuisine))] as string[];

  // Render a sauce card
  const renderSauceCard = (sauce: any, index: number) => {
    if (!sauce || !sauce.id) {
      return null;
    }
    
    // Create a URL-friendly sauce ID
    const cuisineKey = Object.keys(cuisinesMap).find(
      key => key.toLowerCase() === cuisine?.toLowerCase()
    );
    
    const sauceUrlId = sauce.id.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
    const sauceUrl = `/sauces/${cuisineKey?.toLowerCase() || 'unknown'}/${sauceUrlId}`;
    
    return (
      <Link 
        key={`${sauce.id}-${index}`}
        href={sauceUrl}
        className={`${styles.sauceCard} hover:shadow-md transition-shadow`}
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
    const recipeId = recipe.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
    
    return (
      <Link 
        key={`${recipe.name}-${index}`}
        href={`/recipes/${recipeId}`}
        className={`${styles.recipeCard} hover:shadow-md transition-shadow`}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{recipe.name}</h3>
          {recipe.matchScore !== undefined && (
            renderScoreBadge(recipe.matchScore, !!recipe.dualMatch)
          )}
        </div>
        
        {/* Show regional cuisine if different from main cuisine */}
        {recipe.regionalCuisine && recipe.regionalCuisine !== recipe.cuisine && (
          <div className="text-xs text-gray-500 mb-2">
            Regional style: <span className="font-medium">{recipe.regionalCuisine}</span>
          </div>
        )}
        
        <p className="text-sm text-gray-600 mb-3">{recipe.description || 'No description available'}</p>
        
        {renderSeasonalInfo(recipe)}
      </Link>
    );
  };

  // If all attempts failed, show the fallback message
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
}; 