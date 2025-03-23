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
  MEXICAN: 'mexican'
};

export const seasonalUsage: Record<Season, any> = {
  spring: {
    growing: ['basil', 'oregano', 'thyme'],
    cuisines: {
      // Use string literal instead of enum reference
      'greek': {
        combinations: ['mint + parsley', 'dill + garlic'],
        dishes: ['spring lamb', 'fresh salads']
      },
      'italian': {
        combinations: ['basil + tomato', 'pea + mint'],
        dishes: ['primavera pasta', 'spring risotto']
      }
    },
    herbs: ['mint', 'chives', 'parsley', 'dill'],
    vegetables: ['asparagus', 'peas', 'artichokes', 'spring onions']
  },
  
  summer: {
    growing: ['basil', 'rosemary', 'cilantro'],
    cuisines: {
      'greek': {
        combinations: ['cucumber + mint', 'tomato + feta'],
        dishes: ['tzatziki', 'greek salad', 'souvlaki']
      },
      'italian': {
        combinations: ['tomato + basil', 'zucchini + mint'],
        dishes: ['caprese salad', 'summer pasta', 'grilled vegetables']
      }
    },
    herbs: ['basil', 'oregano', 'tarragon', 'cilantro'],
    vegetables: ['tomatoes', 'zucchini', 'eggplant', 'peppers']
  },
  
  fall: {
    growing: ['sage', 'rosemary', 'thyme'],
    cuisines: {
      'greek': {
        combinations: ['spinach + feta', 'lamb + herbs'],
        dishes: ['moussaka', 'stuffed peppers', 'roasted lamb']
      },
      'french': {
        combinations: ['mushroom + thyme', 'apple + cinnamon'],
        dishes: ['ratatouille', 'mushroom soup', 'apple tart']
      }
    },
    herbs: ['sage', 'rosemary', 'thyme', 'bay leaf'],
    vegetables: ['pumpkin', 'squash', 'mushrooms', 'cauliflower']
  },
  
  winter: {
    growing: ['rosemary', 'thyme', 'sage'],
    cuisines: {
      'greek': {
        combinations: ['lemon + oregano', 'olive + herb'],
        dishes: ['avgolemono soup', 'winter stews', 'baked fish']
      },
      'french': {
        combinations: ['thyme + red wine', 'rosemary + garlic'],
        dishes: ['beef bourguignon', 'cassoulet', 'onion soup']
      }
    },
    herbs: ['rosemary', 'thyme', 'sage', 'bay leaf'],
    vegetables: ['kale', 'brussels sprouts', 'root vegetables', 'cabbage']
  }
};

// Helper functions if needed
export function getSeasonalUsageData(ingredient: string, season: Season) {
  const seasonData = seasonalUsage[season];
  return {
    inGrowing: seasonData.growing.includes(ingredient),
    inHerbs: seasonData.herbs.includes(ingredient),
    inVegetables: seasonData.vegetables.includes(ingredient)
  };
}
