import type { IngredientMapping } from '@/types/alchemy';

export const meats: Record<string, IngredientMapping> = {
  'beef_ribeye': {
    elementalProperties: { Fire: 0.4, Earth: 0.3, Water: 0.2 },
    qualities: ['marbled', 'rich', 'tender'],
    origin: ['Various'],
    category: 'meat',
    subCategory: 'beef',
    grades: {
      'Prime': {
        marbling: 'abundant',
        color: 'bright red',
        texture: 'firm, fine-grained',
        uses: 'high-end steakhouse, special occasions'
      },
      'Choice': {
        marbling: 'moderate to modest',
        color: 'red',
        texture: 'firm',
        uses: 'home cooking, restaurants'
      },
      'Select': {
        marbling: 'slight',
        color: 'red',
        texture: 'lean',
        uses: 'general purpose'
      }
    },
    aging: {
      'wet': {
        duration: '14-28 days',
        process: 'vacuum-sealed',
        results: 'tender, mild flavor'
      },
      'dry': {
        duration: '28-45 days',
        process: 'controlled environment',
        results: 'concentrated flavor, tender'
      }
    },
    cuts: {
      'bone_in': {
        weight: '16-24 oz',
        thickness: '1.5-2 inches',
        cooking: 'slower, more flavor'
      },
      'boneless': {
        weight: '12-16 oz',
        thickness: '1.25-1.5 inches',
        cooking: 'faster, even heat'
      }
    },
    culinaryApplications: {
      'grill': {
        method: 'direct high heat',
        temperature: {
          fahrenheit: 450,
          celsius: 232
        },
        timing: {
          'rare': '4-5 minutes per side',
          'medium_rare': '5-6 minutes per side',
          'medium': '6-7 minutes per side',
          'medium_well': '7-8 minutes per side',
          'well_done': '8-9 minutes per side'
        },
        internalTemp: {
          'rare': { fahrenheit: 125, celsius: 52 },
          'medium_rare': { fahrenheit: 135, celsius: 57 },
          'medium': { fahrenheit: 145, celsius: 63 },
          'medium_well': { fahrenheit: 150, celsius: 66 },
          'well_done': { fahrenheit: 160, celsius: 71 }
        },
        techniques: {
          'reverse_sear': {
            method: 'low heat then high heat sear',
            notes: 'More even cooking'
          },
          'direct_sear': {
            method: 'high heat then rest',
            notes: 'Traditional method'
          }
        },
        resting: {
          time: '8-10 minutes',
          method: 'loose foil tent',
          carryover: '5-10°F rise'
        }
      },
      'pan_sear': {
        method: 'cast iron or heavy skillet',
        temperature: 'very high heat',
        timing: {
          'pre_heat': '5-7 minutes',
          'sear': '4-5 minutes per side',
          'butter_baste': '2-3 minutes'
        },
        techniques: {
          'butter_basting': {
            ingredients: ['butter', 'garlic', 'thyme'],
            method: 'spoon butter over continuously'
          }
        }
      },
      'sous_vide': {
        method: 'vacuum sealed, water bath',
        temperature: {
          'rare': { fahrenheit: 125, celsius: 52 },
          'medium_rare': { fahrenheit: 131, celsius: 55 },
          'medium': { fahrenheit: 140, celsius: 60 }
        },
        timing: {
          'minimum': '1 hour',
          'maximum': '4 hours',
          'optimal': '2 hours'
        },
        finishing: {
          method: 'high heat sear',
          duration: '45-60 seconds per side',
          rest: '5 minutes'
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
        methods: ['grill', 'sous_vide'],
        marinadeTime: 'shorter',
        notes: 'Lighter seasoning'
      },
      'winter': {
        methods: ['pan_sear', 'roast'],
        marinadeTime: 'longer',
        notes: 'Heartier seasoning'
      }
    },
    storage: {
      fresh: {
        temperature: { fahrenheit: 34, celsius: 1 },
        duration: '3-5 days',
        method: 'wrapped, bottom shelf'
      },
      frozen: {
        temperature: { fahrenheit: 0, celsius: -18 },
        duration: '6-12 months',
        method: 'vacuum sealed'
      },
      thawing: {
        preferred: {
          method: 'refrigerator',
          time: '24-36 hours'
        },
        alternate: {
          method: 'cold water',
          time: '2-3 hours',
          notes: 'Change water every 30 minutes'
        }
      }
    },
    safetyThresholds: {
      minimum: { fahrenheit: 125, celsius: 52 },
      maximum: { fahrenheit: 160, celsius: 71 },
      dangerZone: {
        min: { fahrenheit: 40, celsius: 4 },
        max: { fahrenheit: 140, celsius: 60 }
      }
    }
  },
  'pork_belly': {
    elementalProperties: { Water: 0.4, Earth: 0.3, Fire: 0.2 },
    qualities: ['rich', 'fatty', 'versatile'],
    origin: ['Various'],
    category: 'meat',
    subCategory: 'pork',
    varieties: {
      'Fresh': {
        appearance: 'pink meat, white fat layers',
        texture: 'firm, layered',
        uses: 'braising, roasting, smoking'
      },
      'Cured': {
        appearance: 'pink throughout',
        texture: 'firm, dense',
        uses: 'bacon, pancetta'
      }
    },
    culinaryApplications: {
      'braise': {
        method: 'slow, moist heat',
        temperature: {
          fahrenheit: 300,
          celsius: 150
        },
        timing: {
          'preparation': '30 minutes',
          'cooking': '2.5-3 hours',
          'resting': '20 minutes'
        },
        techniques: {
          'chinese_style': {
            ingredients: ['soy sauce', 'rock sugar', 'star anise'],
            method: 'red braising',
            duration: '2-3 hours'
          },
          'italian_style': {
            ingredients: ['wine', 'herbs', 'aromatics'],
            method: 'wine braising',
            duration: '2.5-3 hours'
          }
        },
        liquid_ratio: '2/3 coverage',
        turning: 'every 30 minutes'
      },
      'roast': {
        method: 'dry heat, uncovered',
        temperature: {
          initial: { fahrenheit: 450, celsius: 230 },
          cooking: { fahrenheit: 325, celsius: 165 }
        },
        timing: {
          'initial_sear': '20 minutes',
          'per_pound': '45 minutes',
          'resting': '15-20 minutes'
        },
        techniques: {
          'crispy_skin': {
            method: 'score skin, salt rub',
            timing: 'salt 24h ahead'
          },
          'herb_crust': {
            method: 'herb paste coating',
            timing: 'apply before cooking'
          }
        }
      },
      'sous_vide': {
        method: 'vacuum sealed',
        temperature: {
          'tender': { fahrenheit: 170, celsius: 77 },
          'traditional': { fahrenheit: 180, celsius: 82 }
        },
        timing: {
          'minimum': '8 hours',
          'maximum': '24 hours',
          'optimal': '12 hours'
        },
        finishing: {
          'crispy_skin': {
            method: 'high heat roast',
            temperature: { fahrenheit: 450, celsius: 230 },
            duration: '20-30 minutes'
          }
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
        methods: ['grill', 'smoke'],
        marinades: {
          'citrus_based': {
            ingredients: ['citrus', 'garlic', 'herbs'],
            duration: '4-6 hours'
          },
          'asian_style': {
            ingredients: ['soy', 'ginger', 'rice wine'],
            duration: '6-8 hours'
          }
        },
        serving: 'lighter sides, fresh herbs'
      },
      'winter': {
        methods: ['braise', 'roast'],
        marinades: {
          'wine_based': {
            ingredients: ['red wine', 'aromatics', 'herbs'],
            duration: '8-12 hours'
          },
          'spice_forward': {
            ingredients: ['five spice', 'garlic', 'soy'],
            duration: '12-24 hours'
          }
        },
        serving: 'hearty sides, rich sauces'
      }
    },
    storage: {
      fresh: {
        temperature: { fahrenheit: 36, celsius: 2 },
        duration: '3-4 days',
        method: 'wrapped, bottom shelf'
      },
      frozen: {
        temperature: { fahrenheit: 0, celsius: -18 },
        duration: '4-6 months',
        method: 'vacuum sealed'
      }
    }
  },
  'lamb_rack': {
    elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['tender', 'rich', 'delicate'],
    origin: ['New Zealand', 'Australia', 'American'],
    category: 'meat',
    subCategory: 'lamb',
    varieties: {
      'Frenched': {
        appearance: 'cleaned rib bones',
        presentation: 'elegant',
        uses: 'roasting, grilling'
      },
      'Crown': {
        appearance: 'formed into circle',
        presentation: 'spectacular',
        uses: 'roasting, special occasions'
      }
    },
    culinaryApplications: {
      'herb_crust': {
        method: 'coat and roast',
        ingredients: {
          'classic': ['herbs', 'mustard', 'breadcrumbs'],
          'mediterranean': ['herbs', 'garlic', 'olive oil'],
          'middle_eastern': ['za\'atar', 'olive oil', 'garlic']
        },
        temperature: {
          fahrenheit: 375,
          celsius: 190
        },
        timing: {
          'rare': '20-25 minutes',
          'medium_rare': '25-30 minutes',
          'medium': '30-35 minutes'
        },
        techniques: {
          'mustard_base': {
            method: 'brush with mustard before herbs',
            notes: 'helps coating adhere'
          },
          'herb_paste': {
            method: 'process herbs with oil',
            notes: 'more intense flavor'
          }
        }
      },
      'reverse_sear': {
        method: 'low then high heat',
        temperature: {
          initial: { fahrenheit: 250, celsius: 120 },
          sear: { fahrenheit: 450, celsius: 230 }
        },
        timing: {
          'low_temp': '45-60 minutes',
          'rest': '10 minutes',
          'sear': '2-3 minutes per side'
        },
        internalTemp: {
          'rare': { fahrenheit: 120, celsius: 49 },
          'medium_rare': { fahrenheit: 130, celsius: 54 },
          'medium': { fahrenheit: 140, celsius: 60 }
        }
      }
    },
    seasonalAdjustments: {
      'spring': {
        marinades: {
          'herb_forward': {
            ingredients: ['fresh herbs', 'garlic', 'lemon'],
            duration: '4-6 hours'
          }
        },
        serving: 'fresh peas, mint sauce'
      },
      'winter': {
        marinades: {
          'robust': {
            ingredients: ['red wine', 'rosemary', 'garlic'],
            duration: '6-8 hours'
          }
        },
        serving: 'root vegetables, rich sauces'
      }
    }
  }
};
