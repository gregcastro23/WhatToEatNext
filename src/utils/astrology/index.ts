// Astrology utilities index file - Fixed for TS2308 conflicts
// Use explicit re-exports instead of wildcard exports to avoid conflicts

// Re-export specific functions from core module
export {
  calculateActivePlanets,
  getLunarPhaseModifier,
  getZodiacElement,
  calculateLunarPhase,
  getLunarPhaseName,
  calculateSunSign,
  calculatemoonSign,
  calculatePlanetaryAspects,
  getmoonIllumination,
  getCurrentAstrologicalState,
  calculateElementalProfile,
  calculateAspects,
} from "./core";

export * from "./positions";

// Re-export validation functions
export { validatePlanetaryPositions } from "./validation";
