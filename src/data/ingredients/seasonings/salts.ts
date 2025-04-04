import type { IngredientMapping } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawSalts: Record<string, Partial<IngredientMapping>> = {
  'fleur_de_sel': {
    name: 'Fleur De Sel',
    elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
    qualities: ['delicate', 'moist', 'mineral'],
    origin: ['France', 'Portugal'],
    category: 'salt',
    subCategory: 'finishing',
    varieties: {
      'Guérande': {
    name: 'Guérande',
        appearance: 'grey-white crystals',
        texture: 'moist, delicate flakes',
        minerality: 'high',
        uses: 'premium finishing'
      },
      'Camargue': {
    name: 'Camargue',
        appearance: 'white crystals',
        texture: 'light, crispy',
        minerality: 'medium-high',
        uses: 'delicate finishing'
      },
      'Portuguese': {
    name: 'Portuguese',
        appearance: 'white pyramidal crystals',
        texture: 'crunchy, moist',
        minerality: 'medium',
        uses: 'all-purpose finishing'
      }
    },
    harvesting: {
      method: 'hand-harvested from surface',
      timing: 'summer months only',
      conditions: 'specific wind and weather required',
      traditional_tools: ['wooden rake', 'woven basket']
    },
    culinaryApplications: {
      'finishing': {
    name: 'Finishing',
        method: 'sprinkle by hand',
        timing: 'just before serving',
        applications: {
          'vegetables': 'light sprinkle on raw or cooked',
          'meats': 'just before serving',
          'caramels': 'while still warm',
          'chocolate': 'before setting'
        },
        notes: 'Do not use for cooking - heat destroys texture'
      },
      'garnishing': {
    name: 'Garnishing',
        method: 'pinch and sprinkle',
        applications: {
          'salads': 'final touch',
          'bread': 'just before baking',
          'eggs': 'immediately before eating'
        }
      }
    },
    storage: {
      temperature: 'room temperature',
      humidity: 'low',
      container: 'ceramic or glass',
      notes: 'Keep dry but expects some moisture'
    }
  },

  'maldon_salt': {
    name: 'Maldon Salt',
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
    qualities: ['crisp', 'clean', 'flaky'],
    origin: ['United Kingdom'],
    category: 'salt',
    subCategory: 'finishing',
    varieties: {
      'Traditional': {
    name: 'Traditional',
        appearance: 'pyramid-shaped flakes',
        texture: 'crunchy, dissolves quickly',
        uses: 'universal finishing'
      },
      'Smoked': {
    name: 'Smoked',
        appearance: 'golden-brown flakes',
        texture: 'crunchy with smoke flavor',
        uses: 'meats, hearty dishes'
      }
    },
    culinaryApplications: {
      'finishing': {
    name: 'Finishing',
        method: 'crush between fingers',
        timing: 'just before serving',
        applications: {
          'grilled_meats': 'after resting',
          'roasted_vegetables': 'while hot',
          'baked_goods': 'before baking',
          'chocolate': 'before setting'
        }
      },
      'texture_enhancement': {
    name: 'Texture Enhancement',
        method: 'strategic placement',
        applications: {
          'salads': 'final seasoning',
          'caramels': 'top garnish',
          'bread_crust': 'pre-bake sprinkle'
        }
      }
    },
    storage: {
      temperature: 'room temperature',
      humidity: 'very low',
      container: 'airtight glass or ceramic',
      notes: 'Keep very dry to maintain crunch'
    }
  },

  'sea_salt': {
    name: 'Sea Salt',
    elementalProperties: { Water: 0.6, Earth: 0.2, Air: 0.1, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Earth', planet: 'Neptune' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Water: 0.1, Earth: 0.1 },
          preparationTips: ['Best for brining']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for finishing dishes']
        }
      }
    },
    qualities: ['delicate', 'moist', 'mineral'],
    origin: ['Various'],
    category: 'salt',
    subCategory: 'finishing',
    varieties: {
      'Traditional': {
    name: 'Traditional',
        appearance: 'crystals',
        texture: 'delicate flakes',
        uses: 'universal finishing'
      },
      'Smoked': {
    name: 'Smoked',
        appearance: 'golden-brown flakes',
        texture: 'crunchy with smoke flavor',
        uses: 'meats, hearty dishes'
      }
    },
    culinaryApplications: {
      'finishing': {
    name: 'Finishing',
        method: 'crush between fingers',
        timing: 'just before serving',
        applications: {
          'grilled_meats': 'after resting',
          'roasted_vegetables': 'while hot',
          'baked_goods': 'before baking',
          'chocolate': 'before setting'
        }
      },
      'texture_enhancement': {
    name: 'Texture Enhancement',
        method: 'strategic placement',
        applications: {
          'salads': 'final seasoning',
          'caramels': 'top garnish',
          'bread_crust': 'pre-bake sprinkle'
        }
      }
    },
    storage: {
      temperature: 'room temperature',
      humidity: 'very low',
      container: 'airtight glass or ceramic',
      notes: 'Keep very dry to maintain crunch'
    }
  },

  'himalayan_pink_salt': {
    name: 'Himalayan Pink Salt',
    elementalProperties: { Earth: 0.5, Fire: 0.2, Water: 0.1, Air: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mars'],
      favorableZodiac: ['capricorn', 'aries'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Saturn' },
          second: { element: 'Fire', planet: 'Mars' },
          third: { element: 'Air', planet: 'Uranus' }
        }
      },
      lunarPhaseModifiers: {
        waxingGibbous: {
          elementalBoost: { Earth: 0.1, Fire: 0.1 },
          preparationTips: ['Best for grilling']
        },
        fullMoon: {
          elementalBoost: { Fire: 0.2 },
          preparationTips: ['Ideal for salt blocks']
        }
      }
    },
    qualities: ['mineral-rich', 'complex', 'robust'],
    origin: ['Pakistan'],
    category: 'salt',
    subCategory: 'rock',
    varieties: {
      'Fine': {
    name: 'Fine',
        appearance: 'fine pink crystals',
        uses: 'all-purpose cooking',
        grind: 'table salt substitute'
      },
      'Coarse': {
    name: 'Coarse',
        appearance: 'large pink crystals',
        uses: 'grinding, cooking',
        grind: 'versatile size'
      },
      'Block': {
    name: 'Block',
        appearance: 'solid pink slabs',
        uses: 'cooking surface, presentation',
        applications: 'grilling, chilling, serving'
      }
    },
    mineralContent: {
      'iron_oxide': 'creates pink color',
      'trace_minerals': '84+ different minerals',
      'electrolytes': 'natural occurrence'
    },
    culinaryApplications: {
      'cooking': {
    name: 'Cooking',
        method: 'all-purpose seasoning',
        timing: 'during cooking process',
        applications: {
          'general_seasoning': 'direct replacement for table salt',
          'brining': 'meats and vegetables',
          'baking': 'breads and pastries'
        }
      },
      'salt_block_cooking': {
    name: 'Salt Block Cooking',
        method: 'heat or chill block',
        techniques: {
          'hot': {
    name: 'Hot',
            applications: ['searing', 'grilling'],
            temperature: 'up to 500°F/260°C'
          },
          'cold': {
    name: 'Cold',
            applications: ['sashimi', 'desserts'],
            temperature: 'chilled'
          }
        },
        care: {
          'tempering': 'gradual heat increase',
          'cleaning': 'no soap, light scrub',
          'storage': 'dry completely'
        }
      }
    },
    storage: {
      temperature: 'room temperature',
      humidity: 'low',
      container: 'airtight container',
      notes: 'Extremely stable, indefinite shelf life'
    }
  },

  'kosher_salt': {
    name: 'Kosher Salt',
    elementalProperties: { Earth: 0.6, Water: 0.2, Air: 0.1 , Fire: 0.1},
    qualities: ['clean', 'consistent', 'pure'],
    origin: ['Various'],
    category: 'salt',
    subCategory: 'cooking',
    varieties: {
      'Diamond Crystal': {
    name: 'Diamond Crystal',
        appearance: 'hollow pyramid flakes',
        texture: 'light, crushable',
        dissolution: 'quick',
        uses: 'professional kitchen standard'
      },
      'Morton': {
    name: 'Morton',
        appearance: 'dense flakes',
        texture: 'harder, compact',
        dissolution: 'moderate',
        uses: 'home cooking standard'
      }
    },
    culinaryApplications: {
      'cooking': {
    name: 'Cooking',
        method: 'pinch and sprinkle',
        timing: 'throughout cooking',
        applications: {
          'seasoning': 'meats before cooking',
          'pasta_water': '1 tbsp per quart',
          'baking': 'dough and batters'
        },
        conversion_ratios: {
          'table_salt': '1 tsp table = 1.25 tsp Morton = 2 tsp Diamond',
          'weight_based': '1 gram = 1 gram (any brand)'
        }
      },
      'koshering': {
    name: 'Koshering',
        method: 'coat meat surface',
        timing: '1 hour before cooking',
        process: [
          'apply salt liberally',
          'rest for 1 hour',
          'rinse thoroughly',
          'pat dry'
        ]
      }
    },
    storage: {
      temperature: 'room temperature',
      humidity: 'low',
      container: 'airtight container',
      notes: 'Very stable, no special requirements'
    }
  }
};

// Fix the ingredient mappings to ensure they have all required properties
export const salts: Record<string, IngredientMapping> = fixIngredientMappings(rawSalts);
