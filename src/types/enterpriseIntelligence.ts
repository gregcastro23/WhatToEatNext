/**
 * Type definitions for Enterprise Intelligence Integration Service
 */

import { Recipe, Ingredient, ZodiacSign, ElementalProperties } from './unified';

export interface EnterpriseIntelligenceConfig {
  enableRecipeIntelligence: boolean,
  enableIngredientIntelligence: boolean,
  enableCuisineIntelligence: boolean,
  enableValidationIntelligence: boolean,
  enableSafetyIntelligence: boolean,
  enableOptimizationRecommendations: boolean,
  enablePredictiveIntelligence: boolean,
  enableMLIntelligence: boolean,
  enableAdvancedAnalyticsIntelligence: boolean,
  cacheResults: boolean,
  logLevel: 'debug' | 'info' | 'warn' | 'error' },
        export interface CompatibilityAnalysis {
  elementalCompatibility: number,
  seasonalCompatibility: number,
  astrologicalCompatibility: number,
  culturalCompatibility: number,
  nutritionalCompatibility: number,
  flavorCompatibility: number
}

export interface RecipeIntelligenceResult {
  compatibilityAnalysis: CompatibilityAnalysis,
  optimizationScore: number,
  safetyScore: number,
  recommendations: string[],
  confidence: number,
  timestamp: string
}

export interface CategorizationAnalysis {
  primaryCategory: string,
  secondaryCategories: string[],
  nutritionalCategory: string,
  seasonalCategory: string,
  culturalCategory: string
}

export interface SeasonalAnalysis {
  currentSeasonCompatibility: number,
  optimalSeasons: string[],
  seasonalAvailability: Record<string, number>,
  energeticProperties: Record<string, number>,
}

export interface AstrologicalAnalysis {
  zodiacInfluences: Record<ZodiacSign, number>,
  planetaryInfluences: Record<string, number>,
  elementalProperties: ElementalProperties,
  lunarPhaseCompatibility: Record<string, number>,
}

export interface IngredientIntelligenceResult {
  categorizationAnalysis: CategorizationAnalysis,
  seasonalAnalysis: SeasonalAnalysis,
  compatibilityAnalysis: CompatibilityAnalysis,
  astrologicalAnalysis: AstrologicalAnalysis,
  validationResults: ValidationResults,
  optimizationScore: number,
  safetyScore: number,
  recommendations: string[],
  confidence: number,
  timestamp: string
}

export interface CulturalAnalysis {
  primaryCulture: string,
  secondaryCultures: string[],
  traditionLevel: number,
  modernAdaptation: number,
  fusionPotential: number
}

export interface FusionAnalysis {
  compatibleCuisines: string[],
  fusionScore: number,
  innovationPotential: number,
  culturalHarmony: number,
  marketAcceptance: number
}

export interface CuisineIntelligenceResult {
  culturalAnalysis: CulturalAnalysis,
  fusionAnalysis: FusionAnalysis,
  seasonalAnalysis: SeasonalAnalysis,
  compatibilityAnalysis: CompatibilityAnalysis,
  astrologicalAnalysis: AstrologicalAnalysis,
  validationResults: ValidationResults,
  optimizationScore: number,
  safetyScore: number,
  recommendations: string[],
  confidence: number,
  timestamp: string
}

export interface ValidationResults {
  dataIntegrity: {
    score: number,
    issues: string[],
    warnings: string[]
  },
  astrologicalConsistency: {
    score: number,
    inconsistencies: string[],
    recommendations: string[]
  },
  nutritionalAccuracy: {
    score: number,
    inaccuracies: string[],
    suggestions: string[]
  },
  seasonalValidity: {
    score: number,
    conflicts: string[],
    adjustments: string[]
  }
}

export interface ValidationIntelligenceResult {
  dataIntegrity: {
    score: number,
    issues: string[],
    warnings: string[]
  },
  astrologicalConsistency: {
    score: number,
    issues: string[],
    warnings: string[]
  },
  elementalHarmony: {
    score: number,
    issues: string[],
    warnings: string[]
  },
  overallValidation: {
    score: number,
    status: 'excellent' | 'good' | 'fair' | 'poor'
    criticalIssues: string[]
  },
  confidence: number,
  timestamp: string
}

export interface SafetyIntelligenceResult {
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical'
    score: number,
    factors: string[]
  },
  fallbackStrategies: string[],
  errorRecovery: {
    enabled: boolean,
    strategies: string[]
  },
  monitoringAlerts: string[],
  confidence: number,
  timestamp: string
}

export interface OptimizationRecommendation {
  category: 'nutritional' | 'flavor' | 'seasonal' | 'astrological' | 'cultural'
  priority: 'low' | 'medium' | 'high'
  description: string,
  expectedImprovement: number,
  implementationComplexity: 'easy' | 'moderate' | 'complex' },
        export interface OptimizationRecommendations {
  performance: {
    score: number,
    recommendations: string[],
    estimatedImpact: number
  },
  accuracy: {
    score: number,
    recommendations: string[],
    estimatedImpact: number
  },
  userExperience: {
    score: number,
    recommendations: string[],
    estimatedImpact: number
  },
  systemIntegration: {
    score: number,
    recommendations: string[],
    estimatedImpact: number
  },
  overallOptimization: {
    score: number,
    priority: 'low' | 'medium' | 'high' | 'critical'
    estimatedValue: number
  }
}

export interface OptimizationIntelligenceResult {
  nutritionalOptimizations: OptimizationRecommendation[],
  flavorOptimizations: OptimizationRecommendation[],
  seasonalOptimizations: OptimizationRecommendation[],
  astrologicalOptimizations: OptimizationRecommendation[],
  culturalOptimizations: OptimizationRecommendation[],
  overallOptimizationScore: number,
  prioritizedRecommendations: OptimizationRecommendation[],
  confidence: number,
  timestamp: string
}

export interface EnterpriseIntelligenceResult {
  recipeIntelligence?: RecipeIntelligenceResult,
  ingredientIntelligence?: IngredientIntelligenceResult,
  cuisineIntelligence?: CuisineIntelligenceResult,
  validationIntelligence?: ValidationIntelligenceResult,
  safetyIntelligence?: SafetyIntelligenceResult,
  optimizationIntelligence?: OptimizationIntelligenceResult,
  predictiveIntelligence?: unknown; // Will use existing type
  mlIntelligence?: unknown; // Will use existing type
  advancedAnalyticsIntelligence?: unknown // Will use existing type
  overallIntelligenceScore: number,
  executionTime: number,
  confidence: number,
  timestamp: string
}

export interface EnterpriseIntelligenceMetrics {
  totalAnalyses: number,
  averageExecutionTime: number,
  averageConfidence: number,
  cacheHitRate: number,
  errorRate: number,
  successRate: number,
  intelligenceBreakdown: {
    recipeIntelligence: number,
    ingredientIntelligence: number,
    cuisineIntelligence: number,
    validationIntelligence: number,
    safetyIntelligence: number,
    optimizationIntelligence: number
  }
}

export interface EnterpriseIntelligenceInput {
  recipe?: Recipe,
  ingredients?: Ingredient[],
  cuisine?: {
    name: string,
    type: string,
    region: string,
    characteristics: string[]
  },
  context: {
    zodiacSign: any,
    lunarPhase: string,
    season: string,
    userPreferences?: {
      dietaryRestrictions: string[],
      flavorPreferences: string[],
      culturalPreferences: string[]
    }
  }
}