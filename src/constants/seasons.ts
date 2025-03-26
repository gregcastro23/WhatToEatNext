export const SEASONAL_PROPERTIES = {
  spring: {
    elementalModifier: {
      Fire: 0.2,
      Water: 0.3,
      Air: 0.4,
      Earth: 0.1
    },
    qualities: ['ascending', 'expanding'],
    peak: {
      month: 4, // May
      day: 1
    },
    enhancedCategories: ['leafy greens', 'sprouts', 'herbs'],
    diminishedCategories: ['roots', 'preserved foods', 'heavy proteins']
  },
  summer: {
    elementalModifier: {
      Fire: 0.4,
      Water: 0.2,
      Air: 0.3,
      Earth: 0.1
    },
    qualities: ['expansive', 'active'],
    peak: {
      month: 7, // August
      day: 1
    },
    enhancedCategories: ['fruits', 'cooling herbs', 'raw foods'],
    diminishedCategories: ['warming spices', 'heavy soups', 'roasted foods']
  },
  fall: {
    elementalModifier: {
      Fire: 0.1,
      Water: 0.2,
      Air: 0.3,
      Earth: 0.4
    },
    qualities: ['contracting', 'descending'],
    peak: {
      month: 10, // November
      day: 1
    },
    enhancedCategories: ['roots', 'grains', 'mushrooms'],
    diminishedCategories: ['raw foods', 'tropical fruits', 'cooling herbs']
  },
  winter: {
    elementalModifier: {
      Fire: 0.1,
      Water: 0.4,
      Air: 0.1,
      Earth: 0.4
    },
    qualities: ['contracting', 'storing'],
    peak: {
      month: 1, // February
      day: 1
    },
    enhancedCategories: ['preserved foods', 'warming spices', 'broths'],
    diminishedCategories: ['raw foods', 'cooling herbs', 'light proteins']
  }
};

export const SEASONAL_TRANSITIONS = {
  daysPerTransition: 21, // 3 weeks of transition between seasons
  transitionPoints: {
    springToSummer: { month: 5, day: 15 }, // June 15
    summerToFall: { month: 8, day: 15 },   // September 15
    fallToWinter: { month: 11, day: 15 },  // December 15
    winterToSpring: { month: 2, day: 15 }  // March 15
  }
};
