/**
 * Enhanced Recipe Types for Hierarchical Culinary System
 *
 * This module extends the base Recipe interface with astrological timing,
 * cooking method sequences, and computed properties for the hierarchical
 * culinary data system.
 */

import type { CookingMethod } from "../cooking";
import type {
  AstrologicalTiming,
  RecipeComputedProperties,
} from "../hierarchy";
import type { Recipe } from "./recipe";

/**
 * Enhanced Recipe with Astrological Timing and Computed Properties
 *
 * Extends the base Recipe interface with advanced features for the
 * hierarchical culinary system.
 */
export interface EnhancedRecipe extends Recipe {
  /** Astrological timing recommendations */
  astrologicalTiming?: AstrologicalTiming;

  /** Computed properties (calculated dynamically, not persisted) */
  _computed?: RecipeComputedProperties;

  /** Cooking method sequence for sequential application */
  cookingMethodSequence: CookingMethod[];

  /** Recipe metadata */
  cuisineCategory: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "dessert";
  difficulty: "easy" | "medium" | "hard";
  preparationTime: number; // minutes
  cookingTime: number; // minutes

  /** Hierarchical relationships */
  ingredientIds: string[]; // References to ingredient database
  relatedRecipeIds?: string[]; // Related recipes for meal planning

  /** Recipe quality metrics */
  qualityScore?: number; // 0-100 based on completeness and balance
  elementalBalance?: number; // 0-1 measure of elemental harmony
  alchemicalComplexity?: number; // Measure of ESMS property diversity
}

/**
 * Recipe Computation Cache Entry
 *
 * Stores computed properties with metadata for performance optimization.
 */
export interface RecipeComputationCache {
  /** Unique cache key (recipeId + planetaryPositions hash) */
  cacheKey: string;

  /** Computed properties */
  computedProperties: RecipeComputedProperties;

  /** Cache metadata */
  createdAt: Date;
  expiresAt: Date;
  computationTimeMs: number;

  /** Planetary positions hash for cache validation */
  planetaryPositionsHash: string;
}

/**
 * Recipe Validation Result
 *
 * Comprehensive validation report for recipe quality assessment.
 */
export interface RecipeValidationResult {
  /** Overall validation status */
  isValid: boolean;

  /** Individual validation checks */
  checks: {
    /** All required fields present */
    hasRequiredFields: boolean;

    /** All ingredients exist in database */
    ingredientsResolved: boolean;

    /** Elemental properties normalized */
    elementalsNormalized: boolean;

    /** Cooking methods valid */
    cookingMethodsValid: boolean;

    /** Astrological timing complete */
    astrologicalTimingComplete: boolean;

    /** Computation integrity verified */
    computationIntegrity: boolean;
  };

  /** Validation errors and warnings */
  errors: string[];
  warnings: string[];

  /** Quality metrics */
  qualityMetrics: {
    completenessScore: number; // 0-100
    ingredientCoverage: number; // 0-100
    elementalBalance: number; // 0-1
    cookingMethodDiversity: number; // 0-1
  };

  /** Recommended improvements */
  recommendations: string[];
}

/**
 * Recipe Enhancement Options
 *
 * Configuration for recipe enhancement operations.
 */
export interface RecipeEnhancementOptions {
  /** Add astrological timing if missing */
  addAstrologicalTiming?: boolean;

  /** Generate cooking method sequences */
  generateCookingMethods?: boolean;

  /** Compute and cache properties */
  computeProperties?: boolean;

  /** Validate recipe completeness */
  validateCompleteness?: boolean;

  /** Force refresh of cached computations */
  forceRefresh?: boolean;

  /** Planetary positions for computation */
  planetaryPositions?: { [planet: string]: string };
}

/**
 * Batch Recipe Enhancement Result
 *
 * Results from processing multiple recipes.
 */
export interface BatchEnhancementResult {
  /** Total recipes processed */
  totalProcessed: number;

  /** Successful enhancements */
  successful: number;

  /** Failed enhancements */
  failed: number;

  /** Recipes with warnings */
  warnings: number;

  /** Detailed results per recipe */
  results: Array<{
    recipeId: string;
    success: boolean;
    error?: string;
    warnings?: string[];
    qualityScore?: number;
  }>;

  /** Processing statistics */
  statistics: {
    averageProcessingTimeMs: number;
    totalProcessingTimeMs: number;
    cacheHitRate: number;
    computationErrors: number;
  };
}

/**
 * Recipe Search and Filter Criteria
 *
 * Enhanced search criteria for the hierarchical system.
 */
export interface RecipeSearchCriteria {
  /** Basic filters */
  cuisine?: string[];
  mealType?: string[];
  difficulty?: string[];
  preparationTime?: {
    min?: number;
    max?: number;
  };

  /** Elemental and alchemical filters */
  dominantElement?: string;
  dominantAlchemical?: string;
  minElementalBalance?: number;
  minAlchemicalComplexity?: number;

  /** Astrological filters */
  planetaryPositions?: { [planet: string]: string };
  lunarPhase?: string;
  season?: string;

  /** Quality filters */
  minQualityScore?: number;
  hasAstrologicalTiming?: boolean;

  /** Cooking method filters */
  cookingMethods?: string[];
  cookingTechniques?: string[];

  /** Ingredient filters */
  includeIngredients?: string[];
  excludeIngredients?: string[];
  dietaryRestrictions?: string[];

  /** Sorting options */
  sortBy?: "relevance" | "quality" | "complexity" | "preparationTime";
  sortOrder?: "asc" | "desc";
  /** Pagination */
  limit?: number;
  offset?: number;
}

/**
 * Recipe Recommendation Context
 *
 * Context information for personalized recipe recommendations.
 */
export interface RecipeRecommendationContext {
  /** User preferences */
  userPreferences: {
    cuisineTypes: string[];
    dietaryRestrictions: string[];
    skillLevel: "beginner" | "intermediate" | "advanced";
    timeAvailable: number; // minutes
    energyLevel: "low" | "moderate" | "high";
  };

  /** Current astrological state */
  astrologicalState: {
    planetaryPositions: { [planet: string]: string };
    lunarPhase: string;
    season: string;
    dominantElements: string[];
  };

  /** Previous recipe interactions */
  recipeHistory?: {
    likedRecipes: string[];
    dislikedRecipes: string[];
    recentMeals: string[];
    preferredElements: string[];
  };

  /** Session constraints */
  constraints: {
    availableIngredients: string[];
    cookingEquipment: string[];
    timeOfDay: "morning" | "afternoon" | "evening" | "night";
    numberOfPeople: number;
  };
}

/**
 * Recipe Recommendation Result
 *
 * Personalized recipe recommendations with explanations.
 */
export interface RecipeRecommendation {
  /** Recommended recipe */
  recipe: EnhancedRecipe;

  /** Recommendation score (0-100) */
  score: number;

  /** Recommendation reasons */
  reasons: {
    elementalHarmony: number;
    astrologicalAlignment: number;
    ingredientAvailability: number;
    userPreference: number;
    qualityScore: number;
  };

  /** Personalization factors */
  personalization: {
    dominantElement: string;
    planetaryAlignment: string;
    cookingMethodMatch: string;
    difficultyFit: string;
  };

  /** Alternative recommendations */
  alternatives?: Array<{
    recipeId: string;
    score: number;
    reason: string;
  }>;
}
