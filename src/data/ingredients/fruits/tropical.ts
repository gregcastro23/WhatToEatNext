import type { IngredientMapping } from '@/types/alchemy';

export const tropical: Record<string, IngredientMapping> = {
  'mango': {
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 },
    qualities: ['sweet', 'cooling', 'nourishing'],
    season: ['summer'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['lime', 'chili', 'coconut', 'mint', 'ginger'],
    cookingMethods: ['raw', 'grilled', 'puréed', 'dried'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['a', 'c', 'b6'],
      minerals: ['copper', 'potassium'],
      calories: 60,
      carbs_g: 15,
      fiber_g: 1.6,
      antioxidants: ['beta-carotene', 'zeaxanthin']
    },
    preparation: {
      washing: true,
      peeling: 'required',
      cutting: 'slice along pit',
      ripeness: 'slight give when pressed',
      notes: 'Can be ripened in paper bag'
    },
    storage: {
      temperature: 'room temp until ripe',
      duration: '5-7 days',
      ripening: 'room temperature',
      notes: 'Refrigerate when ripe'
    }
  },

  'pineapple': {
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 },
    qualities: ['sweet-tart', 'warming', 'cleansing'],
    season: ['spring', 'summer'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['coconut', 'rum', 'mint', 'chili', 'vanilla'],
    cookingMethods: ['raw', 'grilled', 'roasted', 'juiced'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'b6', 'thiamin'],
      minerals: ['manganese', 'copper'],
      calories: 50,
      carbs_g: 13,
      fiber_g: 1.4,
      enzymes: ['bromelain']
    },
    preparation: {
      washing: true,
      cutting: 'remove crown and base',
      peeling: 'remove eyes',
      notes: 'Cut into spears or rings'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      notes: 'Store upside down for even sweetness'
    }
  },

  'papaya': {
    elementalProperties: { Water: 0.5, Air: 0.2, Fire: 0.2, Earth: 0.1 },
    qualities: ['cooling', 'sweet', 'moistening'],
    season: ['year-round'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['lime', 'chili', 'honey', 'ginger', 'coconut'],
    cookingMethods: ['raw', 'smoothies', 'dried'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'a', 'folate'],
      minerals: ['potassium', 'magnesium'],
      calories: 43,
      carbs_g: 11,
      fiber_g: 1.7,
      enzymes: ['papain']
    },
    preparation: {
      washing: true,
      peeling: 'when ripe',
      seeding: 'scoop out seeds',
      ripeness: 'yields to gentle pressure',
      notes: 'Seeds are edible but peppery'
    },
    storage: {
      temperature: 'room temp until ripe',
      duration: '5-7 days',
      ripening: 'room temperature',
      notes: 'Refrigerate when ripe'
    }
  }
};