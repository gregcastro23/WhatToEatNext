'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.applySeasonalModifier =
  exports.getSeasonForZodiacSign =
  exports.getZodiacSignsForSeason =
  exports.calculateSeasonalCompatibility =
  exports.getSeasonalModifier =
  exports.getCurrentSeason =
  exports.VALIDATION_THRESHOLDS =
  exports.SEASONAL_INFLUENCE =
  exports.SEASON_DATE_RANGES =
  exports.SEASONAL_TRANSITIONS =
  exports.SEASONAL_PROPERTIES =
  exports.ZODIAC_SEASONS =
  exports.BALANCED_ELEMENTS =
  exports.SEASONAL_MODIFIERS =
  exports.SCORE_THRESHOLDS =
  exports.VALID_SEASONS =
    void 0;
/**
 * Core seasonal constants - consolidated from multiple files
 * This file replaces: seasonalConstants.ts, seasonalModifiers.ts, and seasons.ts
 */
// ===== CORE SEASON DEFINITIONS =====
/**
 * Valid seasons
 */
exports.VALID_SEASONS = ['spring', 'summer', 'autumn', 'winter', 'fall', 'all'];
/**
 * Score thresholds for seasonal compatibility
 */
exports.SCORE_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  MODERATE: 40,
  POOR: 20,
};
// ===== SEASONAL ELEMENTAL MODIFIERS =====
/**
 * Elemental modifiers for each season
 * Each season emphasizes certain elements over others
 */
exports.SEASONAL_MODIFIERS = {
  spring: {
    Air: 0.4,
    Water: 0.3,
    Earth: 0.2,
    Fire: 0.1, // Minimal - gentle warmth
  },
  summer: {
    Fire: 0.4,
    Air: 0.3,
    Water: 0.2,
    Earth: 0.1, // Minimal - stability
  },
  autumn: {
    Earth: 0.4,
    Air: 0.3,
    Fire: 0.2,
    Water: 0.1, // Minimal - preparation for winter
  },
  winter: {
    Water: 0.4,
    Earth: 0.3,
    Fire: 0.2,
    Air: 0.1, // Minimal - stillness
  },
  fall: {
    Earth: 0.4,
    Air: 0.3,
    Fire: 0.2,
    Water: 0.1,
  },
  all: { Fire: 0.25, Air: 0.25, Water: 0.25, Earth: 0.25 },
};
/**
 * Balanced elemental properties for reference
 */
exports.BALANCED_ELEMENTS = { Fire: 0.25, Air: 0.25, Water: 0.25, Earth: 0.25 };
// ===== ZODIAC SEASONAL ASSOCIATIONS =====
/**
 * Zodiac signs associated with each season
 */
exports.ZODIAC_SEASONS = {
  spring: ['aries', 'taurus', 'gemini'],
  summer: ['cancer', 'leo', 'virgo'],
  autumn: ['libra', 'scorpio', 'sagittarius'],
  winter: ['capricorn', 'aquarius', 'pisces'],
  fall: ['libra', 'scorpio', 'sagittarius'],
  all: [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces',
  ],
};
// ===== COMPREHENSIVE SEASONAL PROPERTIES =====
/**
 * Detailed seasonal properties including culinary and energetic aspects
 */
exports.SEASONAL_PROPERTIES = {
  spring: {
    elementalModifier: exports.SEASONAL_MODIFIERS.spring,
    qualities: ['ascending', 'expanding', 'growing', 'fresh'],
    peak: { month: 4, day: 1 },
    // Culinary properties
    enhancedCategories: ['leafy greens', 'sprouts', 'herbs', 'young vegetables'],
    diminishedCategories: ['roots', 'preserved foods', 'heavy proteins'],
    cookingMethods: ['steaming', 'light sautéing', 'raw preparations'],
    flavorProfiles: ['fresh', 'light', 'green', 'cleansing'],
    // Energetic properties
    energy: 'ascending',
    direction: 'east',
    timeOfDay: 'dawn',
    colors: ['light green', 'yellow', 'pale pink'],
    // Health and mood
    healthFocus: ['detoxification', 'liver support', 'energy renewal'],
    moodEffects: ['optimistic', 'energizing', 'creative', 'social'],
  },
  summer: {
    elementalModifier: exports.SEASONAL_MODIFIERS.summer,
    qualities: ['expansive', 'active', 'abundant', 'hot'],
    peak: { month: 7, day: 1 },
    // Culinary properties
    enhancedCategories: ['fruits', 'cooling herbs', 'raw foods', 'light proteins'],
    diminishedCategories: ['warming spices', 'heavy soups', 'roasted foods'],
    cookingMethods: ['grilling', 'raw preparations', 'light cooking'],
    flavorProfiles: ['sweet', 'cooling', 'refreshing', 'bright'],
    // Energetic properties
    energy: 'expansive',
    direction: 'south',
    timeOfDay: 'noon',
    colors: ['bright red', 'orange', 'golden yellow'],
    // Health and mood
    healthFocus: ['cooling', 'hydration', 'heart health'],
    moodEffects: ['joyful', 'active', 'social', 'confident'],
  },
  autumn: {
    elementalModifier: exports.SEASONAL_MODIFIERS.autumn,
    qualities: ['contracting', 'descending', 'harvesting', 'grounding'],
    peak: { month: 10, day: 1 },
    // Culinary properties
    enhancedCategories: ['roots', 'grains', 'mushrooms', 'warming spices'],
    diminishedCategories: ['raw foods', 'tropical fruits', 'cooling herbs'],
    cookingMethods: ['roasting', 'braising', 'slow cooking'],
    flavorProfiles: ['rich', 'warming', 'earthy', 'complex'],
    // Energetic properties
    energy: 'contracting',
    direction: 'west',
    timeOfDay: 'sunset',
    colors: ['deep orange', 'brown', 'gold'],
    // Health and mood
    healthFocus: ['immune support', 'digestive strength', 'grounding'],
    moodEffects: ['contemplative', 'grounding', 'introspective', 'grateful'],
  },
  winter: {
    elementalModifier: exports.SEASONAL_MODIFIERS.winter,
    qualities: ['contracting', 'storing', 'deep', 'still'],
    peak: { month: 1, day: 1 },
    // Culinary properties
    enhancedCategories: ['preserved foods', 'warming spices', 'broths', 'root vegetables'],
    diminishedCategories: ['raw foods', 'cooling herbs', 'light proteins'],
    cookingMethods: ['slow cooking', 'stewing', 'warming preparations'],
    flavorProfiles: ['warming', 'rich', 'nourishing', 'deep'],
    // Energetic properties
    energy: 'contracting',
    direction: 'north',
    timeOfDay: 'midnight',
    colors: ['deep blue', 'black', 'white'],
    // Health and mood
    healthFocus: ['kidney support', 'deep nourishment', 'rest'],
    moodEffects: ['introspective', 'calm', 'deep', 'restorative'],
  },
};
// ===== SEASONAL TRANSITIONS =====
/**
 * Seasonal transition periods and dates
 */
exports.SEASONAL_TRANSITIONS = {
  daysPerTransition: 21,
  transitionPoints: {
    springToSummer: { month: 5, day: 15 },
    summerToAutumn: { month: 8, day: 15 },
    autumnToWinter: { month: 11, day: 15 },
    winterToSpring: { month: 2, day: 15 }, // March 15
  },
};
/**
 * Date ranges for each season
 */
exports.SEASON_DATE_RANGES = {
  spring: { startMonth: 2, startDay: 15, endMonth: 5, endDay: 14 },
  summer: { startMonth: 5, startDay: 15, endMonth: 8, endDay: 14 },
  autumn: { startMonth: 8, startDay: 15, endMonth: 11, endDay: 14 },
  fall: { startMonth: 8, startDay: 15, endMonth: 11, endDay: 14 },
  winter: { startMonth: 11, startDay: 15, endMonth: 2, endDay: 14 }, // Nov 15 - Feb 14
};
// ===== SEASONAL INFLUENCE SYSTEM =====
/**
 * Influence of seasonal factors on food preferences and energy levels
 */
exports.SEASONAL_INFLUENCE = {
  // Each season's influence strength (0-1)
  strength: {
    spring: 0.7,
    summer: 0.9,
    autumn: 0.6,
    winter: 0.8,
  },
  // How seasons affect mood and energy
  energyModifier: {
    spring: { vitality: 0.8, creativity: 0.7, stability: 0.4, adaptability: 0.6 },
    summer: { vitality: 0.9, creativity: 0.8, stability: 0.3, adaptability: 0.7 },
    autumn: { vitality: 0.6, creativity: 0.6, stability: 0.6, adaptability: 0.5 },
    winter: { vitality: 0.4, creativity: 0.5, stability: 0.7, adaptability: 0.4 },
  },
};
// ===== VALIDATION THRESHOLDS =====
/**
 * Validation thresholds for seasonal calculations
 */
exports.VALIDATION_THRESHOLDS = {
  MINIMUM_ELEMENT: 0,
  MAXIMUM_ELEMENT: 1,
  BALANCE_PRECISION: 0.000001,
};
// ===== UTILITY FUNCTIONS =====
/**
 * Get current season based on date
 */
function getCurrentSeason(date = new Date()) {
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();
  // Check each season's date range
  for (const [season, range] of Object.entries(exports.SEASON_DATE_RANGES)) {
    if (season === 'fall') continue; // Skip alias
    const { startMonth, startDay, endMonth, endDay } = range;
    // Handle winter which spans year boundary
    if (season === 'winter') {
      if (
        (month === startMonth && day >= startDay) ||
        month > startMonth ||
        month < endMonth ||
        (month === endMonth && day <= endDay)
      ) {
        return season;
      }
    } else {
      // Handle other seasons
      if (
        (month === startMonth && day >= startDay) ||
        (month > startMonth && month < endMonth) ||
        (month === endMonth && day <= endDay)
      ) {
        return season;
      }
    }
  }
  return 'spring'; // Default fallback
}
exports.getCurrentSeason = getCurrentSeason;
/**
 * Get seasonal elemental modifier for a given season
 */
function getSeasonalModifier(season) {
  return exports.SEASONAL_MODIFIERS[season] || exports.BALANCED_ELEMENTS;
}
exports.getSeasonalModifier = getSeasonalModifier;
/**
 * Calculate seasonal compatibility between two seasons
 */
function calculateSeasonalCompatibility(season1, season2) {
  if (season1 === season2) return 1.0;
  if (season1 === 'all' || season2 === 'all') return 0.8;
  // Adjacent seasons have good compatibility
  const seasonOrder = ['spring', 'summer', 'autumn', 'winter'];
  const index1 = seasonOrder.indexOf(season1);
  const index2 = seasonOrder.indexOf(season2);
  if (index1 !== -1 && index2 !== -1) {
    const distance = Math.min(
      Math.abs(index1 - index2),
      4 - Math.abs(index1 - index2), // Circular distance
    );
    switch (distance) {
      case 0:
        return 1.0; // Same season
      case 1:
        return 0.7; // Adjacent seasons
      case 2:
        return 0.4; // Opposite seasons
      default:
        return 0.5; // Fallback
    }
  }
  return 0.5; // Default compatibility
}
exports.calculateSeasonalCompatibility = calculateSeasonalCompatibility;
/**
 * Get zodiac signs for a season
 */
function getZodiacSignsForSeason(season) {
  return exports.ZODIAC_SEASONS[season] || [];
}
exports.getZodiacSignsForSeason = getZodiacSignsForSeason;
/**
 * Get season for a zodiac sign
 */
function getSeasonForZodiacSign(sign) {
  for (const [season, signs] of Object.entries(exports.ZODIAC_SEASONS)) {
    if (signs.includes(sign)) {
      return season;
    }
  }
  return 'spring'; // Default fallback
}
exports.getSeasonForZodiacSign = getSeasonForZodiacSign;
/**
 * Apply seasonal modifier to elemental properties
 */
function applySeasonalModifier(baseProperties, season, strength = 0.5) {
  const modifier = getSeasonalModifier(season);
  return {
    Fire: baseProperties.Fire * (1 - strength) + modifier.Fire * strength,
    Water: baseProperties.Water * (1 - strength) + modifier.Water * strength,
    Earth: baseProperties.Earth * (1 - strength) + modifier.Earth * strength,
    Air: baseProperties.Air * (1 - strength) + modifier.Air * strength,
  };
}
exports.applySeasonalModifier = applySeasonalModifier;
exports.default = {
  VALID_SEASONS: exports.VALID_SEASONS,
  SCORE_THRESHOLDS: exports.SCORE_THRESHOLDS,
  SEASONAL_MODIFIERS: exports.SEASONAL_MODIFIERS,
  BALANCED_ELEMENTS: exports.BALANCED_ELEMENTS,
  ZODIAC_SEASONS: exports.ZODIAC_SEASONS,
  SEASONAL_PROPERTIES: exports.SEASONAL_PROPERTIES,
  SEASONAL_TRANSITIONS: exports.SEASONAL_TRANSITIONS,
  SEASON_DATE_RANGES: exports.SEASON_DATE_RANGES,
  SEASONAL_INFLUENCE: exports.SEASONAL_INFLUENCE,
  VALIDATION_THRESHOLDS: exports.VALIDATION_THRESHOLDS,
  getCurrentSeason,
  getSeasonalModifier,
  calculateSeasonalCompatibility,
  getZodiacSignsForSeason,
  getSeasonForZodiacSign,
  applySeasonalModifier,
};
