// ===== UNIFIED RECIPE BUILDING SYSTEM =====
// Phase 3 Step 3 of WhatToEatNext Data Consolidation
// Enhances recipe building with Monica/Kalchm optimization, seasonal adaptation,
// cuisine integration, and enhanced recipe intelligence

import { unifiedSeasonalSystem } from '@/data/integrations/seasonal';
import { UnifiedIngredient } from '@/data/unified/unifiedTypes';
import type { ElementalProperties, LunarPhase, PlanetName, Season } from '@/types/alchemy';
import type {
    MethodAdjustment,
    TemperatureAdjustment,
    TimingAdjustment
} from '@/types/recipeAdjustments';

import {
    getAllEnhancedCookingMethods,
    type EnhancedCookingMethod,
} from '../../constants/alchemicalPillars';

import {
    unifiedCuisineIntegrationSystem,
    type CuisineIngredientAnalysis,
} from './cuisineIntegrations.js';
import { RecipeEnhancer, type EnhancedRecipe } from './recipes';
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
  zodiacSign?: any;

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
  currentZodiacSign?: any;
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
      seasonalImprovement: number
    }>,
    cookingMethodAdjustments: Array<{
      original: string,
      adjusted: string,
      reason: string,
      seasonalBenefit: string
    }>,
    timingAdjustments: {
      prepTimeChange: number,
      cookTimeChange: number,
      restTimeChange: number,
      reason: string
    },
    temperatureAdjustments: {
      temperatureChange: number,
      reason: string,
      seasonalBenefit: string
    }
  },
  seasonalScore: number,
  kalchmImprovement: number,
  monicaImprovement: number
}

export interface FusionRecipeProfile {
  fusionRecipe: MonicaOptimizedRecipe;
  parentCuisines: string[];
  fusionRatio: { [key: string]: number },
  fusionIngredients: Array<{
    ingredient: UnifiedIngredient,
    sourceCuisine: string,
    fusionRole: 'base' | 'accent' | 'bridge' | 'innovation'
  }>,
  fusionCookingMethods: Array<{
    method: EnhancedCookingMethod,
    sourceCuisine: string,
    fusionApplication: string
  }>,
  culturalHarmony: number,
  kalchmFusionBalance: number,
  monicaFusionOptimization: number,
  innovationScore: number
}

export interface PlanetaryRecipeRecommendation {
  recipe: MonicaOptimizedRecipe;
  planetaryAlignment: {
    currentPlanetaryHour: PlanetName;
    planetaryCompatibility: number;
    lunarPhaseAlignment: number;
    zodiacHarmony: number;
    astrologicalScore: number
  },
  optimalCookingTime: {
    startTime: string,
    duration: string,
    planetaryWindow: string,
    lunarConsiderations: string
  },
  energeticProfile: {
    spiritualEnergy: number,
    emotionalResonance: number,
    physicalVitality: number,
    mentalClarity: number
  }
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
      : (methodsArray as { [key: string]: EnhancedCookingMethod });
    this.recipeCache = new Map();
  }

  // ===== MONICA-OPTIMIZED RECIPE GENERATION =====

  /**
   * Generate a Monica-optimized recipe based on criteria
   */
  generateMonicaOptimizedRecipe(criteria: RecipeBuildingCriteria): RecipeGenerationResult {
    const cacheKey = this.generateCacheKey(criteria)
    const cached = this.recipeCache.get(cacheKey);
    if (cached) return cached;
    // Step, 1: Get base recipe or create from criteria
    const baseRecipe = this.createBaseRecipe(criteria);
    // Step, 2: Enhance with alchemical properties
    const enhancedRecipe = RecipeEnhancer.enhanceRecipe(baseRecipe, 'unified-recipe-builder')

    // Step, 3: Apply Monica optimization
    const monicaOptimization = this.calculateMonicaOptimization(enhancedRecipe, criteria)

    // Step, 4: Apply seasonal adaptation with enhanced type safety
    const seasonCriteria = criteria.currentSeason || criteria.season;
    const seasonalAdaptation = this.applySeasonalAdaptation(enhancedRecipe, seasonCriteria)

    // Step, 5: Apply cuisine integration
    const cuisineIntegration = this.applyCuisineIntegration(enhancedRecipe, criteria.cuisine),

    // Step 6: Apply nutritional optimization
    const nutritionalOptimization = this.applyNutritionalOptimization(enhancedRecipe);
    // Step 7: Create optimized recipe
    const optimizedRecipe: MonicaOptimizedRecipe = {
      ...enhancedRecipe,
      monicaOptimization,
      seasonalAdaptation,
      cuisineIntegration,
      nutritionalOptimization
    }

    // Step, 8: Generate alternatives
    const alternatives = this.generateAlternatives(optimizedRecipe, criteria)

    // Step, 9: Calculate confidence and metadata
    const confidence = this.calculateGenerationConfidence(optimizedRecipe, criteria)
    const generationMetadata = this.generateMetadata(optimizedRecipe, criteria)

    const result: RecipeGenerationResult = {
      recipe: optimizedRecipe,
      confidence,
      alternatives,
      generationMetadata
    }

    this.recipeCache.set(cacheKey, result)
    return result;
  }

  /**
   * Calculate Monica optimization for a recipe
   */
  private calculateMonicaOptimization()
    recipe: EnhancedRecipe,
    criteria: RecipeBuildingCriteria,
  ): MonicaOptimizedRecipe['monicaOptimization'] {
    const originalMonica = recipe.alchemicalProperties?.monicaConstant || null;
    const targetMonica = criteria.targetMonica || this.calculateOptimalMonica(recipe, criteria)

    // Calculate optimization adjustments
    const temperatureAdjustments = this.calculateTemperatureAdjustments()
      originalMonica,
      targetMonica,
    )
    const timingAdjustments = this.calculateTimingAdjustments(originalMonica, targetMonica)
    const intensityModifications = this.calculateIntensityModifications()
      originalMonica,
      targetMonica,
    )
    const planetaryTimingRecommendations = this.calculatePlanetaryTiming(targetMonica, criteria),

    // Calculate optimization score
    const optimizationScore = this.calculateOptimizationScore()
      originalMonica,
      targetMonica,
      temperatureAdjustments,
      timingAdjustments,
    ),

    return {
      originalMonica,
      optimizedMonica: targetMonica,
      optimizationScore,
      temperatureAdjustments,
      timingAdjustments,
      intensityModifications,
      planetaryTimingRecommendations
    }
  }

  /**
   * Apply seasonal adaptation to a recipe
   */
  private applySeasonalAdaptation()
    recipe: EnhancedRecipe,
    season?: Season,
  ): MonicaOptimizedRecipe['seasonalAdaptation'] {
    const currentSeason = season || this.seasonalSystem.getCurrentSeason()
    const seasonalRecommendations = this.seasonalSystem.getSeasonalRecommendations()
      currentSeason,
    ) as unknown as SeasonalRecommendations,

    // Calculate seasonal score
    const seasonalScore = this.calculateSeasonalScore(recipe, currentSeason)

    // Generate ingredient substitutions
    const seasonalIngredientSubstitutions = this.generateSeasonalIngredientSubstitutions()
      recipe,
      currentSeason,
      seasonalRecommendations,
    ),

    // Generate cooking method adjustments
    const seasonalCookingMethodAdjustments = this.generateSeasonalCookingMethodAdjustments()
      recipe,
      currentSeason,
      seasonalRecommendations,
    ),

    return {
      currentSeason,
      seasonalScore,
      seasonalIngredientSubstitutions,
      seasonalCookingMethodAdjustments
    }
  }

  /**
   * Apply cuisine integration to a recipe
   */
  private applyCuisineIntegration()
    recipe: EnhancedRecipe,
    cuisine?: string,
  ): MonicaOptimizedRecipe['cuisineIntegration'] {
    if (!cuisine) {
      return {
        authenticity: 0.5,
        fusionPotential: 0.8,
        culturalNotes: ['Universal recipe with broad appeal'],
        traditionalVariations: [],
        modernAdaptations: []
      }
    }

    // Analyze cuisine ingredients
    const cuisineAnalysis = this.cuisineSystem.analyzeCuisineIngredients(cuisine)

    // Calculate authenticity;
    const authenticity = this.calculateCuisineAuthenticity(recipe, cuisine, cuisineAnalysis)

    // Calculate fusion potential
    const fusionPotential = this.calculateFusionPotential(recipe, cuisine)

    // Generate cultural notes
    const culturalNotes = this.generateCulturalNotes(recipe, cuisine)
    const traditionalVariations = this.generateTraditionalVariations(recipe, cuisine)
    const modernAdaptations = this.generateModernAdaptations(recipe, cuisine)

    return {
      authenticity,
      fusionPotential,
      culturalNotes,
      traditionalVariations,
      modernAdaptations
    }
  }

  /**
   * Apply nutritional optimization with alchemical principles
   */
  private applyNutritionalOptimization()
    recipe: EnhancedRecipe,
  ): MonicaOptimizedRecipe['nutritionalOptimization'] {
    // Categorize nutrients by alchemical properties
    const alchemicalNutrition = this.categorizeNutrientsByAlchemy(recipe)

    // Calculate elemental nutrition
    const elementalNutrition = this.calculateElementalNutrition(recipe)

    // Calculate Kalchm nutritional balance
    const kalchmNutritionalBalance = this.calculateKalchmNutritionalBalance(recipe)

    // Calculate Monica nutritional harmony
    const monicaNutritionalHarmony = this.calculateMonicaNutritionalHarmony(recipe)
    return {
      alchemicalNutrition,
      elementalNutrition,
      kalchmNutritionalBalance,
      monicaNutritionalHarmony
    }
  }

  // ===== SEASONAL RECIPE ADAPTATION =====

  /**
   * Adapt an existing recipe for a specific season
   */
  adaptRecipeForSeason(recipe: EnhancedRecipe, targetSeason: Season): SeasonalRecipeAdaptation {
    const originalRecipe = recipe

    // Get seasonal recommendations
    const seasonalRecommendations = this.seasonalSystem.getSeasonalRecommendations()
      targetSeason,
    ) as unknown as SeasonalRecommendations,

    // Generate ingredient substitutions
    const ingredientSubstitutions = this.generateDetailedIngredientSubstitutions()
      recipe,
      targetSeason,
      seasonalRecommendations,
    )

    // Generate cooking method adjustments
    const cookingMethodAdjustments = this.generateDetailedCookingMethodAdjustments()
      recipe,
      targetSeason,
      seasonalRecommendations,
    )

    // Generate timing adjustments
    const timingAdjustments = this.generateSeasonalTimingAdjustments(recipe, targetSeason)

    // Generate temperature adjustments
    const temperatureAdjustments = this.generateSeasonalTemperatureAdjustments()
      recipe,
      targetSeason,
    )

    // Apply all adaptations to create adapted recipe
    const adaptedRecipe = this.applyAdaptationsToRecipe()
      recipe,
      ingredientSubstitutions as unknown ,
      cookingMethodAdjustments as unknown ,
      timingAdjustments as unknown ,
      temperatureAdjustments as unknown ,
      targetSeason as unknown ,
    )

    // Calculate improvement scores
    const seasonalScore = this.calculateSeasonalScore(adaptedRecipe, targetSeason)
    const kalchmImprovement = this.calculateKalchmImprovement(originalRecipe, adaptedRecipe),
    const monicaImprovement = this.calculateMonicaImprovement(originalRecipe, adaptedRecipe),

    return {
      originalRecipe,
      adaptedRecipe,
      adaptationChanges: {
        ingredientSubstitutions: ingredientSubstitutions.map(sub => ({
          ...sub,
          seasonalImprovement: 0.1
})),
        cookingMethodAdjustments: cookingMethodAdjustments.map(adj => ({
          original: (adj as unknown as MethodAdjustment)?.method || '',
          adjusted: (adj as unknown as MethodAdjustment)?.adjustment || '',
          reason: (adj as unknown as MethodAdjustment)?.reason || '',
          seasonalBenefit: 'Seasonal optimization'
        })),
        timingAdjustments: {
          prepTimeChange: (timingAdjustments as unknown as TimingAdjustment)?.cookingTime || 0,
          cookTimeChange: (timingAdjustments as unknown as TimingAdjustment)?.cookingTime || 0,
          restTimeChange: (timingAdjustments as unknown as TimingAdjustment)?.restTime || 0,
          reason: (timingAdjustments as unknown as TimingAdjustment)?.reason ||
            'Seasonal timing optimization',
        },
        temperatureAdjustments: {
          temperatureChange: (temperatureAdjustments as unknown as TemperatureAdjustment)?.temperature || 0,
          reason: (temperatureAdjustments as unknown as TemperatureAdjustment)?.reason ||
            'Seasonal temperature optimization',
          seasonalBenefit: 'Enhanced seasonal flavor development'
        }
      },
      seasonalScore,
      kalchmImprovement,
      monicaImprovement
    }
  }

  // ===== FUSION RECIPE GENERATION =====

  /**
   * Generate a fusion recipe from multiple cuisines
   */
  generateFusionRecipe(cuisines: string[], criteria: RecipeBuildingCriteria): FusionRecipeProfile {
    if ((cuisines || []).length < 2) {
      throw new Error('Fusion recipes require at least 2 cuisines')
    }

    // Generate fusion cuisine profile
    const fusionCuisineProfile = this.generateMultiCuisineFusion(cuisines)

    // Create base fusion recipe;
    const baseFusionRecipe = this.createFusionBaseRecipe(fusionCuisineProfile, criteria)

    // Enhance with alchemical properties
    const enhancedFusionRecipe = RecipeEnhancer.enhanceRecipe(baseFusionRecipe, 'fusion-generator')

    // Apply Monica optimization for fusion
    const monicaOptimization = this.calculateFusionMonicaOptimization()
      enhancedFusionRecipe,
      cuisines,
    )

    // Apply seasonal adaptation with enhanced type safety
    const seasonCriteria = criteria.currentSeason || criteria.season;
    const seasonalAdaptation = this.applySeasonalAdaptation(enhancedFusionRecipe, seasonCriteria)

    // Apply cuisine integration for fusion
    const cuisineIntegration = this.applyFusionCuisineIntegration(enhancedFusionRecipe, cuisines)

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
    const fusionIngredients = this.categorizeFusionIngredients(fusionRecipe, cuisines)
    const fusionCookingMethods = this.categorizeFusionCookingMethods(fusionRecipe, cuisines)
    const culturalHarmony = this.calculateCulturalHarmony(cuisines);
    const kalchmFusionBalance = this.calculateKalchmFusionBalance(fusionRecipe, cuisines)
    const monicaFusionOptimization = this.calculateMonicaFusionOptimization(fusionRecipe, cuisines)
    const innovationScore = this.calculateInnovationScore(fusionRecipe, cuisines)

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
    }
  }

  // ===== PLANETARY RECIPE RECOMMENDATIONS =====

  /**
   * Generate recipe recommendations based on planetary hours and astrological conditions
   */
  generatePlanetaryRecipeRecommendation()
    criteria: RecipeBuildingCriteria & {
      currentPlanetaryHour: PlanetName,
      lunarPhase: LunarPhase,
      currentZodiacSign?: any
    }
  ): PlanetaryRecipeRecommendation {
    // Generate base recipe
    const baseRecipe = this.generateMonicaOptimizedRecipe(criteria)

    // Calculate planetary alignment;
    const planetaryAlignment = this.calculatePlanetaryAlignment()
      baseRecipe.recipe,
      criteria.currentPlanetaryHour,
      criteria.lunarPhase,
      criteria.currentZodiacSign
    );

    // Calculate optimal cooking time
    const optimalCookingTime = this.calculateOptimalCookingTime()
      baseRecipe.recipe,
      criteria.currentPlanetaryHour,
      criteria.lunarPhase
    );

    // Calculate energetic profile
    const energeticProfile = this.calculateEnergeticProfile(baseRecipe.recipe, planetaryAlignment),

    return {
      recipe: baseRecipe.recipe,
      planetaryAlignment,
      optimalCookingTime,
      energeticProfile
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Create a base recipe from criteria
   */
  private createBaseRecipe(criteria: RecipeBuildingCriteria): Partial<EnhancedRecipe> {
    const baseIngredients = this.selectIngredientsFromCriteria(criteria)
    const baseCookingMethods = this.selectCookingMethodsFromCriteria(criteria);
    const baseInstructions = this.generateBaseInstructions(baseIngredients, baseCookingMethods),

    return {
      name: this.generateRecipeName(criteria),
      description: this.generateRecipeDescription(criteria),
      cuisine: criteria.cuisine || 'fusion',
      ingredients: baseIngredients,
      instructions: baseInstructions,
      cookingMethods: baseCookingMethods,
      season: criteria.currentSeason || criteria.season
          ? [criteria.currentSeason || criteria.season]
          : ['all'],
      mealType: criteria.mealType || ['dinner'],
      numberOfServings: criteria.servings || 4,
      prepTime: this.estimatePrepTime(baseIngredients, baseCookingMethods),
      cookTime: this.estimateCookTime(baseCookingMethods),
      elementalProperties: this.calculateBaseElementalProperties(baseIngredients),
    } as Partial<EnhancedRecipe>;
  }

  /**
   * Generate cache key for recipe criteria
   */
  private generateCacheKey(criteria: RecipeBuildingCriteria): string {
    return JSON.stringify(criteria)
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
      // Type-safe monica optimization access with validation
      const monicaData = (seasonalProfile as any).monicaOptimization;
      const monicaOptimization =
        typeof monicaData === 'number' && monicaData > 0 ? monicaData : 1.0;
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
  private calculateTemperatureAdjustments()
    originalMonica: number | null,
    targetMonica: number,
  ): number[] {
    const adjustments: number[] = [];

    if (!originalMonica) {
      return [-25, -10, 0, 10, 25]; // Default range for exploration
    }

    const monicaDiff = targetMonica - originalMonica;

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

  private calculateTimingAdjustments()
    originalMonica: number | null,
    targetMonica: number,
  ): number[] {
    const adjustments: number[] = [];

    if (!originalMonica) {
      return [-15, -5, 0, 5, 15]; // Default timing variations
    }

    const monicaDiff = targetMonica - originalMonica;

    if (Math.abs(monicaDiff) > 15) {
      // Significant Monica difference - larger time adjustments
      adjustments.push(-20, -10, 10, 20); // ±10-20 minutes
    } else if (Math.abs(monicaDiff) > 5) {
      // Moderate difference
      adjustments.push(-10, -5, 5, 10); // ±5-10 minutes
    } else {
      // Close to target
      adjustments.push(-5, 0, 5); // Minor timing tweaks
    }

    return adjustments;
  }

  private calculateIntensityModifications()
    originalMonica: number | null,
    targetMonica: number,
  ): string[] {
    const modifications: string[] = [];
    const currentMonica = originalMonica || 50;
    const monicaDiff = targetMonica - currentMonica

    // Determine intensity modifications based on Monica gap
    if (monicaDiff > 30) {
      modifications.push('intensify-strong', 'add-power-ingredients', 'increase-spice-level')
    } else if (monicaDiff > 15) {
      modifications.push('intensify-moderate', 'enhance-aromatics', 'boost-umami')
    } else if (monicaDiff > 0) {
      modifications.push('intensify-mild', 'brighten-flavors', 'add-acid')
    } else if (monicaDiff < -30) {
      modifications.push('mellow-strong', 'add-cooling-ingredients', 'reduce-spices')
    } else if (monicaDiff < -15) {
      modifications.push('mellow-moderate', 'add-dairy', 'increase-sweetness')
    } else if (monicaDiff < 0) {
      modifications.push('mellow-mild', 'round-flavors', 'add-fat')
    } else {
      modifications.push('maintain', 'balance-existing', 'fine-tune')
    }

    return modifications
  }

  private calculatePlanetaryTiming()
    targetMonica: number,
    criteria: RecipeBuildingCriteria,
  ): string[] {
    const recommendations: string[] = [];

    // High Monica recipes benefit from Fire/Mars hours
    if (targetMonica > 75) {
      recommendations.push('Cook during Mars hour for maximum energy')
      recommendations.push('Sun hour amplifies vitality and power')
      if (criteria.zodiacSign && ['aries', 'leo', 'sagittarius'].includes(criteria.zodiacSign) {
        recommendations.push('Fire sign alignment enhances Monica score')
      }
    }
    // Medium-high Monica benefits from balanced planetary hours
    else if (targetMonica > 60) {
      recommendations.push('Jupiter hour enhances abundance and satisfaction')
      recommendations.push('Mercury hour aids in complex flavor development')
    }
    // Medium Monica works well with Earth/Venus hours
    else if (targetMonica > 40) {
      recommendations.push('Venus hour enhances pleasure and harmony')
      recommendations.push('Earth sign moons ground the energy perfectly')
    }
    // Low Monica benefits from Water/Moon hours
    else {
      recommendations.push('Moon hour enhances comfort and nurturing')
      recommendations.push('Neptune aspects add subtle complexity')
      if (
        criteria.lunarPhase &&
        (criteria.lunarPhase === 'new moon' ||
          criteria.lunarPhase === 'waning gibbous' ||
          criteria.lunarPhase === 'waning crescent')
      ) {
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

  private calculateOptimizationScore()
    originalMonica: number | null,
    targetMonica: number,
    temperatureAdjustments: number[],
    timingAdjustments: number[],
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
    score -= timeRange * 0.1; // Up to 10% for timing variance

    // Bonus for staying within comfortable ranges
    if (monicaDiff < 20) {
      score += 0.1; // 10% bonus for achievable target
    }

    // Ensure score stays within bounds
    return Math.max(0.4, Math.min(1.0, score));
  }

  private getSeasonalPlanetaryTiming(season: Season, targetMonica: number): string {
    const timingMap: Record<Season, Record<string, string>> = {
      spring: {
        high: 'Dawn cooking aligns with Spring\'s rising energy',
        medium: 'Mid-morning preparation captures growth energy',
        low: 'Evening cooking grounds Spring\'s active energy'
      },
      summer: {
        high: 'Noon cooking maximizes Summer\'s peak energy',
        medium: 'Late afternoon balances Summer intensity',
        low: 'Early morning or late evening for cooling'
      },
      autumn: {
        high: 'Afternoon cooking gathers Autumn\'s harvest energy',
        medium: 'Sunset preparation for balanced transformation',
        low: 'Evening cooking enhances Autumn\'s introspection'
      },
      fall: {
        high: 'Afternoon cooking gathers Fall\'s harvest energy',
        medium: 'Sunset preparation for balanced transformation',
        low: 'Evening cooking enhances Fall\'s introspection'
      },
      winter: {
        high: 'Midday cooking counters Winter\'s dormancy',
        medium: 'Late afternoon for warming comfort',
        low: 'Long, slow evening cooking for deep nourishment'
      },
      all: {
        high: 'Solar noon maximizes any season\'s energy',
        medium: 'Golden hour cooking for balanced energy',
        low: 'Blue hour cooking for gentle transformation'
      }
    };

    const intensity = targetMonica > 65 ? 'high' : targetMonica > 35 ? 'medium' : 'low';
    return (
      timingMap[season][intensity] || 'Cook during planetary hours aligned with your intention'
    );
  }

  private calculateSeasonalScore(recipe: EnhancedRecipe, season: Season): number {
    let score = 0.5; // Base seasonal score

    // Check if recipe has explicit seasonality
    if (recipe.seasonality === season) {
      score = 0.95; // Perfect match
    } else if (recipe.seasonality === 'all') {
      score = 0.75; // Universal recipes work in any season
    } else if (recipe.seasonality && recipe.seasonality.includes(season) {
      score = 0.85; // Good match for multi-season recipes
    }

    // Analyze ingredient seasonality
    const seasonalIngredientScore =
      recipe.ingredients.reduce((total, ingredient) => {
        if (ingredient.seasonality === season) {
          return total + 1.0;
        } else if (ingredient.seasonality === 'all') {
          return total + 0.7;
        } else if (ingredient.seasonality?.includes(season) {
          return total + 0.85;
        }
        return total + 0.3; // Out of season ingredient
      }, 0) / recipe.ingredients.length;

    // Weight recipe seasonality more heavily than ingredients
    score = score * 0.6 + seasonalIngredientScore * 0.4;

    // Cooking method seasonal appropriateness
    const cookingMethodArray = recipe.cookingMethods;
    if (!cookingMethodArray || cookingMethodArray.length === 0) {
      return Math.max(0.2, Math.min(1.0, score)); // Return early if no cooking methods
    }
    const primaryMethod = cookingMethodArray[0]; // Use first method for scoring
    const methodScore = this.getCookingMethodSeasonalScore(primaryMethod, season);
    score = score * 0.8 + methodScore * 0.2;

    return Math.max(0.2, Math.min(1.0, score));
  }

  private getCookingMethodSeasonalScore(method: string, season: Season): number {
    const seasonalMethodScores: Record<Season, Record<string, number>> = {
      summer: {
        grill: 1.0,
        raw: 0.95,
        chill: 0.9,
        saute: 0.7,
        roast: 0.5,
        braise: 0.3,
        stew: 0.2
},
      winter: {
        braise: 1.0,
        stew: 0.95,
        roast: 0.9,
        bake: 0.85,
        simmer: 0.8,
        saute: 0.6,
        grill: 0.4,
        raw: 0.2
},
      spring: {
        steam: 0.95,
        saute: 0.9,
        blanch: 0.85,
        raw: 0.8,
        grill: 0.7,
        roast: 0.6,
        stew: 0.4
},
      autumn: {
        roast: 0.95,
        bake: 0.9,
        braise: 0.85,
        saute: 0.8,
        stew: 0.75,
        grill: 0.6,
        raw: 0.4
},
      fall: {
        roast: 0.95,
        bake: 0.9,
        braise: 0.85,
        saute: 0.8,
        stew: 0.75,
        grill: 0.6,
        raw: 0.4
},
      all: {
        saute: 0.8,
        roast: 0.75,
        bake: 0.75,
        steam: 0.7,
        grill: 0.7,
        braise: 0.7,
        raw: 0.65,
        stew: 0.7
}
    }

    const methodLower = method.toLowerCase();
    const scores = seasonalMethodScores[season] || seasonalMethodScores['all'];

    // Find best match for method
    for (const [key, score] of Object.entries(scores) {
      if (methodLower.includes(key) {
        return score
      }
    }

    return 0.5; // Default neutral score
  }

  private generateSeasonalIngredientSubstitutions()
    recipe: EnhancedRecipe,
    season: Season,
    seasonalRecommendations: SeasonalRecommendations,
  ): MonicaOptimizedRecipe['seasonalAdaptation']['seasonalIngredientSubstitutions'] {
    // Implementation for seasonal ingredient substitutions
    const substitutions = []

    // Use recipe ingredients and seasonal recommendations for intelligent substitutions
    for (const ingredient of recipe.ingredients || []) {
      const seasonalIngredient = (seasonalRecommendations as unknown as {
          getSeasonalEquivalent?: (name: string, season: Season) => string
        }
      )?.getSeasonalEquivalent?.(ingredient.name, season)
      if (seasonalIngredient && seasonalIngredient !== ingredient.name) {
        (substitutions as unknown as Array<unknown>).push({
          original: ingredient.name,
          seasonal: seasonalIngredient,
          reason: `Better availability in ${season}`,
          seasonalScore: 0.8
})
      }
    }

    return substitutions;
  }

  private generateSeasonalCookingMethodAdjustments()
    recipe: EnhancedRecipe,
    season: Season,
    seasonalRecommendations: SeasonalRecommendations,
  ): MonicaOptimizedRecipe['seasonalAdaptation']['seasonalCookingMethodAdjustments'] {
    // Implementation for seasonal cooking method adjustments
    const adjustments = []

    // Adapt cooking methods based on season and recipe type;
    const currentMethods = (recipe as { cookingMethods?: string[] | string })?.cookingMethods || [];
    for (const method of Array.isArray(currentMethods) ? currentMethods : [currentMethods]) {
      const seasonalAdjustment = (seasonalRecommendations as unknown as {
          getCookingMethodAdjustment?: (method: string, season: Season) => string
        }
      )?.getCookingMethodAdjustment?.(method, season)
      if (seasonalAdjustment) {
        (adjustments as unknown as MethodAdjustment[]).push({
          method: method,
          adjustment: seasonalAdjustment,
          reason: `Optimized for ${season} conditions`
        })
      }
    }

    return adjustments;
  }

  private calculateCuisineAuthenticity()
    recipe: EnhancedRecipe,
    cuisine: string,
    cuisineAnalysis: CuisineIngredientAnalysis,
  ): number {
    // Calculate authenticity based on ingredient alignment with cuisine
    const ingredientAlignment = this.calculateIngredientAlignment(recipe, cuisineAnalysis),

    // Apply Kalchm profile influence
    const kalchmInfluence = cuisineAnalysis.kalchmProfile.averageKalchm || 1.0;
    const optimalMonica = this.calculateOptimalMonica(recipe, { cuisine })
    const monicaAdjustment = optimalMonica * (cuisineAnalysis.kalchmProfile.averageKalchm || 1.0)

    return Math.min()
      1.0,
      ingredientAlignment * 0.7 + kalchmInfluence * 0.3 + monicaAdjustment * 0.1
    );
  }

  private calculateIngredientAlignment()
    recipe: EnhancedRecipe,
    cuisineAnalysis: CuisineIngredientAnalysis,
  ): number {
    // Calculate ingredient alignment based on cuisine analysis
    const recipeIngredients = recipe.ingredients.map(ing => ing.name) || [];
    const cuisineIngredients = cuisineAnalysis.commonIngredients || [];

    if (recipeIngredients.length === 0) return 0.5;
    const matchingIngredients = recipeIngredients.filter((ingredient: string) =>
      (cuisineIngredients as unknown as string[]).includes(ingredient)
    ).length;

    return Math.min(1.0, matchingIngredients / recipeIngredients.length);
  }

  private calculateFusionPotential(recipe: EnhancedRecipe, cuisine: string): number {
    // Calculate fusion potential based on recipe complexity and cuisine characteristics
    const recipeComplexity = (recipe.ingredients.length || 0) / 20; // Normalize by typical ingredient count
    const cuisineVersatility = this.getCuisineVersatility(cuisine);
    return Math.min(1.0, recipeComplexity * 0.6 + cuisineVersatility * 0.4)
  }

  private getCuisineVersatility(cuisine: string): number {
    // Define versatility scores for different cuisines
    const versatilityMap: { [key: string]: number } = {
      fusion: 1.0,
      international: 0.9,
      american: 0.8,
      mediterranean: 0.8,
      asian: 0.7,
      traditional: 0.5
}
    return versatilityMap[cuisine.toLowerCase()] || 0.6;
  }

  private generateCulturalNotes(recipe: EnhancedRecipe, cuisine: string): string[] {
    // Generate cultural notes based on recipe characteristics and cuisine
    const notes = []

    // Add cuisine-specific notes;
    (notes as string[]).push(`Traditional ${cuisine} influences`)

    // Add ingredient-based cultural notes
    const recipeIngredients = recipe.ingredients.map(ing => ing.name) || [];
    if (recipeIngredients.length > 10) {
      (notes as unknown as string[]).push()
        'Complex ingredient profile reflects authentic culinary traditions',
      )
    }

    // Add cooking method cultural notes
    const recipeWithMethods = recipe as { cookingMethods?: string[] | string }
    const cookingMethods = Array.isArray(recipeWithMethods.cookingMethods)
      ? recipeWithMethods.cookingMethods
      : [recipeWithMethods.cookingMethods].filter(Boolean)
    if (cookingMethods.some(method => method?.includes('slow')) {
      (notes as unknown as string[]).push('Slow cooking methods enhance traditional flavors');
    }

    return notes;
  }

  private generateTraditionalVariations(recipe: EnhancedRecipe, cuisine: string): string[] {
    const variations = []

    // Generate variations based on recipe characteristics and cuisine
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      (variations as string[]).push()
        `Traditional ${cuisine} preparation with authentic ingredients`,
      )

      // Add spice-based variations for certain cuisines
      if (['indian', 'thai', 'mexican'].includes(cuisine.toLowerCase()) {
        (variations as string[]).push()
          `Spice-enhanced ${cuisine} version with traditional aromatics`,
        )
      }

      // Add regional variations
      if (cuisine.toLowerCase() === 'italian') {
        (variations as string[]).push('Northern Italian style with rich herbs'),
        (variations as string[]).push('Southern Italian style with robust flavors')
      }
    }

    return variations;
  }

  private generateModernAdaptations(recipe: EnhancedRecipe, cuisine: string): string[] {
    const adaptations = []

    // Generate modern adaptations based on recipe and cuisine characteristics
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      (adaptations as string[]).push(`Modern ${cuisine} fusion with contemporary techniques`)

      // Add health-conscious adaptations
      (adaptations as string[]).push()
        `Health-optimized ${cuisine} version with nutritional enhancement`,
      )

      // Add technique-based adaptations - Fix property name consistency
      if (
        (recipe as { cookingMethods?: string[] }).cookingMethods?.some((method: string) =>
          method?.includes('traditional')
        )
      ) {
        (adaptations as string[]).push('Modernized cooking techniques while preserving flavor')
      }

      // Dietary adaptation suggestions
      (adaptations as string[]).push('Plant-based alternative adaptation')
      (adaptations as string[]).push('Gluten-free modern interpretation')
    }

    return adaptations;
  }

  private categorizeNutrientsByAlchemy()
    recipe: EnhancedRecipe,
  ): MonicaOptimizedRecipe['nutritionalOptimization']['alchemicalNutrition'] {
    const alchemicalNutrition = {
      spiritNutrients: [] as string[],
      essenceNutrients: [] as string[],
      matterNutrients: [] as string[],
      substanceNutrients: [] as string[]
    }

    // Categorize nutrients based on recipe ingredients and their alchemical properties
    if (recipe.ingredients) {
      for (const ingredient of recipe.ingredients) {
        const name = ingredient.name.toLowerCase()
;
        // Spirit nutrients (Air-like, volatile, energizing)
        if (['citrus', 'mint', 'herbs', 'spices'].some(type => name.includes(type)) {
          alchemicalNutrition.spiritNutrients.push('vitamin C', 'antioxidants', 'volatile oils')
        }

        // Essence nutrients (Water-like, flowing, cleansing)
        if (['fish', 'seaweed', 'cucumber', 'melon'].some(type => name.includes(type)) {
          alchemicalNutrition.essenceNutrients.push('omega-3', 'minerals', 'electrolytes')
        }

        // Matter nutrients (Earth-like, solid, grounding)
        if (['meat', 'beans', 'nuts', 'seeds'].some(type => name.includes(type)) {
          alchemicalNutrition.matterNutrients.push('protein', 'fiber', 'iron')
        }

        // Substance nutrients (Fire-like, energetic, transformative)
        if (['grains', 'starches', 'oils', 'sugars'].some(type => name.includes(type)) {
          alchemicalNutrition.substanceNutrients.push('carbohydrates', 'fats', 'energy')
        }
      }
    }

    // Ensure each category has at least some default nutrients
    if (alchemicalNutrition.spiritNutrients.length === 0) {
      alchemicalNutrition.spiritNutrients = ['vitamin C', 'antioxidants'];
    }
    if (alchemicalNutrition.essenceNutrients.length === 0) {
      alchemicalNutrition.essenceNutrients = ['omega-3', 'minerals'];
    }
    if (alchemicalNutrition.matterNutrients.length === 0) {
      alchemicalNutrition.matterNutrients = ['protein', 'fiber'];
    }
    if (alchemicalNutrition.substanceNutrients.length === 0) {
      alchemicalNutrition.substanceNutrients = ['carbohydrates', 'fats'];
    }

    return alchemicalNutrition;
  }

  private calculateElementalNutrition(recipe: EnhancedRecipe): ElementalProperties {
    const elementalProperties: ElementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 }

    if (recipe.ingredients) {
      const totalIngredients = recipe.ingredients.length;

      for (const ingredient of recipe.ingredients) {
        const name = ingredient.name.toLowerCase()
;
        // Fire element (spicy, energetic, transformative ingredients)
        if (['pepper', 'chili', 'ginger', 'garlic', 'onion'].some(spice => name.includes(spice)) {
          elementalProperties.Fire += 0.3;
        }

        // Water element (liquid, cooling, flowing ingredients)
        if (['milk', 'water', 'broth', 'juice', 'wine'].some(liquid => name.includes(liquid)) {
          elementalProperties.Water += 0.3;
        }

        // Earth element (grounding, substantial, nourishing ingredients)
        if (['potato', 'carrot', 'beet', 'grain', 'meat'].some(solid => name.includes(solid)) {
          elementalProperties.Earth += 0.3;
        }

        // Air element (light, aromatic, elevating ingredients)
        if (['herb', 'mint', 'basil', 'sage', 'thyme'].some(herb => name.includes(herb)) {
          elementalProperties.Air += 0.3;
        }
      }

      // Normalize by ingredient count and ensure balance
      if (totalIngredients > 0) {
        elementalProperties.Fire = Math.min(1.0, elementalProperties.Fire / totalIngredients);
        elementalProperties.Water = Math.min(1.0, elementalProperties.Water / totalIngredients);
        elementalProperties.Earth = Math.min(1.0, elementalProperties.Earth / totalIngredients);
        elementalProperties.Air = Math.min(1.0, elementalProperties.Air / totalIngredients);
      }
    }

    // Ensure minimum balance if no specific elements were found
    const total =
      elementalProperties.Fire +
      elementalProperties.Water +
      elementalProperties.Earth +
      elementalProperties.Air;
    if (total === 0) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
    }

    return elementalProperties;
  }

  private calculateKalchmNutritionalBalance(recipe: EnhancedRecipe): number {
    let kalchmBalance = 0.5; // Base balance

    if (recipe.ingredients) {
      const totalIngredients = recipe.ingredients.length;
      let balanceFactors = 0;

      for (const ingredient of recipe.ingredients) {
        const name = ingredient.name.toLowerCase();
        // High Kalchm ingredients (complex, refined, harmonious)
        if (
          ['saffron', 'truffle', 'wine', 'honey', 'aged'].some(premium => name.includes(premium))
        ) {
          balanceFactors += 0.2;
        }

        // Medium Kalchm ingredients (balanced, traditional)
        if (
          ['herb', 'spice', 'olive', 'garlic', 'onion'].some(balanced => name.includes(balanced))
        ) {
          balanceFactors += 0.1;
        }

        // Natural harmony indicators
        if (['organic', 'fresh', 'local', 'seasonal'].some(natural => name.includes(natural)) {
          balanceFactors += 0.05;
        }
      }

      // Calculate balance based on ingredient quality and harmony
      kalchmBalance = Math.min(1.0, 0.5 + balanceFactors / totalIngredients)

      // Bonus for ingredient diversity (Kalchm appreciates complexity)
      if (totalIngredients >= 8) {
        kalchmBalance += 0.1;
      }

      // Cooking method influence on Kalchm balance
      if (
        (recipe as { cookingMethods?: string[] }).cookingMethods?.some()
          (method: string) => method?.includes('slow') || method?.includes('traditional')
        )
      ) {
        kalchmBalance += 0.05;
      }
    }

    return Math.min(1.0, kalchmBalance)
  }

  private calculateMonicaNutritionalHarmony(recipe: EnhancedRecipe): number {
    let monicaHarmony = 0.6; // Base harmony

    if (recipe.ingredients) {
      const totalIngredients = recipe.ingredients.length;
      let harmonyFactors = 0;

      for (const ingredient of recipe.ingredients) {
        const name = ingredient.name.toLowerCase();
        // Monica-favored ingredients (pure, essential, transformative)
        if (['lemon', 'mint', 'ginger', 'turmeric', 'green'].some(pure => name.includes(pure)) {
          harmonyFactors += 0.15;
        }

        // Harmonious combinations Monica appreciates
        if (['herb', 'citrus', 'berry', 'nut', 'seed'].some(natural => name.includes(natural)) {
          harmonyFactors += 0.1;
        }

        // Nutritional density indicators
        if (['protein', 'vitamin', 'mineral', 'fiber'].some(nutrient => name.includes(nutrient)) {
          harmonyFactors += 0.05;
        }
      }

      // Calculate harmony based on ingredient purity and nutrition
      monicaHarmony = Math.min(1.0, 0.6 + harmonyFactors / totalIngredients)

      // Bonus for nutritional completeness (Monica values wholeness)
      if (totalIngredients >= 6 && totalIngredients <= 12) {
        monicaHarmony += 0.1; // Sweet spot for Monica
      }

      // Cooking method influence on Monica harmony
      if (recipe.cookingMethods?.includes('steam') || recipe.cookingMethods?.includes('raw') {
        monicaHarmony += 0.05;
      }
    }

    return Math.min(1.0, monicaHarmony)
  }

  private generateAlternatives()
    recipe: MonicaOptimizedRecipe,
    criteria: RecipeBuildingCriteria,
  ): MonicaOptimizedRecipe[] {
    const alternatives: MonicaOptimizedRecipe[] = []

    // Generate alternatives based on criteria variations
    if (criteria.dietaryRestrictions && criteria.dietaryRestrictions.length > 0) {
      // Create dietary-friendly alternative
      const dietaryAlternative = { ...recipe }
      dietaryAlternative.name = `${recipe.name} (${criteria.dietaryRestrictions.join(', ')} friendly)`,
      alternatives.push(dietaryAlternative)
    }

    if ((criteria as ) { preferredCuisine?: string })?.preferredCuisine) {
      // Create cuisine-adapted alternative
      const cuisineAlternative = { ...recipe }
      cuisineAlternative.name = `${recipe.name} (${(criteria as { preferredCuisine: string }).preferredCuisine} style)`;
      alternatives.push(cuisineAlternative)
    }

    if ((criteria as ) { seasonalPreference?: string })?.seasonalPreference) {
      // Create seasonal alternative
      const seasonalAlternative = { ...recipe }
      seasonalAlternative.name = `${recipe.name} (${(criteria as { seasonalPreference: string }).seasonalPreference} seasonal)`;
      alternatives.push(seasonalAlternative)
    }

    // Create Monica-optimized alternative
    if (recipe.monicaOptimization.optimizationScore < 0.9) {
      const monicaEnhanced = { ...recipe }
      monicaEnhanced.name = `${recipe.name} (Monica Enhanced)`;
      monicaEnhanced.monicaOptimization.optimizationScore = Math.min()
        1.0,
        recipe.monicaOptimization.optimizationScore + 0.1
      );
      alternatives.push(monicaEnhanced)
    }

    return alternatives
  }

  private calculateGenerationConfidence()
    recipe: MonicaOptimizedRecipe,
    criteria: RecipeBuildingCriteria,
  ): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on recipe completeness
    if (recipe.ingredients && recipe.ingredients.length >= 5) {
      confidence += 0.1;
    }

    if (recipe.cookingMethods && recipe.cookingMethods.length > 0) {
      confidence += 0.1;
    }

    // Confidence from Monica optimization scores
    confidence += ((recipe.monicaOptimization as any)?.optimizationScore || 0) * 0.2;

    // Confidence from criteria alignment
    if (
      (criteria as { preferredCuisine?: string })?.preferredCuisine &&
      recipe.cuisine === (criteria as { preferredCuisine?: string }).preferredCuisine
    ) {
      confidence += 0.1;
    }

    if (
      (criteria as { seasonalPreference?: string })?.seasonalPreference &&
      recipe.seasonalAdaptation.seasonalScore >= 0.8
    ) {
      confidence += 0.1;
    }

    if (criteria.dietaryRestrictions && criteria.dietaryRestrictions.length > 0) {
      // Assume recipe meets dietary restrictions if generated properly
      confidence += 0.05;
    }

    // Confidence from alchemical balance
    const elementalBalance = Object.values()
      (recipe.alchemicalProperties as { elementalProperties?: Record<string, number> })
        ?.elementalProperties || {}
    )
    const balanceVariance =
      elementalBalance.length > 0
        ? Math.abs()
            (elementalBalance ).reduce((a: number, b: number) => a + (b || 0), 0) / 4 -
              0.25
          )
        : 0;
    if (balanceVariance < 0.1) {
      confidence += 0.05; // Well-balanced elements increase confidence
    }

    return Math.min(1.0, confidence)
  }

  private generateMetadata()
    recipe: MonicaOptimizedRecipe,
    criteria: RecipeBuildingCriteria,
  ): RecipeGenerationResult['generationMetadata'] {
    // Calculate actual metadata based on recipe and criteria
    let criteriaMatched = 0;
    const totalCriteria = 10; // Standard criteria count

    // Count matched criteria
    if (
      (criteria as { preferredCuisine?: string })?.preferredCuisine &&
      recipe.cuisine === (criteria as { preferredCuisine?: string }).preferredCuisine
    )
      criteriaMatched++;
    if (
      (criteria as { seasonalPreference?: string })?.seasonalPreference &&
      recipe.seasonalAdaptation.seasonalScore >= 0.7
    )
      criteriaMatched++;
    if (criteria.dietaryRestrictions) criteriaMatched++; // Assume dietary restrictions are met
    if (recipe.ingredients && recipe.ingredients.length >= 5) criteriaMatched++;
    if (
      (recipe as { cookingMethods?: string[] }).cookingMethods &&
      (recipe as { cookingMethods?: string[] }).cookingMethods.length > 0
    )
      criteriaMatched++;
    if (recipe.monicaOptimization.optimizationScore >= 0.7) criteriaMatched++;
    if ((recipe?.alchemicalProperties as ) { totalKalchm?: number })?.totalKalchm >= 0.7)
      criteriaMatched++;
    if (
      (recipe?.nutritionalOptimization as { overallNutritionalScore?: number })
        ?.overallNutritionalScore >= 0.7
    )
      criteriaMatched++;
    if (
      (recipe as { culturalIntegration?: { authenticityScore?: number } }).culturalIntegration
        ?.authenticityScore !== undefined &&
      ((recipe as { culturalIntegration?: { authenticityScore?: number } }).culturalIntegration
        ?.authenticityScore) >= 0.6
    )
      criteriaMatched++;
    criteriaMatched++; // Always count generation success as one criteria

    return {
      criteriaMatched,
      totalCriteria,
      kalchmAccuracy: (recipe.alchemicalProperties as { totalKalchm?: number })?.totalKalchm || 0,
      monicaOptimization: ((recipe.monicaOptimization as any)?.overallScore) || 0,
      seasonalAlignment: ((recipe.seasonalAdaptation as any)?.seasonalScore) || 0,
      cuisineAuthenticity: ((recipe as unknown)?.culturalIntegration) || 0,
      generatedAt: new Date().toISOString(),
      generationMethod: 'unified-recipe-builder'
}
  }

  // Additional placeholder methods for comprehensive functionality...
  private selectIngredientsFromCriteria(_criteria: RecipeBuildingCriteria): unknown[] {
    // TODO: Implement ingredient selection based on criteria
    return []
  }

  private selectCookingMethodsFromCriteria(_criteria: RecipeBuildingCriteria): string[] {
    // TODO: Implement cooking method selection
    return []
  }

  private generateBaseInstructions(_ingredients: unknown[], _methods: string[]): string[] {
    // TODO: Implement instruction generation
    return []
  }

  private generateRecipeName(_criteria: RecipeBuildingCriteria): string {
    // TODO: Generate dynamic recipe names based on criteria
    return 'Generated Recipe' }
        private generateRecipeDescription(_criteria: RecipeBuildingCriteria): string {
    // TODO: Generate dynamic recipe descriptions
    return 'A delicious recipe' }
        private estimatePrepTime(_ingredients: unknown[], _methods: string[]): string {
    // TODO: Calculate prep time based on ingredients and methods
    return '15 minutes' }
        private estimateCookTime(_methods: string[]): string {
    // TODO: Calculate cook time based on methods
    return '30 minutes' }
        private calculateBaseElementalProperties(_ingredients: unknown[]): ElementalProperties {
    // TODO: Calculate elemental properties from ingredients
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
  }

  private calculateCookingMethodMonicaModifier(_methods: string[]): number {
    // TODO: Calculate Monica modifier from cooking methods
    return 1.0
  }

  // Seasonal adaptation methods - TODO: Implement comprehensive seasonal adaptations
  private generateDetailedIngredientSubstitutions()
    _recipe: EnhancedRecipe,
    _season: Season,
    _recommendations: SeasonalRecommendations,
  ): Array<{ original: string, substitute: string, reason: string }> {
    // TODO: Generate seasonal ingredient substitutions
    return []
  }

  private generateDetailedCookingMethodAdjustments()
    _recipe: EnhancedRecipe,
    _season: Season,
    _recommendations: SeasonalRecommendations,
  ): Array<{ method: string, adjustment: string, reason: string }> {
    // TODO: Generate seasonal cooking method adjustments
    return []
  }

  private generateSeasonalTimingAdjustments()
    _recipe: EnhancedRecipe,
    _season: Season,
  ): { cookingTime: number, restTime: number, reason: string } {
    // TODO: Calculate seasonal timing adjustments
    return {
      cookingTime: 45,
      restTime: 10,
      reason: 'Standard seasonal timing adjustment'
}
  }

  private generateSeasonalTemperatureAdjustments()
    _recipe: EnhancedRecipe,
    _season: Season,
  ): { temperature: number, adjustment: string, reason: string } {
    // TODO: Calculate seasonal temperature adjustments
    return {
      temperature: 350,
      adjustment: 'moderate',
      reason: 'Standard seasonal temperature adjustment'
}
  }

  private applyAdaptationsToRecipe()
    recipe: EnhancedRecipe,
    ..._adaptations: Array<Record<string, unknown>>
  ): MonicaOptimizedRecipe {
    // TODO: Apply seasonal adaptations to recipe
    return recipe as MonicaOptimizedRecipe
  }

  private calculateKalchmImprovement()
    _original: EnhancedRecipe,
    _adapted: MonicaOptimizedRecipe,
  ): number {
    // TODO: Calculate Kalchm improvement between original and adapted recipes
    return 0.1
  }

  private calculateMonicaImprovement()
    _original: EnhancedRecipe,
    _adapted: MonicaOptimizedRecipe,
  ): number {
    // TODO: Calculate Monica improvement between original and adapted recipes
    return 0.1
  }

  // Fusion recipe methods - TODO: Implement comprehensive fusion recipe capabilities
  private generateMultiCuisineFusion(cuisines: string[]): {
    fusionType: string,
    primaryCuisine: string,
    influences: string[],
    complexity: number
  } {
    // TODO: Generate fusion profile from multiple cuisines
    return {
      fusionType: 'modern fusion',
      primaryCuisine: cuisines[0] || 'international',
      influences: cuisines.slice(1),
      complexity: 0.7
    };
  }

  private createFusionBaseRecipe(_: unknown, _: RecipeBuildingCriteria): Partial<EnhancedRecipe> {
    // TODO: Create base recipe for fusion cuisine
    return {}
  }

  private calculateFusionMonicaOptimization()
    recipe: EnhancedRecipe,
    cuisines: string[],
  ): MonicaOptimizedRecipe['monicaOptimization'] {
    // Calculate fusion Monica optimization with complete interface
    const originalMonica = recipe.alchemicalProperties?.monicaConstant || null;
    const optimizedMonica = this.calculateOptimalMonica(recipe, { cuisine: cuisines[0] })
    const optimizationScore = originalMonica ? optimizedMonica / originalMonica : 1.0

    return {
      originalMonica,
      optimizedMonica,
      optimizationScore,
      temperatureAdjustments: [0.95, 1.0, 1.05], // Slight temperature variations for fusion
      timingAdjustments: [0.9, 1.0, 1.1], // Timing adjustments for multiple cuisines
      intensityModifications: ['balanced fusion', 'cultural harmony', 'integrated techniques'],
      planetaryTimingRecommendations: [
        'Optimal during Venus hours for harmony',
        'Jupiter hours enhance cultural integration'
      ]
    }
  }

  private applyFusionCuisineIntegration()
    recipe: EnhancedRecipe,
    cuisines: string[],
  ): MonicaOptimizedRecipe['cuisineIntegration'] {
    // Apply fusion cuisine integration with complete interface
    const authenticity = 0.7, // Fusion recipes maintain moderate authenticity,
    const fusionPotential = 0.9, // High fusion potential by design,
    const culturalNotes = cuisines.map(cuisine => `Integrates ${cuisine} culinary traditions`)
    const traditionalVariations = cuisines.map()
      cuisine => `Traditional ${cuisine} preparation method`
    )
    const modernAdaptations = [
      `Fusion of ${cuisines.join(' and ')} techniques`,
      'Contemporary presentation style'
    ],

    return {
      authenticity,
      fusionPotential,
      culturalNotes,
      traditionalVariations,
      modernAdaptations
    }
  }

  private calculateFusionRatio(_cuisines: string[]): { [key: string]: number } {
    // TODO: Calculate fusion ratios between cuisines
    return {}
  }

  private categorizeFusionIngredients()
    recipe: MonicaOptimizedRecipe,
    cuisines: string[],
  ): Array<{
    ingredient: UnifiedIngredient,
    sourceCuisine: string,
    fusionRole: 'base' | 'accent' | 'bridge' | 'innovation'
  }> {
    // Categorize ingredients by fusion role with proper interface
    const fusionIngredients: Array<{
      ingredient: UnifiedIngredient,
      sourceCuisine: string,
      fusionRole: 'base' | 'accent' | 'bridge' | 'innovation'
    }> = [];

    if (recipe.ingredients && Array.isArray(recipe.ingredients) {
      recipe.ingredients.forEach((ingredient, index) => {
        const sourceCuisine = cuisines[index % cuisines.length] || cuisines[0] || 'fusion'
        const fusionRole: 'base' | 'accent' | 'bridge' | 'innovation' =
          index < 2 ? 'base' : index < 4 ? 'accent' : index < 6 ? 'bridge' : 'innovation'

        fusionIngredients.push({
          ingredient: ingredient as unknown as UnifiedIngredient,
          sourceCuisine,
          fusionRole
        })
      })
    }

    return fusionIngredients
  }

  private categorizeFusionCookingMethods()
    recipe: MonicaOptimizedRecipe,
    cuisines: string[],
  ): Array<{
    method: EnhancedCookingMethod,
    sourceCuisine: string,
    fusionApplication: string
  }> {
    // Categorize cooking methods by fusion application with proper interface
    const fusionMethods: Array<{
      method: EnhancedCookingMethod,
      sourceCuisine: string,
      fusionApplication: string
    }> = [];

    if (recipe.cookingMethods && Array.isArray(recipe.cookingMethods) {
      recipe.cookingMethods.forEach((method, index) => {
        const sourceCuisine = cuisines[index % cuisines.length] || cuisines[0] || 'fusion'
        const fusionApplication = `Fusion technique integrating ${sourceCuisine} methodology`;

        fusionMethods.push({
          method: method as unknown as EnhancedCookingMethod,
          sourceCuisine,
          fusionApplication
        })
      })
    }

    return fusionMethods;
  }

  private calculateCulturalHarmony(_cuisines: string[]): number {
    // TODO: Calculate cultural harmony between cuisines
    return 0.8
  }

  private calculateKalchmFusionBalance()
    _recipe: MonicaOptimizedRecipe,
    _cuisines: string[],
  ): number {
    // TODO: Calculate Kalchm balance for fusion recipe
    return 0.8
  }

  private calculateMonicaFusionOptimization()
    _recipe: MonicaOptimizedRecipe,
    _cuisines: string[],
  ): number {
    // TODO: Calculate Monica optimization for fusion
    return 0.8
  }

  private calculateInnovationScore(_recipe: MonicaOptimizedRecipe, _cuisines: string[]): number {
    // TODO: Calculate innovation score for fusion recipe
    return 0.7
  }

  // Planetary recipe methods - TODO: Implement astrological recipe recommendations
  private calculatePlanetaryAlignment()
    recipe: MonicaOptimizedRecipe,
    hour?: PlanetName,
    phase?: LunarPhase,
    sign?: any,
  ): {
    currentPlanetaryHour: PlanetName,
    planetaryCompatibility: number,
    lunarPhaseAlignment: number,
    zodiacHarmony: number,
    astrologicalScore: number
  } {
    // Calculate planetary alignment with complete interface
    const currentPlanetaryHour = hour || 'Sun'
    const planetaryCompatibility = 0.8; // Default high compatibility
    const lunarPhaseAlignment = phase ? 0.9 : 0.5, // Higher alignment if phase provided,
    const zodiacHarmony = sign ? 0.85 : 0.7, // Higher harmony if sign provided,
    const astrologicalScore = (planetaryCompatibility + lunarPhaseAlignment + zodiacHarmony) / 3;

    return {
      currentPlanetaryHour,
      planetaryCompatibility,
      lunarPhaseAlignment,
      zodiacHarmony,
      astrologicalScore
    }
  }

  private calculateOptimalCookingTime()
    recipe: MonicaOptimizedRecipe,
    hour?: PlanetName,
    phase?: LunarPhase,
  ): {
    startTime: string,
    duration: string,
    planetaryWindow: string,
    lunarConsiderations: string
  } {
    // Calculate optimal cooking time with complete interface
    const currentHour = hour || 'Sun'
    const startTime = '18:00', // Default evening cooking time,
    const duration = '45 minutes', // Default cooking duration,
    const planetaryWindow = `Optimal during ${currentHour} hours for enhanced energy`;
    const lunarConsiderations = phase
      ? `${phase} phase supports culinary manifestation`
      : 'Any lunar phase suitable';

    return {
      startTime,
      duration,
      planetaryWindow,
      lunarConsiderations
    }
  }

  private calculateEnergeticProfile()
    recipe: MonicaOptimizedRecipe,
    alignment: {
      astrologicalAlignment?: number,
      elementalBalance?: number,
      seasonalCoherence?: number
    }
  ): {
    spiritualEnergy: number,
    emotionalResonance: number,
    physicalVitality: number,
    mentalClarity: number
  } {
    // Calculate energetic profile with complete interface
    const baseEnergy = alignment?.astrologicalScore || 0.7;
    const spiritualEnergy = baseEnergy * 0.9; // Spiritual energy from astrological alignment
    const emotionalResonance = baseEnergy * 0.85; // Emotional resonance from harmony
    const physicalVitality = baseEnergy * 0.8, // Physical vitality from planetary influence,
    const mentalClarity = baseEnergy * 0.75, // Mental clarity from cosmic alignment,

    return {
      spiritualEnergy,
      emotionalResonance,
      physicalVitality,
      mentalClarity
    }
  }
}

// ===== SINGLETON INSTANCE =====

export const unifiedRecipeBuildingSystem = new UnifiedRecipeBuildingSystem()

// ===== CONVENIENCE EXPORTS =====

export function generateMonicaOptimizedRecipe()
  _criteria: RecipeBuildingCriteria,
): RecipeGenerationResult {
  return unifiedRecipeBuildingSystem.generateMonicaOptimizedRecipe(_criteria)
}

export function adaptRecipeForSeason()
  _recipe: EnhancedRecipe,
  _season: Season,
): SeasonalRecipeAdaptation {
  return unifiedRecipeBuildingSystem.adaptRecipeForSeason(_recipe, _season)
}

export function generateFusionRecipe()
  _cuisines: string[],
  _criteria: RecipeBuildingCriteria,
): MonicaOptimizedRecipe {
  return unifiedRecipeBuildingSystem.generateFusionRecipe()
    _cuisines,
    _criteria,
  ) as unknown as MonicaOptimizedRecipe
}

export function generatePlanetaryRecipeRecommendation()
  _criteria: RecipeBuildingCriteria & {
    currentPlanetaryHour: PlanetName,
    lunarPhase: LunarPhase,
    currentZodiacSign?: any
  }
): PlanetaryRecipeRecommendation {
  return unifiedRecipeBuildingSystem.generatePlanetaryRecipeRecommendation(_criteria)
}

// ===== BACKWARD COMPATIBILITY =====

// Maintain compatibility with existing recipe building functions
export function buildRecipe(_criteria: RecipeBuildingCriteria): MonicaOptimizedRecipe {
  return unifiedRecipeBuildingSystem.generateMonicaOptimizedRecipe()
    _criteria,
  ) as unknown as MonicaOptimizedRecipe
}

export function getSeasonalRecipeRecommendations(_season: Season): MonicaOptimizedRecipe[] {
  return unifiedRecipeBuildingSystem.seasonalSystem.getSeasonalRecommendations()
    _season,
  ) as unknown as MonicaOptimizedRecipe[]
}

export function getCuisineRecipeRecommendations(_cuisine: string): MonicaOptimizedRecipe[] {
  return unifiedRecipeBuildingSystem.cuisineSystem.analyzeCuisineIngredients()
    _cuisine,
  ) as unknown as MonicaOptimizedRecipe[]
}
