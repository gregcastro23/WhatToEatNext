import type { IngredientMapping } from '@/types/alchemy';

export const alliums: Record<string, IngredientMapping> = {
  'garlic': {
    elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.1, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Pluto'],
      favorableZodiac: ['Aries', 'Scorpio'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Mars' },
          second: { element: 'Earth', planet: 'Pluto' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      }
    },
    qualities: ['warming', 'pungent', 'drying'],
    season: ['all'],
    category: 'vegetable',
    subCategory: 'allium',
    affinities: ['olive oil', 'herbs', 'ginger', 'chili', 'lemon'],
    cookingMethods: ['roasted', 'sautéed', 'raw', 'confit'],
    nutritionalProfile: {
      vitamins: ['c', 'b6'],
      minerals: ['manganese', 'selenium'],
      calories: 4,
      protein_g: 0.2,
      medicinalProperties: ['allicin', 'antioxidants']
    },
    preparation: {
      peeling: true,
      crushing: 'releases more compounds',
      resting: '10 minutes after cutting',
      notes: 'Do not overcook to preserve benefits'
    },
    storage: {
      temperature: 'cool, dry place',
      duration: '3-6 months',
      notes: 'Do not refrigerate whole heads'
    }
  },

  'onion': {
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Moon'],
      favorableZodiac: ['Aries', 'Cancer'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Mars' },
          second: { element: 'Water', planet: 'Moon' },
          third: { element: 'Earth', planet: 'Saturn' }
        }
      }
    },
    qualities: ['warming', 'stimulating'],
    season: ['all'],
    category: 'vegetable',
    subCategory: 'allium',
    affinities: ['garlic', 'herbs', 'butter', 'vinegar', 'celery'],
    cookingMethods: ['sautéed', 'caramelized', 'raw', 'grilled'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'b6'],
      minerals: ['folate', 'potassium'],
      calories: 40,
      carbs_g: 9,
      fiber_g: 1.7
    },
    preparation: {
      peeling: true,
      cutting: 'along grain for cooking, against for raw',
      notes: 'Chill before cutting to reduce tears'
    },
    storage: {
      temperature: 'cool, dry place',
      duration: '1-2 months',
      notes: 'Keep away from potatoes'
    }
  },

  'leek': {
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
    qualities: ['warming', 'nourishing'],
    season: ['fall', 'winter'],
    category: 'vegetable',
    subCategory: 'allium',
    affinities: ['potato', 'cream', 'thyme', 'butter', 'parmesan'],
    cookingMethods: ['sautéed', 'braised', 'roasted', 'soup'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['k', 'a', 'c'],
      minerals: ['manganese', 'iron'],
      calories: 54,
      carbs_g: 12,
      fiber_g: 1.8
    },
    preparation: {
      washing: 'thoroughly between layers',
      trimming: 'remove dark green parts',
      cutting: 'halve lengthwise first',
      notes: 'Soak in cold water to remove sand'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '1-2 weeks',
      notes: 'Wrap in damp paper towel'
    }
  }
};
