/**
 * Types for the alchemical system
 */

export enum AlchemicalDispatchType {
  UPDATE_ASTROLOGICAL_STATE = 'UPDATE_ASTROLOGICAL_STATE',
  RESET_STATE = 'RESET_STATE',
  SET_ELEMENT = 'SET_ELEMENT',
  UPDATE_PLANETARY_POSITIONS = 'UPDATE_PLANETARY_POSITIONS',
  UPDATE_ELEMENTAL_STATE = 'UPDATE_ELEMENTAL_STATE',
  UPDATE_STATE = 'UPDATE_STATE',
  SET_DAYTIME = 'SET_DAYTIME',
  SET_SEASONAL_STATE = 'SET_SEASONAL_STATE',
  SET_ELEMENTAL_PREFERENCE = 'SET_ELEMENTAL_PREFERENCE',
  SET_ELEMENTAL_STATE = 'SET_ELEMENTAL_STATE',
  SET_ZODIAC_ENERGY = 'SET_ZODIAC_ENERGY',
  SET_LUNAR_ENERGY = 'SET_LUNAR_ENERGY',
  SET_PLANETARY_ENERGY = 'SET_PLANETARY_ENERGY',
  SET_ASTROLOGICAL_STATE = 'SET_ASTROLOGICAL_STATE',
  SET_ERROR = 'SET_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
  ADD_ERROR = 'ADD_ERROR',
  SET_ALCHEMICAL_VALUES = 'SET_ALCHEMICAL_VALUES',
  SET_LUNAR_PHASE = 'SET_LUNAR_PHASE',
}

export type AlchemicalAction =
  | { type: AlchemicalDispatchType.UPDATE_ASTROLOGICAL_STATE, payload: Partial<AlchemicalState> }
  | { type: AlchemicalDispatchType.RESET_STATE }
  | { type: AlchemicalDispatchType.SET_ELEMENT payload: { element: string, value: number } }
  | { type: AlchemicalDispatchType.UPDATE_PLANETARY_POSITIONS, payload: Record<string, unknown> }
  | { type: AlchemicalDispatchType.UPDATE_ELEMENTAL_STATE, payload: Record<string, number> }
  | { type: AlchemicalDispatchType.UPDATE_STATE, payload: Partial<AlchemicalState> }
  | { type: AlchemicalDispatchType.SET_DAYTIME, payload: boolean }
  | { type: AlchemicalDispatchType.SET_SEASONAL_STATE payload: { season: string } }
  | {
      type: AlchemicalDispatchType.SET_ELEMENTAL_PREFERENCE,
      payload: { element: string, value: number },
    }
  | { type: AlchemicalDispatchType.SET_ELEMENTAL_STATE, payload: Record<string, number> }
  | { type: AlchemicalDispatchType.SET_ZODIAC_ENERGY, payload: string }
  | { type: AlchemicalDispatchType.SET_LUNAR_ENERGY, payload: string }
  | { type: AlchemicalDispatchType.SET_PLANETARY_ENERGY, payload: string | string[] }
  | { type: AlchemicalDispatchType.SET_ASTROLOGICAL_STATE, payload: Partial<AstrologicalState> }
  | { type: AlchemicalDispatchType.SET_ERROR payload: { message: string } }
  | { type: AlchemicalDispatchType.CLEAR_ERROR }
  | { type: AlchemicalDispatchType.ADD_ERROR, payload: string }
  | { type: AlchemicalDispatchType.SET_ALCHEMICAL_VALUES, payload: Record<string, number> }
  | { type: AlchemicalDispatchType.SET_LUNAR_PHASE, payload: string },

export interface AlchemicalState {
  planetaryPositions: Record<string, unknown>,
  normalizedPositions: Record<string, unknown>,
  elementalState: {
    Fire: number,
    Water: number,
    Earth: number,
    Air: number
  },
  lunarPhase: string,
  dominantElement: string,
  planetaryHour: string,
  svgRepresentation: string | null,
  alchemicalValues: {
    Spirit: number,
    Essence: number,
    Matter: number,
    Substance: number
  },
  // Error handling properties
  error?: boolean,
  errorMessage?: string,
  errors: string[],
  // Additional properties to match context
  currentSeason?: string,
  timeOfDay?: string,
  astrologicalState: AstrologicalState
  currentEnergy?: {
    zodiacEnergy: string,
    lunarEnergy: string,
    planetaryEnergy: string | string[]
  },
  elementalPreference?: {
    Fire: number,
    Water: number,
    Earth: number,
    Air: number
  },
  celestialPositions?: {
    sun?: {
      sign: string,
      degree?: number,
      exactLongitude?: number
    },
    moon?: {
      sign: string,
      degree?: number,
      exactLongitude?: number
    },
  },
  zodiacEnergy?: string,
  lunarEnergy?: string,
  planetaryEnergy?: string[]
  currentTime: Date,
  lastUpdated: Date
}

/**
 * Interface for astrological state
 */
export interface AstrologicalState {
  currentZodiac: string,
  sunSign: string,
  lunarPhase: string,
  moonPhase: string,
  activePlanets: string[],
  isDaytime?: boolean
  [key: string]: unknown
}

/**
 * Interface for thermodynamic metrics used in alchemical calculations
 */
export interface ThermodynamicMetrics {
  heat: number,
  entropy: number,
  reactivity: number,
  gregsEnergy: number,
  kalchm: number,
  monica: number
}