import type { IngredientMapping, ElementalProperties, ZodiacSign } from '@/types/alchemy';

// Helper function to standardize ingredient mappings
function createIngredientMapping(
  id: string,
  properties: Partial<IngredientMapping>
): IngredientMapping {
  return {
    name: id, // Add the required name property
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

export const vinegars: Record<string, IngredientMapping> = {
  'rice_vinegar': createIngredientMapping('rice_vinegar', {
    qualities: ['mild', 'sweet', 'clean'],
    origin: ['China', 'Japan', 'Korea'],
    category: 'vinegar',
    subCategory: 'grain',
    varieties: {
      'Chinese Black': {
        appearance: 'dark brown to black',
        flavor: 'deep, malty',
        acidity: '4.5-5.5%',
        uses: 'dipping sauces, braising'
      },
      'Japanese Clear': {
        appearance: 'clear, pale',
        flavor: 'delicate, mild',
        acidity: '4-5%',
        uses: 'sushi rice, dressings'
      },
      'Seasoned': {
        appearance: 'clear',
        flavor: 'sweet and tangy',
        acidity: '4-5%',
        uses: 'sushi, salads'
      }
    },
    culinaryApplications: {
      'sushi_rice': {
        method: 'mix into hot rice',
        timing: 'immediately after cooking',
        ratios: {
          'basic': '2-3 tbsp per 2 cups rice',
          'seasoned': '2 tbsp per 2 cups rice'
        },
        techniques: {
          'traditional': 'fan while mixing',
          'quick': 'fold in gently'
        }
      },
      'dressings': {
        method: 'whisk with oil',
        ratios: {
          'basic': '1:3 (vinegar:oil)',
          'light': '1:2 (vinegar:oil)'
        },
        pairings: ['sesame oil', 'soy sauce', 'ginger']
      },
      'pickling': {
        method: 'combine with salt and sugar',
        timing: 'quick pickles: 1-4 hours',
        ratios: {
          'basic_brine': '1:1:4 (vinegar:sugar:water)',
          'quick_pickle': '1:1 (vinegar:water)'
        }
      }
    },
    storage: {
      temperature: 'room temperature',
      duration: '2 years',
      container: 'glass bottle',
      notes: 'Keep away from light'
    }
  }),

  'balsamic_vinegar': createIngredientMapping('balsamic_vinegar', {
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Saturn'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Venus' },
          second: { element: 'Fire', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Earth: 0.1, Fire: 0.1 },
          preparationTips: ['Best for reductions']
        },
        fullMoon: {
          elementalBoost: { Fire: 0.2 },
          preparationTips: ['Ideal for finishing dishes']
        }
      }
    },
    qualities: ['sweet', 'complex', 'rich'],
    origin: ['Italy'],
    category: 'vinegar',
    subCategory: 'grape',
    varieties: {
      'Traditional DOP': {
        appearance: 'thick, dark brown',
        flavor: 'complex, sweet',
        aging: '12-25+ years',
        uses: 'finishing, special dishes'
      },
      'Condimento': {
        appearance: 'dark brown',
        flavor: 'balanced sweet-tart',
        aging: '3-12 years',
        uses: 'finishing, dressing'
      },
      'Commercial': {
        appearance: 'dark brown, thin',
        flavor: 'sweet-tart',
        aging: 'varies',
        uses: 'cooking, dressings'
      }
    },
    culinaryApplications: {
      'reduction': {
        method: 'simmer until thickened',
        timing: '15-20 minutes',
        ratios: {
          'basic': 'reduce by half',
          'glaze': 'reduce by two-thirds'
        },
        notes: 'Watch carefully to prevent burning'
      },
      'finishing': {
        method: 'drizzle over completed dish',
        pairings: [
          'strawberries',
          'parmesan',
          'grilled vegetables',
          'risotto'
        ],
        notes: 'Use best quality sparingly'
      },
      'marinades': {
        method: 'combine with oil and herbs',
        ratios: {
          'basic': '1:3 (vinegar:oil)',
          'rich': '1:2 (vinegar:oil)'
        },
        pairings: ['olive oil', 'garlic', 'rosemary']
      }
    },
    storage: {
      temperature: 'room temperature',
      duration: 'indefinite',
      container: 'glass bottle',
      notes: 'May continue to develop in bottle'
    }
  }),

  'sherry_vinegar': createIngredientMapping('sherry_vinegar', {
    elementalProperties: {
      Water: 0.5,
      Earth: 0.3,
      Fire: 0.1,
      Air: 0.1
    },
    qualities: ['nutty', 'complex', 'sharp'],
    origin: ['Spain'],
    category: 'vinegar',
    subCategory: 'wine',
    varieties: {
      'Reserva': {
        appearance: 'dark amber',
        flavor: 'complex, nutty',
        aging: '2+ years',
        uses: 'finishing, dressings'
      },
      'Gran Reserva': {
        appearance: 'deep amber',
        flavor: 'intense, complex',
        aging: '10+ years',
        uses: 'finishing'
      }
    },
    culinaryApplications: {
      'vinaigrettes': {
        method: 'whisk with oil',
        ratios: {
          'classic': '1:3 (vinegar:oil)',
          'bold': '1:2 (vinegar:oil)'
        },
        pairings: ['olive oil', 'mustard', 'shallots']
      },
      'pan_sauces': {
        method: 'deglaze pan',
        timing: 'after searing',
        ratios: '2-3 tbsp per cup of stock',
        pairings: ['stock', 'herbs', 'butter']
      }
    },
    storage: {
      temperature: 'room temperature',
      duration: 'indefinite',
      container: 'glass bottle',
      notes: 'Maintains quality well'
    }
  }),

  'apple_cider_vinegar': createIngredientMapping('apple_cider_vinegar', {
    elementalProperties: {
      Water: 0.4,
      Earth: 0.3,
      Air: 0.2,
      Fire: 0.1
    },
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
          preparationTips: ['Best for health tonics']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for pickling']
        }
      }
    },
    qualities: ['fruity', 'sharp', 'fresh'],
    origin: ['Global'],
    category: 'vinegar',
    subCategory: 'fruit',
    varieties: {
      'Raw Unfiltered': {
        appearance: 'cloudy, with mother',
        flavor: 'robust, fruity',
        uses: 'health drinks, dressings'
      },
      'Filtered': {
        appearance: 'clear, amber',
        flavor: 'clean, sharp',
        uses: 'cooking, pickling'
      }
    },
    culinaryApplications: {
      'pickling': {
        method: 'heat with spices',
        ratios: {
          'basic_brine': '1:1 (vinegar:water)',
          'sweet_pickle': '1:1:0.5 (vinegar:water:sugar)'
        },
        pairings: ['mustard seed', 'dill', 'garlic']
      },
      'beverages': {
        method: 'dilute with water',
        ratios: {
          'drinking': '1-2 tbsp per cup water',
          'switchel': '2:1:1 (water:vinegar:honey)'
        }
      },
      'marinades': {
        method: 'combine with oil and seasonings',
        ratios: {
          'basic': '1:3 (vinegar:oil)',
          'tenderizing': '1:2:1 (vinegar:oil:juice)'
        }
      }
    },
    storage: {
      temperature: 'room temperature',
      duration: '2 years, indefinite if pasteurized',
      container: 'glass bottle',
      notes: 'Raw version may develop mother'
    }
  }),

  'red_wine_vinegar': createIngredientMapping('red_wine_vinegar', {
    elementalProperties: {
      Water: 0.3,
      Fire: 0.3,
      Earth: 0.3,
      Air: 0.1
    },
    qualities: ['robust', 'fruity', 'tangy'],
    origin: ['France', 'Italy', 'Spain'],
    category: 'vinegar',
    subCategory: 'wine',
    varieties: {
      'Aged': {
        appearance: 'deep ruby',
        flavor: 'complex, mellow',
        aging: '2+ years',
        uses: 'finishing, dressings'
      },
      'Young': {
        appearance: 'bright red',
        flavor: 'sharp, fruity',
        uses: 'cooking, marinades'
      }
    },
    culinaryApplications: {
      'vinaigrettes': {
        method: 'whisk with oil',
        timing: 'just before serving',
        ratios: {
          'classic_french': '1:3 (vinegar:oil)',
          'robust': '1:2 (vinegar:oil)',
          'light': '1:4 (vinegar:oil)'
        },
        techniques: {
          'emulsified': {
            method: 'add mustard',
            ratio: '1 tsp mustard per cup dressing'
          },
          'herb_infused': {
            method: 'steep herbs in vinegar',
            timing: '24 hours before use'
          },
          'shallot_based': {
            method: 'macerate shallots in vinegar',
            timing: '15 minutes before adding oil'
          }
        },
        pairings: ['dijon mustard', 'shallots', 'herbs']
      },
      'marinades': {
        method: 'combine with oil and aromatics',
        timing: {
          'vegetables': '30 minutes to 2 hours',
          'chicken': '2-4 hours',
          'beef': '4-6 hours'
        },
        ratios: {
          'basic': '1:3:1 (vinegar:oil:aromatics)',
          'tenderizing': '2:2:1 (vinegar:oil:aromatics)',
          'vegetable': '1:2:1 (vinegar:oil:aromatics)'
        },
        techniques: {
          'mediterranean': {
            ingredients: ['olive oil', 'garlic', 'herbs'],
            ratio: '1:3:1'
          },
          'provençal': {
            ingredients: ['olive oil', 'herbes de provence', 'garlic'],
            ratio: '1:3:1'
          }
        }
      },
      'pan_sauces': {
        method: 'deglaze after searing',
        timing: 'immediately after removing protein',
        ratios: {
          'basic': '2-3 tbsp per cup of stock',
          'rich': '1/4 cup per cup of stock'
        },
        techniques: {
          'reduction': {
            method: 'reduce by half before adding stock',
            timing: '2-3 minutes'
          },
          'mounted': {
            method: 'finish with cold butter',
            ratio: '2-3 tbsp butter per cup sauce'
          }
        },
        pairings: ['shallots', 'herbs', 'stock', 'butter']
      }
    },
    storage: {
      temperature: 'room temperature',
      duration: '2 years',
      container: 'glass bottle',
      notes: 'Keep away from light'
    }
  }),

  'white_wine_vinegar': createIngredientMapping('white_wine_vinegar', {
    qualities: ['bright', 'clean', 'crisp'],
    origin: ['France', 'Germany', 'Italy'],
    category: 'vinegar',
    subCategory: 'wine',
    varieties: {
      'Champagne': {
        appearance: 'very clear',
        flavor: 'delicate, floral',
        uses: 'delicate dressings, seafood'
      },
      'Standard': {
        appearance: 'clear',
        flavor: 'crisp, clean',
        uses: 'all-purpose'
      }
    },
    culinaryApplications: {
      'light_sauces': {
        method: 'incorporate into sauce',
        timing: 'during or after cooking',
        ratios: {
          'beurre_blanc': '1/2 cup vinegar per cup wine',
          'herb_sauce': '2 tbsp per cup of base'
        },
        techniques: {
          'reduction': {
            method: 'reduce with shallots',
            timing: 'until nearly dry'
          },
          'cold_emulsion': {
            method: 'whisk into mayonnaise',
            ratio: '1-2 tsp per cup'
          }
        },
        pairings: ['butter', 'cream', 'herbs', 'shallots']
      },
      'quick_pickles': {
        method: 'heat brine and pour over vegetables',
        timing: '30 minutes to 24 hours',
        ratios: {
          'basic': '1:1 (vinegar:water)',
          'sweet': '1:1:0.5 (vinegar:water:sugar)',
          'herb_infused': '1:1 plus 2 tbsp herbs per cup'
        },
        techniques: {
          'hot_pack': {
            method: 'pour boiling brine over vegetables',
            timing: 'cool to room temperature'
          },
          'cold_infusion': {
            method: 'combine room temperature',
            timing: 'refrigerate 24 hours'
          }
        }
      }
    }
  }),

  'champagne_vinegar': createIngredientMapping('champagne_vinegar', {
    qualities: ['delicate', 'floral', 'elegant'],
    origin: ['France'],
    category: 'vinegar',
    subCategory: 'wine',
    varieties: {
      'Traditional': {
        appearance: 'crystal clear',
        flavor: 'subtle, complex',
        uses: 'fine vinaigrettes, delicate dishes'
      }
    },
    culinaryApplications: {
      'delicate_vinaigrettes': {
        method: 'whisk or blend',
        timing: 'just before serving',
        ratios: {
          'classic': '1:4 (vinegar:oil)',
          'light': '1:5 (vinegar:oil)',
          'fruit_based': '1:3:1 (vinegar:oil:fruit juice)'
        },
        techniques: {
          'citrus_enhanced': {
            method: 'add citrus zest',
            ratio: '1/4 tsp zest per cup'
          },
          'herb_infused': {
            method: 'steep delicate herbs',
            timing: '1 hour before use'
          }
        },
        pairings: ['walnut oil', 'citrus', 'tarragon', 'chervil']
      },
      'seafood_preparations': {
        method: 'finishing or marinade',
        timing: 'just before serving or 30 minutes marinade',
        ratios: {
          'finishing_splash': '1-2 tsp per serving',
          'light_marinade': '1:4 (vinegar:oil)'
        },
        techniques: {
          'mignonette': {
            ingredients: ['shallots', 'pepper'],
            ratio: '1/4 cup vinegar to 1 tbsp shallots'
          }
        }
      }
    }
  }),

  'malt_vinegar': createIngredientMapping('malt_vinegar', {
    elementalProperties: {
      Earth: 0.5,
      Fire: 0.3,
      Water: 0.2,
      Air: 0.0
    },
    qualities: ['robust', 'grainy', 'complex'],
    origin: ['United Kingdom'],
    category: 'vinegar',
    subCategory: 'grain',
    varieties: {
      'Traditional': {
        appearance: 'dark brown',
        flavor: 'strong, malty',
        uses: 'fish & chips, pickling'
      },
      'Distilled': {
        appearance: 'lighter brown',
        flavor: 'milder',
        uses: 'general purpose'
      }
    },
    culinaryApplications: {
      'fish_and_chips': {
        method: 'sprinkle on hot food',
        timing: 'just before eating',
        ratios: 'to taste',
        techniques: {
          'traditional': {
            method: 'generous sprinkle',
            notes: 'serve with salt'
          },
          'malt_aioli': {
            ratio: '1 tbsp vinegar per cup mayonnaise',
            pairings: ['garlic', 'mustard']
          }
        }
      },
      'pickling': {
        method: 'hot or cold brine',
        timing: '24 hours to 2 weeks',
        ratios: {
          'basic_brine': '1:1 (vinegar:water)',
          'pub_style': '2:1 (vinegar:water)',
          'onions': 'straight vinegar'
        },
        techniques: {
          'pub_onions': {
            method: 'cold pickle',
            timing: '2 weeks minimum'
          },
          'quick_pickle': {
            method: 'hot brine',
            timing: '24 hours'
          }
        },
        pairings: ['bay leaves', 'peppercorns', 'mustard seeds']
      }
    },
    storage: {
      temperature: 'room temperature',
      duration: '2 years',
      container: 'glass bottle',
      notes: 'May develop sediment'
    }
  })
};
