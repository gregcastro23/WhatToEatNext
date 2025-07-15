import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawQuinoa = {
  'quinoa': {
    name: 'Quinoa',
    elementalProperties: { Earth: 0.3, Water: 0.2, Air: 0.3, Fire: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ['Mercury'],
      elementalAffinity: {
        base: 'Earth',
        secondary: 'Air'
      }
    },
    qualities: ['nutty', 'fluffy', 'versatile', 'complete protein', 'gluten-free'],
    category: 'pseudo_grain',
    origin: ['South America', 'Andean region', 'Peru', 'Bolivia', 'Ecuador'],
    varieties: {
      
      
      
      'rainbow': {
        appearance: 'Mix of white, red, and black',
        texture: 'Varied',
        flavor: 'Balanced mix',
        characteristics: 'Mix of all three types',
        uses: 'Colorful presentations, all-purpose cooking'
      }
    },
    preparation: {
      fresh: {
        duration: '15-20 minutes',
        storage: 'Refrigerate in sealed container for 3-5 days',
        tips: [
          'Rinse well to remove saponins (bitter coating)',
          'Toast before cooking for nuttier flavor',
          'Add salt after cooking to prevent toughening'
        ]
      },
      methods: [
        'boiled', 'steamed', 'toasted', 'sprouted', 'pressure cooked', 'baked'
      ]
    },
    storage: {
      container: 'Airtight container',
      duration: 'Up to 2 years (dry), 3-5 days (cooked)',
      temperature: 'Cool, dark place (dry), refrigerated (cooked)',
      notes: 'Can be frozen for up to 8 months when completely cooled'
    },
    pairingRecommendations: {
      complementary: ['lemon', 'lime', 'herbs', 'nuts', 'dried fruits', 'avocado', 'cucumber', 'bell pepper'],
      contrasting: ['strong cheeses', 'spicy chiles', 'fermented foods'],
      toAvoid: ['overpowering sauces', 'very wet preparations that might make it soggy']
    }
  }
};

export const quinoa: Record<string, IngredientMapping> = fixIngredientMappings(rawQuinoa); 