import type { IngredientMapping } from '@/data/ingredients/types';
import type { ZodiacSign } from '@/types/celestial';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawRefinedGrains = {
  white_rice: {
    name: 'White Rice',
    elementalProperties: { Air: 0.4, Earth: 0.3, Water: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Mercury'],
      favorableZodiac: ['cancer', 'virgo'] as any[],
      elementalAffinity: {
        base: 'Air',
        secondary: 'Earth'
      }
    },
    qualities: ['light', 'clean', 'simple', 'versatile', 'neutral'],
    category: 'refined_grain',
    varieties: {
      jasmine: {
        characteristics: 'fragrant, soft, floral aroma',
        cooking_ratio: '1:1.5 rice to water',
        cooking_time: '15-20 minutes',
        origin: 'Southeast Asia'
      },
      basmati: {
        characteristics: 'aromatic, separate grains, nutty flavor',
        cooking_ratio: '1:1.5 rice to water',
        cooking_time: '15-20 minutes',
        origin: 'Indian subcontinent'
      },
      arborio: {
        characteristics: 'short grain, creamy when cooked, high starch',
        cooking_ratio: 'varies for risotto',
        cooking_time: '18-20 minutes',
        origin: 'Italy'
      }
    },
    preparation: {
      rinsing: {
        duration: 'until water runs clear',
        purpose: 'remove excess starch'
      },

      pilaf: {
        method: 'toast rice in oil before adding liquid',
        tips: ['adds nutty flavor', 'helps separate grains'],
        duration: '20-25 minutes total'
      },
      risotto: {
        method: 'gradually add warm broth while stirring',
        tips: ['constant stirring releases starch', 'creates creamy texture'],
        duration: '20-30 minutes'
      }
    },
    lunarPhaseModifiers: {
      newMoon: {
        elementalBoost: { Earth: 0.1, Water: 0.05 },
        preparationTips: ['Good for simple preparations', 'Enhanced absorbency']
      },
      fullMoon: {
        elementalBoost: { Water: 0.15, Air: 0.05 },
        preparationTips: ['Rice fluffs perfectly', 'Best time for aromatic varieties']
      },
      waxingCrescent: {
        elementalBoost: { Air: 0.1, Earth: 0.05 },
        preparationTips: ['Good for rice puddings', 'Enhances subtle flavors']
      },
      waxingGibbous: {
        elementalBoost: { Water: 0.1, Air: 0.1 },
        preparationTips: ['Excellent for risotto', 'Creamy texture enhanced']
      }
    }
  },

  semolina: {
    name: 'Semolina',
    elementalProperties: { Earth: 0.4, Air: 0.4, Fire: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Saturn'],
      favorableZodiac: ['virgo', 'capricorn'] as any[],
      elementalAffinity: {
        base: 'Earth',
        secondary: 'Air'
      }
    },
    qualities: ['smooth', 'versatile', 'firm', 'golden', 'structured'],
    category: 'refined_grain',
    varieties: {
      durum: {
        characteristics: 'highest protein content, golden color',
        uses: ['premium pasta', 'bread making'],
        cooking_time: 'varies by application',
        origin: 'Italy'
      }
    },
    preparation: {
      pasta_making: {
        ratio: '1:1 semolina to water',
        method: 'knead until smooth',
        tips: ['rest dough for at least 30 minutes', 'dust surface with additional semolina']
      },
      couscous: {
        ratio: '1:1.5 semolina to water',
        method: 'steam in stages',
        tips: ['fluff with fork between steaming', 'adds lightness to finished dish']
      },
      halva: {
        ratio: '1:2 semolina to syrup',
        method: 'toast in butter before adding sweetened liquid',
        tips: ['stir constantly while cooking', 'add nuts for texture']
      },
      gnocchi: {
        method: 'mix with potato and minimal liquid',
        tips: ['handle lightly to avoid toughness', 'cook until they float'],
        duration: '1-2 minutes cooking time'
      }
    },
    lunarPhaseModifiers: {
      newMoon: {
        elementalBoost: { Earth: 0.15 },
        preparationTips: ['Good for foundations of dishes', 'Best structure for pasta']
      },
      fullMoon: {
        elementalBoost: { Air: 0.15, Water: 0.05 },
        preparationTips: ['Ideal for desserts', 'Enhanced moisture absorption']
      },
      firstQuarter: {
        elementalBoost: { Earth: 0.1, Fire: 0.1 },
        preparationTips: ['Perfect for bread making', 'Creates excellent texture']
      },
      lastQuarter: {
        elementalBoost: { Earth: 0.1, Air: 0.1 },
        preparationTips: ['Good for couscous', 'Creates light, fluffy texture']
      }
    }
  },

  pearl_barley: {
    name: 'Pearl Barley',
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Saturn'],
      favorableZodiac: ['cancer', 'capricorn'] as any[],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Moon' },
          second: { element: 'Water', planet: 'Saturn' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      }
    },
    qualities: ['tender', 'mild', 'versatile', 'creamy', 'nutritious'],
    category: 'refined_grain',
    varieties: {
      quick: {
        characteristics: 'pre-steamed, faster cooking, less texture',
        cooking_ratio: '1:2.5 barley to water',
        cooking_time: '10-15 minutes',
        processing: 'partially pre-cooked'
      }
    },
    preparation: {
      basic: {
        duration: 'rinse before cooking',
        method: 'simmer until tender',
        tips: ['no soaking required', 'drain excess water'],
        yield: 'triples in volume when cooked'
      },
      risotto_style: {
        method: 'gradual liquid addition',
        duration: '35-45 minutes',
        notes: 'stir frequently for creamy texture',
        alternative_name: 'orzotto'
      },

      pilaf: {
        method: 'toast in oil before adding liquid',
        duration: '40-45 minutes total',
        tips: ['adds nutty dimension', 'pairs well with vegetables']
      }
    },
    lunarPhaseModifiers: {
      newMoon: {
        elementalBoost: { Earth: 0.1, Water: 0.1 },
        preparationTips: ['Good for foundation of soups', 'Absorbs flavors well']
      },
      fullMoon: {
        elementalBoost: { Water: 0.2 },
        preparationTips: ['Creates exceptionally creamy texture', 'Best for risotto-style dishes']
      },
      waxingGibbous: {
        elementalBoost: { Water: 0.15, Earth: 0.05 },
        preparationTips: ['Excellent for hearty stews', 'Develops rich mouthfeel']
      },
      waningCrescent: {
        elementalBoost: { Earth: 0.15, Air: 0.05 },
        preparationTips: ['Good for salads', 'Enhanced nutty flavor']
      }
    }
  },

  polished_farro: {
    name: 'Polished Farro',
    elementalProperties: { Earth: 0.4, Air: 0.3, Fire: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mercury'],
      favorableZodiac: ['capricorn', 'virgo'] as any[],
      elementalAffinity: {
        base: 'Earth',
        secondary: 'Air'
      }
    },
    qualities: ['refined', 'hearty', 'versatile', 'nutty', 'ancient'],
    category: 'refined_grain',
    varieties: {
      pearled: {
        characteristics: 'quickest cooking, most refined, least bran',
        cooking_ratio: '1:2.5 farro to water',
        cooking_time: '15-20 minutes',
        origin: 'Italy'
      },
      semi_pearled: {
        characteristics: 'partially refined, balanced nutrition and cooking time',
        cooking_ratio: '1:2.5 farro to water',
        cooking_time: '20-25 minutes',
        nutrition: 'moderate fiber content'
      }
    },
    preparation: {
      pilaf: {
        method: 'toast then simmer',
        duration: 'until tender but chewy',
        tips: ['drain excess water', 'fluff when done'],
        seasonings: 'herbs, garlic, olive oil complement well'
      },

      breakfast: {
        method: 'simmer in milk or water',
        sweeteners: 'honey, maple syrup, fruit',
        tips: 'can be prepared ahead and reheated',
        alternatives: 'can use plant-based milks'
      }
    },
    lunarPhaseModifiers: {
      newMoon: {
        elementalBoost: { Earth: 0.15, Air: 0.05 },
        preparationTips: ['Good for new beginnings', 'Ideal for lighter preparations']
      },
      fullMoon: {
        elementalBoost: { Air: 0.1, Water: 0.1 },
        preparationTips: ['Enhanced nutty flavors', 'Best for showcasing the grain']
      },
      firstQuarter: {
        elementalBoost: { Earth: 0.1, Fire: 0.05 },
        preparationTips: ['Good for hearty dishes', 'Warming properties enhanced']
      },
      waningGibbous: {
        elementalBoost: { Air: 0.1, Earth: 0.1 },
        preparationTips: ['Excellent for salads', 'Textural qualities highlighted']
      }
    }
  },

  white_cornmeal: {
    name: 'White Cornmeal',
    elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Sun', 'Jupiter'],
      favorableZodiac: ['leo', 'sagittarius'] as any[],
      elementalAffinity: {
        base: 'Earth',
        secondary: 'Fire'
      }
    },
    qualities: ['versatile', 'mild', 'smooth', 'sweet', 'adaptable'],
    category: 'refined_grain',
    varieties: {
      bolted: {
        characteristics: 'some hull and germ removed, moderate refinement',
        uses: ['traditional Southern recipes', 'grits'],
        cooking_time: '15-20 minutes',
        nutritional_notes: 'more nutrients than fine ground'
      }
    },
    preparation: {
      polenta: {
        ratio: '1:4 cornmeal to water',
        method: 'constant stirring',
        tips: ['whisk to prevent lumps', 'can finish with butter and cheese'],
        variations: 'can be cooled, sliced and grilled'
      },

      breading: {
        method: 'coat moistened items',
        tips: ['season well', 'creates crispy exterior'],
        cooking: 'fry, bake, or air-fry',
        applications: 'fish, vegetables, chicken'
      },
      grits: {
        ratio: '1:4 cornmeal to liquid',
        method: 'slow simmer',
        liquid: 'water, milk, or combination',
        duration: '20-30 minutes',
        serving: 'traditionally with butter, cheese, or savory toppings'
      }
    },
    lunarPhaseModifiers: {
      newMoon: {
        elementalBoost: { Earth: 0.1, Fire: 0.1 },
        preparationTips: ['Good for delicate baking', 'Enhanced sweeter notes']
      },
      fullMoon: {
        elementalBoost: { Fire: 0.15, Air: 0.05 },
        preparationTips: ['Perfect for crispy applications', 'Browning enhanced']
      },
      waxingCrescent: {
        elementalBoost: { Earth: 0.1, Water: 0.05 },
        preparationTips: ['Good for creamy preparations', 'Moisture retention improved']
      },
      lastQuarter: {
        elementalBoost: { Fire: 0.1, Earth: 0.1 },
        preparationTips: ['Excellent for breading', 'Creates optimal texture']
      }
    }
  },

  all_purpose_flour: {
    name: 'All-Purpose Flour',
    elementalProperties: { Earth: 0.4, Air: 0.4, Water: 0.1, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Venus'],
      favorableZodiac: ['virgo', 'libra'] as any[],
      elementalAffinity: {
        base: 'Earth',
        secondary: 'Air'
      }
    },
    qualities: ['versatile', 'balanced', 'neutral', 'adaptable', 'foundational'],
    category: 'refined_grain',
    varieties: {
      bleached: {
        characteristics: 'white, fine texture, treated with bleaching agents',
        protein_content: '10-12%',
        uses: ['cakes', 'cookies', 'quick breads'],
        shelf_life: '1-2 years'
      },
      unbleached: {
        characteristics: 'off-white color, aged naturally',
        protein_content: '10-12%',
        uses: ['artisanal breads', 'pastries', 'all-purpose'],
        shelf_life: '8-12 months'
      },
      enriched: {
        characteristics: 'nutrients added back after processing',
        nutritional_notes: 'contains added iron, B vitamins',
        uses: 'standard for most commercial flour',
        regulation: 'required by law in many countries'
      }
    },
    preparation: {
      roux: {
        ratio: '1:1 flour to fat',
        method: 'cook while stirring',
        duration: 'varies by desired color',
        uses: 'thickening sauces, gravies, and soups'
      },
      coating: {
        method: 'dredge moistened items',
        tips: ['season flour well', 'shake off excess'],
        applications: 'meat, fish, vegetables before frying',
        variations: 'can mix with cornstarch for crispier results'
      },
      slurry: {
        ratio: '1:2 flour to cold water',
        method: 'mix until smooth before adding to hot liquid',
        tips: 'pour slowly while stirring to prevent lumps',
        uses: 'quick thickening at end of cooking'
      }
    },
    lunarPhaseModifiers: {
      newMoon: {
        elementalBoost: { Earth: 0.1, Air: 0.1 },
        preparationTips: ['Good for starting new baking projects', 'Enhanced rising properties']
      },
      fullMoon: {
        elementalBoost: { Air: 0.15, Water: 0.05 },
        preparationTips: ['Peak rising power for bread', 'Best gluten development']
      },
      waxingCrescent: {
        elementalBoost: { Air: 0.1, Earth: 0.05 },
        preparationTips: ['Good for delicate pastries', 'Creates tender textures']
      },
      waningGibbous: {
        elementalBoost: { Earth: 0.15 },
        preparationTips: ['Excellent for hearty baked goods', 'Enhanced structural properties']
      }
    }
  }
};

// Fix the ingredient mappings to ensure they have all required properties
// ✅ Pattern MM-1: Type assertion for ZodiacSign[] compatibility
export const refinedGrains: Record<string, IngredientMapping> =
  fixIngredientMappings(rawRefinedGrains);

export default refinedGrains;
