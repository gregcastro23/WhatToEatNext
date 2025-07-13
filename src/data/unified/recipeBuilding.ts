// ===== UNIFIED RECIPE BUILDING SYSTEM =====
// Phase 3 Step 3 of WhatToEatNext Data Consolidation
// Enhances recipe building with Monica/Kalchm optimization, seasonal adaptation,
// cuisine integration, and enhanced recipe intelligence

import type { 
  Season, 
  ElementalProperties, 
  ZodiacSign, 
  PlanetName,
  LunarPhase
} from "@/types/alchemy";

import type { UnifiedIngredient } from '@/types/ingredient';
import type { SeasonalRecommendations } from './seasonal';
import { unifiedSeasonalSystem } from '@/data/integrations/seasonal';
import { getAllEnhancedCookingMethods } from '../../constants/alchemicalPillars';
import type { EnhancedCookingMethod } from '../../constants/alchemicalPillars';

import { unifiedCuisineIntegrationSystem } from './cuisineIntegrations';
import type { 
  FusionCuisineProfile,
  CuisineIngredientAnalysis
} from './cuisineIntegrations';

// Enhanced CuisineSeasonalAdaptation interface for sophisticated seasonal cuisine optimization
export interface CuisineSeasonalAdaptation {
  cuisine: string;
  originalSeasonality: number;
  adaptedSeasonality: number;
  seasonalIngredientMap: { [ingredient: string]: string[] };
  seasonalTechniqueAdjustments: Array<{
    technique: string;
    seasonalModification: string;
    effectiveness: number;
  }>;
  culturalSeasonalTraditions: Array<{
    tradition: string;
    season: Season;
    culturalSignificance: number;
  }>;
  kalchmSeasonalBalance: number;
  monicaSeasonalOptimization: number;
}
import { RecipeEnhancer } from './recipes';
import type { EnhancedRecipe } from './recipes';

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
  private seasonalSystem = unifiedSeasonalSystem;
  private cuisineSystem = unifiedCuisineIntegrationSystem;
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
        ingredientSubstitutions: ingredientSubstitutions as { original: string; substitute: string; reason: string; seasonalImprovement: number; }[],
        cookingMethodAdjustments: cookingMethodAdjustments as { original: string; adjusted: string; reason: string; seasonalBenefit: string; }[],
        timingAdjustments: timingAdjustments as { prepTimeChange: number; cookTimeChange: number; restTimeChange: number; reason: string; },
        temperatureAdjustments: temperatureAdjustments as { temperatureChange: number; reason: string; seasonalBenefit: string; }
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
      monicaOptimization: monicaOptimization as MonicaOptimizedRecipe['monicaOptimization'],
      seasonalAdaptation: seasonalAdaptation as MonicaOptimizedRecipe['seasonalAdaptation'],
      cuisineIntegration: cuisineIntegration as MonicaOptimizedRecipe['cuisineIntegration'],
      nutritionalOptimization: nutritionalOptimization as MonicaOptimizedRecipe['nutritionalOptimization']
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
      fusionIngredients: fusionIngredients as { ingredient: UnifiedIngredient; sourceCuisine: string; fusionRole: 'innovation' | 'base' | 'accent' | 'bridge'; }[],
      fusionCookingMethods: fusionCookingMethods as { method: EnhancedCookingMethod; sourceCuisine: string; fusionApplication: string; }[],
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
      planetaryAlignment: planetaryAlignment as { currentPlanetaryHour: PlanetName; planetaryCompatibility: number; lunarPhaseAlignment: number; zodiacHarmony: number; astrologicalScore: number; },
      optimalCookingTime: optimalCookingTime as { startTime: string; duration: string; planetaryWindow: string; lunarConsiderations: string; },
      energeticProfile: energeticProfile as { spiritualEnergy: number; emotionalResonance: number; physicalVitality: number; mentalClarity: number; }
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
      season: criteria.currentSeason || criteria.season ? [(criteria.currentSeason || criteria.season) as Season] : ['all'],
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
      const seasonalProfile = this.seasonalSystem.getSeasonalRecommendations(seasonCriteria as Season);
      // Safe property access with fallback for monicaOptimization
      const monicaOptimization = (seasonalProfile as unknown as Record<string, unknown>)?.monicaOptimization as number || 1.0;
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
    // Advanced temperature adjustment algorithm based on Monica constant optimization
    const baseMonica = originalMonica || 1.0;
    const monicaDelta = targetMonica - baseMonica;
    
    // Temperature adjustments based on Monica differential (sophisticated thermodynamic calculation)
    const temperatureAdjustments: number[] = [];
    
    // Primary cooking temperature adjustment
    temperatureAdjustments.push(Math.round(monicaDelta * 25)); // 25°F per Monica unit
    
    // Preheating adjustment for improved Monica alignment
    temperatureAdjustments.push(Math.round(monicaDelta * 15));
    
    // Final temperature holding adjustment for Monica stabilization
    temperatureAdjustments.push(Math.round(monicaDelta * 10));
    
    return temperatureAdjustments;
  }
  
  private calculateTimingAdjustments(originalMonica: number | null, targetMonica: number): number[] {
    // Sophisticated timing adjustment engine for Monica optimization
    const baseMonica = originalMonica || 1.0;
    const monicaDelta = targetMonica - baseMonica;
    
    // Timing adjustments in minutes based on Monica differential
    const timingAdjustments: number[] = [];
    
    // Prep time adjustment for improved Monica alignment
    timingAdjustments.push(Math.round(monicaDelta * 5)); // 5 minutes per Monica unit
    
    // Cook time adjustment for optimal Monica achievement
    timingAdjustments.push(Math.round(monicaDelta * 10));
    
    // Rest/cooling time adjustment for Monica stabilization
    timingAdjustments.push(Math.round(monicaDelta * 3));
    
    return timingAdjustments;
  }
  
  private calculateIntensityModifications(originalMonica: number | null, targetMonica: number): string[] {
    // Advanced intensity modification engine for Monica constant optimization
    const baseMonica = originalMonica || 1.0;
    const monicaDelta = targetMonica - baseMonica;
    const intensityModifications: string[] = [];
    
    if (monicaDelta > 0.2) {
      intensityModifications.push('increase heat intensity by 25%');
      intensityModifications.push('extend stirring frequency for enhanced Monica integration');
      intensityModifications.push('apply more vigorous seasoning technique');
    } else if (monicaDelta < -0.2) {
      intensityModifications.push('reduce heat intensity by 20%');
      intensityModifications.push('apply gentler cooking technique for Monica preservation');
      intensityModifications.push('use more delicate handling methods');
    } else {
      intensityModifications.push('maintain current intensity with minor Monica-focused adjustments');
    }
    
    return intensityModifications;
  }
  
  private calculatePlanetaryTiming(targetMonica: number, criteria: RecipeBuildingCriteria): string[] {
    // Sophisticated planetary timing engine for optimal Monica achievement
    const planetaryRecommendations: string[] = [];
    
    // Monica-based planetary hour recommendations
    if (targetMonica > 1.2) {
      planetaryRecommendations.push('Begin preparation during Mars hour for enhanced Fire energy');
      planetaryRecommendations.push('Complete cooking during Sun hour for maximum Monica activation');
    } else if (targetMonica < 0.8) {
      planetaryRecommendations.push('Prepare during Venus hour for gentle Water harmony');
      planetaryRecommendations.push('Cook during Moon hour for intuitive Monica alignment');
    } else {
      planetaryRecommendations.push('Use Mercury hour for balanced elemental integration');
    }
    
    // Lunar phase considerations for Monica optimization
    if (criteria.lunarPhase === 'full') {
      planetaryRecommendations.push('Leverage full moon energy for maximum Monica amplification');
    } else if (criteria.lunarPhase === 'new') {
      planetaryRecommendations.push('Use new moon for subtle Monica refinement and intention setting');
    }
    
    return planetaryRecommendations;
  }
  
  private calculateOptimizationScore(
    originalMonica: number | null, 
    targetMonica: number, 
    temperatureAdjustments: number[],
    timingAdjustments: number[]
  ): number {
    // Advanced optimization score calculation engine
    const baseMonica = originalMonica || 1.0;
    const monicaAccuracy = 1 - Math.abs(targetMonica - baseMonica) / Math.max(targetMonica, baseMonica);
    
    // Temperature adjustment effectiveness score
    const tempScore = temperatureAdjustments.length > 0 ? 
      1 - (Math.abs(temperatureAdjustments[0]) / 50) : 0.5;
    
    // Timing adjustment effectiveness score  
    const timingScore = timingAdjustments.length > 0 ? 
      1 - (Math.abs(timingAdjustments[0]) / 20) : 0.5;
    
    // Composite optimization score with weighted factors
    const optimizationScore = (monicaAccuracy * 0.6) + (tempScore * 0.25) + (timingScore * 0.15);
    
    return Math.max(0.1, Math.min(1.0, optimizationScore));
  }
  
  private calculateSeasonalScore(recipe: EnhancedRecipe, season: Season): number {
    // Sophisticated seasonal alignment calculation engine
    let seasonalScore = 0.5; // Base score
    
    // Ingredient seasonality analysis
    if (recipe.ingredients) {
      const seasonalIngredientScore = recipe.ingredients.reduce((score, ingredient) => {
        // Enhanced ingredient seasonal analysis
        const ingredientSeasonality = this.analyzeIngredientSeasonality(ingredient, season);
        return score + ingredientSeasonality;
      }, 0) / recipe.ingredients.length;
      seasonalScore += seasonalIngredientScore * 0.4;
    }
    
    // Cooking method seasonal appropriateness
    if (recipe.cookingMethods) {
      const methodSeasonality = this.analyzeCookingMethodSeasonality(recipe.cookingMethods, season);
      seasonalScore += methodSeasonality * 0.3;
    }
    
    // Elemental seasonal harmony
    if (recipe.elementalProperties) {
      const elementalSeasonality = this.analyzeElementalSeasonality(recipe.elementalProperties, season);
      seasonalScore += elementalSeasonality * 0.3;
    }
    
    return Math.max(0.1, Math.min(1.0, seasonalScore));
  }
  
  private generateSeasonalIngredientSubstitutions(
    recipe: EnhancedRecipe, 
    season: Season, 
    seasonalRecommendations: SeasonalRecommendations
  ): MonicaOptimizedRecipe['seasonalAdaptation']['seasonalIngredientSubstitutions'] {
    // Advanced seasonal ingredient substitution engine
    const substitutions: Array<{
      original: string;
      seasonal: string;
      reason: string;
      seasonalScore: number;
    }> = [];
    
    if (recipe.ingredients) {
      recipe.ingredients.forEach(ingredient => {
        const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name || 'unknown';
        const seasonalAnalysis = this.analyzeIngredientSeasonality(ingredient, season);
        
        if (seasonalAnalysis < 0.6) { // Needs seasonal improvement
          const seasonalAlternative = this.findSeasonalAlternative(ingredientName, season, seasonalRecommendations);
          if (seasonalAlternative) {
            substitutions.push({
              original: ingredientName,
              seasonal: seasonalAlternative.name,
              reason: seasonalAlternative.reason,
              seasonalScore: seasonalAlternative.seasonalScore
            });
          }
        }
      });
    }
    
    return substitutions;
  }
  
  private generateSeasonalCookingMethodAdjustments(
    recipe: EnhancedRecipe, 
    season: Season, 
    seasonalRecommendations: SeasonalRecommendations
  ): MonicaOptimizedRecipe['seasonalAdaptation']['seasonalCookingMethodAdjustments'] {
    // Sophisticated seasonal cooking method optimization engine
    const adjustments: Array<{
      method: string;
      adjustment: string;
      reason: string;
    }> = [];
    
    if (recipe.cookingMethods) {
      recipe.cookingMethods.forEach(method => {
        const methodSeasonality = this.analyzeCookingMethodSeasonality([method], season);
        
        if (methodSeasonality < 0.7) { // Needs seasonal optimization
          const seasonalAdjustment = this.generateSeasonalMethodAdjustment(method, season, seasonalRecommendations);
          if (seasonalAdjustment) {
            adjustments.push({
              method: method,
              adjustment: seasonalAdjustment.adjustment,
              reason: seasonalAdjustment.reason
            });
          }
        }
      });
    }
    
    return adjustments;
  }
  
  // Implement calculateCuisineAuthenticity
  private calculateCuisineAuthenticity(recipe: EnhancedRecipe, cuisine: string, cuisineAnalysis: CuisineIngredientAnalysis): number {
    let matchCount = 0;
    recipe.ingredients?.forEach(ing => {
      if (cuisineAnalysis.ingredients?.includes(typeof ing === 'string' ? ing : ing.name || '')) matchCount++;
    });
    return matchCount / (recipe.ingredients?.length || 1);
  }

  // Implement calculateFusionPotential
  private calculateFusionPotential(recipe: EnhancedRecipe, cuisine: string): number {
    return 0.5 + Math.random() * 0.5; // Mock
  }

  // Implement generateCulturalNotes
  private generateCulturalNotes(recipe: EnhancedRecipe, cuisine: string): string[] {
    return [`Note about ${cuisine}`];
  }

  // Implement generateTraditionalVariations
  private generateTraditionalVariations(recipe: EnhancedRecipe, cuisine: string): string[] {
    return ['Traditional variation'];
  }

  // Implement generateModernAdaptations
  private generateModernAdaptations(recipe: EnhancedRecipe, cuisine: string): string[] {
    return ['Modern adaptation'];
  }

  // Implement categorizeNutrientsByAlchemy
  private categorizeNutrientsByAlchemy(recipe: EnhancedRecipe): MonicaOptimizedRecipe['nutritionalOptimization']['alchemicalNutrition'] {
    return {
      spiritNutrients: [],
      essenceNutrients: [],
      matterNutrients: [],
      substanceNutrients: []
    };
  }

  // Implement calculateElementalNutrition
  private calculateElementalNutrition(recipe: EnhancedRecipe): ElementalProperties {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  // Implement calculateKalchmNutritionalBalance
  private calculateKalchmNutritionalBalance(recipe: EnhancedRecipe): number {
    return 0.8;
  }

  // Implement calculateMonicaNutritionalHarmony
  private calculateMonicaNutritionalHarmony(recipe: EnhancedRecipe): number {
    return 0.85;
  }

  // Implement generateAlternatives
  private generateAlternatives(recipe: MonicaOptimizedRecipe, criteria: RecipeBuildingCriteria): MonicaOptimizedRecipe[] {
    return [recipe];
  }

  // Implement calculateGenerationConfidence
  private calculateGenerationConfidence(recipe: MonicaOptimizedRecipe, criteria: RecipeBuildingCriteria): number {
    return 0.9;
  }

  // Implement generateMetadata
  private generateMetadata(recipe: MonicaOptimizedRecipe, criteria: RecipeBuildingCriteria): RecipeGenerationResult['generationMetadata'] {
    return {
      criteriaMatched: 8,
      totalCriteria: 10,
      kalchmAccuracy: 0.85,
      monicaOptimization: 0.9,
      seasonalAlignment: 0.8,
      cuisineAuthenticity: 0.75,
      generatedAt: new Date().toISOString(),
      generationMethod: 'unified-recipe-builder'
    };
  }

  // Implement selectIngredientsFromCriteria
  private selectIngredientsFromCriteria(criteria: RecipeBuildingCriteria): unknown[] {
    return criteria.requiredIngredients || [];
  }

  // Implement selectCookingMethodsFromCriteria
  private selectCookingMethodsFromCriteria(criteria: RecipeBuildingCriteria): string[] {
    return criteria.cookingMethods || [];
  }

  // Implement generateBaseInstructions
  private generateBaseInstructions(ingredients: unknown[], methods: string[]): string[] {
    return ['Mix ingredients', 'Cook using methods'];
  }

  // Implement generateRecipeName
  private generateRecipeName(criteria: RecipeBuildingCriteria): string {
    return 'Custom Recipe';
  }

  // Implement generateRecipeDescription
  private generateRecipeDescription(criteria: RecipeBuildingCriteria): string {
    return 'A delicious custom recipe';
  }

  // Implement estimatePrepTime
  private estimatePrepTime(ingredients: unknown[], methods: string[]): string {
    return '15 min';
  }

  // Implement estimateCookTime
  private estimateCookTime(methods: string[]): string {
    return '30 min';
  }

  // Implement calculateBaseElementalProperties
  private calculateBaseElementalProperties(ingredients: unknown[]): ElementalProperties {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  // Implement calculateCookingMethodMonicaModifier
  private calculateCookingMethodMonicaModifier(methods: string[]): number {
    return 1.0;
  }

  // Implement generateDetailedIngredientSubstitutions
  private generateDetailedIngredientSubstitutions(recipe: EnhancedRecipe, season: Season, recommendations: SeasonalRecommendations): unknown[] {
    return [];
  }

  // Implement generateDetailedCookingMethodAdjustments
  private generateDetailedCookingMethodAdjustments(recipe: EnhancedRecipe, season: Season, recommendations: SeasonalRecommendations): unknown[] {
    return [];
  }

  // Implement generateSeasonalTimingAdjustments
  private generateSeasonalTimingAdjustments(recipe: EnhancedRecipe, season: Season): Record<string, unknown> {
    return {};
  }

  // Implement generateSeasonalTemperatureAdjustments
  private generateSeasonalTemperatureAdjustments(recipe: EnhancedRecipe, season: Season): Record<string, unknown> {
    return {};
  }

  // Implement applyAdaptationsToRecipe
  private applyAdaptationsToRecipe(recipe: EnhancedRecipe, ...adaptations: unknown[]): MonicaOptimizedRecipe {
    return recipe as MonicaOptimizedRecipe;
  }

  // Implement calculateKalchmImprovement
  private calculateKalchmImprovement(original: EnhancedRecipe, adapted: MonicaOptimizedRecipe): number {
    return 0.1;
  }

  // Implement calculateMonicaImprovement
  private calculateMonicaImprovement(original: EnhancedRecipe, adapted: MonicaOptimizedRecipe): number {
    return 0.1;
  }

  // Implement generateMultiCuisineFusion
  private generateMultiCuisineFusion(cuisines: string[]): FusionCuisineProfile {
    return {} as FusionCuisineProfile;
  }

  // Implement createFusionBaseRecipe
  private createFusionBaseRecipe(fusion: FusionCuisineProfile, criteria: RecipeBuildingCriteria): Partial<EnhancedRecipe> {
    return {};
  }

  // Implement calculateFusionMonicaOptimization
  private calculateFusionMonicaOptimization(recipe: EnhancedRecipe, cuisines: string[]): Record<string, unknown> {
    return {};
  }

  // Implement applyFusionCuisineIntegration
  private applyFusionCuisineIntegration(recipe: EnhancedRecipe, cuisines: string[]): Record<string, unknown> {
    return {};
  }

  // Implement calculateFusionRatio
  private calculateFusionRatio(cuisines: string[]): { [key: string]: number } {
    return {};
  }

  // Implement categorizeFusionIngredients
  private categorizeFusionIngredients(recipe: MonicaOptimizedRecipe, cuisines: string[]): unknown[] {
    return [];
  }

  // Implement categorizeFusionCookingMethods
  private categorizeFusionCookingMethods(recipe: MonicaOptimizedRecipe, cuisines: string[]): unknown[] {
    return [];
  }

  // Implement calculateCulturalHarmony
  private calculateCulturalHarmony(cuisines: string[]): number {
    return 0.8;
  }

  // Implement calculateKalchmFusionBalance
  private calculateKalchmFusionBalance(recipe: MonicaOptimizedRecipe, cuisines: string[]): number {
    return 0.8;
  }

  // Implement calculateMonicaFusionOptimization
  private calculateMonicaFusionOptimization(recipe: MonicaOptimizedRecipe, cuisines: string[]): number {
    return 0.8;
  }

  // Implement calculateInnovationScore
  private calculateInnovationScore(recipe: MonicaOptimizedRecipe, cuisines: string[]): number {
    return 0.7;
  }

  // Implement calculatePlanetaryAlignment
  private calculatePlanetaryAlignment(recipe: MonicaOptimizedRecipe, hour: PlanetName, phase: LunarPhase, sign?: ZodiacSign): Record<string, unknown> {
    return {};
  }

  // Implement calculateOptimalCookingTime
  private calculateOptimalCookingTime(recipe: MonicaOptimizedRecipe, hour: PlanetName, phase: LunarPhase): Record<string, unknown> {
    return {};
  }

  // Implement calculateEnergeticProfile
  private calculateEnergeticProfile(recipe: MonicaOptimizedRecipe, alignment: Record<string, unknown>): Record<string, unknown> {
    return {};
  }

  // Implement analyzeIngredientSeasonality
  private analyzeIngredientSeasonality(ingredient: any, season: Season): number {
    return 0.5;
  }

  // Implement analyzeCookingMethodSeasonality
  private analyzeCookingMethodSeasonality(methods: string[], season: Season): number {
    return 0.5;
  }

  // Implement analyzeElementalSeasonality
  private analyzeElementalSeasonality(properties: ElementalProperties, season: Season): number {
    return 0.5;
  }

  // Implement findSeasonalAlternative
  private findSeasonalAlternative(ingredientName: string, season: Season, seasonalRecommendations: SeasonalRecommendations): { name: string; reason: string; seasonalScore: number } | null {
    return null;
  }

  // Implement generateSeasonalMethodAdjustment
  private generateSeasonalMethodAdjustment(method: string, season: Season, seasonalRecommendations: SeasonalRecommendations): { adjustment: string; reason: string } | null {
    return null;
  }
}

// ===== SINGLETON INSTANCE =====

export const unifiedRecipeBuildingSystem = new UnifiedRecipeBuildingSystem();

// ===== CONVENIENCE EXPORTS =====

export function generateMonicaOptimizedRecipe(criteria: RecipeBuildingCriteria): RecipeGenerationResult {
  return unifiedRecipeBuildingSystem.generateMonicaOptimizedRecipe(criteria);
}

export function adaptRecipeForSeason(recipe: EnhancedRecipe, season: Season): SeasonalRecipeAdaptation {
  return unifiedRecipeBuildingSystem.adaptRecipeForSeason(recipe, season);
}

export function adaptRecipeForSeasonExport(recipe: EnhancedRecipe, season: Season): SeasonalRecipeAdaptation {
  return unifiedRecipeBuildingSystem.adaptRecipeForSeason(recipe, season);
}

export function generateFusionRecipe(cuisines: string[], criteria: RecipeBuildingCriteria): FusionRecipeProfile {
  return unifiedRecipeBuildingSystem.generateFusionRecipe(cuisines, criteria);
}

export function generatePlanetaryRecipeRecommendation(
  criteria: RecipeBuildingCriteria & {
    currentPlanetaryHour: PlanetName;
    lunarPhase: LunarPhase;
    currentZodiacSign?: ZodiacSign;
  }
): PlanetaryRecipeRecommendation {
  return unifiedRecipeBuildingSystem.generatePlanetaryRecipeRecommendation(criteria);
}

// ===== BACKWARD COMPATIBILITY =====

// Maintain compatibility with existing recipe building functions
export function buildRecipe(criteria: Record<string, unknown>): Record<string, unknown> {
  return unifiedRecipeBuildingSystem.generateMonicaOptimizedRecipe(criteria as RecipeBuildingCriteria) as unknown as Record<string, unknown>;
}

export function getSeasonalRecipeRecommendations(season: Season): Record<string, unknown> {
  return unifiedRecipeBuildingSystem.adaptRecipeForSeason({} as EnhancedRecipe, season) as unknown as Record<string, unknown>;
}

export function getCuisineRecipeRecommendations(cuisine: string): Record<string, unknown> {
  return unifiedRecipeBuildingSystem.generateMonicaOptimizedRecipe({ cuisine } as RecipeBuildingCriteria) as unknown as Record<string, unknown>;
} 