import type { IngredientMapping } from '@/types/ingredients';
import { CUISINE_TYPES } from '@/constants/cuisineTypes';

export const spiceBlends: Record<string, IngredientMapping> = {
  'garam_masala': {
    elementalProperties: { Fire: 0.5, Air: 0.2, Earth: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Sun', 'Jupiter'],
      favorableZodiac: ['Leo', 'Sagittarius'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Sun' },
          second: { element: 'Air', planet: 'Jupiter' },
          third: { element: 'Earth', planet: 'Saturn' }
        }
      }
    },
    qualities: ['warming', 'aromatic', 'complex'],
    origin: 'Indian Subcontinent',
    category: 'spice',
    subCategory: 'blend',
    baseIngredients: {
      'cumin': 2,
      'coriander': 2,
      'cardamom': 1,
      'cinnamon': 1,
      'cloves': 0.5,
      'black pepper': 1,
      'nutmeg': 0.5
    },
    ratios: '2:2:1:1:0.5:1:0.5',
    regionalVariations: {
      'North Indian': {
        'cumin': 2,
        'coriander': 2,
        'black cardamom': 1,
        'cinnamon': 1,
        'cloves': 0.5,
        'black pepper': 1,
        'nutmeg': 0.5
      },
      'South Indian': {
        'cumin': 2,
        'coriander': 2,
        'cardamom': 1,
        'curry leaves': 1,
        'star anise': 0.5,
        'black pepper': 1,
        'nutmeg': 0.5
      }
    },
    affinities: ['lentils', 'rice', 'meat', 'vegetables', 'yogurt'],
    cookingMethods: ['bloomed in oil', 'added to sauces', 'marinades'],
    preparation: {
      toasting: 'individually before grinding',
      grinding: 'just before use',
      storage: 'airtight, dark container',
      notes: 'Blend can be adjusted for heat preference'
    },
    medicinalProperties: {
      actions: ['digestive aid', 'anti-inflammatory', 'warming'],
      energetics: 'heating',
      tastes: ['pungent', 'sweet', 'bitter']
    }
  },

  'ras_el_hanout': {
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Mars'],
      favorableZodiac: ['Taurus', 'Scorpio'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Venus' },
          second: { element: 'Earth', planet: 'Mars' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      }
    },
    qualities: ['warming', 'complex', 'aromatic'],
    origin: 'North Africa',
    category: 'spice',
    subCategory: 'blend',
    baseIngredients: [
      'cumin',
      'coriander',
      'cinnamon',
      'ginger',
      'black pepper',
      'turmeric',
      'paprika',
      'allspice',
      'rose petals'
    ],
    regionalVariations: {
      'Moroccan': ['saffron', 'rose buds', 'grains of paradise'],
      'Tunisian': ['dried mint', 'dried rose petals'],
      'Algerian': ['cinnamon heavy', 'dried rosebuds']
    },
    affinities: ['lamb', 'chicken', 'couscous', 'vegetables', 'tagines'],
    cookingMethods: ['marinades', 'rubs', 'stews'],
    proportions: {
      'cumin': 2,
      'coriander': 2,
      'cinnamon': 1,
      'ginger': 1,
      'black pepper': 1,
      'turmeric': 1,
      'paprika': 1,
      'allspice': 0.5,
      'rose petals': 0.5
    },
    preparation: {
      toasting: 'light toasting of whole spices',
      grinding: 'grind together just before use',
      storage: 'airtight container away from light',
      notes: 'Can contain up to 30 ingredients'
    },
    medicinalProperties: {
      actions: ['digestive aid', 'anti-inflammatory'],
      energetics: 'warming',
      tastes: ['complex', 'floral', 'pungent']
    }
  },

  'herbes_de_provence': {
    elementalProperties: { Air: 0.4, Earth: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ['aromatic', 'Mediterranean', 'savory'],
    origin: 'Southern France',
    category: 'spice',
    subCategory: 'blend',
    baseIngredients: [
      'thyme',
      'basil',
      'rosemary',
      'tarragon',
      'savory',
      'marjoram',
      'oregano',
      'lavender'
    ],
    regionalVariations: {
      'Traditional': ['no lavender'],
      'Modern': ['includes lavender'],
      'Commercial': ['may include fennel']
    },
    affinities: ['chicken', 'fish', 'vegetables', 'tomatoes', 'grilled meats'],
    cookingMethods: ['roasting', 'grilling', 'sauce making'],
    proportions: {
      'thyme': 2,
      'basil': 1,
      'rosemary': 1,
      'tarragon': 1,
      'savory': 1,
      'marjoram': 1,
      'oregano': 1,
      'lavender': 0.5
    },
    preparation: {
      mixing: 'individually before grinding',
      grinding: 'just before use',
      storage: 'airtight, dark container',
      notes: 'Blend can be adjusted for heat preference'
    },
    medicinalProperties: {
      actions: ['digestive aid', 'anti-inflammatory', 'warming'],
      energetics: 'heating',
      tastes: ['pungent', 'sweet', 'bitter']
    }
  },

  'chinese_five_spice': {
    elementalProperties: { Fire: 0.4, Water: 0.1, Earth: 0.1 },
    qualities: ['warming', 'balanced', 'complex'],
    origin: 'China',
    category: 'spice',
    subCategory: 'blend',
    baseIngredients: {
      'star anise': 2,
      'chinese cinnamon': 2,
      'fennel seeds': 2,
      'cloves': 1,
      'sichuan pepper': 1
    },
    ratios: '2:2:2:1:1',
    regionalVariations: {
      'Northern': {
        'star anise': 2,
        'chinese cinnamon': 3,
        'fennel seeds': 2,
        'cloves': 1,
        'sichuan pepper': 1
      },
      'Southern': {
        'star anise': 2,
        'chinese cinnamon': 2,
        'fennel seeds': 2,
        'cloves': 1,
        'sichuan pepper': 1,
        'licorice root': 0.5
      }
    },
    affinities: ['pork', 'duck', 'chicken', 'seafood', 'vegetables']
  },

  'za_atar': {
    elementalProperties: { Earth: 0.4, Air: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ['earthy', 'tangy', 'aromatic'],
    origin: 'Levant',
    category: 'spice',
    subCategory: 'blend',
    baseIngredients: {
      'dried thyme': 2,
      'sesame seeds': 2,
      'sumac': 1,
      'oregano': 1,
      'marjoram': 1,
      'salt': 0.5
    },
    ratios: '2:2:1:1:1:0.5',
    regionalVariations: {
      'Lebanese': {
        'dried thyme': 2,
        'sesame seeds': 2,
        'sumac': 2,  // more sumac
        'oregano': 1,
        'marjoram': 1,
        'salt': 0.5
      },
      'Palestinian': {
        'dried thyme': 2,
        'sesame seeds': 3,  // more sesame
        'sumac': 1,
        'oregano': 1,
        'marjoram': 1,
        'salt': 0.5
      }
    }
  },

  'curry_powder': {
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['warming', 'complex', 'pungent'],
    origin: 'British-Indian',
    category: 'spice',
    subCategory: 'blend',
    baseIngredients: {
      'turmeric': 3,
      'coriander': 2,
      'cumin': 2,
      'ginger': 1,
      'black pepper': 1,
      'cinnamon': 0.5,
      'cardamom': 0.5,
      'cayenne': 0.5,
      'fenugreek': 0.5
    },
    ratios: '3:2:2:1:1:0.5:0.5:0.5:0.5',
    regionalVariations: {
      'Madras': {
        'turmeric': 3,
        'coriander': 2,
        'cumin': 2,
        'ginger': 1,
        'black pepper': 1,
        'cinnamon': 0.5,
        'cardamom': 0.5,
        'cayenne': 2,  // extra hot
        'fenugreek': 0.5
      }
    }
  },

  'berbere': {
    elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.1, Water: 0.1 },
    qualities: ['hot', 'complex', 'earthy'],
    origin: 'Ethiopia',
    category: 'spice',
    subCategory: 'blend',
    baseIngredients: {
      'chili peppers': 4,
      'garlic': 2,
      'ginger': 2,
      'basil': 1,
      'korarima': 1,
      'white pepper': 1,
      'black pepper': 1,
      'fenugreek': 1,
      'cloves': 0.5,
      'cinnamon': 0.5,
      'nutmeg': 0.5
    },
    ratios: '4:2:2:1:1:1:1:1:0.5:0.5:0.5',
    regionalVariations: {
      'Traditional': {
        // includes additional fermentation process
        'rue': 0.5  // additional ingredient
      }
    }
  },

  'dukkah': {
    elementalProperties: { Earth: 0.4, Air: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ['nutty', 'aromatic', 'crunchy'],
    origin: 'Egypt',
    category: 'spice',
    subCategory: 'blend',
    baseIngredients: {
      'hazelnuts': 3,
      'sesame seeds': 2,
      'coriander': 1,
      'cumin': 1,
      'black pepper': 0.5,
      'salt': 0.5
    },
    ratios: '3:2:1:1:0.5:0.5',
    regionalVariations: {
      'Alexandria': {
        'hazelnuts': 2,
        'pine nuts': 1,
        'sesame seeds': 3,  // more sesame
        'coriander': 1,
        'cumin': 1,
        'black pepper': 0.5,
        'salt': 0.5
      }
    }
  },

  'shichimi_togarashi': {
    elementalProperties: { Fire: 0.5, Water: 0.1 },
    qualities: ['spicy', 'citrusy', 'nutty'],
    origin: 'Japan',
    category: 'spice',
    subCategory: 'blend',
    baseIngredients: {
      'red chili pepper': 3,
      'sansho pepper': 1,
      'orange peel': 1,
      'black sesame': 1,
      'white sesame': 1,
      'hemp seeds': 0.5,
      'nori': 0.5,
      'ginger': 0.5
    },
    ratios: '3:1:1:1:1:0.5:0.5:0.5',
    regionalVariations: {
      'Tokyo': {
        'orange peel': 2  // more citrus
      },
      'Kyoto': {
        'black sesame': 2,
        'white sesame': 2  // more sesame
      }
    }
  },

  'baharat': {
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['warming', 'aromatic', 'complex'],
    origin: 'Middle East',
    category: 'spice',
    subCategory: 'blend',
    baseIngredients: {
      'black pepper': 2,
      'cumin': 2,
      'coriander': 1,
      'cinnamon': 1,
      'cardamom': 1,
      'paprika': 1,
      'cloves': 0.5,
      'nutmeg': 0.5
    },
    ratios: '2:2:1:1:1:1:0.5:0.5',
    regionalVariations: {
      'Turkish': {
        'mint': 0.5  // additional
      },
      'Gulf': {
        'lime powder': 1  // additional
      }
    }
  },

  'jerk_seasoning': {
    elementalProperties: { Fire: 0.5, Earth: 0.2, Air: 0.2, Water: 0.1 },
    qualities: ['hot', 'pungent', 'aromatic'],
    origin: 'Jamaica',
    category: 'spice',
    subCategory: 'blend',
    baseIngredients: {
      'allspice': 3,
      'scotch bonnet': 2,
      'thyme': 2,
      'garlic': 2,
      'ginger': 1,
      'black pepper': 1,
      'brown sugar': 1,
      'cinnamon': 0.5,
      'nutmeg': 0.5
    },
    ratios: '3:2:2:2:1:1:1:0.5:0.5',
    regionalVariations: {
      'Traditional': {
        // Wet paste version
        'green onions': 2,
        'soy sauce': 1
      },
      'Western': {
        'scotch bonnet': 1  // reduced heat
      }
    }
  }
};
