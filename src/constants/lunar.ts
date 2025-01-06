export const LUNAR_PHASES = {
  new: {
    elementalModifier: {
      Fire: 0.1,
      Water: 0.4,
      Air: 0.1,
      Earth: 0.4
    },
    qualities: ['introspective', 'beginning'],
    duration: 1,
    enhancedCategories: ['seeds', 'sprouts', 'root vegetables'],
    cookingMethods: ['simple cooking', 'sprouting', 'fermenting']
  },
  waxingCrescent: {
    elementalModifier: {
      Fire: 0.2,
      Water: 0.3,
      Air: 0.3,
      Earth: 0.2
    },
    qualities: ['building', 'expanding'],
    duration: 6.5,
    enhancedCategories: ['leafy greens', 'fresh herbs', 'young vegetables'],
    cookingMethods: ['light steaming', 'quick cooking', 'infusing']
  },
  firstQuarter: {
    elementalModifier: {
      Fire: 0.3,
      Water: 0.2,
      Air: 0.3,
      Earth: 0.2
    },
    qualities: ['active', 'manifesting'],
    duration: 1,
    enhancedCategories: ['fruits', 'flowers', 'above-ground vegetables'],
    cookingMethods: ['sautéing', 'stir-frying', 'grilling']
  },
  // ... continues with all lunar phases
};

export const LUNAR_CYCLE = {
  averageDuration: 29.53059, // days
  phases: ['new', 'waxingCrescent', 'firstQuarter', 'waxingGibbous', 
          'full', 'waningGibbous', 'lastQuarter', 'waningCrescent'],
  elementalInfluence: {
    strengthMultiplier: 0.15, // 15% influence on elemental balance
    peakDuration: 3 // days around full/new moon where influence is strongest
  }
};
