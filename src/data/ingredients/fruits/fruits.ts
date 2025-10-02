import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

// Fruits ingredients extracted from cuisine files
const rawFruits: Record<string, Partial<IngredientMapping>> = {
  avocado: {
    name: 'avocado',
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    category: 'fruits',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
  lemon_juice: {
    name: 'lemon juice',
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    category: 'fruits',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
  banana: {
    name: 'banana',
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    category: 'fruits',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
  orange_zest: {
    name: 'orange zest',
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    category: 'fruits',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
  lemon_zest: {
    name: 'lemon zest',
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    category: 'fruits',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
  lemon: {
    name: 'lemon',
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    category: 'fruits',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
  apples: {
    name: 'apples',
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    category: 'fruits',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
  ripe_mangoes: {
    name: 'ripe mangoes',
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    category: 'fruits',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
  strawberry_preserves: {
    name: 'strawberry preserves',
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    category: 'fruits',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
  ni_oise_olives: {
    name: 'Niçoise olives',
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    category: 'fruits',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
  olive_oil: {
    name: 'olive oil',
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    category: 'fruits',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
  grape_leaves: {
    name: 'grape leaves',
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    category: 'fruits',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
  lemons: {
    name: 'lemons',
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    category: 'fruits',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
  coconut_chutney: {
    name: 'coconut chutney',
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    category: 'fruits',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
  lime_juice: {
    name: 'lime juice',
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    category: 'fruits',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
  coconut_milk: {
    name: 'coconut milk',
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    category: 'fruits',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
  ripe_bananas: {
    name: 'ripe bananas',
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    category: 'fruits',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
  lime: {
    name: 'lime',
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    category: 'fruits',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
  lemongrass: {
    name: 'lemongrass',
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    category: 'fruits',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
  banana_flower: {
    name: 'banana flower',
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    category: 'fruits',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Sun'],
      favorableZodiac: ['Taurus', 'Leo', 'Libra'],
      seasonalAffinity: ['summer']
    }
  },
};

// Export processed ingredients
export const fruitsIngredients = fixIngredientMappings(rawFruits);
