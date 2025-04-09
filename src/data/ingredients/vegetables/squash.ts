import type { IngredientMapping } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawSquash: Record<string, Partial<IngredientMapping>> = {
  'butternut squash': {
    name: 'Butternut squash',
    elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Saturn'],
      favorableZodiac: ['taurus', 'capricorn'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Venus' },
          second: { element: 'Water', planet: 'Saturn' },
          third: { element: 'Fire', planet: 'Sun' }
        }
      }
    },
    qualities: ['warming', 'nourishing', 'grounding'],
    season: ['fall', 'winter'],
    category: 'vegetable',
    subCategory: 'squash',
    affinities: ['sage', 'brown butter', 'maple', 'cinnamon', 'pecans'],
    cookingMethods: ['roasted', 'soup', 'steamed', 'puréed'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['a', 'c', 'e'],
      minerals: ['magnesium', 'potassium'],
      calories: 63,
      carbs_g: 16,
      fiber_g: 3
    },
    preparation: {
      peeling: 'required',
      cutting: 'halve, remove seeds',
      notes: 'Can be pre-cut and roasted'
    },
    storage: {
      temperature: 'cool, dry place',
      duration: '2-3 months',
      notes: 'Once cut, refrigerate'
    }
  },

  'zucchini': {
    name: 'Zucchini',
    elementalProperties: { Water: 0.5, Air: 0.2, Earth: 0.2, Fire: 0.1 },
    qualities: ['cooling', 'moistening'],
    season: ['summer'],
    category: 'vegetable',
    subCategory: 'squash',
    affinities: ['basil', 'garlic', 'tomato', 'parmesan', 'mint'],
    cookingMethods: ['grilled', 'sautéed', 'raw', 'baked'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'b6'],
      minerals: ['manganese', 'potassium'],
      calories: 17,
      carbs_g: 3,
      fiber_g: 1
    },
    preparation: {
      washing: true,
      trimming: 'ends removed',
      cutting: 'rounds, lengthwise, or spiralized',
      notes: 'Do not peel - nutrients in skin'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '4-5 days',
      notes: 'Store in crisper drawer'
    }
  },

  'pumpkin': {
    name: 'Pumpkin',
    elementalProperties: { Earth: 0.5, Water: 0.2, Fire: 0.2, Air: 0.1 },
    qualities: ['warming', 'grounding', 'nourishing'],
    season: ['fall'],
    category: 'vegetable',
    subCategory: 'squash',
    affinities: ['cinnamon', 'nutmeg', 'ginger', 'cream', 'sage'],
    cookingMethods: ['roasted', 'steamed', 'puréed', 'soup'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['a', 'c', 'e'],
      minerals: ['potassium', 'copper'],
      calories: 26,
      carbs_g: 6,
      fiber_g: 1
    },
    preparation: {
      cutting: 'quarter, remove seeds',
      peeling: 'after cooking easier',
      notes: 'Save seeds for roasting'
    },
    storage: {
      temperature: 'cool, dry place',
      duration: '2-3 months whole',
      notes: 'Cooked purée freezes well'
    }
  },

  'acorn squash': {
    name: 'Acorn squash',
    elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
    qualities: ['warming', 'grounding'],
    season: ['fall', 'winter'],
    category: 'vegetable',
    subCategory: 'squash',
    affinities: ['butter', 'maple', 'thyme', 'apple', 'pecans'],
    cookingMethods: ['roasted', 'stuffed', 'steamed'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['c', 'b6', 'a'],
      minerals: ['magnesium', 'potassium'],
      calories: 56,
      carbs_g: 15,
      fiber_g: 4
    },
    preparation: {
      washing: true,
      cutting: 'halve, remove seeds',
      notes: 'No need to peel'
    },
    storage: {
      temperature: 'cool, dry place',
      duration: '1-2 months',
      notes: 'Store away from apples/pears'
    }
  }
};

// Fix the ingredient mappings to ensure they have all required properties
export const squash: Record<string, IngredientMapping> = fixIngredientMappings(rawSquash);
