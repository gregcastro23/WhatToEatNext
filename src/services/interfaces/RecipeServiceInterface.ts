/**
 * RecipeServiceInterface.ts
 * 
 * A consolidated interface for all recipe-related operations in the WhatToEatNext application.
 * This interface combines functionality from:
 * - LocalRecipeService
 * - UnifiedRecipeService
 * - RecipeElementalService
 * 
 * The goal is to create a single, consistent API for all recipe operations.
 * Updated for Phase 4 API standardization.
 */

import type { ElementalProperties, Season, LunarPhase } from "@/types/alchemy";
import type { Recipe, ScoredRecipe } from "@/types/recipe";
import type { PlanetName, ZodiacSign } from "@/types/celestial";

import { _Element } from "@/types/alchemy";
import { PlanetaryAlignment } from "@/types/celestial";

import { 
  ApiResponse,
  GetRecipeByIdParams,
  GetRecipesByCuisineParams,
  GetRecipesByZodiacParams,
  GetRecipesBySeasonParams,
  GetRecipesByLunarPhaseParams,
  GetRecipesByMealTypeParams,
  GetRecipesForPlanetaryAlignmentParams,
  GetRecipesForFlavorProfileParams,
  GetBestRecipeMatchesParams,
  SearchRecipesParams,
  GenerateRecipeParams,
  GenerateFusionRecipeParams,
  AdaptRecipeForSeasonParams
} from './RecipeApiInterfaces';

/**
 * Criteria for searching and filtering recipes
 */
export interface RecipeSearchCriteria {
  // Basic search
  query?: string;
  cuisine?: string;
  mealType?: string | string[];
  season?: Season;
  
  // Dietary filters
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDAiryFree?: boolean;
  allergens?: string[];
  
  // Elemental and alchemical filters
  elementalPreference?: Partial<ElementalProperties>;
  
  // Astrological filters
  planetaryHour?: PlanetName;
  lunarPhase?: LunarPhase;
  currentZodiacSign?: ZodiacSign;
  
  // Other practical filters
  maxPrepTime?: number;
  maxCookTime?: number;
  servings?: number;
  ingredients?: string[];
}

/**
 * Options for recipe recommendations and generation
 */
export interface RecipeRecommendationOptions {
  includeAlternatives?: boolean;
  optimizeForSeason?: boolean;
  maxResults?: number;
  includeFusionSuggestions?: boolean;
}

/**
 * Consolidated Recipe Service Interface with standardized API responses
 */
export interface RecipeServiceInterface {
  /**
   * Get all available recipes
   * @returns Promise resolving to an ApiResponse containing an array of all recipes
   */
  getAllRecipes(): Promise<ApiResponse<Recipe[]>>;
  
  /**
   * Search for recipes based on criteria
   * @param params Search parameters including criteria and pagination options
   * @returns Promise resolving to an ApiResponse containing an array of recipes matching the criteria
   */
  searchRecipes(
    params: SearchRecipesParams
  ): Promise<ApiResponse<Recipe[]>>;
  
  /**
   * Get recipes by cuisine
   * @param params Parameters including cuisine name and pagination options
   * @returns Promise resolving to an ApiResponse containing an array of recipes for that cuisine
   */
  getRecipesByCuisine(
    params: GetRecipesByCuisineParams
  ): Promise<ApiResponse<Recipe[]>>;
  
  /**
   * Get recipes by zodiac sign
   * @param params Parameters including zodiac sign and pagination options
   * @returns Promise resolving to an ApiResponse containing an array of recipes for that zodiac sign
   */
  getRecipesByZodiac(
    params: GetRecipesByZodiacParams
  ): Promise<ApiResponse<Recipe[]>>;
  
  /**
   * Get recipes by season
   * @param params Parameters including season and pagination options
   * @returns Promise resolving to an ApiResponse containing an array of recipes for that season
   */
  getRecipesBySeason(
    params: GetRecipesBySeasonParams
  ): Promise<ApiResponse<Recipe[]>>;
  
  /**
   * Get recipes by lunar phase
   * @param params Parameters including lunar phase and pagination options
   * @returns Promise resolving to an ApiResponse containing an array of recipes for that lunar phase
   */
  getRecipesByLunarPhase(
    params: GetRecipesByLunarPhaseParams
  ): Promise<ApiResponse<Recipe[]>>;
  
  /**
   * Get recipes by meal type
   * @param params Parameters including meal type and pagination options
   * @returns Promise resolving to an ApiResponse containing an array of recipes for that meal type
   */
  getRecipesByMealType(
    params: GetRecipesByMealTypeParams
  ): Promise<ApiResponse<Recipe[]>>;
  
  /**
   * Get recipes that match current planetary alignments
   * @param params Parameters including planetary influences, minimum match score, and pagination options
   * @returns Promise resolving to an ApiResponse containing an array of recipes matching the planetary alignments
   */
  getRecipesForPlanetaryAlignment(
    params: GetRecipesForPlanetaryAlignmentParams
  ): Promise<ApiResponse<Recipe[]>>;
  
  /**
   * Get recipes that match a given flavor profile
   * @param params Parameters including flavor profile, minimum match score, and pagination options
   * @returns Promise resolving to an ApiResponse containing an array of recipes matching the flavor profile
   */
  getRecipesForFlavorProfile(
    params: GetRecipesForFlavorProfileParams
  ): Promise<ApiResponse<Recipe[]>>;
  
  /**
   * Get best recipe matches based on multiple criteria
   * @param params Parameters including criteria and pagination options
   * @returns Promise resolving to an ApiResponse containing an array of scored recipes
   */
  getBestRecipeMatches(
    params: GetBestRecipeMatchesParams
  ): Promise<ApiResponse<ScoredRecipe[]>>;
  
  /**
   * Get a recipe by its ID
   * @param params Parameters including the recipe ID
   * @returns Promise resolving to an ApiResponse containing the recipe or an error
   */
  getRecipeById(
    params: GetRecipeByIdParams
  ): Promise<ApiResponse<Recipe>>;
  
  /**
   * Generate a recipe based on criteria
   * @param params Parameters including recipe generation criteria
   * @returns Promise resolving to an ApiResponse containing a generated recipe
   */
  generateRecipe(
    params: GenerateRecipeParams
  ): Promise<ApiResponse<Recipe>>;
  
  /**
   * Generate a fusion recipe combining multiple cuisines
   * @param params Parameters including cuisines to fuse and criteria
   * @returns Promise resolving to an ApiResponse containing a fusion recipe
   */
  generateFusionRecipe(
    params: GenerateFusionRecipeParams
  ): Promise<ApiResponse<Recipe>>;
  
  /**
   * Adapt a recipe for the current season
   * @param params Parameters including the recipe ID and target season
   * @returns Promise resolving to an ApiResponse containing the adapted recipe
   */
  adaptRecipeForSeason(
    params: AdaptRecipeForSeasonParams
  ): Promise<ApiResponse<Recipe>>;
  
  /**
   * Calculate the elemental properties of a recipe
   * @param recipe The recipe to analyze
   * @returns The elemental properties of the recipe
   */
  calculateElementalProperties(recipe: Partial<Recipe>): ElementalProperties;
  
  /**
   * Get the dominant element of a recipe
   * @param recipe The recipe to analyze
   * @returns The dominant element and its value
   */
  getDominantElement(recipe: Recipe): { element: keyof ElementalProperties; value: number };
  
  /**
   * Calculate the similarity between two recipes based on their elemental properties
   * @param recipe1 First recipe
   * @param recipe2 Second recipe
   * @returns Similarity score (0-1)
   */
  calculateSimilarity(recipe1: Recipe, recipe2: Recipe): number;
  
  /**
   * Clear the recipe cache
   */
  clearCache(): void;
} 