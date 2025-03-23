import { ElementalCharacter } from './planetaryElements';

/**
 * Zodiac sign types
 */
export type ZodiacSign =
  | 'aries'
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
  | 'pisces';

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
};

/**
 * Converts a zodiac sign to its corresponding element
 */
export const getElementFromZodiac = (sign: ZodiacSign): ElementalCharacter => {
  return zodiacElementMap[sign];
};

/**
 * Gets all zodiac signs associated with a specific element
 */
export const getZodiacSignsByElement = (element: ElementalCharacter): ZodiacSign[] => {
  return Object.entries(zodiacElementMap)
    .filter(([_, signElement]) => signElement === element)
    .map(([sign, _]) => sign as ZodiacSign);
}; 