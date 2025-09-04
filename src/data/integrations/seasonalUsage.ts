import type { Season } from '@/types';

// Define cuisine type directly as an object to avoid import issues
const CuisineType = {
  GREEK: 'greek',
  ITALIAN: 'italian',
  FRENCH: 'french',
  INDIAN: 'indian',
  CHINESE: 'chinese',
  JAPANESE: 'japanese',
  THAI: 'thai',
  MEXICAN: 'mexican',
};

export const seasonalUsage = {
  spring: {
    growing: ['basil', 'oregano', 'thyme'],
    cuisines: {
      // Use string literal instead of enum reference
      greek: {
        combinations: ['mint + parsley', 'dill + garlic'],
        dishes: ['spring lamb', 'fresh salads'],
      },
      italian: {
        combinations: ['basil + tomato', 'pea + mint'],
        dishes: ['primavera pasta', 'spring risotto'],
      },
    },
    herbs: ['mint', 'chives', 'parsley', 'dill'],
    vegetables: ['asparagus', 'peas', 'artichokes', 'spring onions'],
    tarotAssociations: {
      minorArcana: [
        '2 of Wands',
        '3 of Wands',
        '4 of Wands',
        '5 of Pentacles',
        '6 of Pentacles',
        '7 of Pentacles',
        '8 of Swords',
        '9 of Swords',
        '10 of Swords',
      ],
      majorArcana: ['The Emperor', 'The Hierophant', 'The Lovers'],
      zodiacSigns: ['aries', 'taurus', 'gemini'],
      cookingRecommendations: [
        'Use energetic Fire elements (aries) for quick cooking methods like stir-frying and grilling',
        'Incorporate Earth elements (taurus) for grounding dishes with root vegetables',
        'Experiment with Air elements (gemini) for dishes with variety and contrast',
        'Balance bold flavors (2 of Wands) with fresh spring ingredients',
        'Consider fermentation and pickling for slower transformations (7 of Pentacles)',
      ],
    },
  },

  summer: {
    growing: ['basil', 'rosemary', 'cilantro'],
    cuisines: {
      greek: {
        combinations: ['cucumber + mint', 'tomato + feta'],
        dishes: ['tzatziki', 'greek salad', 'souvlaki'],
      },
      italian: {
        combinations: ['tomato + basil', 'zucchini + mint'],
        dishes: ['caprese salad', 'summer pasta', 'grilled vegetables'],
      },
    },
    herbs: ['basil', 'oregano', 'tarragon', 'cilantro'],
    vegetables: ['tomatoes', 'zucchini', 'eggplant', 'peppers'],
    tarotAssociations: {
      minorArcana: [
        '2 of Cups',
        '3 of Cups',
        '4 of Cups',
        '5 of Wands',
        '6 of Wands',
        '7 of Wands',
        '8 of Pentacles',
        '9 of Pentacles',
        '10 of Pentacles',
      ],
      majorArcana: ['The Chariot', 'Strength', 'The Hermit'],
      zodiacSigns: ['cancer', 'leo', 'virgo'],
      cookingRecommendations: [
        'Embrace Water elements (cancer) for emotional and nurturing dishes',
        'Use Fire elements (leo) for bold, vibrant cooking with strong flavors',
        'Incorporate Earth elements (virgo) for meticulous preparation and wholesome ingredients',
        'Create communal dishes that bring people together (3 of Cups)',
        'Showcase achievements with presentation-focused dishes (6 of Wands)',
        'Perfect cooking techniques with attention to detail (8 of Pentacles)',
      ],
    },
  },

  autumn: {
    growing: ['sage', 'rosemary', 'thyme'],
    cuisines: {
      greek: {
        combinations: ['spinach + feta', 'lamb + herbs'],
        dishes: ['moussaka', 'stuffed peppers', 'roasted lamb'],
      },
      french: {
        combinations: ['mushroom + thyme', 'apple + cinnamon'],
        dishes: ['ratatouille', 'mushroom soup', 'apple tart'],
      },
    },
    herbs: ['sage', 'rosemary', 'thyme', 'bay leaf'],
    vegetables: ['pumpkin', 'squash', 'mushrooms', 'cauliflower'],
    tarotAssociations: {
      minorArcana: [
        '2 of Swords',
        '3 of Swords',
        '4 of Swords',
        '5 of Cups',
        '6 of Cups',
        '7 of Cups',
        '8 of Wands',
        '9 of Wands',
        '10 of Wands',
      ],
      majorArcana: ['Justice', 'The Hanged Man', 'Death'],
      zodiacSigns: ['libra', 'scorpio', 'sagittarius'],
      cookingRecommendations: [
        'Balance Air elements (libra) with harmonious flavor combinations',
        'Use Water elements (scorpio) for deep, transformative dishes with complex flavors',
        'Incorporate Fire elements (sagittarius) for bold, exploratory cooking',
        'Find equilibrium in dish components (2 of Swords)',
        'Create nostalgic comfort food (6 of Cups)',
        'Balance workload with efficient meal preparation (10 of Wands)',
      ],
    },
  },

  winter: {
    growing: ['rosemary', 'thyme', 'sage'],
    cuisines: {
      greek: {
        combinations: ['lemon + oregano', 'olive + herb'],
        dishes: ['avgolemono soup', 'winter stews', 'baked fish'],
      },
      french: {
        combinations: ['thyme + red wine', 'rosemary + garlic'],
        dishes: ['beef bourguignon', 'cassoulet', 'onion soup'],
      },
    },
    herbs: ['rosemary', 'thyme', 'sage', 'bay leaf'],
    vegetables: ['kale', 'brussels sprouts', 'root vegetables', 'cabbage'],
    tarotAssociations: {
      minorArcana: [
        '2 of Pentacles',
        '3 of Pentacles',
        '4 of Pentacles',
        '5 of Swords',
        '6 of Swords',
        '7 of Swords',
        '8 of Cups',
        '9 of Cups',
        '10 of Cups',
      ],
      majorArcana: ['Temperance', 'The Devil', 'The Tower'],
      zodiacSigns: ['capricorn', 'aquarius', 'pisces'],
      cookingRecommendations: [
        'Embrace Earth elements (capricorn) for traditional and structured cooking',
        'Use Air elements (aquarius) for innovative and unconventional approaches',
        'Incorporate Water elements (pisces) for intuitive and fluid cooking styles',
        'Balance resources and manage ingredients efficiently (2 of Pentacles)',
        'Focus on collaborative cooking projects (3 of Pentacles)',
        'Create dishes that bring joy and fulfillment (9 of Cups, 10 of Cups)',
      ],
    },
  },

  all: {
    growing: ['basil', 'rosemary', 'thyme', 'sage', 'oregano'],
    cuisines: {
      global: {
        combinations: ['garlic + herbs', 'lemon + herbs'],
        dishes: ['roasted meats', 'soups', 'stews'],
      },
    },
    herbs: ['parsley', 'thyme', 'rosemary', 'bay leaf', 'oregano'],
    vegetables: ['onions', 'garlic', 'carrots', 'potatoes'],
    tarotAssociations: {
      minorArcana: [
        'Ace of Wands',
        'Ace of Cups',
        'Ace of Swords',
        'Ace of Pentacles',
        'Queen of Wands',
        'Queen of Cups',
        'Queen of Swords',
        'Queen of Pentacles',
        'King of Wands',
        'King of Cups',
        'King of Swords',
        'King of Pentacles',
      ],
      majorArcana: ['The Fool', 'The Magician', 'The High Priestess', 'The World'],
      cookingRecommendations: [
        'Use the universal energy of the Aces for starting new culinary projects',
        'Balance all four elements (Fire, Water, Air, Earth) in year-round cooking',
        'Draw on the nurturing energy of the Queens for comforting dishes',
        'Use the mastery of the Kings for perfecting signature dishes',
        'Embrace the cyclical nature of The World for seasonal adaptations',
        'Trust intuition with High Priestess energy for experimental cooking',
      ],
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
} as unknown as Record<Season, unknown>;

// Helper functions if needed
export function getSeasonalUsageData(ingredient: string, season: Season) {
  const seasonData = seasonalUsage[season];
  return {
    inGrowing: seasonData.growing.includes(ingredient),
    inHerbs: seasonData.herbs.includes(ingredient),
    inVegetables: seasonData.vegetables.includes(ingredient),
  };
}

export function getTarotRecommendationsForSeason(season: Season) {
  return seasonalUsage[season]?.tarotAssociations?.cookingRecommendations || [];
}

export function getMinorArcanaForSeason(season: Season) {
  return seasonalUsage[season]?.tarotAssociations?.minorArcana || [];
}

export function getMajorArcanaForSeason(season: Season) {
  return seasonalUsage[season]?.tarotAssociations?.majorArcana || [];
}
