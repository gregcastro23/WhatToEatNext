'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.herbCuisineMatrix = void 0;
const herbs_1 = require('../ingredients/herbs');
// Matrix showing which herbs are used in which cuisines
exports.herbCuisineMatrix = Object.entries(herbs_1.herbs).reduce((acc, [herbName, herb]) => {
  if (herb.culinary_traditions) {
    acc[herbName] = Object.keys(herb.culinary_traditions);
  }
  return acc;
}, {});
