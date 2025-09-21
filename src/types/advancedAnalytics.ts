/**
 * Type definitions for Advanced Analytics Intelligence Service
 */

import {Recipe, Ingredient, _ZodiacSign, ElementalProperties} from './unified';

export interface AstrologicalContext {
  zodiacSign: any,
  lunarPhase: LunarPhase,
  elementalProperties: ElementalProperties,
  planetaryPositions?: Record<string, PlanetaryPosition>;
  date?: Date;
  sunSign?: string;
  mercuryRetrograde?: boolean;
  favorableAspects?: string[]
}

export interface PlanetaryPosition {
  sign: string,
  degree: number,
  isRetrograde?: boolean
}

export interface LunarPhase {
  phase: string,
  illumination: number
}

export interface CuisineData {
  name: string;
  type?: string;
  elementalProperties?: ElementalProperties
  seasonalVariations?: Record<string, unknown>;
  culturalOrigin?: string;
  spiceLevel?: string;
  commonIngredients?: string[]
}

export interface CulinaryContext {
  recipe?: Recipe;
  ingredients?: Ingredient[];
  cuisine?: CuisineData
}

export interface ComplexityAnalysis {
  ingredientComplexity: number,
  techniqueComplexity: number,
  timeComplexity: number,
  skillComplexity: number
}

export interface OptimizationMetrics {
  flavorOptimization: number,
  nutritionalOptimization: number,
  culturalOptimization: number,
  seasonalOptimization: number
}

export interface PredictiveInsights {
  successProbability: number,
  userSatisfactionPrediction: number,
  adaptationPotential: number
}

export interface RecipeAnalytics {
  multiDimensionalScore: number,
  complexityAnalysis: ComplexityAnalysis,
  optimizationMetrics: OptimizationMetrics,
  predictiveInsights: PredictiveInsights
}

export interface SynergyAnalysis {
  flavorSynergy: number,
  nutritionalSynergy: number,
  culturalSynergy: number,
  seasonalSynergy: number
}

export interface IngredientAnalytics {
  interactionMatrix: Record<string, Record<string, number>>;
  synergyAnalysis: SynergyAnalysis,
  substitutionNetwork: Record<string, string[]>;
  optimizationPotential: number
}

export interface CulturalCorrelations {
  historicalCorrelation: number,
  regionalCorrelation: number,
  seasonalCorrelation: number,
  astrologicalCorrelation: number
}

export interface FusionAnalytics {
  compatibilityMatrix: Record<string, Record<string, number>>;
  innovationPotential: number,
  culturalAcceptance: number,
  seasonalRelevance: number
}

export interface CuisineOptimizationMetrics {
  culturalOptimization: number,
  seasonalOptimization: number,
  astrologicalOptimization: number,
  innovationOptimization: number
}

export interface CuisineAnalytics {
  culturalCorrelations: CulturalCorrelations,
  fusionAnalytics: FusionAnalytics,
  optimizationMetrics: CuisineOptimizationMetrics
}

export interface PatternSet {
  planetaryPatterns: Record<string, number>;
  zodiacPatterns: Record<string, number>;
  lunarPatterns: Record<string, number>;
  seasonalPatterns: Record<string, number>;
}

export interface CorrelationSet {
  culinaryCorrelation: number,
  culturalCorrelation: number,
  seasonalCorrelation: number,
  temporalCorrelation: number
}

export interface PredictiveModeling {
  alignmentPrediction: number,
  timingOptimization: number,
  influencePrediction: number,
  harmonyPrediction: number
}

export interface AstrologicalAnalytics {
  patterns: PatternSet,
  correlations: CorrelationSet,
  predictiveModeling: PredictiveModeling
}

export interface AdvancedAnalyticsIntelligenceResult {
  recipeAnalytics: RecipeAnalytics,
  ingredientAnalytics: IngredientAnalytics,
  cuisineAnalytics: CuisineAnalytics,
  astrologicalAnalytics: AstrologicalAnalytics,
  confidence: number,
  timestamp: string
}