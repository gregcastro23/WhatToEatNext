'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.limaBeans =
  exports.edamame =
  exports.snowPeas =
  exports.snapPeas =
  exports.greenBeans =
  exports.legumes =
    void 0;
const elementalUtils_1 = require('../../../utils/elementalUtils');
const elementalUtils_2 = require('../../../utils/elemental/elementalUtils');
const rawLegumes = {
  'green beans': {
    name: 'Green beans',
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Earth: 0.4,
      Air: 0.3,
      Water: 0.2,
      Fire: 0.1,
    }),
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Mercury'],
      favorableZodiac: ['taurus', 'virgo'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Venus' },
          second: { element: 'Earth', planet: 'Mercury' },
          third: { element: 'Air', planet: 'Saturn' },
        },
      },
      lunarPhaseModifiers: {
        newmoon: {
          elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Air: 0.2, Earth: 0.1 }),
          preparationTips: ['Quick blanching', 'Fresh preparations'],
        },
        fullmoon: {
          elementalBoost: (0, elementalUtils_2.createElementalProperties)({
            Water: 0.2,
            Earth: 0.1,
          }),
          preparationTips: ['Slower cooking methods', 'Fermentation'],
        },
      },
    },
    qualities: ['nourishing', 'balancing', 'versatile'],
    season: ['summer', 'early fall'],
    category: 'vegetable',
    subCategory: 'legume',
    affinities: ['garlic', 'almonds', 'lemon', 'butter', 'bacon', 'tomatoes', 'mushrooms'],
    cookingMethods: ['steamed', 'sautéed', 'blanched', 'roasted', 'stir-fried', 'braised'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['k', 'c', 'a', 'folate', 'b6'],
      minerals: ['iron', 'calcium', 'potassium', 'manganese'],
      calories: 31,
      protein_g: 1.8,
      fiber_g: 2.7,
      carbs_g: 7,
      antioxidants: ['flavonoids', 'carotenoids'],
    },
    preparation: {
      washing: true,
      trimming: 'remove stem ends',
      cutting: 'trim into uniform lengths',
      blanching: '2-3 minutes for bright color and crisp texture',
      notes: 'Can be prepared ahead and refrigerated',
    },
    varieties: {
      'haricot vert': {
        characteristics: 'thin, French-style bean',
        texture: 'tender, delicate',
        cooking: 'quick cooking, less than standard green beans',
        uses: 'elegant dishes, quick sautés',
      },
      romano: {
        characteristics: 'flat, wide beans',
        texture: 'meaty, substantial',
        cooking: 'longer cooking time than standard varieties',
        uses: 'braising, stews, substantial side dishes',
      },
      'yellow wax': {
        characteristics: 'golden yellow color',
        texture: 'crisp, similar to green beans',
        cooking: 'same methods as green beans',
        uses: 'visual contrast, all standard green bean preparations',
      },
      purple: {
        characteristics: 'deep purple color that turns green when cooked',
        texture: 'similar to standard green beans',
        cooking: 'best used raw or lightly cooked to preserve color',
        uses: 'raw applications, light steaming, blanching',
      },
    },
    storage: {
      temperature: 'refrigerated',
      duration: '5-7 days',
      humidity: 'high',
      method: 'paper towel in plastic bag',
      notes: 'Do not wash until ready to use',
    },
  },
  'snap peas': {
    name: 'Snap peas',
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Water: 0.4,
      Earth: 0.3,
      Air: 0.2,
      Fire: 0.1,
    }),
    astrologicalProfile: {
      rulingPlanets: ['Venus', 'Moon'],
      favorableZodiac: ['taurus', 'cancer'],
      elementalAffinity: {
        base: 'Water',
        decanModifiers: {
          first: { element: 'Water', planet: 'Moon' },
          second: { element: 'Water', planet: 'Venus' },
          third: { element: 'Earth', planet: 'Mercury' },
        },
      },
      lunarPhaseModifiers: {
        newmoon: {
          elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Water: 0.2, Air: 0.1 }),
          preparationTips: ['Fresh eating', 'Light preparations'],
        },
        fullmoon: {
          elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Water: 0.3 }),
          preparationTips: ['Enhanced sweetness', 'Perfect for harvesting'],
        },
      },
    },
    qualities: ['sweet', 'refreshing', 'crisp', 'delicate'],
    season: ['spring', 'early summer'],
    category: 'vegetable',
    subCategory: 'legume',
    affinities: ['mint', 'butter', 'sesame', 'ginger', 'garlic', 'lemon'],
    cookingMethods: ['raw', 'steamed', 'stir-fried', 'blanched', 'sautéed'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'k', 'a', 'folate'],
      minerals: ['iron', 'potassium', 'magnesium'],
      calories: 42,
      protein_g: 2.8,
      fiber_g: 2.6,
      carbs_g: 7.5,
    },
    preparation: {
      washing: true,
      trimming: 'remove stem end and string if tough',
      notes: 'Best used fresh, can be eaten whole with pod',
    },
    storage: {
      temperature: 'refrigerated',
      duration: '3-5 days',
      humidity: 'high',
      method: 'paper towel in plastic bag',
      notes: 'Consume quickly for best flavor and texture',
    },
  },
  'snow peas': {
    name: 'Snow peas',
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Air: 0.4,
      Water: 0.3,
      Earth: 0.2,
      Fire: 0.1,
    }),
    astrologicalProfile: {
      rulingPlanets: ['Mercury', 'Moon'],
      favorableZodiac: ['gemini', 'cancer'],
      elementalAffinity: {
        base: 'Air',
        secondary: 'Water',
        decanModifiers: {
          first: { element: 'Air', planet: 'Mercury' },
          second: { element: 'Water', planet: 'Moon' },
          third: { element: 'Earth', planet: 'Venus' },
        },
      },
      lunarPhaseModifiers: {
        newmoon: {
          elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Air: 0.2 }),
          preparationTips: ['Fresh preparations', 'Quick cooking methods'],
        },
        fullmoon: {
          elementalBoost: (0, elementalUtils_2.createElementalProperties)({ Water: 0.2, Air: 0.1 }),
          preparationTips: ['Enhanced crispness', 'Perfect harvest time'],
        },
      },
    },
    qualities: ['light', 'crisp', 'refreshing', 'delicate'],
    season: ['spring', 'early summer'],
    category: 'vegetable',
    subCategory: 'legume',
    affinities: ['ginger', 'sesame', 'soy sauce', 'garlic', 'mint', 'lemon'],
    cookingMethods: ['stir-fried', 'raw', 'blanched', 'steamed', 'sautéed'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['c', 'k', 'a', 'folate', 'b1'],
      minerals: ['iron', 'potassium', 'manganese'],
      calories: 42,
      protein_g: 2.8,
      fiber_g: 2.6,
      carbs_g: 7.5,
    },
    preparation: {
      washing: true,
      trimming: 'remove stem end and string along the seam',
      notes: 'Flat pods with visible peas inside',
    },
    storage: {
      temperature: 'refrigerated',
      duration: '2-3 days',
      humidity: 'high',
      method: 'paper towel in plastic bag',
      notes: 'Very perishable, use quickly',
    },
  },
  edamame: {
    name: 'Edamame',
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Earth: 0.5,
      Water: 0.2,
      Fire: 0.2,
      Air: 0.1,
    }),
    astrologicalProfile: {
      rulingPlanets: ['Jupiter', 'Venus'],
      favorableZodiac: ['taurus', 'virgo'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Venus' },
          second: { element: 'Earth', planet: 'Jupiter' },
          third: { element: 'Fire', planet: 'Mars' },
        },
      },
      lunarPhaseModifiers: {
        fullmoon: {
          elementalBoost: (0, elementalUtils_2.createElementalProperties)({
            Earth: 0.2,
            Water: 0.1,
          }),
          preparationTips: ['Enhanced nutritional extraction', 'Good for harvesting'],
        },
      },
    },
    qualities: ['nourishing', 'strengthening', 'substantial', 'grounding'],
    season: ['summer', 'early fall'],
    category: 'vegetable',
    subCategory: 'legume',
    affinities: ['salt', 'sesame', 'chili', 'lemon', 'olive oil', 'garlic'],
    cookingMethods: ['boiled', 'steamed', 'microwaved', 'roasted'],
    nutritionalProfile: {
      fiber: 'high',
      vitamins: ['k', 'folate', 'c', 'b2', 'b1'],
      minerals: ['iron', 'calcium', 'magnesium', 'zinc', 'potassium'],
      calories: 121,
      protein_g: 12,
      fiber_g: 5,
      carbs_g: 10,
      fat_g: 5,
    },
    preparation: {
      washing: true,
      cooking: 'simmer in salted water 3-5 minutes',
      shelling: 'typically eaten by squeezing beans from pods',
      notes: 'Do not eat the pods, just the beans inside',
    },
    storage: {
      temperature: 'refrigerated or frozen',
      fresh_duration: '1-2 days',
      frozen_duration: '6-12 months',
      notes: 'Often purchased frozen, keeps quality well',
    },
  },
  'lima beans': {
    name: 'Lima beans',
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Earth: 0.5,
      Water: 0.2,
      Fire: 0.2,
      Air: 0.1,
    }),
    astrologicalProfile: {
      rulingPlanets: ['Saturn', 'Moon'],
      favorableZodiac: ['capricorn', 'cancer'],
      elementalAffinity: {
        base: 'Earth',
        decanModifiers: {
          first: { element: 'Earth', planet: 'Saturn' },
          second: { element: 'Water', planet: 'Moon' },
          third: { element: 'Fire', planet: 'Mars' },
        },
      },
      lunarPhaseModifiers: {
        fullmoon: {
          elementalBoost: (0, elementalUtils_2.createElementalProperties)({
            Earth: 0.2,
            Water: 0.1,
          }),
          preparationTips: ['Enhanced digestibility', 'Best for cooking'],
        },
      },
    },
    qualities: ['hearty', 'nourishing', 'substantial', 'grounding'],
    season: ['summer', 'fall'],
    category: 'vegetable',
    subCategory: 'legume',
    affinities: ['butter', 'bacon', 'sage', 'thyme', 'garlic', 'corn', 'tomatoes'],
    cookingMethods: ['boiled', 'steamed', 'braised', 'pressure-cooked'],
    nutritionalProfile: {
      fiber: 'very high',
      vitamins: ['folate', 'b1', 'b6', 'k'],
      minerals: ['copper', 'manganese', 'iron', 'magnesium', 'potassium'],
      calories: 115,
      protein_g: 8,
      fiber_g: 7,
      carbs_g: 21,
    },
  },
};
// Process ingredient mappings to ensure they have all required properties
exports.legumes = (0, elementalUtils_1.fixIngredientMappings)(rawLegumes);
// Export individual legumes for direct access
exports.greenBeans = exports.legumes['green beans'];
exports.snapPeas = exports.legumes['snap peas'];
exports.snowPeas = exports.legumes['snow peas'];
exports.edamame = exports.legumes.edamame;
exports.limaBeans = exports.legumes['lima beans'];
// Default export
exports.default = exports.legumes;
