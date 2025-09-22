import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawAmaranth = {
  amaranth: {
    name: 'Amaranth',
    elementalProperties: { Earth: 0.3, Fire: 0.3, Air: 0.2, Water: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Venus'],
      elementalAffinity: {
        base: 'Earth',
        secondary: 'Fire'
      }
    },
    qualities: ['nutty', 'earthy', 'gelatinous', 'gluten-free', 'protein-rich'],
    category: 'pseudo_grain',
    origin: ['Central America', 'Mexico', 'South America'],
    varieties: {
      regular: {
        appearance: 'Tiny cream-colored seeds',
        texture: 'Sticky when cooked, gelatinous',
        flavor: 'Earthy, nutty, slightly peppery',
        uses: 'Porridges, binding agent in dishes, flour for baking'
      }
    },
    preparation: {
      fresh: {
        duration: '20-25 minutes',
        storage: 'Refrigerate in sealed container for 2-3 days',
        tips: [
          'Use 1:3 amaranth to liquid ratio',
          'Simmer until liquid is absorbed',
          'Consider mixing with other grains as it can be sticky on its own'
        ]
      },
      methods: ['boiled', 'simmered', 'popped (dry in pan)', 'ground into flour']
    },
    storage: {
      container: 'Airtight container',
      duration: 'Up to 6 months (dry), 2-3 days (cooked)',
      temperature: 'Cool, dark place (dry), refrigerated (cooked)',
      notes: 'High oil content makes it spoil faster than other grains'
    },
    pairingRecommendations: {
      complementary: ['cinnamon', 'honey', 'fruits', 'mild cheeses', 'vegetables'],
      contrasting: ['herbs', 'light citrus'],
      toAvoid: ['strong acidic ingredients that might prevent proper cooking']
    }
  }
},

export const amaranth: Record<string, IngredientMapping> = fixIngredientMappings(rawAmaranth)
