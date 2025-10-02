import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawCitrus: Record<string, Partial<IngredientMapping>> = {
  lemon: {
    name: 'Lemon',

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.4, Air: 0.3, Fire: 0.2, Earth: 0.1 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 60, unit: 'g' }, // Standard serving: 1 medium lemon
    scaledElemental: { Water: 0.39, Air: 0.31, Fire: 0.20, Earth: 0.10 }, // Scaled for harmony
    alchemicalProperties: { Spirit: 0.250, Essence: 0.345, Matter: 0.100, Substance: 0.205 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: -0.08, forceMagnitude: 0.88 }, // Cooling effect, gentle force
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Moon'],
      favorableZodiac: ['gemini', 'cancer'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Mercury' },
          second: { element: 'Air', planet: 'Moon' },
          third: { element: 'Earth', planet: 'Saturn' }
        }
      }
    },
    qualities: ['sour', 'cooling', 'cleansing'],
    season: ['winter', 'spring'],
    category: 'fruit',
    subCategory: 'citrus',
    affinities: ['honey', 'ginger', 'mint', 'thyme', 'lavender'],
    cookingMethods: ['raw', 'juiced', 'preserved', 'zested'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'b6', 'folate'],
      minerals: ['potassium', 'calcium'],
      calories: 29,
      carbs_g: 9,
      fiber_g: 2.8,
      antioxidants: ['flavonoids', 'limonoids']
    },
    preparation: {
      washing: true,
      zesting: 'before juicing',
      juicing: 'room temperature yields more juice',
      notes: 'Roll on counter before juicing'
    },
    storage: {
      temperature: 'room temp or refrigerated',
      duration: '1-2 weeks',
      notes: 'Will continue to ripen at room temperature'
    }
  },

  orange: {
    name: 'Orange',

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 130, unit: 'g' }, // Standard serving: 1 medium orange
    scaledElemental: { Water: 0.39, Fire: 0.31, Air: 0.20, Earth: 0.10 }, // Scaled for harmony
    alchemicalProperties: { Spirit: 0.25, Essence: 0.345, Matter: 0.155, Substance: 0.1 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.12, forceMagnitude: 1.02 }, // Warming effect, moderate force
    astrologicalProfile: {
      rulingPlanets: ['Sun', 'Venus'],
      favorableZodiac: ['leo', 'taurus'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Sun' },
          second: { element: 'Earth', planet: 'Venus' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      }
    },
    qualities: ['sweet', 'warming', 'nourishing'],
    season: ['winter'],
    category: 'fruit',
    subCategory: 'citrus',
    affinities: ['vanilla', 'cinnamon', 'chocolate', 'cranberry', 'dates'],
    cookingMethods: ['raw', 'juiced', 'zested', 'candied'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'a', 'b1'],
      minerals: ['calcium', 'potassium'],
      calories: 62,
      carbs_g: 15,
      fiber_g: 3.1,
      antioxidants: ['hesperidin', 'beta-cryptoxanthin']
    },
    preparation: {
      washing: true,
      peeling: 'remove white pith',
      sectioning: 'remove membranes if desired',
      notes: 'Supreme for salads'
    },
    storage: {
      temperature: 'cool room temp or refrigerated',
      duration: '2-3 weeks',
      notes: 'Keep away from apples and bananas'
    }
  },

  lime: {
    name: 'Lime',

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.5, Air: 0.2, Fire: 0.2, Earth: 0.1 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 67, unit: 'g' }, // Standard serving: 1 medium lime
    scaledElemental: { Water: 0.49, Air: 0.21, Fire: 0.20, Earth: 0.10 }, // Scaled for harmony
    alchemicalProperties: { Spirit: 0.205, Essence: 0.395, Matter: 0.100, Substance: 0.200 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: -0.12, forceMagnitude: 0.85 }, // Cooling effect, gentle force

    qualities: ['sour', 'cooling', 'refreshing'],
    season: ['year-round'],
    category: 'fruit',
    subCategory: 'citrus',
    affinities: ['mint', 'coconut', 'chili', 'cilantro', 'ginger'],
    cookingMethods: ['raw', 'juiced', 'zested', 'preserved'],
    nutritionalProfile: {
      vitamins: ['c', 'b6'],
      minerals: ['potassium', 'calcium'],
      calories: 20,
      carbs_g: 7,
      fiber_g: 1.9
    },
    preparation: {
      washing: true,
      rolling: 'before juicing',
      zesting: 'before juicing',
      notes: 'Warm slightly for more juice'
    },
    storage: {
      temperature: 'room temp or refrigerated',
      duration: '1-2 weeks',
      notes: 'Will continue to yellow over time'
    },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Mercury'],
      favorableZodiac: ['cancer', 'gemini', 'virgo'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon', influence: 0.8 },
          second: { element: 'Air', planet: 'Mercury', influence: 0.6 },
          third: { element: 'Water', planet: 'Moon', influence: 0.7 }
        }
      }
    }
  },

  grapefruit: {
    name: 'Grapefruit',

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.4, Air: 0.3, Fire: 0.2, Earth: 0.1 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 230, unit: 'g' }, // Standard serving: 1 medium grapefruit
    scaledElemental: { Water: 0.39, Air: 0.31, Fire: 0.20, Earth: 0.10 }, // Scaled for harmony
    alchemicalProperties: { Spirit: 0.250, Essence: 0.345, Matter: 0.155, Substance: 0.100 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.08, forceMagnitude: 0.95 }, // Mild warming, balanced force

    qualities: ['bitter-sweet', 'tart', 'refreshing'],
    season: ['winter', 'spring'],
    category: 'fruit',
    subCategory: 'citrus',
    affinities: ['mint', 'honey', 'avocado', 'fennel', 'rosemary'],
    cookingMethods: ['raw', 'juiced', 'broiled', 'preserved'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'a', 'b6'],
      minerals: ['potassium', 'magnesium'],
      calories: 42,
      carbs_g: 11,
      fiber_g: 1.6,
      antioxidants: ['lycopene', 'beta-carotene', 'naringin']
    },
    preparation: {
      washing: true,
      peeling: 'remove pith if eating segments',
      sectioning: 'remove membranes for supreme',
      notes: 'Pink varieties are sweeter than white'
    },
    storage: {
      temperature: 'refrigerated',
      duration: '2-3 weeks',
      humidity: 'moderate',
      notes: 'Check for soft spots regularly'
    },
    astrologicalProfile: {
      rulingPlanets: ['Sun', 'Jupiter'],
      favorableZodiac: ['leo', 'sagittarius', 'aries'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Sun', influence: 0.8 },
          second: { element: 'Water', planet: 'Jupiter', influence: 0.7 },
          third: { element: 'Fire', planet: 'Sun', influence: 0.6 }
        }
      }
    }
  },

  mandarin: {
    name: 'Mandarin',

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Sun', 'Mercury'],
      favorableZodiac: ['Leo', 'Gemini', 'Sagittarius'],
      seasonalAffinity: ['winter', 'spring']
    },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 88, unit: 'g' }, // Standard serving: 1 medium mandarin
    scaledElemental: { Water: 0.39, Fire: 0.31, Air: 0.20, Earth: 0.10 }, // Scaled for harmony
    alchemicalProperties: { Spirit: 0.250, Essence: 0.345, Matter: 0.155, Substance: 0.100 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.10, forceMagnitude: 0.90 }, // Mild warming, gentle force

    qualities: ['sweet', 'delicate', 'aromatic'],
    season: ['winter'],
    category: 'fruit',
    subCategory: 'citrus',
    affinities: ['chocolate', 'vanilla', 'ginger', 'cinnamon', 'almond'],
    cookingMethods: ['raw', 'juiced', 'preserved', 'candied'],
      fiber: 'moderate',
      vitamins: ['c', 'a'],
      minerals: ['potassium'],
      calories: 53,
      carbs_g: 13,
      fiber_g: 1.8,
      antioxidants: ['beta-carotene', 'flavonoids']
    },
    preparation: {
      washing: true,
      peeling: 'easy to peel',
      sectioning: 'natural segments',
      notes: 'Very easy to eat out of hand'
    },
    storage: {
      temperature: 'room temp or refrigerated',
      duration: '1-2 weeks',
      notes: 'Keep in cool, dry place'
    },
    astrologicalProfile: {
      rulingPlanets: ['Sun', 'Venus'],
      favorableZodiac: ['leo', 'libra', 'taurus'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Sun', influence: 0.7 },
          second: { element: 'Water', planet: 'Venus', influence: 0.6 },
          third: { element: 'Air', planet: 'Mercury', influence: 0.5 }
        }
      }
    }
  },

  clementine: {
    name: 'Clementine',

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 74, unit: 'g' }, // Standard serving: 1 medium clementine
    scaledElemental: { Water: 0.39, Fire: 0.31, Air: 0.20, Earth: 0.10 }, // Scaled for harmony
    alchemicalProperties: { Spirit: 0.250, Essence: 0.345, Matter: 0.155, Substance: 0.100 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.08, forceMagnitude: 0.88 }, // Mild warming, gentle force

    qualities: ['sweet', 'juicy', 'easy-to-peel', 'seedless'],
    season: ['winter'],
    category: 'fruit',
    subCategory: 'citrus',
    affinities: ['honey', 'vanilla', 'mint', 'cinnamon'],
    cookingMethods: ['raw', 'juiced', 'preserved'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'a', 'b1'],
      minerals: ['potassium', 'calcium'],
      calories: 47,
      carbs_g: 12,
      fiber_g: 1.7,
      antioxidants: ['beta-carotene', 'flavonoids']
    },
    preparation: {
      washing: true,
      peeling: 'very easy to peel',
      notes: 'Perfect for snacking'
    },
    storage: {
      temperature: 'room temp or refrigerated',
      duration: '1-2 weeks',
      notes: 'Store loose in fruit bowl'
    },
    astrologicalProfile: {
      rulingPlanets: ['Sun', 'Venus'],
      favorableZodiac: ['leo', 'libra', 'taurus'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Sun', influence: 0.8 },
          second: { element: 'Water', planet: 'Venus', influence: 0.6 },
          third: { element: 'Air', planet: 'Mercury', influence: 0.7 }
        }
      }
    }
  },

  pomelo: {
    name: 'Pomelo',

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.5, Air: 0.2, Fire: 0.2, Earth: 0.1 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 609, unit: 'g' }, // Standard serving: 1/4 large pomelo
    scaledElemental: { Water: 0.49, Air: 0.21, Fire: 0.20, Earth: 0.10 }, // Scaled for harmony
    alchemicalProperties: { Spirit: 0.205, Essence: 0.395, Matter: 0.100, Substance: 0.200 }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: -0.05, forceMagnitude: 1.05 }, // Cooling effect, moderate force

    qualities: ['mild', 'sweet', 'aromatic', 'large', 'juicy'],
    season: ['winter'],
    category: 'fruit',
    subCategory: 'citrus',
    affinities: ['mint', 'honey', 'ginger', 'cinnamon'],
    cookingMethods: ['raw', 'juiced', 'salads'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['c', 'a', 'b1'],
      minerals: ['potassium', 'calcium'],
      calories: 72,
      carbs_g: 18,
      fiber_g: 2.6,
      antioxidants: ['lycopene', 'beta-carotene']
    },
    preparation: {
      washing: true,
      peeling: 'thick rind, easy to peel when scored',
      sectioning: 'large segments, easy to separate',
      notes: 'Remove bitter membrane from segments'
    },
    storage: {
      temperature: 'room temp or refrigerated',
      duration: '2-3 weeks',
      notes: 'Very large fruit, may need refrigeration'
    },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Jupiter'],
      favorableZodiac: ['cancer', 'pisces', 'sagittarius'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon', influence: 0.8 },
          second: { element: 'Air', planet: 'Jupiter', influence: 0.6 },
          third: { element: 'Earth', planet: 'Saturn', influence: 0.7 }
        }
      }
    }
  }

// Fix the ingredient mappings to ensure they have all required properties
export const citrus: Record<string, IngredientMapping> = fixIngredientMappings(rawCitrus);
