import { Cache } from './cache';
import { initializeDatabaseIntegrity } from './databaseCleanup';
import { validateEnv } from './env';
import { setupGlobalErrorHandlers } from './globalErrorHandler';
import { logger } from './logger';

export function initializeApp() {
  // Validate environment variables
  validateEnv()

  // Setup error handlers
  setupGlobalErrorHandlers()

  // Initialize cache
  const cache = new Cache(3600000); // 1 hour cache timeout

  // Clean up and validate database
  initializeDatabaseIntegrity()

  // Log initialization
  logger.info('Application initialized')

  return {
    cache
  };
}