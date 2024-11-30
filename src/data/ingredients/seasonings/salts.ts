import type { IngredientMapping } from '@/types/alchemy';

export const salts: Record<string, IngredientMapping> = {
  'fleur_de_sel': {
    elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['delicate', 'moist', 'mineral'],
    origin: ['France', 'Portugal'],
    category: 'salt',
    subCategory: 'finishing',
    varieties: {
      'Guérande': {
        appearance: 'grey-white crystals',
        texture: 'moist, delicate flakes',
        minerality: 'high',
        uses: 'premium finishing'
      },
      'Camargue': {
        appearance: 'white crystals',
        texture: 'light, crispy',
        minerality: 'medium-high',
        uses: 'delicate finishing'
      },
      'Portuguese': {
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
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2 },
    qualities: ['crisp', 'clean', 'flaky'],
    origin: ['United Kingdom'],
    category: 'salt',
    subCategory: 'finishing',
    varieties: {
      'Traditional': {
        appearance: 'pyramid-shaped flakes',
        texture: 'crunchy, dissolves quickly',
        uses: 'universal finishing'
      },
      'Smoked': {
        appearance: 'golden-brown flakes',
        texture: 'crunchy with smoke flavor',
        uses: 'meats, hearty dishes'
      }
    },
    culinaryApplications: {
      'finishing': {
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
    elementalProperties: { Earth: 0.5, Fire: 0.2, Water: 0.1 },
    qualities: ['mineral-rich', 'complex', 'robust'],
    origin: ['Pakistan'],
    category: 'salt',
    subCategory: 'rock',
    varieties: {
      'Fine': {
        appearance: 'fine pink crystals',
        uses: 'all-purpose cooking',
        grind: 'table salt substitute'
      },
      'Coarse': {
        appearance: 'large pink crystals',
        uses: 'grinding, cooking',
        grind: 'versatile size'
      },
      'Block': {
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
        method: 'all-purpose seasoning',
        timing: 'during cooking process',
        applications: {
          'general_seasoning': 'direct replacement for table salt',
          'brining': 'meats and vegetables',
          'baking': 'breads and pastries'
        }
      },
      'salt_block_cooking': {
        method: 'heat or chill block',
        techniques: {
          'hot': {
            applications: ['searing', 'grilling'],
            temperature: 'up to 500°F/260°C'
          },
          'cold': {
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
    elementalProperties: { Earth: 0.6, Water: 0.2, Air: 0.1 },
    qualities: ['clean', 'consistent', 'pure'],
    origin: ['Various'],
    category: 'salt',
    subCategory: 'cooking',
    varieties: {
      'Diamond Crystal': {
        appearance: 'hollow pyramid flakes',
        texture: 'light, crushable',
        dissolution: 'quick',
        uses: 'professional kitchen standard'
      },
      'Morton': {
        appearance: 'dense flakes',
        texture: 'harder, compact',
        dissolution: 'moderate',
        uses: 'home cooking standard'
      }
    },
    culinaryApplications: {
      'cooking': {
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
