"use strict";
/**
 * Lunar Phase Types
 * This file contains all lunar phase related type definitions
 */

// Mapping between different lunar phase formats
export const LUNAR_PHASE_MAP = {
    'new_moon': 'NEW_MOON',
    'waxing_crescent': 'WAXING_CRESCENT',
    'first_quarter': 'FIRST_QUARTER',
    'waxing_gibbous': 'WAXING_GIBBOUS',
    'full_moon': 'FULL_MOON',
    'waning_gibbous': 'WANING_GIBBOUS',
    'last_quarter': 'LAST_QUARTER',
    'waning_crescent': 'WANING_CRESCENT'
};

// Mapping from LunarPhase to LunarPhaseWithSpaces
export const LUNAR_PHASE_TO_DISPLAY = {
    'NEW_MOON': 'new moon',
    'WAXING_CRESCENT': 'Waxing Crescent',
    'FIRST_QUARTER': 'First Quarter',
    'WAXING_GIBBOUS': 'Waxing Gibbous',
    'FULL_MOON': 'full moon',
    'WANING_GIBBOUS': 'Waning Gibbous',
    'LAST_QUARTER': 'Last Quarter',
    'WANING_CRESCENT': 'Waning Crescent'
};

// Reverse mapping from LunarPhaseWithSpaces to LunarPhase
export const LUNAR_PHASE_REVERSE_MAPPING = {
    'new moon': 'NEW_MOON',
    'Waxing Crescent': 'WAXING_CRESCENT',
    'First Quarter': 'FIRST_QUARTER',
    'Waxing Gibbous': 'WAXING_GIBBOUS',
    'full moon': 'FULL_MOON',
    'Waning Gibbous': 'WANING_GIBBOUS',
    'Last Quarter': 'LAST_QUARTER',
    'Waning Crescent': 'WANING_CRESCENT'
};

// Array of all lunar phases
export const LUNAR_PHASES = [
    'NEW_MOON',
    'WAXING_CRESCENT',
    'FIRST_QUARTER',
    'WAXING_GIBBOUS',
    'FULL_MOON',
    'WANING_GIBBOUS',
    'LAST_QUARTER',
    'WANING_CRESCENT'
];
