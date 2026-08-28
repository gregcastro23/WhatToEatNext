/**
 * Centralized Logging Service for WhatToEatNext
 *
 * Provides structured logging with different levels and contexts.
 * Replaces _logger.info statements in production code while preserving
 * _logger.warn and _logger.error for debugging purposes.
 *
 * NOTE: Removed circular dependency with @/lib/logger (was causing build hangs)
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

export type LogContext = Record<string, unknown> | unknown;

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  data?: unknown;
}

class LoggingService {
  private static instance: LoggingService | undefined;
  private logLevel: LogLevel = LogLevel.INFO;
  private readonly isDevelopment: boolean;
  private logBuffer: LogEntry[] = [];
  private readonly maxBufferSize = 1000;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";

    // Set log level based on environment
    if (this.isDevelopment) {
      this.logLevel = LogLevel.DEBUG;
    } else if (process.env.NODE_ENV === "test") {
      this.logLevel = LogLevel.WARN;
    } else {
      this.logLevel = LogLevel.INFO;
    }
  }

  public static getInstance(): LoggingService {
    LoggingService.instance ??= new LoggingService();
    return LoggingService.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public debug(message: string, context?: LogContext, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, context, undefined, data);
  }

  public info(message: string, context?: LogContext, data?: unknown): void {
    this.log(LogLevel.INFO, message, context, undefined, data);
  }

  public warn(message: string, context?: LogContext, data?: unknown): void {
    this.log(LogLevel.WARN, message, context, undefined, data);
  }

  public error(
    message: string,
    context?: LogContext,
    error?: Error,
    data?: unknown,
  ): void {
    this.log(LogLevel.ERROR, message, context, error, data);
  }

  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
    data?: unknown,
  ): void {
    if (level < this.logLevel) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      error,
      data,
    };

    // Add to buffer
    this.addToBuffer(logEntry);

    // Output to console based on level and environment
    this.outputToConsole(logEntry);
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);

    // Maintain buffer size
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const contextStr = entry.context ? this.formatContext(entry.context) : "";
    const levelStr = LogLevel[entry.level];
    const baseMessage = `[${timestamp}] ${levelStr}: ${entry.message}${contextStr}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.log(`🐛 ${baseMessage}`, entry.data ?? "");
        }
        break;

      case LogLevel.INFO:
        console.info(`ℹ️ ${baseMessage}`, entry.data ?? "");
        break;

      case LogLevel.WARN:
        console.warn(`⚠️ ${baseMessage}`, entry.data ?? "");
        break;

      case LogLevel.ERROR:
        console.error(`❌ ${baseMessage}`, entry.error ?? entry.data ?? "");
        break;
    }
  }

  private formatContext(context: unknown): string {
    if (!context || typeof context !== "object") return "";
    const ctx = context as Record<string, unknown>;
    const parts: string[] = [];

    if (typeof ctx.component === "string") parts.push(`component=${ctx.component}`);
    if (typeof ctx.service === "string") parts.push(`service=${ctx.service}`);
    if (typeof ctx.function === "string") parts.push(`function=${ctx.function}`);
    if (typeof ctx.userId === "string") parts.push(`user=${ctx.userId}`);
    if (typeof ctx.sessionId === "string") parts.push(`session=${ctx.sessionId}`);
    if (typeof ctx.requestId === "string") parts.push(`request=${ctx.requestId}`);

    // Add other context properties
    Object.keys(ctx).forEach((key) => {
      if (
        ![
          "component",
          "service",
          "function",
          "userId",
          "sessionId",
          "requestId",
        ].includes(key)
      ) {
        parts.push(`${key}=${String(ctx[key])}`);
      }
    });

    return parts.length > 0 ? ` [${parts.join(", ")}]` : "";
  }

  public getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  public clearLogBuffer(): void {
    this.logBuffer = [];
  }

  public exportLogs(): string {
    return this.logBuffer
      .map((entry) => {
        const timestamp = entry.timestamp.toISOString();
        const level = LogLevel[entry.level];
        const context = entry.context ? this.formatContext(entry.context) : "";
        const errorStr = entry.error ? ` ERROR: ${entry.error.message}` : "";
        const dataStr = entry.data
          ? ` DATA: ${JSON.stringify(entry.data)}`
          : "";

        return `[${timestamp}] ${level}: ${entry.message}${context}${errorStr}${dataStr}`;
      })
      .join("\n");
  }
}

// Create singleton instance
const logger = LoggingService.getInstance();

// Export convenience functions

export const log = {
  debug: (message: string, context?: LogContext, data?: unknown): void => {
    logger.debug(message, context, data);
  },

  info: (message: string, context?: LogContext, data?: unknown): void => {
    logger.info(message, context, data);
  },

  warn: (message: string, context?: LogContext, data?: unknown): void => {
    logger.warn(message, context, data);
  },

  error: (message: string, context?: LogContext, error?: Error, data?: unknown): void => {
    logger.error(message, context, error, data);
  },
};

// Export service for advanced usage
export { LoggingService };
export default logger;
