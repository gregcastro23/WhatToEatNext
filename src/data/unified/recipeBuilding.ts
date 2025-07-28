// ===== UNIFIED RECIPE BUILDING SYSTEM =====
// Phase 3 Step 3 of WhatToEatNext Data Consolidation
// Enhances recipe building with Monica/Kalchm optimization, seasonal adaptation,
// cuisine integration, and enhanced recipe intelligence

import { unifiedSeasonalSystem } from '@/data/integrations/seasonal';
import { UnifiedIngredient } from '@/data/unified/unifiedTypes';
import type { 
  Season, 
  ElementalProperties, 
  ZodiacSign, 
  PlanetName,
  LunarPhase
} from "@/types/alchemy";

import { 
  getAllEnhancedCookingMethods, 
  type EnhancedCookingMethod 
} from '../../constants/alchemicalPillars';

import { 
  unifiedCuisineIntegrationSystem, 
  type CuisineIngredientAnalysis
} from './cuisineIntegrations.js';
import { 
  RecipeEnhancer, 
  type EnhancedRecipe 
} from './recipes';
import { SeasonalRecommendations } from './seasonal';




// ===== ENHANCED RECIPE BUILDING INTERFACES =====

export interface RecipeBuildingCriteria {
  // Core Requirements
  cuisine?: string;
  season?: Season;
  currentSeason?: Season; // For seasonal adaptation
  mealType?: string[];
  servings?: number;
  
  // Dietary Restrictions
  dietaryRestrictions?: string[];
  allergens?: string[];
  
  // Alchemical Preferences
  targetKalchm?: number;
  kalchmTolerance?: number;
  targetMonica?: number;
  elementalPreference?: Partial<ElementalProperties>;
  zodiacSign?: ZodiacSign;
  
  // Cooking Preferences
  cookingMethods?: string[];
  maxPrepTime?: number;
  maxCookTime?: number;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  
  // Ingredient Preferences
  requiredIngredients?: string[];
  excludedIngredients?: string[];
  preferredIngredients?: string[];
  
  // Astrological Preferences
  planetaryHour?: PlanetName;
  lunarPhase?: LunarPhase;
  currentZodiacSign?: ZodiacSign;
}

export interface MonicaOptimizedRecipe extends EnhancedRecipe {
  monicaOptimization: {
    originalMonica: number | null;
    optimizedMonica: number;
    optimizationScore: number;
    temperatureAdjustments: number[];
    timingAdjustments: number[];
    intensityModifications: string[];
    planetaryTimingRecommendations: string[];
  };
  
  seasonalAdaptation: {
    currentSeason: Season;
    seasonalScore: number;
    seasonalIngredientSubstitutions: Array<{
      original: string;
      seasonal: string;
      reason: string;
      seasonalScore: number;
    }>;
    seasonalCookingMethodAdjustments: Array<{
      method: string;
      adjustment: string;
      reason: string;
    }>;
  };
  
  cuisineIntegration: {
    authenticity: number;
    fusionPotential: number;
    culturalNotes: string[];
    traditionalVariations: string[];
    modernAdaptations: string[];
  };
  
  nutritionalOptimization: {
    alchemicalNutrition: {
      spiritNutrients: string[];
      essenceNutrients: string[];
      matterNutrients: string[];
      substanceNutrients: string[];
    };
    elementalNutrition: ElementalProperties;
    kalchmNutritionalBalance: number;
    monicaNutritionalHarmony: number;
  };
}

export interface RecipeGenerationResult {
  recipe: MonicaOptimizedRecipe;
  confidence: number;
  alternatives: MonicaOptimizedRecipe[];
  generationMetadata: {
    criteriaMatched: number;
    totalCriteria: number;
    kalchmAccuracy: number;
    monicaOptimization: number;
    seasonalAlignment: number;
    cuisineAuthenticity: number;
    generatedAt: string;
    generationMethod: string;
  };
}

export interface SeasonalRecipeAdaptation {
  originalRecipe: EnhancedRecipe;
  adaptedRecipe: MonicaOptimizedRecipe;
  adaptationChanges: {
    ingredientSubstitutions: Array<{
      original: string;
      substitute: string;
      reason: string;
      seasonalImprovement: number;
    }>;
    cookingMethodAdjustments: Array<{
      original: string;
      adjusted: string;
      reason: string;
      seasonalBenefit: string;
    }>;
    timingAdjustments: {
      prepTimeChange: number;
      cookTimeChange: number;
      restTimeChange: number;
      reason: string;
    };
    temperatureAdjustments: {
      temperatureChange: number;
      reason: string;
      seasonalBenefit: string;
    };
  };
  seasonalScore: number;
  kalchmImprovement: number;
  monicaImprovement: number;
}

export interface FusionRecipeProfile {
  fusionRecipe: MonicaOptimizedRecipe;
  parentCuisines: string[];
  fusionRatio: { [key: string]: number };
  fusionIngredients: Array<{
    ingredient: UnifiedIngredient;
    sourceCuisine: string;
    fusionRole: 'base' | 'accent' | 'bridge' | 'innovation';
  }>;
  fusionCookingMethods: Array<{
    method: EnhancedCookingMethod;
    sourceCuisine: string;
    fusionApplication: string;
  }>;
  culturalHarmony: number;
  kalchmFusionBalance: number;
  monicaFusionOptimization: number;
  innovationScore: number;
}

export interface PlanetaryRecipeRecommendation {
  recipe: MonicaOptimizedRecipe;
  planetaryAlignment: {
    currentPlanetaryHour: PlanetName;
    planetaryCompatibility: number;
    lunarPhaseAlignment: number;
    zodiacHarmony: number;
    astrologicalScore: number;
  };
  optimalCookingTime: {
    startTime: string;
    duration: string;
    planetaryWindow: string;
    lunarConsiderations: string;
  };
  energeticProfile: {
    spiritualEnergy: number;
    emotionalResonance: number;
    physicalVitality: number;
    mentalClarity: number;
  };
}

// ===== UNIFIED RECIPE BUILDING SYSTEM =====

export class UnifiedRecipeBuildingSystem {
  public seasonalSystem = unifiedSeasonalSystem;
  public cuisineSystem = unifiedCuisineIntegrationSystem;
  private enhancedCookingMethods: { [key: string]: EnhancedCookingMethod };
  private recipeCache: Map<string, RecipeGenerationResult>;
  
  constructor() {
    const methodsArray = getAllEnhancedCookingMethods();
    this.enhancedCookingMethods = Array.isArray(methodsArray) 
      ? methodsArray.reduce((acc, method) => ({ ...acc, [method.id || method.name]: method }), {})
      : methodsArray as { [key: string]: EnhancedCookingMethod };
    this.recipeCache = new Map();
  }
  
  // ===== MONICA-OPTIMIZED RECIPE GENERATION =====
  
  /**
   * Generate a Monica-optimized recipe based on criteria
   */
  generateMonicaOptimizedRecipe(criteria: RecipeBuildingCriteria): RecipeGenerationResult {
    const cacheKey = this.generateCacheKey(criteria);
    const cached = this.recipeCache.get(cacheKey);
    if (cached) return cached;
    
    // Step 1: Get base recipe or create from criteria
    const baseRecipe = this.createBaseRecipe(criteria);
    
    // Step 2: Enhance with alchemical properties
    const enhancedRecipe = RecipeEnhancer.enhanceRecipe(baseRecipe, 'unified-recipe-builder');
    
    // Step 3: Apply Monica optimization
    const monicaOptimization = this.calculateMonicaOptimization(enhancedRecipe, criteria);
    
    // Step 4: Apply seasonal adaptation with enhanced type safety
    const seasonCriteria = criteria.currentSeason || criteria.season;
    const seasonalAdaptation = this.applySeasonalAdaptation(enhancedRecipe, seasonCriteria);
    
    // Step 5: Apply cuisine integration
    const cuisineIntegration = this.applyCuisineIntegration(enhancedRecipe, criteria.cuisine);
    
    // Step 6: Apply nutritional optimization
    const nutritionalOptimization = this.applyNutritionalOptimization(enhancedRecipe);
    
    // Step 7: Create optimized recipe
    const optimizedRecipe: MonicaOptimizedRecipe = {
      ...enhancedRecipe,
      monicaOptimization,
      seasonalAdaptation,
      cuisineIntegration,
      nutritionalOptimization
    };
    
    // Step 8: Generate alternatives
    const alternatives = this.generateAlternatives(optimizedRecipe, criteria);
    
    // Step 9: Calculate confidence and metadata
    const confidence = this.calculateGenerationConfidence(optimizedRecipe, criteria);
    const generationMetadata = this.generateMetadata(optimizedRecipe, criteria);
    
    const result: RecipeGenerationResult = {
      recipe: optimizedRecipe,
      confidence,
      alternatives,
      generationMetadata
    };
    
    this.recipeCache.set(cacheKey, result);
    return result;
  }
  
  /**
   * Calculate Monica optimization for a recipe
   */
  private calculateMonicaOptimization(
    recipe: EnhancedRecipe, 
    criteria: RecipeBuildingCriteria
  ): MonicaOptimizedRecipe['monicaOptimization'] {
    const originalMonica = recipe.alchemicalProperties?.monicaConstant || null;
    const targetMonica = criteria.targetMonica || this.calculateOptimalMonica(recipe, criteria);
    
    // Calculate optimization adjustments
    const temperatureAdjustments = this.calculateTemperatureAdjustments(originalMonica, targetMonica);
    const timingAdjustments = this.calculateTimingAdjustments(originalMonica, targetMonica);
    const intensityModifications = this.calculateIntensityModifications(originalMonica, targetMonica);
    const planetaryTimingRecommendations = this.calculatePlanetaryTiming(targetMonica, criteria);
    
    // Calculate optimization score
    const optimizationScore = this.calculateOptimizationScore(
      originalMonica, 
      targetMonica, 
      temperatureAdjustments,
      timingAdjustments
    );
    
    return {
      originalMonica,
      optimizedMonica: targetMonica,
      optimizationScore,
      temperatureAdjustments,
      timingAdjustments,
      intensityModifications,
      planetaryTimingRecommendations
    };
  }
  
  /**
   * Apply seasonal adaptation to a recipe
   */
  private applySeasonalAdaptation(
    recipe: EnhancedRecipe, 
    season?: Season
  ): MonicaOptimizedRecipe['seasonalAdaptation'] {
    const currentSeason = season || this.seasonalSystem.getCurrentSeason();
    const seasonalRecommendations = this.seasonalSystem.getSeasonalRecommendations(currentSeason) as unknown as SeasonalRecommendations;
    
    // Calculate seasonal score
    const seasonalScore = this.calculateSeasonalScore(recipe, currentSeason);
    
    // Generate ingredient substitutions
    const seasonalIngredientSubstitutions = this.generateSeasonalIngredientSubstitutions(
      recipe, 
      currentSeason, 
      seasonalRecommendations
    );
    
    // Generate cooking method adjustments
    const seasonalCookingMethodAdjustments = this.generateSeasonalCookingMethodAdjustments(
      recipe, 
      currentSeason, 
      seasonalRecommendations
    );
    
    return {
      currentSeason,
      seasonalScore,
      seasonalIngredientSubstitutions,
      seasonalCookingMethodAdjustments
    };
  }
  
  /**
   * Apply cuisine integration to a recipe
   */
  private applyCuisineIntegration(
    recipe: EnhancedRecipe, 
    cuisine?: string
  ): MonicaOptimizedRecipe['cuisineIntegration'] {
    if (!cuisine) {
      return {
        authenticity: 0.5,
        fusionPotential: 0.8,
        culturalNotes: ['Universal recipe with broad appeal'],
        traditionalVariations: [],
        modernAdaptations: []
      };
    }
    
    // Analyze cuisine ingredients
    const cuisineAnalysis = this.cuisineSystem.analyzeCuisineIngredients(cuisine);
    
    // Calculate authenticity
    const authenticity = this.calculateCuisineAuthenticity(recipe, cuisine, cuisineAnalysis);
    
    // Calculate fusion potential
    const fusionPotential = this.calculateFusionPotential(recipe, cuisine);
    
    // Generate cultural notes
    const culturalNotes = this.generateCulturalNotes(recipe, cuisine);
    const traditionalVariations = this.generateTraditionalVariations(recipe, cuisine);
    const modernAdaptations = this.generateModernAdaptations(recipe, cuisine);
    
    return {
      authenticity,
      fusionPotential,
      culturalNotes,
      traditionalVariations,
      modernAdaptations
    };
  }
  
  /**
   * Apply nutritional optimization with alchemical principles
   */
  private applyNutritionalOptimization(
    recipe: EnhancedRecipe
  ): MonicaOptimizedRecipe['nutritionalOptimization'] {
    // Categorize nutrients by alchemical properties
    const alchemicalNutrition = this.categorizeNutrientsByAlchemy(recipe);
    
    // Calculate elemental nutrition
    const elementalNutrition = this.calculateElementalNutrition(recipe);
    
    // Calculate Kalchm nutritional balance
    const kalchmNutritionalBalance = this.calculateKalchmNutritionalBalance(recipe);
    
    // Calculate Monica nutritional harmony
    const monicaNutritionalHarmony = this.calculateMonicaNutritionalHarmony(recipe);
    
    return {
      alchemicalNutrition,
      elementalNutrition,
      kalchmNutritionalBalance,
      monicaNutritionalHarmony
    };
  }
  
  // ===== SEASONAL RECIPE ADAPTATION =====
  
  /**
   * Adapt an existing recipe for a specific season
   */
  adaptRecipeForSeason(recipe: EnhancedRecipe, targetSeason: Season): SeasonalRecipeAdaptation {
    const originalRecipe = recipe;
    
    // Get seasonal recommendations
    const seasonalRecommendations = this.seasonalSystem.getSeasonalRecommendations(targetSeason) as unknown as SeasonalRecommendations;
    
    // Generate ingredient substitutions
    const ingredientSubstitutions = this.generateDetailedIngredientSubstitutions(
      recipe, 
      targetSeason, 
      seasonalRecommendations
    );
    
    // Generate cooking method adjustments
    const cookingMethodAdjustments = this.generateDetailedCookingMethodAdjustments(
      recipe, 
      targetSeason, 
      seasonalRecommendations
    );
    
    // Generate timing adjustments
    const timingAdjustments = this.generateSeasonalTimingAdjustments(recipe, targetSeason);
    
    // Generate temperature adjustments
    const temperatureAdjustments = this.generateSeasonalTemperatureAdjustments(recipe, targetSeason);
    
    // Apply all adaptations to create adapted recipe
    const adaptedRecipe = this.applyAdaptationsToRecipe(
      recipe, 
      ingredientSubstitutions,
      cookingMethodAdjustments,
      timingAdjustments,
      temperatureAdjustments,
      targetSeason
    );
    
    // Calculate improvement scores
    const seasonalScore = this.calculateSeasonalScore(adaptedRecipe, targetSeason);
    const kalchmImprovement = this.calculateKalchmImprovement(originalRecipe, adaptedRecipe);
    const monicaImprovement = this.calculateMonicaImprovement(originalRecipe, adaptedRecipe);
    
    return {
      originalRecipe,
      adaptedRecipe,
      adaptationChanges: {
        ingredientSubstitutions,
        cookingMethodAdjustments,
        timingAdjustments,
        temperatureAdjustments
      },
      seasonalScore,
      kalchmImprovement,
      monicaImprovement
    };
  }
  
  // ===== FUSION RECIPE GENERATION =====
  
  /**
   * Generate a fusion recipe from multiple cuisines
   */
  generateFusionRecipe(
    cuisines: string[], 
    criteria: RecipeBuildingCriteria
  ): FusionRecipeProfile {
    if ((cuisines || []).length < 2) {
      throw new Error('Fusion recipes require at least 2 cuisines');
    }
    
    // Generate fusion cuisine profile
    const fusionCuisineProfile = this.generateMultiCuisineFusion(cuisines);
    
    // Create base fusion recipe
    const baseFusionRecipe = this.createFusionBaseRecipe(fusionCuisineProfile, criteria);
    
    // Enhance with alchemical properties
    const enhancedFusionRecipe = RecipeEnhancer.enhanceRecipe(baseFusionRecipe, 'fusion-generator');
    
    // Apply Monica optimization for fusion
    const monicaOptimization = this.calculateFusionMonicaOptimization(enhancedFusionRecipe, cuisines);
    
    // Apply seasonal adaptation with enhanced type safety
    const seasonCriteria = criteria.currentSeason || criteria.season;
    const seasonalAdaptation = this.applySeasonalAdaptation(enhancedFusionRecipe, seasonCriteria);
    
    // Apply cuisine integration for fusion
    const cuisineIntegration = this.applyFusionCuisineIntegration(enhancedFusionRecipe, cuisines);
    
    // Apply nutritional optimization
    const nutritionalOptimization = this.applyNutritionalOptimization(enhancedFusionRecipe);
    
    // Create fusion recipe
    const fusionRecipe: MonicaOptimizedRecipe = {
      ...enhancedFusionRecipe,
      monicaOptimization,
      seasonalAdaptation,
      cuisineIntegration,
      nutritionalOptimization
    };
    
    // Calculate fusion metrics
    const fusionRatio = this.calculateFusionRatio(cuisines);
    const fusionIngredients = this.categorizeFusionIngredients(fusionRecipe, cuisines);
    const fusionCookingMethods = this.categorizeFusionCookingMethods(fusionRecipe, cuisines);
    const culturalHarmony = this.calculateCulturalHarmony(cuisines);
    const kalchmFusionBalance = this.calculateKalchmFusionBalance(fusionRecipe, cuisines);
    const monicaFusionOptimization = this.calculateMonicaFusionOptimization(fusionRecipe, cuisines);
    const innovationScore = this.calculateInnovationScore(fusionRecipe, cuisines);
    
    return {
      fusionRecipe,
      parentCuisines: cuisines,
      fusionRatio,
      fusionIngredients,
      fusionCookingMethods,
      culturalHarmony,
      kalchmFusionBalance,
      monicaFusionOptimization,
      innovationScore
    };
  }
  
  // ===== PLANETARY RECIPE RECOMMENDATIONS =====
  
  /**
   * Generate recipe recommendations based on planetary hours and astrological conditions
   */
  generatePlanetaryRecipeRecommendation(
    criteria: RecipeBuildingCriteria & {
      currentPlanetaryHour: PlanetName;
      lunarPhase: LunarPhase;
      currentZodiacSign?: ZodiacSign;
    }
  ): PlanetaryRecipeRecommendation {
    // Generate base recipe
    const baseRecipe = this.generateMonicaOptimizedRecipe(criteria);
    
    // Calculate planetary alignment
    const planetaryAlignment = this.calculatePlanetaryAlignment(
      baseRecipe.recipe, 
      criteria.currentPlanetaryHour,
      criteria.lunarPhase,
      criteria.currentZodiacSign
    );
    
    // Calculate optimal cooking time
    const optimalCookingTime = this.calculateOptimalCookingTime(
      baseRecipe.recipe,
      criteria.currentPlanetaryHour,
      criteria.lunarPhase
    );
    
    // Calculate energetic profile
    const energeticProfile = this.calculateEnergeticProfile(
      baseRecipe.recipe,
      planetaryAlignment
    );
    
    return {
      recipe: baseRecipe.recipe,
      planetaryAlignment,
      optimalCookingTime,
      energeticProfile
    };
  }
  
  // ===== UTILITY METHODS =====
  
  /**
   * Create a base recipe from criteria
   */
  private createBaseRecipe(criteria: RecipeBuildingCriteria): Partial<EnhancedRecipe> {
    const baseIngredients = this.selectIngredientsFromCriteria(criteria);
    const baseCookingMethods = this.selectCookingMethodsFromCriteria(criteria);
    const baseInstructions = this.generateBaseInstructions(baseIngredients, baseCookingMethods);
    
    return {
      name: this.generateRecipeName(criteria),
      description: this.generateRecipeDescription(criteria),
      cuisine: criteria.cuisine || 'fusion',
      ingredients: baseIngredients,
      instructions: baseInstructions,
      cookingMethods: baseCookingMethods,
      season: criteria.currentSeason || criteria.season ? [criteria.currentSeason || criteria.season] : ['all'],
      mealType: criteria.mealType || ['dinner'],
      numberOfServings: criteria.servings || 4,
      prepTime: this.estimatePrepTime(baseIngredients, baseCookingMethods),
      cookTime: this.estimateCookTime(baseCookingMethods),
      elementalProperties: this.calculateBaseElementalProperties(baseIngredients)
    } as Partial<EnhancedRecipe>;
  }
  
  /**
   * Generate cache key for recipe criteria
   */
  private generateCacheKey(criteria: RecipeBuildingCriteria): string {
    return JSON.stringify(criteria);
  }
  
  /**
   * Calculate optimal Monica constant for given criteria
   */
  private calculateOptimalMonica(recipe: EnhancedRecipe, criteria: RecipeBuildingCriteria): number {
    // Base Monica calculation
    let optimalMonica = 1.0;
    
    // Adjust for season with enhanced type safety
    const seasonCriteria = criteria.currentSeason || criteria.season;
    if (seasonCriteria) {
      const seasonalProfile = this.seasonalSystem.getSeasonalRecommendations(seasonCriteria);
      // Safe property access with fallback for monicaOptimization
      const monicaOptimization = (seasonalProfile as Record<string, unknown>).monicaOptimization || 1.0;
      optimalMonica *= monicaOptimization;
    }
    
    // Adjust for cuisine
    if (criteria.cuisine) {
      const cuisineAnalysis = this.cuisineSystem.analyzeCuisineIngredients(criteria.cuisine);
      optimalMonica *= cuisineAnalysis.kalchmProfile.averageKalchm;
    }
    
    // Adjust for cooking methods
    if (criteria.cookingMethods) {
      const methodModifier = this.calculateCookingMethodMonicaModifier(criteria.cookingMethods);
      optimalMonica *= methodModifier;
    }
    
    return optimalMonica;
  }
  
  // Additional utility methods would be implemented here...
  // (Temperature adjustments, timing calculations, ingredient selection, etc.)
  
  private calculateTemperatureAdjustments(originalMonica: number | null, targetMonica: number): number[] {
    const adjustments: number[] = [];
    const currentMonica = originalMonica || 50; // Default to neutral if not provided
    const monicaDiff = targetMonica - currentMonica;
    
    // Monica scoring affects temperature preferences
    // Higher Monica = higher energy = higher temperatures
    if (monicaDiff > 20) {
      // Need significant temperature increase
      adjustments.push(25, 50); // Increase by 25-50°F
    } else if (monicaDiff > 10) {
      // Moderate temperature increase
      adjustments.push(10, 25); // Increase by 10-25°F
    } else if (monicaDiff < -20) {
      // Need temperature decrease for lower Monica
      adjustments.push(-25, -10); // Decrease by 10-25°F
    } else if (monicaDiff < -10) {
      // Slight temperature decrease
      adjustments.push(-15, -5); // Decrease by 5-15°F
    } else {
      // Monica is close to target
      adjustments.push(-5, 5); // Minor adjustments only
    }
    
    return adjustments;
  }
  
  private calculateTimingAdjustments(originalMonica: number | null, targetMonica: number): number[] {
    const adjustments: number[] = [];
    const currentMonica = originalMonica || 50;
    const monicaDiff = targetMonica - currentMonica;
    
    // Higher Monica scores require shorter cooking times (more energy preserved)
    // Lower Monica scores benefit from longer cooking times (gentler transformation)
    if (monicaDiff > 20) {
      // Reduce cooking time to preserve energy
      adjustments.push(-0.3, -0.2); // Reduce by 20-30%
    } else if (monicaDiff > 10) {
      // Slightly reduce cooking time
      adjustments.push(-0.15, -0.1); // Reduce by 10-15%
    } else if (monicaDiff < -20) {
      // Increase cooking time for gentler transformation
      adjustments.push(0.2, 0.4); // Increase by 20-40%
    } else if (monicaDiff < -10) {
      // Slightly increase cooking time
      adjustments.push(0.1, 0.2); // Increase by 10-20%
    } else {
      // Minor timing adjustments
      adjustments.push(-0.05, 0.05); // ±5%
    }
    
    return adjustments;
  }
  
  private calculateIntensityModifications(originalMonica: number | null, targetMonica: number): string[] {
    const modifications: string[] = [];
    const currentMonica = originalMonica || 50;
    const monicaDiff = targetMonica - currentMonica;
    
    // Determine intensity modifications based on Monica gap
    if (monicaDiff > 30) {
      modifications.push('intensify-strong', 'add-power-ingredients', 'increase-spice-level');
    } else if (monicaDiff > 15) {
      modifications.push('intensify-moderate', 'enhance-aromatics', 'boost-umami');
    } else if (monicaDiff > 0) {
      modifications.push('intensify-mild', 'brighten-flavors', 'add-acid');
    } else if (monicaDiff < -30) {
      modifications.push('mellow-strong', 'add-cooling-ingredients', 'reduce-spices');
    } else if (monicaDiff < -15) {
      modifications.push('mellow-moderate', 'add-dairy', 'increase-sweetness');
    } else if (monicaDiff < 0) {
      modifications.push('mellow-mild', 'round-flavors', 'add-fat');
    } else {
      modifications.push('maintain', 'balance-existing', 'fine-tune');
    }
    
    return modifications;
  }
  
  private calculatePlanetaryTiming(targetMonica: number, criteria: RecipeBuildingCriteria): string[] {
    const recommendations: string[] = [];
    
    // High Monica recipes benefit from Fire/Mars hours
    if (targetMonica > 75) {
      recommendations.push('Cook during Mars hour for maximum energy');
      recommendations.push('Sun hour amplifies vitality and power');
      if (criteria.zodiacSign && ['aries', 'leo', 'sagittarius'].includes(criteria.zodiacSign)) {
        recommendations.push('Fire sign alignment enhances Monica score');
      }
    }
    // Medium-high Monica benefits from balanced planetary hours
    else if (targetMonica > 60) {
      recommendations.push('Jupiter hour enhances abundance and satisfaction');
      recommendations.push('Mercury hour aids in complex flavor development');
    }
    // Medium Monica works well with Earth/Venus hours  
    else if (targetMonica > 40) {
      recommendations.push('Venus hour enhances pleasure and harmony');
      recommendations.push('Earth sign moons ground the energy perfectly');
    }
    // Low Monica benefits from Water/Moon hours
    else {
      recommendations.push('Moon hour enhances comfort and nurturing');
      recommendations.push('Neptune aspects add subtle complexity');
      if (criteria.lunarPhase === 'new' || criteria.lunarPhase === 'waning') {
        recommendations.push('Waning moon phase aligns with gentle energy');
      }
    }
    
    // Add seasonal timing if provided
    if (criteria.season) {
      const seasonalTiming = this.getSeasonalPlanetaryTiming(criteria.season, targetMonica);
      recommendations.push(seasonalTiming);
    }
    
    return recommendations;
  }
  
  private calculateOptimizationScore(
    originalMonica: number | null, 
    targetMonica: number, 
    temperatureAdjustments: number[],
    timingAdjustments: number[]
  ): number {
    const currentMonica = originalMonica || 50;
    const monicaDiff = Math.abs(targetMonica - currentMonica);
    
    // Base score starts high and decreases with difficulty
    let score = 1.0;
    
    // Deduct for large Monica differences (harder to achieve)
    score -= (monicaDiff / 100) * 0.3; // Up to 30% deduction
    
    // Factor in adjustment ranges
    const tempRange = Math.abs(temperatureAdjustments[1] - temperatureAdjustments[0]);
    const timeRange = Math.abs(timingAdjustments[1] - timingAdjustments[0]);
    
    // Smaller adjustment ranges = more precise = better score
    score -= (tempRange / 100) * 0.1; // Up to 10% for temperature variance
    score -= (timeRange) * 0.1; // Up to 10% for timing variance
    
    // Bonus for staying within comfortable ranges
    if (monicaDiff < 20) {
      score += 0.1; // 10% bonus for achievable target
    }
    
    // Ensure score stays within bounds
    return Math.max(0.4, Math.min(1.0, score));
  }
  
  private getSeasonalPlanetaryTiming(season: Season, targetMonica: number): string {
    const timingMap: Record<Season, Record<string, string>> = {
      'spring': {
        high: 'Dawn cooking aligns with Spring\'s rising energy',
        medium: 'Mid-morning preparation captures growth energy',
        low: 'Evening cooking grounds Spring\'s active energy'
      },
      'summer': {
        high: 'Noon cooking maximizes Summer\'s peak energy',
        medium: 'Late afternoon balances Summer intensity',
        low: 'Early morning or late evening for cooling'
      },
      'autumn': {
        high: 'Afternoon cooking gathers Autumn\'s harvest energy',
        medium: 'Sunset preparation for balanced transformation',
        low: 'Evening cooking enhances Autumn\'s introspection'
      },
      'fall': {
        high: 'Afternoon cooking gathers Fall\'s harvest energy',
        medium: 'Sunset preparation for balanced transformation',
        low: 'Evening cooking enhances Fall\'s introspection'
      },
      'winter': {
        high: 'Midday cooking counters Winter\'s dormancy',
        medium: 'Late afternoon for warming comfort',
        low: 'Long, slow evening cooking for deep nourishment'
      },
      'all': {
        high: 'Solar noon maximizes any season\'s energy',
        medium: 'Golden hour cooking for balanced energy',
        low: 'Blue hour cooking for gentle transformation'
      }
    };
    
    const intensity = targetMonica > 65 ? 'high' : targetMonica > 35 ? 'medium' : 'low';
    return timingMap[season]?.[intensity] || 'Cook during planetary hours aligned with your intention';
  }
  
  private calculateSeasonalScore(recipe: EnhancedRecipe, season: Season): number {
    let score = 0.5; // Base seasonal score
    
    // Check if recipe has explicit seasonality
    if (recipe.seasonality === season) {
      score = 0.95; // Perfect match
    } else if (recipe.seasonality === 'all') {
      score = 0.75; // Universal recipes work in any season
    } else if (recipe.seasonality && recipe.seasonality.includes(season)) {
      score = 0.85; // Good match for multi-season recipes
    }
    
    // Analyze ingredient seasonality
    const seasonalIngredientScore = recipe.ingredients.reduce((total, ingredient) => {
      if (ingredient.seasonality === season) {
        return total + 1.0;
      } else if (ingredient.seasonality === 'all') {
        return total + 0.7;
      } else if (ingredient.seasonality?.includes(season)) {
        return total + 0.85;
      }
      return total + 0.3; // Out of season ingredient
    }, 0) / recipe.ingredients.length;
    
    // Weight recipe seasonality more heavily than ingredients
    score = (score * 0.6) + (seasonalIngredientScore * 0.4);
    
    // Cooking method seasonal appropriateness
    const methodScore = this.getCookingMethodSeasonalScore(recipe.cookingMethod, season);
    score = (score * 0.8) + (methodScore * 0.2);
    
    return Math.max(0.2, Math.min(1.0, score));
  }
  
  private getCookingMethodSeasonalScore(method: string, season: Season): number {
    const seasonalMethodScores: Record<Season, Record<string, number>> = {
      'summer': {
        'grill': 1.0, 'raw': 0.95, 'chill': 0.9, 'saute': 0.7,
        'roast': 0.5, 'braise': 0.3, 'stew': 0.2
      },
      'winter': {
        'braise': 1.0, 'stew': 0.95, 'roast': 0.9, 'bake': 0.85,
        'simmer': 0.8, 'saute': 0.6, 'grill': 0.4, 'raw': 0.2
      },
      'spring': {
        'steam': 0.95, 'saute': 0.9, 'blanch': 0.85, 'raw': 0.8,
        'grill': 0.7, 'roast': 0.6, 'stew': 0.4
      },
      'autumn': {
        'roast': 0.95, 'bake': 0.9, 'braise': 0.85, 'saute': 0.8,
        'stew': 0.75, 'grill': 0.6, 'raw': 0.4
      },
      'fall': {
        'roast': 0.95, 'bake': 0.9, 'braise': 0.85, 'saute': 0.8,
        'stew': 0.75, 'grill': 0.6, 'raw': 0.4
      },
      'all': {
        'saute': 0.8, 'roast': 0.75, 'bake': 0.75, 'steam': 0.7,
        'grill': 0.7, 'braise': 0.7, 'raw': 0.65, 'stew': 0.7
      }
    };
    
    const methodLower = method.toLowerCase();
    const scores = seasonalMethodScores[season] || seasonalMethodScores['all'];
    
    // Find best match for method
    for (const [key, score] of Object.entries(scores)) {
      if (methodLower.includes(key)) {
        return score;
      }
    }
    
    return 0.5; // Default neutral score
  }
  
  private generateSeasonalIngredientSubstitutions(
    recipe: EnhancedRecipe, 
    season: Season, 
    seasonalRecommendations: SeasonalRecommendations
  ): MonicaOptimizedRecipe['seasonalAdaptation']['seasonalIngredientSubstitutions'] {
    // Implementation for seasonal ingredient substitutions
    return []; // Placeholder
  }
  
  private generateSeasonalCookingMethodAdjustments(
    recipe: EnhancedRecipe, 
    season: Season, 
    seasonalRecommendations: SeasonalRecommendations
  ): MonicaOptimizedRecipe['seasonalAdaptation']['seasonalCookingMethodAdjustments'] {
    // Implementation for seasonal cooking method adjustments
    return []; // Placeholder
  }
  
  private calculateCuisineAuthenticity(
    recipe: EnhancedRecipe, 
    cuisine: string, 
    cuisineAnalysis: CuisineIngredientAnalysis
  ): number {
    // Calculate authenticity based on ingredient alignment with cuisine
    const ingredientAlignment = this.calculateIngredientAlignment(recipe, cuisineAnalysis);
    
    // Apply Kalchm profile influence
    const kalchmInfluence = cuisineAnalysis.kalchmProfile.averageKalchm || 1.0;
    let optimalMonica = this.calculateOptimalMonica(recipe, { cuisine });
    optimalMonica *= cuisineAnalysis.kalchmProfile.averageKalchm || 1.0;
    
    return Math.min(1.0, (ingredientAlignment * 0.7) + (kalchmInfluence * 0.3));
  }
  
  private calculateIngredientAlignment(recipe: EnhancedRecipe, cuisineAnalysis: CuisineIngredientAnalysis): number {
    // Placeholder implementation for ingredient alignment calculation
    return 0.75;
  }
  
  private calculateFusionPotential(recipe: EnhancedRecipe, cuisine: string): number {
    // Implementation for fusion potential calculation
    return 0.8; // Placeholder
  }
  
  private generateCulturalNotes(recipe: EnhancedRecipe, cuisine: string): string[] {
    // Implementation for cultural notes generation
    return [`Traditional ${cuisine} influences`]; // Placeholder
  }
  
  private generateTraditionalVariations(recipe: EnhancedRecipe, cuisine: string): string[] {
    // Implementation for traditional variations
    return []; // Placeholder
  }
  
  private generateModernAdaptations(recipe: EnhancedRecipe, cuisine: string): string[] {
    // Implementation for modern adaptations
    return []; // Placeholder
  }
  
  private categorizeNutrientsByAlchemy(recipe: EnhancedRecipe): MonicaOptimizedRecipe['nutritionalOptimization']['alchemicalNutrition'] {
    // Implementation for alchemical nutrition categorization
    return {
      spiritNutrients: ['vitamin C', 'antioxidants'],
      essenceNutrients: ['omega-3', 'minerals'],
      matterNutrients: ['protein', 'fiber'],
      substanceNutrients: ['carbohydrates', 'fats']
    }; // Placeholder
  }
  
  private calculateElementalNutrition(recipe: EnhancedRecipe): ElementalProperties {
    // Implementation for elemental nutrition calculation
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }; // Placeholder
  }
  
  private calculateKalchmNutritionalBalance(recipe: EnhancedRecipe): number {
    // Implementation for Kalchm nutritional balance
    return 0.8; // Placeholder
  }
  
  private calculateMonicaNutritionalHarmony(recipe: EnhancedRecipe): number {
    // Implementation for Monica nutritional harmony
    return 0.85; // Placeholder
  }
  
  private generateAlternatives(recipe: MonicaOptimizedRecipe, criteria: RecipeBuildingCriteria): MonicaOptimizedRecipe[] {
    // Implementation for generating alternative recipes
    return []; // Placeholder
  }
  
  private calculateGenerationConfidence(recipe: MonicaOptimizedRecipe, criteria: RecipeBuildingCriteria): number {
    // Implementation for confidence calculation
    return 0.9; // Placeholder
  }
  
  private generateMetadata(recipe: MonicaOptimizedRecipe, criteria: RecipeBuildingCriteria): RecipeGenerationResult['generationMetadata'] {
    // Implementation for metadata generation
    return {
      criteriaMatched: 8,
      totalCriteria: 10,
      kalchmAccuracy: 0.85,
      monicaOptimization: 0.9,
      seasonalAlignment: 0.8,
      cuisineAuthenticity: 0.75,
      generatedAt: new Date().toISOString(),
      generationMethod: 'unified-recipe-builder'
    }; // Placeholder
  }
  
  // Additional placeholder methods for comprehensive functionality...
  private selectIngredientsFromCriteria(_criteria: RecipeBuildingCriteria): unknown[] { 
    // TODO: Implement ingredient selection based on criteria
    return []; 
  }
  
  private selectCookingMethodsFromCriteria(_criteria: RecipeBuildingCriteria): string[] { 
    // TODO: Implement cooking method selection
    return []; 
  }
  
  private generateBaseInstructions(_ingredients: unknown[], _methods: string[]): string[] { 
    // TODO: Implement instruction generation
    return []; 
  }
  
  private generateRecipeName(_criteria: RecipeBuildingCriteria): string { 
    // TODO: Generate dynamic recipe names based on criteria
    return 'Generated Recipe'; 
  }
  
  private generateRecipeDescription(_criteria: RecipeBuildingCriteria): string { 
    // TODO: Generate dynamic recipe descriptions
    return 'A delicious recipe'; 
  }
  
  private estimatePrepTime(_ingredients: unknown[], _methods: string[]): string { 
    // TODO: Calculate prep time based on ingredients and methods
    return '15 minutes'; 
  }
  
  private estimateCookTime(_methods: string[]): string { 
    // TODO: Calculate cook time based on methods
    return '30 minutes'; 
  }
  
  private calculateBaseElementalProperties(_ingredients: unknown[]): ElementalProperties { 
    // TODO: Calculate elemental properties from ingredients
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }; 
  }
  
  private calculateCookingMethodMonicaModifier(_methods: string[]): number { 
    // TODO: Calculate Monica modifier from cooking methods
    return 1.0; 
  }
  
  // Seasonal adaptation methods - TODO: Implement comprehensive seasonal adaptations
  private generateDetailedIngredientSubstitutions(_recipe: EnhancedRecipe, _season: Season, _recommendations: SeasonalRecommendations): any[] { 
    // TODO: Generate seasonal ingredient substitutions
    return []; 
  }
  
  private generateDetailedCookingMethodAdjustments(_recipe: EnhancedRecipe, _season: Season, _recommendations: SeasonalRecommendations): any[] { 
    // TODO: Generate seasonal cooking method adjustments
    return []; 
  }
  
  private generateSeasonalTimingAdjustments(_recipe: EnhancedRecipe, _season: Season): any { 
    // TODO: Calculate seasonal timing adjustments
    return {}; 
  }
  
  private generateSeasonalTemperatureAdjustments(_recipe: EnhancedRecipe, _season: Season): any { 
    // TODO: Calculate seasonal temperature adjustments
    return {}; 
  }
  
  private applyAdaptationsToRecipe(recipe: EnhancedRecipe, ..._adaptations: any[]): MonicaOptimizedRecipe { 
    // TODO: Apply seasonal adaptations to recipe
    return recipe as MonicaOptimizedRecipe; 
  }
  
  private calculateKalchmImprovement(_original: EnhancedRecipe, _adapted: MonicaOptimizedRecipe): number { 
    // TODO: Calculate Kalchm improvement between original and adapted recipes
    return 0.1; 
  }
  
  private calculateMonicaImprovement(_original: EnhancedRecipe, _adapted: MonicaOptimizedRecipe): number { 
    // TODO: Calculate Monica improvement between original and adapted recipes
    return 0.1; 
  }
  
  // Fusion recipe methods - TODO: Implement comprehensive fusion recipe capabilities
  private generateMultiCuisineFusion(cuisines: string[]): any { 
    // TODO: Generate fusion profile from multiple cuisines
    return {}; 
  }
  
  private createFusionBaseRecipe(fusion: unknown, criteria: RecipeBuildingCriteria): Partial<EnhancedRecipe> { 
    // TODO: Create base recipe for fusion cuisine
    return {}; 
  }
  
  private calculateFusionMonicaOptimization(recipe: EnhancedRecipe, cuisines: string[]): any { 
    // TODO: Calculate Monica optimization for fusion recipes
    return {}; 
  }
  
  private applyFusionCuisineIntegration(recipe: EnhancedRecipe, cuisines: string[]): any { 
    // TODO: Apply cuisine integration for fusion recipes
    return {}; 
  }
  
  private calculateFusionRatio(cuisines: string[]): { [key: string]: number } { 
    // TODO: Calculate fusion ratios between cuisines
    return {}; 
  }
  
  private categorizeFusionIngredients(recipe: MonicaOptimizedRecipe, cuisines: string[]): any[] { 
    // TODO: Categorize ingredients by fusion role
    return []; 
  }
  
  private categorizeFusionCookingMethods(recipe: MonicaOptimizedRecipe, cuisines: string[]): any[] { 
    // TODO: Categorize cooking methods by fusion application
    return []; 
  }
  
  private calculateCulturalHarmony(cuisines: string[]): number { 
    // TODO: Calculate cultural harmony between cuisines
    return 0.8; 
  }
  
  private calculateKalchmFusionBalance(recipe: MonicaOptimizedRecipe, cuisines: string[]): number { 
    // TODO: Calculate Kalchm balance for fusion recipe
    return 0.8; 
  }
  
  private calculateMonicaFusionOptimization(recipe: MonicaOptimizedRecipe, cuisines: string[]): number { 
    // TODO: Calculate Monica optimization for fusion
    return 0.8; 
  }
  
  private calculateInnovationScore(recipe: MonicaOptimizedRecipe, cuisines: string[]): number { 
    // TODO: Calculate innovation score for fusion recipe
    return 0.7; 
  }
  
  // Planetary recipe methods - TODO: Implement astrological recipe recommendations
  private calculatePlanetaryAlignment(recipe: MonicaOptimizedRecipe, hour: PlanetName, phase: LunarPhase, sign?: ZodiacSign): any { 
    // TODO: Calculate planetary alignment scores
    return {}; 
  }
  
  private calculateOptimalCookingTime(recipe: MonicaOptimizedRecipe, hour: PlanetName, phase: LunarPhase): any { 
    // TODO: Calculate optimal cooking time based on planetary conditions
    return {}; 
  }
  
  private calculateEnergeticProfile(recipe: MonicaOptimizedRecipe, alignment: any): any { 
    // TODO: Calculate energetic profile from planetary alignment
    return {}; 
  }
}

// ===== SINGLETON INSTANCE =====

export const unifiedRecipeBuildingSystem = new UnifiedRecipeBuildingSystem();

// ===== CONVENIENCE EXPORTS =====

export function generateMonicaOptimizedRecipe(_criteria: RecipeBuildingCriteria): RecipeGenerationResult {
  return unifiedRecipeBuildingSystem.generateMonicaOptimizedRecipe(_criteria);
}

export function adaptRecipeForSeason(_recipe: EnhancedRecipe, _season: Season): SeasonalRecipeAdaptation {
  return unifiedRecipeBuildingSystem.adaptRecipeForSeason(_recipe, _season);
}


export function generateFusionRecipe(_cuisines: string[], _criteria: RecipeBuildingCriteria): any {
  return unifiedRecipeBuildingSystem.generateFusionRecipe(_cuisines, _criteria);
}

export function generatePlanetaryRecipeRecommendation(
  _criteria: RecipeBuildingCriteria & {
    currentPlanetaryHour: PlanetName;
    lunarPhase: LunarPhase;
    currentZodiacSign?: ZodiacSign;
  }
): PlanetaryRecipeRecommendation {
  return unifiedRecipeBuildingSystem.generatePlanetaryRecipeRecommendation(_criteria);
}

// ===== BACKWARD COMPATIBILITY =====

// Maintain compatibility with existing recipe building functions
export function buildRecipe(_criteria: RecipeBuildingCriteria): any {
  return unifiedRecipeBuildingSystem.generateMonicaOptimizedRecipe(_criteria);
}

export function getSeasonalRecipeRecommendations(_season: Season): any {
  return unifiedRecipeBuildingSystem.seasonalSystem.getSeasonalRecommendations(_season);
}

export function getCuisineRecipeRecommendations(_cuisine: string): any {
  return unifiedRecipeBuildingSystem.cuisineSystem.analyzeCuisineIngredients(_cuisine);
} 