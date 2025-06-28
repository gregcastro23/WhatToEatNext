/**
 * Error handling utilities
 */

import { createLogger } from './logger';

const logger = createLogger('ErrorHandler');

export enum ErrorType {
  UI = 'UI',
  API = 'API',
  DATA = 'DATA',
  NETWORK = 'NETWORK',
  ASTROLOGY = 'ASTROLOGY',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

interface ErrorContext {
  [key: string]: any;
}

interface ErrorOptions {
  type?: ErrorType;
  severity?: ErrorSeverity;
  component?: string;
  context?: ErrorContext;
  silent?: boolean;
}

/**
 * Central error handler for the application
 */
export const ErrorHandler = {
  /**
   * Log an error with additional context
   */
  log: (error: Error, options: ErrorOptions = {}) => {
    const {
      type = ErrorType.UNKNOWN,
      severity = ErrorSeverity.ERROR,
      component = 'unknown',
      context = {},
      silent = false
    } = options;

    // Log to console
    if (!silent) {
      logger.error(
        `[${severity}][${type}][${component}] ${error.message}`,
        { error, context }
      );
    }

    // You could add integration with error monitoring services here
    // Example: Sentry.captureException(error, { extra: { type, severity, component, ...context } });

    return {
      error,
      type,
      severity,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Create a custom application error
   */
  createError: (message: string, options: ErrorOptions = {}): Error => {
    const error = new Error(message);
    // Add custom properties to the error
    Object.assign(error, {
      type: options.type || ErrorType.UNKNOWN,
      severity: options.severity || ErrorSeverity.ERROR,
      context: options.context || {}
    });
    return error;
  }
};

export default ErrorHandler;

// Export alias for compatibility
export const errorHandler = ErrorHandler; 