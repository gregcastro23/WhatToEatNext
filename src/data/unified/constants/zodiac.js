/**
 * Elemental correspondences for zodiac signs
 */
export const zodiacElementMap = {
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
    pisces: 'Water'
};
// Export zodiac elements directly for easier imports
export const ZODIAC_ELEMENTS = zodiacElementMap;
/**
 * Planetary rulerships - which planets rule which signs
 */
export const PLANETARY_RULERSHIPS = {
    'Sun': ['leo'],
    'Moon': ['cancer'],
    'Mercury': ['gemini', 'virgo'],
    'Venus': ['taurus', 'libra'],
    'Mars': ['aries', 'scorpio'],
    'Jupiter': ['sagittarius', 'pisces'],
    'Saturn': ['capricorn', 'aquarius'],
    'Uranus': ['aquarius'],
    'Neptune': ['pisces'],
    'Pluto': ['scorpio'] // Modern rulership
};
/**
 * Planetary exaltations - where planets have extra strength
 */
export const PLANETARY_EXALTATIONS = {
    'Sun': 'aries',
    'Moon': 'taurus',
    'Mercury': 'virgo',
    'Venus': 'pisces',
    'Mars': 'capricorn',
    'Jupiter': 'cancer',
    'Saturn': 'libra',
    'Uranus': 'scorpio',
    'Neptune': 'cancer',
    'Pluto': 'leo' // Modern assignment
};
/**
 * Triplicity rulers - planets that rule elements
 */
export const TRIPLICITY_RULERS = {
    'Fire': ['Sun', 'Jupiter', 'Mars'],
    'Earth': ['Venus', 'Saturn', 'Mercury'],
    'Air': ['Saturn', 'Mercury', 'Jupiter'],
    'Water': ['Venus', 'Mars', 'Moon']
};
/**
 * Converts a zodiac sign to its corresponding element
 */
export const getElementFromZodiac = (sign) => {
    return zodiacElementMap[sign];
};
/**
 * Gets all zodiac signs associated with a specific element
 */
export const getZodiacSignsByElement = (element) => {
    return Object.entries(zodiacElementMap)
        .filter(([_, signElement]) => signElement === element)
        .map(([sign, _]) => sign);
};
