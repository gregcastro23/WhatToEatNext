import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

// Dairy ingredients extracted from cuisine files
const rawDairy: Record<string, Partial<IngredientMapping>> = {
  milk: {
    name: 'milk',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  buttermilk: {
    name: 'buttermilk',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  butter: {
    name: 'butter',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  goat_cheese: {
    name: 'goat cheese',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  greek_yogurt: {
    name: 'greek yogurt',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  cheddar_cheese: {
    name: 'cheddar cheese',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  blue_cheese: {
    name: 'blue cheese',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  heavy_cream: {
    name: 'heavy cream',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  sour_cream: {
    name: 'sour cream',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  cold_butter: {
    name: 'cold butter',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  parmesan: {
    name: 'parmesan',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  cream_cheese: {
    name: 'cream cheese',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  chocolate_ice_cream: {
    name: 'chocolate ice cream',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  evaporated_milk: {
    name: 'evaporated milk',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  butter_croissant: {
    name: 'butter croissant',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  french_butter: {
    name: 'French butter',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  whole_milk: {
    name: 'whole milk',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  unsalted_butter: {
    name: 'unsalted butter',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  clarified_butter: {
    name: 'clarified butter',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  gruy_re_cheese: {
    name: 'Gruyère cheese',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  vanilla_ice_cream: {
    name: 'vanilla ice cream',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  yogurt: {
    name: 'yogurt',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
  mozzarella: {
    name: 'mozzarella',
    elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    category: 'dairy',
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['Cancer', 'Taurus', 'Pisces'],
      seasonalAffinity: ['all']
    }
  },
};

// Export processed ingredients
export const dairyIngredients = fixIngredientMappings(rawDairy);
