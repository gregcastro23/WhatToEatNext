import { CHAKRA_NUTRITIONAL_CORRELATIONS, CHAKRA_HERBS } from "@/constants/chakraSymbols";
import { Element , ElementalProperties ,
  AlchemicalValues,
  ChakraEnergies,
  LunarPhase,
  ZodiacSign,
  alchemicalValues,
  LunarPhaseWithSpaces 
} from "@/types/alchemy";
import { PlanetaryAlignment , AstrologicalState , PlanetaryPosition, CelestialPosition, AlchemicalProperties } from "@/types/celestial";
import { Recipe } from '@/types/recipe';

/**
 * System defaults - consolidated from multiple files
 * This file replaces default values scattered across defaults.ts and other files
 */

// ===== CORE ELEMENTAL DEFAULTS =====

/**
 * Default elemental properties with balanced values
 */
export const DEFAULT_ELEMENTAL_PROPERTIES: ElementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
 };

/**
 * Default alchemical values with standard distribution
 */
export const DEFAULT_ALCHEMICAL_VALUES: AlchemicalValues = {
  Spirit: 0.29,
  Essence: 0.28,
  Matter: 0.21,
  Substance: 0.22
};

// ===== ASTROLOGICAL DEFAULTS =====

/**
 * Default lunar phase
 */
export const DEFAULT_LUNAR_PHASE: LunarPhase = 'new moon';

/**
 * Default zodiac signs
 */
export const DEFAULT_SUN_SIGN: ZodiacSign = 'aries';
export const DEFAULT_moon_SIGN: ZodiacSign = 'taurus';
export const DEFAULT_RISING_SIGN: ZodiacSign = 'leo';

/**
 * Default planetary alignment with safe values
 * NOTE: For type safety only. Do NOT use for live calculations or UI. Always use real planetary positions.
 */
export const DEFAULT_PLANETARY_ALIGNMENT: PlanetaryAlignment = {
  Sun: { sign: 'aries', degree: 0 },
  Moon: { sign: 'taurus', degree: 0 },
  Mercury: { sign: 'gemini', degree: 0 },
  Venus: { sign: 'libra', degree: 0 },
  Mars: { sign: 'aries', degree: 0 },
  Jupiter: { sign: 'sagittarius', degree: 0 },
  Saturn: { sign: 'capricorn', degree: 0 },
  Uranus: { sign: 'aquarius', degree: 0 },
  Neptune: { sign: 'pisces', degree: 0 },
  Pluto: { sign: 'scorpio', degree: 0 }
};

/**
 * Default planetary positions for July 2, 2025 at 10:45 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:11 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:11 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:11 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:11 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:11 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:11 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:11 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:11 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:11 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:11 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:11 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:15 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:15 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:15 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:16 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:17 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:19 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:19 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:20 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:21 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:21 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:21 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:21 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:21 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:21 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:21 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:23 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:36 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:36 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:36 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:36 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:36 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:36 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:36 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:36 PM EDT
 */
/**
 * Default planetary positions for July 2, 2025 at 11:36 PM EDT
 */
export const DEFAULT_PLANETARY_POSITIONS: Record<string, CelestialPosition> = {
  Sun: {
    sign: 'cancer' as ZodiacSign,
    degree: 101.48333333333333,
    exactLongitude: 101.4844,
    isRetrograde: false
  },
  Moon: {
    sign: 'libra' as ZodiacSign,
    degree: 195.16666666666666,
    exactLongitude: 195.18319999999994,
    isRetrograde: false
  },
  Mercury: {
    sign: 'leo' as ZodiacSign,
    degree: 127.38333333333334,
    exactLongitude: 127.38920000000002,
    isRetrograde: false
  },
  Venus: {
    sign: 'taurus' as ZodiacSign,
    degree: 58.35,
    exactLongitude: 58.35340000000002,
    isRetrograde: false
  },
  Mars: {
    sign: 'virgo' as ZodiacSign,
    degree: 159,
    exactLongitude: 159.0158,
    isRetrograde: false
  },
  Jupiter: {
    sign: 'cancer' as ZodiacSign,
    degree: 95.3,
    exactLongitude: 95.30540000000002,
    isRetrograde: false
  },
  Saturn: {
    sign: 'aries' as ZodiacSign,
    degree: 1.85,
    exactLongitude: 1.8501999999999725,
    isRetrograde: false
  },
  Uranus: {
    sign: 'taurus' as ZodiacSign,
    degree: 59.8,
    exactLongitude: 59.8091,
    isRetrograde: false
  },
  Neptune: {
    sign: 'aries' as ZodiacSign,
    degree: 2.1666666666666665,
    exactLongitude: 2.174699999999973,
    isRetrograde: false
  },
  Pluto: {
    sign: 'aquarius' as ZodiacSign,
    degree: 303.0833333333333,
    exactLongitude: 303.09529999999995,
    isRetrograde: false
  },
  Chiron: {
    sign: 'aries' as ZodiacSign,
    degree: 26.933333333333334,
    exactLongitude: 26.939399999999978,
    isRetrograde: false
  },
  Sirius: {
    sign: 'aries' as ZodiacSign,
    degree: 1.7666666666666666,
    exactLongitude: 1.7726000000000113,
    isRetrograde: false
  },
};

// ===== CHAKRA DEFAULTS =====

/**
 * Default chakra energies with neutral values
 */
export const DEFAULT_CHAKRA_ENERGIES: ChakraEnergies = {
  root: 0.5,
  sacral: 0.5,
  solarPlexus: 0.5,
  heart: 0.5,
  throat: 0.5,
  thirdEye: 0.5,
  crown: 0.5
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
  planetaryPositions: {
    Sun: { sign: 'aries' as ZodiacSign, degree: 15 },
    Moon: { sign: 'taurus' as ZodiacSign, degree: 8 },
    Mercury: { sign: 'gemini' as ZodiacSign, degree: 10 },
    Venus: { sign: 'libra' as ZodiacSign, degree: 12 },
    Mars: { sign: 'aries' as ZodiacSign, degree: 20 },
    Jupiter: { sign: 'sagittarius' as ZodiacSign, degree: 5 },
    Saturn: { sign: 'capricorn' as ZodiacSign, degree: 18 },
    Uranus: { sign: 'aquarius' as ZodiacSign, degree: 25 },
    Neptune: { sign: 'pisces' as ZodiacSign, degree: 14 },
    Pluto: { sign: 'scorpio' as ZodiacSign, degree: 22 }
  },
  isDaytime: true,
  activePlanets: ['Sun', 'Moon'],
  activeAspects: [],
  currentZodiacSign: DEFAULT_SUN_SIGN,
  calculationError: false,
  alchemicalValues: DEFAULT_ALCHEMICAL_VALUES as AlchemicalProperties
} as AstrologicalState;

// ===== ENERGY AND CALCULATION DEFAULTS =====

/**
 * Default zodiac energies
 * NOTE: For type safety only. Do NOT use for live calculations or UI. Always use real calculated values.
 */
export const DEFAULT_ZODIAC_ENERGIES: { [key: string]: number } = {
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
export const DEFAULT_RECIPE_ELEMENTAL_VALUES = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25
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
  cacheTimeout: 300000, // 5 minutes
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
export function cloneDefault<T>(defaultObject: T): T {
  if (typeof defaultObject !== 'object' || defaultObject === null) {
    return defaultObject;
  }
  
  if (Array.isArray(defaultObject)) {
    return (defaultObject || []).map(item => cloneDefault(item)) as unknown as T;
  }
  
  const cloned = {} as T;
  for (const key in defaultObject) {
    if (defaultObject.hasOwnProperty(key)) {
      cloned[key] = cloneDefault(defaultObject[key]);
    }
  }
  
  return cloned;
}

/**
 * Get default elemental properties
 */
export function getDefaultElementalProperties(): ElementalProperties {
  return cloneDefault(DEFAULT_ELEMENTAL_PROPERTIES);
}

/**
 * Get default astrological state
 */
export function getDefaultAstrologicalState(): AstrologicalState {
  return cloneDefault(DEFAULT_ASTROLOGICAL_STATE);
}

/**
 * Get default planetary positions
 */
export function getDefaultPlanetaryPositions(): Record<string, CelestialPosition> {
  return cloneDefault(DEFAULT_PLANETARY_POSITIONS) ;
}

/**
 * Merge user values with defaults
 */
export function mergeWithDefaults<T extends Record<string, any>>(
  userValues: Partial<T>,
  defaults: T,
): T {
  const result = cloneDefault(defaults);
  
  for (const key in userValues) {
    if (userValues.hasOwnProperty(key) && userValues[key] !== undefined) {
      if (typeof userValues[key] === 'object' && 
          typeof defaults[key] === 'object' && 
          !Array.isArray(userValues[key])) {
        result[key] = mergeWithDefaults(userValues[key], defaults[key]);
      } else {
        result[key] = userValues[key];
      }
    }
  }
  
  return result;
}

/**
 * Validate values against defaults structure
 */
export function validateAgainstDefaults<T extends object>(
  values: Partial<T>,
  defaults: T,
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for unknown keys
  for (const key in values) {
    if (!(key in defaults)) {
      errors?.push(`Unknown property: ${key}`);
    }
  }
  
  // Check for type mismatches
  for (const key in defaults) {
    if (key in values) {
      const defaultType = typeof defaults[key];
      const valueType = typeof values[key];
      
      if (defaultType !== valueType && values[key] !== null && values[key] !== undefined) {
        errors?.push(`Type mismatch for ${key}: expected ${defaultType}, got ${valueType}`);
      }
    }
  }
  
  return {
    isValid: (errors || []).length === 0,
    errors
  };
}

/**
 * DEPRECATED: Use getLatestAstrologicalState from '@/services/AstrologicalService' instead.
 * This placeholder will throw if called.
 */
export function getLatestAstrologicalState() {
  throw new Error('getLatestAstrologicalState is deprecated in systemDefaults.ts. Import from \'@/services/AstrologicalService\' instead.');
}

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
  mergeWithDefaults,
  validateAgainstDefaults,
  getLatestAstrologicalState
}; 