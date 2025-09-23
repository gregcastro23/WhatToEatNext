/**
 * Centralized Logging Service for WhatToEatNext
 *
 * Provides structured logging with different levels and contexts.
 * Replaces _logger.info statements in production code while preserving
 * _logger.warn and _logger.error for debugging purposes.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4
}

export interface LogContext {
  component?: string,
  service?: string,
  function?: string,
  userId?: string,
  sessionId?: string,
  requestId?: string,

  // Intentionally any: Logging context needs flexibility for various metadata
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
  [key: string]: any,
}

export interface LogEntry {
  timestamp: Date,
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error,
   
  // Intentionally, any: Log data can be of any type for debugging purposes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
  data?: any
}

class LoggingService {
  private static instance: LoggingService,
  private logLevel: LogLevel = LogLevel.INFO,
  private isDevelopment: boolean,
  private logBuffer: LogEntry[] = [],
  private maxBufferSize = 1000,

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development',

    // Set log level based on environment
    if (this.isDevelopment) {
      this.logLevel = LogLevel.DEBUG
    } else if (process.env.NODE_ENV === 'test') {,
      this.logLevel = LogLevel.WARN,
    } else {
      this.logLevel = LogLevel.INFO,
    }
  }

  public static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService()
    }
    return LoggingService.instance,
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public debug(message: string, context?: LogContext, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, undefined, data)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public info(message: string, context?: LogContext, data?: any): void {
    this.log(LogLevel.INFO, message, context, undefined, data)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public warn(message: string, context?: LogContext, data?: any): void {
    this.log(LogLevel.WARN, message, context, undefined, data)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public error(message: string, context?: LogContext, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, message, context, error, data)
  }

   
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
    data?: unknown,
  ): void {
    if (level < this.logLevel) {
      return
    }

    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      error,
      data
    }

    // Add to buffer
    this.addToBuffer(logEntry)

    // Output to console based on level and environment
    this.outputToConsole(logEntry)
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry)

    // Maintain buffer size
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift()
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString()
    const contextStr = entry.context ? this.formatContext(entry.context) : '';
    const levelStr = LogLevel[entry.level]

    const baseMessage = `[${timestamp}] ${levelStr}: ${entry.message}${contextStr}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          log.info(`🐛 ${baseMessage}`, entry.data || '')
        }
        break,

      case LogLevel.INFO:
        log.info(`ℹ️ ${baseMessage}`, entry.data || '')
        break,

      case LogLevel.WARN:
        _logger.warn(`⚠️ ${baseMessage}`, entry.data || '')
        break,

      case LogLevel.ERROR:
        _logger.error(`❌ ${baseMessage}`, entry.error || entry.data || '')
        break,
    }
  }

  private formatContext(context: LogContext): string {
    const parts: string[] = [];

    if (context.component) parts.push(`component=${context.component}`)
    if (context.service) parts.push(`service=${context.service}`)
    if (context.function) parts.push(`function=${context.function}`)
    if (context.userId) parts.push(`user=${context.userId}`)
    if (context.sessionId) parts.push(`session=${context.sessionId}`)
    if (context.requestId) parts.push(`request=${context.requestId}`)

    // Add other context properties
    Object.keys(context).forEach(key => {
      if (!['component', 'service', 'function', 'userId', 'sessionId', 'requestId'].includes(key)) {
        parts.push(`${key}=${context[key]}`)
      }
    })

    return parts.length > 0 ? ` [${parts.join(', ')}]` : ''
  }

  public getLogBuffer(): LogEntry[] {
    return [...this.logBuffer]
  }

  public clearLogBuffer(): void {
    this.logBuffer = []
  }

  public exportLogs(): string {
    return this.logBuffer
      .map(entry => {
        const timestamp = entry.timestamp.toISOString()
        const level = LogLevel[entry.level];
        const context = entry.context ? this.formatContext(entry.context) : ''
        const errorStr = entry.error ? ` ERROR: ${entry.error.message}` : ''
        const dataStr = entry.data ? ` DATA: ${JSON.stringify(entry.data)}` : ''

        return `[${timestamp}] ${level}: ${entry.message}${context}${errorStr}${dataStr}`,
      })
      .join('\n')
  }
}

// Create singleton instance
const logger = LoggingService.getInstance()

// Export convenience functions
 
export const log = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug: (message: string, context?: LogContext, data?: any) =>,
    logger.debug(message, context, data),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: (message: string, context?: LogContext, data?: any) => logger.info(message, context, data),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn: (message: string, context?: LogContext, data?: any) => logger.warn(message, context, data),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (message: string, context?: LogContext, error?: Error, data?: any) =>,
    logger.error(message, context, error, data)
}

// Export service for advanced usage
export { LoggingService };
export default logger,
