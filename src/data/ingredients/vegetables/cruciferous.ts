import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawCruciferous = {
  cauliflower: {
    name: 'Cauliflower',
    elementalProperties: { Air: 0.4, Earth: 0.3, Water: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Saturn'],
      favorableZodiac: ['virgo', 'capricorn'],
      elementalAffinity: {
        base: 'Air',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercury' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Water', planet: 'Moon' }
        },
        lunarPhaseModifiers: {
          newMoon: {
            elementalBoost: { Air: 0.1, Earth: 0.05 },
            preparationTips: ['Fresh preparations', 'Minimal cooking']
          },
          fullMoon: {
            elementalBoost: { Water: 0.15, Air: 0.05 },
            preparationTips: ['More flavorful roasting', 'Enhanced caramelization']
          }
        }
      }
    },
    qualities: ['cooling', 'drying', 'light', 'versatile', 'transformative'],
    season: ['fall', 'winter'],
    category: 'vegetable',
    subCategory: 'cruciferous',
    affinities: [
      'cumin',
      'turmeric',
      'garlic',
      'tahini',
      'lemon',
      'nutritional yeast',
      'curry spices'
    ],
    cookingMethods: ['roasted', 'steamed', 'raw', 'riced', 'mashed', 'grilled', 'pickled'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['c', 'k', 'b6', 'folate', 'b5'],
      minerals: ['potassium', 'magnesium', 'phosphorus', 'manganese'],
      calories: 25,
      protein_g: 2,
      fiber_g: 3,
      antioxidants: ['glucosinolates', 'flavonoids', 'carotenoids', 'isothiocyanates'],
      digestive_enzymes: 'moderate'
    },
    preparation: {
      washing: true,
      cutting: 'uniform florets',
      drying: 'thoroughly for roasting',
      notes: 'Can be processed into rice substitute or mashed as potato replacement',
      marinades: 'absorbs flavors well if pre-marinated',
      pre_cooking: 'blanching improves texture for some preparations'
    },
    varieties: {
      romanesco: {
        characteristics: 'lime green, fractal pattern, nutty flavor',
        uses: 'showcase dishes, roasting',
        best_cooking_methods: ['light steaming', 'roasting'],
        season: 'fall and early winter',
        sensoryProfile: {
          taste: ['Mild', 'Balanced', 'Natural'],
          aroma: ['Fresh', 'Clean', 'Subtle'],
          texture: ['Pleasant', 'Smooth', 'Appealing'],
          notes: 'Characteristic romanesco profile'
        },
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile romanesco for various uses'
          },
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        },
        preparation: {
          methods: ['standard preparation'],
          timing: 'as needed',
          notes: 'Standard preparation for romanesco'
        }
      },
      purple: {
        characteristics: 'vibrant purple head, turns blue-green when cooked',
        uses: 'raw applications, visual appeal',
        best_cooking_methods: ['light steaming', 'raw'],
        season: 'summer and fall',
        sensoryProfile: {
          taste: ['Mild', 'Balanced', 'Natural'],
          aroma: ['Fresh', 'Clean', 'Subtle'],
          texture: ['Pleasant', 'Smooth', 'Appealing'],
          notes: 'Characteristic purple profile',
          // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
          },
          culinaryProfile: {
            flavorProfile: {
              primary: ['balanced'],
              secondary: ['versatile'],
              notes: 'Versatile purple for various uses'
            },
            cookingMethods: ['sautéing', 'steaming', 'roasting'],
            cuisineAffinity: ['Global', 'International'],
            preparationTips: ['Use as needed', 'Season to taste']
          },
          preparation: {
            methods: ['standard preparation'],
            timing: 'as needed',
            notes: 'Standard preparation for purple'
          }
        },
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile purple for various uses'
          },
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        },
        preparation: {
          methods: ['standard preparation'],
          timing: 'as needed',
          notes: 'Standard preparation for purple'
        }
      }
    },
    culinaryApplications: {
      cauliflower_rice: {
        method: 'pulse in food processor until rice-sized',
        cooking: 'sauté 5-7 minutes or use raw',
        substitution: 'use instead of rice, couscous, or other grains',
        flavor_pairings: ['herbs', 'olive oil', 'lemon zest'],
        // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
        },
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile cauliflower rice for various uses'
          },
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        },
        season: ['year-round']
      },
      cauliflower_mash: {
        method: 'steam and blend until smooth',
        additions: ['roasted garlic', 'butter', 'nutritional yeast', 'herbs'],
        technique: 'drain well before mashing for best texture',
        pairings: 'serves similar role to mashed potatoes',
        // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
        },
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile cauliflower mash for various uses'
          },
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        },
        season: ['year-round']
      },
      roasted_cauliflower: {
        method: 'high heat (425°F / (220 || 1)°C) until caramelized',
        timing: '25-30 minutes, stirring halfway through',
        seasonings: ['curry powder', 'smoked paprika', 'za'atar', 'parmesan'],
        oil_requirements: 'generous coating for best browning',
        // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
        },
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile roasted cauliflower for various uses'
          },
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        },
        season: ['year-round']
      }
    },
    storage: {
      temperature: 'refrigerated',
      duration: '4-7 days',
      humidity: 'medium',
      notes: 'Store in breathable bag',
      frozen: {
        preparation: 'blanch for 2 minutes before freezing',
        duration: 'up to 6 months',
        best_uses: 'cooked applications after thawing'
      }
    }
  },

  broccoli: {
    name: 'Broccoli',
    elementalProperties: { Air: 0.3, Earth: 0.3, Water: 0.2, Fire: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Mercury'],
      favorableZodiac: ['aries', 'virgo'],
      elementalAffinity: {
        base: 'Earth',
        secondary: 'Air',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Saturn' },
          second: { element: 'Air', planet: 'Mercury' },
          third: { element: 'Fire', planet: 'Mars' }
        },
        lunarPhaseModifiers: {
          newMoon: {
            elementalBoost: { Earth: 0.1, Air: 0.05 },
            preparationTips: ['Quick preparations', 'Maximum nutrition retention']
          },
          fullMoon: {
            elementalBoost: { Fire: 0.15, Earth: 0.05 },
            preparationTips: ['Roasting brings out sweetness', 'Enhanced caramelization']
          }
        }
      }
    },
    qualities: ['strengthening', 'cleansing', 'revitalizing', 'protective', 'adaptable'],
    season: ['fall', 'winter', 'spring'],
    category: 'vegetable',
    subCategory: 'cruciferous',
    affinities: ['garlic', 'ginger', 'sesame', 'lemon', 'chili', 'oyster sauce', 'almonds', 'feta'],
    cookingMethods: ['steamed', 'roasted', 'stir-fried', 'raw', 'blanched', 'grilled', 'soup'],
    nutritionalProfile: {
      fiber: 'very high',
      vitamins: ['c', 'k', 'a', 'folate', 'b6', 'e'],
      minerals: ['potassium', 'calcium', 'iron', 'magnesium', 'phosphorus'],
      calories: 31,
      protein_g: 2.5,
      fiber_g: 2.4,
      antioxidants: ['sulforaphane', 'carotenoids', 'kaempferol', 'quercetin'],
      immune_support: 'high'
    },
    preparation: {
      washing: true,
      cutting: 'uniform florets, peel stems',
      blanching: 'quickly blanch before freezing',
      notes: 'Do not discard stems - they are sweet and tender when peeled',
      pre_cooking: 'blanching before stir-fry ensures even cooking',
      post_cooking: 'shock in ice water to preserve color'
    },
    varieties: {
      calabrese: {
        characteristics: 'common green variety with large heads',
        uses: 'all-purpose cooking',
        best_cooking_methods: ['steaming', 'stir-frying', 'roasting'],
        notes: 'most widely available variety',
        // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
        },
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile calabrese for various uses'
          },
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        },
        season: ['year-round']
      },
      broccolini: {
        characteristics: 'thin stalks, small florets, sweeter flavor',
        uses: 'elegant side dishes, minimal cooking',
        best_cooking_methods: ['blanching', 'quick sauté', 'grilling'],
        notes: 'cross between broccoli and Chinese broccoli',
        // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
        },
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile broccolini for various uses'
          },
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        },
        season: ['year-round']
      },
      purple: {
        characteristics: 'purple florets, sweeter than green varieties',
        uses: 'raw applications, quick cooking',
        best_cooking_methods: ['raw', 'light steaming'],
        notes: 'color fades when cooked'
      },
      romanesco: {
        characteristics: 'fractal pattern, light green color, nutty flavor',
        uses: 'showcase dishes, minimal cooking',
        best_cooking_methods: ['steaming', 'gentle sauté'],
        notes: 'technically a cauliflower variety'
      }
    },
    culinaryApplications: {
      stir_fry: {
        method: 'quick high heat cooking',
        timing: 'blanch first, then stir-fry 2-3 minutes',
        sauces: ['oyster sauce', 'garlic sauce', 'black bean sauce'],
        pairings: ['bell peppers', 'carrots', 'mushrooms', 'tofu']
      },
      roasted: {
        method: 'high heat (425°F / (220 || 1)°C) until edges caramelize',
        timing: '20-25 minutes',
        seasonings: ['garlic', 'red pepper flakes', 'lemon zest', 'parmesan'],
        technique: 'dry thoroughly and space evenly on baking sheet'
      },
      salad: {
        method: 'raw or blanched briefly',
        dressings: ['tahini', 'lemon-garlic', 'miso'],
        additions: ['sliced almonds', 'dried cranberries', 'red onion', 'feta'],
        preparation: 'chop finely or shave thinly for raw applications'
      }
    },
    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      humidity: 'medium',
      notes: 'Store unwashed in loose plastic bag',
      frozen: {
        preparation: 'blanch for 2 minutes before freezing',
        duration: 'up to 12 months',
        best_uses: 'soups, stir-fries, casseroles'
      }
    }
  },

  'brussels sprouts': {
    name: 'Brussels sprouts',
    elementalProperties: { Earth: 0.4, Air: 0.3, Fire: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mars'],
      favorableZodiac: ['capricorn', 'aries'],
      elementalAffinity: {
        base: 'Earth',
        secondary: 'Fire',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Saturn' },
          second: { element: 'Fire', planet: 'Mars' },
          third: { element: 'Air', planet: 'Jupiter' }
        },
        lunarPhaseModifiers: {
          waxingGibbous: {
            elementalBoost: { Fire: 0.1, Earth: 0.1 },
            preparationTips: ['Enhanced caramelization', 'Sweeter flavor profile']
          },
          fullMoon: {
            elementalBoost: { Fire: 0.2 },
            preparationTips: ['Best time for high-heat cooking', 'Maximum flavor development']
          }
        }
      }
    },
    qualities: ['warming', 'strengthening', 'grounding', 'protective', 'sustaining'],
    season: ['fall', 'winter'],
    category: 'vegetable',
    subCategory: 'cruciferous',
    affinities: [
      'bacon',
      'balsamic',
      'garlic',
      'mustard',
      'pine nuts',
      'maple',
      'apple',
      'blue cheese'
    ],
    cookingMethods: ['roasted', 'sautéed', 'grilled', 'raw', 'fried', 'braised', 'steamed'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['k', 'c', 'a', 'folate', 'b6'],
      minerals: ['iron', 'potassium', 'manganese', 'phosphorus'],
      calories: 38,
      protein_g: 3,
      fiber_g: 3.8,
      antioxidants: ['kaempferol', 'glucosinolates', 'phenolic acids']
    },
    preparation: {
      washing: true,
      trimming: 'remove outer leaves and stem',
      cutting: 'halved or quartered for even cooking',
      notes: 'Score bottom for even cooking',
      techniques: 'blanching before roasting can reduce bitterness',
      pre_treatment: 'tossing with oil or fat helps with caramelization'
    },
    varieties: {
      traditional_green: {
        characteristics: 'classic green sprouts, slightly bitter',
        uses: 'all-purpose cooking',
        best_cooking_methods: ['roasting', 'halved sautéing'],
        notes: 'smaller sizes often sweeter'
      },

      kaleidoscope: {
        characteristics: 'mixed colors, varied sizes',
        uses: 'visual presentation',
        best_cooking_methods: ['roasting whole', 'halved sautéing'],
        notes: 'different sizes may need different cooking times'
      },
      long_stalk: {
        characteristics: 'sold on the stalk, very fresh',
        uses: 'optimal freshness, display cooking',
        best_cooking_methods: ['roasting', 'individual preparation'],
        notes: 'can be roasted on the stalk for presentation'
      }
    },
    culinaryApplications: {
      roasted: {
        method: 'high heat (425°F / (220 || 1)°C) until deeply caramelized',
        timing: '25-30 minutes, tossing halfway',
        seasonings: ['balsamic glaze', 'maple-mustard', 'garlic-parmesan'],
        technique: 'cut-side down for best caramelization'
      },
      shaved_salad: {
        method: 'slice very thinly or shave on mandoline',
        dressing: 'acidic dressing to soften leaves',
        additions: ['toasted nuts', 'dried fruit', 'aged cheese', 'apple'],
        timing: 'dress 20 minutes before serving to soften'
      },
      fried: {
        method: 'separate leaves and deep fry until crispy',
        temperature: '350°F / (175 || 1)°C',
        timing: '1-2 minutes until crisp',
        seasonings: 'salt immediately after frying',
        serving: 'excellent garnish or snack'
      },
      hash: {
        method: 'quarter and pan-fry with potatoes',
        additions: ['bacon', 'onions', 'herbs'],
        timing: '15-20 minutes until crispy',
        serving: 'top with eggs for complete meal'
      }
    },
    storage: {
      temperature: 'refrigerated',
      duration: '7-10 days',
      humidity: 'medium',
      notes: 'Store in sealed container',
      frozen: {
        preparation: 'blanch for 3 minutes before freezing',
        duration: 'up to 12 months',
        best_uses: 'cooked dishes, not raw applications'
      }
    }
  },

  'bok choy': {
    name: 'Bok Choy',
    elementalProperties: { Water: 0.4, Air: 0.3, Earth: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Mercury'],
      favorableZodiac: ['cancer', 'virgo'],
      elementalAffinity: {
        base: 'Water',
        secondary: 'Air',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Air', planet: 'Mercury' },
          third: { element: 'Earth', planet: 'Venus' }
        },
        lunarPhaseModifiers: {
          newMoon: {
            elementalBoost: { Water: 0.15, Air: 0.05 },
            preparationTips: ['Light quick cooking', 'Gentle steaming']
          },
          fullMoon: {
            elementalBoost: { Water: 0.1, Earth: 0.1 },
            preparationTips: ['Enhanced flavors in soups', 'Better absorption of sauces']
          }
        }
      }
    },
    qualities: ['cooling', 'cleansing', 'hydrating', 'balancing', 'gentle'],
    season: ['fall', 'winter', 'spring'],
    category: 'vegetable',
    subCategory: 'cruciferous',
    affinities: [
      'ginger',
      'garlic',
      'sesame oil',
      'soy sauce',
      'shiitake',
      'scallion',
      'oyster sauce'
    ],
    cookingMethods: ['stir-fried', 'steamed', 'simmered', 'raw', 'braised', 'grilled'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['a', 'c', 'k', 'b6', 'folate'],
      minerals: ['calcium', 'iron', 'potassium', 'manganese'],
      calories: 13,
      protein_g: 1.5,
      fiber_g: 1,
      antioxidants: ['glucosinolates', 'phenolic compounds', 'flavonoids']
    },
    preparation: {
      washing: 'thoroughly between leaves',
      cutting: 'halved or quartered lengthwise for small varieties',
      separation: 'leaves and stems can be separated for different cooking times',
      notes: 'Baby bok choy can be cooked whole',
      techniques: 'stems take longer to cook than leaves'
    },
    varieties: {
      baby_bok_choy: {
        characteristics: 'small, tender, mild flavor',
        uses: 'whole cooking, showcase dishes',
        best_cooking_methods: ['steaming', 'gentle stir-fry'],
        notes: 'most tender variety'
      },
      shanghai_bok_choy: {
        characteristics: 'spoon-shaped light green leaves, mild flavor',
        uses: 'all-purpose cooking',
        best_cooking_methods: ['stir-frying', 'soup'],
        notes: 'more commonly available in Asian markets'
      },
      standard_bok_choy: {
        characteristics: 'larger, thick white stems, dark green leaves',
        uses: 'hearty cooking applications',
        best_cooking_methods: ['braising', 'stir-frying'],
        notes: 'separate stems and leaves for even cooking'
      },
      dwarf_bok_choy: {
        characteristics: 'compact, smaller than baby bok choy',
        uses: 'quick cooking, gentle methods',
        best_cooking_methods: ['steaming', 'light braise'],
        notes: 'very tender texture'
      }
    },
    culinaryApplications: {
      stir_fry: {
        method: 'quick cook in hot wok or pan',
        timing: '2-3 minutes for leaves, stems first for 1-2 minutes',
        sauces: ['oyster sauce', 'garlic sauce', 'ginger-soy'],
        technique: 'cook stems first, then add leaves'
      },
      soup: {
        method: 'add to broth near end of cooking',
        timing: '2-3 minutes until just wilted',
        broths: ['miso', 'chicken', 'vegetable', 'bone'],
        pairings: ['noodles', 'tofu', 'mushrooms', 'protein']
      },
      braised: {
        method: 'slow cook in flavored liquid',
        timing: '8-10 minutes',
        flavorings: ['garlic', 'ginger', 'star anise', 'soy'],
        technique: 'cover partially during cooking'
      },
      grilled: {
        method: 'brush with oil and grill quickly',
        timing: '2-3 minutes per side',
        marinade: 'soy, sesame oil, garlic',
        technique: 'halve lengthwise, maintain core for stability'
      }
    },
    storage: {
      temperature: 'refrigerated',
      duration: '3-5 days',
      humidity: 'high',
      notes: 'Store in plastic bag with small air holes',
      frozen: {
        preparation: 'blanch for 1 minute before freezing',
        duration: 'up to 3 months',
        best_uses: 'soups and cooked dishes'
      }
    }
  },

  kohlrabi: {
    name: 'Kohlrabi',
    elementalProperties: { Earth: 0.4, Air: 0.3, Water: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['capricorn', 'virgo'],
      elementalAffinity: {
        base: 'Earth',
        secondary: 'Air',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Saturn' },
          second: { element: 'Air', planet: 'Mercury' },
          third: { element: 'Water', planet: 'Moon' }
        },
        lunarPhaseModifiers: {
          firstQuarter: {
            elementalBoost: { Earth: 0.1, Air: 0.1 },
            preparationTips: ['Good for raw preparations', 'Enhanced crispness']
          },
          fullMoon: {
            elementalBoost: { Water: 0.1, Earth: 0.1 },
            preparationTips: ['Better flavor in cooked dishes', 'More sweetness development']
          }
        }
      }
    },
    qualities: ['grounding', 'cleansing', 'cooling', 'versatile', 'balancing'],
    season: ['spring', 'fall'],
    category: 'vegetable',
    subCategory: 'cruciferous',
    affinities: ['apple', 'caraway', 'dill', 'mustard', 'cream', 'butter', 'lemon'],
    cookingMethods: ['raw', 'roasted', 'steamed', 'stir-fried', 'sautéed', 'pickled', 'braised'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['c', 'b6', 'k', 'folate'],
      minerals: ['potassium', 'copper', 'manganese', 'phosphorus'],
      calories: 36,
      protein_g: 2.3,
      fiber_g: 4.9,
      antioxidants: ['isothiocyanates', 'glucosinolates', 'phenolic compounds']
    },
    preparation: {
      washing: true,
      peeling: 'remove tough outer skin',
      cutting: 'julienne, cube, or slice thinly',
      notes: 'Both bulb and leaves are edible',
      techniques: 'salt before cooking to remove excess moisture'
    },
    varieties: {
      green: {
        characteristics: 'pale green bulb, mild and sweet',
        uses: 'all-purpose, raw or cooked',
        best_cooking_methods: ['raw slaws', 'roasting', 'steaming'],
        notes: 'most common variety'
      },
      purple: {
        characteristics: 'purple skin, white flesh, slightly sweeter',
        uses: 'colorful raw applications',
        best_cooking_methods: ['slaws', 'salads', 'quick pickle'],
        notes: 'color is primarily in the skin'
      },

      gigante: {
        characteristics: 'very large bulb, slightly woody',
        uses: 'long-cooking dishes',
        best_cooking_methods: ['braising', 'stews', 'roasting'],
        notes: 'may need longer cooking times'
      }
    },
    culinaryApplications: {
      raw_slaw: {
        method: 'julienne or grate finely',
        dressing: 'vinaigrette or creamy dressing',
        additions: ['apple', 'carrot', 'cabbage', 'herbs'],
        technique: 'salt and drain before dressing to remove excess moisture'
      },
      roasted: {
        method: 'cube and roast at high heat (425°F / (220 || 1)°C)',
        timing: '25-30 minutes',
        seasonings: ['olive oil', 'garlic', 'caraway', 'thyme'],
        technique: 'toss halfway through cooking'
      },
      fritters: {
        method: 'grate and mix with batter',
        binding: 'egg, flour, seasonings',
        timing: '3-4 minutes per side',
        technique: 'squeeze out excess moisture before mixing',
        serving: 'with yogurt or sour cream sauce'
      },
      pickled: {
        method: 'thinly slice and pickle in brine',
        brine: 'vinegar, sugar, salt, spices',
        timing: 'quick pickle 2 hours, fermented 1-2 weeks',
        additions: ['mustard seeds', 'dill', 'garlic', 'bay leaf']
      }
    },
    storage: {
      temperature: 'refrigerated',
      duration: '2-3 weeks',
      humidity: 'high',
      notes: 'Remove leaves if storing long-term',
      frozen: {
        preparation: 'blanch for 2 minutes after peeling and cubing',
        duration: 'up to 8 months',
        best_uses: 'cooked dishes, not raw applications'
      }
    }
  },

  cabbage: {
    name: 'Cabbage',
    elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['cancer', 'capricorn'],
      elementalAffinity: {
        base: 'Water',
        secondary: 'Earth',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Jupiter' }
        },
        lunarPhaseModifiers: {
          fullMoon: {
            elementalBoost: { Water: 0.15, Earth: 0.05 },
            preparationTips: ['Best for fermentation', 'Enhanced preservation']
          },
          waningGibbous: {
            elementalBoost: { Earth: 0.1, Water: 0.1 },
            preparationTips: ['Good for hearty cooking methods', 'Improved digestibility']
          }
        }
      }
    },
    qualities: ['cooling', 'grounding', 'protective', 'enduring', 'versatile'],
    season: ['fall', 'winter', 'spring'],
    category: 'vegetable',
    subCategory: 'cruciferous',
    affinities: ['caraway', 'dill', 'apple', 'vinegar', 'mustard', 'bacon', 'juniper'],
    cookingMethods: ['fermented', 'braised', 'sautéed', 'raw', 'roasted', 'steamed', 'stir-fried'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['c', 'k', 'b6', 'folate'],
      minerals: ['potassium', 'manganese', 'calcium', 'magnesium'],
      calories: 25,
      protein_g: 1.3,
      fiber_g: 2.5,
      antioxidants: ['glucosinolates', 'polyphenols', 'anthocyanins', 'vitamin C'],
      probiotic_potential: 'very high when fermented'
    },
    preparation: {
      washing: 'outer leaves removed',
      cutting: 'shred, wedge, or separate leaves',
      core: 'remove core for most applications',
      notes: 'Salt raw cabbage to soften and release water',
      techniques: 'slice thinly against the grain for slaws'
    },
    varieties: {
      green: {
        characteristics: 'pale green leaves, firm head, slightly peppery',
        uses: 'all-purpose, long-cooking, fermentation',
        best_cooking_methods: ['braises', 'sauerkraut', 'soups'],
        notes: 'most common and versatile variety'
      },

      savoy: {
        characteristics: 'crinkled leaves, looser head, mild flavor',
        uses: 'elegant applications, stuffing, wrappers',
        best_cooking_methods: ['stuffed', 'sautéed', 'soup'],
        notes: 'most tender cabbage variety'
      },
      napa: {
        characteristics: 'oblong shape, yellow-green color, mild and sweet',
        uses: 'fermentation, quick cooking',
        best_cooking_methods: ['kimchi', 'stir-fry', 'raw'],
        notes: 'most delicate and sweet variety'
      },
      bok_choy: {
        characteristics: 'distinct leaves and stems, not a head',
        uses: 'East Asian preparations',
        best_cooking_methods: ['stir-fry', 'soup', 'steamed'],
        notes: 'technically a distinct variety of Chinese cabbage'
      }
    },
    culinaryApplications: {
      fermentation: {
        method: 'salt and ferment in anaerobic conditions',
        timing: '1-4 weeks depending on temperature',
        variations: ['sauerkraut', 'kimchi', 'curtido'],
        technique: 'maintain below brine, control temperature',
        equipment: 'fermentation vessel with weight or airlock'
      },
      braised: {
        method: 'slow-cook with liquid until tender',
        timing: '45-60 minutes',
        flavorings: ['onion', 'apple', 'vinegar', 'caraway', 'bacon'],
        technique: 'gradual evaporation of liquid creates rich flavor'
      },
      slaw: {
        method: 'shred finely and dress',
        dressing_types: ['vinaigrette', 'creamy', 'mayo-based'],
        additions: ['carrots', 'apples', 'dried fruit', 'nuts'],
        technique: 'salt and drain before dressing for crisp texture'
      },
      stuffed: {
        method: 'parboil whole leaves and roll with filling',
        fillings: ['rice', 'meat', 'grains', 'vegetables'],
        cooking: 'bake in sauce or simmer in broth',
        technique: 'freeze head first for easier leaf separation'
      },
      roasted: {
        method: 'cut in wedges and roast at high heat',
        timing: '25-30 minutes at 425°F / (220 || 1)°C',
        seasonings: ['olive oil', 'garlic', 'butter', 'caraway'],
        technique: 'cut through core to keep wedges intact'
      }
    },
    storage: {
      temperature: 'refrigerated',
      duration: '1-2 months for whole heads',
      humidity: 'high',
      notes: 'Wrap cut cabbage tightly, use within a week',
      frozen: {
        preparation: 'blanch for 1-2 minutes',
        duration: 'up to 9 months',
        best_uses: 'cooked dishes only'
      },
      fermented: {
        duration: '6-12 months refrigerated',
        notes: 'flavor becomes more complex over time'
      }
    }
  }
},

// Fix the ingredient mappings to ensure they have all required properties
// ✅ Pattern MM-1: Type assertion for ZodiacSign[] compatibility
export const cruciferous: Record<string, IngredientMapping> = fixIngredientMappings(
  rawCruciferous as Record<string, Partial<IngredientMapping>>,
)
