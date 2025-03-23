import type { ElementalProperties, IngredientMapping, ZodiacSign } from '@/types/alchemy';

// Helper function to standardize ingredient mappings
function createIngredientMapping(
  id: string,
  properties: Partial<IngredientMapping>
): IngredientMapping {
  return {
    name: id,
    elementalProperties: properties.elementalProperties || { 
      Earth: 0.25, 
      Water: 0.25, 
      Fire: 0.25, 
      Air: 0.25 
    },
    category: properties.category || '',
    ...properties
  };
}

export const plantBased: Record<string, IngredientMapping> = {
  'tempeh': createIngredientMapping('tempeh', {
    elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mars'],
      favorableZodiac: ['capricorn', 'aries'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Saturn' },
          second: { element: 'Fire', planet: 'Mars' },
          third: { element: 'Water', planet: 'Pluto' }
        }
      },
      lunarPhaseModifiers: {
        waxingGibbous: {
          elementalBoost: { Earth: 0.1, Fire: 0.1 },
          preparationTips: ['Best for grilling']
        },
        fullMoon: {
          elementalBoost: { Fire: 0.2 },
          preparationTips: ['Ideal for frying']
        }
      }
    },
    qualities: ['fermented', 'nutty', 'firm'],
    origin: ['Indonesia', 'Java'],
    category: 'protein',
    subCategory: 'plant_based',
    nutritionalProfile: {
      protein: '19g/100g',
      fats: '11g/100g',
      carbs: '9g/100g'
    },
    culinaryApplications: {
      'stir-fry': {
        prepTime: '15 mins',
        cookingTemp: 'medium-high'
      },
      'baking': {
        prepTime: '25 mins',
        cookingTemp: '375°F'
      }
    },
    varieties: {
      'Traditional': {
        appearance: 'white mycelium, visible soybeans',
        texture: 'firm, dense',
        flavor: 'nutty, mushroom-like',
        notes: 'whole soybean variety'
      },
      'Multi_grain': {
        appearance: 'varied color based on grains',
        texture: 'more varied texture',
        flavor: 'complex grain notes',
        notes: 'mixed with various grains'
      },
      'Flax': {
        appearance: 'darker spots from seeds',
        texture: 'slightly looser bind',
        flavor: 'nutty, omega-rich',
        notes: 'higher in omega-3'
      }
    },
    regionalPreparations: {
      'indonesian': {
        'traditional': {
          'goreng': {
            method: 'thin slice and fry',
            marinade: ['garlic', 'coriander', 'turmeric'],
            service: 'with sambal and rice'
          },
          'bacem': {
            method: 'braised in spiced coconut water',
            spices: ['galangal', 'tamarind', 'palm sugar'],
            finish: 'pan-fry until caramelized'
          }
        }
      },
      'modern': {
        'western': {
          'bacon_style': {
            marinade: ['liquid smoke', 'maple', 'soy'],
            method: 'thin slice and pan-fry',
            use: 'breakfast protein, sandwiches'
          },
          'cutlet': {
            preparation: 'steam, marinate, bread',
            cooking: 'pan-fry or bake',
            service: 'with gravy or sauce'
          }
        },
        'fusion': {
          'korean_bbq': {
            marinade: ['gochujang', 'sesame', 'garlic'],
            method: 'grill or pan-fry',
            service: 'with lettuce wraps'
          },
          'mediterranean': {
            marinade: ['olive oil', 'herbs', 'lemon'],
            method: 'grill or bake',
            service: 'with tahini sauce'
          }
        }
      }
    },
    saucePairings: {
      'asian': {
        'peanut': {
          base: 'ground peanuts',
          ingredients: ['coconut milk', 'soy', 'lime'],
          spices: ['ginger', 'garlic', 'chili']
        },
        'sweet_soy': {
          base: 'kecap manis',
          aromatics: ['garlic', 'chili'],
          finish: 'lime juice'
        }
      },
      'western': {
        'mushroom_gravy': {
          base: 'mushroom stock',
          thickener: 'roux or cornstarch',
          finish: 'herbs and wine'
        },
        'chimichurri': {
          base: 'olive oil',
          herbs: ['parsley', 'oregano'],
          aromatics: ['garlic', 'chili']
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
        preparations: ['grilled', 'smoked'],
        marinades: ['lighter citrus', 'herb-based'],
        accompaniments: ['fresh slaws', 'grilled vegetables']
      },
      'winter': {
        preparations: ['baked', 'braised'],
        marinades: ['richer soy', 'spice-based'],
        accompaniments: ['roasted vegetables', 'hearty grains']
      }
    }
  }),

  'seitan': {
    name: 'seitan',
    elementalProperties: { Fire: 0.4, Earth: 0.4, Air: 0.1, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Saturn'],
      favorableZodiac: ['aries', 'capricorn'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Mars' },
          second: { element: 'Fire', planet: 'Saturn' },
          third: { element: 'Water', planet: 'Pluto' }
        }
      },
      lunarPhaseModifiers: {
        waxingGibbous: {
          elementalBoost: { Earth: 0.1, Fire: 0.1 },
          preparationTips: ['Best for grilling']
        },
        fullMoon: {
          elementalBoost: { Fire: 0.2 },
          preparationTips: ['Ideal for frying']
        }
      }
    },
    qualities: ['chewy', 'versatile', 'high-protein'],
    origin: ['China', 'Buddhist Cuisine'],
    category: 'protein',
    subCategory: 'plant_based',
    preparation: {
      basic: {
        ingredients: ['vital wheat gluten', 'spices'],
        steps: ['mix', 'knead', 'simmer']
      }
    },
    culinaryApplications: {
      'cooking_methods': {
        'braise': {
          liquid: 'flavorful broth',
          timing: '1-2 hours',
          result: 'tender, flavor-infused'
        },
        'grill': {
          preparation: 'slice thick',
          marinade: 'oil-based',
          timing: '4-5 minutes per side'
        },
        'stir_fry': {
          cut: 'thin strips',
          heat: 'high',
          timing: '3-4 minutes total'
        }
      }
    },
    regionalPreparations: {
      'chinese': {
        'buddhist': {
          'mock_duck': {
            seasoning: ['five spice', 'soy'],
            method: 'braised',
            service: 'with vegetables'
          },
          'mapo_style': {
            sauce: ['doubanjiang', 'soy'],
            preparation: 'cubed',
            spice_level: 'adjustable'
          }
        }
      },
      'western': {
        'roasts': {
          'holiday': {
            seasoning: ['sage', 'thyme', 'garlic'],
            method: 'baked',
            service: 'with gravy'
          },
          'smoky': {
            seasoning: ['smoked paprika', 'garlic'],
            method: 'slow roasted',
            service: 'with barbecue sauce'
          }
        }
      }
    },
    saucePairings: {
      'asian': {
        'black_bean': {
          base: 'fermented black beans',
          aromatics: ['garlic', 'ginger'],
          finish: 'sesame oil'
        },
        'kung_pao': {
          base: 'soy sauce',
          spices: ['dried chilies', 'Sichuan peppercorns'],
          finish: 'peanuts'
        }
      },
      'western': {
        'mushroom_gravy': {
          base: 'mushroom stock',
          thickener: 'roux',
          finish: 'herbs'
        },
        'barbecue': {
          base: 'tomato',
          seasonings: ['smoke', 'molasses'],
          finish: 'vinegar'
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
        preparations: ['grilled', 'kebabs'],
        sauces: ['lighter barbecue', 'herb marinades'],
        accompaniments: ['grilled vegetables', 'fresh salads']
      },
      'winter': {
        preparations: ['roasts', 'stews'],
        sauces: ['rich gravies', 'thick glazes'],
        accompaniments: ['roasted roots', 'hearty grains']
      }
    }
  },

  'tofu_varieties': createIngredientMapping('tofu_varieties', {
    elementalProperties: { Water: 0.5, Earth: 0.3, Air: 0.1, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Moon' },
          second: { element: 'Water', planet: 'Venus' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Earth: 0.1, Water: 0.1 },
          preparationTips: ['Best for marinating']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for baking']
        }
      }
    },
    qualities: ['versatile', 'neutral', 'protein-rich'],
    origin: ['China', 'East Asia'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      'silken': {
        texture: 'custard-like',
        protein_content: 'lower',
        applications: {
          'raw': ['smoothies', 'desserts', 'sauces'],
          'cooked': ['soups', 'delicate braised dishes'],
          'handling': 'very gentle, breaks easily'
        }
      },
      'firm': {
        texture: 'solid but tender',
        protein_content: 'medium',
        applications: {
          'stir_fry': 'holds shape well',
          'grilling': 'can be grilled if handled carefully',
          'braising': 'ideal for most braised dishes'
        }
      },
      'extra_firm': {
        texture: 'dense, meaty',
        protein_content: 'highest',
        applications: {
          'grilling': 'ideal for grilling',
          'baking': 'holds shape perfectly',
          'frying': 'crispy exterior possible'
        }
      }
    },
    culinaryApplications: {
      'pressing': {
        method: 'weight and drain',
        timing: {
          'firm': '30 minutes',
          'extra_firm': '15-20 minutes'
        },
        notes: 'skip for silken'
      },
      'marinades': {
        'basic': {
          ingredients: ['soy sauce', 'rice vinegar', 'ginger'],
          timing: '2-24 hours',
          notes: 'longer for firmer varieties'
        },
        'spicy': {
          ingredients: ['chili oil', 'garlic', 'sesame'],
          timing: '2-12 hours',
          notes: 'good for grilling'
        }
      },
      'cooking_methods': {
        'agedashi': {
          preparation: 'cornstarch dusted',
          frying: 'medium heat',
          sauce: 'dashi-based'
        },
        'mapo': {
          cut: 'large cubes',
          sauce: 'spicy bean paste',
          method: 'simmer gently'
        },
        'grilled': {
          preparation: 'pressed and marinated',
          method: 'high heat',
          finish: 'glaze or sauce'
        }
      }
    },
    regionalPreparations: {
      'chinese': {
        'sichuan': {
          'mapo_tofu': {
            spices: ['doubanjiang', 'Sichuan peppercorn'],
            method: 'braise with ground meat or mushrooms',
            service: 'with rice'
          },
          'home_style': {
            sauce: 'black bean garlic',
            vegetables: 'varied seasonal',
            method: 'quick braise'
          }
        },
        'cantonese': {
          'clay_pot': {
            method: 'slow cook',
            ingredients: ['mushrooms', 'greens'],
            sauce: 'oyster-style sauce'
          }
        }
      },
      'japanese': {
        'hiyayakko': {
          type: 'silken',
          toppings: ['ginger', 'bonito', 'scallion'],
          service: 'chilled'
        },
        'dengaku': {
          type: 'firm',
          glaze: 'miso-based',
          method: 'grilled or broiled'
        }
      },
      'korean': {
        'soondubu': {
          type: 'silken',
          preparation: 'spicy stew',
          accompaniments: ['eggs', 'seafood or vegetables']
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
        preparations: ['chilled', 'grilled'],
        sauces: ['light dipping', 'citrus-based'],
        accompaniments: ['cold noodles', 'fresh herbs']
      },
      'winter': {
        preparations: ['braised', 'stewed'],
        sauces: ['rich spicy', 'warming'],
        accompaniments: ['hot pot', 'warming soups']
      }
    }
  }),

  'legumes_protein': createIngredientMapping('legumes_protein', {
    elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Moon' },
          second: { element: 'Water', planet: 'Venus' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Earth: 0.1, Water: 0.1 },
          preparationTips: ['Best for marinating']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for baking']
        }
      }
    },
    qualities: ['hearty', 'versatile', 'nutritious'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      'chickpeas': {
        preparation: {
          'dried': {
            soaking: '8-24 hours',
            cooking: '1-2 hours',
            notes: 'firmer texture, better for falafel'
          },
          'quick': {
            method: 'pressure cook',
            timing: '45 minutes',
            notes: 'no soaking needed'
          }
        },
        applications: {
          'falafel': {
            ingredients: ['herbs', 'spices', 'garlic'],
            method: 'ground and fried',
            notes: 'use dried, not canned'
          },
          'hummus': {
            ingredients: ['tahini', 'lemon', 'garlic'],
            method: 'pureed smooth',
            variations: ['classic', 'roasted red pepper', 'herb']
          }
        }
      },
      'lentils': {
        varieties: {
          'red': {
            cooking_time: '20-25 minutes',
            texture: 'soft, breaking down',
            best_for: ['soups', 'dals', 'purees']
          },
          'green_french': {
            cooking_time: '25-30 minutes',
            texture: 'holds shape',
            best_for: ['salads', 'side dishes']
          },
          'black_beluga': {
            cooking_time: '20-25 minutes',
            texture: 'firm, caviar-like',
            best_for: ['garnishes', 'salads']
          }
        }
      }
    },
    culinaryApplications: {
      'legume_preparations': {
        'dal': {
          method: 'simmer with spices',
          spices: ['turmeric', 'cumin', 'ginger'],
          variations: {
            'masoor': 'red lentils',
            'moong': 'split mung beans',
            'chana': 'split chickpeas'
          },
          tempering: {
            method: 'spiced oil finish',
            ingredients: ['cumin seeds', 'garlic', 'chilies'],
            timing: 'add just before serving'
          }
        },
        'falafel': {
          ingredients: {
            base: ['dried chickpeas', 'herbs', 'spices'],
            herbs: ['parsley', 'cilantro'],
            spices: ['cumin', 'coriander', 'cardamom']
          },
          method: {
            preparation: 'ground raw chickpeas',
            resting: '30 minutes minimum',
            shaping: 'small balls or patties',
            frying: '350°F/175°C until golden'
          }
        },
        'lentil_loaf': {
          ingredients: {
            legumes: 'brown or green lentils',
            binders: ['oats', 'flax', 'vegetables'],
            seasonings: ['herbs', 'mushrooms', 'soy sauce']
          },
          method: {
            preparation: 'combine cooked lentils with binders',
            baking: '350°F/175°C for 45 minutes',
            resting: '10 minutes before slicing'
          }
        }
      },
      'modern_applications': {
        'burger_patties': {
          base: ['lentils', 'chickpeas', 'black beans'],
          binders: ['vital wheat gluten', 'oats'],
          seasonings: ['smoke', 'umami', 'spices'],
          method: 'form and grill or pan-fry'
        },
        'meat_crumbles': {
          base: 'lentils or tempeh',
          seasoning: ['taco', 'italian', 'chorizo'],
          usage: ['tacos', 'pasta', 'stuffing']
        }
      }
    },
    regionalPreparations: {
      'middle_eastern': {
        'mujaddara': {
          ingredients: ['lentils', 'rice', 'caramelized onions'],
          spices: ['cumin', 'black pepper'],
          service: 'with yogurt sauce'
        },
        'koshari': {
          ingredients: ['lentils', 'rice', 'pasta', 'tomato sauce'],
          toppings: ['fried onions', 'spicy sauce'],
          service: 'layered in bowl'
        }
      },
      'indian': {
        'dal_variations': {
          'tadka_dal': {
            lentils: 'yellow split peas',
            tempering: 'ghee with spices',
            service: 'with rice or roti'
          },
          'dal_makhani': {
            legumes: ['black lentils', 'kidney beans'],
            cooking: 'slow simmered with cream',
            service: 'rich and creamy'
          }
        }
      },
      'mediterranean': {
        'farinata': {
          base: 'chickpea flour',
          method: 'baked in hot pan',
          seasonings: ['rosemary', 'black pepper']
        },
        'revithia': {
          base: 'chickpeas',
          method: 'slow baked',
          seasonings: ['olive oil', 'lemon', 'herbs']
        }
      }
    },
    saucePairings: {
      'traditional': {
        'tahini': {
          base: 'sesame paste',
          additions: ['lemon', 'garlic', 'herbs'],
          uses: ['falafel', 'buddha bowls']
        },
        'tamarind_chutney': {
          base: 'tamarind paste',
          sweetener: 'jaggery or dates',
          spices: ['cumin', 'ginger', 'chili']
        }
      },
      'modern': {
        'cashew_cream': {
          base: 'soaked cashews',
          variations: ['garlic herb', 'spicy chipotle', 'ranch'],
          uses: 'creamy sauce replacement'
        },
        'umami_gravy': {
          base: ['mushroom stock', 'miso'],
          thickener: 'arrowroot or cornstarch',
          finish: ['herbs', 'nutritional yeast']
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
        preparations: ['cold salads', 'grilled patties'],
        sauces: ['light herb', 'citrus-based'],
        accompaniments: ['fresh vegetables', 'herbs']
      },
      'winter': {
        preparations: ['stews', 'baked dishes'],
        sauces: ['rich gravies', 'spiced'],
        accompaniments: ['roasted vegetables', 'grains']
      }
    },
    safetyThresholds: {
      'storage': {
        'dried': {
          conditions: 'cool, dry place',
          duration: 'up to 1 year',
          notes: 'check for insects'
        },
        'cooked': {
          refrigerated: '3-5 days',
          frozen: 'up to 6 months'
        }
      },
      'preparation': {
        'sprouting': {
          method: 'rinse 2-3 times daily',
          duration: '2-5 days',
          safety: 'use clean water, watch for mold'
        },
        'cooking': {
          'minimum': 'until tender',
          'pressure_cooking': 'follow cooker instructions',
          'boiling': 'full rolling boil for specified time'
        }
      }
    }
  }),

  'textured_vegetable_protein': createIngredientMapping('textured_vegetable_protein', {
    elementalProperties: { Earth: 0.4, Air: 0.3, Fire: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Moon' },
          second: { element: 'Water', planet: 'Venus' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Earth: 0.1, Water: 0.1 },
          preparationTips: ['Best for marinating']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for baking']
        }
      }
    },
    qualities: ['versatile', 'meat-like', 'protein-rich'],
    origin: ['United States', 'Industrial Development'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      'Granules': {
        appearance: 'small, crumbly pieces',
        texture: 'ground meat-like',
        applications: {
          'ground_meat_substitute': ['tacos', 'bolognese', 'chili'],
          'preparation': 'rehydrate before use'
        }
      },
      'Chunks': {
        appearance: 'larger pieces',
        texture: 'chewy, meat-like',
        applications: {
          'stews': 'holds shape well',
          'curries': 'absorbs flavors well',
          'stir_fries': 'maintains texture'
        }
      }
    },
    culinaryApplications: {
      'rehydration': {
        method: 'hot liquid soak',
        timing: {
          'granules': '5-10 minutes',
          'chunks': '15-20 minutes'
        },
        liquids: {
          'basic': 'hot water',
          'flavored': ['vegetable broth', 'mushroom stock'],
          'ratio': '1:1 TVP to liquid'
        }
      },
      'cooking_methods': {
        'pan_fry': {
          preparation: 'rehydrate first',
          method: 'medium-high heat',
          timing: '5-7 minutes',
          notes: 'brown for better flavor'
        },
        'bake': {
          temperature: { fahrenheit: 350, celsius: 175 },
          timing: '20-25 minutes',
          notes: 'good for casseroles'
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
        preparations: ['taco filling', 'burger crumbles'],
        seasonings: ['fresh herbs', 'grilling spices'],
        accompaniments: ['fresh salads', 'grilled vegetables']
      },
      'winter': {
        preparations: ['stews', 'casseroles'],
        seasonings: ['warming spices', 'herbs'],
        accompaniments: ['root vegetables', 'grains']
      }
    }
  }),

  'jackfruit_young': createIngredientMapping('jackfruit_young', {
    elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Moon' },
          second: { element: 'Water', planet: 'Venus' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Earth: 0.1, Water: 0.1 },
          preparationTips: ['Best for marinating']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for baking']
        }
      }
    },
    qualities: ['fibrous', 'meaty', 'neutral'],
    origin: ['Southeast Asia'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      'Canned': {
        appearance: 'pale, chunky pieces',
        texture: 'shreddable, meat-like',
        applications: {
          'pulled_meat_substitute': ['sandwiches', 'tacos'],
          'preparation': 'drain and rinse well'
        }
      },
      'Fresh': {
        appearance: 'pale yellow, fibrous',
        texture: 'firm, stringy',
        applications: {
          'curry': 'traditional preparation',
          'braised_dishes': 'holds sauce well'
        }
      }
    },
    culinaryApplications: {
      'preparation': {
        'canned': {
          steps: [
            'drain thoroughly',
            'rinse well',
            'squeeze out liquid',
            'shred or chop'
          ],
          notes: 'remove tough core pieces'
        },
        'fresh': {
          steps: [
            'oil hands well',
            'remove core',
            'separate pods',
            'remove seeds'
          ],
          notes: 'very sticky when fresh'
        }
      },
      'cooking_methods': {
        'pulled_style': {
          preparation: 'shred thoroughly',
          sauce: 'barbecue or similar',
          timing: '20-30 minutes simmer',
          finish: 'reduce sauce until thick'
        },
        'curry': {
          preparation: 'chunk or shred',
          spices: 'curry blend',
          timing: '25-35 minutes',
          notes: 'absorbs flavors well'
        }
      }
    },
    regionalPreparations: {
      'southeast_asian': {
        'traditional': {
          'curry': {
            spices: ['turmeric', 'coconut milk', 'chilies'],
            method: 'simmer until tender',
            service: 'with rice'
          }
        }
      },
      'western': {
        'modern': {
          'pulled_bbq': {
            sauce: ['smoky barbecue', 'liquid smoke'],
            method: 'slow cook',
            service: 'on buns with slaw'
          }
        }
      }
    }
  }),

  'quinoa_protein': createIngredientMapping('quinoa_protein', {
    elementalProperties: { Earth: 0.3, Air: 0.3, Fire: 0.2, Water: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Moon' },
          second: { element: 'Water', planet: 'Venus' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Earth: 0.1, Water: 0.1 },
          preparationTips: ['Best for marinating']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for baking']
        }
      }
    },
    qualities: ['complete protein', 'fluffy', 'versatile'],
    origin: ['Andean Region'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      'White': {
        appearance: 'pale, small seeds',
        texture: 'light, fluffy',
        applications: {
          'protein_bowl': ['buddha bowls', 'salads'],
          'preparation': 'rinse thoroughly before cooking'
        }
      },
      'Red': {
        appearance: 'burgundy colored',
        texture: 'slightly crunchier',
        applications: {
          'warm_dishes': 'holds shape well',
          'cold_salads': 'dramatic color'
        }
      },
      'Black': {
        appearance: 'deep black',
        texture: 'earthier, firmer',
        applications: {
          'gourmet_dishes': 'striking presentation',
          'protein_base': 'hearty texture'
        }
      }
    },
    culinaryApplications: {
      'preparation': {
        'basic_cooking': {
          ratio: '1:2 quinoa to liquid',
          timing: '15-20 minutes',
          method: 'simmer then steam',
          notes: 'let stand 5-10 minutes covered'
        },
        'pilaf_style': {
          method: 'toast first, then cook',
          aromatics: ['onion', 'garlic', 'herbs'],
          liquid: 'vegetable broth'
        }
      },
      'modern_applications': {
        'quinoa_burger': {
          base: ['cooked quinoa', 'black beans'],
          binders: ['ground flax', 'breadcrumbs'],
          seasonings: ['cumin', 'garlic', 'smoked paprika'],
          method: 'form and pan-fry'
        },
        'protein_crust': {
          method: 'bind with flax egg',
          applications: ['quiche', 'savory tarts'],
          notes: 'pre-bake for crispy texture'
        }
      }
    },
    regionalPreparations: {
      'andean': {
        'traditional': {
          'quinoa_soup': {
            ingredients: ['vegetables', 'herbs', 'quinoa'],
            method: 'simmer until tender',
            service: 'hot with garnishes'
          }
        }
      },
      'modern_global': {
        'breakfast_bowl': {
          base: 'cooked quinoa',
          toppings: ['nuts', 'fruits', 'plant milk'],
          variations: ['sweet', 'savory']
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
        preparations: ['cold salads', 'stuffed vegetables'],
        seasonings: ['fresh herbs', 'citrus'],
        accompaniments: ['grilled vegetables', 'light dressings']
      },
      'winter': {
        preparations: ['warm bowls', 'soups'],
        seasonings: ['warming spices', 'roasted garlic'],
        accompaniments: ['roasted vegetables', 'hearty sauces']
      }
    }
  }),

  'hemp_protein': createIngredientMapping('hemp_protein', {
    elementalProperties: { Earth: 0.4, Air: 0.3, Water: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Moon' },
          second: { element: 'Water', planet: 'Venus' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Earth: 0.1, Water: 0.1 },
          preparationTips: ['Best for marinating']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for baking']
        }
      }
    },
    qualities: ['complete protein', 'nutty', 'sustainable'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      'Seeds': {
        appearance: 'small, greenish',
        texture: 'crunchy, tender',
        applications: {
          'topping': ['salads', 'bowls', 'yogurt'],
          'preparation': 'no preparation needed'
        }
      },
      'Protein_Powder': {
        appearance: 'fine green powder',
        texture: 'slightly gritty',
        applications: {
          'smoothies': 'blend with liquids',
          'baking': 'partial flour replacement'
        }
      }
    },
    culinaryApplications: {
      'protein_boost': {
        'smoothies': {
          base: ['plant milk', 'fruits'],
          additions: ['hemp protein', 'seeds'],
          notes: 'blend thoroughly'
        },
        'baked_goods': {
          method: 'replace 25% flour',
          applications: ['breads', 'muffins'],
          notes: 'increases moisture needed'
        }
      },
      'raw_applications': {
        'energy_balls': {
          ingredients: ['dates', 'nuts', 'hemp'],
          method: 'process and form',
          storage: 'refrigerate'
        },
        'seed_coating': {
          applications: ['tofu', 'tempeh'],
          method: 'press seeds into surface',
          cooking: 'pan-sear for crunch'
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
        preparations: ['smoothie bowls', 'cold drinks'],
        combinations: ['fresh fruits', 'herbs'],
        notes: 'lighter applications'
      },
      'winter': {
        preparations: ['hot cereals', 'baking'],
        combinations: ['warming spices', 'dried fruits'],
        notes: 'heartier applications'
      }
    }
  }),

  'pea_protein': createIngredientMapping('pea_protein', {
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Moon' },
          second: { element: 'Water', planet: 'Venus' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Earth: 0.1, Water: 0.1 },
          preparationTips: ['Best for marinating']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for baking']
        }
      }
    },
    qualities: ['versatile', 'neutral', 'complete protein'],
    origin: ['Global'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      'Isolate': {
        appearance: 'fine beige powder',
        texture: 'smooth when blended',
        applications: {
          'protein_shakes': 'complete amino profile',
          'meat_alternatives': 'binding and structure'
        }
      },
      'Textured': {
        appearance: 'granules or chunks',
        texture: 'meat-like when hydrated',
        applications: {
          'meat_substitute': ['ground meat alternatives', 'patties'],
          'preparation': 'rehydrate before use'
        }
      }
    },
    culinaryApplications: {
      'protein_fortification': {
        'baking': {
          method: 'blend with dry ingredients',
          ratio: 'up to 15% of flour weight',
          notes: 'may need additional liquid'
        },
        'smoothies': {
          method: 'blend with liquid first',
          ratio: '20-30g per serving',
          notes: 'combine with fruits for flavor'
        }
      },
      'meat_alternative': {
        'burger_base': {
          ingredients: ['pea protein', 'vegetable oils', 'binders'],
          method: 'mix and form',
          cooking: 'grill or pan-fry'
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
        preparations: ['protein shakes', 'cold applications'],
        combinations: ['fresh fruits', 'mint'],
        notes: 'lighter preparations'
      },
      'winter': {
        preparations: ['baked goods', 'hot drinks'],
        combinations: ['cocoa', 'warming spices'],
        notes: 'heartier applications'
      }
    }
  }),

  'lentil_protein': createIngredientMapping('lentil_protein', {
    elementalProperties: { Earth: 0.5, Fire: 0.2, Water: 0.2, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Moon' },
          second: { element: 'Water', planet: 'Venus' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Earth: 0.1, Water: 0.1 },
          preparationTips: ['Best for marinating']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for baking']
        }
      }
    },
    qualities: ['hearty', 'versatile', 'protein-rich'],
    origin: ['Middle East', 'Mediterranean'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      'Red_Lentils': {
        appearance: 'split, orange-red',
        texture: 'soft when cooked',
        applications: {
          'soups': 'quick-cooking, creamy',
          'dals': 'traditional Indian preparations'
        }
      },
      'Black_Lentils': {
        appearance: 'small, black',
        texture: 'firm, holds shape',
        applications: {
          'salads': 'maintains texture',
          'main_dishes': 'meaty texture'
        }
      },
      'French_Green': {
        appearance: 'small, mottled green',
        texture: 'firm, peppery',
        applications: {
          'salads': 'holds shape well',
          'side_dishes': 'elegant presentation'
        }
      }
    },
    culinaryApplications: {
      'basic_cooking': {
        method: 'simmer until tender',
        timing: {
          'red': '15-20 minutes',
          'black': '25-30 minutes',
          'french_green': '20-25 minutes'
        },
        liquid_ratio: '1:2.5 lentils to water'
      },
      'protein_applications': {
        'lentil_loaf': {
          ingredients: ['cooked lentils', 'vegetables', 'binders'],
          method: 'bake until firm',
          notes: 'excellent meat alternative'
        },
        'lentil_patties': {
          base: ['cooked lentils', 'grains'],
          seasonings: ['herbs', 'spices'],
          method: 'form and pan-fry'
        }
      }
    },
    regionalPreparations: {
      'indian': {
        'dal': {
          ingredients: ['lentils', 'spices', 'ghee'],
          method: 'simmer with spices',
          service: 'with rice or flatbread'
        }
      },
      'mediterranean': {
        'lentil_soup': {
          ingredients: ['lentils', 'vegetables', 'herbs'],
          method: 'simmer until tender',
          service: 'with olive oil drizzle'
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
        preparations: ['cold salads', 'sprouted'],
        seasonings: ['fresh herbs', 'lemon'],
        accompaniments: ['fresh vegetables', 'light grains']
      },
      'winter': {
        preparations: ['soups', 'stews', 'loaves'],
        seasonings: ['warming spices', 'garlic'],
        accompaniments: ['root vegetables', 'hearty grains']
      }
    }
  }),

  'chickpea_protein': createIngredientMapping('chickpea_protein', {
    elementalProperties: { Earth: 0.4, Fire: 0.2, Air: 0.2, Water: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Moon' },
          second: { element: 'Water', planet: 'Venus' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Earth: 0.1, Water: 0.1 },
          preparationTips: ['Best for marinating']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for baking']
        }
      }
    },
    qualities: ['versatile', 'nutty', 'hearty'],
    origin: ['Mediterranean', 'Middle East'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      'Whole': {
        appearance: 'round, beige',
        texture: 'firm, creamy when cooked',
        applications: {
          'hummus': 'traditional spread',
          'falafel': 'deep-fried patties',
          'curries': 'whole bean dishes'
        }
      },
      'Flour': {
        appearance: 'fine yellow powder',
        texture: 'smooth when cooked',
        applications: {
          'flatbreads': 'socca/farinata',
          'batters': 'binding agent',
          'protein_boost': 'baking enhancement'
        }
      }
    },
    culinaryTraditions: {
      'middle_eastern': {
        name: 'hummus',
        usage: ['dips', 'spreads', 'sauces'],
        preparation: 'pureed with tahini and lemon',
        pairings: ['olive oil', 'paprika', 'pita'],
        cultural_notes: 'Essential mezze component'
      },
      'indian': {
        name: 'chana',
        usage: ['curries', 'stews', 'snacks'],
        preparation: 'whole or ground preparations',
        pairings: ['spices', 'rice', 'flatbreads'],
        cultural_notes: 'Important protein source'
      }
    },
    preparation: {
      soaking: '8-12 hours',
      cooking: '45-60 minutes',
      notes: 'Save aquafaba (cooking liquid)'
    },
    storage: {
      dried: {
        temperature: 'room temperature',
        duration: '1-2 years',
        method: 'airtight container'
      },
      cooked: {
        temperature: { fahrenheit: 40, celsius: 4 },
        duration: '3-5 days',
        method: 'refrigerated in liquid'
      }
    }
  }),

  'lupin_protein': createIngredientMapping('lupin_protein', {
    elementalProperties: { Earth: 0.4, Air: 0.3, Fire: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Moon' },
          second: { element: 'Water', planet: 'Venus' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Earth: 0.1, Water: 0.1 },
          preparationTips: ['Best for marinating']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for baking']
        }
      }
    },
    qualities: ['high-protein', 'low-carb', 'alkaline'],
    origin: ['Mediterranean', 'Australia'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      'Flour': {
        appearance: 'fine yellow powder',
        texture: 'smooth, protein-rich',
        applications: {
          'baking': 'protein enrichment',
          'pasta': 'protein boost',
          'protein_bars': 'binding agent'
        }
      },
      'Flakes': {
        appearance: 'golden flakes',
        texture: 'crunchy when dry',
        applications: {
          'coating': 'breading alternative',
          'granola': 'protein boost',
          'yogurt_topping': 'crunchy addition'
        }
      }
    },
    culinaryApplications: {
      'baking': {
        'bread': {
          ratio: 'up to 20% flour replacement',
          benefits: 'protein boost, structure',
          notes: 'may need additional liquid'
        },
        'pasta': {
          method: 'blend with semolina',
          ratio: '15-30% replacement',
          notes: 'increases protein content'
        }
      },
      'protein_enrichment': {
        'smoothies': {
          amount: '10-20g per serving',
          method: 'blend with liquid first',
          notes: 'neutral flavor profile'
        },
        'bars': {
          binding: 'combines well with dates',
          ratio: '20-30% of dry ingredients',
          notes: 'good protein-to-fiber ratio'
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
        preparations: ['smoothie bowls', 'cold drinks'],
        combinations: ['fresh fruits', 'seeds'],
        notes: 'light applications'
      },
      'winter': {
        preparations: ['baked goods', 'warm cereals'],
        combinations: ['nuts', 'dried fruits'],
        notes: 'heartier applications'
      }
    }
  }),

  'fava_protein': createIngredientMapping('fava_protein', {
    elementalProperties: { Earth: 0.3, Water: 0.3, Air: 0.2, Fire: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Moon' },
          second: { element: 'Water', planet: 'Venus' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Earth: 0.1, Water: 0.1 },
          preparationTips: ['Best for marinating']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for baking']
        }
      }
    },
    qualities: ['rich', 'creamy', 'versatile'],
    origin: ['Mediterranean', 'Middle East'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      'Whole_Beans': {
        appearance: 'large, light green',
        texture: 'creamy when cooked',
        applications: {
          'stews': 'traditional dishes',
          'purees': 'dips and spreads',
          'salads': 'when young and tender'
        }
      },
      'Split': {
        appearance: 'yellow split beans',
        texture: 'smooth when cooked',
        applications: {
          'soups': 'quick-cooking',
          'dips': 'traditional bessara',
          'patties': 'formed and fried'
        }
      }
    },
    culinaryTraditions: {
      'egyptian': {
        name: 'ful medames',
        usage: ['breakfast', 'main dish'],
        preparation: 'slow-cooked with olive oil',
        pairings: ['cumin', 'lemon', 'parsley'],
        cultural_notes: 'Traditional breakfast dish'
      },
      'moroccan': {
        name: 'bessara',
        usage: ['soup', 'dip'],
        preparation: 'pureed with olive oil and spices',
        pairings: ['olive oil', 'paprika', 'cumin'],
        cultural_notes: 'Popular street food'
      }
    },
    preparation: {
      soaking: '8-12 hours',
      peeling: 'recommended for whole beans',
      cooking: '30-45 minutes',
      notes: 'Remove skins for smoother texture'
    },
    storage: {
      dried: {
        temperature: 'room temperature',
        duration: '1 year',
        method: 'airtight container'
      },
      cooked: {
        temperature: { fahrenheit: 40, celsius: 4 },
        duration: '3-4 days',
        method: 'refrigerated in liquid'
      }
    }
  })
};

// Add validation for elemental sums
Object.entries(plantBased).forEach(([id, ingredient]) => {
  if (!ingredient.elementalProperties) return;

  const sum = Object.values(ingredient.elementalProperties).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1) > 0.0001) {
    console.error(`Elemental sum error in ${ingredient.name || id}: ${sum}`);
    
    // Optionally auto-normalize the values
    const factor = 1 / sum;
    Object.entries(ingredient.elementalProperties).forEach(([element, value]) => {
      const elementKey = element as keyof ElementalProperties;
      ingredient.elementalProperties[elementKey] = value * factor;
    });
  }
});

export default plantBased;
