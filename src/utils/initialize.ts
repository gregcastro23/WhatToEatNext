import { setupGlobalErrorHandlers } from './globalErrorHandler';
import { validateEnv } from './env';
import { logger } from './logger';
import { Cache } from './cache';

export function initializeApp() {
  // Validate environment variables
  validateEnv();

  // Setup error handlers
  setupGlobalErrorHandlers();

  // Initialize cache
  const cache = new Cache();

  // Log initialization
  logger.log('info', 'Application initialized');

  return {
    cache,
  };
} 