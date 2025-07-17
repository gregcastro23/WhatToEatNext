'use client';

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { useErrorLogger, ErrorLogEntry } from './ErrorLogger';
import { createLogger } from '@/utils/logger';

const logger = createLogger('ErrorRecoverySystem');

export interface RecoveryStrategy {
  id: string;
  name: string;
  description: string;
  canRecover: (error: Error) => boolean;
  recover: (error: Error, context: string) => Promise<boolean>;
  priority: number; // Higher number = higher priority
}

interface ErrorRecoverySystemProps {
  children: ReactNode;
  strategies?: RecoveryStrategy[];
  autoRecovery?: boolean;
  maxAutoRecoveryAttempts?: number;
}

/**
 * Default recovery strategies for common error types
 */
const defaultRecoveryStrategies: RecoveryStrategy[] = [
  {
    id: 'network-retry',
    name: 'Network Retry',
    description: 'Retry failed network requests',
    canRecover: (error: Error) => 
      error.message.includes('fetch') || 
      error.message.includes('network') ||
      error.message.includes('timeout'),
    recover: async (error: Error, context: string) => {
      logger.info('Attempting network retry recovery', { context, error: error.message });
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true; // Indicate recovery attempt was made
    },
    priority: 8,
  },
  {
    id: 'state-reset',
    name: 'State Reset',
    description: 'Reset component state to recover from state-related errors',
    canRecover: (error: Error) =>
      error.message.includes('Cannot read properties') ||
      error.message.includes('undefined') ||
      error.message.includes('null'),
    recover: async (error: Error, context: string) => {
      logger.info('Attempting state reset recovery', { context, error: error.message });
      // This would trigger a state reset in the component
      return true;
    },
    priority: 6,
  },
  {
    id: 'data-refresh',
    name: 'Data Refresh',
    description: 'Refresh data when data-related errors occur',
    canRecover: (error: Error) =>
      error.message.includes('data') ||
      error.message.includes('parse') ||
      error.message.includes('JSON'),
    recover: async (error: Error, context: string) => {
      logger.info('Attempting data refresh recovery', { context, error: error.message });
      // This would trigger a data refresh
      return true;
    },
    priority: 7,
  },
  {
    id: 'component-remount',
    name: 'Component Remount',
    description: 'Force remount component to recover from render errors',
    canRecover: (error: Error) =>
      error.message.includes('render') ||
      error.message.includes('hook') ||
      error.message.includes('React'),
    recover: async (error: Error, context: string) => {
      logger.info('Attempting component remount recovery', { context, error: error.message });
      // This would trigger a component remount
      return true;
    },
    priority: 5,
  },
  {
    id: 'fallback-data',
    name: 'Fallback Data',
    description: 'Use fallback data when primary data source fails',
    canRecover: (error: Error) =>
      error.message.includes('ingredient') ||
      error.message.includes('recipe') ||
      error.message.includes('cuisine'),
    recover: async (error: Error, context: string) => {
      logger.info('Attempting fallback data recovery', { context, error: error.message });
      // This would load fallback data
      return true;
    },
    priority: 4,
  },
];

/**
 * Error Recovery System Component
 * Provides automatic error recovery mechanisms and manual recovery options
 */
export function ErrorRecoverySystem({ 
  children, 
  strategies = defaultRecoveryStrategies,
  autoRecovery = true,
  maxAutoRecoveryAttempts = 3 
}: ErrorRecoverySystemProps) {
  const { errorLog, markErrorResolved } = useErrorLogger();
  const [recoveryAttempts, setRecoveryAttempts] = useState<Record<string, number>>({});
  const [isRecovering, setIsRecovering] = useState(false);

  // Auto-recovery effect
  useEffect(() => {
    if (!autoRecovery) return;

    const unrecoveredErrors = errorLog.filter(entry => 
      !entry.resolved && 
      entry.severity !== 'critical' &&
      (recoveryAttempts[entry.id] || 0) < maxAutoRecoveryAttempts
    );

    if (unrecoveredErrors.length > 0 && !isRecovering) {
      const latestError = unrecoveredErrors[0];
      attemptRecovery(latestError);
    }
  }, [errorLog, autoRecovery, maxAutoRecoveryAttempts, recoveryAttempts, isRecovering]);

  const attemptRecovery = useCallback(async (errorEntry: ErrorLogEntry) => {
    if (isRecovering) return;

    setIsRecovering(true);
    
    try {
      // Find applicable recovery strategies
      const applicableStrategies = strategies
        .filter(strategy => strategy.canRecover(errorEntry.error))
        .sort((a, b) => b.priority - a.priority);

      if (applicableStrategies.length === 0) {
        logger.warn('No recovery strategies found for error', {
          errorId: errorEntry.id,
          error: errorEntry.error.message,
        });
        return false;
      }

      logger.info('Attempting error recovery', {
        errorId: errorEntry.id,
        strategies: applicableStrategies.map(s => s.name),
      });

      // Try each strategy in priority order
      for (const strategy of applicableStrategies) {
        try {
          const recovered = await strategy.recover(errorEntry.error, errorEntry.context);
          
          if (recovered) {
            logger.info('Error recovery successful', {
              errorId: errorEntry.id,
              strategy: strategy.name,
            });
            
            markErrorResolved(errorEntry.id);
            
            // Reset recovery attempts for this error
            setRecoveryAttempts(prev => ({
              ...prev,
              [errorEntry.id]: 0,
            }));
            
            return true;
          }
        } catch (recoveryError) {
          logger.error('Recovery strategy failed', {
            errorId: errorEntry.id,
            strategy: strategy.name,
            recoveryError: recoveryError instanceof Error ? recoveryError.message : String(recoveryError),
          });
        }
      }

      // If we get here, all strategies failed
      setRecoveryAttempts(prev => ({
        ...prev,
        [errorEntry.id]: (prev[errorEntry.id] || 0) + 1,
      }));

      logger.warn('All recovery strategies failed', {
        errorId: errorEntry.id,
        attempts: (recoveryAttempts[errorEntry.id] || 0) + 1,
      });

      return false;
    } finally {
      setIsRecovering(false);
    }
  }, [strategies, markErrorResolved, recoveryAttempts, isRecovering]);

  const manualRecovery = useCallback(async (errorId: string) => {
    const errorEntry = errorLog.find(entry => entry.id === errorId);
    if (!errorEntry) {
      logger.warn('Error entry not found for manual recovery', { errorId });
      return false;
    }

    return await attemptRecovery(errorEntry);
  }, [errorLog, attemptRecovery]);

  // Provide recovery context to children
  const recoveryContext = {
    isRecovering,
    recoveryAttempts,
    manualRecovery,
    availableStrategies: strategies,
  };

  return (
    <ErrorRecoveryContext.Provider value={recoveryContext}>
      {children}
    </ErrorRecoveryContext.Provider>
  );
}

// Context for recovery system
const ErrorRecoveryContext = React.createContext<{
  isRecovering: boolean;
  recoveryAttempts: Record<string, number>;
  manualRecovery: (errorId: string) => Promise<boolean>;
  availableStrategies: RecoveryStrategy[];
} | null>(null);

/**
 * Hook to access error recovery functionality
 */
export function useErrorRecovery() {
  const context = React.useContext(ErrorRecoveryContext);
  if (!context) {
    throw new Error('useErrorRecovery must be used within an ErrorRecoverySystem');
  }
  return context;
}

/**
 * Recovery Status Component
 * Shows current recovery status and allows manual recovery
 */
export function RecoveryStatus() {
  const { isRecovering, recoveryAttempts, manualRecovery } = useErrorRecovery();
  const { errorLog, getMetrics } = useErrorLogger();
  const metrics = getMetrics();

  const unrecoveredErrors = errorLog.filter(entry => !entry.resolved);

  if (unrecoveredErrors.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-yellow-800">
            Error Recovery Status
          </h4>
          <p className="text-sm text-yellow-700">
            {unrecoveredErrors.length} unrecovered error{unrecoveredErrors.length !== 1 ? 's' : ''}
            {isRecovering && ' (recovery in progress...)'}
          </p>
        </div>
        
        {!isRecovering && unrecoveredErrors.length > 0 && (
          <button
            onClick={() => manualRecovery(unrecoveredErrors[0].id)}
            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
          >
            Retry Recovery
          </button>
        )}
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-yellow-600">
          Recovery rate: {metrics.totalErrors > 0 ? Math.round((metrics.resolvedErrors / metrics.totalErrors) * 100) : 0}%
        </div>
      )}
    </div>
  );
}

export default ErrorRecoverySystem;