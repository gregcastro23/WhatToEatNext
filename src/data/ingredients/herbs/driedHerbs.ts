import type { IngredientMapping } from '@/types/alchemy';

export const driedHerbs: Record<string, IngredientMapping> = {
  'dried_basil': {
    elementalProperties: { Air: 0.4, Water: 0.3, Fire: 0.2, Earth: 0.1 },
    qualities: ['warming', 'pungent', 'aromatic'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    potency: 8,
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
    elementalProperties: { Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['sweet', 'delicate', 'warming'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['poultry', 'vegetables', 'legumes', 'tomato sauces', 'eggs'],
    cookingMethods: ['cooked', 'infused'],
    conversionRatio: '1:3',
    nutritionalProfile: {
      vitamins: ['k', 'c'],
      minerals: ['iron', 'calcium'],
      antioxidants: ['rosmarinic acid', 'ursolic acid'],
      volatileOils: ['sabinene', 'terpinene']
    },
    preparation: {
      crushing: 'gently before use',
      timing: 'add early in cooking',
      notes: 'More delicate than oregano'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '1-2 years',
      container: 'airtight, dark',
      notes: 'Replace when aroma fades'
    }
  },

  'dried_savory': {
    elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 },
    qualities: ['peppery', 'robust', 'aromatic'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['beans', 'pork', 'poultry', 'sausages', 'cabbage'],
    cookingMethods: ['cooked', 'infused', 'marinades'],
    conversionRatio: '1:3',
    nutritionalProfile: {
      vitamins: ['a', 'c'],
      minerals: ['iron', 'manganese'],
      antioxidants: ['rosmarinic acid', 'thymol'],
      volatileOils: ['carvacrol', 'thymol']
    },
    preparation: {
      crushing: 'before use',
      timing: 'add during cooking',
      notes: 'Strong flavor - use sparingly'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '1-2 years',
      container: 'airtight, dark',
      notes: 'Maintains strength well when dried'
    }
  },

  'dried_chervil': {
    elementalProperties: { Air: 0.5, Earth: 0.2, Water: 0.2, Fire: 0.1 },
    qualities: ['delicate', 'subtle', 'anise-like'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['eggs', 'fish', 'chicken', 'light sauces', 'potatoes'],
    cookingMethods: ['finishing', 'infused'],
    conversionRatio: '1:3',
    nutritionalProfile: {
      vitamins: ['c', 'a'],
      minerals: ['potassium', 'calcium'],
      antioxidants: ['flavonoids', 'carotenoids'],
      volatileOils: ['methyl chavicol', 'limonene']
    },
    preparation: {
      crushing: 'very gently',
      timing: 'add at end of cooking',
      notes: 'Very delicate flavor'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '6-12 months',
      container: 'airtight, dark',
      notes: 'Loses flavor quickly when dried'
    }
  },

  'dried_tarragon': {
    elementalProperties: { Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['anise-like', 'sweet', 'aromatic'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['chicken', 'fish', 'eggs', 'mushrooms', 'french cuisine'],
    cookingMethods: ['cooked', 'infused', 'sauces'],
    conversionRatio: '1:3',
    nutritionalProfile: {
      vitamins: ['a', 'c'],
      minerals: ['calcium', 'potassium'],
      antioxidants: ['quercetin', 'rutin'],
      volatileOils: ['estragole', 'ocimene']
    },
    preparation: {
      crushing: 'gently to release oils',
      timing: 'add during cooking',
      notes: 'Strong flavor - use sparingly'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '1-2 years',
      container: 'airtight, dark',
      notes: 'Replace when aroma weakens'
    }
  },

  'dried_dill': {
    elementalProperties: { Air: 0.5, Water: 0.2, Earth: 0.2, Fire: 0.1 },
    qualities: ['fresh', 'tangy', 'herbaceous'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['fish', 'pickles', 'potatoes', 'cucumber', 'yogurt'],
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
  },

  'dried_parsley': {
    elementalProperties: { Air: 0.4, Earth: 0.3, Water: 0.2, Fire: 0.1 },
    qualities: ['herbaceous', 'mild', 'fresh'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['potatoes', 'fish', 'soups', 'grains', 'vegetables'],
    cookingMethods: ['cooked', 'garnish', 'infused'],
    conversionRatio: '1:3',
    nutritionalProfile: {
      vitamins: ['k', 'c', 'a'],
      minerals: ['iron', 'calcium'],
      antioxidants: ['flavonoids', 'luteolin'],
      volatileOils: ['myristicin', 'apiol']
    },
    preparation: {
      crushing: 'gently before use',
      timing: 'add during or end of cooking',
      notes: 'Milder than fresh parsley'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '1-2 years',
      container: 'airtight, dark',
      notes: 'Color may fade but flavor remains'
    }
  },

  'dried_cilantro': {
    elementalProperties: { Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['citrusy', 'warm', 'distinctive'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['mexican cuisine', 'indian cuisine', 'rice', 'beans', 'soups'],
    cookingMethods: ['cooked', 'infused'],
    conversionRatio: '1:4',
    nutritionalProfile: {
      vitamins: ['k', 'a'],
      minerals: ['potassium', 'manganese'],
      antioxidants: ['quercetin', 'kaempferol'],
      volatileOils: ['linalool', 'decanal']
    },
    preparation: {
      crushing: 'before use',
      timing: 'add early in cooking',
      notes: 'Different flavor profile than fresh'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '1-2 years',
      container: 'airtight, dark',
      notes: 'Best in cooked dishes'
    }
  },

  'dried_chives': {
    elementalProperties: { Air: 0.4, Water: 0.3, Fire: 0.2, Earth: 0.1 },
    qualities: ['oniony', 'mild', 'delicate'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['potatoes', 'eggs', 'soups', 'dips', 'sauces'],
    cookingMethods: ['garnish', 'rehydrated', 'cooked'],
    conversionRatio: '1:3',
    nutritionalProfile: {
      vitamins: ['k', 'c'],
      minerals: ['calcium', 'iron'],
      antioxidants: ['allicin', 'quercetin'],
      volatileOils: ['allyl sulfides']
    },
    preparation: {
      rehydrating: 'soak in warm water briefly',
      timing: 'add near end of cooking',
      notes: 'Can be rehydrated for better texture'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '1-2 years',
      container: 'airtight, dark',
      notes: 'Protect from moisture'
    }
  },

  'dried_lemon_balm': {
    elementalProperties: { Air: 0.4, Water: 0.3, Fire: 0.2, Earth: 0.1 },
    qualities: ['lemony', 'mild', 'soothing'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['tea', 'fish', 'poultry', 'salads', 'fruit desserts'],
    cookingMethods: ['tea', 'infused', 'baking'],
    conversionRatio: '1:4',
    nutritionalProfile: {
      vitamins: ['b', 'c'],
      minerals: ['calcium', 'potassium'],
      antioxidants: ['rosmarinic acid', 'flavonoids'],
      volatileOils: ['citral', 'citronellal']
    },
    preparation: {
      crushing: 'lightly before use',
      timing: 'add near end of cooking',
      notes: 'Delicate lemon flavor'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '1-2 years',
      container: 'airtight, dark',
      notes: 'Maintains aroma well when dried'
    },
    medicinalProperties: {
      actions: ['calming', 'digestive aid'],
      preparations: ['tea', 'tincture'],
      cautions: ['may cause drowsiness']
    }
  },

  'dried_lavender': {
    elementalProperties: { Air: 0.5, Fire: 0.2, Earth: 0.2, Water: 0.1 },
    qualities: ['floral', 'sweet', 'aromatic'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['desserts', 'honey', 'lamb', 'provence herbs', 'tea'],
    cookingMethods: ['baking', 'infused', 'tea'],
    conversionRatio: '1:3',
    nutritionalProfile: {
      vitamins: ['a', 'c'],
      minerals: ['calcium', 'iron'],
      antioxidants: ['rosmarinic acid', 'ursolic acid'],
      volatileOils: ['linalool', 'linalyl acetate']
    },
    preparation: {
      crushing: 'gently before use',
      timing: 'add early for cooking, late for tea',
      notes: 'Use sparingly - can become soapy'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '1-3 years',
      container: 'airtight, dark',
      notes: 'Buds store better than flowers'
    },
    medicinalProperties: {
      actions: ['calming', 'sleep aid'],
      preparations: ['tea', 'sachet'],
      cautions: ['may cause drowsiness']
    }
  },

  'dried_summer_savory': {
    elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 },
    qualities: ['peppery', 'robust', 'warming'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['beans', 'meat', 'poultry', 'sausages', 'vegetables'],
    cookingMethods: ['cooked', 'infused', 'marinades'],
    conversionRatio: '1:3',
    nutritionalProfile: {
      vitamins: ['k', 'b6'],
      minerals: ['iron', 'manganese'],
      antioxidants: ['rosmarinic acid', 'carvacrol'],
      volatileOils: ['thymol', 'carvacrol']
    },
    preparation: {
      crushing: 'before use',
      timing: 'add early in cooking',
      notes: 'Traditional bean herb'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '1-2 years',
      container: 'airtight, dark',
      notes: 'Replace when aroma fades'
    }
  },

  'dried_lovage': {
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
    qualities: ['celery-like', 'robust', 'savory'],
    season: ['all'],
    category: 'herb',
    subCategory: 'dried',
    affinities: ['soups', 'stews', 'potato', 'meat', 'stocks'],
    cookingMethods: ['cooked', 'infused', 'seasoning'],
    conversionRatio: '1:3',
    nutritionalProfile: {
      vitamins: ['b6', 'c'],
      minerals: ['iron', 'magnesium'],
      antioxidants: ['quercetin', 'kaempferol'],
      volatileOils: ['phthalides', 'terpenes']
    },
    preparation: {
      crushing: 'before use',
      timing: 'add early in cooking',
      notes: 'Strong celery-like flavor'
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '1-2 years',
      container: 'airtight, dark',
      notes: 'Replace when aroma weakens'
    }
  }
};

export default driedHerbs;
