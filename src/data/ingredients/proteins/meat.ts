import type { IngredientMapping } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawMeats: Record<string, Partial<IngredientMapping>> = {
  'beef_ribeye': {
    name: 'Beef Ribeye',
    elementalProperties: { Fire: 0.4, Earth: 0.3, Water: 0.2, Air: 0.1 },
    qualities: ['marbled', 'rich', 'tender'],
    season: ['all'],
    category: 'protein',
    subCategory: 'beef',
    affinities: ['garlic', 'rosemary', 'thyme', 'black pepper'],
    cookingMethods: ['grill', 'pan_sear', 'sous_vide', 'reverse_sear'],
    grades: {
      'Prime': {
    name: 'Prime',
        marbling: 'abundant',
        color: 'bright red',
        texture: 'firm, fine-grained',
        uses: 'high-end steakhouse, special occasions'
      },
      'Choice': {
    name: 'Choice',
        marbling: 'moderate to modest',
        color: 'red',
        texture: 'firm',
        uses: 'home cooking, restaurants'
      },
      'Select': {
    name: 'Select',
        marbling: 'slight',
        color: 'red',
        texture: 'lean',
        uses: 'general purpose'
      }
    },
    aging: {
      'wet': {
    name: 'Wet',
        duration: '14-28 days',
        process: 'vacuum-sealed',
        results: 'tender, mild flavor'
      },
      'dry': {
    name: 'Dry',
        duration: '28-45 days',
        process: 'controlled environment',
        results: 'concentrated flavor, tender'
      }
    },
    cuts: {
      'bone_in': {
    name: 'Bone In',
        weight: '16-24 oz',
        thickness: '1.5-2 inches',
        cooking: 'slower, more flavor'
      },
      'boneless': {
    name: 'Boneless',
        weight: '12-16 oz',
        thickness: '1.25-1.5 inches',
        cooking: 'faster, even heat'
      }
    },
    culinaryApplications: {
      'grill': {
    name: 'Grill',
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
          'rare': {
    name: 'Rare', fahrenheit: 125, celsius: 52 },
          'medium_rare': {
    name: 'Medium Rare', fahrenheit: 135, celsius: 57 },
          'medium': {
    name: 'Medium', fahrenheit: 145, celsius: 63 },
          'medium_well': {
    name: 'Medium Well', fahrenheit: 150, celsius: 66 },
          'well_done': {
    name: 'Well Done', fahrenheit: 160, celsius: 71 }
        },
        techniques: {
          'reverse_sear': {
    name: 'Reverse Sear',
            method: 'low heat then high heat sear',
            notes: 'More even cooking'
          },
          'direct_sear': {
    name: 'Direct Sear',
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
    name: 'Pan Sear',
        method: 'cast iron or heavy skillet',
        temperature: 'very high heat',
        timing: {
          'pre_heat': '5-7 minutes',
          'sear': '4-5 minutes per side',
          'butter_baste': '2-3 minutes'
        },
        techniques: {
          'butter_basting': {
    name: 'Butter Basting',
            ingredients: ['butter', 'garlic', 'thyme'],
            method: 'spoon butter over continuously'
          }
        }
      },
      'sous_vide': {
    name: 'Sous Vide',
        method: 'vacuum sealed, water bath',
        temperature: {
          'rare': {
    name: 'Rare', fahrenheit: 125, celsius: 52 },
          'medium_rare': {
    name: 'Medium Rare', fahrenheit: 131, celsius: 55 },
          'medium': {
    name: 'Medium', fahrenheit: 140, celsius: 60 }
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
    name: 'Summer',
        methods: ['grill', 'sous_vide'],
        marinadeTime: 'shorter',
        notes: 'Lighter seasoning'
      },
      'winter': {
    name: 'Winter',
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
    name: 'Pork Belly',
    elementalProperties: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
    qualities: ['rich', 'fatty', 'versatile'],
    season: ['all'],
    category: 'protein',
    subCategory: 'pork',
    affinities: ['soy sauce', 'ginger', 'garlic', 'five spice'],
    cookingMethods: ['braise', 'roast', 'sous_vide', 'smoke'],
    varieties: {
      'Fresh': {
    name: 'Fresh',
        appearance: 'pink meat, white fat layers',
        texture: 'firm, layered',
        uses: 'braising, roasting, smoking'
      },
      'Cured': {
    name: 'Cured',
        appearance: 'pink throughout',
        texture: 'firm, dense',
        uses: 'bacon, pancetta'
      }
    },
    culinaryTraditions: {
      'chinese': {
        name: 'dong po rou',
        usage: ['braised', 'red cooked'],
        preparation: 'slow braised with soy and spices',
        pairings: ['rice', 'bok choy', 'mushrooms'],
        cultural_notes: 'Classic dish from Hangzhou'
      },
      'korean': {
        name: 'samgyeopsal',
        usage: ['grilled', 'barbecued'],
        preparation: 'sliced and grilled at table',
        pairings: ['kimchi', 'lettuce wraps', 'ssamjang'],
        cultural_notes: 'Essential Korean BBQ item'
      }
    },
    culinaryApplications: {
      'braise': {
    name: 'Braise',
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
    name: 'Chinese Style',
            ingredients: ['soy sauce', 'rock sugar', 'star anise'],
            method: 'red braising',
            duration: '2-3 hours'
          },
          'italian_style': {
    name: 'Italian Style',
            ingredients: ['wine', 'herbs', 'aromatics'],
            method: 'wine braising',
            duration: '2.5-3 hours'
          }
        },
        liquid_ratio: '2/3 coverage',
        turning: 'every 30 minutes'
      },
      'roast': {
    name: 'Roast',
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
    name: 'Crispy Skin',
            method: 'score skin, salt rub',
            timing: 'salt 24h ahead'
          },
          'herb_crust': {
    name: 'Herb Crust',
            method: 'herb paste coating',
            timing: 'apply before cooking'
          }
        }
      },
      'sous_vide': {
    name: 'Sous Vide',
        method: 'vacuum sealed',
        temperature: {
          'tender': {
    name: 'Tender', fahrenheit: 170, celsius: 77 },
          'traditional': {
    name: 'Traditional', fahrenheit: 180, celsius: 82 }
        },
        timing: {
          'minimum': '8 hours',
          'maximum': '24 hours',
          'optimal': '12 hours'
        },
        finishing: {
          'crispy_skin': {
    name: 'Crispy Skin',
            method: 'high heat roast',
            temperature: { fahrenheit: 450, celsius: 230 },
            duration: '20-30 minutes'
          }
        }
      }
    },
    seasonalAdjustments: {
      'summer': {
    name: 'Summer',
        methods: ['grill', 'smoke'],
        marinades: {
          'citrus_based': {
    name: 'Citrus Based',
            ingredients: ['citrus', 'garlic', 'herbs'],
            duration: '4-6 hours'
          },
          'asian_style': {
    name: 'Asian Style',
            ingredients: ['soy', 'ginger', 'rice wine'],
            duration: '6-8 hours'
          }
        },
        serving: 'lighter sides, fresh herbs'
      },
      'winter': {
    name: 'Winter',
        methods: ['braise', 'roast'],
        marinades: {
          'wine_based': {
    name: 'Wine Based',
            ingredients: ['red wine', 'aromatics', 'herbs'],
            duration: '8-12 hours'
          },
          'spice_forward': {
    name: 'Spice Forward',
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
    name: 'Lamb Rack',
    elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 },
    qualities: ['tender', 'rich', 'delicate'],
    season: ['spring', 'winter'],
    category: 'protein',
    subCategory: 'lamb',
    affinities: ['rosemary', 'garlic', 'mint', 'olive oil'],
    cookingMethods: ['roast', 'grill', 'herb_crust'],
    culinaryTraditions: {
      'french': {
        name: 'carré d\'agneau',
        usage: ['herb crusted', 'roasted'],
        preparation: 'frenched and herb crusted',
        pairings: ['mint sauce', 'roasted vegetables', 'wine reduction'],
        cultural_notes: 'Classic French preparation'
      },
      'mediterranean': {
        name: 'rack of lamb',
        usage: ['grilled', 'herb crusted'],
        preparation: 'marinated with herbs and garlic',
        pairings: ['tzatziki', 'lemon', 'oregano'],
        cultural_notes: 'Popular in Greek cuisine'
      }
    },
    varieties: {
      'Frenched': {
    name: 'Frenched',
        appearance: 'cleaned rib bones',
        presentation: 'elegant',
        uses: 'roasting, grilling'
      },
      'Crown': {
    name: 'Crown',
        appearance: 'formed into circle',
        presentation: 'spectacular',
        uses: 'roasting, special occasions'
      }
    },
    culinaryApplications: {
      'herb_crust': {
    name: 'Herb Crust',
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
    name: 'Mustard Base',
            method: 'brush with mustard before herbs',
            notes: 'helps coating adhere'
          },
          'herb_paste': {
    name: 'Herb Paste',
            method: 'process herbs with oil',
            notes: 'more intense flavor'
          }
        }
      },
      'reverse_sear': {
    name: 'Reverse Sear',
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
          'rare': {
    name: 'Rare', fahrenheit: 120, celsius: 49 },
          'medium_rare': {
    name: 'Medium Rare', fahrenheit: 130, celsius: 54 },
          'medium': {
    name: 'Medium', fahrenheit: 140, celsius: 60 }
        }
      }
    },
    seasonalAdjustments: {
      'spring': {
    name: 'Spring',
        marinades: {
          'herb_forward': {
    name: 'Herb Forward',
            ingredients: ['fresh herbs', 'garlic', 'lemon'],
            duration: '4-6 hours'
          }
        },
        serving: 'fresh peas, mint sauce'
      },
      'winter': {
    name: 'Winter',
        marinades: {
          'robust': {
    name: 'Robust',
            ingredients: ['red wine', 'rosemary', 'garlic'],
            duration: '6-8 hours'
          }
        },
        serving: 'root vegetables, rich sauces'
      }
    }
  },
  'duck_breast': {
    name: 'Duck Breast',
    elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Moon'],
      favorableZodiac: ['taurus', 'cancer', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Venus' },
          second: { element: 'Water', planet: 'Moon' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      }
    },
    qualities: ['rich', 'tender', 'versatile'],
    season: ['fall', 'winter'],
    category: 'protein',
    subCategory: 'poultry',
    affinities: ['orange', 'cherry', 'star anise', 'thyme'],
    cookingMethods: ['pan_sear', 'sous_vide', 'smoke', 'confit'],
    varieties: {
      'Pekin': {
    name: 'Pekin',
        appearance: 'smaller, tender',
        texture: 'delicate fat layer',
        uses: 'quick cooking, restaurants'
      },
      'Muscovy': {
    name: 'Muscovy',
        appearance: 'larger, leaner',
        texture: 'firm meat, thick fat',
        uses: 'traditional French cuisine'
      }
    },
    culinaryTraditions: {
      'french': {
        name: 'magret de canard',
        usage: ['pan seared', 'medium rare'],
        preparation: 'score fat, render slowly',
        pairings: ['orange sauce', 'cherry gastrique', 'wild mushrooms'],
        cultural_notes: 'Classic bistro dish'
      },
      'chinese': {
        name: 'pipa duck',
        usage: ['roasted', 'glazed'],
        preparation: 'air dried, honey glazed',
        pairings: ['scallions', 'hoisin sauce', 'pancakes'],
        cultural_notes: 'Refined Cantonese preparation'
      }
    },
    preparation: {
      scoring: 'diamond pattern in fat',
      resting: '10-15 minutes after cooking',
      notes: 'Fat must render slowly'
    },
    storage: {
      fresh: {
        temperature: { fahrenheit: 34, celsius: 1 },
        duration: '2-3 days',
        method: 'wrapped, bottom shelf'
      },
      frozen: {
        temperature: { fahrenheit: 0, celsius: -18 },
        duration: '4-6 months',
        method: 'vacuum sealed'
      }
    }
  },
  'veal_osso_buco': {
    name: 'Veal Osso Buco',
    elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
    qualities: ['tender', 'gelatinous', 'rich'],
    season: ['fall', 'winter'],
    category: 'protein',
    subCategory: 'veal',
    affinities: ['white wine', 'garlic', 'citrus zest', 'tomatoes'],
    cookingMethods: ['braise', 'slow_cook', 'dutch_oven'],
    culinaryTraditions: {
      'italian': {
        name: 'osso buco alla milanese',
        usage: ['braised', 'special occasions'],
        preparation: 'tied with string, braised in wine',
        pairings: ['risotto milanese', 'gremolata', 'polenta'],
        cultural_notes: 'Traditional Milanese specialty'
      },
      'french': {
        name: 'jarret de veau',
        usage: ['braised', 'slow cooked'],
        preparation: 'wine and herb braised',
        pairings: ['root vegetables', 'herb bouquet', 'crusty bread'],
        cultural_notes: 'Classic bistro preparation'
      }
    },
    preparation: {
      tying: 'secure with kitchen twine',
      browning: 'sear all sides well',
      braising: 'partially submerged',
      notes: 'Keep marrow in bones'
    },
    storage: {
      fresh: {
        temperature: { fahrenheit: 34, celsius: 1 },
        duration: '2-3 days',
        method: 'wrapped, bottom shelf'
      },
      frozen: {
        temperature: { fahrenheit: 0, celsius: -18 },
        duration: '4-6 months',
        method: 'vacuum sealed'
      }
    }
  },
  'venison_loin': {
    name: 'Venison Loin',
    elementalProperties: { Fire: 0.3, Air: 0.3, Earth: 0.2, Water: 0.2 },
    qualities: ['lean', 'tender', 'gamey'],
    season: ['fall', 'winter'],
    category: 'protein',
    subCategory: 'game',
    affinities: ['juniper', 'red wine', 'mushrooms', 'blackberries'],
    cookingMethods: ['pan_sear', 'grill', 'sous_vide'],
    varieties: {
      'Farm_Raised': {
    name: 'Farm Raised',
        appearance: 'deep red, consistent',
        texture: 'tender, mild flavor',
        uses: 'versatile cooking methods'
      },
      'Wild': {
    name: 'Wild',
        appearance: 'darker red, varied',
        texture: 'firmer, stronger flavor',
        uses: 'traditional game dishes'
      }
    },
    culinaryTraditions: {
      'german': {
        name: 'hirschrücken',
        usage: ['roasted', 'special occasions'],
        preparation: 'juniper and wine marinade',
        pairings: ['spätzle', 'red cabbage', 'mushroom sauce'],
        cultural_notes: 'Traditional hunting season dish'
      },
      'scottish': {
        name: 'venison loin',
        usage: ['pan seared', 'roasted'],
        preparation: 'whisky and herb marinade',
        pairings: ['neeps and tatties', 'berry sauce'],
        cultural_notes: 'Highland specialty'
      }
    },
    preparation: {
      marinating: '4-8 hours recommended',
      resting: '10-15 minutes after cooking',
      notes: 'Cook to medium-rare maximum'
    },
    storage: {
      fresh: {
        temperature: { fahrenheit: 34, celsius: 1 },
        duration: '2-3 days',
        method: 'wrapped, bottom shelf'
      },
      frozen: {
        temperature: { fahrenheit: 0, celsius: -18 },
        duration: '6-8 months',
        method: 'vacuum sealed'
      }
    }
  }
};

// Fix the ingredient mappings to ensure they have all required properties
export const meats: Record<string, IngredientMapping> = fixIngredientMappings(rawMeats);

export default meats;
