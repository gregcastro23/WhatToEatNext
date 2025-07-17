'use client';

import React, { ReactNode, useState } from 'react';
import { GlobalErrorBoundary } from './GlobalErrorBoundary';
import { ErrorLoggerProvider } from './ErrorLogger';
import { ErrorRecoverySystem } from './ErrorRecoverySystem';
import { ErrorMonitoringDashboard } from './ErrorMonitoringDashboard';
import { createLogger } from '@/utils/logger';

const logger = createLogger('SafetyInfrastructure');

interface SafetyInfrastructureProviderProps {
  children: ReactNode;
  enableMonitoring?: boolean;
  enableAutoRecovery?: boolean;
  maxLogSize?: number;
  showMonitoringDashboard?: boolean;
  onCriticalError?: (error: Error) => void;
}

/**
 * Safety Infrastructure Provider
 * Provides comprehensive error handling, logging, and recovery for the entire application
 */
export function SafetyInfrastructureProvider({
  children,
  enableMonitoring = true,
  enableAutoRecovery = true,
  maxLogSize = 100,
  showMonitoringDashboard = process.env.NODE_ENV === 'development',
  onCriticalError,
}: SafetyInfrastructureProviderProps) {
  const [isDashboardVisible, setIsDashboardVisible] = useState(false);

  const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
    logger.error('Global error occurred', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Call custom critical error handler if provided
    if (onCriticalError) {
      onCriticalError(error);
    }

    // In production, you might want to report to external services
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
      logger.info('Error would be reported to monitoring service in production');
    }
  };

  const handleGlobalRecovery = () => {
    logger.info('Global error recovery successful');
  };

  return (
    <GlobalErrorBoundary
      onError={handleGlobalError}
      onRecovery={handleGlobalRecovery}
    >
      <ErrorLoggerProvider maxLogSize={maxLogSize}>
        <ErrorRecoverySystem
          autoRecovery={enableAutoRecovery}
          maxAutoRecoveryAttempts={3}
        >
          {children}
          
          {/* Error Monitoring Dashboard */}
          {enableMonitoring && showMonitoringDashboard && (
            <ErrorMonitoringDashboard
              isVisible={isDashboardVisible}
              onToggleVisibility={() => setIsDashboardVisible(!isDashboardVisible)}
              compact={!isDashboardVisible}
            />
          )}
        </ErrorRecoverySystem>
      </ErrorLoggerProvider>
    </GlobalErrorBoundary>
  );
}

export default SafetyInfrastructureProvider;