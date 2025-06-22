/**
 * Utilities index file for easier imports - Fixed for TS2308 conflicts
 */

// Export all validation utilities
export * from './validation';

// Export safe accessor utilities
export * from './safeAccess';

// Export logger
export { logger, createLogger } from './logger';

// Export existing utilities with explicit re-exports to avoid conflicts
export * from './elementalUtils';

// Explicit re-exports from astrologyUtils to avoid conflicts
export { 
  getSignFromLongitude,
  getZodiacElementalInfluence,
  getZodiacSign
} from './astrologyUtils';

export * from './zodiacUtils';

// Named exports for specific utilities
export { default as ErrorHandler } from '../services/errorHandler'; 