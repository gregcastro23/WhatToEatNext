import type { IngredientMapping } from '@/types/alchemy';

export const plantBased: Record<string, IngredientMapping> = {
  'tempeh': {
    elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
    qualities: ['fermented', 'nutty', 'firm'],
    origin: ['Indonesia', 'Java'],
    category: 'protein',
    subCategory: 'plant_based',
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
    culinaryApplications: {
      'steam_then_cook': {
        method: 'pre-steam before final cooking',
        timing: {
          'steam': '10-12 minutes',
          'marinate': '2-24 hours',
          'final_cook': 'varies by method'
        },
        techniques: {
          'basic_steam': {
            method: 'steam whole block',
            purpose: 'reduce bitterness, prepare for marinade',
            notes: 'can skip for certain preparations'
          },
          'marination': {
            bases: {
              'soy_based': ['soy sauce', 'rice vinegar', 'ginger'],
              'spice_based': ['curry paste', 'coconut milk'],
              'barbecue': ['smoke essence', 'maple', 'spices']
            },
            timing: 'longer is better for flavor penetration'
          }
        }
      },
      'direct_methods': {
        'grill': {
          preparation: 'slice 3/4 inch thick',
          marinade: 'minimum 2 hours',
          timing: '4-5 minutes per side',
          technique: 'oil grates well'
        },
        'pan_fry': {
          preparation: 'slice 1/2 inch thick',
          method: 'medium-high heat',
          timing: '3-4 minutes per side',
          finish: 'add sauce last minute'
        },
        'bake': {
          preparation: 'marinate first',
          temperature: { fahrenheit: 375, celsius: 190 },
          timing: '20-25 minutes',
          technique: 'flip halfway'
        }
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
  },

  'seitan': {
    elementalProperties: { Earth: 0.5, Water: 0.2, Fire: 0.2 },
    qualities: ['chewy', 'dense', 'savory'],
    origin: ['China', 'Buddhist Cuisine'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      'Traditional': {
        appearance: 'brown, meat-like',
        texture: 'dense, chewy',
        preparation: 'from vital wheat gluten'
      },
      'Whole_Wheat': {
        appearance: 'darker, more rustic',
        texture: 'varying density',
        preparation: 'washed flour method'
      }
    },
    culinaryApplications: {
      'basic_preparation': {
        'vital_wheat_method': {
          ingredients: {
            base: 'vital wheat gluten',
            liquid: ['vegetable broth', 'soy sauce'],
            seasonings: ['nutritional yeast', 'spices']
          },
          method: {
            mixing: 'knead until elastic',
            resting: '10-15 minutes',
            cooking: 'simmer in broth'
          },
          broth: {
            base: 'vegetable stock',
            aromatics: ['kombu', 'ginger', 'garlic'],
            timing: '45-60 minutes'
          }
        },
        'wash_method': {
          steps: [
            'make dough with flour and water',
            'rest 1 hour',
            'wash until starch removed',
            'season and cook'
          ],
          timing: 'process takes several hours',
          notes: 'traditional but time-consuming'
        }
      },
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

  'tofu_varieties': {
    elementalProperties: { Water: 0.5, Earth: 0.3, Air: 0.1 },
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
  },

  'legumes_protein': {
    elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
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
  }
};

export default plantBased;
