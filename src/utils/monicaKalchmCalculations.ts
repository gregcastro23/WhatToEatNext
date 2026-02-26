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
  calculateMonicaOptimizationScore,
  buildMonicaOptimization,
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
  const momentumFactor =
    1 + ((kinetics.momentum as unknown as number) || 0) * 0.1;

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
        baseMetrics.entropy *
        ((kinetics.aspectPhase as any) === "square" ? 1.2 : 0.9),
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
      methodScores: [],
    };
  }

  // Import pillar mapping dynamically to avoid circular deps
  const { COOKING_METHOD_PILLAR_MAPPING, ALCHEMICAL_PILLARS } =
     
    require("@/constants/alchemicalPillars");

  const methodScores: MonicaScoreResult["methodScores"] = [];
  let totalWeight = 0;
  let weightedGregsEnergy = 0;
  let weightedKalchm = 0;
  let weightedMonica = 0;

  for (const method of cookingMethods) {
    const normalizedMethod = method.toLowerCase().replace(/\s+/g, "-");

    // Look up the pillar for this cooking method
    const pillarId =
      COOKING_METHOD_PILLAR_MAPPING[normalizedMethod] ||
      COOKING_METHOD_PILLAR_MAPPING[normalizedMethod.replace(/-/g, "_")];
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
    const heat = calculateHeat(
      transformedESMS.Spirit, elemental.Fire,
      transformedESMS.Substance, transformedESMS.Essence,
      transformedESMS.Matter, elemental.Water,
      elemental.Air, elemental.Earth,
    );
    const entropy = calculateEntropy(
      transformedESMS.Spirit, transformedESMS.Substance,
      elemental.Fire, elemental.Air,
      transformedESMS.Essence, transformedESMS.Matter,
      elemental.Earth, elemental.Water,
    );
    const reactivity = calculateReactivity(
      transformedESMS.Spirit, transformedESMS.Substance,
      transformedESMS.Essence, elemental.Fire,
      elemental.Air, elemental.Water,
      transformedESMS.Matter, elemental.Earth,
    );
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
    temperatureAdjustments,
    timingAdjustments,
    intensityModifications,
    planetaryTimingRecommendations,
  };
}

export default MonicaKalchmCalculations;
