// Phase 10: Calculation Type Interfaces
interface _CalculationData {
  value: number;
  weight?: number;
  score?: number;
}

interface _ScoredItem {
  score: number;
  [key: string]: unknown;
}

import type { ElementalProperties as ElementalData } from '@/types/alchemy';

interface _CuisineData {
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

interface _NutrientData {
  nutrient?: { name?: string };
  nutrientName?: string;
  name?: string;
  vitaminCount?: number;
  data?: unknown;
  [key: string]: unknown;
}

interface _MatchingResult {
  score: number;
  elements: ElementalData;
  recipe?: unknown;
  [key: string]: unknown;
}

('use client');

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { useServices } from '@/hooks/useServices';
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
  elementalState: {
    Fire: number;
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
  elementalState,
}: CuisineSectionProps) {
  // Replace direct imports with services
  const { isLoading: servicesLoading, error: servicesError, recipeService } = useServices();

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

        // ✅ Pattern MM-1: getRecipesByCuisine expects string parameter, not object
        if (cuisine) {
          const response = await recipeService.getRecipesByCuisine(cuisine);

          // Apply Pattern PP-3: Safe response handling for array or object response
          if (Array.isArray(response)) {
            setCuisineRecipesFromService(response);
          } else {
            const responseData = response as Record<string, unknown>;
            if (responseData.success && responseData.data) {
              setCuisineRecipesFromService(responseData.data as any[]);
            } else {
              setCuisineRecipesFromService([]);
            }
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
      void loadCuisineData();
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
        const cuisineStringMatch = String(cuisine || '');
        const cuisineLowerMatch = cuisineStringMatch.toLowerCase();

        // Direct cuisine match
        if (recipe.cuisine?.toLowerCase() === cuisineLowerMatch) return true;

        // Regional cuisine match
        if ((recipe.regionalCuisine as string).toLowerCase() === cuisineLowerMatch) return true;

        // High match score
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
        const cuisineStringSort = String(cuisine || '');
        const cuisineLowerSort = cuisineStringSort.toLowerCase();

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
  const isRegionalVariant = (cuisineRecipes || []).some(
    r => (r.regionalCuisine as string).toLowerCase() === cuisine.toLowerCase(),
  );
  const parentCuisineName = isRegionalVariant
    ? cuisineRecipes.find(
        r => (r.regionalCuisine as string).toLowerCase() === cuisine.toLowerCase(),
      )?.cuisine
    : null;

  // Check if this is a parent cuisine with regional variants shown
  const hasRegionalVariants = (cuisineRecipes || []).some(
    r => r.regionalCuisine && r.cuisine?.toLowerCase() === cuisine.toLowerCase(),
  );
  const regionalVariantNames = [
    ...new Set(
      cuisineRecipes
        .filter(r => r.regionalCuisine && r.cuisine?.toLowerCase() === cuisine.toLowerCase())
        .map(r => r.regionalCuisine),
    ),
  ] as string[];

  const renderSeasonalInfo = (recipe: Recipe) => (
    <div className='mt-2 flex flex-wrap gap-2'>
      {Boolean(recipe.currentSeason) && (
        <span className='rounded bg-green-50 px-2 py-1 text-sm text-green-700'>
          {Array.isArray(recipe.currentSeason)
            ? recipe.currentSeason.join(', ')
            : (recipe.currentSeason as string)}
        </span>
      )}
      {recipe.mealType && (
        <span className='rounded bg-blue-50 px-2 py-1 text-sm text-blue-700'>
          {Array.isArray(recipe.mealType) ? recipe.mealType.join(', ') : recipe.mealType}
        </span>
      )}
      {recipe.timeToMake && (
        <span className='rounded bg-purple-50 px-2 py-1 text-sm text-purple-700'>
          {recipe.timeToMake} {typeof recipe.timeToMake === 'number' ? 'min' : ''}
        </span>
      )}
    </div>
  );

  // Function to get match score CSS class based on the score
  const getMatchScoreClass = (score: number) => {
    // More dynamic classification with smoother transitions and more differentiation
    if (score >= 0.95)
      return 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold shadow-md';
    if (score >= 0.9)
      return 'bg-gradient-to-r from-green-500 to-green-400 text-white font-bold shadow-sm';
    if (score >= 0.85)
      return 'bg-gradient-to-r from-green-400 to-green-300 text-green-900 font-bold shadow-sm';
    if (score >= 0.8) return 'bg-green-200 text-green-800 font-semibold';
    if (score >= 0.75) return 'bg-green-100 text-green-700 font-medium';
    if (score >= 0.7) return 'bg-yellow-100 text-yellow-700';
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
    } else if (score >= 0.8) {
      stars = '★';
      tooltipText = 'Very good match for your preferences';
    }

    if (hasDualMatch) {
      tooltipText = `${tooltipText} (Matches multiple criteria)`;
    }

    return (
      <span
        className={`text-sm ${getMatchScoreClass(score)} flex items-center gap-1 rounded px-2 py-1 transition-all duration-300 hover:scale-105`}
        title={tooltipText}
      >
        {hasDualMatch && <span className='h-2 w-2 rounded-full bg-yellow-400'></span>}
        <span>{enhancedScore}% match</span>
        {stars && <span className='ml-1'>{stars}</span>}
      </span>
    );
  };

  // Render a sauce card
  const renderSauceCard = (sauce: SauceInfo, index: number) => {
    if (!sauce || !sauce.id) {
      return null;
    }

    // Create a URL-friendly sauce ID
    const sauceUrlId = sauce.id
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]/g, '');
    const sauceUrl = `/sauces/${cuisine.toLowerCase() || 'unknown'}/${sauceUrlId}`;

    return (
      <Link
        key={`${sauce.id}-${index}`}
        href={sauceUrl}
        className='rounded-lg border bg-white p-4 transition-shadow hover:shadow-md'
      >
        <div className='mb-2 flex items-start justify-between'>
          <h3 className='text-lg font-semibold'>{sauce.name || 'Unnamed sauce'}</h3>
          {sauce.base && (
            <span className='rounded bg-amber-50 px-2 py-1 text-xs text-amber-700'>
              {sauce.base} base
            </span>
          )}
        </div>

        <p className='mb-3 text-sm text-gray-600'>
          {sauce.description || 'No description available'}
        </p>

        {/* Seasonal info if available */}
        {sauce.seasonality && (
          <span className='mr-2 rounded bg-green-50 px-2 py-1 text-xs text-green-700'>
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
    const recipeId = recipe.name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]/g, '');

    return (
      <Link
        key={`${recipe.name}-${index}`}
        href={`/recipes/${recipeId}`}
        className='rounded-lg border bg-white p-4 transition-shadow hover:shadow-md'
      >
        <div className='mb-2 flex items-start justify-between'>
          <h3 className='text-lg font-semibold'>{recipe.name}</h3>
          {recipe.matchScore !== undefined &&
            renderScoreBadge(Number(recipe.matchScore) || 0, !!recipe.dualMatch)}
        </div>

        {/* Show regional cuisine if different from main cuisine */}
        {Boolean(recipe.regionalCuisine && recipe.regionalCuisine !== recipe.cuisine) && (
          <div className='mb-2 text-xs text-gray-500'>
            Regional style: <span className='font-medium'>{recipe.regionalCuisine as string}</span>
          </div>
        )}

        <p className='mb-3 text-sm text-gray-600'>
          {recipe.description || 'No description available'}
        </p>

        {renderSeasonalInfo(recipe)}
      </Link>
    );
  };

  // Handle loading state
  if (servicesLoading || isLoading) {
    return (
      <div className='mb-8'>
        <h2 className='mb-4 text-2xl font-bold capitalize'>{cuisine.replace('_', ' ')} Cuisine</h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className='animate-pulse rounded-lg border p-4'>
              <div className='mb-4 h-6 w-3/4 rounded bg-gray-200'></div>
              <div className='mb-2 h-4 w-1/2 rounded bg-gray-200'></div>
              <div className='h-4 w-1/4 rounded bg-gray-200'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle error state
  if (servicesError || error) {
    return (
      <div className='mb-8'>
        <h2 className='mb-4 text-2xl font-bold capitalize'>{cuisine.replace('_', ' ')} Cuisine</h2>
        <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-red-700'>
          <p>Error loading cuisine data: {(servicesError || error)?.message}</p>
          <button
            className='mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700'
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
      <div className='mb-8'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-2xl font-bold capitalize'>{cuisine.replace('_', ' ')} Cuisine</h2>
          <span className='text-sm text-gray-600'>No recipes available</span>
        </div>
        <div className='rounded-lg bg-gray-50 p-4 text-center text-gray-500'>
          <p>No recipes available for this cuisine at the moment</p>
          <p className='mt-2 text-sm'>Please try another cuisine or check back later</p>
          <button
            className='mt-4 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600'
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
    <div className='mb-8'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-2xl font-bold capitalize'>{cuisine.replace('_', ' ')} Cuisine</h2>

        {/* Display number of recipes */}
        {(cuisineRecipes || []).length > 0 && (
          <span className='text-sm text-gray-600'>
            {(cuisineRecipes || []).length} recipe{(cuisineRecipes || []).length !== 1 ? 's' : ''}{' '}
            available
          </span>
        )}
      </div>

      {/* Regional variant info */}
      {isRegionalVariant && parentCuisineName && (
        <div className='mb-4 rounded-lg bg-blue-50 p-3 text-blue-800'>
          <p>
            <span className='font-medium'>{cuisine}</span> is a regional variant of{' '}
            <Link
              href={`/cuisines/${parentCuisineName.toLowerCase()}`}
              className='underline hover:text-blue-600'
            >
              {parentCuisineName} cuisine
            </Link>
          </p>
        </div>
      )}

      {/* Parent cuisine with regional variants */}
      {hasRegionalVariants && (regionalVariantNames || []).length > 0 && (
        <div className='mb-4 rounded-lg bg-blue-50 p-3 text-blue-800'>
          <p className='mb-2'>
            <span className='font-medium'>{cuisine}</span> has regional variants including:
          </p>
          <ul className='flex flex-wrap gap-2'>
            {(regionalVariantNames || []).map((variant, index) => (
              <li key={index}>
                <Link
                  href={`/cuisines/${variant.toLowerCase()}`}
                  className='rounded-full bg-blue-100 px-3 py-1 transition-colors hover:bg-blue-200'
                >
                  {variant}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recipe Grid */}
      <div className='mb-6'>
        <div className='mb-3 flex items-center justify-between'>
          <h3 className='text-xl font-semibold'>Recipes</h3>
          {(cuisineRecipes || []).length > 4 && (
            <button
              onClick={() => setViewAllRecipes(!viewAllRecipes)}
              className='text-sm text-blue-600 hover:text-blue-800'
            >
              {viewAllRecipes ? 'Show less' : 'View all'}
            </button>
          )}
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {(cuisineRecipes || []).map((recipe, index) => renderRecipeCard(recipe, index))}
        </div>
      </div>

      {/* Traditional Sauces Section */}
      {(traditionalSauces || []).length > 0 && (
        <div>
          <h3 className='mb-3 text-xl font-semibold'>Traditional Sauces</h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {(traditionalSauces || []).map((sauce, index) => renderSauceCard(sauce, index))}
          </div>
        </div>
      )}
    </div>
  );
}
