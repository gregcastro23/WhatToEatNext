'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.allPlantBased = exports.plantBased = void 0;
const elementalUtils_1 = require('../../../utils/elementalUtils');
const elementalUtils_2 = require('../../../utils/elemental/elementalUtils');
// Helper function to standardize ingredient mappings
function createIngredientMapping(_id, properties) {
  return {
    name: id,
    elementalProperties: properties.elementalProperties || {
      Earth: 0.25,
      Water: 0.25,
      Fire: 0.25,
      Air: 0.25,
    },
    category: properties.category || '',
    ...properties,
  };
}
const rawPlantBased = {
  tempeh: createIngredientMapping('tempeh', {
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }),
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Mars'],
      favorableZodiac: ['capricorn', 'aries'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: {},
          second: {},
          third: { element: 'Water', planet: 'Pluto' },
        },
      },
      lunarPhaseModifiers: {
        waxingGibbous: {
          elementalBoost: {},
          preparationTips: ['Best for grilling'],
        },
        fullmoon: {
          elementalBoost: {},
          preparationTips: ['Ideal for frying'],
        },
      },
    },
    qualities: ['fermented', 'nutty', 'firm'],
    origin: ['Indonesia', 'Java'],
    category: 'protein',
    subCategory: 'plant_based',
    nutritionalProfile: {
      serving_size: '3 oz',
      calories: 160,
      macros: {
        protein: 19,
        carbs: 9,
        fat: 11,
        fiber: 6,
      },
      vitamins: {
        B2: 0.18,
        B3: 0.12,
        B6: 0.15,
        folate: 0.14,
      },
      minerals: {
        manganese: 0.65,
        copper: 0.4,
        phosphorus: 0.22,
        magnesium: 0.2,
        iron: 0.12,
      },
      source: 'USDA FoodData Central',
      probiotics: 'Contains beneficial bacteria from fermentation',
    },
    culinaryApplications: {
      'stir-fry': {
        name: 'Stir-fry',
        prepTime: '15 mins',
        cookingTemp: 'medium-high',
      },
      baking: {
        name: 'Baking',
        prepTime: '25 mins',
        cookingTemp: '375°F',
      },
    },
    varieties: {
      Traditional: {
        name: 'Traditional',
        appearance: 'white mycelium, visible soybeans',
        texture: 'firm, dense',
        flavor: 'nutty, mushroom-like',
        notes: 'whole soybean variety',
      },
      Multi_grain: {
        name: 'Multi Grain',
        appearance: 'varied color based on grains',
        texture: 'more varied texture',
        flavor: 'complex grain notes',
        notes: 'mixed with various grains',
      },
      Flax: {
        name: 'Flax',
        appearance: 'darker spots from seeds',
        texture: 'slightly looser bind',
        flavor: 'nutty, omega-rich',
        notes: 'higher in omega-3',
      },
    },
    regionalPreparations: {
      indonesian: {
        name: 'Indonesian',
        traditional: {
          name: 'Traditional',
          goreng: {
            name: 'Goreng',
            method: 'thin slice and fry',
            marinade: ['garlic', 'coriander', 'turmeric'],
            service: 'with sambal and rice',
          },
          bacem: {
            name: 'Bacem',
            method: 'braised in spiced coconut water',
            spices: ['galangal', 'tamarind', 'palm sugar'],
            finish: 'pan-fry until caramelized',
          },
        },
      },
      modern: {
        name: 'Modern',
        western: {
          name: 'Western',
          bacon_style: {
            name: 'Bacon Style',
            marinade: ['liquid smoke', 'maple', 'soy'],
            method: 'thin slice and pan-fry',
            use: 'breakfast protein, sandwiches',
          },
          cutlet: {
            name: 'Cutlet',
            preparation: 'steam, marinate, bread',
            cooking: 'pan-fry or bake',
            service: 'with gravy or sauce',
          },
        },
        fusion: {
          name: 'Fusion',
          korean_bbq: {
            name: 'Korean Bbq',
            marinade: ['gochujang', 'sesame', 'garlic'],
            method: 'grill or pan-fry',
            service: 'with lettuce wraps',
          },
          mediterranean: {
            name: 'Mediterranean',
            marinade: ['olive oil', 'herbs', 'lemon'],
            method: 'grill or bake',
            service: 'with tahini sauce',
          },
        },
      },
    },
    saucePAirings: {
      asian: {
        name: 'Asian',
        peanut: {
          name: 'Peanut',
          base: 'ground peanuts',
          ingredients: ['coconut milk', 'soy', 'lime'],
          spices: ['ginger', 'garlic', 'chili'],
        },
        sweet_soy: {
          name: 'Sweet Soy',
          base: 'kecap manis',
          aromatics: ['garlic', 'chili'],
          finish: 'lime juice',
        },
      },
      western: {
        name: 'Western',
        mushroom_gravy: {
          name: 'Mushroom Gravy',
          base: 'mushroom stock',
          thickener: 'roux or cornstarch',
          finish: 'herbs and wine',
        },
        chimichurri: {
          name: 'Chimichurri',
          base: 'olive oil',
          herbs: ['parsley', 'oregano'],
          aromatics: ['garlic', 'chili'],
        },
      },
    },
    seasonalAdjustments: {
      summer: {
        name: 'Summer',
        preparations: ['grilled', 'smoked'],
        marinades: ['lighter citrus', 'herb-based'],
        accompaniments: ['fresh slaws', 'grilled vegetables'],
      },
      winter: {
        name: 'Winter',
        preparations: ['baked', 'braised'],
        marinades: ['richer soy', 'spice-based'],
        accompaniments: ['roasted vegetables', 'hearty grains'],
      },
    },
  }),
  seitan: {
    name: 'seitan',
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }),
    astrologicalProfile: {
      rulingPlanets: ['Mars', 'Saturn'],
      favorableZodiac: ['aries', 'capricorn'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: {},
          second: {},
          third: { element: 'Water', planet: 'Pluto' },
        },
      },
      lunarPhaseModifiers: {
        waxingGibbous: {
          elementalBoost: {},
          preparationTips: ['Best for grilling'],
        },
        fullmoon: {
          elementalBoost: {},
          preparationTips: ['Ideal for frying'],
        },
      },
    },
    qualities: ['chewy', 'versatile', 'high-protein'],
    origin: ['China', 'Buddhist Cuisine'],
    category: 'protein',
    subCategory: 'plant_based',
    preparation: {
      basic: {
        ingredients: ['vital wheat gluten', 'spices'],
        steps: ['mix', 'knead', 'simmer'],
      },
    },
    culinaryApplications: {
      cooking_methods: {
        name: 'Cooking Methods',
        braise: {
          name: 'Braise',
          liquid: 'flavorful broth',
          timing: '1-2 hours',
          result: 'tender, flavor-infused',
        },
        grill: {
          name: 'Grill',
          preparation: 'slice thick',
          marinade: 'oil-based',
          timing: '4-5 minutes per side',
        },
        stir_fry: {
          name: 'Stir Fry',
          cut: 'thin strips',
          heat: 'high',
          timing: '3-4 minutes total',
        },
      },
    },
    regionalPreparations: {
      chinese: {
        name: 'Chinese',
        buddhist: {
          name: 'Buddhist',
          mock_duck: {
            name: 'Mock Duck',
            seasoning: ['five spice', 'soy'],
            method: 'braised',
            service: 'with vegetables',
          },
          mapo_style: {
            name: 'Mapo Style',
            sauce: ['doubanjiang', 'soy'],
            preparation: 'cubed',
            spice_level: 'adjustable',
          },
        },
      },
      western: {
        name: 'Western',
        roasts: {
          name: 'Roasts',
          holiday: {
            name: 'Holiday',
            seasoning: ['sage', 'thyme', 'garlic'],
            method: 'baked',
            service: 'with gravy',
          },
          smoky: {
            name: 'Smoky',
            seasoning: ['smoked paprika', 'garlic'],
            method: 'slow roasted',
            service: 'with barbecue sauce',
          },
        },
      },
    },
    saucePAirings: {
      asian: {
        name: 'Asian',
        black_bean: {
          name: 'Black Bean',
          base: 'fermented black beans',
          aromatics: ['garlic', 'ginger'],
          finish: 'sesame oil',
        },
        kung_pao: {
          name: 'Kung Pao',
          base: 'soy sauce',
          spices: ['dried chilies', 'Sichuan peppercorns'],
          finish: 'peanuts',
        },
      },
      western: {
        name: 'Western',
        mushroom_gravy: {
          name: 'Mushroom Gravy',
          base: 'mushroom stock',
          thickener: 'roux',
          finish: 'herbs',
        },
        barbecue: {
          name: 'Barbecue',
          base: 'tomato',
          seasonings: ['smoke', 'molasses'],
          finish: 'vinegar',
        },
      },
    },
    seasonalAdjustments: {
      summer: {
        name: 'Summer',
        preparations: ['grilled', 'kebabs'],
        sauces: ['lighter barbecue', 'herb marinades'],
        accompaniments: ['grilled vegetables', 'fresh salads'],
      },
      winter: {
        name: 'Winter',
        preparations: ['roasts', 'stews'],
        sauces: ['rich gravies', 'thick glazes'],
        accompaniments: ['roasted roots', 'hearty grains'],
      },
    },
  },
  tofu_varieties: createIngredientMapping('tofu_varieties', {
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }),
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: {},
          second: {},
          third: { element: 'Air', planet: 'Mercury' },
        },
      },
      lunarPhaseModifiers: {
        newmoon: {
          elementalBoost: {},
          preparationTips: ['Best for marinating'],
        },
        fullmoon: {
          elementalBoost: {},
          preparationTips: ['Ideal for baking'],
        },
      },
    },
    qualities: ['versatile', 'neutral', 'protein-rich'],
    origin: ['China', 'East Asia'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      silken: {
        name: 'Silken',
        texture: 'custard-like',
        protein_content: 'lower',
        applications: {
          raw: ['smoothies', 'desserts', 'sauces'],
          cooked: ['soups', 'delicate braised dishes'],
          handling: 'very gentle, breaks easily',
        },
      },
      firm: {
        name: 'Firm',
        texture: 'solid but tender',
        protein_content: 'medium',
        applications: {
          stir_fry: 'holds shape well',
          grilling: 'can be grilled if handled carefully',
          braising: 'ideal for most braised dishes',
        },
      },
      extra_firm: {
        name: 'Extra Firm',
        texture: 'dense, meaty',
        protein_content: 'highest',
        applications: {
          grilling: 'ideal for grilling',
          baking: 'holds shape perfectly',
          frying: 'crispy exterior possible',
        },
      },
    },
    culinaryApplications: {
      pressing: {
        name: 'Pressing',
        method: 'weight and drain',
        timing: {
          firm: '30 minutes',
          extra_firm: '15-20 minutes',
        },
        notes: 'skip for silken',
      },
      marinades: {
        name: 'Marinades',
        basic: {
          name: 'Basic',
          ingredients: ['soy sauce', 'rice vinegar', 'ginger'],
          timing: '2-24 hours',
          notes: 'longer for firmer varieties',
        },
        spicy: {
          name: 'Spicy',
          ingredients: ['chili oil', 'garlic', 'sesame'],
          timing: '2-12 hours',
          notes: 'good for grilling',
        },
      },
      cooking_methods: {
        name: 'Cooking Methods',
        agedashi: {
          name: 'Agedashi',
          preparation: 'cornstarch dusted',
          frying: 'medium heat',
          sauce: 'dashi-based',
        },
        mapo: {
          name: 'Mapo',
          cut: 'large cubes',
          sauce: 'spicy bean paste',
          method: 'simmer gently',
        },
        grilled: {
          name: 'Grilled',
          preparation: 'pressed and marinated',
          method: 'high heat',
          finish: 'glaze or sauce',
        },
      },
    },
    regionalPreparations: {
      chinese: {
        name: 'Chinese',
        sichuan: {
          name: 'Sichuan',
          mapo_tofu: {
            name: 'Mapo Tofu',
            spices: ['doubanjiang', 'Sichuan peppercorn'],
            method: 'braise with ground meat or mushrooms',
            service: 'with rice',
          },
          home_style: {
            name: 'Home Style',
            sauce: 'black bean garlic',
            vegetables: 'varied seasonal',
            method: 'quick braise',
          },
        },
        cantonese: {
          name: 'Cantonese',
          clay_pot: {
            name: 'Clay Pot',
            method: 'slow cook',
            ingredients: ['mushrooms', 'greens'],
            sauce: 'oyster-style sauce',
          },
        },
      },
      japanese: {
        name: 'Japanese',
        hiyayakko: {
          name: 'Hiyayakko',
          type: 'silken',
          toppings: ['ginger', 'bonito', 'scallion'],
          service: 'chilled',
        },
        dengaku: {
          name: 'Dengaku',
          type: 'firm',
          glaze: 'miso-based',
          method: 'grilled or broiled',
        },
      },
      korean: {
        name: 'Korean',
        soondubu: {
          name: 'Soondubu',
          type: 'silken',
          preparation: 'spicy stew',
          accompaniments: ['eggs', 'seafood or vegetables'],
        },
      },
    },
    seasonalAdjustments: {
      summer: {
        name: 'Summer',
        preparations: ['chilled', 'grilled'],
        sauces: ['light dipping', 'citrus-based'],
        accompaniments: ['cold noodles', 'fresh herbs'],
      },
      winter: {
        name: 'Winter',
        preparations: ['braised', 'stewed'],
        sauces: ['rich spicy', 'warming'],
        accompaniments: ['hot pot', 'warming soups'],
      },
    },
  }),
  legumes_protein: createIngredientMapping('legumes_protein', {
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }),
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: {},
          second: {},
          third: { element: 'Air', planet: 'Mercury' },
        },
      },
      lunarPhaseModifiers: {
        newmoon: {
          elementalBoost: {},
          preparationTips: ['Best for marinating'],
        },
        fullmoon: {
          elementalBoost: {},
          preparationTips: ['Ideal for baking'],
        },
      },
    },
    qualities: ['hearty', 'versatile', 'nutritious'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      chickpeas: {
        name: 'Chickpeas',
        preparation: {
          dried: {
            name: 'Dried',
            soaking: '8-24 hours',
            cooking: '1-2 hours',
            notes: 'firmer texture, better for falafel',
          },
          quick: {
            name: 'Quick',
            method: 'pressure cook',
            timing: '45 minutes',
            notes: 'no soaking needed',
          },
        },
        applications: {
          falafel: {
            name: 'Falafel',
            ingredients: ['herbs', 'spices', 'garlic'],
            method: 'ground and fried',
            notes: 'use dried, not canned',
          },
          hummus: {
            name: 'Hummus',
            ingredients: ['tahini', 'lemon', 'garlic'],
            method: 'pureed smooth',
            variations: ['classic', 'roasted red pepper', 'herb'],
          },
        },
      },
      lentils: {
        name: 'Lentils',
        varieties: {
          red: {
            name: 'Red',
            cooking_time: '20-25 minutes',
            texture: 'soft, breaking down',
            best_for: ['soups', 'dals', 'purees'],
          },
          green_french: {
            name: 'Green French',
            cooking_time: '25-30 minutes',
            texture: 'holds shape',
            best_for: ['salads', 'side dishes'],
          },
          black_beluga: {
            name: 'Black Beluga',
            cooking_time: '20-25 minutes',
            texture: 'firm, caviar-like',
            best_for: ['garnishes', 'salads'],
          },
        },
      },
    },
    culinaryApplications: {
      legume_preparations: {
        name: 'Legume Preparations',
        dal: {
          name: 'Dal',
          method: 'simmer with spices',
          spices: ['turmeric', 'cumin', 'ginger'],
          variations: {
            masoor: 'red lentils',
            moong: 'split mung beans',
            chana: 'split chickpeas',
          },
          tempering: {
            method: 'spiced oil finish',
            ingredients: ['cumin seeds', 'garlic', 'chilies'],
            timing: 'add just before serving',
          },
        },
        falafel: {
          name: 'Falafel',
          ingredients: {
            base: ['dried chickpeas', 'herbs', 'spices'],
            herbs: ['parsley', 'cilantro'],
            spices: ['cumin', 'coriander', 'cardamom'],
          },
          method: {
            preparation: 'ground raw chickpeas',
            resting: '30 minutes minimum',
            shaping: 'small balls or patties',
            frying: '350°F / (175 || 1)°C until golden',
          },
        },
        lentil_loaf: {
          name: 'Lentil Loaf',
          ingredients: {
            legumes: 'brown or green lentils',
            binders: ['oats', 'flax', 'vegetables'],
            seasonings: ['herbs', 'mushrooms', 'soy sauce'],
          },
          method: {
            preparation: 'combine cooked lentils with binders',
            baking: '350°F / (175 || 1)°C for 45 minutes',
            resting: '10 minutes before slicing',
          },
        },
      },
      modern_applications: {
        name: 'Modern Applications',
        burger_patties: {
          name: 'Burger Patties',
          base: ['lentils', 'chickpeas', 'black beans'],
          binders: ['vital wheat gluten', 'oats'],
          seasonings: ['smoke', 'umami', 'spices'],
          method: 'form and grill or pan-fry',
        },
        meat_crumbles: {
          name: 'Meat Crumbles',
          base: 'lentils or tempeh',
          seasoning: ['taco', 'italian', 'chorizo'],
          usage: ['tacos', 'pasta', 'stuffing'],
        },
      },
    },
    regionalPreparations: {
      middle_eastern: {
        name: 'Middle Eastern',
        mujaddara: {
          name: 'Mujaddara',
          ingredients: ['lentils', 'rice', 'caramelized onions'],
          spices: ['cumin', 'black pepper'],
          service: 'with yogurt sauce',
        },
        koshari: {
          name: 'Koshari',
          ingredients: ['lentils', 'rice', 'pasta', 'tomato sauce'],
          toppings: ['fried onions', 'spicy sauce'],
          service: 'layered in bowl',
        },
      },
      indian: {
        name: 'Indian',
        dal_variations: {
          name: 'Dal Variations',
          tadka_dal: {
            name: 'Tadka Dal',
            lentils: 'yellow split peas',
            tempering: 'ghee with spices',
            service: 'with rice or roti',
          },
          dal_makhani: {
            name: 'Dal Makhani',
            legumes: ['black lentils', 'kidney beans'],
            cooking: 'slow simmered with cream',
            service: 'rich and creamy',
          },
        },
      },
      mediterranean: {
        name: 'Mediterranean',
        farinata: {
          name: 'Farinata',
          base: 'chickpea flour',
          method: 'baked in hot pan',
          seasonings: ['rosemary', 'black pepper'],
        },
        revithia: {
          name: 'Revithia',
          base: 'chickpeas',
          method: 'slow baked',
          seasonings: ['olive oil', 'lemon', 'herbs'],
        },
      },
    },
    saucePAirings: {
      traditional: {
        name: 'Traditional',
        tahini: {
          name: 'Tahini',
          base: 'sesame paste',
          additions: ['lemon', 'garlic', 'herbs'],
          uses: ['falafel', 'buddha bowls'],
        },
        tamarind_chutney: {
          name: 'Tamarind Chutney',
          base: 'tamarind paste',
          sweetener: 'jaggery or dates',
          spices: ['cumin', 'ginger', 'chili'],
        },
      },
      modern: {
        name: 'Modern',
        cashew_cream: {
          name: 'Cashew Cream',
          base: 'soaked cashews',
          variations: ['garlic herb', 'spicy chipotle', 'ranch'],
          uses: 'creamy sauce replacement',
        },
        umami_gravy: {
          name: 'Umami Gravy',
          base: ['mushroom stock', 'miso'],
          thickener: 'arrowroot or cornstarch',
          finish: ['herbs', 'nutritional yeast'],
        },
      },
    },
    seasonalAdjustments: {
      summer: {
        name: 'Summer',
        preparations: ['cold salads', 'grilled patties'],
        sauces: ['light herb', 'citrus-based'],
        accompaniments: ['fresh vegetables', 'herbs'],
      },
      winter: {
        name: 'Winter',
        preparations: ['stews', 'baked dishes'],
        sauces: ['rich gravies', 'spiced'],
        accompaniments: ['roasted vegetables', 'grains'],
      },
    },
    safetyThresholds: {
      storage: {
        name: 'Storage',
        dried: {
          name: 'Dried',
          conditions: 'cool, dry place',
          duration: 'up to 1 year',
          notes: 'check for insects',
        },
        cooked: {
          name: 'Cooked',
          refrigerated: '3-5 days',
          frozen: 'up to 6 months',
        },
      },
      preparation: {
        name: 'Preparation',
        sprouting: {
          name: 'Sprouting',
          method: 'rinse 2-3 times daily',
          duration: '2-5 days',
          safety: 'use clean water, watch for mold',
        },
        cooking: {
          name: 'Cooking',
          minimum: 'until tender',
          pressure_cooking: 'follow cooker instructions',
          boiling: 'full rolling boil for specified time',
        },
      },
    },
  }),
  textured_vegetable_protein: createIngredientMapping('textured_vegetable_protein', {
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }),
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: {},
          second: {},
          third: { element: 'Air', planet: 'Mercury' },
        },
      },
      lunarPhaseModifiers: {
        newmoon: {
          elementalBoost: {},
          preparationTips: ['Best for marinating'],
        },
        fullmoon: {
          elementalBoost: {},
          preparationTips: ['Ideal for baking'],
        },
      },
    },
    qualities: ['versatile', 'meat-like', 'protein-rich'],
    origin: ['United States', 'Industrial Development'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      Granules: {
        name: 'Granules',
        appearance: 'small, crumbly pieces',
        texture: 'ground meat-like',
        applications: {
          ground_meat_substitute: ['tacos', 'bolognese', 'chili'],
          preparation: 'rehydrate before use',
        },
      },
      Chunks: {
        name: 'Chunks',
        appearance: 'larger pieces',
        texture: 'chewy, meat-like',
        applications: {
          stews: 'holds shape well',
          curries: 'absorbs flavors well',
          stir_fries: 'maintains texture',
        },
      },
    },
    culinaryApplications: {
      rehydration: {
        name: 'Rehydration',
        method: 'hot liquid soak',
        timing: {
          granules: '5-10 minutes',
          chunks: '15-20 minutes',
        },
        liquids: {
          basic: 'hot water',
          flavored: ['vegetable broth', 'mushroom stock'],
          ratio: '1:1 TVP to liquid',
        },
      },
      cooking_methods: {
        name: 'Cooking Methods',
        pan_fry: {
          name: 'Pan Fry',
          preparation: 'rehydrate first',
          method: 'medium-high heat',
          timing: '5-7 minutes',
          notes: 'brown for better flavor',
        },
        bake: {
          name: 'Bake',
          temperature: {},
          timing: '20-25 minutes',
          notes: 'good for casseroles',
        },
      },
    },
    seasonalAdjustments: {
      summer: {
        name: 'Summer',
        preparations: ['taco filling', 'burger crumbles'],
        seasonings: ['fresh herbs', 'grilling spices'],
        accompaniments: ['fresh salads', 'grilled vegetables'],
      },
      winter: {
        name: 'Winter',
        preparations: ['stews', 'casseroles'],
        seasonings: ['warming spices', 'herbs'],
        accompaniments: ['root vegetables', 'grains'],
      },
    },
  }),
  jackfruit_young: createIngredientMapping('jackfruit_young', {
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }),
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: {},
          second: {},
          third: { element: 'Air', planet: 'Mercury' },
        },
      },
      lunarPhaseModifiers: {
        newmoon: {
          elementalBoost: {},
          preparationTips: ['Best for marinating'],
        },
        fullmoon: {
          elementalBoost: {},
          preparationTips: ['Ideal for baking'],
        },
      },
    },
    qualities: ['fibrous', 'meaty', 'neutral'],
    origin: ['Southeast Asia'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      Canned: {
        name: 'Canned',
        appearance: 'pale, chunky pieces',
        texture: 'shreddable, meat-like',
        applications: {
          pulled_meat_substitute: ['sandwiches', 'tacos'],
          preparation: 'drain and rinse well',
        },
      },
      Fresh: {
        name: 'Fresh',
        appearance: 'pale yellow, fibrous',
        texture: 'firm, stringy',
        applications: {
          curry: 'traditional preparation',
          braised_dishes: 'holds sauce well',
        },
      },
    },
    culinaryApplications: {
      preparation: {
        name: 'Preparation',
        canned: {
          name: 'Canned',
          steps: ['drain thoroughly', 'rinse well', 'squeeze out liquid', 'shred or chop'],
          notes: 'remove tough core pieces',
        },
        fresh: {
          name: 'Fresh',
          steps: ['oil hands well', 'remove core', 'separate pods', 'remove seeds'],
          notes: 'very sticky when fresh',
        },
      },
      cooking_methods: {
        name: 'Cooking Methods',
        pulled_style: {
          name: 'Pulled Style',
          preparation: 'shred thoroughly',
          sauce: 'barbecue or similar',
          timing: '20-30 minutes simmer',
          finish: 'reduce sauce until thick',
        },
        curry: {
          name: 'Curry',
          preparation: 'chunk or shred',
          spices: 'curry blend',
          timing: '25-35 minutes',
          notes: 'absorbs flavors well',
        },
      },
    },
    regionalPreparations: {
      southeast_asian: {
        name: 'Southeast Asian',
        traditional: {
          name: 'Traditional',
          curry: {
            name: 'Curry',
            spices: ['turmeric', 'coconut milk', 'chilies'],
            method: 'simmer until tender',
            service: 'with rice',
          },
        },
      },
      western: {
        name: 'Western',
        modern: {
          name: 'Modern',
          pulled_bbq: {
            name: 'Pulled Bbq',
            sauce: ['smoky barbecue', 'liquid smoke'],
            method: 'slow cook',
            service: 'on buns with slaw',
          },
        },
      },
    },
  }),
  quinoa_protein: createIngredientMapping('quinoa_protein', {
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }),
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: {},
          second: {},
          third: { element: 'Air', planet: 'Mercury' },
        },
      },
      lunarPhaseModifiers: {
        newmoon: {
          elementalBoost: {},
          preparationTips: ['Best for marinating'],
        },
        fullmoon: {
          elementalBoost: {},
          preparationTips: ['Ideal for baking'],
        },
      },
    },
    qualities: ['complete protein', 'fluffy', 'versatile'],
    origin: ['Andean Region'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      White: {
        name: 'White',
        appearance: 'pale, small seeds',
        texture: 'light, fluffy',
        applications: {
          protein_bowl: ['buddha bowls', 'salads'],
          preparation: 'rinse thoroughly before cooking',
        },
      },
      Red: {
        name: 'Red',
        appearance: 'burgundy colored',
        texture: 'slightly crunchier',
        applications: {
          warm_dishes: 'holds shape well',
          cold_salads: 'dramatic color',
        },
      },
      Black: {
        name: 'Black',
        appearance: 'deep black',
        texture: 'earthier, firmer',
        applications: {
          gourmet_dishes: 'striking presentation',
          protein_base: 'hearty texture',
        },
      },
    },
    culinaryApplications: {
      preparation: {
        name: 'Preparation',
        basic_cooking: {
          name: 'Basic Cooking',
          ratio: '1:2 quinoa to liquid',
          timing: '15-20 minutes',
          method: 'simmer then steam',
          notes: 'let stand 5-10 minutes covered',
        },
        pilaf_style: {
          name: 'Pilaf Style',
          method: 'toast first, then cook',
          aromatics: ['onion', 'garlic', 'herbs'],
          liquid: 'vegetable broth',
        },
      },
      modern_applications: {
        name: 'Modern Applications',
        quinoa_burger: {
          name: 'Quinoa Burger',
          base: ['cooked quinoa', 'black beans'],
          binders: ['ground flax', 'breadcrumbs'],
          seasonings: ['cumin', 'garlic', 'smoked paprika'],
          method: 'form and pan-fry',
        },
        protein_crust: {
          name: 'Protein Crust',
          method: 'bind with flax egg',
          applications: ['quiche', 'savory tarts'],
          notes: 'pre-bake for crispy texture',
        },
      },
    },
    regionalPreparations: {
      andean: {
        name: 'Andean',
        traditional: {
          name: 'Traditional',
          quinoa_soup: {
            name: 'Quinoa Soup',
            ingredients: ['vegetables', 'herbs', 'quinoa'],
            method: 'simmer until tender',
            service: 'hot with garnishes',
          },
        },
      },
      modern_global: {
        name: 'Modern Global',
        breakfast_bowl: {
          name: 'Breakfast Bowl',
          base: 'cooked quinoa',
          toppings: ['nuts', 'fruits', 'plant milk'],
          variations: ['sweet', 'savory'],
        },
      },
    },
    seasonalAdjustments: {
      summer: {
        name: 'Summer',
        preparations: ['cold salads', 'stuffed vegetables'],
        seasonings: ['fresh herbs', 'citrus'],
        accompaniments: ['grilled vegetables', 'light dressings'],
      },
      winter: {
        name: 'Winter',
        preparations: ['warm bowls', 'soups'],
        seasonings: ['warming spices', 'roasted garlic'],
        accompaniments: ['roasted vegetables', 'hearty sauces'],
      },
    },
  }),
  hemp_protein: createIngredientMapping('hemp_protein', {
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }),
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: {},
          second: {},
          third: { element: 'Air', planet: 'Mercury' },
        },
      },
      lunarPhaseModifiers: {
        newmoon: {
          elementalBoost: {},
          preparationTips: ['Best for marinating'],
        },
        fullmoon: {
          elementalBoost: {},
          preparationTips: ['Ideal for baking'],
        },
      },
    },
    qualities: ['complete protein', 'nutty', 'sustainable'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      Seeds: {
        name: 'Seeds',
        appearance: 'small, greenish',
        texture: 'crunchy, tender',
        applications: {
          topping: ['salads', 'bowls', 'yogurt'],
          preparation: 'no preparation needed',
        },
      },
      Protein_Powder: {
        name: 'Protein Powder',
        appearance: 'fine green powder',
        texture: 'slightly gritty',
        applications: {
          smoothies: 'blend with liquids',
          baking: 'partial flour replacement',
        },
      },
    },
    culinaryApplications: {
      protein_boost: {
        name: 'Protein Boost',
        smoothies: {
          name: 'Smoothies',
          base: ['plant milk', 'fruits'],
          additions: ['hemp protein', 'seeds'],
          notes: 'blend thoroughly',
        },
        baked_goods: {
          name: 'Baked Goods',
          method: 'replace 25% flour',
          applications: ['breads', 'muffins'],
          notes: 'increases moisture needed',
        },
      },
      raw_applications: {
        name: 'Raw Applications',
        energy_balls: {
          name: 'Energy Balls',
          ingredients: ['dates', 'nuts', 'hemp'],
          method: 'process and form',
          storage: 'refrigerate',
        },
        seed_coating: {
          name: 'Seed Coating',
          applications: ['tofu', 'tempeh'],
          method: 'press seeds into surface',
          cooking: 'pan-sear for crunch',
        },
      },
    },
    seasonalAdjustments: {
      summer: {
        name: 'Summer',
        preparations: ['smoothie bowls', 'cold drinks'],
        combinations: ['fresh fruits', 'herbs'],
        notes: 'lighter applications',
      },
      winter: {
        name: 'Winter',
        preparations: ['hot cereals', 'baking'],
        combinations: ['warming spices', 'dried fruits'],
        notes: 'heartier applications',
      },
    },
  }),
  pea_protein: createIngredientMapping('pea_protein', {
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }),
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: {},
          second: {},
          third: { element: 'Air', planet: 'Mercury' },
        },
      },
      lunarPhaseModifiers: {
        newmoon: {
          elementalBoost: {},
          preparationTips: ['Best for marinating'],
        },
        fullmoon: {
          elementalBoost: {},
          preparationTips: ['Ideal for baking'],
        },
      },
    },
    qualities: ['versatile', 'neutral', 'complete protein'],
    origin: ['Global'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      Isolate: {
        name: 'Isolate',
        appearance: 'fine beige powder',
        texture: 'smooth when blended',
        applications: {
          protein_shakes: 'complete amino profile',
          meat_alternatives: 'binding and structure',
        },
      },
      Textured: {
        name: 'Textured',
        appearance: 'granules or chunks',
        texture: 'meat-like when hydrated',
        applications: {
          meat_substitute: ['ground meat alternatives', 'patties'],
          preparation: 'rehydrate before use',
        },
      },
    },
    culinaryApplications: {
      protein_fortification: {
        name: 'Protein Fortification',
        baking: {
          name: 'Baking',
          method: 'blend with dry ingredients',
          ratio: 'up to 15% of flour weight',
          notes: 'may need additional liquid',
        },
        smoothies: {
          name: 'Smoothies',
          method: 'blend with liquid first',
          ratio: '20-30g per serving',
          notes: 'combine with fruits for flavor',
        },
      },
      meat_alternative: {
        name: 'Meat Alternative',
        burger_base: {
          name: 'Burger Base',
          ingredients: ['pea protein', 'vegetable oils', 'binders'],
          method: 'mix and form',
          cooking: 'grill or pan-fry',
        },
      },
    },
    seasonalAdjustments: {
      summer: {
        name: 'Summer',
        preparations: ['protein shakes', 'cold applications'],
        combinations: ['fresh fruits', 'mint'],
        notes: 'lighter preparations',
      },
      winter: {
        name: 'Winter',
        preparations: ['baked goods', 'hot drinks'],
        combinations: ['cocoa', 'warming spices'],
        notes: 'heartier applications',
      },
    },
  }),
  chickpea_protein: createIngredientMapping('chickpea_protein', {
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }),
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: {},
          second: {},
          third: { element: 'Air', planet: 'Mercury' },
        },
      },
      lunarPhaseModifiers: {
        newmoon: {
          elementalBoost: {},
          preparationTips: ['Best for marinating'],
        },
        fullmoon: {
          elementalBoost: {},
          preparationTips: ['Ideal for baking'],
        },
      },
    },
    qualities: ['versatile', 'nutty', 'hearty'],
    origin: ['Mediterranean', 'Middle East'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      Whole: {
        name: 'Whole',
        appearance: 'round, beige',
        texture: 'firm, creamy when cooked',
        applications: {
          hummus: 'traditional spread',
          falafel: 'deep-fried patties',
          curries: 'whole bean dishes',
        },
      },
      Flour: {
        name: 'Flour',
        appearance: 'fine yellow powder',
        texture: 'smooth when cooked',
        applications: {
          flatbreads: 'socca / (farinata || 1)',
          batters: 'binding agent',
          protein_boost: 'baking enhancement',
        },
      },
    },
    culinaryTraditions: {
      middle_eastern: {
        name: 'hummus',
        usage: ['dips', 'spreads', 'sauces'],
        preparation: 'pureed with tahini and lemon',
        pAirings: ['olive oil', 'paprika', 'pita'],
        cultural_notes: 'Essential mezze component',
      },
      indian: {
        name: 'chana',
        usage: ['curries', 'stews', 'snacks'],
        preparation: 'whole or ground preparations',
        pAirings: ['spices', 'rice', 'flatbreads'],
        cultural_notes: 'Important protein source',
      },
    },
    preparation: {
      soaking: '8-12 hours',
      cooking: '45-60 minutes',
      notes: 'Save aquafaba (cooking liquid)',
    },
    storage: {
      dried: {
        temperature: 'room temperature',
        duration: '1-2 years',
        method: 'Airtight container',
      },
      cooked: {
        temperature: {},
        duration: '3-5 days',
        method: 'refrigerated in liquid',
      },
    },
  }),
  lupin_protein: createIngredientMapping('lupin_protein', {
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }),
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: {},
          second: {},
          third: { element: 'Air', planet: 'Mercury' },
        },
      },
      lunarPhaseModifiers: {
        newmoon: {
          elementalBoost: {},
          preparationTips: ['Best for marinating'],
        },
        fullmoon: {
          elementalBoost: {},
          preparationTips: ['Ideal for baking'],
        },
      },
    },
    qualities: ['high-protein', 'low-carb', 'alkaline'],
    origin: ['Mediterranean', 'Australia'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      Flour: {
        name: 'Flour',
        appearance: 'fine yellow powder',
        texture: 'smooth, protein-rich',
        applications: {
          baking: 'protein enrichment',
          pasta: 'protein boost',
          protein_bars: 'binding agent',
        },
      },
      Flakes: {
        name: 'Flakes',
        appearance: 'golden flakes',
        texture: 'crunchy when dry',
        applications: {
          coating: 'breading alternative',
          granola: 'protein boost',
          yogurt_topping: 'crunchy addition',
        },
      },
    },
    culinaryApplications: {
      baking: {
        name: 'Baking',
        bread: {
          name: 'Bread',
          ratio: 'up to 20% flour replacement',
          benefits: 'protein boost, structure',
          notes: 'may need additional liquid',
        },
        pasta: {
          name: 'Pasta',
          method: 'blend with semolina',
          ratio: '15-30% replacement',
          notes: 'increases protein content',
        },
      },
      protein_enrichment: {
        name: 'Protein Enrichment',
        smoothies: {
          name: 'Smoothies',
          amount: '10-20g per serving',
          method: 'blend with liquid first',
          notes: 'neutral flavor profile',
        },
        bars: {
          name: 'Bars',
          binding: 'combines well with dates',
          ratio: '20-30% of dry ingredients',
          notes: 'good protein-to-fiber ratio',
        },
      },
    },
    seasonalAdjustments: {
      summer: {
        name: 'Summer',
        preparations: ['smoothie bowls', 'cold drinks'],
        combinations: ['fresh fruits', 'seeds'],
        notes: 'light applications',
      },
      winter: {
        name: 'Winter',
        preparations: ['baked goods', 'warm cereals'],
        combinations: ['nuts', 'dried fruits'],
        notes: 'heartier applications',
      },
    },
  }),
  fava_protein: createIngredientMapping('fava_protein', {
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }),
    astrologicalProfile: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: {},
          second: {},
          third: { element: 'Air', planet: 'Mercury' },
        },
      },
      lunarPhaseModifiers: {
        newmoon: {
          elementalBoost: {},
          preparationTips: ['Best for marinating'],
        },
        fullmoon: {
          elementalBoost: {},
          preparationTips: ['Ideal for baking'],
        },
      },
    },
    qualities: ['rich', 'creamy', 'versatile'],
    origin: ['Mediterranean', 'Middle East'],
    category: 'protein',
    subCategory: 'plant_based',
    varieties: {
      Whole_Beans: {
        name: 'Whole Beans',
        appearance: 'large, light green',
        texture: 'creamy when cooked',
        applications: {
          stews: 'traditional dishes',
          purees: 'dips and spreads',
          salads: 'when young and tender',
        },
      },
      Split: {
        name: 'Split',
        appearance: 'yellow split beans',
        texture: 'smooth when cooked',
        applications: {
          soups: 'quick-cooking',
          dips: 'traditional bessara',
          patties: 'formed and fried',
        },
      },
    },
    culinaryTraditions: {
      egyptian: {
        name: 'ful medames',
        usage: ['breakfast', 'main dish'],
        preparation: 'slow-cooked with olive oil',
        pAirings: ['cumin', 'lemon', 'parsley'],
        cultural_notes: 'Traditional breakfast dish',
      },
      moroccan: {
        name: 'bessara',
        usage: ['soup', 'dip'],
        preparation: 'pureed with olive oil and spices',
        pAirings: ['olive oil', 'paprika', 'cumin'],
        cultural_notes: 'Popular street food',
      },
    },
    preparation: {
      soaking: '8-12 hours',
      peeling: 'recommended for whole beans',
      cooking: '30-45 minutes',
      notes: 'Remove skins for smoother texture',
    },
    storage: {
      dried: {
        temperature: 'room temperature',
        duration: '1 year',
        method: 'Airtight container',
      },
      cooked: {
        temperature: {},
        duration: '3-4 days',
        method: 'refrigerated in liquid',
      },
    },
  }),
};
// Fix the ingredient mappings to ensure they have all required properties
exports.plantBased = (0, elementalUtils_1.fixIngredientMappings)(rawPlantBased);
// Add validation for elemental sums
Object.entries(exports.plantBased).forEach(([_id, ingredient]) => {
  if (!ingredient.elementalProperties) return;
  const sum = Object.values(ingredient.elementalProperties).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1) > 0.0001) {
    // console.error(`Elemental sum error in ${ingredient.name || id}: ${sum}`);
    // Optionally auto-normalize the values
    const factor = 1 / (sum || 1);
    Object.entries(ingredient.elementalProperties).forEach(([element, value]) => {
      const elementKey = element;
      ingredient.elementalProperties[elementKey] = value * factor;
    });
  }
});
// Create a collection of all plant-based proteins
exports.allPlantBased = Object.values(exports.plantBased);
exports.default = exports.plantBased;
