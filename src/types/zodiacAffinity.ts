import type { ZodiacSignType } from "./zodiac";

/**
 * ZodiacAffinity represents how well something harmonizes with different zodiac signs
 * Higher values indicate stronger affinity/compatibility
 */
export type ZodiacAffinity = Record<ZodiacSignType, number>;

/**
 * Modalities in astrology
 */
export type Modality = "cardinal" | "fixed" | "mutable";
/**
 * Mapping of zodiac signs to their modalities
 */
export const ZODIAC_MODALITIES: Record<ZodiacSignType, Modality> = {
  aries: "cardinal",
  cancer: "cardinal",
  libra: "cardinal",
  capricorn: "cardinal",
  taurus: "fixed",
  leo: "fixed",
  scorpio: "fixed",
  aquarius: "fixed",
  gemini: "mutable",
  virgo: "mutable",
  sagittarius: "mutable",
  pisces: "mutable",
};

/**
 * Default neutral affinity values for all zodiac signs
 */
export const DEFAULT_ZODIAC_AFFINITY: ZodiacAffinity = {
  aries: 0,
  taurus: 0,
  gemini: 0,
  cancer: 0,
  leo: 0,
  virgo: 0,
  libra: 0,
  scorpio: 0,
  sagittarius: 0,
  capricorn: 0,
  aquarius: 0,
  pisces: 0,
};

/**
 * Helper function to create zodiac affinity with default values
 * Only specified signs will have non-zero values
 */
export function createZodiacAffinity(
  affinities: Partial<ZodiacAffinity>,
): ZodiacAffinity {
  return {
    ...DEFAULT_ZODIAC_AFFINITY,
    ...affinities,
  };
}

/**
 * Get the modality compatibility score between two zodiac signs
 * Signs of the same modality have the highest compatibility
 */
export function getModalityCompatibility(sign1: any, sign2: any): number {
  const modality1 = ZODIAC_MODALITIES[sign1];
  const modality2 = ZODIAC_MODALITIES[sign2];

  if (modality1 === modality2) {
    return 0.8; // Same modality: high compatibility
  }

  // Different modalities have lower compatibility
  const modalityCompatibilityChart: Record<
    Modality,
    Record<Modality, number>
  > = {
    cardinal: { cardinal: 0.8, fixed: 0.4, mutable: 0.5 },
    fixed: { cardinal: 0.4, fixed: 0.8, mutable: 0.3 },
    mutable: { cardinal: 0.5, fixed: 0.3, mutable: 0.8 },
  };

  return modalityCompatibilityChart[modality1][modality2];
}

/**
 * Calculates affinity between two zodiac signs based on both element and modality compatibility
 */
export function getZodiacCompatibility(sign1: any, sign2: any): number {
  const elementMap: Record<ZodiacSignType, "fire" | "earth" | "air" | "water"> =
    {
      aries: "fire",
      leo: "fire",
      sagittarius: "fire",
      taurus: "earth",
      virgo: "earth",
      capricorn: "earth",
      gemini: "air",
      libra: "air",
      aquarius: "air",
      cancer: "water",
      scorpio: "water",
      pisces: "water",
    };

  const elementCompatibilityChart: Record<string, Record<string, number>> = {
    fire: { fire: 0.8, earth: 0.4, air: 0.9, water: 0.3 },
    earth: { fire: 0.4, earth: 0.8, air: 0.3, water: 0.9 },
    air: { fire: 0.9, earth: 0.3, air: 0.8, water: 0.4 },
    water: { fire: 0.3, earth: 0.9, air: 0.4, water: 0.8 },
  };

  const element1 = elementMap[sign1];
  const element2 = elementMap[sign2];

  // Get element compatibility
  const elementCompatibility = elementCompatibilityChart[element1][element2];

  // Get modality compatibility
  const modalityCompatibility = getModalityCompatibility(sign1, sign2);

  // Combine element and modality compatibility (weighted average)
  return elementCompatibility * 0.6 + modalityCompatibility * 0.4;
}
