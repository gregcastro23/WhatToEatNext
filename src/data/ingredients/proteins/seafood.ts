import type { IngredientMapping } from '@/types/alchemy';

export const seafood: Record<string, IngredientMapping> = {
  'atlantic_salmon': {
    name: 'Atlantic Salmon',
    category: 'protein',
    subCategory: 'seafood',
    elementalProperties: { Water: 0.6, Earth: 0.2, Fire: 0.1, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['Cancer', 'Pisces'],
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
      aspectEnhancers: ['Moon trine Neptune', 'Jupiter in Pisces']
    },
    qualities: ['omega-rich', 'flaky', 'buttery'],
    origin: ['Norway', 'Scotland', 'Chile'],
    sustainability: {
      rating: 'Best Choice',
      source: 'MSC'
    },
    varieties: {
      'Farm Raised': {
        appearance: 'light orange-pink',
        texture: 'fatty, soft',
        flavor: 'mild',
        uses: 'all-purpose'
      },
      'Wild': {
        appearance: 'deep orange-red',
        texture: 'firm, lean',
        flavor: 'robust',
        uses: 'premium preparations'
      }
    },
    cuts: {
      'fillet': {
        description: 'boneless side',
        weight: '6-8 oz per serving',
        notes: 'most versatile'
      },
      'steak': {
        description: 'cross-section cut',
        weight: '8-10 oz',
        notes: 'good for grilling'
      },
      'whole_side': {
        description: 'entire fillet',
        weight: '2-4 lbs',
        notes: 'ideal for large gatherings'
      }
    },
    culinaryApplications: {
      'grill': {
        temperature: { celsius: 190, fahrenheit: 375 },
        timing: '4-5 minutes per side'
      },
      'pan_sear': {
        method: 'high heat, skin-on',
        temperature: 'medium-high',
        timing: {
          'skin_side': '4-5 minutes',
          'flesh_side': '2-3 minutes',
          'resting': '3-4 minutes'
        },
        techniques: {
          'crispy_skin': {
            method: 'pat dry, score skin',
            notes: 'press down gently when first added'
          },
          'basting': {
            method: 'butter baste last minute',
            aromatics: ['thyme', 'garlic', 'lemon']
          }
        }
      },
      'roast': {
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
            method: 'wrapped in parchment',
            ingredients: ['herbs', 'citrus', 'vegetables'],
            timing: '12-15 minutes'
          },
          'glazed': {
            method: 'brush with glaze',
            frequency: 'every 4-5 minutes',
            types: ['miso', 'honey-soy', 'maple']
          }
        }
      },
      'sous_vide': {
        method: 'vacuum sealed',
        temperature: {
          'rare': { fahrenheit: 110, celsius: 43 },
          'medium_rare': { fahrenheit: 120, celsius: 49 },
          'medium': { fahrenheit: 130, celsius: 54 }
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
        methods: ['grill', 'raw'],
        preparations: {
          'crudo': {
            style: 'thin sliced',
            accompaniments: ['citrus', 'olive oil', 'sea salt']
          },
          'poke': {
            style: 'cubed',
            marinades: ['soy', 'sesame', 'ginger']
          }
        }
      },
      'winter': {
        methods: ['roast', 'poach'],
        preparations: {
          'braised': {
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
        appearance: 'pink-grey raw, pink cooked',
        size: '16/20 to U/15',
        flavor: 'sweet, mineral',
        notes: 'premium American variety'
      },
      'Tiger': {
        appearance: 'grey with black stripes',
        size: '13/15 to U/10',
        flavor: 'robust, briny',
        notes: 'ideal for grilling'
      },
      'Spot Prawns': {
        appearance: 'reddish with white spots',
        size: 'U/10 to U/8',
        flavor: 'sweet, delicate',
        notes: 'premium Pacific variety'
      }
    },
    culinaryApplications: {
      'grill': {
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
        preparation: 'peeled, deveined',
        technique: {
          'velvet': {
            marinade: ['egg white', 'cornstarch', 'rice wine'],
            method: 'oil blanch then stir-fry',
            timing: 'blanch 30 seconds, fry 1 minute'
          },
          'standard': {
            marinade: ['soy', 'wine', 'ginger'],
            method: 'high heat wok',
            timing: '1-2 minutes'
          }
        }
      }
    },
    saucePairings: {
      'cold': {
        'cocktail': {
          base: 'tomato',
          ingredients: ['horseradish', 'lemon', 'worcestershire'],
          service: 'chilled, hanging presentation'
        },
        'remoulade': {
          base: 'mayonnaise',
          ingredients: ['cajun spice', 'pickles', 'capers'],
          service: 'chilled, side sauce'
        },
        'mignonette': {
          base: 'vinegar',
          ingredients: ['shallot', 'pepper', 'herbs'],
          service: 'chilled, raw preparations'
        }
      },
      'hot': {
        'scampi': {
          base: 'butter-wine',
          ingredients: ['garlic', 'lemon', 'parsley'],
          finish: 'mount with butter'
        },
        'curry': {
          base: 'coconut milk',
          variations: {
            'thai': ['red curry', 'kaffir lime', 'basil'],
            'indian': ['garam masala', 'tomato', 'cream']
          }
        },
        'xo': {
          base: 'dried seafood-chili',
          preparation: 'sauce made ahead',
          usage: 'small amount as condiment'
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
        preparations: ['grilled', 'cold poached'],
        sauces: ['light herb', 'citrus based'],
        accompaniments: ['summer vegetables', 'cold salads']
      },
      'winter': {
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
    elementalProperties: { Water: 0.6, Earth: 0.3, Fire: 0.1 },
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
        appearance: 'dark blue-black shell',
        texture: 'firm, dense',
        flavor: 'sweet, briny',
        notes: 'best for boiling'
      },
      'Soft Shell': {
        appearance: 'softer, lighter shell',
        texture: 'tender, delicate',
        flavor: 'sweet, mild',
        notes: 'ideal for grilling'
      }
    },
    culinaryApplications: {
      'boil': {
        method: 'live lobster in salted water',
        timing: '8-10 minutes per pound',
        accompaniments: ['melted butter', 'lemon']
      },
      'grill': {
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
        appearance: 'blue-black shells',
        texture: 'firm, plump',
        flavor: 'intense, briny',
        notes: 'best for steaming'
      },
      'Farm Raised': {
        appearance: 'cleaner shells',
        texture: 'tender, consistent',
        flavor: 'milder, sweeter',
        notes: 'more consistent size'
      }
    },
    culinaryApplications: {
      'steam': {
        method: 'steam in white wine broth',
        timing: '5-7 minutes',
        accompaniments: ['garlic', 'shallots', 'parsley']
      },
      'grill': {
        method: 'grill in shell until open',
        timing: '3-4 minutes',
        seasoning: ['garlic butter', 'lemon zest']
      }
    }
  },
  'oysters_eastern': {
    name: 'oysters_eastern',
    elementalProperties: { Water: 0.55, Earth: 0.35, Fire: 0.05, Air: 0.05 },
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
    qualities: ['briny', 'creamy', 'mineral'],
    origin: ['East Coast', 'Chesapeake Bay'],
    category: 'protein',
    subCategory: 'shellfish',
    varieties: {
      'Blue Point': {
        appearance: 'teardrop shape',
        flavor: 'balanced brininess',
        notes: 'classic East Coast oyster'
      },
      'Wellfleet': {
        appearance: 'deep cup',
        flavor: 'sweet, clean finish',
        notes: 'premium Massachusetts variety'
      }
    },
    culinaryApplications: {
      'raw': {
        method: 'served on the half shell',
        accompaniments: ['mignonette', 'lemon', 'horseradish']
      },
      'grill': {
        method: 'grill until shells open',
        timing: '5-6 minutes',
        toppings: ['garlic butter', 'parmesan', 'breadcrumbs']
      }
    }
  },
  'halibut_pacific': {
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
        appearance: 'light orange-pink',
        texture: 'fatty, soft',
        flavor: 'mild',
        uses: 'all-purpose'
      },
      'Wild': {
        appearance: 'deep orange-red',
        texture: 'firm, lean',
        flavor: 'robust',
        uses: 'premium preparations'
      }
    },
    cuts: {
      'fillet': {
        description: 'boneless side',
        weight: '6-8 oz per serving',
        notes: 'most versatile'
      },
      'steak': {
        description: 'cross-section cut',
        weight: '8-10 oz',
        notes: 'good for grilling'
      },
      'whole_side': {
        description: 'entire fillet',
        weight: '2-4 lbs',
        notes: 'ideal for large gatherings'
      }
    },
    culinaryApplications: {
      'pan_sear': {
        method: 'high heat, skin-on',
        temperature: 'medium-high',
        timing: {
          'skin_side': '4-5 minutes',
          'flesh_side': '2-3 minutes',
          'resting': '3-4 minutes'
        },
        techniques: {
          'crispy_skin': {
            method: 'pat dry, score skin',
            notes: 'press down gently when first added'
          },
          'basting': {
            method: 'butter baste last minute',
            aromatics: ['thyme', 'garlic', 'lemon']
          }
        }
      },
      'roast': {
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
            method: 'wrapped in parchment',
            ingredients: ['herbs', 'citrus', 'vegetables'],
            timing: '12-15 minutes'
          },
          'glazed': {
            method: 'brush with glaze',
            frequency: 'every 4-5 minutes',
            types: ['miso', 'honey-soy', 'maple']
          }
        }
      },
      'sous_vide': {
        method: 'vacuum sealed',
        temperature: {
          'rare': { fahrenheit: 110, celsius: 43 },
          'medium_rare': { fahrenheit: 120, celsius: 49 },
          'medium': { fahrenheit: 130, celsius: 54 }
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
        methods: ['grill', 'raw'],
        preparations: {
          'crudo': {
            style: 'thin sliced',
            accompaniments: ['citrus', 'olive oil', 'sea salt']
          },
          'poke': {
            style: 'cubed',
            marinades: ['soy', 'sesame', 'ginger']
          }
        }
      },
      'winter': {
        methods: ['roast', 'poach'],
        preparations: {
          'braised': {
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
        appearance: 'white with grey-black skin',
        texture: 'large, moist flakes',
        notes: 'premium variety'
      },
      'European': {
        appearance: 'silvery with blue-grey back',
        texture: 'firmer, smaller flakes',
        notes: 'different species, similar usage'
      }
    },
    culinaryApplications: {
      'steam': {
        method: 'gentle steam',
        timing: '8-10 minutes per inch',
        techniques: {
          'chinese_style': {
            preparation: 'whole fish',
            aromatics: ['ginger', 'scallion', 'cilantro'],
            sauce: 'soy-sesame'
          }
        }
      }
    },
    regionalPreparations: {
      'new_england': {
        'classic_boiled': {
          service: ['drawn butter', 'lemon'],
          sides: ['corn', 'potatoes', 'steamers'],
          presentation: 'newspaper covered table'
        },
        'lobster_roll': {
          bread: 'split-top bun, grilled',
          variations: {
            'maine': {
              dressing: 'light mayo',
              seasoning: 'celery, herbs',
              temperature: 'chilled'
            },
            'connecticut': {
              dressing: 'warm butter',
              seasoning: 'light herbs',
              temperature: 'warm'
            }
          }
        }
      },
      'french': {
        'thermidor': {
          sauce: 'mustard-cream gratinée',
          preparation: 'meat removed, mixed, restuffed',
          garnish: 'broiled cheese crust'
        },
        'américaine': {
          sauce: 'tomato-cognac',
          method: 'flambéed',
          service: 'in shell pieces'
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
        preparations: ['grilled', 'steamed'],
        sauces: ['light soy', 'herb vinaigrette'],
        accompaniments: ['summer squash', 'fresh herbs']
      },
      'winter': {
        preparations: ['roasted', 'braised'],
        sauces: ['rich miso', 'butter sauce'],
        accompaniments: ['mushrooms', 'winter greens']
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
    elementalProperties: { Water: 0.7, Earth: 0.15, Air: 0.15 },
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
        appearance: 'white to off-white',
        texture: 'large, tender flakes',
        notes: 'traditional cod'
      },
      'Pacific': {
        appearance: 'similar to Atlantic',
        texture: 'slightly firmer',
        notes: 'more sustainable option'
      },
      'Black': {
        appearance: 'darker flesh',
        texture: 'denser, oilier',
        notes: 'premium sablefish variety'
      }
    },
    culinaryApplications: {
      'traditional': {
        'fish_and_chips': {
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
          preparation: {
            salting: '24-48 hours in salt',
            soaking: '24-36 hours, change water',
            ready: 'when properly rehydrated'
          },
          applications: {
            'brandade': {
              method: 'whipped with potato',
              ingredients: ['olive oil', 'garlic', 'cream'],
              service: 'warm with bread'
            },
            'bacalao': {
              method: 'stewed',
              ingredients: ['tomatoes', 'peppers', 'olives'],
              style: 'Spanish or Portuguese'
            }
          }
        }
      },
      'modern': {
        'sous_vide': {
          temperature: { fahrenheit: 140, celsius: 60 },
          timing: '25-30 minutes',
          finish: 'light sear optional'
        },
        'pan_roasted': {
          method: 'sear then oven',
          temperature: { fahrenheit: 375, celsius: 190 },
          timing: '8-10 minutes total'
        }
      }
    },
    regionalPreparations: {
      'british': {
        'fish_and_chips': {
          accompaniments: ['malt vinegar', 'tartar sauce'],
          sides: ['chips', 'mushy peas'],
          service: 'newspaper style'
        }
      },
      'portuguese': {
        'bacalhau': {
          variations: {
            'a_bras': {
              ingredients: ['potatoes', 'eggs', 'olives'],
              method: 'scrambled style'
            },
            'a_gomes_de_sa': {
              ingredients: ['potatoes', 'onions', 'olives'],
              method: 'layered casserole'
            }
          }
        }
      },
      'scandinavian': {
        'lutefisk': {
          preparation: 'lye-treated cod',
          service: 'traditional Christmas',
          accompaniments: ['butter', 'bacon', 'peas']
        }
      }
    },
    saucePairings: {
      'classic': {
        'tartar': {
          base: 'mayonnaise',
          ingredients: ['pickles', 'capers', 'herbs'],
          service: 'cold'
        },
        'parsley': {
          base: 'butter sauce',
          herbs: 'fresh parsley',
          finish: 'lemon juice'
        }
      },
      'modern': {
        'citrus_butter': {
          base: 'brown butter',
          citrus: ['orange', 'lemon'],
          finish: 'fresh herbs'
        },
        'chorizo_oil': {
          base: 'rendered chorizo',
          aromatics: ['garlic', 'herbs'],
          application: 'drizzle'
        }
      }
    }
  },
  'sole_dover': {
    elementalProperties: { Water: 0.6, Air: 0.35, Earth: 0.05 },
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
        appearance: 'light beige to white',
        texture: 'very delicate, thin fillets',
        notes: 'premium variety'
      },
      'Lemon': {
        appearance: 'slightly darker',
        texture: 'firmer than Dover',
        notes: 'good substitute'
      }
    },
    culinaryApplications: {
      'classic': {
        'meuniere': {
          method: 'dredged and pan-fried',
          sauce: 'brown butter-lemon-parsley',
          timing: '2-3 minutes per side'
        },
        'en_papillote': {
          method: 'steamed in parchment',
          ingredients: ['white wine', 'shallots', 'herbs'],
          timing: '8-10 minutes total'
        }
      },
      'modern': {
        'rolled': {
          method: 'stuffed and rolled',
          fillings: ['seafood mousse', 'herbs', 'vegetables'],
          sauce: 'light cream or wine based'
        }
      }
    },
    regionalPreparations: {
      'french': {
        'veronique': {
          sauce: 'white wine cream',
          garnish: 'peeled green grapes',
          method: 'poached or pan-fried'
        },
        'dugléré': {
          sauce: 'tomato-wine',
          aromatics: ['shallots', 'parsley'],
          method: 'poached'
        }
      }
    },
    saucePairings: {
      'classic': {
        'beurre_blanc': {
          base: 'wine reduction',
          finish: 'cold butter mounting',
          variations: ['classic', 'herb', 'citrus']
        }
      },
      'contemporary': {
        'citrus_herb': {
          base: 'light butter sauce',
          citrus: ['orange', 'lemon'],
          herbs: ['chervil', 'tarragon']
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
        preparations: ['poached', 'grilled'],
        sauces: ['light herb', 'citrus'],
        accompaniments: ['fresh peas', 'asparagus']
      },
      'winter': {
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
        appearance: 'brown top, white bottom',
        season: 'peak in summer',
        notes: 'preferred eating'
      },
      'Winter': {
        appearance: 'darker coloring',
        season: 'peak in winter',
        notes: 'slightly firmer texture'
      }
    },
    culinaryApplications: {
      'chinese': {
        'steamed': {
          method: 'whole fish steamed',
          sauce: 'ginger-scallion soy',
          timing: '8-10 minutes total'
        },
        'pan_fried': {
          method: 'light dredge, pan-fried',
          sauce: 'sweet-sour',
          garnish: ['scallions', 'cilantro']
        }
      },
      'western': {
        'broiled': {
          method: 'brushed with butter',
          seasoning: ['herbs', 'lemon'],
          timing: '6-8 minutes total'
        }
      }
    },
    regionalPreparations: {
      'asian': {
        'cantonese': {
          method: 'steamed whole',
          aromatics: ['ginger', 'scallion', 'cilantro'],
          sauce: 'hot oil and soy finish'
        },
        'korean': {
          method: 'pan-fried whole',
          sauce: 'gochugaru-based',
          accompaniments: ['banchan', 'rice']
        }
      }
    },
    saucePairings: {
      'asian': {
        'ginger_scallion': {
          base: 'hot oil infusion',
          aromatics: ['ginger', 'scallion'],
          finish: 'light soy sauce'
        }
      },
      'western': {
        'herb_butter': {
          base: 'melted butter',
          herbs: ['parsley', 'dill'],
          finish: 'lemon juice'
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
        preparations: ['steamed', 'grilled'],
        sauces: ['light soy', 'herb'],
        accompaniments: ['summer greens', 'light vegetables']
      },
      'winter': {
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
        appearance: 'silvery with dark back',
        texture: 'firm, fine flake',
        flavor: 'sweet, mild',
        uses: 'premium preparations'
      },
      'Farmed': {
        appearance: 'lighter coloring',
        texture: 'medium-firm',
        flavor: 'mild',
        uses: 'all-purpose'
      }
    },
    cuts: {
      'whole': {
        description: 'entire fish, scaled and gutted',
        weight: '2-4 lbs',
        notes: 'ideal for roasting or grilling'
      },
      'fillet': {
        description: 'boneless sides',
        weight: '6-8 oz per serving',
        notes: 'versatile cut'
      }
    },
    culinaryApplications: {
      'grilled_whole': {
        method: 'stuffed and grilled',
        temperature: 'medium-high',
        timing: {
          'per_side': '6-8 minutes',
          'total': '12-15 minutes',
          'resting': '5 minutes'
        },
        techniques: {
          'stuffing': {
            ingredients: ['herbs', 'citrus', 'garlic'],
            method: 'stuff cavity lightly'
          },
          'scoring': {
            method: 'diagonal cuts on sides',
            depth: '1/4 inch',
            purpose: 'even cooking'
          }
        }
      },
      'pan_roasted': {
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
        methods: ['grill', 'pan-sear'],
        preparations: {
          'grilled': {
            style: 'whole fish',
            accompaniments: ['herb sauce', 'grilled lemon']
          }
        }
      },
      'winter': {
        methods: ['roast', 'braise'],
        preparations: {
          'roasted': {
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
        appearance: 'reddish-purple',
        texture: 'firm, tender when cooked',
        size: '2-4 lbs average',
        uses: 'grilling, braising'
      },
      'Baby': {
        appearance: 'lighter color',
        texture: 'very tender',
        size: '4-8 oz',
        uses: 'quick cooking methods'
      }
    },
    preparation: {
      'tenderizing': {
        methods: ['massage with salt', 'freeze/thaw'],
        timing: '15-20 minutes massage',
        notes: 'breaks down muscle fibers'
      },
      'cleaning': {
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
        'htapodi_sharas': {
          method: 'grilled with olive oil',
          service: 'with ladolemono sauce',
          accompaniments: ['oregano', 'lemon']
        }
      },
      'spanish': {
        'pulpo_gallega': {
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
        appearance: 'brown top, white bottom',
        season: 'peak in summer',
        notes: 'preferred eating'
      },
      'Winter': {
        appearance: 'darker coloring',
        season: 'peak in winter',
        notes: 'slightly firmer texture'
      }
    },
    culinaryApplications: {
      'chinese': {
        'steamed': {
          method: 'whole fish steamed',
          sauce: 'ginger-scallion soy',
          timing: '8-10 minutes total'
        },
        'pan_fried': {
          method: 'light dredge, pan-fried',
          sauce: 'sweet-sour',
          garnish: ['scallions', 'cilantro']
        }
      },
      'western': {
        'broiled': {
          method: 'brushed with butter',
          seasoning: ['herbs', 'lemon'],
          timing: '6-8 minutes total'
        }
      }
    },
    regionalPreparations: {
      'asian': {
        'cantonese': {
          method: 'steamed whole',
          aromatics: ['ginger', 'scallion', 'cilantro'],
          sauce: 'hot oil and soy finish'
        },
        'korean': {
          method: 'pan-fried whole',
          sauce: 'gochugaru-based',
          accompaniments: ['banchan', 'rice']
        }
      }
    },
    saucePairings: {
      'asian': {
        'ginger_scallion': {
          base: 'hot oil infusion',
          aromatics: ['ginger', 'scallion'],
          finish: 'light soy sauce'
        }
      },
      'western': {
        'herb_butter': {
          base: 'melted butter',
          herbs: ['parsley', 'dill'],
          finish: 'lemon juice'
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
        preparations: ['steamed', 'grilled'],
        sauces: ['light soy', 'herb'],
        accompaniments: ['summer greens', 'light vegetables']
      },
      'winter': {
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
  }
};

export default seafood;
