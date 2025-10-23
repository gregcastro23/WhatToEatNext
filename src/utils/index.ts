/**
 * Utilities index file for easier imports
 */

// Export all validation utilities
export * from './validation';

// Export safe accessor utilities
export * from './safeAccess';

// Export logger
export { createLogger, logger } from './logger';

// Export existing utilities - re-export as needed
export { transformItemsWithPlanetaryPositions as astrologyUtilsTransformItems } from './astrologyUtils';
export * from './elementalUtils';
export {
    getSignFromLongitude as zodiacUtilsGetSignFromLongitude,
    getZodiacElementalInfluence as zodiacUtilsGetZodiacElementalInfluence,
    getZodiacSign as zodiacUtilsGetZodiacSign
} from './zodiacUtils';

// Export sign vector utilities
export * from './signVectors';

// Named exports for specific utilities
export { default as ErrorHandler } from '../services/errorHandler';

// ========== CUISINE SYSTEM EXPORTS ==========

// Comprehensive cuisine-level computation system
export * from './cuisine';

// Enhanced recommendation system with cuisine integration
export {
    calculateElementalContributionsFromPlanets, calculateElementalProfileFromZodiac, generateCuisineRecommendation,
    generateEnhancedCuisineRecommendations,
    getCuisineElementalProfile,
    getMatchScoreClass,
    renderScoreBadge
} from './recommendation/cuisineRecommendation';

export type {
    CuisineRecommendation, CuisineRecommendationParams, EnhancedCuisineRecommendation, EnhancedCuisineRecommendationParams
} from './recommendation/cuisineRecommendation';
