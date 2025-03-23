import type { IngredientMapping } from '@/types/alchemy';

export const refinedGrains: Record<string, IngredientMapping> = {
  'white_rice': {
    elementalProperties: { Air: 0.4, Earth: 0.3, Water: 0.3 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Mercury'],
      favorableZodiac: ['Cancer', 'Virgo'],
      elementalAffinity: {
        base: 'Air',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercury' },
          second: { element: 'Earth', planet: 'Moon' },
          third: { element: 'Water', planet: 'Neptune' }
        }
      }
    },
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
  },

  'pearl_barley': {
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Capricorn'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Moon' },
          second: { element: 'Water', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      }
    },
    qualities: ['tender', 'mild', 'versatile'],
    category: 'refined_grain',
    varieties: {
      'medium': {
        characteristics: 'common variety, versatile',
        cooking_ratio: '1:3 barley to water',
        cooking_time: '30-40 minutes'
      },
      'quick': {
        characteristics: 'pre-steamed, faster cooking',
        cooking_ratio: '1:2.5 barley to water',
        cooking_time: '10-15 minutes'
      }
    },
    preparation: {
      'basic': {
        duration: 'rinse before cooking',
        method: 'simmer until tender',
        tips: ['no soaking required', 'drain excess water']
      },
      'risotto_style': {
        method: 'gradual liquid addition',
        duration: '35-45 minutes',
        notes: 'stir frequently for creamy texture'
      }
    }
  },

  'polished_farro': {
    elementalProperties: { Earth: 0.5, Air: 0.2, Fire: 0.2, Water: 0.1 },
    qualities: ['chewy', 'nutty', 'refined'],
    category: 'refined_grain',
    varieties: {
      'pearled': {
        characteristics: 'quickest cooking, most refined',
        cooking_ratio: '1:2.5 farro to water',
        cooking_time: '15-20 minutes'
      },
      'semi_pearled': {
        characteristics: 'partially refined, balanced',
        cooking_ratio: '1:2.5 farro to water',
        cooking_time: '20-25 minutes'
      }
    },
    preparation: {
      'pilaf': {
        method: 'toast then simmer',
        duration: 'until tender but chewy',
        tips: ['drain excess water', 'fluff when done']
      },
      'salad': {
        method: 'cook until al dente',
        cooling: 'rinse with cold water',
        notes: 'maintains texture when chilled'
      }
    }
  },

  'white_cornmeal': {
    elementalProperties: { Earth: 0.3, Fire: 0.3, Air: 0.3, Water: 0.1 },
    qualities: ['smooth', 'mild', 'versatile'],
    category: 'refined_grain',
    varieties: {
      'fine': {
        characteristics: 'smooth texture',
        uses: ['polenta', 'baking'],
        cooking_time: '15-20 minutes for polenta'
      },
      'medium': {
        characteristics: 'traditional grind',
        uses: ['cornbread', 'coating'],
        cooking_time: '20-25 minutes for polenta'
      }
    },
    preparation: {
      'polenta': {
        ratio: '1:4 cornmeal to water',
        method: 'constant stirring',
        tips: ['whisk to prevent lumps']
      },
      'baking': {
        ratio: 'varies by recipe',
        method: 'mix with dry ingredients',
        notes: 'sift for finer texture'
      }
    }
  }
};

export default refinedGrains;