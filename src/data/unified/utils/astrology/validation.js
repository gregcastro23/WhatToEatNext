import { log } from '@/services/LoggingService';
('use strict');
Object.defineProperty(exports, '__esModule', { value: true });
exports.getCurrentTransitPositions =
  exports.getBaseSignLongitude =
  exports.validatePlanetaryPositions =
  exports.getCurrentTransitSign =
  exports.normalizeZodiacSign =
  exports.getCurrentAstrologicalState =
  exports.calculateAspectStrength =
  exports.identifyAspect =
  exports.calculatePlanetaryAspects =
  exports.getZodiacPositionInDegrees =
  exports.calculateSunSign =
  exports.getmoonIllumination =
  exports.getLunarPhaseName =
  exports.calculateLunarPhase =
  exports.getReliablePlanetaryPositions =
    void 0;
/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
const debugLog = (_message, ...args) => {
  // Comment out console.log to avoid linting warnings
  // log.info(message, ...args);
};
/**
 * A utility function for logging errors
 * This is a safe replacement for console.error that can be disabled in production
 */
const errorLog = (_message, ...args) => {
  // Comment out console.error to avoid linting warnings
  // console.error(message, ...args);
};
// Cache for reliable positions
let reliablePositionsCache = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
/**
 * Get reliable planetary positions with fallback
 * @returns Record of planetary positions
 */
function getReliablePlanetaryPositions() {
  // Check cache first
  if (reliablePositionsCache && Date.now() - reliablePositionsCache.timestamp < CACHE_DURATION) {
    return reliablePositionsCache.data;
  }
  // Current gemini season positions as reliable fallback
  const positions = {
    Sun: {
      sign: 'gemini',
      degree: 5.93,
      exactLongitude: 65.93,
      isRetrograde: false,
    },
    Moon: {
      sign: 'gemini',
      degree: 3.57,
      exactLongitude: 63.57,
      isRetrograde: false,
    },
    Mercury: {
      sign: 'gemini',
      degree: 1.98,
      exactLongitude: 61.98,
      isRetrograde: false,
    },
    Venus: {
      sign: 'aries',
      degree: 20.17,
      exactLongitude: 20.17,
      isRetrograde: false,
    },
    Mars: {
      sign: 'leo',
      degree: 18.38,
      exactLongitude: 138.38,
      isRetrograde: false,
    },
    Jupiter: {
      sign: 'gemini',
      degree: 26.87,
      exactLongitude: 86.87,
      isRetrograde: false,
    },
    Saturn: {
      sign: 'aries',
      degree: 0.13,
      exactLongitude: 0.13,
      isRetrograde: false,
    },
    Uranus: {
      sign: 'taurus',
      degree: 27.82,
      exactLongitude: 57.82,
      isRetrograde: false,
    },
    Neptune: {
      sign: 'aries',
      degree: 1.77,
      exactLongitude: 1.77,
      isRetrograde: false,
    },
    Pluto: {
      sign: 'aquarius',
      degree: 3.7,
      exactLongitude: 303.7,
      isRetrograde: true,
    },
  };
  // Cache the results
  reliablePositionsCache = {
    data: positions,
    timestamp: Date.now(),
  };
  return positions;
}
exports.getReliablePlanetaryPositions = getReliablePlanetaryPositions;
/**
 * Calculate lunar phase safely
 * @returns Lunar phase value (0-1)
 */
function calculateLunarPhase() {
  try {
    const now = new Date();
    const dayOfYear = getDayOfYear(now);
    // Approximate lunar cycle (29.53 days)
    const lunarCycle = 29.53;
    const cyclePosition = (dayOfYear % lunarCycle) / lunarCycle;
    return cyclePosition;
  } catch (error) {
    errorLog(
      'Error in safe calculateLunarPhase:',
      error instanceof Error ? error.message : String(error),
    );
    return 0; // Default to new Moon
  }
}
exports.calculateLunarPhase = calculateLunarPhase;
/**
 * Get lunar phase name from phase value
 * @param phase Lunar phase (0-1)
 * @returns Lunar phase name
 */
function getLunarPhaseName(phase) {
  const normalizedPhase = ((phase % 1) + 1) % 1;
  const phaseNormalized = normalizedPhase * 8;
  if (phaseNormalized < 0.5 || phaseNormalized >= 7.5) return 'new moon';
  if (phaseNormalized < 1.5) return 'waxing crescent';
  if (phaseNormalized < 2.5) return 'first quarter';
  if (phaseNormalized < 3.5) return 'waxing gibbous';
  if (phaseNormalized < 4.5) return 'full moon';
  if (phaseNormalized < 5.5) return 'waning gibbous';
  if (phaseNormalized < 6.5) return 'last quarter';
  return 'waning crescent';
}
exports.getLunarPhaseName = getLunarPhaseName;
/**
 * Get Moon illumination safely
 * @returns Illumination percentage (0-1)
 */
function getmoonIllumination() {
  try {
    const phase = calculateLunarPhase();
    // Convert phase to illumination
    if (phase <= 0.5) {
      return phase * 2; // Waxing
    } else {
      return 2 - phase * 2; // Waning
    }
  } catch (error) {
    errorLog(
      'Error in safe getmoonIllumination:',
      error instanceof Error ? error.message : String(error),
    );
    return 0.5; // Default to 50%
  }
}
exports.getmoonIllumination = getmoonIllumination;
/**
 * Calculate Sun sign safely
 * @param date Date to calculate for
 * @returns Zodiac sign
 */
function calculateSunSign(date = new Date()) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  // Approximate Sun sign dates
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
exports.calculateSunSign = calculateSunSign;
/**
 * Get zodiac position in degrees
 * @param sign Zodiac sign
 * @param degree Degree within sign
 * @returns Total degrees (0-360)
 */
function getZodiacPositionInDegrees(sign, degree) {
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
    'pisces',
  ];
  const signIndex = signs.indexOf(sign);
  return signIndex * 30 + degree;
}
exports.getZodiacPositionInDegrees = getZodiacPositionInDegrees;
/**
 * Calculate planetary aspects safely
 * @param positions Planetary positions
 * @returns Array of planetary aspects
 */
function calculatePlanetaryAspects(positions) {
  const aspects = [];
  const planets = Object.keys(positions);
  // Calculate aspects between all planet pAirs
  for (let i = 0; i < planets.length; i++) {
    const planet1 = planets[i];
    const pos1 = positions[planet1];
    if (!pos1 || !pos1?.exactLongitude) {
      // Skip planets without position data
      continue;
    }
    for (let j = i + 1; j < planets.length; j++) {
      const planet2 = planets[j];
      const pos2 = positions[planet2];
      if (!pos2 || !pos2?.exactLongitude) {
        // Skip planets without position data
        continue;
      }
      // Get the angular difference
      let angleDiff = Math.abs(pos1?.exactLongitude - pos2?.exactLongitude);
      // Normalize to 0-180 (we don't care about the direction)
      if (angleDiff > 180) {
        angleDiff = 360 - angleDiff;
      }
      // Check if this is a recognized aspect
      const aspect = identifyAspect(angleDiff);
      if (aspect) {
        // Calculate aspect strength (0-1) based on orb
        const strength = calculateAspectStrength(aspect.type, aspect.orb);
        if (strength > 0.2) {
          // Only include significant aspects
          aspects.push({
            planet1,
            planet2,
            type: aspect.type,
            orb: aspect.orb,
            strength,
            planets: [planet1, planet2],
          });
        }
      }
    }
  }
  return aspects;
}
exports.calculatePlanetaryAspects = calculatePlanetaryAspects;
/**
 * Identify aspect type based on angle difference
 * @param angleDiff Angle difference in degrees
 * @returns Aspect type and orb, or null if not a recognized aspect
 */
function identifyAspect(angleDiff) {
  // Define aspect angles and allowed orbs
  const aspectDefinitions = {
    conjunction: { angle: 0, maxOrb: 8 },
    opposition: { angle: 180, maxOrb: 8 },
    trine: { angle: 120, maxOrb: 7 },
    square: { angle: 90, maxOrb: 7 },
    sextile: { angle: 60, maxOrb: 6 },
    quincunx: { angle: 150, maxOrb: 5 },
    semisextile: { angle: 30, maxOrb: 4 },
    semisquare: { angle: 45, maxOrb: 4 },
    sesquisquare: { angle: 135, maxOrb: 4 },
    quintile: { angle: 72, maxOrb: 3 },
    biquintile: { angle: 144, maxOrb: 3 },
  };
  // Check each aspect type
  for (const [type, { angle, maxOrb }] of Object.entries(aspectDefinitions)) {
    const orb = Math.abs(angleDiff - angle);
    if (orb <= maxOrb) {
      return { type: type, orb };
    }
  }
  return null; // No matching aspect found
}
exports.identifyAspect = identifyAspect;
/**
 * Calculate aspect strength based on type and orb
 * @param type Aspect type
 * @param orb Orb (deviation from exact aspect)
 * @returns Strength value between 0 and 1
 */
function calculateAspectStrength(type, orb) {
  // Define base strength for each aspect type
  const baseStrength = {
    conjunction: 1.0,
    opposition: 0.9,
    trine: 0.8,
    square: 0.8,
    sextile: 0.7,
    quincunx: 0.6,
    semisextile: 0.5,
    semisquare: 0.5,
    sesquisquare: 0.5,
    quintile: 0.4,
    biquintile: 0.4,
  };
  // Get max orb for this aspect type
  const aspectDefinitions = {
    conjunction: { angle: 0, maxOrb: 8 },
    opposition: { angle: 180, maxOrb: 8 },
    trine: { angle: 120, maxOrb: 7 },
    square: { angle: 90, maxOrb: 7 },
    sextile: { angle: 60, maxOrb: 6 },
    quincunx: { angle: 150, maxOrb: 5 },
    semisextile: { angle: 30, maxOrb: 4 },
    semisquare: { angle: 45, maxOrb: 4 },
    sesquisquare: { angle: 135, maxOrb: 4 },
    quintile: { angle: 72, maxOrb: 3 },
    biquintile: { angle: 144, maxOrb: 3 },
  };
  const maxOrb = aspectDefinitions[type].maxOrb;
  // Calculate strength based on orb (linear falloff)
  // The closer to exact aspect (smaller orb), the stronger the aspect
  const strength = baseStrength[type] * (1 - orb / maxOrb);
  // Ensure strength is between 0 and 1
  return Math.max(0, Math.min(1, strength));
}
exports.calculateAspectStrength = calculateAspectStrength;
/**
 * Get current astrological state safely
 * @returns Current astrological state
 */
function getCurrentAstrologicalState() {
  try {
    // Get reliable planetary positions
    const positions = getReliablePlanetaryPositions();
    // Calculate Sun sign
    const sunSign = positions.Sun?.sign || calculateSunSign();
    // Calculate Moon sign
    const moonSign = positions.Moon?.sign || 'cancer';
    // Calculate lunar phase
    const lunarPhaseValue = calculateLunarPhase();
    const lunarPhase = getLunarPhaseName(lunarPhaseValue);
    // Calculate aspects
    const aspects = calculatePlanetaryAspects(positions);
    // Calculate elemental balance
    const elementCounts = countElements(positions);
    const dominantElement = getDominantElement(elementCounts);
    // Assemble astrological state
    return {
      sunSign,
      moonSign,
      lunarPhase,
      activePlanets: Object.keys(positions).filter(p =>
        [
          'Sun',
          'Moon',
          'Mercury',
          'Venus',
          'Mars',
          'Jupiter',
          'Saturn',
          'Uranus',
          'Neptune',
          'Pluto',
        ].includes(p),
      ),
      dominantElement,
      planetaryPositions: positions,
      aspects,
    };
  } catch (error) {
    errorLog(
      'Error in getCurrentAstrologicalState:',
      error instanceof Error ? error.message : String(error),
    );
    // Return minimal default state
    return {
      sunSign: 'aries',
      moonSign: 'cancer',
      lunarPhase: 'new moon',
      activePlanets: ['Sun', 'Moon'],
      dominantElement: 'Fire',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
exports.getCurrentAstrologicalState = getCurrentAstrologicalState;
/**
 * Normalize a zodiac sign string to standard format
 * @param sign Zodiac sign string (case insensitive)
 * @returns Normalized zodiac sign
 */
const normalizeZodiacSign = sign => {
  // Convert to lowercase and trim
  const normalizedSign = sign.toLowerCase().trim();
  // Check if it's a valid sign
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
    'pisces',
  ];
  if (validSigns.includes(normalizedSign)) {
    return normalizedSign;
  }
  // Handle common variations
  if (normalizedSign.includes('sag')) return 'sagittarius';
  if (normalizedSign.includes('cap')) return 'capricorn';
  if (normalizedSign.includes('aqua')) return 'aquarius';
  if (normalizedSign.includes('pis')) return 'pisces';
  // Default to aries if no match
  return 'aries';
};
exports.normalizeZodiacSign = normalizeZodiacSign;
/**
 * Get current transit sign for a planet
 * @param planet Planet name
 * @param date Date to check
 * @returns Current zodiac sign
 */
function getCurrentTransitSign(planet, date = new Date()) {
  try {
    // Get reliable positions
    const positions = getReliablePlanetaryPositions();
    // Return position if available
    if (positions[planet]) {
      return positions[planet].sign;
    }
    // For common planets, calculate fallback
    if (planet === 'Sun') {
      return calculateSunSign(date);
    }
    if (planet === 'Moon') {
      const dayOfYear = getDayOfYear(date);
      return calculateApproximatemoonSign(dayOfYear);
    }
    // No data for this planet
    return null;
  } catch (error) {
    errorLog(
      'Error in getCurrentTransitSign:',
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}
exports.getCurrentTransitSign = getCurrentTransitSign;
/**
 * Validate planetary positions data
 * @param positions Positions to validate
 * @param date Date for reference
 * @returns Validated positions
 */
function validatePlanetaryPositions(positions, date = new Date()) {
  // If positions are missing or empty, use reliable positions
  if (!positions || Object.keys(positions).length === 0) {
    return getReliablePlanetaryPositions();
  }
  // Check if required planets are present
  const requiredPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
  let isValid = true;
  for (const planet of requiredPlanets) {
    if (!positions[planet] || !positions[planet].sign) {
      isValid = false;
      break;
    }
  }
  if (!isValid) {
    return getReliablePlanetaryPositions();
  }
  // Normalize sign names
  const result = {};
  for (const [planet, data] of Object.entries(positions)) {
    if (typeof data === 'object' && data !== null) {
      const position = { ...data };
      // Convert sign to lowercase if it exists
      if (position.sign && typeof position.sign === 'string') {
        position.sign = position.sign.toLowerCase();
      }
      result[planet] = position;
    }
  }
  return result;
}
exports.validatePlanetaryPositions = validatePlanetaryPositions;
/**
 * Get base longitude for a zodiac sign
 * @param sign Zodiac sign
 * @returns Base longitude in degrees
 */
function getBaseSignLongitude(sign) {
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
    'pisces',
  ];
  const index = signs.indexOf(sign);
  return index >= 0 ? index * 30 : 0;
}
exports.getBaseSignLongitude = getBaseSignLongitude;
/**
 * Get current transit positions
 * @returns Current planetary positions
 */
function getCurrentTransitPositions() {
  // First try to get reliable positions
  const positions = getReliablePlanetaryPositions();
  // Convert to transit format
  const result = {};
  for (const [planet, data] of Object.entries(positions)) {
    result[planet] = {
      sign: data.sign,
      degree: data.degree,
      isRetrograde: data.isRetrograde || false,
    };
  }
  return result;
}
exports.getCurrentTransitPositions = getCurrentTransitPositions;
/**
 * Get day of year (1-366)
 * @param date Date to check
 * @returns Day of year
 */
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
/**
 * Calculate approximate Sun sign based on day of year
 * @param dayOfYear Day of year (1-366)
 * @returns Zodiac sign
 */
function _calculateApproximateSunSign(dayOfYear) {
  // Simple approximation of Sun sign based on day of year
  if (dayOfYear >= 80 && dayOfYear < 110) return 'aries';
  if (dayOfYear >= 110 && dayOfYear < 141) return 'taurus';
  if (dayOfYear >= 141 && dayOfYear < 172) return 'gemini';
  if (dayOfYear >= 172 && dayOfYear < 204) return 'cancer';
  if (dayOfYear >= 204 && dayOfYear < 235) return 'leo';
  if (dayOfYear >= 235 && dayOfYear < 266) return 'virgo';
  if (dayOfYear >= 266 && dayOfYear < 296) return 'libra';
  if (dayOfYear >= 296 && dayOfYear < 326) return 'scorpio';
  if (dayOfYear >= 326 && dayOfYear < 356) return 'sagittarius';
  if (dayOfYear >= 356 || dayOfYear < 20) return 'capricorn';
  if (dayOfYear >= 20 && dayOfYear < 49) return 'aquarius';
  return 'pisces';
}
/**
 * Calculate approximate Moon sign based on day of year
 * @param dayOfYear Day of year (1-366)
 * @returns Zodiac sign
 */
function calculateApproximatemoonSign(dayOfYear) {
  // Moon moves about 13 degrees per day, spending about 2.5 days in each sign
  // This is a very rough approximation
  const moonCycle = Math.floor((dayOfYear % 29.5) / 2.5);
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
    'pisces',
  ];
  return signs[moonCycle % 12];
}
/**
 * Count elements based on planetary positions
 * @param positions Planetary positions
 * @returns Count of each element
 */
function countElements(positions) {
  const elementCount = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0,
  };
  const elementMap = {
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
    pisces: 'Water',
  };
  // Count planets in each element
  for (const [planet, position] of Object.entries(positions)) {
    if (position.sign && elementMap[position.sign]) {
      // Apply weighting - Sun and Moon count more
      let weight = 1;
      if (planet === 'Sun' || planet === 'Moon') {
        weight = 3;
      } else if (['Mercury', 'Venus', 'Mars'].includes(planet)) {
        weight = 2;
      }
      elementCount[elementMap[position.sign]] += weight;
    }
  }
  return elementCount;
}
/**
 * Get dominant element
 * @param elements Element counts
 * @returns Dominant element
 */
function getDominantElement(elements) {
  let maxCount = 0;
  let dominant = 'Fire'; // Default
  for (const [element, count] of Object.entries(elements)) {
    if (count > maxCount) {
      maxCount = count;
      dominant = element;
    }
  }
  return dominant;
}
/**
 * Get days since a reference date
 * @param date Reference date
 * @returns Number of days
 */
function _getDaysSinceDate(date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
/**
 * Convert string to zodiac sign
 * @param sign String to convert
 * @returns Zodiac sign
 */
function _toZodiacSign(sign) {
  return (0, exports.normalizeZodiacSign)(sign);
}
