import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawWholeGrains = {
  brown_rice: {
    name: 'Brown Rice',

    // Base elemental properties (unscaled)
    elementalProperties: { Earth: 0.5, Water: 0.3, Air: 0.1, Fire: 0.1 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 195, unit: 'g' }, // Standard serving: 1 cup cooked
    scaledElemental: { Earth: 0.50, Water: 0.30, Air: 0.10, Fire: 0.10 }, // Scaled for harmony (already balanced)
    alchemicalProperties: { Spirit: 0.100, Essence: 0.200, Matter: 0.400, Substance: 0.300 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.05, forceMagnitude: 0.90 }, // Mild warming, gentle force
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'capricorn', 'taurus'] as any[],
      elementalAffinity: {
        base: 'Earth',
        secondary: 'Water',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Saturn' },
          second: { element: 'Water', planet: 'Moon' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Earth: 0.1, Water: 0.05 },
          preparationTips: ['Begin sprouting process', 'Mindful cooking with minimal seasonings']
        },
        fullMoon: {
          elementalBoost: { Water: 0.15, Earth: 0.05 },
          preparationTips: ['Perfect for hearty dishes', 'Enhanced digestibility']
        },
        waxingCrescent: {
          elementalBoost: { Earth: 0.05, Water: 0.1 },
          preparationTips: ['Good for starting fermentations', 'Basic cooking methods']
        },
        firstQuarter: {
          elementalBoost: { Earth: 0.1, Air: 0.05 },
          preparationTips: ['Balanced seasonings', 'Good for everyday preparations']
        }
      },
      aspectEnhancers: ['Moon trine Venus', 'Saturn sextile Jupiter']
    },
    qualities: ['nutty', 'chewy', 'wholesome', 'earthy', 'grounding', 'nourishing'],
    origin: ['Asia', 'Global cultivation'],
    season: ['all'],
    category: 'whole_grain',
    subCategory: 'rice',
    nutritionalProfile: {
      serving_size: '1 / (2 || 1) cup cooked',
      calories: 108,
      macros: {
        protein: 2.5,
        carbs: 22.4,
        fat: 0.9,
        fiber: 1.8
},
      vitamins: {
        B1: 0.11,
        B3: 0.13,
        B6: 0.14,
        E: 0.08,
        folate: 0.04
},
      minerals: {
        manganese: 0.86,
        magnesium: 0.36,
        phosphorus: 0.33,
        selenium: 0.42,
        zinc: 0.18,
        copper: 0.11,
        iron: 0.1
},
      glycemic_index: 68,
      source: 'USDA FoodData Central'
},
    healthBenefits: {
      digestiveHealth: {
        benefit: 'Digestive Support',
        mechanism: 'Fiber content promotes healthy gut bacteria and regular bowel movements',
        evidence: 'Studies show whole grains increase beneficial gut microbiota diversity'
},
      heartHealth: {
        benefit: 'Cardiovascular Support',
        mechanism: 'Fiber, antioxidants, and minerals help manage cholesterol and blood pressure',
        evidence: 'Regular whole grain consumption associated with reduced heart disease risk'
},
      bloodSugarControl: {
        benefit: 'Blood Sugar Regulation',
        mechanism: 'Fiber and complex carbohydrates slow glucose absorption',
        evidence: 'Lower glycemic impact compared to refined white rice'
},
      weightManagement: {
        benefit: 'Weight Management',
        mechanism: 'Higher fiber content increases satiety and reduces overall calorie intake',
        evidence: 'Associated with lower BMI in observational studies'
},
      antioxidantEffects: {
        benefit: 'Antioxidant Activity',
        mechanism: 'Contains phenolic compounds that combat oxidative stress',
        compounds: ['ferulic acid', 'caffeic acid', 'sinapic acid'],
        notes: 'Most concentrated in the bran layer'
}
    },
    varieties: {
      short_grain: {
        name: 'Short Grain Brown Rice',
        characteristics: 'sticky, plump, tender',
        appearance: 'stubby, nearly round grains',
        flavor: 'nutty, slightly sweet',
        cooking_ratio: '1:2 rice to water',
        cooking_time: '45-50 minutes',
        best_for: 'sushi, risotto, puddings, sticky preparations',
      },
      long_grain: {
        name: 'Long Grain Brown Rice',
        characteristics: 'fluffy, separate grains, drier texture',
        appearance: 'slender, elongated grains',
        flavor: 'mild nutty taste',
        cooking_ratio: '1:2.25 rice to water',
        cooking_time: '45-50 minutes',
        best_for: 'pilafs, salads, stuffings, everyday use',
      },
      basmati: {
        name: 'Brown Basmati Rice',
        characteristics: 'aromatic, slender, distinctive fragrance',
        appearance: 'long, slender grains that elongate when cooked',
        flavor: 'nutty with distinctive aroma',
        cooking_ratio: '1:2 rice to water',
        cooking_time: '40-45 minutes',
        best_for: 'Indian dishes, pilafs, biryanis',
      },
      jasmine: {
        name: 'Brown Jasmine Rice',
        characteristics: 'aromatic, slightly clinging, soft',
        appearance: 'medium to long grain',
        flavor: 'floral aroma, subtle sweetness',
        cooking_ratio: '1:1.75 rice to water',
        cooking_time: '40-45 minutes',
        best_for: 'Southeast Asian cuisine, coconut-based dishes',
      },
      himalayan_red: {
        name: 'Himalayan Red Rice',
        characteristics: 'distinctive color, hearty texture',
        appearance: 'russet-colored, medium grain',
        flavor: 'robust, earthy, nutty',
        cooking_ratio: '1:2.5 rice to water',
        cooking_time: '45-50 minutes',
        best_for: 'substantial side dishes, grain bowls, salads',
      }
    },
    affinities: [
      'onions',
      'garlic',
      'ginger',
      'lentils',
      'beans',
      'soy sauce',
      'miso',
      'coconut milk',
      'vegetable broth',
      'mushrooms',
      'carrots',
      'peas',
      'leafy greens',
      'nuts',
      'seeds',
      'herbs',
      'curry spices',
      'citrus zest'
    ],
    cookingMethods: [
      'boil',
      'steam',
      'pilaf',
      'risotto',
      'pressure cook',
      'bake',
      'stuff',
      'soup',
      'porridge',
      'sprouted'
    ],
    preparation: {
      soaking: {
        duration: '8-12 hours',
        benefits: [
          'reduces cooking time by 10-15 minutes',
          'improves digestibility',
          'activates enzymes'
        ],
        method: 'room temperature water with optional splash of lemon juice or vinegar',
        notes: 'Discard soaking water and rinse before cooking'
},
      rinsing: {
        method: 'rinse in cool water until water runs clear',
        purpose: 'removes dust and excess starch',
        technique: 'swirl in bowl of water or use strainer',
        notes: 'Some prefer to skip for maximum nutrition retention'
},
      toasting: {
        method: 'dry toast in pan before cooking',
        benefits: 'enhances nutty flavor',
        timing: '3-5 minutes until fragrant',
        notes: 'Stir constantly to prevent burning'
}
    },
    culinaryApplications: {
      basic_method: {
        name: 'Basic Method',
        steps: [
          'rinse thoroughly',
          'soak (optional) 30 minutes to overnight',
          'combine with water (2 parts water to 1 part rice)',
          'bring to boil',
          'reduce heat to low simmer',
          'cover with tight-fitting lid',
          'cook 45-50 minutes',
          'rest 10 minutes off heat',
          'fluff with fork'
        ],
        tips: [
          'avoid lifting lid while cooking',
          'ensure tight-fitting lid',
          'fluff with fork after resting',
          'check for doneness - should be tender but slightly chewy'
        ],
        variations: {
          stovetop: 'traditional method as described above',
          rice_cooker: 'same ratio, select brown rice setting',
          pressure_cooker: '1:1.25 rice to water, high pressure 20-22 minutes, natural release',
        }
      },
      pilaf_method: {
        name: 'Pilaf Method',
        steps: [
          'sauté onions and aromatics in oil',
          'toast rice in oil until fragrant',
          'add hot liquid (stock preferred)',
          'bring to boil, then reduce heat',
          'simmer covered 45-50 minutes',
          'rest off heat 10 minutes'
        ],
        aromatics: ['onion', 'garlic', 'carrots', 'celery', 'spices', 'herbs'],
        variations: {
          mushroom: 'incorporate dried or fresh mushrooms, thyme',
          herb: 'use abundant fresh herbs, lemon zest',
          vegetable: 'add diced vegetables that hold up to long cooking'
},
        notes: 'Excellent way to add depth of flavor'
},
      grain_bowl: {
        name: 'Grain Bowl',
        components: {
          base: 'cooked brown rice',
          protein: ['tofu', 'tempeh', 'beans', 'lentils', 'eggs', 'fish'],
          vegetables: ['roasted', 'pickled', 'raw', 'fermented'],
          sauce: ['tahini-based', 'peanut', 'miso', 'vinaigrette'],
          toppings: ['seeds', 'nuts', 'herbs', 'sprouts', 'avocado']
        },
        preparation: 'Arrange components in individual bowls',
        variations: {
          asian_inspired: 'edamame, pickled vegetables, sesame, tamari-based sauce',
          mediterranean: 'chickpeas, cucumber, tomato, feta, herb-lemon dressing',
          mexican: 'black beans, corn, avocado, lime-cilantro dressing',
        },
        notes: 'Infinitely customizable to dietary preferences and what's on hand'
      },
      fried_rice: {
        name: 'Brown Fried Rice',
        preparation: 'best with day-old refrigerated rice',
        key_technique: 'high heat, continuous stirring, cook ingredients separately',
        essential_ingredients: ['oil with high smoke point', 'aromatics', 'eggs', 'vegetables'],
        variations: {
          classic: 'with peas, carrots, scrambled egg, green onion',
          kimchi: 'incorporate kimchi, sesame oil, gochujang',
          pineapple: 'with pineapple chunks, cashews, curry powder',
        },
        notes: 'Pre-cook and cool rice for best texture never use freshly cooked rice'
},
      rice_pudding: {
        name: 'Brown Rice Pudding',
        cooking_method: 'slow simmer with frequent stirring',
        key_ingredients: ['milk or plant milk', 'sweetener', 'spices', 'dried fruit'],
        variations: {
          classic: 'cinnamon, raisins, vanilla',
          coconut: 'coconut milk, cardamom, pistachios',
          chocolate: 'cocoa powder, almond milk, cherries',
        },
        notes: 'Takes longer than white rice pudding but has nuttier flavor'
}
    },
    storage: {
      uncooked: {
        airtight_container: {
          room_temperature: 'up to 6 months in cool, dark place',
          refrigerator: 'up to 1 year',
          freezer: 'up to 2 years',
          notes: 'Natural oils can go rancidso store properly'
}
      },

      sprouted: {
        refrigerator: {
          duration: '3-5 days',
          container: 'breathable container with paper towel',
          notes: 'Rinse daily if storing longer than 2 days'
}
      }
    },
    seasonalAdjustments: {},
    cuisineAffinity: {
      modern_health: {
        preparations: 'grain bowls, alternative sushi, veggie burgers',
        emphasis: 'nutrient density, whole foods philosophy',
        notes: 'Often featured in contemporary health-focused cuisines'
}
    }
  },

  quinoa: {
    name: 'Quinoa',
    elementalProperties: { Earth: 0.4, Air: 0.4, Water: 0.2, Fire: 0 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Mercury'],
      favorableZodiac: ['cancer', 'gemini'] as any[],
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
    varieties: {},
    preparation: {
      rinsing: {
        duration: '1-2 minutes',
        purpose: 'remove saponins'
}
    }
  },

  kamut: {
    name: 'Kamut',
    elementalProperties: { Earth: 0.5, Fire: 0.2, Air: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Earth'],
      favorableZodiac: ['Virgo', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['autumn']
    },
    qualities: ['buttery', 'rich', 'chewy'],
    category: 'whole_grain',
    culinaryApplications: {
      basic_cooking: {
        ratio: '1:3 kamut to water',
        cooking_time: '60-90 minutes',
        method: 'simmer until tender'
},
      soaked_method: {
        soaking: '12-24 hours',
        cooking_time: '45-60 minutes',
        benefits: 'improved digestibility'
}
    },
    preparations: {
      grain_bowl: {
        method: 'cook until chewy',
        additions: ['roasted vegetables', 'herbs', 'dressing'],
        service: 'warm or room temperature'
},
      breakfast_porridge: {
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

  spelt_berries: {
    name: 'Spelt Berries',
    elementalProperties: { Earth: 0.5, Fire: 0.2, Air: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Earth'],
      favorableZodiac: ['Virgo', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['autumn']
    },
    qualities: ['nutty', 'complex', 'hearty'],
    category: 'whole_grain',
    culinaryApplications: {
      basic_cooking: {
        ratio: '1:3 spelt to water',
        cooking_time: '45-60 minutes',
        method: 'simmer until tender'
},
      pressure_cooker: {
        ratio: '1:2.5 spelt to water',
        cooking_time: '25-30 minutes',
        notes: 'natural release recommended'
}
    },
    preparations: {
      salads: {
        method: 'cook until al dente',
        additions: ['fresh vegetables', 'vinaigrette', 'herbs'],
        service: 'room temperature'
},
      soups: {
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

  einkorn: {
    name: 'Einkorn',
    elementalProperties: { Earth: 0.5, Fire: 0.2, Air: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Venus'],
      favorableZodiac: ['Virgo', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['autumn']
    },
    qualities: ['nutty', 'ancient', 'nutritious'],
    category: 'whole_grain',
    culinaryApplications: {
      basic_cooking: {
        ratio: '1:2 einkorn to water',
        cooking_time: '30-35 minutes',
        method: 'simmer gently'
},
      risotto_style: {
        method: 'gradual broth addition',
        cooking_time: '25-30 minutes',
        notes: 'stir frequently'
}
    },
    preparations: {
      pilaf: {
        method: 'toast then simmer',
        additions: ['mushrooms', 'onions', 'herbs'],
        service: 'hot'
},
      breakfast: {
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

  rye_berries: {
    name: 'Rye Berries',
    elementalProperties: { Earth: 0.5, Water: 0.2, Air: 0.1, Fire: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Venus'],
      favorableZodiac: ['Virgo', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['autumn']
    },
    qualities: ['earthy', 'robust', 'hearty'],
    category: 'whole_grain',
    culinaryApplications: {
      basic_cooking: {
        ratio: '1:3 rye to water',
        cooking_time: '60-75 minutes',
        method: 'simmer until tender'
},
      soaked_method: {
        soaking: '8-12 hours',
        cooking_time: '45-60 minutes',
        benefits: 'improved texture and digestibility'
}
    },
    preparations: {
      bread_making: {
        method: 'grind fresh',
        fermentation: 'longer rise time needed',
        notes: 'pairs well with sourdough'
},
      hearty_salads: {
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

  wild_rice: {
    name: 'Wild Rice',
    elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Venus'],
      favorableZodiac: ['Virgo', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['autumn']
    },
    qualities: ['nutty', 'complex', 'aromatic'],
    category: 'whole_grain',
    culinaryApplications: {
      basic_cooking: {
        ratio: '1:3 rice to water',
        cooking_time: '45-55 minutes',
        method: 'simmer until grains split'
},
      pilaf_method: {
        steps: ['toast in oil', 'add aromatics', 'simmer in broth', 'steam finish'],
        notes: 'enhances nutty flavor'
}
    },
    preparations: {
      grain_blends: {
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

  triticale: {
    name: 'Triticale',
    elementalProperties: { Earth: 0.5, Fire: 0.2, Air: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Venus'],
      favorableZodiac: ['Virgo', 'Taurus', 'Capricorn'],
      seasonalAffinity: ['autumn']
    },
    qualities: ['nutty', 'hybrid vigor', 'nutritious'],
    category: 'whole_grain',
    culinaryApplications: {
      basic_cooking: {
        ratio: '1:3 triticale to water',
        cooking_time: '45-60 minutes',
        method: 'simmer until tender'
},
      overnight_method: {
        soaking: '8-12 hours',
        cooking_time: '30-40 minutes',
        benefits: 'quicker cooking, better absorption',
      }
    },
    preparations: {
      breakfast_cereal: {
        method: 'cook until soft',
        additions: ['dried fruits', 'seeds', 'milk'],
        service: 'hot'
},
      grain_salad: {
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

  oats: {
    name: 'Oats',
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'] as any[],
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
      short_grain: {
        characteristics: 'sticky, plump',
        cooking_ratio: '1:2 rice to water',
        cooking_time: '45-50 minutes'
},
      long_grain: {
        characteristics: 'fluffy, separate grains',
        cooking_ratio: '1:2.25 rice to water',
        cooking_time: '45-50 minutes'
}
    },
    preparation: {
      soaking: {
        duration: '8-12 hours',
        benefits: ['reduces cooking time', 'improves digestibility']
      }
    }
  },

  barley: {
    name: 'Barley',
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Moon'],
      favorableZodiac: ['cancer', 'taurus'] as any[]
    },
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
    qualities: ['nutty', 'chewy', 'wholesome'],
    category: 'whole_grain',
    culinaryApplications: {
      basic_cooking: {
        ratio: '1:3 barley to water',
        cooking_time: '60-75 minutes',
        method: 'simmer until tender'
},
      soaked_method: {
        soaking: '8-12 hours',
        cooking_time: '45-60 minutes',
        benefits: 'improved texture and digestibility'
}
    },
    preparations: {
      bread_making: {
        method: 'grind fresh',
        fermentation: 'longer rise time needed',
        notes: 'pairs well with sourdough'
},
      hearty_salads: {
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
  flour: {
    name: 'flour',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  rice: {
    name: 'rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  all_purpose_flour: {
    name: 'all-purpose flour',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  whole_grain_bread: {
    name: 'whole grain bread',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  steel_cut_oats: {
    name: 'steel-cut oats',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  breadcrumbs: {
    name: 'breadcrumbs',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  arborio_rice: {
    name: 'arborio rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  bread_stuffing: {
    name: 'bread stuffing',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  cheong_fun__rice_noodle_rolls_: {
    name: 'cheong fun (rice noodle rolls)',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  glutinous_rice: {
    name: 'glutinous rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  rustic_bread: {
    name: 'rustic bread',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  white_sandwich_bread: {
    name: 'white sandwich bread',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  idli_rice: {
    name: 'idli rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  flattened_rice: {
    name: 'flattened rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  basmati_rice: {
    name: 'basmati rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  steamed_rice: {
    name: 'steamed rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  sushi_rice: {
    name: 'sushi rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  short_grain_rice: {
    name: 'short grain rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  sliced_rice_cakes: {
    name: 'sliced rice cakes',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  rice_cakes: {
    name: 'rice cakes',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  rice_flour: {
    name: 'rice flour',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  flatbread: {
    name: 'flatbread',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  jasmine_rice: {
    name: 'jasmine rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  glass_noodles: {
    name: 'glass noodles',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  rice_noodles: {
    name: 'rice noodles',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  sticky_rice: {
    name: 'sticky rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  tapioca_flour: {
    name: 'tapioca flour',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  glutinous_rice_flour: {
    name: 'glutinous rice flour',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  thick_rice_noodles: {
    name: 'thick rice noodles',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
  broken_rice: {
    name: 'broken rice',
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    category: 'grains',
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'],
      seasonalAffinity: ['fall']
    }
  },
};

// Fix the ingredient mappings to ensure they have all required properties
// ✅ Pattern MM-1: Type assertion for ZodiacSign[] compatibility
export const, wholeGrains: Record<string, IngredientMapping> = fixIngredientMappings(rawWholeGrains);

// Create a collection of all whole grains
export const _allWholeGrains = Object.values(wholeGrains);

export default wholeGrains;
