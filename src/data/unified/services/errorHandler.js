/**
 * Error Handler Service
 * Centralized error handling and logging
 */
// Simple logger functionality
const logError = (message, data) => {
    // console.error(`[ERROR] ${message}`, data);
};
const logWarning = (message, data) => {
    // console.warn(`[WARNING] ${message}`, data);
};
const logInfo = (message, data) => {
    // console.info(`[INFO] ${message}`, data);
};
// Error types
export const ErrorType = {
    UI: "UI",
    API: "API",
    DATA: "DATA",
    NETWORK: "NETWORK",
    ASTROLOGY: "ASTROLOGY",
    UNKNOWN: "UNKNOWN"
};
// Error severity levels
export const ErrorSeverity = {
    INFO: "INFO",
    WARNING: "WARNING",
    ERROR: "ERROR",
    CRITICAL: "CRITICAL",
    FATAL: "FATAL"
};
class ErrorHandlerService {
    /**
     * Handle an error with additional context (alias for log method)
     */
    handleError(error, options = {}) {
        return this.log(error, _options);
    }
    /**
     * Log an error with additional context
     */
    log(error, options = {}) {
        const { type = ErrorType.UNKNOWN, severity = ErrorSeverity.ERROR, component = 'unknown', context = {}, data = {}, isFatal = false, silent = false } = options;
        const errorDetails = this.prepareErrorDetails(error, _options);
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
    createError(message, options = {}) {
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
    async safeAsync(fn, defaultValue, context = 'unknown') {
        try {
            return await fn();
        }
        catch (error) {
            this.log(error, { context });
            return defaultValue;
        }
    }
    /**
     * Safely execute a function and return a default value if it fails
     */
    safeExecute(fn, defaultValue, context = 'unknown') {
        try {
            return fn();
        }
        catch (error) {
            this.log(error, { context });
            return defaultValue;
        }
    }
    /**
     * Prepare standardized error details object
     */
    prepareErrorDetails(error, _options) {
        let message = 'Unknown error';
        let stack;
        let errorType = 'unknown';
        if (error instanceof Error) {
            message = error.message;
            stack = error.stack;
            errorType = error.name;
        }
        else if (typeof error === 'string') {
            message = error;
            errorType = 'string';
        }
        else if (error !== null && typeof error === 'object') {
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
            componentStack: error?.componentStack,
        };
    }
    /**
     * Log a warning about a potentially undefined or null value
     */
    warnNullValue(variableName, context, value) {
        logWarning(`Potential null / undefined value: ${variableName} in ${context}`, { value, timestamp: new Date().toISOString() });
    }
    /**
     * Handle property access errors with detailed reporting
     * Use this when accessing potentially undefined nested properties
     */
    handlePropertyAccessError(error, propertyPath, context) {
        let message = "Property access error";
        if (error instanceof TypeError && (error.message.includes("Cannot read properties of undefined") ||
            error.message.includes("Cannot read properties of null") ||
            error.message.includes("is not a function") ||
            error.message.includes("is not iterable"))) {
            message = `TypeError accessing ${propertyPath} in ${context}: ${error.message}`;
        }
        else if (error instanceof Error) {
            message = `Error accessing ${propertyPath} in ${context}: ${error.message}`;
        }
        this.log(error, {
            context,
            data: { propertyPath }
        });
    }
}
// Create singleton instance
export const ErrorHandler = new ErrorHandlerService();
export const errorHandler = ErrorHandler;
// Export the singleton instance as default and for named imports
export default ErrorHandler;
/**
 * Global function to safely check if a value exists and has the right type
 * Use this to validate critical values before using them
 */
function safeValue(value, fallback, context, variableName) {
    if (value === null || value === undefined) {
        ErrorHandler.warnNullValue(variableName, context);
        return fallback;
    }
    return value;
}
export { safeValue };
/**
 * Safely access a property from an object with proper error handling
 * @param obj The object to access
 * @param properties Array of nested property names to access
 * @param defaultValue Default value if property doesn't exist
 * @param context Context for error logging
 */
function safePropertyAccess(obj, properties, defaultValue, context) {
    if (obj === null || obj === undefined) {
        ErrorHandler.warnNullValue(properties.join('.'), context);
        return defaultValue;
    }
    try {
        let current = obj;
        for (const prop of properties) {
            if (current === null || current === undefined) {
                ErrorHandler.warnNullValue(`${properties.join('.')}.${prop}`, context);
                return defaultValue;
            }
            current = current[prop];
        }
        if (current === undefined || current === null) {
            return defaultValue;
        }
        return current;
    }
    catch (error) {
        ErrorHandler.handlePropertyAccessError(error, properties.join('.'), context);
        return defaultValue;
    }
}
export { safePropertyAccess };
/**
 * Safely execute a function with error handling
 * @param fn Function to execute
 * @param defaultValue Default value to return if function throws
 * @param context Context for error logging
 */
function safeExecuteWithContext(fn, defaultValue, context) {
    try {
        return fn();
    }
    catch (error) {
        ErrorHandler.log(error, { context });
        return defaultValue;
    }
}
export { safeExecuteWithContext };
/**
 * Track code execution paths for debugging
 */
export function trackExecution(functionName, step, data) {
    logInfo(`[EXECUTION] ${functionName} - ${step}`, data);
}
/**
 * Log TypeScript specific errors (undefined access, type mismatches)
 */
export function logTypeError(error, context, operation) {
    ErrorHandler.log(error, {
        context: `TypeScript:${context}`,
        data: { operation }
    });
}
