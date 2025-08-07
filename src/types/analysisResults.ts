/**
 * Analysis Result Type Definitions
 * 
 * Specific interface definitions to replace any types in enterprise intelligence
 * analysis results and reduce explicit-any usage.
 */

// Analysis result interfaces for compatibility analysis
export interface CompatibilityAnalysisResult {
  coreMetrics: {
    elementalAlignment: number;
    kalchmAlignment: number;
    planetaryAlignment: number;
    overallCompatibility: number;
  };
  detailMetrics?: {
    seasonalFit: number;
    astrologicalResonance: number;
    nutritionalHarmony: number;
  };
}

// Analysis result interfaces for ingredient analysis
export interface IngredientCategorizationAnalysis {
  category: string;
  subcategory: string;
  confidence: number;
  properties: {
    nutritional: Record<string, number>;
    elemental: Record<string, number>;
  };
}

export interface IngredientSeasonalityAnalysis {
  primarySeason: string;
  seasonalScores: Record<string, number>;
  astrologicalAlignment: {
    planetaryInfluence: Record<string, number>;
    elementalResonance: Record<string, number>;
  };
}

// Analysis result interfaces for chakra symbols analysis
export interface ChakraAnalysisResult {
  effectiveness?: {
    pronunciationAccuracy: number;
    vibrationalResonance: number;
  };
  advancedVibrations?: {
    harmonicResonance?: {
      fundamental: number;
    };
  };
  symbolicEffectiveness?: {
    visualClarity: number;
  };
  colorAnalysis?: {
    colorHarmony: number;
  };
  advancedVisual?: Record<string, unknown>;
  nutritionalEffectiveness?: Record<string, unknown>;
  dietaryAnalysis?: Record<string, unknown>;
  advancedNutritional?: Record<string, unknown>;
  functionalEffectiveness?: Record<string, unknown>;
  herbalAnalysis?: Record<string, unknown>;
  advancedFunctional?: Record<string, unknown>;
  platformEffectiveness?: Record<string, unknown>;
  systemAnalysis?: Record<string, unknown>;
  advancedPlatform?: Record<string, unknown>;
}

// Analysis result interfaces for predictive intelligence
export interface PredictiveAnalysisConfig {
  modelType: string;
  parameters: Record<string, unknown>;
  version: string;
  timestamp: Date;
}

// General analysis result wrapper
export interface AnalysisResultWrapper<T = unknown> {
  success: boolean;
  data: T;
  metadata: {
    timestamp: Date;
    version: string;
    source: string;
  };
  errors?: string[];
}

// Enterprise intelligence specific types
export interface EnterpriseAnalysisContext {
  elementalProperties?: Record<string, unknown>;
  astrologicalContext?: Record<string, unknown>;
  recipeData?: Record<string, unknown>;
  ingredientData?: Record<string, unknown>;
}

// Recipe data with elemental properties interface
export interface RecipeAnalysisData {
  elementalProperties?: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  [key: string]: unknown;
}

// Astrological context interface
export interface AstrologicalAnalysisContext {
  elementalProperties?: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  planetaryInfluences?: Record<string, number>;
  zodiacAlignment?: string;
  [key: string]: unknown;
}