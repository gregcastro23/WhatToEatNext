import type { IngredientMapping } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawBuckwheat: Record<string, Partial<IngredientMapping>> = {
  'buckwheat': {
    name: 'Buckwheat',
    elementalProperties: { Earth: 0.4, Water: 0.1, Air: 0.2, Fire: 0.3 },
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mars'],
      elementalAffinity: {
        base: 'earth',
        secondary: 'fire'
      }
    },
    qualities: ['earthy', 'robust', 'gluten-free', 'hearty', 'nutty'],
    category: 'pseudo_grain',
    origin: ['Central Asia', 'Eastern Europe', 'Russia'],
    varieties: {
      'roasted': {
        appearance: 'Dark brown triangular groats',
        texture: 'Firm, pleasantly chewy',
        flavor: 'Deep, intense, nutty flavor',
        uses: 'Kasha, traditional Eastern European dishes, pilafs'
      },
      'raw': {
        appearance: 'Light green or tan triangular groats',
        texture: 'Softer when cooked than roasted',
        flavor: 'Milder than roasted, subtle nutty taste',
        uses: 'Porridges, more delicate dishes, sprouting'
      },
      'flour': {
        appearance: 'Gray-purple fine powder',
        texture: 'Dense in baked goods',
        flavor: 'Distinctive earthy flavor',
        uses: 'Blinis, soba noodles, pancakes, bread'
      }
    },
    preparation: {
      fresh: {
        duration: '15-20 minutes (raw), 10-15 minutes (roasted)',
        storage: 'Refrigerate in sealed container for 2-3 days',
        tips: [
          'Rinse before cooking',
          'Toast raw buckwheat for nuttier flavor',
          'Use 1:2 buckwheat to water ratio'
        ]
      },
      methods: [
        'boiled', 'toasted', 'ground into flour', 'sprouted'
      ]
    },
    storage: {
      container: 'Airtight container',
      duration: 'Up to 2 months (raw), 3-4 months (roasted), 2-3 days (cooked)',
      temperature: 'Cool, dark place (dry), refrigerated (cooked)',
      notes: 'Raw buckwheat has higher oil content and can spoil faster than roasted'
    },
    pairingRecommendations: {
      complementary: ['mushrooms', 'onions', 'herbs', 'butter', 'eggs', 'cabbage'],
      contrasting: ['light fruits', 'yogurt', 'honey'],
      toAvoid: ['subtle flavors that would be overpowered']
    }
  }
};

export const buckwheat = fixIngredientMappings(rawBuckwheat) as Record<string, IngredientMapping>; 