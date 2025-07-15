/**
 * System defaults - consolidated from multiple files
 * This file replaces default values scattered across defaults.ts and other files
 */
/**
 * System defaults - consolidated from multiple files
 * This file replaces default values scattered across defaults.ts and other files
 */
// ===== CORE ELEMENTAL DEFAULTS =====
/**
 * Default elemental properties with balanced values
 */
export const DEFAULT_ELEMENTAL_PROPERTIES = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
};
/**
 * Default alchemical values with standard distribution
 */
export const DEFAULT_ALCHEMICAL_VALUES = {
    Spirit: 0.29,
    Essence: 0.28,
    Matter: 0.21,
    Substance: 0.22
};
// ===== ASTROLOGICAL DEFAULTS =====
/**
 * Default lunar phase
 */
export const DEFAULT_LUNAR_PHASE = 'new moon';
/**
 * Default zodiac signs based on last successful API call
 */
export const DEFAULT_SUN_SIGN = 'gemini';
export const DEFAULT_moon_SIGN = 'virgo';
export const DEFAULT_RISING_SIGN = 'aries';
/**
 * Default planetary alignment with safe values
 * NOTE: For type safety only. Do NOT use for live calculations or UI. Always use real planetary positions.
 */
export const DEFAULT_PLANETARY_ALIGNMENT = {
    Sun: {},
    Moon: {},
    Mercury: {},
    Venus: {},
    Mars: {},
    Jupiter: {},
    Saturn: {},
    Uranus: {},
    Neptune: {},
    Pluto: { sign: '', degree: 0 }
};
/**
 * Default planetary positions based on last successful API call
 * These are fallback positions from the astrologize API when it fails
 * They represent real planetary positions from a recent successful API call
 */
export const DEFAULT_PLANETARY_POSITIONS = {
    Sun: {
        sign: 'gemini',
        degree: 13,
        exactLongitude: 73.9,
        isRetrograde: false
    },
    Moon: {
        sign: 'virgo',
        degree: 26,
        exactLongitude: 176.52,
        isRetrograde: false
    },
    Mercury: {
        sign: 'gemini',
        degree: 20,
        exactLongitude: 80.18,
        isRetrograde: false
    },
    Venus: {
        sign: 'aries',
        degree: 28,
        exactLongitude: 28.1,
        isRetrograde: false
    },
    Mars: {
        sign: 'leo',
        degree: 22,
        exactLongitude: 142.8,
        isRetrograde: false
    },
    Jupiter: {
        sign: 'gemini',
        degree: 28,
        exactLongitude: 88.73,
        isRetrograde: false
    },
    Saturn: {
        sign: 'aries',
        degree: 0,
        exactLongitude: 0.68,
        isRetrograde: false
    },
    Uranus: {
        sign: 'taurus',
        degree: 28,
        exactLongitude: 58.28,
        isRetrograde: false
    },
    Neptune: {
        sign: 'aries',
        degree: 1,
        exactLongitude: 1.92,
        isRetrograde: false
    },
    Pluto: {
        sign: 'aquarius',
        degree: 3,
        exactLongitude: 303.6,
        isRetrograde: true
    },
    Ascendant: {
        sign: 'aries',
        degree: 16,
        exactLongitude: 16.27,
        isRetrograde: false
    }
};
// ===== CHAKRA DEFAULTS =====
/**
 * Default chakra energies with neutral values
 */
export const DEFAULT_CHAKRA_ENERGIES = {
    root: 0.5,
    sacral: 0.5,
    solarPlexus: 0.5,
    heart: 0.5,
    throat: 0.5,
    brow: 0.5,
    crown: 0.5,
    thirdEye: 0.5
};
// ===== COMPREHENSIVE ASTROLOGICAL STATE =====
/**
 * Default astrological state with safe values for all required properties
 */
export const DEFAULT_ASTROLOGICAL_STATE = {
    sunSign: DEFAULT_SUN_SIGN,
    moonSign: DEFAULT_moon_SIGN,
    lunarPhase: DEFAULT_LUNAR_PHASE,
    risingSign: DEFAULT_RISING_SIGN,
    planetaryHour: 'Sun',
    planetaryDay: 'Sun',
    season: 'spring',
    timeOfDay: 'morning',
    decan: {
        sunDecan: 1,
        moonDecan: 1,
        risingDecan: 1
    },
    aspects: [],
    dominantElement: 'Fire',
    elementalProfile: DEFAULT_ELEMENTAL_PROPERTIES,
    planetaryPositions: DEFAULT_PLANETARY_POSITIONS,
    isDaytime: true,
    activePlanets: ['Sun', 'Moon'],
    activeAspects: [],
    zodiacSign: DEFAULT_SUN_SIGN,
    calculationError: false,alchemicalValues: DEFAULT_ALCHEMICAL_VALUES
};
// ===== ENERGY AND CALCULATION DEFAULTS =====
/**
 * Default zodiac energies
 * NOTE: For type safety only. Do NOT use for live calculations or UI. Always use real calculated values.
 */
export const DEFAULT_ZODIAC_ENERGIES = {
    aries: 0,
    taurus: 0,
    gemini: 0,
    cancer: 0,
    leo: 0,
    virgo: 0,
    libra: 0,
    scorpio: 0,
    sagittarius: 0,
    capricorn: 0,
    aquarius: 0,
    pisces: 0
};
/**
 * Default thermodynamic properties
 */
export const DEFAULT_THERMODYNAMIC_PROPERTIES = {
    heat: 0.5,
    entropy: 0.5,
    reactivity: 0.5,
    energy: 0,
    gregsEnergy: 0,
    kalchm: 1.0,
    monica: 0
};
/**
 * Default modality distribution
 */
export const DEFAULT_MODALITY_DISTRIBUTION = {
    cardinal: 0.33,
    fixed: 0.33,
    mutable: 0.34
};
// ===== RECIPE AND FOOD DEFAULTS =====
/**
 * Default recipe elemental values
 */
export const DEFAULT_RECIPE_ELEMENTAL_VALUES = { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2
};
/**
 * Default food recommendation
 */
export const DEFAULT_FOOD_RECOMMENDATION = {
    cuisine: 'balanced',
    elements: DEFAULT_RECIPE_ELEMENTAL_VALUES,
    recommendation: 'A balanced meal with a variety of fresh ingredients',
    score: 0.5,
    confidence: 0.7
};
/**
 * Default nutritional profile
 */
export const DEFAULT_NUTRITIONAL_PROFILE = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    vitamins: [],
    minerals: [],
    score: 0.5
};
// ===== CALCULATION PARAMETERS =====
/**
 * Default calculation parameters
 */
export const DEFAULT_CALCULATION_PARAMS = {
    useAspects: true,
    usePlanetaryHours: true,
    useLunarPhase: true,
    useSeasonalModifiers: true,
    useElementalAffinities: true,
    precision: 0.01,
    maxIterations: 100,
    convergenceThreshold: 0.001
};
/**
 * Default compatibility thresholds
 */
export const DEFAULT_COMPATIBILITY_THRESHOLDS = {
    excellent: 0.8,
    good: 0.6,
    fAir: 0.4,
    poor: 0.2,
    minimum: 0.1
};
// ===== ERROR HANDLING DEFAULTS =====
/**
 * Default error message templates
 */
export const DEFAULT_ERROR_MESSAGES = {
    calculation: 'Error in astrological calculation',
    missing_data: 'Missing required data for calculation',
    invalid_input: 'Invalid input data provided',
    connection: 'Error connecting to astrological service',
    timeout: 'Operation timed out',
    initialization: 'Error initializing alchemical engine',
    validation: 'Data validation failed',
    transformation: 'Error in alchemical transformation',
    recommendation: 'Error generating recommendations'
};
/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG = {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
    maxDelay: 10000
};
// ===== SYSTEM CONFIGURATION DEFAULTS =====
/**
 * Default system configuration
 */
export const DEFAULT_SYSTEM_CONFIG = {
    enableLogging: true,
    logLevel: 'info',
    enableCaching: true,
    cacheTimeout: 300000,
    enableValidation: true,
    strictMode: false,
    debugMode: false
};
/**
 * Default API configuration
 */
export const DEFAULT_API_CONFIG = {
    timeout: 30000,
    retries: 3,
    rateLimit: 100,
    cacheDuration: 300000
};
// ===== UTILITY FUNCTIONS =====
/**
 * Clone a default object to prevent mutation
 */
export function cloneDefault(defaultObject) {
    if (typeof defaultObject !== 'object' || defaultObject === null) {
        return defaultObject;
    }
    if (Array.isArray(defaultObject)) {
        return defaultObject.map(item => cloneDefault(item));
    }
    const cloned = {};
    for (const key in defaultObject) {
        if (Object.prototype.hasOwnProperty.call(defaultObject, key)) {
            cloned[key] = cloneDefault(defaultObject[key]);
        }
    }
    return cloned;
}
/**
 * Get default elemental properties
 */
export function getDefaultElementalProperties() {
    return cloneDefault(DEFAULT_ELEMENTAL_PROPERTIES);
}
/**
 * Get default astrological state
 */
export function getDefaultAstrologicalState() {
    return cloneDefault(DEFAULT_ASTROLOGICAL_STATE);
}
/**
 * Get default planetary positions
 */
export function getDefaultPlanetaryPositions() {
    return cloneDefault(DEFAULT_PLANETARY_POSITIONS);
}

/**
 * Get the most recent successful API planetary positions
 * This function attempts to get real-time data and falls back to cached/default data
 */
export async function getLatestPlanetaryPositions() {
    try {
        // Try to get current positions from the API
        const { getCurrentPlanetaryPositions } = await import('@/services/astrologizeApi');
        const positions = await getCurrentPlanetaryPositions();
        
        // If successful, return the real positions
        if (positions && Object.keys(positions).length > 0) {
            return positions;
        }
    } catch (error) {
        // console.log('Failed to get latest planetary positions, using defaults:', error);
    }
    
    // Fall back to default positions (which are based on last successful API call)
    return cloneDefault(DEFAULT_PLANETARY_POSITIONS);
}
/**
 * Merge user values with defaults
 */
export function mergeWithDefaults(userValues, defaults) {
    const result = cloneDefault(defaults);
    for (const key in userValues) {
        if (Object.prototype.hasOwnProperty.call(userValues, key) && userValues[key] !== undefined) {
            if (typeof userValues[key] === 'object' &&
                typeof defaults[key] === 'object' &&
                !Array.isArray(userValues[key])) {
                result[key] = mergeWithDefaults(userValues[key], defaults[key]);
            }
            else {
                result[key] = userValues[key];
            }
        }
    }
    return result;
}
/**
 * Validate values against defaults structure
 */
export function validateAgainstDefaults(values, defaults) {
    const errors = [];
    // Check for unknown keys
    for (const key in values) {
        if (!(key in defaults)) {
            errors.push(`Unknown property: ${key}`);
        }
    }
    // Check for type mismatches
    for (const key in defaults) {
        if (key in values) {
            const defaultType = typeof defaults[key];
            const valueType = typeof values[key];
            if (defaultType !== valueType && values[key] !== null && values[key] !== undefined) {
                errors.push(`Type mismatch for ${key}: expected ${defaultType}, got ${valueType}`);
            }
        }
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
// Default export with all constants and functions
export default {
    // Core defaults
    DEFAULT_ELEMENTAL_PROPERTIES,
    DEFAULT_ALCHEMICAL_VALUES,
    DEFAULT_CHAKRA_ENERGIES,
    // Astrological defaults
    DEFAULT_LUNAR_PHASE,
    DEFAULT_SUN_SIGN,
    DEFAULT_moon_SIGN,
    DEFAULT_RISING_SIGN,
    DEFAULT_PLANETARY_ALIGNMENT,
    DEFAULT_PLANETARY_POSITIONS,
    DEFAULT_ASTROLOGICAL_STATE,
    // Energy defaults
    DEFAULT_ZODIAC_ENERGIES,
    DEFAULT_THERMODYNAMIC_PROPERTIES,
    DEFAULT_MODALITY_DISTRIBUTION,
    // Recipe defaults
    DEFAULT_RECIPE_ELEMENTAL_VALUES,
    DEFAULT_FOOD_RECOMMENDATION,
    DEFAULT_NUTRITIONAL_PROFILE,
    // System defaults
    DEFAULT_CALCULATION_PARAMS,
    DEFAULT_COMPATIBILITY_THRESHOLDS,
    DEFAULT_ERROR_MESSAGES,
    DEFAULT_RETRY_CONFIG,
    DEFAULT_SYSTEM_CONFIG,
    DEFAULT_API_CONFIG,
    // Utility functions
    cloneDefault,
    getDefaultElementalProperties,
    getDefaultAstrologicalState,
    getDefaultPlanetaryPositions,
    getLatestPlanetaryPositions,
    mergeWithDefaults,
    validateAgainstDefaults
};
