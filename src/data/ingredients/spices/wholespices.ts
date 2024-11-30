import type { IngredientMapping } from '@/types/alchemy';

export const wholeSpices: Record<string, IngredientMapping> = {
  'star_anise': {
    elementalProperties: { Fire: 0.4, Air: 0.2, Water: 0.1 },
    qualities: ['sweet', 'licorice-like', 'warming'],
    origin: ['China', 'Vietnam'],
    category: 'spice',
    subCategory: 'whole',
    varieties: {
      'Chinese': 'traditional variety',
      'Japanese': 'more delicate',
      'Vietnamese': 'more robust'
    },
    preparation: {
      toasting: {
        method: 'dry toast until fragrant',
        duration: '2-3 minutes',
        notes: 'Watch carefully to prevent burning'
      },
      grinding: 'grind as needed',
      infusing: {
        method: 'add whole to liquids',
        duration: '10-20 minutes',
        removal: 'required before serving'
      }
    },
    culinaryApplications: {
      'broths': {
        method: 'add whole to simmering liquid',
        timing: 'early in cooking',
        pairings: ['cinnamon', 'ginger', 'onions'],
        ratios: '1-2 pods per 2 cups liquid'
      },
      'braising': {
        method: 'add to braising liquid',
        timing: 'beginning of cooking',
        pairings: ['soy sauce', 'rice wine', 'ginger'],
        ratios: '2-3 pods per pound of meat'
      },
      'tea_blends': {
        method: 'combine with other spices',
        pairings: ['black tea', 'cinnamon', 'orange'],
        ratios: '1 pod per 2 cups water'
      }
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '2 years',
      container: 'airtight',
      notes: 'Maintains potency well when whole'
    }
  },

  'cardamom_pods': {
    elementalProperties: { Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['aromatic', 'complex', 'intense'],
    origin: ['India', 'Guatemala', 'Sri Lanka'],
    category: 'spice',
    subCategory: 'whole',
    varieties: {
      'Green': {
        flavor: 'sweet, intense',
        uses: 'sweet and savory dishes'
      },
      'Black': {
        flavor: 'smoky, robust',
        uses: 'primarily savory dishes'
      },
      'White': {
        flavor: 'milder, bleached green',
        uses: 'light-colored dishes'
      }
    },
    preparation: {
      toasting: {
        method: 'light dry toast',
        duration: '1-2 minutes',
        notes: 'Just until fragrant'
      },
      grinding: {
        method: 'remove seeds from pods',
        notes: 'Discard pods or use for infusing'
      },
      crushing: {
        method: 'lightly crush to release oils',
        notes: 'For infusing liquids'
      }
    },
    culinaryApplications: {
      'rice_dishes': {
        method: 'add whole pods during cooking',
        timing: 'with rice and water',
        pairings: ['basmati rice', 'saffron', 'cinnamon'],
        ratios: '4-5 pods per cup of rice'
      },
      'curries': {
        method: 'add whole pods during cooking',
        timing: 'with meat and vegetables',
        pairings: ['chicken', 'lamb', 'onions'],
        ratios: '2-3 pods per pound of meat'
      },
      'tea_blends': {
        method: 'combine with other spices',
        pairings: ['black tea', 'cinnamon', 'orange'],
        ratios: '1 pod per 2 cups water'
      }
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '2 years',
      container: 'airtight',
      notes: 'Maintains potency well when whole'
    }
  },

  'mustard_seeds': {
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['pungent', 'hot', 'nutty'],
    origin: ['India', 'Canada', 'Nepal'],
    category: 'spice',
    subCategory: 'whole',
    varieties: {
      'Yellow': {
        appearance: 'large, light colored',
        flavor: 'mild, slightly sweet',
        uses: 'pickling, European cuisine'
      },
      'Brown': {
        appearance: 'smaller, dark brown',
        flavor: 'more pungent',
        uses: 'Indian cuisine, oil blooming'
      },
      'Black': {
        appearance: 'tiny, dark black',
        flavor: 'most intense',
        uses: 'Bengali cuisine, tempering'
      }
    },
    culinaryApplications: {
      'tempering': {
        method: 'heat oil until seeds pop',
        timing: 'start of cooking',
        pairings: ['curry leaves', 'cumin seeds', 'asafoetida'],
        ratios: '1 tsp per cup of oil',
        techniques: {
          'tadka': 'bloom in hot oil and pour over dish',
          'base': 'start dish with bloomed seeds',
          'layering': 'add at multiple cooking stages'
        }
      },
      'pickling': {
        method: 'add whole to brine',
        timing: 'during preparation',
        pairings: ['dill', 'garlic', 'peppercorns'],
        ratios: '1 tbsp per quart',
        techniques: {
          'hot_brine': 'toast seeds before adding',
          'fermentation': 'add raw to ferment',
          'quick_pickle': 'crush slightly before using'
        }
      },
      'marinades': {
        method: 'crush or grind',
        timing: '4-24 hours before cooking',
        pairings: ['garlic', 'herbs', 'vinegar'],
        ratios: '1 tbsp per cup of liquid',
        techniques: {
          'paste': 'grind with liquids',
          'rustic': 'roughly crush',
          'infusion': 'heat in oil first'
        }
      },
      'sauces': {
        method: 'toast and grind or leave whole',
        pairings: ['cream', 'wine', 'vinegar'],
        ratios: '1 tsp per cup of liquid',
        techniques: {
          'cream_sauce': 'infuse in warm cream',
          'vinaigrette': 'crush and mix',
          'grainy_mustard': 'soak in vinegar'
        }
      }
    },
    storage: {
      temperature: 'cool, dark place',
      duration: 'whole: 1 year',
      container: 'airtight',
      notes: 'Seeds can be sprouted if fresh'
    }
  },

  'fennel_seeds': {
    elementalProperties: { Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['sweet', 'anise-like', 'warming'],
    origin: ['India', 'Mediterranean', 'China'],
    category: 'spice',
    subCategory: 'whole',
    varieties: {
      'Indian': {
        appearance: 'greener, thinner',
        flavor: 'more aromatic',
        uses: 'curries, digestive'
      },
      'Mediterranean': {
        appearance: 'plumper, pale green',
        flavor: 'sweeter',
        uses: 'sausages, bread'
      }
    },
    culinaryApplications: {
      'bread_baking': {
        method: 'add whole to dough',
        timing: 'during mixing',
        pairings: ['rye flour', 'caraway', 'salt'],
        ratios: '1-2 tbsp per loaf',
        techniques: {
          'topping': 'sprinkle on crust',
          'incorporated': 'mix into dough',
          'flavored_oil': 'infuse in oil first'
        }
      },
      'seafood_seasoning': {
        method: 'crush or leave whole',
        timing: 'before cooking',
        pairings: ['citrus', 'garlic', 'white wine'],
        ratios: '1 tsp per pound',
        techniques: {
          'crust': 'grind with salt',
          'court_bouillon': 'add to poaching liquid',
          'steam_aromatic': 'add to steaming water'
        }
      },
      'sausage_making': {
        method: 'lightly crush',
        pairings: ['black pepper', 'garlic', 'salt'],
        ratios: '1 tbsp per pound',
        techniques: {
          'italian_style': 'whole seeds',
          'chinese_style': 'ground with star anise',
          'merguez': 'combined with cumin'
        }
      }
    }
  },

  'coriander_seeds': {
    elementalProperties: { Air: 0.4, Earth: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ['citrusy', 'nutty', 'floral'],
    origin: ['India', 'Morocco', 'Eastern Europe'],
    category: 'spice',
    subCategory: 'whole',
    varieties: {
      'Indian': {
        appearance: 'larger, more round',
        flavor: 'more aromatic',
        uses: 'curries, spice blends'
      },
      'Mediterranean': {
        appearance: 'smaller, more oval',
        flavor: 'more citrusy',
        uses: 'marinades, pickling'
      }
    },
    culinaryApplications: {
      'curry_base': {
        method: 'toast and grind',
        timing: 'beginning of cooking',
        pairings: ['cumin', 'fennel', 'peppercorns'],
        ratios: '2:1:1 (coriander:cumin:other spices)',
        techniques: {
          'dry_toasting': 'until fragrant and color changes',
          'wet_grinding': 'with aromatics for paste',
          'whole_tempering': 'crack and bloom in oil'
        }
      },
      'pickling_spice': {
        method: 'use whole',
        timing: 'add to brine',
        pairings: ['dill', 'mustard seed', 'bay leaf'],
        ratios: '2 tbsp per quart',
        techniques: {
          'hot_brine': 'add to heating liquid',
          'fermentation': 'add at start',
          'quick_pickle': 'lightly crush first'
        }
      }
    }
  },

  'cumin_seeds': {
    elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
    qualities: ['earthy', 'warm', 'pungent'],
    origin: ['India', 'Iran', 'Turkey'],
    category: 'spice',
    subCategory: 'whole',
    varieties: {
      'Indian': {
        appearance: 'small, dark',
        flavor: 'intense, earthy',
        uses: 'curries, tempering'
      },
      'Iranian': {
        appearance: 'longer seeds',
        flavor: 'more delicate',
        uses: 'rice dishes, kebabs'
      }
    },
    culinaryApplications: {
      'tempering': {
        method: 'bloom in hot oil',
        timing: 'start of cooking',
        pairings: ['mustard seeds', 'curry leaves'],
        ratios: '1-2 tsp per dish',
        techniques: {
          'tadka': 'bloom and pour over',
          'pilaf_base': 'start rice dishes',
          'oil_infusion': 'longer steep for oil'
        }
      },
      'meat_rubs': {
        method: 'toast and grind',
        timing: 'before cooking',
        pairings: ['coriander', 'black pepper', 'chili'],
        ratios: '1 tbsp per pound',
        techniques: {
          'dry_rub': 'grind with other spices',
          'paste': 'grind with wet ingredients',
          'marinade_base': 'infuse in oil first'
        }
      }
    }
  },

  'caraway_seeds': {
    elementalProperties: { Air: 0.4, Earth: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ['warming', 'sharp', 'slightly sweet'],
    origin: ['Netherlands', 'Eastern Europe', 'Finland'],
    category: 'spice',
    subCategory: 'whole',
    varieties: {
      'Dutch': {
        appearance: 'curved, dark',
        flavor: 'traditional strength',
        uses: 'bread, cheese'
      },
      'Finnish': {
        appearance: 'slightly larger',
        flavor: 'more intense',
        uses: 'rye bread, aquavit'
      }
    },
    culinaryApplications: {
      'bread_baking': {
        method: 'whole seeds in dough',
        timing: 'during mixing',
        pairings: ['rye flour', 'fennel', 'salt'],
        ratios: '1-2 tbsp per loaf',
        techniques: {
          'traditional_rye': 'heavy seeding',
          'light_rye': 'sparse seeding',
          'crust_topping': 'press into top'
        }
      },
      'sauerkraut': {
        method: 'add whole to cabbage',
        timing: 'during fermentation setup',
        pairings: ['juniper', 'bay leaf', 'black pepper'],
        ratios: '1 tbsp per quart',
        techniques: {
          'traditional': 'whole seeds throughout',
          'spice_packet': 'contained in muslin',
          'layered': 'between cabbage layers'
        }
      }
    }
  }
};
