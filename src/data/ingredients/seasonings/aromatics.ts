import type { IngredientMapping } from '@/types/alchemy';

export const aromatics: Record<string, IngredientMapping> = {
  'onion': {
    elementalProperties: { Fire: 0.4, Earth: 0.3, Water: 0.2, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Saturn'],
      favorableZodiac: ['Aries', 'Capricorn'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Mars' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Water', planet: 'Neptune' }
        }
      }
    },
    qualities: ['pungent', 'savory', 'sweet when cooked'],
    origin: ['Global'],
    category: 'aromatic',
    subCategory: 'allium',
    varieties: {
      'Yellow': {
        appearance: 'golden skin, white flesh',
        flavor: 'balanced sweetness when cooked',
        uses: 'all-purpose cooking'
      },
      'Red': {
        appearance: 'deep purple-red skin',
        flavor: 'milder, slightly sweet',
        uses: 'raw in salads, grilling'
      },
      'White': {
        appearance: 'paper-white skin and flesh',
        flavor: 'sharp, clean',
        uses: 'Mexican and Latin cuisine'
      },
      'Shallot': {
        appearance: 'small, copper-brown skin',
        flavor: 'delicate, garlic notes',
        uses: 'French cuisine, vinaigrettes'
      }
    },
    culinaryApplications: {
      'base_flavor': {
        method: 'sauté until translucent',
        timing: '5-7 minutes',
        applications: {
          'mirepoix': 'with carrots and celery',
          'sofrito': 'with peppers and tomatoes',
          'holy_trinity': 'with celery and bell peppers'
        }
      },
      'caramelized': {
        method: 'slow cook on low heat',
        timing: '30-45 minutes',
        applications: {
          'onion_soup': 'french classic',
          'condiment': 'for burgers and sandwiches',
          'flavor_base': 'for savory dishes'
        }
      }
    },
    storage: {
      temperature: 'cool, dry place',
      humidity: 'low',
      container: 'ventilated',
      duration: '1-2 months',
      notes: 'Keep away from potatoes'
    }
  },

  'garlic': {
    elementalProperties: { Fire: 0.6, Earth: 0.3, Air: 0.1, Water: 0 },
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Pluto'],
      favorableZodiac: ['Aries', 'Scorpio'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Mars' },
          second: { element: 'Earth', planet: 'Pluto' },
          third: { element: 'Air', planet: 'Uranus' }
        }
      }
    },
    qualities: ['pungent', 'spicy', 'medicinal'],
    origin: ['Central Asia'],
    category: 'aromatic',
    subCategory: 'allium',
    varieties: {
      'Hardneck': {
        appearance: 'larger cloves, woody stem',
        flavor: 'complex, strong',
        uses: 'gourmet applications'
      },
      'Softneck': {
        appearance: 'smaller cloves, many layers',
        flavor: 'standard garlic flavor',
        uses: 'everyday cooking'
      },
      'Black': {
        appearance: 'black, fermented',
        flavor: 'sweet, molasses-like',
        uses: 'Asian cuisine, specialty dishes'
      }
    },
    culinaryApplications: {
      'raw': {
        method: 'finely minced or pressed',
        timing: 'add near end of cooking',
        applications: {
          'dressings': 'sharp, pungent flavor',
          'dips': 'aioli, skordalia',
          'bruschetta': 'rubbed on bread'
        }
      },
      'roasted': {
        method: 'whole heads, oil wrapped in foil',
        timing: '45-60 minutes at 350°F',
        applications: {
          'spread': 'on bread',
          'mashed_potatoes': 'creamy addition',
          'compound_butter': 'for steak or bread'
        }
      },
      'sautéed': {
        method: 'minced and cooked in oil',
        timing: '30-60 seconds until fragrant',
        applications: {
          'base_flavor': 'start of many dishes',
          'infused_oils': 'for finishing dishes',
          'pasta_sauces': 'essential foundation'
        }
      }
    },
    storage: {
      temperature: 'cool, dry place',
      humidity: 'moderate',
      container: 'ventilated',
      duration: '3-6 months',
      notes: 'Do not refrigerate whole heads'
    }
  },

  'ginger': {
    elementalProperties: { Fire: 0.7, Earth: 0.2, Air: 0.1, Water: 0 },
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['Aries', 'Leo'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Mars' },
          second: { element: 'Air', planet: 'Sun' },
          third: { element: 'Earth', planet: 'Saturn' }
        }
      }
    },
    qualities: ['warming', 'pungent', 'aromatic'],
    origin: ['Southeast Asia'],
    category: 'aromatic',
    subCategory: 'rhizome',
    varieties: {
      'Young': {
        appearance: 'thin skin, juicy flesh',
        flavor: 'mild, less fibrous',
        uses: 'fresh applications, pickling'
      },
      'Mature': {
        appearance: 'thick skin, fibrous',
        flavor: 'strong, spicy',
        uses: 'cooking, powdering'
      },
      'Galangal': {
        appearance: 'harder, white flesh',
        flavor: 'citrusy, pine-like',
        uses: 'Thai cuisine, spice blends'
      }
    },
    culinaryApplications: {
      'fresh': {
        method: 'peeled and grated or minced',
        timing: 'add early for mild flavor, late for punch',
        applications: {
          'stir_fry': 'aromatic base',
          'marinades': 'tenderizing properties',
          'teas': 'medicinal and flavorful'
        }
      },
      'pickled': {
        method: 'sliced thin and brined',
        timing: 'minimum 24 hours',
        applications: {
          'sushi': 'palate cleanser',
          'condiment': 'with rice dishes',
          'addition': 'to dressings'
        }
      }
    },
    storage: {
      temperature: 'room temperature or refrigerated',
      humidity: 'moderate',
      container: 'paper bag or wrapped in paper towel',
      duration: 'fresh: 3 weeks, frozen: 6 months',
      notes: 'Can be frozen whole or grated'
    }
  },

  'lemongrass': {
    elementalProperties: { Air: 0.5, Water: 0.3, Fire: 0.2, Earth: 0 },
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Venus'],
      favorableZodiac: ['Gemini', 'Libra'],
      elementalAffinity: {
        base: 'Air'
      }
    },
    qualities: ['citrusy', 'aromatic', 'bright'],
    origin: ['Southeast Asia'],
    category: 'aromatic',
    subCategory: 'herb',
    culinaryApplications: {
      'infusing': {
        method: 'bruised and simmered',
        timing: 'add early in cooking',
        applications: {
          'soups': 'thai tom yum',
          'curries': 'southeast asian',
          'teas': 'medicinal brewing'
        }
      },
      'paste': {
        method: 'finely minced inner core',
        timing: 'typically with other aromatics',
        applications: {
          'curry_pastes': 'with chilies and galangal',
          'marinades': 'with lime and garlic',
          'rubs': 'for grilled proteins'
        }
      }
    },
    storage: {
      temperature: 'refrigerated',
      humidity: 'moderate',
      container: 'wrapped in damp paper towel',
      duration: '2-3 weeks fresh, 6 months frozen',
      notes: 'Can be frozen whole or chopped'
    }
  },

  'shallot': {
    elementalProperties: { Earth: 0.4, Fire: 0.3, Water: 0.2, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Venus'],
      favorableZodiac: ['Virgo', 'Taurus'],
      elementalAffinity: {
        base: 'Earth'
      }
    },
    qualities: ['delicate', 'sweet', 'aromatic'],
    origin: ['Southeast Asia'],
    category: 'aromatic',
    subCategory: 'allium',
    culinaryApplications: {
      'diced': {
        method: 'finely diced',
        timing: 'brief cooking',
        applications: {
          'vinaigrettes': 'classic french',
          'pan_sauces': 'for proteins',
          'garnishes': 'raw or fried'
        }
      },
      'fried': {
        method: 'thinly sliced and deep fried',
        timing: 'until golden brown',
        applications: {
          'garnish': 'for soups, salads',
          'condiment': 'with rice dishes',
          'topping': 'for burgers'
        }
      }
    },
    storage: {
      temperature: 'cool, dry place',
      humidity: 'low',
      container: 'ventilated',
      duration: '1 month',
      notes: 'Similar to onions'
    }
  },

  'scallion': {
    elementalProperties: { Air: 0.4, Water: 0.3, Earth: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Moon'],
      favorableZodiac: ['Gemini', 'Cancer'],
      elementalAffinity: {
        base: 'Air'
      }
    },
    qualities: ['fresh', 'mild', 'grassy'],
    origin: ['Asia'],
    category: 'aromatic',
    subCategory: 'allium',
    culinaryApplications: {
      'garnish': {
        method: 'thinly sliced',
        timing: 'add at end of cooking',
        applications: {
          'soups': 'floating slices',
          'noodles': 'asian dishes',
          'proteins': 'finishing touch'
        }
      },
      'cooked': {
        method: 'chopped or whole',
        timing: 'brief cooking only',
        applications: {
          'stir_fry': 'added toward end',
          'scallion_oil': 'chinese condiment',
          'pancakes': 'chinese scallion pancakes'
        }
      }
    },
    storage: {
      temperature: 'refrigerated',
      humidity: 'high',
      container: 'wrapped in damp paper towel',
      duration: '1-2 weeks',
      notes: 'Can be regrown in water from roots'
    }
  }
}; 