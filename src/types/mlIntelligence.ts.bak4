/**
 * Type definitions for Machine Learning Intelligence Service
 */

import { Recipe, Ingredient, ZodiacSign, ElementalProperties } from './unified';

export interface MLContext {
  zodiacSign: ZodiacSign;
  lunarPhase: string;
  season: string;
  userPreferences?: UserPreferences;
  historicalData?: HistoricalData;
}

export interface UserPreferences {
  preferredCuisines: string[];
  dietaryRestrictions: string[];
  spiceLevel: 'mild' | 'medium' | 'hot';
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  favoriteIngredients: string[];
  dislikedIngredients: string[];
}

export interface HistoricalData {
  successfulRecipes: Recipe[];
  ingredientCompatibilityScores: Record<string, Record<string, number>>;
  cuisineFusionResults: Record<string, number>;
  astrologicalCorrelations: Record<string, number>;
}

export interface MLOptimizationResult {
  optimizedRecipe: Recipe;
  confidenceScore: number;
  improvementAreas: string[];
  optimizationReasons: string[];
}

export interface IngredientPairingResult {
  primaryIngredient: Ingredient;
  recommendedPairings: IngredientPairing[];
  pairingConfidence: number;
  contextualFactors: string[];
}

export interface IngredientPairing {
  ingredient: Ingredient;
  compatibilityScore: number;
  synergyType: 'flavor' | 'nutritional' | 'cultural' | 'seasonal';
  confidence: number;
}

export interface CuisiveFusionResult {
  primaryCuisine: string;
  fusionCuisine: string;
  fusionScore: number;
  recommendedIngredients: string[];
  cookingTechniques: string[];
  culturalConsiderations: string[];
}

export interface AstrologicalPrediction {
  zodiacSign: ZodiacSign;
  lunarPhase: string;
  predictions: {
    optimalCookingTimes: string[];
    favorableIngredients: string[];
    cookingMethodRecommendations: string[];
    seasonalAlignment: number;
  };
  confidence: number;
}

export interface MLLearningData {
  recipeOptimizations: Map<string, number>;
  ingredientCompatibility: Map<string, number>;
  cuisineFusions: Map<string, number>;
  astrologicalPredictions: Map<string, number>;
}

export interface MLMetrics {
  totalOptimizations: number;
  averageConfidence: number;
  cacheHitRate: number;
  errorRate: number;
  executionTimes: number[];
  learningProgress: number;
}

export interface MLIntelligenceResult {
  recipeOptimization: {
    mlOptimizedScore: number;
    ingredientSubstitutionRecommendations: string[];
    cookingMethodOptimization: string[];
    flavorEnhancementSuggestions: string[];
    nutritionalOptimization: Record<string, unknown>;
  };
  ingredientPairing: {
    mlCompatibilityScore: number;
    pairwiseCompatibilityMatrix: Record<string, Record<string, number>>;
    substitutionRecommendations: Record<string, string[]>;
    flavorSynergyPredictions: Record<string, number>;
  };
  cuisineFusion: {
    mlFusionScore: number;
    fusionSuccessPrediction: number;
    culturalHarmonyPrediction: number;
    innovationPotential: number;
    recommendedFusionTechniques: string[];
  };
  astrologicalPrediction: {
    mlAlignmentScore: number;
    optimalTimingPrediction: Record<string, unknown>;
    planetaryInfluenceOptimization: Record<string, unknown>;
    cosmicHarmonyEnhancement: Record<string, unknown>;
  };
  confidence: number;
  timestamp: string;
}

export interface MLModelWeights {
  seasonalWeight: number;
  astrologicalWeight: number;
  culturalWeight: number;
  nutritionalWeight: number;
  flavorWeight: number;
}

export interface MLTrainingData {
  recipes: Recipe[];
  ingredients: Ingredient[];
  userFeedback: UserFeedback[];
  successMetrics: SuccessMetrics[];
}

export interface UserFeedback {
  recipeId: string;
  rating: number;
  comments: string;
  wouldMakeAgain: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  timestamp: string;
}

export interface SuccessMetrics {
  recipeId: string;
  completionRate: number;
  userSatisfaction: number;
  repeatRate: number;
  adaptationFrequency: number;
}

export interface MLPredictionInput {
  recipe: Recipe;
  ingredients: Ingredient[];
  context: MLContext;
  userHistory?: UserFeedback[];
}

export interface MLOptimizationInput {
  targetRecipe: Recipe;
  constraints: OptimizationConstraints;
  context: MLContext;
  objectives: OptimizationObjectives;
}

export interface OptimizationConstraints {
  maxCookTime?: number;
  budgetLimit?: number;
  availableIngredients?: string[];
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  dietaryRestrictions?: string[];
}

export interface OptimizationObjectives {
  maximizeFlavor: boolean;
  maximizeNutrition: boolean;
  minimizeTime: boolean;
  minimizeCost: boolean;
  maximizeSeasonality: boolean;
}