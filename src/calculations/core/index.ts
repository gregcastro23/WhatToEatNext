/**
 * Core Calculations Module Index
 *
 * Barrel exports for all core calculation modules
 */

// Export all from alchemical calculations
export { calculateAlchemicalProperties as calculateCoreAlchemicalProperties } from "./alchemicalCalculations";

// Export all from alchemical engine
export {
  AlchemicalEngine as CoreAlchemicalEngine,
  alchemize as coreAlchemize,
} from "./alchemicalEngine";

// Export all from elemental calculations
export {
  ELEMENTAL_ANALYSIS_INTELLIGENCE,
  LUNAR_PHASE_MODIFIERS,
  SEASONAL_ELEMENTAL_INTELLIGENCE,
  SEASONAL_MODIFIERS,
  ZODIAC_ELEMENTS,
  analyzeElementalCompatibility,
  applyLunarPhaseAdjustments,
  applySeasonalAdjustments,
  calculateBaseElementalProperties,
  calculateBaseElementalProperties,
  calculateElementalBalance,
  combineElementalProperties,
  default as elementalCalculations,
  getDominantElement,
  getElementalRecommendations,
  normalizeElementalProperties,
} from "./elementalCalculations";

// Export all from kalchm engine
export {
  calculateKalchmResults,
  default as kalchmEngine,
  toElementalProperties,
  type AlchemicalProperties,
  type ElementalValues,
  type KalchmResult,
  type ThermodynamicResults,
} from "./kalchmEngine";

// Export all from planetary influences
export {
  calculatePlanetaryInfluences,
  getPlanetaryCulinaryRecommendations,
  default as planetaryInfluences,
} from "./planetaryInfluences";
