import type { IngredientMapping } from '@/types/alchemy';

export const poultry: Record<string, IngredientMapping> = {
  'chicken': {
    elementalProperties: { Earth: 0.3, Fire: 0.3, Water: 0.2 },
    qualities: ['versatile', 'lean', 'mild'],
    origin: ['Global'],
    category: 'protein',
    subCategory: 'poultry',
    varieties: {
      'broiler': {
        weight: '2.5-4.5 lbs',
        characteristics: 'tender, mild flavor',
        best_for: 'all-purpose cooking'
      },
      'roaster': {
        weight: '5-7 lbs',
        characteristics: 'more flavor, firmer texture',
        best_for: 'roasting whole'
      }
    },
    cuts: {
      'breast': {
        characteristics: 'lean, white meat',
        cooking_methods: ['grill', 'pan-sear', 'bake'],
        internal_temp: { fahrenheit: 165, celsius: 74 }
      },
      'thigh': {
        characteristics: 'dark meat, more fat',
        cooking_methods: ['braise', 'grill', 'roast'],
        internal_temp: { fahrenheit: 175, celsius: 79 }
      },
      'wing': {
        characteristics: 'mix of white/dark meat',
        cooking_methods: ['fry', 'bake', 'grill'],
        sections: ['drumette', 'flat', 'tip']
      },
      'whole': {
        characteristics: 'complete bird',
        cooking_methods: ['roast', 'spatchcock', 'smoke'],
        internal_temp: { fahrenheit: 165, celsius: 74 }
      }
    },
    culinaryApplications: {
      'roasting': {
        'traditional': {
          preparation: {
            cavity: ['lemon', 'herbs', 'aromatics'],
            skin: ['butter', 'herbs', 'salt']
          },
          method: {
            temperature: {
              initial: { fahrenheit: 450, celsius: 230 },
              cooking: { fahrenheit: 350, celsius: 175 }
            },
            timing: '20 minutes per pound'
          }
        },
        'spatchcock': {
          preparation: {
            method: 'remove backbone and flatten',
            seasoning: 'under and over skin'
          },
          cooking: {
            temperature: { fahrenheit: 425, celsius: 218 },
            timing: '45-55 minutes total'
          }
        }
      },
      'braising': {
        'coq_au_vin': {
          preparation: {
            marinade: ['wine', 'aromatics', 'herbs'],
            initial_cook: 'brown pieces well'
          },
          cooking: {
            liquid: 'red wine and stock',
            aromatics: ['onion', 'carrot', 'celery'],
            timing: '1-1.5 hours'
          }
        },
        'cacciatore': {
          preparation: {
            seasoning: ['salt', 'pepper', 'herbs'],
            initial_cook: 'brown in oil'
          },
          cooking: {
            liquid: 'tomatoes and wine',
            herbs: ['rosemary', 'thyme'],
            timing: '45-60 minutes'
          }
        }
      }
    },
    regionalPreparations: {
      'french': {
        'poulet_roti': {
          method: 'high heat roast',
          seasoning: 'herbs, salt, pepper'
        }
      }
    }
  },
  'duck': {
    elementalProperties: { Earth: 0.3, Water: 0.3, Fire: 0.2 },
    qualities: ['rich', 'fatty', 'flavorful'],
    origin: ['Global'],
    category: 'protein',
    subCategory: 'poultry',
    varieties: {
      'pekin': {
        characteristics: 'mild flavor, tender meat',
        best_for: 'roasting whole, breast preparations'
      },
      'muscovy': {
        characteristics: 'leaner, stronger flavor',
        best_for: 'confit, slow cooking'
      }
    },
    cuts: {
      'breast': {
        characteristics: 'lean red meat, thick fat cap',
        cooking_methods: ['pan-sear', 'grill', 'smoke'],
        internal_temp: { fahrenheit: 135, celsius: 57 }
      },
      'leg': {
        characteristics: 'dark meat, tough until slow-cooked',
        cooking_methods: ['confit', 'braise', 'roast'],
        internal_temp: { fahrenheit: 165, celsius: 74 }
      },
      'whole': {
        characteristics: 'high fat content, crispy skin potential',
        cooking_methods: ['roast', 'smoke', 'braise'],
        internal_temp: { fahrenheit: 165, celsius: 74 }
      }
    },
    culinaryApplications: {
      'breast': {
        'pan_seared': {
          preparation: {
            method: 'score fat, dry thoroughly',
            seasoning: 'salt and pepper'
          },
          cooking: {
            method: 'start cold pan, render fat',
            timing: '15-20 minutes total',
            finish: 'rest 10 minutes'
          }
        }
      },
      'confit': {
        preparation: {
          cure: ['salt', 'herbs', 'spices'],
          timing: '24 hours'
        },
        cooking: {
          temperature: { fahrenheit: 250, celsius: 120 },
          timing: '3-4 hours',
          fat: 'duck fat or olive oil'
        }
      }
    },
    regionalPreparations: {
      'french': {
        'magret': {
          method: 'pan-seared breast',
          sauce: 'wine reduction',
          service: 'sliced, medium-rare'
        },
        'confit': {
          method: 'salt-cured and slow-cooked in fat',
          service: 'with potatoes and garlic'
        }
      },
      'chinese': {
        'peking': {
          preparation: 'air-dried, glazed',
          cooking: 'roasted until crispy',
          service: 'with pancakes and scallions'
        }
      }
    }
  },
  'turkey': {
    elementalProperties: { Earth: 0.4, Fire: 0.3, Water: 0.2 },
    qualities: ['lean', 'mild', 'versatile'],
    origin: ['Americas'],
    category: 'protein',
    subCategory: 'poultry',
    varieties: {
      'whole': {
        weight: '10-24 lbs',
        characteristics: 'traditional roasting bird',
        best_for: 'holiday meals'
      },
      'breast': {
        weight: '4-8 lbs',
        characteristics: 'white meat only',
        best_for: 'smaller gatherings'
      }
    },
    cuts: {
      'breast': {
        characteristics: 'lean white meat',
        cooking_methods: ['roast', 'smoke', 'grill'],
        internal_temp: { fahrenheit: 165, celsius: 74 }
      },
      'thigh': {
        characteristics: 'dark meat, more flavor',
        cooking_methods: ['braise', 'roast', 'grill'],
        internal_temp: { fahrenheit: 175, celsius: 79 }
      },
      'whole': {
        characteristics: 'mix of white and dark meat',
        cooking_methods: ['roast', 'smoke', 'deep-fry'],
        internal_temp: { fahrenheit: 165, celsius: 74 }
      }
    },
    culinaryApplications: {
      'roasting': {
        'traditional': {
          preparation: {
            brine: ['salt', 'sugar', 'aromatics'],
            timing: '24 hours'
          },
          method: {
            temperature: {
              initial: { fahrenheit: 450, celsius: 230 },
              cooking: { fahrenheit: 350, celsius: 175 }
            },
            timing: '20 minutes per pound'
          }
        },
        'spatchcock': {
          preparation: {
            method: 'remove backbone and flatten',
            seasoning: 'under and over skin'
          },
          cooking: {
            temperature: { fahrenheit: 425, celsius: 218 },
            timing: '45-55 minutes total'
          }
        }
      },
      'braising': {
        'coq_au_vin': {
          preparation: {
            marinade: ['wine', 'aromatics', 'herbs'],
            initial_cook: 'brown pieces well'
          },
          cooking: {
            liquid: 'red wine and stock',
            aromatics: ['onion', 'carrot', 'celery'],
            timing: '1-1.5 hours'
          }
        },
        'cacciatore': {
          preparation: {
            seasoning: ['salt', 'pepper', 'herbs'],
            initial_cook: 'brown in oil'
          },
          cooking: {
            liquid: 'tomatoes and wine',
            herbs: ['rosemary', 'thyme'],
            timing: '45-60 minutes'
          }
        }
      }
    },
    regionalPreparations: {
      'french': {
        'poulet_roti': {
          method: 'high heat roast',
          seasoning: 'herbs, salt, pepper'
        }
      }
    }
  }
};
