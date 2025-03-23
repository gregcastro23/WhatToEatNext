/**
 * Simple logger utility to standardize logging across the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Get environment
const isDev = process.env.NODE_ENV !== 'production';

class Logger {
  private logLevel: LogLevel = isDev ? 'debug' : 'info';
  private recentErrors: Array<{ message: string; timestamp: number }> = [];
  private readonly MAX_ERRORS = 10;

  /**
   * Set the minimum log level
   */
  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Log debug information (only in development)
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Log general information
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Log warnings
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  /**
   * Log errors
   */
  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args);
      
      // Store error for summary
      this.storeError(message);
    }
  }

  /**
   * Store error in recent errors list
   */
  private storeError(message: string): void {
    this.recentErrors.unshift({
      message,
      timestamp: Date.now()
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
        return `[${date}] ${err.message}`;
      })
      .join('\n');
  }

  /**
   * Check if we should log at this level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const targetLevelIndex = levels.indexOf(level);
    
    return targetLevelIndex >= currentLevelIndex;
  }
}

export const logger = new Logger(); 