/**
 * Cuisine-Level Computation System Index
 *
 * Central exports for the comprehensive hierarchical cuisine system.
 * This module integrates all cuisine-level components for easy importing.
 */

// ========== CORE COMPUTATION ENGINES ==========

export {
  aggregateAlchemicalProperties,
  aggregateElementalProperties,
  aggregateThermodynamicProperties,
  calculateAlchemicalVariance,
  calculateConfidenceInterval,
  calculateDiversityScore,
  calculateElementalVariance,
  calculateVariance,
  calculateWeightedAverage,
  computeCuisineProperties,
  validateCuisineComputationInputs,
} from "./cuisineAggregationEngine";

// ========== SIGNATURE IDENTIFICATION ==========

export {
  DEFAULT_GLOBAL_BASELINE,
  calculateSignatureConfidence,
  calculateZScore,
  classifySignatureStrength,
  filterSignaturesByStrength,
  getSignatureSummary,
  identifyCuisineSignatures,
  // validateSignatureIdentification,
} from "./signatureIdentificationEngine";

export type { GlobalBaseline } from "./signatureIdentificationEngine";

// ========== PLANETARY PATTERN ANALYSIS ==========

export {
  PLANETS,
  SIGN_ELEMENT_MAP,
  ZODIAC_SIGNS,
  analyzePlanetaryPatterns,
  calculateElementalDistribution,
  calculatePlanetaryDiversity,
  calculatePlanetaryStrength,
  countPlanetaryPositions,
  findRecipesWithPlanetaryPattern,
  getCulturalSignificance,
  validatePlanetaryAnalysisInputs,
} from "./planetaryPatternAnalysis";

export type {
  ElementalDistribution,
  PlanetaryFrequency,
} from "./planetaryPatternAnalysis";

// ========== CULTURAL INFLUENCE SYSTEM ==========

export {
  CLIMATE_MODIFIERS,
  CULINARY_PHILOSOPHIES,
  CULTURAL_EXCHANGES,
  GEOGRAPHIC_REGIONS,
  applyCulturalInfluences,
  applyExchangeInfluences,
  applyGeographicInfluences,
  applyPhilosophyInfluences,
  generateCulturalDescription,
  getAvailableClimates,
  getAvailableExchanges,
  getAvailablePhilosophies,
  getAvailableRegions,
  validateCulturalInfluence,
} from "./culturalInfluenceEngine";

// ========== PERSONALIZED RECOMMENDATION ENGINE ==========

export {
  calculateAlchemicalCompatibility,
  calculateCulturalAlignment,
  calculateElementalCompatibility,
  calculateSeasonalRelevance,
  calculateSignatureMatch,
  createAdvancedUserProfile,
  createBasicUserProfile,
  generateCuisineRecommendations,
  getRecommendationSummary,
  validateUserProfile,
} from "./cuisineRecommendationEngine";

export type {
  CuisineRecommendation,
  UserProfile,
} from "./cuisineRecommendationEngine";

// ========== CACHING SYSTEM ==========

export {
  computeCuisineWithCache,
  configureGlobalCache,
  getGlobalCache,
  resetGlobalCache,
} from "./cuisineComputationCache";

export type {
  CacheStatistics,
  InvalidationReason,
} from "./cuisineComputationCache";

// ========== TYPES RE-EXPORT ==========

export type {
  CuisineComputationOptions,
  CuisineComputedProperties,
  CuisineSignature,
  CulturalInfluence,
  PlanetaryPattern,
  PropertyVariance,
  RecipeComputedProperties,
} from "@/types/hierarchy";

// ========== CONSTANTS ==========

/**
 * Current system version
 */
export const CUISINE_SYSTEM_VERSION = "1.0.0";

/**
 * Default computation settings
 */
export const DEFAULT_COMPUTATION_OPTIONS = {
  weightingStrategy: "equal" as const,
  signatureThreshold: 1.5,
  includeVariance: true,
  identifyPlanetaryPatterns: true,
  minStrength: 0.3,
  includeCulturalNotes: true,
};

/**
 * Performance targets
 */
export const PERFORMANCE_TARGETS = {
  cuisineComputation: 500, // ms per cuisine
  signatureIdentification: 200, // ms per cuisine
  patternAnalysis: 300, // ms per cuisine
  recommendationGeneration: 100, // ms per query
};
