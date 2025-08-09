'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getZodiacSignsByElement =
  exports.getElementFromZodiac =
  exports.TRIPLICITY_RULERS =
  exports.PLANETARY_EXALTATIONS =
  exports.PLANETARY_RULERSHIPS =
  exports.ZODIAC_ELEMENTS =
  exports.zodiacElementMap =
    void 0;
/**
 * Elemental correspondences for zodiac signs
 */
exports.zodiacElementMap = {
  aries: 'Fire',
  taurus: 'Earth',
  gemini: 'Air',
  cancer: 'Water',
  leo: 'Fire',
  virgo: 'Earth',
  libra: 'Air',
  scorpio: 'Water',
  sagittarius: 'Fire',
  capricorn: 'Earth',
  aquarius: 'Air',
  pisces: 'Water',
};
// Export zodiac elements directly for easier imports
exports.ZODIAC_ELEMENTS = exports.zodiacElementMap;
/**
 * Planetary rulerships - which planets rule which signs
 */
exports.PLANETARY_RULERSHIPS = {
  Sun: ['leo'],
  Moon: ['cancer'],
  Mercury: ['gemini', 'virgo'],
  Venus: ['taurus', 'libra'],
  Mars: ['aries', 'scorpio'],
  Jupiter: ['sagittarius', 'pisces'],
  Saturn: ['capricorn', 'aquarius'],
  Uranus: ['aquarius'],
  Neptune: ['pisces'],
  Pluto: ['scorpio'], // Modern rulership
};
/**
 * Planetary exaltations - where planets have extra strength
 */
exports.PLANETARY_EXALTATIONS = {
  Sun: 'aries',
  Moon: 'taurus',
  Mercury: 'virgo',
  Venus: 'pisces',
  Mars: 'capricorn',
  Jupiter: 'cancer',
  Saturn: 'libra',
  Uranus: 'scorpio',
  Neptune: 'cancer',
  Pluto: 'leo', // Modern assignment
};
/**
 * Triplicity rulers - planets that rule elements
 */
exports.TRIPLICITY_RULERS = {
  Fire: ['Sun', 'Jupiter', 'Mars'],
  Earth: ['Venus', 'Saturn', 'Mercury'],
  Air: ['Saturn', 'Mercury', 'Jupiter'],
  Water: ['Venus', 'Mars', 'Moon'],
};
/**
 * Converts a zodiac sign to its corresponding element
 */
const getElementFromZodiac = sign => {
  return exports.zodiacElementMap[sign];
};
exports.getElementFromZodiac = getElementFromZodiac;
/**
 * Gets all zodiac signs associated with a specific element
 */
const getZodiacSignsByElement = element => {
  return Object.entries(exports.zodiacElementMap)
    .filter(([_, signElement]) => signElement === element)
    .map(([sign, _]) => sign);
};
exports.getZodiacSignsByElement = getZodiacSignsByElement;
