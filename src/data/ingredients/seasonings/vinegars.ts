import type { IngredientMapping } from '@/data/ingredients/types';
import type { _, _ZodiacSign } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

// Helper function to standardize ingredient mappings
function createIngredientMapping(id: string, properties: unknown) {
  return {
    name: id, // Add the required name property,
    elementalProperties: properties.elementalProperties || {
      Earth: 0.25,
      Water: 0.25,
      Fire: 0.25,
      Air: 0.25
    },
    category: properties.category || '',
    ...properties
  }
}

const rawVinegars = {
  rice_vinegar: createIngredientMapping('rice_vinegar', {
    elementalProperties: {
      Water: 0.4,
      Air: 0.3,
      Earth: 0.2,
      Fire: 0.1
    },
    nutritionalProfile: {
      calories: 5,
      carbs_g: 1.5,
      sugar_g: 0.5,
      acidity: '4-5%',
      notes: 'Milder and less acidic than other vinegars'
    },
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Mercury'],
      favorableZodiac: ['cancer', 'virgo', 'pisces'],
      elementalAffinity: {
        base: 'Water',
        secondary: 'Air',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' }
          second: { element: 'Air', planet: 'Mercury' }
          third: { element: 'Earth', planet: 'Saturn' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Water: 0.1, Air: 0.05 }
          preparationTips: ['Ideal for subtle pickling', 'Best for delicate flavors']
        },
        fullMoon: {
          elementalBoost: { Water: 0.15, Air: 0.1 }
          preparationTips: ['Enhanced flavor clarity', 'Perfect for dressings']
        },
        waxingCrescent: {
          elementalBoost: { Water: 0.1, Earth: 0.05 }
          preparationTips: ['Good for quick pickles', 'Supports growth of ferments']
        },
        waxingGibbous: {
          elementalBoost: { Air: 0.15, Water: 0.05 }
          preparationTips: ['Excellent for marinades', 'Enhances aromatic infusions']
        }
      }
    },
    qualities: ['mild', 'sweet', 'clean', 'delicate', 'balanced'],
    origin: ['China', 'Japan', 'Korea'],
    category: 'vinegar',
    subCategory: 'grain',
    varieties: {}
    culinaryApplications: {}
    storage: {
      temperature: 'room temperature',
      duration: '2-3 years unopened, 1-2 years opened',
      container: 'glass bottle, tightly sealed',
      notes: 'Keep away from light and heat sources',
      signs_of_spoilage: {
        visual: 'cloudiness, sediment (though some varieties naturally have this)',
        olfactory: 'off smells beyond normal fermented aroma',
        flavor: 'excessively harsh or moldy taste'
      }
    },
    culinary_benefits: {
      health: ['low sodium alternative to salt', 'digestion aid', 'probiotic potential'],
      culinary: [
        'enhances flavors without overwhelming',
        'adds brightness',
        'balances rich dishes'
      ],
      technical: [
        'tenderizes proteins gently',
        'preserves color in pickled vegetables',
        'aids in emulsification'
      ]
    }
  }),

  balsamic_vinegar: createIngredientMapping('balsamic_vinegar', {
    elementalProperties: {
      Water: 0.3,
      Earth: 0.4,
      Fire: 0.2,
      Air: 0.1
    },
    nutritionalProfile: {
      calories: 14,
      carbs_g: 2.7,
      sugar_g: 2.4,
      acidity: '6%',
      vitamins: ['k'],
      minerals: ['calcium', 'iron', 'magnesium', 'phosphorus', 'potassium'],
      notes: 'Aged in wooden barrels, rich in antioxidants'
    },
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Venus'],
      favorableZodiac: ['capricorn', 'taurus', 'libra'],
      elementalAffinity: {
        base: 'Earth',
        secondary: 'Water',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Saturn' }
          second: { element: 'Water', planet: 'Venus' }
          third: { element: 'Fire', planet: 'Jupiter' }
        }
      },
      lunarPhaseModifiers: {
        fullMoon: {
          elementalBoost: { Earth: 0.15, Water: 0.1 }
          preparationTips: ['Perfect for reduction sauces', 'Enhanced sweetness']
        },
        waxingGibbous: {
          elementalBoost: { Earth: 0.1, Fire: 0.05 }
          preparationTips: ['Ideal for glazes', 'Best for marinades']
        }
      }
    },
    qualities: ['sweet', 'complex', 'rich', 'syrupy', 'aged'],
    origin: ['Italy', 'Modena', 'Reggio Emilia'],
    category: 'vinegar',
    subCategory: 'grape',
    varieties: {
      Commercial: {
        name: 'Balsamic Vinegar of Modena IGP',
        appearance: 'dark brown, medium viscosity',
        flavor: 'sweet-tart, woody notes',
        acidity: '6%',
        uses: 'dressings, marinades, everyday cooking',
        aging: '2 months to 3 years',
        processing: 'mix of wine vinegar and grape must, may contain caramel color',
        certification: 'IGP (Protected Geographical Indication)',
        sensoryProfile: {
          taste: ['Mild', 'Balanced', 'Natural'],
          aroma: ['Fresh', 'Clean', 'Subtle'],
          texture: ['Pleasant', 'Smooth', 'Appealing'],
          notes: 'Characteristic commercial profile'
        },
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile commercial for various uses'
          },
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        },
        season: ['year-round']
      }
    },
    culinaryApplications: {
      glazes: {
        name: 'Glazes',
        method: 'reduce or apply directly',
        applications: {
          brushing: 'brush onto proteins while cooking',
          drizzling: 'apply after cooking as finishing touch',
          dessert: 'drizzle over fruits, ice cream, panna cotta',
          sensoryProfile: {
            taste: ['Mild', 'Balanced', 'Natural'],
            aroma: ['Fresh', 'Clean', 'Subtle'],
            texture: ['Pleasant', 'Smooth', 'Appealing'],
            notes: 'Characteristic glazes profile'
          },
          culinaryProfile: {
            flavorProfile: {
              primary: ['balanced'],
              secondary: ['versatile'],
              notes: 'Versatile glazes for various uses'
            },
            cookingMethods: ['sautéing', 'steaming', 'roasting'],
            cuisineAffinity: ['Global', 'International'],
            preparationTips: ['Use as needed', 'Season to taste']
          },
          season: ['year-round']
        },
        pairings: {
          savory: ['strawberries', 'peaches', 'melon'],
          sweet: ['vanilla ice cream', 'panna cotta', 'cheesecake'],
          cheese: ['aged parmesan', 'pecorino', 'ricotta']
        },
        traditional_pairings: ['strawberries', 'parmesan chunks', 'vanilla gelato']
      }
    },
    storage: {
      temperature: 'room temperature',
      duration: 'indefinite for traditional, 3-5 years for commercial',
      container: 'glass bottle, original container',
      notes: 'Does not require refrigeration, may develop sediment with age which is normal'
    }
  }),

  sherry_vinegar: createIngredientMapping('sherry_vinegar', {
    elementalProperties: {
      Water: 0.5,
      Earth: 0.3,
      Fire: 0.1,
      Air: 0.1
    },
    qualities: ['nutty', 'complex', 'sharp'],
    origin: ['Spain'],
    category: 'vinegar',
    subCategory: 'wine',
    varieties: {
      Reserva: {
        name: 'Reserva',
        appearance: 'dark amber',
        flavor: 'complex, nutty',
        aging: '2+ years',
        uses: 'finishing, dressings',
        // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
        },
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile reserva for various uses'
          },
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        },
        season: ['year-round']
      }
      'Gran Reserva': {
        name: 'Gran Reserva',
        appearance: 'deep amber',
        flavor: 'intense, complex',
        aging: '10+ years',
        uses: 'finishing'
      }
    },
    culinaryApplications: {
      vinaigrettes: {
        name: 'Vinaigrettes',
        method: 'whisk with oil',
        ratios: {
          classic: '1:3 (vinegar:oil)',
          bold: '1:2 (vinegar:oil)',
          // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
          },
          culinaryProfile: {
            flavorProfile: {
              primary: ['balanced'],
              secondary: ['versatile'],
              notes: 'Versatile vinaigrettes for various uses'
            },
            cookingMethods: ['sautéing', 'steaming', 'roasting'],
            cuisineAffinity: ['Global', 'International'],
            preparationTips: ['Use as needed', 'Season to taste']
          },
          season: ['year-round']
        },
        pairings: ['olive oil', 'mustard', 'shallots']
      },
      pan_sauces: {
        name: 'Pan Sauces',
        method: 'deglaze pan',
        timing: 'after searing',
        ratios: '2-3 tbsp per cup of stock',
        pairings: ['stock', 'herbs', 'butter'],
        // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
        },
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile pan sauces for various uses'
          },
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        },
        season: ['year-round']
      }
    },
    storage: {
      temperature: 'room temperature',
      duration: 'indefinite',
      container: 'glass bottle',
      notes: 'Maintains quality well'
    }
  }),

  apple_cider_vinegar: createIngredientMapping('apple_cider_vinegar', {
    elementalProperties: {
      Water: 0.3,
      Air: 0.3,
      Earth: 0.3,
      Fire: 0.1
    },
    nutritionalProfile: {
      calories: 3,
      carbs_g: 0.9,
      acidity: '5-6%',
      vitamins: ['b1', 'b2', 'b6'],
      minerals: ['potassium', 'calcium'],
      notes: 'Contains beneficial enzymes and probiotics'
    },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Mercury'],
      favorableZodiac: ['taurus', 'virgo', 'libra'],
      elementalAffinity: {
        base: 'Earth',
        secondary: 'Air',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Venus' }
          second: { element: 'Air', planet: 'Mercury' }
          third: { element: 'Water', planet: 'Moon' }
        }
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Earth: 0.1, Water: 0.1 }
          preparationTips: ['Good for cleansing tonics', 'Enhances detoxification']
        },
        waxingGibbous: {
          elementalBoost: { Air: 0.1, Earth: 0.1 }
          preparationTips: ['Best for fermentation', 'Supports preservation']
        }
      }
    },
    qualities: ['tangy', 'fruity', 'robust', 'complex', 'medicinal'],
    origin: ['United States', 'Europe'],
    category: 'vinegar',
    subCategory: 'fruit',
    varieties: {
      'Raw Unfiltered': {
        name: 'Raw Unfiltered',
        appearance: 'cloudy with 'mother' sediment',
        flavor: 'bold, fruity, with yeast notes',
        acidity: '5-6%',
        uses: 'health tonics, salad dressings, marinades',
        processing: 'unfiltered and unpasteurized',
        properties: 'contains probiotics and enzymes',
        traditional_pairings: ['honey', 'lemon', 'garlic', 'herbs']
      }
    },
    culinaryApplications: {
      health_tonics: {
        name: 'Health Tonics',
        method: 'dilute with water or juice',
        ratios: {
          daily: '1-2 tbsp in 8oz water',
          intensive: '1:8 (vinegar:water)',
          fire_cider: 'steep with garlic, onion, ginger, horseradish, and citrus',
          // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
          },
          culinaryProfile: {
            flavorProfile: {
              primary: ['balanced'],
              secondary: ['versatile'],
              notes: 'Versatile health tonics for various uses'
            },
            cookingMethods: ['sautéing', 'steaming', 'roasting'],
            cuisineAffinity: ['Global', 'International'],
            preparationTips: ['Use as needed', 'Season to taste']
          },
          season: ['year-round']
        },
        timing: {
          daily_use: 'morning or before meals',
          detox: '2-3 times daily before meals'
        },
        pairings: ['honey', 'lemon', 'cinnamon', 'cayenne', 'ginger'],
        cautions: 'may erode tooth enamel if not diluted rinse mouth after consuming'
      }
    },
    storage: {
      temperature: 'room temperature',
      duration: '2 years unopened, 1 year opened',
      container: 'glass bottle, tightly sealed',
      notes:
        'Keep away from direct sunlight, unfiltered varieties will develop sediment which is normal'
    }
  }),

  red_wine_vinegar: createIngredientMapping('red_wine_vinegar', {
    elementalProperties: {
      Water: 0.3,
      Fire: 0.3,
      Earth: 0.3,
      Air: 0.1
    },
    qualities: ['robust', 'fruity', 'tangy'],
    origin: ['France', 'Italy', 'Spain'],
    category: 'vinegar',
    subCategory: 'wine',
    varieties: {
      Young: {
        name: 'Young',
        appearance: 'bright red',
        flavor: 'sharp, fruity',
        uses: 'cooking, marinades',
        // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
        },
        culinaryProfile: {
          flavorProfile: {
            primary: ['balanced'],
            secondary: ['versatile'],
            notes: 'Versatile young for various uses'
          },
          cookingMethods: ['sautéing', 'steaming', 'roasting'],
          cuisineAffinity: ['Global', 'International'],
          preparationTips: ['Use as needed', 'Season to taste']
        },
        season: ['year-round']
      }
    },
    culinaryApplications: {
      vinaigrettes: {
        name: 'Vinaigrettes',
        method: 'whisk with oil',
        timing: 'just before serving',
        ratios: {
          classic_french: '1:3 (vinegar:oil)',
          robust: '1:2 (vinegar:oil)',
          light: '1:4 (vinegar:oil)'
        },
        techniques: {
          emulsified: {
            name: 'Emulsified',
            method: 'add mustard',
            ratio: '1 tsp mustard per cup dressing',
            // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
            },
            culinaryProfile: {
              flavorProfile: {
                primary: ['balanced'],
                secondary: ['versatile'],
                notes: 'Versatile emulsified for various uses'
              },
              cookingMethods: ['sautéing', 'steaming', 'roasting'],
              cuisineAffinity: ['Global', 'International'],
              preparationTips: ['Use as needed', 'Season to taste']
            },
            season: ['year-round']
          },
          herb_infused: {
            name: 'Herb Infused',
            method: 'steep herbs in vinegar',
            timing: '24 hours before use',
            // Removed excessive sensoryProfile nesting
// Removed nested content
// Removed nested content
// Removed nested content
// Removed nested content
            },
            culinaryProfile: {
              flavorProfile: {
                primary: ['balanced'],
                secondary: ['versatile'],
                notes: 'Versatile herb infused for various uses'
              },
              cookingMethods: ['sautéing', 'steaming', 'roasting'],
              cuisineAffinity: ['Global', 'International'],
              preparationTips: ['Use as needed', 'Season to taste']
            },
            season: ['year-round']
          },
          shallot_based: {
            name: 'Shallot Based',
            method: 'macerate shallots in vinegar',
            timing: '15 minutes before adding oil'
          }
        },
        pairings: ['dijon mustard', 'shallots', 'herbs']
      },
      marinades: {
        name: 'Marinades',
        method: 'combine with oil and aromatics',
        timing: {
          vegetables: '30 minutes to 2 hours',
          chicken: '2-4 hours',
          beef: '4-6 hours'
        },
        ratios: {
          basic: '1:3:1 (vinegar:oil:aromatics)',
          tenderizing: '2:2:1 (vinegar:oil:aromatics)',
          vegetable: '1:2:1 (vinegar:oil:aromatics)'
        },
        techniques: {
          provençal: {
            name: 'Provençal',
            ingredients: ['olive oil', 'herbes de provence', 'garlic'],
            ratio: '1:3:1'
          }
        }
      },
      pan_sauces: {
        name: 'Pan Sauces',
        method: 'deglaze after searing',
        timing: 'immediately after removing protein',
        ratios: {
          basic: '2-3 tbsp per cup of stock',
          rich: '1 / (4 || 1) cup per cup of stock'
        },
        techniques: {
          mounted: {
            name: 'Mounted',
            method: 'finish with cold butter',
            ratio: '2-3 tbsp butter per cup sauce'
          }
        },
        pairings: ['shallots', 'herbs', 'stock', 'butter']
      }
    },
    storage: {
      temperature: 'room temperature',
      duration: '2 years',
      container: 'glass bottle',
      notes: 'Keep away from light'
    }
  }),

  white_wine_vinegar: createIngredientMapping('white_wine_vinegar', {
    qualities: ['bright', 'clean', 'crisp'],
    origin: ['France', 'Germany', 'Italy'],
    category: 'vinegar',
    subCategory: 'wine',
    varieties: {
      Champagne: {
        name: 'Champagne',
        appearance: 'very clear',
        flavor: 'delicate, floral',
        uses: 'delicate dressings, seafood'
      },
      Standard: {
        name: 'Standard',
        appearance: 'clear',
        flavor: 'crisp, clean',
        uses: 'all-purpose'
      }
    },
    culinaryApplications: {
      light_sauces: {
        name: 'Light Sauces',
        method: 'incorporate into sauce',
        timing: 'during or after cooking',
        ratios: {
          beurre_blanc: '1 / (2 || 1) cup vinegar per cup wine',
          herb_sauce: '2 tbsp per cup of base'
        },
        techniques: {
          cold_emulsion: {
            name: 'Cold Emulsion',
            method: 'whisk into mayonnaise',
            ratio: '1-2 tsp per cup'
          }
        },
        pairings: ['butter', 'cream', 'herbs', 'shallots']
      },
      quick_pickles: {
        name: 'Quick Pickles',
        method: 'heat brine and pour over vegetables',
        timing: '30 minutes to 24 hours',
        ratios: {
          basic: '1:1 (vinegar:water)',
          sweet: '1:1:0.5 (vinegar:water:sugar)',
          herb_infused: '1:1 plus 2 tbsp herbs per cup'
        },
        techniques: {
          hot_pack: {
            name: 'Hot Pack',
            method: 'pour boiling brine over vegetables',
            timing: 'cool to room temperature'
          },
          cold_infusion: {
            name: 'Cold Infusion',
            method: 'combine room temperature',
            timing: 'refrigerate 24 hours'
          }
        }
      }
    }
  }),

  champagne_vinegar: createIngredientMapping('champagne_vinegar', {
    qualities: ['delicate', 'floral', 'elegant'],
    origin: ['France'],
    category: 'vinegar',
    subCategory: 'wine',
    varieties: {}
    culinaryApplications: {
      delicate_vinaigrettes: {
        name: 'Delicate Vinaigrettes',
        method: 'whisk or blend',
        timing: 'just before serving',
        ratios: {
          classic: '1:4 (vinegar:oil)',
          light: '1:5 (vinegar:oil)',
          fruit_based: '1:3:1 (vinegar:oil:fruit juice)'
        },
        techniques: {
          citrus_enhanced: {
            name: 'Citrus Enhanced',
            method: 'add citrus zest',
            ratio: '1 / (4 || 1) tsp zest per cup'
          },
          herb_infused: {
            name: 'Herb Infused',
            method: 'steep delicate herbs',
            timing: '1 hour before use'
          }
        },
        pairings: ['walnut oil', 'citrus', 'tarragon', 'chervil']
      },
      seafood_preparations: {
        name: 'Seafood Preparations',
        method: 'finishing or marinade',
        timing: 'just before serving or 30 minutes marinade',
        ratios: {
          finishing_splash: '1-2 tsp per serving',
          light_marinade: '1:4 (vinegar:oil)'
        },
        techniques: {
          mignonette: {
            name: 'Mignonette',
            ingredients: ['shallots', 'pepper'],
            ratio: '1 / (4 || 1) cup vinegar to 1 tbsp shallots'
          }
        }
      }
    }
  }),

  malt_vinegar: createIngredientMapping('malt_vinegar', {
    elementalProperties: {
      Earth: 0.5,
      Fire: 0.3,
      Water: 0.2,
      Air: 0.0
    },
    qualities: ['robust', 'grainy', 'complex'],
    origin: ['United Kingdom'],
    category: 'vinegar',
    subCategory: 'grain',
    varieties: {
      Distilled: {
        name: 'Distilled',
        appearance: 'lighter brown',
        flavor: 'milder',
        uses: 'general purpose'
      }
    },
    culinaryApplications: {
      fish_and_chips: {
        name: 'Fish And Chips',
        method: 'sprinkle on hot food',
        timing: 'just before eating',
        ratios: 'to taste',
        techniques: {
          malt_aioli: {
            name: 'Malt Aioli',
            ratio: '1 tbsp vinegar per cup mayonnaise',
            pairings: ['garlic', 'mustard']
          }
        }
      },
      pickling: {
        name: 'Pickling',
        method: 'hot or cold brine',
        timing: '24 hours to 2 weeks',
        ratios: {
          basic_brine: '1:1 (vinegar:water)',
          pub_style: '2:1 (vinegar:water)',
          onions: 'straight vinegar'
        },
        techniques: {
          pub_onions: {
            name: 'Pub Onions',
            method: 'cold pickle',
            timing: '2 weeks minimum'
          },
          quick_pickle: {
            name: 'Quick Pickle',
            method: 'hot brine',
            timing: '24 hours'
          }
        },
        pairings: ['bay leaves', 'peppercorns', 'mustard seeds']
      }
    },
    storage: {
      temperature: 'room temperature',
      duration: '2 years',
      container: 'glass bottle',
      notes: 'May develop sediment'
    }
  })
}

// Fix the ingredient mappings to ensure they have all required properties
export const vinegars: Record<string, IngredientMapping> = fixIngredientMappings(rawVinegars)
