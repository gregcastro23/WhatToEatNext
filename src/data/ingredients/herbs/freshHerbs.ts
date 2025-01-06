import type { IngredientMapping } from '@/types/alchemy';

export const freshHerbs: Record<string, IngredientMapping> = {
  'basil': {
    elementalProperties: { Fire: 0.3, Air: 0.3, Water: 0.3, Earth: 0.1 },
    qualities: ['warming', 'sweet', 'aromatic'],
    season: ['summer'],
    category: 'herb',
    subCategory: 'fresh',
    varieties: ['sweet basil', 'thai basil', 'purple basil', 'lemon basil'],
    affinities: ['tomato', 'mozzarella', 'garlic', 'olive oil', 'lemon'],
    cookingMethods: ['raw', 'infused', 'pesto', 'garnish'],
    conversionRatio: '3:1', // 3 parts fresh = 1 part dried
    nutritionalProfile: {
      vitamins: ['k', 'a', 'c'],
      minerals: ['calcium', 'magnesium'],
      antioxidants: ['flavonoids', 'anthocyanins'],
      volatileOils: ['eugenol', 'linalool']
    },
    preparation: {
      washing: 'gentle rinse and pat dry',
      cutting: 'tear or chiffonade',
      timing: 'add at end of cooking',
      notes: 'Bruises easily, handle gently'
    },
    storage: {
      temperature: 'room temp',
      duration: '4-7 days',
      method: 'stems in water like flowers',
      notes: 'Cover loosely with plastic bag'
    },
    medicinalProperties: {
      actions: ['anti-inflammatory', 'antibacterial'],
      preparations: ['tea', 'infused oil'],
      cautions: ['may affect blood clotting']
    }
  },

  'parsley': {
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
    qualities: ['cleansing', 'fresh', 'bright'],
    season: ['spring', 'summer', 'fall'],
    category: 'herb',
    subCategory: 'fresh',
    varieties: ['flat-leaf', 'curly'],
    affinities: ['lemon', 'garlic', 'fish', 'potatoes', 'grains'],
    cookingMethods: ['raw', 'garnish', 'sauce', 'bouquet garni'],
    conversionRatio: '2:1',
    nutritionalProfile: {
      vitamins: ['k', 'c', 'a'],
      minerals: ['iron', 'calcium'],
      antioxidants: ['flavonoids', 'luteolin'],
      volatileOils: ['myristicin', 'apiol']
    },
    preparation: {
      washing: 'thorough wash and dry',
      cutting: 'fine chop or rough chop',
      stemming: 'stems good for stock',
      notes: 'Stems have more flavor than leaves'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '1-2 weeks',
      method: 'wrapped in damp paper towel',
      notes: 'Can be frozen in oil'
    },
    medicinalProperties: {
      actions: ['diuretic', 'antioxidant'],
      preparations: ['tea', 'juice'],
      cautions: ['high in vitamin k - blood thinner interaction']
    }
  },

  'cilantro': {
    elementalProperties: { Air: 0.4, Water: 0.3, Fire: 0.2, Earth: 0.1 },
    qualities: ['cooling', 'pungent', 'bright'],
    season: ['spring', 'fall'],
    category: 'herb',
    subCategory: 'fresh',
    affinities: ['lime', 'chili', 'garlic', 'avocado', 'fish'],
    cookingMethods: ['raw', 'garnish', 'sauce', 'salsa'],
    conversionRatio: 'not recommended dried',
    nutritionalProfile: {
      vitamins: ['k', 'a', 'c'],
      minerals: ['potassium', 'manganese'],
      antioxidants: ['quercetin', 'kaempferol'],
      volatileOils: ['linalool', 'decanal']
    },
    preparation: {
      washing: 'thorough wash and dry',
      cutting: 'rough chop or whole leaves',
      stemming: 'stems are flavorful',
      notes: 'Add at end of cooking'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '1 week',
      method: 'stems in water, bag over leaves',
      notes: 'Very perishable'
    },
    medicinalProperties: {
      actions: ['digestive aid', 'chelating'],
      preparations: ['fresh', 'juice'],
      cautions: ['genetic taste variation']
    }
  },

  'mint': {
    elementalProperties: { Air: 0.4, Water: 0.3, Fire: 0.2, Earth: 0.1 },
    qualities: ['cooling', 'sweet', 'refreshing'],
    season: ['spring', 'summer'],
    category: 'herb',
    subCategory: 'fresh',
    varieties: ['peppermint', 'spearmint', 'chocolate mint', 'apple mint'],
    affinities: ['chocolate', 'lamb', 'peas', 'fruit', 'tea'],
    cookingMethods: ['raw', 'tea', 'garnish', 'infused'],
    conversionRatio: '4:1',
    nutritionalProfile: {
      vitamins: ['a', 'c'],
      minerals: ['calcium', 'magnesium'],
      antioxidants: ['rosmarinic acid', 'flavonoids'],
      volatileOils: ['menthol', 'carvone']
    },
    preparation: {
      washing: 'gentle rinse',
      cutting: 'chiffonade or whole leaves',
      timing: 'add at end of cooking',
      notes: 'Bruises easily'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '1 week',
      method: 'stems in water, bag over leaves',
      notes: 'Can be frozen in ice cubes'
    },
    medicinalProperties: {
      actions: ['digestive aid', 'decongestant'],
      preparations: ['tea', 'essential oil'],
      cautions: ['may reduce iron absorption']
    }
  },

  'chives': {
    elementalProperties: { Air: 0.4, Water: 0.3, Fire: 0.2, Earth: 0.1 },
    qualities: ['mild', 'fresh', 'delicate'],
    season: ['spring', 'summer'],
    category: 'herb',
    subCategory: 'fresh',
    varieties: ['common chives', 'garlic chives'],
    affinities: ['potato', 'eggs', 'cream', 'fish', 'soups'],
    cookingMethods: ['raw', 'garnish', 'infused'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['k', 'c', 'a'],
      minerals: ['calcium', 'iron'],
      antioxidants: ['allicin', 'flavonoids'],
      volatileOils: ['allyl sulfides']
    },
    preparation: {
      washing: 'gentle rinse and dry',
      cutting: 'small snips with scissors',
      timing: 'add at end of cooking',
      notes: 'Heat destroys delicate flavor'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '1-2 weeks',
      method: 'wrapped in damp paper towel',
      notes: 'Can be frozen'
    },
    medicinalProperties: {
      actions: ['antimicrobial', 'digestive aid'],
      preparations: ['fresh', 'infused'],
      cautions: ['mild allium sensitivity']
    }
  },

  'thyme': {
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['warming', 'pungent', 'earthy'],
    season: ['year-round'],
    category: 'herb',
    subCategory: 'fresh',
    varieties: ['common', 'lemon', 'orange', 'caraway'],
    affinities: ['mushrooms', 'poultry', 'root vegetables', 'beans', 'tomatoes'],
    cookingMethods: ['braised', 'roasted', 'soup', 'sauce'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['c', 'a'],
      minerals: ['iron', 'manganese'],
      antioxidants: ['thymol', 'carvacrol'],
      volatileOils: ['thymol', 'linalool']
    },
    preparation: {
      washing: 'gentle rinse',
      stripping: 'pull leaves against stem growth',
      timing: 'can add early in cooking',
      notes: 'Stems good for bouquet garni'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '1-2 weeks',
      method: 'wrapped in damp paper towel',
      notes: 'Can be frozen in oil or water'
    },
    medicinalProperties: {
      actions: ['antimicrobial', 'expectorant'],
      preparations: ['tea', 'honey', 'steam'],
      cautions: ['safe in culinary amounts']
    }
  },

  'oregano': {
    elementalProperties: { Fire: 0.5, Air: 0.2, Earth: 0.2, Water: 0.1 },
    qualities: ['warming', 'pungent', 'robust'],
    season: ['summer'],
    category: 'herb',
    subCategory: 'fresh',
    varieties: ['Greek', 'Italian', 'Mexican'],
    affinities: ['tomatoes', 'pizza', 'lamb', 'chicken', 'olive oil'],
    cookingMethods: ['cooked', 'sauce', 'marinade'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['k', 'e'],
      minerals: ['iron', 'manganese'],
      antioxidants: ['rosmarinic acid', 'thymol'],
      volatileOils: ['carvacrol', 'thymol']
    },
    preparation: {
      washing: 'gentle rinse',
      stripping: 'leaves from stems',
      chopping: 'rough chop or whole leaves',
      notes: 'Stronger flavor than marjoram'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '4-7 days',
      method: 'wrapped in damp paper towel',
      notes: 'Can be frozen'
    },
    medicinalProperties: {
      actions: ['antimicrobial', 'antifungal'],
      preparations: ['tea', 'oil'],
      cautions: ['may slow blood clotting']
    }
  },

  'marjoram': {
    elementalProperties: { Air: 0.4, Earth: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ['warming', 'sweet', 'gentle'],
    season: ['summer'],
    category: 'herb',
    subCategory: 'fresh',
    affinities: ['vegetables', 'eggs', 'poultry', 'mushrooms', 'legumes'],
    cookingMethods: ['cooked', 'sauce', 'soup'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['k', 'b6'],
      minerals: ['iron', 'calcium'],
      antioxidants: ['rosmarinic acid'],
      volatileOils: ['sabinene', 'terpinene']
    },
    preparation: {
      washing: 'gentle rinse',
      stripping: 'leaves from stems',
      timing: 'add towards end of cooking',
      notes: 'Milder than oregano'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '4-5 days',
      method: 'wrapped in damp paper towel',
      notes: 'Very delicate'
    }
  },

  'lemon_verbena': {
    elementalProperties: { Air: 0.5, Water: 0.2, Fire: 0.2, Earth: 0.1 },
    qualities: ['cooling', 'bright', 'citrusy'],
    season: ['summer'],
    category: 'herb',
    subCategory: 'fresh',
    affinities: ['fish', 'poultry', 'desserts', 'tea', 'fruit'],
    cookingMethods: ['tea', 'infused', 'desserts', 'marinades'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      antioxidants: ['verbascoside', 'luteolin'],
      volatileOils: ['citral', 'limonene'],
      minerals: ['calcium', 'magnesium']
    },
    preparation: {
      washing: 'gentle rinse',
      removing: 'tough center vein',
      crushing: 'to release oils',
      notes: 'Strong citrus flavor'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '3-5 days',
      method: 'wrapped in damp paper towel',
      notes: 'Best used fresh'
    },
    medicinalProperties: {
      actions: ['digestive aid', 'calming'],
      preparations: ['tea', 'tincture'],
      cautions: ['may cause skin sensitivity']
    }
  },

  'lovage': {
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
    qualities: ['warming', 'savory', 'celery-like'],
    season: ['spring', 'summer'],
    category: 'herb',
    subCategory: 'fresh',
    affinities: ['potato', 'soups', 'stews', 'tomato', 'beans'],
    cookingMethods: ['soup', 'stew', 'salad', 'stock'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['c', 'b6'],
      minerals: ['iron', 'magnesium'],
      antioxidants: ['quercetin'],
      volatileOils: ['phthalides']
    },
    preparation: {
      washing: 'thorough rinse',
      chopping: 'leaves and stems usable',
      timing: 'can add early in cooking',
      notes: 'Strong celery-like flavor'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '4-7 days',
      method: 'stems in water',
      notes: 'Can be frozen'
    }
  },

  'summer_savory': {
    elementalProperties: { Fire: 0.3, Earth: 0.3, Air: 0.2, Water: 0.2 },
    qualities: ['warming', 'peppery', 'robust'],
    season: ['summer'],
    category: 'herb',
    subCategory: 'fresh',
    affinities: ['beans', 'pork', 'poultry', 'vegetables', 'eggs'],
    cookingMethods: ['cooked', 'marinades', 'stuffing'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['a', 'c'],
      minerals: ['iron', 'calcium'],
      antioxidants: ['rosmarinic acid'],
      volatileOils: ['carvacrol', 'thymol']
    },
    preparation: {
      washing: 'gentle rinse',
      stripping: 'leaves from stems',
      chopping: 'fine chop',
      notes: 'More delicate than winter savory'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '4-5 days',
      method: 'wrapped in damp paper towel',
      notes: 'Best used fresh'
    },
    medicinalProperties: {
      actions: ['digestive aid', 'antimicrobial'],
      preparations: ['tea', 'infused oil'],
      cautions: ['safe in culinary amounts']
    }
  }
};