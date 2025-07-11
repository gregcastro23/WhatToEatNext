import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawStoneFruit = {
  'peach': {
    name: 'Peach',
    elementalProperties: { Water: 0.4, Fire: 0.2, Air: 0.2, Earth: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Moon'],
      favorableZodiac: ['taurus', 'cancer'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Venus' },
          second: { element: 'Earth', planet: 'Moon' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      }
    },
    qualities: ['sweet', 'juicy', 'fragrant'],
    season: ['summer'],
    category: 'fruit',
    subCategory: 'stone fruit',
    affinities: ['vanilla', 'almond', 'honey', 'raspberry', 'cream'],
    cookingMethods: ['raw', 'grilled', 'baked', 'poached'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['a', 'c', 'e'],
      minerals: ['potassium', 'magnesium'],
      calories: 39,
      carbs_g: 10,
      fiber_g: 1.5,
      antioxidants: ['beta-carotene', 'lutein']
    },
    preparation: {
      washing: true,
      ripeness: 'yields to gentle pressure',
      cutting: 'slice along natural seam',
      notes: 'Can be peeled if desired'
    },
    storage: {
      temperature: 'room temp until ripe',
      duration: '3-5 days',
      ripening: 'room temperature',
      notes: 'Refrigerate when ripe'
    }
  },
  'plum': {
    name: 'Plum',
    elementalProperties: { Water: 0.4, Fire: 0.2, Air: 0.2, Earth: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Pluto'],
      favorableZodiac: ['taurus', 'scorpio'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Venus' },
          second: { element: 'Earth', planet: 'Pluto' },
          third: { element: 'Air', planet: 'Uranus' }
        }
      }
    },
    qualities: ['sweet-tart', 'juicy', 'refreshing'],
    season: ['summer', 'early fall'],
    category: 'fruit',
    subCategory: 'stone fruit',
    affinities: ['cinnamon', 'ginger', 'vanilla', 'almond', 'star anise'],
    cookingMethods: ['raw', 'poached', 'baked', 'preserved'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'k', 'a'],
      minerals: ['potassium', 'copper'],
      calories: 30,
      carbs_g: 8,
      fiber_g: 0.9,
      antioxidants: ['anthocyanins', 'quercetin']
    },
    preparation: {
      washing: true,
      ripeness: 'slight give when pressed',
      cutting: 'slice around pit',
      notes: 'Some varieties are better for cooking'
    },
    storage: {
      temperature: 'room temp until ripe',
      duration: '3-5 days',
      ripening: 'room temperature',
      notes: 'Refrigerate when ripe'
    }
  },
  'apricot': {
    name: 'Apricot',
    elementalProperties: { Water: 0.3, Fire: 0.3, Air: 0.2, Earth: 0.2 },
    qualities: ['sweet-tart', 'delicate', 'aromatic'],
    season: ['late spring', 'early summer'],
    category: 'fruit',
    subCategory: 'stone fruit',
    affinities: ['almond', 'honey', 'vanilla', 'lavender', 'thyme'],
    cookingMethods: ['raw', 'poached', 'baked', 'dried'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['a', 'c', 'e'],
      minerals: ['potassium', 'copper'],
      calories: 17,
      carbs_g: 3.9,
      fiber_g: 0.7,
      antioxidants: ['beta-carotene', 'lutein']
    },
    preparation: {
      washing: true,
      ripeness: 'gentle squeeze',
      cutting: 'halve and twist',
      notes: 'Best eaten when fully ripe'
    },
    storage: {
      temperature: 'room temp until ripe',
      duration: '2-3 days',
      ripening: 'room temperature',
      notes: 'Very perishable when ripe'
    }
  },
  'cherry': {
    name: 'Cherry',
    elementalProperties: { Water: 0.3, Fire: 0.3, Air: 0.2, Earth: 0.2 },
    qualities: ['sweet-tart', 'juicy', 'bright'],
    season: ['late spring', 'early summer'],
    category: 'fruit', 
    subCategory: 'stone fruit',
    affinities: ['almond', 'chocolate', 'vanilla', 'brandy', 'cinnamon'],
    cookingMethods: ['raw', 'baked', 'preserved', 'poached'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'a', 'k'],
      minerals: ['potassium', 'manganese'],
      calories: 50,
      carbs_g: 12,
      fiber_g: 1.6,
      antioxidants: ['anthocyanins', 'quercetin']
    },
    preparation: {
      washing: true,
      pitting: 'recommended',
      sorting: 'remove stems and damaged fruit',
      notes: 'Can be used with or without pits'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '4-7 days',
      humidity: 'moderate',
      notes: 'Store unwashed until ready to use'
    }
  },
  'nectarine': {
    name: 'Nectarine',
    elementalProperties: { Water: 0.4, Fire: 0.2, Air: 0.2, Earth: 0.2 },
    qualities: ['sweet', 'aromatic', 'smooth'],
    season: ['summer'],
    category: 'fruit',
    subCategory: 'stone fruit',
    affinities: ['peach', 'berry', 'vanilla', 'honey', 'ginger'],
    cookingMethods: ['raw', 'grilled', 'baked', 'poached'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['a', 'c', 'e'],
      minerals: ['potassium', 'magnesium'],
      calories: 44,
      carbs_g: 10.5,
      fiber_g: 1.7,
      antioxidants: ['beta-carotene', 'lutein']
    },
    preparation: {
      washing: true,
      ripeness: 'yields to gentle pressure',
      cutting: 'slice along natural seam',
      notes: 'No peeling required unlike peaches'
    },
    storage: {
      temperature: 'room temp until ripe',
      duration: '3-5 days',
      ripening: 'room temperature',
      notes: 'Refrigerate when ripe'
    }
  },
  'greengage': {
    name: 'Greengage',
    elementalProperties: { Water: 0.4, Fire: 0.1, Air: 0.2, Earth: 0.3 },
    qualities: ['sweet', 'honey-like', 'delicate'],
    season: ['late summer'],
    category: 'fruit',
    subCategory: 'stone fruit',
    affinities: ['almond', 'vanilla', 'lavender', 'honey', 'yogurt'],
    cookingMethods: ['raw', 'baked', 'preserved', 'poached'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'a', 'k'],
      minerals: ['potassium', 'copper'],
      calories: 34,
      carbs_g: 8.5,
      fiber_g: 1.1,
      antioxidants: ['chlorophyll', 'beta-carotene']
    },
    preparation: {
      washing: true,
      ripeness: 'should yield slightly',
      cutting: 'halve and twist',
      notes: 'Best eaten when fully ripe'
    },
    storage: {
      temperature: 'room temp until ripe',
      duration: '3-4 days',
      ripening: 'room temperature',
      notes: 'Refrigerate when fully ripe'
    }
  },
  'damson': {
    name: 'Damson',
    elementalProperties: { Water: 0.3, Fire: 0.2, Air: 0.2, Earth: 0.3 },
    qualities: ['tart', 'astringent', 'complex'],
    season: ['late summer', 'early autumn'],
    category: 'fruit',
    subCategory: 'stone fruit',
    affinities: ['cinnamon', 'star anise', 'vanilla', 'almond', 'clove'],
    cookingMethods: ['preserved', 'baked', 'stewed', 'distilled'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['c', 'k', 'b6'],
      minerals: ['potassium', 'copper'],
      calories: 30,
      carbs_g: 7.5,
      fiber_g: 1.7,
      antioxidants: ['anthocyanins', 'quercetin']
    },
    preparation: {
      washing: true,
      ripeness: 'firm but yielding',
      cooking: 'usually cooked before eating',
      notes: 'Too tart for most raw applications'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      humidity: 'moderate',
      notes: 'Ideal for preserving and cooking'
    }
  }
};

// Fix the ingredient mappings to ensure they have all required properties
// ✅ Pattern MM-1: Type assertion for ZodiacSign[] compatibility
export const stoneFruit: Record<string, IngredientMapping> = fixIngredientMappings(rawStoneFruit as Record<string, Partial<IngredientMapping>>);
