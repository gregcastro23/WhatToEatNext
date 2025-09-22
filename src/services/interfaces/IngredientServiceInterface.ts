import type {
  ElementalProperties,
  IngredientMapping,
  NutritionalProfile,
  ThermodynamicMetrics,
  Season,
  PlanetName,
  ZodiacSign
} from '@/types/alchemy',
import {Recipe, _RecipeIngredient} from '@/types/unified';

/**
 * IngredientServiceInterface.ts
 *
 * A consolidated interface for all ingredient-related operations in the WhatToEatNext application.
 * This interface combines functionality from:
 * - IngredientService
 * - IngredientFilterService
 * - Unified Ingredient data system
 *
 * The goal is to create a single, consistent API for all ingredient operations.
 */

import type { UnifiedIngredient } from '../../data/unified/unifiedTypes';

/**
 * Dietary filtering options
 */
export interface DietaryFilter {
  isVegetarian?: boolean,
  isVegan?: boolean,
  isGlutenFree?: boolean,
  isDAiryFree?: boolean,
  isNutFree?: boolean,
  isLowSodium?: boolean,
  isLowSugar?: boolean
}

/**
 * Nutritional filtering criteria
 */
export interface NutritionalFilter {
  minProtein?: number,
  maxProtein?: number,
  minFiber?: number,
  maxFiber?: number,
  minCalories?: number,
  maxCalories?: number,
  vitamins?: string[],
  minerals?: string[],
  highProtein?: boolean,
  lowCarb?: boolean,
  lowFat?: boolean
}

/**
 * Elemental filtering criteria
 */
export interface ElementalFilter {
  minfire?: number,
  maxfire?: number,
  minwater?: number,
  maxwater?: number,
  minearth?: number,
  maxearth?: number,
  minAir?: number,
  maxAir?: number,
  dominantElement?: string
}

/**
 * Combined filter interface for ingredients
 */
export interface IngredientFilter {
  nutritional?: NutritionalFilter,
  elemental?: ElementalFilter,
  dietary?: DietaryFilter,
  season?: string[] | Season[],
  categories?: string[],
  searchQuery?: string,
  excludeIngredients?: string[],
  currentZodiacSign?: any,
  planetaryInfluence?: PlanetName
}

/**
 * Options for ingredient recommendations
 */
export interface IngredientRecommendationOptions {
  /** Maximum number of ingredients to return */
  limit?: number,

  /** Categories to include in recommendations */
  categories?: string[],

  /** Whether to include thermodynamic metrics */
  includeThermodynamics?: boolean,

  /** Dietary preferences to consider */
  dietaryPreferences?: string[],

  /** Specific ingredients to exclude */
  excludeIngredients?: string[],

  /** Current season (optional) */
  currentSeason?: string,

  /** Zodiac sign to emphasize */
  currentZodiacSign?: string,

  /** Modality preference */
  modalityPreference?: string
}

/**
 * Consolidated Ingredient Service Interface
 */
export interface IngredientServiceInterface {
  /**
   * Get all available ingredients
   * @returns An object of all ingredients organized by category
   */
  getAllIngredients(): Record<string, UnifiedIngredient[]>,

  /**
   * Get all ingredients as a flat array
   * @returns An array of all ingredients
   */
  getAllIngredientsFlat(): UnifiedIngredient[],

  /**
   * Get ingredient by name
   * @param name The ingredient name (case-insensitive)
   * @returns The ingredient or undefined if not found
   */
  getIngredientByName(name: string): UnifiedIngredient | undefined,

  /**
   * Get ingredients by category
   * @param category The category name
   * @returns An array of ingredients in that category
   */
  getIngredientsByCategory(category: string): UnifiedIngredient[],

  /**
   * Get ingredients by subcategory
   * @param subcategory The subcategory name
   * @returns An array of ingredients in that subcategory
   */
  getIngredientsBySubcategory(subcategory: string): UnifiedIngredient[]

  /**
   * Filter ingredients based on multiple criteria
   * @param filter The filter criteria
   * @returns An object of filtered ingredients organized by category
   */
  filterIngredients(filter: IngredientFilter): Record<string, UnifiedIngredient[]>,

  /**
   * Get ingredients by elemental properties
   * @param elementalFilter The elemental filter criteria
   * @returns An array of ingredients matching the elemental criteria
   */
  getIngredientsByElement(elementalFilter: ElementalFilter): UnifiedIngredient[]

  /**
   * Get ingredients by flavor profile
   * @param flavorProfile The flavor profile to match
   * @param minMatchScore Minimum match score (0-1)
   * @returns An array of ingredients matching the flavor profile
   */
  getIngredientsByFlavor(
    flavorProfile: { [key: string]: number },
    minMatchScore?: number,
  ): UnifiedIngredient[],

  /**
   * Get ingredients by season
   * @param season The season(s)
   * @returns An array of seasonal ingredients
   */
  getIngredientsBySeason(season: Season | Season[]): UnifiedIngredient[],

  /**
   * Get ingredients by planetary influence
   * @param planet The planet name
   * @returns An array of ingredients ruled by that planet
   */
  getIngredientsByPlanet(planet: PlanetName): UnifiedIngredient[],

  /**
   * Get ingredients by zodiac sign
   * @param sign The zodiac sign
   * @returns An array of ingredients associated with that sign
   */
  getIngredientsByZodiacSign(sign: any): UnifiedIngredient[]

  /**
   * Get recommended ingredients based on the current alchemical state
   * @param elementalState The current elemental properties
   * @param options Recommendation options
   * @returns An array of recommended ingredients with scores
   */
  getRecommendedIngredients(
    elementalState: ElementalProperties,
    options?: IngredientRecommendationOptions,
  ): UnifiedIngredient[]

  /**
   * Calculate the compatibility between two ingredients
   * @param ingredient1 First ingredient (name or object)
   * @param ingredient2 Second ingredient (name or object)
   * @returns Compatibility score (0-1) and compatibility aspects
   */
  calculateIngredientCompatibility(
    ingredient1: string | UnifiedIngredient,
    ingredient2: string | UnifiedIngredient,
  ): {
    score: number,
    elementalCompatibility: number,
    flavorCompatibility: number,
    seasonalCompatibility: number,
    energeticCompatibility: number
  },

  /**
   * Get alternative ingredients that can substitute for a given ingredient
   * @param ingredientName The ingredient to find alternatives for
   * @param options Options for alternative search
   * @returns An array of alternative ingredients with similarity scores
   */
  suggestAlternativeIngredients(
    ingredientName: string,
    options?: {
      category?: string
      similarityThreshold?: number
      maxResults?: number
    },
  ): Array<{ ingredient: UnifiedIngredient, similarityScore: number }>,

  /**
   * Analyze the ingredient combinations in a recipe
   * @param recipe The recipe to analyze
   * @returns Analysis of ingredient combinations
   */
  analyzeRecipeIngredients(recipe: Recipe): {
    overallHarmony: number,
    flavorProfile: { [key: string]: number },
    strongPairings: Array<{ ingredients: string[] score: number }>,
    weakPairings: Array<{ ingredients: string[] score: number }>,
  },

  /**
   * Enhance an ingredient with elemental properties
   * @param ingredient The ingredient to enhance
   * @returns The enhanced ingredient with complete elemental properties
   */
  enhanceIngredientWithElementalProperties(
    ingredient: Partial<UnifiedIngredient>,
  ): UnifiedIngredient,

  /**
   * Get ingredients with high Kalchm values
   * @param threshold Minimum Kalchm value
   * @returns Array of ingredients with high Kalchm values
   */
  getHighKalchmIngredients(threshold?: number): UnifiedIngredient[]

  /**
   * Find complementary ingredients for a given ingredient
   * @param ingredient The base ingredient
   * @param maxResults Maximum number of results
   * @returns Array of complementary ingredients
   */
  findComplementaryIngredients(
    ingredient: UnifiedIngredient | string,
    maxResults?: number,
  ): UnifiedIngredient[],

  /**
   * Calculate the elemental properties of an ingredient
   * @param ingredient The ingredient to analyze
   * @returns The elemental properties
   */
  calculateElementalProperties(ingredient: Partial<UnifiedIngredient>): ElementalProperties,

  /**
   * Calculate the thermodynamic metrics of an ingredient
   * @param ingredient The ingredient to analyze
   * @returns The thermodynamic metrics
   */
  calculateThermodynamicMetrics(ingredient: UnifiedIngredient): ThermodynamicMetrics,

  /**
   * Clear the ingredient cache
   */
  clearCache(): void
}