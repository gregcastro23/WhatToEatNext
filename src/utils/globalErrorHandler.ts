import { logger } from './logger';

export function setupGlobalErrorHandlers() {
  if (typeof window !== 'undefined') {
    window.onerror = (message, source, lineno, colno, error) => {
      logger.error('Global error:', {
        message,
        source,
        lineno,
        colno,
        error: error?.toString(),
      });
      return false;
    };

    window.onunhandledrejection = event => {
      logger.error('Unhandled promise rejection:', {
        reason: event.reason,
      });
    };
  }

  process.on('uncaughtException', error => {
    logger.error('Uncaught exception:', { error: error.toString() });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', {
      promise,
      reason: reason?.toString(),
    });
  });
}
