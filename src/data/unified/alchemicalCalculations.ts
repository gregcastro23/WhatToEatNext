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
// The two floors below are the only tunable knobs.

/** Floor applied to each ESMS axis before exponentiation, so 0^0 / division by
 *  zero cannot occur. Load-bearing for sparse/single-body charts (§18). */
export const KALCHM_EPSILON = 0.01;

/** Half-width of the monica degenerate band. When |ln(kalchm)| < this, kalchm is
 *  treated as the equilibrium point (perfect balance) and monica returns
 *  MONICA_EQUILIBRIUM instead of diverging toward ±∞. */
export const MONICA_LN_EPSILON = 0.05;

/** The harmonic-ideal monica (golden ratio). Returned for a perfectly balanced
 *  (degenerate) alchemical state. See §17c. */
export const MONICA_EQUILIBRIUM = 1.618;

/** Floor applied to squared denominators in the thermodynamic ratios. */
const THERMO_DEN_FLOOR = 0.01;

/**
 * Calculate Kalchm (K_alchm) - Baseline alchemical equilibrium
 * Formula: K_alchm = (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
 *
 * TOTAL: always finite and > 0. Each axis is floored at KALCHM_EPSILON, so an
 * all-zero input yields exactly 1.0 (the equilibrium value).
 */
export function calculateKalchm(alchemicalProps: AlchemicalProperties): number {
  const { Spirit, Essence, Matter, Substance } = alchemicalProps;

  // Floor each axis so 0^0 and division-by-zero cannot occur.
  const safespirit = Math.max(Spirit, KALCHM_EPSILON);
  const safeessence = Math.max(Essence, KALCHM_EPSILON);
  const safematter = Math.max(Matter, KALCHM_EPSILON);
  const safesubstance = Math.max(Substance, KALCHM_EPSILON);

  const numerator =
    Math.pow(safespirit, safespirit) * Math.pow(safeessence, safeessence);
  const denominator =
    Math.pow(safematter, safematter) * Math.pow(safesubstance, safesubstance);

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
