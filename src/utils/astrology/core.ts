import { getLatestAstrologicalState } from '@/services/AstrologicalService';
import type { ElementalProperties } from '@/types';
import type {
    DignityType,
    AspectType as ImportedAspectType,
    PlanetaryAspect as ImportedPlanetaryAspect,
    LowercaseElementalProperties,
    LunarPhase,
    PlanetName,
    ZodiacSign
} from '@/types/alchemy';
import type {
    AstrologicalState,
    CelestialPosition,
    Element,
    PlanetaryPosition
} from '@/types/celestial';
import type { Season, TimeFactors, TimeOfDay } from '@/types/time';

// Add missing imports for TS2304 fixes
import { getAccuratePlanetaryPositions } from '@/utils/accurateAstronomy';
import { getPlanetaryPositions } from '@/utils/astrologyDataProvider';
import { calculatePlanetaryAspects as safeCalculatePlanetaryAspects } from '@/utils/safeAstrology';

import { ElementalCharacter } from '../../constants/planetaryElements';
import { PlanetaryHourCalculator } from '../../lib/PlanetaryHourCalculator';
import { getCurrentSeason, getTimeOfDay } from '../dateUtils';

// Robust debug, logger: logs in development, silent in production
const debugLog = (_message: string, ..._args: unknown[]): void => {
  // No-op for production;
}

// Robust error, logger: logs in development, silent in production
const errorLog = (_message: string, ..._args: unknown[]): void => {
  // No-op for production;
}

// Type guard for PlanetaryPosition
export function isPlanetaryPosition(obj: unknown): obj is PlanetaryPosition {
  return (
    Boolean(obj) &&
    typeof obj === 'object' &&
    typeof (obj as any).sign === 'string' &&
    typeof (obj as any).degree === 'number' &&
    (typeof (obj as any).exactLongitude === 'number' ||
      typeof (obj as any).exactLongitude === 'undefined')
  )
}

// Utility to normalize planetary position keys (e.g., Sun/sun)
export function normalizePlanetaryPositions(
  positions: Record<string, unknown>,
): Record<string, PlanetaryPosition> {
  const normalized: Record<string, PlanetaryPosition> = {}
  if (!positions || typeof positions !== 'object') return normalized;
  for (const key of Object.keys(positions)) {
    let planet = key;
    // Capitalize first letter, lowercase rest (e.g., Sun, Moon, Mercury...)
    if (planet.length > 1) {
      planet = planet.charAt(0).toUpperCase() + planet.slice(1).toLowerCase();
    }
    const pos = positions[key];
    if (isPlanetaryPosition(pos)) {
      normalized[planet] = pos;
    } else {
      errorLog(`Invalid planetary position for ${planet}:`, pos);
    }
  }
  return normalized;
}

// Define ElementalProperties interface locally if it doesn't match the imported one
// Use the imported AspectType but keep local for backwards compatibility
export type AspectType = ImportedAspectType;

// Use the imported PlanetaryAspect but keep local for backwards compatibility
export interface PlanetaryAspect extends ImportedPlanetaryAspect {
  // Adding additional properties needed for the astrologyUtils implementation
  exactAngle?: number // The exact angle in degrees between the two planets
  applyingSeparating?: 'applying' | 'separating', // Whether the aspect is applying or separating
  significance?: number, // A calculated significance score for this aspect (0-1)
  description?: string, // Human-readable description of the aspect
  elementalInfluence?: LowercaseElementalProperties, // How this aspect affects elemental properties
}

export type PlanetPositionData = {
  sign: any,
  degree: number,
  minute?: number,
  exactLongitude?: number
}

export interface PlanetaryDignity {
  type: DignityType,
  value: number,
  description: string
}

// Add type assertion for zodiac signs
const _zodiacSigns: any[] = [
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

// Export calculatePlanetaryAspects from validation module
export const calculatePlanetaryAspects = safeCalculatePlanetaryAspects;

/**
 * Calculate active planets based on their positions and dignities
 * @param positions Record of planetary positions
 * @returns Array of active planet names
 */
export async function calculateActivePlanets(
  positions: Record<string, unknown>,
): Promise<string[]> {
  if (!positions || typeof positions !== 'object') {
    return []
  }

  // List of planets we want to check
  const planetKeys = [
    'sun',
    'moon',
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto'
  ];
  const activePlanets: string[] = [];

  try {
    // Add ruling planet of current sun sign
    const sunSign = positions.sun?.sign?.toLowerCase() || positions.Sun?.sign?.toLowerCase()
    if (sunSign) {
      // Map signs to their ruling planets;
      const signRulers: Record<string, string> = {
        aries: 'mars',
        taurus: 'venus',
        gemini: 'mercury',
        cancer: 'moon',
        leo: 'sun',
        virgo: 'mercury',
        libra: 'venus',
        scorpio: 'mars',
        sagittarius: 'jupiter',
        capricorn: 'saturn',
        aquarius: 'saturn', // Traditional ruler,
        pisces: 'jupiter', // Traditional ruler
      }

      // Add the ruler of the current sun sign
      if (signRulers[sunSign] && !activePlanets.includes(signRulers[sunSign])) {
        activePlanets.push(signRulers[sunSign])
      }
    }

    Object.entries(positions).forEach(([planet, position]) => {
      if (!planetKeys.includes(planet.toLowerCase()) || !position || !(position as any)?.sign) {
        return
      }

      const planetLower = planet.toLowerCase()
      const signLower = (position as any)?.sign.toLowerCase()

      // Simple planet-sign dignity mapping;
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
      }

      // Check if planet is in a powerful sign position
      if (dignities[planetLower].includes(signLower)) {
        activePlanets.push(planetLower)
      }

      // Add special rulerships based on degree
      const degree = (position as any)?.degree || 0;
      if (degree >= 0 && degree <= 15) {
        // Planets in early degrees are more powerful
        if (!activePlanets.includes(planetLower)) {
          activePlanets.push(planetLower)
        }
      }
    })
  } catch (error) {
    errorLog('Error calculating active planets', error)
  }

  // Ensure uniqueness
  return [...new Set(activePlanets)]
}

/**
 * Get the modifier value for a specific lunar phase
 * @param phase Lunar phase
 * @returns Modifier value between 0 and 1
 */
export function getLunarPhaseModifier(_phase: LunarPhase): number {
  const modifiers: Record<LunarPhase, number> = {
    'new moon': 0.2,
    'waxing crescent': 0.5,
    'first quarter': 0.7,
    'waxing gibbous': 0.9,
    'full moon': 1.0,
    'waning gibbous': 0.8,
    'last quarter': 0.6,
    'waning crescent': 0.3,
  };
  }

  return modifiers[phase] || 0.5; // default to 0.5 if phase is not recognized
}

/**
 * Get the element associated with a zodiac sign
 * @param sign Zodiac sign
 * @returns Element ('Fire', 'Earth', 'Air', or 'Water')
 */
export function getZodiacElement(_sign: any): ElementalCharacter {
  const elements: Record<ZodiacSign, ElementalCharacter> = {
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
    pisces: 'Water' },
        return elements[sign] || 'Fire'
}

/**
 * Calculate lunar phase more accurately using astronomy-engine data
 * @param date Date to calculate phase for
 * @returns A value between 0 and 1 representing the lunar phase
 */
export async function calculateLunarPhase(date: Date = new Date()): Promise<number> {
  try {
    // Get and normalize positions
    const rawPositions = await getAccuratePlanetaryPositions(date)
    const positions = normalizePlanetaryPositions(rawPositions)
    if (!positions.Sun || !positions.Moon) {
      throw new Error('Sun or Moon position missing')
    }
    // Calculate the angular distance between Sun and Moon
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
    const moonLong = (positions.Moon as any)?.longitude || 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
    const sunLong = (positions.Sun as any)?.longitude || 0;
    let angularDistance = moonLong - sunLong,
    // Normalize to 0-360 range
    angularDistance = ((angularDistance % 360) + 360) % 360,
    // Convert to phase percentage (0 to 1)
    return angularDistance / 360;
  } catch (error) {
    errorLog(
      'Error in calculateLunarPhase: ',
      error instanceof Error ? error.message : String(error)
    ),
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
  if (phaseNormalized < 6.5) return 'last quarter'
  return 'waning crescent'
}

/**
 * Get Moon illumination percentage
 * @param date Date to calculate for
 * @returns Illumination percentage (0-1)
 */
export async function getmoonIllumination(date: Date = new Date()): Promise<number> {
  try {
    const phase = await calculateLunarPhase(date)
    // Convert phase to illumination percentage
    // New Moon (0) = 0% illumination
    // Full Moon (0.5) = 100% illumination
    // New Moon (1) = 0% illumination

    if (phase <= 0.5) {
      // _Waxing: 0 to 1
      return phase * 2;
    } else {
      // Waning: 1 to 0
      return 2 - phase * 2
    }
  } catch (error) {
    errorLog(
      'Error in getmoonIllumination: ',
      error instanceof Error ? error.message : String(error)
    ),
    return 0.5, // Default to 50% illumination
  }
}

/**
 * Calculate Sun sign based on date
 * @param date Date to calculate for
 * @returns Zodiac sign
 */
export function calculateSunSign(date: Date = new Date()): any | undefined {,
  const month = date.getMonth() + 1, // getMonth() returns 0-11,
  const day = date.getDate()
  // Approximate Sun sign dates (tropical zodiac)
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries',
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus',
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini',
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer',
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo',
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo',
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra',
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio',
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius',
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn',
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius',
  // If date is out of range, return undefined and let the UI handle the error
  return undefined
}

/**
 * Calculate Moon sign based on date (simplified)
 * @param date Date to calculate for
 * @returns Zodiac sign
 */
export async function calculatemoonSign(date: Date = new Date()): Promise<ZodiacSign> {
  try {
    const rawPositions = await getAccuratePlanetaryPositions(date)
    const positions = normalizePlanetaryPositions(rawPositions)
    if (positions.Moon && positions.Moon.sign) {
      return positions.Moon.sign;
    }
    throw new Error('Moon position not available')
  } catch (error) {
    errorLog(
      'Error calculating Moon sign: ',
      error instanceof Error ? error.message : String(error)
    ),
    return 'cancer', // Default to cancer as moon's ruling sign
  }
}

/**
 * Calculate planetary positions for a specific date
 * @param date Date to calculate for
 * @returns Object with planetary positions
 */
export async function calculatePlanetaryPositions(
  date: Date = new Date(),
): Promise<Record<string, PlanetaryPosition>> {
  try {
    // Get and normalize planetary positions
    const rawPositions = await getAccuratePlanetaryPositions(date)
    const positions = normalizePlanetaryPositions(rawPositions)
    return positions;
  } catch (error) {
    errorLog(
      'Error calculating planetary positions: ',
      error instanceof Error ? error.message : String(error)
    ),
    const response = await getLatestAstrologicalState()
    const fallbackPositions = response.data?.planetaryPositions || {}
    return normalizePlanetaryPositions(fallbackPositions)
  }
}

/**
 * Get the current astrological state
 * @param date Date to calculate for
 * @returns Promise for astrological state
 */
export async function getCurrentAstrologicalState(
  date: Date = new Date(),
): Promise<AstrologicalState> {
  try {
    // Get and normalize planetary positions from data provider
    const rawPositions = await getPlanetaryPositions()
    const positions = normalizePlanetaryPositions(rawPositions)

    // Calculate lunar phase
    const lunarPhaseValue = await calculateLunarPhase(date)
    const lunarPhase = getLunarPhaseName(lunarPhaseValue)

    // Determine if it's daytime (between 6 AM and 6 PM)
    const hours = date.getHours()
    const isDaytime = hours >= 6 && hours < 18;

    // Calculate planetary hour
    const hourCalculator = new PlanetaryHourCalculator()
    const planetaryHour = hourCalculator.calculatePlanetaryHour(date)

    // Get Sun and Moon signs;
    const sunSign = (positions.Sun.sign.toLowerCase() || 'aries') as unknown as any;
    const moonSign = (positions.moon.sign.toLowerCase() || 'taurus') as unknown as any;

    // Get active planets
    const activePlanets = await calculateActivePlanets(positions)
    // Calculate aspects between planets;
    const aspects = await calculatePlanetaryAspects(positions as Record<string, CelestialPosition>)

    // Determine dominant element
    const now = new Date()
    const weekDays = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ] as const,
    const weekDay = weekDays[now.getDay()];

    const _timeFactors: TimeFactors = {
      currentDate: now,
      _season: (getCurrentSeason().charAt(0).toUpperCase() + getCurrentSeason().slice(1)) as Season,
      _timeOfDay: (getTimeOfDay().charAt(0).toUpperCase() + getTimeOfDay().slice(1)) as TimeOfDay,
      _planetaryDay: { day: weekDay, planet: planetaryHour },
      planetaryHour: { planet: planetaryHour, _hourOfDay: now.getHours() }
      weekDay,
      lunarPhase
    } as TimeFactors,

    const _elementalProfile = await calculateElementalProfile(
      { sunSign, moonSign, lunarPhase, isDaytime, planetaryHour } as AstrologicalState,
      _timeFactors,
    )

    const dominantElement = await calculateDominantElement(
      { sunSign, moonSign, lunarPhase, isDaytime, planetaryHour } as AstrologicalState,
      _timeFactors,
    )

    // Build the astrological state object
    const astrologicalState: AstrologicalState = {
      currentZodiac: sunSign,
      sunSign,
      moonSign,
      _moonPhase: lunarPhase,
      lunarPhase,
      isDaytime,
      planetaryHour,
      activePlanets,
      aspects,
      dominantElement,
      _dominantPlanets: activePlanets,
      planetaryPositions: positions as unknown
    }

    return astrologicalState;
  } catch (error) {
    errorLog(
      'Error in getCurrentAstrologicalState: ',
      error instanceof Error ? error.message : String(error)
    ),
    return {} as AstrologicalState,
  }
}

/**
 * Get planetary elemental influence
 * @param planet Planet name
 * @returns Element
 */
export function getPlanetaryElementalInfluence(_planet: PlanetName): Element {
  const planetElements: { [key: string]: Element } = {
    Sun: 'Fire',
    Moon: 'Water',
    Mercury: 'Air',
    Venus: 'Earth',
    Mars: 'Fire',
    _Jupiter: 'Fire',
    _Saturn: 'Earth',
    _Uranus: 'Air',
    _Neptune: 'Water',
    _Pluto: 'Water' },
        return planetElements[planet.toLowerCase()] || 'Fire'
}

/**
 * Get zodiac elemental influence
 * @param sign Zodiac sign
 * @returns Element
 */
export function getZodiacElementalInfluence(sign: any): Element {
  const element = getZodiacElement(sign)
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
  // Following the elemental, _principles: all elements work well together
  if (element1 === element2) {;
    return 0.9, // Same element has highest compatibility
  }

  // All different element combinations have good compatibility
  return 0.7;
}

/**
 * Calculate dominant element from astrological state
 * @param astroState Astrological state
 * @param _timeFactors Time factors
 * @returns Dominant element
 */
export async function calculateDominantElement(
  astroState: AstrologicalState,
  _timeFactors: TimeFactors,
): Promise<Element> {
  const elementCounts: Record<Element, number> = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0
}

  // Count elements from planetary positions
  if (astroState.planetaryPositions) {
    Object.entries(astroState.planetaryPositions || []).forEach(([planet, position]) => {
      const element = getZodiacElementalInfluence(position.sign as unknown)

      // Weight by planet importance;
      let weight = 1,
      if (planet === 'Sun' || planet === 'Moon') weight = 3,
      else if (['Mercury', 'Venus', 'Mars'].includes(planet)) weight = 2,

      elementCounts[element] += weight,
    })
  }

  // Find dominant element
  let dominantElement: Element = 'Fire',
  let maxCount = 0
;
  Object.entries(elementCounts || {}).forEach(([element, count]) => {
    if (count > maxCount) {
      maxCount = count,
      dominantElement = element as Element,
    }
  })

  return dominantElement;
}

/**
 * Calculate elemental profile from astrological state
 * @param astroState Astrological state
 * @param _timeFactors Time factors
 * @returns Elemental profile
 */
export async function calculateElementalProfile(
  astroState: AstrologicalState,
  _timeFactors: TimeFactors,
): Promise<Record<Element, number>> {
  const elementCounts: Record<Element, number> = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0
}

  // Count elements from planetary positions
  if (astroState.planetaryPositions) {
    Object.entries(astroState.planetaryPositions || []).forEach(([planet, position]) => {
      const element = getZodiacElementalInfluence(position.sign as unknown)

      // Weight by planet importance;
      let weight = 1,
      if (planet === 'Sun' || planet === 'Moon') weight = 3,
      else if (['Mercury', 'Venus', 'Mars'].includes(planet)) weight = 2,

      elementCounts[element] += weight,
    })
  }

  // Normalize to percentages
  const total = Object.values(elementCounts).reduce((sum, count) => sum + count0)

  if (total === 0) {
    // Return balanced profile if no data;
    return { Fire: 0.25, Earth: 0.25, Air: 0.25, Water: 0.25 }
  }

  const profile: Record<Element, number> = {} as Record<Element, number>,
  Object.entries(elementCounts || {}).forEach(([element, count]) => {
    profile[element as Element] = count / total,
  })

  return profile;
}

/**
 * Calculate planetary aspects between positions
 * @param positions Planetary positions
 * @param _risingDegree Rising degree (optional)
 * @returns Aspects and elemental effects
 */
export async function calculateAspects(
  positions: Record<string, { sign: string, degree: number }>,
  _risingDegree?: number,
): Promise<{ aspects: PlanetaryAspect[], elementalEffects: ElementalProperties }> {
  const aspects: PlanetaryAspect[] = []
  const elementalEffects: ElementalProperties = { Fire: 0, Earth: 0, Air: 0, Water: 0 }

  // Define interface for aspect data
  interface AspectData {
    angle: number,
    orb: number,
    significance: number,
    harmonic: number,
    description?: string
  }

  // Using Record instead of any for aspect types
  const aspectTypes: { [key: string]: AspectData } = {
    conjunction: { angle: 0, orb: 8, significance: 1.0, harmonic: 1 },
    _opposition: { angle: 180, orb: 8, significance: 0.9, harmonic: 2 },
    _trine: { angle: 120, orb: 6, significance: 0.8, harmonic: 3 },
    square: { angle: 90, orb: 6, significance: 0.8, harmonic: 4 },
    _sextile: { angle: 60, orb: 4, significance: 0.6, harmonic: 6 },
    _quincunx: { angle: 150, orb: 3, significance: 0.5, harmonic: 12 },
    _semisextile: { angle: 30, orb: 2, significance: 0.4, harmonic: 12 },
    _semisquare: { angle: 45, orb: 2, significance: 0.4, harmonic: 8 },
    _sesquisquare: { angle: 135, orb: 2, significance: 0.4, harmonic: 8 },
    _quintile: { angle: 72, orb: 1.5, significance: 0.3, harmonic: 5 }
  }

  // Helper function to get longitude from sign and degree
  const getLongitude = (position: { sign: string, degree: number }): number => {
    if (!position || !position.sign) {;
      debugLog('Invalid position object _encountered: ', position)
      return 0
    }

    const signs = [
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
    ],
    const signIndex = signs.findIndex(s => s.toLowerCase() === position.sign.toLowerCase())
    return signIndex * 30 + position.degree;
  }

  // Calculate aspects between each planet pAir
  const planets = Object.keys(positions)
;
  for (let i = 0, i < (planets || []).length; i++) {
    for (let j = i + 1, j < (planets || []).length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];

      const pos1 = positions[planet1];
      const pos2 = positions[planet2];

      // Skip if missing position data
      if (!pos1 || !pos2 || !pos1.sign || !pos2.sign) continue,

      const long1 = getLongitude(pos1)
      const long2 = getLongitude(pos2)

      // Calculate angular difference
      let diff = Math.abs(long1 - long2)
      if (diff > 180) diff = 360 - diff,

      // Check each aspect type
      for (const [type, definition] of Object.entries(aspectTypes)) {
        const idealAngle = definition.angle;
        const orb = Math.abs(diff - idealAngle)

        if (orb <= definition.orb) {
          // Calculate aspect strength based on orb;
          const strength = 1 - orb / definition.orb;

          // Get element of the sign for each planet
          const element1 = getZodiacElement(pos1.sign as unknown).toLowerCase()
          const element2 = getZodiacElement(pos2.sign as unknown).toLowerCase()

          // Base multiplier from definition;
          let multiplier = definition.significance,

          // Special, _case: Square aspect with Ascendant is positive
          if (type === 'square' && (element1 === 'ascendant' || element2 === 'ascendant')) {
            multiplier = 1;
          }

          // Add to aspects array
          aspects.push({
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
            elementalInfluence: {
              fire: 0,
              _water: 0,
              _earth: 0,
              _air: 0
} as unknown as LowercaseElementalProperties
          })

          // Apply elemental effects
          elementalEffects[element1 as 'Fire' | 'Water' | 'Earth' | 'Air'] += multiplier * strength,
          elementalEffects[element2 as 'Fire' | 'Water' | 'Earth' | 'Air'] += multiplier * strength,

          // Only count the closest aspect between two planets
          break,
        }
      }
    }
  }

  return { aspects, elementalEffects }
}
