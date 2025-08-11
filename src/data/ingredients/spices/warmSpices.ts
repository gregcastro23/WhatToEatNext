import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawWarmSpices: Record<string, Partial<IngredientMapping>> = {
  cinnamon: {
    name: 'Cinnamon',
    elementalProperties: { Fire: 0.7, Water: 0.0, Earth: 0.2, Air: 0.1 }, // ← Pattern GG-5: Added missing Water property
    astrologicalProfile: {
      planetaryRuler: 'Sun',
      zodiacRuler: 'Leo',
      element: 'Fire',
      energyType: 'Restorative',
      seasonalPeak: {
        northern: [9, 10, 11, 12, 1, 2],
        southern: [3, 4, 5, 6, 7, 8],
      },
    } as unknown,
    qualities: ['warming', 'sweet', 'pungent', 'aromatic', 'drying', 'carminative'],
    origin: ['Sri Lanka', 'India', 'Southeast Asia'],
    category: 'spice',
    subcategory: 'warm spice',
    affinities: [
      'apple',
      'pear',
      'citrus',
      'chocolate',
      'coffee',
      'honey',
      'nuts',
      'cardamom',
      'ginger',
    ],
    season: 'winter',
    nutritionalProfile: {
      serving_size: '1 tsp ground',
      calories: 6,
      macros: {
        protein: 0.1,
        carbs: 2.1,
        fat: 0.1,
        fiber: 1.4,
      },
      vitamins: {
        K: 0.01,
        B6: 0.01,
        E: 0.01,
      },
      minerals: {
        calcium: 0.26,
        manganese: 0.22,
        iron: 0.08,
        potassium: 0.01,
        magnesium: 0.02,
      },
      antioxidants: {
        cinnamaldehyde: 0.65,
        eugenol: 0.42,
        cinnamyl_acetate: 0.38,
        coumarin: 0.15,
      },
      benefits: ['blood sugar regulation', 'anti-inflammatory', 'antimicrobial'],
      source: 'USDA FoodData Central',
    },
    // ... rest of cinnamon properties
  },
  // ... other warm spices
};

// Fix the ingredient mappings to ensure they have all required properties
export const warmSpices: Record<string, IngredientMapping> = fixIngredientMappings(rawWarmSpices);

// Create a collection of all warm spices
export const allWarmSpices = Object.values(warmSpices);

export default warmSpices;
