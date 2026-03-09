'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.flaxseed =
  exports.chia =
  exports.buckwheat =
  exports.amaranth =
  exports.quinoa =
  exports.pseudoGrains =
    void 0;
const quinoa_1 = require('./quinoa');
Object.defineProperty(exports, 'quinoa', {
  enumerable: true,
  get: function () {
    return quinoa_1.quinoa;
  },
});
const amaranth_1 = require('./amaranth');
Object.defineProperty(exports, 'amaranth', {
  enumerable: true,
  get: function () {
    return amaranth_1.amaranth;
  },
});
const buckwheat_1 = require('./buckwheat');
Object.defineProperty(exports, 'buckwheat', {
  enumerable: true,
  get: function () {
    return buckwheat_1.buckwheat;
  },
});
const chia_1 = require('./chia');
Object.defineProperty(exports, 'chia', {
  enumerable: true,
  get: function () {
    return chia_1.chia;
  },
});
const flaxseed_1 = require('./flaxseed');
Object.defineProperty(exports, 'flaxseed', {
  enumerable: true,
  get: function () {
    return flaxseed_1.flaxseed;
  },
});
// Export all pseudo grains as a consolidated object
exports.pseudoGrains = {
  ...quinoa_1.quinoa,
  ...amaranth_1.amaranth,
  ...buckwheat_1.buckwheat,
  ...chia_1.chia,
  ...flaxseed_1.flaxseed,
};
