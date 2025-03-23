import type { IngredientMapping } from '@/types/alchemy';

export const freshHerbs: Record<string, IngredientMapping> = {
  'basil': {
    elementalProperties: { Air: 0.4, Water: 0.3, Fire: 0.2, Earth: 0.1 },
    qualities: ['warming', 'sweet', 'aromatic'],
    season: ['summer'],
    category: 'herb',
    subCategory: 'fresh',
    potency: 7,
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
    elementalProperties: { Air: 0.5, Water: 0.2, Fire: 0.2, Earth: 0.1 },
    qualities: ['bright', 'citrusy', 'fresh'],
    season: ['spring', 'fall'],
    category: 'herb',
    subCategory: 'fresh',
    varieties: ['slow-bolt', 'santo', 'calypso'],
    affinities: ['mexican cuisine', 'asian cuisine', 'fish', 'salsa', 'avocado'],
    cookingMethods: ['raw', 'garnish', 'sauce'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['k', 'c', 'a'],
      minerals: ['potassium', 'manganese'],
      antioxidants: ['quercetin', 'kaempferol'],
      volatileOils: ['linalool', 'decanal']
    },
    preparation: {
      washing: 'thorough rinse',
      chopping: 'leaves and tender stems',
      timing: 'add at end of cooking',
      notes: 'Loses flavor when cooked'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      method: 'stems in water, bag over leaves',
      notes: 'Check daily for wilting leaves'
    },
    medicinalProperties: {
      actions: ['detoxifying', 'digestive aid'],
      preparations: ['fresh', 'juice'],
      cautions: ['may cause allergic reactions']
    }
  },

  'mint': {
    elementalProperties: { Air: 0.4, Water: 0.3, Fire: 0.2, Earth: 0.1 },
    qualities: ['cooling', 'fresh', 'bright'],
    season: ['spring', 'summer', 'fall'],
    category: 'herb',
    subCategory: 'fresh',
    varieties: ['peppermint', 'spearmint', 'chocolate mint', 'apple mint'],
    affinities: ['lamb', 'peas', 'chocolate', 'tea', 'cocktails'],
    cookingMethods: ['raw', 'infused', 'tea', 'garnish'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['a', 'c'],
      minerals: ['calcium', 'magnesium'],
      antioxidants: ['rosmarinic acid', 'flavonoids'],
      volatileOils: ['menthol', 'menthone']
    },
    preparation: {
      washing: 'gentle rinse',
      stripping: 'leaves from stems',
      timing: 'add at end of cooking',
      notes: 'Bruise leaves to release oils'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '7-10 days',
      method: 'stems in water, bag over leaves',
      notes: 'Prone to wilting'
    },
    medicinalProperties: {
      actions: ['digestive aid', 'cooling'],
      preparations: ['tea', 'fresh'],
      cautions: ['may reduce iron absorption']
    }
  },

  'chives': {
    elementalProperties: { Air: 0.4, Water: 0.3, Fire: 0.2, Earth: 0.1 },
    qualities: ['mild', 'oniony', 'fresh'],
    season: ['spring', 'summer', 'fall'],
    category: 'herb',
    subCategory: 'fresh',
    varieties: ['common chives', 'garlic chives', 'chinese chives'],
    affinities: ['potato', 'eggs', 'cream', 'fish', 'soups'],
    cookingMethods: ['raw', 'garnish', 'infused'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['k', 'c', 'a'],
      minerals: ['calcium', 'iron'],
      antioxidants: ['allicin', 'quercetin'],
      volatileOils: ['allyl sulfides']
    },
    preparation: {
      washing: 'gentle rinse',
      cutting: 'snip with scissors',
      timing: 'add at end of cooking',
      notes: 'Cut just before use'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '1-2 weeks',
      method: 'wrapped in damp paper towel',
      notes: 'Can be frozen'
    },
    medicinalProperties: {
      actions: ['digestive aid', 'antibacterial'],
      preparations: ['fresh', 'infused oil'],
      cautions: ['may affect blood clotting']
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
    qualities: ['sweet', 'delicate', 'floral'],
    season: ['summer', 'fall'],
    category: 'herb',
    subCategory: 'fresh',
    varieties: ['sweet marjoram', 'pot marjoram', 'wild marjoram'],
    affinities: ['vegetables', 'eggs', 'meat', 'soups', 'mediterranean cuisine'],
    cookingMethods: ['cooked', 'infused', 'marinades'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['k', 'c'],
      minerals: ['calcium', 'iron'],
      antioxidants: ['ursolic acid', 'rosmarinic acid'],
      volatileOils: ['sabinene', 'terpinene']
    },
    preparation: {
      washing: 'gentle rinse',
      stripping: 'leaves from stems',
      timing: 'add late in cooking',
      notes: 'More delicate than oregano'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '4-5 days',
      method: 'wrapped in damp paper towel',
      notes: 'Best used fresh'
    },
    medicinalProperties: {
      actions: ['digestive aid', 'calming'],
      preparations: ['tea', 'fresh'],
      cautions: ['may increase bleeding']
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
  },

  'dill': {
    elementalProperties: { Air: 0.5, Water: 0.2, Earth: 0.2, Fire: 0.1 },
    qualities: ['fresh', 'aromatic', 'delicate'],
    season: ['spring', 'summer'],
    category: 'herb',
    subCategory: 'fresh',
    varieties: ['bouquet', 'dukat', 'fernleaf'],
    affinities: ['fish', 'cucumber', 'potato', 'yogurt', 'pickles'],
    cookingMethods: ['raw', 'pickling', 'sauce', 'garnish'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['c', 'a'],
      minerals: ['manganese', 'iron'],
      antioxidants: ['flavonoids', 'monoterpenes'],
      volatileOils: ['carvone', 'limonene']
    },
    preparation: {
      washing: 'gentle rinse',
      cutting: 'snip with scissors',
      timing: 'add late in cooking',
      notes: 'Delicate flavor lost with heat'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      method: 'stems in water, bag over leaves',
      notes: 'Freezes well'
    },
    medicinalProperties: {
      actions: ['digestive aid', 'antioxidant'],
      preparations: ['tea', 'fresh'],
      cautions: ['may increase blood sugar']
    }
  },

  'tarragon': {
    elementalProperties: { Fire: 0.3, Air: 0.3, Earth: 0.2, Water: 0.2 },
    qualities: ['sweet', 'anise-like', 'warming'],
    season: ['spring', 'summer'],
    category: 'herb',
    subCategory: 'fresh',
    varieties: ['french', 'russian'],
    affinities: ['chicken', 'fish', 'eggs', 'mushrooms', 'vinegar'],
    cookingMethods: ['sauce', 'vinegar', 'butter', 'cooked'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['a', 'c', 'b6'],
      minerals: ['calcium', 'iron'],
      antioxidants: ['quercetin', 'rutin'],
      volatileOils: ['estragole', 'ocimene']
    },
    preparation: {
      washing: 'gentle rinse',
      stripping: 'leaves from stems',
      timing: 'add during cooking',
      notes: 'Strong flavor - use sparingly'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '4-5 days',
      method: 'wrapped in damp paper towel',
      notes: 'Does not dry well'
    },
    medicinalProperties: {
      actions: ['digestive aid', 'appetite stimulant'],
      preparations: ['fresh', 'vinegar'],
      cautions: ['avoid during pregnancy']
    }
  },

  'lemongrass': {
    elementalProperties: { Air: 0.4, Fire: 0.3, Water: 0.2, Earth: 0.1 },
    qualities: ['citrusy', 'fresh', 'aromatic'],
    season: ['year-round'],
    category: 'herb',
    subCategory: 'fresh',
    varieties: ['east indian', 'west indian'],
    affinities: ['asian cuisine', 'curry', 'seafood', 'poultry', 'tea'],
    cookingMethods: ['infused', 'curry', 'soup', 'tea'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['a', 'c'],
      minerals: ['potassium', 'zinc'],
      antioxidants: ['quercetin', 'luteolin'],
      volatileOils: ['citral', 'geraniol']
    },
    preparation: {
      trimming: 'remove tough outer layers',
      cutting: 'slice thinly or bruise',
      timing: 'add early in cooking',
      notes: 'Remove before serving'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '2-3 weeks',
      method: 'wrapped in damp paper towel',
      notes: 'Can be frozen whole'
    },
    medicinalProperties: {
      actions: ['digestive aid', 'anti-inflammatory'],
      preparations: ['tea', 'infused oil'],
      cautions: ['may cause skin sensitivity']
    }
  },

  'thai_basil': {
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['spicy', 'anise-like', 'aromatic'],
    season: ['summer'],
    category: 'herb',
    subCategory: 'fresh',
    varieties: ['thai', 'holy basil', 'lemon basil'],
    affinities: ['thai cuisine', 'vietnamese cuisine', 'stir-fry', 'curry', 'noodles'],
    cookingMethods: ['stir-fried', 'curry', 'soup', 'raw'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['k', 'a', 'c'],
      minerals: ['calcium', 'magnesium'],
      antioxidants: ['rosmarinic acid', 'eugenol'],
      volatileOils: ['methyl chavicol', 'eugenol']
    },
    preparation: {
      washing: 'gentle rinse',
      picking: 'leaves from stems',
      timing: 'add at end of cooking',
      notes: 'More heat stable than sweet basil'
    },
    storage: {
      temperature: 'room temperature',
      duration: '3-5 days',
      method: 'stems in water, loose bag over leaves',
      notes: 'Do not refrigerate'
    },
    medicinalProperties: {
      actions: ['anti-inflammatory', 'digestive aid'],
      preparations: ['fresh', 'tea'],
      cautions: ['may affect blood clotting']
    }
  },

  'epazote': {
    elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
    qualities: ['pungent', 'strong', 'earthy'],
    season: ['summer', 'fall'],
    category: 'herb',
    subCategory: 'fresh',
    affinities: ['mexican cuisine', 'beans', 'corn', 'quesadillas', 'soups'],
    cookingMethods: ['cooked', 'beans', 'soup'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['b', 'a'],
      minerals: ['calcium', 'iron', 'magnesium'],
      antioxidants: ['monoterpenes', 'flavonoids'],
      volatileOils: ['ascaridole', 'carvacrol']
    },
    preparation: {
      washing: 'thorough rinse',
      chopping: 'coarse chop',
      timing: 'add during cooking',
      notes: 'Traditional bean herb - aids digestion'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      method: 'wrapped in damp paper towel',
      notes: 'Freezes well'
    },
    medicinalProperties: {
      actions: ['anti-parasitic', 'carminative'],
      preparations: ['fresh', 'tea'],
      cautions: ['use sparingly - strong oil content']
    }
  },

  'shiso': {
    elementalProperties: { Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['complex', 'minty', 'citrusy'],
    season: ['summer'],
    category: 'herb',
    subCategory: 'fresh',
    varieties: ['green', 'red', 'purple'],
    affinities: ['japanese cuisine', 'korean cuisine', 'fish', 'rice', 'pickles'],
    cookingMethods: ['raw', 'pickled', 'tempura', 'garnish'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['k', 'a'],
      minerals: ['iron', 'calcium'],
      antioxidants: ['anthocyanins', 'perillaldehyde'],
      volatileOils: ['perillyl alcohol', 'limonene']
    },
    preparation: {
      washing: 'gentle rinse',
      usage: 'whole leaves or chiffonade',
      timing: 'typically used raw',
      notes: 'Different varieties have distinct flavors'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '3-4 days',
      method: 'wrapped in damp paper towel',
      notes: 'Very delicate - use quickly'
    },
    medicinalProperties: {
      actions: ['anti-inflammatory', 'antimicrobial'],
      preparations: ['fresh', 'pickled'],
      cautions: ['may cause allergic reactions']
    }
  },

  'curry_leaves': {
    elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 },
    qualities: ['aromatic', 'citrusy', 'nutty'],
    season: ['year-round'],
    category: 'herb',
    subCategory: 'fresh',
    affinities: ['indian cuisine', 'sri lankan cuisine', 'lentils', 'coconut', 'curry'],
    cookingMethods: ['tempered', 'curry', 'dal', 'chutney'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['a', 'b', 'c'],
      minerals: ['iron', 'calcium'],
      antioxidants: ['carbazole alkaloids', 'flavonoids'],
      volatileOils: ['linalool', 'pinene']
    },
    preparation: {
      washing: 'gentle rinse',
      usage: 'whole leaves',
      timing: 'add at start of cooking',
      notes: 'Often fried in oil first'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '1-2 weeks',
      method: 'wrapped in paper towel, plastic bag',
      notes: 'Can be frozen'
    },
    medicinalProperties: {
      actions: ['digestive aid', 'anti-diabetic'],
      preparations: ['fresh', 'oil'],
      cautions: ['may interact with medications']
    }
  },

  'rau_ram': {
    elementalProperties: { Air: 0.4, Water: 0.3, Fire: 0.2, Earth: 0.1 },
    qualities: ['citrusy', 'spicy', 'complex'],
    season: ['summer', 'fall'],
    category: 'herb',
    subCategory: 'fresh',
    affinities: ['vietnamese cuisine', 'seafood', 'soups', 'spring rolls', 'noodles'],
    cookingMethods: ['raw', 'garnish', 'soup'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['c', 'a'],
      minerals: ['potassium', 'iron'],
      antioxidants: ['polyphenols'],
      volatileOils: ['dodecenal', 'decanal']
    },
    preparation: {
      washing: 'gentle rinse',
      picking: 'leaves from stems',
      timing: 'add at end of cooking',
      notes: 'Vietnamese coriander substitute'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      method: 'stems in water, bag over leaves',
      notes: 'High humidity needed'
    },
    medicinalProperties: {
      actions: ['anti-inflammatory', 'digestive aid'],
      preparations: ['fresh', 'tea'],
      cautions: ['may increase menstrual flow']
    }
  },

  'za_atar_herb': {
    elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
    qualities: ['earthy', 'aromatic', 'robust'],
    season: ['spring', 'summer'],
    category: 'herb',
    subCategory: 'fresh',
    varieties: ['syrian', 'lebanese'],
    affinities: ['middle eastern cuisine', 'bread', 'meat', 'yogurt', 'olive oil'],
    cookingMethods: ['raw', 'dried', 'infused'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['e', 'k'],
      minerals: ['iron', 'calcium'],
      antioxidants: ['thymol', 'carvacrol'],
      volatileOils: ['thymol', 'p-cymene']
    },
    preparation: {
      washing: 'gentle rinse',
      drying: 'pat completely dry',
      timing: 'use fresh or dry',
      notes: 'Base herb for za\'atar blend'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '4-5 days',
      method: 'wrapped in damp paper towel',
      notes: 'Dries well for later use'
    },
    medicinalProperties: {
      actions: ['antimicrobial', 'respiratory aid'],
      preparations: ['fresh', 'dried'],
      cautions: ['may interact with blood thinners']
    }
  },

  'perilla': {
    elementalProperties: { Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['minty', 'anise-like', 'complex'],
    season: ['summer', 'fall'],
    category: 'herb',
    subCategory: 'fresh',
    varieties: ['green', 'purple', 'curly'],
    affinities: ['korean cuisine', 'japanese cuisine', 'fish', 'soups', 'pickles'],
    cookingMethods: ['raw', 'pickled', 'wrapped', 'tempura'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['k', 'c'],
      minerals: ['calcium', 'iron'],
      antioxidants: ['anthocyanins', 'flavonoids'],
      volatileOils: ['perillaldehyde', 'limonene']
    },
    preparation: {
      washing: 'gentle rinse',
      usage: 'whole leaves or shredded',
      timing: 'typically used raw',
      notes: 'Purple variety has stronger flavor'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '3-5 days',
      method: 'wrapped in damp paper towel',
      notes: 'Delicate - use quickly'
    },
    medicinalProperties: {
      actions: ['anti-inflammatory', 'respiratory aid'],
      preparations: ['fresh', 'pickled'],
      cautions: ['may cause allergic reactions']
    }
  },

  'culantro': {
    elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
    qualities: ['pungent', 'cilantro-like', 'intense'],
    season: ['summer'],
    category: 'herb',
    subCategory: 'fresh',
    affinities: ['caribbean cuisine', 'latin american cuisine', 'soups', 'stews', 'marinades'],
    cookingMethods: ['cooked', 'raw', 'sauce'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['a', 'b-complex'],
      minerals: ['iron', 'calcium'],
      antioxidants: ['carotenoids', 'flavonoids'],
      volatileOils: ['dodecenal', 'decanal']
    },
    preparation: {
      washing: 'thorough rinse',
      chopping: 'fine chop',
      timing: 'add during cooking',
      notes: 'Stronger than cilantro'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '1 week',
      method: 'wrapped in damp paper towel',
      notes: 'Can be frozen'
    },
    medicinalProperties: {
      actions: ['digestive aid', 'anti-inflammatory'],
      preparations: ['fresh', 'tea'],
      cautions: ['may cause skin sensitivity']
    }
  },

  'huacatay': {
    elementalProperties: { Earth: 0.4, Air: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ['pungent', 'minty', 'complex'],
    season: ['summer', 'fall'],
    category: 'herb',
    subCategory: 'fresh',
    affinities: ['peruvian cuisine', 'potatoes', 'sauces', 'stews', 'cheese'],
    cookingMethods: ['sauce', 'paste', 'cooked'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['a', 'c'],
      minerals: ['iron', 'magnesium'],
      antioxidants: ['flavonoids', 'terpenes'],
      volatileOils: ['ocimene', 'tagetone']
    },
    preparation: {
      washing: 'gentle rinse',
      chopping: 'fine chop',
      timing: 'add during cooking',
      notes: 'Essential for Peruvian black mint sauce'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '4-5 days',
      method: 'wrapped in damp paper towel',
      notes: 'Freezes well as paste'
    },
    medicinalProperties: {
      actions: ['digestive aid', 'anti-parasitic'],
      preparations: ['fresh', 'paste'],
      cautions: ['use sparingly - strong flavor']
    }
  },

  'rosemary': {
    elementalProperties: { Fire: 0.5, Air: 0.2, Earth: 0.2, Water: 0.1 },
    qualities: ['piney', 'robust', 'aromatic'],
    season: ['year-round'],
    category: 'herb',
    subCategory: 'fresh',
    varieties: ['upright', 'creeping', 'tuscan blue'],
    affinities: ['lamb', 'chicken', 'potatoes', 'bread', 'mediterranean cuisine'],
    cookingMethods: ['roasted', 'grilled', 'infused', 'baked'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['a', 'c', 'b6'],
      minerals: ['iron', 'calcium'],
      antioxidants: ['carnosic acid', 'rosmarinic acid'],
      volatileOils: ['pinene', 'camphor']
    },
    preparation: {
      washing: 'quick rinse',
      stripping: 'pull leaves against stem growth',
      timing: 'add early in cooking',
      notes: 'Woody stems can be used as skewers'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '10-14 days',
      method: 'wrapped in damp paper towel',
      notes: 'Can be dried or frozen'
    },
    medicinalProperties: {
      actions: ['memory enhancement', 'antimicrobial'],
      preparations: ['tea', 'infused oil'],
      cautions: ['may affect blood pressure']
    }
  },

  'sage': {
    elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
    qualities: ['earthy', 'musty', 'warming'],
    season: ['year-round'],
    category: 'herb',
    subCategory: 'fresh',
    varieties: ['common', 'purple', 'pineapple', 'tricolor'],
    affinities: ['poultry', 'pork', 'sausage', 'stuffing', 'butter'],
    cookingMethods: ['fried', 'infused', 'roasted', 'sautéed'],
    conversionRatio: '3:1',
    nutritionalProfile: {
      vitamins: ['k', 'b6'],
      minerals: ['calcium', 'magnesium'],
      antioxidants: ['rosmarinic acid', 'carnosol'],
      volatileOils: ['thujone', 'camphor']
    },
    preparation: {
      washing: 'gentle rinse',
      drying: 'pat completely dry',
      timing: 'add during cooking',
      notes: 'Can be fried for garnish'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      method: 'wrapped in damp paper towel',
      notes: 'Leaves bruise easily'
    },
    medicinalProperties: {
      actions: ['antimicrobial', 'memory aid'],
      preparations: ['tea', 'tincture'],
      cautions: ['avoid during pregnancy']
    }
  }
};

export default freshHerbs;