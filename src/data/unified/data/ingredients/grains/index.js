'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.pseudoGrains =
  exports.refinedGrains =
  exports.wholeGrains =
  exports.grainPreparationMethods =
  exports.grainNames =
  exports.grains =
  exports.allGrains =
    void 0;
const elementalUtils_2 = require('../../../utils/elemental/elementalUtils');
const elementalUtils_1 = require('../../../utils/elementalUtils');
const wholeGrains_1 = require('./wholeGrains');
Object.defineProperty(exports, 'wholeGrains', {
  enumerable: true,
  get: function () {
    return wholeGrains_1.wholeGrains;
  },
});
const refinedGrains_1 = require('./refinedGrains');
Object.defineProperty(exports, 'refinedGrains', {
  enumerable: true,
  get: function () {
    return refinedGrains_1.refinedGrains;
  },
});
const pseudoGrains_1 = require('./pseudoGrains');
Object.defineProperty(exports, 'pseudoGrains', {
  enumerable: true,
  get: function () {
    return pseudoGrains_1.pseudoGrains;
  },
});
// Create a comprehensive collection of all grain types
exports.allGrains = (0, elementalUtils_1.fixIngredientMappings)({
  ...wholeGrains_1.wholeGrains,
  ...refinedGrains_1.refinedGrains,
  ...pseudoGrains_1.pseudoGrains,
});
// Fix the raw grains object with proper ingredient mapping structure
const rawGrains = {
  whole: {
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }),
    name: 'Whole Grains',
    category: 'grain',
    ...wholeGrains_1.wholeGrains,
  },
  refined: {
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }),
    name: 'Refined Grains',
    category: 'grain',
    ...refinedGrains_1.refinedGrains,
  },
  pseudo: {
    elementalProperties: (0, elementalUtils_2.createElementalProperties)({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }),
    name: 'Pseudo Grains',
    category: 'grain',
    ...pseudoGrains_1.pseudoGrains,
  },
};
// Apply the fix to ensure all required properties exist
exports.grains = (0, elementalUtils_1.fixIngredientMappings)(rawGrains);
// Create a list of all grain names for easy reference
exports.grainNames = Object.keys(exports.allGrains);
// Keep the preparation methods as a separate object
exports.grainPreparationMethods = {
  basic_cooking: {
    boiling: {
      method: 'covered pot',
      water_ratio: 'varies by grain',
      tips: ['salt Water before adding grain', 'do not stir frequently', 'let rest after cooking'],
    },
    steaming: {
      method: 'steam basket or rice cooker',
      benefits: ['retains nutrients', 'prevents sticking', 'consistent results'],
    },
  },
  soaking: {
    whole_grains: {
      duration: '8-12 hours',
      benefits: ['reduces cooking time', 'improves digestibility', 'activates nutrients'],
      method: 'room temperature water',
    },
    quick_method: {
      duration: '1-2 hours',
      benefits: ['shorter prep time', 'some improvement in cooking'],
      method: 'hot Water (not boiling)',
    },
  },
};
exports.default = exports.grains;
