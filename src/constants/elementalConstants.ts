// src/constants/elementalConstants.ts

import type { Element, ElementalProperties, ZodiacSign } from '../types/alchemy';

// Define StringIndexed type inline since we're not importing it
type _<T = unknown> = {
  [key: string]: T;
}

/**
 * List of all elemental types
 */
export const _ELEMENTS = ['Fire', 'Water', 'Earth', 'Air'] as const;

/**
 * Default balanced elemental properties (25% each)
 */
export const _DEFAULT_ELEMENTAL_PROPERTIES: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25
};

// Non-underscored export for compatibility
export const DEFAULT_ELEMENTAL_PROPERTIES = _DEFAULT_ELEMENTAL_PROPERTIES;

/**
 * Validation thresholds for elemental properties
 */
export const _VALIDATION_THRESHOLDS = {
  MINIMUM_ELEMENT: 0, // Minimum allowed value for any element,
  MAXIMUM_ELEMENT: 1, // Maximum allowed value for any element,
  BALANCE_PRECISION: 0.01, // Tolerance for sum of elements to be considered valid (1 ± this value)
}

export const _ELEMENT_AFFINITIES: Record<Element, Element[]> = {
  Fire: ['Air'],
  Water: ['Earth'],
  Air: ['Fire'],
  Earth: ['Water']
}

export const _ZODIAC_ELEMENTS: Record<ZodiacSign, Element> = {
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

export const _MINIMUM_THRESHOLD = 0.2;
export const _MAXIMUM_THRESHOLD = 0.3;
export const _IDEAL_PROPORTION = 0.25;

export const _DECANS = {
  aries: [
    { ruler: 'Mars', element: 'Fire', degree: 0 },
    { ruler: 'Sun', element: 'Fire', degree: 10 },
    { ruler: 'Jupiter', element: 'Fire', degree: 20 }
  ],
  taurus: [
    { ruler: 'Venus', element: 'Earth', degree: 0 },
    { ruler: 'Mercury', element: 'Earth', degree: 10 },
    { ruler: 'Saturn', element: 'Earth', degree: 20 }
  ],
  gemini: [
    { ruler: 'Mercury', element: 'Air', degree: 0 },
    { ruler: 'Venus', element: 'Air', degree: 10 },
    { ruler: 'Uranus', element: 'Air', degree: 20 }
  ],
  cancer: [
    { ruler: 'Moon', element: 'Water', degree: 0 },
    { ruler: 'Pluto', element: 'Water', degree: 10 },
    { ruler: 'Neptune', element: 'Water', degree: 20 }
  ],
  leo: [
    { ruler: 'Sun', element: 'Fire', degree: 0 },
    { ruler: 'Jupiter', element: 'Fire', degree: 10 },
    { ruler: 'Mars', element: 'Fire', degree: 20 }
  ],
  virgo: [
    { ruler: 'Mercury', element: 'Earth', degree: 0 },
    { ruler: 'Saturn', element: 'Earth', degree: 10 },
    { ruler: 'Venus', element: 'Earth', degree: 20 }
  ],
  libra: [
    { ruler: 'Venus', element: 'Air', degree: 0 },
    { ruler: 'Uranus', element: 'Air', degree: 10 },
    { ruler: 'Mercury', element: 'Air', degree: 20 }
  ],
  scorpio: [
    { ruler: 'Pluto', element: 'Water', degree: 0 },
    { ruler: 'Neptune', element: 'Water', degree: 10 },
    { ruler: 'Moon', element: 'Water', degree: 20 }
  ],
  sagittarius: [
    { ruler: 'Jupiter', element: 'Fire', degree: 0 },
    { ruler: 'Mars', element: 'Fire', degree: 10 },
    { ruler: 'Sun', element: 'Fire', degree: 20 }
  ],
  capricorn: [
    { ruler: 'Saturn', element: 'Earth', degree: 0 },
    { ruler: 'Venus', element: 'Earth', degree: 10 },
    { ruler: 'Mercury', element: 'Earth', degree: 20 }
  ],
  aquarius: [
    { ruler: 'Uranus', element: 'Air', degree: 0 },
    { ruler: 'Mercury', element: 'Air', degree: 10 },
    { ruler: 'Venus', element: 'Air', degree: 20 }
  ],
  pisces: [
    { ruler: 'Neptune', element: 'Water', degree: 0 },
    { ruler: 'Moon', element: 'Water', degree: 10 },
    { ruler: 'Pluto', element: 'Water', degree: 20 }
  ]
}

export const _ELEMENTAL_WEIGHTS = {
  Fire: 1,
  Water: 1,
  Earth: 1,
  Air: 1
}

/**
 * Enhanced elemental characteristics with comprehensive properties
 */
export const _ELEMENTAL_CHARACTERISTICS = {
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
    cookingTechniques: [
      'Quick steaming',
      'Flash cooking',
      'Raw preparations',
      'Infusing',
      'Whipping'
    ],
    flavorProfiles: ['Light', 'Aromatic', 'Herbaceous', 'Bright', 'Fresh'],
    seasonalAssociations: ['Spring', 'Dawn'],
    healthBenefits: ['Mental clarity', 'Respiratory support', 'Digestive lightness'],
    complementaryIngredients: ['Fresh herbs', 'Citrus', 'Sprouts', 'Greens', 'Aromatics'],
    moodEffects: ['Uplifting', 'Clarifying', 'Refreshing', 'Invigorating', 'Inspiring'],
    culinaryHerbs: ['Mint', 'Basil', 'Cilantro', 'Dill', 'Lemongrass'],
    timeOfDay: ['Morning', 'Sunrise'],
    tastes: ['sour', 'tangy', 'astringent'],
    cuisine: ['vietnamese', 'greek', 'levantine', 'persian'],
    effects: ['lightening', 'clarifying', 'refreshing']
  }
}
