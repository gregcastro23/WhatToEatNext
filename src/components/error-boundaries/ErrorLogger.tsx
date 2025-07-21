'use client';

import React, { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';

import { ErrorHandler } from '@/services/errorHandler';
import { createLogger } from '@/utils/logger';

const logger = createLogger('ErrorLogger');

export interface ErrorLogEntry {
  id: string;
  timestamp: Date;
  error: Error;
  context: string;
  componentName?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  retryCount: number;
}

export interface ErrorRecoveryMetrics {
  totalErrors: number;
  resolvedErrors: number;
  criticalErrors: number;
  averageRetryCount: number;
  mostProblematicComponent: string;
  errorRate: number; // errors per minute
}

interface ErrorLoggerContextType {
  errorLog: ErrorLogEntry[];
  logError: (error: Error, context: string, componentName?: string, severity?: ErrorLogEntry['severity']) => string;
  markErrorResolved: (errorId: string) => void;
  clearErrorLog: () => void;
  getMetrics: () => ErrorRecoveryMetrics;
  getRecentErrors: (minutes?: number) => ErrorLogEntry[];
}

const ErrorLoggerContext = createContext<ErrorLoggerContextType | null>(null);

interface ErrorLoggerProviderProps {
  children: ReactNode;
  maxLogSize?: number;
}

/**
 * Error Logger Provider
 * Provides centralized error logging and recovery tracking across the application
 */
export function ErrorLoggerProvider({ children, maxLogSize = 100 }: ErrorLoggerProviderProps) {
  const [errorLog, setErrorLog] = useState<ErrorLogEntry[]>([]);

  // Clean up old errors periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      setErrorLog(prevLog => 
        prevLog.filter(entry => entry.timestamp > oneHourAgo)
      );
    }, 5 * 60 * 1000); // Clean up every 5 minutes

    return () => clearInterval(cleanup);
  }, []);

  const logError = useCallback((
    error: Error, 
    context: string, 
    componentName?: string, 
    severity: ErrorLogEntry['severity'] = 'medium'
  ): string => {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const logEntry: ErrorLogEntry = {
      id: errorId,
      timestamp: new Date(),
      error,
      context,
      componentName,
      severity,
      resolved: false,
      retryCount: 0,
    };

    setErrorLog(prevLog => {
      const newLog = [logEntry, ...prevLog];
      // Keep log size manageable
      return newLog.slice(0, maxLogSize);
    });

    // Log to external error handler
    ErrorHandler.log(error, {
      context,
      data: {
        errorId,
        componentName,
        severity,
        timestamp: logEntry.timestamp.toISOString(),
      },
      isFatal: severity === 'critical',
    });

    logger.error('Error logged', {
      errorId,
      context,
      componentName,
      severity,
      message: error.message,
    });

    return errorId;
  }, [maxLogSize]);

  const markErrorResolved = useCallback((errorId: string) => {
    setErrorLog(prevLog =>
      prevLog.map(entry =>
        entry.id === errorId
          ? { ...entry, resolved: true }
          : entry
      )
    );

    logger.info('Error marked as resolved', { errorId });
  }, []);

  const clearErrorLog = useCallback(() => {
    setErrorLog([]);
    logger.info('Error log cleared');
  }, []);

  const getMetrics = useCallback((): ErrorRecoveryMetrics => {
    const totalErrors = errorLog.length;
    const resolvedErrors = errorLog.filter(entry => entry.resolved).length;
    const criticalErrors = errorLog.filter(entry => entry.severity === 'critical').length;
    
    const totalRetries = errorLog.reduce((sum, entry) => sum + entry.retryCount, 0);
    const averageRetryCount = totalErrors > 0 ? totalRetries / totalErrors : 0;

    // Find most problematic component
    const componentErrorCounts = errorLog.reduce((counts, entry) => {
      if (entry.componentName) {
        counts[entry.componentName] = (counts[entry.componentName] || 0) + 1;
      }
      return counts;
    }, {} as Record<string, number>);

    const mostProblematicComponent = Object.entries(componentErrorCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';

    // Calculate error rate (errors per minute in last 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentErrors = errorLog.filter(entry => entry.timestamp > tenMinutesAgo);
    const errorRate = recentErrors.length / 10; // errors per minute

    return {
      totalErrors,
      resolvedErrors,
      criticalErrors,
      averageRetryCount,
      mostProblematicComponent,
      errorRate,
    };
  }, [errorLog]);

  const getRecentErrors = useCallback((minutes: number = 30): ErrorLogEntry[] => {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    return errorLog.filter(entry => entry.timestamp > cutoffTime);
  }, [errorLog]);

  const contextValue: ErrorLoggerContextType = {
    errorLog,
    logError,
    markErrorResolved,
    clearErrorLog,
    getMetrics,
    getRecentErrors,
  };

  return (
    <ErrorLoggerContext.Provider value={contextValue}>
      {children}
    </ErrorLoggerContext.Provider>
  );
}

/**
 * Hook to access error logging functionality
 */
export function useErrorLogger(): ErrorLoggerContextType {
  const context = useContext(ErrorLoggerContext);
  if (!context) {
    throw new Error('useErrorLogger must be used within an ErrorLoggerProvider');
  }
  return context;
}

/**
 * Hook for component-specific error logging
 */
export function useComponentErrorLogger(componentName: string) {
  const { logError, markErrorResolved } = useErrorLogger();

  const logComponentError = useCallback((
    error: Error, 
    context?: string, 
    severity?: ErrorLogEntry['severity']
  ): string => {
    return logError(error, context || componentName, componentName, severity);
  }, [logError, componentName]);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    context?: string,
    fallbackValue?: any
  ): Promise<any> => {
    try {
      return await asyncFn();
    } catch (error) {
      logComponentError(
        error instanceof Error ? error : new Error(String(error)),
        context || 'async operation',
        'medium'
      );
      
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
      
      return undefined;
    }
  }, [logComponentError]);

  const handleSyncError = useCallback((
    syncFn: () => any,
    context?: string,
    fallbackValue?: any
  ): any => {
    try {
      return syncFn();
    } catch (error) {
      logComponentError(
        error instanceof Error ? error : new Error(String(error)),
        context || 'sync operation',
        'medium'
      );
      
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
      
      return undefined;
    }
  }, [logComponentError]);

  return {
    logError: logComponentError,
    markResolved: markErrorResolved,
    handleAsyncError,
    handleSyncError,
  };
}

export default ErrorLoggerProvider;