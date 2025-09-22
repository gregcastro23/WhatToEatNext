// Ingredient types
import type {
  ElementalPropertiesType,
  NutritionalContentType,
  IngredientMappingType,
  ServiceResponseType
} from './alchemy'
import type { Season } from './shared';

// ========== PHASE 1: INGREDIENT TYPE ALIASES ==========

/**
 * Standardized Elemental Properties
 * Using the project-wide standardized elemental properties type
 */
export type ElementalProperties = ElementalPropertiesType;

/**
 * Standardized Nutritional Content
 * Complete nutritional information structure
 */
export type NutritionalContent = NutritionalContentType;

/**
 * Standardized Ingredient Mapping
 * Complete ingredient data structure used throughout the system
 */
export type IngredientMapping = IngredientMappingType

/**
 * Ingredient Collection Type
 * Collection of ingredients indexed by name/id
 */
export type IngredientCollection = Record<string, IngredientMapping>;

/**
 * Ingredient Category Type
 * Enhanced ingredient category with elemental affinity
 */
export interface IngredientCategory {
  id: string,
  name: string,
  description: string,
  elementalAffinity: ElementalProperties
}

/**
 * Enhanced Ingredient Recommendation
 * Complete recommendation with detailed scoring and reasoning
 */
export interface IngredientRecommendation {
  ingredient: {
    id: string,
    name: string,
    category: string,
    elementalProperties: ElementalProperties,
    nutritionalContent?: NutritionalContent,
  };
  matchScore: number,
  elementalCompatibility: number,
  nutritionalScore: number,
  seasonalScore: number,
  reason: string,
  category: string,
  alternatives?: string[],
}

/**
 * Ingredient Search Criteria Type
 * Comprehensive search parameters for ingredient filtering
 */
export type IngredientSearchCriteria = {
  elements?: ('Fire' | 'Water' | 'Earth' | 'Air')[],
  seasons?: Season[],
  categories?: string[],
  nutritionalRequirements?: {
    minProtein?: number,
    maxCalories?: number,
    minFiber?: number,
    allergens?: string[],
  };
  cookingMethods?: string[],
  sustainabilityThreshold?: number,
  regionalOrigins?: string[],
};

/**
 * Ingredient Compatibility Result
 * Result of ingredient compatibility analysis
 */
export type IngredientCompatibilityResult = {
  primaryIngredient: string,
  compatibleIngredients: string[],
  incompatibleIngredients: string[],
  neutralIngredients: string[],
  compatibilityScores: Record<string, number>;
  reasoning: Record<string, string>;
};

/**
 * Ingredient Substitution Recommendation
 * Suggested ingredient substitutions with ratios and notes
 */
export type IngredientSubstitution = {
  originalIngredient: string,
  substitute: string,
  substitutionRatio: number, // e.g., 1.5 means use 1.5x the amount
  confidenceScore: number // 0-1 scale
  nutritionalDifference: Partial<NutritionalContent>,
  flavorNotes: string[],
  cookingAdjustments?: string[]
};

/**
 * Ingredient Recommendation Response
 * Standardized service response for ingredient recommendations
 */
export type IngredientRecommendationResponse = ServiceResponseType<{
  recommendations: IngredientRecommendation[],
  total: number,
  criteria: IngredientSearchCriteria,
  elementalBalance: ElementalProperties,
  nutritionalSummary: NutritionalContent
}>;

/**
 * Ingredient Analysis Response
 * Standardized service response for ingredient analysis
 */
export type IngredientAnalysisResponse = ServiceResponseType<{
  ingredient: IngredientMapping,
  elementalProfile: ElementalProperties,
  nutritionalAnalysis: NutritionalContent,
  seasonalAvailability: Season[],
  compatibilityMatrix: Record<string, number>;
  substitutions: IngredientSubstitution[]
}>;

// Re-export Season type for convenience
export { Season, type ElementalPropertiesType }