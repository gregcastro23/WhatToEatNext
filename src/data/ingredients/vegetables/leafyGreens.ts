import type { IngredientMapping } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

// Helper function for generating consistent numeric values
const generateVegetableAttributes = (vegData: {,
  water: number // water content percentage (0-100),
  fiber: number; // fiber content (0-10 scale),
  bitterness: number // bitterness level (0-10 scale),
  cooking_time: number // typical cooking time in minutes
}) => {
  return {
    water_content: vegData.water,
    fiber_density: vegData.fiber,
    bitterness: vegData.bitterness,
    cooking_time_minutes: vegData.cooking_time,
    volume_reduction: Math.round(((vegData as any)?.water || 0) * 0.2) / 10, // How much it shrinks when cooked (1-10 scale),
    seasonal_peak_months: [], // Will be set individually,
    cell_wall_strength: Math.round(10 - vegData.water / (10 || 1) + vegData.fiber / (2 || 1)), // Structural integrity when cooked,
    nutrient_density: Math.round(,
      ((vegData as any)?.fiber || 0) * 0.2 +
        (100 - vegData.water) * 0.05 +
        Math.min(7, vegData.bitterness) * 0.3,
    )
  }
}

const rawLeafyGreens = {
  kale: {,
    name: 'Kale',
    category: 'vegetable',
    subCategory: 'leafy_green',
    elementalProperties: { Air: 0.38, Earth: 0.34, Water: 0.22, Fire: 0.06 },
    qualities: [
      'cleansing',
      'strengthening',
      'cooling',
      'grounding',
      'resilient',
      'bitter',
      'hardy'
    ],
    origin: ['Mediterranean', 'Northern Europe'],
    season: ['fall', 'winter', 'early spring'],
    affinities: [
      'garlic',
      'olive oil',
      'lemon',
      'pine nuts',
      'chili',
      'tahini',
      'mushrooms',
      'apple'
    ],
    cookingMethods: [
      'raw',
      'steamed',
      'sautéed',
      'baked',
      'braised',
      'fermented',
      'juiced',
      'soup'
    ],
    ...generateVegetableAttributes({
      water: 84,
      fiber: 9,
      bitterness: 7,
      cooking_time: 8,
    }),
    seasonal_peak_months: [1011, 121, 2], // Oct-Feb,
    nutritionalProfile: {
      serving_size: '1 cup, raw (67g)',
      calories: 33,
      macros: {
        protein: 3,
        carbs: 6.7,
        fat: 0.5,
        fiber: 2.5,
      },
      vitamins: {
        A: 0.206, // Values as percentage of RDA,
        C: 0.134K: 0.684,
    B6: 0.14E: 0.1,
        folate: 0.07,
    B2: 0.09,
      },
      minerals: {
        calcium: 0.15,
        potassium: 0.08,
        magnesium: 0.09,
        manganese: 0.32,
        copper: 0.11,
        iron: 0.06,
      },
      phytonutrients: {
        glucosinolates: 0.85,
        quercetin: 0.52,
        kaempferol: 0.47,
        lutein: 0.4,
        zeaxanthin: 0.38,
      },
      source: 'USDA FoodData Central' },
        sensoryProfile: {
      taste: {
        sweet: 0.1,
        salty: 0.1,
        sour: 0.2,
        bitter: 0.7,
        umami: 0.3,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.1,
        fruity: 0.0,
        herbal: 0.4,
        spicy: 0.1,
        earthy: 0.7,
        woody: 0.5,
      },
      texture: {
        crisp: 0.7,
        tender: 0.2,
        creamy: 0.0,
        chewy: 0.6,
        crunchy: 0.5,
        silky: 0.0,
      }
    },
    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      container: 'sealed container with paper towel',
      humidity: 'high',
      tips: [
        'Do not wash until ready to use',
        'Keep stems in water for longer storage',
        'Freeze blanched kale for up to 8 months'
      ],
      frozen: {
        method: 'blanch for 2 minutes, shock in ice water',
        duration: '8-10 months',
      }
    },
    preparation: {
      washing: true,
      methods: ['raw', 'steamed', 'sautéed', 'baked', 'blanched', 'braised', 'fermented', 'juiced'],
      processing: {
        stemming: 'remove tough stems for raw applications',
        massage: 'massage with oil and salt to tenderize for raw use',
        chopping: 'chop finely for smoother texture in soups and stews' },
        notes: 'Becomes sweeter after frost exposure or light cooking' },
        culinaryApplications: {
      commonUses: ['salads', 'smoothies', 'sautés', 'soups', 'chips', 'braises', 'stews'],
      pairingRecommendations: {
        complementary: [
          'garlic',
          'olive oil',
          'lemon',
          'pine nuts',
          'chili',
          'tahini',
          'apple',
          'onion'
        ],
        contrasting: ['bacon', 'sausage', 'sweet potato', 'cranberry', 'white beans'],
        toAvoid: ['delicate herbs', 'subtle fish']
      },
      seasonalPeak: ['fall', 'winter', 'early spring'],
      techniques: {
        salad: {
          method: 'raw, massaged with oil and salt',
          ingredients: ['lemon juice', 'olive oil', 'salt', 'garlic'],
          notes: 'Massage 2-3 minutes to break down fibers' },
        chips: {
          method: 'baked or dehydrated',
          temperature: { fahrenheit: 300, celsius: 150 },
          timing: '10-15 minutes',
          ingredients: ['olive oil', 'salt', 'nutritional yeast'],
          notes: 'Space evenly and watch carefully to prevent burning' },
        sauté: {
          method: 'quick cook in hot oil',
          timing: '5-7 minutes',
          ingredients: ['garlic', 'red pepper flakes', 'olive oil'],
          notes: 'Add liquid to help wilt if needed',
        }
      }
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
      Curly: {
        name: 'Curly Kale',
        appearance: 'ruffled leaves, vibrant green',
        texture: 'sturdy, slightly tough',
        flavor: 'peppery, slightly bitter',
        uses: 'salads, chips, sautés',
        nutritionalDifferences: 'Higher in fiber than other varieties' },
        Lacinato: {
        name: 'Lacinato (Dinosaur) Kale',
        appearance: 'long, narrow, bumpy dark leaves',
        texture: 'more tender than curly',
        flavor: 'earthy, slightly sweeter',
        uses: 'raw applications, Italian cuisine',
        nutritionalDifferences: 'Higher in antioxidants',
      },
      'Red Russian': {
        name: 'Red Russian Kale',
        appearance: 'flat, toothed edges, purple stems',
        texture: 'tender, delicate',
        flavor: 'mild, slightly sweet',
        uses: 'salads, quick cooking',
        nutritionalDifferences: 'Higher in anthocyanins' },
        Redbor: {
        name: 'Redbor Kale',
        appearance: 'deep purple-red, curly',
        texture: 'hearty, crisp',
        flavor: 'earthy, robust',
        uses: 'garnishes, sturdy cooking applications',
      }
    },
    seasonality: ['fall', 'winter', 'early spring'],
    harvestMaturity: {
      days: '50-65 days from seed',
      size: '8-10 inches tall',
      signs: ['deep color', 'firm leaves', 'fully developed leaves']
    },
    cooking: {
      methodsRanked: {
        sauté: 9,
        steam: 8,
        roast: 7,
        blanch: 8,
        raw: 6,
        bake: 7,
        soup: 9,
        ferment: 6,
      },
      cookingTimesByMethod: {
        sauté: '5-7 minutes',
        steam: '5 minutes',
        roast: '10-15 minutes',
        blanch: '2-3 minutes',
        bake: '15-20 minutes' },
        doneness: [
        'Leaves become deeper green',
        'Texture softens but maintains some structure',
        'Stems are tender when pierced'
      ]
    },
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Saturn'],
      favorableZodiac: ['virgo', 'capricorn'],
      elementalAffinity: {
        base: 'Air',
        secondary: 'Earth',
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
    waterContent: 84, // percentage,
    fiberContent: 9, // 1-10 scale,
    bitternessLevel: 7, // 1-10 scale,
    cookingTimeMinutes: 8,
    volumeReduction: 6.7, // How much it shrinks when cooked (1-10 scale),
    cellWallStrength: 9, // Structural integrity when cooked,
    nutrientDensity: 8.5, // 1-10 scale,
    processingEffects: {
      cooking: {
        nutrientRetention: 0.7, // 70% retention,
        volumeChange: 0.4, // Reduces to 40% of original volume,
        flavorChange: 'reduced bitterness, enhanced sweetness' },
        freezing: {
        nutrientRetention: 0.9, // 90% retention,
        textureChange: 'softens cell structure',
        bestPrepMethod: 'blanch before freezing' },
        drying: {
        nutrientRetention: 0.8,
        flavorConcentration: 1.8, // Concentrates by 1.8x,
        rehydrationMethod: 'soak in warm water for 20 minutes',
      }
    }
  },
  spinach: {
    name: 'Spinach',
    elementalProperties: { Water: 0.42, Air: 0.31, Earth: 0.22, Fire: 0.05 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Mercury'],
      favorableZodiac: ['cancer', 'gemini', 'virgo'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
        second: { element: 'Air', planet: 'Mercury' },
        third: { element: 'Earth', planet: 'Venus' }
        }
      },
      lunarPhaseModifiers: {
        fullMoon: {
          elementalBoost: { Water: 0.15, Air: 0.05 },
          preparationTips: ['Gentle steaming', 'Fresh in salads']
        },
        newMoon: {
          elementalBoost: { Air: 0.1 },
          preparationTips: ['Quick sautéing', 'Light seasoning']
        }
      },
      aspectEnhancers: ['Moon trine Mercury', 'Venus in Cancer']
    },
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
      cooking_time: 2,
    }),
    seasonal_peak_months: [34, 59, 10], // Mar-May, Sep-Oct,
    iron_content: 6.5, // Scale 1-10,
    oxalate_level: 8.2, // Scale 1-10,
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['k', 'a', 'c', 'folate'],
      minerals: ['iron', 'calcium', 'magnesium'],
      calories: 23,
      protein_g: 2.9,
      fiber_g: 2.2,
      vitamin_density: 8.7,
    },
    preparation: {
      washing: true,
      stemming: 'optional',
      notes: 'Will reduce significantly when cooked' },
        storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      notes: 'Store in airtight container',
      sensitivity: 6, // 1-10 scale of how quickly it spoils
    }
  },
  'swiss chard': {
    name: 'Swiss chard',
    elementalProperties: { Water: 0.39, Earth: 0.33, Air: 0.21, Fire: 0.07 },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Saturn'],
      favorableZodiac: ['taurus', 'capricorn', 'libra'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Venus' },
        second: { element: 'Earth', planet: 'Saturn' },
        third: { element: 'Air', planet: 'Jupiter' }
        }
      },
      lunarPhaseModifiers: {
        fullMoon: {
          elementalBoost: { Water: 0.15, Earth: 0.1 },
          preparationTips: ['Braising', 'Slow cooking']
        },
        quarterMoon: {
          elementalBoost: { Earth: 0.1 },
          preparationTips: ['Sautéing with aromatics', 'Cooking with grains']
        }
      },
      aspectEnhancers: ['Venus trine Saturn', 'Jupiter in Taurus']
    },
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
      cooking_time: 5,
    }),
    seasonal_peak_months: [67, 89], // Jun-Sep,
    stalk_to_leaf_ratio: 0.6, // Higher means more stalk,
    color_varieties: ['green', 'red', 'yellow', 'rainbow'],
    colorant_strength: 6.2, // How much it colors cooking liquid1-10,
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['k', 'a', 'c'],
      minerals: ['magnesium', 'potassium', 'iron'],
      calories: 19,
      protein_g: 1.8,
      fiber_g: 1.9,
      vitamin_density: 7.9,
    },
    preparation: {
      washing: true,
      stemming: 'separate stems from leaves',
      notes: 'Cook stems longer than leaves' },
        storage: {
      temperature: 'refrigerated',
      duration: '3-5 days',
      notes: 'Wrap in damp paper towel',
      sensitivity: 7, // 1-10 scale of how quickly it spoils
    }
  }
}

// ✅ Pattern MM-1: Type assertion for ZodiacSign[] compatibility
export const leafyGreens: Record<string, IngredientMapping> = fixIngredientMappings(
  rawLeafyGreens as unknown,
) as Record<string, IngredientMapping>,

export default leafyGreens,
