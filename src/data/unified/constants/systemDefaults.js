"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAgainstDefaults = exports.mergeWithDefaults = exports.getDefaultPlanetaryPositions = exports.getDefaultAstrologicalState = exports.getDefaultElementalProperties = exports.cloneDefault = exports.DEFAULT_API_CONFIG = exports.DEFAULT_SYSTEM_CONFIG = exports.DEFAULT_RETRY_CONFIG = exports.DEFAULT_ERROR_MESSAGES = exports.DEFAULT_COMPATIBILITY_THRESHOLDS = exports.DEFAULT_CALCULATION_PARAMS = exports.DEFAULT_NUTRITIONAL_PROFILE = exports.DEFAULT_FOOD_RECOMMENDATION = exports.DEFAULT_RECIPE_ELEMENTAL_VALUES = exports.DEFAULT_MODALITY_DISTRIBUTION = exports.DEFAULT_THERMODYNAMIC_PROPERTIES = exports.DEFAULT_ZODIAC_ENERGIES = exports.DEFAULT_ASTROLOGICAL_STATE = exports.DEFAULT_CHAKRA_ENERGIES = exports.DEFAULT_PLANETARY_POSITIONS = exports.DEFAULT_PLANETARY_ALIGNMENT = exports.DEFAULT_RISING_SIGN = exports.DEFAULT_moon_SIGN = exports.DEFAULT_SUN_SIGN = exports.DEFAULT_LUNAR_PHASE = exports.DEFAULT_ALCHEMICAL_VALUES = exports.DEFAULT_ELEMENTAL_PROPERTIES = void 0;
/**
 * System defaults - consolidated from multiple files
 * This file replaces default values scattered across defaults.ts and other files
 */
// ===== CORE ELEMENTAL DEFAULTS =====
/**
 * Default elemental properties with balanced values
 */
exports.DEFAULT_ELEMENTAL_PROPERTIES = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
};
/**
 * Default alchemical values with standard distribution
 */
exports.DEFAULT_ALCHEMICAL_VALUES = {
    Spirit: 0.29,
    Essence: 0.28,
    Matter: 0.21,
    Substance: 0.22
};
// ===== ASTROLOGICAL DEFAULTS =====
/**
 * Default lunar phase
 */
exports.DEFAULT_LUNAR_PHASE = 'new moon';
/**
 * Default zodiac signs
 */
exports.DEFAULT_SUN_SIGN = 'aries';
exports.DEFAULT_moon_SIGN = 'taurus';
exports.DEFAULT_RISING_SIGN = 'leo';
/**
 * Default planetary alignment with safe values
 * NOTE: For type safety only. Do NOT use for live calculations or UI. Always use real planetary positions.
 */
exports.DEFAULT_PLANETARY_ALIGNMENT = {
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
 * Default planetary positions for Sun and Moon
 */
exports.DEFAULT_PLANETARY_POSITIONS = {
    Sun: {
        sign: 'aries',
        degree: 15,
        exactLongitude: 15.5,
        isRetrograde: false
    },
    Moon: {
        sign: 'taurus',
        degree: 8,
        exactLongitude: 38.2,
        isRetrograde: false
    },
    Mercury: {
        sign: 'gemini',
        degree: 10,
        exactLongitude: 70.0,
        isRetrograde: false
    },
    Venus: {
        sign: 'libra',
        degree: 12,
        exactLongitude: 192.0,
        isRetrograde: false
    },
    Mars: {
        sign: 'aries',
        degree: 20,
        exactLongitude: 20.0,
        isRetrograde: false
    },
    Jupiter: {
        sign: 'sagittarius',
        degree: 5,
        exactLongitude: 245.0,
        isRetrograde: false
    },
    Saturn: {
        sign: 'capricorn',
        degree: 18,
        exactLongitude: 288.0,
        isRetrograde: false
    },
    Uranus: {
        sign: 'aquarius',
        degree: 25,
        exactLongitude: 325.0,
        isRetrograde: false
    },
    Neptune: {
        sign: 'pisces',
        degree: 14,
        exactLongitude: 344.0,
        isRetrograde: false
    },
    Pluto: {
        sign: 'scorpio',
        degree: 22,
        exactLongitude: 232.0,
        isRetrograde: false
    }
};
// ===== CHAKRA DEFAULTS =====
/**
 * Default chakra energies with neutral values
 */
exports.DEFAULT_CHAKRA_ENERGIES = {
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
exports.DEFAULT_ASTROLOGICAL_STATE = {
    sunSign: exports.DEFAULT_SUN_SIGN,
    moonSign: exports.DEFAULT_moon_SIGN,
    lunarPhase: exports.DEFAULT_LUNAR_PHASE,
    risingSign: exports.DEFAULT_RISING_SIGN,
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
    elementalProfile: exports.DEFAULT_ELEMENTAL_PROPERTIES,
    planetaryPositions: exports.DEFAULT_PLANETARY_POSITIONS,
    isDaytime: true,
    activePlanets: ['Sun', 'Moon'],
    activeAspects: [],
    zodiacSign: exports.DEFAULT_SUN_SIGN,
    calculationError: false,alchemicalValues: exports.DEFAULT_ALCHEMICAL_VALUES
};
// ===== ENERGY AND CALCULATION DEFAULTS =====
/**
 * Default zodiac energies
 * NOTE: For type safety only. Do NOT use for live calculations or UI. Always use real calculated values.
 */
exports.DEFAULT_ZODIAC_ENERGIES = {
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
exports.DEFAULT_THERMODYNAMIC_PROPERTIES = {
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
exports.DEFAULT_MODALITY_DISTRIBUTION = {
    cardinal: 0.33,
    fixed: 0.33,
    mutable: 0.34
};
// ===== RECIPE AND FOOD DEFAULTS =====
/**
 * Default recipe elemental values
 */
exports.DEFAULT_RECIPE_ELEMENTAL_VALUES = { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2
};
/**
 * Default food recommendation
 */
exports.DEFAULT_FOOD_RECOMMENDATION = {
    cuisine: 'balanced',
    elements: exports.DEFAULT_RECIPE_ELEMENTAL_VALUES,
    recommendation: 'A balanced meal with a variety of fresh ingredients',
    score: 0.5,
    confidence: 0.7
};
/**
 * Default nutritional profile
 */
exports.DEFAULT_NUTRITIONAL_PROFILE = {
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
exports.DEFAULT_CALCULATION_PARAMS = {
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
exports.DEFAULT_COMPATIBILITY_THRESHOLDS = {
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
exports.DEFAULT_ERROR_MESSAGES = {
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
exports.DEFAULT_RETRY_CONFIG = {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
    maxDelay: 10000
};
// ===== SYSTEM CONFIGURATION DEFAULTS =====
/**
 * Default system configuration
 */
exports.DEFAULT_SYSTEM_CONFIG = {
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
exports.DEFAULT_API_CONFIG = {
    timeout: 30000,
    retries: 3,
    rateLimit: 100,
    cacheDuration: 300000
};
// ===== UTILITY FUNCTIONS =====
/**
 * Clone a default object to prevent mutation
 */
function cloneDefault(defaultObject) {
    if (typeof defaultObject !== 'object' || defaultObject === null) {
        return defaultObject;
    }
    if (Array.isArray(defaultObject)) {
        return defaultObject.map(item => cloneDefault(item));
    }
    const cloned = {};
    for (const key in defaultObject) {
        if (defaultObject.hasOwnProperty(key)) {
            cloned[key] = cloneDefault(defaultObject[key]);
        }
    }
    return cloned;
}
exports.cloneDefault = cloneDefault;
/**
 * Get default elemental properties
 */
function getDefaultElementalProperties() {
    return cloneDefault(exports.DEFAULT_ELEMENTAL_PROPERTIES);
}
exports.getDefaultElementalProperties = getDefaultElementalProperties;
/**
 * Get default astrological state
 */
function getDefaultAstrologicalState() {
    return cloneDefault(exports.DEFAULT_ASTROLOGICAL_STATE);
}
exports.getDefaultAstrologicalState = getDefaultAstrologicalState;
/**
 * Get default planetary positions
 */
function getDefaultPlanetaryPositions() {
    return cloneDefault(exports.DEFAULT_PLANETARY_POSITIONS);
}
exports.getDefaultPlanetaryPositions = getDefaultPlanetaryPositions;
/**
 * Merge user values with defaults
 */
function mergeWithDefaults(userValues, defaults) {
    const result = cloneDefault(defaults);
    for (const key in userValues) {
        if (userValues.hasOwnProperty(key) && userValues[key] !== undefined) {
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
exports.mergeWithDefaults = mergeWithDefaults;
/**
 * Validate values against defaults structure
 */
function validateAgainstDefaults(values, defaults) {
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
exports.validateAgainstDefaults = validateAgainstDefaults;
exports.default = {
    // Core defaults
    DEFAULT_ELEMENTAL_PROPERTIES: exports.DEFAULT_ELEMENTAL_PROPERTIES,
    DEFAULT_ALCHEMICAL_VALUES: exports.DEFAULT_ALCHEMICAL_VALUES,
    DEFAULT_CHAKRA_ENERGIES: exports.DEFAULT_CHAKRA_ENERGIES,
    // Astrological defaults
    DEFAULT_LUNAR_PHASE: exports.DEFAULT_LUNAR_PHASE,
    DEFAULT_SUN_SIGN: exports.DEFAULT_SUN_SIGN,
    DEFAULT_moon_SIGN: exports.DEFAULT_moon_SIGN,
    DEFAULT_RISING_SIGN: exports.DEFAULT_RISING_SIGN,
    DEFAULT_PLANETARY_ALIGNMENT: exports.DEFAULT_PLANETARY_ALIGNMENT,
    DEFAULT_PLANETARY_POSITIONS: exports.DEFAULT_PLANETARY_POSITIONS,
    DEFAULT_ASTROLOGICAL_STATE: exports.DEFAULT_ASTROLOGICAL_STATE,
    // Energy defaults
    DEFAULT_ZODIAC_ENERGIES: exports.DEFAULT_ZODIAC_ENERGIES,
    DEFAULT_THERMODYNAMIC_PROPERTIES: exports.DEFAULT_THERMODYNAMIC_PROPERTIES,
    DEFAULT_MODALITY_DISTRIBUTION: exports.DEFAULT_MODALITY_DISTRIBUTION,
    // Recipe defaults
    DEFAULT_RECIPE_ELEMENTAL_VALUES: exports.DEFAULT_RECIPE_ELEMENTAL_VALUES,
    DEFAULT_FOOD_RECOMMENDATION: exports.DEFAULT_FOOD_RECOMMENDATION,
    DEFAULT_NUTRITIONAL_PROFILE: exports.DEFAULT_NUTRITIONAL_PROFILE,
    // System defaults
    DEFAULT_CALCULATION_PARAMS: exports.DEFAULT_CALCULATION_PARAMS,
    DEFAULT_COMPATIBILITY_THRESHOLDS: exports.DEFAULT_COMPATIBILITY_THRESHOLDS,
    DEFAULT_ERROR_MESSAGES: exports.DEFAULT_ERROR_MESSAGES,
    DEFAULT_RETRY_CONFIG: exports.DEFAULT_RETRY_CONFIG,
    DEFAULT_SYSTEM_CONFIG: exports.DEFAULT_SYSTEM_CONFIG,
    DEFAULT_API_CONFIG: exports.DEFAULT_API_CONFIG,
    // Utility functions
    cloneDefault,
    getDefaultElementalProperties,
    getDefaultAstrologicalState,
    getDefaultPlanetaryPositions,
    mergeWithDefaults,
    validateAgainstDefaults
};
