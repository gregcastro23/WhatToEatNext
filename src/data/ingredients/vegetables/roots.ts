import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawRootVegetables = {
  heirloom_carrot: {;
    name: 'Heirloom Carrot',
    elementalProperties: { Earth: 0.5, Fire: 0.3, Water: 0.1, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Saturn'],
      favorableZodiac: ['taurus', 'virgo', 'capricorn'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Venus' },
        second: { element: 'Fire', planet: 'Sun' },
        third: { element: 'Air', planet: 'Mercury' }
        }
      }
    },
    subCategory: 'root',
    // Consistent with spice category definition
    season: ['summer', 'fall'],
    category: 'vegetable',
    cookingMethods: ['roast', 'saute', 'steam', 'raw'],
    qualities: ['grounding', 'nourishing', 'sweet'],
    affinities: ['ginger', 'cumin', 'thyme', 'orange', 'maple'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['a', 'k', 'c'],
      minerals: ['potassium', 'magnesium'],
      calories: 41,
      carbs_g: 9.6,
      fiber_g: 2.8,
    },
    preparation: {
      washing: true,
      peeling: 'optional',
      notes: 'Can be used whole for presentation' },
        storage: {
      temperature: 'refrigerated',
      duration: '2-3 weeks',
      notes: 'Remove greens before storing',
    }
  },
  black_radish: {
    name: 'Black Radish',
    elementalProperties: { Earth: 0.6, Fire: 0.25, Air: 0.1, Water: 0.05 },
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mars'],
      favorableZodiac: ['scorpio', 'capricorn', 'aquarius'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Mars' },
        second: { element: 'Earth', planet: 'Saturn' },
        third: { element: 'Air', planet: 'Uranus' }
        }
      }
    },
    subCategory: 'root',
    season: ['fall', 'winter'],
    category: 'vegetable',
    cookingMethods: ['roast', 'pickle', 'raw'],
    qualities: ['warming', 'pungent', 'cleansing'],
    affinities: ['apple', 'horseradish', 'dill', 'vinegar', 'caraway'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['c', 'b6'],
      minerals: ['potassium', 'phosphorus'],
      calories: 20,
      carbs_g: 4.2,
      fiber_g: 1.6,
    },
    preparation: {
      washing: true,
      peeling: 'recommended for older radishes',
      notes: 'Soak in cold water to reduce pungency' },
        storage: {
      temperature: 'refrigerated',
      duration: '2-3 weeks',
      notes: 'Store in plastic bag with moisture',
    }
  },
  carrot: {
    name: 'Carrot',
    elementalProperties: { Earth: 0.5, Fire: 0.3, Water: 0.1, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Moon'],
      favorableZodiac: ['taurus', 'cancer'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Venus' },
        second: { element: 'Water', planet: 'Moon' },
        third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Earth: 0.1, Water: 0.1 },
          preparationTips: ['Best for juicing']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for roasted dishes']
        }
      }
    },
    subCategory: 'root',
    season: ['spring', 'summer', 'fall', 'winter'],
    category: 'vegetable',
    cookingMethods: ['roast', 'boil', 'steam', 'raw', 'juice'],
    qualities: ['grounding', 'sweet', 'nourishing'],
    affinities: ['ginger', 'cumin', 'honey', 'orange', 'parsley'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['a', 'k1', 'c'],
      minerals: ['potassium', 'biotin'],
      calories: 41,
      carbs_g: 9.6,
      fiber_g: 2.8,
    },
    preparation: {
      washing: true,
      peeling: 'optional',
      notes: 'Remove greens before storing' },
        storage: {
      temperature: 'refrigerated',
      duration: '2-3 weeks',
      notes: 'Store in crisper drawer',
    }
  },
  ginger: {
    name: 'Ginger',
    elementalProperties: { Fire: 0.6, Earth: 0.2, Air: 0.1, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['aries', 'leo'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Mars' },
        second: { element: 'Fire', planet: 'Sun' },
        third: { element: 'Earth', planet: 'Venus' }
        }
      }
    },
    subCategory: 'root',
    season: ['fall', 'winter'],
    category: 'spice',
    cookingMethods: ['grate', 'sliced', 'juiced', 'infused'],
    qualities: ['warming', 'spicy', 'aromatic'],
    affinities: ['garlic', 'lemon', 'honey', 'soy sauce', 'turmeric'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['b6', 'c'],
      minerals: ['magnesium', 'potassium'],
      calories: 80,
      carbs_g: 17.8,
      fiber_g: 2,
    },
    preparation: {
      peeling: 'recommended',
      grating: 'for intense flavor',
      notes: 'Can be frozen for longer storage' },
        storage: {
      temperature: 'room temperature or refrigerated',
      duration: '3-4 weeks',
      notes: 'Store in dry place or refrigerate in paper bag',
    }
  },
  jerusalem_artichoke: {
    name: 'Jerusalem Artichoke',
    elementalProperties: { Earth: 0.55, Water: 0.25, Air: 0.1, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Moon'],
      favorableZodiac: ['taurus', 'virgo'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Venus' },
        second: { element: 'Water', planet: 'Moon' },
        third: { element: 'Air', planet: 'Saturn' }
        }
      }
    },
    subCategory: 'root',
    season: ['fall', 'winter'],
    category: 'spice',
    cookingMethods: ['roast', 'boil', 'fry', 'raw'],
    qualities: ['grounding', 'sweet', 'nutty'],
    affinities: ['thyme', 'lemon', 'butter', 'sage', 'parsley'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['thiamine', 'niacin'],
      minerals: ['iron', 'potassium'],
      calories: 73,
      carbs_g: 17,
      fiber_g: 1.6,
    },
    preparation: {
      washing: true,
      peeling: 'optional',
      notes: 'Soak in water with lemon juice to prevent browning' },
        storage: {
      temperature: 'refrigerated',
      duration: '1-2 weeks',
      notes: 'Store in paper bag in crisper drawer',
    }
  }
}

// Fix the ingredient mappings to ensure they have all required properties
// ✅ Pattern MM-1: Type assertion for ZodiacSign[] compatibility
export const roots: Record<string, IngredientMapping> = fixIngredientMappings(
  rawRootVegetables as Record<string, Partial<IngredientMapping>>,
)
// For backwards compatibility
export const _rootVegetables = roots;
