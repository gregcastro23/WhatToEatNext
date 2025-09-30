import type {
    AlchemicalValues,
    AstrologicalState,
    CelestialPosition,
    ChakraEnergies,
    ElementalProperties,
    LunarPhase,
    PlanetaryAlignment
} from '@/types/alchemy';

/**
 * Default elemental properties with balanced values
 */
export const DEFAULT_ELEMENTAL_PROPERTIES: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25
}

/**
 * Default alchemical values with standard distribution
 */
export const DEFAULT_ALCHEMICAL_VALUES: AlchemicalValues = {
  Spirit: 0.29,
  Essence: 0.28,
  Matter: 0.21,
  Substance: 0.22
}

/**
 * Default chakra energies with neutral values
 */
export const _DEFAULT_CHAKRA_ENERGIES: ChakraEnergies = {
  root: 0.5,
  sacral: 0.5,
  solarPlexus: 0.5,
  heart: 0.5,
  throat: 0.5,
  thirdEye: 0.5,
  crown: 0.5
}

/**
 * Default lunar phase
 */
export const DEFAULT_LUNAR_PHASE: LunarPhase = 'new moon';

/**
 * Default zodiac sign
 */
export const DEFAULT_SUN_SIGN: any = 'aries';
export const DEFAULT_MOON_SIGN: any = 'taurus';

/**
 * Default planetary alignment with safe values
 */
export const _DEFAULT_PLANETARY_ALIGNMENT: PlanetaryAlignment = {
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
}

/**
 * Default planetary positions for Sun and Moon
 */
export const DEFAULT_PLANETARY_POSITIONS: Record<string, CelestialPosition> = {
  sun: {
    sign: 'aries',
    degree: 15,
    exactLongitude: 15.5,
    isRetrograde: false
},
  moon: {
    sign: 'taurus',
    degree: 8,
    exactLongitude: 38.2,
    isRetrograde: false
}
} as Record<string, CelestialPosition>;

/**
 * Default astrological state with safe values for all required properties
 */
export const _DEFAULT_ASTROLOGICAL_STATE = {
  sunSign: DEFAULT_SUN_SIGN,
  moonSign: DEFAULT_MOON_SIGN,
  lunarPhase: DEFAULT_LUNAR_PHASE,
  risingSign: 'leo',
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
  elementalProfile: {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
},
  planetaryPositions: DEFAULT_PLANETARY_POSITIONS,
  isDaytime: true,
  activePlanets: ['sun', 'moon'],
  activeAspects: [],
  zodiacSign: DEFAULT_SUN_SIGN,
  calculationError: false,
  elementalBalance: DEFAULT_ELEMENTAL_PROPERTIES,
  alchemicalValues: DEFAULT_ALCHEMICAL_VALUES
} as AstrologicalState;

/**
 * Default zodiac energies
 */
export const _DEFAULT_ZODIAC_ENERGIES: Record<string, number> = {
  aries: 0.25,
  taurus: 0.25,
  gemini: 0.25,
  cancer: 0.25,
  leo: 0.25,
  virgo: 0.25,
  libra: 0.25,
  scorpio: 0.25,
  sagittarius: 0.25,
  capricorn: 0.25,
  aquarius: 0.25,
  pisces: 0.25
}

/**
 * Default thermodynamic properties
 */
export const _DEFAULT_THERMODYNAMIC_PROPERTIES = {
  heat: 0.5,
  entropy: 0.5,
  reactivity: 0.5,
  energy: 0
}

/**
 * Default modality distribution
 */
export const _DEFAULT_MODALITY_DISTRIBUTION = {
  cardinal: 0.33,
  fixed: 0.33,
  mutable: 0.34
}

/**
 * Default error message templates
 */
export const _DEFAULT_ERROR_MESSAGES = {
  calculation: 'Error in astrological calculation',
  missing_data: 'Missing required data for calculation',
  invalid_input: 'Invalid input data provided',
  connection: 'Error connecting to astrological service',
  timeout: 'Operation timed out',
  initialization: 'Error initializing alchemical engine'
}

/**
 * Default recipe elemental values
 */
export const DEFAULT_RECIPE_ELEMENTAL_VALUES = {
  Fire: 0.3,
  Water: 0.3,
  Earth: 0.2,
  Air: 0.2
}

/**
 * Default food recommendation
 */
export const _DEFAULT_FOOD_RECOMMENDATION = {
  cuisine: 'balanced',
  elements: DEFAULT_RECIPE_ELEMENTAL_VALUES,
  recommendation: 'A balanced meal with a variety of fresh ingredients'
}

/**
 * Default calculation parameters
 */
export const _DEFAULT_CALCULATION_PARAMS = {
  useAspects: true,
  usePlanetaryHours: true,
  useLunarPhase: true,
  useSeasonalFactors: true,
  useElementalAffinity: true,
  defaultWeight: 1.0
}

/**
 * Create deep copy of default objects to prevent accidental modification
 * @param defaultObject The default object to clone
 * @returns A deep copy of the default object
 */
export function cloneDefault<T>(defaultObject: T): T {
  return JSON.parse(JSON.stringify(defaultObject))
}
