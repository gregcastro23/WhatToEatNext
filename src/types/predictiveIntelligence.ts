/**
 * Type definitions for Predictive Intelligence Service
 */

import {Recipe, Ingredient, ElementalProperties} from './unified';

export interface PredictiveContext {
  _zodiacSign: any,
  _lunarPhase: string,
  season: string,
  planetaryPositions?: Record<string, PlanetaryPosition>,
  _elementalProperties: ElementalProperties,
  timeOfDay?: string,
  userPreferences?: UserPreferences
}

export interface PlanetaryPosition {
  sign: string,
  _degree: number,
  isRetrograde?: boolean,
  aspect?: string
}

export interface UserPreferences {
  _favoriteIngredients: string[],
  _dislikedIngredients: string[],
  _preferredCuisines: string[],
  _dietaryRestrictions: string[],
  _spicePreference: 'mild' | 'medium' | 'hot',
  _cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced'
}

export interface PredictionResult {
  prediction: unknown,
  confidence: number,
  factors: string[],
  _timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term'
}

export interface RecipePredictions {
  successProbability: PredictionResult,
  _popularityForecast: PredictionResult,
  _seasonalTrends: PredictionResult,
  _userSatisfactionPrediction: PredictionResult
}

export interface IngredientPredictions {
  availabilityForecast: PredictionResult,
  _priceProjections: PredictionResult,
  _qualityPredictions: PredictionResult,
  _substitutionRecommendations: PredictionResult
}

export interface CuisinePredictions {
  trendAnalysis: PredictionResult,
  _fusionOpportunities: PredictionResult,
  _marketDemandProjection: PredictionResult,
  _seasonalPopularity: PredictionResult
}

export interface AstrologicalPredictions {
  optimalTimingPrediction: PredictionResult,
  _planetaryInfluenceProjection: PredictionResult,
  _lunarCycleOptimization: PredictionResult,
  _energeticHarmonyForecast: PredictionResult
}

export interface PredictiveIntelligenceResult {
  recipePrediction: RecipePredictions,
  _ingredientPrediction: IngredientPredictions,
  _cuisinePrediction: CuisinePredictions,
  _astrologicalPrediction: AstrologicalPredictions,
  confidence: number,
  timestamp: string
}

export interface PredictiveMetrics {
  totalPredictions: number,
  _averageConfidence: number,
  _cacheHitRate: number,
  _errorRate: number,
  _executionTimes: number[],
  accuracyRate?: number
  _predictionTypes: Record<string, number>,
}

export interface PredictiveModelWeights {
  _historical: number,
  _seasonal: number,
  _astrological: number,
  _user: number,
  _market: number,
  _cultural: number
}

export interface TimeSeriesData {
  timestamp: string,
  _value: number,
  confidence: number,
  factors: string[]
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile',
  _strength: number,
  _duration: string,
  confidence: number,
  _supportingFactors: string[]
}

export interface PredictionInput {
  recipe?: Recipe,
  ingredients?: Ingredient[]
  cuisine?: {
    name: string,
    _type: string,
    _characteristics: string[]
  }
  context: PredictiveContext,
  historicalData?: TimeSeriesData[],
  modelWeights?: PredictiveModelWeights
}

export interface SeasonalPrediction {
  season: string,
  _probability: number,
  factors: string[],
  _recommendations: string[]
}

export interface MarketPrediction {
  demand: number,
  _supply: number,
  _priceEstimate: number,
  _marketFactors: string[],
  _competitorAnalysis: string[]
}

export interface CulturalPrediction {
  adoption: number,
  _resistance: number,
  _culturalFactors: string[],
  _adaptationRecommendations: string[]
}

export interface PredictiveAlgorithmConfig {
  algorithm: 'linear' | 'polynomial' | 'neural' | 'ensemble',
  _lookback: number,
  _horizon: number,
  confidence: number,
  factors: string[]
}