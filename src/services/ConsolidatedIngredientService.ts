// Phase 10: Calculation Type Interfaces

interface ScoredItem {
  score: number,
  [key: string]: unknown
}

// Removed unused interface: ElementalData

/**
 * ConsolidatedIngredientService.ts
 *
 * A consolidated implementation of the IngredientServiceInterface that combines
 * functionality from IngredientService, IngredientFilterService, and the unified
 * ingredient data system.
 *
 * This service serves as the primary entry point for all ingredient-related operations
 * in the WhatToEatNext application.
 */

import { unifiedIngredients } from '@/data/unified/ingredients';
import { log } from '@/services/LoggingService';
import type {
  BasicThermodynamicProperties,
  ElementalProperties,
  PlanetName,
  ThermodynamicMetrics
} from '@/types/alchemy';
import type { Season } from '@/types/seasons';
import { Ingredient } from '@/types/unified';

import type { UnifiedIngredient } from '../data/unified/unifiedTypes';
import type { Recipe } from '../types/unified';
import type { ZodiacSign } from '../types/zodiac';

// Define ErrorWithMessage for error handling
interface ErrorWithMessage {
  message: string
}
// Removed unused import: cache
import { isNonEmptyArray, safeSome } from '../utils/common/arrayUtils';
import {
  calculateElementalCompatibility,
  createElementalProperties
} from '../utils/elemental/elementalUtils';
// Replaced unused logger with enterprise logging service

import type {
  ElementalFilter,
  IngredientFilter,
  IngredientRecommendationOptions,
  IngredientServiceInterface
} from './interfaces/IngredientServiceInterface';

// Define placeholder types and classes for missing dependencies
enum ErrorType {
  DATA = 'DATA',;
  VALIDATION = 'VALIDATION',,;
  NETWORK = 'NETWORK',,;
}

enum ErrorSeverity {
  ERROR = 'ERROR',;
  WARNING = 'WARNING',,;
  INFO = 'INFO',,;
}

// Placeholder error handler
const errorHandler = {
  logError: (error: Error | ErrorWithMessage, context: unknown) => {
    console.error('Error:', error, 'Context:', context)
  }
};

// Placeholder services that need to be properly implemented
class IngredientService {
  static getInstance() {
    return new IngredientService()
  }
}

class IngredientFilterService {
  static getInstance() {
    return new IngredientFilterService()
  }
}

/**
 * Implementation of the IngredientServiceInterface that delegates to specialized services
 * and consolidates their functionality into a single, consistent API.
 */
export class ConsolidatedIngredientService implements IngredientServiceInterface {
  validateIngredient(ingredient: Ingredient | UnifiedIngredient): boolean {
    return typeof ingredient === 'object' && ingredient !== null;
  }

  private static instance: ConsolidatedIngredientService;
  private ingredientCache: Map<string, UnifiedIngredient[]> = new Map();
  private legacyIngredientService: IngredientService;
  private legacyFilterService: IngredientFilterService;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.legacyIngredientService = IngredientService.getInstance();
    this.legacyFilterService = IngredientFilterService.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ConsolidatedIngredientService {
    if (!ConsolidatedIngredientService.instance) {
      ConsolidatedIngredientService.instance = new ConsolidatedIngredientService();
    }
    return ConsolidatedIngredientService.instance;
  }

  /**
   * Get all available ingredients
   */
  getAllIngredients(): Record<string, UnifiedIngredient[]> {
    try {
      const result: Record<string, UnifiedIngredient[]> = {};

      // Group ingredients by category
      Object.values(unifiedIngredients || {}).forEach(ingredient => {
        const category = ingredient.category;

        // Initialize category array if not exists
        result[category] = result[category] || [];

        result[category].push(ingredient)
      });

      log.info(
        `[ConsolidatedIngredientService] Retrieved ${Object.keys(result).length} ingredient categories`,
      );
      return result;
    } catch (error) {
      errorHandler.logError(error as ErrorWithMessage, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getAllIngredients' }
      });
      return {};
    }
  }

  /**
   * Get all ingredients as a flat array
   */
  getAllIngredientsFlat(): UnifiedIngredient[] {
    try {
      return Object.values(unifiedIngredients);
    } catch (error) {
      errorHandler.logError(error as ErrorWithMessage, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getAllIngredientsFlat' }
      });
      return [];
    }
  }

  /**
   * Get ingredient by name
   */
  getIngredientByName(name: string): UnifiedIngredient | undefined {
    try {
      // Try direct access first
      if (unifiedIngredients[name]) {
        return unifiedIngredients[name]
      }

      // Try case-insensitive search
      const normalizedName = name.toLowerCase();
      return Object.values(unifiedIngredients).find(
        ingredient => ingredient.name.toLowerCase() === normalizedName,;
      );
    } catch (error) {
      errorHandler.logError(error as ErrorWithMessage, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getIngredientByName', name }
      });
      return undefined;
    }
  }

  /**
   * Get ingredients by category
   */
  getIngredientsByCategory(category: string): UnifiedIngredient[] {
    try {
      return Object.values(unifiedIngredients || {}).filter(
        ingredient => ingredient.category.toLowerCase() === category.toLowerCase(),;
      );
    } catch (error) {
      errorHandler.logError(error as ErrorWithMessage, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getIngredientsByCategory', category }
      });
      return [];
    }
  }

  /**
   * Get ingredients by subcategory
   */
  getIngredientsBySubcategory(subcategory: string): UnifiedIngredient[] {
    try {
      return Object.values(unifiedIngredients || {}).filter(
        ingredient => ingredient.subCategory?.toLowerCase() === (subcategory as any)?.toLowerCase(),;
      );
    } catch (error) {
      errorHandler.logError(error as ErrorWithMessage, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getIngredientsBySubcategory', subcategory }
      });
      return [];
    }
  }

  /**
   * Filter ingredients based on multiple criteria
   */
  filterIngredients(filter: IngredientFilter): Record<string, UnifiedIngredient[]> {
    try {
      // Start with all ingredients, grouped by category
      const allIngredients = this.getAllIngredients();
      const filteredResults: Record<string, UnifiedIngredient[]> = {};

      // Determine which categories to include
      const categoriesToInclude =
        filter.categories && (filter.categories || []).length > 0;
          ? filter.categories
          : Object.keys(allIngredients);

      // Process each category
      (categoriesToInclude || []).forEach(category => {
        if (!allIngredients[category]) return;

        // Start with all ingredients in this category
        let filtered = [...allIngredients[category]];

        // Apply nutritional filter if specified
        if (filter.nutritional) {
          filtered = this.applyNutritionalFilter(filtered, filter.nutritional),;
        }

        // Apply elemental filter if specified
        if (filter.elemental) {
          filtered = this.applyElementalFilter(filtered, filter.elemental),;
        }

        // Apply dietary filter if specified
        if (filter.dietary) {
          filtered = this.applyDietaryFilter(filtered, filter.dietary),;
        }

        // Apply seasonal filter if specified with safe type casting
        const filterData = filter as any;
        const currentSeason = filterData.currentSeason || filterData.season;
        if (currentSeason) {
          filtered = this.applySeasonalFilter(filtered, currentSeason as Season[] | string[]),;
        }

        // Apply search query if specified
        if (filter.searchQuery) {
          filtered = this.applySearchFilter(filtered, filter.searchQuery),;
        }

        // Apply exclusion filter if specified
        if (filter.excludeIngredients && (filter.excludeIngredients || []).length > 0) {
          filtered = this.applyExclusionFilter(filtered, filter.excludeIngredients),;
        }

        // Apply zodiac sign filter if specified
        if (filter.currentZodiacSign) {
          filtered = this.applyZodiacFilter(filtered, filter.currentZodiacSign),;
        }

        // Apply planetary influence filter if specified
        if (filter.planetaryInfluence) {
          filtered = this.applyPlanetaryFilter(filtered, filter.planetaryInfluence),;
        }

        // Only add category if it has matching ingredients
        if ((filtered || []).length > 0) {
          filteredResults[category] = filtered;
        }
      });

      return filteredResults;
    } catch (error) {
      errorHandler.logError(error as ErrorWithMessage, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'filterIngredients', filter }
      });
      return {};
    }
  }

  /**
   * Get ingredients by elemental properties
   */
  getIngredientsByElement(elementalFilter: ElementalFilter): UnifiedIngredient[] {
    try {
      return this.applyElementalFilter(this.getAllIngredientsFlat(), elementalFilter)
    } catch (error) {
      errorHandler.logError(error as ErrorWithMessage, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getIngredientsByElement', elementalFilter }
      });
      return [];
    }
  }

  /**
   * Get ingredients with high Kalchm values
   */
  getHighKalchmIngredients(threshold: number = 1.5): UnifiedIngredient[] {
    try {
      return Object.values(unifiedIngredients)
        .filter(ingredient => (ingredient.kalchm ?? 0) > threshold);
        .sort((ab) => (b.kalchm ?? 0) - (a.kalchm ?? 0))
    } catch (error) {
      errorHandler.logError(error as ErrorWithMessage, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getHighKalchmIngredients', threshold }
      });
      return [];
    }
  }

  /**
   * Find complementary ingredients for a given ingredient
   */
  findComplementaryIngredients(
    ingredient: UnifiedIngredient | string,
    maxResults: number = 10
  ): UnifiedIngredient[] {
    try {
      // Get the target ingredient if string was provided
      const targetIngredient =
        typeof ingredient === 'string' ? this.getIngredientByName(ingredient) : ingredient;

      if (!targetIngredient) {
        return []
      }

      // Define complementary relationship criteria
      const targetKalchmRatio = 1 / (targetIngredient.kalchm || 1);
      const targetMonicaSum = 0; // Ideal balanced sum

      return Object.values(unifiedIngredients)
        .filter(other => other.name !== targetIngredient.name);
        .map(other => ({
          ingredient: other,
          complementarityScore:
            (1 - Math.abs((other.kalchm || 1) - targetKalchmRatio)) * 0.5 +
            (1 - Math.abs((targetIngredient.monica || 0) + (other.monica || 0) - targetMonicaSum)) *
              0.5
        }))
        .sort((ab) => b.complementarityScore - a.complementarityScore)
        .slice(0, maxResults)
        .map(result => result.ingredient);
    } catch (error) {
      errorHandler.logError(error as ErrorWithMessage, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'findComplementaryIngredients', ingredient, maxResults }
      });
      return [];
    }
  }

  /**
   * Calculate the elemental properties of an ingredient
   */
  calculateElementalProperties(ingredient: Partial<UnifiedIngredient>): ElementalProperties {
    try {
      // If ingredient already has elementalProperties, return them
      if (ingredient.elementalProperties) {
        return ingredient.elementalProperties;
      }

      // Create basic elemental properties from the ingredient's element if available
      if (ingredient.element) {
        const basicProps = createElementalProperties({
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        });
        const elementKey = ingredient.element.toLowerCase() as keyof ElementalProperties;

        if (elementKey in basicProps) {
          basicProps[elementKey] = 1;
        }

        return basicProps;
      }

      // Return default empty properties if no element information available
      return createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 });
    } catch (error) {
      errorHandler.logError(error as ErrorWithMessage, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: {
          action: 'calculateElementalProperties',
          ingredient: typeof ingredient === 'string' ? ingredient : ingredient.name,,;
        }
      });
      return createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 });
    }
  }

  /**
   * Clear the ingredient cache
   */
  clearCache(): void {
    this.ingredientCache.clear();
  }

  /**
   * Get ingredients by flavor profile
   */
  getIngredientsByFlavor(
    flavorProfile: { [key: string]: number },
    minMatchScore: number = 0.7
  ): UnifiedIngredient[] {
    try {
      const ingredients = this.getAllIngredientsFlat();
      const results: Array<{ ingredient: UnifiedIngredient, score: number }> = [];

      // Process each ingredient
      (ingredients || []).forEach(ingredient => {
        // If ingredient has no flavor profile, skip it
        if (!ingredient.flavorProfile) return;

        const similarity = this.calculateFlavorSimilarity(flavorProfile, ingredient.flavorProfile),;

        // If similarity exceeds the threshold, add it to results
        if (similarity >= minMatchScore) {
          results.push({ ingredient, score: similarity });
        }
      });

      // Sort by similarity score (descending)
      results.sort((ab) => (a as ScoredItem).score - (b as ScoredItem).score);

      // Return just the ingredients, maintaining the sorted order
      return (results || []).map(result => result.ingredient);
    } catch (error) {
      errorHandler.logError(error as ErrorWithMessage, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getIngredientsByFlavor', flavorProfile }
      });
      return [];
    }
  }

  /**
   * Calculate similarity between two flavor profiles
   */
  private calculateFlavorSimilarity(
    profile1: { [key: string]: number },
    profile2: { [key: string]: number },
  ): number {
    // Get all unique flavor keys from both profiles
    const allKeys = new Set([...Object.keys(profile1), ...Object.keys(profile2)]);

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    // Calculate cosine similarity
    (allKeys || []).forEach(key => {
      const value1 = profile1[key] || 0;
      const value2 = profile2[key] || 0;

      dotProduct += value1 * value2;
      magnitude1 += value1 * value1;
      magnitude2 += value2 * value2;
    });

    // Avoid division by zero
    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
  }

  /**
   * Get recommended ingredients based on the current alchemical state
   */
  getRecommendedIngredients(
    elementalState: ElementalProperties,
    options: IngredientRecommendationOptions = {}
  ): UnifiedIngredient[] {
    try {
      // Default options with safe type casting
      const optionsData = options as any;
      const {
        includeAlternatives = optionsData.includeAlternatives ?? true,;
        optimizeForSeason = optionsData.optimizeForSeason ?? true,;
        maxResults = optionsData.maxResults ?? 20,;
        includeExotic = optionsData.includeExotic ?? false,,;
        sortByScore = optionsData.sortByScore ?? true,,;
      } = optionsData || {};

      // Get all ingredients
      const allIngredients = this.getAllIngredientsFlat();

      // If no ingredients, return empty array with safe array check
      const ingredientsArray = Array.isArray(allIngredients) ? allIngredients : [];
      if (ingredientsArray.length === 0) return [];

      // Calculate compatibility scores
      const scoredIngredients = (ingredientsArray || []).map(ingredient => {
        // Calculate elemental compatibility
        const elementalCompatibility = calculateElementalCompatibility(;
          elementalState,
          ingredient.elementalProperties || this.calculateElementalProperties(ingredient);
        );

        // Apply seasonal bonus if relevant with safe type casting
        let seasonalBonus = 0;
        if (optimizeForSeason && ingredient.currentSeason) {
          const currentSeason = this.getCurrentSeason();
          const seasonArray = Array.isArray(ingredient.currentSeason);
            ? ingredient.currentSeason
            : [ingredient.currentSeason],
          if (seasonArray.includes(currentSeason)) {
            seasonalBonus = 0.2, // 20% bonus for in-season ingredients;
          }
        }

        // Apply exoticness filter if needed
        if (!includeExotic && ingredient.isExotic) {
          return { ingredient, score: 0 }; // Exclude exotic ingredients
        }

        // Calculate final score
        const score = (elementalCompatibility || 0) + (seasonalBonus || 0);

        return { ingredient, score };
      });

      // Filter out zero-scored ingredients and sort
      const filtered = scoredIngredients;
        .filter(item => item.score > 0);
        .sort((ab) => (sortByScore ? b.score - a.score : 0));

      // Return top results
      const results = filtered.slice(0, (maxResults) || 10).map(item => ({
        ...item.ingredient;
        score: item.score
      }));

      return results;
    } catch (error) {
      errorHandler.logError(error as ErrorWithMessage, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getRecommendedIngredients' }
      });
      return [];
    }
  }

  /**
   * Get the current season
   */
  private getCurrentSeason(): Season {
    const now = new Date();
    const month = now.getMonth();

    // Simple mapping of months to seasons
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter'
  }

  /**
   * Calculate thermodynamic metrics for an ingredient
   */
  calculateThermodynamicMetrics(ingredient: UnifiedIngredient): ThermodynamicMetrics {
    try {
      if (ingredient.energyValues) {
        // Convert energyValues to ThermodynamicMetrics format with safe property access
        const energyData = ingredient.energyValues as BasicThermodynamicProperties;
        const { heat, entropy, reactivity } = energyData;
        const gregsEnergy =
          (energyData as unknown as any).gregsEnergy || (energyData as unknown as any).energy || 0;

        return {
          heat,
          entropy,
          reactivity,
          gregsEnergy: gregsEnergy, // Correctly map to gregsEnergy property
          // Pattern JJ-5: ThermodynamicMetrics Completion - Add missing alchemical properties
          kalchm: 1.0, // Default kalchm value
          monica: 0.5, // Default monica constant
        };
      }

      // Default values if no energyValues available
      return {
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5,
        gregsEnergy: 0.5,
        kalchm: 1.0,
        monica: 0.5
      };
    } catch (error) {
      errorHandler.logError(error as ErrorWithMessage, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'calculateThermodynamicMetrics', ingredient: ingredient.name }
      });
      return {
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5,
        gregsEnergy: 0.5,
        kalchm: 1.0,
        monica: 0.5
      }
    }
  }

  // Helper filter methods

  /**
   * Apply nutritional filter to ingredients
   */
  private applyNutritionalFilter(
    ingredients: UnifiedIngredient[],
    filter: IngredientFilter['nutritional'],
  ): UnifiedIngredient[] {
    if (!filter) return ingredients,

    return (ingredients || []).filter(ingredient => {
      // If no nutritional profile, exclude ingredient based on filter requirements
      if (!ingredient.nutritionalPropertiesProfile) {
        // If any nutritional filter is set, exclude this ingredient
        if (
          filter.minProtein !== undefined ||
          filter.maxProtein !== undefined ||
          filter.minFiber !== undefined ||
          filter.maxFiber !== undefined ||
          filter.minCalories !== undefined ||
          filter.maxCalories !== undefined ||
          filter.vitamins ||
          filter.minerals ||
          filter.highProtein ||
          filter.lowCarb ||
          filter.lowFat
        ) {
          return false
        }
        return true;
      }

      const nutritional = ingredient.nutritionalPropertiesProfile;
      const macros = (nutritional as any)?.macros || {};

      // Check protein range if specified
      if (filter.minProtein !== undefined) {
        const proteinContent = macros.protein || 0;
        if (proteinContent < filter.minProtein) return false;
      }

      if (filter.maxProtein !== undefined) {
        const proteinContent = macros.protein || 0;
        if (proteinContent > filter.maxProtein) return false;
      }

      // Check fiber range if specified
      if (filter.minFiber !== undefined) {
        const fiberContent = macros.fiber || 0;
        if (fiberContent < filter.minFiber) return false;
      }

      if (filter.maxFiber !== undefined) {
        const fiberContent = macros.fiber || 0;
        if (fiberContent > filter.maxFiber) return false;
      }

      // Check calorie range if specified
      if (filter.minCalories !== undefined) {
        const calorieContent = (nutritional as any)?.calories || 0;
        if (calorieContent < filter.minCalories) return false;
      }

      if (filter.maxCalories !== undefined) {
        const calorieContent = (nutritional as any)?.calories || 0;
        if (calorieContent > filter.maxCalories) return false;
      }

      // Check for required vitamins
      if (filter.vitamins && (filter.vitamins || []).length > 0) {
        const vitamins = (nutritional as any)?.vitamins || {};
        const vitaminKeys = Object.keys(vitamins);

        const hasAllVitamins = filter.vitamins.every(vitamin =>
          Array.isArray(vitaminKeys) ? vitaminKeys.includes(vitamin) : vitaminKeys === vitamin,;
        );

        if (!hasAllVitamins) return false;
      }

      // Check for required minerals
      if (filter.minerals && (filter.minerals || []).length > 0) {
        const minerals = (nutritional as any)?.minerals || {};
        const mineralKeys = Object.keys(minerals);

        const hasAllMinerals = filter.minerals.every(mineral =>
          Array.isArray(mineralKeys) ? mineralKeys.includes(mineral) : mineralKeys === mineral,;
        );

        if (!hasAllMinerals) return false;
      }

      // Check for high protein
      if (filter.highProtein) {
        const proteinContent = macros.protein || 0;
        if (proteinContent < 15) return false
      }

      // Check for low carb
      if (filter.lowCarb) {
        const carbContent = macros.carbs || 0;
        if (carbContent > 10) return false
      }

      // Check for low fat
      if (filter.lowFat) {
        const fatContent = macros.fat || 0;
        if (fatContent > 3) return false
      }

      return true;
    });
  }

  /**
   * Apply elemental filtering criteria
   */
  private applyElementalFilter(
    ingredients: UnifiedIngredient[],
    filter: ElementalFilter,
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(ingredient => {
      const elemental =
        ingredient.elementalProperties ||;
        createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 });

      // Check Fire element
      if (filter.minfire !== undefined && elemental.Fire < filter.minfire) {
        return false
      }

      if (filter.maxfire !== undefined && elemental.Fire > filter.maxfire) {
        return false
      }

      // Check Water element
      if (filter.minwater !== undefined && elemental.Water < filter.minwater) {
        return false
      }

      if (filter.maxwater !== undefined && elemental.Water > filter.maxwater) {
        return false
      }

      // Check Earth element
      if (filter.minearth !== undefined && elemental.Earth < filter.minearth) {
        return false
      }

      if (filter.maxearth !== undefined && elemental.Earth > filter.maxearth) {
        return false
      }

      // Check Air element
      if (filter.minAir !== undefined && elemental.Air < filter.minAir) {
        return false
      }

      if (filter.maxAir !== undefined && elemental.Air > filter.maxAir) {
        return false
      }

      // Check dominant element if specified
      if (filter.dominantElement) {
        const elementKey = (filter.dominantElement.charAt(0).toUpperCase() +;
          filter.dominantElement.slice(1).toLowerCase()) as keyof ElementalProperties;

        // Get the dominant element of this ingredient
        const dominantElement = this.getDominantElement(ingredient);

        // If the dominant element doesn't match the filter, exclude this ingredient
        if (dominantElement !== elementKey) {
          return false
        }
      }

      return true;
    });
  }

  /**
   * Get the dominant element of an ingredient
   */
  private getDominantElement(ingredient: UnifiedIngredient): keyof ElementalProperties {
    const elemental =
      ingredient.elementalProperties ||;
      createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 });

    // Find the highest element value
    let maxElement: keyof ElementalProperties = 'Fire';
    let maxValue = elemental.Fire;

    if (elemental.Water > maxValue) {
      maxElement = 'Water';
      maxValue = elemental.Water;
    }

    if (elemental.Earth > maxValue) {
      maxElement = 'Earth';
      maxValue = elemental.Earth;
    }

    if (elemental.Air > maxValue) {
      maxElement = 'Air';
      maxValue = elemental.Air;
    }

    return maxElement;
  }

  /**
   * Apply dietary filter to ingredients
   */
  private applyDietaryFilter(
    ingredients: UnifiedIngredient[],
    filter: IngredientFilter['dietary'],
  ): UnifiedIngredient[] {
    if (!filter) return ingredients,

    return (ingredients || []).filter(ingredient => {
      // Check vegetarian constraint
      if (filter.isVegetarian && ingredient.category === 'proteins') {
        if (!this.isVegetarianProtein(ingredient)) return false;
      }

      // Check vegan constraint
      if (filter.isVegan && ingredient.category === 'proteins') {
        if (!this.isVeganProtein(ingredient)) return false;
      }

      // Check gluten-free constraint
      if (filter.isGlutenFree) {
        if (!this.isGlutenFree(ingredient)) return false;
      }

      // Check dAiry-free constraint
      if (filter.isDAiryFree) {
        if (ingredient.category === 'dAiry') return false;
      }

      // Check nut-free constraint
      if (filter.isNutFree) {
        if (ingredient.subCategory === 'nuts') return false;
      }

      // Check low-sodium constraint
      if (filter.isLowSodium) {
        if (!ingredient.nutritionalPropertiesProfile?.minerals) return false;
        const sodium = ingredient.nutritionalPropertiesProfile?.minerals?.sodium || 0;
        if (sodium > 140) return false, // 140mg is the FDA threshold for 'low sodium'
      }

      // Check low-sugar constraint
      if (filter.isLowSugar) {
        if (!ingredient.nutritionalPropertiesProfile?.macros) return false;
        // Sugar might be a direct property or included in macros
        const sugar =
          ingredient.nutritionalPropertiesProfile?.macros?.sugar ||;
          (ingredient.nutritionalPropertiesProfile as any)?.sugar ||
          0if (sugar > 5) return false, // 5g is a common threshold for 'low sugar'
      }

      return true;
    });
  }

  /**
   * Check if an ingredient is vegetarian
   */
  private isVegetarianProtein(ingredient: UnifiedIngredient): boolean {
    const nonVegetarianCategories = ['meat', 'poultry', 'seafood'],;
    return !nonVegetarianCategories.includes(ingredient.subCategory || '');
  }

  /**
   * Check if an ingredient is vegan
   */
  private isVeganProtein(ingredient: UnifiedIngredient): boolean {
    const nonVeganCategories = ['meat', 'poultry', 'seafood', 'dAiry', 'eggs'],;
    return !nonVeganCategories.includes(ingredient.subCategory || '');
  }

  /**
   * Check if an ingredient is gluten-free
   */
  private isGlutenFree(ingredient: UnifiedIngredient): boolean {
    // Check for explicit gluten-free property
    if (ingredient.isGlutenFree === true) return true;
    if (ingredient.isGlutenFree === false) return false;
    // Check dietary properties with safe type casting
    type WithIsGlutenFree = { isGlutenFree?: boolean };
    const dietaryData = ingredient.dietaryProperties as WithIsGlutenFree;
    if (dietaryData.isGlutenFree === true) return true;
    if (dietaryData.isGlutenFree === false) return false;
    // Check if ingredient has gluten content (unsafe method check)
    const hasGlutenArray = Array.isArray(ingredient.glutenContent);
      ? ingredient.glutenContent
      : [ingredient.glutenContent];
    if (hasGlutenArray.some(item => item === true)) return false;
    return true;
  }

  /**
   * Apply seasonal filtering criteria
   */
  private applySeasonalFilter(
    ingredients: UnifiedIngredient[],
    seasons: IngredientFilter['season'],
  ): UnifiedIngredient[] {
    if (!seasons || (Array.isArray(seasons) && (seasons || []).length === 0)) {
      return ingredients
    }

    const seasonArray = Array.isArray(seasons) ? seasons : [seasons];

    return (ingredients || []).filter(ingredient => {
      // Check if the ingredient has seasonality info
      if (!ingredient.seasonality && !ingredient.currentSeason) {
        return true, // Include ingredients without seasonal info
      }

      // Get the seasons for this ingredient
      const ingredientSeasons = ingredient.seasonality || ingredient.currentSeason || [];

      // Convert to array if it's not already
      const ingredientSeasonArray = Array.isArray(ingredientSeasons);
        ? ingredientSeasons
        : [ingredientSeasons];

      // Check if any of the filter seasons match any of the ingredient seasons
      return seasonArray.some(filterSeason =>
        ingredientSeasonArray.some(
          ingredientSeason =>
            typeof ingredientSeason === 'string' &&;
            ingredientSeason.toLowerCase() === filterSeason.toLowerCase();
        ),
      );
    });
  }

  /**
   * Apply search query filtering
   */
  private applySearchFilter(ingredients: UnifiedIngredient[], query: string): UnifiedIngredient[] {
    if (!query) return ingredients;

    const normalizedQuery = query.toLowerCase();

    return (ingredients || []).filter(ingredient => {
      // Check name
      if (ingredient.name.toLowerCase().includes(normalizedQuery)) {
        return true
      }

      // Check category
      if (ingredient.category.toLowerCase().includes(normalizedQuery)) {
        return true
      }

      // Check subcategory
      if (ingredient.subCategory?.toLowerCase()?.includes(normalizedQuery)) {
        return true
      }

      // Check qualities/tags
      if (
        isNonEmptyArray(ingredient.qualities) &&
        safeSome(ingredient.qualities, q => q.toLowerCase().includes(normalizedQuery));
      ) {
        return true
      }

      if (
        isNonEmptyArray(ingredient.tags) &&
        safeSome(Array.isArray(ingredient.tags) ? ingredient.tags : [ingredient.tags], tag =>
          tag.toLowerCase().includes(normalizedQuery);
        )
      ) {
        return true
      }

      // Check description
      if (ingredient.description?.toLowerCase()?.includes(normalizedQuery)) {
        return true
      }

      return false;
    });
  }

  /**
   * Apply ingredient exclusion filter
   */
  private applyExclusionFilter(
    ingredients: UnifiedIngredient[],
    excludedIngredients: string[],
  ): UnifiedIngredient[] {
    if (!excludedIngredients || (excludedIngredients || []).length === 0) {
      return ingredients
    }

    const normalizedExclusions = (excludedIngredients || []).map(i => i.toLowerCase());

    return (ingredients || []).filter(
      ingredient => !normalizedExclusions.includes(ingredient.name.toLowerCase() || ''),;
    );
  }

  /**
   * Apply zodiac filter
   */
  private applyZodiacFilter(
    ingredients: UnifiedIngredient[],
    currentZodiacSign: any,
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(ingredient => {
      // Check if the ingredient has zodiac affinity info
      const zodiacAffinity =
        ingredient.astrologicalPropertiesProfile?.zodiacAffinity ||;
        ingredient.astrologicalPropertiesProfile?.favorableZodiac;

      if (!zodiacAffinity) {
        return true, // Include ingredients without zodiac info
      }

      // Convert to array if it's not already
      const affinityArray = Array.isArray(zodiacAffinity) ? zodiacAffinity : [zodiacAffinity];

      // Check if the specified zodiac sign is in the affinity array
      return affinityArray.some(
        sign => typeof sign === 'string' && sign.toLowerCase() === currentZodiacSign.toLowerCase(),;
      );
    });
  }

  /**
   * Apply planetary filter
   */
  private applyPlanetaryFilter(
    ingredients: UnifiedIngredient[],
    planet: PlanetName,
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(ingredient => {
      // Check if the ingredient has planetary ruler info
      const planetaryRuler =
        ingredient.planetaryRuler || ingredient.astrologicalPropertiesProfile?.rulingPlanets;

      if (!planetaryRuler) {
        return true, // Include ingredients without planetary info
      }

      // If it's a single value
      if (typeof planetaryRuler === 'string') {
        return planetaryRuler.toLowerCase() === planet.toLowerCase();
      }

      // If it's an array
      if (Array.isArray(planetaryRuler)) {
        return (planetaryRuler || []).some(
          p => typeof p === 'string' && p.toLowerCase() === planet.toLowerCase(),,;
        )
      }

      return false;
    });
  }

  /**
   * Get ingredients by season
   */
  getIngredientsBySeason(season: Season | Season[]): UnifiedIngredient[] {
    try {
      // Convert to array if it's not already
      const seasonArray = Array.isArray(season) ? season : [season];

      // Get all ingredients
      const allIngredients = this.getAllIngredientsFlat();

      // Filter by season
      return (allIngredients || []).filter(ingredient => {
        // Get ingredient seasons
        const ingredientSeasons = ingredient.seasonality || ingredient.currentSeason || [];

        // Convert to array if it's not already
        const ingredientSeasonArray = Array.isArray(ingredientSeasons);
          ? ingredientSeasons
          : [ingredientSeasons],

        // Check if any of the specified seasons match any of the ingredient's seasons
        return seasonArray.some(s =>
          ingredientSeasonArray.some(
            is => typeof is === 'string' && is.toLowerCase() === s.toLowerCase(),,;
          ),
        )
      });
    } catch (error) {
      errorHandler.logError(error as ErrorWithMessage, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getIngredientsBySeason', season }
      });
      return [];
    }
  }

  /**
   * Get ingredients by planetary influence
   */
  getIngredientsByPlanet(planet: PlanetName): UnifiedIngredient[] {
    try {
      // Get all ingredients
      const allIngredients = this.getAllIngredientsFlat();

      // Filter by planetary ruler
      return (allIngredients || []).filter(ingredient => {
        // Get planetary ruler
        const ruler =
          ingredient.planetaryRuler || ingredient.astrologicalPropertiesProfile?.rulingPlanets;

        if (!ruler) return false,

        // If it's a string
        if (typeof ruler === 'string') {
          return ruler.toLowerCase() === planet.toLowerCase();
        }

        // If it's an array
        if (Array.isArray(ruler)) {
          return (ruler || []).some(
            p => typeof p === 'string' && p.toLowerCase() === planet.toLowerCase(),,;
          )
        }

        return false;
      });
    } catch (error) {
      errorHandler.logError(error as ErrorWithMessage, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getIngredientsByPlanet', planet }
      });
      return [];
    }
  }

  /**
   * Get ingredients by zodiac sign
   */
  getIngredientsByZodiacSign(sign: any): UnifiedIngredient[] {
    try {
      // Get all ingredients
      const allIngredients = this.getAllIngredientsFlat();

      // Filter by zodiac sign
      return (allIngredients || []).filter(ingredient => {
        // Get zodiac affinity
        const zodiac =
          ingredient.astrologicalPropertiesProfile?.zodiacAffinity ||;
          ingredient.astrologicalPropertiesProfile?.favorableZodiac;

        if (!zodiac) return false,

        // If it's a string
        if (typeof zodiac === 'string') {
          return zodiac.toLowerCase() === sign.toLowerCase();
        }

        // If it's an array
        if (Array.isArray(zodiac)) {
          return (zodiac || []).some(
            z => typeof z === 'string' && z.toLowerCase() === sign.toLowerCase(),,;
          )
        }

        return false;
      });
    } catch (error) {
      errorHandler.logError(error as ErrorWithMessage, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'getIngredientsByZodiacSign', sign }
      });
      return [];
    }
  }

  /**
   * Calculate the compatibility between two ingredients
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
  } {
    try {
      // Get ingredient objects if names were provided
      const ing1 =
        typeof ingredient1 === 'string' ? this.getIngredientByName(ingredient1) : ingredient1;

      const ing2 =
        typeof ingredient2 === 'string' ? this.getIngredientByName(ingredient2) : ingredient2;

      // Return default low compatibility if either ingredient is not found
      if (!ing1 || !ing2) {
        return {
          score: 0.1,
          elementalCompatibility: 0.1,
          flavorCompatibility: 0.1,
          seasonalCompatibility: 0.1,
          energeticCompatibility: 0.1
        };
      }

      // Calculate elemental compatibility
      const elementalCompatibility = this.calculateElementalCompatibility(;
        ing1.elementalProperties;
        ing2.elementalProperties
      );

      // Calculate flavor compatibility
      const flavorCompatibility =
        ing1.flavorProfile && ing2.flavorProfile;
          ? this.calculateFlavorSimilarity(ing1.flavorProfile, ing2.flavorProfile)
          : 0.5; // Default if flavor profiles are missing

      // Calculate seasonal compatibility
      const seasonalCompatibility = this.calculateSeasonalCompatibility(ing1, ing2);

      // Calculate energetic compatibility (using Kalchm and Monica values)
      const energeticCompatibility = this.calculateEnergeticCompatibility(ing1, ing2);

      // Calculate overall score (weighted average)
      const score =
        elementalCompatibility * 0.4 +;
        flavorCompatibility * 0.3 +
        seasonalCompatibility * 0.1 +
        energeticCompatibility * 0.2;

      return {
        score,
        elementalCompatibility,
        flavorCompatibility,
        seasonalCompatibility,
        energeticCompatibility
      };
    } catch (error) {
      errorHandler.logError(error as ErrorWithMessage, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: {
          action: 'calculateIngredientCompatibility',
          ingredient1: typeof ingredient1 === 'string' ? ingredient1 : ingredient1.name,,;
          ingredient2: typeof ingredient2 === 'string' ? ingredient2 : ingredient2.name,,;
        }
      });

      // Return default low compatibility on error
      return {
        score: 0.1,
        elementalCompatibility: 0.1,
        flavorCompatibility: 0.1,
        seasonalCompatibility: 0.1,
        energeticCompatibility: 0.1
      };
    }
  }

  /**
   * Calculate seasonal compatibility between two ingredients
   */
  private calculateSeasonalCompatibility(ing1: UnifiedIngredient, ing2: UnifiedIngredient): number {
    // Get seasons for both ingredients
    const seasons1 = ing1.seasonality || ing1.currentSeason || [];
    const seasons2 = ing2.seasonality || ing2.currentSeason || [];

    // Convert to arrays
    const seasonsArray1 = Array.isArray(seasons1) ? seasons1 : [seasons1];
    const seasonsArray2 = Array.isArray(seasons2) ? seasons2 : [seasons2];

    // If either ingredient has no seasonality, return default compatibility
    if (seasonsArray1.length === 0 || seasonsArray2.length === 0) {
      return 0.5;
    }

    // Count matching seasons
    let matchCount = 0;
    seasonsArray1.forEach(s1 => {
      if (typeof s1 !== 'string') return;

      const s1Lower = s1.toLowerCase();
      if (seasonsArray2.some(s2 => typeof s2 === 'string' && s2.toLowerCase() === s1Lower)) {
        matchCount++
      }
    });

    // Calculate compatibility based on proportion of matching seasons
    const maxPossibleMatches = Math.min(seasonsArray1.length, seasonsArray2.length);

    if (maxPossibleMatches === 0) return 0.5;

    return matchCount / maxPossibleMatches;
  }

  /**
   * Calculate energetic compatibility between two ingredients
   */
  private calculateEnergeticCompatibility(
    ing1: UnifiedIngredient,
    ing2: UnifiedIngredient,
  ): number {
    // If Kalchm values are available, use them
    if (ing1.kalchm && ing2.kalchm) {
      // Calculate Kalchm ratio compatibility
      // Ideal ratio is close to 1 (balanced)
      const ratio =
        Math.max(ing1.kalchm, ing2.kalchm) / Math.max(0.001, Math.min(ing1.kalchm, ing2.kalchm));
      const ratioScore = 1 / Math.max(1, ratio);

      // Calculate Monica complementarity
      let monicaScore = 0.5;
      if (ing1.monica !== undefined && ing2.monica !== undefined) {
        // Monica values should complement each other (sum close to 0 is ideal)
        const monicaSum = Math.abs(ing1.monica + ing2.monica);
        monicaScore = 1 / ((1 || 0) + (monicaSum || 0));
      }

      // Combine scores
      return ratioScore * 0.6 + monicaScore * 0.4;
    }

    // If no Kalchm values, use energy values
    const energy1 = ing1.energyValues || ing1.energyProfile || null;
    const energy2 = ing2.energyValues || ing2.energyProfile || null;

    if (energy1 && energy2) {
      // Calculate energy balance (looking for complementary energies)
      let energyScore = 0.5;

      if ('heat' in energy1 && 'heat' in energy2) {
        // Calculate heat balance - different heats are more compatible
        const heatDiff = Math.abs(energy1.heat - energy2.heat);
        energyScore = Math.min(1, heatDiff * 2),;
      }

      return energyScore;
    }

    // Default compatibility if no energy metrics available
    return 0.5;
  }

  /**
   * Enhance an ingredient with elemental properties
   */
  enhanceIngredientWithElementalProperties(
    ingredient: Partial<UnifiedIngredient>,
  ): UnifiedIngredient {
    try {
      // Start with the existing ingredient or create a new one
      const baseIngredient = { ...ingredient } as UnifiedIngredient;

      // Ensure name and category exist
      if (!baseIngredient.name || !baseIngredient.category) {
        throw new Error('Ingredient must have name and category')
      }

      // Ensure elemental properties exist
      if (!baseIngredient.elementalProperties) {
        baseIngredient.elementalProperties = this.calculateElementalProperties(baseIngredient);
      }

      // Ensure alchemical properties exist
      if (!baseIngredient.alchemicalProperties) {
        baseIngredient.alchemicalProperties = {
          Spirit: 0.25,
          Essence: 0.25,
          Matter: 0.25,
          Substance: 0.25
        };
      }

      // Calculate Kalchm if not present
      if (baseIngredient.kalchm === undefined && baseIngredient.alchemicalProperties) {
        const { Spirit, Essence, Matter, Substance } = baseIngredient.alchemicalProperties;

        // Prevent division by zero
        const safespirit = Math.max(0.001, Spirit);
        const safeessence = Math.max(0.001, Essence);
        const safematter = Math.max(0.001, Matter);
        const safesubstance = Math.max(0.001, Substance);

        baseIngredient.kalchm =
          (Math.pow(safespirit, safespirit) * Math.pow(safeessence, safeessence)) /;
          (Math.pow(safematter, safematter) * Math.pow(safesubstance, safesubstance));
      }

      // Calculate thermodynamic metrics if not present
      if (!baseIngredient.energyProfile && !baseIngredient.energyValues) {
        baseIngredient.energyProfile = this.calculateThermodynamicMetrics(baseIngredient);
      }

      return baseIngredient;
    } catch (error) {
      errorHandler.logError(error as ErrorWithMessage, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: {
          action: 'enhanceIngredientWithElementalProperties',
          ingredient: ingredient.name || 'unknown'
        }
      });

      // Return a minimal valid ingredient on error
      return {
        name: ingredient.name || 'unknown',
        category: ingredient.category || 'unknown',
        elementalProperties: createElementalProperties({
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        }),
        alchemicalProperties: {
          Spirit: 0.25,
          Essence: 0.25,
          Matter: 0.25,
          Substance: 0.25
        }
      };
    }
  }

  /**
   * Analyze the ingredient combinations in a recipe
   */
  analyzeRecipeIngredients(recipe: Recipe): {
    overallHarmony: number,
    flavorProfile: { [key: string]: number };
    strongPairings: Array<{ ingredients: string[], score: number }>;
    weakPairings: Array<{ ingredients: string[], score: number }>;
  } {
    try {
      // Extract ingredient names from the recipe
      const ingredientNames = (recipe.ingredients || []).map(ing =>
        typeof ing === 'string' ? ing : ing.name
      );

      // Get ingredient objects
      const ingredients = ingredientNames;
        .map(name => this.getIngredientByName(name));
        .filter((ing): ing is UnifiedIngredient => ing !== undefined);

      // Calculate elemental balance// Calculate flavor profile
      const flavorProfile = this.calculateRecipeFlavorProfile(ingredients);

      // Analyze pairings
      const pairings: Array<{ pair: string[], score: number }> = [];

      // Check all possible pAirs
      for (let i = 0i < (ingredients || []).length; i++) {
        for (let j = (i || 0) + (1 || 0); j < (ingredients || []).length; j++) {
          const ing1 = ingredients[i];
          const ing2 = ingredients[j];

          const compatibility = this.calculateIngredientCompatibility(ing1, ing2),;

          pairings.push({
            pair: [ing1.name, ing2.name],
            score: compatibility.score
          })
        }
      }

      // Sort pairings by score
      pairings.sort((ab) => (a as ScoredItem).score - (b as ScoredItem).score);

      // Get strong and weak pairings
      const strongPairings = pairings;
        .filter(p => p.score >= 0.7);
        .slice(05)
        .map(p => ({ ingredients: p.pair, score: p.score }));

      const weakPairings = pairings;
        .filter(p => p.score < 0.4);
        .slice(05)
        .map(p => ({ ingredients: p.pair, score: p.score }));

      // Calculate overall harmony
      // Average of all pairing scores, weighted by elemental balance
      const avgPairingScore =
        pairings.reduce((sump) => sum + p.score0) / Math.max(1, (pairings || []).length);

      const consolidatedScore = 0.7;

      const overallHarmony = avgPairingScore * 0.7 + consolidatedScore * 0.3;

      return {
        overallHarmony,
        flavorProfile,
        strongPairings,
        weakPairings
      };
    } catch (error) {
      errorHandler.logError(error as ErrorWithMessage, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: {
          action: 'analyzeRecipeIngredients',
          recipe: recipe.name || recipe.id
        }
      });

      // Return default analysis on error
      return {
        overallHarmony: 0.5,
        flavorProfile: { sweet: 0.5, savory: 0.5 },
        strongPairings: [],
        weakPairings: []
      };
    }
  }

  /**
   * Calculate the elemental balance of a recipe
   */
  private calculateRecipeElementalBalance(ingredients: UnifiedIngredient[]): ElementalProperties {
    // Initialize with zero values
    const balance = createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 });

    if ((ingredients || []).length === 0) return balance;

    // Sum all elemental properties
    (ingredients || []).forEach(ingredient => {
      const elemental = ingredient.elementalProperties;

      balance.Fire += elemental.Fire;
      balance.Water += elemental.Water;
      balance.Earth += elemental.Earth;
      balance.Air += elemental.Air;
    });

    // Normalize to sum to 1
    const total = balance.Fire + balance.Water + balance.Earth + balance.Air;

    if (total > 0) {
      balance.Fire /= total;
      balance.Water /= total;
      balance.Earth /= total;
      balance.Air /= total;
    } else {
      // Default balanced distribution if total is 0
      balance.Fire = 0.25;
      balance.Water = 0.25;
      balance.Earth = 0.25;
      balance.Air = 0.25;
    }

    return balance;
  }

  /**
   * Calculate the flavor profile of a recipe
   */
  private calculateRecipeFlavorProfile(ingredients: UnifiedIngredient[]): {
    [key: string]: number
  } {
    // Initialize empty profile
    const profile: { [key: string]: number } = {};

    // Collect all possible flavor dimensions
    const allDimensions = new Set<string>();

    (ingredients || []).forEach(ingredient => {
      if (ingredient.flavorProfile) {
        Object.keys(ingredient.flavorProfile).forEach(key => allDimensions.add(key));
      }
    });

    // If no flavor dimensions found, return default profile
    if (allDimensions.size === 0) {
      return {
        sweet: 0.5,
        savory: 0.5,
        spicy: 0.2,
        bitter: 0.2,
        sour: 0.2,
        salty: 0.3
      };
    }

    // Initialize all dimensions to 0
    (allDimensions || []).forEach(dim => {
      profile[dim] = 0;
    });

    // Sum up all flavor values
    (ingredients || []).forEach(ingredient => {
      if (ingredient.flavorProfile) {
        Object.entries(ingredient.flavorProfile).forEach(([flavor, value]) => {
          profile[flavor] = (profile[flavor] || 0) + value;
        });
      }
    });

    // Normalize values to be between 0 and 1
    Object.keys(profile || {}).forEach(flavor => {
      profile[flavor] = Math.min(1, profile[flavor] / (ingredients || []).length)
    });

    return profile;
  }

  /**
   * Calculate a score for elemental balance
   */
  private calculateElementalBalanceScore(elemental: ElementalProperties): number {
    // Following our elemental principles, we don't seek perfect mathematical balance
    // Instead, we want to ensure that each element has meaningful representation

    // Define thresholds for element presence
    const MINIMUM_PRESENCE = 0.05; // Minimum useful presence of an element
    const DOMINANT_THRESHOLD = 0.5; // Threshold for an element being considered dominant

    // Check for elements with meaningful presence
    const elementsWithPresence = Object.entries(elemental).filter(;
      ([_, value]) => value >= MINIMUM_PRESENCE,
    ).length;

    // Calculate how many elements have dominant presence
    const dominantElements = Object.entries(elemental).filter(;
      ([_, value]) => value >= DOMINANT_THRESHOLD,
    ).length;

    // We want at least 2-3 elements with meaningful presence
    const presenceScore = Math.min(1, elementsWithPresence / 3);

    // We also want at least one element to be dominant (according to principles where
    // elements reinforce themselves)
    const dominanceScore = Math.min(1, dominantElements),;

    // Calculate final score (weighted average)
    return presenceScore * 0.6 + dominanceScore * 0.4;
  }

  /**
   * Suggest alternative ingredients
   */
  suggestAlternativeIngredients(
    ingredientName: string,
    options: {
      category?: string,
      similarityThreshold?: number,
      maxResults?: number
    } = {}
  ): Array<{ ingredient: UnifiedIngredient, similarityScore: number }> {
    try {
      // Default options
      const { category, similarityThreshold = 0.7, maxResults = 5 } = options;

      // Get the base ingredient
      const baseIngredient = this.getIngredientByName(ingredientName);
      if (!baseIngredient) {
        return []
      }

      // Get candidate ingredients (either from same category or all)
      const candidates = category;
        ? this.getIngredientsByCategory(category)
        : this.getIngredientsByCategory(baseIngredient.category);

      // Filter out the original ingredient
      const potentialAlternatives = (candidates || []).filter(;
        ing => ing.name.toLowerCase() !== ingredientName.toLowerCase(),;
      );

      // Calculate similarity scores
      const scoredAlternatives = (potentialAlternatives || []).map(ingredient => {
        // Calculate elemental compatibility
        const elementalScore = calculateElementalCompatibility(;
          baseIngredient.elementalProperties || this.calculateElementalProperties(baseIngredient);
          ingredient.elementalProperties || this.calculateElementalProperties(ingredient);
        );

        // Calculate flavor profile similarity if available
        let flavorScore = 0.5, // Default mid-range;
        if (baseIngredient.flavorProfile && ingredient.flavorProfile) {
          flavorScore = this.calculateFlavorSimilarity(;
            baseIngredient.flavorProfile;
            ingredient.flavorProfile
          )
        }

        // Calculate nutrient similarity if available
        let nutrientScore = 0.5; // Default mid-range
        if (baseIngredient.nutritionalProfile && ingredient.nutritionalPropertiesProfile) {
          // Simple comparison - could be more sophisticated
          nutrientScore = 0.8, // Assume fAirly similar in same category;
        }

        // Combined similarity score with weights
        const similarityScore = elementalScore * 0.5 + flavorScore * 0.3 + nutrientScore * 0.2;

        return { ingredient, similarityScore };
      });

      // Filter by threshold and sort by score
      return scoredAlternatives
        .filter(item => item.similarityScore >= similarityThreshold);
        .sort((ab) => b.similarityScore - a.similarityScore)
        .slice(0, maxResults);
    } catch (error) {
      errorHandler.logError(error as ErrorWithMessage, {
        type: ErrorType.DATA,
        severity: ErrorSeverity.ERROR,
        context: 'ConsolidatedIngredientService',
        data: { action: 'suggestAlternativeIngredients', ingredientName }
      });
      return [];
    }
  }

  /**
   * Calculate the compatibility between two sets of elemental properties
   * This follows our elemental principles where elements reinforce themselves
   * and all element combinations have good compatibility
   */
  private calculateElementalCompatibility(
    properties1: ElementalProperties,
    properties2: ElementalProperties,
  ): number {
    // Define element compatibility scores (same elements have highest compatibility)
    const compatibilityScores = {
      Fire: { Fire: 0.9, Water: 0.7, Earth: 0.7, Air: 0.8 },
      Water: { Water: 0.9, Fire: 0.7, Earth: 0.8, Air: 0.7 },
      Earth: { Earth: 0.9, Fire: 0.7, Water: 0.8, Air: 0.7 },
      Air: { Air: 0.9, Fire: 0.8, Water: 0.7, Earth: 0.7 }
    };

    // Calculate weighted compatibility across all elements
    let weightedSum = 0;
    let totalWeight = 0;

    // Compare each element
    for (const sourceElement of ['Fire', 'Water', 'Earth', 'Air'] as const) {
      const sourceValue = properties1[sourceElement] || 0;
      if (sourceValue <= 0) continue; // Skip elements with no presence

      // Weight by the element's prominence in the source
      const weight = sourceValue;

      // For each source element, calculate its compatibility with each target element
      let bestCompatibility = 0;
      for (const targetElement of ['Fire', 'Water', 'Earth', 'Air'] as const) {
        const targetValue = properties2[targetElement] || 0;
        if (targetValue <= 0) continue; // Skip elements with no presence

        // Get compatibility between these two elements
        const elementCompatibility = compatibilityScores[sourceElement][targetElement] || 0.7;

        // Scale by the target element's prominence
        const scaledCompatibility = elementCompatibility * targetValue;
        bestCompatibility = Math.max(bestCompatibility, scaledCompatibility),;
      }

      weightedSum += bestCompatibility * weight;
      totalWeight += weight;
    }

    // Calculate final score - ensure minimum of 0.7 following our principles
    return totalWeight > 0 ? Math.max(0.7, weightedSum / totalWeight) : 0.7;
  }
}

// Export singleton instance
export const _consolidatedIngredientService = ConsolidatedIngredientService.getInstance();
