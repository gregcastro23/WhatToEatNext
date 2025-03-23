import type { IngredientMapping } from '@/types/alchemy';

export const nightshades: Record<string, IngredientMapping> = {
  'tomato': {
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Leo', 'Taurus'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Venus' },
          second: { element: 'Fire', planet: 'Sun' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      }
    },
    qualities: ['cooling', 'moistening', 'nourishing'],
    season: ['summer', 'early fall'],
    category: 'vegetable',
    subCategory: 'nightshade',
    affinities: ['basil', 'garlic', 'olive oil', 'mozzarella', 'balsamic'],
    cookingMethods: ['raw', 'roasted', 'sautéed', 'stewed'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'k', 'potassium'],
      minerals: ['folate', 'lycopene'],
      calories: 22,
      carbs_g: 4.8,
      fiber_g: 1.5
    },
    preparation: {
      washing: true,
      seeding: 'optional',
      peeling: 'optional',
      notes: 'Store at room temperature for better flavor'
    },
    storage: {
      temperature: 'room temperature until ripe',
      duration: '5-7 days',
      notes: 'Never refrigerate unless cut'
    }
  },

  'eggplant': {
    elementalProperties: { Water: 0.4, Air: 0.3, Earth: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Moon'],
      favorableZodiac: ['Cancer', 'Taurus'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Venus' },
          second: { element: 'Earth', planet: 'Moon' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      }
    },
    qualities: ['cooling', 'moistening'],
    season: ['summer', 'fall'],
    category: 'vegetable',
    subCategory: 'nightshade',
    affinities: ['garlic', 'basil', 'tomato', 'olive oil', 'miso'],
    cookingMethods: ['grilled', 'roasted', 'fried', 'braised'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['b1', 'b6', 'k'],
      minerals: ['manganese', 'copper'],
      calories: 35,
      protein_g: 1,
      fiber_g: 3
    },
    preparation: {
      washing: true,
      salting: 'recommended to remove bitterness',
      cutting: 'uniform slices or cubes',
      notes: 'Salt and drain before cooking'
    },
    storage: {
      temperature: 'cool room temp or refrigerated',
      duration: '5-7 days',
      notes: 'Sensitive to ethylene gas'
    }
  },

  'bell pepper': {
    elementalProperties: { Fire: 0.3, Water: 0.3, Air: 0.3, Earth: 0.1 },
    qualities: ['cooling', 'moistening'],
    season: ['summer', 'fall'],
    category: 'vegetable',
    subCategory: 'nightshade',
    affinities: ['onion', 'garlic', 'olive oil', 'basil', 'oregano'],
    cookingMethods: ['raw', 'roasted', 'grilled', 'sautéed'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'a', 'b6'],
      minerals: ['potassium', 'folate'],
      calories: 30,
      carbs_g: 7,
      fiber_g: 2.1
    },
    preparation: {
      washing: true,
      seeding: 'recommended',
      cutting: 'strips or dice',
      notes: 'Remove white pith for better texture'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '1-2 weeks',
      humidity: 'medium',
      notes: 'Store in crisper drawer'
    }
  }
};