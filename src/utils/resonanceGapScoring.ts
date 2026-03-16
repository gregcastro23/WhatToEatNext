/**
 * Resonance Gap Scoring System
 *
 * Replaces simple weighted-average scoring with a "Resonance Gap" model that:
 * 1. Dynamically adjusts weights based on astrological stress windows
 * 2. Accepts a userIntent parameter (Crispy, Tender, Fast) to bias scoring
 * 3. Outputs a "Harmony Index" (0–100%) instead of raw 0–1 scores
 *
 * The Harmony Index represents how well a cooking method aligns the
 * ingredients, the season, and the planetary hour.
 */

// ========== TYPES ==========

export type UserIntent = "crispy" | "tender" | "fast" | "flavorful" | "stable" | null;

export type FocusMode = "harmony" | "quickest" | "stability" | "flavorful";

export interface ResonanceInput {
  /** Transformed ESMS after pillar application */
  transformedESMS: { Spirit: number; Essence: number; Matter: number; Substance: number };
  /** Method elemental effect */
  elementalEffect: { Fire: number; Water: number; Earth: number; Air: number };
  /** Method thermodynamic properties */
  thermodynamics: { heat: number; entropy: number; reactivity: number };
  /** Greg's Energy value */
  gregsEnergy: number;
  /** Kalchm equilibrium constant */
  kalchm: number;
  /** Monica constant */
  monica: number | null;
  /** Method duration range */
  duration?: { min: number; max: number };
  /** Kinetic power (P=IV) */
  kineticPower?: number;
}

export interface AstrologicalStressContext {
  /** Whether Mars-Saturn square (or similar hard aspect) is active */
  highStress: boolean;
  /** Current planetary emphasis — planets that are strongly aspected */
  dominantPlanets?: string[];
}

export interface HarmonyResult {
  /** Overall harmony index 0–100 */
  harmonyIndex: number;
  /** Human-readable label */
  label: string;
  /** Individual dimension scores (0–100 each) */
  breakdown: {
    /** How well the method's Monica sits in the optimal 1–5 range */
    stabilityResonance: number;
    /** Alignment between elemental profile and user intent */
    intentAlignment: number;
    /** Thermodynamic efficiency (positive Greg's Energy = good) */
    thermoEfficiency: number;
    /** How balanced the ESMS distribution is */
    alchemicalBalance: number;
    /** Speed factor (lower duration = higher for "fast" intent) */
    speedFactor: number;
  };
}

// ========== CORE SCORING ==========

/**
 * Calculate the Harmony Index for a single cooking method.
 */
export function calculateHarmonyIndex(
  input: ResonanceInput,
  userIntent: UserIntent = null,
  stressContext: AstrologicalStressContext = { highStress: false },
  focusMode: FocusMode = "harmony",
): HarmonyResult {
  // 1. Stability Resonance — Monica in the sweet spot (1–5 is optimal)
  const stabilityResonance = calculateStabilityResonance(input.monica);

  // 2. Intent Alignment — how well the method matches what the user wants
  const intentAlignment = calculateIntentAlignment(input, userIntent);

  // 3. Thermodynamic Efficiency — positive Greg's Energy is preferred
  const thermoEfficiency = calculateThermoEfficiency(input.gregsEnergy, input.thermodynamics);

  // 4. Alchemical Balance — how evenly distributed the ESMS is
  const alchemicalBalance = calculateAlchemicalBalance(input.transformedESMS);

  // 5. Speed Factor — based on method duration
  const speedFactor = calculateSpeedFactor(input.duration);

  // Dynamic weighting based on stress context and focus mode
  const weights = getWeights(userIntent, stressContext, focusMode);

  // Weighted sum
  const raw =
    stabilityResonance * weights.stability +
    intentAlignment * weights.intent +
    thermoEfficiency * weights.thermo +
    alchemicalBalance * weights.balance +
    speedFactor * weights.speed;

  // Clamp to 0–100
  const harmonyIndex = Math.max(0, Math.min(100, raw));

  return {
    harmonyIndex,
    label: getHarmonyLabel(harmonyIndex),
    breakdown: {
      stabilityResonance,
      intentAlignment,
      thermoEfficiency,
      alchemicalBalance,
      speedFactor,
    },
  };
}

// ========== DIMENSION CALCULATORS ==========

function calculateStabilityResonance(monica: number | null): number {
  if (monica === null || isNaN(monica)) return 50;
  // Optimal Monica range: 1–5 ("Balanced" to "Transformative")
  // Use a bell curve centered on 3 with σ=3
  const center = 3;
  const sigma = 3;
  const deviation = Math.abs(monica - center);
  const score = 100 * Math.exp(-(deviation * deviation) / (2 * sigma * sigma));
  return Math.max(5, Math.min(100, score));
}

function calculateIntentAlignment(input: ResonanceInput, intent: UserIntent): number {
  if (!intent) return 70; // Neutral when no intent specified

  const { elementalEffect, thermodynamics } = input;

  switch (intent) {
    case "crispy": {
      // Crispy wants high Fire, high Reactivity, high Heat
      const fireScore = (elementalEffect.Fire || 0) * 100;
      const reactivityScore = thermodynamics.reactivity * 100;
      const heatScore = thermodynamics.heat * 100;
      return Math.min(100, (fireScore * 0.4 + reactivityScore * 0.3 + heatScore * 0.3));
    }
    case "tender": {
      // Tender wants high Water, low Heat, moderate Entropy
      const waterScore = (elementalEffect.Water || 0) * 100;
      const gentleHeatScore = (1 - thermodynamics.heat) * 100;
      const entropyScore = Math.max(0, 100 - Math.abs(thermodynamics.entropy - 0.4) * 200);
      return Math.min(100, (waterScore * 0.4 + gentleHeatScore * 0.3 + entropyScore * 0.3));
    }
    case "fast": {
      // Fast wants short duration, high kinetic power, high velocity
      const speedScore = calculateSpeedFactor(input.duration);
      const powerScore = Math.min(100, (input.kineticPower ?? 0.5) * 120);
      return Math.min(100, (speedScore * 0.6 + powerScore * 0.4));
    }
    case "flavorful": {
      // Flavorful wants high Essence, balanced elements, good entropy
      const essenceScore = Math.min(100, (input.transformedESMS.Essence / 6) * 100);
      const entropyScore = Math.min(100, thermodynamics.entropy * 120);
      const earthScore = (elementalEffect.Earth || 0) * 80;
      return Math.min(100, (essenceScore * 0.4 + entropyScore * 0.3 + earthScore * 0.3));
    }
    case "stable": {
      return calculateStabilityResonance(input.monica);
    }
    default:
      return 70;
  }
}

function calculateThermoEfficiency(gregsEnergy: number, thermo: { heat: number; entropy: number; reactivity: number }): number {
  // Positive Greg's Energy = efficient transformation
  // Normalize around 0: -1 maps to ~20, 0 maps to ~60, +1 maps to ~100
  const energyScore = 60 + gregsEnergy * 40;
  // Penalize extreme entropy (system chaos)
  const entropyPenalty = thermo.entropy > 0.8 ? (thermo.entropy - 0.8) * 100 : 0;
  return Math.max(5, Math.min(100, energyScore - entropyPenalty));
}

function calculateAlchemicalBalance(esms: { Spirit: number; Essence: number; Matter: number; Substance: number }): number {
  const values = [esms.Spirit, esms.Essence, esms.Matter, esms.Substance];
  const mean = values.reduce((s, v) => s + v, 0) / 4;
  if (mean === 0) return 50;
  // Coefficient of variation — lower = more balanced
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / 4;
  const cv = Math.sqrt(variance) / mean;
  // CV of 0 = perfectly balanced (100), CV of 1+ = unbalanced (~30)
  return Math.max(20, Math.min(100, 100 - cv * 70));
}

function calculateSpeedFactor(duration?: { min: number; max: number }): number {
  if (!duration) return 50;
  const avgMinutes = (duration.min + duration.max) / 2;
  // Under 15 min = very fast (95), 30 min = fast (80), 60 min = moderate (60), 240+ = slow (30)
  if (avgMinutes <= 10) return 95;
  if (avgMinutes <= 30) return 80 + (30 - avgMinutes) / 20 * 15;
  if (avgMinutes <= 60) return 60 + (60 - avgMinutes) / 30 * 20;
  if (avgMinutes <= 240) return 30 + (240 - avgMinutes) / 180 * 30;
  return Math.max(10, 30 - (avgMinutes - 240) / 1000 * 20);
}

// ========== WEIGHT SYSTEM ==========

interface Weights {
  stability: number;
  intent: number;
  thermo: number;
  balance: number;
  speed: number;
}

function getWeights(
  userIntent: UserIntent,
  stressContext: AstrologicalStressContext,
  focusMode: FocusMode,
): Weights {
  // Base weights (sum to ~1.0)
  let weights: Weights = {
    stability: 0.25,
    intent: 0.20,
    thermo: 0.25,
    balance: 0.20,
    speed: 0.10,
  };

  // Focus mode overrides
  switch (focusMode) {
    case "quickest":
      weights = { stability: 0.10, intent: 0.15, thermo: 0.15, balance: 0.10, speed: 0.50 };
      break;
    case "stability":
      weights = { stability: 0.45, intent: 0.10, thermo: 0.20, balance: 0.15, speed: 0.10 };
      break;
    case "flavorful":
      weights = { stability: 0.10, intent: 0.35, thermo: 0.25, balance: 0.20, speed: 0.10 };
      break;
    // "harmony" uses default balanced weights
  }

  // Dynamic weighting: high-stress astrological window boosts stability
  if (stressContext.highStress) {
    const stabilityBoost = 0.15;
    weights.stability += stabilityBoost;
    // Redistribute from other dimensions proportionally
    const others = ["intent", "thermo", "balance", "speed"] as const;
    const totalOther = others.reduce((s, k) => s + weights[k], 0);
    for (const key of others) {
      weights[key] -= stabilityBoost * (weights[key] / totalOther);
    }
  }

  // User intent "crispy" or "fast" doubles intent weight
  if (userIntent === "crispy" || userIntent === "fast") {
    const boost = weights.intent * 0.5;
    weights.intent += boost;
    weights.balance -= boost * 0.5;
    weights.stability -= boost * 0.5;
  }

  return weights;
}

// ========== LABELS ==========

function getHarmonyLabel(index: number): string {
  if (index >= 90) return "Perfect Resonance";
  if (index >= 75) return "Strong Harmony";
  if (index >= 60) return "Good Alignment";
  if (index >= 45) return "Moderate";
  if (index >= 30) return "Weak Alignment";
  return "Dissonant";
}

// ========== FOCUS-MODE SORTING ==========

/**
 * Get the sort comparator for a given FocusMode.
 * Used by the UI component to sort methods by focus.
 */
export function getFocusSortKey(focusMode: FocusMode): string {
  switch (focusMode) {
    case "harmony": return "harmonyIndex";
    case "quickest": return "speedFactor";
    case "stability": return "stabilityResonance";
    case "flavorful": return "intentAlignment";
  }
}
