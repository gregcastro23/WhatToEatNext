"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAspects = exports.calculateElementalProfile = exports.calculateDominantElement = exports.calculateElementalCompatibility = exports.getZodiacElementalInfluence = exports.getPlanetaryElementalInfluence = exports.getCurrentAstrologicalState = exports.getZodiacSign = exports.longitudeToZodiacPosition = exports.getDefaultPlanetaryPositions = exports.calculatePlanetaryPositions = exports.calculatemoonSign = exports.calculateSunSign = exports.getmoonIllumination = exports.getLunarPhaseName = exports.calculateLunarPhase = exports.getZodiacElement = exports.getLunarPhaseModifier = exports.calculatePlanetaryAspects = void 0;
const dateUtils_1 = require("../dateUtils");
const PlanetaryHourCalculator_1 = require("../../lib/PlanetaryHourCalculator");
const positions_1 = require("./positions");
const validation_1 = require("./validation");
/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
const debugLog = (message, ...args) => {
    // Comment out console.log to avoid linting warnings
    // console.log(message, ...args);
};
/**
 * A utility function for logging errors
 * This is a safe replacement for console.error that can be disabled in production
 */
const errorLog = (message, ...args) => {
    // Comment out console.error to avoid linting warnings
    // console.error(message, ...args);
};
// Add type assertion for zodiac signs
const zodiacSigns = [
    'aries', 'taurus', 'gemini', 'cancer',
    'leo', 'virgo', 'libra', 'scorpio',
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
];
// Export calculatePlanetaryAspects from validation module
exports.calculatePlanetaryAspects = validation_1.calculatePlanetaryAspects;
/**
 * Get the modifier value for a specific lunar phase
 * @param phase Lunar phase
 * @returns Modifier value between 0 and 1
 */
function getLunarPhaseModifier(phase) {
    const modifiers = {
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
exports.getLunarPhaseModifier = getLunarPhaseModifier;
/**
 * Get the element associated with a zodiac sign
 * @param sign Zodiac sign
 * @returns Element ('Fire', 'Earth', 'Air', or 'Water')
 */
function getZodiacElement(sign) {
    const elements = {
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
exports.getZodiacElement = getZodiacElement;
/**
 * Calculate lunar phase more accurately using astronomy-engine data
 * @param date Date to calculate phase for
 * @returns A value between 0 and 1 representing the lunar phase
 */
async function calculateLunarPhase(date = new Date()) {
    try {
        // Get accurate positions
        const positions = await (0, positions_1.getAccuratePlanetaryPositions)(date);
        if (!positions.Sun || !positions.Moon) {
            throw new Error('Sun or Moon position missing');
        }
        // Calculate the angular distance between Sun and Moon
        let angularDistance = positions.Moon.exactLongitude - positions.Sun.exactLongitude;
        // Normalize to 0-360 range
        angularDistance = ((angularDistance % 360) + 360) % 360;
        // Convert to phase percentage (0 to 1)
        return angularDistance / 360;
    }
    catch (error) {
        errorLog('Error in calculateLunarPhase:', error instanceof Error ? error.message : String(error));
        return 0; // Default to new Moon
    }
}
exports.calculateLunarPhase = calculateLunarPhase;
/**
 * Get the name of the lunar phase based on phase value
 * @param phase Lunar phase (0-1)
 * @returns The name of the lunar phase as a LunarPhase type
 */
function getLunarPhaseName(phase) {
    // First ensure phase is between 0 and 1
    const normalizedPhase = ((phase % 1) + 1) % 1;
    // Convert phase to 0-8 range (8 Moon phases)
    const phaseNormalized = normalizedPhase * 8;
    // Use proper type for return values
    if (phaseNormalized < 0.5 || phaseNormalized >= 7.5)
        return 'new moon';
    if (phaseNormalized < 1.5)
        return 'waxing crescent';
    if (phaseNormalized < 2.5)
        return 'first quarter';
    if (phaseNormalized < 3.5)
        return 'waxing gibbous';
    if (phaseNormalized < 4.5)
        return 'full moon';
    if (phaseNormalized < 5.5)
        return 'waning gibbous';
    if (phaseNormalized < 6.5)
        return 'last quarter';
    return 'waning crescent';
}
exports.getLunarPhaseName = getLunarPhaseName;
/**
 * Get Moon illumination percentage
 * @param date Date to calculate for
 * @returns Illumination percentage (0-1)
 */
async function getmoonIllumination(date = new Date()) {
    try {
        const phase = await calculateLunarPhase(date);
        // Convert phase to illumination percentage
        // New Moon (0) = 0% illumination
        // Full Moon (0.5) = 100% illumination
        // New Moon (1) = 0% illumination
        if (phase <= 0.5) {
            // Waxing: 0 to 1
            return phase * 2;
        }
        else {
            // Waning: 1 to 0
            return 2 - (phase * 2);
        }
    }
    catch (error) {
        errorLog('Error in getmoonIllumination:', error instanceof Error ? error.message : String(error));
        return 0.5; // Default to 50% illumination
    }
}
exports.getmoonIllumination = getmoonIllumination;
/**
 * Calculate Sun sign based on date
 * @param date Date to calculate for
 * @returns Zodiac sign
 */
function calculateSunSign(date = new Date()) {
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const day = date.getDate();
    // Approximate Sun sign dates (tropical zodiac)
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19))
        return 'aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20))
        return 'taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20))
        return 'gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22))
        return 'cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22))
        return 'leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22))
        return 'virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22))
        return 'libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
        return 'scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
        return 'sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
        return 'capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
        return 'aquarius';
    // If date is out of range, return undefined and let the UI handle the error
    return undefined;
}
exports.calculateSunSign = calculateSunSign;
/**
 * Calculate Moon sign based on date (simplified)
 * @param date Date to calculate for
 * @returns Zodiac sign
 */
async function calculatemoonSign(date = new Date()) {
    try {
        const positions = await (0, positions_1.getAccuratePlanetaryPositions)(date);
        if (positions.Moon && positions.Moon.sign) {
            return positions.Moon.sign;
        }
        // Default to undefined and let the caller handle the error
        throw new Error('Moon position not available');
    }
    catch (error) {
        errorLog('Error calculating Moon sign:', error instanceof Error ? error.message : String(error));
        return 'cancer'; // Default to cancer as moon's ruling sign
    }
}
exports.calculatemoonSign = calculatemoonSign;
/**
 * Calculate planetary positions for all planets
 * @param date Date to calculate for
 * @returns Object with planet positions
 */
async function calculatePlanetaryPositions(date = new Date()) {
    try {
        return await (0, positions_1.getAccuratePlanetaryPositions)(date);
    }
    catch (error) {
        errorLog('Error calculating planetary positions:', error instanceof Error ? error.message : String(error));
        return getDefaultPlanetaryPositions() || {};
    }
}
exports.calculatePlanetaryPositions = calculatePlanetaryPositions;
/**
 * Get default planetary positions for fallback
 * @returns Object with default planet positions
 */
function getDefaultPlanetaryPositions() {
    // Default positions for current period (could be updated periodically)
    const defaultPositions = {
    // Implement default positions here
    // This is a placeholder
    };
    return defaultPositions;
}
exports.getDefaultPlanetaryPositions = getDefaultPlanetaryPositions;
/**
 * Convert longitude to zodiac position
 * @param longitude Longitude in degrees (0-360)
 * @returns Object with sign and degree
 */
function longitudeToZodiacPosition(longitude) {
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
exports.longitudeToZodiacPosition = longitudeToZodiacPosition;
/**
 * Get zodiac sign from longitude
 * @param longitude Longitude in degrees
 * @returns Zodiac sign name
 */
function getZodiacSign(longitude) {
    const { sign } = longitudeToZodiacPosition(longitude);
    return sign;
}
exports.getZodiacSign = getZodiacSign;
/**
 * Get the current astrological state
 * @param date Date to calculate for
 * @returns Astrological state object
 */
async function getCurrentAstrologicalState(date = new Date()) {
    try {
        // Get Sun sign
        const sunSign = calculateSunSign(date) || 'aries';
        // Get lunar phase
        const lunarPhaseValue = await calculateLunarPhase(date);
        const lunarPhase = getLunarPhaseName(lunarPhaseValue);
        // Get Moon sign (can be async)
        const moonSign = await calculatemoonSign(date);
        // Get planetary positions
        const planetaryPositions = await calculatePlanetaryPositions(date);
        // Calculate dominant element
        const timeFactors = {
            season: (0, dateUtils_1.getCurrentSeason)(date),
            timeOfDay: (0, dateUtils_1.getTimeOfDay)(date),
            hourPlanet: new PlanetaryHourCalculator_1.PlanetaryHourCalculator().getPlanetaryHour(date).planet,
            dayPlanet: new PlanetaryHourCalculator_1.PlanetaryHourCalculator().getPlanetaryDay(date)
        };
        const dominantElement = calculateDominantElement({
            sunSign,
            moonSign,
            lunarPhase,
            activePlanets: Object.keys(planetaryPositions),
            dominantElement: 'Fire' // Placeholder that will be overwritten
        }, timeFactors);
        // Assemble astrological state
        const state = {
            sunSign,
            moonSign,
            lunarPhase,
            activePlanets: Object.keys(planetaryPositions),
            dominantElement,
            planetaryPositions
        };
        return state;
    }
    catch (error) {
        errorLog('Error in getCurrentAstrologicalState:', error instanceof Error ? error.message : String(error));
        // Return a default state in case of error
        return {
            sunSign: 'aries',
            lunarPhase: 'new moon',
            activePlanets: ['Sun', 'Moon'],
            dominantElement: 'Fire',
            error: error instanceof Error ? error.message : String(error)
        };
    }
}
exports.getCurrentAstrologicalState = getCurrentAstrologicalState;
/**
 * Get planetary elemental influence
 * @param planet Planet name
 * @returns Element
 */
function getPlanetaryElementalInfluence(planet) {
    const planetElements = {
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
    return planetElements[planet.toLowerCase()] || 'Fire';
}
exports.getPlanetaryElementalInfluence = getPlanetaryElementalInfluence;
/**
 * Get zodiac elemental influence
 * @param sign Zodiac sign
 * @returns Element
 */
function getZodiacElementalInfluence(sign) {
    const element = getZodiacElement(sign);
    return element;
}
exports.getZodiacElementalInfluence = getZodiacElementalInfluence;
/**
 * Calculate elemental compatibility between two elements
 * @param element1 First element
 * @param element2 Second element
 * @returns Compatibility score (0-1)
 */
function calculateElementalCompatibility(element1, element2) {
    // Following the elemental principles: all elements work well together
    if (element1 === element2) {
        return 0.9; // Same element has highest compatibility
    }
    // All different element combinations have good compatibility
    return 0.7;
}
exports.calculateElementalCompatibility = calculateElementalCompatibility;
/**
 * Calculate dominant element from astrological state
 * @param astroState Astrological state
 * @param timeFactors Time factors
 * @returns Dominant element
 */
function calculateDominantElement(astroState, timeFactors) {
    const elementCounts = {
        'Fire': 0,
        'Earth': 0,
        'Air': 0,
        'Water': 0
    };
    // Count elements from planetary positions
    if (astroState.planetaryPositions) {
        Object.entries(astroState.planetaryPositions).forEach(([planet, position]) => {
            const element = getZodiacElementalInfluence(position.sign);
            // Weight by planet importance
            let weight = 1;
            if (planet === 'Sun' || planet === 'Moon')
                weight = 3;
            else if (['Mercury', 'Venus', 'Mars'].includes(planet))
                weight = 2;
            elementCounts[element] += weight;
        });
    }
    // Find dominant element
    let dominantElement = 'Fire';
    let maxCount = 0;
    Object.entries(elementCounts).forEach(([element, count]) => {
        if (count > maxCount) {
            maxCount = count;
            dominantElement = element;
        }
    });
    return dominantElement;
}
exports.calculateDominantElement = calculateDominantElement;
/**
 * Calculate elemental profile from astrological state
 * @param astroState Astrological state
 * @param timeFactors Time factors
 * @returns Elemental profile
 */
function calculateElementalProfile(astroState, timeFactors) {
    const elementCounts = {
        'Fire': 0,
        'Earth': 0,
        'Air': 0,
        'Water': 0
    };
    // Count elements from planetary positions
    if (astroState.planetaryPositions) {
        Object.entries(astroState.planetaryPositions).forEach(([planet, position]) => {
            const element = getZodiacElementalInfluence(position.sign);
            // Weight by planet importance
            let weight = 1;
            if (planet === 'Sun' || planet === 'Moon')
                weight = 3;
            else if (['Mercury', 'Venus', 'Mars'].includes(planet))
                weight = 2;
            elementCounts[element] += weight;
        });
    }
    // Normalize to percentages
    const total = Object.values(elementCounts).reduce((sum, count) => sum + count, 0);
    if (total === 0) {
        // Return balanced profile if no data
        return { 'Fire': 0.25, 'Earth': 0.25, 'Air': 0.25, 'Water': 0.25 };
    }
    const profile = {};
    Object.entries(elementCounts).forEach(([element, count]) => {
        profile[element] = count / total;
    });
    return profile;
}
exports.calculateElementalProfile = calculateElementalProfile;
/**
 * Calculate planetary aspects between positions
 * @param positions Planetary positions
 * @param _risingDegree Rising degree (optional)
 * @returns Aspects and elemental effects
 */
function calculateAspects(positions, _risingDegree) {
    const aspects = [];
    const elementalEffects = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    // Using Record instead of any for aspect types
    const aspectTypes = {
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
    const getLongitude = (position) => {
        if (!position || !position.sign) {
            debugLog('Invalid position object encountered:', position);
            return 0;
        }
        const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
            'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
        const signIndex = signs.findIndex(s => s.toLowerCase() === position.sign.toLowerCase());
        return signIndex * 30 + position.degree;
    };
    // Calculate aspects between each planet pAir
    const planets = Object.keys(positions);
    for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
            const planet1 = planets[i];
            const planet2 = planets[j];
            const pos1 = positions[planet1];
            const pos2 = positions[planet2];
            // Skip if missing position data
            if (!pos1 || !pos2 || !pos1.sign || !pos2.sign)
                continue;
            const long1 = getLongitude(pos1);
            const long2 = getLongitude(pos2);
            // Calculate angular difference
            let diff = Math.abs(long1 - long2);
            if (diff > 180)
                diff = 360 - diff;
            // Check each aspect type
            for (const [type, definition] of Object.entries(aspectTypes)) {
                const idealAngle = definition.angle;
                const orb = Math.abs(diff - idealAngle);
                if (orb <= definition.orb) {
                    // Calculate aspect strength based on orb
                    const strength = 1 - (orb / definition.orb);
                    // Get element of the sign for each planet
                    const element1 = getZodiacElement(pos1.sign).toLowerCase();
                    const element2 = getZodiacElement(pos2.sign).toLowerCase();
                    // Base multiplier from definition
                    let multiplier = definition.significance;
                    // Special case: Square aspect with Ascendant is positive
                    if (type === 'square' && (element1 === 'ascendant' || element2 === 'ascendant')) {
                        multiplier = 1;
                    }
                    // Add to aspects array
                    aspects.push({
                        planet1,
                        planet2,
                        type: type,
                        orb,
                        strength: strength * Math.abs(multiplier),
                        influence: multiplier,
                        exactAngle: orb,
                        applyingSeparating: orb <= 120 ? 'applying' : 'separating',
                        significance: orb / 180,
                        description: `Aspect between ${element1} and ${element2}`,
                        elementalInfluence: { Fire: 0, Earth: 0, Air: 0, Water: 0 }
                    });
                    // Apply elemental effects
                    elementalEffects[element1] += multiplier * strength;
                    elementalEffects[element2] += multiplier * strength;
                    // Only count the closest aspect between two planets
                    break;
                }
            }
        }
    }
    return { aspects, elementalEffects };
}
exports.calculateAspects = calculateAspects;
