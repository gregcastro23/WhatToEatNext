"use strict";
/**
 * Advanced logger utility to standardize logging across the application.
 * This module provides component-specific logging capabilities and consistent formatting.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLog = exports.warnLog = exports.infoLog = exports.debugLog = exports.createLogger = exports.logger = void 0;
// Get environment
const isDev = process.env.NODE_ENV !== 'production';
const isBrowser = typeof window !== 'undefined';
/**
 * Logger class providing centralized logging capabilities
 */
class Logger {
    constructor() {
        this.logLevel = isDev ? 'debug' : 'info';
        this.recentErrors = [];
        this.MAX_ERRORS = 20;
        // Track components that have created loggers
        this.componentLoggers = new Set();
    }
    /**
     * Set the minimum log level
     */
    setLevel(level) {
        this.logLevel = level;
    }
    /**
     * Create a component-specific logger
     * @param component The name of the component or module
     * @returns An object with logging methods specific to the component
     */
    createLogger(component) {
        this.componentLoggers.add(component);
        return {
            debug: (message, ...args) => this.debug(message, ...args, { component }),
            log: (message, ...args) => this.info(message, ...args, { component }),
            info: (message, ...args) => this.info(message, ...args, { component }),
            warn: (message, ...args) => this.warn(message, ...args, { component }),
            error: (message, ...args) => this.error(message, ...args, { component }),
        };
    }
    /**
     * Log debug information (only in development)
     */
    debug(message, ...args) {
        if (this.shouldLog('debug')) {
            const options = this.extractOptions(args);
            const component = options.component ? `[${options.component}]` : '';
            console.debug(`[DEBUG]${component} ${message}`, ...options.rest);
        }
    }
    /**
     * Log general information
     */
    info(message, ...args) {
        if (this.shouldLog('info')) {
            const options = this.extractOptions(args);
            const component = options.component ? `[${options.component}]` : '';
            console.info(`[INFO]${component} ${message}`, ...options.rest);
        }
    }
    /**
     * Log warnings
     */
    warn(message, ...args) {
        if (this.shouldLog('warn')) {
            const options = this.extractOptions(args);
            const component = options.component ? `[${options.component}]` : '';
            console.warn(`[WARN]${component} ${message}`, ...options.rest);
        }
    }
    /**
     * Log errors
     */
    error(message, ...args) {
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
    extractOptions(args) {
        const last = args[args.length - 1];
        if (last && typeof last === 'object' && !Array.isArray(last) && 'component' in last) {
            return {
                component: last.component,
                rest: args.slice(0, args.length - 1)
            };
        }
        return { rest: args };
    }
    /**
     * Store error in recent errors list
     */
    storeError(message, component) {
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
    getErrorSummary() {
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
    getComponents() {
        return [...this.componentLoggers];
    }
    /**
     * Check if we should log at this level
     */
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const targetLevelIndex = levels.indexOf(level);
        return targetLevelIndex >= currentLevelIndex;
    }
}
// Singleton instance of the logger
exports.logger = new Logger();
// Helper functions for creating component-specific loggers
const createLogger = (component) => exports.logger.createLogger(component);
exports.createLogger = createLogger;
// Utility functions for direct use (for backwards compatibility)
const debugLog = (message, ...args) => exports.logger.debug(message, ...args);
exports.debugLog = debugLog;
const infoLog = (message, ...args) => exports.logger.info(message, ...args);
exports.infoLog = infoLog;
const warnLog = (message, ...args) => exports.logger.warn(message, ...args);
exports.warnLog = warnLog;
const errorLog = (message, ...args) => exports.logger.error(message, ...args);
exports.errorLog = errorLog;
