'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.formatelementalState =
  exports.getNutritionalSynergy =
  exports.getFlavorBoost =
  exports.getLunarPhaseBoost =
  exports.getZodiacBoost =
  exports.getDignityMultiplier =
  exports.calculatePlanetaryBoost =
  exports.planetaryFoodAssociations =
    void 0;
exports.planetaryFoodAssociations = {
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
    foodCategories: ['Vegetables', 'DAiry', 'Seafood'],
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
    foodCategories: ['Fruits', 'Sweets', 'DAiry'],
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
    qualities: ['spiritual', 'Subtle'],
    foodCategories: ['Simple foods', 'Healing herbs', 'Purifying ingredients'],
    specificFoods: ['Healing teas', 'Cleansing herbs', 'Simple grains', 'Pure water'],
    cuisines: ['Ascetic', 'Monastic', 'Purifying'],
    elementalBoost: { Fire: 0.2, Water: 0.2 },
  },
};
/**
 * Calculate planetary boost for an ingredient based on current astrological state
 */
const calculatePlanetaryBoost = (
  item, // ElementalItem type
  planetPositions,
  currentZodiac,
  lunarPhase,
) => {
  let boost = 0;
  const dominantPlanets = [];
  const dignities = {};
  // Planetary position calculations
  Object.entries(planetPositions).forEach(([_planet, _position]) => {
    const planetInfo = exports.planetaryFoodAssociations[planet];
    if (!planetInfo) return;
    // Basic planetary boost
    const baseBoost = planetInfo.boostValue || 0.1;
    boost += baseBoost;
    // Add planet to dominant list if significant
    if (baseBoost > 0.2) {
      dominantPlanets.push(planet);
      // Add dignity information for dominant planets
      dignities[planet] = {
        type: 'Neutral',
        strength: baseBoost,
        favorableZodiacSigns: currentZodiac ? [currentZodiac] : [],
      };
    }
  });
  // Zodiac sign boost if available
  if (currentZodiac) {
    boost += (0, exports.getZodiacBoost)(currentZodiac, item);
  }
  // Lunar phase boost if available
  if (lunarPhase) {
    boost += (0, exports.getLunarPhaseBoost)(lunarPhase);
  }
  return {
    boost: parseFloat(boost.toFixed(2)),
    dominantPlanets: Array.from(new Set(dominantPlanets)),
    dignities,
  };
};
exports.calculatePlanetaryBoost = calculatePlanetaryBoost;
// Helper functions for calculations
const _ = _zodiacSign => {
  // Implementation depends on your zodiac mappings
  return ['Sun', 'Mars', 'Jupiter'];
};
const _getSeasonalMultiplier = () => {
  // Implementation depends on your seasonal logic
  return 1.0;
};
/**
 * Get dignity multiplier for calculations
 */
const getDignityMultiplier = dignity => {
  const multipliers = {
    Domicile: 1.5,
    Exaltation: 1.3,
    Triplicity: 1.2,
    Term: 1.1,
    Face: 1.05,
    Mooltrikona: 1.4,
    Nakshatra: 1.25,
    Detriment: 0.7,
    fall: 0.5,
    Neutral: 1.0,
  };
  return multipliers[dignity] || 1.0;
};
exports.getDignityMultiplier = getDignityMultiplier;
/**
 * Get zodiac boost based on elemental properties
 */
const getZodiacBoost = (zodiacSign, item) => {
  // Get zodiac sign element
  const zodiacElements = {
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
  if (!item.elementalProperties) {
    return 0.1; // Minimum boost if no elemental data
  }
  // Calculate boost based on elemental affinity
  // Higher boost if the cuisine's dominant element matches the zodiac element
  const elementValue = item.elementalProperties[zodiacElement] || 0;
  const elementBoost = elementValue * 0.8; // Scale based on how strong the element is
  // Check if cuisine explicitly lists this zodiac sign as favorable
  const zodiacBoost = item.zodiacInfluences?.includes(normalizedSign) ? 0.3 : 0;
  // Apply modality boost based on cardinal/fixed/mutable qualities
  let modalityBoost = 0;
  const cardinalSigns = ['aries', 'cancer', 'libra', 'capricorn'];
  const fixedSigns = ['taurus', 'leo', 'scorpio', 'aquarius'];
  // If not cardinal or fixed, it's mutable (gemini, virgo, sagittarius, pisces)
  if (cardinalSigns.includes(normalizedSign)) {
    // Cardinal signs prefer bold, distinctive cuisines
    modalityBoost = (item.elementalProperties['Fire'] || 0) * 0.2;
  } else if (fixedSigns.includes(normalizedSign)) {
    // Fixed signs prefer substantial, traditional cuisines
    modalityBoost = (item.elementalProperties['Earth'] || 0) * 0.2;
  } else {
    // Mutable signs prefer adaptable, fusion cuisines
    modalityBoost = (item.elementalProperties['Air'] || 0) * 0.2;
  }
  // Calculate seasonal alignment (certain cuisines are better aligned with seasons)
  const seasonalBoost = calculateSeasonalAlignment(normalizedSign, item) * 0.15;
  // Combine all boost factors
  const totalBoost = elementBoost + zodiacBoost + modalityBoost + seasonalBoost;
  // Return normalized boost value (0-1 range)
  return Math.min(0.7, Math.max(0.1, totalBoost));
};
exports.getZodiacBoost = getZodiacBoost;
// Helper function to calculate seasonal alignment
const calculateSeasonalAlignment = (zodiacSign, item) => {
  // Map zodiac signs to seasons
  const seasonMap = {
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
  const seasonalElements = {
    spring: 'Air',
    summer: 'Fire',
    autumn: 'Earth',
    winter: 'Water',
  };
  const seasonalElement = seasonalElements[season];
  // Calculate alignment based on the cuisine's elemental properties
  // Higher value if the cuisine aligns with the season's element
  return item.elementalProperties[seasonalElement] || 0.1;
};
/**
 * Calculate boost based on lunar phase
 */
const getLunarPhaseBoost = lunarPhase => {
  // New calculation based on lunar phase energy patterns
  // Different lunar phases enhance different elemental and alchemical properties
  // Map lunar phases to elemental and alchemical influences
  const lunarInfluences = {
    'new moon': any,
    'waxing crescent': any,
    'first quarter': any,
    'waxing gibbous': any,
    'full moon': any,
    'waning gibbous': any,
    'last quarter': any,
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
  return 0.15 + influence.intensity * 0.25;
};
exports.getLunarPhaseBoost = getLunarPhaseBoost;
/**
 * Get flavor boost from planetary associations
 */
const getFlavorBoost = (_planet, _ingredient) => {
  const elementBoost = exports.planetaryFoodAssociations[planet].elementalBoost || {};
  return Object.entries(elementBoost).reduce((acc, [element, boost]) => {
    return acc + (ingredient.elementalProperties?.[element] || 0) * (boost || 0);
  }, 0);
};
exports.getFlavorBoost = getFlavorBoost;
/**
 * Get nutritional synergy between ingredient and planet
 */
const getNutritionalSynergy = (_planet, _ingredient) => {
  // Implementation depends on your nutritional data
  return [];
};
exports.getNutritionalSynergy = getNutritionalSynergy;
/**
 * Format elemental balance for display
 */
const formatelementalState = elements => {
  const validEntries = Object.entries(elements)
    .filter(([_, val]) => Number.isFinite(val))
    .map(([elem, val]) => `${elem} ${Math.round((val || 0) * 100)}%`)
    .join(' · ');
  return validEntries;
};
exports.formatelementalState = formatelementalState;
exports.default = exports.planetaryFoodAssociations;
