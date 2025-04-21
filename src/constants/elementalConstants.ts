// src/constants/elementalConstants.ts

import type { Element, ZodiacSign, Decan } from '../types/alchemy';
import { ElementalProperties, DEFAULT_ELEMENTAL_PROPERTIES as DEFAULT_PROPS } from '../types/shared';

// Define StringIndexed type inline since we're not importing it
type StringIndexed<T = any> = {
  [key: string]: T;
};

/**
 * List of all elemental types
 */
export const ELEMENTS = ['Fire', 'Water', 'Earth', 'Air'] as const;

/**
 * Default balanced elemental properties (25% each)
 */
export const DEFAULT_ELEMENTAL_PROPERTIES = DEFAULT_PROPS;

/**
 * Validation thresholds for elemental properties
 */
export const VALIDATION_THRESHOLDS = {
  MINIMUM_ELEMENT: 0,  // Minimum allowed value for any element
  MAXIMUM_ELEMENT: 1,  // Maximum allowed value for any element
  BALANCE_PRECISION: 0.01  // Tolerance for sum of elements to be considered valid (1 ± this value)
};

export const ELEMENT_AFFINITIES: Record<Element, Element[]> = {
  Fire: ['Air'],
  Water: ['Earth'],
  Air: ['Fire'],
  Earth: ['Water']
};

export const ZODIAC_ELEMENTS: Record<ZodiacSign, Element> = {
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
  pisces: 'Water'
} as const;

export const MINIMUM_THRESHOLD = 0.2;
export const MAXIMUM_THRESHOLD = 0.3;
export const IDEAL_PROPORTION = 0.25;

export const DECANS: Record<ZodiacSign, Decan[]> = {
  aries: [
    { ruler: 'mars', element: 'Fire', degree: 0 },
    { ruler: 'sun', element: 'Fire', degree: 10 },
    { ruler: 'jupiter', element: 'Fire', degree: 20 }
  ],
  taurus: [
    { ruler: 'venus', element: 'Earth', degree: 0 },
    { ruler: 'mercury', element: 'Earth', degree: 10 },
    { ruler: 'saturn', element: 'Earth', degree: 20 }
  ],
  gemini: [
    { ruler: 'mercury', element: 'Air', degree: 0 },
    { ruler: 'venus', element: 'Air', degree: 10 },
    { ruler: 'uranus', element: 'Air', degree: 20 }
  ],
  cancer: [
    { ruler: 'moon', element: 'Water', degree: 0 },
    { ruler: 'pluto', element: 'Water', degree: 10 },
    { ruler: 'neptune', element: 'Water', degree: 20 }
  ],
  leo: [
    { ruler: 'sun', element: 'Fire', degree: 0 },
    { ruler: 'jupiter', element: 'Fire', degree: 10 },
    { ruler: 'mars', element: 'Fire', degree: 20 }
  ],
  virgo: [
    { ruler: 'mercury', element: 'Earth', degree: 0 },
    { ruler: 'saturn', element: 'Earth', degree: 10 },
    { ruler: 'venus', element: 'Earth', degree: 20 }
  ],
  libra: [
    { ruler: 'venus', element: 'Air', degree: 0 },
    { ruler: 'uranus', element: 'Air', degree: 10 },
    { ruler: 'mercury', element: 'Air', degree: 20 }
  ],
  scorpio: [
    { ruler: 'pluto', element: 'Water', degree: 0 },
    { ruler: 'neptune', element: 'Water', degree: 10 },
    { ruler: 'moon', element: 'Water', degree: 20 }
  ],
  sagittarius: [
    { ruler: 'jupiter', element: 'Fire', degree: 0 },
    { ruler: 'mars', element: 'Fire', degree: 10 },
    { ruler: 'sun', element: 'Fire', degree: 20 }
  ],
  capricorn: [
    { ruler: 'saturn', element: 'Earth', degree: 0 },
    { ruler: 'venus', element: 'Earth', degree: 10 },
    { ruler: 'mercury', element: 'Earth', degree: 20 }
  ],
  aquarius: [
    { ruler: 'uranus', element: 'Air', degree: 0 },
    { ruler: 'mercury', element: 'Air', degree: 10 },
    { ruler: 'venus', element: 'Air', degree: 20 }
  ],
  pisces: [
    { ruler: 'neptune', element: 'Water', degree: 0 },
    { ruler: 'moon', element: 'Water', degree: 10 },
    { ruler: 'pluto', element: 'Water', degree: 20 }
  ]
};

export const ELEMENTAL_WEIGHTS = {
  Fire: 1,
  Water: 1,
  Earth: 1,
  Air: 1
};

/**
 * Enhanced elemental characteristics with comprehensive properties
 */
export const ELEMENTAL_CHARACTERISTICS = {
  Fire: {
    qualities: ['Warm', 'Dry', 'Active', 'Energetic', 'Expansive'],
    keywords: ['Energy', 'Passion', 'Transformation', 'Vitality', 'Action'],
    foods: ['Spicy', 'Grilled', 'Roasted', 'Peppers', 'Ginger', 'Garlic'],
    cookingTechniques: ['Grilling', 'Roasting', 'Broiling', 'Frying', 'Flambé'],
    flavorProfiles: ['Spicy', 'Pungent', 'Bitter', 'Umami', 'Smoky'],
    seasonalAssociations: ['Summer', 'Peak Day'],
    healthBenefits: ['Metabolism boost', 'Circulation improvement', 'Immune strengthening'],
    complementaryIngredients: ['Chilis', 'Garlic', 'Onions', 'Mustard seeds', 'Black pepper'],
    moodEffects: ['Energizing', 'Stimulating', 'Uplifting', 'Motivating', 'Passionate'],
    culinaryHerbs: ['Cayenne', 'Chili', 'Mustard', 'Cumin', 'Peppercorn'],
    timeOfDay: ['Noon', 'Early afternoon'],
    tastes: ['spicy', 'bitter'],
    cuisine: ['mexican', 'thai', 'cajun', 'szechuan', 'indian'],
    effects: ['stimulating', 'energizing', 'warming']
  },
  Water: {
    qualities: ['Cool', 'Moist', 'Flowing', 'Adaptable', 'Receptive'],
    keywords: ['Emotional', 'Intuitive', 'Nurturing', 'Healing', 'Connecting'],
    foods: ['Soups', 'Steamed', 'Hydrating', 'Seafood', 'Fruits', 'Broths'],
    cookingTechniques: ['Poaching', 'Steaming', 'Simmering', 'Blending', 'Marinating'],
    flavorProfiles: ['Sweet', 'Salty', 'Subtle', 'Soothing', 'Mellow'],
    seasonalAssociations: ['Winter', 'Night'],
    healthBenefits: ['Hydration', 'Emotional balance', 'Detoxification', 'Cooling'],
    complementaryIngredients: ['Berries', 'Melon', 'Cucumber', 'Coconut', 'Seaweed'],
    moodEffects: ['Calming', 'Soothing', 'Introspective', 'Healing', 'Nurturing'],
    culinaryHerbs: ['Lavender', 'Chamomile', 'Fennel', 'Dill', 'Cucumber'],
    timeOfDay: ['Evening', 'Night', 'Twilight'],
    tastes: ['sweet', 'bland'],
    cuisine: ['japanese', 'cantonese', 'scandinavian', 'oceanic'],
    effects: ['cooling', 'calming', 'hydrating']
  },
  Earth: {
    qualities: ['Cool', 'Dry', 'Stable', 'Solid', 'Grounding'],
    keywords: ['Grounding', 'Practical', 'Material', 'Reliable', 'Structured'],
    foods: ['Root vegetables', 'Grains', 'Hearty', 'Legumes', 'Nuts', 'Seeds'],
    cookingTechniques: ['Baking', 'Slow cooking', 'Braising', 'Pressure cooking', 'Fermenting'],
    flavorProfiles: ['Rich', 'Dense', 'Umami', 'Earthy', 'Complex'],
    seasonalAssociations: ['Late Summer', 'Autumn', 'Harvest time'],
    healthBenefits: ['Digestive support', 'Nutritional density', 'Sustained energy'],
    complementaryIngredients: ['Mushrooms', 'Potatoes', 'Lentils', 'Brown rice', 'Squash'],
    moodEffects: ['Stabilizing', 'Grounding', 'Comforting', 'Satisfying', 'Nourishing'],
    culinaryHerbs: ['Thyme', 'Rosemary', 'Sage', 'Bay leaf', 'Black truffle'],
    timeOfDay: ['Late afternoon', 'Early evening'],
    tastes: ['salty', 'umami'],
    cuisine: ['french', 'german', 'russian', 'mediterranean'],
    effects: ['grounding', 'stabilizing', 'nourishing']
  },
  Air: {
    qualities: ['Warm', 'Moist', 'Mobile', 'Light', 'Communicative'],
    keywords: ['Intellectual', 'Communication', 'Social', 'Movement', 'Connection'],
    foods: ['Light', 'Raw', 'Fresh', 'Salads', 'Sprouts', 'Herbs'],
    cookingTechniques: ['Quick steaming', 'Flash cooking', 'Raw preparations', 'Infusing', 'Whipping'],
    flavorProfiles: ['Light', 'Aromatic', 'Herbaceous', 'Bright', 'Fresh'],
    seasonalAssociations: ['Spring', 'Dawn'],
    healthBenefits: ['Mental clarity', 'Respiratory support', 'Digestive lightness'],
    complementaryIngredients: ['Fresh herbs', 'Citrus', 'Sprouts', 'Greens', 'Aromatics'],
    moodEffects: ['Uplifting', 'Clarifying', 'Refreshing', 'Invigorating', 'Inspiring'],
    culinaryHerbs: ['Mint', 'Basil', 'Cilantro', 'Dill', 'Lemongrass'],
    timeOfDay: ['Morning', 'sunrise'],
    tastes: ['sour', 'tangy', 'astringent'],
    cuisine: ['vietnamese', 'greek', 'levantine', 'persian'],
    effects: ['lightening', 'clarifying', 'refreshing']
  }
};