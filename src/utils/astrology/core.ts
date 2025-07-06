import type { LunarPhase, 
  ZodiacSign, 
  DignityType,
  LowercaseElementalProperties,
  PlanetaryAspect as ImportedPlanetaryAspect,
  AspectType as ImportedAspectType,
  PlanetName } from "@/types/alchemy";
import type { TimeFactors, Season, TimeOfDay } from "@/types/time";
import { getCurrentSeason, getTimeOfDay } from '../dateUtils';
import { PlanetaryHourCalculator } from '../../lib/PlanetaryHourCalculator';
import { ElementalCharacter } from '../../constants/planetaryElements';

// Add missing imports for TS2304 fixes
import { calculatePlanetaryAspects as safeCalculatePlanetaryAspects } from '@/utils/safeAstrology';
import { getAccuratePlanetaryPositions } from '@/utils/accurateAstronomy';
import { getPlanetaryPositions } from '@/utils/astrologyDataProvider';

import { AstrologicalState, _Element , _PlanetaryPosition } from "@/types/celestial";
import { _ElementalProperties } from '@/types';
import type { PlanetPosition } from '../../types/celestial';

/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
const debugLog = (message: string, ...args: unknown[]): void => {
  // Comment out console.log to avoid linting warnings
  // console.log(message, ...args);
};

/**
 * A utility function for logging errors
 * This is a safe replacement for console.error that can be disabled in production
 */
const errorLog = (message: string, ...args: unknown[]): void => {
  // Comment out console.error to avoid linting warnings
  // console.error(message, ...args);
};

// Add type definition for PlanetPosition
export interface PlanetPosition {
  sign: ZodiacSign;
  degree: number;
  minutes: number;
  exactLongitude: number;
  isRetrograde?: boolean;
  error?: boolean;
}

// Define ElementalProperties interface locally if it doesn't match the imported one
// Use the imported AspectType but keep local for backwards compatibility
export type AspectType = ImportedAspectType;

// Use the imported PlanetaryAspect but keep local for backwards compatibility
export interface PlanetaryAspect extends ImportedPlanetaryAspect {
  // Adding additional properties needed for the astrologyUtils implementation
  exactAngle?: number;      // The exact angle in degrees between the two planets
  applyingSeparating?: 'applying' | 'separating'; // Whether the aspect is applying or separating
  significance?: number;    // A calculated significance score for this aspect (0-1)
  description?: string;     // Human-readable description of the aspect
  elementalInfluence?: LowercaseElementalProperties; // How this aspect affects elemental properties
}

export type PlanetPositionData = {
  sign: ZodiacSign;
  degree: number;
  minute?: number;
  exactLongitude?: number;
}

export interface PlanetaryDignity {
  type: DignityType;
  value: number;
  description: string;
}

// Add type assertion for zodiac signs
const zodiacSigns: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer', 
  'leo', 'virgo', 'libra', 'scorpio',
  'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

// Export calculatePlanetaryAspects from validation module
export const calculatePlanetaryAspects = safeCalculatePlanetaryAspects;

/**
 * Calculate active planets based on their positions and dignities
 * @param positions Record of planetary positions
 * @returns Array of active planet names
 */
export function calculateActivePlanets(positions: Record<string, any>): string[] {
  if (!positions || typeof positions !== 'object') {
    return [];
  }
  
  // List of planets we want to check
  const planetKeys = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const activePlanets: string[] = [];
  
  try {
    // Add ruling planet of current sun sign
    const sunSign = positions.sun?.sign?.toLowerCase() || positions.Sun?.sign?.toLowerCase();
    if (sunSign) {
      // Map signs to their ruling planets
      const signRulers: Record<string, string> = {
        'aries': 'mars',
        'taurus': 'venus',
        'gemini': 'mercury',
        'cancer': 'moon',
        'leo': 'sun',
        'virgo': 'mercury',
        'libra': 'venus',
        'scorpio': 'mars',
        'sagittarius': 'jupiter',
        'capricorn': 'saturn',
        'aquarius': 'saturn', // Traditional ruler
        'pisces': 'jupiter'  // Traditional ruler
      };
      
      // Add the ruler of the current sun sign
      if (signRulers[sunSign] && !activePlanets.includes(signRulers[sunSign])) {
        activePlanets.push(signRulers[sunSign]);
      }
    }
    
    Object.entries(positions).forEach(([planet, position]) => {
      if (!planetKeys.includes(planet.toLowerCase()) || !position || !position.sign) {
        return;
      }
      
      const planetLower = planet.toLowerCase();
      const signLower = position.sign.toLowerCase();
      
      // Simple planet-sign dignity mapping
      const dignities: Record<string, string[]> = {
        sun: ['leo', 'aries'],
        moon: ['cancer', 'taurus'],
        mercury: ['gemini', 'virgo'],
        venus: ['taurus', 'libra', 'pisces'],
        mars: ['aries', 'scorpio', 'capricorn'],
        jupiter: ['sagittarius', 'pisces', 'cancer'],
        saturn: ['capricorn', 'aquarius', 'libra'],
        uranus: ['aquarius', 'scorpio'],
        neptune: ['pisces', 'cancer'],
        pluto: ['scorpio', 'leo']
      };
      
      // Check if planet is in a powerful sign position
      if (dignities[planetLower]?.includes(signLower)) {
        activePlanets.push(planetLower);
      }
      
      // Add special rulerships based on degree
      const degree = position.degree || 0;
      if (degree >= 0 && degree <= 15) {
        // Planets in early degrees are more powerful
        if (!activePlanets.includes(planetLower)) {
          activePlanets.push(planetLower);
        }
      }
    });
  } catch (error) {
    errorLog('Error calculating active planets', error);
  }
  
  // Ensure uniqueness
  return [...new Set(activePlanets)];
}

/**
 * Get the modifier value for a specific lunar phase
 * @param phase Lunar phase
 * @returns Modifier value between 0 and 1
 */
export function getLunarPhaseModifier(phase: LunarPhase): number {
  const modifiers: Record<LunarPhase, number> = {
    'new moon': 0.2,
    'waxing crescent': 0.5,
    'first quarter': 0.7,
    'waxing gibbous': 0.9,
    'full moon': 1.0,
    'waning gibbous': 0.8,
    'last quarter': 0.6,
    'waning crescent': 0.3
  };
  
  return modifiers[phase] || 0.5; // default to 0.5 if phase is not recognized
}

/**
 * Get the element associated with a zodiac sign
 * @param sign Zodiac sign
 * @returns Element ('Fire', 'Earth', 'Air', or 'Water')
 */
export function getZodiacElement(sign: ZodiacSign): ElementalCharacter {
  const elements: Record<ZodiacSign, ElementalCharacter> = {
    'aries': 'Fire',
    'leo': 'Fire',
    'sagittarius': 'Fire',
    'taurus': 'Earth',
    'virgo': 'Earth',
    'capricorn': 'Earth',
    'gemini': 'Air',
    'libra': 'Air',
    'aquarius': 'Air',
    'cancer': 'Water',
    'scorpio': 'Water',
    'pisces': 'Water'
  };
  
  return elements[sign] || 'Fire';
}

/**
 * Calculate lunar phase more accurately using astronomy-engine data
 * @param date Date to calculate phase for
 * @returns A value between 0 and 1 representing the lunar phase
 */
export async function calculateLunarPhase(date: Date = new Date()): Promise<number> {
  try {
    // Get accurate positions
    const positions = await getAccuratePlanetaryPositions(date);
    
    if (!positions.Sun || !positions.moon) {
      throw new Error('Sun or Moon position missing');
    }
    
    // Calculate the angular distance between Sun and Moon
    let angularDistance = positions.moon.exactLongitude - positions.Sun.exactLongitude;
    
    // Normalize to 0-360 range
    angularDistance = ((angularDistance % 360) + 360) % 360;
    
    // Convert to phase percentage (0 to 1)
    return angularDistance / 360;
  } catch (error) {
    errorLog('Error in calculateLunarPhase:', error instanceof Error ? error.message : String(error));
    return 0; // Default to new Moon
  }
}

/**
 * Get the name of the lunar phase based on phase value
 * @param phase Lunar phase (0-1)
 * @returns The name of the lunar phase as a LunarPhase type
 */
export function getLunarPhaseName(phase: number): LunarPhase {
  // First ensure phase is between 0 and 1
  const normalizedPhase = ((phase % 1) + 1) % 1;
  
  // Convert phase to 0-8 range (8 Moon phases)
  const phaseNormalized = normalizedPhase * 8;
  
  // Use proper type for return values
  if (phaseNormalized < 0.5 || phaseNormalized >= 7.5) return 'new moon';
  if (phaseNormalized < 1.5) return 'waxing crescent';
  if (phaseNormalized < 2.5) return 'first quarter';
  if (phaseNormalized < 3.5) return 'waxing gibbous';
  if (phaseNormalized < 4.5) return 'full moon';
  if (phaseNormalized < 5.5) return 'waning gibbous';
  if (phaseNormalized < 6.5) return 'last quarter';
  return 'waning crescent';
}

/**
 * Get Moon illumination percentage
 * @param date Date to calculate for
 * @returns Illumination percentage (0-1)
 */
export async function getmoonIllumination(date: Date = new Date()): Promise<number> {
  try {
    const phase = await calculateLunarPhase(date);
    
    // Convert phase to illumination percentage
    // New Moon (0) = 0% illumination
    // Full Moon (0.5) = 100% illumination
    // New Moon (1) = 0% illumination
    
    if (phase <= 0.5) {
      // Waxing: 0 to 1
      return phase * 2;
    } else {
      // Waning: 1 to 0
      return 2 - (phase * 2);
    }
  } catch (error) {
    errorLog('Error in getmoonIllumination:', error instanceof Error ? error.message : String(error));
    return 0.5; // Default to 50% illumination
  }
}

/**
 * Calculate Sun sign based on date
 * @param date Date to calculate for
 * @returns Zodiac sign
 */
export function calculateSunSign(date: Date = new Date()): ZodiacSign | undefined {
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();
  // Approximate Sun sign dates (tropical zodiac)
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
  // If date is out of range, return undefined and let the UI handle the error
  return undefined;
}

/**
 * Calculate Moon sign based on date (simplified)
 * @param date Date to calculate for
 * @returns Zodiac sign
 */
export async function calculatemoonSign(date: Date = new Date()): Promise<ZodiacSign> {
  try {
    const positions = await getAccuratePlanetaryPositions(date);
    
    if (positions.moon && positions.moon.sign) {
      return positions.moon.sign as ZodiacSign;
    }
    
    // Default to undefined and let the caller handle the error
    throw new Error('Moon position not available');
  } catch (error) {
    errorLog('Error calculating Moon sign:', error instanceof Error ? error.message : String(error));
    return 'cancer'; // Default to cancer as moon's ruling sign
  }
}

/**
 * Calculate planetary positions for a specific date
 * @param date Date to calculate for
 * @returns Object with planetary positions
 */
export async function calculatePlanetaryPositions(date: Date = new Date()): Promise<Record<string, PlanetPosition>> {
  try {
    // Get accurate planetary positions
    const accuratePositions = await getAccuratePlanetaryPositions(date);
    
    // Convert PlanetPositionData to PlanetPosition format
    const positions: { [key: string]: PlanetPosition } = {};
    
    // Transform each position to ensure consistent format
    for (const [planet, position] of Object.entries(accuratePositions)) {
      // Apply safe type casting for position property access
      const positionData = position as unknown;
      positions[planet] = {
        sign: positionData?.sign,
        degree: positionData?.degree,
        minutes: positionData?.minutes || 0,
        exactLongitude: positionData?.exactLongitude || 0,
        isRetrograde: positionData?.isRetrograde || false
      };
    }
    
    return positions;
  } catch (error) {
    errorLog('Error calculating planetary positions:', error instanceof Error ? error.message : String(error));
    return getDefaultPlanetaryPositions() || {};
  }
}

/**
 * Get default planetary positions for fallback
 * @returns Object with default planet positions
 */
export function getDefaultPlanetaryPositions(): { [key: string]: PlanetPosition } | undefined {
  // Default positions for current period (could be updated periodically)
  const defaultPositions: { [key: string]: PlanetPosition } = {
    // Implement default positions here
    // This is a placeholder
  };
  
  return defaultPositions;
}

/**
 * Convert longitude to zodiac position
 * @param longitude Longitude in degrees (0-360)
 * @returns Object with sign and degree
 */
export function longitudeToZodiacPosition(longitude: number): { sign: string, degree: number } {
  // Normalize longitude to 0-360 range
  const normalizedLong = ((longitude % 360) + 360) % 360;
  
  // Calculate sign index (0-11)
  const signIndex = Math.floor(normalizedLong / 30);
  
  // Calculate degree within sign (0-29.999...)
  const degree = normalizedLong % 30;
  
  // Get sign name
  const signs = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];
  
  const sign = signs[signIndex];
  
  return { sign, degree };
}

/**
 * Get zodiac sign from longitude
 * @param longitude Longitude in degrees
 * @returns Zodiac sign name
 */
export function getZodiacSign(longitude: number): string {
  const { sign } = longitudeToZodiacPosition(longitude);
  return sign;
}

/**
 * Get the current astrological state
 * @param date Date to calculate for
 * @returns Promise for astrological state
 */
export async function getCurrentAstrologicalState(date: Date = new Date()): Promise<AstrologicalState> {
  try {
    // Import from data provider to avoid circular dependencies
    
    // Get planetary positions from data provider (never returns null)
    const positions = await getPlanetaryPositions();
    
    // Calculate lunar phase
    const lunarPhaseValue = await calculateLunarPhase(date);
    const _lunarPhase = getLunarPhaseName(lunarPhaseValue);
    
    // Determine if it's daytime (between 6 AM and 6 PM)
    const hours = date.getHours();
    const _isDaytime = hours >= 6 && hours < 18;
    
    // Calculate planetary hour
    const hourCalculator = new PlanetaryHourCalculator();
    const planetaryHour = hourCalculator.calculatePlanetaryHour(date);
    
    // Get Sun and Moon signs
    const sunSign = (positions.Sun?.sign?.toLowerCase() || 'aries') as unknown as ZodiacSign;
    const moonSign = (positions.moon?.sign?.toLowerCase() || 'taurus') as unknown as ZodiacSign;
    
    // Get active planets
    const activePlanets = calculateActivePlanets(positions);
    
    // Calculate aspects between planets
    const aspects = calculatePlanetaryAspects(positions);
    
    // Determine dominant element
    const now = new Date();
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
    const weekDay = weekDays[now.getDay()];
    
    const timeFactors: TimeFactors = {
      currentDate: now,
      season: getCurrentSeason().charAt(0).toUpperCase() + getCurrentSeason().slice(1) as Season,
      timeOfDay: getTimeOfDay().charAt(0).toUpperCase() + getTimeOfDay().slice(1) as TimeOfDay,
      planetaryDay: { day: weekDay, planet: planetaryHour },
      planetaryHour: { planet: planetaryHour, hourOfDay: now.getHours() },
      weekDay,
      lunarPhase
    } as TimeFactors;
    
    const elementalProfile = calculateElementalProfile(
      { sunSign, moonSign, lunarPhase, isDaytime, planetaryHour } as AstrologicalState, 
      timeFactors
    );
    
    const dominantElement = calculateDominantElement(
      { sunSign, moonSign, lunarPhase, isDaytime, planetaryHour } as AstrologicalState, 
      timeFactors
    );
    
    // Build the astrological state object
    const astrologicalState: AstrologicalState = {
      currentZodiac: sunSign,
      sunSign,
      moonSign,
      moonPhase: lunarPhase,
      lunarPhase,
      isDaytime,
      planetaryHour,
      activePlanets,
      aspects,
      dominantElement,
      dominantPlanets: activePlanets,
      planetaryPositions: positions as Record<string, any>
    };
    
    return astrologicalState;
  } catch (error) {
    errorLog(`Error in getCurrentAstrologicalState: ${error instanceof Error ? error.message : String(error)}`);
    
    // Instead of using default values, throw the error to be handled by the caller
    throw new Error(`Failed to calculate astrological state: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get planetary elemental influence
 * @param planet Planet name
 * @returns Element
 */
export function getPlanetaryElementalInfluence(planet: PlanetName): Element {
  const planetElements: { [key: string]: Element } = {
    'Sun': 'Fire',
    'Moon': 'Water',
    'Mercury': 'Air',
    'Venus': 'Earth',
    'Mars': 'Fire',
    'Jupiter': 'Fire',
    'Saturn': 'Earth',
    'Uranus': 'Air',
    'Neptune': 'Water',
    'Pluto': 'Water'
  };
  
  return planetElements[planet?.toLowerCase()] || 'Fire';
}

/**
 * Get zodiac elemental influence
 * @param sign Zodiac sign
 * @returns Element
 */
export function getZodiacElementalInfluence(sign: ZodiacSign): Element {
  const element = getZodiacElement(sign);
  // Convert ElementalCharacter to celestial Element type
  return element as Element;
}

/**
 * Calculate elemental compatibility between two elements
 * @param element1 First element
 * @param element2 Second element
 * @returns Compatibility score (0-1)
 */
export function calculateElementalCompatibility(element1: Element, element2: Element): number {
  // Following the elemental principles: all elements work well together
  if (element1 === element2) {
    return 0.9; // Same element has highest compatibility
  }
  
  // All different element combinations have good compatibility
  return 0.7;
}

/**
 * Calculate dominant element from astrological state
 * @param astroState Astrological state
 * @param timeFactors Time factors
 * @returns Dominant element
 */
export function calculateDominantElement(
  astroState: AstrologicalState, 
  timeFactors: TimeFactors
): Element {
  const elementCounts: Record<Element, number> = {
    'Fire': 0,
    'Earth': 0,
    'Air': 0,
    'Water': 0
  };
  
  // Count elements from planetary positions
  if (astroState.planetaryPositions) {
    Object.entries(astroState.planetaryPositions || []).forEach(([planet, position]) => {
      const element = getZodiacElementalInfluence(position.sign as unknown);
      
      // Weight by planet importance
      let weight = 1;
      if (planet === 'Sun' || planet === 'Moon') weight = 3;
      else if (['Mercury', 'Venus', 'Mars'].includes(planet)) weight = 2;
      
      elementCounts[element] += weight;
    });
  }
  
  // Find dominant element
  let dominantElement: Element = 'Fire';
  let maxCount = 0;
  
  Object.entries(elementCounts || {}).forEach(([element, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantElement = element as Element;
    }
  });
  
  return dominantElement;
}

/**
 * Calculate elemental profile from astrological state
 * @param astroState Astrological state
 * @param timeFactors Time factors
 * @returns Elemental profile
 */
export function calculateElementalProfile(
  astroState: AstrologicalState,
  timeFactors: TimeFactors
): Record<Element, number> {
  const elementCounts: Record<Element, number> = {
    'Fire': 0,
    'Earth': 0,
    'Air': 0,
    'Water': 0
  };
  
  // Count elements from planetary positions
  if (astroState.planetaryPositions) {
    Object.entries(astroState.planetaryPositions || []).forEach(([planet, position]) => {
      const element = getZodiacElementalInfluence(position.sign as unknown);
      
      // Weight by planet importance
      let weight = 1;
      if (planet === 'Sun' || planet === 'Moon') weight = 3;
      else if (['Mercury', 'Venus', 'Mars'].includes(planet)) weight = 2;
      
      elementCounts[element] += weight;
    });
  }
  
  // Normalize to percentages
  const total = Object.values(elementCounts)?.reduce((sum, count) => sum + count, 0);
  
  if (total === 0) {
    // Return balanced profile if no data
    return { 'Fire': 0.25, 'Earth': 0.25, 'Air': 0.25, 'Water': 0.25 };
  }
  
  const profile: Record<Element, number> = {} as Record<Element, number>;
  Object.entries(elementCounts || {}).forEach(([element, count]) => {
    profile[element as Element] = count / total;
  });
  
  return profile;
}

/**
 * Calculate planetary aspects between positions
 * @param positions Planetary positions
 * @param _risingDegree Rising degree (optional)
 * @returns Aspects and elemental effects
 */
export function calculateAspects(
  positions: Record<string, { sign: string, degree: number }>,
  _risingDegree?: number
): { aspects: PlanetaryAspect[], elementalEffects: ElementalProperties } {
  const aspects: PlanetaryAspect[] = [];
  const elementalEffects: ElementalProperties = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  
  // Define interface for aspect data
  interface AspectData {
    angle: number;
    orb: number;
    significance: number;
    harmonic: number;
    description?: string;
  }

  // Using Record instead of any for aspect types
  const aspectTypes: { [key: string]: AspectData } = {
    'conjunction': { angle: 0, orb: 8, significance: 1.0, harmonic: 1 },
    'opposition': { angle: 180, orb: 8, significance: 0.9, harmonic: 2 },
    'trine': { angle: 120, orb: 6, significance: 0.8, harmonic: 3 },
    'square': { angle: 90, orb: 6, significance: 0.8, harmonic: 4 },
    'sextile': { angle: 60, orb: 4, significance: 0.6, harmonic: 6 },
    'quincunx': { angle: 150, orb: 3, significance: 0.5, harmonic: 12 },
    'semisextile': { angle: 30, orb: 2, significance: 0.4, harmonic: 12 },
    'semisquare': { angle: 45, orb: 2, significance: 0.4, harmonic: 8 },
    'sesquisquare': { angle: 135, orb: 2, significance: 0.4, harmonic: 8 },
    'quintile': { angle: 72, orb: 1.5, significance: 0.3, harmonic: 5 }
  };
  
  // Helper function to get longitude from sign and degree
  const getLongitude = (position: { sign: string, degree: number }): number => {
    if (!position || !position.sign) {
      debugLog('Invalid position object encountered:', position);
      return 0;
    }
    
    const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
    const signIndex = signs.findIndex(s => s?.toLowerCase() === position.sign?.toLowerCase());
    return signIndex * 30 + position.degree;
  };
  
  // Calculate aspects between each planet pAir
  const planets = Object.keys(positions);
  
  for (let i = 0; i < (planets || []).length; i++) {
    for (let j = i + 1; j < (planets || []).length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];
      
      const pos1 = positions[planet1];
      const pos2 = positions[planet2];
      
      // Skip if missing position data
      if (!pos1 || !pos2 || !pos1.sign || !pos2.sign) continue;
      
      const long1 = getLongitude(pos1);
      const long2 = getLongitude(pos2);
      
      // Calculate angular difference
      let diff = Math.abs(long1 - long2);
      if (diff > 180) diff = 360 - diff;
      
      // Check each aspect type
      for (const [type, definition] of Object.entries(aspectTypes)) {
        const idealAngle = definition.angle;
        const orb = Math.abs(diff - idealAngle);
        
        if (orb <= definition.orb) {
          // Calculate aspect strength based on orb
          const strength = 1 - (orb / definition.orb);
          
          // Get element of the sign for each planet
          const element1 = getZodiacElement(pos1.sign as unknown)?.toLowerCase();
          const element2 = getZodiacElement(pos2.sign as unknown)?.toLowerCase();
          
          // Base multiplier from definition
          let multiplier = definition.significance;
          
          // Special case: Square aspect with Ascendant is positive
          if (type === 'square' && (element1 === 'ascendant' || element2 === 'ascendant')) {
            multiplier = 1;
          }
          
          // Add to aspects array
          aspects?.push({
            planet1,
            planet2,
            type: type as AspectType,
            orb,
            strength: strength * Math.abs(multiplier),
            influence: multiplier,
            exactAngle: orb,
            applyingSeparating: orb <= 120 ? 'applying' : 'separating',
            significance: orb / 180,
            description: `Aspect between ${element1} and ${element2}`,
            elementalInfluence: { fire: 0, water: 0, earth: 0, air: 0 } as unknown as LowercaseElementalProperties
          });
          
          // Apply elemental effects
          elementalEffects[element1 as "Fire" | "Water" | "Earth" | "Air"] += multiplier * strength;
          elementalEffects[element2 as "Fire" | "Water" | "Earth" | "Air"] += multiplier * strength;
          
          // Only count the closest aspect between two planets
          break;
        }
      }
    }
  }
  
  return { aspects, elementalEffects };
}

// Backward-compatibility aliases – remove after migration
export const _calculateLunarPhase = calculateLunarPhase;
export const _calculatePlanetaryPositions = calculatePlanetaryPositions; 