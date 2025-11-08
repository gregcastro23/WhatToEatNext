/**
 * Monica/Kalchm Constant Calculation System
 *
 * This module implements the core alchemical calculations for the Kalchm and Monica Constant system,
 * demonstrating the fundamental thermodynamic metrics used in astrological food recommendations.
 *
 * Based, on: docs/notebooks/Kalchm_Monica_Constant_Calculations.ipynb
 */

import { calculateKinetics } from "@/calculations/kinetics";
import type { ElementalProperties } from "@/types/alchemy";
import type { KineticMetrics } from "@/types/kinetics";

// ========== INTERFACES ==========

export interface AlchemicalProperties {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

export interface ThermodynamicMetrics {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kalchm: number;
  monica: number;
}

export interface EnhancedAlchemicalResult {
  alchemicalProperties: AlchemicalProperties;
  elementalProperties: ElementalProperties;
  thermodynamicMetrics: ThermodynamicMetrics;
  compatibilityScore: number;
  confidence: number;
}

// ========== CORE CALCULATION FUNCTIONS ==========

/**
 * Calculate Heat: Measures active energy (Spirit & Fire vs all other properties)
 * Formula: Heat = (Spirit² + Fire²) / (Substance + Essence + Matter + Water + Air + Earth)²
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
  // Ensure positive values and handle edge cases
  const safeSpirit = Math.max(0.01, spirit);
  const safeEssence = Math.max(0.01, essence);
  const safeMatter = Math.max(0.01, matter);
  const safeSubstance = Math.max(0.01, substance);

  const numerator =
    Math.pow(safeSpirit, safeSpirit) * Math.pow(safeEssence, safeEssence);
  const denominator =
    Math.pow(safeMatter, safeMatter) * Math.pow(safeSubstance, safeSubstance);

  return denominator > 0 ? numerator / denominator : 1;
}

/**
 * Calculate Monica Constant: Dynamic system constant relating energy to equilibrium
 * Formula: M = -Greg's Energy / (Reactivity × ln(K_alchm))
 */
export function calculateMonicaConstant(
  gregsEnergy: number,
  reactivity: number,
  K_alchm: number,
): number {
  const ln_K = Math.log(K_alchm);
  if (K_alchm > 0 && ln_K !== 0 && reactivity !== 0) {
    return -gregsEnergy / (reactivity * ln_K);
  } else {
    return 1.0; // Default neutral value
  }
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
 * Legacy alias for backward compatibility
 * @deprecated Use elementalToAlchemicalApproximation() or better yet, calculateAlchemicalFromPlanets()
 */
export function elementalToAlchemical(
  elemental: ElementalProperties,
): AlchemicalProperties {
  console.warn(
    "elementalToAlchemical() is deprecated. Use calculateAlchemicalFromPlanets() for accurate ESMS values.",
  );
  return elementalToAlchemicalApproximation(elemental);
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

  const heat = calculateHeat(
    Spirit,
    Fire,
    Substance,
    Essence,
    Matter,
    Water,
    Air,
    Earth,
  );
  const entropy = calculateEntropy(
    Spirit,
    Substance,
    Fire,
    Air,
    Essence,
    Matter,
    Earth,
    Water,
  );
  const reactivity = calculateReactivity(
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
    monica,
  };
}

/**
 * Calculate compatibility between two sets of properties using Monica/Kalchm metrics
 *
 * ⚠️ WARNING: If alchemical properties are not provided, this function will use
 * an approximation. For accurate results, provide alchemical properties calculated
 * from planetary positions using calculateAlchemicalFromPlanets().
 */
export function calculateMonicaKalchmCompatibility(
  properties1: {
    alchemical?: AlchemicalProperties;
    elemental: ElementalProperties;
  },
  properties2: {
    alchemical?: AlchemicalProperties;
    elemental: ElementalProperties;
  },
): number {
  // Convert elemental to alchemical if needed (using approximation as fallback)
  const alchemical1 =
    properties1.alchemical ||
    elementalToAlchemicalApproximation(properties1.elemental);
  const alchemical2 =
    properties2.alchemical ||
    elementalToAlchemicalApproximation(properties2.elemental);
  // Calculate thermodynamic metrics for both
  const metrics1 = calculateThermodynamicMetrics(
    alchemical1,
    properties1.elemental,
  );
  const metrics2 = calculateThermodynamicMetrics(
    alchemical2,
    properties2.elemental,
  );

  // Calculate compatibility based on Monica constant similarity
  const monicaDiff = Math.abs(metrics1.monica - metrics2.monica);
  const kalchmRatio =
    Math.min(metrics1.kalchm, metrics2.kalchm) /
    Math.max(metrics1.kalchm, metrics2.kalchm);
  const energyHarmony =
    1 - Math.abs(metrics1.gregsEnergy - metrics2.gregsEnergy) / 10; // Normalize to 0-1

  // Weighted compatibility score
  const compatibility =
    (1 - Math.min(monicaDiff / 51)) * 0.4 + // Monica similarity (40%)
    kalchmRatio * 0.3 + // Kalchm harmony (30%)
    Math.max(0, energyHarmony) * 0.3; // Energy harmony (30%)
  return Math.max(0, Math.min(1, compatibility));
}

/**
 * Calculate moment Monica constant from current elemental state
 * Used for real-time compatibility calculations
 *
 * ⚠️ WARNING: This function uses an approximation to derive ESMS from elementals.
 * For accurate Monica constants, use planetary positions via calculateAlchemicalFromPlanets().
 *
 * @deprecated Prefer calculating Monica from planetary positions when available
 */
export function calculateMomentMonicaConstant(
  elementalProfile: ElementalProperties,
): number {
  const alchemical = elementalToAlchemicalApproximation(elementalProfile);
  const metrics = calculateThermodynamicMetrics(alchemical, elementalProfile);
  return metrics.monica;
}

/**
 * Calculate Kalchm harmony for multiple items (e.g., cuisine combinations)
 */
export function calculateKalchmHarmony(
  items: Array<{
    elemental: ElementalProperties;
    alchemical?: AlchemicalProperties;
  }>,
): number {
  if (items.length === 0) return 0.5;
  if (items.length === 1) return 0.8;
  let totalHarmony = 0;
  let comparisons = 0;

  // Compare each item with every other item
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const compatibility = calculateMonicaKalchmCompatibility(
        items[i],
        items[j],
      );
      totalHarmony += compatibility;
      comparisons++;
    }
  }

  return comparisons > 0 ? totalHarmony / comparisons : 0.5;
}

/**
 * Enhanced analysis with confidence scoring
 */
export function performEnhancedAnalysis(
  item: { elemental: ElementalProperties; alchemical?: AlchemicalProperties },
  referenceProfile: ElementalProperties,
): EnhancedAlchemicalResult {
  const alchemical = item.alchemical || elementalToAlchemical(item.elemental);
  const thermodynamicMetrics = calculateThermodynamicMetrics(
    alchemical,
    item.elemental,
  );

  const compatibilityScore = calculateMonicaKalchmCompatibility(
    { alchemical, elemental: item.elemental },
    { elemental: referenceProfile },
  );

  // Calculate confidence based on metric stability
  const confidence = Math.min(
    1,
    Math.max(
      0.3,
      1 - Math.abs(thermodynamicMetrics.monica - 1) / 5, // Higher confidence when Monica is closer to 1
    ),
  );

  return {
    alchemicalProperties: alchemical,
    elementalProperties: item.elemental,
    thermodynamicMetrics,
    compatibilityScore,
    confidence,
  };
}

// ========== EXPORT DEFAULT CALCULATION SUITE ==========

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
  elementalToAlchemical,
};

// ========== KINETICS-ENHANCED FUNCTIONS ==========

/**
 * Calculate Monica constant with B-field influence (electromagnetic kinetics)
 */
export function calculateMonicaWithBField(
  gregsEnergy: number,
  reactivity: number,
  K_alchm: number,
  kinetics: KineticMetrics,
): number {
  const baseMonica = calculateMonicaConstant(gregsEnergy, reactivity, K_alchm);

  // Apply B-field (Monica field) modulation
  const kineticsData = kinetics as any;
  const monicaField = kineticsData.monica || 1.0;
  const fieldInfluence = Math.pow(monicaField, 0.3); // Cube root for subtle influence

  // Modulate based on force classification
  let forceMultiplier = 1.0;
  if (kinetics.forceClassification === "accelerating") {
    forceMultiplier = 1.2; // Enhance accelerating systems
  } else if (kinetics.forceClassification === "decelerating") {
    forceMultiplier = 0.8; // Dampen decelerating systems
  }

  return baseMonica * fieldInfluence * forceMultiplier;
}

/**
 * Calculate Kalchm with kinetics enhancement
 */
export function calculateKalchmWithKinetics(
  alchemical: AlchemicalProperties,
  kinetics: KineticMetrics,
): number {
  const baseKalchm = calculateKAlchm(
    alchemical.Spirit,
    alchemical.Essence,
    alchemical.Matter,
    alchemical.Substance,
  );

  // Apply momentum boost to Kalchm calculation
  const momentumFactor = 1 + ((kinetics.momentum as number) || 0) * 0.1;

  // Apply aspect phase influence
  let aspectMultiplier = 1.0;
  switch (kinetics.aspectPhase) {
    case "conjunction" as any:
      aspectMultiplier = 1.3; // Maximum enhancement
      break;
    case "opposition" as any:
      aspectMultiplier = 1.1; // Moderate enhancement
      break;
    case "trine" as any:
      aspectMultiplier = 1.15; // Harmonic enhancement
      break;
    case "square" as any:
      aspectMultiplier = 0.9; // Mild reduction
      break;
  }

  return baseKalchm * momentumFactor * aspectMultiplier;
}

/**
 * Enhanced thermodynamic metrics with kinetics
 */
export function calculateThermodynamicMetricsWithKinetics(
  alchemical: AlchemicalProperties,
  elemental: ElementalProperties,
  planetaryPositions: { [planet: string]: string },
): ThermodynamicMetrics {
  const baseMetrics = calculateThermodynamicMetrics(alchemical, elemental);

  try {
    const kinetics = calculateKinetics(planetaryPositions as any);

    // Enhance metrics with kinetics
    const kineticsData = kinetics as any;
    const enhancedMetrics: ThermodynamicMetrics = {
      heat: baseMetrics.heat * (1 + kineticsData.velocityBoost * 0.1),
      entropy:
        baseMetrics.entropy * ((kinetics.aspectPhase as any) === "square" ? 1.2 : 0.9),
      reactivity: baseMetrics.reactivity * (kinetics.forceMagnitude / 5 + 0.8),
      gregsEnergy: baseMetrics.gregsEnergy,
      kalchm: calculateKalchmWithKinetics(alchemical, kinetics),
      monica: calculateMonicaWithBField(
        baseMetrics.gregsEnergy,
        baseMetrics.reactivity,
        baseMetrics.kalchm,
        kinetics,
      ),
    };

    return enhancedMetrics;
  } catch (error) {
    // Return base metrics if kinetics calculation fails
    return baseMetrics;
  }
}

/**
 * Calculate kinetics-influenced compatibility
 */
export function calculateKineticsCompatibility(
  properties1: {
    alchemical?: AlchemicalProperties;
    elemental: ElementalProperties;
  },
  properties2: {
    alchemical?: AlchemicalProperties;
    elemental: ElementalProperties;
  },
  planetaryPositions: { [planet: string]: string },
): number {
  const baseCompatibility = calculateMonicaKalchmCompatibility(
    properties1,
    properties2,
  );

  try {
    const kinetics = calculateKinetics(planetaryPositions as any);

    // Apply power conservation factor
    const powerFactor = Math.min(kinetics.power || 50, 100) / 100; // Normalize to 0-1

    // Apply thermal alignment bonus
    let thermalBonus = 0;
    if (kinetics.thermalDirection === "heating") {
      // Check if either has high fire content
      const fire1 = properties1.elemental.Fire || 0;
      const fire2 = properties2.elemental.Fire || 0;
      thermalBonus = Math.max(fire1, fire2) * 0.1;
    } else if (kinetics.thermalDirection === "cooling") {
      // Check if either has high water content
      const water1 = properties1.elemental.Water || 0;
      const water2 = properties2.elemental.Water || 0;
      thermalBonus = Math.max(water1, water2) * 0.1;
    }

    return Math.min(1.0, baseCompatibility + powerFactor * 0.2 + thermalBonus);
  } catch (error) {
    // Return base compatibility if kinetics fails
    return baseCompatibility;
  }
}

/**
 * Enhanced analysis with kinetics integration
 */
export function performEnhancedAnalysisWithKinetics(
  item: { elemental: ElementalProperties; alchemical?: AlchemicalProperties },
  referenceProfile: ElementalProperties,
  planetaryPositions: { [planet: string]: string },
): EnhancedAlchemicalResult {
  const baseResult = performEnhancedAnalysis(item, referenceProfile);

  try {
    const kinetics = calculateKinetics(planetaryPositions as any);

    // Enhance thermodynamic metrics with kinetics
    const enhancedMetrics = calculateThermodynamicMetricsWithKinetics(
      baseResult.alchemicalProperties,
      baseResult.elementalProperties,
      planetaryPositions,
    );

    // Enhance compatibility with kinetics
    const enhancedCompatibility = calculateKineticsCompatibility(
      {
        alchemical: baseResult.alchemicalProperties,
        elemental: baseResult.elementalProperties,
      },
      { elemental: referenceProfile },
      planetaryPositions,
    );

    // Increase confidence based on kinetics stability
    const kineticsConfidence =
      (kinetics.forceClassification as any) === "stable" ? 0.1 : 0;
    const enhancedConfidence = Math.min(
      1.0,
      baseResult.confidence + kineticsConfidence,
    );

    return {
      ...baseResult,
      thermodynamicMetrics: enhancedMetrics,
      compatibilityScore: enhancedCompatibility,
      confidence: enhancedConfidence,
    };
  } catch (error) {
    // Return base result if kinetics enhancement fails
    return baseResult;
  }
}

export default MonicaKalchmCalculations;
