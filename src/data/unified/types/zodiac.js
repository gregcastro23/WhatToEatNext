"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getZodiacCompatibility = exports.getModalityCompatibility = exports.createZodiacAffinity = exports.DEFAULT_ZODIAC_AFFINITY = exports.ZODIAC_MODALITIES = exports.elementalCharacteristics = exports.elementalCompatibility = exports.getElementalAffinity = exports.getZodiacSign = exports.zodiacElements = exports.zodiacDateRanges = void 0;
// Zodiac Date Ranges
exports.zodiacDateRanges = {
    aries: { startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
    taurus: { startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
    gemini: { startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
    cancer: { startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
    leo: { startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
    virgo: { startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
    libra: { startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
    scorpio: { startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
    sagittarius: { startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
    capricorn: { startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
    aquarius: { startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
    pisces: { startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 }
};
// Zodiac Elements
exports.zodiacElements = {
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
// Helper Functions
const getZodiacSign = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    for (const [sign, range] of Object.entries(exports.zodiacDateRanges)) {
        const { startMonth, startDay, endMonth, endDay } = range;
        if ((month === startMonth && day >= startDay) ||
            (month === endMonth && day <= endDay)) {
            return sign;
        }
    }
    // Default to capricorn if no match (shouldn't happen with proper ranges)
    return 'capricorn';
};
exports.getZodiacSign = getZodiacSign;
const getElementalAffinity = (sign) => {
    return exports.zodiacElements[sign];
};
exports.getElementalAffinity = getElementalAffinity;
// Elemental Compatibility
exports.elementalCompatibility = { Fire: {
        compatible: ['Fire'],
        incompatible: ['Air', 'Water', 'Earth']
    },
    Earth: {
        compatible: ['Earth'],
        incompatible: ['Fire', 'Air', 'Water']
    },
    Air: {
        compatible: ['Air'],
        incompatible: ['Earth', 'Water', 'Fire']
    },
    Water: {
        compatible: ['Water'],
        incompatible: ['Fire', 'Air', 'Earth']
    }
};
// Element Characteristics
exports.elementalCharacteristics = { Fire: {
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
        timeOfDay: ['Noon', 'Early afternoon']
    },
    Earth: {
        qualities: ['Cool', 'Dry', 'Stable', 'Solid', 'Grounding'],
        keywords: ['Grounding', 'Practical', 'Material', 'Reliable', 'Structured'],
        foods: ['Root vegetables', 'Grains', 'Hearty', 'Legumes', 'Nuts', 'Seeds'],
        cookingTechniques: ['Baking', 'Slow cooking', 'Braising', 'Pressure cooking', 'Fermenting'],
        flavorProfiles: ['Rich', 'Dense', 'Umami', 'earthy', 'Complex'],
        seasonalAssociations: ['Late Summer', 'Autumn', 'Harvest time'],
        healthBenefits: ['Digestive support', 'Nutritional density', 'Sustained energy'],
        complementaryIngredients: ['Mushrooms', 'Potatoes', 'Lentils', 'Brown rice', 'Squash'],
        moodEffects: ['Stabilizing', 'Grounding', 'Comforting', 'Satisfying', 'Nourishing'],
        culinaryHerbs: ['Thyme', 'Rosemary', 'Sage', 'Bay leaf', 'Black truffle'],
        timeOfDay: ['Late afternoon', 'Early evening']
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
        timeOfDay: ['Morning', 'Sunrise']
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
        timeOfDay: ['Evening', 'Night', 'Twilight']
    }
};
/**
 * Mapping of zodiac signs to their modalities
 */
exports.ZODIAC_MODALITIES = {
    aries: 'cardinal',
    cancer: 'cardinal',
    libra: 'cardinal',
    capricorn: 'cardinal',
    taurus: 'fixed',
    leo: 'fixed',
    scorpio: 'fixed',
    aquarius: 'fixed',
    gemini: 'mutable',
    virgo: 'mutable',
    sagittarius: 'mutable',
    pisces: 'mutable'
};
/**
 * Default neutral affinity values for all zodiac signs
 * NOTE: For type safety only. Do NOT use for live calculations or UI. Always use real calculated values.
 */
exports.DEFAULT_ZODIAC_AFFINITY = {
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
    pisces: 0
};
/**
 * Helper function to create zodiac affinity with default values
 * Only specified signs will have non-zero values
 */
function createZodiacAffinity(affinities) {
    return {
        ...exports.DEFAULT_ZODIAC_AFFINITY,
        ...affinities
    };
}
exports.createZodiacAffinity = createZodiacAffinity;
/**
 * Get the modality compatibility score between two zodiac signs
 * Signs of the same modality have the highest compatibility
 */
function getModalityCompatibility(sign1, sign2) {
    const modality1 = exports.ZODIAC_MODALITIES[sign1];
    const modality2 = exports.ZODIAC_MODALITIES[sign2];
    if (modality1 === modality2) {
        return 0.8; // Same modality: high compatibility
    }
    // Different modalities have good compatibility (following elemental principles)
    const modalityCompatibilityChart = {
        cardinal: { cardinal: 0.8, fixed: 0.7, mutable: 0.7 },
        fixed: { cardinal: 0.7, fixed: 0.8, mutable: 0.7 },
        mutable: { cardinal: 0.7, fixed: 0.7, mutable: 0.8 }
    };
    return modalityCompatibilityChart[modality1][modality2];
}
exports.getModalityCompatibility = getModalityCompatibility;
/**
 * Calculates affinity between two zodiac signs based on elemental self-reinforcement
 * Same elements have highest compatibility, all combinations work well together
 */
function getZodiacCompatibility(sign1, sign2) {
    const elementMap = {
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
    // Following elemental self-reinforcement principles
    const elementCompatibilityChart = { Fire: { Fire: 0.9, Earth: 0.7, Air: 0.7, Water: 0.7 },
        Earth: { Fire: 0.7, Earth: 0.9, Air: 0.7, Water: 0.7 },
        Air: { Fire: 0.7, Earth: 0.7, Air: 0.9, Water: 0.7 },
        Water: { Fire: 0.7, Earth: 0.7, Air: 0.7, Water: 0.9 }
    };
    const element1 = elementMap[sign1];
    const element2 = elementMap[sign2];
    // Get element compatibility
    const elementCompatibility = elementCompatibilityChart[element1][element2];
    // Get modality compatibility
    const modalityCompatibility = getModalityCompatibility(sign1, sign2);
    // Combine element and modality compatibility (weighted average)
    return (elementCompatibility * 0.6) + (modalityCompatibility * 0.4);
}
exports.getZodiacCompatibility = getZodiacCompatibility;
