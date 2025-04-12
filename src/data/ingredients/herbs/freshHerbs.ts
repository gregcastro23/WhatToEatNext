import type { IngredientMapping } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawFreshHerbs: Record<string, Partial<IngredientMapping>> = {
  'basil': {
    name: 'Basil',
    elementalProperties: { Air: 0.4, Water: 0.3, Fire: 0.2, Earth: 0.1 },
    nutritionalProfile: {
      calories: 22,
      protein_g: 3.15,
      carbs_g: 2.65,
      fat_g: 0.64,
      fiber_g: 1.6,
      vitamins: ['k', 'a', 'c', 'manganese', 'folate', 'calcium', 'omega-3'],
      minerals: ['calcium', 'magnesium', 'potassium', 'iron']
    },
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Venus'],
      favorableZodiac: ['aries', 'libra', 'scorpio'],
      elementalAffinity: {
        base: 'Air',
        secondary: 'Fire',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercury' },
          second: { element: 'Fire', planet: 'Mars' },
          third: { element: 'Water', planet: 'Venus' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Air: 0.1, Water: 0.05 },
          preparationTips: ['Collect seeds', 'Start new plants']
        },
        fullMoon: {
          elementalBoost: { Air: 0.2, Fire: 0.1 },
          preparationTips: ['Harvest at peak flavor', 'Make preserves and infusions']
        }
      },
      aspectEnhancers: ['Mars trine Venus', 'Mercury in Libra']
    },
    qualities: ['warming', 'sweet', 'aromatic', 'uplifting', 'clarifying'],
    origin: ['India', 'Mediterranean', 'Southeast Asia'],
    season: ['summer', 'early fall'],
    category: 'herb',
    subCategory: 'fresh',
    potency: 7,
    varieties: {
      'sweet_basil': {
        name: 'Sweet Basil (Genovese)',
        scientific: 'Ocimum basilicum',
        appearance: 'bright green, rounded leaves',
        flavor: 'sweet, clove-like, mild anise',
        uses: 'Italian cuisine, pesto, tomato dishes, infused oils',
        notes: 'Most common culinary variety'
      },
      'thai_basil': {
        name: 'Thai Basil',
        scientific: 'Ocimum basilicum var. thyrsiflora',
        appearance: 'purple stems, narrow leaves',
        flavor: 'anise-licorice, spicy, stable when cooked',
        uses: 'Southeast Asian cuisine, stir-fries, soups, curries',
        notes: 'Holds flavor well under high heat'
      },
      'holy_basil': {
        name: 'Holy Basil (Tulsi)',
        scientific: 'Ocimum sanctum',
        appearance: 'fuzzy stems, jagged leaf edges',
        flavor: 'peppery, clove-like, more intense',
        uses: 'religious ceremonies, medicinal teas, Thai cuisine',
        notes: 'Sacred in Hinduism, powerful adaptogen'
      },
      'lemon_basil': {
        name: 'Lemon Basil',
        scientific: 'Ocimum citriodorum',
        appearance: 'light green leaves, compact plant',
        flavor: 'bright citrus notes, mild basil flavor',
        uses: 'Southeast Asian cuisine, fish dishes, desserts, beverages',
        notes: 'Excellent with seafood and in fruity applications'
      },
      'purple_basil': {
        name: 'Purple Basil',
        scientific: 'Ocimum basilicum purpurascens',
        appearance: 'deep purple leaves and stems',
        flavor: 'more intense than sweet basil, slightly clove-like',
        uses: 'visual accent, infused vinegars, garnish',
        notes: 'Beautiful color that turns gray when cooked'
      },
      'cinnamon_basil': {
        name: 'Cinnamon Basil',
        scientific: 'Ocimum basilicum "Cinnamon"',
        appearance: 'green leaves, purple-tinted stems',
        flavor: 'distinct cinnamon notes, spicy',
        uses: 'fruit salads, baked goods, teas',
        notes: 'Excellent bridge between sweet and savory applications'
      }
    },
    affinities: [
      'tomato', 'mozzarella', 'garlic', 'olive oil', 'lemon', 
      'pine nuts', 'pasta', 'strawberries', 'peaches', 
      'balsamic vinegar', 'eggplant', 'zucchini', 'bell peppers'
    ],
    cookingMethods: ['raw', 'infused', 'pesto', 'garnish', 'stir-fried', 'baked', 'blanched', 'dried'],
    conversionRatio: '3:1', // 3 parts fresh = 1 part dried
    culinaryApplications: {
      'pesto': {
        name: 'Pesto',
        method: 'ground with olive oil and other ingredients',
        ingredients: ['basil', 'pine nuts', 'garlic', 'parmesan', 'olive oil', 'salt'],
        techniques: 'bruise lightly before processing, use promptly to prevent oxidation',
        regional_variations: {
          'genovese': 'classic with pine nuts and parmigiano-reggiano',
          'sicilian': 'with almonds and tomatoes',
          'french': 'with walnuts (pistou, no cheese)'
        },
        notes: 'Can be frozen in ice cube trays for portion control'
      },
      'infused_oil': {
        name: 'Infused Oil',
        method: 'steeped in warm oil',
        timing: 'gentle heat for 10-15 minutes, then cool',
        applications: ['dipping oil', 'salad dressing base', 'drizzling'],
        notes: 'Add acid or refrigerate to prevent botulism risk'
      },
      'garnish': {
        name: 'Garnish',
        method: 'raw leaves',
        applications: ['soups', 'pasta', 'pizza', 'cocktails'],
        techniques: 'tear larger leaves, add at last moment',
        notes: 'Chiffonade technique prevents bruising'
      },
      'tomato_dishes': {
        name: 'Tomato Dishes',
        method: 'both cooked and raw',
        applications: ['caprese salad', 'pasta sauce', 'soups', 'bruschetta'],
        techniques: 'add early for cooked dishes, late for fresh flavor',
        notes: 'Classic pairing that balances acidity'
      },
      'stir_fry': {
        name: 'Stir Fry',
        method: 'quick cooking over high heat',
        applications: ['Thai curries', 'noodle dishes', 'stir-fried vegetables'],
        techniques: 'add in final 30-60 seconds of cooking',
        notes: 'Thai basil preferred for stable flavor'
      },
      'desserts': {
        name: 'Desserts',
        method: 'infused into cream or paired with fruit',
        applications: ['ice cream', 'panna cotta', 'fruit salads', 'sorbets'],
        techniques: 'steep in warm dairy, remove before cooling',
        notes: 'Sweet and lemon basil varieties work best'
      }
    }
  },

  'parsley': {
    name: 'Parsley',
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    },
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
      volatileoils: ['myristicin', 'apiol']
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
    name: 'Cilantro',
    elementalProperties: { Air: 0.5, Water: 0.2, Fire: 0.2, Earth: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    },
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
      volatileoils: ['linalool', 'decanal']
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
    name: 'Mint',
    elementalProperties: { Air: 0.4, Water: 0.3, Fire: 0.2, Earth: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    },
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
      volatileoils: ['menthol', 'menthone']
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
    name: 'Chives',
    elementalProperties: { Air: 0.4, Water: 0.3, Fire: 0.2, Earth: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    },
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
      volatileoils: ['allyl sulfides']
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
    name: 'Thyme',
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    },
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
      volatileoils: ['thymol', 'linalool']
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
    name: 'Oregano',
    elementalProperties: { Fire: 0.5, Air: 0.2, Earth: 0.2, Water: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    },
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
      volatileoils: ['carvacrol', 'thymol']
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
    name: 'Marjoram',
    elementalProperties: { Air: 0.4, Earth: 0.3, Fire: 0.2, Water: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    },
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
      volatileoils: ['sabinene', 'terpinene']
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
    name: 'Lemon Verbena',
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
      volatileoils: ['citral', 'limonene'],
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
    name: 'Lovage',
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
      volatileoils: ['phthalides']
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
    name: 'Summer Savory',
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
      volatileoils: ['carvacrol', 'thymol']
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
    name: 'Dill',
    elementalProperties: { Air: 0.5, Water: 0.2, Earth: 0.2, Fire: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    },
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
      volatileoils: ['carvone', 'limonene']
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
    name: 'Tarragon',
    elementalProperties: { Fire: 0.3, Air: 0.3, Earth: 0.2, Water: 0.2 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    },
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
      volatileoils: ['estragole', 'ocimene']
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
    name: 'Lemongrass',
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
      volatileoils: ['citral', 'geraniol']
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
    name: 'Thai Basil',
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
      volatileoils: ['methyl chavicol', 'eugenol']
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
    name: 'Epazote',
    elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    },
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
      volatileoils: ['ascaridole', 'carvacrol']
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
    name: 'Shiso',
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
      volatileoils: ['perillyl alcohol', 'limonene']
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
    name: 'Curry Leaves',
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
      volatileoils: ['linalool', 'pinene']
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
    name: 'Rau Ram',
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
      volatileoils: ['dodecenal', 'decanal']
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
    name: 'Za Atar Herb',
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
      volatileoils: ['thymol', 'p-cymene']
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
    name: 'Perilla',
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
      volatileoils: ['perillaldehyde', 'limonene']
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
    name: 'Culantro',
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
      volatileoils: ['dodecenal', 'decanal']
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
    name: 'Huacatay',
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
      volatileoils: ['ocimene', 'tagetone']
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
    name: 'Rosemary',
    elementalProperties: { Fire: 0.5, Air: 0.2, Earth: 0.2, Water: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    },
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
      volatileoils: ['pinene', 'camphor']
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
    name: 'Sage',
    elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    },
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
      volatileoils: ['thujone', 'camphor']
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
  },

  'lemon_balm': {
    name: 'Lemon Balm',
    elementalProperties: { 
      Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1
    },
    category: 'culinary_herb',
    qualities: ['nourishing'],
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    }
  },
  'fennel': {
    name: 'Fennel',
    elementalProperties: { 
      Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1
    },
    category: 'culinary_herb',
    qualities: ['nourishing'],
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    }
  },
  'chervil': {
    name: 'Chervil',
    elementalProperties: { 
      Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1
    },
    category: 'culinary_herb',
    qualities: ['nourishing'],
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    }
  },
  'bay_leaf': {
    name: 'Bay Leaf',
    elementalProperties: { 
      Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1
    },
    category: 'culinary_herb',
    qualities: ['nourishing'],
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    }
  },
  'anise': {
    name: 'Anise',
    elementalProperties: { 
      Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1
    },
    category: 'culinary_herb',
    qualities: ['nourishing'],
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    }
  },
}

// Fix the ingredient mappings to ensure they have all required properties
export const freshHerbs: Record<string, IngredientMapping> = fixIngredientMappings(rawFreshHerbs);

export default freshHerbs;