import type { IngredientMapping } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

// Helper function for generating consistent numeric values
const generateVegetableAttributes = (vegData: {
  water: number; // water content percentage (0-100)
  fiber: number; // fiber content (0-10 scale)
  bitterness: number; // bitterness level (0-10 scale)
  cooking_time: number; // typical cooking time in minutes
}) => {
  return {
    water_content: vegData.water,
    fiber_density: vegData.fiber,
    bitterness: vegData.bitterness,
    cooking_time_minutes: vegData.cooking_time,
    volume_reduction: Math.round(vegData.water * 0.8) / 10, // How much it shrinks when cooked (1-10 scale)
    seasonal_peak_months: [], // Will be set individually
    cell_wall_strength: Math.round((10 - vegData.water / 10) + (vegData.fiber / 2)), // Structural integrity when cooked
    nutrient_density: Math.round(
      (vegData.fiber * 0.6) + 
      ((100 - vegData.water) * 0.05) + 
      (Math.min(7, vegData.bitterness) * 0.3)
    )
  };
};

const rawLeafyGreens: Record<string, Partial<IngredientMapping>> = {
  'kale': {
    name: 'Kale',
    elementalProperties: { Air: 0.38, Earth: 0.34, Water: 0.22, Fire: 0.06 },
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Saturn'],
      favorableZodiac: ['virgo', 'capricorn'],
      elementalAffinity: {
        base: 'Air',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercury' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Water', planet: 'Moon' }
        }
      }
    },
    qualities: ['cleansing', 'strengthening', 'cooling'],
    season: ['fall', 'winter'],
    category: 'vegetable',
    subCategory: 'leafy green',
    affinities: ['garlic', 'olive oil', 'lemon', 'pine nuts', 'chili'],
    cookingMethods: ['raw', 'steamed', 'sautéed', 'baked'],
    ...generateVegetableAttributes({
      water: 84, 
      fiber: 9, 
      bitterness: 7, 
      cooking_time: 8
    }),
    seasonal_peak_months: [10, 11, 12, 1, 2], // Oct-Feb
    nutritionalProfile: {
      fiber: 'very high',
      vitamins: ['k', 'c', 'a', 'b6'],
      minerals: ['calcium', 'potassium', 'magnesium'],
      calories: 33,
      protein_g: 3,
      fiber_g: 2.5,
      vitamin_density: 9.2
    },
    preparation: {
      washing: true,
      stemming: 'remove tough stems',
      massage: 'when raw for tenderness'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      notes: 'Store in sealed container with paper towel',
      sensitivity: 4 // 1-10 scale of how quickly it spoils
    }
  },
  'spinach': {
    name: 'Spinach',
    elementalProperties: { Water: 0.42, Air: 0.31, Earth: 0.22, Fire: 0.05 },
    qualities: ['cooling', 'moistening', 'cleansing'],
    season: ['spring', 'fall'],
    category: 'vegetable',
    subCategory: 'leafy green',
    affinities: ['garlic', 'olive oil', 'lemon', 'mushrooms', 'nutmeg'],
    cookingMethods: ['raw', 'steamed', 'sautéed'],
    ...generateVegetableAttributes({
      water: 91, 
      fiber: 6, 
      bitterness: 3, 
      cooking_time: 2
    }),
    seasonal_peak_months: [3, 4, 5, 9, 10], // Mar-May, Sep-Oct
    iron_content: 6.5, // Scale 1-10
    oxalate_level: 8.2, // Scale 1-10
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['k', 'a', 'c', 'folate'],
      minerals: ['iron', 'calcium', 'magnesium'],
      calories: 23,
      protein_g: 2.9,
      fiber_g: 2.2,
      vitamin_density: 8.7
    },
    preparation: {
      washing: true,
      stemming: 'optional',
      notes: 'Will reduce significantly when cooked'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      notes: 'Store in airtight container',
      sensitivity: 6 // 1-10 scale of how quickly it spoils
    }
  },
  'swiss chard': {
    name: 'Swiss chard',
    elementalProperties: { Water: 0.39, Earth: 0.33, Air: 0.21, Fire: 0.07 },
    qualities: ['cooling', 'cleansing'],
    season: ['summer', 'fall'],
    category: 'vegetable',
    subCategory: 'leafy green',
    affinities: ['garlic', 'beans', 'lemon', 'pine nuts'],
    cookingMethods: ['steamed', 'sautéed', 'braised'],
    ...generateVegetableAttributes({
      water: 87, 
      fiber: 7, 
      bitterness: 5, 
      cooking_time: 5
    }),
    seasonal_peak_months: [6, 7, 8, 9], // Jun-Sep
    stalk_to_leaf_ratio: 0.6, // Higher means more stalk
    color_varieties: ['green', 'red', 'yellow', 'rainbow'],
    colorant_strength: 6.2, // How much it colors cooking liquid, 1-10
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['k', 'a', 'c'],
      minerals: ['magnesium', 'potassium', 'iron'],
      calories: 19,
      protein_g: 1.8,
      fiber_g: 1.9,
      vitamin_density: 7.9
    },
    preparation: {
      washing: true,
      stemming: 'separate stems from leaves',
      notes: 'Cook stems longer than leaves'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '3-5 days',
      notes: 'Wrap in damp paper towel',
      sensitivity: 7 // 1-10 scale of how quickly it spoils
    }
  }
};

// Fix the ingredient mappings to ensure they have all required properties
export const leafyGreens: Record<string, IngredientMapping> = fixIngredientMappings(rawLeafyGreens);
