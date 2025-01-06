import type { IngredientMapping } from '@/types/alchemy';

export const leafyGreens: Record<string, IngredientMapping> = {
  'kale': {
    elementalProperties: { Air: 0.4, Earth: 0.3, Water: 0.2, Fire: 0.1 },
    qualities: ['cleansing', 'strengthening', 'cooling'],
    season: ['fall', 'winter'],
    category: 'vegetable',
    subCategory: 'leafy green',
    affinities: ['garlic', 'olive oil', 'lemon', 'pine nuts', 'chili'],
    cookingMethods: ['raw', 'steamed', 'sautéed', 'baked'],
    nutritionalProfile: {
      fiber: 'very high',
      vitamins: ['k', 'c', 'a', 'b6'],
      minerals: ['calcium', 'potassium', 'magnesium'],
      calories: 33,
      protein_g: 3,
      fiber_g: 2.5
    },
    preparation: {
      washing: true,
      stemming: 'remove tough stems',
      massage: 'when raw for tenderness'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      notes: 'Store in sealed container with paper towel'
    }
  },
  'spinach': {
    elementalProperties: { Water: 0.4, Air: 0.3, Earth: 0.2, Fire: 0.1 },
    qualities: ['cooling', 'moistening', 'cleansing'],
    season: ['spring', 'fall'],
    category: 'vegetable',
    subCategory: 'leafy green',
    affinities: ['garlic', 'olive oil', 'lemon', 'mushrooms', 'nutmeg'],
    cookingMethods: ['raw', 'steamed', 'sautéed'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['k', 'a', 'c', 'folate'],
      minerals: ['iron', 'calcium', 'magnesium'],
      calories: 23,
      protein_g: 2.9,
      fiber_g: 2.2
    },
    preparation: {
      washing: true,
      stemming: 'optional',
      notes: 'Will reduce significantly when cooked'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      notes: 'Store in airtight container'
    }
  },
  'swiss chard': {
    elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
    qualities: ['cooling', 'cleansing'],
    season: ['summer', 'fall'],
    category: 'vegetable',
    subCategory: 'leafy green',
    affinities: ['garlic', 'beans', 'lemon', 'pine nuts'],
    cookingMethods: ['steamed', 'sautéed', 'braised'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['k', 'a', 'c'],
      minerals: ['magnesium', 'potassium', 'iron'],
      calories: 19,
      protein_g: 1.8,
      fiber_g: 1.9
    },
    preparation: {
      washing: true,
      stemming: 'separate stems from leaves',
      notes: 'Cook stems longer than leaves'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '3-5 days',
      notes: 'Wrap in damp paper towel'
    }
  }
};
