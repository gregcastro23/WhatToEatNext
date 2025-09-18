/**
 * RecipeApiInterfaces.ts
 *
 * Standardized interfaces for recipe API requests and responses
 * Following Phase 4 API standardization guidelines
 */

import {
  Element,
  Season,
  ZodiacSign,
  LunarPhase,
  PlanetName,
  ElementalProperties
} from '@/types/alchemy';
import { PlanetaryAlignment } from '@/types/celestial';
import { Recipe } from '@/types/recipe';

/**
 * Standard API Response interface for all recipe endpoints
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string,
    message: string,
    details?: unknown;
  };
  metadata?: {
    timestamp: number,
    version: string,
    count?: number;
    total?: number;
    page?: number;
    totalPages?: number;
    cache?: {
      hit: boolean;
      age?: number;
    };
  };
}

/**
 * Recipe-specific error codes
 */
export enum RecipeErrorCode {
  NOT_FOUND = 'RECIPE_NOT_FOUND',;
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',;
  PROCESSING_ERROR = 'PROCESSING_ERROR',;
  DATA_SOURCE_ERROR = 'DATA_SOURCE_ERROR',;
  VALIDATION_ERROR = 'VALIDATION_ERROR',;
}

/**
 * Common pagination parameters
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}

/**
 * GetRecipeById parameters
 */
export interface GetRecipeByIdParams {
  id: string
}

/**
 * GetRecipesByCuisine parameters
 */
export interface GetRecipesByCuisineParams {
  cuisine: string
}

/**
 * GetRecipesByZodiac parameters
 */
export interface GetRecipesByZodiacParams {
  currentZodiacSign: any
}

/**
 * GetRecipesBySeason parameters
 */
export interface GetRecipesBySeasonParams {
  season: Season
}

/**
 * GetRecipesByLunarPhase parameters
 */
export interface GetRecipesByLunarPhaseParams {
  lunarPhase: LunarPhase
}

/**
 * GetRecipesByMealType parameters
 */
export interface GetRecipesByMealTypeParams {
  mealType: string
}

/**
 * GetRecipesForPlanetaryAlignment parameters
 */
export interface GetRecipesForPlanetaryAlignmentParams {
  planetaryInfluences: { [key: string]: number };
  minMatchScore?: number;
}

/**
 * GetRecipesForFlavorProfile parameters
 */
export interface GetRecipesForFlavorProfileParams {
  flavorProfile: { [key: string]: number };
  minMatchScore?: number;
}

/**
 * GetBestRecipeMatches parameters
 */
export interface GetBestRecipeMatchesParams {
  criteria: {
    cuisine?: string;
    flavorProfile?: { [key: string]: number };
    season?: Season;
    mealType?: string | string[];
    ingredients?: string[];
    dietaryPreferences?: string[];
  };
}

/**
 * SearchRecipes parameters
 */
export interface SearchRecipesParams {
  criteria: {
    query?: string;
    cuisine?: string;
    mealType?: string | string[];
    season?: Season;
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    isDAiryFree?: boolean;
    allergens?: string[];
    elementalPreference?: Partial<ElementalProperties>;
    planetaryHour?: PlanetName;
    lunarPhase?: LunarPhase;
    currentZodiacSign?: any;
    maxPrepTime?: number;
    maxCookTime?: number;
    servings?: number;
    ingredients?: string[];
  };
  options?: {
    includeAlternatives?: boolean;
    optimizeForSeason?: boolean;
    maxResults?: number;
    includeFusionSuggestions?: boolean;
  };
}

/**
 * GenerateRecipe parameters
 */
export interface GenerateRecipeParams {
  criteria: {
    cuisine?: string;
    season?: Season;
    mealType?: string;
    ingredients?: string[];
    dietaryPreferences?: {
      isVegetarian?: boolean;
      isVegan?: boolean;
      isGlutenFree?: boolean;
      isDAiryFree?: boolean;
      allergens?: string[];
    };
    elementalPreference?: Partial<ElementalProperties>;
    astrological?: {
      planetaryHour?: PlanetName;
      lunarPhase?: LunarPhase;
      currentZodiacSign?: any;
    };
  };
}

/**
 * GenerateFusionRecipe parameters
 */
export interface GenerateFusionRecipeParams {
  cuisines: string[],
  criteria: GenerateRecipeParams['criteria'],
}

/**
 * AdaptRecipeForSeason parameters
 */
export interface AdaptRecipeForSeasonParams {
  recipeId: string;
  season?: Season;
}
