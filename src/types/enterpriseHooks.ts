/**
 * Enterprise Intelligence Hook Types
 *
 * Comprehensive type definitions for enterprise intelligence hooks and analysis systems
 * to replace any types in useEnterpriseIntelligence and related hooks.
 */

export interface EnterpriseRecipeData {
  id?: string;
  name?: string;
  ingredients?: unknown[];
  instructions?: string[];
  cuisine?: string;
  elementalProperties?: {
    Fire: number,
    Water: number,
    Earth: number,
    Air: number
  };
  nutritionalProfile?: Record<string, number>;
  metadata?: Record<string, unknown>;
}

export interface EnterpriseIngredientData {
  name: string;
  category?: string;
  subcategory?: string;
  nutritionalData?: Record<string, number>;
  elementalProperties?: {
    Fire: number,
    Water: number,
    Earth: number,
    Air: number
  };
  seasonalAvailability?: Record<string, number>;
  astrologicalAffinity?: Record<string, number>;
  metadata?: Record<string, unknown>;
}

export interface EnterpriseAstrologicalContext {
  planetaryPositions?: Record<
    string,
    {
      longitude: number;
      latitude?: number;
      retrograde?: boolean;
      house?: number;
    }
  >;
  zodiacSign?: string;
  lunarPhase?: string;
  elementalInfluence?: {
    Fire: number,
    Water: number,
    Earth: number,
    Air: number
  };
  transitData?: Record<string, unknown>;
  timestamp?: Date;
}

export interface EnterpriseIntelligenceOptions {
  enableRecipeIntelligence?: boolean;
  enableIngredientIntelligence?: boolean;
  enableValidationIntelligence?: boolean;
  enableSafetyIntelligence?: boolean;
  cacheResults?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  analysisDepth?: 'shallow' | 'standard' | 'deep';
}

export interface EnterpriseIntelligenceRecommendations {
  recipe: string[],
  ingredient: string[],
  validation: string[],
  optimization: string[],
  safety: string[]
}

export interface EnterpriseIntelligenceAnalysisState {
  recipeIntelligence?: {
    recommendations: string[],
    compatibilityScore: number,
    optimizationSuggestions: string[],
    confidence: number
  };
  ingredientIntelligence?: {
    recommendations: string[],
    seasonalScore: number,
    nutritionalScore: number,
    confidence: number
  };
  validationIntelligence?: {
    dataIntegrity: {
      issues: string[],
      score: number
    };
    astrologicalConsistency: {
      issues: string[],
      score: number
    };
    overallValid: boolean
  };
  safetyIntelligence?: {
    allergenWarnings: string[],
    nutritionalConcerns: string[],
    interactionWarnings: string[],
    safetyScore: number
  };
  timestamp: Date,
  processingTime: number
}

export interface EnterpriseIntelligenceHookState {
  loading: boolean,
  error: string | null,
  analysis: EnterpriseIntelligenceAnalysisState | null,
  recommendations: EnterpriseIntelligenceRecommendations,
  isAnalyzing: boolean,
  lastUpdate: Date | null
}

export interface EnterpriseIntelligenceHookMethods {
  analyzeRecipeIntelligence: (
    recipeData: EnterpriseRecipeData,
    ingredientData: EnterpriseIngredientData,
    astrologicalContext: EnterpriseAstrologicalContext,
    options?: EnterpriseIntelligenceOptions,
  ) => Promise<void>;

  clearAnalysis: () => void,
  refreshAnalysis: () => Promise<void>,
  getRecommendations: () => EnterpriseIntelligenceRecommendations,
  getAnalysisState: () => EnterpriseIntelligenceAnalysisState | null
}

export type EnterpriseIntelligenceHook = EnterpriseIntelligenceHookState &;
  EnterpriseIntelligenceHookMethods;

// Chakra analysis types
export interface ChakraAnalysisContext {
  chakraType: 'root' | 'sacral' | 'solarPlexus' | 'heart' | 'throat' | 'brow' | 'crown',
  analysisMode: 'mantra' | 'visual' | 'nutritional' | 'functional' | 'platform',
  analysisData: Record<string, unknown>;
  chakraProperties: {
    color: string,
    element: string,
    frequency: number,
    symbol: string
  };
}

export interface ChakraAnalysisResult {
  effectiveness: number,
  recommendations: string[],
  analysisDetails: Record<string, unknown>;
  confidenceScore: number,
  improvementSuggestions: string[]
}
