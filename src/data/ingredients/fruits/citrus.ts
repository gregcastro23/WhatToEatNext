import type { IngredientMapping } from '@/types/alchemy';

export const citrus: Record<string, IngredientMapping> = {
  'lemon': {
    elementalProperties: { Water: 0.4, Air: 0.3, Fire: 0.2, Earth: 0.1 },
    qualities: ['sour', 'cooling', 'cleansing'],
    season: ['winter', 'spring'],
    category: 'fruit',
    subCategory: 'citrus',
    affinities: ['honey', 'ginger', 'mint', 'thyme', 'lavender'],
    cookingMethods: ['raw', 'juiced', 'preserved', 'zested'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'b6', 'folate'],
      minerals: ['potassium', 'calcium'],
      calories: 29,
      carbs_g: 9,
      fiber_g: 2.8,
      antioxidants: ['flavonoids', 'limonoids']
    },
    preparation: {
      washing: true,
      zesting: 'before juicing',
      juicing: 'room temperature yields more juice',
      notes: 'Roll on counter before juicing'
    },
    storage: {
      temperature: 'room temp or refrigerated',
      duration: '1-2 weeks',
      notes: 'Will continue to ripen at room temperature'
    }
  },

  'orange': {
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 },
    qualities: ['sweet', 'warming', 'nourishing'],
    season: ['winter'],
    category: 'fruit',
    subCategory: 'citrus',
    affinities: ['vanilla', 'cinnamon', 'chocolate', 'cranberry', 'dates'],
    cookingMethods: ['raw', 'juiced', 'zested', 'candied'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'a', 'b1'],
      minerals: ['calcium', 'potassium'],
      calories: 62,
      carbs_g: 15,
      fiber_g: 3.1,
      antioxidants: ['hesperidin', 'beta-cryptoxanthin']
    },
    preparation: {
      washing: true,
      peeling: 'remove white pith',
      sectioning: 'remove membranes if desired',
      notes: 'Supreme for salads'
    },
    storage: {
      temperature: 'cool room temp or refrigerated',
      duration: '2-3 weeks',
      notes: 'Keep away from apples and bananas'
    }
  },

  'lime': {
    elementalProperties: { Water: 0.5, Air: 0.2, Fire: 0.2, Earth: 0.1 },
    qualities: ['sour', 'cooling', 'refreshing'],
    season: ['year-round'],
    category: 'fruit',
    subCategory: 'citrus',
    affinities: ['mint', 'coconut', 'chili', 'cilantro', 'ginger'],
    cookingMethods: ['raw', 'juiced', 'zested', 'preserved'],
    nutritionalProfile: {
      vitamins: ['c', 'b6'],
      minerals: ['potassium', 'calcium'],
      calories: 20,
      carbs_g: 7,
      fiber_g: 1.9
    },
    preparation: {
      washing: true,
      rolling: 'before juicing',
      zesting: 'before juicing',
      notes: 'Warm slightly for more juice'
    },
    storage: {
      temperature: 'room temp or refrigerated',
      duration: '1-2 weeks',
      notes: 'Will continue to yellow over time'
    }
  }
};