import type { IngredientMapping } from '@/types/alchemy';

export const medicinalHerbs: Record<string, IngredientMapping> = {
  'echinacea': {
    elementalProperties: { Air: 0.4, Fire: 0.3, Earth: 0.3 },
    qualities: ['immune-boosting', 'antimicrobial', 'warming'],
    category: 'medicinal_herb',
    parts_used: ['root', 'flower', 'leaves'],
    preparations: {
      'tincture': {
        ratio: '1:5 herb to alcohol',
        alcohol_percentage: '45-50%',
        duration: '6-8 weeks',
        dosage: '30-60 drops, 3x daily'
      },
      'tea': {
        ratio: '1-2 tsp per cup',
        steep_time: '10-15 minutes',
        dosage: '3 cups daily',
        duration: 'up to 10 days'
      }
    },
    properties: {
      'immune_support': 'stimulates white blood cells',
      'antimicrobial': 'active against bacteria and viruses',
      'anti_inflammatory': 'reduces swelling and pain'
    },
    contraindications: [
      'autoimmune conditions',
      'progressive systemic diseases',
      'pregnancy caution'
    ]
  },

  'elderberry': {
    elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.3 },
    qualities: ['antiviral', 'immune-supporting', 'cooling'],
    category: 'medicinal_herb',
    parts_used: ['berries', 'flowers'],
    preparations: {
      'syrup': {
        ingredients: {
          'berries': '1 part',
          'water': '2 parts',
          'honey': '1 part'
        },
        method: 'decoct berries, add honey',
        dosage: '1-2 tsp daily',
        storage: 'refrigerate'
      }
    },
    properties: {
      'antiviral': 'especially against flu viruses',
      'immune_support': 'increases cytokine production',
      'antioxidant': 'high in flavonoids'
    }
  },

  'chamomile': {
    elementalProperties: { Air: 0.4, Water: 0.4, Earth: 0.2 },
    qualities: ['calming', 'soothing', 'cooling'],
    category: 'medicinal_herb',
    parts_used: ['flowers'],
    preparations: {
      'tea': {
        ratio: '1-2 tsp per cup',
        steep_time: '5-10 minutes',
        dosage: '2-3 cups daily'
      },
      'compress': {
        method: 'strong tea applied topically',
        uses: ['eye strain', 'skin irritation']
      }
    },
    properties: {
      'nervine': 'calms nervous system',
      'anti_inflammatory': 'soothes digestive tract',
      'sleep_aid': 'promotes restful sleep'
    }
  }
};

export default medicinalHerbs;
