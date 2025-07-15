/**
 * Lunar Phase Types
 * This file contains all lunar phase related type definitions
 */
// Mapping between different lunar phase formats
export const LUNAR_PHASE_MAP = {
    'new_moon': 'NEW_moon',
    'waxing_crescent': 'WAXING_CRESCENT',
    'first_quarter': 'FIRST_QUARTER',
    'waxing_gibbous': 'WAXING_GIBBOUS',
    'full_moon': 'FULL_moon',
    'waning_gibbous': 'WANING_GIBBOUS',
    'last_quarter': 'LAST_QUARTER',
    'waning_crescent': 'WANING_CRESCENT'
};
// Mapping from LunarPhase to LunarPhaseWithSpaces
export const LUNAR_PHASE_TO_DISPLAY = {
    'NEW_moon': 'New moon',
    'WAXING_CRESCENT': 'Waxing Crescent',
    'FIRST_QUARTER': 'First Quarter',
    'WAXING_GIBBOUS': 'Waxing Gibbous',
    'FULL_moon': 'Full moon',
    'WANING_GIBBOUS': 'Waning Gibbous',
    'LAST_QUARTER': 'Last Quarter',
    'WANING_CRESCENT': 'Waning Crescent'
};
// Reverse mapping from LunarPhaseWithSpaces to LunarPhase
export const LUNAR_PHASE_REVERSE_MAPPING = {
    'New moon': 'NEW_moon',
    'Waxing Crescent': 'WAXING_CRESCENT',
    'First Quarter': 'FIRST_QUARTER',
    'Waxing Gibbous': 'WAXING_GIBBOUS',
    'Full moon': 'FULL_moon',
    'Waning Gibbous': 'WANING_GIBBOUS',
    'Last Quarter': 'LAST_QUARTER',
    'Waning Crescent': 'WANING_CRESCENT'
};
// Array of all lunar phases
export const LUNAR_PHASES = [
    'NEW_moon',
    'WAXING_CRESCENT',
    'FIRST_QUARTER',
    'WAXING_GIBBOUS',
    'FULL_moon',
    'WANING_GIBBOUS',
    'LAST_QUARTER',
    'WANING_CRESCENT'
];
