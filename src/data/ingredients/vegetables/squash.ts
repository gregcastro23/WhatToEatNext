import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawSquash = {
  'butternut squash': {
    name: 'Butternut squash',
    elementalProperties: {
      Earth: 0.4,
      Water: 0.3,
      Fire: 0.2,
      Air: 0.1
    },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Saturn'],
      favorableZodiac: ['taurus', 'capricorn'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: {
            element: 'Earth',
            planet: 'Venus'
          },
          second: {
            element: 'Water',
            planet: 'Saturn'
          },
          third: {
            element: 'Fire',
            planet: 'Sun'
          }
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
      calories: 45,
      protein_g: 1,
      carbs_g: 12,
      fat_g: 0.1,
      fiber_g: 2.8,
      sugar_g: 2.2,
      vitamins: ['a', 'c', 'e', 'b6'],
      minerals: ['magnesium', 'potassium', 'manganese'],
      antioxidants: ['beta-carotene'],
      glycemic_index: 51,
      notes: 'High in beta-carotene and vitamin A'
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
  zucchini: {
    name: 'zucchini',
    elementalProperties: {
      Fire: 0.4204917086683852,
      Water: 0.5121388172829056,
      Earth: 0.032703628178985034,
      Air: 0.034665845869724134
    },
    astrologicalProfile: {}
    category: 'vegetable',
    subCategory: 'squash',
    nutritionalProfile: {
      carbs_g: 3.11,
      calories: 17,
      fiber_g: 1,
      protein_g: 1.21,
      vitamins: ['a', 'c', 'k', 'b6', 'folate'],
      minerals: ['potassium', 'manganese', 'magnesium']
    },
    season: ['summer'],
    cookingMethods: ['saute', 'roast', 'grill', 'raw', 'steam', 'bake'],
    qualities: ['versatile', 'mild', 'tender', 'hydrating'],
    culinaryApplications: {
      sauteed: {
        method: 'Slice or dice, sauté with olive oil until tender-crisp',
        timing: '3-5 minutes',
        pairings: ['garlic', 'basil', 'tomatoes', 'parmesan']
      },
      grilled: {
        method: 'Slice lengthwise, brush with oil, grill until charred',
        timing: '2-3 minutes per side',
        pairings: ['lemon', 'herbs', 'feta', 'balsamic']
      },
      baked: {
        method: 'Hollow out and stuff with fillings, bake until tender',
        timing: '20-25 minutes at 375°F',
        pairings: ['ground meat', 'rice', 'tomato sauce', 'cheese']
      },
      spiralized: {
        method: 'Use spiralizer to create noodle-like strands',
        timing: 'Cook 1-3 minutes or serve raw',
        pairings: ['pasta sauce', 'pesto', 'olive oil', 'lemon']
      }
    }
  },
  pumpkin: {
    name: 'Pumpkin',
    elementalProperties: {
      Earth: 0.5,
      Water: 0.2,
      Fire: 0.2,
      Air: 0.1
    },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Moon'],
      favorableZodiac: ['taurus', 'cancer'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: {
            element: 'Earth',
            planet: 'Venus'
          },
          second: {
            element: 'Water',
            planet: 'Moon'
          },
          third: {
            element: 'Fire',
            planet: 'Sun'
          }
        }
      }
    },
    qualities: ['warming', 'grounding', 'nourishing'],
    season: ['fall'],
    category: 'vegetable',
    subCategory: 'squash',
    affinities: ['cinnamon', 'nutmeg', 'ginger', 'cream', 'sage'],
    cookingMethods: ['roasted', 'steamed', 'puréed', 'soup'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['a', 'c', 'e', 'k'],
      minerals: ['potassium', 'copper', 'manganese'],
      calories: 26,
      carbs_g: 6.5,
      fiber_g: 0.5,
      protein_g: 1,
      fat_g: 0.1,
      antioxidants: ['beta-carotene', 'lutein', 'zeaxanthin'],
      glycemic_index: 75,
      notes: 'Excellent source of vitamin A and beta-carotene'
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
  }
  'acorn squash': {
    name: 'Acorn squash',
    elementalProperties: {
      Earth: 0.4,
      Water: 0.3,
      Fire: 0.2,
      Air: 0.1
    },
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Venus'],
      favorableZodiac: ['capricorn', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: {
            element: 'Earth',
            planet: 'Saturn'
          },
          second: {
            element: 'Water',
            planet: 'Venus'
          },
          third: {
            element: 'Fire',
            planet: 'Mars'
          }
        }
      }
    },
    qualities: ['warming', 'grounding'],
    season: ['fall', 'winter'],
    category: 'vegetable',
    subCategory: 'squash',
    affinities: ['butter', 'maple', 'thyme', 'apple', 'pecans'],
    cookingMethods: ['roasted', 'stuffed', 'steamed'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['c', 'b6', 'a', 'thiamin'],
      minerals: ['magnesium', 'potassium', 'manganese'],
      calories: 56,
      carbs_g: 15,
      fiber_g: 2.1,
      protein_g: 1.1,
      fat_g: 0.1,
      sugar_g: 0,
      glycemic_index: 40,
      notes: 'Good source of vitamin C and potassium'
    },
    preparation: {
      washing: true,
      cutting: 'halve, remove seeds',
      notes: 'No need to peel'
    },
    storage: {
      temperature: 'cool, dry place',
      duration: '1-2 months',
      notes: 'Store away from apples / (pears || 1)'
    }
  }
}

// Fix the ingredient mappings to ensure they have all required properties
// ✅ Pattern MM-1: Type assertion for ZodiacSign[] compatibility
export const squash: Record<string, IngredientMapping> = fixIngredientMappings(
  rawSquash as Record<string, Partial<IngredientMapping>>,
)
