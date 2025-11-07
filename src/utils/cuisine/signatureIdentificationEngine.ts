/**
 * Signature Identification Engine
 *
 * Implements statistical signature identification for cuisines using z-score analysis.
 * Identifies distinctive properties that deviate significantly from global averages.
 *
 * Key Features:
 * - Z-score calculation against global baselines
 * - Signature strength classification (low/moderate/high/very_high)
 * - Confidence scoring for signature reliability
 * - Cultural significance mapping
 */

import type {
  AlchemicalProperties,
  CuisineComputedProperties,
  CuisineSignature,
  ElementalProperties,
  ThermodynamicProperties,
} from "@/types/hierarchy";

// ========== Z-SCORE CALCULATION ==========

/**
 * Calculate z-score for a property value
 *
 * @param value - Property value to analyze
 * @param globalMean - Global average for this property
 * @param globalStdDev - Global standard deviation for this property
 * @returns Z-score (number of standard deviations from mean)
 */
export function calculateZScore(
  value: number,
  globalMean: number,
  globalStdDev: number,
): number {
  if (globalStdDev === 0) {
    // If no variation in global data, any deviation is significant
    return value !== globalMean ? (value > globalMean ? 2.0 : -2.0) : 0;
  }

  return (value - globalMean) / globalStdDev;
}

/**
 * Classify signature strength based on z-score magnitude
 *
 * @param zScore - Absolute z-score value
 * @returns Strength classification
 */
export function classifySignatureStrength(
  zScore: number,
): "low" | "moderate" | "high" | "very_high" {
  const absZScore = Math.abs(zScore);

  if (absZScore >= 3.0) return "very_high";
  if (absZScore >= 2.0) return "high";
  if (absZScore >= 1.5) return "moderate";
  if (absZScore >= 1.0) return "low";

  return "low"; // Below 1.0σ is not considered a signature
}

/**
 * Calculate confidence level for a signature based on sample size and z-score
 *
 * @param zScore - Z-score magnitude
 * @param sampleSize - Number of recipes in cuisine
 * @param globalSampleSize - Number of cuisines in global baseline
 * @returns Confidence score (0-1)
 */
export function calculateSignatureConfidence(
  zScore: number,
  sampleSize: number,
  globalSampleSize: number,
): number {
  const absZScore = Math.abs(zScore);

  // Base confidence from z-score
  let confidence = Math.min(absZScore / 3.0, 1.0); // Max at 3.0σ

  // Adjust for sample sizes
  const sampleSizeFactor = Math.min(sampleSize / 10, 1.0); // Better with more recipes
  const globalSampleSizeFactor = Math.min(globalSampleSize / 5, 1.0); // Better with more cuisines

  confidence *= sampleSizeFactor * globalSampleSizeFactor;

  return Math.max(0, Math.min(1, confidence));
}

// ========== GLOBAL BASELINE MANAGEMENT ==========

/**
 * Global baseline data for signature calculation
 * This represents averages across all cuisines in the system
 */
export interface GlobalBaseline {
  elementals: ElementalProperties;
  alchemical?: AlchemicalProperties;
  thermodynamics?: Partial<ThermodynamicProperties>;

  // Standard deviations for z-score calculation
  elementalStdDevs: ElementalProperties;
  alchemicalStdDevs?: Partial<AlchemicalProperties>;
  thermodynamicStdDevs?: Partial<ThermodynamicProperties>;

  // Metadata
  cuisineCount: number; // Number of cuisines used to calculate baseline
  lastUpdated: Date;
}

/**
 * Default global baseline based on common culinary patterns
 * This serves as a fallback until real baseline data is calculated
 */
export const DEFAULT_GLOBAL_BASELINE: GlobalBaseline = {
  elementals: {
    Fire: 0.25, // Balanced across cuisines
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  },
  alchemical: {
    Spirit: 2.5, // Balanced alchemical profile
    Essence: 3.5,
    Matter: 3.0,
    Substance: 1.0,
  },
  thermodynamics: {
    heat: 0.15,
    entropy: 0.12,
    reactivity: 0.18,
    gregsEnergy: 0.08,
    kalchm: 1.2,
    monica: 0.7,
  },

  // Conservative standard deviations (will be refined with real data)
  elementalStdDevs: {
    Fire: 0.08,
    Water: 0.07,
    Earth: 0.06,
    Air: 0.05,
  },
  alchemicalStdDevs: {
    Spirit: 1.2,
    Essence: 1.5,
    Matter: 1.3,
    Substance: 0.8,
  },
  thermodynamicStdDevs: {
    heat: 0.05,
    entropy: 0.04,
    reactivity: 0.06,
    gregsEnergy: 0.03,
    kalchm: 0.4,
    monica: 0.2,
  },

  cuisineCount: 10, // Estimated baseline
  lastUpdated: new Date("2024-01-01"),
};

// ========== SIGNATURE IDENTIFICATION ==========

/**
 * Identify signatures for elemental properties
 *
 * @param cuisineElementals - Cuisine's elemental properties
 * @param globalBaseline - Global baseline data
 * @param threshold - Z-score threshold for signature identification (default: 1.5)
 * @returns Array of elemental signatures
 */
export function identifyElementalSignatures(
  cuisineElementals: ElementalProperties,
  globalBaseline: GlobalBaseline,
  threshold = 1.5,
): CuisineSignature[] {
  const signatures: CuisineSignature[] = [];
  const elements = Object.keys(cuisineElementals) as Array<
    keyof ElementalProperties
  >;

  elements.forEach((element) => {
    const value = cuisineElementals[element];
    const globalMean = globalBaseline.elementals[element];
    const globalStdDev = globalBaseline.elementalStdDevs[element];
    const zScore = calculateZScore(value as any, globalMean as any, globalStdDev as any);

    if (Math.abs(zScore) >= threshold) {
      const strength = classifySignatureStrength(zScore);

      signatures.push({
        property: element,
        zscore: zScore,
        strength,
        averageValue: value as any,
        globalAverage: globalMean,
        description: generateElementalSignatureDescription(
          element,
          zScore,
          strength,
        ),
      });
    }
  });

  return signatures;
}

/**
 * Identify signatures for alchemical properties
 *
 * @param cuisineAlchemical - Cuisine's alchemical properties
 * @param globalBaseline - Global baseline data
 * @param threshold - Z-score threshold for signature identification (default: 1.5)
 * @returns Array of alchemical signatures
 */
export function identifyAlchemicalSignatures(
  cuisineAlchemical: AlchemicalProperties,
  globalBaseline: GlobalBaseline,
  threshold = 1.5,
): CuisineSignature[] {
  if (!globalBaseline.alchemical || !globalBaseline.alchemicalStdDevs) {
    return [];
  }

  const signatures: CuisineSignature[] = [];
  const properties = Object.keys(cuisineAlchemical) as Array<
    keyof AlchemicalProperties
  >;

  properties.forEach((property) => {
    const value = cuisineAlchemical[property];
    const globalMean = globalBaseline.alchemical[property];
    const globalStdDev = globalBaseline.alchemicalStdDevs[property];

    if (globalMean === undefined || globalStdDev === undefined) {
      return; // Skip if no global data available
    }

    const zScore = calculateZScore(value as any, globalMean as any, globalStdDev as any);

    if (Math.abs(zScore) >= threshold) {
      const strength = classifySignatureStrength(zScore);

      signatures.push({
        property,
        zscore: zScore,
        strength,
        averageValue: value as any,
        globalAverage: globalMean,
        description: generateAlchemicalSignatureDescription(
          property,
          zScore,
          strength,
        ),
      });
    }
  });

  return signatures;
}

/**
 * Identify signatures for thermodynamic properties
 *
 * @param cuisineThermodynamics - Cuisine's thermodynamic properties
 * @param globalBaseline - Global baseline data
 * @param threshold - Z-score threshold for signature identification (default: 1.5)
 * @returns Array of thermodynamic signatures
 */
export function identifyThermodynamicSignatures(
  cuisineThermodynamics: ThermodynamicProperties,
  globalBaseline: GlobalBaseline,
  threshold = 1.5,
): CuisineSignature[] {
  if (!globalBaseline.thermodynamics || !globalBaseline.thermodynamicStdDevs) {
    return [];
  }

  const signatures: CuisineSignature[] = [];
  const properties = Object.keys(cuisineThermodynamics) as Array<
    keyof ThermodynamicProperties
  >;

  properties.forEach((property) => {
    const value = cuisineThermodynamics[property];
    const globalMean = globalBaseline.thermodynamics[property];
    const globalStdDev = globalBaseline.thermodynamicStdDevs[property];

    if (globalMean === undefined || globalStdDev === undefined) {
      return; // Skip if no global data available
    }

    const zScore = calculateZScore(value as any, globalMean as any, globalStdDev as any);

    if (Math.abs(zScore) >= threshold) {
      const strength = classifySignatureStrength(zScore);

      signatures.push({
        property,
        zscore: zScore,
        strength,
        averageValue: value as any,
        globalAverage: globalMean,
        description: generateThermodynamicSignatureDescription(
          property,
          zScore,
          strength,
        ),
      });
    }
  });

  return signatures;
}

// ========== SIGNATURE DESCRIPTION GENERATION ==========

/**
 * Generate human-readable description for elemental signatures
 */
function generateElementalSignatureDescription(
  element: keyof ElementalProperties,
  zScore: number,
  strength: string,
): string {
  const direction = zScore > 0 ? "high" : "low";
  const strengthText =
    strength === "very_high"
      ? "exceptionally"
      : strength === "high"
        ? "significantly"
        : strength === "moderate"
          ? "moderately"
          : "somewhat";

  const elementDescriptions = {
    Fire: "cooking techniques and spicy ingredients",
    Water: "sauces, moisture, and hydrating ingredients",
    Earth: "hearty, grounding, and substantial ingredients",
    Air: "light, aromatic, and fresh ingredients",
  };

  return `${strengthText} ${direction} emphasis on ${elementDescriptions[element]} compared to other cuisines`;
}

/**
 * Generate human-readable description for alchemical signatures
 */
function generateAlchemicalSignatureDescription(
  property: keyof AlchemicalProperties,
  zScore: number,
  strength: string,
): string {
  const direction = zScore > 0 ? "high" : "low";
  const strengthText =
    strength === "very_high"
      ? "exceptionally"
      : strength === "high"
        ? "significantly"
        : strength === "moderate"
          ? "moderately"
          : "somewhat";

  const propertyDescriptions = {
    Spirit: "innovative and transformative cooking approaches",
    Essence: "flavor depth and sensory richness",
    Matter: "substantial, hearty, and grounding dishes",
    Substance: "structured techniques and preserved ingredients",
  };

  return `${strengthText} ${direction} levels of ${propertyDescriptions[property]} in dish composition`;
}

/**
 * Generate human-readable description for thermodynamic signatures
 */
function generateThermodynamicSignatureDescription(
  property: keyof ThermodynamicProperties,
  zScore: number,
  strength: string,
): string {
  const direction = zScore > 0 ? "high" : "low";
  const strengthText =
    strength === "very_high"
      ? "exceptionally"
      : strength === "high"
        ? "significantly"
        : strength === "moderate"
          ? "moderately"
          : "somewhat";

  const propertyDescriptions = {
    heat: "thermal energy and cooking intensity",
    entropy: "ingredient complexity and dish variety",
    reactivity: "chemical transformation and flavor development",
    gregsEnergy: "energetic balance and dish harmony",
    kalchm: "alchemical transformation potential",
    monica: "thermodynamic stability and consistency",
  };

  return `${strengthText} ${direction} ${propertyDescriptions[property]} in cooking processes`;
}

// ========== MAIN SIGNATURE IDENTIFICATION FUNCTION ==========

/**
 * Identify all signatures for a cuisine using comprehensive analysis
 *
 * This is the main entry point for signature identification.
 * Combines elemental, alchemical, and thermodynamic signature analysis.
 *
 * @param cuisineProperties - Computed cuisine properties
 * @param globalBaseline - Global baseline for comparison
 * @param options - Identification options
 * @returns Complete array of cuisine signatures
 */
export function identifyCuisineSignatures(
  cuisineProperties: CuisineComputedProperties,
  globalBaseline: GlobalBaseline = DEFAULT_GLOBAL_BASELINE,
  options: {
    threshold?: number;
    includeConfidence?: boolean;
    sampleSize?: number;
  } = {},
): CuisineSignature[] {
  const {
    threshold = 1.5,
    includeConfidence = true,
    sampleSize = cuisineProperties.sampleSize,
  } = options;

  const allSignatures: CuisineSignature[] = [];

  // Identify elemental signatures
  const elementalSignatures = identifyElementalSignatures(
    cuisineProperties.averageElementals,
    globalBaseline,
    threshold,
  );
  allSignatures.push(...elementalSignatures);

  // Identify alchemical signatures
  if (cuisineProperties.averageAlchemical) {
    const alchemicalSignatures = identifyAlchemicalSignatures(
      cuisineProperties.averageAlchemical,
      globalBaseline,
      threshold,
    );
    allSignatures.push(...alchemicalSignatures);
  }

  // Identify thermodynamic signatures
  if (cuisineProperties.averageThermodynamics) {
    const thermodynamicSignatures = identifyThermodynamicSignatures(
      cuisineProperties.averageThermodynamics,
      globalBaseline,
      threshold,
    );
    allSignatures.push(...thermodynamicSignatures);
  }

  // Add confidence scores if requested
  if (includeConfidence) {
    allSignatures.forEach((signature) => {
      const confidence = calculateSignatureConfidence(
        signature.zscore,
        sampleSize,
        globalBaseline.cuisineCount,
      );
      (signature as any).confidence = confidence;
    });
  }

  // Sort by z-score magnitude (most distinctive first)
  return allSignatures.sort((a, b) => Math.abs(b.zscore) - Math.abs(a.zscore));
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Filter signatures by strength level
 *
 * @param signatures - Array of signatures to filter
 * @param minStrength - Minimum strength level to include
 * @returns Filtered signatures
 */
export function filterSignaturesByStrength(
  signatures: CuisineSignature[],
  minStrength: "low" | "moderate" | "high" | "very_high",
): CuisineSignature[] {
  const strengthOrder = { low: 0, moderate: 1, high: 2, very_high: 3 };
  const minOrder = strengthOrder[minStrength];

  return signatures.filter((sig) => strengthOrder[sig.strength] >= minOrder);
}

/**
 * Get signature summary statistics
 *
 * @param signatures - Array of signatures
 * @returns Summary statistics
 */
export function getSignatureSummary(signatures: CuisineSignature[]): {
  total: number;
  byStrength: Record<string, number>;
  byPropertyType: Record<string, number>;
  averageZScore: number;
} {
  const byStrength: Record<string, number> = {
    low: 0,
    moderate: 0,
    high: 0,
    very_high: 0,
  };
  const byPropertyType: Record<string, number> = {
    elemental: 0,
    alchemical: 0,
    thermodynamic: 0,
  };

  let totalZScore = 0;

  signatures.forEach((sig) => {
    byStrength[sig.strength]++;

    // Classify property type
    if (["Fire", "Water", "Earth", "Air"].includes(sig.property as any)) {
      byPropertyType.elemental++;
    } else if (
      ["Spirit", "Essence", "Matter", "Substance"].includes(sig.property as any)
    ) {
      byPropertyType.alchemical++;
    } else {
      byPropertyType.thermodynamic++;
    }

    totalZScore += Math.abs(sig.zscore);
  });

  return {
    total: signatures.length,
    byStrength,
    byPropertyType,
    averageZScore: signatures.length > 0 ? totalZScore / signatures.length : 0,
  };
}

// ========== EXPORTS ==========

export type { GlobalBaseline };
