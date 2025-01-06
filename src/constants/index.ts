export * from './elements';
export * from './seasons';
export * from './lunar';

export const SYSTEM_CONSTANTS = {
  updateInterval: 3600000, // 1 hour in milliseconds
  elementalPrecision: 2, // decimal places for elemental calculations
  minimumInfluence: 0.05, // minimum threshold for considering an influence
  maximumCombinations: 5, // maximum number of ingredient combinations to suggest
  defaultStrength: 1, // default strength multiplier for calculations
};
