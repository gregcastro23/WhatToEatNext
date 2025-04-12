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
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Air: 0.1, Earth: 0.05 },
          preparationTips: ['Light preparations', 'Quick cooking methods']
        },
        fullMoon: {
          elementalBoost: { Water: 0.15, Air: 0.05 },
          preparationTips: ['Fermentation', 'Longer cooking processes']
        }
      },
      aspectEnhancers: ['Mercury trine Saturn', 'Moon in Virgo']
    },
    qualities: ['cleansing', 'strengthening', 'cooling', 'grounding', 'resilient'],
    origin: ['Mediterranean', 'Northern Europe'],
    season: ['fall', 'winter', 'early spring'],
    category: 'vegetable',
    subCategory: 'leafy green',
    affinities: ['garlic', 'olive oil', 'lemon', 'pine nuts', 'chili', 'tahini', 'mushrooms', 'apple'],
    cookingMethods: ['raw', 'steamed', 'sautéed', 'baked', 'braised', 'fermented', 'juiced', 'soup'],
    ...generateVegetableAttributes({
      water: 84, 
      fiber: 9, 
      bitterness: 7, 
      cooking_time: 8
    }),
    seasonal_peak_months: [10, 11, 12, 1, 2], // Oct-Feb
    nutritionalProfile: {
      serving_size: "1 cup, raw",
      calories: 33,
      macros: {
        protein: 3,
        carbs: 6.7,
        fat: 0.5,
        fiber: 2.5
      },
      vitamins: {
        K: 0.68,
        C: 0.80,
        A: 0.53,
        B6: 0.14,
        E: 0.10,
        folate: 0.07,
        B2: 0.09
      },
      minerals: {
        calcium: 0.15,
        potassium: 0.08,
        magnesium: 0.09,
        manganese: 0.32,
        copper: 0.11,
        iron: 0.06
      },
      phytonutrients: {
        glucosinolates: 0.85,
        quercetin: 0.52,
        kaempferol: 0.47,
        lutein: 0.40,
        zeaxanthin: 0.38
      },
      source: "USDA FoodData Central"
    },
    healthBenefits: [
      'Anti-inflammatory properties',
      'Supports cardiovascular health',
      'Rich in cancer-fighting compounds',
      'Promotes eye health (lutein and zeaxanthin)',
      'Supports detoxification pathways',
      'Aids digestive health through fiber content',
      'Contains calcium for bone health',
      'Supports immune function'
    ],
    varieties: {
      'Curly': {
        name: 'Curly Kale',
        appearance: 'ruffled leaves, vibrant green',
        texture: 'sturdy, slightly tough',
        flavor: 'peppery, slightly bitter',
        uses: 'salads, chips, sautés'
      },
      'Lacinato': {
        name: 'Lacinato (Dinosaur) Kale',
        appearance: 'long, narrow, bumpy dark leaves',
        texture: 'more tender than curly',
        flavor: 'earthy, slightly sweeter',
        uses: 'raw applications, Italian cuisine'
      },
      'Red Russian': {
        name: 'Red Russian Kale',
        appearance: 'flat, toothed edges, purple stems',
        texture: 'tender, delicate',
        flavor: 'mild, slightly sweet',
        uses: 'salads, quick cooking'
      },
      'Redbor': {
        name: 'Redbor Kale',
        appearance: 'deep purple-red, curly',
        texture: 'hearty, crisp',
        flavor: 'earthy, robust',
        uses: 'garnishes, sturdy cooking applications'
      }
    },
    preparation: {
      washing: true,
      stemming: 'remove tough stems',
      massage: 'when raw for tenderness',
      blanching: 'brief blanch to tenderize',
      storage_prep: 'dry completely before storing',
      notes: 'Becomes sweeter after frost exposure'
    },
    culinaryApplications: {
      'salad': {
        name: 'Salad',
        method: 'raw, massaged with oil and salt',
        ingredients: ['lemon juice', 'olive oil', 'salt', 'garlic'],
        notes: 'Massage 2-3 minutes to break down fibers'
      },
      'chips': {
        name: 'Kale Chips',
        method: 'baked or dehydrated',
        temperature: { fahrenheit: 300, celsius: 150 },
        timing: '10-15 minutes',
        ingredients: ['olive oil', 'salt', 'nutritional yeast', 'spices'],
        notes: 'Space evenly and watch carefully to prevent burning'
      },
      'sauté': {
        name: 'Sautéed Kale',
        method: 'quick cook in hot oil',
        timing: '5-7 minutes',
        ingredients: ['garlic', 'red pepper flakes', 'olive oil', 'lemon'],
        notes: 'Add liquid to help wilt if needed'
      },
      'soup': {
        name: 'Kale Soup',
        method: 'added to broth-based soups',
        timing: 'add 10 minutes before serving',
        techniques: 'chop finely for better texture',
        pairs_with: ['white beans', 'sausage', 'potatoes', 'carrots']
      },
      'smoothie': {
        name: 'Kale Smoothie',
        method: 'blended with fruits',
        ingredients: ['banana', 'pineapple', 'ginger', 'citrus'],
        notes: 'Freeze first for creamier texture'
      },
      'braise': {
        name: 'Braised Kale',
        method: 'slow-cooked with liquid',
        timing: '20-30 minutes',
        ingredients: ['onions', 'broth', 'vinegar', 'bay leaf'],
        notes: 'Becomes tender and flavorful'
      }
    },
    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      method: 'sealed container with paper towel',
      sensitivity: 4, // 1-10 scale of how quickly it spoils
      frozen: {
        method: 'blanch for 2 minutes, shock in ice water',
        duration: 'up to 6 months',
        notes: 'Best used in cooked applications after freezing'
      },
      dehydrated: {
        method: 'dry at 125°F until completely crisp',
        duration: 'up to 1 year in airtight container',
        notes: 'Rehydrate in warm water or add directly to soups'
      }
    },
    seasonalUses: {
      'winter': {
        name: 'Winter',
        preparations: ['hearty soups', 'stews', 'braised side dishes'],
        pairings: ['root vegetables', 'grains', 'legumes']
      },
      'summer': {
        name: 'Summer',
        preparations: ['raw salads', 'chilled soups', 'smoothies'],
        pairings: ['citrus', 'berries', 'light vinaigrettes']
      }
    },
    cuisineAffinity: {
      'mediterranean': 'used in soups and bean dishes',
      'northern_european': 'traditional side dish',
      'american_southern': 'slow-cooked with ham hock',
      'modern_health': 'smoothies and raw preparations',
      'asian_fusion': 'stir-fried with ginger and sesame'
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

// Create a collection of all leafy greens
export const allLeafyGreens = Object.values(leafyGreens);

export default leafyGreens;
