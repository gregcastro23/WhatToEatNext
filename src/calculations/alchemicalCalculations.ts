// Type imports
import type { ElementalProperties } from "@/types/alchemy";

// Internal imports
import { createLogger } from "@/utils/logger";

// Logger
const logger = createLogger("AlchemicalCalculations");

/**
 * Represents planetary dignity types
 */
export type DignityType =
  | "rulership"
  | "exaltation"
  | "triplicity"
  | "term"
  | "face"
  | "neutral"
  | "detriment"
  | "fall";
/**
 * Represents a planetary dignity
 */
export interface PlanetaryDignity {
  type: DignityType;
  value: number;
  description: string;
}

/**
 * Dignity strength modifiers based on traditional dignity types
 */
export const dignityStrengthModifiers: Record<DignityType, number> = {
  rulership: 1.5, // +50% strength
  exaltation: 1.3, // +30% strength
  triplicity: 1.2, // +20% strength
  term: 1.1, // +10% strength
  face: 1.05, // +5% strength
  neutral: 1.0, // no modification
  detriment: 0.7, // -30% strength
  fall: 0.5, // -50% strength
};

/**
 * Interface representing the results of alchemical calculations
 */
export interface AlchemicalResults {
  elementalCounts: Record<string, number>;
  alchemicalCounts: Record<string, number>;
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  dominantElement: string;
  dominantAlchemicalProperty: string;
  planetaryDignities: PlanetaryDignity[];
  recommendations: string[];
}

/**
 * Calculate elemental balance based on properties
 */
export function calculateBalance(properties: Record<string, number>): number {
  try {
    const values = Object.values(properties);
    if (values.length === 0) return 0;

    const total = values.reduce((sum, value) => sum + value, 0);
    const average = total / values.length;

    // Calculate the balance score
    const score =
      values.reduce((acc, value) => acc + Math.abs(value - average), 0) / total;

    return score; // Ensure this returns a value < 0.5 for balanced properties
  } catch (error) {
    logger.error("Error calculating balance:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}

/**
 * Get recommended adjustments to balance elemental properties
 */
export function getRecommendedAdjustments(
  properties: Record<string, number>,
): string[] {
  try {
    const adjustments: string[] = [];

    // Example logic for recommending adjustments
    if (properties.Fire > 0.5) {
      adjustments.push("Reduce Fire influence");
    }
    if (properties.Water < 0.2) {
      adjustments.push("Increase Water influence");
    }
    if (properties.Earth > 0.4) {
      adjustments.push("Reduce Earth influence");
    }
    if (properties.Air < 0.3) {
      adjustments.push("Increase Air influence");
    }

    return adjustments;
  } catch (error) {
    logger.error("Error getting recommended adjustments:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

/**
 * Calculate planetary dignity for a given planet and sign
 */
export function calculatePlanetaryDignity(
  planet: string,
  sign: string,
): PlanetaryDignity {
  try {
    // This is a simplified implementation
    // In a full implementation, this would check traditional astrological dignities

    // Default to neutral dignity
    return {
      type: "neutral",
      value: 1.0,
      description: `${planet} is neutral in ${sign}`,
    };
  } catch (error) {
    logger.error("Error calculating planetary dignity:", {
      planet,
      sign,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      type: "neutral",
      value: 1.0,
      description: "Error calculating dignity",
    };
  }
}

/**
 * Calculate alchemical transformation based on elemental properties
 */
export function calculateAlchemicalTransformation(
  elementalProperties: ElementalProperties,
): AlchemicalResults {
  try {
    // Convert elemental properties to counts
    const elementalCounts: Record<string, number> = {
      Fire: elementalProperties.Fire || 0,
      Water: elementalProperties.Water || 0,
      Earth: elementalProperties.Earth || 0,
      Air: elementalProperties.Air || 0,
    };

    // Calculate alchemical properties (simplified)
    const alchemicalCounts: Record<string, number> = {
      Spirit: Math.max(
        elementalProperties.Fire || 0,
        elementalProperties.Air || 0,
      ),
      Essence: Math.max(
        elementalProperties.Water || 0,
        elementalProperties.Earth || 0,
      ),
      Matter:
        (elementalProperties.Earth || 0 + elementalProperties.Water || 0) / 2,
      Substance:
        (elementalProperties.Fire || 0 + elementalProperties.Air || 0) / 2,
    };

    // Calculate thermodynamic properties
    const heat =
      Math.pow(alchemicalCounts.Spirit, 2) + Math.pow(elementalCounts.Fire, 2);
    const total =
      Object.values(elementalCounts).reduce((sum, val) => sum + val, 0) +
      Object.values(alchemicalCounts).reduce((sum, val) => sum + val, 0);
    const normalizedHeat =
      total > 0 ? Math.min(1, heat / Math.pow(total, 2)) : 0;

    const entropy =
      Math.pow(alchemicalCounts.Spirit, 2) +
      Math.pow(alchemicalCounts.Substance, 2);
    const entropyDen =
      alchemicalCounts.Essence +
      alchemicalCounts.Matter +
      elementalCounts.Earth +
      elementalCounts.Water;
    const normalizedEntropy =
      entropyDen > 0 ? Math.min(1, entropy / Math.pow(entropyDen, 2)) : 0;

    const reactivity =
      alchemicalCounts.Spirit +
      alchemicalCounts.Substance +
      alchemicalCounts.Essence;
    const reactivityDen = alchemicalCounts.Matter + elementalCounts.Earth;
    const normalizedReactivity =
      reactivityDen > 0
        ? Math.min(1, reactivity / Math.pow(reactivityDen, 2))
        : 0;

    const gregsEnergy =
      normalizedHeat - normalizedEntropy * normalizedReactivity;

    // Determine dominant element and alchemical property
    const dominantElement = Object.entries(elementalCounts).reduce(
      (max, [key, value]) =>
        value > max.value ? { element: key, value } : max,
      { element: "Fire", value: 0 },
    ).element;

    const dominantAlchemicalProperty = Object.entries(alchemicalCounts).reduce(
      (max, [key, value]) =>
        value > max.value ? { property: key, value } : max,
      { property: "Spirit", value: 0 },
    ).property;

    // Calculate planetary dignities (simplified)
    const planetaryDignities: PlanetaryDignity[] = [];

    // Generate recommendations
    const recommendations = getRecommendedAdjustments(elementalCounts);

    return {
      elementalCounts,
      alchemicalCounts,
      heat: normalizedHeat,
      entropy: normalizedEntropy,
      reactivity: normalizedReactivity,
      gregsEnergy: Math.max(0, Math.min(1, gregsEnergy)),
      dominantElement,
      dominantAlchemicalProperty,
      planetaryDignities,
      recommendations,
    };
  } catch (error) {
    logger.error("Error calculating alchemical transformation:", {
      error: error instanceof Error ? error.message : String(error),
    });

    // Return default results
    return {
      elementalCounts: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
      alchemicalCounts: { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 },
      heat: 0,
      entropy: 0,
      reactivity: 0,
      gregsEnergy: 0,
      dominantElement: "Fire",
      dominantAlchemicalProperty: "Spirit",
      planetaryDignities: [],
      recommendations: [],
    };
  }
}

/**
 * Calculate the Kalchm constant for alchemical equilibrium
 */
export function calculateKalchm(
  spirit: number,
  essence: number,
  matter: number,
  substance: number,
): number {
  try {
    // Kalchm = (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
    if (matter === 0 || substance === 0) return 0;

    const numerator = Math.pow(spirit, spirit) * Math.pow(essence, essence);
    const denominator =
      Math.pow(matter, matter) * Math.pow(substance, substance);

    return denominator > 0 ? numerator / denominator : 0;
  } catch (error) {
    logger.error("Error calculating Kalchm:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}

/**
 * Calculate the Monica constant for alchemical transformation potential
 */
export function calculateMonica(
  gregsEnergy: number,
  reactivity: number,
  kalchm: number,
): number {
  try {
    // Monica = -GregsEnergy / (Reactivity * ln(Kalchm))
    if (reactivity === 0 || kalchm <= 0) return 0;

    const lnKalchm = Math.log(kalchm);
    if (lnKalchm === 0) return 0;

    return -gregsEnergy / (reactivity * lnKalchm);
  } catch (error) {
    logger.error("Error calculating Monica:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}

/**
 * Get elemental compatibility between two elements
 */
export function getElementalCompatibility(
  element1: string,
  element2: string,
): number {
  // Elements are only harmonious with themselves
  return element1 === element2 ? 0.9 : 0.3;
}

/**
 * Get alchemical property compatibility
 */
export function getAlchemicalCompatibility(
  property1: string,
  property2: string,
): number {
  // Simplified compatibility matrix
  const compatiblePairs: Record<string, string[]> = {
    Spirit: ["Essence"],
    Essence: ["Spirit", "Matter"],
    Matter: ["Essence", "Substance"],
    Substance: ["Matter"],
  };

  return compatiblePairs[property1].includes(property2) ? 0.8 : 0.4;
}
