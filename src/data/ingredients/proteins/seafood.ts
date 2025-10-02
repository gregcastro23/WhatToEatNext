import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

// Phase 2: Enhanced Seafood with Quantity Scaling Metadata
// Generated: 2025-01-24
const rawSeafood: Record<string, Partial<IngredientMapping>> = {
  atlantic_salmon: {
    name: 'Salmon',
    category: 'protein',
    subCategory: 'seafood',

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.6, Earth: 0.2, Fire: 0.1, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['Cancer', 'Pisces', 'Scorpio'],
      seasonalAffinity: ['all']
    },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 170, unit: 'g' }, // Standard serving: 6oz fillet
    scaledElemental: { Water: 0.58, Earth: 0.21, Fire: 0.11, Air: 0.1 }, // Scaled for harmony
    alchemicalProperties: { Spirit: 0.105, Essence: 0.395, Matter: 0.21, Substance: 0.105 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: -0.1, forceMagnitude: 1.05 }, // Cooling effect, moderate force

    qualities: ['omega-rich', 'flaky', 'buttery', 'mild', 'versatile', 'nutrient-dense'],
    origin: ['Norway', 'Scotland', 'Chile', 'Canada', 'United States'],

    // Nutritional information (standardized)
    nutritionalProfile: {
      serving_size: '3 oz (85g)',
      calories: 206,
      macros: {
        protein: 22,
        carbs: 0,
        fat: 12,
        fiber: 0,
      },
      vitamins: {
        B12: 1.17, // Values as percentage of RDA
        D: 0.66,
        niacin: 0.5,
        B6: 0.38,
        pantothenic_acid: 0.3,
        thiamine: 0.28,
      },
      minerals: {
        selenium: 0.75,
        phosphorus: 0.2,
        potassium: 0.08,
      },
      omega3: 1.8, // grams per serving
      source: 'USDA FoodData Central',
    },

    // Sensory profile (standardized)
    sensoryProfile: {
      taste: {
        sweet: 0.3,
        salty: 0.2,
        sour: 0.0,
        bitter: 0.0,
        umami: 0.8,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.0,
        fruity: 0.0,
        herbal: 0.0,
        spicy: 0.0,
        earthy: 0.3,
        woody: 0.0,
      },
      texture: {
        crisp: 0.0,
        tender: 0.7,
        creamy: 0.4,
        chewy: 0.2,
        crunchy: 0.0,
        silky: 0.7,
      },
    },

    // Storage information (standardized)
    storage: {
      temperature: {
        fahrenheit: 32,
        celsius: 0,
      },
      duration: '1-2 days (fresh), 2-3 months (frozen)',
      container: 'airtight wrapping',
      tips: [
        'Keep in coldest part of refrigerator',
        'Use within 24 hours of purchase for best flavor',
        'Wrap in moisture-proof paper or plastic before freezing',
      ],
    },

    // Preparation (standardized)
    preparation: {
      methods: ['grill', 'bake', 'pan-sear', 'poach', 'steam', 'smoke', 'raw (sushi-grade)'],
      washing: false,
      notes: 'Leave skin on during cooking for easier handling and extra nutrients',
    },

    // Health benefits (standardized)
    healthBenefits: [
      'Heart health (reduces blood pressure and inflammation)',
      'Brain function (enhances memory and cognitive performance)',
      'Joint health (reduces stiffness and arthritis symptoms)',
      'Weight management (protein-rich and satiating)',
      'Thyroid health (good source of selenium)',
      'Bone health (contains vitamin D and phosphorus)',
      'Mental well-being (omega-3s may help reduce depression symptoms)',
    ],

    // Culinary applications (standardized)
    culinaryApplications: {
      commonUses: ['entrees', 'salads', 'sushi', 'appetizers', 'sandwiches', 'breakfast dishes'],
      pairingRecommendations: {
        complementary: [
          'lemon',
          'dill',
          'capers',
          'butter',
          'olive oil',
          'garlic',
          'white wine',
          'fennel',
        ],
        contrasting: ['dijon mustard', 'maple syrup', 'soy sauce', 'ginger', 'cucumber'],
        toAvoid: ['strong cheeses', 'chocolate', 'most red wine', 'very spicy peppers'],
      },
      seasonalPeak: ['spring', 'summer'],
      techniques: {
        grill: {
          method: 'direct heat, medium-high',
          temperature: { celsius: 190, fahrenheit: 375 },
          timing: '4-5 minutes per side',
          ingredients: ['butter', 'garlic', 'dill', 'lemon zest'],
          notes: 'Cedar plank adds smoky flavor',
        },
        pan_sear: {
          method: 'high heat, skin-on',
          timing: '4-5 minutes skin side, 2-3 minutes flesh side',
          ingredients: ['butter', 'thyme', 'garlic', 'lemon'],
          notes: 'Start with very hot pan, cook skin side first until crispy',
        },
      },
    },

    // Varieties (standardized)
    varieties: {
      'Farm Raised': {
        name: 'Farm Raised',
        appearance: 'light orange-pink',
        texture: 'fatty, soft',
        flavor: 'mild, buttery',
        uses: 'all-purpose',
      },
    },

    // Category-specific extension: proteins
    cuts: {
      fillet: {
        description: 'boneless side',
        weight: '6-8 oz per serving',
        notes: 'most versatile',
        cookingMethods: ['grill', 'bake', 'pan-sear', 'poach'],
      },
      steak: {
        description: 'cross-section cut',
        weight: '8-10 oz',
        notes: 'good for grilling',
        cookingMethods: ['grill', 'bake'],
      },
      whole_side: {
        description: 'entire fillet',
        weight: '2-4 lbs',
        notes: 'ideal for large gatherings',
        cookingMethods: ['bake', 'smoke', 'grill'],
      },
    },

    cookingTips: {
      internalTemperature: {
        medium: { fahrenheit: 125, celsius: 52 },
        mediumWell: { fahrenheit: 135, celsius: 57 },
        safe: { fahrenheit: 145, celsius: 63 },
      },
      restingTime: '3-5 minutes',
      commonMistakes: [
        'Overcooking (becomes dry)',
        'Starting in a cold pan (causes sticking)',
        'Removing skin (provides barrier during cooking)',
        'Cooking straight from refrigerator (uneven cooking)',
      ],
    },

    sustainability: {
      rating: 'Variable',
      considerations: [
        'Farming methods impact environmental footprint',
        'Look for ASC or MSC certification',
        'Closed containment farming reduces environmental impact',
      ],
      alternatives: ['Arctic char', 'Rainbow trout', 'MSC-certified wild salmon'],
    },

    // Protein-specific properties
    proteinContent: 22, // grams per 3oz serving
    fatProfile: {
      saturated: 3, // grams per 3oz serving
      omega3: 1.8,
    },
  },

  // Phase 2: Additional Seafood with Quantity Scaling
  tuna: {
    name: 'Tuna',
    category: 'protein',
    subCategory: 'seafood',

    // Base elemental properties (unscaled)
    elementalProperties: { Fire: 0.3, Water: 0.4, Air: 0.2, Earth: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['Cancer', 'Pisces', 'Scorpio'],
      seasonalAffinity: ['all']
    },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 150, unit: 'g' }, // Standard serving: 5oz steak
    scaledElemental: { Fire: 0.29, Water: 0.41, Air: 0.2, Earth: 0.1 }, // Scaled for harmony
    alchemicalProperties: { Spirit: 0.19, Essence: 0.31, Matter: 0.1, Substance: 0.2 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.15, forceMagnitude: 1.12 }, // Warming effect, strong force

    qualities: ['meaty', 'firm', 'versatile', 'protein-rich', 'omega-3'],
    origin: ['Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean'],

    elementalProperties: { Fire: 0.3, Water: 0.4, Air: 0.2, Earth: 0.1 },
    qualities: ['meaty', 'firm', 'versatile', 'protein-rich', 'omega-3'],
    origin: ['Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean'],

    nutritionalProfile: {
      serving_size: '4 oz (113g)',
      calories: 184,
      macros: { protein: 42, carbs: 0, fat: 1, fiber: 0 },
      vitamins: { B12: 1.5, D: 0.4, niacin: 0.8 },
      minerals: { selenium: 0.9, phosphorus: 0.3 },
      omega3: 2.1,
      source: 'USDA FoodData Central',
    },

    preparation: {
      methods: ['sear', 'grill', 'raw (sashimi)', 'canned'],
      washing: false,
      notes: 'Can be eaten raw or cooked to desired doneness',
    },

    healthBenefits: ['High-quality protein', 'Omega-3 fatty acids', 'Heart health'],
  },

  shrimp: {
    name: 'Shrimp',
    category: 'protein',
    subCategory: 'seafood',

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.5, Air: 0.3, Fire: 0.1, Earth: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['Cancer', 'Pisces', 'Scorpio'],
      seasonalAffinity: ['all']
    },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 100, unit: 'g' }, // Standard serving: 3.5oz
    scaledElemental: { Water: 0.49, Air: 0.31, Fire: 0.1, Earth: 0.1 }, // Scaled for harmony
    alchemicalProperties: { Spirit: 0.155, Essence: 0.345, Matter: 0.1, Substance: 0.1 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.05, forceMagnitude: 0.95 }, // Mild warming, gentle force

    qualities: ['sweet', 'tender', 'versatile', 'quick-cooking', 'low-calorie'],
    origin: ['Gulf of Mexico', 'Pacific Ocean', 'Atlantic Ocean'],

    elementalProperties: { Water: 0.5, Air: 0.3, Fire: 0.1, Earth: 0.1 },
    qualities: ['sweet', 'tender', 'versatile', 'quick-cooking', 'low-calorie'],
    origin: ['Gulf of Mexico', 'Pacific Ocean', 'Atlantic Ocean'],

    nutritionalProfile: {
      serving_size: '7 large (100g)',
      calories: 85,
      macros: { protein: 20, carbs: 0, fat: 1, fiber: 0 },
      vitamins: { B12: 1.1, niacin: 0.2 },
      minerals: { selenium: 0.4, phosphorus: 0.2 },
      omega3: 0.3,
      source: 'USDA FoodData Central',
    },

    preparation: {
      methods: ['sauté', 'grill', 'boil', 'steam', 'raw'],
      washing: true,
      notes: 'Thaw frozen shrimp before cooking',
    },

    healthBenefits: ['High protein', 'Low fat', 'Good source of selenium'],
  },

  cod: {
    name: 'Cod',
    category: 'protein',
    subCategory: 'seafood',

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.6, Air: 0.2, Earth: 0.1, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['Cancer', 'Pisces', 'Scorpio'],
      seasonalAffinity: ['all']
    },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 140, unit: 'g' }, // Standard serving: 5oz fillet
    scaledElemental: { Water: 0.58, Air: 0.21, Earth: 0.11, Fire: 0.1 }, // Scaled for harmony
    alchemicalProperties: { Spirit: 0.155, Essence: 0.395, Matter: 0.105, Substance: 0.105 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: -0.05, forceMagnitude: 1.02 }, // Cooling effect, slight force

    qualities: ['mild', 'flaky', 'lean', 'versatile', 'sustainable'],
    origin: ['North Atlantic', 'Pacific Ocean'],

    elementalProperties: { Water: 0.6, Air: 0.2, Earth: 0.1, Fire: 0.1 },
    qualities: ['mild', 'flaky', 'lean', 'versatile', 'sustainable'],
    origin: ['North Atlantic', 'Pacific Ocean'],

    nutritionalProfile: {
      serving_size: '5 oz (142g)',
      calories: 119,
      macros: { protein: 26, carbs: 0, fat: 1, fiber: 0 },
      vitamins: { B12: 1.2, D: 0.3 },
      minerals: { selenium: 0.5, phosphorus: 0.3 },
      omega3: 0.2,
      source: 'USDA FoodData Central',
    },

    preparation: {
      methods: ['bake', 'pan-fry', 'poach', 'steam'],
      washing: false,
      notes: 'Delicate texture, avoid overcooking',
    },

    healthBenefits: ['Lean protein', 'Vitamin B12', 'Omega-3 fatty acids'],
  },

  halibut: {
    name: 'Halibut',
    category: 'protein',
    subCategory: 'seafood',

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.4, Air: 0.3, Earth: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['Cancer', 'Pisces', 'Scorpio'],
      seasonalAffinity: ['all']
    },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 160, unit: 'g' }, // Standard serving: 6oz fillet
    scaledElemental: { Water: 0.39, Air: 0.31, Earth: 0.2, Fire: 0.1 }, // Scaled for harmony
    alchemicalProperties: { Spirit: 0.205, Essence: 0.295, Matter: 0.1, Substance: 0.2 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.02, forceMagnitude: 1.08 }, // Neutral temperature, moderate force

    qualities: ['firm', 'meaty', 'mild', 'versatile', 'premium'],
    origin: ['North Pacific', 'North Atlantic'],

    elementalProperties: { Water: 0.4, Air: 0.3, Earth: 0.2, Fire: 0.1 },
    qualities: ['firm', 'meaty', 'mild', 'versatile', 'premium'],
    origin: ['North Pacific', 'North Atlantic'],

    nutritionalProfile: {
      serving_size: '6 oz (170g)',
      calories: 223,
      macros: { protein: 43, carbs: 0, fat: 5, fiber: 0 },
      vitamins: { B12: 2.1, D: 0.8, niacin: 0.6 },
      minerals: { selenium: 0.8, phosphorus: 0.4 },
      omega3: 0.5,
      source: 'USDA FoodData Central',
    },

    preparation: {
      methods: ['grill', 'bake', 'pan-sear', 'poach'],
      washing: false,
      notes: 'Thick fillets, cook to medium doneness',
    },

    healthBenefits: ['High protein', 'Vitamin B12', 'Selenium'],
  },

  scallops: {
    name: 'Scallops',
    category: 'protein',
    subCategory: 'seafood',

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.5, Air: 0.3, Fire: 0.1, Earth: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['Cancer', 'Pisces', 'Scorpio'],
      seasonalAffinity: ['all']
    },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 80, unit: 'g' }, // Standard serving: 4 large scallops
    scaledElemental: { Water: 0.49, Air: 0.31, Fire: 0.1, Earth: 0.1 }, // Scaled for harmony
    alchemicalProperties: { Spirit: 0.155, Essence: 0.345, Matter: 0.1, Substance: 0.1 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.08, forceMagnitude: 0.92 }, // Mild warming, gentle force

    qualities: ['sweet', 'tender', 'succulent', 'briny', 'luxurious'],
    origin: ['Atlantic Ocean', 'Pacific Ocean'],

    elementalProperties: { Water: 0.5, Air: 0.3, Fire: 0.1, Earth: 0.1 },
    qualities: ['sweet', 'tender', 'succulent', 'briny', 'luxurious'],
    origin: ['Atlantic Ocean', 'Pacific Ocean'],

    nutritionalProfile: {
      serving_size: '4 large (80g)',
      calories: 94,
      macros: { protein: 21, carbs: 3, fat: 1, fiber: 0 },
      vitamins: { B12: 1.8, niacin: 0.3 },
      minerals: { selenium: 0.3, phosphorus: 0.2 },
      omega3: 0.2,
      source: 'USDA FoodData Central',
    },

    preparation: {
      methods: ['sauté', 'grill', 'sear', 'raw'],
      washing: true,
      notes: 'Remove tough side muscle, pat dry before cooking',
    },

    healthBenefits: ['Lean protein', 'Vitamin B12', 'Low fat'],
  },
};

// Fix the ingredient mappings to ensure they have all required properties
export const seafood: Record<string, IngredientMapping> = fixIngredientMappings(rawSeafood);

// Create a collection of all seafood for export
export const _allSeafood = Object.values(seafood);

export default seafood;
