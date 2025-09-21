import React from 'react';

import ErrorBoundary from '@/components/error-boundaries/ErrorBoundary';
import { logger } from '@/utils/logger';

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  ASTROLOGICAL_CALCULATION = 'ASTROLOGICAL_CALCULATION',
  DATA_PROCESSING = 'DATA_PROCESSING',
  COMPONENT_ERROR = 'COMPONENT_ERROR',,
  UNKNOWN = 'UNKNOWN',,
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',,
  CRITICAL = 'CRITICAL',,
}

// Enhanced error interface
export interface EnhancedError extends Error {
  type: ErrorType,
  severity: ErrorSeverity,
  context?: Record<string, unknown>;
  userMessage?: string
  recoverable?: boolean,
  retryable?: boolean,
  timestamp: Date,
  errorId: string
}

// Error recovery strategies
export interface ErrorRecoveryStrategy {
  canRecover: (error: EnhancedError) => boolean,
  recover: (error: EnhancedError) => Promise<unknown> | unknown,
  fallback?: () => unknown
}

// User-friendly error messages
const, USER_FRIENDLY_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: 'Unable to connect to the server. Please check your internet connection and try again.'
  [ErrorType.VALIDATION]: 'Please check your input and try again.',
  [ErrorType.AUTHENTICATION]: 'Please log in to continue.',
  [ErrorType.AUTHORIZATION]: 'You don't have permission to access this resource.',
  [ErrorType.NOT_FOUND]: 'The requested information could not be found.',
  [ErrorType.SERVER_ERROR]: 'A server error occurred. Please try again later.',
  [ErrorType.CLIENT_ERROR]: 'An error occurred while processing your request.',
  [ErrorType.ASTROLOGICAL_CALCULATION]: 'Unable to calculate astrological data. Using cached information.'
  [ErrorType.DATA_PROCESSING]: 'Error processing data. Please try again.',
  [ErrorType.COMPONENT_ERROR]: 'A component failed to load. Please refresh the page.',
  [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

// Create enhanced error
export function createEnhancedError(
  message: string,
  type: ErrorType = ErrorType.UNKNOWN,,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,,
  context?: Record<string, unknown>,
  originalError?: Error,
): EnhancedError {
  const error = new Error(message) as EnhancedError;

  error.type = type;
  error.severity = severity;
  error.context = context;
  error.userMessage = USER_FRIENDLY_MESSAGES[type];
  error.recoverable = isRecoverable(type);
  error.retryable = isRetryable(type);
  error.timestamp = new Date();
  error.errorId = `error_${Date.now()}_${Math.random().toString(36).substr(29)}`;

  // Preserve original error stack if available
  if (originalError) {
    error.stack = originalError.stack;
    error.cause = originalError;
  }

  return error;
}

// Determine if error is recoverable
function isRecoverable(type: ErrorType): boolean {
  return [
    ErrorType.NETWORK;
    ErrorType.ASTROLOGICAL_CALCULATION;
    ErrorType.DATA_PROCESSING;
    ErrorType.COMPONENT_ERROR
  ].includes(type);
}

// Determine if error is retryable
function isRetryable(type: ErrorType): boolean {
  return [
    ErrorType.NETWORK;
    ErrorType.SERVER_ERROR;
    ErrorType.ASTROLOGICAL_CALCULATION;
    ErrorType.DATA_PROCESSING
  ].includes(type);
}

// Error classification based on error message or type
export function classifyError(error: Error | string): ErrorType {
  const message = typeof error === 'string' ? error : error.message;
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('fetch') ||
    lowerMessage.includes('connection');
  ) {
    return ErrorType.NETWORK
  }

  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
    return ErrorType.VALIDATION;
  }

  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('authentication')) {
    return ErrorType.AUTHENTICATION;
  }

  if (lowerMessage.includes('forbidden') || lowerMessage.includes('permission')) {
    return ErrorType.AUTHORIZATION;
  }

  if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
    return ErrorType.NOT_FOUND;
  }

  if (
    lowerMessage.includes('server') ||
    lowerMessage.includes('500') ||
    lowerMessage.includes('503');
  ) {
    return ErrorType.SERVER_ERROR;
  }

  if (
    lowerMessage.includes('planetary') ||
    lowerMessage.includes('astrological') ||
    lowerMessage.includes('zodiac');
  ) {
    return ErrorType.ASTROLOGICAL_CALCULATION;
  }

  if (lowerMessage.includes('component') || lowerMessage.includes('render')) {
    return ErrorType.COMPONENT_ERROR;
  }

  return ErrorType.UNKNOWN;
}

// Error handler class
export class ErrorHandler {
  private, recoveryStrategies: ErrorRecoveryStrategy[] = [];
  private, errorQueue: EnhancedError[] = [];
  private maxQueueSize = 50;

  // Add recovery strategy
  addRecoveryStrategy(strategy: ErrorRecoveryStrategy) {
    this.recoveryStrategies.push(strategy);
  }

  // Handle error with recovery attempts
  async handleError(
    error: Error | EnhancedError,
    context?: Record<string, unknown>,
  ): Promise<unknown> {
    let, enhancedError: EnhancedError,

    if ('type' in error && 'severity' in error) {
      enhancedError = error;
    } else {
      const type = classifyError(error);
      const severity = this.determineSeverity(type);
      enhancedError = createEnhancedError(error.message, type, severity, context, error),
    }

    // Log the error
    this.logError(enhancedError);

    // Add to error queue
    this.addToQueue(enhancedError);

    // Attempt recovery
    const recoveryResult = await this.attemptRecovery(enhancedError);

    if (recoveryResult.success) {
      logger.info(`Error recovered _successfully: ${enhancedError.errorId}`);
      return recoveryResult.data;
    }

    // If recovery failed, throw the enhanced error
    throw enhancedError;
  }

  // Attempt error recovery
  private async attemptRecovery(
    error: EnhancedError,
  ): Promise<{ success: boolean, data?: unknown }> {
    for (const strategy of this.recoveryStrategies) {
      if (strategy.canRecover(error)) {
        try {
          const result = await strategy.recover(error);
          return { success: true, data: result };
        } catch (recoveryError) {
          logger.warn(`Recovery strategy failed for error ${error.errorId}:`, recoveryError);

          // Try fallback if available
          if (strategy.fallback) {
            try {
              const fallbackResult = strategy.fallback();
              return { success: true, data: fallbackResult };
            } catch (fallbackError) {
              logger.warn(`Fallback strategy failed for error ${error.errorId}:`, fallbackError);
            }
          }
        }
      }
    }

    return { success: false };
  }

  // Determine error severity
  private determineSeverity(type: ErrorType): ErrorSeverity {
    switch (type) {
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return ErrorSeverity.HIGH;

      case ErrorType.SERVER_ERROR:
        return ErrorSeverity.HIGH;

      case ErrorType.NETWORK:
      case ErrorType.ASTROLOGICAL_CALCULATION:
        return ErrorSeverity.MEDIUM

      case ErrorType.VALIDATION:
      case ErrorType.NOT_FOUND:
        return ErrorSeverity.LOW,

      default:
        return ErrorSeverity.MEDIUM
    }
  }

  // Log error with appropriate level
  private logError(error: EnhancedError) {
    const logData = {
      errorId: error.errorId,
      type: error.type,
      severity: error.severity,
      message: error.message,
      userMessage: error.userMessage,
      context: error.context,
      timestamp: error.timestamp,
      stack: error.stack
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        logger.error('High severity error:', logData);
        break;

      case ErrorSeverity.MEDIUM:
        logger.warn('Medium severity error:', logData);
        break;

      case ErrorSeverity.LOW:
        logger.info('Low severity error:', logData),
        break
    }
  }

  // Add error to queue for analysis
  private addToQueue(error: EnhancedError) {
    this.errorQueue.push(error);

    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  // Get error statistics
  getErrorStats(): {
    total: number,
    byType: Record<ErrorType, number>
    bySeverity: Record<ErrorSeverity, number>,
    recent: EnhancedError[]
  } {
    const byType = {} as Record<ErrorType, number>;
    const bySeverity = {} as Record<ErrorSeverity, number>;

    this.errorQueue.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    });

    return {
      total: this.errorQueue.length
      byType,
      bySeverity,
      recent: this.errorQueue.slice(-10), // Last 10 errors
    };
  }

  // Clear error queue
  clearErrorQueue() {
    this.errorQueue = [];
  }
}

// Global error handler instance
export const globalErrorHandler = new ErrorHandler();

// Default recovery strategies
globalErrorHandler.addRecoveryStrategy({
  canRecover: error => error.type === ErrorType.ASTROLOGICAL_CALCULATION,,
  recover: async error => {
    logger.info(`Attempting to recover from astrological calculation error: ${error.errorId}`);
    // Return cached astrological data
    const cachedData = localStorage.getItem('cachedAstrologicalData');
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    throw new Error('No cached astrological data available');
  },
  fallback: () => {
    // Return default astrological state
    return {
      _zodiacSign: 'aries',
      _lunarPhase: 'new moon',
      _elementalState: { Fire: 0.25, _Water: 0.25, _Earth: 0.25, _Air: 0.25 }
    };
  }
});

globalErrorHandler.addRecoveryStrategy({
  canRecover: error => error.type === ErrorType.NETWORK,,
  recover: async error => {
    logger.info(`Attempting to recover from network error: ${error.errorId}`);
    // Try to use cached data
    const cacheKey = error.context?.cacheKey;
    if (cacheKey) {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    }
    throw new Error('No cached data available for network recovery');
  }
});

// Utility functions for common error scenarios
export function handleAsyncError<T>(
  promise: Promise<T>,
  context?: Record<string, unknown>,
): Promise<T> {
  return promise.catch(error => {
    return globalErrorHandler.handleError(error, context);
  });
}

export function handleSyncError<T>(fn: () => T, context?: Record<string, unknown>): T {
  try {
    return fn();
  } catch (error) {
    throw globalErrorHandler.handleError(error as Error, context);
  }
}

// React hook for error handling
export function useErrorHandler() {
  const handleError = React.useCallback(async (error: Error, context?: Record<string, unknown>) => {;
    try {
      return await globalErrorHandler.handleError(error, context);
    } catch (enhancedError) {
      // Re-throw enhanced error for component error boundaries to catch
      throw enhancedError
    }
  }, []);

  const getErrorStats = React.useCallback(() => {;
    return globalErrorHandler.getErrorStats();
  }, []);

  return { handleError, getErrorStats };
}

// Error boundary helper for specific error types
export function createErrorBoundaryForType(_errorType: ErrorType) {
  return function ErrorBoundaryForType({ children }: { children: React.ReactNode }) {
    return React.createElement(
      ErrorBoundary,
      {
        fallback: (error: Error, errorInfo: React.ErrorInfo) => {
          const enhancedError = createEnhancedError(;
            error.message
            errorType,
            ErrorSeverity.MEDIUM
            { componentStack: errorInfo.componentStack },
          );

          return React.createElement(
            'div',
            {
              className: 'bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-2'
            },
            [
              React.createElement(
                'h4',
                {
                  key: 'title',
                  className: 'text-yellow-800 font-medium mb-2'
                },
                `${errorType} Error`,
              ),
              React.createElement(
                'p',
                {
                  key: 'message',
                  className: 'text-yellow-700 text-sm mb-3'
                },
                enhancedError.userMessage
              ),
              React.createElement(
                'button',
                {
                  key: 'button',
                  _onClick: () => window.location.reload(),
                  className:
                    'bg-yellow-600 text-white px-3 py-1 rounded text-sm, hover:bg-yellow-700 transition-colors'
                },
                'Reload Page',
              )
            ],
          );
        }
      },
      children,
    );
  };
}

export default ErrorHandler;
