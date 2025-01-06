import type { IngredientMapping } from '@/types/alchemy';

export const cruciferous: Record<string, IngredientMapping> = {
  'cauliflower': {
    elementalProperties: { Air: 0.4, Earth: 0.3, Water: 0.2, Fire: 0.1 },
    qualities: ['cooling', 'drying', 'light'],
    season: ['fall', 'winter'],
    category: 'vegetable',
    subCategory: 'cruciferous',
    affinities: ['cumin', 'turmeric', 'garlic', 'tahini', 'lemon'],
    cookingMethods: ['roasted', 'steamed', 'raw', 'riced'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['c', 'k', 'b6'],
      minerals: ['potassium', 'magnesium'],
      calories: 25,
      protein_g: 2,
      fiber_g: 3,
      antioxidants: ['glucosinolates', 'flavonoids']
    },
    preparation: {
      washing: true,
      cutting: 'uniform florets',
      drying: 'thoroughly for roasting',
      notes: 'Can be processed into rice substitute'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '4-7 days',
      humidity: 'medium',
      notes: 'Store in breathable bag'
    }
  },

  'broccoli': {
    elementalProperties: { Air: 0.3, Earth: 0.3, Water: 0.2, Fire: 0.2 },
    qualities: ['strengthening', 'cleansing'],
    season: ['fall', 'winter', 'spring'],
    category: 'vegetable',
    subCategory: 'cruciferous',
    affinities: ['garlic', 'ginger', 'sesame', 'lemon', 'chili'],
    cookingMethods: ['steamed', 'roasted', 'stir-fried', 'raw'],
    nutritionalProfile: {
      fiber: 'very high',
      vitamins: ['c', 'k', 'a', 'folate'],
      minerals: ['potassium', 'calcium', 'iron'],
      calories: 31,
      protein_g: 2.5,
      fiber_g: 2.4,
      antioxidants: ['sulforaphane', 'carotenoids']
    },
    preparation: {
      washing: true,
      cutting: 'uniform florets, peel stems',
      notes: 'Don't discard stems - they're sweet and tender when peeled'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      humidity: 'medium',
      notes: 'Store unwashed in loose plastic bag'
    }
  },

  'brussels sprouts': {
    elementalProperties: { Earth: 0.4, Air: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ['warming', 'strengthening'],
    season: ['fall', 'winter'],
    category: 'vegetable',
    subCategory: 'cruciferous',
    affinities: ['bacon', 'balsamic', 'garlic', 'mustard', 'pine nuts'],
    cookingMethods: ['roasted', 'sautéed', 'grilled', 'raw'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['k', 'c', 'a'],
      minerals: ['iron', 'potassium'],
      calories: 38,
      protein_g: 3,
      fiber_g: 3.8
    },
    preparation: {
      washing: true,
      trimming: 'remove outer leaves and stem',
      cutting: 'halved or quartered',
      notes: 'Score bottom for even cooking'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '7-10 days',
      humidity: 'medium',
      notes: 'Store in sealed container'
    }
  }
};