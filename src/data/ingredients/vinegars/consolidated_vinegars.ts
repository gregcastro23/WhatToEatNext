import type { IngredientMapping, ElementalProperties, ZodiacSign } from '@/types/alchemy';
import type { Season } from '@/types/seasons';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawVinegars: Record<string, Partial<IngredientMapping>> = {
  'rice_vinegar': {
    name: 'Rice Vinegar',
    category: 'vinegar',
    subCategory: 'grain',
    elementalProperties: {
      Water: 0.4,
      Air: 0.3,
      Earth: 0.2,
      Fire: 0.1
    },
    qualities: ['mild', 'sweet', 'clean', 'delicate', 'balanced'],
    origin: ['China', 'Japan', 'Korea'],
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
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Air', planet: 'Mercury' },
          third: { element: 'Earth', planet: 'Saturn' }
        }
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Water: 0.1, Air: 0.05 },
          preparationTips: ['Ideal for subtle pickling', 'Best for delicate flavors']
        },
        fullMoon: {
          elementalBoost: { Water: 0.15, Air: 0.1 },
          preparationTips: ['Enhanced flavor clarity', 'Perfect for dressings']
        },
        waxingCrescent: {
          elementalBoost: { Water: 0.1, Earth: 0.05 },
          preparationTips: ['Good for quick pickles', 'Supports growth of ferments']
        },
        waxingGibbous: {
          elementalBoost: { Air: 0.15, Water: 0.05 },
          preparationTips: ['Excellent for marinades', 'Enhances aromatic infusions']
        }
      }
    },
    varieties: {
      'Chinese Black': {
        name: 'Chinese Black',
        appearance: 'dark brown to black',
        flavor: 'deep, malty, earthy',
        acidity: '4.5-5.5%',
        uses: 'dipping sauces, braising, stir-fries',
        region: 'Zhejiang province',
        aging: '1-3 years',
        traditional_pairings: ['soy sauce', 'star anise', 'ginger']
      },
      'Japanese Clear': {
        name: 'Japanese Clear',
        appearance: 'clear, pale, transparent',
        flavor: 'delicate, mild, slightly sweet',
        acidity: '4-5%',
        uses: 'sushi rice, dressings, marinades, pickles',
        region: 'various regions of Japan',
        fermentation: 'slower process for clarity',
        traditional_pairings: ['mirin', 'wasabi', 'kombu']
      },
      'Seasoned': {
        name: 'Seasoned',
        appearance: 'clear, pale yellow',
        flavor: 'sweet and tangy, umami notes',
        acidity: '4-5%',
        uses: 'sushi, salads, dipping sauces',
        ingredients: 'rice vinegar, sugar, salt, sometimes mirin',
        balance: 'sweet-acid ratio varies by brand',
        shelf_life: 'shorter than unseasoned varieties'
      },
      'Red': {
        name: 'Red Rice Vinegar',
        appearance: 'red to pink tinted',
        flavor: 'sweet-tart with distinct fermented notes',
        acidity: '4-5%',
        uses: 'seafood dishes, soups, sweet and sour preparations',
        origin: 'Southern China',
        process: 'made with red yeast rice',
        traditional_pairings: ['fish', 'duck', 'sweet dim sum']
      }
    },
    culinaryApplications: {
      'sushi_rice': {
        name: 'Sushi Rice',
        method: 'mix into hot rice',
        timing: 'immediately after cooking',
        ratios: {
          'basic': '2-3 tbsp per 2 cups rice',
          'seasoned': '2 tbsp per 2 cups rice',
          'professional': '80-100ml per 1kg rice'
        },
        techniques: {
          'traditional': 'fan while mixing to cool and remove moisture',
          'quick': 'fold in gently with wooden paddle',
          'hangiri': 'use traditional wooden tub for authentic results'
        },
        tips: [
          'Rice should be just warm, not hot when adding vinegar',
          'Avoid overmixing to prevent mushy texture',
          'Let rest covered with damp cloth for 10-15 minutes'
        ]
      },
      'dressings': {
        name: 'Dressings',
        method: 'whisk with oil',
        ratios: {
          'basic': '1:3 (vinegar:oil)',
          'light': '1:2 (vinegar:oil)',
          'asian': '1:1:1 (vinegar:oil:soy sauce)'
        },
        pairings: ['sesame oil', 'soy sauce', 'ginger', 'miso', 'mirin'],
        emulsifiers: {
          'traditional': 'mustard or egg yolk',
          'plant_based': 'miso or tahini'
        },
        applications: ['green salads', 'cucumber salads', 'warm vegetable dishes', 'noodle salads']
      },
      'pickling': {
        name: 'Pickling',
        method: 'combine with salt and sugar',
        timing: {
          'quick_pickles': '1-4 hours',
          'refrigerator_pickles': '24-48 hours',
          'traditional': '1-2 weeks'
        },
        ratios: {
          'basic_brine': '1:1:4 (vinegar:sugar:water)',
          'quick_pickle': '1:1 (vinegar:water)',
          'sweet_pickle': '1:2:3 (vinegar:sugar:water)'
        },
        vegetables: {
          'quick_pickle_suitable': ['cucumber', 'radish', 'carrot', 'daikon'],
          'long_pickle_suitable': ['cabbage', 'turnip', 'burdock root']
        },
        flavor_additions: ['kombu', 'chili', 'ginger', 'citrus zest', 'shiso leaves']
      }
    },
    storage: {
      container: 'glass bottle',
      duration: '2-3 years',
      temperature: 'room temperature',
      notes: 'Quality degrades over time, but remains safe to use'
    }
  },
  'balsamic_vinegar': {
    name: 'Balsamic Vinegar',
    category: 'vinegar',
    subCategory: 'grape',
    elementalProperties: {
      Water: 0.3,
      Earth: 0.4,
      Fire: 0.2,
      Air: 0.1
    },
    qualities: ['sweet', 'complex', 'syrupy', 'rich'],
    origin: ['Italy'],
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
      rulingPlanets: ['Venus', 'Saturn', 'Jupiter'],
      favorableZodiac: ['taurus', 'libra', 'capricorn'],
      elementalAffinity: {
        base: 'Earth',
        secondary: 'Water',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Venus' },
          second: { element: 'Earth', planet: 'Saturn' },
          third: { element: 'Fire', planet: 'Jupiter' }
        }
      }
    },
    varieties: {
      'Traditional (DOP)': {
        name: 'Traditional Balsamic Vinegar of Modena',
        appearance: 'thick, glossy, deep mahogany',
        flavor: 'complex sweet-sour, notes of fig, molasses, cherry, chocolate',
        acidity: '4.5%',
        uses: 'finishing, desserts, special occasions',
        region: 'Modena and Reggio Emilia, Italy',
        aging: 'minimum 12 years, up to 25+ years',
        process: 'traditional solera method in wood barrels',
        grapes: 'Trebbiano, sometimes Lambrusco'
      },
      'Condimento': {
        name: 'Condimento Grade Balsamic',
        appearance: 'moderately thick, dark brown',
        flavor: 'balanced sweet-sour, woody notes',
        acidity: '5-6%',
        uses: 'finishing, salads, cheese pairings',
        aging: '3-7 years',
        grapes: 'Trebbiano and others',
        notes: 'Made in traditional method but doesn\'t meet all DOP requirements'
      },
      'IGP': {
        name: 'Balsamic Vinegar of Modena IGP',
        appearance: 'medium thickness, brown',
        flavor: 'sweet-sour, less complex',
        acidity: '6%',
        uses: 'cooking, salads, marinades',
        aging: 'minimum 2 months, some aged 3+ years',
        ingredients: 'wine vinegar, grape must, caramel color (sometimes)',
        notes: 'More affordable everyday option'
      },
      'White': {
        name: 'White Balsamic',
        appearance: 'golden, transparent',
        flavor: 'lighter, brighter, subtle sweetness',
        acidity: '5.5-6%',
        uses: 'light salads, pale sauces, seafood',
        aging: 'shorter period in uncharred barrels',
        notes: 'Less sweet, milder flavor than traditional'
      }
    },
    culinaryApplications: {
      'reduction': {
        name: 'Reduction',
        method: 'simmer gently to reduce volume',
        timing: '15-20 minutes or until syrupy',
        ratios: {
          'basic': '1:0 (pure reduction)',
          'sweetened': '2:1 (vinegar:honey)',
          'flavored': '4:1:1 (vinegar:fruit juice:sweetener)'
        },
        techniques: {
          'classic': 'low heat, watch carefully to prevent burning',
          'quick': 'add small amount of cornstarch for faster thickening'
        },
        applications: ['Drizzle over meats', 'Dessert garnish', 'Plate decoration']
      },
      'salad_dressing': {
        name: 'Salad Dressing',
        method: 'whisk with oil and seasonings',
        ratios: {
          'classic': '1:3 (vinegar:oil)',
          'bold': '1:2 (vinegar:oil)',
          'sweet': '1:2:1 (vinegar:oil:honey)'
        },
        pairings: ['extra virgin olive oil', 'dijon mustard', 'shallots', 'herbs'],
        salad_types: {
          'complementary': ['arugula', 'strawberry', 'walnut', 'blue cheese'],
          'contrasting': ['mixed greens', 'pear', 'pecan', 'goat cheese']
        }
      },
      'marinade': {
        name: 'Marinade',
        method: 'combine with oil and aromatics',
        timing: {
          'poultry': '1-4 hours',
          'beef': '2-8 hours',
          'vegetables': '30 minutes to 1 hour'
        },
        ratios: {
          'basic': '1:2:1 (vinegar:oil:sweetener)',
          'herbal': '1:2:1:1 (vinegar:oil:herb paste:sweetener)'
        },
        flavor_profiles: {
          'italian': ['garlic', 'rosemary', 'thyme', 'oregano'],
          'mediterranean': ['lemon', 'mint', 'garlic', 'oregano']
        }
      },
      'glaze': {
        name: 'Glaze',
        method: 'reduce with sweetener',
        timing: 'until thick enough to coat back of spoon',
        applications: {
          'proteins': 'brush on during last minutes of cooking',
          'vegetables': 'toss after roasting',
          'fruits': 'drizzle over grilled or poached fruits'
        },
        pairings: ['strawberries', 'peaches', 'grilled vegetables', 'roasted meats']
      }
    },
    storage: {
      container: 'original bottle or glass container',
      duration: '3-5 years for commercial, decades for traditional',
      temperature: 'cool, dark pantry',
      notes: 'Does not require refrigeration, may develop harmless sediment'
    }
  },
  'apple_cider_vinegar': {
    name: 'Apple Cider Vinegar',
    category: 'vinegar',
    subCategory: 'fruit',
    elementalProperties: {
      Water: 0.35,
      Earth: 0.25,
      Air: 0.25,
      Fire: 0.15
    },
    qualities: ['tart', 'fruity', 'subtly sweet', 'robust'],
    origin: ['Ancient Rome', 'Colonial America'],
    nutritionalProfile: {
      calories: 3,
      carbs_g: 0.9,
      sugar_g: 0.4,
      acidity: '5-6%',
      vitamins: ['b1', 'b2', 'b6'],
      minerals: ['potassium', 'calcium', 'magnesium'],
      notes: 'Contains beneficial enzymes and trace minerals'
    },
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Mercury'],
      favorableZodiac: ['taurus', 'virgo', 'libra'],
      elementalAffinity: {
        base: 'Water',
        secondary: 'Earth',
        decanModifiers: {
          first: { element: 'Water', planet: 'Venus' },
          second: { element: 'Earth', planet: 'Mercury' },
          third: { element: 'Air', planet: 'Venus' }
        }
      }
    },
    varieties: {
      'Filtered': {
        name: 'Filtered Apple Cider Vinegar',
        appearance: 'clear amber',
        flavor: 'crisp, apple-forward, clean',
        acidity: '5%',
        uses: 'dressings, marinades, cooking',
        process: 'filtered to remove mother and sediment',
        shelf_stability: 'excellent',
        notes: 'Less enzymes than unfiltered'
      },
      'Unfiltered': {
        name: 'Unfiltered (with mother)',
        appearance: 'cloudy with sediment',
        flavor: 'robust, complex, fuller-bodied',
        acidity: '5-6%',
        uses: 'health applications, dressings, general use',
        process: 'includes beneficial bacteria and enzymes',
        notes: 'Contains active cultures similar to kombucha',
        storage: 'may develop more mother over time (harmless)'
      },
      'Infused': {
        name: 'Infused Varieties',
        appearance: 'varies by infusion',
        flavor: 'apple base with additional flavor notes',
        common_infusions: ['honey', 'herbs', 'berries', 'garlic', 'hot pepper'],
        uses: 'specialized applications depending on infusion',
        notes: 'Often homemade or artisanal products'
      },
      'Raw': {
        name: 'Raw Apple Cider Vinegar',
        appearance: 'very cloudy, significant sediment',
        flavor: 'intense, robust, complex',
        acidity: '5-7%',
        uses: 'health tonics, fermentation, specialty applications',
        process: 'unpasteurized, contains all natural enzymes',
        notes: 'May continue to ferment slightly in bottle'
      }
    },
    culinaryApplications: {
      'dressings': {
        name: 'Salad Dressings',
        method: 'whisk with oil and seasonings',
        ratios: {
          'basic': '1:3 (vinegar:oil)',
          'tangy': '1:2 (vinegar:oil)',
          'sweet': '1:3:1 (vinegar:oil:honey)'
        },
        pairings: ['olive oil', 'dijon mustard', 'honey', 'shallots'],
        salad_types: {
          'complementary': ['kale', 'apple', 'walnut', 'cheddar'],
          'contrasting': ['bitter greens', 'dried fruits', 'blue cheese']
        }
      },
      'pickles': {
        name: 'Quick Pickles',
        method: 'brine vegetables in vinegar solution',
        timing: {
          'quick': '1-4 hours',
          'refrigerator': '1-3 days'
        },
        ratios: {
          'basic': '1:1:1 (vinegar:water:sugar)',
          'spiced': '2:1:1:spices (vinegar:water:sugar:spices)'
        },
        vegetables: ['cucumbers', 'onions', 'radishes', 'carrots'],
        flavor_additions: ['dill', 'garlic', 'peppercorns', 'mustard seeds']
      },
      'braising': {
        name: 'Braising Liquid',
        method: 'add to cooking liquid for meats or vegetables',
        timing: 'add early in cooking process',
        ratios: {
          'subtle': '1:4 (vinegar:stock)',
          'prominent': '1:2 (vinegar:stock)'
        },
        meats: ['pork shoulder', 'chicken thighs', 'tough beef cuts'],
        vegetables: ['cabbage', 'collards', 'root vegetables'],
        flavor_pairings: ['apples', 'onions', 'bay leaves', 'thyme']
      },
      'baking': {
        name: 'Baking Applications',
        method: 'add to batter or dough',
        function: 'acid for leavening reaction with baking soda',
        ratios: {
          'standard': '1 tsp per cup of milk (to make buttermilk substitute)',
          'cake': '1-2 tsp per cake for added rise and flavor'
        },
        baked_goods: ['quick breads', 'pancakes', 'cakes', 'muffins'],
        notes: 'Creates tender crumb, slight apple undertone'
      }
    },
    medicinalApplications: {
      'digestive': {
        name: 'Digestive Tonic',
        method: 'dilute in water',
        dosage: '1-2 tbsp in 8oz water',
        timing: 'before meals',
        benefits: ['may aid digestion', 'can reduce heartburn for some'],
        notes: 'Unfiltered preferred for maximum benefits'
      },
      'skincare': {
        name: 'Skin Applications',
        method: 'dilute solution applied topically',
        dilution: '1:4 (vinegar:water)',
        uses: ['facial toner', 'scalp treatment', 'sunburn relief'],
        notes: 'Patch test first, may be too acidic for sensitive skin'
      }
    },
    storage: {
      container: 'original bottle or glass container',
      duration: '2+ years',
      temperature: 'room temperature, away from direct sunlight',
      notes: 'Unfiltered versions may develop more mother over time (beneficial)'
    }
  },
  'red_wine_vinegar': {
    name: 'Red Wine Vinegar',
    category: 'vinegar',
    subCategory: 'wine',
    elementalProperties: {
      Water: 0.4,
      Fire: 0.3,
      Earth: 0.2,
      Air: 0.1
    },
    qualities: ['robust', 'tangy', 'fruity', 'complex'],
    origin: ['Mediterranean', 'European'],
    nutritionalProfile: {
      calories: 2,
      carbs_g: 0.4,
      sugar_g: 0.1,
      acidity: '6-7%',
      vitamins: ['c'],
      minerals: ['iron', 'potassium', 'magnesium'],
      notes: 'Contains antioxidants from red wine'
    },
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Venus'],
      favorableZodiac: ['aries', 'taurus', 'scorpio'],
      elementalAffinity: {
        base: 'Fire',
        secondary: 'Water'
      }
    },
    varieties: {
      'Spanish': {
        name: 'Spanish Red Wine Vinegar',
        appearance: 'deep ruby red',
        flavor: 'bold, slightly sweet, moderate oak',
        acidity: '6-7%',
        uses: 'gazpacho, marinades, strong salads',
        grapes: 'Tempranillo, Garnacha, Spanish varieties',
        notes: 'Often aged in sherry barrels'
      },
      'Italian': {
        name: 'Italian Red Wine Vinegar',
        appearance: 'clear burgundy',
        flavor: 'bright, crisp, clean acidity',
        acidity: '6%',
        uses: 'everyday salads, Italian cooking',
        grapes: 'Sangiovese, Barbera, Italian varieties',
        notes: 'Often aged in wooden barrels'
      },
      'French': {
        name: 'French Red Wine Vinegar',
        appearance: 'deep crimson',
        flavor: 'complex, more refined, subtle',
        acidity: '6-7%',
        uses: 'classical French sauces, vinaigrettes',
        grapes: 'Cabernet, Merlot, French varieties',
        notes: 'Often longer aging process'
      },
      'Aged': {
        name: 'Aged Red Wine Vinegar',
        appearance: 'dark mahogany',
        flavor: 'mellow, complex, deep notes',
        acidity: '6%',
        uses: 'finishing, special preparations',
        aging: '2+ years in wooden barrels',
        notes: 'Premium product with developed flavor'
      }
    },
    culinaryApplications: {
      'vinaigrette': {
        name: 'Vinaigrette',
        method: 'emulsify with oil and seasonings',
        ratios: {
          'classic': '1:3 (vinegar:oil)',
          'french': '1:4 (vinegar:oil)',
          'bold': '1:2 (vinegar:oil)'
        },
        pairings: ['dijon mustard', 'shallots', 'herbs', 'honey'],
        techniques: {
          'basic': 'whisk with mustard as emulsifier',
          'blended': 'use blender for more stable emulsion',
          'jar': 'shake ingredients in sealed jar'
        },
        applications: ['mixed green salads', 'roasted vegetable salads', 'grain salads']
      },
      'marinade': {
        name: 'Marinade',
        method: 'combine with oil and seasonings',
        timing: {
          'beef': '2-24 hours',
          'lamb': '4-24 hours',
          'poultry': '1-4 hours',
          'vegetables': '30 minutes to 2 hours'
        },
        ratios: {
          'basic': '1:2:herbs (vinegar:oil:aromatics)',
          'intense': '2:2:1:herbs (vinegar:oil:wine:aromatics)'
        },
        techniques: {
          'vacuum': 'vacuum seal for faster penetration',
          'traditional': 'refrigerate in zip bag or covered container'
        },
        meats: ['flank steak', 'lamb leg', 'chicken thighs'],
        flavor_profile: ['garlic', 'rosemary', 'bay leaf', 'peppercorns']
      },
      'sauce': {
        name: 'Sauce Component',
        method: 'reduce with other ingredients',
        applications: {
          'reduction': 'reduce with stock and aromatics',
          'agrodolce': 'sweet and sour Italian sauce',
          'pan_sauce': 'deglaze pan after cooking proteins'
        },
        reduction_ratio: 'reduce by 1/2 to 2/3 volume',
        pairings: ['shallots', 'beef stock', 'butter', 'herbs']
      }
    },
    storage: {
      container: 'glass bottle',
      duration: '2+ years',
      temperature: 'room temperature, away from direct light',
      notes: 'May develop sediment over time, not harmful'
    }
  }
  // Additional vinegars will be added here
};

// Fix the ingredient mappings to ensure they have all required properties
export const vinegars: Record<string, IngredientMapping> = fixIngredientMappings(rawVinegars); 