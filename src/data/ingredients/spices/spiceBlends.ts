import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

// Pattern, AA: Ingredient Interface Restructuring
// Proper type annotation for raw ingredients to ensure IngredientMapping compatibility
const rawSpiceBlends: Record<string, Partial<IngredientMapping>> = {
  garam_masala: {
    name: 'Garam Masala',
    elementalProperties: { Fire: 0.5, Air: 0.2, Earth: 0.2, Water: 0.1 },

    astrologicalProfile: {
      rulingPlanets: ['Sun', 'Jupiter'],
      favorableZodiac: ['leo', 'sagittarius'],
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
    origin: ['Indian Subcontinent'],
    category: 'spice',
    subCategory: 'blend',

    baseIngredients: {
      cumin: 2,
      coriander: 2,
      cardamom: 1,
      cinnamon: 1,
      cloves: 0.5,
      'black pepper': 1,
      nutmeg: 0.5
    },

    ratios: '2:2:1:1:0.5:1:0.5',

    regionalVariations: {
      'North Indian': {
        name: 'North Indian',
        cumin: 2,
        coriander: 2,
        'black cardamom': 1,
        cinnamon: 1,
        cloves: 0.5,
        'black pepper': 1,
        nutmeg: 0.5
      },
      'South Indian': {
        name: 'South Indian',
        cumin: 2,
        coriander: 2,
        cardamom: 1,
        'curry leaves': 1,
        'star anise': 0.5,
        'black pepper': 1,
        nutmeg: 0.5
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
    },

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic garam_masala profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    season: ['Year-round'],

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious'],
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},
  },

  ras_el_hanout: {
    name: 'Ras El Hanout',
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },

    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Mars'],
      favorableZodiac: ['taurus', 'scorpio'],
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
    origin: ['North Africa'],
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
      Moroccan: ['saffron', 'rose buds', 'grains of paradise'],
      Tunisian: ['dried mint', 'dried rose petals'],
      Algerian: ['cinnamon heavy', 'dried rosebuds']
    },

    affinities: ['lamb', 'chicken', 'couscous', 'vegetables', 'tagines'],
    cookingMethods: ['marinades', 'rubs', 'stews'],

    proportions: {
      cumin: 2,
      coriander: 2,
      cinnamon: 1,
      ginger: 1,
      'black pepper': 1,
      turmeric: 1,
      paprika: 1,
      allspice: 0.5,
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
    },

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic ras_el_hanout profile'
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    season: ['Year-round'],

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious'],
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},
  },

  herbes_de_provence: {
    name: 'Herbes De Provence',
    elementalProperties: { Air: 0.4, Earth: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ['aromatic', 'Mediterranean', 'savory'],
    origin: ['Southern France'],
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
      Traditional: ['no lavender'],
      Modern: ['includes lavender'],
      Commercial: ['may include fennel']
    },

    affinities: ['chicken', 'fish', 'vegetables', 'tomatoes', 'grilled meats'],
    cookingMethods: ['roasting', 'grilling', 'sauce making'],

    proportions: {
      thyme: 2,
      basil: 1,
      rosemary: 1,
      tarragon: 1,
      savory: 1,
      marjoram: 1,
      oregano: 1,
      lavender: 0.5
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
    },

    // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    season: ['Year-round'],

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious'],
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},,

    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Jupiter'],
      favorableZodiac: ['Gemini', 'Sagittarius', 'Virgo'],
      seasonalAffinity: ['all']
    }
  },

  chinese_five_spice: {
    name: 'Chinese Five Spice',
    elementalProperties: { Fire: 0.58, Water: 0.14, Earth: 0.14, Air: 0.14 },
    astrologicalProfile: {
      rulingPlanets: ['Jupiter', 'Mars'],
      favorableZodiac: ['Sagittarius', 'Aries', 'Leo'],
      seasonalAffinity: ['all']
    },
    qualities: ['warming', 'balanced', 'complex'],
    origin: ['China'],
    category: 'spice',
    subCategory: 'blend',

    baseIngredients: {
      'star anise': 2,
      'chinese cinnamon': 2,
      'fennel seeds': 2,
      cloves: 1,
      'sichuan pepper': 1
    },

    ratios: '2:2:2:1:1',

    regionalVariations: {
      Northern: {
        name: 'Northern',
        'star anise': 2,
        'chinese cinnamon': 3,
        'fennel seeds': 2,
        cloves: 1,
        'sichuan pepper': 1
      },
      Southern: {
        name: 'Southern',
        'star anise': 2,
        'chinese cinnamon': 2,
        'fennel seeds': 2,
        cloves: 1,
        'sichuan pepper': 1,
        'licorice root': 0.5
      }
    },

    affinities: ['pork', 'duck', 'chicken', 'seafood', 'vegetables'],

    // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for chinese_five_spice'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious'],
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},,

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    }
  },

  za_atar: {
    name: 'Za Atar',
    elementalProperties: { Earth: 0.4, Air: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ['earthy', 'tangy', 'aromatic'],
    origin: ['Levant'],
    category: 'spice',
    subCategory: 'blend',

    baseIngredients: {
      'dried thyme': 2,
      'sesame seeds': 2,
      sumac: 1,
      oregano: 1,
      marjoram: 1,
      salt: 0.5
    },

    ratios: '2:2:1:1:1:0.5',

    regionalVariations: {
      Lebanese: {
        name: 'Lebanese',
        'dried thyme': 2,
        'sesame seeds': 2,
        sumac: 2, // more sumac,
        oregano: 1,
        marjoram: 1,
        salt: 0.5
      },
      Palestinian: {
        name: 'Palestinian',
        'dried thyme': 2,
        'sesame seeds': 3, // more sesame,
        sumac: 1,
        oregano: 1,
        marjoram: 1,
        salt: 0.5
      }
    },

    // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for za_atar'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious'],
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},,

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    }
  },

  curry_powder: {
    name: 'Curry Powder',
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['warming', 'complex', 'pungent'],
    origin: ['British-Indian'],
    category: 'spice',
    subCategory: 'blend',

    baseIngredients: {
      turmeric: 3,
      coriander: 2,
      cumin: 2,
      ginger: 1,
      'black pepper': 1,
      cinnamon: 0.5,
      cardamom: 0.5,
      cayenne: 0.5,
      fenugreek: 0.5
    },

    ratios: '3:2:2:1:1:0.5:0.5:0.5:0.5',

    regionalVariations: {
      Madras: {
        name: 'Madras',
        turmeric: 3,
        coriander: 2,
        cumin: 2,
        ginger: 1,
        'black pepper': 1,
        cinnamon: 0.5,
        cardamom: 0.5,
        cayenne: 2, // extra hot,
        fenugreek: 0.5
      }
    },

    // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for curry_powder'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious'],
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},,

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    }
  },

  berbere: {
    name: 'Berbere',
    elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.1, Water: 0.1 },
    qualities: ['hot', 'complex', 'earthy'],
    origin: ['Ethiopia'],
    category: 'spice',
    subCategory: 'blend',

    baseIngredients: {
      'dried chili peppers': 4,
      garlic: 2,
      ginger: 2,
      basil: 1,
      korarima: 1,
      'white pepper': 1,
      'black pepper': 1,
      fenugreek: 1,
      cloves: 0.5,
      cinnamon: 0.5,
      nutmeg: 0.5
    },

    ratios: '4:2:2:1:1:1:1:1:0.5:0.5:0.5',

    regionalVariations: {
      Traditional: {
        name: 'Traditional',
        // includes additional fermentation process,
        rue: 0.5, // additional ingredient
      }
    },

    // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for berbere'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious'],
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},,

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    }
  },

  dukkah: {
    name: 'Dukkah',
    elementalProperties: { Earth: 0.4, Air: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ['nutty', 'aromatic', 'crunchy'],
    origin: ['Egypt'],
    category: 'spice',
    subCategory: 'blend',

    baseIngredients: {
      hazelnuts: 3,
      'sesame seeds': 2,
      coriander: 1,
      cumin: 1,
      'black pepper': 0.5,
      salt: 0.5
    },

    ratios: '3:2:1:1:0.5:0.5',

    regionalVariations: {
      Alexandria: {
        name: 'Alexandria',
        hazelnuts: 2,
        'pine nuts': 1,
        'sesame seeds': 3, // more sesame,
        coriander: 1,
        cumin: 1,
        'black pepper': 0.5,
        salt: 0.5
      }
    },

    // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for dukkah'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious'],
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},,

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    }
  },

  shichimi_togarashi: {
    name: 'Shichimi Togarashi',
    elementalProperties: { Fire: 0.61, Water: 0.13, Earth: 0.13, Air: 0.13 },
    qualities: ['spicy', 'citrusy', 'nutty'],
    origin: ['Japan'],
    category: 'spice',
    subCategory: 'blend',

    baseIngredients: {
      'dried red chili pepper': 3,
      'sansho pepper': 1,
      'orange peel': 1,
      'black sesame': 1,
      'white sesame': 1,
      'hemp seeds': 0.5,
      nori: 0.5,
      ginger: 0.5
    },

    ratios: '3:1:1:1:1:0.5:0.5:0.5',

    regionalVariations: {
      Tokyo: {
        name: 'Tokyo',
        'orange peel': 2, // more citrus
      },
      Kyoto: {
        name: 'Kyoto',
        'black sesame': 2,
        'white sesame': 2, // more sesame
      }
    },

    // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for shichimi_togarashi'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious'],
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},,

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    }
  },

  baharat: {
    name: 'Baharat',
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['warming', 'aromatic', 'complex'],
    origin: ['Middle East'],
    category: 'spice',
    subCategory: 'blend',

    baseIngredients: {
      'black pepper': 2,
      cumin: 2,
      coriander: 1,
      cinnamon: 1,
      cardamom: 1,
      paprika: 1,
      cloves: 0.5,
      nutmeg: 0.5
    },

    ratios: '2:2:1:1:1:1:0.5:0.5',

    regionalVariations: {
      Turkish: {
        name: 'Turkish',
        mint: 0.5, // additional
      },
      Gulf: {
        name: 'Gulf',
        'lime powder': 1, // additional
      }
    },

    // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for baharat'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious'],
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},,

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    }
  },

  jerk_seasoning: {
    name: 'Jerk Seasoning',
    elementalProperties: { Fire: 0.5, Earth: 0.2, Air: 0.2, Water: 0.1 },
    qualities: ['hot', 'pungent', 'aromatic'],
    origin: ['Jamaica'],
    category: 'spice',
    subCategory: 'blend',

    baseIngredients: {
      allspice: 3,
      'scotch bonnet': 2,
      thyme: 2,
      garlic: 2,
      ginger: 1,
      'black pepper': 1,
      'brown sugar': 1,
      cinnamon: 0.5,
      nutmeg: 0.5
    },

    ratios: '3:2:2:2:1:1:1:0.5:0.5',

    regionalVariations: {
      Traditional: {
        name: 'Traditional',
        // Wet paste version
        'green onions': 2,
        'soy sauce': 1
      },
      Western: {
        name: 'Western',
        'scotch bonnet': 1, // reduced heat
      }
    },

    // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      },

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    },

    season: ['Year-round'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for jerk_seasoning'
    },

    nutritionalProfile: {
      macronutrients: {},
      micronutrients: {},
      healthBenefits: ['Nutritious'],
    },

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    },

    varieties: {},,

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    }
  }
};

// Fix the ingredient mappings to ensure they have all required properties
export const _spiceBlends: Record<string, IngredientMapping> =
  fixIngredientMappings(rawSpiceBlends);
