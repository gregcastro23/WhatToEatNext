/**
 * Utilities index file for easier imports
 */

// Export all validation utilities
export * from './validation';

// Export safe accessor utilities
export * from './safeAccess';

// Export logger
export { logger, createLogger } from './logger';

// Export existing utilities - re-export as needed
export * from './elementalUtils';
export * from './astrologyUtils';
export * from './zodiacUtils';

// Named exports for specific utilities
export { default as ErrorHandler } from '../services/errorHandler'; 