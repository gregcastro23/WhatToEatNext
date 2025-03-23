import type { IngredientMapping } from '@/types/alchemy';

export const wholeGrains: Record<string, IngredientMapping> = {
  'brown_rice': {
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.1 },
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
      },
      'basmati': {
        characteristics: 'aromatic, slender',
        cooking_ratio: '1:2 rice to water',
        cooking_time: '40-45 minutes'
      }
    },
    culinaryApplications: {
      'basic_method': {
        steps: [
          'rinse thoroughly',
          'soak (optional) 30 minutes',
          'combine with water',
          'bring to boil',
          'simmer covered',
          'rest 10 minutes'
        ],
        tips: [
          'avoid lifting lid while cooking',
          'ensure tight-fitting lid',
          'fluff with fork after resting'
        ]
      },
      'pilaf_method': {
        steps: [
          'toast rice in oil',
          'add aromatics',
          'add hot liquid',
          'simmer covered',
          'rest off heat'
        ]
      }
    },
    seasonalAdjustments: {
      'summer': {
        preparations: ['cold rice salads', 'grain bowls'],
        pairings: ['fresh herbs', 'grilled vegetables'],
        service: 'room temperature'
      },
      'winter': {
        preparations: ['pilafs', 'casseroles'],
        pairings: ['roasted vegetables', 'hearty stews'],
        service: 'hot'
      }
    }
  },

  'whole_wheat_berries': {
    elementalProperties: { Earth: 0.5, Fire: 0.2, Air: 0.1 },
    qualities: ['chewy', 'hearty', 'robust'],
    category: 'whole_grain',
    culinaryApplications: {
      'basic_cooking': {
        ratio: '1:3 wheat to water',
        cooking_time: '60-75 minutes',
        method: 'simmer until tender'
      },
      'soaked_method': {
        soaking: '8-12 hours',
        cooking_time: '45-60 minutes',
        benefits: 'shorter cooking time, better digestion'
      }
    },
    preparations: {
      'salads': {
        method: 'cool after cooking',
        additions: ['vegetables', 'herbs', 'dressing'],
        service: 'room temperature'
      },
      'pilafs': {
        method: 'cook with aromatics',
        additions: ['vegetables', 'spices'],
        service: 'hot'
      }
    }
  },

  'whole_oat_groats': {
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.1 },
    qualities: ['creamy', 'hearty', 'nutritious'],
    category: 'whole_grain',
    culinaryApplications: {
      'basic_cooking': {
        ratio: '1:3 oats to water',
        cooking_time: '45-60 minutes',
        method: 'simmer until tender'
      },
      'overnight_method': {
        ratio: '1:2 oats to water',
        soaking: '8-12 hours',
        cooking_time: '20-30 minutes'
      }
    },
    preparations: {
      'breakfast': {
        sweet: {
          additions: ['fruit', 'nuts', 'honey'],
          spices: ['cinnamon', 'nutmeg']
        },
        savory: {
          additions: ['eggs', 'vegetables', 'herbs'],
          seasonings: ['salt', 'pepper', 'spices']
        }
      }
    }
  },

  'whole_rye_berries': {
    elementalProperties: { Earth: 0.5, Water: 0.2, Air: 0.1 },
    qualities: ['earthy', 'dense', 'robust'],
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
        notes: 'recommended for better digestion'
      }
    },
    preparations: {
      'nordic_style': {
        method: 'cooked with aromatics',
        additions: ['mushrooms', 'root vegetables'],
        service: 'hot'
      }
    }
  },

  'cooking_methods': {
    'basic_principles': {
      'liquid_ratios': {
        notes: 'may need adjustment based on:',
        factors: [
          'grain freshness',
          'desired texture',
          'cooking method',
          'altitude'
        ]
      },
      'timing': {
        notes: 'done when:',
        indicators: [
          'tender but chewy',
          'liquid absorbed',
          'slight resistance to bite'
        ]
      }
    },
    'troubleshooting': {
      'too_chewy': {
        solution: 'cook longer',
        adjustment: 'add hot water if needed'
      },
      'too_soft': {
        solution: 'reduce liquid next time',
        recovery: 'use in soups or patties'
      },
      'not_done_liquid_gone': {
        solution: 'add hot water',
        prevention: 'check seal on lid'
      }
    }
  },

  'storage': {
    'whole_grains': {
      'room_temperature': {
        conditions: 'cool, dry place',
        container: 'airtight',
        duration: 'up to 6 months'
      },
      'refrigerated': {
        conditions: 'airtight container',
        duration: 'up to 1 year'
      },
      'frozen': {
        conditions: 'freezer-safe container',
        duration: 'up to 2 years'
      }
    },
    'cooked_grains': {
      'refrigerated': {
        duration: '3-5 days',
        container: 'airtight',
        reheating: 'add splash of water'
      },
      'frozen': {
        duration: 'up to 6 months',
        packaging: 'portion-sized containers',
        thawing: 'refrigerator overnight'
      }
    }
  },

  'grain_specific_nutrients': {
    'brown_rice': {
      'nutrients_per_100g': {
        'calories': 111,
        'protein': 2.6,
        'fiber': 3.5,
        'key_minerals': {
          'manganese': '88% DV',
          'magnesium': '12% DV',
          'phosphorus': '8% DV',
          'selenium': '14% DV'
        },
        'vitamins': {
          'B1': '12% DV',
          'B6': '15% DV',
          'niacin': '8% DV'
        }
      },
      'preparation_notes': 'gentle cooking preserves nutrients'
    },
    'wheat_berries': {
      'nutrients_per_100g': {
        'calories': 339,
        'protein': 13.2,
        'fiber': 10.7,
        'key_minerals': {
          'manganese': '136% DV',
          'selenium': '89% DV',
          'phosphorus': '34% DV',
          'magnesium': '38% DV'
        },
        'vitamins': {
          'B1': '38% DV',
          'B3': '32% DV',
          'B6': '25% DV'
        }
      },
      'preparation_notes': 'thorough cooking essential for digestion'
    },
    'oat_groats': {
      'nutrients_per_100g': {
        'calories': 389,
        'protein': 16.9,
        'fiber': 10.6,
        'key_minerals': {
          'manganese': '246% DV',
          'phosphorus': '52% DV',
          'magnesium': '44% DV',
          'iron': '26% DV'
        },
        'vitamins': {
          'B1': '51% DV',
          'B5': '27% DV',
          'folate': '14% DV'
        }
      },
      'preparation_notes': 'soaking improves beta-glucan availability'
    },
    'rye_berries': {
      'nutrients_per_100g': {
        'calories': 338,
        'protein': 10.3,
        'fiber': 15.1,
        'key_minerals': {
          'manganese': '143% DV',
          'phosphorus': '38% DV',
          'magnesium': '33% DV',
          'zinc': '20% DV'
        },
        'vitamins': {
          'B1': '32% DV',
          'B3': '16% DV',
          'B6': '23% DV'
        }
      },
      'preparation_notes': 'extended cooking needed for optimal texture'
    }
  },

  'advanced_preparation_techniques': {
    'optimal_soaking': {
      'temperature_control': {
        'room_temp': '65-75°F (18-24°C)',
        'duration': {
          'soft_grains': '6-8 hours',
          'hard_grains': '12-24 hours'
        },
        'water_quality': 'filtered preferred'
      },
      'acid_addition': {
        'purpose': 'enhance mineral availability',
        'options': {
          'lemon_juice': '1 Tbsp per cup water',
          'apple_cider_vinegar': '1 Tbsp per cup water',
          'whey': '2 Tbsp per cup water'
        },
        'timing': 'add at start of soak'
      }
    },
    'precision_cooking': {
      'timing_by_altitude': {
        'sea_level': 'standard timing',
        '2500_ft': 'add 5-10% time',
        '5000_ft': 'add 15-20% time',
        '7500_ft': 'add 25-30% time'
      },
      'water_adjustments': {
        'humid_climate': 'reduce liquid by 5%',
        'dry_climate': 'increase liquid by 5-10%',
        'altitude': 'increase liquid by 2-3% per 1000 ft'
      },
      'doneness_tests': {
        'visual': 'grain should be slightly expanded',
        'texture': 'tender but chewy',
        'bite_test': 'no hard center'
      }
    },
    'texture_optimization': {
      'for_salads': {
        'method': 'slight undercook',
        'cooling': 'rinse immediately',
        'dressing': 'apply while warm'
      },
      'for_porridge': {
        'method': 'longer cook with extra liquid',
        'stirring': 'frequent for creaminess',
        'finish': 'rest covered 10 minutes'
      },
      'for_pilafs': {
        'method': 'toast then cook until just done',
        'resting': 'essential for 10-15 minutes',
        'fluffing': 'gentle fork separation'
      }
    },
    'batch_cooking': {
      'cooling': {
        'method': 'spread on sheet pan',
        'timing': 'cool completely before storing',
        'storage': 'portion appropriately'
      },
      'reheating': {
        'stovetop': {
          'method': 'add splash of water',
          'heat': 'low with occasional stirring'
        },
        'microwave': {
          'method': 'sprinkle water, cover',
          'timing': 'short intervals, stir between'
        }
      }
    }
  },

  'amaranth': {
    elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
    qualities: ['nutty', 'peppery', 'dense'],
    category: 'pseudo_grain',
    culinaryApplications: {
      'basic_cooking': {
        ratio: '1:3 amaranth to water',
        cooking_time: '20-25 minutes',
        method: 'simmer until creamy'
      },
      'popped_method': {
        method: 'dry heat in pan',
        notes: 'pops like tiny popcorn',
        uses: 'topping, snacks'
      }
    },
    preparations: {
      'porridge': {
        method: 'cook until creamy',
        additions: ['fruit', 'nuts', 'honey'],
        service: 'hot'
      },
      'pilaf_blend': {
        method: 'mix with other grains',
        ratio: '1:4 amaranth to other grains',
        notes: 'becomes gummy if too much'
      }
    },
    nutritionalProfile: {
      protein: 'complete protein',
      minerals: ['iron', 'magnesium', 'phosphorus'],
      vitamins: ['b6', 'folate'],
      calories_per_100g: 371,
      protein_g: 13.6,
      fiber_g: 6.7
    }
  },

  'buckwheat': {
    elementalProperties: { Earth: 0.5, Water: 0.2, Air: 0.2, Fire: 0.1 },
    qualities: ['earthy', 'robust', 'hearty'],
    category: 'pseudo_grain',
    culinaryApplications: {
      'basic_cooking': {
        ratio: '1:2 buckwheat to water',
        cooking_time: '15-20 minutes',
        method: 'simmer until tender'
      },
      'kasha_method': {
        steps: [
          'toast groats',
          'coat with egg (optional)',
          'add to boiling water',
          'simmer covered'
        ]
      }
    },
    preparations: {
      'breakfast': {
        method: 'cook until creamy',
        additions: ['milk', 'honey', 'fruit'],
        service: 'hot'
      },
      'savory_side': {
        method: 'pilaf style',
        additions: ['mushrooms', 'onions', 'herbs'],
        service: 'hot'
      }
    },
    nutritionalProfile: {
      protein: 'high quality',
      minerals: ['manganese', 'copper', 'magnesium'],
      vitamins: ['b6', 'niacin'],
      calories_per_100g: 343,
      protein_g: 13.3,
      fiber_g: 10
    }
  },

  'chia': {
    elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
    qualities: ['gelatinous', 'mild', 'versatile'],
    category: 'pseudo_grain',
    culinaryApplications: {
      'pudding_method': {
        ratio: '1:4 chia to liquid',
        setting_time: '4 hours or overnight',
        notes: 'stir occasionally first 10 minutes'
      },
      'gel_method': {
        ratio: '1:9 chia to water',
        uses: ['egg substitute', 'thickener'],
        notes: 'let stand 15 minutes'
      }
    },
    preparations: {
      'breakfast_pudding': {
        method: 'combine with liquid',
        additions: ['fruit', 'nuts', 'sweetener'],
        service: 'chilled'
      },
      'smoothie_addition': {
        method: 'blend or sprinkle',
        ratio: '1-2 tbsp per serving',
        notes: 'thickens if left to stand'
      }
    },
    nutritionalProfile: {
      omega3: 'very high',
      minerals: ['calcium', 'phosphorus', 'zinc'],
      vitamins: ['b1', 'b3'],
      calories_per_100g: 486,
      protein_g: 16.5,
      fiber_g: 34.4
    }
  },

  'teff': {
    elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
    qualities: ['nutty', 'sweet', 'fine'],
    category: 'pseudo_grain',
    culinaryApplications: {
      'basic_cooking': {
        ratio: '1:3 teff to water',
        cooking_time: '15-20 minutes',
        method: 'simmer until tender'
      },
      'porridge_method': {
        ratio: '1:4 teff to water',
        cooking_time: '20 minutes',
        notes: 'stir frequently for creamy texture'
      }
    },
    preparations: {
      'breakfast_porridge': {
        method: 'cook until creamy',
        additions: ['dates', 'nuts', 'cinnamon'],
        service: 'hot'
      },
      'polenta_style': {
        method: 'cook until very thick',
        additions: ['herbs', 'cheese', 'butter'],
        service: 'hot or cooled and sliced'
      }
    },
    nutritionalProfile: {
      protein: 'complete protein',
      minerals: ['iron', 'calcium', 'zinc'],
      vitamins: ['b6', 'thiamin'],
      calories_per_100g: 367,
      protein_g: 13.3,
      fiber_g: 8.0
    }
  },

  'millet': {
    elementalProperties: { Earth: 0.4, Air: 0.3, Water: 0.2, Fire: 0.1 },
    qualities: ['mild', 'fluffy', 'versatile'],
    category: 'pseudo_grain',
    culinaryApplications: {
      'basic_cooking': {
        ratio: '1:2.5 millet to water',
        cooking_time: '20-25 minutes',
        method: 'simmer until tender'
      },
      'toasted_method': {
        steps: [
          'toast in dry pan',
          'add hot liquid',
          'simmer covered',
          'fluff with fork'
        ],
        notes: 'toasting enhances nutty flavor'
      }
    },
    preparations: {
      'pilaf': {
        method: 'fluffier texture',
        ratio: '1:2 millet to water',
        additions: ['vegetables', 'herbs', 'spices']
      },
      'porridge': {
        method: 'creamier texture',
        ratio: '1:3 millet to water',
        additions: ['milk', 'sweetener', 'fruit']
      }
    },
    nutritionalProfile: {
      protein: 'good quality',
      minerals: ['magnesium', 'phosphorus', 'iron'],
      vitamins: ['b3', 'b6', 'folate'],
      calories_per_100g: 378,
      protein_g: 11.0,
      fiber_g: 8.5
    }
  },

  'sorghum': {
    elementalProperties: { Earth: 0.5, Fire: 0.2, Air: 0.2, Water: 0.1 },
    qualities: ['mild', 'chewy', 'sturdy'],
    category: 'pseudo_grain',
    culinaryApplications: {
      'basic_cooking': {
        ratio: '1:3 sorghum to water',
        cooking_time: '45-60 minutes',
        method: 'simmer until tender'
      },
      'popped_method': {
        method: 'dry heat in covered pan',
        notes: 'pops like popcorn',
        uses: 'snacks, toppings'
      }
    },
    preparations: {
      'grain_bowl': {
        method: 'cook until tender',
        additions: ['roasted vegetables', 'proteins', 'sauces'],
        service: 'warm or room temperature'
      },
      'flour_uses': {
        method: 'mill into flour',
        applications: ['baking', 'thickening'],
        notes: 'gluten-free alternative'
      }
    },
    nutritionalProfile: {
      protein: 'moderate',
      minerals: ['iron', 'zinc', 'magnesium'],
      vitamins: ['b6', 'niacin', 'thiamin'],
      calories_per_100g: 329,
      protein_g: 10.6,
      fiber_g: 6.7
    }
  }
};

export default wholeGrains;
