import React from 'react';
import type { Recipe, RecipeIngredient } from '@/types/recipe';
import styles from './CuisineSection.module.css';
import { getDetailedFlavorProfile } from '@/utils/flavorProfiles';
import { getRecipesForCuisineMatch, getRelatedCuisines } from '@/data/cuisineFlavorProfiles';
import { getBestRecipeMatches } from '@/data/recipes';
import Link from 'next/link';

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
          key => key.toLowerCase() === cuisine.toLowerCase()
        );
        
        if (cuisineKey && cuisinesMap[cuisineKey].traditionalSauces) {
          // Convert traditional sauces object to array
          const saucesArray = Object.entries(cuisinesMap[cuisineKey].traditionalSauces).map(
            ([id, sauce]) => ({
              id,
              ...sauce
            })
          );
          setTraditionalSauces(saucesArray);
        } else {
          setTraditionalSauces([]);
        }
      } catch (error) {
        console.error('Error loading sauces:', error);
        setTraditionalSauces([]);
      }
    };
    
    loadSauces();
  }, [cuisine]);

  // Filter recipes for the current cuisine, prioritizing match scores
  const cuisineRecipes = React.useMemo(() => {
    if (!Array.isArray(recipes) || recipes.length === 0) {
      // If no recipes provided, try to find some using the cuisine name directly
      try {
        // Use the new getBestRecipeMatches function with cuisine and season criteria
        return getBestRecipeMatches({
          cuisine: cuisine,
          season: elementalState.season as any,
          mealType: elementalState.timeOfDay
        }, 8);
      } catch (error) {
        console.error('Error finding recipes for cuisine:', error);
        return [];
      }
    }
    
    // If recipes are provided, filter and sort them
    return recipes
      .filter(recipe => {
        // Match main cuisine
        if (recipe.cuisine?.toLowerCase() === cuisine.toLowerCase()) return true;
        
        // Match regional cuisine if specified
        if (recipe.regionalCuisine?.toLowerCase() === cuisine.toLowerCase()) return true;
        
        // Try to match related cuisines
        try {
          const relatedCuisines = getRelatedCuisines(cuisine);
          if (relatedCuisines.some(rc => 
            recipe.cuisine?.toLowerCase() === rc.toLowerCase() ||
            recipe.regionalCuisine?.toLowerCase() === rc.toLowerCase()
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
        const directMatchA = a.cuisine?.toLowerCase() === cuisine.toLowerCase();
        const directMatchB = b.cuisine?.toLowerCase() === cuisine.toLowerCase();
        
        if (directMatchA && !directMatchB) return -1;
        if (!directMatchA && directMatchB) return 1;
        
        // Default to alphabetical ordering
        return (a.name || '').localeCompare(b.name || '');
      })
      .slice(0, viewAllRecipes ? undefined : 4);
  }, [recipes, cuisine, elementalState, viewAllRecipes]);

  if (!cuisineRecipes.length) {
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
          No recipes available for this cuisine at the moment
        </div>
      </div>
    );
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
    const percentage = score * 100;
    
    // More dynamic classification with smoother transitions
    if (percentage >= 85) return 'bg-green-100 text-green-800'; // Excellent match
    if (percentage >= 70) return 'bg-green-50 text-green-700';  // Very good match
    if (percentage >= 55) return 'bg-blue-50 text-blue-700';    // Good match
    if (percentage >= 40) return 'bg-amber-50 text-amber-700';  // Fair match
    return 'bg-gray-100 text-gray-700';                         // Basic match
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
    // Create a URL-friendly sauce ID
    const cuisineKey = Object.keys(cuisinesMap).find(
      key => key.toLowerCase() === cuisine.toLowerCase()
    );
    
    const sauceUrlId = sauce.id.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
    const sauceUrl = `/sauces/${cuisineKey?.toLowerCase()}/${sauceUrlId}`;
    
    return (
      <Link 
        key={`${sauce.id}-${index}`}
        href={sauceUrl}
        className={`${styles.sauceCard} hover:shadow-md transition-shadow`}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{sauce.name}</h3>
          {sauce.base && (
            <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded">
              {sauce.base} base
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{sauce.description}</p>
        
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
            <span className={`text-sm ${getMatchScoreClass(recipe.matchScore)} px-2 py-1 rounded flex items-center gap-1`}>
              {recipe.dualMatch && <span className="h-2 w-2 bg-yellow-400 rounded-full" title="Matches multiple criteria"></span>}
              <span title="Match score based on cuisine, season, and elemental balance">
                {Math.round(recipe.matchScore * 100)}% match
              </span>
            </span>
          )}
        </div>
        
        {/* Show regional cuisine if different from main cuisine */}
        {recipe.regionalCuisine && recipe.regionalCuisine !== recipe.cuisine && (
          <div className="text-xs text-gray-500 mb-2">
            Regional style: <span className="font-medium">{recipe.regionalCuisine}</span>
          </div>
        )}
        
        <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>
        
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
          {cuisineRecipes.length} recipes available
        </span>
      </div>
      
      {/* Cuisine relationship information */}
      {isRegionalVariant && parentCuisineName && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
          <span className="font-medium">{cuisine}</span> is a regional variation of <span className="font-medium">{parentCuisineName}</span> cuisine
        </div>
      )}
      
      {hasRegionalVariants && regionalVariantNames.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg text-green-700 text-sm">
          <span className="font-medium">Regional variations shown:</span> {regionalVariantNames.join(', ')}
        </div>
      )}
      
      {/* Traditional Sauces Section */}
      {traditionalSauces.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Traditional Sauces</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {traditionalSauces.map(renderSauceCard)}
          </div>
        </div>
      )}
      
      {/* Recipes Section */}
      <h3 className="text-xl font-semibold mb-4">Signature Recipes</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cuisineRecipes.map(renderRecipeCard)}
      </div>
      
      {/* View more/less recipes button */}
      {recipes.length > 4 && (
        <button
          onClick={() => setViewAllRecipes(!viewAllRecipes)}
          className="mt-4 mx-auto block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {viewAllRecipes ? 'Show Fewer Recipes' : 'View All Recipes'}
        </button>
      )}
    </div>
  );
}; 