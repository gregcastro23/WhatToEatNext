import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawSeafood: Record<string, Partial<IngredientMapping>> = {
  atlantic_salmon: {
    name: 'Salmon',
    category: 'protein',
    subCategory: 'seafood',
    elementalProperties: { Water: 0.6, Earth: 0.2, Fire: 0.1, Air: 0.1 },
    qualities: ['omega-rich', 'flaky', 'buttery', 'mild', 'versatile', 'nutrient-dense'],
    origin: ['Norway', 'Scotland', 'Chile', 'Canada', 'United States'],
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
        B12: 1.17,
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
      omega3: 1.8,
      source: 'USDA FoodData Central',
    },
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
    preparation: {
      methods: ['grill', 'bake', 'pan-sear', 'poach', 'steam', 'smoke', 'raw (sushi-grade)'],
      washing: false,
      notes: 'Leave skin on during cooking for easier handling and extra nutrients',
    },
    healthBenefits: [
      'Heart health (reduces blood pressure and inflammation)',
      'Brain function (enhances memory and cognitive performance)',
      'Joint health (reduces stiffness and arthritis symptoms)',
      'Weight management (protein-rich and satiating)',
      'Thyroid health (good source of selenium)',
      'Bone health (contains vitamin D and phosphorus)',
      'Mental well-being (omega-3s may help reduce depression symptoms)',
    ],
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
    varieties: {
      'Farm Raised': {
        name: 'Farm Raised',
        appearance: 'light orange-pink',
        texture: 'fatty, soft',
        flavor: 'mild, buttery',
        uses: 'all-purpose',
      },
    },
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
    proteinContent: 22,
    fatProfile: {
      saturated: 3,
      monounsaturated: 4,
      polyunsaturated: 5,
      omega3: 1.8,
      omega6: 0.2,
    },
    cookingMethods: [
      {
        name: 'Grill',
        method: 'direct heat, medium-high',
        temperature: { celsius: 190, fahrenheit: 375 },
        timing: '4-5 minutes per side',
        internalTemp: { celsius: 60, fahrenheit: 140 },
        moistureRetention: 0.7,
        flavorDevelopment: {
          maillard: 0.8,
          caramelization: 0.5,
          smoky: 0.7,
          notes: 'Develops crispy exterior with moist interior',
        },
      },
      {
        name: 'Bake',
        method: 'dry heat',
        temperature: { celsius: 200, fahrenheit: 400 },
        timing: '12-15 minutes',
        internalTemp: { celsius: 60, fahrenheit: 140 },
        moistureRetention: 0.85,
        flavorDevelopment: {
          maillard: 0.5,
          caramelization: 0.4,
          aromatic: 0.7,
          notes: 'Even cooking with good moisture retention',
        },
      },
      {
        name: 'Pan-Sear',
        method: 'high heat, skin-on',
        temperature: 'medium-high',
        timing: {
          skinSide: '4-5 minutes',
          fleshSide: '2-3 minutes',
          resting: '3-4 minutes',
        },
        internalTemp: { celsius: 55, fahrenheit: 130 },
        moistureRetention: 0.75,
        flavorDevelopment: {
          maillard: 0.9,
          caramelization: 0.7,
          fatty: 0.8,
          notes: 'Creates crispy skin and keeps moisture sealed in',
        },
      },
    ],
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        secondary: 'Earth',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Neptune' },
          third: { element: 'Air', planet: 'Mercury' },
        },
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Water: 0.1, Earth: 0.1 },
          preparationTips: ['Best for raw preparations'],
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for grilling'],
        },
      },
      aspectEnhancers: ['Moon trine Neptune', 'Jupiter in pisces'],
    },
  },
  shrimp_jumbo: {
    name: 'Shrimp Jumbo',
    category: 'protein',
    subCategory: 'seafood',
    elementalProperties: {
      Water: 0.5,
      Air: 0.3,
      Fire: 0.1,
      Earth: 0.1,
    },
    sensoryProfile: {
      taste: {
        sweet: 0.7,
        salty: 0.2,
        sour: 0.0,
        bitter: 0.0,
        umami: 0.6,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.0,
        fruity: 0.0,
        herbal: 0.1,
        spicy: 0.1,
        earthy: 0.2,
        woody: 0.0,
      },
      texture: {
        crisp: 0.0,
        tender: 0.6,
        creamy: 0.2,
        chewy: 0.1,
        crunchy: 0.0,
        silky: 0.3,
      },
    },
    preparation: {
      methods: ['peel', 'devein', 'butterfly', 'marinate'],
      timing: 'devein: 2-3 minutes per shrimp',
      notes: 'Keep chilled during preparation, cook immediately after thawing',
    },
    nutritionalProfile: {
      macronutrients: {
        protein: 18,
        carbs: 0.9,
        fat: 0.3,
        fiber: 0,
      },
      micronutrients: {
        selenium: 48.4,
        phosphorus: 201,
        choline: 69.3,
        vitamin_B12: 1.3,
      },
      healthBenefits: ['high protein', 'low fat', 'selenium source', 'heart healthy'],
      caloriesPerServing: 84,
    },
    storage: {
      temperature: 'below 40°F (4°C)',
      duration: '1-2 days fresh, 3-6 months frozen',
      container: 'airtight, moisture-proof',
      notes: 'Store on ice, use within 24 hours of purchase for best quality',
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ['sweet', 'delicate'],
        secondary: ['briny', 'clean'],
        notes: 'Mild shellfish flavor that pairs well with bold seasonings',
      },
      cookingMethods: ['grilling', 'sautéing', 'steaming', 'poaching', 'stir-frying'],
      cuisineAffinity: ['American', 'Asian', 'Mediterranean', 'Cajun', 'Italian'],
      preparationTips: [
        'Do not overcook - becomes rubbery',
        'Butterfly for faster, even cooking',
        'Marinate for 15-30 minutes maximum',
        'Cook until pink and opaque',
      ],
    },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'scorpio', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Mercury' },
        },
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Water: 0.1, Fire: 0.1 },
          preparationTips: ['Best for grilling'],
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for steaming'],
        },
      },
    },
    qualities: ['sweet', 'firm', 'versatile'],
    origin: ['Gulf Coast', 'South Pacific', 'Indian Ocean'],
    varieties: {
      Tiger: {
        name: 'Tiger',
        appearance: 'grey with black stripes',
        size: '13/15 to U/10',
        flavor: 'robust, briny',
        notes: 'ideal for grilling',
      },
      'Spot Prawns': {
        name: 'Spot Prawns',
        appearance: 'reddish with white spots',
        size: 'U/10 to U/8',
        flavor: 'sweet, delicate',
        notes: 'premium Pacific variety',
      },
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
            asian: ['soy', 'ginger', 'sesame'],
          },
          timing: '2-3 minutes per side',
          indicators: 'pink and opaque',
        },
        peeled: {
          method: 'skewered, high heat',
          preparation: 'devein, tail on or off',
          marinade: {
            lemon_garlic: ['lemon', 'garlic', 'parsley'],
            cajun: ['paprika', 'cayenne', 'herbs'],
            teriyaki: ['soy', 'mirin', 'ginger'],
          },
          timing: '1-2 minutes per side',
        },
      },
      poach: {
        name: 'Poach',
        court_bouillon: {
          base: ['water', 'wine', 'aromatics'],
          timing: '2-3 minutes total',
          technique: 'gentle simmer',
        },
        shell_on: {
          method: 'slow poach',
          timing: '3-4 minutes',
          cooling: 'ice bath immediately',
        },
      },
      stir_fry: {
        name: 'Stir Fry',
        preparation: 'peeled, deveined',
        technique: {
          velvet: {
            name: 'Velvet',
            marinade: ['egg white', 'cornstarch', 'rice wine'],
            method: 'oil blanch then stir-fry',
            timing: 'blanch 30 seconds, fry 1 minute',
          },
        },
      },
    },
    saucePairings: {
      cold: {
        name: 'Cold',
        cocktail: {
          name: 'Cocktail',
          base: 'tomato',
          ingredients: ['horseradish', 'lemon', 'worcestershire'],
          service: 'chilled, hanging presentation',
        },
        remoulade: {
          name: 'Remoulade',
          base: 'mayonnaise',
          ingredients: ['cajun spice', 'pickles', 'capers'],
          service: 'chilled, side sauce',
        },
      },
      hot: {
        name: 'Hot',
        scampi: {
          name: 'Scampi',
          base: 'butter-wine',
          ingredients: ['garlic', 'lemon', 'parsley'],
          finish: 'mount with butter',
        },
        curry: {
          name: 'Curry',
          base: 'coconut milk',
          variations: {
            thai: ['red curry', 'kaffir lime', 'basil'],
            indian: ['garam masala', 'tomato', 'cream'],
          },
        },
        xo: {
          name: 'XO',
          base: 'dried seafood-chili',
          preparation: 'sauce made ahead',
          usage: 'small amount as condiment',
        },
      },
    },
    seasonalAdjustments: {
      summer: {
        name: 'Summer',
        preparations: ['grilled', 'cold poached'],
        sauces: ['light herb', 'citrus based'],
        accompaniments: ['summer vegetables', 'cold salads'],
      },
      winter: {
        name: 'Winter',
        preparations: ['stir-fried', 'curry'],
        sauces: ['rich coconut', 'spicy tomato'],
        accompaniments: ['hearty grains', 'roasted vegetables'],
      },
    },
    safetyThresholds: {
      cooking: {
        temperature: { fahrenheit: 145, celsius: 63 },
        indicators: ['opaque throughout', 'pink-red color'],
        timing: 'until just cooked through',
      },
    },
  },
  lobster_maine: {
    name: 'Lobster Maine',
    category: 'protein',
    subCategory: 'shellfish',
    elementalProperties: { Water: 0.6, Earth: 0.3, Fire: 0.1, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'scorpio', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Mercury' },
        },
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Water: 0.1, Earth: 0.1 },
          preparationTips: ['Best for curing'],
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for poaching'],
        },
      },
    },
    qualities: ['sweet', 'rich', 'luxurious'],
    origin: ['North Atlantic', 'Maine Coast'],
    varieties: {
      'Hard Shell': {
        name: 'Hard Shell',
        appearance: 'dark blue-black shell',
        texture: 'firm, dense',
        flavor: 'sweet, briny',
        notes: 'best for boiling',
      },
      'Soft Shell': {
        name: 'Soft Shell',
        appearance: 'softer, lighter shell',
        texture: 'tender, delicate',
        flavor: 'sweet, mild',
        notes: 'ideal for grilling',
      },
    },
    culinaryApplications: {
      boil: {
        name: 'Boil',
        method: 'live lobster in salted water',
        timing: '8-10 minutes per pound',
        accompaniments: ['melted butter', 'lemon'],
      },
      grill: {
        name: 'Grill',
        method: 'split and grill shell-side down',
        timing: '5-7 minutes',
        seasoning: ['butter', 'garlic', 'parsley'],
      },
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced'],
        secondary: ['versatile'],
        notes: 'Versatile lobster for various uses',
      },
      cookingMethods: ['sautéing', 'steaming', 'roasting'],
      cuisineAffinity: ['Global', 'International'],
      preparationTips: ['Use as needed', 'Season to taste'],
    },
    season: ['year-round'],
    preparation: {
      methods: ['standard preparation'],
      timing: 'as needed',
      notes: 'Standard preparation for lobster',
    },
    nutritionalProfile: {
      macronutrients: {
        protein: 17,
        carbohydrates: 1,
        fat: 1,
        fiber: 0,
      },
      micronutrients: {
        vitamin_B12: 1.7,
        zinc: 0.36,
        selenium: 0.64,
      },
      caloriesPerServing: 80,
    },
    storage: {
      temperature: 'cool, moist environment',
      duration: '1-2 days live, cook immediately after',
      notes: 'Store with seaweed or damp cloth, never in fresh water',
    },
    safetyThresholds: {
      cooking: {
        temperature: { fahrenheit: 145, celsius: 63 },
        indicators: ['shell turns bright red', 'meat opaque and firm'],
        timing: 'until shell turns red and meat is opaque',
      },
    },
  },
  mussels_blue: {
    name: 'Blue Mussels',
    category: 'protein',
    subCategory: 'shellfish',
    elementalProperties: { Water: 0.6, Earth: 0.3, Fire: 0.05, Air: 0.05 },
    qualities: ['briny', 'sweet', 'tender'],
    origin: ['North Atlantic', 'Mediterranean'],
    season: ['fall', 'winter', 'spring'],
    preparation: {
      methods: ['scrub', 'debeard', 'purge', 'discard-opened'],
      timing: 'preparation: 10-15 minutes',
      notes: 'Discard any mussels that do not close when tapped; cook within 24 hours',
    },
    nutritionalProfile: {
      macronutrients: {
        protein: 24,
        carbohydrates: 7,
        fat: 4.1,
        fiber: 0,
      },
      micronutrients: {
        selenium: 89.6,
        vitamin_B12: 20.4,
        manganese: 6.8,
        phosphorus: 285,
      },
      healthBenefits: ['high protein', 'vitamin B12 source', 'selenium rich', 'heart healthy'],
      caloriesPerServing: 146,
    },
    storage: {
      temperature: 'below 40°F (4°C)',
      duration: '2-3 days live, cook immediately after death',
      container: 'breathable bag, not airtight',
      notes: 'Store live mussels in refrigerator, cover with damp cloth',
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ['briny', 'sweet'],
        secondary: ['ocean-fresh', 'mineral'],
        notes: 'Clean ocean flavor that absorbs cooking liquids beautifully',
      },
      cookingMethods: ['steaming', 'sautéing', 'grilling', 'baking', 'poaching'],
      cuisineAffinity: ['French', 'Italian', 'Spanish', 'Belgian', 'Mediterranean'],
      preparationTips: [
        'Steam until shells open, discard any that remain closed',
        'Cook quickly to prevent overcooking',
        'Clean and debeard before cooking',
        'Serve immediately after cooking',
      ],
    },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'scorpio', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Mercury' },
        },
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Water: 0.1, Fire: 0.1 },
          preparationTips: ['Best for grilling'],
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for steaming'],
        },
      },
    },
  },
  oysters_eastern: {
    name: 'Eastern Oysters',
    category: 'protein',
    subCategory: 'shellfish',
    elementalProperties: { Water: 0.65, Earth: 0.25, Fire: 0.05, Air: 0.05 },
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
        potassium: '4% DV',
      },
    },
    healthBenefits: [
      'Brain health improvement (high in vitamin B12)',
      'Supports bone health (vitamin D, copper, zinc, manganese)',
      'Immune system support (high in zinc)',
      'Heart health (omega-3 fatty acids)',
      'Low in calories, high in protein',
    ],
    varieties: {
      'Blue Point': {
        name: 'Blue Point',
        appearance: 'teardrop shape, deep cup',
        flavor: 'balanced brininess, clean finish',
        texture: 'firm, plump',
        notes: 'classic East Coast oyster from Long Island',
      },
      Wellfleet: {
        name: 'Wellfleet',
        appearance: 'deep cup, fluted shell',
        flavor: 'sweet, clean finish with briny notes',
        texture: 'firm, juicy',
        notes: 'premium Massachusetts variety',
      },
      'Chesapeake Bay': {
        name: 'Chesapeake Bay',
        appearance: 'oval shape, medium cup',
        flavor: 'mild, slightly sweet with mineral finish',
        texture: 'medium-firm',
        notes: 'traditional classic from the Chesapeake region',
      },
    },
    culinaryApplications: {
      baked: {
        name: 'Baked',
        method: 'topped and baked in shell',
        timing: '10-12 minutes at 450°F (232°C)',
        preparations: {
          Rockefeller: {
            name: 'Rockefeller',
            ingredients: ['spinach', 'herbs', 'breadcrumbs', 'Pernod', 'parmesan'],
          },
          Casino: {
            name: 'Casino',
            ingredients: ['bacon', 'bell pepper', 'breadcrumbs', 'butter', 'lemon juice'],
          },
        },
      },
      stewed: {
        name: 'Stewed',
        method: 'gently simmered in dairy-based broth',
        timing: '15-20 minutes',
        ingredients: ['cream', 'butter', 'onions', 'celery', 'herbs'],
      },
      grilled: {
        name: 'Grilled',
        method: 'grill in shell until edges curl',
        timing: '3-4 minutes',
        toppings: ['garlic butter', 'parsley', 'lemon zest'],
      },
    },
    storage: {
      temperature: 'below 40°F (4°C)',
      duration: '7-10 days live, consume immediately after shucking',
      container: 'cup-side down, covered with damp cloth',
      notes: 'Never store in airtight container or fresh water',
    },
    preparation: {
      methods: ['shuck', 'scrub', 'chill', 'serve-immediately'],
      timing: 'shucking: 1-2 minutes per oyster',
      notes: 'Keep chilled, serve within 2 hours of shucking, discard if shell is cracked',
    },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'scorpio', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Water', planet: 'Neptune' },
        },
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Water: 0.1, Earth: 0.1 },
          preparationTips: ['Best for raw consumption'],
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for poaching or grilling'],
        },
      },
    },
  },
};

export const seafood: Record<string, IngredientMapping> = fixIngredientMappings(rawSeafood);
export const _allSeafood = Object.values(seafood);
export default seafood;
