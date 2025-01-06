import type { IngredientMapping } from '@/types/alchemy';

export const driedHerbs: Record<string, IngredientMapping> = {
  'dried_basil': {
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['warming', 'pungent', 'aromatic'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['tomato', 'garlic', 'olive oil', 'mediterranean herbs'],
    cookingMethods: ['infused', 'cooked'],
    conversionRatio: '1:3', // 1 part dried = 3 parts fresh
    nutritionalProfile: {
      vitamins: ['k', 'a'],
      minerals: ['calcium', 'iron'],
      antioxidants: ['flavonoids', 'anthocyanins'],
      volatileOils: ['eugenol', 'linalool']
    },
    preparation: {
      crushing: 'just before use',
      blooming: 'in oil or hot liquid',
      timing: 'add early in cooking',
      notes: 'More concentrated than fresh'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '1-3 years',
      container: 'airtight, dark',
      notes: 'Crush to test freshness - should be aromatic'
    }
  },

  'dried_oregano': {
    elementalProperties: { Fire: 0.5, Air: 0.2, Earth: 0.2, Water: 0.1 },
    qualities: ['warming', 'pungent', 'drying'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['tomato', 'olive oil', 'lemon', 'garlic', 'mediterranean herbs'],
    cookingMethods: ['cooked', 'infused'],
    conversionRatio: '1:3',
    nutritionalProfile: {
      vitamins: ['k', 'e'],
      minerals: ['iron', 'manganese'],
      antioxidants: ['rosmarinic acid', 'thymol'],
      volatileOils: ['carvacrol', 'thymol']
    },
    preparation: {
      crushing: 'release oils before use',
      blooming: 'in oil or hot liquid',
      timing: 'add early in cooking',
      notes: 'Often preferred dried over fresh'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '2-3 years',
      container: 'airtight, dark',
      notes: 'Maintains flavor well when dried'
    }
  },

  'dried_thyme': {
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['warming', 'drying', 'pungent'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['lemon', 'garlic', 'poultry', 'mushrooms', 'root vegetables'],
    cookingMethods: ['cooked', 'infused', 'brined'],
    conversionRatio: '1:3',
    nutritionalProfile: {
      vitamins: ['c', 'a'],
      minerals: ['iron', 'manganese'],
      antioxidants: ['thymol', 'carvacrol'],
      volatileOils: ['thymol', 'linalool']
    },
    preparation: {
      removing: 'from stems if whole',
      crushing: 'lightly before use',
      timing: 'add early in cooking',
      notes: 'Retains flavor well when dried'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '2-4 years',
      container: 'airtight, dark',
      notes: 'Whole leaves last longer than ground'
    }
  },

  'dried_rosemary': {
    elementalProperties: { Fire: 0.5, Air: 0.2, Earth: 0.2, Water: 0.1 },
    qualities: ['warming', 'pungent', 'drying'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['lamb', 'potato', 'olive oil', 'garlic', 'lemon'],
    cookingMethods: ['cooked', 'infused', 'roasted'],
    conversionRatio: '1:3',
    nutritionalProfile: {
      vitamins: ['a', 'c'],
      minerals: ['calcium', 'iron'],
      antioxidants: ['carnosic acid', 'rosmarinic acid'],
      volatileOils: ['pinene', 'camphor']
    },
    preparation: {
      grinding: 'recommended - leaves are tough',
      infusing: 'in oil or liquid',
      timing: 'add early in cooking',
      notes: 'Use sparingly - very potent'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '1-3 years',
      container: 'airtight, dark',
      notes: 'Whole needles last longer than ground'
    }
  },

  'dried_sage': {
    elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
    qualities: ['warming', 'drying', 'astringent'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['poultry', 'pork', 'butternut squash', 'butter', 'mushrooms'],
    cookingMethods: ['cooked', 'infused', 'rubbed'],
    conversionRatio: '1:4',
    nutritionalProfile: {
      vitamins: ['k', 'b6'],
      minerals: ['iron', 'calcium'],
      antioxidants: ['rosmarinic acid', 'carnosic acid'],
      volatileOils: ['thujone', 'camphor']
    },
    preparation: {
      rubbing: 'crumble between fingers',
      timing: 'add early in cooking',
      notes: 'Strong flavor - use sparingly'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '1-3 years',
      container: 'airtight, dark',
      notes: 'Rubbed sage is more potent than whole dried leaves'
    },
    medicinalProperties: {
      actions: ['antimicrobial', 'digestive aid'],
      preparations: ['tea', 'infusion'],
      cautions: ['avoid therapeutic doses during pregnancy']
    }
  },

  'dried_bay_leaves': {
    elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
    qualities: ['warming', 'bitter', 'aromatic'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['soups', 'stews', 'rice', 'beans', 'meat'],
    cookingMethods: ['simmered', 'infused', 'brined'],
    conversionRatio: '1:2',
    nutritionalProfile: {
      vitamins: ['a', 'c'],
      minerals: ['iron', 'manganese'],
      antioxidants: ['linalool', 'eugenol'],
      volatileOils: ['cineole', 'eugenol']
    },
    preparation: {
      whole: 'use whole and remove before serving',
      crushing: 'slightly to release oils',
      timing: 'add at beginning of cooking',
      notes: 'Remove before serving'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '1-3 years',
      container: 'airtight, dark',
      notes: 'Whole leaves maintain flavor longer'
    }
  },

  'dried_marjoram': {
    elementalProperties: { Air: 0.4, Earth: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ['warming', 'gentle', 'sweet'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['vegetables', 'poultry', 'eggs', 'mushrooms', 'tomatoes'],
    cookingMethods: ['cooked', 'infused'],
    conversionRatio: '1:3',
    nutritionalProfile: {
      vitamins: ['k', 'b6'],
      minerals: ['iron', 'calcium'],
      antioxidants: ['rosmarinic acid'],
      volatileOils: ['sabinene', 'terpinene']
    },
    preparation: {
      crushing: 'before use',
      timing: 'add towards end of cooking',
      notes: 'Milder than oregano'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '1-2 years',
      container: 'airtight, dark',
      notes: 'Replace yearly for best flavor'
    }
  },

  'dried_tarragon': {
    elementalProperties: { Fire: 0.3, Air: 0.3, Earth: 0.2, Water: 0.2 },
    qualities: ['warming', 'pungent', 'sweet'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['chicken', 'fish', 'eggs', 'mushrooms', 'vinegar'],
    cookingMethods: ['cooked', 'infused', 'vinegars'],
    conversionRatio: '1:4',
    nutritionalProfile: {
      vitamins: ['a', 'c'],
      minerals: ['manganese', 'iron'],
      antioxidants: ['quercetin', 'rutin'],
      volatileOils: ['estragole', 'ocimene']
    },
    preparation: {
      crushing: 'lightly before use',
      timing: 'add during cooking',
      notes: 'Use sparingly - strong anise flavor'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '1-2 years',
      container: 'airtight, dark',
      notes: 'Loses flavor quickly when dried'
    }
  },

  'dried_dill': {
    elementalProperties: { Air: 0.4, Water: 0.3, Earth: 0.2, Fire: 0.1 },
    qualities: ['cooling', 'aromatic', 'light'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['fish', 'cucumber', 'potato', 'yogurt', 'pickles'],
    cookingMethods: ['cooked', 'pickling', 'infused'],
    conversionRatio: '1:3',
    nutritionalProfile: {
      vitamins: ['a', 'c'],
      minerals: ['manganese', 'iron'],
      antioxidants: ['flavonoids', 'monoterpenes'],
      volatileOils: ['carvone', 'limonene']
    },
    preparation: {
      crushing: 'before use',
      timing: 'add late in cooking',
      notes: 'More concentrated than fresh'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '1-2 years',
      container: 'airtight, dark',
      notes: 'Protect from light to maintain color'
    }
  },

  'dried_mint': {
    elementalProperties: { Air: 0.5, Water: 0.2, Fire: 0.2, Earth: 0.1 },
    qualities: ['cooling', 'refreshing', 'pungent'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['chocolate', 'lamb', 'peas', 'tea', 'fruit'],
    cookingMethods: ['tea', 'cooked', 'infused'],
    conversionRatio: '1:4',
    nutritionalProfile: {
      vitamins: ['a', 'c'],
      minerals: ['iron', 'manganese'],
      antioxidants: ['rosmarinic acid', 'flavonoids'],
      volatileOils: ['menthol', 'menthone']
    },
    preparation: {
      crushing: 'to release oils',
      timing: 'add during or after cooking',
      notes: 'Good for both sweet and savory'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '1-2 years',
      container: 'airtight, dark',
      notes: 'Maintains menthol well when dried'
    },
    medicinalProperties: {
      actions: ['digestive aid', 'decongestant'],
      preparations: ['tea', 'infusion'],
      cautions: ['may affect iron absorption']
    }
  },

  'dried_fennel': {
    elementalProperties: { Fire: 0.3, Air: 0.3, Earth: 0.2, Water: 0.2 },
    qualities: ['warming', 'sweet', 'aromatic'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['fish', 'pork', 'tomatoes', 'eggs', 'bread'],
    cookingMethods: ['cooked', 'infused', 'tea'],
    conversionRatio: '1:3',
    nutritionalProfile: {
      vitamins: ['c', 'b6'],
      minerals: ['calcium', 'iron'],
      antioxidants: ['flavonoids', 'anethole'],
      volatileOils: ['anethole', 'fenchone']
    },
    preparation: {
      grinding: 'just before use if whole',
      timing: 'add early in cooking',
      notes: 'Licorice-like flavor'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '1-3 years',
      container: 'airtight, dark',
      notes: 'Whole seeds last longer than ground'
    },
    medicinalProperties: {
      actions: ['digestive aid', 'anti-inflammatory'],
      preparations: ['tea', 'powder'],
      cautions: ['may interact with estrogen']
    }
  }
};
