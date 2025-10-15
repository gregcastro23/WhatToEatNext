export const _SEASONAL_PROPERTIES = {
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

export const _SEASONAL_TRANSITIONS = {
  daysPerTransition: 21, // 3 weeks of transition between seasons
  transitionPoints: {
    springToSummer: { month: 5, day: 15 }, // June 15
    summerToFall: { month: 8, day: 15 }, // September 15
    fallToWinter: { month: 11, day: 15 }, // December 15
    winterToSpring: { month: 2, day: 15 } // March 15
  }
};

export const VALID_SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'] as const;
export type Season = (typeof VALID_SEASONS)[number];

// Date ranges for each season
export const _SEASON_DATE_RANGES = {
  spring: { startMonth: 2, startDay: 15, endMonth: 5, endDay: 14 }, // Feb 15 - May 14
  summer: { startMonth: 5, startDay: 15, endMonth: 8, endDay: 14 }, // May 15 - Aug 14
  autumn: { startMonth: 8, startDay: 15, endMonth: 11, endDay: 14 }, // Aug 15 - Nov 14
  fall: { startMonth: 8, startDay: 15, endMonth: 11, endDay: 14 }, // Alias for autumn
  winter: { startMonth: 11, startDay: 15, endMonth: 2, endDay: 14 } // Nov 15 - Feb 14
};
