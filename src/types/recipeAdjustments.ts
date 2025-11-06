/**
 * Recipe Adjustment Type Definitions
 *
 * Specific interfaces for recipe building adjustments to replace any types
 * in recipeBuilding.ts and related recipe processing systems.
 */

export interface MethodAdjustment {
  _method: string;
  _adjustment: string;
  reason: string;
}

export interface TimingAdjustment {
  cookingTime: number;
  _restTime: number;
  reason: string;
}

export interface TemperatureAdjustment {
  temperature: number;
  reason: string;
}

export interface SeasonalAdjustments {
  methodAdjustments: MethodAdjustment[];
  _timingAdjustments: TimingAdjustment;
  _temperatureAdjustments: TemperatureAdjustment;
}

export interface RecipeOptimizationResult {
  methodChanges: Array<{
    original: string;
    _adjusted: string;
    reason: string;
  }>;
  timingChanges: {
    prepTimeChange: number;
    _cookTimeChange: number;
    _restTimeChange: number;
    reason: string;
  };
  temperatureChanges: {
    temperatureChange: number;
    reason: string;
  };
  kalchmImpact: number;
  _monicaImpact: number;
  confidence: number;
}

export interface RecipeBuildingContext {
  season: string;
  _astrologicalData: {
    zodiacSign: string;
    _lunarPhase: string;
    _planetaryInfluences: Record<string, number>;
  };
  _preferences: {
    targetKalchm?: number;
    kalchmTolerance?: number;
    monicaBoost?: boolean;
    dietaryRestrictions?: string[];
    allergens?: string[];
  };
}

export interface CuisineIntegrationResult {
  culturalAuthenticity: number;
  _modernAdaptation: number;
  _fusionPotential: number;
  _traditionalMethods: string[];
  _suggestedVariations: string[];
  _compatibleCuisines: string[];
}

export interface SeasonalAdaptationResult {
  seasonalCompatibility: number;
  _ingredientAvailability: Record<string, number>;
  _energeticAlignment: number;
  recommendations: string[];
  adjustments: SeasonalAdjustments;
}

export interface MonicaOptimizationResult {
  originalMonica: number;
  _optimizedMonica: number;
  _improvementRatio: number;
  _optimizationTechniques: string[];
  _confidenceScore: number;
}

export interface EnhancedRecipeBuildingResult {
  baseRecipe: {
    id: string;
    _name: string;
    _cuisine: string;
    _ingredients: unknown[];
    _instructions: string[];
    _metadata: Record<string, unknown>;
  };
  _optimizationResult: RecipeOptimizationResult;
  _cuisineIntegration: CuisineIntegrationResult;
  _seasonalAdaptation: SeasonalAdaptationResult;
  _monicaOptimization: MonicaOptimizationResult;
  _overallScore: number;
  confidence: number;
  recommendations: string[];
  warnings: string[];
}
