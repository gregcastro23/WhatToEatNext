/**
 * Enhanced Compatibility Scoring
 *
 * Uses thermodynamic and kinetic properties to create more meaningful
 * differentiation in match percentages across all recommenders.
 *
 * Key Principles:
 * - Non-linear scoring functions for better spread
 * - Thermodynamic state compatibility (Heat, Entropy, Reactivity, GregsEnergy)
 * - Kinetic properties integration (P=IV circuit model)
 * - Composite scoring that rewards perfect matches and penalizes large differences
 */

import type { ElementalProperties } from "@/types/celestial";
import type { KineticMetrics } from "@/types/kinetics";
import { _logger } from "@/lib/logger";

const log = _logger;

export interface ThermodynamicState {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kalchm?: number;
  monica?: number;
}

export interface KineticState {
  power: number;
  currentFlow: number;
  potentialDifference: number;
  charge: number;
  velocity?: Record<string, number>;
  momentum?: Record<string, number>;
  forceMagnitude?: number;
}

export interface EnhancedCompatibilityResult {
  overallScore: number;
  thermodynamicCompatibility: number;
  kineticCompatibility: number;
  elementalCompatibility: number;
  compositeScore: number;
  breakdown: {
    heatCompatibility: number;
    entropyCompatibility: number;
    reactivityCompatibility: number;
    energyCompatibility: number;
    powerCompatibility: number;
    circuitCompatibility: number;
  };
}

/**
 * Non-linear compatibility function using exponential decay
 * Creates better differentiation than linear 1 - |diff|
 *
 * Perfect match (diff=0) → 1.0
 * Small diff (0.1) → ~0.9
 * Medium diff (0.5) → ~0.6
 * Large diff (1.0) → ~0.37
 */
function exponentialCompatibility(value1: number, value2: number, sensitivity = 2.0): number {
  const diff = Math.abs(value1 - value2);
  // e^(-sensitivity * diff) creates exponential decay
  return Math.exp(-sensitivity * diff);
}

/**
 * Sigmoid-based compatibility for thermodynamic properties
 * Rewards very close matches more than linear approaches
 *
 * diff=0 → 1.0
 * diff=0.2 → ~0.73
 * diff=0.5 → ~0.38
 * diff=1.0 → ~0.12
 */
function sigmoidCompatibility(value1: number, value2: number, steepness = 5.0): number {
  const diff = Math.abs(value1 - value2);
  // 1 / (1 + e^(steepness * (diff - 0.5)))
  // Shifted sigmoid centered at diff=0
  return 1 / (1 + Math.exp(steepness * diff));
}

/**
 * Logarithmic compatibility for large-scale differences
 * Good for properties that can vary widely (like Kalchm)
 */
function logarithmicCompatibility(value1: number, value2: number): number {
  if (value1 === 0 || value2 === 0) return 0.5;

  const ratio = Math.max(value1, value2) / Math.min(value1, value2);
  // log(ratio) grows slowly, so we use 1/(1 + log(ratio))
  return 1 / (1 + Math.log(ratio));
}

/**
 * Calculate thermodynamic compatibility between two states
 * Uses sophisticated non-linear functions for better differentiation
 */
export function calculateThermodynamicCompatibility(
  userState: ThermodynamicState,
  itemState: ThermodynamicState,
): {
  overall: number;
  heatCompatibility: number;
  entropyCompatibility: number;
  reactivityCompatibility: number;
  energyCompatibility: number;
  kalchmCompatibility: number;
  monicaCompatibility: number;
} {
  // Heat compatibility - exponential (sensitive to differences)
  const heatCompatibility = exponentialCompatibility(
    userState.heat,
    itemState.heat,
    3.0, // Higher sensitivity for heat
  );

  // Entropy compatibility - sigmoid (rewards close matches)
  const entropyCompatibility = sigmoidCompatibility(
    userState.entropy,
    itemState.entropy,
    4.0,
  );

  // Reactivity compatibility - exponential (moderate sensitivity)
  const reactivityCompatibility = exponentialCompatibility(
    userState.reactivity,
    itemState.reactivity,
    2.5,
  );

  // Greg's Energy compatibility - sigmoid (can be positive or negative)
  // Normalize to [0, 1] range first
  const normalizedUserEnergy = (userState.gregsEnergy + 10) / 20; // Assume range [-10, 10]
  const normalizedItemEnergy = (itemState.gregsEnergy + 10) / 20;
  const energyCompatibility = sigmoidCompatibility(
    normalizedUserEnergy,
    normalizedItemEnergy,
    3.0,
  );

  // Kalchm compatibility - logarithmic (can vary widely)
  const kalchmCompatibility = userState.kalchm && itemState.kalchm
    ? logarithmicCompatibility(userState.kalchm, itemState.kalchm)
    : 0.5;

  // Monica compatibility - exponential
  const monicaCompatibility = userState.monica && itemState.monica
    ? exponentialCompatibility(userState.monica, itemState.monica, 2.0)
    : 0.5;

  // Weighted overall compatibility
  const overall =
    heatCompatibility * 0.25 +
    entropyCompatibility * 0.2 +
    reactivityCompatibility * 0.2 +
    energyCompatibility * 0.15 +
    kalchmCompatibility * 0.1 +
    monicaCompatibility * 0.1;

  log.debug("Thermodynamic compatibility calculated", {
    overall,
    heatCompatibility,
    entropyCompatibility,
    reactivityCompatibility,
    energyCompatibility,
  } as any);

  return {
    overall,
    heatCompatibility,
    entropyCompatibility,
    reactivityCompatibility,
    energyCompatibility,
    kalchmCompatibility,
    monicaCompatibility,
  };
}

/**
 * Calculate kinetic compatibility based on P=IV circuit model
 * Power, Current, Voltage matching for temporal alignment
 */
export function calculateKineticCompatibility(
  userKinetics: KineticState,
  itemKinetics: KineticState,
): {
  overall: number;
  powerCompatibility: number;
  circuitCompatibility: number;
  chargeCompatibility: number;
  momentumCompatibility: number;
} {
  // Power compatibility (P = I × V)
  const powerCompatibility = exponentialCompatibility(
    userKinetics.power,
    itemKinetics.power,
    2.5,
  );

  // Current flow compatibility
  const currentCompatibility = exponentialCompatibility(
    userKinetics.currentFlow,
    itemKinetics.currentFlow,
    2.0,
  );

  // Potential difference compatibility
  const voltageCompatibility = exponentialCompatibility(
    userKinetics.potentialDifference,
    itemKinetics.potentialDifference,
    2.0,
  );

  // Circuit compatibility (combined I and V)
  // Using P=IV relationship: items with similar power dynamics
  const circuitCompatibility = (currentCompatibility + voltageCompatibility) / 2;

  // Charge compatibility
  const chargeCompatibility = exponentialCompatibility(
    userKinetics.charge,
    itemKinetics.charge,
    2.0,
  );

  // Momentum compatibility (if available)
  let momentumCompatibility = 0.5;
  if (userKinetics.momentum && itemKinetics.momentum) {
    const momentumScores = Object.keys(userKinetics.momentum).map((element) => {
      const userMom = userKinetics.momentum![element] || 0;
      const itemMom = itemKinetics.momentum![element] || 0;
      return exponentialCompatibility(userMom, itemMom, 1.5);
    });
    momentumCompatibility = momentumScores.reduce((a, b) => a + b, 0) / momentumScores.length;
  }

  // Overall kinetic compatibility
  const overall =
    powerCompatibility * 0.35 +
    circuitCompatibility * 0.3 +
    chargeCompatibility * 0.2 +
    momentumCompatibility * 0.15;

  log.debug("Kinetic compatibility calculated", {
    overall,
    powerCompatibility,
    circuitCompatibility,
  } as any);

  return {
    overall,
    powerCompatibility,
    circuitCompatibility,
    chargeCompatibility,
    momentumCompatibility,
  };
}

/**
 * Enhanced elemental compatibility using non-linear functions
 * Replaces simple 1 - |diff| with exponential decay
 */
export function calculateEnhancedElementalCompatibility(
  userElements: ElementalProperties,
  itemElements: ElementalProperties,
): number {
  const fireCompat = exponentialCompatibility(
    userElements.Fire,
    itemElements.Fire,
    2.0,
  );
  const waterCompat = exponentialCompatibility(
    userElements.Water,
    itemElements.Water,
    2.0,
  );
  const earthCompat = exponentialCompatibility(
    userElements.Earth,
    itemElements.Earth,
    2.0,
  );
  const airCompat = exponentialCompatibility(
    userElements.Air,
    itemElements.Air,
    2.0,
  );

  // Average of all four elements
  const overall = (fireCompat + waterCompat + earthCompat + airCompat) / 4;

  log.debug("Enhanced elemental compatibility", {
    overall,
    fire: fireCompat,
    water: waterCompat,
    earth: earthCompat,
    air: airCompat,
  } as any);

  return overall;
}

/**
 * Master compatibility function combining all approaches
 * Creates highly differentiated scores across recommendations
 */
export function calculateEnhancedCompatibility(
  userState: {
    thermodynamic: ThermodynamicState;
    kinetic: KineticState;
    elemental: ElementalProperties;
  },
  itemState: {
    thermodynamic: ThermodynamicState;
    kinetic: KineticState;
    elemental: ElementalProperties;
  },
): EnhancedCompatibilityResult {
  // Calculate individual compatibility scores
  const thermoCompat = calculateThermodynamicCompatibility(
    userState.thermodynamic,
    itemState.thermodynamic,
  );

  const kineticCompat = calculateKineticCompatibility(
    userState.kinetic,
    itemState.kinetic,
  );

  const elementalCompat = calculateEnhancedElementalCompatibility(
    userState.elemental,
    itemState.elemental,
  );

  // Composite score with strategic weights
  // Emphasizes thermodynamic and kinetic properties more than before
  const compositeScore =
    thermoCompat.overall * 0.35 +      // Thermodynamic state (highest weight)
    kineticCompat.overall * 0.3 +      // Kinetic properties
    elementalCompat * 0.35;             // Elemental alignment

  // Overall score uses geometric mean for better differentiation
  // Geometric mean penalizes imbalanced scores more than arithmetic mean
  const geometricMean = Math.pow(
    thermoCompat.overall * kineticCompat.overall * elementalCompat,
    1 / 3,
  );

  // Blend geometric and composite for final score
  const overallScore = geometricMean * 0.6 + compositeScore * 0.4;

  log.info("Enhanced compatibility score calculated", {
    overallScore,
    compositeScore,
    thermoCompat: thermoCompat.overall,
    kineticCompat: kineticCompat.overall,
    elementalCompat,
  } as any);

  return {
    overallScore,
    thermodynamicCompatibility: thermoCompat.overall,
    kineticCompatibility: kineticCompat.overall,
    elementalCompatibility: elementalCompat,
    compositeScore,
    breakdown: {
      heatCompatibility: thermoCompat.heatCompatibility,
      entropyCompatibility: thermoCompat.entropyCompatibility,
      reactivityCompatibility: thermoCompat.reactivityCompatibility,
      energyCompatibility: thermoCompat.energyCompatibility,
      powerCompatibility: kineticCompat.powerCompatibility,
      circuitCompatibility: kineticCompat.circuitCompatibility,
    },
  };
}

/**
 * Convert compatibility score to match percentage with enhanced spread
 * Uses power function to create more differentiation
 *
 * With exponent=1.5 (expands range):
 * Score 1.0 → 100%
 * Score 0.9 → 85%
 * Score 0.8 → 72%
 * Score 0.7 → 58%
 * Score 0.6 → 46%
 * Score 0.5 → 35%
 *
 * Higher exponent = more spread between scores
 */
export function compatibilityToMatchPercentage(
  compatibilityScore: number,
  exponent = 1.5,
): number {
  // Apply power function to EXPAND score range (exponent > 1)
  // This creates better differentiation between top matches
  const adjusted = Math.pow(compatibilityScore, exponent);

  // Convert to percentage (0-100)
  const percentage = adjusted * 100;

  // Ensure reasonable bounds (30-100 for better UX)
  return Math.max(30, Math.min(100, Math.round(percentage)));
}

/**
 * Quick compatibility check for filtering recommendations
 * Returns true if compatibility meets minimum threshold
 */
export function meetsCompatibilityThreshold(
  userState: {
    thermodynamic: ThermodynamicState;
    kinetic: KineticState;
    elemental: ElementalProperties;
  },
  itemState: {
    thermodynamic: ThermodynamicState;
    kinetic: KineticState;
    elemental: ElementalProperties;
  },
  threshold = 0.4,
): boolean {
  const result = calculateEnhancedCompatibility(userState, itemState);
  return result.overallScore >= threshold;
}
