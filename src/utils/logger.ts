/**
 * Advanced logger utility to standardize logging across the application.
 * This module provides component-specific logging capabilities and consistent formatting.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
// Get environment
const isDev = process.env.NODE_ENV !== 'production';
const _isBrowser = typeof window !== 'undefined';

/**
 * Logger class providing centralized logging capabilities
 */
class Logger {
  private logLevel: LogLevel = isDev ? 'debug' : 'info';
  private recentErrors: Array<{ message: string; timestamp: number; component?: string }> = [];
  private readonly MAX_ERRORS = 20;

  // Track components that have created loggers
  private componentLoggers: Set<string> = new Set();

  /**
   * Set the minimum log level
   */
  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Create a component-specific logger
   * @param component The name of the component or module
   * @returns An object with logging methods specific to the component
   */
  createLogger(component: string) {
    this.componentLoggers.add(component);
    return {
      debug: (message: string, ...args: unknown[]): void => {
        try {
          this.debug(message, { component, args });
        } catch (e) {
          // Silent failure - logging errors should not break application
          _logger.warn(`[LOGGER-ERROR] Failed to log debug message for ${component}:`, e);
        }
      },
      log: (message: string, ...args: unknown[]): void => {
        try {
          this.info(message, { component, args });
        } catch (e) {
          _logger.warn(`[LOGGER-ERROR] Failed to log message for ${component}:`, e);
        }
      },
      info: (message: string, ...args: unknown[]): void => {
        try {
          this.info(message, { component, args });
        } catch (e) {
          _logger.warn(`[LOGGER-ERROR] Failed to log info message for ${component}:`, e);
        }
      },
      warn: (message: string, ...args: unknown[]): void => {
        try {
          this.warn(message, { component, args });
        } catch (e) {
          _logger.warn(`[LOGGER-ERROR] Failed to log warning for ${component}:`, e);
        }
      },
      error: (message: string, ...args: unknown[]): void => {
        try {
          this.error(message, { component, args });
        } catch (e) {
          _logger.error(`[LOGGER-ERROR] Failed to log error for ${component}:`, e);
        }
      }
    }
  }

  /**
   * Log debug information (only in development)
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      const options = this.extractOptions(args);
      const component = options.component ? `[${options.component}]` : '';
      log.debug(`[DEBUG]${component} ${message}`, ...options.rest);
    }
  }

  /**
   * Log general information
   */
  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      const options = this.extractOptions(args);
      const component = options.component ? `[${options.component}]` : '';
      log.info(`[INFO]${component} ${message}`, ...options.rest);
    }
  }

  /**
   * Log warnings
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      const options = this.extractOptions(args);
      const component = options.component ? `[${options.component}]` : '';
      _logger.warn(`[WARN]${component} ${message}`, ...options.rest);
    }
  }

  /**
   * Log errors
   */
  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      const options = this.extractOptions(args);
      const component = options.component ? `[${options.component}]` : '';
      _logger.error(`[ERROR]${component} ${message}`, ...options.rest);

      // Store error for summary
      this.storeError(message, options.component);
    }
  }

  /**
   * Extract options from argsif last arg is an object with component property
   */
  private extractOptions(args: unknown[]) {
    const last = args[args.length - 1];
    if (last && typeof last === 'object' && !Array.isArray(last) && 'component' in last) {
      return {
        component: last.component as string,
        rest: args.slice(0, args.length - 1)
      };
    }
    return { rest: args };
  }

  /**
   * Store error in recent errors list
   */
  private storeError(message: string, component?: string): void {
    this.recentErrors.unshift({
      message,
      timestamp: Date.now(),
      component
    });

    // Keep list at max length
    if (this.recentErrors.length > this.MAX_ERRORS) {
      this.recentErrors.pop();
    }
  }

  /**
   * Get a summary of recent errors
   */
  getErrorSummary(): string {
    if (this.recentErrors.length === 0) {
      return 'No recent errors';
    }
    return this.recentErrors
      .map(err => {
        const date = new Date(err.timestamp).toLocaleTimeString();
        const component = err.component ? `[${err.component}]` : '';
        return `[${date}]${component} ${err.message}`;
      })
      .join('\n');
  }

  /**
   * Get a list of all registered components
   */
  getComponents(): string[] {
    return [...this.componentLoggers];
  }

  /**
   * Check if we should log at this level
   */
  private shouldLog(level: LogLevel): boolean {
    // Ensure the method exists and is accessible
    if (!this.logLevel) {
      return true; // Default to allowing all logs if level is undefined
    }

    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const targetLevelIndex = levels.indexOf(level);

    return targetLevelIndex >= currentLevelIndex;
  }
}

// Singleton instance of the logger with safe initialization
let loggerInstance: Logger | undefined;

export const logger = (() => {
  if (!loggerInstance) {
    loggerInstance = new Logger();
  }
  return loggerInstance;
})();

// Helper functions for creating component-specific loggers
export const createLogger = (component: string) => logger.createLogger(component);
// Utility functions for direct use (for backwards compatibility)
export const _debugLog = (message: string, ...args: unknown[]): void =>
  logger.debug(message, ...args);
export const _infoLog = (message: string, ...args: unknown[]): void => logger.info(message, ...args);
export const _warnLog = (message: string, ...args: unknown[]): void => logger.warn(message, ...args);
export const _errorLog = (message: string, ...args: unknown[]): void =>
  logger.error(message, ...args);
