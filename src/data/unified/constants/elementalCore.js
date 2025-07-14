/**
 * Core elemental constants - consolidated from multiple files
 * This file replaces: elementalConstants.ts, elements.ts, and elemental parts of defaults.ts
 */
// ===== CORE ELEMENT DEFINITIONS =====
/**
 * List of all elemental types
 */
export const ELEMENTS = ['Fire', 'Earth', 'Air', 'Water'];
/**
 * Default balanced elemental properties (25% each)
 */
export const DEFAULT_ELEMENTAL_PROPERTIES = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
};
// ===== ELEMENTAL RELATIONSHIPS =====
/**
 * Element affinities based on traditional correspondences
 * Each element reinforces itself most strongly
 */
export const ELEMENT_AFFINITIES = { Fire: ['Fire', 'Air'],
    Water: ['Water', 'Earth'],
    Air: ['Air', 'Fire'],
    Earth: ['Earth', 'Water']
};
/**
 * Element combinations for compatibility calculations
 */
export const ELEMENT_COMBINATIONS = {
    harmonious: [
        ['Fire', 'Fire'],
        ['Water', 'Water'],
        ['Earth', 'Earth'],
        ['Air', 'Air'],
        ['Fire', 'Air'],
        ['Water', 'Earth']
    ],
    complementary: [
        ['Fire', 'Earth'],
        ['Air', 'Water']
    ]
};
// ===== ZODIAC CORRESPONDENCES =====
/**
 * Zodiac sign to element mapping
 */
export const ZODIAC_ELEMENTS = {
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
};
/**
 * Decan rulers for each zodiac sign
 */
export const DECANS = {
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
};
// ===== VALIDATION AND THRESHOLDS =====
/**
 * Validation thresholds for elemental properties
 */
export const VALIDATION_THRESHOLDS = {
    MINIMUM_ELEMENT: 0,
    MAXIMUM_ELEMENT: 1,
    BALANCE_PRECISION: 0.01
};
/**
 * Elemental significance thresholds
 */
export const ELEMENTAL_THRESHOLDS = {
    dominant: 0.4,
    significant: 0.25,
    present: 0.1,
    trace: 0.05
};
/**
 * Elemental weights for calculations
 */
export const ELEMENTAL_WEIGHTS = { Fire: 1, Water: 1, Earth: 1, Air: 1
};
// ===== COMPREHENSIVE ELEMENTAL CHARACTERISTICS =====
/**
 * Enhanced elemental characteristics with comprehensive properties
 */
export const ELEMENTAL_CHARACTERISTICS = { Fire: {
        // Basic properties
        qualities: ['hot', 'dry', 'active', 'energetic', 'expansive'],
        season: 'summer',
        direction: 'south',
        energy: 'expansive',
        colors: ['red', 'orange', 'yellow'],
        // Culinary properties
        taste: ['spicy', 'bitter'],
        foods: ['spicy', 'grilled', 'roasted', 'peppers', 'ginger', 'garlic'],
        cookingTechniques: ['grilling', 'roasting', 'broiling', 'frying', 'flambé'],
        flavorProfiles: ['spicy', 'pungent', 'bitter', 'umami', 'smoky'],
        complementaryIngredients: ['chilis', 'garlic', 'onions', 'mustard seeds', 'black pepper'],
        culinaryHerbs: ['cayenne', 'chili', 'mustard', 'cumin', 'peppercorn'],
        cuisine: ['mexican', 'thai', 'cajun', 'szechuan', 'indian'],
        // Temporal associations
        seasonalAssociations: ['summer', 'peak day'],
        timeOfDay: ['noon', 'early afternoon'],
        // Effects and benefits
        keywords: ['energy', 'passion', 'transformation', 'vitality', 'action'],
        healthBenefits: ['metabolism boost', 'circulation improvement', 'immune strengthening'],
        moodEffects: ['energizing', 'stimulating', 'uplifting', 'motivating', 'passionate'],
        effects: ['stimulating', 'energizing', 'warming']
    },
    Water: {
        // Basic properties
        qualities: ['cold', 'wet', 'flowing', 'adaptable', 'receptive'],
        season: 'winter',
        direction: 'north',
        energy: 'contracting',
        colors: ['blue', 'black', 'deep purple'],
        // Culinary properties
        taste: ['salty', 'sweet'],
        foods: ['soups', 'steamed', 'hydrating', 'seafood', 'fruits', 'broths'],
        cookingTechniques: ['poaching', 'steaming', 'simmering', 'blending', 'marinating'],
        flavorProfiles: ['sweet', 'salty', 'subtle', 'soothing', 'mellow'],
        complementaryIngredients: ['berries', 'melon', 'cucumber', 'coconut', 'seaweed'],
        culinaryHerbs: ['lavender', 'chamomile', 'fennel', 'dill', 'cucumber'],
        cuisine: ['japanese', 'cantonese', 'scandinavian', 'oceanic'],
        // Temporal associations
        seasonalAssociations: ['winter', 'night'],
        timeOfDay: ['evening', 'night', 'twilight'],
        // Effects and benefits
        keywords: ['emotional', 'intuitive', 'nurturing', 'healing', 'connecting'],
        healthBenefits: ['hydration', 'emotional balance', 'detoxification', 'cooling'],
        moodEffects: ['calming', 'soothing', 'introspective', 'healing', 'nurturing'],
        effects: ['cooling', 'calming', 'hydrating']
    },
    Earth: {
        // Basic properties
        qualities: ['cold', 'dry', 'stable', 'solid', 'grounding'],
        season: 'autumn',
        direction: 'west',
        energy: 'stabilizing',
        colors: ['brown', 'green', 'gold'],
        // Culinary properties
        taste: ['sweet', 'sour'],
        foods: ['root vegetables', 'grains', 'hearty', 'legumes', 'nuts', 'seeds'],
        cookingTechniques: ['baking', 'slow cooking', 'braising', 'pressure cooking', 'fermenting'],
        flavorProfiles: ['rich', 'dense', 'umami', 'earthy', 'complex'],
        complementaryIngredients: ['mushrooms', 'potatoes', 'lentils', 'brown rice', 'squash'],
        culinaryHerbs: ['thyme', 'rosemary', 'sage', 'bay leaf', 'black truffle'],
        cuisine: ['french', 'german', 'russian', 'mediterranean'],
        // Temporal associations
        seasonalAssociations: ['late summer', 'autumn', 'harvest time'],
        timeOfDay: ['late afternoon', 'early evening'],
        // Effects and benefits
        keywords: ['grounding', 'practical', 'material', 'reliable', 'structured'],
        healthBenefits: ['digestive support', 'nutritional density', 'sustained energy'],
        moodEffects: ['stabilizing', 'grounding', 'comforting', 'satisfying', 'nourishing'],
        effects: ['grounding', 'stabilizing', 'nourishing']
    },
    Air: {
        // Basic properties
        qualities: ['hot', 'wet', 'mobile', 'light', 'communicative'],
        season: 'spring',
        direction: 'east',
        energy: 'moving',
        colors: ['white', 'light blue', 'silver'],
        // Culinary properties
        taste: ['pungent', 'astringent'],
        foods: ['light', 'raw', 'fresh', 'salads', 'sprouts', 'herbs'],
        cookingTechniques: ['quick steaming', 'flash cooking', 'raw preparations', 'infusing', 'whipping'],
        flavorProfiles: ['light', 'aromatic', 'herbaceous', 'bright', 'fresh'],
        complementaryIngredients: ['fresh herbs', 'citrus', 'sprouts', 'greens', 'aromatics'],
        culinaryHerbs: ['mint', 'basil', 'cilantro', 'dill', 'lemongrass'],
        cuisine: ['vietnamese', 'greek', 'levantine', 'persian'],
        // Temporal associations
        seasonalAssociations: ['spring', 'dawn'],
        timeOfDay: ['morning', 'sunrise'],
        // Effects and benefits
        keywords: ['intellectual', 'communication', 'social', 'movement', 'connection'],
        healthBenefits: ['mental clarity', 'respiratory support', 'digestive lightness'],
        moodEffects: ['uplifting', 'clarifying', 'refreshing', 'invigorating', 'inspiring'],
        effects: ['lightening', 'clarifying', 'refreshing']
    }
};
// ===== UTILITY FUNCTIONS =====
/**
 * Get the dominant element from elemental properties
 */
export const getDominantElement = (properties) => {
    return Object.entries(properties)
        .reduce((max, [element, value]) => value > max.value ? { element: element, value } : max, { element: 'Fire', value: 0 }).element;
}
/**
 * Normalize elemental properties to sum to 1
 */
export const normalizeElementalProperties = (properties) => {
    const total = Object.values(properties).reduce((sum, val) => sum + (val || 0), 0);
    if (total === 0) {
        return { ...DEFAULT_ELEMENTAL_PROPERTIES };
    }
    return { Fire: (properties.Fire || 0) / total, Water: (properties.Water || 0) / total, Earth: (properties.Earth || 0) / total, Air: (properties.Air || 0) / total
    };
}
/**
 * Calculate elemental compatibility between two sets of properties
 */
export const calculateElementalCompatibility = (properties1, properties2) => {
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
 * Validate elemental properties
 */
export const validateElementalProperties = (properties) => {
    const total = Object.values(properties).reduce((sum, val) => sum + val, 0);
    const isValidRange = Object.values(properties).every(val => val >= VALIDATION_THRESHOLDS.MINIMUM_ELEMENT &&
        val <= VALIDATION_THRESHOLDS.MAXIMUM_ELEMENT);
    const isValidSum = Math.abs(total - 1) <= VALIDATION_THRESHOLDS.BALANCE_PRECISION;
    return isValidRange && isValidSum;
}
