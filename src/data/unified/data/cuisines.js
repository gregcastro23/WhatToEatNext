'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CUISINES =
  exports.cuisinesMap =
  exports.getCuisinesByElement =
  exports.getCuisineByName =
  exports.cuisines =
    void 0;
// src/data/cuisines.ts
const index_1 = require('./cuisines/index');
Object.defineProperty(exports, 'CUISINES', {
  enumerable: true,
  get: function () {
    return index_1.CUISINES;
  },
});
const african_1 = require('./cuisines/african');
const american_1 = require('./cuisines/american');
const chinese_1 = require('./cuisines/chinese');
const french_1 = require('./cuisines/french');
const greek_1 = require('./cuisines/greek');
const indian_1 = require('./cuisines/indian');
const italian_1 = require('./cuisines/italian');
const japanese_1 = require('./cuisines/japanese');
const korean_1 = require('./cuisines/korean');
const mexican_1 = require('./cuisines/mexican');
const middle_eastern_1 = require('./cuisines/middle-eastern');
const thai_1 = require('./cuisines/thai');
const vietnamese_1 = require('./cuisines/vietnamese');
const russian_1 = require('./cuisines/russian');
// Example recipe type for reference
const _ = {
  id: 'example-recipe-001',
  name: 'Example Recipe',
  description: 'Template for recipe structure',
  cuisine: 'Any',
  ingredients: [
    { name: 'ingredient', amount: 100, unit: 'g', category: 'category', element: 'Earth' },
  ],
  cookingMethod: 'baking',
  timeToMake: 30,
  numberOfServings: 4,
  nutrition: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    vitamins: [],
    minerals: [],
  },
  season: ['all'],
  mealType: ['any'],
};
// Helper function to adapt ElementalProperties from cuisine.ts to alchemy.ts format
function adaptElementalProperties(props) {
  // If it already has the index signature, return as is
  if (props && typeof props === 'object' && Object.prototype.hasOwnProperty.call(props, 'Fire')) {
    return props;
  }
  // Convert to the format expected by alchemy.ts
  return {
    Fire: props?.Fire || 0,
    Water: props?.Water || 0,
    Earth: props?.Earth || 0,
    Air: props?.Air || 0,
  };
}
// Helper function to adapt cuisines to the CuisineType format
function adaptCuisine(cuisine) {
  return {
    ...cuisine,
    // Convert elementalProperties if present
    elementalProperties: cuisine.elementalProperties
      ? adaptElementalProperties(cuisine.elementalProperties)
      : undefined,
    // Convert elementalState if present
    elementalState: cuisine.elementalState
      ? adaptElementalProperties(cuisine.elementalState)
      : undefined,
  };
}
// Combine all cuisines
exports.cuisines = {
  american: adaptCuisine(american_1.american),
  chinese: adaptCuisine(chinese_1.chinese),
  french: adaptCuisine(french_1.french),
  greek: adaptCuisine(greek_1.greek),
  indian: adaptCuisine(indian_1.indian),
  italian: adaptCuisine(italian_1.italian),
  japanese: adaptCuisine(japanese_1.japanese),
  korean: adaptCuisine(korean_1.korean),
  mexican: adaptCuisine(mexican_1.mexican),
  middleEastern: adaptCuisine(middle_eastern_1.middleEastern),
  thai: adaptCuisine(thai_1.thai),
  vietnamese: adaptCuisine(vietnamese_1.vietnamese),
  african: adaptCuisine(african_1.african),
  russian: adaptCuisine(russian_1.russian),
};
// Helper functions for accessing cuisine properties
const getCuisineByName = name => exports.cuisines[name.toLowerCase()];
exports.getCuisineByName = getCuisineByName;
const getCuisinesByElement = element =>
  Object.values(exports.cuisines).filter(
    cuisine =>
      (cuisine.elementalState?.[element] ?? 0) >= 0.3 ||
      (cuisine.elementalProperties?.[element] ?? 0) >= 0.3,
  );
exports.getCuisinesByElement = getCuisinesByElement;
// Re-export the cuisinesMap from the imported one
exports.cuisinesMap = index_1.cuisinesMap;
exports.default = exports.cuisines;
