import type { IngredientMapping } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawWholeGrains: Record<string, Partial<IngredientMapping>> = {
  'brown_rice': {
    name: 'Brown Rice',
    elementalProperties: { Earth: 0.5, Water: 0.3, Air: 0.1, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'capricorn'],
      elementalAffinity: {
        base: 'Earth',
        secondary: 'Water'
      }
    },
    qualities: ['nutty', 'chewy', 'wholesome'],
    category: 'whole_grain',
    varieties: {
      'short_grain': {
        characteristics: 'sticky, plump',
        cooking_ratio: '1:2 rice to water',
        cooking_time: '45-50 minutes'
      },
      'long_grain': {
        characteristics: 'fluffy, separate grains',
        cooking_ratio: '1:2.25 rice to water',
        cooking_time: '45-50 minutes'
      }
    },
    preparation: {
      'soaking': {
        duration: '8-12 hours',
        benefits: ['reduces cooking time', 'improves digestibility']
      },
      'cooking': {
        method: 'simmer covered',
        tips: ['do not stir', 'rest 10 minutes after']
      }
    }
  },

  'quinoa': {
    elementalProperties: { Earth: 0.4, Air: 0.4, Water: 0.2, Fire: 0 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Mercury'],
      favorableZodiac: ['cancer', 'gemini'],
      elementalAffinity: {
        base: 'Air',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercury' },
          second: { element: 'Earth', planet: 'Moon' },
          third: { element: 'Water', planet: 'Neptune' }
        }
      }
    },
    qualities: ['light', 'protein-rich', 'versatile'],
    category: 'whole_grain',
    varieties: {
      'white': {
        characteristics: 'mild, fluffy',
        cooking_ratio: '1:2 quinoa to water',
        cooking_time: '15-20 minutes'
      },
      'red': {
        characteristics: 'earthy, chewy',
        cooking_ratio: '1:2 quinoa to water',
        cooking_time: '15-20 minutes'
      }
    },
    preparation: {
      'rinsing': {
        duration: '1-2 minutes',
        purpose: 'remove saponins'
      },
      'cooking': {
        method: 'simmer covered',
        tips: ['fluff with fork', 'let stand 5 minutes']
      }
    }
  },

  'kamut': {
    name: 'Kamut',
    elementalProperties: { Earth: 0.5, Fire: 0.2, Air: 0.2, Water: 0.1 },
    qualities: ['buttery', 'rich', 'chewy'],
    category: 'whole_grain',
    culinaryApplications: {
      'basic_cooking': {
        ratio: '1:3 kamut to water',
        cooking_time: '60-90 minutes',
        method: 'simmer until tender'
      },
      'soaked_method': {
        soaking: '12-24 hours',
        cooking_time: '45-60 minutes',
        benefits: 'improved digestibility'
      }
    },
    preparations: {
      'grain_bowl': {
        method: 'cook until chewy',
        additions: ['roasted vegetables', 'herbs', 'dressing'],
        service: 'warm or room temperature'
      },
      'breakfast_porridge': {
        method: 'cook longer for softer texture',
        additions: ['dried fruit', 'nuts', 'honey'],
        service: 'hot'
      }
    },
    nutritionalProfile: {
      protein: 'high protein content',
      minerals: ['selenium', 'zinc', 'magnesium'],
      vitamins: ['e', 'b-complex'],
      calories_per_100g: 337,
      protein_g: 14.7,
      fiber_g: 11.1
    }
  },

  'spelt_berries': {
    name: 'Spelt Berries',
    elementalProperties: { Earth: 0.5, Fire: 0.2, Air: 0.2, Water: 0.1 },
    qualities: ['nutty', 'complex', 'hearty'],
    category: 'whole_grain',
    culinaryApplications: {
      'basic_cooking': {
        ratio: '1:3 spelt to water',
        cooking_time: '45-60 minutes',
        method: 'simmer until tender'
      },
      'pressure_cooker': {
        ratio: '1:2.5 spelt to water',
        cooking_time: '25-30 minutes',
        notes: 'natural release recommended'
      }
    },
    preparations: {
      'salads': {
        method: 'cook until al dente',
        additions: ['fresh vegetables', 'vinaigrette', 'herbs'],
        service: 'room temperature'
      },
      'soups': {
        method: 'add to broth',
        cooking_time: '30-40 minutes in soup',
        notes: 'adds hearty texture'
      }
    },
    nutritionalProfile: {
      protein: 'high quality',
      minerals: ['manganese', 'phosphorus', 'iron'],
      vitamins: ['b3', 'b6', 'thiamin'],
      calories_per_100g: 338,
      protein_g: 14.6,
      fiber_g: 10.7
    }
  },

  'einkorn': {
    name: 'Einkorn',
    elementalProperties: { Earth: 0.5, Fire: 0.2, Air: 0.2, Water: 0.1 },
    qualities: ['nutty', 'ancient', 'nutritious'],
    category: 'whole_grain',
    culinaryApplications: {
      'basic_cooking': {
        ratio: '1:2 einkorn to water',
        cooking_time: '30-35 minutes',
        method: 'simmer gently'
      },
      'risotto_style': {
        method: 'gradual broth addition',
        cooking_time: '25-30 minutes',
        notes: 'stir frequently'
      }
    },
    preparations: {
      'pilaf': {
        method: 'toast then simmer',
        additions: ['mushrooms', 'onions', 'herbs'],
        service: 'hot'
      },
      'breakfast': {
        method: 'cook until creamy',
        additions: ['milk', 'honey', 'fruit'],
        service: 'hot'
      }
    },
    nutritionalProfile: {
      protein: 'high protein',
      minerals: ['zinc', 'iron', 'manganese'],
      vitamins: ['a', 'b-complex'],
      calories_per_100g: 340,
      protein_g: 15.3,
      fiber_g: 8.7
    }
  },

  'rye_berries': {
    name: 'Rye Berries',
    elementalProperties: { Earth: 0.5, Water: 0.2, Air: 0.1, Fire: 0.2 },
    qualities: ['earthy', 'robust', 'hearty'],
    category: 'whole_grain',
    culinaryApplications: {
      'basic_cooking': {
        ratio: '1:3 rye to water',
        cooking_time: '60-75 minutes',
        method: 'simmer until tender'
      },
      'soaked_method': {
        soaking: '8-12 hours',
        cooking_time: '45-60 minutes',
        benefits: 'improved texture and digestibility'
      }
    },
    preparations: {
      'bread_making': {
        method: 'grind fresh',
        fermentation: 'longer rise time needed',
        notes: 'pairs well with sourdough'
      },
      'hearty_salads': {
        method: 'cook until chewy',
        additions: ['root vegetables', 'hardy greens', 'vinaigrette'],
        service: 'room temperature'
      }
    },
    nutritionalProfile: {
      protein: 'moderate protein',
      minerals: ['manganese', 'phosphorus', 'magnesium'],
      vitamins: ['b1', 'b3', 'b6'],
      calories_per_100g: 338,
      protein_g: 10.3,
      fiber_g: 15.1
    }
  },

  'wild_rice': {
    name: 'Wild Rice',
    elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
    qualities: ['nutty', 'complex', 'aromatic'],
    category: 'whole_grain',
    culinaryApplications: {
      'basic_cooking': {
        ratio: '1:3 rice to water',
        cooking_time: '45-55 minutes',
        method: 'simmer until grains split'
      },
      'pilaf_method': {
        steps: [
          'toast in oil',
          'add aromatics',
          'simmer in broth',
          'steam finish'
        ],
        notes: 'enhances nutty flavor'
      }
    },
    preparations: {
      'stuffing': {
        method: 'partially cook',
        additions: ['mushrooms', 'herbs', 'nuts'],
        service: 'hot'
      },
      'grain_blends': {
        method: 'mix with other rices',
        ratio: '1:2 wild to other rice',
        notes: 'adds texture and nutrition'
      }
    },
    nutritionalProfile: {
      protein: 'high protein',
      minerals: ['zinc', 'phosphorus', 'potassium'],
      vitamins: ['b6', 'folate', 'niacin'],
      calories_per_100g: 357,
      protein_g: 14.7,
      fiber_g: 6.2
    }
  },

  'triticale': {
    name: 'Triticale',
    elementalProperties: { Earth: 0.5, Fire: 0.2, Air: 0.2, Water: 0.1 },
    qualities: ['nutty', 'hybrid vigor', 'nutritious'],
    category: 'whole_grain',
    culinaryApplications: {
      'basic_cooking': {
        ratio: '1:3 triticale to water',
        cooking_time: '45-60 minutes',
        method: 'simmer until tender'
      },
      'overnight_method': {
        soaking: '8-12 hours',
        cooking_time: '30-40 minutes',
        benefits: 'quicker cooking, better absorption'
      }
    },
    preparations: {
      'breakfast_cereal': {
        method: 'cook until soft',
        additions: ['dried fruits', 'seeds', 'milk'],
        service: 'hot'
      },
      'grain_salad': {
        method: 'cook until chewy',
        additions: ['roasted vegetables', 'fresh herbs', 'citrus'],
        service: 'room temperature'
      }
    },
    nutritionalProfile: {
      protein: 'high protein',
      minerals: ['manganese', 'iron', 'copper'],
      vitamins: ['b1', 'b2', 'folate'],
      calories_per_100g: 336,
      protein_g: 13.1,
      fiber_g: 9.8
    }
  },

  'oats': {
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Moon' },
          second: { element: 'Water', planet: 'Venus' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Earth: 0.1, Water: 0.1 },
          preparationTips: ['Best for overnight oats']
        },
        fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ['Ideal for creamy porridge']
        }
      }
    },
    qualities: ['nutty', 'chewy', 'wholesome'],
    category: 'whole_grain',
    varieties: {
      'short_grain': {
        characteristics: 'sticky, plump',
        cooking_ratio: '1:2 rice to water',
        cooking_time: '45-50 minutes'
      },
      'long_grain': {
        characteristics: 'fluffy, separate grains',
        cooking_ratio: '1:2.25 rice to water',
        cooking_time: '45-50 minutes'
      }
    },
    preparation: {
      'soaking': {
        duration: '8-12 hours',
        benefits: ['reduces cooking time', 'improves digestibility']
      },
      'cooking': {
        method: 'simmer covered',
        tips: ['do not stir', 'rest 10 minutes after']
      }
    }
  },

  'barley': {
    name: 'Barley',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Moon'],
      favorableZodiac: ['cancer', 'taurus']
    },
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
    qualities: ['nutty', 'chewy', 'wholesome'],
    category: 'whole_grain',
    culinaryApplications: {
      'basic_cooking': {
        ratio: '1:3 barley to water',
        cooking_time: '60-75 minutes',
        method: 'simmer until tender'
      },
      'soaked_method': {
        soaking: '8-12 hours',
        cooking_time: '45-60 minutes',
        benefits: 'improved texture and digestibility'
      }
    },
    preparations: {
      'bread_making': {
        method: 'grind fresh',
        fermentation: 'longer rise time needed',
        notes: 'pairs well with sourdough'
      },
      'hearty_salads': {
        method: 'cook until chewy',
        additions: ['root vegetables', 'hardy greens', 'vinaigrette'],
        service: 'room temperature'
      }
    },
    nutritionalProfile: {
      protein: 'moderate protein',
      minerals: ['manganese', 'phosphorus', 'magnesium'],
      vitamins: ['b1', 'b3', 'b6'],
      calories_per_100g: 338,
      protein_g: 10.3,
      fiber_g: 15.1
    }
  }
};

// Fix the ingredient mappings to ensure they have all required properties
export const wholeGrains: Record<string, IngredientMapping> = fixIngredientMappings(rawWholeGrains);

export default wholeGrains;