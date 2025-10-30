import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

// Misc ingredients extracted from cuisine files
const rawMisc: Record<string, Partial<IngredientMapping>> = {
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
  puff_pastry {
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
  dried_fruits: {
    name: 'dried fruits',
    elementalProperties: { Fire: 0.24, Water: 0.14, Earth: 0.33, Air: 0.29 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
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
  shortcrust_pastry {
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
  choux_pastry {
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
  mixed_fruits: {
    name: 'mixed fruits',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: ['versatile', 'culinary'],
    category: 'misc',
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
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
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
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
};

// Export processed ingredients
export const miscIngredients = fixIngredientMappings(rawMisc);
