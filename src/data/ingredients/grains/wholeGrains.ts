import type { IngredientMapping } from '@/types/alchemy';

export const wholeGrains: Record<string, IngredientMapping> = {
  'brown_rice': {
    elementalProperties: { Earth: 0.5, Water: 0.3, Air: 0.2 },
    qualities: ['nutty', 'chewy', 'wholesome'],
    category: 'whole_grain',
    varieties: {
      'short_grain': {
        characteristics: 'sticky, plump',
        cooking_ratio: '1:2 rice to water',
        cooking_time: '45-50 minutes'
      },
      'long_grain': {
        characteristics: 'fluffy, separate grains',
        cooking_ratio: '1:2.25 rice to water',
        cooking_time: '45-50 minutes'
      }
    },
    preparation: {
      'soaking': {
        duration: '8-12 hours',
        benefits: ['reduces cooking time', 'improves digestibility']
      },
      'cooking': {
        method: 'simmer covered',
        tips: ['do not stir', 'rest 10 minutes after']
      }
    }
  },

  'quinoa': {
    elementalProperties: { Earth: 0.4, Air: 0.4, Water: 0.2 },
    qualities: ['light', 'protein-rich', 'versatile'],
    category: 'whole_grain',
    varieties: {
      'white': {
        characteristics: 'mild, fluffy',
        cooking_ratio: '1:2 quinoa to water',
        cooking_time: '15-20 minutes'
      },
      'red': {
        characteristics: 'earthy, chewy',
        cooking_ratio: '1:2 quinoa to water',
        cooking_time: '15-20 minutes'
      }
    },
    preparation: {
      'rinsing': {
        duration: '1-2 minutes',
        purpose: 'remove saponins'
      },
      'cooking': {
        method: 'simmer covered',
        tips: ['fluff with fork', 'let stand 5 minutes']
      }
    }
  }
};

export default wholeGrains;