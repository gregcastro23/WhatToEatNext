import type { // ===== UNIFIED NUTRITIONAL SERVICE =====
// Phase 3 Step 4 of WhatToEatNext Data Consolidation
// Service layer for unified nutritional system with comprehensive API
// Integrates with all unified systems and provides backward compatibility

  Element, 
  ElementalProperties, 
  ZodiacSign, 
  PlanetName,
  Season,
  CookingMethod } from '@/types/alchemy';
import type { NutritionalProfile, NutritionalFilter } from '../types/nutrition';
import { NutritionService } from './NutritionService';
import { 
  unifiedNutritionalSystem,
  type AlchemicalNutritionalProfile,
  type NutritionalCompatibilityAnalysis,
  type NutritionalRecommendations,
  type SeasonalNutritionalProfile,
  type PlanetaryNutritionalProfile,
  type ZodiacNutritionalProfile
} from '../data/unified/nutritional';
import { unifiedIngredients, type UnifiedIngredient } from '@/data/unified/ingredients';
import { unifiedSeasonalSystem } from '../data/unified/seasonal.js';
import { logger } from '../utils/logger';
import { allIngredients } from '../data/ingredients';



// ===== UNIFIED NUTRITIONAL SERVICE CLASS =====

export class UnifiedNutritionalService {
  private static instance: UnifiedNutritionalService;
  private legacyNutritionService: NutritionService;
  private cache: Map<string, any> = new Map();
  
  private constructor() {
    // Apply Pattern PP-1: Safe service initialization
    const NutritionServiceData = NutritionService as unknown;
    this.legacyNutritionService = NutritionServiceData?.getInstance?.() || new NutritionService();
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
  
  // ===== ENHANCED NUTRITIONAL PROFILE OPERATIONS =====
  
  /**
   * Get enhanced nutritional profile with alchemical properties
   */
  async getEnhancedNutritionalProfile(
    ingredient: string | UnifiedIngredient,
    context?: {
      season?: Season;
      currentZodiacSign?: ZodiacSign;
      planetaryHour?: PlanetName;
      cookingMethod?: CookingMethod;
    }
  ): Promise<AlchemicalNutritionalProfile | null> {
    try {
      const cacheKey = `enhanced_${typeof ingredient === 'string' ? ingredient : ingredient.name}_${JSON.stringify(context)}`;
      
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }
      
      let nutritionalProfile: NutritionalProfile | null = null;
      
      // Get base nutritional profile
      if (typeof ingredient === 'string') {
        // Try unified ingredients first, but fallback to regular ingredients
        const unifiedIngredient = unifiedIngredients[ingredient];
        if (unifiedIngredient?.nutritionalProfile) {
          nutritionalProfile = unifiedIngredient.nutritionalProfile;
        } else {
          // Fallback to regular ingredients
          const regularIngredient = allIngredients[ingredient];
          if (regularIngredient?.nutritionalProfile) {
            nutritionalProfile = regularIngredient.nutritionalProfile as unknown as NutritionalProfile;
          }
          
          if (!nutritionalProfile) {
            // Fallback to legacy service
            nutritionalProfile = await this.legacyNutritionService.getNutritionalProfile(ingredient);
          }
        }
      } else {
        nutritionalProfile = ingredient.nutritionalPropertiesProfile || null;
      }
      
      if (!nutritionalProfile) {
        logger.warn(`No nutritional profile found for ingredient: ${typeof ingredient === 'string' ? ingredient : ingredient.name}`);
        return null;
      }
      
      // Apply surgical type casting with variable extraction
      const systemData = unifiedNutritionalSystem as unknown;
      const enhanceMethod = systemData?.enhanceNutritionalProfile;
      
      // Enhance with alchemical properties
      const enhanced = enhanceMethod ? enhanceMethod(nutritionalProfile, context) as unknown as AlchemicalNutritionalProfile : nutritionalProfile as unknown as AlchemicalNutritionalProfile;
      
      // Convert to AlchemicalNutritionalProfile format to resolve import conflicts
      const alchemicalProfile: AlchemicalNutritionalProfile = {
        ...enhanced,
        // Ensure all required AlchemicalNutritionalProfile properties
        calories: enhanced.calories || 0,
        macros: enhanced.macros || { protein: 0, carbs: 0, fat: 0, fiber: 0 },
        vitamins: enhanced.vitamins || {},
        minerals: enhanced.minerals || {},
        alchemicalProperties: enhanced.alchemicalProperties || { Spirit: 0.25, Essence: 0.25, Matter: 0.25, Substance: 0.25 },
        elementalProperties: enhanced.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
        kalchm: enhanced.kalchm || 0,
        monica: enhanced.monica || 0
      };
      
      this.cache.set(cacheKey, alchemicalProfile);
      return alchemicalProfile;
      
    } catch (error) {
      logger.error('Error getting enhanced nutritional profile:', error);
      return null;
    }
  }
  
  /**
   * Calculate nutritional Kalchm value
   */
  calculateNutritionalKalchm(profile: NutritionalProfile): number {
    // Apply surgical type casting with variable extraction
    const systemData = unifiedNutritionalSystem as unknown;
    const calculateKalchmMethod = systemData?.calculateNutritionalKalchm;
    
    return calculateKalchmMethod ? calculateKalchmMethod(profile) : 0;
  }
  
  /**
   * Analyze nutritional compatibility between multiple ingredients
   */
  async analyzeNutritionalCompatibility(
    ingredients: (string | UnifiedIngredient)[],
    context?: {
      season?: Season;
      currentZodiacSign?: ZodiacSign;
      planetaryHour?: PlanetName;
    }
  ): Promise<NutritionalCompatibilityAnalysis> {
    try {
      const profiles: AlchemicalNutritionalProfile[] = [];
      
      for (const ingredient of ingredients) {
        const enhanced = await this.getEnhancedNutritionalProfile(ingredient, context);
        if (enhanced) {
          profiles?.push(enhanced);
        }
      }
      
      return unifiedNutritionalSystem.analyzeNutritionalCompatibility(profiles, context) as unknown;
      
    } catch (error) {
      logger.error('Error analyzing nutritional compatibility:', error);
      return {
        kalchmHarmony: 0,seasonalAlignment: 0,
        planetaryResonance: 0,
        overallCompatibility: 0,
        recommendations: ['Error analyzing compatibility']
      };
    }
  }
  
  // ===== NUTRITIONAL RECOMMENDATIONS =====
  
  /**
   * Get personalized nutritional recommendations
   */
  getNutritionalRecommendations(criteria: {
    season?: Season;
    currentZodiacSign?: ZodiacSign;
    planetaryHour?: PlanetName;
    targetKalchm?: number;
    elementalFocus?: Element;
    healthGoals?: string[];
    nutritionalFilter?: NutritionalFilter;
  }): NutritionalRecommendations {
    try {
      const baseRecommendations = unifiedNutritionalSystem.getNutritionalRecommendations(criteria);
      
      // Apply nutritional filters if provided
      if (criteria.nutritionalFilter) {
        baseRecommendations.ingredients = this.applyNutritionalFilter(
          baseRecommendations.ingredients,
          criteria.nutritionalFilter
        );
      }
      
      return baseRecommendations;
      
    } catch (error) {
      logger.error('Error getting nutritional recommendations:', error);
      return {
        ingredients: [],
        nutritionalProfiles: [],
        cookingMethods: [],
        seasonalOptimization: 0,
        kalchmHarmony: 0,
        monicaOptimization: 0,
        healthBenefits: [],
        warnings: ['Error generating recommendations']
      };
    }
  }
  
  /**
   * Get seasonal nutritional recommendations
   */
  getSeasonalNutritionalRecommendations(
    season?: Season,
    additionalCriteria?: {
      currentZodiacSign?: ZodiacSign;
      planetaryHour?: PlanetName;
      healthGoals?: string[];
    }
  ): NutritionalRecommendations {
    const currentSeason = season || unifiedSeasonalSystem.getCurrentSeason();
    
    return this.getNutritionalRecommendations({
      season: currentSeason,
      ...additionalCriteria
    });
  }
  
  /**
   * Get zodiac-specific nutritional recommendations
   */
  getZodiacNutritionalRecommendations(
    currentZodiacSign: ZodiacSign,
    additionalCriteria?: {
      season?: Season;
      planetaryHour?: PlanetName;
      healthGoals?: string[];
    }
  ): NutritionalRecommendations {
    return this.getNutritionalRecommendations({
      currentZodiacSign,
      ...additionalCriteria
    });
  }
  
  /**
   * Get planetary nutritional recommendations
   */
  getPlanetaryNutritionalRecommendations(
    planetaryHour: PlanetName,
    additionalCriteria?: {
      season?: Season;
      currentZodiacSign?: ZodiacSign;
      healthGoals?: string[];
    }
  ): NutritionalRecommendations {
    return this.getNutritionalRecommendations({
      planetaryHour,
      ...additionalCriteria
    });
  }
  
  // ===== NUTRITIONAL FILTERING =====
  
  /**
   * Apply nutritional filters to ingredient list
   */
  private applyNutritionalFilter(
    ingredients: UnifiedIngredient[],
    filter: NutritionalFilter
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(ingredient => {
      const nutritionalProfile = ingredient.nutritionalPropertiesProfile;
      if (!nutritionalProfile) return false;
      
      // Check protein range
      if (filter.minProtein !== undefined || filter.maxProtein !== undefined) {
        const protein = (nutritionalProfile as unknown).protein || (nutritionalProfile as any)?.macros?.protein || 0;
        if (filter.minProtein !== undefined && protein < filter.minProtein) return false;
        if (filter.maxProtein !== undefined && protein > filter.maxProtein) return false;
      }
      
      // Check fiber range
      if (filter.minFiber !== undefined || filter.maxFiber !== undefined) {
        const fiber = (nutritionalProfile as unknown).fiber || (nutritionalProfile as any)?.macros?.fiber || 0;
        if (filter.minFiber !== undefined && fiber < filter.minFiber) return false;
        if (filter.maxFiber !== undefined && fiber > filter.maxFiber) return false;
      }
      
      // Check calorie range
      if (filter.minCalories !== undefined || filter.maxCalories !== undefined) {
        const calories = nutritionalProfile.calories || 0;
        if (filter.minCalories !== undefined && calories < filter.minCalories) return false;
        if (filter.maxCalories !== undefined && calories > filter.maxCalories) return false;
      }
      
      // Check carb range
      if (filter.minCarbs !== undefined || filter.maxCarbs !== undefined) {
        const carbs = (nutritionalProfile as unknown).carbs || (nutritionalProfile as any)?.macros?.carbs || 0;
        if (filter.minCarbs !== undefined && carbs < filter.minCarbs) return false;
        if (filter.maxCarbs !== undefined && carbs > filter.maxCarbs) return false;
      }
      
      // Check fat range
      if (filter.minFat !== undefined || filter.maxFat !== undefined) {
        const fat = (nutritionalProfile as unknown).fat || (nutritionalProfile as any)?.macros?.fat || 0;
        if (filter.minFat !== undefined && fat < filter.minFat) return false;
        if (filter.maxFat !== undefined && fat > filter.maxFat) return false;
      }
      
      // Check required vitamins
      if (filter.vitamins && (filter.vitamins || []).length > 0) {
        const hasRequiredVitamins = (filter.vitamins || []).some(vitamin => {
          if (Array.isArray(nutritionalProfile.vitamins)) {
            return nutritionalProfile.vitamins.includes(vitamin);
          } else if (typeof nutritionalProfile.vitamins === 'object') {
            return nutritionalProfile?.vitamins?.[vitamin] !== undefined;
          }
          return false;
        });
        if (!hasRequiredVitamins) return false;
      }
      
      // Check required minerals
      if (filter.minerals && (filter.minerals || []).length > 0) {
        const hasRequiredMinerals = (filter.minerals || []).some(mineral => {
          if (Array.isArray(nutritionalProfile.minerals)) {
            return nutritionalProfile.minerals.includes(mineral);
          } else if (typeof nutritionalProfile.minerals === 'object') {
            return nutritionalProfile?.minerals?.[mineral] !== undefined;
          }
          return false;
        });
        if (!hasRequiredMinerals) return false;
      }
      
      // Check high protein flag
      if (filter.highProtein) {
        const protein = (nutritionalProfile as unknown).protein || (nutritionalProfile as any)?.macros?.protein || 0;
        if (protein < 10) return false; // Threshold for high protein
      }
      
      // Check low carb flag
      if (filter.lowCarb) {
        const carbs = (nutritionalProfile as unknown).carbs || (nutritionalProfile as any)?.macros?.carbs || 0;
        if (carbs > 20) return false; // Threshold for low carb
      }
      
      // Check low fat flag
      if (filter.lowFat) {
        const fat = (nutritionalProfile as unknown).fat || (nutritionalProfile as any)?.macros?.fat || 0;
        if (fat > 10) return false; // Threshold for low fat
      }
      
      return true;
    });
  }
  
  /**
   * Filter ingredients by Kalchm range
   */
  filterIngredientsByKalchm(
    ingredients: UnifiedIngredient[],
    targetKalchm: number,
    tolerance: number = 0.2
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(ingredient => 
      Math.abs(ingredient.kalchm - targetKalchm) <= tolerance
    );
  }
  
  /**
   * Filter ingredients by elemental focus
   */
  filterIngredientsByElement(
    ingredients: UnifiedIngredient[],
    element: Element,
    minValue: number = 0.5
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(ingredient => 
      ingredient?.elementalPropertiesState?.[element] >= minValue
    );
  }
  
  // ===== NUTRITIONAL ANALYSIS =====
  
  /**
   * Calculate nutritional score for an ingredient
   */
  async calculateNutritionalScore(
    ingredient: string | UnifiedIngredient,
    context?: {
      season?: Season;
      currentZodiacSign?: ZodiacSign;
      planetaryHour?: PlanetName;
    }
  ): Promise<number> {
    try {
      const enhanced = await this.getEnhancedNutritionalProfile(ingredient, context);
      if (!enhanced) return 0;
      
      return enhanced.monicaOptimization.finalOptimizedScore;
      
    } catch (error) {
      logger.error('Error calculating nutritional score:', error);
      return 0;
    }
  }
  
  /**
   * Get nutritional insights for an ingredient
   */
  async getNutritionalInsights(
    ingredient: string | UnifiedIngredient,
    context?: {
      season?: Season;
      currentZodiacSign?: ZodiacSign;
      planetaryHour?: PlanetName;
    }
  ): Promise< {
    kalchm: number;
    elementalBreakdown: ElementalProperties;
    seasonalAlignment: number;
    planetaryResonance: number;
    healthBenefits: string[];
    warnings: string[];
  }> {
    try {
      const enhanced = await this.getEnhancedNutritionalProfile(ingredient, context);
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
        };
      }
      
      // Calculate elemental breakdown
      const elementalBreakdown: ElementalProperties = { 
        Fire: enhanced?.elementalNutrients?.Fire?.totalElementalValue || 0, 
        Water: enhanced?.elementalNutrients?.Water?.totalElementalValue || 0, 
        Earth: enhanced?.elementalNutrients?.Earth?.totalElementalValue || 0, 
        Air: enhanced?.elementalNutrients?.Air?.totalElementalValue || 0
      };
      
      // Calculate seasonal alignment
      const seasonalAlignment = context?.season ? enhanced.monicaOptimization.seasonalModifier : 0.5;
      
      // Calculate planetary resonance
      const planetaryResonance = context?.planetaryHour ? enhanced.monicaOptimization.planetaryModifier : 0.5;
      
      // Generate health benefits
      const healthBenefits = (enhanced?.astrologicalProfile?.rulingPlanets || []).map(planet => 
        `Enhanced by ${planet} planetary influence`
      );
      
      // Generate warnings (placeholder for now)
      const warnings: string[] = [];
      if (enhanced.kalchm < 0.8) {
        warnings?.push('Lower alchemical equilibrium - consider combining with higher Kalchm ingredients');
      }
      
      return {
        kalchm: enhanced.kalchm,
        elementalBreakdown,
        seasonalAlignment,
        planetaryResonance,
        healthBenefits,
        warnings
      };
      
    } catch (error) {
      logger.error('Error getting nutritional insights:', error);
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
      };
    }
  }
  
  // ===== PROFILE ACCESS =====
  
  /**
   * Get seasonal nutritional profile
   */
  getSeasonalNutritionalProfile(season: Season): SeasonalNutritionalProfile {
    return unifiedNutritionalSystem['seasonalProfiles'][season];
  }
  
  /**
   * Get planetary nutritional profile
   */
  getPlanetaryNutritionalProfile(planet: PlanetName): PlanetaryNutritionalProfile {
    return unifiedNutritionalSystem['planetaryProfiles'][planet];
  }
  
  /**
   * Get zodiac nutritional profile
   */
  getZodiacNutritionalProfile(sign: ZodiacSign): ZodiacNutritionalProfile {
    return unifiedNutritionalSystem['zodiacProfiles'][sign];
  }
  
  // ===== BATCH OPERATIONS =====
  
  /**
   * Enhance multiple nutritional profiles in batch
   */
  async enhanceNutritionalProfilesBatch(
    ingredients: (string | UnifiedIngredient)[],
    context?: {
      season?: Season;
      currentZodiacSign?: ZodiacSign;
      planetaryHour?: PlanetName;
      cookingMethod?: CookingMethod;
    }
  ): Promise<AlchemicalNutritionalProfile[]> {
    const results: AlchemicalNutritionalProfile[] = [];
    
    for (const ingredient of ingredients) {
      try {
        const enhanced = await this.getEnhancedNutritionalProfile(ingredient, context);
        if (enhanced) {
          results?.push(enhanced);
        }
      } catch (error) {
        logger.error(`Error enhancing nutritional profile for ${typeof ingredient === 'string' ? ingredient : ingredient.name}:`, error);
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
      season?: Season;
      currentZodiacSign?: ZodiacSign;
      planetaryHour?: PlanetName;
    }
  ): Promise<Record<string, number>> {
    const scores: { [key: string]: number } = {};
    
    for (const ingredient of ingredients) {
      try {
        const name = typeof ingredient === 'string' ? ingredient : ingredient.name;
        scores[name] = await this.calculateNutritionalScore(ingredient, context);
      } catch (error) {
        logger.error(`Error calculating nutritional score for ${typeof ingredient === 'string' ? ingredient : ingredient.name}:`, error);
        scores[typeof ingredient === 'string' ? ingredient : ingredient.name] = 0;
      }
    }
    
    return scores;
  }
  
  // ===== CACHE MANAGEMENT =====
  
  /**
   * Clear nutritional cache
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
  
  // ===== BACKWARD COMPATIBILITY =====
  
  /**
   * Legacy nutritional balance calculation (backward compatibility)
   */
  async calculateNutritionalBalance(ingredients: unknown[]): Promise<NutritionalProfile> {
    try {
              if ((ingredients || []).length === 0) {
        return {
          calories: 0,
          macros: {},
          vitamins: {},
          minerals: {}
        };
      }
      
      // Get enhanced profiles for all ingredients
      const enhancedProfiles = await this.enhanceNutritionalProfilesBatch(ingredients);
      
      // Aggregate nutritional values
      const aggregated: NutritionalProfile = {
        calories: 0,
        macros: {},
        vitamins: {},
        minerals: {}
      };
      
      (enhancedProfiles || []).forEach(profile => {
        aggregated.calories = (aggregated.calories || 0) + (profile.calories || 0);
        if (aggregated.macros && profile.macros) {
          aggregated.macros.protein = (aggregated.macros.protein || 0) + (profile.macros.protein || 0);
          aggregated.macros.carbs = (aggregated.macros.carbs || 0) + (profile.macros.carbs || 0);
          aggregated.macros.fat = (aggregated.macros.fat || 0) + (profile.macros.fat || 0);
          aggregated.macros.fiber = (aggregated.macros.fiber || 0) + (profile.macros.fiber || 0);
        }
      });
      
      return aggregated;
      
    } catch (error) {
      logger.error('Error calculating nutritional balance:', error);
      return {
        calories: 0,
        macros: {},
        vitamins: {},
        minerals: {}
      };
    }
  }
  
  /**
   * Legacy nutritional score calculation (backward compatibility)
   */
  async calculateLegacyNutritionalScore(nutrition: {}): Promise<number>  {
    try {
      // Apply Pattern PP-1: Safe service method access
      const legacyServiceData = this.legacyNutritionService as unknown;
      if (legacyServiceData?.calculateNutritionalScore) {
        return legacyServiceData.calculateNutritionalScore(nutrition);
      }
      return 0;
    } catch (error) {
      logger.error('Error calculating legacy nutritional score:', error);
      return 0;
    }
  }
}

// ===== SINGLETON INSTANCE =====

export const unifiedNutritionalService = UnifiedNutritionalService.getInstance();

// ===== CONVENIENCE EXPORTS =====

// Export commonly used functions for easy access
export const getEnhancedNutritionalProfile = (
  ingredient: string | UnifiedIngredient,
  context?: {
    season?: Season;
    currentZodiacSign?: ZodiacSign;
    planetaryHour?: PlanetName;
    cookingMethod?: CookingMethod;
  }
) => unifiedNutritionalService.getEnhancedNutritionalProfile(ingredient, context);

export const analyzeNutritionalCompatibility = (
  ingredients: (string | UnifiedIngredient)[],
  context?: {
    season?: Season;
    currentZodiacSign?: ZodiacSign;
    planetaryHour?: PlanetName;
  }
) => unifiedNutritionalService.analyzeNutritionalCompatibility(ingredients, context);

export const getNutritionalRecommendations = (criteria: {
  season?: Season;
  currentZodiacSign?: ZodiacSign;
  planetaryHour?: PlanetName;
  targetKalchm?: number;
  elementalFocus?: Element;
  healthGoals?: string[];
  nutritionalFilter?: NutritionalFilter;
}) => unifiedNutritionalService.getNutritionalRecommendations(criteria);

export const calculateNutritionalKalchm = (profile: NutritionalProfile) => 
  unifiedNutritionalService.calculateNutritionalKalchm(profile);

export const getNutritionalInsights = (
  ingredient: string | UnifiedIngredient,
  context?: {
    season?: Season;
    currentZodiacSign?: ZodiacSign;
    planetaryHour?: PlanetName;
  }
) => unifiedNutritionalService.getNutritionalInsights(ingredient, context); 