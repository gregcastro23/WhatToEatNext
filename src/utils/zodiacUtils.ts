import { ElementalProperties, ZodiacSign } from '@/types/alchemy';
import { ZodiacAffinity, DEFAULT_ZODIAC_AFFINITY } from '@/types/zodiacAffinity';

/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
const debugLog = (_message: string, ..._args: unknown[]): void => {
  // Intentionally left blank to avoid linting warnings
};

/**
 * Get the current zodiac sign based on the current date
 * @returns The current zodiac sign as a string
 */
export const _getCurrentZodiacSign = (): string => {
  const now = new Date()
  const month = now.getMonth() + 1;
  const day = now.getDate()

  // Basic zodiac calculation
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius'
  return 'Capricorn'
};

/**
 * Convert any string to a valid ZodiacSign if possible
 * @param zodiac String representing a zodiac sign
 * @returns A valid ZodiacSign or 'Aries' as default
 */
export function toZodiacSign(zodiac: string | null | undefined): any {
  if (!zodiac) return 'aries'

  const validSigns = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces'
  ];

  const normalized = zodiac.toLowerCase()
  return (validSigns.find(sign => sign.toLowerCase() === normalized) || 'aries') as any;
}

/**
 * Get zodiac sign from longitude value
 * @param longitude Longitude in degrees (0-360)
 * @returns Zodiac sign as a string
 */
export function getSignFromLongitude(longitude: number): string {
  const signs = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces'
  ];
  const signIndex = Math.floor((longitude % 360) / 30)
  return signs[signIndex]
}

/**
 * Get zodiac sign from a Date object
 * @param date Date to calculate zodiac sign for
 * @returns Zodiac sign
 */
export function getZodiacSign(date: Date): any {
  const month = date.getMonth() + 1;
  const day = date.getDate()

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius'
  return 'pisces'
}

/**
 * Get the element associated with a zodiac sign
 * @param sign Zodiac sign
 * @returns Element ('Fire', 'Earth', 'Air', or 'Water')
 */
export function getElementForZodiac(sign: any): 'Fire' | 'Earth' | 'Air' | 'Water' {
  const fireZodiacs: any[] = ['aries', 'leo', 'sagittarius'];
  const earthZodiacs: any[] = ['taurus', 'virgo', 'capricorn'];
  const airZodiacs: any[] = ['gemini', 'libra', 'aquarius'];
  const _waterZodiacs: any[] = ['cancer', 'scorpio', 'pisces'];

  if (fireZodiacs.includes(sign)) return 'Fire';
  if (earthZodiacs.includes(sign)) return 'Earth';
  if (airZodiacs.includes(sign)) return 'Air';
  return 'Water'
}

/**
 * Get the elemental influence of a zodiac sign
 * @param sign Zodiac sign
 * @returns Elemental properties with the sign's element boosted
 */
export function getZodiacElementalInfluence(sign: any): ElementalProperties {
  const element = getElementForZodiac(sign)
  // Base values
  const result: ElementalProperties = {
    Fire: 0.2,
    Earth: 0.2,
    Air: 0.2,
    Water: 0.2
  };

  // Boost the primary element
  result[element] = 0.7;

  return result;
}

/**
 * Calculate zodiac affinity based on an ingredient's elemental properties
 * @param elementalProperties Elemental properties to calculate affinity from
 * @param primaryZodiacSign Optional primary sign to boost modality affinity
 * @returns Zodiac affinity with values for each sign
 */
export function calculateZodiacAffinityFromElements(
  elementalProperties: ElementalProperties,
  primaryZodiacSign?: any,
): ZodiacAffinity {
  const result: ZodiacAffinity = { ...DEFAULT_ZODIAC_AFFINITY };

  // Map each zodiac sign to its element
  const elementMap: Record<ZodiacSign, keyof ElementalProperties> = {
    aries: 'Fire',
    leo: 'Fire',
    sagittarius: 'Fire',
    taurus: 'Earth',
    virgo: 'Earth',
    capricorn: 'Earth',
    gemini: 'Air',
    libra: 'Air',
    aquarius: 'Air',
    cancer: 'Water',
    scorpio: 'Water',
    pisces: 'Water'
  };

  // Calculate affinities based on elemental properties
  Object.entries(elementMap).forEach(([sign, element]) => {
    // Base affinity from primary element - elements are most harmonious with themselves
    result[sign as any] = elementalProperties[element] * 0.7;

    // Add smaller contributions from other elements based on compatibility
    const otherElements = Object.keys(elementalProperties).filter(e => e !== element) as Array<
      keyof ElementalProperties
    >;

    otherElements.forEach(otherElement => {
      // Get compatibility between elements
      const compatibility = getElementalCompatibility(element, otherElement)
      result[sign as any] += elementalProperties[otherElement] * compatibility * 0.2;
    })

    // Apply modality boost if primary sign is provided
    if (primaryZodiacSign) {
      const signModality = getModalityForZodiac(sign as any)
      const primaryModality = getModalityForZodiac(primaryZodiacSign)

      // Apply hierarchical modality-element affinities
      if (signModality === primaryModality) {
        // Boost affinity for signs with the same modality
        result[sign as any] += 0.2;

        // Add additional boost based on hierarchical element-modality affinities
        if (signModality === 'mutable' && element === 'Air') {
          result[sign as any] += 0.1; // Air has strongest affinity with Mutable
        } else if (signModality === 'fixed' && element === 'Earth') {
          result[sign as any] += 0.1; // Earth has strongest affinity with Fixed
        } else if (signModality === 'cardinal') {
          // Cardinal has equal affinity with all elements, small boost
          result[sign as any] += 0.05;
        }
      } else {
        // Apply hierarchical cross-modality affinities
        if (signModality === 'mutable' && primaryModality === 'cardinal') {
          // Mutable and Cardinal have moderate affinity
          result[sign as any] += 0.1;
        } else if (signModality === 'fixed' && primaryModality === 'cardinal') {
          // Fixed and Cardinal have moderate affinity
          result[sign as any] += 0.1;
        }
      }
    }
  })

  // Ensure all values are in the 0-1 range
  Object.keys(result).forEach(sign => {
    result[sign as any] = Math.min(1, Math.max(0, result[sign as any]))
  })

  debugLog('Calculated zodiac affinity:', result)

  return result;
}

/**
 * Get compatibility between two elements (0-1 scale)
 * Implements the updated elemental harmony rules where elements are most harmonious with themselves
 *
 * @param element1 First element
 * @param element2 Second element
 * @returns Compatibility value between 0 and 1
 */
function getElementalCompatibility(
  element1: keyof ElementalProperties,
  element2: keyof ElementalProperties,
): number {
  // Same element has highest compatibility
  if (element1 === element2) {
    return 0.9 // Same element has high compatibility
  }

  // All different element combinations have good compatibility
  // since each element brings its own unique qualities
  return 0.7; // Different elements have good compatibility - they work together
}

/**
 * Get the modality of a zodiac sign
 * @param sign Zodiac sign
 * @returns Modality ('cardinal', 'fixed', or 'mutable')
 */
export function getModalityForZodiac(sign: any): 'cardinal' | 'fixed' | 'mutable' {
  const cardinalZodiacs: any[] = ['aries', 'cancer', 'libra', 'capricorn'];
  const fixedZodiacs: any[] = ['taurus', 'leo', 'scorpio', 'aquarius'];
  const _mutableZodiacs: any[] = ['gemini', 'virgo', 'sagittarius', 'pisces'];

  if (cardinalZodiacs.includes(sign)) return 'cardinal';
  if (fixedZodiacs.includes(sign)) return 'fixed';
  return 'mutable'
}

export function getZodiacFromDate(date: Date): any {
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const day = date.getDate()

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius'
  return 'pisces'
}