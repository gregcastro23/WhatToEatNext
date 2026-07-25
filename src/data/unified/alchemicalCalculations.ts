import type { ElementalProperties } from "@/types/alchemy";
import type { AlchemicalProperties } from "@/types/celestial";

// ===== ALCHEMICAL CALCULATION SYSTEM =====;
// Implements Kalchm (K_alchm) and Monica constant calculations
// Based on the core alchemical engine with enhanced metrics

// Alchemical properties interface
// Thermodynamic metrics interface
export interface ThermodynamicMetrics {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kalchm: number; // K_alchm - Baseline alchemical equilibrium,
  monica: number; // Monica constant - Dynamic scaling factor
}

// Enhanced ingredient interface with alchemical properties
export interface AlchemicalIngredient {
  name: string;
  category: string;
  subcategory?: string;

  // Elemental Properties (Self-Reinforcement Compliant)
  elementalProperties: ElementalProperties;

  // Alchemical Properties (Core Metrics)
  alchemicalProperties: AlchemicalProperties;

  // Kalchm Value (Intrinsic Alchemical Equilibrium)
  kalchm: number;

  // Additional properties
  flavorProfile?: { [key: string]: number };
  nutritionalData?: { [key: string]: number };
  seasonalAvailability?: string[];
  cookingMethods?: string[];
}

// ===== CANONICAL THERMODYNAMIC ENGINE (§17c) =====;
//
// This module is the single source of truth for the six thermodynamic
// quantities. Every live surface converges here — see
// docs/physics/SYNTHESIS_MODEL.md §14/§17c.
//
// TOTALITY CONTRACT: none of these functions ever returns NaN, null, or a
// non-finite value, for ANY input. Degenerate input resolves to a documented,
// meaningful constant:
//   heat / entropy / reactivity / gregsEnergy → 0   (true value: numerator is 0)
//   kalchm                                    → 1.0 (DEFAULT_KALCHM, equilibrium)
//   monica                                    → φ   (MONICA_EQUILIBRIUM, the
//                                                    harmonic ideal — kalchm=1 is
//                                                    perfect balance, not "dead")
/**
 * Minimum magnitude for REACTIVITY in the monica denominator, so a reactivity of
 * 0 cannot divide. That is now its only job — see `calculateMonica` below.
 *
 * ⚠️ It used to ALSO floor each ESMS axis inside `calculateKalchm`, described as
 * preventing "0^0 / division by zero". Both hazards were imaginary: `0 ** 0` is
 * already exactly 1 in JS (the true limit), and x^x bottoms out at 0.692201, so
 * the denominator can never be 0. The floor only cost accuracy — 0.01^0.01 =
 * 0.954993 instead of 1, a ~4.5% understatement on the 68.2% of the single-body
 * grid that has a zero axis. Removed; kalchm now clamps only negatives.
 *
 * This value is NOT derived. Unlike MONICA_LN_EPSILON there is no measured gap to
 * place it in — reactivity has no bimodal structure to exploit, it is simply a
 * divide-by-zero guard. Its only requirement is being small relative to real
 * reactivities, and it is: see the sensitivity note in the monica docstring.
 */
export const KALCHM_EPSILON = 0.01;

// ── The monica degenerate band, DERIVED ─────────────────────────────────────
//
// This was `MONICA_LN_EPSILON = 0.05`, described in this file as a "tunable
// knob" — an unmeasured constant on the hot path, which is what §11 forbids.
//
// Measured exhaustively over the single-body grid (11 planets x 12 signs x 30
// degrees x 2 sects = 7920 points, deterministic, so this is a census not a
// sample), |ln(kalchm)| is BIMODAL with one wide clean gap:
//
//     degenerate cluster ends   0.046051701859880986
//                        GAP    width 0.17273416629286448
//     healthy values begin      0.21878586815274545
//
// The band belongs at the midpoint, which is the same derivation
// `agentMonicaTwoBody` already uses for TWO_BODY_LN_EPSILON.
//
// ── Why change a value that classified correctly? ───────────────────────────
//
// 0.05 and the midpoint capture the IDENTICAL 660 of 7920 points, so this is a
// provably zero-behaviour-change edit. The reason to make it is MARGIN: 0.05 sat
// only 0.003948 above the degenerate ceiling, while the midpoint sits 0.086367
// from both edges — 22x more room. A constant 0.004 from a cliff is one grid
// tweak away from silently reclassifying agents; one at the centre is not.
//
// ⚠️ The endpoints are stated here rather than computed from the grid at import,
// because the grid needs `groundingVessel` from @/utils/agentMonica, which
// imports THIS module — enumerating it here would be a dependency cycle. The
// enumeration lives in `src/__tests__/monicaLnEpsilonDerivation.test.ts`, which
// re-derives both endpoints and FAILS if the grid moves. So the derivation is
// checked on every test run; it is not a comment asserting a stale measurement.

/** Largest |ln(kalchm)| in the degenerate cluster. [MEASURED 2026-07-25, n=7920] */
export const SINGLE_BODY_DEGENERATE_LN_CEILING = 0.046051701859880986;

/** Smallest |ln(kalchm)| among non-degenerate points. [MEASURED 2026-07-25, n=7920] */
export const SINGLE_BODY_HEALTHY_LN_FLOOR = 0.21878586815274545;

/** Half-width of the monica degenerate band. When |ln(kalchm)| < this, kalchm is
 *  treated as the equilibrium point (perfect balance) and monica returns
 *  MONICA_EQUILIBRIUM instead of diverging toward ±∞.
 *
 *  DERIVED as the midpoint of the measured gap above = 0.13241878500631321. */
export const MONICA_LN_EPSILON =
  (SINGLE_BODY_DEGENERATE_LN_CEILING + SINGLE_BODY_HEALTHY_LN_FLOOR) / 2;

/** The harmonic-ideal monica (golden ratio). Returned for a perfectly balanced
 *  (degenerate) alchemical state. See §17c. */
export const MONICA_EQUILIBRIUM = 1.618;

/** Floor applied to squared denominators in the thermodynamic ratios. */
const THERMO_DEN_FLOOR = 0.01;

/**
 * Calculate Kalchm (K_alchm) - Baseline alchemical equilibrium
 * Formula: K_alchm = (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
 *
 * TOTAL: always finite and > 0. An all-zero input yields exactly 1.0.
 *
 * ── Why there is no longer an epsilon floor ─────────────────────────────────
 *
 * Each axis used to be floored at KALCHM_EPSILON = 0.01, justified in a comment
 * as "so 0^0 and division-by-zero cannot occur". BOTH of those hazards are
 * imaginary in JavaScript, and the floor cost real accuracy:
 *
 *   1. `0 ** 0 === 1` in JS — and 1 is exactly lim(x->0) x^x. The language
 *      already returns the mathematically correct value for a zero axis. There
 *      was nothing to protect against.
 *   2. Division by zero is impossible: x^x has a global minimum of 0.692201 at
 *      x = 1/e, so it never reaches 0. The denominator
 *      (Matter^Matter * Substance^Substance) cannot be 0 for any real input.
 *
 * Meanwhile 0.01^0.01 = 0.954993, not 1 — so flooring a zero axis understated
 * its contribution by ~4.5%. Measured over the exhaustive single-body grid
 * (7920 points), the floor perturbed 4200 of them: median 2.21%, max 4.17%.
 * 68.2% of that grid has at least one axis exactly 0, so this was not an edge
 * case; it was the common case.
 *
 * ── What the guard IS for ───────────────────────────────────────────────────
 *
 * A NEGATIVE axis. `Math.pow(-0.5, -0.5)` is NaN — a negative base with a
 * fractional exponent has no real value. Dignity scores can be negative, so
 * rather than prove no construction ever yields a negative axis, clamp only
 * negatives. They land on 0, which then yields exactly 1 like any other zero.
 *
 * So: exact for zero, NaN-proof for negatives, no distortion anywhere.
 */
export function calculateKalchm(alchemicalProps: AlchemicalProperties): number {
  const { Spirit, Essence, Matter, Substance } = alchemicalProps;

  // Clamp NEGATIVES only — see the note above. Zero passes through untouched
  // because 0**0 is already exactly 1.
  const nonNeg = (x: number) => (x > 0 ? x : 0);
  const s = nonNeg(Spirit);
  const e = nonNeg(Essence);
  const m = nonNeg(Matter);
  const sub = nonNeg(Substance);

  const numerator = Math.pow(s, s) * Math.pow(e, e);
  const denominator = Math.pow(m, m) * Math.pow(sub, sub);

  const kalchm = numerator / denominator;
  return Number.isFinite(kalchm) && kalchm > 0 ? kalchm : 1.0;
}

/**
 * Calculate thermodynamic metrics including heat, entropy, reactivity, and Greg's Energy
 */
export function calculateThermodynamics(
  alchemicalProps: AlchemicalProperties,
  elementalProps: ElementalProperties,
): Omit<ThermodynamicMetrics, "kalchm" | "monica"> {
  const { Spirit, Essence, Matter, Substance } = alchemicalProps;
  const { Fire, Water, Air, Earth } = elementalProps;

  // Heat calculation
  const heatNum = Math.pow(Spirit, 2) + Math.pow(Fire, 2);
  const heatDen = Math.pow(
    Substance + Essence + Matter + Water + Air + Earth,
    2,
  );
  const heat = heatNum / Math.max(heatDen, THERMO_DEN_FLOOR);

  // Entropy calculation
  const entropyNum =
    Math.pow(Spirit, 2) +
    Math.pow(Substance, 2) +
    Math.pow(Fire, 2) +
    Math.pow(Air, 2);
  const entropyDen = Math.pow(Essence + Matter + Earth + Water, 2);
  const entropy = entropyNum / Math.max(entropyDen, THERMO_DEN_FLOOR);

  // Reactivity calculation
  const reactivityNum =
    Math.pow(Spirit, 2) +
    Math.pow(Substance, 2) +
    Math.pow(Essence, 2) +
    Math.pow(Fire, 2) +
    Math.pow(Air, 2) +
    Math.pow(Water, 2);
  const reactivityDen = Math.pow(Matter + Earth, 2);
  const reactivity = reactivityNum / Math.max(reactivityDen, THERMO_DEN_FLOOR);

  // Greg's Energy — never clamped; may be negative (a real, meaningful sign).
  const gregsEnergy = heat - entropy * reactivity;

  // Every value is finite by construction (floored denominators, finite
  // numerators). The guard is a belt-and-braces backstop for the totality
  // contract, not a reachable branch.
  return {
    heat: Number.isFinite(heat) ? heat : 0,
    entropy: Number.isFinite(entropy) ? entropy : 0,
    reactivity: Number.isFinite(reactivity) ? reactivity : 0,
    gregsEnergy: Number.isFinite(gregsEnergy) ? gregsEnergy : 0,
  };
}

/**
 * Calculate Monica constant (M) - Dynamic scaling factor
 * Formula: M = -Greg's Energy / (Reactivity * ln(Kalchm))
 *
 * TOTAL: always finite, never NaN/null (§17c). At the equilibrium point
 * (kalchm ≈ 1, where ln → 0 and the raw formula diverges) monica is the perfect-
 * balance case and returns MONICA_EQUILIBRIUM (φ). The MONICA_LN_EPSILON band
 * both removes the NaN and bounds the near-1 blowup; real charts (kalchm far
 * from 1) are unaffected.
 */
export function calculateMonica(
  gregsEnergy: number,
  reactivity: number,
  kalchm: number,
): number {
  if (!Number.isFinite(kalchm) || kalchm <= 0) return MONICA_EQUILIBRIUM;
  const lnKalchm = Math.log(kalchm);
  // Degenerate/equilibrium band: perfectly balanced state, monica is φ.
  if (Math.abs(lnKalchm) < MONICA_LN_EPSILON) return MONICA_EQUILIBRIUM;
  const safeReactivity =
    Math.abs(reactivity) < KALCHM_EPSILON
      ? Math.sign(reactivity || 1) * KALCHM_EPSILON
      : reactivity;
  const monica = -gregsEnergy / (safeReactivity * lnKalchm);
  return Number.isFinite(monica) ? monica : MONICA_EQUILIBRIUM;
}

/**
 * Complete alchemical analysis for an ingredient or cuisine
 */
export function performAlchemicalAnalysis(
  alchemicalProps: AlchemicalProperties,
  elementalProps: ElementalProperties,
): ThermodynamicMetrics {
  // Calculate Kalchm
  const kalchm = calculateKalchm(alchemicalProps);
  // Calculate thermodynamic metrics;
  const thermodynamics = calculateThermodynamics(
    alchemicalProps,
    elementalProps,
  );

  // Calculate Monica constant
  const monica = calculateMonica(
    thermodynamics.gregsEnergy,
    thermodynamics.reactivity,
    kalchm,
  );

  return {
    ...thermodynamics,
    kalchm,
    monica,
  };
}

// ===== INGREDIENT ENHANCEMENT FUNCTIONS =====;

/**
 * Derive alchemical properties from elemental properties
 * This is used when we only have elemental data and need to estimate alchemical properties
 */
export function deriveAlchemicalFromElemental(
  elementalProps: ElementalProperties,
): AlchemicalProperties {
  const { Fire, Water, Earth, Air } = elementalProps;

  // Mapping based on alchemical principles: // Spirit: Volatile, transformative (Fire + Air dominant)
  // Essence: Active principles (Water + Fire)
  // Matter: Physical structure (Earth dominant)
  // Substance: Stable components (Earth + Water)
  return {
    Spirit: Fire * 0.6 + Air * 0.4,
    Essence: Water * 0.5 + Fire * 0.3 + Air * 0.2,
    Matter: Earth * 0.7 + Water * 0.3,
    Substance: Earth * 0.5 + Water * 0.4 + Fire * 0.1,
  };
}

/**
 * Enhance an ingredient with alchemical properties and Kalchm calculation
 */
export function enhanceIngredientWithAlchemy(ingredient: {
  name: string;
  category: string;
  subcategory?: string;
  elementalProperties: ElementalProperties;
  [key: string]: unknown;
}): AlchemicalIngredient {
  // Derive alchemical properties from elemental properties
  const alchemicalProperties = deriveAlchemicalFromElemental(
    ingredient.elementalProperties,
  );

  // Calculate Kalchm
  const kalchm = calculateKalchm(alchemicalProperties);
  return {
    ...ingredient,
    alchemicalProperties,
    kalchm,
  };
}

/**
 * Calculate compatibility between two ingredients based on their Kalchm values
 * Uses self-reinforcement, principles: similar Kalchm = higher compatibility
 */
export function calculateKalchmCompatibility(
  kalchm1: number,
  kalchm2: number,
): number {
  // Calculate the ratio between the two Kalchm values
  const ratio = Math.min(kalchm1, kalchm2) / Math.max(kalchm1, kalchm2);

  // Convert ratio to compatibility score (0.7 minimum for good compatibility)
  return 0.7 + ratio * 0.3;
}

// ===== CUISINE ENHANCEMENT FUNCTIONS =====;

/**
 * Calculate aggregate Kalchm for a cuisine based on its typical ingredients
 */
export function calculateCuisineKalchm(
  ingredients: AlchemicalIngredient[],
  weights?: number[],
): number {
  if ((ingredients || []).length === 0) return 1.0;

  const effectiveWeights =
    weights || (ingredients || []).map(() => 1 / (ingredients || []).length);
  let weightedKalchmSum = 0;
  let totalWeight = 0;

  for (let i = 0; i < (ingredients || []).length; i++) {
    const weight = effectiveWeights[i] || 0;
    weightedKalchmSum += ingredients[i].kalchm * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? weightedKalchmSum / totalWeight : 1.0;
}

/**
 * Find ingredients with similar Kalchm values for substitution recommendations
 */
export function findKalchmSimilarIngredients(
  targetKalchm: number,
  ingredientPool: AlchemicalIngredient[],
  tolerance = 0.2,
): AlchemicalIngredient[] {
  return (ingredientPool || []).filter((ingredient) => {
    const compatibility = calculateKalchmCompatibility(
      targetKalchm,
      ingredient.kalchm,
    );
    return compatibility >= 0.9 - tolerance; // High compatibility threshold
  });
}

// ===== VALIDATION AND UTILITY FUNCTIONS =====;

/**
 * Validate alchemical properties to ensure they're within reasonable bounds
 */
export function validateAlchemicalProperties(
  props: AlchemicalProperties,
): boolean {
  const { Spirit, Essence, Matter, Substance } = props;

  // Check if all values are positive numbers
  if (Spirit <= 0 || Essence <= 0 || Matter <= 0 || Substance <= 0) {
    return false;
  }

  // Check if values are within reasonable bounds (0-2 scale)
  if (Spirit > 2 || Essence > 2 || Matter > 2 || Substance > 2) {
    return false;
  }

  return true;
}

/**
 * Normalize alchemical properties to ensure they sum to 1
 */
export function normalizeAlchemicalProperties(
  props: AlchemicalProperties,
): AlchemicalProperties {
  const { Spirit, Essence, Matter, Substance } = props;
  const sum = Spirit + Essence + Matter + Substance;

  if (sum === 0) {
    // Return derived default from balanced elementals if sum is 0
    return deriveAlchemicalFromElemental({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    });
  }

  return {
    Spirit: Spirit / sum,
    Essence: Essence / sum,
    Matter: Matter / sum,
    Substance: Substance / sum,
  };
}

/**
 * Get default alchemical properties for unknown ingredients.
 * Derived from balanced elemental properties (Fire=Water=Earth=Air=0.25)
 * using the standard elemental-to-alchemical mapping.
 */
export function getDefaultAlchemicalProperties(): AlchemicalProperties {
  return deriveAlchemicalFromElemental({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  });
}

// ===== EXPORT TYPES AND CONSTANTS =====;

export type { AlchemicalProperties };

// Default Kalchm value for unknown ingredients
export const DEFAULT_KALCHM = 1.0;

// Kalchm ranges for different ingredient categories
export const KALCHM_RANGES = {
  spices: { min: 0.5, max: 2.5 },
  herbs: { min: 0.7, max: 1.8 },
  vegetables: { min: 0.6, max: 1.4 },
  fruits: { min: 0.8, max: 1.6 },
  grains: { min: 0.9, max: 1.3 },
  proteins: { min: 1.0, max: 1.8 },
  dairy: { min: 0.8, max: 1.6 },
};
