import { LunarPhaseWithSpaces } from '../types/alchemy';

import { ElementalCharacter } from './planetaryElements';

/**
 * Enhanced planet type incorporating multiple astrological traditions
 */
/**
 * Extended Planet type for planetary food associations
 */
export type Planet =
  | 'Sun'
  | 'Moon'
  | 'Mercury'
  | 'Venus'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'Uranus'
  | 'Neptune'
  | 'Pluto'
  | 'Rahu'
  | 'Ketu';

/**
 * Planetary dignity types for calculation
 */
export type PlanetaryDignity =
  | 'Domicile'
  | 'Exaltation'
  | 'Triplicity'
  | 'Term'
  | 'Face'
  | 'Mooltrikona'
  | 'Nakshatra'
  | 'Detriment'
  | 'Fall'
  | 'Neutral';

/**
 * Interface for planetary dignity details
 */
export interface PlanetaryDignityDetails {
  type: PlanetaryDignity;
  strength: number;
  favorableZodiacSigns?: string[];
  unfavorableZodiacSigns?: string[];
}

/**
 * Lunar phase system
 */
export type LunarPhase = LunarPhaseWithSpaces;

/**
 * Planetary food associations structure
 */
export interface FoodAssociation {
  name: string;
  elements: string[];
  qualities: string[];
  foodCategories: string[];
  specificFoods: string[];
  cuisines: string[];
  cookingMethods?: string[];
  boostValue?: number;
  elementalBoost?: Record<string, number>;
}

export const planetaryFoodAssociations: Record<Planet, FoodAssociation> = {
  Sun: {
    name: 'Sun',
    elements: ['Fire'],
    qualities: ['Hot', 'Dry'],
    foodCategories: ['Fruits', 'Spices', 'Grains'],
    specificFoods: ['Oranges', 'Lemons', 'Honey', 'Saffron', 'Cinnamon', 'Wheat'],
    cuisines: ['Mediterranean', 'Indian', 'Middle Eastern'],
    elementalBoost: { Fire: 0.3, Air: 0.1 },
  },
  Moon: {
    name: 'Moon',
    elements: ['Water'],
    qualities: ['Cold', 'Moist'],
    foodCategories: ['Vegetables', 'Dairy', 'Seafood'],
    specificFoods: ['Cucumber', 'Lettuce', 'Milk', 'Yogurt', 'White fish', 'Rice'],
    cuisines: ['Japanese', 'Nordic', 'Coastal'],
    elementalBoost: { Water: 0.3, Earth: 0.1 },
  },
  Mercury: {
    name: 'Mercury',
    elements: ['Air', 'Earth'],
    qualities: ['Mixed', 'Adaptable'],
    foodCategories: ['Nuts', 'Seeds', 'Herbs'],
    specificFoods: ['Almonds', 'Fennel', 'Mint', 'Celery', 'Mixed greens'],
    cuisines: ['Fusion', 'Contemporary', 'Diverse'],
    elementalBoost: { Air: 0.2, Earth: 0.2 },
  },
  Venus: {
    name: 'Venus',
    elements: ['Earth', 'Water'],
    qualities: ['Cool', 'Moist'],
    foodCategories: ['Fruits', 'Sweets', 'Dairy'],
    specificFoods: ['Apples', 'Berries', 'Chocolate', 'Vanilla', 'Cream'],
    cuisines: ['French', 'Italian', 'Dessert-focused'],
    elementalBoost: { Earth: 0.2, Water: 0.2 },
  },
  Mars: {
    name: 'Mars',
    elements: ['Fire'],
    qualities: ['Hot', 'Dry'],
    foodCategories: ['Meats', 'Spices', 'Alcohol'],
    specificFoods: ['Red meat', 'Chili', 'Garlic', 'Onions', 'Red wine'],
    cuisines: ['Spicy', 'BBQ', 'Grilled'],
    elementalBoost: { Fire: 0.4 },
  },
  Jupiter: {
    name: 'Jupiter',
    elements: ['Fire', 'Air'],
    qualities: ['Warm', 'Moist'],
    foodCategories: ['Rich foods', 'Fruits', 'Meats'],
    specificFoods: ['Fig', 'Asparagus', 'Salmon', 'Sage', 'Nutmeg'],
    cuisines: ['Abundant', 'Festive', 'Celebratory'],
    elementalBoost: { Fire: 0.2, Air: 0.2 },
  },
  Saturn: {
    name: 'Saturn',
    elements: ['Earth'],
    qualities: ['Cold', 'Dry'],
    foodCategories: ['Root vegetables', 'Grains', 'Legumes'],
    specificFoods: ['Potatoes', 'Beets', 'Rye', 'Lentils', 'Black tea'],
    cuisines: ['Rustic', 'Traditional', 'Preserved'],
    elementalBoost: { Earth: 0.4 },
  },
  Uranus: {
    name: 'Uranus',
    elements: ['Air'],
    qualities: ['Cold', 'Dry'],
    foodCategories: ['Unusual foods', 'Novel ingredients'],
    specificFoods: ['Exotic fruits', 'Molecular gastronomy items', 'Fermented foods'],
    cuisines: ['Experimental', 'Avant-garde', 'Futuristic'],
    elementalBoost: { Air: 0.4 },
  },
  Neptune: {
    name: 'Neptune',
    elements: ['Water'],
    qualities: ['Cold', 'Moist'],
    foodCategories: ['Seafood', 'Alcohol', 'Elusive flavors'],
    specificFoods: ['Seaweed', 'White wine', 'Delicate fish', 'Coconut'],
    cuisines: ['Ethereal', 'Subtle', 'Inspired'],
    elementalBoost: { Water: 0.4 },
  },
  Pluto: {
    name: 'Pluto',
    elements: ['Water', 'Fire'],
    qualities: ['Transformative'],
    foodCategories: ['Fermented foods', 'Strong flavors', 'Transformed ingredients'],
    specificFoods: ['Dark chocolate', 'Coffee', 'Mushrooms', 'Aged cheese'],
    cuisines: ['Intense', 'Complex', 'Deep'],
    elementalBoost: { Water: 0.2, Fire: 0.2 },
  },
  Rahu: {
    name: 'Rahu',
    elements: ['Air', 'Fire'],
    qualities: ['Expansive', 'Chaotic'],
    foodCategories: ['Foreign foods', 'Unusual combinations', 'Addictive tastes'],
    specificFoods: ['Exotic spices', 'Foreign delicacies', 'Smoky flavors', 'Powerful stimulants'],
    cuisines: ['Fusion', 'Unexpected combinations', 'Foreign cuisines'],
    elementalBoost: { Air: 0.2, Fire: 0.2 },
  },
  Ketu: {
    name: 'Ketu',
    elements: ['Fire', 'Water'],
    qualities: ['Spiritual', 'Subtle'],
    foodCategories: ['Simple foods', 'Healing herbs', 'Purifying ingredients'],
    specificFoods: ['Healing teas', 'Cleansing herbs', 'Simple grains', 'Pure water'],
    cuisines: ['Ascetic', 'Monastic', 'Purifying'],
    elementalBoost: { Fire: 0.2, Water: 0.2 },
  },
};

/**
 * Planetary cooking guide interface for recommendation algorithm
 */
export interface PlanetaryCookingGuide {
  optimalCookingTemp: string;
  flavorPairings: string[];
  nutrientFocus: string[];
  preservationMethods: string[];
  traditionalRecipes: string[];
}

/**
 * Calculate planetary boost for an ingredient based on current astrological state
 */
export const calculatePlanetaryBoost = (
  item: unknown, // ElementalItem type
  planetPositions: Record<string, unknown>,
  currentZodiac?: string | null,
  lunarPhase?: LunarPhase | null,
) => {
  let boost = 0;
  const dominantPlanets: string[] = [];
  const dignities: Record<string, PlanetaryDignityDetails> = {};

  // Planetary position calculations
  Object.entries(planetPositions).forEach(([_planet, _position]) => {
    const planetInfo = planetaryFoodAssociations[_planet as Planet];
    if (!planetInfo) return;

    // Basic planetary boost
    const baseBoost = planetInfo.boostValue || 0.1;
    boost += baseBoost;

    // Add planet to dominant list if significant
    if (baseBoost > 0.2) {
      dominantPlanets.push(_planet);

      // Add dignity information for dominant planets
      dignities[_planet] = {
        type: 'Neutral' as PlanetaryDignity,
        strength: baseBoost,
        favorableZodiacSigns: currentZodiac ? [currentZodiac] : [],
      };
    }
  });

  // Zodiac sign boost if available
  if (currentZodiac) {
    boost += getZodiacBoost(currentZodiac, item);
  }

  // Lunar phase boost if available
  if (lunarPhase) {
    boost += getLunarPhaseBoost(lunarPhase);
  }

  return {
    boost: parseFloat(boost.toFixed(2)),
    dominantPlanets: Array.from(new Set(dominantPlanets)), // Fix for Set iteration in older JS versions
    dignities,
  };
};

// Helper functions for calculations
const _getTriplicityRulers = (_zodiacSign?: string | null): Planet[] => {
  // Implementation depends on your zodiac mappings
  return ['Sun', 'Mars', 'Jupiter'] as Planet[];
};

const _getSeasonalMultiplier = (): number => {
  // Implementation depends on your seasonal logic
  return 1.0;
};

/**
 * Get dignity multiplier for calculations
 */
export const getDignityMultiplier = (dignity: PlanetaryDignity): number => {
  const multipliers: Record<PlanetaryDignity, number> = {
    Domicile: 1.5,
    Exaltation: 1.3,
    Triplicity: 1.2,
    Term: 1.1,
    Face: 1.05,
    Mooltrikona: 1.4,
    Nakshatra: 1.25,
    Detriment: 0.7,
    Fall: 0.5,
    Neutral: 1.0,
  };
  return multipliers[dignity] || 1.0;
};

/**
 * Get zodiac boost based on elemental properties
 */
export const getZodiacBoost = (zodiacSign: string, item: unknown): number => {
  // Get zodiac sign element
  const zodiacElements: Record<string, ElementalCharacter> = {
    aries: 'Fire',
    leo: 'Fire',
    sagittarius: 'Fire',
    taurus: 'Earth',
    virgo: 'Earth',
    capricorn: 'Earth',
    gemini: 'Air',
    libra: 'Air',
    aquarius: 'Air',
    cancer: 'Water',
    scorpio: 'Water',
    pisces: 'Water',
  };

  // Normalize zodiac sign to lowercase for lookup
  const normalizedSign = zodiacSign.toLowerCase();
  const zodiacElement = zodiacElements[normalizedSign] || 'Fire';

  // Check if item has elemental properties
  const itemData = item as unknown as {
    elementalProperties?: Record<string, number>;
    zodiacInfluences?: string[];
  };
  if (!itemData.elementalProperties) {
    return 0.1; // Minimum boost if no elemental data
  }

  // Calculate boost based on elemental affinity
  // Higher boost if the cuisine's dominant element matches the zodiac element
  const elementValue = itemData.elementalProperties[zodiacElement] || 0;
  const elementBoost = elementValue * 0.8; // Scale based on how strong the element is

  // Check if cuisine explicitly lists this zodiac sign as favorable
  const zodiacBoost = itemData.zodiacInfluences?.includes(normalizedSign) ? 0.3 : 0;

  // Apply modality boost based on cardinal/fixed/mutable qualities
  let modalityBoost = 0;
  const cardinalSigns = ['aries', 'cancer', 'libra', 'capricorn'];
  const fixedSigns = ['taurus', 'leo', 'scorpio', 'aquarius'];
  // If not cardinal or fixed, it's mutable (gemini, virgo, sagittarius, pisces)

  if (cardinalSigns.includes(normalizedSign)) {
    // Cardinal signs prefer bold, distinctive cuisines
    modalityBoost = (itemData.elementalProperties['Fire'] || 0) * 0.2;
  } else if (fixedSigns.includes(normalizedSign)) {
    // Fixed signs prefer substantial, traditional cuisines
    modalityBoost = (itemData.elementalProperties['Earth'] || 0) * 0.2;
  } else {
    // Mutable signs prefer adaptable, fusion cuisines
    modalityBoost = (itemData.elementalProperties['Air'] || 0) * 0.2;
  }

  // Calculate seasonal alignment (certain cuisines are better aligned with seasons)
  const seasonalBoost = _calculateSeasonalAlignment(normalizedSign, item) * 0.15;

  // Combine all boost factors
  const totalBoost = elementBoost + zodiacBoost + modalityBoost + seasonalBoost;

  // Return normalized boost value (0-1 range)
  return Math.min(0.7, Math.max(0.1, totalBoost));
};

// Helper function to calculate seasonal alignment
const _calculateSeasonalAlignment = (zodiacSign: string, item: unknown): number => {
  // Map zodiac signs to seasons
  const seasonMap: Record<string, string> = {
    aries: 'spring',
    taurus: 'spring',
    gemini: 'spring',
    cancer: 'summer',
    leo: 'summer',
    virgo: 'summer',
    libra: 'autumn',
    scorpio: 'autumn',
    sagittarius: 'autumn',
    capricorn: 'winter',
    aquarius: 'winter',
    pisces: 'winter',
  };

  const season = seasonMap[zodiacSign];

  // Seasonal elemental correspondences
  const seasonalElements: Record<string, ElementalCharacter> = {
    spring: 'Air',
    summer: 'Fire',
    autumn: 'Earth',
    winter: 'Water',
  };

  const seasonalElement = seasonalElements[season];

  // Calculate alignment based on the cuisine's elemental properties
  // Higher value if the cuisine aligns with the season's element
  const itemData = item as { elementalProperties?: Record<string, number> };
  return itemData.elementalProperties?.[seasonalElement] || 0.1;
};

/**
 * Calculate boost based on lunar phase
 */
export const getLunarPhaseBoost = (lunarPhase: LunarPhase): number => {
  // New calculation based on lunar phase energy patterns
  // Different lunar phases enhance different elemental and alchemical properties

  // Map lunar phases to elemental and alchemical influences
  const lunarInfluences: Record<
    LunarPhase,
    {
      element: ElementalCharacter;
      alchemical: string;
      intensity: number;
    }
  > = {
    'new moon': { element: 'Fire', alchemical: 'Spirit', intensity: 0.8 },
    'waxing crescent': { element: 'Fire', alchemical: 'Spirit', intensity: 0.7 },
    'first quarter': { element: 'Air', alchemical: 'Substance', intensity: 0.6 },
    'waxing gibbous': { element: 'Air', alchemical: 'Substance', intensity: 0.7 },
    'full moon': { element: 'Water', alchemical: 'Essence', intensity: 0.8 },
    'waning gibbous': { element: 'Water', alchemical: 'Essence', intensity: 0.7 },
    'last quarter': { element: 'Earth', alchemical: 'Matter', intensity: 0.6 },
    'waning crescent': { element: 'Earth', alchemical: 'Matter', intensity: 0.7 },
  };

  // Get lunar influence data or provide fallback
  const influence = lunarInfluences[lunarPhase] || {
    element: 'Water',
    alchemical: 'Essence',
    intensity: 0.5,
  };

  // Calculate boost based on lunar phase intensity
  // This will vary between 0.15 and 0.4 depending on the phase
  return 0.15 + ((influence as any)?.intensity || 0) * 0.2;
};

/**
 * Get flavor boost from planetary associations
 */
export const getFlavorBoost = (_planet: Planet, _ingredient: unknown): number => {
  const ingredientData = _ingredient as unknown as {
    name?: string;
    planetaryRulers?: string[];
    elementalCharacter?: string;
  };
  const elementBoost = planetaryFoodAssociations[_planet].elementalBoost || {};
  return Object.entries(elementBoost).reduce((acc, [element, boost]) => {
    return acc + (ingredientData.elementalProperties?.[element] || 0) * (boost || 0);
  }, 0);
};

/**
 * Get nutritional synergy between ingredient and planet
 */
export const getNutritionalSynergy = (_planet: Planet, _ingredient: unknown): string[] => {
  // Implementation depends on your nutritional data
  return [];
};

/**
 * Format elemental balance for display
 */
export const formatelementalState = (elements: Partial<Record<string, number>>): string => {
  const validEntries = Object.entries(elements)
    .filter(([_, val]) => Number.isFinite(val))
    .map(([elem, val]) => `${elem} ${Math.round((val || 0) * 100)}%`)
    .join(' · ');

  return validEntries;
};

export default planetaryFoodAssociations;
