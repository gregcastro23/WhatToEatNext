/**
 * Type definitions for Predictive Intelligence Service
 */

import { Recipe, Ingredient, ZodiacSign, ElementalProperties } from './unified';

export interface PredictiveContext {
  zodiacSign: any;
  lunarPhase: string;
  season: string;
  planetaryPositions?: Record<string, PlanetaryPosition>;
  elementalProperties: ElementalProperties;
  timeOfDay?: string;
  userPreferences?: UserPreferences;
}

export interface PlanetaryPosition {
  sign: string;
  degree: number;
  isRetrograde?: boolean;
  aspect?: string;
}

export interface UserPreferences {
  favoriteIngredients: string[];
  dislikedIngredients: string[];
  preferredCuisines: string[];
  dietaryRestrictions: string[];
  spicePreference: 'mild' | 'medium' | 'hot';
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface PredictionResult {
  prediction: unknown;
  confidence: number;
  factors: string[];
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
}

export interface RecipePredictions {
  successProbability: PredictionResult;
  popularityForecast: PredictionResult;
  seasonalTrends: PredictionResult;
  userSatisfactionPrediction: PredictionResult;
}

export interface IngredientPredictions {
  availabilityForecast: PredictionResult;
  priceProjections: PredictionResult;
  qualityPredictions: PredictionResult;
  substitutionRecommendations: PredictionResult;
}

export interface CuisinePredictions {
  trendAnalysis: PredictionResult;
  fusionOpportunities: PredictionResult;
  marketDemandProjection: PredictionResult;
  seasonalPopularity: PredictionResult;
}

export interface AstrologicalPredictions {
  optimalTimingPrediction: PredictionResult;
  planetaryInfluenceProjection: PredictionResult;
  lunarCycleOptimization: PredictionResult;
  energeticHarmonyForecast: PredictionResult;
}

export interface PredictiveIntelligenceResult {
  recipePrediction: RecipePredictions;
  ingredientPrediction: IngredientPredictions;
  cuisinePrediction: CuisinePredictions;
  astrologicalPrediction: AstrologicalPredictions;
  confidence: number;
  timestamp: string;
}

export interface PredictiveMetrics {
  totalPredictions: number;
  averageConfidence: number;
  cacheHitRate: number;
  errorRate: number;
  executionTimes: number[];
  accuracyRate?: number;
  predictionTypes: Record<string, number>;
}

export interface PredictiveModelWeights {
  historical: number;
  seasonal: number;
  astrological: number;
  user: number;
  market: number;
  cultural: number;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  confidence: number;
  factors: string[];
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  strength: number;
  duration: string;
  confidence: number;
  supportingFactors: string[];
}

export interface PredictionInput {
  recipe?: Recipe;
  ingredients?: Ingredient[];
  cuisine?: {
    name: string;
    type: string;
    characteristics: string[];
  };
  context: PredictiveContext;
  historicalData?: TimeSeriesData[];
  modelWeights?: PredictiveModelWeights;
}

export interface SeasonalPrediction {
  season: string;
  probability: number;
  factors: string[];
  recommendations: string[];
}

export interface MarketPrediction {
  demand: number;
  supply: number;
  priceEstimate: number;
  marketFactors: string[];
  competitorAnalysis: string[];
}

export interface CulturalPrediction {
  adoption: number;
  resistance: number;
  culturalFactors: string[];
  adaptationRecommendations: string[];
}

export interface PredictiveAlgorithmConfig {
  algorithm: 'linear' | 'polynomial' | 'neural' | 'ensemble';
  lookback: number;
  horizon: number;
  confidence: number;
  factors: string[];
}
