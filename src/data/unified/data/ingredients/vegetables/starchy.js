'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.starchyVegetables = void 0;
const elementalUtils_1 = require('../../../utils/elementalUtils');
const rawStarchyVegetables = {
  potato: {
    name: 'potato',
    elementalProperties: {
      Earth: 0.6,
      Water: 0.25,
      Fire: 0.1,
      Air: 0.05,
    },
    category: 'vegetable',
    subCategory: 'starchy',
    qualities: ['filling', 'versatile', 'hearty', 'comforting'],
    nutritionalProfile: {
      carbs_g: 17,
      calories: 77,
      fiber_g: 2.2,
      protein_g: 2,
      vitamins: ['c', 'b6', 'folate'],
      minerals: ['potassium', 'manganese', 'phosphorus', 'magnesium'],
    },
    season: ['fall', 'winter', 'spring', 'summer'],
    cookingMethods: ['roast', 'boil', 'steam', 'fry', 'bake'],
    culinaryApplications: {
      roasted: {
        method: 'Cut into pieces, toss with oil and herbs, roast at high heat',
        timing: '30-45 minutes at 400-425°F',
        pAirings: ['rosemary', 'garlic', 'thyme'],
      },
      mashed: {
        method: 'Boil until fork-tender, drain, mash with milk and butter',
        timing: '15-20 minutes boiling',
        pAirings: ['butter', 'milk', 'cream', 'garlic'],
      },
      fried: {
        method: 'Cut into strips or cubes, fry in hot oil',
        timing: '5-8 minutes at 350-375°F',
        pAirings: ['salt', 'ketchup', 'aioli'],
      },
    },
  },
  sweet_potato: {
    name: 'sweet potato',
    elementalProperties: {
      Earth: 0.5,
      Fire: 0.3,
      Water: 0.15,
      Air: 0.05,
    },
    category: 'vegetable',
    subCategory: 'starchy',
    qualities: ['sweet', 'versatile', 'nutritious', 'colorful'],
    nutritionalProfile: {
      carbs_g: 20,
      calories: 86,
      fiber_g: 3,
      protein_g: 1.6,
      vitamins: ['a', 'c', 'b6'],
      minerals: ['potassium', 'manganese', 'copper'],
    },
    season: ['fall', 'winter'],
    cookingMethods: ['roast', 'boil', 'steam', 'fry', 'bake'],
    culinaryApplications: {
      roasted: {
        method: 'Cut into pieces, toss with oil and spices, roast at medium-high heat',
        timing: '25-35 minutes at 400°F',
        pAirings: ['cinnamon', 'nutmeg', 'maple syrup'],
      },
      mashed: {
        method: 'Boil until fork-tender, drain, mash with butter and seasonings',
        timing: '15-20 minutes boiling',
        pAirings: ['brown sugar', 'cinnamon', 'orange zest'],
      },
      baked: {
        method: 'Pierce with fork, bake whole until tender',
        timing: '45-60 minutes at 400°F',
        pAirings: ['butter', 'cinnamon', 'marshmallows'],
      },
    },
  },
  peas: {
    name: 'peas',
    elementalProperties: {
      Fire: 0.7162207554458272,
      Water: 0.2242992223845753,
      Earth: 0.025780554575838496,
      Air: 0.03369946759375892,
    },
    category: 'vegetable',
    subCategory: 'starchy',
    nutritionalProfile: {
      carbs_g: 14.4,
      calories: 81,
      fiber_g: 5.7,
      protein_g: 5.42,
      vitamins: ['k', 'c', 'a', 'folate', 'b1', 'b6'],
      minerals: ['manganese', 'copper', 'phosphorus', 'magnesium', 'iron', 'zinc'],
    },
    season: ['spring', 'summer'],
    cookingMethods: ['steam', 'boil', 'saute', 'roast'],
    qualities: ['sweet', 'tender', 'versatile', 'nutritious'],
    culinaryApplications: {
      steamed: {
        method: 'Steam until bright green and tender',
        timing: '3-5 minutes',
        pAirings: ['butter', 'mint', 'lemon'],
      },
      sauteed: {
        method: 'Quickly sauté with aromatics',
        timing: '2-3 minutes',
        pAirings: ['garlic', 'shallots', 'herbs'],
      },
      soup: {
        method: 'Add to soups near end of cooking',
        timing: '5-10 minutes',
        pAirings: ['mint', 'cream', 'ham'],
      },
    },
  },
};
// Fix the ingredient mappings to ensure they have all required properties
exports.starchyVegetables = (0, elementalUtils_1.fixIngredientMappings)(rawStarchyVegetables);
