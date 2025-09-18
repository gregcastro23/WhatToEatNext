/**
 * Core Calculations Module Index
 *
 * Barrel exports for all core calculation modules
 */

// Export all from alchemical calculations
export { calculateAlchemicalProperties as calculateCoreAlchemicalProperties } from './alchemicalCalculations';

// Export all from alchemical engine
export {
  alchemize as coreAlchemize,
  AlchemicalEngine as CoreAlchemicalEngine,
} from './alchemicalEngine';

// Export all from elemental calculations
export {
  calculateComprehensiveElementalProperties,
  calculateElementalCompatibility,
  getDominantElement,
  getElementalRecommendations,
  ZODIAC_ELEMENTS,
  calculateBaseElementalProperties,
  applySeasonalAdjustments,
  applyLunarPhaseAdjustments,
  calculateElementalBalance,
  combineElementalProperties,
  normalizeElementalProperties,
  SEASONAL_MODIFIERS,
  LUNAR_PHASE_MODIFIERS,
  ELEMENTAL_ANALYSIS_INTELLIGENCE,
  SEASONAL_ELEMENTAL_INTELLIGENCE,
  default as elementalCalculations,
} from './elementalCalculations';

// Export all from kalchm engine
export {
  calculateKalchmResults,
  toElementalProperties,
  type KalchmResult,
  type AlchemicalProperties,
  type ElementalValues,
  type ThermodynamicResults,
  default as kalchmEngine,
} from './kalchmEngine';

// Export all from planetary influences
export {
  calculatePlanetaryInfluences,
  getPlanetaryCulinaryRecommendations,
  default as planetaryInfluences,
} from './planetaryInfluences';
