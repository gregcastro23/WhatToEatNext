import type {
  ElementalCharacter,
  LunarPhaseWithSpaces,
  ZodiacSign,
} from "@/types/alchemy";
import type { AlchemicalProperty, CelestialPosition } from "@/types/celestial";
import { createLogger } from "@/utils/logger";
import { calculatePlanetaryBoost } from "../constants/planetaryFoodAssociations";
import { calculateAlchemicalProperties } from "./alchemicalCalculations";
import type { AlchemicalResults } from "./alchemicalCalculations";
import type { PlanetaryDignityDetails } from "../constants/planetaryFoodAssociations";

// Create a component-specific logger
const logger = createLogger("AlchemicalTransformation");

/**
 * Interface for items with elemental data (ingredients, methods, cuisines)
 */
export interface ElementalItem {
  id: string;
  name: string;
  elementalProperties: Record<ElementalCharacter, number>;
  [key: string]: unknown; // Allow other properties
}

/**
 * Interface for transformed items with both elemental and alchemical data
 */
export interface AlchemicalItem extends ElementalItem {
  alchemicalProperties: Record<AlchemicalProperty, number>;
  transformedElementalProperties: Record<ElementalCharacter, number>;
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  dominantElement: ElementalCharacter;
  dominantAlchemicalProperty: AlchemicalProperty;
  // New planetary influence properties
  planetaryBoost: number;
  dominantPlanets: string[];
  planetaryDignities: Record<string, PlanetaryDignityDetails>;
}

/**
 * Transform an item with elemental data using current planetary positions
 *
 * @param item The original item with elemental data
 * @param planetPositions Current planetary positions/strengths
 * @param isDaytime Whether it's day or night
 * @param currentZodiac Current zodiac sign (optional, defaults to 'aries')
 * @param lunarPhase Current lunar phase (optional)
 * @returns Item transformed with alchemical properties
 */
export const transformItemWithPlanetaryPositions = (
  item: ElementalItem,
  planetPositions: Record<string, CelestialPosition>,
  isDaytime: boolean,
  currentZodiac?: string | null,
  lunarPhase?: LunarPhaseWithSpaces | null,
): AlchemicalItem => {
  try {
    // Validate and sanitize input values
    const sanitizedItem = {
      ...item,
      elementalProperties: Object.fromEntries(
        Object.entries(item.elementalProperties).map(([key, value]) => [
          key,
          Number.isFinite(value) ? value : 0.1,
        ]),
      ) as Record<ElementalCharacter, number>,
    };

    // Calculate alchemical properties based on planetary positions
    const alchemicalResults = calculateAlchemicalProperties(
      planetPositions as unknown,
      isDaytime,
    );

    // Calculate planetary boost based on ingredient's characteristics
    const {
      boost: planetaryBoost,
      dominantPlanets,
      dignities: planetaryDignities,
    } = calculatePlanetaryBoost(
      sanitizedItem,
      planetPositions,
      currentZodiac || "aries" || "aries",
      lunarPhase || null,
    );

    // Transform elemental properties based on planetary influences
    // Apply the planetary boost to increase the effect
    const transformedElementalProperties = transformElementalProperties(
      sanitizedItem.elementalProperties,
      alchemicalResults,
      planetaryBoost,
      (currentZodiac || "aries" || "aries").toLowerCase() as ZodiacSign,
    );

    // Calculate dominant element and alchemical property
    const dominantElement = getDominantElement(transformedElementalProperties);
    const dominantAlchemicalProperty = getDominantAlchemicalProperty(
      alchemicalResults.alchemicalCounts,
    );

    // Apply safety checks for energy metrics
    const safeHeat = Number.isFinite(alchemicalResults.heat)
      ? Math.max(
          0.1,
          Math.min(1.0, alchemicalResults.heat * planetaryBoost * 2.5),
        )
      : 0.5;

    const safeEntropy = Number.isFinite(alchemicalResults.entropy)
      ? Math.max(0.1, Math.min(1.0, alchemicalResults.entropy * 1.5))
      : 0.5;

    const safeReactivity = Number.isFinite(alchemicalResults.reactivity)
      ? Math.max(0.1, Math.min(1.0, alchemicalResults.reactivity * 1.5))
      : 0.5;

    // Calculate gregsEnergy using the original formula: heat - (reactivity * entropy)
    // Then scale to the 0-1 range for UI friendliness
    const rawGregsEnergy = safeHeat - safeReactivity * safeEntropy;

    // Instead of a simple scaling, apply more varied calculations based on multiple factors
    // This will create more distinct recommendations with a wider range
    const baseScaledEnergy = (rawGregsEnergy + 1) / 2; // Convert from range (-1,1) to (0,1)

    // Apply element-specific influence for each dominant element
    let elementalModifier = 0;
    if (dominantElement === "Fire") {
      elementalModifier = 0.25 * (transformedElementalProperties.Fire - 0.25);
    } else if (dominantElement === "Water") {
      elementalModifier = 0.2 * (transformedElementalProperties.Water - 0.25);
    } else if (dominantElement === "Earth") {
      elementalModifier = 0.18 * (transformedElementalProperties.Earth - 0.25);
    } else if (dominantElement === "Air") {
      elementalModifier = 0.15 * (transformedElementalProperties.Air - 0.25);
    }

    // Apply alchemical property influence with increased impact
    let alchemicalModifier = 0;
    if (dominantAlchemicalProperty === "Spirit") {
      alchemicalModifier =
        0.22 * (alchemicalResults.alchemicalCounts.Spirit - 0.25);
    } else if (dominantAlchemicalProperty === "Essence") {
      alchemicalModifier =
        0.2 * (alchemicalResults.alchemicalCounts.Essence - 0.25);
    } else if (dominantAlchemicalProperty === "Matter") {
      alchemicalModifier =
        0.18 * (alchemicalResults.alchemicalCounts.Matter - 0.25);
    } else if (dominantAlchemicalProperty === "Substance") {
      alchemicalModifier =
        0.15 * (alchemicalResults.alchemicalCounts.Substance - 0.25);
    }

    // Apply zodiac influence if available with stronger effect
    let zodiacModifier = 0;
    const zodiacSign = (
      currentZodiac ||
      "aries" ||
      "aries"
    ).toLowerCase() as ZodiacSign;
    const zodiacElementMap: Record<ZodiacSign, ElementalCharacter> = {
      aries: "Fire",
      leo: "Fire",
      sagittarius: "Fire",
      taurus: "Earth",
      virgo: "Earth",
      capricorn: "Earth",
      gemini: "Air",
      libra: "Air",
      aquarius: "Air",
      cancer: "Water",
      scorpio: "Water",
      pisces: "Water",
    };
    const zodiacElement = zodiacElementMap[zodiacSign];
    if (zodiacElement && zodiacElement === dominantElement) {
      zodiacModifier = 0.25; // Increased bonus for matching zodiac element
    } else if (zodiacElement) {
      // Calculate compatibility based on elemental relationships with wider variance
      if (
        (zodiacElement === "Fire" && dominantElement === "Air") ||
        (zodiacElement === "Air" && dominantElement === "Fire")
      ) {
        zodiacModifier = 0.18; // Fire and Air are complementary
      } else if (
        (zodiacElement === "Earth" && dominantElement === "Water") ||
        (zodiacElement === "Water" && dominantElement === "Earth")
      ) {
        zodiacModifier = 0.18; // Earth and Water are complementary
      } else if (
        (zodiacElement === "Fire" && dominantElement === "Earth") ||
        (zodiacElement === "Earth" && dominantElement === "Fire")
      ) {
        zodiacModifier = 0.12; // Fire and Earth have moderate compatibility
      } else if (
        (zodiacElement === "Water" && dominantElement === "Air") ||
        (zodiacElement === "Air" && dominantElement === "Water")
      ) {
        zodiacModifier = 0.12; // Water and Air have moderate compatibility
      } else {
        zodiacModifier = 0.05; // Other combinations have lower compatibility
      }
    }

    // Calculate boost from planetary influence with more differentiation
    const planetaryModifier = Math.min(0.25, (planetaryBoost - 1.0) * 0.8);

    // Add randomized factor to create more variance (±7%)
    const randomVariance = Math.random() * 0.14 - 0.07;

    // Combine all influences for a more varied energy calculation
    const adjustedEnergy =
      baseScaledEnergy +
      elementalModifier +
      alchemicalModifier +
      zodiacModifier +
      planetaryModifier +
      randomVariance;

    // Ensure the final value is within valid range but allowing more variance (wider range)
    const safeGregsEnergy = Math.max(0.2, Math.min(0.98, adjustedEnergy));

    // Add more debug logging
    logger.debug(
      `[Ingredient: ${sanitizedItem.name}] Raw heat: ${alchemicalResults.heat}, Boosted heat: ${safeHeat}, Planetary boost: ${planetaryBoost}`,
    );

    return {
      ...sanitizedItem,
      alchemicalProperties: alchemicalResults.alchemicalCounts,
      transformedElementalProperties,
      heat: safeHeat,
      entropy: safeEntropy,
      reactivity: safeReactivity,
      gregsEnergy: safeGregsEnergy,
      dominantElement,
      dominantAlchemicalProperty,
      planetaryBoost,
      dominantPlanets,
      planetaryDignities,
    };
  } catch (error) {
    logger.error(`Error transforming item ${item.name}:`, error);
    // Return a safe fallback with original values preserved
    return {
      ...item,
      alchemicalProperties: {
        Spirit: 0.25,
        Essence: 0.25,
        Matter: 0.25,
        Substance: 0.25,
      },
      transformedElementalProperties: { ...item.elementalProperties },
      heat: 0.5,
      entropy: 0.5,
      reactivity: 0.5,
      gregsEnergy: 0.5,
      dominantElement: getDominantElement(item.elementalProperties),
      dominantAlchemicalProperty: "Essence",
      planetaryBoost: 1.0,
      dominantPlanets: [],
      planetaryDignities: {},
    };
  }
};

/**
 * Transform a collection of items using current planetary positions
 */
export const _transformItemsWithPlanetaryPositions = (
  items: ElementalItem[],
  planetPositions: Record<string, CelestialPosition>,
  isDaytime: boolean,
  currentZodiac?: string | null,
  lunarPhase?: LunarPhaseWithSpaces | null,
): AlchemicalItem[] => {
  try {
    return items.map((item) =>
      transformItemWithPlanetaryPositions(
        item,
        planetPositions,
        isDaytime,
        currentZodiac || "aries" || "aries",
        lunarPhase,
      ),
    );
  } catch (error) {
    logger.error("Error transforming multiple items: ", error);
    // Return the original items with minimal transformation if batch processing fails
    return items.map((item) => ({
      ...item,
      alchemicalProperties: {
        Spirit: 0.25,
        Essence: 0.25,
        Matter: 0.25,
        Substance: 0.25,
      },
      transformedElementalProperties: { ...item.elementalProperties },
      heat: 0.5,
      entropy: 0.5,
      reactivity: 0.5,
      gregsEnergy: 0.5,
      dominantElement: getDominantElement(item.elementalProperties),
      dominantAlchemicalProperty: "Essence" as AlchemicalProperty,
      planetaryBoost: 1.0,
      dominantPlanets: [],
      planetaryDignities: {},
    }));
  }
};

/**
 * Transform elemental properties using alchemical results and planetary boost
 * This applies the alchemical influence to the base elemental properties
 */
const transformElementalProperties = (
  originalProperties: Record<ElementalCharacter, number>,
  alchemicalResults: AlchemicalResults,
  planetaryBoost = 1.0,
  zodiacSign?: ZodiacSign,
): Record<ElementalCharacter, number> => {
  try {
    // Create a copy of the original properties
    const transformedProperties: Record<ElementalCharacter, number> = {
      ...originalProperties,
    };

    // Calculate base enhancement factor - stronger effect on dominant elements
    // Enhanced by planetary boost, but cap the enhancement factor to prevent excessive values
    const enhancementFactor = Math.min(0.15 * planetaryBoost, 0.5);

    // Get the dominant original element to preserve character
    const dominantElement = getDominantElement(originalProperties);

    // Apply transformations based on alchemical properties, with reduced enhancers
    // Spirit enhances Fire more if Fire is already present
    transformedProperties.Fire +=
      alchemicalResults.alchemicalCounts.Spirit *
      enhancementFactor *
      (originalProperties.Fire + 0.15) *
      0.8;

    // Essence enhances Water more if Water is already present
    transformedProperties.Water +=
      alchemicalResults.alchemicalCounts.Essence *
      enhancementFactor *
      (originalProperties.Water + 0.15) *
      0.7;

    // Matter enhances Earth more if Earth is already present
    transformedProperties.Earth +=
      alchemicalResults.alchemicalCounts.Matter *
      enhancementFactor *
      (originalProperties.Earth + 0.15) *
      0.7;

    // Substance enhances Air more if Air is already present
    transformedProperties.Air +=
      alchemicalResults.alchemicalCounts.Substance *
      enhancementFactor *
      (originalProperties.Air + 0.15) *
      0.7;

    // Apply cross-element influences with more dynamic calculations, with reduced strength
    applyElementalInfluences(
      transformedProperties,
      alchemicalResults.elementalCounts,
      originalProperties,
      Math.min(1.0, planetaryBoost * 0.7),
    );

    // Boost the dominant element slightly to preserve ingredient character, but cap the boost
    transformedProperties[dominantElement] *= Math.min(
      1.5,
      1.1 * planetaryBoost,
    );

    // Apply zodiac-specific boost if available
    if (zodiacSign) {
      applyZodiacBoost(transformedProperties, zodiacSign);
    }

    // Normalize the values so they sum to 1.0
    normalizeValues(transformedProperties);

    return transformedProperties;
  } catch (error) {
    logger.error("Error transforming elemental properties: ", error);
    // Return the original properties if there's an error
    return { ...originalProperties };
  }
};

/**
 * Apply zodiac-specific boosts to elemental properties
 */
const applyZodiacBoost = (
  transformedProperties: Record<ElementalCharacter, number>,
  zodiacSign: ZodiacSign,
): void => {
  try {
    const zodiacElementMap: Record<ZodiacSign, ElementalCharacter> = {
      aries: "Fire",
      taurus: "Earth",
      gemini: "Air",
      cancer: "Water",
      leo: "Fire",
      virgo: "Earth",
      libra: "Air",
      scorpio: "Water",
      sagittarius: "Fire",
      capricorn: "Earth",
      aquarius: "Air",
      pisces: "Water",
    };
    const zodiacElement = zodiacElementMap[zodiacSign];
    if (zodiacElement) {
      // Apply a small boost to the corresponding element
      transformedProperties[zodiacElement] *= 1.5;
    }
  } catch (error) {
    logger.error(`Error applying zodiac boost for ${zodiacSign}:`, error);
    // No modifications to transformedProperties needed in case of error
  }
};

/**
 * Apply cross-element influences based on elemental counts and boost
 */
const applyElementalInfluences = (
  transformedProperties: Record<ElementalCharacter, number>,
  elementalCounts: Record<ElementalCharacter, number>,
  originalProperties: Record<ElementalCharacter, number>,
  planetaryBoost = 1.0,
): void => {
  try {
    // Calculate influence factors based on elemental counts
    const fireInfluence = (elementalCounts.Fire || 0) * 0.2 * planetaryBoost;
    const waterInfluence = (elementalCounts.Water || 0) * 0.2 * planetaryBoost;
    const earthInfluence = (elementalCounts.Earth || 0) * 0.2 * planetaryBoost;
    const airInfluence = (elementalCounts.Air || 0) * 0.2 * planetaryBoost;

    // Fire influences - increases Earth, decreases Water
    transformedProperties.Earth +=
      fireInfluence * ((originalProperties.Earth || 0) * 0.2);
    transformedProperties.Water -=
      fireInfluence * ((originalProperties.Water || 0) * 0.2);

    // Water influences - increases Air, decreases Fire
    transformedProperties.Air +=
      waterInfluence * ((originalProperties.Air || 0) * 0.2);
    transformedProperties.Fire -=
      waterInfluence * ((originalProperties.Fire || 0) * 0.2);

    // Earth influences - increases Water, decreases Air
    transformedProperties.Water +=
      earthInfluence * ((originalProperties.Water || 0) * 0.2);
    transformedProperties.Air -=
      earthInfluence * ((originalProperties.Air || 0) * 0.2);

    // Air influences - increases Fire, decreases Earth
    transformedProperties.Fire +=
      airInfluence * ((originalProperties.Fire || 0) * 0.2);
    transformedProperties.Earth -=
      airInfluence * ((originalProperties.Earth || 0) * 0.2);

    // Ensure all values remain positive
    Object.keys(transformedProperties).forEach((key) => {
      transformedProperties[key as ElementalCharacter] = Math.max(
        0.05,
        transformedProperties[key as ElementalCharacter],
      );
    });
  } catch (error) {
    logger.error("Error applying elemental influences: ", error);
    // Leave transformedProperties unchanged in case of error
  }
};

/**
 * Calculate the dominant element from a set of elemental properties
 */
const getDominantElement = (
  transformedProperties: Record<ElementalCharacter, number>,
): ElementalCharacter => {
  try {
    let maxValue = -Infinity;
    let dominantElement: ElementalCharacter = "Fire"; // Default

    (
      Object.entries(transformedProperties) as Array<
        [ElementalCharacter, number]
      >
    ).forEach(([element, value]) => {
      // Pattern KK-8: Advanced calculation safety for comparison operations
      const numericValue = Number(value) || 0;
      const numericMaxValue = Number(maxValue) || -Infinity;
      if (numericValue > numericMaxValue) {
        maxValue = numericValue;
        dominantElement = element;
      }
    });

    return dominantElement;
  } catch (error) {
    logger.error("Error determining dominant element: ", error);
    return "Fire"; // Default fallback
  }
};

/**
 * Calculate the dominant alchemical property from alchemical counts
 */
const getDominantAlchemicalProperty = (
  alchemicalCounts: Record<AlchemicalProperty, number>,
): AlchemicalProperty => {
  try {
    let maxValue = -Infinity;
    let dominantProperty: AlchemicalProperty = "Spirit"; // Default

    (
      Object.entries(alchemicalCounts) as Array<[AlchemicalProperty, number]>
    ).forEach(([property, value]) => {
      // Pattern KK-8: Advanced calculation safety for comparison operations
      const numericValue = Number(value) || 0;
      const numericMaxValue = Number(maxValue) || -Infinity;
      if (numericValue > numericMaxValue) {
        maxValue = numericValue;
        dominantProperty = property;
      }
    });

    return dominantProperty;
  } catch (error) {
    logger.error("Error determining dominant alchemical property: ", error);
    return "Spirit"; // Default fallback
  }
};

/**
 * Normalize values in a record to sum to 1.0
 */
function normalizeValues<T extends string>(record: Record<T, number>): void {
  try {
    // Pattern KK-8: Advanced calculation safety for reduction and division
    const sum = Object.values(record).reduce((acc, val) => {
      const numericAcc = Number(acc) || 0;
      const numericVal = Number(val) || 0;
      return numericAcc + numericVal;
    }, 0);
    const numericSum = Number(sum) || 0;
    if (numericSum > 0) {
      Object.keys(record).forEach((key) => {
        const currentValue = Number(record[key as T]) || 0;
        record[key as T] = currentValue / numericSum;
      });
    }
  } catch (error) {
    logger.error("Error normalizing values: ", error);
    // If normalization fails, leave values as they are
  }
}
