/**
 * Thermodynamic Resonance Scoring Module
 *
 * Calculates cuisine-user compatibility based on thermodynamic metrics:
 * - Kalchm (K_alchm): Alchemical equilibrium constant
 * - Monica Constant: Dynamic system constant
 * - Greg's Energy: Overall energy balance
 * - Heat, Entropy, Reactivity: Core thermodynamic properties
 *
 * Provides sophisticated resonance analysis for enhanced cuisine recommendations.
 */

import type { AlchemicalProperties, ElementalProperties, ThermodynamicProperties } from "@/types/alchemy";
import {
  calculateThermodynamicMetrics,
  calculateMonicaKalchmCompatibility,
  calculateKalchmHarmony,
} from "@/utils/monicaKalchmCalculations";

// ========== TYPE DEFINITIONS ==========

export interface UserThermodynamicProfile {
  /** User's current thermodynamic state */
  thermodynamicMetrics: ThermodynamicProperties;

  /** User's preferred energy balance (-1 to 1 scale) */
  energyBalancePreference?: number;

  /** User's heat tolerance (0-1 scale) */
  heatTolerance?: number;

  /** User's entropy preference (0-1 scale, higher = more chaotic/diverse) */
  entropyPreference?: number;

  /** User's reactivity preference (0-1 scale, higher = more transformative) */
  reactivityPreference?: number;
}

export interface CuisineThermodynamicProfile {
  /** Cuisine's average thermodynamic properties */
  averageThermodynamics: ThermodynamicProperties;

  /** Thermodynamic variance across recipes */
  thermodynamicVariance?: {
    heatVariance: number;
    entropyVariance: number;
    reactivityVariance: number;
    gregsEnergyVariance: number;
  };

  /** Signature thermodynamic characteristics */
  signatures?: {
    isHighHeat?: boolean; // z-score > 1.5
    isHighEntropy?: boolean;
    isHighReactivity?: boolean;
    isHighEnergy?: boolean;
  };
}

export interface ThermodynamicResonanceResult {
  /** Overall thermodynamic resonance score (0-1) */
  overallScore: number;

  /** Breakdown of individual thermodynamic factors */
  factors: {
    kalchmResonance: number;
    monicaAlignment: number;
    gregsEnergyHarmony: number;
    heatCompatibility: number;
    entropyMatch: number;
    reactivityAlignment: number;
  };

  /** Detailed reasoning */
  reasoning: string[];

  /** Transformation potential rating */
  transformationPotential: "low" | "moderate" | "high" | "exceptional";

  /** Stability assessment */
  stabilityAssessment: "very stable" | "stable" | "dynamic" | "highly dynamic";
}

// ========== THERMODYNAMIC RESONANCE CALCULATION ==========

/**
 * Calculate comprehensive thermodynamic resonance between user and cuisine
 */
export function calculateThermodynamicResonance(
  userProfile: UserThermodynamicProfile,
  cuisineProfile: CuisineThermodynamicProfile,
  options: {
    weightKalchm?: number;
    weightMonica?: number;
    weightGregsEnergy?: number;
    weightHeat?: number;
    weightEntropy?: number;
    weightReactivity?: number;
  } = {},
): ThermodynamicResonanceResult {
  // Default weights
  const weights = {
    kalchm: options.weightKalchm ?? 0.25,
    monica: options.weightMonica ?? 0.25,
    gregsEnergy: options.weightGregsEnergy ?? 0.15,
    heat: options.weightHeat ?? 0.15,
    entropy: options.weightEntropy ?? 0.10,
    reactivity: options.weightReactivity ?? 0.10,
  };

  const reasoning: string[] = [];

  // 1. Kalchm Resonance
  const kalchmResonance = calculateKalchmResonance(
    userProfile.thermodynamicMetrics,
    cuisineProfile.averageThermodynamics,
    reasoning,
  );

  // 2. Monica Alignment
  const monicaAlignment = calculateMonicaAlignment(
    userProfile.thermodynamicMetrics,
    cuisineProfile.averageThermodynamics,
    reasoning,
  );

  // 3. Greg's Energy Harmony
  const gregsEnergyHarmony = calculateGregsEnergyHarmony(
    userProfile,
    cuisineProfile,
    reasoning,
  );

  // 4. Heat Compatibility
  const heatCompatibility = calculateHeatCompatibility(
    userProfile,
    cuisineProfile,
    reasoning,
  );

  // 5. Entropy Match
  const entropyMatch = calculateEntropyMatch(
    userProfile,
    cuisineProfile,
    reasoning,
  );

  // 6. Reactivity Alignment
  const reactivityAlignment = calculateReactivityAlignment(
    userProfile,
    cuisineProfile,
    reasoning,
  );

  // Calculate overall weighted score
  const overallScore =
    kalchmResonance * weights.kalchm +
    monicaAlignment * weights.monica +
    gregsEnergyHarmony * weights.gregsEnergy +
    heatCompatibility * weights.heat +
    entropyMatch * weights.entropy +
    reactivityAlignment * weights.reactivity;

  // Determine transformation potential
  const transformationPotential = determineTransformationPotential(
    cuisineProfile.averageThermodynamics,
    userProfile.reactivityPreference,
  );

  // Assess stability
  const stabilityAssessment = assessStability(
    cuisineProfile.averageThermodynamics,
    cuisineProfile.thermodynamicVariance,
  );

  return {
    overallScore,
    factors: {
      kalchmResonance,
      monicaAlignment,
      gregsEnergyHarmony,
      heatCompatibility,
      entropyMatch,
      reactivityAlignment,
    },
    reasoning,
    transformationPotential,
    stabilityAssessment,
  };
}

// ========== INDIVIDUAL FACTOR CALCULATIONS ==========

/**
 * Calculate Kalchm resonance
 * Measures alchemical equilibrium compatibility
 *
 * Enhanced with logarithmic scaling for better discrimination
 */
function calculateKalchmResonance(
  userThermo: ThermodynamicProperties,
  cuisineThermo: ThermodynamicProperties,
  reasoning: string[],
): number {
  const userKalchm = userThermo.kalchm ?? 1;
  const cuisineKalchm = cuisineThermo.kalchm ?? 1;

  // Calculate ratio for logarithmic scaling
  const kalchmRatio = Math.min(userKalchm, cuisineKalchm) / Math.max(userKalchm, cuisineKalchm);

  // Use logarithmic scaling to better discriminate ratio differences
  // This gives: 1:1 = 1.0, 2:1 = 0.65, 3:1 = 0.45, 10:1 = 0
  const ratioScore = Math.max(0, 1 - Math.abs(Math.log(kalchmRatio)) / Math.log(10));

  // Bonus for both being near equilibrium (Kalchm ≈ 1.0)
  const equilibriumBonus = Math.max(
    0,
    1 - Math.abs(1 - userKalchm) - Math.abs(1 - cuisineKalchm)
  );

  // Apply power function to equilibrium bonus for more discrimination
  const resonance = ratioScore * 0.7 + Math.pow(equilibriumBonus, 1.5) * 0.3;

  if (resonance > 0.8) {
    reasoning.push("Exceptional Kalchm resonance - alchemical equilibrium strongly aligned");
  } else if (resonance > 0.6) {
    reasoning.push("Good Kalchm harmony - compatible alchemical dynamics");
  } else if (resonance < 0.4) {
    reasoning.push("Kalchm mismatch - alchemical properties may feel unbalanced");
  }

  return Math.max(0, Math.min(1, resonance));
}

/**
 * Calculate Monica Constant alignment
 * Measures dynamic system constant compatibility
 *
 * Enhanced with non-linear scaling and better discrimination
 */
function calculateMonicaAlignment(
  userThermo: ThermodynamicProperties,
  cuisineThermo: ThermodynamicProperties,
  reasoning: string[],
): number {
  const userMonica = userThermo.monica ?? 1;
  const cuisineMonica = cuisineThermo.monica ?? 1;

  // Monica difference (smaller = better alignment)
  const monicaDiff = Math.abs(userMonica - cuisineMonica);

  // Apply power function to amplify differences
  const alignment = Math.pow(Math.max(0, 1 - monicaDiff / 10), 1.5);

  // Special case: Both near 1.0 (neutral equilibrium) - reduced bonus
  if (Math.abs(userMonica - 1) < 0.2 && Math.abs(cuisineMonica - 1) < 0.2) {
    reasoning.push("Monica constants both near equilibrium - stable dynamic system");
    return Math.max(alignment, 0.8); // Reduced from 0.85
  }

  if (alignment > 0.75) {
    reasoning.push("Strong Monica alignment - dynamic system properties highly compatible");
  } else if (alignment < 0.4) {
    reasoning.push("Monica constant mismatch - system dynamics may require adjustment");
  }

  return alignment;
}

/**
 * Calculate Greg's Energy harmony
 * Measures overall energy balance compatibility
 *
 * Enhanced with non-linear scaling and stronger multipliers
 */
function calculateGregsEnergyHarmony(
  userProfile: UserThermodynamicProfile,
  cuisineProfile: CuisineThermodynamicProfile,
  reasoning: string[],
): number {
  const userEnergy = userProfile.thermodynamicMetrics.gregsEnergy;
  const cuisineEnergy = cuisineProfile.averageThermodynamics.gregsEnergy;
  const userPref = userProfile.energyBalancePreference ?? 0;

  // Calculate energy difference
  const energyDiff = Math.abs(userEnergy - cuisineEnergy);

  // Base harmony (closer values = better) - apply power function
  let harmony = Math.pow(Math.max(0, 1 - energyDiff / 5), 1.5);

  // Apply user preference with stronger multipliers
  if (userPref > 0 && cuisineEnergy > 0) {
    // User prefers positive energy, cuisine has positive energy
    harmony *= 1.5; // Increased from 1.2
    reasoning.push("Positive energy alignment matches your preference");
  } else if (userPref < 0 && cuisineEnergy < 0) {
    // User prefers negative energy, cuisine has negative energy
    harmony *= 1.5; // Increased from 1.2
    reasoning.push("Grounding energy alignment matches your preference");
  } else if (Math.abs(userPref) > 0.3 && Math.sign(cuisineEnergy) !== Math.sign(userPref)) {
    // User has strong preference but cuisine is opposite - stronger penalty
    harmony *= 0.4; // Reduced from 0.7
    reasoning.push("Energy balance opposes your strong preference");
  }

  // Clamp to 0-1
  return Math.max(0, Math.min(1, harmony));
}

/**
 * Calculate heat compatibility
 * Measures active energy compatibility
 *
 * Enhanced with non-linear scaling and stronger penalties
 */
function calculateHeatCompatibility(
  userProfile: UserThermodynamicProfile,
  cuisineProfile: CuisineThermodynamicProfile,
  reasoning: string[],
): number {
  const userHeat = userProfile.thermodynamicMetrics.heat;
  const cuisineHeat = cuisineProfile.averageThermodynamics.heat;
  const userTolerance = userProfile.heatTolerance ?? 0.5;

  // Normalize heat values (typical range 0-0.5)
  const normalizedUserHeat = Math.min(userHeat * 2, 1);
  const normalizedCuisineHeat = Math.min(cuisineHeat * 2, 1);

  const heatDiff = Math.abs(normalizedUserHeat - normalizedCuisineHeat);

  // Apply power function to amplify differences
  let compatibility = Math.pow(1 - heatDiff, 1.5);

  // Apply tolerance factor with stronger multipliers
  if (normalizedCuisineHeat > 0.7) {
    // High heat cuisine
    if (userTolerance < 0.4) {
      compatibility *= 0.3; // Stronger penalty (reduced from 0.6)
      reasoning.push("High heat cuisine significantly exceeds your heat tolerance");
    } else if (userTolerance > 0.7) {
      compatibility *= 1.6; // Stronger bonus (increased from 1.2)
      reasoning.push("High heat profile matches your heat tolerance well");
    }
  } else if (normalizedCuisineHeat < 0.3) {
    // Low heat cuisine
    if (userTolerance > 0.7) {
      compatibility *= 0.7; // Slight penalty for mismatch
      reasoning.push("Mild heat profile - may be less stimulating than preferred");
    } else {
      compatibility *= 1.2; // Small bonus
      reasoning.push("Gentle heat profile suits your preference");
    }
  }

  return Math.max(0, Math.min(1, compatibility));
}

/**
 * Calculate entropy match
 * Measures disorder/diversity compatibility
 *
 * Enhanced with non-linear scaling and stronger multipliers
 */
function calculateEntropyMatch(
  userProfile: UserThermodynamicProfile,
  cuisineProfile: CuisineThermodynamicProfile,
  reasoning: string[],
): number {
  const userEntropy = userProfile.thermodynamicMetrics.entropy;
  const cuisineEntropy = cuisineProfile.averageThermodynamics.entropy;
  const userPref = userProfile.entropyPreference ?? 0.5;

  // Normalize entropy (typical range 0-1)
  const normalizedCuisineEntropy = Math.min(cuisineEntropy, 1);

  const entropyDiff = Math.abs(userEntropy - cuisineEntropy);

  // Apply power function to amplify differences
  let match = Math.pow(1 - Math.min(entropyDiff, 1), 1.5);

  // Apply user preference with stronger multipliers
  if (userPref > 0.7 && normalizedCuisineEntropy > 0.6) {
    // User likes high diversity/chaos, cuisine is high entropy
    match *= 1.6; // Increased from 1.2
    reasoning.push("High culinary diversity matches your preference for variety");
  } else if (userPref < 0.3 && normalizedCuisineEntropy < 0.4) {
    // User prefers order/simplicity, cuisine is low entropy
    match *= 1.5; // Increased from 1.2
    reasoning.push("Structured, cohesive flavor profiles match your preference");
  } else if (Math.abs(userPref - normalizedCuisineEntropy) > 0.5) {
    // Strong mismatch between preference and cuisine entropy
    match *= 0.6; // Penalty for mismatch
    reasoning.push("Culinary complexity differs significantly from your preference");
  }

  return Math.max(0, Math.min(1, match));
}

/**
 * Calculate reactivity alignment
 * Measures transformative potential compatibility
 *
 * Enhanced with non-linear scaling and stronger multipliers
 */
function calculateReactivityAlignment(
  userProfile: UserThermodynamicProfile,
  cuisineProfile: CuisineThermodynamicProfile,
  reasoning: string[],
): number {
  const userReactivity = userProfile.thermodynamicMetrics.reactivity;
  const cuisineReactivity = cuisineProfile.averageThermodynamics.reactivity;
  const userPref = userProfile.reactivityPreference ?? 0.5;

  const reactivityDiff = Math.abs(userReactivity - cuisineReactivity);

  // Apply power function to amplify differences
  let alignment = Math.pow(1 - Math.min(reactivityDiff / 2, 1), 1.5);

  // Apply user preference with stronger multipliers
  if (userPref > 0.7 && cuisineReactivity > 1.0) {
    // User wants transformative cooking, cuisine is highly reactive
    alignment *= 1.8; // Increased from 1.3
    reasoning.push("Highly transformative cooking methods match your preference for complex preparations");
  } else if (userPref < 0.3 && cuisineReactivity < 0.5) {
    // User prefers simple cooking, cuisine is low reactivity
    alignment *= 1.5; // Increased from 1.2
    reasoning.push("Simple, straightforward preparations match your preference");
  } else if (Math.abs(userPref - cuisineReactivity) > 0.5) {
    alignment *= 0.5; // Stronger penalty (reduced from 0.8)
    reasoning.push("Cooking complexity differs significantly from your preference");
  }

  return Math.max(0, Math.min(1, alignment));
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Determine transformation potential
 */
function determineTransformationPotential(
  thermo: ThermodynamicProperties,
  userReactivityPref?: number,
): "low" | "moderate" | "high" | "exceptional" {
  const reactivity = thermo.reactivity;
  const kalchm = thermo.kalchm ?? 1;

  // High reactivity + favorable Kalchm = high transformation potential
  const transformationScore = reactivity * 0.7 + Math.abs(Math.log(kalchm)) * 0.3;

  if (transformationScore > 2.0) {
    return "exceptional";
  } else if (transformationScore > 1.2) {
    return "high";
  } else if (transformationScore > 0.6) {
    return "moderate";
  } else {
    return "low";
  }
}

/**
 * Assess stability of cuisine
 */
function assessStability(
  thermo: ThermodynamicProperties,
  variance?: CuisineThermodynamicProfile["thermodynamicVariance"],
): "very stable" | "stable" | "dynamic" | "highly dynamic" {
  const entropy = thermo.entropy;
  const entropyVar = variance?.entropyVariance ?? 0;
  const reactivityVar = variance?.reactivityVariance ?? 0;

  const stabilityScore = 1 / (1 + entropy + entropyVar + reactivityVar);

  if (stabilityScore > 0.7) {
    return "very stable";
  } else if (stabilityScore > 0.5) {
    return "stable";
  } else if (stabilityScore > 0.3) {
    return "dynamic";
  } else {
    return "highly dynamic";
  }
}

/**
 * Create user thermodynamic profile from properties
 */
export function createUserThermodynamicProfile(
  alchemicalProperties: AlchemicalProperties,
  elementalProperties: ElementalProperties,
  preferences?: {
    energyBalancePreference?: number;
    heatTolerance?: number;
    entropyPreference?: number;
    reactivityPreference?: number;
  },
): UserThermodynamicProfile {
  const thermodynamicMetrics = calculateThermodynamicMetrics(
    alchemicalProperties,
    elementalProperties,
  );

  return {
    thermodynamicMetrics,
    energyBalancePreference: preferences?.energyBalancePreference,
    heatTolerance: preferences?.heatTolerance,
    entropyPreference: preferences?.entropyPreference,
    reactivityPreference: preferences?.reactivityPreference,
  };
}

/**
 * Aggregate cuisine thermodynamic profile from recipe thermodynamics
 */
export function aggregateCuisineThermodynamicProfile(
  recipeThermodynamics: ThermodynamicProperties[],
): CuisineThermodynamicProfile {
  if (recipeThermodynamics.length === 0) {
    throw new Error("Cannot aggregate thermodynamic profile from empty recipe list");
  }

  const count = recipeThermodynamics.length;

  // Calculate averages
  const avgHeat = recipeThermodynamics.reduce((sum, t) => sum + t.heat, 0) / count;
  const avgEntropy = recipeThermodynamics.reduce((sum, t) => sum + t.entropy, 0) / count;
  const avgReactivity = recipeThermodynamics.reduce((sum, t) => sum + t.reactivity, 0) / count;
  const avgGregsEnergy = recipeThermodynamics.reduce((sum, t) => sum + t.gregsEnergy, 0) / count;
  const avgKalchm = recipeThermodynamics.reduce((sum, t) => sum + (t.kalchm ?? 1), 0) / count;
  const avgMonica = recipeThermodynamics.reduce((sum, t) => sum + (t.monica ?? 1), 0) / count;

  const averageThermodynamics: ThermodynamicProperties = {
    heat: avgHeat,
    entropy: avgEntropy,
    reactivity: avgReactivity,
    gregsEnergy: avgGregsEnergy,
    kalchm: avgKalchm,
    monica: avgMonica,
  };

  // Calculate variances
  const heatVariance = calculateVariance(recipeThermodynamics.map((t) => t.heat));
  const entropyVariance = calculateVariance(recipeThermodynamics.map((t) => t.entropy));
  const reactivityVariance = calculateVariance(recipeThermodynamics.map((t) => t.reactivity));
  const gregsEnergyVariance = calculateVariance(recipeThermodynamics.map((t) => t.gregsEnergy));

  // Identify signatures (z-score > 1.5)
  // For simplicity, using heuristics here - could calculate actual z-scores
  const signatures = {
    isHighHeat: avgHeat > 0.15,
    isHighEntropy: avgEntropy > 0.3,
    isHighReactivity: avgReactivity > 0.7,
    isHighEnergy: avgGregsEnergy > 0.05,
  };

  return {
    averageThermodynamics,
    thermodynamicVariance: {
      heatVariance,
      entropyVariance,
      reactivityVariance,
      gregsEnergyVariance,
    },
    signatures,
  };
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
 * Calculate multi-cuisine thermodynamic harmony
 * Useful for meal planning across multiple cuisines
 */
export function calculateMultiCuisineHarmony(
  cuisineProfiles: CuisineThermodynamicProfile[],
): number {
  if (cuisineProfiles.length === 0) return 0;
  if (cuisineProfiles.length === 1) return 1.0;

  let totalHarmony = 0;
  let comparisons = 0;

  // Compare each cuisine with every other cuisine
  for (let i = 0; i < cuisineProfiles.length; i++) {
    for (let j = i + 1; j < cuisineProfiles.length; j++) {
      const thermo1 = cuisineProfiles[i].averageThermodynamics;
      const thermo2 = cuisineProfiles[j].averageThermodynamics;

      // Calculate Kalchm ratio
      const kalchmRatio = Math.min(thermo1.kalchm ?? 1, thermo2.kalchm ?? 1) / Math.max(thermo1.kalchm ?? 1, thermo2.kalchm ?? 1);

      // Calculate Monica difference
      const monicaDiff = Math.abs((thermo1.monica ?? 1) - (thermo2.monica ?? 1));
      const monicaHarmony = Math.max(0, 1 - monicaDiff / 10);

      // Calculate energy compatibility
      const energyDiff = Math.abs(thermo1.gregsEnergy - thermo2.gregsEnergy);
      const energyHarmony = Math.max(0, 1 - energyDiff / 5);

      // Weighted harmony
      const pairHarmony = kalchmRatio * 0.4 + monicaHarmony * 0.3 + energyHarmony * 0.3;

      totalHarmony += pairHarmony;
      comparisons++;
    }
  }

  return comparisons > 0 ? totalHarmony / comparisons : 0.5;
}
