import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawRootVegetables = {
  'sweet potato': {;
    name: 'Sweet potato',
    elementalProperties: { Earth: 0.5, Fire: 0.3, Water: 0.1, Air: 0.1 }
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Moon'],
      favorableZodiac: ['taurus', 'cancer', 'virgo'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Venus' },
        second: { element: 'Water', planet: 'Moon' },
        third: { element: 'Air', planet: 'Mercury' }
        }
      }
    },
    qualities: ['grounding', 'warming', 'nourishing'],
    season: ['fall', 'winter'],
    category: 'vegetable',
    subCategory: 'root',
    affinities: ['cinnamon', 'butter', 'maple', 'pecans', 'coconut'],
    cookingMethods: ['roasted', 'steamed', 'mashed', 'grilled'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['a', 'c', 'b6'],
      minerals: ['potassium', 'manganese'],
      calories: 103,
      carbs_g: 24,
      fiber_g: 4
    },
    preparation: {
      washing: true,
      peeling: 'optional',
      cutting: 'uniform size for even cooking',
      notes: 'Can be pre-cooked and reheated' },
        storage: {
      temperature: 'cool dark place',
      duration: '3-5 weeks',
      notes: 'Do not refrigerate raw'
    }
  }

  parsnip: {
    name: 'Parsnip',
    elementalProperties: { Earth: 0.5, Air: 0.2, Fire: 0.2, Water: 0.1 }
    qualities: ['grounding', 'warming', 'nourishing'],
    season: ['fall', 'winter'],
    category: 'vegetable',
    subCategory: 'root',
    affinities: ['nutmeg', 'cream', 'maple', 'thyme', 'apple'],
    cookingMethods: ['roasted', 'mashed', 'soup', 'fried'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['c', 'e', 'k'],
      minerals: ['folate', 'potassium', 'manganese'],
      calories: 75,
      carbs_g: 18,
      fiber_g: 5
    },
    preparation: {
      washing: true,
      peeling: 'recommended',
      cutting: 'uniform pieces',
      notes: 'Smaller ones are more tender' },
        storage: {
      temperature: 'refrigerated',
      duration: '2-3 weeks',
      humidity: 'high',
      notes: 'Store in plastic bag with holes'
    }
  }

  beet: {
    name: 'Beet',
    elementalProperties: { Earth: 0.6, Fire: 0.2, Water: 0.1, Air: 0.1 }
    qualities: ['grounding', 'building', 'cleansing'],
    season: ['fall', 'winter'],
    category: 'vegetable',
    subCategory: 'root',
    affinities: ['goat cheese', 'walnuts', 'orange', 'dill', 'balsamic'],
    cookingMethods: ['roasted', 'raw', 'steamed', 'pickled'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['c', 'b9', 'b6'],
      minerals: ['iron', 'manganese', 'potassium'],
      calories: 43,
      carbs_g: 10,
      fiber_g: 2.8,
      antioxidants: ['betalains', 'nitrates']
    },
    preparation: {
      washing: true,
      peeling: 'after cooking',
      roasting: 'wrap in foil with olive oil',
      notes: 'Wear gloves to prevent staining' },
        storage: {
      temperature: 'refrigerated',
      duration: '2-3 weeks',
      humidity: 'high',
      notes: 'Remove greens, store separately'
    }
  }

  turnip: {
    name: 'Turnip',
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 }
    qualities: ['cooling', 'cleansing'],
    season: ['fall', 'winter', 'spring'],
    category: 'vegetable',
    subCategory: 'root',
    affinities: ['butter', 'cream', 'mustard', 'thyme', 'bacon'],
    cookingMethods: ['roasted', 'mashed', 'braised', 'raw'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'k', 'a'],
      minerals: ['calcium', 'potassium'],
      calories: 28,
      carbs_g: 6,
      fiber_g: 2
    },
    preparation: {
      washing: true,
      peeling: 'recommended for larger ones',
      cutting: 'uniform pieces',
      notes: 'Smaller ones are sweeter' },
        storage: {
      temperature: 'refrigerated',
      duration: '2-3 weeks',
      humidity: 'high',
      notes: 'Store in plastic bag with holes'
    }
  }
}

// Fix the ingredient mappings to ensure they have all required properties
// ✅ Pattern MM-1: Type assertion for ZodiacSign[] compatibility
export const _rootVegetables: Record<string, IngredientMapping> = fixIngredientMappings(
  rawRootVegetables as Record<string, Partial<IngredientMapping>>,
)
