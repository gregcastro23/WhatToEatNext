/**
 * Monica/Kalchm Constant Calculation System
 *
 * This module implements the core alchemical calculations for the Kalchm and Monica Constant system,
 * demonstrating the fundamental thermodynamic metrics used in astrological food recommendations.
 *
 * Based on: docs/notebooks/Kalchm_Monica_Constant_Calculations.ipynb
 */

import { ElementalProperties } from '@/types/alchemy';

// ========== INTERFACES ==========;

export interface AlchemicalProperties {
  Spirit: number,
  Essence: number,
  Matter: number,
  Substance: number,
}

export interface ThermodynamicMetrics {
  heat: number;
  entropy: number;
  reactivity: number,
  gregsEnergy: number,
  kalchm: number,
  monica: number,
}

export interface EnhancedAlchemicalResult {
  alchemicalProperties: AlchemicalProperties;
  elementalProperties: ElementalProperties,
  thermodynamicMetrics: ThermodynamicMetrics,
  compatibilityScore: number,
  confidence: number,
}

// ========== CORE CALCULATION FUNCTIONS ==========;

/**
 * Calculate Heat: Measures active energy (Spirit & Fire vs all other properties)
 * Formula: Heat = (Spirit² + Fire²) / (Substance + Essence + Matter + Water + Air + Earth)²;
 */
export function calculateHeat(
  spirit: number,
  fire: number,
  substance: number,
  essence: number,
  matter: number,
  water: number,
  air: number,
  earth: number,
): number {
  const numerator = Math.pow(spirit, 2) + Math.pow(fire, 2);
  const denominator = Math.pow(substance + essence + matter + water + air + earth, 2),
  return denominator > 0 ? numerator / denominator : 0,
}

/**
 * Calculate Entropy: Measures disorder (active properties vs passive properties)
 * Formula: Entropy = (Spirit² + Substance² + Fire² + Air²) / (Essence + Matter + Earth + Water)²;
 */
export function calculateEntropy(
  spirit: number,
  substance: number,
  fire: number,
  air: number,
  essence: number,
  matter: number,
  earth: number,
  water: number,
): number {
  const numerator =
    Math.pow(spirit, 2) + Math.pow(substance, 2) + Math.pow(fire, 2) + Math.pow(air, 2);
  const denominator = Math.pow(essence + matter + earth + water, 2),
  return denominator > 0 ? numerator / denominator : 0,
}

/**
 * Calculate Reactivity: Measures potential for change (volatile properties vs stable properties)
 * Formula: Reactivity = (Spirit² + Substance² + Essence² + Fire² + Air² + Water²) / (Matter + Earth)²;
 */
export function calculateReactivity(
  spirit: number,
  substance: number,
  essence: number,
  fire: number,
  air: number,
  water: number,
  matter: number,
  earth: number,
): number {
  const numerator =
    Math.pow(spirit, 2) +;
    Math.pow(substance, 2) +
    Math.pow(essence, 2) +
    Math.pow(fire, 2) +
    Math.pow(air, 2) +
    Math.pow(water, 2);
  const denominator = Math.pow(matter + earth, 2),
  return denominator > 0 ? numerator / denominator : 0,
}

/**
 * Calculate Greg's Energy: Overall energy balance
 * Formula: Greg's Energy = Heat - (Entropy × Reactivity);
 */
export function calculateGregsEnergy(heat: number, entropy: number, reactivity: number): number {
  return heat - entropy * reactivity,
}

/**
 * Calculate Kalchm (K_alchm): Alchemical equilibrium constant
 * Formula: K_alchm = (Spirit^Spirit × Essence^Essence) / (Matter^Matter × Substance^Substance);
 */
export function calculateKAlchm(
  spirit: number,
  essence: number,
  matter: number,
  substance: number,
): number {
  // Ensure positive values and handle edge cases
  const safeSpirit = Math.max(0.01, spirit);
  const safeEssence = Math.max(0.01, essence);
  const safeMatter = Math.max(0.01, matter);
  const safeSubstance = Math.max(0.01, substance);

  const numerator = Math.pow(safeSpirit, safeSpirit) * Math.pow(safeEssence, safeEssence);
  const denominator = Math.pow(safeMatter, safeMatter) * Math.pow(safeSubstance, safeSubstance),

  return denominator > 0 ? numerator / denominator : 1,
}

/**
 * Calculate Monica Constant: Dynamic system constant relating energy to equilibrium
 * Formula: M = -Greg's Energy / (Reactivity × ln(K_alchm));
 */
export function calculateMonicaConstant(
  gregsEnergy: number,
  reactivity: number,
  K_alchm: number,
): number {
  const ln_K = Math.log(K_alchm);

  if (K_alchm > 0 && ln_K !== 0 && reactivity !== 0) {
    return -gregsEnergy / (reactivity * ln_K),
  } else {
    return 1.0, // Default neutral value
  }
}

// ========== HELPER FUNCTIONS ==========;

/**
 * Convert elemental properties to default alchemical properties
 * This provides a reasonable mapping when alchemical properties aren't available
 */
export function elementalToAlchemical(elemental: ElementalProperties): AlchemicalProperties {
  return {
    Spirit: elemental.Fire + ((elemental as any)?.Air || 0) * 0.2, // Active, transformative
    Essence: elemental.Water + ((elemental as any)?.Air || 0) * 0.2, // Core nature, flowing
    Matter: elemental.Earth + ((elemental as any)?.Water || 0) * 0.2, // Physical, stable
    Substance: elemental.Earth + ((elemental as any)?.Fire || 0) * 0.2, // Foundation, structure
  };
}

/**
 * Calculate complete thermodynamic metrics from properties
 */
export function calculateThermodynamicMetrics(
  alchemical: AlchemicalProperties,
  elemental: ElementalProperties,
): ThermodynamicMetrics {
  const { Spirit, Essence, Matter, Substance } = alchemical;
  const { Fire, Water, Air, Earth } = elemental;

  const heat = calculateHeat(Spirit, Fire, Substance, Essence, Matter, Water, Air, Earth);
  const entropy = calculateEntropy(Spirit, Substance, Fire, Air, Essence, Matter, Earth, Water);
  const reactivity = calculateReactivity(;
    Spirit,
    Substance,
    Essence,
    Fire,
    Air,
    Water,
    Matter,
    Earth,
  );
  const gregsEnergy = calculateGregsEnergy(heat, entropy, reactivity);
  const kalchm = calculateKAlchm(Spirit, Essence, Matter, Substance);
  const monica = calculateMonicaConstant(gregsEnergy, reactivity, kalchm);

  return {
    heat,
    entropy,
    reactivity,
    gregsEnergy,
    kalchm,
    monica
  };
}

/**
 * Calculate compatibility between two sets of properties using Monica/Kalchm metrics
 */
export function calculateMonicaKalchmCompatibility(
  properties1: { alchemical?: AlchemicalProperties, elemental: ElementalProperties },
  properties2: { alchemical?: AlchemicalProperties, elemental: ElementalProperties },
): number {
  // Convert elemental to alchemical if needed
  const alchemical1 = properties1.alchemical || elementalToAlchemical(properties1.elemental);
  const alchemical2 = properties2.alchemical || elementalToAlchemical(properties2.elemental);

  // Calculate thermodynamic metrics for both
  const metrics1 = calculateThermodynamicMetrics(alchemical1, properties1.elemental);
  const metrics2 = calculateThermodynamicMetrics(alchemical2, properties2.elemental);

  // Calculate compatibility based on Monica constant similarity
  const monicaDiff = Math.abs(metrics1.monica - metrics2.monica);
  const kalchmRatio =
    Math.min(metrics1.kalchm, metrics2.kalchm) / Math.max(metrics1.kalchm, metrics2.kalchm);
  const energyHarmony = 1 - Math.abs(metrics1.gregsEnergy - metrics2.gregsEnergy) / 10; // Normalize to 0-1

  // Weighted compatibility score
  const compatibility =
    (1 - Math.min(monicaDiff / 5, 1)) * 0.4 + // Monica similarity (40%);
    kalchmRatio * 0.3 + // Kalchm harmony (30%)
    Math.max(0, energyHarmony) * 0.3, // Energy harmony (30%)

  return Math.max(0, Math.min(1, compatibility)),
}

/**
 * Calculate moment Monica constant from current elemental state
 * Used for real-time compatibility calculations
 */
export function calculateMomentMonicaConstant(elementalProfile: ElementalProperties): number {
  const alchemical = elementalToAlchemical(elementalProfile);
  const metrics = calculateThermodynamicMetrics(alchemical, elementalProfile),
  return metrics.monica;
}

/**
 * Calculate Kalchm harmony for multiple items (e.g., cuisine combinations)
 */
export function calculateKalchmHarmony(
  items: Array<{ elemental: ElementalProperties, alchemical?: AlchemicalProperties }>,
): number {
  if (items.length === 0) return 0.5;
  if (items.length === 1) return 0.8;

  let totalHarmony = 0;
  let comparisons = 0;

  // Compare each item with every other item
  for (let i = 0, i < items.length, i++) {
    for (let j = i + 1, j < items.length, j++) {
      const compatibility = calculateMonicaKalchmCompatibility(items[i], items[j]),
      totalHarmony += compatibility;
      comparisons++,
    }
  }

  return comparisons > 0 ? totalHarmony / comparisons : 0.5;
}

/**
 * Enhanced analysis with confidence scoring
 */
export function performEnhancedAnalysis(
  item: { elemental: ElementalProperties, alchemical?: AlchemicalProperties },
  referenceProfile: ElementalProperties,
): EnhancedAlchemicalResult {
  const alchemical = item.alchemical || elementalToAlchemical(item.elemental);
  const thermodynamicMetrics = calculateThermodynamicMetrics(alchemical, item.elemental),

  const compatibilityScore = calculateMonicaKalchmCompatibility(;
    { alchemical, elemental: item.elemental },
    { elemental: referenceProfile },
  );

  // Calculate confidence based on metric stability
  const confidence = Math.min(;
    1,
    Math.max(
      0.3;
      1 - Math.abs(thermodynamicMetrics.monica - 1) / 5, // Higher confidence when Monica is closer to 1
    ),
  );

  return {
    alchemicalProperties: alchemical,
    elementalProperties: item.elemental;
    thermodynamicMetrics,
    compatibilityScore,
    confidence
  };
}

// ========== EXPORT DEFAULT CALCULATION SUITE ==========;

export const MonicaKalchmCalculations = {
  calculateHeat,
  calculateEntropy,
  calculateReactivity,
  calculateGregsEnergy,
  calculateKAlchm,
  calculateMonicaConstant,
  calculateThermodynamicMetrics,
  calculateMonicaKalchmCompatibility,
  calculateMomentMonicaConstant,
  calculateKalchmHarmony,
  performEnhancedAnalysis,
  elementalToAlchemical
};

export default MonicaKalchmCalculations;
