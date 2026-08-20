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

import { _logger } from "@/lib/logger";
import type { ElementalProperties } from "@/types/celestial";

const log = _logger;

export interface ThermodynamicState {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kalchm?: number;
  monica?: number;
}

export interface HistoricalMetrics {
  heat?: { mean: number; stdDev: number };
  entropy?: { mean: number; stdDev: number };
  reactivity?: { mean: number; stdDev: number };
  power?: { mean: number; stdDev: number };
  currentFlow?: { mean: number; stdDev: number };
  charge?: { mean: number; stdDev: number };
  kalchm?: { mean: number; stdDev: number };
  monica?: { mean: number; stdDev: number };
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
function exponentialCompatibility(
  value1: number,
  value2: number,
  sensitivity = 2.0,
): number {
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
function sigmoidCompatibility(
  value1: number,
  value2: number,
  steepness = 5.0,
): number {
  const diff = Math.abs(value1 - value2);
  // Shifted sigmoid centered at diff=0 scaled to [0, 1] range:
  // f(0) = 1.0, and f(diff) decays to 0.
  return 2 / (1 + Math.exp(steepness * diff));
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

// Priors for z-score projection (`projectZScoreTarget`).
//
// ── heat / entropy / reactivity — [MEASURED 2026-08-02] ─────────────────────
//
// BASIS: mean and POPULATION standard deviation (÷N, not ÷(N−1)) over all 1821
// samples of src/data/alchemicalSamples.json, fields thermo[0], thermo[1],
// thermo[2]. Rounded to 3 decimal places (2 for reactivity, whose magnitude is
// two orders larger). The sample estimator agrees with the population one at
// this precision on all three, so that choice is not load-bearing.
//
//   metric      exact measurement          shipped
//   heat        0.122523942888523 / 0.076266646038866   0.123 / 0.076
//   entropy     0.392861153212521 / 0.262027323027900   0.393 / 0.262
//   reactivity 14.454043717737505 / 21.865234800984545  14.45 / 21.87
//
// These are RE-DERIVED, not adjusted: `fallbackMetricsDerivation.test.ts`
// recomputes all six numbers from the sample file on every run and fails if
// either the file or these constants move. That test is the reason this block
// can be trusted; the previous values had no such check and went ~2x stale
// unnoticed (see below).
//
// ⚠️ WHY THEY MOVED. The previous priors (heat 0.067/0.037, entropy
// 0.225/0.101, reactivity 6.54/6.91) were themselves honestly derived — five of
// those six numbers still round-trip exactly against the sample file AS IT WAS
// COMMITTED. What moved was the file underneath them: regenerating
// alchemicalSamples.json on master changed 1821/1821 samples, because the ESMS
// engine unified onto the inertial-mass scale (#695/#710) and the stored Sun
// contribution went 0.51307 → 1.0. So this is not a correction of a bad
// derivation, it is a re-derivation over a corpus that was silently replaced.
// NOT caused by ADR-009 decision 5 — see docs/adr/009 "Decision 5, remeasured".
//
// (The sixth: heat's stdDev shipped as 0.037 where the committed samples give
// 0.036463, i.e. one unit off in the last place. Small, but it means the old
// block was not fully reproducible from its own basis either.)
//
// ⚠️ REACTIVITY IS HEAVY-TAILED, and more so than before. Its MEDIAN barely
// moved (5.101 → 5.462, +7%) while p99 went 28.5 → 105.7 and max 39.9 → 210.5.
// So mean (14.45) now sits far above median (5.46) and stdDev exceeds the mean
// (ratio 1.51, was 1.06). A z-score prior over a distribution this skewed maps
// the TYPICAL case to a negative z (median → −0.41, was −0.21). That is a
// faithful summary of the corpus, not a modelling choice made here — but if
// reactivity compatibility ever needs to key off typical rather than mean
// behaviour, a robust prior (median / IQR) is the change to make, and it is a
// model decision rather than a recalibration.
//
// ── kalchm / monica — RULED anchors, deliberately NOT sample means ──────────
//
// 1.0 is the multiplicative identity / balance point. Their raw distributions
// are degenerate for this purpose (kalchm here spans 0.04 → 9753 with mean 261;
// monica clusters near 0), so a sample mean would be a poor prior. Unchanged.
//
// ── power / currentFlow / charge — ⚠️ UNBASED ──────────────────────────────
//
// These have NO measurement behind them. The previous note called them "kinetic
// quantities, unaffected by the thermodynamic reconciliation", which is true but
// says only that this file's recalibration did not reach them — it is not a
// basis. There is no kinetics corpus in the repo (alchemicalSamples.json and
// alchemicalEchoSamples.json both carry zero kinetic fields), and the values
// entered in 2f5de52e as round hand numbers with stdDev at exactly half the mean
// in two of three cases. They are LIVE — `projectZScoreTarget` is called with
// all three keys at :263-265 — so they are left in place rather than removed,
// but they are recorded here as unbased so the next person does not mistake
// their neighbours' provenance for their own. Deriving them needs a kinetics
// corpus that does not yet exist.
export const FALLBACK_METRICS: Record<string, { mean: number; stdDev: number }> = {
  // MEASURED — re-derive with fallbackMetricsDerivation.test.ts, never by hand.
  heat: { mean: 0.123, stdDev: 0.076 },
  entropy: { mean: 0.393, stdDev: 0.262 },
  reactivity: { mean: 14.45, stdDev: 21.87 },
  // RULED equilibrium anchors.
  kalchm: { mean: 1.0, stdDev: 0.5 },
  monica: { mean: 1.0, stdDev: 0.5 },
  // ⚠️ UNBASED — no corpus exists for these. See the note above.
  power: { mean: 0.08, stdDev: 0.04 },
  currentFlow: { mean: 0.4, stdDev: 0.2 },
  charge: { mean: 8.0, stdDev: 3.0 },
};

/**
 * Projects a raw tightly-compressed metric into a widened 0.1-0.9 distribution
 * targeting extreme bounds, based on its standard deviation Z-Score.
 */
export function projectZScoreTarget(
  value: number,
  metric?: { mean: number; stdDev: number },
  fallbackKey?: string
): number {
  const activeMetric = metric ?? (fallbackKey ? FALLBACK_METRICS[fallbackKey] : undefined);
  if (!activeMetric || activeMetric.stdDev === 0) {
    // If absolutely no metric or fallback, at least clamp to standard [0.1, 0.9] range.
    return Math.max(0.1, Math.min(0.9, value));
  }
  const zScore = (value - activeMetric.mean) / activeMetric.stdDev;
  return Math.max(0.1, Math.min(0.9, 0.5 + (zScore * 0.15)));
}

/**
 * Calculate thermodynamic compatibility between two states
 * Uses sophisticated non-linear functions for better differentiation
 */
export function calculateThermodynamicCompatibility(
  userState: ThermodynamicState,
  itemState: ThermodynamicState,
  historicalMetrics?: HistoricalMetrics,
): {
  overall: number;
  heatCompatibility: number;
  entropyCompatibility: number;
  reactivityCompatibility: number;
  energyCompatibility: number;
  kalchmCompatibility: number;
  monicaCompatibility: number;
} {
  const userHeatTarget = projectZScoreTarget(userState.heat, historicalMetrics?.heat, "heat");
  const userEntropyTarget = projectZScoreTarget(userState.entropy, historicalMetrics?.entropy, "entropy");
  const userReactivityTarget = projectZScoreTarget(userState.reactivity, historicalMetrics?.reactivity, "reactivity");
  const userKalchmTarget = userState.kalchm ? projectZScoreTarget(userState.kalchm, historicalMetrics?.kalchm, "kalchm") : undefined;
  const userMonicaTarget = userState.monica ? projectZScoreTarget(userState.monica, historicalMetrics?.monica, "monica") : undefined;

  // Heat compatibility - exponential (sensitive to differences)
  const heatCompatibility = exponentialCompatibility(
    userHeatTarget,
    itemState.heat,
    3.0, // Higher sensitivity for heat
  );

  // Entropy compatibility - sigmoid (rewards close matches)
  const entropyCompatibility = sigmoidCompatibility(
    userEntropyTarget,
    itemState.entropy,
    4.0,
  );

  // Reactivity compatibility - exponential (moderate sensitivity)
  const reactivityCompatibility = exponentialCompatibility(
    userReactivityTarget,
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
  const kalchmCompatibility =
    userKalchmTarget && itemState.kalchm
      ? logarithmicCompatibility(userKalchmTarget, itemState.kalchm)
      : 0.5;

  // Monica compatibility - exponential
  const monicaCompatibility =
    userMonicaTarget && itemState.monica
      ? exponentialCompatibility(userMonicaTarget, itemState.monica, 2.0)
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
  });

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
  historicalMetrics?: HistoricalMetrics,
): {
  overall: number;
  powerCompatibility: number;
  circuitCompatibility: number;
  chargeCompatibility: number;
  momentumCompatibility: number;
} {
  const userPowerTarget = projectZScoreTarget(userKinetics.power, historicalMetrics?.power, "power");
  const userCurrentTarget = projectZScoreTarget(userKinetics.currentFlow, historicalMetrics?.currentFlow, "currentFlow");
  const userChargeTarget = projectZScoreTarget(userKinetics.charge, historicalMetrics?.charge, "charge");

  // Power compatibility (P = I × V)
  const powerCompatibility = exponentialCompatibility(
    userPowerTarget,
    itemKinetics.power,
    2.5,
  );

  // Current flow compatibility
  const currentCompatibility = exponentialCompatibility(
    userCurrentTarget,
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
  const circuitCompatibility =
    (currentCompatibility + voltageCompatibility) / 2;

  // Charge compatibility
  const chargeCompatibility = exponentialCompatibility(
    userChargeTarget,
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
    momentumCompatibility =
      momentumScores.reduce((a, b) => a + b, 0) / momentumScores.length;
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
  });

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
  });

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
  historicalMetrics?: HistoricalMetrics,
): EnhancedCompatibilityResult {
  // Calculate individual compatibility scores
  const thermoCompat = calculateThermodynamicCompatibility(
    userState.thermodynamic,
    itemState.thermodynamic,
    historicalMetrics,
  );

  const kineticCompat = calculateKineticCompatibility(
    userState.kinetic,
    itemState.kinetic,
    historicalMetrics,
  );

  const elementalCompat = calculateEnhancedElementalCompatibility(
    userState.elemental,
    itemState.elemental,
  );

  // Composite score with strategic weights
  // Emphasizes thermodynamic and kinetic properties more than before
  const compositeScore =
    thermoCompat.overall * 0.35 + // Thermodynamic state (highest weight)
    kineticCompat.overall * 0.3 + // Kinetic properties
    elementalCompat * 0.35; // Elemental alignment

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
  });

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
