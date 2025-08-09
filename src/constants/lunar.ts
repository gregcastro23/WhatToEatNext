export const LUNAR_PHASES = {
  new: {
    elementalModifier: {
      Fire: 0.1,
      Water: 0.4,
      Air: 0.1,
      Earth: 0.4,
    },
    qualities: ['introspective', 'beginning'],
    duration: 1,
    enhancedCategories: ['seeds', 'sprouts', 'root vegetables'],
    cookingMethods: ['simple cooking', 'sprouting', 'fermenting'],
  },
  waxingCrescent: {
    elementalModifier: {
      Fire: 0.2,
      Water: 0.3,
      Air: 0.3,
      Earth: 0.2,
    },
    qualities: ['building', 'expanding'],
    duration: 6.5,
    enhancedCategories: ['leafy greens', 'fresh herbs', 'young vegetables'],
    cookingMethods: ['light steaming', 'quick cooking', 'infusing'],
  },
  firstQuarter: {
    elementalModifier: {
      Fire: 0.3,
      Water: 0.2,
      Air: 0.3,
      Earth: 0.2,
    },
    qualities: ['active', 'manifesting'],
    duration: 1,
    enhancedCategories: ['fruits', 'flowers', 'above-ground vegetables'],
    cookingMethods: ['sautéing', 'stir-frying', 'grilling'],
  },
  // ... continues with all lunar phases
};

export const LUNAR_CYCLE = {
  averageDuration: 29.53059, // days
  phases: [
    'new',
    'waxingCrescent',
    'firstQuarter',
    'waxingGibbous',
    'full',
    'waningGibbous',
    'lastQuarter',
    'waningCrescent',
  ],
  elementalInfluence: {
    strengthMultiplier: 0.15, // 15% influence on elemental balance
    peakDuration: 3, // days around full/new moon where influence is strongest
  },
};

// Lunar days information
export const LUNAR_DAYS = {
  total: 30, // Traditional lunar calendar has 30 days
  favorableDays: [3, 5, 8, 11, 13, 16, 18, 21, 23, 24, 26, 29],
  challengingDays: [4, 7, 9, 12, 14, 19, 22, 27],
  neutralDays: [1, 2, 6, 10, 15, 17, 20, 25, 28, 30],
  energyPatterns: {
    growing: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    waning: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
  },
};
