import { ALCHEMICAL_PILLARS, COOKING_METHOD_PILLAR_MAPPING } from "@/constants/alchemicalPillars";
import {
  calculateKalchm as canonicalCalculateKalchm,
  calculateMonica,
} from "@/data/unified/alchemicalCalculations";
import type { ElementalProperties } from "@/types/alchemy";
import type { AlchemicalProperties } from "@/types/celestial";

/**
 * Monica/Kalchm Constant Calculation System
 *
 * This module implements the core alchemical calculations for the Kalchm and Monica Constant system,
 * demonstrating the fundamental thermodynamic metrics used in astrological food recommendations.
 *
 * Based, on: docs/notebooks/Kalchm_Monica_Constant_Calculations.ipynb
 */
// ========== INTERFACES ==========
export type { AlchemicalProperties };
export interface ThermodynamicMetrics {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kalchm: number;
  monica: number;
}
interface ThermodynamicInputs {
  spirit: number;
  substance: number;
  essence: number;
  matter: number;
  fire: number;
  water: number;
  air: number;
  earth: number;
}
// ========== CORE CALCULATION FUNCTIONS ==========
/**
 * Calculate Heat: Measures active energy (Spirit & Fire vs all other properties)
 * Formula: Heat = (Spirit² + Fire²) / (Substance + Essence + Matter + Water + Air + Earth)²
 */
export function calculateHeat(
  { spirit, fire, substance, essence, matter, water, air, earth }: ThermodynamicInputs,
): number {
  const numerator = Math.pow(spirit, 2) + Math.pow(fire, 2);
  const denominator = Math.pow(
    substance + essence + matter + water + air + earth,
    2,
  );
  return denominator > 0 ? numerator / denominator : 0;
}
/**
 * Calculate Entropy: Measures disorder (active properties vs passive properties)
 * Formula: Entropy = (Spirit² + Substance² + Fire² + Air²) / (Essence + Matter + Earth + Water)²
 */
export function calculateEntropy(
  { spirit, substance, fire, air, essence, matter, earth, water }: ThermodynamicInputs,
): number {
  const numerator =
    Math.pow(spirit, 2) +
    Math.pow(substance, 2) +
    Math.pow(fire, 2) +
    Math.pow(air, 2);
  const denominator = Math.pow(essence + matter + earth + water, 2);
  return denominator > 0 ? numerator / denominator : 0;
}
/**
 * Calculate Reactivity: Measures potential for change (volatile properties vs stable properties)
 * Formula: Reactivity = (Spirit² + Substance² + Essence² + Fire² + Air² + Water²) / (Matter + Earth)²
 */
export function calculateReactivity(
  { spirit, substance, essence, fire, air, water, matter, earth }: ThermodynamicInputs,
): number {
  const numerator =
    Math.pow(spirit, 2) +
    Math.pow(substance, 2) +
    Math.pow(essence, 2) +
    Math.pow(fire, 2) +
    Math.pow(air, 2) +
    Math.pow(water, 2);
  const denominator = Math.pow(matter + earth, 2);
  return denominator > 0 ? numerator / denominator : 0;
}
/**
 * Calculate Greg's Energy: Overall energy balance
 * Formula: Greg's Energy = Heat - (Entropy × Reactivity)
 */
export function calculateGregsEnergy(
  heat: number,
  entropy: number,
  reactivity: number,
): number {
  return heat - entropy * reactivity;
}
/**
 * Calculate Kalchm (K_alchm): Alchemical equilibrium constant
 * Formula: K_alchm = (Spirit^Spirit × Essence^Essence) / (Matter^Matter × Substance^Substance)
 */
export function calculateKAlchm(
  spirit: number,
  essence: number,
  matter: number,
  substance: number,
): number {
  // Delegates to THE canonical engine. This was the most-used stray copy — 11
  // files reach it, five of them React components — and it floored every axis
  // at 0.01, inflating kalchm by exactly 0.01^(-0.01) − 1 = +4.7129% per
  // imbalanced zeroed axis.
  //
  // It did NOT corrupt the degeneracy classification (unlike the 0.1 floor in
  // core/kalchmEngine.ts): the most |ln k| it could manufacture from a
  // degenerate chart is 2 × 0.04605170185988091 = 0.0921, still inside the
  // MONICA_LN_EPSILON band of 0.10939293407637272. So the damage was confined
  // to magnitude, and healthy charts were already bit-for-bit correct.
  return canonicalCalculateKalchm({
    Spirit: spirit,
    Essence: essence,
    Matter: matter,
    Substance: substance,
  });
}
/**
 * Calculate Monica Constant: Dynamic system constant relating energy to equilibrium
 * Formula: M = -Greg's Energy / (Reactivity × ln(K_alchm))
 *
 * §14d — DELEGATES to the canonical engine. The name and signature are kept so
 * no importer changes.
 *
 * It previously reimplemented the formula. Measured, that reimplementation agreed
 * with the canonical engine EXACTLY on healthy input (−2.705053 to the last
 * digit), so this delegation moves no healthy value. It differed only in failure
 * handling, in two ways that were both wrong:
 *
 *   1. It returned a hardcoded `1.0` for kalchm ≤ 0, ln(kalchm) === 0, or
 *      reactivity === 0 — its own comment called that a "Default neutral value".
 *      1.0 is neither neutral (monica is signed and unbounded) nor derived from
 *      anything.
 *   2. It had NO near-degenerate band, so at kalchm = 1.0001 — ordinary data, not
 *      an edge case — it returned −18750.94 where the canonical engine returns φ.
 *      Both values are finite, so nothing threw and no consumer could tell.
 *
 * Pinned before and after in
 * `src/__tests__/thermodynamicDegenerateCharacterisation.test.ts`.
 */
export function calculateMonicaConstant(
  gregsEnergy: number,
  reactivity: number,
  K_alchm: number,
): number {
  return calculateMonica(gregsEnergy, reactivity, K_alchm);
}
// ========== HELPER FUNCTIONS ==========
/**
 * Convert elemental properties to approximated alchemical properties
 *
 * ⚠️ WARNING: This is an APPROXIMATION and NOT the correct method!
 *
 * The ONLY correct way to calculate ESMS (Spirit, Essence, Matter, Substance)
 * is through planetary positions using calculateAlchemicalFromPlanets().
 *
 * This function should ONLY be used as a fallback when planetary data is
 * completely unavailable. It provides a rough approximation based on elemental
 * correlations, but lacks the precision and accuracy of the true alchemical method.
 *
 * @deprecated Prefer calculateAlchemicalFromPlanets() whenever possible
 * @param elemental - Elemental properties (Fire, Water, Earth, Air)
 * @returns Approximated alchemical properties (NOT accurate)
 */
export function elementalToAlchemicalApproximation(
  elemental: ElementalProperties,
): AlchemicalProperties {
  return {
    Spirit: elemental.Fire + ((elemental as any)?.Air || 0) * 0.2, // Rough approximation
    Essence: elemental.Water + ((elemental as any)?.Air || 0) * 0.2, // Rough approximation
    Matter: elemental.Earth + ((elemental as any)?.Water || 0) * 0.2, // Rough approximation
    Substance: elemental.Earth + ((elemental as any)?.Fire || 0) * 0.2, // Rough approximation
  };
}
/**
 * Calculate complete thermodynamic metrics from properties
 */
export function calculateThermodynamicMetrics(
  alchemical: AlchemicalProperties,
  elemental: ElementalProperties,
): ThermodynamicMetrics {
  // Defensive checks for undefined/null inputs
  if (!alchemical || !elemental) {
    return {
      heat: 0.08,
      entropy: 0.15,
      reactivity: 0.45,
      gregsEnergy: -0.02,
      kalchm: 2.5,
      monica: 1.0,
    };
  }
  // Defensive extraction with fallback values
  const Spirit =
    typeof alchemical.Spirit === "number" && !isNaN(alchemical.Spirit)
      ? alchemical.Spirit
      : 4;
  const Essence =
    typeof alchemical.Essence === "number" && !isNaN(alchemical.Essence)
      ? alchemical.Essence
      : 4;
  const Matter =
    typeof alchemical.Matter === "number" && !isNaN(alchemical.Matter)
      ? alchemical.Matter
      : 4;
  const Substance =
    typeof alchemical.Substance === "number" && !isNaN(alchemical.Substance)
      ? alchemical.Substance
      : 2;
  const Fire =
    typeof elemental.Fire === "number" && !isNaN(elemental.Fire)
      ? elemental.Fire
      : 0.25;
  const Water =
    typeof elemental.Water === "number" && !isNaN(elemental.Water)
      ? elemental.Water
      : 0.25;
  const Air =
    typeof elemental.Air === "number" && !isNaN(elemental.Air)
      ? elemental.Air
      : 0.25;
  const Earth =
    typeof elemental.Earth === "number" && !isNaN(elemental.Earth)
      ? elemental.Earth
      : 0.25;
  const thermodynamicInputs = {
    spirit: Spirit,
    substance: Substance,
    essence: Essence,
    matter: Matter,
    fire: Fire,
    water: Water,
    air: Air,
    earth: Earth,
  };
  const heat = calculateHeat(thermodynamicInputs);
  const entropy = calculateEntropy(thermodynamicInputs);
  const reactivity = calculateReactivity(thermodynamicInputs);
  const gregsEnergy = calculateGregsEnergy(heat, entropy, reactivity);
  const kalchm = calculateKAlchm(Spirit, Essence, Matter, Substance);
  const monica = calculateMonicaConstant(gregsEnergy, reactivity, kalchm);
  return {
    heat,
    entropy,
    reactivity,
    gregsEnergy,
    kalchm,
    monica,
  };
}
// ========== MONICA SCORING SYSTEM (0-100 Scale) ==========
/**
 * Result of the Monica scoring algorithm for a recipe
 */
export interface MonicaScoreResult {
  /** Overall Monica score on a 0-100 scale */
  score: number;
  /** Label classification of the score */
  label: string;
  /** Breakdown of the three weighted components */
  breakdown: {
    /** Thermodynamic Efficiency component (40% weight) */
    thermodynamicEfficiency: number;
    /** Alchemical Equilibrium component (30% weight) */
    alchemicalEquilibrium: number;
    /** Monica Constant Alignment component (30% weight) */
    monicaAlignment: number;
  };
  /** Sum of Monica constants for all methods (Circuit Theory Total Potential) */
  monicaSum: number;
  /** Per-method details */
  methodScores: Array<{
    method: string;
    gregsEnergy: number;
    kalchm: number;
    monica: number;
    reactivity: number;
    weight: number;
    contribution: number;
  }>;
}
/**
 * Calculate a weighted method importance factor based on Reactivity and Substance.
 *
 * High-Reactivity methods (e.g., Spherification, Flash Frying) get higher potential
 * weight but are stabilized by Essence. Low-Substance methods (e.g., Braising,
 * Steaming) provide a more stable, consistent base.
 */
function calculateMethodWeight(
  reactivity: number,
  substance: number,
  essence: number,
): number {
  // High-reactivity methods need high Essence to maintain stability
  const reactivityFactor = reactivity * (0.5 + 0.5 * Math.min(1, essence / Math.max(0.01, reactivity)));
  // High-substance methods provide stable base score
  const substanceFactor = substance * 0.8;
  // Combined weight: reactive methods can score higher but are tempered by stability
  return Math.max(0.1, reactivityFactor + substanceFactor);
}
/**
 * Normalize a raw Monica score to a 0-100 scale.
 *
 * The normalization uses a sigmoid-like function centered around the "ideal"
 * Monica balance point. A score of 100 represents "Alchemical Gold" (perfect M
 * balance) and anything below 30 indicates "Entropic" loss.
 *
 * @param gregsEnergy - Greg's Energy value (can be negative)
 * @param kalchm - Kalchm equilibrium constant
 * @param monica - Monica constant value
 * @returns Normalized score between 0 and 100
 */
function normalizeMonicaScore(
  gregsEnergy: number,
  kalchm: number,
  monica: number,
): { score: number; thermodynamicEfficiency: number; alchemicalEquilibrium: number; monicaAlignment: number } {
  // --- Component 1: Thermodynamic Efficiency (from Greg's Energy) ---
  // Greg's Energy is often small (near 0 or slightly negative).
  // Positive energy is favorable. Map to 0-100 using a sigmoid.
  // Centered at 0, with positive values mapping toward 100.
  const thermodynamicEfficiency = 100 / (1 + Math.exp(-10 * gregsEnergy));
  // --- Component 2: Alchemical Equilibrium (from Kalchm) ---
  // Kalchm near 1.0 represents perfect equilibrium.
  // Values far from 1.0 in either direction reduce the score.
  const lnK = Math.log(Math.max(0.001, kalchm));
  // Use a Gaussian-like function centered at ln(K)=0 (K=1)
  const alchemicalEquilibrium = 100 * Math.exp(-0.5 * Math.pow(lnK, 2));
  // --- Component 3: Monica Constant Alignment ---
  // Monica near 1.0 is the ideal "balanced" state.
  // Very high or very low values indicate instability or stagnation.
  const monicaDist = Math.abs(monica - 1.0);
  const monicaAlignment = 100 * Math.exp(-0.3 * Math.pow(monicaDist, 2));
  // Weighted combination: 40% Thermodynamic, 30% Equilibrium, 30% Monica
  const score =
    thermodynamicEfficiency * 0.4 +
    alchemicalEquilibrium * 0.3 +
    monicaAlignment * 0.3;
  return {
    score: Math.max(0, Math.min(100, score)),
    thermodynamicEfficiency,
    alchemicalEquilibrium,
    monicaAlignment,
  };
}
/**
 * Classify a Monica score into a human-readable label.
 */
function classifyMonicaScore(score: number): string {
  if (score >= 90) return "Alchemical Gold";
  if (score >= 75) return "Philosopher's Stone";
  if (score >= 60) return "Harmonious";
  if (score >= 45) return "Transitional";
  if (score >= 30) return "Volatile";
  return "Entropic";
}
/**
 * Calculate the Monica Optimization Score for a recipe based on its cooking methods.
 *
 * This is a weighted thermodynamic-alchemical alignment index on a 0-100 scale:
 * - Thermodynamic Efficiency (40%): From Greg's Energy profile
 * - Alchemical Equilibrium (30%): From the Kalchm (K_alchm) constant
 * - Monica Constant Alignment (30%): Relationship between energy and equilibrium
 *
 * The score accounts for method-specific pillar transformations applied to the
 * base ESMS (Spirit, Essence, Matter, Substance) values from planetary positions.
 *
 * @param cookingMethods - Array of cooking method names used in the recipe
 * @param baseAlchemical - Base alchemical properties (from planetary positions)
 * @param elemental - Elemental properties of the recipe
 * @returns MonicaScoreResult with score, label, breakdown, and per-method details
 */
export function calculateMonicaOptimizationScore(
  cookingMethods: string[],
  baseAlchemical: AlchemicalProperties,
  elemental: ElementalProperties,
): MonicaScoreResult {
  if (!cookingMethods || cookingMethods.length === 0) {
    return {
      score: 50,
      label: "Transitional",
      breakdown: {
        thermodynamicEfficiency: 50,
        alchemicalEquilibrium: 50,
        monicaAlignment: 50,
      },
      monicaSum: 0,
      methodScores: [],
    };
  }
  const methodScores: MonicaScoreResult["methodScores"] = [];
  let totalWeight = 0;
  let weightedGregsEnergy = 0;
  let weightedKalchm = 0;
  let weightedMonica = 0;
  let monicaSum = 0;
  for (const method of cookingMethods) {
    const normalizedMethod = method.toLowerCase().replace(/\s+/g, "-");
    // Look up the pillar for this cooking method
    // (indexed via a Record view since the mapping's inferred literal-key
    // type has no index signature for arbitrary method-name lookups)
    const pillarMapping: Record<string, number> = COOKING_METHOD_PILLAR_MAPPING;
    const pillarId =
      pillarMapping[normalizedMethod] ||
      pillarMapping[normalizedMethod.replace(/-/g, "_")];
    const pillar = pillarId
      ? ALCHEMICAL_PILLARS.find((p: { id: number }) => p.id === pillarId)
      : null;
    // Apply pillar transformation to get method-specific ESMS
    const transformedESMS = pillar
      ? {
          Spirit: baseAlchemical.Spirit + (pillar.effects.Spirit || 0),
          Essence: baseAlchemical.Essence + (pillar.effects.Essence || 0),
          Matter: baseAlchemical.Matter + (pillar.effects.Matter || 0),
          Substance: baseAlchemical.Substance + (pillar.effects.Substance || 0),
        }
      : { ...baseAlchemical };
    // Calculate thermodynamic metrics for this method
    const thermodynamicInputs = {
      spirit: transformedESMS.Spirit,
      substance: transformedESMS.Substance,
      essence: transformedESMS.Essence,
      matter: transformedESMS.Matter,
      fire: elemental.Fire,
      water: elemental.Water,
      air: elemental.Air,
      earth: elemental.Earth,
    };
    const heat = calculateHeat(thermodynamicInputs);
    const entropy = calculateEntropy(thermodynamicInputs);
    const reactivity = calculateReactivity(thermodynamicInputs);
    const gregsEnergy = calculateGregsEnergy(heat, entropy, reactivity);
    const kalchm = calculateKAlchm(
      transformedESMS.Spirit, transformedESMS.Essence,
      transformedESMS.Matter, transformedESMS.Substance,
    );
    const monica = calculateMonicaConstant(gregsEnergy, reactivity, kalchm);
    // Calculate this method's weight based on its reactive/stable character
    const weight = calculateMethodWeight(
      reactivity,
      transformedESMS.Substance,
      transformedESMS.Essence,
    );
    totalWeight += weight;
    weightedGregsEnergy += gregsEnergy * weight;
    weightedKalchm += kalchm * weight;
    weightedMonica += monica * weight;
    monicaSum += monica;
    methodScores.push({
      method: normalizedMethod,
      gregsEnergy,
      kalchm,
      monica,
      reactivity,
      weight,
      contribution: 0, // Will be filled below
    });
  }
  // Calculate weighted averages
  const avgGregsEnergy = totalWeight > 0 ? weightedGregsEnergy / totalWeight : 0;
  const avgKalchm = totalWeight > 0 ? weightedKalchm / totalWeight : 1;
  const avgMonica = totalWeight > 0 ? weightedMonica / totalWeight : 1;
  // Normalize to 0-100 scale
  const normalized = normalizeMonicaScore(avgGregsEnergy, avgKalchm, avgMonica);
  // Fill in per-method contribution percentages
  for (const ms of methodScores) {
    ms.contribution = totalWeight > 0 ? (ms.weight / totalWeight) * 100 : 0;
  }
  return {
    score: Math.round(normalized.score * 100) / 100,
    label: classifyMonicaScore(normalized.score),
    breakdown: {
      thermodynamicEfficiency: Math.round(normalized.thermodynamicEfficiency * 100) / 100,
      alchemicalEquilibrium: Math.round(normalized.alchemicalEquilibrium * 100) / 100,
      monicaAlignment: Math.round(normalized.monicaAlignment * 100) / 100,
    },
    monicaSum: Math.round(monicaSum * 1000) / 1000,
    methodScores,
  };
}
/**
 * Convenience function to populate the monicaOptimization field on a Recipe.
 *
 * @param cookingMethods - The recipe's cooking methods
 * @param baseAlchemical - Base ESMS from planetary positions
 * @param elemental - Recipe's elemental properties
 * @returns Object suitable for the Recipe.monicaOptimization field
 */
export function buildMonicaOptimization(
  cookingMethods: string[],
  baseAlchemical: AlchemicalProperties,
  elemental: ElementalProperties,
): {
  originalMonica: number | null;
  optimizedMonica: number;
  optimizationScore: number;
  monicaSum: number;
  temperatureAdjustments: number[];
  timingAdjustments: number[];
  intensityModifications: string[];
  planetaryTimingRecommendations: string[];
} {
  const result = calculateMonicaOptimizationScore(cookingMethods, baseAlchemical, elemental);
  // Generate optimization recommendations based on per-method analysis
  const temperatureAdjustments: number[] = [];
  const timingAdjustments: number[] = [];
  const intensityModifications: string[] = [];
  const planetaryTimingRecommendations: string[] = [];
  for (const ms of result.methodScores) {
    // Temperature adjustments based on reactivity
    if (ms.reactivity > 0.7) {
      temperatureAdjustments.push(15);
      intensityModifications.push(`${ms.method}: high-reactivity — reduce cook time`);
    } else if (ms.reactivity < 0.3) {
      temperatureAdjustments.push(-10);
      intensityModifications.push(`${ms.method}: low-reactivity — extend cook time`);
    } else {
      temperatureAdjustments.push(0);
    }
    // Timing adjustments based on Monica classification
    if (ms.monica > 5) {
      timingAdjustments.push(-5);
      planetaryTimingRecommendations.push(`${ms.method}: volatile Monica — cook during Sun/Mars hours`);
    } else if (ms.monica < 0.5) {
      timingAdjustments.push(10);
      planetaryTimingRecommendations.push(`${ms.method}: stable Monica — cook during Moon/Venus hours`);
    } else {
      timingAdjustments.push(0);
      planetaryTimingRecommendations.push(`${ms.method}: balanced — any planetary hour`);
    }
  }
  // Calculate average Monica across methods for originalMonica
  const avgMonica = result.methodScores.length > 0
    ? result.methodScores.reduce((sum, ms) => sum + ms.monica, 0) / result.methodScores.length
    : null;
  return {
    originalMonica: avgMonica,
    optimizedMonica: result.score,
    optimizationScore: result.score,
    monicaSum: result.monicaSum,
    temperatureAdjustments,
    timingAdjustments,
    intensityModifications,
    planetaryTimingRecommendations,
  };
}
