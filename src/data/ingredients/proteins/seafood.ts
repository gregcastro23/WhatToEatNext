import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

// Pattern AA: Ingredient Interface Restructuring
// Proper type annotation for raw ingredients to ensure IngredientMapping compatibility
const rawSeafood: Record<string, Partial<IngredientMapping>> = {
  atlantic_salmon: {
    name: 'Salmon',
    category: 'protein',
    subCategory: 'seafood',
    elementalProperties: { Water: 0.6, Earth: 0.2, Fire: 0.1, Air: 0.1 },
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
        fiber: 0
      },
      vitamins: {
        B12: 1.17, // Values as percentage of RDA
        D: 0.66,
        niacin: 0.5B6: 0.38,
        pantothenic_acid: 0.3,
        thiamine: 0.28
      },
      minerals: {
        selenium: 0.75,
        phosphorus: 0.2,
        potassium: 0.08
      },
      omega3: 1.8, // grams per serving
      source: 'USDA FoodData Central'
    },

    // Sensory profile (standardized)
    sensoryProfile: {
      taste: {
        sweet: 0.3,
        salty: 0.2,
        sour: 0.0,
        bitter: 0.0,
        umami: 0.8,
        spicy: 0.0
      },
      aroma: {
        floral: 0.0,
        fruity: 0.0,
        herbal: 0.0,
        spicy: 0.0,
        earthy: 0.3,
        woody: 0.0
      },
      texture: {
        crisp: 0.0,
        tender: 0.7,
        creamy: 0.4,
        chewy: 0.2,
        crunchy: 0.0,
        silky: 0.7
      }
    },

    // Storage information (standardized)
    storage: {
      temperature: {
        fahrenheit: 32,
        celsius: 0
      },
      duration: '1-2 days (fresh), 2-3 months (frozen)',
      container: 'airtight wrapping',
      tips: [
        'Keep in coldest part of refrigerator',
        'Use within 24 hours of purchase for best flavor',
        'Wrap in moisture-proof paper or plastic before freezing'
      ]
    },

    // Preparation (standardized)
    preparation: {
      methods: ['grill', 'bake', 'pan-sear', 'poach', 'steam', 'smoke', 'raw (sushi-grade)'],
      washing: false,
      notes: 'Leave skin on during cooking for easier handling and extra nutrients'
    },

    // Health benefits (standardized)
    healthBenefits: [
      'Heart health (reduces blood pressure and inflammation)',
      'Brain function (enhances memory and cognitive performance)',
      'Joint health (reduces stiffness and arthritis symptoms)',
      'Weight management (protein-rich and satiating)',
      'Thyroid health (good source of selenium)',
      'Bone health (contains vitamin D and phosphorus)',
      'Mental well-being (omega-3s may help reduce depression symptoms)'
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
          'fennel'
        ],
        contrasting: ['dijon mustard', 'maple syrup', 'soy sauce', 'ginger', 'cucumber'],
        toAvoid: ['strong cheeses', 'chocolate', 'most red wine', 'very spicy peppers']
      },
      seasonalPeak: ['spring', 'summer'],
      techniques: {
        grill: {
          method: 'direct heat, medium-high',
          temperature: { celsius: 190, fahrenheit: 375 },
          timing: '4-5 minutes per side',
          ingredients: ['butter', 'garlic', 'dill', 'lemon zest'],
          notes: 'Cedar plank adds smoky flavor'
        },
        pan_sear: {
          method: 'high heat, skin-on',
          timing: '4-5 minutes skin side2-3 minutes flesh side',
          ingredients: ['butter', 'thyme', 'garlic', 'lemon'],
          notes: 'Start with very hot pan, cook skin side first until crispy'
        }
      }
    },

    // Varieties (standardized)
    varieties: {
      'Farm Raised': {
        name: 'Farm Raised',
        appearance: 'light orange-pink',
        texture: 'fatty, soft',
        flavor: 'mild, buttery',
        uses: 'all-purpose'
      }
    },

    // Category-specific extension: proteins
    cuts: {
      fillet: {
        description: 'boneless side',
        weight: '6-8 oz per serving',
        notes: 'most versatile',
        cookingMethods: ['grill', 'bake', 'pan-sear', 'poach']
      },
      steak: {
        description: 'cross-section cut',
        weight: '8-10 oz',
        notes: 'good for grilling',
        cookingMethods: ['grill', 'bake']
      },
      whole_side: {
        description: 'entire fillet',
        weight: '2-4 lbs',
        notes: 'ideal for large gatherings',
        cookingMethods: ['bake', 'smoke', 'grill']
      }
    },

    cookingTips: {
      internalTemperature: {
        medium: { fahrenheit: 125, celsius: 52 },
        mediumWell: { fahrenheit: 135, celsius: 57 },
        safe: { fahrenheit: 145, celsius: 63 }
      },
      restingTime: '3-5 minutes',
      commonMistakes: [
        'Overcooking (becomes dry)',
        'Starting in a cold pan (causes sticking)',
        'Removing skin (provides barrier during cooking)',
        'Cooking straight from refrigerator (uneven cooking)'
      ]
    },

    sustainability: {
      rating: 'Variable',
      considerations: [
        'Farming methods impact environmental footprint',
        'Look for ASC or MSC certification',
        'Closed containment farming reduces environmental impact'
      ],
      alternatives: ['Arctic char', 'Rainbow trout', 'MSC-certified wild salmon']
    },

    // Protein-specific properties
    proteinContent: 22, // grams per 3oz serving
    fatProfile: {
      saturated: 3, // grams per 3oz serving
      monounsaturated: 4,
      polyunsaturated: 5,
      omega3: 1.8,
      omega6: 0.2
    },

    // Cooking details
    cookingMethods: [
      {
        name: 'Grill',
        method: 'direct heat, medium-high',
        temperature: { celsius: 190, fahrenheit: 375 },
        timing: '4-5 minutes per side',
        internalTemp: { celsius: 60, fahrenheit: 140 },
        moistureRetention: 0.7, // 70% moisture retention
        flavorDevelopment: {
          maillard: 0.8, // 0-1 scale
          caramelization: 0.5,
          smoky: 0.7,
          notes: 'Develops crispy exterior with moist interior'
        }
      },
      {
        name: 'Bake',
        method: 'dry heat',
        temperature: { fahrenheit: 400, celsius: 200 },
        timing: '12-15 minutes',
        internalTemp: { celsius: 60, fahrenheit: 140 },
        moistureRetention: 0.85,
        flavorDevelopment: {
          maillard: 0.5,
          caramelization: 0.4,
          aromatic: 0.7,
          notes: 'Even cooking with good moisture retention'
        }
      },
      {
        name: 'Pan-Sear',
        method: 'high heat, skin-on',
        temperature: 'medium-high',
        timing: {
          skinSide: '4-5 minutes',
          fleshSide: '2-3 minutes',
          resting: '3-4 minutes'
        },
        internalTemp: { celsius: 55, fahrenheit: 130 },
        moistureRetention: 0.75,
        flavorDevelopment: {
          maillard: 0.9,
          caramelization: 0.7,
          fatty: 0.8,
          notes: 'Creates crispy skin and keeps moisture sealed in'
        }
      }
    ],

    // Astrology / (elemental || 1) connections (standardized)
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        secondary: 'Earth',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Neptune' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Water: 0.1, Earth: 0.1 },
          preparationTips: ['Best for raw preparations']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for grilling']
        }
      },
      aspectEnhancers: ['Moon trine Neptune', 'Jupiter in pisces']
    }
  },
  shrimp_jumbo: {
    name: 'Shrimp Jumbo',
    category: 'protein',
    subCategory: 'seafood',
    elementalProperties: {
      Water: 0.5,
      Air: 0.3,
      Fire: 0.1,
      Earth: 0.1
    },
    sensoryProfile: {
      taste: ['Sweet', 'Delicate', 'Briny'],
      aroma: ['Ocean-fresh', 'Clean', 'Mild'],
      texture: ['Firm', 'Tender', 'Succulent'],
      notes: 'Sweet shellfish flavor with firm, meaty texture'
    },
    season: ['year-round'],
    preparation: {
      methods: ['peel', 'devein', 'butterfly', 'marinate'],
      timing: 'devein: 2-3 minutes per shrimp',
      notes: 'Keep chilled during preparation, cook immediately after thawing'
    },
    nutritionalProfile: {
      macronutrients: {
        protein: 18.0,
        carbohydrates: 0.9,
        fat: 0.3,
        fiber: 0.0
      },
      micronutrients: {
        selenium: 48.4,
        phosphorus: 201,
        choline: 69.3,
        vitamin_B12: 1.3
      },
      healthBenefits: ['high protein', 'low fat', 'selenium source', 'heart healthy'],
      caloriesPerServing: 84
    },
    storage: {
      temperature: 'below 40°F (4°C)',
      duration: '1-2 days fresh3-6 months frozen',
      container: 'airtight, moisture-proof',
      notes: 'Store on ice, use within 24 hours of purchase for best quality'
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ['sweet', 'delicate'],
        secondary: ['briny', 'clean'],
        notes: 'Mild shellfish flavor that pairs well with bold seasonings'
      },
      cookingMethods: ['grilling', 'sautéing', 'steaming', 'poaching', 'stir-frying'],
      cuisineAffinity: ['American', 'Asian', 'Mediterranean', 'Cajun', 'Italian'],
      preparationTips: [
        'Do not overcook - becomes rubbery',
        'Butterfly for faster, even cooking',
        'Marinate for 15-30 minutes maximum',
        'Cook until pink and opaque'
      ]
    },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'scorpio', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Water: 0.1, Fire: 0.1 },
          preparationTips: ['Best for grilling']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for steaming']
        }
      }
    },
    qualities: ['sweet', 'firm', 'versatile'],
    origin: ['Gulf Coast', 'South Pacific', 'Indian Ocean'],
    varieties: {
      Tiger: {
        name: 'Tiger',
        appearance: 'grey with black stripes',
        size: '13 / (15 || 1) to U / (10 || 1)',
        flavor: 'robust, briny',
        notes: 'ideal for grilling'
      },
      'Spot Prawns': {
        name: 'Spot Prawns',
        appearance: 'reddish with white spots',
        size: 'U / (10 || 1) to U / (8 || 1)',
        flavor: 'sweet, delicate',
        notes: 'premium Pacific variety'
      }
    },
    culinaryApplications: {
      grill: {
        name: 'Grill',
        shell_on: {
          method: 'direct high heat',
          preparation: 'butterfly, devein',
          marinade: {
            garlic_herb: ['olive oil', 'garlic', 'herbs'],
            spicy: ['chili', 'lime', 'cilantro'],
            asian: ['soy', 'ginger', 'sesame']
          },
          timing: '2-3 minutes per side',
          indicators: 'pink and opaque'
        },
        peeled: {
          method: 'skewered, high heat',
          preparation: 'devein, tail on / (off || 1)',
          marinade: {
            lemon_garlic: ['lemon', 'garlic', 'parsley'],
            cajun: ['paprika', 'cayenne', 'herbs'],
            teriyaki: ['soy', 'mirin', 'ginger']
          },
          timing: '1-2 minutes per side'
        }
      },
      poach: {
        name: 'Poach',
        court_bouillon: {
          base: ['water', 'wine', 'aromatics'],
          timing: '2-3 minutes total',
          technique: 'gentle simmer'
        },
        shell_on: {
          method: 'slow poach',
          timing: '3-4 minutes',
          cooling: 'ice bath immediately'
        }
      },
      stir_fry: {
        name: 'Stir Fry',
        preparation: 'peeled, deveined',
        technique: {
          velvet: {
            name: 'Velvet',
            marinade: ['egg white', 'cornstarch', 'rice wine'],
            method: 'oil blanch then stir-fry',
            timing: 'blanch 30 seconds, fry 1 minute'
          }
        }
      }
    },
    saucePairings: {
      cold: {
        name: 'Cold',
        cocktail: {
          name: 'Cocktail',
          base: 'tomato',
          ingredients: ['horseradish', 'lemon', 'worcestershire'],
          service: 'chilled, hanging presentation'
        },
        remoulade: {
          name: 'Remoulade',
          base: 'mayonnaise',
          ingredients: ['cajun spice', 'pickles', 'capers'],
          service: 'chilled, side sauce'
        }
      },
      hot: {
        name: 'Hot',
        scampi: {
          name: 'Scampi',
          base: 'butter-wine',
          ingredients: ['garlic', 'lemon', 'parsley'],
          finish: 'mount with butter'
        },
        curry: {
          name: 'Curry',
          base: 'coconut milk',
          variations: {
            thai: ['red curry', 'kaffir lime', 'basil'],
            indian: ['garam masala', 'tomato', 'cream']
          }
        },
        xo: {
          name: 'Xo',
          base: 'dried seafood-chili',
          preparation: 'sauce made ahead',
          usage: 'small amount as condiment'
        }
      }
    },
    seasonalAdjustments: {
      summer: {
        name: 'Summer',
        preparations: ['grilled', 'cold poached'],
        sauces: ['light herb', 'citrus based'],
        accompaniments: ['summer vegetables', 'cold salads']
      },
      winter: {
        name: 'Winter',
        preparations: ['stir-fried', 'curry'],
        sauces: ['rich coconut', 'spicy tomato'],
        accompaniments: ['hearty grains', 'roasted vegetables']
      }
    },
    safetyThresholds: {
      cooking: {
        temperature: { fahrenheit: 145, celsius: 63 },
        indicators: ['opaque throughout', 'pink-red color'],
        timing: 'until just cooked through'
      }
    }
  },
  lobster_maine: {
    name: 'lobster_maine',
    elementalProperties: { Water: 0.6, Earth: 0.3, Fire: 0.1, Air: 0.1 },

    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'scorpio', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Water: 0.1, Earth: 0.1 },
          preparationTips: ['Best for curing']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for poaching']
        }
      }
    },

    qualities: ['sweet', 'rich', 'luxurious'],
    origin: ['North Atlantic', 'Maine Coast'],
    category: 'protein',
    subCategory: 'shellfish',

    varieties: {
      'Hard Shell': {
        name: 'Hard Shell',
        appearance: 'dark blue-black shell',
        texture: 'firm, dense',
        flavor: 'sweet, briny',
        notes: 'best for boiling'
      },
      'Soft Shell': {
        name: 'Soft Shell',
        appearance: 'softer, lighter shell',
        texture: 'tender, delicate',
        flavor: 'sweet, mild',
        notes: 'ideal for grilling'
      }
    },

    culinaryApplications: {
      boil: {
        name: 'Boil',
        method: 'live lobster in salted water',
        timing: '8-10 minutes per pound',
        accompaniments: ['melted butter', 'lemon']
      },
      grill: {
        name: 'Grill',
        method: 'split and grill shell-side down',
        timing: '5-7 minutes',
        seasoning: ['butter', 'garlic', 'parsley']
      }
    },

    sensoryProfile: {
      taste: ['Mild', 'Balanced', 'Natural'],
      aroma: ['Fresh', 'Clean', 'Subtle'],
      texture: ['Pleasant', 'Smooth', 'Appealing'],
      notes: 'Characteristic lobster maine profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
        secondary: ['versatile'],
        notes: 'Versatile lobster maine for various uses'
      },

      cookingMethods: ['sautéing', 'steaming', 'roasting'],
      cuisineAffinity: ['Global', 'International'],
      preparationTips: ['Use as needed', 'Season to taste']
    },

    season: ['year-round'],

    preparation: {
      methods: ['standard preparation'],
      timing: 'as needed',
      notes: 'Standard preparation for lobster maine'
    },

    nutritionalProfile: {
      macronutrients: {
        protein: 5,
        carbohydrates: 10,
        fat: 2,
        fiber: 3
      },

      micronutrients: {
        vitamin_C: 15,
        iron: 5,
        calcium: 50
      },

      healthBenefits: ['nutritious', 'natural goodness'],
      caloriesPerServing: 80
    },

    storage: {
      temperature: 'cool, dry place',
      duration: '6-12 months',
      container: 'airtight container',
      notes: 'Store in optimal conditions'
    }
  },
  mussels_blue: {
    name: 'Blue Mussels',
    category: 'protein',
    subCategory: 'shellfish',
    elementalProperties: { Water: 0.6, Earth: 0.3, Fire: 0.05, Air: 0.05 },
    sensoryProfile: {
      taste: ['Briny', 'Sweet', 'Ocean-fresh'],
      aroma: ['Sea-like', 'Fresh', 'Mineral'],
      texture: ['Tender', 'Plump', 'Juicy'],
      notes: 'Clean ocean flavor with tender, succulent texture'
    },
    season: ['fall', 'winter', 'spring'],
    preparation: {
      methods: ['scrub', 'debeard', 'purge', 'discard-opened'],
      timing: 'preparation: 10-15 minutes',
      notes: 'Discard any mussels that do not close when tapped, cook within 24 hours'
    },
    nutritionalProfile: {
      macronutrients: {
        protein: 24.0,
        carbohydrates: 7.0,
        fat: 4.1,
        fiber: 0.0
      },
      micronutrients: {
        selenium: 89.6,
        vitamin_B12: 20.4,
        manganese: 6.8,
        phosphorus: 285
      },
      healthBenefits: ['high protein', 'vitamin B12 source', 'selenium rich', 'heart healthy'],
      caloriesPerServing: 146
    },
    storage: {
      temperature: 'below 40°F (4°C)',
      duration: '2-3 days live, cook immediately after death',
      container: 'breathable bag, not airtight',
      notes: 'Store live mussels in refrigerator, cover with damp cloth'
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ['briny', 'sweet'],
        secondary: ['ocean-fresh', 'mineral'],
        notes: 'Clean ocean flavor that absorbs cooking liquids beautifully'
      },
      cookingMethods: ['steaming', 'sautéing', 'grilling', 'baking', 'poaching'],
      cuisineAffinity: ['French', 'Italian', 'Spanish', 'Belgian', 'Mediterranean'],
      preparationTips: [
        'Steam until shells open, discard any that remain closed',
        'Cook quickly to prevent overcooking',
        'Clean and debeard before cooking',
        'Serve immediately after cooking'
      ]
    },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'scorpio', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Water: 0.1, Fire: 0.1 },
          preparationTips: ['Best for grilling']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for steaming']
        }
      }
    },
    qualities: ['briny', 'sweet', 'tender'],
    origin: ['North Atlantic', 'Mediterranean'],
    varieties: {
      'Farm Raised': {
        name: 'Farm Raised',
        appearance: 'cleaner shells',
        texture: 'tender, consistent',
        flavor: 'milder, sweeter',
        notes: 'more consistent size'
      }
    },
    culinaryApplications: {
      steam: {
        name: 'Steam',
        method: 'steam in white wine broth',
        timing: '5-7 minutes',
        accompaniments: ['garlic', 'shallots', 'parsley']
      },
      grill: {
        name: 'Grill',
        method: 'grill in shell until open',
        timing: '3-4 minutes',
        seasoning: ['garlic butter', 'lemon zest']
      }
    }
  },
  oysters_eastern: {
    name: 'Eastern Oysters',
    category: 'protein',
    subCategory: 'shellfish',
    elementalProperties: { Water: 0.65, Earth: 0.25, Fire: 0.05, Air: 0.05 },
    sensoryProfile: {
      taste: ['Briny', 'Creamy', 'Mineral', 'Sweet'],
      aroma: ['Ocean-fresh', 'Clean', 'Metallic'],
      texture: ['Creamy', 'Firm', 'Succulent'],
      notes: 'Complex mineral flavor with creamy texture and clean finish'
    },
    season: ['fall', 'winter', 'spring'],
    preparation: {
      methods: ['shuck', 'scrub', 'chill', 'serve-immediately'],
      timing: 'shucking: 1-2 minutes per oyster',
      notes: 'Keep chilled, serve within 2 hours of shucking, discard if shell is cracked'
    },
    storage: {
      temperature: 'below 40°F (4°C)',
      duration: '7-10 days live, consume immediately after shucking',
      container: 'cup-side down, covered with damp cloth',
      notes: 'Never store in airtight container or fresh water'
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ['briny', 'mineral'],
        secondary: ['creamy', 'sweet'],
        notes: 'Complex ocean flavor with distinctive mineral finish'
      },
      cookingMethods: ['raw', 'grilling', 'baking', 'frying', 'steaming'],
      cuisineAffinity: ['French', 'American', 'Japanese', 'Mediterranean'],
      preparationTips: [
        'Serve raw on half shell with mignonette',
        'Grill until edges curl slightly',
        'Bake with toppings until bubbly',
        'Fry until golden and crispy'
      ]
    },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'scorpio', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Water', planet: 'Neptune' }
        }
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Water: 0.1, Earth: 0.1 },
          preparationTips: ['Best for raw consumption']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for poaching or grilling']
        }
      }
    },
    qualities: ['briny', 'creamy', 'mineral-rich', 'sweet', 'meaty'],
    origin: ['East Coast of North America', 'Chesapeake Bay', 'Gulf of Mexico'],
    nutritionalProfile: {
      serving_size_oz: 3,
      calories: 81,
      protein: 9.45,
      fat: 2.3,
      carbohydrates: 4.95,
      minerals: {
        zinc: '166% DV',
        copper: '176% DV',
        vitamin_b12: '667% DV',
        iron: '28% DV',
        selenium: '140% DV',
        magnesium: '5% DV',
        potassium: '4% DV'
      }
    },
    healthBenefits: [
      'Brain health improvement (high in vitamin B12)',
      'Supports bone health (vitamin D, copper, zinc, manganese)',
      'Immune system support (high in zinc)',
      'Heart health (omega-3 fatty acids)',
      'Low in calories, high in protein'
    ],
    varieties: {
      'Blue Point': {
        name: 'Blue Point',
        appearance: 'teardrop shape, deep cup',
        flavor: 'balanced brininess, clean finish',
        texture: 'firm, plump',
        notes: 'classic East Coast oyster from Long Island'
      },
      Wellfleet: {
        name: 'Wellfleet',
        appearance: 'deep cup, fluted shell',
        flavor: 'sweet, clean finish with briny notes',
        texture: 'firm, juicy',
        notes: 'premium Massachusetts variety'
      },
      'Chesapeake Bay': {
        name: 'Chesapeake Bay',
        appearance: 'oval shape, medium cup',
        flavor: 'mild, slightly sweet with mineral finish',
        texture: 'medium-firm',
        notes: 'traditional classic from the Chesapeake region'
      }
    },
    culinaryApplications: {
      baked: {
        name: 'Baked',
        method: 'topped and baked in shell',
        timing: '10-12 minutes at 450°F (232°C)',
        preparations: {
          Rockefeller: {
            name: 'Rockefeller',
            ingredients: ['spinach', 'herbs', 'breadcrumbs', 'Pernod', 'parmesan']
          },
          Casino: {
            name: 'Casino',
            ingredients: ['bacon', 'bell pepper', 'breadcrumbs', 'butter', 'lemon juice']
          }
        }
      },
      stewed: {
        name: 'Stewed',
        method: 'simmered in liquid',
        timing: '3-5 minutes until edges curl',
        recipes: ['oyster stew', 'gumbo', 'chowder'],
        notes: 'add oysters at the end of cooking to prevent overcooking'
      }
    },
    seasonality: {
      peak: [
        'September',
        'October',
        'November',
        'December',
        'January',
        'February',
        'March',
        'April'
      ],
      notes:
        'Traditional 'R month' rule (months containing the letter R) indicates when wild oysters are at their best, though farmed oysters are available year-round'
    },
    safetyNotes: {
      handling: 'Keep refrigerated at 32-35°F (0-2°C)',
      consumption:
        'Raw consumption carries risk of Vibrio bacteria - immunocompromised individuals should avoid raw oysters',
      storage: 'Live oysters should be consumed within 7 days of harvest',
      quality: 'Discard any oysters with open shells that don't close when tapped'
    }
  },
  halibut_pacific: {
    name: 'Halibut Pacific',
    elementalProperties: {
      Water: 0.45,
      Air: 0.4,
      Earth: 0.1,
      Fire: 0.05
    },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'scorpio', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Water: 0.1, Earth: 0.1 },
          preparationTips: ['Best for curing']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for poaching']
        }
      }
    },
    qualities: ['lean', 'firm', 'delicate'],
    origin: ['North Pacific', 'Alaska'],
    category: 'seafood',
    subCategory: 'fish',
    varieties: {
      'Farm Raised': {
        name: 'Farm Raised',
        appearance: 'light orange-pink',
        texture: 'fatty, soft',
        flavor: 'mild',
        uses: 'all-purpose'
      }
    },
    cuts: {
      fillet: {
        name: 'Fillet',
        description: 'boneless side',
        weight: '6-8 oz per serving',
        notes: 'most versatile'
      },
      steak: {
        name: 'Steak',
        description: 'cross-section cut',
        weight: '8-10 oz',
        notes: 'good for grilling'
      },
      whole_side: {
        name: 'Whole Side',
        description: 'entire fillet',
        weight: '2-4 lbs',
        notes: 'ideal for large gatherings'
      }
    },
    culinaryApplications: {
      pan_sear: {
        name: 'Pan Sear',
        method: 'high heat, skin-on',
        temperature: 'medium-high',
        timing: {
          skin_side: '4-5 minutes',
          flesh_side: '2-3 minutes',
          resting: '3-4 minutes'
        },
        techniques: {
          crispy_skin: {
            name: 'Crispy Skin',
            method: 'pat dry, score skin',
            notes: 'press down gently when first added'
          },
          basting: {
            name: 'Basting',
            method: 'butter baste last minute',
            aromatics: ['thyme', 'garlic', 'lemon']
          }
        }
      },
      roast: {
        name: 'Roast',
        method: 'dry heat',
        temperature: {
          fahrenheit: 400,
          celsius: 200
        },
        timing: {
          per_inch: '10-12 minutes',
          resting: '5 minutes'
        },
        techniques: {
          en_papillote: {
            name: 'En Papillote',
            method: 'wrapped in parchment',
            ingredients: ['herbs', 'citrus', 'vegetables'],
            timing: '12-15 minutes'
          },
          glazed: {
            name: 'Glazed',
            method: 'brush with glaze',
            frequency: 'every 4-5 minutes',
            types: ['miso', 'honey-soy', 'maple']
          }
        }
      },
      sous_vide: {
        name: 'Sous Vide',
        method: 'vacuum sealed',
        temperature: {
          rare: {
            name: 'Rare',
            fahrenheit: 110,
            celsius: 43
          },
          medium_rare: {
            name: 'Medium Rare',
            fahrenheit: 120,
            celsius: 49
          }
        },
        timing: {
          minimum: '30 minutes',
          maximum: '45 minutes',
          optimal: '35 minutes'
        },
        finishing: {
          method: 'quick sear',
          duration: '30 seconds per side'
        }
      }
    },
    seasonalAdjustments: {
      summer: {
        name: 'Summer',
        methods: ['grill', 'raw'],
        preparations: {
          crudo: {
            name: 'Crudo',
            style: 'thin sliced',
            accompaniments: ['citrus', 'olive oil', 'sea salt']
          },
          poke: {
            name: 'Poke',
            style: 'cubed',
            marinades: ['soy', 'sesame', 'ginger']
          }
        }
      },
      winter: {
        name: 'Winter',
        methods: ['roast', 'poach'],
        preparations: {}
      }
    },
    storage: {
      fresh: {
        temperature: { fahrenheit: 32, celsius: 0 },
        duration: '1-2 days',
        method: 'on ice, uncovered'
      },
      frozen: {
        temperature: { fahrenheit: 0, celsius: -18 },
        duration: '3-4 months',
        method: 'vacuum sealed'
      },
      thawing: {
        preferred: {
          method: 'refrigerator',
          time: '24 hours'
        },
        alternate: {
          method: 'cold water',
          time: '1-2 hours',
          notes: 'keep sealed, change water every 30 minutes'
        }
      }
    },
    safetyThresholds: {
      raw: {
        requirements: ['sushi-grade', 'previously frozen'],
        freezing: {
          temperature: { fahrenheit: -4, celsius: -20 },
          duration: '7 days'
        }
      },
      cooked: {
        minimum: { fahrenheit: 145, celsius: 63 },
        resting: '3 minutes'
      }
    }
  },
  sea_bass_chilean: {
    name: 'sea_bass_chilean',
    elementalProperties: { Water: 0.4, Earth: 0.2, Fire: 0.3, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'scorpio', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Water: 0.1, Earth: 0.1 },
          preparationTips: ['Best for grilling']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for poaching']
        }
      }
    },
    qualities: ['buttery', 'rich', 'moist'],
    origin: ['South Pacific', 'Antarctic Waters'],
    category: 'protein',
    subCategory: 'white_fish',
    varieties: {
      Chilean: {
        name: 'Chilean',
        appearance: 'white with grey-black skin',
        texture: 'large, moist flakes',
        notes: 'premium variety'
      },
      European: {
        name: 'European',
        appearance: 'silvery with blue-grey back',
        texture: 'firmer, smaller flakes',
        notes: 'different species, similar usage'
      }
    },
    culinaryApplications: {
      steam: {
        name: 'Steam',
        method: 'gentle steam',
        timing: '8-10 minutes per inch',
        techniques: {
          chinese_style: {
            name: 'Chinese Style',
            preparation: 'whole fish',
            aromatics: ['ginger', 'scallion', 'cilantro'],
            sauce: 'soy-sesame'
          }
        }
      }
    },
    regionalPreparations: {
      new_england: {
        name: 'New England',
        classic_boiled: {
          name: 'Classic Boiled',
          service: ['drawn butter', 'lemon'],
          sides: ['corn', 'potatoes', 'steamers'],
          presentation: 'newspaper covered table'
        },
        lobster_roll: {
          name: 'Lobster Roll',
          bread: 'split-top bun, grilled',
          variations: {
            maine: {
              name: 'Maine',
              dressing: 'light mayo',
              seasoning: 'celery, herbs',
              temperature: 'chilled'
            },
            connecticut: {
              name: 'Connecticut',
              dressing: 'warm butter',
              seasoning: 'light herbs',
              temperature: 'warm'
            }
          }
        }
      }
    },
    seasonalAdjustments: {
      summer: {
        name: 'Summer',
        methods: ['grill', 'raw'],
        preparations: {
          crudo: {
            name: 'Crudo',
            style: 'thin sliced',
            accompaniments: ['citrus', 'olive oil', 'sea salt']
          },
          poke: {
            name: 'Poke',
            style: 'cubed',
            marinades: ['soy', 'sesame', 'ginger']
          }
        }
      },
      winter: {
        name: 'Winter',
        methods: ['roast', 'braise'],
        preparations: {}
      }
    },
    safetyThresholds: {
      cooking: {
        temperature: { fahrenheit: 145, celsius: 63 },
        visual: 'opaque, flakes easily'
      }
    }
  },
  cod_atlantic: {
    name: 'Cod Atlantic',
    elementalProperties: { Water: 0.7, Earth: 0.15, Air: 0.15, Fire: 0.1 },

    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'scorpio', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Water: 0.1, Earth: 0.1 },
          preparationTips: ['Best for curing']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for poaching']
        }
      }
    },

    qualities: ['mild', 'flaky', 'lean'],
    origin: ['North Atlantic', 'Baltic Sea'],
    category: 'seafood',
    subCategory: 'white_fish',

    varieties: {
      Atlantic: {
        name: 'Atlantic',
        appearance: 'white to off-white',
        texture: 'large, tender flakes',
        notes: 'traditional cod'
      },
      Pacific: {
        name: 'Pacific',
        appearance: 'similar to Atlantic',
        texture: 'slightly firmer',
        notes: 'more sustainable option'
      }
    },

    culinaryApplications: {
      traditional: {
        name: 'Traditional',
        fish_and_chips: {
          name: 'Fish And Chips',
          batter: {
            base: ['flour', 'beer', 'baking powder'],
            seasoning: ['salt', 'white pepper'],
            technique: 'cold batter, hot oil'
          },
          frying: {
            temperature: { fahrenheit: 350, celsius: 175 },
            timing: '4-5 minutes total',
            notes: 'until golden brown'
          }
        },
        salt_cod: {
          name: 'Salt Cod',
          preparation: {
            salting: '24-48 hours in salt',
            soaking: '24-36 hours, change water',
            ready: 'when properly rehydrated'
          },
          applications: {
            brandade: {
              name: 'Brandade',
              method: 'whipped with potato',
              ingredients: ['olive oil', 'garlic', 'cream'],
              service: 'warm with bread'
            },
            bacalao: {
              name: 'Bacalao',
              method: 'stewed',
              ingredients: ['tomatoes', 'peppers', 'olives'],
              style: 'Spanish or Portuguese'
            }
          }
        }
      },
      modern: {
        name: 'Modern',
        sous_vide: {
          name: 'Sous Vide',
          temperature: { fahrenheit: 140, celsius: 60 },
          timing: '25-30 minutes',
          finish: 'light sear optional'
        },
        pan_roasted: {
          name: 'Pan Roasted',
          method: 'sear then oven',
          temperature: { fahrenheit: 375, celsius: 190 },
          timing: '8-10 minutes total'
        }
      }
    },

    regionalPreparations: {
      british: {
        name: 'British'
      },
      portuguese: {
        name: 'Portuguese',
        bacalhau: {
          name: 'Bacalhau',
          variations: {
            a_bras: {
              name: 'A Bras',
              ingredients: ['potatoes', 'eggs', 'olives'],
              method: 'scrambled style'
            },
            a_gomes_de_sa: {
              name: 'A Gomes De Sa',
              ingredients: ['potatoes', 'onions', 'olives'],
              method: 'layered casserole'
            }
          }
        }
      },
      scandinavian: {
        name: 'Scandinavian',
        lutefisk: {
          name: 'Lutefisk',
          preparation: 'lye-treated cod',
          service: 'traditional Christmas',
          accompaniments: ['butter', 'bacon', 'peas']
        }
      }
    },

    saucePairings: {
      classic: {
        name: 'Classic',
        tartar: {
          name: 'Tartar',
          base: 'mayonnaise',
          ingredients: ['pickles', 'capers', 'herbs'],
          service: 'cold'
        },
        parsley: {
          name: 'Parsley',
          base: 'butter sauce',
          herbs: 'fresh parsley',
          finish: 'lemon juice'
        }
      },
      modern: {
        name: 'Modern',
        citrus_butter: {
          name: 'Citrus Butter',
          base: 'brown butter',
          citrus: ['orange', 'lemon'],
          finish: 'fresh herbs'
        },
        chorizo_oil: {
          name: 'Chorizo Oil',
          base: 'rendered chorizo',
          aromatics: ['garlic', 'herbs'],
          application: 'drizzle'
        }
      }
    },

    sensoryProfile: {
      taste: ['Mild', 'Balanced', 'Natural'],
      aroma: ['Fresh', 'Clean', 'Subtle'],
      texture: ['Pleasant', 'Smooth', 'Appealing'],
      notes: 'Characteristic cod atlantic profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
        secondary: ['versatile'],
        notes: 'Versatile cod atlantic for various uses'
      },

      cookingMethods: ['sautéing', 'steaming', 'roasting'],
      cuisineAffinity: ['Global', 'International'],
      preparationTips: ['Use as needed', 'Season to taste']
    },

    season: ['year-round'],

    preparation: {
      methods: ['standard preparation'],
      timing: 'as needed',
      notes: 'Standard preparation for cod atlantic'
    },

    nutritionalProfile: {
      macronutrients: {
        protein: 5,
        carbohydrates: 10,
        fat: 2,
        fiber: 3
      },

      micronutrients: {
        vitamin_C: 15,
        iron: 5,
        calcium: 50
      },

      healthBenefits: ['nutritious', 'natural goodness'],
      caloriesPerServing: 80
    },

    storage: {
      temperature: 'cool, dry place',
      duration: '6-12 months',
      container: 'airtight container',
      notes: 'Store in optimal conditions'
    }
  },
  sole_dover: {
    name: 'Sole Dover',
    elementalProperties: { Water: 0.6, Air: 0.35, Earth: 0.05, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'scorpio', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Water: 0.1, Earth: 0.1 },
          preparationTips: ['Best for grilling']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for poaching']
        }
      }
    },
    qualities: ['delicate', 'tender', 'mild'],
    origin: ['North Atlantic', 'Mediterranean'],
    category: 'seafood',
    subCategory: 'flatfish',
    varieties: {
      Dover: {
        name: 'Dover',
        appearance: 'light beige to white',
        texture: 'very delicate, thin fillets',
        notes: 'premium variety'
      }
    },
    culinaryApplications: {
      classic: {
        name: 'Classic',
        meuniere: {
          name: 'Meuniere',
          method: 'dredged and pan-fried',
          sauce: 'brown butter-lemon-parsley',
          timing: '2-3 minutes per side'
        },
        en_papillote: {
          name: 'En Papillote',
          method: 'steamed in parchment',
          ingredients: ['white wine', 'shallots', 'herbs'],
          timing: '8-10 minutes total'
        }
      },
      modern: {
        name: 'Modern',
        rolled: {
          name: 'Rolled',
          method: 'stuffed and rolled',
          fillings: ['seafood mousse', 'herbs', 'vegetables'],
          sauce: 'light cream or wine based'
        }
      }
    },
    regionalPreparations: {},
    saucePairings: {
      classic: {
        name: 'Classic',
        beurre_blanc: {
          name: 'Beurre Blanc',
          base: 'wine reduction',
          finish: 'cold butter mounting',
          variations: ['classic', 'herb', 'citrus']
        }
      },
      contemporary: {
        name: 'Contemporary',
        citrus_herb: {
          name: 'Citrus Herb',
          base: 'light butter sauce',
          citrus: ['orange', 'lemon'],
          herbs: ['chervil', 'tarragon']
        }
      }
    },
    seasonalAdjustments: {
      summer: {
        name: 'Summer',
        preparations: ['poached', 'grilled'],
        sauces: ['light herb', 'citrus'],
        accompaniments: ['fresh peas', 'asparagus']
      },
      winter: {
        name: 'Winter',
        preparations: ['pan-fried', 'baked'],
        sauces: ['richer cream', 'mushroom'],
        accompaniments: ['winter vegetables', 'potato puree']
      }
    },
    safetyThresholds: {
      cooking: {
        temperature: { fahrenheit: 145, celsius: 63 },
        visual: 'opaque, flakes easily',
        notes: 'very quick cooking due to thin fillets'
      }
    }
  },
  flounder_whole: {
    name: 'Flounder Whole',
    elementalProperties: { Water: 0.5, Air: 0.35, Earth: 0.1, Fire: 0.05 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'scorpio', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Water: 0.1, Earth: 0.1 },
          preparationTips: ['Best for grilling']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for poaching']
        }
      }
    },
    qualities: ['delicate', 'sweet', 'lean'],
    origin: ['North Atlantic', 'Pacific Coast'],
    category: 'seafood',
    subCategory: 'flatfish',
    varieties: {
      Summer: {
        name: 'Summer',
        appearance: 'brown top, white bottom',
        season: 'peak in summer',
        notes: 'preferred eating'
      },
      Winter: {
        name: 'Winter',
        appearance: 'darker coloring',
        season: 'peak in winter',
        notes: 'slightly firmer texture'
      }
    },
    culinaryApplications: {
      chinese: {
        name: 'Chinese',

        pan_fried: {
          name: 'Pan Fried',
          method: 'light dredge, pan-fried',
          sauce: 'sweet-sour',
          garnish: ['scallions', 'cilantro']
        }
      }
    },
    regionalPreparations: {},
    saucePairings: {},
    seasonalAdjustments: {
      summer: {
        name: 'Summer',
        preparations: ['steamed', 'grilled'],
        sauces: ['light soy', 'herb'],
        accompaniments: ['summer greens', 'light vegetables']
      },
      winter: {
        name: 'Winter',
        preparations: ['pan-fried', 'baked'],
        sauces: ['brown butter', 'light cream'],
        accompaniments: ['braised greens', 'root vegetables']
      }
    },
    safetyThresholds: {
      cooking: {
        temperature: { fahrenheit: 145, celsius: 63 },
        visual: 'opaque, flakes easily',
        notes: 'careful not to overcook'
      }
    }
  },
  sea_bass_mediterranean: {
    name: 'Sea Bass Mediterranean',
    elementalProperties: {
      Water: 0.4,
      Air: 0.25,
      Earth: 0.25,
      Fire: 0.1
    },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'scorpio', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Water: 0.1, Fire: 0.1 },
          preparationTips: ['Best for grilling']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for poaching']
        }
      }
    },
    qualities: ['delicate', 'mild', 'flaky'],
    origin: ['Mediterranean Sea', 'Atlantic Coast'],
    category: 'seafood',
    subCategory: 'fish',
    varieties: {
      Farmed: {
        name: 'Farmed',
        appearance: 'lighter coloring',
        texture: 'medium-firm',
        flavor: 'mild',
        uses: 'all-purpose'
      }
    },
    cuts: {
      whole: {
        name: 'Whole',
        description: 'entire fish, scaled and gutted',
        weight: '2-4 lbs',
        notes: 'ideal for roasting or grilling'
      },
      fillet: {
        name: 'Fillet',
        description: 'boneless sides',
        weight: '6-8 oz per serving',
        notes: 'versatile cut'
      }
    },
    culinaryApplications: {
      grilled_whole: {
        name: 'Grilled Whole',
        method: 'stuffed and grilled',
        temperature: 'medium-high',
        timing: {
          per_side: '6-8 minutes',
          total: '12-15 minutes',
          resting: '5 minutes'
        },
        techniques: {
          stuffing: {
            name: 'Stuffing',
            ingredients: ['herbs', 'citrus', 'garlic'],
            method: 'stuff cavity lightly'
          },
          scoring: {
            name: 'Scoring',
            method: 'diagonal cuts on sides',
            depth: '1 / (4 || 1) inch',
            purpose: 'even cooking'
          }
        }
      },
      pan_roasted: {
        name: 'Pan Roasted',
        method: 'skin-on fillet',
        temperature: {
          fahrenheit: 375,
          celsius: 190
        },
        timing: {
          skin_side: '4-5 minutes',
          flesh_side: '2-3 minutes',
          resting: '3-4 minutes'
        }
      }
    },
    seasonalAdjustments: {
      summer: {
        name: 'Summer',
        methods: ['grill', 'pan-sear'],
        preparations: {}
      },
      winter: {
        name: 'Winter',
        methods: ['roast', 'braise'],
        preparations: {}
      }
    },
    storage: {
      fresh: {
        temperature: { fahrenheit: 32, celsius: 0 },
        duration: '1-2 days',
        method: 'on ice, uncovered'
      },
      frozen: {
        temperature: { fahrenheit: 0, celsius: -18 },
        duration: '4-6 months',
        method: 'vacuum sealed'
      }
    },
    safetyThresholds: {
      cooked: {
        minimum: { fahrenheit: 145, celsius: 63 },
        visual: 'opaque, flakes easily',
        resting: '3-5 minutes'
      }
    }
  },
  octopus_mediterranean: {
    name: 'Octopus Mediterranean',
    elementalProperties: {
      Water: 0.35,
      Earth: 0.35,
      Fire: 0.2,
      Air: 0.1
    },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'scorpio', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Water: 0.1, Fire: 0.1 },
          preparationTips: ['Best for grilling']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for poaching']
        }
      }
    },
    qualities: ['tender', 'meaty', 'versatile'],
    origin: ['Mediterranean Sea', 'Pacific Ocean'],
    category: 'seafood',
    subCategory: 'cephalopod',
    varieties: {},
    preparation: {
      tenderizing: {
        name: 'Tenderizing',
        methods: ['massage with salt', 'freeze / (thaw || 1)'],
        timing: '15-20 minutes massage',
        notes: 'breaks down muscle fibers'
      },
      cleaning: {
        name: 'Cleaning',
        steps: ['remove beak', 'clean head cavity', 'remove eyes'],
        notes: 'careful with ink sac'
      }
    },
    culinaryApplications: {
      traditional_braise: {
        name: 'Traditional Braise',
        method: 'slow cook in aromatic liquid',
        temperature: {
          fahrenheit: 200,
          celsius: 93
        },
        timing: {
          total: '45-60 minutes',
          testing: 'pierce with knife for tenderness'
        },
        aromatics: ['wine', 'herbs', 'garlic', 'olive oil']
      }
    },
    regionalPreparations: {
      greek: {
        name: 'Greek',
        htapodi_sharas: {
          name: 'Htapodi Sharas',
          method: 'grilled with olive oil',
          service: 'with ladolemono sauce',
          accompaniments: ['oregano', 'lemon']
        }
      }
    },
    storage: {
      fresh: {
        temperature: { fahrenheit: 34, celsius: 1 },
        duration: '1-2 days',
        method: 'on ice, wrapped'
      },
      frozen: {
        temperature: { fahrenheit: 0, celsius: -18 },
        duration: '6-8 months',
        method: 'vacuum sealed'
      }
    }
  },
  scallops_sea: {
    name: 'Scallops Sea',
    elementalProperties: {
      Water: 0.6,
      Air: 0.25,
      Fire: 0.1,
      Earth: 0.05
    },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'scorpio', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Water: 0.1, Fire: 0.1 },
          preparationTips: ['Best for grilling']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for steaming']
        }
      }
    },
    qualities: ['delicate', 'sweet', 'lean'],
    origin: ['North Atlantic', 'Pacific Coast'],
    category: 'seafood',
    subCategory: 'shellfish',
    varieties: {
      Summer: {
        name: 'Summer',
        appearance: 'brown top, white bottom',
        season: 'peak in summer',
        notes: 'preferred eating'
      },
      Winter: {
        name: 'Winter',
        appearance: 'darker coloring',
        season: 'peak in winter',
        notes: 'slightly firmer texture'
      }
    },
    culinaryApplications: {
      chinese: {
        name: 'Chinese',

        pan_fried: {
          name: 'Pan Fried',
          method: 'light dredge, pan-fried',
          sauce: 'sweet-sour',
          garnish: ['scallions', 'cilantro']
        }
      }
    },
    regionalPreparations: {},
    saucePairings: {},
    seasonalAdjustments: {
      summer: {
        name: 'Summer',
        preparations: ['steamed', 'grilled'],
        sauces: ['light soy', 'herb'],
        accompaniments: ['summer greens', 'light vegetables']
      },
      winter: {
        name: 'Winter',
        preparations: ['pan-fried', 'baked'],
        sauces: ['brown butter', 'light cream'],
        accompaniments: ['braised greens', 'root vegetables']
      }
    },
    safetyThresholds: {
      cooking: {
        temperature: { fahrenheit: 145, celsius: 63 },
        visual: 'opaque, flakes easily',
        notes: 'careful not to overcook'
      }
    }
  },
  squid: {
    name: 'Squid',
    elementalProperties: { Water: 0.7, Earth: 0.15, Air: 0.15, Fire: 0 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'scorpio', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Water: 0.1, Fire: 0.1 },
          preparationTips: ['Best for grilling']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for poaching']
        }
      }
    },
    qualities: ['tender', 'meaty', 'versatile'],
    origin: ['Mediterranean Sea', 'Pacific Ocean'],
    category: 'seafood',
    subCategory: 'cephalopod',
    varieties: {},
    preparation: {
      tenderizing: {
        name: 'Tenderizing',
        methods: ['massage with salt', 'freeze / (thaw || 1)'],
        timing: '15-20 minutes massage',
        notes: 'breaks down muscle fibers'
      },
      cleaning: {
        name: 'Cleaning',
        steps: ['remove beak', 'clean head cavity', 'remove eyes'],
        notes: 'careful with ink sac'
      }
    },
    culinaryApplications: {
      traditional_braise: {
        name: 'Traditional Braise',
        method: 'slow cook in aromatic liquid',
        temperature: {
          fahrenheit: 200,
          celsius: 93
        },
        timing: {
          total: '45-60 minutes',
          testing: 'pierce with knife for tenderness'
        },
        aromatics: ['wine', 'herbs', 'garlic', 'olive oil']
      }
    },
    regionalPreparations: {
      greek: {
        name: 'Greek',
        htapodi_sharas: {
          name: 'Htapodi Sharas',
          method: 'grilled with olive oil',
          service: 'with ladolemono sauce',
          accompaniments: ['oregano', 'lemon']
        }
      }
    },
    storage: {
      fresh: {
        temperature: { fahrenheit: 34, celsius: 1 },
        duration: '1-2 days',
        method: 'on ice, wrapped'
      },
      frozen: {
        temperature: { fahrenheit: 0, celsius: -18 },
        duration: '6-8 months',
        method: 'vacuum sealed'
      }
    }
  },
  shrimp: {
    name: 'Shrimp',
    elementalProperties: { Water: 0.6, Air: 0.35, Earth: 0.05, Fire: 0 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'scorpio', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Water: 0.1, Fire: 0.1 },
          preparationTips: ['Best for grilling']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for steaming']
        }
      }
    },
    qualities: ['sweet', 'firm', 'versatile'],
    origin: ['Gulf Coast', 'South Pacific', 'Indian Ocean'],
    category: 'seafood',
    subCategory: 'shellfish',
    varieties: {
      Tiger: {
        name: 'Tiger',
        appearance: 'grey with black stripes',
        size: '13 / (15 || 1) to U / (10 || 1)',
        flavor: 'robust, briny',
        notes: 'ideal for grilling'
      },
      'Spot Prawns': {
        name: 'Spot Prawns',
        appearance: 'reddish with white spots',
        size: 'U / (10 || 1) to U / (8 || 1)',
        flavor: 'sweet, delicate',
        notes: 'premium Pacific variety'
      }
    },
    culinaryApplications: {
      grill: {
        name: 'Grill',
        shell_on: {
          method: 'direct high heat',
          preparation: 'butterfly, devein',
          marinade: {
            garlic_herb: ['olive oil', 'garlic', 'herbs'],
            spicy: ['chili', 'lime', 'cilantro'],
            asian: ['soy', 'ginger', 'sesame']
          },
          timing: '2-3 minutes per side',
          indicators: 'pink and opaque'
        },
        peeled: {
          method: 'skewered, high heat',
          preparation: 'devein, tail on / (off || 1)',
          marinade: {
            lemon_garlic: ['lemon', 'garlic', 'parsley'],
            cajun: ['paprika', 'cayenne', 'herbs'],
            teriyaki: ['soy', 'mirin', 'ginger']
          },
          timing: '1-2 minutes per side'
        }
      },
      poach: {
        name: 'Poach',
        court_bouillon: {
          base: ['water', 'wine', 'aromatics'],
          timing: '2-3 minutes total',
          technique: 'gentle simmer'
        },
        shell_on: {
          method: 'slow poach',
          timing: '3-4 minutes',
          cooling: 'ice bath immediately'
        }
      },
      stir_fry: {
        name: 'Stir Fry',
        preparation: 'peeled, deveined',
        technique: {
          velvet: {
            name: 'Velvet',
            marinade: ['egg white', 'cornstarch', 'rice wine'],
            method: 'oil blanch then stir-fry',
            timing: 'blanch 30 seconds, fry 1 minute'
          }
        }
      }
    },
    saucePairings: {
      cold: {
        name: 'Cold',
        cocktail: {
          name: 'Cocktail',
          base: 'tomato',
          ingredients: ['horseradish', 'lemon', 'worcestershire'],
          service: 'chilled, hanging presentation'
        },
        remoulade: {
          name: 'Remoulade',
          base: 'mayonnaise',
          ingredients: ['cajun spice', 'pickles', 'capers'],
          service: 'chilled, side sauce'
        }
      },
      hot: {
        name: 'Hot',
        scampi: {
          name: 'Scampi',
          base: 'butter-wine',
          ingredients: ['garlic', 'lemon', 'parsley'],
          finish: 'mount with butter'
        },
        curry: {
          name: 'Curry',
          base: 'coconut milk',
          variations: {
            thai: ['red curry', 'kaffir lime', 'basil'],
            indian: ['garam masala', 'tomato', 'cream']
          }
        },
        xo: {
          name: 'Xo',
          base: 'dried seafood-chili',
          preparation: 'sauce made ahead',
          usage: 'small amount as condiment'
        }
      }
    },
    seasonalAdjustments: {
      summer: {
        name: 'Summer',
        preparations: ['grilled', 'cold poached'],
        sauces: ['light herb', 'citrus'],
        accompaniments: ['summer vegetables', 'cold salads']
      },
      winter: {
        name: 'Winter',
        preparations: ['stir-fried', 'curry'],
        sauces: ['rich coconut', 'spicy tomato'],
        accompaniments: ['hearty grains', 'roasted vegetables']
      }
    },
    safetyThresholds: {
      cooking: {
        temperature: { fahrenheit: 145, celsius: 63 },
        indicators: ['opaque throughout', 'pink-red color'],
        timing: 'until just cooked through'
      }
    }
  }
};

// Fix the ingredient mappings to ensure they have all required properties
export const seafood: Record<string, IngredientMapping> = fixIngredientMappings(rawSeafood);

// Create a collection of all herbs for export
export const _allSeafood = Object.values(seafood);

export default seafood;
