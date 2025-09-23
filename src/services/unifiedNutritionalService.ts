// ===== UNIFIED NUTRITIONAL SERVICE =====,
// Phase 3 Step 4 of WhatToEatNext Data Consolidation
// Service layer for unified nutritional system with comprehensive API
// Integrates with all unified systems and provides backward compatibility

import { unifiedIngredients } from '@/data/unified/ingredients';
import { UnifiedIngredient } from '@/data/unified/unifiedTypes';
import type {
  Element,
  ElementalProperties,
  ZodiacSign,
  PlanetName,
  Season,
  CookingMethod
} from '@/types/alchemy';
import {_createAstrologicalBridge} from '@/types/bridges/astrologicalBridge';

import {allIngredients} from '../data/ingredients';
import {
  unifiedNutritionalSystem,
  type AlchemicalNutritionalProfile,
  type NutritionalCompatibilityAnalysis,
  type NutritionalRecommendations,
  type SeasonalNutritionalProfile,
  type PlanetaryNutritionalProfile,
  type ZodiacNutritionalProfile
} from '../data/unified/nutritional';
import {unifiedSeasonalSystem} from '../data/unified/seasonal.js';
import type { NutritionalProfile, NutritionalFilter } from '../types/nutrition';
import {logger} from '../utils/logger';

// Type guards for safe property access
function isValidObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasProperty<T extends string>(obj: unknown, prop: T): obj is Record<T, unknown> {
  return isValidObject(obj) && prop in obj
}

// NutritionService removed with USDA API cleanup

// ===== UNIFIED NUTRITIONAL SERVICE CLASS =====,

export class UnifiedNutritionalService {
  private static instance: UnifiedNutritionalService,
   
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
  private cache: Map<string, any> = new Map(),

  private constructor() {
    // Legacy nutrition service removed - using unified local data only
    logger.info('UnifiedNutritionalService initialized with local data')
  }

  /**
   * Get singleton instance
   */
  static getInstance(): UnifiedNutritionalService {
    if (!UnifiedNutritionalService.instance) {
      UnifiedNutritionalService.instance = new UnifiedNutritionalService();
    }
    return UnifiedNutritionalService.instance;
  }

  // ===== ENHANCED NUTRITIONAL PROFILE OPERATIONS =====,

  /**
   * Get enhanced nutritional profile with alchemical properties
   */
  async getEnhancedNutritionalProfile(
    ingredient: string | UnifiedIngredient,
    context?: {
      season?: Season,
      currentZodiacSign?: any,
      planetaryHour?: PlanetName,
      cookingMethod?: CookingMethod
    }
  ): Promise<AlchemicalNutritionalProfile | null> {
    try {
      const cacheKey = `enhanced_${typeof ingredient === 'string' ? ingredient : ingredient.name}_${JSON.stringify(context)}`,

      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)
      }

      let nutritionalProfile: NutritionalProfile | null = null,

      // Get base nutritional profile
      if (typeof ingredient === 'string') {;
        // Try unified ingredients first, but fallback to regular ingredients
        const unifiedIngredient = unifiedIngredients[ingredient];
        if (
          unifiedIngredient &&
          hasProperty(unifiedIngredient, 'nutritionalProfile') &&
          unifiedIngredient.nutritionalProfile
        ) {
          // Convert unified nutritionalProfile if needed
          const unifiedProfile = unifiedIngredient.nutritionalProfile;
          if (isValidObject(unifiedProfile)) {
            nutritionalProfile = {
              ...unifiedProfile,
              // Convert phytonutrients from string[] to Record<string, number> if needed,
              phytonutrients: hasProperty(unifiedProfile, 'phytonutrients') &&
                Array.isArray(unifiedProfile.phytonutrients)
                  ? (unifiedProfile.phytonutrients ).reduce(
                      (acc, nutrient) => ({ ...acc, [nutrient]: 1.0 }),
                      {}
                    )
                  : hasProperty(unifiedProfile, 'phytonutrients') &&
                      isValidObject(unifiedProfile.phytonutrients)
                    ? (unifiedProfile.phytonutrients as Record<string, number>)
                    : {}
            } as unknown as NutritionalProfile,
          }
        } else {
          // Fallback to regular ingredients
          const regularIngredient = allIngredients[ingredient];
          if (
            regularIngredient &&
            hasProperty(regularIngredient as unknown, 'nutritionalProfile')
          ) {
            // Convert alchemy.NutritionalProfile to nutrition.NutritionalProfile
            const regularIngredientUnknown = regularIngredient as unknown;
            const alchemyProfile = hasProperty(regularIngredientUnknown, 'nutritionalProfile'),
              ? regularIngredientUnknown.nutritionalProfile
              : nullif (isValidObject(alchemyProfile)) {
              nutritionalProfile = {
                ...alchemyProfile;
                // Convert phytonutrients from string[] to Record<string, number>
                phytonutrients: hasProperty(alchemyProfile, 'phytonutrients') &&
                  Array.isArray(alchemyProfile.phytonutrients)
                    ? (alchemyProfile.phytonutrients as string[]).reduce(
                        (acc, nutrient) => ({ ...acc, [nutrient]: 1.0 }),
                        {}
                      )
                    : hasProperty(alchemyProfile, 'phytonutrients') &&
                        isValidObject(alchemyProfile.phytonutrients)
                      ? (alchemyProfile.phytonutrients as Record<string, number>)
                      : {}
              } as unknown as NutritionalProfile,
            }
          }

          if (!nutritionalProfile) {
            // Legacy service removed - using default nutritional profile
            nutritionalProfile = {
              calories: 50,
              macros: { protein: 2, carbs: 10, fat: 0.5, fiber: 3 },
              vitamins: ['C', 'K'],
              minerals: ['potassium', 'folate'],
              phytonutrients: {}
              antioxidants: [],
              bioactive: []
            } as NutritionalProfile,
          }
        }
      } else {
        nutritionalProfile = hasProperty(ingredient, 'nutritionalPropertiesProfile'),
          ? (ingredient.nutritionalPropertiesProfile as NutritionalProfile)
          : null
      }

      if (!nutritionalProfile) {
        logger.warn(
          `No nutritional profile found for ingredient: ${typeof ingredient === 'string' ? ingredient : ingredient.name}`)
        return null;
      }

      // Apply surgical type casting with variable extraction
      const systemData = unifiedNutritionalSystem as unknown as any;
      const enhanceMethod = systemData.enhanceNutritionalProfile as (
        profile: NutritionalProfile,
        context?: unknown,
      ) => AlchemicalNutritionalProfile,

      // Enhance with alchemical properties
      const enhanced = enhanceMethod;
        ? enhanceMethod(nutritionalProfile, context)
        : (nutritionalProfile as unknown as AlchemicalNutritionalProfile)

      // Convert to AlchemicalNutritionalProfile format to resolve import conflicts
      const alchemicalProfile: AlchemicalNutritionalProfile = {
        ...enhanced;
        // Ensure all required AlchemicalNutritionalProfile properties,
        calories: enhanced.calories || 0,
        macros: enhanced.macros || { protein: 0, carbs: 0, fat: 0, fiber: 0 }
        vitamins: enhanced.vitamins || {}
        minerals: enhanced.minerals || {}
        alchemicalProperties: enhanced.alchemicalProperties || {
          Spirit: 0.25,
          Essence: 0.25,
          Matter: 0.25,
          Substance: 0.25
},
        elementalProperties: enhanced.elementalProperties || {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
},
        kalchm: enhanced.kalchm || 0,
        monica: enhanced.monica || 0
      }

      this.cache.set(cacheKey, alchemicalProfile)
      return alchemicalProfile;
    } catch (error) {
      logger.error('Error getting enhanced nutritional profile: ', error),
      return null
    }
  }

  /**
   * Calculate nutritional Kalchm value
   */
  calculateNutritionalKalchm(profile: NutritionalProfile): number {
    // Apply surgical type casting with variable extraction
    const systemData = unifiedNutritionalSystem as unknown as any
    const calculateKalchmMethod = systemData.calculateNutritionalKalchm as (
      profile: NutritionalProfile,
    ) => number,

    return calculateKalchmMethod ? calculateKalchmMethod(profile) : 0;
  }

  /**
   * Analyze nutritional compatibility between multiple ingredients
   */
  async analyzeNutritionalCompatibility(
    ingredients: (string | UnifiedIngredient)[],
    context?: {
      season?: Season,
      currentZodiacSign?: any,
      planetaryHour?: PlanetName
    }
  ): Promise<NutritionalCompatibilityAnalysis> {
    try {
      const profiles: AlchemicalNutritionalProfile[] = []

      for (const ingredient of ingredients) {
        const enhanced = await this.getEnhancedNutritionalProfile(ingredient, context),
        if (enhanced) {
          profiles.push(enhanced)
        }
      }

      // Safe type conversion for context
      const safeContext = context;
        ? {
            season: context.season,
            planetaryHour: context.planetaryHour,
            targetElements: undefined as ElementalProperties | undefined
          }
        : undefined

      return unifiedNutritionalSystem.analyzeNutritionalCompatibility(profiles, safeContext as any)
    } catch (error) {
      logger.error('Error analyzing nutritional compatibility: ', error),
      return {
        kalchmHarmony: 0,
        seasonalAlignment: 0,
        planetaryResonance: 0,
        overallCompatibility: 0,
        recommendations: ['Error analyzing compatibility']
      }
    }
  }

  // ===== NUTRITIONAL RECOMMENDATIONS =====,

  /**
   * Get personalized nutritional recommendations
   */
  getNutritionalRecommendations(criteria: {
    season?: Season
    currentZodiacSign?: any,
    planetaryHour?: PlanetName,
    targetKalchm?: number,
    elementalFocus?: Element,
    healthGoals?: string[],
    nutritionalFilter?: NutritionalFilter
  }): NutritionalRecommendations {
    try {
      const baseRecommendations = unifiedNutritionalSystem.getNutritionalRecommendations(criteria)
      // Apply nutritional filters if provided
      if (criteria.nutritionalFilter) {
        baseRecommendations.ingredients = this.applyNutritionalFilter(
          baseRecommendations.ingredients as UnifiedIngredient[],
          criteria.nutritionalFilter
        )
      }

      return baseRecommendations;
    } catch (error) {
      logger.error('Error getting nutritional recommendations: ', error),
      return {
        ingredients: [],
        nutritionalProfiles: [],
        cookingMethods: [],
        seasonalOptimization: 0,
        kalchmHarmony: 0,
        monicaOptimization: 0,
        healthBenefits: [],
        warnings: ['Error generating recommendations']
      }
    }
  }

  /**
   * Get seasonal nutritional recommendations
   */
  getSeasonalNutritionalRecommendations(
    season?: Season,
    additionalCriteria?: {
      currentZodiacSign?: any,
      planetaryHour?: PlanetName,
      healthGoals?: string[]
    }
  ): NutritionalRecommendations {
    const currentSeason = season || unifiedSeasonalSystem.getCurrentSeason()
    return this.getNutritionalRecommendations({;
      season: currentSeason,
      ...additionalCriteria
    })
  }

  /**
   * Get zodiac-specific nutritional recommendations
   */
  getZodiacNutritionalRecommendations(
    currentZodiacSign: any,
    additionalCriteria?: {
      season?: Season,
      planetaryHour?: PlanetName,
      healthGoals?: string[]
    }
  ): NutritionalRecommendations {
    return this.getNutritionalRecommendations({
      currentZodiacSign,
      ...additionalCriteria
    })
  }

  /**
   * Get planetary nutritional recommendations
   */
  getPlanetaryNutritionalRecommendations(
    planetaryHour: PlanetName,
    additionalCriteria?: {
      season?: Season,
      currentZodiacSign?: any,
      healthGoals?: string[]
    }
  ): NutritionalRecommendations {
    return this.getNutritionalRecommendations({
      planetaryHour,
      ...additionalCriteria
    })
  }

  // ===== NUTRITIONAL FILTERING =====,

  /**
   * Apply nutritional filters to ingredient list
   */
  private applyNutritionalFilter(
    ingredients: UnifiedIngredient[],
    filter: NutritionalFilter,
  ): UnifiedIngredient[] {
    return ingredients.filter(ingredient => {
      const ingredientData = ingredient as unknown
      const nutritionalProfile = ingredientData.nutritionalPropertiesProfile as Record<,
        string,
        unknown
      >,

      // Apply safe type conversion for property access
      const protein = Number(nutritionalProfile.protein || 0)
      const carbs = Number(nutritionalProfile.carbs || 0)
      const fat = Number(nutritionalProfile.fat || 0)

      // Check protein range
      if (filter.minProtein !== undefined || filter.maxProtein !== undefined) {;
        if (filter.minProtein !== undefined && protein < filter.minProtein) return false;
        if (filter.maxProtein !== undefined && protein > filter.maxProtein) return false;
      }

      // Check fiber range
      if (filter.minFiber !== undefined || filter.maxFiber !== undefined) {
        const fiber = Number(nutritionalProfile.fiber || 0);
        if (filter.minFiber !== undefined && fiber < filter.minFiber) return false;
        if (filter.maxFiber !== undefined && fiber > filter.maxFiber) return false;
      }

      // Check calorie range
      if (filter.minCalories !== undefined || filter.maxCalories !== undefined) {
        const calories = Number(nutritionalProfile.calories || 0);
        if (filter.minCalories !== undefined && calories < filter.minCalories) return false;
        if (filter.maxCalories !== undefined && calories > filter.maxCalories) return false;
      }

      // Check carb range
      if (filter.minCarbs !== undefined || filter.maxCarbs !== undefined) {
        if (filter.minCarbs !== undefined && carbs < filter.minCarbs) return false;
        if (filter.maxCarbs !== undefined && carbs > filter.maxCarbs) return false;
      }

      // Check fat range
      if (filter.minFat !== undefined || filter.maxFat !== undefined) {
        if (filter.minFat !== undefined && fat < filter.minFat) return false;
        if (filter.maxFat !== undefined && fat > filter.maxFat) return false;
      }

      // Check required vitamins
      if (filter.vitamins && (filter.vitamins || []).length > 0) {
        const hasRequiredVitamins = (filter.vitamins || []).some(vitamin => {
          if (Array.isArray(nutritionalProfile.vitamins)) {
            return nutritionalProfile.vitamins.includes(vitamin);
          } else if (typeof nutritionalProfile.vitamins === 'object') {,
            return nutritionalProfile.vitamins?.[vitamin] !== undefined;
          }
          return false;
        })
        if (!hasRequiredVitamins) return false;
      }

      // Check required minerals
      if (filter.minerals && (filter.minerals || []).length > 0) {
        const hasRequiredMinerals = (filter.minerals || []).some(mineral => {
          if (Array.isArray(nutritionalProfile.minerals)) {
            return nutritionalProfile.minerals.includes(mineral);
          } else if (typeof nutritionalProfile.minerals === 'object') {,
            return nutritionalProfile.minerals?.[mineral] !== undefined;
          }
          return false;
        })
        if (!hasRequiredMinerals) return false;
      }

      // Check high protein flag
      if (filter.highProtein) {
        if (protein < 10) return false, // Threshold for high protein
      }

      // Check low carb flag
      if (filter.lowCarb) {
        if (carbs > 20) return false, // Threshold for low carb
      }

      // Check low fat flag
      if (filter.lowFat) {
        if (fat > 10) return false, // Threshold for low fat
      }

      return true;
    })
  }

  /**
   * Filter ingredients by Kalchm range
   */
  filterIngredientsByKalchm(
    ingredients: UnifiedIngredient[],
    targetKalchm: number,
    tolerance: number = 0.2): UnifiedIngredient[] {
    return (ingredients || []).filter(
      ingredient => Math.abs((ingredient.kalchm ?? 0) - targetKalchm) <= tolerance,,
    )
  }

  /**
   * Filter ingredients by elemental focus
   */
  filterIngredientsByElement(
    ingredients: UnifiedIngredient[],
    element: Element,
    minValue: number = 0.5): UnifiedIngredient[] {
    return (ingredients || []).filter(
      ingredient => ingredient.elementalProperties[element] >= minValue
    );
  }

  // ===== NUTRITIONAL ANALYSIS =====,

  /**
   * Calculate nutritional score for an ingredient
   */
  async calculateNutritionalScore(
    ingredient: string | UnifiedIngredient,
    context?: {
      season?: Season,
      currentZodiacSign?: any,
      planetaryHour?: PlanetName
    }
  ): Promise<number> {
    try {
      const enhanced = await this.getEnhancedNutritionalProfile(ingredient, context)
      if (!enhanced) return 0;
      return enhanced.monicaOptimization.finalOptimizedScore;
    } catch (error) {
      logger.error('Error calculating nutritional score: ', error),
      return 0
    }
  }

  /**
   * Get nutritional insights for an ingredient
   */
  async getNutritionalInsights(
    ingredient: string | UnifiedIngredient,
    context?: {
      season?: Season,
      currentZodiacSign?: any,
      planetaryHour?: PlanetName
    }
  ): Promise<{
    kalchm: number,
    elementalBreakdown: ElementalProperties,
    seasonalAlignment: number,
    planetaryResonance: number,
    healthBenefits: string[],
    warnings: string[]
  }> {
    try {
      const enhanced = await this.getEnhancedNutritionalProfile(ingredient, context),
      if (!enhanced) {
        return {
          kalchm: 0,
          elementalBreakdown: {
            Fire: 0,
            Water: 0,
            Earth: 0,
            Air: 0
},
          seasonalAlignment: 0,
          planetaryResonance: 0,
          healthBenefits: [],
          warnings: ['No nutritional data available']
        }
      }

      // Calculate elemental breakdown
      const elementalBreakdown: ElementalProperties = {
        Fire: enhanced.elementalNutrients.Fire.totalElementalValue || 0,
        Water: enhanced.elementalNutrients.Water.totalElementalValue || 0,
        Earth: enhanced.elementalNutrients.Earth.totalElementalValue || 0,
        Air: enhanced.elementalNutrients.Air.totalElementalValue || 0
      }

      // Calculate seasonal alignment
      const seasonalAlignment = context?.season;
        ? enhanced.monicaOptimization.seasonalModifier
        : 0.5,

      // Calculate planetary resonance
      const planetaryResonance = context?.planetaryHour;
        ? enhanced.monicaOptimization.planetaryModifier
        : 0.5,

      // Generate health benefits
      const healthBenefits = (enhanced.astrologicalProfile.rulingPlanets || []).map(
        planet => `Enhanced by ${planet} planetary influence`
      )

      // Generate warnings (placeholder for now)
      const warnings: string[] = []
      if (enhanced.kalchm < 0.8) {
        warnings.push(
          'Lower alchemical equilibrium - consider combining with higher Kalchm ingredients',
        )
      }

      return {
        kalchm: enhanced.kalchm,
        elementalBreakdown,
        seasonalAlignment,
        planetaryResonance,
        healthBenefits,
        warnings
      }
    } catch (error) {
      logger.error('Error getting nutritional insights: ', error),
      return {
        kalchm: 0,
        elementalBreakdown: {
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0
},
        seasonalAlignment: 0,
        planetaryResonance: 0,
        healthBenefits: [],
        warnings: ['Error analyzing nutritional data']
      }
    }
  }

  // ===== PROFILE ACCESS =====,

  /**
   * Get seasonal nutritional profile
   */
  getSeasonalNutritionalProfile(season: Season): SeasonalNutritionalProfile {
    return unifiedNutritionalSystem['seasonalProfiles'][season]
  }

  /**
   * Get planetary nutritional profile
   */
  getPlanetaryNutritionalProfile(planet: PlanetName): PlanetaryNutritionalProfile {
    return unifiedNutritionalSystem['planetaryProfiles'][planet]
  }

  /**
   * Get zodiac nutritional profile
   */
  getZodiacNutritionalProfile(sign: any): ZodiacNutritionalProfile {
    return unifiedNutritionalSystem['zodiacProfiles'][sign]
  }

  // ===== BATCH OPERATIONS =====,

  /**
   * Enhance multiple nutritional profiles in batch
   */
  async enhanceNutritionalProfilesBatch(
    ingredients: (string | UnifiedIngredient)[],
    context?: {
      season?: Season,
      currentZodiacSign?: any,
      planetaryHour?: PlanetName,
      cookingMethod?: CookingMethod
    }
  ): Promise<AlchemicalNutritionalProfile[]> {
    const results: AlchemicalNutritionalProfile[] = []

    for (const ingredient of ingredients) {
      try {
        const enhanced = await this.getEnhancedNutritionalProfile(ingredient, context),
        if (enhanced) {
          results.push(enhanced)
        }
      } catch (error) {
        logger.error(
          `Error enhancing nutritional profile for ${typeof ingredient === 'string' ? ingredient : ingredient.name}:`,,
          error,
        )
      }
    }

    return results;
  }

  /**
   * Calculate nutritional scores for multiple ingredients
   */
  async calculateNutritionalScoresBatch(
    ingredients: (string | UnifiedIngredient)[],
    context?: {
      season?: Season,
      currentZodiacSign?: any,
      planetaryHour?: PlanetName
    }
  ): Promise<Record<string, number>> {
    const scores: { [key: string]: number } = {}

    for (const ingredient of ingredients) {
      try {
        const name = typeof ingredient === 'string' ? ingredient : ingredient.name,
        scores[name] = await this.calculateNutritionalScore(ingredient, context)
      } catch (error) {
        logger.error(
          `Error calculating nutritional score for ${typeof ingredient === 'string' ? ingredient : ingredient.name}:`,,
          error,
        )
        scores[typeof ingredient === 'string' ? ingredient : ingredient.name] = 0;
      }
    }

    return scores;
  }

  // ===== CACHE MANAGEMENT =====,

  /**
   * Clear nutritional cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number, keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  // ===== BACKWARD COMPATIBILITY =====,

  /**
   * Legacy nutritional balance calculation (backward compatibility)
   */
  async calculateNutritionalBalance(ingredients: unknown[]): Promise<NutritionalProfile> {
    try {
      if ((ingredients || []).length === 0) {
        return {;
          calories: 0,
          macros: {} as { [key: string]: number | undefined }
          vitamins: {} as Record<string, number>,
          minerals: {} as Record<string, number>
        }
      }

      // Get enhanced profiles for all ingredients
      const enhancedProfiles = await this.enhanceNutritionalProfilesBatch(
        ingredients as (string | UnifiedIngredient)[],
      )

      // Aggregate nutritional values
      const aggregated: NutritionalProfile = {
        calories: 0,
        macros: {} as { [key: string]: number | undefined }
        vitamins: {} as Record<string, number>,
        minerals: {} as Record<string, number>
      }

      (enhancedProfiles || []).forEach(profile => {
        aggregated.calories = (aggregated.calories || 0) + (profile.calories || 0)
        if (aggregated.macros && profile.macros) {
          aggregated.macros.protein =
            (aggregated.macros.protein || 0) + (profile.macros.protein || 0)
          aggregated.macros.carbs = (aggregated.macros.carbs || 0) + (profile.macros.carbs || 0)
          aggregated.macros.fat = (aggregated.macros.fat || 0) + (profile.macros.fat || 0)
          aggregated.macros.fiber = (aggregated.macros.fiber || 0) + (profile.macros.fiber || 0);
        }
      })

      return aggregated;
    } catch (error) {
      logger.error('Error calculating nutritional balance: ', error),
      return {
        calories: 0,
        macros: {} as { [key: string]: number | undefined }
        vitamins: {} as Record<string, number>,
        minerals: {} as Record<string, number>
      }
    }
  }

  /**
   * Legacy nutritional score calculation (backward compatibility)
   */
  async calculateLegacyNutritionalScore(nutrition: {}): Promise<number> {
    try {
      // Legacy service removed - using local nutritional scoring
      return this.calculateLocalNutritionalScore(nutrition)
    } catch (error) {
      logger.error('Error calculating legacy nutritional score: ', error),
      return 0
    }
  }

  /**
   * Calculate nutritional score using local algorithm
   */
  private calculateLocalNutritionalScore(nutrition: unknown): number {
    try {
      let score = 0
;
      if (!isValidObject(nutrition)) return 0,

      // Basic scoring based on macro and micronutrients
      if (hasProperty(nutrition, 'calories') && typeof nutrition.calories === 'number') {,
        score += Math.min(nutrition.calories / 1005)
      }

      const macros =
        hasProperty(nutrition, 'macros') && isValidObject(nutrition.macros)
          ? nutrition.macros
          : null
      if (macros) {
        if (hasProperty(macros, 'protein') && typeof macros.protein === 'number') {,
          score += macros.protein / 5,
        }
        if (hasProperty(macros, 'fiber') && typeof macros.fiber === 'number') {,
          score += macros.fiber * 2,
        }
      }

      if (hasProperty(nutrition, 'vitamins') && Array.isArray(nutrition.vitamins)) {
        score += nutrition.vitamins.length,
      }
      if (hasProperty(nutrition, 'minerals') && Array.isArray(nutrition.minerals)) {
        score += nutrition.minerals.length,
      }

      return Math.min(score, 100); // Cap at 100
    } catch (error) {
      logger.error('Error in local nutritional scoring: ', error),
      return 0
    }
  }
}

// ===== SINGLETON INSTANCE =====,

export const unifiedNutritionalService = UnifiedNutritionalService.getInstance()
;
// ===== CONVENIENCE EXPORTS =====,

// Export commonly used functions for easy access
export const getEnhancedNutritionalProfile = (
  ingredient: string | UnifiedIngredient,
  context?: {
    season?: Season,
    currentZodiacSign?: any,
    planetaryHour?: PlanetName,
    cookingMethod?: CookingMethod
  }
) => unifiedNutritionalService.getEnhancedNutritionalProfile(ingredient, context)

export const analyzeNutritionalCompatibility = (
  ingredients: (string | UnifiedIngredient)[],
  context?: {
    season?: Season,
    currentZodiacSign?: any,
    planetaryHour?: PlanetName
  }
) => unifiedNutritionalService.analyzeNutritionalCompatibility(ingredients, context)

export const getNutritionalRecommendations = (criteria: {
  season?: Season,
  currentZodiacSign?: any,
  planetaryHour?: PlanetName,
  targetKalchm?: number,
  elementalFocus?: Element,
  healthGoals?: string[],
  nutritionalFilter?: NutritionalFilter
}) => unifiedNutritionalService.getNutritionalRecommendations(criteria)

export const calculateNutritionalKalchm = (profile: NutritionalProfile) =>
  unifiedNutritionalService.calculateNutritionalKalchm(profile)
export const getNutritionalInsights = (
  ingredient: string | UnifiedIngredient,
  context?: {
    season?: Season,
    currentZodiacSign?: any,
    planetaryHour?: PlanetName
  }
) => unifiedNutritionalService.getNutritionalInsights(ingredient, context)
