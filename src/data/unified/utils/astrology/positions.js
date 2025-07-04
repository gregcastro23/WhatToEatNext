"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLongitudeToZodiacPosition = exports.validatePositionsStructure = exports.getPositionsSummary = exports.clearPositionsCache = exports.getSignFromLongitude = exports.getNodeInfo = exports.calculateLunarNodes = exports.getAccuratePlanetaryPositions = exports.getFallbackPlanetaryPositions = void 0;
const Astronomy = require("astronomy-engine");
/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
const debugLog = (message, ...args) => {
    // Comment out console.log to avoid linting warnings
    // console.log(message, ...args);
};
// Updated reference data for gemini season (current positions)
const REFERENCE_POSITIONS = {
    // Planet: [degrees, minutes, seconds, zodiacSign]
    Sun: [5, 56, 0, 'gemini'],
    Moon: [3, 34, 0, 'gemini'],
    Mercury: [1, 59, 0, 'gemini'],
    Venus: [20, 10, 0, 'aries'],
    Mars: [18, 23, 0, 'leo'],
    Jupiter: [26, 52, 0, 'gemini'],
    Saturn: [0, 8, 0, 'aries'],
    Uranus: [27, 49, 0, 'taurus'],
    Neptune: [1, 46, 0, 'aries'],
    Pluto: [3, 42, 0, 'aquarius'],
    NorthNode: [23, 46, 0, 'pisces'],
    Chiron: [22, 25, 0, 'aries'],
    Ascendant: [22, 19, 0, 'scorpio'],
    MC: [6, 57, 0, 'leo'] // Keeping previous value as not provided
};
// Reference date for gemini season positions
const REFERENCE_DATE = new Date('2025-05-26T12:00:00-04:00'); // gemini season reference
// Approximate daily motion of planets in degrees - more accurate values from ephemeris
const DAILY_MOTION = {
    Sun: 0.986,
    Moon: 13.2,
    Mercury: 1.383,
    Venus: 1.2,
    Mars: 0.524,
    Jupiter: 0.083,
    Saturn: 0.034,
    Uranus: 0.012,
    Neptune: 0.006,
    Pluto: 0.004,
    NorthNode: 0.053,
    Chiron: 0.018,
    Ascendant: 1.0,
    MC: 1.0 // Varies based on location and time
};
// Retrograde status for gemini season positions
const RETROGRADE_STATUS = {
    Sun: false,
    Moon: false,
    Mercury: false,
    Venus: false,
    Mars: false,
    Jupiter: false,
    Saturn: false,
    Uranus: false,
    Neptune: false,
    Pluto: true,
    NorthNode: true,
    SouthNode: true,
    Chiron: false,
    Ascendant: false,
    MC: false
};
// Map our planet names to astronomy-engine bodies
const PLANET_MAPPING = {
    Sun: Astronomy.Body.Sun,
    Moon: Astronomy.Body.Moon,
    Mercury: Astronomy.Body.Mercury,
    Venus: Astronomy.Body.Venus,
    Mars: Astronomy.Body.Mars,
    Jupiter: Astronomy.Body.Jupiter,
    Saturn: Astronomy.Body.Saturn,
    Uranus: Astronomy.Body.Uranus,
    Neptune: Astronomy.Body.Neptune,
    Pluto: Astronomy.Body.Pluto
};
// Cache for planetary positions to avoid frequent recalculations
let positionsCache = null;
// Cache expiration in milliseconds (15 minutes)
const CACHE_EXPIRATION = 15 * 60 * 1000;
// Zodiac signs in order
const ZODIAC_SIGNS = [
    'aries', 'taurus', 'gemini', 'cancer',
    'leo', 'virgo', 'libra', 'scorpio',
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
];
/**
 * Convert a position in degrees, minutes, seconds to decimal degrees
 */
function dmsToDecimal(degrees, minutes, seconds) {
    return degrees + minutes / 60 + seconds / 3600;
}
/**
 * Convert a zodiac sign to its starting degree (0-330)
 */
function zodiacStartDegree(sign) {
    const index = ZODIAC_SIGNS.indexOf(sign);
    return index * 30;
}
/**
 * Calculate the longitude in decimal degrees based on reference data
 */
function calculateReferenceLongitude(planet) {
    if (!REFERENCE_POSITIONS[planet]) {
        // console.warn(`No reference position for ${planet}, using default`);
        return 0;
    }
    const [degrees, minutes, seconds, sign] = REFERENCE_POSITIONS[planet];
    const decimalDegrees = dmsToDecimal(degrees, minutes, seconds);
    const signStart = zodiacStartDegree(sign);
    return (signStart + decimalDegrees) % 360;
}
/**
 * Get planetary positions for a given date using fallback approach
 */
function getFallbackPlanetaryPositions(date) {
    const positions = {};
    // Calculate days difference from reference date
    const daysDiff = (date.getTime() - REFERENCE_DATE.getTime()) / (24 * 60 * 60 * 1000);
    // Calculate position for each planet
    for (const planet of Object.keys(REFERENCE_POSITIONS)) {
        const refLongitude = calculateReferenceLongitude(planet);
        const motion = DAILY_MOTION[planet] || 0;
        const isRetrograde = RETROGRADE_STATUS[planet] || false;
        // Adjust motion direction for retrograde planets
        const adjustedMotion = isRetrograde ? -Math.abs(motion) : Math.abs(motion);
        // Calculate new position with minimal randomness (just for slight variation)
        // Reduced randomness for more accurate predictions
        const randomFactor = Math.sin(date.getTime() / 1000000 + planet.charCodeAt(0)) * 0.2;
        let newLongitude = refLongitude + (adjustedMotion * daysDiff) + randomFactor;
        // Normalize to 0-360 degrees
        newLongitude = ((newLongitude % 360) + 360) % 360;
        // Get zodiac sign and degree
        const signIndex = Math.floor(newLongitude / 30);
        const degree = newLongitude % 30;
        const sign = ZODIAC_SIGNS[signIndex];
        // Store both the raw longitude and the formatted data
        positions[planet] = {
            sign: sign.toLowerCase(),
            degree: parseFloat(degree.toFixed(2)),
            exactLongitude: newLongitude,
            isRetrograde
        };
    }
    return positions;
}
exports.getFallbackPlanetaryPositions = getFallbackPlanetaryPositions;
/**
 * Calculate lunar node positions with more accurate reference data (private helper)
 * @param date Date to calculate for
 * @returns Object with north node position and retrograde status
 */
function calculateLunarNodesInternal(date) {
    try {
        // Since moonNode is not available in astronomy-engine,
        // we'll implement a simple approximation using astronomical formulas
        // Time in Julian centuries since 2000
        const jd = Astronomy.MakeTime(date).tt;
        const T = (jd - 2451545.0) / 36525;
        // Mean longitude of ascending node (Meeus formula)
        let Omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000;
        // Normalize to 0-360 range
        Omega = ((Omega % 360) + 360) % 360;
        // The ascending node (North Node) is the opposite of Omega
        const NorthNode = (Omega + 180) % 360;
        // Nodes are always retrograde
        return { NorthNode, isRetrograde: true };
    }
    catch (error) {
        debugLog('Error calculating lunar nodes:', error instanceof Error ? error.message : String(error));
        // Return current position for March 2024 (late pisces)
        return { NorthNode: 356.54, isRetrograde: true };
    }
}
/**
 * Get accurate planetary positions using astronomy-engine
 * @param date Date to calculate positions for
 * @returns Record of planetary positions in degrees (0-360)
 */
async function getAccuratePlanetaryPositions(date = new Date()) {
    try {
        // Check cache first
        if (positionsCache &&
            (date.getTime() - positionsCache.date.getTime() < 60000 && // 1 minute cache for same date
                (Date.now() - positionsCache.timestamp) < CACHE_EXPIRATION)) {
            debugLog('Using cached planetary positions');
            return positionsCache.positions;
        }
        const astroTime = new Astronomy.AstroTime(date);
        const positions = {};
        // Calculate position for each planet
        for (const [planet, body] of Object.entries(PLANET_MAPPING)) {
            try {
                // Special handling for the Sun - can't calculate heliocentric longitude of the Sun
                if (planet === 'Sun') {
                    // For the Sun, we'll use a different approach - get ecliptic coordinates directly
                    // The Sun is always at the opposite ecliptic longitude from earth's heliocentric longitude
                    const earthLong = Astronomy.EclipticLongitude(Astronomy.Body.Earth, astroTime);
                    // Sun is 180 degrees opposite earth's heliocentric position
                    const sunLong = (earthLong + 180) % 360;
                    // Check if the Sun is retrograde (it never is from earth's perspective)
                    const isRetrograde = false;
                    // Get sign and degree
                    const { sign, degree } = getSignFromLongitude(sunLong);
                    positions[planet] = {
                        sign: sign.toLowerCase(),
                        degree,
                        exactLongitude: sunLong,
                        isRetrograde
                    };
                }
                else {
                    // For other planets, use ecliptic longitude and motion direction
                    const longitude = Astronomy.EclipticLongitude(body, astroTime);
                    const isRetrograde = isPlanetRetrograde(body, date);
                    // Get sign and degree
                    const { sign, degree } = getSignFromLongitude(longitude);
                    positions[planet] = {
                        sign: sign.toLowerCase(),
                        degree,
                        exactLongitude: longitude,
                        isRetrograde
                    };
                }
            }
            catch (error) {
                debugLog(`Error calculating position for ${planet}:`, error instanceof Error ? error.message : String(error));
                // Use fallback method for this planet
                const fallbackData = getFallbackPlanetaryPositions(date);
                if (fallbackData[planet]) {
                    positions[planet] = fallbackData[planet];
                }
            }
        }
        // Calculate lunar nodes
        try {
            const nodeData = calculateLunarNodes(date);
            const NorthNode = getNodeInfo(nodeData.NorthNode);
            positions.NorthNode = NorthNode;
            // Calculate South Node (opposite North Node)
            const southNodeLongitude = (nodeData.NorthNode + 180) % 360;
            const SouthNode = getNodeInfo(southNodeLongitude);
            positions.SouthNode = SouthNode;
        }
        catch (error) {
            debugLog('Error calculating lunar nodes:', error instanceof Error ? error.message : String(error));
        }
        // Update cache
        positionsCache = {
            positions,
            timestamp: Date.now(),
            date: new Date(date)
        };
        return positions;
    }
    catch (error) {
        debugLog('Error in getAccuratePlanetaryPositions:', error instanceof Error ? error.message : String(error));
        // Return fallback positions
        return getFallbackPlanetaryPositions(date);
    }
}
exports.getAccuratePlanetaryPositions = getAccuratePlanetaryPositions;
/**
 * Calculate lunar nodes with more accurate reference data
 * @param date Date to calculate for
 * @returns Object with north node position and retrograde status
 */
function calculateLunarNodes(date = new Date()) {
    return calculateLunarNodesInternal(date);
}
exports.calculateLunarNodes = calculateLunarNodes;
/**
 * Get node information based on longitude
 * @param nodeLongitude Node longitude in degrees
 * @returns Node position data
 */
function getNodeInfo(nodeLongitude) {
    const { sign, degree } = getSignFromLongitude(nodeLongitude);
    return {
        sign: sign.toLowerCase(),
        degree,
        exactLongitude: nodeLongitude,
        isRetrograde: true // Lunar nodes are always retrograde
    };
}
exports.getNodeInfo = getNodeInfo;
/**
 * Get sign from longitude
 * @param longitude Longitude in degrees
 * @returns Object with sign and degree
 */
function getSignFromLongitude(longitude) {
    return getLongitudeToZodiacPosition(longitude);
}
exports.getSignFromLongitude = getSignFromLongitude;
/**
 * Clear the positions cache
 */
function clearPositionsCache() {
    positionsCache = null;
    debugLog('Positions cache cleared');
}
exports.clearPositionsCache = clearPositionsCache;
/**
 * Get a summary of current planetary positions
 * @returns String summary of positions
 */
function getPositionsSummary() {
    if (!positionsCache) {
        return 'No positions data in cache';
    }
    const { positions, timestamp } = positionsCache;
    const formattedDate = new Date(timestamp).toISOString();
    let summary = `Planetary positions as of ${formattedDate}:\n`;
    for (const [planet, data] of Object.entries(positions)) {
        summary += `${planet}: ${data.sign} ${data.degree.toFixed(2)}° ${data.isRetrograde ? '(R)' : ''}\n`;
    }
    return summary;
}
exports.getPositionsSummary = getPositionsSummary;
/**
 * Validate the structure of a positions object
 * @param positions Positions object to validate
 * @returns Boolean indicating if the structure is valid
 */
function validatePositionsStructure(positions) {
    if (!positions || typeof positions !== 'object') {
        return false;
    }
    // Check if at least some key planets exist
    const requiredPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
    for (const planet of requiredPlanets) {
        if (!positions[planet]) {
            return false;
        }
        const pos = positions[planet];
        if (typeof pos !== 'object' || pos === null) {
            return false;
        }
        // Check for required properties
        const planetData = pos;
        if (!planetData.sign || typeof planetData.degree !== 'number') {
            return false;
        }
    }
    return true;
}
exports.validatePositionsStructure = validatePositionsStructure;
/**
 * Convert longitude to zodiac position
 * @param longitude Longitude in degrees
 * @returns Object with sign and degree
 */
function getLongitudeToZodiacPosition(longitude) {
    // Normalize longitude to 0-360 range
    const normalizedLongitude = ((longitude % 360) + 360) % 360;
    // Calculate zodiac sign index (0-11)
    const signIndex = Math.floor(normalizedLongitude / 30);
    // Calculate degree within sign (0-29.999...)
    const degree = normalizedLongitude % 30;
    // Get sign name
    const sign = ZODIAC_SIGNS[signIndex];
    return { sign, degree };
}
exports.getLongitudeToZodiacPosition = getLongitudeToZodiacPosition;
/**
 * Check if a planet is retrograde
 * @param body Astronomy body
 * @param date Date to check
 * @returns Boolean indicating if planet is retrograde
 */
function isPlanetRetrograde(body, date) {
    try {
        // Skip for Sun and Moon as they don't have retrograde motion
        if (body === Astronomy.Body.Sun || body === Astronomy.Body.Moon) {
            return false;
        }
        // Create proper AstroTime objects
        const astroTime = new Astronomy.AstroTime(date);
        const prevTime = new Astronomy.AstroTime(new Date(date.getTime() - 2 * 24 * 60 * 60 * 1000)); // 2 days before
        // Check if position is decreasing (retrograde)
        const currentLong = Astronomy.EclipticLongitude(body, astroTime);
        const prevLong = Astronomy.EclipticLongitude(body, prevTime);
        // Adjust for crossing 0/360 boundary
        let diff = currentLong - prevLong;
        if (Math.abs(diff) > 180) {
            diff = diff > 0 ? diff - 360 : diff + 360;
        }
        return diff < 0;
    }
    catch (error) {
        debugLog(`Error determining retrograde for ${body}:`, error instanceof Error ? error.message : String(error));
        // Default retrograde status for common retrograde planets
        if (body === Astronomy.Body.Mercury || body === Astronomy.Body.Venus) {
            return Math.random() < 0.4; // 40% chance of retrograde (rough approximation)
        }
        return false;
    }
}
