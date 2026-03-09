'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.allOils =
  exports.nutOils =
  exports.dressingOils =
  exports.bakingOils =
  exports.highHeatOils =
  exports.AirOils =
  exports.earthOils =
  exports.waterOils =
  exports.fireOils =
  exports.specialtyOils =
  exports.supplementOils =
  exports.finishingOils =
  exports.cookingOils =
  exports.processedOils =
  exports.oils =
    void 0;
const oils_1 = require('./oils');
Object.defineProperty(exports, 'oils', {
  enumerable: true,
  get: function () {
    return oils_1.oils;
  },
});
const elementalUtils_1 = require('../../../utils/elementalUtils');
// Process oils to add enhanced properties
exports.processedOils = (0, elementalUtils_1.enhanceOilProperties)(oils_1.oils);
// Export enhanced oils as default
exports.default = exports.processedOils;
// Export specific oil categories
exports.cookingOils = Object.entries(exports.processedOils)
  .filter(([_, value]) => value.subCategory === 'cooking')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
exports.finishingOils = Object.entries(exports.processedOils)
  .filter(([_, value]) => value.subCategory === 'finishing')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
exports.supplementOils = Object.entries(exports.processedOils)
  .filter(([_, value]) => value.subCategory === 'supplement')
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
exports.specialtyOils = Object.entries(exports.processedOils)
  .filter(
    ([_, value]) =>
      !value.subCategory ||
      (value.subCategory !== 'cooking' &&
        value.subCategory !== 'finishing' &&
        value.subCategory !== 'supplement'),
  )
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
// Export by elemental properties
exports.fireOils = Object.entries(exports.processedOils)
  .filter(
    ([_, value]) =>
      value.elementalProperties.Fire >= 0.4 ||
      value.astrologicalProfile?.elementalAffinity?.base === 'Fire',
  )
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
exports.waterOils = Object.entries(exports.processedOils)
  .filter(
    ([_, value]) =>
      value.elementalProperties.Water >= 0.4 ||
      value.astrologicalProfile?.elementalAffinity?.base === 'Water',
  )
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
exports.earthOils = Object.entries(exports.processedOils)
  .filter(
    ([_, value]) =>
      value.elementalProperties.Earth >= 0.4 ||
      value.astrologicalProfile?.elementalAffinity?.base === 'Earth',
  )
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
exports.AirOils = Object.entries(exports.processedOils)
  .filter(
    ([_, value]) =>
      value.elementalProperties.Air >= 0.4 ||
      value.astrologicalProfile?.elementalAffinity?.base === 'Air',
  )
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
// Export by culinary applications
exports.highHeatOils = Object.entries(exports.processedOils)
  .filter(
    ([_, value]) =>
      value.smokePoint?.fahrenheit >= 400 ||
      value.culinaryApplications?.frying ||
      value.culinaryApplications?.deepfrying,
  )
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
exports.bakingOils = Object.entries(exports.processedOils)
  .filter(([_, value]) => value.culinaryApplications?.baking)
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
exports.dressingOils = Object.entries(exports.processedOils)
  .filter(([_, value]) => value.culinaryApplications?.dressings)
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
exports.nutOils = Object.entries(exports.processedOils)
  .filter(
    ([key, _]) =>
      key.includes('walnut') ||
      key.includes('almond') ||
      key.includes('macadamia') ||
      key.includes('peanut'),
  )
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
// For backward compatibility
exports.allOils = exports.processedOils;
