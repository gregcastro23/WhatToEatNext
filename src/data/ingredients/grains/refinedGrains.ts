import type { IngredientMapping } from '@/types/alchemy';

export const refinedGrains: Record<string, IngredientMapping> = {
  'white_rice': {
    elementalProperties: { Air: 0.4, Earth: 0.3, Water: 0.3 },
    qualities: ['light', 'clean', 'simple'],
    category: 'refined_grain',
    varieties: {
      'jasmine': {
        characteristics: 'fragrant, soft',
        cooking_ratio: '1:1.5 rice to water',
        cooking_time: '15-20 minutes'
      },
      'basmati': {
        characteristics: 'aromatic, separate grains',
        cooking_ratio: '1:1.5 rice to water',
        cooking_time: '15-20 minutes'
      }
    },
    preparation: {
      'rinsing': {
        duration: 'until water runs clear',
        purpose: 'remove excess starch'
      },
      'cooking': {
        method: 'simmer covered',
        tips: ['rest 5-10 minutes after cooking']
      }
    }
  },

  'semolina': {
    elementalProperties: { Earth: 0.4, Air: 0.4, Fire: 0.2 },
    qualities: ['smooth', 'versatile', 'firm'],
    category: 'refined_grain',
    varieties: {
      'fine': {
        characteristics: 'smooth texture',
        uses: ['pasta', 'puddings'],
        cooking_time: 'varies by application'
      },
      'coarse': {
        characteristics: 'grainy texture',
        uses: ['couscous', 'hot cereal'],
        cooking_time: 'varies by application'
      }
    },
    preparation: {
      'pasta_making': {
        ratio: '1:1 semolina to water',
        method: 'knead until smooth'
      },
      'couscous': {
        ratio: '1:1.5 semolina to water',
        method: 'steam in stages'
      }
    }
  }
};

export default refinedGrains;