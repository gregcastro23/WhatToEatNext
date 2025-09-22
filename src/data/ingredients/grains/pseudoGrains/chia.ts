import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawChia: Record<string, Partial<IngredientMapping>> = {
  chia: {
    name: 'Chia Seeds',
    elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Neptune', 'Moon'],
      elementalAffinity: {
        base: 'Water',
        secondary: 'Earth'
      }
    },
    qualities: ['gelatinous', 'hydrophilic', 'versatile', 'gluten-free', 'omega-rich'],
    category: 'pseudo_grain',
    origin: ['Central America', 'Mexico', 'Guatemala'],
    varieties: {},
    preparation: {
      fresh: {
        duration: 'No cooking required, soak 10-20 minutes for gel',
        storage: 'Refrigerate prepared chia for 5-7 days',
        tips: [
          'Use 1:6 chia to liquid ratio for gel',
          'Stir after adding to liquid to prevent clumping',
          'Can be used directly in baking without soaking'
        ]
      },
      methods: ['soaked', 'ground', 'raw sprinkled', 'incorporated into batter']
    },
    storage: {
      container: 'Airtight container',
      duration: 'Up to 2 years (dry), 5-7 days (prepared)',
      temperature: 'Cool, dark place (dry), refrigerated (prepared)',
      notes: 'High oil content, but surprisingly shelf-stable when kept dry'
    },
    pairingRecommendations: {
      complementary: ['fruits', 'yogurt', 'oats', 'honey', 'cinnamon', 'almond milk', 'coconut'],
      contrasting: ['citrus', 'spices', 'chocolate'],
      toAvoid: ['high-acid marinades that might break down the gel structure']
    }
  }
};

export const chia: Record<string, IngredientMapping> = fixIngredientMappings(rawChia)
