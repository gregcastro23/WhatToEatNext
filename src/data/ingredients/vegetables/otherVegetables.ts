import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawOtherVegetables = {
  asparagus: {
    name: 'asparagus',

    elementalProperties: {
      Fire: 0.7644171899336816,
      Water: 0.20342270505373083,
      Earth: 0.025567430424262617,
      Air: 0.006592674588325188
    }

    category: 'vegetable',
    subCategory: 'other',

    nutritionalProfile: {
      carbs_g: 3.88,
      calories: 20,
      fiber_g: 2.1,
      protein_g: 2.2,
      vitamins: ['k', 'd', 'c', 'e', 'a', 'b3', 'b6', 'b12', 'b2', 'b5', 'b1'],
      minerals: ['zinc', 'magnesium', 'iron', 'potassium', 'calcium']
    }

    season: ['spring', 'summer', 'fall', 'winter'],

    cookingMethods: ['roast', 'boil', 'steam', 'saute'],

    qualities: ['nutritious'],

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic asparagus profile'
    }

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      }

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    }

    origin: ['Unknown'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for asparagus'
    }

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    }

    varieties: {}

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    }
  }
  artichoke: {
    name: 'artichoke',

    elementalProperties: {
      Fire: 0.12620732804129353,
      Water: 0.7539592539005983,
      Earth: 0.09658624330348414,
      Air: 0.023247174754624015
    }

    category: 'vegetable',
    subCategory: 'other',

    nutritionalProfile: {
      carbs_g: 10.51,
      calories: 47,
      fiber_g: 5.4,
      protein_g: 3.27,
      vitamins: ['k', 'd', 'c', 'e', 'a', 'b3', 'b6', 'b12', 'b2', 'b5', 'b1'],
      minerals: ['zinc', 'magnesium', 'iron', 'potassium', 'calcium']
    }

    season: ['spring', 'summer', 'fall', 'winter'],

    cookingMethods: ['roast', 'boil', 'steam', 'saute'],

    qualities: ['nutritious'],

    sensoryProfile: {
      taste: ['Mild'],
      aroma: ['Fresh'],
      texture: ['Standard'],
      notes: 'Characteristic artichoke profile'
    }

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      }

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    }

    origin: ['Unknown'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for artichoke'
    }

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    }

    varieties: {}

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    }
  }
  cucumber: {
    name: 'cucumber',

    elementalProperties: {
      Fire: 0.34993398250536384,
      Water: 0.5760851625680805,
      Earth: 0.060653573196897174,
      Air: 0.013327281729658358
    }

    category: 'vegetable',
    subCategory: 'other',

    nutritionalProfile: {
      carbs_g: 2.16,
      calories: 12,
      fiber_g: 0.7,
      protein_g: 0.59,
      vitamins: ['k', 'd', 'c', 'e', 'a', 'b3', 'b6', 'b12', 'b2', 'b5', 'b1'],
      minerals: ['zinc', 'magnesium', 'iron', 'potassium', 'calcium']
    }

    season: ['spring', 'summer', 'fall', 'winter'],

    cookingMethods: ['roast', 'boil', 'steam', 'saute'],

    qualities: ['nutritious'],

    // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
    }

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      }

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    }

    origin: ['Unknown'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for cucumber'
    }

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    }

    varieties: {}

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    }
  }
  okra: {
    name: 'okra',

    elementalProperties: {
      Fire: 0.6419553778871122,
      Water: 0.2653922372557059,
      Earth: 0.07277572775727757,
      Air: 0.019876657099904334
    }

    category: 'vegetable',
    subCategory: 'other',

    nutritionalProfile: {
      carbs_g: 7.45,
      calories: 33,
      fiber_g: 3.2,
      protein_g: 1.93,
      vitamins: ['k', 'd', 'c', 'e', 'a', 'b3', 'b6', 'b12', 'b2', 'b5', 'b1'],
      minerals: ['zinc', 'magnesium', 'iron', 'potassium', 'calcium']
    }

    season: ['spring', 'summer', 'fall', 'winter'],

    cookingMethods: ['roast', 'boil', 'steam', 'saute'],

    qualities: ['nutritious'],

    // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
    }

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      }

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    }

    origin: ['Unknown'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for okra'
    }

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    }

    varieties: {}

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    }
  }
  zucchini: {
    name: 'zucchini',

    elementalProperties: {
      Fire: 0.4204917086683852,
      Water: 0.5121388172829056,
      Earth: 0.032703628178985034,
      Air: 0.034665845869724134
    }

    category: 'vegetable',
    subCategory: 'other',

    nutritionalProfile: {
      carbs_g: 3.1,
      calories: 17,
      fiber_g: 1,
      protein_g: 1.2,
      vitamins: ['a', 'c', 'k', 'b6'],
      minerals: ['potassium', 'manganese', 'magnesium'],
      fat_g: 0.3,
      sugar_g: 2.5,
      glycemic_index: 15,
      notes: 'Low calorie and nutrient-dense'
    }

    season: ['spring', 'summer', 'fall', 'winter'],

    cookingMethods: ['roast', 'boil', 'steam', 'saute'],

    qualities: ['nutritious'],

    // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
    }

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      }

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    }

    origin: ['Unknown'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for zucchini'
    }

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    }

    varieties: {}

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    }
  }
  peas: {
    name: 'petite peas',

    elementalProperties: {
      Fire: 0.7162207554458272,
      Water: 0.2242992223845753,
      Earth: 0.025780554575838496,
      Air: 0.03369946759375892
    }

    category: 'vegetable',
    subCategory: 'other',

    nutritionalProfile: {
      carbs_g: 14.4,
      calories: 81,
      fiber_g: 5.7,
      protein_g: 5.42,
      vitamins: ['k', 'd', 'c', 'e', 'a', 'b3', 'b6', 'b12', 'b2', 'b5', 'b1'],
      minerals: ['zinc', 'magnesium', 'iron', 'potassium', 'calcium']
    }

    season: ['spring', 'summer', 'fall', 'winter'],

    cookingMethods: ['roast', 'boil', 'steam', 'saute'],

    qualities: ['nutritious'],

    // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
    }

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      }

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    }

    origin: ['Unknown'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for peas'
    }

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    }

    varieties: {}

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    }
  }
  green_beans: {
    name: 'green beans',

    elementalProperties: {
      Fire: 0.7250127703047846,
      Water: 0.22259392433970013,
      Earth: 0.0397632235254054,
      Air: 0.012630081830109875
    }

    category: 'vegetable',
    subCategory: 'other',

    nutritionalProfile: {
      carbs_g: 6.97,
      calories: 31,
      fiber_g: 2.7,
      protein_g: 1.83,
      vitamins: ['k', 'd', 'c', 'e', 'a', 'b3', 'b6', 'b12', 'b2', 'b5', 'b1'],
      minerals: ['zinc', 'magnesium', 'iron', 'potassium', 'calcium']
    }

    season: ['spring', 'summer', 'fall', 'winter'],

    cookingMethods: ['roast', 'boil', 'steam', 'saute'],

    qualities: ['nutritious'],

    // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
    }

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      }

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    }

    origin: ['Unknown'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for green_beans'
    }

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    }

    varieties: {}

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    }
  }
  celery: {
    name: 'celery',

    elementalProperties: {
      Fire: 0.5999612002069322,
      Water: 0.34187790998448014,
      Earth: 0.0538023797206415,
      Air: 0.004358510087946198
    }

    category: 'vegetable',
    subCategory: 'other',

    nutritionalProfile: {
      carbs_g: 2.97,
      calories: 14,
      fiber_g: 1.6,
      protein_g: 0.69,
      vitamins: ['k', 'd', 'c', 'e', 'a', 'b3', 'b6', 'b12', 'b2', 'b5', 'b1'],
      minerals: ['zinc', 'magnesium', 'iron', 'potassium', 'calcium']
    }

    season: ['spring', 'summer', 'fall', 'winter'],

    cookingMethods: ['roast', 'boil', 'steam', 'saute'],

    qualities: ['nutritious'],

    // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
    }

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      }

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    }

    origin: ['Unknown'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for celery'
    }

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    }

    varieties: {}

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    }
  }
  fennel: {
    name: 'fennel',

    elementalProperties: {
      Fire: 0.2540820208475995,
      Water: 0.6474929620330214,
      Earth: 0.0792817469375333,
      Air: 0.01914327018184585
    }

    category: 'vegetable',
    subCategory: 'other',

    nutritionalProfile: {
      carbs_g: 7.3,
      calories: 31,
      fiber_g: 3.1,
      protein_g: 1.24,
      vitamins: ['k', 'd', 'c', 'e', 'a', 'b3', 'b6', 'b12', 'b2', 'b5', 'b1'],
      minerals: ['zinc', 'magnesium', 'iron', 'potassium', 'calcium']
    }

    season: ['spring', 'summer', 'fall', 'winter'],

    cookingMethods: ['roast', 'boil', 'steam', 'saute'],

    qualities: ['nutritious'],

    // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
    }

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      }

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    }

    origin: ['Unknown'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for fennel'
    }

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    }

    varieties: {}

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    }
  }
  kohlrabi: {
    name: 'kohlrabi',

    elementalProperties: {
      Fire: 0.12665862484921594,
      Water: 0.6980816374177985,
      Earth: 0.05369858749367681,
      Air: 0.12156115023930894
    }

    category: 'vegetable',
    subCategory: 'other',

    nutritionalProfile: {
      carbs_g: 6.2,
      calories: 27,
      fiber_g: 3.6,
      protein_g: 1.7,
      vitamins: ['k', 'd', 'c', 'e', 'a', 'b3', 'b6', 'b12', 'b2', 'b5', 'b1'],
      minerals: ['zinc', 'magnesium', 'iron', 'potassium', 'calcium']
    }

    season: ['spring', 'summer', 'fall', 'winter'],

    cookingMethods: ['roast', 'boil', 'steam', 'saute'],

    qualities: ['nutritious'],

    // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
    }

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      }

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    }

    origin: ['Unknown'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for kohlrabi'
    }

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    }

    varieties: {}

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    }
  }
  bok_choy: {
    name: 'bok choy',

    elementalProperties: {
      Fire: 0.9168771409581267,
      Water: 0.05222352881026636,
      Earth: 0.02167799989774528,
      Air: 0.009221330333861648
    }

    category: 'vegetable',
    subCategory: 'other',

    nutritionalProfile: {
      carbs_g: 2.18,
      calories: 13,
      fiber_g: 1,
      protein_g: 1.5,
      vitamins: ['k', 'd', 'c', 'e', 'a', 'b3', 'b6', 'b12', 'b2', 'b5', 'b1'],
      minerals: ['zinc', 'magnesium', 'iron', 'potassium', 'calcium']
    }

    season: ['spring', 'summer', 'fall', 'winter'],

    cookingMethods: ['roast', 'boil', 'steam', 'saute'],

    qualities: ['nutritious'],

    // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
    }

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      }

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    }

    origin: ['Unknown'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for bok_choy'
    }

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    }

    varieties: {}

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    }
  }
  endive: {
    name: 'escarole',

    elementalProperties: {
      Fire: 0.8520337371186256,
      Water: 0.12378591584428543,
      Earth: 0.021475453284068413,
      Air: 0.002704893753020595
    }

    category: 'vegetable',
    subCategory: 'other',

    nutritionalProfile: {
      carbs_g: 3.35,
      calories: 17,
      fiber_g: 3.1,
      protein_g: 1.25,
      vitamins: ['k', 'd', 'c', 'e', 'a', 'b3', 'b6', 'b12', 'b2', 'b5', 'b1'],
      minerals: ['zinc', 'magnesium', 'iron', 'potassium', 'calcium']
    }

    season: ['spring', 'summer', 'fall', 'winter'],

    cookingMethods: ['roast', 'boil', 'steam', 'saute'],

    qualities: ['nutritious'],

    // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
    }

    culinaryProfile: {
      flavorProfile: {
        primary: ['balanced']
      }

      cookingMethods: ['versatile'],
      cuisineAffinity: ['Global']
    }

    origin: ['Unknown'],

    preparation: {
      methods: ['Standard'],
      timing: 'As needed',
      notes: 'Standard prep for endive'
    }

    storage: {
      temperature: 'Cool, dry place',
      duration: '6-12 months',
      container: 'Airtight'
    }

    varieties: {}

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: []
    }
  }
}

// Fix the ingredient mappings to ensure they have all required properties
export const _otherVegetables: Record<string, IngredientMapping> =
  fixIngredientMappings(rawOtherVegetables)
