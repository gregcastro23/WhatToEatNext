import type {
  Element,
  ElementalProperties,
  NormalizedElementalProperties,
  RawElementalProperties,
} from "@/types/alchemy";

/**
 * Core elemental constants - consolidated from multiple files
 * This file, replaces: elementalConstants.ts, elements.ts, and elemental parts of defaults.ts
 */

// ===== CORE ELEMENT DEFINITIONS =====

/**
 * List of all elemental types
 */
export const ELEMENTS = ["Fire", "Water", "Earth", "Air"] as const;

/**
 * Zero state - no elemental properties
 * Use this as the starting point for calculations where values should be accumulated.
 */
export const ZERO_ELEMENTAL_PROPERTIES: RawElementalProperties = {
  Fire: 0,
  Water: 0,
  Earth: 0,
  Air: 0,
};

/**
 * Default balanced elemental properties
 * Note: For raw calculations, use ZERO_ELEMENTAL_PROPERTIES as the starting point.
 * This default is maintained for backwards compatibility with code expecting balanced values.
 */
export const DEFAULT_ELEMENTAL_PROPERTIES: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
};

/**
 * Legacy normalized defaults (for backwards compatibility only)
 * Use normalizeForDisplay() for display purposes instead.
 */
export const NORMALIZED_DEFAULT_PROPERTIES: NormalizedElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
};

// ===== ELEMENTAL RELATIONSHIPS =====

/**
 * Element affinities based on traditional correspondences
 * Each element reinforces itself most strongly
 */
export const ELEMENT_AFFINITIES = {
  Fire: ["Fire", "Air"],
  Water: ["Water", "Earth"],
  Air: ["Air", "Fire"],
  Earth: ["Earth", "Water"],
};

/**
 * Element combinations for compatibility calculations
 */
export const ELEMENT_COMBINATIONS = {
  harmonious: [
    ["Fire", "Fire"], // Same element has highest compatibility
    ["Water", "Water"],
    ["Earth", "Earth"],
    ["Air", "Air"],
    ["Fire", "Air"], // Traditional supportive pairs
    ["Water", "Earth"],
  ],
  complementary: [
    ["Fire", "Earth"], // Different elements with good compatibility
    ["Air", "Water"],
  ],
};

// ===== ZODIAC CORRESPONDENCES =====

/**
 * Zodiac sign to element mapping
 */
export const ZODIAC_ELEMENTS = {
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
} as const;

/**
 * Decan rulers for each zodiac sign
 */
export const DECANS = {
  aries: [
    { ruler: "Mars", element: "Fire", degree: 0 },
    { ruler: "Sun", element: "Fire", degree: 10 },
    { ruler: "Jupiter", element: "Fire", degree: 20 },
  ],
  taurus: [
    { ruler: "Venus", element: "Earth", degree: 0 },
    { ruler: "Mercury", element: "Earth", degree: 10 },
    { ruler: "Saturn", element: "Earth", degree: 20 },
  ],
  gemini: [
    { ruler: "Mercury", element: "Air", degree: 0 },
    { ruler: "Venus", element: "Air", degree: 10 },
    { ruler: "Uranus", element: "Air", degree: 20 },
  ],
  cancer: [
    { ruler: "Moon", element: "Water", degree: 0 },
    { ruler: "Pluto", element: "Water", degree: 10 },
    { ruler: "Neptune", element: "Water", degree: 20 },
  ],
  leo: [
    { ruler: "Sun", element: "Fire", degree: 0 },
    { ruler: "Jupiter", element: "Fire", degree: 10 },
    { ruler: "Mars", element: "Fire", degree: 20 },
  ],
  virgo: [
    { ruler: "Mercury", element: "Earth", degree: 0 },
    { ruler: "Saturn", element: "Earth", degree: 10 },
    { ruler: "Venus", element: "Earth", degree: 20 },
  ],
  libra: [
    { ruler: "Venus", element: "Air", degree: 0 },
    { ruler: "Uranus", element: "Air", degree: 10 },
    { ruler: "Mercury", element: "Air", degree: 20 },
  ],
  scorpio: [
    { ruler: "Pluto", element: "Water", degree: 0 },
    { ruler: "Neptune", element: "Water", degree: 10 },
    { ruler: "Moon", element: "Water", degree: 20 },
  ],
  sagittarius: [
    { ruler: "Jupiter", element: "Fire", degree: 0 },
    { ruler: "Mars", element: "Fire", degree: 10 },
    { ruler: "Sun", element: "Fire", degree: 20 },
  ],
  capricorn: [
    { ruler: "Saturn", element: "Earth", degree: 0 },
    { ruler: "Venus", element: "Earth", degree: 10 },
    { ruler: "Mercury", element: "Earth", degree: 20 },
  ],
  aquarius: [
    { ruler: "Uranus", element: "Air", degree: 0 },
    { ruler: "Mercury", element: "Air", degree: 10 },
    { ruler: "Venus", element: "Air", degree: 20 },
  ],
  pisces: [
    { ruler: "Neptune", element: "Water", degree: 0 },
    { ruler: "Moon", element: "Water", degree: 10 },
    { ruler: "Pluto", element: "Water", degree: 20 },
  ],
};

// ===== VALIDATION AND THRESHOLDS =====

/**
 * Validation thresholds for elemental properties
 *
 * Note: With the denormalization update, MAXIMUM_ELEMENT is now Infinity
 * to allow raw values to express true energetic intensity.
 * Use LEGACY_MAXIMUM_ELEMENT for backward compatibility with normalized systems.
 */
export const VALIDATION_THRESHOLDS = {
  MINIMUM_ELEMENT: 0,
  MAXIMUM_ELEMENT: Infinity, // Raw values have no upper bound
  LEGACY_MAXIMUM_ELEMENT: 1, // For backward compatibility with normalized systems
  BALANCE_PRECISION: 0.01,
  // For detecting if properties appear to be normalized (sum ≈ 1.0)
  NORMALIZATION_SUM_TOLERANCE: 0.01,
};

/**
 * Elemental significance thresholds
 */
export const ELEMENTAL_THRESHOLDS = {
  dominant: 0.4,
  significant: 0.25,
  present: 0.1,
  trace: 0.05,
};

/**
 * Elemental weights for calculations
 */
export const ELEMENTAL_WEIGHTS = { Fire: 1, Water: 1, Earth: 1, Air: 1 };

// ===== COMPREHENSIVE ELEMENTAL CHARACTERISTICS =====

/**
 * Enhanced elemental characteristics with comprehensive properties
 */
export const ELEMENTAL_CHARACTERISTICS = {
  Fire: {
    // Basic properties
    qualities: ["hot", "dry", "active", "energetic", "expansive"],
    season: "summer",
    direction: "south",
    energy: "expansive",
    colors: ["red", "orange", "yellow"],

    // Culinary properties
    taste: ["spicy", "bitter"],
    foods: ["spicy", "grilled", "roasted", "peppers", "ginger", "garlic"],
    cookingTechniques: ["grilling", "roasting", "broiling", "frying", "flambé"],
    flavorProfiles: ["spicy", "pungent", "bitter", "umami", "smoky"],
    complementaryIngredients: [
      "chilis",
      "garlic",
      "onions",
      "mustard seeds",
      "black pepper",
    ],
    culinaryHerbs: ["cayenne", "chili", "mustard", "cumin", "peppercorn"],
    cuisine: ["mexican", "thai", "cajun", "szechuan", "indian"],

    // Temporal associations
    seasonalAssociations: ["summer", "peak day"],
    timeOfDay: ["noon", "early afternoon"],

    // Effects and benefits
    keywords: ["energy", "passion", "transformation", "vitality", "action"],
    healthBenefits: [
      "metabolism boost",
      "circulation improvement",
      "immune strengthening",
    ],
    moodEffects: [
      "energizing",
      "stimulating",
      "uplifting",
      "motivating",
      "passionate",
    ],
    effects: ["stimulating", "energizing", "warming"],
  },
  Water: {
    // Basic properties
    qualities: ["cold", "wet", "flowing", "adaptable", "receptive"],
    season: "winter",
    direction: "north",
    energy: "contracting",
    colors: ["blue", "black", "deep purple"],

    // Culinary properties
    taste: ["salty", "sweet"],
    foods: ["soups", "steamed", "hydrating", "seafood", "fruits", "broths"],
    cookingTechniques: [
      "poaching",
      "steaming",
      "simmering",
      "blending",
      "marinating",
    ],
    flavorProfiles: ["sweet", "salty", "subtle", "soothing", "mellow"],
    complementaryIngredients: [
      "berries",
      "melon",
      "cucumber",
      "coconut",
      "seaweed",
    ],
    culinaryHerbs: ["lavender", "chamomile", "fennel", "dill", "cucumber"],
    cuisine: ["japanese", "cantonese", "scandinavian", "oceanic"],

    // Temporal associations
    seasonalAssociations: ["winter", "night"],
    timeOfDay: ["evening", "night", "twilight"],

    // Effects and benefits
    keywords: ["emotional", "intuitive", "nurturing", "healing", "connecting"],
    healthBenefits: [
      "hydration",
      "emotional balance",
      "detoxification",
      "cooling",
    ],
    moodEffects: [
      "calming",
      "soothing",
      "introspective",
      "healing",
      "nurturing",
    ],
    effects: ["cooling", "calming", "hydrating"],
  },
  Earth: {
    // Basic properties
    qualities: ["cold", "dry", "stable", "solid", "grounding"],
    season: "autumn",
    direction: "west",
    energy: "stabilizing",
    colors: ["brown", "green", "gold"],

    // Culinary properties
    taste: ["sweet", "sour"],
    foods: ["root vegetables", "grains", "hearty", "legumes", "nuts", "seeds"],
    cookingTechniques: [
      "baking",
      "slow cooking",
      "braising",
      "pressure cooking",
      "fermenting",
    ],
    flavorProfiles: ["rich", "dense", "umami", "earthy", "complex"],
    complementaryIngredients: [
      "mushrooms",
      "potatoes",
      "lentils",
      "brown rice",
      "squash",
    ],
    culinaryHerbs: ["thyme", "rosemary", "sage", "bay leaf", "black truffle"],
    cuisine: ["french", "german", "russian", "mediterranean"],

    // Temporal associations
    seasonalAssociations: ["late summer", "autumn", "harvest time"],
    timeOfDay: ["late afternoon", "early evening"],

    // Effects and benefits
    keywords: ["grounding", "practical", "material", "reliable", "structured"],
    healthBenefits: [
      "digestive support",
      "nutritional density",
      "sustained energy",
    ],
    moodEffects: [
      "stabilizing",
      "grounding",
      "comforting",
      "satisfying",
      "nourishing",
    ],
    effects: ["grounding", "stabilizing", "nourishing"],
  },
  Air: {
    // Basic properties
    qualities: ["hot", "wet", "mobile", "light", "communicative"],
    season: "spring",
    direction: "east",
    energy: "moving",
    colors: ["white", "light blue", "silver"],

    // Culinary properties
    taste: ["pungent", "astringent"],
    foods: ["light", "raw", "fresh", "salads", "sprouts", "herbs"],
    cookingTechniques: [
      "quick steaming",
      "flash cooking",
      "raw preparations",
      "infusing",
      "whipping",
    ],
    flavorProfiles: ["light", "aromatic", "herbaceous", "bright", "fresh"],
    complementaryIngredients: [
      "fresh herbs",
      "citrus",
      "sprouts",
      "greens",
      "aromatics",
    ],
    culinaryHerbs: ["mint", "basil", "cilantro", "dill", "lemongrass"],
    cuisine: ["vietnamese", "greek", "levantine", "persian"],

    // Temporal associations
    seasonalAssociations: ["spring", "dawn"],
    timeOfDay: ["morning", "sunrise"],

    // Effects and benefits
    keywords: [
      "intellectual",
      "communication",
      "social",
      "movement",
      "connection",
    ],
    healthBenefits: [
      "mental clarity",
      "respiratory support",
      "digestive lightness",
    ],
    moodEffects: [
      "uplifting",
      "clarifying",
      "refreshing",
      "invigorating",
      "inspiring",
    ],
    effects: ["lightening", "clarifying", "refreshing"],
  },
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get the dominant element from elemental properties
 */
export function getDominantElement(properties: ElementalProperties): Element {
  return Object.entries(properties).reduce(
    (max, [element, value]) =>
      value > max.value ? { element: element as Element, value } : max,
    { element: "Fire" as Element, value: 0 },
  ).element;
}

/**
 * Normalize elemental properties to sum to 1
 *
 * @deprecated Use normalizeForDisplay() from @/utils/elemental/normalization
 * for display purposes. For calculations, use raw values without normalization.
 */
export function normalizeElementalProperties(
  properties: ElementalProperties,
): NormalizedElementalProperties {
  const total = Object.values(properties).reduce(
    (sum, val) => sum + (val || 0),
    0,
  );

  if (total === 0) {
    return { ...NORMALIZED_DEFAULT_PROPERTIES };
  }

  return {
    Fire: (properties.Fire || 0) / total,
    Water: (properties.Water || 0) / total,
    Earth: (properties.Earth || 0) / total,
    Air: (properties.Air || 0) / total,
  };
}

/**
 * Normalize raw elemental properties to percentages (0.0-1.0) for display
 * Used ONLY for UI display purposes, NOT for calculations
 *
 * @param properties - Raw elemental properties (may have values > 1.0)
 * @returns Normalized elemental properties (sum = 1.0, each value 0.0-1.0)
 */
export function normalizeForDisplay(
  properties: RawElementalProperties | ElementalProperties,
): NormalizedElementalProperties {
  const total =
    properties.Fire + properties.Water + properties.Earth + properties.Air;

  if (total === 0) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  return {
    Fire: properties.Fire / total,
    Water: properties.Water / total,
    Earth: properties.Earth / total,
    Air: properties.Air / total,
  };
}

/**
 * Get total elemental intensity (sum of all elements)
 * Useful for understanding the overall energetic magnitude of properties
 *
 * @param properties - Raw elemental properties
 * @returns Total intensity (sum of Fire + Water + Earth + Air)
 */
export function getTotalIntensity(
  properties: RawElementalProperties | ElementalProperties,
): number {
  return properties.Fire + properties.Water + properties.Earth + properties.Air;
}

/**
 * Get dominant element by absolute value (not percentage)
 * For raw values, this gives the element with the highest intensity
 *
 * @param properties - Raw or normalized elemental properties
 * @returns The dominant element
 */
export function getDominantElementByIntensity(
  properties: RawElementalProperties | ElementalProperties,
): Element {
  const entries = Object.entries(properties).filter(([key]) =>
    ["Fire", "Water", "Earth", "Air"].includes(key),
  ) as [Element, number][];
  return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
}

/**
 * Calculate elemental compatibility between two sets of properties
 */
export function calculateElementalCompatibility(
  properties1: ElementalProperties,
  properties2: ElementalProperties,
): number {
  // Each element reinforces itself most strongly
  let compatibility = 0;
  let totalWeight = 0;

  for (const element of ELEMENTS) {
    const value1 = properties1[element] || 0;
    const value2 = properties2[element] || 0;

    // Same element compatibility (highest)
    const sameElementScore = Math.min(value1, value2);
    compatibility += sameElementScore * 0.9;
    totalWeight += sameElementScore;

    // Different element compatibility (good but lower)
    const differentElementScore = Math.abs(value1 - value2);
    compatibility += (1 - differentElementScore) * 0.7;
    totalWeight += 1;
  }

  return totalWeight > 0 ? compatibility / totalWeight : 0.7;
}

/**
 * Validate elemental properties (supports both raw and normalized values)
 *
 * With the denormalization update, this function now validates that:
 * - All values are non-negative numbers
 * - All required elements (Fire, Water, Earth, Air) are present
 *
 * Note: Sum validation is no longer enforced as raw values don't need to sum to 1.
 * Use validateNormalizedProperties() if you need to validate normalized properties.
 *
 * @param properties - Elemental properties to validate
 * @returns True if properties are valid, false otherwise
 */
export function validateElementalProperties(
  properties: ElementalProperties | RawElementalProperties,
): boolean {
  if (!properties || typeof properties !== "object") {
    return false;
  }

  const elements: Element[] = ["Fire", "Water", "Earth", "Air"];

  // Check all elements are present and non-negative numbers
  for (const element of elements) {
    const value = properties[element];
    if (
      typeof value !== "number" ||
      value < VALIDATION_THRESHOLDS.MINIMUM_ELEMENT ||
      !isFinite(value)
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Validate that properties are normalized (sum ≈ 1.0, each value 0.0-1.0)
 *
 * @param properties - Properties to validate as normalized
 * @returns True if properties appear to be properly normalized
 */
export function validateNormalizedProperties(
  properties: NormalizedElementalProperties | ElementalProperties,
): boolean {
  if (!properties || typeof properties !== "object") {
    return false;
  }

  const elements: Element[] = ["Fire", "Water", "Earth", "Air"];
  let total = 0;

  for (const element of elements) {
    const value = properties[element];
    if (
      typeof value !== "number" ||
      value < 0 ||
      value > VALIDATION_THRESHOLDS.LEGACY_MAXIMUM_ELEMENT
    ) {
      return false;
    }
    total += value;
  }

  // Check sum is approximately 1.0
  return (
    Math.abs(total - 1) <= VALIDATION_THRESHOLDS.NORMALIZATION_SUM_TOLERANCE
  );
}

/**
 * Check if properties appear to be normalized (sum ≈ 1.0)
 * Useful for detecting legacy normalized data
 *
 * @param properties - Properties to check
 * @returns True if properties appear to be normalized
 */
export function isNormalized(
  properties: ElementalProperties | RawElementalProperties,
): boolean {
  const total = getTotalIntensity(properties);
  return (
    Math.abs(total - 1) <= VALIDATION_THRESHOLDS.NORMALIZATION_SUM_TOLERANCE
  );
}

export default {
  // Constants
  ELEMENTS,
  DEFAULT_ELEMENTAL_PROPERTIES,
  ZERO_ELEMENTAL_PROPERTIES,
  NORMALIZED_DEFAULT_PROPERTIES,
  ELEMENT_AFFINITIES,
  ELEMENT_COMBINATIONS,
  ZODIAC_ELEMENTS,
  DECANS,
  VALIDATION_THRESHOLDS,
  ELEMENTAL_THRESHOLDS,
  ELEMENTAL_WEIGHTS,
  ELEMENTAL_CHARACTERISTICS,
  // Functions
  getDominantElement,
  getDominantElementByIntensity,
  getTotalIntensity,
  normalizeElementalProperties,
  normalizeForDisplay,
  calculateElementalCompatibility,
  validateElementalProperties,
  validateNormalizedProperties,
  isNormalized,
};
