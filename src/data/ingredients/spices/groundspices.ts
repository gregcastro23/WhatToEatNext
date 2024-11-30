import type { IngredientMapping } from '@/types/alchemy';

export const groundSpices: Record<string, IngredientMapping> = {
  'ground_cinnamon': {
    elementalProperties: { Fire: 0.4, Wood: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['warming', 'sweet', 'pungent'],
    origin: ['Sri Lanka', 'Indonesia', 'China'],
    category: 'spice',
    subCategory: 'ground',
    varieties: {
      'Ceylon': 'true cinnamon, more delicate',
      'Cassia': 'stronger, more common',
      'Saigon': 'most intense flavor'
    },
    conversionRatio: {
      'stick_to_ground': '1 stick = 1/2 tsp ground',
      'fresh_to_dried': 'not applicable'
    },
    affinities: ['baked goods', 'coffee', 'curry', 'fruit', 'chocolate'],
    cookingMethods: ['baking', 'brewing', 'spice blends'],
    storage: {
      temperature: 'cool, dark place',
      duration: '6 months',
      container: 'airtight, dark',
      notes: 'Loses potency quickly when ground'
    },
    medicinalProperties: {
      actions: ['blood sugar regulation', 'anti-inflammatory'],
      energetics: 'warming',
      cautions: ['blood thinning in large amounts']
    }
  },

  'ground_cumin': {
    elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
    qualities: ['earthy', 'warming', 'pungent'],
    origin: ['India', 'Iran', 'Mediterranean'],
    category: 'spice',
    subCategory: 'ground',
    varieties: {
      'Indian': 'more intense',
      'Iranian': 'more delicate',
      'Mediterranean': 'balanced flavor'
    },
    conversionRatio: {
      'whole_to_ground': '1 tbsp whole = 2.5 tsp ground',
      'fresh_to_dried': 'not applicable'
    },
    affinities: ['beans', 'rice', 'meat', 'curry', 'vegetables'],
    cookingMethods: ['bloomed in oil', 'dry roasted', 'spice blends'],
    storage: {
      temperature: 'cool, dark place',
      duration: '4-6 months',
      container: 'airtight, dark',
      notes: 'Best toasted before grinding'
    },
    medicinalProperties: {
      actions: ['digestive aid', 'iron-rich'],
      energetics: 'warming',
      cautions: ['none in culinary amounts']
    }
  },

  'ground_turmeric': {
    elementalProperties: { Fire: 0.3, Earth: 0.3, Air: 0.2, Water: 0.2 },
    qualities: ['bitter', 'earthy', 'pungent'],
    origin: ['India', 'Southeast Asia'],
    category: 'spice',
    subCategory: 'ground',
    varieties: {
      'Alleppey': 'high curcumin content',
      'Madras': 'bright yellow',
      'Wild': 'more bitter'
    },
    conversionRatio: {
      'fresh_to_dried': '1 inch fresh = 1 tsp ground',
      'powder_to_fresh': '1 tsp powder = 1 tbsp fresh grated'
    },
    affinities: ['rice', 'curry', 'eggs', 'vegetables', 'golden milk'],
    cookingMethods: ['bloomed in oil', 'added to liquids', 'spice blends'],
    storage: {
      temperature: 'cool, dark place',
      duration: '9-12 months',
      container: 'airtight, dark',
      notes: 'Will stain; potent natural dye'
    },
    medicinalProperties: {
      actions: ['anti-inflammatory', 'antioxidant'],
      energetics: 'warming',
      cautions: ['may interact with blood thinners']
    }
  },

  'ground_cardamom': {
    elementalProperties: { Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['aromatic', 'sweet', 'pungent'],
    origin: ['India', 'Guatemala', 'Sri Lanka'],
    category: 'spice',
    subCategory: 'ground',
    varieties: {
      'Green': 'sweet, traditional',
      'Black': 'smoky, stronger',
      'White': 'bleached green, milder'
    },
    conversionRatio: {
      'pods_to_ground': '1 pod = 1/4 tsp ground',
      'fresh_to_dried': 'not applicable'
    },
    affinities: ['baked goods', 'coffee', 'curry', 'fruit', 'chocolate'],
    cookingMethods: ['baking', 'brewing', 'spice blends'],
    storage: {
      temperature: 'cool, dark place',
      duration: '6 months',
      container: 'airtight, dark',
      notes: 'Loses potency quickly when ground'
    },
    medicinalProperties: {
      actions: ['blood sugar regulation', 'anti-inflammatory'],
      energetics: 'warming',
      cautions: ['blood thinning in large amounts']
    }
  },

  'ground_cloves': {
    elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.1, Water: 0.1 },
    qualities: ['intense', 'sweet', 'hot'],
    origin: ['Indonesia', 'Madagascar', 'Tanzania'],
    category: 'spice',
    subCategory: 'ground',
    varieties: {
      'Indonesian': 'highest oil content',
      'Madagascar': 'more subtle',
      'Zanzibar': 'traditional grade'
    },
    conversionRatio: {
      'whole_to_ground': '1 tsp whole = 3/4 tsp ground',
      'strength_ratio': 'use 1/4 amount of other sweet spices'
    },
    affinities: ['ham', 'baked goods', 'curry', 'mulled beverages', 'pickles'],
    culinaryApplications: {
      'baking': {
        method: 'mix with dry ingredients',
        timing: 'before wet ingredients',
        pairings: ['cinnamon', 'ginger', 'nutmeg'],
        ratios: {
          'gingerbread': '1:4:4 (cloves:cinnamon:ginger)',
          'spice cake': '1:8:4 (cloves:cinnamon:nutmeg)'
        },
        notes: 'Use sparingly - very potent'
      },
      'ham_glazes': {
        method: 'mix into glaze',
        timing: 'during last hour of cooking',
        pairings: ['brown sugar', 'mustard', 'pineapple'],
        ratios: {
          'basic_glaze': '1:8:4 (cloves:brown sugar:mustard)',
          'fruit_glaze': '1:8:8 (cloves:brown sugar:juice)'
        },
        notes: 'Traditional with studded whole cloves'
      },
      'mulled_beverages': {
        method: 'simmer in liquid',
        timing: '15-30 minutes',
        pairings: ['cinnamon', 'orange', 'wine/cider'],
        ratios: {
          'mulled_wine': '1:4:4 (cloves:cinnamon:orange peel)',
          'cider': '1:4:2 (cloves:cinnamon:allspice)'
        },
        notes: 'Remove after steeping to prevent bitterness'
      }
    },
    storage: {
      temperature: 'cool, dark place',
      duration: 'whole: 1 year, ground: 3 months',
      container: 'airtight, dark',
      notes: 'Loses potency quickly when ground'
    }
  },

  'ground_paprika': {
    elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 },
    qualities: ['sweet', 'warm', 'earthy'],
    origin: ['Hungary', 'Spain', 'United States'],
    category: 'spice',
    subCategory: 'ground',
    varieties: {
      'Hungarian': 'more intense',
      'Spanish': 'more delicate',
      'American': 'balanced flavor'
    },
    conversionRatio: {
      'whole_to_ground': '1 tbsp whole = 2.5 tsp ground',
      'fresh_to_dried': 'not applicable'
    },
    affinities: ['beans', 'rice', 'meat', 'curry', 'vegetables'],
    cookingMethods: ['bloomed in oil', 'dry roasted', 'spice blends'],
    storage: {
      temperature: 'cool, dark place',
      duration: '4-6 months',
      container: 'airtight, dark',
      notes: 'Best toasted before grinding'
    },
    medicinalProperties: {
      actions: ['digestive aid', 'iron-rich'],
      energetics: 'warming',
      cautions: ['none in culinary amounts']
    }
  },

  'ground_mustard': {
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['pungent', 'sharp', 'hot'],
    origin: ['Canada', 'India', 'United Kingdom'],
    category: 'spice',
    subCategory: 'ground',
    varieties: {
      'Yellow': 'mild, American style',
      'Brown': 'spicier, Indian style',
      'Black': 'most pungent, European style'
    },
    conversionRatio: {
      'whole_to_ground': '1 tbsp whole = 2.5 tsp ground',
      'powder_to_prepared': '1 tsp powder = 1 tbsp prepared mustard'
    },
    affinities: ['pork', 'sausages', 'dressings', 'pickles', 'cheese dishes'],
    culinaryApplications: {
      'dressings': {
        method: 'mix with liquid to activate',
        timing: '10-15 minutes before using',
        pairings: ['vinegar', 'honey', 'herbs'],
        ratios: {
          'vinaigrette': '1:3:9 (mustard:vinegar:oil)',
          'honey_mustard': '2:2:1 (mustard:honey:vinegar)'
        }
      },
      'spice_rubs': {
        method: 'combine with other spices',
        pairings: ['paprika', 'black pepper', 'garlic'],
        ratios: '1:2:1 (mustard:paprika:other spices)'
      }
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '6 months',
      container: 'airtight',
      notes: 'Needs liquid to activate flavor'
    }
  },

  'ground_fennel': {
    elementalProperties: { Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['sweet', 'anise-like', 'warming'],
    origin: ['India', 'Mediterranean', 'China'],
    category: 'spice',
    subCategory: 'ground',
    varieties: {
      'Indian': 'more aromatic',
      'Mediterranean': 'sweeter notes',
      'Chinese': 'more medicinal'
    },
    conversionRatio: {
      'whole_to_ground': '1 tbsp whole = 2.5 tsp ground',
      'fresh_to_dried': '3:1 ratio'
    },
    affinities: ['fish', 'pork', 'sausages', 'bread', 'tomato sauces'],
    culinaryApplications: {
      'seafood': {
        method: 'sprinkle before cooking',
        pairings: ['cumin', 'garlic', 'coriander'],
        ratios: '1:1:1 (fennel:cumin:garlic)'
      },
      'pork': {
        method: 'mix with other spices',
        pairings: ['cumin', 'garlic', 'coriander'],
        ratios: '1:1:1 (fennel:cumin:garlic)'
      },
      'sausages': {
        method: 'mix with other spices',
        pairings: ['cumin', 'garlic', 'coriander'],
        ratios: '1:1:1 (fennel:cumin:garlic)'
      },
      'bread': {
        method: 'mix with other spices',
        pairings: ['cumin', 'garlic', 'coriander'],
        ratios: '1:1:1 (fennel:cumin:garlic)'
      },
      'tomato_sauces': {
        method: 'mix with other spices',
        pairings: ['cumin', 'garlic', 'coriander'],
        ratios: '1:1:1 (fennel:cumin:garlic)'
      }
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '6 months',
      container: 'airtight',
      notes: 'Needs liquid to activate flavor'
    }
  }
}
