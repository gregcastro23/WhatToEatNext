import type { IngredientMapping } from '@/types/alchemy';

export const oils: Record<string, IngredientMapping> = {
  'extra_virgin_olive_oil': {
    elementalProperties: { Earth: 0.4, Wood: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ['fruity', 'peppery', 'complex'],
    origin: ['Mediterranean', 'California', 'Australia'],
    category: 'oil',
    subCategory: 'cold_pressed',
    varieties: {
      'Italian': {
        profiles: {
          'Tuscan': 'robust, peppery',
          'Sicilian': 'fruity, mild',
          'Ligurian': 'delicate, herbal'
        },
        uses: 'finishing, dressing, dipping'
      },
      'Spanish': {
        profiles: {
          'Picual': 'bold, pungent',
          'Arbequina': 'mild, nutty',
          'Hojiblanca': 'balanced, complex'
        },
        uses: 'all-purpose, cooking'
      },
      'Greek': {
        profiles: {
          'Kalamata': 'robust, fruity',
          'Koroneiki': 'strong, peppery'
        },
        uses: 'dressing, cooking'
      }
    },
    smokePoint: {
      fahrenheit: 375,
      celsius: 190,
      notes: 'Not ideal for high-heat cooking'
    },
    culinaryApplications: {
      'dressing': {
        method: 'whisk or emulsify',
        ratios: {
          'vinaigrette': '3:1 (oil:acid)',
          'herb_infused': '2 tbsp herbs per cup'
        },
        techniques: {
          'classic': 'whisk with vinegar and mustard',
          'emulsified': 'blend with herbs and garlic',
          'infused': 'steep with herbs or citrus'
        }
      },
      'finishing': {
        method: 'drizzle over completed dish',
        applications: [
          'soups',
          'grilled vegetables',
          'bread dipping',
          'pasta',
          'bruschetta'
        ],
        notes: 'Use highest quality for finishing'
      },
      'cooking': {
        method: 'low to medium heat',
        techniques: {
          'sautéing': 'medium heat, short duration',
          'braising': 'low heat, long duration',
          'roasting': 'medium heat, vegetables'
        },
        notes: 'Monitor temperature to prevent smoking'
      }
    },
    storage: {
      temperature: 'cool, dark place',
      duration: '18-24 months',
      container: 'dark glass or tin',
      notes: 'Protect from light and heat'
    }
  },

  'avocado_oil': {
    elementalProperties: { Earth: 0.3, Fire: 0.3, Water: 0.2, Air: 0.2 },
    qualities: ['neutral', 'buttery', 'clean'],
    origin: ['Mexico', 'California', 'New Zealand'],
    category: 'oil',
    subCategory: 'cold_pressed',
    varieties: {
      'Extra Virgin': {
        flavor: 'mild avocado taste',
        uses: 'high-heat cooking, finishing'
      },
      'Refined': {
        flavor: 'neutral',
        uses: 'all-purpose cooking'
      }
    },
    smokePoint: {
      fahrenheit: 520,
      celsius: 270,
      notes: 'Excellent for high-heat cooking'
    },
    culinaryApplications: {
      'high_heat_cooking': {
        method: 'direct high heat',
        techniques: {
          'searing': 'high heat, quick cooking',
          'stir_frying': 'high heat, continuous motion',
          'grilling': 'high heat, direct flame'
        },
        notes: 'Maintains stability at high temperatures'
      },
      'mayonnaise': {
        method: 'emulsify with egg yolks',
        ratios: {
          'basic': '1 cup oil : 1 egg yolk',
          'aioli': '1 cup oil : 1 egg yolk : 2 garlic cloves'
        },
        notes: 'Creates stable emulsion'
      }
    },
    storage: {
      temperature: 'room temperature',
      duration: '12-18 months',
      container: 'dark bottle',
      notes: 'Resistant to rancidity'
    }
  },

  'sesame_oil': {
    elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.1 },
    qualities: ['nutty', 'aromatic', 'intense'],
    origin: ['East Asia', 'India'],
    category: 'oil',
    subCategory: 'pressed',
    varieties: {
      'Toasted': {
        appearance: 'dark amber',
        flavor: 'intense, roasted',
        uses: 'finishing, flavoring'
      },
      'Light': {
        appearance: 'pale yellow',
        flavor: 'mild, nutty',
        uses: 'cooking, all-purpose'
      }
    },
    smokePoint: {
      fahrenheit: {
        'light': 410,
        'toasted': 350
      },
      celsius: {
        'light': 210,
        'toasted': 176
      },
      notes: 'Light for cooking, toasted for finishing'
    },
    culinaryApplications: {
      'asian_cuisine': {
        method: 'finishing oil or cooking',
        techniques: {
          'stir_fry': 'light oil for cooking',
          'finishing': 'toasted oil as garnish',
          'marinades': 'combined with soy sauce'
        },
        ratios: {
          'finishing': '1-2 tsp per dish',
          'marinade': '1:1 (oil:soy sauce)'
        }
      },
      'dressings': {
        method: 'combine with other oils',
        ratios: {
          'asian_vinaigrette': '1:3 (sesame:neutral oil)',
          'dipping_sauce': '1:1:2 (sesame:soy:rice vinegar)'
        }
      }
    },
    storage: {
      temperature: 'refrigerated after opening',
      duration: '6-12 months',
      container: 'dark glass bottle',
      notes: 'Can become rancid quickly if not refrigerated'
    }
  },

  'coconut_oil': {
    elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
    qualities: ['sweet', 'rich', 'stable'],
    origin: ['Southeast Asia', 'Pacific Islands', 'Caribbean'],
    category: 'oil',
    subCategory: 'pressed',
    varieties: {
      'Virgin': {
        appearance: 'white when solid',
        flavor: 'coconut taste',
        uses: 'baking, medium-heat cooking'
      },
      'Refined': {
        appearance: 'white when solid',
        flavor: 'neutral',
        uses: 'high-heat cooking'
      }
    },
    smokePoint: {
      fahrenheit: {
        'virgin': 350,
        'refined': 400
      },
      celsius: {
        'virgin': 177,
        'refined': 204
      }
    },
    culinaryApplications: {
      'baking': {
        method: 'solid or melted',
        techniques: {
          'pastry': 'solid, cut into flour',
          'cakes': 'melted, room temperature',
          'vegan_butter': 'solid, whipped'
        },
        ratios: {
          'butter_substitute': '1:1 replacement',
          'vegan_butter': '3:1 (oil:water)'
        }
      },
      'frying': {
        method: 'medium to high heat',
        techniques: {
          'shallow_fry': 'medium heat',
          'deep_fry': 'high heat',
          'tropical_cuisine': 'medium heat, curries'
        }
      }
    },
    storage: {
      temperature: 'room temperature',
      duration: '2 years',
      container: 'glass jar',
      notes: 'Solid below 76°F/24°C'
    }
  },

  'ghee': {
    elementalProperties: { Fire: 0.5, Earth: 0.3, Air: 0.1, Water: 0.1 },
    qualities: ['rich', 'nutty', 'clarified'],
    origin: ['India', 'South Asia'],
    category: 'oil',
    subCategory: 'clarified_butter',
    varieties: {
      'Traditional': {
        'Bilona': {
          method: 'hand-churned from cultured cream',
          properties: 'highest medicinal value',
          uses: 'Ayurvedic medicine, sacred ceremonies'
        },
        'Vedic': {
          method: 'made during specific moon phases',
          properties: 'enhanced spiritual properties',
          uses: 'religious ceremonies, healing'
        }
      },
      'Commercial': {
        'Grade A': {
          color: 'golden yellow',
          aroma: 'nutty, caramelized',
          uses: 'cooking, medicinal'
        },
        'Cultured': {
          method: 'from cultured butter',
          flavor: 'more complex, slight tang',
          uses: 'gourmet cooking'
        }
      }
    },
    smokePoint: {
      fahrenheit: 485,
      celsius: 252,
      notes: 'One of the highest smoke points of any cooking fat'
    },
    ayurvedicProperties: {
      doshas: {
        'Vata': {
          effect: 'balancing',
          uses: 'nourishing, lubricating',
          season: 'best in fall/winter'
        },
        'Pitta': {
          effect: 'slightly increasing',
          uses: 'moderate use recommended',
          season: 'reduce in summer'
        },
        'Kapha': {
          effect: 'increasing',
          uses: 'use in moderation',
          season: 'minimal in spring'
        }
      },
      qualities: {
        'rasa': ['sweet', 'bitter'],
        'virya': 'warming',
        'vipaka': 'sweet'
      },
      benefits: [
        'enhances digestion',
        'improves memory',
        'strengthens nervous system',
        'supports joint health'
      ]
    }
  }
};
