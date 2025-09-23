import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawCitrus: Record<string, Partial<IngredientMapping>> = {
  lemon: {
    name: 'Lemon',
    elementalProperties: { Water: 0.4, Air: 0.3, Fire: 0.2, Earth: 0.1 }
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
      notes: 'Roll on counter before juicing' },
        storage: {
      temperature: 'room temp or refrigerated',
      duration: '1-2 weeks',
      notes: 'Will continue to ripen at room temperature'
    }
  }

  orange: {
    name: 'Orange',
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 }
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
      notes: 'Supreme for salads' },
        storage: {
      temperature: 'cool room temp or refrigerated',
      duration: '2-3 weeks',
      notes: 'Keep away from apples and bananas'
    }
  }

  lime: {
    name: 'Lime',
    elementalProperties: { Water: 0.5, Air: 0.2, Fire: 0.2, Earth: 0.1 }
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
      notes: 'Warm slightly for more juice' },
        storage: {
      temperature: 'room temp or refrigerated',
      duration: '1-2 weeks',
      notes: 'Will continue to yellow over time' },
        astrologicalProfile: {
      rulingPlanets: ['Moon', 'Mercury'],
      favorableZodiac: ['cancer', 'gemini', 'virgo'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon', influence: 0.8 }
          second: { element: 'Air', planet: 'Mercury', influence: 0.6 }
          third: { element: 'Water', planet: 'Moon', influence: 0.7 }
        }
      }
    }
  }

  grapefruit: {
    name: 'Grapefruit',
    elementalProperties: { Water: 0.5, Fire: 0.2, Air: 0.2, Earth: 0.1 }
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
      notes: 'Pink varieties are sweeter than white' },
        storage: {
      temperature: 'refrigerated',
      duration: '2-3 weeks',
      humidity: 'moderate',
      notes: 'Check for soft spots regularly' },
        astrologicalProfile: {
      rulingPlanets: ['Sun', 'Jupiter'],
      favorableZodiac: ['leo', 'sagittarius', 'aries'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Sun', influence: 0.8 }
          second: { element: 'Water', planet: 'Jupiter', influence: 0.7 }
          third: { element: 'Fire', planet: 'Sun', influence: 0.6 }
        }
      }
    }
  }

  mandarin: {
    name: 'Mandarin',
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 }
    qualities: ['sweet', 'delicate', 'aromatic'],
    season: ['winter'],
    category: 'fruit',
    subCategory: 'citrus',
    affinities: ['chocolate', 'vanilla', 'ginger', 'cinnamon', 'almond'],
    cookingMethods: ['raw', 'juiced', 'preserved', 'candied'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'a', 'b6'],
      minerals: ['potassium', 'calcium'],
      calories: 47,
      carbs_g: 12,
      fiber_g: 1.8,
      antioxidants: ['beta-cryptoxanthin', 'lutein']
    },
    preparation: {
      washing: true,
      peeling: 'easy to peel by hand',
      segmenting: 'naturally separates',
      notes: 'Remove any seeds before eating' },
        storage: {
      temperature: 'cool room temp or refrigerated',
      duration: '1-2 weeks',
      humidity: 'moderate',
      notes: 'Best eaten within a week' },
        astrologicalProfile: {
      rulingPlanets: ['Sun', 'Venus'],
      favorableZodiac: ['leo', 'libra', 'taurus'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Sun', influence: 0.7 }
          second: { element: 'Earth', planet: 'Venus', influence: 0.6 }
          third: { element: 'Fire', planet: 'Sun', influence: 0.5 }
        }
      }
    }
  }

  kumquat: {
    name: 'Kumquat',
    elementalProperties: { Water: 0.3, Fire: 0.3, Air: 0.2, Earth: 0.2 }
    qualities: ['sweet-tart', 'intense', 'unique'],
    season: ['winter', 'early spring'],
    category: 'fruit',
    subCategory: 'citrus',
    affinities: ['honey', 'ginger', 'star anise', 'cinnamon', 'mint'],
    cookingMethods: ['raw', 'preserved', 'candied', 'marmalade'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['c', 'a', 'e'],
      minerals: ['calcium', 'copper'],
      calories: 71,
      carbs_g: 15.9,
      fiber_g: 6.5,
      antioxidants: ['flavonoids', 'pectin']
    },
    preparation: {
      washing: true,
      eating: 'whole with skin',
      notes: 'Skin is sweet, flesh is tart' },
        storage: {
      temperature: 'refrigerated',
      duration: '1-2 weeks',
      humidity: 'high',
      notes: 'Store in sealed container' },
        astrologicalProfile: {
      rulingPlanets: ['Jupiter', 'Mercury'],
      favorableZodiac: ['sagittarius', 'gemini', 'virgo'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Jupiter', influence: 0.8 }
          second: { element: 'Air', planet: 'Mercury', influence: 0.6 }
          third: { element: 'Earth', planet: 'Mercury', influence: 0.5 }
        }
      }
    }
  }

  yuzu: {
    name: 'Yuzu',
    elementalProperties: { Water: 0.3, Air: 0.3, Fire: 0.3, Earth: 0.1 }
    qualities: ['aromatic', 'complex', 'floral'],
    season: ['winter'],
    category: 'fruit',
    subCategory: 'citrus',
    affinities: ['soy', 'honey', 'chili', 'ginger', 'sesame'],
    cookingMethods: ['zested', 'juiced', 'preserved', 'seasoning'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'a'],
      minerals: ['calcium', 'potassium'],
      calories: 53,
      carbs_g: 13.3,
      fiber_g: 2,
      antioxidants: ['limonoids', 'hesperidin']
    },
    preparation: {
      washing: true,
      zesting: 'highly aromatic',
      juicing: 'use sparingly',
      notes: 'Primarily used for zest and juice' },
        storage: {
      temperature: 'refrigerated',
      duration: '1-2 weeks',
      humidity: 'moderate',
      notes: 'Freeze zest for longer storage' },
        astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Venus'],
      favorableZodiac: ['gemini', 'libra', 'aquarius'],
      elementalAffinity: {
        base: 'Air',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercury', influence: 0.8 }
          second: { element: 'Water', planet: 'Venus', influence: 0.7 }
          third: { element: 'Fire', planet: 'Mercury', influence: 0.6 }
        }
      }
    }
  }

  bergamot: {
    name: 'Bergamot',
    elementalProperties: { Water: 0.3, Air: 0.4, Fire: 0.2, Earth: 0.1 }
    qualities: ['fragrant', 'bitter', 'floral'],
    season: ['winter'],
    category: 'fruit',
    subCategory: 'citrus',
    affinities: ['tea', 'lavender', 'vanilla', 'honey', 'chocolate'],
    cookingMethods: ['zested', 'preserved', 'flavoring', 'marmalade'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'a'],
      minerals: ['potassium', 'calcium'],
      calories: 37,
      carbs_g: 9.3,
      fiber_g: 1.8,
      antioxidants: ['bergapten', 'bergamottin']
    },
    preparation: {
      washing: true,
      zesting: 'prized for aromatic oils',
      notes: 'Primarily used for oil and flavoring' },
        storage: {
      temperature: 'refrigerated',
      duration: '1-2 weeks',
      humidity: 'moderate',
      notes: 'Preserve zest in sugar or dry' },
        astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Moon'],
      favorableZodiac: ['gemini', 'cancer', 'virgo'],
      elementalAffinity: {
        base: 'Air',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercury', influence: 0.8 }
          second: { element: 'Water', planet: 'Moon', influence: 0.7 }
          third: { element: 'Air', planet: 'Mercury', influence: 0.6 }
        }
      }
    }
  }

  calamansi: {
    name: 'Calamansi',
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 }
    qualities: ['sour', 'bright', 'complex'],
    season: ['year-round'],
    category: 'fruit',
    subCategory: 'citrus',
    affinities: ['chili', 'garlic', 'ginger', 'soy sauce', 'coconut'],
    cookingMethods: ['juiced', 'seasoning', 'preserved', 'garnish'],
    nutritionalProfile: {
      fiber: 'low',
      vitamins: ['c', 'a'],
      minerals: ['calcium', 'iron'],
      calories: 21,
      carbs_g: 5.3,
      fiber_g: 0.9,
      antioxidants: ['limonoids', 'flavonoids']
    },
    preparation: {
      washing: true,
      juicing: 'use whole or halved',
      notes: 'Can be used whole in drinks' },
        storage: {
      temperature: 'refrigerated',
      duration: '1-2 weeks',
      humidity: 'moderate',
      notes: 'Juice can be frozen in ice cube trays' },
        astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['aries', 'leo', 'scorpio'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Mars', influence: 0.8 }
          second: { element: 'Water', planet: 'Mars', influence: 0.7 }
          third: { element: 'Fire', planet: 'Sun', influence: 0.6 }
        }
      }
    }
  }

  'buddha's hand': {
    name: 'S hand',
    elementalProperties: { Water: 0.3, Air: 0.4, Fire: 0.2, Earth: 0.1 }
    qualities: ['fragrant', 'sweet', 'exotic'],
    season: ['winter', 'early spring'],
    category: 'fruit',
    subCategory: 'citrus',
    affinities: ['honey', 'vanilla', 'ginger', 'vodka', 'sugar'],
    cookingMethods: ['zested', 'candied', 'infused', 'preserved'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c'],
      minerals: ['potassium'],
      calories: 24,
      carbs_g: 6.1,
      fiber_g: 1.5,
      antioxidants: ['limonene', 'flavonoids']
    },
    preparation: {
      washing: true,
      zesting: 'entire fruit is zestable',
      cutting: 'separate fingers as needed',
      notes: 'No juice or pulp, used for zest' },
        storage: {
      temperature: 'refrigerated',
      duration: '2-3 weeks',
      humidity: 'moderate',
      notes: 'Wrap loosely in plastic' },
        astrologicalProfile: {
      rulingPlanets: ['Jupiter', 'Venus'],
      favorableZodiac: ['sagittarius', 'pisces', 'libra'],
      elementalAffinity: {
        base: 'Air',
        decanModifiers: {
          first: { element: 'Air', planet: 'Jupiter', influence: 0.8 }
          second: { element: 'Water', planet: 'Venus', influence: 0.7 }
          third: { element: 'Air', planet: 'Jupiter', influence: 0.6 }
        }
      }
    }
  }

  tangelo: {
    name: 'Tangelo',
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 }
    qualities: ['sweet-tart', 'juicy', 'vibrant'],
    season: ['winter'],
    category: 'fruit',
    subCategory: 'citrus',
    affinities: ['honey', 'vanilla', 'cinnamon', 'mint', 'ginger'],
    cookingMethods: ['raw', 'juiced', 'segments', 'preserved'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'a', 'folate'],
      minerals: ['potassium', 'calcium'],
      calories: 47,
      carbs_g: 12,
      fiber_g: 2.0,
      antioxidants: ['beta-carotene', 'cryptoxanthin']
    },
    preparation: {
      washing: true,
      peeling: 'easy to peel',
      segmenting: 'naturally separates',
      notes: 'Juicier than regular oranges' },
        storage: {
      temperature: 'refrigerated',
      duration: '1-2 weeks',
      humidity: 'moderate',
      notes: 'Best eaten fresh' },
        astrologicalProfile: {
      rulingPlanets: ['Sun', 'Jupiter'],
      favorableZodiac: ['leo', 'sagittarius', 'aries'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Sun', influence: 0.8 }
          second: { element: 'Water', planet: 'Jupiter', influence: 0.7 }
          third: { element: 'Fire', planet: 'Sun', influence: 0.6 }
        }
      }
    }
  }

  'key lime': {
    name: 'Key lime',
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 }
    qualities: ['tart', 'aromatic', 'intense'],
    season: ['summer', 'fall'],
    category: 'fruit',
    subCategory: 'citrus',
    affinities: ['coconut', 'graham', 'vanilla', 'cream', 'mint'],
    cookingMethods: ['juiced', 'zested', 'baked', 'preserved'],
    nutritionalProfile: {
      fiber: 'low',
      vitamins: ['c', 'a'],
      minerals: ['calcium', 'potassium'],
      calories: 25,
      carbs_g: 8.5,
      fiber_g: 1.3,
      antioxidants: ['flavonoids', 'limonoids']
    },
    preparation: {
      washing: true,
      juicing: 'requires many fruits',
      zesting: 'before juicing',
      notes: 'More aromatic than Persian limes' },
        storage: {
      temperature: 'refrigerated',
      duration: '1-2 weeks',
      humidity: 'moderate',
      notes: 'Use quickly once ripe' },
        astrologicalProfile: {
      rulingPlanets: ['Moon', 'Mercury'],
      favorableZodiac: ['cancer', 'gemini', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon', influence: 0.8 }
          second: { element: 'Air', planet: 'Mercury', influence: 0.7 }
          third: { element: 'Water', planet: 'Moon', influence: 0.6 }
        }
      }
    }
  }

  clementine: {
    name: 'Clementine',
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 }
    qualities: ['sweet', 'delicate', 'refreshing'],
    season: ['winter'],
    category: 'fruit',
    subCategory: 'citrus',
    affinities: ['chocolate', 'vanilla', 'caramel', 'nuts', 'spices'],
    cookingMethods: ['raw', 'segments', 'juiced', 'desserts'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'folate', 'b1'],
      minerals: ['potassium', 'calcium'],
      calories: 35,
      carbs_g: 9,
      fiber_g: 1.3,
      antioxidants: ['hesperidin', 'beta-cryptoxanthin']
    },
    preparation: {
      washing: true,
      peeling: 'very easy to peel',
      segmenting: 'naturally separates',
      notes: 'Usually seedless' },
        storage: {
      temperature: 'cool room temp or refrigerated',
      duration: '1-2 weeks',
      humidity: 'moderate',
      notes: 'Store in mesh bag for airflow' },
        astrologicalProfile: {
      rulingPlanets: ['Venus', 'Moon'],
      favorableZodiac: ['libra', 'cancer', 'taurus'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Venus', influence: 0.8 }
          second: { element: 'Earth', planet: 'Moon', influence: 0.7 }
          third: { element: 'Water', planet: 'Venus', influence: 0.6 }
        }
      }
    }
  }
}

// Fix the ingredient mappings to ensure they have all required properties
export const citrus: Record<string, IngredientMapping> = fixIngredientMappings(rawCitrus)
