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
  },
  'quail': {
    elementalProperties: { Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ['delicate', 'gamey', 'tender'],
    origin: ['Global'],
    category: 'protein',
    subCategory: 'poultry',
    varieties: {
      'common': {
        weight: '4-6 oz',
        characteristics: 'small, tender game bird',
        best_for: 'individual servings'
      },
      'jumbo': {
        weight: '7-9 oz',
        characteristics: 'larger, meatier',
        best_for: 'stuffing, roasting'
      }
    },
    cuts: {
      'whole': {
        characteristics: 'small, tender bird',
        cooking_methods: ['grill', 'roast', 'pan-sear'],
        internal_temp: { fahrenheit: 165, celsius: 74 }
      },
      'breast': {
        characteristics: 'lean, quick-cooking',
        cooking_methods: ['pan-sear', 'grill'],
        internal_temp: { fahrenheit: 155, celsius: 68 }
      }
    },
    culinaryApplications: {
      'grilling': {
        'spatchcock': {
          preparation: {
            method: 'butterfly and flatten',
            marinade: ['olive oil', 'herbs', 'garlic'],
            timing: '2-4 hours'
          },
          cooking: {
            temperature: 'high heat',
            timing: '4-5 minutes per side',
            finish: 'rest 5 minutes'
          }
        }
      },
      'stuffed': {
        preparation: {
          stuffing: ['wild rice', 'herbs', 'dried fruits'],
          trussing: 'secure with twine'
        },
        cooking: {
          temperature: { fahrenheit: 375, celsius: 190 },
          timing: '20-25 minutes total'
        }
      }
    },
    regionalPreparations: {
      'french': {
        'cailles_en_sarcophage': {
          method: 'wrapped in puff pastry',
          sauce: 'truffle sauce',
          service: 'individual portions'
        }
      },
      'japanese': {
        'yakitori': {
          method: 'skewered and grilled',
          sauce: 'tare glaze',
          service: 'with scallions'
        }
      }
    }
  },
  'guinea_fowl': {
    elementalProperties: { Earth: 0.3, Air: 0.3, Fire: 0.2, Water: 0.2 },
    qualities: ['gamey', 'lean', 'flavorful'],
    origin: ['Africa', 'Europe'],
    category: 'protein',
    subCategory: 'poultry',
    varieties: {
      'pearl': {
        weight: '2-4 lbs',
        characteristics: 'spotted feathers, lean meat',
        best_for: 'roasting, braising'
      }
    },
    cuts: {
      'whole': {
        characteristics: 'lean, flavorful bird',
        cooking_methods: ['roast', 'braise', 'grill'],
        internal_temp: { fahrenheit: 165, celsius: 74 }
      },
      'breast': {
        characteristics: 'lean, quick-cooking',
        cooking_methods: ['pan-sear', 'grill', 'roast'],
        internal_temp: { fahrenheit: 160, celsius: 71 }
      }
    },
    culinaryApplications: {
      'roasting': {
        'traditional': {
          preparation: {
            cavity: ['herbs', 'citrus', 'garlic'],
            skin: ['butter', 'herbs']
          },
          cooking: {
            temperature: { fahrenheit: 375, celsius: 190 },
            timing: '15-20 minutes per pound',
            basting: 'every 30 minutes'
          }
        }
      },
      'braising': {
        preparation: {
          marinade: ['wine', 'herbs', 'aromatics'],
          searing: 'brown all sides'
        },
        cooking: {
          liquid: 'wine and stock',
          temperature: { fahrenheit: 325, celsius: 163 },
          timing: '1.5-2 hours'
        }
      }
    },
    regionalPreparations: {
      'french': {
        'pintade_en_cocotte': {
          method: 'braised with vegetables',
          sauce: 'natural jus',
          service: 'family style'
        }
      },
      'west_african': {
        'kedjenou': {
          method: 'slow-cooked with vegetables',
          spices: ['ginger', 'garlic', 'chili'],
          service: 'with rice or fufu'
        }
      }
    }
  },
  'pheasant': {
    elementalProperties: { Air: 0.4, Earth: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ['gamey', 'lean', 'elegant'],
    origin: ['Europe', 'Asia'],
    category: 'protein',
    subCategory: 'poultry',
    varieties: {
      'common': {
        weight: '2-3 lbs',
        characteristics: 'lean game bird, rich flavor',
        best_for: 'roasting, braising'
      },
      'ring_necked': {
        weight: '2.5-3.5 lbs',
        characteristics: 'most common variety',
        best_for: 'traditional preparations'
      }
    },
    cuts: {
      'whole': {
        characteristics: 'lean, requires careful cooking',
        cooking_methods: ['roast', 'braise', 'sous-vide'],
        internal_temp: { fahrenheit: 165, celsius: 74 }
      },
      'breast': {
        characteristics: 'lean, quick-cooking',
        cooking_methods: ['pan-sear', 'grill'],
        internal_temp: { fahrenheit: 155, celsius: 68 }
      },
      'leg': {
        characteristics: 'more flavor, tougher',
        cooking_methods: ['braise', 'confit'],
        internal_temp: { fahrenheit: 165, celsius: 74 }
      }
    },
    culinaryApplications: {
      'roasting': {
        'traditional': {
          preparation: {
            barding: 'wrap in bacon or pancetta',
            cavity: ['herbs', 'citrus', 'aromatics'],
            brining: 'optional, 4-6 hours'
          },
          cooking: {
            temperature: { fahrenheit: 350, celsius: 175 },
            timing: '45-60 minutes total',
            basting: 'frequently to prevent drying'
          }
        }
      },
      'braising': {
        preparation: {
          marinade: ['wine', 'aromatics', 'juniper'],
          searing: 'brown all sides well'
        },
        cooking: {
          liquid: 'wine and game stock',
          temperature: { fahrenheit: 325, celsius: 163 },
          timing: '1.5-2 hours'
        }
      }
    },
    regionalPreparations: {
      'british': {
        'roasted_pheasant': {
          method: 'traditional roasting',
          sauce: 'bread sauce',
          service: 'with game chips and watercress'
        }
      },
      'french': {
        'faisan_en_cocotte': {
          method: 'braised with vegetables',
          sauce: 'wine reduction',
          service: 'with wild mushrooms'
        }
      }
    }
  },
  'partridge': {
    elementalProperties: { Air: 0.4, Earth: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ['delicate', 'gamey', 'small'],
    origin: ['Europe', 'Middle East'],
    category: 'protein',
    subCategory: 'poultry',
    varieties: {
      'grey': {
        weight: '12-15 oz',
        characteristics: 'traditional game bird',
        best_for: 'roasting, grilling'
      },
      'red_legged': {
        weight: '14-18 oz',
        characteristics: 'milder flavor',
        best_for: 'roasting, braising'
      }
    },
    cuts: {
      'whole': {
        characteristics: 'small, tender game bird',
        cooking_methods: ['roast', 'grill', 'braise'],
        internal_temp: { fahrenheit: 165, celsius: 74 }
      },
      'breast': {
        characteristics: 'lean, quick-cooking',
        cooking_methods: ['pan-sear', 'grill'],
        internal_temp: { fahrenheit: 155, celsius: 68 }
      }
    },
    culinaryApplications: {
      'roasting': {
        'traditional': {
          preparation: {
            barding: 'wrap in vine leaves or bacon',
            cavity: ['herbs', 'garlic', 'butter'],
            trussing: 'tie legs together'
          },
          cooking: {
            temperature: { fahrenheit: 375, celsius: 190 },
            timing: '25-30 minutes total',
            resting: '10 minutes covered'
          }
        }
      },
      'braising': {
        preparation: {
          marinade: ['wine', 'herbs', 'shallots'],
          browning: 'quick sear on all sides'
        },
        cooking: {
          liquid: 'wine and stock',
          temperature: { fahrenheit: 325, celsius: 163 },
          timing: '45-60 minutes'
        }
      }
    },
    regionalPreparations: {
      'french': {
        'perdrix_aux_choux': {
          method: 'braised with cabbage',
          sauce: 'natural jus',
          service: 'with braised vegetables'
        }
      },
      'middle_eastern': {
        'stuffed_partridge': {
          method: 'stuffed with rice and spices',
          seasonings: ['allspice', 'cinnamon', 'pine nuts'],
          service: 'with flatbread and yogurt'
        }
      }
    }
  }
};

export default poultry;
