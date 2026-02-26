/**
 * Kinetic Cuisine Compatibility Module
 *
 * Integrates P=IV circuit model and kinetic properties into cuisine recommendations.
 * Provides sophisticated compatibility scoring based on:
 * - Power transfer efficiency
 * - Force classification alignment
 * - Current flow matching
 * - Thermal direction compatibility
 * - Aspect phase harmonization
 *
 * Part of the enhanced cuisine recommender system.
 */

import { calculateKinetics } from "@/calculations/kinetics";
import type { ThermodynamicProperties } from "@/types/alchemy";
import type { ElementalProperties } from "@/types/hierarchy";
import type { KineticMetrics } from "@/types/kinetics";
import { validateRecipeCircuit } from "@/utils/recipeCircuit";

// ========== TYPE DEFINITIONS ==========

export interface UserKineticProfile {
  /** User's current kinetic state */
  kineticMetrics: KineticMetrics;

  /** User's energy level preference (0-1 scale) */
  energyLevelPreference?: number;

  /** User's preferred force classification */
  preferredForceClassification?: "accelerating" | "decelerating" | "balanced";

  /** User's thermal preference */
  thermalPreference?: "heating" | "cooling" | "stable";

  /** User's power capacity (for multi-course validation) */
  powerCapacity?: number;
}

export interface CuisineKineticProfile {
  /** Cuisine's average kinetic metrics */
  averageKinetics: KineticMetrics;

  /** Cuisine's kinetic variance (measure of diversity) */
  kineticVariance?: {
    powerVariance: number;
    forceMagnitudeVariance: number;
    currentFlowVariance: number;
  };

  /** Dominant force classification across recipes */
  dominantForceClassification?: "accelerating" | "decelerating" | "balanced";

  /** Average circuit efficiency */
  averageCircuitEfficiency?: number;
}

export interface KineticCompatibilityResult {
  /** Overall kinetic compatibility score (0-1) */
  overallScore: number;

  /** Breakdown of individual kinetic factors */
  factors: {
    powerLevelCompatibility: number;
    forceClassificationMatch: number;
    currentFlowAlignment: number;
    thermalDirectionHarmony: number;
    circuitEfficiencyMatch: number;
    aspectPhaseAlignment: number;
  };

  /** Detailed reasoning */
  reasoning: string[];

  /** Recommended power optimization */
  powerOptimization?: {
    suggestedPortionSize: number;
    multiCourseRecommendation?: string;
  };
}

// ========== KINETIC COMPATIBILITY CALCULATION ==========

/**
 * Calculate comprehensive kinetic compatibility between user and cuisine
 */
export function calculateKineticCompatibility(
  userProfile: UserKineticProfile,
  cuisineProfile: CuisineKineticProfile,
  options: {
    weightPowerLevel?: number;
    weightForceClassification?: number;
    weightCurrentFlow?: number;
    weightThermalDirection?: number;
    weightCircuitEfficiency?: number;
    weightAspectPhase?: number;
  } = {},
): KineticCompatibilityResult {
  // Default weights
  const weights = {
    powerLevel: options.weightPowerLevel ?? 0.2,
    forceClassification: options.weightForceClassification ?? 0.2,
    currentFlow: options.weightCurrentFlow ?? 0.15,
    thermalDirection: options.weightThermalDirection ?? 0.15,
    circuitEfficiency: options.weightCircuitEfficiency ?? 0.15,
    aspectPhase: options.weightAspectPhase ?? 0.15,
  };

  const reasoning: string[] = [];

  // 1. Power Level Compatibility
  const powerLevelCompatibility = calculatePowerLevelCompatibility(
    userProfile,
    cuisineProfile,
    reasoning,
  );

  // 2. Force Classification Match
  const forceClassificationMatch = calculateForceClassificationMatch(
    userProfile,
    cuisineProfile,
    reasoning,
  );

  // 3. Current Flow Alignment
  const currentFlowAlignment = calculateCurrentFlowAlignment(
    userProfile.kineticMetrics,
    cuisineProfile.averageKinetics,
    reasoning,
  );

  // 4. Thermal Direction Harmony
  const thermalDirectionHarmony = calculateThermalDirectionHarmony(
    userProfile,
    cuisineProfile,
    reasoning,
  );

  // 5. Circuit Efficiency Match
  const circuitEfficiencyMatch = calculateCircuitEfficiencyMatch(
    userProfile.kineticMetrics,
    cuisineProfile,
    reasoning,
  );

  // 6. Aspect Phase Alignment
  const aspectPhaseAlignment = calculateAspectPhaseAlignment(
    userProfile.kineticMetrics,
    cuisineProfile.averageKinetics,
    reasoning,
  );

  // Calculate overall weighted score
  const overallScore =
    powerLevelCompatibility * weights.powerLevel +
    forceClassificationMatch * weights.forceClassification +
    currentFlowAlignment * weights.currentFlow +
    thermalDirectionHarmony * weights.thermalDirection +
    circuitEfficiencyMatch * weights.circuitEfficiency +
    aspectPhaseAlignment * weights.aspectPhase;

  // Power optimization recommendations
  const powerOptimization = calculatePowerOptimization(
    userProfile,
    cuisineProfile,
  );

  return {
    overallScore,
    factors: {
      powerLevelCompatibility,
      forceClassificationMatch,
      currentFlowAlignment,
      thermalDirectionHarmony,
      circuitEfficiencyMatch,
      aspectPhaseAlignment,
    },
    reasoning,
    powerOptimization,
  };
}

// ========== INDIVIDUAL FACTOR CALCULATIONS ==========

/**
 * Calculate power level compatibility
 * Matches user's energy level with cuisine's typical power requirements
 *
 * Enhanced with non-linear scaling and stronger discrimination
 */
function calculatePowerLevelCompatibility(
  userProfile: UserKineticProfile,
  cuisineProfile: CuisineKineticProfile,
  reasoning: string[],
): number {
  const userPower = userProfile.kineticMetrics.power;
  const cuisinePower = cuisineProfile.averageKinetics.power;
  const userEnergyPref = userProfile.energyLevelPreference ?? 0.5;

  // Normalize power levels (assuming typical range 0-100)
  const normalizedUserPower = Math.min(userPower / 100, 1.0);
  const normalizedCuisinePower = Math.min(cuisinePower / 100, 1.0);

  // Calculate match considering user's energy preference
  const powerDifference = Math.abs(
    normalizedUserPower - normalizedCuisinePower,
  );

  // Apply non-linear scaling to amplify differences (power function)
  let compatibility = Math.pow(1 - powerDifference, 1.5);

  // If user has low energy preference, penalize high-power cuisines (stronger penalty)
  if (userEnergyPref < 0.4 && normalizedCuisinePower > 0.7) {
    compatibility *= 0.4; // 60% penalty for high-energy cuisine when user prefers low energy
    reasoning.push(
      "Cuisine has higher energy requirements than your current preference",
    );
  } else if (userEnergyPref > 0.7 && normalizedCuisinePower > 0.6) {
    compatibility *= 1.5; // 50% bonus for high-energy match
    reasoning.push(
      "Strong power level alignment with your high-energy preference",
    );
  }

  return Math.max(0, Math.min(1, compatibility));
}

/**
 * Calculate force classification match
 * Aligns user's preferred kinetic state with cuisine's dominant force pattern
 *
 * Enhanced with stronger penalties for opposing forces
 */
function calculateForceClassificationMatch(
  userProfile: UserKineticProfile,
  cuisineProfile: CuisineKineticProfile,
  reasoning: string[],
): number {
  const userForce =
    userProfile.preferredForceClassification ||
    userProfile.kineticMetrics.forceClassification;
  const cuisineForce =
    cuisineProfile.dominantForceClassification ||
    cuisineProfile.averageKinetics.forceClassification;

  // Exact match
  if (userForce === cuisineForce) {
    reasoning.push(`Perfect force classification match: ${userForce}`);
    return 1.0;
  }

  // Partial matches - reduced scores for better discrimination
  if (userForce === "balanced") {
    reasoning.push(
      "Balanced force preference allows flexibility with this cuisine",
    );
    return 0.7; // Reduced from 0.8 - balanced matches reasonably with anything
  }

  if (cuisineForce === "balanced") {
    reasoning.push(
      "Cuisine's balanced force pattern adapts well to your preference",
    );
    return 0.65; // Reduced from 0.75
  }

  // Opposing forces (accelerating vs decelerating) - stronger penalty
  if (
    (userForce === "accelerating" && cuisineForce === "decelerating") ||
    (userForce === "decelerating" && cuisineForce === "accelerating")
  ) {
    reasoning.push(
      "Force classification opposes your preference - may feel energetically challenging",
    );
    return 0.15; // Reduced from 0.3 - opposing forces should be heavily penalized
  }

  return 0.4; // Default neutral (reduced from 0.5)
}

/**
 * Calculate current flow alignment
 * Higher current flow = more reactive, dynamic cooking
 *
 * Enhanced with non-linear scaling to amplify differences
 */
function calculateCurrentFlowAlignment(
  userKinetics: KineticMetrics,
  cuisineKinetics: KineticMetrics,
  reasoning: string[],
): number {
  const userCurrent = Math.abs(userKinetics.currentFlow);
  const cuisineCurrent = Math.abs(cuisineKinetics.currentFlow);

  // Normalize (typical range 0-10)
  const normalizedUserCurrent = Math.min(userCurrent / 10, 1.0);
  const normalizedCuisineCurrent = Math.min(cuisineCurrent / 10, 1.0);

  const currentDifference = Math.abs(
    normalizedUserCurrent - normalizedCuisineCurrent,
  );

  // Apply power function to amplify differences
  const alignment = Math.pow(1 - currentDifference, 1.5);

  if (alignment > 0.8) {
    reasoning.push(
      "Excellent current flow alignment - recipes will feel natural to prepare",
    );
  } else if (alignment < 0.5) {
    reasoning.push(
      "Current flow mismatch - cooking style may require adjustment",
    );
  }

  return alignment;
}

/**
 * Calculate thermal direction harmony
 * Matches heating/cooling trends with user preference
 *
 * Enhanced with lower defaults and stronger penalties
 */
function calculateThermalDirectionHarmony(
  userProfile: UserKineticProfile,
  cuisineProfile: CuisineKineticProfile,
  reasoning: string[],
): number {
  const userThermal =
    userProfile.thermalPreference ||
    userProfile.kineticMetrics.thermalDirection;
  const cuisineThermal = cuisineProfile.averageKinetics.thermalDirection;

  // Exact match
  if (userThermal === cuisineThermal) {
    reasoning.push(`Thermal direction aligned: ${userThermal}`);
    return 1.0;
  }

  // Stable is compatible with everything (reduced from 0.8)
  if (userThermal === "stable" || cuisineThermal === "stable") {
    return 0.7;
  }

  // Opposing thermal directions (stronger penalty)
  if (
    (userThermal === "heating" && cuisineThermal === "cooling") ||
    (userThermal === "cooling" && cuisineThermal === "heating")
  ) {
    reasoning.push(
      "Thermal direction opposes your preference - seasonal timing adjustment strongly recommended",
    );
    return 0.25; // Reduced from 0.4 - opposing thermal directions should be more penalized
  }

  return 0.5; // Default (reduced from 0.6)
}

/**
 * Calculate circuit efficiency match
 * P=IV power conservation and efficiency metrics
 *
 * Enhanced with non-linear scaling and stronger penalties for low efficiency
 */
function calculateCircuitEfficiencyMatch(
  userKinetics: KineticMetrics,
  cuisineProfile: CuisineKineticProfile,
  reasoning: string[],
): number {
  // Validate user's circuit (using a mock recipe for validation)
  const mockRecipe = { ingredients: [], cookingMethods: [] } as any;
  const userCircuit = validateRecipeCircuit(userKinetics, mockRecipe);

  const userEfficiency = userCircuit.efficiency;
  const cuisineEfficiency = cuisineProfile.averageCircuitEfficiency ?? 0.7;

  const efficiencyDifference = Math.abs(userEfficiency - cuisineEfficiency);

  // Apply power function to amplify differences
  let match = Math.pow(1 - efficiencyDifference, 1.5);

  // Extra penalty for low absolute efficiency (< 0.5)
  if (cuisineEfficiency < 0.5) {
    match *= 0.5; // 50% penalty for low-efficiency cuisines
    reasoning.push(
      "Low circuit efficiency - significant power losses expected",
    );
  }

  if (match > 0.85) {
    reasoning.push(
      "Exceptional circuit efficiency match - optimal power transfer",
    );
  } else if (match < 0.5) {
    reasoning.push(
      "Circuit efficiency mismatch - portion adjustments strongly recommended",
    );
  }

  return match;
}

/**
 * Calculate aspect phase alignment
 * Aligns current astrological aspects with cuisine's energy pattern
 *
 * Enhanced with lower defaults and better discrimination
 */
function calculateAspectPhaseAlignment(
  userKinetics: KineticMetrics,
  cuisineKinetics: KineticMetrics,
  reasoning: string[],
): number {
  const userPhase = userKinetics.aspectPhase;
  const cuisinePhase = cuisineKinetics.aspectPhase;

  // If no phase data, return lower neutral (reduced from 0.5)
  if (!userPhase || !cuisinePhase) {
    return 0.4;
  }

  // Exact match
  if (userPhase.type === cuisinePhase.type) {
    reasoning.push(
      `Aspect phase synchronized: ${userPhase.type} - ${userPhase.description}`,
    );
    return 1.0;
  }

  // Complementary phases (reduced from 0.75)
  if (
    (userPhase.type === "applying" && cuisinePhase.type === "exact") ||
    (userPhase.type === "exact" && cuisinePhase.type === "separating")
  ) {
    reasoning.push("Aspect phases are complementary - good energy flow");
    return 0.7;
  }

  // Opposing phases (stronger penalty, reduced from 0.4)
  if (
    (userPhase.type === "applying" && cuisinePhase.type === "separating") ||
    (userPhase.type === "separating" && cuisinePhase.type === "applying")
  ) {
    reasoning.push(
      "Aspect phase contrast - timing optimization strongly recommended",
    );
    return 0.2;
  }

  return 0.5; // Default (reduced from 0.6)
}

/**
 * Calculate power optimization recommendations
 */
function calculatePowerOptimization(
  userProfile: UserKineticProfile,
  cuisineProfile: CuisineKineticProfile,
): KineticCompatibilityResult["powerOptimization"] {
  const userPower = userProfile.kineticMetrics.power;
  const cuisinePower = cuisineProfile.averageKinetics.power;
  const powerCapacity = userProfile.powerCapacity ?? 100;

  // Calculate suggested portion size based on power ratio
  const powerRatio = userPower / Math.max(cuisinePower, 1);
  let suggestedPortionSize = 1.0; // Base portion

  if (powerRatio < 0.5) {
    suggestedPortionSize = 0.7; // Reduce portions for low power state
  } else if (powerRatio > 1.5) {
    suggestedPortionSize = 1.3; // Increase portions for high power state
  }

  // Multi-course recommendation
  let multiCourseRecommendation: string | undefined;
  if (cuisinePower * 3 <= powerCapacity) {
    multiCourseRecommendation =
      "Power capacity supports full 3-course meal from this cuisine";
  } else if (cuisinePower * 2 <= powerCapacity) {
    multiCourseRecommendation = "Power capacity optimal for 2-course meal";
  } else {
    multiCourseRecommendation =
      "Single course recommended to avoid power circuit overload";
  }

  return {
    suggestedPortionSize,
    multiCourseRecommendation,
  };
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Create user kinetic profile from planetary positions
 */
export function createUserKineticProfile(
  currentPlanetaryPositions: Record<string, string>,
  previousPlanetaryPositions?: Record<string, string>,
  preferences?: {
    energyLevelPreference?: number;
    preferredForceClassification?: "accelerating" | "decelerating" | "balanced";
    thermalPreference?: "heating" | "cooling" | "stable";
    powerCapacity?: number;
  },
): UserKineticProfile {
  const kineticMetrics = calculateKinetics({
    currentPlanetaryPositions,
    previousPlanetaryPositions,
    timeInterval: 3600, // 1 hour default
  });

  return {
    kineticMetrics,
    energyLevelPreference: preferences?.energyLevelPreference,
    preferredForceClassification: preferences?.preferredForceClassification,
    thermalPreference: preferences?.thermalPreference,
    powerCapacity: preferences?.powerCapacity,
  };
}

/**
 * Aggregate cuisine kinetic profile from recipe kinetics
 */
export function aggregateCuisineKineticProfile(
  recipeKinetics: KineticMetrics[],
): CuisineKineticProfile {
  if (recipeKinetics.length === 0) {
    throw new Error("Cannot aggregate kinetic profile from empty recipe list");
  }

  // Calculate averages
  const totalPower = recipeKinetics.reduce((sum, k) => sum + k.power, 0);
  const totalCurrentFlow = recipeKinetics.reduce(
    (sum, k) => sum + k.currentFlow,
    0,
  );
  const totalForceMagnitude = recipeKinetics.reduce(
    (sum, k) => sum + k.forceMagnitude,
    0,
  );
  const totalCharge = recipeKinetics.reduce((sum, k) => sum + k.charge, 0);
  const totalPotentialDiff = recipeKinetics.reduce(
    (sum, k) => sum + k.potentialDifference,
    0,
  );
  const totalInertia = recipeKinetics.reduce((sum, k) => sum + k.inertia, 0);

  const count = recipeKinetics.length;

  // Average kinetic metrics
  const averageKinetics: KineticMetrics = {
    velocity: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
    momentum: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
    force: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
    charge: totalCharge / count,
    potentialDifference: totalPotentialDiff / count,
    currentFlow: totalCurrentFlow / count,
    power: totalPower / count,
    inertia: totalInertia / count,
    forceMagnitude: totalForceMagnitude / count,
    forceClassification: determineDominantForceClassification(recipeKinetics),
    thermalDirection: determineDominantThermalDirection(recipeKinetics),
    aspectPhase: recipeKinetics[0].aspectPhase, // Use first as representative
  };

  // Calculate per-element averages
  (["Fire", "Water", "Earth", "Air"] as const).forEach((element) => {
    averageKinetics.velocity[element] =
      recipeKinetics.reduce((sum, k) => sum + k.velocity[element], 0) / count;
    averageKinetics.momentum[element] =
      recipeKinetics.reduce((sum, k) => sum + k.momentum[element], 0) / count;
    averageKinetics.force[element] =
      recipeKinetics.reduce((sum, k) => sum + k.force[element], 0) / count;
  });

  // Calculate variances
  const powerVariance = calculateVariance(recipeKinetics.map((k) => k.power));
  const forceMagnitudeVariance = calculateVariance(
    recipeKinetics.map((k) => k.forceMagnitude),
  );
  const currentFlowVariance = calculateVariance(
    recipeKinetics.map((k) => k.currentFlow),
  );

  // Calculate average circuit efficiency
  const averageCircuitEfficiency =
    calculateAverageCircuitEfficiency(recipeKinetics);

  return {
    averageKinetics,
    kineticVariance: {
      powerVariance,
      forceMagnitudeVariance,
      currentFlowVariance,
    },
    dominantForceClassification: averageKinetics.forceClassification,
    averageCircuitEfficiency,
  };
}

/**
 * Determine dominant force classification from recipe kinetics
 */
function determineDominantForceClassification(
  recipeKinetics: KineticMetrics[],
): "accelerating" | "decelerating" | "balanced" {
  const counts = {
    accelerating: 0,
    decelerating: 0,
    balanced: 0,
  };

  recipeKinetics.forEach((k) => {
    counts[k.forceClassification]++;
  });

  if (
    counts.accelerating > counts.decelerating &&
    counts.accelerating > counts.balanced
  ) {
    return "accelerating";
  } else if (
    counts.decelerating > counts.accelerating &&
    counts.decelerating > counts.balanced
  ) {
    return "decelerating";
  } else {
    return "balanced";
  }
}

/**
 * Determine dominant thermal direction from recipe kinetics
 */
function determineDominantThermalDirection(
  recipeKinetics: KineticMetrics[],
): "heating" | "cooling" | "stable" {
  const counts = {
    heating: 0,
    cooling: 0,
    stable: 0,
  };

  recipeKinetics.forEach((k) => {
    counts[k.thermalDirection]++;
  });

  if (counts.heating > counts.cooling && counts.heating > counts.stable) {
    return "heating";
  } else if (
    counts.cooling > counts.heating &&
    counts.cooling > counts.stable
  ) {
    return "cooling";
  } else {
    return "stable";
  }
}

/**
 * Calculate variance for an array of numbers
 */
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculate average circuit efficiency from recipe kinetics
 */
function calculateAverageCircuitEfficiency(
  recipeKinetics: KineticMetrics[],
): number {
  const mockRecipe = { ingredients: [], cookingMethods: [] } as any;

  const efficiencies = recipeKinetics.map((kinetics) => {
    const circuit = validateRecipeCircuit(kinetics, mockRecipe);
    return circuit.efficiency;
  });

  return efficiencies.reduce((sum, e) => sum + e, 0) / efficiencies.length;
}
