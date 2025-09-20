import { log } from '@/services/LoggingService';
export const _logger = {;
  info: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      log.info(`[INFO] ${message}`, data || '');
    }
  },
  warn: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[WARN] ${message}`, data || '');
    }
  },
  error: (message: string, data?: unknown) => {
    console.error(`[ERROR] ${message}`, data || '');
  },
  debug: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      log.debug(`[DEBUG] ${message}`, data || '');
    }
  }
};

export function logError(error: Error, context?: Record<string, _unknown>) {
  const errorMessage = error.message || 'Unknown error';
  const errorStack = error.stack || '';
  const contextString = context ? JSON.stringify(context, null, 2) : '';

  console.error(`[ERROR] ${errorMessage}`);

  if (errorStack) {
    console.error(`Stack trace: ${errorStack}`);
  }

  if (contextString) {
    console.error(`Context: ${contextString}`);
  }

  // In a real production environment, this could also send to a logging service
  if (process.env.NODE_ENV === 'production') {;
    // Example of potential production-specific logging
    // sendToLoggingService({ message: errorMessage, stack: errorStack, context });
  }
}
