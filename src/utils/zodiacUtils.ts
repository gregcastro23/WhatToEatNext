import type { ZodiacSign } from '../types/astrology';
import { ZodiacAffinity, DEFAULT_ZODIAC_AFFINITY } from '../types/zodiacAffinity';
import { ElementalProperties } from '../types/alchemy';

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
 * @returns The current zodiac sign
 */
export function getCurrentZodiacSign(): ZodiacSign {
  return getZodiacSign(new Date());
}

/**
 * Convert any string to a valid ZodiacSign if possible
 * @param zodiac String representing a zodiac sign
 * @returns A valid ZodiacSign or 'aries' as default
 */
export function toZodiacSign(zodiac: string | null | undefined): ZodiacSign {
  if (!zodiac) return 'aries';
  
  const validSigns = [
    'aries', 'taurus', 'gemini', 'cancer',
    'leo', 'virgo', 'libra', 'scorpio',
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];
  
  const normalized = zodiac.toLowerCase();
  return validSigns.find(sign => sign.toLowerCase() === normalized) as ZodiacSign || 'aries';
}

/**
 * Get zodiac sign from longitude value
 * @param longitude Longitude in degrees (0-360)
 * @returns Zodiac sign as a string
 */
export function getSignFromLongitude(longitude: number): ZodiacSign {
  const signs: ZodiacSign[] = [
    'aries', 'taurus', 'gemini', 'cancer',
    'leo', 'virgo', 'libra', 'scorpio',
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];
  const signIndex = Math.floor((longitude % 360) / 30);
  return signs[signIndex];
}

/**
 * Calculate zodiac sign based on birth date
 * @param date Date to calculate zodiac sign for
 * @returns Zodiac sign
 */
export function calculateZodiacSign(date: Date): ZodiacSign {
  return getZodiacSign(date);
}

/**
 * Get zodiac sign from a Date object
 * @param date Date to calculate zodiac sign for
 * @returns Zodiac sign
 */
export function getZodiacSign(date: Date): ZodiacSign {
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const day = date.getDate();
  
  // Determine zodiac sign based on month and day
  switch (month) {
    case 1: // January
      return day <= 19 ? 'capricorn' : 'aquarius';
    case 2: // February
      return day <= 18 ? 'aquarius' : 'pisces';
    case 3: // March
      return day <= 20 ? 'pisces' : 'aries';
    case 4: // April
      return day <= 19 ? 'aries' : 'taurus';
    case 5: // May
      return day <= 20 ? 'taurus' : 'gemini';
    case 6: // June
      return day <= 20 ? 'gemini' : 'cancer';
    case 7: // July
      return day <= 22 ? 'cancer' : 'leo';
    case 8: // August
      return day <= 22 ? 'leo' : 'virgo';
    case 9: // September
      return day <= 22 ? 'virgo' : 'libra';
    case 10: // October
      return day <= 22 ? 'libra' : 'scorpio';
    case 11: // November
      return day <= 21 ? 'scorpio' : 'sagittarius';
    case 12: // December
      return day <= 21 ? 'sagittarius' : 'capricorn';
    default:
      return 'aries'; // Default fallback, should never happen
  }
}

/**
 * Get the element associated with a zodiac sign
 * @param sign Zodiac sign
 * @returns Element ('Fire', 'Earth', 'Air', or 'Water')
 */
export function getElementForZodiac(sign: ZodiacSign): 'Fire' | 'Earth' | 'Air' | 'Water' {
  return getElementForZodiacSign(sign);
}

/**
 * Get element for a zodiac sign
 * @param sign Zodiac sign
 * @returns Element ('Fire', 'Earth', 'Air', or 'Water')
 */
export function getElementForZodiacSign(sign: ZodiacSign): 'Fire' | 'Earth' | 'Air' | 'Water' {
  switch (sign.toLowerCase() as ZodiacSign) {
    case 'aries':
    case 'leo':
    case 'sagittarius':
      return 'Fire';
    
    case 'taurus':
    case 'virgo':
    case 'capricorn':
      return 'Earth';
    
    case 'gemini':
    case 'libra':
    case 'aquarius':
      return 'Air';
    
    case 'cancer':
    case 'scorpio':
    case 'pisces':
      return 'Water';
    
    default:
      return 'Fire'; // Default fallback
  }
}

/**
 * Get the elemental influence of a zodiac sign
 * @param sign Zodiac sign
 * @returns Elemental properties with the sign's element boosted
 */
export function getZodiacElementalInfluence(sign: ZodiacSign): ElementalProperties {
  const element = getElementForZodiacSign(sign);
  
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
 * Get the modality of a zodiac sign
 * @param sign Zodiac sign
 * @returns Modality ('Cardinal', 'Fixed', or 'Mutable')
 */
export function getModalityForZodiac(sign: ZodiacSign): 'Cardinal' | 'Fixed' | 'Mutable' {
  return getModalityForZodiacSign(sign);
}

/**
 * Get modality for a zodiac sign
 * @param sign Zodiac sign
 * @returns Modality ('Cardinal', 'Fixed', or 'Mutable')
 */
export function getModalityForZodiacSign(sign: ZodiacSign): 'Cardinal' | 'Fixed' | 'Mutable' {
  switch (sign.toLowerCase() as ZodiacSign) {
    case 'aries':
    case 'cancer':
    case 'libra':
    case 'capricorn':
      return 'Cardinal';
    
    case 'taurus':
    case 'leo':
    case 'scorpio':
    case 'aquarius':
      return 'Fixed';
    
    case 'gemini':
    case 'virgo':
    case 'sagittarius':
    case 'pisces':
      return 'Mutable';
    
    default:
      return 'Cardinal'; // Default fallback
  }
}

/**
 * Get the ruling planet for a zodiac sign
 * @param sign Zodiac sign
 * @returns Ruling planet
 */
export function getRulingPlanetForZodiacSign(sign: ZodiacSign): string {
  switch (sign.toLowerCase() as ZodiacSign) {
    case 'aries': return 'Mars';
    case 'taurus': return 'venus';
    case 'gemini': return 'mercury';
    case 'cancer': return 'Moon';
    case 'leo': return 'sun';
    case 'virgo': return 'mercury';
    case 'libra': return 'venus';
    case 'scorpio': return 'Pluto'; // Modern ruler, traditionally Mars
    case 'sagittarius': return 'Jupiter';
    case 'capricorn': return 'Saturn';
    case 'aquarius': return 'Uranus'; // Modern ruler, traditionally Saturn
    case 'pisces': return 'Neptune'; // Modern ruler, traditionally Jupiter
    default: return 'sun'; // Default fallback
  }
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
    // Base affinity from primary element - elements are most harmonious with themselves
    result[sign as ZodiacSign] = elementalProperties[element] * 0.7;
    
    // Add smaller contributions from other elements based on compatibility
    const otherElements = Object.keys(elementalProperties).filter(e => e !== element) as Array<keyof ElementalProperties>;
    
    otherElements.forEach(otherElement => {
      // Get compatibility between elements
      const compatibility = getElementalCompatibility(element, otherElement);
      result[sign as ZodiacSign] += elementalProperties[otherElement] * compatibility * 0.2;
    });
    
    // Apply modality boost if primary sign is provided
    if (primaryZodiacSign) {
      const signModality = getModalityForZodiacSign(sign as ZodiacSign);
      const primaryModality = getModalityForZodiacSign(primaryZodiacSign);
      
      // Apply hierarchical modality-element affinities
      if (signModality === primaryModality) {
        // Boost affinity for signs with the same modality
        result[sign as ZodiacSign] += 0.2;
      } else {
        // Apply hierarchical cross-modality affinities
        result[sign as ZodiacSign] += 0.1;
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
 * Implements the updated elemental harmony rules where elements are most harmonious with themselves
 * 
 * @param element1 First element
 * @param element2 Second element
 * @returns Compatibility value between 0 and 1
 */
function getElementalCompatibility(
  element1: keyof ElementalProperties, 
  element2: keyof ElementalProperties
): number {
  // Same element has highest compatibility
  if (element1 === element2) {
    return 0.9; // Same element has high compatibility
  }
  
  // All different element combinations have good compatibility
  // since each element brings its own unique qualities
  return 0.7; // Different elements have good compatibility - they work together
}

/**
 * Check if two zodiac signs are compatible based on element
 * @param sign1 First zodiac sign
 * @param sign2 Second zodiac sign
 * @returns Compatibility value between 0 and 1
 */
export function getZodiacCompatibility(sign1: ZodiacSign, sign2: ZodiacSign): number {
  const element1 = getElementForZodiacSign(sign1);
  const element2 = getElementForZodiacSign(sign2);
  
  // Same sign has high compatibility
  if (sign1 === sign2) {
    return 0.9;
  }
  
  // Same element has good compatibility
  if (element1 === element2) {
    return 0.8;
  }
  
  // Following Elemental Logic Principles, all element combinations have 
  // good compatibility (at least 0.7)
  return 0.7;
} 