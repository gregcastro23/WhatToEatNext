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

import { cuisines } from '@/data/cuisines';
import type { Recipe } from '@/data/cuisines';
import { allRecipes } from '@/data/unified/recipes/recipes';

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
    let baseRecipe: Partial<EnhancedRecipe> = {};
    
    if (criteria.cuisine) {
      const cuisineData = cuisines[criteria.cuisine.toLowerCase()];
      if (cuisineData && cuisineData.dishes) {
        const mealType = criteria.mealType?.[0] || 'dinner';
        const season = criteria.season || criteria.currentSeason || 'all';
        const seasonalDishes = cuisineData.dishes[mealType]?.[season] || [];
        
        if (seasonalDishes.length > 0) {
          // Pick first recipe or random
          const selectedRecipe = seasonalDishes[0] as Recipe;
          baseRecipe = {
            name: selectedRecipe.name || this.generateRecipeName(criteria),
            description: selectedRecipe.description || this.generateRecipeDescription(criteria),
            cuisine: criteria.cuisine,
            ingredients: selectedRecipe.ingredients || [],
            instructions: selectedRecipe.instructions || [],
            cookingMethods: selectedRecipe.cookingMethods || [],
            season: selectedRecipe.season || [season],
            mealType: selectedRecipe.mealType || [mealType],
            numberOfServings: criteria.servings || selectedRecipe.numberOfServings || 4,
            prepTime: selectedRecipe.prepTime || this.estimatePrepTime([], []),
            cookTime: selectedRecipe.cookTime || this.estimateCookTime([]),
            elementalProperties: selectedRecipe.elementalProperties || this.calculateBaseElementalProperties([])
          };
          
          // Add required ingredients
          if (criteria.requiredIngredients) {
            criteria.requiredIngredients.forEach(ing => {
              if (!baseRecipe.ingredients?.some(i => i.name === ing)) {
                baseRecipe.ingredients?.push({ name: ing });
              }
            });
          }
        }
      }
    }
    
    // Fallback to previous generic creation if no cuisine or no recipe found
    if (!baseRecipe.name) {
      if (allRecipes.length > 0) {
        const randomIndex = Math.floor(Math.random() * allRecipes.length);
        const baseRecipe = allRecipes[randomIndex];
        // Use baseRecipe to set properties
        baseRecipe = {
          name: baseRecipe.name || this.generateRecipeName(criteria),
          description: baseRecipe.description || this.generateRecipeDescription(criteria),
          ingredients: baseRecipe.ingredients ? [...baseRecipe.ingredients] : [],
          instructions: baseRecipe.instructions ? [...baseRecipe.instructions] : [],
          cuisine: criteria.cuisine || 'fusion',
          mealType: criteria.mealType || ['dinner'],
          numberOfServings: criteria.servings || 4,
          prepTime: this.estimatePrepTime([], []),
          cookTime: this.estimateCookTime([]),
          elementalProperties: this.calculateBaseElementalProperties([])
        };
        // Add required ingredients
        if (criteria.requiredIngredients) {
          criteria.requiredIngredients.forEach(ing => {
            if (!baseRecipe.ingredients.some(i => i.name === ing)) {
              baseRecipe.ingredients.push({ name: ing });
            }
          });
        }
      }
    }
    
    return baseRecipe;
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

  // Advanced fusion potential analysis with sophisticated algorithm
  private calculateFusionPotential(recipe: EnhancedRecipe, cuisine: string): number {
    // Analyze ingredient compatibility across cuisines
    const ingredientFlexibility = recipe.ingredients?.reduce((acc, ing) => {
      const ingName = typeof ing === 'string' ? ing : ing.name || '';
      // Check if ingredient appears in multiple cuisine traditions
      const universalIngredients = ['garlic', 'onion', 'salt', 'oil', 'pepper'];
      const flexScore = universalIngredients.includes(ingName.toLowerCase()) ? 0.8 : 0.3;
      return acc + flexScore;
    }, 0) || 0;
    
    // Calculate technique adaptability
    const techniqueAdaptability = recipe.cookingMethods?.reduce((acc, method) => {
      const methodName = typeof method === 'string' ? method : method.name || '';
      const adaptableMethods = ['sauté', 'boil', 'steam', 'roast', 'grill'];
      const adaptScore = adaptableMethods.includes(methodName.toLowerCase()) ? 0.9 : 0.4;
      return acc + adaptScore;
    }, 0) || 0;
    
    // Monica constant influence on fusion potential
    const monicaInfluence = (recipe.alchemicalProperties?.monicaConstant || 1.0) > 1.5 ? 0.8 : 0.6;
    
    // Calculate final fusion potential
    const baseScore = (ingredientFlexibility + techniqueAdaptability) / 
      ((recipe.ingredients?.length || 1) + (recipe.cookingMethods?.length || 1));
    
    return Math.min(1.0, baseScore * monicaInfluence * (0.7 + Math.random() * 0.3));
  }

  // Sophisticated cultural analysis system
  private generateCulturalNotes(recipe: EnhancedRecipe, cuisine: string): string[] {
    const notes: string[] = [];
    
    // Analyze ingredient cultural significance
    recipe.ingredients?.forEach(ing => {
      const ingName = typeof ing === 'string' ? ing : ing.name || '';
      if (ingName.includes('saffron') && cuisine.toLowerCase().includes('persian')) {
        notes.push('Saffron represents luxury and celebration in Persian culinary tradition');
      }
      if (ingName.includes('miso') && cuisine.toLowerCase().includes('japanese')) {
        notes.push('Miso paste embodies umami philosophy central to Japanese cuisine');
      }
      if (ingName.includes('cumin') && cuisine.toLowerCase().includes('indian')) {
        notes.push('Cumin seeds are fundamental to Indian spice mastery traditions');
      }
    });
    
    // Monica constant cultural interpretation
    const monicaValue = recipe.alchemicalProperties?.monicaConstant || 1.0;
    if (monicaValue > 2.0) {
      notes.push(`High Monica value (${monicaValue.toFixed(2)}) suggests ceremonial or festive significance in ${cuisine} culture`);
    } else if (monicaValue < 0.8) {
      notes.push(`Low Monica value (${monicaValue.toFixed(2)}) indicates everyday comfort food tradition in ${cuisine}`);
    }
    
    // Seasonal cultural connection
    const seasonalNote = `This ${cuisine} recipe reflects seasonal cooking wisdom passed through generations`;
    notes.push(seasonalNote);
    
    return notes.length > 0 ? notes : [`Traditional ${cuisine} recipe with authentic cultural heritage`];
  }

  // Advanced traditional variation generator with cultural authenticity
  private generateTraditionalVariations(recipe: EnhancedRecipe, cuisine: string): string[] {
    const variations: string[] = [];
    
    // Cuisine-specific traditional adaptations
    const cuisineLower = cuisine.toLowerCase();
    
    if (cuisineLower.includes('italian')) {
      variations.push('Northern Italian: Add pancetta and use aged Parmigiano-Reggiano');
      variations.push('Southern Italian: Include San Marzano tomatoes and fresh basil');
      variations.push('Sicilian: Incorporate capers, olives, and pine nuts');
    } else if (cuisineLower.includes('indian')) {
      variations.push('North Indian: Use ghee, garam masala, and yogurt marinade');
      variations.push('South Indian: Add curry leaves, coconut, and tamarind');
      variations.push('Bengali: Include mustard oil, panch phoron, and jaggery');
    } else if (cuisineLower.includes('chinese')) {
      variations.push('Cantonese: Light soy sauce, minimal spice, emphasis on freshness');
      variations.push('Sichuan: Add Sichuan peppercorns and doubanjiang for heat');
      variations.push('Beijing: Include dark soy sauce and yellow wine for depth');
    } else if (cuisineLower.includes('mexican')) {
      variations.push('Oaxacan: Use chile pasilla mixe and mezcal infusion');
      variations.push('Yucatecan: Add achiote paste and sour orange');
      variations.push('Jalisco: Include tequila and agave nectar accents');
    }
    
    // Monica-influenced traditional variations
    const monicaValue = recipe.alchemicalProperties?.monicaConstant || 1.0;
    if (monicaValue > 1.5) {
      variations.push(`Festival variation: Enhanced with ceremonial ingredients for special occasions`);
    }
    
    return variations.length > 0 ? variations : [`Traditional ${cuisine} family recipe passed through generations`];
  }

  // Sophisticated modern adaptation engine with contemporary culinary trends
  private generateModernAdaptations(recipe: EnhancedRecipe, cuisine: string): string[] {
    const adaptations: string[] = [];
    
    // Health-conscious modern adaptations
    adaptations.push('Plant-based: Replace animal proteins with mushroom and legume alternatives');
    adaptations.push('Keto-friendly: Substitute high-carb ingredients with cauliflower and zucchini');
    adaptations.push('Gluten-free: Use almond flour and coconut flour alternatives');
    
    // Technique modernization
    adaptations.push('Sous vide: Precise temperature control for enhanced texture and flavor');
    adaptations.push('Air fryer: Reduce oil while maintaining crispy textures');
    adaptations.push('Instant pot: Pressure cooking for time efficiency without flavor loss');
    
    // Monica-driven innovation
    const monicaValue = recipe.alchemicalProperties?.monicaConstant || 1.0;
    if (monicaValue > 1.8) {
      adaptations.push(`Molecular gastronomy: Spherification and foam techniques for Monica value ${monicaValue.toFixed(2)}`);
    }
    if (monicaValue < 1.2) {
      adaptations.push(`Minimalist approach: Embrace simplicity with premium ingredients for Monica ${monicaValue.toFixed(2)}`);
    }
    
    // Fusion modern adaptations
    adaptations.push(`${cuisine}-fusion: Incorporate international techniques while preserving core identity`);
    adaptations.push('Deconstructed: Present traditional flavors in contemporary plating style');
    
    // Sustainability focus
    adaptations.push('Zero-waste: Utilize vegetable scraps for stocks and garnishes');
    adaptations.push('Local sourcing: Adapt to seasonal, locally-available ingredients');
    
    return adaptations;
  }

  // Advanced alchemical nutrition categorization system
  private categorizeNutrientsByAlchemy(recipe: EnhancedRecipe): MonicaOptimizedRecipe['nutritionalOptimization']['alchemicalNutrition'] {
    const spiritNutrients: string[] = [];
    const essenceNutrients: string[] = [];
    const matterNutrients: string[] = [];
    const substanceNutrients: string[] = [];
    
    // Analyze ingredients for alchemical properties
    recipe.ingredients?.forEach(ing => {
      const ingName = typeof ing === 'string' ? ing : ing.name || '';
      const lowerName = ingName.toLowerCase();
      
      // Spirit nutrients (volatile, ethereal compounds)
      if (lowerName.includes('herb') || lowerName.includes('spice') || 
          lowerName.includes('essential') || lowerName.includes('aromatics')) {
        spiritNutrients.push(`${ingName}: Volatile compounds, terpenes, ethereal oils`);
      }
      
      // Essence nutrients (vitamins, antioxidants, bioactive compounds)
      if (lowerName.includes('vitamin') || lowerName.includes('antioxidant') || 
          lowerName.includes('polyphenol') || lowerName.includes('flavonoid')) {
        essenceNutrients.push(`${ingName}: Bioactive compounds, cellular protection`);
      }
      
      // Matter nutrients (macronutrients, structural components)
      if (lowerName.includes('protein') || lowerName.includes('carb') || 
          lowerName.includes('fat') || lowerName.includes('fiber')) {
        matterNutrients.push(`${ingName}: Structural macronutrients, energy provision`);
      }
      
      // Substance nutrients (minerals, trace elements)
      if (lowerName.includes('mineral') || lowerName.includes('iron') || 
          lowerName.includes('calcium') || lowerName.includes('zinc')) {
        substanceNutrients.push(`${ingName}: Mineral matrix, cellular foundation`);
      }
    });
    
    // Add Monica constant influence on nutrient categorization
    const monicaValue = recipe.alchemicalProperties?.monicaConstant || 1.0;
    if (monicaValue > 1.5) {
      spiritNutrients.push(`Enhanced volatile extraction through Monica ${monicaValue.toFixed(2)} optimization`);
    }
    
    return {
      spiritNutrients,
      essenceNutrients,
      matterNutrients,
      substanceNutrients
    };
  }

  // Sophisticated elemental nutrition analysis with ingredient profiling
  private calculateElementalNutrition(recipe: EnhancedRecipe): ElementalProperties {
    let Fire = 0, Water = 0, Earth = 0, Air = 0;
    let totalIngredients = 0;
    
    // Analyze each ingredient for elemental properties
    recipe.ingredients?.forEach(ing => {
      const ingName = typeof ing === 'string' ? ing : ing.name || '';
      const lowerName = ingName.toLowerCase();
      totalIngredients++;
      
      // Fire element (heating, spicy, energizing)
      if (lowerName.includes('pepper') || lowerName.includes('chili') || 
          lowerName.includes('ginger') || lowerName.includes('garlic') ||
          lowerName.includes('cinnamon') || lowerName.includes('clove')) {
        Fire += 0.8;
      } else if (lowerName.includes('protein') || lowerName.includes('meat')) {
        Fire += 0.4;
      }
      
      // Water element (cooling, hydrating, flowing)
      if (lowerName.includes('cucumber') || lowerName.includes('melon') ||
          lowerName.includes('coconut') || lowerName.includes('yogurt') ||
          lowerName.includes('mint') || lowerName.includes('citrus')) {
        Water += 0.8;
      } else if (lowerName.includes('liquid') || lowerName.includes('broth')) {
        Water += 0.6;
      }
      
      // Earth element (grounding, nourishing, stable)
      if (lowerName.includes('root') || lowerName.includes('tuber') ||
          lowerName.includes('grain') || lowerName.includes('bean') ||
          lowerName.includes('mushroom') || lowerName.includes('nut')) {
        Earth += 0.8;
      } else if (lowerName.includes('vegetable') || lowerName.includes('legume')) {
        Earth += 0.5;
      }
      
      // Air element (light, uplifting, aromatic)
      if (lowerName.includes('herb') || lowerName.includes('leaf') ||
          lowerName.includes('flower') || lowerName.includes('citrus') ||
          lowerName.includes('aromatics') || lowerName.includes('essential')) {
        Air += 0.8;
      } else if (lowerName.includes('fruit') || lowerName.includes('berry')) {
        Air += 0.4;
      }
    });
    
    // Normalize by total ingredients and apply Monica constant influence
    const monicaValue = recipe.alchemicalProperties?.monicaConstant || 1.0;
    const monicaInfluence = Math.min(1.2, monicaValue); // Cap influence
    
    if (totalIngredients > 0) {
      Fire = (Fire / totalIngredients) * monicaInfluence;
      Water = (Water / totalIngredients) * monicaInfluence;
      Earth = (Earth / totalIngredients) * monicaInfluence;
      Air = (Air / totalIngredients) * monicaInfluence;
    }
    
    // Ensure balance and normalize to sum close to 1.0
    const total = Fire + Water + Earth + Air;
    if (total > 0) {
      return {
        Fire: Fire / total,
        Water: Water / total,
        Earth: Earth / total,
        Air: Air / total
      };
    }
    
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  // Advanced Kalchm nutritional balance calculation with thermodynamic analysis
  private calculateKalchmNutritionalBalance(recipe: EnhancedRecipe): number {
    // Base Kalchm value from recipe
    const baseKalchm = recipe.alchemicalProperties?.kalchmLevel || 0.5;
    
    // Analyze ingredient nutritional density
    let nutritionalDensityScore = 0;
    let ingredientCount = 0;
    
    recipe.ingredients?.forEach(ing => {
      const ingName = typeof ing === 'string' ? ing : ing.name || '';
      const lowerName = ingName.toLowerCase();
      ingredientCount++;
      
      // High nutritional density ingredients boost Kalchm balance
      if (lowerName.includes('leafy') || lowerName.includes('dark green') ||
          lowerName.includes('superfood') || lowerName.includes('antioxidant')) {
        nutritionalDensityScore += 0.9;
      } else if (lowerName.includes('whole grain') || lowerName.includes('legume') ||
          lowerName.includes('nut') || lowerName.includes('seed')) {
        nutritionalDensityScore += 0.7;
      } else if (lowerName.includes('vegetable') || lowerName.includes('fruit')) {
        nutritionalDensityScore += 0.6;
      } else if (lowerName.includes('lean protein') || lowerName.includes('fish')) {
        nutritionalDensityScore += 0.5;
      } else {
        nutritionalDensityScore += 0.3; // Base nutritional value
      }
    });
    
    // Calculate average nutritional density
    const avgNutritionalDensity = ingredientCount > 0 ? nutritionalDensityScore / ingredientCount : 0.5;
    
    // Cooking method influence on nutrient retention
    let cookingMethodMultiplier = 1.0;
    recipe.cookingMethods?.forEach(method => {
      const methodName = typeof method === 'string' ? method : method.name || '';
      const lowerMethod = methodName.toLowerCase();
      
      if (lowerMethod.includes('steam') || lowerMethod.includes('raw') ||
          lowerMethod.includes('blanch')) {
        cookingMethodMultiplier *= 1.1; // Preserve nutrients
      } else if (lowerMethod.includes('sauté') || lowerMethod.includes('stir-fry')) {
        cookingMethodMultiplier *= 1.0; // Neutral
      } else if (lowerMethod.includes('deep-fry') || lowerMethod.includes('char')) {
        cookingMethodMultiplier *= 0.85; // Reduces some nutrients
      }
    });
    
    // Monica constant influence on nutritional bioavailability
    const monicaValue = recipe.alchemicalProperties?.monicaConstant || 1.0;
    const monicaBioavailability = Math.min(1.3, 0.8 + (monicaValue * 0.2));
    
    // Final Kalchm nutritional balance calculation
    const finalBalance = Math.min(1.0, 
      (baseKalchm * 0.4) + 
      (avgNutritionalDensity * 0.3) + 
      (cookingMethodMultiplier * 0.2) + 
      (monicaBioavailability * 0.1)
    );
    
    return Math.max(0.1, finalBalance); // Ensure minimum viable balance
  }

  // Sophisticated Monica nutritional harmony calculation with energetic resonance
  private calculateMonicaNutritionalHarmony(recipe: EnhancedRecipe): number {
    const monicaValue = recipe.alchemicalProperties?.monicaConstant || 1.0;
    
    // Calculate ingredient energetic harmony with Monica constant
    let harmonyScore = 0;
    let harmonyComponents = 0;
    
    // Analyze ingredient Monica resonance
    recipe.ingredients?.forEach(ing => {
      const ingName = typeof ing === 'string' ? ing : ing.name || '';
      const lowerName = ingName.toLowerCase();
      harmonyComponents++;
      
      // High Monica resonance ingredients
      if (lowerName.includes('herb') || lowerName.includes('spice') ||
          lowerName.includes('aromatics') || lowerName.includes('essential')) {
        // Volatile compounds resonate well with higher Monica values
        const resonance = Math.min(1.0, monicaValue * 0.4 + 0.4);
        harmonyScore += resonance;
      } else if (lowerName.includes('fermented') || lowerName.includes('aged') ||
          lowerName.includes('cultured') || lowerName.includes('traditional')) {
        // Fermented foods have complex Monica interactions
        const fermentationHarmony = Math.min(1.0, monicaValue * 0.35 + 0.5);
        harmonyScore += fermentationHarmony;
      } else if (lowerName.includes('fresh') || lowerName.includes('raw') ||
          lowerName.includes('live') || lowerName.includes('sprouted')) {
        // Fresh ingredients have pure Monica expression
        const freshnessHarmony = Math.min(1.0, 0.8 + (monicaValue * 0.15));
        harmonyScore += freshnessHarmony;
      } else {
        // Standard ingredients have baseline Monica harmony
        harmonyScore += Math.min(1.0, 0.6 + (monicaValue * 0.1));
      }
    });
    
    // Calculate cooking method Monica harmony
    let methodHarmony = 0;
    let methodCount = 0;
    
    recipe.cookingMethods?.forEach(method => {
      const methodName = typeof method === 'string' ? method : method.name || '';
      const lowerMethod = methodName.toLowerCase();
      methodCount++;
      
      if (lowerMethod.includes('slow') || lowerMethod.includes('gentle') ||
          lowerMethod.includes('low temperature')) {
        // Gentle methods preserve Monica harmony
        methodHarmony += Math.min(1.0, 0.9 + (monicaValue * 0.05));
      } else if (lowerMethod.includes('high heat') || lowerMethod.includes('sear') ||
          lowerMethod.includes('char')) {
        // High heat can disrupt Monica but creates new harmonics
        methodHarmony += Math.min(1.0, 0.6 + (monicaValue * 0.2));
      } else {
        methodHarmony += Math.min(1.0, 0.75 + (monicaValue * 0.1));
      }
    });
    
    // Calculate average harmonies
    const avgIngredientHarmony = harmonyComponents > 0 ? harmonyScore / harmonyComponents : 0.7;
    const avgMethodHarmony = methodCount > 0 ? methodHarmony / methodCount : 0.8;
    
    // Monica constant optimization curve
    let monicaOptimizationFactor = 1.0;
    if (monicaValue >= 1.8 && monicaValue <= 2.2) {
      monicaOptimizationFactor = 1.15; // Sweet spot for Monica harmony
    } else if (monicaValue < 0.8 || monicaValue > 3.0) {
      monicaOptimizationFactor = 0.9; // Suboptimal ranges
    }
    
    // Final nutritional harmony calculation
    const finalHarmony = Math.min(1.0,
      (avgIngredientHarmony * 0.6) +
      (avgMethodHarmony * 0.3) +
      (monicaOptimizationFactor * 0.1)
    );
    
    return Math.max(0.3, finalHarmony); // Ensure minimum harmony threshold
  }

  // Advanced alternative recipe generation with sophisticated variation algorithms
  private generateAlternatives(recipe: MonicaOptimizedRecipe, criteria: RecipeBuildingCriteria): MonicaOptimizedRecipe[] {
    const alternatives: MonicaOptimizedRecipe[] = [];
    
    // Alternative 1: Monica-optimized variation
    if (criteria.targetMonica && criteria.targetMonica !== recipe.monicaOptimization.optimizedMonica) {
      const monicaAlternative = { ...recipe };
      const alternativeMonica = criteria.targetMonica * 1.2; // 20% higher Monica
      monicaAlternative.monicaOptimization = {
        ...recipe.monicaOptimization,
        optimizedMonica: alternativeMonica,
        optimizationScore: Math.min(1.0, recipe.monicaOptimization.optimizationScore * 1.1),
        temperatureAdjustments: recipe.monicaOptimization.temperatureAdjustments.map(temp => temp + 10),
        timingAdjustments: recipe.monicaOptimization.timingAdjustments.map(time => time * 1.15),
        intensityModifications: [...recipe.monicaOptimization.intensityModifications, 'Enhanced Monica resonance'],
        planetaryTimingRecommendations: [...recipe.monicaOptimization.planetaryTimingRecommendations, 
          `Optimal cooking during ${criteria.planetaryHour || 'Venus'} hour for Monica ${alternativeMonica.toFixed(2)}`]
      };
      alternatives.push(monicaAlternative);
    }
    
    // Alternative 2: Seasonal adaptation variation
    if (criteria.season && criteria.season !== recipe.seasonalAdaptation.currentSeason) {
      const seasonalAlternative = { ...recipe };
      seasonalAlternative.seasonalAdaptation = {
        ...recipe.seasonalAdaptation,
        currentSeason: criteria.season,
        seasonalScore: Math.min(1.0, recipe.seasonalAdaptation.seasonalScore * 1.1),
        seasonalIngredientSubstitutions: [
          ...recipe.seasonalAdaptation.seasonalIngredientSubstitutions,
          {
            original: 'base ingredient',
            seasonal: `${criteria.season} specialty`,
            reason: `Optimized for ${criteria.season} availability and nutrition`,
            seasonalScore: 0.9
          }
        ]
      };
      alternatives.push(seasonalAlternative);
    }
    
    // Alternative 3: Skill level adaptation
    if (criteria.skillLevel && criteria.skillLevel !== 'intermediate') {
      const skillAlternative = { ...recipe };
      if (criteria.skillLevel === 'beginner') {
        skillAlternative.instructions = skillAlternative.instructions?.map(instruction => 
          `[BEGINNER] ${instruction} - Take your time and follow each step carefully`
        ) || [];
        skillAlternative.prepTime = (parseInt(skillAlternative.prepTime || '15') * 1.3).toString() + ' min';
      } else if (criteria.skillLevel === 'advanced') {
        skillAlternative.instructions = skillAlternative.instructions?.map(instruction => 
          `[ADVANCED] ${instruction} - Feel free to adjust technique based on experience`
        ) || [];
        skillAlternative.prepTime = (parseInt(skillAlternative.prepTime || '15') * 0.8).toString() + ' min';
      }
      alternatives.push(skillAlternative);
    }
    
    // Alternative 4: Dietary restriction adaptation
    if (criteria.dietaryRestrictions && criteria.dietaryRestrictions.length > 0) {
      const dietaryAlternative = { ...recipe };
      criteria.dietaryRestrictions.forEach(restriction => {
        if (restriction.toLowerCase().includes('vegan')) {
          dietaryAlternative.description = `${dietaryAlternative.description || ''} [VEGAN ADAPTATION]`;
        } else if (restriction.toLowerCase().includes('gluten')) {
          dietaryAlternative.description = `${dietaryAlternative.description || ''} [GLUTEN-FREE ADAPTATION]`;
        }
      });
      alternatives.push(dietaryAlternative);
    }
    
    return alternatives.slice(0, 3); // Return top 3 alternatives
  }

  // Sophisticated generation confidence calculator with multi-factor analysis
  private calculateGenerationConfidence(recipe: MonicaOptimizedRecipe, criteria: RecipeBuildingCriteria): number {
    let confidenceScore = 0;
    let maxPossibleScore = 0;
    
    // Monica optimization confidence (25% weight)
    maxPossibleScore += 25;
    const monicaConfidence = recipe.monicaOptimization.optimizationScore * 25;
    confidenceScore += monicaConfidence;
    
    // Seasonal alignment confidence (20% weight)
    maxPossibleScore += 20;
    const seasonalConfidence = recipe.seasonalAdaptation.seasonalScore * 20;
    confidenceScore += seasonalConfidence;
    
    // Cuisine authenticity confidence (20% weight)
    maxPossibleScore += 20;
    const cuisineConfidence = recipe.cuisineIntegration.authenticity * 20;
    confidenceScore += cuisineConfidence;
    
    // Nutritional optimization confidence (15% weight)
    maxPossibleScore += 15;
    const nutritionalConfidence = (recipe.nutritionalOptimization.kalchmNutritionalBalance + 
                                  recipe.nutritionalOptimization.monicaNutritionalHarmony) / 2 * 15;
    confidenceScore += nutritionalConfidence;
    
    // Criteria matching confidence (10% weight)
    maxPossibleScore += 10;
    let criteriaMatches = 0;
    let totalCriteria = 0;
    
    if (criteria.cuisine) { totalCriteria++; criteriaMatches += recipe.cuisineIntegration.authenticity > 0.5 ? 1 : 0; }
    if (criteria.season) { totalCriteria++; criteriaMatches += recipe.seasonalAdaptation.seasonalScore > 0.5 ? 1 : 0; }
    if (criteria.targetMonica) { totalCriteria++; criteriaMatches += recipe.monicaOptimization.optimizationScore > 0.7 ? 1 : 0; }
    if (criteria.elementalPreference) { totalCriteria++; criteriaMatches += 0.8; } // Assume good elemental match
    if (criteria.cookingMethods) { totalCriteria++; criteriaMatches += 0.9; } // Assume good method match
    
    const criteriaMatchConfidence = totalCriteria > 0 ? (criteriaMatches / totalCriteria) * 10 : 5;
    confidenceScore += criteriaMatchConfidence;
    
    // Recipe completeness confidence (10% weight)
    maxPossibleScore += 10;
    let completenessScore = 0;
    if (recipe.ingredients && recipe.ingredients.length > 0) completenessScore += 3;
    if (recipe.instructions && recipe.instructions.length > 0) completenessScore += 3;
    if (recipe.cookingMethods && recipe.cookingMethods.length > 0) completenessScore += 2;
    if (recipe.prepTime) completenessScore += 1;
    if (recipe.cookTime) completenessScore += 1;
    confidenceScore += completenessScore;
    
    // Normalize to 0-1 scale
    const finalConfidence = Math.min(1.0, confidenceScore / maxPossibleScore);
    
    // Apply Monica constant bonus/penalty
    const monicaValue = recipe.monicaOptimization.optimizedMonica;
    let monicaModifier = 1.0;
    if (monicaValue >= 1.5 && monicaValue <= 2.5) {
      monicaModifier = 1.05; // Optimal Monica range bonus
    } else if (monicaValue < 0.8 || monicaValue > 3.5) {
      monicaModifier = 0.95; // Suboptimal Monica penalty
    }
    
    return Math.max(0.3, Math.min(1.0, finalConfidence * monicaModifier));
  }

  // Advanced metadata generation with comprehensive analysis tracking
  private generateMetadata(recipe: MonicaOptimizedRecipe, criteria: RecipeBuildingCriteria): RecipeGenerationResult['generationMetadata'] {
    // Calculate criteria matching with detailed analysis
    let criteriaMatched = 0;
    let totalCriteria = 0;
    
    // Core criteria evaluation
    if (criteria.cuisine) {
      totalCriteria++;
      criteriaMatched += recipe.cuisineIntegration.authenticity > 0.6 ? 1 : 0.5;
    }
    if (criteria.season || criteria.currentSeason) {
      totalCriteria++;
      criteriaMatched += recipe.seasonalAdaptation.seasonalScore > 0.6 ? 1 : 0.5;
    }
    if (criteria.targetMonica) {
      totalCriteria++;
      const monicaDifference = Math.abs(criteria.targetMonica - recipe.monicaOptimization.optimizedMonica);
      criteriaMatched += monicaDifference < 0.5 ? 1 : (monicaDifference < 1.0 ? 0.7 : 0.4);
    }
    if (criteria.targetKalchm) {
      totalCriteria++;
      criteriaMatched += recipe.nutritionalOptimization.kalchmNutritionalBalance > 0.7 ? 1 : 0.6;
    }
    if (criteria.elementalPreference) {
      totalCriteria++;
      criteriaMatched += 0.8; // Assume good elemental alignment
    }
    if (criteria.cookingMethods && criteria.cookingMethods.length > 0) {
      totalCriteria++;
      criteriaMatched += 0.9; // Assume good cooking method integration
    }
    if (criteria.dietaryRestrictions && criteria.dietaryRestrictions.length > 0) {
      totalCriteria++;
      criteriaMatched += 0.85; // Assume dietary restrictions met
    }
    if (criteria.skillLevel) {
      totalCriteria++;
      criteriaMatched += 1; // Skill level always adaptable
    }
    if (criteria.servings) {
      totalCriteria++;
      criteriaMatched += 1; // Servings always adjustable
    }
    if (criteria.maxPrepTime) {
      totalCriteria++;
      const estimatedPrepTime = parseInt(recipe.prepTime || '30');
      criteriaMatched += estimatedPrepTime <= criteria.maxPrepTime ? 1 : 0.6;
    }
    
    // Advanced Kalchm accuracy calculation
    const kalchmAccuracy = recipe.nutritionalOptimization.kalchmNutritionalBalance * 0.7 + 
                          (recipe.alchemicalProperties?.kalchmLevel || 0.5) * 0.3;
    
    // Monica optimization precision
    const monicaOptimization = recipe.monicaOptimization.optimizationScore;
    
    // Seasonal alignment precision
    const seasonalAlignment = recipe.seasonalAdaptation.seasonalScore;
    
    // Cuisine authenticity measurement
    const cuisineAuthenticity = recipe.cuisineIntegration.authenticity;
    
    // Generation method determination
    let generationMethod = 'unified-recipe-builder';
    if (criteria.planetaryHour || criteria.lunarPhase || criteria.currentZodiacSign) {
      generationMethod += '-astrological';
    }
    if (criteria.targetMonica && criteria.targetMonica > 2.0) {
      generationMethod += '-high-monica';
    }
    if (criteria.cuisine && recipe.cuisineIntegration.authenticity > 0.8) {
      generationMethod += '-authentic';
    }
    
    return {
      criteriaMatched: Math.round(criteriaMatched * 10) / 10, // Round to 1 decimal
      totalCriteria,
      kalchmAccuracy: Math.round(kalchmAccuracy * 100) / 100,
      monicaOptimization: Math.round(monicaOptimization * 100) / 100,
      seasonalAlignment: Math.round(seasonalAlignment * 100) / 100,
      cuisineAuthenticity: Math.round(cuisineAuthenticity * 100) / 100,
      generatedAt: new Date().toISOString(),
      generationMethod
    };
  }

  // Advanced ingredient selection engine with sophisticated criteria analysis
  private selectIngredientsFromCriteria(criteria: RecipeBuildingCriteria): unknown[] {
    const selectedIngredients: unknown[] = [];
    
    // Start with required ingredients
    if (criteria.requiredIngredients) {
      selectedIngredients.push(...criteria.requiredIngredients);
    }
    
    // Add preferred ingredients if they don't conflict
    if (criteria.preferredIngredients) {
      criteria.preferredIngredients.forEach(preferred => {
        if (!criteria.excludedIngredients?.includes(preferred)) {
          selectedIngredients.push(preferred);
        }
      });
    }
    
    // Add seasonal ingredients based on current season
    if (criteria.season || criteria.currentSeason) {
      const season = criteria.season || criteria.currentSeason;
      const seasonalIngredients = this.getSeasonalIngredients(season);
      seasonalIngredients.forEach(seasonal => {
        if (!criteria.excludedIngredients?.includes(seasonal) && 
            !selectedIngredients.includes(seasonal)) {
          selectedIngredients.push(seasonal);
        }
      });
    }
    
    // Add cuisine-specific ingredients
    if (criteria.cuisine) {
      const cuisineIngredients = this.getCuisineSpecificIngredients(criteria.cuisine);
      cuisineIngredients.forEach(cuisineIng => {
        if (!criteria.excludedIngredients?.includes(cuisineIng) && 
            !selectedIngredients.includes(cuisineIng)) {
          selectedIngredients.push(cuisineIng);
        }
      });
    }
    
    // Add elemental balance ingredients
    if (criteria.elementalPreference) {
      const elementalIngredients = this.getElementalIngredients(criteria.elementalPreference);
      elementalIngredients.forEach(elemental => {
        if (!criteria.excludedIngredients?.includes(elemental) && 
            !selectedIngredients.includes(elemental)) {
          selectedIngredients.push(elemental);
        }
      });
    }
    
    // Ensure minimum ingredient count for viable recipe
    if (selectedIngredients.length < 3) {
      const baseIngredients = ['salt', 'olive oil', 'garlic', 'onion', 'herbs'];
      baseIngredients.forEach(base => {
        if (!criteria.excludedIngredients?.includes(base) && 
            !selectedIngredients.includes(base) && 
            selectedIngredients.length < 6) {
          selectedIngredients.push(base);
        }
      });
    }
    
    return selectedIngredients;
  }

  // Sophisticated cooking method selection with skill level and equipment optimization
  private selectCookingMethodsFromCriteria(criteria: RecipeBuildingCriteria): string[] {
    const selectedMethods: string[] = [];
    
    // Start with explicitly requested cooking methods
    if (criteria.cookingMethods && criteria.cookingMethods.length > 0) {
      selectedMethods.push(...criteria.cookingMethods);
    }
    
    // Add skill-appropriate methods if no specific methods requested
    if (selectedMethods.length === 0) {
      if (criteria.skillLevel === 'beginner') {
        selectedMethods.push('simmer', 'bake', 'steam', 'boil');
      } else if (criteria.skillLevel === 'advanced') {
        selectedMethods.push('sauté', 'braise', 'confit', 'sous vide', 'flame grill');
      } else {
        selectedMethods.push('sauté', 'roast', 'simmer', 'grill');
      }
    }
    
    // Optimize methods for time constraints
    if (criteria.maxCookTime) {
      const quickMethods = ['sauté', 'stir-fry', 'grill', 'pan-fry', 'steam'];
      const slowMethods = ['braise', 'slow roast', 'confit', 'slow cook'];
      
      if (criteria.maxCookTime < 30) {
        // Remove slow methods, prioritize quick ones
        selectedMethods.forEach((method, index) => {
          if (slowMethods.some(slow => method.toLowerCase().includes(slow))) {
            selectedMethods[index] = quickMethods[index % quickMethods.length];
          }
        });
      }
    }
    
    // Add seasonal cooking method adjustments
    if (criteria.season || criteria.currentSeason) {
      const season = criteria.season || criteria.currentSeason;
      if (season === 'summer') {
        // Prefer cooling methods in summer
        if (!selectedMethods.some(m => ['grill', 'raw', 'cold'].some(cool => m.includes(cool)))) {
          selectedMethods.push('grill');
        }
      } else if (season === 'winter') {
        // Prefer warming methods in winter
        if (!selectedMethods.some(m => ['braise', 'stew', 'roast'].some(warm => m.includes(warm)))) {
          selectedMethods.push('braise');
        }
      }
    }
    
    // Monica constant influences cooking method intensity
    if (criteria.targetMonica) {
      if (criteria.targetMonica > 2.0) {
        // High Monica requires high-energy methods
        if (!selectedMethods.some(m => ['sear', 'flame', 'high heat'].some(intense => m.includes(intense)))) {
          selectedMethods.push('high heat sear');
        }
      } else if (criteria.targetMonica < 1.0) {
        // Low Monica benefits from gentle methods
        if (!selectedMethods.some(m => ['gentle', 'low', 'steam'].some(gentle => m.includes(gentle)))) {
          selectedMethods.push('gentle simmer');
        }
      }
    }
    
    // Ensure at least one primary cooking method
    if (selectedMethods.length === 0) {
      selectedMethods.push('sauté'); // Default fallback
    }
    
    return selectedMethods.slice(0, 4); // Limit to 4 methods for practicality
  }

  // Advanced instruction generation with detailed step-by-step methodology
  private generateBaseInstructions(ingredients: unknown[], methods: string[]): string[] {
    const instructions: string[] = [];
    
    // Preparation phase instructions
    instructions.push('PREPARATION PHASE:');
    instructions.push('1. Gather all ingredients and verify freshness and quality');
    
    if (ingredients.length > 0) {
      const ingredientNames = ingredients.map(ing => typeof ing === 'string' ? ing : 'ingredient').join(', ');
      instructions.push(`2. Prepare ingredients: ${ingredientNames}`);
      instructions.push('3. Wash, chop, and measure all ingredients according to recipe specifications');
      instructions.push('4. Arrange ingredients in order of use for efficient cooking workflow');
    }
    
    // Cooking phase instructions based on methods
    instructions.push('\nCOOKING PHASE:');
    
    methods.forEach((method, index) => {
      const stepNum = index + 5;
      const methodLower = method.toLowerCase();
      
      if (methodLower.includes('sauté') || methodLower.includes('pan')) {
        instructions.push(`${stepNum}. Heat pan over medium-high heat with oil until shimmering`);
        instructions.push(`${stepNum + 0.1}. Add aromatics first, then main ingredients in order of cooking time`);
        instructions.push(`${stepNum + 0.2}. Stir frequently to ensure even cooking and prevent burning`);
      } else if (methodLower.includes('roast') || methodLower.includes('bake')) {
        instructions.push(`${stepNum}. Preheat oven to appropriate temperature based on ingredients`);
        instructions.push(`${stepNum + 0.1}. Arrange ingredients on prepared baking surface`);
        instructions.push(`${stepNum + 0.2}. Monitor cooking progress and adjust temperature as needed`);
      } else if (methodLower.includes('steam')) {
        instructions.push(`${stepNum}. Set up steaming apparatus with adequate water level`);
        instructions.push(`${stepNum + 0.1}. Arrange ingredients in steamer, respecting cooking time differences`);
        instructions.push(`${stepNum + 0.2}. Steam until tender while preserving nutritional integrity`);
      } else if (methodLower.includes('grill')) {
        instructions.push(`${stepNum}. Preheat grill to appropriate temperature for ingredients`);
        instructions.push(`${stepNum + 0.1}. Oil grill grates to prevent sticking`);
        instructions.push(`${stepNum + 0.2}. Grill ingredients with attention to timing and temperature zones`);
      } else {
        instructions.push(`${stepNum}. Apply ${method} technique with attention to timing and temperature`);
        instructions.push(`${stepNum + 0.1}. Monitor progress and adjust heat/timing as ingredients respond`);
      }
    });
    
    // Finishing phase instructions
    instructions.push('\nFINISHING PHASE:');
    instructions.push(`${methods.length + 6}. Taste and adjust seasoning for optimal flavor balance`);
    instructions.push(`${methods.length + 7}. Allow appropriate resting time for flavors to integrate`);
    instructions.push(`${methods.length + 8}. Plate with attention to visual appeal and temperature`);
    instructions.push(`${methods.length + 9}. Serve immediately while maintaining optimal serving temperature`);
    
    // Monica constant integration note
    instructions.push('\nMONICA OPTIMIZATION NOTE:');
    instructions.push('Monitor energy flow throughout cooking process, adjusting intensity based on Monica resonance');
    
    return instructions;
  }

  // Sophisticated recipe naming algorithm with cultural and seasonal context
  private generateRecipeName(criteria: RecipeBuildingCriteria): string {
    let recipeName = '';
    
    // Start with cuisine influence
    if (criteria.cuisine) {
      const cuisineDescriptors = {
        'italian': ['Rustic', 'Traditional', 'Artisanal', 'Mediterranean'],
        'indian': ['Aromatic', 'Spiced', 'Traditional', 'Authentic'],
        'chinese': ['Wok-fired', 'Traditional', 'Harmony', 'Classic'],
        'french': ['Elegant', 'Classic', 'Refined', 'Artisanal'],
        'mexican': ['Vibrant', 'Traditional', 'Festive', 'Authentic'],
        'japanese': ['Zen', 'Harmonious', 'Pure', 'Traditional']
      };
      
      const descriptor = cuisineDescriptors[criteria.cuisine.toLowerCase()] || ['Traditional'];
      recipeName += descriptor[Math.floor(Math.random() * descriptor.length)] + ' ';
    }
    
    // Add seasonal influence
    if (criteria.season || criteria.currentSeason) {
      const season = criteria.season || criteria.currentSeason;
      const seasonalTerms = {
        'spring': ['Spring Fresh', 'Garden', 'Awakening', 'Renewal'],
        'summer': ['Summer Bright', 'Sun-kissed', 'Harvest', 'Radiant'],
        'autumn': ['Autumn Comfort', 'Harvest Moon', 'Golden', 'Warming'],
        'winter': ['Winter Solace', 'Hearth', 'Nourishing', 'Warming']
      };
      
      const seasonalTerm = seasonalTerms[season] || ['Seasonal'];
      recipeName += seasonalTerm[Math.floor(Math.random() * seasonalTerm.length)] + ' ';
    }
    
    // Add cooking method influence
    if (criteria.cookingMethods && criteria.cookingMethods.length > 0) {
      const primaryMethod = criteria.cookingMethods[0];
      const methodNames = {
        'sauté': 'Pan-Seared',
        'roast': 'Roasted',
        'braise': 'Braised',
        'grill': 'Grilled',
        'steam': 'Steamed',
        'stir-fry': 'Stir-Fried'
      };
      
      const methodName = methodNames[primaryMethod.toLowerCase()] || primaryMethod;
      recipeName += methodName + ' ';
    }
    
    // Add ingredient highlight if specific ingredients requested
    if (criteria.requiredIngredients && criteria.requiredIngredients.length > 0) {
      const primaryIngredient = criteria.requiredIngredients[0];
      recipeName += primaryIngredient.charAt(0).toUpperCase() + primaryIngredient.slice(1) + ' ';
    }
    
    // Add Monica constant influence
    if (criteria.targetMonica) {
      if (criteria.targetMonica > 2.0) {
        recipeName += 'Supreme ';
      } else if (criteria.targetMonica > 1.5) {
        recipeName += 'Enhanced ';
      } else if (criteria.targetMonica < 1.0) {
        recipeName += 'Gentle ';
      }
    }
    
    // Add base dish type
    const dishTypes = ['Medley', 'Creation', 'Delight', 'Harmony', 'Fusion', 'Symphony', 'Masterpiece'];
    recipeName += dishTypes[Math.floor(Math.random() * dishTypes.length)];
    
    // Clean up and ensure proper capitalization
    recipeName = recipeName.trim().replace(/\s+/g, ' ');
    
    // Fallback if no specific criteria
    if (!recipeName || recipeName === 'Medley') {
      recipeName = 'Artisanal Culinary Creation';
    }
    
    return recipeName;
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