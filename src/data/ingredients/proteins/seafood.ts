import type { IngredientMapping } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawSeafood: Record<string, Partial<IngredientMapping>> = {
  'atlantic_salmon': {
    name: 'Atlantic Salmon',
    category: 'protein',
    subCategory: 'seafood',
    elementalProperties: { Water: 0.6, Earth: 0.2, Fire: 0.1, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'pisces'],
      elementalAffinity: {
        base: 'Water',
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
    },
    qualities: ['omega-rich', 'flaky', 'buttery', 'mild', 'versatile'],
    origin: ['Norway', 'Scotland', 'Chile', 'Canada', 'United States'],
    nutritionalProfile: {
      calories: 206,
      protein: 22,
      fat: 12,
      carbohydrates: 0,
      minerals: {
        vitamin_b12: '117% DV',
        selenium: '75% DV',
        vitamin_d: '66% DV',
        niacin: '50% DV',
        vitamin_b6: '38% DV',
        pantothenic_acid: '30% DV',
        thiamine: '28% DV',
        phosphorus: '20% DV',
        potassium: '8% DV'
      },
      omega3: '1.8g per 6oz serving'
    },
    healthBenefits: [
      'Heart health (reduces blood pressure and inflammation)',
      'Brain function (enhances memory and cognitive performance)',
      'Joint health (reduces stiffness and arthritis symptoms)',
      'Weight management (protein-rich and satiating)',
      'Thyroid health (good source of selenium)',
      'Bone health (contains vitamin D and phosphorus)',
      'Mental well-being (omega-3s may help reduce depression symptoms)'
    ],
    sustainability: {
      rating: 'Variable',
      source: 'Depends on farming practices'
    },
    varieties: {
      'Farm Raised': {
        name: 'Farm Raised',
        appearance: 'light orange-pink',
        texture: 'fatty, soft',
        flavor: 'mild, buttery',
        uses: 'all-purpose'
      },
      'Wild': {
        name: 'Wild',
        appearance: 'deep orange-red',
        texture: 'firm, lean',
        flavor: 'robust',
        uses: 'premium preparations'
      }
    },
    cuts: {
      'fillet': {
        name: 'Fillet',
        description: 'boneless side',
        weight: '6-8 oz per serving',
        notes: 'most versatile'
      },
      'steak': {
        name: 'Steak',
        description: 'cross-section cut',
        weight: '8-10 oz',
        notes: 'good for grilling'
      },
      'whole_side': {
        name: 'Whole Side',
        description: 'entire fillet',
        weight: '2-4 lbs',
        notes: 'ideal for large gatherings'
      }
    },
    culinaryApplications: {
      'grill': {
        name: 'Grill',
        method: 'direct heat, medium-high',
        temperature: { celsius: 190, fahrenheit: 375 },
        timing: '4-5 minutes per side',
        preparations: {
          'herb_butter': {
            name: 'Herb Butter',
            ingredients: ['butter', 'garlic', 'dill', 'lemon zest'],
            notes: 'brush on while grilling'
          },
          'cedar_plank': {
            name: 'Cedar Plank',
            method: 'soak plank for 1 hour, place salmon on top',
            notes: 'adds smoky flavor'
          }
        }
      },
      'pan_sear': {
        name: 'Pan Sear',
        method: 'high heat, skin-on',
        temperature: 'medium-high',
        timing: {
          'skin_side': '4-5 minutes',
          'flesh_side': '2-3 minutes',
          'resting': '3-4 minutes'
        },
        techniques: {
          'crispy_skin': {
            name: 'Crispy Skin',
            method: 'pat dry, score skin',
            notes: 'press down gently when first added'
          },
          'basting': {
            name: 'Basting',
            method: 'butter baste last minute',
            aromatics: ['thyme', 'garlic', 'lemon']
          }
        }
      },
      'bake': {
        name: 'Bake',
        method: 'dry heat',
        temperature: {
          fahrenheit: 400,
          celsius: 200
        },
        timing: '12-15 minutes',
        techniques: {
          'en_papillote': {
            name: 'En Papillote',
            method: 'wrapped in parchment',
            ingredients: ['herbs', 'citrus', 'vegetables'],
            timing: '12-15 minutes'
          },
          'glazed': {
            name: 'Glazed',
            method: 'brush with glaze',
            frequency: 'every 4-5 minutes',
            types: ['miso', 'honey-soy', 'maple']
          }
        }
      },
      'sous_vide': {
        name: 'Sous Vide',
        method: 'vacuum sealed',
        temperature: {
          'rare': { name: 'Rare', fahrenheit: 110, celsius: 43 },
          'medium_rare': { name: 'Medium Rare', fahrenheit: 120, celsius: 49 },
          'medium': { name: 'Medium', fahrenheit: 130, celsius: 54 }
        },
        timing: {
          'minimum': '30 minutes',
          'maximum': '45 minutes',
          'optimal': '35 minutes'
        },
        finishing: {
          method: 'quick sear',
          duration: '30 seconds per side'
        }
      },
      'raw': {
        name: 'Raw',
        method: 'sushi or sashimi style',
        preparation: 'sushi-grade only, previously frozen',
        accompaniments: ['soy sauce', 'wasabi', 'pickled ginger'],
        notes: 'best for highest quality fresh salmon'
      }
    },
    seasonalAdjustments: {
      'summer': {
        name: 'Summer',
        methods: ['grill', 'raw'],
        preparations: {
          'crudo': {
            name: 'Crudo',
            style: 'thin sliced',
            accompaniments: ['citrus', 'olive oil', 'sea salt']
          },
          'poke': {
            name: 'Poke',
            style: 'cubed',
            marinades: ['soy', 'sesame', 'ginger']
          }
        }
      },
      'winter': {
        name: 'Winter',
        methods: ['roast', 'poach'],
        preparations: {
          'braised': {
            name: 'Braised',
            style: 'whole fillet',
            sauces: ['cream', 'wine', 'herb']
          }
        }
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
  'shrimp_jumbo': {
    name: 'Shrimp Jumbo',
    elementalProperties: { 
      Water: 0.5, 
      Air: 0.3, 
      Fire: 0.1, 
      Earth: 0.1 
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
    category: 'seafood',
    subCategory: 'shellfish',
    varieties: {
      'Gulf': {
    name: 'Gulf',
        appearance: 'pink-grey raw, pink cooked',
        size: '16/20 to U/15',
        flavor: 'sweet, mineral',
        notes: 'premium American variety'
      },
      'Tiger': {
    name: 'Tiger',
        appearance: 'grey with black stripes',
        size: '13/15 to U/10',
        flavor: 'robust, briny',
        notes: 'ideal for grilling'
      },
      'Spot Prawns': {
    name: 'Spot Prawns',
        appearance: 'reddish with white spots',
        size: 'U/10 to U/8',
        flavor: 'sweet, delicate',
        notes: 'premium Pacific variety'
      }
    },
    culinaryApplications: {
      'grill': {
    name: 'Grill',
        shell_on: {
          method: 'direct high heat',
          preparation: 'butterfly, devein',
          marinade: {
            'garlic_herb': ['olive oil', 'garlic', 'herbs'],
            'spicy': ['chili', 'lime', 'cilantro'],
            'asian': ['soy', 'ginger', 'sesame']
          },
          timing: '2-3 minutes per side',
          indicators: 'pink and opaque'
        },
        peeled: {
          method: 'skewered, high heat',
          preparation: 'devein, tail on/off',
          marinade: {
            'lemon_garlic': ['lemon', 'garlic', 'parsley'],
            'cajun': ['paprika', 'cayenne', 'herbs'],
            'teriyaki': ['soy', 'mirin', 'ginger']
          },
          timing: '1-2 minutes per side'
        }
      },
      'poach': {
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
      'stir_fry': {
    name: 'Stir Fry',
        preparation: 'peeled, deveined',
        technique: {
          'velvet': {
    name: 'Velvet',
            marinade: ['egg white', 'cornstarch', 'rice wine'],
            method: 'oil blanch then stir-fry',
            timing: 'blanch 30 seconds, fry 1 minute'
          },
          'standard': {
    name: 'Standard',
            marinade: ['soy', 'wine', 'ginger'],
            method: 'high heat wok',
            timing: '1-2 minutes'
          }
        }
      }
    },
    saucePairings: {
      'cold': {
    name: 'Cold',
        'cocktail': {
    name: 'Cocktail',
          base: 'tomato',
          ingredients: ['horseradish', 'lemon', 'worcestershire'],
          service: 'chilled, hanging presentation'
        },
        'remoulade': {
    name: 'Remoulade',
          base: 'mayonnaise',
          ingredients: ['cajun spice', 'pickles', 'capers'],
          service: 'chilled, side sauce'
        },
        'mignonette': {
    name: 'Mignonette',
          base: 'vinegar',
          ingredients: ['shallot', 'pepper', 'herbs'],
          service: 'chilled, raw preparations'
        }
      },
      'hot': {
    name: 'Hot',
        'scampi': {
    name: 'Scampi',
          base: 'butter-wine',
          ingredients: ['garlic', 'lemon', 'parsley'],
          finish: 'mount with butter'
        },
        'curry': {
    name: 'Curry',
          base: 'coconut milk',
          variations: {
            'thai': ['red curry', 'kaffir lime', 'basil'],
            'indian': ['garam masala', 'tomato', 'cream']
          }
        },
        'xo': {
    name: 'Xo',
          base: 'dried seafood-chili',
          preparation: 'sauce made ahead',
          usage: 'small amount as condiment'
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
    name: 'Summer',
        preparations: ['grilled', 'cold poached'],
        sauces: ['light herb', 'citrus based'],
        accompaniments: ['summer vegetables', 'cold salads']
      },
      'winter': {
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
  'lobster_maine': {
    name: 'lobster_maine',
    elementalProperties: { Water: 0.6, Earth: 0.3, Fire: 0.1 , Air: 0.1},
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
      'boil': {
    name: 'Boil',
        method: 'live lobster in salted water',
        timing: '8-10 minutes per pound',
        accompaniments: ['melted butter', 'lemon']
      },
      'grill': {
    name: 'Grill',
        method: 'split and grill shell-side down',
        timing: '5-7 minutes',
        seasoning: ['butter', 'garlic', 'parsley']
      }
    }
  },
  'mussels_blue': {
    name: 'mussels_blue',
    elementalProperties: { Water: 0.6, Earth: 0.3, Fire: 0.05, Air: 0.05 },
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
    category: 'protein',
    subCategory: 'shellfish',
    varieties: {
      'Wild': {
    name: 'Wild',
        appearance: 'blue-black shells',
        texture: 'firm, plump',
        flavor: 'intense, briny',
        notes: 'best for steaming'
      },
      'Farm Raised': {
    name: 'Farm Raised',
        appearance: 'cleaner shells',
        texture: 'tender, consistent',
        flavor: 'milder, sweeter',
        notes: 'more consistent size'
      }
    },
    culinaryApplications: {
      'steam': {
    name: 'Steam',
        method: 'steam in white wine broth',
        timing: '5-7 minutes',
        accompaniments: ['garlic', 'shallots', 'parsley']
      },
      'grill': {
    name: 'Grill',
        method: 'grill in shell until open',
        timing: '3-4 minutes',
        seasoning: ['garlic butter', 'lemon zest']
      }
    }
  },
  'oysters_eastern': {
    name: 'Eastern Oysters',
    elementalProperties: { Water: 0.65, Earth: 0.25, Fire: 0.05, Air: 0.05 },
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
    category: 'protein',
    subCategory: 'shellfish',
    varieties: {
      'Blue Point': {
        name: 'Blue Point',
        appearance: 'teardrop shape, deep cup',
        flavor: 'balanced brininess, clean finish',
        texture: 'firm, plump',
        notes: 'classic East Coast oyster from Long Island'
      },
      'Wellfleet': {
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
      'raw': {
        name: 'Raw',
        method: 'served on the half shell',
        timing: 'serve immediately after shucking',
        accompaniments: ['mignonette sauce', 'lemon wedges', 'horseradish', 'cocktail sauce'],
        notes: 'best consumed within hours of harvesting'
      },
      'grilled': {
        name: 'Grilled',
        method: 'grill until shells open or juices bubble',
        timing: '5-6 minutes over medium-high heat',
        toppings: ['garlic butter', 'herb butter', 'parmesan', 'breadcrumbs', 'bacon'],
        notes: 'close lid to create steam while grilling'
      },
      'fried': {
        name: 'Fried',
        method: 'breaded and deep-fried',
        timing: '2-3 minutes at 375°F (190°C)',
        accompaniments: ['remoulade sauce', 'tartar sauce', 'lemon wedges'],
        notes: 'perfect for po\' boy sandwiches'
      },
      'baked': {
        name: 'Baked',
        method: 'topped and baked in shell',
        timing: '10-12 minutes at 450°F (232°C)',
        preparations: {
          'Rockefeller': {
            name: 'Rockefeller',
            ingredients: ['spinach', 'herbs', 'breadcrumbs', 'Pernod', 'parmesan']
          },
          'Casino': {
            name: 'Casino',
            ingredients: ['bacon', 'bell pepper', 'breadcrumbs', 'butter', 'lemon juice']
          }
        }
      },
      'stewed': {
        name: 'Stewed',
        method: 'simmered in liquid',
        timing: '3-5 minutes until edges curl',
        recipes: ['oyster stew', 'gumbo', 'chowder'],
        notes: 'add oysters at the end of cooking to prevent overcooking'
      }
    },
    seasonality: {
      peak: ['September', 'October', 'November', 'December', 'January', 'February', 'March', 'April'],
      notes: 'Traditional "R month" rule (months containing the letter R) indicates when wild oysters are at their best, though farmed oysters are available year-round'
    },
    safetyNotes: {
      handling: 'Keep refrigerated at 32-35°F (0-2°C)',
      consumption: 'Raw consumption carries risk of Vibrio bacteria - immunocompromised individuals should avoid raw oysters',
      storage: 'Live oysters should be consumed within 7 days of harvest',
      quality: 'Discard any oysters with open shells that don\'t close when tapped'
    }
  },
  'halibut_pacific': {
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
      },
      'Wild': {
    name: 'Wild',
        appearance: 'deep orange-red',
        texture: 'firm, lean',
        flavor: 'robust',
        uses: 'premium preparations'
      }
    },
    cuts: {
      'fillet': {
    name: 'Fillet',
        description: 'boneless side',
        weight: '6-8 oz per serving',
        notes: 'most versatile'
      },
      'steak': {
    name: 'Steak',
        description: 'cross-section cut',
        weight: '8-10 oz',
        notes: 'good for grilling'
      },
      'whole_side': {
    name: 'Whole Side',
        description: 'entire fillet',
        weight: '2-4 lbs',
        notes: 'ideal for large gatherings'
      }
    },
    culinaryApplications: {
      'pan_sear': {
    name: 'Pan Sear',
        method: 'high heat, skin-on',
        temperature: 'medium-high',
        timing: {
          'skin_side': '4-5 minutes',
          'flesh_side': '2-3 minutes',
          'resting': '3-4 minutes'
        },
        techniques: {
          'crispy_skin': {
    name: 'Crispy Skin',
            method: 'pat dry, score skin',
            notes: 'press down gently when first added'
          },
          'basting': {
    name: 'Basting',
            method: 'butter baste last minute',
            aromatics: ['thyme', 'garlic', 'lemon']
          }
        }
      },
      'roast': {
    name: 'Roast',
        method: 'dry heat',
        temperature: {
          fahrenheit: 400,
          celsius: 200
        },
        timing: {
          'per_inch': '10-12 minutes',
          'resting': '5 minutes'
        },
        techniques: {
          'en_papillote': {
    name: 'En Papillote',
            method: 'wrapped in parchment',
            ingredients: ['herbs', 'citrus', 'vegetables'],
            timing: '12-15 minutes'
          },
          'glazed': {
    name: 'Glazed',
            method: 'brush with glaze',
            frequency: 'every 4-5 minutes',
            types: ['miso', 'honey-soy', 'maple']
          }
        }
      },
      'sous_vide': {
    name: 'Sous Vide',
        method: 'vacuum sealed',
        temperature: {
          'rare': {
    name: 'Rare', fahrenheit: 110, celsius: 43 },
          'medium_rare': {
    name: 'Medium Rare', fahrenheit: 120, celsius: 49 },
          'medium': {
    name: 'Medium', fahrenheit: 130, celsius: 54 }
        },
        timing: {
          'minimum': '30 minutes',
          'maximum': '45 minutes',
          'optimal': '35 minutes'
        },
        finishing: {
          method: 'quick sear',
          duration: '30 seconds per side'
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
    name: 'Summer',
        methods: ['grill', 'raw'],
        preparations: {
          'crudo': {
    name: 'Crudo',
            style: 'thin sliced',
            accompaniments: ['citrus', 'olive oil', 'sea salt']
          },
          'poke': {
    name: 'Poke',
            style: 'cubed',
            marinades: ['soy', 'sesame', 'ginger']
          }
        }
      },
      'winter': {
    name: 'Winter',
        methods: ['roast', 'poach'],
        preparations: {
          'braised': {
    name: 'Braised',
            style: 'whole fillet',
            sauces: ['cream', 'wine', 'herb']
          }
        }
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
  'sea_bass_chilean': {
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
      'Chilean': {
    name: 'Chilean',
        appearance: 'white with grey-black skin',
        texture: 'large, moist flakes',
        notes: 'premium variety'
      },
      'European': {
    name: 'European',
        appearance: 'silvery with blue-grey back',
        texture: 'firmer, smaller flakes',
        notes: 'different species, similar usage'
      }
    },
    culinaryApplications: {
      'steam': {
    name: 'Steam',
        method: 'gentle steam',
        timing: '8-10 minutes per inch',
        techniques: {
          'chinese_style': {
    name: 'Chinese Style',
            preparation: 'whole fish',
            aromatics: ['ginger', 'scallion', 'cilantro'],
            sauce: 'soy-sesame'
          }
        }
      }
    },
    regionalPreparations: {
      'new_england': {
    name: 'New England',
        'classic_boiled': {
    name: 'Classic Boiled',
          service: ['drawn butter', 'lemon'],
          sides: ['corn', 'potatoes', 'steamers'],
          presentation: 'newspaper covered table'
        },
        'lobster_roll': {
    name: 'Lobster Roll',
          bread: 'split-top bun, grilled',
          variations: {
            'maine': {
    name: 'Maine',
              dressing: 'light mayo',
              seasoning: 'celery, herbs',
              temperature: 'chilled'
            },
            'connecticut': {
    name: 'Connecticut',
              dressing: 'warm butter',
              seasoning: 'light herbs',
              temperature: 'warm'
            }
          }
        }
      },
      'french': {
    name: 'French',
        'thermidor': {
    name: 'Thermidor',
          sauce: 'mustard-cream gratinée',
          preparation: 'meat removed, mixed, restuffed',
          garnish: 'broiled cheese crust'
        },
        'américaine': {
    name: 'Américaine',
          sauce: 'tomato-cognac',
          method: 'flambéed',
          service: 'in shell pieces'
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
    name: 'Summer',
        methods: ['grill', 'raw'],
        preparations: {
          'crudo': {
    name: 'Crudo',
            style: 'thin sliced',
            accompaniments: ['citrus', 'olive oil', 'sea salt']
          },
          'poke': {
    name: 'Poke',
            style: 'cubed',
            marinades: ['soy', 'sesame', 'ginger']
          }
        }
      },
      'winter': {
    name: 'Winter',
        methods: ['roast', 'braise'],
        preparations: {
          'roasted': {
    name: 'Roasted',
            style: 'fillets',
            sauces: ['butter sauce', 'wine reduction']
          }
        }
      }
    },
    safetyThresholds: {
      cooking: {
        temperature: { fahrenheit: 145, celsius: 63 },
        visual: 'opaque, flakes easily'
      }
    }
  },
  'cod_atlantic': {
    name: 'Cod Atlantic',
    elementalProperties: { Water: 0.7, Earth: 0.15, Air: 0.15 , Fire: 0.1},
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
      'Atlantic': {
    name: 'Atlantic',
        appearance: 'white to off-white',
        texture: 'large, tender flakes',
        notes: 'traditional cod'
      },
      'Pacific': {
    name: 'Pacific',
        appearance: 'similar to Atlantic',
        texture: 'slightly firmer',
        notes: 'more sustainable option'
      },
      'Black': {
    name: 'Black',
        appearance: 'darker flesh',
        texture: 'denser, oilier',
        notes: 'premium sablefish variety'
      }
    },
    culinaryApplications: {
      'traditional': {
    name: 'Traditional',
        'fish_and_chips': {
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
        'salt_cod': {
    name: 'Salt Cod',
          preparation: {
            salting: '24-48 hours in salt',
            soaking: '24-36 hours, change water',
            ready: 'when properly rehydrated'
          },
          applications: {
            'brandade': {
    name: 'Brandade',
              method: 'whipped with potato',
              ingredients: ['olive oil', 'garlic', 'cream'],
              service: 'warm with bread'
            },
            'bacalao': {
    name: 'Bacalao',
              method: 'stewed',
              ingredients: ['tomatoes', 'peppers', 'olives'],
              style: 'Spanish or Portuguese'
            }
          }
        }
      },
      'modern': {
    name: 'Modern',
        'sous_vide': {
    name: 'Sous Vide',
          temperature: { fahrenheit: 140, celsius: 60 },
          timing: '25-30 minutes',
          finish: 'light sear optional'
        },
        'pan_roasted': {
    name: 'Pan Roasted',
          method: 'sear then oven',
          temperature: { fahrenheit: 375, celsius: 190 },
          timing: '8-10 minutes total'
        }
      }
    },
    regionalPreparations: {
      'british': {
    name: 'British',
        'fish_and_chips': {
    name: 'Fish And Chips',
          accompaniments: ['malt vinegar', 'tartar sauce'],
          sides: ['chips', 'mushy peas'],
          service: 'newspaper style'
        }
      },
      'portuguese': {
    name: 'Portuguese',
        'bacalhau': {
    name: 'Bacalhau',
          variations: {
            'a_bras': {
    name: 'A Bras',
              ingredients: ['potatoes', 'eggs', 'olives'],
              method: 'scrambled style'
            },
            'a_gomes_de_sa': {
    name: 'A Gomes De Sa',
              ingredients: ['potatoes', 'onions', 'olives'],
              method: 'layered casserole'
            }
          }
        }
      },
      'scandinavian': {
    name: 'Scandinavian',
        'lutefisk': {
    name: 'Lutefisk',
          preparation: 'lye-treated cod',
          service: 'traditional Christmas',
          accompaniments: ['butter', 'bacon', 'peas']
        }
      }
    },
    saucePairings: {
      'classic': {
    name: 'Classic',
        'tartar': {
    name: 'Tartar',
          base: 'mayonnaise',
          ingredients: ['pickles', 'capers', 'herbs'],
          service: 'cold'
        },
        'parsley': {
    name: 'Parsley',
          base: 'butter sauce',
          herbs: 'fresh parsley',
          finish: 'lemon juice'
        }
      },
      'modern': {
    name: 'Modern',
        'citrus_butter': {
    name: 'Citrus Butter',
          base: 'brown butter',
          citrus: ['orange', 'lemon'],
          finish: 'fresh herbs'
        },
        'chorizo_oil': {
    name: 'Chorizo Oil',
          base: 'rendered chorizo',
          aromatics: ['garlic', 'herbs'],
          application: 'drizzle'
        }
      }
    }
  },
  'sole_dover': {
    name: 'Sole Dover',
    elementalProperties: { Water: 0.6, Air: 0.35, Earth: 0.05 , Fire: 0.1},
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
      'Dover': {
    name: 'Dover',
        appearance: 'light beige to white',
        texture: 'very delicate, thin fillets',
        notes: 'premium variety'
      },
      'Lemon': {
    name: 'Lemon',
        appearance: 'slightly darker',
        texture: 'firmer than Dover',
        notes: 'good substitute'
      }
    },
    culinaryApplications: {
      'classic': {
    name: 'Classic',
        'meuniere': {
    name: 'Meuniere',
          method: 'dredged and pan-fried',
          sauce: 'brown butter-lemon-parsley',
          timing: '2-3 minutes per side'
        },
        'en_papillote': {
    name: 'En Papillote',
          method: 'steamed in parchment',
          ingredients: ['white wine', 'shallots', 'herbs'],
          timing: '8-10 minutes total'
        }
      },
      'modern': {
    name: 'Modern',
        'rolled': {
    name: 'Rolled',
          method: 'stuffed and rolled',
          fillings: ['seafood mousse', 'herbs', 'vegetables'],
          sauce: 'light cream or wine based'
        }
      }
    },
    regionalPreparations: {
      'french': {
    name: 'French',
        'veronique': {
    name: 'Veronique',
          sauce: 'white wine cream',
          garnish: 'peeled green grapes',
          method: 'poached or pan-fried'
        },
        'dugléré': {
    name: 'Dugléré',
          sauce: 'tomato-wine',
          aromatics: ['shallots', 'parsley'],
          method: 'poached'
        }
      }
    },
    saucePairings: {
      'classic': {
    name: 'Classic',
        'beurre_blanc': {
    name: 'Beurre Blanc',
          base: 'wine reduction',
          finish: 'cold butter mounting',
          variations: ['classic', 'herb', 'citrus']
        }
      },
      'contemporary': {
    name: 'Contemporary',
        'citrus_herb': {
    name: 'Citrus Herb',
          base: 'light butter sauce',
          citrus: ['orange', 'lemon'],
          herbs: ['chervil', 'tarragon']
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
    name: 'Summer',
        preparations: ['poached', 'grilled'],
        sauces: ['light herb', 'citrus'],
        accompaniments: ['fresh peas', 'asparagus']
      },
      'winter': {
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
  'flounder_whole': {
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
      'Summer': {
    name: 'Summer',
        appearance: 'brown top, white bottom',
        season: 'peak in summer',
        notes: 'preferred eating'
      },
      'Winter': {
    name: 'Winter',
        appearance: 'darker coloring',
        season: 'peak in winter',
        notes: 'slightly firmer texture'
      }
    },
    culinaryApplications: {
      'chinese': {
    name: 'Chinese',
        'steamed': {
    name: 'Steamed',
          method: 'whole fish steamed',
          sauce: 'ginger-scallion soy',
          timing: '8-10 minutes total'
        },
        'pan_fried': {
    name: 'Pan Fried',
          method: 'light dredge, pan-fried',
          sauce: 'sweet-sour',
          garnish: ['scallions', 'cilantro']
        }
      },
      'western': {
    name: 'Western',
        'broiled': {
    name: 'Broiled',
          method: 'brushed with butter',
          seasoning: ['herbs', 'lemon'],
          timing: '6-8 minutes total'
        }
      }
    },
    regionalPreparations: {
      'asian': {
    name: 'Asian',
        'cantonese': {
    name: 'Cantonese',
          method: 'steamed whole',
          aromatics: ['ginger', 'scallion', 'cilantro'],
          sauce: 'hot oil and soy finish'
        },
        'korean': {
    name: 'Korean',
          method: 'pan-fried whole',
          sauce: 'gochugaru-based',
          accompaniments: ['banchan', 'rice']
        }
      }
    },
    saucePairings: {
      'asian': {
    name: 'Asian',
        'ginger_scallion': {
    name: 'Ginger Scallion',
          base: 'hot oil infusion',
          aromatics: ['ginger', 'scallion'],
          finish: 'light soy sauce'
        }
      },
      'western': {
    name: 'Western',
        'herb_butter': {
    name: 'Herb Butter',
          base: 'melted butter',
          herbs: ['parsley', 'dill'],
          finish: 'lemon juice'
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
    name: 'Summer',
        preparations: ['steamed', 'grilled'],
        sauces: ['light soy', 'herb'],
        accompaniments: ['summer greens', 'light vegetables']
      },
      'winter': {
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
  'sea_bass_mediterranean': {
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
      'Wild': {
    name: 'Wild',
        appearance: 'silvery with dark back',
        texture: 'firm, fine flake',
        flavor: 'sweet, mild',
        uses: 'premium preparations'
      },
      'Farmed': {
    name: 'Farmed',
        appearance: 'lighter coloring',
        texture: 'medium-firm',
        flavor: 'mild',
        uses: 'all-purpose'
      }
    },
    cuts: {
      'whole': {
    name: 'Whole',
        description: 'entire fish, scaled and gutted',
        weight: '2-4 lbs',
        notes: 'ideal for roasting or grilling'
      },
      'fillet': {
    name: 'Fillet',
        description: 'boneless sides',
        weight: '6-8 oz per serving',
        notes: 'versatile cut'
      }
    },
    culinaryApplications: {
      'grilled_whole': {
    name: 'Grilled Whole',
        method: 'stuffed and grilled',
        temperature: 'medium-high',
        timing: {
          'per_side': '6-8 minutes',
          'total': '12-15 minutes',
          'resting': '5 minutes'
        },
        techniques: {
          'stuffing': {
    name: 'Stuffing',
            ingredients: ['herbs', 'citrus', 'garlic'],
            method: 'stuff cavity lightly'
          },
          'scoring': {
    name: 'Scoring',
            method: 'diagonal cuts on sides',
            depth: '1/4 inch',
            purpose: 'even cooking'
          }
        }
      },
      'pan_roasted': {
    name: 'Pan Roasted',
        method: 'skin-on fillet',
        temperature: {
          fahrenheit: 375,
          celsius: 190
        },
        timing: {
          'skin_side': '4-5 minutes',
          'flesh_side': '2-3 minutes',
          'resting': '3-4 minutes'
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
    name: 'Summer',
        methods: ['grill', 'pan-sear'],
        preparations: {
          'grilled': {
    name: 'Grilled',
            style: 'whole fish',
            accompaniments: ['herb sauce', 'grilled lemon']
          }
        }
      },
      'winter': {
    name: 'Winter',
        methods: ['roast', 'braise'],
        preparations: {
          'roasted': {
    name: 'Roasted',
            style: 'fillets',
            sauces: ['butter sauce', 'wine reduction']
          }
        }
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
  'octopus_mediterranean': {
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
    varieties: {
      'Common': {
    name: 'Common',
        appearance: 'reddish-purple',
        texture: 'firm, tender when cooked',
        size: '2-4 lbs average',
        uses: 'grilling, braising'
      },
      'Baby': {
    name: 'Baby',
        appearance: 'lighter color',
        texture: 'very tender',
        size: '4-8 oz',
        uses: 'quick cooking methods'
      }
    },
    preparation: {
      'tenderizing': {
    name: 'Tenderizing',
        methods: ['massage with salt', 'freeze/thaw'],
        timing: '15-20 minutes massage',
        notes: 'breaks down muscle fibers'
      },
      'cleaning': {
    name: 'Cleaning',
        steps: [
          'remove beak',
          'clean head cavity',
          'remove eyes'
        ],
        notes: 'careful with ink sac'
      }
    },
    culinaryApplications: {
      'traditional_braise': {
    name: 'Traditional Braise',
        method: 'slow cook in aromatic liquid',
        temperature: {
          fahrenheit: 200,
          celsius: 93
        },
        timing: {
          'total': '45-60 minutes',
          'testing': 'pierce with knife for tenderness'
        },
        aromatics: ['wine', 'herbs', 'garlic', 'olive oil']
      },
      'grilled': {
    name: 'Grilled',
        method: 'pre-tenderize, then grill',
        temperature: 'medium-high',
        timing: {
          'per_side': '3-4 minutes',
          'total': '8-10 minutes'
        },
        finish: 'olive oil, lemon, herbs'
      }
    },
    regionalPreparations: {
      'greek': {
    name: 'Greek',
        'htapodi_sharas': {
    name: 'Htapodi Sharas',
          method: 'grilled with olive oil',
          service: 'with ladolemono sauce',
          accompaniments: ['oregano', 'lemon']
        }
      },
      'spanish': {
    name: 'Spanish',
        'pulpo_gallega': {
    name: 'Pulpo Gallega',
          method: 'boiled then grilled',
          service: 'with paprika and olive oil',
          accompaniments: ['potatoes', 'sea salt']
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
  'scallops_sea': {
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
      'Summer': {
    name: 'Summer',
        appearance: 'brown top, white bottom',
        season: 'peak in summer',
        notes: 'preferred eating'
      },
      'Winter': {
    name: 'Winter',
        appearance: 'darker coloring',
        season: 'peak in winter',
        notes: 'slightly firmer texture'
      }
    },
    culinaryApplications: {
      'chinese': {
    name: 'Chinese',
        'steamed': {
    name: 'Steamed',
          method: 'whole fish steamed',
          sauce: 'ginger-scallion soy',
          timing: '8-10 minutes total'
        },
        'pan_fried': {
    name: 'Pan Fried',
          method: 'light dredge, pan-fried',
          sauce: 'sweet-sour',
          garnish: ['scallions', 'cilantro']
        }
      },
      'western': {
    name: 'Western',
        'broiled': {
    name: 'Broiled',
          method: 'brushed with butter',
          seasoning: ['herbs', 'lemon'],
          timing: '6-8 minutes total'
        }
      }
    },
    regionalPreparations: {
      'asian': {
    name: 'Asian',
        'cantonese': {
    name: 'Cantonese',
          method: 'steamed whole',
          aromatics: ['ginger', 'scallion', 'cilantro'],
          sauce: 'hot oil and soy finish'
        },
        'korean': {
    name: 'Korean',
          method: 'pan-fried whole',
          sauce: 'gochugaru-based',
          accompaniments: ['banchan', 'rice']
        }
      }
    },
    saucePairings: {
      'asian': {
    name: 'Asian',
        'ginger_scallion': {
    name: 'Ginger Scallion',
          base: 'hot oil infusion',
          aromatics: ['ginger', 'scallion'],
          finish: 'light soy sauce'
        }
      },
      'western': {
    name: 'Western',
        'herb_butter': {
    name: 'Herb Butter',
          base: 'melted butter',
          herbs: ['parsley', 'dill'],
          finish: 'lemon juice'
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
    name: 'Summer',
        preparations: ['steamed', 'grilled'],
        sauces: ['light soy', 'herb'],
        accompaniments: ['summer greens', 'light vegetables']
      },
      'winter': {
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
  'salmon': {
    name: 'Salmon',
    elementalProperties: { Water: 0.6, Earth: 0.3, Fire: 0.1, Air: 0 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'pisces'],
      elementalAffinity: {
        base: 'Water',
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
    },
    qualities: ['omega-rich', 'flaky', 'buttery'],
    origin: ['Norway', 'Scotland', 'Chile'],
    sustainability: {
      rating: 'Best Choice',
      source: 'MSC'
    },
    varieties: {
      'Farm Raised': {
    name: 'Farm Raised',
        appearance: 'light orange-pink',
        texture: 'fatty, soft',
        flavor: 'mild',
        uses: 'all-purpose'
      },
      'Wild': {
    name: 'Wild',
        appearance: 'deep orange-red',
        texture: 'firm, lean',
        flavor: 'robust',
        uses: 'premium preparations'
      }
    },
    cuts: {
      'fillet': {
    name: 'Fillet',
        description: 'boneless side',
        weight: '6-8 oz per serving',
        notes: 'most versatile'
      },
      'steak': {
    name: 'Steak',
        description: 'cross-section cut',
        weight: '8-10 oz',
        notes: 'good for grilling'
      },
      'whole_side': {
    name: 'Whole Side',
        description: 'entire fillet',
        weight: '2-4 lbs',
        notes: 'ideal for large gatherings'
      }
    },
    culinaryApplications: {
      'grill': {
    name: 'Grill',
        temperature: { celsius: 190, fahrenheit: 375 },
        timing: '4-5 minutes per side'
      },
      'pan_sear': {
    name: 'Pan Sear',
        method: 'high heat, skin-on',
        temperature: 'medium-high',
        timing: {
          'skin_side': '4-5 minutes',
          'flesh_side': '2-3 minutes',
          'resting': '3-4 minutes'
        },
        techniques: {
          'crispy_skin': {
    name: 'Crispy Skin',
            method: 'pat dry, score skin',
            notes: 'press down gently when first added'
          },
          'basting': {
    name: 'Basting',
            method: 'butter baste last minute',
            aromatics: ['thyme', 'garlic', 'lemon']
          }
        }
      },
      'roast': {
    name: 'Roast',
        method: 'dry heat',
        temperature: {
          fahrenheit: 400,
          celsius: 200
        },
        timing: {
          'per_inch': '10-12 minutes',
          'resting': '5 minutes'
        },
        techniques: {
          'en_papillote': {
    name: 'En Papillote',
            method: 'wrapped in parchment',
            ingredients: ['herbs', 'citrus', 'vegetables'],
            timing: '12-15 minutes'
          },
          'glazed': {
    name: 'Glazed',
            method: 'brush with glaze',
            frequency: 'every 4-5 minutes',
            types: ['miso', 'honey-soy', 'maple']
          }
        }
      },
      'sous_vide': {
    name: 'Sous Vide',
        method: 'vacuum sealed',
        temperature: {
          'rare': {
    name: 'Rare', fahrenheit: 110, celsius: 43 },
          'medium_rare': {
    name: 'Medium Rare', fahrenheit: 120, celsius: 49 },
          'medium': {
    name: 'Medium', fahrenheit: 130, celsius: 54 }
        },
        timing: {
          'minimum': '30 minutes',
          'maximum': '45 minutes',
          'optimal': '35 minutes'
        },
        finishing: {
          method: 'quick sear',
          duration: '30 seconds per side'
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
    name: 'Summer',
        methods: ['grill', 'raw'],
        preparations: {
          'crudo': {
    name: 'Crudo',
            style: 'thin sliced',
            accompaniments: ['citrus', 'olive oil', 'sea salt']
          },
          'poke': {
    name: 'Poke',
            style: 'cubed',
            marinades: ['soy', 'sesame', 'ginger']
          }
        }
      },
      'winter': {
    name: 'Winter',
        methods: ['roast', 'poach'],
        preparations: {
          'braised': {
    name: 'Braised',
            style: 'whole fillet',
            sauces: ['cream', 'wine', 'herb']
          }
        }
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
  'squid': {
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
    varieties: {
      'Common': {
    name: 'Common',
        appearance: 'reddish-purple',
        texture: 'firm, tender when cooked',
        size: '2-4 lbs average',
        uses: 'grilling, braising'
      },
      'Baby': {
    name: 'Baby',
        appearance: 'lighter color',
        texture: 'very tender',
        size: '4-8 oz',
        uses: 'quick cooking methods'
      }
    },
    preparation: {
      'tenderizing': {
    name: 'Tenderizing',
        methods: ['massage with salt', 'freeze/thaw'],
        timing: '15-20 minutes massage',
        notes: 'breaks down muscle fibers'
      },
      'cleaning': {
    name: 'Cleaning',
        steps: [
          'remove beak',
          'clean head cavity',
          'remove eyes'
        ],
        notes: 'careful with ink sac'
      }
    },
    culinaryApplications: {
      'traditional_braise': {
    name: 'Traditional Braise',
        method: 'slow cook in aromatic liquid',
        temperature: {
          fahrenheit: 200,
          celsius: 93
        },
        timing: {
          'total': '45-60 minutes',
          'testing': 'pierce with knife for tenderness'
        },
        aromatics: ['wine', 'herbs', 'garlic', 'olive oil']
      },
      'grilled': {
    name: 'Grilled',
        method: 'pre-tenderize, then grill',
        temperature: 'medium-high',
        timing: {
          'per_side': '3-4 minutes',
          'total': '8-10 minutes'
        },
        finish: 'olive oil, lemon, herbs'
      }
    },
    regionalPreparations: {
      'greek': {
    name: 'Greek',
        'htapodi_sharas': {
    name: 'Htapodi Sharas',
          method: 'grilled with olive oil',
          service: 'with ladolemono sauce',
          accompaniments: ['oregano', 'lemon']
        }
      },
      'spanish': {
    name: 'Spanish',
        'pulpo_gallega': {
    name: 'Pulpo Gallega',
          method: 'boiled then grilled',
          service: 'with paprika and olive oil',
          accompaniments: ['potatoes', 'sea salt']
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
  'shrimp': {
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
      'Gulf': {
    name: 'Gulf',
        appearance: 'pink-grey raw, pink cooked',
        size: '16/20 to U/15',
        flavor: 'sweet, mineral',
        notes: 'premium American variety'
      },
      'Tiger': {
    name: 'Tiger',
        appearance: 'grey with black stripes',
        size: '13/15 to U/10',
        flavor: 'robust, briny',
        notes: 'ideal for grilling'
      },
      'Spot Prawns': {
    name: 'Spot Prawns',
        appearance: 'reddish with white spots',
        size: 'U/10 to U/8',
        flavor: 'sweet, delicate',
        notes: 'premium Pacific variety'
      }
    },
    culinaryApplications: {
      'grill': {
    name: 'Grill',
        shell_on: {
          method: 'direct high heat',
          preparation: 'butterfly, devein',
          marinade: {
            'garlic_herb': ['olive oil', 'garlic', 'herbs'],
            'spicy': ['chili', 'lime', 'cilantro'],
            'asian': ['soy', 'ginger', 'sesame']
          },
          timing: '2-3 minutes per side',
          indicators: 'pink and opaque'
        },
        peeled: {
          method: 'skewered, high heat',
          preparation: 'devein, tail on/off',
          marinade: {
            'lemon_garlic': ['lemon', 'garlic', 'parsley'],
            'cajun': ['paprika', 'cayenne', 'herbs'],
            'teriyaki': ['soy', 'mirin', 'ginger']
          },
          timing: '1-2 minutes per side'
        }
      },
      'poach': {
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
      'stir_fry': {
    name: 'Stir Fry',
        preparation: 'peeled, deveined',
        technique: {
          'velvet': {
    name: 'Velvet',
            marinade: ['egg white', 'cornstarch', 'rice wine'],
            method: 'oil blanch then stir-fry',
            timing: 'blanch 30 seconds, fry 1 minute'
          },
          'standard': {
    name: 'Standard',
            marinade: ['soy', 'wine', 'ginger'],
            method: 'high heat wok',
            timing: '1-2 minutes'
          }
        }
      }
    },
    saucePairings: {
      'cold': {
    name: 'Cold',
        'cocktail': {
    name: 'Cocktail',
          base: 'tomato',
          ingredients: ['horseradish', 'lemon', 'worcestershire'],
          service: 'chilled, hanging presentation'
        },
        'remoulade': {
    name: 'Remoulade',
          base: 'mayonnaise',
          ingredients: ['cajun spice', 'pickles', 'capers'],
          service: 'chilled, side sauce'
        },
        'mignonette': {
    name: 'Mignonette',
          base: 'vinegar',
          ingredients: ['shallot', 'pepper', 'herbs'],
          service: 'chilled, raw preparations'
        }
      },
      'hot': {
    name: 'Hot',
        'scampi': {
    name: 'Scampi',
          base: 'butter-wine',
          ingredients: ['garlic', 'lemon', 'parsley'],
          finish: 'mount with butter'
        },
        'curry': {
    name: 'Curry',
          base: 'coconut milk',
          variations: {
            'thai': ['red curry', 'kaffir lime', 'basil'],
            'indian': ['garam masala', 'tomato', 'cream']
          }
        },
        'xo': {
    name: 'Xo',
          base: 'dried seafood-chili',
          preparation: 'sauce made ahead',
          usage: 'small amount as condiment'
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
    name: 'Summer',
        preparations: ['grilled', 'cold poached'],
        sauces: ['light herb', 'citrus'],
        accompaniments: ['summer vegetables', 'cold salads']
      },
      'winter': {
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

export default seafood;
