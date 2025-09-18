/**
 * Recipe Adjustment Type Definitions
 *
 * Specific interfaces for recipe building adjustments to replace any types
 * in recipeBuilding.ts and related recipe processing systems.
 */

export interface MethodAdjustment {
  method: string,
  adjustment: string,
  reason: string
}

export interface TimingAdjustment {
  cookingTime: number,
  restTime: number,
  reason: string
}

export interface TemperatureAdjustment {
  temperature: number,
  reason: string,
}

export interface SeasonalAdjustments {
  methodAdjustments: MethodAdjustment[],
  timingAdjustments: TimingAdjustment,
  temperatureAdjustments: TemperatureAdjustment
}

export interface RecipeOptimizationResult {
  methodChanges: {
    original: string,
    adjusted: string,
    reason: string
  }[];
  timingChanges: {
    prepTimeChange: number,
    cookTimeChange: number,
    restTimeChange: number,
    reason: string,
  };
  temperatureChanges: {
    temperatureChange: number,
    reason: string,
  };
  kalchmImpact: number,
  monicaImpact: number,
  confidence: number
}

export interface RecipeBuildingContext {
  season: string,
  astrologicalData: {
    zodiacSign: string,
    lunarPhase: string,
    planetaryInfluences: Record<string, number>;
  };
  preferences: {
    targetKalchm?: number;
    kalchmTolerance?: number;
    monicaBoost?: boolean;
    dietaryRestrictions?: string[];
    allergens?: string[];
  };
}

export interface CuisineIntegrationResult {
  culturalAuthenticity: number,
  modernAdaptation: number,
  fusionPotential: number,
  traditionalMethods: string[],
  suggestedVariations: string[],
  compatibleCuisines: string[],
}

export interface SeasonalAdaptationResult {
  seasonalCompatibility: number,
  ingredientAvailability: Record<string, number>;
  energeticAlignment: number,
  recommendations: string[],
  adjustments: SeasonalAdjustments
}

export interface MonicaOptimizationResult {
  originalMonica: number,
  optimizedMonica: number,
  improvementRatio: number,
  optimizationTechniques: string[],
  confidenceScore: number
}

export interface EnhancedRecipeBuildingResult {
  baseRecipe: {
    id: string,
    name: string,
    cuisine: string,
    ingredients: unknown[],
    instructions: string[],
    metadata: Record<string, unknown>;
  };
  optimizationResult: RecipeOptimizationResult,
  cuisineIntegration: CuisineIntegrationResult,
  seasonalAdaptation: SeasonalAdaptationResult,
  monicaOptimization: MonicaOptimizationResult,
  overallScore: number,
  confidence: number,
  recommendations: string[],
  warnings: string[],
}
