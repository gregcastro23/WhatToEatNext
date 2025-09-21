// src/constants/index.ts

// Core constants without conflicts
export * from './chakraMappings';
export * from './planetaryFoodAssociations';
export * from './alchemicalEnergyMapping';
export * from './planetaryElements';
export * from './planets';
export * from './elementalProperties';
export * from './unitConstants';
export * from './cuisineTypes';
export * from './elements';

// Selectively export from files with conflicts
export { DEFAULT_ELEMENTAL_PROPERTIES, VALIDATION_THRESHOLDS } from './elementalConstants';

export { MAJOR_ARCANA } from './tarotCards';

export {
  ZODIAC_ELEMENTS,
  PLANETARY_RULERSHIPS,
  PLANETARY_EXALTATIONS,
  TRIPLICITY_RULERS
} from './zodiac';

export { DECAN_RULERS } from './decanRulers';

export { ENERGY_STATES } from './signEnergyStates';

export { RECIPE_TYPES, MEAL_TYPES } from './recipe';

export { LUNAR_PHASES, LUNAR_CYCLE_DAYS } from './lunarPhases';

export { SEASONAL_INFLUENCE } from './seasonalModifiers';

export { SEASON_DATE_RANGES } from './seasons';

export { LUNAR_DAYS } from './lunar';

export const _SYSTEM_CONSTANTS = {
  updateInterval: 3600000, // 1 hour in milliseconds
  elementalPrecision: 2, // decimal places for elemental calculations
  minimumInfluence: 0.05, // minimum threshold for considering an influence
  maximumCombinations: 5, // maximum number of ingredient combinations to suggest
  defaultStrength: 1, // default strength multiplier for calculations
};
