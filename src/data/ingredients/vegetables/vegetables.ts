import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

// Vegetables ingredients extracted from cuisine files
const rawVegetables: Record<string, Partial<IngredientMapping>> = {
  tomato_paste: {
    name: 'tomato paste',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  onions: {
    name: 'onions',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  bell_peppers: {
    name: 'bell peppers',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  garlic: {
    name: 'garlic',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  red_pepper_flakes: {
    name: 'red pepper flakes',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  black_pepper: {
    name: 'black pepper',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  asparagus: {
    name: 'asparagus',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  fresh_peas: {
    name: 'fresh peas',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  green_onions: {
    name: 'green onions',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  chia_seeds: {
    name: 'chia seeds',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  lettuce: {
    name: 'lettuce',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  tomato: {
    name: 'tomato',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  onion: {
    name: 'onion',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  romaine_lettuce: {
    name: 'romaine lettuce',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  cherry_tomatoes: {
    name: 'cherry tomatoes',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  potatoes: {
    name: 'potatoes',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  celery: {
    name: 'celery',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  russet_potatoes: {
    name: 'russet potatoes',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  garlic_powder: {
    name: 'garlic powder',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  corn_on_the_cob: {
    name: 'corn on the cob',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  zucchini: {
    name: 'zucchini',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  carrots: {
    name: 'carrots',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  parsnips: {
    name: 'parsnips',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  white_pepper: {
    name: 'white pepper',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  green_beans: {
    name: 'green beans',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  tomatoes: {
    name: 'tomatoes',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  yellow_onions: {
    name: 'yellow onions',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  cremini_mushrooms: {
    name: 'cremini mushrooms',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  pearl_onions: {
    name: 'pearl onions',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  yellow_onion: {
    name: 'yellow onion',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  cucumber: {
    name: 'cucumber',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  red_onion: {
    name: 'red onion',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  green_peppers: {
    name: 'green peppers',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  eggplants: {
    name: 'eggplants',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  chickpeas: {
    name: 'chickpeas',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  peanuts: {
    name: 'peanuts',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  spinach: {
    name: 'spinach',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  large_eggplant: {
    name: 'large eggplant',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  tomato_sauce: {
    name: 'tomato sauce',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  eggplant: {
    name: 'eggplant',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  potato: {
    name: 'potato',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  carrot: {
    name: 'carrot',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  cabbage: {
    name: 'cabbage',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  potato_starch: {
    name: 'potato starch',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  lettuce_leaves: {
    name: 'lettuce leaves',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  mushrooms: {
    name: 'mushrooms',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  asian_pear: {
    name: 'asian pear',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  sweet_potato: {
    name: 'sweet potato',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  napa_cabbage: {
    name: 'napa cabbage',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  radish_kimchi: {
    name: 'radish kimchi',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  sweet_potato_noodles: {
    name: 'sweet potato noodles',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  dried_chickpeas: {
    name: 'dried chickpeas',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  cauliflower: {
    name: 'cauliflower',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  black_peppercorns: {
    name: 'black peppercorns',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  peas: {
    name: 'peas',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  sweet_corn: {
    name: 'sweet corn',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  shallots: {
    name: 'shallots',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  tapioca_pearls: {
    name: 'tapioca pearls',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
  crushed_peanuts: {
    name: 'crushed peanuts',
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    category: 'vegetables',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['summer', 'fall']
    }
  },
};

// Export processed ingredients
export const vegetablesIngredients = fixIngredientMappings(rawVegetables);
