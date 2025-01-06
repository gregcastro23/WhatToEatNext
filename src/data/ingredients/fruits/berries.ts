import type { IngredientMapping } from '@/types/alchemy';

export const berries: Record<string, IngredientMapping> = {
  'blueberry': {
    elementalProperties: { Water: 0.4, Air: 0.3, Earth: 0.2, Fire: 0.1 },
    qualities: ['cooling', 'sweet', 'astringent'],
    season: ['summer'],
    category: 'fruit',
    subCategory: 'berry',
    affinities: ['lemon', 'vanilla', 'mint', 'peach', 'almond'],
    cookingMethods: ['raw', 'baked', 'cooked', 'frozen'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['k', 'c', 'b6'],
      minerals: ['manganese', 'potassium'],
      calories: 57,
      carbs_g: 14,
      fiber_g: 3.6,
      antioxidants: ['anthocyanins', 'quercetin']
    },
    preparation: {
      washing: 'just before use',
      sorting: 'remove stems and damaged berries',
      notes: 'Don\'t wash until ready to eat'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '1-2 weeks',
      humidity: 'moderate',
      notes: 'Freezes well'
    }
  },

  'strawberry': {
    elementalProperties: { Water: 0.5, Air: 0.2, Fire: 0.2, Earth: 0.1 },
    qualities: ['cooling', 'sweet', 'refreshing'],
    season: ['late spring', 'summer'],
    category: 'fruit',
    subCategory: 'berry',
    affinities: ['chocolate', 'cream', 'basil', 'balsamic', 'mint'],
    cookingMethods: ['raw', 'macerated', 'roasted', 'preserved'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'b9', 'k'],
      minerals: ['manganese', 'potassium'],
      calories: 32,
      carbs_g: 7.7,
      fiber_g: 2,
      antioxidants: ['anthocyanins', 'ellagic acid']
    },
    preparation: {
      washing: 'gentle rinse',
      hulling: 'remove green tops',
      cutting: 'optional',
      notes: 'Don\'t soak in water'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '3-5 days',
      humidity: 'moderate',
      notes: 'Don\'t wash until ready to use'
    }
  },

  'raspberry': {
    elementalProperties: { Water: 0.4, Air: 0.3, Fire: 0.2, Earth: 0.1 },
    qualities: ['cooling', 'sweet-tart', 'delicate'],
    season: ['summer'],
    category: 'fruit',
    subCategory: 'berry',
    affinities: ['chocolate', 'vanilla', 'lemon', 'almond', 'peach'],
    cookingMethods: ['raw', 'cooked', 'preserved', 'frozen'],
    nutritionalProfile: {
      fiber: 'very high',
      vitamins: ['c', 'k', 'e'],
      minerals: ['manganese', 'magnesium'],
      calories: 52,
      carbs_g: 11.9,
      fiber_g: 6.5,
      antioxidants: ['anthocyanins', 'ellagic acid']
    },
    preparation: {
      washing: 'gentle rinse',
      inspection: 'remove any moldy berries',
      notes: 'Extremely delicate - handle minimally'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '2-3 days',
      humidity: 'moderate',
      notes: 'Best used quickly'
    }
  }
};
