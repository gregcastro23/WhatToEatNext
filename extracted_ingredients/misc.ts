import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

// Misc ingredients extracted from cuisine files
const rawMisc: Record<string, Partial<IngredientMapping>> = {
  flour: {
    name: 'flour',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  sugar: {
    name: 'sugar',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  rice: {
    name: 'rice',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  tomato_paste: {
    name: 'tomato paste',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  onions: {
    name: 'onions',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  bell_peppers: {
    name: 'bell peppers',
    elementalProperties: { Fire: 0.45, Water: 0.15, Earth: 0.2, Air: 0.2 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  garlic: {
    name: 'garlic',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  ginger: {
    name: 'ginger',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  milk: {
    name: 'milk',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  eggs: {
    name: 'eggs',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  all_purpose_flour: {
    name: 'all-purpose flour',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  buttermilk: {
    name: 'buttermilk',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  butter: {
    name: 'butter',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  maple_syrup: {
    name: 'maple syrup',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  baking_powder: {
    name: 'baking powder',
    elementalProperties: { Fire: 0.24, Water: 0.14, Earth: 0.33, Air: 0.29 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  whole_grain_bread: {
    name: 'whole grain bread',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  avocado: {
    name: 'avocado',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  lemon_juice: {
    name: 'lemon juice',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  red_pepper_flakes: {
    name: 'red pepper flakes',
    elementalProperties: { Fire: 0.45, Water: 0.15, Earth: 0.2, Air: 0.2 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  microgreens: {
    name: 'microgreens',
    elementalProperties: { Fire: 0.18, Water: 0.32, Earth: 0.18, Air: 0.32 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  pork_sausage: {
    name: 'pork sausage',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  black_pepper: {
    name: 'black pepper',
    elementalProperties: { Fire: 0.45, Water: 0.15, Earth: 0.2, Air: 0.2 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  asparagus: {
    name: 'asparagus',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  fresh_peas: {
    name: 'fresh peas',
    elementalProperties: { Fire: 0.18, Water: 0.32, Earth: 0.18, Air: 0.32 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  green_onions: {
    name: 'green onions',
    elementalProperties: { Fire: 0.18, Water: 0.32, Earth: 0.18, Air: 0.32 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  goat_cheese: {
    name: 'goat cheese',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  fresh_herbs: {
    name: 'fresh herbs',
    elementalProperties: { Fire: 0.18, Water: 0.32, Earth: 0.18, Air: 0.32 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  mixed_berries: {
    name: 'mixed berries',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  banana: {
    name: 'banana',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  greek_yogurt: {
    name: 'greek yogurt',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  honey: {
    name: 'honey',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  granola: {
    name: 'granola',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  chia_seeds: {
    name: 'chia seeds',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  steel_cut_oats: {
    name: 'steel-cut oats',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  pumpkin_puree: {
    name: 'pumpkin puree',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  cinnamon: {
    name: 'cinnamon',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  nutmeg: {
    name: 'nutmeg',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  pecans: {
    name: 'pecans',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  cranberries: {
    name: 'cranberries',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  orange_zest: {
    name: 'orange zest',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  walnuts: {
    name: 'walnuts',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  ground_beef: {
    name: 'ground beef',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  hamburger_buns: {
    name: 'hamburger buns',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  cheddar_cheese: {
    name: 'cheddar cheese',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  lettuce: {
    name: 'lettuce',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  tomato: {
    name: 'tomato',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  onion: {
    name: 'onion',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  ketchup: {
    name: 'ketchup',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  mustard: {
    name: 'mustard',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  romaine_lettuce: {
    name: 'romaine lettuce',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  grilled_chicken: {
    name: 'grilled chicken',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  bacon: {
    name: 'bacon',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  hard_boiled_eggs: {
    name: 'hard-boiled eggs',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  blue_cheese: {
    name: 'blue cheese',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  cherry_tomatoes: {
    name: 'cherry tomatoes',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  red_wine_vinaigrette: {
    name: 'red wine vinaigrette',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  clams: {
    name: 'clams',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  potatoes: {
    name: 'potatoes',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  celery: {
    name: 'celery',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  heavy_cream: {
    name: 'heavy cream',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  clam_juice: {
    name: 'clam juice',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  thyme: {
    name: 'thyme',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  puff_pastry: {
    name: 'puff pastry',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  lemon_zest: {
    name: 'lemon zest',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  fresh_thyme: {
    name: 'fresh thyme',
    elementalProperties: { Fire: 0.18, Water: 0.32, Earth: 0.18, Air: 0.32 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  lobster_meat: {
    name: 'lobster meat',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  mayonnaise: {
    name: 'mayonnaise',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  split_top_buns: {
    name: 'split-top buns',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  sliced_turkey: {
    name: 'sliced turkey',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  cranberry_sauce: {
    name: 'cranberry sauce',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  stuffing: {
    name: 'stuffing',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  sage: {
    name: 'sage',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  russet_potatoes: {
    name: 'russet potatoes',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  sour_cream: {
    name: 'sour cream',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  pork_ribs: {
    name: 'pork ribs',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  bbq_sauce: {
    name: 'BBQ sauce',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  brown_sugar: {
    name: 'brown sugar',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  paprika: {
    name: 'paprika',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  garlic_powder: {
    name: 'garlic powder',
    elementalProperties: { Fire: 0.24, Water: 0.14, Earth: 0.33, Air: 0.29 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  breadcrumbs: {
    name: 'breadcrumbs',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  chicken_pieces: {
    name: 'chicken pieces',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  vegetable_oil: {
    name: 'vegetable oil',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  cold_butter: {
    name: 'cold butter',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  arborio_rice: {
    name: 'arborio rice',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  lamb_chops: {
    name: 'lamb chops',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  fresh_mint: {
    name: 'fresh mint',
    elementalProperties: { Fire: 0.18, Water: 0.32, Earth: 0.18, Air: 0.32 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  white_wine: {
    name: 'white wine',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  parmesan: {
    name: 'parmesan',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  salmon_fillet: {
    name: 'salmon fillet',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  cedar_plank: {
    name: 'cedar plank',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  corn_on_the_cob: {
    name: 'corn on the cob',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  zucchini: {
    name: 'zucchini',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  lemon: {
    name: 'lemon',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  beef_chuck_roast: {
    name: 'beef chuck roast',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  carrots: {
    name: 'carrots',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  parsnips: {
    name: 'parsnips',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  red_wine: {
    name: 'red wine',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  whole_turkey: {
    name: 'whole turkey',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  bread_stuffing: {
    name: 'bread stuffing',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  fresh_sage: {
    name: 'fresh sage',
    elementalProperties: { Fire: 0.18, Water: 0.32, Earth: 0.18, Air: 0.32 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  turkey_stock: {
    name: 'turkey stock',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  apples: {
    name: 'apples',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  white_sugar: {
    name: 'white sugar',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  chocolate_chips: {
    name: 'chocolate chips',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  cream_cheese: {
    name: 'cream cheese',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  graham_crackers: {
    name: 'graham crackers',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  vanilla_extract: {
    name: 'vanilla extract',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  fresh_strawberries: {
    name: 'fresh strawberries',
    elementalProperties: { Fire: 0.18, Water: 0.32, Earth: 0.18, Air: 0.32 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  chocolate_ice_cream: {
    name: 'chocolate ice cream',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  marshmallows: {
    name: 'marshmallows',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  chocolate_sauce: {
    name: 'chocolate sauce',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  sea_salt: {
    name: 'sea salt',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  pie_crust: {
    name: 'pie crust',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  evaporated_milk: {
    name: 'evaporated milk',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  molasses: {
    name: 'molasses',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  water: {
    name: 'Water',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  baking_soda: {
    name: 'baking soda',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  salt: {
    name: 'salt',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  soybeans: {
    name: 'soybeans',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  soft_tofu: {
    name: 'soft tofu',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  har_gow__shrimp_dumplings_: {
    name: 'har gow (shrimp dumplings)',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  siu_mai__pork_dumplings_: {
    name: 'siu mai (pork dumplings)',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  char_siu_bao: {
    name: 'char siu bao',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  cheong_fun__rice_noodle_rolls_: {
    name: 'cheong fun (rice noodle rolls)',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  spring_rolls: {
    name: 'spring rolls',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  whole_duck: {
    name: 'whole duck',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  pastry_dough: {
    name: 'pastry dough',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  glutinous_rice: {
    name: 'glutinous rice',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  red_bean_paste: {
    name: 'red bean paste',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  dried_fruits: {
    name: 'dried fruits',
    elementalProperties: { Fire: 0.24, Water: 0.14, Earth: 0.33, Air: 0.29 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Venus'],
      favorableZodiac: ['Virgo', 'Gemini', 'Taurus'],
      seasonalAffinity: ['all']
    }
  },
  nuts: {
    name: 'nuts',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  ripe_mangoes: {
    name: 'ripe mangoes',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  butter_croissant: {
    name: 'butter croissant',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  french_butter: {
    name: 'French butter',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  strawberry_preserves: {
    name: 'strawberry preserves',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  coffee: {
    name: 'coffee',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  whole_milk: {
    name: 'whole milk',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  fresh_eggs: {
    name: 'fresh eggs',
    elementalProperties: { Fire: 0.18, Water: 0.32, Earth: 0.18, Air: 0.32 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  cr_me_fra_che: {
    name: 'crème fraîche',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  fine_herbs: {
    name: 'fine herbs',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  unsalted_butter: {
    name: 'unsalted butter',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  white_pepper: {
    name: 'white pepper',
    elementalProperties: { Fire: 0.45, Water: 0.15, Earth: 0.2, Air: 0.2 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  rustic_bread: {
    name: 'rustic bread',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  brioche: {
    name: 'brioche',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  vanilla_bean: {
    name: 'vanilla bean',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  granulated_sugar: {
    name: 'granulated sugar',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  clarified_butter: {
    name: 'clarified butter',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  white_sandwich_bread: {
    name: 'white sandwich bread',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  white_ham: {
    name: 'white ham',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  gruy_re_cheese: {
    name: 'Gruyère cheese',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  b_chamel_sauce: {
    name: 'béchamel sauce',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  oil_packed_tuna: {
    name: 'oil-packed tuna',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  green_beans: {
    name: 'green beans',
    elementalProperties: { Fire: 0.18, Water: 0.32, Earth: 0.18, Air: 0.32 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  tomatoes: {
    name: 'tomatoes',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  ni_oise_olives: {
    name: 'Niçoise olives',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  anchovies: {
    name: 'anchovies',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  vinaigrette: {
    name: 'vinaigrette',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  yellow_onions: {
    name: 'yellow onions',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  beef_stock: {
    name: 'beef stock',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  baguette: {
    name: 'baguette',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  dry_white_wine: {
    name: 'dry white wine',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  bay_leaf: {
    name: 'bay leaf',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  chicken: {
    name: 'chicken',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  lardons: {
    name: 'lardons',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  cremini_mushrooms: {
    name: 'cremini mushrooms',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  pearl_onions: {
    name: 'pearl onions',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  bouquet_garni: {
    name: 'bouquet garni',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  cognac: {
    name: 'cognac',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  sole_fillets: {
    name: 'sole fillets',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  flat_leaf_parsley: {
    name: 'flat-leaf parsley',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  beef_chuck: {
    name: 'beef chuck',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  yellow_onion: {
    name: 'yellow onion',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  bacon_or_pancetta: {
    name: 'bacon or pancetta',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  egg_yolks: {
    name: 'egg yolks',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  sugar_for_caramelizing: {
    name: 'sugar for caramelizing',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  shortcrust_pastry: {
    name: 'shortcrust pastry',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  choux_pastry: {
    name: 'choux pastry',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  vanilla_ice_cream: {
    name: 'vanilla ice cream',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  dark_chocolate: {
    name: 'dark chocolate',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  pork: {
    name: 'pork',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  olive_oil: {
    name: 'olive oil',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  oregano: {
    name: 'oregano',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  cucumber: {
    name: 'cucumber',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  red_onion: {
    name: 'red onion',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  green_peppers: {
    name: 'green peppers',
    elementalProperties: { Fire: 0.36, Water: 0.23, Earth: 0.14, Air: 0.27 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  parsley: {
    name: 'parsley',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  mint: {
    name: 'mint',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  eggplants: {
    name: 'eggplants',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  grape_leaves: {
    name: 'grape leaves',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  dill: {
    name: 'dill',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  phyllo_dough: {
    name: 'phyllo dough',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  semolina: {
    name: 'semolina',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  white_beans: {
    name: 'white beans',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  chickpeas: {
    name: 'chickpeas',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  bay_leaves: {
    name: 'bay leaves',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  lemons: {
    name: 'lemons',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  rosemary: {
    name: 'rosemary',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  white_wine_vinegar: {
    name: 'white wine vinegar',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  almonds: {
    name: 'almonds',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  idli_rice: {
    name: 'idli rice',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  urad_dal: {
    name: 'urad dal',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  toor_dal: {
    name: 'toor dal',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  sambar_powder: {
    name: 'sambar powder',
    elementalProperties: { Fire: 0.24, Water: 0.14, Earth: 0.33, Air: 0.29 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  vegetables: {
    name: 'vegetables',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  coconut_chutney: {
    name: 'coconut chutney',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  flattened_rice: {
    name: 'flattened rice',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  peanuts: {
    name: 'peanuts',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  curry_leaves: {
    name: 'curry leaves',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  mustard_seeds: {
    name: 'mustard seeds',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  turmeric: {
    name: 'turmeric',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  green_chilies: {
    name: 'green chilies',
    elementalProperties: { Fire: 0.36, Water: 0.23, Earth: 0.14, Air: 0.27 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  yellow_lentils: {
    name: 'yellow lentils',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  black_lentils: {
    name: 'black lentils',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  kidney_beans: {
    name: 'kidney beans',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  basmati_rice: {
    name: 'basmati rice',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  spinach: {
    name: 'spinach',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  yogurt: {
    name: 'yogurt',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  tea_bags: {
    name: 'tea bags',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  chole_masala: {
    name: 'chole masala',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  puri_shells: {
    name: 'puri shells',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  mint_leaves: {
    name: 'mint leaves',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  tamarind: {
    name: 'tamarind',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  black_salt: {
    name: 'black salt',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  chaat_masala: {
    name: 'chaat masala',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  sprouted_moong: {
    name: 'sprouted moong',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  large_eggplant: {
    name: 'large eggplant',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  cumin_seeds: {
    name: 'cumin seeds',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  garam_masala: {
    name: 'garam masala',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  cardamom: {
    name: 'cardamom',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  pistachios: {
    name: 'pistachios',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  saffron: {
    name: 'saffron',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  rose_water: {
    name: 'rose water',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  almond_granita: {
    name: 'almond granita',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  egg: {
    name: 'egg',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  tomato_sauce: {
    name: 'tomato sauce',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  mozzarella: {
    name: 'mozzarella',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  parmigiano_reggiano: {
    name: 'Parmigiano-Reggiano',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  fresh_basil: {
    name: 'fresh basil',
    elementalProperties: { Fire: 0.18, Water: 0.32, Earth: 0.18, Air: 0.32 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  eggplant: {
    name: 'eggplant',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  mascarpone: {
    name: 'mascarpone',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  steamed_rice: {
    name: 'steamed rice',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  natto: {
    name: 'natto',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  sushi_rice: {
    name: 'sushi rice',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  umeboshi: {
    name: 'umeboshi',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  curry_roux: {
    name: 'curry roux',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  potato: {
    name: 'potato',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  carrot: {
    name: 'carrot',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  cabbage: {
    name: 'cabbage',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  dashi: {
    name: 'dashi',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  gyoza_wrappers: {
    name: 'gyoza wrappers',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  chicken_thigh: {
    name: 'chicken thigh',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  soy_sauce: {
    name: 'soy sauce',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  sake: {
    name: 'sake',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  potato_starch: {
    name: 'potato starch',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  short_grain_rice: {
    name: 'short grain rice',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  aged_kimchi: {
    name: 'aged kimchi',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  sliced_rice_cakes: {
    name: 'sliced rice cakes',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  pork_belly: {
    name: 'pork belly',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  lettuce_leaves: {
    name: 'lettuce leaves',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  perilla_leaves: {
    name: 'perilla leaves',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  ssamjang: {
    name: 'ssamjang',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  kimchi: {
    name: 'kimchi',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  gochugaru: {
    name: 'gochugaru',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  mushrooms: {
    name: 'mushrooms',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  beef_sirloin: {
    name: 'beef sirloin',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  asian_pear: {
    name: 'asian pear',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  sesame_oil: {
    name: 'sesame oil',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  rice_cakes: {
    name: 'rice cakes',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  sweet_potato: {
    name: 'sweet potato',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Venus'],
      favorableZodiac: ['Virgo', 'Gemini', 'Taurus'],
      seasonalAffinity: ['all']
    }
  },
  gochujang: {
    name: 'gochujang',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  pork_spine: {
    name: 'pork spine',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  bean_sprouts: {
    name: 'bean sprouts',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  napa_cabbage: {
    name: 'napa cabbage',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  saeujeot: {
    name: 'saeujeot',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  radish_kimchi: {
    name: 'radish kimchi',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  shaved_ice: {
    name: 'shaved ice',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  rice_flour: {
    name: 'rice flour',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  sesame_seeds: {
    name: 'sesame seeds',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  pine_needles: {
    name: 'pine needles',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  sweet_potato_noodles: {
    name: 'sweet potato noodles',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Venus'],
      favorableZodiac: ['Virgo', 'Gemini', 'Taurus'],
      seasonalAffinity: ['all']
    }
  },
  mixed_fruits: {
    name: 'mixed fruits',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Venus'],
      favorableZodiac: ['Virgo', 'Gemini', 'Taurus'],
      seasonalAffinity: ['all']
    }
  },
  dried_hominy: {
    name: 'dried hominy',
    elementalProperties: { Fire: 0.24, Water: 0.14, Earth: 0.33, Air: 0.29 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  mixed_dried_chiles: {
    name: 'mixed dried chiles',
    elementalProperties: { Fire: 0.24, Water: 0.14, Earth: 0.33, Air: 0.29 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  chocolate: {
    name: 'chocolate',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  poblano_chiles: {
    name: 'poblano chiles',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  masa_harina: {
    name: 'masa harina',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  fresh_fruit: {
    name: 'fresh fruit',
    elementalProperties: { Fire: 0.18, Water: 0.32, Earth: 0.18, Air: 0.32 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Venus'],
      favorableZodiac: ['Virgo', 'Gemini', 'Taurus'],
      seasonalAffinity: ['all']
    }
  },
  lime_juice: {
    name: 'lime juice',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  chili_powder: {
    name: 'chili powder',
    elementalProperties: { Fire: 0.43, Water: 0.05, Earth: 0.29, Air: 0.24 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  fava_beans: {
    name: 'fava beans',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  cumin: {
    name: 'cumin',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  lamb_shoulder: {
    name: 'lamb shoulder',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  jameed: {
    name: 'jameed',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  pine_nuts: {
    name: 'pine nuts',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  flatbread: {
    name: 'flatbread',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  brown_lentils: {
    name: 'brown lentils',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  dried_chickpeas: {
    name: 'dried chickpeas',
    elementalProperties: { Fire: 0.24, Water: 0.14, Earth: 0.33, Air: 0.29 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  cilantro: {
    name: 'cilantro',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  coriander: {
    name: 'coriander',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  kataifi_dough: {
    name: 'kataifi dough',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  cauliflower: {
    name: 'cauliflower',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  buckwheat_groats: {
    name: 'buckwheat groats',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  white_fish: {
    name: 'white fish',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  black_peppercorns: {
    name: 'black peppercorns',
    elementalProperties: { Fire: 0.45, Water: 0.15, Earth: 0.2, Air: 0.2 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  peas: {
    name: 'peas',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  pickles: {
    name: 'pickles',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  jasmine_rice: {
    name: 'jasmine rice',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  green_papaya: {
    name: 'green papaya',
    elementalProperties: { Fire: 0.18, Water: 0.32, Earth: 0.18, Air: 0.32 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  thai_chilies: {
    name: 'Thai chilies',
    elementalProperties: { Fire: 0.45, Water: 0.15, Earth: 0.2, Air: 0.2 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  glass_noodles: {
    name: 'glass noodles',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  long_beans: {
    name: 'long beans',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  rice_noodles: {
    name: 'rice noodles',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  red_syrup: {
    name: 'red syrup',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  green_syrup: {
    name: 'green syrup',
    elementalProperties: { Fire: 0.18, Water: 0.32, Earth: 0.18, Air: 0.32 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  palm_seeds: {
    name: 'palm seeds',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  red_beans: {
    name: 'red beans',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  grass_jelly: {
    name: 'grass jelly',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  sweet_corn: {
    name: 'sweet corn',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Venus'],
      favorableZodiac: ['Virgo', 'Gemini', 'Taurus'],
      seasonalAffinity: ['all']
    }
  },
  coconut_milk: {
    name: 'coconut milk',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  sticky_rice: {
    name: 'sticky rice',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  water_chestnuts: {
    name: 'water chestnuts',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  tapioca_flour: {
    name: 'tapioca flour',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  red_food_coloring: {
    name: 'red food coloring',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  palm_sugar: {
    name: 'palm sugar',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  jackfruit: {
    name: 'jackfruit',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Venus'],
      favorableZodiac: ['Virgo', 'Gemini', 'Taurus'],
      seasonalAffinity: ['all']
    }
  },
  crushed_ice: {
    name: 'crushed ice',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  glutinous_rice_flour: {
    name: 'glutinous rice flour',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  pandan_extract: {
    name: 'pandan extract',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  kabocha_pumpkin: {
    name: 'kabocha pumpkin',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  pandan_leaves: {
    name: 'pandan leaves',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  ripe_bananas: {
    name: 'ripe bananas',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  beef_bones: {
    name: 'beef bones',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  tapioca_starch: {
    name: 'tapioca starch',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  ground_pork: {
    name: 'ground pork',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  fish_sauce: {
    name: 'fish sauce',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  shallots: {
    name: 'shallots',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  herbs_mix: {
    name: 'herbs mix',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  lime: {
    name: 'lime',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  beef_shank: {
    name: 'beef shank',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  pork_knuckles: {
    name: 'pork knuckles',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  thick_rice_noodles: {
    name: 'thick rice noodles',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  lemongrass: {
    name: 'lemongrass',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  shrimp_paste: {
    name: 'shrimp paste',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  annatto_seeds: {
    name: 'annatto seeds',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  vietnamese_herbs: {
    name: 'Vietnamese herbs',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  banana_flower: {
    name: 'banana flower',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  broken_rice: {
    name: 'broken rice',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  pork_chops: {
    name: 'pork chops',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  pickled_vegetables: {
    name: 'pickled vegetables',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  mung_beans: {
    name: 'mung beans',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  pandan_jelly: {
    name: 'pandan jelly',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  tapioca_pearls: {
    name: 'tapioca pearls',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
  crushed_peanuts: {
    name: 'crushed peanuts',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  },
};

// Export processed ingredients
export const miscIngredients = fixIngredientMappings(rawMisc);
