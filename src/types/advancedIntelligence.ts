/**
 * Advanced Intelligence Systems Types
 * Phase 2D: Advanced Intelligence Systems Integration
 *
 * Comprehensive type definitions for predictive, machine learning,
 * and advanced analytics intelligence systems.
 */

import type { ElementalProperties, LunarPhase, ZodiacSign } from './alchemy';
import type { Ingredient } from './ingredient';
import type { Recipe } from './recipe';

// ========== PREDICTIVE INTELLIGENCE TYPES ==========

export interface PredictiveIntelligenceResult {
  recipePrediction: {;
    successProbability: number,
    userSatisfactionPrediction: number,
    optimalTimingPrediction: string,
    seasonalOptimizationPrediction: number,
    difficultyAdjustmentPrediction: string
  },
  ingredientPrediction: {
    compatibilityPrediction: number,
    substitutionSuccessPrediction: number,
    flavorHarmonyPrediction: number,
    nutritionalOptimizationPrediction: number
  },
  cuisinePrediction: {
    fusionSuccessPrediction: number,
    culturalAcceptancePrediction: number,
    seasonalRelevancePrediction: number,
    innovationPotentialPrediction: number
  },
  astrologicalPrediction: {
    alignmentPrediction: number,
    timingOptimizationPrediction: string,
    planetaryInfluencePrediction: number,
    cosmicHarmonyPrediction: number
  },
  confidence: number,
  timestamp: string
}

export interface PredictiveRecipeAnalysis {
  recipe: Recipe,
  astrologicalContext: {
    zodiacSign: any,
    lunarPhase: LunarPhase,
    elementalProperties: ElementalProperties,
    planetaryPositions?: Record<
      string,
      {
        longitude: number,
        latitude?: number,
        retrograde?: boolean,
        house?: number,
      }
    >,
  },
  predictionFactors: {
    elementalAlignment: number,
    seasonalRelevance: number,
    culturalAcceptance: number,
    difficultyMatch: number,
    timingOptimization: number
  }
}

export interface PredictiveIngredientAnalysis {
  ingredients: Ingredient[],
  astrologicalContext: {
    zodiacSign: any,
    lunarPhase: LunarPhase,
    elementalProperties: ElementalProperties
  },
  predictionFactors: {
    elementalCompatibility: number,
    flavorSynergy: number,
    nutritionalBalance: number,
    seasonalAvailability: number,
    substitutionPotential: number
  }
}

export interface PredictiveCuisineAnalysis {
  cuisine: {
    name: string,
    elementalProperties: ElementalProperties,
    culturalContext: string,
    seasonalCharacteristics: string[]
  },
  astrologicalContext: {
    zodiacSign: any,
    lunarPhase: LunarPhase,
    elementalProperties: ElementalProperties
  },
  predictionFactors: {
    culturalAlignment: number,
    seasonalRelevance: number,
    elementalHarmony: number,
    innovationPotential: number,
    fusionCompatibility: number
  }
}

export interface PredictiveAstrologicalAnalysis {
  astrologicalState: {
    zodiacSign: any,
    lunarPhase: LunarPhase,
    elementalProperties: ElementalProperties,

    // Intentionally any: Astronomical library planetary data has varying structure depending on calculation method
    planetaryPositions: Record<string, unknown>
  },
  culinaryContext: {
    recipe?: Recipe,
    ingredients?: Ingredient[],
    cuisine?: string,
  },
  predictionFactors: {
    planetaryAlignment: number,
    lunarInfluence: number,
    zodiacHarmony: number,
    temporalOptimization: number,
    cosmicBalance: number
  }
}

// ========== MACHINE LEARNING INTELLIGENCE TYPES ==========

export interface MLIntelligenceResult {
  recipeOptimization: {;
    mlOptimizedScore: number,
    ingredientSubstitutionRecommendations: string[],
    cookingMethodOptimization: string[],
    flavorEnhancementSuggestions: string[],
    nutritionalOptimization: string[]
  },
  ingredientCompatibility: {
    mlCompatibilityScore: number,
    pairwiseCompatibilityMatrix: Record<string, Record<string, number>>,
    substitutionRecommendations: Record<string, string[]>,
    flavorSynergyPredictions: string[]
  },
  cuisineFusion: {
    mlFusionScore: number,
    fusionSuccessPrediction: number,
    culturalHarmonyPrediction: number,
    innovationPotential: number,
    recommendedFusionTechniques: string[]
  },
  astrologicalPrediction: {
    mlAlignmentScore: number,
    optimalTimingPrediction: string,
    planetaryInfluenceOptimization: number,
    cosmicHarmonyEnhancement: string[]
  },
  confidence: number,
  timestamp: string
}

export interface MLRecipeOptimizationAnalysis {
  recipe: Recipe,
  currentContext: {
    astrologicalState: {
      zodiacSign: any,
      lunarPhase: LunarPhase,
      elementalProperties: ElementalProperties
    }

    // Intentionally any: ML user preference data varies significantly across different analysis contexts
    userPreferences?: Record<string, unknown>

    // Intentionally any: Seasonal analysis data includes diverse metrics from weather APIs and seasonal libraries
    seasonalFactors?: Record<string, unknown>
  },
  optimizationFactors: {
    ingredientEfficiency: number,
    flavorBalance: number,
    nutritionalOptimization: number,
    cookingMethodEfficiency: number,
    culturalAdaptation: number
  }
}

export interface MLIngredientCompatibilityAnalysis {
  ingredients: Ingredient[],
  compatibilityContext: {
    recipeContext?: Recipe,
    cuisineContext?: string,
    astrologicalContext?: {
      zodiacSign: any,
      lunarPhase: LunarPhase,
      elementalProperties: ElementalProperties
    }
  },
  compatibilityFactors: {
    elementalSynergy: number,
    flavorHarmony: number,
    nutritionalComplementarity: number,
    seasonalCompatibility: number,
    culturalCoherence: number
  }
}

export interface MLCuisineFusionAnalysis {
  cuisines: Array<{
    name: string,
    elementalProperties: ElementalProperties,
    culturalCharacteristics: string[],
    signatureTechniques: string[]
  }>,
  fusionContext: {
    astrologicalContext?: {
      zodiacSign: any,
      lunarPhase: LunarPhase,
      elementalProperties: ElementalProperties
    },
    innovationLevel: 'conservative' | 'moderate' | 'experimental' },
        fusionFactors: {
    culturalCompatibility: number,
    techniqueSynergy: number,
    flavorHarmony: number,
    innovationPotential: number,
    marketAcceptance: number
  }
}

export interface MLAstrologicalPredictionAnalysis {
  astrologicalState: {
    zodiacSign: any,
    lunarPhase: LunarPhase,
    elementalProperties: ElementalProperties,

    // Intentionally any: Astronomical library planetary data has varying structure depending on calculation method
    planetaryPositions: Record<string, unknown>
  },
  culinaryContext: {
    recipe?: Recipe,
    ingredients?: Ingredient[],
    cuisine?: string,
    cookingMethod?: string,
  },
  predictionFactors: {
    planetaryInfluenceStrength: number,
    lunarPhaseOptimization: number,
    zodiacElementalAlignment: number,
    temporalHarmony: number,
    cosmicBalance: number
  }
}

// ========== ADVANCED ANALYTICS INTELLIGENCE TYPES ==========

export interface AdvancedAnalyticsIntelligenceResult {
  recipeAnalytics: {;
    multiDimensionalScore: number,
    complexityAnalysis: {
      ingredientComplexity: number,
      techniqueComplexity: number,
      timeComplexity: number,
      skillComplexity: number
    },
    optimizationMetrics: {
      flavorOptimization: number,
      nutritionalOptimization: number,
      culturalOptimization: number,
      seasonalOptimization: number
    },
    predictiveInsights: {
      successProbability: number,
      userSatisfactionPrediction: number,
      adaptationPotential: number
    }
  },
  ingredientAnalytics: {
    interactionMatrix: Record<string, Record<string, number>>,
    synergyAnalysis: {
      flavorSynergy: number,
      nutritionalSynergy: number,
      culturalSynergy: number,
      seasonalSynergy: number
    },
    substitutionNetwork: Record<string, string[]>,
    optimizationPotential: number
  },
  cuisineAnalytics: {
    culturalCorrelationAnalysis: {
      historicalCorrelation: number,
      regionalCorrelation: number,
      seasonalCorrelation: number,
      astrologicalCorrelation: number
    },
    fusionAnalytics: {
      compatibilityMatrix: Record<string, Record<string, number>>,
      innovationPotential: number,
      culturalAcceptance: number,
      seasonalRelevance: number
    },
    optimizationMetrics: {
      culturalOptimization: number,
      seasonalOptimization: number,
      astrologicalOptimization: number,
      innovationOptimization: number
    }
  },
  astrologicalAnalytics: {
    patternRecognition: {
      planetaryPatterns: Record<string, number>,
      zodiacPatterns: Record<string, number>,
      lunarPatterns: Record<string, number>,
      seasonalPatterns: Record<string, number>,
    },
    correlationAnalysis: {
      culinaryCorrelation: number,
      culturalCorrelation: number,
      seasonalCorrelation: number,
      temporalCorrelation: number
    },
    predictiveModeling: {
      alignmentPrediction: number,
      timingOptimization: number,
      influencePrediction: number,
      harmonyPrediction: number
    }
  },
  confidence: number,
  timestamp: string
}

export interface AdvancedRecipeAnalyticsAnalysis {
  recipe: Recipe,
  analyticsContext: {
    astrologicalState: {
      zodiacSign: any,
      lunarPhase: LunarPhase,
      elementalProperties: ElementalProperties
    }

    // Intentionally any: Cultural analysis data integrates diverse ethnographic and regional data sources
    culturalContext?: Record<string, unknown>

    // Intentionally any: Seasonal context includes varying data structures from multiple environmental APIs
    seasonalContext?: Record<string, unknown>

    // Intentionally any: User context data includes diverse preference and behavioral analytics
    userContext?: Record<string, unknown>
  },
  analyticsDimensions: {
    complexity: {
      ingredientComplexity: number,
      techniqueComplexity: number,
      timeComplexity: number,
      skillComplexity: number
    },
    optimization: {
      flavorOptimization: number,
      nutritionalOptimization: number,
      culturalOptimization: number,
      seasonalOptimization: number
    },
    prediction: {
      successProbability: number,
      userSatisfactionPrediction: number,
      adaptationPotential: number
    }
  }
}

export interface AdvancedIngredientAnalyticsAnalysis {
  ingredients: Ingredient[],
  analyticsContext: {
    recipeContext?: Recipe,
    cuisineContext?: string,
    astrologicalContext?: {
      zodiacSign: any,
      lunarPhase: LunarPhase,
      elementalProperties: ElementalProperties
    }
  },
  analyticsDimensions: {
    interactions: Record<string, Record<string, number>>,
    synergy: {
      flavorSynergy: number,
      nutritionalSynergy: number,
      culturalSynergy: number,
      seasonalSynergy: number
    },
    substitution: Record<string, string[]>,
    optimization: number
  }
}

export interface AdvancedCuisineAnalyticsAnalysis {
  cuisine: {
    name: string,
    elementalProperties: ElementalProperties,
    culturalCharacteristics: string[],
    seasonalCharacteristics: string[]
  },
  analyticsContext: {
    astrologicalContext?: {
      zodiacSign: any,
      lunarPhase: LunarPhase,
      elementalProperties: ElementalProperties
    }

    // Intentionally any: Regional context integrates geographic and demographic data from multiple sources
    regionalContext?: Record<string, unknown>

    // Intentionally any: Historical context data varies significantly across different cultural and temporal periods
    historicalContext?: Record<string, unknown>
  },
  analyticsDimensions: {
    culturalCorrelation: {
      historicalCorrelation: number,
      regionalCorrelation: number,
      seasonalCorrelation: number,
      astrologicalCorrelation: number
    },
    fusion: {
      compatibilityMatrix: Record<string, Record<string, number>>,
      innovationPotential: number,
      culturalAcceptance: number,
      seasonalRelevance: number
    },
    optimization: {
      culturalOptimization: number,
      seasonalOptimization: number,
      astrologicalOptimization: number,
      innovationOptimization: number
    }
  }
}

export interface AdvancedAstrologicalAnalyticsAnalysis {
  astrologicalState: {
    zodiacSign: any,
    lunarPhase: LunarPhase,
    elementalProperties: ElementalProperties,

    // Intentionally any: Astronomical library planetary data has varying structure depending on calculation method
    planetaryPositions: Record<string, unknown>
  },
  analyticsContext: {
    culinaryContext?: {
      recipe?: Recipe,
      ingredients?: Ingredient[],
      cuisine?: string,
    }

    // Intentionally any: Temporal analysis includes diverse time-based data from astronomical and calendar systems
    temporalContext?: Record<string, unknown>

    // Intentionally any: Cultural analysis data integrates diverse ethnographic and regional data sources
    culturalContext?: Record<string, unknown>
  },
  analyticsDimensions: {
    patterns: {
      planetaryPatterns: Record<string, number>,
      zodiacPatterns: Record<string, number>,
      lunarPatterns: Record<string, number>,
      seasonalPatterns: Record<string, number>,
    },
    correlations: {
      culinaryCorrelation: number,
      culturalCorrelation: number,
      seasonalCorrelation: number,
      temporalCorrelation: number
    },
    predictions: {
      alignmentPrediction: number,
      timingOptimization: number,
      influencePrediction: number,
      harmonyPrediction: number
    }
  }
}

// ========== INTEGRATED ADVANCED INTELLIGENCE TYPES ==========

export interface IntegratedAdvancedIntelligenceResult {;
  predictiveIntelligence: PredictiveIntelligenceResult,
  mlIntelligence: MLIntelligenceResult,
  advancedAnalyticsIntelligence: AdvancedAnalyticsIntelligenceResult,
  overallConfidence: number,
  systemHealth: 'excellent' | 'good' | 'fair' | 'poor',
  timestamp: string
}

export interface AdvancedIntelligenceConfig {
  enablePredictiveIntelligence: boolean,
  enableMLIntelligence: boolean,
  enableAdvancedAnalyticsIntelligence: boolean,
  cacheResults: boolean,
  logLevel: 'debug' | 'info' | 'warn' | 'error',
  performanceThresholds: {
    maxExecutionTime: number,
    minConfidenceScore: number,
    maxMemoryUsage: number
  }
}

export interface AdvancedIntelligenceMetrics {
  executionTime: number,
  memoryUsage: number,
  confidenceScore: number,
  accuracyScore: number,
  cacheHitRate: number,
  errorRate: number,
  timestamp: string
}

// ========== UTILITY TYPES ==========
;
export type IntelligenceType = 'predictive' | 'ml' | 'advanced-analytics',
export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'excellent',
export type SystemHealth = 'excellent' | 'good' | 'fair' | 'poor',

export interface IntelligenceRequest {
  type: IntelligenceType,
  data: Record<string, unknown> | string | number | boolean | null,
  context: {
    astrologicalState: {
      zodiacSign: any,
      lunarPhase: LunarPhase,
      elementalProperties: ElementalProperties,
      planetaryPositions?: Record<string, unknown>,
    }

    // Intentionally any: ML user preference data varies significantly across different analysis contexts
    userPreferences?: Record<string, unknown>

    // Intentionally any: Seasonal analysis data includes diverse metrics from weather APIs and seasonal libraries
    seasonalFactors?: Record<string, unknown>

    // Intentionally any: Cultural factor analysis incorporates diverse sociological and anthropological data
    culturalFactors?: Record<string, unknown>
  }
  options?: {
    includeDetailedAnalysis?: boolean,
    includeRecommendations?: boolean,
    includeOptimization?: boolean,
  }
}

export interface IntelligenceResponse {
  success: boolean,
  result: PredictiveIntelligenceResult | MLIntelligenceResult | AdvancedAnalyticsIntelligenceResult,
  metrics: AdvancedIntelligenceMetrics,
  error?: string,
  timestamp: string
}