/**
 * Enhanced Cuisine Recommendation Engine
 *
 * Integrates all advanced alchemical, kinetic, thermodynamic, and circuit-based
 * scoring systems to provide highly accurate cuisine recommendations.
 *
 * This is a comprehensive upgrade to the base cuisine recommender that adds:
 * - Kinetic compatibility scoring (P=IV circuit model)
 * - Thermodynamic resonance (Kalchm, Monica, Greg's Energy)
 * - Circuit-based nested recipe ranking
 * - Intelligent sauce recommendations
 * - Multi-course power flow validation
 * - Aspect phase integration
 *
 * @see cuisineRecommendationEngine.ts - Base engine
 */

import type {
  AlchemicalProperties,
  CuisineComputedProperties,
  ElementalProperties,
} from "@/types/hierarchy";
import type { KineticMetrics } from "@/types/kinetics";
import type { ThermodynamicProperties } from "@/types/alchemy";

import {
  type UserProfile,
  type CuisineRecommendation,
  calculateElementalCompatibility,
  calculateCulturalAlignment,
  calculateSeasonalRelevance,
  calculateSignatureMatch,
} from "./cuisineRecommendationEngine";

import {
  calculateKineticCompatibility,
  createUserKineticProfile,
  aggregateCuisineKineticProfile,
  type UserKineticProfile,
  type CuisineKineticProfile,
  type KineticCompatibilityResult,
} from "./kineticCuisineCompatibility";

import {
  calculateThermodynamicResonance,
  createUserThermodynamicProfile,
  aggregateCuisineThermodynamicProfile,
  type UserThermodynamicProfile,
  type CuisineThermodynamicProfile,
  type ThermodynamicResonanceResult,
} from "./thermodynamicResonance";

import {
  rankRecipesByCircuitCompatibility,
  validateMultiCoursePowerFlow,
  optimizeCourseSequence,
  generateCoursePairingRecommendations,
  type RecipeWithKinetics,
  type CircuitRankingCriteria,
  type RankedRecipeResult,
  type MultiCourseValidationResult,
} from "./circuitBasedRecipeRanking";

import {
  recommendSauces,
  type Sauce,
  type SauceRecommendationCriteria,
  type SauceRecommendationResult,
} from "./intelligentSauceRecommender";

// ========== ENHANCED TYPE DEFINITIONS ==========

/**
 * Enhanced user profile with kinetic and thermodynamic state
 */
export interface EnhancedUserProfile extends UserProfile {
  /** User's current kinetic state */
  kineticProfile?: UserKineticProfile;

  /** User's thermodynamic profile */
  thermodynamicProfile?: UserThermodynamicProfile;

  /** User's current planetary positions (for real-time calculations) */
  currentPlanetaryPositions?: Record<string, string>;

  /** User's previous planetary positions (for kinetic derivatives) */
  previousPlanetaryPositions?: Record<string, string>;

  /** Time interval for kinetic calculations (in seconds) */
  kineticTimeInterval?: number;
}

/**
 * Enhanced cuisine data with kinetic and thermodynamic profiles
 */
export interface EnhancedCuisineData {
  /** Cuisine identifier */
  id: string;

  /** Cuisine name */
  name: string;

  /** Computed properties (elemental, alchemical, thermodynamic) */
  properties: CuisineComputedProperties;

  /** Kinetic profile aggregated from recipes */
  kineticProfile?: CuisineKineticProfile;

  /** Thermodynamic profile aggregated from recipes */
  thermodynamicProfile?: CuisineThermodynamicProfile;

  /** Nested recipes with kinetic properties */
  recipes?: RecipeWithKinetics[];

  /** Available sauces */
  sauces?: Sauce[];
}

/**
 * Enhanced cuisine recommendation with detailed breakdowns
 */
export interface EnhancedCuisineRecommendation extends CuisineRecommendation {
  /** Kinetic compatibility details */
  kineticCompatibility?: KineticCompatibilityResult;

  /** Thermodynamic resonance details */
  thermodynamicResonance?: ThermodynamicResonanceResult;

  /** Aspect phase alignment score */
  aspectPhaseAlignment?: number;

  /** Top ranked recipes from this cuisine */
  rankedRecipes?: RankedRecipeResult[];

  /** Recommended sauces */
  recommendedSauces?: SauceRecommendationResult[];

  /** Multi-course validation (if requesting full meal) */
  multiCourseValidation?: MultiCourseValidationResult;

  /** Overall enhancement score (combines all new factors) */
  enhancementScore?: number;
}

/**
 * Enhanced recommendation options
 */
export interface EnhancedRecommendationOptions {
  /** Maximum recommendations to return */
  maxRecommendations?: number;

  /** Minimum compatibility threshold */
  minCompatibilityThreshold?: number;

  /** Whether to include detailed reasoning */
  includeReasoning?: boolean;

  /** Whether to consider seasonal factors */
  considerSeasonalFactors?: boolean;

  /** Whether to include ranked recipes */
  includeRankedRecipes?: boolean;

  /** Number of recipes to rank per cuisine */
  recipesPerCuisine?: number;

  /** Whether to include sauce recommendations */
  includeSauceRecommendations?: boolean;

  /** Number of sauces to recommend per cuisine */
  saucesPerCuisine?: number;

  /** Whether to validate multi-course power flow */
  validateMultiCourse?: boolean;

  /** Desired meal type for recipe ranking */
  mealType?: string;

  /** Desired energy level (0-1) */
  desiredEnergyLevel?: number;

  /** Scoring weights for enhanced factors */
  weights?: {
    elemental?: number;
    alchemical?: number;
    kinetic?: number;
    thermodynamic?: number;
    cultural?: number;
    seasonal?: number;
    signature?: number;
    aspectPhase?: number;
  };
}

// ========== ENHANCED RECOMMENDATION ENGINE ==========

/**
 * Generate enhanced cuisine recommendations with full kinetic/thermodynamic integration
 */
export function generateEnhancedCuisineRecommendations(
  userProfile: EnhancedUserProfile,
  availableCuisines: Map<string, EnhancedCuisineData>,
  options: EnhancedRecommendationOptions = {},
): EnhancedCuisineRecommendation[] {
  const {
    maxRecommendations = 10,
    minCompatibilityThreshold = 0.3,
    includeReasoning = true,
    considerSeasonalFactors = true,
    includeRankedRecipes = true,
    recipesPerCuisine = 5,
    includeSauceRecommendations = true,
    saucesPerCuisine = 3,
    validateMultiCourse = false,
    mealType,
    desiredEnergyLevel = 0.5,
    weights,
  } = options;

  // Default weights (enhanced with kinetic and thermodynamic factors)
  const scoringWeights = {
    elemental: weights?.elemental ?? 0.30,
    alchemical: weights?.alchemical ?? 0.15,
    kinetic: weights?.kinetic ?? 0.15,
    thermodynamic: weights?.thermodynamic ?? 0.10,
    cultural: weights?.cultural ?? 0.10,
    seasonal: weights?.seasonal ?? 0.10,
    signature: weights?.signature ?? 0.05,
    aspectPhase: weights?.aspectPhase ?? 0.05,
  };

  const recommendations: EnhancedCuisineRecommendation[] = [];

  availableCuisines.forEach((cuisineData, cuisineId) => {
    const { name: cuisineName, properties: cuisineProperties } = cuisineData;
    const reasoning: string[] = [];

    // ========== TRADITIONAL FACTORS ==========

    // 1. Elemental Compatibility
    const elementalCompatibility = calculateElementalCompatibility(
      userProfile.elementalPreferences,
      cuisineProperties.averageElementals,
    );

    // 2. Alchemical Compatibility
    const alchemicalCompatibility =
      userProfile.alchemicalPreferences && cuisineProperties.averageAlchemical
        ? calculateAlchemicalCompatibility(
            userProfile.alchemicalPreferences,
            cuisineProperties.averageAlchemical,
          )
        : undefined;

    // 3. Cultural Alignment
    const culturalAlignment = calculateCulturalAlignment(
      userProfile,
      cuisineId,
      cuisineName,
    );

    // 4. Seasonal Relevance
    const seasonalRelevance = considerSeasonalFactors
      ? calculateSeasonalRelevance(userProfile, cuisineProperties)
      : 0.5;

    // 5. Signature Match
    const signatureMatch = calculateSignatureMatch(
      cuisineProperties.signatures,
      userProfile.elementalPreferences,
    );

    // ========== ENHANCED FACTORS ==========

    // 6. Kinetic Compatibility
    let kineticCompatibility: KineticCompatibilityResult | undefined;
    let kineticScore = 0;
    if (userProfile.kineticProfile && cuisineData.kineticProfile) {
      kineticCompatibility = calculateKineticCompatibility(
        userProfile.kineticProfile,
        cuisineData.kineticProfile,
      );
      kineticScore = kineticCompatibility.overallScore;

      if (includeReasoning && kineticCompatibility.reasoning) {
        reasoning.push(...kineticCompatibility.reasoning);
      }
    }

    // 7. Thermodynamic Resonance
    let thermodynamicResonance: ThermodynamicResonanceResult | undefined;
    let thermodynamicScore = 0;
    if (
      userProfile.thermodynamicProfile &&
      cuisineData.thermodynamicProfile
    ) {
      thermodynamicResonance = calculateThermodynamicResonance(
        userProfile.thermodynamicProfile,
        cuisineData.thermodynamicProfile,
      );
      thermodynamicScore = thermodynamicResonance.overallScore;

      if (includeReasoning && thermodynamicResonance.reasoning) {
        reasoning.push(...thermodynamicResonance.reasoning);
      }
    }

    // 8. Aspect Phase Alignment
    let aspectPhaseAlignment = 0.5;
    if (
      userProfile.kineticProfile?.kineticMetrics.aspectPhase &&
      cuisineData.kineticProfile?.averageKinetics.aspectPhase
    ) {
      const userPhase = userProfile.kineticProfile.kineticMetrics.aspectPhase;
      const cuisinePhase = cuisineData.kineticProfile.averageKinetics.aspectPhase;

      if (userPhase.type === cuisinePhase.type) {
        aspectPhaseAlignment = 1.0;
        if (includeReasoning) {
          reasoning.push(`✓ Aspect phase synchronized: ${userPhase.type}`);
        }
      } else {
        aspectPhaseAlignment = 0.6;
      }
    }

    // ========== CALCULATE OVERALL SCORE ==========

    const totalWeight =
      scoringWeights.elemental +
      (alchemicalCompatibility !== undefined ? scoringWeights.alchemical : 0) +
      (kineticScore > 0 ? scoringWeights.kinetic : 0) +
      (thermodynamicScore > 0 ? scoringWeights.thermodynamic : 0) +
      scoringWeights.cultural +
      scoringWeights.seasonal +
      scoringWeights.signature +
      scoringWeights.aspectPhase;

    const overallScore =
      (elementalCompatibility * scoringWeights.elemental +
        (alchemicalCompatibility || 0) * scoringWeights.alchemical +
        kineticScore * scoringWeights.kinetic +
        thermodynamicScore * scoringWeights.thermodynamic +
        culturalAlignment * scoringWeights.cultural +
        seasonalRelevance * scoringWeights.seasonal +
        signatureMatch * scoringWeights.signature +
        aspectPhaseAlignment * scoringWeights.aspectPhase) /
      totalWeight;

    // Apply minimum threshold
    if (overallScore < minCompatibilityThreshold) {
      return;
    }

    // ========== ADDITIONAL REASONING ==========

    if (includeReasoning) {
      if (elementalCompatibility > 0.7) {
        reasoning.push("Strong elemental alignment with your preferences");
      }
      if (
        alchemicalCompatibility !== undefined &&
        alchemicalCompatibility > 0.7
      ) {
        reasoning.push("Good match with your alchemical preferences");
      }
      if (culturalAlignment > 0.7) {
        reasoning.push("Aligns with your cultural background");
      }
      if (signatureMatch > 0.6) {
        reasoning.push(
          "Matches your preference for distinctive culinary signatures",
        );
      }
      if (reasoning.length === 0) {
        reasoning.push("Balanced compatibility across multiple factors");
      }
    }

    // ========== CALCULATE CONFIDENCE ==========

    let confidence = 0.5;
    if (cuisineProperties.sampleSize > 10) confidence += 0.15;
    if (cuisineProperties.signatures && cuisineProperties.signatures.length > 0)
      confidence += 0.1;
    if (alchemicalCompatibility !== undefined) confidence += 0.1;
    if (kineticScore > 0) confidence += 0.1;
    if (thermodynamicScore > 0) confidence += 0.05;

    // ========== RANK RECIPES (if requested) ==========

    let rankedRecipes: RankedRecipeResult[] | undefined;
    if (
      includeRankedRecipes &&
      cuisineData.recipes &&
      cuisineData.recipes.length > 0 &&
      userProfile.kineticProfile
    ) {
      const rankingCriteria: CircuitRankingCriteria = {
        userKinetics: userProfile.kineticProfile.kineticMetrics,
        mealType,
        desiredEnergyLevel,
        maxRecipes: recipesPerCuisine,
        minEfficiencyThreshold: 0.5,
      };

      rankedRecipes = rankRecipesByCircuitCompatibility(
        cuisineData.recipes,
        rankingCriteria,
      );
    }

    // ========== RECOMMEND SAUCES (if requested) ==========

    let recommendedSauces: SauceRecommendationResult[] | undefined;
    if (
      includeSauceRecommendations &&
      cuisineData.sauces &&
      cuisineData.sauces.length > 0
    ) {
      const sauceCriteria: SauceRecommendationCriteria = {
        targetElementalProperties: cuisineProperties.averageElementals,
        targetAlchemicalProperties: cuisineProperties.averageAlchemical,
        targetThermodynamicProperties:
          cuisineData.thermodynamicProfile?.averageThermodynamics,
        targetKineticProperties:
          cuisineData.kineticProfile?.averageKinetics,
        sauceRole: "complement",
        maxRecommendations: saucesPerCuisine,
        minCompatibilityThreshold: 0.4,
        userPreferences: {
          preferredFlavorProfiles:
            userProfile.culturalBackground?.preferredCuisines,
          spiceTolerance: userProfile.culturalBackground?.spiceTolerance,
        },
      };

      recommendedSauces = recommendSauces(sauceCriteria, cuisineData.sauces);
    }

    // ========== MULTI-COURSE VALIDATION (if requested) ==========

    let multiCourseValidation: MultiCourseValidationResult | undefined;
    if (
      validateMultiCourse &&
      rankedRecipes &&
      rankedRecipes.length >= 2 &&
      userProfile.kineticProfile
    ) {
      const courses = rankedRecipes.slice(0, 3).map((ranked, index) => ({
        name: index === 0 ? "Appetizer" : index === 1 ? "Main" : "Dessert",
        recipe: ranked.recipe,
      }));

      multiCourseValidation = validateMultiCoursePowerFlow(
        courses,
        userProfile.kineticProfile.kineticMetrics,
      );
    }

    // ========== ENHANCEMENT SCORE ==========

    // Calculate enhancement score (how much the new factors improve recommendation quality)
    const enhancementScore =
      (kineticScore * 0.4 +
        thermodynamicScore * 0.4 +
        aspectPhaseAlignment * 0.2);

    // ========== CREATE RECOMMENDATION ==========

    recommendations.push({
      cuisineId,
      cuisineName,
      cuisine: cuisineName, // Backward compatibility
      compatibilityScore: overallScore,
      score: overallScore, // Backward compatibility
      scoringFactors: {
        elementalCompatibility,
        alchemicalCompatibility,
        culturalAlignment,
        seasonalRelevance,
        signatureMatch,
      },
      reasoning,
      confidence: Math.min(1, confidence),
      kineticCompatibility,
      thermodynamicResonance,
      aspectPhaseAlignment,
      rankedRecipes,
      recommendedSauces,
      multiCourseValidation,
      enhancementScore,
    });
  });

  // Sort by compatibility score (highest first)
  recommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  // Return top recommendations
  return recommendations.slice(0, maxRecommendations);
}

// ========== HELPER FUNCTIONS ==========

/**
 * Calculate alchemical compatibility (inline version for this module)
 */
function calculateAlchemicalCompatibility(
  userPreferences: Partial<AlchemicalProperties>,
  cuisineAlchemical: AlchemicalProperties,
): number {
  const properties: Array<keyof AlchemicalProperties> = [
    "Spirit",
    "Essence",
    "Matter",
    "Substance",
  ];
  let totalScore = 0;
  let weightedCount = 0;

  properties.forEach((property) => {
    const userPref = userPreferences[property];
    if (userPref === undefined) return;

    const cuisineValue = cuisineAlchemical[property];
    const compatibility = 1 - Math.abs(userPref - cuisineValue);
    const weight = userPref;

    totalScore += compatibility * weight;
    weightedCount += weight;
  });

  return weightedCount > 0 ? totalScore / weightedCount : 0.5;
}

// ========== EXPORTS ==========

export {
  // Re-export utility functions from sub-modules
  createUserKineticProfile,
  createUserThermodynamicProfile,
  aggregateCuisineKineticProfile,
  aggregateCuisineThermodynamicProfile,
  rankRecipesByCircuitCompatibility,
  validateMultiCoursePowerFlow,
  optimizeCourseSequence,
  generateCoursePairingRecommendations,
  recommendSauces,
};

// Default export for convenience
export default {
  generateEnhancedCuisineRecommendations,
  createUserKineticProfile,
  createUserThermodynamicProfile,
  aggregateCuisineKineticProfile,
  aggregateCuisineThermodynamicProfile,
};
