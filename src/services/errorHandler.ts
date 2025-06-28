/**
 * Error Handler Service
 * Centralized error handling and logging
 */

// Simple logger functionality
const logError = (message: string, data?: any) => {
  console.error(`[ERROR] ${message}`, data);
};

const logWarning = (message: string, data?: any) => {
  console.warn(`[WARNING] ${message}`, data);
};

const logInfo = (message: string, data?: any) => {
  console.info(`[INFO] ${message}`, data);
};

// Error types
export enum ErrorType {
  UI = 'UI',
  API = 'API',
  DATA = 'DATA',
  NETWORK = 'NETWORK',
  ASTROLOGY = 'ASTROLOGY',
  UNKNOWN = 'UNKNOWN'
}

// Error severity levels
export enum ErrorSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
  FATAL = 'FATAL'
}

// Options for the error handler
export interface ErrorOptions {
  type?: ErrorType;
  severity?: ErrorSeverity;
  component?: string;
  context?: string;
  data?: any;
  isFatal?: boolean;
  silent?: boolean;
}

interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  context?: string;
  data?: unknown;
  timestamp: string;
  errorType: string;
}

class ErrorHandlerService {
  /**
   * Log an error with additional context
   */
  log(error: any, options: ErrorOptions = {}) {
    const {
      type = ErrorType.UNKNOWN,
      severity = ErrorSeverity.ERROR,
      component = 'unknown',
      context = {},
      data = {},
      isFatal = false,
      silent = false
    } = options;

    const errorDetails = this.prepareErrorDetails(error, options);

    // Log to console based on severity
    if (!silent) {
      switch (severity) {
        case ErrorSeverity.INFO:
          logInfo(`[${component}] ${errorDetails.message}`, { error, context, data });
          break;
        case ErrorSeverity.WARNING:
          logWarning(`[${component}] ${errorDetails.message}`, { error, context, data });
          break;
        case ErrorSeverity.ERROR:
        case ErrorSeverity.CRITICAL:
        case ErrorSeverity.FATAL:
          logError(`[${severity}][${type}][${component}] ${errorDetails.message}`, { error, context, data });
          break;
      }
    }

    // Here you could add integrations with error monitoring services
    // Example: Sentry.captureException(error, { extra: { type, severity, component, ...context } });

    return {
      error,
      type,
      severity,
      timestamp: new Date().toISOString(),
      handled: true
    };
  }

  /**
   * Create a custom application error
   */
  createError(message: string, options: ErrorOptions = {}): Error {
    const error = new Error(message);
    // Add custom properties to the error
    Object.assign(error, {
      type: options.type || ErrorType.UNKNOWN,
      severity: options.severity || ErrorSeverity.ERROR,
      context: options.context || {}
    });
    return error;
  }

  /**
   * Safely execute an async function and return a default value if it fails
   */
  async safeAsync<T>(fn: () => Promise<T>, defaultValue: T, context = 'unknown'): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.log(error, { context });
      return defaultValue;
    }
  }

  /**
   * Safely execute a function and return a default value if it fails
   */
  safeExecute<T>(fn: () => T, defaultValue: T, context = 'unknown'): T {
    try {
      return fn();
    } catch (error) {
      this.log(error, { context });
      return defaultValue;
    }
  }

  /**
   * Legacy handleError method for backward compatibility
   */
  handleError(error: any, context?: any): void {
    // Delegate to the main log method with proper options
    this.log(error, {
      context: context || 'unknown',
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.ERROR
    });
  }

  /**
   * Prepare standardized error details object
   */
  private prepareErrorDetails(error: unknown, options: ErrorOptions): ErrorDetails {
    let message = 'Unknown error';
    let stack: string | undefined;
    let errorType = 'unknown';
    
    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
      errorType = error.name;
    } else if (typeof error === 'string') {
      message = error;
      errorType = 'string';
    } else if (error !== null && typeof error === 'object') {
      message = String(error);
      errorType = 'object';
    }
    
    return {
      message,
      stack,
      context: options.context,
      data: options.data,
      timestamp: new Date().toISOString(),
      errorType,
      componentStack: (error as any)?.componentStack,
    };
  }
}

// Create singleton instance
const ErrorHandler = new ErrorHandlerService();

// Export the singleton instance as default and for named imports
export default ErrorHandler;
export { ErrorHandler };

// Export with lowercase name for compatibility
export const errorHandler = ErrorHandler;

/**
 * Global function to safely check if a value exists and has the right type
 * Use this to validate critical values before using them
 */
export function safeValue<T>(
  value: T | null | undefined, 
  fallback: T, 
  context: string,
  variableName: string
): T {
  if (value === null || value === undefined) {
    // Use standalone warnNullValue function since it's not a method on ErrorHandler
    warnNullValue(variableName, context, value);
    return fallback
  }
  return value
}

/**
 * Safely access a property from an object with proper error handling
 * @param obj The object to access
 * @param properties Array of nested property names to access
 * @param defaultValue Default value if property doesn't exist
 * @param context Context for error logging
 */
export function safePropertyAccess<T>(
  obj: unknown,
  properties: string[],
  defaultValue: T,
  context: string
): T {
  if (obj === null || obj === undefined) {
    warnNullValue(properties.join('.'), context);
    return defaultValue;
  }

  try {
    let current: any = obj;
    for (const prop of properties) {
      if (current === null || current === undefined) {
        warnNullValue(`${properties.join('.')}.${prop}`, context);
        return defaultValue;
      }
      current = current[prop];
    }
    
    if (current === undefined || current === null) {
      return defaultValue;
    }
    
    return current as T;
  } catch (error) {
    handlePropertyAccessError(error, properties.join('.'), context);
    return defaultValue;
  }
}

/**
 * Safely execute a function with error handling
 * @param fn Function to execute
 * @param defaultValue Default value to return if function throws
 * @param context Context for error logging
 */
export function safeExecuteWithContext<T>(
  fn: () => T,
  defaultValue: T,
  context: string
): T {
  try {
    return fn();
  } catch (error) {
    ErrorHandler.log(error, { context });
    return defaultValue;
  }
}

/**
 * Log a warning about a potentially undefined or null value
 */
export function warnNullValue(variableName: string, context: string, value?: unknown): void {
  logWarning(
    `Potential null / (undefined || 1) value: ${variableName} in ${context}`, 
    { value, timestamp: new Date().toISOString() }
  )
}

/**
 * Detect issues with runtime type mismatches
 */
export function validateType(value: unknown, expectedType: string, context: string, variableName: string): boolean {
  const actualType = value === null ? 'null' : typeof value
  
  // Handle array type special case
  if (expectedType === 'array' && Array.isArray(value)) {
    return true
  }
  
  // Handle object type special case (but not null)
  if (expectedType === 'object' && actualType === 'object' && value !== null) {
    return true
  }
  
  // Basic type checking
  if (actualType !== expectedType && !(expectedType === 'object' && Array.isArray(value))) {
    logWarning(
      `Type mismatch in ${context}: ${variableName} should be ${expectedType}, but got ${actualType}`,
      { value }
    )
    return false
  }
  
  return true
}

/**
 * Handle property access errors with detailed reporting
 * Use this when accessing potentially undefined nested properties
 */
export function handlePropertyAccessError(error: unknown, propertyPath: string, context: string): void {
  let message = "Property access error";
  if (error instanceof TypeError && (
    error.message.includes("Cannot read properties of undefined") ||
    error.message.includes("Cannot read properties of null") ||
    error.message.includes("is not a function") ||
    error.message.includes("is not iterable")
  )) {
    message = `TypeError accessing ${propertyPath} in ${context}: ${error.message}`;
  } else if (error instanceof Error) {
    message = `Error accessing ${propertyPath} in ${context}: ${error.message}`;
  }
  
  ErrorHandler.log(error, {
    context,
    data: { propertyPath }
  });
}

/**
 * Track code execution paths for debugging
 */
export function trackExecution(functionName: string, step: string, data?: unknown): void {
  logInfo(`[EXECUTION] ${functionName} - ${step}`, data);
}

/**
 * Log TypeScript specific errors (undefined access, type mismatches)
 */
export function logTypeError(error: unknown, context: string, operation: string): void {
  ErrorHandler.log(error, {
    context: `TypeScript:${context}`,
    data: { operation }
  });
} 