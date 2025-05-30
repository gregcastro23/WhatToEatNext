/**
 * Utility for consistent logging across the application
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Get environment
const isDev = process.env.NODE_ENV !== 'production';
const isBrowser = typeof window !== 'undefined';

/**
 * Logger class providing centralized logging capabilities
 */
class Logger {
  private enabled: boolean;
  private logLevel: LogLevel;
  private recentErrors: Array<{
    message: string;
    timestamp: number;
    component?: string;
  }> = [];
  private readonly MAX_ERRORS = 20;

  // Track components that have created loggers
  private componentLoggers: Set<string> = new Set();

  constructor() {
    this.enabled = process.env.NODE_ENV !== 'test';
    this.logLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'info';
  }

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
      debug: (message: string, ...args: unknown[]): void =>
        this.debug(message, ...args, { component }),
      log: (message: string, ...args: unknown[]): void =>
        this.info(message, ...args, { component }),
      info: (message: string, ...args: unknown[]): void =>
        this.info(message, ...args, { component }),
      warn: (message: string, ...args: unknown[]): void =>
        this.warn(message, ...args, { component }),
      error: (message: string, ...args: unknown[]): void =>
        this.error(message, ...args, { component }),
    };
  }

  /**
   * Log debug information (only in development)
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      const options = this.extractOptions(args);
      const component = options.component ? `[${options.component}]` : '';
      console.debug(`[DEBUG]${component} ${message}`, ...options.rest);
    }
  }

  /**
   * Log general information
   */
  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      const options = this.extractOptions(args);
      const component = options.component ? `[${options.component}]` : '';
      console.info(`[INFO]${component} ${message}`, ...options.rest);
    }
  }

  /**
   * Log warnings
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      const options = this.extractOptions(args);
      const component = options.component ? `[${options.component}]` : '';
      console.warn(`[WARN]${component} ${message}`, ...options.rest);
    }
  }

  /**
   * Log errors
   */
  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      const options = this.extractOptions(args);
      const component = options.component ? `[${options.component}]` : '';
      console.error(`[ERROR]${component} ${message}`, ...options.rest);

      // Store error for summary
      this.storeError(message, options.component);
    }
  }

  /**
   * Extract options from args, if last arg is an object with component property
   */
  private extractOptions(args: unknown[]) {
    const last = args[args.length - 1];
    if (
      last &&
      typeof last === 'object' &&
      !Array.isArray(last) &&
      'component' in last
    ) {
      return {
        component: last.component as string,
        rest: args.slice(0, args.length - 1),
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
      component,
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
      .map((err) => {
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
    if (!this.enabled) return false;
    
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    return levels[level] >= levels[this.logLevel];
  }
}

// Create singleton instance
const logger = new Logger();

// Export the logger as default and named export
export default logger;
export { logger };

// Helper functions for creating component-specific loggers
export const createLogger = (component: string) =>
  logger.createLogger(component);

// Utility functions for direct use (for backwards compatibility)
export const debugLog = (message: string, ...args: unknown[]): void =>
  logger.debug(message, ...args);
export const infoLog = (message: string, ...args: unknown[]): void =>
  logger.info(message, ...args);
export const warnLog = (message: string, ...args: unknown[]): void =>
  logger.warn(message, ...args);
export const errorLog = (message: string, ...args: unknown[]): void =>
  logger.error(message, ...args);

/**
 * Logs an error with proper formatting and context
 * @param error The error to log
 * @param context Optional context information
 */
export function logError(error: Error, context?: { [key: string]: string }): void {
  const errorMessage = error.message || 'Unknown error';
  const errorStack = error.stack || '';
  const contextString = context ? JSON.stringify(context, null, 2) : '';
  
  console.error(`[ERROR] ${errorMessage}`);
  
  if(errorStack) {
    console.error(`Stack trace: ${errorStack}`);
  }
  
  if(contextString) {
    console.error(`Context: ${contextString}`);
  }
}
