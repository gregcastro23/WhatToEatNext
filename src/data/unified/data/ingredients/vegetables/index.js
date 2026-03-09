'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getVegetablesByCookingMethod =
  exports.getSeasonalVegetables =
  exports.getVegetablesBySubCategory =
  exports.legumes =
  exports.starchyVegetables =
  exports.squash =
  exports.alliums =
  exports.nightshades =
  exports.cruciferous =
  exports.roots =
  exports.leafyGreens =
  exports.standardizedVegetables =
  exports.enhancedVegetables =
  exports.vegetables =
    void 0;
const leafyGreens_1 = require('./leafyGreens');
Object.defineProperty(exports, 'leafyGreens', {
  enumerable: true,
  get: function () {
    return leafyGreens_1.leafyGreens;
  },
});
const roots_1 = require('./roots');
Object.defineProperty(exports, 'roots', {
  enumerable: true,
  get: function () {
    return roots_1.roots;
  },
});
const cruciferous_1 = require('./cruciferous');
Object.defineProperty(exports, 'cruciferous', {
  enumerable: true,
  get: function () {
    return cruciferous_1.cruciferous;
  },
});
const nightshades_1 = require('./nightshades');
Object.defineProperty(exports, 'nightshades', {
  enumerable: true,
  get: function () {
    return nightshades_1.nightshades;
  },
});
const alliums_1 = require('./alliums');
Object.defineProperty(exports, 'alliums', {
  enumerable: true,
  get: function () {
    return alliums_1.alliums;
  },
});
const squash_1 = require('./squash');
Object.defineProperty(exports, 'squash', {
  enumerable: true,
  get: function () {
    return squash_1.squash;
  },
});
const starchy_1 = require('./starchy');
Object.defineProperty(exports, 'starchyVegetables', {
  enumerable: true,
  get: function () {
    return starchy_1.starchyVegetables;
  },
});
const legumes_1 = require('./legumes');
Object.defineProperty(exports, 'legumes', {
  enumerable: true,
  get: function () {
    return legumes_1.legumes;
  },
});
// Combine all vegetable categories
exports.vegetables = {
  ...leafyGreens_1.leafyGreens,
  ...roots_1.roots,
  ...cruciferous_1.cruciferous,
  ...nightshades_1.nightshades,
  ...alliums_1.alliums,
  ...squash_1.squash,
  ...starchy_1.starchyVegetables,
  ...legumes_1.legumes,
};
// Create enhanced vegetables with additional properties
exports.enhancedVegetables = exports.vegetables;
// For standardization - both exports refer to the same object
exports.standardizedVegetables = exports.vegetables;
// Helper functions
const getVegetablesBySubCategory = subCategory => {
  return Object.entries(exports.vegetables)
    .filter(([_, value]) => value.subCategory === subCategory)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getVegetablesBySubCategory = getVegetablesBySubCategory;
const getSeasonalVegetables = season => {
  return Object.entries(exports.vegetables)
    .filter(([_, value]) => Array.isArray(value.season) && value.season.includes(season))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getSeasonalVegetables = getSeasonalVegetables;
const getVegetablesByCookingMethod = method => {
  return Object.entries(exports.vegetables)
    .filter(
      ([_, value]) => Array.isArray(value.cookingMethods) && value.cookingMethods.includes(method),
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
exports.getVegetablesByCookingMethod = getVegetablesByCookingMethod;
exports.default = exports.vegetables;
