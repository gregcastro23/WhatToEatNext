import type {
  ElementalProperties,
  AstrologicalState,
  ChakraEnergies,
  LunarPhase,
  ZodiacSign,
  PlanetaryAlignment,
  AlchemicalValues,
  PlanetaryPosition,
  CelestialPosition,
  LunarPhaseWithSpaces
} from '@/types/alchemy';

/**
 * Default elemental properties with balanced values
 */
export const DEFAULT_ELEMENTAL_PROPERTIES: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25
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

/**
 * Default lunar phase
 */
export const DEFAULT_LUNAR_PHASE: LunarPhase = 'new moon';

/**
 * Default zodiac sign
 */
export const DEFAULT_SUN_SIGN: ZodiacSign = 'aries';
export const DEFAULT_MOON_SIGN: ZodiacSign = 'taurus';

/**
 * ENHANCED: Dynamic planetary alignment factory function
 * Replaces static placeholder with functional calculation based on current time
 */
export function createCurrentPlanetaryAlignment(dateTime?: Date): PlanetaryAlignment {
  const date = dateTime || new Date();
  
  // Calculate approximate positions based on date (simplified ephemeris)
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Enhanced planetary positions with actual orbital mechanics approximation
  return {
    sun: { 
      sign: getSunSignForDate(date),
      degree: getSunDegreeForDate(date),
      exactLongitude: getSunLongitude(date)
    },
    moon: { 
      sign: getMoonSignForDate(date),
      degree: getMoonDegreeForDate(date),
      exactLongitude: getMoonLongitude(date)
    },
    mercury: { 
      sign: getMercurySignForDate(date),
      degree: getMercuryDegreeForDate(date),
      exactLongitude: getMercuryLongitude(date)
    },
    venus: { 
      sign: getVenusSignForDate(date),
      degree: getVenusDegreeForDate(date),
      exactLongitude: getVenusLongitude(date)
    },
    mars: { 
      sign: getMarsSignForDate(date),
      degree: getMarsDegreeForDate(date),
      exactLongitude: getMarsLongitude(date)
    },
    jupiter: { 
      sign: getJupiterSignForDate(date),
      degree: getJupiterDegreeForDate(date),
      exactLongitude: getJupiterLongitude(date)
    },
    saturn: { 
      sign: getSaturnSignForDate(date),
      degree: getSaturnDegreeForDate(date),
      exactLongitude: getSaturnLongitude(date)
    },
    uranus: { 
      sign: getUranusSignForDate(date),
      degree: getUranusDegreeForDate(date),
      exactLongitude: getUranusLongitude(date)
    },
    neptune: { 
      sign: getNeptuneSignForDate(date),
      degree: getNeptuneDegreeForDate(date),
      exactLongitude: getNeptuneLongitude(date)
    },
    pluto: { 
      sign: getPlutoSignForDate(date),
      degree: getPlutoDegreeForDate(date),
      exactLongitude: getPlutoLongitude(date)
    }
  };
}

// ENHANCED CALCULATION FUNCTIONS: Replace placeholder astronomy with functional calculations

function getSunSignForDate(date: Date): ZodiacSign {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
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

function getSunDegreeForDate(date: Date): number {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor((dayOfYear * 360 / 365) % 30);
}

function getSunLongitude(date: Date): number {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return (dayOfYear * 360 / 365) % 360;
}

function getMoonSignForDate(date: Date): ZodiacSign {
  // Moon cycles through all signs roughly every 27.3 days
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24)) - 19358; // Jan 1, 2023 reference
  const lunarCycle = (daysSinceEpoch % 27.3) / 27.3;
  const signIndex = Math.floor(lunarCycle * 12);
  const signs: ZodiacSign[] = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  return signs[signIndex];
}

function getMoonDegreeForDate(date: Date): number {
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  return Math.floor((daysSinceEpoch * 13.2) % 30); // Moon moves ~13.2 degrees per day
}

function getMoonLongitude(date: Date): number {
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  return (daysSinceEpoch * 13.2) % 360;
}

// Mercury functions (88-day orbital period)
function getMercurySignForDate(date: Date): ZodiacSign { 
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const mercuryCycle = (daysSinceEpoch % 88) / 88;
  const signIndex = Math.floor(mercuryCycle * 12);
  const signs: ZodiacSign[] = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  return signs[signIndex];
}
function getMercuryDegreeForDate(date: Date): number { return Math.floor((date.getTime() / (1000 * 60 * 60 * 24 * 88) * 360) % 30); }
function getMercuryLongitude(date: Date): number { return (date.getTime() / (1000 * 60 * 60 * 24 * 88) * 360) % 360; }

// Venus functions (225-day orbital period)  
function getVenusSignForDate(date: Date): ZodiacSign { 
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const venusCycle = (daysSinceEpoch % 225) / 225;
  const signIndex = Math.floor(venusCycle * 12);
  const signs: ZodiacSign[] = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  return signs[signIndex];
}
function getVenusDegreeForDate(date: Date): number { return Math.floor((date.getTime() / (1000 * 60 * 60 * 24 * 225) * 360) % 30); }
function getVenusLongitude(date: Date): number { return (date.getTime() / (1000 * 60 * 60 * 24 * 225) * 360) % 360; }

// Mars functions (687-day orbital period)
function getMarsSignForDate(date: Date): ZodiacSign { 
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const marsCycle = (daysSinceEpoch % 687) / 687;
  const signIndex = Math.floor(marsCycle * 12);
  const signs: ZodiacSign[] = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  return signs[signIndex];
}
function getMarsDegreeForDate(date: Date): number { return Math.floor((date.getTime() / (1000 * 60 * 60 * 24 * 687) * 360) % 30); }
function getMarsLongitude(date: Date): number { return (date.getTime() / (1000 * 60 * 60 * 24 * 687) * 360) % 360; }

// Jupiter functions (4,333-day orbital period)
function getJupiterSignForDate(date: Date): ZodiacSign { 
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const jupiterCycle = (daysSinceEpoch % 4333) / 4333;
  const signIndex = Math.floor(jupiterCycle * 12);
  const signs: ZodiacSign[] = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  return signs[signIndex];
}
function getJupiterDegreeForDate(date: Date): number { return Math.floor((date.getTime() / (1000 * 60 * 60 * 24 * 4333) * 360) % 30); }
function getJupiterLongitude(date: Date): number { return (date.getTime() / (1000 * 60 * 60 * 24 * 4333) * 360) % 360; }

// Saturn functions (10,759-day orbital period)
function getSaturnSignForDate(date: Date): ZodiacSign { 
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const saturnCycle = (daysSinceEpoch % 10759) / 10759;
  const signIndex = Math.floor(saturnCycle * 12);
  const signs: ZodiacSign[] = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  return signs[signIndex];
}
function getSaturnDegreeForDate(date: Date): number { return Math.floor((date.getTime() / (1000 * 60 * 60 * 24 * 10759) * 360) % 30); }
function getSaturnLongitude(date: Date): number { return (date.getTime() / (1000 * 60 * 60 * 24 * 10759) * 360) % 360; }

// Uranus functions (30,687-day orbital period)
function getUranusSignForDate(date: Date): ZodiacSign { 
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const uranusCycle = (daysSinceEpoch % 30687) / 30687;
  const signIndex = Math.floor(uranusCycle * 12);
  const signs: ZodiacSign[] = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  return signs[signIndex];
}
function getUranusDegreeForDate(date: Date): number { return Math.floor((date.getTime() / (1000 * 60 * 60 * 24 * 30687) * 360) % 30); }
function getUranusLongitude(date: Date): number { return (date.getTime() / (1000 * 60 * 60 * 24 * 30687) * 360) % 360; }

// Neptune functions (60,190-day orbital period)
function getNeptuneSignForDate(date: Date): ZodiacSign { 
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const neptuneCycle = (daysSinceEpoch % 60190) / 60190;
  const signIndex = Math.floor(neptuneCycle * 12);
  const signs: ZodiacSign[] = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  return signs[signIndex];
}
function getNeptuneDegreeForDate(date: Date): number { return Math.floor((date.getTime() / (1000 * 60 * 60 * 24 * 60190) * 360) % 30); }
function getNeptuneLongitude(date: Date): number { return (date.getTime() / (1000 * 60 * 60 * 24 * 60190) * 360) % 360; }

// Pluto functions (90,560-day orbital period)
function getPlutoSignForDate(date: Date): ZodiacSign { 
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const plutoCycle = (daysSinceEpoch % 90560) / 90560;
  const signIndex = Math.floor(plutoCycle * 12);
  const signs: ZodiacSign[] = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  return signs[signIndex];
}
function getPlutoDegreeForDate(date: Date): number { return Math.floor((date.getTime() / (1000 * 60 * 60 * 24 * 90560) * 360) % 30); }
function getPlutoLongitude(date: Date): number { return (date.getTime() / (1000 * 60 * 60 * 24 * 90560) * 360) % 360; }

// FALLBACK: Only for backward compatibility - use createCurrentPlanetaryAlignment() instead
export const DEFAULT_PLANETARY_ALIGNMENT: PlanetaryAlignment = createCurrentPlanetaryAlignment();

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
export const DEFAULT_ASTROLOGICAL_STATE = {
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
export const DEFAULT_ZODIAC_ENERGIES: Record<string, number> = {
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
};

/**
 * Default thermodynamic properties
 */
export const DEFAULT_THERMODYNAMIC_PROPERTIES = {
  heat: 0.5,
  entropy: 0.5,
  reactivity: 0.5,
  energy: 0
};

/**
 * Default modality distribution
 */
export const DEFAULT_MODALITY_DISTRIBUTION = {
  cardinal: 0.33,
  fixed: 0.33,
  mutable: 0.34
};

/**
 * Default error message templates
 */
export const DEFAULT_ERROR_MESSAGES = {
  calculation: 'Error in astrological calculation',
  missing_data: 'Missing required data for calculation',
  invalid_input: 'Invalid input data provided',
  connection: 'Error connecting to astrological service',
  timeout: 'Operation timed out',
  initialization: 'Error initializing alchemical engine'
};

/**
 * Default recipe elemental values
 */
export const DEFAULT_RECIPE_ELEMENTAL_VALUES = {
  Fire: 0.3,
  Water: 0.3,
  Earth: 0.2,
  Air: 0.2
};

/**
 * Default food recommendation
 */
export const DEFAULT_FOOD_RECOMMENDATION = {
  cuisine: 'balanced',
  elements: DEFAULT_RECIPE_ELEMENTAL_VALUES,
  recommendation: 'A balanced meal with a variety of fresh ingredients'
};

/**
 * Default calculation parameters
 */
export const DEFAULT_CALCULATION_PARAMS = {
  useAspects: true,
  usePlanetaryHours: true,
  useLunarPhase: true,
  useSeasonalFactors: true,
  useElementalAffinity: true,
  defaultWeight: 1.0
};

/**
 * Create deep copy of default objects to prevent accidental modification
 * @param defaultObject The default object to clone
 * @returns A deep copy of the default object
 */
export function cloneDefault<T>(defaultObject: T): T {
  return JSON.parse(JSON.stringify(defaultObject));
} 