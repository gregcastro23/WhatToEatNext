import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

// Spices ingredients extracted from cuisine files
const rawSpices: Record<string, Partial<IngredientMapping>> = {
  ginger: {
    name: 'ginger',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
  cinnamon: {
    name: 'cinnamon',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
  nutmeg: {
    name: 'nutmeg',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
  paprika: {
    name: 'paprika',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
  red_bean_paste: {
    name: 'red bean paste',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
  curry_leaves: {
    name: 'curry leaves',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
  mustard_seeds: {
    name: 'mustard seeds',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
  turmeric: {
    name: 'turmeric',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
  green_chilies: {
    name: 'green chilies',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
  chole_masala: {
    name: 'chole masala',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
  chaat_masala: {
    name: 'chaat masala',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
  cumin_seeds: {
    name: 'cumin seeds',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
  garam_masala: {
    name: 'garam masala',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
  cardamom: {
    name: 'cardamom',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
  saffron: {
    name: 'saffron',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
  curry_roux: {
    name: 'curry roux',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
  chili_powder: {
    name: 'chili powder',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
  cumin: {
    name: 'cumin',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
  coriander: {
    name: 'coriander',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
  thai_chilies: {
    name: 'Thai chilies',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
  shrimp_paste: {
    name: 'shrimp paste',
    elementalProperties: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    category: 'spices',
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo', 'Scorpio'],
      seasonalAffinity: ['winter']
    }
  },
};

// Export processed ingredients
export const spicesIngredients = fixIngredientMappings(rawSpices);
