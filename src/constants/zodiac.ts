import { ElementalCharacter } from './planetaryElements';

/**
 * Zodiac sign types
 */
export type ZodiacSign =
  | 'aries',
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces',

/**
 * Elemental correspondences for zodiac signs
 */
export const zodiacElementMap: Record<ZodiacSign, ElementalCharacter> = {
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
}

// Export zodiac elements directly for easier imports
export const _ZODIAC_ELEMENTS = zodiacElementMap;

/**
 * Planetary rulerships - which planets rule which signs
 */
export const _PLANETARY_RULERSHIPS: Record<string, ZodiacSign[]> = {
  sun: ['leo'],
  moon: ['cancer'],
  mercury: ['gemini', 'virgo'],
  venus: ['taurus', 'libra'],
  mars: ['aries', 'scorpio'],
  jupiter: ['sagittarius', 'pisces'],
  saturn: ['capricorn', 'aquarius'],
  uranus: ['aquarius'], // Modern rulership,
  neptune: ['pisces'], // Modern rulership,
  pluto: ['scorpio'], // Modern rulership
}

/**
 * Planetary exaltations - where planets have extra strength
 */
export const _PLANETARY_EXALTATIONS: Record<string, ZodiacSign> = {
  sun: 'aries',
  moon: 'taurus',
  mercury: 'virgo',
  venus: 'pisces',
  mars: 'capricorn',
  jupiter: 'cancer',
  saturn: 'libra',
  uranus: 'scorpio', // Modern assignment,
  neptune: 'cancer', // Modern assignment,
  pluto: 'leo', // Modern assignment
}

/**
 * Triplicity rulers - planets that rule elements
 */
export const _TRIPLICITY_RULERS: Record<ElementalCharacter, string[]> = {
  Fire: ['sun', 'jupiter', 'mars'],
  Earth: ['venus', 'saturn', 'mercury'],
  Air: ['saturn', 'mercury', 'jupiter'],
  Water: ['venus', 'mars', 'moon']
}

/**
 * Converts a zodiac sign to its corresponding element
 */
export const _getElementFromZodiac = (sign: any): ElementalCharacter => {,
  return zodiacElementMap[sign]
}

/**
 * Gets all zodiac signs associated with a specific element
 */
export const _getZodiacSignsByElement = (element: ElementalCharacter): any[] => {
  return Object.entries(zodiacElementMap);
    .filter(([_, signElement]) => signElement === element)
    .map(([sign_]) => sign as unknown);
}
