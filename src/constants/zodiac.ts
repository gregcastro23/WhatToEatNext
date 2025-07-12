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
 * Zodiac sign object interface for detailed usage
 */
export interface ZodiacSignObject {
  name: string;
  symbol: string;
  start: number; // Degree position in zodiac wheel
  element: ElementalCharacter;
  sign: ZodiacSign; // String literal identifier
}

/**
 * Array of all zodiac signs in order (string literals for type safety)
 */
export const zodiacSignNames: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

/**
 * Detailed zodiac sign objects with all properties
 */
export const zodiacSigns: ZodiacSignObject[] = [
  { name: 'Aries', symbol: '♈', start: 0, element: 'Fire', sign: 'aries' },
  { name: 'Taurus', symbol: '♉', start: 30, element: 'Earth', sign: 'taurus' },
  { name: 'Gemini', symbol: '♊', start: 60, element: 'Air', sign: 'gemini' },
  { name: 'Cancer', symbol: '♋', start: 90, element: 'Water', sign: 'cancer' },
  { name: 'Leo', symbol: '♌', start: 120, element: 'Fire', sign: 'leo' },
  { name: 'Virgo', symbol: '♍', start: 150, element: 'Earth', sign: 'virgo' },
  { name: 'Libra', symbol: '♎', start: 180, element: 'Air', sign: 'libra' },
  { name: 'Scorpio', symbol: '♏', start: 210, element: 'Water', sign: 'scorpio' },
  { name: 'Sagittarius', symbol: '♐', start: 240, element: 'Fire', sign: 'sagittarius' },
  { name: 'Capricorn', symbol: '♑', start: 270, element: 'Earth', sign: 'capricorn' },
  { name: 'Aquarius', symbol: '♒', start: 300, element: 'Air', sign: 'aquarius' },
  { name: 'Pisces', symbol: '♓', start: 330, element: 'Water', sign: 'pisces' }
];

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

// Export zodiac elements directly for easier imports
export const ZODIAC_ELEMENTS = zodiacElementMap;

/**
 * Planetary rulerships - which planets rule which signs
 */
export const PLANETARY_RULERSHIPS: Record<string, ZodiacSign[]> = {
  'sun': ['leo'],
  'moon': ['cancer'],
  'mercury': ['gemini', 'virgo'],
  'venus': ['taurus', 'libra'],
  'mars': ['aries', 'scorpio'],
  'jupiter': ['sagittarius', 'pisces'],
  'saturn': ['capricorn', 'aquarius'],
  'uranus': ['aquarius'], // Modern rulership
  'neptune': ['pisces'],  // Modern rulership
  'pluto': ['scorpio']    // Modern rulership
};

/**
 * Planetary exaltations - where planets have extra strength
 */
export const PLANETARY_EXALTATIONS: Record<string, ZodiacSign> = {
  'sun': 'aries',
  'moon': 'taurus',
  'mercury': 'virgo',
  'venus': 'pisces',
  'mars': 'capricorn',
  'jupiter': 'cancer',
  'saturn': 'libra',
  'uranus': 'scorpio',   // Modern assignment
  'neptune': 'cancer',   // Modern assignment
  'pluto': 'leo'         // Modern assignment
};

/**
 * Triplicity rulers - planets that rule elements
 */
export const TRIPLICITY_RULERS: Record<ElementalCharacter, string[]> = {
  'Fire': ['sun', 'jupiter', 'mars'],
  'Earth': ['venus', 'saturn', 'mercury'],
  'Air': ['saturn', 'mercury', 'jupiter'],
  'Water': ['venus', 'mars', 'moon']
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

/**
 * Gets a zodiac sign object by its string literal identifier
 */
export const getZodiacSignObject = (sign: ZodiacSign): ZodiacSignObject | undefined => {
  return zodiacSigns.find(zodiacSign => zodiacSign.sign === sign);
};

/**
 * Gets a zodiac sign object by its name
 */
export const getZodiacSignByName = (name: string): ZodiacSignObject | undefined => {
  return zodiacSigns.find(zodiacSign => zodiacSign.name.toLowerCase() === name.toLowerCase());
}; 