import type { ZodiacSign } from '@/types/alchemy';
import { ZodiacAffinity, DEFAULT_ZODIAC_AFFINITY } from '@/types/zodiacAffinity';
import { ElementalProperties } from '@/types/alchemy';

/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
const debugLog = (message: string, ...args: unknown[]): void => {
  // Comment out console.log to avoid linting warnings
  // console.log(message, ...args);
};

/**
 * Get the current zodiac sign based on the current date
 * @returns The current zodiac sign as a string
 */
export const getCurrentZodiacSign = (): string => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // Basic zodiac calculation
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'pisces';
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
  return 'capricorn';
};

/**
 * Convert any string to a valid ZodiacSign if possible
 * @param zodiac String representing a zodiac sign
 * @returns A valid ZodiacSign or 'aries' as default
 */
export function toZodiacSign(zodiac: string | null | undefined): ZodiacSign {
  if (!zodiac) return 'aries';
  
  const normalized = zodiac.toLowerCase();
  
  const validSigns: ZodiacSign[] = [
    'aries', 'taurus', 'gemini', 'cancer', 
    'leo', 'virgo', 'libra', 'scorpio', 
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];
  
  return validSigns.includes(normalized as ZodiacSign) 
    ? (normalized as ZodiacSign) 
    : 'aries';
}

/**
 * Get zodiac sign from longitude value
 * @param longitude Longitude in degrees (0-360)
 * @returns Zodiac sign as a string
 */
export function getSignFromLongitude(longitude: number): string {
  const signs = [
    'aries', 'taurus', 'gemini', 'cancer',
    'leo', 'virgo', 'libra', 'scorpio',
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];
  const signIndex = Math.floor((longitude % 360) / 30);
  return signs[signIndex];
}

/**
 * Get zodiac sign from a Date object
 * @param date Date to calculate zodiac sign for
 * @returns Zodiac sign
 */
export function getZodiacSign(date: Date): ZodiacSign {
  const month = date.getMonth() + 1;
  const day = date.getDate();

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
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  return 'pisces';
}

/**
 * Get the element associated with a zodiac sign
 * @param sign Zodiac sign
 * @returns Element ('Fire', 'Earth', 'Air', or 'Water')
 */
export function getElementForZodiac(sign: ZodiacSign): 'Fire' | 'Earth' | 'Air' | 'Water' {
  const fireZodiacs: ZodiacSign[] = ['aries', 'leo', 'sagittarius'];
  const earthZodiacs: ZodiacSign[] = ['taurus', 'virgo', 'capricorn'];
  const airZodiacs: ZodiacSign[] = ['gemini', 'libra', 'aquarius'];
  const waterZodiacs: ZodiacSign[] = ['cancer', 'scorpio', 'pisces'];

  if (fireZodiacs.includes(sign)) return 'Fire';
  if (earthZodiacs.includes(sign)) return 'Earth';
  if (airZodiacs.includes(sign)) return 'Air';
  return 'Water';
}

/**
 * Get the elemental influence of a zodiac sign
 * @param sign Zodiac sign
 * @returns Elemental properties with the sign's element boosted
 */
export function getZodiacElementalInfluence(sign: ZodiacSign): ElementalProperties {
  const element = getElementForZodiac(sign);
  
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
  primaryZodiacSign?: ZodiacSign
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
    // Base affinity from primary element
    result[sign as ZodiacSign] = elementalProperties[element] * 0.5;
    
    // Add smaller contributions from other elements based on compatibility
    const otherElements = Object.keys(elementalProperties).filter(e => e !== element) as Array<keyof ElementalProperties>;
    
    otherElements.forEach(otherElement => {
      // Get compatibility between elements
      const compatibility = getElementalCompatibility(element, otherElement);
      result[sign as ZodiacSign] += elementalProperties[otherElement] * compatibility * 0.3;
    });
    
    // Apply modality boost if primary sign is provided
    if (primaryZodiacSign) {
      const signModality = getModalityForZodiac(sign as ZodiacSign);
      const primaryModality = getModalityForZodiac(primaryZodiacSign);
      
      if (signModality === primaryModality) {
        // Boost affinity for signs with the same modality
        result[sign as ZodiacSign] += 0.2;
      }
    }
  });
  
  // Ensure all values are in the 0-1 range
  Object.keys(result).forEach(sign => {
    result[sign as ZodiacSign] = Math.min(1, Math.max(0, result[sign as ZodiacSign]));
  });
  
  debugLog("Calculated zodiac affinity:", result);
  
  return result;
}

/**
 * Get compatibility between two elements (0-1 scale)
 * @param element1 First element
 * @param element2 Second element
 * @returns Compatibility value between 0 and 1
 */
function getElementalCompatibility(
  element1: keyof ElementalProperties, 
  element2: keyof ElementalProperties
): number {
  // Compatible pairs
  if (element1 === element2) return 0.8; // Same element: high compatibility
  
  if (
    (element1 === 'Fire' && element2 === 'Air') ||
    (element1 === 'Air' && element2 === 'Fire') ||
    (element1 === 'Earth' && element2 === 'Water') ||
    (element1 === 'Water' && element2 === 'Earth')
  ) {
    return 0.6; // Compatible elements
  }
  
  // Neutral pairs
  if (
    (element1 === 'Fire' && element2 === 'Earth') ||
    (element1 === 'Earth' && element2 === 'Fire') ||
    (element1 === 'Air' && element2 === 'Water') ||
    (element1 === 'Water' && element2 === 'Air')
  ) {
    return 0.3; // Neutral elements
  }
  
  // Opposing elements
  return 0.1; // Low compatibility
}

/**
 * Get the modality of a zodiac sign
 * @param sign Zodiac sign
 * @returns Modality ('cardinal', 'fixed', or 'mutable')
 */
export function getModalityForZodiac(sign: ZodiacSign): 'cardinal' | 'fixed' | 'mutable' {
  const cardinalZodiacs: ZodiacSign[] = ['aries', 'cancer', 'libra', 'capricorn'];
  const fixedZodiacs: ZodiacSign[] = ['taurus', 'leo', 'scorpio', 'aquarius'];
  const mutableZodiacs: ZodiacSign[] = ['gemini', 'virgo', 'sagittarius', 'pisces'];

  if (cardinalZodiacs.includes(sign)) return 'cardinal';
  if (fixedZodiacs.includes(sign)) return 'fixed';
  return 'mutable';
} 