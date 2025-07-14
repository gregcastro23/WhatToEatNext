import { setupGlobalErrorHandlers } from './globalErrorHandler';
import { validateEnv } from './env';
import { logger } from './logger';
import { Cache } from './cache';
// import { initializeDatabaseIntegrity } from './databaseCleanup';

export function initializeApp() {
  // Validate environment variables
  validateEnv();

  // Setup error handlers
  setupGlobalErrorHandlers();

  // Initialize cache
  const cache = new Cache(3600000); // 1 hour cache timeout

  // Clean up and validate database
  // initializeDatabaseIntegrity();

  // Log initialization
  logger.info('Application initialized');

  return {
    cache,
  };
} 