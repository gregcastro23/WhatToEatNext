import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawAromaticHerbs = {
  thyme: {
    name: 'Thyme',
    category: 'herb',
    subCategory: 'aromatic',
    elementalProperties: { Air: 0.5, Fire: 0.3, Earth: 0.1, Water: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    },
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Venus'],
      favorableZodiac: ['gemini', 'libra', 'aquarius'],
      elementalAffinity: {
        base: 'Air',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercury' },
          second: { element: 'Fire', planet: 'Sun' },
          third: { element: 'Earth', planet: 'Saturn' }
        }
      }
    },
    lunarPhaseModifiers: {
      newMoon: {
        elementalBoost: { Air: 0.1 },
        preparationTips: ['Best for drying and preserving']
      },
      fullMoon: {
        elementalBoost: { Air: 0.2 },
        preparationTips: ['Enhanced aromatic properties', 'Ideal for teas and infusions']
      },
      waxingCrescent: {
        elementalBoost: { Air: 0.1, Fire: 0.05 },
        preparationTips: ['Good for light cooking applications']
      },
      waxingGibbous: {
        elementalBoost: { Air: 0.15, Fire: 0.1 },
        preparationTips: ['Perfect for stocks and broths']
      }
    }
  },
  rosemary: {
    name: 'Rosemary',
    category: 'herb',
    subCategory: 'aromatic',
    elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.1, Water: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    },
    astrologicalProfile: {
      rulingPlanets: ['Sun', 'Mars'],
      favorableZodiac: ['leo', 'aries', 'sagittarius'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Sun' },
          second: { element: 'Air', planet: 'Jupiter' },
          third: { element: 'Earth', planet: 'Pluto' }
        }
      }
    },
    lunarPhaseModifiers: {
      newMoon: {
        elementalBoost: { Fire: 0.1, Earth: 0.05 },
        preparationTips: ['Best for subtle infusions', 'Good time for drying']
      },
      waxingCrescent: {
        elementalBoost: { Fire: 0.15, Air: 0.05 },
        preparationTips: ['Good for infused oils']
      },
      firstQuarter: {
        elementalBoost: { Fire: 0.2 },
        preparationTips: ['Ideal for grilling meats']
      },
      waxingGibbous: {
        elementalBoost: { Fire: 0.25 },
        preparationTips: ['Perfect for roasts and hearty dishes']
      },
      fullMoon: {
        elementalBoost: { Fire: 0.3 },
        preparationTips: ['Maximum potency', 'Best for medicinal preparations']
      },
      waningGibbous: {
        elementalBoost: { Fire: 0.2, Air: 0.1 },
        preparationTips: ['Excellent for soups and stews']
      },
      lastQuarter: {
        elementalBoost: { Fire: 0.15, Earth: 0.1 },
        preparationTips: ['Good for marinades']
      },
      waningCrescent: {
        elementalBoost: { Fire: 0.1, Earth: 0.15 },
        preparationTips: ['Best for subtle applications']
      }
    }
  },
  basil: {
    name: 'Basil',
    category: 'herb',
    subCategory: 'aromatic',
    elementalProperties: { Air: 0.5, Fire: 0.3, Earth: 0.2, Water: 0 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    },
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Moon'],
      favorableZodiac: ['gemini', 'cancer'],
      elementalAffinity: {
        base: 'Air',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercury' },
          second: { element: 'Fire', planet: 'Moon' },
          third: { element: 'Earth', planet: 'Venus' }
        }
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Air: 0.1, Fire: 0.1 },
          preparationTips: ['Best for fresh pesto']
        },
        fullMoon: {
          elementalBoost: { Fire: 0.2 },
          preparationTips: ['Ideal for infused oils']
        }
      }
    }
  },

  // Added herbs with culinary properties
  lovage: {
    name: 'Lovage',
    elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Jupiter'],
      favorableZodiac: ['gemini', 'virgo', 'sagittarius'],
      signAffinities: ['gemini', 'virgo', 'sagittarius'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Mercury' },
          second: { element: 'Fire', planet: 'Jupiter' },
          third: { element: 'Air', planet: 'Saturn' }
        }
      }
    },
    qualities: ['warming', 'aromatic', 'digestive', 'stimulating'],
    origin: ['Mediterranean', 'Western Asia'],
    season: ['spring', 'summer'],
    category: 'herb',
    subCategory: 'culinary',
    affinities: ['potato', 'chicken', 'fish', 'tomato', 'celery'],
    cookingMethods: ['fresh', 'dried', 'infused'],
    sensoryProfile: {
      taste: { savory: 0.8, bitter: 0.3, sweet: 0.1 },
      aroma: { herbaceous: 0.7, celery: 0.9, citrus: 0.2 },
      texture: { leafy: 0.8 }
    },
    culinaryUses: ['soups', 'stews', 'broths', 'pickling', 'salad dressings'],
    flavor: 'Intense celery-like flavor with hints of anise and parsley',
    preparation: {
      fresh: {
        storage: 'stem in water, refrigerated',
        duration: '1 week',
        tips: ['use sparingly due to strong flavor']
      },
      dried: {
        storage: 'airtight container',
        duration: '6 months',
        tips: ['crush just before use']
      }
    },
    modality: 'Cardinal'
  },

  'lemon verbena': {
    name: 'Lemon Verbena',
    elementalProperties: { Air: 0.5, Fire: 0.3, Water: 0.1, Earth: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    },
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Venus'],
      favorableZodiac: ['gemini', 'libra', 'aquarius'],
      signAffinities: ['gemini', 'libra', 'aquarius'],
      elementalAffinity: {
        base: 'Air',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercury' },
          second: { element: 'Venus', planet: 'Venus' },
          third: { element: 'Air', planet: 'Uranus' }
        }
      }
    },
    qualities: ['cooling', 'uplifting', 'refreshing', 'calming'],
    origin: ['South America'],
    season: ['summer'],
    category: 'herb',
    subCategory: 'aromatic',
    affinities: ['fish', 'chicken', 'desserts', 'tea', 'fruit'],
    cookingMethods: ['infused', 'dried', 'fresh'],
    sensoryProfile: {
      taste: { citrus: 0.9, sweet: 0.2, bitter: 0.1 },
      aroma: { lemon: 0.9, floral: 0.5, green: 0.3 },
      texture: { leafy: 0.7 }
    },
    culinaryUses: ['herbal teas', 'desserts', 'syrups', 'cocktails', 'marinades'],
    flavor: 'Intense lemon flavor with floral notes, stronger than lemongrass',
    preparation: {
      fresh: {
        storage: 'wrapped in damp paper towel, refrigerated',
        duration: '5 days',
        tips: ['bruise leaves to release aroma']
      },
      dried: {
        storage: 'dark glass container',
        duration: '8 months',
        tips: ['retains aroma well when dried']
      },
      infusions: {
        techniques: ['steep in hot water', 'infuse in cream or sugar']
      }
    },
    modality: 'Mutable'
  },

  savory: {
    name: 'Savory',
    elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    },
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Saturn'],
      favorableZodiac: ['aries', 'scorpio', 'capricorn'],
      signAffinities: ['aries', 'scorpio', 'capricorn'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Mars' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Water', planet: 'Pluto' }
        }
      }
    },
    qualities: ['warming', 'stimulating', 'digestive', 'astringent'],
    origin: ['Mediterranean'],
    season: ['summer'],
    category: 'herb',
    subCategory: 'culinary',
    affinities: ['beans', 'lentils', 'meat', 'poultry', 'eggs'],
    cookingMethods: ['dried', 'fresh', 'infused'],
    sensoryProfile: {
      taste: { savory: 0.8, peppery: 0.5, bitter: 0.2 },
      aroma: { spicy: 0.7, piny: 0.4, earthy: 0.3 },
      texture: { leafy: 0.6 }
    },
    culinaryUses: ['bean dishes', 'meat stews', 'sausages', 'herb blends', 'vinegars'],
    flavor: 'Peppery, thyme-like flavor with hints of oregano and marjoram',
    varieties: {
      summer_savory: {
        flavor: 'milder, with notes of thyme and mint',
        best_uses: ['fresh applications', 'delicate dishes']
      },
      winter_savory: {
        flavor: 'stronger, more pungent and earthy',
        best_uses: ['hearty stews', 'long cooking times']
      }
    },
    preparation: {
      fresh: {
        storage: 'wrapped in paper towel, refrigerated',
        duration: '1 week',
        tips: ['add at beginning of cooking']
      },
      dried: {
        storage: 'airtight container',
        duration: '1 year',
        tips: ['retains flavor well when dried']
      }
    },
    modality: 'Fixed'
  },

  'curry leaf': {
    name: 'Curry Leaf',
    elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    },
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Jupiter'],
      favorableZodiac: ['aries', 'scorpio', 'sagittarius'],
      signAffinities: ['aries', 'scorpio', 'sagittarius'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Mars' },
          second: { element: 'Earth', planet: 'Jupiter' },
          third: { element: 'Water', planet: 'Pluto' }
        }
      }
    },
    qualities: ['warming', 'stimulating', 'digestive', 'aromatic'],
    origin: ['India', 'Sri Lanka'],
    season: ['year-round'],
    category: 'herb',
    subCategory: 'aromatic',
    affinities: ['lentils', 'coconut', 'fish', 'vegetables', 'rice'],
    cookingMethods: ['fried', 'fresh', 'dried'],
    sensoryProfile: {
      taste: { savory: 0.8, nutty: 0.5, bitter: 0.3 },
      aroma: { citrus: 0.6, earthy: 0.5, nutty: 0.4 },
      texture: { leafy: 0.7, firm: 0.4 }
    },
    culinaryUses: ['dal', 'curries', 'rice dishes', 'chutneys', 'vegetable dishes'],
    flavor: 'Complex citrus and nutty flavor that is the foundation of many Indian dishes',
    preparation: {
      fresh: {
        storage: 'wrapped in paper towel, refrigerated',
        duration: '1-2 weeks',
        tips: ['can be frozen for longer storage']
      },
      cooking: {
        techniques: ['tempered in hot oil', 'fried as first ingredient', 'whole leaves'],
        tips: ['typically left in dish, though not always eaten']
      }
    },
    traditional: {
      south_indian: {
        dishes: ['tadka dal', 'sambar', 'rasam', 'coconut chutney'],
        techniques: ['tempered in hot ghee or oil']
      }
    },
    modality: 'Cardinal'
  },

  chervil: {
    name: 'Chervil',
    elementalProperties: { Air: 0.4, Earth: 0.3, Water: 0.2, Fire: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    },
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Moon'],
      favorableZodiac: ['virgo', 'gemini', 'cancer'],
      signAffinities: ['virgo', 'gemini', 'cancer'],
      elementalAffinity: {
        base: 'Air',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercury' },
          second: { element: 'Water', planet: 'Moon' },
          third: { element: 'Earth', planet: 'Venus' }
        }
      }
    },
    qualities: ['cooling', 'delicate', 'digestive', 'balancing'],
    origin: ['Caucasus', 'Russia'],
    season: ['spring', 'fall'],
    category: 'herb',
    subCategory: 'culinary',
    affinities: ['eggs', 'fish', 'chicken', 'potatoes', 'carrots'],
    cookingMethods: ['fresh', 'garnish', 'light cooking'],
    sensoryProfile: {
      taste: { anise: 0.5, parsley: 0.7, sweet: 0.2 },
      aroma: { anise: 0.6, fresh: 0.7 },
      texture: { delicate: 0.9, feathery: 0.8 }
    },
    culinaryUses: ['fine sauces', 'egg dishes', 'salads', 'soups', 'fish dishes'],
    flavor: 'Delicate flavor similar to parsley with subtle anise notes',
    preparation: {
      fresh: {
        storage: 'stem in water, refrigerated',
        duration: '2-3 days',
        tips: ['very perishable', 'add at the end of cooking']
      },
      cooking: {
        techniques: ['add last minute', 'quick sauté', 'raw in dressings'],
        tips: ['heat destroys flavor quickly']
      }
    },
    traditionalUses: {},
    modality: 'Mutable'
  },

  dill: {
    name: 'Dill',
    elementalProperties: {
      Air: 0.4,
      Fire: 0.3,
      Earth: 0.2,
      Water: 0.1
    },
    category: 'culinary_herb',
    qualities: ['nourishing'],
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    }
  },

  bay_leaf: {
    name: 'Bay Leaf',
    elementalProperties: {
      Air: 0.4,
      Fire: 0.3,
      Earth: 0.2,
      Water: 0.1
    },
    category: 'culinary_herb',
    qualities: ['nourishing'],
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    }
  },
  anise: {
    name: 'Anise',
    elementalProperties: {
      Air: 0.4,
      Fire: 0.3,
      Earth: 0.2,
      Water: 0.1
    },
    category: 'culinary_herb',
    qualities: ['nourishing'],
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: []
    }
  }
};

// Fix the ingredient mappings to ensure they have all required properties
// ✅ Pattern MM-1: Type assertion for ZodiacSign[] compatibility
export const _aromaticHerbs: Record<string, IngredientMapping> = fixIngredientMappings(
  rawAromaticHerbs as Record<string, Partial<IngredientMapping>>,
);
