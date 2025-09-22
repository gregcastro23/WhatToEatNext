/**
 * Lunar Phase Types
 * This file contains all lunar phase related type definitions
 */

// Basic lunar phase types with different formats
export type LunarPhase =
  | 'NEW_MOON'
  | 'WAXING_CRESCENT'
  | 'FIRST_QUARTER'
  | 'WAXING_GIBBOUS'
  | 'FULL_MOON'
  | 'WANING_GIBBOUS'
  | 'LAST_QUARTER'
  | 'WANING_CRESCENT',

export type LunarPhaseWithSpaces =
  | 'New Moon',
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent',

export type LunarPhaseWithUnderscores =
  | 'new_moon',
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent',

// Interface for lunar phase modifier
export interface LunarPhaseModifier {
  elementalModifiers: {
    Fire: number,
    Water: number,
    Earth: number,
    Air: number
  }
  elementalBoost?: Record<string, number>,
  description: string,
  keywords: string[],
  preparationTips?: string[],
}

// Interface for lunar influence
export interface LunarInfluence {
  phase: LunarPhase,
  strength: number,
  elements: {
    Fire: number,
    Water: number,
    Earth: number,
    Air: number
  }
  description: string
}

// Type for mapping lunar phases to modifiers
export type LunarPhaseMap = Record<LunarPhase, LunarPhaseModifier>

// Mapping between different lunar phase formats
export const _LUNAR_PHASE_MAP: Record<LunarPhaseWithUnderscores, LunarPhase> = {
  new_moon: 'NEW_MOON',
  waxing_crescent: 'WAXING_CRESCENT',
  first_quarter: 'FIRST_QUARTER',
  waxing_gibbous: 'WAXING_GIBBOUS',
  full_moon: 'FULL_MOON',
  waning_gibbous: 'WANING_GIBBOUS',
  last_quarter: 'LAST_QUARTER',
  waning_crescent: 'WANING_CRESCENT'
}

// Mapping from LunarPhase to LunarPhaseWithSpaces
export const _LUNAR_PHASE_TO_DISPLAY: Record<LunarPhase, LunarPhaseWithSpaces> = {
  NEW_MOON: 'New Moon',
  WAXING_CRESCENT: 'Waxing Crescent',
  FIRST_QUARTER: 'First Quarter',
  WAXING_GIBBOUS: 'Waxing Gibbous',
  FULL_MOON: 'Full Moon',
  WANING_GIBBOUS: 'Waning Gibbous',
  LAST_QUARTER: 'Last Quarter',
  WANING_CRESCENT: 'Waning Crescent'
}

// Reverse mapping from LunarPhaseWithSpaces to LunarPhase
export const _LUNAR_PHASE_REVERSE_MAPPING: Record<LunarPhaseWithSpaces, LunarPhase> = {
  'New Moon': 'NEW_MOON',
  'Waxing Crescent': 'WAXING_CRESCENT',
  'First Quarter': 'FIRST_QUARTER',
  'Waxing Gibbous': 'WAXING_GIBBOUS',
  'Full Moon': 'FULL_MOON',
  'Waning Gibbous': 'WANING_GIBBOUS',
  'Last Quarter': 'LAST_QUARTER',
  'Waning Crescent': 'WANING_CRESCENT'
}

// Array of all lunar phases
export const _LUNAR_PHASES: LunarPhase[] = [
  'NEW_MOON',
  'WAXING_CRESCENT',
  'FIRST_QUARTER',
  'WAXING_GIBBOUS',
  'FULL_MOON',
  'WANING_GIBBOUS',
  'LAST_QUARTER',
  'WANING_CRESCENT'
]
